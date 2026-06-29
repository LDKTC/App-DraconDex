'use strict';
const { getDB } = require('./core');

// Game project CRUD
const getGames = () =>
  getDB().prepare(`SELECT g.*, uc.color_code FROM game_project g LEFT JOIN use_color uc ON g.color_ref=uc.id ORDER BY g.name`).all();

const getGame = (id) =>
  getDB().prepare(`SELECT g.*, uc.color_code FROM game_project g LEFT JOIN use_color uc ON g.color_ref=uc.id WHERE g.id=?`).get(id);

const createGame = (name, memo, colorRef) =>
  getDB().prepare(`INSERT INTO game_project (name,memo,color_ref) VALUES (?,?,?)`).run(name, memo||null, colorRef||null);

const updateGame = (id, name, memo, colorRef) =>
  getDB().prepare(`UPDATE game_project SET name=?,memo=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, colorRef||null, id);

const deleteGame = (id) =>
  getDB().prepare(`DELETE FROM game_project WHERE id=?`).run(id);

// Game descriptions
const getGameDesc = (gameId) =>
  getDB().prepare(`SELECT * FROM game_description WHERE game_ref=? ORDER BY id`).all(gameId);

const addGameDesc = (gameId, title, content) =>
  getDB().prepare(`INSERT INTO game_description (game_ref,title,content) VALUES (?,?,?)`).run(gameId, title||'', content||'');

const updateGameDesc = (id, title, content) =>
  getDB().prepare(`UPDATE game_description SET title=?,content=?,updated_at=datetime('now') WHERE id=?`).run(title||'', content||'', id);

const deleteGameDesc = (id) =>
  getDB().prepare(`DELETE FROM game_description WHERE id=?`).run(id);

// Novel link (1:1)
const getGameNovelLink = (gameId) =>
  getDB().prepare(`SELECT gnl.*, p.name as project_name FROM game_novel_link gnl JOIN project p ON gnl.project_ref=p.id WHERE gnl.game_ref=?`).get(gameId);

const setGameNovelLink = (gameId, projectId) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_novel_link WHERE game_ref=?`).run(gameId);
  if (projectId) d.prepare(`INSERT INTO game_novel_link (game_ref,project_ref) VALUES (?,?)`).run(gameId, projectId);
  return true;
};

// Game characters
const getGameCharacters = (gameId) =>
  getDB().prepare(`
    SELECT gc.*, gcl.project_ref, gcl.category_ref, gcl.object_ref,
           o.name as object_name, p.name as project_name, oc.category_name
    FROM game_character gc
    LEFT JOIN game_char_link gcl ON gcl.char_ref=gc.id
    LEFT JOIN object o ON gcl.object_ref=o.id
    LEFT JOIN project p ON gcl.project_ref=p.id
    LEFT JOIN object_category oc ON gcl.category_ref=oc.id
    WHERE gc.game_ref=? ORDER BY gc.name
  `).all(gameId);

const createGameCharacter = (gameId, name, memo) =>
  getDB().prepare(`INSERT INTO game_character (game_ref,name,memo) VALUES (?,?,?)`).run(gameId, name, memo||null);

const updateGameCharacter = (id, name, memo) =>
  getDB().prepare(`UPDATE game_character SET name=?,memo=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, id);

const deleteGameCharacter = (id) =>
  getDB().prepare(`DELETE FROM game_character WHERE id=?`).run(id);

const setGameCharLink = (charId, projectId, categoryId, objectId) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_char_link WHERE char_ref=?`).run(charId);
  if (projectId && objectId) {
    d.prepare(`INSERT INTO game_char_link (char_ref,project_ref,category_ref,object_ref) VALUES (?,?,?,?)`).run(charId, projectId, categoryId||null, objectId);
  }
  return true;
};

// Stat templates per character
const getGameStats = (charId) =>
  getDB().prepare(`SELECT * FROM game_stat_template WHERE char_ref=? ORDER BY id`).all(charId);

const createGameStat = (charId, statName, statType) =>
  getDB().prepare(`INSERT INTO game_stat_template (char_ref,stat_name,stat_type) VALUES (?,?,?)`).run(charId, statName, statType||'number');

const updateGameStat = (id, statName, statType) =>
  getDB().prepare(`UPDATE game_stat_template SET stat_name=?,stat_type=?,updated_at=datetime('now') WHERE id=?`).run(statName, statType||'number', id);

const deleteGameStat = (id) =>
  getDB().prepare(`DELETE FROM game_stat_template WHERE id=?`).run(id);

// Level-up values per stat
const getGameStatLevelups = (charId) =>
  getDB().prepare(`SELECT * FROM game_stat_levelup WHERE char_ref=? ORDER BY template_ref,level`).all(charId);

const upsertGameStatLevelup = (charId, templateId, level, value) =>
  getDB().prepare(`INSERT INTO game_stat_levelup (char_ref,template_ref,level,value) VALUES (?,?,?,?) ON CONFLICT(char_ref,template_ref,level) DO UPDATE SET value=excluded.value`).run(charId, templateId, level, value);

const deleteGameStatLevelup = (charId, templateId, level) =>
  getDB().prepare(`DELETE FROM game_stat_levelup WHERE char_ref=? AND template_ref=? AND level=?`).run(charId, templateId, level);

// Character hashtags
const getGameCharTags = (charId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN game_char_hashtag gch ON h.id=gch.hashtag_id WHERE gch.char_id=? ORDER BY h.tag_name`).all(charId);

const setGameCharTags = (charId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_char_hashtag WHERE char_id=?`).run(charId);
  const ins = d.prepare(`INSERT INTO game_char_hashtag (char_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(charId, t);
  return true;
};

// Item categories
const getGameItemCategories = (gameId) =>
  getDB().prepare(`SELECT * FROM game_item_category WHERE game_ref=? ORDER BY name`).all(gameId);

const createGameItemCategory = (gameId, name, memo) =>
  getDB().prepare(`INSERT INTO game_item_category (game_ref,name,memo) VALUES (?,?,?)`).run(gameId, name, memo||null);

const updateGameItemCategory = (id, name, memo) =>
  getDB().prepare(`UPDATE game_item_category SET name=?,memo=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, id);

const deleteGameItemCategory = (id) =>
  getDB().prepare(`DELETE FROM game_item_category WHERE id=?`).run(id);

// Item templates
const getGameItemTemplates = (itemCatId) =>
  getDB().prepare(`SELECT * FROM game_item_template WHERE item_cat_ref=? ORDER BY id`).all(itemCatId);

const createGameItemTemplate = (itemCatId, attrName, attrType) =>
  getDB().prepare(`INSERT INTO game_item_template (item_cat_ref,attr_name,attr_type) VALUES (?,?,?)`).run(itemCatId, attrName, attrType||'text');

const updateGameItemTemplate = (id, attrName, attrType) =>
  getDB().prepare(`UPDATE game_item_template SET attr_name=?,attr_type=?,updated_at=datetime('now') WHERE id=?`).run(attrName, attrType||'text', id);

const deleteGameItemTemplate = (id) =>
  getDB().prepare(`DELETE FROM game_item_template WHERE id=?`).run(id);

// Items
const getGameItems = (itemCatId) =>
  getDB().prepare(`SELECT * FROM game_item WHERE item_cat_ref=? ORDER BY name`).all(itemCatId);

const createGameItem = (itemCatId, name, symbol) =>
  getDB().prepare(`INSERT INTO game_item (item_cat_ref,name,symbol) VALUES (?,?,?)`).run(itemCatId, name, symbol||null);

const updateGameItem = (id, name, symbol) =>
  getDB().prepare(`UPDATE game_item SET name=?,symbol=?,updated_at=datetime('now') WHERE id=?`).run(name, symbol||null, id);

const deleteGameItem = (id) =>
  getDB().prepare(`DELETE FROM game_item WHERE id=?`).run(id);

// Item attributes
const getGameItemAttrs = (itemId) =>
  getDB().prepare(`SELECT ia.*, it.attr_name, it.attr_type FROM game_item_attr ia JOIN game_item_template it ON ia.template_ref=it.id WHERE ia.item_ref=?`).all(itemId);

const upsertGameItemAttr = (itemId, templateId, value) =>
  getDB().prepare(`INSERT INTO game_item_attr (item_ref,template_ref,value) VALUES (?,?,?) ON CONFLICT(item_ref,template_ref) DO UPDATE SET value=excluded.value`).run(itemId, templateId, value);

// Item hashtags
const getGameItemTags = (itemId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN game_item_hashtag gih ON h.id=gih.hashtag_id WHERE gih.item_id=? ORDER BY h.tag_name`).all(itemId);

const setGameItemTags = (itemId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_item_hashtag WHERE item_id=?`).run(itemId);
  const ins = d.prepare(`INSERT INTO game_item_hashtag (item_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(itemId, t);
  return true;
};

// Stories (dialogue graphs)
const getGameStories = (gameId) =>
  getDB().prepare(`SELECT * FROM game_story WHERE game_ref=? ORDER BY name`).all(gameId);

const createGameStory = (gameId, name, memo) =>
  getDB().prepare(`INSERT INTO game_story (game_ref,name,memo) VALUES (?,?,?)`).run(gameId, name, memo||null);

const updateGameStory = (id, name, memo) =>
  getDB().prepare(`UPDATE game_story SET name=?,memo=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, id);

const deleteGameStory = (id) =>
  getDB().prepare(`DELETE FROM game_story WHERE id=?`).run(id);

// Dialogue nodes
const getGameDialogues = (storyId) =>
  getDB().prepare(`SELECT * FROM game_dialogue WHERE story_ref=? ORDER BY id`).all(storyId);

const createGameDialogue = (storyId, name, memo, posX, posY) =>
  getDB().prepare(`INSERT INTO game_dialogue (story_ref,name,memo,pos_x,pos_y) VALUES (?,?,?,?,?)`).run(storyId, name, memo||null, posX||0, posY||0);

const updateGameDialogue = (id, name, memo, posX, posY) =>
  getDB().prepare(`UPDATE game_dialogue SET name=?,memo=?,pos_x=?,pos_y=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, posX||0, posY||0, id);

const deleteGameDialogue = (id) =>
  getDB().prepare(`DELETE FROM game_dialogue WHERE id=?`).run(id);

const updateGameDialoguePos = (id, posX, posY) =>
  getDB().prepare(`UPDATE game_dialogue SET pos_x=?,pos_y=? WHERE id=?`).run(posX, posY, id);

// Dialogue edges
const getGameDialogueEdges = (storyId) =>
  getDB().prepare(`SELECT gdn.*, gdf.name as from_name, gdt.name as to_name FROM game_dial_next gdn JOIN game_dialogue gdf ON gdn.from_ref=gdf.id JOIN game_dialogue gdt ON gdn.to_ref=gdt.id WHERE gdf.story_ref=?`).all(storyId);

const createGameDialogueEdge = (fromId, toId, condition) =>
  getDB().prepare(`INSERT OR IGNORE INTO game_dial_next (from_ref,to_ref,condition) VALUES (?,?,?)`).run(fromId, toId, condition||null);

const deleteGameDialogueEdge = (id) =>
  getDB().prepare(`DELETE FROM game_dial_next WHERE id=?`).run(id);

// Dialogue lines
const getGameDialogueLines = (dialId) =>
  getDB().prepare(`SELECT * FROM game_dial_line WHERE dial_ref=? ORDER BY order_index`).all(dialId);

const createGameDialogueLine = (dialId, speakerRef, text, orderIndex) =>
  getDB().prepare(`INSERT INTO game_dial_line (dial_ref,speaker_ref,text,order_index) VALUES (?,?,?,?)`).run(dialId, speakerRef||null, text||'', orderIndex||0);

const updateGameDialogueLine = (id, speakerRef, text, orderIndex) =>
  getDB().prepare(`UPDATE game_dial_line SET speaker_ref=?,text=?,order_index=?,updated_at=datetime('now') WHERE id=?`).run(speakerRef||null, text||'', orderIndex||0, id);

const deleteGameDialogueLine = (id) =>
  getDB().prepare(`DELETE FROM game_dial_line WHERE id=?`).run(id);

// Function categories
const getGameFuncCategories = (gameId) =>
  getDB().prepare(`SELECT * FROM game_func_category WHERE game_ref=? ORDER BY name`).all(gameId);

const createGameFuncCategory = (gameId, name, funcType) =>
  getDB().prepare(`INSERT INTO game_func_category (game_ref,name,function_type) VALUES (?,?,?)`).run(gameId, name, funcType||'general');

const updateGameFuncCategory = (id, name, funcType) =>
  getDB().prepare(`UPDATE game_func_category SET name=?,function_type=?,updated_at=datetime('now') WHERE id=?`).run(name, funcType||'general', id);

const deleteGameFuncCategory = (id) =>
  getDB().prepare(`DELETE FROM game_func_category WHERE id=?`).run(id);

// Functions
const getGameFunctions = (funcCatId) =>
  getDB().prepare(`SELECT * FROM game_function WHERE func_cat_ref=? ORDER BY name`).all(funcCatId);

const createGameFunction = (funcCatId, name, template, conditions, effects) =>
  getDB().prepare(`INSERT INTO game_function (func_cat_ref,name,function_template,conditions_json,effects_json) VALUES (?,?,?,?,?)`).run(funcCatId, name, template||null, conditions||null, effects||null);

const updateGameFunction = (id, name, template, conditions, effects) =>
  getDB().prepare(`UPDATE game_function SET name=?,function_template=?,conditions_json=?,effects_json=?,updated_at=datetime('now') WHERE id=?`).run(name, template||null, conditions||null, effects||null, id);

const deleteGameFunction = (id) =>
  getDB().prepare(`DELETE FROM game_function WHERE id=?`).run(id);

// Game project hashtags
const getGameTags = (gameId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN game_project_hashtag gph ON h.id=gph.hashtag_id WHERE gph.game_id=? ORDER BY h.tag_name`).all(gameId);

const setGameTags = (gameId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM game_project_hashtag WHERE game_id=?`).run(gameId);
  const ins = d.prepare(`INSERT INTO game_project_hashtag (game_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(gameId, t);
  return true;
};

module.exports = {
  getGames, getGame, createGame, updateGame, deleteGame,
  getGameDesc, addGameDesc, updateGameDesc, deleteGameDesc,
  getGameNovelLink, setGameNovelLink,
  getGameCharacters, createGameCharacter, updateGameCharacter, deleteGameCharacter, setGameCharLink,
  getGameStats, createGameStat, updateGameStat, deleteGameStat,
  getGameStatLevelups, upsertGameStatLevelup, deleteGameStatLevelup,
  getGameCharTags, setGameCharTags,
  getGameItemCategories, createGameItemCategory, updateGameItemCategory, deleteGameItemCategory,
  getGameItemTemplates, createGameItemTemplate, updateGameItemTemplate, deleteGameItemTemplate,
  getGameItems, createGameItem, updateGameItem, deleteGameItem,
  getGameItemAttrs, upsertGameItemAttr,
  getGameItemTags, setGameItemTags,
  getGameStories, createGameStory, updateGameStory, deleteGameStory,
  getGameDialogues, createGameDialogue, updateGameDialogue, deleteGameDialogue, updateGameDialoguePos,
  getGameDialogueEdges, createGameDialogueEdge, deleteGameDialogueEdge,
  getGameDialogueLines, createGameDialogueLine, updateGameDialogueLine, deleteGameDialogueLine,
  getGameFuncCategories, createGameFuncCategory, updateGameFuncCategory, deleteGameFuncCategory,
  getGameFunctions, createGameFunction, updateGameFunction, deleteGameFunction,
  getGameTags, setGameTags,
};
