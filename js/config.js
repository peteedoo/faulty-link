export const CONFIG = {
	// =========================
	// FOUNDER: Edit below to configure the site
	// =========================

	// Product and chapter metadata (customize your product/pilot names)
	productName: 'Faulty Link',
	chapterName: 'Den',
	chapterCityLabel: 'Denver',

	// Base path for GitHub Pages project sites: set to '/repo-name' if hosting at username.github.io/repo-name
	// For root domain or Cloudflare Pages, leave empty: ''
	basePath: '',

	// Navigation links (single source of truth — edit here to update nav on all pages)
	// Each link: { href: '/path/', label: 'Display Name' }
	// href must match folder structure: /, /start/, /den/, /den/events/, /den/eiber/
	navLinks: [
		{ href: '/', label: 'Home' },
		{ href: '/start/', label: 'Start' },
		{ href: '/den/', label: 'Den (Denver)' },
		{ href: '/den/events/', label: 'Events' },
		{ href: '/den/eiber/', label: 'Eiber' },
	],

	// Signup form configuration
	signupForm: {
		title: 'Join Early Access',
		blurb: 'Pilot list',

		// Form fields — customize as needed
		fields: [
			{ key: 'name', label: 'Name', type: 'text', placeholder: '', required: true },
			{ key: 'email', label: 'Email', type: 'email', placeholder: '', required: true },
			// Add more fields: type can be 'text', 'email', 'textarea', or 'select'
			// Example: { key: 'message', label: 'Tell us about you', type: 'textarea', required: false }
		],

		// Submit mode: how form data is sent
		// 'clipboard' (default) — copies to user's clipboard, safe for no-backend setups
		// 'mailto' — opens email client with form data in body
		// 'postJson' — POSTs JSON to your endpoint (requires CORS headers)
		// default mode: mailto so founder receives signups by email; change to 'clipboard' or 'postJson' if desired
		submitMode: 'mailto',
		// when using mailto, set the recipient and subject here (founder-editable)
		to: 'info@iamfaulty.com',
		subject: 'Im ready to get linked',

		// Endpoint for postJson mode (leave empty if using clipboard or mailto)
		// Example: 'https://webhook.site/your-unique-id' (for testing)
		// Must support CORS and accept POST with Content-Type: application/json
		endpoint: '',
	}
};