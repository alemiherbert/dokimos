/**
 * Dokimos Consulting — site renderer.
 * Every piece of copy, image path, and list on every page comes from
 * /content.json, namespaced by page (home / work / people / about / contact),
 * plus shared site/nav/footer data. Each HTML page sets <body data-page="...">
 * so this one script knows which sections to render. To update the site,
 * edit content.json — this file should not need to change unless you are
 * adding a brand-new section type.
 */
(function () {
  'use strict';

  const ICONS = {
    infrastructure: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
    buildings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="10" width="5" height="11"/><rect x="10" y="4" width="5" height="17"/><rect x="17" y="13" width="4" height="8"/></svg>',
    advisory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3h6v3H9zM6 6h12v15H6z"/><path d="m9.5 13 2 2 3.5-4"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.02-3.07-1.94-3.07-1.94 0-2.24 1.44-2.24 2.97V21h-4z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3l7.5 9.4L3.3 21H6l5.8-6.6L16.5 21H21l-7.8-9.8L20.7 3H18l-5.3 6.1L8.5 3H3z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>'
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function mediaFrame(path, alt, eager) {
    const loadingAttr = eager ? '' : ' loading="lazy"';
    return `<div class="media-frame"><img class="js-img" data-path="${escapeHtml(path)}" src="${escapeHtml(path)}" alt="${escapeHtml(alt || '')}"${loadingAttr}></div>`;
  }

  function attachImageFallbacks(root) {
    root.querySelectorAll('img.js-img').forEach((img) => {
      img.addEventListener('error', function onError() {
        const label = img.dataset.path || 'image';
        const fallback = document.createElement('div');
        fallback.className = 'img-fallback';
        fallback.innerHTML = `<span>Add image<br>${escapeHtml(label)}</span>`;
        img.replaceWith(fallback);
      }, { once: true });
    });
  }

  function normalizePath(path) {
    let p = path.split('#')[0].split('?')[0];
    p = p.replace(/index\.html$/, '');
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p === '' ? '/' : p;
  }

  /* ---------------------------------------------------------------------
   * Shared chrome: header + footer (every page)
   * ------------------------------------------------------------------- */

  function renderHeader(data) {
    const el = document.getElementById('site-header');
    const currentPath = normalizePath(window.location.pathname);
    const navItems = data.nav.map((n) => {
      const isCurrent = normalizePath(n.href) === currentPath;
      return `<li><a href="${escapeHtml(n.href)}"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(n.label)}</a></li>`;
    }).join('');
    el.innerHTML = `
      <div class="container header-inner">
        <a href="/" class="brand" aria-label="${escapeHtml(data.site.name)} home">
          <img src="/logo.svg" alt="" class="brand-mark" width="34" height="34">
          <span class="brand-name">${escapeHtml(data.site.shortName)}<span class="brand-name-sub">Consulting</span></span>
        </a>
        <nav class="site-nav" id="site-nav" aria-label="Primary">
          <ul>${navItems}</ul>
        </nav>
        <div class="header-actions">
          <a href="/contact" class="btn btn-accent nav-cta">Contact Us</a>
          <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle dark mode">
            <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>
            <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>
          </button>
          <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle menu">
            <span></span><span></span>
          </button>
        </div>
      </div>`;
  }

  function renderMobileNav(data) {
    const el = document.getElementById('mobile-nav-drawer');
    if (!el) return;
    const currentPath = normalizePath(window.location.pathname);
    const navItems = data.nav.map((n) => {
      const isCurrent = normalizePath(n.href) === currentPath;
      return `<li><a href="${escapeHtml(n.href)}"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(n.label)}</a></li>`;
    }).join('');
    el.innerHTML = `
      <a href="/" class="mobile-nav-brand" aria-label="${escapeHtml(data.site.name)} home">
        <img src="/logo.svg" alt="" class="brand-mark">
        <span class="brand-name">${escapeHtml(data.site.shortName)}<small class="brand-name-sub">Consulting</small></span>
      </a>
      <ul>${navItems}</ul>`;
  }

  function renderFooter(data) {
    const el = document.getElementById('site-footer');
    const navLinks = data.nav.map((n) => `<li><a href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a></li>`).join('');
    const year = new Date().getFullYear();
    el.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div>
            <div class="footer-brand">
              <img src="/logo.svg" alt="" width="34" height="34">
              <span>${escapeHtml(data.site.name)}</span>
            </div>
            <p class="footer-note">${escapeHtml(data.footer.note)}</p>
          </div>
          <div class="footer-cols">
            <div class="footer-col">
              <h4>Navigate</h4>
              <ul>${navLinks}</ul>
            </div>
            <div class="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:${escapeHtml(data.site.email)}">${escapeHtml(data.site.email)}</a></li>
                <li>${escapeHtml(data.site.phone)}</li>
                <li>${escapeHtml(data.site.addressLine1)}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} ${escapeHtml(data.site.name)}. All rights reserved.</span>
          <span>Founded ${escapeHtml(String(data.site.foundedYear))} — Kampala, Uganda</span>
        </div>
      </div>`;
  }

  function setupCookieBanner(cfg) {
    const el = document.getElementById('cookie-banner');
    if (!el || window.localStorage.getItem('cookieConsent')) return;
    el.innerHTML = `
      <div class="cookie-banner-inner">
        <p class="cookie-banner-text">${escapeHtml(cfg.message)}</p>
        <div class="cookie-banner-actions">
          <button type="button" class="btn btn-ghost" id="cookie-decline">${escapeHtml(cfg.declineLabel)}</button>
          <button type="button" class="btn btn-accent" id="cookie-accept">${escapeHtml(cfg.acceptLabel)}</button>
        </div>
      </div>`;
    const inner = el.querySelector('.cookie-banner-inner');
    requestAnimationFrame(() => requestAnimationFrame(() => inner.classList.add('is-visible')));

    function dismiss(value) {
      window.localStorage.setItem('cookieConsent', value);
      inner.classList.remove('is-visible');
    }
    document.getElementById('cookie-accept').addEventListener('click', () => dismiss('accepted'));
    document.getElementById('cookie-decline').addEventListener('click', () => dismiss('declined'));
  }

  /* ---------------------------------------------------------------------
   * Home page
   * ------------------------------------------------------------------- */

  function renderHero(hero) {
    const el = document.getElementById('hero');
    const first = hero.slides[0];
    const slidesHtml = hero.slides.map((s, i) => `
      <div class="hero-slide${i === 0 ? ' is-active' : ''}">${mediaFrame(s.image, s.imageAlt, true)}</div>`).join('');
    el.innerHTML = `
      <div class="hero-media" id="hero-media">${slidesHtml}</div>
      <div class="container hero-bottom">
        <div class="hero-text">
          <h1 id="hero-headline">${escapeHtml(first.headline)}</h1>
          <a class="lead" id="hero-subheadline" href="${escapeHtml(first.href)}">${escapeHtml(first.subheadline)}</a>
        </div>
        <div class="hero-carousel" id="hero-carousel">
          <div class="carousel-bars" id="carousel-bars"></div>
        </div>
      </div>`;
  }

  function renderCarousel(slides) {
    const bars = document.getElementById('carousel-bars');
    if (!bars) return;
    bars.innerHTML = slides.map((s, i) => `<button type="button" class="carousel-bar${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="Show ${escapeHtml(s.headline)}"><span class="carousel-bar-fill"></span></button>`).join('');
  }

  function renderStats(stats) {
    const el = document.getElementById('stats-bar');
    const cards = stats.map((s) => `
      <div data-reveal>
        <div class="stat-value">${escapeHtml(s.value)}</div>
        <div class="stat-label">${escapeHtml(s.label)}</div>
      </div>`).join('');
    el.innerHTML = `<div class="container stats-grid">${cards}</div>`;
  }

  function projectCardHtml(p) {
    return `
      <div class="project-card" data-category="${escapeHtml(p.category)}" data-reveal tabindex="0">
        ${mediaFrame(p.image, p.imageAlt)}
        <div class="project-overlay">
          <span class="project-tag">${escapeHtml(p.category)}</span>
          <div class="project-title">${escapeHtml(p.title)}</div>
          <div class="project-meta">${escapeHtml(p.location)} — ${escapeHtml(p.year)}</div>
          <p class="project-desc">${escapeHtml(p.description)}</p>
        </div>
      </div>`;
  }

  function renderFeaturedWork(featuredWork, workItems) {
    const el = document.getElementById('featured-work');
    const items = workItems.filter((p) => p.featured);
    const cards = items.map(projectCardHtml).join('');
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" data-reveal>${escapeHtml(featuredWork.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(featuredWork.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(featuredWork.intro)}</p>
        </div>
        <div class="projects-grid">${cards}</div>
        <a class="btn btn-outline-dark" data-reveal href="${escapeHtml(featuredWork.linkHref)}">${escapeHtml(featuredWork.linkLabel)}</a>
      </div>`;
  }

  function renderTrust(trust) {
    const el = document.getElementById('trust');
    const logos = trust.logos.map((logo) => `
      <div class="trust-logo" data-reveal>${mediaFrame(logo.image, logo.name)}</div>`).join('');
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" data-reveal>${escapeHtml(trust.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(trust.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(trust.intro)}</p>
        </div>
        <div class="trust-logos">${logos}</div>
      </div>`;
  }

  /* ---------------------------------------------------------------------
   * Work page
   * ------------------------------------------------------------------- */

  function renderProjects(work) {
    const el = document.getElementById('projects');
    const filters = work.filters.map((f, i) => `<button type="button" class="filter-btn${i === 0 ? ' is-active' : ''}" data-filter="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join('');
    const cards = work.items.map(projectCardHtml).join('');
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" data-reveal>${escapeHtml(work.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(work.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(work.intro)}</p>
        </div>
        <div class="filters">${filters}</div>
        <div class="projects-grid">${cards}</div>
      </div>`;
  }

  function setupProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!buttons.length) return;
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          const match = filter === 'All' || card.dataset.category === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (window.matchMedia('(hover: none)').matches) {
          e.preventDefault();
          card.classList.toggle('is-active');
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
   * People page
   * ------------------------------------------------------------------- */

  function renderPeople(people) {
    const el = document.getElementById('people');
    const members = people.members.map((m) => `
      <div class="person-card" data-reveal>
        <div class="person-photo">${mediaFrame(m.photo, m.name)}</div>
        <div class="person-name">${escapeHtml(m.name)}</div>
        <div class="person-role">${escapeHtml(m.role)}</div>
        <p class="person-bio">${escapeHtml(m.bio)}</p>
      </div>`).join('');
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" data-reveal>${escapeHtml(people.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(people.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(people.intro)}</p>
        </div>
        <div class="people-grid">${members}</div>
      </div>`;
  }

  /* ---------------------------------------------------------------------
   * News page
   * ------------------------------------------------------------------- */

  function renderNews(news) {
    const el = document.getElementById('news');
    const formatDate = (iso) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    const posts = news.posts.map((p) => `
      <article class="news-card" data-reveal>
        <div class="news-media">${mediaFrame(p.image, p.imageAlt)}</div>
        <span class="news-tag">${escapeHtml(p.tag)}</span>
        <h3 class="news-title">${escapeHtml(p.title)}</h3>
        <time class="news-date" datetime="${escapeHtml(p.date)}">${escapeHtml(formatDate(p.date))}</time>
        <p class="news-excerpt">${escapeHtml(p.excerpt)}</p>
      </article>`).join('');
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" data-reveal>${escapeHtml(news.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(news.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(news.intro)}</p>
        </div>
        <div class="news-grid">${posts}</div>
      </div>`;
  }

  /* ---------------------------------------------------------------------
   * Home page — About / Services / Approach (moved here from a standalone
   * About page; the hero's per-slide links anchor to #service-<id> below)
   * ------------------------------------------------------------------- */

  function renderAbout(about) {
    const el = document.getElementById('about');
    const values = about.values.map((v, i) => `
      <div class="value-card" data-reveal>
        <div class="value-index">${String(i + 1).padStart(2, '0')}</div>
        <div class="value-title">${escapeHtml(v.title)}</div>
        <p class="value-desc">${escapeHtml(v.description)}</p>
      </div>`).join('');
    el.innerHTML = `
      <div class="container">
        <div class="about-copy">
          <p class="eyebrow" data-reveal>${escapeHtml(about.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(about.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(about.lead)}</p>
          <p class="body" data-reveal>${escapeHtml(about.body)}</p>
        </div>
        <div class="values-grid">${values}</div>
      </div>`;
  }

  function renderServices(services) {
    const el = document.getElementById('services');
    const pillars = services.pillars.map((p) => `
      <div class="pillar-card" id="service-${escapeHtml(p.id)}" data-reveal>
        <div class="pillar-media">
          ${mediaFrame(p.image, p.imageAlt)}
          <div class="pillar-media-overlay">
            <div class="pillar-icon" aria-hidden="true">${ICONS[p.id] || ''}</div>
            <h3 class="pillar-name">${escapeHtml(p.name)}</h3>
            <p class="pillar-summary">${escapeHtml(p.summary)}</p>
          </div>
        </div>
        <ul class="pillar-capabilities">${p.capabilities.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
      </div>`).join('');
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" data-reveal>${escapeHtml(services.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(services.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(services.intro)}</p>
        </div>
        <div class="pillars-grid">${pillars}</div>
      </div>`;
  }

  function renderApproach(approach) {
    const el = document.getElementById('approach');
    const steps = approach.steps.map((s) => `
      <div class="step-card" data-reveal>
        <div class="step-number">${escapeHtml(s.number)}</div>
        <h3 class="step-title">${escapeHtml(s.title)}</h3>
        <p class="step-desc">${escapeHtml(s.description)}</p>
      </div>`).join('');
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" data-reveal>${escapeHtml(approach.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(approach.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(approach.intro)}</p>
        </div>
        <div class="approach-steps">${steps}</div>
      </div>`;
  }

  /* ---------------------------------------------------------------------
   * Contact page
   * ------------------------------------------------------------------- */

  function renderContact(contact, site) {
    const el = document.getElementById('contact');
    const socialLinks = Object.entries(site.social || {})
      .filter(([, href]) => href)
      .map(([key, href]) => `<a href="${escapeHtml(href)}" aria-label="${escapeHtml(key)}">${ICONS[key] || ''}</a>`)
      .join('');
    el.innerHTML = `
      <div class="container contact-grid">
        <div class="contact-info">
          <p class="eyebrow" data-reveal>${escapeHtml(contact.eyebrow)}</p>
          <h2 class="display-heading" data-reveal>${escapeHtml(contact.heading)}</h2>
          <p class="lead" data-reveal>${escapeHtml(contact.intro)}</p>
          <dl class="contact-detail" data-reveal>
            <dt>Email</dt><dd><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></dd>
            <dt>Phone</dt><dd><a href="tel:${escapeHtml(site.phone.replace(/\s+/g, ''))}">${escapeHtml(site.phone)}</a></dd>
            <dt>Office</dt><dd>${escapeHtml(site.addressLine1)}<br>${escapeHtml(site.addressLine2)}</dd>
          </dl>
          <div class="social-row">${socialLinks}</div>
        </div>
        <form class="contact-form" data-reveal action="${escapeHtml(contact.formAction)}" method="POST">
          <div class="form-row">
            <div class="form-field">
              <label for="cf-name">Name</label>
              <input id="cf-name" name="name" type="text" required autocomplete="name">
            </div>
            <div class="form-field">
              <label for="cf-email">Email</label>
              <input id="cf-email" name="email" type="email" required autocomplete="email">
            </div>
          </div>
          <div class="form-field">
            <label for="cf-org">Organization (optional)</label>
            <input id="cf-org" name="organization" type="text" autocomplete="organization">
          </div>
          <div class="form-field">
            <label for="cf-message">Tell us about the project</label>
            <textarea id="cf-message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn btn-accent">Send Message</button>
          <p class="form-note">${escapeHtml(contact.formNote)}</p>
        </form>
      </div>`;
  }

  /* ---------------------------------------------------------------------
   * Shared behaviour
   * ------------------------------------------------------------------- */

  function setupHeaderScroll(page) {
    const header = document.getElementById('site-header');
    if (page !== 'home') {
      header.classList.add('is-scrolled');
      return;
    }
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function setupNavToggle(page) {
    const toggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('mobile-nav-drawer');
    const header = document.getElementById('site-header');
    if (!toggle || !drawer) return;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mobile-nav-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    drawer.insertBefore(closeBtn, drawer.firstChild);

    function syncHeaderSolid(open) {
      if (page !== 'home') return;
      if (open) header.classList.add('is-scrolled');
      else if (window.scrollY <= 24) header.classList.remove('is-scrolled');
    }
    // Lock background scroll while the drawer is open. A plain
    // `overflow:hidden` on body isn't enough on iOS Safari — it still
    // rubber-bands the page underneath, which is exactly what exposes gaps
    // around the pushed content. Pinning body at its current scroll offset
    // (and restoring it on close) blocks that completely.
    let lockedScrollY = 0;
    function setScrollLock(locked) {
      if (locked) {
        lockedScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${lockedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
      } else {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, lockedScrollY);
      }
    }
    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      syncHeaderSolid(open);
      setScrollLock(open);
    }
    toggle.addEventListener('click', () => {
      setOpen(!document.body.classList.contains('nav-open'));
    });
    closeBtn.addEventListener('click', () => setOpen(false));
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    // Clicking outside the drawer (the pushed-aside page, or its dimmed
    // sliver) closes it too. #page-shell has pointer-events:none while open,
    // so those clicks already fall through to document — this just catches them.
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('nav-open')) return;
      if (drawer.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });
  }

  function setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      window.localStorage.setItem('theme', next);
    });
  }

  function setupReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    els.forEach((el) => io.observe(el));
  }

  function setupCarousel(slides) {
    const root = document.getElementById('hero-carousel');
    const media = document.getElementById('hero-media');
    const headline = document.getElementById('hero-headline');
    const subheadline = document.getElementById('hero-subheadline');
    if (!root || !media) return;
    const imgSlides = media.querySelectorAll('.hero-slide');
    const bars = root.querySelectorAll('.carousel-bar');
    if (imgSlides.length < 2) return;

    const DURATION_MS = 5000;
    const TEXT_FADE_MS = 300;
    root.style.setProperty('--carousel-duration', `${DURATION_MS}ms`);

    let index = 0;
    let timer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setActive(nextIndex) {
      imgSlides[index].classList.remove('is-active');
      index = (nextIndex + imgSlides.length) % imgSlides.length;
      imgSlides[index].classList.add('is-active');
      bars.forEach((bar, i) => {
        bar.classList.remove('is-active', 'is-past');
        if (i < index) bar.classList.add('is-past');
        else if (i === index) bar.classList.add('is-active');
      });
      if (headline && subheadline) {
        headline.classList.add('is-fading');
        subheadline.classList.add('is-fading');
        window.setTimeout(() => {
          headline.textContent = slides[index].headline;
          subheadline.textContent = slides[index].subheadline;
          subheadline.setAttribute('href', slides[index].href);
          headline.classList.remove('is-fading');
          subheadline.classList.remove('is-fading');
        }, TEXT_FADE_MS);
      }
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function start() {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(() => setActive(index + 1), DURATION_MS);
    }

    bars.forEach((bar) => bar.addEventListener('click', () => {
      const target = Number(bar.dataset.index);
      if (target === index) return;
      setActive(target);
      start();
    }));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    start();
  }

  /* ---------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------- */

  const page = document.body.dataset.page;

  fetch('/content.json')
    .then((res) => {
      if (!res.ok) throw new Error(`content.json failed to load: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      document.title = `${data.site.name} — ${data.site.tagline}`;

      renderHeader(data);
      renderMobileNav(data);
      renderFooter(data);
      setupCookieBanner(data.cookieBanner);

      if (page === 'home') {
        renderHero(data.home.hero);
        renderCarousel(data.home.hero.slides);
        renderStats(data.home.stats);
        renderAbout(data.home.about);
        renderServices(data.home.services);
        renderApproach(data.home.approach);
        renderFeaturedWork(data.home.featuredWork, data.work.items);
        renderTrust(data.home.trust);
        setupCarousel(data.home.hero.slides);
      } else if (page === 'work') {
        renderProjects(data.work);
        setupProjectFilters();
      } else if (page === 'people') {
        renderPeople(data.people);
      } else if (page === 'news') {
        renderNews(data.news);
      } else if (page === 'contact') {
        renderContact(data.contact, data.site);
      }

      attachImageFallbacks(document);
      setupHeaderScroll(page);
      setupNavToggle(page);
      setupThemeToggle();
      setupReveal();
    })
    .catch((err) => {
      console.error(err);
      // The 404 page's content is static HTML, not JS-rendered — leave it alone
      // so it still displays correctly even if content.json fails to load.
      if (['home', 'work', 'people', 'news', 'contact'].includes(page)) {
        document.getElementById('main-content').innerHTML =
          '<p style="padding:4rem 1.5rem;font-family:sans-serif;">Site content failed to load. If you are viewing this file directly, run a local server (see README.md) — browsers block content.json from loading over file:// URLs.</p>';
      }
    });
})();
