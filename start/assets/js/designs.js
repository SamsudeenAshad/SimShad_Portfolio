// Gallery content is scoped to this browser's existing portfolio_designs storage.
(() => {
  'use strict';
  const STORAGE_KEY = 'portfolio_designs';
  function loadDesigns() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
    } catch { return []; }
  }
  function safeImageUrl(value) {
    if (typeof value !== 'string') return '';
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const designs = loadDesigns();
    const grid = document.getElementById('galleryGrid');
    const bar = document.getElementById('filtersBar');
    const dialog = document.getElementById('lightboxOverlay');
    const close = document.getElementById('lightboxClose');
    let previewTrigger;
    function toolsFor(design) { return String(design.tools || '').split(',').map(tool => tool.trim()).filter(Boolean); }
    function openPreview(design, trigger) {
      previewTrigger = trigger;
      const wrap = document.getElementById('lightboxImageWrap');
      wrap.replaceChildren(close);
      const url = safeImageUrl(design.imageUrl);
      if (url) {
        const image = el('img');
        image.src = url;
        image.alt = String(design.title || 'Design preview');
        wrap.appendChild(image);
      } else wrap.appendChild(el('div', 'lightbox-placeholder', 'Preview unavailable'));
      document.getElementById('lightboxCategory').textContent = String(design.category || 'Design');
      document.getElementById('lightboxTitle').textContent = String(design.title || 'Untitled design');
      document.getElementById('lightboxDesc').textContent = String(design.description || '');
      document.getElementById('lightboxTools').replaceChildren(...toolsFor(design).map(tool => el('span', 'design-tool-tag', tool)));
      dialog.showModal();
      close.focus();
    }
    function render(filter = 'all') {
      const filtered = designs.filter(design => filter === 'all' || design.category === filter);
      grid.replaceChildren();
      if (!filtered.length) {
        const empty = el('div', 'designs-empty');
        const icon = el('i', 'fas fa-drafting-compass');
        icon.setAttribute('aria-hidden', 'true');
        const heading = filter === 'all' ? 'A space for design explorations.' : 'No designs in this category.';
        const description = filter === 'all'
          ? 'No designs have been published in this gallery yet. In the meantime, explore the interfaces and ideas in my software projects.'
          : 'Choose another category to explore more work.';
        const link = el('a', 'btn btn-primary', 'Explore projects ↗');
        link.href = 'profile.html#projects';
        empty.append(icon, el('h3', '', heading), el('p', '', description), link);
        grid.appendChild(empty);
      }
      filtered.forEach(design => {
        const card = el('article', 'design-card');
        card.dataset.category = String(design.category || '');
        const picture = el('div', 'design-card-image');
        const url = safeImageUrl(design.imageUrl);
        if (url) {
          const image = el('img');
          image.src = url;
          image.alt = String(design.title || 'Design');
          image.loading = 'lazy';
          picture.appendChild(image);
        } else picture.appendChild(el('div', 'design-card-placeholder', 'Preview unavailable'));
        const overlay = el('div', 'design-card-overlay');
        const button = el('button', 'design-card-overlay-btn', 'Preview ↗');
        button.type = 'button';
        button.setAttribute('aria-label', 'Preview ' + String(design.title || 'design'));
        button.setAttribute('aria-haspopup', 'dialog');
        overlay.appendChild(button);
        picture.appendChild(overlay);
        const body = el('div', 'design-card-body');
        body.append(el('p', 'design-card-category', design.category || 'Design'),
          el('h3', 'design-card-title', design.title || 'Untitled design'),
          el('p', 'design-card-desc', design.description || ''));
        const toolTags = el('div', 'design-card-tools');
        toolTags.append(...toolsFor(design).map(tool => el('span', 'design-tool-tag', tool)));
        body.appendChild(toolTags);
        card.append(picture, body);
        card.addEventListener('click', () => openPreview(design, button));
        grid.appendChild(card);
      });
    }
    [...new Set(designs.map(design => design.category).filter(category => typeof category === 'string' && category))].forEach(category => {
      const button = el('button', 'filter-btn', category);
      button.type = 'button';
      button.dataset.filter = category;
      button.setAttribute('aria-pressed', 'false');
      bar.appendChild(button);
    });
    bar?.addEventListener('click', event => {
      const button = event.target.closest('.filter-btn');
      if (!button) return;
      bar.querySelectorAll('.filter-btn').forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      render(button.dataset.filter);
    });
    render();
    close?.addEventListener('click', () => dialog.close());
    dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog?.addEventListener('close', () => previewTrigger?.focus());
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const mobile = window.matchMedia('(max-width: 900px)');
    document.documentElement.classList.add('profile-enhanced');
    function setMenu(open) {
      toggle?.classList.toggle('active', open);
      menu?.classList.toggle('active', open);
      toggle?.setAttribute('aria-expanded', String(open));
      if (menu) menu.inert = mobile.matches && !open;
    }
    setMenu(false);
    toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    mobile.addEventListener('change', () => setMenu(false));
    menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', event => { if (!navbar?.contains(event.target)) setMenu(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    const back = document.getElementById('backToTop');
    function updateScroll() {
      navbar?.classList.toggle('scrolled', window.scrollY > 40);
      back?.classList.toggle('visible', window.scrollY > 600);
      if (back) back.tabIndex = window.scrollY > 600 ? 0 : -1;
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    back?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  });
})();

