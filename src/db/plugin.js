'use strict';
// Plugins (renamed from "Github Extensions" in v4.2.0): download a plugin from
// a git repo URL, each declaring its own DB table(s) via a manifest. This file
// owns the DATA side only — repo resolution, install/uninstall, and the
// pluginApi.* query functions a sandboxed plugin window is allowed to call.
// Window creation/lifecycle (the actual sandboxing) is main.js's job, same as
// every other window in this app — see docs/PLUGINS.md for the full
// architecture and the security notes on what this design does and does NOT
// protect against.
//
// Identifier safety is the whole security boundary at this layer: no
// prepared-statement parameter can bind a table/column name, so every dynamic
// SQL identifier used here is checked against a strict whitelist regex (all of
// them live in ./plugin-manifest.js) before it ever reaches a query string —
// never a renderer/plugin-supplied string used directly. table_name in
// plugin_table is the ONLY identifier pluginApi ever resolves at runtime,
// always via a ?-bound lookup on (plugin_ref, local_name), never reconstructed
// by concatenation.
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { getDB } = require('./core');
const {
  PLUGIN_TABLE_RE, FULL_TABLE_RE, MAX_FILE_BYTES,
  MANIFEST_NAMES, REF_CANDIDATES,
  validateManifest, parseRepoUrl, rawUrl,
} = require('./plugin-manifest');

const dataRoot = () => path.dirname(app.getPath('userData'));
const pluginsRoot = () => path.join(dataRoot(), 'plugins');
const pluginDir = (pluginKey) => path.join(pluginsRoot(), pluginKey);

// One-time on-disk move for databases installed before the v4.2.0 rename —
// the DB half is handled by migratePluginV42() in schema/migrations.js. Called
// once from main.js at app.whenReady(); never throws (a failed move just means
// pre-rename plugins won't launch until reinstalled).
function migratePluginDir() {
  try {
    const oldDir = path.join(dataRoot(), 'extensions');
    if (fs.existsSync(oldDir) && !fs.existsSync(pluginsRoot())) fs.renameSync(oldDir, pluginsRoot());
  } catch (e) { console.error('plugin dir migration error:', e); }
}

// ---------------------------------------------------------------------------
// Download — one raw file at a time over global fetch(), buffer-then-write
// (matches drive.js's existing pattern exactly). No zip, no git, no octokit:
// this app has exactly one runtime dependency and this feature does not add
// a second. See docs/PLUGINS.md §2.5.
// ---------------------------------------------------------------------------
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

// Turns one pasted URL into a concrete {host,owner,repo,ref} + parsed manifest.
// When the URL names no branch we try REF_CANDIDATES (main, then master) and,
// per ref, both manifest filenames — so "paste the .git link" works without the
// user knowing either. A network failure is reported as `network`, not
// `no_manifest`, so the UI can tell "wrong repo" from "no internet".
async function resolveRepo(url) {
  const parsed = parseRepoUrl(url);
  if (!parsed.ok) return { ok: false, code: parsed.code };

  const refs = parsed.ref ? [parsed.ref] : REF_CANDIDATES;
  let sawNetworkError = null;
  for (const ref of refs) {
    const repoRef = { host: parsed.host, owner: parsed.owner, repo: parsed.repo, ref };
    for (const manifestName of MANIFEST_NAMES) {
      const res = await fetchText(rawUrl(repoRef, manifestName));
      if (res.ok) {
        let manifest;
        try { manifest = JSON.parse(res.text); }
        catch (_) { return { ok: false, code: 'bad_manifest', error: 'manifest is not valid JSON' }; }
        return { ok: true, ...repoRef, manifestName, manifest };
      }
      if (res.code === 'network') sawNetworkError = res.error;
    }
  }
  return sawNetworkError
    ? { ok: false, code: 'network', error: sawNetworkError }
    : { ok: false, code: 'no_manifest' };
}

// Read-only dry run behind the "paste a link" field: resolve + validate and
// report exactly what installing would create, WITHOUT touching disk or the DB.
// The renderer shows this for confirmation only — pluginInstall() below never
// trusts any of it and re-resolves everything itself.
async function pluginPreview(url) {
  const r = await resolveRepo(url);
  if (!r.ok) return r;

  const valid = validateManifest(r.manifest);
  if (!valid.ok) return { ok: false, code: 'bad_manifest', error: valid.error };

  const installed = getDB().prepare(`SELECT id FROM plugin WHERE plugin_key=?`).get(r.manifest.id);
  return {
    ok: true,
    url: String(url || '').trim(),
    host: r.host, owner: r.owner, repo: r.repo, ref: r.ref,
    manifestName: r.manifestName,
    alreadyInstalled: !!installed,
    manifest: {
      id: r.manifest.id, name: r.manifest.name, version: r.manifest.version || null,
      entry: r.manifest.entry, files: r.manifest.files,
      tables: (r.manifest.tables || []).map((t) => ({ name: t.name, columns: t.columns })),
    },
  };
}

// Takes the pasted URL and nothing else. Everything — repo coordinates, ref,
// manifest — is re-fetched and re-validated here; the preview above is a UI
// hint, never an input. This is the one trust boundary for the whole feature.
async function pluginInstall(url) {
  const r = await resolveRepo(url);
  if (!r.ok) return r;
  const { host, owner, repo, ref, manifest } = r;

  const valid = validateManifest(manifest);
  if (!valid.ok) return { ok: false, code: 'bad_manifest', error: valid.error };

  const db = getDB();
  if (db.prepare(`SELECT id FROM plugin WHERE plugin_key=?`).get(manifest.id)) {
    return { ok: false, code: 'already_installed' };
  }

  // Fetch every declared file fully into memory before writing anything.
  const fileBuffers = {};
  for (const relPath of manifest.files) {
    const res = await fetchBuffer(rawUrl({ host, owner, repo, ref }, relPath));
    if (!res.ok) return { ok: false, code: res.code === 'not_found' ? 'missing_file' : res.code, error: `${relPath}: ${res.error}` };
    fileBuffers[relPath] = res.buffer;
  }

  const dir = pluginDir(manifest.id);
  try {
    for (const [relPath, buf] of Object.entries(fileBuffers)) {
      const target = path.join(dir, relPath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buf);
    }

    db.transaction(() => {
      const res = db.prepare(`
        INSERT INTO plugin (plugin_key, name, version, repo_host, repo_owner, repo_name, repo_ref, entry_html, manifest_json)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).run(manifest.id, manifest.name, manifest.version || null, host, owner, repo, ref, manifest.entry, JSON.stringify(manifest));
      const pluginRowId = res.lastInsertRowid;

      for (const t of manifest.tables || []) {
        const tableName = `plg_${manifest.id}_${t.name}`;
        if (!FULL_TABLE_RE.test(tableName)) throw new Error(`invalid composed table name: ${tableName}`);
        const colDefs = t.columns.map((c) => `${c.name} ${String(c.type).toUpperCase()}`).join(', ');
        // Dynamic DDL via prepare().run(), matching the exact convention
        // migrations.js already uses for ALTER TABLE — never db.exec() from
        // outside conn.js/schema/*.
        db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${colDefs})`).run();
        db.prepare(`
          INSERT INTO plugin_table (plugin_ref, local_name, table_name, columns_json)
          VALUES (?,?,?,?)
        `).run(pluginRowId, t.name, tableName, JSON.stringify(t.columns));
      }
    })();
  } catch (e) {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
    return { ok: false, code: 'install_failed', error: String(e?.message || e) };
  }

  return { ok: true, pluginKey: manifest.id };
}

function pluginUninstall(id) {
  const db = getDB();
  const plugin = db.prepare(`SELECT * FROM plugin WHERE id=?`).get(id);
  if (!plugin) return { ok: false, code: 'not_found' };
  const tables = db.prepare(`SELECT table_name FROM plugin_table WHERE plugin_ref=?`).all(id);

  db.transaction(() => {
    for (const t of tables) {
      if (!FULL_TABLE_RE.test(t.table_name)) continue; // defensive — these are always DB-stored, already-validated names
      db.prepare(`DROP TABLE IF EXISTS ${t.table_name}`).run();
    }
    db.prepare(`DELETE FROM plugin WHERE id=?`).run(id); // cascades plugin_table
  })();

  try { fs.rmSync(pluginDir(plugin.plugin_key), { recursive: true, force: true }); } catch (_) {}
  return { ok: true };
}

function pluginList() {
  const db = getDB();
  const plugins = db.prepare(`
    SELECT id, plugin_key, name, version, repo_host, repo_owner, repo_name, repo_ref, entry_html, installed_at
    FROM plugin ORDER BY installed_at DESC
  `).all();
  const tables = db.prepare(`SELECT plugin_ref, local_name, columns_json FROM plugin_table`).all();
  return plugins.map((p) => ({
    ...p,
    tables: tables.filter((t) => t.plugin_ref === p.id).map((t) => ({ localName: t.local_name, columns: JSON.parse(t.columns_json) })),
  }));
}

function pluginGetById(id) {
  return getDB().prepare(`SELECT * FROM plugin WHERE id=?`).get(id) || null;
}

// ---------------------------------------------------------------------------
// pluginApi.* — called only from main.js's raw ipcMain.handle('pluginapi:table:*')
// registrations, which resolve pluginId from the CALLING WINDOW's identity
// (never renderer-supplied) before reaching these functions. Every op
// resolves table_name via a ?-bound lookup scoped to that one plugin,
// validates row-object keys against that row's own columns_json, and only
// then composes SQL using the DB-returned identifiers.
// ---------------------------------------------------------------------------
function resolveOwnedTable(pluginId, localName) {
  if (!PLUGIN_TABLE_RE.test(String(localName || ''))) return null;
  const row = getDB().prepare(`
    SELECT table_name, columns_json FROM plugin_table WHERE plugin_ref=? AND local_name=?
  `).get(pluginId, localName);
  if (!row) return null;
  return { tableName: row.table_name, columns: JSON.parse(row.columns_json) };
}

function validateRowKeys(row, columns) {
  const allowed = new Set(columns.map((c) => c.name));
  for (const k of Object.keys(row || {})) {
    if (!allowed.has(k)) throw new Error(`unknown column: ${k}`);
  }
}

function pluginApiGetSchema(pluginId, localName) {
  const t = resolveOwnedTable(pluginId, localName);
  if (!t) throw new Error('not an owned table');
  return { columns: t.columns };
}

function pluginApiQuery(pluginId, localName, filter) {
  const t = resolveOwnedTable(pluginId, localName);
  if (!t) throw new Error('not an owned table');
  const f = filter && typeof filter === 'object' ? filter : {};
  validateRowKeys(f, t.columns);
  const keys = Object.keys(f);
  const where = keys.length ? `WHERE ${keys.map((k) => `${k}=?`).join(' AND ')}` : '';
  return getDB().prepare(`SELECT * FROM ${t.tableName} ${where} ORDER BY id DESC`).all(...keys.map((k) => f[k]));
}

function pluginApiInsert(pluginId, localName, row) {
  const t = resolveOwnedTable(pluginId, localName);
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

function pluginApiUpdate(pluginId, localName, rowId, row) {
  const t = resolveOwnedTable(pluginId, localName);
  if (!t) throw new Error('not an owned table');
  const r = row && typeof row === 'object' ? row : {};
  validateRowKeys(r, t.columns);
  const keys = Object.keys(r);
  if (!keys.length) return { changes: 0 };
  const set = keys.map((k) => `${k}=?`).join(', ');
  const res = getDB().prepare(`UPDATE ${t.tableName} SET ${set} WHERE id=?`).run(...keys.map((k) => r[k]), rowId);
  return { changes: res.changes };
}

function pluginApiDelete(pluginId, localName, rowId) {
  const t = resolveOwnedTable(pluginId, localName);
  if (!t) throw new Error('not an owned table');
  const res = getDB().prepare(`DELETE FROM ${t.tableName} WHERE id=?`).run(rowId);
  return { changes: res.changes };
}

module.exports = {
  pluginList, pluginGetById, pluginPreview, pluginInstall, pluginUninstall,
  migratePluginDir,
  pluginApiGetSchema, pluginApiQuery, pluginApiInsert, pluginApiUpdate, pluginApiDelete,
  // re-exported so the run-dracondex `evalmain` checks can reach them through
  // database.js without knowing about the electron-free split
  validateManifest, parseRepoUrl,
};
