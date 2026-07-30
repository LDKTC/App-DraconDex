'use strict';
// Github — Cloud Sync Function > Github (Plan.md): download "extensions"
// from a GitHub repo, each declaring its own DB table(s) via a manifest.
// This file owns the DATA side only — manifest validation, install/
// uninstall, and the extApi.* query functions a sandboxed extension window
// is allowed to call. Window creation/lifecycle (the actual sandboxing) is
// main.js's job, same as every other window in this app — see
// docs/EXTENSIONS.md for the full architecture and the security notes on
// what this design does and does NOT protect against.
//
// Identifier safety is the whole security boundary at this layer: no
// prepared-statement parameter can bind a table/column name, so every
// dynamic SQL identifier used here is checked against a strict whitelist
// regex before it ever reaches a query string — never a renderer/extension-
// supplied string used directly. table_name in extension_table is the ONLY
// identifier extApi ever resolves at runtime, always via a ?-bound lookup
// on (extension_ref, local_name), never reconstructed by concatenation.
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { getDB } = require('./core');

const EXT_ID_RE     = /^[a-z0-9_]{1,20}$/;
const EXT_TABLE_RE  = /^[a-z0-9_]{1,20}$/;
const EXT_COLUMN_RE = /^[a-z][a-z0-9_]{0,29}$/;
const FULL_TABLE_RE = /^ext_[a-z0-9_]{1,41}$/; // 'ext_' + id(<=20) + '_' + name(<=20)
const GITHUB_ID_RE  = /^[A-Za-z0-9._-]{1,100}$/;
const COL_TYPES     = new Set(['TEXT', 'INTEGER', 'REAL']);
const RESERVED_COLS = new Set(['id', 'rowid', 'oid', '_rowid_']);
const MAX_TABLES_PER_EXT = 10;
const MAX_COLS_PER_TABLE = 25;
const MAX_FILES = 30;
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB/file

const dataRoot = () => path.dirname(app.getPath('userData'));
const extDir = (extKey) => path.join(dataRoot(), 'extensions', extKey);

// ---------------------------------------------------------------------------
// Manifest validation — dracondex-extension.json. Rejects before anything is
// written to disk or the DB.
// ---------------------------------------------------------------------------
function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') return { ok: false, error: 'manifest is not an object' };
  const { id, name, version, entry, files, tables } = manifest;

  if (!EXT_ID_RE.test(String(id || ''))) return { ok: false, error: 'invalid or missing "id"' };
  if (!name || typeof name !== 'string' || name.length > 80) return { ok: false, error: 'invalid or missing "name"' };
  if (version != null && (typeof version !== 'string' || version.length > 40)) return { ok: false, error: 'invalid "version"' };
  if (!entry || typeof entry !== 'string') return { ok: false, error: 'invalid or missing "entry"' };

  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) {
    return { ok: false, error: `"files" must be a non-empty array of at most ${MAX_FILES} entries` };
  }
  for (const f of files) {
    if (typeof f !== 'string' || !f || f.includes('..') || f.startsWith('/') || f.includes('\\')) {
      return { ok: false, error: `unsafe file path: ${f}` };
    }
  }
  if (!files.includes(entry)) return { ok: false, error: '"entry" must be listed in "files"' };

  const tableList = Array.isArray(tables) ? tables : [];
  if (tableList.length > MAX_TABLES_PER_EXT) return { ok: false, error: `too many tables (max ${MAX_TABLES_PER_EXT})` };
  const seenTables = new Set();
  for (const t of tableList) {
    if (!t || !EXT_TABLE_RE.test(String(t.name || ''))) return { ok: false, error: `invalid table name: ${t?.name}` };
    if (seenTables.has(t.name)) return { ok: false, error: `duplicate table name: ${t.name}` };
    seenTables.add(t.name);

    const cols = Array.isArray(t.columns) ? t.columns : [];
    if (cols.length === 0 || cols.length > MAX_COLS_PER_TABLE) {
      return { ok: false, error: `table "${t.name}" must have 1-${MAX_COLS_PER_TABLE} columns` };
    }
    const seenCols = new Set();
    for (const c of cols) {
      const cname = String(c?.name || '');
      if (!c || !EXT_COLUMN_RE.test(cname)) return { ok: false, error: `invalid column name in table "${t.name}": ${c?.name}` };
      if (RESERVED_COLS.has(cname.toLowerCase())) return { ok: false, error: `reserved column name: ${c.name}` };
      if (!COL_TYPES.has(String(c.type || '').toUpperCase())) return { ok: false, error: `invalid column type for "${c.name}": ${c.type}` };
      if (seenCols.has(cname)) return { ok: false, error: `duplicate column name: ${c.name}` };
      seenCols.add(cname);
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// GitHub download — raw.githubusercontent.com, buffer-then-write (matches
// drive.js's existing pattern exactly), no zip/octokit dependency.
// ---------------------------------------------------------------------------
function rawUrl(owner, repo, ref, filePath) {
  const encPath = filePath.split('/').map(encodeURIComponent).join('/');
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(ref)}/${encPath}`;
}

async function fetchText(url) {
  let res;
  try { res = await fetch(url, { signal: AbortSignal.timeout(15000) }); }
  catch (e) { return { ok: false, code: 'network', error: String(e?.message || e) }; }
  if (!res.ok) return { ok: false, code: 'not_found', error: `HTTP ${res.status}` };
  return { ok: true, text: await res.text() };
}

async function fetchBuffer(url) {
  let res;
  try { res = await fetch(url, { signal: AbortSignal.timeout(30000) }); }
  catch (e) { return { ok: false, code: 'network', error: String(e?.message || e) }; }
  if (!res.ok) return { ok: false, code: 'not_found', error: `HTTP ${res.status}` };
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_FILE_BYTES) return { ok: false, code: 'too_large', error: `exceeds ${MAX_FILE_BYTES} bytes` };
  return { ok: true, buffer };
}

async function extensionInstall(owner, repo, ref) {
  owner = String(owner || '').trim();
  repo = String(repo || '').trim();
  ref = String(ref || 'main').trim() || 'main';
  if (!GITHUB_ID_RE.test(owner) || !GITHUB_ID_RE.test(repo) || !GITHUB_ID_RE.test(ref)) {
    return { ok: false, code: 'bad_repo' };
  }

  const manifestRes = await fetchText(rawUrl(owner, repo, ref, 'dracondex-extension.json'));
  if (!manifestRes.ok) {
    return { ok: false, code: manifestRes.code === 'not_found' ? 'no_manifest' : manifestRes.code, error: manifestRes.error };
  }
  let manifest;
  try { manifest = JSON.parse(manifestRes.text); }
  catch (_) { return { ok: false, code: 'bad_manifest', error: 'manifest is not valid JSON' }; }

  const valid = validateManifest(manifest);
  if (!valid.ok) return { ok: false, code: 'bad_manifest', error: valid.error };

  const db = getDB();
  if (db.prepare(`SELECT id FROM extension WHERE ext_key=?`).get(manifest.id)) {
    return { ok: false, code: 'already_installed' };
  }

  // Fetch every declared file fully into memory before writing anything.
  const fileBuffers = {};
  for (const relPath of manifest.files) {
    const r = await fetchBuffer(rawUrl(owner, repo, ref, relPath));
    if (!r.ok) return { ok: false, code: r.code === 'not_found' ? 'missing_file' : r.code, error: `${relPath}: ${r.error}` };
    fileBuffers[relPath] = r.buffer;
  }

  const dir = extDir(manifest.id);
  try {
    for (const [relPath, buf] of Object.entries(fileBuffers)) {
      const target = path.join(dir, relPath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buf);
    }

    db.transaction(() => {
      const r = db.prepare(`
        INSERT INTO extension (ext_key, name, version, repo_owner, repo_name, repo_ref, entry_html, manifest_json)
        VALUES (?,?,?,?,?,?,?,?)
      `).run(manifest.id, manifest.name, manifest.version || null, owner, repo, ref, manifest.entry, JSON.stringify(manifest));
      const extRowId = r.lastInsertRowid;

      for (const t of manifest.tables || []) {
        const tableName = `ext_${manifest.id}_${t.name}`;
        if (!FULL_TABLE_RE.test(tableName)) throw new Error(`invalid composed table name: ${tableName}`);
        const colDefs = t.columns.map((c) => `${c.name} ${String(c.type).toUpperCase()}`).join(', ');
        // Dynamic DDL via prepare().run(), matching the exact convention
        // migrations.js already uses for ALTER TABLE — never db.exec() from
        // outside conn.js/schema/*.
        db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${colDefs})`).run();
        db.prepare(`
          INSERT INTO extension_table (extension_ref, local_name, table_name, columns_json)
          VALUES (?,?,?,?)
        `).run(extRowId, t.name, tableName, JSON.stringify(t.columns));
      }
    })();
  } catch (e) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
    return { ok: false, code: 'install_failed', error: String(e?.message || e) };
  }

  return { ok: true, extKey: manifest.id };
}

function extensionUninstall(id) {
  const db = getDB();
  const ext = db.prepare(`SELECT * FROM extension WHERE id=?`).get(id);
  if (!ext) return { ok: false, code: 'not_found' };
  const tables = db.prepare(`SELECT table_name FROM extension_table WHERE extension_ref=?`).all(id);

  db.transaction(() => {
    for (const t of tables) {
      if (!FULL_TABLE_RE.test(t.table_name)) continue; // defensive — these are always DB-stored, already-validated names
      db.prepare(`DROP TABLE IF EXISTS ${t.table_name}`).run();
    }
    db.prepare(`DELETE FROM extension WHERE id=?`).run(id); // cascades extension_table
  })();

  try { fs.rmSync(extDir(ext.ext_key), { recursive: true, force: true }); } catch (_) {}
  return { ok: true };
}

function extensionList() {
  const db = getDB();
  const exts = db.prepare(`
    SELECT id, ext_key, name, version, repo_owner, repo_name, repo_ref, entry_html, installed_at
    FROM extension ORDER BY installed_at DESC
  `).all();
  const tables = db.prepare(`SELECT extension_ref, local_name, columns_json FROM extension_table`).all();
  return exts.map((e) => ({
    ...e,
    tables: tables.filter((t) => t.extension_ref === e.id).map((t) => ({ localName: t.local_name, columns: JSON.parse(t.columns_json) })),
  }));
}

function extensionGetById(id) {
  return getDB().prepare(`SELECT * FROM extension WHERE id=?`).get(id) || null;
}

// ---------------------------------------------------------------------------
// extApi.* — called only from main.js's raw ipcMain.handle('extapi:table:*')
// registrations, which resolve extId from the CALLING WINDOW's identity
// (never renderer-supplied) before reaching these functions. Every op
// resolves table_name via a ?-bound lookup scoped to that one extension,
// validates row-object keys against that row's own columns_json, and only
// then composes SQL using the DB-returned identifiers.
// ---------------------------------------------------------------------------
function resolveOwnedTable(extId, localName) {
  if (!EXT_TABLE_RE.test(String(localName || ''))) return null;
  const row = getDB().prepare(`
    SELECT table_name, columns_json FROM extension_table WHERE extension_ref=? AND local_name=?
  `).get(extId, localName);
  if (!row) return null;
  return { tableName: row.table_name, columns: JSON.parse(row.columns_json) };
}

function validateRowKeys(row, columns) {
  const allowed = new Set(columns.map((c) => c.name));
  for (const k of Object.keys(row || {})) {
    if (!allowed.has(k)) throw new Error(`unknown column: ${k}`);
  }
}

function extApiGetSchema(extId, localName) {
  const t = resolveOwnedTable(extId, localName);
  if (!t) throw new Error('not an owned table');
  return { columns: t.columns };
}

function extApiQuery(extId, localName, filter) {
  const t = resolveOwnedTable(extId, localName);
  if (!t) throw new Error('not an owned table');
  const f = filter && typeof filter === 'object' ? filter : {};
  validateRowKeys(f, t.columns);
  const keys = Object.keys(f);
  const where = keys.length ? `WHERE ${keys.map((k) => `${k}=?`).join(' AND ')}` : '';
  return getDB().prepare(`SELECT * FROM ${t.tableName} ${where} ORDER BY id DESC`).all(...keys.map((k) => f[k]));
}

function extApiInsert(extId, localName, row) {
  const t = resolveOwnedTable(extId, localName);
  if (!t) throw new Error('not an owned table');
  const r = row && typeof row === 'object' ? row : {};
  validateRowKeys(r, t.columns);
  const keys = Object.keys(r);
  if (!keys.length) {
    const res = getDB().prepare(`INSERT INTO ${t.tableName} DEFAULT VALUES`).run();
    return { id: res.lastInsertRowid };
  }
  const cols = keys.join(', ');
  const qs = keys.map(() => '?').join(', ');
  const res = getDB().prepare(`INSERT INTO ${t.tableName} (${cols}) VALUES (${qs})`).run(...keys.map((k) => r[k]));
  return { id: res.lastInsertRowid };
}

function extApiUpdate(extId, localName, rowId, row) {
  const t = resolveOwnedTable(extId, localName);
  if (!t) throw new Error('not an owned table');
  const r = row && typeof row === 'object' ? row : {};
  validateRowKeys(r, t.columns);
  const keys = Object.keys(r);
  if (!keys.length) return { changes: 0 };
  const set = keys.map((k) => `${k}=?`).join(', ');
  const res = getDB().prepare(`UPDATE ${t.tableName} SET ${set} WHERE id=?`).run(...keys.map((k) => r[k]), rowId);
  return { changes: res.changes };
}

function extApiDelete(extId, localName, rowId) {
  const t = resolveOwnedTable(extId, localName);
  if (!t) throw new Error('not an owned table');
  const res = getDB().prepare(`DELETE FROM ${t.tableName} WHERE id=?`).run(rowId);
  return { changes: res.changes };
}

module.exports = {
  extensionList, extensionGetById, extensionInstall, extensionUninstall,
  extApiGetSchema, extApiQuery, extApiInsert, extApiUpdate, extApiDelete,
  // exported for the fixture-based validator test (run-dracondex evalmain)
  validateManifest,
};
