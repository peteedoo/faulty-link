# Faulty Link — Multi-Page Static Site

A simple, founder-maintainable static site for early-stage product pilots. No build step, no frameworks, pure HTML/CSS/JS.

## Site Structure

```
/                      → Home page
/start/                → How it works
/den/                  → Denver pilot chapter
/den/events/           → Events & field tests
/den/eiber/            → Neighborhood node
```

## Local Development

```bash
python3 -m http.server 8080
```

Then open:
- http://localhost:8080/
- http://localhost:8080/start/
- http://localhost:8080/den/
- http://localhost:8080/den/events/
- http://localhost:8080/den/eiber/

## Configuration (Founder's Control Center)

Edit **js/config.js** to customize:

### Site metadata & navigation
```javascript
productName: 'Faulty Link',
chapterName: 'Den',
chapterCityLabel: 'Denver',
navLinks: [
  { href: '/', label: 'Home' },
  { href: '/start/', label: 'Start' },
  // ... add/remove as needed
]
```

### Signup form
```javascript
signupForm: {
  title: 'Join Early Access',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    // Add more fields here (text, email, textarea, select)
  ],
  submitMode: 'clipboard', // or 'mailto' or 'postJson'
  endpoint: '', // Only needed for postJson
}
```

### Base path (for GitHub Pages project sites)
If hosting at `username.github.io/repo-name`, set:
```javascript
basePath: '/repo-name'
```

For root domain or Cloudflare Pages, leave empty:
```javascript
basePath: ''
```

## Signup Form Modes

### Clipboard (default, no backend)
Form data is copied to the user's clipboard in plain text. Safe and requires no server.

### Mailto
Opens the user's email client with form data in the body. Works offline.

### PostJson
POSTs JSON to your endpoint. Requires:
- CORS headers on the endpoint
- Endpoint accepts `POST` with `Content-Type: application/json`
- JSON payload: `{ project: "...", data: { name: "...", email: "..." } }`

#### Testing postJson with webhook.site
1. Visit https://webhook.site
2. Copy your unique URL (e.g., `https://webhook.site/abc-123-def`)
3. Set in config.js: `endpoint: 'https://webhook.site/abc-123-def'`
4. Fill and submit the form
5. Check webhook.site to see the POST request with your form data

## Styling

Edit **css/styles.css** to customize:
- Colors: CSS variables at top (--accent, --bg, --text, etc.)
- Fonts: System font stack for fast load
- Responsive breakpoints: 600px and 400px for mobile

## CSS Customization Example

```css
:root {
  --accent: #0b74de;      /* Primary color */
  --bg: #fff;             /* Background */
  --text: #111;           /* Text color */
  --muted: #6b7280;       /* Muted text */
  --radius: 8px;          /* Border radius */
  --shadow: 0 6px 18px rgba(...);
}
```

## Deployment

### Cloudflare Pages
1. Connect your repo
2. Build command: **None** (this is static)
3. Publish directory: **root**
4. Deploy

### GitHub Pages (User Site)
1. Push to `username.github.io` repo
2. Publish from root (Pages settings)

### GitHub Pages (Project Site)
1. Push to your repo
2. In `js/config.js`, set `basePath: '/repo-name'`
3. In Pages settings, publish from root
4. Site is live at `username.github.io/repo-name`

## Manual Testing Checklist

### Local server
- [ ] Run `python3 -m http.server 8080`
- [ ] Open http://localhost:8080/
- [ ] No console errors (F12 → Console)

### Navigation
- [ ] All nav links work (Home, Start, Den, Events, Eiber)
- [ ] Nav highlights current page (active state)
- [ ] "Faulty Link" logo links to home

### Signup modal
- [ ] Click "Join Early Access" button
- [ ] Modal appears with form fields
- [ ] Tab key cycles through form fields
- [ ] Shift+Tab cycles backward
- [ ] ESC key closes modal and returns focus to button
- [ ] Click backdrop (dark area) closes modal
- [ ] Submit button works (clipboard copies, mailto opens email, postJson sends)

### Form modes

**Clipboard mode (default)**
- [ ] Fill form and submit
- [ ] Success message appears
- [ ] Run `pbpaste` in terminal to verify form data copied

**Mailto mode**
- [ ] Set `submitMode: 'mailto'` in config.js
- [ ] Fill form and submit
- [ ] Email client opens with form data in body

**postJson mode**
- [ ] Visit https://webhook.site → copy URL
- [ ] Set `endpoint: 'https://webhook.site/...'` in config.js
- [ ] Fill form and submit
- [ ] Check webhook.site — request received with JSON payload
- [ ] Test error response (use invalid endpoint) → error message shown

### Mobile responsiveness (use DevTools device toolbar)
- [ ] 320px width: hero text readable, buttons stack vertically
- [ ] 375px width: layout intact, buttons tappable
- [ ] 430px width: full design visible
- [ ] No horizontal scroll at any width

### Accessibility
- [ ] All form inputs have labels
- [ ] Modal is keyboard navigable (Tab, Shift+Tab, ESC)
- [ ] Focus outline visible on all interactive elements
- [ ] Required fields marked with *
- [ ] Form fields properly associated with labels

## Notes

- No build step required. All files served as-is.
- JS is modular (ES6 imports), but all files are vanilla — no frameworks or bundlers.
- basePath is used by site.js to resolve nav links correctly on subpaths.
- favicon.svg is injected at runtime and also available statically in the HTML head.
- Toast notifications auto-dismiss after 3 seconds.
- Modal scroll-locks the body while open.