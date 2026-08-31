// Regenerate the browser fallback after editing the canonical JSON files.
// Historical copy expansion has been retired to prevent obsolete claims returning.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const company = JSON.parse(
  fs.readFileSync(path.join(root, "data/company.json"), "utf8"),
);
const products = JSON.parse(
  fs.readFileSync(path.join(root, "data/products.json"), "utf8"),
);
fs.writeFileSync(
  path.join(root, "js/data-fallback.js"),
  "// Generated from data/company.json and data/products.json. Do not edit directly.\n" +
    "window.CresolabFallbackCompany = " +
    JSON.stringify(company, null, 2) +
    ";\n" +
    "window.CresolabFallbackProducts = " +
    JSON.stringify(products, null, 2) +
    ";\n",
);
console.log("Updated js/data-fallback.js from canonical JSON.");
