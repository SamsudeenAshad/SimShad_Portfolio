const fs = require('fs');
const path = require('path');
const { redirectTarget, renderHtml, resolvePublicFile } = require('../ssr/render');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

module.exports = function handler(req, res) {
  const redirect = redirectTarget(req.url);
  if (redirect) {
    res.statusCode = 308;
    res.setHeader('Location', redirect);
    res.end();
    return;
  }

  const html = renderHtml(req.url, req.headers);
  if (html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=86400');
    res.statusCode = 200;
    res.end(html);
    return;
  }

  const filePath = resolvePublicFile(req.url);
  if (!filePath) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  fs.createReadStream(filePath).pipe(res);
};
