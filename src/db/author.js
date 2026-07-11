'use strict';
// Book "Author" (progress.md Phase 11) — chapters of a book module.
// Content is markdown with [[wikilinks]], indexed under the bchp_<id> key
// kind on every save (same flow as Writer chapters / Scribe notes).
const { getDB } = require('./core');
const wiki = require('./wiki');

const nexusOfChapter = (id) => getDB().prepare(`
  SELECT m.nexus_ref FROM book_chapter ch JOIN module m ON ch.module_ref = m.id WHERE ch.id = ?
`).get(id)?.nexus_ref ?? null;

// List carries content too — Author's Outline/Reading views need every
// chapter's text and book-sized rows are cheap enough to ship whole.
const getBookChapters = (moduleRef) => getDB().prepare(`
  SELECT * FROM book_chapter WHERE module_ref = ? ORDER BY chapter_order, id
`).all(moduleRef);

const createBookChapter = (moduleRef, name) => {
  const d = getDB();
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(chapter_order),-1) AS m FROM book_chapter WHERE module_ref=?`).get(moduleRef).m;
  return d.prepare(`INSERT INTO book_chapter (module_ref,name,chapter_order) VALUES (?,?,?)`)
    .run(moduleRef, name, maxOrder + 1).lastInsertRowid;
};

const renameBookChapter = (id, name) => {
  const cur = getDB().prepare(`SELECT name FROM book_chapter WHERE id=?`).get(id);
  const r = getDB().prepare(`UPDATE book_chapter SET name=?, update_at=datetime('now') WHERE id=?`).run(name, id);
  if (cur && cur.name !== name) wiki.renameWikiTarget(`bchp_${id}`, cur.name, name);
  return r;
};

const updateBookChapterContent = (id, content) => {
  const r = getDB().prepare(`UPDATE book_chapter SET chapter_content=?, update_at=datetime('now') WHERE id=?`)
    .run(content, id);
  wiki.reindexWikiLinks(`bchp_${id}`, content, nexusOfChapter(id));
  return r;
};

const deleteBookChapter = (id) =>
  getDB().prepare(`DELETE FROM book_chapter WHERE id=?`).run(id);

module.exports = {
  getBookChapters, createBookChapter, renameBookChapter,
  updateBookChapterContent, deleteBookChapter,
};
