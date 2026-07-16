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

// Selection made in the Icon Collection picker (Phase 5): `svg:<I-key>` or
// `sym:<glyph>`, stored verbatim in module.icon. Falls back to the kind's
// default icon when unset.
function moduleIconHtml(m) {
  if (m.icon) {
    if (m.icon.startsWith('sym:')) return `<span class="kicon-glyph">${x(m.icon.slice(4))}</span>`;
    if (m.icon.startsWith('img:')) return `<img src="${x(m.icon.slice(4))}" class="kicon-img-icon" alt="">`;
    const key = m.icon.startsWith('svg:') ? m.icon.slice(4) : m.icon;
    if (I[key]) return I[key];
  }
  return I[KIND_ICON[m.kind]] || I.layer;
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

// True if `targetId` is `node` itself or nested anywhere under it — used to
// block a drag-drop that would nest a module inside its own subtree.
function isSelfOrDescendant(node, targetId) {
  if (node.id === targetId) return true;
  return (node.children || []).some(c => isSelfOrDescendant(c, targetId));
}

async function reloadModuleTree() {
  S.moduleTree = S.nexus ? await api.module.getTree(S.nexus.id) : [];
  S.activeModuleNode = S.activeModuleNode ? findModuleNode(S.activeModuleNode.id) : null;
  // prune builder tabs pointing at deleted modules
  for (const pane of (S.builder?.panes || [])) {
    pane.tabs = pane.tabs.filter(k => !k.startsWith('module:') || !!findModuleNode(Number(k.slice(7))));
    if (pane.active && !pane.tabs.includes(pane.active)) pane.active = pane.tabs[0] || null;
  }
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
  let html = `<button class="nav-btn create module-rail-tool" title="${t('createMajorModule')}" onclick="event.stopPropagation();openMajorModuleModal(this)">${I.plus}</button>`;
  if (pinned.length) html += `<div class="rail-sep module-rail-tool"></div>`;
  for (const m of pinned) {
    const active = S.activeModuleNode?.id === m.id ? ' active' : '';
    const col = m.icon_color_code || m.color_code || '#6366f1';
    html += `<button class="nav-btn module-rail-item${active}" style="color:${x(col)}" title="${x(m.name)}" onclick="openModuleNode(${m.id})">
      ${moduleIconHtml(m)}<span class="mdot" style="background:${x(m.color_code || '#6366f1')}"></span>
    </button>`;
  }
  // Pinned Import Dock tool (mockup 01's pinned cluster) — jumps to the hub
  // section; the section's real content is Phase 18.
  html += `<div class="rail-sep module-rail-tool"></div>
    <button class="nav-btn module-rail-tool" title="${t('importDock')}" onclick="openImportDockSection()">${I.import}</button>`;
  anchor.insertAdjacentHTML('afterend', html);
}

function openImportDockSection() {
  setLeftPanelCollapsed(false);
  if (!S.hubOpen.dock) { S.hubOpen.dock = true; localStorage.setItem(HUB_OPEN_KEY, JSON.stringify(S.hubOpen)); }
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

function buildHubHtml() {
  // Director/Navigator/Hero/Writer migrated into Artisan (Phase 23): the
  // hub carries no legacy section anymore — the four legacy views stay
  // reachable from Artisan's sidebar until their data is migrated
  // (Phase 24).
  const sections = [
    { key: 'nest', html: buildAccSection('nest', t('nexusNest'), buildNestTreeHtml(),
        `<button class="btn btn-g btn-i" onclick="event.stopPropagation();openMajorModuleModal(this)" title="${t('createMajorModule')}">${I.plus}</button>`) },
    { key: 'sage', html: buildAccSection('sage', t('sageHut'), buildSageHutRows()) },
    { key: 'dock', html: buildAccSection('dock', t('importDock'),
        typeof buildImportDockRows === 'function' ? buildImportDockRows() : '',
        `<button class="btn btn-g btn-i" onclick="event.stopPropagation();importDockPickFolder()" title="${t('importFolder')}">${I.import}</button>`) },
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
  const chev = hasChildren
    ? `<svg class="icon tree-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" onclick="event.stopPropagation();toggleMajorExpand(${m.id})"><polyline points="${collapsed ? '9 18 15 12 9 6' : '6 9 12 15 18 9'}"/></svg>`
    : '';
  const grip = `<span class="grip">⠿</span>`;
  const openable = m.kind !== 'collector';
  const renaming = S.renamingModuleId === m.id;
  // IDE-style depth indentation (Plan part1 #4/#4-2) — capped visually past
  // a few levels so very deep nesting doesn't run the row text off-panel;
  // the tree itself still nests as deep as the drop rules allow.
  const indentCls = depth ? ` indent${Math.min(depth, 5)}` : '';
  const childrenHtml = (hasChildren && !collapsed) ? m.children.map(c => buildNestRow(c, depth + 1, m.id)).join('') : '';
  // draggable is on the whole row, not just the grip icon — the grip was
  // the only draggable="true" element before, but it's a ~10px target
  // that's invisible until hover, so a real drag started anywhere else on
  // the row (name, icon, background — what a user would actually grab)
  // silently did nothing. Off while renaming so dragging can't fight the
  // rename `<input>` for the mousedown (a draggable ancestor around a text
  // input makes placing the caret unreliable).
  return `<div class="li${indentCls}${sel}"
      draggable="${renaming ? 'false' : 'true'}" ondragstart="onNestDragStart(event,${m.id},${parentId ?? 'null'})"
      ondragover="onNestDragOver(event,this)" ondragleave="onNestDragLeave(event,this)" ondrop="onNestDrop(event,${m.id},${parentId ?? 'null'},this)"
      onclick="${renaming ? '' : `scheduleRowOpen(${m.id})`}" oncontextmenu="openModuleContextMenu(event,${m.id})">
    ${grip}${chev}
    <span class="kicon" style="color:${x(col)}" onclick="event.stopPropagation();openModuleIconPopup(${m.id},this)">${moduleIconHtml(m)}</span>
    ${renaming
      ? `<input id="rename-nest-${m.id}" class="rename-input" value="${x(m.name)}" onclick="event.stopPropagation()" onblur="saveModuleRename(${m.id},this.value)" onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape'){this.value=${x(JSON.stringify(m.name))};this.blur();}">`
      : `<span class="name" ondblclick="event.stopPropagation();cancelRowOpen();startRenameModule(${m.id})">${x(m.name)}</span>`}
    <span class="kind">${x(kindLabel(m.kind))}</span>
    <span class="acts">
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openMinorModuleModal(${m.id},this)" title="${t('addMinorModule')}">${I.plus}</button>
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openModuleEditModal(${m.id})" title="${t('moduleEdit')}">${I.edit}</button>
    </span>
  </div>${childrenHtml}`;
}

// ═══ Drag-reorder / reparent — any depth (Plan part1 #4/#4-2) ═════════
// Dropping on the top/bottom quarter of a row reorders the dragged module
// as that row's sibling there; the middle half nests it as that row's
// child instead. A top-level module can be dropped anywhere (reorder or
// nest); a module that already has a parent is locked to it — it can only
// reorder among its own siblings (top/bottom of a row sharing that same
// parent), never nest into a row or jump to a different parent.
function onNestDragStart(ev, id, parentId) {
  S.dragNest = { id, parentId };
  ev.dataTransfer.effectAllowed = 'move';
  ev.stopPropagation();
}
function nestDropZone(ev, row) {
  const r = row.getBoundingClientRect();
  const frac = (ev.clientY - r.top) / r.height;
  return frac < 0.25 ? 'before' : frac > 0.75 ? 'after' : 'in';
}
function onNestDragOver(ev, row) {
  if (!S.dragNest) return;
  ev.preventDefault();
  ev.stopPropagation();
  row.classList.remove('drop-before', 'drop-after', 'drop-in');
  row.classList.add(`drop-${nestDropZone(ev, row)}`);
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
  let zone = nestDropZone(ev, row);
  const isLockedToParent = drag.parentId != null;
  if (isLockedToParent) {
    if (targetParentId !== drag.parentId) return; // can't leave its parent
    if (zone === 'in') zone = 'after'; // and can't nest — reorder only
  }
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

function buildModuleContextMenuHtml(id, isMajor, pinned) {
  let html = '';
  if (isMajor) {
    html += buildKindListHtml(null);
    html += `<div class="ctx-sep"></div>
      <div class="kind-list-item" onclick="closeAllPopups();openMinorModuleModal(${id},ctxAnchor())"><span class="kli-name">${x(t('addMinorModule'))}</span></div>`;
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

function buildKindListHtml(parentId) {
  return MODULE_KINDS.map(k => `
    <div class="kind-list-item" onclick="quickCreateModule('${k}',${parentId ?? 'null'})">
      <span class="kicon" style="color:${x(KIND_COLOR[k])}">${I[KIND_ICON[k]]}</span>
      <span class="kli-text"><span class="kli-name">${x(kindLabel(k))}</span><span class="kli-desc">${t(KIND_DESC_KEY[k])}</span></span>
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
}

// ═══ Inline rename — Nest row + module detail header share one flag ════
function startRenameModule(id) {
  S.renamingModuleId = id;
  renderNexusHome();
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
  openModal(t('moduleEdit'), `
    <div class="fg"><label>${t('name')} *</label><input id="mm-name" value="${x(existing.name || '')}"></div>
    ${buildKindPicker(existing.kind)}
    <div id="mm-cattype-wrap" style="display:${existing.kind === 'classifier' ? '' : 'none'}">${buildCatTypePicker(existing.cat_type)}</div>
    <div class="fg"><label>${t('iconCollection')}</label>${await iconPicker(existing.icon || null, existing.color || null, existing.name || '', kindLabel(existing.kind))}</div>
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
        <div class="mtags">${tagChips}${linkChip}<button class="btn btn-g btn-i" onclick="openModuleTagModal(${m.id})" title="${t('tagLink')}">${I.plus}</button></div>
      </div>
      ${mainHtml}
    </div>
    ${buildInspectorHtml(m)}
  </div>`;
}
