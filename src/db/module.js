'use strict';
const { getDB } = require('./core');
const wiki = require('./wiki');
const versions = require('./versions');

const nexusOfModule = (id) => getDB().prepare(`SELECT nexus_ref FROM module WHERE id=?`).get(id)?.nexus_ref ?? null;

const SEL = `
  SELECT m.*, c.color_code, ic.color_code AS icon_color_code
  FROM module m
  LEFT JOIN use_color c  ON c.id  = m.color
  LEFT JOIN use_color ic ON ic.id = m.icon_color
`;

// Root modules (parent_id NULL) each carrying their descendants, recursively,
// at any depth (Plan part1 #4/#4-2 — a module can be nested arbitrarily deep,
// not just the old fixed Major/Minor two levels), ordered by display_order
// then id within each parent.
function getTree(nexusRef) {
  const rows = getDB().prepare(`${SEL} WHERE m.nexus_ref = ? ORDER BY m.parent_id IS NOT NULL, m.display_order, m.id`).all(nexusRef);
  const childrenByParent = new Map();
  for (const r of rows) {
    const key = r.parent_id ?? null;
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(r);
  }
  const attach = (m) => ({ ...m, children: (childrenByParent.get(m.id) || []).map(attach) });
  return (childrenByParent.get(null) || []).map(attach);
}

const getModule = (id) => getDB().prepare(`${SEL} WHERE m.id = ?`).get(id);

function createModule(data) {
  const d = getDB();
  const { nexus_ref, parent_id = null, name, kind, icon = null, icon_color = null, color = null, cat_type = null } = data;
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(display_order),-1) AS m FROM module WHERE nexus_ref=? AND parent_id IS ?`)
    .get(nexus_ref, parent_id).m;
  return d.prepare(`
    INSERT INTO module (nexus_ref, parent_id, name, kind, icon, icon_color, color, cat_type, display_order)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(nexus_ref, parent_id, name, kind, icon, icon_color, color, cat_type, maxOrder + 1).lastInsertRowid;
}

function updateModule(id, data) {
  const cur = getDB().prepare(`SELECT * FROM module WHERE id=?`).get(id);
  if (!cur) return;
  const { name = cur.name, icon = cur.icon, icon_color = cur.icon_color, color = cur.color, pinned = cur.pinned } = data;
  getDB().prepare(`UPDATE module SET name=?, icon=?, icon_color=?, color=?, pinned=?, update_at=datetime('now') WHERE id=?`)
    .run(name, icon, icon_color, color, pinned, id);
  if (name !== cur.name) wiki.renameWikiTarget(`module_${id}`, cur.name, name);
}

// Duplicate a module and its whole descendant subtree (Plan part2 #1 —
// context-menu "Duplicate"). The clone is inserted as a sibling (same
// parent_id as the source), recursing through children/grandchildren/etc.
// so no data is silently dropped. Reuses createModule for column
// population rather than a second raw INSERT. pinned is always reset to 0
// on every cloned row — ponytail: a duplicate shouldn't clutter the pinned
// rail; clone-pinned-too can be added if a later request asks for it.
function cloneModuleSubtree(srcId, newParentId, isRoot) {
  const d = getDB();
  const src = d.prepare(`SELECT * FROM module WHERE id=?`).get(srcId);
  if (!src) return null;
  const newId = createModule({
    nexus_ref: src.nexus_ref,
    parent_id: newParentId,
    name: isRoot ? `${src.name} (Copy)` : src.name,
    kind: src.kind,
    icon: src.icon,
    icon_color: src.icon_color,
    color: src.color,
    cat_type: src.cat_type,
  });
  if (src.description) updateModuleDescription(newId, src.description);
  const children = d.prepare(`SELECT id FROM module WHERE parent_id=? ORDER BY display_order, id`).all(srcId);
  for (const c of children) cloneModuleSubtree(c.id, newId, false);
  return newId;
}

function duplicateModule(id) {
  const d = getDB();
  const src = d.prepare(`SELECT parent_id FROM module WHERE id=?`).get(id);
  if (!src) return null;
  let newId;
  const tx = d.transaction(() => { newId = cloneModuleSubtree(id, src.parent_id, true); });
  tx();
  return newId;
}

// Free text with [[wikilinks]] — reindexed on every save, same as object
// notes / Scribe notes (src/db/director.js updateObjectNote, src/db/scribe.js).
function updateModuleDescription(id, description) {
  const prev = getDB().prepare(`SELECT description FROM module WHERE id=?`).get(id)?.description ?? '';
  getDB().prepare(`UPDATE module SET description=?, update_at=datetime('now') WHERE id=?`).run(description, id);
  wiki.reindexWikiLinks(`module_${id}`, description, nexusOfModule(id));
  if (prev !== (description ?? '')) {
    versions.recordVersion(id, 'note', String(prev).slice(0, 60),
      { op: 'moduleDescription', args: { id, value: prev } });
  }
}

const deleteModule = (id) => getDB().prepare(`DELETE FROM module WHERE id=?`).run(id);

// Move a module to (possibly the same) parent and write display_order for
// every child of that parent in the given final order — one call covers
// both plain sibling reordering (newParentId unchanged) and reparenting
// (Plan part1 #4: a top-level module dropped onto another module becomes
// its child). Which moves are legal (top-level modules can go anywhere,
// nested ones are locked to their current parent) is enforced by the
// renderer before this is ever called — see hub.js's onNestDrop.
function moveModule(nexusRef, moduleId, newParentId, orderedSiblingIds) {
  const d = getDB();
  const tx = d.transaction(() => {
    d.prepare(`UPDATE module SET parent_id=? WHERE id=? AND nexus_ref=?`).run(newParentId, moduleId, nexusRef);
    orderedSiblingIds.forEach((id, idx) => {
      d.prepare(`UPDATE module SET display_order=? WHERE id=? AND nexus_ref=?`).run(idx, id, nexusRef);
    });
  });
  tx();
}

const countModules = (nexusRef) => getDB().prepare(`SELECT COUNT(*) AS c FROM module WHERE nexus_ref=?`).get(nexusRef).c;

// ═══ Module Inspector (Phase 4) ═══════════════════════════════════════
const getModuleAttrs = (moduleId) =>
  getDB().prepare(`SELECT * FROM module_attribute WHERE module_ref=? ORDER BY display_order, id`).all(moduleId);

function upsertModuleAttr(moduleId, attrId, name, value) {
  const d = getDB();
  if (attrId) {
    const prev = d.prepare(`SELECT * FROM module_attribute WHERE id=?`).get(attrId);
    d.prepare(`UPDATE module_attribute SET attr_name=?, attr_value=?, update_at=datetime('now') WHERE id=?`).run(name, value, attrId);
    if (prev) versions.recordVersion(moduleId, 'attr', `${prev.attr_name}: ${prev.attr_value ?? ''} → ${value ?? ''}`,
      { op: 'moduleAttr', args: { moduleId, attrId, name: prev.attr_name, value: prev.attr_value } });
    return attrId;
  }
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(display_order),-1) AS m FROM module_attribute WHERE module_ref=?`).get(moduleId).m;
  const newId = d.prepare(`INSERT INTO module_attribute (module_ref, attr_name, attr_value, display_order) VALUES (?,?,?,?)`)
    .run(moduleId, name, value, maxOrder + 1).lastInsertRowid;
  versions.recordVersion(moduleId, 'attr', `+ ${name}`,
    { op: 'moduleAttrDelete', args: { attrId: newId } });
  return newId;
}

function deleteModuleAttr(id) {
  const prev = getDB().prepare(`SELECT * FROM module_attribute WHERE id=?`).get(id);
  const r = getDB().prepare(`DELETE FROM module_attribute WHERE id=?`).run(id);
  if (prev) versions.recordVersion(prev.module_ref, 'attrDel', prev.attr_name,
    { op: 'moduleAttr', args: { moduleId: prev.module_ref, attrId: null, name: prev.attr_name, value: prev.attr_value } });
  return r;
}

function getModuleUi(moduleId) {
  const rows = getDB().prepare(`SELECT ui_key, ui_value FROM module_ui WHERE module_ref=?`).all(moduleId);
  return rows.reduce((m, r) => (m[r.ui_key] = r.ui_value, m), {});
}

const setModuleUi = (moduleId, key, value) => getDB().prepare(`
  INSERT INTO module_ui (module_ref, ui_key, ui_value) VALUES (?,?,?)
  ON CONFLICT(module_ref, ui_key) DO UPDATE SET ui_value=excluded.ui_value, update_at=datetime('now')
`).run(moduleId, key, value);

const getModuleTags = (moduleId) => getDB().prepare(`
  SELECT h.*, uc.color_code FROM hashtag h
  LEFT JOIN use_color uc ON h.tag_color = uc.id
  JOIN module_hashtag mh ON h.id = mh.hashtag_id WHERE mh.module_ref=? ORDER BY h.tag_name
`).all(moduleId);

function setModuleTags(moduleId, tags) {
  const d = getDB();
  const prev = d.prepare(`SELECT hashtag_id FROM module_hashtag WHERE module_ref=?`).all(moduleId).map(r => r.hashtag_id);
  versions.recordVersion(moduleId, 'tags', null,
    { op: 'moduleTags', args: { moduleId, tagIds: prev } });
  d.prepare(`DELETE FROM module_hashtag WHERE module_ref=?`).run(moduleId);
  const ins = d.prepare(`INSERT INTO module_hashtag (module_ref, hashtag_id) VALUES (?,?)`);
  for (const t of (tags || [])) ins.run(moduleId, t);
  return true;
}

// Outgoing/backlinks reuse the generic wiki_link index (src/db/wiki.js) keyed
// by `module_<id>` — see resolveWikiName/KEY_LOOKUPS there.
const getModuleLinks = (moduleId) => ({
  outgoing: wiki.getOutgoingLinks(`module_${moduleId}`),
  backlinks: wiki.getBacklinks(`module_${moduleId}`),
});

module.exports = {
  getTree, getModule, createModule, updateModule, updateModuleDescription, deleteModule,
  duplicateModule, moveModule, countModules, nexusOfModule,
  getModuleAttrs, upsertModuleAttr, deleteModuleAttr,
  getModuleUi, setModuleUi,
  getModuleTags, setModuleTags,
  getModuleLinks,
};
