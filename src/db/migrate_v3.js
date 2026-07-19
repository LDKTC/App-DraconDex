'use strict';
// ═══ Legacy → v3 migration (progress.md Phase 24, rewritten for Plan.md
// part 2 §2) ═════════════════════════════════════════════════════════════
// Lazy, NON-DESTRUCTIVE: one transaction maps a legacy project tree
// (Director project / Navigator world / Hero game / Writer project / Scribe
// notes) onto a fresh Manager Major + real child module rows in the Nexus
// nest. Original rows/data are never touched or deleted — the source is
// only flagged (migrated_v3=1) so it stops being offered again. Triggered
// from the new "Import as Nexus Nest" choice in the import-choice modal
// (src/renderer/hub.js openImportChoiceModal), which itself now fires off
// the Import DB nav button's file-merge flow rather than the old Hub
// "Legacy Import" accordion.
//
// Every legacy object/event/area becomes a REAL child `module`-table row
// (kind 'inspector') rather than the old classifier_object/timeline_event
// content-item rows — this is a deliberate fidelity trade-off (confirmed
// with the user): objects lose their typed/searchable per-template columns
// in exchange for showing up as real Nest-tree nodes. One consequence: the
// owning classifier/chronicler/locator module's own native view (table/
// timeline/map) has nothing to show natively since its own content tables
// stay empty — the migrated data lives as sibling Nest-tree children
// instead, opened the same way any other module is.
const { getDB } = require('./core');

const LEGACY_TABLE = { director: 'project', navigator: 'world_project', hero: 'game_project', writer: 'write_project', scribe: 'note' };

function migrateLegacy(nexusId, target, legacyId, batchCtx) {
  const d = getDB();
  const module_ = require('./module');
  const viewer = require('./viewer');
  const author = require('./author');
  const counts = { modules: 0, objects: 0, events: 0, chapters: 0, dialogues: 0, relations: 0 };

  const mkModule = (parentId, name, kind, catType) => {
    counts.modules++;
    return module_.createModule({ nexus_ref: nexusId, parent_id: parentId, name, kind, cat_type: catType || null });
  };

  // Decision #4: legacy structured attributes get flattened into freeform
  // markdown on the new inspector module, since there's no longer a
  // classifier_template/classifier_attribute pair backing them.
  const attrsToMarkdown = (note, pairs) => {
    const lines = [];
    if (note) lines.push(note, '');
    for (const [label, value] of pairs) {
      if (value == null || value === '') continue;
      lines.push(`- **${label}:** ${value}`);
    }
    return lines.join('\n').trim();
  };

  const mkClassifierContainer = (parentId, name, catType) => mkModule(parentId, name, 'classifier', catType);

  // object: {name, note, values:[...] aligned to templates[{name}]}
  const mkObjectModule = (classifierId, obj, templates) => {
    const mid = mkModule(classifierId, obj.name, 'inspector');
    const body = attrsToMarkdown(obj.note, templates.map((tp, i) => [tp.name, obj.values?.[i]]));
    if (body) module_.updateModuleDescription(mid, body);
    counts.objects++;
    return mid;
  };

  const mkChroniclerContainer = (parentId, name) => {
    const mid = mkModule(parentId, name, 'chronicler');
    d.prepare(`INSERT INTO timeline (line_name, module_ref) VALUES (?,?)`).run(name, mid);
    return mid;
  };

  // event: {name, story, date:{day,month,years,hour,minute}}
  const mkEventModule = (chroniclerId, ev) => {
    const mid = mkModule(chroniclerId, ev.name || '—', 'inspector');
    if (ev.story) module_.updateModuleDescription(mid, ev.story);
    if (ev.date) {
      for (const [k, v] of [['day', ev.date.day], ['month', ev.date.month], ['years', ev.date.years], ['hour', ev.date.hour], ['minute', ev.date.minute]]) {
        if (v != null && v !== 0) module_.upsertModuleAttr(mid, null, k, String(v));
      }
    }
    counts.events++;
    return mid;
  };

  const mkLocatorContainer = (parentId, name) => {
    const mid = mkModule(parentId, name, 'locator');
    d.prepare(`INSERT INTO map (map_name, module_ref) VALUES (?,?)`).run(name, mid);
    return mid;
  };

  // area: {name, points:[{x,y}]}
  const mkAreaModule = (locatorId, area) => {
    const mid = mkModule(locatorId, area.name || '—', 'inspector');
    if (area.points?.length) {
      const body = '| x | y |\n|---|---|\n' + area.points.map(p => `| ${p.x} | ${p.y} |`).join('\n');
      module_.updateModuleDescription(mid, body);
    }
    return mid;
  };

  // Decision #5: descriptions stay combined into one module per project,
  // just as an 'inspector' module now instead of 'drafter'.
  const mkDescriptionNote = (parentId, name, rows) => {
    const body = rows.map(r => `## ${r.attribute_name || '—'}\n\n${r.attribute_text || ''}`).join('\n\n');
    if (!body.trim()) return null;
    const mid = mkModule(parentId, name, 'inspector');
    module_.updateModuleDescription(mid, body);
    return mid;
  };

  // Director's relation/relation_obob/relation_obtl/relation_tltl tables
  // (the only legacy source with a dedicated relation-instance schema) →
  // one 'connector' module whose saved filter scopes to this project's own
  // classifier/chronicler modules, with real entity_relation edges between
  // the migrated object/event inspector modules created above.
  const mkRelationConnector = (parentId, name, legacyProjectId, moduleIds, objModMap, eventModMap) => {
    const relRows = d.prepare(`SELECT * FROM relation WHERE project_id=?`).all(legacyProjectId);
    if (!relRows.length || !moduleIds.length) return null;
    const connId = mkModule(parentId, name, 'connector');
    module_.setModuleUi(connId, 'filterDef', JSON.stringify({ query: '', kinds: [], moduleIds, tag: '' }));
    for (const r of relRows) {
      const typeName = r.relation_type ? d.prepare(`SELECT relation_name FROM relation_type WHERE id=?`).get(r.relation_type)?.relation_name : null;
      for (const e of d.prepare(`SELECT * FROM relation_obob WHERE relation_id=?`).all(r.id)) {
        const from = objModMap.get(e.object_from), to = objModMap.get(e.object_to);
        if (from && to) { viewer.createEntityRelation(nexusId, `module_${from}`, `module_${to}`, typeName); counts.relations++; }
      }
      for (const e of d.prepare(`SELECT * FROM relation_obtl WHERE relation_id=?`).all(r.id)) {
        const from = objModMap.get(e.object_from), to = eventModMap.get(e.timeline_to);
        if (from && to) { viewer.createEntityRelation(nexusId, `module_${from}`, `module_${to}`, typeName); counts.relations++; }
      }
      for (const e of d.prepare(`SELECT * FROM relation_tltl WHERE relation_id=?`).all(r.id)) {
        const from = eventModMap.get(e.timeline_from), to = eventModMap.get(e.timeline_to);
        if (from && to) { viewer.createEntityRelation(nexusId, `module_${from}`, `module_${to}`, typeName); counts.relations++; }
      }
    }
    return connId;
  };

  const tx = d.transaction(() => {
    let majorId = null;

    if (target === 'director') {
      const p = d.prepare(`SELECT * FROM project WHERE id=?`).get(legacyId);
      if (!p) throw new Error('project not found');
      majorId = mkModule(null, p.name, 'manager');
      const scopeIds = [];
      const objModMap = new Map();
      const eventModMap = new Map();

      for (const cat of d.prepare(`SELECT * FROM object_category WHERE project_id=?`).all(legacyId)) {
        const tpls = d.prepare(`SELECT * FROM object_template WHERE category_id=? ORDER BY display_order, id`).all(cat.id);
        const cid = mkClassifierContainer(majorId, cat.category_name, 'object');
        scopeIds.push(cid);
        for (const o of d.prepare(`SELECT * FROM object WHERE category_id=?`).all(cat.id)) {
          const values = tpls.map(tp => d.prepare(`SELECT attribute_value FROM object_attribute WHERE object_id=? AND template_id=?`).get(o.id, tp.id)?.attribute_value);
          const mid = mkObjectModule(cid, { name: o.name, note: o.note, values }, tpls.map(tp => ({ name: tp.description })));
          objModMap.set(o.id, mid);
        }
      }

      for (const tl of d.prepare(`SELECT * FROM timeline WHERE project_id=?`).all(legacyId)) {
        const cid = mkChroniclerContainer(majorId, tl.line_name || p.name);
        scopeIds.push(cid);
        const evs = d.prepare(`
          SELECT te.id, te.event_name, te.story, td.day, td.month, td.years, td.hour, td.minute
          FROM timeline_event te JOIN timeline_date td ON te.start_at=td.id WHERE te.timeline_id=?
        `).all(tl.id);
        for (const ev of evs) eventModMap.set(ev.id, mkEventModule(cid, { name: ev.event_name, story: ev.story, date: ev }));
      }

      for (const mp of d.prepare(`SELECT * FROM map WHERE project_id=?`).all(legacyId)) {
        const lid = mkLocatorContainer(majorId, mp.map_name || p.name);
        for (const a of d.prepare(`SELECT * FROM map_area WHERE map_id=?`).all(mp.id)) {
          const points = d.prepare(`SELECT x, y FROM map_point WHERE area_id=? ORDER BY point_order`).all(a.id);
          mkAreaModule(lid, { name: a.area_name, points });
        }
      }

      const descs = d.prepare(`SELECT * FROM project_description WHERE project_id=?`).all(legacyId);
      if (descs.length) mkDescriptionNote(majorId, p.name, descs);

      const connId = mkRelationConnector(majorId, `${p.name} Relations`, legacyId, scopeIds, objModMap, eventModMap);
      if (connId && batchCtx) {
        batchCtx.directorConnectors ||= [];
        batchCtx.directorConnectors.push({ id: connId, moduleIds: scopeIds });
      }
    }

    else if (target === 'navigator') {
      const w = d.prepare(`SELECT * FROM world_project WHERE id=?`).get(legacyId);
      if (!w) throw new Error('world not found');
      majorId = mkModule(null, w.name, 'manager');
      const scopeIds = [];

      const chars = d.prepare(`SELECT * FROM world_character WHERE world_ref=?`).all(legacyId);
      if (chars.length) {
        const cid = mkClassifierContainer(majorId, 'Characters', 'character');
        scopeIds.push(cid);
        for (const c of chars) mkObjectModule(cid, { name: c.name, note: null, values: [] }, []);
      }

      for (const cat of d.prepare(`SELECT * FROM world_orig_category WHERE world_ref=?`).all(legacyId)) {
        const tpls = d.prepare(`SELECT * FROM world_orig_template WHERE category_id=? ORDER BY display_order, id`).all(cat.id);
        const cid = mkClassifierContainer(majorId, cat.category_name, 'object');
        scopeIds.push(cid);
        for (const o of d.prepare(`SELECT * FROM world_orig_object WHERE category_id=?`).all(cat.id)) {
          const values = tpls.map(tp => d.prepare(`SELECT attribute_value FROM world_orig_attribute WHERE object_id=? AND template_id=?`).get(o.id, tp.id)?.attribute_value);
          mkObjectModule(cid, { name: o.name, note: o.note, values }, tpls.map(tp => ({ name: tp.description })));
        }
      }

      for (const wm of d.prepare(`
        SELECT wm.id AS wmid, m.id AS map_id, m.map_name FROM world_map wm JOIN map m ON wm.map_ref=m.id
        WHERE wm.world_ref=?`).all(legacyId)) {
        const lid = mkLocatorContainer(majorId, wm.map_name || w.name);
        for (const a of d.prepare(`SELECT * FROM map_area WHERE map_id=?`).all(wm.map_id)) {
          const points = d.prepare(`SELECT x, y FROM map_point WHERE area_id=? ORDER BY point_order`).all(a.id);
          mkAreaModule(lid, { name: a.area_name, points });
        }
      }

      for (const tl of d.prepare(`SELECT * FROM world_timeline WHERE world_ref=?`).all(legacyId)) {
        const cid = mkChroniclerContainer(majorId, tl.name);
        scopeIds.push(cid);
        const evs = d.prepare(`
          SELECT td.day, td.month, td.years, td.hour, td.minute
          FROM world_timeline_event te JOIN world_timeline_date td ON te.date_ref=td.id WHERE te.timeline_ref=?
        `).all(tl.id);
        for (const r of evs) mkEventModule(cid, { name: `${r.day}/${r.month}/${r.years}`, story: null, date: r });
      }

      const descs = d.prepare(`SELECT * FROM world_description WHERE world_ref=?`).all(legacyId);
      if (descs.length) mkDescriptionNote(majorId, w.name, descs);

      // Decision #6: Navigator has no relation-instance table of its own —
      // fold its new classifier/chronicler modules into whichever Director
      // connector(s) were created earlier in this same import batch instead
      // of creating a dedicated connector for Navigator.
      if (scopeIds.length && batchCtx?.directorConnectors?.length) {
        for (const dc of batchCtx.directorConnectors) {
          const cur = JSON.parse(module_.getModuleUi(dc.id).filterDef || '{}');
          const merged = Array.from(new Set([...(cur.moduleIds || []), ...scopeIds]));
          module_.setModuleUi(dc.id, 'filterDef', JSON.stringify({ ...cur, moduleIds: merged }));
        }
      }
    }

    else if (target === 'hero') {
      const g = d.prepare(`SELECT * FROM game_project WHERE id=?`).get(legacyId);
      if (!g) throw new Error('game not found');
      majorId = mkModule(null, g.name, 'manager');

      const ctpls = d.prepare(`SELECT * FROM game_char_template WHERE game_ref=?`).all(legacyId);
      const chars = d.prepare(`SELECT * FROM game_character WHERE game_ref=?`).all(legacyId);
      if (chars.length || ctpls.length) {
        const cid = mkClassifierContainer(majorId, 'Characters', 'character');
        for (const c of chars) {
          const values = ctpls.map(tp => d.prepare(`
            SELECT attribute_text FROM game_char_attribute WHERE char_ref=? AND template_ref=? ORDER BY level DESC LIMIT 1
          `).get(c.id, tp.id)?.attribute_text);
          mkObjectModule(cid, { name: c.name, note: c.memo, values }, ctpls.map(tp => ({ name: tp.attribute_name })));
        }
      }

      for (const col of d.prepare(`SELECT * FROM game_collection WHERE game_ref=?`).all(legacyId)) {
        const tpls = d.prepare(`SELECT * FROM game_col_template WHERE collection_ref=?`).all(col.id);
        const cid = mkClassifierContainer(majorId, col.name, 'element');
        for (const e of d.prepare(`SELECT * FROM game_col_element WHERE collection_ref=?`).all(col.id)) {
          const values = tpls.map(tp => d.prepare(`
            SELECT attribute_text FROM game_col_attribute WHERE element_ref=? AND template_ref=? ORDER BY level DESC LIMIT 1
          `).get(e.id, tp.id)?.attribute_text);
          mkObjectModule(cid, { name: e.name, note: null, values }, tpls.map(tp => ({ name: tp.attribute_name })));
        }
      }

      // game_story's dialogue graph already lands as real, module-tree-native
      // rows (story_dialogue/story_talk/story_edge) — unchanged from before,
      // no decision #4 treatment needed here.
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

      // Bug fix: write_note itself has no content column — the markdown
      // lives in child write_chat rows, ordered by chat_order. The old code
      // passed null content here, silently producing empty notes.
      for (const nt of d.prepare(`SELECT * FROM write_note WHERE project_id=?`).all(legacyId)) {
        const chatRows = d.prepare(`SELECT chat FROM write_chat WHERE note_id=? ORDER BY chat_order`).all(nt.id);
        const mid = mkModule(majorId, nt.notename, 'inspector');
        const content = chatRows.map(r => r.chat).join('\n\n');
        if (content) module_.updateModuleDescription(mid, content);
      }
    }

    else if (target === 'scribe') {
      // No legacy "project" concept — legacyId is the nexusId itself
      // (listLegacyProjects returns one pseudo-row per nexus). One root
      // collector (no manager wrapper — there's no legacy project to
      // manage) holds the migrated note_folder tree 1:1, plus notes.
      majorId = mkModule(null, 'Scribe', 'collector');
      const folders = d.prepare(`SELECT * FROM note_folder WHERE nexus_ref=?`).all(nexusId);
      const folderModMap = new Map(); // note_folder.id -> new collector module id
      const byParent = new Map();
      for (const f of folders) {
        const key = f.parent_ref ?? null;
        if (!byParent.has(key)) byParent.set(key, []);
        byParent.get(key).push(f);
      }
      const walk = (parentFolderRef, parentModuleId) => {
        for (const f of byParent.get(parentFolderRef) || []) {
          const cid = mkModule(parentModuleId, f.name, 'collector');
          folderModMap.set(f.id, cid);
          walk(f.id, cid);
        }
      };
      walk(null, majorId);

      const notes = d.prepare(`SELECT * FROM note WHERE nexus_ref=? AND migrated_v3=0`).all(nexusId);
      for (const n of notes) {
        const parentId = n.folder_ref ? (folderModMap.get(n.folder_ref) || majorId) : majorId;
        const mid = mkModule(parentId, n.title, 'inspector');
        if (n.content) module_.updateModuleDescription(mid, n.content);
      }

      d.prepare(`UPDATE note SET migrated_v3=1 WHERE nexus_ref=? AND migrated_v3=0`).run(nexusId);
      return majorId;
    }

    else throw new Error(`unknown target ${target}`);

    d.prepare(`UPDATE ${LEGACY_TABLE[target]} SET migrated_v3=1 WHERE id=?`).run(legacyId);
    return majorId;
  });

  const id = tx();
  // batchCtx is mutated in place (director connectors recorded, navigator
  // folds into them) — handed back so the IPC caller can pass the updated
  // copy into the next migrateLegacy call in the same import batch, since
  // IPC args are serialized by value and won't share a live reference.
  return { id, counts, batchCtx: batchCtx || null };
}

// Legacy project lists for the import-choice modal's "Nexus Nest" path —
// excludes anything already flagged migrated_v3 (see migrateLegacy above).
// Scribe has no legacy "project" — it returns a single pseudo-row
// representing "this nexus's un-migrated notes" when any exist.
function listLegacyProjects(target, nexusId) {
  const d = getDB();
  if (target === 'scribe') {
    if (!nexusId) return [];
    try {
      const row = d.prepare(`SELECT COUNT(*) AS n FROM note WHERE nexus_ref=? AND migrated_v3=0`).get(nexusId);
      return row?.n ? [{ id: nexusId, name: `Scribe (${row.n})` }] : [];
    } catch (_) { return []; }
  }
  const sqls = {
    director: `SELECT id, name FROM project WHERE migrated_v3=0 ORDER BY name COLLATE NOCASE`,
    navigator: `SELECT id, name FROM world_project WHERE migrated_v3=0 ORDER BY name COLLATE NOCASE`,
    hero: `SELECT id, name FROM game_project WHERE migrated_v3=0 ORDER BY name COLLATE NOCASE`,
    writer: `SELECT id, project_name AS name FROM write_project WHERE migrated_v3=0 ORDER BY project_name COLLATE NOCASE`,
  };
  try { return d.prepare(sqls[target]).all(); } catch (_) { return []; }
}

module.exports = { migrateLegacy, listLegacyProjects };
