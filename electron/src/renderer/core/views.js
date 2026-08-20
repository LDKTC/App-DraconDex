// View plumbing: bindNav(), database import/export, loadModule() lazy script
// loading, switchView() (routes the few remaining shared legacy-view panels
// still reachable outside the v3 module tree — Scribe's legacy note view),
// and the Nexus home page including the builder-pane page mirror it renders
// through.
// ═══ NAV & VIEW ════════════════════════════════════════
function bindNav() {
  q('#nav-logo-btn')?.addEventListener('click', () => {
    // process2 part1 #3: while the hub is collapsed, the logo slot is the
    // "expand hub" control (see nav.js's updateTopNavButton) — wins over
    // every other branch below regardless of module/project/world state.
    if(S.leftPanelCollapsed){ setLeftPanelCollapsed(false); return; }
    if(S.activeModule) returnToNexus();
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
    // Refresh the Nexus list so vaults brought in by the merge are visible.
    // The Welcome window has no sidebar and no view to switch — its whole job
    // is that vault list, so it just re-renders itself with the new entries.
    await reloadNexuses();
    S.colors = await api.color.getAll();
    S.recentColors = await api.color.getRecent();
    if(S.isWelcome) renderWelcomeWindow();
    else renderNexusHome();
    toast(t('importDbDone'),'ok');
    // Plan part2 §2: a merged file may carry un-migrated legacy-shaped data
    // (a v1/v2 file, or notes for a nexus that predates v3) — offer the
    // conversion preview instead of silently leaving it in its legacy
    // tables with no way to act on it. That preview acts on an OPEN vault,
    // which the Welcome window doesn't have; there the user opens the
    // imported vault first and gets the same prompt on the next import.
    if (S.isWelcome) return;
    const sm = res.summary || {};
    const hasLegacy = (sm.projects||0) + (sm.world_projects||0) + (sm.game_projects||0)
      + (sm.write_projects||0) + (sm.notes||0) > 0;
    if (hasLegacy && typeof openLegacyMigratePreviewModal === 'function') openLegacyMigratePreviewModal();
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

// Konva (canvas) loader. Eager and global because map.js and
// mod/{locator,wanderer}.js all need it, and it used to be copied verbatim
// into more than one caller, so whichever loaded last silently won.
// Vendored copy only — no CDN fallback: this renderer holds the whole
// window.api IPC surface, so a remote <script> (unpkg, no SRI) would hand
// that surface to a third party. vendor/ ships via package.json build.files.
function ensureKonva(){
  if(window.Konva) return Promise.resolve();
  if(window.__konvaLoading) return new Promise(resolve=>{ const iv=setInterval(()=>{ if(window.Konva){ clearInterval(iv); resolve(); } },50); });
  window.__konvaLoading = true;
  const load = (src) => new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = src;
    s.onload = ()=>resolve();
    s.onerror = ()=>{ s.remove(); reject(new Error('Failed to load '+src)); };
    document.body.appendChild(s);
  });
  return load('vendor/konva.min.js')
    .finally(()=>{ window.__konvaLoading = false; });
}

// Unsplit modules fall through to their single file — every lazy call site
// can use the same helper regardless of whether that module is one file or
// several (no module left uses more than one file now that Navigator/Hero's
// folders are gone).
function loadGroup(name) {
  return Promise.all([`src/renderer/${name}.js`].map(loadModule));
}

async function switchView(v) {
  if (konvaStage) {
    try { konvaStage.destroy(); } catch(e){}
    konvaStage = null;
  }
  if (v !== 'nexus') { leaveBuilderGrid(); const foot = q('#left-panel-foot'); if (foot) foot.innerHTML = ''; }
  updateTopNavButton();
  if      (v==='nexus')           renderNexusHome();
  else if (v==='colors')          { await loadModule('src/renderer/hashtag.js'); q('#left-panel-inner').innerHTML=`<div class="ph"><h4>${t('colorPanel')}</h4></div>`; renderColorSettings(); }
  else if (v==='scribe')          { await loadModule('src/renderer/scribe.js'); renderScribeView(); }
}

// ═══ NEXUS HUB ═════════════════════════════════════════
// Two-level home: no vault open → vault picker; vault open → module cards.
function renderNexusHome() {
  // Plan part2 #New Workspace: every caller of renderNexusHome() already
  // goes through this one chokepoint, so the workspace-style swap lives
  // here instead of at every call site. Drake (default/unset) falls
  // straight through, unchanged.
  // Same chokepoint reasoning for the Welcome window (v4.6.0): saveNexus,
  // delNexus and importDatabaseFile all end in a renderNexusHome(), and in
  // that window "home" is the Welcome screen, never the hub or the picker.
  if (S.isWelcome) return renderWelcomeWindow();
  if (S.settings.workspaceStyle === 'wyvern' && typeof renderWyvernHome === 'function') return renderWyvernHome();
  if (S.settings.workspaceStyle === 'dragon' && typeof renderDragonHome === 'function') return renderDragonHome();
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

  // Plan process1 part5 #1: buildHubHtml() rebuilds every accordion section
  // (nest/sage/dock) from scratch on each call, which would otherwise reset
  // each section's own scroll position — e.g. opening an imported file
  // re-renders the whole hub and used to snap the Import Dock list back to
  // its top. Carry each section's scrollTop across the rebuild by data-key.
  const hubScroll = {};
  q('#left-panel-inner')?.querySelectorAll('.acc-body[data-key]').forEach(el => { hubScroll[el.dataset.key] = el.scrollTop; });
  q('#left-panel-inner').innerHTML = buildHubHtml();
  q('#left-panel-inner')?.querySelectorAll('.acc-body[data-key]').forEach(el => {
    if (hubScroll[el.dataset.key] != null) el.scrollTop = hubScroll[el.dataset.key];
  });
  // Plan process1 part3 #2: the separate "switch nexus" ⇄ button was
  // removed — clicking the nexus name itself already opens the same
  // switcher (toggleNexusSwitcher, core/nexus.js), whose "more…" row
  // reaches the same openWelcomeWindow() this button used to jump to
  // directly, so the button was a pure duplicate.
  q('#left-panel-foot').innerHTML = `
    <div class="ph nexus-vault-head">
      <h4 class="nexus-vault-name" onclick="toggleNexusSwitcher(event)" title="${t('nexusSwitch')}"><span class="nexus-vault-dot" style="${S.nexus.color_code ? `background:${x(S.nexus.color_code)}` : ''}"></span>${x(S.nexus.name)}</h4>
      ${CLOUD_SYNC_ENABLED ? `<button class="btn btn-s btn-sm" onclick="openSyncModal()" title="${t('syncTitle')}">☁</button>` : ''}
    </div>`;
  // The whole main area is the builder pane grid (Phase 19) — the focused
  // pane shows the current page (built from the S.* page mirrors below),
  // unfocused panes keep their previous live DOM.
  renderBuilderPanes(buildBuilderPageHtml, runBuilderMounts);
}

// The focused pane's page, from the global page mirrors — precedence:
// item page > module > file preview > sage hut > vault welcome.
// Plan process2 part1 #2: Kind Browser no longer has a page here — it moved
// into the Hub panel as its own accordion section (hub/sections.js).
function buildBuilderPageHtml() {
  return (S.activeItemNode && typeof buildItemPageHtml === 'function') ? buildItemPageHtml(S.activeItemNode)
    : S.activeModuleNode ? buildModuleDetailHtml(S.activeModuleNode)
    : (S.filePreview && typeof buildFileViewerHtml === 'function') ? buildFileViewerHtml()
    : (S.sageHut && typeof buildSageHutHtml === 'function') ? buildSageHutHtml()
    : (S.importDockPage && typeof buildImportDockPageHtml === 'function') ? buildImportDockPageHtml()
    : `<div class="empty" style="margin-top:80px">
    <div class="ei"><img src="../src/assets/brand/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:64px;width:64px;opacity:.35"></div>
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
  if (S.pluginPanel && typeof mountPluginPanel === 'function') mountPluginPanel();
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
  // Dragon (Plan part2 #New Workspace) — self-guards on workspaceStyle/
  // dragonSomethingOpen internally, same as the sagehut check above.
  if (typeof mountDragonBoard === 'function') mountDragonBoard();
}

