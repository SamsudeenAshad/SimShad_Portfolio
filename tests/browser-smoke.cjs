/**
 * Browser regression checks for the static portfolio.
 * Start: python -m http.server 8765 --bind 127.0.0.1
 * Run:   node tests/browser-smoke.cjs
 * Optional: BASE_URL, PLAYWRIGHT_MODULE_PATH, CHROME_PATH, SCREENSHOTS_DIR, SMOKE_MATCH.
 * External requests are blocked deliberately to exercise offline fallbacks.
 * Contact checks never submit a valid message or open an external mail client.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_MODULE_PATH, 'playwright', 'playwright-core'];
  if (process.platform === 'win32') candidates.push(path.join(os.homedir(), 'AppData/Roaming/npm/node_modules/n8n/node_modules/playwright'));
  for (const candidate of candidates.filter(Boolean)) {
    try { return require(candidate); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }
  }
  throw new Error('Playwright is required for browser tests. Set PLAYWRIGHT_MODULE_PATH to an existing installation.');
}

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8765').replace(/\/$/, '');
const origin = new URL(BASE).origin;
const screenshots = process.env.SCREENSHOTS_DIR;
const pageRoutes = ['start/index.html', 'start/profile.html', 'start/designs.html'];
const preservedSections = ['home', 'about', 'skills', 'projects', 'experience', 'github-profile', 'certifications', 'references', 'contact'];
const preservedProjects = [
  'Quizer AI - Quiz Generation Platform', 'Tea House - Modern Tea Store',
  'Dashboard - Analytics Platform', 'MathMaster Quiz Competition Site', 'Business Profile Client',
  'AI-Tutor - Intelligent Learning Assistant', 'Baminithiya - Disaster Management System'
];
const preservedProjectLinks = [
  'https://github.com/SamsudeenAshad/Quizer-AI-', 'https://github.com/SamsudeenAshad/Tea-House',
  'https://github.com/SamsudeenAshad/Dashboard', 'https://github.com/samsudeenashad',
  'https://github.com/SamsudeenAshad/business-profile-client', 'https://github.com/HexaElite/AI-Tutor',
  'https://github.com/Adhishtanaka/Baminithiya', 'https://github.com/SamsudeenAshad/disa'
];
const results = [];
let browser;

async function check(name, fn) {
  if (process.env.SMOKE_MATCH && !new RegExp(process.env.SMOKE_MATCH, 'i').test(name)) return;
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.error(`FAIL ${name}\n${error.message}`);
  }
}

async function context(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, ...options });
  await ctx.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['http:', 'https:'].includes(url.protocol) && url.origin !== origin ? route.abort() : route.continue();
  });
  return ctx;
}

async function open(ctx, route) {
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  page.runtimeErrors = [];
  page.localFailures = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(origin) && response.status() >= 400) page.localFailures.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, `${route} must load`);
  await page.waitForTimeout(600);
  return page;
}

async function assertHealthy(page) {
  assert.deepEqual(page.runtimeErrors, [], 'No uncaught JavaScript exceptions');
  assert.deepEqual(page.localFailures, [], 'No failed local assets');
}

async function assertNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(dimensions.document <= dimensions.width + 1, `Horizontal overflow: ${JSON.stringify(dimensions)}`);
}

async function responsivePages() {
  for (const width of [360, 390, 768, 1440]) {
    for (const route of [...pageRoutes, 'about/samsudeen-ashad.html']) {
      await check(`${route} at ${width}px: assets, content, overflow`, async () => {
        const ctx = await context({ viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768 });
        try {
          const page = await open(ctx, route);
          assert.ok(await page.locator('h1').isVisible(), 'The main heading must be visible');
          await assertNoOverflow(page);
          // Scrolling exercises reveal observers and ensures the page remains stable.
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(300);
          await assertNoOverflow(page);
          await assertHealthy(page);
          if (screenshots && [390, 1440].includes(width)) {
            fs.mkdirSync(screenshots, { recursive: true });
            await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
            await page.waitForTimeout(300);
            await page.screenshot({ path: path.join(screenshots, `${path.basename(route, '.html')}-${width}.png`), fullPage: true });
          }
        } finally { await ctx.close(); }
      });
    }
  }
}

async function profileContracts() {
  await check('Profile retains sections, projects, original URLs, contact and CV', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      const page = await open(ctx, 'start/profile.html');
      for (const id of preservedSections) assert.equal(await page.locator(`section#${id}`).count(), 1, `Retain #${id}`);
      const titles = await page.locator('.project-card h3').allTextContents();
      assert.deepEqual(titles.map(x => x.trim()), preservedProjects);
      const links = await page.locator('.project-card a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
      for (const href of preservedProjectLinks) assert.ok(links.includes(href), `Retain project URL ${href}`);
      for (const href of ['mailto:samsudeenashad@gmail.com', 'tel:+94705390110', 'https://www.linkedin.com/in/samsudeenashad/']) {
        assert.ok(await page.locator(`a[href="${href}"]`).count(), `Retain contact ${href}`);
      }
      const cv = page.locator('a.btn-cv');
      assert.ok(await cv.getAttribute('download'), 'Resume remains downloadable');
      const response = await ctx.request.get(new URL(await cv.getAttribute('href'), page.url()).href);
      assert.equal(response.status(), 200);
      assert.match(response.headers()['content-type'], /pdf/);
      assert.ok((await response.body()).subarray(0, 5).equals(Buffer.from('%PDF-')), 'Resume must be a PDF');
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });

  await check('CV preview supports keyboard close and restores focus', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      const page = await open(ctx, 'start/profile.html');
      const trigger = page.locator('.btn-cv-preview');
      await trigger.focus();
      await page.keyboard.press('Enter');
      await page.locator('#cvModal').waitFor({ state: 'visible' });
      assert.match(await page.locator('#cvIframe').getAttribute('src'), /\.pdf(?:$|[#?])/i);
      await page.keyboard.press('Escape');
      await page.locator('#cvModal').waitFor({ state: 'hidden' });
      assert.ok(await trigger.evaluate(el => document.activeElement === el), 'Restore focus to the preview trigger');
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });

  await check('Contact form has labels, validation and preserves the browser email workflow', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      const page = await open(ctx, 'start/profile.html');
      const form = page.locator('#contactForm');
      for (const name of ['name', 'email', 'subject', 'message']) {
        const input = form.locator(`[name="${name}"]`);
        assert.ok(await input.evaluate(el => el.labels?.length || el.getAttribute('aria-label')), `Accessible ${name} field`);
        await input.fill(name === 'email' ? 'bad-address' : 'x');
      }
      assert.equal(await form.evaluate(el => el.checkValidity()), false, 'Invalid email must fail native validation');
      // Exercise custom validation without a valid message or external navigation.
      await form.evaluate(el => el.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));
      assert.ok(await page.locator('.field-error, [aria-invalid="true"]').count(), 'Expose invalid input feedback');
      assert.equal(page.url(), `${BASE}/start/profile.html`);
      assert.ok(await page.locator('a[href="mailto:samsudeenashad@gmail.com"]').count());
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
}

async function navigation() {
  for (const route of pageRoutes) {
    await check(`${route}: mobile navigation works with keyboard`, async () => {
      const ctx = await context({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      try {
        const page = await open(ctx, route);
        const toggle = page.locator('.nav-toggle, [data-menu-toggle]');
        assert.equal(await toggle.evaluate(el => el.tagName), 'BUTTON');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        await toggle.focus();
        await page.keyboard.press('Enter');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        const menuId = await toggle.getAttribute('aria-controls');
        assert.ok(menuId, 'Toggle identifies its controlled navigation');
        const menu = page.locator(`#${menuId}`);
        assert.ok(await menu.isVisible());
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert.ok(await toggle.evaluate(el => el === document.activeElement), 'Escape restores navigation focus');
        await toggle.click();
        await menu.locator('a').first().click();
        await page.waitForTimeout(200);
        assert.equal(await page.locator('.nav-toggle, [data-menu-toggle]').getAttribute('aria-expanded'), 'false');
        await assertHealthy(page);
      } finally { await ctx.close(); }
    });
  }

  await check('Existing root, biography, admin and showcase routes still resolve', async () => {
    const ctx = await context();
    try {
      const page = await open(ctx, '');
      await page.waitForURL('**/start/index.html', { timeout: 8000 });
      for (const route of ['about/samsudeen-ashad.html', 'start/admin.html', 'design-showcase.html', 'mobile-test.html']) {
        const response = await ctx.request.get(`${BASE}/${route}`);
        assert.equal(response.status(), 200, route);
      }
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
}

async function localStorageOverrides() {
  await check('Admin-managed profile overrides still populate the public profile', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      await ctx.addInitScript(() => {
        localStorage.setItem('portfolio_hero', JSON.stringify({ firstName: 'QA', lastName: 'Profile', subtitle: 'Software Engineer', description: 'Stored profile description.', cvFile: '../Ashad CV White.pdf' }));
        localStorage.setItem('portfolio_about', JSON.stringify({ bio: ['Stored biography.'], stats: [{ value: 8, label: 'QA contributions' }] }));
        localStorage.setItem('portfolio_projects', JSON.stringify([{ title: 'Stored AI project', description: 'Project from the existing admin data.', techTags: ['Python', 'AI'], emoji: 'Q', links: [{ label: 'Repository', url: 'https://example.com/qa-project' }] }]));
        localStorage.setItem('portfolio_contact', JSON.stringify([{ title: 'Email', value: 'qa@example.com', link: 'mailto:qa@example.com' }, { title: 'Phone', value: '+1234567890', link: 'tel:+1234567890' }]));
      });
      const page = await open(ctx, 'start/profile.html');
      assert.equal((await page.locator('.hero-title').innerText()).replace(/\s+/g, ' ').trim(), 'QA Profile');
      assert.match(await page.locator('.about-text').innerText(), /Stored biography/);
      assert.equal(await page.locator('.project-card').count(), 1);
      assert.match(await page.locator('.project-card').innerText(), /Stored AI project/);
      assert.equal(await page.locator('.contact-items a[href="mailto:qa@example.com"]').count(), 1);
      assert.equal(await page.locator('.contact-items a[href="tel:+1234567890"]').count(), 1);
      assert.ok(await page.locator('.project-card').isVisible(), 'Injected projects must be visible');
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
}

async function gallery() {
  await check('Gallery handles an empty portfolio without errors', async () => {
    const ctx = await context();
    try {
      const page = await open(ctx, 'start/designs.html');
      assert.equal(await page.locator('.design-card').count(), 0);
      assert.ok(await page.locator('.designs-empty').isVisible());
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
  await check('Gallery data, category filtering and keyboard preview remain functional', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      await ctx.addInitScript(() => localStorage.setItem('portfolio_designs', JSON.stringify([
        { title: 'QA Interface', category: 'UI / UX', description: 'An interface design.', tools: 'Figma, CSS' },
        { title: 'QA Brand', category: 'Branding', description: 'A brand exploration.', tools: 'Illustrator' }
      ])));
      const page = await open(ctx, 'start/designs.html');
      assert.equal(await page.locator('.design-card').count(), 2);
      const filter = page.getByRole('button', { name: 'Branding', exact: true });
      await filter.click();
      assert.equal(await page.locator('.design-card').count(), 1);
      assert.match(await page.locator('.design-card').innerText(), /QA Brand/);
      const trigger = page.getByRole('button', { name: 'Preview QA Brand', exact: true });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await page.locator('#lightboxOverlay').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#lightboxTitle').innerText(), 'QA Brand');
      await page.keyboard.press('Escape');
      await page.locator('#lightboxOverlay').waitFor({ state: 'hidden' });
      assert.ok(await trigger.evaluate(el => el === document.activeElement), 'Preview returns focus');
      await page.getByRole('button', { name: 'All', exact: true }).click();
      assert.equal(await page.locator('.design-card').count(), 2);
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
}

async function projectExplorer() {
  await check('Selected work filters update cards and accessible filter state', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      const page = await open(ctx, 'start/index.html');
      assert.equal(await page.locator('.selected-project:visible').count(), 3);
      const ai = page.locator('[data-project-filter="ai"]');
      await ai.focus();
      await page.keyboard.press('Space');
      assert.equal(await ai.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.selected-project:visible').count(), 1);
      assert.equal(await page.locator('.selected-project:visible').getAttribute('data-project'), 'quizer');
      await page.locator('[data-project-filter="web"]').click();
      assert.equal(await page.locator('.selected-project:visible').count(), 2);
      assert.equal(await ai.getAttribute('aria-pressed'), 'false');
      await page.locator('[data-project-filter="all"]').click();
      assert.equal(await page.locator('.selected-project:visible').count(), 3);
      assert.match(await page.locator('[data-work-count]').innerText(), /3/);
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
  await check('Project details retain source URL, contain keyboard focus and close with Escape', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      const page = await open(ctx, 'start/index.html');
      const trigger = page.locator('[data-project-open="quizer"]');
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.locator('#project-dialog');
      await dialog.waitFor({ state: 'visible' });
      assert.match(await page.locator('#project-dialog-title').innerText(), /Quizer/i);
      assert.equal(await page.locator('#project-dialog-source').getAttribute('href'), preservedProjectLinks[0]);
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Focus stays in the modal');
      }
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.ok(await trigger.evaluate(el => document.activeElement === el), 'Escape restores project focus');
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
}

async function quickNavigation() {
  for (const route of [...pageRoutes, 'about/samsudeen-ashad.html']) {
    await check(`${route}: command palette search, keyboard selection and focus`, async () => {
      const ctx = await context({ reducedMotion: 'reduce' });
      try {
        const page = await open(ctx, route);
        const trigger = page.locator('[data-command-open]').first();
        await trigger.focus();
        await page.keyboard.press('Control+k');
        const dialog = page.locator('.command-dialog');
        await dialog.waitFor({ state: 'visible' });
        const search = dialog.locator('input');
        await search.fill('not-a-section');
        assert.match(await dialog.innerText(), /No matches/);
        await search.fill('projects');
        assert.equal(await dialog.locator('.command-options a').count(), 1);
        await page.keyboard.press('ArrowDown');
        assert.equal(await dialog.locator('[data-selected]').count(), 1);
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press('Tab');
          assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Focus stays in quick navigation');
        }
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        assert.ok(await trigger.evaluate(el => document.activeElement === el));
        await page.keyboard.press('Control+k');
        await search.fill('projects');
        await page.keyboard.press('Enter');
        await page.waitForURL('**/profile.html#projects');
        await assertHealthy(page);
      } finally { await ctx.close(); }
    });
  }
  await check('Copy email succeeds and reports clipboard unavailability honestly', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    try {
      const page = await open(ctx, 'start/index.html');
      await page.evaluate(() => {
        window.copiedEmail = null;
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
          writeText: async value => { window.copiedEmail = value; }
        } });
      });
      await page.locator('[data-copy-email]').click();
      assert.equal(await page.evaluate(() => window.copiedEmail), 'samsudeenashad@gmail.com');
      assert.match(await page.locator('#site-toast').innerText(), /copied/);
      await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }));
      await page.locator('[data-copy-email]').click();
      assert.match(await page.locator('#site-toast').innerText(), /select the address/);
      await assertHealthy(page);
    } finally { await ctx.close(); }
  });
}

async function reducedMotion() {
  for (const route of pageRoutes) {
    await check(`${route}: reduced motion preserves content and stops continuous animation`, async () => {
      const ctx = await context({ reducedMotion: 'reduce' });
      try {
        await ctx.addInitScript(() => {
          window.graphicsDraws = 0;
          for (const [prototype, method] of [[WebGLRenderingContext.prototype, 'drawElements'], [CanvasRenderingContext2D.prototype, 'fill']]) {
            const original = prototype[method];
            prototype[method] = function (...args) { window.graphicsDraws++; return original.apply(this, args); };
          }
        });
        const page = await open(ctx, route);
        const continuous = await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running' && animation.effect?.getComputedTiming().iterations === Infinity).map(animation => animation.animationName));
        assert.deepEqual(continuous, [], 'Reduced motion should not leave continuous CSS animation running');
        assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
        if (await page.locator('.core-canvas').count()) {
          // Verify that reduced motion stops rendering. Pixel equality can vary
          // with the browser compositor even when the same still is displayed.
          const firstFrame = await page.evaluate(() => window.graphicsDraws);
          assert.ok(firstFrame > 0, 'The hero still frame is rendered');
          await page.waitForTimeout(350);
          const nextFrame = await page.evaluate(() => window.graphicsDraws);
          assert.equal(nextFrame, firstFrame, 'Reduced-motion hero must stop ongoing graphics rendering');
        }
        assert.ok(await page.locator('h1').isVisible());
        await assertHealthy(page);
      } finally { await ctx.close(); }
    });
  }
}

async function noJavaScript() {
  for (const route of ['start/index.html', 'start/profile.html']) {
    await check(`${route}: essential content and links work without JavaScript`, async () => {
      const ctx = await context({ javaScriptEnabled: false });
      try {
        const page = await open(ctx, route);
        assert.ok(await page.locator('h1').isVisible());
        const cv = page.locator('a[download]').first();
        assert.ok(await cv.isVisible(), 'Download CTA remains available');
        assert.ok(await page.locator('a[href="mailto:samsudeenashad@gmail.com"]').count());
        const projectSelector = route.includes('profile') ? '.project-card' : '.selected-project';
        assert.ok(await page.locator(projectSelector).first().isVisible(), 'Projects remain readable');
        await assertNoOverflow(page);
        await assertHealthy(page);
      } finally { await ctx.close(); }
    });
  }
}

async function graphicsFallbacks() {
  for (const disabled of ['webgl', 'all']) {
    await check(`Hero graphics remain usable with ${disabled === 'all' ? 'all canvas contexts' : 'WebGL'} unavailable`, async () => {
      const ctx = await context({ reducedMotion: 'reduce' });
      try {
        await ctx.addInitScript(mode => {
          const getContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            if (mode === 'all' || /webgl/i.test(type)) return null;
            return getContext.call(this, type, ...args);
          };
        }, disabled);
        const page = await open(ctx, 'start/index.html');
        assert.ok(await page.locator('h1').isVisible());
        if (disabled === 'all') {
          assert.ok(await page.locator('.core-fallback').isVisible(), 'CSS artwork supplies the final fallback');
        } else {
          const rendered = await page.locator('.core-canvas').evaluate(canvas => {
            const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            return data.some((value, index) => index % 4 === 3 && value > 0);
          });
          assert.ok(rendered, 'Software fallback paints visible artwork');
        }
        await assertHealthy(page);
      } finally { await ctx.close(); }
    });
  }
}

(async () => {
  const { chromium } = loadPlaywright();
  const windowsChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const executablePath = process.env.CHROME_PATH || (fs.existsSync(windowsChrome) ? windowsChrome : undefined);
  browser = await chromium.launch({ headless: true, executablePath });
  try {
    await responsivePages();
    await profileContracts();
    await navigation();
    await localStorageOverrides();
    await gallery();
    await projectExplorer();
    await quickNavigation();
    await reducedMotion();
    await noJavaScript();
    await graphicsFallbacks();
  } finally { await browser.close(); }
  const failed = results.filter(result => !result.passed);
  console.log(`\n${results.length - failed.length}/${results.length} browser checks passed.`);
  if (failed.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
