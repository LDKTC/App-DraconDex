'use strict';
// Story "Narrator" (progress.md Phase 10) — route-board data. Dialogue
// nodes carry a position on the board and an ordered conversation
// (story_talk rows); story_edge rows are the directed route connections.
// talkCount/snippet are joined in so the board can render each node's
// first line without a per-node round trip.
const { getDB } = require('./core');

const getDialogues = (moduleRef) => getDB().prepare(`
  SELECT d.*, uc.color_code,
    (SELECT COUNT(*) FROM story_talk t WHERE t.dialogue_ref = d.id) AS talk_count,
    (SELECT t.speaker || CASE WHEN t.speaker IS NOT NULL AND t.speaker != '' THEN ': ' ELSE '' END || COALESCE(t.talk_sentence,'')
       FROM story_talk t WHERE t.dialogue_ref = d.id ORDER BY t.talk_order, t.id LIMIT 1) AS snippet
  FROM story_dialogue d
  LEFT JOIN use_color uc ON d.color = uc.id
  WHERE d.module_ref = ?
  ORDER BY d.id
`).all(moduleRef);

const createDialogue = (moduleRef, name, colorId, xPos, yPos) =>
  getDB().prepare(`INSERT INTO story_dialogue (module_ref,name,color,pos_x,pos_y) VALUES (?,?,?,?,?)`)
    .run(moduleRef, name, colorId || null, Number(xPos) || 0, Number(yPos) || 0).lastInsertRowid;

const updateDialogue = (id, name, colorId) =>
  getDB().prepare(`UPDATE story_dialogue SET name=?, color=?, update_at=datetime('now') WHERE id=?`)
    .run(name, colorId || null, id);

const updateDialoguePos = (id, xPos, yPos) =>
  getDB().prepare(`UPDATE story_dialogue SET pos_x=?, pos_y=?, update_at=datetime('now') WHERE id=?`)
    .run(Number(xPos) || 0, Number(yPos) || 0, id);

const deleteDialogue = (id) =>
  getDB().prepare(`DELETE FROM story_dialogue WHERE id=?`).run(id);

const getEdges = (moduleRef) => getDB().prepare(`
  SELECT * FROM story_edge WHERE module_ref = ? ORDER BY id
`).all(moduleRef);

// UNIQUE(from_ref,to_ref) upsert: re-connecting an existing pair just
// refreshes its label instead of erroring.
const createEdge = (moduleRef, fromRef, toRef, label) =>
  getDB().prepare(`
    INSERT INTO story_edge (module_ref,from_ref,to_ref,label) VALUES (?,?,?,?)
    ON CONFLICT(from_ref,to_ref) DO UPDATE SET label=excluded.label
  `).run(moduleRef, fromRef, toRef, label || null).lastInsertRowid;

const updateEdgeLabel = (id, label) =>
  getDB().prepare(`UPDATE story_edge SET label=? WHERE id=?`).run(label || null, id);

const deleteEdge = (id) =>
  getDB().prepare(`DELETE FROM story_edge WHERE id=?`).run(id);

const getTalks = (dialogueRef) => getDB().prepare(`
  SELECT * FROM story_talk WHERE dialogue_ref = ? ORDER BY talk_order, id
`).all(dialogueRef);

const createTalk = (dialogueRef, speaker, sentence) => {
  const d = getDB();
  const maxOrder = d.prepare(`SELECT COALESCE(MAX(talk_order),-1) AS m FROM story_talk WHERE dialogue_ref=?`).get(dialogueRef).m;
  return d.prepare(`INSERT INTO story_talk (dialogue_ref,speaker,talk_sentence,talk_order) VALUES (?,?,?,?)`)
    .run(dialogueRef, speaker || null, sentence || null, maxOrder + 1).lastInsertRowid;
};

const updateTalk = (id, speaker, sentence) =>
  getDB().prepare(`UPDATE story_talk SET speaker=?, talk_sentence=?, update_at=datetime('now') WHERE id=?`)
    .run(speaker || null, sentence || null, id);

const deleteTalk = (id) =>
  getDB().prepare(`DELETE FROM story_talk WHERE id=?`).run(id);

module.exports = {
  getDialogues, createDialogue, updateDialogue, updateDialoguePos, deleteDialogue,
  getEdges, createEdge, updateEdgeLabel, deleteEdge,
  getTalks, createTalk, updateTalk, deleteTalk,
};
