'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const dataDir = process.env.DATA_DIR || path.join(root, '.data');
const subscribersFile = path.join(dataDir, 'subscribers.json');
const adminPassword = process.env.ADMIN_PASSWORD || '';
const sessionSecret = process.env.SESSION_SECRET || '';
const salesforceWebToLeadUrl = process.env.SALESFORCE_WEB_TO_LEAD_URL ||
  'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DF00000008J4B';
const contactNotificationEmails = (process.env.CONTACT_NOTIFICATION_EMAILS ||
  'team@theawadlawfirm.com,mehar@theawadlawfirm.com,leland@theawadlawfirm.com,selvin@theawadlawfirm.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const formSubmitRecipient = contactNotificationEmails[0] || 'team@theawadlawfirm.com';
const formSubmitUrl = process.env.FORMSUBMIT_URL ||
  `https://formsubmit.co/ajax/${formSubmitRecipient}`;
const secureCookie = process.env.NODE_ENV === 'production';
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'https://theawadlawfirm.com,https://www.theawadlawfirm.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const rateLimits = new Map();
let writeQueue = Promise.resolve();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4'
};

function ensureStorage() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(subscribersFile)) fs.writeFileSync(subscribersFile, '[]\n', { encoding: 'utf8', mode: 0o600 });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, status, html) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
  });
  res.end(html);
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

function isRateLimited(req, limit = 10) {
  const key = clientIp(req);
  const now = Date.now();
  const recent = (rateLimits.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  recent.push(now);
  rateLimits.set(key, recent);
  return recent.length > limit;
}

async function readBody(req, maxLength = 10_000) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxLength) {
        reject(new Error('Request too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function readSubscribers() {
  ensureStorage();
  try {
    const parsed = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Unable to read subscriber storage:', error.message);
    return [];
  }
}

function saveSubscriber(record) {
  writeQueue = writeQueue.then(() => {
    const subscribers = readSubscribers();
    const existing = subscribers.find((item) => item.email === record.email);
    if (existing) {
      existing.lastSubscribedAt = record.subscribedAt;
      existing.source = record.source;
      existing.language = record.language;
    } else {
      subscribers.push(record);
    }
    const temporaryFile = subscribersFile + '.tmp';
    fs.writeFileSync(temporaryFile, JSON.stringify(subscribers, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporaryFile, subscribersFile);
    return { isNew: !existing };
  });
  return writeQueue;
}

async function subscribe(req, res) {
  if (isRateLimited(req)) return sendJson(res, 429, { message: 'Please wait before trying again.' });
  let body;
  try { body = JSON.parse(await readBody(req) || '{}'); }
  catch (_) { return sendJson(res, 400, { message: 'Invalid request.' }); }
  if (body.website) return sendJson(res, 200, { message: 'Subscription received.' });

  const email = String(body.email || '').trim().toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  if (!validEmail) return sendJson(res, 400, { message: 'Please enter a valid email address.' });
  if (body.consent !== true) return sendJson(res, 400, { message: 'Consent is required to subscribe.' });

  try {
    await saveSubscriber({
      email,
      subscribedAt: new Date().toISOString(),
      source: String(body.source || 'website').slice(0, 150),
      language: String(body.language || 'en').slice(0, 10)
    });
    return sendJson(res, 200, { message: 'Thank you. You are now subscribed to our newsletter.' });
  } catch (error) {
    console.error('Unable to store newsletter subscriber:', error.message);
    return sendJson(res, 500, { message: 'We could not complete your subscription.' });
  }
}

function cleanText(value, maxLength = 500) {
  return String(value || '').replace(/\0/g, '').trim().slice(0, maxLength);
}

function contactField(body, names, maxLength) {
  for (const name of names) {
    if (body[name] !== undefined && body[name] !== null) return cleanText(body[name], maxLength);
  }
  return '';
}

async function sendFormSubmitNotification(lead) {
  const ccRecipients = contactNotificationEmails.slice(1).join(',');
  const payload = {
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    address: lead.fullAddress || 'Not provided',
    practice_area: lead.practiceArea || 'Not provided',
    message: lead.message,
    form: lead.formType,
    submitted_from: lead.sourcePage,
    submitted_at: lead.submittedAt,
    _subject: `New Website Lead: [${lead.formType}] - ${lead.firstName} ${lead.lastName}`.trim(),
    _template: 'table',
    _captcha: 'false',
    _replyto: lead.email
  };
  if (ccRecipients) payload._cc = ccRecipients;

  const response = await fetch(formSubmitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = cleanText(await response.text(), 500);
    throw new Error(`FormSubmit notification failed (${response.status}): ${detail}`);
  }

  const result = await response.json().catch(() => ({}));
  if (result.success === false || String(result.success).toLowerCase() === 'false') {
    throw new Error(`FormSubmit notification failed: ${cleanText(result.message, 500) || 'unknown error'}`);
  }
}

async function sendSalesforceLead(lead) {
  const description = [
    lead.practiceArea ? `Practice/Case Area: ${lead.practiceArea}` : '',
    lead.fullAddress ? `Full Address: ${lead.fullAddress}` : '',
    lead.message ? `Message: ${lead.message}` : '',
    `Submitted From: ${lead.sourcePage}`
  ].filter(Boolean).join('\n');

  const params = new URLSearchParams({
    oid: '00DF00000008J4B',
    retURL: 'https://theawadlawfirm.com/contact/',
    lead_source: 'Web',
    first_name: lead.firstName,
    last_name: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    street: lead.street,
    city: lead.city,
    state: lead.state,
    zip: lead.zip,
    description
  });

  const response = await fetch(salesforceWebToLeadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    redirect: 'manual'
  });
  if (response.status < 200 || response.status >= 400) {
    throw new Error(`Salesforce submission failed (${response.status})`);
  }
}

async function submitContact(req, res) {
  if (isRateLimited(req, 15)) return sendJson(res, 429, { message: 'Please wait before submitting again.' });

  let body;
  try { body = JSON.parse(await readBody(req, 30_000) || '{}'); }
  catch (_) { return sendJson(res, 400, { message: 'Invalid request.' }); }
  if (body.website) return sendJson(res, 200, { message: 'Submission received.' });

  const lead = {
    firstName: contactField(body, ['firstName', 'first_name'], 80),
    lastName: contactField(body, ['lastName', 'last_name'], 80),
    email: contactField(body, ['email'], 254).toLowerCase(),
    phone: contactField(body, ['phone'], 25),
    street: contactField(body, ['street'], 160),
    city: contactField(body, ['city'], 100),
    state: contactField(body, ['state'], 100),
    zip: contactField(body, ['zip', 'postalCode'], 24),
    practiceArea: contactField(body, ['practiceArea', 'case_type'], 120),
    message: contactField(body, ['message'], 5000),
    formType: contactField(body, ['formType'], 120) || 'Website Contact Form',
    sourcePage: contactField(body, ['sourcePage'], 500) || 'Website',
    submittedAt: new Date().toISOString()
  };
  lead.fullAddress = [lead.street, lead.city, lead.state, lead.zip].filter(Boolean).join(', ');

  if (!lead.firstName || !lead.lastName || !lead.email || !lead.phone || !lead.message) {
    return sendJson(res, 400, { message: 'Please complete all required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return sendJson(res, 400, { message: 'Please enter a valid email address.' });
  }
  if (!/^\+[1-9]\d{7,14}$/.test(lead.phone)) {
    return sendJson(res, 400, { message: 'Please enter a complete phone number and select the correct country.' });
  }

  const [salesforceResult, emailResult] = await Promise.allSettled([
    sendSalesforceLead(lead),
    sendFormSubmitNotification(lead)
  ]);

  if (salesforceResult.status === 'rejected') console.error('Contact lead Salesforce error:', salesforceResult.reason.message);
  if (emailResult.status === 'rejected') console.error('Contact lead email error:', emailResult.reason.message);

  if (salesforceResult.status === 'rejected' && emailResult.status === 'rejected') {
    return sendJson(res, 502, { message: 'We could not send your request. Please call (706) 890-0000.' });
  }
  if (emailResult.status === 'rejected') {
    return sendJson(res, 202, { message: 'Your request was received, but the email alert could not be delivered.', notificationDelivered: false });
  }
  return sendJson(res, 200, { message: 'Thank you. Your request was sent successfully.', notificationDelivered: true });
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sessionToken(expiresAt) {
  const payload = String(expiresAt);
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('hex');
  return payload + '.' + signature;
}

function isAuthenticated(req) {
  if (!sessionSecret) return false;
  const cookie = String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('subscriber_admin='));
  if (!cookie) return false;
  const token = decodeURIComponent(cookie.slice('subscriber_admin='.length));
  const pieces = token.split('.');
  if (pieces.length !== 2 || Number(pieces[0]) < Date.now()) return false;
  return safeEqual(pieces[1], crypto.createHmac('sha256', sessionSecret).update(pieces[0]).digest('hex'));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function pageShell(title, content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
  :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0c1522;color:#edf3fa;font:15px/1.5 system-ui,sans-serif}.wrap{width:min(1080px,calc(100% - 32px));margin:48px auto}.panel{background:#131f2f;border:1px solid #26364b;border-radius:18px;padding:28px;box-shadow:0 20px 60px #0005}h1{margin:0 0 8px;font-size:clamp(28px,5vw,44px)}p{color:#aebed1}label{display:block;margin:18px 0 8px;font-weight:700}input{width:100%;padding:13px 14px;border:1px solid #3a4b61;border-radius:10px;background:#0b1420;color:white;font:inherit}button,.button{display:inline-block;margin-top:18px;border:0;border-radius:10px;padding:12px 18px;background:#d5ae52;color:#111827;font-weight:800;text-decoration:none;cursor:pointer}.toolbar{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:20px}.toolbar div{display:flex;gap:10px}.toolbar .button{margin:0}.muted{color:#8fa3ba}table{width:100%;border-collapse:collapse;background:#0d1724;border-radius:12px;overflow:hidden}th,td{text-align:left;padding:13px;border-bottom:1px solid #223247}th{color:#d5ae52;font-size:12px;text-transform:uppercase;letter-spacing:.08em}.empty{text-align:center;padding:48px;color:#8fa3ba}.scroll{overflow:auto}@media(max-width:680px){.wrap{margin:24px auto}.panel{padding:20px}th:nth-child(3),td:nth-child(3){display:none}}
  </style></head><body><main class="wrap">${content}</main></body></html>`;
}

function loginPage(error = '') {
  return pageShell('Subscriber Login', `<section class="panel" style="max-width:480px;margin:auto"><h1>Subscriber Dashboard</h1><p>Sign in to view newsletter subscriptions.</p>${error ? `<p style="color:#ff9d9d">${escapeHtml(error)}</p>` : ''}<form method="post" action="/admin/login"><label for="password">Password</label><input id="password" name="password" type="password" required autocomplete="current-password"><button type="submit">Sign in</button></form></section>`);
}

function dashboardPage() {
  const subscribers = readSubscribers().sort((a, b) => String(b.subscribedAt).localeCompare(String(a.subscribedAt)));
  const rows = subscribers.map((item) => `<tr><td>${escapeHtml(item.email)}</td><td>${escapeHtml(new Date(item.subscribedAt).toLocaleString('en-US', { timeZone: 'America/New_York' }))}</td><td>${escapeHtml(item.source || '')}</td></tr>`).join('');
  return pageShell('Subscribers', `<div class="toolbar"><div><h1>Subscribers</h1><span class="muted" style="align-self:end;margin-bottom:10px">${subscribers.length} total</span></div><div><a class="button" href="/admin/subscribers.csv">Download CSV</a><a class="button" href="/admin/logout" style="background:#26364b;color:white">Log out</a></div></div><section class="panel"><div class="scroll"><table><thead><tr><th>Email</th><th>Subscribed</th><th>Source</th></tr></thead><tbody>${rows || `<tr><td colspan="3" class="empty">No subscribers yet.</td></tr>`}</tbody></table></div></section>`);
}

function csvEscape(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

async function handleAdmin(req, res, pathname) {
  if (!adminPassword || !sessionSecret) return sendHtml(res, 503, pageShell('Not configured', '<section class="panel"><h1>Dashboard not configured</h1><p>Add ADMIN_PASSWORD and SESSION_SECRET to the service environment.</p></section>'));
  if (pathname === '/admin/login' && req.method === 'POST') {
    if (isRateLimited(req, 20)) return sendHtml(res, 429, loginPage('Too many attempts. Please try again later.'));
    const params = new URLSearchParams(await readBody(req));
    if (!safeEqual(params.get('password') || '', adminPassword)) return sendHtml(res, 401, loginPage('Incorrect password.'));
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    res.setHeader('Set-Cookie', `subscriber_admin=${encodeURIComponent(sessionToken(expiresAt))}; Path=/admin; Max-Age=28800; HttpOnly;${secureCookie ? ' Secure;' : ''} SameSite=Lax`);
    res.writeHead(303, { Location: '/admin/' });
    return res.end();
  }
  if (pathname === '/admin/logout') {
    res.setHeader('Set-Cookie', `subscriber_admin=; Path=/admin; Max-Age=0; HttpOnly;${secureCookie ? ' Secure;' : ''} SameSite=Lax`);
    res.writeHead(303, { Location: '/admin/' });
    return res.end();
  }
  if (!isAuthenticated(req)) return sendHtml(res, 200, loginPage());
  if (pathname === '/admin/subscribers.csv') {
    const subscribers = readSubscribers();
    const csv = ['Email,Subscribed At,Source,Language']
      .concat(subscribers.map((item) => [item.email, item.subscribedAt, item.source, item.language].map(csvEscape).join(',')))
      .join('\r\n');
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"', 'Cache-Control': 'no-store' });
    return res.end(csv);
  }
  return sendHtml(res, 200, dashboardPage());
}

function serveStatic(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (_) { res.writeHead(400); return res.end('Bad Request'); }
  let requested = path.resolve(root, '.' + pathname);
  if (requested !== root && !requested.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  try { if (fs.statSync(requested).isDirectory()) requested = path.join(requested, 'index.html'); }
  catch (_) { if (!path.extname(requested)) requested += '.html'; }
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

ensureStorage();
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/health') return sendJson(res, 200, {
    status: 'ok',
    storageReady: true,
    adminConfigured: Boolean(adminPassword && sessionSecret),
    leadNotificationsConfigured: Boolean(formSubmitRecipient)
  });
  if (pathname === '/api/newsletter/subscribe') {
    if (!applyCors(req, res)) return sendJson(res, 403, { message: 'Origin not allowed.' });
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed.' });
    return subscribe(req, res);
  }
  if (pathname === '/api/contact/submit') {
    if (!applyCors(req, res)) return sendJson(res, 403, { message: 'Origin not allowed.' });
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed.' });
    return submitContact(req, res);
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return handleAdmin(req, res, pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { message: 'Method not allowed.' });
  return serveStatic(req, res);
});

server.listen(port, '0.0.0.0', () => console.log(`Awad subscriber service listening on port ${port}`));
