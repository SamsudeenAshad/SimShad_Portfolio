const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const startDir = path.join(rootDir, 'start');

const routeMap = new Map([
  ['/', 'start/index.html'],
  ['/index.html', 'start/index.html'],
  ['/api/index', 'start/index.html'],
  ['/start', 'start/index.html'],
  ['/start/', 'start/index.html'],
  ['/start/index.html', 'start/index.html'],
]);

const redirectMap = new Map([
  ['/start/profile.html', '/start/index.html'],
  ['/profile.html', '/start/index.html'],
]);

function normalizePath(requestUrl) {
  const parsed = new URL(requestUrl || '/', 'http://localhost');
  return parsed.pathname.replace(/\\/g, '/');
}

function canonicalFor(pathname, host) {
  const base = host && !host.startsWith('127.0.0.1') && !host.startsWith('localhost')
    ? `https://${host}`
    : 'https://samsudeenashad.github.io/SimShad_Portfolio';

  if (pathname === '/' || pathname === '/index.html') return `${base}/`;
  return `${base}/start/index.html`;
}

function renderHtml(requestUrl, headers = {}) {
  const pathname = normalizePath(requestUrl);
  const relativeFile = routeMap.get(pathname);

  if (!relativeFile) return null;

  const filePath = path.join(rootDir, relativeFile);
  let html = fs.readFileSync(filePath, 'utf8');
  const host = headers['x-forwarded-host'] || headers.host || '';
  const canonical = canonicalFor(pathname, String(host).split(',')[0].trim());

  html = html
    .replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`)
    .replace('</head>', '    <meta name="rendered-by" content="node-ssr">\n</head>');

  if (pathname === '/' || pathname === '/index.html') {
    html = html.replace('<head>', '<head>\n    <base href="/start/">');
  }

  return html;
}

function redirectTarget(requestUrl) {
  const parsed = new URL(requestUrl || '/', 'http://localhost');
  const target = redirectMap.get(parsed.pathname.replace(/\\/g, '/'));
  if (!target) return null;
  return `${target}${parsed.search}`;
}

function resolvePublicFile(requestUrl) {
  const pathname = normalizePath(requestUrl);
  const decodedPath = decodeURIComponent(pathname);
  const cleanPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const candidate = path.normalize(path.join(rootDir, cleanPath));

  if (!candidate.startsWith(rootDir) || candidate === rootDir) return null;
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return null;

  return candidate;
}

module.exports = {
  redirectTarget,
  renderHtml,
  resolvePublicFile,
  rootDir,
  startDir,
};
