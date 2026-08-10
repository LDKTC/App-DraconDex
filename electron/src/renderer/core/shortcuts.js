// Global keyboard shortcuts (Ctrl+P quick switch, tab cycling, …),
// returnToNexus(), and the Director left-panel sidebar render.
// ═══ GLOBAL SHORTCUTS ═════════════════════════════════════
function bindGlobalShortcuts() {
  // Plan part2 §2: the Import DB read-only guard (preload.js) rejects
  // blocked mutation calls rather than silently no-oping — the legacy
  // Director/Navigator/Hero/Writer save/create/delete handlers this view
  // reuses unchanged don't all wrap their api.* calls in try/catch, so this
  // is the one place that turns the rejection into a visible toast instead
  // of a silent unhandled-rejection console warning.
  window.addEventListener('unhandledrejection', (e) => {
    if (String(e?.reason?.message || '').includes('Import DB is read-only')) {
      e.preventDefault();
      toast(t('importDbReadOnly'), 'error');
    }
  });
  document.addEventListener('keydown', async (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    const modalOpen = !q('#modal-overlay')?.classList.contains('hidden') || q('#confirm-overlay');
    const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (key === 'p') { // quick switcher — always available
      e.preventDefault();
      try {
        if (typeof openQuickSwitcher !== 'function') await loadModule('src/renderer/quickswitch.js');
        openQuickSwitcher();
      } catch (_) {}
      return;
    }
    if (modalOpen) return;
    if (key === 'w') { // close active tab (builder pane tab in nexus view)
      e.preventDefault();
      if (!S.activeModule && S.view === 'nexus' && typeof builderCloseActiveTab === 'function') await builderCloseActiveTab();
      else if (S.activeEntityTabKey) await closeEntityTab(S.activeEntityTabKey);
      else if (S.activeProjectTabId != null && S.activeModule === 'director') await closeProjectTab(S.activeProjectTabId);
      return;
    }
    if (key === 'tab') { // cycle tabs (focused pane in nexus view, else legacy)
      e.preventDefault();
      if (!S.activeModule && S.view === 'nexus' && typeof builderCycleTab === 'function') {
        await builderCycleTab(e.shiftKey ? -1 : 1);
        return;
      }
      const ring = [
        ...S.projectTabs.map(tb => ({ kind: 'proj', id: tb.id })),
        ...S.entityTabs.map(tb => ({ kind: 'ent', key: tb.key })),
      ];
      if (!ring.length) return;
      const cur = ring.findIndex(r => (r.kind === 'proj' && S.activeModule === 'director' && r.id === S.activeProjectTabId) ||
                                      (r.kind === 'ent' && r.key === S.activeEntityTabKey));
      const next = ring[(cur + (e.shiftKey ? -1 : 1) + ring.length) % ring.length];
      if (next.kind === 'proj') await switchProjectTab(next.id);
      else await switchEntityTab(next.key);
      return;
    }
    if (inInput && !['e', 'n'].includes(key)) return;
    if (key === 'n' && S.activeModule === 'scribe' && S.nexus) { // new note
      e.preventDefault();
      openNoteModal();
      return;
    }
    // Ctrl+E is handled by the focused editor itself (mdeditor.js); this is
    // the fallback when focus is outside it.
    if (key === 'e' && typeof _mdActive?.toggleMode === 'function' && !inInput) {
      e.preventDefault();
      _mdActive.toggleMode();
    }
  });
}

function returnToNexus() {
  if (typeof closeRelNodeNote === 'function') closeRelNodeNote();
  S.activeModule = null;
  if (S.importDbMode) api.setImportDbMode(false);
  S.importDbMode = false;
  S.project = null; S.category = null; S.object = null;
  S.timeline = null; S.map = null; S.mapAreaId = null;
  S.activeProjectTabId = null; S.projectHashtagId = null;
  S.world = null; S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
  S.game = null; S.gameTab = 'project';
  S.write = null; S.writeTab = 'project'; S.writeSeries = null; S.writeBook = null;
  S.writeChapter = null; S.writeWikiChapter = null; S.writeNote = null;
  S.view = 'nexus';
  renderProjectTabs();
  renderNexusHome();
}

// ═══ SIDEBAR ═══════════════════════════════════════════
async function reloadSidebar() {
  S.folders  = await api.folder.getAll();
  S.projects = await api.project.getAll(null, S.nexus?.id ?? null);
  const byId = new Map(S.projects.map(p => [p.id, p]));
  S.projectTabs = S.projectTabs
    .filter(t => byId.has(t.id))
    .map(t => tabFromProject(byId.get(t.id)));
  if(S.activeProjectTabId && !byId.has(S.activeProjectTabId)) S.activeProjectTabId = null;
  renderProjectTabs();
  updateTopNavButton();
  if(!S.activeModule) renderNexusHome();
  else if(S.project && S.view === 'projects') await renderProjectSidebar();
  else renderSidebar();
}

function renderSidebar() {
  let h = `<div class="ph"><h4>${t('projects')}</h4>
    <button class="btn btn-g btn-i" onclick="openFolderModal()" title="${t('newFolder')}">${I.folder}</button>
    <button class="btn btn-g btn-i" onclick="openProjectModal()" title="${t('newProject')}">${I.plus}</button>
  </div>`;
  for(const f of S.folders){
    const open=S.openFolders.has(f.id), fps=S.projects.filter(p=>p.folder_id===f.id), col=f.color_code||'#6366f1';
    h += `<div class="folder-sec">
      <div class="fhead" onclick="tglFolder(${f.id})">
        <svg class="ftgl ${open?'open':''}" style="width:8px;height:8px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg><span style="color:${col};margin-right:6px;display:flex;align-items:center;">${I.folder}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(f.name)}</span>
        <span class="cs-count" style="margin-left:8px">${fps.length}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openFolderModal(${f.id})">${I.edit}</button>
      </div>
      ${open?`<div class="fchildren">${fps.map(projItem).join('')}</div>`:''}
    </div>`;
  }
  const unfiled = S.projects.filter(p=>!p.folder_id);
  if(unfiled.length) h += `<div class="div"></div>${unfiled.map(projItem).join('')}`;
  q('#left-panel-inner').innerHTML = h;
}

