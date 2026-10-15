/* Cresolab — pharmaceutical trading, product enquiries, and accessible static routes. */
"use strict";
let company, products, observer, toastTimer;
const main = document.getElementById("main-content");
const dialog = document.getElementById("detail-dialog");
const dialogContent = document.getElementById("dialog-content");
const menu = document.getElementById("mobile-menu");
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const routes = {
  "/": [
    "Cresolab | Pharmaceutical Trading",
    "Cresolab Lifecare is a pharmaceutical trading business in Surat, India. Explore our product range and discuss your trade requirements.",
  ],
  "/products": [
    "Products | Cresolab",
    "Explore Cresolab’s pharmaceutical product range. Search by product, composition, dosage form, or therapeutic area and request trade information.",
  ],
  "/trading": [
    "How we work | Cresolab",
    "Share your pharmaceutical product requirements, discuss availability and commercial terms, and plan your next trade enquiry with Cresolab.",
  ],
  "/about": [
    "About us | Cresolab",
    "Get to know Cresolab Lifecare, a pharmaceutical trading business based in Surat, Gujarat, India.",
  ],
  "/contact": [
    "Trade enquiry | Cresolab",
    "Contact Cresolab in Surat to discuss product availability, quantities, pack sizes, and your pharmaceutical trading requirements.",
  ],
  "/privacy": [
    "Privacy & website notice | Cresolab",
    "Information about Cresolab’s enquiry drafts, product listings, and representative imagery.",
  ],
};
// Preserve existing shared links while retiring the former corporate sections.
const redirects = {
  "/quality": "/trading",
  "/rd": "/trading",
  "/global": "/trading",
  "/sustainability": "/about",
  "/careers": "/contact",
  "/news": "/trading",
};
const categories = [
  ["Tablets", "tablets"],
  ["Capsules", "capsules"],
  ["Syrups", "liquids"],
  ["Ointments", "topicals"],
  ["Injectables", "injectables"],
];
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const link = (href, label, variant = "") =>
  `<a class="button ${variant}" href="${escapeHTML(href)}">${label}${arrow}</a>`;
const textLink = (href, label) =>
  `<a class="text-link" href="${escapeHTML(href)}">${label}${arrow}</a>`;
const contactLink = (subject) =>
  "#/contact?subject=" + encodeURIComponent(subject);
const heading = (label, title, description) =>
  `<section class="page-heading"><div class="container"><span class="eyebrow">${label}</span><h1>${title}</h1><p class="lead">${description}</p></div></section>`;
const inlineCTA = () =>
  `<div class="container inline-cta"><div><h2>Have a product in mind?</h2><p>Tell us what you need. Let’s take it from there.</p></div>${textLink("#/contact", "Make a trade enquiry")}</div>`;
const steps = () =>
  `<ol class="steps"><li><span class="ordinal">01</span><div><h3>Share your requirement.</h3><p>Send the product name or composition, quantity, pack size, and delivery location.</p></div></li><li><span class="ordinal">02</span><div><h3>Discuss the options.</h3><p>Talk with our team about availability, pricing, and the product information you need.</p></div></li><li><span class="ordinal">03</span><div><h3>Agree on the details.</h3><p>Confirm product specifications, commercial terms, and the proposed supply timeline.</p></div></li></ol>`;
const productVisual = (product, interactive = true) => {
  const image = `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.imageAlt)}" width="900" height="900" loading="${interactive ? "lazy" : "eager"}" decoding="async">${product.imageRepresentative ? '<span class="product-image-caption">Representative image</span>' : ""}`;
  return interactive
    ? `<button class="product-visual" data-product="${escapeHTML(product.id)}" aria-label="View ${escapeHTML(product.name)} details">${image}</button>`
    : `<figure class="product-visual product-visual-detail">${image}</figure>`;
};

async function boot() {
  initInteractions();
  try {
    const responses = await Promise.all([
      fetch("./data/company.json"),
      fetch("./data/products.json"),
    ]);
    if (responses.some((r) => !r.ok)) throw new Error("Data unavailable");
    [company, products] = await Promise.all(responses.map((r) => r.json()));
  } catch (_) {
    company = window.CresolabFallbackCompany;
    products = window.CresolabFallbackProducts;
  }
  if (!company || !Array.isArray(products)) {
    main.innerHTML = heading(
      "Cresolab",
      "Let’s connect directly.",
      'Please email <a href="mailto:info@cresolab.com">info@cresolab.com</a> while the product range is unavailable.',
    );
    return;
  }
  document.getElementById("copyright-year").textContent =
    new Date().getFullYear();
  window.addEventListener("hashchange", () => renderRoute(true));
  renderRoute(false);
}
function initInteractions() {
  const trigger = document.querySelector(".menu-toggle");
  trigger.addEventListener("click", () => {
    menu.showModal();
    trigger.setAttribute("aria-expanded", "true");
  });
  document
    .querySelector(".menu-close")
    .addEventListener("click", () => menu.close());
  menu.addEventListener("close", () =>
    trigger.setAttribute("aria-expanded", "false"),
  );
  menu
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", () => menu.close()));
  document
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    const [path, query = ""] = location.hash.split("?");
    if (path !== "#/products") return;
    const params = new URLSearchParams(query);
    if (!params.has("id")) return;
    params.delete("id");
    history.replaceState(null, "", path + (params.size ? "?" + params : ""));
  });
  [dialog, menu].forEach((d) =>
    d.addEventListener("click", (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }),
  );
  document.querySelector(".skip-link").addEventListener("click", (e) => {
    e.preventDefault();
    main.focus();
    main.scrollIntoView();
  });
  main.addEventListener("click", (e) => {
    const explore = e.target.closest("[data-explore-range]");
    if (explore) {
      e.preventDefault();
      document
        .getElementById("product-range")
        .scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
    }
  });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    initReveals,
  );
}
function renderRoute(focus) {
  if (location.hash === "#main-content") {
    main.focus();
    return;
  }
  const [originalPath, query = ""] = (
    location.hash.replace(/^#+/, "") || "/"
  ).split("?");
  const path = redirects[originalPath] || originalPath;
  if (path !== originalPath)
    history.replaceState(null, "", "#" + path + (query ? "?" + query : ""));
  const params = new URLSearchParams(query);
  if (dialog.open) dialog.close();
  if (menu.open) menu.close();
  observer?.disconnect();
  clearTimeout(toastTimer);
  document.getElementById("toast").classList.remove("visible");
  const renderers = {
    "/": homeHTML,
    "/products": productsHTML,
    "/trading": tradingHTML,
    "/about": aboutHTML,
    "/contact": contactHTML,
    "/privacy": privacyHTML,
  };
  main.innerHTML = renderers[path]
    ? renderers[path](params)
    : heading(
        "Page not found",
        "Let’s find your way.",
        'Visit our <a href="#/products">product range</a> or <a href="#/">return home</a>.',
      );
  const [title, description] = routes[path] || [
    "Page not found | Cresolab",
    "Explore Cresolab’s pharmaceutical trading business.",
  ];
  document.title = title;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content =
    description;
  document
    .querySelectorAll(".desktop-nav a,.menu-dialog nav a,.header-enquiry")
    .forEach((a) => {
      if (a.getAttribute("href") === "#" + path)
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  if (path === "/products") bindProducts(params);
  if (path === "/contact") bindContact(params);
  initReveals();
  window.scrollTo({ top: 0, behavior: "instant" });
  if (focus) main.focus({ preventScroll: true });
}
function initReveals() {
  observer?.disconnect();
  main.classList.remove("motion-ready");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  main.classList.add("motion-ready");
  observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.06 },
  );
  main.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4000);
}
function homeHTML() {
  return `<section class="hero">
    <img class="hero-image" src="./assets/images/products/capsules.webp" width="900" height="900" alt="Representative pharmaceutical capsule pack" fetchpriority="high">
    <div class="container hero-inner"><span class="eyebrow">Pharmaceutical trading · Surat, India</span><h1 class="hero-brand" aria-label="Cresolab Lifecare — pharmaceutical trading"><img src="./assets/brand/cresolab-logo.png" width="1230" height="405" alt="Cresolab Lifecare Pvt Ltd"></h1><h2 class="hero-headline">Pharma trading,<br><span class="serif">with a personal touch.</span></h2><p class="hero-description">A focused product range. A direct conversation.<br>Let’s find what your business needs.</p><div class="hero-actions">${link("#/products", "Explore products")}${textLink("#/contact", "Talk to us")}</div></div>
    <div class="container hero-bottom"><a href="#product-range" data-explore-range>Discover the range <span aria-hidden="true">↓</span></a><span>Representative product imagery</span></div>
  </section>
  <section class="section" id="product-range"><div class="container"><div class="section-head reveal"><div><span class="eyebrow">Our products</span><h2>A focused range.<br><span class="serif">For your everyday requirements.</span></h2></div>${textLink("#/products", "View all products")}</div><div class="range-grid">${categories.map(([category, image]) => `<a class="range-item reveal" href="#/products?category=${encodeURIComponent(category)}"><div class="range-image"><img src="./assets/images/products/${image}.webp" alt="Representative ${category.toLowerCase()} packaging" width="900" height="900" loading="lazy"></div><div class="range-label"><span>${category}</span>${arrow}</div></a>`).join("")}</div><p class="range-caption">Representative packaging shown. Contact us for current product and pack details.</p></div></section>
  <section class="section approach-section"><div class="container approach-layout"><div class="approach-intro reveal"><span class="eyebrow">A straightforward approach</span><h2>Less back and forth.<br><span class="serif">More clarity.</span></h2><p>From a first enquiry to an agreed requirement, our trading conversations start with the details that matter to your business.</p>${textLink("#/trading", "How we work")}</div><div class="reveal">${steps()}</div></div></section>`;
}
function productsHTML() {
  return (
    heading(
      "Product range",
      'Find your next<br><span class="serif">product.</span>',
      "Browse by dosage form or search for a product or composition. Ask our team about current availability and trade terms.",
    ) +
    `<section class="section catalog-section"><div class="container"><div class="catalog-toolbar"><div class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg><input id="catalog-search" type="search" placeholder="Search product or composition" aria-label="Search product or composition"></div><select id="segment-filter" aria-label="Therapeutic area"><option value="All">All therapeutic areas</option>${[
      ...new Set(products.map((p) => p.therapeuticSegment)),
    ]
      .sort()
      .map((s) => `<option>${escapeHTML(s)}</option>`)
      .join(
        "",
      )}</select><button id="download-catalog" class="download-button">Download product list ↓</button></div><div class="catalog-filters" role="group" aria-label="Dosage form">${["All", ...categories.map((c) => c[0])].map((c) => `<button class="filter-button" data-category="${c}" aria-pressed="false">${c === "All" ? "All products" : c}</button>`).join("")}<div class="catalog-meta"><span id="results-count" role="status" aria-live="polite"></span><button class="clear-button" id="clear-filters">Reset filters</button></div></div><div class="products-grid" id="products-grid"></div><p class="catalog-notice">For business enquiries. Availability, specifications, pack sizes, and applicable product authorisations are confirmed for each enquiry. Product listings are not prescribing information.</p></div></section>${inlineCTA()}`
  );
}
function bindProducts(params) {
  const search = document.getElementById("catalog-search"),
    segment = document.getElementById("segment-filter");
  let category = params.get("category") || "All";
  if (!["All", ...categories.map((c) => c[0])].includes(category))
    category = "All";
  search.value = params.get("q") || "";
  segment.value = params.get("segment") || "All";
  if (!segment.value) segment.value = "All";
  function update(syncURL = true) {
    const q = search.value.trim().toLowerCase();
    const result = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (segment.value === "All" || p.therapeuticSegment === segment.value) &&
        (!q ||
          [p.name, p.generic, p.therapeuticSegment].some((v) =>
            v.toLowerCase().includes(q),
          )),
    );
    document
      .querySelectorAll(".filter-button")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.category === category)),
      );
    document.getElementById("results-count").textContent =
      `${result.length} ${result.length === 1 ? "product" : "products"}`;
    document.getElementById("products-grid").innerHTML = result.length
      ? result
          .map(
            (p) =>
              `<article class="product-card">${productVisual(p)}<div class="product-meta"><span>${escapeHTML(p.category)}</span><span>${escapeHTML(p.therapeuticSegment)}</span></div><h2>${escapeHTML(p.name)}</h2><p class="generic">${escapeHTML(p.generic)}</p><p class="strength">${escapeHTML(p.strength)}</p><button class="text-link" data-product="${escapeHTML(p.id)}">View details ${arrow}</button></article>`,
          )
          .join("")
      : `<div class="empty-state"><h2>No products found.</h2><p>Try a different search or clear your filters.</p><button id="empty-reset" class="button button-outline">Reset filters</button></div>`;
    document
      .querySelectorAll("[data-product]")
      .forEach((b) =>
        b.addEventListener("click", () => openProduct(b.dataset.product)),
      );
    document.getElementById("empty-reset")?.addEventListener("click", reset);
    if (syncURL) {
      const next = new URLSearchParams();
      if (category !== "All") next.set("category", category);
      if (segment.value !== "All") next.set("segment", segment.value);
      if (search.value) next.set("q", search.value);
      history.replaceState(
        null,
        "",
        "#/products" + (next.size ? "?" + next : ""),
      );
    }
  }
  function reset() {
    category = "All";
    search.value = "";
    segment.value = "All";
    update();
  }
  document.querySelectorAll(".filter-button").forEach((b) =>
    b.addEventListener("click", () => {
      category = b.dataset.category;
      update();
    }),
  );
  search.addEventListener("input", () => update());
  segment.addEventListener("change", () => update());
  document.getElementById("clear-filters").addEventListener("click", reset);
  document
    .getElementById("download-catalog")
    .addEventListener("click", downloadCatalog);
  update(false);
  if (params.has("id")) openProduct(params.get("id"));
}
function openProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  dialogContent.innerHTML = `${productVisual(p, false)}<span class="eyebrow">${escapeHTML(p.category)} · Product details</span><h2 id="dialog-title">${escapeHTML(p.name)}</h2><p class="dialog-generic">${escapeHTML(p.generic)}</p><dl class="detail-list"><div><dt>Strength</dt><dd>${escapeHTML(p.strength)}</dd></div><div><dt>Therapeutic area</dt><dd>${escapeHTML(p.therapeuticSegment)}</dd></div><div><dt>Listed pack</dt><dd>${escapeHTML(p.packaging)}</dd></div></dl><p class="form-note">Ask our team about availability, pack details, quantities, and trade pricing.</p>${link(contactLink("Product enquiry: " + p.name + " — " + p.generic), "Enquire about this product")}`;
  dialog.showModal();
}
function downloadCatalog() {
  const cell = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
  const rows = [
    ["Cresolab Lifecare — pharmaceutical trading"],
    [
      "Availability, specifications, pack sizes, and applicable product authorisations require confirmation.",
    ],
    [],
    [
      "Product",
      "Composition",
      "Dosage form",
      "Therapeutic area",
      "Listed strength",
      "Listed packaging",
    ],
    ...products.map((p) => [
      p.name,
      p.generic,
      p.category,
      p.therapeuticSegment,
      p.strength,
      p.packaging,
    ]),
  ];
  const blob = new Blob(
    ["\ufeff" + rows.map((r) => r.map(cell).join(",")).join("\r\n")],
    { type: "text/csv;charset=utf-8;" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "Cresolab-product-list.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Product list downloaded.");
}
function tradingHTML() {
  return (
    heading(
      "How we work",
      'Your requirement.<br><span class="serif">Our starting point.</span>',
      "We focus on pharmaceutical trading, with clear communication around products, availability, and commercial terms.",
    ) +
    `<section class="section"><div class="container approach-layout"><div class="approach-intro reveal"><span class="eyebrow">From enquiry to next steps</span><h2>Trade begins with<br>a good conversation.</h2><p>Whether you have a specific product in mind or a list to discuss, a few details help us understand your requirements.</p>${textLink("#/contact", "Send your requirement")}</div><div class="reveal">${steps()}</div></div></section><section class="section quiet-section"><div class="container faq-layout"><div><span class="eyebrow">Useful to know</span><h2>A little clarity,<br><span class="serif">before we begin.</span></h2></div><div class="faq-list"><details><summary>What should I include in an enquiry?</summary><p>The product name or composition, strength, preferred pack size, quantity, delivery location, and your business contact details. Include any specific documentation requirements.</p></details><details><summary>Can I ask about a product outside the list?</summary><p>Yes. Share the composition, dosage form, strength, and quantity you need. Our team can discuss whether we can help with your requirement.</p></details><details><summary>Where can I find prices and minimum quantities?</summary><p>Contact us with your product and quantity. Pricing, minimum order quantities, availability, and timelines are discussed for each enquiry.</p></details><details><summary>Can I request product documentation?</summary><p>Include the product and the documents you need in your enquiry. Our team will confirm the information available for that product.</p></details></div></div></section>${inlineCTA()}`
  );
}
function aboutHTML() {
  return (
    heading(
      "About Cresolab",
      'A focused business.<br><span class="serif">A personal approach.</span>',
      "Cresolab Lifecare is a pharmaceutical trading business based in Surat, Gujarat, India.",
    ) +
    `<section class="section"><div class="container statement"><span class="eyebrow reveal">Products. People. Partnerships.</span><div class="prose reveal"><p class="about-line">We believe a good trade relationship starts with understanding what your business needs.</p><p>Our focus is on pharmaceutical products and the conversations that make trading straightforward: the right composition, the right pack, and clear commercial expectations.</p><p>Browse our range or bring us your requirement. We welcome enquiries from pharmaceutical trade businesses and distribution partners.</p>${textLink("#/contact", "Get in touch")}</div></div></section><section class="section quiet-section"><div class="container facts"><div class="reveal"><span class="eyebrow">Our business</span><h2>Pharmaceutical trading</h2><p>A product-focused approach to business enquiries and supply discussions.</p></div><div class="reveal"><span class="eyebrow">Our base</span><h2>Surat, Gujarat</h2><p>A direct point of contact for your trading requirements.</p></div><div class="reveal"><span class="eyebrow">Our approach</span><h2>Clear & personal</h2><p>Understand the requirement. Discuss the details. Agree on the next step.</p></div></div></section>`
  );
}
function contactHTML(params) {
  const subject = params.get("subject") || "";
  return (
    heading(
      "Trade enquiry",
      'What are you<br><span class="serif">looking for?</span>',
      "Send us your product requirement or start with a conversation.",
    ) +
    `<section class="section"><div class="container contact-layout"><aside class="contact-aside"><div class="contact-block"><span class="eyebrow">Email us</span><a href="mailto:${escapeHTML(company.contact.email)}">${escapeHTML(company.contact.email)} ↗</a><p>For product and business enquiries.</p></div><div class="contact-block"><span class="eyebrow">Call us</span><a href="tel:${escapeHTML(company.contact.phone.replace(/\s/g, ""))}">${escapeHTML(company.contact.phone)} ↗</a></div><div class="contact-block"><span class="eyebrow">Find us</span><p>${escapeHTML(company.contact.address)}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.contact.address)}" target="_blank" rel="noopener noreferrer">View location ${arrow}</a></div><p class="contact-intro-note">A useful brief includes the product or composition, quantity, pack size, and delivery location.</p></aside><form class="contact-form" id="contact-form">${subject ? `<p class="inquiry-context"><strong>Regarding:</strong> ${escapeHTML(subject)}</p>` : ""}<div class="form-grid"><div class="form-field full"><label for="form-name">Your name *</label><input id="form-name" name="name" autocomplete="name" required maxlength="120" placeholder="Full name"></div><div class="form-field full"><label for="form-company">Business name</label><input id="form-company" name="company" autocomplete="organization" maxlength="180" placeholder="Company or organisation"></div><div class="form-field"><label for="form-email">Email *</label><input id="form-email" name="email" type="email" autocomplete="email" required maxlength="180" placeholder="you@company.com"></div><div class="form-field"><label for="form-phone">Phone</label><input id="form-phone" name="phone" type="tel" autocomplete="tel" maxlength="50" placeholder="Include country code"></div><div class="form-field full"><label for="form-message">Your requirement *</label><textarea id="form-message" name="message" required maxlength="3000" placeholder="Product, quantity, preferred pack, and delivery location">${subject ? escapeHTML("I would like to enquire about " + subject.replace(/^Product enquiry: /, "") + ".\n\nQuantity: \nPreferred pack: \nDelivery location: ") : ""}</textarea></div><div class="form-field full"><p class="form-note">This form prepares an email for you to review and send in your email app. <a href="#/privacy">Privacy notice</a></p></div><div class="form-field full"><button class="button" type="submit">Prepare enquiry ${arrow}</button></div></div><section class="draft-panel" id="draft-panel" hidden aria-labelledby="draft-title" tabindex="-1"><h2 id="draft-title">Your enquiry, ready to review.</h2><p class="form-note">Nothing has been sent yet. Open the draft in your email app to send it, or copy the text.</p><pre id="draft-preview"></pre><div class="draft-actions"><a class="button" id="open-email" href="mailto:info@cresolab.com">Open email draft ${arrow}</a><button class="button button-outline" type="button" id="copy-draft">Copy enquiry</button></div></section></form></div></section>`
  );
}
function bindContact(params) {
  const form = document.getElementById("contact-form"),
    panel = document.getElementById("draft-panel");
  const context = params.get("subject") || "";
  let draft = "";
  form.addEventListener("input", () => {
    panel.hidden = true;
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (!data.name.trim() || !data.message.trim()) {
      toast("Please enter your name and requirement.");
      return;
    }
    const subject = context || "Trade enquiry — Cresolab";
    const recipient = company.contact.emailInquiry;
    const body = `Hello Cresolab team,\n\n${data.message.trim()}\n\nName: ${data.name.trim()}\nBusiness: ${data.company.trim() || "Not specified"}\nEmail: ${data.email}\nPhone: ${data.phone.trim() || "Not specified"}\n`;
    draft = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
    document.getElementById("draft-preview").textContent = draft;
    document.getElementById("open-email").href =
      `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    panel.hidden = false;
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
  });
  document.getElementById("copy-draft").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draft);
      toast("Enquiry copied.");
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("draft-preview"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      toast("Copy the highlighted enquiry text.");
    }
  });
}
function privacyHTML() {
  return (
    heading(
      "Website notice",
      'A few useful<br><span class="serif">details.</span>',
      "How this website handles your enquiry and presents product information.",
    ) +
    `<section class="section"><div class="container statement"><span class="eyebrow">Privacy & information</span><div class="prose"><h2>Your enquiry</h2><p>The form creates an email draft in your browser. It does not submit your details to a server or confirm delivery. Opening the draft passes it to your email application; you decide whether to send it. Please avoid including patient information or sensitive personal details.</p><h2>Website data</h2><p>This website uses no analytics, advertising trackers, or cookies. Hosting providers may process standard request logs. Email and map links open external services with their own privacy practices.</p><h2>Product information</h2><p>The product range is for business enquiries. Confirm availability, composition, strength, packaging, and applicable product authorisations with our team. These listings are not medical or prescribing advice.</p><h2>Product images</h2><p>Pack photographs are representative, AI-generated images. They do not show actual branded packaging. Request current product and pack information from our team.</p><h2>Contact</h2><p>For website or business questions, email <a href="mailto:${escapeHTML(company.contact.email)}">${escapeHTML(company.contact.email)}</a>.</p></div></div></section>`
  );
}
boot();
