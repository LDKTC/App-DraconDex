'use strict';
const { getDB } = require('./core');

// World project CRUD
const getWorlds = () =>
  getDB().prepare(`SELECT w.*, uc.color_code FROM world_project w LEFT JOIN use_color uc ON w.color_ref=uc.id ORDER BY w.name`).all();

const getWorld = (id) =>
  getDB().prepare(`SELECT w.*, uc.color_code FROM world_project w LEFT JOIN use_color uc ON w.color_ref=uc.id WHERE w.id=?`).get(id);

const createWorld = (name, memo, colorRef) =>
  getDB().prepare(`INSERT INTO world_project (name,memo,color_ref) VALUES (?,?,?)`).run(name, memo||null, colorRef||null);

const updateWorld = (id, name, memo, colorRef) =>
  getDB().prepare(`UPDATE world_project SET name=?,memo=?,color_ref=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, colorRef||null, id);

const deleteWorld = (id) =>
  getDB().prepare(`DELETE FROM world_project WHERE id=?`).run(id);

// World descriptions
const getWorldDesc = (worldId) =>
  getDB().prepare(`SELECT * FROM world_description WHERE world_ref=? ORDER BY id`).all(worldId);

const addWorldDesc = (worldId, title, content) =>
  getDB().prepare(`INSERT INTO world_description (world_ref,title,content) VALUES (?,?,?)`).run(worldId, title||'', content||'');

const updateWorldDesc = (id, title, content) =>
  getDB().prepare(`UPDATE world_description SET title=?,content=?,updated_at=datetime('now') WHERE id=?`).run(title||'', content||'', id);

const deleteWorldDesc = (id) =>
  getDB().prepare(`DELETE FROM world_description WHERE id=?`).run(id);

// Novel links
const getWorldNovelLinks = (worldId) =>
  getDB().prepare(`
    SELECT wl.*, p.name as project_name, uc.color_code
    FROM world_novel_link wl JOIN project p ON wl.project_ref=p.id
    LEFT JOIN use_color uc ON p.project_color=uc.id
    WHERE wl.world_ref=? ORDER BY p.name
  `).all(worldId);

const addWorldNovelLink = (worldId, projectId) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_novel_link (world_ref,project_ref) VALUES (?,?)`).run(worldId, projectId);

const removeWorldNovelLink = (id) =>
  getDB().prepare(`DELETE FROM world_novel_link WHERE id=?`).run(id);

// World characters
const getWorldCharacters = (worldId) =>
  getDB().prepare(`
    SELECT wc.*, wcl.project_ref, wcl.category_ref, wcl.object_ref,
           o.name as object_name, p.name as project_name, oc.category_name
    FROM world_character wc
    LEFT JOIN world_char_link wcl ON wcl.char_ref=wc.id
    LEFT JOIN object o ON wcl.object_ref=o.id
    LEFT JOIN project p ON wcl.project_ref=p.id
    LEFT JOIN object_category oc ON wcl.category_ref=oc.id
    WHERE wc.world_ref=? ORDER BY wc.name
  `).all(worldId);

const createWorldCharacter = (worldId, name, memo) =>
  getDB().prepare(`INSERT INTO world_character (world_ref,name,memo) VALUES (?,?,?)`).run(worldId, name, memo||null);

const updateWorldCharacter = (id, name, memo) =>
  getDB().prepare(`UPDATE world_character SET name=?,memo=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, id);

const deleteWorldCharacter = (id) =>
  getDB().prepare(`DELETE FROM world_character WHERE id=?`).run(id);

const setWorldCharLink = (charId, projectId, categoryId, objectId) => {
  const d = getDB();
  d.prepare(`DELETE FROM world_char_link WHERE char_ref=?`).run(charId);
  if (projectId && objectId) {
    d.prepare(`INSERT INTO world_char_link (char_ref,project_ref,category_ref,object_ref) VALUES (?,?,?,?)`).run(charId, projectId, categoryId||null, objectId);
  }
  return true;
};

// World character hashtags
const getWorldCharTags = (charId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN world_char_hashtag wch ON h.id=wch.hashtag_id WHERE wch.char_id=? ORDER BY h.tag_name`).all(charId);

const setWorldCharTags = (charId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM world_char_hashtag WHERE char_id=?`).run(charId);
  const ins = d.prepare(`INSERT INTO world_char_hashtag (char_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(charId, t);
  return true;
};

// World categories
const getWorldCategories = (worldId) =>
  getDB().prepare(`
    SELECT wc.*, wcl.project_ref, wcl.category_ref, p.name as project_name, oc.category_name
    FROM world_category wc
    LEFT JOIN world_cat_link wcl ON wcl.cat_ref=wc.id
    LEFT JOIN project p ON wcl.project_ref=p.id
    LEFT JOIN object_category oc ON wcl.category_ref=oc.id
    WHERE wc.world_ref=? ORDER BY wc.name
  `).all(worldId);

const createWorldCategory = (worldId, name, memo) =>
  getDB().prepare(`INSERT INTO world_category (world_ref,name,memo) VALUES (?,?,?)`).run(worldId, name, memo||null);

const updateWorldCategory = (id, name, memo) =>
  getDB().prepare(`UPDATE world_category SET name=?,memo=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, id);

const deleteWorldCategory = (id) =>
  getDB().prepare(`DELETE FROM world_category WHERE id=?`).run(id);

const setWorldCatLink = (catId, projectId, categoryId) => {
  const d = getDB();
  d.prepare(`DELETE FROM world_cat_link WHERE cat_ref=?`).run(catId);
  if (projectId && categoryId) {
    d.prepare(`INSERT INTO world_cat_link (cat_ref,project_ref,category_ref) VALUES (?,?,?)`).run(catId, projectId, categoryId);
  }
  return true;
};

// World category objects
const getWorldCatObjects = (catId) =>
  getDB().prepare(`SELECT * FROM world_cat_object WHERE cat_ref=? ORDER BY name`).all(catId);

const createWorldCatObject = (catId, name, symbol) =>
  getDB().prepare(`INSERT INTO world_cat_object (cat_ref,name,symbol) VALUES (?,?,?)`).run(catId, name, symbol||null);

const updateWorldCatObject = (id, name, symbol) =>
  getDB().prepare(`UPDATE world_cat_object SET name=?,symbol=?,updated_at=datetime('now') WHERE id=?`).run(name, symbol||null, id);

const deleteWorldCatObject = (id) =>
  getDB().prepare(`DELETE FROM world_cat_object WHERE id=?`).run(id);

// World category object hashtags
const getWorldObjTags = (objId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN world_obj_hashtag woh ON h.id=woh.hashtag_id WHERE woh.obj_id=? ORDER BY h.tag_name`).all(objId);

const setWorldObjTags = (objId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM world_obj_hashtag WHERE obj_id=?`).run(objId);
  const ins = d.prepare(`INSERT INTO world_obj_hashtag (obj_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(objId, t);
  return true;
};

// World maps
const getWorldMaps = (worldId) =>
  getDB().prepare(`
    SELECT wm.*, wml.project_ref, wml.map_ref_src, wml.area_ref,
           p.name as project_name, m.map_name as src_map_name, ma.area_name
    FROM world_map wm
    LEFT JOIN world_map_link wml ON wml.map_ref=wm.id
    LEFT JOIN project p ON wml.project_ref=p.id
    LEFT JOIN map m ON wml.map_ref_src=m.id
    LEFT JOIN map_area ma ON wml.area_ref=ma.id
    WHERE wm.world_ref=? ORDER BY wm.name
  `).all(worldId);

const createWorldMap = (worldId, name, memo) =>
  getDB().prepare(`INSERT INTO world_map (world_ref,name,memo) VALUES (?,?,?)`).run(worldId, name, memo||null);

const updateWorldMap = (id, name, memo) =>
  getDB().prepare(`UPDATE world_map SET name=?,memo=?,updated_at=datetime('now') WHERE id=?`).run(name, memo||null, id);

const deleteWorldMap = (id) =>
  getDB().prepare(`DELETE FROM world_map WHERE id=?`).run(id);

const setWorldMapLink = (mapId, projectId, mapRefSrc, areaRef) => {
  const d = getDB();
  d.prepare(`DELETE FROM world_map_link WHERE map_ref=?`).run(mapId);
  if (projectId) {
    d.prepare(`INSERT INTO world_map_link (map_ref,project_ref,map_ref_src,area_ref) VALUES (?,?,?,?)`).run(mapId, projectId, mapRefSrc||null, areaRef||null);
  }
  return true;
};

// World map timelines
const getWorldMapTimelines = (worldId) =>
  getDB().prepare(`SELECT wmt.*, wm.name as map_name FROM world_map_timeline wmt LEFT JOIN world_map wm ON wmt.map_ref=wm.id WHERE wmt.world_ref=? ORDER BY wmt.name`).all(worldId);

const createWorldMapTimeline = (worldId, mapId, name) =>
  getDB().prepare(`INSERT INTO world_map_timeline (world_ref,map_ref,name) VALUES (?,?,?)`).run(worldId, mapId||null, name);

const updateWorldMapTimeline = (id, mapId, name) =>
  getDB().prepare(`UPDATE world_map_timeline SET map_ref=?,name=?,updated_at=datetime('now') WHERE id=?`).run(mapId||null, name, id);

const deleteWorldMapTimeline = (id) =>
  getDB().prepare(`DELETE FROM world_map_timeline WHERE id=?`).run(id);

// World map timeline events
const getWorldMaptlEvents = (timelineId) =>
  getDB().prepare(`SELECT * FROM world_maptl_event WHERE timeline_ref=? ORDER BY order_index`).all(timelineId);

const createWorldMaptlEvent = (timelineId, name, orderIndex) =>
  getDB().prepare(`INSERT INTO world_maptl_event (timeline_ref,name,order_index) VALUES (?,?,?)`).run(timelineId, name, orderIndex||0);

const updateWorldMaptlEvent = (id, name, orderIndex) =>
  getDB().prepare(`UPDATE world_maptl_event SET name=?,order_index=?,updated_at=datetime('now') WHERE id=?`).run(name, orderIndex??0, id);

const deleteWorldMaptlEvent = (id) =>
  getDB().prepare(`DELETE FROM world_maptl_event WHERE id=?`).run(id);

// World map timeline event objects
const getWorldMaptlObjs = (eventId) =>
  getDB().prepare(`SELECT wmto.*, wco.name as obj_name, wco.symbol FROM world_maptl_obj wmto LEFT JOIN world_cat_object wco ON wmto.cat_object_ref=wco.id WHERE wmto.event_ref=?`).all(eventId);

const addWorldMaptlObj = (eventId, catObjectId) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_maptl_obj (event_ref,cat_object_ref) VALUES (?,?)`).run(eventId, catObjectId);

const removeWorldMaptlObj = (id) =>
  getDB().prepare(`DELETE FROM world_maptl_obj WHERE id=?`).run(id);

// World project hashtags
const getWorldTags = (worldId) =>
  getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id JOIN world_project_hashtag wph ON h.id=wph.hashtag_id WHERE wph.world_id=? ORDER BY h.tag_name`).all(worldId);

const setWorldTags = (worldId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM world_project_hashtag WHERE world_id=?`).run(worldId);
  const ins = d.prepare(`INSERT INTO world_project_hashtag (world_id,hashtag_id) VALUES (?,?)`);
  for (const t of (tags||[])) ins.run(worldId, t);
  return true;
};

module.exports = {
  getWorlds, getWorld, createWorld, updateWorld, deleteWorld,
  getWorldDesc, addWorldDesc, updateWorldDesc, deleteWorldDesc,
  getWorldNovelLinks, addWorldNovelLink, removeWorldNovelLink,
  getWorldCharacters, createWorldCharacter, updateWorldCharacter, deleteWorldCharacter, setWorldCharLink,
  getWorldCharTags, setWorldCharTags,
  getWorldCategories, createWorldCategory, updateWorldCategory, deleteWorldCategory, setWorldCatLink,
  getWorldCatObjects, createWorldCatObject, updateWorldCatObject, deleteWorldCatObject,
  getWorldObjTags, setWorldObjTags,
  getWorldMaps, createWorldMap, updateWorldMap, deleteWorldMap, setWorldMapLink,
  getWorldMapTimelines, createWorldMapTimeline, updateWorldMapTimeline, deleteWorldMapTimeline,
  getWorldMaptlEvents, createWorldMaptlEvent, updateWorldMaptlEvent, deleteWorldMaptlEvent,
  getWorldMaptlObjs, addWorldMaptlObj, removeWorldMaptlObj,
  getWorldTags, setWorldTags,
};
