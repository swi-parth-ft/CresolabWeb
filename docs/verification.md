# Redesign verification

Local Chromium browser verification completed on 31 August 2026.

## Layout and routes

- All 11 routes checked at 1440, 768, 390, and 320 CSS pixels: 44 route/viewport combinations.
- Each route has one primary heading and its own document title and description.
- No horizontal page overflow or uncaught JavaScript errors in the route survey.
- Hero actions and content fit short mobile viewports at 375×667 and 320×568.
- Desktop homepage, quality section, contact form, mobile homepage, catalog, inquiry draft, and dark theme inspected visually.

## Interaction checks

23 browser checks passed, covering:

- Product count, category filtering, valid filter URLs, and refresh persistence.
- Product search, empty-state reset, details dialog, and inquiry prefilling.
- Correct product inquiry type, form validation, draft generation, and mailto construction.
- Explicit confirmation that nothing has been sent.
- Escaping of URL-supplied text (a harmless HTML marker is displayed as text).
- CSV download, mobile navigation, Escape dismissal, and theme persistence.
- Article deep links, close behavior, and reopening.
- Data fallback when JSON requests are intentionally blocked.
- Reduced-motion styles; preference-change handling also checked separately.

The two browser network errors during the fallback test were intentionally induced by blocking the JSON requests. They are not application failures.

## Source checks

JavaScript syntax, Git whitespace checks, and JSON/fallback parity passed. Generated photography is shipped as two optimized WebP files, approximately 105 KB each. No third-party fonts, trackers, framework runtime, or build step are required.

## Boundaries

- This verifies the local website, not a deployed environment or every browser engine.
- No inquiry was sent; the form prepares a draft and the visitor sends it in their email application.
- Company identity, contact ownership, product specifications, licensing, and actual manufacturing capability have not been independently verified.
- Imagery is representative and AI-generated, not evidence of Cresolab facilities or employees.

Local screenshots and the browser-check script are in `output/playwright/` (excluded from Git).

## Product image follow-up

Added five representative dosage-form pack images across all 18 product entries, plus the details dialog. Browser checks confirmed all 18 images decode successfully, image clicks open the correct product, and the 390px catalog has no horizontal overflow. Desktop and mobile screenshots were visually inspected. The five optimized WebP assets total approximately 96 KB. Per-product image paths and alt text are editable in the product JSON.

## Brown theme follow-up

Replaced the blue-green interface palette with espresso, walnut, cocoa, clay, cream, and sand tones across light mode, dark mode, hero overlays, controls, footer, and product artwork treatment. Browser visual checks covered the desktop home and catalog plus the mobile home in both themes. At 390px there is no horizontal overflow. Measured light-mode contrast is 12.96:1 for primary text and 5.50:1 for body copy; dark-mode values are 14.53:1 and 8.06:1 respectively.
