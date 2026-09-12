// Profile interactions. Content and links remain usable without JavaScript.
(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const mobileQuery = window.matchMedia('(max-width: 900px)');
    document.documentElement.classList.add('profile-enhanced');
    function setMenu(open, returnFocus = false) {
      menu?.classList.toggle('active', open);
      toggle?.classList.toggle('active', open);
      toggle?.setAttribute('aria-expanded', String(open));
      if (menu) menu.inert = mobileQuery.matches && !open;
      if (returnFocus) toggle?.focus();
    }
    setMenu(false);
    toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    mobileQuery.addEventListener('change', () => setMenu(false));
    menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', event => { if (!navbar?.contains(event.target)) setMenu(false); });
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
      const counters = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const original = el.textContent.trim();
          const match = original.match(/^(\d+)(.*)$/);
          counters.unobserve(el);
          if (!match) return;
          const target = Number(match[1]);
          let started;
          const tick = time => {
            if (!started) started = time;
            const progress = Math.min((time - started) / 1100, 1);
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3)))) + match[2];
            if (progress < 1 && !reducedMotion.matches) requestAnimationFrame(tick);
            else el.textContent = original;
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('.stat h3, .stat-card h3').forEach(el => counters.observe(el));
    }
    // Schematic illustrations, not screenshots or fabricated product metrics.
    const schemes = [
      ['QUIZER AI', 'Create. Question. Learn.', 'PROMPT', 'GENERATE', 'QUIZ'],
      ['TEA HOUSE', 'A considered collection.', 'DISCOVER', 'EXPLORE', 'ENJOY'],
      ['DASHBOARD', 'Make sense of the data.', 'COLLECT', 'VISUALIZE', 'EXPLORE'],
      ['MATHMASTER', 'Every problem, a possibility.', 'COMPETE', 'SOLVE', 'SCORE'],
      ['BUSINESS PROFILE', 'A place for your business.', 'PROFILE', 'MANAGE', 'CONNECT'],
      ['AI-TUTOR', 'Learning, made personal.', 'ASK', 'UNDERSTAND', 'GROW'],
      ['BAMINITHIYA', 'Connect. Coordinate. Respond.', 'MONITOR', 'ALERT', 'RESPOND'],
    ];
    document.querySelectorAll('.project-card').forEach((card, index) => {
      const placeholder = card.querySelector('.project-placeholder');
      if (!placeholder) return;
      const title = card.querySelector('h3')?.textContent || 'Project';
      const scheme = schemes.find(item => title.toUpperCase().includes(item[0]))
        || [title.split(' - ')[0].toUpperCase(), 'An idea, brought to life.', 'DESIGN', 'BUILD', 'REFINE'];
      placeholder.className = 'project-placeholder project-schematic schematic-' + index % 4;
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.replaceChildren();
      const label = document.createElement('span');
      label.className = 'schematic-label';
      label.textContent = scheme[0];
      const heading = document.createElement('strong');
      heading.textContent = scheme[1];
      const orbit = document.createElement('span');
      orbit.className = 'schematic-orbit';
      orbit.innerHTML = '<span></span><span></span><span></span><b>↗</b>';
      const flow = document.createElement('span');
      flow.className = 'schematic-flow';
      scheme.slice(2).forEach(step => {
        const node = document.createElement('span');
        node.textContent = step;
        flow.appendChild(node);
      });
      placeholder.append(label, heading, orbit, flow);
      const number = document.createElement('span');
      number.className = 'project-number';
      number.textContent = String(index + 1).padStart(2, '0') + ' / SELECTED PROJECT';
      card.querySelector('.project-content')?.prepend(number);
      const links = [...card.querySelectorAll('.project-links a')];
      links.forEach((link, linkIndex) => {
        if (/Live Demo/i.test(link.textContent) && /github\.com/.test(link.href)) link.textContent = 'Repository';
        if (linkIndex > 0 && links[0].href === link.href) link.remove();
      });
    });
    const timelineItems = [...document.querySelectorAll('.timeline-item')];
    const trackedSections = [...document.querySelectorAll('section[id]')];
    let scrollPending = false;
    function updateScroll() {
      navbar?.classList.toggle('scrolled', window.scrollY > 40);
      backToTop?.classList.toggle('visible', window.scrollY > 650);
      if (backToTop) backToTop.tabIndex = window.scrollY > 650 ? 0 : -1;
      const current = trackedSections.filter(section => section.getBoundingClientRect().top < 180).pop();
      menu?.querySelectorAll('a[href^="#"]').forEach(link => {
        const active = link.getAttribute('href') === '#' + current?.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      timelineItems.forEach(item => item.classList.toggle('is-reached', item.getBoundingClientRect().top < window.innerHeight * 0.8));
      scrollPending = false;
    }
    window.addEventListener('scroll', () => {
      if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
    }, { passive: true });
    updateScroll();
    backToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      document.getElementById('home')?.focus({ preventScroll: true });
    });
    const cvDialog = document.getElementById('cvModal');
    const cvFrame = document.getElementById('cvIframe');
    const cvTrigger = document.querySelector('.btn-cv-preview');
    const closeCv = () => { cvDialog?.close(); if (cvFrame) cvFrame.src = 'about:blank'; };
    cvTrigger?.addEventListener('click', () => {
      if (!cvDialog || !cvFrame) return;
      cvFrame.src = document.querySelector('.btn-cv')?.href || '../Ashad CV White.pdf';
      const fallback = cvDialog.querySelector('[data-cv-open]');
      if (fallback) fallback.href = cvFrame.src;
      cvDialog.showModal();
    });
    cvDialog?.querySelector('.cv-modal-close')?.addEventListener('click', closeCv);
    cvDialog?.addEventListener('click', event => { if (event.target === cvDialog) closeCv(); });
    cvDialog?.addEventListener('close', () => {
      if (cvFrame) cvFrame.src = 'about:blank';
      cvTrigger?.focus();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    const form = document.getElementById('contactForm');
    const status = document.getElementById('contactStatus');
    if (form) {
      const fields = [...form.querySelectorAll('input, textarea')];
      const validate = field => {
        const value = field.value.trim();
        const min = { name: 2, subject: 5, message: 10 }[field.name];
        field.setCustomValidity(min && value.length < min ? 'Please enter at least ' + min + ' characters.' : '');
        field.setAttribute('aria-invalid', String(!field.validity.valid));
        return field.validity.valid;
      };
      fields.forEach(field => field.addEventListener('input', () => {
        field.setCustomValidity('');
        field.removeAttribute('aria-invalid');
        if (status) status.textContent = '';
      }));
      function prepareEmail() {
        fields.forEach(validate);
        if (!form.reportValidity()) return false;
        const values = Object.fromEntries(new FormData(form));
        const subject = encodeURIComponent(values.subject.trim());
        const body = encodeURIComponent('Name: ' + values.name.trim() + '\nEmail: ' + values.email.trim() + '\n\n' + values.message.trim());
        window.location.href = 'mailto:samsudeenashad@gmail.com?subject=' + subject + '&body=' + body;
        if (status) status.textContent = 'Your email draft is ready. Send it from your email app. Your message is kept here if you need to copy it.';
        return true;
      }
      form.addEventListener('submit', event => { event.preventDefault(); prepareEmail(); });
      if (navigator.modelContext && typeof navigator.modelContext.registerTool === 'function') {
        try {
          navigator.modelContext.registerTool({
            name: 'contactSamsudeenAshad',
            description: 'Prepare an email draft to Samsudeen Ashad. The user sends it in their email application.',
            inputSchema: { type: 'object', properties: {
              name: { type: 'string', minLength: 2 }, email: { type: 'string', format: 'email' },
              subject: { type: 'string', minLength: 5 }, message: { type: 'string', minLength: 10 },
            }, required: ['name', 'email', 'subject', 'message'], additionalProperties: false },
            execute: async payload => {
              fields.forEach(field => { if (typeof payload[field.name] === 'string') field.value = payload[field.name]; });
              return { status: prepareEmail() ? 'email_draft_prepared' : 'validation_failed', recipient: 'samsudeenashad@gmail.com' };
            },
          });
        } catch (error) { console.warn('Contact automation is unavailable.', error); }
      }
    }
  });
})();

