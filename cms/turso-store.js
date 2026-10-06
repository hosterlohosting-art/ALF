'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@libsql/client');
const { CONTENT_TYPES, STATUSES, cleanSlug } = require('./store');

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function cleanText(value, maximum = 10000) { return String(value == null ? '' : value).replace(/\0/g, '').trim().slice(0, maximum); }
function readItems(file) {
  try { const value = JSON.parse(fs.readFileSync(file, 'utf8')); return Array.isArray(value.items) ? value.items : []; }
  catch (error) { if (error.code !== 'ENOENT') throw error; return []; }
}
function validate(input, items, currentId) {
  const type = cleanText(input.type, 40), status = cleanText(input.status || 'draft', 20);
  const title = cleanText(input.title, 240), slug = cleanSlug(input.slug || title);
  const locale = cleanText(input.locale || 'en', 10).toLowerCase();
  if (!CONTENT_TYPES.includes(type)) throw new Error('Unsupported content type.');
  if (!STATUSES.includes(status)) throw new Error('Unsupported publishing status.');
  if (!title) throw new Error('A title is required.');
  if (!slug) throw new Error('A URL slug is required.');
  if (!/^[a-z]{2}(?:-[a-z]{2})?$/.test(locale)) throw new Error('Locale must use a language code such as en or es.');
  if (items.some((item) => item.id !== currentId && item.type === type && item.locale === locale && item.slug === slug)) {
    throw new Error('That URL slug is already used by this content type and language.');
  }
  return { type, status, title, slug, locale };
}
function normalise(input, previous, items) {
  const basics = validate(input, items, previous && previous.id), now = new Date().toISOString();
  const seo = input.seo && typeof input.seo === 'object' ? input.seo : {};
  return {
    id: previous ? previous.id : crypto.randomUUID(), ...basics,
    summary: cleanText(input.summary, 1200), body: cleanText(input.body, 500000),
    featuredImage: cleanText(input.featuredImage, 500),
    seo: { title: cleanText(seo.title, 70), description: cleanText(seo.description, 170), canonicalUrl: cleanText(seo.canonicalUrl, 500), socialImage: cleanText(seo.socialImage, 500), noIndex: seo.noIndex === true },
    fields: input.fields && typeof input.fields === 'object' && !Array.isArray(input.fields) ? clone(input.fields) : {},
    createdAt: previous ? previous.createdAt : now,
    createdBy: previous ? previous.createdBy : cleanText(input.actor || 'admin', 120),
    updatedAt: now, updatedBy: cleanText(input.actor || 'admin', 120),
    publishedAt: basics.status === 'published' ? (previous && previous.publishedAt ? previous.publishedAt : now) : null
  };
}
function newRevision(item, action, actor) {
  return { id: crypto.randomUUID(), contentId: item.id, action, actor: cleanText(actor || 'admin', 120), createdAt: new Date().toISOString(), snapshot: clone(item) };
}
function newAudit(item, action, actor) {
  return { id: crypto.randomUUID(), contentId: item.id, contentType: item.type, title: item.title, action, actor: cleanText(actor || 'admin', 120), createdAt: new Date().toISOString() };
}

function createTursoContentStore(options) {
  const client = createClient({ url: options.databaseUrl, authToken: options.authToken });
  const localDirectory = path.join(options.dataDir, 'cms');
  let content = [], revisionItems = [], auditItems = [], subscriberItems = [], queue = Promise.resolve();
  const contentSql = (item) => ({
    sql: `INSERT INTO cms_content (id,type,status,title,slug,locale,data,updated_at) VALUES (?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET type=excluded.type,status=excluded.status,title=excluded.title,slug=excluded.slug,locale=excluded.locale,data=excluded.data,updated_at=excluded.updated_at`,
    args: [item.id, item.type, item.status, item.title, item.slug, item.locale, JSON.stringify(item), item.updatedAt]
  });
  const revisionSql = (item) => ({ sql: 'INSERT OR IGNORE INTO cms_revisions (id,content_id,data,created_at) VALUES (?,?,?,?)', args: [item.id, item.contentId, JSON.stringify(item), item.createdAt] });
  const auditSql = (item) => ({ sql: 'INSERT OR IGNORE INTO cms_audit (id,content_id,content_type,title,action,actor,created_at,data) VALUES (?,?,?,?,?,?,?,?)', args: [item.id, item.contentId, item.contentType, item.title, item.action, item.actor, item.createdAt, JSON.stringify(item)] });
  const subscriberSql = (item) => ({ sql: `INSERT INTO cms_subscribers (email,subscribed_at,last_subscribed_at,source,language) VALUES (?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET last_subscribed_at=excluded.last_subscribed_at,source=excluded.source,language=excluded.language`, args: [item.email, item.subscribedAt, item.lastSubscribedAt || item.subscribedAt, item.source || 'website', item.language || 'en'] });
  async function chunks(statements, size = 75) {
    for (let index = 0; index < statements.length; index += size) await client.batch(statements.slice(index, index + size), 'write');
  }
  async function initialise() {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS cms_content (id TEXT PRIMARY KEY,type TEXT NOT NULL,status TEXT NOT NULL,title TEXT NOT NULL,slug TEXT NOT NULL,locale TEXT NOT NULL,data TEXT NOT NULL,updated_at TEXT NOT NULL)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS cms_content_route ON cms_content(type,locale,slug)`,
      `CREATE INDEX IF NOT EXISTS cms_content_updated ON cms_content(updated_at DESC)`,
      `CREATE TABLE IF NOT EXISTS cms_revisions (id TEXT PRIMARY KEY,content_id TEXT NOT NULL,data TEXT NOT NULL,created_at TEXT NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS cms_revisions_content ON cms_revisions(content_id,created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS cms_audit (id TEXT PRIMARY KEY,content_id TEXT NOT NULL,content_type TEXT NOT NULL,title TEXT NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,created_at TEXT NOT NULL,data TEXT NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS cms_audit_created ON cms_audit(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS cms_subscribers (email TEXT PRIMARY KEY,subscribed_at TEXT NOT NULL,last_subscribed_at TEXT NOT NULL,source TEXT NOT NULL,language TEXT NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS cms_subscribers_date ON cms_subscribers(subscribed_at DESC)`
    ], 'write');
    const result = await client.execute('SELECT COUNT(*) AS count FROM cms_content');
    if (Number(result.rows[0].count || 0) === 0) {
      const importedContent = readItems(path.join(localDirectory, 'content.json'));
      const importedRevisions = readItems(path.join(localDirectory, 'revisions.json'));
      const importedAudit = readItems(path.join(localDirectory, 'audit.json'));
      if (importedContent.length) {
        console.log(`[cms] Migrating ${importedContent.length} content records to Turso.`);
        await chunks(importedContent.map(contentSql));
        await chunks(importedRevisions.map(revisionSql));
        await chunks(importedAudit.map(auditSql));
      }
    }
    const subscriberCount = await client.execute('SELECT COUNT(*) AS count FROM cms_subscribers');
    if (Number(subscriberCount.rows[0].count || 0) === 0) {
      const importedSubscribers = readItems(path.join(options.dataDir, 'subscribers.json'));
      if (importedSubscribers.length) await chunks(importedSubscribers.map(subscriberSql));
    }
    const [contentResult, revisionsResult, auditResult, subscribersResult] = await Promise.all([
      client.execute('SELECT data FROM cms_content ORDER BY updated_at DESC'),
      client.execute('SELECT data FROM cms_revisions ORDER BY created_at DESC LIMIT 5000'),
      client.execute('SELECT data FROM cms_audit ORDER BY created_at DESC LIMIT 10000'),
      client.execute('SELECT email,subscribed_at,last_subscribed_at,source,language FROM cms_subscribers ORDER BY subscribed_at DESC')
    ]);
    content = contentResult.rows.map((row) => JSON.parse(String(row.data)));
    revisionItems = revisionsResult.rows.map((row) => JSON.parse(String(row.data)));
    auditItems = auditResult.rows.map((row) => JSON.parse(String(row.data)));
    subscriberItems = subscribersResult.rows.map((row) => ({ email: String(row.email), subscribedAt: String(row.subscribed_at), lastSubscribedAt: String(row.last_subscribed_at), source: String(row.source), language: String(row.language) }));
    console.log(`[cms] Turso connected with ${content.length} content records and ${subscriberItems.length} subscribers.`);
  }
  function list(filters = {}) {
    let items = content;
    if (filters.type) items = items.filter((item) => item.type === filters.type);
    if (filters.status) items = items.filter((item) => item.status === filters.status);
    if (filters.locale) items = items.filter((item) => item.locale === filters.locale);
    if (filters.search) {
      const query = cleanText(filters.search, 100).toLowerCase();
      items = items.filter((item) => `${item.title} ${item.slug} ${item.summary}`.toLowerCase().includes(query));
    }
    return clone(items.slice().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))));
  }
  function get(id) { const item = content.find((candidate) => candidate.id === id); return item ? clone(item) : null; }
  function revisions(id) { return clone(revisionItems.filter((item) => item.contentId === id)); }
  function recentAudit(limit = 25) { return clone(auditItems.slice(0, Math.max(1, Math.min(Number(limit) || 25, 100)))); }
  function save(input, actor = 'admin') {
    queue = queue.then(async () => {
      const index = content.findIndex((item) => item.id === input.id), previous = index >= 0 ? content[index] : null;
      const item = normalise({ ...input, actor }, previous, content);
      const action = previous ? (previous.status !== item.status ? item.status : 'updated') : 'created';
      const addedRevisions = previous ? [newRevision(previous, 'before-update', actor), newRevision(item, action, actor)] : [newRevision(item, action, actor)];
      const addedAudit = newAudit(item, action, actor);
      await client.batch([contentSql(item), ...addedRevisions.map(revisionSql), auditSql(addedAudit)], 'write');
      if (index >= 0) content[index] = item; else content.push(item);
      revisionItems = [...addedRevisions.reverse(), ...revisionItems].slice(0, 5000);
      auditItems = [addedAudit, ...auditItems].slice(0, 10000);
      return clone(item);
    });
    return queue;
  }
  function listSubscribers() { return clone(subscriberItems.slice().sort((a, b) => String(b.subscribedAt).localeCompare(String(a.subscribedAt)))); }
  function saveSubscriber(record) {
    queue = queue.then(async () => {
      const email = cleanText(record.email, 254).toLowerCase();
      const existing = subscriberItems.find((item) => item.email === email);
      const item = existing
        ? { ...existing, lastSubscribedAt: record.subscribedAt, source: cleanText(record.source, 150), language: cleanText(record.language || 'en', 10) }
        : { email, subscribedAt: record.subscribedAt, lastSubscribedAt: record.subscribedAt, source: cleanText(record.source, 150), language: cleanText(record.language || 'en', 10) };
      await client.execute(subscriberSql(item));
      if (existing) Object.assign(existing, item); else subscriberItems.push(item);
      return { isNew: !existing };
    });
    return queue;
  }
  function restore(contentId, revisionId, actor = 'admin') {
    const revision = revisionItems.find((item) => item.id === revisionId && item.contentId === contentId);
    if (!revision) return Promise.reject(new Error('Revision not found.'));
    return save({ ...revision.snapshot, id: contentId }, actor);
  }
  return { CONTENT_TYPES, STATUSES, list, get, save, revisions, restore, recentAudit, listSubscribers, saveSubscriber, storageDirectory: 'Turso Cloud', backend: 'turso', ready: initialise() };
}

module.exports = { createTursoContentStore };
