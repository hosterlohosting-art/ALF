'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { State, City } = require('country-state-city');
const { createContentStore } = require('./cms/store');
const { createTursoContentStore } = require('./cms/turso-store');
const { createCmsUserStore } = require('./cms/users');
const { createMediaUploads } = require('./cms/uploads');
const { createCmsAdmin } = require('./cms/admin');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const dataDir = process.env.DATA_DIR || path.join(root, '.data');
const subscribersFile = path.join(dataDir, 'subscribers.json');
const adminPassword = process.env.ADMIN_PASSWORD || '';
const sessionSecret = process.env.SESSION_SECRET || '';
const requestedCmsBasePath = String(process.env.CMS_BASE_PATH || '/firm-content-center').trim().replace(/\/$/, '');
const cmsBasePath = /^\/[a-z0-9][a-z0-9-]{4,79}$/i.test(requestedCmsBasePath)
  ? requestedCmsBasePath
  : '/firm-content-center';
const salesforceWebToLeadUrl = process.env.SALESFORCE_WEB_TO_LEAD_URL ||
  'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DF00000008J4B';
const web3FormsAccessKey = process.env.WEB3FORMS_ACCESS_KEY || '';
const web3FormsUrl = process.env.WEB3FORMS_URL || 'https://api.web3forms.com/submit';
const hcaptchaSecret = process.env.HCAPTCHA_SECRET || '';
const hcaptchaSiteKey = process.env.HCAPTCHA_SITE_KEY || 'bbaee838-b0ee-4376-bf5c-206ed8ae50fa';
const blockedIps = new Set(
  (process.env.BLOCKED_IPS || '').split(',').map((ip) => ip.trim()).filter(Boolean)
);
const secureCookie = process.env.NODE_ENV === 'production';
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'https://theawadlawfirm.com,https://www.theawadlawfirm.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const rateLimits = new Map();
let writeQueue = Promise.resolve();
const websiteScriptVersion = '14';
const usStates = State.getStatesOfCountry('US')
  .map((state) => ({ name: state.name, code: state.isoCode }))
  .sort((left, right) => left.name.localeCompare(right.name));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4'
};
const tursoConfigured = Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
const contentStore = tursoConfigured
  ? createTursoContentStore({ dataDir, databaseUrl: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
  : createContentStore({ dataDir });
const mediaUploads = createMediaUploads({ dataDir });
const cmsUserStore = tursoConfigured
  ? createCmsUserStore({ databaseUrl: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN, initialEmail: process.env.ADMIN_EMAIL || 'attorney@awadlaw.com', initialPassword: adminPassword })
  : null;

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
    'Content-Security-Policy': "default-src 'none'; img-src 'self' https: data:; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
  });
  res.end(html);
}

function sendCmsHtml(res, status, html) {
  return sendHtml(res, status, html.replace(/\/admin(?=\/|["'?])/g, cmsBasePath));
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
  return String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '')
    .split(',')[0].trim().replace(/^::ffff:/, '');
}

function isBlockedIp(req) {
  return blockedIps.has(clientIp(req));
}

function isRateLimited(req, limit = 10, windowMs = 60 * 60 * 1000, scope = 'general') {
  const key = `${scope}:${clientIp(req)}`;
  const now = Date.now();
  const recent = (rateLimits.get(key) || []).filter((time) => now - time < windowMs);
  recent.push(now);
  rateLimits.set(key, recent);
  if (rateLimits.size > 10_000) {
    for (const staleKey of rateLimits.keys()) {
      if (rateLimits.size <= 8_000) break;
      rateLimits.delete(staleKey);
    }
  }
  return recent.length > limit;
}

function securityLog(result, req, detail = '') {
  const suffix = detail ? ` detail=${cleanText(detail, 180).replace(/\s+/g, '_')}` : '';
  console.log(`[lead-security] result=${result} ip=${clientIp(req) || 'unknown'}${suffix}`);
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
  if (contentStore.backend === 'turso') return contentStore.listSubscribers();
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
  if (contentStore.backend === 'turso') return contentStore.saveSubscriber(record);
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

function isValidEmail(email) {
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const [local, domain] = email.split('@');
  return Boolean(local && domain && local.length <= 64 &&
    !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') &&
    !domain.startsWith('-') && !domain.endsWith('-') && !domain.includes('..'));
}

async function verifyHcaptcha(token, ip) {
  // Keep existing forms available during deployment; strict verification
  // activates as soon as HCAPTCHA_SECRET is configured in Coolify.
  if (!hcaptchaSecret) return { success: true, skipped: true };
  if (!token) return { success: false, errors: ['missing-input-response'] };

  const params = new URLSearchParams({
    secret: hcaptchaSecret,
    response: cleanText(token, 4000),
    sitekey: hcaptchaSiteKey
  });
  if (ip) params.set('remoteip', ip);

  const response = await fetch('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error(`hCaptcha verification failed (${response.status})`);
  const result = await response.json();
  return {
    success: result.success === true,
    errors: Array.isArray(result['error-codes']) ? result['error-codes'] : []
  };
}

function looksLikeAutomatedLead(lead) {
  const combined = `${lead.firstName} ${lead.lastName} ${lead.message}`;
  const links = combined.match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|xyz)\b/gi) || [];
  const repeated = /(.)\1{7,}/.test(combined);
  const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(combined);
  const machineToken = /^[a-z0-9]{12,80}$/i.test(lead.message) &&
    (lead.message.match(/[A-Z]/g) || []).length >= 3 &&
    (lead.message.match(/[a-z]/g) || []).length >= 3;
  const consonantHeavy = (name) => {
    const letters = name.replace(/[^a-z]/gi, '');
    const vowelRatio = letters.length ? (letters.match(/[aeiou]/gi) || []).length / letters.length : 1;
    return letters.length >= 4 && vowelRatio < 0.25 && /[bcdfghjklmnpqrstvwxyz]{3,}/i.test(letters);
  };
  const unusualMixedCase = [lead.firstName, lead.lastName].some((name) =>
    name.length >= 10 && (name.slice(1).match(/[A-Z]/g) || []).length >= 2
  );
  // Requiring both names to look machine-generated avoids rejecting legitimate
  // low-vowel names such as "Krzysztof Smith."
  const gibberishName = unusualMixedCase ||
    (consonantHeavy(lead.firstName) && consonantHeavy(lead.lastName));
  return links.length > 2 || repeated || controlCharacters || machineToken || gibberishName;
}

async function sendWeb3FormsNotification(lead) {
  if (!web3FormsAccessKey) throw new Error('Web3Forms access key is not configured');

  const payload = {
    access_key: web3FormsAccessKey,
    subject: `New Website Lead: [${lead.formType}] - ${lead.firstName} ${lead.lastName}`.trim(),
    from_name: 'The Awad Law Firm Website',
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    address: lead.fullAddress || 'Not provided',
    practice_area: lead.practiceArea || 'Not provided',
    message: lead.message,
    form: lead.formType,
    submitted_from: lead.sourcePage,
    submitted_at: lead.submittedAt
  };

  const response = await fetch(web3FormsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = cleanText(await response.text(), 500);
    throw new Error(`Web3Forms notification failed (${response.status}): ${detail}`);
  }

  const result = await response.json().catch(() => ({}));
  if (result.success !== true && String(result.success).toLowerCase() !== 'true') {
    throw new Error(`Web3Forms notification failed: ${cleanText(result.message, 500) || 'unknown error'}`);
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
  if (isBlockedIp(req)) {
    securityLog('blocked-ip', req);
    return sendJson(res, 403, { message: 'Submission unavailable.' });
  }
  const burstLimited = isRateLimited(req, 3, 10 * 60 * 1000, 'contact-burst');
  const hourlyLimited = isRateLimited(req, 8, 60 * 60 * 1000, 'contact-hourly');
  if (burstLimited || hourlyLimited) {
    securityLog('rate-limited', req);
    return sendJson(res, 429, { message: 'Please wait before submitting again.' });
  }

  let body;
  try { body = JSON.parse(await readBody(req, 30_000) || '{}'); }
  catch (_) { return sendJson(res, 400, { message: 'Invalid request.' }); }
  if (body.website || body.companyFax) {
    securityLog('honeypot', req);
    return sendJson(res, 200, { message: 'Submission received.' });
  }

  const startedAt = Number(body.formStartedAt || 0);
  if (!Number.isFinite(startedAt) || startedAt <= 0 || Date.now() - startedAt < 2500 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    securityLog('timing', req);
    return sendJson(res, 400, { message: 'Please refresh the page and try again.' });
  }

  let captchaResult;
  try { captchaResult = await verifyHcaptcha(body.hcaptchaToken, clientIp(req)); }
  catch (error) {
    console.error('hCaptcha service error:', error.message);
    return sendJson(res, 503, { message: 'Security verification is temporarily unavailable. Please try again.' });
  }
  if (!captchaResult.success) {
    securityLog('captcha-failed', req, (captchaResult.errors || []).join(','));
    return sendJson(res, 403, { message: 'Security verification failed. Please complete hCaptcha again.' });
  }

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
    securityLog('missing-fields', req);
    return sendJson(res, 400, { message: 'Please complete all required fields.' });
  }
  if (!isValidEmail(lead.email)) {
    securityLog('invalid-email', req);
    return sendJson(res, 400, { message: 'Please enter a valid email address.' });
  }
  if (!/^\+1[2-9]\d{2}[2-9]\d{6}$/.test(lead.phone)) {
    securityLog('invalid-phone', req);
    return sendJson(res, 400, { message: 'Please enter a valid 10-digit U.S. phone number.' });
  }
  if (looksLikeAutomatedLead(lead)) {
    securityLog('content-filter', req);
    return sendJson(res, 200, { message: 'Submission received.' });
  }

  const [salesforceResult, emailResult] = await Promise.allSettled([
    sendSalesforceLead(lead),
    sendWeb3FormsNotification(lead)
  ]);

  if (salesforceResult.status === 'rejected') console.error('Contact lead Salesforce error:', salesforceResult.reason.message);
  if (emailResult.status === 'rejected') console.error('Contact lead email error:', emailResult.reason.message);

  if (salesforceResult.status === 'rejected' && emailResult.status === 'rejected') {
    return sendJson(res, 502, { message: 'We could not send your request. Please call (706) 890-0000.' });
  }
  if (emailResult.status === 'rejected') {
    return sendJson(res, 202, { message: 'Your request was received, but the email alert could not be delivered.', notificationDelivered: false });
  }
  securityLog('accepted', req, lead.formType);
  return sendJson(res, 200, { message: 'Thank you. Your request was sent successfully.', notificationDelivered: true });
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sessionToken(expiresAt, user) {
  const payload = Buffer.from(JSON.stringify({ expiresAt, id: user.id || 'environment-admin' }), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('hex');
  return payload + '.' + signature;
}

function isAuthenticated(req) {
  if (!sessionSecret) return null;
  const cookie = String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('subscriber_admin='));
  if (!cookie) return null;
  const token = decodeURIComponent(cookie.slice('subscriber_admin='.length));
  const pieces = token.split('.');
  if (pieces.length !== 2 || !safeEqual(pieces[1], crypto.createHmac('sha256', sessionSecret).update(pieces[0]).digest('hex'))) return null;
  try {
    const session = JSON.parse(Buffer.from(pieces[0], 'base64url').toString('utf8'));
    if (Number(session.expiresAt) < Date.now()) return null;
    if (!cmsUserStore) return session.id === 'environment-admin' ? { id: session.id, email: process.env.ADMIN_EMAIL || 'attorney@awadlaw.com', name: 'CMS Administrator', role: 'administrator', status: 'active' } : null;
    const current = cmsUserStore.getUser(session.id);
    return current && current.status === 'active' ? current : null;
  } catch (_) { return null; }
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

const cmsAdmin = createCmsAdmin({ store: contentStore, userStore: cmsUserStore, mediaUploads, sendHtml: sendCmsHtml, sessionSecret, currentUser: isAuthenticated, basePath: cmsBasePath });

function loginPage(error = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Firm Content Center - Awad Law Firm</title><style>
  :root{--navy:#1d2d47;--deep:#17263e;--ink:#17243a;--muted:#747d8c;--line:#d8dce2}*{box-sizing:border-box}html,body{min-height:100%}body{margin:0;background:var(--navy);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.page{position:relative;isolation:isolate;overflow:hidden;min-height:100vh;display:grid;place-items:center;padding:44px 20px;background:radial-gradient(circle at 50% 32%,#2a3e5e 0,#20324f 31%,var(--navy) 58%,var(--deep) 100%)}.page:before,.page:after{content:"";position:absolute;z-index:-1;border-radius:50%;pointer-events:none}.page:before{width:560px;height:560px;left:-330px;top:-310px;border:1px solid #ffffff09;box-shadow:0 0 0 90px #ffffff05,0 0 0 180px #ffffff03}.page:after{width:480px;height:480px;right:-300px;bottom:-320px;background:radial-gradient(circle,#d7ae4730 0,#d7ae4708 35%,transparent 70%)}.stack{position:relative;z-index:1;width:min(100%,424px);display:flex;flex-direction:column;align-items:center}.logo{width:min(292px,74vw);height:96px;object-fit:contain;margin:0 auto 30px;filter:drop-shadow(0 8px 18px #0812244a)}.card{position:relative;overflow:hidden;width:100%;background:linear-gradient(180deg,#fff 0,#fffdfb 100%);border:1px solid #ffffff;border-radius:14px;padding:40px 38px 36px;box-shadow:0 2px 3px #08122214,0 26px 74px #08122259}.card:before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,transparent,#edc65d 28%,#ffe69d 50%,#edc65d 72%,transparent)}.title{margin:0;text-align:center;font-size:24px;line-height:1.2;font-weight:760;letter-spacing:-.03em;color:#17253b}.subtitle{margin:8px 0 30px;text-align:center;color:#7b8390;font-size:12.5px;letter-spacing:.01em}.alert{margin:0 0 18px;padding:10px 12px;border:1px solid #efc0c0;border-radius:6px;background:#fff1f1;color:#9c272d;font-size:12px}.label-row{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:19px 0 8px}.label{font-size:10.5px;font-weight:820;letter-spacing:.055em;text-transform:uppercase;color:#2c394e}.forgot{color:#bd9025;text-decoration:none;font-size:10.5px;font-weight:700;transition:color .15s}.forgot:hover{text-decoration:underline}.input-wrap{position:relative}.input-wrap:focus-within .icon{color:#c39832}.icon{position:absolute;left:14px;top:50%;width:17px;height:17px;transform:translateY(-50%);color:#b8bec8;pointer-events:none;transition:color .15s}.input{width:100%;height:48px;border:1px solid #d6dae1;border-radius:4px;background:#fff;padding:0 45px 0 43px;color:#263348;font:14px inherit;outline:0;box-shadow:inset 0 1px 2px #15233a08;transition:border-color .15s,box-shadow .15s,background .15s}.input::placeholder{color:#a5acb8}.input:hover{border-color:#c5cad2}.input:focus{border-color:#c6a044;background:#fffefa;box-shadow:0 0 0 3px #e7c45a24,inset 0 1px 2px #15233a05}.eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:transparent;color:#b6bdc8;cursor:pointer;transition:color .15s,background .15s}.eye:hover,.eye:focus-visible{color:#657083;background:#f3f4f6;outline:0}.remember{display:flex;align-items:center;gap:9px;margin:18px 0 23px;color:#6f7785;font-size:11.5px;cursor:pointer;user-select:none}.remember input{width:16px;height:16px;margin:0;accent-color:#d9ad42}.signin{width:100%;height:48px;border:1px solid #e9c45e;border-radius:4px;background:linear-gradient(135deg,#ffe69c 0,#ffdc79 55%,#f8d46e 100%);color:#253147;font-size:11.5px;font-weight:850;letter-spacing:.055em;text-transform:uppercase;cursor:pointer;box-shadow:0 8px 20px #c3952633;transition:transform .15s,box-shadow .15s,filter .15s}.signin:hover{transform:translateY(-1px);filter:saturate(1.04);box-shadow:0 11px 25px #c3952642}.signin:active{transform:translateY(0);box-shadow:0 5px 13px #c3952630}.signin:focus-visible{outline:3px solid #f1d68166;outline-offset:3px}.notice{display:flex;align-items:center;justify-content:center;gap:8px;margin:29px auto 0;padding:8px 15px;border:1px solid #ffffff20;border-radius:999px;background:#0b172317;color:#b9c3d2;font-size:10px;box-shadow:inset 0 1px #ffffff05}.notice svg{color:#e8c35e;filter:drop-shadow(0 0 5px #e8c35e33)}@media(prefers-reduced-motion:reduce){.input,.icon,.eye,.signin{transition:none}}@media(max-width:520px){.page{padding:28px 16px}.stack{width:min(100%,380px)}.logo{width:230px;height:78px;margin-bottom:22px}.card{padding:32px 23px 29px}.title{font-size:21px}.notice{text-align:center;border-radius:12px}}@media(max-height:700px) and (min-width:521px){.page{padding:24px}.logo{height:65px;margin-bottom:16px}.card{padding:26px 32px}.subtitle{margin-bottom:18px}.notice{margin-top:16px}}
  </style></head><body><main class="page"><div class="stack"><img class="logo" src="/assets/alf-white-logo.png" alt="Awad Law Firm"><section class="card"><h1 class="title">Firm Content Center</h1><p class="subtitle">Secure Staff Portal</p>${error ? `<p class="alert" role="alert">${escapeHtml(error)}</p>` : ''}<form method="post" action="/admin/login"><div class="label-row"><label class="label" for="email">Email address</label></div><div class="input-wrap"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="1.5"></rect><path d="m4 7 8 6 8-6"></path></svg><input class="input" id="email" name="email" type="email" placeholder="attorney@awadlaw.com" required autocomplete="username"></div><div class="label-row"><label class="label" for="password">Password</label><a class="forgot" href="mailto:info@theawadlawfirm.com?subject=Firm%20Content%20Center%20Password%20Reset">Forgot password?</a></div><div class="input-wrap"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg><input class="input" id="password" name="password" type="password" required autofocus autocomplete="current-password"><button class="eye" type="button" aria-label="Show password" onclick="const p=document.getElementById('password');p.type=p.type==='password'?'text':'password';this.setAttribute('aria-label',p.type==='password'?'Show password':'Hide password')"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg></button></div><label class="remember"><input type="checkbox" name="remember" value="yes"><span>Remember me on this device</span></label><button class="signin" type="submit">Sign in</button></form></section><div class="notice"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-4"></path></svg><span>This is a protected internal portal for authorized staff only.</span></div></div></main></body></html>`;
}
function subscribersPanel() {
  const subscribers = readSubscribers().sort((a, b) => String(b.subscribedAt).localeCompare(String(a.subscribedAt)));
  const rows = subscribers.map((item) => `<tr><td>${escapeHtml(item.email)}</td><td>${escapeHtml(new Date(item.subscribedAt).toLocaleString('en-US', { timeZone: 'America/New_York' }))}</td><td>${escapeHtml(item.source || '')}</td></tr>`).join('');
  return `<div class="heading"><div><h1>Subscribers</h1><p>${subscribers.length} newsletter subscriber${subscribers.length === 1 ? '' : 's'}</p></div><a class="button" href="/admin/subscribers.csv">Download CSV</a></div><div class="card"><div style="overflow:auto"><table><thead><tr><th>Email</th><th>Subscribed</th><th>Source</th></tr></thead><tbody>${rows || `<tr><td colspan="3" class="empty">No subscribers yet.</td></tr>`}</tbody></table></div></div>`;
}

function csvEscape(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

async function handleAdmin(req, res, pathname) {
  if (!adminPassword || !sessionSecret) return sendCmsHtml(res, 503, pageShell('Not configured', '<section class="panel"><h1>Dashboard not configured</h1><p>Add ADMIN_PASSWORD and SESSION_SECRET to the service environment.</p></section>'));
  if (pathname === '/admin/login' && req.method === 'POST') {
    if (isRateLimited(req, 10, 60 * 60 * 1000, 'cms-login')) return sendCmsHtml(res, 429, loginPage('Too many attempts. Please try again later.'));
    const params = new URLSearchParams(await readBody(req));
    const loginEmail = String(params.get('email') || process.env.ADMIN_EMAIL || 'attorney@awadlaw.com').trim().toLowerCase();
    const loginUser = cmsUserStore
      ? await cmsUserStore.authenticate(loginEmail, params.get('password') || '')
      : (safeEqual(params.get('password') || '', adminPassword) ? { id: 'environment-admin', email: loginEmail, name: 'CMS Administrator', role: 'administrator', status: 'active' } : null);
    if (!loginUser) return sendCmsHtml(res, 401, loginPage('Incorrect email or password.'));
    const rememberDevice = params.get('remember') === 'yes';
    const sessionSeconds = rememberDevice ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
    const expiresAt = Date.now() + sessionSeconds * 1000;
    res.setHeader('Set-Cookie', `subscriber_admin=${encodeURIComponent(sessionToken(expiresAt, loginUser))}; Path=${cmsBasePath}; Max-Age=${sessionSeconds}; HttpOnly;${secureCookie ? ' Secure;' : ''} SameSite=Strict`);
    res.writeHead(303, { Location: `${cmsBasePath}/` });
    return res.end();
  }
  if (pathname === '/admin/logout') {
    res.setHeader('Set-Cookie', `subscriber_admin=; Path=${cmsBasePath}; Max-Age=0; HttpOnly;${secureCookie ? ' Secure;' : ''} SameSite=Strict`);
    res.writeHead(303, { Location: `${cmsBasePath}/` });
    return res.end();
  }
  if (!isAuthenticated(req)) return sendCmsHtml(res, 200, loginPage());
  if (pathname === '/admin/subscribers.csv') {
    const subscribers = readSubscribers();
    const csv = ['Email,Subscribed At,Source,Language']
      .concat(subscribers.map((item) => [item.email, item.subscribedAt, item.source, item.language].map(csvEscape).join(',')))
      .join('\r\n');
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"', 'Cache-Control': 'no-store' });
    return res.end(csv);
  }
  const handled = await cmsAdmin.handle(req, res, pathname, { subscribersHtml: subscribersPanel() });
  if (handled !== false) return handled;
  return sendCmsHtml(res, 404, pageShell('Not found', '<section class="panel"><h1>Not found</h1><p>The requested CMS page does not exist.</p></section>'));
}

function publicContentRecord(item, includeBody = false) {
  const record = {
    id: item.id, type: item.type, title: item.title, slug: item.slug, locale: item.locale,
    summary: item.summary, featuredImage: item.featuredImage,
    seo: item.seo, fields: item.fields,
    publishedAt: item.publishedAt, updatedAt: item.updatedAt
  };
  if (includeBody) record.body = item.body;
  return record;
}

function sendPublishedContent(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { message: 'Method not allowed.' });
  const url = new URL(req.url, 'http://localhost');
  const type = cleanText(url.searchParams.get('type'), 40);
  const slug = cleanText(url.searchParams.get('slug'), 180).toLowerCase();
  const locale = cleanText(url.searchParams.get('locale') || 'en', 10).toLowerCase();
  const allowedTypes = new Set(['page', 'article', 'event', 'team-member', 'newsletter', 'media', 'global']);
  if (type && !allowedTypes.has(type)) return sendJson(res, 400, { message: 'Invalid content type.' });
  if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(locale)) return sendJson(res, 400, { message: 'Invalid language.' });
  const filters = { status: 'published', locale };
  if (type) filters.type = type;
  let items = contentStore.list(filters);
  if (slug) {
    const item = items.find((candidate) => candidate.slug === slug);
    if (!item) return sendJson(res, 404, { message: 'Published content not found.' });
    const body = JSON.stringify({ content: publicContentRecord(item, true) });
    const etag = '"' + crypto.createHash('sha256').update(body).digest('hex').slice(0, 24) + '"';
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag }); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', ETag: etag, 'X-Content-Source': contentStore.backend || 'json' });
    return req.method === 'HEAD' ? res.end() : res.end(body);
  }
  const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit')) || 50, 100));
  items = items.slice(0, limit);
  const body = JSON.stringify({ content: items.map((item) => publicContentRecord(item, false)), count: items.length, source: contentStore.backend || 'json' });
  const etag = '"' + crypto.createHash('sha256').update(body).digest('hex').slice(0, 24) + '"';
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag }); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', ETag: etag, 'X-Content-Source': contentStore.backend || 'json' });
  return req.method === 'HEAD' ? res.end() : res.end(body);
}

function normaliseCmsRoute(pathname) {
  let route = String(pathname || '/').replace(/\\/g, '/');
  route = route.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '/');
  if (!route.startsWith('/')) route = '/' + route;
  route = route.replace(/\/{2,}/g, '/');
  if (route !== '/' && !route.endsWith('/')) route += '/';
  return route;
}

function cmsItemForPath(pathname) {
  const route = normaliseCmsRoute(pathname);
  const locale = route === '/es/' || route.startsWith('/es/') ? 'es' : 'en';
  const editableTypes = new Set(['page', 'article', 'team-member', 'newsletter']);
  const items = contentStore.list({ status: 'published', locale }).filter((item) => editableTypes.has(item.type));
  const exact = items.find((item) => item.fields && item.fields.sourceRoute && normaliseCmsRoute(item.fields.sourceRoute) === route);
  if (exact) return exact;
  const parts = route.split('/').filter(Boolean);
  if (parts[0] === 'es') parts.shift();
  const slug = parts.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'home';
  return items.find((item) => item.slug === slug) || null;
}

function renderCmsBodyRegion(html, item) {
  if (!item || !item.body) return html;
  const preferred = item.fields && item.fields.contentRegion;
  const replaceMain = () => /<main\b[^>]*>[\s\S]*?<\/main>/i.test(html)
    ? html.replace(/(<main\b[^>]*>)[\s\S]*?(<\/main>)/i, '$1\n' + item.body + '\n$2') : null;
  const replaceArticle = () => /<article\b[^>]*>[\s\S]*?<\/article>/i.test(html)
    ? html.replace(/(<article\b[^>]*>)[\s\S]*?(<\/article>)/i, '$1\n' + item.body + '\n$2') : null;
  const replaceHeaderFooter = () => {
    const header = /<\/header>/i.exec(html), footer = /<footer\b/i.exec(html);
    if (!header || !footer || footer.index <= header.index) return null;
    const start = header.index + header[0].length;
    return html.slice(0, start) + '\n' + item.body + '\n' + html.slice(footer.index);
  };
  const replaceBody = () => /<body\b[^>]*>[\s\S]*<\/body>/i.test(html)
    ? html.replace(/(<body\b[^>]*>)[\s\S]*(<\/body>)/i, '$1\n' + item.body + '\n$2') : null;
  const strategies = preferred === 'header-footer' ? [replaceHeaderFooter, replaceMain, replaceArticle]
    : preferred === 'article' ? [replaceArticle, replaceHeaderFooter, replaceMain]
      : preferred === 'body' ? [replaceBody]
        : [replaceMain, replaceHeaderFooter, replaceArticle];
  for (const strategy of strategies) { const rendered = strategy(); if (rendered) return rendered; }
  return html;
}

function replaceHeadElement(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace(/<\/head>/i, '  ' + replacement + '\n</head>');
}

function renderPublishedCmsHtml(html, pathname) {
  const item = cmsItemForPath(pathname);
  if (!item) return { html, item: null };
  const title = cleanText(item.seo && item.seo.title || item.title, 240);
  const description = cleanText(item.seo && item.seo.description || item.summary, 500);
  const canonical = cleanText(item.seo && item.seo.canonicalUrl, 500);
  const socialImage = cleanText(item.seo && (item.seo.socialImage || item.featuredImage) || item.featuredImage, 500);
  if (title) {
    html = replaceHeadElement(html, /<title>[\s\S]*?<\/title>/i, '<title>' + escapeHtml(title) + '</title>');
    html = replaceHeadElement(html, /<meta\s+[^>]*property=["']og:title["'][^>]*>/i, '<meta property="og:title" content="' + escapeHtml(title) + '">');
    html = replaceHeadElement(html, /<meta\s+[^>]*name=["']twitter:title["'][^>]*>/i, '<meta name="twitter:title" content="' + escapeHtml(title) + '">');
  }
  if (description) {
    html = replaceHeadElement(html, /<meta\s+[^>]*name=["']description["'][^>]*>/i, '<meta name="description" content="' + escapeHtml(description) + '">');
    html = replaceHeadElement(html, /<meta\s+[^>]*property=["']og:description["'][^>]*>/i, '<meta property="og:description" content="' + escapeHtml(description) + '">');
    html = replaceHeadElement(html, /<meta\s+[^>]*name=["']twitter:description["'][^>]*>/i, '<meta name="twitter:description" content="' + escapeHtml(description) + '">');
  }
  if (canonical) {
    html = replaceHeadElement(html, /<link\s+[^>]*rel=["']canonical["'][^>]*>/i, '<link rel="canonical" href="' + escapeHtml(canonical) + '">');
    html = replaceHeadElement(html, /<meta\s+[^>]*property=["']og:url["'][^>]*>/i, '<meta property="og:url" content="' + escapeHtml(canonical) + '">');
  }
  if (socialImage) {
    html = replaceHeadElement(html, /<meta\s+[^>]*property=["']og:image["'][^>]*>/i, '<meta property="og:image" content="' + escapeHtml(socialImage) + '">');
    html = replaceHeadElement(html, /<meta\s+[^>]*name=["']twitter:image["'][^>]*>/i, '<meta name="twitter:image" content="' + escapeHtml(socialImage) + '">');
  }
  if (item.seo && item.seo.noIndex) html = replaceHeadElement(html, /<meta\s+[^>]*name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, nofollow">');
  html = renderCmsBodyRegion(html, item);
  return { html, item };
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
  const extension = path.extname(requested).toLowerCase();
  const isWebsiteScript = requested === path.join(root, 'script.js');
  const headers = {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'Cache-Control': extension === '.html' || isWebsiteScript ? 'no-cache' : 'public, max-age=86400'
  };
  if (extension === '.html') {
    const raw = fs.readFileSync(requested, 'utf8').replace(/\/script\.js\?v=\d+/g, '/script.js?v=' + websiteScriptVersion);
    const rendered = renderPublishedCmsHtml(raw, pathname);
    if (rendered.item) {
      headers['X-CMS-Rendered'] = contentStore.backend || 'json';
      headers['X-CMS-Body-Region'] = rendered.item.fields && rendered.item.fields.contentRegion || 'metadata';
    }
    res.writeHead(200, headers);
    return req.method === 'HEAD' ? res.end() : res.end(rendered.html);
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(requested).pipe(res);
}

ensureStorage();
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/health') return sendJson(res, 200, {
    status: 'ok',
    storageReady: true,
    storageBackend: contentStore.backend || 'json',
    staffAccounts: cmsUserStore ? cmsUserStore.listUsers().length : 1,
    mediaUploadsReady: true,
    adminConfigured: Boolean(adminPassword && sessionSecret),
    leadNotificationsConfigured: Boolean(web3FormsAccessKey),
    hcaptchaConfigured: Boolean(hcaptchaSecret),
    blockedIpCount: blockedIps.size
  });
  if (pathname.startsWith('/cms-media/')) { if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { message: 'Method not allowed.' }); return mediaUploads.serve(req, res, pathname); }
  if (pathname === '/api/cms/content') return sendPublishedContent(req, res);
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
  if (pathname === '/api/locations/us/states') {
    if (req.method !== 'GET') return sendJson(res, 405, { message: 'Method not allowed.' });
    return sendJson(res, 200, { states: usStates });
  }
  if (pathname === '/api/locations/us/cities') {
    if (req.method !== 'GET') return sendJson(res, 405, { message: 'Method not allowed.' });
    const stateCode = cleanText(new URL(req.url, 'http://localhost').searchParams.get('state'), 2).toUpperCase();
    if (!usStates.some((state) => state.code === stateCode)) {
      return sendJson(res, 400, { message: 'Please select a valid U.S. state.' });
    }
    const cities = Array.from(new Set(
      City.getCitiesOfState('US', stateCode).map((city) => city.name)
    )).sort((left, right) => left.localeCompare(right));
    return sendJson(res, 200, { cities });
  }
  if (pathname === cmsBasePath || pathname.startsWith(`${cmsBasePath}/`)) {
    const internalPathname = `/admin${pathname.slice(cmsBasePath.length)}`;
    return handleAdmin(req, res, internalPathname);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { message: 'Method not allowed.' });
  return serveStatic(req, res);
});

async function start() {
  await Promise.all([contentStore.ready, cmsUserStore ? cmsUserStore.ready : Promise.resolve()]);
  server.listen(port, '0.0.0.0', () => console.log(`Awad service listening on port ${port} using ${contentStore.backend || 'json'} storage`));
}
start().catch((error) => {
  console.error('[startup] Unable to initialize CMS storage:', error.message);
  process.exitCode = 1;
});
