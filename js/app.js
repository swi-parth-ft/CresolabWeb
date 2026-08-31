/* Cresolab: dependency-free rendering, accessible navigation, and honest inquiries. */
"use strict";
let company, products, observer, toastTimer;
const main = document.getElementById("main-content");
const dialog = document.getElementById("detail-dialog");
const dialogContent = document.getElementById("dialog-content");
const menu = document.getElementById("mobile-menu");
const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
const navLabels = {
  "/": "Home",
  "/about": "Company",
  "/products": "Products",
  "/quality": "Manufacturing & quality",
  "/rd": "Research & development",
  "/global": "Global partnerships",
  "/sustainability": "Responsibility",
  "/careers": "Careers",
  "/news": "Insights",
  "/contact": "Contact",
  "/privacy": "Privacy & website notice",
};
const descriptions = {
  "/": "Explore Cresolab’s pharmaceutical formulation portfolio, manufacturing focus, and business partnership opportunities in Surat, India.",
  "/about":
    "Learn about Cresolab’s focus on pharmaceutical formulations and business partnerships from Surat, India.",
  "/products":
    "Browse Cresolab’s product portfolio by dosage form, therapeutic area, brand name, and generic composition.",
  "/quality":
    "Discuss pharmaceutical manufacturing scope, quality documentation, and technical requirements with Cresolab.",
  "/rd":
    "Explore formulation development discussions, analytical requirements, scale-up, and technology transfer.",
  "/global":
    "Start a product and market-specific pharmaceutical partnership conversation with Cresolab.",
  "/sustainability":
    "Explore responsible manufacturing priorities: resource use, people, and accountable business practices.",
  "/careers":
    "Connect with Cresolab about future opportunities in pharmaceutical science, quality, and operations.",
  "/news":
    "Read practical pharmaceutical manufacturing, quality, and regulatory explainers with authoritative sources.",
  "/contact":
    "Prepare a pharmaceutical business inquiry for the Cresolab team in Surat, Gujarat.",
  "/privacy":
    "How this website handles inquiry drafts, local preferences, and product information.",
};
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
const asset = (name, alt, cls = "", eager = false) =>
  `<img src="./assets/images/${name}.webp" alt="${alt}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const productVisual = (product, interactive = true) => {
  const picture = `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.imageAlt)}" width="1024" height="1024" loading="${interactive ? "lazy" : "eager"}" decoding="async">${product.imageRepresentative ? '<span class="product-image-caption">Representative image</span>' : ""}`;
  return interactive
    ? `<button class="product-visual" data-product="${escapeHTML(product.id)}" aria-label="View ${escapeHTML(product.name)} product image and details">${picture}</button>`
    : `<figure class="product-visual product-visual-detail">${picture}</figure>`;
};
const crumb = (label) =>
  `<div class="breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span>${label}</span></div>`;
const pageHero = (eyebrow, title, lead, aside = "") =>
  `<section class="page-hero"><div class="container">${crumb(eyebrow)}<div class="${aside ? "page-hero-grid" : ""}"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p class="lead">${lead}</p></div>${aside ? `<div class="hero-aside">${aside}</div>` : ""}</div></div></section>`;
const cta = (
  title = "A better conversation.<br>A stronger partnership.",
  label = "Discuss your requirements",
) =>
  `<section class="cta-band"><div class="container cta-inner"><div><span class="eyebrow">Let’s take the next step</span><h2>${title}</h2></div>${link("#/contact", label)}</div></section>`;
const resourceCard = (r) =>
  `<article class="resource-card reveal"><span class="resource-category">${escapeHTML(r.category)} · Perspective</span><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.summary)}</p><a class="text-link" href="#/news?id=${encodeURIComponent(r.id)}">Read perspective${arrow}</a></article>`;
const processList = (items) =>
  `<ol class="process-list">${items.map((x, i) => `<li><span class="ordinal">0${i + 1}</span><div><h3>${x[0]}</h3><p>${x[1]}</p></div></li>`).join("")}</ol>`;
const values = (items) =>
  `<div class="value-grid">${items.map((x, i) => `<article class="value-item reveal"><span class="ordinal">0${i + 1}</span><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</div>`;
const faq = (items) =>
  `<div class="faq-list">${items.map((x) => `<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join("")}</div>`;

async function boot() {
  initGlobalInteractions();
  try {
    const responses = await Promise.all([
      fetch("./data/company.json"),
      fetch("./data/products.json"),
    ]);
    if (responses.some((r) => !r.ok)) throw new Error("Data unavailable");
    [company, products] = await Promise.all(responses.map((r) => r.json()));
  } catch (error) {
    company = window.CresolabFallbackCompany;
    products = window.CresolabFallbackProducts;
  }
  if (!company || !Array.isArray(products)) {
    main.innerHTML = pageHero(
      "Cresolab",
      "We could not load this page.",
      "Please reload or contact info@cresolab.com for assistance.",
    );
    return;
  }
  document.getElementById("copyright-year").textContent =
    new Date().getFullYear();
  window.addEventListener("hashchange", () => renderRoute(true));
  renderRoute(false);
}
function initGlobalInteractions() {
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    initReveals,
  );
  const themeButton = document.querySelector(".theme-toggle");
  const updateThemeLabel = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    themeButton.setAttribute(
      "aria-label",
      `Switch to ${dark ? "light" : "dark"} theme`,
    );
    themeButton.title = `Switch to ${dark ? "light" : "dark"} theme`;
  };
  updateThemeLabel();
  themeButton.addEventListener("click", () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("cresolab-theme", theme);
    } catch (e) {}
    updateThemeLabel();
  });
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
    // Closing a deep-linked detail restores the listing URL so it can reopen.
    const [path, query = ""] = location.hash.split("?");
    if (path !== "#/news" && path !== "#/products") return;
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
}
function renderRoute(focus) {
  if (location.hash === "#main-content") {
    main.focus();
    return;
  }
  const raw = location.hash.replace(/^#+/, "") || "/";
  const [path, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  if (dialog.open) dialog.close();
  if (menu.open) menu.close();
  observer?.disconnect();
  const renderers = {
    "/": homeHTML,
    "/about": aboutHTML,
    "/products": productsHTML,
    "/quality": qualityHTML,
    "/rd": researchHTML,
    "/global": globalHTML,
    "/sustainability": responsibilityHTML,
    "/careers": careersHTML,
    "/news": newsHTML,
    "/contact": contactHTML,
    "/privacy": privacyHTML,
  };
  main.innerHTML = renderers[path]
    ? renderers[path](params)
    : pageHero(
        "Page not found",
        "Let’s get you<br>back on track.",
        "The page you requested could not be found.",
      ) +
      `<section class="section"><div class="container">${link("#/", "Return to home")}</div></section>`;
  const title =
    path === "/"
      ? "Cresolab | Pharmaceutical Formulations & Manufacturing"
      : `${navLabels[path] || "Page not found"} | Cresolab`;
  document.title = title;
  document.querySelector('meta[name="description"]').content =
    descriptions[path] || "Explore Cresolab.";
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content =
    descriptions[path] || "Explore Cresolab.";
  document
    .querySelectorAll(".desktop-nav a,.menu-dialog nav a")
    .forEach((a) => {
      if (a.getAttribute("href") === "#" + path)
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  if (path === "/products") bindProducts(params);
  if (path === "/contact") bindContact(params);
  if (path === "/news") bindNews(params);
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
    { threshold: 0.08 },
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
    ${asset("manufacturing", "Representative pharmaceutical manufacturing environment", "hero-image", true)}
    <div class="container hero-inner"><span class="eyebrow">Pharmaceutical formulations · India</span><h1>cresolab<span>.</span></h1><p class="hero-headline">Precision in science.<br><span class="serif">Purpose in healthcare.</span></p><p class="hero-description">Formulations, manufacturing, and a shared commitment to moving healthcare forward.</p><div class="hero-actions">${link("#/products", "Explore our portfolio", "button-light")}${link("#/contact", "Partner with us", "button-white-outline")}</div></div>
    <div class="container hero-bottom"><a href="#our-focus" id="explore-focus">Discover our focus <span aria-hidden="true">↓</span></a><span class="hero-caption">Representative manufacturing imagery</span></div>
  </section>
  <section class="section" id="our-focus"><div class="container intro-layout"><span class="eyebrow reveal">A considered approach to healthcare</span><div class="reveal"><h2>Good partnerships begin with<br><span class="serif">a clear understanding.</span></h2><div class="intro-bottom"><p>From a product brief to a manufacturing conversation, we bring focus to what matters: the formulation, the quality requirements, and the people behind every decision.</p>${textLink("#/about", "Get to know Cresolab")}</div></div></div></section>
  <section class="section surface"><div class="container"><div class="section-head"><div><span class="eyebrow">Our focus</span><h2>Science. Manufacturing.<br><span class="serif">Working together.</span></h2></div><p>A practical starting point for pharmaceutical businesses, distributors, and development partners.</p></div><div class="capabilities-grid">
    <article class="capability reveal"><span class="ordinal">01</span><h3>Formulation<br>portfolio</h3><p>Explore dosage forms and therapeutic categories, with product information organized for technical and commercial review.</p>${textLink("#/products", "Explore products")}</article>
    <article class="capability reveal"><span class="ordinal">02</span><h3>Manufacturing<br>& quality</h3><p>Define the production scope, documentation, packaging, and quality expectations for your next project.</p>${textLink("#/quality", "Our manufacturing focus")}</article>
    <article class="capability reveal"><span class="ordinal">03</span><h3>Development<br>& collaboration</h3><p>Start a discussion about formulation requirements, analytical needs, scale-up, and your intended market.</p>${textLink("#/rd", "Explore development")}</article>
  </div></div></section>
  <section class="quality-feature"><div class="quality-photo">${asset("quality", "Representative analytical scientist at work")}<span class="photo-caption">Representative laboratory imagery</span></div><div class="quality-copy reveal"><span class="eyebrow">Quality, considered at every step</span><h2>Confidence comes<br>from <span class="serif">the details.</span></h2><p>A meaningful quality conversation goes beyond a badge. It starts with a defined manufacturing scope and the right documentation for the product, site, and market.</p><ul class="quality-list"><li>Product & process requirements <span>01</span></li><li>Quality documentation <span>02</span></li><li>Market-specific review <span>03</span></li></ul>${link("#/quality", "Explore quality & manufacturing", "button-white-outline")}</div></section>
  <section class="section"><div class="container"><div class="section-head"><div><span class="eyebrow">Product portfolio</span><h2>Different forms.<br><span class="serif">One focused conversation.</span></h2></div>${textLink("#/products", "View the full portfolio")}</div><div class="portfolio-links">${[
    ["Tablets", "Solid oral formulations"],
    ["Capsules", "Capsule-based formulations"],
    ["Syrups", "Oral liquids & suspensions"],
    ["Ointments", "Topical preparations"],
    ["Injectables", "Injectable presentations"],
  ]
    .map(
      (x, i) =>
        `<a class="portfolio-link reveal" href="#/products?category=${x[0]}"><span class="ordinal">0${i + 1}</span><h3>${x[0]}</h3><p>${x[1]}</p><span class="link-arrow" aria-hidden="true">↗</span></a>`,
    )
    .join(
      "",
    )}</div><p class="catalog-notice">Portfolio information is for business evaluation. Confirm current availability, specifications, manufacturing scope, and local registration requirements with our team.</p></div></section>
  <section class="section partnership-band"><div class="container partnership-layout"><div class="reveal"><span class="eyebrow">Built around your requirements</span><h2>A local conversation.<br><span class="serif">A wider perspective.</span></h2><p>Based in Surat, Gujarat, Cresolab welcomes conversations with pharmaceutical businesses and distribution partners in India and international markets.</p>${textLink("#/global", "Explore partnership opportunities")}</div><div class="reveal">${processList(
    [
      [
        "Share your brief",
        "Tell us the product, dosage form, target market, and expected volume.",
      ],
      [
        "Align the requirements",
        "Discuss the technical scope, documentation, packaging, and commercial needs.",
      ],
      [
        "Define the next step",
        "Establish a clear path for review, feasibility, and a project-specific response.",
      ],
    ],
  )}</div></div></section>
  <section class="section"><div class="container"><div class="section-head"><div><span class="eyebrow">Perspectives</span><h2>Clarity for <span class="serif">better decisions.</span></h2></div>${textLink("#/news", "All insights")}</div><div class="resources-grid">${company.resources.map(resourceCard).join("")}</div></div></section>${cta()}`;
}
function aboutHTML() {
  return (
    pageHero(
      "Our company",
      'Science with purpose.<br><span class="serif">Partnerships with possibility.</span>',
      "Cresolab brings a focused approach to pharmaceutical formulations and business collaboration from Surat, Gujarat.",
    ) +
    `<section class="section"><div class="container editorial-grid"><div class="reveal"><span class="eyebrow">The Cresolab approach</span><h2 style="margin-top:20px">A clear brief.<br>A shared direction.</h2></div><div class="prose reveal"><p>Every pharmaceutical partnership begins with an understanding of the product and the people it is intended to serve. We make room for the technical details, commercial priorities, and market requirements that shape a project.</p><p>Our website brings together formulation information and the questions that matter when exploring a manufacturing relationship. It is a starting point for a considered discussion with our team—not a substitute for product-specific technical or regulatory review.</p>${textLink("#/contact", "Start a conversation")}</div></div></section>
 <figure class="wide-figure">${asset("manufacturing", "Representative pharmaceutical production environment")}<figcaption>Representative manufacturing imagery</figcaption></figure>
 <section class="section"><div class="container"><div class="section-head"><div><span class="eyebrow">What guides the conversation</span><h2>Thoughtful in approach.<br><span class="serif">Clear in our priorities.</span></h2></div></div>${values(
   [
     [
       "Product understanding",
       "Begin with dosage form, composition, strength, presentation, and the needs of the intended market.",
     ],
     [
       "Quality dialogue",
       "Connect the product brief to relevant documentation, responsibilities, and technical requirements.",
     ],
     [
       "Open collaboration",
       "Establish realistic expectations and a practical next step for each business inquiry.",
     ],
   ],
 )}</div></section>${cta()}`
  );
}
function qualityHTML() {
  return (
    pageHero(
      "Manufacturing & quality",
      'Every detail matters.<br><span class="serif">From brief to batch.</span>',
      "Start with a defined manufacturing scope. Build the conversation around product requirements, process controls, and quality documentation.",
    ) +
    `<section class="section"><div class="container split-detail"><div class="reveal"><span class="eyebrow">Manufacturing discussions</span><h2>Built around the<br>dosage form.</h2><p>Different presentations require different process, packaging, and control strategies. Our portfolio provides a starting point; the actual manufacturing scope must be confirmed for each project.</p><dl class="detail-list"><div><dt>Oral solids</dt><dd>Tablets and capsules: discuss composition, release profile, batch requirements, and pack formats.</dd></div><div><dt>Oral liquids & topicals</dt><dd>Discuss formulation characteristics, filling, primary packaging, and stability requirements.</dd></div><div><dt>Injectable presentations</dt><dd>Confirm the applicable manufacturing site, sterile processing scope, and product authorization before proceeding.</dd></div></dl></div><figure style="margin:0;position:relative">${asset("manufacturing", "Representative stainless steel pharmaceutical manufacturing equipment")}<figcaption class="photo-caption">Representative imagery</figcaption></figure></div></section>
 <section class="section surface"><div class="container"><div class="section-head"><div><span class="eyebrow">A documentation-led approach</span><h2>Ask the right questions.<br><span class="serif">Review the right evidence.</span></h2></div><p>Quality should be discussed at the product and site level, with clear responsibilities and current records.</p></div>${values(
   [
     [
       "Manufacturing scope",
       "Review the site, dosage form, licensed activities, and relevant approvals for the proposed product.",
     ],
     [
       "Quality arrangements",
       "Discuss specifications, testing, batch release responsibilities, change control, and complaint handling.",
     ],
     [
       "Technical documentation",
       "Identify which product specifications, stability information, and supporting documents apply to your project.",
     ],
   ],
 )}<p class="note">Certificates and approvals are specific to their scope and issuing authority. Request current documentation for your product and destination market. No certification or market authorization is implied by this website.</p></div></section>
 <section class="section"><div class="container editorial-grid"><div><span class="eyebrow">Before we begin</span><h2 style="margin-top:20px">Useful questions.<br>Clearer answers.</h2></div>${faq(
   [
     [
       "Can I request quality and regulatory documents?",
       "Yes. Include the product, intended market, and the documents you need in your inquiry. Availability and scope will need to be confirmed by the team.",
     ],
     [
       "Does the portfolio confirm local product approval?",
       "No. A portfolio listing is business information. Product registration and supply requirements must be assessed for the destination market.",
     ],
     [
       "Can you confirm production capacity or lead times?",
       "Capacity, minimum order quantities, pack formats, and timelines depend on the specific product and project. Please share your expected volume and schedule.",
     ],
   ],
 )}</div></section>${cta("Let’s discuss the details.", "Send a technical inquiry")}`
  );
}
function researchHTML() {
  return (
    pageHero(
      "Research & development",
      'From a clear question<br>to a <span class="serif">considered formulation.</span>',
      "A development conversation connects product goals with formulation, analytical, and manufacturing requirements.",
    ) +
    `<section class="section"><div class="container editorial-grid"><div><span class="eyebrow">Formulation development</span><h2 style="margin-top:20px">Define the challenge.<br>Explore the approach.</h2></div><div class="prose"><p>Share your target dosage form, intended strength, release characteristics, and market. These details help frame the scientific and commercial questions that should be addressed before a development plan is agreed.</p><p>Development scope, testing requirements, timelines, and regulatory pathways are project-specific. Contact our team to discuss feasibility and the information required for a technical assessment.</p></div></div></section>
 <section class="quality-feature"><div class="quality-photo">${asset("quality", "Representative scientist reviewing a laboratory sample")}<span class="photo-caption">Representative laboratory imagery</span></div><div class="quality-copy reveal"><span class="eyebrow">The questions behind the formulation</span><h2>Purposeful science.<br><span class="serif">Practical decisions.</span></h2><ul class="quality-list"><li>Target product profile <span>01</span></li><li>Formulation & excipient considerations <span>02</span></li><li>Analytical & stability requirements <span>03</span></li><li>Scale-up & transfer considerations <span>04</span></li></ul>${link(contactLink("Formulation development discussion"), "Discuss a development brief", "button-white-outline")}</div></section>
 <section class="section"><div class="container"><div class="section-head"><div><span class="eyebrow">A framework for discussion</span><h2>A clear path to<br><span class="serif">the next decision.</span></h2></div></div><div class="steps-grid">${[
   [
     "Define",
     "Describe the product objective, dosage form, and destination market.",
   ],
   [
     "Assess",
     "Review the technical brief and identify information needed for feasibility.",
   ],
   [
     "Plan",
     "Align on scope, documentation, responsibilities, and expected milestones.",
   ],
   [
     "Review",
     "Evaluate the agreed work against the project’s technical requirements.",
   ],
 ]
   .map(
     (x, i) =>
       `<article class="step reveal"><span class="ordinal">0${i + 1}</span><h3>${x[0]}</h3><p>${x[1]}</p></article>`,
   )
   .join(
     "",
   )}</div><p class="note">This is a discussion framework, not an announcement of clinical trials or an active product development pipeline.</p></div></section>${cta()}`
  );
}
function globalHTML() {
  return (
    pageHero(
      "Global partnerships",
      'Different markets.<br><span class="serif">A shared understanding.</span>',
      "Bring us your product brief and destination market. We will help structure the conversation around the requirements that matter.",
    ) +
    `<section class="section"><div class="container partnership-layout"><div><span class="eyebrow">International business</span><h2>Start with the market.<br>Work through the details.</h2><p>A successful export discussion begins with local registration requirements, product scope, documentation, and commercial expectations.</p>${textLink(contactLink("International business inquiry"), "Discuss your market")}</div>${processList(
      [
        [
          "Product & presentation",
          "Specify the formulation, strength, pack size, and expected order volume.",
        ],
        [
          "Market & documentation",
          "Identify the country, registration pathway, and documentation requested by your regulatory team.",
        ],
        [
          "Supply & commercial terms",
          "Discuss the proposed schedule, logistics needs, and responsibilities before making commitments.",
        ],
      ],
    )}</div></section>
 <section class="section surface"><div class="container"><div class="section-head"><div><span class="eyebrow">Ways to work together</span><h2>A partnership shaped<br><span class="serif">around your business.</span></h2></div></div>${values(
   [
     [
       "Distribution inquiries",
       "Explore product and presentation requirements for your distribution business and intended territory.",
     ],
     [
       "Manufacturing discussions",
       "Share your formulation, packaging, volume, and schedule for a project-specific conversation.",
     ],
     [
       "Regulatory coordination",
       "Clarify the documents, technical inputs, and local responsibilities required for your market.",
     ],
   ],
 )}<p class="note">No country-specific approval, registration, or supply capability is implied. These must be confirmed for the product, site, and destination.</p></div></section>${cta("Where do you want<br>to take the conversation?", "Contact international business")}`
  );
}
function responsibilityHTML() {
  return (
    pageHero(
      "Responsibility",
      'Better healthcare.<br><span class="serif">A wider responsibility.</span>',
      "Responsible manufacturing considers the resources we use, the people involved, and the standards that guide business decisions.",
    ) +
    `<section class="section"><div class="container editorial-grid"><div><span class="eyebrow">A responsible perspective</span><h2 style="margin-top:20px">Consider the impact.<br>Ask for the evidence.</h2></div><div class="prose"><p>Environmental and social questions belong in a manufacturing partnership alongside product and commercial requirements. They help establish a more complete understanding of a proposed supply relationship.</p><p>We welcome questions about site-specific practices and documentation. Please contact our team for information relevant to your supplier assessment.</p></div></div></section>
 <section class="section surface"><div class="container">${values([
   [
     "Resources & environment",
     "Discuss water use, waste handling, energy requirements, and the environmental controls relevant to the proposed site.",
   ],
   [
     "People & safe work",
     "Ask about personnel training, occupational safety, responsibilities, and the working practices supporting operations.",
   ],
   [
     "Accountable partnerships",
     "Define expectations around documentation, communication, business conduct, and supplier review.",
   ],
 ])}<p class="note">Quantified environmental performance and sustainability certifications should be supported by current records. This page does not make numerical impact or certification claims.</p></div></section>${cta("Let’s build a more<br>considered partnership.", "Talk to our team")}`
  );
}
function careersHTML() {
  return (
    pageHero(
      "Careers",
      'Bring your perspective.<br><span class="serif">Build what comes next.</span>',
      "Interested in pharmaceutical science, quality, or operations? Tell us about your experience and the work you want to do.",
    ) +
    `<section class="section"><div class="container editorial-grid"><div><span class="eyebrow">Connect with Cresolab</span><h2 style="margin-top:20px">People behind<br>the progress.</h2><p style="margin-top:22px">Based in Surat, Gujarat.</p></div><div><p style="margin-bottom:30px">We welcome expressions of interest in the areas below. These are areas of work, not confirmed open vacancies. Our team can advise on current opportunities.</p>${[
      [
        "Quality & regulatory",
        "Analytical thinking, documentation, and a disciplined approach to quality.",
      ],
      [
        "Formulation & research",
        "Curiosity about dosage forms, development questions, and scientific problem-solving.",
      ],
      [
        "Manufacturing & operations",
        "Practical thinking across production, planning, packaging, and supply.",
      ],
    ]
      .map(
        (x) =>
          `<div class="career-row"><div><h3>${x[0]}</h3><p>${x[1]}</p></div>${textLink(contactLink("Career interest: " + x[0]), "Express interest")}</div>`,
      )
      .join(
        "",
      )}<p class="note">Please do not include identification documents, financial details, or sensitive personal information in an initial inquiry. A résumé can be attached in your email application.</p></div></div></section>${cta("Your next conversation<br>could start here.", "Get in touch")}`
  );
}
function productsHTML() {
  return (
    pageHero(
      "Product portfolio",
      'Explore the<br><span class="serif">formulation portfolio.</span>',
      "Find products by dosage form, therapeutic area, brand, or generic name. Request current specifications and availability from our team.",
      `<span class="eyebrow">For business evaluation</span><p>${products.length} listed formulations.<br>Product and market details require confirmation.</p>`,
    ) +
    `<section class="section"><div class="container"><div class="catalog-toolbar"><div class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg><input id="catalog-search" type="search" placeholder="Search brand or generic name" aria-label="Search product portfolio"></div><button id="download-catalog" class="button button-outline">Download product list <span aria-hidden="true">↓</span></button></div><div class="catalog-layout"><aside class="catalog-filters" aria-label="Product filters"><span class="filter-label">Dosage form</span><div class="filter-list">${["All", ...new Set(products.map((p) => p.category))].map((c) => `<button class="filter-button" data-category="${escapeHTML(c)}" aria-pressed="false">${c === "All" ? "All products" : escapeHTML(c)}<span>${c === "All" ? products.length : products.filter((p) => p.category === c).length}</span></button>`).join("")}</div><label class="filter-label" for="segment-filter">Therapeutic area</label><select id="segment-filter"><option value="All">All therapeutic areas</option>${[
      ...new Set(products.map((p) => p.therapeuticSegment)),
    ]
      .sort()
      .map((s) => `<option>${escapeHTML(s)}</option>`)
      .join(
        "",
      )}</select></aside><div><div class="catalog-meta"><span id="results-count" role="status" aria-live="polite"></span><button class="clear-button" id="clear-filters">Reset filters</button></div><div class="products-grid" id="products-grid"></div><p class="catalog-notice">This portfolio is for business information only. It does not establish product approval, current availability, or suitability for an individual patient. Request confirmed specifications and approved product information. Always consult a qualified healthcare professional for medical advice.</p></div></div></div></section>${cta("Have a formulation<br>in mind?", "Discuss your requirements")}`
  );
}
function bindProducts(params) {
  const search = document.getElementById("catalog-search"),
    segment = document.getElementById("segment-filter");
  let category = params.get("category") || "All";
  if (!["All", ...products.map((p) => p.category)].includes(category))
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
      `${result.length} ${result.length === 1 ? "formulation" : "formulations"} found`;
    document.getElementById("products-grid").innerHTML = result.length
      ? result
          .map(
            (p) =>
              `<article class="product-card">${productVisual(p)}<div class="product-meta"><span>${escapeHTML(p.category)}</span><span>${escapeHTML(p.therapeuticSegment)}</span></div><h2>${escapeHTML(p.name)}</h2><p class="generic">${escapeHTML(p.generic)}</p><p class="strength">${escapeHTML(p.strength)}</p><button class="text-link" data-product="${escapeHTML(p.id)}">Product details ${arrow}</button></article>`,
          )
          .join("")
      : `<div class="empty-state"><h2>No matching formulations.</h2><p>Try another keyword or reset the filters.</p><button id="empty-reset" class="button button-outline">Reset filters</button></div>`;
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
        `#/products${next.size ? "?" + next.toString() : ""}`,
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
  if (params.has("id")) {
    const p = products.find((p) => p.id === params.get("id"));
    if (p) openProduct(p.id);
  }
}
function openProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  dialogContent.innerHTML = `${productVisual(p, false)}<span class="eyebrow">${escapeHTML(p.category)} · Product information</span><h2 id="dialog-title">${escapeHTML(p.name)}</h2><p class="dialog-generic">${escapeHTML(p.generic)}</p><dl class="detail-list"><div><dt>Listed strength</dt><dd>${escapeHTML(p.strength)}</dd></div><div><dt>Therapeutic area</dt><dd>${escapeHTML(p.therapeuticSegment)}</dd></div><div><dt>Listed packaging</dt><dd>${escapeHTML(p.packaging)}</dd></div></dl><p>Contact our team for current availability, confirmed specifications, pack options, and the documentation relevant to your market.</p><p class="note">Business information only. This listing does not provide prescribing advice or establish market authorization.</p><div class="dialog-actions">${link(contactLink("Product inquiry: " + p.name + " — " + p.generic), "Inquire about this product")}</div>`;
  dialog.showModal();
}
function downloadCatalog() {
  const cell = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
  const rows = [
    ["Cresolab product portfolio — business information only"],
    [
      "Availability, specifications, manufacturing scope, and market authorization require confirmation.",
    ],
    [],
    [
      "Product",
      "Generic",
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
  a.download = "Cresolab-product-portfolio.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Product list downloaded.");
}
function newsHTML() {
  return (
    pageHero(
      "Insights",
      'A clearer perspective<br>on <span class="serif">pharmaceutical partnerships.</span>',
      "Practical introductions to quality, manufacturing, and documentation—with links to authoritative sources.",
    ) +
    `<section class="section"><div class="container"><div class="resource-filter" aria-label="Filter insights">${["All", "Quality", "Regulatory", "Manufacturing"].map((c) => `<button data-resource-category="${c}" aria-pressed="${c === "All"}">${c === "All" ? "All perspectives" : c}</button>`).join("")}</div><div class="resources-grid" id="resources-grid">${company.resources.map(resourceCard).join("")}</div><p class="note">These are general educational perspectives, not company announcements, regulatory advice, or claims about Cresolab’s approvals. Consult the applicable authority and qualified advisers for your project.</p></div></section>${cta()}`
  );
}
function bindNews(params) {
  document.querySelectorAll("[data-resource-category]").forEach((b) =>
    b.addEventListener("click", () => {
      document
        .querySelectorAll("[data-resource-category]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const category = b.dataset.resourceCategory;
      document.getElementById("resources-grid").innerHTML = company.resources
        .filter((r) => category === "All" || r.category === category)
        .map(resourceCard)
        .join("");
      initReveals();
    }),
  );
  const r = company.resources.find((r) => r.id === params.get("id"));
  if (r) {
    dialogContent.innerHTML = `<span class="eyebrow">${escapeHTML(r.category)} · Perspective</span><h2 id="dialog-title">${escapeHTML(r.title)}</h2><p style="margin:22px 0 28px">${escapeHTML(r.summary)}</p><div class="article-body">${r.body.map((p) => `<p>${escapeHTML(p)}</p>`).join("")}</div><a class="source-link" href="${escapeHTML(r.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source: ${escapeHTML(r.sourceTitle)} ↗</a><p class="note">General business information. Not product-specific medical or regulatory advice.</p>`;
    dialog.showModal();
  }
}
function contactHTML(params) {
  const subject = params.get("subject") || "";
  return (
    pageHero(
      "Contact",
      'Your next step<br>starts with <span class="serif">a conversation.</span>',
      "Tell us what you are working on. A clear product brief helps us understand how to take the discussion forward.",
    ) +
    `<section class="section"><div class="container contact-layout"><form class="contact-form" id="contact-form"><h2>Tell us about your requirements.</h2><p>Complete the details below to prepare an email draft for our team.</p>${subject ? `<div class="inquiry-context"><strong>Regarding:</strong> ${escapeHTML(subject)}</div>` : ""}<div class="form-grid"><div class="form-field"><label for="form-name">Full name *</label><input id="form-name" name="name" autocomplete="name" required maxlength="120" placeholder="Your full name"></div><div class="form-field"><label for="form-company">Company / organization</label><input id="form-company" name="company" autocomplete="organization" maxlength="180" placeholder="Your organization"></div><div class="form-field"><label for="form-email">Email address *</label><input id="form-email" name="email" type="email" autocomplete="email" required maxlength="180" placeholder="you@company.com"></div><div class="form-field"><label for="form-phone">Phone number</label><input id="form-phone" name="phone" type="tel" autocomplete="tel" maxlength="50" placeholder="Include country code"></div><div class="form-field"><label for="form-topic">Inquiry type *</label><select id="form-topic" name="topic" required><option value="">Select an inquiry type</option><option>Product &amp; distribution</option><option>Manufacturing</option><option>Research & development</option><option>International business</option><option>Quality documentation</option><option>Careers</option><option>General inquiry</option></select></div><div class="form-field"><label for="form-market">Destination market</label><input id="form-market" name="market" maxlength="120" placeholder="Country or region"></div><div class="form-field full"><label for="form-message">Your requirements *</label><textarea id="form-message" name="message" required maxlength="3000" placeholder="Include the product, dosage form, expected volume, packaging, and any documents you need.">${subject ? escapeHTML("I would like to discuss " + subject + ".") : ""}</textarea></div><div class="form-field full"><p class="form-note">Your details stay in this browser until you choose to open and send the email in your email app. Please do not include patient information or sensitive personal data. <a href="#/privacy" style="text-decoration:underline">Privacy notice</a></p></div><div class="form-field full form-actions"><button class="button" type="submit">Prepare email draft ${arrow}</button></div></div><section class="draft-panel" id="draft-panel" hidden aria-labelledby="draft-title" tabindex="-1"><h3 id="draft-title">Your inquiry is ready to review.</h3><p class="form-note">Nothing has been sent. Open this draft in your email app and send it when you are ready, or copy the text.</p><pre id="draft-preview"></pre><div class="dialog-actions"><a class="button" id="open-email" href="mailto:info@cresolab.com">Open email draft ${arrow}</a><button class="button button-outline" type="button" id="copy-draft">Copy inquiry</button></div></section></form><aside class="contact-aside"><span class="eyebrow">Cresolab · Surat, India</span><h2>Let’s connect.</h2><div class="contact-block"><h3>General inquiries</h3><a href="mailto:${escapeHTML(company.contact.email)}">${escapeHTML(company.contact.email)} ↗</a><p style="margin-top:8px"><a href="tel:${company.contact.phone.replace(/\s/g, "")}">${escapeHTML(company.contact.phone)}</a></p></div><div class="contact-block"><h3>Business & international</h3><a href="mailto:${escapeHTML(company.contact.emailInquiry)}">${escapeHTML(company.contact.emailInquiry)} ↗</a><br><a href="mailto:${escapeHTML(company.contact.emailExport)}">${escapeHTML(company.contact.emailExport)} ↗</a></div><div class="contact-block"><h3>Visit by appointment</h3><p>${escapeHTML(company.contact.address)}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.contact.address)}" target="_blank" rel="noopener noreferrer">View location ${arrow}</a></div><div class="contact-block"><h3>A useful first brief</h3><p>Product & dosage form<br>Destination market<br>Expected order volume<br>Packaging & documentation</p></div></aside></div></section>`
  );
}
function bindContact(params) {
  const form = document.getElementById("contact-form"),
    panel = document.getElementById("draft-panel"),
    topic = document.getElementById("form-topic");
  const context = params.get("subject") || "";
  topic.value = /career/i.test(context)
    ? "Careers"
    : /development/i.test(context)
      ? "Research & development"
      : /international/i.test(context)
        ? "International business"
        : /product inquiry/i.test(context)
          ? "Product & distribution"
          : "";
  let draft = "";
  form.addEventListener("input", () => {
    panel.hidden = true;
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (!data.name.trim() || !data.message.trim()) {
      toast("Please enter your name and requirements.");
      return;
    }
    const subject = context || `Cresolab inquiry — ${data.topic}`;
    const recipient =
      data.topic === "International business"
        ? company.contact.emailExport
        : data.topic === "Careers" || data.topic === "General inquiry"
          ? company.contact.email
          : company.contact.emailInquiry;
    draft = `To: ${recipient}\nSubject: ${subject}\n\nHello Cresolab team,\n\n${data.message.trim()}\n\nName: ${data.name.trim()}\nCompany: ${data.company.trim() || "Not specified"}\nEmail: ${data.email}\nPhone: ${data.phone.trim() || "Not specified"}\nInquiry type: ${data.topic}\nDestination market: ${data.market.trim() || "Not specified"}\n`;
    document.getElementById("draft-preview").textContent = draft;
    document.getElementById("open-email").href =
      `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft.slice(draft.indexOf("Hello Cresolab team,")))}`;
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
      toast("Inquiry copied. Paste it into your email app.");
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("draft-preview"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      toast("Select and copy the highlighted inquiry text.");
    }
  });
}
function privacyHTML() {
  return (
    pageHero(
      "Website notice",
      'Clear information.<br><span class="serif">Considered use.</span>',
      "How this website handles inquiry drafts, preferences, and product information.",
    ) +
    `<section class="section"><div class="container prose"><h2>Inquiry drafts</h2><p>The inquiry form prepares a draft in your browser. This website does not submit the form to a server or confirm email delivery. Choosing “Open email draft” passes the draft to your configured email application. You decide whether to send it.</p><h2>Local preferences</h2><p>The light or dark theme preference is stored in your browser’s local storage. No analytics or advertising scripts are included in this site. Your hosting provider may separately process standard request logs.</p><h2>External services</h2><p>Email, map, and reference links open external services with their own privacy practices. Contact details submitted by email are handled outside this website.</p><h2>Product information</h2><p>Portfolio entries are for business evaluation, not medical advice. Listed specifications, packaging, availability, manufacturing scope, and destination-market authorizations must be confirmed. For treatment decisions, consult a qualified healthcare professional and the applicable approved product information.</p><h2>Imagery & company information</h2><p>Manufacturing, laboratory, and product-pack images are representative, AI-generated visuals. They do not depict verified Cresolab facilities, personnel, or actual product packaging. Current company, site, and regulatory documentation should be requested directly from the team.</p><h2>Questions</h2><p>Contact <a href="mailto:info@cresolab.com">info@cresolab.com</a> for website or business inquiries.</p></div></section>`
  );
}
// Scroll within the home page without replacing the hash-based route.
main.addEventListener("click", (e) => {
  const a = e.target.closest("#explore-focus");
  if (a) {
    e.preventDefault();
    document.getElementById("our-focus").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
});
boot();
