'use strict';
const crypto = require('crypto');
const { createClient } = require('@libsql/client');

const ROLES = Object.freeze(['administrator', 'editor', 'viewer']);
const STATUSES = Object.freeze(['active', 'disabled']);
function clean(value, limit = 250) { return String(value == null ? '' : value).replace(/\0/g, '').trim().slice(0, limit); }
function publicUser(user) { return user ? { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt } : null; }
function hashPassword(password) {
  const value = clean(password, 500);
  if (value.length < 12) throw new Error('Password must be at least 12 characters.');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(value, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(password, encoded) {
  const parts = String(encoded || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const expected = Buffer.from(parts[2], 'hex');
  const actual = crypto.scryptSync(String(password || ''), parts[1], expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function createCmsUserStore(options) {
  const client = createClient({ url: options.databaseUrl, authToken: options.authToken });
  let users = [], queue = Promise.resolve();
  async function initialise() {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS cms_users (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,role TEXT NOT NULL,status TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS cms_users_status ON cms_users(status,role)`
    ], 'write');
    const count = await client.execute('SELECT COUNT(*) AS count FROM cms_users');
    if (Number(count.rows[0].count || 0) === 0) {
      if (!options.initialPassword) throw new Error('ADMIN_PASSWORD is required to create the first CMS administrator.');
      const now = new Date().toISOString();
      await client.execute({
        sql: 'INSERT INTO cms_users (id,email,name,role,status,password_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
        args: [crypto.randomUUID(), clean(options.initialEmail || 'attorney@awadlaw.com').toLowerCase(), 'CMS Administrator', 'administrator', 'active', hashPassword(options.initialPassword), now, now]
      });
    }
    const result = await client.execute('SELECT id,email,name,role,status,password_hash,created_at,updated_at FROM cms_users ORDER BY created_at');
    users = result.rows.map((row) => ({ id: String(row.id), email: String(row.email), name: String(row.name), role: String(row.role), status: String(row.status), passwordHash: String(row.password_hash), createdAt: String(row.created_at), updatedAt: String(row.updated_at) }));
    console.log(`[cms] Loaded ${users.length} staff account${users.length === 1 ? '' : 's'} from Turso.`);
  }
  function listUsers() { return users.map(publicUser); }
  function getUser(id) { return publicUser(users.find((user) => user.id === id)); }
  async function authenticate(email, password) {
    const user = users.find((candidate) => candidate.email === clean(email).toLowerCase() && candidate.status === 'active');
    if (!user || !verifyPassword(password, user.passwordHash)) return null;
    return publicUser(user);
  }
  function saveUser(input) {
    queue = queue.then(async () => {
      const email = clean(input.email).toLowerCase(), name = clean(input.name, 120);
      const role = clean(input.role, 30), status = clean(input.status || 'active', 20);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
      if (!name) throw new Error('Staff name is required.');
      if (!ROLES.includes(role)) throw new Error('Choose a valid role.');
      if (!STATUSES.includes(status)) throw new Error('Choose a valid account status.');
      const existing = users.find((user) => user.id === input.id);
      if (users.some((user) => user.id !== (existing && existing.id) && user.email === email)) throw new Error('That email already has an account.');
      if (existing && existing.role === 'administrator' && existing.status === 'active' && (role !== 'administrator' || status !== 'active')) {
        const activeAdmins = users.filter((user) => user.role === 'administrator' && user.status === 'active');
        if (activeAdmins.length <= 1) throw new Error('The last active administrator cannot be disabled or changed.');
      }
      const now = new Date().toISOString();
      const passwordHash = clean(input.password, 500) ? hashPassword(input.password) : existing && existing.passwordHash;
      if (!passwordHash) throw new Error('A password is required for a new account.');
      const user = { id: existing ? existing.id : crypto.randomUUID(), email, name, role, status, passwordHash, createdAt: existing ? existing.createdAt : now, updatedAt: now };
      await client.execute({
        sql: `INSERT INTO cms_users (id,email,name,role,status,password_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,name=excluded.name,role=excluded.role,status=excluded.status,password_hash=excluded.password_hash,updated_at=excluded.updated_at`,
        args: [user.id, user.email, user.name, user.role, user.status, user.passwordHash, user.createdAt, user.updatedAt]
      });
      if (existing) Object.assign(existing, user); else users.push(user);
      return publicUser(user);
    });
    return queue;
  }
  return { ROLES, STATUSES, ready: initialise(), listUsers, getUser, authenticate, saveUser };
}

module.exports = { createCmsUserStore, ROLES, STATUSES };
