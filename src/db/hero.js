'use strict';
const { getDB } = require('./core');

// ═══ Game project ═══
const getGames = () =>
  getDB().prepare(`SELECT g.*, uc.color_code FROM game_project g LEFT JOIN use_color uc ON g.color_ref=uc.id ORDER BY g.name`).all();

const getGame = (id) =>
  getDB().prepare(`SELECT g.*, uc.color_code FROM game_project g LEFT JOIN use_color uc ON g.color_ref=uc.id WHERE g.id=?`).get(id);

const createGame = (name, codename, memo, colorRef) =>
  getDB().prepare(`INSERT INTO game_project (name,codename,memo,color_ref) VALUES (?,?,?,?)`).run(name, codename||null, memo||null, colorRef||null);

const updateGame = (id, name, codename, memo, colorRef) =>
  getDB().prepare(`UPDATE game_project SET name=?,codename=?,memo=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, codename||null, memo||null, colorRef||null, id);

const deleteGame = (id) =>
  getDB().prepare(`DELETE FROM game_project WHERE id=?`).run(id);

// ═══ Novel link (1:1 per game, a novel joins at most one game) ═══
const getGameNovelLink = (gameId) =>
  getDB().prepare(`SELECT gnl.*, p.name as project_name FROM game_novel_link gnl JOIN project p ON gnl.project_ref=p.id WHERE gnl.game_ref=?`).get(gameId);

const setGameNovelLink = (gameId, projectId) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_novel_link WHERE game_ref=?`).run(gameId);
  if (projectId) d.prepare(`INSERT INTO game_novel_link (game_ref,project_ref) VALUES (?,?)`).run(gameId, projectId);
  return true;
};

// ═══ Game categories (novel categories pulled into the game) ═══
const getGameCategories = (gameId) =>
  getDB().prepare(`
    SELECT gc.id, gc.category_ref, oc.category_name,
           (SELECT COUNT(*) FROM game_cat_object gco WHERE gco.gamecat_ref=gc.id) AS object_count
    FROM game_category gc JOIN object_category oc ON oc.id=gc.category_ref
    WHERE gc.game_ref=? ORDER BY oc.category_name
  `).all(gameId);

const addGameCategory = (gameId, categoryId) => {
  getDB().prepare(`INSERT OR IGNORE INTO game_category (game_ref,category_ref) VALUES (?,?)`).run(gameId, categoryId);
  return getDB().prepare(`SELECT * FROM game_category WHERE game_ref=? AND category_ref=?`).get(gameId, categoryId);
};

const removeGameCategory = (gameId, categoryId) =>
  getDB().prepare(`DELETE FROM game_category WHERE game_ref=? AND category_ref=?`).run(gameId, categoryId);

// ═══ Imported objects (game_cat_object) ═══
const addGameCatObject = (gameId, categoryId, objectId) => {
  const gc = addGameCategory(gameId, categoryId);
  return getDB().prepare(`INSERT OR IGNORE INTO game_cat_object (gamecat_ref,object_ref) VALUES (?,?)`).run(gc.id, objectId);
};

const removeGameCatObject = (gameId, categoryId, objectId) => {
  const d = getDB();
  const gc = d.prepare(`SELECT id FROM game_category WHERE game_ref=? AND category_ref=?`).get(gameId, categoryId);
  if (!gc) return { changes: 0 };
  const r = d.prepare(`DELETE FROM game_cat_object WHERE gamecat_ref=? AND object_ref=?`).run(gc.id, objectId);
  const left = d.prepare(`SELECT COUNT(*) AS cnt FROM game_cat_object WHERE gamecat_ref=?`).get(gc.id);
  if (!left.cnt) d.prepare(`DELETE FROM game_category WHERE id=?`).run(gc.id);
  return r;
};

const getGameImportedObjects = (gameId) =>
  getDB().prepare(`
    SELECT gco.id, gco.object_ref, o.name, oc.category_name, uc.color_code
    FROM game_cat_object gco
    JOIN game_category gc ON gc.id=gco.gamecat_ref
    JOIN object o ON o.id=gco.object_ref
    JOIN object_category oc ON oc.id=gc.category_ref
    LEFT JOIN use_color uc ON o.color=uc.id
    WHERE gc.game_ref=? ORDER BY oc.category_name, o.name
  `).all(gameId);

// Objects of one novel category, flagged with their game import state.
const getGameCategoryObjects = (gameId, categoryId) =>
  getDB().prepare(`
    SELECT o.id, o.name, uc.color_code,
           (SELECT gco.id FROM game_cat_object gco JOIN game_category gc ON gc.id=gco.gamecat_ref
             WHERE gc.game_ref=? AND gc.category_ref=? AND gco.object_ref=o.id) AS imported_id
    FROM object o LEFT JOIN use_color uc ON o.color=uc.id
    WHERE o.category_id=? ORDER BY o.name
  `).all(gameId, categoryId, categoryId);

// ═══ Characters ═══
const getGameCharacters = (gameId) =>
  getDB().prepare(`
    SELECT gc.*, uc.color_code, o.name AS object_name, oc.category_name
    FROM game_character gc
    LEFT JOIN use_color uc ON gc.color_ref=uc.id
    LEFT JOIN game_cat_object gco ON gco.id=gc.object_link
    LEFT JOIN object o ON o.id=gco.object_ref
    LEFT JOIN game_category gcat ON gcat.id=gco.gamecat_ref
    LEFT JOIN object_category oc ON oc.id=gcat.category_ref
    WHERE gc.game_ref=? ORDER BY gc.name
  `).all(gameId);

const createGameCharacter = (gameId, name, objectLink, colorRef) =>
  getDB().prepare(`INSERT INTO game_character (game_ref,name,object_link,color_ref) VALUES (?,?,?,?)`).run(gameId, name, objectLink||null, colorRef||null);

const updateGameCharacter = (id, name, objectLink, colorRef) =>
  getDB().prepare(`UPDATE game_character SET name=?,object_link=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, objectLink||null, colorRef||null, id);

const deleteGameCharacter = (id) =>
  getDB().prepare(`DELETE FROM game_character WHERE id=?`).run(id);

// ═══ Character attribute templates (per game) ═══
const getGameCharTemplates = (gameId) =>
  getDB().prepare(`SELECT * FROM game_char_template WHERE game_ref=? ORDER BY id`).all(gameId);

const createGameCharTemplate = (gameId, name, type, levelable) =>
  getDB().prepare(`INSERT INTO game_char_template (game_ref,attribute_name,attribute_type,levelable) VALUES (?,?,?,?)`).run(gameId, name, type||'text', levelable?1:0);

const updateGameCharTemplate = (id, name, type, levelable) =>
  getDB().prepare(`UPDATE game_char_template SET attribute_name=?,attribute_type=?,levelable=?,updated_at=datetime('now') WHERE id=?`).run(name, type||'text', levelable?1:0, id);

const deleteGameCharTemplate = (id) =>
  getDB().prepare(`DELETE FROM game_char_template WHERE id=?`).run(id);

// ═══ Character attribute values (per level; non-levelable = level 0) ═══
const getGameCharAttrs = (charId) =>
  getDB().prepare(`SELECT * FROM game_char_attribute WHERE char_ref=? ORDER BY template_ref, level`).all(charId);

const upsertGameCharAttr = (charId, templateId, level, text) =>
  getDB().prepare(`INSERT INTO game_char_attribute (char_ref,template_ref,level,attribute_text) VALUES (?,?,?,?)
    ON CONFLICT(char_ref,template_ref,level) DO UPDATE SET attribute_text=excluded.attribute_text, updated_at=datetime('now')`).run(charId, templateId, level||0, text);

const deleteGameCharAttr = (charId, templateId, level) =>
  getDB().prepare(`DELETE FROM game_char_attribute WHERE char_ref=? AND template_ref=? AND level=?`).run(charId, templateId, level||0);

// ═══ Character <-> element links ═══
const getGameCharElements = (charId) =>
  getDB().prepare(`
    SELECT gce.id, gce.element_ref, e.name, c.name AS collection_name, uc.color_code
    FROM game_char_element gce
    JOIN game_col_element e ON e.id=gce.element_ref
    JOIN game_collection c ON c.id=e.collection_ref
    LEFT JOIN use_color uc ON e.color_ref=uc.id
    WHERE gce.char_ref=? ORDER BY c.name, e.name
  `).all(charId);

const setGameCharElements = (charId, elementIds) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_char_element WHERE char_ref=?`).run(charId);
  const ins = d.prepare(`INSERT OR IGNORE INTO game_char_element (char_ref,element_ref) VALUES (?,?)`);
  for (const e of (elementIds||[])) ins.run(charId, e);
  return true;
};

// ═══ Collections ═══
const getGameCollections = (gameId) =>
  getDB().prepare(`
    SELECT c.*, uc.color_code,
           (SELECT COUNT(*) FROM game_col_element e WHERE e.collection_ref=c.id) AS element_count
    FROM game_collection c LEFT JOIN use_color uc ON c.color_ref=uc.id
    WHERE c.game_ref=? ORDER BY c.name
  `).all(gameId);

const createGameCollection = (gameId, name, colorRef) =>
  getDB().prepare(`INSERT INTO game_collection (game_ref,name,color_ref) VALUES (?,?,?)`).run(gameId, name, colorRef||null);

const updateGameCollection = (id, name, colorRef) =>
  getDB().prepare(`UPDATE game_collection SET name=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, colorRef||null, id);

const deleteGameCollection = (id) =>
  getDB().prepare(`DELETE FROM game_collection WHERE id=?`).run(id);

// ═══ Collection attribute templates ═══
const getGameColTemplates = (collectionId) =>
  getDB().prepare(`SELECT * FROM game_col_template WHERE collection_ref=? ORDER BY id`).all(collectionId);

const createGameColTemplate = (collectionId, name, type, levelable) =>
  getDB().prepare(`INSERT INTO game_col_template (collection_ref,attribute_name,attribute_type,levelable) VALUES (?,?,?,?)`).run(collectionId, name, type||'text', levelable?1:0);

const updateGameColTemplate = (id, name, type, levelable) =>
  getDB().prepare(`UPDATE game_col_template SET attribute_name=?,attribute_type=?,levelable=?,updated_at=datetime('now') WHERE id=?`).run(name, type||'text', levelable?1:0, id);

const deleteGameColTemplate = (id) =>
  getDB().prepare(`DELETE FROM game_col_template WHERE id=?`).run(id);

// ═══ Collection elements ═══
const getGameColElements = (collectionId) =>
  getDB().prepare(`SELECT e.*, uc.color_code FROM game_col_element e LEFT JOIN use_color uc ON e.color_ref=uc.id WHERE e.collection_ref=? ORDER BY e.name`).all(collectionId);

const createGameColElement = (collectionId, name, colorRef) =>
  getDB().prepare(`INSERT INTO game_col_element (collection_ref,name,color_ref) VALUES (?,?,?)`).run(collectionId, name, colorRef||null);

const updateGameColElement = (id, name, colorRef) =>
  getDB().prepare(`UPDATE game_col_element SET name=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, colorRef||null, id);

const deleteGameColElement = (id) =>
  getDB().prepare(`DELETE FROM game_col_element WHERE id=?`).run(id);

// ═══ Element attribute values ═══
const getGameElementAttrs = (elementId) =>
  getDB().prepare(`SELECT * FROM game_col_attribute WHERE element_ref=? ORDER BY template_ref, level`).all(elementId);

const upsertGameElementAttr = (elementId, templateId, level, text) =>
  getDB().prepare(`INSERT INTO game_col_attribute (element_ref,template_ref,level,attribute_text) VALUES (?,?,?,?)
    ON CONFLICT(element_ref,template_ref,level) DO UPDATE SET attribute_text=excluded.attribute_text, updated_at=datetime('now')`).run(elementId, templateId, level||0, text);

const deleteGameElementAttr = (elementId, templateId, level) =>
  getDB().prepare(`DELETE FROM game_col_attribute WHERE element_ref=? AND template_ref=? AND level=?`).run(elementId, templateId, level||0);

// ═══ Stories / dialogues / storyline / conversations ═══
const getGameStories = (gameId) =>
  getDB().prepare(`SELECT s.*, uc.color_code FROM game_story s LEFT JOIN use_color uc ON s.color_ref=uc.id WHERE s.game_ref=? ORDER BY s.name`).all(gameId);

const createGameStory = (gameId, name, memo, colorRef) =>
  getDB().prepare(`INSERT INTO game_story (game_ref,name,memo,color_ref) VALUES (?,?,?,?)`).run(gameId, name, memo||null, colorRef||null);

const updateGameStory = (id, name, memo, colorRef) =>
  getDB().prepare(`UPDATE game_story SET name=?,memo=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, colorRef||null, id);

const deleteGameStory = (id) =>
  getDB().prepare(`DELETE FROM game_story WHERE id=?`).run(id);

const getGameDialogues = (storyId) =>
  getDB().prepare(`
    SELECT d.*, uc.color_code,
           (SELECT COUNT(*) FROM game_conversation cv WHERE cv.dialogue_ref=d.id) AS conv_count
    FROM game_dialogue d LEFT JOIN use_color uc ON d.color_ref=uc.id
    WHERE d.story_ref=? ORDER BY d.id
  `).all(storyId);

const createGameDialogue = (storyId, name, memo, colorRef, posX, posY) =>
  getDB().prepare(`INSERT INTO game_dialogue (story_ref,name,memo,color_ref,pos_x,pos_y) VALUES (?,?,?,?,?,?)`).run(storyId, name, memo||null, colorRef||null, posX||0, posY||0);

const updateGameDialogue = (id, name, memo, colorRef) =>
  getDB().prepare(`UPDATE game_dialogue SET name=?,memo=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, colorRef||null, id);

const updateGameDialoguePos = (id, posX, posY) =>
  getDB().prepare(`UPDATE game_dialogue SET pos_x=?,pos_y=? WHERE id=?`).run(posX, posY, id);

const deleteGameDialogue = (id) =>
  getDB().prepare(`DELETE FROM game_dialogue WHERE id=?`).run(id);

const getGameStorylines = (storyId) =>
  getDB().prepare(`SELECT sl.*, uc.color_code FROM game_storyline sl LEFT JOIN use_color uc ON sl.color_ref=uc.id WHERE sl.story_ref=?`).all(storyId);

const createGameStoryline = (storyId, fromId, toId, colorRef) =>
  getDB().prepare(`INSERT OR IGNORE INTO game_storyline (story_ref,from_ref,to_ref,color_ref) VALUES (?,?,?,?)`).run(storyId, fromId, toId, colorRef||null);

const deleteGameStoryline = (id) =>
  getDB().prepare(`DELETE FROM game_storyline WHERE id=?`).run(id);

const getGameConversations = (dialogueId) =>
  getDB().prepare(`
    SELECT cv.*, gc.name AS char_name, uc.color_code AS char_color
    FROM game_conversation cv
    LEFT JOIN game_character gc ON gc.id=cv.char_ref
    LEFT JOIN use_color uc ON gc.color_ref=uc.id
    WHERE cv.dialogue_ref=? ORDER BY cv.talk_order
  `).all(dialogueId);

const createGameConversation = (dialogueId, charId, sentence) => {
  const d = getDB();
  const max = d.prepare(`SELECT COALESCE(MAX(talk_order),-1) AS m FROM game_conversation WHERE dialogue_ref=?`).get(dialogueId);
  return d.prepare(`INSERT INTO game_conversation (dialogue_ref,char_ref,talk_sentence,talk_order) VALUES (?,?,?,?)`).run(dialogueId, charId||null, sentence||'', max.m + 1);
};

const updateGameConversation = (id, charId, sentence) =>
  getDB().prepare(`UPDATE game_conversation SET char_ref=?,talk_sentence=?,updated_at=datetime('now') WHERE id=?`).run(charId||null, sentence||'', id);

const deleteGameConversation = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT dialogue_ref, talk_order FROM game_conversation WHERE id=?`).get(id);
  const r = d.prepare(`DELETE FROM game_conversation WHERE id=?`).run(id);
  if (row) {
    // Compact orders so UNIQUE(dialogue_ref,talk_order) stays gapless for swaps.
    const rest = d.prepare(`SELECT id FROM game_conversation WHERE dialogue_ref=? ORDER BY talk_order`).all(row.dialogue_ref);
    const tmp = d.prepare(`UPDATE game_conversation SET talk_order=? WHERE id=?`);
    rest.forEach((c, i) => tmp.run(-(i + 1), c.id));
    rest.forEach((c, i) => tmp.run(i, c.id));
  }
  return r;
};

const moveGameConversation = (id, dir) => {
  const d = getDB();
  const cur = d.prepare(`SELECT * FROM game_conversation WHERE id=?`).get(id);
  if (!cur) return false;
  const other = d.prepare(`SELECT * FROM game_conversation WHERE dialogue_ref=? AND talk_order=?`).get(cur.dialogue_ref, cur.talk_order + (dir < 0 ? -1 : 1));
  if (!other) return false;
  const upd = d.prepare(`UPDATE game_conversation SET talk_order=? WHERE id=?`);
  upd.run(-1, cur.id);
  upd.run(cur.talk_order, other.id);
  upd.run(other.talk_order, cur.id);
  return true;
};

// ═══ Hashtags ═══
const getGameTags = (gameId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN game_project_hashtag gph ON h.id=gph.hashtag_id WHERE gph.game_id=? ORDER BY h.tag_name`).all(gameId);

const setGameTags = (gameId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_project_hashtag WHERE game_id=?`).run(gameId);
  const ins = d.prepare(`INSERT INTO game_project_hashtag (game_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(gameId, t);
  return true;
};

const getGameCharTags = (charId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN game_char_hashtag gch ON h.id=gch.hashtag_id WHERE gch.char_id=? ORDER BY h.tag_name`).all(charId);

const setGameCharTags = (charId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_char_hashtag WHERE char_id=?`).run(charId);
  const ins = d.prepare(`INSERT INTO game_char_hashtag (char_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(charId, t);
  return true;
};

const getGameElementTags = (elementId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN game_element_hashtag geh ON h.id=geh.hashtag_id WHERE geh.element_id=? ORDER BY h.tag_name`).all(elementId);

const setGameElementTags = (elementId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_element_hashtag WHERE element_id=?`).run(elementId);
  const ins = d.prepare(`INSERT INTO game_element_hashtag (element_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(elementId, t);
  return true;
};

// Tags used anywhere in this game (project, characters, elements) — mirrors
// Director's project-tag view.
const getGameUsedTags = (gameId) =>
  getDB().prepare(`
    SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id
    WHERE h.id IN (
      SELECT hashtag_id FROM game_project_hashtag WHERE game_id=?
      UNION SELECT gch.hashtag_id FROM game_char_hashtag gch JOIN game_character gc ON gc.id=gch.char_id WHERE gc.game_ref=?
      UNION SELECT geh.hashtag_id FROM game_element_hashtag geh JOIN game_col_element e ON e.id=geh.element_id JOIN game_collection c ON c.id=e.collection_ref WHERE c.game_ref=?
    ) ORDER BY h.tag_name
  `).all(gameId, gameId, gameId);

const getGameCharsByTag = (tagId, gameId) =>
  getDB().prepare(`
    SELECT gc.*, uc.color_code FROM game_character gc
    JOIN game_char_hashtag gch ON gch.char_id=gc.id
    LEFT JOIN use_color uc ON gc.color_ref=uc.id
    WHERE gch.hashtag_id=? AND gc.game_ref=? ORDER BY gc.name
  `).all(tagId, gameId);

const getGameElementsByTag = (tagId, gameId) =>
  getDB().prepare(`
    SELECT e.*, c.name AS collection_name, uc.color_code FROM game_col_element e
    JOIN game_element_hashtag geh ON geh.element_id=e.id
    JOIN game_collection c ON c.id=e.collection_ref
    LEFT JOIN use_color uc ON e.color_ref=uc.id
    WHERE geh.hashtag_id=? AND c.game_ref=? ORDER BY e.name
  `).all(tagId, gameId);

module.exports = {
  getGames, getGame, createGame, updateGame, deleteGame,
  getGameNovelLink, setGameNovelLink,
  getGameCategories, addGameCategory, removeGameCategory,
  addGameCatObject, removeGameCatObject, getGameImportedObjects, getGameCategoryObjects,
  getGameCharacters, createGameCharacter, updateGameCharacter, deleteGameCharacter,
  getGameCharTemplates, createGameCharTemplate, updateGameCharTemplate, deleteGameCharTemplate,
  getGameCharAttrs, upsertGameCharAttr, deleteGameCharAttr,
  getGameCharElements, setGameCharElements,
  getGameCollections, createGameCollection, updateGameCollection, deleteGameCollection,
  getGameColTemplates, createGameColTemplate, updateGameColTemplate, deleteGameColTemplate,
  getGameColElements, createGameColElement, updateGameColElement, deleteGameColElement,
  getGameElementAttrs, upsertGameElementAttr, deleteGameElementAttr,
  getGameStories, createGameStory, updateGameStory, deleteGameStory,
  getGameDialogues, createGameDialogue, updateGameDialogue, updateGameDialoguePos, deleteGameDialogue,
  getGameStorylines, createGameStoryline, deleteGameStoryline,
  getGameConversations, createGameConversation, updateGameConversation, deleteGameConversation, moveGameConversation,
  getGameTags, setGameTags,
  getGameCharTags, setGameCharTags,
  getGameElementTags, setGameElementTags,
  getGameUsedTags, getGameCharsByTag, getGameElementsByTag,
};
