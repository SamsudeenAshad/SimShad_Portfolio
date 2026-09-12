// Selected work is rendered in HTML; filters and details progressively enhance it.
(() => {
  'use strict';
  const cards = [...document.querySelectorAll('[data-project]')];
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('is-active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    const category = button.dataset.projectFilter;
    cards.forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) card.classList.add('is-revealed');
    });
    const count = cards.filter(card => !card.hidden).length;
    document.querySelector('[data-work-count]').textContent = 'Showing ' + count + ' project' + (count === 1 ? '' : 's');
  }));
  const dialog = document.getElementById('project-dialog');
  if (!dialog?.showModal) return;
  let opener;
  document.querySelectorAll('[data-project-open]').forEach(button => button.addEventListener('click', () => {
    const card = cards.find(item => item.dataset.project === button.dataset.projectOpen);
    if (!card) return;
    opener = button;
    const info = card.querySelector('.selected-project-info');
    document.getElementById('project-dialog-title').textContent = info.querySelector('.project-name').textContent;
    document.getElementById('project-dialog-category').textContent = info.querySelector('.project-type').firstElementChild.textContent;
    document.getElementById('project-dialog-description').textContent = info.querySelector('p:not(.project-name)').textContent;
    document.getElementById('project-dialog-tech').replaceChildren(...[...info.querySelector('.tech-tags').children].map(el => el.cloneNode(true)));
    document.getElementById('project-dialog-context').textContent = button.dataset.projectOpen === 'baminithiya'
      ? 'A collaborative disaster-management project for NBQSA. My contribution focused on frontend design and development. The repository documents the implementation; a TypeScript version is also linked in the full project collection.'
      : 'Explore the repository for the implementation and project structure. The artwork in this portfolio is an interface concept based on the project description, rather than a production screenshot.';
    document.getElementById('project-dialog-source').href = info.querySelector('.project-actions a').href;
    dialog.showModal();
  }));
  dialog.querySelector('[data-project-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
