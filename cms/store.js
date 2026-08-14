'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTENT_TYPES = Object.freeze([
  'page',
  'article',
  'event',
  'team-member',
  'newsletter',
  'media',
  'global'
]);

const STATUSES = Object.freeze(['draft', 'published', 'archived']);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cleanText(value, maximum = 10000) {
  return String(value == null ? '' : value).replace(/\0/g, '').trim().slice(0, maximum);
}

function cleanSlug(value) {
  return cleanText(value, 180)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function atomicWrite(file, value) {
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporary, file);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`[cms] Unable to read ${path.basename(file)}:`, error.message);
    return clone(fallback);
  }
}

function createContentStore(options) {
  const storageDirectory = path.join(options.dataDir, 'cms');
  const contentFile = path.join(storageDirectory, 'content.json');
  const revisionsFile = path.join(storageDirectory, 'revisions.json');
  const auditFile = path.join(storageDirectory, 'audit.json');
  let queue = Promise.resolve();

  function ensure() {
    fs.mkdirSync(storageDirectory, { recursive: true, mode: 0o700 });
    if (!fs.existsSync(contentFile)) atomicWrite(contentFile, { version: 1, items: [] });
    if (!fs.existsSync(revisionsFile)) atomicWrite(revisionsFile, { version: 1, items: [] });
    if (!fs.existsSync(auditFile)) atomicWrite(auditFile, { version: 1, items: [] });
  }

  function readContent() {
    ensure();
    const document = readJson(contentFile, { version: 1, items: [] });
    if (!document || !Array.isArray(document.items)) return { version: 1, items: [] };
    return document;
  }

  function readRevisions() {
    ensure();
    const document = readJson(revisionsFile, { version: 1, items: [] });
    if (!document || !Array.isArray(document.items)) return { version: 1, items: [] };
    return document;
  }

  function readAudit() {
    ensure();
    const document = readJson(auditFile, { version: 1, items: [] });
    if (!document || !Array.isArray(document.items)) return { version: 1, items: [] };
    return document;
  }

  function validate(input, existingItems, currentId) {
    const type = cleanText(input.type, 40);
    const status = cleanText(input.status || 'draft', 20);
    const title = cleanText(input.title, 240);
    const slug = cleanSlug(input.slug || title);
    const locale = cleanText(input.locale || 'en', 10).toLowerCase();
    if (!CONTENT_TYPES.includes(type)) throw new Error('Unsupported content type.');
    if (!STATUSES.includes(status)) throw new Error('Unsupported publishing status.');
    if (!title) throw new Error('A title is required.');
    if (!slug) throw new Error('A URL slug is required.');
    if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(locale)) throw new Error('Locale must use a language code such as en or es.');
    const conflict = existingItems.find((item) => item.id !== currentId && item.type === type && item.locale === locale && item.slug === slug);
    if (conflict) throw new Error('That URL slug is already used by this content type and language.');
    return { type, status, title, slug, locale };
  }

  function normalise(input, previous, items) {
    const basics = validate(input, items, previous && previous.id);
    const now = new Date().toISOString();
    const seo = input.seo && typeof input.seo === 'object' ? input.seo : {};
    return {
      id: previous ? previous.id : crypto.randomUUID(),
      ...basics,
      summary: cleanText(input.summary, 1200),
      body: cleanText(input.body, 500000),
      featuredImage: cleanText(input.featuredImage, 500),
      seo: {
        title: cleanText(seo.title, 70),
        description: cleanText(seo.description, 170),
        canonicalUrl: cleanText(seo.canonicalUrl, 500),
        socialImage: cleanText(seo.socialImage, 500),
        noIndex: seo.noIndex === true
      },
      fields: input.fields && typeof input.fields === 'object' && !Array.isArray(input.fields) ? clone(input.fields) : {},
      createdAt: previous ? previous.createdAt : now,
      createdBy: previous ? previous.createdBy : cleanText(input.actor || 'admin', 120),
      updatedAt: now,
      updatedBy: cleanText(input.actor || 'admin', 120),
      publishedAt: basics.status === 'published' ? (previous && previous.publishedAt ? previous.publishedAt : now) : null
    };
  }

  function recordRevision(document, item, action, actor) {
    document.items.unshift({
      id: crypto.randomUUID(),
      contentId: item.id,
      action,
      actor: cleanText(actor || 'admin', 120),
      createdAt: new Date().toISOString(),
      snapshot: clone(item)
    });
    document.items = document.items.slice(0, 5000);
  }

  function recordAudit(document, item, action, actor) {
    document.items.unshift({
      id: crypto.randomUUID(),
      contentId: item.id,
      contentType: item.type,
      title: item.title,
      action,
      actor: cleanText(actor || 'admin', 120),
      createdAt: new Date().toISOString()
    });
    document.items = document.items.slice(0, 10000);
  }

  function transact(work) {
    queue = queue.then(work, work);
    return queue;
  }

  function list(filters = {}) {
    let items = readContent().items;
    if (filters.type) items = items.filter((item) => item.type === filters.type);
    if (filters.status) items = items.filter((item) => item.status === filters.status);
    if (filters.locale) items = items.filter((item) => item.locale === filters.locale);
    if (filters.search) {
      const query = cleanText(filters.search, 100).toLowerCase();
      items = items.filter((item) => `${item.title} ${item.slug} ${item.summary}`.toLowerCase().includes(query));
    }
    return clone(items.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt))));
  }

  function get(id) {
    const item = readContent().items.find((candidate) => candidate.id === id);
    return item ? clone(item) : null;
  }

  function revisions(id) {
    return clone(readRevisions().items.filter((revision) => revision.contentId === id));
  }

  function recentAudit(limit = 25) {
    return clone(readAudit().items.slice(0, Math.max(1, Math.min(Number(limit) || 25, 100))));
  }

  function save(input, actor = 'admin') {
    return transact(() => {
      const content = readContent();
      const revisionDocument = readRevisions();
      const auditDocument = readAudit();
      const index = content.items.findIndex((item) => item.id === input.id);
      const previous = index >= 0 ? content.items[index] : null;
      const item = normalise({ ...input, actor }, previous, content.items);
      const action = previous ? (previous.status !== item.status ? item.status : 'updated') : 'created';
      if (previous) recordRevision(revisionDocument, previous, 'before-update', actor);
      if (index >= 0) content.items[index] = item;
      else content.items.push(item);
      recordRevision(revisionDocument, item, action, actor);
      recordAudit(auditDocument, item, action, actor);
      atomicWrite(contentFile, content);
      atomicWrite(revisionsFile, revisionDocument);
      atomicWrite(auditFile, auditDocument);
      return clone(item);
    });
  }

  function restore(contentId, revisionId, actor = 'admin') {
    const revision = readRevisions().items.find((item) => item.id === revisionId && item.contentId === contentId);
    if (!revision) return Promise.reject(new Error('Revision not found.'));
    return save({ ...revision.snapshot, id: contentId }, actor);
  }

  ensure();
  return { CONTENT_TYPES, STATUSES, list, get, save, revisions, restore, recentAudit, storageDirectory };
}

module.exports = { createContentStore, CONTENT_TYPES, STATUSES, cleanSlug };
