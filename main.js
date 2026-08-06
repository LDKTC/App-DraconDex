const { app, BrowserWindow, ipcMain, dialog, Menu, protocol } = require('electron');
const fs = require('fs');
const path = require('path');
const db = require('./database');

// Data location per build flavor:
// - portable exe (build:exe): PORTABLE_EXECUTABLE_DIR is set by the launcher
// - portable folder (build:portable): finish-portable.mjs drops portable.flag
//   next to the exe
// Both keep data in novel-manager-data beside the exe so it travels with the
// app. An installed build (build:installer) has neither marker, so data goes
// to the per-user appData dir — the install dir is deleted on uninstall/update
// and (for per-machine installs) may not be writable.
// In dev, DRACONDEX_DATA_DIR overrides the location so automated drivers can
// run against scratch data instead of tmp-user-data.
const isPackaged = app.isPackaged;
const exeDir = path.dirname(app.getPath('exe'));
const portableRoot = process.env.PORTABLE_EXECUTABLE_DIR ||
  (fs.existsSync(path.join(exeDir, 'portable.flag')) ? exeDir : null);
const tempDataPath = isPackaged
  ? (portableRoot
      ? path.join(portableRoot, 'novel-manager-data')
      : path.join(app.getPath('appData'), 'DraconDex', 'novel-manager-data'))
  : (process.env.DRACONDEX_DATA_DIR || path.join(__dirname, 'tmp-user-data'));
if (!fs.existsSync(tempDataPath)) fs.mkdirSync(tempDataPath, { recursive: true });
const electronUserDataPath = path.join(tempDataPath, 'electron-user-data');
app.setPath('userData', electronUserDataPath);
app.commandLine.appendSwitch('no-sandbox');

// ddx-file:// — display images are served straight to <img src> instead of
// being base64'd through IPC (Plan part2 #2.2). Must be declared before the
// app is ready.
// Deliberately NOT `standard: true`: index.html is loaded with loadFile, so
// the document origin is file://, and Chromium refuses to load a *standard*
// custom scheme as a subresource of a file:// page (verified — the request
// never reaches the handler, <img> just fires onerror). A non-standard
// scheme is opaque-origin like data:/blob: and loads fine. Consequence:
// ddx-file://<id> has no host component, so the handler parses the id off
// the raw URL rather than URL.hostname.
// Guarded because the run-dracondex web-driver harness loads this file with
// Electron's shell stubbed out (no `protocol`); there the renderer's
// <img onerror> fallback to importdock:readFiles takes over instead.
if (protocol) {
  protocol.registerSchemesAsPrivileged([
    { scheme: 'ddx-file', privileges: { secure: true, supportFetchAPI: true, stream: true, bypassCSP: true } },
  ]);
}

// Ensure only one instance runs per data dir. The SQLite layer recovers from a
// stale lock dir by deleting it on open, which is only safe if no other
// instance is using the same DB. userData is set above so the lock is keyed to
// the active data dir, letting an isolated test instance run alongside dev.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.on('second-instance', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});


// Popup (Builder-tab) windows are tracked here by id so "move this tab back
// to the main window" (Plan part1 #2/#2.1) can find a non-popup window to
// relay to, without needing a full parent/opener registry — see
// window:moveTabToMain below.
const popupWindowIds = new Set();

function createWindow(bootstrapNexusId, bootstrapTabKey) {
  const win = new BrowserWindow({
    width: bootstrapTabKey ? 900 : 1280, height: bootstrapTabKey ? 650 : 800,
    minWidth: 960, minHeight: 600,
    backgroundColor: '#050506',
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'Image', 'DraconDex_Icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (bootstrapTabKey) {
    popupWindowIds.add(win.id);
    win.on('closed', () => popupWindowIds.delete(win.id));
  }
  const params = new URLSearchParams();
  if (bootstrapNexusId) params.set('nexus', bootstrapNexusId);
  if (bootstrapTabKey) { params.set('tab', bootstrapTabKey); params.set('popup', '1'); }
  win.loadFile('index.html', params.toString() ? { search: params.toString() } : undefined);
}

// Plugins (v4.0.0 as "Github extensions", renamed v4.2.0): one dedicated
// BrowserWindow per running plugin, tracked winId -> plugin row id so
// pluginapi:table:* handlers below can resolve "which plugin is this" from the
// WINDOW's own identity (never renderer/plugin-supplied), and so
// launch/stop/uninstall can find or refuse an already-open plugin.
// This window gets preload-plugin.js — a categorically smaller contextBridge
// surface than preload.js, never the main app's window.api. See
// docs/PLUGINS.md for the full security notes (including why
// `sandbox: true` here is honest, not reassuring, given the process-wide
// --no-sandbox switch set above for portable-build compatibility).
const pluginWindows = new Map(); // BrowserWindow.id -> plugin row id

function findPluginWindow(pluginId) {
  for (const [winId, id] of pluginWindows) {
    if (id === pluginId) return BrowserWindow.fromId(winId);
  }
  return null;
}

function createPluginWindow(plugin) {
  const existing = findPluginWindow(plugin.id);
  if (existing && !existing.isDestroyed()) { existing.focus(); return existing; }
  const win = new BrowserWindow({
    width: 900, height: 650, minWidth: 480, minHeight: 360,
    backgroundColor: '#050506',
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'Image', 'DraconDex_Icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload-plugin.js'), // narrow — never preload.js
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
    },
  });
  pluginWindows.set(win.id, plugin.id);
  win.on('closed', () => pluginWindows.delete(win.id));
  win.loadFile(path.join(tempDataPath, 'plugins', plugin.plugin_key, plugin.entry_html));
  return win;
}

app.whenReady().then(() => {
  // Frameless window means no menu bar is ever visible, but keeping a real
  // application menu (rather than setApplicationMenu(null)) preserves its
  // accelerators — in particular Ctrl+Shift+I for DevTools, which the old
  // before-input-event handler reimplemented but double-fired on keyUp.
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'viewMenu' },
  ]));
  registerDisplayImageProtocol();
  // On-disk half of the v4.2.0 extensions -> plugins rename (the DB half is
  // migratePluginV42 in src/db/schema/migrations.js). Idempotent and silent.
  db.migratePluginDir();
  createWindow();
});

// Imported files are NOT copied into the data dir — import_file.file_path is
// the user's original absolute path, anywhere on disk (see importdock:add /
// pickFolder below), so there is no directory prefix to sandbox against.
// The URL therefore carries a row id, never a path: ddx-file://<importFileId>
// is looked up in import_file and served only if it is a registered image.
// A path in the URL would be an arbitrary-file-read hole; don't add one.
function registerDisplayImageProtocol() {
  if (!protocol) return;
  protocol.handle('ddx-file', async (req) => {
    const id = Number(String(req.url).replace(/^ddx-file:(\/\/)?/, '').split(/[?#/]/)[0]);
    if (!Number.isInteger(id) || id <= 0) return new Response(null, { status: 400 });
    const f = db.getImportFile(id);
    const ext = (f?.file_type || '').toLowerCase();
    if (!f || !IMAGE_EXTS.has(ext)) return new Response(null, { status: 404 });
    try {
      // ETag off mtime+size, served with no-cache: the browser reuses the
      // decoded image across re-renders but still revalidates, so replacing
      // the file on disk shows up immediately. The old base64 path cached
      // bytes in a renderer Map that was never invalidated.
      const st = await fs.promises.stat(f.file_path);
      const etag = `"${st.mtimeMs}-${st.size}"`;
      if (req.headers.get('if-none-match') === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag, 'Cache-Control': 'no-cache' } });
      }
      return new Response(await fs.promises.readFile(f.file_path), {
        headers: { 'Content-Type': imageMime(ext), ETag: etag, 'Cache-Control': 'no-cache' },
      });
    } catch (_) {
      return new Response(null, { status: 404 });
    }
  });
}
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
  const defaultName = `novel-manager-backup-${new Date().toISOString().slice(0, 10)}.ddx`;
  const result = await dialog.showSaveDialog({
    title: 'Export Database',
    defaultPath: path.join(app.getPath('documents'), defaultName),
    filters: [{ name: 'DraconDex Nexus', extensions: ['ddx'] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await db.exportDatabaseTo(result.filePath);
  return { canceled: false, filePath: result.filePath };
});

// Split into pick + merge so the renderer can show its "merge into the current
// database?" confirm *between* the two — while these were one call, the merge
// had already run by the time there was anything to confirm.
h('db:pickImportFile', async () => {
  // Accepts both the current .ddx format and legacy .db files (pre-v3.11,
  // or a v1/v2 export) — an old-shaped .db import is exactly the trigger
  // case for the Nexus Nest / Import DB choice modal (src/renderer/hub.js).
  const result = await dialog.showOpenDialog({
    title: 'Import Database (.ddx / .db)',
    properties: ['openFile'],
    filters: [{ name: 'DraconDex / SQLite DB', extensions: ['ddx', 'db'] }],
  });
  if (result.canceled || !result.filePaths?.[0]) return { canceled: true };
  return { canceled: false, filePath: result.filePaths[0] };
});

h('db:importMergeFile', async (filePath) => {
  if (!filePath) return { canceled: true };
  const summary = db.importDatabaseMerge(filePath);
  return { canceled: false, summary };
});

// Setting window → Appdata → Database: per-nexus / per-module export-import
// (Plan.md part1 #Setting) — same save/open-dialog-then-call split as the
// whole-database flow above, reusing Token Sync's snapshot format/functions
// (src/db/sync.js) under the hood (src/db/db-transfer.js).
h('db:exportNexusFile', async (nexusId, nexusName) => {
  const defaultName = `${String(nexusName || 'nexus').replace(/[\\/:*?"<>|]/g, '_')}.json`;
  const result = await dialog.showSaveDialog({
    title: 'Export Nexus', defaultPath: path.join(app.getPath('documents'), defaultName),
    filters: [{ name: 'DraconDex Nexus Snapshot', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  return db.exportNexusFile(nexusId, result.filePath);
});
h('db:importNexusFile', async (nexusId) => {
  const result = await dialog.showOpenDialog({
    title: 'Import Nexus', properties: ['openFile'],
    filters: [{ name: 'DraconDex Nexus Snapshot', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePaths?.[0]) return { ok: false, canceled: true };
  return db.importNexusFile(nexusId, result.filePaths[0]);
});
h('db:exportModuleFile', async (nexusId, moduleId, moduleName) => {
  const defaultName = `${String(moduleName || 'module').replace(/[\\/:*?"<>|]/g, '_')}.json`;
  const result = await dialog.showSaveDialog({
    title: 'Export Module', defaultPath: path.join(app.getPath('documents'), defaultName),
    filters: [{ name: 'DraconDex Module Snapshot', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  return db.exportModuleFile(nexusId, moduleId, result.filePath);
});
h('db:importModuleFile', async (nexusId, parentModuleId) => {
  const result = await dialog.showOpenDialog({
    title: 'Import Module', properties: ['openFile'],
    filters: [{ name: 'DraconDex Module Snapshot', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePaths?.[0]) return { ok: false, canceled: true };
  return db.importModuleFile(nexusId, parentModuleId, result.filePaths[0]);
});

// Nexus (vault)
h('nexus:getAll', ()             => db.getNexuses());
h('nexus:get',    (id)           => db.getNexus(id));
h('nexus:create', (n,m,c)        => db.createNexus(n,m,c));
h('nexus:update', (id,n,m,c)     => db.updateNexus(id,n,m,c));
h('nexus:delete', (id)           => db.deleteNexus(id));

// Scribe (markdown notes)
h('note:getFolders',   (nx)            => db.getNoteFolders(nx));
h('note:createFolder', (nx,n,p,c)      => db.createNoteFolder(nx,n,p,c));
h('note:updateFolder', (id,n,p,c)      => db.updateNoteFolder(id,n,p,c));
h('note:deleteFolder', (id)            => db.deleteNoteFolder(id));
h('note:getAll',       (nx)            => db.getNotes(nx));
h('note:get',          (id)            => db.getNote(id));
h('note:create',       (nx,t,f,c)      => db.createNote(nx,t,f,c));
h('note:update',       (id,t,f,c,p)    => db.updateNote(id,t,f,c,p));
h('note:updateContent',(id,content)    => db.updateNoteContent(id,content));
h('note:delete',       (id)            => db.deleteNote(id));

// Module system (v3 Nexus nest)
h('module:getTree',     (nx)          => db.getTree(nx));
h('module:getNestItems', (nx)         => db.getNestItems(nx));
h('module:get',         (id)          => db.getModule(id));
h('module:create',      (data)        => db.createModule(data));
h('module:update',      (id,data)     => db.updateModule(id,data));
h('module:updateDescription', (id,d)  => db.updateModuleDescription(id,d));
h('module:delete',      (id)          => db.deleteModule(id));
h('module:duplicate',   (id)          => db.duplicateModule(id));
h('module:move',        (nx,id,parentId,ids) => db.moveModule(nx,id,parentId,ids));
h('module:count',       (nx)          => db.countModules(nx));
h('module:getAttrs',    (id)          => db.getModuleAttrs(id));
h('module:upsertAttr',  (id,aid,n,v)  => db.upsertModuleAttr(id,aid,n,v));
h('module:deleteAttr',  (id)          => db.deleteModuleAttr(id));
h('module:getUi',       (id)          => db.getModuleUi(id));
h('module:setUi',       (id,k,v)      => db.setModuleUi(id,k,v));
h('module:getTags',     (id)          => db.getModuleTags(id));
h('module:setTags',     (id,tags)     => db.setModuleTags(id,tags));
h('module:getLinks',    (id)          => db.getModuleLinks(id));
h('module:getInspector',(id)          => db.getModuleInspector(id));
h('module:getAttrCounts', (pid)       => db.getChildAttrCounts(pid));

// Category "Classifier" (v3 Phase 5)
h('classifier:setCatType',        (id,ct)              => db.setCatType(id,ct));
h('classifier:getObjects',        (mref)                => db.getObjects(mref));
h('classifier:getObjectsFull',    (mref)                => db.getObjectsFull(mref));
h('classifier:getObject',         (id)                  => db.getObject(id));
h('classifier:createObject',      (mref,n,c,ic)         => db.createObject(mref,n,c,ic));
h('classifier:updateObject',      (id,n,c,ic)           => db.updateObject(id,n,c,ic));
h('classifier:updateObjectNote',  (id,note)             => db.updateObjectNote(id,note));
h('classifier:deleteObject',      (id)                  => db.deleteObject(id));
h('classifier:getTemplates',      (mref)                => db.getTemplates(mref));
h('classifier:getObjectTemplates',(mref,oref)           => db.getObjectTemplates(mref,oref));
h('classifier:createTemplate',    (mref,d,t,lv,c,oref,ls)=> db.createTemplate(mref,d,t,lv,c,oref,ls));
h('classifier:updateTemplate',    (id,d,t,lv,c,ls)      => db.updateTemplate(id,d,t,lv,c,ls));
h('classifier:deleteTemplate',    (id)                  => db.deleteTemplate(id));
h('classifier:countObjectTemplates', (oref)             => db.countObjectTemplates(oref));
h('classifier:getAttrs',          (oid)                 => db.getAttrs(oid));
h('classifier:upsertAttr',        (oid,tid,v)           => db.upsertAttr(oid,tid,v));
h('classifier:upsertAttrCondition', (oid,tid,v)         => db.upsertAttrCondition(oid,tid,v));

// TimeMap "Wanderer" (v3 Phase 9) — MapEvent Link pins
h('wanderer:list',   (mref)                     => db.getMapEvents(mref));
h('wanderer:create', (mref,ev,key,px,py,ar)     => db.createMapEvent(mref,ev,key,px,py,ar));
h('wanderer:update', (id,ev,key,px,py,ar)       => db.updateMapEvent(id,ev,key,px,py,ar));
h('wanderer:delete', (id)                       => db.deleteMapEvent(id));

// Story "Narrator" (v3 Phase 10) — Dialogue route board
h('narrator:getDialogues',   (mref)             => db.getDialogues(mref));
h('narrator:createDialogue', (mref,n,c,px,py)   => db.createDialogue(mref,n,c,px,py));
h('narrator:updateDialogue', (id,n,c)           => db.updateDialogue(id,n,c));
h('narrator:updateDialogueDescription', (id,desc) => db.updateDialogueDescription(id,desc));
h('narrator:updateDialoguePos', (id,px,py)      => db.updateDialoguePos(id,px,py));
h('narrator:deleteDialogue', (id)               => db.deleteDialogue(id));
h('narrator:getEdges',       (mref)             => db.getEdges(mref));
h('narrator:createEdge',     (mref,f,to,lb)     => db.createEdge(mref,f,to,lb));
h('narrator:updateEdgeLabel',(id,lb)            => db.updateEdgeLabel(id,lb));
h('narrator:deleteEdge',     (id)               => db.deleteEdge(id));
h('narrator:getTalks',       (did)              => db.getTalks(did));
h('narrator:createTalk',     (did,sp,tx,lk)     => db.createTalk(did,sp,tx,lk));
h('narrator:updateTalk',     (id,sp,tx,lk)      => db.updateTalk(id,sp,tx,lk));
h('narrator:deleteTalk',     (id)               => db.deleteTalk(id));

// Book "Author" (v3 Phase 11) — chapters
h('author:getChapters',    (mref)      => db.getBookChapters(mref));
h('author:createChapter',  (mref,n)    => db.createBookChapter(mref,n));
h('author:renameChapter',  (id,n)      => db.renameBookChapter(id,n));
h('author:updateContent',  (id,c)      => db.updateBookChapterContent(id,c));
h('author:deleteChapter',  (id)        => db.deleteBookChapter(id));
h('author:setChapterLabel', (id,lb)    => db.setBookChapterLabel(id,lb));
h('author:moveChapter',    (mref,ids)  => db.moveBookChapter(mref,ids));

// Chat "Scribe" (v3 Phase 12) — sessions + bubble messages
h('chatscribe:getSessions',   (mref)   => db.getChatSessions(mref));
h('chatscribe:createSession', (mref,n) => db.createChatSession(mref,n));
h('chatscribe:renameSession', (id,n)   => db.renameChatSession(id,n));
h('chatscribe:deleteSession', (id)     => db.deleteChatSession(id));
h('chatscribe:getMessages',   (sref)   => db.getChatMessages(sref));
h('chatscribe:createMessage', (sref,t) => db.createChatMessage(sref,t));
h('chatscribe:updateMessage', (id,t)   => db.updateChatMessage(id,t));
h('chatscribe:deleteMessage', (id)     => db.deleteChatMessage(id));
h('chatscribe:updateMessageStyle', (id,c,s) => db.updateMessageStyle(id,c,s));

// Analys "Viewer" / Relation "Connector" (v3 Phase 14)
h('viewer:index',          (nx)         => db.viewerIndex(nx));
h('viewer:getRelations',   (nx)         => db.getEntityRelations(nx));
h('viewer:createRelation', (nx,f,tk,l,c)  => db.createEntityRelation(nx,f,tk,l,c));
h('viewer:updateRelation', (id,l,c)       => db.updateEntityRelation(id,l,c));
h('viewer:deleteRelation', (id)         => db.deleteEntityRelation(id));

// Drawing "Sketcher" (v3 Phase 15) — pages, strokes, pins, PNG export
h('sketcher:getPages',     (mref)       => db.getSketchPages(mref));
h('sketcher:createPage',   (mref,n)     => db.createSketchPage(mref,n));
h('sketcher:renamePage',   (id,n)       => db.renameSketchPage(id,n));
h('sketcher:movePage',     (id,dir)     => db.moveSketchPage(id,dir));
h('sketcher:deletePage',   (id)         => db.deleteSketchPage(id));
h('sketcher:getStrokes',   (pref)       => db.getSketchStrokes(pref));
h('sketcher:addStroke',    (pref,c,w,pts) => db.createSketchStroke(pref,c,w,pts));
h('sketcher:deleteStroke', (id)         => db.deleteSketchStroke(id));
h('sketcher:getPins',      (pref)       => db.getSketchPins(pref));
h('sketcher:addPin',       (pref,k,px,py) => db.createSketchPin(pref,k,px,py));
h('sketcher:movePin',      (id,px,py)   => db.moveSketchPin(id,px,py));
h('sketcher:deletePin',    (id)         => db.deleteSketchPin(id));
// Import Dock (v3 Phase 18) — folder import, file<->linker, viewers
const IMPORT_EXTS = new Set(['png','jpg','jpeg','gif','webp','svg','md','txt','docx']);
const IMAGE_EXTS = new Set(['png','jpg','jpeg','gif','webp','svg']);
const imageMime = (ext) => (ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`);
h('importdock:list',          (nx)     => db.getImportFiles(nx));
h('importdock:add',           (nx,fs2) => db.addImportFiles(nx,fs2));
h('importdock:setLinker',     (id,k)   => db.setImportLinker(id,k));
h('importdock:setUseAsImage', (id,on)  => db.setImportUseAsImage(id,on));
h('importdock:delete',        (id)     => db.deleteImportFile(id));
h('importdock:displayImages', (nx)     => db.getDisplayImages(nx));
h('importdock:pickFolder', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
  if (res.canceled || !res.filePaths?.length) return { canceled: true };
  const root = res.filePaths[0];
  const files = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) { walk(p); continue; }
      const ext = path.extname(ent.name).slice(1).toLowerCase();
      if (!IMPORT_EXTS.has(ext)) continue;
      files.push({
        name: ent.name, path: p, type: ext,
        size: fs.statSync(p).size,
        folder: path.basename(root) + (path.dirname(p) === root ? '' : '/' + path.relative(root, path.dirname(p)).replace(/\\/g, '/')),
      });
    }
  };
  walk(root);
  return { folder: path.basename(root), files };
});
// Content is only served for files already registered in import_file.
h('importdock:readFile', async (id) => {
  const f = db.getImportFile(id);
  if (!f) return null;
  const ext = (f.file_type || '').toLowerCase();
  try {
    // Images carry no payload any more (Plan part2 #2.2) — the viewer points
    // <img> at ddx-file://<id> instead. Only the existence/readability check
    // still matters here, so a missing file still renders the error state.
    if (IMAGE_EXTS.has(ext)) { await fs.promises.access(f.file_path); return { kind: 'image' }; }
    if (ext === 'md' || ext === 'txt') return { kind: ext, text: await fs.promises.readFile(f.file_path, 'utf8') };
    return { kind: 'binary' };
  } catch (e) {
    return { kind: 'error', message: String(e.message || e) };
  }
});
// Batched image read (Plan part2 #2.2) — the fallback path for renderers
// where ddx-file:// isn't available (the Playwright web-driver harness loads
// index.html over plain file:// with no Electron protocol registered). One
// round-trip and one parallel read wave for the whole set instead of the
// per-image sequential await hydrateDisplayImages used to do. Returns
// {id: dataUrl}; ids that aren't registered images are simply absent.
h('importdock:readFiles', async (ids) => {
  const out = {};
  await Promise.all((ids || []).map(async (id) => {
    const f = db.getImportFile(id);
    if (!f) return;
    const ext = (f.file_type || '').toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return;
    try {
      out[id] = `data:${imageMime(ext)};base64,${(await fs.promises.readFile(f.file_path)).toString('base64')}`;
    } catch (_) { /* unreadable/moved file — leave it out, renderer shows the empty state */ }
  }));
  return out;
});

// Version control (v3 Phase 21)
h('versions:list',    (mref) => db.listVersions(mref));
h('versions:restore', (id)   => db.restoreVersion(id));
h('setting:get',      (k)    => db.getAppSetting(k));
h('setting:set',      (k,v)  => db.setAppSetting(k,v));

// Cloud sync — Token Sync (Supabase) — snapshot push/pull per vault slot
h('sync:getConfig',     ()             => db.getSyncConfig());
h('sync:setConfig',     (u,k)          => db.setSyncConfig(u,k));
h('sync:googleLogin',   (u,t)          => db.syncGoogleLogin(u,t));
h('sync:googleLogout',  ()             => db.syncGoogleLogout());
h('sync:authStatus',    ()             => db.syncAuthStatus());
h('sync:status',        (nx)           => db.syncStatus(nx));
h('sync:push',          (nx,pw)        => db.syncPushVault(nx,pw));
h('sync:pull',          (nx,vaultId)   => db.syncPullVault(nx,vaultId));
h('sync:pullByToken',   (nx,tok,pw)    => db.syncPullByToken(nx,tok,pw));
h('sync:deleteUpload',  (vaultId)      => db.syncDeleteUpload(vaultId));

// Google Drive appdata backup — independent Google login from Sync's
h('drive:getConfig',       ()      => db.getDriveConfig());
h('drive:setConfig',       (i,s)   => db.setDriveConfig(i,s));
h('drive:connect',         ()      => db.driveConnect());
h('drive:disconnect',      ()      => db.driveDisconnect());
h('drive:status',          ()      => db.driveStatus());
h('drive:setAutoBackup',   (en)    => db.driveSetAutoBackup(en));
h('drive:setBackupLayout', (en)    => db.driveSetBackupLayout(en));
h('drive:setBackupDdx',    (en)    => db.driveSetBackupDdx(en));
h('drive:backupNow',       (lyt)   => db.driveBackupNow(lyt));
h('drive:restoreLayout',   ()      => db.driveRestoreLayoutProfile());
h('drive:restoreDatabase', ()      => db.driveRestoreDatabase());
h('drive:getBackupLog',    ()      => db.driveGetBackupLog());
h('drive:listLayoutSlots',   ()          => db.driveListLayoutSlots());
h('drive:saveLayoutSlot',    (name,json) => db.driveSaveLayoutSlot(name,json));
h('drive:restoreLayoutSlot', (id)        => db.driveRestoreLayoutSlot(id));
h('drive:deleteLayoutSlot',  (id)        => db.driveDeleteLayoutSlot(id));

// Firebase — app-update notice (read-only Firestore doc check, no auto-updater)
h('update:check',        ()    => db.checkForUpdate());
h('update:dismiss',      (v)   => db.dismissUpdate(v));
h('update:openDownload', (url) => db.openUpdateDownload(url));

// Plugins — main-app-facing surface (preview/install/list/manage). The
// pluginapi:table:* bridge plugin windows actually use is a SEPARATE surface
// below, registered with raw ipcMain.handle (never through h()) since it
// must resolve the calling plugin from event.sender, not from an argument.
// `preview` and `install` each take the pasted repo URL and nothing else —
// install re-resolves it from scratch rather than trusting the preview.
h('plugin:list',      ()    => db.pluginList());
h('plugin:preview',   (url) => db.pluginPreview(url));
h('plugin:install',   (url) => db.pluginInstall(url));
h('plugin:uninstall', (id) => {
  if (findPluginWindow(id)) return { ok: false, code: 'running' };
  return db.pluginUninstall(id);
});
h('plugin:launch', (id) => {
  const plugin = db.pluginGetById(id);
  if (!plugin) return { ok: false, code: 'not_found' };
  createPluginWindow(plugin);
  return { ok: true };
});
h('plugin:stop', (id) => {
  const win = findPluginWindow(id);
  if (win && !win.isDestroyed()) win.close();
  return { ok: true };
});
h('plugin:isRunning', (id) => !!findPluginWindow(id));

// pluginApi.* bridge (preload-plugin.js) — plugin windows ONLY. Resolves the
// calling plugin from the window itself (BrowserWindow.fromWebContents),
// exactly like window:getId above, since a compromised plugin page must
// never be able to claim a different plugin's identity by argument.
function callerPluginId(event) {
  const pluginId = pluginWindows.get(BrowserWindow.fromWebContents(event.sender)?.id);
  if (!pluginId) throw new Error('not a plugin window');
  return pluginId;
}
ipcMain.handle('pluginapi:table:getSchema', (event, localName)      => db.pluginApiGetSchema(callerPluginId(event), localName));
ipcMain.handle('pluginapi:table:query',     (event, localName, f)   => db.pluginApiQuery(callerPluginId(event), localName, f));
ipcMain.handle('pluginapi:table:insert',    (event, localName, row) => db.pluginApiInsert(callerPluginId(event), localName, row));
ipcMain.handle('pluginapi:table:update',    (event, localName, id, row) => db.pluginApiUpdate(callerPluginId(event), localName, id, row));
ipcMain.handle('pluginapi:table:delete',    (event, localName, id)  => db.pluginApiDelete(callerPluginId(event), localName, id));

// Legacy -> v3 migration (v3 Phase 24)
h('migrate:list',   (target,nx)          => db.listLegacyProjects(target,nx));
h('migrate:run',    (nx,target,id,ctx)   => db.migrateLegacy(nx,target,id,ctx));

// Sage Hut (v3 Phase 17) — vault analytics
h('sagehut:stats',      (nx) => db.sageHutStats(nx));
h('sagehut:linkerList', (nx) => db.sageHutLinkerList(nx));

// Graph "Designer" (v3 Phase 16) — diagram nodes + labeled edges
h('designer:getNodes',   (mref)             => db.getDesignNodes(mref));
h('designer:createNode', (mref,s,px,py,tx,c,k) => db.createDesignNode(mref,s,px,py,tx,c,k));
h('designer:updateNode', (id,s,tx,c)        => db.updateDesignNode(id,s,tx,c));
h('designer:moveNode',   (id,px,py)         => db.moveDesignNode(id,px,py));
h('designer:deleteNode', (id)               => db.deleteDesignNode(id));
h('designer:getEdges',   (mref)             => db.getDesignEdges(mref));
h('designer:createEdge', (mref,f,tk,l)      => db.createDesignEdge(mref,f,tk,l));
h('designer:updateEdge', (id,l)             => db.updateDesignEdgeLabel(id,l));
h('designer:deleteEdge', (id)               => db.deleteDesignEdge(id));

h('sketcher:exportPng', async (name, dataUrl) => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showSaveDialog(win, {
    defaultPath: `${name || 'sketch'}.png`,
    filters: [{ name: 'PNG', extensions: ['png'] }],
  });
  if (res.canceled || !res.filePath) return { canceled: true };
  fs.writeFileSync(res.filePath, Buffer.from(String(dataUrl).split(',')[1] || '', 'base64'));
  return { saved: res.filePath };
});

// Plan part5 Author #5: ".doc" export is plain HTML wrapped in a Word
// namespace shell — Word opens this natively, no docx-generation library
// needed (package.json has none, and this app is offline-first).
h('author:exportDoc', async (name, html) => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showSaveDialog(win, {
    defaultPath: `${name || 'book'}.doc`,
    filters: [{ name: 'Word Document', extensions: ['doc'] }],
  });
  if (res.canceled || !res.filePath) return { canceled: true };
  const shell = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="utf-8"></head><body>${html}</body></html>`;
  fs.writeFileSync(res.filePath, shell, 'utf8');
  return { saved: res.filePath };
});

// Plan part5 Drafter #1: content is already raw markdown text — no HTML
// shell needed, just write the string as-is. Both extensions are offered
// as separate filter groups so the save dialog's own format dropdown lets
// the user pick .md vs .txt in one step.
h('drafter:exportFile', async (name, ext, content) => {
  const win = BrowserWindow.getFocusedWindow();
  const res = await dialog.showSaveDialog(win, {
    defaultPath: `${name || 'document'}.${ext || 'md'}`,
    filters: [{ name: 'Markdown', extensions: ['md'] }, { name: 'Text', extensions: ['txt'] }],
  });
  if (res.canceled || !res.filePath) return { canceled: true };
  fs.writeFileSync(res.filePath, content ?? '', 'utf8');
  return { saved: res.filePath };
});

// Wiki-link index
h('wiki:resolve',      (name,nx)   => db.resolveWikiName(name,nx));
h('wiki:backlinks',    (key)       => db.getBacklinks(key));
h('wiki:outgoing',     (key)       => db.getOutgoingLinks(key));
h('wiki:quickIndex',   (nx)        => db.quickIndex(nx));
h('wiki:entityPath',   (key)       => db.getEntityPath(key));
h('wiki:rebuild',      ()          => db.rebuildWikiIndex());
h('wiki:resolveKeys',  (keys)      => db.resolveEntityKeys(keys));
h('wiki:linkCounts',   (nx)        => db.getLinkCounts(nx));
h('wiki:getGraph',     (nx)        => db.getGraph(nx));
h('wiki:renameTarget', (key,o,n)   => db.renameWikiTarget(key,o,n));

// Folder
h('folder:getAll',  ()           => db.getFolders());
h('folder:create',  (n,m,c)      => db.createFolder(n,m,c));
h('folder:update',  (id,n,m,c)   => db.updateFolder(id,n,m,c));
h('folder:delete',  (id)         => db.deleteFolder(id));

// Project
h('project:getAll', (fid,nx)     => db.getProjects(fid,nx));
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
h('template:getAll', (cid)       => db.dirGetTemplates(cid));
h('template:create', (cid,d,t)   => db.dirCreateTemplate(cid,d,t));
h('template:update', (id,d,t)    => db.dirUpdateTemplate(id,d,t));
h('template:delete', (id)        => db.dirDeleteTemplate(id));

// Object
h('object:getAll',  (cid)        => db.dirGetObjects(cid));
h('object:get',     (id)         => db.dirGetObject(id));
h('object:create',  (pid,cid,n,c)=> db.dirCreateObject(pid,cid,n,c));
h('object:update',  (id,n,c)     => db.dirUpdateObject(id,n,c));
h('object:updateNote',(id,note)  => db.dirUpdateObjectNote(id,note));
h('object:delete',  (id)         => db.dirDeleteObject(id));
h('object:getAttrs',(oid)        => db.getObjectAttrs(oid));
h('object:upsertAttr',(oid,tid,v)=> db.dirUpsertAttr(oid,tid,v));
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
h('timeline:getModuleTimelines', (moduleRef) => db.getModuleTimelines(moduleRef));
h('timeline:createModuleTimeline', (moduleRef,n,c) => db.createModuleTimeline(moduleRef,n,c));
h('timeline:update',  (id,n,c) => db.updateTimeline(id,n,c));
h('timeline:delete',  (id) => db.deleteTimeline(id));
h('timeline:getOrCreateDate', (d,m,y,hh,mm) => db.getOrCreateDate(d,m,y,hh,mm));
h('timeline:getEvents',  (tlid) => db.getEvents(tlid));
h('timeline:createEvent',(tlid,n,sid,eid,c,story) => db.createEvent(tlid,n,sid,eid,c,story));
h('timeline:updateEvent',(id,n,sid,eid,c,story) => db.updateEvent(id,n,sid,eid,c,story));
h('timeline:updateEventStory',(id,story) => db.updateEventStory(id,story));
h('timeline:updateEventIcon',(id,icon,color) => db.updateEventIcon(id,icon,color));
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
h('map:getModuleMap',       (mref) => db.getModuleMap(mref));
h('map:getOrCreateModuleMap', (mref) => db.getOrCreateModuleMap(mref));

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
h('search:all', (q,nx) => db.searchAll(q,nx));

// Hashtag objects by tag
h('hashtag:getObjectsByTag', (tagId, projectId) => db.getObjectsByHashtag(tagId, projectId));
h('hashtag:getEventsByTag', (tagId, projectId) => db.getEventsByHashtag(tagId, projectId));
h('project:getAllUsedTags', (pid) => db.getAllProjectUsedTags(pid));

// Navigator (v2.5.2) — World module
h('world:getAll',           (nx)                      => db.getWorlds(nx));
h('world:get',              (id)                      => db.getWorld(id));
h('world:create',           (code,n,m,c,nx)           => db.createWorld(code,n,m,c,nx));
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

// World / world-character tags (v2.5.7) — mirror of project/object hashtags
h('world:getTags',          (wid)                     => db.getWorldTags(wid));
h('world:setTags',          (wid,tags)                => db.setWorldTags(wid,tags));
h('world:getCharTags',      (cid)                     => db.getWorldCharTags(cid));
h('world:setCharTags',      (cid,tags)                => db.setWorldCharTags(cid,tags));
h('world:getAllUsedTags',   (wid)                     => db.getAllWorldUsedTags(wid));
h('world:getCharactersByTag',(tid,wid)                => db.getWorldCharactersByTag(tid,wid));

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
h('world:updateObjectSymbol',(id,sym,custom)          => db.updateWorldObjectSymbol(id,sym,custom));
h('world:getSymbolCollection',()                      => db.getSymbolCollection());

h('world:getMaps',          (wid)                     => db.getWorldMaps(wid));
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

// Hero (v2.6) — Game module
h('game:getAll',            (nx)                      => db.getGames(nx));
h('game:get',               (id)                      => db.getGame(id));
h('game:create',            (n,cn,m,c,nx)             => db.createGame(n,cn,m,c,nx));
h('game:update',            (id,n,cn,m,c)             => db.updateGame(id,n,cn,m,c));
h('game:delete',            (id)                      => db.deleteGame(id));

h('game:getNovelLink',      (gid)                     => db.getGameNovelLink(gid));
h('game:setNovelLink',      (gid,pid)                 => db.setGameNovelLink(gid,pid));
h('game:getCategories',     (gid)                     => db.getGameCategories(gid));
h('game:addCategory',       (gid,catid)               => db.addGameCategory(gid,catid));
h('game:removeCategory',    (gid,catid)               => db.removeGameCategory(gid,catid));
h('game:addCatObject',      (gid,catid,oid)           => db.addGameCatObject(gid,catid,oid));
h('game:removeCatObject',   (gid,catid,oid)           => db.removeGameCatObject(gid,catid,oid));
h('game:getImportedObjects',(gid)                     => db.getGameImportedObjects(gid));
h('game:getCategoryObjects',(gid,catid)               => db.getGameCategoryObjects(gid,catid));

h('game:getCharacters',     (gid)                     => db.getGameCharacters(gid));
h('game:createCharacter',   (gid,n,ol,c)              => db.createGameCharacter(gid,n,ol,c));
h('game:updateCharacter',   (id,n,ol,c)               => db.updateGameCharacter(id,n,ol,c));
h('game:deleteCharacter',   (id)                      => db.deleteGameCharacter(id));
h('game:getCharTemplates',  (gid)                     => db.getGameCharTemplates(gid));
h('game:createCharTemplate',(gid,n,t,lv)              => db.createGameCharTemplate(gid,n,t,lv));
h('game:updateCharTemplate',(id,n,t,lv)               => db.updateGameCharTemplate(id,n,t,lv));
h('game:deleteCharTemplate',(id)                      => db.deleteGameCharTemplate(id));
h('game:getCharAttrs',      (cid)                     => db.getGameCharAttrs(cid));
h('game:upsertCharAttr',    (cid,tid,lv,txt)          => db.upsertGameCharAttr(cid,tid,lv,txt));
h('game:deleteCharAttr',    (cid,tid,lv)              => db.deleteGameCharAttr(cid,tid,lv));
h('game:getCharElements',   (cid)                     => db.getGameCharElements(cid));
h('game:setCharElements',   (cid,eids)                => db.setGameCharElements(cid,eids));
h('game:getCharTags',       (cid)                     => db.getGameCharTags(cid));
h('game:setCharTags',       (cid,tags)                => db.setGameCharTags(cid,tags));

h('game:getCollections',    (gid)                     => db.getGameCollections(gid));
h('game:createCollection',  (gid,n,c)                 => db.createGameCollection(gid,n,c));
h('game:updateCollection',  (id,n,c)                  => db.updateGameCollection(id,n,c));
h('game:deleteCollection',  (id)                      => db.deleteGameCollection(id));
h('game:getColTemplates',   (colid)                   => db.getGameColTemplates(colid));
h('game:createColTemplate', (colid,n,t,lv)            => db.createGameColTemplate(colid,n,t,lv));
h('game:updateColTemplate', (id,n,t,lv)               => db.updateGameColTemplate(id,n,t,lv));
h('game:deleteColTemplate', (id)                      => db.deleteGameColTemplate(id));
h('game:getColElements',    (colid)                   => db.getGameColElements(colid));
h('game:createColElement',  (colid,n,c)               => db.createGameColElement(colid,n,c));
h('game:updateColElement',  (id,n,c)                  => db.updateGameColElement(id,n,c));
h('game:deleteColElement',  (id)                      => db.deleteGameColElement(id));
h('game:getElementAttrs',   (eid)                     => db.getGameElementAttrs(eid));
h('game:upsertElementAttr', (eid,tid,lv,txt)          => db.upsertGameElementAttr(eid,tid,lv,txt));
h('game:deleteElementAttr', (eid,tid,lv)              => db.deleteGameElementAttr(eid,tid,lv));
h('game:getElementTags',    (eid)                     => db.getGameElementTags(eid));
h('game:setElementTags',    (eid,tags)                => db.setGameElementTags(eid,tags));

h('game:getStories',        (gid)                     => db.getGameStories(gid));
h('game:createStory',       (gid,n,m,c)               => db.createGameStory(gid,n,m,c));
h('game:updateStory',       (id,n,m,c)                => db.updateGameStory(id,n,m,c));
h('game:deleteStory',       (id)                      => db.deleteGameStory(id));
h('game:getDialogues',      (sid)                     => db.getGameDialogues(sid));
h('game:createDialogue',    (sid,n,m,c,x,y)           => db.createGameDialogue(sid,n,m,c,x,y));
h('game:updateDialogue',    (id,n,m,c)                => db.updateGameDialogue(id,n,m,c));
h('game:updateDialoguePos', (id,x,y)                  => db.updateGameDialoguePos(id,x,y));
h('game:deleteDialogue',    (id)                      => db.deleteGameDialogue(id));
h('game:getStorylines',     (sid)                     => db.getGameStorylines(sid));
h('game:createStoryline',   (sid,fid,tid,c)           => db.createGameStoryline(sid,fid,tid,c));
h('game:updateStorylineSymbol', (id,sym,custom)       => db.updateGameStorylineSymbol(id,sym,custom));
h('game:deleteStoryline',   (id)                      => db.deleteGameStoryline(id));
h('game:getConversations',  (did)                     => db.getGameConversations(did));
h('game:createConversation',(did,cid,txt)             => db.createGameConversation(did,cid,txt));
h('game:updateConversation',(id,cid,txt)              => db.updateGameConversation(id,cid,txt));
h('game:deleteConversation',(id)                      => db.deleteGameConversation(id));
h('game:moveConversation',  (id,dir)                  => db.moveGameConversation(id,dir));

h('game:getTags',           (gid)                     => db.getGameTags(gid));
h('game:setTags',           (gid,tags)                => db.setGameTags(gid,tags));
h('game:getUsedTags',       (gid)                     => db.getGameUsedTags(gid));
h('game:getCharsByTag',     (tid,gid)                 => db.getGameCharsByTag(tid,gid));
h('game:getElementsByTag',  (tid,gid)                 => db.getGameElementsByTag(tid,gid));

// Writer (v2.7)
h('write:getProjects',      (nx)             => db.getWriteProjects(nx));
h('write:getProject',       (id)             => db.getWriteProject(id));
h('write:createProject',    (n,cn,c,nx)      => db.createWriteProject(n,cn,c,nx));
h('write:updateProject',    (id,n,cn,c)      => db.updateWriteProject(id,n,cn,c));
h('write:deleteProject',    (id)             => db.deleteWriteProject(id));
h('write:getSeries',        (pid)            => db.getWriteSeries(pid));
h('write:createSeries',     (pid,n,c)        => db.createWriteSeries(pid,n,c));
h('write:updateSeries',     (id,n,c)         => db.updateWriteSeries(id,n,c));
h('write:deleteSeries',     (id)             => db.deleteWriteSeries(id));
h('write:getBooks',         (sid)            => db.getWriteBooks(sid));
h('write:createBook',       (sid,n,c)        => db.createWriteBook(sid,n,c));
h('write:updateBook',       (id,n,c)         => db.updateWriteBook(id,n,c));
h('write:deleteBook',       (id)             => db.deleteWriteBook(id));
h('write:getChapters',      (bid)            => db.getWriteChapters(bid));
h('write:getChapter',       (id)             => db.getWriteChapter(id));
h('write:createChapter',    (bid,n,c)        => db.createWriteChapter(bid,n,c));
h('write:updateChapter',    (id,n,c)         => db.updateWriteChapter(id,n,c));
h('write:updateChapterContent', (id,txt)     => db.updateWriteChapterContent(id,txt));
h('write:moveChapter',      (id,dir)         => db.moveWriteChapter(id,dir));
h('write:deleteChapter',    (id)             => db.deleteWriteChapter(id));
h('write:getNovelLink',     (sid)            => db.getWriteNovelLink(sid));
h('write:setNovelLink',     (sid,nid)        => db.setWriteNovelLink(sid,nid));
h('write:getWikiChapters',  (sid)            => db.getWriteWikiChapters(sid));
h('write:createWiki',       (cid)            => db.createWriteWiki(cid));
h('write:deleteWiki',       (cid)            => db.deleteWriteWiki(cid));
h('write:getWordLinks',     (cid)            => db.getWriteWordLinks(cid));
h('write:createWordLink',   (cid,oid,txt)    => db.createWriteWordLink(cid,oid,txt));
h('write:deleteWordLink',   (id)             => db.deleteWriteWordLink(id));
h('write:getNotes',         (pid)            => db.getWriteNotes(pid));
h('write:createNote',       (pid,n,c)        => db.createWriteNote(pid,n,c));
h('write:updateNote',       (id,n,c)         => db.updateWriteNote(id,n,c));
h('write:deleteNote',       (id)             => db.deleteWriteNote(id));
h('write:getChats',         (nid)            => db.getWriteChats(nid));
h('write:createChat',       (nid,txt)        => db.createWriteChat(nid,txt));
h('write:updateChat',       (id,txt)         => db.updateWriteChat(id,txt));
h('write:deleteChat',       (id)             => db.deleteWriteChat(id));

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
// Workspace switcher (Hub's nexus-vault-head dropdown) — opens a second
// window bootstrapped directly into the chosen Nexus. Same running process
// and data dir as the first window, so the single-instance lock above
// (which only guards against a second OS process) doesn't apply here.
h('window:openNexus', (nexusId) => { createWindow(nexusId); });
// Same pattern as window:openNexus, but bootstraps a specific Builder tab
// into a leaner popup window instead of the full app shell — see core.js's
// init() `popup=1` branch and style.css's `.popup-mode` rules.
h('window:openBuilderTab', (nexusId, tabKey) => { createWindow(nexusId, tabKey); });
// Plan part1 #2: a real cross-window HTML5 drag doesn't work between
// separate Electron BrowserWindows (each is an isolated renderer process —
// confirmed, not just assumed), so "drag a tab from a popup back to the
// main window" ships as a click action relayed via IPC instead. Needs the
// raw ipcMain event to identify the calling window, which the `h()` wrapper
// above discards — bypass it here with a direct ipcMain.handle.
ipcMain.handle('window:getId', (event) => BrowserWindow.fromWebContents(event.sender)?.id);
h('window:moveTabToMain', (nexusId, tabKey) => {
  const main = BrowserWindow.getAllWindows().find(w => !popupWindowIds.has(w.id));
  if (main && !main.isDestroyed()) main.webContents.send('builder:tabInbound', nexusId, tabKey);
  return !!main;
});
