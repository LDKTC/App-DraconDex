const { getDB } = require('./core');

function getDataSize() {
  const db = getDB();
  const modules = [
    { name:'director', tables:['project','object_category','object','object_attribute','timeline','timeline_event','relation','relation_type','map','map_area','map_point'] },
    { name:'navigator', tables:['world_project','world_description','world_character','world_category','world_cat_object','world_map','world_map_timeline','world_maptl_event'] },
    { name:'hero', tables:['game_project','game_category','game_cat_object','game_character','game_char_template','game_char_attribute','game_collection','game_col_template','game_col_element','game_col_attribute','game_char_element','game_story','game_dialogue','game_storyline','game_conversation'] },
    { name:'writer', tables:['write_project','write_series','write_book','write_chapter','write_novel_link','write_wiki_link','write_word_link','write_note','write_chat'] },
  ];
  return modules.map(m => {
    let rows = 0, size = 0;
    for (const tbl of m.tables) {
      try {
        const r = db.prepare(`SELECT COUNT(*) AS cnt FROM ${tbl}`).get();
        rows += (r?.cnt || 0);
      } catch(_){}
    }
    return { module: m.name, rows };
  });
}

function getObjectAmounts() {
  const db = getDB();
  const queries = [
    { key:'projects',      sql:`SELECT COUNT(*) AS cnt FROM project` },
    { key:'categories',    sql:`SELECT COUNT(*) AS cnt FROM object_category` },
    { key:'objects',       sql:`SELECT COUNT(*) AS cnt FROM object` },
    { key:'timelineEvts',  sql:`SELECT COUNT(*) AS cnt FROM timeline_event` },
    { key:'relations',     sql:`SELECT COUNT(*) AS cnt FROM relation` },
    { key:'mapAreas',      sql:`SELECT COUNT(*) AS cnt FROM map_area` },
    { key:'worlds',        sql:`SELECT COUNT(*) AS cnt FROM world_project` },
    { key:'worldChars',    sql:`SELECT COUNT(*) AS cnt FROM world_character` },
    { key:'worldCatObjs',  sql:`SELECT COUNT(*) AS cnt FROM world_cat_object` },
    { key:'worldMaptlEvts',sql:`SELECT COUNT(*) AS cnt FROM world_maptl_event` },
    { key:'games',         sql:`SELECT COUNT(*) AS cnt FROM game_project` },
    { key:'gameChars',     sql:`SELECT COUNT(*) AS cnt FROM game_character` },
    { key:'gameElements',  sql:`SELECT COUNT(*) AS cnt FROM game_col_element` },
    { key:'dialogueNodes', sql:`SELECT COUNT(*) AS cnt FROM game_dialogue` },
    { key:'dialogueEdges', sql:`SELECT COUNT(*) AS cnt FROM game_storyline` },
    { key:'conversations', sql:`SELECT COUNT(*) AS cnt FROM game_conversation` },
    { key:'writeProjects', sql:`SELECT COUNT(*) AS cnt FROM write_project` },
    { key:'series',        sql:`SELECT COUNT(*) AS cnt FROM write_series` },
    { key:'books',         sql:`SELECT COUNT(*) AS cnt FROM write_book` },
    { key:'chapters',      sql:`SELECT COUNT(*) AS cnt FROM write_chapter` },
    { key:'notes',         sql:`SELECT COUNT(*) AS cnt FROM write_note` },
    { key:'hashtags',      sql:`SELECT COUNT(*) AS cnt FROM hashtag` },
  ];
  const result = {};
  for (const q of queries) {
    try { result[q.key] = db.prepare(q.sql).get()?.cnt || 0; } catch(_){ result[q.key] = 0; }
  }
  return result;
}

function getLinkerList() {
  const db = getDB();
  const links = [];

  // Project hashtags
  try {
    db.prepare(`SELECT p.name AS from_name, h.tag_name AS to_name, 'project' AS from_type, 'hashtag' AS to_type FROM project_hashtag ph JOIN project p ON p.id=ph.project_id JOIN hashtag h ON h.id=ph.hashtag_id`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  // Object hashtags
  try {
    db.prepare(`SELECT o.name AS from_name, h.tag_name AS to_name, 'object' AS from_type, 'hashtag' AS to_type FROM object_hashtag oh JOIN object o ON o.id=oh.object_id JOIN hashtag h ON h.id=oh.hashtag_id`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  // World novel links
  try {
    db.prepare(`SELECT wp.name AS from_name, p.name AS to_name, 'world' AS from_type, 'project' AS to_type FROM world_novel_link wnl JOIN world_project wp ON wp.id=wnl.world_ref JOIN project p ON p.id=wnl.project_ref`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  // Game novel links
  try {
    db.prepare(`SELECT gp.name AS from_name, p.name AS to_name, 'game' AS from_type, 'project' AS to_type FROM game_novel_link gnl JOIN game_project gp ON gp.id=gnl.game_ref JOIN project p ON p.id=gnl.project_ref`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  // Write series novel links
  try {
    db.prepare(`SELECT ws.name AS from_name, p.name AS to_name, 'series' AS from_type, 'project' AS to_type FROM write_novel_link wnl JOIN write_series ws ON ws.id=wnl.series_id JOIN project p ON p.id=wnl.novel_id`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  // World char links (world character → novel object)
  try {
    db.prepare(`SELECT wc.name AS from_name, o.name AS to_name, 'world_char' AS from_type, 'object' AS to_type FROM world_char_link wcl JOIN world_character wc ON wc.id=wcl.char_ref JOIN object o ON o.id=wcl.object_ref`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  return links;
}

// Whole-app "Obsidian-style" graph: every object/category/character/etc. is its
// own node (not just project-level), tagged with `module` (director/navigator/
// hero/writer/global) so the UI can filter by module with checkboxes.
function getLinkerGraph() {
  const db = getDB();
  const nodes = new Map(); // key => {id, label, type, module}
  const edgeSet = new Set();
  const edges = [];
  let nodeId = 0;

  function ensureNode(key, label, type, module) {
    if (!nodes.has(key)) nodes.set(key, { id: nodeId++, label, type, module });
    return nodes.get(key).id;
  }
  function nodeIdOf(key) { return nodes.get(key)?.id; }
  function addEdge(sourceKey, targetKey) {
    const s = nodeIdOf(sourceKey), t = nodeIdOf(targetKey);
    if (s == null || t == null || s === t) return;
    const dedupeKey = s < t ? `${s}-${t}` : `${t}-${s}`;
    if (edgeSet.has(dedupeKey)) return;
    edgeSet.add(dedupeKey);
    edges.push({ source: s, target: t });
  }
  function run(sql, fn) {
    try { db.prepare(sql).all().forEach(fn); } catch (_) {}
  }

  // ── Nodes ──────────────────────────────────────────────
  run(`SELECT id, name FROM project`, r => ensureNode(`proj_${r.id}`, r.name, 'project', 'director'));
  run(`SELECT id, category_name FROM object_category`, r => ensureNode(`cat_${r.id}`, r.category_name, 'category', 'director'));
  run(`SELECT id, name FROM object`, r => ensureNode(`obj_${r.id}`, r.name, 'object', 'director'));
  run(`SELECT id, event_name FROM timeline_event`, r => ensureNode(`evt_${r.id}`, r.event_name || '(event)', 'event', 'director'));
  run(`SELECT id, tag_name FROM hashtag`, r => ensureNode(`tag_${r.id}`, r.tag_name, 'hashtag', 'global'));

  run(`SELECT id, name FROM world_project`, r => ensureNode(`world_${r.id}`, r.name, 'project', 'navigator'));
  run(`SELECT id, name FROM world_character`, r => ensureNode(`wchar_${r.id}`, r.name, 'character', 'navigator'));
  run(`SELECT id, category_name FROM world_orig_category`, r => ensureNode(`wcat_${r.id}`, r.category_name, 'category', 'navigator'));
  run(`SELECT id, name FROM world_orig_object`, r => ensureNode(`wobj_${r.id}`, r.name, 'object', 'navigator'));

  run(`SELECT id, name FROM game_project`, r => ensureNode(`game_${r.id}`, r.name, 'project', 'hero'));
  run(`SELECT id, name FROM game_character`, r => ensureNode(`gchar_${r.id}`, r.name, 'character', 'hero'));
  run(`SELECT id, name FROM game_collection`, r => ensureNode(`gcol_${r.id}`, r.name, 'category', 'hero'));
  run(`SELECT id, name FROM game_col_element`, r => ensureNode(`gel_${r.id}`, r.name, 'object', 'hero'));

  run(`SELECT id, project_name FROM write_project`, r => ensureNode(`write_${r.id}`, r.project_name, 'project', 'writer'));
  run(`SELECT id, name FROM write_series`, r => ensureNode(`wser_${r.id}`, r.name, 'category', 'writer'));
  run(`SELECT id, name FROM write_book`, r => ensureNode(`wbook_${r.id}`, r.name, 'category', 'writer'));
  run(`SELECT id, name FROM write_chapter`, r => ensureNode(`wchp_${r.id}`, r.name, 'object', 'writer'));
  run(`SELECT id, notename FROM write_note`, r => ensureNode(`wnote_${r.id}`, r.notename, 'object', 'writer'));

  // ── Edges: Director ────────────────────────────────────
  run(`SELECT id, project_id FROM object_category`, r => addEdge(`cat_${r.id}`, `proj_${r.project_id}`));
  run(`SELECT id, category_id FROM object`, r => addEdge(`obj_${r.id}`, `cat_${r.category_id}`));
  run(`SELECT object_from, object_to FROM relation_obob`, r => addEdge(`obj_${r.object_from}`, `obj_${r.object_to}`));
  run(`SELECT object_from, timeline_to FROM relation_obtl`, r => addEdge(`obj_${r.object_from}`, `evt_${r.timeline_to}`));
  run(`SELECT timeline_from, timeline_to FROM relation_tltl`, r => addEdge(`evt_${r.timeline_from}`, `evt_${r.timeline_to}`));
  run(`SELECT project_id, hashtag_id FROM project_hashtag`, r => addEdge(`proj_${r.project_id}`, `tag_${r.hashtag_id}`));
  run(`SELECT object_id, hashtag_id FROM object_hashtag`, r => addEdge(`obj_${r.object_id}`, `tag_${r.hashtag_id}`));
  run(`SELECT event_id, hashtag_id FROM event_hashtag`, r => addEdge(`evt_${r.event_id}`, `tag_${r.hashtag_id}`));

  // ── Edges: Navigator ───────────────────────────────────
  run(`SELECT world_ref, project_ref FROM world_novel`, r => addEdge(`world_${r.world_ref}`, `proj_${r.project_ref}`));
  run(`SELECT id, world_ref FROM world_character`, r => addEdge(`wchar_${r.id}`, `world_${r.world_ref}`));
  run(`SELECT character_ref, object_ref FROM world_character_link`, r => addEdge(`wchar_${r.character_ref}`, `obj_${r.object_ref}`));
  run(`SELECT id, world_ref FROM world_orig_category`, r => addEdge(`wcat_${r.id}`, `world_${r.world_ref}`));
  run(`SELECT id, category_id FROM world_orig_object`, r => addEdge(`wobj_${r.id}`, `wcat_${r.category_id}`));
  run(`SELECT world_ref, hashtag_id FROM world_tag`, r => addEdge(`world_${r.world_ref}`, `tag_${r.hashtag_id}`));
  run(`SELECT character_ref, hashtag_id FROM world_charactor_tag`, r => addEdge(`wchar_${r.character_ref}`, `tag_${r.hashtag_id}`));
  // Borrowed Director categories a world draws characters/categories from.
  run(`SELECT world_ref, category_ref FROM world_character_category`, r => addEdge(`world_${r.world_ref}`, `cat_${r.category_ref}`));
  run(`SELECT world_ref, category_ref FROM world_category`, r => addEdge(`world_${r.world_ref}`, `cat_${r.category_ref}`));

  // ── Edges: Hero ────────────────────────────────────────
  run(`SELECT game_ref, project_ref FROM game_novel_link`, r => addEdge(`game_${r.game_ref}`, `proj_${r.project_ref}`));
  run(`SELECT id, game_ref FROM game_character`, r => addEdge(`gchar_${r.id}`, `game_${r.game_ref}`));
  run(`SELECT id, game_ref FROM game_collection`, r => addEdge(`gcol_${r.id}`, `game_${r.game_ref}`));
  run(`SELECT id, collection_ref FROM game_col_element`, r => addEdge(`gel_${r.id}`, `gcol_${r.collection_ref}`));
  run(`SELECT char_ref, element_ref FROM game_char_element`, r => addEdge(`gchar_${r.char_ref}`, `gel_${r.element_ref}`));
  run(`SELECT game_id, hashtag_id FROM game_project_hashtag`, r => addEdge(`game_${r.game_id}`, `tag_${r.hashtag_id}`));
  run(`SELECT char_id, hashtag_id FROM game_char_hashtag`, r => addEdge(`gchar_${r.char_id}`, `tag_${r.hashtag_id}`));
  run(`SELECT element_id, hashtag_id FROM game_element_hashtag`, r => addEdge(`gel_${r.element_id}`, `tag_${r.hashtag_id}`));
  // Borrowed Director category the game draws characters from, and the object
  // a game character is linked to (game_character.object_link -> game_cat_object -> object).
  run(`SELECT game_ref, category_ref FROM game_category`, r => addEdge(`game_${r.game_ref}`, `cat_${r.category_ref}`));
  run(`SELECT gco.object_ref AS object_ref, gc.id AS char_id
       FROM game_character gc
       JOIN game_cat_object gco ON gco.id = gc.object_link`,
    r => addEdge(`gchar_${r.char_id}`, `obj_${r.object_ref}`));

  // ── Edges: Writer ──────────────────────────────────────
  run(`SELECT id, project_id FROM write_series`, r => addEdge(`wser_${r.id}`, `write_${r.project_id}`));
  run(`SELECT id, series_id FROM write_book`, r => addEdge(`wbook_${r.id}`, `wser_${r.series_id}`));
  run(`SELECT id, book_id FROM write_chapter`, r => addEdge(`wchp_${r.id}`, `wbook_${r.book_id}`));
  run(`SELECT id, project_id FROM write_note`, r => addEdge(`wnote_${r.id}`, `write_${r.project_id}`));
  run(`SELECT series_id, novel_id FROM write_novel_link`, r => addEdge(`wser_${r.series_id}`, `proj_${r.novel_id}`));
  run(`SELECT chapter_id, object_id FROM write_wiki_link WHERE object_id IS NOT NULL`,
    r => addEdge(`wchp_${r.chapter_id}`, `obj_${r.object_id}`));

  return { nodes: Array.from(nodes.values()), edges };
}


// ═══ Sage Hut (v3 Phase 17) — vault-wide analytics over the module nest ═
// Per-module item counts and approximate content byte sizes across every
// v3 content table, plus the wiki-link roll-up for the hub section.
function sageHutStats(nexusId) {
  const { getDB } = require('./core');
  const d = getDB();
  const nx = nexusId ?? null;
  const modules = d.prepare(`
    SELECT m.id, m.name, m.kind, uc.color_code FROM module m
    LEFT JOIN use_color uc ON uc.id=m.color
    WHERE (? IS NULL OR m.nexus_ref=?) ORDER BY m.display_order, m.id
  `).all(nx, nx);
  const per = new Map(modules.map(m => [m.id, { ...m, items: 0, bytes: 0 }]));
  const add = (sql, idCol, cntCol, byteCol) => {
    try {
      for (const r of d.prepare(sql).all(nx, nx)) {
        const row = per.get(r[idCol]);
        if (!row) continue;
        row.items += r[cntCol] || 0;
        row.bytes += r[byteCol] || 0;
      }
    } catch (_) {}
  };
  add(`SELECT o.module_ref AS mid, COUNT(*) AS c,
        SUM(LENGTH(o.name) + COALESCE(LENGTH(o.note),0)) AS b
      FROM classifier_object o JOIN module m ON o.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY o.module_ref`, 'mid', 'c', 'b');
  add(`SELECT tl.module_ref AS mid, COUNT(*) AS c,
        SUM(COALESCE(LENGTH(te.event_name),0) + COALESCE(LENGTH(te.story),0)) AS b
      FROM timeline_event te JOIN timeline tl ON te.timeline_id=tl.id
      JOIN module m ON tl.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY tl.module_ref`, 'mid', 'c', 'b');
  add(`SELECT sd.module_ref AS mid, COUNT(*) AS c,
        SUM(LENGTH(sd.name) + COALESCE((SELECT SUM(COALESCE(LENGTH(st.speaker),0)+COALESCE(LENGTH(st.talk_sentence),0)) FROM story_talk st WHERE st.dialogue_ref=sd.id),0)) AS b
      FROM story_dialogue sd JOIN module m ON sd.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY sd.module_ref`, 'mid', 'c', 'b');
  add(`SELECT ch.module_ref AS mid, COUNT(*) AS c,
        SUM(LENGTH(ch.name) + COALESCE(LENGTH(ch.chapter_content),0)) AS b
      FROM book_chapter ch JOIN module m ON ch.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY ch.module_ref`, 'mid', 'c', 'b');
  add(`SELECT s.module_ref AS mid, COUNT(*) AS c,
        SUM(LENGTH(s.name) + COALESCE((SELECT SUM(LENGTH(g.message)) FROM chat_message g WHERE g.session_ref=s.id),0)) AS b
      FROM chat_session s JOIN module m ON s.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY s.module_ref`, 'mid', 'c', 'b');
  add(`SELECT sp.module_ref AS mid, COUNT(*) AS c,
        SUM(LENGTH(sp.name) + COALESCE((SELECT SUM(LENGTH(ss.points)) FROM sketch_stroke ss WHERE ss.page_ref=sp.id),0)) AS b
      FROM sketch_page sp JOIN module m ON sp.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY sp.module_ref`, 'mid', 'c', 'b');
  add(`SELECT dn.module_ref AS mid, COUNT(*) AS c,
        SUM(COALESCE(LENGTH(dn.node_text),0) + 16) AS b
      FROM design_node dn JOIN module m ON dn.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY dn.module_ref`, 'mid', 'c', 'b');
  add(`SELECT me.module_ref AS mid, COUNT(*) AS c, SUM(COALESCE(LENGTH(me.label),0) + 16) AS b
      FROM map_event me JOIN module m ON me.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY me.module_ref`, 'mid', 'c', 'b');
  add(`SELECT mp.module_ref AS mid, COUNT(*) AS c, SUM(COALESCE(LENGTH(mp.point_name),0) + 16) AS b
      FROM map_point mp JOIN module m ON mp.module_ref=m.id
      WHERE (? IS NULL OR m.nexus_ref=?) GROUP BY mp.module_ref`, 'mid', 'c', 'b');
  // module descriptions count toward their own size
  for (const m of per.values()) {
    const r = d.prepare(`SELECT COALESCE(LENGTH(description),0) AS b FROM module WHERE id=?`).get(m.id);
    m.bytes += r?.b || 0;
  }
  const links = d.prepare(`SELECT COUNT(*) AS c FROM wiki_link WHERE (? IS NULL OR nexus_ref=?)`).get(nx, nx).c;
  const perModule = [...per.values()];
  return {
    objects: perModule.reduce((a, m) => a + m.items, 0),
    modules: modules.length,
    links,
    bytes: perModule.reduce((a, m) => a + m.bytes, 0),
    perModule,
  };
}

function sageHutLinkerList(nexusId) {
  const { getDB } = require('./core');
  const wiki = require('./wiki');
  const d = getDB();
  const rows = d.prepare(`
    SELECT id, src_key, target_key, target_text FROM wiki_link
    WHERE (? IS NULL OR nexus_ref=?) ORDER BY id DESC LIMIT 500
  `).all(nexusId ?? null, nexusId ?? null);
  const keys = new Set();
  for (const r of rows) { keys.add(r.src_key); if (r.target_key) keys.add(r.target_key); }
  const named = new Map(wiki.resolveEntityKeys([...keys]).map(e => [e.key, e]));
  return rows.map(r => ({
    id: r.id,
    from: named.get(r.src_key) || { key: r.src_key, name: r.src_key, type: '?' },
    to: r.target_key ? (named.get(r.target_key) || null) : null,
    text: r.target_text,
  }));
}

module.exports = { getDataSize, getObjectAmounts, getLinkerList, getLinkerGraph, sageHutStats, sageHutLinkerList };
