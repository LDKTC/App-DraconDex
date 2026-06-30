'use strict';
const { Database: _RawDatabase } = require('node-sqlite3-wasm');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function adaptDb(rawDb) {
  const origPrepare = rawDb.prepare.bind(rawDb);
  rawDb.prepare = (sql) => {
    const stmt = origPrepare(sql);
    return {
      all: (...args) => stmt.all(args),
      get: (...args) => {
        const r = stmt.get(args);
        return r === null ? undefined : r;
      },
      run: (...args) => stmt.run(args),
    };
  };
  rawDb.transaction = (fn) => (...args) => {
    rawDb.exec('BEGIN');
    try {
      const result = fn(...args);
      rawDb.exec('COMMIT');
      return result;
    } catch (e) {
      try { rawDb.exec('ROLLBACK'); } catch (_) {}
      throw e;
    }
  };
  return rawDb;
}

let db;

function getDB() {
  if (!db) {
    const dbDir = path.dirname(app.getPath('userData'));
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    const dbPath = path.join(dbDir, 'novel-manager.db');
    if (fs.existsSync(dbPath) && !fs.existsSync(dbPath + '-wal')) {
      try {
        const hdr = Buffer.alloc(2);
        const hfd = fs.openSync(dbPath, 'r+');
        fs.readSync(hfd, hdr, 0, 2, 18);
        if (hdr[0] === 2 || hdr[1] === 2) {
          hdr[0] = 1; hdr[1] = 1;
          fs.writeSync(hfd, hdr, 0, 2, 18);
          fs.fsyncSync(hfd);
        }
        fs.closeSync(hfd);
      } catch (_) {}
    }
    try { fs.rmSync(dbPath + '.lock', { recursive: true, force: true }); } catch (_) {}
    db = adaptDb(new _RawDatabase(dbPath));
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA journal_mode = DELETE");
    db.exec("PRAGMA foreign_keys = ON");
    initDB();
  }
  return db;
}

function hasTable(conn, tableName) {
  return !!conn.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
}

function hasColumn(conn, tableName, columnName) {
  if (!hasTable(conn, tableName)) return false;
  return conn.prepare(`PRAGMA table_info(${tableName})`).all().some((c) => c.name === columnName);
}

function initDB() {
  // One-time migration: clean-replace the legacy Navigator (v2.2) schema with
  // the new v2.5.2 "World" schema. Detected by the legacy `world_cat_object`
  // table / the old `world_project.color_ref` column (now `color`). Old
  // navigator data is intentionally dropped; the new tables are recreated by
  // the CREATE IF NOT EXISTS block below.
  try {
    const legacyNav =
      hasTable(db, 'world_cat_object') ||
      (hasColumn(db, 'world_project', 'color_ref') && !hasColumn(db, 'world_project', 'codename'));
    if (legacyNav) {
      db.exec(`PRAGMA foreign_keys = OFF`);
      db.exec(`
        DROP TABLE IF EXISTS world_maptl_obj;
        DROP TABLE IF EXISTS world_maptl_event;
        DROP TABLE IF EXISTS world_map_timeline;
        DROP TABLE IF EXISTS world_map_link;
        DROP TABLE IF EXISTS world_cat_object;
        DROP TABLE IF EXISTS world_cat_link;
        DROP TABLE IF EXISTS world_obj_hashtag;
        DROP TABLE IF EXISTS world_char_hashtag;
        DROP TABLE IF EXISTS world_char_link;
        DROP TABLE IF EXISTS world_character;
        DROP TABLE IF EXISTS world_category;
        DROP TABLE IF EXISTS world_novel_link;
        DROP TABLE IF EXISTS world_description;
        DROP TABLE IF EXISTS world_project_hashtag;
        DROP TABLE IF EXISTS world_map;
        DROP TABLE IF EXISTS world_project;
      `);
      db.exec(`PRAGMA foreign_keys = ON`);
    }
  } catch (_) {}

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

    -- Navigator (v2.5.2 "World") --
    CREATE TABLE IF NOT EXISTS world_project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codename TEXT UNIQUE,
      name TEXT NOT NULL,
      memo TEXT,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS world_novel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      project_ref INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(world_ref,project_ref)
    );

    CREATE TABLE IF NOT EXISTS world_character (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      symbol TEXT,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS world_character_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      category_ref INTEGER NOT NULL REFERENCES object_category(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(world_ref,category_ref)
    );

    CREATE TABLE IF NOT EXISTS world_character_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_ref INTEGER NOT NULL REFERENCES world_character(id) ON DELETE CASCADE,
      object_ref INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(character_ref,object_ref)
    );

    CREATE TABLE IF NOT EXISTS world_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      category_ref INTEGER NOT NULL REFERENCES object_category(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(world_ref,category_ref)
    );

    CREATE TABLE IF NOT EXISTS world_object (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_ref INTEGER NOT NULL REFERENCES world_category(id) ON DELETE CASCADE,
      object_ref INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
      symbol TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_ref,object_ref)
    );

    CREATE TABLE IF NOT EXISTS world_map (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      map_ref INTEGER NOT NULL REFERENCES map(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(world_ref,map_ref)
    );

    CREATE TABLE IF NOT EXISTS world_map_area (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_map_ref INTEGER NOT NULL REFERENCES world_map(id) ON DELETE CASCADE,
      area_ref INTEGER NOT NULL REFERENCES map_area(id) ON DELETE CASCADE,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(world_map_ref,area_ref)
    );

    CREATE TABLE IF NOT EXISTS world_map_point (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_map_area_ref INTEGER NOT NULL REFERENCES world_map_area(id) ON DELETE CASCADE,
      point_ref INTEGER NOT NULL REFERENCES map_point(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(world_map_area_ref,point_ref)
    );

    CREATE TABLE IF NOT EXISTS world_timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      world_map_ref INTEGER REFERENCES world_map(id) ON DELETE SET NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS world_timeline_date (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day INTEGER NOT NULL,
      month INTEGER NOT NULL,
      years INTEGER NOT NULL,
      hour INTEGER NOT NULL DEFAULT 0,
      minute INTEGER NOT NULL DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(day,month,years,hour,minute)
    );

    CREATE TABLE IF NOT EXISTS world_timeline_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeline_ref INTEGER NOT NULL REFERENCES world_timeline(id) ON DELETE CASCADE,
      date_ref INTEGER NOT NULL REFERENCES world_timeline_date(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(timeline_ref,date_ref)
    );

    CREATE TABLE IF NOT EXISTS world_timeline_point (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x REAL NOT NULL,
      y REAL NOT NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS world_timeline_object (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_ref INTEGER NOT NULL REFERENCES world_timeline_event(id) ON DELETE CASCADE,
      world_object_ref INTEGER REFERENCES world_object(id) ON DELETE CASCADE,
      world_character_ref INTEGER REFERENCES world_character(id) ON DELETE CASCADE,
      point_ref INTEGER REFERENCES world_timeline_point(id) ON DELETE SET NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK ((world_object_ref IS NOT NULL) + (world_character_ref IS NOT NULL) = 1),
      UNIQUE(event_ref,point_ref)
    );

    -- Hero (v2.3) --
    CREATE TABLE IF NOT EXISTS game_project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      memo TEXT,
      color_ref INTEGER REFERENCES use_color(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_description (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_novel_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      project_ref INTEGER REFERENCES project(id) ON DELETE SET NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(game_ref)
    );

    CREATE TABLE IF NOT EXISTS game_character (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      memo TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_char_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_ref INTEGER NOT NULL REFERENCES game_character(id) ON DELETE CASCADE,
      project_ref INTEGER REFERENCES project(id) ON DELETE SET NULL,
      category_ref INTEGER REFERENCES object_category(id) ON DELETE SET NULL,
      object_ref INTEGER REFERENCES object(id) ON DELETE SET NULL,
      UNIQUE(char_ref)
    );

    CREATE TABLE IF NOT EXISTS game_stat_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_ref INTEGER NOT NULL REFERENCES game_character(id) ON DELETE CASCADE,
      stat_name TEXT NOT NULL,
      stat_type TEXT DEFAULT 'number',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_stat_levelup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_ref INTEGER NOT NULL REFERENCES game_character(id) ON DELETE CASCADE,
      template_ref INTEGER NOT NULL REFERENCES game_stat_template(id) ON DELETE CASCADE,
      level INTEGER NOT NULL DEFAULT 1,
      value TEXT,
      UNIQUE(char_ref,template_ref,level)
    );

    CREATE TABLE IF NOT EXISTS game_char_hashtag (
      char_id INTEGER NOT NULL REFERENCES game_character(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(char_id,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS game_item_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      memo TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_item_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_cat_ref INTEGER NOT NULL REFERENCES game_item_category(id) ON DELETE CASCADE,
      attr_name TEXT NOT NULL,
      attr_type TEXT DEFAULT 'text',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_cat_ref INTEGER NOT NULL REFERENCES game_item_category(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      symbol TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_item_attr (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_ref INTEGER NOT NULL REFERENCES game_item(id) ON DELETE CASCADE,
      template_ref INTEGER NOT NULL REFERENCES game_item_template(id) ON DELETE CASCADE,
      value TEXT,
      UNIQUE(item_ref,template_ref)
    );

    CREATE TABLE IF NOT EXISTS game_item_hashtag (
      item_id INTEGER NOT NULL REFERENCES game_item(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(item_id,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS game_story (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      memo TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_dialogue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_ref INTEGER NOT NULL REFERENCES game_story(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      memo TEXT,
      pos_x REAL DEFAULT 0,
      pos_y REAL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_dial_next (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_ref INTEGER NOT NULL REFERENCES game_dialogue(id) ON DELETE CASCADE,
      to_ref INTEGER NOT NULL REFERENCES game_dialogue(id) ON DELETE CASCADE,
      condition TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(from_ref,to_ref)
    );

    CREATE TABLE IF NOT EXISTS game_dial_line (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dial_ref INTEGER NOT NULL REFERENCES game_dialogue(id) ON DELETE CASCADE,
      speaker_ref INTEGER REFERENCES game_character(id) ON DELETE SET NULL,
      text TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_func_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      function_type TEXT DEFAULT 'general',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_function (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      func_cat_ref INTEGER NOT NULL REFERENCES game_func_category(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      function_template TEXT,
      conditions_json TEXT,
      effects_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_project_hashtag (
      game_id INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(game_id,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS library_project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      memo TEXT,
      color_ref INTEGER REFERENCES use_color(id),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS library_description (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      library_ref INTEGER NOT NULL REFERENCES library_project(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS library_world_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      library_ref INTEGER NOT NULL REFERENCES library_project(id) ON DELETE CASCADE,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(library_ref,world_ref)
    );
    CREATE TABLE IF NOT EXISTS library_series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      library_ref INTEGER NOT NULL REFERENCES library_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      memo TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS series_description (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_ref INTEGER NOT NULL REFERENCES library_series(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS series_novel_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_ref INTEGER NOT NULL REFERENCES library_series(id) ON DELETE CASCADE,
      project_ref INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(series_ref,project_ref)
    );
    CREATE TABLE IF NOT EXISTS series_char_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_ref INTEGER NOT NULL REFERENCES library_series(id) ON DELETE CASCADE,
      object_ref INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
      UNIQUE(series_ref,object_ref)
    );
    CREATE TABLE IF NOT EXISTS series_object_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_ref INTEGER NOT NULL REFERENCES library_series(id) ON DELETE CASCADE,
      object_ref INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
      UNIQUE(series_ref,object_ref)
    );
    CREATE TABLE IF NOT EXISTS series_hashtag (
      series_ref INTEGER NOT NULL REFERENCES library_series(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(series_ref,hashtag_id)
    );
    CREATE TABLE IF NOT EXISTS library_document (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_ref INTEGER NOT NULL REFERENCES library_series(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      content_json TEXT DEFAULT '[]',
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS document_hashtag (
      document_ref INTEGER NOT NULL REFERENCES library_document(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(document_ref,hashtag_id)
    );
  `);

  if (!hasColumn(db, 'relation_type', 'color')) {
    try { db.prepare(`ALTER TABLE relation_type ADD COLUMN color INTEGER REFERENCES use_color(id)`).run(); } catch (_) {}
  }
  const hasStory = db.prepare(`PRAGMA table_info(timeline_event)`).all().some(c => c.name === 'story');
  if (!hasStory) db.prepare(`ALTER TABLE timeline_event ADD COLUMN story TEXT`).run();
  const hasNote = db.prepare(`PRAGMA table_info(object)`).all().some(c => c.name === 'note');
  if (!hasNote) { try { db.prepare(`ALTER TABLE object ADD COLUMN note TEXT`).run(); } catch (_) {} }
}

const getDatabasePath = () => path.join(path.dirname(app.getPath('userData')), 'novel-manager.db');
const exportDatabaseTo = async (targetPath) => { fs.copyFileSync(getDatabasePath(), targetPath); };

function importDatabaseMerge(sourcePath) {
  const target = getDB();
  const source = adaptDb(new _RawDatabase(sourcePath, { readOnly: true }));

  const summary = {
    colors: 0, folders: 0, projects: 0, categories: 0, templates: 0,
    objects: 0, timelines: 0, events: 0, hashtags: 0, descriptions: 0,
    relationTypes: 0, relations: 0, mappings: 0,
  };

  const tx = target.transaction(() => {
    target.exec("PRAGMA foreign_keys = OFF");

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
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const folderById = hasTable(source, 'project_folder') ? source.prepare(`SELECT id, name FROM project_folder`).all().reduce((m, r) => (m.set(r.id, r.name), m), new Map()) : new Map();
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
      const rows = hasType ? source.prepare(`SELECT category_id, description, attribute_type FROM object_template`).all() : source.prepare(`SELECT category_id, description, 'text' AS attribute_type FROM object_template`).all();
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

      const getOrCreateDateLocal = (day, month, years, hour, minute) => {
        target.prepare(`INSERT OR IGNORE INTO timeline_date (day,month,years,hour,minute) VALUES (?,?,?,?,?)`).run(day, month, years, hour||0, minute||0);
        return target.prepare(`SELECT id FROM timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?`).get(day, month, years, hour||0, minute||0).id;
      };

      for (const r of rows) {
        const tlSrc = srcTl.get(r.timeline_id);
        const sDate = dateRows.get(r.start_at);
        if (!tlSrc || !sDate) continue;
        const p = tlSrc.pKey?.startsWith('code:') ? target.prepare(`SELECT id FROM project WHERE codename=?`).get(tlSrc.pKey.slice(5)) : target.prepare(`SELECT id FROM project WHERE codename IS NULL AND name=?`).get((tlSrc.pKey || '').slice(5));
        if (!p) continue;
        const t = target.prepare(`SELECT id FROM timeline WHERE project_id=? AND line_name=?`).get(p.id, tlSrc.line_name);
        if (!t) continue;
        const sId = getOrCreateDateLocal(sDate.day, sDate.month, sDate.years, sDate.hour, sDate.minute);
        let eId = null;
        if (r.end_at && dateRows.has(r.end_at)) {
          const ed = dateRows.get(r.end_at);
          eId = getOrCreateDateLocal(ed.day, ed.month, ed.years, ed.hour, ed.minute);
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
        const tpl = target.prepare(`SELECT id FROM object_template WHERE category_id=? AND description=? AND COALESCE(attribute_type,'text')=?`).get(c.id, st.description, st.attribute_type);
        if (!o || !tpl) continue;
        summary.mappings += target.prepare(`INSERT OR IGNORE INTO object_attribute (object_id, template_id, attribute_value) VALUES (?,?,?)`).run(o.id, tpl.id, r.attribute_value || null).changes;
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
        const tg = target.prepare(`SELECT id FROM hashtag WHERE tag_name=?`).get(tagName);
        if (!p || !tg) continue;
        summary.mappings += target.prepare(`INSERT OR IGNORE INTO project_hashtag (project_id, hashtag_id) VALUES (?,?)`).run(p.id, tg.id).changes;
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
        const tg = target.prepare(`SELECT id FROM hashtag WHERE tag_name=?`).get(tagName);
        if (!o || !tg) continue;
        summary.mappings += target.prepare(`INSERT OR IGNORE INTO object_hashtag (object_id, hashtag_id) VALUES (?,?)`).run(o.id, tg.id).changes;
      }
    }

    if (hasTable(source, 'relation_type')) {
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const rows = source.prepare(`SELECT relation_name, color FROM relation_type`).all();
      for (const r of rows) summary.relationTypes += target.prepare(`INSERT OR IGNORE INTO relation_type (relation_name, color) VALUES (?, (SELECT id FROM use_color WHERE color_code=?))`).run(r.relation_name, colorById.get(r.color) || null).changes;
    }

    target.exec("PRAGMA foreign_keys = ON");
  });
  tx();
  return summary;
}

module.exports = { getDB, adaptDb, exportDatabaseTo, importDatabaseMerge };
