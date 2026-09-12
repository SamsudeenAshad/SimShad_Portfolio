const http = require('http');
const fs = require('fs');
const path = require('path');
const { redirectTarget, renderHtml, resolvePublicFile } = require('./ssr/render');

const port = Number(process.env.PORT || 8765);
const host = process.env.HOST || '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (!req.url || req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, { Allow: 'GET, HEAD' }, '');
    return;
  }

  const redirect = redirectTarget(req.url);
  if (redirect) {
    send(res, 308, { Location: redirect }, '');
    return;
  }

  const html = renderHtml(req.url, req.headers);
  if (html) {
    send(res, 200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    }, req.method === 'HEAD' ? '' : html);
    return;
  }

  const filePath = resolvePublicFile(req.url);
  if (!filePath) {
    send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  };

  if (req.method === 'HEAD') {
    send(res, 200, headers, '');
    return;
  }

  fs.createReadStream(filePath)
    .on('error', () => send(res, 500, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Server error'))
    .pipe(res.writeHead(200, headers));
});

server.listen(port, host, () => {
  console.log(`SSR portfolio running at http://${host}:${port}/`);
});
