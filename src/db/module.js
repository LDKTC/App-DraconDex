'use strict';
const { getDB } = require('./core');

const SEL = `
  SELECT m.*, c.color_code, ic.color_code AS icon_color_code
  FROM module m
  LEFT JOIN use_color c  ON c.id  = m.color
  LEFT JOIN use_color ic ON ic.id = m.icon_color
`;

// Majors (parent_id NULL) ordered by display_order, each carrying its Minors
// (locked one level, ordered by display_order then id).
function getTree(nexusRef) {
  const rows = getDB().prepare(`${SEL} WHERE m.nexus_ref = ? ORDER BY m.parent_id IS NOT NULL, m.display_order, m.id`).all(nexusRef);
  const minorsByParent = new Map();
  for (const r of rows) {
    if (r.parent_id == null) continue;
    if (!minorsByParent.has(r.parent_id)) minorsByParent.set(r.parent_id, []);
    minorsByParent.get(r.parent_id).push(r);
  }
  return rows.filter(r => r.parent_id == null).map(m => ({ ...m, children: minorsByParent.get(m.id) || [] }));
}

const getModule = (id) => getDB().prepare(`${SEL} WHERE m.id = ?`).get(id);

function createModule(data) {
  const d = getDB();
  const { nexus_ref, parent_id = null, name, kind, icon = null, icon_color = null, color = null } = data;
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(display_order),-1) AS m FROM module WHERE nexus_ref=? AND parent_id IS ?`)
    .get(nexus_ref, parent_id).m;
  return d.prepare(`
    INSERT INTO module (nexus_ref, parent_id, name, kind, icon, icon_color, color, display_order)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(nexus_ref, parent_id, name, kind, icon, icon_color, color, maxOrder + 1).lastInsertRowid;
}

function updateModule(id, data) {
  const cur = getDB().prepare(`SELECT * FROM module WHERE id=?`).get(id);
  if (!cur) return;
  const { name = cur.name, icon = cur.icon, icon_color = cur.icon_color, color = cur.color } = data;
  getDB().prepare(`UPDATE module SET name=?, icon=?, icon_color=?, color=?, update_at=datetime('now') WHERE id=?`)
    .run(name, icon, icon_color, color, id);
}

const deleteModule = (id) => getDB().prepare(`DELETE FROM module WHERE id=?`).run(id);

// Majors only — dragging a Minor is rejected by the renderer before this is
// ever called; Minors keep whatever order they were created in.
function reorderMajors(nexusRef, orderedIds) {
  const d = getDB();
  const tx = d.transaction((ids) => {
    ids.forEach((id, idx) => {
      d.prepare(`UPDATE module SET display_order=? WHERE id=? AND nexus_ref=? AND parent_id IS NULL`).run(idx, id, nexusRef);
    });
  });
  tx(orderedIds);
}

const countModules = (nexusRef) => getDB().prepare(`SELECT COUNT(*) AS c FROM module WHERE nexus_ref=?`).get(nexusRef).c;

module.exports = { getTree, getModule, createModule, updateModule, deleteModule, reorderMajors, countModules };
