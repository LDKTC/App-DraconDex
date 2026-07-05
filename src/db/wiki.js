'use strict';
const { getDB } = require('./core');

// Wiki-link index (v2.8). [[Name]] references typed inside markdown content
// (Scribe notes, Director object notes, Writer chapters) are parsed on save,
// resolved against the vault's entities and stored in wiki_link. The text is
// the source of truth — this table is a rebuildable index (see backfill).
//
// Entity keys follow Sage's getLinkerGraph convention: note_3, obj_12,
// wchar_7, wobj_4, gchar_2, gel_9, wchp_5, wnote_1, proj_6, world_2, game_1,
// write_3.

// Keep in sync with MD_WIKILINK_RE in src/renderer/markdown.js.
const WIKILINK_RE = /\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g;

// ── Name resolution ─────────────────────────────────────────────────────────
// Fixed, deterministic precedence; case-insensitive (ASCII). A namespace
// prefix ([[note:X]], [[obj:X]], …) forces one resolver.
const RESOLVERS = [
  ['note',  (d, n, nx) => d.prepare(`SELECT id FROM note WHERE nexus_ref=? AND title=? COLLATE NOCASE`).get(nx, n)?.id, 'note_'],
  ['obj',   (d, n, nx) => d.prepare(`SELECT o.id FROM object o JOIN project p ON o.project_id=p.id WHERE (? IS NULL OR p.nexus_ref=?) AND o.name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'obj_'],
  ['wchar', (d, n, nx) => d.prepare(`SELECT c.id FROM world_character c JOIN world_project w ON c.world_ref=w.id WHERE (? IS NULL OR w.nexus_ref=?) AND c.name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'wchar_'],
  ['wobj',  (d, n, nx) => d.prepare(`SELECT o.id FROM world_orig_object o JOIN world_orig_category c ON o.category_id=c.id JOIN world_project w ON c.world_ref=w.id WHERE (? IS NULL OR w.nexus_ref=?) AND o.name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'wobj_'],
  ['gchar', (d, n, nx) => d.prepare(`SELECT c.id FROM game_character c JOIN game_project g ON c.game_ref=g.id WHERE (? IS NULL OR g.nexus_ref=?) AND c.name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'gchar_'],
  ['gel',   (d, n, nx) => d.prepare(`SELECT e.id FROM game_col_element e JOIN game_collection c ON e.collection_ref=c.id JOIN game_project g ON c.game_ref=g.id WHERE (? IS NULL OR g.nexus_ref=?) AND e.name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'gel_'],
  ['wchp',  (d, n, nx) => d.prepare(`SELECT ch.id FROM write_chapter ch JOIN write_book b ON ch.book_id=b.id JOIN write_series s ON b.series_id=s.id JOIN write_project p ON s.project_id=p.id WHERE (? IS NULL OR p.nexus_ref=?) AND ch.name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'wchp_'],
  ['wnote', (d, n, nx) => d.prepare(`SELECT wn.id FROM write_note wn JOIN write_project p ON wn.project_id=p.id WHERE (? IS NULL OR p.nexus_ref=?) AND wn.notename=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'wnote_'],
  ['proj',  (d, n, nx) => d.prepare(`SELECT id FROM project WHERE (? IS NULL OR nexus_ref=?) AND name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'proj_'],
  ['world', (d, n, nx) => d.prepare(`SELECT id FROM world_project WHERE (? IS NULL OR nexus_ref=?) AND name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'world_'],
  ['game',  (d, n, nx) => d.prepare(`SELECT id FROM game_project WHERE (? IS NULL OR nexus_ref=?) AND name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'game_'],
  ['write', (d, n, nx) => d.prepare(`SELECT id FROM write_project WHERE (? IS NULL OR nexus_ref=?) AND project_name=? COLLATE NOCASE`).get(nx, nx, n)?.id, 'write_'],
];

function resolveWikiName(rawName, nexusId) {
  const d = getDB();
  const nx = nexusId ?? null;
  let name = String(rawName || '').trim();
  if (!name) return null;
  const forced = name.match(/^(\w+):(.+)$/);
  if (forced) {
    const r = RESOLVERS.find(([ns]) => ns === forced[1].toLowerCase());
    if (r) {
      const id = r[1](d, forced[2].trim(), nx);
      return id ? r[2] + id : null;
    }
  }
  for (const [, fn, prefix] of RESOLVERS) {
    try {
      const id = fn(d, name, nx);
      if (id) return prefix + id;
    } catch (_) {}
  }
  return null;
}

// ── Index maintenance ───────────────────────────────────────────────────────
function reindexWikiLinks(srcKey, content, nexusId) {
  const d = getDB();
  const links = [];
  WIKILINK_RE.lastIndex = 0;
  let m;
  while ((m = WIKILINK_RE.exec(String(content || ''))) !== null) {
    const name = m[1].trim();
    if (name) links.push(name);
  }
  const tx = d.transaction(() => {
    d.prepare(`DELETE FROM wiki_link WHERE src_key=?`).run(srcKey);
    const seen = new Set();
    for (const name of links) {
      const dedupe = name.toLowerCase();
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      d.prepare(`INSERT INTO wiki_link (nexus_ref, src_key, target_key, target_text) VALUES (?,?,?,?)`)
        .run(nexusId ?? null, srcKey, resolveWikiName(name, nexusId), name);
    }
  });
  tx();
}

// Vault of a content source, for the reindex hooks.
const nexusOfNote = (id) => getDB().prepare(`SELECT nexus_ref FROM note WHERE id=?`).get(id)?.nexus_ref ?? null;
const nexusOfObject = (id) => getDB().prepare(`SELECT p.nexus_ref FROM object o JOIN project p ON o.project_id=p.id WHERE o.id=?`).get(id)?.nexus_ref ?? null;
const nexusOfChapter = (id) => getDB().prepare(`
  SELECT p.nexus_ref FROM write_chapter ch JOIN write_book b ON ch.book_id=b.id
  JOIN write_series s ON b.series_id=s.id JOIN write_project p ON s.project_id=p.id WHERE ch.id=?
`).get(id)?.nexus_ref ?? null;

// Rebuild the whole index from every markdown-bearing source. Used by the
// one-time backfill in initDB and available after DB import-merge.
function rebuildWikiIndex() {
  const d = getDB();
  d.prepare(`DELETE FROM wiki_link`).run();
  for (const r of d.prepare(`SELECT id, content, nexus_ref FROM note WHERE content LIKE '%[[%'`).all()) {
    reindexWikiLinks(`note_${r.id}`, r.content, r.nexus_ref);
  }
  for (const r of d.prepare(`SELECT o.id, o.note, p.nexus_ref FROM object o JOIN project p ON o.project_id=p.id WHERE o.note LIKE '%[[%'`).all()) {
    reindexWikiLinks(`obj_${r.id}`, r.note, r.nexus_ref);
  }
  for (const r of d.prepare(`
    SELECT ch.id, ch.chapter_content, p.nexus_ref FROM write_chapter ch
    JOIN write_book b ON ch.book_id=b.id JOIN write_series s ON b.series_id=s.id
    JOIN write_project p ON s.project_id=p.id WHERE ch.chapter_content LIKE '%[[%'
  `).all()) {
    reindexWikiLinks(`wchp_${r.id}`, r.chapter_content, r.nexus_ref);
  }
}

// ── Key hydration ───────────────────────────────────────────────────────────
// key → {key, name, type, module}; unknown/dangling keys are omitted.
const KEY_LOOKUPS = {
  note:  { sql: `SELECT id, title AS name FROM note WHERE id=?`,               type: 'note',      module: 'scribe' },
  obj:   { sql: `SELECT id, name FROM object WHERE id=?`,                      type: 'object',    module: 'director' },
  wchar: { sql: `SELECT id, name FROM world_character WHERE id=?`,             type: 'character', module: 'navigator' },
  wobj:  { sql: `SELECT id, name FROM world_orig_object WHERE id=?`,           type: 'object',    module: 'navigator' },
  gchar: { sql: `SELECT id, name FROM game_character WHERE id=?`,              type: 'character', module: 'hero' },
  gel:   { sql: `SELECT id, name FROM game_col_element WHERE id=?`,            type: 'object',    module: 'hero' },
  wchp:  { sql: `SELECT id, name FROM write_chapter WHERE id=?`,               type: 'chapter',   module: 'writer' },
  wnote: { sql: `SELECT id, notename AS name FROM write_note WHERE id=?`,      type: 'note',      module: 'writer' },
  proj:  { sql: `SELECT id, name FROM project WHERE id=?`,                     type: 'project',   module: 'director' },
  world: { sql: `SELECT id, name FROM world_project WHERE id=?`,               type: 'project',   module: 'navigator' },
  game:  { sql: `SELECT id, name FROM game_project WHERE id=?`,                type: 'project',   module: 'hero' },
  write: { sql: `SELECT id, project_name AS name FROM write_project WHERE id=?`, type: 'project', module: 'writer' },
};

function resolveEntityKeys(keys) {
  const d = getDB();
  const out = [];
  for (const key of keys || []) {
    const m = String(key).match(/^([a-z]+)_(\d+)$/);
    const lk = m && KEY_LOOKUPS[m[1]];
    if (!lk) continue;
    try {
      const row = d.prepare(lk.sql).get(Number(m[2]));
      if (row) out.push({ key, name: row.name, type: lk.type, module: lk.module });
    } catch (_) {}
  }
  return out;
}

const getBacklinks = (targetKey) => {
  const rows = getDB().prepare(`SELECT DISTINCT src_key FROM wiki_link WHERE target_key=?`).all(targetKey);
  return resolveEntityKeys(rows.map(r => r.src_key));
};

const getOutgoingLinks = (srcKey) => {
  const rows = getDB().prepare(`SELECT target_key, target_text FROM wiki_link WHERE src_key=?`).all(srcKey);
  const resolved = resolveEntityKeys(rows.filter(r => r.target_key).map(r => r.target_key));
  const byKey = new Map(resolved.map(e => [e.key, e]));
  return rows.map(r => r.target_key && byKey.has(r.target_key)
    ? byKey.get(r.target_key)
    : { key: null, name: r.target_text, type: 'unresolved', module: null });
};

// ── Quick index: every linkable entity in a vault ───────────────────────────
// Feeds the quick switcher, the [[ autocomplete and the renderer's sync
// wikilink-resolution cache.
function quickIndex(nexusId) {
  const d = getDB();
  const nx = nexusId ?? null;
  const out = [];
  const add = (sql, prefix, type, module) => {
    try {
      for (const r of d.prepare(sql).all(nx, nx)) {
        out.push({ key: `${prefix}${r.id}`, name: r.name, type, module, color: r.color_code || null });
      }
    } catch (_) {}
  };
  add(`SELECT n.id, n.title AS name, uc.color_code FROM note n LEFT JOIN use_color uc ON uc.id=n.color WHERE (? IS NULL OR n.nexus_ref=?)`, 'note_', 'note', 'scribe');
  add(`SELECT o.id, o.name, uc.color_code FROM object o JOIN project p ON o.project_id=p.id LEFT JOIN use_color uc ON uc.id=o.color WHERE (? IS NULL OR p.nexus_ref=?)`, 'obj_', 'object', 'director');
  add(`SELECT c.id, c.name, uc.color_code FROM world_character c JOIN world_project w ON c.world_ref=w.id LEFT JOIN use_color uc ON uc.id=c.color WHERE (? IS NULL OR w.nexus_ref=?)`, 'wchar_', 'character', 'navigator');
  add(`SELECT o.id, o.name, NULL AS color_code FROM world_orig_object o JOIN world_orig_category c ON o.category_id=c.id JOIN world_project w ON c.world_ref=w.id WHERE (? IS NULL OR w.nexus_ref=?)`, 'wobj_', 'object', 'navigator');
  add(`SELECT c.id, c.name, uc.color_code FROM game_character c JOIN game_project g ON c.game_ref=g.id LEFT JOIN use_color uc ON uc.id=c.color_ref WHERE (? IS NULL OR g.nexus_ref=?)`, 'gchar_', 'character', 'hero');
  add(`SELECT e.id, e.name, NULL AS color_code FROM game_col_element e JOIN game_collection c ON e.collection_ref=c.id JOIN game_project g ON c.game_ref=g.id WHERE (? IS NULL OR g.nexus_ref=?)`, 'gel_', 'object', 'hero');
  add(`SELECT ch.id, ch.name, uc.color_code FROM write_chapter ch JOIN write_book b ON ch.book_id=b.id JOIN write_series s ON b.series_id=s.id JOIN write_project p ON s.project_id=p.id LEFT JOIN use_color uc ON uc.id=ch.color WHERE (? IS NULL OR p.nexus_ref=?)`, 'wchp_', 'chapter', 'writer');
  add(`SELECT id, name, NULL AS color_code FROM project WHERE (? IS NULL OR nexus_ref=?)`, 'proj_', 'project', 'director');
  add(`SELECT id, name, NULL AS color_code FROM world_project WHERE (? IS NULL OR nexus_ref=?)`, 'world_', 'project', 'navigator');
  add(`SELECT id, name, NULL AS color_code FROM game_project WHERE (? IS NULL OR nexus_ref=?)`, 'game_', 'project', 'hero');
  add(`SELECT id, project_name AS name, NULL AS color_code FROM write_project WHERE (? IS NULL OR nexus_ref=?)`, 'write_', 'project', 'writer');
  return out;
}

// Vault-scoped Obsidian-style graph: every quickIndex entity is a node
// (node.key feeds openEntityByKey), edges = structural containment/links +
// Director relations + wiki_link references (flagged wiki:true so the UI can
// draw them differently).
function getGraph(nexusId) {
  const d = getDB();
  const nx = nexusId ?? null;
  const nodes = [];
  const idx = new Map();
  for (const e of quickIndex(nexusId)) {
    if (!idx.has(e.key)) {
      idx.set(e.key, nodes.length);
      nodes.push({ id: nodes.length, key: e.key, label: e.name, type: e.type, module: e.module });
    }
  }
  const edges = [];
  const eSet = new Set();
  const addEdge = (aKey, bKey, wiki) => {
    const s = idx.get(aKey), t = idx.get(bKey);
    if (s == null || t == null || s === t) return;
    const dk = (s < t ? `${s}-${t}` : `${t}-${s}`) + (wiki ? 'w' : '');
    if (eSet.has(dk)) return;
    eSet.add(dk);
    edges.push({ source: s, target: t, wiki: !!wiki });
  };
  const run = (sql, fn) => { try { d.prepare(sql).all(nx, nx).forEach(fn); } catch (_) {} };

  // structural containment
  run(`SELECT o.id, o.project_id FROM object o JOIN project p ON o.project_id=p.id WHERE (? IS NULL OR p.nexus_ref=?)`, r => addEdge(`obj_${r.id}`, `proj_${r.project_id}`));
  run(`SELECT c.id, c.world_ref FROM world_character c JOIN world_project w ON c.world_ref=w.id WHERE (? IS NULL OR w.nexus_ref=?)`, r => addEdge(`wchar_${r.id}`, `world_${r.world_ref}`));
  run(`SELECT o.id, c.world_ref FROM world_orig_object o JOIN world_orig_category c ON o.category_id=c.id JOIN world_project w ON c.world_ref=w.id WHERE (? IS NULL OR w.nexus_ref=?)`, r => addEdge(`wobj_${r.id}`, `world_${r.world_ref}`));
  run(`SELECT c.id, c.game_ref FROM game_character c JOIN game_project g ON c.game_ref=g.id WHERE (? IS NULL OR g.nexus_ref=?)`, r => addEdge(`gchar_${r.id}`, `game_${r.game_ref}`));
  run(`SELECT e.id, c.game_ref FROM game_col_element e JOIN game_collection c ON e.collection_ref=c.id JOIN game_project g ON c.game_ref=g.id WHERE (? IS NULL OR g.nexus_ref=?)`, r => addEdge(`gel_${r.id}`, `game_${r.game_ref}`));
  run(`SELECT ch.id, s.project_id FROM write_chapter ch JOIN write_book b ON ch.book_id=b.id JOIN write_series s ON b.series_id=s.id JOIN write_project p ON s.project_id=p.id WHERE (? IS NULL OR p.nexus_ref=?)`, r => addEdge(`wchp_${r.id}`, `write_${r.project_id}`));
  // cross-module project links
  run(`SELECT wn.world_ref, wn.project_ref FROM world_novel wn JOIN world_project w ON wn.world_ref=w.id WHERE (? IS NULL OR w.nexus_ref=?)`, r => addEdge(`world_${r.world_ref}`, `proj_${r.project_ref}`));
  run(`SELECT gl.game_ref, gl.project_ref FROM game_novel_link gl JOIN game_project g ON gl.game_ref=g.id WHERE (? IS NULL OR g.nexus_ref=?)`, r => addEdge(`game_${r.game_ref}`, `proj_${r.project_ref}`));
  run(`SELECT s.project_id, l.novel_id FROM write_novel_link l JOIN write_series s ON l.series_id=s.id JOIN write_project p ON s.project_id=p.id WHERE (? IS NULL OR p.nexus_ref=?)`, r => addEdge(`write_${r.project_id}`, `proj_${r.novel_id}`));
  // Director object↔object relations
  run(`SELECT ro.object_from, ro.object_to FROM relation_obob ro JOIN relation rl ON ro.relation_id=rl.id JOIN project p ON rl.project_id=p.id WHERE (? IS NULL OR p.nexus_ref=?)`, r => addEdge(`obj_${r.object_from}`, `obj_${r.object_to}`));
  // character↔director-object links (Navigator, Hero)
  run(`SELECT cl.character_ref, cl.object_ref FROM world_character_link cl JOIN world_character c ON cl.character_ref=c.id JOIN world_project w ON c.world_ref=w.id WHERE (? IS NULL OR w.nexus_ref=?)`, r => addEdge(`wchar_${r.character_ref}`, `obj_${r.object_ref}`));
  // wiki links
  run(`SELECT src_key, target_key FROM wiki_link WHERE target_key IS NOT NULL AND (? IS NULL OR nexus_ref=?)`, r => addEdge(r.src_key, r.target_key, true));

  return { nodes, edges };
}

// One batched tree of everything in a vault, for the IDE-style explorer.
// Shape: [{key, name, color, children:[…]}] per module section.
function explorerTree(nexusId) {
  const d = getDB();
  const nx = nexusId ?? null;
  const all = (sql, ...args) => { try { return d.prepare(sql).all(...args); } catch (_) { return []; } };

  // Scribe: nested folders + notes
  const folders = all(`SELECT nf.id, nf.parent_ref, nf.name, uc.color_code FROM note_folder nf LEFT JOIN use_color uc ON uc.id=nf.color WHERE nf.nexus_ref=? ORDER BY nf.name COLLATE NOCASE`, nx);
  const notes = all(`SELECT n.id, n.folder_ref, n.title, uc.color_code FROM note n LEFT JOIN use_color uc ON uc.id=n.color WHERE n.nexus_ref=? ORDER BY n.pinned DESC, n.title COLLATE NOCASE`, nx);
  const folderNode = (f) => ({
    key: `nfold_${f.id}`, name: f.name, color: f.color_code, children: [
      ...folders.filter(v => v.parent_ref === f.id).map(folderNode),
      ...notes.filter(n => n.folder_ref === f.id).map(n => ({ key: `note_${n.id}`, name: n.title, color: n.color_code })),
    ],
  });
  const scribe = [
    ...folders.filter(f => !f.parent_ref).map(folderNode),
    ...notes.filter(n => !n.folder_ref).map(n => ({ key: `note_${n.id}`, name: n.title, color: n.color_code })),
  ];

  // Director: projects → categories → objects
  const director = all(`SELECT p.id, p.name, uc.color_code FROM project p LEFT JOIN use_color uc ON uc.id=p.project_color WHERE (? IS NULL OR p.nexus_ref=?) ORDER BY p.name`, nx, nx).map(p => ({
    key: `proj_${p.id}`, name: p.name, color: p.color_code,
    children: all(`SELECT c.id, c.category_name, uc.color_code FROM object_category c LEFT JOIN use_color uc ON uc.id=c.color WHERE c.project_id=? ORDER BY c.category_name`, p.id).map(c => ({
      key: `cat_${c.id}`, name: c.category_name, color: c.color_code,
      children: all(`SELECT o.id, o.name, uc.color_code FROM object o LEFT JOIN use_color uc ON uc.id=o.color WHERE o.category_id=? ORDER BY o.name`, c.id).map(o => ({ key: `obj_${o.id}`, name: o.name, color: o.color_code })),
    })),
  }));

  // Navigator: worlds → characters + original objects
  const navigator = all(`SELECT w.id, w.name, uc.color_code FROM world_project w LEFT JOIN use_color uc ON uc.id=w.color WHERE (? IS NULL OR w.nexus_ref=?) ORDER BY w.name`, nx, nx).map(w => ({
    key: `world_${w.id}`, name: w.name, color: w.color_code,
    children: [
      ...all(`SELECT c.id, c.name, uc.color_code FROM world_character c LEFT JOIN use_color uc ON uc.id=c.color WHERE c.world_ref=? ORDER BY c.name`, w.id).map(c => ({ key: `wchar_${c.id}`, name: c.name, color: c.color_code })),
      ...all(`SELECT o.id, o.name FROM world_orig_object o JOIN world_orig_category c ON o.category_id=c.id WHERE c.world_ref=? ORDER BY o.name`, w.id).map(o => ({ key: `wobj_${o.id}`, name: o.name, color: null })),
    ],
  }));

  // Hero: games → characters + collection elements
  const hero = all(`SELECT g.id, g.name, uc.color_code FROM game_project g LEFT JOIN use_color uc ON uc.id=g.color_ref WHERE (? IS NULL OR g.nexus_ref=?) ORDER BY g.name`, nx, nx).map(g => ({
    key: `game_${g.id}`, name: g.name, color: g.color_code,
    children: [
      ...all(`SELECT c.id, c.name, uc.color_code FROM game_character c LEFT JOIN use_color uc ON uc.id=c.color_ref WHERE c.game_ref=? ORDER BY c.name`, g.id).map(c => ({ key: `gchar_${c.id}`, name: c.name, color: c.color_code })),
      ...all(`SELECT e.id, e.name FROM game_col_element e JOIN game_collection c ON e.collection_ref=c.id WHERE c.game_ref=? ORDER BY e.name`, g.id).map(e => ({ key: `gel_${e.id}`, name: e.name, color: null })),
    ],
  }));

  // Writer: projects → series → books → chapters
  const writer = all(`SELECT p.id, p.project_name AS name, uc.color_code FROM write_project p LEFT JOIN use_color uc ON uc.id=p.color WHERE (? IS NULL OR p.nexus_ref=?) ORDER BY p.project_name`, nx, nx).map(p => ({
    key: `write_${p.id}`, name: p.name, color: p.color_code,
    children: all(`SELECT s.id, s.name, uc.color_code FROM write_series s LEFT JOIN use_color uc ON uc.id=s.color WHERE s.project_id=? ORDER BY s.name`, p.id).map(s => ({
      key: `wser_${s.id}`, name: s.name, color: s.color_code,
      children: all(`SELECT b.id, b.name, uc.color_code FROM write_book b LEFT JOIN use_color uc ON uc.id=b.color WHERE b.series_id=? ORDER BY b.name`, s.id).map(b => ({
        key: `wbook_${b.id}`, name: b.name, color: b.color_code,
        children: all(`SELECT ch.id, ch.name, uc.color_code FROM write_chapter ch LEFT JOIN use_color uc ON uc.id=ch.color WHERE ch.book_id=? ORDER BY ch.chapter_order`, b.id).map(ch => ({ key: `wchp_${ch.id}`, name: ch.name, color: ch.color_code })),
      })),
    })),
  }));

  return { scribe, director, navigator, hero, writer };
}

// Ancestor ids so the renderer can navigate straight to a deep entity.
function getEntityPath(key) {
  const d = getDB();
  const m = String(key).match(/^([a-z]+)_(\d+)$/);
  if (!m) return null;
  const id = Number(m[2]);
  try {
    switch (m[1]) {
      case 'note': return { kind: 'note', noteId: id };
      case 'obj': {
        const r = d.prepare(`SELECT id, project_id, category_id FROM object WHERE id=?`).get(id);
        return r && { kind: 'obj', projectId: r.project_id, categoryId: r.category_id, objectId: id };
      }
      case 'proj': return { kind: 'proj', projectId: id };
      case 'world': return { kind: 'world', worldId: id };
      case 'game': return { kind: 'game', gameId: id };
      case 'write': return { kind: 'write', writeId: id };
      case 'wchar': {
        const r = d.prepare(`SELECT world_ref FROM world_character WHERE id=?`).get(id);
        return r && { kind: 'world', worldId: r.world_ref, charId: id };
      }
      case 'wobj': {
        const r = d.prepare(`SELECT c.world_ref FROM world_orig_object o JOIN world_orig_category c ON o.category_id=c.id WHERE o.id=?`).get(id);
        return r && { kind: 'world', worldId: r.world_ref, objId: id };
      }
      case 'gchar': {
        const r = d.prepare(`SELECT game_ref FROM game_character WHERE id=?`).get(id);
        return r && { kind: 'game', gameId: r.game_ref, charId: id };
      }
      case 'gel': {
        const r = d.prepare(`SELECT c.game_ref FROM game_col_element e JOIN game_collection c ON e.collection_ref=c.id WHERE e.id=?`).get(id);
        return r && { kind: 'game', gameId: r.game_ref, elementId: id };
      }
      case 'wchp': {
        const r = d.prepare(`
          SELECT ch.book_id, b.series_id, s.project_id FROM write_chapter ch
          JOIN write_book b ON ch.book_id=b.id JOIN write_series s ON b.series_id=s.id WHERE ch.id=?
        `).get(id);
        return r && { kind: 'wchp', writeId: r.project_id, seriesId: r.series_id, bookId: r.book_id, chapterId: id };
      }
      case 'wnote': {
        const r = d.prepare(`SELECT project_id FROM write_note WHERE id=?`).get(id);
        return r && { kind: 'write', writeId: r.project_id, wnoteId: id };
      }
    }
  } catch (_) {}
  return null;
}

// A newly created entity should claim [[links]] typed before it existed —
// they were indexed with target_key NULL. Called from entity create paths.
function resolveDanglingLinks(name, nexusId) {
  const d = getDB();
  const rows = d.prepare(`SELECT id, target_text FROM wiki_link WHERE target_key IS NULL AND (? IS NULL OR nexus_ref=?)`)
    .all(nexusId ?? null, nexusId ?? null);
  const bare = (s) => String(s).replace(/^\w+:/, '').trim().toLowerCase();
  const wanted = String(name).trim().toLowerCase();
  let n = 0;
  for (const r of rows) {
    if (bare(r.target_text) !== wanted) continue;
    const key = resolveWikiName(r.target_text, nexusId);
    if (key) { d.prepare(`UPDATE wiki_link SET target_key=?, update_at=datetime('now') WHERE id=?`).run(key, r.id); n++; }
  }
  return n;
}

// ── Rename safety ───────────────────────────────────────────────────────────
// [[links]] live in plain text, so renaming a target breaks them. This
// rewrites [[Old]] / [[Old|alias]] / [[ns:Old]] inside every source that
// references targetKey, then reindexes those sources.
const CONTENT_SOURCES = {
  note: { get: `SELECT content AS c FROM note WHERE id=?`, set: `UPDATE note SET content=?, update_at=datetime('now') WHERE id=?` },
  obj:  { get: `SELECT note AS c FROM object WHERE id=?`,  set: `UPDATE object SET note=?, update_at=datetime('now') WHERE id=?` },
  wchp: { get: `SELECT chapter_content AS c FROM write_chapter WHERE id=?`, set: `UPDATE write_chapter SET chapter_content=?, update_at=datetime('now') WHERE id=?` },
};

function renameWikiTarget(targetKey, oldName, newName) {
  const d = getDB();
  if (!oldName || !newName || oldName === newName) return 0;
  const esc = String(oldName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\[\\[((?:\\w+:)?)\\s*${esc}\\s*(\\||\\]\\])`, 'gi');
  const rows = d.prepare(`SELECT DISTINCT src_key, nexus_ref FROM wiki_link WHERE target_key=?`).all(targetKey);
  let changed = 0;
  for (const r of rows) {
    const m = String(r.src_key).match(/^([a-z]+)_(\d+)$/);
    const src = m && CONTENT_SOURCES[m[1]];
    if (!src) continue;
    const id = Number(m[2]);
    const row = d.prepare(src.get).get(id);
    if (!row || !row.c) continue;
    const next = row.c.replace(re, (_, ns, tail) => `[[${ns}${newName}${tail}`);
    if (next === row.c) continue;
    d.prepare(src.set).run(next, id);
    reindexWikiLinks(r.src_key, next, r.nexus_ref);
    changed++;
  }
  return changed;
}

module.exports = {
  renameWikiTarget, resolveDanglingLinks,
  resolveWikiName, reindexWikiLinks, rebuildWikiIndex,
  nexusOfNote, nexusOfObject, nexusOfChapter,
  getBacklinks, getOutgoingLinks, resolveEntityKeys,
  quickIndex, getEntityPath, explorerTree, getGraph,
};
