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
  // Which window this is has to be settled BEFORE wave 1, not after: the
  // Welcome window has no vault, and folder.getAll() is vault-scoped (v4.9.0 —
  // each Nexus is its own .ddx file, so a vault-scoped call with no vault
  // fails rather than quietly picking one). color.* stays in both waves: it
  // reads use_color, which app.ddx carries its own copy of precisely so the
  // Welcome window can draw vault colours and run colorPicker() when creating
  // a vault.
  S.isWelcome = new URLSearchParams(location.search).get('welcome') === '1';
  const [colors, recentColors, nexuses, folders, windowId] = await Promise.all([
    api.color.getAll(),
    api.color.getRecent(),
    api.nexus.getAll(),
    S.isWelcome ? Promise.resolve([]) : api.folder.getAll(),
    api.window.getId(),
  ]);
  S.colors = colors; S.recentColors = recentColors; S.nexuses = nexuses;
  S.folders = folders; S._windowId = windowId;
  // Longest single stall of the boot: that first await is what triggers
  // getDB() → open the SQLite file + run initDB() migrations in main.
  window.__splash?.set(80);
  // The Welcome window (main.js createWelcomeWindow, ?welcome=1) shares this
  // page but not this boot: it has no vault, so everything below — wave 2,
  // the module rail, the builder grid, nav/search/backup wiring — has nothing
  // to act on. Bail out here with just the chrome it does use (window buttons
  // + static labels), which is also what keeps it opening in ~one IPC wave.
  // Registered BEFORE the welcome early-return, not after it. It used to sit at
  // the bottom of init(), which the Welcome window never reaches — so a popup
  // opened there (the Nexus ... menu, v4.9.0) was never dismissed by clicking
  // away from it.
  bindPopupDismiss();

  if (S.isWelcome) {
    document.body.classList.add('welcome-mode');
    // This window has one layout of its own and never renders a workspace
    // style, but applyWorkspaceStyle() above already stamped the saved one —
    // and css/workspace.css's wyvern/dragon rules hide #left-panel, which here
    // is the vault list / wizard steps. Pin the neutral style for this window
    // only; S.settings.workspaceStyle is untouched, so the app window still
    // opens in whatever the user picked.
    document.body.dataset.workspace = 'drake';
    bindWindowChrome();
    translateStaticChrome();
    // A database with zero vaults means nobody has ever set this install up,
    // so the Welcome window opens on the setup wizard (language/theme/layout/
    // module names/sign-in) instead of an empty vault list. Same condition the
    // old welcome modal used — there is still no persisted first-run flag.
    S.welcomeStep = S.nexuses.length ? null : 0;
    renderWelcomeWindow();
    window.__splash?.finish();
    return;
  }
  // ?nexus=<id> is the ONLY way a window gets a vault (v4.6.0): the Welcome
  // window opens every app window and always passes one, whether it came from
  // its own list, the vault-head switcher (openNexusWindow) or a fresh
  // create. The old fallback to NEXUS_ACTIVE_KEY is deliberately gone — the
  // app no longer reopens whatever vault happened to be last, so launching it
  // always lands on the Welcome screen. That key is still written on select,
  // and it stays out of the bootstrap path here for the same reason it always
  // did: it's shared across same-origin windows, so writing it from this
  // window would change what another one sees.
  const bootstrapNexusId = Number(new URLSearchParams(location.search).get('nexus')) || null;
  S.nexus        = S.nexuses.find(n => n.id === bootstrapNexusId) || null;
  if (S.nexus) pushRecentNexus(S.nexus.id);
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
  applyNavRailWidth();
  q('#left-panel-resize')?.setAttribute('title', t('resizePanel'));
  q('#nav-sidebar-resize')?.setAttribute('title', t('resizePanel'));
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
  // Plugin panel contributions (v4.3.0). Deliberately NOT awaited: it only
  // adds buttons to the pane head, so it must not sit on the path to first
  // paint. Re-renders itself once the list lands.
  if (typeof loadPluginPanels === 'function') loadPluginPanels().then(() => { if (S.pluginPanels.length) renderNexusHome(); });
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
  // Onboarding tour handoff (v4.6.0): the vault was created in the Welcome
  // window, which closed itself before the tour could run, so it left the new
  // vault's id behind for whichever window opened it. Clear the flag first —
  // it must fire exactly once even if the tour script fails to load.
  if (!isPopup && S.nexus && localStorage.getItem(NEXUS_PENDING_GUIDE_KEY) === String(S.nexus.id)) {
    localStorage.removeItem(NEXUS_PENDING_GUIDE_KEY);
    loadModule('src/renderer/guide.js').then(() => {
      if (typeof startNexusGuide === 'function') startNexusGuide();
    }).catch(() => {});
  }
  bindNav();
  bindWikilinkClicks();
  bindGlobalShortcuts();
  updateStatusBar();
  bindSearch();
  initDriveAutoBackup();   // fire-and-forget — must not block first paint
  initVersionCheck();      // fire-and-forget — must not block first paint
  initLegacyDataCheck();   // fire-and-forget — must not block first paint
  window.__splash?.finish();
}

// ═══ HELPERS ═══════════════════════════════════════════
function bindPopupDismiss(){
  document.addEventListener('click', () => {
    document.querySelectorAll('.np-dropdown').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.kind-popup').forEach(d => d.remove());
  });
}

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

