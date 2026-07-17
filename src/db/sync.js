'use strict';
// Cloud sync prototype (Supabase). Snapshot-based: push serializes the whole
// vault (v3 module tree + notes + relations) into one JSON payload stored in
// the cloud; pull wipes the local vault content and rebuilds it from the
// snapshot with id remapping. Last-write-wins — no merging. All HTTP lives
// here in the main process (renderer never fetches); the server side is the
// RPC set in supabase/migrations/20260717000000_dracondex_sync_prototype.sql.
const crypto = require('crypto');
const { getDB } = require('./core');
const { getAppSetting, setAppSetting } = require('./versions');

const SNAPSHOT_FORMAT = 'dracondex-vault-snapshot';
const SNAPSHOT_VERSION = 1;

// ---------------------------------------------------------------------------
// Access keys — "Ertt-3fu6-Dd5t-Fd34": 4 groups of 4 mixed-case alphanumerics
// (62^16 ≈ 95 bits). The key is the sole credential; the server stores only
// its sha-256, so a generated key can never be re-shown later.
// ---------------------------------------------------------------------------
const KEY_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const KEY_RE = /^[A-Za-z0-9]{4}(-[A-Za-z0-9]{4}){3}$/;

function generateAccessKey() {
  const group = () =>
    Array.from({ length: 4 }, () => KEY_CHARSET[crypto.randomInt(KEY_CHARSET.length)]).join('');
  return [group(), group(), group(), group()].join('-');
}

// ---------------------------------------------------------------------------
// Config + per-vault link state (app_setting K/V)
// ---------------------------------------------------------------------------
function getSyncConfig() {
  const url = (getAppSetting('sync:url') || '').replace(/\/+$/, '');
  const anonKey = getAppSetting('sync:anonKey') || '';
  return { url, anonKey, configured: !!(url && anonKey) };
}

function setSyncConfig(url, anonKey) {
  setAppSetting('sync:url', String(url || '').trim().replace(/\/+$/, ''));
  setAppSetting('sync:anonKey', String(anonKey || '').trim());
  return { ok: true };
}

const vaultStateKey = (nexusId) => `sync:nexus:${nexusId}`;

function getVaultSyncState(nexusId) {
  try {
    const raw = getAppSetting(vaultStateKey(nexusId));
    if (!raw) return { linked: false };
    const s = JSON.parse(raw);
    return { linked: !!(s.vaultId && s.accessKey), ...s };
  } catch (_) {
    return { linked: false };
  }
}

function saveVaultSyncState(nexusId, state) {
  setAppSetting(vaultStateKey(nexusId), JSON.stringify(state));
}

function unlinkVault(nexusId) {
  getDB().prepare(`DELETE FROM app_setting WHERE key=?`).run(vaultStateKey(nexusId));
  return { ok: true };
}

// ---------------------------------------------------------------------------
// PostgREST RPC wrapper. Public sync functions never throw — they return
// { ok:true, ... } or { ok:false, code, error } so IPC never has to
// serialize an Error. Codes: no_config, not_linked, bad_key_format, bad_key,
// not_owner, too_large, bad_snapshot, network, auth, server.
// ---------------------------------------------------------------------------
const RPC_KNOWN_ERRORS = ['bad_key', 'not_owner', 'too_large'];

async function rpc(fn, params) {
  const { url, anonKey, configured } = getSyncConfig();
  if (!configured) return { ok: false, code: 'no_config' };
  let res;
  try {
    res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(30000),
    });
  } catch (e) {
    return { ok: false, code: 'network', error: String(e?.message || e) };
  }
  if (res.ok) {
    try { return { ok: true, data: await res.json() }; }
    catch (e) { return { ok: false, code: 'server', error: 'bad response body' }; }
  }
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) {
    return { ok: false, code: 'auth', error: body.message || `HTTP ${res.status}` };
  }
  const code = RPC_KNOWN_ERRORS.includes(body.message) ? body.message : 'server';
  return { ok: false, code, error: body.message || `HTTP ${res.status}` };
}

// ---------------------------------------------------------------------------
// serializeVault(nexusId) — the whole vault closure as one JSON object.
// Lookup FKs (use_color/hashtag/timeline_date) are resolved to natural keys
// here; every snapshot `id` field is the exporting DB's row id and is used
// ONLY as a remap key on import, never re-inserted.
// Excluded on purpose: module_version (history), import_file (local paths),
// wiki_link (rebuilt after pull), and all legacy project trees.
// ---------------------------------------------------------------------------
const dateKey = (d) => `${d.day}|${d.month}|${d.years}|${d.hour}|${d.minute}`;

function serializeVault(nexusId) {
  const db = getDB();
  const nexus = db.prepare(`
    SELECT n.name, n.memo, c.color_code AS colorCode
    FROM nexus n LEFT JOIN use_color c ON n.color = c.id WHERE n.id=?`).get(nexusId);
  if (!nexus) return null;

  const all = (sql) => db.prepare(sql).all(nexusId);

  const modules = all(`
    SELECT m.id, m.parent_id AS parentId, m.name, m.kind, m.icon,
           ic.color_code AS iconColorCode, cc.color_code AS colorCode,
           m.description, m.display_order AS displayOrder, m.pinned,
           m.cat_type AS catType, m.create_at AS createAt, m.update_at AS updateAt
    FROM module m
    LEFT JOIN use_color ic ON m.icon_color = ic.id
    LEFT JOIN use_color cc ON m.color = cc.id
    WHERE m.nexus_ref=? ORDER BY m.id`);

  const moduleAttrs = all(`
    SELECT a.module_ref AS moduleId, a.attr_name AS name, a.attr_value AS value,
           a.display_order AS displayOrder
    FROM module_attribute a JOIN module m ON a.module_ref=m.id
    WHERE m.nexus_ref=? ORDER BY a.id`);

  const moduleUi = all(`
    SELECT u.module_ref AS moduleId, u.ui_key AS key, u.ui_value AS value
    FROM module_ui u JOIN module m ON u.module_ref=m.id WHERE m.nexus_ref=?`);

  const moduleTags = all(`
    SELECT mh.module_ref AS moduleId, h.tag_name AS tagName, hc.color_code AS colorCode
    FROM module_hashtag mh
    JOIN module m ON mh.module_ref=m.id
    JOIN hashtag h ON mh.hashtag_id=h.id
    LEFT JOIN use_color hc ON h.tag_color=hc.id
    WHERE m.nexus_ref=?`);

  const classifier = {
    objects: all(`
      SELECT o.id, o.module_ref AS moduleId, o.name, c.color_code AS colorCode,
             o.note, o.display_order AS displayOrder
      FROM classifier_object o JOIN module m ON o.module_ref=m.id
      LEFT JOIN use_color c ON o.color=c.id WHERE m.nexus_ref=? ORDER BY o.id`),
    templates: all(`
      SELECT t.id, t.module_ref AS moduleId, t.object_ref AS objectId, t.description,
             t.attribute_type AS attributeType, t.levelable, t.has_condition AS hasCondition,
             t.display_order AS displayOrder
      FROM classifier_template t JOIN module m ON t.module_ref=m.id
      WHERE m.nexus_ref=? ORDER BY t.id`),
    attributes: all(`
      SELECT a.object_ref AS objectId, a.template_ref AS templateId,
             a.attribute_value AS value
      FROM classifier_attribute a
      JOIN classifier_object o ON a.object_ref=o.id
      JOIN module m ON o.module_ref=m.id WHERE m.nexus_ref=?`),
  };

  // v3 Locator/Chronicler rows have module_ref set (project_id NULL) — select
  // via the module join only so legacy project maps/timelines never leak in.
  const locator = {
    maps: all(`
      SELECT mp.id, mp.module_ref AS moduleId, mp.map_name AS name, c.color_code AS colorCode
      FROM map mp JOIN module m ON mp.module_ref=m.id
      LEFT JOIN use_color c ON mp.color=c.id WHERE m.nexus_ref=? ORDER BY mp.id`),
    areas: all(`
      SELECT a.id, a.map_id AS mapId, a.area_name AS name, c.color_code AS colorCode
      FROM map_area a JOIN map mp ON a.map_id=mp.id JOIN module m ON mp.module_ref=m.id
      LEFT JOIN use_color c ON a.color=c.id WHERE m.nexus_ref=? ORDER BY a.id`),
    points: all(`
      SELECT p.area_id AS areaId, p.point_order AS "order", p.x, p.y
      FROM map_point p JOIN map_area a ON p.area_id=a.id
      JOIN map mp ON a.map_id=mp.id JOIN module m ON mp.module_ref=m.id
      WHERE m.nexus_ref=? ORDER BY p.id`),
  };

  const chronicler = {
    timelines: all(`
      SELECT t.id, t.module_ref AS moduleId, t.line_name AS name, c.color_code AS colorCode
      FROM timeline t JOIN module m ON t.module_ref=m.id
      LEFT JOIN use_color c ON t.color=c.id WHERE m.nexus_ref=? ORDER BY t.id`),
    events: all(`
      SELECT e.id, e.timeline_id AS timelineId, e.event_name AS name,
             sd.day AS sDay, sd.month AS sMonth, sd.years AS sYears, sd.hour AS sHour, sd.minute AS sMinute,
             ed.day AS eDay, ed.month AS eMonth, ed.years AS eYears, ed.hour AS eHour, ed.minute AS eMinute,
             c.color_code AS colorCode, e.story
      FROM timeline_event e
      JOIN timeline t ON e.timeline_id=t.id JOIN module m ON t.module_ref=m.id
      JOIN timeline_date sd ON e.start_at=sd.id
      LEFT JOIN timeline_date ed ON e.end_at=ed.id
      LEFT JOIN use_color c ON e.color=c.id
      WHERE m.nexus_ref=? ORDER BY e.id`).map((e) => ({
        id: e.id, timelineId: e.timelineId, name: e.name,
        startKey: dateKey({ day: e.sDay, month: e.sMonth, years: e.sYears, hour: e.sHour, minute: e.sMinute }),
        endKey: e.eDay == null ? null
          : dateKey({ day: e.eDay, month: e.eMonth, years: e.eYears, hour: e.eHour, minute: e.eMinute }),
        colorCode: e.colorCode, story: e.story,
      })),
  };

  const dates = all(`
    SELECT DISTINCT d.day, d.month, d.years, d.hour, d.minute
    FROM timeline_date d
    JOIN timeline_event e ON e.start_at=d.id OR e.end_at=d.id
    JOIN timeline t ON e.timeline_id=t.id JOIN module m ON t.module_ref=m.id
    WHERE m.nexus_ref=?`).map((d) => ({ key: dateKey(d), ...d }));

  const wanderer = {
    mapEvents: all(`
      SELECT me.module_ref AS moduleId, me.event_ref AS eventId, me.area_ref AS areaId,
             me.label, me.x, me.y
      FROM map_event me JOIN module m ON me.module_ref=m.id
      WHERE m.nexus_ref=? ORDER BY me.id`),
  };

  const narrator = {
    dialogues: all(`
      SELECT d.id, d.module_ref AS moduleId, d.name, c.color_code AS colorCode,
             d.pos_x AS posX, d.pos_y AS posY
      FROM story_dialogue d JOIN module m ON d.module_ref=m.id
      LEFT JOIN use_color c ON d.color=c.id WHERE m.nexus_ref=? ORDER BY d.id`),
    edges: all(`
      SELECT e.module_ref AS moduleId, e.from_ref AS fromId, e.to_ref AS toId, e.label
      FROM story_edge e JOIN module m ON e.module_ref=m.id WHERE m.nexus_ref=?`),
    talks: all(`
      SELECT tk.dialogue_ref AS dialogueId, tk.speaker, tk.talk_sentence AS sentence,
             tk.talk_order AS "order"
      FROM story_talk tk JOIN story_dialogue d ON tk.dialogue_ref=d.id
      JOIN module m ON d.module_ref=m.id WHERE m.nexus_ref=? ORDER BY tk.id`),
  };

  const author = {
    chapters: all(`
      SELECT ch.id, ch.module_ref AS moduleId, ch.name, ch.chapter_content AS content,
             ch.chapter_order AS "order"
      FROM book_chapter ch JOIN module m ON ch.module_ref=m.id
      WHERE m.nexus_ref=? ORDER BY ch.id`),
  };

  const chatscribe = {
    sessions: all(`
      SELECT s.id, s.module_ref AS moduleId, s.name, s.session_order AS "order",
             s.create_at AS createAt
      FROM chat_session s JOIN module m ON s.module_ref=m.id
      WHERE m.nexus_ref=? ORDER BY s.id`),
    messages: all(`
      SELECT msg.session_ref AS sessionId, msg.message, msg.create_at AS createAt
      FROM chat_message msg JOIN chat_session s ON msg.session_ref=s.id
      JOIN module m ON s.module_ref=m.id WHERE m.nexus_ref=? ORDER BY msg.id`),
  };

  const sketcher = {
    pages: all(`
      SELECT p.id, p.module_ref AS moduleId, p.name, p.page_order AS "order"
      FROM sketch_page p JOIN module m ON p.module_ref=m.id
      WHERE m.nexus_ref=? ORDER BY p.id`),
    strokes: all(`
      SELECT st.page_ref AS pageId, st.color, st.width, st.points
      FROM sketch_stroke st JOIN sketch_page p ON st.page_ref=p.id
      JOIN module m ON p.module_ref=m.id WHERE m.nexus_ref=? ORDER BY st.id`),
    pins: all(`
      SELECT pn.page_ref AS pageId, pn.linker_key AS linkerKey, pn.x, pn.y
      FROM sketch_pin pn JOIN sketch_page p ON pn.page_ref=p.id
      JOIN module m ON p.module_ref=m.id WHERE m.nexus_ref=? ORDER BY pn.id`),
  };

  const designer = {
    nodes: all(`
      SELECT n.id, n.module_ref AS moduleId, n.shape, n.x, n.y, n.node_text AS text,
             n.color, n.linker_key AS linkerKey
      FROM design_node n JOIN module m ON n.module_ref=m.id
      WHERE m.nexus_ref=? ORDER BY n.id`),
    edges: all(`
      SELECT e.module_ref AS moduleId, e.from_ref AS fromId, e.to_ref AS toId, e.label
      FROM design_edge e JOIN module m ON e.module_ref=m.id WHERE m.nexus_ref=?`),
  };

  const relations = all(`
    SELECT from_key AS fromKey, to_key AS toKey, label
    FROM entity_relation WHERE nexus_ref=? ORDER BY id`);

  const notes = {
    folders: all(`
      SELECT f.id, f.parent_ref AS parentId, f.name, c.color_code AS colorCode
      FROM note_folder f LEFT JOIN use_color c ON f.color=c.id
      WHERE f.nexus_ref=? ORDER BY f.id`),
    notes: all(`
      SELECT n.id, n.folder_ref AS folderId, n.title, n.content,
             c.color_code AS colorCode, n.pinned
      FROM note n LEFT JOIN use_color c ON n.color=c.id
      WHERE n.nexus_ref=? ORDER BY n.id`),
  };

  // Every color code referenced anywhere above, deduped.
  const colors = new Set();
  const addColor = (c) => { if (c) colors.add(c); };
  addColor(nexus.colorCode);
  modules.forEach((m) => { addColor(m.iconColorCode); addColor(m.colorCode); });
  moduleTags.forEach((t) => addColor(t.colorCode));
  classifier.objects.forEach((o) => addColor(o.colorCode));
  locator.maps.forEach((r) => addColor(r.colorCode));
  locator.areas.forEach((r) => addColor(r.colorCode));
  chronicler.timelines.forEach((r) => addColor(r.colorCode));
  chronicler.events.forEach((r) => addColor(r.colorCode));
  narrator.dialogues.forEach((r) => addColor(r.colorCode));
  notes.folders.forEach((r) => addColor(r.colorCode));
  notes.notes.forEach((r) => addColor(r.colorCode));

  const hashtags = [];
  const seenTags = new Set();
  moduleTags.forEach((t) => {
    if (!seenTags.has(t.tagName)) {
      seenTags.add(t.tagName);
      hashtags.push({ name: t.tagName, colorCode: t.colorCode || null });
    }
  });

  let pkgVersion = null;
  try { pkgVersion = require('../../package.json').version; } catch (_) {}

  return {
    format: SNAPSHOT_FORMAT,
    version: SNAPSHOT_VERSION,
    app: pkgVersion,
    exportedAt: new Date().toISOString(),
    nexus: { name: nexus.name, memo: nexus.memo, colorCode: nexus.colorCode },
    lookups: { colors: [...colors], hashtags, dates },
    modules, moduleAttrs, moduleUi, moduleTags,
    classifier, locator, chronicler, wanderer, narrator, author,
    chatscribe, sketcher, designer, relations, notes,
  };
}

// ---------------------------------------------------------------------------
// applySnapshot(nexusId, payload) — wipe-and-rebuild with id remap.
// Preserving snapshot ids is impossible (autoincrement collisions with other
// vaults), so children are re-keyed through in-memory old→new Maps.
// ---------------------------------------------------------------------------
function validateSnapshot(p) {
  if (!p || p.format !== SNAPSHOT_FORMAT || p.version !== SNAPSHOT_VERSION) return false;
  return Array.isArray(p.modules) && p.nexus && typeof p.nexus === 'object';
}

// "module_12" → "module_57" through the per-kind maps; null = unmappable
// (legacy kinds or a row the snapshot no longer contains).
function remapEntityKey(key, maps) {
  const m = /^([a-z]+)_(\d+)$/.exec(String(key || ''));
  if (!m) return null;
  const map = maps[m[1]];
  if (!map) return null;
  const mapped = map.get(Number(m[2]));
  return mapped == null ? null : `${m[1]}_${mapped}`;
}

function applySnapshot(nexusId, payload) {
  if (!validateSnapshot(payload)) return { ok: false, code: 'bad_snapshot' };
  const db = getDB();
  const arr = (a) => (Array.isArray(a) ? a : []);
  const sect = (s) => (s && typeof s === 'object' ? s : {});

  const summary = db.transaction(() => {
    // 1. Wipe the vault's synced content. module CASCADEs to every per-kind
    //    child incl. v3 map→map_area→map_point and timeline→timeline_event.
    db.prepare(`DELETE FROM module WHERE nexus_ref=?`).run(nexusId);
    db.prepare(`DELETE FROM entity_relation WHERE nexus_ref=?`).run(nexusId);
    db.prepare(`DELETE FROM note WHERE nexus_ref=?`).run(nexusId);
    db.prepare(`DELETE FROM note_folder WHERE nexus_ref=?`).run(nexusId);
    db.prepare(`DELETE FROM wiki_link WHERE nexus_ref=?`).run(nexusId);

    // 2. Lookups by natural key (same pattern as importDatabaseMerge).
    const lookups = sect(payload.lookups);
    const colorMap = new Map(); // color_code → id
    for (const code of arr(lookups.colors)) {
      if (!code) continue;
      db.prepare(`INSERT OR IGNORE INTO use_color (color_code) VALUES (?)`).run(code);
      colorMap.set(code, db.prepare(`SELECT id FROM use_color WHERE color_code=?`).get(code).id);
    }
    const colorId = (code) => (code && colorMap.has(code) ? colorMap.get(code) : null);

    const tagMap = new Map(); // tag_name → id
    for (const tg of arr(lookups.hashtags)) {
      if (!tg?.name) continue;
      db.prepare(`INSERT OR IGNORE INTO hashtag (tag_name, tag_color) VALUES (?,?)`)
        .run(tg.name, colorId(tg.colorCode));
      tagMap.set(tg.name, db.prepare(`SELECT id FROM hashtag WHERE tag_name=?`).get(tg.name).id);
    }

    const dateMap = new Map(); // "d|m|y|h|min" → id
    for (const d of arr(lookups.dates)) {
      db.prepare(`INSERT OR IGNORE INTO timeline_date (day,month,years,hour,minute) VALUES (?,?,?,?,?)`)
        .run(d.day, d.month, d.years, d.hour, d.minute);
      dateMap.set(d.key, db.prepare(
        `SELECT id FROM timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?`)
        .get(d.day, d.month, d.years, d.hour, d.minute).id);
    }

    // 3. Nexus row: memo/color only — the local vault NAME is kept (UNIQUE
    //    across vaults; the cloud name is display info in the sync state).
    db.prepare(`UPDATE nexus SET memo=?, color=?, update_at=datetime('now') WHERE id=?`)
      .run(payload.nexus.memo ?? null, colorId(payload.nexus.colorCode), nexusId);

    // 4. Modules, parents-first (BFS so a child never lands before its parent).
    const modMap = new Map();
    let pending = arr(payload.modules).slice();
    while (pending.length) {
      const next = [];
      let progressed = false;
      for (const m of pending) {
        if (m.parentId != null && !modMap.has(m.parentId)) { next.push(m); continue; }
        const r = db.prepare(`
          INSERT INTO module (nexus_ref, parent_id, name, kind, icon, icon_color, color,
                              description, display_order, pinned, cat_type, create_at, update_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,COALESCE(?,datetime('now')),COALESCE(?,datetime('now')))`)
          .run(nexusId, m.parentId != null ? modMap.get(m.parentId) : null, m.name, m.kind,
               m.icon ?? null, colorId(m.iconColorCode), colorId(m.colorCode),
               m.description ?? null, m.displayOrder ?? 0, m.pinned ?? 0, m.catType ?? null,
               m.createAt ?? null, m.updateAt ?? null);
        modMap.set(m.id, r.lastInsertRowid);
        progressed = true;
      }
      if (!progressed) break; // orphaned parentIds — drop the remainder
      pending = next;
    }
    const mod = (oldId) => modMap.get(oldId);

    // 5. Per-kind children, dependency order, each building its own map.
    for (const a of arr(payload.moduleAttrs)) {
      if (mod(a.moduleId) == null) continue;
      db.prepare(`INSERT INTO module_attribute (module_ref, attr_name, attr_value, display_order) VALUES (?,?,?,?)`)
        .run(mod(a.moduleId), a.name, a.value ?? null, a.displayOrder ?? 0);
    }
    for (const tg of arr(payload.moduleTags)) {
      if (mod(tg.moduleId) == null || !tagMap.has(tg.tagName)) continue;
      db.prepare(`INSERT OR IGNORE INTO module_hashtag (module_ref, hashtag_id) VALUES (?,?)`)
        .run(mod(tg.moduleId), tagMap.get(tg.tagName));
    }

    const cls = sect(payload.classifier);
    const cobjMap = new Map();
    for (const o of arr(cls.objects)) {
      if (mod(o.moduleId) == null) continue;
      const r = db.prepare(`INSERT INTO classifier_object (module_ref, name, color, note, display_order) VALUES (?,?,?,?,?)`)
        .run(mod(o.moduleId), o.name, colorId(o.colorCode), o.note ?? null, o.displayOrder ?? 0);
      cobjMap.set(o.id, r.lastInsertRowid);
    }
    const ctplMap = new Map();
    for (const t of arr(cls.templates)) {
      if (mod(t.moduleId) == null) continue;
      if (t.objectId != null && !cobjMap.has(t.objectId)) continue;
      const r = db.prepare(`
        INSERT INTO classifier_template (module_ref, object_ref, description, attribute_type,
                                         levelable, has_condition, display_order)
        VALUES (?,?,?,?,?,?,?)`)
        .run(mod(t.moduleId), t.objectId != null ? cobjMap.get(t.objectId) : null,
             t.description, t.attributeType ?? 'text', t.levelable ?? 0,
             t.hasCondition ?? 0, t.displayOrder ?? 0);
      ctplMap.set(t.id, r.lastInsertRowid);
    }
    for (const a of arr(cls.attributes)) {
      if (!cobjMap.has(a.objectId) || !ctplMap.has(a.templateId)) continue;
      db.prepare(`INSERT OR IGNORE INTO classifier_attribute (object_ref, template_ref, attribute_value) VALUES (?,?,?)`)
        .run(cobjMap.get(a.objectId), ctplMap.get(a.templateId), a.value ?? null);
    }

    const loc = sect(payload.locator);
    const mapMap = new Map();
    for (const r0 of arr(loc.maps)) {
      if (mod(r0.moduleId) == null) continue;
      const r = db.prepare(`INSERT INTO map (map_name, module_ref, color) VALUES (?,?,?)`)
        .run(r0.name ?? null, mod(r0.moduleId), colorId(r0.colorCode));
      mapMap.set(r0.id, r.lastInsertRowid);
    }
    const areaMap = new Map();
    for (const r0 of arr(loc.areas)) {
      if (!mapMap.has(r0.mapId)) continue;
      const r = db.prepare(`INSERT INTO map_area (map_id, area_name, color) VALUES (?,?,?)`)
        .run(mapMap.get(r0.mapId), r0.name ?? null, colorId(r0.colorCode));
      areaMap.set(r0.id, r.lastInsertRowid);
    }
    for (const p of arr(loc.points)) {
      if (!areaMap.has(p.areaId)) continue;
      db.prepare(`INSERT INTO map_point (area_id, point_order, x, y) VALUES (?,?,?,?)`)
        .run(areaMap.get(p.areaId), p.order ?? 0, p.x, p.y);
    }

    const chr = sect(payload.chronicler);
    const tlMap = new Map();
    for (const t of arr(chr.timelines)) {
      if (mod(t.moduleId) == null) continue;
      const r = db.prepare(`INSERT INTO timeline (line_name, module_ref, color) VALUES (?,?,?)`)
        .run(t.name ?? null, mod(t.moduleId), colorId(t.colorCode));
      tlMap.set(t.id, r.lastInsertRowid);
    }
    const evtMap = new Map();
    for (const e of arr(chr.events)) {
      if (!tlMap.has(e.timelineId) || !dateMap.has(e.startKey)) continue;
      const r = db.prepare(`
        INSERT INTO timeline_event (timeline_id, event_name, start_at, end_at, color, story)
        VALUES (?,?,?,?,?,?)`)
        .run(tlMap.get(e.timelineId), e.name ?? null, dateMap.get(e.startKey),
             e.endKey != null && dateMap.has(e.endKey) ? dateMap.get(e.endKey) : null,
             colorId(e.colorCode), e.story ?? null);
      evtMap.set(e.id, r.lastInsertRowid);
    }

    for (const me of arr(sect(payload.wanderer).mapEvents)) {
      if (mod(me.moduleId) == null) continue;
      db.prepare(`INSERT INTO map_event (module_ref, event_ref, area_ref, label, x, y) VALUES (?,?,?,?,?,?)`)
        .run(mod(me.moduleId),
             me.eventId != null && evtMap.has(me.eventId) ? evtMap.get(me.eventId) : null,
             me.areaId != null && areaMap.has(me.areaId) ? areaMap.get(me.areaId) : null,
             me.label ?? null, me.x ?? 0, me.y ?? 0);
    }

    const nar = sect(payload.narrator);
    const dlgMap = new Map();
    for (const d of arr(nar.dialogues)) {
      if (mod(d.moduleId) == null) continue;
      const r = db.prepare(`INSERT INTO story_dialogue (module_ref, name, color, pos_x, pos_y) VALUES (?,?,?,?,?)`)
        .run(mod(d.moduleId), d.name, colorId(d.colorCode), d.posX ?? 0, d.posY ?? 0);
      dlgMap.set(d.id, r.lastInsertRowid);
    }
    for (const e of arr(nar.edges)) {
      if (mod(e.moduleId) == null || !dlgMap.has(e.fromId) || !dlgMap.has(e.toId)) continue;
      db.prepare(`INSERT OR IGNORE INTO story_edge (module_ref, from_ref, to_ref, label) VALUES (?,?,?,?)`)
        .run(mod(e.moduleId), dlgMap.get(e.fromId), dlgMap.get(e.toId), e.label ?? null);
    }
    for (const tk of arr(nar.talks)) {
      if (!dlgMap.has(tk.dialogueId)) continue;
      db.prepare(`INSERT INTO story_talk (dialogue_ref, speaker, talk_sentence, talk_order) VALUES (?,?,?,?)`)
        .run(dlgMap.get(tk.dialogueId), tk.speaker ?? null, tk.sentence ?? null, tk.order ?? 0);
    }

    const bchpMap = new Map();
    for (const ch of arr(sect(payload.author).chapters)) {
      if (mod(ch.moduleId) == null) continue;
      const r = db.prepare(`INSERT INTO book_chapter (module_ref, name, chapter_content, chapter_order) VALUES (?,?,?,?)`)
        .run(mod(ch.moduleId), ch.name, ch.content ?? null, ch.order ?? 0);
      bchpMap.set(ch.id, r.lastInsertRowid);
    }

    const cht = sect(payload.chatscribe);
    const chssMap = new Map();
    for (const s of arr(cht.sessions)) {
      if (mod(s.moduleId) == null) continue;
      const r = db.prepare(`
        INSERT INTO chat_session (module_ref, name, session_order, create_at)
        VALUES (?,?,?,COALESCE(?,datetime('now')))`)
        .run(mod(s.moduleId), s.name, s.order ?? 0, s.createAt ?? null);
      chssMap.set(s.id, r.lastInsertRowid);
    }
    for (const msg of arr(cht.messages)) {
      if (!chssMap.has(msg.sessionId)) continue;
      db.prepare(`INSERT INTO chat_message (session_ref, message, create_at) VALUES (?,?,COALESCE(?,datetime('now')))`)
        .run(chssMap.get(msg.sessionId), msg.message, msg.createAt ?? null);
    }

    const skt = sect(payload.sketcher);
    const pageMap = new Map();
    for (const p of arr(skt.pages)) {
      if (mod(p.moduleId) == null) continue;
      const r = db.prepare(`INSERT INTO sketch_page (module_ref, name, page_order) VALUES (?,?,?)`)
        .run(mod(p.moduleId), p.name, p.order ?? 0);
      pageMap.set(p.id, r.lastInsertRowid);
    }
    for (const st of arr(skt.strokes)) {
      if (!pageMap.has(st.pageId)) continue;
      db.prepare(`INSERT INTO sketch_stroke (page_ref, color, width, points) VALUES (?,?,?,?)`)
        .run(pageMap.get(st.pageId), st.color ?? null, st.width ?? 3, st.points);
    }

    const dsg = sect(payload.designer);
    const dnodeMap = new Map();
    // Nodes first WITHOUT linker_key remap (the target maps are complete by
    // now, but keep one code path: remap inline since all maps exist here).
    const keyMaps = { module: modMap, cobj: cobjMap, bchp: bchpMap, chss: chssMap };

    let droppedPins = 0;
    for (const pn of arr(skt.pins)) {
      if (!pageMap.has(pn.pageId)) continue;
      const k = remapEntityKey(pn.linkerKey, keyMaps);
      if (!k) { droppedPins++; continue; } // linker_key NOT NULL — drop unmappable pins
      db.prepare(`INSERT INTO sketch_pin (page_ref, linker_key, x, y) VALUES (?,?,?,?)`)
        .run(pageMap.get(pn.pageId), k, pn.x ?? 0, pn.y ?? 0);
    }

    for (const n of arr(dsg.nodes)) {
      if (mod(n.moduleId) == null) continue;
      const k = n.linkerKey ? remapEntityKey(n.linkerKey, keyMaps) : null;
      const r = db.prepare(`
        INSERT INTO design_node (module_ref, shape, x, y, node_text, color, linker_key)
        VALUES (?,?,?,?,?,?,?)`)
        .run(mod(n.moduleId), n.shape ?? 'box', n.x ?? 0, n.y ?? 0,
             n.text ?? null, n.color ?? null, k);
      dnodeMap.set(n.id, r.lastInsertRowid);
    }
    for (const e of arr(dsg.edges)) {
      if (mod(e.moduleId) == null || !dnodeMap.has(e.fromId) || !dnodeMap.has(e.toId)) continue;
      db.prepare(`INSERT OR IGNORE INTO design_edge (module_ref, from_ref, to_ref, label) VALUES (?,?,?,?)`)
        .run(mod(e.moduleId), dnodeMap.get(e.fromId), dnodeMap.get(e.toId), e.label ?? null);
    }

    // Notes (folder tree parents-first), then relations — noteMap joins the
    // key maps so note_<id> relation endpoints remap too.
    const nts = sect(payload.notes);
    const nfMap = new Map();
    let pendingF = arr(nts.folders).slice();
    while (pendingF.length) {
      const next = [];
      let progressed = false;
      for (const f of pendingF) {
        if (f.parentId != null && !nfMap.has(f.parentId)) { next.push(f); continue; }
        const r = db.prepare(`INSERT INTO note_folder (nexus_ref, parent_ref, name, color) VALUES (?,?,?,?)`)
          .run(nexusId, f.parentId != null ? nfMap.get(f.parentId) : null, f.name, colorId(f.colorCode));
        nfMap.set(f.id, r.lastInsertRowid);
        progressed = true;
      }
      if (!progressed) break;
      pendingF = next;
    }
    const noteMap = new Map();
    for (const n of arr(nts.notes)) {
      const r = db.prepare(`
        INSERT OR IGNORE INTO note (nexus_ref, folder_ref, title, content, color, pinned)
        VALUES (?,?,?,?,?,?)`)
        .run(nexusId, n.folderId != null && nfMap.has(n.folderId) ? nfMap.get(n.folderId) : null,
             n.title, n.content ?? '', colorId(n.colorCode), n.pinned ?? 0);
      if (r.changes) noteMap.set(n.id, r.lastInsertRowid);
    }
    keyMaps.note = noteMap;

    let droppedRelations = 0;
    for (const rel of arr(payload.relations)) {
      const fk = remapEntityKey(rel.fromKey, keyMaps);
      const tk = remapEntityKey(rel.toKey, keyMaps);
      if (!fk || !tk) { droppedRelations++; continue; }
      db.prepare(`INSERT OR IGNORE INTO entity_relation (nexus_ref, from_key, to_key, label) VALUES (?,?,?,?)`)
        .run(nexusId, fk, tk, rel.label ?? null);
    }

    // module_ui last: Wanderer's mapModule/timelineModule values are module
    // ids and must go through modMap. Other ui values are copied verbatim —
    // any entity id embedded in them (e.g. viewer filter defs) stays stale;
    // documented prototype limitation.
    for (const u of arr(payload.moduleUi)) {
      if (mod(u.moduleId) == null) continue;
      let value = u.value;
      if (u.key === 'mapModule' || u.key === 'timelineModule') {
        const target = modMap.get(Number(u.value));
        if (target == null) continue;
        value = String(target);
      }
      db.prepare(`INSERT OR IGNORE INTO module_ui (module_ref, ui_key, ui_value) VALUES (?,?,?)`)
        .run(mod(u.moduleId), u.key, value ?? null);
    }

    return {
      modules: modMap.size,
      notes: noteMap.size,
      relations: arr(payload.relations).length - droppedRelations,
      droppedRelations,
      droppedPins,
    };
  })();

  // Regenerate the wiki-link index (global — fine at prototype scale).
  try { require('./wiki').rebuildWikiIndex(); } catch (e) {
    console.error('sync: wiki rebuild after pull failed:', e);
  }

  return { ok: true, summary };
}

// ---------------------------------------------------------------------------
// Public sync operations (IPC surface)
// ---------------------------------------------------------------------------
async function syncStatus(nexusId) {
  const { configured } = getSyncConfig();
  const state = getVaultSyncState(nexusId);
  const out = {
    ok: true,
    configured,
    linked: state.linked,
    role: state.role || null,
    accessKey: state.accessKey || null,
    cloudName: state.cloudName || null,
    lastPushAt: state.lastPushAt || null,
    lastPullAt: state.lastPullAt || null,
    remote: null,
  };
  if (configured && state.linked) {
    const r = await rpc('sync_vault_status', { p_key: state.accessKey });
    if (r.ok) {
      out.remote = {
        name: r.data.name,
        snapshotAt: r.data.snapshot_at,
        keyCount: r.data.key_count,
      };
      if (r.data.role && r.data.role !== state.role) {
        out.role = r.data.role;
        saveVaultSyncState(nexusId, { ...state, role: r.data.role });
      }
    } else {
      out.remoteError = r.code;
    }
  }
  return out;
}

async function syncPushVault(nexusId) {
  const state = getVaultSyncState(nexusId);
  if (state.linked && state.role !== 'owner') return { ok: false, code: 'not_owner' };
  const snapshot = serializeVault(nexusId);
  if (!snapshot) return { ok: false, code: 'bad_snapshot', error: 'nexus not found' };

  if (!state.linked) {
    const key = generateAccessKey();
    const r = await rpc('sync_create_vault', {
      p_name: snapshot.nexus.name, p_snapshot: snapshot, p_owner_key: key,
    });
    if (!r.ok) return r;
    const now = new Date().toISOString();
    saveVaultSyncState(nexusId, {
      vaultId: r.data.vault_id, accessKey: key, role: 'owner',
      cloudName: snapshot.nexus.name, lastPushAt: now,
    });
    return { ok: true, created: true, accessKey: key, vaultId: r.data.vault_id, pushedAt: now };
  }

  const r = await rpc('sync_push_vault', {
    p_key: state.accessKey, p_name: snapshot.nexus.name, p_snapshot: snapshot,
  });
  if (!r.ok) return r;
  const now = new Date().toISOString();
  saveVaultSyncState(nexusId, { ...state, cloudName: snapshot.nexus.name, lastPushAt: now });
  return { ok: true, pushedAt: now };
}

// The renderer runs its uiConfirm BEFORE invoking this — pulling overwrites
// the local vault's synced content.
async function syncPullVault(nexusId) {
  const state = getVaultSyncState(nexusId);
  if (!state.linked) return { ok: false, code: 'not_linked' };
  const r = await rpc('sync_pull_vault', { p_key: state.accessKey });
  if (!r.ok) return r;
  let applied;
  try {
    applied = applySnapshot(nexusId, r.data.snapshot);
  } catch (e) {
    console.error('sync: applySnapshot failed:', e);
    return { ok: false, code: 'bad_snapshot', error: String(e?.message || e) };
  }
  if (!applied.ok) return applied;
  const now = new Date().toISOString();
  saveVaultSyncState(nexusId, { ...state, cloudName: r.data.name, lastPullAt: now });
  return { ok: true, pulledAt: now, summary: applied.summary };
}

async function syncLinkVault(nexusId, accessKey) {
  const key = String(accessKey || '').trim();
  if (!KEY_RE.test(key)) return { ok: false, code: 'bad_key_format' };
  const state = getVaultSyncState(nexusId);
  if (state.linked) return { ok: false, code: 'already_linked' };
  const r = await rpc('sync_vault_status', { p_key: key });
  if (!r.ok) return r;
  saveVaultSyncState(nexusId, {
    vaultId: r.data.vault_id, accessKey: key, role: r.data.role, cloudName: r.data.name,
  });
  return { ok: true, role: r.data.role, cloudName: r.data.name, snapshotAt: r.data.snapshot_at };
}

// Read-only key: generated locally, registered by hash server-side, shown
// once in the modal, never stored on this machine.
async function syncCreateReadKey(nexusId) {
  const state = getVaultSyncState(nexusId);
  if (!state.linked) return { ok: false, code: 'not_linked' };
  if (state.role !== 'owner') return { ok: false, code: 'not_owner' };
  const newKey = generateAccessKey();
  const r = await rpc('sync_create_read_key', { p_owner_key: state.accessKey, p_new_key: newKey });
  if (!r.ok) return r;
  return { ok: true, readKey: newKey };
}

module.exports = {
  getSyncConfig, setSyncConfig, getVaultSyncState, unlinkVault,
  generateAccessKey, serializeVault, applySnapshot,
  syncStatus, syncPushVault, syncPullVault, syncLinkVault, syncCreateReadKey,
};
