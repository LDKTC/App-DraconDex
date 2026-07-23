'use strict';
const { getDB } = require('./core');
const wiki = require('./wiki');
const versions = require('./versions');

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

// Objects are wikilink targets/sources under the cobj_<id> key kind
// (added in Phase 14 — [[Name]] typed before this resolved to nothing).
const nexusOfObjectRow = (id) => getDB().prepare(`
  SELECT m.nexus_ref FROM classifier_object o JOIN module m ON o.module_ref=m.id WHERE o.id=?
`).get(id)?.nexus_ref ?? null;

function createObject(moduleRef, name, colorId, icon) {
  const d = getDB();
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(display_order),-1) AS m FROM classifier_object WHERE module_ref=?`).get(moduleRef).m;
  const id = d.prepare(`INSERT INTO classifier_object (module_ref, name, color, icon, display_order) VALUES (?,?,?,?,?)`)
    .run(moduleRef, name, colorId || null, icon || null, maxOrder + 1).lastInsertRowid;
  wiki.resolveDanglingLinks(name, nexusOfObjectRow(id));
  versions.recordVersion(moduleRef, 'object', `+ ${name}`,
    { op: 'classifierObjectDelete', args: { objectId: id } });
  return id;
}

const updateObject = (id, name, colorId, icon) => {
  const cur = getDB().prepare(`SELECT name, color, icon, module_ref FROM classifier_object WHERE id=?`).get(id);
  const r = getDB().prepare(`UPDATE classifier_object SET name=?, color=?, icon=?, update_at=datetime('now') WHERE id=?`).run(name, colorId || null, icon || null, id);
  if (cur && cur.name !== name) wiki.renameWikiTarget(`cobj_${id}`, cur.name, name);
  if (cur && (cur.name !== name || (cur.color || null) !== (colorId || null) || (cur.icon || null) !== (icon || null))) {
    versions.recordVersion(cur.module_ref, 'objectEdit', `${cur.name}${cur.name !== name ? ` → ${name}` : ''}`,
      { op: 'classifierObject', args: { objectId: id, name: cur.name, colorId: cur.color, icon: cur.icon } });
  }
  return r;
};

const updateObjectNote = (id, note) => {
  const r = getDB().prepare(`UPDATE classifier_object SET note=?, update_at=datetime('now') WHERE id=?`).run(note, id);
  wiki.reindexWikiLinks(`cobj_${id}`, note, nexusOfObjectRow(id));
  return r;
};

const deleteObject = (id) => {
  const prev = getDB().prepare(`SELECT * FROM classifier_object WHERE id=?`).get(id);
  const r = getDB().prepare(`DELETE FROM classifier_object WHERE id=?`).run(id);
  getDB().prepare(`DELETE FROM wiki_link WHERE src_key=?`).run(`cobj_${id}`);
  if (prev) versions.recordVersion(prev.module_ref, 'objectDel', prev.name,
    { op: 'classifierObjectInsert', args: { moduleRef: prev.module_ref, name: prev.name, colorId: prev.color, icon: prev.icon, note: prev.note } });
  return r;
};

// ── Templates ───────────────────────────────────────────────────────────
// Shared (object_ref NULL) — every object in the category gets these.
const getTemplates = (moduleRef) => getDB().prepare(`
  SELECT * FROM classifier_template WHERE module_ref=? AND object_ref IS NULL ORDER BY display_order, id
`).all(moduleRef);

// Shared + this object's own private template (Character type only).
const getObjectTemplates = (moduleRef, objectRef) => getDB().prepare(`
  SELECT * FROM classifier_template WHERE module_ref=? AND (object_ref IS NULL OR object_ref=?) ORDER BY display_order, id
`).all(moduleRef, objectRef);

function createTemplate(moduleRef, description, attributeType, levelable, hasCondition, objectRef, levelSteps) {
  const d = getDB();
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(display_order),-1) AS m FROM classifier_template WHERE module_ref=?`).get(moduleRef).m;
  return d.prepare(`
    INSERT INTO classifier_template (module_ref, object_ref, description, attribute_type, levelable, has_condition, level_steps, display_order)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(moduleRef, objectRef || null, description, attributeType || 'text', levelable ? 1 : 0, hasCondition ? 1 : 0, levelSteps || null, maxOrder + 1).lastInsertRowid;
}

const updateTemplate = (id, description, attributeType, levelable, hasCondition, levelSteps) => {
  const prev = getDB().prepare(`SELECT * FROM classifier_template WHERE id=?`).get(id);
  const r = getDB().prepare(`
    UPDATE classifier_template SET description=?, attribute_type=?, levelable=?, has_condition=?, level_steps=?, update_at=datetime('now') WHERE id=?
  `).run(description, attributeType || 'text', levelable ? 1 : 0, hasCondition ? 1 : 0, levelSteps || null, id);
  if (prev) versions.recordVersion(prev.module_ref, 'template', `${prev.description} → ${description}`,
    { op: 'classifierTemplate', args: { templateId: id, description: prev.description, attributeType: prev.attribute_type, levelable: prev.levelable, hasCondition: prev.has_condition, levelSteps: prev.level_steps } });
  return r;
};

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

const upsertAttr = (objectId, templateId, value) => {
  const d = getDB();
  const obj = d.prepare(`SELECT name, module_ref FROM classifier_object WHERE id=?`).get(objectId);
  const tpl = d.prepare(`SELECT description FROM classifier_template WHERE id=?`).get(templateId);
  const prev = d.prepare(`SELECT attribute_value FROM classifier_attribute WHERE object_ref=? AND template_ref=?`).get(objectId, templateId);
  const r = d.prepare(`
    INSERT INTO classifier_attribute (object_ref, template_ref, attribute_value) VALUES (?,?,?)
    ON CONFLICT(object_ref, template_ref) DO UPDATE SET attribute_value=excluded.attribute_value, update_at=datetime('now')
  `).run(objectId, templateId, value);
  if (obj && (prev?.attribute_value ?? '') !== (value ?? '')) {
    versions.recordVersion(obj.module_ref, 'attr',
      `${obj.name} · ${tpl?.description ?? ''}: ${prev?.attribute_value ?? '—'} → ${value ?? ''}`,
      { op: 'classifierAttr', args: { objectId, templateId, value: prev?.attribute_value ?? '' } });
  }
  return r;
};

// Condition is metadata about an attribute's value, not the value itself —
// kept in its own column/upsert so every existing attribute_value consumer
// (Table view, saveClassifierAttrCell) stays untouched.
const upsertAttrCondition = (objectId, templateId, value) => getDB().prepare(`
  INSERT INTO classifier_attribute (object_ref, template_ref, condition_value) VALUES (?,?,?)
  ON CONFLICT(object_ref, template_ref) DO UPDATE SET condition_value=excluded.condition_value, update_at=datetime('now')
`).run(objectId, templateId, value);

module.exports = {
  setCatType,
  getObjects, getObject, createObject, updateObject, updateObjectNote, deleteObject,
  getTemplates, getObjectTemplates, createTemplate, updateTemplate, deleteTemplate, countObjectTemplates,
  getAttrs, upsertAttr, upsertAttrCondition,
};
