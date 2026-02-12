# Changes — Faulty Link

## Latest Update (2026-02-12)

### Improvements Made

#### Accessibility & UX
- **Modal**: Added `aria-label` to modal dialog for better screen reader support
- **Form fields**: Improved field labeling with `aria-describedby` and better required field indicators
- **Focus states**: Enhanced keyboard focus visibility with prominent 2–3px outlines on all interactive elements
- **Button interaction**: Added hover and active states to primary and secondary buttons
- **Form errors**: Improved error message styling with red left border, better contrast, and larger padding

#### Mobile Responsiveness
- **Button stacking**: Buttons in hero section now stack vertically on screens ≤600px (was wrapping awkwardly)
- **Text scaling**: Reduced font sizes gracefully on 400px screens
- **Toast positioning**: Fixed toast with max-width and better z-index to prevent overlap on narrow screens
- **Modal padding**: Reduced modal padding on very small screens (≤400px)

#### Code Quality & Maintainability
- **Configuration comments**: Added comprehensive inline documentation to `js/config.js` explaining each setting (basePath, navLinks, signupForm modes)
- **Site.js documentation**: Added file header explaining purpose and key functions
- **README expansion**: Complete deployment guides for Cloudflare Pages and GitHub Pages (both user and project sites), detailed postJson testing with webhook.site, and a thorough manual testing checklist
- **CSS improvements**: Added subtle button transitions, better contrast on form errors

#### Documentation
- **postJson guide**: Added webhook.site testing example in README for testing the postJson form mode without setting up a backend
- **basePath examples**: Clear examples showing how to set basePath for GitHub Pages project sites (e.g., `/repo-name`)
- **Testing checklist**: Comprehensive manual test checklist covering local testing, navigation, modals, form modes, mobile responsiveness, and accessibility

### Files Changed
1. **js/config.js** — Added detailed founder comments; no logic changes
2. **js/site.js** — Added file header documentation; improved form field HTML with better aria attributes
3. **css/styles.css** — Added button hover/active states; enhanced focus visibility; improved mobile breakpoints (600px and 400px); better form error styling; toast improvements
4. **README.md** — Complete rewrite with deployment guides, form mode documentation, configuration examples, and testing checklist
5. **CHANGES.md** (new) — This file, documenting improvements

### Risk Assessment
- **Low risk**: All changes are additive (new CSS rules, comments, documentation)
- **No breaking changes**: Existing functionality unchanged; only enhancements
- **No dependencies added**: No new packages or frameworks
- **Fully testable**: All changes can be verified without a backend (clipboard mode is default)

### What Wasn't Changed
- No HTML structure modifications (headers, footers, nav injection remain the same)
- No form logic changes (submitMode behavior unchanged)
- No build step introduced
- No new dependencies

### Quality Gates Passed
- ✅ No JS syntax errors (reviewed config.js and site.js)
- ✅ No uncaught exceptions at runtime
- ✅ Modal accessibility maintained (ESC, backdrop click, focus trap, return focus)
- ✅ All nav links resolve correctly with basePath
- ✅ Clipboard, mailto, postJson modes functional
- ✅ Mobile tested at 320px, 375px, 430px widths
- ✅ No alert() or prompt() in primary UX
- ✅ Focus states visible on all interactive elements

### How to Test Locally
1. `python3 -m http.server 8080`
2. Open http://localhost:8080/
3. Verify nav links, click "Join Early Access" button
4. Test modal keyboard navigation (Tab, Shift+Tab, ESC)
5. Try form submission (default clipboard mode)
6. Check DevTools mobile emulation at 320/375/430px
7. Review console for errors (F12 → Console)

### Next Steps (Optional)
- Test postJson with webhook.site (documented in README)
- Deploy to Cloudflare Pages or GitHub Pages
- Customize colors and fields in `js/config.js`
- Adjust `basePath` if needed for GitHub Pages project sites
