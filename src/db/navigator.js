'use strict';
const { getDB } = require('./core');

// Navigator module (v2.5.2 "World") — cross-novel world-building layer.
// Worlds aggregate data from linked novels (project rows): characters,
// categories/objects, maps and a dated timeline.

// ---- World CRUD ----------------------------------------------------------
const getWorlds = () =>
  getDB().prepare(`SELECT w.*, uc.color_code FROM world_project w LEFT JOIN use_color uc ON w.color=uc.id ORDER BY w.name`).all();

const getWorld = (id) =>
  getDB().prepare(`SELECT w.*, uc.color_code FROM world_project w LEFT JOIN use_color uc ON w.color=uc.id WHERE w.id=?`).get(id);

const createWorld = (codename, name, memo, colorId) =>
  getDB().prepare(`INSERT INTO world_project (codename,name,memo,color) VALUES (?,?,?,?)`).run(codename||null, name, memo||null, colorId||null).lastInsertRowid;

const updateWorld = (id, codename, name, memo, colorId) =>
  getDB().prepare(`UPDATE world_project SET codename=?,name=?,memo=?,color=?,update_at=datetime('now') WHERE id=?`).run(codename||null, name, memo||null, colorId||null, id);

const deleteWorld = (id) =>
  getDB().prepare(`DELETE FROM world_project WHERE id=?`).run(id);

// ---- Novels --------------------------------------------------------------
const getWorldNovels = (worldId) =>
  getDB().prepare(`
    SELECT wn.id, wn.world_ref, wn.project_ref, p.codename, p.name, uc.color_code
    FROM world_novel wn JOIN project p ON wn.project_ref=p.id
    LEFT JOIN use_color uc ON p.project_color=uc.id
    WHERE wn.world_ref=? ORDER BY p.name
  `).all(worldId);

const getLinkableProjects = (worldId) =>
  getDB().prepare(`
    SELECT p.id, p.codename, p.name, uc.color_code FROM project p
    LEFT JOIN use_color uc ON p.project_color=uc.id
    WHERE p.id NOT IN (SELECT project_ref FROM world_novel WHERE world_ref=?)
    ORDER BY p.name
  `).all(worldId);

const addWorldNovel = (worldId, projectId) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_novel (world_ref,project_ref) VALUES (?,?)`).run(worldId, projectId);

const removeWorldNovel = (linkId) =>
  getDB().prepare(`DELETE FROM world_novel WHERE id=?`).run(linkId);

// ---- Characters ----------------------------------------------------------
const getWorldCharacters = (worldId) =>
  getDB().prepare(`SELECT c.*, uc.color_code FROM world_character c LEFT JOIN use_color uc ON c.color=uc.id WHERE c.world_ref=? ORDER BY c.name`).all(worldId);

const createWorldCharacter = (worldId, name, symbol, colorId) =>
  getDB().prepare(`INSERT INTO world_character (world_ref,name,symbol,color) VALUES (?,?,?,?)`).run(worldId, name, symbol||null, colorId||null).lastInsertRowid;

const updateWorldCharacter = (id, name, symbol, colorId) =>
  getDB().prepare(`UPDATE world_character SET name=?,symbol=?,color=?,update_at=datetime('now') WHERE id=?`).run(name, symbol||null, colorId||null, id);

const deleteWorldCharacter = (id) =>
  getDB().prepare(`DELETE FROM world_character WHERE id=?`).run(id);

const getCharacterCategories = (worldId) =>
  getDB().prepare(`
    SELECT wcc.id, wcc.world_ref, wcc.category_ref, oc.category_name, p.name AS project_name, uc.color_code
    FROM world_character_category wcc
    JOIN object_category oc ON wcc.category_ref=oc.id
    JOIN project p ON oc.project_id=p.id
    LEFT JOIN use_color uc ON oc.color=uc.id
    WHERE wcc.world_ref=? ORDER BY p.name, oc.category_name
  `).all(worldId);

const addCharacterCategory = (worldId, categoryRef) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_character_category (world_ref,category_ref) VALUES (?,?)`).run(worldId, categoryRef);

const removeCharacterCategory = (id) =>
  getDB().prepare(`DELETE FROM world_character_category WHERE id=?`).run(id);

const getCharacterLinks = (characterId) =>
  getDB().prepare(`
    SELECT wcl.id, wcl.object_ref, o.name, oc.category_name, uc.color_code
    FROM world_character_link wcl
    JOIN object o ON wcl.object_ref=o.id
    JOIN object_category oc ON o.category_id=oc.id
    LEFT JOIN use_color uc ON o.color=uc.id
    WHERE wcl.character_ref=? ORDER BY oc.category_name, o.name
  `).all(characterId);

const getLinkableCharacterObjects = (worldId, characterId) =>
  getDB().prepare(`
    SELECT o.id, o.name, oc.category_name, uc.color_code
    FROM object o
    JOIN object_category oc ON o.category_id=oc.id
    LEFT JOIN use_color uc ON o.color=uc.id
    WHERE oc.id IN (SELECT category_ref FROM world_character_category WHERE world_ref=?)
      AND o.id NOT IN (SELECT object_ref FROM world_character_link WHERE character_ref=?)
    ORDER BY oc.category_name, o.name
  `).all(worldId, characterId);

const addCharacterLink = (characterId, objectRef) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_character_link (character_ref,object_ref) VALUES (?,?)`).run(characterId, objectRef);

const removeCharacterLink = (linkId) =>
  getDB().prepare(`DELETE FROM world_character_link WHERE id=?`).run(linkId);

// ---- Categories / Objects ------------------------------------------------
const getWorldCategories = (worldId) =>
  getDB().prepare(`
    SELECT wc.id, wc.world_ref, wc.category_ref, oc.category_name, p.name AS project_name, uc.color_code
    FROM world_category wc
    JOIN object_category oc ON wc.category_ref=oc.id
    JOIN project p ON oc.project_id=p.id
    LEFT JOIN use_color uc ON oc.color=uc.id
    WHERE wc.world_ref=? ORDER BY p.name, oc.category_name
  `).all(worldId);

// object_category rows from the world's linked novels not yet added.
// forCharacters=true targets the world_character_category table instead.
const getLinkableCategories = (worldId, forCharacters) => {
  const targetTable = forCharacters ? 'world_character_category' : 'world_category';
  return getDB().prepare(`
    SELECT oc.id, oc.category_name, p.name AS project_name, uc.color_code
    FROM object_category oc
    JOIN project p ON oc.project_id=p.id
    LEFT JOIN use_color uc ON oc.color=uc.id
    WHERE oc.project_id IN (SELECT project_ref FROM world_novel WHERE world_ref=?)
      AND oc.id NOT IN (SELECT category_ref FROM ${targetTable} WHERE world_ref=?)
    ORDER BY p.name, oc.category_name
  `).all(worldId, worldId);
};

const addWorldCategory = (worldId, categoryRef) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_category (world_ref,category_ref) VALUES (?,?)`).run(worldId, categoryRef);

const removeWorldCategory = (id) =>
  getDB().prepare(`DELETE FROM world_category WHERE id=?`).run(id);

const getWorldObjects = (worldCategoryId) =>
  getDB().prepare(`
    SELECT wo.id, wo.category_ref, wo.object_ref, wo.symbol, o.name, uc.color_code
    FROM world_object wo
    JOIN object o ON wo.object_ref=o.id
    LEFT JOIN use_color uc ON o.color=uc.id
    WHERE wo.category_ref=? ORDER BY o.name
  `).all(worldCategoryId);

const getLinkableObjects = (worldCategoryId) =>
  getDB().prepare(`
    SELECT o.id, o.name, oc.category_name, uc.color_code
    FROM object o
    JOIN object_category oc ON o.category_id=oc.id
    LEFT JOIN use_color uc ON o.color=uc.id
    WHERE o.category_id = (SELECT category_ref FROM world_category WHERE id=?)
      AND o.id NOT IN (SELECT object_ref FROM world_object WHERE category_ref=?)
    ORDER BY o.name
  `).all(worldCategoryId, worldCategoryId);

const addWorldObject = (worldCategoryId, objectRef, symbol) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_object (category_ref,object_ref,symbol) VALUES (?,?,?)`).run(worldCategoryId, objectRef, symbol||null);

const updateWorldObjectSymbol = (id, symbol) =>
  getDB().prepare(`UPDATE world_object SET symbol=?,update_at=datetime('now') WHERE id=?`).run(symbol||null, id);

const removeWorldObject = (id) =>
  getDB().prepare(`DELETE FROM world_object WHERE id=?`).run(id);

// ---- Maps ----------------------------------------------------------------
const getWorldMaps = (worldId) =>
  getDB().prepare(`
    SELECT wm.id, wm.world_ref, wm.map_ref, m.map_name, p.name AS project_name, uc.color_code
    FROM world_map wm
    JOIN map m ON wm.map_ref=m.id
    JOIN project p ON m.project_id=p.id
    LEFT JOIN use_color uc ON m.color=uc.id
    WHERE wm.world_ref=? ORDER BY p.name, m.map_name
  `).all(worldId);

const getLinkableMaps = (worldId) =>
  getDB().prepare(`
    SELECT m.id, m.map_name, p.name AS project_name, uc.color_code
    FROM map m
    JOIN project p ON m.project_id=p.id
    LEFT JOIN use_color uc ON m.color=uc.id
    WHERE m.project_id IN (SELECT project_ref FROM world_novel WHERE world_ref=?)
      AND m.id NOT IN (SELECT map_ref FROM world_map WHERE world_ref=?)
    ORDER BY p.name, m.map_name
  `).all(worldId, worldId);

const addWorldMap = (worldId, mapRef) =>
  getDB().prepare(`INSERT OR IGNORE INTO world_map (world_ref,map_ref) VALUES (?,?)`).run(worldId, mapRef);

const removeWorldMap = (id) =>
  getDB().prepare(`DELETE FROM world_map WHERE id=?`).run(id);

// ---- Timeline ------------------------------------------------------------
const getWorldTimelines = (worldId) =>
  getDB().prepare(`SELECT * FROM world_timeline WHERE world_ref=? ORDER BY name`).all(worldId);

const createWorldTimeline = (worldId, name, worldMapRef) =>
  getDB().prepare(`INSERT INTO world_timeline (world_ref,name,world_map_ref) VALUES (?,?,?)`).run(worldId, name, worldMapRef||null).lastInsertRowid;

const updateWorldTimeline = (id, name, worldMapRef) =>
  getDB().prepare(`UPDATE world_timeline SET name=?,world_map_ref=?,update_at=datetime('now') WHERE id=?`).run(name, worldMapRef||null, id);

const deleteWorldTimeline = (id) =>
  getDB().prepare(`DELETE FROM world_timeline WHERE id=?`).run(id);

const getTimelineEvents = (timelineId) =>
  getDB().prepare(`
    SELECT e.id, e.timeline_ref, e.date_ref, d.day, d.month, d.years, d.hour, d.minute
    FROM world_timeline_event e
    JOIN world_timeline_date d ON e.date_ref=d.id
    WHERE e.timeline_ref=?
    ORDER BY d.years, d.month, d.day, d.hour, d.minute
  `).all(timelineId);

const createTimelineEvent = (timelineId, day, month, years, hour, minute) => {
  const d = getDB();
  d.prepare(`INSERT OR IGNORE INTO world_timeline_date (day,month,years,hour,minute) VALUES (?,?,?,?,?)`).run(day, month, years, hour||0, minute||0);
  const dateId = d.prepare(`SELECT id FROM world_timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?`).get(day, month, years, hour||0, minute||0).id;
  return d.prepare(`INSERT OR IGNORE INTO world_timeline_event (timeline_ref,date_ref) VALUES (?,?)`).run(timelineId, dateId).lastInsertRowid;
};

const deleteTimelineEvent = (id) =>
  getDB().prepare(`DELETE FROM world_timeline_event WHERE id=?`).run(id);

const getEventObjects = (eventId) =>
  getDB().prepare(`
    SELECT t.id, t.event_ref, t.world_object_ref, t.world_character_ref, t.point_ref,
           pt.x, pt.y,
           COALESCE(oo.name, wc.name) AS label,
           COALESCE(wo.symbol, wc.symbol) AS symbol,
           COALESCE(ucc.color_code, uco.color_code) AS color_code
    FROM world_timeline_object t
    LEFT JOIN world_timeline_point pt ON t.point_ref=pt.id
    LEFT JOIN world_object wo ON t.world_object_ref=wo.id
    LEFT JOIN object oo ON wo.object_ref=oo.id
    LEFT JOIN use_color uco ON oo.color=uco.id
    LEFT JOIN world_character wc ON t.world_character_ref=wc.id
    LEFT JOIN use_color ucc ON wc.color=ucc.id
    WHERE t.event_ref=? ORDER BY label
  `).all(eventId);

const getPlaceableObjects = (worldId) =>
  getDB().prepare(`
    SELECT wo.id, o.name, oc.category_name, uc.color_code
    FROM world_object wo
    JOIN world_category wcat ON wo.category_ref=wcat.id
    JOIN object o ON wo.object_ref=o.id
    JOIN object_category oc ON o.category_id=oc.id
    LEFT JOIN use_color uc ON o.color=uc.id
    WHERE wcat.world_ref=? ORDER BY o.name
  `).all(worldId);

const getPlaceableCharacters = (worldId) =>
  getDB().prepare(`
    SELECT c.id, c.name, c.symbol, uc.color_code
    FROM world_character c
    LEFT JOIN use_color uc ON c.color=uc.id
    WHERE c.world_ref=? ORDER BY c.name
  `).all(worldId);

const addEventObject = (eventId, worldObjectRef, worldCharacterRef, x, y) => {
  const d = getDB();
  const pointId = d.prepare(`INSERT INTO world_timeline_point (x,y) VALUES (?,?)`).run(x, y).lastInsertRowid;
  return d.prepare(`INSERT INTO world_timeline_object (event_ref,world_object_ref,world_character_ref,point_ref) VALUES (?,?,?,?)`)
    .run(eventId, worldObjectRef||null, worldCharacterRef||null, pointId).lastInsertRowid;
};

const updateEventObjectPoint = (timelineObjectId, x, y) =>
  getDB().prepare(`UPDATE world_timeline_point SET x=?,y=?,update_at=datetime('now') WHERE id=(SELECT point_ref FROM world_timeline_object WHERE id=?)`).run(x, y, timelineObjectId);

const removeEventObject = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT point_ref FROM world_timeline_object WHERE id=?`).get(id);
  d.prepare(`DELETE FROM world_timeline_object WHERE id=?`).run(id);
  if (row && row.point_ref) d.prepare(`DELETE FROM world_timeline_point WHERE id=?`).run(row.point_ref);
  return true;
};

module.exports = {
  getWorlds, getWorld, createWorld, updateWorld, deleteWorld,
  getWorldNovels, getLinkableProjects, addWorldNovel, removeWorldNovel,
  getWorldCharacters, createWorldCharacter, updateWorldCharacter, deleteWorldCharacter,
  getCharacterCategories, addCharacterCategory, removeCharacterCategory,
  getCharacterLinks, getLinkableCharacterObjects, addCharacterLink, removeCharacterLink,
  getWorldCategories, getLinkableCategories, addWorldCategory, removeWorldCategory,
  getWorldObjects, getLinkableObjects, addWorldObject, updateWorldObjectSymbol, removeWorldObject,
  getWorldMaps, getLinkableMaps, addWorldMap, removeWorldMap,
  getWorldTimelines, createWorldTimeline, updateWorldTimeline, deleteWorldTimeline,
  getTimelineEvents, createTimelineEvent, deleteTimelineEvent,
  getEventObjects, getPlaceableObjects, getPlaceableCharacters,
  addEventObject, updateEventObjectPoint, removeEventObject,
};
