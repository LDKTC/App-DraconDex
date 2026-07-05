'use strict';
const { getDB } = require('./core');

// ── Folder ──────────────────────────────────────────
const getFolders = () =>
  getDB().prepare(`SELECT pf.*, uc.color_code FROM project_folder pf LEFT JOIN use_color uc ON pf.folder_color = uc.id ORDER BY pf.name`).all();
const createFolder = (name, memo, colorId) =>
  getDB().prepare(`INSERT INTO project_folder (name, folder_memo, folder_color) VALUES (?,?,?)`).run(name, memo, colorId || null);
const updateFolder = (id, name, memo, colorId) =>
  getDB().prepare(`UPDATE project_folder SET name=?,folder_memo=?,folder_color=?,update_at=datetime('now') WHERE id=?`).run(name, memo, colorId || null, id);
const deleteFolder = (id) =>
  getDB().prepare(`DELETE FROM project_folder WHERE id=?`).run(id);

// ── Project ─────────────────────────────────────────
const getProjects = (folderId, nexusId) => {
  const base = `SELECT p.*, uc.color_code FROM project p LEFT JOIN use_color uc ON p.project_color = uc.id`;
  if (folderId) {
    return getDB().prepare(`${base} WHERE p.folder_id=? AND (? IS NULL OR p.nexus_ref=?) ORDER BY p.name`)
      .all(folderId, nexusId ?? null, nexusId ?? null);
  }
  return getDB().prepare(`${base} WHERE (? IS NULL OR p.nexus_ref=?) ORDER BY p.name`)
    .all(nexusId ?? null, nexusId ?? null);
};
const getProject = (id) =>
  getDB().prepare(`SELECT p.*, uc.color_code FROM project p LEFT JOIN use_color uc ON p.project_color = uc.id WHERE p.id=?`).get(id);
const createProject = (data) =>
  getDB().prepare(`INSERT INTO project (codename,name,project_memo,folder_id,project_color,nexus_ref) VALUES (?,?,?,?,?,?)`)
    .run(data.codename || null, data.name, data.memo || null, data.folderId || null, data.colorId || null, data.nexusId || null);
const updateProject = (id, data) =>
  getDB().prepare(`UPDATE project SET codename=?,name=?,project_memo=?,folder_id=?,project_color=?,update_at=datetime('now') WHERE id=?`)
    .run(data.codename || null, data.name, data.memo || null, data.folderId || null, data.colorId || null, id);
const deleteProject = (id) =>
  getDB().prepare(`DELETE FROM project WHERE id=?`).run(id);

// ── Project Description ──────────────────────────────
const getProjectDesc = (projectId) =>
  getDB().prepare(`SELECT * FROM project_description WHERE project_id=? ORDER BY id`).all(projectId);
const addProjectDesc = (projectId, name, text) =>
  getDB().prepare(`INSERT INTO project_description (project_id,attribute_name,attribute_text) VALUES (?,?,?)`).run(projectId, name, text);
const updateProjectDesc = (id, name, text) =>
  getDB().prepare(`UPDATE project_description SET attribute_name=?,attribute_text=?,update_at=datetime('now') WHERE id=?`).run(name, text, id);
const deleteProjectDesc = (id) =>
  getDB().prepare(`DELETE FROM project_description WHERE id=?`).run(id);

// ── Category ─────────────────────────────────────────
const getCategories = (projectId) =>
  getDB().prepare(`SELECT oc.*, uc.color_code FROM object_category oc LEFT JOIN use_color uc ON oc.color = uc.id WHERE oc.project_id=? ORDER BY oc.category_name`).all(projectId);
const createCategory = (projectId, name, colorId) =>
  getDB().prepare(`INSERT INTO object_category (category_name,project_id,color) VALUES (?,?,?)`).run(name, projectId, colorId || null);
const updateCategory = (id, name, colorId) =>
  getDB().prepare(`UPDATE object_category SET category_name=?,color=?,update_at=datetime('now') WHERE id=?`).run(name, colorId || null, id);
const deleteCategory = (id) => {
  const d = getDB();
  const tx = d.transaction((categoryId) => {
    d.prepare(`
      DELETE FROM relation WHERE id IN (
        SELECT ro.relation_id FROM relation_obob ro JOIN object o1 ON ro.object_from = o1.id WHERE o1.category_id = ?
        UNION
        SELECT ro.relation_id FROM relation_obob ro JOIN object o2 ON ro.object_to = o2.id WHERE o2.category_id = ?
        UNION
        SELECT rt.relation_id FROM relation_obtl rt JOIN object o ON rt.object_from = o.id WHERE o.category_id = ?
      )
    `).run(categoryId, categoryId, categoryId);
    return d.prepare(`DELETE FROM object_category WHERE id=?`).run(categoryId);
  });
  return tx(id);
};

// ── Template (Fields) ────────────────────────────────
const getTemplates = (categoryId) =>
  getDB().prepare(`SELECT * FROM object_template WHERE category_id=? ORDER BY display_order, id`).all(categoryId);
const createTemplate = (categoryId, description, type) =>
  getDB().prepare(`INSERT INTO object_template (category_id,description,attribute_type) VALUES (?,?,?)`).run(categoryId, description, type || 'text');
const updateTemplate = (id, description, type) =>
  getDB().prepare(`UPDATE object_template SET description=?,attribute_type=?,update_at=datetime('now') WHERE id=?`).run(description, type, id);
const deleteTemplate = (id) =>
  getDB().prepare(`DELETE FROM object_template WHERE id=?`).run(id);

// ── Object ───────────────────────────────────────────
const getObjects = (categoryId) =>
  getDB().prepare(`SELECT o.*, uc.color_code FROM object o LEFT JOIN use_color uc ON o.color = uc.id WHERE o.category_id=? ORDER BY o.name`).all(categoryId);
const getObject = (id) =>
  getDB().prepare(`SELECT o.*, uc.color_code FROM object o LEFT JOIN use_color uc ON o.color = uc.id WHERE o.id=?`).get(id);
const createObject = (projectId, categoryId, name, colorId) =>
  getDB().prepare(`INSERT INTO object (name,project_id,category_id,color) VALUES (?,?,?,?)`).run(name, projectId, categoryId, colorId || null);
const updateObject = (id, name, colorId) =>
  getDB().prepare(`UPDATE object SET name=?,color=?,update_at=datetime('now') WHERE id=?`).run(name, colorId || null, id);
const updateObjectNote = (id, note) =>
  getDB().prepare(`UPDATE object SET note=?,update_at=datetime('now') WHERE id=?`).run(note, id);
const deleteObject = (id) => {
  const d = getDB();
  const tx = d.transaction((objectId) => {
    d.prepare(`
      DELETE FROM relation WHERE id IN (
        SELECT relation_id FROM relation_obob WHERE object_from = ? OR object_to = ?
        UNION
        SELECT relation_id FROM relation_obtl WHERE object_from = ?
      )
    `).run(objectId, objectId, objectId);
    return d.prepare(`DELETE FROM object WHERE id=?`).run(objectId);
  });
  return tx(id);
};

// ── Attributes ───────────────────────────────────────
const getObjectAttrs = (objectId) =>
  getDB().prepare(`
    SELECT ot.id, ot.description, ot.attribute_type, oa.attribute_value
    FROM object_template ot
    LEFT JOIN object_attribute oa ON oa.template_id = ot.id AND oa.object_id = ?
    WHERE ot.category_id = (SELECT category_id FROM object WHERE id = ?)
    ORDER BY ot.display_order, ot.id
  `).all(objectId, objectId);
const getCategoryAttrs = (categoryId) =>
  getDB().prepare(`
    SELECT oa.object_id, oa.template_id, oa.attribute_value
    FROM object_attribute oa JOIN object o ON oa.object_id = o.id WHERE o.category_id = ?
  `).all(categoryId);
const upsertAttr = (objectId, templateId, value) =>
  getDB().prepare(`
    INSERT INTO object_attribute (object_id, template_id, attribute_value) VALUES (?,?,?)
    ON CONFLICT(object_id, template_id) DO UPDATE SET attribute_value=excluded.attribute_value, update_at=datetime('now')
  `).run(objectId, templateId, value);

// ── Search ───────────────────────────────────────────
const searchAll = (query, nexusId) => {
  const d = getDB();
  const qStr = `%${query}%`;
  const nx = nexusId ?? null;
  const projects = d.prepare(`SELECT p.*, uc.color_code FROM project p LEFT JOIN use_color uc ON p.project_color = uc.id WHERE (p.name LIKE ? OR p.codename LIKE ?) AND (? IS NULL OR p.nexus_ref=?) ORDER BY p.name`).all(qStr, qStr, nx, nx);
  const objects = d.prepare(`
    SELECT DISTINCT o.*, uc.color_code, oc.category_name, p.name AS project_name
    FROM object o JOIN object_category oc ON o.category_id = oc.id JOIN project p ON o.project_id = p.id
    LEFT JOIN use_color uc ON o.color = uc.id
    LEFT JOIN object_hashtag oh ON oh.object_id = o.id LEFT JOIN hashtag h ON h.id = oh.hashtag_id
    WHERE (o.name LIKE ? OR h.tag_name LIKE ?) AND (? IS NULL OR p.nexus_ref=?) ORDER BY o.name
  `).all(qStr, qStr, nx, nx);
  const hashtags = d.prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color = uc.id WHERE h.tag_name LIKE ? ORDER BY h.tag_name`).all(qStr);
  return { projects, objects, hashtags };
};

module.exports = {
  getFolders, createFolder, updateFolder, deleteFolder,
  getProjects, getProject, createProject, updateProject, deleteProject,
  getProjectDesc, addProjectDesc, updateProjectDesc, deleteProjectDesc,
  getCategories, createCategory, updateCategory, deleteCategory,
  getTemplates, createTemplate, updateTemplate, deleteTemplate,
  getObjects, getObject, createObject, updateObject, updateObjectNote, deleteObject,
  getObjectAttrs, getCategoryAttrs, upsertAttr,
  searchAll,
};
