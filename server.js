'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const brevoApiKey = process.env.BREVO_API_KEY || '';
const brevoListId = Number(process.env.BREVO_LIST_ID || 5);
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'https://theawadlawfirm.com,https://www.theawadlawfirm.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const rateLimits = new Map();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (!allowedOrigins.has(origin)) return false;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  return true;
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

function isRateLimited(req) {
  const key = clientIp(req);
  const now = Date.now();
  const recent = (rateLimits.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  recent.push(now);
  rateLimits.set(key, recent);
  return recent.length > 10;
}

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000) req.destroy();
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}

async function subscribe(req, res) {
  if (!brevoApiKey || !Number.isInteger(brevoListId) || brevoListId <= 0) {
    console.error('Newsletter service is missing BREVO_API_KEY or BREVO_LIST_ID.');
    return sendJson(res, 503, { message: 'Newsletter signup is temporarily unavailable.' });
  }
  if (isRateLimited(req)) return sendJson(res, 429, { message: 'Please wait before trying again.' });

  let body;
  try { body = await readJson(req); } catch (_) { return sendJson(res, 400, { message: 'Invalid request.' }); }
  if (body.website) return sendJson(res, 200, { message: 'Subscription received.' });

  const email = String(body.email || '').trim().toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  if (!validEmail) return sendJson(res, 400, { message: 'Please enter a valid email address.' });
  if (body.consent !== true) return sendJson(res, 400, { message: 'Consent is required to subscribe.' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'api-key': brevoApiKey },
      body: JSON.stringify({
        email,
        listIds: [brevoListId],
        updateEnabled: true
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('Brevo rejected newsletter signup:', response.status, detail.slice(0, 300));
      return sendJson(res, 502, { message: 'We could not complete your subscription.' });
    }
    return sendJson(res, 200, { message: 'Thank you. You are now subscribed to our newsletter.' });
  } catch (error) {
    console.error('Brevo newsletter request failed:', error.message);
    return sendJson(res, 502, { message: 'We could not complete your subscription.' });
  } finally {
    clearTimeout(timeout);
  }
}

function serveStatic(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (_) { res.writeHead(400); return res.end('Bad Request'); }

  let requested = path.resolve(root, '.' + pathname);
  if (requested !== root && !requested.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    if (fs.statSync(requested).isDirectory()) requested = path.join(requested, 'index.html');
  } catch (_) {
    if (!path.extname(requested)) requested += '.html';
  }
  if (!fs.existsSync(requested) || !fs.statSync(requested).isFile()) {
    const notFound = path.join(root, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not Found');
  }
  res.writeHead(200, {
    'Content-Type': mimeTypes[path.extname(requested).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': path.extname(requested) === '.html' ? 'no-cache' : 'public, max-age=86400'
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(requested).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/health') return sendJson(res, 200, { status: 'ok', newsletterConfigured: Boolean(brevoApiKey) });
  if (pathname === '/api/newsletter/subscribe') {
    if (!applyCors(req, res)) return sendJson(res, 403, { message: 'Origin not allowed.' });
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
    if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed.' });
    return subscribe(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { message: 'Method not allowed.' });
  return serveStatic(req, res);
});

server.listen(port, '0.0.0.0', () => console.log(`Awad Law Firm website listening on port ${port}`));
