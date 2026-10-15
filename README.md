# Cresolab Lifecare website

A minimal pharmaceutical trading website for Cresolab Lifecare, built with HTML, CSS, vanilla JavaScript, and JSON. No build step or runtime dependencies.

## Run locally

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. Hash routes work on static hosts, including GitHub Pages.

## Pages

- Home: trading introduction, product categories, and a short enquiry process.
- Products: image-led catalog with composition search, dosage-form and therapeutic-area filters, product details, and CSV download.
- How we work: trade enquiry process and practical questions about quantities, availability, and documentation.
- About us: pharmaceutical trading focus and Surat location.
- Trade enquiry: contact details and a reviewable email draft.
- Privacy & website notice.

Former manufacturing, research, global, insights, responsibility, and careers URLs redirect to relevant current pages. Existing product links and query parameters remain supported.

## Editing

- `index.html`: shared navigation, footer, official logo, and accessible dialogs.
- `css/style.css`: warm ivory and brown visual system, responsive layout, and reduced-motion support.
- `js/app.js`: routing, page content, catalog interactions, CSV export, and enquiry drafts.
- `data/company.json`: company description, contact details, and homepage statistic badges. Edit `statistics.items` to update the values and labels. `statistics.isPlaceholder` displays the “Illustrative figures” label; keep it enabled until approved company figures replace the samples.
- `data/products.json`: 18 supplied product records, image paths, and alt text.
- `assets/brand/cresolab-logo.png`: official supplied logo, extracted from the user's PDF.
- `assets/images/products/`: representative generated pack images. Replace records' image paths and alt text with approved product photos, and set `imageRepresentative` to `false` when appropriate.
- `docs/content-research.md`: content direction and reference notes.
- `docs/verification.md`: current verification results.

After editing either JSON file, regenerate the static fallback:

```sh
node scratch/expand_data.js
```

## Enquiry behavior

The form prepares an email draft locally. Visitors can review and copy it or open it in an email application to send. There is no lead-submission API or delivery confirmation. No analytics, cookies, external fonts, or tracking scripts are included.

Product records and contact details retain the supplied data. Availability, pricing, quantities, pack details, and supporting documents are handled through trade enquiries. Legacy facility imagery remains in the asset directory but is not used by the current site.
