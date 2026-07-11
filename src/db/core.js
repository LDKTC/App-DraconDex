'use strict';
const { Database: _RawDatabase } = require('node-sqlite3-wasm');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function adaptDb(rawDb) {
  const origPrepare = rawDb.prepare.bind(rawDb);
  // node-sqlite3-wasm keeps a prepared statement (and its schema read-lock)
  // alive until finalize(). Prepare-and-finalize per call so no statement is
  // ever left open — otherwise leaked statements block later DDL (DROP/ALTER)
  // with SQLITE_LOCKED "database table is locked", and the Navigator schema
  // migration silently fails. Re-preparing per call also keeps statement
  // objects safely reusable (e.g. `const ins = db.prepare(...)` in import loops).
  rawDb.prepare = (sql) => {
    const exec = (method, args, transform) => {
      const stmt = origPrepare(sql);
      try {
        const r = stmt[method](args);
        return transform ? transform(r) : r;
      } finally {
        stmt.finalize();
      }
    };
    return {
      all: (...args) => exec('all', args),
      get: (...args) => exec('get', args, (r) => (r === null ? undefined : r)),
      run: (...args) => exec('run', args),
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

function hasAnyMissingColumns(conn, specs) {
  return specs.some(([tableName, columnNames]) =>
    hasTable(conn, tableName) && columnNames.some((columnName) => !hasColumn(conn, tableName, columnName))
  );
}

function initDB() {
  const hadWikiLinkTable = hasTable(db, 'wiki_link');
  // One-time migration: clean-replace the legacy Navigator (v2.2) schema with
  // the new v2.5.2 "World" schema. Detected by the legacy `world_cat_object`
  // table / the old `world_project.color_ref` column (now `color`). Old
  // navigator data is intentionally dropped; the new tables are recreated by
  // the CREATE IF NOT EXISTS block below.
  try {
    const legacyNav =
      hasTable(db, 'world_cat_object') ||
      (hasColumn(db, 'world_project', 'color_ref') && !hasColumn(db, 'world_project', 'codename')) ||
      hasAnyMissingColumns(db, [
        ['world_project', ['codename', 'name', 'memo', 'color']],
        ['world_novel', ['world_ref', 'project_ref']],
        ['world_character', ['world_ref', 'name', 'symbol', 'color']],
        ['world_character_category', ['world_ref', 'category_ref']],
        ['world_character_link', ['character_ref', 'object_ref']],
        ['world_category', ['world_ref', 'category_ref']],
        ['world_object', ['category_ref', 'object_ref', 'symbol']],
        ['world_map', ['world_ref', 'map_ref']],
        ['world_map_area', ['world_map_ref', 'area_ref', 'color']],
        ['world_map_point', ['world_map_area_ref', 'point_ref']],
        ['world_timeline', ['world_ref', 'name', 'world_map_ref']],
        ['world_timeline_date', ['day', 'month', 'years', 'hour', 'minute']],
        ['world_timeline_event', ['timeline_ref', 'date_ref']],
        ['world_timeline_point', ['x', 'y']],
        ['world_timeline_object', ['event_ref', 'world_object_ref', 'world_character_ref', 'point_ref']],
      ]);
    if (legacyNav) {
      db.exec(`PRAGMA foreign_keys = OFF`);
      db.exec(`
        DROP TABLE IF EXISTS library_world_link;
        DROP TABLE IF EXISTS world_timeline_object;
        DROP TABLE IF EXISTS world_timeline_point;
        DROP TABLE IF EXISTS world_timeline_event;
        DROP TABLE IF EXISTS world_timeline_date;
        DROP TABLE IF EXISTS world_timeline;
        DROP TABLE IF EXISTS world_map_point;
        DROP TABLE IF EXISTS world_map_area;
        DROP TABLE IF EXISTS world_object;
        DROP TABLE IF EXISTS world_character_link;
        DROP TABLE IF EXISTS world_character_category;
        DROP TABLE IF EXISTS world_novel;
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

    -- Nexus (v2.8): vault grouping projects from every module --
    CREATE TABLE IF NOT EXISTS nexus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      memo TEXT,
      color INTEGER REFERENCES use_color(id),
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
      char_category_ref INTEGER REFERENCES object_category(id) ON DELETE SET NULL,
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
      symbol_ref INTEGER REFERENCES symbol_collection(id) ON DELETE SET NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_ref,object_ref)
    );

    CREATE TABLE IF NOT EXISTS symbol_collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      glyph TEXT NOT NULL UNIQUE,
      label TEXT
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

    -- Navigator world-owned ("original") data: category→object→attribute→template,
    -- mirroring the Director schema but keyed to world_project (not borrowed from novels). --
    CREATE TABLE IF NOT EXISTS world_orig_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      category_name TEXT NOT NULL,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_name, world_ref)
    );

    CREATE TABLE IF NOT EXISTS world_orig_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES world_orig_category(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      attribute_type TEXT DEFAULT 'text',
      display_order INTEGER DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS world_orig_object (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES world_orig_category(id) ON DELETE CASCADE,
      color INTEGER REFERENCES use_color(id),
      note TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS world_orig_attribute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      object_id INTEGER NOT NULL REFERENCES world_orig_object(id) ON DELETE CASCADE,
      template_id INTEGER NOT NULL REFERENCES world_orig_template(id) ON DELETE CASCADE,
      attribute_value TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(object_id, template_id)
    );

    CREATE TABLE IF NOT EXISTS world_description (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      attribute_name TEXT,
      attribute_text TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Navigator tags (v2.5.7) — mirror of Director's project_hashtag/object_hashtag,
    -- sharing the same global hashtag table. --
    CREATE TABLE IF NOT EXISTS world_tag (
      world_ref INTEGER NOT NULL REFERENCES world_project(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(world_ref,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS world_charactor_tag (
      character_ref INTEGER NOT NULL REFERENCES world_character(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(character_ref,hashtag_id)
    );

    -- Hero (v2.6) --
    CREATE TABLE IF NOT EXISTS game_project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codename TEXT,
      name TEXT NOT NULL,
      memo TEXT,
      color_ref INTEGER REFERENCES use_color(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_novel_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      project_ref INTEGER REFERENCES project(id) ON DELETE SET NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(game_ref)
    );

    CREATE TABLE IF NOT EXISTS game_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      category_ref INTEGER NOT NULL REFERENCES object_category(id) ON DELETE CASCADE,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(game_ref,category_ref)
    );

    CREATE TABLE IF NOT EXISTS game_cat_object (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gamecat_ref INTEGER NOT NULL REFERENCES game_category(id) ON DELETE CASCADE,
      object_ref INTEGER NOT NULL REFERENCES object(id) ON DELETE CASCADE,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(gamecat_ref,object_ref)
    );

    CREATE TABLE IF NOT EXISTS game_character (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      object_link INTEGER REFERENCES game_cat_object(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      memo TEXT,
      color_ref INTEGER REFERENCES use_color(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_char_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      attribute_name TEXT NOT NULL,
      attribute_type TEXT NOT NULL DEFAULT 'text',
      levelable INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_char_attribute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_ref INTEGER NOT NULL REFERENCES game_character(id) ON DELETE CASCADE,
      template_ref INTEGER NOT NULL REFERENCES game_char_template(id) ON DELETE CASCADE,
      attribute_text TEXT,
      level INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(char_ref,template_ref,level)
    );

    CREATE TABLE IF NOT EXISTS game_collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color_ref INTEGER REFERENCES use_color(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_col_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_ref INTEGER NOT NULL REFERENCES game_collection(id) ON DELETE CASCADE,
      attribute_name TEXT NOT NULL,
      attribute_type TEXT NOT NULL DEFAULT 'text',
      levelable INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_col_element (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_ref INTEGER NOT NULL REFERENCES game_collection(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color_ref INTEGER REFERENCES use_color(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_col_attribute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      element_ref INTEGER NOT NULL REFERENCES game_col_element(id) ON DELETE CASCADE,
      template_ref INTEGER NOT NULL REFERENCES game_col_template(id) ON DELETE CASCADE,
      attribute_text TEXT,
      level INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(element_ref,template_ref,level)
    );

    CREATE TABLE IF NOT EXISTS game_char_element (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      char_ref INTEGER NOT NULL REFERENCES game_character(id) ON DELETE CASCADE,
      element_ref INTEGER NOT NULL REFERENCES game_col_element(id) ON DELETE CASCADE,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(char_ref,element_ref)
    );

    CREATE TABLE IF NOT EXISTS game_story (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_ref INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      memo TEXT,
      color_ref INTEGER REFERENCES use_color(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_dialogue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_ref INTEGER NOT NULL REFERENCES game_story(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      memo TEXT,
      color_ref INTEGER REFERENCES use_color(id),
      pos_x REAL DEFAULT 0,
      pos_y REAL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_conversation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dialogue_ref INTEGER NOT NULL REFERENCES game_dialogue(id) ON DELETE CASCADE,
      char_ref INTEGER REFERENCES game_character(id) ON DELETE SET NULL,
      talk_sentence TEXT,
      talk_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(dialogue_ref,talk_order)
    );

    CREATE TABLE IF NOT EXISTS game_storyline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_ref INTEGER NOT NULL REFERENCES game_story(id) ON DELETE CASCADE,
      from_ref INTEGER NOT NULL REFERENCES game_dialogue(id) ON DELETE CASCADE,
      to_ref INTEGER NOT NULL REFERENCES game_dialogue(id) ON DELETE CASCADE,
      color_ref INTEGER REFERENCES use_color(id),
      symbol_ref INTEGER REFERENCES symbol_collection(id) ON DELETE SET NULL,
      symbol TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(from_ref,to_ref)
    );

    CREATE TABLE IF NOT EXISTS game_project_hashtag (
      game_id INTEGER NOT NULL REFERENCES game_project(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(game_id,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS game_char_hashtag (
      char_id INTEGER NOT NULL REFERENCES game_character(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(char_id,hashtag_id)
    );

    CREATE TABLE IF NOT EXISTS game_element_hashtag (
      element_id INTEGER NOT NULL REFERENCES game_col_element(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(element_id,hashtag_id)
    );

    -- Writer (v2.7) --
    CREATE TABLE IF NOT EXISTS write_project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      codename TEXT,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(codename)
    );
    CREATE TABLE IF NOT EXISTS write_series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES write_project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS write_book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER NOT NULL REFERENCES write_series(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS write_chapter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES write_book(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      chapter_order INTEGER NOT NULL DEFAULT 0,
      color INTEGER REFERENCES use_color(id),
      chapter_content TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(book_id,chapter_order)
    );
    CREATE TABLE IF NOT EXISTS write_novel_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER NOT NULL REFERENCES write_series(id) ON DELETE CASCADE,
      novel_id INTEGER NOT NULL REFERENCES project(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(series_id,novel_id),
      UNIQUE(series_id)
    );
    CREATE TABLE IF NOT EXISTS write_wiki_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL REFERENCES write_chapter(id) ON DELETE CASCADE,
      object_id INTEGER REFERENCES object(id) ON DELETE CASCADE,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(chapter_id,object_id)
    );
    CREATE TABLE IF NOT EXISTS write_word_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wiki_id INTEGER NOT NULL REFERENCES write_wiki_link(id) ON DELETE CASCADE,
      text_link TEXT NOT NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS write_note (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES write_project(id) ON DELETE CASCADE,
      notename TEXT NOT NULL,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS write_chat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL REFERENCES write_note(id) ON DELETE CASCADE,
      chat TEXT NOT NULL,
      chat_order INTEGER NOT NULL DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(note_id,chat_order)
    );

    -- Scribe (v2.8): markdown notes per nexus --
    CREATE TABLE IF NOT EXISTS note_folder (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nexus_ref INTEGER NOT NULL REFERENCES nexus(id) ON DELETE CASCADE,
      parent_ref INTEGER REFERENCES note_folder(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color INTEGER REFERENCES use_color(id),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS note (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nexus_ref INTEGER NOT NULL REFERENCES nexus(id) ON DELETE CASCADE,
      folder_ref INTEGER REFERENCES note_folder(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      color INTEGER REFERENCES use_color(id),
      pinned INTEGER NOT NULL DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(nexus_ref,title)
    );

    -- Wiki-link index (v2.8): [[Name]] references parsed out of markdown
    -- content on save. Rebuildable from content (src/db/wiki.js).
    CREATE TABLE IF NOT EXISTS wiki_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nexus_ref INTEGER REFERENCES nexus(id) ON DELETE CASCADE,
      src_key TEXT NOT NULL,
      target_key TEXT,
      target_text TEXT NOT NULL,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- v3 module system (progress.md M1): Major/Minor tree living in the Nexus
    -- nest, independent of the legacy project/world_project/game_project/
    -- write_project trees. parent_id NULL = Major (freely reorderable via
    -- display_order), set = Minor (locked one level under its Major).
    CREATE TABLE IF NOT EXISTS module (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nexus_ref INTEGER NOT NULL REFERENCES nexus(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES module(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('collector','manager','inspector','classifier',
        'locator','chronicler','wanderer','narrator','author','scribe','drafter',
        'viewer','connector','sketcher','designer')),
      icon TEXT,
      icon_color INTEGER REFERENCES use_color(id),
      color INTEGER REFERENCES use_color(id),
      description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      pinned INTEGER NOT NULL DEFAULT 0,
      create_at TEXT NOT NULL DEFAULT (datetime('now')),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Module Inspector (Phase 4): free-form attributes, per-kind UI spec
    -- (active view etc., populated from Phase 5 onward) and tag links.
    CREATE TABLE IF NOT EXISTS module_attribute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      attr_name TEXT NOT NULL,
      attr_value TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS module_ui (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      ui_key TEXT NOT NULL,
      ui_value TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(module_ref, ui_key)
    );

    CREATE TABLE IF NOT EXISTS module_hashtag (
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      hashtag_id INTEGER NOT NULL REFERENCES hashtag(id) ON DELETE CASCADE,
      UNIQUE(module_ref, hashtag_id)
    );

    -- TimeMap "Wanderer" (Phase 9). A Link pin placed on the referenced
    -- Locator's map at (x,y); event_ref picks which Chronicler event sets
    -- the pin's displayed time. The wanderer's chosen Locator/Chronicler
    -- pair lives in module_ui (keys mapModule/timelineModule), so this row
    -- only carries the pin itself. area_ref optionally anchors the pin to
    -- an area for future use; deleting the event or area clears the ref
    -- instead of dropping the pin.
    CREATE TABLE IF NOT EXISTS map_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      event_ref INTEGER REFERENCES timeline_event(id) ON DELETE SET NULL,
      area_ref INTEGER REFERENCES map_area(id) ON DELETE SET NULL,
      label TEXT,
      x REAL NOT NULL DEFAULT 0,
      y REAL NOT NULL DEFAULT 0,
      create_at TEXT NOT NULL DEFAULT (datetime('now')),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Story "Narrator" (Phase 10). Module-scoped mirrors of the legacy
    -- game_story board (game_dialogue/game_conversation/game_storyline):
    -- Dialogue nodes at (x,y) on the route board, directed edges between
    -- them, and ordered conversation lines inside each node. Parallel
    -- schema, same reasoning as Classifier (progress.md Section C).
    CREATE TABLE IF NOT EXISTS story_dialogue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color INTEGER REFERENCES use_color(id),
      pos_x REAL NOT NULL DEFAULT 0,
      pos_y REAL NOT NULL DEFAULT 0,
      create_at TEXT NOT NULL DEFAULT (datetime('now')),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS story_edge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      from_ref INTEGER NOT NULL REFERENCES story_dialogue(id) ON DELETE CASCADE,
      to_ref INTEGER NOT NULL REFERENCES story_dialogue(id) ON DELETE CASCADE,
      label TEXT,
      create_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(from_ref, to_ref)
    );

    CREATE TABLE IF NOT EXISTS story_talk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dialogue_ref INTEGER NOT NULL REFERENCES story_dialogue(id) ON DELETE CASCADE,
      speaker TEXT,
      talk_sentence TEXT,
      talk_order INTEGER NOT NULL DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Category "Classifier" (Phase 5). A Classifier module IS its category --
    -- one 'classifier'-kind module row owns one set of objects/templates.
    -- Deliberately a *parallel* schema rather than reusing Director's
    -- object_category/object_template/object/object_attribute: those tables
    -- are read via INNER JOINs (wiki.js's obj resolver, Director's own
    -- project-scoped queries, relation.js, hashtag.js) that all assume every
    -- object belongs to a real legacy project row, so relaxing that would
    -- have meant auditing/patching every one of those call sites. See
    -- progress.md Section C for the full writeup of this decision.
    CREATE TABLE IF NOT EXISTS classifier_object (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color INTEGER REFERENCES use_color(id),
      note TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      create_at TEXT NOT NULL DEFAULT (datetime('now')),
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- object_ref NULL = shared category template (Object/Element default);
    -- set = the one private attribute a Character-type object may carry.
    CREATE TABLE IF NOT EXISTS classifier_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_ref INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
      object_ref INTEGER REFERENCES classifier_object(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      attribute_type TEXT DEFAULT 'text',
      levelable INTEGER NOT NULL DEFAULT 0,
      has_condition INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      update_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classifier_attribute (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      object_ref INTEGER NOT NULL REFERENCES classifier_object(id) ON DELETE CASCADE,
      template_ref INTEGER NOT NULL REFERENCES classifier_template(id) ON DELETE CASCADE,
      attribute_value TEXT,
      update_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(object_ref, template_ref)
    );
  `);

  if (!hasColumn(db, 'module', 'cat_type')) {
    try { db.prepare(`ALTER TABLE module ADD COLUMN cat_type TEXT CHECK(cat_type IN ('object','element','character'))`).run(); } catch (_) {}
  }
  migrateMapV3(db);
  migrateTimelineV3(db);

  if (!hasColumn(db, 'relation_type', 'color')) {
    try { db.prepare(`ALTER TABLE relation_type ADD COLUMN color INTEGER REFERENCES use_color(id)`).run(); } catch (_) {}
  }
  if (hasTable(db, 'world_project') && !hasColumn(db, 'world_project', 'color')) {
    try {
      db.prepare(`ALTER TABLE world_project ADD COLUMN color INTEGER REFERENCES use_color(id)`).run();
      if (hasColumn(db, 'world_project', 'color_ref')) {
        db.prepare(`UPDATE world_project SET color=color_ref WHERE color IS NULL`).run();
      }
    } catch (_) {}
  }
  if (hasTable(db, 'world_novel') && !hasColumn(db, 'world_novel', 'char_category_ref')) {
    try { db.prepare(`ALTER TABLE world_novel ADD COLUMN char_category_ref INTEGER REFERENCES object_category(id) ON DELETE SET NULL`).run(); } catch (_) {}
  }
  if (hasTable(db, 'world_object') && !hasColumn(db, 'world_object', 'symbol_ref')) {
    try { db.prepare(`ALTER TABLE world_object ADD COLUMN symbol_ref INTEGER REFERENCES symbol_collection(id) ON DELETE SET NULL`).run(); } catch (_) {}
  }
  if (hasTable(db, 'symbol_collection')) {
    const seed = ['⚔️ Sword', '🛡️ Shield', '🏹 Bow', '🗡️ Dagger', '🔥 Fire', '💧 Water', '🌿 Nature', '⚡ Lightning',
      '🌙 Moon', '☀️ Sun', '⭐ Star', '👑 Crown', '💀 Skull', '🔮 Orb', '📜 Scroll', '💎 Gem',
      '🐉 Dragon', '🦁 Lion', '🐺 Wolf', '🦅 Eagle', '🏰 Castle', '⚓ Anchor', '🕯️ Candle', '⚖️ Scale',
      '🪄 Magic', '🧿 Talisman', '🪶 Feather', '🕳️ Portal', '🧭 Compass', '🪨 Stone', '🌊 Wave', '🌪️ Storm',
      '🌸 Bloom', '🌾 Grain', '🍀 Clover', '🪐 Planet', '🧩 Puzzle', '🪙 Coin', '🔑 Key', '🧱 Brick',
      '🛶 Boat', '🧺 Basket', '🧬 DNA', '🫧 Bubble', '🪞 Mirror', '📡 Signal', '🧯 Extinguisher', '🗝️ Key'];
    const ins = db.prepare(`INSERT OR IGNORE INTO symbol_collection (glyph,label) VALUES (?,?)`);
    for (const s of seed) {
      const [glyph, ...rest] = s.split(' ');
      ins.run(glyph, rest.join(' '));
    }
  }
  const hasStory = db.prepare(`PRAGMA table_info(timeline_event)`).all().some(c => c.name === 'story');
  if (!hasStory) db.prepare(`ALTER TABLE timeline_event ADD COLUMN story TEXT`).run();
  const hasNote = db.prepare(`PRAGMA table_info(object)`).all().some(c => c.name === 'note');
  if (!hasNote) { try { db.prepare(`ALTER TABLE object ADD COLUMN note TEXT`).run(); } catch (_) {} }
  migrateHeroV26(db);
  migrateWriterV27(db);
  migrateNexusV28(db);
  ensureIndexes(db);
  // One-time backfill: index [[wikilinks]] already sitting in old content.
  // Lazy require avoids the core↔wiki module cycle (initDB runs after load).
  if (!hadWikiLinkTable) {
    try { require('./wiki').rebuildWikiIndex(); } catch (e) { console.error('wiki backfill error:', e); }
  }
}

// v2.8 introduces the Nexus vault: every module's project root gains a
// nexus_ref. Pre-existing rows are adopted into an auto-created default vault
// so nothing disappears from the UI after upgrading.
const NEXUS_PROJECT_TABLES = ['project', 'world_project', 'game_project', 'write_project'];
function migrateNexusV28(db) {
  try {
    for (const t of NEXUS_PROJECT_TABLES) {
      if (hasTable(db, t) && !hasColumn(db, t, 'nexus_ref')) {
        try { db.prepare(`ALTER TABLE ${t} ADD COLUMN nexus_ref INTEGER REFERENCES nexus(id) ON DELETE SET NULL`).run(); } catch (_) {}
      }
    }
    const orphan = NEXUS_PROJECT_TABLES.some(t =>
      hasTable(db, t) && db.prepare(`SELECT 1 FROM ${t} WHERE nexus_ref IS NULL LIMIT 1`).get());
    if (orphan) {
      let nx = db.prepare(`SELECT id FROM nexus ORDER BY id LIMIT 1`).get();
      if (!nx) {
        const rid = db.prepare(`INSERT INTO nexus (name) VALUES ('Nexus')`).run().lastInsertRowid;
        nx = { id: rid };
      }
      for (const t of NEXUS_PROJECT_TABLES) {
        if (hasTable(db, t)) db.prepare(`UPDATE ${t} SET nexus_ref=? WHERE nexus_ref IS NULL`).run(nx.id);
      }
    }
  } catch (e) {
    console.error('Nexus v2.8 migration error:', e);
  }
}

// v2.7 replaced the entire Writer module schema (library/series/document) with
// the write_* tables. The old library data has no v2.7 equivalent and is
// dropped; the new tables are created by the CREATE IF NOT EXISTS block above.
// v3 (Phase 7): Locator reuses `map`/`map_area`/`map_point` instead of a
// parallel schema like Classifier's — unlike object_category, nothing joins
// `map` to `project` through an assumption every map has one (no wiki.js
// resolver exists for maps at all yet, and Navigator's own map queries
// already filter to matching project ids before ever reaching a JOIN), so
// relaxing `project_id` and adding `module_ref` is safe here. SQLite can't
// drop a NOT NULL with ALTER, so this rebuilds the table — ids are
// preserved so map_area's FK and world_map.map_ref stay valid untouched.
function migrateMapV3(db) {
  if (!hasTable(db, 'map') || hasColumn(db, 'map', 'module_ref')) return;
  try {
    db.exec(`PRAGMA foreign_keys = OFF`);
    db.exec(`
      CREATE TABLE map_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        map_name TEXT,
        project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
        module_ref INTEGER REFERENCES module(id) ON DELETE CASCADE,
        color INTEGER REFERENCES use_color(id),
        update_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO map_new (id, map_name, project_id, color, update_at)
        SELECT id, map_name, project_id, color, update_at FROM map;
      DROP TABLE map;
      ALTER TABLE map_new RENAME TO map;
    `);
    db.exec(`PRAGMA foreign_keys = ON`);
  } catch (e) {
    console.error('Map v3 migration error:', e);
  }
}

// Same table-rebuild pattern as migrateMapV3: timeline.project_id was
// NOT NULL, Chronicler timelines need it nullable (module_ref set instead).
function migrateTimelineV3(db) {
  if (!hasTable(db, 'timeline') || hasColumn(db, 'timeline', 'module_ref')) return;
  try {
    db.exec(`PRAGMA foreign_keys = OFF`);
    db.exec(`
      CREATE TABLE timeline_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        line_name TEXT,
        project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
        module_ref INTEGER REFERENCES module(id) ON DELETE CASCADE,
        color INTEGER REFERENCES use_color(id),
        update_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO timeline_new (id, line_name, project_id, color, update_at)
        SELECT id, line_name, project_id, color, update_at FROM timeline;
      DROP TABLE timeline;
      ALTER TABLE timeline_new RENAME TO timeline;
    `);
    db.exec(`PRAGMA foreign_keys = ON`);
  } catch (e) {
    console.error('Timeline v3 migration error:', e);
  }
}

function migrateWriterV27(db) {
  try {
    if (!hasTable(db, 'library_project')) return;
    db.exec(`PRAGMA foreign_keys = OFF`);
    db.exec(`
      DROP TABLE IF EXISTS document_hashtag;
      DROP TABLE IF EXISTS library_document;
      DROP TABLE IF EXISTS series_hashtag;
      DROP TABLE IF EXISTS series_object_link;
      DROP TABLE IF EXISTS series_char_link;
      DROP TABLE IF EXISTS series_novel_link;
      DROP TABLE IF EXISTS series_description;
      DROP TABLE IF EXISTS library_series;
      DROP TABLE IF EXISTS library_world_link;
      DROP TABLE IF EXISTS library_description;
      DROP TABLE IF EXISTS library_project;
    `);
    db.exec(`PRAGMA foreign_keys = ON`);
  } catch (_) {}
}

// Foreign keys are ON with CASCADE deletes throughout, but SQLite does not
// index the child side of a FK automatically — every parent DELETE and every
// `WHERE <fk> = ?` list query was a full scan. Indexes are only created for FK
// columns not already covered as the leading column of a UNIQUE constraint.
// Runs after migrations so reshaped tables (Hero v2.6 etc.) are final.
function ensureIndexes(db) {
  db.exec(`
    -- Director
    CREATE INDEX IF NOT EXISTS idx_project_nexus             ON project(nexus_ref);
    CREATE INDEX IF NOT EXISTS idx_world_project_nexus       ON world_project(nexus_ref);
    CREATE INDEX IF NOT EXISTS idx_game_project_nexus        ON game_project(nexus_ref);
    CREATE INDEX IF NOT EXISTS idx_write_project_nexus       ON write_project(nexus_ref);
    CREATE INDEX IF NOT EXISTS idx_project_folder            ON project(folder_id);
    CREATE INDEX IF NOT EXISTS idx_project_description_proj  ON project_description(project_id);
    CREATE INDEX IF NOT EXISTS idx_object_category_project   ON object_category(project_id);
    CREATE INDEX IF NOT EXISTS idx_object_template_category  ON object_template(category_id);
    CREATE INDEX IF NOT EXISTS idx_object_project            ON object(project_id);
    CREATE INDEX IF NOT EXISTS idx_object_category           ON object(category_id);
    CREATE INDEX IF NOT EXISTS idx_object_attribute_template ON object_attribute(template_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_project          ON timeline(project_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_module            ON timeline(module_ref);
    CREATE INDEX IF NOT EXISTS idx_timeline_event_timeline   ON timeline_event(timeline_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_event_start      ON timeline_event(start_at);
    CREATE INDEX IF NOT EXISTS idx_timeline_event_end        ON timeline_event(end_at);
    CREATE INDEX IF NOT EXISTS idx_map_project               ON map(project_id);
    CREATE INDEX IF NOT EXISTS idx_map_module                ON map(module_ref);
    CREATE INDEX IF NOT EXISTS idx_map_area_map              ON map_area(map_id);
    CREATE INDEX IF NOT EXISTS idx_map_point_area            ON map_point(area_id);
    CREATE INDEX IF NOT EXISTS idx_relation_project          ON relation(project_id);
    CREATE INDEX IF NOT EXISTS idx_relation_type_ref         ON relation(relation_type);
    CREATE INDEX IF NOT EXISTS idx_relation_obob_relation    ON relation_obob(relation_id);
    CREATE INDEX IF NOT EXISTS idx_relation_obob_from        ON relation_obob(object_from);
    CREATE INDEX IF NOT EXISTS idx_relation_obob_to          ON relation_obob(object_to);
    CREATE INDEX IF NOT EXISTS idx_relation_obtl_relation    ON relation_obtl(relation_id);
    CREATE INDEX IF NOT EXISTS idx_relation_obtl_from        ON relation_obtl(object_from);
    CREATE INDEX IF NOT EXISTS idx_relation_obtl_to          ON relation_obtl(timeline_to);
    CREATE INDEX IF NOT EXISTS idx_relation_tltl_relation    ON relation_tltl(relation_id);
    CREATE INDEX IF NOT EXISTS idx_relation_tltl_from        ON relation_tltl(timeline_from);
    CREATE INDEX IF NOT EXISTS idx_relation_tltl_to          ON relation_tltl(timeline_to);
    CREATE INDEX IF NOT EXISTS idx_project_hashtag_tag       ON project_hashtag(hashtag_id);
    CREATE INDEX IF NOT EXISTS idx_object_hashtag_tag        ON object_hashtag(hashtag_id);
    CREATE INDEX IF NOT EXISTS idx_event_hashtag_tag         ON event_hashtag(hashtag_id);

    -- Navigator (World)
    CREATE INDEX IF NOT EXISTS idx_world_novel_project       ON world_novel(project_ref);
    CREATE INDEX IF NOT EXISTS idx_world_character_world     ON world_character(world_ref);
    CREATE INDEX IF NOT EXISTS idx_world_char_cat_category   ON world_character_category(category_ref);
    CREATE INDEX IF NOT EXISTS idx_world_char_link_object    ON world_character_link(object_ref);
    CREATE INDEX IF NOT EXISTS idx_world_category_category   ON world_category(category_ref);
    CREATE INDEX IF NOT EXISTS idx_world_object_object       ON world_object(object_ref);
    CREATE INDEX IF NOT EXISTS idx_world_object_symbol       ON world_object(symbol_ref);
    CREATE INDEX IF NOT EXISTS idx_world_map_map             ON world_map(map_ref);
    CREATE INDEX IF NOT EXISTS idx_world_map_area_area       ON world_map_area(area_ref);
    CREATE INDEX IF NOT EXISTS idx_world_map_point_point     ON world_map_point(point_ref);
    CREATE INDEX IF NOT EXISTS idx_world_timeline_world      ON world_timeline(world_ref);
    CREATE INDEX IF NOT EXISTS idx_world_timeline_map        ON world_timeline(world_map_ref);
    CREATE INDEX IF NOT EXISTS idx_world_tl_event_date       ON world_timeline_event(date_ref);
    CREATE INDEX IF NOT EXISTS idx_world_tl_object_object    ON world_timeline_object(world_object_ref);
    CREATE INDEX IF NOT EXISTS idx_world_tl_object_char      ON world_timeline_object(world_character_ref);
    CREATE INDEX IF NOT EXISTS idx_world_tl_object_point     ON world_timeline_object(point_ref);
    CREATE INDEX IF NOT EXISTS idx_world_orig_cat_world      ON world_orig_category(world_ref);
    CREATE INDEX IF NOT EXISTS idx_world_orig_tmpl_category  ON world_orig_template(category_id);
    CREATE INDEX IF NOT EXISTS idx_world_orig_obj_world      ON world_orig_object(world_ref);
    CREATE INDEX IF NOT EXISTS idx_world_orig_obj_category   ON world_orig_object(category_id);
    CREATE INDEX IF NOT EXISTS idx_world_orig_attr_template  ON world_orig_attribute(template_id);
    CREATE INDEX IF NOT EXISTS idx_world_description_world   ON world_description(world_ref);
    CREATE INDEX IF NOT EXISTS idx_world_tag_tag             ON world_tag(hashtag_id);
    CREATE INDEX IF NOT EXISTS idx_world_char_tag_tag        ON world_charactor_tag(hashtag_id);

    -- Hero (Game)
    CREATE INDEX IF NOT EXISTS idx_game_category_category    ON game_category(category_ref);
    CREATE INDEX IF NOT EXISTS idx_game_cat_object_object    ON game_cat_object(object_ref);
    CREATE INDEX IF NOT EXISTS idx_game_character_game       ON game_character(game_ref);
    CREATE INDEX IF NOT EXISTS idx_game_character_objlink    ON game_character(object_link);
    CREATE INDEX IF NOT EXISTS idx_game_char_template_game   ON game_char_template(game_ref);
    CREATE INDEX IF NOT EXISTS idx_game_char_attr_template   ON game_char_attribute(template_ref);
    CREATE INDEX IF NOT EXISTS idx_game_collection_game      ON game_collection(game_ref);
    CREATE INDEX IF NOT EXISTS idx_game_col_template_col     ON game_col_template(collection_ref);
    CREATE INDEX IF NOT EXISTS idx_game_col_element_col      ON game_col_element(collection_ref);
    CREATE INDEX IF NOT EXISTS idx_game_col_attr_template    ON game_col_attribute(template_ref);
    CREATE INDEX IF NOT EXISTS idx_game_char_element_element ON game_char_element(element_ref);
    CREATE INDEX IF NOT EXISTS idx_game_story_game           ON game_story(game_ref);
    CREATE INDEX IF NOT EXISTS idx_game_dialogue_story       ON game_dialogue(story_ref);
    CREATE INDEX IF NOT EXISTS idx_game_conversation_char    ON game_conversation(char_ref);
    CREATE INDEX IF NOT EXISTS idx_game_storyline_story      ON game_storyline(story_ref);
    CREATE INDEX IF NOT EXISTS idx_game_storyline_to         ON game_storyline(to_ref);
    CREATE INDEX IF NOT EXISTS idx_game_project_hashtag_tag  ON game_project_hashtag(hashtag_id);
    CREATE INDEX IF NOT EXISTS idx_game_char_hashtag_tag     ON game_char_hashtag(hashtag_id);
    CREATE INDEX IF NOT EXISTS idx_game_element_hashtag_tag  ON game_element_hashtag(hashtag_id);

    -- Writer (v2.7)
    CREATE INDEX IF NOT EXISTS idx_write_series_project      ON write_series(project_id);
    CREATE INDEX IF NOT EXISTS idx_write_book_series         ON write_book(series_id);
    CREATE INDEX IF NOT EXISTS idx_write_novel_link_novel    ON write_novel_link(novel_id);
    CREATE INDEX IF NOT EXISTS idx_write_wiki_link_object    ON write_wiki_link(object_id);
    CREATE INDEX IF NOT EXISTS idx_write_word_link_wiki      ON write_word_link(wiki_id);
    CREATE INDEX IF NOT EXISTS idx_write_note_project        ON write_note(project_id);

    -- Scribe (v2.8)
    CREATE INDEX IF NOT EXISTS idx_note_nexus                ON note(nexus_ref);
    CREATE INDEX IF NOT EXISTS idx_note_folder_ref           ON note(folder_ref);
    CREATE INDEX IF NOT EXISTS idx_note_folder_nexus         ON note_folder(nexus_ref);
    CREATE INDEX IF NOT EXISTS idx_note_folder_parent        ON note_folder(parent_ref);
    CREATE INDEX IF NOT EXISTS idx_wiki_link_src             ON wiki_link(src_key);
    CREATE INDEX IF NOT EXISTS idx_wiki_link_target          ON wiki_link(target_key);

    -- Module system (v3)
    CREATE INDEX IF NOT EXISTS idx_module_nexus            ON module(nexus_ref);
    CREATE INDEX IF NOT EXISTS idx_module_parent           ON module(parent_id);
    CREATE INDEX IF NOT EXISTS idx_module_attribute_module ON module_attribute(module_ref);
    CREATE INDEX IF NOT EXISTS idx_module_ui_module        ON module_ui(module_ref);
    CREATE INDEX IF NOT EXISTS idx_module_hashtag_tag      ON module_hashtag(hashtag_id);

    -- Classifier (Phase 5)
    CREATE INDEX IF NOT EXISTS idx_classifier_object_module    ON classifier_object(module_ref);
    CREATE INDEX IF NOT EXISTS idx_classifier_template_module  ON classifier_template(module_ref);
    CREATE INDEX IF NOT EXISTS idx_classifier_template_object  ON classifier_template(object_ref);
    CREATE INDEX IF NOT EXISTS idx_classifier_attribute_object ON classifier_attribute(object_ref);
    CREATE INDEX IF NOT EXISTS idx_classifier_attribute_tmpl   ON classifier_attribute(template_ref);
  `);
}

// v2.6 replaced the entire Hero module schema. Reshape the surviving tables
// (created by an older build with the v2.3 columns), copy what maps cleanly
// (items -> collections, dial lines -> conversations, dial edges -> storyline),
// and drop the v2.3-only tables. Old stat/function/link data has no v2.6
// equivalent and is dropped with them.
function migrateHeroV26(db) {
  try {
    if (!hasColumn(db, 'game_project', 'codename')) {
      try { db.prepare(`ALTER TABLE game_project ADD COLUMN codename TEXT`).run(); } catch (_) {}
    }
    if (!hasColumn(db, 'game_character', 'object_link')) {
      try { db.prepare(`ALTER TABLE game_character ADD COLUMN object_link INTEGER REFERENCES game_cat_object(id) ON DELETE SET NULL`).run(); } catch (_) {}
    }
    if (!hasColumn(db, 'game_character', 'color_ref')) {
      try { db.prepare(`ALTER TABLE game_character ADD COLUMN color_ref INTEGER REFERENCES use_color(id)`).run(); } catch (_) {}
    }
    if (!hasColumn(db, 'game_story', 'color_ref')) {
      try { db.prepare(`ALTER TABLE game_story ADD COLUMN color_ref INTEGER REFERENCES use_color(id)`).run(); } catch (_) {}
    }
    if (!hasColumn(db, 'game_dialogue', 'color_ref')) {
      try { db.prepare(`ALTER TABLE game_dialogue ADD COLUMN color_ref INTEGER REFERENCES use_color(id)`).run(); } catch (_) {}
    }
    if (!hasColumn(db, 'game_storyline', 'symbol_ref')) {
      try { db.prepare(`ALTER TABLE game_storyline ADD COLUMN symbol_ref INTEGER REFERENCES symbol_collection(id) ON DELETE SET NULL`).run(); } catch (_) {}
    }
    if (!hasColumn(db, 'game_storyline', 'symbol')) {
      try { db.prepare(`ALTER TABLE game_storyline ADD COLUMN symbol TEXT`).run(); } catch (_) {}
    }
    // Plan v2.6: a novel can belong to at most one game. Skipped silently if
    // existing data already violates it.
    try { db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_game_novel_link_project ON game_novel_link(project_ref)`).run(); } catch (_) {}

    if (hasTable(db, 'game_item_category')) {
      db.prepare(`INSERT OR IGNORE INTO game_collection (id,game_ref,name) SELECT id,game_ref,name FROM game_item_category`).run();
      db.prepare(`INSERT OR IGNORE INTO game_col_template (id,collection_ref,attribute_name,attribute_type) SELECT id,item_cat_ref,attr_name,CASE WHEN attr_type='number' THEN 'num' ELSE 'text' END FROM game_item_template`).run();
      db.prepare(`INSERT OR IGNORE INTO game_col_element (id,collection_ref,name) SELECT id,item_cat_ref,name FROM game_item`).run();
      db.prepare(`INSERT OR IGNORE INTO game_col_attribute (element_ref,template_ref,attribute_text,level) SELECT item_ref,template_ref,value,0 FROM game_item_attr`).run();
      db.prepare(`INSERT OR IGNORE INTO game_element_hashtag (element_id,hashtag_id) SELECT item_id,hashtag_id FROM game_item_hashtag`).run();
    }
    if (hasTable(db, 'game_dial_line')) {
      db.prepare(`INSERT OR IGNORE INTO game_conversation (dialogue_ref,char_ref,talk_sentence,talk_order)
        SELECT dial_ref, speaker_ref, text, ROW_NUMBER() OVER (PARTITION BY dial_ref ORDER BY order_index, id)-1 FROM game_dial_line`).run();
    }
    if (hasTable(db, 'game_dial_next')) {
      db.prepare(`INSERT OR IGNORE INTO game_storyline (story_ref,from_ref,to_ref)
        SELECT gd.story_ref, gdn.from_ref, gdn.to_ref FROM game_dial_next gdn JOIN game_dialogue gd ON gd.id=gdn.from_ref`).run();
    }
    // Children first so FK references never dangle mid-drop.
    for (const t of ['game_dial_line','game_dial_next','game_item_attr','game_item_hashtag','game_item','game_item_template',
                     'game_item_category','game_stat_levelup','game_stat_template','game_char_link',
                     'game_function','game_func_category','game_description']) {
      if (hasTable(db, t)) { try { db.prepare(`DROP TABLE ${t}`).run(); } catch (_) {} }
    }
  } catch (e) {
    console.error('Hero v2.6 migration error:', e);
  }
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
    nexuses: 0, noteFolders: 0, notes: 0,
  };

  const tx = target.transaction(() => {
    target.exec("PRAGMA foreign_keys = OFF");

    if (hasTable(source, 'use_color')) {
      const rows = source.prepare(`SELECT color_code FROM use_color WHERE color_code IS NOT NULL`).all();
      const ins = target.prepare(`INSERT OR IGNORE INTO use_color (color_code) VALUES (?)`);
      for (const r of rows) summary.colors += ins.run(r.color_code).changes;
    }

    // Nexus vaults + Scribe notes (v2.8), matched by name/title.
    if (hasTable(source, 'nexus')) {
      const colorById = hasTable(source, 'use_color') ? source.prepare(`SELECT id, color_code FROM use_color`).all().reduce((m, r) => (m.set(r.id, r.color_code), m), new Map()) : new Map();
      const srcNexus = source.prepare(`SELECT id, name, memo, color FROM nexus`).all();
      for (const n of srcNexus) {
        summary.nexuses += target.prepare(`INSERT OR IGNORE INTO nexus (name, memo, color) VALUES (?, ?, (SELECT id FROM use_color WHERE color_code=?))`)
          .run(n.name, n.memo, colorById.get(n.color) || null).changes;
      }
      const targetNexusByName = target.prepare(`SELECT id, name FROM nexus`).all().reduce((m, r) => (m.set(r.name, r.id), m), new Map());
      const srcNexusName = new Map(srcNexus.map(n => [n.id, n.name]));

      if (hasTable(source, 'note_folder')) {
        // flat match by (target nexus, name); nesting is not reconstructed
        for (const f of source.prepare(`SELECT nexus_ref, name, color FROM note_folder`).all()) {
          const nx = targetNexusByName.get(srcNexusName.get(f.nexus_ref));
          if (!nx) continue;
          const exists = target.prepare(`SELECT 1 FROM note_folder WHERE nexus_ref=? AND name=?`).get(nx, f.name);
          if (exists) continue;
          summary.noteFolders += target.prepare(`INSERT INTO note_folder (nexus_ref, name, color) VALUES (?, ?, (SELECT id FROM use_color WHERE color_code=?))`)
            .run(nx, f.name, colorById.get(f.color) || null).changes;
        }
      }
      if (hasTable(source, 'note')) {
        const srcFolderName = hasTable(source, 'note_folder') ? source.prepare(`SELECT id, name FROM note_folder`).all().reduce((m, r) => (m.set(r.id, r.name), m), new Map()) : new Map();
        for (const n of source.prepare(`SELECT nexus_ref, folder_ref, title, content, color, pinned FROM note`).all()) {
          const nx = targetNexusByName.get(srcNexusName.get(n.nexus_ref));
          if (!nx) continue;
          const folder = n.folder_ref ? target.prepare(`SELECT id FROM note_folder WHERE nexus_ref=? AND name=?`).get(nx, srcFolderName.get(n.folder_ref))?.id : null;
          summary.notes += target.prepare(`INSERT OR IGNORE INTO note (nexus_ref, folder_ref, title, content, color, pinned) VALUES (?, ?, ?, ?, (SELECT id FROM use_color WHERE color_code=?), ?)`)
            .run(nx, folder || null, n.title, n.content || '', colorById.get(n.color) || null, n.pinned ? 1 : 0).changes;
        }
      }
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

    // Merged projects arrive without nexus_ref; adopt them like the v2.8
    // migration does so they don't vanish from every vault until restart.
    let nx = target.prepare(`SELECT id FROM nexus ORDER BY id LIMIT 1`).get();
    if (!nx) {
      nx = { id: target.prepare(`INSERT INTO nexus (name) VALUES ('Nexus')`).run().lastInsertRowid };
    }
    for (const t of NEXUS_PROJECT_TABLES) {
      target.prepare(`UPDATE ${t} SET nexus_ref=? WHERE nexus_ref IS NULL`).run(nx.id);
    }

    target.exec("PRAGMA foreign_keys = ON");
  });
  tx();
  // Imported content may carry [[wikilinks]]; rebuild the whole index.
  try { require('./wiki').rebuildWikiIndex(); } catch (e) { console.error('wiki reindex after merge:', e); }
  return summary;
}

module.exports = { getDB, adaptDb, exportDatabaseTo, importDatabaseMerge };
