'use strict';
const { getDB } = require('./core');

const getHashtags = () =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id ORDER BY h.tag_name`).all();
const createHashtag = (n, c) =>
  getDB().prepare(`INSERT INTO hashtag (tag_name,tag_color) VALUES (?,?)`).run(n, c || null);
const updateHashtag = (id, n, c) =>
  getDB().prepare(`UPDATE hashtag SET tag_name=?,tag_color=?,update_at=datetime('now') WHERE id=?`).run(n, c || null, id);
const deleteHashtag = (id) =>
  getDB().prepare(`DELETE FROM hashtag WHERE id=?`).run(id);

const getProjectTags = (projectId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN project_hashtag ph ON h.id=ph.hashtag_id WHERE ph.project_id=? ORDER BY h.tag_name`).all(projectId);
const setProjectTags = (projectId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM project_hashtag WHERE project_id=?`).run(projectId);
  const ins = d.prepare(`INSERT INTO project_hashtag (project_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags || [])) ins.run(projectId, t);
  return true;
};
const addProjectTag = (projectId, tagId) =>
  getDB().prepare(`INSERT OR IGNORE INTO project_hashtag (project_id,hashtag_id) VALUES (?,?)`).run(projectId, tagId);
const removeProjectTag = (projectId, tagId) =>
  getDB().prepare(`DELETE FROM project_hashtag WHERE project_id=? AND hashtag_id=?`).run(projectId, tagId);

const getObjectTags = (objectId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN object_hashtag oh ON h.id=oh.hashtag_id WHERE oh.object_id=? ORDER BY h.tag_name`).all(objectId);
const setObjectTags = (objectId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM object_hashtag WHERE object_id=?`).run(objectId);
  const ins = d.prepare(`INSERT INTO object_hashtag (object_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags || [])) ins.run(objectId, t);
  return true;
};
const addObjectTag = (objectId, tagId) =>
  getDB().prepare(`INSERT OR IGNORE INTO object_hashtag (object_id,hashtag_id) VALUES (?,?)`).run(objectId, tagId);
const removeObjectTag = (objectId, tagId) =>
  getDB().prepare(`DELETE FROM object_hashtag WHERE object_id=? AND hashtag_id=?`).run(objectId, tagId);

const getObjectsByHashtag = (tagId, projectId) =>
  getDB().prepare(`
    SELECT o.*, oc.category_name, uc.color_code
    FROM object o JOIN object_hashtag oh ON oh.object_id = o.id
    JOIN object_category oc ON o.category_id = oc.id LEFT JOIN use_color uc ON o.color = uc.id
    WHERE oh.hashtag_id = ? AND o.project_id = ? ORDER BY oc.category_name, o.name
  `).all(tagId, projectId);

const getAllProjectUsedTags = (projectId) =>
  getDB().prepare(`
    SELECT DISTINCT h.id, h.tag_name, h.tag_color, h.update_at, uc.color_code
    FROM hashtag h LEFT JOIN use_color uc ON h.tag_color = uc.id
    WHERE h.id IN (
      SELECT hashtag_id FROM project_hashtag WHERE project_id = ?
      UNION
      SELECT oh.hashtag_id FROM object_hashtag oh JOIN object o ON oh.object_id = o.id WHERE o.project_id = ?
      UNION
      SELECT eh.hashtag_id FROM event_hashtag eh JOIN timeline_event te ON eh.event_id = te.id JOIN timeline tl ON te.timeline_id = tl.id WHERE tl.project_id = ?
    ) ORDER BY h.tag_name
  `).all(projectId, projectId, projectId);

module.exports = {
  getHashtags, createHashtag, updateHashtag, deleteHashtag,
  getProjectTags, setProjectTags, addProjectTag, removeProjectTag,
  getObjectTags, setObjectTags, addObjectTag, removeObjectTag,
  getObjectsByHashtag, getAllProjectUsedTags,
};
