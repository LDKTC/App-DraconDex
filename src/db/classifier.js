'use strict';
const { getDB } = require('./core');

// ═══ Category "Classifier" (Phase 5) ══════════════════════════════════
// A 'classifier'-kind module row IS the category; classifier_object rows
// are its members. See core.js's schema comment for why this is a
// parallel schema rather than a reuse of Director's object_category/
// object_template/object/object_attribute.

const setCatType = (moduleId, catType) =>
  getDB().prepare(`UPDATE module SET cat_type=?, update_at=datetime('now') WHERE id=?`).run(catType, moduleId);

// ── Objects ─────────────────────────────────────────────────────────────
const getObjects = (moduleRef) => getDB().prepare(`
  SELECT o.*, uc.color_code FROM classifier_object o
  LEFT JOIN use_color uc ON uc.id = o.color
  WHERE o.module_ref=? ORDER BY o.display_order, o.id
`).all(moduleRef);

const getObject = (id) => getDB().prepare(`
  SELECT o.*, uc.color_code FROM classifier_object o LEFT JOIN use_color uc ON uc.id = o.color WHERE o.id=?
`).get(id);

function createObject(moduleRef, name, colorId) {
  const d = getDB();
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(display_order),-1) AS m FROM classifier_object WHERE module_ref=?`).get(moduleRef).m;
  return d.prepare(`INSERT INTO classifier_object (module_ref, name, color, display_order) VALUES (?,?,?,?)`)
    .run(moduleRef, name, colorId || null, maxOrder + 1).lastInsertRowid;
}

const updateObject = (id, name, colorId) =>
  getDB().prepare(`UPDATE classifier_object SET name=?, color=?, update_at=datetime('now') WHERE id=?`).run(name, colorId || null, id);

const updateObjectNote = (id, note) =>
  getDB().prepare(`UPDATE classifier_object SET note=?, update_at=datetime('now') WHERE id=?`).run(note, id);

const deleteObject = (id) => getDB().prepare(`DELETE FROM classifier_object WHERE id=?`).run(id);

// ── Templates ───────────────────────────────────────────────────────────
// Shared (object_ref NULL) — every object in the category gets these.
const getTemplates = (moduleRef) => getDB().prepare(`
  SELECT * FROM classifier_template WHERE module_ref=? AND object_ref IS NULL ORDER BY display_order, id
`).all(moduleRef);

// Shared + this object's own private template (Character type only).
const getObjectTemplates = (moduleRef, objectRef) => getDB().prepare(`
  SELECT * FROM classifier_template WHERE module_ref=? AND (object_ref IS NULL OR object_ref=?) ORDER BY display_order, id
`).all(moduleRef, objectRef);

function createTemplate(moduleRef, description, attributeType, levelable, hasCondition, objectRef) {
  const d = getDB();
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(display_order),-1) AS m FROM classifier_template WHERE module_ref=?`).get(moduleRef).m;
  return d.prepare(`
    INSERT INTO classifier_template (module_ref, object_ref, description, attribute_type, levelable, has_condition, display_order)
    VALUES (?,?,?,?,?,?,?)
  `).run(moduleRef, objectRef || null, description, attributeType || 'text', levelable ? 1 : 0, hasCondition ? 1 : 0, maxOrder + 1).lastInsertRowid;
}

const updateTemplate = (id, description, attributeType, levelable, hasCondition) =>
  getDB().prepare(`
    UPDATE classifier_template SET description=?, attribute_type=?, levelable=?, has_condition=?, update_at=datetime('now') WHERE id=?
  `).run(description, attributeType || 'text', levelable ? 1 : 0, hasCondition ? 1 : 0, id);

const deleteTemplate = (id) => getDB().prepare(`DELETE FROM classifier_template WHERE id=?`).run(id);

// A Character-type object may hold exactly one private template — enforced
// here (not a DB constraint) since it's cheap and keeps the schema simple.
const countObjectTemplates = (objectRef) =>
  getDB().prepare(`SELECT COUNT(*) AS c FROM classifier_template WHERE object_ref=?`).get(objectRef).c;

// ── Attribute values ───────────────────────────────────────────────────
const getAttrs = (objectId) => getDB().prepare(`
  SELECT ca.*, ct.description, ct.attribute_type, ct.levelable, ct.has_condition, ct.object_ref AS template_object_ref
  FROM classifier_attribute ca JOIN classifier_template ct ON ca.template_ref = ct.id
  WHERE ca.object_ref=?
`).all(objectId);

const upsertAttr = (objectId, templateId, value) => getDB().prepare(`
  INSERT INTO classifier_attribute (object_ref, template_ref, attribute_value) VALUES (?,?,?)
  ON CONFLICT(object_ref, template_ref) DO UPDATE SET attribute_value=excluded.attribute_value, update_at=datetime('now')
`).run(objectId, templateId, value);

module.exports = {
  setCatType,
  getObjects, getObject, createObject, updateObject, updateObjectNote, deleteObject,
  getTemplates, getObjectTemplates, createTemplate, updateTemplate, deleteTemplate, countObjectTemplates,
  getAttrs, upsertAttr,
};
