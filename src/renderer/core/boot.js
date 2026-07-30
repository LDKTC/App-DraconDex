// App boot — init() is called once from src/renderer/search.js, the last eager
// script in index.html, and is the only place that decides what the first frame
// shows: settings, then nexus/tab restore, then the splash handoff
// (window.__splash, index.html).
async function init() {
  applyUiSettings();
  applyWorkspaceStyle();
  // Boot-splash checkpoints (window.__splash, defined inline in index.html).
  // 0–55% is script parsing; from here on the ticks track the real boot chain,
  // so the bar never advances on a timer. finish() is at the very bottom.
  window.__splash?.set(60);
  // Boot IPC in two waves instead of seven serial round-trips. Wave 1 is every
  // call with no data dependency; only project.getAll/module.getTree need
  // S.nexus, which is resolved in between. Each await here is a full IPC
  // round-trip plus a structured clone, and this is the critical path to first
  // paint — nothing between the original awaits read any of the S.* they set.
  const [colors, recentColors, nexuses, folders, windowId] = await Promise.all([
    api.color.getAll(),
    api.color.getRecent(),
    api.nexus.getAll(),
    api.folder.getAll(),
    api.window.getId(),
  ]);
  S.colors = colors; S.recentColors = recentColors; S.nexuses = nexuses;
  S.folders = folders; S._windowId = windowId;
  // Longest single stall of the boot: that first await is what triggers
  // getDB() → open the SQLite file + run initDB() migrations in main.
  window.__splash?.set(80);
  // A window opened via the workspace switcher (toggleNexusSwitcher →
  // openNexusWindow) boots straight into a specific Nexus via ?nexus=<id> —
  // takes priority over the saved active Nexus, and deliberately isn't
  // written back to localStorage since that key is shared across windows
  // (same-origin) and writing it here would silently change what the
  // *other* window restores to on its next reload.
  const bootstrapNexusId = Number(new URLSearchParams(location.search).get('nexus')) || null;
  const savedNexusId = bootstrapNexusId || Number(localStorage.getItem(NEXUS_ACTIVE_KEY));
  S.nexus        = S.nexuses.find(n => n.id === savedNexusId) || null;
  // getNestItems rides along in the same wave (Plan part2 #2.5) — without it
  // the first Nest render would fall back to one lazy list fetch (and one
  // full re-render) per content module, which is the boot path that storm
  // hurt most.
  const [projects, moduleTree, nestItems] = await Promise.all([
    api.project.getAll(null, S.nexus?.id ?? null),
    S.nexus ? api.module.getTree(S.nexus.id) : Promise.resolve([]),
    S.nexus ? api.module.getNestItems(S.nexus.id) : Promise.resolve({}),
  ]);
  S.projects = projects; S.moduleTree = moduleTree;
  seedNestItems(nestItems);
  window.__splash?.set(88);
  // Set before the first render below — builderPaneHeadHtml (builder.js)
  // reads S.isPopup to decide whether to show the "move to main window" tab
  // button (Plan part1 #2). S._windowId is this window's own id (fetched in
  // wave 1 above), needed to let the main process pick a DIFFERENT window
  // when relaying that move.
  S.isPopup  = new URLSearchParams(location.search).get('popup') === '1';
  bindWindowChrome();
  bindHubToggle();
  bindBuilderGridDrop();
  applyLeftPanelState();
  applyLeftPanelWidth();
  q('#left-panel-resize')?.setAttribute('title', t('resizePanel'));
  observeUiLanguage();
  removeLegacyDirectorProjectButton();
  buildModuleSubNav();
  renderModuleRail();
  applyNavToggles();
  applyAreaScales();
  renderSettingsMenu();
  translateStaticChrome();
  renderProjectTabs();
  renderNexusHome();
  window.__splash?.set(95);
  // Receives a tab moved from a popup window via the "move to main window"
  // button (Plan part1 #2) — opens it in the currently focused pane. Main
  // process only ever relays this to a non-popup window, but guard against
  // a vault switch since the two windows' S.nexus are independently mutable.
  api.window.onTabInbound(async (nexusId, tabKey) => {
    if (S.nexus?.id !== nexusId) { toast(t('tabMoveWrongVault'), 'error'); return; }
    await builderFocusPane(builderState().focused, builderParseKey(tabKey));
  });
  // A window opened via a dragged-out Builder tab (builderPopOutTab) boots
  // straight into that one tab, with the nav-sidebar/left-panel/hub chrome
  // hidden (.popup-mode, style.css) — see procress.md Part 3 #2.
  const popupTabKey = new URLSearchParams(location.search).get('tab');
  const isPopup = S.isPopup;
  if (isPopup && popupTabKey) {
    q('#window-frame')?.classList.add('popup-mode');
    await builderOpenPage(builderParseKey(popupTabKey));
    const meta = builderTabMeta(popupTabKey);
    if (meta) document.title = meta.name;
  }
  // First-run gate: with zero Nexus, open the Welcome modal on startup (over the
  // picker hero). "Create later" only closes it, so — since init() runs every launch
  // and no flag is persisted — it naturally reshows until a Nexus exists.
  if (!isPopup && !S.nexuses.length) openWelcomeModal();
  bindNav();
  bindWikilinkClicks();
  bindGlobalShortcuts();
  updateStatusBar();
  document.addEventListener('click', () => {
    document.querySelectorAll('.np-dropdown').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.kind-popup').forEach(d => d.remove());
  });
  bindSearch();
  initDriveAutoBackup(); // fire-and-forget — must not block first paint
  initVersionCheck();    // fire-and-forget — must not block first paint
  window.__splash?.finish();
}

// ═══ HELPERS ═══════════════════════════════════════════
function removeLegacyDirectorProjectButton(){
  q('#nav-sidebar > .nav-btn.director-only[data-panel="projects"]')?.remove();
}

// Plan part2 #New Workspace — authoritative apply, re-confirming the early
// splash-script guess (index.html) now that S.settings is real. body's own
// data-workspace is the single hook every workspace-specific CSS rule and
// renderNexusHome()'s style branch key off — see wyvern.js/dragon.js for
// the chrome each style builds on top of this attribute.
// A real ?workspace= always wins, for manual QA, same idiom as ?nexus=/
// ?popup= elsewhere in this file — and like ?nexus=, it's applied to
// S.settings.workspaceStyle IN MEMORY ONLY (never saveUiSettings()'d), so
// every later check against S.settings.workspaceStyle (renderNexusHome's
// branch, builder.js's guards, etc.) sees the override consistently for
// this session without it leaking into the persisted setting.
function applyWorkspaceStyle(){
  const qsWorkspace = new URLSearchParams(location.search).get('workspace');
  if (WORKSPACE_STYLE_OPTIONS.includes(qsWorkspace)) S.settings.workspaceStyle = qsWorkspace;
  document.body.dataset.workspace = S.settings.workspaceStyle;
}

