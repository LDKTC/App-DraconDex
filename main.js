const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const db = require('./database');

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
