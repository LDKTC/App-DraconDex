const { getDB } = require('./core');
const now = () => new Date().toISOString().replace('T',' ').slice(0,19);

// Write Projects
function getWriteProjects(nexusId) {
  return getDB().prepare(`SELECT wp.*, uc.color_code FROM write_project wp LEFT JOIN use_color uc ON uc.id=wp.color WHERE (? IS NULL OR wp.nexus_ref=?) ORDER BY wp.project_name`).all(nexusId ?? null, nexusId ?? null);
}
function getWriteProject(id) {
  return getDB().prepare(`SELECT wp.*, uc.color_code FROM write_project wp LEFT JOIN use_color uc ON uc.id=wp.color WHERE wp.id=?`).get(id);
}
function createWriteProject(name, codename, color, nexusId) {
  return getDB().prepare(`INSERT INTO write_project (project_name,codename,color,nexus_ref,update_at) VALUES (?,?,?,?,?)`).run(name, codename||null, color||null, nexusId||null, now()).lastInsertRowid;
}
function updateWriteProject(id, name, codename, color) {
  getDB().prepare(`UPDATE write_project SET project_name=?,codename=?,color=?,update_at=? WHERE id=?`).run(name, codename||null, color||null, now(), id);
}
function deleteWriteProject(id) {
  getDB().prepare(`DELETE FROM write_project WHERE id=?`).run(id);
}

// Series
function getWriteSeries(projectId) {
  return getDB().prepare(`SELECT ws.*, uc.color_code FROM write_series ws LEFT JOIN use_color uc ON uc.id=ws.color WHERE ws.project_id=? ORDER BY ws.name`).all(projectId);
}
function createWriteSeries(projectId, name, color) {
  return getDB().prepare(`INSERT INTO write_series (project_id,name,color,update_at) VALUES (?,?,?,?)`).run(projectId, name, color||null, now()).lastInsertRowid;
}
function updateWriteSeries(id, name, color) {
  getDB().prepare(`UPDATE write_series SET name=?,color=?,update_at=? WHERE id=?`).run(name, color||null, now(), id);
}
function deleteWriteSeries(id) {
  getDB().prepare(`DELETE FROM write_series WHERE id=?`).run(id);
}

// Books
function getWriteBooks(seriesId) {
  return getDB().prepare(`SELECT wb.*, uc.color_code, (SELECT COUNT(*) FROM write_chapter wc WHERE wc.book_id=wb.id) AS chapter_count FROM write_book wb LEFT JOIN use_color uc ON uc.id=wb.color WHERE wb.series_id=? ORDER BY wb.name`).all(seriesId);
}
function createWriteBook(seriesId, name, color) {
  return getDB().prepare(`INSERT INTO write_book (series_id,name,color,update_at) VALUES (?,?,?,?)`).run(seriesId, name, color||null, now()).lastInsertRowid;
}
function updateWriteBook(id, name, color) {
  getDB().prepare(`UPDATE write_book SET name=?,color=?,update_at=? WHERE id=?`).run(name, color||null, now(), id);
}
function deleteWriteBook(id) {
  getDB().prepare(`DELETE FROM write_book WHERE id=?`).run(id);
}

// Chapters (list omits chapter_content; fetch one for the editor)
function getWriteChapters(bookId) {
  return getDB().prepare(`SELECT wc.id, wc.book_id, wc.name, wc.chapter_order, wc.color, wc.update_at, uc.color_code FROM write_chapter wc LEFT JOIN use_color uc ON uc.id=wc.color WHERE wc.book_id=? ORDER BY wc.chapter_order`).all(bookId);
}
function getWriteChapter(id) {
  return getDB().prepare(`SELECT wc.*, uc.color_code FROM write_chapter wc LEFT JOIN use_color uc ON uc.id=wc.color WHERE wc.id=?`).get(id);
}
function createWriteChapter(bookId, name, color) {
  const db = getDB();
  const next = (db.prepare(`SELECT COALESCE(MAX(chapter_order),0) AS mx FROM write_chapter WHERE book_id=?`).get(bookId)?.mx || 0) + 1;
  return db.prepare(`INSERT INTO write_chapter (book_id,name,chapter_order,color,chapter_content,update_at) VALUES (?,?,?,?,'',?)`).run(bookId, name, next, color||null, now()).lastInsertRowid;
}
function updateWriteChapter(id, name, color) {
  getDB().prepare(`UPDATE write_chapter SET name=?,color=?,update_at=? WHERE id=?`).run(name, color||null, now(), id);
}
function updateWriteChapterContent(id, content) {
  getDB().prepare(`UPDATE write_chapter SET chapter_content=?,update_at=? WHERE id=?`).run(content||'', now(), id);
  const wiki = require('./wiki'); // lazy: avoids module cycle
  wiki.reindexWikiLinks(`wchp_${id}`, content, wiki.nexusOfChapter(id));
}
function moveWriteChapter(id, dir) {
  const db = getDB();
  const cur = db.prepare(`SELECT id, book_id, chapter_order FROM write_chapter WHERE id=?`).get(id);
  if (!cur) return;
  const other = db.prepare(
    dir < 0
      ? `SELECT id, chapter_order FROM write_chapter WHERE book_id=? AND chapter_order<? ORDER BY chapter_order DESC LIMIT 1`
      : `SELECT id, chapter_order FROM write_chapter WHERE book_id=? AND chapter_order>? ORDER BY chapter_order ASC LIMIT 1`
  ).get(cur.book_id, cur.chapter_order);
  if (!other) return;
  // Swap through a temp slot to dodge the UNIQUE(book_id,chapter_order) constraint.
  db.transaction(() => {
    db.prepare(`UPDATE write_chapter SET chapter_order=-1 WHERE id=?`).run(cur.id);
    db.prepare(`UPDATE write_chapter SET chapter_order=? WHERE id=?`).run(cur.chapter_order, other.id);
    db.prepare(`UPDATE write_chapter SET chapter_order=?, update_at=? WHERE id=?`).run(other.chapter_order, now(), cur.id);
  })();
}
function deleteWriteChapter(id) {
  getDB().prepare(`DELETE FROM write_chapter WHERE id=?`).run(id);
}

// Novel link — at most 1 novel per series (UNIQUE(series_id))
function getWriteNovelLink(seriesId) {
  return getDB().prepare(`SELECT wnl.*, p.name AS novel_name, uc.color_code FROM write_novel_link wnl JOIN project p ON p.id=wnl.novel_id LEFT JOIN use_color uc ON uc.id=p.project_color WHERE wnl.series_id=?`).get(seriesId);
}
function setWriteNovelLink(seriesId, novelId) {
  const db = getDB();
  db.prepare(`DELETE FROM write_novel_link WHERE series_id=?`).run(seriesId);
  if (novelId) db.prepare(`INSERT INTO write_novel_link (series_id,novel_id,update_at) VALUES (?,?,?)`).run(seriesId, novelId, now());
}

// Wiki links — one row per (chapter, object); an object_id NULL row marks a
// chapter registered in the wiki before any word has been linked.
function getWriteWikiChapters(seriesId) {
  return getDB().prepare(`
    SELECT wc.id AS chapter_id, wc.name AS chapter_name, wb.name AS book_name,
           COUNT(wwl.id) AS word_count
    FROM write_wiki_link wl
    JOIN write_chapter wc ON wc.id=wl.chapter_id
    JOIN write_book wb ON wb.id=wc.book_id
    LEFT JOIN write_word_link wwl ON wwl.wiki_id=wl.id
    WHERE wb.series_id=?
    GROUP BY wc.id
    ORDER BY wb.name, wc.chapter_order`).all(seriesId);
}
function createWriteWiki(chapterId) {
  const db = getDB();
  const ex = db.prepare(`SELECT 1 FROM write_wiki_link WHERE chapter_id=? LIMIT 1`).get(chapterId);
  if (!ex) db.prepare(`INSERT INTO write_wiki_link (chapter_id,object_id,update_at) VALUES (?,NULL,?)`).run(chapterId, now());
}
function deleteWriteWiki(chapterId) {
  getDB().prepare(`DELETE FROM write_wiki_link WHERE chapter_id=?`).run(chapterId);
}
function ensureWriteWikiLink(chapterId, objectId) {
  const db = getDB();
  const ex = db.prepare(`SELECT id FROM write_wiki_link WHERE chapter_id=? AND object_id=?`).get(chapterId, objectId);
  if (ex) return ex.id;
  return db.prepare(`INSERT INTO write_wiki_link (chapter_id,object_id,update_at) VALUES (?,?,?)`).run(chapterId, objectId, now()).lastInsertRowid;
}
function getWriteWordLinks(chapterId) {
  return getDB().prepare(`
    SELECT wwl.id, wwl.wiki_id, wwl.text_link, wl.object_id,
           o.name AS object_name, oc.category_name, uc.color_code
    FROM write_word_link wwl
    JOIN write_wiki_link wl ON wl.id=wwl.wiki_id
    LEFT JOIN object o ON o.id=wl.object_id
    LEFT JOIN object_category oc ON oc.id=o.category_id
    LEFT JOIN use_color uc ON uc.id=o.color
    WHERE wl.chapter_id=?
    ORDER BY o.name, wwl.text_link`).all(chapterId);
}
function createWriteWordLink(chapterId, objectId, textLink) {
  const db = getDB();
  const wikiId = ensureWriteWikiLink(chapterId, objectId);
  return db.prepare(`INSERT INTO write_word_link (wiki_id,text_link,update_at) VALUES (?,?,?)`).run(wikiId, textLink, now()).lastInsertRowid;
}
function deleteWriteWordLink(id) {
  const db = getDB();
  const row = db.prepare(`SELECT wiki_id FROM write_word_link WHERE id=?`).get(id);
  db.prepare(`DELETE FROM write_word_link WHERE id=?`).run(id);
  // Drop the wiki row when its last word link is gone (NULL-object placeholder rows stay).
  if (row) {
    const left = db.prepare(`SELECT COUNT(*) AS cnt FROM write_word_link WHERE wiki_id=?`).get(row.wiki_id)?.cnt || 0;
    const wiki = db.prepare(`SELECT object_id FROM write_wiki_link WHERE id=?`).get(row.wiki_id);
    if (!left && wiki?.object_id != null) db.prepare(`DELETE FROM write_wiki_link WHERE id=?`).run(row.wiki_id);
  }
}

// Notes
function getWriteNotes(projectId) {
  return getDB().prepare(`SELECT wn.*, uc.color_code, (SELECT COUNT(*) FROM write_chat wc WHERE wc.note_id=wn.id) AS chat_count FROM write_note wn LEFT JOIN use_color uc ON uc.id=wn.color WHERE wn.project_id=? ORDER BY wn.notename`).all(projectId);
}
function createWriteNote(projectId, name, color) {
  return getDB().prepare(`INSERT INTO write_note (project_id,notename,color,update_at) VALUES (?,?,?,?)`).run(projectId, name, color||null, now()).lastInsertRowid;
}
function updateWriteNote(id, name, color) {
  getDB().prepare(`UPDATE write_note SET notename=?,color=?,update_at=? WHERE id=?`).run(name, color||null, now(), id);
}
function deleteWriteNote(id) {
  getDB().prepare(`DELETE FROM write_note WHERE id=?`).run(id);
}

// Chats
function getWriteChats(noteId) {
  return getDB().prepare(`SELECT * FROM write_chat WHERE note_id=? ORDER BY chat_order`).all(noteId);
}
function createWriteChat(noteId, text) {
  const db = getDB();
  const next = (db.prepare(`SELECT COALESCE(MAX(chat_order),0) AS mx FROM write_chat WHERE note_id=?`).get(noteId)?.mx || 0) + 1;
  return db.prepare(`INSERT INTO write_chat (note_id,chat,chat_order,update_at) VALUES (?,?,?,?)`).run(noteId, text, next, now()).lastInsertRowid;
}
function updateWriteChat(id, text) {
  getDB().prepare(`UPDATE write_chat SET chat=?,update_at=? WHERE id=?`).run(text, now(), id);
}
function deleteWriteChat(id) {
  getDB().prepare(`DELETE FROM write_chat WHERE id=?`).run(id);
}

module.exports = {
  getWriteProjects, getWriteProject, createWriteProject, updateWriteProject, deleteWriteProject,
  getWriteSeries, createWriteSeries, updateWriteSeries, deleteWriteSeries,
  getWriteBooks, createWriteBook, updateWriteBook, deleteWriteBook,
  getWriteChapters, getWriteChapter, createWriteChapter, updateWriteChapter,
  updateWriteChapterContent, moveWriteChapter, deleteWriteChapter,
  getWriteNovelLink, setWriteNovelLink,
  getWriteWikiChapters, createWriteWiki, deleteWriteWiki,
  getWriteWordLinks, createWriteWordLink, deleteWriteWordLink,
  getWriteNotes, createWriteNote, updateWriteNote, deleteWriteNote,
  getWriteChats, createWriteChat, updateWriteChat, deleteWriteChat,
};
