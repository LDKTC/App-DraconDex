'use strict';
// Artisan module (v2.8) — create-from-template scaffolding.
// Each function creates a module entity (novel project / world / game /
// writing project) plus the starter structure described by `spec`, all inside
// one transaction so a half-built template never survives an error. The spec
// is plain data prepared by the renderer (names already localized there).
const { getDB } = require('./core');
const director = require('./director');
const timeline = require('./timeline');
const navigator = require('./navigator');
const hero = require('./hero');
const writer = require('./writer');

// spec: { categories:[{name, fields:[{name,type}]}], timelines:[name], descs:[name] }
const artisanCreateNovel = (base, spec) => {
  const tx = getDB().transaction(() => {
    const pid = director.createProject({
      name: base.name, codename: base.codename, memo: base.memo, colorId: base.colorId,
    }).lastInsertRowid;
    for (const c of spec.categories || []) {
      const cid = director.createCategory(pid, c.name, null).lastInsertRowid;
      for (const f of c.fields || []) director.createTemplate(cid, f.name, f.type || 'text');
    }
    for (const name of spec.timelines || []) timeline.createTimeline(pid, name, null);
    for (const name of spec.descs || []) director.addProjectDesc(pid, name, '');
    return pid;
  });
  return { id: tx() };
};

// spec: { categories:[{name, fields:[{name,type}]}], descs:[name] }
const artisanCreateWorld = (base, spec) => {
  const tx = getDB().transaction(() => {
    // navigator.createWorld already returns the new row id (not a run result).
    const wid = navigator.createWorld(base.codename, base.name, base.memo, base.colorId);
    for (const c of spec.categories || []) {
      const cid = navigator.createOrigCategory(wid, c.name, null).lastInsertRowid;
      for (const f of c.fields || []) navigator.createOrigTemplate(cid, f.name, f.type || 'text');
    }
    for (const name of spec.descs || []) navigator.addWorldDesc(wid, name, '');
    return wid;
  });
  return { id: tx() };
};

// spec: { charFields:[{name,type,levelable}], collections:[{name, fields:[{name,type,levelable}]}], stories:[name] }
const artisanCreateGame = (base, spec) => {
  const tx = getDB().transaction(() => {
    const gid = hero.createGame(base.name, base.codename, base.memo, base.colorId).lastInsertRowid;
    for (const f of spec.charFields || []) hero.createGameCharTemplate(gid, f.name, f.type || 'text', f.levelable ? 1 : 0);
    for (const col of spec.collections || []) {
      const colId = hero.createGameCollection(gid, col.name, null).lastInsertRowid;
      for (const f of col.fields || []) hero.createGameColTemplate(colId, f.name, f.type || 'text', f.levelable ? 1 : 0);
    }
    for (const name of spec.stories || []) hero.createGameStory(gid, name, null, null);
    return gid;
  });
  return { id: tx() };
};

// spec: { series:[{name, books:[{name, chapters:[name]}]}], notes:[name] }
const artisanCreateWrite = (base, spec) => {
  const tx = getDB().transaction(() => {
    const pid = writer.createWriteProject(base.name, base.codename, base.colorId);
    let firstSeriesId = null;
    for (const s of spec.series || []) {
      const sid = writer.createWriteSeries(pid, s.name, null);
      if (firstSeriesId == null) firstSeriesId = sid;
      for (const b of s.books || []) {
        const bid = writer.createWriteBook(sid, b.name, null);
        for (const chName of b.chapters || []) writer.createWriteChapter(bid, chName, null);
      }
    }
    for (const name of spec.notes || []) writer.createWriteNote(pid, name, null);
    return { id: pid, seriesId: firstSeriesId };
  });
  return tx();
};

module.exports = {
  artisanCreateNovel, artisanCreateWorld, artisanCreateGame, artisanCreateWrite,
};
