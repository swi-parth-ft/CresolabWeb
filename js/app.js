/* ==========================================================================
   CRESOLAB WEB ENGINE - ROUTING, RENDERING & DYNAMIC ACTIONS
   ========================================================================== */

// Global state cache
let companyData = null;
let productsData = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Visual Theme
  initTheme();
  
  // Set up header interactions (mobile menu, theme toggler)
  initHeaderInteractions();
  
  // Load data layer
  try {
    const [companyRes, productsRes] = await Promise.all([
      fetch('./data/company.json'),
      fetch('./data/products.json')
    ]);
    
    companyData = await companyRes.json();
    productsData = await productsRes.json();
  } catch (error) {
    console.warn("CORS or Network Fetch blocked: falling back to local database layer.", error);
    companyData = window.CresolabFallbackCompany || null;
    productsData = window.CresolabFallbackProducts || null;
  }
  
  // Inject dynamic global content (footer details, headers, etc)
  injectGlobalContent();
  
  // Initialize Modal Interactions globally (backdrop click, escape, close X click)
  initModalInteractions();
  
  // Initialize Router
  initRouter();
  
  // Handle Scroll Progress Bar & Header Shrinking
  window.addEventListener('scroll', handleScrollProgress);
  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll(); // execute once on load
});

function handleHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}


/* --- MODAL INTERACTIONS MANAGEMENT --- */
function initModalInteractions() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  
  // Click outside backdrop to close
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
      && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
    if (!isInDialog) {
      modal.close();
    }
  });
  
  // Close X button click listener
  const closeBtn = modal.querySelector('#modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.close();
    });
  }
}

/* --- THEME MANAGEMENT --- */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateThemeIcons(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateThemeIcons(false);
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
  
  // Notify user briefly
  showToast(`${isDark ? 'Dark' : 'Light'} theme activated`, "success");
}

function updateThemeIcons(isDark) {
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  if (sunIcon && moonIcon) {
    if (isDark) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }
}

/* --- HEADER & DRAWER INTERACTIONS --- */
function initHeaderInteractions() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  
  const menuBtn = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close');
  const drawerOverlay = document.getElementById('drawer-overlay');
  
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      openDrawer(drawer, menuBtn);
    });
  }
  
  if (drawerCloseBtn && drawer) {
    drawerCloseBtn.addEventListener('click', () => {
      closeDrawer(drawer, menuBtn);
    });
  }
  
  if (drawerOverlay && drawer) {
    drawerOverlay.addEventListener('click', () => {
      closeDrawer(drawer, menuBtn);
    });
  }

  // Handle ESC key to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer(drawer, menuBtn);
    }
  });
}

function openDrawer(drawer, trigger) {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  trigger.setAttribute('aria-expanded', 'true');
  
  // Set other elements as inert for accessibility focus trap
  document.getElementById('app').setAttribute('inert', '');
  document.querySelector('.site-footer').setAttribute('inert', '');
}

function closeDrawer(drawer, trigger) {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  
  document.getElementById('app').removeAttribute('inert');
  document.querySelector('.site-footer').removeAttribute('inert');
}

/* --- SCROLL REVEALS & PROGRESS --- */
function handleScrollProgress() {
  const scrollBar = document.getElementById('scroll-progress');
  if (!scrollBar) return;
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
  scrollBar.style.width = scrolled + "%";
}

function initScrollObserver() {
  const reveals = document.querySelectorAll('.reveal');
  
  // Return early if prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('active'));
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });
  
  reveals.forEach(el => observer.observe(el));
}

/* --- INJECT STATIC META & GLOBAL CONTENT --- */
function injectGlobalContent() {
  if (!companyData) return;
  
  // Footer tag line
  const footerTagline = document.getElementById('footer-tagline');
  if (footerTagline) footerTagline.textContent = companyData.tagline;
  
  // Footer contact details
  const footerContact = document.getElementById('footer-contact-info');
  if (footerContact) {
    footerContact.innerHTML = `
      <li>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${companyData.contact.address}</span>
      </li>
      <li>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <a href="tel:${companyData.contact.phone.replace(/\s+/g, '')}">${companyData.contact.phone}</a>
      </li>
      <li>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <a href="mailto:${companyData.contact.email}">${companyData.contact.email}</a>
      </li>
    `;
  }
  
  // Footer disclaimers & copyrights
  const footerDisclaimer = document.getElementById('footer-legal-disclaimer');
  if (footerDisclaimer) footerDisclaimer.textContent = companyData.legal.disclaimer;
  
  const footerCopyright = document.getElementById('footer-copyright');
  if (footerCopyright) footerCopyright.textContent = companyData.legal.copyright;
  
  // Set up mobile drawer contact info
  const drawerLocation = document.querySelector('.drawer-location');
  if (drawerLocation) drawerLocation.textContent = "Surat, Gujarat, India";
  
  const drawerPhone = document.querySelector('.drawer-phone');
  if (drawerPhone) {
    drawerPhone.innerHTML = `<a href="tel:${companyData.contact.phone.replace(/\s+/g, '')}">${companyData.contact.phone}</a>`;
  }
}

/* --- CLIENT ROUTER --- */
function initRouter() {
  const handleRouting = () => {
    const hash = window.location.hash || '#/';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    
    // Smooth transition between views
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.style.opacity = '0';
      appEl.style.transform = 'translateY(10px)';
      appEl.style.transition = 'opacity 0.2s, transform 0.2s';
    }
    
    setTimeout(() => {
      if (appEl) {
        try {
          renderView(path, params);
        } catch (err) {
          console.error("Routing Render Error:", err);
          appEl.innerHTML = `
            <section class="container" style="padding: 100px 24px; text-align: center;">
              <h2 style="font-size: 2rem; color: var(--error); margin-block-end: 16px;">❖ Navigation Display Error</h2>
              <p style="color: var(--text-secondary); max-width: 600px; margin-inline: auto; margin-block-end: 32px;">
                An issue occurred while loading this section of the website. The formulation registry logs have recorded this incident.
              </p>
              <pre style="background-color: var(--bg-secondary); padding: 16px; border-radius: var(--radius-sm); font-size: 0.85rem; max-width: 500px; margin-inline: auto; margin-block-end: 32px; border: 1px solid var(--border-color); overflow-x: auto; color: var(--text-primary); text-align: left;">${err.stack || err}</pre>
              <a href="#/" class="btn btn-primary">Return to Homepage</a>
            </section>
          `;
        }
        
        appEl.style.opacity = '1';
        appEl.style.transform = 'translateY(0)';
      }
      
      // Update Navigation active styles
      try {
        updateActiveLinks(path);
      } catch (err) {
        console.warn("Could not update navigation styles:", err);
      }
      
      // Scroll to top of viewport
      window.scrollTo(0, 0);
      
      // Re-trigger scroll reveal observers
      try {
        initScrollObserver();
      } catch (err) {
        console.warn("Could not initialize scroll observer:", err);
      }
      
      // Close mobile drawer on route change
      try {
        const drawer = document.getElementById('mobile-drawer');
        const menuBtn = document.getElementById('menu-toggle');
        if (drawer && drawer.classList.contains('open')) {
          closeDrawer(drawer, menuBtn);
        }
      } catch (err) {
        console.warn("Could not auto-close mobile drawer:", err);
      }
    }, 200);
  };

  window.addEventListener('hashchange', handleRouting);
  // Initial load
  handleRouting();
}

function updateActiveLinks(path) {
  const activeRoute = path.replace('#', '') || '/';
  
  // Desktop
  document.querySelectorAll('.desktop-nav .nav-link').forEach(link => {
    const route = link.getAttribute('href').replace('#', '') || '/';
    if (route === activeRoute || (activeRoute.startsWith('/products') && route === '/products')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile Drawer
  document.querySelectorAll('.drawer-nav .drawer-link').forEach(link => {
    const route = link.getAttribute('href').replace('#', '') || '/';
    if (route === activeRoute || (activeRoute.startsWith('/products') && route === '/products')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function renderView(path, params) {
  const appEl = document.getElementById('app');
  
  if (path === '#/' || path === '') {
    appEl.innerHTML = getHomeHTML();
    bindHomeEvents();
  } else if (path === '#/about') {
    appEl.innerHTML = getAboutHTML();
    bindAboutEvents();
  } else if (path === '#/products') {
    appEl.innerHTML = getProductsHTML(params);
    bindProductsEvents(params);
  } else if (path === '#/rd') {
    appEl.innerHTML = getRDHTML();
  } else if (path === '#/quality') {
    appEl.innerHTML = getQualityHTML();
  } else if (path === '#/global') {
    appEl.innerHTML = getGlobalHTML();
  } else if (path === '#/sustainability') {
    appEl.innerHTML = getSustainabilityHTML();
  } else if (path === '#/careers') {
    appEl.innerHTML = getCareersHTML();
    bindCareersEvents();
  } else if (path === '#/news') {
    appEl.innerHTML = getNewsHTML(params);
    bindNewsEvents(params);
  } else if (path === '#/contact') {
    appEl.innerHTML = getContactHTML(params);
    bindContactEvents();
  } else {
    // 404 Fallback
    appEl.innerHTML = `
      <section class="container" style="padding: 100px 24px; text-align: center;">
        <h1 style="font-size: 5rem; color: var(--accent-primary);">404</h1>
        <p style="font-size: 1.25rem; margin-block: 20px 40px; color: var(--text-secondary);">The requested pharmaceutical section could not be found.</p>
        <a href="#/" class="btn btn-primary">Return to Homepage</a>
      </section>
    `;
  }
}

/* --- ABSTRACT PRODUCT THUMBNAIL GENERATOR --- */
// Generates a responsive CSS grid thumbnail using hues and styles based on segment.
// This fulfills the 'abstract placeholder images for products' request.
function getProductPlaceholderHTML(product) {
  // Vibrant gradients based on therapeutic segment (colored placeholders as requested)
  const hues = {
    'Cardiovascular': [200, 220],
    'Anti-Diabetic': [135, 155],
    'Antibiotics': [275, 295],
    'Gastrointestinal': [15, 35],
    'Respiratory': [185, 205],
    'Analgesic': [340, 360],
    'Neurology': [245, 265],
    'Endocrinology': [80, 100],
    'default': [160, 180]
  };
  
  const segment = product.therapeuticSegment || 'default';
  const [h1, h2] = hues[segment] || hues['default'];
  
  return `
    <div class="abstract-product-thumb" style="background: linear-gradient(135deg, hsl(${h1}, 70%, 35%), hsl(${h2}, 80%, 20%)); border: 1px solid var(--border-color);">
      <div class="grid-overlay"></div>
      <div class="molecular-nodes">
        <span class="node" style="top: 15%; left: 20%; width: 10px; height: 10px; background-color: hsl(${h1}, 100%, 75%); opacity: 0.6; box-shadow: 0 0 10px hsl(${h1}, 100%, 75%);"></span>
        <span class="node" style="top: 25%; left: 55%; width: 6px; height: 6px; background-color: hsl(${h2}, 100%, 85%); opacity: 0.7; box-shadow: 0 0 8px hsl(${h2}, 100%, 85%);"></span>
        <span class="node" style="top: 65%; left: 35%; width: 12px; height: 12px; background-color: hsl(${h1}, 100%, 70%); opacity: 0.6; box-shadow: 0 0 12px hsl(${h1}, 100%, 70%);"></span>
        <span class="node" style="top: 50%; left: 75%; width: 8px; height: 8px; background-color: hsl(${h2}, 100%, 80%); opacity: 0.7; box-shadow: 0 0 10px hsl(${h2}, 100%, 80%);"></span>
      </div>
      <div class="thumb-lettermark" style="color: rgba(255, 255, 255, 0.12);">${product.name.substring(0, 2).toUpperCase()}</div>
      <div class="thumb-segment-label" style="color: #ffffff; background-color: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);">${product.therapeuticSegment.toUpperCase()}</div>
    </div>
  `;
}

/* --- HTML TEMPLATES --- */

// 1. HOME VIEW
function getHomeHTML() {
  if (!companyData || !productsData) return '';
  
  // Featured products cards
  const featuredProducts = productsData.filter(p => p.featured);
  let featuredCardsHTML = '';
  
  featuredProducts.forEach(p => {
    featuredCardsHTML += `
      <article class="product-card reveal">
        ${getProductPlaceholderHTML(p)}
        <div class="product-badge-row">
          <span class="prod-badge category">${p.category}</span>
          <span class="prod-badge segment">${p.therapeuticSegment}</span>
        </div>
        <h3>${p.name}</h3>
        <p class="product-generic">${p.generic}</p>
        <div>
          <span class="product-strength">${p.strength}</span>
        </div>
        <p class="product-desc">${p.description}</p>
        <div class="product-action-row">
          <button class="btn btn-secondary btn-card open-detail-btn" data-id="${p.id}">View Formula Details</button>
        </div>
      </article>
    `;
  });

  return `
    <!-- Hero Block -->
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-content">
          <div class="hero-tag">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>${companyData.certifications[0].title}</span>
          </div>
          <h1 class="hero-headline">Pioneering <span class="gradient-text">Therapeutics</span>.<br>Enhancing Life.</h1>
          <p class="hero-subheadline">${companyData.about.summary}</p>
          <ul class="hero-bullets" style="margin-block-end: 36px; list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 0.95rem; color: var(--text-primary);">
            <li><span style="color: var(--accent-primary); margin-right: 8px;">✦</span> <strong>WHO-GMP Certified</strong>: World-class oral solid dosage and liquid block manufacturing in Surat, Gujarat.</li>
            <li><span style="color: var(--accent-primary); margin-right: 8px;">❖</span> <strong>Active R&D Pipelines</strong>: Bioequivalence and accelerated stability studies (ICH Zone IVb).</li>
            <li><span style="color: var(--accent-primary); margin-right: 8px;">◌</span> <strong>Global Export Footprint</strong>: Formulations registered and exported to over 30 countries.</li>
          </ul>
          <div class="hero-actions">
            <a href="#/products" class="btn btn-primary">Browse Formulations</a>
            <a href="#/contact" class="btn btn-secondary">Business Inquiry</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-decor"></div>
          <div class="hero-image-wrapper">
            <img src="./assets/hero-lab.png" alt="Cresolab Laboratory visual placeholder" class="hero-img" loading="eager" fetchpriority="high">
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="stats-section">
      <div class="container stats-grid">
        ${companyData.stats.map(s => `
          <div class="stat-card">
            <div class="stat-number">${s.value}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Therapeutic Segments -->
    <section class="home-segments">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Therapeutic Capabilities</span>
          <h2 class="section-title">Global Medical Solutions</h2>
          <p class="section-subtitle">We design and manufacture formulations addressing critical therapeutic segments to make quality healthcare accessible globally.</p>
        </div>
        
        <div class="segments-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;">
          <div class="segment-card reveal">
            <div class="segment-icon-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h3>Cardiology</h3>
            <p>Advanced molecules like Cresol-AM engineered for long-term hypertension and ischemic heart diseases management. Formulated for high bioavailability.</p>
          </div>

          <div class="segment-card reveal">
            <div class="segment-icon-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="16"></line>
              </svg>
            </div>
            <h3>Diabetology</h3>
            <p>Combination oral anti-diabetics for stable glycemic regulation, designed with prolonged release kinetics and minimal gastric distress side effects.</p>
          </div>

          <div class="segment-card reveal">
            <div class="segment-icon-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="19.07" y1="4.93" x2="14.83" y2="9.17"></line>
                <line x1="9.17" y1="14.83" x2="4.93" y2="19.07"></line>
              </svg>
            </div>
            <h3>Infectious Diseases</h3>
            <p>High-potency antibiotics spanning third-generation cephalosporins, penicillins, and beta-lactamase inhibitors to combat community-acquired resistance.</p>
          </div>

          <div class="segment-card reveal">
            <div class="segment-icon-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3>Gastroenterology</h3>
            <p>Proton pump inhibitors and prokinetic formulations providing relief from ulcers, acid reflux, and hyperacidity under stable delayed-release forms.</p>
          </div>
          
          <div class="segment-card reveal">
            <div class="segment-icon-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Respiratory & Pulmonology</h3>
            <p>Liquid expectorants, bronchodilators, and mucolytics formulated for rapid systemic absorption, supporting pediatric and geriatric airway care.</p>
          </div>

          <div class="segment-card reveal">
            <div class="segment-icon-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h3>Analgesics & Neurology</h3>
            <p>Advanced NSAIDs and vitamin-neuropathy therapies formulated for chronic pain management, skeletal inflammation, and peripheral nerve protection.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Featured Catalog</span>
          <h2 class="section-title">Flagship Formulations</h2>
          <p class="section-subtitle">A showcase of our premium formulation solutions engineered for stability, purity, and clinical efficacy.</p>
        </div>
        
        <div class="featured-grid">
          ${featuredCardsHTML}
        </div>
        
        <div class="home-cta-center reveal">
          <a href="#/products" class="btn btn-primary">Explore All Formulations</a>
        </div>
      </div>
    </section>

    <!-- Advanced Quality & Lab Operations Section -->
    <section class="home-quality-deep" style="padding-block: 80px 100px; background-color: var(--bg-secondary); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
      <div class="container reveal">
        <div class="section-header" style="text-align: left; margin-block-end: 48px;">
          <span class="section-tag">Analytical Integrity</span>
          <h2 class="section-title">Scientific Validation & Quality Safeguards</h2>
          <p class="section-subtitle" style="margin-inline: 0; max-width: 720px;">Cresolab operates a highly controlled WHO-GMP facility in Surat, Gujarat. We integrate rigorous chemical and microbiological monitoring across the entire lifecycle of each batch.</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; margin-block-end: 48px;">
          <div>
            <h3 style="font-size: 1.3rem; margin-block-end: 16px; font-weight: 600;">❖ Chromatography & Molecular Assays</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">Our Quality Control labs are equipped with computerized High-Performance Liquid Chromatography (HPLC) and UV-Vis spectrophotometers. We perform precise quantitative assays on raw API inputs and finished solids to verify that chemical purity levels match pharmacopoeial (IP/BP/USP) specifications with zero deviations.</p>
          </div>
          <div>
            <h3 style="font-size: 1.3rem; margin-block-end: 16px; font-weight: 600;">◌ HVAC Cleanroom Management</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">Manufacturing blocks feature high-velocity air handling units (AHUs) with terminal HEPA filtration. This establishes differential pressure zones that completely prevent cross-contamination between product runs, maintaining Class 100,000 (ISO Class 8) cleanliness during compaction and filling.</p>
          </div>
        </div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 40px;">
          <ul style="list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; font-size: 0.9rem; color: var(--text-secondary);">
            <li><span style="color: var(--accent-primary); margin-right: 8px; font-weight: bold;">✦</span> <strong>Dissolution Assays</strong>: Automated dissolution testing ensures predictable in-vivo drug release kinetics.</li>
            <li><span style="color: var(--accent-primary); margin-right: 8px; font-weight: bold;">❖</span> <strong>Microbiology Audits</strong>: Continuous sterile surveillance of water loops and environmental swap controls.</li>
            <li><span style="color: var(--accent-primary); margin-right: 8px; font-weight: bold;">◌</span> <strong>ICH Stability</strong>: Stability chambers monitor accelerated shelf-life decomposition for zone IVb (hot/humid) markets.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- R&D Showcase block -->
    <section class="home-rnd-feature">
      <div class="container feature-split">
        <div class="feature-content reveal">
          <span class="section-tag">R&D and Facility</span>
          <h2>${companyData.rnd.title}</h2>
          <p>${companyData.rnd.description}</p>
          <ul class="feature-list">
            ${companyData.rnd.focusAreas.map(fa => `
              <li>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${fa}</span>
              </li>
            `).join('')}
          </ul>
          <div style="margin-top: 24px;">
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">Our research teams focus on Novel Drug Delivery Systems (NDDS) to improve patient compliance, including sustained-release matrix tablets and organoleptically optimized pediatric drops. We maintain extensive stability testing files ready for international dossier audit.</p>
          </div>
          <a href="#/quality" class="btn btn-secondary" style="margin-top: 36px;">Explore Facility</a>
        </div>
        <div class="feature-image-wrapper reveal">
          <img src="./assets/quality-control.png" alt="R&D molecular representation" loading="lazy">
        </div>
      </div>
    </section>

    <!-- Environmental & Ecological Care section -->
    <section class="home-ecological-stewardship" style="padding-block: 80px 100px; background-color: var(--bg-primary); border-top: 1px solid var(--border-color);">
      <div class="container reveal">
        <div class="section-header" style="text-align: left; margin-block-end: 48px;">
          <span class="section-tag">Responsible Therapeutics</span>
          <h2 class="section-title">Environmental Engineering & ESG Stewardship</h2>
          <p class="section-subtitle" style="margin-inline: 0; max-width: 720px;">We believe that healing lives should not harm the planet. Cresolab actively implements green manufacturing processes directly inside GIDC Sachin, Surat.</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; margin-block-end: 48px;">
          <div>
            <h3 style="font-size: 1.3rem; margin-block-end: 16px; font-weight: 600;">▫ Solar Grid Energy</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">Our facility rooftop holds a custom 250kW solar panel grid. This renewable source offsets roughly 45% of our oral solids block's peak electrical requirements, substantially reducing carbon output during batch runs.</p>
          </div>
          <div>
            <h3 style="font-size: 1.3rem; margin-block-end: 16px; font-weight: 600;">▪ Zero Liquid Discharge</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">We run a fully audited Zero Liquid Discharge (ZLD) purification system. Chemical rinse water is neutralized, filtered via multi-stage reverse osmosis, and recycled on-site, ensuring no chemical runoff exits our Surat boundary.</p>
          </div>
        </div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 40px;">
          <ul style="list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; font-size: 0.9rem; color: var(--text-secondary);">
            <li><span style="color: var(--accent-primary); margin-right: 8px; font-weight: bold;">◌</span> <strong>Solvent Recovery</strong>: Fractional distillation columns recover and purify chemical solvents for closed-loop safety.</li>
            <li><span style="color: var(--accent-primary); margin-right: 8px; font-weight: bold;">❖</span> <strong>Carbon Neutral Target</strong>: Committed to reducing greenhouse gas emissions across boilers by 30% by 2030.</li>
            <li><span style="color: var(--accent-primary); margin-right: 8px; font-weight: bold;">✦</span> <strong>Community Health</strong>: Providing clean medical supplies and free checkups to municipal areas near Surat.</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

function bindHomeEvents() {
  document.querySelectorAll('.open-detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      openProductModal(id);
    });
  });
}

function bindAboutEvents() {
  // scroll reveals are handled by the router globally
}

// 2. ABOUT US VIEW
function getAboutHTML() {
  if (!companyData) return '';
  return `
    <section class="about-hero">
      <div class="container">
        <div class="section-header" style="text-align: left; margin-block-end: 0;">
          <span class="section-tag">Who We Are</span>
          <h1 class="section-title" style="font-size: clamp(2.5rem, 2rem + 2vw, 3.5rem);">${companyData.about.title}</h1>
          <p class="about-lead">${companyData.about.subtitle}</p>
        </div>
      </div>
    </section>

    <section class="container" style="padding-block: 60px;">
      <div class="about-intro-grid">
        <div class="about-body" style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary);">
          <p style="margin-block-end: 20px; color: var(--text-primary); font-weight: 500; white-space: pre-wrap;">${companyData.about.summary}</p>
          <p style="margin-block-end: 20px;">Driven by strict compliance codes, Cresolab integrates world-class manufacturing systems right here in Surat. Our cleanrooms, laboratory equipment, and quality control systems are kept under continuous surveillance by regulatory and certification bodies, ensuring we stand tall as a reliable pharmaceutical export and formulation supply partner.</p>
          <p style="margin-block-end: 20px;">Since our foundation, we have dedicated ourselves to generic cost efficiency without compromising active compound stability. Through rigorous bioequivalence trials and multi-temperature ICH stability chambers, we guarantee that each batch meets global standards from factory dispatch to target prescription shelf life.</p>
          <p>❖ <strong>Local Community Engagement</strong>: We collaborate with academic institutions in Gujarat, providing internship placements and scientific mentoring to local pharmacy students. This strengthens the talent pipeline for high-barrier formulation engineering in Surat's industrial corridor.</p>
        </div>
        
        <div class="about-goals" style="display: flex; flex-direction: column; gap: 24px;">
          <div class="value-card" style="border-left: 4px solid var(--accent-primary); padding: 24px; background-color: var(--bg-secondary);">
            <h3 style="font-size: 1.2rem; color: var(--accent-primary); font-weight: 600;">✦ Our Mission</h3>
            <p style="font-size: 0.95rem; margin-top: 10px; line-height: 1.6; color: var(--text-secondary);">${companyData.about.mission}</p>
          </div>
          <div class="value-card" style="border-left: 4px solid var(--accent-secondary); padding: 24px; background-color: var(--bg-secondary);">
            <h3 style="font-size: 1.2rem; color: var(--accent-secondary); font-weight: 600;">❖ Our Vision</h3>
            <p style="font-size: 0.95rem; margin-top: 10px; line-height: 1.6; color: var(--text-secondary);">${companyData.about.vision}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Company Values -->
    <section class="values-section" style="padding-block: 80px 100px; background-color: var(--bg-secondary); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Ethics and Core</span>
          <h2 class="section-title">Our Foundational Values</h2>
          <p class="section-subtitle">We build trust in global markets through strict adherence to these principles.</p>
        </div>
        
        <div class="values-grid">
          ${companyData.about.values.map((v, index) => `
            <div class="value-card reveal">
              <div class="value-number">0${index + 1}</div>
              <h3>${v.title}</h3>
              <p>${v.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Historical Timeline -->
    <section class="timeline-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Our Growth</span>
          <h2 class="section-title">Corporate Milestones</h2>
          <p class="section-subtitle">Since 2011, Cresolab has steadily expanded manufacturing capacity and medical outreach.</p>
        </div>
        
        <div class="timeline-container">
          <div class="timeline-line"></div>
          ${companyData.timeline.map((item, index) => `
            <div class="timeline-item reveal ${index % 2 === 0 ? 'left' : 'right'}">
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="timeline-year">${item.year}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div style="margin-top: 12px; font-size: 0.85rem; color: var(--text-tertiary);">
                  ${index === 0 ? '▫ Commenced operations with tablet compaction block in Surat.' : ''}
                  ${index === 1 ? '▪ WHO inspection audit successfully completed with zero complaints.' : ''}
                  ${index === 2 ? '› Initiated export shipments across Southeast Asian regulatory networks.' : ''}
                  ${index === 3 ? '✦ Opened state-of-the-art analytical formulation laboratory.' : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Corporate Leadership -->
    <section class="leadership-section" style="padding-block: 80px 100px; background-color: var(--bg-secondary); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Executive Board</span>
          <h2 class="section-title">Corporate Leadership</h2>
          <p class="section-subtitle">Our executive directors bring decades of combined industrial expertise, driving formulation research and compliance.</p>
        </div>
        
        <div class="team-grid">
          ${companyData.leadership.map(member => `
            <div class="team-card reveal">
              <div class="team-avatar">${member.image}</div>
              <h3>${member.name}</h3>
              <div class="team-role">${member.role}</div>
              <p class="team-bio">${member.bio}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Certifications -->
    <section class="certifications-section">
      <div class="container">
        <div class="section-header reveal">
          <span class="section-tag">Quality Credentials</span>
          <h2 class="section-title">Certifications & Compliance</h2>
          <p class="section-subtitle">Cresolab operations are fully audited and cleared under leading standards of safety and management.</p>
        </div>
        
        <div class="certs-list-grid">
          ${companyData.certifications.map(c => `
            <div class="cert-card reveal">
              <div class="cert-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 11 11 13 15 9"></polyline>
                </svg>
              </div>
              <div>
                <h3>${c.title}</h3>
                <p>${c.subtitle}</p>
                <div style="margin-top: 6px; font-size: 0.85rem; color: var(--text-secondary);">
                  <span>✦ Certified Compliance Standard</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

// 3. PRODUCTS CATALOG VIEW
function getProductsHTML(params) {
  if (!productsData) return '';
  
  // Extract all categories dynamically for filter buttons
  const categories = ['All', ...new Set(productsData.map(p => p.category))];
  
  return `
    <section class="products-hero">
      <div class="container">
        <span class="section-tag">Therapeutic formulations</span>
        <h1 class="section-title" style="margin-block-end: 8px;">Product Catalog</h1>
        <p style="color: var(--text-secondary); max-width: 580px;">Search and filter our clinical formulations. Select any product to view composition, strength, and packaging layouts.</p>
      </div>
    </section>

    <section class="container catalog-layout">
      <div class="catalog-grid-system">
        
        <!-- Sidebar filters -->
        <aside class="catalog-sidebar">
          
          <!-- Search box -->
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="catalog-search" class="search-input" placeholder="Search brand or generic name..." aria-label="Search catalog">
          </div>

          <!-- Category filter list -->
          <div class="filter-group">
            <h3 class="filter-group-title">Formulations</h3>
            <ul class="category-filter-list">
              ${categories.map(cat => `
                <li>
                  <button class="filter-btn category-filter-btn" data-category="${cat}">${cat}</button>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <!-- Segment filter list -->
          <div class="filter-group">
            <h3 class="filter-group-title">Therapeutic Area</h3>
            <ul class="category-filter-list" style="flex-wrap: wrap; flex-direction: column; gap: 8px;">
              <li>
                <button class="filter-btn segment-filter-btn active" data-segment="All">All Segments</button>
              </li>
              <li>
                <button class="filter-btn segment-filter-btn" data-segment="Cardiovascular">Cardiology</button>
              </li>
              <li>
                <button class="filter-btn segment-filter-btn" data-segment="Anti-Diabetic">Diabetology</button>
              </li>
              <li>
                <button class="filter-btn segment-filter-btn" data-segment="Antibiotics">Antibiotics</button>
              </li>
              <li>
                <button class="filter-btn segment-filter-btn" data-segment="Gastrointestinal">Gastroenterology</button>
              </li>
              <li>
                <button class="filter-btn segment-filter-btn" data-segment="Analgesic">Analgesic</button>
              </li>
            </ul>
          </div>

          <!-- Sidebar Formulation Guide -->
          <div class="filter-group" style="margin-top: 36px; border-top: 1px solid var(--border-color); padding-top: 24px;">
            <h4 style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-block-end: 12px; color: var(--text-primary);">❖ Formulation Guidelines</h4>
            <p style="font-size: 0.8rem; line-height: 1.5; color: var(--text-secondary); margin-block-end: 12px;">All products are manufactured under WHO-GMP compliance at GIDC Sachin, Surat. Dossiers can be compiled in CTD/eCTD formats upon official commercial request.</p>
            <ul style="list-style: none; font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
              <li><span style="color: var(--accent-primary); margin-right: 4px;">✦</span> <strong>Category filters</strong> refine by dosage forms (Tablets, Capsules, Syrups, etc).</li>
              <li><span style="color: var(--accent-primary); margin-right: 4px;">❖</span> <strong>Therapeutic Areas</strong> segment molecules by medical field.</li>
              <li><span style="color: var(--accent-primary); margin-right: 4px;">◌</span> Click any product card to inspect detailed composition, clinical indications, and package specs.</li>
              <li><span style="color: var(--accent-primary); margin-right: 4px;">▫</span> Stability zones Zone IVb (hot/humid) validated for generic global export.</li>
            </ul>
          </div>

        </aside>

        <!-- Product Listing Grid -->
        <div class="catalog-content-area">
          <div class="catalog-info-bar">
            <div id="results-count">Showing all formulations</div>
            <div style="font-size: 0.85rem; font-style: italic;">Surat Facility Audited</div>
          </div>
          
          <div class="products-catalog-grid" id="catalog-grid">
            <!-- Dynamically populated via JS -->
          </div>
        </div>

      </div>
    </section>
  `;
}

function bindProductsEvents(params) {
  const searchInput = document.getElementById('catalog-search');
  const catBtns = document.querySelectorAll('.category-filter-btn');
  const segBtns = document.querySelectorAll('.segment-filter-btn');
  
  let currentCategory = params.get('category') || 'All';
  let currentSegment = 'All';
  let searchQuery = '';

  // Setup initial active category state from URL param
  catBtns.forEach(btn => {
    if (btn.getAttribute('data-category') === currentCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const filterProducts = () => {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    
    let filtered = productsData;
    
    // 1. Filter by category
    if (currentCategory !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    }
    
    // 2. Filter by therapeutic segment
    if (currentSegment !== 'All') {
      filtered = filtered.filter(p => p.therapeuticSegment.toLowerCase() === currentSegment.toLowerCase());
    }
    
    // 3. Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.generic.toLowerCase().includes(q) || 
        p.therapeuticSegment.toLowerCase().includes(q)
      );
    }
    
    // Render grid
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-results-card">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>No Formulations Found</h3>
          <p style="margin-top: 8px; font-size: 0.9rem;">Try broadening your keyword or selecting a different category filter.</p>
        </div>
      `;
    } else {
      let html = '';
      filtered.forEach(p => {
        html += `
          <article class="product-card" data-id="${p.id}">
            ${getProductPlaceholderHTML(p)}
            <div class="product-badge-row">
              <span class="prod-badge category">${p.category}</span>
              <span class="prod-badge segment">${p.therapeuticSegment}</span>
            </div>
            <h3>${p.name}</h3>
            <p class="product-generic">${p.generic}</p>
            <div>
              <span class="product-strength">${p.strength}</span>
            </div>
            <p class="product-desc">${p.description}</p>
            <div class="product-action-row">
              <button class="btn btn-secondary btn-card view-detail-trigger" data-id="${p.id}">View Formula Details</button>
            </div>
          </article>
        `;
      });
      grid.innerHTML = html;
      
      // Bind click triggers for modal inside grid
      grid.querySelectorAll('.view-detail-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = e.target.getAttribute('data-id');
          openProductModal(id);
        });
      });
    }
    
    // Update count label
    const countEl = document.getElementById('results-count');
    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} formulation${filtered.length === 1 ? '' : 's'}`;
    }
  };

  // Search input listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterProducts();
    });
  }

  // Category filter triggers
  catBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      catBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      
      // Update hash parameters silently
      const hash = `#${window.location.hash.split('?')[0]}`;
      if (currentCategory !== 'All') {
        history.replaceState(null, '', `${hash}?category=${encodeURIComponent(currentCategory)}`);
      } else {
        history.replaceState(null, '', hash);
      }
      
      filterProducts();
    });
  });

  // Segment filter triggers
  segBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      segBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSegment = e.target.getAttribute('data-segment');
      filterProducts();
    });
  });

  // Initial Filter Execution
  filterProducts();
  
  // If the query params contain 'id', open that product modal immediately on load
  const idParam = params.get('id');
  if (idParam) {
    setTimeout(() => openProductModal(idParam), 300);
  }
}

// 4. QUALITY & COMPLIANCE VIEW
function getQualityHTML() {
  if (!companyData) return '';
  return `
    <section class="quality-hero">
      <div class="container">
        <span class="section-tag">Standards & Facilities</span>
        <h1 class="section-title" style="font-size: clamp(2.2rem, 1.8rem + 2vw, 3.2rem);">${companyData.manufacturing.title}</h1>
        <p style="color: var(--text-secondary); max-width: 580px;">${companyData.manufacturing.subtitle}. Spanning dynamic Oral Solids, Orals Liquids blocks, and fully independent analytical systems.</p>
      </div>
    </section>

    <!-- Facility Blocks details -->
    <section class="container facility-grid" style="padding-block: 60px 100px; display: flex; flex-direction: column; gap: 80px;">
      
      <div class="facility-block reveal" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center;">
        <div class="facility-info">
          <span class="section-tag">Manufacturing Blocks</span>
          <h3>${companyData.manufacturing.keySections[0].title}</h3>
          <p style="font-weight: 500; margin-block: 12px 16px;">${companyData.manufacturing.keySections[0].description}</p>
          <p style="color: var(--text-secondary); margin-block-end: 16px; line-height: 1.6;">Equipped with computerized process loggers, our tablet production handles mass outputs while safeguarding moisture control. Our blister lines utilize composite Alu-Alu sheets to lock in clinical shelf life, meeting strict stability requirements.</p>
          <p style="color: var(--text-secondary); margin-block-end: 24px; line-height: 1.6;">During compaction, automated compression force sensors adjust tablet weight in real-time, rejecting any dosage with minor density shifts. This ensures uniform API concentration across millions of tablets daily.</p>
          <ul class="facility-bullets" style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem; color: var(--text-secondary);">
            <li>
              <span style="color: var(--accent-primary); margin-right: 8px;">✦</span>
              <span><strong>Automated Compression Force Control</strong>: Continuous load-cell weight calibration.</span>
            </li>
            <li>
              <span style="color: var(--accent-primary); margin-right: 8px;">❖</span>
              <span><strong>Dehumidified Blister Packing</strong>: HVAC zones kept below 35% RH for moisture-sensitive formulations.</span>
            </li>
            <li>
              <span style="color: var(--accent-primary); margin-right: 8px;">◌</span>
              <span><strong>Online Metal Detectors</strong>: Integrated magnetic scanning at block exit gates.</span>
            </li>
          </ul>
        </div>
        <div class="facility-img-wrapper">
          <img src="./assets/hero-lab.png" alt="Oral solids cleanroom placeholder" class="facility-img" loading="lazy">
        </div>
      </div>

      <!-- HVAC cleanroom deep-dive -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 60px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 600; margin-block-end: 16px;">❖ Cleanroom HVAC & Pressure Regimes</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">To prevent airborne cross-contamination, our compaction blocks run on independent Air Handling Units (AHUs). High-velocity fans force air through terminal 99.97% HEPA filters. This establishes positive differential pressure zones (+15 Pascals) between clean corridors and manufacturing cubicles, ensuring no active dust migrates between runs.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> ISO Class 8 (Class 100,000) cleanroom certification.</li>
            <li><span style="color: var(--accent-primary);">❖</span> 20 air changes per hour for rapid particle removal.</li>
          </ul>
        </div>
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 600; margin-block-end: 16px;">◌ Deionized Water loop & Purified Loops</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">Liquid syrups and suspensions require high-grade solvent purity. Cresolab operates a deionized purified water system using double-pass Reverse Osmosis (RO) and Electrodeionization (EDI). The water recirculates continuously at 80°C in stainless steel loops to completely prevent bacterial biofilm formation.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> Real-time TOC (Total Organic Carbon) online loop analyzers.</li>
            <li><span style="color: var(--accent-primary);">❖</span> Continuous loop sanitization cycles matching USP guidelines.</li>
          </ul>
        </div>
      </div>

      <div class="facility-block reveal" style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 48px; align-items: center; border-top: 1px solid var(--border-color); padding-top: 60px;">
        <div class="facility-img-wrapper" style="order: 2;">
          <img src="./assets/quality-control.png" alt="Analytical lab instrumentation placeholder" class="facility-img" loading="lazy">
        </div>
        <div class="facility-info" style="order: 1;">
          <span class="section-tag">Sterile & Testing Blocks</span>
          <h3>${companyData.manufacturing.keySections[2].title}</h3>
          <p style="font-weight: 500; margin-block: 12px 16px;">${companyData.manufacturing.keySections[2].description}</p>
          <p style="color: var(--text-secondary); margin-block-end: 16px; line-height: 1.6;">Our independent analytical testing laboratories audit raw material, in-process, and finished batch samples. Chemical, physical, and microbiological properties must match pharmacopoeial (IP/BP/USP) specifications before release clearance.</p>
          <p style="color: var(--text-secondary); margin-block-end: 24px; line-height: 1.6;">Using high-precision HPLC chromatography and dissolution vessels, we verify molecular purity, degradation profiles, and release kinetics. Continuous stability testing archives are maintained for ICH Zone IVb (hot/humid) markets.</p>
          <ul class="facility-bullets" style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem; color: var(--text-secondary);">
            <li>
              <span style="color: var(--accent-primary); margin-right: 8px;">✦</span>
              <span><strong>HPLC Chromatography</strong>: Precise chemical purity and active compound assay validation.</span>
            </li>
            <li>
              <span style="color: var(--accent-primary); margin-right: 8px;">❖</span>
              <span><strong>Accelerated Stability Chambers</strong>: Validation testing under Zone IVb (40°C / 75% RH) guidelines.</span>
            </li>
            <li>
              <span style="color: var(--accent-primary); margin-right: 8px;">◌</span>
              <span><strong>Microbiological Assays</strong>: Verification of zero bacterial count in liquid suspensions.</span>
            </li>
          </ul>
        </div>
      </div>

    </section>
  `;
}

// 5. CONTACT US VIEW
function getContactHTML(params) {
  if (!companyData) return '';
  const subjectParam = params.get('subject') || '';
  
  let inquiryAlertHTML = '';
  if (subjectParam) {
    const formulaName = subjectParam.replace('Inquiry for ', '');
    inquiryAlertHTML = `
      <div class="inquiry-alert-banner" style="margin-block-end: 24px; padding: 16px; background-color: var(--accent-light); border-left: 4px solid var(--accent-primary); border-radius: var(--radius-sm); display: flex; gap: 12px; align-items: flex-start;">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent-primary); flex-shrink: 0; margin-top: 2px;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span style="font-size: 0.88rem; line-height: 1.4; color: var(--text-primary);">
          <strong>Catalog Inquiry Active:</strong> We have pre-configured the form for <strong>${formulaName}</strong>.
        </span>
      </div>
    `;
  }
  
  return `
    <section class="container contact-layout" style="padding-block: 60px 100px;">
      <div class="contact-grid" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 48px; align-items: start;">
        
        <!-- Contact Form Card -->
        <div class="contact-form-container reveal">
          ${inquiryAlertHTML}
          <h2>Business & Trade Inquiries</h2>
          <p class="contact-form-lead">Submit your wholesale, distribution, or export inquiries. Our Surat desk responds within 24 working hours.</p>
          
          <form id="contact-form" novalidate style="margin-top: 32px;">
            <div class="form-group" style="margin-block-end: 20px;">
              <label for="form-name" class="form-label" style="display: block; font-size: 0.85rem; font-weight: 600; margin-block-end: 8px;">Full Name *</label>
              <input type="text" id="form-name" class="form-input" required placeholder="John Doe">
              <span class="error-msg" style="display: none; font-size: 0.75rem; color: var(--error); margin-top: 4px;">Please enter your full name.</span>
            </div>
            
            <div class="form-group" style="margin-block-end: 20px;">
              <label for="form-email" class="form-label" style="display: block; font-size: 0.85rem; font-weight: 600; margin-block-end: 8px;">Work Email Address *</label>
              <input type="email" id="form-email" class="form-input" required placeholder="john@company.com">
              <span class="error-msg" style="display: none; font-size: 0.75rem; color: var(--error); margin-top: 4px;">Please enter a valid work email address.</span>
            </div>
 
            <div class="form-group" style="margin-block-end: 20px;">
              <label for="form-phone" class="form-label" style="display: block; font-size: 0.85rem; font-weight: 600; margin-block-end: 8px;">Phone Number / WhatsApp</label>
              <input type="tel" id="form-phone" class="form-input" placeholder="+91 XXXXX XXXXX">
            </div>
 
            <div class="form-group" style="margin-block-end: 20px;">
              <label for="form-subject" class="form-label" style="display: block; font-size: 0.85rem; font-weight: 600; margin-block-end: 8px;">Inquiry Subject *</label>
              <select id="form-subject" class="form-select" required>
                <option value="" disabled ${!subjectParam ? 'selected' : ''}>Select topic...</option>
                <option value="export" ${subjectParam.startsWith('Export') || subjectParam.includes('Application') ? '' : (subjectParam ? 'selected' : '')}>Export Formulation Query</option>
                <option value="distribution" ${subjectParam.includes('PCD') ? 'selected' : ''}>Domestic Distribution / PCD</option>
                <option value="manufacturing" ${subjectParam.includes('Contract') ? 'selected' : ''}>Contract Manufacturing</option>
                <option value="other">General Corporate Query</option>
              </select>
              <span class="error-msg" style="display: none; font-size: 0.75rem; color: var(--error); margin-top: 4px;">Please select an inquiry topic.</span>
            </div>
 
            <div class="form-group" style="margin-block-end: 24px;">
              <label for="form-message" class="form-label" style="display: block; font-size: 0.85rem; font-weight: 600; margin-block-end: 8px;">Detailed Message *</label>
              <textarea id="form-message" class="form-textarea" required placeholder="Describe your batch requirements, target country, or business proposal...">${subjectParam ? `Hello Cresolab team, I am interested in getting information/quote for: ${subjectParam}.` : ''}</textarea>
              <span class="error-msg" style="display: none; font-size: 0.75rem; color: var(--error); margin-top: 4px;">Please write your message detailing the requirements.</span>
            </div>
            
            <button type="submit" class="btn btn-primary btn-submit" id="form-submit-btn">
              <span>Send Secure Inquiry</span>
            </button>
          </form>
        </div>
 
        <!-- Contact Info Cards & Map -->
        <div class="contact-sidebar-info reveal">
          <div class="contact-card-info" style="background-color: var(--bg-secondary); padding: 32px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <h3 class="contact-info-title" style="font-size: 1.3rem; margin-block-end: 24px; font-weight: 600;">Headquarters Desk</h3>
            
            <ul class="contact-detail-list" style="list-style: none; display: flex; flex-direction: column; gap: 24px;">
              <li class="contact-detail-item" style="display: flex; gap: 16px; align-items: start;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-primary); flex-shrink: 0; margin-top: 2px;">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <div>
                  <div class="contact-item-title" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.5px;">Corporate Address</div>
                  <div class="contact-item-val" style="font-size: 0.95rem; margin-top: 4px;">${companyData.contact.address}</div>
                </div>
              </li>
 
              <li class="contact-detail-item" style="display: flex; gap: 16px; align-items: start;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-primary); flex-shrink: 0; margin-top: 2px;">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div>
                  <div class="contact-item-title" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.5px;">Direct Call Lines</div>
                  <div class="contact-item-val" style="font-size: 0.95rem; margin-top: 4px;">
                    <a href="tel:${companyData.contact.phone.replace(/\s+/g, '')}">${companyData.contact.phone}</a><br>
                    <a href="tel:${companyData.contact.phoneAlt.replace(/\s+/g, '')}">${companyData.contact.phoneAlt}</a>
                  </div>
                </div>
              </li>
 
              <li class="contact-detail-item" style="display: flex; gap: 16px; align-items: start;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-primary); flex-shrink: 0; margin-top: 2px;">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div>
                  <div class="contact-item-title" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.5px;">Official Correspondence</div>
                  <div class="contact-item-val" style="font-size: 0.95rem; margin-top: 4px;">
                    <a href="mailto:${companyData.contact.email}">${companyData.contact.email}</a><br>
                    <a href="mailto:${companyData.contact.emailInquiry}" style="font-size: 0.9rem; opacity: 0.85; display: inline-block; margin-top: 4px;">Inquiries: ${companyData.contact.emailInquiry}</a><br>
                    <a href="mailto:${companyData.contact.emailExport}" style="font-size: 0.9rem; opacity: 0.85;">Exports: ${companyData.contact.emailExport}</a>
                  </div>
                </div>
              </li>
            </ul>
            
            <!-- Map Placeholder -->
            <div class="map-placeholder" style="margin-top: 32px; height: 160px; background-color: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;">
              <div class="map-accent-ring" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--accent-primary); animation: floatNode 3s infinite ease-in-out alternate;"></div>
              <div class="map-text" style="font-size: 0.85rem; font-weight: 600;">GIDC Sachin, Surat, Gujarat</div>
            </div>
            
          </div>
        </div>
 
      </div>

      <!-- FAQ & Trade Guidelines Column -->
      <div style="margin-top: 80px; border-top: 1px solid var(--border-color); padding-top: 60px;">
        <div class="section-header reveal" style="text-align: left; margin-block-end: 40px;">
          <span class="section-tag">Information Desk</span>
          <h2 style="font-size: 1.8rem; font-weight: 700;">Business Cooperation FAQ</h2>
          <p style="color: var(--text-secondary); max-width: 600px; margin-top: 8px; font-size: 0.95rem;">Review our standard manufacturing timelines, dossier availability, and sample distribution codes.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">
          <div>
            <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">✦ Q1: How can our organization request formulation samples?</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">Commercial wholesale buyers can request sample batches by submitting drug authorization licenses and corporate details via our official inquiry email. Samples are shipped with complete certificates of analysis (CoA) and HPLC profiles.</p>
          </div>
          <div>
            <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">❖ Q2: What is the lead time for contract manufacturing?</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">Our typical pilot batch scale-up takes 4-6 weeks from design approval. Mass-production compaction runs in GIDC Sachin are scheduled within 30-45 days, depending on active pharmaceutical ingredient (API) market availability.</p>
          </div>
          <div>
            <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">◌ Q3: Are registration dossiers supplied in CTD/eCTD formats?</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">Yes. Our regulatory department compiles Module 1 through 5 dossiers matching ACTD and ICH guidelines. Dossiers are formatted in eCTD (PDF) standard structures for seamless foreign Ministry registrations.</p>
          </div>
          <div>
            <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">▫ Q4: Can Cresolab customize formulation packaging?</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">We offer highly flexible packaging configurations, including Alu-Alu blister grids, glass vials with sterile water ampoules, child-resistant caps for oral liquids, and customized outer carton printing for export regions.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bindContactEvents() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check validation using browser API and custom classes
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      // Force validity check visual state
      if (!input.checkValidity()) {
        isValid = false;
        // Trigger :user-invalid emulation by blurring and focusing
        input.focus();
        input.blur();
      }
    });
    
    if (!isValid) {
      showToast("Please fill in all required fields correctly.", "error");
      return;
    }
    
    // Emulate API call
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = `<span class="btn-spinner"></span> <span>Transmitting...</span>`;
    
    setTimeout(() => {
      showToast("Inquiry submitted successfully! We will contact you soon.", "success");
      form.reset();
      
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.innerHTML = `<span>Send Secure Inquiry</span>`;
    }, 1500);
  });
}

/* --- PRODUCT DETAIL MODAL DIALOG CONTROLLER --- */
function openProductModal(productId) {
  const modal = document.getElementById('product-modal');
  const contentEl = document.getElementById('modal-content');
  
  if (!modal || !contentEl || !productsData) return;
  
  const product = productsData.find(p => p.id === productId);
  if (!product) return;
  
  contentEl.innerHTML = `
    <div class="modal-header">
      <div class="product-badge-row">
        <span class="prod-badge category">${product.category}</span>
        <span class="prod-badge segment">${product.therapeuticSegment}</span>
      </div>
      <h2 class="modal-title">${product.name}</h2>
      <p class="modal-generic">${product.generic}</p>
    </div>
    
    <div class="modal-meta-grid">
      <div class="meta-item">
        <span class="meta-label">Therapeutic Strength</span>
        <span class="meta-val">${product.strength}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Packaging Dimension</span>
        <span class="meta-val">${product.packaging}</span>
      </div>
    </div>
    
    <div class="modal-details">
      <div>
        <h4 class="detail-section-title">Description</h4>
        <p class="detail-text">${product.description}</p>
      </div>
      
      <div>
        <h4 class="detail-section-title">Detailed Composition</h4>
        <p class="detail-text" style="font-family: monospace; font-size: 0.85rem; background-color: var(--bg-secondary); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">${product.composition}</p>
      </div>
      
      <div>
        <h4 class="detail-section-title">Approved Clinical Indications</h4>
        <p class="detail-text">${product.indications}</p>
      </div>
      
      <div>
        <h4 class="detail-section-title">Recommended Dosage</h4>
        <p class="detail-text">${product.dosage}</p>
      </div>
    </div>
    
    <div class="modal-actions">
      <a href="#/contact?subject=${encodeURIComponent('Inquiry for ' + product.name + ' (' + product.generic + ')')}" class="btn btn-primary" id="modal-inquire-btn">Inquire About Formula</a>
    </div>
  `;
  
  // Bind close event or anchor redirections inside modal
  const inquireBtn = document.getElementById('modal-inquire-btn');
  if (inquireBtn) {
    inquireBtn.addEventListener('click', () => {
      modal.close();
    });
  }
  
  // Open dialog popover natively
  modal.showModal();
}

function showToast(message, type = "success") {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' 
    ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    
  toast.innerHTML = `
    ${icon}
    <span class="toast-text">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Force reflow to trigger slide-in animation
  toast.offsetHeight; 
  toast.classList.add('show');
  
  // Fade out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3000);
}

/* --- 6. R&D PIPELINE RENDERING --- */
function getRDHTML() {
  if (!companyData) return '';
  return `
    <section class="products-hero" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <span class="section-tag">Formulation Engineering</span>
        <h1 class="section-title" style="margin-block-end: 8px;">R&D Pipeline</h1>
        <p style="color: var(--text-secondary); max-width: 580px;">${companyData.rnd.subtitle}. Review the clinical molecules currently undergoing bioequivalence trials and stability testing under our research team.</p>
      </div>
    </section>

    <section class="container pipeline-layout" style="padding-block: 60px 100px;">
      <div style="margin-block-end: 48px;">
        <p style="color: var(--text-primary); font-size: 1.1rem; line-height: 1.6; max-width: 800px; font-weight: 500;">
          Our development roadmap focuses on high-barrier generic formulations, Novel Drug Delivery Systems (NDDS), and custom pediatric solutions. We execute scale-up trials matching international ICH stability standards.
        </p>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; max-width: 800px; margin-top: 16px;">
          By leveraging micronized particle technology and precise multi-polymer matrix controls, our formulation team targets molecules with historically low bio-absorption profiles. This allows Cresolab generics to behave identically to brand formulations, reducing patient costs while preserving clinical efficacy.
        </p>
      </div>
      
      <!-- Stage Gates Explanation -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-block-end: 64px; border-bottom: 1px solid var(--border-color); padding-block-end: 48px;">
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">✦ Gate 1: Pre-formulation</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">API particle analysis, solubility characterization, excipient compatibility testing, and cleanroom compression trials.</p>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">❖ Gate 2: ICH Stability</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">ICH Zone IVb (hot/humid) accelerated stability chamber storage, chemical degradation monitoring, and HPLC validation.</p>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">◌ Gate 3: Bioequivalence</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">Comparative dissolution profiling and human bioequivalence studies demonstrating therapeutic matching with reference brand.</p>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">▫ Gate 4: Dossier Filing</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">CTD/eCTD documentation compiling stability logs, validation batches data, and manufacturing logs for Ministry approval.</p>
        </div>
      </div>

      <div class="section-header reveal" style="text-align: left; margin-block-end: 32px;">
        <h2 style="font-size: 1.6rem; font-weight: 700;">Active Pipeline Molecules</h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 8px;">Development statuses and timeline gates of products heading to global markets.</p>
      </div>

      <div class="pipeline-grid">
        ${companyData.pipeline.map(item => `
          <div class="pipeline-card reveal">
            <div class="pipeline-meta">
              <span class="pipeline-code">${item.code}</span>
              <span class="pipeline-segment">${item.segment}</span>
            </div>
            <h3>${item.generic}</h3>
            <p class="pipeline-generic">Strength: ${item.strength}</p>
            <div class="pipeline-progress-box">
              <div class="pipeline-progress-label">
                <span>Status: ${item.stage}</span>
              </div>
              <div class="pipeline-bar-bg">
                <div class="pipeline-bar-fill" style="width: ${item.barWidth};"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Research Technologies -->
      <div style="margin-top: 64px; border-top: 1px solid var(--border-color); padding-top: 48px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-block-end: 16px;">❖ NDDS Polymer Matrix Delivery</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">We design hydrophilic and lipophilic polymer matrix cores. This ensures controlled, sustained drug release over 12-24 hours. This polymer-mesh engineering is crucial for reducing dosage frequency in anti-diabetic and cardiovascular therapies, yielding superior clinical adherence and patient compliance.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> Bilayer compression for immediate-plus-sustained release dual-kinetics.</li>
            <li><span style="color: var(--accent-primary);">❖</span> Micro-porous membrane coating for osmotic pump delivery systems.</li>
          </ul>
        </div>
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-block-end: 16px;">◌ Pediatric Taste Masking & Syrups</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">Active antibiotics like Amoxicillin often have highly bitter profiles that make pediatric administration challenging. Our R&D desk utilizes micro-encapsulated taste barrier particles. The active molecule is shielded during swallowing, and dissolves fully in the stomach's acid environment, ensuring maximum compliance and bio-absorption.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> Organoleptic masking agents free from high fructose corn syrups.</li>
            <li><span style="color: var(--accent-primary);">❖</span> Reconstitutable dry syrup suspensions ensuring molecule stability.</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

/* --- 7. GLOBAL REACH RENDERING --- */
function getGlobalHTML() {
  if (!companyData) return '';
  return `
    <section class="products-hero" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <span class="section-tag">Regulatory Footprint</span>
        <h1 class="section-title" style="margin-block-end: 8px;">Global Reach</h1>
        <p style="color: var(--text-secondary); max-width: 580px;">Cresolab formulations serve diverse healthcare needs across Southeast Asia, Africa, and Latin America. We comply with strict CTD/eCTD dossier submissions.</p>
      </div>
    </section>

    <section class="container" style="padding-block: 60px 100px;">
      <div style="margin-block-end: 48px;">
        <p style="color: var(--text-primary); font-size: 1.15rem; line-height: 1.7; max-width: 800px; font-weight: 500;">
          ${companyData.globalMarkets.description}
        </p>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; max-width: 800px; margin-top: 16px;">
          To ensure seamless registrations, our Regulatory Affairs desk compiles technical dossiers strictly matching ACTD (ASEAN) and ICH Common Technical Document (CTD/eCTD) specifications. This documentation covers validation of three consecutive commercial batches, raw material assays, active compound stability trials, and analytical validation files.
        </p>
      </div>
      
      <!-- Logistics Card Info -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; margin-block-end: 64px; border-bottom: 1px solid var(--border-color); padding-block-end: 48px;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-block-end: 16px;">❖ CTD / eCTD Dossier Compliance</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">We assist our export trade partners by delivering complete Module 1 to 5 dossiers. This covers our manufacturing batch records, process validation protocols, impurity profile calculations, and certificate of analysis (CoA) validation. Our regulatory speed reduces review timelines with foreign health ministries.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> Module 3 (Quality/CMC Data) fully compiled for every registration.</li>
            <li><span style="color: var(--accent-primary);">❖</span> Dissolution comparative study files matching foreign reference drugs.</li>
          </ul>
        </div>
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-block-end: 16px;">◌ Temperature-Controlled Supply Logistics</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">Syrups and suspensions are highly sensitive to thermal fluctuations during ocean freight. Cresolab partners with leading cold-chain transport networks. We utilize actively monitored reefer containers equipped with electronic data loggers, protecting chemical molecule integrity across climate zones.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> Real-time temperature logs archived for every export container run.</li>
            <li><span style="color: var(--accent-primary);">❖</span> High-durability secondary master shippers protecting blisters from impact.</li>
          </ul>
        </div>
      </div>

      <div class="section-header reveal" style="text-align: left; margin-block-end: 36px;">
        <h2 style="font-size: 1.6rem; font-weight: 700;">Regulatory Registration Statuses</h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 8px;">Authorized formulations and health ministry approvals across export networks.</p>
      </div>

      <div class="global-grid">
        ${companyData.globalMarkets.destinations.map(dest => `
          <div class="market-card reveal">
            <div class="market-header">
              <div class="market-flag-placeholder">${dest.country.substring(0, 2).toUpperCase()}</div>
              <h3>${dest.country}</h3>
            </div>
            <div class="market-meta-row">
              <div>
                <span class="meta-label" style="font-size: 0.65rem;">Registry Status</span>
                <div class="market-meta-val" style="color: var(--success); font-size: 0.85rem;">${dest.status}</div>
              </div>
              <div>
                <span class="meta-label" style="font-size: 0.65rem;">Molecules Registered</span>
                <div class="market-meta-val" style="font-size: 0.85rem;">${dest.molecules}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function getSustainabilityHTML() {
  if (!companyData) return '';
  return `
    <section class="products-hero" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <span class="section-tag">Environmental, Social & Governance</span>
        <h1 class="section-title" style="margin-block-end: 8px;">Sustainability (ESG)</h1>
        <p style="color: var(--text-secondary); max-width: 580px;">We formulate responsible therapeutics. Aligning our Surat production capacities with active carbon and water management targets.</p>
      </div>
    </section>

    <section class="container" style="padding-block: 60px 100px;">
      <div class="feature-split reveal" style="margin-block-end: 64px;">
        <div class="feature-content">
          <span class="section-tag">Green Production</span>
          <h2>Eco-Conscious Manufacturing</h2>
          <p style="margin-block-end: 16px; font-weight: 500;">${companyData.sustainability.summary}</p>
          <p style="margin-block-end: 16px; color: var(--text-secondary);">Our plant located in GIDC Sachin, Surat is equipped with a zero liquid discharge waste system. This ensures that chemical residues are neutralized on-site, protecting municipal channels and surrounding ecosystems from chemical pharmaceutical leakage.</p>
          <p style="color: var(--text-secondary);">By combining multi-stage reverse osmosis filtration with closed-loop cooling towers, we reduce municipal water dependency by over 60%, recycling treated wash water directly back into boiler and utility loops.</p>
        </div>
        <div class="feature-image-wrapper">
          <img src="./assets/quality-control.png" alt="Clinical testing cleanroom illustration" loading="lazy">
        </div>
      </div>

      <div class="esg-grid" style="margin-block-end: 64px;">
        ${companyData.sustainability.metrics.map(metric => `
          <div class="esg-card reveal">
            <div class="esg-stat">${metric.value}</div>
            <h3>${metric.label}</h3>
            <p>${metric.detail}</p>
          </div>
        `).join('')}
      </div>

      <!-- ESG Technology Breakdown -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 48px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-block-end: 16px;">❖ Mechanical Vapor Recompression (MVR)</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">To achieve true Zero Liquid Discharge, our utility block operates an MVR crystallizer system. Wastewater containing high dissolved solids is evaporated under mechanical compression, yielding pure water condensate. The dry chemical salt residues are safely captured, completely avoiding toxic liquid discharge.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> 100% recycling rate of chemical rinse and laboratory wastewater runoff.</li>
            <li><span style="color: var(--accent-primary);">❖</span> Zero contamination of local Surat municipal drainage pipelines.</li>
          </ul>
        </div>
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-block-end: 16px;">◌ 250kW Solar Photovoltaic Grid</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 16px;">Our oral solids compaction blocks consume considerable electricity during compression runs. By utilizing high-efficiency monocrystalline solar cells on our factory roofs, we offset roughly 45% of peak daytime consumption. This grid reduces carbon emissions by approximately 220 metric tons annually.</p>
          <ul style="list-style: none; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li><span style="color: var(--accent-primary);">✦</span> Reduces backup diesel generator utility hours by over 50%.</li>
            <li><span style="color: var(--accent-primary);">❖</span> Real-time digital monitoring panel tracking daily solar offset data.</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

/* --- 9. CAREERS BOARD RENDERING --- */
function getCareersHTML() {
  if (!companyData) return '';
  return `
    <section class="products-hero" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <span class="section-tag">Work with Cresolab</span>
        <h1 class="section-title" style="margin-block-end: 8px;">Careers</h1>
        <p style="color: var(--text-secondary); max-width: 580px;">Join our team of scientists, analytical chemists, and regulatory executives at our state-of-the-art Surat blocks.</p>
      </div>
    </section>

    <section class="container" style="padding-block: 60px 100px;">
      <div style="margin-block-end: 48px;">
        <p style="color: var(--text-primary); font-size: 1.15rem; line-height: 1.7; max-width: 800px; font-weight: 500;">
          Build your career at the forefront of generic formulation engineering. Cresolab offers a clean, safety-first environment under strict WHO-GMP clinical regulations.
        </p>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; max-width: 800px; margin-top: 16px;">
          Our lab technicians and research scientists work with state-of-the-art HPLC, GC, and dissolution testers, gaining invaluable experience in international dossier registration and chemical stability audits. We provide continuous technical training, professional development opportunities, and competitive compensation packages.
        </p>
      </div>

      <!-- Recruitment Roadmap -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-block-end: 64px; border-bottom: 1px solid var(--border-color); padding-block-end: 48px;">
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">✦ Step 1: Secure Submission</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">Select an active posting and submit your work profile. Our HR division registers all submissions within 48 hours.</p>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">❖ Step 2: Technical Assessment</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">Shortlisted candidates complete a technical interview with R&D or QA managers, reviewing chemical assay and GMP knowledge.</p>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">◌ Step 3: Executive Interview</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">A values-alignment meeting with our managing directors to discuss career goals, leadership potential, and culture fit.</p>
        </div>
        <div>
          <h4 style="font-weight: 600; margin-block-end: 12px; color: var(--text-primary);">▫ Step 4: Rapid Onboarding</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">Successful applicants receive formal offers and enter a structured cleanroom training and laboratory safety induction run.</p>
        </div>
      </div>

      <div class="section-header reveal" style="text-align: left; margin-block-end: 36px;">
        <h2 style="font-size: 1.8rem; font-weight: 700;">Active Job Postings</h2>
        <p style="color: var(--text-secondary); max-width: 600px; margin-top: 8px; font-size: 0.95rem;">Select any open position to view job description details, qualifications required, and submission forms.</p>
      </div>

      <div class="jobs-grid">
        ${companyData.careers.map(job => `
          <div class="job-card reveal">
            <div class="job-info">
              <h3>${job.title}</h3>
              <div class="job-meta-row">
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  ${job.department}
                </span>
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ${job.experience}
                </span>
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  </svg>
                  ${job.location}
                </span>
              </div>
            </div>
            <div class="job-action">
              <button class="btn btn-secondary view-job-btn" data-id="${job.id}">View Description</button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function bindCareersEvents() {
  document.querySelectorAll('.view-job-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const jobId = e.target.getAttribute('data-id');
      openJobModal(jobId);
    });
  });
}

function openJobModal(jobId) {
  const modal = document.getElementById('product-modal');
  const contentEl = document.getElementById('modal-content');
  if (!modal || !contentEl || !companyData) return;
  
  const job = companyData.careers.find(j => j.id === jobId);
  if (!job) return;
  
  contentEl.innerHTML = `
    <div class="modal-header">
      <div class="product-badge-row">
        <span class="prod-badge category">${job.department}</span>
      </div>
      <h2 class="modal-title" style="font-size: 1.6rem;">${job.title}</h2>
      <p class="modal-generic">${job.location} | Experience: ${job.experience}</p>
    </div>
    
    <div class="modal-details">
      <div>
        <h4 class="detail-section-title">Job Description</h4>
        <p class="detail-text">${job.description}</p>
      </div>
      
      <div>
        <h4 class="detail-section-title">Requirements & Qualifications</h4>
        <p class="detail-text" style="font-weight: 500; color: var(--text-primary);">${job.requirements}</p>
      </div>
    </div>
    
    <div class="modal-actions">
      <a href="#/contact?subject=${encodeURIComponent('Application for ' + job.title)}" class="btn btn-primary" id="modal-apply-btn">Apply For Position</a>
    </div>
  `;
  
  // Close triggers
  const applyBtn = document.getElementById('modal-apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      modal.close();
    });
  }
  
  modal.showModal();
}

/* --- 10. NEWS & INSIGHTS RENDERING --- */
function getNewsHTML(params) {
  if (!companyData) return '';
  return `
    <section class="products-hero" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <span class="section-tag">Cresolab Insights</span>
        <h1 class="section-title" style="margin-block-end: 8px;">Insights & Press</h1>
        <p style="color: var(--text-secondary); max-width: 580px;">Review our corporate releases, green energy milestones, and international generic formulation updates.</p>
      </div>
    </section>

    <section class="container news-layout" style="padding-block: 60px 100px;">
      
      <!-- Featured Highlight Banner -->
      <div class="featured-news-banner reveal" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 40px; margin-block-end: 48px; display: grid; grid-template-columns: 1fr; gap: 24px; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; border-radius: 50%; border: 1px solid var(--border-color); opacity: 0.2; pointer-events: none;"></div>
        <div>
          <span class="prod-badge category" style="background: var(--accent-primary); color: var(--btn-primary-text); font-weight: 600;">FEATURED RELEASE</span>
          <h2 style="font-size: 1.8rem; margin-top: 16px; margin-bottom: 12px; font-weight: 700; line-height: 1.25;">R&D Team Publishes Breakthrough Study on Pediatric Taste Masking</h2>
          <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6; margin-bottom: 24px; max-width: 800px;">
            Our Formulation Research division has successfully developed a proprietary pH-dependent polymer matrix micro-encapsulation technology that effectively masks bitter API profiles in pediatric dry syrups.
          </p>
          <button class="btn btn-primary open-news-featured-btn" data-id="n-5">Read Full Technical Report</button>
        </div>
      </div>

      <!-- Categories Filter row -->
      <div class="filter-group" style="margin-block-end: 32px;">
        <ul class="category-filter-list" style="flex-direction: row; gap: 10px; overflow-x: auto; padding-block-end: 8px;">
          <li>
            <button class="filter-btn news-filter-btn active" data-category="All">All Releases</button>
          </li>
          <li>
            <button class="filter-btn news-filter-btn" data-category="Corporate Events">Events</button>
          </li>
          <li>
            <button class="filter-btn news-filter-btn" data-category="Sustainability">Sustainability</button>
          </li>
          <li>
            <button class="filter-btn news-filter-btn" data-category="International Business">Exports</button>
          </li>
          <li>
            <button class="filter-btn news-filter-btn" data-category="Compliance">Compliance</button>
          </li>
        </ul>
      </div>

      <div class="news-grid" id="news-container">
        <!-- Injected dynamically -->
      </div>

      <!-- Scientific Whitepapers & Regulatory Calendar -->
      <div style="margin-top: 80px; border-top: 1px solid var(--border-color); padding-top: 60px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: start;">
        
        <!-- Whitepapers -->
        <div class="reveal">
          <span class="section-tag">Research Literature</span>
          <h2 style="font-size: 1.8rem; font-weight: 700; margin-block-end: 24px;">Scientific Whitepapers & Library</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-block-end: 32px;">
            Cresolab's F&D team publishes technical studies and whitepapers detailing novel excipient profiles, dissolution testing methodologies, and stability data models.
          </p>
          
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 24px;">
            <li style="border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
              <h4 style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary);">❖ Dissolution Profiling of Metformin Prolonged-Release Matrices</h4>
              <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
                An analytical study evaluating ethylcellulose and hydroxypropyl methylcellulose (HPMC) polymer ratios to achieve zero-order release kinetics over a 24-hour cycle.
              </p>
              <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px;">Published: April 2026 | Document ID: WP-MET-092</div>
            </li>
            <li style="border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
              <h4 style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary);">◌ HPLC Impurity Profile Analysis for Cardiovascular Bilayers</h4>
              <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
                Method validation study detailing rapid gradient high-performance liquid chromatography protocols for detection of low-level degradation products in Amlodipine-Atenolol combinations.
              </p>
              <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px;">Published: January 2026 | Document ID: WP-CAR-041</div>
            </li>
            <li>
              <h4 style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary);">✦ Stability Auditing Models for Climatic Zone IVb (Hot & Humid)</h4>
              <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
                Evaluation of packaging moisture-barrier values using Alu-Alu composite laminate grids to safeguard drug potency under accelerated conditions (40°C / 75% RH).
              </p>
              <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px;">Published: October 2025 | Document ID: WP-STA-882</div>
            </li>
          </ul>
        </div>
        
        <!-- Calendar & Guidelines -->
        <div class="reveal">
          <div style="background-color: var(--bg-secondary); padding: 32px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span class="section-tag">Calendar 2026</span>
            <h3 style="font-size: 1.3rem; font-weight: 600; margin-block-end: 20px;">Corporate Events & Audits</h3>
            
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 20px;">
              <li style="display: flex; gap: 16px;">
                <div style="flex-shrink: 0; background: var(--bg-primary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--radius-sm); text-align: center; width: 64px;">
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">JUL</div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1.1;">14</div>
                </div>
                <div>
                  <h4 style="font-weight: 600; font-size: 0.95rem;">WHO-GMP Surveillance Inspection</h4>
                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Annual safety & HVAC validation audit at Sachin GIDC facility blocks.</p>
                </div>
              </li>
              <li style="display: flex; gap: 16px;">
                <div style="flex-shrink: 0; background: var(--bg-primary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--radius-sm); text-align: center; width: 64px;">
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">SEP</div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1.1;">22</div>
                </div>
                <div>
                  <h4 style="font-weight: 600; font-size: 0.95rem;">CPhI Worldwide 2026 (Frankfurt)</h4>
                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Cresolab delegates attending the global trade fair at Booth 4.2-E12.</p>
                </div>
              </li>
              <li style="display: flex; gap: 16px;">
                <div style="flex-shrink: 0; background: var(--bg-primary); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--radius-sm); text-align: center; width: 64px;">
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">NOV</div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1.1;">08</div>
                </div>
                <div>
                  <h4 style="font-weight: 600; font-size: 0.95rem;">International Regulatory Summit</h4>
                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Focusing on harmonization of eCTD formats across ASEAN countries.</p>
                </div>
              </li>
            </ul>
            
            <div style="margin-top: 32px; border-top: 1px solid var(--border-color); padding-top: 24px;">
              <h4 style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-block-end: 12px; color: var(--text-primary);">❖ Media Desk & PR Guidelines</h4>
              <p style="font-size: 0.8rem; line-height: 1.5; color: var(--text-secondary);">
                Journalists and trade reporters can contact our corporate communications desk at <a href="mailto:media@cresolab.com" style="color: var(--accent-primary); font-weight: 500;">media@cresolab.com</a>. Press kits are available upon validation of accreditation credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bindNewsEvents(params) {
  const newsBtns = document.querySelectorAll('.news-filter-btn');
  let currentCategory = 'All';

  const filterNews = () => {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    let filtered = companyData.news;
    if (currentCategory !== 'All') {
      filtered = filtered.filter(article => article.category === currentCategory);
    }
    
    let html = '';
    filtered.forEach(art => {
      html += `
        <article class="news-card reveal">
          <div class="news-meta-row">
            <span class="news-date">${art.date}</span>
            <span class="news-category">${art.category}</span>
          </div>
          <h3>${art.title}</h3>
          <p class="news-summary">${art.summary.substring(0, 120)}...</p>
          <div class="news-action">
            <button class="btn btn-secondary btn-card view-article-btn" data-id="${art.id}">Read Release Details</button>
          </div>
        </article>
      `;
    });
    
    container.innerHTML = html;
    
    // Bind click events inside grid
    container.querySelectorAll('.view-article-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openNewsModal(id);
      });
    });
    
    // Re-trigger scroll reveals
    initScrollObserver();
  };

  newsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      newsBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      filterNews();
    });
  });

  // Bind click for featured article button
  const featuredBtn = document.querySelector('.open-news-featured-btn');
  if (featuredBtn) {
    featuredBtn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      openNewsModal(id);
    });
  }

  // Initial Filter Execution
  filterNews();
}

function openNewsModal(articleId) {
  const modal = document.getElementById('product-modal');
  const contentEl = document.getElementById('modal-content');
  if (!modal || !contentEl || !companyData) return;
  
  const article = companyData.news.find(a => a.id === articleId);
  if (!article) return;
  
  const bodyHTML = article.body 
    ? article.body.split('\n').map(p => p.trim() ? `<p class="detail-text" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); margin-block-end: 12px; text-wrap: pretty;">${p}</p>` : '').join('')
    : `<p class="detail-text" style="font-size: 1rem; line-height: 1.6; color: var(--text-primary); text-wrap: pretty;">${article.summary}</p>`;
  
  contentEl.innerHTML = `
    <div class="modal-header">
      <div class="product-badge-row">
        <span class="prod-badge category">${article.category}</span>
        <span class="prod-badge segment" style="background-color: var(--bg-secondary); color: var(--text-secondary);">${article.date}</span>
      </div>
      <h2 class="modal-title" style="font-size: 1.5rem; line-height: 1.35; margin-top: 8px;">${article.title}</h2>
    </div>
    
    <div class="modal-details" style="margin-block-end: 24px;">
      <div>
        ${bodyHTML}
      </div>
      <div style="margin-top: 16px; font-size: 0.85rem; color: var(--text-tertiary);">
        Released by Cresolab Communications Desk. Surat, Gujarat, India.
      </div>
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-primary" id="modal-news-close-btn">Close Release</button>
    </div>
  `;
  
  // Close trigger
  document.getElementById('modal-news-close-btn').addEventListener('click', () => {
    modal.close();
  });
  
  modal.showModal();
}

