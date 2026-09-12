// Small, dependency-free interactions shared by the public portfolio pages.
(() => {
  'use strict';
  function init() {
    // Preserve bookmarks from the former home and profile layouts.
    function resolveLegacyHash() {
      const target = { '#work': '#projects', '#expertise': '#skills' }[location.hash];
      if (!target || !document.querySelector(target)) return;
      history.replaceState(null, '', location.pathname + location.search + target);
      document.querySelector(target).scrollIntoView();
    }
    resolveLegacyHash();
    addEventListener('hashchange', resolveLegacyHash);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    // Keep Tab within the active modal, including at the browser chrome boundary.
    document.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const modal = document.querySelector('dialog[open]');
      if (!modal) return;
      const focusable = [...modal.querySelectorAll('a[href],button,input,textarea,select,iframe,[tabindex]')]
        .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
      if (!focusable.length) { event.preventDefault(); modal.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    });
    let toast = document.getElementById('site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.id = 'site-toast';
      toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    let toastTimer;
    function announce(message) {
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add('is-visible');
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
    }
    async function copyEmail(email) {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(email);
        announce('Email address copied. Let’s start a conversation.');
      } catch {
        announce('Email: ' + email + ' — select the address to copy it.');
      }
    }
    document.querySelectorAll('[data-copy-email]').forEach(button => {
      button.addEventListener('click', () => copyEmail(button.dataset.copyEmail || document.querySelector('.contact-items a[href^="mailto:"]')?.getAttribute('href').slice(7).split('?')[0] || 'samsudeenashad@gmail.com'));
    });
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    const clocks = document.querySelectorAll('[data-local-time]');
    if (clocks.length) {
      const format = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false });
      const updateTime = () => { if (!document.hidden) clocks.forEach(el => { el.textContent = format.format(new Date()); }); };
      updateTime();
      setInterval(updateTime, 60000);
      document.addEventListener('visibilitychange', updateTime);
    }
    const nav = document.querySelector('.studio-nav');
    const toggle = nav?.querySelector('[data-menu-toggle]');
    const mobile = matchMedia('(max-width: 700px)');
    function setMenu(open, focus = false) {
      nav?.classList.toggle('menu-open', open);
      toggle?.setAttribute('aria-expanded', String(open));
      toggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      if (focus) toggle?.focus();
    }
    toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    mobile.addEventListener('change', () => setMenu(false));
    document.addEventListener('click', event => { if (nav && !nav.contains(event.target)) setMenu(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav?.classList.contains('menu-open')) setMenu(false, true);
    });
    const progress = document.createElement('div');
    progress.className = 'page-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);
    const sections = [...document.querySelectorAll('main section[id]')];
    const links = [...(nav?.querySelectorAll('nav a[href^="#"]') || [])];
    let pending = false;
    function updateScroll() {
      const distance = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0) + ')';
      nav?.classList.toggle('scrolled', scrollY > 40);
      const current = sections.filter(section => section.getBoundingClientRect().top <= 200).pop();
      links.forEach(link => {
        const active = link.hash === '#' + (current?.id || 'home');
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      pending = false;
    }
    function scheduleScroll() { if (!pending) { pending = true; requestAnimationFrame(updateScroll); } }
    addEventListener('scroll', scheduleScroll, { passive: true });
    addEventListener('resize', scheduleScroll, { passive: true });
    updateScroll();
    // Content is visible by default. Only enhance below-fold elements after observing them.
    if ('IntersectionObserver' in window && !reduced.matches) {
      const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        reveal.unobserve(entry.target);
      }), { threshold: 0.08, rootMargin: '0px 0px 30px 0px' });
      const targets = document.querySelectorAll('[data-reveal], [data-aos]');
      targets.forEach(el => {
        if (el.getBoundingClientRect().top > innerHeight - 30) { reveal.observe(el); el.classList.add('reveal-ready'); }
      });
      reduced.addEventListener('change', () => {
        if (reduced.matches) { targets.forEach(el => el.classList.add('is-revealed')); reveal.disconnect(); }
      });
    }
    // Native modal dialogs provide focus containment and Escape dismissal.
    if (!('HTMLDialogElement' in window)) return;
    const prefix = location.pathname.includes('/about/') ? '../start/' : '';
    const profile = location.pathname.endsWith('/start/index.html') ? '' : prefix + 'index.html';
    const commands = [
      ['Home', profile + '#home', 'Navigate'],
      ['About & profile', profile + '#about', 'Navigate'],
      ['Projects & source code', profile + '#projects', 'Navigate'],
      ['Skills & technologies', profile + '#skills', 'Navigate'],
      ['Experience & education', profile + '#experience', 'Navigate'],
      ['Certifications & achievements', profile + '#certifications', 'Navigate'],
      ['GitHub activity', profile + '#github-profile', 'Navigate'],
      ['Design gallery', prefix + 'designs.html', 'Navigate'],
      ['References', profile + '#references', 'Navigate'],
      ['Contact & message', profile + '#contact', 'Navigate'],
      ['Download résumé / CV', prefix + '../Ashad CV White.pdf', 'Download'],
      ['Copy email address', 'copy', 'Quick action'],
    ];
    const dialog = document.createElement('dialog');
    dialog.className = 'command-dialog';
    dialog.setAttribute('aria-label', 'Quick navigation');
    dialog.innerHTML = '<div class="command-search-row"><span aria-hidden="true">⌘</span><input type="search" placeholder="Where would you like to go?" aria-label="Search portfolio navigation" autocomplete="off"><button type="button" aria-label="Close quick navigation">Esc</button></div><div class="command-options" aria-label="Navigation results"></div><div class="command-footer"><span>↑ ↓ to explore · Enter to open</span><span>Esc to close</span></div>';
    document.body.append(dialog);
    const input = dialog.querySelector('input');
    const options = dialog.querySelector('.command-options');
    let selection = 0;
    let opener;
    function highlight() {
      [...options.querySelectorAll('a,button')].forEach((el, i) => el.toggleAttribute('data-selected', i === selection));
    }
    function render() {
      options.replaceChildren();
      selection = 0;
      commands.filter(item => item[0].toLowerCase().includes(input.value.trim().toLowerCase())).forEach(([title, href, type]) => {
        const el = document.createElement(href === 'copy' ? 'button' : 'a');
        if (href === 'copy') { el.type = 'button'; el.addEventListener('click', () => copyEmail('samsudeenashad@gmail.com')); }
        else { el.href = href; if (type === 'Download') el.setAttribute('download', 'Samsudeen_Ashad_CV.pdf'); }
        const label = document.createElement('span');
        label.textContent = title;
        const detail = document.createElement('small');
        detail.textContent = type;
        el.append(label, detail);
        el.addEventListener('click', () => dialog.close());
        el.addEventListener('focus', () => { selection = [...options.children].indexOf(el); highlight(); });
        options.append(el);
      });
      if (!options.children.length) {
        const empty = document.createElement('p');
        empty.className = 'command-empty';
        empty.textContent = 'No matches. Try projects, skills, or contact.';
        options.append(empty);
      }
      highlight();
    }
    function openPalette() {
      if (document.querySelector('dialog[open]')) return;
      opener = document.activeElement;
      setMenu(false);
      input.value = '';
      render();
      dialog.showModal();
      input.focus();
    }
    input.addEventListener('input', render);
    dialog.querySelector('.command-search-row button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
    dialog.addEventListener('keydown', event => {
      // Search inputs can consume the first Escape to clear their value.
      if (event.key === 'Escape') { event.preventDefault(); dialog.close(); return; }
      const items = [...options.querySelectorAll('a,button')];
      if (['ArrowDown', 'ArrowUp'].includes(event.key) && items.length) {
        event.preventDefault();
        selection = (selection + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        highlight();
        items[selection].scrollIntoView({ block: 'nearest' });
      }
      if (event.key === 'Enter' && document.activeElement === input && items.length) { event.preventDefault(); items[selection].click(); }
    });
    document.querySelectorAll('[data-command-open]').forEach(button => button.addEventListener('click', openPalette));
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.open) dialog.close(); else openPalette();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
