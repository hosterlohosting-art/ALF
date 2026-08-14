'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@libsql/client');

const root = path.resolve(__dirname, '..');
const apply = process.argv.includes('--apply');
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!databaseUrl || !authToken) throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required.');
const client = createClient({ url: databaseUrl, authToken });

function extractRegion(html) {
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
  if (body) return { region: 'body', body: body[1].trim() };
  throw new Error('No editable content region found.');
}

function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function revision(item, action, actor, createdAt) {
  return { id: crypto.randomUUID(), contentId: item.id, action, actor, createdAt, snapshot: item };
}
function audit(item, action, actor, createdAt) {
  return { id: crypto.randomUUID(), contentId: item.id, contentType: item.type, title: item.title, action, actor, createdAt };
}

(async () => {
  const result = await client.execute({ sql: 'SELECT id,data FROM cms_content WHERE type != ?', args: ['media'] });
  const changes = [], counts = {};
  for (const row of result.rows) {
    const previous = JSON.parse(String(row.data));
    const sourcePath = previous.fields && previous.fields.sourcePath;
    if (!sourcePath) throw new Error('Missing sourcePath for ' + previous.id);
    if (/\.psd$/i.test(sourcePath)) continue;
    const absolute = path.resolve(root, sourcePath);
    if (absolute !== root && !absolute.startsWith(root + path.sep)) throw new Error('Source path escaped project: ' + sourcePath);
    const html = fs.readFileSync(absolute, 'utf8');
    const extracted = extractRegion(html);
    if (!extracted.body) throw new Error('Empty content region: ' + sourcePath);
    if (extracted.body.length > 500000) throw new Error('Content region exceeds 500 KB: ' + sourcePath);
    const sourceHash = hash(html);
    if (previous.body === extracted.body && previous.fields.contentRegion === extracted.region && previous.fields.sourceHash === sourceHash) continue;
    const now = new Date().toISOString(), actor = 'site-connector';
    const updated = { ...previous, body: extracted.body, fields: { ...previous.fields, contentRegion: extracted.region, sourceHash, contentConnectedAt: now }, updatedAt: now, updatedBy: actor };
    changes.push({ previous, updated, now, actor });
    counts[extracted.region] = (counts[extracted.region] || 0) + 1;
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', records: changes.length, regions: counts }, null, 2));
  if (!apply) { console.log('Run with --apply to save these changes.'); return; }
  const statements = [];
  for (const change of changes) {
    const before = revision(change.previous, 'before-content-connection', change.actor, change.now);
    const after = revision(change.updated, 'content-connected', change.actor, change.now);
    const log = audit(change.updated, 'content-connected', change.actor, change.now);
    statements.push(
      { sql: 'UPDATE cms_content SET data=?,updated_at=? WHERE id=?', args: [JSON.stringify(change.updated), change.updated.updatedAt, change.updated.id] },
      { sql: 'INSERT INTO cms_revisions (id,content_id,data,created_at) VALUES (?,?,?,?)', args: [before.id, before.contentId, JSON.stringify(before), before.createdAt] },
      { sql: 'INSERT INTO cms_revisions (id,content_id,data,created_at) VALUES (?,?,?,?)', args: [after.id, after.contentId, JSON.stringify(after), after.createdAt] },
      { sql: 'INSERT INTO cms_audit (id,content_id,content_type,title,action,actor,created_at,data) VALUES (?,?,?,?,?,?,?,?)', args: [log.id, log.contentId, log.contentType, log.title, log.action, log.actor, log.createdAt, JSON.stringify(log)] }
    );
  }
  for (let index = 0; index < statements.length; index += 60) await client.batch(statements.slice(index, index + 60), 'write');
  console.log('Connected ' + changes.length + ' original content records to Turso page rendering.');
})().finally(() => client.close()).catch((error) => { console.error(error); process.exitCode = 1; });
