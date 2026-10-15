# Cresolab trading redesign — verification

Verified locally on 15 October 2026 at `http://127.0.0.1:8765/?v=10#/`.

## Browser checks

52 checks passed in Chromium, with no uncaught JavaScript errors.

- All six routes at 1440 × 900, 768 × 1024, 390 × 844, and 320 × 568: no horizontal overflow, one main heading, route-specific titles, and trading-focused copy without former factory/research content.
- All 18 supplied products retained; every product image decodes.
- Dosage-form filters update the URL and survive refresh.
- Composition search, therapeutic-area filter, empty results, and reset work.
- Product images open the correct details; product enquiries prefill the contact form.
- Email drafts contain the correct recipient and product. The interface explains that nothing has been sent; editing hides the stale draft.
- Product-list CSV downloads.
- Product deep links open details; Escape closes the dialog and clears the detail parameter.
- URL-provided enquiry text is escaped.
- All six retired corporate routes redirect to relevant current routes.
- Mobile navigation opens, closes with Escape, and closes after following a route.
- Blocking both JSON requests still loads all products through the generated fallback.
- Reduced-motion preference disables the section reveal treatment.

An initial dialog test checked the URL before the browser dispatched its native close event. Waiting for the completed close state passed; no application change was needed for that behavior.

## Visual review

Reviewed desktop and mobile home, product range, and trade enquiry screenshots. The revised site uses the official logo, ivory background, warm brown accents, product imagery, and open layouts. Manufacturing and laboratory photographs are no longer referenced by the website. Notifications clear on route navigation so messages from an earlier page do not cover the new content.

Screenshots and the verification script/output are local, ignored artifacts under `output/playwright/`.

## Source checks

- `node --check js/app.js`
- `node --check js/data-fallback.js`
- Canonical JSON and generated fallback parity.
- `git diff --check`
- Scan of active source and data for obsolete manufacturing and research messaging.

The enquiry flow is a local email-draft flow. No email was sent, no backend was added, and these checks do not establish deployment status.

## Arrow rendering fix — 15 October 2026

Replaced every diagonal and downward Unicode arrow in shared markup and generated page content with inline SVG paths. Icons inherit the surrounding text colour, remain hidden from assistive technology, and preserve hover motion. Updated CSS and application cache versions to 11.

Verified all six routes in WebKit with an iPhone viewport and in Chromium: no Unicode arrow text remains, icons use SVG paths and the expected stroke styling, and layouts do not overflow. Checked product-dialog and mobile-menu icons, desktop contact layout, and contact screenshots in both engines. WebKit verification uses browser emulation, not a physical iPhone. JavaScript syntax and Git whitespace checks passed.

## Homepage statistic badges — 15 October 2026

Added five SVG statistic badges below the homepage hero: countries served, years of experience, clients globally, product lines, and ready dossiers. The owner requested dummy data; values are taken from the supplied visual reference and are visibly labelled “Illustrative figures”. They are editable in `data/company.json` under `statistics`; the browser fallback is regenerated from that source.

Reviewed WebKit screenshots at 1440px and 390px. Verified all five values, accessible label/value pairs, SVG icons, the illustrative label, and no overflow or clipping at 1440, 768, 390, and 320px. Confirmed the badges also load when JSON requests fail. Source syntax, fallback parity, and whitespace checks passed.
