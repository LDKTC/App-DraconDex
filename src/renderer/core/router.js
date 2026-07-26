// Module routing: selectModule() for the 7 legacy modules, the read-only
// Import-DB entry point, openEntityByKey() (wikilink + quick-switch target
// resolution), recent-entity tracking and the IDE status bar.
function selectModule(name) {
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); renderNexusHome(); return; }
  leaveBuilderGrid();
  S.activeModule = name;
  if (name === 'director') {
    S.view = 'projects';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="projects"]')?.classList.add('active');
    updateTopNavButton();
    renderSidebar();
    renderWelcome();
  } else if (name === 'navigator') {
    S.view = 'navigator';
    S.world = null; S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="navigator"]')?.classList.add('active');
    updateTopNavButton();
    loadGroup('navigator').then(() => renderNavigatorView());
  } else if (name === 'hero') {
    S.view = 'hero';
    S.game = null; S.gameTab = 'project';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="hero"]')?.classList.add('active');
    updateTopNavButton();
    loadGroup('hero').then(() => renderHeroView());
  } else if (name === 'writer') {
    S.view = 'writer';
    S.write = null; S.writeTab = 'project'; S.writeSeries = null; S.writeBook = null;
    S.writeChapter = null; S.writeWikiChapter = null; S.writeNote = null;
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="writer"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/writer.js').then(() => renderWriterView());
  } else if (name === 'scribe') {
    S.view = 'scribe';
    S.scribeNote = null; S.scribeTab = 'notes';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="scribe"]')?.classList.add('active');
    updateTopNavButton();
    loadModule('src/renderer/scribe.js').then(() => renderScribeView());
  }
}

// Plan part2 §2: entry point for the read-only "Import DB" legacy view —
// reuses selectModule('director') unchanged, just with S.importDbMode
// already set so updateTopNavButton() un-hides the 4 legacy nav buttons and
// preload.js's inv() wrapper blocks any mutation IPC call while it's active.
function openImportDbHub() {
  S.importDbMode = true;
  api.setImportDbMode(true);
  // Whatever v3 module was open before switching into this legacy view stays
  // pinned "active" (with its own icon) in the nav rail otherwise — nothing
  // else clears S.activeModuleNode or repaints the rail on this path.
  S.activeModuleNode = null;
  selectModule('director');
  renderModuleRail();
}

// ═══ ENTITY NAVIGATION ════════════════════════════════════
// Central dispatcher: open any entity from its wiki key ('note_3', 'obj_12',
// 'wchp_9', …). Used by wikilink clicks, backlinks, quick switcher and graph.
async function openEntityByKey(key) {
  if (!key) return;
  const p = await api.wiki.entityPath(key);
  if (!p) { toast(t('unresolvedLink'), 'error'); return; }
  if (p.kind === 'note') {
    S.activeModule = 'scribe'; S.view = 'scribe';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="scribe"]')?.classList.add('active');
    updateTopNavButton();
    await loadModule('src/renderer/scribe.js');
    await selectNote(p.noteId);
  } else if (p.kind === 'obj' || p.kind === 'proj') {
    S.activeModule = 'director'; S.view = 'projects';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="projects"]')?.classList.add('active');
    updateTopNavButton();
    await selectProject(p.projectId);
    if (p.kind === 'obj') { await selectCategory(p.categoryId); await selectObject(p.objectId); }
  } else if (p.kind === 'world') {
    const tabEntity = await api.world.get(p.worldId);
    if (!tabEntity) return;
    upsertEntityTab(tabEntity, 'world', 'navigator');
    S.activeModule = 'navigator';
    await switchEntityTab(`world-${p.worldId}`);
  } else if (p.kind === 'game') {
    const tabEntity = await api.game.get(p.gameId);
    if (!tabEntity) return;
    upsertEntityTab(tabEntity, 'game', 'hero');
    S.activeModule = 'hero';
    await switchEntityTab(`game-${p.gameId}`);
  } else if (p.kind === 'write' || p.kind === 'wchp') {
    const w = await api.write.getProject(p.writeId);
    if (!w) return;
    upsertEntityTab({ id: w.id, name: w.project_name, color_code: w.color_code }, 'write', 'writer');
    S.activeModule = 'writer';
    await switchEntityTab(`write-${p.writeId}`);
    if (p.kind === 'wchp') {
      S.writeSeries = p.seriesId; S.writeBook = p.bookId; S.writeChapter = p.chapterId;
      await renderWriterView();
    }
  } else if (p.kind === 'module' || p.kind === 'bchp' || p.kind === 'chss' || p.kind === 'cobj') {
    S.activeModule = null; S.view = 'nexus';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    updateTopNavButton();
    // Author chapter / Scribe session / Classifier object links land on the
    // module with that item selected (the kind's load fn consumes it).
    if (p.kind === 'bchp') S.pendingAuthorChapter = p.chapterId;
    if (p.kind === 'chss') S.pendingChatSession = p.sessionId;
    if (p.kind === 'cobj') S.classifierSelectedObject = p.objectId;
    await openModuleNode(p.moduleId);
  }
  trackRecentEntity(key);
}

// Recently opened entities feed the quick switcher's empty-query list.
function trackRecentEntity(key) {
  S.recentEntities = (S.recentEntities || []).filter(k => k !== key);
  S.recentEntities.unshift(key);
  if (S.recentEntities.length > 20) S.recentEntities.length = 20;
}

// Clicking a rendered [[wikilink]] anywhere in the main area navigates to the
// target; an unresolved one offers to create a note with that name.
function bindWikilinkClicks() {
  q('#main-inner')?.addEventListener('click', async (e) => {
    const a = e.target.closest('.wikilink');
    if (!a) return;
    e.preventDefault();
    const key = a.dataset.key;
    if (key) { await openEntityByKey(key); return; }
    const name = a.dataset.name;
    if (!name || !S.nexus) return;
    if (!await uiConfirm(t('createNoteFromLink') + ` "${name}"?`, { danger: false })) return;
    const newId = await api.note.create(S.nexus.id, name, null, null);
    await openEntityByKey(`note_${newId}`);
  });
}

// ═══ STATUS BAR ═══════════════════════════════════════════
// IDE-style footer: active vault · open item · word count · save state.
const _statusState = {};
function updateStatusBar(patch = {}) {
  Object.assign(_statusState, patch);
  const el = q('#status-bar');
  if (!el) return;
  const parts = [];
  if (S.nexus) parts.push(`<span class="sb-item sb-nexus" onclick="renderNexusHome()"><span class="nexus-vault-dot" style="${S.nexus.color_code ? `background:${x(S.nexus.color_code)}` : ''}"></span>${x(S.nexus.name)}</span>`);
  // Breadcrumb + module-type badge for the focused v3 module (mockups /
  // Section A status-bar spec): `Major › Minor` + `Major|Minor · Kind`.
  const mNode = (!S.activeModule && S.activeModuleNode) ? S.activeModuleNode : null;
  if (mNode) {
    const major = mNode.parent_id != null && typeof moduleRootAncestor === 'function' ? moduleRootAncestor(mNode) : null;
    const crumb = major ? `${x(major.name)} › <b>${x(mNode.name)}</b>` : `<b>${x(mNode.name)}</b>`;
    parts.push(`<span class="sb-item sb-crumb">${crumb}</span>`);
    parts.push(`<span class="sb-badge" data-no-i18n>${mNode.parent_id != null ? 'Minor' : 'Major'} · ${x(kindLabel(mNode.kind))}</span>`);
  }
  if (S.builder && S.builder.layoutTree.type === 'split' && S.view === 'nexus' && !S.activeModule) {
    parts.push(`<span class="sb-badge" data-no-i18n>Split ${collectPaneIndices(S.builder.layoutTree).length}</span>`);
  }
  if (_statusState.item) parts.push(`<span class="sb-item">${x(_statusState.item)}</span>`);
  const right = [];
  if (_statusState.words != null) right.push(`<span class="sb-item">${_statusState.words} ${t('words')}</span>`);
  if (_statusState.saveState) right.push(`<span class="sb-item sb-save">${x(_statusState.saveState)}</span>`);
  el.innerHTML = `<div class="sb-left">${parts.join('')}</div><div class="sb-right">${right.join('')}</div>`;
}

