import { CONFIG } from "./config.js";

/**
 * site.js — Main site behavior (entry module for every page)
 *
 * - Navigation injection (CONFIG.navLinks + basePath)
 * - Modal rendering + accessibility (focus trap, ESC, return focus)
 * - Form submission (clipboard | mailto | postJson)
 * - Toast notifications + footer year
 *
 * Load with: <script type="module" src="…/js/site.js"></script>
 */

const TOAST_TIMEOUT_MS = 3000;
// Modal stacking lives in css/styles.css (--z-modal). Avoid style="" attributes:
// CSP style-src 'self' blocks inline style attributes.

// --- Utilities ---------------------------------------------------------------

/** Decode signup recipient: plain `to`, else base64 `toEncoded` (light scraping friction). */
function signupRecipient() {
  const f = CONFIG.signupForm || {};
  if (f.to) return String(f.to);
  if (f.toEncoded) {
    try {
      return atob(String(f.toEncoded));
    } catch {
      return "";
    }
  }
  return "";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function joinBase(href) {
  const base = String(CONFIG.basePath || "").replace(/\/+$/, "");
  const rel = String(href || "");
  if (!base) return rel || "/";
  return base + (rel.startsWith("/") ? rel : `/${rel}`);
}

/** Normalize a path for active-link comparison (drop trailing slash, ignore query/hash). */
function normalizePath(p) {
  try {
    const path = new URL(p, "http://local.invalid").pathname;
    const trimmed = path.replace(/\/+$/, "");
    return trimmed === "" ? "/" : trimmed;
  } catch {
    let x = String(p || "/").split(/[?#]/)[0].replace(/\/+$/, "");
    return x === "" ? "/" : x;
  }
}

function currentPath() {
  const base = CONFIG.basePath || "";
  const raw = location.pathname;
  const stripped = base && raw.startsWith(base) ? raw.slice(base.length) || "/" : raw;
  return normalizePath(stripped);
}

// --- Toast -------------------------------------------------------------------

function showToast(msg, timeout = TOAST_TIMEOUT_MS) {
  let t = document.getElementById("siteToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "siteToast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    t.className = "site-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("visible");
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove("visible"), timeout);
}

// --- Modal + form ------------------------------------------------------------

function fieldHtml(f) {
  const required = f.required ? "required" : "";
  const requiredLabel = f.required
    ? '<span aria-hidden="true"> *</span><span class="visually-hidden"> (required)</span>'
    : "";
  const helpId = f.help ? `${f.key}-help` : "";
  const errorId = `${f.key}-error`;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ");
  const describedByAttr = describedBy ? ` aria-describedby="${describedBy}"` : "";

  const label = `<label for="${escapeHtml(f.key)}">${escapeHtml(f.label)}${requiredLabel}</label>`;
  let input = "";
  if (f.type === "textarea") {
    input = `<textarea id="${escapeHtml(f.key)}" name="${escapeHtml(f.key)}" placeholder="${escapeHtml(f.placeholder || "")}" ${required}${describedByAttr}></textarea>`;
  } else if (f.type === "select") {
    const opts = (f.options || [])
      .map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`)
      .join("");
    input = `<select id="${escapeHtml(f.key)}" name="${escapeHtml(f.key)}" ${required}${describedByAttr}><option value="">${escapeHtml(f.placeholder || "Select...")}</option>${opts}</select>`;
  } else {
    input = `<input id="${escapeHtml(f.key)}" name="${escapeHtml(f.key)}" type="${escapeHtml(f.type || "text")}" placeholder="${escapeHtml(f.placeholder || "")}" ${required}${describedByAttr} />`;
  }
  const help = f.help
    ? `<p class="field-help mini" id="${helpId}">${escapeHtml(f.help)}</p>`
    : "";
  const err = `<p class="field-error" id="${errorId}" hidden></p>`;
  const classes = f.type === "textarea" ? "field span2" : "field";
  return `<div class="${classes}">${label}${input}${help}${err}</div>`;
}

let lastTrigger = null;

function buildModalHtml() {
  const f = CONFIG.signupForm || {};
  return `
    <div id="modalBackdrop" class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-header">
          <div>
            <h2 id="modalTitle">${escapeHtml(f.title || "Join Early Access")}</h2>
            <p class="mini">${escapeHtml(f.blurb || "")}</p>
          </div>
          <button class="btn secondary icon-btn" type="button" data-action="closeModal" aria-label="Close dialog">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <form id="signupForm" novalidate>
          <div id="formStatus" class="form-error" role="alert" aria-live="assertive" hidden></div>
          <div class="form-grid">
            ${(f.fields || []).map(fieldHtml).join("")}
          </div>
          <div class="ctaRow mt-14">
            <button class="btn" type="submit">Submit</button>
            <button class="btn secondary" type="button" data-action="closeModal">Cancel</button>
          </div>
          <div class="hr"></div>
          <p class="mini">Submit mode: <b>${escapeHtml(f.submitMode || "clipboard")}</b>.</p>
        </form>
      </div>
    </div>
  `;
}

function openSignup(e) {
  if (document.getElementById("modalBackdrop")) return;
  lastTrigger = (e && e.currentTarget) || document.activeElement;
  document.body.insertAdjacentHTML("beforeend", buildModalHtml());
  document.body.classList.add("modal-open");

  const backdrop = document.getElementById("modalBackdrop");
  const modal = backdrop.querySelector(".modal");

  const firstInput = modal.querySelector("input, textarea, select, button[type='submit']");
  if (firstInput) firstInput.focus();

  backdrop.addEventListener("click", (ev) => {
    if (ev.target === backdrop) closeModal();
  });

  trapFocus(modal);
  document.addEventListener("keydown", modalKeyHandler);

  const form = document.getElementById("signupForm");
  if (form) {
    form.addEventListener("submit", onSubmit);
    form.addEventListener("input", clearFieldErrorOnInput);
  }

  wireActions();
}

function closeModal() {
  const m = document.getElementById("modalBackdrop");
  if (!m) return;
  m.remove();
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", modalKeyHandler);
  if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  lastTrigger = null;
}

function modalKeyHandler(e) {
  if (e.key === "Escape") closeModal();
}

function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function clearFieldErrorOnInput(e) {
  const el = e.target;
  if (!el || !el.name) return;
  setFieldError(el.name, "");
}

function setFieldError(key, message) {
  const input = document.getElementById(key);
  const err = document.getElementById(`${key}-error`);
  if (input) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }
  if (err) {
    if (message) {
      err.hidden = false;
      err.textContent = message;
    } else {
      err.hidden = true;
      err.textContent = "";
    }
  }
}

function setFormStatus(message) {
  const status = document.getElementById("formStatus");
  if (!status) return;
  if (message) {
    status.hidden = false;
    status.textContent = message;
  } else {
    status.hidden = true;
    status.textContent = "";
  }
}

function validateForm(form, fields) {
  let ok = true;
  let firstInvalid = null;
  for (const f of fields) {
    const raw = (form.elements[f.key]?.value || "").trim();
    setFieldError(f.key, "");
    if (f.required && !raw) {
      setFieldError(f.key, `${f.label || f.key} is required.`);
      ok = false;
      if (!firstInvalid) firstInvalid = document.getElementById(f.key);
      continue;
    }
    if (raw && (f.type === "email" || f.key === "email")) {
      // Practical email check — not a full RFC parser.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        setFieldError(f.key, "Enter a valid email address.");
        ok = false;
        if (!firstInvalid) firstInvalid = document.getElementById(f.key);
      }
    }
  }
  if (firstInvalid) firstInvalid.focus();
  return ok;
}

async function onSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fields = CONFIG.signupForm?.fields || [];
  setFormStatus("");

  if (!validateForm(form, fields)) {
    setFormStatus("Please fix the highlighted fields.");
    return;
  }

  const data = {};
  fields.forEach((f) => {
    data[f.key] = (form.elements[f.key]?.value || "").trim();
  });

  const payloadText = [
    `Project: ${CONFIG.productName || "Faulty Link"}`,
    ...fields.map((f) => `${f.label || f.key}: ${data[f.key] || ""}`),
  ].join("\n");

  const mode = CONFIG.signupForm?.submitMode || "clipboard";
  if (mode === "mailto") {
    const to = signupRecipient();
    if (!to) {
      setFormStatus("No recipient configured for mailto.");
      return;
    }
    const subjectText =
      CONFIG.signupForm?.subject || `${CONFIG.productName || "Faulty Link"} — Early Access`;
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(payloadText);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    showInlineSuccess("Opened email client.");
  } else if (mode === "postJson") {
    const endpoint = CONFIG.signupForm?.endpoint;
    if (!endpoint) {
      showToast("No endpoint configured for postJson.");
      return;
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Explicit: never send cookies cross-origin; reduces CSRF surface.
        credentials: "omit",
        body: JSON.stringify({ project: CONFIG.productName, data }),
      });
      if (res.ok) {
        showInlineSuccess("Submitted. Thank you!");
      } else {
        setFormStatus("Submission failed. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setFormStatus("Network error. Please try again later.");
    }
  } else {
    // clipboard (default fallback)
    try {
      await navigator.clipboard.writeText(payloadText);
      showInlineSuccess("Copied to clipboard. Paste into your tracker / email draft.");
    } catch (err) {
      try {
        // Last-resort fallback when Clipboard API is blocked.
        const ta = document.createElement("textarea");
        ta.value = payloadText;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        if (ok) showInlineSuccess("Copied to clipboard.");
        else showToast("Could not copy. Please try again.");
      } catch (e2) {
        showToast("Could not copy.");
      }
    }
  }
}

function showInlineSuccess(msg) {
  const form = document.getElementById("signupForm");
  if (!form) return;
  form.innerHTML = `<div class="card"><p>${escapeHtml(msg)}</p><div class="ctaRow mt-12"><button class="btn" type="button" data-action="closeModal">Close</button></div></div>`;
  wireActions();
  const closeBtn = form.querySelector('[data-action="closeModal"]');
  if (closeBtn) closeBtn.focus();
}

// --- Action wiring -----------------------------------------------------------

function wireActions() {
  document.querySelectorAll("[data-action]").forEach((el) => {
    if (el._wired) return;
    el._wired = true;
    el.addEventListener("click", (ev) => {
      const act = el.dataset.action;
      if (act === "openSignup") {
        // Prevent bare href="#" from jumping the page.
        if (el.tagName === "A") ev.preventDefault();
        openSignup(ev);
      }
      if (act === "closeModal") closeModal();
    });
  });
}

// --- Navigation + boot -------------------------------------------------------

export function injectCommon() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  try {
    if (!document.querySelector('link[rel="icon"]')) {
      const l = document.createElement("link");
      l.rel = "icon";
      l.href = joinBase("/favicon.svg");
      l.type = "image/svg+xml";
      document.head.appendChild(l);
    }
  } catch (e) {
    /* noop */
  }

  const nav = document.getElementById("nav");
  if (nav) {
    // Nav is injected once at boot; polite live region helps AT users notice it.
    if (!nav.hasAttribute("aria-label")) nav.setAttribute("aria-label", "Primary");
    if (!nav.hasAttribute("aria-live")) nav.setAttribute("aria-live", "polite");
    // Atomic so AT announces the finished link set, not each append.
    if (!nav.hasAttribute("aria-relevant")) nav.setAttribute("aria-relevant", "additions text");
    nav.setAttribute("aria-busy", "true");
    const links =
      CONFIG.navLinks && CONFIG.navLinks.length
        ? CONFIG.navLinks
        : [
            { href: "/", label: "Home" },
            { href: "/start/", label: "Start" },
            { href: "/den/", label: `${CONFIG.chapterName} (${CONFIG.chapterCityLabel})` },
            { href: "/den/events/", label: "Events" },
            { href: "/den/eiber/", label: "Eiber" },
          ];
    nav.replaceChildren();
    const here = currentPath();
    links.forEach((l) => {
      const a = document.createElement("a");
      a.className = "pill" + (normalizePath(l.href) === here ? " active" : "");
      a.href = joinBase(l.href);
      a.textContent = l.label;
      if (normalizePath(l.href) === here) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    nav.setAttribute("aria-busy", "false");
  }

  // Resolve brand home link through basePath when marked data-home.
  document.querySelectorAll("[data-home]").forEach((a) => {
    a.setAttribute("href", joinBase("/"));
  });

  wireActions();
}

// Auto-boot when loaded directly as a module entry (no inline script needed).
injectCommon();
