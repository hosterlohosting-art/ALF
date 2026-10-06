'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(process.argv[2] || process.cwd());
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, '.data'));
const cmsDir = path.join(dataDir, 'cms');
const contentFile = path.join(cmsDir, 'content.json');
const revisionsFile = path.join(cmsDir, 'revisions.json');
const auditFile = path.join(cmsDir, 'audit.json');
const now = new Date().toISOString();

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; return fallback; }
}

function atomicWrite(file, document) {
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporary, file);
}

function walk(directory, predicate, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.data' || entry.name.startsWith('.codex')) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute, predicate, output);
    else if (predicate(absolute)) output.push(absolute);
  }
  return output;
}

function relative(absolute) { return path.relative(root, absolute).replace(/\\/g, '/'); }
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function decode(value) {
  return String(value || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function textFromHtml(value) { return decode(String(value || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')); }
function firstMatch(html, expression) { const match = html.match(expression); return match ? decode(match[1]) : ''; }
function attribute(tag, name) { const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i')); return match ? decode(match[2]) : ''; }
function meta(html, key, value) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attribute(match[0], key).toLowerCase() === value.toLowerCase()) return attribute(match[0], 'content');
  }
  return '';
}
function link(html, rel) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    if (attribute(match[0], 'rel').toLowerCase() === rel.toLowerCase()) return attribute(match[0], 'href');
  }
  return '';
}

function routeFor(sourcePath) {
  if (sourcePath === 'index.html') return '/';
  if (sourcePath.endsWith('/index.html')) return `/${sourcePath.slice(0, -'index.html'.length)}`;
  return `/${sourcePath.replace(/\.html$/i, '')}/`;
}

function routePriority(sourcePath) {
  if (sourcePath === 'index.html') return 3;
  if (sourcePath.endsWith('/index.html')) return 2;
  return 1;
}

function contentType(route) {
  if (/^\/(?:es\/)?team-members\/.+[^/]\/$/.test(route) || /^\/(?:es\/)?team-[^/]+\/$/.test(route)) return 'team-member';
  if (/^\/(?:es\/)?(?:newsletter|boletin)\/$/.test(route)) return 'newsletter';
  if (/\/(?:edu-guide-|average-car-|how-long-|report-car-|who-pays-|ai-search-overview)/.test(route)) return 'article';
  if (/^\/(?:es\/)?community-[^/]+\/$/.test(route)) return 'article';
  return 'page';
}

function titleFor(html, route) {
  const h1 = firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return textFromHtml(h1 || title || route).replace(/\s*[|–—-]\s*(?:The\s+)?Awad Law Firm.*$/i, '').trim() || 'Untitled page';
}

function slugFor(route) {
  const cleaned = route.replace(/^\/es\//, '/').replace(/^\/|\/$/g, '').replace(/\//g, '-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'home';
}

function contentRegionFromHtml(html) {
  const header = /<\/header>/i.exec(html), footer = /<footer\b/i.exec(html);
  if (header && footer && footer.index > header.index) {
    const start = header.index + header[0].length;
    return { region: 'header-footer', body: html.slice(start, footer.index).trim() };
  }
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return { region: 'main', body: main[1].trim() };
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (article) return { region: 'article', body: article[1].trim() };
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return body ? { region: 'body', body: body[1].trim() } : { region: '', body: '' };
}

function pageRecord(sourcePath, html) {
  const route = routeFor(sourcePath);
  const type = contentType(route);
  const locale = route.startsWith('/es/') ? 'es' : 'en';
  const editable = contentRegionFromHtml(html);
  const body = editable.body.slice(0, 500000);
  const description = meta(html, 'name', 'description') || meta(html, 'property', 'og:description');
  const sourceHash = hash(html);
  const fields = { sourcePath, sourceRoute: route, sourceHash, importedAt: now, contentRegion: editable.region };
  if (type === 'page') fields.template = /practice|accident|injury|malpractice|death/i.test(route) ? 'practice-area' : 'standard';
  if (type === 'article') { fields.author = 'Awad Law Firm'; fields.category = route.includes('community-') ? 'Community' : 'Legal Guides'; }
  if (type === 'team-member') fields.role = firstMatch(html, /<(?:p|h2|h3)\b[^>]*class=["'][^"']*(?:role|position|title)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|h2|h3)>/i) || 'Awad Law Firm Team';
  if (type === 'newsletter') fields.edition = locale === 'es' ? 'Spanish newsletter' : 'English newsletter';
  return {
    type, locale, title: titleFor(html, route), slug: slugFor(route), status: 'published',
    summary: description.slice(0, 1200), body, featuredImage: meta(html, 'property', 'og:image'),
    seo: { title: firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i).slice(0, 70), description: description.slice(0, 170), canonicalUrl: link(html, 'canonical'), socialImage: meta(html, 'property', 'og:image'), noIndex: /<meta\b[^>]*name=["']robots["'][^>]*noindex/i.test(html) },
    fields, sourceHash
  };
}

function mediaRecord(sourcePath, stat) {
  const extension = path.extname(sourcePath);
  const base = path.basename(sourcePath, extension);
  const readable = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const sourceHash = hash(`${sourcePath}:${stat.size}:${stat.mtimeMs}`);
  return {
    type: 'media', locale: sourcePath.startsWith('assets/es/') ? 'es' : 'en', title: readable || path.basename(sourcePath),
    slug: `${readable.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'asset'}-${hash(sourcePath).slice(0, 8)}`,
    status: 'published', summary: '', body: '', featuredImage: '', seo: { title: '', description: '', canonicalUrl: '', socialImage: '', noIndex: true },
    fields: { sourcePath, sourceHash, importedAt: now, fileUrl: `/${sourcePath}`, altText: readable, caption: '', credit: '', fileType: extension.slice(1).toLowerCase(), bytes: stat.size }, sourceHash
  };
}

function importRecords(records) {
  fs.mkdirSync(cmsDir, { recursive: true, mode: 0o700 });
  const content = readJson(contentFile, { version: 1, items: [] });
  const revisions = readJson(revisionsFile, { version: 1, items: [] });
  const audit = readJson(auditFile, { version: 1, items: [] });
  const bySource = new Map(content.items.filter((item) => item.fields && item.fields.sourcePath).map((item) => [`${item.type}:${item.fields.sourcePath}`, item]));
  let created = 0; let updated = 0; let unchanged = 0;
  for (const record of records) {
    const key = `${record.type}:${record.fields.sourcePath}`;
    const previous = bySource.get(key);
    if (previous && previous.fields.sourceHash === record.sourceHash) { unchanged += 1; continue; }
    const item = { ...record, id: previous ? previous.id : crypto.randomUUID(), createdAt: previous ? previous.createdAt : now, createdBy: previous ? previous.createdBy : 'site-importer', updatedAt: now, updatedBy: 'site-importer', publishedAt: previous && previous.publishedAt ? previous.publishedAt : now };
    delete item.sourceHash;
    if (previous) {
      revisions.items.unshift({ id: crypto.randomUUID(), contentId: previous.id, action: 'before-import', actor: 'site-importer', createdAt: now, snapshot: previous });
      content.items[content.items.findIndex((candidate) => candidate.id === previous.id)] = item;
      updated += 1;
    } else { content.items.push(item); created += 1; }
    revisions.items.unshift({ id: crypto.randomUUID(), contentId: item.id, action: previous ? 'import-updated' : 'imported', actor: 'site-importer', createdAt: now, snapshot: item });
    audit.items.unshift({ id: crypto.randomUUID(), contentId: item.id, contentType: item.type, title: item.title, action: previous ? 'import-updated' : 'imported', actor: 'site-importer', createdAt: now });
  }
  revisions.items = revisions.items.slice(0, 5000);
  audit.items = audit.items.slice(0, 10000);
  atomicWrite(contentFile, content); atomicWrite(revisionsFile, revisions); atomicWrite(auditFile, audit);
  return { created, updated, unchanged, total: content.items.length };
}

const htmlFiles = walk(root, (file) => file.toLowerCase().endsWith('.html'));
const selectedRoutes = new Map();
for (const file of htmlFiles) {
  const sourcePath = relative(file); const route = routeFor(sourcePath); const existing = selectedRoutes.get(route);
  if (!existing || routePriority(sourcePath) > routePriority(existing)) selectedRoutes.set(route, sourcePath);
}
const rawPages = Array.from(selectedRoutes.values()).sort().map((sourcePath) => pageRecord(sourcePath, fs.readFileSync(path.join(root, sourcePath), 'utf8')));
const canonicalPages = new Map();
for (const page of rawPages) {
  const canonical = String(page.seo.canonicalUrl || '').toLowerCase().replace(/^https?:\/\/(?:www\.)?theawadlawfirm\.com/, '').replace(/\/index\.html$/, '/');
  const key = canonical || `${page.locale}:${page.type}:${page.fields.sourceRoute}`;
  const existing = canonicalPages.get(key);
  if (!existing || routePriority(page.fields.sourcePath) > routePriority(existing.fields.sourcePath)) canonicalPages.set(key, page);
}
const pages = Array.from(canonicalPages.values());
const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.pdf', '.doc', '.docx']);
const media = walk(path.join(root, 'assets'), (file) => mediaExtensions.has(path.extname(file).toLowerCase())).map((file) => mediaRecord(relative(file), fs.statSync(file)));
const result = importRecords([...pages, ...media]);
const counts = {};
for (const item of [...pages, ...media]) counts[item.type] = (counts[item.type] || 0) + 1;
console.log(JSON.stringify({ ...result, selectedHtmlRoutes: pages.length, mediaAssets: media.length, counts }, null, 2));
