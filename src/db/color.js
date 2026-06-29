'use strict';
const { getDB } = require('./core');

const getColors = () => getDB().prepare(`SELECT * FROM use_color ORDER BY id`).all();
const addColor = (code) => getDB().prepare(`INSERT OR IGNORE INTO use_color (color_code) VALUES (?)`).run(code);
const markColorUsed = (id) => getDB().prepare(`UPDATE use_color SET update_at=datetime('now') WHERE id=?`).run(id);
const getRecentColors = () => getDB().prepare(`SELECT * FROM use_color ORDER BY update_at DESC LIMIT 10`).all();
const deleteColor = (id) => {
  const d = getDB();
  const used = d.prepare(`
    SELECT 1 FROM (
      SELECT project_color FROM project WHERE project_color=?
      UNION ALL SELECT folder_color FROM project_folder WHERE folder_color=?
      UNION ALL SELECT color FROM object_category WHERE color=?
      UNION ALL SELECT color FROM object WHERE color=?
      UNION ALL SELECT color FROM timeline WHERE color=?
      UNION ALL SELECT color FROM timeline_event WHERE color=?
      UNION ALL SELECT color FROM relation WHERE color=?
      UNION ALL SELECT tag_color FROM hashtag WHERE tag_color=?
    ) LIMIT 1
  `).get(id, id, id, id, id, id, id, id);
  if (used) return false;
  d.prepare(`DELETE FROM use_color WHERE id=?`).run(id);
  return true;
};

module.exports = { getColors, addColor, markColorUsed, getRecentColors, deleteColor };
