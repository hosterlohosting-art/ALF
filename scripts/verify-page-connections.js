'use strict';

const { createClient } = require('@libsql/client');

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const baseUrl = String(process.env.CMS_VERIFY_BASE_URL || 'http://127.0.0.1:39010').replace(/\/$/, '');
if (!databaseUrl || !authToken) throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required.');
const client = createClient({ url: databaseUrl, authToken });

function extract(html, region) {
  if (region === 'header-footer') {
    const header = /<\/header>/i.exec(html), footer = /<footer\b/i.exec(html);
    return header && footer && footer.index > header.index ? html.slice(header.index + header[0].length, footer.index).trim() : null;
  }
  const expression = region === 'article' ? /<article\b[^>]*>([\s\S]*?)<\/article>/i
    : region === 'body' ? /<body\b[^>]*>([\s\S]*?)<\/body>/i
      : /<main\b[^>]*>([\s\S]*?)<\/main>/i;
  const match = html.match(expression);
  return match ? match[1].trim() : null;
}

(async () => {
  const result = await client.execute({ sql: 'SELECT data FROM cms_content WHERE type != ?', args: ['media'] });
  const items = result.rows.map((row) => JSON.parse(String(row.data)));
  const failures = [], counts = {};
  for (let index = 0; index < items.length; index += 12) {
    await Promise.all(items.slice(index, index + 12).map(async (item) => {
      const route = item.fields && item.fields.sourceRoute;
      const region = item.fields && item.fields.contentRegion;
      try {
        const response = await fetch(baseUrl + route);
        const html = await response.text();
        const rendered = extract(html, region);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        if (response.headers.get('x-cms-rendered') !== 'turso') throw new Error('missing Turso render header');
        if (response.headers.get('x-cms-body-region') !== region) throw new Error('wrong region header');
        if (rendered !== item.body.trim()) throw new Error('rendered body differs from Turso');
        counts[region] = (counts[region] || 0) + 1;
      } catch (error) { failures.push({ route, error: error.message }); }
    }));
  }
  console.log(JSON.stringify({ checked: items.length, passed: items.length - failures.length, failed: failures.length, regions: counts, failures: failures.slice(0, 20) }, null, 2));
  if (failures.length) process.exitCode = 1;
})().finally(() => client.close()).catch((error) => { console.error(error); process.exitCode = 1; });
