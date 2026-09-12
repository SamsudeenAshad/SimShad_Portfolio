const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

const port = 9986;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

function stopServer() {
  if (!server.killed) server.kill();
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('SSR server did not start')), 8000);
    server.stdout.on('data', chunk => {
      if (chunk.toString().includes('SSR portfolio running')) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`SSR server exited early with code ${code}`));
    });
  });
}

(async () => {
  try {
    await waitForServer();

    const home = await fetch(`${base}/`);
    const html = await home.text();
    assert.equal(home.status, 200);
    assert.match(html, /<meta name="rendered-by" content="node-ssr">/);
    assert.match(html, /<base href="\/start\/">/);
    assert.match(html, /Samsudeen Ashad/);

    const css = await fetch(`${base}/start/assets/css/unified.css`);
    assert.equal(css.status, 200);
    assert.match(css.headers.get('content-type') || '', /text\/css/);

    const legacy = await fetch(`${base}/start/profile.html?from=legacy`, { redirect: 'manual' });
    assert.equal(legacy.status, 308);
    assert.equal(legacy.headers.get('location'), '/start/index.html?from=legacy');

    console.log('PASS SSR server render, static assets and legacy redirect');
  } finally {
    stopServer();
  }
})().catch(error => {
  stopServer();
  console.error(error);
  process.exit(1);
});
