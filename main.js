const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const db = require('./database');

// Ensure only one instance runs. The SQLite layer recovers from a stale lock dir
// by deleting it on open, which is only safe if no other instance is using the DB.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

// Keep app data next to the executable for portable builds.
const isPackaged = app.isPackaged;
const portableRoot = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath('exe'));
const tempDataPath = isPackaged
  ? path.join(portableRoot, 'novel-manager-data')
  : path.join(__dirname, 'tmp-user-data');
if (!fs.existsSync(tempDataPath)) fs.mkdirSync(tempDataPath, { recursive: true });
const electronUserDataPath = path.join(tempDataPath, 'electron-user-data');
app.setPath('userData', electronUserDataPath);
app.commandLine.appendSwitch('no-sandbox');


function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 960, minHeight: 600,
    backgroundColor: '#050506',
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'Image', 'DraconDex-IconApp.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'I' && input.control && input.shift) {
      win.webContents.toggleDevTools();
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

const h = (ch, fn) => ipcMain.handle(ch, async (_, ...a) => {
  try {
    return await fn(...a);
  } catch (err) {
    console.error(`IPC handler ${ch} error:`, err);
    throw err;
  }
});

// DB import/export
h('db:exportFile', async () => {
  const defaultName = `novel-manager-backup-${new Date().toISOString().slice(0, 10)}.db`;
  const result = await dialog.showSaveDialog({
    title: 'Export Database',
    defaultPath: path.join(app.getPath('documents'), defaultName),
    filters: [{ name: 'SQLite DB', extensions: ['db'] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await db.exportDatabaseTo(result.filePath);
  return { canceled: false, filePath: result.filePath };
});

h('db:importFileMerge', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Import Database (.db)',
    properties: ['openFile'],
    filters: [{ name: 'SQLite DB', extensions: ['db'] }],
  });
  if (result.canceled || !result.filePaths?.[0]) return { canceled: true };
  const summary = db.importDatabaseMerge(result.filePaths[0]);
  return { canceled: false, summary };
});

// Folder
h('folder:getAll',  ()           => db.getFolders());
h('folder:create',  (n,m,c)      => db.createFolder(n,m,c));
h('folder:update',  (id,n,m,c)   => db.updateFolder(id,n,m,c));
h('folder:delete',  (id)         => db.deleteFolder(id));

// Project
h('project:getAll', (fid)        => db.getProjects(fid));
h('project:get',    (id)         => db.getProject(id));
h('project:create', (data)       => db.createProject(data));
h('project:update', (id,data)    => db.updateProject(id,data));
h('project:delete', (id)         => db.deleteProject(id));
h('project:getDesc',  (pid)      => db.getProjectDesc(pid));
h('project:addDesc',  (pid,n,t)  => db.addProjectDesc(pid,n,t));
h('project:updDesc',  (id,n,t)   => db.updateProjectDesc(id,n,t));
h('project:delDesc',  (id)       => db.deleteProjectDesc(id));

// Category
h('category:getAll', (pid)       => db.getCategories(pid));
h('category:create', (pid,n,c)   => db.createCategory(pid,n,c));
h('category:update', (id,n,c)    => db.updateCategory(id,n,c));
h('category:delete', (id)        => db.deleteCategory(id));

// Template
h('template:getAll', (cid)       => db.getTemplates(cid));
h('template:create', (cid,d,t)   => db.createTemplate(cid,d,t));
h('template:update', (id,d,t)    => db.updateTemplate(id,d,t));
h('template:delete', (id)        => db.deleteTemplate(id));

// Object
h('object:getAll',  (cid)        => db.getObjects(cid));
h('object:get',     (id)         => db.getObject(id));
h('object:create',  (pid,cid,n,c)=> db.createObject(pid,cid,n,c));
h('object:update',  (id,n,c)     => db.updateObject(id,n,c));
h('object:updateNote',(id,note)  => db.updateObjectNote(id,note));
h('object:delete',  (id)         => db.deleteObject(id));
h('object:getAttrs',(oid)        => db.getObjectAttrs(oid));
h('object:upsertAttr',(oid,tid,v)=> db.upsertAttr(oid,tid,v));
h('object:getCategoryAttrs',(cid) => db.getCategoryAttrs(cid));

// Color
h('color:getAll',   ()           => db.getColors());
h('color:add',      (code)       => db.addColor(code));
h('color:markUsed', (id)         => db.markColorUsed(id));
h('color:getRecent',()           => db.getRecentColors());
h('color:delete',   (id)         => db.deleteColor(id));

// Timeline
h('timeline:getAll',  (pid) => db.getTimelines(pid));
h('timeline:create',  (pid,n,c) => db.createTimeline(pid,n,c));
h('timeline:update',  (id,n,c) => db.updateTimeline(id,n,c));
h('timeline:delete',  (id) => db.deleteTimeline(id));
h('timeline:getOrCreateDate', (d,m,y,hh,mm) => db.getOrCreateDate(d,m,y,hh,mm));
h('timeline:getEvents',  (tlid) => db.getEvents(tlid));
h('timeline:createEvent',(tlid,n,sid,eid,c,story) => db.createEvent(tlid,n,sid,eid,c,story));
h('timeline:updateEvent',(id,n,sid,eid,c,story) => db.updateEvent(id,n,sid,eid,c,story));
h('timeline:updateEventStory',(id,story) => db.updateEventStory(id,story));
h('timeline:deleteEvent',(id) => db.deleteEvent(id));

// Relation
h('relation:getTypes',    () => db.getRelationTypes());
h('relation:createType',  (n,c) => db.createRelationType(n,c));
h('relation:updateType',  (id,n,c) => db.updateRelationType(id,n,c));
h('relation:deleteType',  (id) => db.deleteRelationType(id));
h('relation:getOBOB',     (pid) => db.getRelationsOBOB(pid));
h('relation:createOBOB',  (pid,tid,c,f,t) => db.createRelationOBOB(pid,tid,c,f,t));
h('relation:deleteOBOB',  (id) => db.deleteRelationOBOB(id));
h('relation:update',      (id,tid,c) => db.updateRelation(id,tid,c));
h('relation:getOBTL',     (pid) => db.getRelationsOBTL(pid));
h('relation:createOBTL',  (pid,tid,c,f,t) => db.createRelationOBTL(pid,tid,c,f,t));
h('relation:deleteOBTL',  (id) => db.deleteRelationOBTL(id));
h('relation:getTLTL',     (pid) => db.getRelationsTLTL(pid));
h('relation:createTLTL',  (pid,tid,c,f,t) => db.createRelationTLTL(pid,tid,c,f,t));
h('relation:deleteTLTL',  (id) => db.deleteRelationTLTL(id));
h('relation:getProjectObjects', (pid) => db.getProjectObjects(pid));
h('relation:getProjectEvents',  (pid) => db.getProjectEvents(pid));
h('relation:getEventLinks',     (eid) => db.getEventLinks(eid));

// Mapping
h('map:getAll',      (pid) => db.getMaps(pid));
h('map:create',      (pid,n,c) => db.createMap(pid,n,c));
h('map:update',      (id,n,c) => db.updateMap(id,n,c));
h('map:delete',      (id) => db.deleteMap(id));
h('map:getAreas',    (mid) => db.getMapAreas(mid));
h('map:createArea',  (mid,n,c) => db.createMapArea(mid,n,c));
h('map:updateArea',  (id,n,c) => db.updateMapArea(id,n,c));
h('map:deleteArea',  (id) => db.deleteMapArea(id));
h('map:getPoints',   (aid) => db.getMapAreaPoints(aid));
h('map:setPoints',   (aid,points) => db.setMapAreaPoints(aid, points));

// Hashtag
h('hashtag:getAll',  () => db.getHashtags());
h('hashtag:create',  (n,c) => db.createHashtag(n,c));
h('hashtag:update',  (id,n,c) => db.updateHashtag(id,n,c));
h('hashtag:delete',  (id) => db.deleteHashtag(id));

// Hashtag mappings (project/object/event)
h('project:getTags', (pid) => db.getProjectTags(pid));
h('project:setTags', (pid,tags) => db.setProjectTags(pid,tags));
h('project:addTag', (pid,tid) => db.addProjectTag(pid,tid));
h('project:removeTag', (pid,tid) => db.removeProjectTag(pid,tid));

h('object:getTags', (oid) => db.getObjectTags(oid));
h('object:setTags', (oid,tags) => db.setObjectTags(oid,tags));
h('object:addTag', (oid,tid) => db.addObjectTag(oid,tid));
h('object:removeTag', (oid,tid) => db.removeObjectTag(oid,tid));

h('timeline:getEventTags', (eid) => db.getEventTags(eid));
h('timeline:setEventTags', (eid,tags) => db.setEventTags(eid,tags));
h('timeline:addEventTag', (eid,tid) => db.addEventTag(eid,tid));
h('timeline:removeEventTag', (eid,tid) => db.removeEventTag(eid,tid));

// Search
h('search:all', (q) => db.searchAll(q));

// Hashtag objects by tag
h('hashtag:getObjectsByTag', (tagId, projectId) => db.getObjectsByHashtag(tagId, projectId));
h('hashtag:getEventsByTag', (tagId, projectId) => db.getEventsByHashtag(tagId, projectId));
h('project:getAllUsedTags', (pid) => db.getAllProjectUsedTags(pid));

// Navigator (v2.5.2) — World module
h('world:getAll',           ()                        => db.getWorlds());
h('world:get',              (id)                      => db.getWorld(id));
h('world:create',           (code,n,m,c)              => db.createWorld(code,n,m,c));
h('world:update',           (id,code,n,m,c)           => db.updateWorld(id,code,n,m,c));
h('world:delete',           (id)                      => db.deleteWorld(id));

h('world:getNovels',        (wid)                     => db.getWorldNovels(wid));
h('world:getLinkableProjects',(wid)                   => db.getLinkableProjects(wid));
h('world:addNovel',         (wid,pid)                 => db.addWorldNovel(wid,pid));
h('world:removeNovel',      (id)                      => db.removeWorldNovel(id));
h('world:setNovelCharCat',  (wnid,catref)             => db.setNovelCharCat(wnid,catref));

// World-owned ("original") category→object→attribute→template
h('world:origCatGetAll',    (wid)                     => db.getOrigCategories(wid));
h('world:origCatCreate',    (wid,n,c)                 => db.createOrigCategory(wid,n,c));
h('world:origCatUpdate',    (id,n,c)                  => db.updateOrigCategory(id,n,c));
h('world:origCatDelete',    (id)                      => db.deleteOrigCategory(id));
h('world:origTmplGetAll',   (cid)                     => db.getOrigTemplates(cid));
h('world:origTmplCreate',   (cid,d,t)                 => db.createOrigTemplate(cid,d,t));
h('world:origTmplUpdate',   (id,d,t)                  => db.updateOrigTemplate(id,d,t));
h('world:origTmplDelete',   (id)                      => db.deleteOrigTemplate(id));
h('world:origObjGetAll',    (cid)                     => db.getOrigObjects(cid));
h('world:origObjGet',       (id)                      => db.getOrigObject(id));
h('world:origObjCreate',    (wid,cid,n,c)             => db.createOrigObject(wid,cid,n,c));
h('world:origObjUpdate',    (id,n,c)                  => db.updateOrigObject(id,n,c));
h('world:origObjUpdateNote',(id,note)                 => db.updateOrigObjectNote(id,note));
h('world:origObjDelete',    (id)                      => db.deleteOrigObject(id));
h('world:origObjGetAttrs',  (oid)                     => db.getOrigObjectAttrs(oid));
h('world:origObjUpsertAttr',(oid,tid,v)              => db.upsertOrigAttr(oid,tid,v));

h('world:getDesc',          (wid)                     => db.getWorldDesc(wid));
h('world:addDesc',          (wid,n,t)                 => db.addWorldDesc(wid,n,t));
h('world:updDesc',          (id,n,t)                  => db.updateWorldDesc(id,n,t));
h('world:delDesc',          (id)                      => db.deleteWorldDesc(id));

h('world:getCharacters',    (wid)                     => db.getWorldCharacters(wid));
h('world:createCharacter',  (wid,n,sym,c)             => db.createWorldCharacter(wid,n,sym,c));
h('world:updateCharacter',  (id,n,sym,c)              => db.updateWorldCharacter(id,n,sym,c));
h('world:deleteCharacter',  (id)                      => db.deleteWorldCharacter(id));
h('world:getCharLinks',     (cid)                     => db.getCharacterLinks(cid));
h('world:getLinkableCharObjects',(wid,cid)            => db.getLinkableCharacterObjects(wid,cid));
h('world:addCharLink',      (cid,oref)                => db.addCharacterLink(cid,oref));
h('world:removeCharLink',   (id)                      => db.removeCharacterLink(id));

h('world:getCategories',    (wid)                     => db.getWorldCategories(wid));
h('world:getLinkableCategories',(wid,forChars)        => db.getLinkableCategories(wid,forChars));
h('world:addCategory',      (wid,catref)              => db.addWorldCategory(wid,catref));
h('world:removeCategory',   (id)                      => db.removeWorldCategory(id));

h('world:getObjects',       (wcid)                    => db.getWorldObjects(wcid));
h('world:updateObjectSymbol',(id,sym)                 => db.updateWorldObjectSymbol(id,sym));
h('world:getSymbolCollection',()                      => db.getSymbolCollection());

h('world:getMaps',          (wid)                     => db.getWorldMaps(wid));
h('world:getLinkableMaps',  (wid)                     => db.getLinkableMaps(wid));
h('world:addMap',           (wid,mref)                => db.addWorldMap(wid,mref));
h('world:removeMap',        (id)                      => db.removeWorldMap(id));
h('world:getMapAreas',      (wmid)                    => db.getWorldMapAreas(wmid));

h('world:getTimelines',     (wid)                     => db.getWorldTimelines(wid));
h('world:createTimeline',   (wid,n,wmref)             => db.createWorldTimeline(wid,n,wmref));
h('world:updateTimeline',   (id,n,wmref)              => db.updateWorldTimeline(id,n,wmref));
h('world:deleteTimeline',   (id)                      => db.deleteWorldTimeline(id));

h('world:getEvents',        (tlid)                    => db.getTimelineEvents(tlid));
h('world:createEvent',      (tlid,d,mo,y,hr,mi)       => db.createTimelineEvent(tlid,d,mo,y,hr,mi));
h('world:deleteEvent',      (id)                      => db.deleteTimelineEvent(id));

h('world:getEventObjects',  (evid)                    => db.getEventObjects(evid));
h('world:getPlaceableObjects',(wid)                   => db.getPlaceableObjects(wid));
h('world:getPlaceableCharacters',(wid)                => db.getPlaceableCharacters(wid));
h('world:addEventObject',   (evid,oref,cref,x,y)      => db.addEventObject(evid,oref,cref,x,y));
h('world:updateEventObjectPoint',(id,x,y)             => db.updateEventObjectPoint(id,x,y));
h('world:removeEventObject',(id)                      => db.removeEventObject(id));

// Hero (v2.3) — Game module
h('game:getAll',            ()                        => db.getGames());
h('game:get',               (id)                      => db.getGame(id));
h('game:create',            (n,m,c)                   => db.createGame(n,m,c));
h('game:update',            (id,n,m,c)                => db.updateGame(id,n,m,c));
h('game:delete',            (id)                      => db.deleteGame(id));

h('game:getDesc',           (gid)                     => db.getGameDesc(gid));
h('game:addDesc',           (gid,t,c)                 => db.addGameDesc(gid,t,c));
h('game:updateDesc',        (id,t,c)                  => db.updateGameDesc(id,t,c));
h('game:deleteDesc',        (id)                      => db.deleteGameDesc(id));

h('game:getNovelLink',      (gid)                     => db.getGameNovelLink(gid));
h('game:setNovelLink',      (gid,pid)                 => db.setGameNovelLink(gid,pid));

h('game:getCharacters',     (gid)                     => db.getGameCharacters(gid));
h('game:createCharacter',   (gid,n,m)                 => db.createGameCharacter(gid,n,m));
h('game:updateCharacter',   (id,n,m)                  => db.updateGameCharacter(id,n,m));
h('game:deleteCharacter',   (id)                      => db.deleteGameCharacter(id));
h('game:setCharLink',       (cid,pid,catid,oid)       => db.setGameCharLink(cid,pid,catid,oid));
h('game:getStats',          (cid)                     => db.getGameStats(cid));
h('game:createStat',        (cid,n,t)                 => db.createGameStat(cid,n,t));
h('game:updateStat',        (id,n,t)                  => db.updateGameStat(id,n,t));
h('game:deleteStat',        (id)                      => db.deleteGameStat(id));
h('game:getStatLevelups',   (cid)                     => db.getGameStatLevelups(cid));
h('game:upsertStatLevelup', (cid,tid,lv,val)          => db.upsertGameStatLevelup(cid,tid,lv,val));
h('game:deleteStatLevelup', (cid,tid,lv)              => db.deleteGameStatLevelup(cid,tid,lv));
h('game:getCharTags',       (cid)                     => db.getGameCharTags(cid));
h('game:setCharTags',       (cid,tags)                => db.setGameCharTags(cid,tags));

h('game:getItemCategories', (gid)                     => db.getGameItemCategories(gid));
h('game:createItemCategory',(gid,n,m)                 => db.createGameItemCategory(gid,n,m));
h('game:updateItemCategory',(id,n,m)                  => db.updateGameItemCategory(id,n,m));
h('game:deleteItemCategory',(id)                      => db.deleteGameItemCategory(id));
h('game:getItemTemplates',  (icid)                    => db.getGameItemTemplates(icid));
h('game:createItemTemplate',(icid,n,t)                => db.createGameItemTemplate(icid,n,t));
h('game:updateItemTemplate',(id,n,t)                  => db.updateGameItemTemplate(id,n,t));
h('game:deleteItemTemplate',(id)                      => db.deleteGameItemTemplate(id));
h('game:getItems',          (icid)                    => db.getGameItems(icid));
h('game:createItem',        (icid,n,sym)              => db.createGameItem(icid,n,sym));
h('game:updateItem',        (id,n,sym)                => db.updateGameItem(id,n,sym));
h('game:deleteItem',        (id)                      => db.deleteGameItem(id));
h('game:getItemAttrs',      (iid)                     => db.getGameItemAttrs(iid));
h('game:upsertItemAttr',    (iid,tid,v)               => db.upsertGameItemAttr(iid,tid,v));
h('game:getItemTags',       (iid)                     => db.getGameItemTags(iid));
h('game:setItemTags',       (iid,tags)                => db.setGameItemTags(iid,tags));

h('game:getStories',        (gid)                     => db.getGameStories(gid));
h('game:createStory',       (gid,n,m)                 => db.createGameStory(gid,n,m));
h('game:updateStory',       (id,n,m)                  => db.updateGameStory(id,n,m));
h('game:deleteStory',       (id)                      => db.deleteGameStory(id));
h('game:getDialogues',      (sid)                     => db.getGameDialogues(sid));
h('game:createDialogue',    (sid,n,m,x,y)             => db.createGameDialogue(sid,n,m,x,y));
h('game:updateDialogue',    (id,n,m,x,y)              => db.updateGameDialogue(id,n,m,x,y));
h('game:deleteDialogue',    (id)                      => db.deleteGameDialogue(id));
h('game:updateDialoguePos', (id,x,y)                  => db.updateGameDialoguePos(id,x,y));
h('game:getDialogueEdges',  (sid)                     => db.getGameDialogueEdges(sid));
h('game:createDialogueEdge',(fid,tid,cond)            => db.createGameDialogueEdge(fid,tid,cond));
h('game:deleteDialogueEdge',(id)                      => db.deleteGameDialogueEdge(id));
h('game:getDialogueLines',  (did)                     => db.getGameDialogueLines(did));
h('game:createDialogueLine',(did,spk,txt,ord)         => db.createGameDialogueLine(did,spk,txt,ord));
h('game:updateDialogueLine',(id,spk,txt,ord)          => db.updateGameDialogueLine(id,spk,txt,ord));
h('game:deleteDialogueLine',(id)                      => db.deleteGameDialogueLine(id));

h('game:getFuncCategories', (gid)                     => db.getGameFuncCategories(gid));
h('game:createFuncCategory',(gid,n,t)                 => db.createGameFuncCategory(gid,n,t));
h('game:updateFuncCategory',(id,n,t)                  => db.updateGameFuncCategory(id,n,t));
h('game:deleteFuncCategory',(id)                      => db.deleteGameFuncCategory(id));
h('game:getFunctions',      (fcid)                    => db.getGameFunctions(fcid));
h('game:createFunction',    (fcid,n,tpl,cond,eff)     => db.createGameFunction(fcid,n,tpl,cond,eff));
h('game:updateFunction',    (id,n,tpl,cond,eff)       => db.updateGameFunction(id,n,tpl,cond,eff));
h('game:deleteFunction',    (id)                      => db.deleteGameFunction(id));

h('game:getTags',           (gid)                     => db.getGameTags(gid));
h('game:setTags',           (gid,tags)                => db.setGameTags(gid,tags));

// Writer / Library
h('library:getProjects',          ()                         => db.getLibraryProjects());
h('library:createProject',        (n,m,c)                    => db.createLibraryProject(n,m,c));
h('library:updateProject',        (id,n,m,c)                 => db.updateLibraryProject(id,n,m,c));
h('library:deleteProject',        (id)                       => db.deleteLibraryProject(id));
h('library:getDescriptions',      (lid)                      => db.getLibraryDescriptions(lid));
h('library:createDescription',    (lid,t,c)                  => db.createLibraryDescription(lid,t,c));
h('library:updateDescription',    (id,t,c)                   => db.updateLibraryDescription(id,t,c));
h('library:deleteDescription',    (id)                       => db.deleteLibraryDescription(id));
h('library:getWorldLinks',        (lid)                      => db.getLibraryWorldLinks(lid));
h('library:addWorldLink',         (lid,wid)                  => db.addLibraryWorldLink(lid,wid));
h('library:removeWorldLink',      (id)                       => db.removeLibraryWorldLink(id));
h('library:getSeries',            (lid)                      => db.getLibrarySeries(lid));
h('library:createSeries',         (lid,n,m)                  => db.createLibrarySeries(lid,n,m));
h('library:updateSeries',         (id,n,m)                   => db.updateLibrarySeries(id,n,m));
h('library:deleteSeries',         (id)                       => db.deleteLibrarySeries(id));
h('library:getSeriesDescs',       (sid)                      => db.getSeriesDescriptions(sid));
h('library:createSeriesDesc',     (sid,t,c)                  => db.createSeriesDescription(sid,t,c));
h('library:updateSeriesDesc',     (id,t,c)                   => db.updateSeriesDescription(id,t,c));
h('library:deleteSeriesDesc',     (id)                       => db.deleteSeriesDescription(id));
h('library:getSeriesNovels',      (sid)                      => db.getSeriesNovelLinks(sid));
h('library:addSeriesNovel',       (sid,pid)                  => db.addSeriesNovelLink(sid,pid));
h('library:removeSeriesNovel',    (id)                       => db.removeSeriesNovelLink(id));
h('library:getSeriesChars',       (sid)                      => db.getSeriesCharLinks(sid));
h('library:addSeriesChar',        (sid,oid)                  => db.addSeriesCharLink(sid,oid));
h('library:removeSeriesChar',     (id)                       => db.removeSeriesCharLink(id));
h('library:getSeriesObjects',     (sid)                      => db.getSeriesObjectLinks(sid));
h('library:addSeriesObject',      (sid,oid)                  => db.addSeriesObjectLink(sid,oid));
h('library:removeSeriesObject',   (id)                       => db.removeSeriesObjectLink(id));
h('library:getSeriesTags',        (sid)                      => db.getSeriesHashtags(sid));
h('library:toggleSeriesTag',      (sid,hid)                  => db.toggleSeriesHashtag(sid,hid));
h('library:getDocs',              (sid)                      => db.getSeriesDocuments(sid));
h('library:createDoc',            (sid,n)                    => db.createDocument(sid,n));
h('library:getDoc',               (id)                       => db.getDocument(id));
h('library:updateDoc',            (id,n,cj)                  => db.updateDocument(id,n,cj));
h('library:deleteDoc',            (id)                       => db.deleteDocument(id));
h('library:getDocTags',           (did)                      => db.getDocumentHashtags(did));
h('library:toggleDocTag',         (did,hid)                  => db.toggleDocumentHashtag(did,hid));

h('library:exportPdf', async (_e, htmlContent, defaultName) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName || 'document.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { canceled: true };
  const win = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
  const pdfBuffer = await win.webContents.printToPDF({ printBackground: true });
  win.close();
  fs.writeFileSync(filePath, pdfBuffer);
  return { filePath };
});

// Sage / Analytics
h('sage:getDataSize',    () => db.getDataSize());
h('sage:getObjectAmounts', () => db.getObjectAmounts());
h('sage:getLinkerList',  () => db.getLinkerList());
h('sage:getLinkerGraph', () => db.getLinkerGraph());

h('library:exportDocx', async (_e, blocks, defaultName) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName || 'document.docx',
    filters: [{ name: 'Word Document', extensions: ['docx'] }],
  });
  if (canceled || !filePath) return { canceled: true };
  const { Document, Paragraph, TextRun, Packer } = require('docx');
  const paragraphs = (blocks || []).map(block => {
    const runs = (block.nodes || []).map(n => {
      if (n.type === 'mention') return new TextRun({ text: n.label, bold: true });
      return new TextRun({ text: n.text || '' });
    });
    if (block.type === 'heading1') return new Paragraph({ text: '', children: runs, heading: 'Heading1' });
    if (block.type === 'heading2') return new Paragraph({ text: '', children: runs, heading: 'Heading2' });
    return new Paragraph({ children: runs });
  });
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return { filePath };
});

// Window controls for the custom title/tab bar.
h('window:minimize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});
h('window:toggleMaximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return false;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
  return win.isMaximized();
});
h('window:close', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});
