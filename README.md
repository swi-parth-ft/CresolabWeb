# Cresolab website

A dependency-free, responsive website built with HTML, CSS, JavaScript, and JSON.

## Run locally

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. No build step is required. Hash routes also work on static hosting such as GitHub Pages.

## Editing

- `index.html`: shared header, accessible navigation, footer, and dialogs.
- `css/style.css`: responsive visual system and reduced-motion styles.
- `js/app.js`: routes, page templates, catalog, dialogs, CSV export, and inquiry drafts.
- `data/company.json`: contact details and sourced educational perspectives.
- `data/products.json`: supplied product portfolio, with editable image paths and alt text. Shared dosage-form images are marked representative. Replace each record’s image and alt text with approved pack photography and set `imageRepresentative` to `false` when appropriate. Confirm records before publication.
- `assets/images/*.webp`: optimized representative generated imagery, not real Cresolab facility photographs.
- `docs/content-research.md`: research sources, editorial decisions, and facts requiring approval.

After editing either JSON file, run:

```sh
node scratch/expand_data.js
```

This synchronizes `js/data-fallback.js`. The historical copy-expansion script was replaced so it cannot reintroduce unverified claims.

## Inquiry behavior

The form prepares a reviewable email draft in the visitor's browser. It does not send data to an API, store leads, or report successful delivery. The visitor can copy the draft or open it in an email application and send it there. No analytics, tracking scripts, or remote font dependencies are included.

## Before publishing

Confirm the legal company identity, contact channels, product records, actual manufacturing scope, and any future certification claims. Replace representative imagery with approved company photography if available. See the research document for the complete checklist. This source has not been deployed as part of the redesign.
