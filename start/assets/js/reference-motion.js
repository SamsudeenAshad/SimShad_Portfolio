// Reference-inspired atmosphere with a visitor-controlled motion preference.
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let paused = false;
  try { paused = sessionStorage.getItem('portfolio_motion_paused') === 'true'; } catch { /* Storage is optional. */ }
  const hero = document.querySelector('.studio-hero, .profile-page .hero');
  if (hero && !hero.querySelector('[data-motion-toggle]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'motion-toggle profile-motion-control';
    button.dataset.motionToggle = '';
    (hero.querySelector('.hero-text') || hero).append(button);
  }
  const controls = [...document.querySelectorAll('[data-motion-toggle]')];
  function applyPreference() {
    const stopped = paused || reduced.matches;
    root.classList.toggle('motion-paused', stopped);
    controls.forEach(button => {
      button.disabled = reduced.matches;
      button.setAttribute('aria-pressed', String(stopped));
      button.textContent = reduced.matches ? 'Reduced motion enabled' : paused ? 'Resume motion ▶' : 'Pause motion Ⅱ';
    });
    document.dispatchEvent(new CustomEvent('portfolio:motionchange', { detail: { paused: stopped } }));
  }
  controls.forEach(button => button.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('portfolio_motion_paused', String(paused)); } catch { /* Optional preference. */ }
    applyPreference();
  }));
  reduced.addEventListener('change', applyPreference);
  applyPreference();
  const visibility = () => root.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', visibility);
  visibility();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('is-out-of-view', !entry.isIntersecting);
    }));
    document.querySelectorAll('.studio-hero, .discipline-band').forEach(el => observer.observe(el));
  }
  let pending = false;
  function updateDepth() {
    if (hero && !paused && !reduced.matches && !document.hidden) {
      const bounds = hero.getBoundingClientRect();
      if (bounds.bottom > 0) hero.style.setProperty('--hero-drift', String(Math.min(scrollY, innerHeight)));
    }
    pending = false;
  }
  addEventListener('scroll', () => {
    if (!pending && hero) { pending = true; requestAnimationFrame(updateDepth); }
  }, { passive: true });
})();
