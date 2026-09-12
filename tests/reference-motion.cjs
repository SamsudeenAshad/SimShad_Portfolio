const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/ASUS/AppData/Roaming/npm/node_modules/n8n/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await context.addInitScript(() => {
    window.draws = 0;
    const draw = WebGLRenderingContext.prototype.drawElements;
    WebGLRenderingContext.prototype.drawElements = function (...args) { window.draws++; return draw.apply(this, args); };
  });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:8765/start/index.html');
    await page.waitForTimeout(1200);
    await page.locator('[data-motion-toggle]').click();
    assert.equal(await page.locator('[data-motion-toggle]').getAttribute('aria-pressed'), 'true');
    const before = await page.evaluate(() => window.draws);
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => window.draws), before, 'Pausing stops GPU redraws');
    assert.equal(await page.locator('.marquee-track').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    await page.reload();
    assert.equal(await page.locator('[data-motion-toggle]').getAttribute('aria-pressed'), 'true', 'Preference persists');
    await page.locator('[data-motion-toggle]').click();
    assert.equal(await page.locator('[data-motion-toggle]').getAttribute('aria-pressed'), 'false');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(300);
    assert.ok(await page.locator('[data-motion-toggle]').isDisabled());
    assert.equal(await page.locator('.marquee-track').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.screenshot({ path: '../warm-home-verified.png' });
    console.log('PASS motion pause, persistence, resume and reduced-motion preference');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
