// The Hub panel's accordion shell and its non-tree sections: Sage Hut rows,
// the Kind Browser (modules grouped by kind, with its own page view) and the
// import-choice modal that picks between 'import as nest' and 'import as DB'.
// ═══ HUB PANEL — accordion shell (Phase 2) + Nexus nest tree (Phase 3) ═
function toggleHubSection(name) {
  S.hubOpen[name] = !S.hubOpen[name];
  localStorage.setItem(HUB_OPEN_KEY, JSON.stringify(S.hubOpen));
  renderNexusHome();
}

function toggleMajorExpand(id) {
  if (S.moduleCollapsed.has(id)) S.moduleCollapsed.delete(id); else S.moduleCollapsed.add(id);
  renderNexusHome();
}

// Nexus Nest display options (Plan part1 #2) — lightweight setters, deliberately
// not reusing the generic setUiSetting() since that fires an unwanted toast
// plus unrelated re-renders meant for the full Settings modal.
function toggleNestOption(key) {
  S.settings[key] = !S.settings[key];
  saveUiSettings();
  renderNexusHome();
  const pop = document.querySelector('.nest-options-popup');
  if (pop) pop.innerHTML = buildNestOptionsPopupHtml();
}
function toggleNestSignatureMode() {
  S.settings.nestSignatureMode = S.settings.nestSignatureMode === 'icon' ? 'name' : 'icon';
  saveUiSettings();
  renderNexusHome();
  const pop = document.querySelector('.nest-options-popup');
  if (pop) pop.innerHTML = buildNestOptionsPopupHtml();
}

function buildHubHtml() {
  // Vertical drag-resize (Plan part1 #2.1): once >1 section is open, an open
  // section's stored height wins over the default equal-share flex:1 — see
  // startHubSectionResize (core/ui.js). With 0-1 open there's no pair to
  // redistribute between, so skip it and let flex:1 fill the space as before.
  const heights = S.hubSectionHeights || {};
  const openCount = ['nest', 'sage', 'dock'].filter(k => S.hubOpen[k]).length;
  const h = (key) => openCount > 1 ? heights[key] : null;
  const sections = [
    { key: 'nest', html: buildAccSection('nest', t('nexusNest'), buildNestTreeHtml(),
        // Plan part1 #6: one-click Collector create, no popup/name-prompt
        // needed — quickCreateModule already auto-names + enters inline
        // rename mode for every kind when called with no cat_type decision.
        `<button class="btn btn-g btn-i" onclick="event.stopPropagation();quickCreateModule('collector',null)" title="${kindLabel('collector')}">${I[KIND_ICON.collector]}</button>
         <button class="btn btn-g btn-i" onclick="event.stopPropagation();openMajorModuleModal(this)" title="${t('createMajorModule')}">${I.plus}</button>
         <button class="btn btn-g btn-i" onclick="event.stopPropagation();openNestOptionsPopup(this)" title="${t('nestOptionsTitle')}">${I.options}</button>`, h('nest')) },
    { key: 'sage', html: buildAccSection('sage', t('sageHut'), buildSageHutRows(), '', h('sage')) },
    { key: 'dock', html: buildAccSection('dock', t('importDock'),
        typeof buildImportDockRows === 'function' ? buildImportDockRows() : '',
        `<button class="btn btn-g btn-i" onclick="event.stopPropagation();importDockPickFolder()" title="${t('importFolder')}">${I.import}</button>`, h('dock')) },
    // Plan part2 §2: this accordion section is removed — legacy import is
    // now offered via the import-choice modal (openImportChoiceModal) that
    // importDatabaseFile() (core.js) opens automatically after a merge
    // brings in un-migrated legacy data, instead of a standing Hub section.
  ];
  // VS Code container-fold behavior (Plan part1 #2): toggled-off sections
  // sink to the bottom, stacking against each other and against whatever
  // sits below the hub (nexus-vault-head), while open sections keep their
  // original relative order at the top. Array#sort is stable, so within
  // each open/collapsed group the original order survives.
  sections.sort((a, b) => (S.hubOpen[b.key] ? 1 : 0) - (S.hubOpen[a.key] ? 1 : 0));
  // A resize handle only makes sense between two sections that are BOTH open
  // (a collapsed section takes no flex space, so there'd be nothing to drag
  // against) — checked in this post-sort order so e.g. Nest+Dock open with
  // Sage Hut collapsed still get a handle between the two open ones.
  const out = [];
  sections.forEach((s, i) => {
    out.push(s.html);
    const next = sections[i + 1];
    if (S.hubOpen[s.key] && next && S.hubOpen[next.key]) {
      out.push(`<div class="panel-resize-handle panel-resize-handle-v" onmousedown="startHubSectionResize(event,'${s.key}','${next.key}')" title="${t('resizePanel')}"></div>`);
    }
  });
  return `<div id="hub-body">${out.join('')}</div>`;
}

// ═══ SAGE HUT SECTION (Phase 17) ═══════════════════════════════════════
// Four analytics rows (mockup 25); each opens the Sage Hut page in the
// builder with that view active (openSageTab lives in mod/sagehut.js).
// Count badges appear once the stats have been loaded this session.
function buildSageHutRows() {
  const st = S.sageHut?.stats;
  const rows = [
    ['dataSize', t('sageDataSize'), I.sage, st ? fmtBytes(st.bytes) : ''],
    ['objectAmount', t('sageObjectAmount'), I.layer, st ? String(st.objects) : ''],
    ['linkerList', t('sageLinkerList'), I.list, st ? String(st.links) : ''],
    ['linkerGraph', t('sageLinkerGraph'), I.relation, ''],
  ];
  return rows.map(([tab, label, icon, badge]) => `
    <div class="li${!S.activeModuleNode && S.sageHut?.tab === tab ? ' sel' : ''}" onclick="openSageTab('${tab}')">
      <span class="kicon">${icon}</span><span class="name">${x(label)}</span>
      ${badge ? `<span class="cnt" data-no-i18n>${x(badge)}</span>` : ''}
    </div>`).join('');
}

// ═══ KIND BROWSER SECTION (Plan part2 #1) ═══════════════════════════════
// Replaces the old legacy-only Explorer panel (wiki:explorerTree, blind to
// the v3 module table) with a view classifying every module in this Nexus
// by its kind, using data already in memory (S.moduleTree) — no new IPC.
function flattenModulesByKind(nodes = S.moduleTree, out = []) {
  for (const m of nodes) {
    out.push(m);
    if (m.children?.length) flattenModulesByKind(m.children, out);
  }
  return out;
}

function groupModulesByKind() {
  const groups = {};
  for (const m of flattenModulesByKind()) (groups[m.kind] ||= []).push(m);
  return groups;
}

function buildKindBrowserHtml() {
  const groups = groupModulesByKind();
  const kinds = MODULE_KINDS.filter(k => groups[k]?.length);
  if (!kinds.length) return nestEmptyHtml();
  return kinds.map(k => {
    const mods = groups[k].slice().sort((a, b) => a.name.localeCompare(b.name));
    const open = S.kindBrowserOpen.has(k);
    return `
      <div class="li" onclick="toggleKindGroup('${k}')">
        <svg class="icon tree-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="${open ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"/></svg>
        <span class="kicon" style="color:${x(KIND_COLOR[k])}">${I[KIND_ICON[k]]}</span>
        <span class="name">${x(kindLabel(k))}</span>
        <span class="kind" data-no-i18n>${mods.length}</span>
      </div>
      ${open ? mods.map(m => `
        <div class="li indent1" onclick="event.stopPropagation();openModuleNode(${m.id})">
          <span class="name">${x(m.name)}</span>
        </div>`).join('') : ''}`;
  }).join('');
}

function toggleKindGroup(kind) {
  if (S.kindBrowserOpen.has(kind)) S.kindBrowserOpen.delete(kind); else S.kindBrowserOpen.add(kind);
  renderNexusHome();
}

// Plan part2 §2: promoted out of the Hub accordion into its own full page,
// reached via a nav-rail button — same mutual-exclusion state (S.*Node/
// S.filePreview/S.sageHut) goToNexusNestHub() already resets, plus its own
// S.kindBrowserPage flag. buildKindBrowserHtml() itself is unchanged/reused
// verbatim; only its container (accordion section vs standalone page) moved.
function goToKindBrowserHub() {
  S.activeModuleNode = null;
  S.activeItemNode = null;
  S.filePreview = null;
  S.sageHut = null;
  S.kindBrowserPage = true;
  S.importDockPage = false;
  renderNexusHome();
}

// Plan part1 #2: resizable page view — Sage Hut / Import Dock file preview /
// Kind Browser have no other resize lever (unlike Module Detail, which
// already gets one via the Module Inspector dock's own #inspector-resize),
// so wrap their existing full-page markup in a shell with a drag handle.
// S.pageViewWidth unset ⇒ .page-view has no inline style ⇒ fills the shell
// exactly as before this feature existed.
function wrapPageView(innerHtml) {
  const w = S.pageViewWidth;
  return `<div class="page-view-shell">
    <div class="page-view" style="${w ? `flex:0 0 ${w}px;max-width:${w}px` : ''}">${innerHtml}</div>
    <div id="page-view-resize" class="panel-resize-handle" onmousedown="startPageViewResize(event)" title="${t('resizePageView')}"></div>
    <div class="page-view-filler"></div>
  </div>`;
}

function buildKindBrowserPageHtml() {
  return wrapPageView(`<div class="detail-head module-head" style="border-left:4px solid var(--accent);padding-left:12px">
      <h2 style="margin:0;font-size:1.15em">${x(t('kindBrowser'))}</h2>
      <div class="drafter-hint">${x(S.nexus.name)}</div>
    </div>
    <div class="acc-body" style="display:block">${buildKindBrowserHtml()}</div>`);
}

// Plan part2 #New Workspace: same "promoted out of the accordion into its
// own full page" move as goToKindBrowserHub/buildKindBrowserPageHtml above
// — Wyvern's View-set menu needs Import Dock as a standalone page (today
// it's accordion-only), and this is the exact precedent to copy.
// buildImportDockRows() (mod/fileviewer.js) is reused verbatim; only its
// container moved.
function goToImportDockPage() {
  S.activeModuleNode = null;
  S.activeItemNode = null;
  S.filePreview = null;
  S.sageHut = null;
  S.kindBrowserPage = false;
  S.importDockPage = true;
  renderNexusHome();
}

function buildImportDockPageHtml() {
  return wrapPageView(`<div class="detail-head module-head" style="border-left:4px solid var(--accent);padding-left:12px">
      <h2 style="margin:0;font-size:1.15em">${x(t('importDock'))}</h2>
      <div class="drafter-hint">${x(S.nexus.name)}</div>
    </div>
    <div class="acc-body" style="display:block">${typeof buildImportDockRows === 'function' ? buildImportDockRows() : ''}</div>`);
}

// ═══ IMPORT-CHOICE MODAL (Plan part2 §2) ════════════════════════════════
// Opens after importDatabaseFile() (core.js) merges in a file that carried
// un-migrated legacy data (director/navigator/hero/writer projects, or
// Scribe notes) — replaces the old always-on Hub "Legacy Import" accordion
// with a one-time choice: convert everything into a real Nexus Nest module
// tree (migrate_v3.js), or keep it as a read-only "Import DB" legacy view
// (openImportDbHub, S.importDbMode).
function openImportChoiceModal() {
  openModal(t('importChoiceTitle'), `
    <p class="drafter-hint">${t('importChoiceBody')}</p>
    <div class="typegrid" style="grid-template-columns:1fr 1fr">
      <div class="typecard" onclick="chooseImportAsNexusNest(this)">
        <h5>${I.layer} ${t('importChoiceNestOption')}</h5><p>${t('importChoiceNestDesc')}</p>
      </div>
      <div class="typecard" onclick="chooseImportAsDb(this)">
        <h5>${I.director} ${t('importChoiceDbOption')}</h5><p>${t('importChoiceDbDesc')}</p>
      </div>
    </div>`);
}

// Runs migrate_v3.js across every un-migrated row in every MIGRATE_TARGETS
// source, threading batchCtx through so Navigator's classifiers/chroniclers
// can fold into a Director connector created earlier in the same batch
// (decision #6 — see migrate_v3.js's navigator target). IPC args are
// serialized by value, so the mutated batchCtx has to come back from each
// migrate:run response rather than staying a shared live reference.
async function chooseImportAsNexusNest(cardEl) {
  const nexusId = S.nexus?.id || S.nexuses?.[0]?.id;
  if (!nexusId) { toast(t('nexusSelectFirst'), 'error'); return; }
  if (cardEl) cardEl.style.pointerEvents = 'none';
  const totals = { modules: 0, objects: 0, events: 0, chapters: 0, dialogues: 0, relations: 0 };
  let firstOpenedId = null;
  let batchCtx = {};
  // Unbounded N×M migration — pointer-events:none alone left the modal looking
  // frozen for the whole run.
  setBusy('#modal-body', true);
  try {
    for (const tg of MIGRATE_TARGETS) {
      const rows = await api.migrate.list(tg.id, nexusId);
      for (const row of rows) {
        const res = await api.migrate.run(nexusId, tg.id, row.id, batchCtx);
        batchCtx = res.batchCtx || batchCtx;
        const c = res.counts || {};
        for (const k of Object.keys(totals)) totals[k] += c[k] || 0;
        if (!firstOpenedId && res.id) firstOpenedId = res.id;
      }
    }
  } finally {
    setBusy('#modal-body', false);
  }
  closeModal();
  toast(`${t('artMigrateDone')} — ${totals.modules} modules · ${totals.objects} objects · ${totals.events} events · ${totals.chapters} chapters · ${totals.dialogues} dialogues · ${totals.relations} relations`, 'ok');
  if (S.nexus?.id === nexusId) {
    await reloadModuleTree();
    if (firstOpenedId) await openModuleNode(firstOpenedId);
  }
}

function chooseImportAsDb() {
  closeModal();
  openImportDbHub();
}

