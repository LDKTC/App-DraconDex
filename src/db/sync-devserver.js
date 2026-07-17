'use strict';
// Dev-mode prototype sync server. In an unpackaged run (`npm start`, drivers)
// the real Supabase backend is replaced by this in-process HTTP server: the
// same 5 RPC endpoints with the same auth rules and error bodies as
// supabase/migrations/20260717000000_dracondex_sync_prototype.sql, so the
// whole sync flow is testable with zero Supabase setup. State persists as
// JSON next to novel-manager.db in the dev data dir. Loopback only; never
// started in a packaged build (src/db/sync.js gates on app.isPackaged).
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const MAX_SNAPSHOT_BYTES = 10485760;

let state = null;   // { vaults: {id: {...}}, keys: {hash: {vault_id, role}} }
let stateFile = null;
let serverUrl = null;
let starting = null;

function loadState() {
  stateFile = path.join(path.dirname(app.getPath('userData')), 'dev-sync-server.json');
  try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch (_) { state = null; }
  if (!state || typeof state !== 'object') state = { vaults: {}, keys: {} };
  state.vaults = state.vaults || {};
  state.keys = state.keys || {};
}

function saveState() {
  try { fs.writeFileSync(stateFile, JSON.stringify(state)); } catch (e) {
    console.error('dev-sync-server: persist failed:', e);
  }
}

const hashKey = (k) => crypto.createHash('sha256').update(String(k || ''), 'utf8').digest('hex');

// Mirrors _sync_auth in the migration: bad_key / not_owner.
function auth(key, needOwner) {
  const k = state.keys[hashKey(key)];
  if (!k) throw new Error('bad_key');
  if (needOwner && k.role !== 'owner') throw new Error('not_owner');
  return k;
}

function checkSize(snapshot) {
  if (Buffer.byteLength(JSON.stringify(snapshot ?? null)) > MAX_SNAPSHOT_BYTES) {
    throw new Error('too_large');
  }
}

const rpcs = {
  sync_create_vault(p) {
    checkSize(p.p_snapshot);
    if (!p.p_owner_key || String(p.p_owner_key).length < 19) throw new Error('bad_key');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    state.vaults[id] = { id, name: p.p_name || 'vault', snapshot: p.p_snapshot, snapshot_at: now, created_at: now };
    state.keys[hashKey(p.p_owner_key)] = { vault_id: id, role: 'owner' };
    saveState();
    return { vault_id: id, snapshot_at: now };
  },
  sync_push_vault(p) {
    checkSize(p.p_snapshot);
    const k = auth(p.p_key, true);
    const v = state.vaults[k.vault_id];
    v.name = p.p_name ?? v.name;
    v.snapshot = p.p_snapshot;
    v.snapshot_at = new Date().toISOString();
    saveState();
    return { vault_id: v.id, snapshot_at: v.snapshot_at };
  },
  sync_pull_vault(p) {
    const k = auth(p.p_key, false);
    const v = state.vaults[k.vault_id];
    return { vault_id: v.id, name: v.name, snapshot: v.snapshot, snapshot_at: v.snapshot_at, role: k.role };
  },
  sync_create_read_key(p) {
    const k = auth(p.p_owner_key, true);
    if (!p.p_new_key || String(p.p_new_key).length < 19) throw new Error('bad_key');
    state.keys[hashKey(p.p_new_key)] = { vault_id: k.vault_id, role: 'read' };
    saveState();
    return { key_id: crypto.randomUUID() };
  },
  sync_vault_status(p) {
    const k = auth(p.p_key, false);
    const v = state.vaults[k.vault_id];
    const n = Object.values(state.keys).filter((x) => x.vault_id === k.vault_id).length;
    return { vault_id: v.id, name: v.name, snapshot_at: v.snapshot_at, role: k.role, key_count: n };
  },
};

const KNOWN = ['bad_key', 'not_owner', 'too_large'];

function handle(req, res) {
  const send = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  const m = /^\/rest\/v1\/rpc\/(\w+)$/.exec(req.url);
  if (!m || req.method !== 'POST') return send(404, { message: 'not found' });
  if (!req.headers.apikey) return send(401, { message: 'No API key found in request' });
  const fn = rpcs[m[1]];
  if (!fn) return send(404, { message: `function ${m[1]} not found` });
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    let params;
    try { params = JSON.parse(body || '{}'); } catch (_) { return send(400, { message: 'bad json' }); }
    try {
      send(200, fn(params));
    } catch (e) {
      const msg = String(e.message || e);
      send(KNOWN.includes(msg) ? 400 : 500, { message: msg });
    }
  });
}

// Starts once per process on an ephemeral loopback port; the URL is injected
// into the sync client at runtime and never persisted.
function ensureDevSyncServer() {
  if (serverUrl) return Promise.resolve(serverUrl);
  if (starting) return starting;
  starting = new Promise((resolve, reject) => {
    loadState();
    const srv = http.createServer(handle);
    srv.on('error', (e) => { starting = null; reject(e); });
    srv.unref();
    srv.listen(0, '127.0.0.1', () => {
      serverUrl = `http://127.0.0.1:${srv.address().port}`;
      console.log(`dev-sync-server: prototype sync backend at ${serverUrl} (state: ${stateFile})`);
      resolve(serverUrl);
    });
  });
  return starting;
}

module.exports = { ensureDevSyncServer };
