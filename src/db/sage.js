const { getDB } = require('./core');

function getDataSize() {
  const db = getDB();
  const modules = [
    { name:'director', tables:['project','object_category','object','object_attribute','timeline','timeline_event','relation','relation_type','map','map_area','map_point'] },
    { name:'navigator', tables:['world_project','world_description','world_character','world_category','world_cat_object','world_map','world_map_timeline','world_maptl_event'] },
    { name:'hero', tables:['game_project','game_category','game_cat_object','game_character','game_char_template','game_char_attribute','game_collection','game_col_template','game_col_element','game_col_attribute','game_char_element','game_story','game_dialogue','game_storyline','game_conversation'] },
    { name:'writer', tables:['library_project','library_series','library_document','series_description'] },
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
    { key:'libraries',     sql:`SELECT COUNT(*) AS cnt FROM library_project` },
    { key:'series',        sql:`SELECT COUNT(*) AS cnt FROM library_series` },
    { key:'documents',     sql:`SELECT COUNT(*) AS cnt FROM library_document` },
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

  // Library world links
  try {
    db.prepare(`SELECT lp.name AS from_name, wp.name AS to_name, 'library' AS from_type, 'world' AS to_type FROM library_world_link lwl JOIN library_project lp ON lp.id=lwl.library_ref JOIN world_project wp ON wp.id=lwl.world_ref`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  // Series novel links
  try {
    db.prepare(`SELECT ls.name AS from_name, p.name AS to_name, 'series' AS from_type, 'project' AS to_type FROM series_novel_link snl JOIN library_series ls ON ls.id=snl.series_ref JOIN project p ON p.id=snl.project_ref`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  // World char links (world character → novel object)
  try {
    db.prepare(`SELECT wc.name AS from_name, o.name AS to_name, 'world_char' AS from_type, 'object' AS to_type FROM world_char_link wcl JOIN world_character wc ON wc.id=wcl.char_ref JOIN object o ON o.id=wcl.object_ref`).all()
      .forEach(r => links.push(r));
  } catch(_){}

  return links;
}

function getLinkerGraph() {
  const db = getDB();
  const nodes = new Map(); // key => {id, label, type}
  const edges = [];
  let nodeId = 0;

  function ensureNode(key, label, type) {
    if (!nodes.has(key)) nodes.set(key, { id: nodeId++, label, type });
    return nodes.get(key).id;
  }

  // Projects
  try {
    db.prepare(`SELECT id, name FROM project`).all().forEach(r => ensureNode(`proj_${r.id}`, r.name, 'project'));
  } catch(_){}

  // Hashtags
  try {
    db.prepare(`SELECT id, tag_name FROM hashtag`).all().forEach(r => ensureNode(`tag_${r.id}`, r.tag_name, 'hashtag'));
  } catch(_){}

  // Worlds
  try {
    db.prepare(`SELECT id, name FROM world_project`).all().forEach(r => ensureNode(`world_${r.id}`, r.name, 'world'));
  } catch(_){}

  // Games
  try {
    db.prepare(`SELECT id, name FROM game_project`).all().forEach(r => ensureNode(`game_${r.id}`, r.name, 'game'));
  } catch(_){}

  // Libraries
  try {
    db.prepare(`SELECT id, name FROM library_project`).all().forEach(r => ensureNode(`lib_${r.id}`, r.name, 'library'));
  } catch(_){}

  // Edges: project hashtags
  try {
    db.prepare(`SELECT project_id, hashtag_id FROM project_hashtag`).all().forEach(r => {
      const s = nodes.get(`proj_${r.project_id}`)?.id, t = nodes.get(`tag_${r.hashtag_id}`)?.id;
      if (s != null && t != null) edges.push({ source: s, target: t });
    });
  } catch(_){}

  // Edges: world → project
  try {
    db.prepare(`SELECT world_ref, project_ref FROM world_novel_link`).all().forEach(r => {
      const s = nodes.get(`world_${r.world_ref}`)?.id, t = nodes.get(`proj_${r.project_ref}`)?.id;
      if (s != null && t != null) edges.push({ source: s, target: t });
    });
  } catch(_){}

  // Edges: game → project
  try {
    db.prepare(`SELECT game_ref, project_ref FROM game_novel_link`).all().forEach(r => {
      const s = nodes.get(`game_${r.game_ref}`)?.id, t = nodes.get(`proj_${r.project_ref}`)?.id;
      if (s != null && t != null) edges.push({ source: s, target: t });
    });
  } catch(_){}

  // Edges: library → world
  try {
    db.prepare(`SELECT library_ref, world_ref FROM library_world_link`).all().forEach(r => {
      const s = nodes.get(`lib_${r.library_ref}`)?.id, t = nodes.get(`world_${r.world_ref}`)?.id;
      if (s != null && t != null) edges.push({ source: s, target: t });
    });
  } catch(_){}

  return { nodes: Array.from(nodes.values()), edges };
}

module.exports = { getDataSize, getObjectAmounts, getLinkerList, getLinkerGraph };
