'use strict';
const { getDB } = require('./core');

const getProjectObjects = (pid) =>
  getDB().prepare(`
    SELECT o.id, o.name, oc.category_name, uc.color_code, ucc.color_code AS category_color_code
    FROM object o JOIN object_category oc ON o.category_id=oc.id
    LEFT JOIN use_color uc ON o.color=uc.id LEFT JOIN use_color ucc ON oc.color=ucc.id
    WHERE o.project_id=? ORDER BY oc.category_name,o.name
  `).all(pid);

const getProjectEvents = (pid) =>
  getDB().prepare(`
    SELECT te.id, te.event_name, t.line_name,
      s.day s_day, s.month s_month, s.years s_years,
      uc.color_code, tlc.color_code AS timeline_color_code
    FROM timeline_event te JOIN timeline t ON te.timeline_id=t.id
    LEFT JOIN use_color uc ON te.color=uc.id LEFT JOIN use_color tlc ON t.color=tlc.id
    LEFT JOIN timeline_date s ON te.start_at=s.id
    WHERE t.project_id=? ORDER BY t.line_name,s.years,s.month,s.day
  `).all(pid);

const getRelationTypes = () =>
  getDB().prepare(`SELECT rt.*, uc.color_code FROM relation_type rt LEFT JOIN use_color uc ON rt.color = uc.id ORDER BY rt.relation_name`).all();
const createRelationType = (n, c) =>
  getDB().prepare(`INSERT INTO relation_type (relation_name,color) VALUES (?,?)`).run(n, c || null);
const updateRelationType = (id, n, c) =>
  getDB().prepare(`UPDATE relation_type SET relation_name=?,color=?,update_at=datetime('now') WHERE id=?`).run(n, c || null, id);
const deleteRelationType = (id) =>
  getDB().prepare(`DELETE FROM relation_type WHERE id=?`).run(id);

const getRelationsOBOB = (pid) =>
  getDB().prepare(`
    SELECT ro.id, r.id rel_id, rt.relation_name, rtc.color_code AS color_code, r.relation_type, r.color,
      o1.name from_name, oc1.category_name from_cat, o2.name to_name, oc2.category_name to_cat
    FROM relation_obob ro JOIN relation r ON ro.relation_id=r.id
    LEFT JOIN relation_type rt ON r.relation_type=rt.id
    LEFT JOIN use_color uc ON r.color=uc.id LEFT JOIN use_color rtc ON rt.color=rtc.id
    JOIN object o1 ON ro.object_from=o1.id JOIN object_category oc1 ON o1.category_id=oc1.id
    JOIN object o2 ON ro.object_to=o2.id JOIN object_category oc2 ON o2.category_id=oc2.id
    WHERE r.project_id=? ORDER BY rt.relation_name,o1.name
  `).all(pid);
const createRelationOBOB = (pid, tid, c, from_, to_) => {
  const d = getDB();
  const r = d.prepare(`INSERT INTO relation (project_id,relation_type,color) VALUES (?,?,?)`).run(pid, tid || null, c || null);
  d.prepare(`INSERT INTO relation_obob (relation_id,object_from,object_to) VALUES (?,?,?)`).run(r.lastInsertRowid, from_, to_);
};
const deleteRelationOBOB = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT relation_id FROM relation_obob WHERE id=?`).get(id);
  d.prepare(`DELETE FROM relation_obob WHERE id=?`).run(id);
  if (row) d.prepare(`DELETE FROM relation WHERE id=?`).run(row.relation_id);
};

const getRelationsOBTL = (pid) =>
  getDB().prepare(`
    SELECT ro.id, r.id rel_id, rt.relation_name, rtc.color_code AS color_code, r.relation_type, r.color,
      o.name from_name, oc.category_name from_cat, te.event_name to_name, t.line_name to_tl,
      s.day s_day, s.month s_month, s.years s_years
    FROM relation_obtl ro JOIN relation r ON ro.relation_id=r.id
    LEFT JOIN relation_type rt ON r.relation_type=rt.id
    LEFT JOIN use_color uc ON r.color=uc.id LEFT JOIN use_color rtc ON rt.color=rtc.id
    JOIN object o ON ro.object_from=o.id JOIN object_category oc ON o.category_id=oc.id
    JOIN timeline_event te ON ro.timeline_to=te.id JOIN timeline t ON te.timeline_id=t.id
    LEFT JOIN timeline_date s ON te.start_at=s.id
    WHERE r.project_id=? ORDER BY rt.relation_name,o.name
  `).all(pid);
const createRelationOBTL = (pid, tid, c, from_, to_) => {
  const d = getDB();
  const r = d.prepare(`INSERT INTO relation (project_id,relation_type,color) VALUES (?,?,?)`).run(pid, tid || null, c || null);
  d.prepare(`INSERT INTO relation_obtl (relation_id,object_from,timeline_to) VALUES (?,?,?)`).run(r.lastInsertRowid, from_, to_);
};
const deleteRelationOBTL = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT relation_id FROM relation_obtl WHERE id=?`).get(id);
  d.prepare(`DELETE FROM relation_obtl WHERE id=?`).run(id);
  if (row) d.prepare(`DELETE FROM relation WHERE id=?`).run(row.relation_id);
};

const getRelationsTLTL = (pid) =>
  getDB().prepare(`
    SELECT ro.id, r.id rel_id, rt.relation_name, rtc.color_code AS color_code, r.relation_type, r.color,
      te1.event_name from_name, t1.line_name from_tl, te2.event_name to_name, t2.line_name to_tl
    FROM relation_tltl ro JOIN relation r ON ro.relation_id=r.id
    LEFT JOIN relation_type rt ON r.relation_type=rt.id
    LEFT JOIN use_color uc ON r.color=uc.id LEFT JOIN use_color rtc ON rt.color=rtc.id
    JOIN timeline_event te1 ON ro.timeline_from=te1.id JOIN timeline t1 ON te1.timeline_id=t1.id
    JOIN timeline_event te2 ON ro.timeline_to=te2.id JOIN timeline t2 ON te2.timeline_id=t2.id
    WHERE r.project_id=? ORDER BY rt.relation_name
  `).all(pid);
const updateRelation = (id, relationType, colorId) =>
  getDB().prepare(`UPDATE relation SET relation_type=?,color=? WHERE id=?`).run(relationType || null, colorId || null, id);
const createRelationTLTL = (pid, tid, c, from_, to_) => {
  const d = getDB();
  const r = d.prepare(`INSERT INTO relation (project_id,relation_type,color) VALUES (?,?,?)`).run(pid, tid || null, c || null);
  d.prepare(`INSERT INTO relation_tltl (relation_id,timeline_from,timeline_to) VALUES (?,?,?)`).run(r.lastInsertRowid, from_, to_);
};
const deleteRelationTLTL = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT relation_id FROM relation_tltl WHERE id=?`).get(id);
  d.prepare(`DELETE FROM relation_tltl WHERE id=?`).run(id);
  if (row) d.prepare(`DELETE FROM relation WHERE id=?`).run(row.relation_id);
};

module.exports = {
  getProjectObjects, getProjectEvents,
  getRelationTypes, createRelationType, updateRelationType, deleteRelationType,
  getRelationsOBOB, createRelationOBOB, deleteRelationOBOB,
  getRelationsOBTL, createRelationOBTL, deleteRelationOBTL,
  getRelationsTLTL, updateRelation, createRelationTLTL, deleteRelationTLTL,
};
