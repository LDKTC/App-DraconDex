const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db;

function getDB() {
  if (!db) {
    const dbPath = path.join(path.dirname(app.getPath('userData')), 'novel-manager.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    // Avoid SQLITE_BUSY errors by setting a sensible busy timeout
    try { db.pragma('busy_timeout = 5000'); } catch (e) { /* ignore if unsupported */ }
    initDB();
  }
  return db;
}

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS use_color (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      color_code TEXT UNIQUE NOT NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_folder (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      folder_memo TEXT,
      folder_color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codename TEXT UNIQUE,
      name TEXT NOT NULL,
      project_memo TEXT,
      folder_id INTEGER REFERENCES project_folder(id) ON DELETE SET NULL,
      project_color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_description (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
      attribute_name TEXT,
      attribute_text TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS object_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_name, project_id)
    );

    CREATE TABLE IF NOT EXISTS object_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES object_category(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      attribute_type TEXT DEFAULT 'text',
      display_order INTEGER DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS object (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES object_category(id) ON DELETE CASCADE,
      color INTEGER REFERENCES use_color(id),
      note TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS object_attribute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      object_id INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
      template_id INTEGER NOT NULL REFERENCES object_template(id) ON DELETE CASCADE,
      attribute_value TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(object_id, template_id)
    );

    INSERT OR IGNORE INTO use_color (color_code) VALUES
      ('#6366f1'),('#8b5cf6'),('#ec4899'),('#f43f5e'),
      ('#f97316'),('#eab308'),('#22c55e'),('#06b6d4'),
      ('#3b82f6'),('#64748b'),('#a78bfa'),('#34d399'),
      ('#fb923c'),('#f472b6'),('#38bdf8'),('#a3e635');

    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      line_name TEXT,
      project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS timeline_date (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day INTEGER NOT NULL,
      month INTEGER NOT NULL,
      years INTEGER NOT NULL,
      hour INTEGER NOT NULL DEFAULT 0,
      minute INTEGER NOT NULL DEFAULT 0,
      UNIQUE(day,month,years,hour,minute)
    );

    CREATE TABLE IF NOT EXISTS timeline_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeline_id INTEGER NOT NULL REFERENCES timeline(id) ON DELETE CASCADE,
      event_name TEXT,
      start_at INTEGER NOT NULL REFERENCES timeline_date(id),
      end_at INTEGER REFERENCES timeline_date(id),
      color INTEGER REFERENCES use_color(id),
      story TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS map (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      map_name TEXT,
      project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS map_area (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      map_id INTEGER NOT NULL REFERENCES map(id) ON DELETE CASCADE,
      area_name TEXT,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS map_point (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area_id INTEGER NOT NULL REFERENCES map_area(id) ON DELETE CASCADE,
      point_order INTEGER NOT NULL DEFAULT 0,
      x REAL NOT NULL,
      y REAL NOT NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS relation_type (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relation_name TEXT NOT NULL UNIQUE,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS relation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      relation_type INTEGER REFERENCES relation_type(id),
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS relation_obob (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relation_id INTEGER NOT NULL REFERENCES relation(id) ON DELETE CASCADE,
      object_from INTEGER NOT NULL REFERENCES object(id),
      object_to INTEGER NOT NULL REFERENCES object(id)
    );

    CREATE TABLE IF NOT EXISTS relation_obtl (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relation_id INTEGER NOT NULL REFERENCES relation(id) ON DELETE CASCADE,
      object_from INTEGER NOT NULL REFERENCES object(id),
      timeline_to INTEGER NOT NULL REFERENCES timeline_event(id)
    );

    CREATE TABLE IF NOT EXISTS relation_tltl (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      relation_id INTEGER NOT NULL REFERENCES relation(id) ON DELETE CASCADE,
      timeline_from INTEGER NOT NULL REFERENCES timeline_event(id),
      timeline_to INTEGER NOT NULL REFERENCES timeline_event(id)
    );

    CREATE TABLE IF NOT EXISTS hashtag (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag_name TEXT NOT NULL UNIQUE,
      tag_color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    -- mapping tables for hashtags
    CREATE TABLE IF NOT EXISTS project_hashtag (
      project_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(project_id,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS object_hashtag (
      object_id INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(object_id,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS event_hashtag (
      event_id INTEGER NOT NULL REFERENCES timeline_event(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(event_id,hashtag_id)
    );
  `);
  if (!hasColumn(db, 'relation_type', 'color')) {
    try {
      db.prepare(`ALTER TABLE relation_type ADD COLUMN color INTEGER REFERENCES use_color(id)`).run();
    } catch (e) {
      // ignore if the column already exists or cannot be added
    }
  }
  const hasStoryColumn = db.prepare(`PRAGMA table_info(timeline_event)`).all().some(c => c.name === 'story');
  if (!hasStoryColumn) db.prepare(`ALTER TABLE timeline_event ADD COLUMN story TEXT`).run();
  
  const hasNoteColumn = db.prepare(`PRAGMA table_info(object)`).all().some(c => c.name === 'note');
  if (!hasNoteColumn) {
    try {
      db.prepare(`ALTER TABLE object ADD COLUMN note TEXT`).run();
    } catch (e) {
      // ignore if the column already exists
    }
  }
}

// ── Folder ──────────────────────────────────────────
const getFolders = () =>
  getDB().prepare(`SELECT pf.*, uc.color_code FROM project_folder pf
    LEFT JOIN use_color uc ON pf.folder_color = uc.id ORDER BY pf.name`).all();

const createFolder = (name, memo, colorId) =>
  getDB().prepare(`INSERT INTO project_folder (name, folder_memo, folder_color) VALUES (?,?,?)`).run(name, memo, colorId || null);

const updateFolder = (id, name, memo, colorId) =>
  getDB().prepare(`UPDATE project_folder SET name=?,folder_memo=?,folder_color=?,update_at=datetime('now') WHERE id=?`).run(name, memo, colorId || null, id);

const deleteFolder = (id) =>
  getDB().prepare(`DELETE FROM project_folder WHERE id=?`).run(id);

// ── Project ─────────────────────────────────────────
const getProjects = (folderId) => {
  const base = `SELECT p.*, uc.color_code FROM project p LEFT JOIN use_color uc ON p.project_color = uc.id`;
  if (folderId) return getDB().prepare(`${base} WHERE p.folder_id=? ORDER BY p.name`).all(folderId);
  return getDB().prepare(`${base} ORDER BY p.name`).all();
};

const getProject = (id) =>
  getDB().prepare(`SELECT p.*, uc.color_code FROM project p LEFT JOIN use_color uc ON p.project_color = uc.id WHERE p.id=?`).get(id);

const createProject = (data) =>
  getDB().prepare(`INSERT INTO project (codename,name,project_memo,folder_id,project_color) VALUES (?,?,?,?,?)`)
    .run(data.codename || null, data.name, data.memo || null, data.folderId || null, data.colorId || null);

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
      DELETE FROM relation
      WHERE id IN (
        SELECT ro.relation_id
        FROM relation_obob ro
        JOIN object o1 ON ro.object_from = o1.id
        WHERE o1.category_id = ?
        UNION
        SELECT ro.relation_id
        FROM relation_obob ro
        JOIN object o2 ON ro.object_to = o2.id
        WHERE o2.category_id = ?
        UNION
        SELECT rt.relation_id
        FROM relation_obtl rt
        JOIN object o ON rt.object_from = o.id
        WHERE o.category_id = ?
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
      DELETE FROM relation
      WHERE id IN (
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
    FROM object_attribute oa
    JOIN object o ON oa.object_id = o.id
    WHERE o.category_id = ?
  `).all(categoryId);

const upsertAttr = (objectId, templateId, value) =>
  getDB().prepare(`
    INSERT INTO object_attribute (object_id, template_id, attribute_value)
    VALUES (?,?,?)
    ON CONFLICT(object_id, template_id)
    DO UPDATE SET attribute_value=excluded.attribute_value, update_at=datetime('now')
  `).run(objectId, templateId, value);

// ── Colors ───────────────────────────────────────────
const getColors = () => getDB().prepare(`SELECT * FROM use_color ORDER BY id`).all();
const addColor  = (code) => getDB().prepare(`INSERT OR IGNORE INTO use_color (color_code) VALUES (?)`).run(code);
const markColorUsed = (id) =>
  getDB().prepare(`UPDATE use_color SET update_at=datetime('now') WHERE id=?`).run(id);
const getRecentColors = () =>
  getDB().prepare(`SELECT * FROM use_color ORDER BY update_at DESC LIMIT 10`).all();
const deleteColor = (id) => {
  const d = getDB();
  // Check if color is used anywhere
  const used = d.prepare(`
    SELECT 1 FROM (
      SELECT project_color FROM project WHERE project_color=?
      UNION ALL SELECT folder_color FROM project_folder WHERE folder_color=?
      UNION ALL SELECT color FROM object_category WHERE color=?
      UNION ALL SELECT color FROM object WHERE color=?
      UNION ALL SELECT color FROM timeline WHERE color=?
      UNION ALL SELECT color FROM timeline_event WHERE color=?
      UNION ALL SELECT color FROM relation WHERE color=?
      UNION ALL SELECT tag_color FROM hashtag WHERE tag_color=?
    ) LIMIT 1
  `).get(id,id,id,id,id,id,id,id);
  
  if (used) return false; // Color is in use, cannot delete
  d.prepare(`DELETE FROM use_color WHERE id=?`).run(id);
  return true;
};

// ── timeline ─────────────────────────────────────────
const getTimelines   = (pid) => getDB().prepare(`SELECT t.*, uc.color_code FROM timeline t LEFT JOIN use_color uc ON t.color=uc.id WHERE t.project_id=? ORDER BY t.line_name`).all(pid);
const createTimeline = (pid,n,c) => getDB().prepare(`INSERT INTO timeline (line_name,project_id,color) VALUES (?,?,?)`).run(n,pid,c||null);
const updateTimeline = (id,n,c) => getDB().prepare(`UPDATE timeline SET line_name=?,color=?,update_at=datetime('now') WHERE id=?`).run(n,c||null,id);
const deleteTimeline = (id) => getDB().prepare(`DELETE FROM timeline WHERE id=?`).run(id);

// ── timeline_date ────────────────────────────────────
const getOrCreateDate = (day,month,years,hour,minute) => {
  const d = getDB();
  d.prepare(`INSERT OR IGNORE INTO timeline_date (day,month,years,hour,minute) VALUES (?,?,?,?,?)`).run(day,month,years,hour||0,minute||0);
  return d.prepare(`SELECT id FROM timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?`).get(day,month,years,hour||0,minute||0).id;
};

// ── timeline_event ───────────────────────────────────
const getEvents = (tlid) => getDB().prepare(`
  SELECT te.*, te.story, uc.color_code,
    s.day s_day, s.month s_month, s.years s_years, s.hour s_hour, s.minute s_minute,
    e.day e_day, e.month e_month, e.years e_years, e.hour e_hour, e.minute e_minute
  FROM timeline_event te
  LEFT JOIN use_color uc ON te.color=uc.id
  LEFT JOIN timeline_date s ON te.start_at=s.id
  LEFT JOIN timeline_date e ON te.end_at=e.id
  WHERE te.timeline_id=?
  ORDER BY s.years,s.month,s.day,s.hour,s.minute
`).all(tlid);
const createEvent = (tlid,n,sid,eid,c,story) => getDB().prepare(`INSERT INTO timeline_event (timeline_id,event_name,start_at,end_at,color,story) VALUES (?,?,?,?,?,?)`).run(tlid,n,sid,eid||null,c||null,story||null);
const updateEvent = (id,n,sid,eid,c,story) => getDB().prepare(`UPDATE timeline_event SET event_name=?,start_at=?,end_at=?,color=?,story=?,update_at=datetime('now') WHERE id=?`).run(n,sid,eid||null,c||null,story||null,id);
const updateEventStory = (id,story) => getDB().prepare(`UPDATE timeline_event SET story=?, update_at=datetime('now') WHERE id=?`).run(story||null,id);
const deleteEvent = (id) => getDB().prepare(`DELETE FROM timeline_event WHERE id=?`).run(id);

const getMaps = (pid) => getDB().prepare(`
  SELECT m.*, uc.color_code
  FROM map m LEFT JOIN use_color uc ON m.color=uc.id
  WHERE m.project_id=? ORDER BY m.map_name
`).all(pid);
const createMap = (pid,n,c) => getDB().prepare(`INSERT INTO map (map_name,project_id,color) VALUES (?,?,?)`).run(n,pid,c||null);
const updateMap = (id,n,c) => getDB().prepare(`UPDATE map SET map_name=?,color=?,update_at=datetime('now') WHERE id=?`).run(n,c||null,id);
const deleteMap = (id) => getDB().prepare(`DELETE FROM map WHERE id=?`).run(id);

const getMapAreas = (mapId) => getDB().prepare(`
  SELECT a.*, uc.color_code
  FROM map_area a LEFT JOIN use_color uc ON a.color=uc.id
  WHERE a.map_id=? ORDER BY a.area_name
`).all(mapId);
const createMapArea = (mapId,n,c) => getDB().prepare(`INSERT INTO map_area (map_id,area_name,color) VALUES (?,?,?)`).run(mapId,n,c||null);
const updateMapArea = (id,n,c) => getDB().prepare(`UPDATE map_area SET area_name=?,color=?,update_at=datetime('now') WHERE id=?`).run(n,c||null,id);
const deleteMapArea = (id) => getDB().prepare(`DELETE FROM map_area WHERE id=?`).run(id);

const getMapAreaPoints = (areaId) => getDB().prepare(`
  SELECT id, area_id, point_order, x, y
  FROM map_point
  WHERE area_id=?
  ORDER BY point_order, id
`).all(areaId);
const setMapAreaPoints = (areaId, points=[]) => {
  const d = getDB();
  const tx = d.transaction((aid, list) => {
    d.prepare(`DELETE FROM map_point WHERE area_id=?`).run(aid);
    const ins = d.prepare(`INSERT INTO map_point (area_id,point_order,x,y) VALUES (?,?,?,?)`);
    list.forEach((p, idx) => ins.run(aid, idx, Number(p.x)||0, Number(p.y)||0));
  });
  tx(areaId, Array.isArray(points) ? points : []);
};

// ── relation helpers ─────────────────────────────────
const getProjectObjects = (pid) => getDB().prepare(`
  SELECT o.id, o.name, oc.category_name,
    uc.color_code,
    ucc.color_code AS category_color_code
  FROM object o JOIN object_category oc ON o.category_id=oc.id
  LEFT JOIN use_color uc ON o.color=uc.id
  LEFT JOIN use_color ucc ON oc.color=ucc.id
  WHERE o.project_id=? ORDER BY oc.category_name,o.name
`).all(pid);

const getProjectEvents = (pid) => getDB().prepare(`
  SELECT te.id, te.event_name, t.line_name,
    s.day s_day, s.month s_month, s.years s_years,
    uc.color_code, tlc.color_code AS timeline_color_code
  FROM timeline_event te
  JOIN timeline t ON te.timeline_id=t.id
  LEFT JOIN use_color uc ON te.color=uc.id
  LEFT JOIN use_color tlc ON t.color=tlc.id
  LEFT JOIN timeline_date s ON te.start_at=s.id
  WHERE t.project_id=?
  ORDER BY t.line_name,s.years,s.month,s.day
`).all(pid);

// ── relation_type ───────────────────────────────────
const getRelationTypes  = () => getDB().prepare(`SELECT rt.*, uc.color_code FROM relation_type rt LEFT JOIN use_color uc ON rt.color = uc.id ORDER BY rt.relation_name`).all();
const createRelationType = (n,c) => getDB().prepare(`INSERT INTO relation_type (relation_name,color) VALUES (?,?)`).run(n,c||null);
const updateRelationType = (id,n,c) => getDB().prepare(`UPDATE relation_type SET relation_name=?,color=?,update_at=datetime('now') WHERE id=?`).run(n,c||null,id);
const deleteRelationType = (id) => getDB().prepare(`DELETE FROM relation_type WHERE id=?`).run(id);

// ── relation_obob ────────────────────────────────────
const getRelationsOBOB = (pid) => getDB().prepare(`
  SELECT ro.id, r.id rel_id, rt.relation_name,
    rtc.color_code AS color_code,
    r.relation_type, r.color,
    o1.name from_name, oc1.category_name from_cat,
    o2.name to_name, oc2.category_name to_cat
  FROM relation_obob ro
  JOIN relation r ON ro.relation_id=r.id
  LEFT JOIN relation_type rt ON r.relation_type=rt.id
  LEFT JOIN use_color uc ON r.color=uc.id
  LEFT JOIN use_color rtc ON rt.color=rtc.id
  JOIN object o1 ON ro.object_from=o1.id JOIN object_category oc1 ON o1.category_id=oc1.id
  JOIN object o2 ON ro.object_to=o2.id JOIN object_category oc2 ON o2.category_id=oc2.id
  WHERE r.project_id=? ORDER BY rt.relation_name,o1.name
`).all(pid);
const createRelationOBOB = (pid,tid,c,from,to) => {
  const d = getDB();
  const r = d.prepare(`INSERT INTO relation (project_id,relation_type,color) VALUES (?,?,?)`).run(pid,tid||null,c||null);
  d.prepare(`INSERT INTO relation_obob (relation_id,object_from,object_to) VALUES (?,?,?)`).run(r.lastInsertRowid,from,to);
};
const deleteRelationOBOB = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT relation_id FROM relation_obob WHERE id=?`).get(id);
  d.prepare(`DELETE FROM relation_obob WHERE id=?`).run(id);
  if (row) d.prepare(`DELETE FROM relation WHERE id=?`).run(row.relation_id);
};

// ── relation_obtl ───────────────────────────────────
const getRelationsOBTL = (pid) => getDB().prepare(`
  SELECT ro.id, r.id rel_id, rt.relation_name,
    rtc.color_code AS color_code,
    r.relation_type, r.color,
    o.name from_name, oc.category_name from_cat,
    te.event_name to_name, t.line_name to_tl,
    s.day s_day, s.month s_month, s.years s_years
  FROM relation_obtl ro
  JOIN relation r ON ro.relation_id=r.id
  LEFT JOIN relation_type rt ON r.relation_type=rt.id
  LEFT JOIN use_color uc ON r.color=uc.id
  LEFT JOIN use_color rtc ON rt.color=rtc.id
  JOIN object o ON ro.object_from=o.id JOIN object_category oc ON o.category_id=oc.id
  JOIN timeline_event te ON ro.timeline_to=te.id JOIN timeline t ON te.timeline_id=t.id
  LEFT JOIN timeline_date s ON te.start_at=s.id
  WHERE r.project_id=? ORDER BY rt.relation_name,o.name
`).all(pid);
const createRelationOBTL = (pid,tid,c,from,to) => {
  const d = getDB();
  const r = d.prepare(`INSERT INTO relation (project_id,relation_type,color) VALUES (?,?,?)`).run(pid,tid||null,c||null);
  d.prepare(`INSERT INTO relation_obtl (relation_id,object_from,timeline_to) VALUES (?,?,?)`).run(r.lastInsertRowid,from,to);
};
const deleteRelationOBTL = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT relation_id FROM relation_obtl WHERE id=?`).get(id);
  d.prepare(`DELETE FROM relation_obtl WHERE id=?`).run(id);
  if (row) d.prepare(`DELETE FROM relation WHERE id=?`).run(row.relation_id);
};

// ── relation_tltl ───────────────────────────────────
const getRelationsTLTL = (pid) => getDB().prepare(`
  SELECT ro.id, r.id rel_id, rt.relation_name,
    rtc.color_code AS color_code,
    r.relation_type, r.color,
    te1.event_name from_name, t1.line_name from_tl,
    te2.event_name to_name, t2.line_name to_tl
  FROM relation_tltl ro
  JOIN relation r ON ro.relation_id=r.id
  LEFT JOIN relation_type rt ON r.relation_type=rt.id
  LEFT JOIN use_color uc ON r.color=uc.id
  LEFT JOIN use_color rtc ON rt.color=rtc.id
  JOIN timeline_event te1 ON ro.timeline_from=te1.id JOIN timeline t1 ON te1.timeline_id=t1.id
  JOIN timeline_event te2 ON ro.timeline_to=te2.id JOIN timeline t2 ON te2.timeline_id=t2.id
  WHERE r.project_id=? ORDER BY rt.relation_name
`).all(pid);
const updateRelation = (id, relationType, colorId) =>
  getDB().prepare(`UPDATE relation SET relation_type=?,color=? WHERE id=?`).run(relationType||null,colorId||null,id);
const createRelationTLTL = (pid,tid,c,from,to) => {
  const d = getDB();
  const r = d.prepare(`INSERT INTO relation (project_id,relation_type,color) VALUES (?,?,?)`).run(pid,tid||null,c||null);
  d.prepare(`INSERT INTO relation_tltl (relation_id,timeline_from,timeline_to) VALUES (?,?,?)`).run(r.lastInsertRowid,from,to);
};
const deleteRelationTLTL = (id) => {
  const d = getDB();
  const row = d.prepare(`SELECT relation_id FROM relation_tltl WHERE id=?`).get(id);
  d.prepare(`DELETE FROM relation_tltl WHERE id=?`).run(id);
  if (row) d.prepare(`DELETE FROM relation WHERE id=?`).run(row.relation_id);
};

// ── hashtag ──────────────────────────────────────────
const getHashtags   = () => getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h LEFT JOIN use_color uc ON h.tag_color=uc.id ORDER BY h.tag_name`).all();
const createHashtag = (n,c) => getDB().prepare(`INSERT INTO hashtag (tag_name,tag_color) VALUES (?,?)`).run(n,c||null);
const updateHashtag = (id,n,c) => getDB().prepare(`UPDATE hashtag SET tag_name=?,tag_color=?,update_at=datetime('now') WHERE id=?`).run(n,c||null,id);
const deleteHashtag = (id) => getDB().prepare(`DELETE FROM hashtag WHERE id=?`).run(id);

// ── Hashtag mappings ─────────────────────────────────
const getProjectTags = (projectId) => getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h
  LEFT JOIN use_color uc ON h.tag_color=uc.id
  JOIN project_hashtag ph ON h.id=ph.hashtag_id
  WHERE ph.project_id=? ORDER BY h.tag_name`).all(projectId);
const setProjectTags = (projectId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM project_hashtag WHERE project_id=?`).run(projectId);
  const ins = d.prepare(`INSERT INTO project_hashtag (project_id,hashtag_id) VALUES (?,?)`);
  for(const t of (tags||[])) ins.run(projectId, t);
  return true;
};
const addProjectTag = (projectId, tagId) => getDB().prepare(`INSERT OR IGNORE INTO project_hashtag (project_id,hashtag_id) VALUES (?,?)`).run(projectId, tagId);
const removeProjectTag = (projectId, tagId) => getDB().prepare(`DELETE FROM project_hashtag WHERE project_id=? AND hashtag_id=?`).run(projectId, tagId);

const getObjectTags = (objectId) => getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h
  LEFT JOIN use_color uc ON h.tag_color=uc.id
  JOIN object_hashtag oh ON h.id=oh.hashtag_id
  WHERE oh.object_id=? ORDER BY h.tag_name`).all(objectId);
const setObjectTags = (objectId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM object_hashtag WHERE object_id=?`).run(objectId);
  const ins = d.prepare(`INSERT INTO object_hashtag (object_id,hashtag_id) VALUES (?,?)`);
  for(const t of (tags||[])) ins.run(objectId, t);
  return true;
};
const addObjectTag = (objectId, tagId) => getDB().prepare(`INSERT OR IGNORE INTO object_hashtag (object_id,hashtag_id) VALUES (?,?)`).run(objectId, tagId);
const removeObjectTag = (objectId, tagId) => getDB().prepare(`DELETE FROM object_hashtag WHERE object_id=? AND hashtag_id=?`).run(objectId, tagId);

const getEventTags = (eventId) => getDB().prepare(`SELECT h.*, uc.color_code FROM hashtag h
  LEFT JOIN use_color uc ON h.tag_color=uc.id
  JOIN event_hashtag eh ON h.id=eh.hashtag_id
  WHERE eh.event_id=? ORDER BY h.tag_name`).all(eventId);
const setEventTags = (eventId, tags) => {
  const d = getDB();
  d.prepare(`DELETE FROM event_hashtag WHERE event_id=?`).run(eventId);
  const ins = d.prepare(`INSERT INTO event_hashtag (event_id,hashtag_id) VALUES (?,?)`);
  for(const t of (tags||[])) ins.run(eventId, t);
  return true;
};
const addEventTag = (eventId, tagId) => getDB().prepare(`INSERT OR IGNORE INTO event_hashtag (event_id,hashtag_id) VALUES (?,?)`).run(eventId, tagId);
const removeEventTag = (eventId, tagId) => getDB().prepare(`DELETE FROM event_hashtag WHERE event_id=? AND hashtag_id=?`).run(eventId, tagId);

// ── Search ───────────────────────────────────────────
const searchAll = (query) => {
  const d = getDB();
  const qStr = `%${query}%`;
  
  const projects = d.prepare(`
    SELECT p.*, uc.color_code 
    FROM project p 
    LEFT JOIN use_color uc ON p.project_color = uc.id 
    WHERE p.name LIKE ? OR p.codename LIKE ?
    ORDER BY p.name
  `).all(qStr, qStr);
  
  const objects = d.prepare(`
    SELECT DISTINCT o.*, uc.color_code, oc.category_name, p.name AS project_name
    FROM object o
    JOIN object_category oc ON o.category_id = oc.id
    JOIN project p ON o.project_id = p.id
    LEFT JOIN use_color uc ON o.color = uc.id
    LEFT JOIN object_hashtag oh ON oh.object_id = o.id
    LEFT JOIN hashtag h ON h.id = oh.hashtag_id
    WHERE o.name LIKE ? OR h.tag_name LIKE ?
    ORDER BY o.name
  `).all(qStr, qStr);
  
  const hashtags = d.prepare(`
    SELECT h.*, uc.color_code 
    FROM hashtag h 
    LEFT JOIN use_color uc ON h.tag_color = uc.id 
    WHERE h.tag_name LIKE ?
    ORDER BY h.tag_name
  `).all(qStr);
  
  return { projects, objects, hashtags };
};

const getDatabasePath = () => path.join(path.dirname(app.getPath('userData')), 'novel-manager.db');
const exportDatabaseTo = async (targetPath) => {
  const d = getDB();
  d.pragma('wal_checkpoint(FULL)');
  await d.backup(targetPath);
};

const hasTable = (conn, tableName) => !!conn.prepare(
  `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
).get(tableName);

const hasColumn = (conn, tableName, columnName) => {
  if (!hasTable(conn, tableName)) return false;
  return conn.prepare(`PRAGMA table_info(${tableName})`).all().some((c) => c.name === columnName);
};

function importDatabaseMerge(sourcePath) {
  const target = getDB();
  const source = new Database(sourcePath, { readonly: true, fileMustExist: true });

  const summary = {
    colors: 0, folders: 0, projects: 0, categories: 0, templates: 0,
    objects: 0, timelines: 0, events: 0, hashtags: 0, descriptions: 0,
    relationTypes: 0, relations: 0, mappings: 0,
  };

  const tx = target.transaction(() => {
    target.pragma('foreign_keys = OFF');

    if (hasTable(source, 'use_color')) {
      const rows = source.prepare(`SELECT color_code FROM use_color WHERE color_code IS NOT NULL`).all();
      const ins = target.prepare(`INSERT OR IGNORE INTO use_color (color_code) VALUES (?)`);
      for (const r of rows) summary.colors += ins.run(r.color_code).changes;
    }

    if (hasTable(source, 'project_folder')) {
      const rows = source.prepare(`SELECT name, folder_memo, folder_color FROM project_folder WHERE name IS NOT NULL`).all();
      const colorById = source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map());
      const ins = target.prepare(`INSERT OR IGNORE INTO project_folder (name, folder_memo, folder_color) VALUES (?,?,(SELECT id FROM use_color WHERE color_code=?))`);
      for (const r of rows) summary.folders += ins.run(r.name, r.folder_memo || null, colorById.get(r.folder_color) || null).changes;
    }

    if (hasTable(source, 'project')) {
      const rows = source.prepare(`SELECT codename, name, project_memo, folder_id, project_color FROM project WHERE name IS NOT NULL`).all();
      const colorById = hasTable(source, 'use_color')
        ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map())
        : new Map();
      const folderById = hasTable(source, 'project_folder')
        ? source.prepare(`SELECT id, name FROM project_folder`).all().reduce((m, r) => (m.set(r.id, r.name), m), new Map())
        : new Map();
      const findByCode = target.prepare(`SELECT id FROM project WHERE codename = ?`);
      const findByNameNoCode = target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name = ?`);
      const ins = target.prepare(`INSERT INTO project (codename, name, project_memo, folder_id, project_color) VALUES (?,?,?,(SELECT id FROM project_folder WHERE name=?),(SELECT id FROM use_color WHERE color_code=?))`);
      for (const r of rows) {
        const exists = r.codename ? findByCode.get(r.codename) : findByNameNoCode.get(r.name);
        if (exists) continue;
        summary.projects += ins.run(r.codename || null, r.name, r.project_memo || null, folderById.get(r.folder_id) || null, colorById.get(r.project_color) || null).changes;
      }
    }

    if (hasTable(source, 'project_description')) {
      const projectById = hasTable(source, 'project') ? source.prepare(`SELECT id, codename, name FROM project`).all() : [];
      const projKey = new Map(projectById.map((p) => [p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`]));
      const rows = source.prepare(`SELECT project_id, attribute_name, attribute_text FROM project_description`).all();
      for (const r of rows) {
        const key = projKey.get(r.project_id);
        if (!key) continue;
        const p = key.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(key.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(key.slice(5));
        if (!p) continue;
        const exists = target.prepare(`SELECT 1 FROM project_description WHERE project_id=? AND attribute_name IS ? AND attribute_text IS ?`).get(p.id, r.attribute_name || null, r.attribute_text || null);
        if (exists) continue;
        summary.descriptions += target.prepare(`INSERT INTO project_description (project_id, attribute_name, attribute_text) VALUES (?,?,?)`).run(p.id, r.attribute_name || null, r.attribute_text || null).changes;
      }
    }

    if (hasTable(source, 'object_category')) {
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const srcProjects = hasTable(source, 'project') ? source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map()) : new Map();
      const rows = source.prepare(`SELECT category_name, project_id, color FROM object_category`).all();
      for (const r of rows) {
        const pKey = srcProjects.get(r.project_id);
        if (!pKey) continue;
        const p = pKey.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(pKey.slice(5));
        if (!p) continue;
        summary.categories += target.prepare(`INSERT OR IGNORE INTO object_category (category_name, project_id, color) VALUES (?, ?, (SELECT id FROM use_color WHERE color_code=?))`).run(r.category_name, p.id, colorById.get(r.color) || null).changes;
      }
    }

    if (hasTable(source, 'object_template') && hasTable(source, 'object_category')) {
      const srcCats = source.prepare(`SELECT id, category_name, project_id FROM object_category`).all();
      const srcProjects = hasTable(source, 'project') ? source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map()) : new Map();
      const catKey = new Map(srcCats.map((c) => [c.id, `${srcProjects.get(c.project_id)}::${c.category_name}`]));
      const hasType = hasColumn(source, 'object_template', 'attribute_type');
      const rows = hasType
        ? source.prepare(`SELECT category_id, description, attribute_type FROM object_template`).all()
        : source.prepare(`SELECT category_id, description, 'text' AS attribute_type FROM object_template`).all();
      for (const r of rows) {
        const key = catKey.get(r.category_id);
        if (!key) continue;
        const [pKey, catName] = key.split('::');
        const p = pKey?.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get((pKey || '').slice(5));
        if (!p) continue;
        const c = target.prepare(`SELECT id FROM object_category WHERE project_id=? AND category_name=?`).get(p.id, catName);
        if (!c) continue;
        const exists = target.prepare(`SELECT 1 FROM object_template WHERE category_id=? AND description=? AND COALESCE(attribute_type,'text')=COALESCE(?,'text')`).get(c.id, r.description, r.attribute_type || 'text');
        if (exists) continue;
        summary.templates += target.prepare(`INSERT INTO object_template (category_id, description, attribute_type) VALUES (?,?,?)`).run(c.id, r.description, r.attribute_type || 'text').changes;
      }
    }

    if (hasTable(source, 'object') && hasTable(source, 'object_category')) {
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const srcProjects = hasTable(source, 'project') ? source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map()) : new Map();
      const srcCats = source.prepare(`SELECT id, category_name, project_id FROM object_category`).all();
      const catKey = new Map(srcCats.map((c) => [c.id, `${srcProjects.get(c.project_id)}::${c.category_name}`]));
      const rows = source.prepare(`SELECT name, project_id, category_id, color FROM object`).all();
      for (const r of rows) {
        const pKey = srcProjects.get(r.project_id);
        const cKey = catKey.get(r.category_id);
        if (!pKey || !cKey) continue;
        const p = pKey.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(pKey.slice(5));
        if (!p) continue;
        const catName = cKey.split('::')[1];
        const c = target.prepare(`SELECT id FROM object_category WHERE project_id=? AND category_name=?`).get(p.id, catName);
        if (!c) continue;
        const exists = target.prepare(`SELECT 1 FROM object WHERE name=? AND project_id=? AND category_id=?`).get(r.name, p.id, c.id);
        if (exists) continue;
        summary.objects += target.prepare(`INSERT INTO object (name, project_id, category_id, color) VALUES (?, ?, ?, (SELECT id FROM use_color WHERE color_code=?))`).run(r.name, p.id, c.id, colorById.get(r.color) || null).changes;
      }
    }

    if (hasTable(source, 'timeline')) {
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const srcProjects = hasTable(source, 'project') ? source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map()) : new Map();
      const rows = source.prepare(`SELECT line_name, project_id, color FROM timeline`).all();
      for (const r of rows) {
        const pKey = srcProjects.get(r.project_id);
        if (!pKey) continue;
        const p = pKey.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(pKey.slice(5));
        if (!p) continue;
        const exists = target.prepare(`SELECT 1 FROM timeline WHERE project_id=? AND line_name=?`).get(p.id, r.line_name || null);
        if (exists) continue;
        summary.timelines += target.prepare(`INSERT INTO timeline (line_name, project_id, color) VALUES (?, ?, (SELECT id FROM use_color WHERE color_code=?))`).run(r.line_name || null, p.id, colorById.get(r.color) || null).changes;
      }
    }

    if (hasTable(source, 'timeline_date')) {
      const rows = source.prepare(`SELECT day, month, years, COALESCE(hour,0) AS hour, COALESCE(minute,0) AS minute FROM timeline_date`).all();
      const ins = target.prepare(`INSERT OR IGNORE INTO timeline_date (day,month,years,hour,minute) VALUES (?,?,?,?,?)`);
      for (const r of rows) ins.run(r.day, r.month, r.years, r.hour, r.minute);
    }

    if (hasTable(source, 'timeline_event') && hasTable(source, 'timeline_date') && hasTable(source, 'timeline')) {
      const hasStory = hasColumn(source, 'timeline_event', 'story');
      const hasEnd = hasColumn(source, 'timeline_event', 'end_at');
      const dateRows = source.prepare(`SELECT id, day, month, years, COALESCE(hour,0) AS hour, COALESCE(minute,0) AS minute FROM timeline_date`).all().reduce((m, d) => (m.set(d.id, d), m), new Map());
      const srcProjects = hasTable(source, 'project') ? source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map()) : new Map();
      const srcTl = source.prepare(`SELECT id, line_name, project_id FROM timeline`).all().reduce((m, t) => (m.set(t.id, { line_name: t.line_name, pKey: srcProjects.get(t.project_id) }), m), new Map());
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const sql = `SELECT id, timeline_id, event_name, start_at, ${hasEnd ? 'end_at' : 'NULL AS end_at'}, color, ${hasStory ? 'story' : 'NULL AS story'} FROM timeline_event`;
      const rows = source.prepare(sql).all();
      for (const r of rows) {
        const tlSrc = srcTl.get(r.timeline_id);
        const sDate = dateRows.get(r.start_at);
        if (!tlSrc || !sDate) continue;
        const p = tlSrc.pKey?.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(tlSrc.pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get((tlSrc.pKey || '').slice(5));
        if (!p) continue;
        const t = target.prepare(`SELECT id FROM timeline WHERE project_id=? AND line_name=?`).get(p.id, tlSrc.line_name);
        if (!t) continue;
        const sId = getOrCreateDate(sDate.day, sDate.month, sDate.years, sDate.hour, sDate.minute);
        let eId = null;
        if (r.end_at && dateRows.has(r.end_at)) {
          const ed = dateRows.get(r.end_at);
          eId = getOrCreateDate(ed.day, ed.month, ed.years, ed.hour, ed.minute);
        }
        const exists = target.prepare(`SELECT 1 FROM timeline_event WHERE timeline_id=? AND COALESCE(event_name,'')=COALESCE(?,'') AND start_at=? AND COALESCE(end_at,0)=COALESCE(?,0)`).get(t.id, r.event_name || null, sId, eId || null);
        if (exists) continue;
        summary.events += target.prepare(`INSERT INTO timeline_event (timeline_id,event_name,start_at,end_at,color,story) VALUES (?,?,?,?,(SELECT id FROM use_color WHERE color_code=?),?)`).run(t.id, r.event_name || null, sId, eId, colorById.get(r.color) || null, r.story || null).changes;
      }
    }

    if (hasTable(source, 'hashtag')) {
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const hasTagColor = hasColumn(source, 'hashtag', 'tag_color');
      const rows = hasTagColor ? source.prepare(`SELECT tag_name, tag_color FROM hashtag`).all() : source.prepare(`SELECT tag_name, NULL AS tag_color FROM hashtag`).all();
      for (const r of rows) summary.hashtags += target.prepare(`INSERT OR IGNORE INTO hashtag (tag_name, tag_color) VALUES (?, (SELECT id FROM use_color WHERE color_code=?))`).run(r.tag_name, colorById.get(r.tag_color) || null).changes;
    }

    if (hasTable(source, 'object_attribute') && hasTable(source, 'object') && hasTable(source, 'object_template') && hasTable(source, 'object_category') && hasTable(source, 'project')) {
      const srcProjects = source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map());
      const srcCats = source.prepare(`SELECT id, category_name, project_id FROM object_category`).all().reduce((m, c) => (m.set(c.id, { category_name: c.category_name, pKey: srcProjects.get(c.project_id) }), m), new Map());
      const srcObjs = source.prepare(`SELECT id, name, project_id, category_id FROM object`).all().reduce((m, o) => (m.set(o.id, { name: o.name, pKey: srcProjects.get(o.project_id), cat: srcCats.get(o.category_id)?.category_name }), m), new Map());
      const srcTpl = source.prepare(`SELECT ot.id, ot.description, COALESCE(ot.attribute_type,'text') AS attribute_type, oc.category_name, oc.project_id FROM object_template ot JOIN object_category oc ON ot.category_id=oc.id`).all().reduce((m, t) => (m.set(t.id, { description: t.description, attribute_type: t.attribute_type, category_name: t.category_name, pKey: srcProjects.get(t.project_id) }), m), new Map());
      const rows = source.prepare(`SELECT object_id, template_id, attribute_value FROM object_attribute`).all();
      for (const r of rows) {
        const so = srcObjs.get(r.object_id);
        const st = srcTpl.get(r.template_id);
        if (!so || !st || so.pKey !== st.pKey || so.cat !== st.category_name) continue;
        const p = so.pKey.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(so.pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(so.pKey.slice(5));
        if (!p) continue;
        const c = target.prepare(`SELECT id FROM object_category WHERE project_id=? AND category_name=?`).get(p.id, so.cat);
        if (!c) continue;
        const o = target.prepare(`SELECT id FROM object WHERE name=? AND project_id=? AND category_id=?`).get(so.name, p.id, c.id);
        const t = target.prepare(`SELECT id FROM object_template WHERE category_id=? AND description=? AND COALESCE(attribute_type,'text')=?`).get(c.id, st.description, st.attribute_type);
        if (!o || !t) continue;
        summary.mappings += target.prepare(`INSERT OR IGNORE INTO object_attribute (object_id, template_id, attribute_value) VALUES (?,?,?)`).run(o.id, t.id, r.attribute_value || null).changes;
      }
    }

    if (hasTable(source, 'project_hashtag') && hasTable(source, 'project') && hasTable(source, 'hashtag')) {
      const srcProjects = source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map());
      const srcTags = source.prepare(`SELECT id, tag_name FROM hashtag`).all().reduce((m, t) => (m.set(t.id, t.tag_name), m), new Map());
      const rows = source.prepare(`SELECT project_id, hashtag_id FROM project_hashtag`).all();
      for (const r of rows) {
        const pKey = srcProjects.get(r.project_id);
        const tagName = srcTags.get(r.hashtag_id);
        if (!pKey || !tagName) continue;
        const p = pKey.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(pKey.slice(5));
        const t = target.prepare(`SELECT id FROM hashtag WHERE tag_name=?`).get(tagName);
        if (!p || !t) continue;
        summary.mappings += target.prepare(`INSERT OR IGNORE INTO project_hashtag (project_id, hashtag_id) VALUES (?,?)`).run(p.id, t.id).changes;
      }
    }

    if (hasTable(source, 'object_hashtag') && hasTable(source, 'object') && hasTable(source, 'object_category') && hasTable(source, 'project') && hasTable(source, 'hashtag')) {
      const srcProjects = source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map());
      const srcCats = source.prepare(`SELECT id, category_name, project_id FROM object_category`).all().reduce((m, c) => (m.set(c.id, { category_name: c.category_name, pKey: srcProjects.get(c.project_id) }), m), new Map());
      const srcObjs = source.prepare(`SELECT id, name, project_id, category_id FROM object`).all().reduce((m, o) => (m.set(o.id, { name: o.name, pKey: srcProjects.get(o.project_id), cat: srcCats.get(o.category_id)?.category_name }), m), new Map());
      const srcTags = source.prepare(`SELECT id, tag_name FROM hashtag`).all().reduce((m, t) => (m.set(t.id, t.tag_name), m), new Map());
      const rows = source.prepare(`SELECT object_id, hashtag_id FROM object_hashtag`).all();
      for (const r of rows) {
        const so = srcObjs.get(r.object_id);
        const tagName = srcTags.get(r.hashtag_id);
        if (!so || !tagName) continue;
        const p = so.pKey.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(so.pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(so.pKey.slice(5));
        if (!p) continue;
        const c = target.prepare(`SELECT id FROM object_category WHERE project_id=? AND category_name=?`).get(p.id, so.cat);
        const o = c ? target.prepare(`SELECT id FROM object WHERE name=? AND project_id=? AND category_id=?`).get(so.name, p.id, c.id) : null;
        const t = target.prepare(`SELECT id FROM hashtag WHERE tag_name=?`).get(tagName);
        if (!o || !t) continue;
        summary.mappings += target.prepare(`INSERT OR IGNORE INTO object_hashtag (object_id, hashtag_id) VALUES (?,?)`).run(o.id, t.id).changes;
      }
    }

    if (hasTable(source, 'event_hashtag') && hasTable(source, 'timeline_event') && hasTable(source, 'timeline') && hasTable(source, 'timeline_date') && hasTable(source, 'project') && hasTable(source, 'hashtag')) {
      const srcProjects = source.prepare(`SELECT id, codename, name FROM project`).all().reduce((m, p) => (m.set(p.id, p.codename ? `code:${p.codename}` : `name:${p.name}`), m), new Map());
      const srcTl = source.prepare(`SELECT id, line_name, project_id FROM timeline`).all().reduce((m, t) => (m.set(t.id, { line_name: t.line_name, pKey: srcProjects.get(t.project_id) }), m), new Map());
      const srcDate = source.prepare(`SELECT id, day, month, years, COALESCE(hour,0) AS hour, COALESCE(minute,0) AS minute FROM timeline_date`).all().reduce((m, d) => (m.set(d.id, d), m), new Map());
      const srcEvent = source.prepare(`SELECT id, timeline_id, event_name, start_at, COALESCE(end_at,0) AS end_at FROM timeline_event`).all().reduce((m, e) => (m.set(e.id, e), m), new Map());
      const srcTags = source.prepare(`SELECT id, tag_name FROM hashtag`).all().reduce((m, t) => (m.set(t.id, t.tag_name), m), new Map());
      const rows = source.prepare(`SELECT event_id, hashtag_id FROM event_hashtag`).all();
      for (const r of rows) {
        const se = srcEvent.get(r.event_id);
        const tagName = srcTags.get(r.hashtag_id);
        if (!se || !tagName) continue;
        const tl = srcTl.get(se.timeline_id);
        const sd = srcDate.get(se.start_at);
        if (!tl || !sd) continue;
        const p = tl.pKey.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(tl.pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get(tl.pKey.slice(5));
        if (!p) continue;
        const tline = target.prepare(`SELECT id FROM timeline WHERE project_id=? AND line_name=?`).get(p.id, tl.line_name);
        if (!tline) continue;
        const sid = target.prepare(`SELECT id FROM timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?`).get(sd.day, sd.month, sd.years, sd.hour, sd.minute);
        if (!sid) continue;
        const ev = target.prepare(`SELECT id FROM timeline_event WHERE timeline_id=? AND COALESCE(event_name,'')=COALESCE(?,'') AND start_at=?`).get(tline.id, se.event_name || null, sid.id);
        const tg = target.prepare(`SELECT id FROM hashtag WHERE tag_name=?`).get(tagName);
        if (!ev || !tg) continue;
        summary.mappings += target.prepare(`INSERT OR IGNORE INTO event_hashtag (event_id, hashtag_id) VALUES (?,?)`).run(ev.id, tg.id).changes;
      }
    }

    if (hasTable(source, 'relation_type')) {
      const rows = source.prepare(`SELECT relation_name FROM relation_type`).all();
      for (const r of rows) summary.relationTypes += target.prepare(`INSERT OR IGNORE INTO relation_type (relation_name) VALUES (?)`).run(r.relation_name).changes;
    }

    target.pragma('foreign_keys = ON');
  });

  try {
    tx();
    return summary;
  } finally {
    source.close();
  }
}

module.exports = {
  getDatabasePath, exportDatabaseTo, importDatabaseMerge,
  getFolders, createFolder, updateFolder, deleteFolder,
  getProjects, getProject, createProject, updateProject, deleteProject,
  getProjectDesc, addProjectDesc, updateProjectDesc, deleteProjectDesc,
  getCategories, createCategory, updateCategory, deleteCategory,
  getTemplates, createTemplate, updateTemplate, deleteTemplate,
  getObjects, getObject, createObject, updateObject, updateObjectNote, deleteObject,
  getObjectAttrs, upsertAttr, getCategoryAttrs,
  getColors, addColor, markColorUsed, getRecentColors, deleteColor,
  getTimelines, createTimeline, updateTimeline, deleteTimeline,
  getOrCreateDate, getEvents, createEvent, updateEvent, updateEventStory, deleteEvent,
  getMaps, createMap, updateMap, deleteMap,
  getMapAreas, createMapArea, updateMapArea, deleteMapArea,
  getMapAreaPoints, setMapAreaPoints,
  getProjectObjects, getProjectEvents,
  updateRelation,
  getRelationTypes, createRelationType, updateRelationType, deleteRelationType,
  getRelationsOBOB, createRelationOBOB, deleteRelationOBOB,
  getRelationsOBTL, createRelationOBTL, deleteRelationOBTL,
  getRelationsTLTL, createRelationTLTL, deleteRelationTLTL,
  getHashtags, createHashtag, updateHashtag, deleteHashtag,
  getProjectTags, setProjectTags, addProjectTag, removeProjectTag,
  getObjectTags, setObjectTags, addObjectTag, removeObjectTag,
  getEventTags, setEventTags, addEventTag, removeEventTag,
  searchAll,
};

