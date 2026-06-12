const http = require('http');
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const types = {
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp',
  '.svg':'image/svg+xml',
  '.xml':'application/xml; charset=utf-8',
  '.txt':'text/plain; charset=utf-8'
};

const { allPages } = require('../scratch/config.js');

const cleanSlugMap = {
  '/': 'index.html',
  '/average-car-accident-settlement-georgia/': 'article-average-settlement.html',
  '/distracted-driver-accident-georgia/': 'article-distracted-driver.html',
  '/personnel_category/team-awad/': 'personnel_category/team-awad/index.html'
};

// Build dynamically from config.js
for (const [filename, info] of Object.entries(allPages)) {
  // English mapping
  if (info.route !== undefined) {
    const enSlug = info.route === '' ? '/' : `/${info.route}/`;
    cleanSlugMap[enSlug] = filename;
  }
  // Spanish mapping
  if (info.esRoute !== undefined && info.esFile !== undefined) {
    const esSlug = info.esRoute.endsWith('/') ? `/${info.esRoute}` : `/${info.esRoute}/`;
    cleanSlugMap[esSlug] = info.esFile;
  }
}

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Simulate staging/local noindex header
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  // Redirect legacy direct .html requests to clean slugs
  for (const [slug, htmlFile] of Object.entries(cleanSlugMap)) {
    if (urlPath === '/' + htmlFile) {
      res.writeHead(301, { 'Location': slug });
      return res.end();
    }
  }

  // If request has no extension and doesn't end with slash, redirect to trailing slash version
  if (!urlPath.includes('.') && !urlPath.endsWith('/')) {
    res.writeHead(301, { 'Location': urlPath + '/' });
    return res.end();
  }

  // Lookup in clean slug map
  let fileToServe = cleanSlugMap[urlPath];
  let safePath;

  if (fileToServe) {
    safePath = fileToServe;
  } else {
    safePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^([\\/])+/, '');
  }

  let file = path.join(root, safePath);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(file, (err, stats) => {
    if (!err && stats.isDirectory()) {
      file = path.join(file, 'index.html');
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}).listen(8080, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:8080/');
});
