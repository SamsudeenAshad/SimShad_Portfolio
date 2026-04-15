// Portfolio Data Loader — reads admin-managed data from localStorage
// and applies it to the public profile page.
(() => {
  'use strict';

  const KEYS = {
    hero: 'portfolio_hero',
    about: 'portfolio_about',
    skills: 'portfolio_skills',
    projects: 'portfolio_projects',
    experience: 'portfolio_experience',
    github: 'portfolio_github',
    certifications: 'portfolio_certifications',
    softskills: 'portfolio_softskills',
    references: 'portfolio_references',
    contact: 'portfolio_contact',
  };

  function getData(key) {
    try {
      const raw = localStorage.getItem(KEYS[key]);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
  }

  function sanitizeUrl(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
      if (url.startsWith('/') || url.startsWith('../') || url.startsWith('./')) return url;
    } catch {
      if (url.startsWith('/') || url.startsWith('../') || url.startsWith('./') || url.startsWith('assets/')) return url;
    }
    return '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyHero();
    applyAbout();
    applySkills();
    applyProjects();
    applyExperience();
    applyGithub();
    applyCertifications();
    applySoftSkills();
    applyReferences();
    applyContact();
  });

  function applyHero() {
    const data = getData('hero');
    if (!data) return;

    const titleEl = document.querySelector('.hero-title');
    if (titleEl) {
      titleEl.innerHTML = '';
      const highlight = document.createElement('span');
      highlight.className = 'highlight';
      highlight.textContent = data.firstName || '';
      titleEl.appendChild(highlight);
      titleEl.appendChild(document.createTextNode(' ' + (data.lastName || '')));
    }

    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) subtitle.textContent = data.subtitle || '';

    const desc = document.querySelector('.hero-description');
    if (desc) desc.textContent = data.description || '';

    const img = document.querySelector('.profile-avatar');
    if (img && data.profileImage) {
      const safe = sanitizeUrl(data.profileImage);
      if (safe) img.setAttribute('src', safe);
    }

    const cvLink = document.querySelector('.btn-cv');
    if (cvLink && data.cvFile) {
      const safe = sanitizeUrl(data.cvFile);
      if (safe) cvLink.setAttribute('href', safe);
    }
  }

  function applyAbout() {
    const data = getData('about');
    if (!data) return;

    if (data.bio && Array.isArray(data.bio)) {
      const aboutText = document.querySelector('.about-text');
      if (aboutText) {
        const existingPs = aboutText.querySelectorAll('p');
        existingPs.forEach(p => p.remove());
        const statsDiv = aboutText.querySelector('.about-stats');
        data.bio.forEach(text => {
          const p = document.createElement('p');
          p.textContent = text;
          aboutText.insertBefore(p, statsDiv);
        });
      }
    }

    if (data.stats && Array.isArray(data.stats)) {
      const statsContainer = document.querySelector('.about-stats');
      if (statsContainer) {
        statsContainer.innerHTML = '';
        data.stats.forEach(stat => {
          const div = document.createElement('div');
          div.className = 'stat';
          const h3 = document.createElement('h3');
          h3.className = 'counter';
          h3.setAttribute('data-target', String(stat.value));
          h3.textContent = String(stat.value);
          const p = document.createElement('p');
          p.textContent = stat.label;
          div.appendChild(h3);
          div.appendChild(p);
          statsContainer.appendChild(div);
        });
      }
    }
  }

  function applySkills() {
    const data = getData('skills');
    if (!data || !Array.isArray(data)) return;

    const grid = document.querySelector('.skills-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach((cat, ci) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'skill-category';
      catDiv.setAttribute('data-aos', 'fade-up');
      catDiv.setAttribute('data-aos-delay', String((ci + 1) * 100));

      const h3 = document.createElement('h3');
      h3.innerHTML = '<i class="' + escapeHtml(cat.icon || 'fas fa-code') + '"></i> ';
      h3.appendChild(document.createTextNode(cat.title || ''));
      catDiv.appendChild(h3);

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'skill-items';

      (cat.items || []).forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'skill-item';
        itemDiv.setAttribute('data-skill', (item.name || '').toLowerCase().replace(/[^a-z0-9]/g, ''));

        const iconDiv = document.createElement('div');
        iconDiv.className = 'skill-icon';
        if (item.icon && (item.icon.startsWith('fa') || item.icon.includes(' fa'))) {
          iconDiv.innerHTML = '<i class="' + escapeHtml(item.icon) + '"></i>';
        } else {
          const span = document.createElement('span');
          span.className = 'custom-icon';
          span.textContent = item.icon || item.name || '';
          iconDiv.appendChild(span);
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'skill-info';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'skill-name';
        nameSpan.textContent = item.name || '';
        const levelSpan = document.createElement('span');
        levelSpan.className = 'skill-level';
        levelSpan.textContent = item.level || '';
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(levelSpan);

        itemDiv.appendChild(iconDiv);
        itemDiv.appendChild(infoDiv);
        itemsDiv.appendChild(itemDiv);
      });

      catDiv.appendChild(itemsDiv);
      grid.appendChild(catDiv);
    });
  }

  function applyProjects() {
    const data = getData('projects');
    if (!data || !Array.isArray(data)) return;

    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach((proj, pi) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', String((pi + 1) * 100));

      const imageDiv = document.createElement('div');
      imageDiv.className = 'project-image';

      const placeholder = document.createElement('div');
      placeholder.className = 'project-placeholder';
      placeholder.textContent = proj.emoji || '📁';
      imageDiv.appendChild(placeholder);

      const overlay = document.createElement('div');
      overlay.className = 'project-overlay';
      const linksDiv = document.createElement('div');
      linksDiv.className = 'project-links';
      (proj.links || []).forEach((link, li) => {
        const a = document.createElement('a');
        const safeUrl = sanitizeUrl(link.url);
        a.setAttribute('href', safeUrl || '#');
        a.className = li === 0 ? 'btn btn-primary' : 'btn btn-secondary';
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.textContent = link.label || 'View';
        linksDiv.appendChild(a);
      });
      overlay.appendChild(linksDiv);
      imageDiv.appendChild(overlay);

      const content = document.createElement('div');
      content.className = 'project-content';
      const h3 = document.createElement('h3');
      h3.textContent = proj.title || '';
      const p = document.createElement('p');
      p.textContent = proj.description || '';
      const techDiv = document.createElement('div');
      techDiv.className = 'project-tech';
      (proj.techTags || []).forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag;
        techDiv.appendChild(span);
      });
      content.appendChild(h3);
      content.appendChild(p);
      content.appendChild(techDiv);

      card.appendChild(imageDiv);
      card.appendChild(content);
      grid.appendChild(card);
    });
  }

  function applyExperience() {
    const data = getData('experience');
    if (!data || !Array.isArray(data)) return;

    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    timeline.innerHTML = '';

    data.forEach((item, i) => {
      const tItem = document.createElement('div');
      tItem.className = 'timeline-item';
      tItem.setAttribute('data-aos', 'fade-up');
      tItem.setAttribute('data-aos-delay', String((i + 1) * 100));

      const marker = document.createElement('div');
      marker.className = 'timeline-marker';

      const content = document.createElement('div');
      content.className = 'timeline-content';
      const h3 = document.createElement('h3');
      h3.textContent = item.title || '';
      const h4 = document.createElement('h4');
      h4.textContent = (item.organization || '') + (item.dateRange ? ' | ' + item.dateRange : '');
      const p = document.createElement('p');
      p.textContent = item.description || '';
      content.appendChild(h3);
      content.appendChild(h4);
      content.appendChild(p);

      tItem.appendChild(marker);
      tItem.appendChild(content);
      timeline.appendChild(tItem);
    });
  }

  function applyGithub() {
    const data = getData('github');
    if (!data) return;

    if (data.stats && Array.isArray(data.stats)) {
      const statsContainer = document.querySelector('.github-stats');
      if (statsContainer) {
        statsContainer.innerHTML = '';
        data.stats.forEach(stat => {
          const card = document.createElement('div');
          card.className = 'stat-card';
          const h3 = document.createElement('h3');
          h3.textContent = stat.value || '';
          const p = document.createElement('p');
          p.textContent = stat.label || '';
          card.appendChild(h3);
          card.appendChild(p);
          statsContainer.appendChild(card);
        });
      }
    }

    if (data.activities && Array.isArray(data.activities)) {
      const actGrid = document.querySelector('.activity-grid');
      if (actGrid) {
        actGrid.innerHTML = '';
        data.activities.forEach(act => {
          const item = document.createElement('div');
          item.className = 'activity-item';
          const i = document.createElement('i');
          i.className = act.icon || 'fas fa-code-branch';
          const div = document.createElement('div');
          const h4 = document.createElement('h4');
          h4.textContent = act.title || '';
          const p = document.createElement('p');
          p.textContent = act.description || '';
          div.appendChild(h4);
          div.appendChild(p);
          item.appendChild(i);
          item.appendChild(div);
          actGrid.appendChild(item);
        });
      }
    }
  }

  function applyCertifications() {
    const data = getData('certifications');
    if (!data || !Array.isArray(data)) return;

    const grid = document.querySelector('.certifications-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach((cat, ci) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'cert-category';
      catDiv.setAttribute('data-aos', 'fade-up');
      catDiv.setAttribute('data-aos-delay', String((ci + 1) * 100));

      const h3 = document.createElement('h3');
      h3.textContent = (cat.emoji || '') + ' ' + (cat.title || '');
      catDiv.appendChild(h3);

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'cert-items';
      (cat.items || []).forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cert-item';
        const h4 = document.createElement('h4');
        h4.textContent = item.title || '';
        const p = document.createElement('p');
        p.textContent = item.description || '';
        itemDiv.appendChild(h4);
        itemDiv.appendChild(p);
        itemsDiv.appendChild(itemDiv);
      });

      catDiv.appendChild(itemsDiv);
      grid.appendChild(catDiv);
    });
  }

  function applySoftSkills() {
    const data = getData('softskills');
    if (!data || !Array.isArray(data)) return;

    const list = document.querySelector('.soft-skills-list');
    if (!list) return;
    list.innerHTML = '';

    data.forEach(skill => {
      const div = document.createElement('div');
      div.className = 'soft-skill-item';
      div.textContent = skill;
      list.appendChild(div);
    });
  }

  function applyReferences() {
    const data = getData('references');
    if (!data || !Array.isArray(data)) return;

    const grid = document.querySelector('.references-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach((ref, ri) => {
      const card = document.createElement('div');
      card.className = 'reference-card';
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', String((ri + 1) * 100));

      const content = document.createElement('div');
      content.className = 'reference-content';
      const h3 = document.createElement('h3');
      h3.textContent = ref.name || '';
      const h4 = document.createElement('h4');
      h4.textContent = ref.title || '';
      content.appendChild(h3);
      content.appendChild(h4);

      const contactDiv = document.createElement('div');
      contactDiv.className = 'reference-contact';
      if (ref.email) {
        const pe = document.createElement('p');
        pe.innerHTML = '<i class="fas fa-envelope"></i> ';
        pe.appendChild(document.createTextNode(ref.email));
        contactDiv.appendChild(pe);
      }
      if (ref.phone) {
        const pp = document.createElement('p');
        pp.innerHTML = '<i class="fas fa-phone"></i> ';
        pp.appendChild(document.createTextNode(ref.phone));
        contactDiv.appendChild(pp);
      }
      content.appendChild(contactDiv);
      card.appendChild(content);
      grid.appendChild(card);
    });
  }

  function applyContact() {
    const data = getData('contact');
    if (!data || !Array.isArray(data)) return;

    const contactItems = document.querySelector('.contact-items');
    if (!contactItems) return;
    contactItems.innerHTML = '';

    data.forEach(item => {
      let el;
      const safeLink = item.link ? sanitizeUrl(item.link) : '';
      if (safeLink) {
        el = document.createElement('a');
        el.setAttribute('href', safeLink);
        el.className = 'contact-item';
        if (item.isExternal) {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
      } else {
        el = document.createElement('div');
        el.className = 'contact-item';
      }

      const i = document.createElement('i');
      i.className = item.icon || 'fas fa-info-circle';
      el.appendChild(i);

      const div = document.createElement('div');
      const h4 = document.createElement('h4');
      h4.textContent = item.title || '';
      const p = document.createElement('p');
      p.textContent = item.value || '';
      div.appendChild(h4);
      div.appendChild(p);
      el.appendChild(div);

      contactItems.appendChild(el);
    });
  }
})();
