// View plumbing: bindNav(), database import/export, loadModule() lazy script
// loading, switchView() (the legacy panel router), and the Nexus home page
// including the builder-pane page mirror it renders through.
// ═══ NAV & VIEW ════════════════════════════════════════
function bindNav() {
  q('#nav-logo-btn')?.addEventListener('click', () => {
    if(S.project) returnToProjectList();
    else if(S.world) goToNavigatorList();
    else if(S.game && S.activeModule === 'hero' && typeof goToGameList === 'function') goToGameList();
    else if(S.write && S.activeModule === 'writer' && typeof goToWriteList === 'function') goToWriteList();
    else if(S.activeModule) returnToNexus();
  });
  document.querySelectorAll('.nav-btn[data-panel]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      S.view = btn.dataset.panel;
      updateTopNavButton();
      switchView(S.view);
    });
  });
  q('#btn-import-db')?.addEventListener('click', importDatabaseFile);
  q('#btn-export-db')?.addEventListener('click', exportDatabaseFile);
  q('#modal-close').addEventListener('click', closeModal);
  q('#modal-overlay').addEventListener('click', e=>{ if(e.target===q('#modal-overlay')) closeModal(); });
  bindModalEscape();
  q('#left-panel-inner')?.addEventListener('contextmenu', onHubBackgroundContextMenu);
  q('#nav-sidebar')?.addEventListener('contextmenu', openNavSidebarContextMenu);
}

async function exportDatabaseFile(){
  try{
    const res = await api.db.exportFile();
    if(res?.canceled) return;
    toast('Export DB สำเร็จ','ok');
  }catch(e){
    toast(`${tr('Export ไม่สำเร็จ')}: ${e.message}`,'err');
  }
}

async function importDatabaseFile(){
  try{
    // Pick first, then confirm, then merge. These used to be one IPC call, so
    // the confirm had to run before the file dialog — the user was approving a
    // merge before choosing what to merge. db:pickImportFile only opens the
    // dialog; nothing is written until db:importMergeFile.
    const picked = await api.db.pickImportFile();
    if(picked?.canceled) return;
    if(!await uiConfirm(t('importDbConfirm'), { okText: t('apply'), cancelText: t('cancel'), danger:false })) return;
    const res = await api.db.importMergeFile(picked.filePath);
    if(res?.canceled) return;
    await reloadSidebar();
    // Refresh the Nexus list so vaults brought in by the merge are visible. In the
    // no-Nexus onboarding case S.view is 'nexus', so the switchView below routes to
    // the Nexus picker (now non-empty) for the user to pick which vault to open.
    await reloadNexuses();
    S.colors = await api.color.getAll();
    S.recentColors = await api.color.getRecent();
    if(S.project?.id) S.project = await api.project.get(S.project.id) || null;
    switchView(S.view || 'projects');
    toast(t('importDbDone'),'ok');
    // Plan part2 §2: a merged file may carry un-migrated legacy-shaped data
    // (a v1/v2 file, or notes for a nexus that predates v3) — offer the
    // Nexus Nest / Import DB choice instead of silently leaving it in its
    // legacy tables with no way to act on it.
    const sm = res.summary || {};
    const hasLegacy = (sm.projects||0) + (sm.world_projects||0) + (sm.game_projects||0)
      + (sm.write_projects||0) + (sm.notes||0) > 0;
    if (hasLegacy && typeof openImportChoiceModal === 'function') openImportChoiceModal();
  }catch(e){
    toast(`${tr('Import ไม่สำเร็จ')}: ${e.message}`,'err');
  }
}

const _loadedModules = new Set();
function loadModule(src) {
  if (_loadedModules.has(src)) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { _loadedModules.add(src); res(); };
    s.onerror = () => rej(new Error(`Failed to load module: ${src}`));
    document.head.appendChild(s);
  });
}

async function switchView(v) {
  if (typeof closeRelNodeNote === 'function') closeRelNodeNote();
  if (konvaStage) {
    try { konvaStage.destroy(); } catch(e){}
    konvaStage = null;
  }
  q('#main-inner')?.classList.toggle('relation-main', v === 'relation');
  if (v !== 'nexus') { leaveBuilderGrid(); const foot = q('#left-panel-foot'); if (foot) foot.innerHTML = ''; }
  updateTopNavButton();
  if      (v==='nexus')           renderNexusHome();
  else if (v==='projects')        { if(S.project) renderProject(); else { renderSidebar(); renderWelcome(); } }
  else if (v==='timeline')        { await loadModule('src/renderer/timeline.js'); renderTimelineView(); }
  else if (v==='relation')        { await loadModule('src/renderer/relation.js'); renderRelationView(); }
  else if (v==='map')             { await loadModule('src/renderer/map.js'); renderMapView(); }
  else if (v==='hashtag')         { await loadModule('src/renderer/hashtag.js'); renderHashtagView(); }
  else if (v==='project-hashtag') { await loadModule('src/renderer/hashtag.js'); renderProjectHashtagView(); }
  else if (v==='colors')          { await loadModule('src/renderer/hashtag.js'); q('#left-panel-inner').innerHTML=`<div class="ph"><h4>${t('colorPanel')}</h4></div>`; renderColorSettings(); }
  else if (v==='navigator')       { await loadModule('src/renderer/navigator.js'); renderNavigatorView(); }
  else if (v==='hero')            { await loadModule('src/renderer/hero.js'); renderHeroView(); }
  else if (v==='writer')          { await loadModule('src/renderer/writer.js'); renderWriterView(); }
  else if (v==='scribe')          { await loadModule('src/renderer/scribe.js'); renderScribeView(); }
}

// ═══ NEXUS HUB ═════════════════════════════════════════
// Two-level home: no vault open → vault picker; vault open → module cards.
function renderNexusHome() {
  S.view = 'nexus';
  S.activeModule = null;
  // Rename-mode focus lock (Plan part1 #5) — while a module name is being
  // edited, suppress hover highlighting across the whole app so nothing
  // else visually competes with the active rename box.
  document.body.classList.toggle('renaming-lock', S.renamingModuleId != null);
  if (konvaStage) { try { konvaStage.destroy(); } catch(e){} konvaStage = null; }
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  updateTopNavButton();
  q('#main-inner')?.classList.remove('relation-main');
  if (!S.nexus) { const foot = q('#left-panel-foot'); if (foot) foot.innerHTML = ''; renderNexusPicker(); return; }

  q('#left-panel-inner').innerHTML = buildHubHtml();
  q('#left-panel-foot').innerHTML = `
    <div class="ph nexus-vault-head">
      <h4 class="nexus-vault-name" onclick="toggleNexusSwitcher(event)" title="${t('nexusSwitch')}"><span class="nexus-vault-dot" style="${S.nexus.color_code ? `background:${x(S.nexus.color_code)}` : ''}"></span>${x(S.nexus.name)}</h4>
      <button class="btn btn-s btn-sm" onclick="openSyncModal()" title="${t('syncTitle')}">☁</button>
      <button class="btn btn-s btn-sm" onclick="closeNexus()" title="${t('nexusSwitch')}">⇄</button>
    </div>`;
  // The whole main area is the builder pane grid (Phase 19) — the focused
  // pane shows the current page (built from the S.* page mirrors below),
  // unfocused panes keep their previous live DOM.
  renderBuilderPanes(buildBuilderPageHtml, runBuilderMounts);
}

// The focused pane's page, from the global page mirrors — precedence:
// item page > module > file preview > sage hut > vault welcome.
function buildBuilderPageHtml() {
  return (S.activeItemNode && typeof buildItemPageHtml === 'function') ? buildItemPageHtml(S.activeItemNode)
    : S.activeModuleNode ? buildModuleDetailHtml(S.activeModuleNode)
    : (S.filePreview && typeof buildFileViewerHtml === 'function') ? buildFileViewerHtml()
    : (S.sageHut && typeof buildSageHutHtml === 'function') ? buildSageHutHtml()
    : (S.kindBrowserPage && typeof buildKindBrowserPageHtml === 'function') ? buildKindBrowserPageHtml()
    : `<div class="empty" style="margin-top:80px">
    <div class="ei"><img src="Image/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:64px;width:64px;opacity:.35"></div>
    <h3>${x(S.nexus.name)}</h3>
    <p>${S.nexus.memo ? x(S.nexus.memo) : t('nexusWelcomeText')}</p>
  </div>`;
}

// Post-DOM hooks for the focused pane's page.
function runBuilderMounts() {
  if (S.activeItemNode && typeof ITEM_KIND !== 'undefined') ITEM_KIND[S.activeItemNode.itemKind]?.mount?.(S.activeItemNode);
  if (!S.activeModuleNode && !S.filePreview && S.sageHut && typeof mountSageHutGraph === 'function') mountSageHutGraph();
  if (typeof hydrateDisplayImages === 'function') hydrateDisplayImages();
  if (S.activeModuleNode?.kind === 'inspector' && typeof mountDetailEditor === 'function') mountDetailEditor(S.activeModuleNode);
  if (S.activeModuleNode && typeof mountInspectorDescEditor === 'function') mountInspectorDescEditor(S.activeModuleNode);
  if (S.activeModuleNode?.kind === 'locator' && typeof mountLocatorBoard === 'function') mountLocatorBoard();
  if (S.activeModuleNode?.kind === 'chronicler' && typeof mountChroniclerGraph === 'function') mountChroniclerGraph();
  if (S.activeModuleNode?.kind === 'wanderer' && typeof mountWandererBoard === 'function') mountWandererBoard();
  if (S.activeModuleNode?.kind === 'narrator' && typeof mountNarratorBoard === 'function') {
    mountNarratorBoard();
    if (S.narratorData?.view === 'reader') mountNarratorReader();
  }
  if (S.activeModuleNode?.kind === 'author' && typeof mountAuthorEditor === 'function') {
    mountAuthorEditor();
    if (S.authorData?.view === 'book' && typeof mountAuthorBook === 'function') mountAuthorBook();
  }
  if (S.activeModuleNode?.kind === 'scribe' && typeof mountChatScribe === 'function') mountChatScribe();
  if (S.activeModuleNode?.kind === 'drafter' && typeof mountDrafterEditor === 'function') mountDrafterEditor(S.activeModuleNode);
  if (S.activeModuleNode?.kind === 'connector' && typeof mountConnectorBoard === 'function') mountConnectorBoard();
  if (S.activeModuleNode?.kind === 'classifier' && S.classifierView === 'relationCat' && typeof mountClassifierRelationGraph === 'function') mountClassifierRelationGraph();
  if (S.activeModuleNode?.kind === 'sketcher' && typeof mountSketcherBoard === 'function') {
    mountSketcherBoard();
    mountSketcherExtras();
  }
  if (S.activeModuleNode?.kind === 'designer' && typeof mountDesignerBoard === 'function') mountDesignerBoard();
}

