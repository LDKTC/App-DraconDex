'use strict';
const { getDB } = require('./core');

const NEXUS_PROJECT_TABLES = ['project', 'world_project', 'game_project', 'write_project'];

const getNexuses = () => getDB().prepare(`
  SELECT n.*, c.color_code,
    (SELECT COUNT(*) FROM project        WHERE nexus_ref = n.id) +
    (SELECT COUNT(*) FROM world_project  WHERE nexus_ref = n.id) +
    (SELECT COUNT(*) FROM game_project   WHERE nexus_ref = n.id) +
    (SELECT COUNT(*) FROM write_project  WHERE nexus_ref = n.id) +
    (SELECT COUNT(*) FROM module WHERE nexus_ref = n.id AND parent_id IS NULL) AS project_count
  FROM nexus n LEFT JOIN use_color c ON c.id = n.color
  ORDER BY n.name COLLATE NOCASE
`).all();

const getNexus = (id) => getDB().prepare(`
  SELECT n.*, c.color_code FROM nexus n LEFT JOIN use_color c ON c.id = n.color WHERE n.id=?
`).get(id);

const createNexus = (name, memo, colorId) =>
  getDB().prepare(`INSERT INTO nexus (name, memo, color) VALUES (?,?,?)`)
    .run(name, memo || null, colorId || null).lastInsertRowid;

const updateNexus = (id, name, memo, colorId) =>
  getDB().prepare(`UPDATE nexus SET name=?, memo=?, color=?, update_at=datetime('now') WHERE id=?`)
    .run(name, memo || null, colorId || null, id);

// Refuses to delete a vault that still owns projects in any module; the
// renderer surfaces {blocked,count} as a toast instead of cascading data loss.
const deleteNexus = (id) => {
  const d = getDB();
  let count = 0;
  for (const t of NEXUS_PROJECT_TABLES) {
    count += d.prepare(`SELECT COUNT(*) AS c FROM ${t} WHERE nexus_ref=?`).get(id).c;
  }
  count += d.prepare(`SELECT COUNT(*) AS c FROM module WHERE nexus_ref=? AND parent_id IS NULL`).get(id).c;
  if (count > 0) return { blocked: true, count };
  d.prepare(`DELETE FROM nexus WHERE id=?`).run(id);
  return { blocked: false, count: 0 };
};

module.exports = { getNexuses, getNexus, createNexus, updateNexus, deleteNexus };
