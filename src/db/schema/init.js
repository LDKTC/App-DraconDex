'use strict';
// Schema fingerprint + the one-time init path. schemaStamp() hashes the SQL
// *and the source text* of every migration function, so any edit to them
// invalidates the stamp and initDB re-runs its (idempotent) work once.
const { _now, _t, hasTable, hasColumn, hasAnyMissingColumns } = require('../conn');
const { DDL_SQL } = require('./ddl');
const { INDEX_SQL } = require('./indexes');
const { SEED_SYMBOLS } = require('./seed');
const {
  migrateInlineColumns, migrateNexusV28, migrateMapV3, migrateTimelineV3,
  migrateWriterV27, migrateHeroV26, ensureIndexes,
} = require('./migrations');
const SCHEMA_EPOCH = 1;
let _schemaStamp = null;
function schemaStamp() {
  if (_schemaStamp !== null) return _schemaStamp;
  const parts = [
    String(SCHEMA_EPOCH), DDL_SQL, INDEX_SQL, SEED_SYMBOLS.join('\x01'),
    String(initDB), String(migrateInlineColumns), String(migrateNexusV28),
    String(migrateMapV3), String(migrateTimelineV3), String(migrateWriterV27),
    String(migrateHeroV26), String(ensureIndexes),
  ];
  // user_version is a signed 32-bit field; take 4 bytes and force it positive
  // so 0 stays reserved for "never stamped".
  const h = require('crypto').createHash('sha1').update(parts.join('\x00')).digest();
  _schemaStamp = (h.readUInt32BE(0) & 0x7fffffff) || 1;
  return _schemaStamp;
}

// Takes the open connection as an argument — it used to close over the `db`
// module binding that now lives in conn.js. Every migration below already took
// its connection this way. NOTE: this signature change alters String(initDB)
// and therefore schemaStamp(), so the first launch after this change re-runs
// the (idempotent) init path once and re-stamps.
function initDB(db) {
  // Fast path: schema already matches this build. Everything below is idempotent,
  // so the only cost of a false miss is doing the work we'd have done anyway.
  const want = schemaStamp();
  const have = Number(db.prepare(`PRAGMA user_version`).get()?.user_version || 0);
  if (have === want) { _t('initDB (skipped, stamp match)', _now()); return; }

  const tLegacyProbe = _now();
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
  _t('legacy-nav probe', tLegacyProbe);

  const tDDL = _now();
  db.exec(DDL_SQL);
  _t('DDL exec', tDDL);

  const tMigrations = _now();
  migrateInlineColumns(db);
  _t('migrations + seed', tMigrations);

  const tIndexes = _now();
  ensureIndexes(db);
  _t('ensureIndexes', tIndexes);
  // One-time backfill: index [[wikilinks]] already sitting in old content.
  // Lazy require avoids the core↔wiki module cycle (initDB runs after load).
  if (!hadWikiLinkTable) {
    const tBackfill = _now();
    try { require('../wiki').rebuildWikiIndex(); } catch (e) { console.error('wiki backfill error:', e); }
    _t('wiki backfill', tBackfill);
  }

  // Stamped LAST, and deliberately not inside a transaction: if anything above
  // throws or the process is killed mid-upgrade, the stamp is never written and
  // the whole (idempotent) path simply re-runs on the next launch. Wrapping
  // initDB in a transaction would also silently break migrateMapV3 /
  // migrateTimelineV3 / the legacy-nav drop, because PRAGMA foreign_keys is a
  // no-op inside a transaction.
  db.exec(`PRAGMA user_version = ${schemaStamp() | 0}`);
}

module.exports = { SCHEMA_EPOCH, schemaStamp, initDB };
