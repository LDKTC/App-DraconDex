'use strict';
// ═══ Legacy → v3 migration (progress.md Phase 24) ══════════════════════
// Lazy, NON-DESTRUCTIVE: one transaction maps a legacy project tree
// (Director project / Navigator world / Hero game / Writer project) onto
// a fresh Manager Major + Minors in the Nexus nest. Original rows/data are
// never touched or deleted — the source project is only flagged
// (migrated_v3=1) so it stops being offered again; the user can still
// remove it manually once satisfied. Triggered from the Nexus Nest Hub's
// "Legacy Import" section ("นำเข้าเป็น v3", src/renderer/hub.js).
const { getDB } = require('./core');

const LEGACY_TABLE = { director: 'project', navigator: 'world_project', hero: 'game_project', writer: 'write_project' };

function migrateLegacy(nexusId, target, legacyId) {
  const d = getDB();
  const module_ = require('./module');
  const classifier = require('./classifier');
  const author = require('./author');
  const counts = { modules: 0, objects: 0, events: 0, chapters: 0, dialogues: 0 };
  const mkModule = (parentId, name, kind, catType) => {
    counts.modules++;
    return module_.createModule({ nexus_ref: nexusId, parent_id: parentId, name, kind, cat_type: catType || null });
  };
  // one classifier from (templates[], objects[{name, note, values:Map tplIdx->value}])
  const mkClassifier = (parentId, name, catType, templates, objects) => {
    const cid = mkModule(parentId, name, 'classifier', catType);
    const tplIds = templates.map(tf => classifier.createTemplate(cid, tf.name, tf.type || 'text', !!tf.levelable, false, null));
    for (const o of objects) {
      const oid = classifier.createObject(cid, o.name, null);
      if (o.note) classifier.updateObjectNote(oid, o.note);
      (o.values || []).forEach((v, i) => {
        if (v != null && v !== '' && tplIds[i] != null) classifier.upsertAttr(oid, tplIds[i], String(v));
      });
      counts.objects++;
    }
    return cid;
  };
  const mkChronicler = (parentId, name, events) => {
    const mid = mkModule(parentId, name, 'chronicler');
    const tlId = d.prepare(`INSERT INTO timeline (line_name, module_ref) VALUES (?,?)`).run(name, mid).lastInsertRowid;
    const dateId = (dt) => {
      const row = d.prepare(`SELECT id FROM timeline_date WHERE day=? AND month=? AND years=? AND hour=? AND minute=?`)
        .get(dt.day, dt.month, dt.years, dt.hour || 0, dt.minute || 0);
      if (row) return row.id;
      return d.prepare(`INSERT INTO timeline_date (day,month,years,hour,minute) VALUES (?,?,?,?,?)`)
        .run(dt.day, dt.month, dt.years, dt.hour || 0, dt.minute || 0).lastInsertRowid;
    };
    for (const ev of events) {
      d.prepare(`INSERT INTO timeline_event (timeline_id, event_name, start_at, story) VALUES (?,?,?,?)`)
        .run(tlId, ev.name, dateId(ev.date), ev.story || null);
      counts.events++;
    }
    return mid;
  };
  const mkLocator = (parentId, name, legacyMapId) => {
    const mid = mkModule(parentId, name, 'locator');
    const newMapId = d.prepare(`INSERT INTO map (map_name, module_ref) VALUES (?,?)`).run(name, mid).lastInsertRowid;
    for (const a of d.prepare(`SELECT * FROM map_area WHERE map_id=?`).all(legacyMapId)) {
      const newAreaId = d.prepare(`INSERT INTO map_area (map_id, area_name, color) VALUES (?,?,?)`)
        .run(newMapId, a.area_name, a.color).lastInsertRowid;
      for (const pt of d.prepare(`SELECT * FROM map_point WHERE area_id=? ORDER BY point_order`).all(a.id)) {
        d.prepare(`INSERT INTO map_point (area_id, point_order, x, y) VALUES (?,?,?,?)`)
          .run(newAreaId, pt.point_order, pt.x, pt.y);
      }
    }
    return mid;
  };
  const mkDrafter = (parentId, name, content) => {
    const mid = mkModule(parentId, name, 'drafter');
    if (content) module_.updateModuleDescription(mid, content);
    return mid;
  };
  const descsToMarkdown = (rows) =>
    rows.map(r => `## ${r.attribute_name || '—'}\n\n${r.attribute_text || ''}`).join('\n\n');

  const tx = d.transaction(() => {
    let majorId = null;

    if (target === 'director') {
      const p = d.prepare(`SELECT * FROM project WHERE id=?`).get(legacyId);
      if (!p) throw new Error('project not found');
      majorId = mkModule(null, p.name, 'manager');
      for (const cat of d.prepare(`SELECT * FROM object_category WHERE project_id=?`).all(legacyId)) {
        const tpls = d.prepare(`SELECT * FROM object_template WHERE category_id=? ORDER BY display_order, id`).all(cat.id);
        const objs = d.prepare(`SELECT * FROM object WHERE category_id=?`).all(cat.id).map(o => ({
          name: o.name, note: o.note,
          values: tpls.map(tp => d.prepare(`SELECT attribute_value FROM object_attribute WHERE object_id=? AND template_id=?`).get(o.id, tp.id)?.attribute_value),
        }));
        mkClassifier(majorId, cat.category_name, 'object',
          tpls.map(tp => ({ name: tp.description, type: tp.attribute_type })), objs);
      }
      for (const tl of d.prepare(`SELECT * FROM timeline WHERE project_id=?`).all(legacyId)) {
        const evs = d.prepare(`
          SELECT te.event_name, te.story, td.day, td.month, td.years, td.hour, td.minute
          FROM timeline_event te JOIN timeline_date td ON te.start_at=td.id WHERE te.timeline_id=?
        `).all(tl.id).map(r => ({ name: r.event_name, story: r.story, date: r }));
        mkChronicler(majorId, tl.line_name || p.name, evs);
      }
      for (const mp of d.prepare(`SELECT * FROM map WHERE project_id=?`).all(legacyId)) {
        mkLocator(majorId, mp.map_name || p.name, mp.id);
      }
      const descs = d.prepare(`SELECT * FROM project_description WHERE project_id=?`).all(legacyId);
      if (descs.length) mkDrafter(majorId, p.name, descsToMarkdown(descs));
    }

    else if (target === 'navigator') {
      const w = d.prepare(`SELECT * FROM world_project WHERE id=?`).get(legacyId);
      if (!w) throw new Error('world not found');
      majorId = mkModule(null, w.name, 'manager');
      const chars = d.prepare(`SELECT * FROM world_character WHERE world_ref=?`).all(legacyId)
        .map(c => ({ name: c.name, note: null, values: [] }));
      if (chars.length) mkClassifier(majorId, 'Characters', 'character', [], chars);
      for (const cat of d.prepare(`SELECT * FROM world_orig_category WHERE world_ref=?`).all(legacyId)) {
        const tpls = d.prepare(`SELECT * FROM world_orig_template WHERE category_id=? ORDER BY display_order, id`).all(cat.id);
        const objs = d.prepare(`SELECT * FROM world_orig_object WHERE category_id=?`).all(cat.id).map(o => ({
          name: o.name, note: o.note,
          values: tpls.map(tp => d.prepare(`SELECT attribute_value FROM world_orig_attribute WHERE object_id=? AND template_id=?`).get(o.id, tp.id)?.attribute_value),
        }));
        mkClassifier(majorId, cat.category_name, 'object',
          tpls.map(tp => ({ name: tp.description, type: tp.attribute_type })), objs);
      }
      for (const wm of d.prepare(`
        SELECT wm.id AS wmid, m.id AS map_id, m.map_name FROM world_map wm JOIN map m ON wm.map_ref=m.id
        WHERE wm.world_ref=?`).all(legacyId)) {
        mkLocator(majorId, wm.map_name || w.name, wm.map_id);
      }
      for (const tl of d.prepare(`SELECT * FROM world_timeline WHERE world_ref=?`).all(legacyId)) {
        const evs = d.prepare(`
          SELECT td.day, td.month, td.years, td.hour, td.minute
          FROM world_timeline_event te JOIN world_timeline_date td ON te.date_ref=td.id WHERE te.timeline_ref=?
        `).all(tl.id).map(r => ({ name: `${r.day}/${r.month}/${r.years}`, story: null, date: r }));
        mkChronicler(majorId, tl.name, evs);
      }
      const descs = d.prepare(`SELECT * FROM world_description WHERE world_ref=?`).all(legacyId);
      if (descs.length) mkDrafter(majorId, w.name, descsToMarkdown(descs));
    }

    else if (target === 'hero') {
      const g = d.prepare(`SELECT * FROM game_project WHERE id=?`).get(legacyId);
      if (!g) throw new Error('game not found');
      majorId = mkModule(null, g.name, 'manager');
      const ctpls = d.prepare(`SELECT * FROM game_char_template WHERE game_ref=?`).all(legacyId);
      const chars = d.prepare(`SELECT * FROM game_character WHERE game_ref=?`).all(legacyId).map(c => ({
        name: c.name, note: c.memo,
        values: ctpls.map(tp => d.prepare(`
          SELECT attribute_text FROM game_char_attribute WHERE char_ref=? AND template_ref=? ORDER BY level DESC LIMIT 1
        `).get(c.id, tp.id)?.attribute_text),
      }));
      if (chars.length || ctpls.length) {
        mkClassifier(majorId, 'Characters', 'character',
          ctpls.map(tp => ({ name: tp.attribute_name, type: tp.attribute_type, levelable: tp.levelable })), chars);
      }
      for (const col of d.prepare(`SELECT * FROM game_collection WHERE game_ref=?`).all(legacyId)) {
        const tpls = d.prepare(`SELECT * FROM game_col_template WHERE collection_ref=?`).all(col.id);
        const els = d.prepare(`SELECT * FROM game_col_element WHERE collection_ref=?`).all(col.id).map(e => ({
          name: e.name, note: null,
          values: tpls.map(tp => d.prepare(`
            SELECT attribute_text FROM game_col_attribute WHERE element_ref=? AND template_ref=? ORDER BY level DESC LIMIT 1
          `).get(e.id, tp.id)?.attribute_text),
        }));
        mkClassifier(majorId, col.name, 'element',
          tpls.map(tp => ({ name: tp.attribute_name, type: tp.attribute_type, levelable: tp.levelable })), els);
      }
      const charName = new Map(d.prepare(`SELECT id, name FROM game_character WHERE game_ref=?`).all(legacyId).map(c => [c.id, c.name]));
      for (const st of d.prepare(`SELECT * FROM game_story WHERE game_ref=?`).all(legacyId)) {
        const mid = mkModule(majorId, st.name, 'narrator');
        const dlgMap = new Map();
        for (const dl of d.prepare(`SELECT * FROM game_dialogue WHERE story_ref=?`).all(st.id)) {
          const nid = d.prepare(`INSERT INTO story_dialogue (module_ref, name, pos_x, pos_y) VALUES (?,?,?,?)`)
            .run(mid, dl.name, dl.pos_x || 0, dl.pos_y || 0).lastInsertRowid;
          dlgMap.set(dl.id, nid);
          counts.dialogues++;
          for (const cv of d.prepare(`SELECT * FROM game_conversation WHERE dialogue_ref=? ORDER BY talk_order`).all(dl.id)) {
            d.prepare(`INSERT INTO story_talk (dialogue_ref, speaker, talk_sentence, talk_order) VALUES (?,?,?,?)`)
              .run(nid, cv.char_ref ? (charName.get(cv.char_ref) || null) : null, cv.talk_sentence, cv.talk_order);
          }
        }
        for (const ln of d.prepare(`SELECT * FROM game_storyline WHERE story_ref=?`).all(st.id)) {
          const fromId = dlgMap.get(ln.from_ref), toId = dlgMap.get(ln.to_ref);
          if (fromId && toId) {
            d.prepare(`INSERT INTO story_edge (module_ref, from_ref, to_ref, label) VALUES (?,?,?,?)
              ON CONFLICT(from_ref, to_ref) DO NOTHING`).run(mid, fromId, toId, ln.symbol || null);
          }
        }
      }
    }

    else if (target === 'writer') {
      const wp = d.prepare(`SELECT * FROM write_project WHERE id=?`).get(legacyId);
      if (!wp) throw new Error('write project not found');
      majorId = mkModule(null, wp.project_name, 'manager');
      for (const se of d.prepare(`SELECT * FROM write_series WHERE project_id=?`).all(legacyId)) {
        for (const bk of d.prepare(`SELECT * FROM write_book WHERE series_id=?`).all(se.id)) {
          const mid = mkModule(majorId, bk.name, 'author');
          for (const ch of d.prepare(`SELECT * FROM write_chapter WHERE book_id=? ORDER BY chapter_order, id`).all(bk.id)) {
            const chId = author.createBookChapter(mid, ch.name);
            if (ch.chapter_content) author.updateBookChapterContent(chId, ch.chapter_content);
            counts.chapters++;
          }
        }
      }
      for (const nt of d.prepare(`SELECT * FROM write_note WHERE project_id=?`).all(legacyId)) {
        mkDrafter(majorId, nt.notename, null);
      }
    }

    else throw new Error(`unknown target ${target}`);

    d.prepare(`UPDATE ${LEGACY_TABLE[target]} SET migrated_v3=1 WHERE id=?`).run(legacyId);
    return majorId;
  });

  const id = tx();
  return { id, counts };
}

// Legacy project lists for the Nexus Nest Hub's Legacy Import section —
// excludes anything already flagged migrated_v3 (see migrateLegacy above).
function listLegacyProjects(target) {
  const d = getDB();
  const sqls = {
    director: `SELECT id, name FROM project WHERE migrated_v3=0 ORDER BY name COLLATE NOCASE`,
    navigator: `SELECT id, name FROM world_project WHERE migrated_v3=0 ORDER BY name COLLATE NOCASE`,
    hero: `SELECT id, name FROM game_project WHERE migrated_v3=0 ORDER BY name COLLATE NOCASE`,
    writer: `SELECT id, project_name AS name FROM write_project WHERE migrated_v3=0 ORDER BY project_name COLLATE NOCASE`,
  };
  try { return d.prepare(sqls[target]).all(); } catch (_) { return []; }
}

module.exports = { migrateLegacy, listLegacyProjects };
