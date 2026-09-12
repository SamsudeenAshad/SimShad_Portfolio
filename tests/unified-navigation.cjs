const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/ASUS/AppData/Roaming/npm/node_modules/n8n/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    for (const width of [360, 390, 768, 1024, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.route('**/*', route => route.request().url().startsWith('http') && !route.request().url().startsWith('http://127.0.0.1:8765') ? route.abort() : route.continue());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:8765/start/index.html');
      await page.waitForTimeout(250);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.project-card').count(), 7);
      const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(n => n.id));
      assert.equal(new Set(ids).size, ids.length, 'No duplicate IDs');
      await page.evaluate(() => window.navigationMarker = 'same document');
      for (const id of ['home', 'about', 'skills', 'projects', 'experience', 'contact']) {
        if (width <= 700) await page.locator('[data-menu-toggle]').click();
        await page.locator('#primary-menu a[href="#' + id + '"]').click();
        await page.waitForTimeout(100);
        assert.ok(page.url().endsWith('/index.html#' + id));
        assert.equal(await page.evaluate(() => window.navigationMarker), 'same document');
        assert.equal(await page.locator('#' + id).count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow');
        if (width <= 700) assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'), 'false');
      }
      await page.goto('http://127.0.0.1:8765/start/profile.html?from=legacy#projects');
      await page.waitForURL('**/index.html?from=legacy#projects');
      await page.goto('http://127.0.0.1:8765/start/index.html#work');
      await page.waitForURL('**/index.html#projects');
      await page.locator('.btn-cv-preview').click();
      assert.equal(await page.locator('#cvModal').evaluate(e => e.open), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#cvModal').evaluate(e => e.open), false);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      if (width === 1440) await page.screenshot({ path: '../unified-home.png' });
      assert.deepEqual(errors, []);
      console.log('PASS unified navigation, legacy links, content, CV and overflow at ' + width + 'px');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
