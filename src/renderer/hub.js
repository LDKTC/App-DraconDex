'use strict';
// ═══ v3 MODULE SYSTEM — Nexus nest hub (progress.md Phases 1-3) ═══════
// New, additive Major/Minor module tree living alongside the legacy
// Director/Navigator/Hero/Writer/Scribe/Sage/Artisan modules. See
// progress.md Section C for why this pass keeps the legacy modules
// reachable unchanged (their existing nav-rail buttons still work) instead
// of literally deleting them — full removal is Phase 23's job, once they
// migrate into Artisan templates.

const MODULE_KINDS = ['collector','manager','inspector','classifier','locator','chronicler',
  'wanderer','narrator','author','scribe','drafter','viewer','connector','sketcher','designer'];
const KIND_ICON = {
  collector:'folder', manager:'manager', inspector:'document', classifier:'layer',
  locator:'map', chronicler:'timeline', wanderer:'wanderer', narrator:'narrator',
  author:'book', scribe:'story', drafter:'scribe', viewer:'list', connector:'relation',
  sketcher:'sketcher', designer:'relation',
};
// Unique names (progress.md Section A.3 #7) are locale-invariant by design —
// the Classic <-> Unique name toggle is Phase 22, not needed yet.
const KIND_LABEL = {
  collector:'Collector', manager:'Manager', inspector:'Inspector', classifier:'Classifier',
  locator:'Locator', chronicler:'Chronicler', wanderer:'Wanderer', narrator:'Narrator',
  author:'Author', scribe:'Scribe', drafter:'Drafter', viewer:'Viewer', connector:'Connector',
  sketcher:'Sketcher', designer:'Designer',
};
// Distinct accent per kind for the create-modal picker cards (buildKindPicker
// below) — drawn from the app's own seeded color palette (src/db/core.js),
// not a new hardcoded set, so cards stay theme-safe.
const KIND_COLOR = {
  collector:'#64748b', manager:'#6366f1', inspector:'#3b82f6', classifier:'#8b5cf6',
  locator:'#22c55e', chronicler:'#f97316', wanderer:'#06b6d4', narrator:'#ec4899',
  author:'#eab308', scribe:'#38bdf8', drafter:'#a78bfa', viewer:'#34d399', connector:'#f43f5e',
  sketcher:'#fb923c', designer:'#a3e635',
};
// i18n key per kind's one-line description on the same cards.
const KIND_DESC_KEY = {
  collector:'kindDescCollector', manager:'kindDescManager', inspector:'kindDescInspector',
  classifier:'kindDescClassifier', locator:'kindDescLocator', chronicler:'kindDescChronicler',
  wanderer:'kindDescWanderer', narrator:'kindDescNarrator', author:'kindDescAuthor',
  scribe:'kindDescScribe', drafter:'kindDescDrafter', viewer:'kindDescViewer',
  connector:'kindDescConnector', sketcher:'kindDescSketcher', designer:'kindDescDesigner',
};

// The 4 legacy-fixed-module-shaped structure templates Artisan's create
// wizard (src/renderer/artisan.js, lazy-loaded) can build in one step —
// moved here (Plan part2 #1) so both the Nest "+" popup's "Start from
// template" row (buildKindListHtml) and the Hub's Legacy Import section
// (ensureLegacyImport) can read it synchronously without a lazy-load.
const ARTISAN_TARGETS = [
  { id: 'director',  icon: 'director',  labelKey: 'director' },
  { id: 'navigator', icon: 'navigator', labelKey: 'navigator' },
  { id: 'hero',      icon: 'hero',      labelKey: 'hero' },
  { id: 'writer',    icon: 'writer',    labelKey: 'writer' },
];

// Plan part2 §2: the 5 sources the new import-choice modal's "Nexus Nest"
// path can migrate — ARTISAN_TARGETS' 4 plus Scribe, which has no legacy
// "project" table (src/db/migrate_v3.js's scribe target keys off the
// nexus's un-migrated notes instead) and was never part of Artisan's
// create-wizard, so it stays out of ARTISAN_TARGETS itself.
const MIGRATE_TARGETS = [...ARTISAN_TARGETS, { id: 'scribe', icon: 'story', labelKey: 'scribe' }];

// Selection made in the Icon Collection picker (Phase 5): `svg:<I-key>` or
// `sym:<glyph>`, stored verbatim in module.icon. Falls back to the kind's
// default icon when unset.
function moduleIconHtml(m) {
  return iconRefHtml(m.icon, I[KIND_ICON[m.kind]] || I.layer);
}

function findModuleNode(id, nodes = S.moduleTree) {
  for (const m of nodes) {
    if (m.id === id) return m;
    if (m.children?.length) {
      const found = findModuleNode(id, m.children);
      if (found) return found;
    }
  }
  return null;
}

// Walks parent_id up to the true root ancestor (Plan part3 status-bar fix —
// nesting depth is arbitrary since Plan part1 #4, so a single parent_id hop
// is not necessarily the root). Returns null if `m` is already the root.
function moduleRootAncestor(m) {
  let cur = m;
  while (cur.parent_id != null) {
    const p = findModuleNode(cur.parent_id);
    if (!p) break;
    cur = p;
  }
  return cur.id === m.id ? null : cur;
}

// True if `targetId` is `node` itself or nested anywhere under it — used to
// block a drag-drop that would nest a module inside its own subtree.
function isSelfOrDescendant(node, targetId) {
  if (node.id === targetId) return true;
  return (node.children || []).some(c => isSelfOrDescendant(c, targetId));
}

async function reloadModuleTree() {
  [S.moduleTree, S.moduleItemCounts] = S.nexus
    ? await Promise.all([api.module.getTree(S.nexus.id), api.module.getItemCounts(S.nexus.id)])
    : [[], {}];
  S.activeModuleNode = S.activeModuleNode ? findModuleNode(S.activeModuleNode.id) : null;
  // prune builder tabs pointing at deleted modules
  for (const pane of (S.builder?.panes || [])) {
    pane.tabs = pane.tabs.filter(k => !k.startsWith('module:') || !!findModuleNode(Number(k.slice(7))));
    if (pane.active && !pane.tabs.includes(pane.active)) pane.active = pane.tabs[0] || null;
  }
  // Plan part4: drop the lazy content-item cache for any module no longer
  // in the tree (deleted, or moved to a different nexus).
  for (const id of [...S.nestItems.keys()]) if (!findModuleNode(id)) S.nestItems.delete(id);
  renderModuleRail();
  renderProjectTabs();
  if (S.view === 'nexus' && !S.activeModule) renderNexusHome();
}

// ═══ NAV RAIL — dynamic Major-module icon strip (Phase 1) ═════════════
function renderModuleRail() {
  const rail = q('#nav-sidebar');
  if (!rail) return;
  rail.querySelectorAll('.module-rail-item, .module-rail-tool').forEach(el => el.remove());
  if (!S.nexus) return;
  const anchor = q('#nav-logo-btn');
  if (!anchor) return;
  const pinned = S.moduleTree.filter(m => m.pinned);
  const atHubHome = !S.activeModuleNode && !S.filePreview && !S.sageHut && !S.kindBrowserPage;
  let html = `<button class="nav-btn module-rail-tool${atHubHome ? ' active' : ''}" title="${t('nexusNest')}" onclick="goToNexusNestHub()">${I.home}</button>
    <button class="nav-btn module-rail-tool${S.kindBrowserPage ? ' active' : ''}" title="${t('kindBrowser')}" onclick="goToKindBrowserHub()">${I.layer}</button>
    <div class="rail-sep module-rail-tool"></div>
    <button class="nav-btn create module-rail-tool" title="${t('createMajorModule')}" onclick="event.stopPropagation();openMajorModuleModal(this)">${I.plus}</button>`;
  if (pinned.length) html += `<div class="rail-sep module-rail-tool"></div>`;
  for (const m of pinned) {
    const active = S.activeModuleNode?.id === m.id ? ' active' : '';
    const col = m.icon_color_code || m.color_code || '#6366f1';
    html += `<button class="nav-btn module-rail-item${active}" style="color:${x(col)}" title="${x(m.name)}" onclick="openModuleNode(${m.id})">
      ${moduleIconHtml(m)}<span class="mdot" style="background:${x(m.color_code || '#6366f1')}"></span>
    </button>`;
  }
  anchor.insertAdjacentHTML('afterend', html);
}

// Nav-sidebar "home" button — jumps back to the Nexus Nest hub's welcome
// page from anywhere inside a v3 module's detail view (the existing
// #nav-logo-btn "return" affordance only fires for legacy full-page
// modules — S.activeModule — not for a focused module node inside the
// Builder grid, so there was previously no one-click way back for that).
function goToNexusNestHub() {
  S.activeModuleNode = null;
  S.filePreview = null;
  S.sageHut = null;
  S.activeItemNode = null;
  S.kindBrowserPage = false;
  renderNexusHome();
}

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
  const sections = [
    { key: 'nest', html: buildAccSection('nest', t('nexusNest'), buildNestTreeHtml(),
        // Plan part1 #6: one-click Collector create, no popup/name-prompt
        // needed — quickCreateModule already auto-names + enters inline
        // rename mode for every kind when called with no cat_type decision.
        `<button class="btn btn-g btn-i" onclick="event.stopPropagation();quickCreateModule('collector',null)" title="${kindLabel('collector')}">${I[KIND_ICON.collector]}</button>
         <button class="btn btn-g btn-i" onclick="event.stopPropagation();openMajorModuleModal(this)" title="${t('createMajorModule')}">${I.plus}</button>
         <button class="btn btn-g btn-i" onclick="event.stopPropagation();openNestOptionsPopup(this)" title="${t('nestOptionsTitle')}">${I.options}</button>`) },
    { key: 'sage', html: buildAccSection('sage', t('sageHut'), buildSageHutRows()) },
    { key: 'dock', html: buildAccSection('dock', t('importDock'),
        typeof buildImportDockRows === 'function' ? buildImportDockRows() : '',
        `<button class="btn btn-g btn-i" onclick="event.stopPropagation();importDockPickFolder()" title="${t('importFolder')}">${I.import}</button>`) },
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
  return `<div id="hub-body">${sections.map(s => s.html).join('')}</div>`;
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
  if (!kinds.length) return `<div class="empty" style="padding:24px 10px"><p>${t('nestEmpty')}</p></div>`;
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

function buildAccSection(key, label, bodyHtml, actHtml = '') {
  const open = !!S.hubOpen[key];
  return `
    <div class="acc-head${open ? '' : ' acc-collapsed'}" onclick="toggleHubSection('${key}')">
      <svg class="icon chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="${open ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"/></svg>
      ${x(label)}<span class="act">${actHtml}</span>
    </div>
    <div class="acc-body" style="${open ? '' : 'display:none'}">${bodyHtml}</div>`;
}

function buildNestTreeHtml() {
  if (!S.moduleTree.length) return `<div class="empty" style="padding:24px 10px"><p>${t('nestEmpty')}</p></div>`;
  return S.moduleTree.map(m => buildNestRow(m, 0, null)).join('');
}

function buildNestRow(m, depth, parentId) {
  const sel = S.activeModuleNode?.id === m.id ? ' sel' : '';
  const col = m.icon_color_code || m.color_code || 'var(--accent)';
  const hasChildren = m.children?.length > 0;
  const collapsed = S.moduleCollapsed.has(m.id);
  // Plan part4: content-item "minor module" leaves. Fetched lazily, once,
  // opportunistically at render time (same idiom as buildImportDockRows's
  // own ensureImportDock() call — idempotent, fires the async fetch once
  // and re-renders when it resolves) rather than only on an explicit
  // expand-click, since a module starts EXPANDED by default (not in
  // S.moduleCollapsed) — a click-only trigger would never fire for a
  // freshly-opened Nexus's modules.
  const isContentKind = !!ITEM_KIND[m.kind];
  if (isContentKind && !collapsed) ensureNestItemsLoaded(m.id);
  const itemRows = S.nestItems.get(m.id);
  const itemCount = Array.isArray(itemRows) ? itemRows.length : (S.moduleItemCounts[m.id] || 0);
  // Plan part1 #2/#4: the "show minor modules" toggle hides content-item
  // leaves tree-wide — when off, a content-kind module with only items and
  // no nested module children shows no chevron at all (nothing to expand).
  const nestShowItems = S.settings.nestShowItems !== false;
  const showChev = hasChildren || (nestShowItems && isContentKind && itemCount > 0);
  // Plan part1 #4: a node with ONLY content-item children (no nested module
  // children) gets a '+'/'-' glyph pair instead of the caret, same wrapper
  // attrs/sizing as the caret, just a different inner shape.
  const onlyLeafChildren = !hasChildren && nestShowItems && isContentKind && itemCount > 0;
  const chev = showChev
    ? (onlyLeafChildren
        ? `<svg class="icon tree-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" onclick="event.stopPropagation();toggleMajorExpand(${m.id})">${collapsed ? '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' : '<line x1="5" y1="12" x2="19" y2="12"/>'}</svg>`
        : `<svg class="icon tree-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" onclick="event.stopPropagation();toggleMajorExpand(${m.id})"><polyline points="${collapsed ? '9 18 15 12 9 6' : '6 9 12 15 18 9'}"/></svg>`)
    // Plan part1 #5: reserve the same box a real chevron would occupy even
    // when this row has none, so .kicon lines up in a column with sibling
    // rows at the same depth that DO show a chevron.
    : '<span class="tree-chev-spacer"></span>';
  const openable = m.kind !== 'collector';
  const renaming = S.renamingModuleId === m.id;
  // IDE-style depth indentation (Plan part1 #4/#4-2) — capped visually past
  // a few levels so very deep nesting doesn't run the row text off-panel;
  // the tree itself still nests as deep as the drop rules allow.
  const indentCls = depth ? ` indent${Math.min(depth, 5)}` : '';
  const childrenHtml = (hasChildren && !collapsed) ? m.children.map(c => buildNestRow(c, depth + 1, m.id)).join('') : '';
  // Module sub-structure first, then this module's own content-item leaves
  // — a brand-new render function, deliberately NOT a buildNestRow
  // recursion, so these rows structurally cannot inherit drag/drop wiring
  // (no draggable/ondragstart/ondragover/ondrop, no chevron, no context
  // menu) — a content item can never be dragged out of its owning module.
  const itemsHtml = (nestShowItems && isContentKind && !collapsed && Array.isArray(itemRows))
    ? itemRows.map(it => buildNestItemRow(it, m.kind, m.id, depth + 1)).join('') : '';
  const showMajorIcon = S.settings.nestShowMajorIcon !== false;
  const kindBadge = S.settings.nestSignatureMode === 'icon'
    ? `<span class="kind kind-icon" data-no-i18n>${I[KIND_ICON[m.kind]] || I.layer}</span>`
    : `<span class="kind">${x(kindLabel(m.kind))}</span>`;
  // draggable is on the whole row, not just a dedicated grip icon (Plan
  // part1 #3 removed the old decorative grip span) — a real drag started
  // anywhere on the row (name, icon, background — what a user would
  // actually grab) works. Off while renaming so dragging can't fight the
  // rename `<input>` for the mousedown (a draggable ancestor around a text
  // input makes placing the caret unreliable).
  return `<div class="li${indentCls}${sel}"
      draggable="${renaming ? 'false' : 'true'}" ondragstart="onNestDragStart(event,${m.id},${parentId ?? 'null'})"
      ondragover="onNestDragOver(event,this,${m.id})" ondragleave="onNestDragLeave(event,this)" ondrop="onNestDrop(event,${m.id},${parentId ?? 'null'},this)"
      onclick="${renaming ? '' : `scheduleRowOpen(${m.id})`}" oncontextmenu="openModuleContextMenu(event,${m.id})">
    ${chev}
    ${showMajorIcon ? `<span class="kicon" style="color:${x(col)}" onclick="event.stopPropagation();openModuleIconPopup(${m.id},this)">${moduleIconHtml(m)}</span>` : ''}
    ${renaming
      ? `<input id="rename-nest-${m.id}" class="rename-input" value="${x(m.name)}" onclick="event.stopPropagation()" onblur="saveModuleRename(${m.id},this.value)" onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape'){this.value=${x(JSON.stringify(m.name))};this.blur();}">`
      : `<span class="name" ondblclick="event.stopPropagation();cancelRowOpen();startRenameModule(${m.id})">${x(m.name)}</span>`}
    ${kindBadge}
    <span class="acts">
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openMinorModuleModal(${m.id},this)" title="${t('addMinorModule')}">${I.plus}</button>
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openModuleEditModal(${m.id})" title="${t('moduleEdit')}">${I.edit}</button>
    </span>
  </div>${childrenHtml}${itemsHtml}`;
}

// Leaf row for one content item (Plan part4) — see buildNestRow's own
// comment above for why this is deliberately not a buildNestRow recursion.
function buildNestItemRow(item, itemKind, moduleId, depth) {
  const reg = ITEM_KIND[itemKind];
  const active = S.activeItemNode?.itemKind === itemKind && S.activeItemNode?.moduleId === moduleId && S.activeItemNode?.id === item.id;
  const indentCls = ` indent${Math.min(depth, 5)}`;
  const showIcon = !!S.settings.nestShowMinorIcon;
  return `<div class="li${indentCls}${active ? ' sel' : ''} nest-item-row" onclick="openItemNode('${itemKind}',${moduleId},${item.id})">
    <span class="tree-chev-spacer"></span>
    ${showIcon ? `<span class="kicon" style="color:var(--t3)">${reg.icon()}</span>` : ''}
    <span class="name">${x(reg.nameOf(item))}</span>
  </div>`;
}

// Lazy per-module content-item fetch (Plan part4) — idempotent (checked via
// S.nestItems.has), triggered opportunistically from buildNestRow whenever
// a content-bearing-kind module's row renders expanded, so it fires both
// for a module that starts expanded by default and one explicitly toggled
// open. Mirrors ensureImportDock's own loading-marker-then-cache pattern.
function ensureNestItemsLoaded(moduleId) {
  if (S.nestItems.has(moduleId)) return;
  const m = findModuleNode(moduleId);
  if (!m || !ITEM_KIND[m.kind]) return;
  S.nestItems.set(moduleId, null);
  ITEM_KIND[m.kind].list(moduleId).then(items => {
    S.nestItems.set(moduleId, items);
    for (const it of items) {
      const key = `item:${m.kind}:${moduleId}:${it.id}`;
      S.itemNodeCache.set(key, { name: ITEM_KIND[m.kind].nameOf(it), color: m.color_code, badge: t(ITEM_KIND[m.kind].badgeKey), icon: ITEM_KIND[m.kind].icon() });
    }
    renderNexusHome();
  });
}

// Called from every content-item create/rename/delete path (both a
// module's own inline view and the item's own page) so the Nest tree's
// lazy cache and count-gated chevron never drift stale. `delta` (+1/-1)
// keeps the chevron accurate immediately, without waiting for a refetch,
// when the row isn't currently expanded.
function invalidateNestItems(moduleId, delta = 0) {
  if (delta) S.moduleItemCounts[moduleId] = Math.max(0, (S.moduleItemCounts[moduleId] || 0) + delta);
  const wasLoaded = S.nestItems.has(moduleId);
  S.nestItems.delete(moduleId);
  // A deleted item may still have its own Builder tab open in the
  // background (unfocused, so openItemNode's own "stale tab" re-check never
  // fires for it) — close those proactively instead of leaving a dead tab.
  if (delta < 0) closeStaleItemTabs(moduleId, wasLoaded);
  renderNexusHome();
}

async function closeStaleItemTabs(moduleId, reload) {
  const m = findModuleNode(moduleId);
  if (!m || !ITEM_KIND[m.kind]) return;
  const items = await ITEM_KIND[m.kind].list(moduleId);
  if (reload) S.nestItems.set(moduleId, items);
  const liveIds = new Set(items.map(it => it.id));
  const prefix = `item:${m.kind}:${moduleId}:`;
  const b = builderState();
  let closedAny = false;
  for (const [idx, pane] of b.panes.entries()) {
    for (const key of [...pane.tabs]) {
      if (key.startsWith(prefix) && !liveIds.has(Number(key.slice(prefix.length)))) {
        await builderCloseTab(idx, key);
        closedAny = true;
      }
    }
  }
  if (closedAny) toast(t('itemNotFound'), 'error');
  renderNexusHome();
}

// ═══ Drag-reorder / reparent — any depth, any module (Plan part1 #1) ═══
// Dropping on the top/bottom quarter of a row reorders the dragged module
// as that row's sibling there (adopting that row's parent, which may be a
// different parent than the one it came from — an implicit "move to"); the
// middle half nests it as that row's child instead. Any module can be
// dragged out of its current parent to top-level, into a different parent,
// or reordered among new siblings — the only hard rule is the self/
// descendant guard below (can't drop a module into its own subtree).
function onNestDragStart(ev, id, parentId) {
  S.dragNest = { id, parentId };
  ev.dataTransfer.effectAllowed = 'move';
  ev.stopPropagation();
}
// Plan part1 #8: a row visually sitting directly below an already-EXPANDED
// parent already reads as "inside" that parent's children, not as its
// sibling — so the bottom-quarter zone becomes a child-drop ('in') instead
// of a sibling reorder ('after') for that specific case. A collapsed
// parent, or one with no children at all, keeps the original behavior.
function nestDropZone(ev, row, id) {
  const r = row.getBoundingClientRect();
  const frac = (ev.clientY - r.top) / r.height;
  if (frac < 0.25) return 'before';
  if (frac > 0.75) {
    const node = id != null ? findModuleNode(id) : null;
    const hasChildren = node?.children?.length > 0;
    const expanded = hasChildren && !S.moduleCollapsed.has(id);
    return expanded ? 'in' : 'after';
  }
  return 'in';
}
function onNestDragOver(ev, row, id) {
  if (!S.dragNest) return;
  ev.preventDefault();
  ev.stopPropagation();
  row.classList.remove('drop-before', 'drop-after', 'drop-in');
  row.classList.add(`drop-${nestDropZone(ev, row, id)}`);
}
function onNestDragLeave(ev, row) {
  row.classList.remove('drop-before', 'drop-after', 'drop-in');
}
async function onNestDrop(ev, targetId, targetParentId, row) {
  ev.preventDefault();
  ev.stopPropagation();
  row.classList.remove('drop-before', 'drop-after', 'drop-in');
  const drag = S.dragNest;
  S.dragNest = null;
  if (!drag || drag.id === targetId) return;
  const dragNode = findModuleNode(drag.id);
  if (!dragNode || isSelfOrDescendant(dragNode, targetId)) return;
  const zone = nestDropZone(ev, row, targetId);
  const newParentId = zone === 'in' ? targetId : targetParentId;
  if (zone === 'in') S.moduleCollapsed.delete(targetId);
  const siblings = (newParentId == null ? S.moduleTree : findModuleNode(newParentId)?.children || [])
    .map(m => m.id).filter(id => id !== drag.id);
  if (zone === 'before') siblings.splice(siblings.indexOf(targetId), 0, drag.id);
  else if (zone === 'after') siblings.splice(siblings.indexOf(targetId) + 1, 0, drag.id);
  else siblings.push(drag.id);
  await api.module.move(S.nexus.id, drag.id, newParentId, siblings);
  await reloadModuleTree();
}

// ═══ Create (instant, via kind-popup) / edit (still the full form) / delete
async function openMajorModuleModal(anchor) {
  if (!S.nexus) return;
  openKindPopup(null, anchor);
}
async function openMinorModuleModal(parentId, anchor) {
  if (!S.nexus) return;
  openKindPopup(parentId, anchor);
}
async function openModuleEditModal(id) {
  const m = findModuleNode(id);
  if (!m) return;
  await moduleFormModal(m);
}

// ═══ Popup plumbing shared by the kind-picker and the icon/color popup ═
// Closed globally on any outside click — see the `.kind-popup` sweep next
// to the `.np-dropdown` one in core.js's init().
function closeAllPopups() {
  document.querySelectorAll('.kind-popup').forEach(el => el.remove());
}
// Place a freshly-appended popup below its anchor button, flipping above
// and clamping horizontally if it would overflow the viewport — same idea
// as guide.js's _guidePaint popover placement, generalized for reuse here.
function positionPopupNear(el, rect) {
  const pw = el.offsetWidth, ph = el.offsetHeight, gap = 6;
  let top = rect.bottom + gap;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, rect.top - ph - gap);
  let left = rect.left;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
}

// Place a submenu flyout to the right of its parent row (native context-menu
// convention), flipping to the left when it would overflow the right edge —
// vertically aligned with the row itself rather than below it, like
// positionPopupNear.
function positionSubmenuNear(el, rect) {
  const pw = el.offsetWidth, ph = el.offsetHeight, gap = 2;
  let left = rect.right + gap;
  if (left + pw > window.innerWidth - 8) left = Math.max(8, rect.left - pw - gap);
  let top = rect.top;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, window.innerHeight - ph - 8);
  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
}

// The Major-module context menu's "Create" row (buildModuleContextMenuHtml)
// reveals the kind list as a hover submenu instead of inlining it — a second
// `.kind-popup` appended next to the first, closed on mouseleave with a short
// grace period so crossing the gap between the row and the flyout doesn't
// close it prematurely.
let _ctxSubmenuCloseTimer = null;
function cancelCtxSubmenuClose() {
  clearTimeout(_ctxSubmenuCloseTimer);
}
function scheduleCtxSubmenuClose() {
  clearTimeout(_ctxSubmenuCloseTimer);
  _ctxSubmenuCloseTimer = setTimeout(() => document.querySelector('.ctx-submenu')?.remove(), 200);
}
function openCreateSubmenu(ev, parentId) {
  cancelCtxSubmenuClose();
  if (document.querySelector('.ctx-submenu')) return;
  const pop = document.createElement('div');
  pop.className = 'kind-popup kind-list-popup ctx-submenu';
  // Plan part1 #7: Collector has its own direct row on the context menu
  // now (buildModuleContextMenuHtml) — excluded here only, not from the
  // major/minor-module "+" popups below (openKindPopup's own call stays
  // unfiltered), which still list every kind including Collector.
  pop.innerHTML = buildKindListHtml(parentId, true);
  document.body.appendChild(pop);
  pop.addEventListener('click', e => e.stopPropagation());
  pop.addEventListener('mouseenter', cancelCtxSubmenuClose);
  pop.addEventListener('mouseleave', scheduleCtxSubmenuClose);
  positionSubmenuNear(pop, ev.currentTarget.getBoundingClientRect());
}

// Plan part1 #3: "Open in new pane" direction flyout — same hover-submenu
// shape as openCreateSubmenu above, reusing its singular .ctx-submenu
// guard/close-timer as-is (only one flyout is ever open at a time; "Create"
// and this one never hover simultaneously).
function buildPaneDirectionListHtml(id) {
  return [
    ['left', t('paneDirLeft')], ['right', t('paneDirRight')],
    ['top', t('paneDirTop')], ['bottom', t('paneDirBottom')],
  ].map(([dir, label]) =>
    `<div class="kind-list-item" onclick="closeAllPopups();openModuleInNewPane(${id},'${dir}')"><span class="kli-name">${x(label)}</span></div>`
  ).join('');
}
function openPaneDirectionSubmenu(ev, id) {
  cancelCtxSubmenuClose();
  if (document.querySelector('.ctx-submenu')) return;
  const pop = document.createElement('div');
  pop.className = 'kind-popup kind-list-popup ctx-submenu';
  pop.innerHTML = buildPaneDirectionListHtml(id);
  document.body.appendChild(pop);
  pop.addEventListener('click', e => e.stopPropagation());
  pop.addEventListener('mouseenter', cancelCtxSubmenuClose);
  pop.addEventListener('mouseleave', scheduleCtxSubmenuClose);
  positionSubmenuNear(pop, ev.currentTarget.getBoundingClientRect());
}

// Cursor-anchored popup helper — inline onclick= attributes can't close over
// a live event object once the popup's own click handler runs later, so the
// last right-click point is stashed on S and read back here.
function ctxAnchor(ev) {
  const x = ev ? ev.clientX : (S.ctxMenuPos?.x ?? 0);
  const y = ev ? ev.clientY : (S.ctxMenuPos?.y ?? 0);
  return { getBoundingClientRect: () => ({ left: x, top: y, bottom: y, right: x }) };
}

// ═══ Right-click context menus (Nexus Hub bg / Nest row / Nav-sidebar) ═
function onHubBackgroundContextMenu(ev) {
  if (ev.target.closest('.li')) return; // a row handles its own contextmenu (see buildNestRow)
  ev.preventDefault();
  openKindPopup(null, ctxAnchor(ev));
}

function openModuleContextMenu(ev, id) {
  ev.preventDefault();
  ev.stopPropagation();
  closeAllPopups();
  S.ctxMenuPos = { x: ev.clientX, y: ev.clientY };
  const m = findModuleNode(id);
  if (!m) return;
  const isMajor = m.parent_id == null;
  const pop = document.createElement('div');
  pop.className = 'kind-popup context-menu-popup';
  pop.innerHTML = buildModuleContextMenuHtml(id, isMajor, !!m.pinned);
  document.body.appendChild(pop);
  pop.addEventListener('click', e => e.stopPropagation());
  positionPopupNear(pop, ctxAnchor(ev).getBoundingClientRect());
}

// Plan part1 #3: pop a module's own Builder page into a fresh floating
// window — mirrors builderPopOutTab's own api.window.openBuilderTab call,
// but without its builderCloseTab step, since nothing existing is being
// moved/closed here (the module opens in the new window while the current
// pane/tab, if any, is left untouched).
async function openModuleInNewWindow(id) {
  const m = findModuleNode(id);
  if (!m) return;
  await api.window.openBuilderTab(S.nexus.id, builderPageKey({ kind: 'module', id }));
}

const PANE_DIR_MAP = { left: ['h', true], right: ['h', false], top: ['v', true], bottom: ['v', false] };
// Plan part1 #3: split the currently-focused Builder pane in the requested
// direction and open the module straight into the freshly created pane —
// same (dir,newFirst) convention already used by the drag-to-edge auto-split
// (onBodyDrop): left/top put the new pane before the original, right/bottom
// put it after.
async function openModuleInNewPane(id, dir) {
  const m = findModuleNode(id);
  if (!m) return;
  const [axis, newFirst] = PANE_DIR_MAP[dir];
  const newIdx = builderSplitPane(builderState().focused, axis, newFirst);
  if (newIdx == null) return;
  await builderFocusPane(newIdx, { kind: 'module', id });
}

function buildModuleContextMenuHtml(id, isMajor, pinned) {
  let html = '';
  if (isMajor) {
    // The create-list used to sit inline at the top of the menu (every kind,
    // always visible) — moved behind one "Create" row with a hover submenu
    // instead, decluttering the menu the same way a native app's context
    // menu nests a submenu rather than flattening every option.
    // Plan part1 #5: auto-parent to the right-clicked module — this used to
    // hardcode parentId=null regardless of which module's menu was open,
    // always creating a new top-level sibling instead of a child of `id`.
    html += `<div class="kind-list-item kli-submenu-parent" onmouseenter="openCreateSubmenu(event,${id})" onmouseleave="scheduleCtxSubmenuClose()">
      <span class="kli-name">${x(t('create'))}</span><span class="kli-arrow">›</span>
    </div>
      <div class="ctx-sep"></div>
      <div class="kind-list-item" onclick="closeAllPopups();openMinorModuleModal(${id},ctxAnchor())"><span class="kli-name">${x(t('addMinorModule'))}</span></div>
      <div class="kind-list-item" onclick="closeAllPopups();quickCreateModule('collector',${id})">
        <span class="kicon" style="color:${x(KIND_COLOR.collector)}">${I[KIND_ICON.collector]}</span>
        <span class="kli-text"><span class="kli-name">${x(kindLabel('collector'))}</span><span class="kli-desc">${t(KIND_DESC_KEY.collector)}</span></span>
      </div>`;
  }
  // Plan part1 #3: modules with their own Builder page (any kind except the
  // pure-folder Collector, see KIND_MAIN_BUILDER) get "open in a new window"
  // and a hover "open in a new pane" direction submenu.
  const m = findModuleNode(id);
  if (m && m.kind !== 'collector') {
    html += `
    <div class="kind-list-item" onclick="closeAllPopups();openModuleInNewWindow(${id})"><span class="kli-name">${x(t('openInNewWindow'))}</span></div>
    <div class="kind-list-item kli-submenu-parent" onmouseenter="openPaneDirectionSubmenu(event,${id})" onmouseleave="scheduleCtxSubmenuClose()">
      <span class="kli-name">${x(t('openInNewPane'))}</span><span class="kli-arrow">›</span>
    </div>
    <div class="ctx-sep"></div>`;
  }
  html += `
    <div class="kind-list-item" onclick="closeAllPopups();startRenameModule(${id})"><span class="kli-name">${x(t('rename'))}</span></div>
    <div class="kind-list-item" onclick="closeAllPopups();duplicateModuleNode(${id})"><span class="kli-name">${x(t('duplicate'))}</span></div>
    <div class="kind-list-item" onclick="openMoveToListInPlace(${id})"><span class="kli-name">${x(t('moveTo'))}</span></div>
    <div class="kind-list-item" onclick="closeAllPopups();deleteModuleNode(${id})"><span class="kli-name">${x(t('delete'))}</span></div>`;
  if (isMajor) {
    html += `<div class="kind-list-item" onclick="closeAllPopups();toggleModulePin(${id})"><span class="kli-name">${x(pinned ? t('unpin') : t('pin'))}</span></div>`;
  }
  return html;
}

function openMoveToListInPlace(id) {
  const pop = document.querySelector('.kind-popup');
  if (!pop) return;
  pop.innerHTML = buildMoveToListHtml(id);
}
function flattenModuleTree(nodes, depth, out) {
  out = out || [];
  for (const m of nodes) {
    out.push({ m, depth });
    if (m.children?.length) flattenModuleTree(m.children, depth + 1, out);
  }
  return out;
}
function buildMoveToListHtml(id) {
  const node = findModuleNode(id);
  if (!node) return '';
  let html = '';
  if (node.parent_id != null) {
    html += `<div class="kind-list-item" onclick="moveModuleTo(${id},null)"><span class="kli-name">${x(t('moveToTopLevel'))}</span></div>`;
  }
  const all = flattenModuleTree(S.moduleTree, 0);
  for (const { m: target, depth } of all) {
    if (target.id === id || isSelfOrDescendant(node, target.id)) continue;
    html += `<div class="kind-list-item" style="padding-left:${10 + depth * 14}px" onclick="moveModuleTo(${id},${target.id})"><span class="kli-name">${x(target.name)}</span></div>`;
  }
  return html || `<div class="kind-list-item" style="opacity:.6;pointer-events:none"><span class="kli-name">${x(t('moveToNoTargets'))}</span></div>`;
}
async function moveModuleTo(id, newParentId) {
  closeAllPopups();
  if (!S.nexus) return;
  const siblings = (newParentId == null ? S.moduleTree : findModuleNode(newParentId)?.children || [])
    .map(m => m.id).filter(mid => mid !== id);
  siblings.push(id);
  await api.module.move(S.nexus.id, id, newParentId, siblings);
  await reloadModuleTree();
}
async function duplicateModuleNode(id) {
  await api.module.duplicate(id);
  await reloadModuleTree();
  toast(t('duplicated'), 'ok');
}

function openNavSidebarContextMenu(ev) {
  ev.preventDefault();
  closeAllPopups();
  S.ctxMenuPos = { x: ev.clientX, y: ev.clientY };
  const pop = document.createElement('div');
  pop.className = 'kind-popup context-menu-popup nav-pin-popup';
  pop.innerHTML = buildNavPinListHtml();
  document.body.appendChild(pop);
  pop.addEventListener('click', e => e.stopPropagation());
  positionPopupNear(pop, ctxAnchor(ev).getBoundingClientRect());
}
function buildNavPinListHtml() {
  if (!S.moduleTree.length) return `<div class="kind-list-item" style="opacity:.6;pointer-events:none"><span class="kli-name">${x(t('nestEmpty'))}</span></div>`;
  return S.moduleTree.map(m => `
    <div class="kind-list-item" onclick="toggleNavPinAndRefresh(${m.id})">
      <span class="kicon" style="color:${x(m.icon_color_code || m.color_code || '#6366f1')}">${moduleIconHtml(m)}</span>
      <span class="kli-name">${x(m.name)}</span>
      <span class="ctx-check">${m.pinned ? '✓' : ''}</span>
    </div>`).join('');
}
async function toggleNavPinAndRefresh(id) {
  const m = findModuleNode(id);
  if (!m) return;
  await api.module.update(id, { pinned: m.pinned ? 0 : 1 });
  await reloadModuleTree();
  const pop = document.querySelector('.nav-pin-popup');
  if (pop) pop.innerHTML = buildNavPinListHtml();
}

// Nexus Nest display options popup (Plan part1 #2) — 4 toggles driven by
// S.settings, same .kind-popup + positionPopupNear idiom as every other
// popup in this file.
function openNestOptionsPopup(anchor) {
  closeAllPopups();
  if (!anchor) return;
  const pop = document.createElement('div');
  pop.className = 'kind-popup nest-options-popup';
  pop.innerHTML = buildNestOptionsPopupHtml();
  document.body.appendChild(pop);
  pop.addEventListener('click', e => e.stopPropagation());
  positionPopupNear(pop, anchor.getBoundingClientRect());
}
function buildNestOptionsPopupHtml() {
  const s = S.settings;
  const row = (onclick, on, labelKey) =>
    `<div class="togglerow nest-opt-row" onclick="${onclick}"><span class="tg${on ? ' on' : ''}"></span>${t(labelKey)}</div>`;
  return [
    row("toggleNestOption('nestShowItems')", s.nestShowItems !== false, 'nestOptShowItems'),
    row("toggleNestOption('nestShowMajorIcon')", s.nestShowMajorIcon !== false, 'nestOptShowMajorIcon'),
    row("toggleNestOption('nestShowMinorIcon')", !!s.nestShowMinorIcon, 'nestOptShowMinorIcon'),
    row('toggleNestSignatureMode()', s.nestSignatureMode === 'icon', 'nestOptSignatureIcon'),
  ].join('');
}

// ═══ Kind-picker popup — instant create ════════════════════════════════
function openKindPopup(parentId, anchor) {
  closeAllPopups();
  if (!anchor) return;
  const pop = document.createElement('div');
  pop.className = 'kind-popup kind-list-popup';
  pop.innerHTML = buildKindListHtml(parentId);
  document.body.appendChild(pop);
  pop.addEventListener('click', e => e.stopPropagation());
  positionPopupNear(pop, anchor.getBoundingClientRect());
}

function buildKindListHtml(parentId, excludeCollector = false) {
  // Plan part2 #1: Artisan's create-wizard ("start from template") only
  // ever builds a top-level Manager (parent_id always null) — only offer it
  // where a brand-new top-level module is being created, never on a Minor-
  // create popup or the module context-menu's "Create" submenu (both
  // always pass a real parentId).
  let html = '';
  if (parentId == null) {
    html += `<div class="kind-list-item" onclick="openArtisanTemplateList(this)">
      <span class="kicon" style="color:${x(KIND_COLOR.manager)}">${I.artisan}</span>
      <span class="kli-text"><span class="kli-name">${t('artStartTemplate')}</span><span class="kli-desc">${t('artV3CardD')}</span></span>
    </div><div class="ctx-sep"></div>`;
  }
  html += MODULE_KINDS.filter(k => !(excludeCollector && k === 'collector')).map(k => `
    <div class="kind-list-item" onclick="quickCreateModule('${k}',${parentId ?? 'null'})">
      <span class="kicon" style="color:${x(KIND_COLOR[k])}">${I[KIND_ICON[k]]}</span>
      <span class="kli-text"><span class="kli-name">${x(kindLabel(k))}</span><span class="kli-desc">${t(KIND_DESC_KEY[k])}</span></span>
    </div>`).join('');
  return html;
}

// Swaps the same popup's content to the 4 template targets (same swap-
// innerHTML idiom as buildCatTypeListHtml below) — artisan.js isn't in
// index.html's eager <script> list, so it needs a lazy-load before its
// startArtisanWizard/ARTISAN_TARGETS-consuming markup can run.
async function openArtisanTemplateList(anchor) {
  const pop = document.querySelector('.kind-popup');
  if (!pop) return;
  await loadModule('src/renderer/artisan.js');
  pop.innerHTML = buildArtisanTemplateListHtml();
}
function buildArtisanTemplateListHtml() {
  return ARTISAN_TARGETS.map(tg => `
    <div class="kind-list-item" onclick="closeAllPopups();startArtisanWizard('${tg.id}')">
      <span class="kicon">${I[tg.icon]}</span>
      <span class="kli-text"><span class="kli-name">${t(tg.labelKey)}</span></span>
    </div>`).join('');
}

// Classifier needs one more decision (cat_type) before it can be created —
// swap the popup's content to those 3 cards instead of a second popup, so
// there's still only ever one `.kind-popup` open at a time.
function buildCatTypeListHtml(parentId) {
  const types = [
    ['object', I.layer, 'catTypeObject', 'catTypeObjectDesc'],
    ['element', I.relation, 'catTypeElement', 'catTypeElementDesc'],
    ['character', I.person, 'catTypeCharacter', 'catTypeCharacterDesc'],
  ];
  return types.map(([ct, icon, labelKey, descKey]) => `
    <div class="kind-list-item" onclick="quickCreateModule('classifier',${parentId ?? 'null'},'${ct}')">
      <span class="kicon">${icon}</span>
      <span class="kli-text"><span class="kli-name">${t(labelKey)}</span><span class="kli-desc">${t(descKey)}</span></span>
    </div>`).join('');
}

async function quickCreateModule(kind, parentId, catType) {
  const pop = document.querySelector('.kind-popup');
  if (kind === 'classifier' && !catType) {
    if (pop) pop.innerHTML = buildCatTypeListHtml(parentId);
    return;
  }
  const name = t('newModuleName').replace('{kind}', kindLabel(kind));
  const moduleId = await api.module.create({
    nexus_ref: S.nexus.id, parent_id: parentId, name, kind,
    color: null, icon_color: null, icon: null,
    cat_type: kind === 'classifier' ? catType : null,
  });
  closeAllPopups();
  if (parentId != null) S.moduleCollapsed.delete(parentId);
  await reloadModuleTree();
  S.renamingModuleId = moduleId;
  const created = findModuleNode(moduleId);
  if (created && created.kind !== 'collector') await openModuleNode(moduleId);
  else renderNexusHome();
  focusRenameInput(moduleId);
}

// ═══ Inline rename — Nest row + module detail header share one flag ════
function startRenameModule(id) {
  S.renamingModuleId = id;
  renderNexusHome();
  focusRenameInput(id);
}

// Waits for the rename <input> to land in the DOM after a re-render, then
// focuses it and selects the whole guideword/name so typing replaces it
// immediately — shared by both the dblclick-to-rename and just-created
// module paths.
function focusRenameInput(id) {
  setTimeout(() => {
    const el = q(S.activeModuleNode?.id === id ? `#rename-head-${id}` : `#rename-nest-${id}`);
    el?.focus(); el?.select();
  }, 30);
}

async function saveModuleRename(id, value) {
  const name = value.trim();
  const m = findModuleNode(id);
  if (name && m && name !== m.name) await api.module.update(id, { name });
  S.renamingModuleId = null;
  await reloadModuleTree();
}

async function toggleModulePin(id) {
  const m = findModuleNode(id);
  if (!m) return;
  await api.module.update(id, { pinned: m.pinned ? 0 : 1 });
  await reloadModuleTree();
}

// ═══ Icon/color quick-popup — live-saves on every pick ═════════════════
async function openModuleIconPopup(id, anchor) {
  closeAllPopups();
  const m = findModuleNode(id);
  if (!m || !anchor) return;
  const pop = document.createElement('div');
  pop.className = 'kind-popup icon-edit-popup';
  pop.innerHTML = await iconPicker(m.icon || null, m.color || null, m.name, kindLabel(m.kind));
  document.body.appendChild(pop);
  pop.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target.closest('.ipk-cell') || e.target.closest('.cswatch')) saveModuleIconLive(id);
  });
  positionPopupNear(pop, anchor.getBoundingClientRect());
}

async function saveModuleIconLive(id) {
  const icon = getIconPickerValue() || null;
  const color = q('#sel-color')?.value || null;
  await api.module.update(id, { icon, color, icon_color: color });
  await reloadModuleTree();
}

function buildCatTypePicker(selected) {
  const sel = selected || 'object';
  return `<div class="fg" id="mm-cattype-section">
    <label>${t('catTypeLabel')}</label>
    <div class="typegrid">
      <div class="typecard${sel === 'object' ? ' sel' : ''}" onclick="pickCatType('object')">
        <h5>${I.layer} ${t('catTypeObject')}</h5><p>${t('catTypeObjectDesc')}</p>
      </div>
      <div class="typecard${sel === 'element' ? ' sel' : ''}" onclick="pickCatType('element')">
        <h5>${I.relation} ${t('catTypeElement')}</h5><p>${t('catTypeElementDesc')}</p>
        <div class="togglerow"><span class="tg on"></span>${t('levelable')}</div>
        <div class="togglerow"><span class="tg"></span>${t('condition')}</div>
      </div>
      <div class="typecard${sel === 'character' ? ' sel' : ''}" onclick="pickCatType('character')">
        <h5>${I.person} ${t('catTypeCharacter')}</h5><p>${t('catTypeCharacterDesc')}</p>
      </div>
    </div>
    <input type="hidden" id="mm-cattype" value="${sel}">
  </div>`;
}

function pickCatType(type) {
  q('#mm-cattype').value = type;
  const cards = document.querySelectorAll('#mm-cattype-section .typecard');
  ['object', 'element', 'character'].forEach((k, i) => cards[i]?.classList.toggle('sel', k === type));
}

// Edit-modal kind display: read-only, one card, since kind can't change
// post-creation (db/module.js has no kind-migration path — quickCreateModule
// is the only place a kind is ever chosen, via the popup card list below).
function buildKindPicker(kind) {
  return `<div class="fg">
    <label>${t('moduleKind')}</label>
    <div class="typegrid kindgrid locked">
      <div class="typecard kindcard sel">
        <h5 style="color:${x(KIND_COLOR[kind])}">${I[KIND_ICON[kind]]} ${x(kindLabel(kind))}</h5>
        <p>${t(KIND_DESC_KEY[kind])}</p>
      </div>
    </div>
    <input type="hidden" id="mm-kind" value="${kind}">
  </div>`;
}

// Edit-only now — creation is instant via the kind-popup (openKindPopup/
// quickCreateModule below); "start from template" never belonged here, it's
// Artisan's own artisanV3Spec/startArtisanWizard flow (src/renderer/artisan.js).
async function moduleFormModal(existing) {
  const isClassifier = existing.kind === 'classifier';
  openModal(t('moduleEdit'), `
    <div class="mm-section-label">${t('moduleIdentitySection')}</div>
    <div class="fg"><label>${t('name')} *</label><input id="mm-name" value="${x(existing.name || '')}"></div>
    ${buildKindPicker(existing.kind)}
    <div class="fg"><label>${t('iconCollection')}</label>${await iconPicker(existing.icon || null, existing.color || null, existing.name || '', kindLabel(existing.kind))}</div>
    ${isClassifier ? '<div class="ctx-sep"></div>' : ''}
    <div id="mm-cattype-wrap" style="display:${isClassifier ? '' : 'none'}">${buildCatTypePicker(existing.cat_type)}</div>
    <div class="mfoot">
      <button class="btn btn-d" onclick="deleteModuleNode(${existing.id})">${t('delete')}</button>
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitModuleForm(${existing.id})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#mm-name').focus(), 60);
}

async function submitModuleForm(existingId) {
  const name = q('#mm-name').value.trim();
  if (!name) return;
  const kind = q('#mm-kind').value;
  const colorId = q('#sel-color').value || null;
  const icon = getIconPickerValue() || null;
  await api.module.update(existingId, { name, color: colorId, icon_color: colorId, icon });
  if (kind === 'classifier') await api.classifier.setCatType(existingId, q('#mm-cattype')?.value || 'object');
  closeModal();
  await reloadModuleTree();
  toast(t('saved'), 'ok');
}

async function deleteModuleNode(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.module.delete(id);
  closeModal();
  if (S.activeModuleNode?.id === id) S.activeModuleNode = null;
  await reloadModuleTree();
  toast(t('deleted'), 'ok');
}

// A Nest row's single click (open) and its name's double click (rename)
// are the same physical gesture for their first ~250ms — a dblclick is
// preceded by two ordinary 'click' events, so opening the module
// immediately on click would fire (and flash the module open) before the
// browser even recognizes the dblclick. Deferring the open lets the
// rename's dblclick handler cancel it first (Plan part1 #5 — this was the
// "click meant for the rename box lands on the module's body button" bug:
// the leaked open made startRenameModule think the module was already
// active and focus the header's rename box instead of the Nest row's).
let _rowOpenTimer = null;
function scheduleRowOpen(id) {
  clearTimeout(_rowOpenTimer);
  _rowOpenTimer = setTimeout(() => { _rowOpenTimer = null; openModuleNode(id); }, 250);
}
function cancelRowOpen() {
  clearTimeout(_rowOpenTimer);
  _rowOpenTimer = null;
}

// ═══ Open a module — minimal placeholder content + the Module Inspector
// dock (Phase 4); the real per-kind renderers (Table/Canvas/Editor/...)
// are Phases 5-16 ═══════════════════════════════════════════════════
async function openModuleNode(id) {
  const m = findModuleNode(id);
  if (!m) return;
  if (m.kind === 'collector') { if (m.parent_id == null) toggleMajorExpand(id); return; }
  S.activeModuleNode = m;
  S.activeItemNode = null;
  S.kindBrowserPage = false;
  upsertModuleTab(id);
  updateStatusBar({ item: null, words: null, saveState: null });
  renderModuleRail();
  renderNexusHome();
  const loaders = [loadInspectorData(id)];
  if (m.kind === 'classifier' && typeof loadClassifierData === 'function') loaders.push(loadClassifierData(m));
  if (m.kind === 'manager' && typeof loadManagerData === 'function') loaders.push(loadManagerData(m));
  if (m.kind === 'locator' && typeof loadLocatorData === 'function') loaders.push(loadLocatorData(m));
  if (m.kind === 'chronicler' && typeof loadChroniclerData === 'function') loaders.push(loadChroniclerData(m));
  if (m.kind === 'wanderer' && typeof loadWandererData === 'function') loaders.push(loadWandererData(m));
  if (m.kind === 'narrator' && typeof loadNarratorData === 'function') loaders.push(loadNarratorData(m));
  if (m.kind === 'author' && typeof loadAuthorData === 'function') loaders.push(loadAuthorData(m));
  if (m.kind === 'scribe' && typeof loadChatScribeData === 'function') loaders.push(loadChatScribeData(m));
  if (m.kind === 'viewer' && typeof loadViewerData === 'function') loaders.push(loadViewerData(m));
  if (m.kind === 'connector' && typeof loadConnectorData === 'function') loaders.push(loadConnectorData(m));
  if (m.kind === 'sketcher' && typeof loadSketcherData === 'function') loaders.push(loadSketcherData(m));
  if (m.kind === 'designer' && typeof loadDesignerData === 'function') loaders.push(loadDesignerData(m));
  await Promise.all(loaders);
  if (S.activeModuleNode?.id === id) renderNexusHome();
}

// Kind -> its main-content builder, defined in src/renderer/mod/<kind>.js.
// Falls back to the generic placeholder for kinds without a real renderer yet.
const KIND_MAIN_BUILDER = {
  classifier: () => typeof buildClassifierMainHtml === 'function' && buildClassifierMainHtml,
  manager: () => typeof buildManagerMainHtml === 'function' && buildManagerMainHtml,
  inspector: () => typeof buildDetailMainHtml === 'function' && buildDetailMainHtml,
  locator: () => typeof buildLocatorMainHtml === 'function' && buildLocatorMainHtml,
  chronicler: () => typeof buildChroniclerMainHtml === 'function' && buildChroniclerMainHtml,
  wanderer: () => typeof buildWandererMainHtml === 'function' && buildWandererMainHtml,
  narrator: () => typeof buildNarratorMainHtml === 'function' && buildNarratorMainHtml,
  author: () => typeof buildAuthorMainHtml === 'function' && buildAuthorMainHtml,
  scribe: () => typeof buildChatScribeMainHtml === 'function' && buildChatScribeMainHtml,
  drafter: () => typeof buildDrafterMainHtml === 'function' && buildDrafterMainHtml,
  viewer: () => typeof buildViewerMainHtml === 'function' && buildViewerMainHtml,
  connector: () => typeof buildConnectorMainHtml === 'function' && buildConnectorMainHtml,
  sketcher: () => typeof buildSketcherMainHtml === 'function' && buildSketcherMainHtml,
  designer: () => typeof buildDesignerMainHtml === 'function' && buildDesignerMainHtml,
};

function buildModuleDetailHtml(m) {
  const col = m.icon_color_code || m.color_code || 'var(--accent)';
  const builder = KIND_MAIN_BUILDER[m.kind]?.();
  const mainHtml = builder ? builder(m) : `<div class="empty" style="margin-top:40px">
        <div class="ei" style="color:${x(col)}">${moduleIconHtml(m)}</div>
        <h3>${x(m.name)}</h3>
        <p>${x(kindLabel(m.kind))}</p>
      </div>`;
  // Header per the approved mockups: name + kind chip, then a chips row of
  // tag links and the 🔗 link-count chip (A.3 #1-2). Chip data comes from
  // the inspector load that openModuleNode already awaited.
  const d = (S.inspectorData && S.inspectorData.moduleId === m.id) ? S.inspectorData : null;
  const tagChips = (d?.tags || []).map(tg =>
    `<span class="htag" style="border-color:${x(tg.color_code || '#6366f1')};color:${x(tg.color_code || '#6366f1')}">#${x(tg.tag_name)}</span>`).join('');
  const linkCount = d ? (d.links.outgoing.length + d.links.backlinks.length) : 0;
  const linkChip = `<span class="htag lk" data-no-i18n title="${t('moduleLink')}">🔗 ${linkCount} links</span>`;
  const renamingHead = S.renamingModuleId === m.id;
  const nameHtml = renamingHead
    ? `<input id="rename-head-${m.id}" class="rename-input" style="font-size:1.15em" value="${x(m.name)}" onclick="event.stopPropagation()" onblur="saveModuleRename(${m.id},this.value)" onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape'){this.value=${x(JSON.stringify(m.name))};this.blur();}">`
    : `<span ondblclick="startRenameModule(${m.id})">${x(m.name)}</span>`;
  return `<div class="module-builder">
    <div class="module-main">
      <div class="detail-head module-head" style="border-left:4px solid ${x(col)};padding-left:12px">
        <h2 style="margin:0;font-size:1.15em;display:flex;align-items:center;gap:8px">
          <span class="kicon" style="color:${x(col)};cursor:pointer" onclick="event.stopPropagation();openModuleIconPopup(${m.id},this)">${moduleIconHtml(m)}</span>
          ${nameHtml}
          <span class="kind-chip" data-no-i18n>${x(kindLabel(m.kind))}${m.kind === 'classifier' && m.cat_type ? ` · ${m.cat_type.charAt(0).toUpperCase()}${m.cat_type.slice(1)}` : ''}</span>
        </h2>
        <div class="mtags">${tagChips}${linkChip}<button class="btn btn-g btn-i" onclick="openModuleTagPopup(${m.id}, this)" title="${t('tagLink')}">${I.plus}</button></div>
      </div>
      ${mainHtml}
    </div>
    <div id="inspector-resize" class="panel-resize-handle" onmousedown="startInspectorResize(event)" title="${t('resizePanel')}"></div>
    ${buildInspectorHtml(m)}
  </div>`;
}
