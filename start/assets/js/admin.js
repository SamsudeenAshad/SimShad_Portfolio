// Admin Panel — Designs CRUD Manager
// Stores data in localStorage under key 'portfolio_designs'
(() => {
  'use strict';

  const STORAGE_KEY = 'portfolio_designs';
  const ADMIN_PASS  = 'admin123';

  // ─── Storage helpers ────────────────────────────────────────────────────
  function loadDesigns() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveDesigns(designs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ─── Auth ────────────────────────────────────────────────────────────────
  function isLoggedIn() {
    return sessionStorage.getItem('admin_auth') === '1';
  }

  function login(pass) {
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', '1');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem('admin_auth');
    showLogin();
  }

  // ─── Toast ───────────────────────────────────────────────────────────────
  function toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${escHtml(msg)}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '.3s'; }, 2800);
    setTimeout(() => t.remove(), 3200);
  }

  // ─── Screen switching ────────────────────────────────────────────────────
  function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminLayout').classList.remove('visible');
  }

  function showAdmin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminLayout').classList.add('visible');
    navigateTo('dashboard');
  }

  // ─── Page navigation ─────────────────────────────────────────────────────
  let currentPage = 'dashboard';

  function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.sidebar-nav button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });
    const content = document.getElementById('adminContent');
    if (!content) return;

    switch (page) {
      case 'dashboard': renderDashboard(content); break;
      case 'designs':   renderDesignsList(content); break;
      case 'add':       openDesignModal(null); navigateTo('designs'); break;
    }
  }

  // ─── Dashboard page ──────────────────────────────────────────────────────
  function renderDashboard(container) {
    const designs = loadDesigns();
    const categories = [...new Set(designs.map(d => d.category).filter(Boolean))];

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your designs gallery</p>
        </div>
        <button class="btn btn-primary" id="dashAddBtn">
          <i class="fas fa-plus"></i> Add Design
        </button>
      </div>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num">${designs.length}</div>
          <div class="stat-lbl">Total Designs</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${categories.length}</div>
          <div class="stat-lbl">Categories</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${designs.filter(d => d.imageUrl).length}</div>
          <div class="stat-lbl">With Images</div>
        </div>
      </div>
      ${designs.length ? `
      <div style="margin-bottom:1rem;font-size:.9rem;font-weight:600;color:var(--text-2)">Recent Designs</div>
      <div class="design-list" id="recentList"></div>` : `
      <div class="empty-state">
        <i class="fas fa-palette"></i>
        <h3>No designs yet</h3>
        <p>Click "Add Design" to get started.</p>
      </div>`}`;

    document.getElementById('dashAddBtn')?.addEventListener('click', () => openDesignModal(null));

    if (designs.length) {
      const list = document.getElementById('recentList');
      designs.slice(-5).reverse().forEach(d => list.appendChild(buildDesignItem(d)));
    }
  }

  // ─── Designs list page ───────────────────────────────────────────────────
  function renderDesignsList(container) {
    const designs = loadDesigns();
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>All Designs</h2>
          <p>${designs.length} design${designs.length !== 1 ? 's' : ''} in gallery</p>
        </div>
        <button class="btn btn-primary" id="listAddBtn">
          <i class="fas fa-plus"></i> Add Design
        </button>
      </div>
      ${designs.length
        ? `<div class="design-list" id="designList"></div>`
        : `<div class="empty-state">
             <i class="fas fa-images"></i>
             <h3>No designs yet</h3>
             <p>Add your first design to the gallery.</p>
           </div>`}`;

    document.getElementById('listAddBtn')?.addEventListener('click', () => openDesignModal(null));

    if (designs.length) {
      const list = document.getElementById('designList');
      designs.forEach(d => list.appendChild(buildDesignItem(d)));
    }
  }

  function buildDesignItem(design) {
    const item = document.createElement('div');
    item.className = 'design-item';
    item.innerHTML = `
      <div class="design-item-thumb">
        ${design.imageUrl
          ? `<img src="${escAttr(design.imageUrl)}" alt="${escAttr(design.title)}" loading="lazy">`
          : '🎨'}
      </div>
      <div class="design-item-info">
        <div class="design-item-title">${escHtml(design.title)}</div>
        <div class="design-item-meta">${escHtml(design.date || '')}${design.tools ? ' · ' + escHtml(design.tools) : ''}</div>
        ${design.category ? `<span class="design-item-cat">${escHtml(design.category)}</span>` : ''}
      </div>
      <div class="design-item-actions">
        <button class="btn btn-success btn-sm edit-btn" data-id="${escAttr(design.id)}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${escAttr(design.id)}" data-title="${escAttr(design.title)}">
          <i class="fas fa-trash"></i>
        </button>
      </div>`;

    item.querySelector('.edit-btn').addEventListener('click', () => {
      const d = loadDesigns().find(x => x.id === design.id);
      if (d) openDesignModal(d);
    });
    item.querySelector('.delete-btn').addEventListener('click', () => {
      confirmDelete(design.id, design.title);
    });

    return item;
  }

  // ─── Design Form Modal ───────────────────────────────────────────────────
  function openDesignModal(design) {
    const modal    = document.getElementById('designModal');
    const titleEl  = document.getElementById('modalTitle');
    const idInput  = document.getElementById('designId');
    const titleIn  = document.getElementById('designTitle');
    const catIn    = document.getElementById('designCategory');
    const descIn   = document.getElementById('designDesc');
    const toolsIn  = document.getElementById('designTools');
    const imgIn    = document.getElementById('designImageUrl');
    const dateIn   = document.getElementById('designDate');
    const preview  = document.getElementById('imagePreview');

    titleEl.textContent = design ? 'Edit Design' : 'Add New Design';
    idInput.value       = design ? design.id : '';
    titleIn.value       = design ? design.title : '';
    catIn.value         = design ? (design.category || '') : '';
    descIn.value        = design ? (design.description || '') : '';
    toolsIn.value       = design ? (design.tools || '') : '';
    imgIn.value         = design ? (design.imageUrl || '') : '';
    dateIn.value        = design ? (design.date || '') : '';

    if (design?.imageUrl) {
      preview.src = design.imageUrl;
      preview.classList.add('show');
    } else {
      preview.src = '';
      preview.classList.remove('show');
    }

    modal.classList.add('active');
    titleIn.focus();
  }

  function closeDesignModal() {
    document.getElementById('designModal').classList.remove('active');
    document.getElementById('designForm').reset();
    document.getElementById('imagePreview').classList.remove('show');
  }

  function saveDesign(e) {
    e.preventDefault();
    const id    = document.getElementById('designId').value;
    const title = document.getElementById('designTitle').value.trim();
    const cat   = document.getElementById('designCategory').value.trim();
    const desc  = document.getElementById('designDesc').value.trim();
    const tools = document.getElementById('designTools').value.trim();
    const img   = document.getElementById('designImageUrl').value.trim();
    const date  = document.getElementById('designDate').value;

    if (!title || !cat) { toast('Title and Category are required.', 'error'); return; }

    const designs = loadDesigns();

    if (id) {
      const idx = designs.findIndex(d => d.id === id);
      if (idx !== -1) {
        designs[idx] = { ...designs[idx], title, category: cat, description: desc,
          tools, imageUrl: img, date };
        toast('Design updated successfully.');
      }
    } else {
      designs.push({ id: generateId(), title, category: cat, description: desc,
        tools, imageUrl: img, date, createdAt: new Date().toISOString() });
      toast('Design added to gallery.');
    }

    saveDesigns(designs);
    closeDesignModal();
    navigateTo(currentPage === 'add' ? 'designs' : currentPage);
  }

  // ─── Delete confirm ──────────────────────────────────────────────────────
  let pendingDeleteId = null;

  function confirmDelete(id, title) {
    pendingDeleteId = id;
    document.getElementById('confirmMsg').textContent = `Delete "${title}"? This cannot be undone.`;
    document.getElementById('confirmOverlay').classList.add('active');
  }

  function doDelete() {
    if (!pendingDeleteId) return;
    const designs = loadDesigns().filter(d => d.id !== pendingDeleteId);
    saveDesigns(designs);
    pendingDeleteId = null;
    document.getElementById('confirmOverlay').classList.remove('active');
    toast('Design deleted.');
    navigateTo(currentPage);
  }

  // ─── Escape helpers ──────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escAttr(str) { return escHtml(str); }

  // ─── Init ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Login
    document.getElementById('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const pass = document.getElementById('loginPassword').value;
      if (login(pass)) {
        document.getElementById('loginError').classList.remove('show');
        showAdmin();
      } else {
        document.getElementById('loginError').classList.add('show');
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
      }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    // Design form
    document.getElementById('designForm').addEventListener('submit', saveDesign);
    document.getElementById('modalClose').addEventListener('click', closeDesignModal);
    document.getElementById('cancelDesign').addEventListener('click', closeDesignModal);

    // Close modal on overlay click
    document.getElementById('designModal').addEventListener('click', e => {
      if (e.target === document.getElementById('designModal')) closeDesignModal();
    });

    // Image URL preview
    document.getElementById('designImageUrl').addEventListener('input', e => {
      const preview = document.getElementById('imagePreview');
      const url = e.target.value.trim();
      if (url) {
        preview.src = url;
        preview.classList.add('show');
        preview.onerror = () => { preview.classList.remove('show'); };
      } else {
        preview.classList.remove('show');
        preview.src = '';
      }
    });

    // Confirm delete
    document.getElementById('confirmOk').addEventListener('click', doDelete);
    document.getElementById('confirmCancel').addEventListener('click', () => {
      pendingDeleteId = null;
      document.getElementById('confirmOverlay').classList.remove('active');
    });
    document.getElementById('confirmOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('confirmOverlay')) {
        pendingDeleteId = null;
        document.getElementById('confirmOverlay').classList.remove('active');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDesignModal();
        pendingDeleteId = null;
        document.getElementById('confirmOverlay').classList.remove('active');
      }
    });

    // Auto-login if session exists
    if (isLoggedIn()) {
      showAdmin();
    }
  });
})();
