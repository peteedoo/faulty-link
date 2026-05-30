# Faulty Link Frontend — Comprehensive Audit Report
**Date:** 2026-05-29
**Scope:** All HTML, CSS, JS, SVG, config, and deployment files in ~/faulty-link/
**Auditor:** Hermes Agent (kimi-k2-turbo-preview)

---

## 1. EXECUTIVE SUMMARY

The Faulty Link frontend is a clean, founder-maintainable static site (5 pages, ~13KB total assets) with no build step, deployed to Cloudflare Pages. The codebase shows good discipline for a solo-maintained project: vanilla ES6 modules, centralized config, keyboard-accessible modal, and mobile-responsive CSS. However, there are material gaps in **security headers (CSP, SRI)**, **accessibility (skip links, heading hierarchy, ARIA live regions)**, **performance (no preconnect, no resource hints, render-blocking CSS)**, and **SEO/social sharing (no Open Graph, no Twitter Cards, no structured data)**. This report documents every issue found and provides a prioritized, actionable improvement plan.

---

## 2. FILES AUDITED

| File | Type | Lines | Size |
|------|------|-------|------|
| index.html | HTML | 82 | 3,394 B |
| start/index.html | HTML | 83 | 2,985 B |
| den/index.html | HTML | 69 | 2,755 B |
| den/eiber/index.html | HTML | 68 | 2,667 B |
| den/events/index.html | HTML | 73 | 2,689 B |
| css/styles.css | CSS | 80 | 4,131 B |
| js/site.js | JS | 277 | 9,959 B |
| js/config.js | JS | 53 | 2,183 B |
| favicon.svg | SVG | 3 | 212 B |
| _redirects | Config | 1 | 19 B |
| package.json | Config | 9 | 208 B |
| README.md | Docs | 187 | 5,460 B |
| CHANGES.md | Docs | 73 | 4,163 B |
| TEST_REPORT.md | Docs | 339 | 12,104 B |
| IMPROVEMENTS_SUMMARY.txt | Docs | 339 | 12,034 B |
| PLAN.md | Docs | 342 | 27,836 B |
| docs/bootcamp.md | Docs | 183 | 10,291 B |

**Total source audited:** ~5 HTML pages, 2 JS modules, 1 CSS file, 1 SVG, 6 config/docs files.

---

## 3. ACCESSIBILITY AUDIT (WCAG 2.1 AA)

### 3.1 Issues Found

| # | Issue | Severity | Location | WCAG Criterion |
|---|-------|----------|----------|----------------|
| A1 | **No skip navigation link** | Medium | All 5 HTML pages | 2.4.1 Bypass Blocks |
| A2 | **Missing `aria-live` region for dynamic nav injection** | Medium | js/site.js | 4.1.2 Name, Role, Value |
| A3 | **Modal close button uses "×" without accessible text fallback** | Low | js/site.js buildModalHtml() | 2.4.4 Link Purpose |
| A4 | **Form help text IDs (`aria-describedby`) point to non-existent elements** | Medium | js/site.js fieldHtml() | 1.3.1 Info and Relationships |
| A5 | **No `aria-invalid` or `aria-errormessage` on invalid fields** | Medium | js/site.js onSubmit/showInlineError | 3.3.1 Error Identification |
| A6 | **Toast `role="status"` may be missed if injected after page load** | Low | js/site.js showToast() | 4.1.3 Status Messages |
| A7 | **Color contrast of `.mini` text (`#6b7280` on `#fff`) is 4.6:1** | Low | css/styles.css | 1.4.3 Contrast (Minimum) |
| A8 | **Focus outline on `.btn.secondary` may be invisible against white** | Low | css/styles.css | 2.4.7 Focus Visible |
| A9 | **No `lang` attribute changes for any non-English content** | Low | All pages | 3.1.1 Language of Page |
| A10 | **Heading hierarchy violation on /den/events/: nested `<h2>` inside card inside section with `<h2>`** | Medium | den/events/index.html | 1.3.1 Info and Relationships |
| A11 | **No `<header>` landmark inside `<main>` for section headers** | Low | All pages | 1.3.1 Info and Relationships |
| A12 | **Brand link `href=""` resolves to current page, not home, on subpages** | Medium | index.html line 16 | 2.4.4 Link Purpose |

### 3.2 Detailed Analysis

**A1 — Skip Link:** Every page loads navigation via JS into `#nav`. A screen-reader user tabbing from the top must traverse the brand link + all nav pills before reaching main content. A visually-hidden "Skip to main content" link is standard WCAG practice.

**A2 — Dynamic Nav ARIA:** `injectCommon()` replaces `nav.innerHTML` with generated links. Screen readers may not announce this change unless the `<nav>` has `aria-live="polite"` or the user manually refreshes the virtual buffer.

**A4 — Dangling aria-describedby:** `fieldHtml()` generates `aria-describedby="${f.key}-help"` for every input, but no corresponding `<div id="...-help">` element is ever rendered. This creates broken ARIA references, which some screen readers handle poorly.

**A10 — Heading Nesting:** In `den/events/index.html`, the section has `<h2>Sample events</h2>`, and each child card also uses `<h2>` for event titles. This flattens the outline and makes navigation by heading confusing. Event titles should be `<h3>`.

**A12 — Brand href="":** On the home page, `<a class="brand" href="">` reloads the current page. On subpages, `href="../"` is correct. The root page should use `href="/"` or `./` for consistency.

---

## 4. SECURITY AUDIT

### 4.1 Issues Found

| # | Issue | Severity | Location | Risk |
|---|-------|----------|----------|------|
| S1 | **No Content Security Policy (CSP)** | High | All HTML pages | XSS, data injection, supply-chain |
| S2 | **No Subresource Integrity (SRI) hashes** | Medium | All HTML pages | CDN/compromise of css/styles.css or js/site.js |
| S3 | **No `referrer-policy` meta tag** | Low | All HTML pages | Privacy leak to external links |
| S4 | **No `X-Content-Type-Options: nosniff` header** | Medium | Server config | MIME-sniffing attacks |
| S5 | **No `X-Frame-Options` or CSP `frame-ancestors`** | Medium | Server config | Clickjacking |
| S6 | **Email address `info@iamfaulty.com` exposed in plaintext JS** | Low | js/config.js | Scraping/spam harvesting |
| S7 | **postJson mode sends data without CSRF token** | Medium | js/site.js onSubmit | If endpoint is same-origin, CSRF risk |
| S8 | **No HTTPS enforcement marker (HSTS)** | Medium | Server config | Downgrade attacks |
| S9 | **favicon.svg loads without integrity check** | Low | All pages | SVG can contain JS; no SRI |
| S10 | **Inline `<script type="module">` blocks have no nonce** | Low | All pages | If CSP is added later, these will block |

### 4.2 Detailed Analysis

**S1 — Missing CSP:** The site has no `<meta http-equiv="Content-Security-Policy" ...>` tag. Because it is a static site with no user-generated content, the XSS surface is small, but:
- The modal uses `innerHTML` insertion (`insertAdjacentHTML('beforeend', ...)`), which is a DOM-XSS vector if `CONFIG` is ever poisoned.
- No defense against malicious browser extensions injecting scripts.
- Recommended CSP for this site:
  ```
  default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https:; form-action 'self' mailto:; base-uri 'self'; frame-ancestors 'none';
  ```

**S2 — Missing SRI:** `<link rel="stylesheet" href="css/styles.css" />` and the module script import `./js/site.js` have no `integrity` attributes. On Cloudflare Pages this is lower risk (same-origin), but if assets ever move to a CDN, SRI is essential.

**S6 — Email in config:** `to: 'info@iamfaulty.com'` is stored in `config.js`, which is a public asset. Bots scraping JS will harvest this. Obfuscation (e.g., base64 + decode at runtime, or splitting the string) offers marginal protection. Better: use a form backend (Formspree, Basin, Cloudflare Workers) so the address never hits the client.

**S7 — CSRF in postJson:** If `endpoint` points to a same-origin API, the `fetch()` call includes cookies by default. The site does not send a CSRF token. For cross-origin endpoints this is less relevant (no cookies sent unless `credentials: 'include'`). The current code does not set `credentials`, so it defaults to `same-origin`.

**S9 — SVG favicon risk:** `favicon.svg` is a simple rect + text, but SVG favicons can execute JS in some browsers if crafted maliciously. Since it is same-origin and static, risk is low. Still worth noting.

---

## 5. PERFORMANCE AUDIT

### 5.1 Issues Found

| # | Issue | Severity | Location | Impact |
|---|-------|----------|----------|--------|
| P1 | **Render-blocking CSS** | Medium | All pages | First paint delayed |
| P2 | **No `preconnect` or `dns-prefetch` hints** | Low | All pages | Slower if external resources added later |
| P3 | **No font-display strategy for system fonts** | Low | css/styles.css | FOUT risk if custom fonts added |
| P4 | **CSS is not minified** | Low | css/styles.css | ~1KB extra transfer |
| P5 | **No lazy loading for below-fold images** | N/A | All pages | No images currently; future-proofing |
| P6 | **No service worker or offline strategy** | Medium | All pages | No offline capability |
| P7 | **Module script blocks parsing** | Low | All pages | `type="module"` defers by default, but inline module still blocks |
| P8 | **No compression headers configured in _redirects** | Low | _redirects | Brotli/Gzip up to Cloudflare |
| P9 | **Redundant favicon injection** | Low | js/site.js | Static `<link rel="icon">` exists; JS also injects one |
| P10 | **No resource hints for critical CSS** | Low | All pages | Could inline above-fold CSS |

### 5.2 Detailed Analysis

**P1 — Render-blocking CSS:** The stylesheet is loaded conventionally in `<head>`. For a 4KB CSS file this is negligible on broadband, but on 3G/LoRa-adjacent networks (aligned with the product's mission), every byte matters. Consider:
- Inlining critical CSS (above-fold rules) and async-loading the rest.
- Adding `media="all"` explicitly (already default, but explicit is clearer).

**P6 — No Offline Support:** The site is a perfect candidate for a minimal service worker. A simple "cache-first" SW would make the entire site work offline after first load — highly aligned with the "works when cell service fails" product ethos.

**P9 — Double favicon:** Every HTML page already has `<link rel="icon" href="favicon.svg" />`. `injectCommon()` checks `document.querySelector('link[rel="icon"]')` and skips injection if found, so this is handled correctly. No action needed, but worth noting the defensive code is good.

**P7 — Module script:** `<script type="module">` is implicitly deferred, so it does not block HTML parsing. This is actually correct. The inline module is small (2 lines). No issue.

---

## 6. SEO & SOCIAL SHARING AUDIT

### 6.1 Issues Found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| SEO1 | **No Open Graph (`og:*`) meta tags** | Medium | All pages |
| SEO2 | **No Twitter Card meta tags** | Medium | All pages |
| SEO3 | **No canonical URL** | Low | All pages |
| SEO4 | **No JSON-LD structured data** | Low | All pages |
| SEO5 | **No sitemap.xml** | Low | Site root |
| SEO6 | **No robots.txt** | Low | Site root |
| SEO7 | **Description meta is identical on all pages** | Medium | All pages |
| SEO8 | **No `<main>` element has `id` for skip links** | Low | All pages |

### 6.2 Detailed Analysis

**SEO1/SEO2 — Missing Social Tags:** Sharing any page on Slack, Twitter, LinkedIn, or iMessage will produce a bare link with no image, title, or description. For a community-driven product relying on word-of-mouth, this is a missed opportunity.

**SEO7 — Duplicate Descriptions:** Every page uses the exact same `<meta name="description" content="Faulty Link — portable private networks for groups + neighborhoods.">`. Search engines may de-duplicate or downgrade pages with identical descriptions. Each page should have a unique, descriptive summary.

**SEO4 — Structured Data:** Adding `WebSite` and `Organization` JSON-LD would improve search appearance and enable rich snippets.

---

## 7. CODE QUALITY & MAINTAINABILITY AUDIT

### 7.1 Issues Found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| C1 | **HTML uses inline `style` attributes** | Low | All pages (e.g., `style="margin-top:18px"`) |
| C2 | **CSS custom properties not used for all repeated values** | Low | css/styles.css |
| C3 | **No `use strict` or ES module strict mode enforcement comment** | Low | js/site.js |
| C4 | **Magic numbers in JS (3000ms toast timeout, 9999 z-index)** | Low | js/site.js |
| C5 | **No JSDoc types for CONFIG object** | Low | js/config.js, js/site.js |
| C6 | **Hardcoded English strings throughout JS** | Low | js/site.js |
| C7 | **No automated testing framework** | Low | package.json |
| C8 | **`.DS_Store` and editor/ folders committed to repo** | Low | .gitignore |
| C9 | **No CI/CD workflow for linting or deployment** | Low | .github/workflows/ |
| C10 | **Redundant `normalizePath` logic could use URL API** | Low | js/site.js |

### 7.2 Detailed Analysis

**C1 — Inline Styles:** 12 instances of `style="margin-top:18px"` across pages. These defeat the purpose of a centralized stylesheet and make bulk updates harder. A utility class like `.mt-18` or `.section` would be cleaner.

**C8 — Committed artifacts:** `.DS_Store`, `editor/`, and `den/.DS_Store` are in the repo. `.gitignore` exists but does not cover macOS or editor artifacts.

**C10 — URL normalization:** `normalizePath()` manually strips trailing slashes. The `URL` API or `new URL(path, base).pathname` would be more robust and handle edge cases (e.g., query strings, hashes) if they are ever introduced.

---

## 8. DEPLOYMENT & INFRASTRUCTURE AUDIT

### 8.1 Issues Found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| D1 | **_redirects file is malformed/incomplete** | Low | _redirects |
| D2 | **No `_headers` file for Cloudflare Pages** | Medium | Site root |
| D3 | **No build script or linting in package.json** | Low | package.json |
| D4 | **No `.nvmrc` or engine specification** | Low | package.json |

### 8.2 Detailed Analysis

**D1 — _redirects:** The file contains only `/* /index.html 200` (commented out? actually just `/* /index.html 200` on line 1 with a `/*` prefix that may be interpreted as a comment). Cloudflare Pages uses `_redirects` with syntax:
```
/* /index.html 200
```
If the leading `/*` is a comment, it is invalid. If it is a wildcard redirect, it is missing a newline or proper formatting. Verify in Cloudflare dashboard.

**D2 — Missing _headers:** Cloudflare Pages supports a `_headers` file to set custom HTTP headers per path. This is the ideal place to add:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; ...
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
Without this, the site relies on Cloudflare defaults, which do not include CSP or HSTS.

---

## 9. COMPLETE ISSUE MATRIX

| ID | Category | Issue | Severity | Effort |
|----|----------|-------|----------|--------|
| A1 | Accessibility | No skip navigation link | Medium | 15 min |
| A2 | Accessibility | Nav injection lacks aria-live | Medium | 10 min |
| A3 | Accessibility | Modal close button text | Low | 5 min |
| A4 | Accessibility | Dangling aria-describedby IDs | Medium | 15 min |
| A5 | Accessibility | No aria-invalid on errors | Medium | 20 min |
| A6 | Accessibility | Toast role status timing | Low | 10 min |
| A7 | Accessibility | .mini contrast borderline | Low | 5 min |
| A8 | Accessibility | Focus outline on secondary btn | Low | 5 min |
| A9 | Accessibility | lang attr for non-English | Low | N/A (no non-English) |
| A10 | Accessibility | Heading hierarchy violation | Medium | 10 min |
| A11 | Accessibility | No header landmark in main | Low | 10 min |
| A12 | Accessibility | Brand href="" on home page | Medium | 5 min |
| S1 | Security | No CSP | High | 30 min |
| S2 | Security | No SRI | Medium | 20 min |
| S3 | Security | No referrer-policy | Low | 5 min |
| S4 | Security | No X-Content-Type-Options | Medium | 5 min (via _headers) |
| S5 | Security | No X-Frame-Options/frame-ancestors | Medium | 5 min (via _headers) |
| S6 | Security | Email exposed in JS | Low | 15 min |
| S7 | Security | postJson lacks CSRF token | Medium | 20 min |
| S8 | Security | No HSTS | Medium | 5 min (via _headers) |
| S9 | Security | SVG favicon without SRI | Low | 10 min |
| S10 | Security | Inline scripts lack nonce | Low | 15 min |
| P1 | Performance | Render-blocking CSS | Medium | 30 min |
| P2 | Performance | No preconnect/dns-prefetch | Low | 5 min |
| P3 | Performance | No font-display | Low | 5 min |
| P4 | Performance | CSS not minified | Low | 10 min |
| P5 | Performance | No lazy loading (future) | Low | N/A |
| P6 | Performance | No service worker | Medium | 1 hr |
| P7 | Performance | Module script blocking | Low | N/A (deferred) |
| P8 | Performance | No compression config | Low | N/A (Cloudflare handles) |
| P9 | Performance | Redundant favicon injection | Low | N/A (already guarded) |
| P10 | Performance | No critical CSS inline | Low | 30 min |
| SEO1 | SEO | No Open Graph | Medium | 20 min |
| SEO2 | SEO | No Twitter Cards | Medium | 10 min |
| SEO3 | SEO | No canonical URLs | Low | 10 min |
| SEO4 | SEO | No JSON-LD | Low | 20 min |
| SEO5 | SEO | No sitemap.xml | Low | 15 min |
| SEO6 | SEO | No robots.txt | Low | 5 min |
| SEO7 | SEO | Duplicate meta descriptions | Medium | 15 min |
| SEO8 | SEO | No main id for skip links | Low | 5 min |
| C1 | Code Quality | Inline style attributes | Low | 20 min |
| C2 | Code Quality | Incomplete CSS custom properties | Low | 15 min |
| C3 | Code Quality | No strict mode comment | Low | 5 min |
| C4 | Code Quality | Magic numbers | Low | 10 min |
| C5 | Code Quality | No JSDoc | Low | 20 min |
| C6 | Code Quality | Hardcoded English strings | Low | 30 min |
| C7 | Code Quality | No test framework | Low | 1 hr |
| C8 | Code Quality | .DS_Store committed | Low | 5 min |
| C9 | Code Quality | No CI/CD | Low | 30 min |
| C10 | Code Quality | Manual URL normalization | Low | 10 min |
| D1 | Deployment | _redirects formatting | Low | 5 min |
| D2 | Deployment | No _headers file | Medium | 15 min |
| D3 | Deployment | No build/lint scripts | Low | 15 min |
| D4 | Deployment | No engine spec | Low | 5 min |

---

## 10. PRIORITIZED IMPROVEMENT PLAN

### Phase 1: Security Hardening (Do First — 1–2 hours)
1. **Create `_headers` file** for Cloudflare Pages with CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
2. **Add CSP meta tag** as fallback for local development.
3. **Add SRI hashes** to `<link rel="stylesheet">` and `<script type="module">` tags.
4. **Fix `_redirects`** formatting.
5. **Obfuscate or remove** email from `config.js` (move to backend or use contact form service).

### Phase 2: Accessibility Fixes (2–3 hours)
1. **Add skip link** to all pages (`<a href="#main" class="skip-link">Skip to main content</a>`).
2. **Add `id="main"`** to each `<main>` element.
3. **Fix heading hierarchy** on `/den/events/` (event titles → `<h3>`).
4. **Remove or fix** `aria-describedby` in `fieldHtml()` — either render help text or remove the attribute.
5. **Add `aria-invalid` and `aria-errormessage`** to form validation.
6. **Add `aria-live="polite"`** to `<nav id="nav">` or announce nav changes via a live region.
7. **Fix brand href** on home page to `href="/"`.

### Phase 3: SEO & Social (1 hour)
1. **Add unique Open Graph tags** to every page (title, description, image, url).
2. **Add Twitter Card tags**.
3. **Add canonical `<link>`** to every page.
4. **Write unique `<meta name="description">`** for each page.
5. **Create `robots.txt`** and `sitemap.xml`.
6. **Add JSON-LD** for Organization and WebSite on home page.

### Phase 4: Performance (2–3 hours)
1. **Add service worker** (`sw.js`) with cache-first strategy for static assets.
2. **Add `preconnect` hint** for any future external domains.
3. **Minify CSS** (optional; Cloudflare auto-minifies, but explicit is better).
4. **Consider inlining critical CSS** for above-fold content.

### Phase 5: Code Quality & Maintainability (2–3 hours)
1. **Replace inline styles** with utility classes.
2. **Expand CSS custom properties** for spacing, font sizes.
3. **Add JSDoc** to `site.js` functions.
4. **Add constants** for magic numbers (TOAST_TIMEOUT, Z_INDEX_MODAL).
5. **Update `.gitignore`** to exclude `.DS_Store`, `editor/`, `*.log`.
6. **Add GitHub Actions workflow** for HTML validation (html-validate) and CSS linting (stylelint).

### Phase 6: Testing & Documentation (1 hour)
1. **Update `README.md`** with security headers explanation.
2. **Update `TEST_REPORT.md`** with new accessibility and security checks.
3. **Add `package.json` scripts** for `lint`, `validate`, `build` (minification).

---

## 11. POSITIVE FINDINGS (What Works Well)

- **Keyboard-accessible modal:** Focus trap, ESC to close, return focus to trigger — all implemented correctly.
- **Centralized config:** `js/config.js` is a clean, well-documented single source of truth.
- **No build step complexity:** Perfect for a founder-maintained project. No dependency rot.
- **Mobile-first CSS:** Breakpoints at 600px and 400px, flexible grids, readable type scaling.
- **noscript banner:** Graceful degradation for users with JS disabled.
- **Escape HTML utility:** `escapeHtml()` prevents XSS in modal content (though CONFIG is trusted).
- **Semantic HTML:** Proper use of `<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`.
- **Cloudflare Pages deployment:** Fast, free, and appropriate for static content.
- **Comprehensive documentation:** README, CHANGES, TEST_REPORT, IMPROVEMENTS_SUMMARY, PLAN, and bootcamp docs show strong project hygiene.

---

## 12. FILES CREATED BY THIS AUDIT

1. `/Users/peteedoo/faulty-link/AUDIT_REPORT.md` — This comprehensive report.

---

*End of Audit Report*
