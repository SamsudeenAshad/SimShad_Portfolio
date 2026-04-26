// Designs Gallery — loads design data from localStorage and renders the gallery
(() => {
  'use strict';

  const STORAGE_KEY = 'portfolio_designs';

  // ─── Three.js Background (shared pattern) ───────────────────────────────
  function initThreeBackground() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('three-bg');
    if (!canvas) return;
    try {
      const scene    = new THREE.Scene();
      const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const COUNT  = 200;
      const COLORS = [new THREE.Color(0x8b5cf6), new THREE.Color(0xec4899), new THREE.Color(0x3b82f6)];
      const positions = new Float32Array(COUNT * 3);
      const colors    = new Float32Array(COUNT * 3);
      const sizes     = new Float32Array(COUNT);
      const velocities = new Float32Array(COUNT * 3);

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        positions[i3]     = (Math.random() - 0.5) * 120;
        positions[i3 + 1] = (Math.random() - 0.5) * 120;
        positions[i3 + 2] = (Math.random() - 0.5) * 60;
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
        sizes[i] = Math.random() * 2 + 0.6;
        velocities[i3]     = (Math.random() - 0.5) * 0.012;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.012;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.006;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

      const tc = document.createElement('canvas'); tc.width = tc.height = 64;
      const ctx = tc.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);

      const mat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.7,
        map: new THREE.CanvasTexture(tc), sizeAttenuation: true, depthWrite: false });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);

      let animId;
      (function animate() {
        animId = requestAnimationFrame(animate);
        const pos = geo.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
          const i3 = i * 3;
          pos[i3]     += velocities[i3];
          pos[i3 + 1] += velocities[i3 + 1];
          pos[i3 + 2] += velocities[i3 + 2];
          if (Math.abs(pos[i3])     > 60) velocities[i3]     *= -1;
          if (Math.abs(pos[i3 + 1]) > 60) velocities[i3 + 1] *= -1;
          if (Math.abs(pos[i3 + 2]) > 30) velocities[i3 + 2] *= -1;
        }
        geo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      })();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    } catch (e) { /* non-critical */ }
  }

  // ─── Data helpers ────────────────────────────────────────────────────────
  function loadDesigns() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  function isSafeImageUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch { return false; }
  }

  // ─── Build gallery ───────────────────────────────────────────────────────
  function buildFilters(designs) {
    const bar = document.getElementById('filtersBar');
    if (!bar) return;
    const categories = [...new Set(designs.map(d => d.category).filter(Boolean))];
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = cat;
      btn.textContent = cat;
      bar.appendChild(btn);
    });
  }

  function renderCard(design) {
    const card = document.createElement('div');
    card.className = 'design-card';
    card.dataset.category = design.category || '';

    const tools = (design.tools || '').split(',').map(t => t.trim()).filter(Boolean);
    const toolTags = tools.map(t => `<span class="design-tool-tag">${escHtml(t)}</span>`).join('');
    const safeImg = design.imageUrl && isSafeImageUrl(design.imageUrl);

    card.innerHTML = `
      <div class="design-card-image">
        ${safeImg
          ? `<img src="${escAttr(design.imageUrl)}" alt="${escAttr(design.title)}" loading="lazy">`
          : `<div class="design-card-placeholder"><span>🎨</span><span>No preview</span></div>`}
        <div class="design-card-overlay">
          <button class="design-card-overlay-btn" aria-label="Preview ${escAttr(design.title)}">
            <i class="fas fa-expand-alt"></i> Preview
          </button>
        </div>
      </div>
      <div class="design-card-body">
        <p class="design-card-category">${escHtml(design.category || 'Design')}</p>
        <h3 class="design-card-title">${escHtml(design.title)}</h3>
        <p class="design-card-desc">${escHtml(design.description || '')}</p>
        ${toolTags ? `<div class="design-card-tools">${toolTags}</div>` : ''}
      </div>`;

    card.addEventListener('click', () => openLightbox(design));
    return card;
  }

  function renderGallery(designs, filter = 'all') {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = filter === 'all' ? designs : designs.filter(d => d.category === filter);

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="designs-empty">
          <i class="fas fa-palette"></i>
          <h3>${filter === 'all' ? 'No designs yet' : `No designs in "${escHtml(filter)}"`}</h3>
          <p>Designs will appear here once added via the admin panel.</p>
        </div>`;
      return;
    }

    filtered.forEach(d => grid.appendChild(renderCard(d)));
  }

  // ─── Lightbox ─────────────────────────────────────────────────────────
  function openLightbox(design) {
    const overlay  = document.getElementById('lightboxOverlay');
    const imgWrap  = document.getElementById('lightboxImageWrap');
    const catEl    = document.getElementById('lightboxCategory');
    const titleEl  = document.getElementById('lightboxTitle');
    const descEl   = document.getElementById('lightboxDesc');
    const toolsEl  = document.getElementById('lightboxTools');
    if (!overlay) return;

    // Image area (keep close button)
    const closeBtn = document.getElementById('lightboxClose');
    imgWrap.innerHTML = '';
    if (design.imageUrl && isSafeImageUrl(design.imageUrl)) {
      const img = document.createElement('img');
      img.src = design.imageUrl;
      img.alt = design.title;
      imgWrap.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'lightbox-placeholder';
      ph.textContent = '🎨';
      imgWrap.appendChild(ph);
    }
    imgWrap.appendChild(closeBtn);

    catEl.textContent  = design.category || 'Design';
    titleEl.textContent = design.title;
    descEl.textContent  = design.description || '';

    const tools = (design.tools || '').split(',').map(t => t.trim()).filter(Boolean);
    toolsEl.innerHTML = tools.map(t => `<span class="design-tool-tag">${escHtml(t)}</span>`).join('');

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ─── Escape helpers ────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escAttr(str) { return escHtml(str); }

  // ─── Navbar helpers (same pattern as profile.js) ──────────────────────
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const menu   = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('open');
      });
      menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          menu.classList.remove('open');
        });
      });
    }
  }

  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ─── Init ──────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 700, once: true, offset: 60 });
    initThreeBackground();
    initNavbar();
    initBackToTop();

    const designs = loadDesigns();
    buildFilters(designs);
    renderGallery(designs);

    // Filter buttons
    document.getElementById('filtersBar')?.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGallery(designs, btn.dataset.filter);
    });

    // Lightbox close
    document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
    document.getElementById('lightboxOverlay')?.addEventListener('click', e => {
      if (e.target === document.getElementById('lightboxOverlay')) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  });
})();
