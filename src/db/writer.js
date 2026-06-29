const { getDB } = require('./core');
const now = () => new Date().toISOString().replace('T',' ').slice(0,19);

// Library Projects
function getLibraryProjects() {
  return getDB().prepare(`SELECT lp.*, uc.color_code FROM library_project lp LEFT JOIN use_color uc ON uc.id=lp.color_ref ORDER BY lp.name`).all();
}
function createLibraryProject(name, memo, colorRef) {
  return getDB().prepare(`INSERT INTO library_project (name,memo,color_ref,updated_at) VALUES (?,?,?,?)`).run(name, memo||null, colorRef||null, now()).lastInsertRowid;
}
function updateLibraryProject(id, name, memo, colorRef) {
  getDB().prepare(`UPDATE library_project SET name=?,memo=?,color_ref=?,updated_at=? WHERE id=?`).run(name, memo||null, colorRef||null, now(), id);
}
function deleteLibraryProject(id) {
  getDB().prepare(`DELETE FROM library_project WHERE id=?`).run(id);
}

// Library Descriptions
function getLibraryDescriptions(libraryId) {
  return getDB().prepare(`SELECT * FROM library_description WHERE library_ref=? ORDER BY id`).all(libraryId);
}
function createLibraryDescription(libraryId, title, content) {
  return getDB().prepare(`INSERT INTO library_description (library_ref,title,content,updated_at) VALUES (?,?,?,?)`).run(libraryId, title||null, content||null, now()).lastInsertRowid;
}
function updateLibraryDescription(id, title, content) {
  getDB().prepare(`UPDATE library_description SET title=?,content=?,updated_at=? WHERE id=?`).run(title||null, content||null, now(), id);
}
function deleteLibraryDescription(id) {
  getDB().prepare(`DELETE FROM library_description WHERE id=?`).run(id);
}

// World Links
function getLibraryWorldLinks(libraryId) {
  return getDB().prepare(`SELECT lwl.*, wp.name AS world_name, uc.color_code FROM library_world_link lwl JOIN world_project wp ON wp.id=lwl.world_ref LEFT JOIN use_color uc ON uc.id=wp.color_ref WHERE lwl.library_ref=? ORDER BY wp.name`).all(libraryId);
}
function addLibraryWorldLink(libraryId, worldId) {
  try { getDB().prepare(`INSERT OR IGNORE INTO library_world_link (library_ref,world_ref,updated_at) VALUES (?,?,?)`).run(libraryId, worldId, now()); } catch (_) {}
}
function removeLibraryWorldLink(id) {
  getDB().prepare(`DELETE FROM library_world_link WHERE id=?`).run(id);
}

// Series
function getLibrarySeries(libraryId) {
  return getDB().prepare(`SELECT * FROM library_series WHERE library_ref=? ORDER BY name`).all(libraryId);
}
function createLibrarySeries(libraryId, name, memo) {
  return getDB().prepare(`INSERT INTO library_series (library_ref,name,memo,updated_at) VALUES (?,?,?,?)`).run(libraryId, name, memo||null, now()).lastInsertRowid;
}
function updateLibrarySeries(id, name, memo) {
  getDB().prepare(`UPDATE library_series SET name=?,memo=?,updated_at=? WHERE id=?`).run(name, memo||null, now(), id);
}
function deleteLibrarySeries(id) {
  getDB().prepare(`DELETE FROM library_series WHERE id=?`).run(id);
}

// Series Descriptions
function getSeriesDescriptions(seriesId) {
  return getDB().prepare(`SELECT * FROM series_description WHERE series_ref=? ORDER BY id`).all(seriesId);
}
function createSeriesDescription(seriesId, title, content) {
  return getDB().prepare(`INSERT INTO series_description (series_ref,title,content,updated_at) VALUES (?,?,?,?)`).run(seriesId, title||null, content||null, now()).lastInsertRowid;
}
function updateSeriesDescription(id, title, content) {
  getDB().prepare(`UPDATE series_description SET title=?,content=?,updated_at=? WHERE id=?`).run(title||null, content||null, now(), id);
}
function deleteSeriesDescription(id) {
  getDB().prepare(`DELETE FROM series_description WHERE id=?`).run(id);
}

// Series Novel Links
function getSeriesNovelLinks(seriesId) {
  return getDB().prepare(`SELECT snl.*, p.name AS project_name, uc.color_code FROM series_novel_link snl JOIN project p ON p.id=snl.project_ref LEFT JOIN use_color uc ON uc.id=p.color WHERE snl.series_ref=? ORDER BY p.name`).all(seriesId);
}
function addSeriesNovelLink(seriesId, projectId) {
  try { getDB().prepare(`INSERT OR IGNORE INTO series_novel_link (series_ref,project_ref,updated_at) VALUES (?,?,?)`).run(seriesId, projectId, now()); } catch (_) {}
}
function removeSeriesNovelLink(id) {
  getDB().prepare(`DELETE FROM series_novel_link WHERE id=?`).run(id);
}

// Series Char Links
function getSeriesCharLinks(seriesId) {
  return getDB().prepare(`SELECT scl.id, scl.object_ref, o.name AS object_name, oc.category_name, p.name AS project_name FROM series_char_link scl JOIN object o ON o.id=scl.object_ref JOIN object_category oc ON oc.id=o.category_id JOIN project p ON p.id=o.project_id WHERE scl.series_ref=? ORDER BY p.name, o.name`).all(seriesId);
}
function addSeriesCharLink(seriesId, objectId) {
  try { getDB().prepare(`INSERT OR IGNORE INTO series_char_link (series_ref,object_ref) VALUES (?,?)`).run(seriesId, objectId); } catch (_) {}
}
function removeSeriesCharLink(id) {
  getDB().prepare(`DELETE FROM series_char_link WHERE id=?`).run(id);
}

// Series Object Links
function getSeriesObjectLinks(seriesId) {
  return getDB().prepare(`SELECT sol.id, sol.object_ref, o.name AS object_name, oc.category_name, p.name AS project_name FROM series_object_link sol JOIN object o ON o.id=sol.object_ref JOIN object_category oc ON oc.id=o.category_id JOIN project p ON p.id=o.project_id WHERE sol.series_ref=? ORDER BY p.name, o.name`).all(seriesId);
}
function addSeriesObjectLink(seriesId, objectId) {
  try { getDB().prepare(`INSERT OR IGNORE INTO series_object_link (series_ref,object_ref) VALUES (?,?)`).run(seriesId, objectId); } catch (_) {}
}
function removeSeriesObjectLink(id) {
  getDB().prepare(`DELETE FROM series_object_link WHERE id=?`).run(id);
}

// Series Hashtags
function getSeriesHashtags(seriesId) {
  return getDB().prepare(`SELECT h.id, h.tag_name FROM series_hashtag sh JOIN hashtag h ON h.id=sh.hashtag_id WHERE sh.series_ref=?`).all(seriesId);
}
function toggleSeriesHashtag(seriesId, hashtagId) {
  const db = getDB();
  const ex = db.prepare(`SELECT 1 FROM series_hashtag WHERE series_ref=? AND hashtag_id=?`).get(seriesId, hashtagId);
  if (ex) db.prepare(`DELETE FROM series_hashtag WHERE series_ref=? AND hashtag_id=?`).run(seriesId, hashtagId);
  else db.prepare(`INSERT INTO series_hashtag (series_ref,hashtag_id) VALUES (?,?)`).run(seriesId, hashtagId);
}

// Documents
function getSeriesDocuments(seriesId) {
  return getDB().prepare(`SELECT id, series_ref, name, updated_at FROM library_document WHERE series_ref=? ORDER BY name`).all(seriesId);
}
function createDocument(seriesId, name) {
  return getDB().prepare(`INSERT INTO library_document (series_ref,name,content_json,updated_at) VALUES (?,?,'[]',?)`).run(seriesId, name, now()).lastInsertRowid;
}
function getDocument(id) {
  return getDB().prepare(`SELECT * FROM library_document WHERE id=?`).get(id);
}
function updateDocument(id, name, contentJson) {
  getDB().prepare(`UPDATE library_document SET name=?,content_json=?,updated_at=? WHERE id=?`).run(name, contentJson, now(), id);
}
function deleteDocument(id) {
  getDB().prepare(`DELETE FROM library_document WHERE id=?`).run(id);
}

// Document Hashtags
function getDocumentHashtags(docId) {
  return getDB().prepare(`SELECT h.id, h.tag_name FROM document_hashtag dh JOIN hashtag h ON h.id=dh.hashtag_id WHERE dh.document_ref=?`).all(docId);
}
function toggleDocumentHashtag(docId, hashtagId) {
  const db = getDB();
  const ex = db.prepare(`SELECT 1 FROM document_hashtag WHERE document_ref=? AND hashtag_id=?`).get(docId, hashtagId);
  if (ex) db.prepare(`DELETE FROM document_hashtag WHERE document_ref=? AND hashtag_id=?`).run(docId, hashtagId);
  else db.prepare(`INSERT INTO document_hashtag (document_ref,hashtag_id) VALUES (?,?)`).run(docId, hashtagId);
}

module.exports = {
  getLibraryProjects, createLibraryProject, updateLibraryProject, deleteLibraryProject,
  getLibraryDescriptions, createLibraryDescription, updateLibraryDescription, deleteLibraryDescription,
  getLibraryWorldLinks, addLibraryWorldLink, removeLibraryWorldLink,
  getLibrarySeries, createLibrarySeries, updateLibrarySeries, deleteLibrarySeries,
  getSeriesDescriptions, createSeriesDescription, updateSeriesDescription, deleteSeriesDescription,
  getSeriesNovelLinks, addSeriesNovelLink, removeSeriesNovelLink,
  getSeriesCharLinks, addSeriesCharLink, removeSeriesCharLink,
  getSeriesObjectLinks, addSeriesObjectLink, removeSeriesObjectLink,
  getSeriesHashtags, toggleSeriesHashtag,
  getSeriesDocuments, createDocument, getDocument, updateDocument, deleteDocument,
  getDocumentHashtags, toggleDocumentHashtag,
};
