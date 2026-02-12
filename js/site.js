import { CONFIG } from "./config.js";

/**
 * site.js — Main site behavior
 *
 * Handles:
 * - Navigation injection (reads CONFIG.navLinks, resolves with basePath)
 * - Modal rendering and accessibility (form, focus trap, ESC to close)
 * - Form submission (clipboard, mailto, postJson)
 * - Toast notifications
 * - Year in footer
 *
 * Called on every page via: import { injectCommon } from "./js/site.js"; injectCommon();
 */

// --- Utilities
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function joinBase(href){
  const base = String(CONFIG.basePath || "").replace(/\/+$/,'');
  const rel = String(href || "");
  if(!base) return rel;
  return base + (rel.startsWith('/') ? rel : ('/' + rel));
}

function normalizePath(p){
  let x = (p || "/").replace(/\/+$/, "");
  if(x === "") x = "/";
  return x;
}

// --- Toast (minimal)
function showToast(msg, timeout=3000){
  let t = document.getElementById('siteToast');
  if(!t){
    t = document.createElement('div');
    t.id = 'siteToast';
    t.setAttribute('role','status');
    t.className = 'site-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(()=> t.classList.remove('visible'), timeout);
}

// --- Modal rendering and behavior
function fieldHtml(f){
  const required = f.required ? 'required' : '';
  const requiredLabel = f.required ? '<span aria-label="required"> *</span>' : '';
  const label = `<label for="${f.key}">${escapeHtml(f.label)}${requiredLabel}</label>`;
  let input = '';
  if(f.type === 'textarea'){
    input = `<textarea id="${f.key}" name="${f.key}" placeholder="${escapeHtml(f.placeholder||'')}" ${required} aria-describedby="${f.key}-help"></textarea>`;
  } else if(f.type === 'select'){
    input = `<select id="${f.key}" name="${f.key}" ${required} aria-describedby="${f.key}-help"><option value="">${escapeHtml(f.placeholder || 'Select...')}</option>${(f.options||[]).map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}</select>`;
  } else {
    input = `<input id="${f.key}" name="${f.key}" type="${f.type || 'text'}" placeholder="${escapeHtml(f.placeholder||'')}" ${required} aria-describedby="${f.key}-help" />`;
  }
  const classes = (f.type === 'textarea') ? 'span2' : '';
  return `<div class="field ${classes}">${label}${input}</div>`;
}

let lastTrigger = null;

function buildModalHtml(){
  const f = CONFIG.signupForm || {};
  return `
    <div id="modalBackdrop" class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-label="Signup form">
        <div class="modal-header">
          <div>
            <h2 id="modalTitle">${escapeHtml(f.title || 'Join Early Access')}</h2>
            <p class="mini">${escapeHtml(f.blurb || '')}</p>
          </div>
          <button class="btn secondary" type="button" data-action="closeModal" aria-label="Close dialog">×</button>
        </div>
        <form id="signupForm">
          <div class="form-grid">
            ${(f.fields || []).map(fieldHtml).join('')}
          </div>
          <div class="ctaRow" style="margin-top:14px">
            <button class="btn" type="submit">Submit</button>
            <button class="btn secondary" type="button" data-action="closeModal">Cancel</button>
          </div>
          <div class="hr"></div>
          <p class="mini">Submit mode: <b>${escapeHtml(f.submitMode || 'clipboard')}</b>.</p>
        </form>
      </div>
    </div>
  `;
}

function openSignup(e){
  if(document.getElementById('modalBackdrop')) return;
  lastTrigger = (e && e.currentTarget) || document.activeElement;
  document.body.insertAdjacentHTML('beforeend', buildModalHtml());
  document.body.classList.add('modal-open'); // scroll lock

  const backdrop = document.getElementById('modalBackdrop');
  const modal = backdrop.querySelector('.modal');

  // focus management: focus first input or submit
  const firstInput = modal.querySelector('input, textarea, select, button[type="submit"]');
  if(firstInput) firstInput.focus();

  // close on backdrop click
  backdrop.addEventListener('click', (ev)=>{
    if(ev.target === backdrop) closeModal();
  });

  // trap focus
  trapFocus(modal);

  // ESC to close
  document.addEventListener('keydown', modalKeyHandler);

  const form = document.getElementById('signupForm');
  if(form) form.addEventListener('submit', onSubmit);

  wireActions();
}

function closeModal(){
  const m = document.getElementById('modalBackdrop');
  if(!m) return;
  m.remove();
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', modalKeyHandler);
  if(lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  lastTrigger = null;
}

function modalKeyHandler(e){
  if(e.key === 'Escape') closeModal();
}

function trapFocus(modal){
  const focusable = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  if(!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length-1];
  modal.addEventListener('keydown', (e)=>{
    if(e.key !== 'Tab') return;
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault(); last.focus();
    } else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault(); first.focus();
    }
  });
}

async function onSubmit(e){
  e.preventDefault();
  const form = e.target;
  const fields = CONFIG.signupForm?.fields || [];
  const data = {};
  fields.forEach(f=>{ data[f.key] = (form.elements[f.key]?.value || '').trim(); });

  const payloadText = [
    `Project: ${CONFIG.productName || 'Faulty Link'}`,
    ...fields.map(f=>`${f.label || f.key}: ${data[f.key] || ''}`)
  ].join('\n');

  const mode = CONFIG.signupForm?.submitMode || 'clipboard';
  if(mode === 'mailto'){
    // Use configurable recipient/subject from CONFIG.signupForm when present
    const to = CONFIG.signupForm?.to || 'info@iamfaulty.com';
    const subjectText = CONFIG.signupForm?.subject || `${CONFIG.productName || 'Faulty Link'} — Early Access`;
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(payloadText);
    // Open the user's mail client with prefilled subject and body
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    showInlineSuccess('Opened email client.');
  } else if(mode === 'postJson'){
    const endpoint = CONFIG.signupForm?.endpoint;
    if(!endpoint){
      showToast('No endpoint configured for postJson.');
      return;
    }
    try{
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: CONFIG.productName, data })
      });
      if(res.ok){
        showInlineSuccess('Submitted. Thank you!');
      } else {
        showInlineError('Submission failed. Please try again later.');
      }
    }catch(err){
      console.error(err);
      showInlineError('Network error. Please try again later.');
    }
  } else { // clipboard
    try{
      await navigator.clipboard.writeText(payloadText);
      showInlineSuccess('Copied to clipboard. Paste into your tracker / email draft.');
    }catch(err){
      // fallback: open mailto with body as backup
      try{ prompt('Copy this:', payloadText); showInlineSuccess('Copied (prompt)'); }catch(e){ showToast('Could not copy.'); }
    }
  }
}

function showInlineSuccess(msg){
  const form = document.getElementById('signupForm');
  if(!form) return;
  form.innerHTML = `<div class="card"><p>${escapeHtml(msg)}</p><div class="ctaRow" style="margin-top:12px"><button class="btn" type="button" data-action="closeModal">Close</button></div></div>`;
  wireActions();
}

function showInlineError(msg){
  const form = document.getElementById('signupForm');
  if(!form) return;
  let err = form.querySelector('.form-error');
  if(!err){ err = document.createElement('div'); err.className='form-error'; form.insertBefore(err, form.firstChild); }
  err.textContent = msg;
}

// --- Wire actions (data-action handlers)
function wireActions(){
  document.querySelectorAll('[data-action]').forEach(el=>{
    // avoid double-binding
    if(el._wired) return; el._wired = true;
    el.addEventListener('click', (ev)=>{
      const act = el.dataset.action;
      if(act === 'openSignup') openSignup(ev);
      if(act === 'closeModal') closeModal();
    });
  });
}

// --- Navigation injection
export function injectCommon(){
  // year
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // meta + favicon (safe defaults). Prefer static head edits, but this helps ensure presence.
  try{
    if(!document.querySelector('link[rel="icon"]')){
      const l = document.createElement('link'); l.rel='icon'; l.href = joinBase('/favicon.svg'); l.type='image/svg+xml'; document.head.appendChild(l);
    }
  }catch(e){/*noop*/}

  const nav = document.getElementById('nav');
  if(nav){
    const links = (CONFIG.navLinks && CONFIG.navLinks.length) ? CONFIG.navLinks : [
      { href: '/', label: 'Home' },
      { href: '/start/', label: 'Start' },
      { href: '/den/', label: `${CONFIG.chapterName} (${CONFIG.chapterCityLabel})` },
      { href: '/den/events/', label: 'Events' },
      { href: '/den/eiber/', label: 'Eiber' },
    ];
    nav.innerHTML = '';
    const here = normalizePath(location.pathname.replace(CONFIG.basePath || '', ''));
    links.forEach(l=>{
      const a = document.createElement('a');
      const hrefResolved = joinBase(l.href);
      a.className = 'pill' + (normalizePath(l.href) === here ? ' active' : '');
      a.href = hrefResolved;
      a.textContent = l.label;
      nav.appendChild(a);
    });
  }

  wireActions();
}
