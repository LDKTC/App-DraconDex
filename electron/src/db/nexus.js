'use strict';
// Nexus = vault. The renderer-facing module; app.ddx's `nexus_file` index that
// backs it lives in ./vaults.js.
//
// v4.9.0 split the read and the write halves apart:
//   - the LIST comes from the registry in app.ddx, so the Welcome window draws
//     it without opening any vault file (see vaults.js for why),
//   - name/memo/colour are written to BOTH the registry and the vault's own
//     single `nexus` row, so a vault file carried to another machine is
//     self-describing rather than an anonymous blob.
// Row shape is unchanged from before the split — {id, name, memo, color,
// color_code, update_at, project_count} — plus file_path and missing, so
// core/welcome.js and core/nexus.js keep their existing field names.
const { getAppDB, getVaultDB } = require('./core');
const {
  NEXUS_PROJECT_TABLES, listVaults, getVault, insertVault, insertVaultWithId,
  updateVaultMeta, removeVault, refreshVaultCounts, countVaultItems,
} = require('./vaults');

// One-time seed of the registry from a pre-split database, where the `nexus`
// table and app.ddx are still the same file. file_path stays NULL — "this
// vault has no file of its own yet"; the split migration fills it in.
//
// Runs from getNexuses() rather than the init path because it needs to read a
// VAULT table (`nexus`) while writing an APP table, which only makes sense
// while the two are the same database. Post-split the registry is already
// populated by the split migration and this finds nothing to do.
function backfillVaultRegistry() {
  const app = getAppDB();
  if (app.prepare(`SELECT id FROM nexus_file LIMIT 1`).get()) return;
  let rows;
  try {
    rows = app.prepare(`
      SELECT n.id, n.name, n.memo, c.color_code
      FROM nexus n LEFT JOIN use_color c ON c.id = n.color
      ORDER BY n.id
    `).all();
  } catch (_) {
    return; // no `nexus` table here — already split, nothing to backfill from
  }
  if (!rows.length) return;
  app.transaction(() => {
    for (const r of rows) {
      insertVaultWithId({ id: r.id, name: r.name, memo: r.memo, colorCode: r.color_code, filePath: null });
      const count = countVaultItems(app, r.id);
      app.prepare(`UPDATE nexus_file SET project_count=?, counts_at=datetime('now') WHERE id=?`).run(count, r.id);
    }
  })();
}

const getNexuses = () => {
  backfillVaultRegistry();
  return listVaults().map((v) => ({
    id: v.id,
    name: v.name,
    memo: v.memo,
    color: null,               // the id is meaningless across files; color_code is the value
    color_code: v.color_code,
    update_at: v.update_at,
    project_count: v.project_count,
    file_path: v.file_path,
    missing: v.missing,
  }));
};

// Reads the registry, then refreshes name/memo from the vault's own row when
// that vault happens to be open — the file is the source of truth for a vault
// that was edited on another machine and copied back.
const getNexus = (id) => {
  const v = getVault(id);
  if (!v) return undefined;
  const out = {
    id: v.id, name: v.name, memo: v.memo, color: null, color_code: v.color_code,
    update_at: v.update_at, project_count: v.project_count,
    file_path: v.file_path, missing: v.missing,
  };
  try {
    const inFile = getVaultDB(id).prepare(`
      SELECT n.name, n.memo, c.color_code FROM nexus n LEFT JOIN use_color c ON c.id = n.color WHERE n.id=?
    `).get(id);
    if (inFile) Object.assign(out, { name: inFile.name, memo: inFile.memo, color_code: inFile.color_code });
  } catch (_) { /* file missing — registry values stand */ }
  return out;
};

// Writes the vault's own `nexus` row first (it is the data), then the registry
// row (it is the index). The id is allocated from the registry up front so
// both sides carry the same one.
const createNexus = (name, memo, colorId) => {
  const colorCode = colorId
    ? getAppDB().prepare(`SELECT color_code FROM use_color WHERE id=?`).get(colorId)?.color_code ?? null
    : null;
  // Registry first, so AUTOINCREMENT hands out the id; the vault's own row then
  // carries that same id. If writing the vault fails — a duplicate name hitting
  // `nexus.name UNIQUE` is the normal case, surfaced to the user as
  // nexusNameTaken — the registry row is rolled back so no phantom vault is
  // left in the list.
  const id = insertVault({ name, memo: memo || null, colorCode, filePath: null });
  try {
    getVaultDB(id).prepare(`INSERT INTO nexus (id, name, memo, color) VALUES (?,?,?,?)`)
      .run(id, name, memo || null, colorId || null);
  } catch (e) {
    removeVault(id);
    throw e;
  }
  return id;
};

const updateNexus = (id, name, memo, colorId) => {
  const colorCode = colorId
    ? getAppDB().prepare(`SELECT color_code FROM use_color WHERE id=?`).get(colorId)?.color_code ?? null
    : null;
  getVaultDB(id).prepare(`UPDATE nexus SET name=?, memo=?, color=?, update_at=datetime('now') WHERE id=?`)
    .run(name, memo || null, colorId || null, id);
  updateVaultMeta(id, { name, memo: memo || null, colorCode });
};

// Refuses to delete a vault that still owns projects in any module; the
// renderer surfaces {blocked,count} as a toast instead of cascading data loss.
// The count comes from the vault file when it can be opened and from the
// cached registry value when it can't — a vault whose file is unreachable must
// not be deletable "because it looked empty".
const deleteNexus = (id) => {
  let count;
  try {
    count = countVaultItems(getVaultDB(id), id);
  } catch (_) {
    count = getVault(id)?.project_count ?? 0;
  }
  if (count > 0) return { blocked: true, count };
  try { getVaultDB(id).prepare(`DELETE FROM nexus WHERE id=?`).run(id); } catch (_) {}
  removeVault(id);
  return { blocked: false, count: 0 };
};

module.exports = {
  getNexuses, getNexus, createNexus, updateNexus, deleteNexus,
  refreshVaultCounts, NEXUS_PROJECT_TABLES,
};
