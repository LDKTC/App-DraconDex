'use strict';
// ═══ BUILDER SHELL (progress.md Phase 19) ══════════════════════════════
// VS Code-style editor groups for the v3 builder (mockups 16/17): a
// recursive split tree (Plan part4 #2) of panes, each split either
// side-by-side or stacked, arbitrarily nestable via per-pane split/close
// buttons or the title-bar preset menu. Each pane carries its own tab row
// and a browser-style ◀/▶ history stack. Only the FOCUSED pane is
// re-rendered + mounted by renderNexusHome — unfocused panes keep their
// live DOM (listeners stay attached), with their element ids neutralized
// so the focused pane's `q('#…')` mounts never bind across panes.
// Clicking an unfocused pane focuses it first (its content re-renders
// fresh), exactly like clicking an inactive editor group.
//
// A "page" is one of: {kind:'module',id} · {kind:'file',id} ·
// {kind:'sagehut',tab}. Legacy Director/entity tabs stay in the slim
// #builder-tabs strip inline in the title bar (renderProjectTabs,
// core.js); the split-layout preset picker is its own title-bar button
// (#layout-menu-wrap, also core.js) driven by builderResetToPreset below.

// S.builder.panes stays a flat, index-based array — every tab-management
// function (drag/reorder, close, switch, pop-out) is keyed on that index
// and untouched by the layout rework below. S.builder.layoutTree is a
// SEPARATE recursive tree describing only the geometric arrangement: a
// leaf {type:'leaf', paneIndex} points into the flat array; a split
// {type:'split', dir:'h'|'v', ratio, id, a, b} nests two child nodes
// ('h' = side-by-side/columns, 'v' = stacked/rows). Keeping these two
// identity schemes independent means splitting/closing a pane never has
// to touch the tab-management code built in earlier passes.
function builderState() {
  if (!S.builder) S.builder = {
    focused: 0,
    panes: [builderNewPane()],
    layoutTree: { type: 'leaf', paneIndex: 0 },
  };
  return S.builder;
}
let builderNodeIdCounter = 0;
function builderNextNodeId() { return ++builderNodeIdCounter; }
const builderNewPane = () => ({ tabs: [], active: null, history: [], hIdx: -1 });

const builderPageKey = (ref) => !ref ? '' :
  ref.kind === 'module' ? `module:${ref.id}` :
  ref.kind === 'file' ? `file:${ref.id}` : `sagehut:${ref.tab}`;

function builderParseKey(key) {
  const [kind, v] = String(key).split(':');
  if (kind === 'module' || kind === 'file') return { kind, id: Number(v) };
  if (kind === 'sagehut') return { kind, tab: v };
  return null;
}

// ── Navigation bookkeeping (called from openModuleNode / openImportFile /
// openSageTab after they set the global page mirrors) ────────────────────
function builderNavigate(ref) {
  const b = builderState();
  const pane = b.panes[b.focused];
  const key = builderPageKey(ref);
  if (!pane.tabs.includes(key)) pane.tabs.push(key);
  pane.active = key;
  if (!S._builderNav && builderPageKey(pane.history[pane.hIdx]) !== key) {
    pane.history.splice(pane.hIdx + 1);
    pane.history.push(ref);
    pane.hIdx = pane.history.length - 1;
  }
}

async function builderOpenPage(ref) {
  if (!ref) {
    S.activeModuleNode = null; S.filePreview = null; S.sageHut = null;
    renderNexusHome();
    return;
  }
  if (ref.kind === 'module') await openModuleNode(ref.id);
  else if (ref.kind === 'file') await openImportFile(ref.id);
  else if (ref.kind === 'sagehut') await openSageTab(ref.tab);
}

async function builderBack() {
  const pane = builderState().panes[builderState().focused];
  if (pane.hIdx <= 0) return;
  pane.hIdx--;
  S._builderNav = true;
  try { await builderOpenPage(pane.history[pane.hIdx]); } finally { S._builderNav = false; }
}

async function builderForward() {
  const pane = builderState().panes[builderState().focused];
  if (pane.hIdx >= pane.history.length - 1) return;
  pane.hIdx++;
  S._builderNav = true;
  try { await builderOpenPage(pane.history[pane.hIdx]); } finally { S._builderNav = false; }
}

// ── Layout tree helpers (Plan part4 #2) ─────────────────────────────────
function builderFindLeaf(node, paneIndex) {
  if (node.type === 'leaf') return node.paneIndex === paneIndex ? node : null;
  return builderFindLeaf(node.a, paneIndex) || builderFindLeaf(node.b, paneIndex);
}
function builderFindLeafWithParent(node, paneIndex, parent, key) {
  if (node.type === 'leaf') return node.paneIndex === paneIndex ? { node, parent, key } : null;
  return builderFindLeafWithParent(node.a, paneIndex, node, 'a') || builderFindLeafWithParent(node.b, paneIndex, node, 'b');
}
function builderFirstLeafIndex(node) { return node.type === 'leaf' ? node.paneIndex : builderFirstLeafIndex(node.a); }
function builderRenumberAfterRemoval(node, removedIndex) {
  if (node.type === 'leaf') { if (node.paneIndex > removedIndex) node.paneIndex--; return; }
  builderRenumberAfterRemoval(node.a, removedIndex); builderRenumberAfterRemoval(node.b, removedIndex);
}
function collectPaneIndices(node, acc = []) {
  if (node.type === 'leaf') { acc.push(node.paneIndex); return acc; }
  collectPaneIndices(node.a, acc); collectPaneIndices(node.b, acc); return acc;
}
function collectLiveIds(node, ids = new Set(), paneIdx = new Set()) {
  if (node.type === 'leaf') { paneIdx.add(node.paneIndex); return { ids, paneIdx }; }
  ids.add(node.id); collectLiveIds(node.a, ids, paneIdx); collectLiveIds(node.b, ids, paneIdx);
  return { ids, paneIdx };
}

// Object.assign alone would leave stale fields behind when a node's own
// `type` changes (e.g. a promoted leaf keeping its old split's `a`/`b`/
// `ratio`) — harmless today since every reader branches on `type` first,
// but a landmine for later code that doesn't. Clear the node's own keys
// before reassigning so its shape always matches its new `type` exactly.
function mutateNode(node, fields) {
  for (const k of Object.keys(node)) delete node[k];
  Object.assign(node, fields);
}

// Split a pane: mutate the found leaf IN PLACE into a split node whose two
// children are the old leaf and a brand-new pane — no parent/key
// bookkeeping needed since the leaf object's identity (and its parent's
// reference to it) never changes, only its own fields do.
function builderSplitPane(paneIndex, dir, newFirst = false) {
  const b = builderState();
  const leaf = builderFindLeaf(b.layoutTree, paneIndex);
  if (!leaf) return;
  const newIdx = b.panes.length;
  b.panes.push(builderNewPane());
  const orig = { type: 'leaf', paneIndex: leaf.paneIndex };
  const fresh = { type: 'leaf', paneIndex: newIdx };
  mutateNode(leaf, { type: 'split', dir, ratio: 0.5, id: builderNextNodeId(),
    a: newFirst ? fresh : orig, b: newFirst ? orig : fresh });
  b.focused = newIdx;
  renderProjectTabs();
  renderNexusHome();
  updateStatusBar({});
  return newIdx;
}

// Close/merge a pane: fold its tabs into the first leaf under its sibling
// (same "fold into survivor" convention the old builderSetLayout used),
// then promote the sibling by assigning its fields onto the PARENT node
// object in place — the grandparent's reference to `parent` stays valid,
// same in-place-mutation trick as the split above.
function builderClosePane(paneIndex) {
  const b = builderState();
  const found = builderFindLeafWithParent(b.layoutTree, paneIndex, null, null);
  if (!found || !found.parent) return; // can't close the only remaining pane
  const { parent, key } = found;
  const sibling = parent[key === 'a' ? 'b' : 'a'];
  const targetIdx = builderFirstLeafIndex(sibling);
  const closing = b.panes[paneIndex], target = b.panes[targetIdx];
  for (const tb of closing.tabs) if (!target.tabs.includes(tb)) target.tabs.push(tb);
  if (!target.active) target.active = closing.tabs[0] || null;
  mutateNode(parent, sibling);
  b.panes.splice(paneIndex, 1);
  builderRenumberAfterRemoval(b.layoutTree, paneIndex);
  b.focused = b.focused === paneIndex ? (targetIdx > paneIndex ? targetIdx - 1 : targetIdx) : (b.focused > paneIndex ? b.focused - 1 : b.focused);
  renderProjectTabs();
  renderNexusHome();
  updateStatusBar({});
}

// Named presets — folds all existing tabs into pane 0 (same convention as
// above), then rebuilds a fresh tree for the chosen shape. "3" defaults to
// long pane left, two short panes stacked right; mirrored/rotated variants
// are trivial to add later if wanted, not built speculatively now.
function builderResetToPreset(name) {
  const b = builderState();
  const survivor = b.panes[0] || builderNewPane();
  for (const p of b.panes.slice(1)) for (const tb of p.tabs) if (!survivor.tabs.includes(tb)) survivor.tabs.push(tb);
  if (name === '1') {
    b.panes = [survivor];
    b.layoutTree = { type: 'leaf', paneIndex: 0 };
  } else if (name === '2h' || name === '2v') {
    b.panes = [survivor, builderNewPane()];
    b.layoutTree = { type: 'split', dir: name === '2h' ? 'h' : 'v', ratio: 0.5, id: builderNextNodeId(),
      a: { type: 'leaf', paneIndex: 0 }, b: { type: 'leaf', paneIndex: 1 } };
  } else if (name === '3') {
    b.panes = [survivor, builderNewPane(), builderNewPane()];
    b.layoutTree = { type: 'split', dir: 'h', ratio: 0.5, id: builderNextNodeId(),
      a: { type: 'leaf', paneIndex: 0 },
      b: { type: 'split', dir: 'v', ratio: 0.5, id: builderNextNodeId(),
        a: { type: 'leaf', paneIndex: 1 }, b: { type: 'leaf', paneIndex: 2 } } };
  }
  b.focused = 0;
  renderProjectTabs();
  renderNexusHome();
  updateStatusBar({});
}

async function builderFocusPane(i, refToOpen = null) {
  const b = builderState();
  if (b.focused === i && !refToOpen) return;
  b.focused = i;
  const pane = b.panes[i];
  const ref = refToOpen || (pane.active ? builderParseKey(pane.active) : null);
  S._builderNav = !refToOpen; // plain focus restores without a history push
  try { await builderOpenPage(ref); } finally { S._builderNav = false; }
}

async function builderSwitchTab(paneIdx, key) {
  const b = builderState();
  b.focused = paneIdx;
  await builderOpenPage(builderParseKey(key));
}

async function builderCloseTab(paneIdx, key) {
  const b = builderState();
  const pane = b.panes[paneIdx];
  const idx = pane.tabs.indexOf(key);
  if (idx < 0) return;
  pane.tabs.splice(idx, 1);
  if (pane.active === key) {
    const next = pane.tabs[idx] ?? pane.tabs[idx - 1] ?? null;
    pane.active = next;
    if (b.focused === paneIdx) {
      await builderOpenPage(next ? builderParseKey(next) : null);
      return;
    }
  }
  renderNexusHome();
}

// ── Tab labels ──────────────────────────────────────────────────────────
function builderTabMeta(key) {
  const ref = builderParseKey(key);
  if (!ref) return null;
  if (ref.kind === 'module') {
    const m = findModuleNode(ref.id);
    if (!m) return null;
    return { name: m.name, badge: kindLabel(m.kind), color: m.color_code || 'var(--accent)' };
  }
  if (ref.kind === 'file') {
    const f = (S.importFiles || []).find(v => v.id === ref.id) || (S.filePreview?.id === ref.id ? S.filePreview : null);
    return { name: f ? f.file_name : `#${ref.id}`, badge: 'File', color: 'var(--accent)' };
  }
  const lbl = typeof SAGEHUT_VIEW_LABEL !== 'undefined' ? SAGEHUT_VIEW_LABEL[ref.tab] : ref.tab;
  return { name: `Sage Hut · ${lbl}`, badge: 'Sage', color: 'var(--accent)' };
}

// ═══ Module Inspector toggle (Plan part3 #3) ═══════════════════════════
// Persisted show/hide for the always-on-by-default `.module-inspector`
// dock — same persisted-flag + CSS-class pattern as the Hub's own
// left-panel toggle (LEFT_PANEL_COLLAPSED_KEY/applyLeftPanelState in
// core.js), just wired via inline onclick since this button lives inside
// builderPaneHeadHtml's re-rendered template rather than a static
// index.html element.
function toggleModuleInspector() {
  S.inspectorCollapsed = !S.inspectorCollapsed;
  localStorage.setItem(INSPECTOR_COLLAPSED_KEY, S.inspectorCollapsed ? '1' : '0');
  renderNexusHome(); // pure re-render from current S — no data refetch
}

// ═══ Rendering — recursive layout tree (Plan part4 #2) ═════════════════
// Hard rule carried over from the old fixed-grid renderer: NEVER
// innerHTML-wipe #main-inner — unfocused panes keep their live DOM
// (mounted editors, listeners) between renders. With arbitrary nesting, a
// pane can move to a different parent .bsplit across renders (a split or
// merge changes nesting depth) — appendChild(existingNode) MOVES an
// already-attached DOM node rather than destroying it, so reparenting a
// pane never tears down its live content.
function ensureNodeElement(node) {
  if (node.type === 'leaf') {
    let el = q(`#main-inner [data-pane="${node.paneIndex}"]`);
    if (!el) {
      el = document.createElement('div');
      el.className = 'bpane';
      el.dataset.pane = node.paneIndex;
      el.innerHTML = `<div class="bpane-head"></div><div class="bpane-body"></div>`;
      el.addEventListener('pointerdown', (ev) => {
        const idx = Number(el.dataset.pane);
        if (builderState().focused !== idx) { ev.stopPropagation(); builderFocusPane(idx); }
      }, true);
      const body = el.querySelector('.bpane-body');
      body.ondragover = (ev) => onBodyDragOver(ev, body);
      body.ondragleave = (ev) => onBodyDragLeave(ev, body);
      body.ondrop = (ev) => onBodyDrop(ev, Number(el.dataset.pane), body);
    }
    return el;
  }
  let el = q(`#main-inner [data-node-id="${node.id}"]`);
  if (!el) { el = document.createElement('div'); el.className = 'bsplit'; el.dataset.nodeId = node.id; }
  return el;
}

function applySplitGridTemplate(el, node) {
  el.style.gridTemplateColumns = node.dir === 'h' ? `${node.ratio}fr 5px ${1 - node.ratio}fr` : '1fr';
  el.style.gridTemplateRows = node.dir === 'v' ? `${node.ratio}fr 5px ${1 - node.ratio}fr` : '1fr';
}

function ensureSplitHandle(splitEl, node) {
  let h = splitEl.querySelector(':scope > .builder-resize-handle');
  if (!h) {
    h = document.createElement('div');
    h.className = `builder-resize-handle ${node.dir === 'h' ? 'col' : 'row'}`;
    h.title = t('resizePanel');
    splitEl.appendChild(h);
  }
  h.onmousedown = (ev) => startBuilderSplitResize(ev, node, splitEl); // reassigned each render — cheap, avoids listener buildup
  h.style.gridColumn = node.dir === 'h' ? '2' : '1';
  h.style.gridRow = node.dir === 'v' ? '2' : '1';
}

function renderLayoutNode(node, parentEl, dir, slot) {
  const el = ensureNodeElement(node);
  if (dir === 'h') { el.style.gridColumn = slot; el.style.gridRow = '1'; }
  else if (dir === 'v') { el.style.gridColumn = '1'; el.style.gridRow = slot; }
  else { el.style.gridColumn = '1'; el.style.gridRow = '1'; }
  parentEl.appendChild(el);
  if (node.type === 'split') {
    applySplitGridTemplate(el, node);
    ensureSplitHandle(el, node);
    renderLayoutNode(node.a, el, node.dir, '1');
    renderLayoutNode(node.b, el, node.dir, '3');
  }
}

function pruneStaleLayoutElements(tree) {
  const { ids, paneIdx } = collectLiveIds(tree);
  q('#main-inner')?.querySelectorAll('.bsplit[data-node-id]').forEach(el => { if (!ids.has(Number(el.dataset.nodeId))) el.remove(); });
  q('#main-inner')?.querySelectorAll('.bpane[data-pane]').forEach(el => { if (!paneIdx.has(Number(el.dataset.pane))) el.remove(); });
}

let builderSplitResizeState = null;
function startBuilderSplitResize(ev, node, splitEl) {
  if (ev.button !== 0) return;
  ev.preventDefault();
  builderSplitResizeState = { node, rect: splitEl.getBoundingClientRect() };
  ev.currentTarget.classList.add('is-resizing');
}
document.addEventListener('mousemove', (ev) => {
  if (!builderSplitResizeState) return;
  const { node, rect } = builderSplitResizeState;
  node.ratio = node.dir === 'h'
    ? Math.max(0.15, Math.min(0.85, (ev.clientX - rect.left) / rect.width))
    : Math.max(0.15, Math.min(0.85, (ev.clientY - rect.top) / rect.height));
  applySplitGridTemplate(q(`#main-inner [data-node-id="${node.id}"]`), node);
});
document.addEventListener('mouseup', () => {
  if (!builderSplitResizeState) return;
  builderSplitResizeState = null;
  document.querySelectorAll('.builder-resize-handle.is-resizing').forEach(el => el.classList.remove('is-resizing'));
});

// ── Rendering ───────────────────────────────────────────────────────────
// renderNexusHome delegates the whole main area here. contentHtml/mounts
// describe the focused pane's page (built from the S.* page mirrors).
function renderBuilderPanes(contentHtml, runMounts) {
  const b = builderState();
  const main = q('#main-inner');
  if (!main) return;
  main.classList.add('builder-grid');
  main.classList.toggle('builder-split', b.layoutTree.type === 'split');
  main.classList.toggle('inspector-collapsed', S.inspectorCollapsed);

  pruneStaleLayoutElements(b.layoutTree);
  renderLayoutNode(b.layoutTree, main, null, null);

  for (const idx of collectPaneIndices(b.layoutTree)) {
    const paneEl = q(`#main-inner [data-pane="${idx}"]`);
    const pane = b.panes[idx];
    const focused = idx === b.focused;
    paneEl.classList.toggle('focused', focused && b.layoutTree.type === 'split');
    paneEl.querySelector('.bpane-head').innerHTML = builderPaneHeadHtml(idx, pane, focused);
    if (focused) {
      paneEl.querySelector('.bpane-body').innerHTML = contentHtml();
    } else {
      // Was this pane's DOM lost (fresh grid after a legacy view)? Give it
      // a static render of its page so a split never shows a hole.
      const body = paneEl.querySelector('.bpane-body');
      if (!body.innerHTML.trim() && pane.active) {
        body.innerHTML = builderStaticPageHtml(builderParseKey(pane.active));
      }
      builderNeutralizeIds(paneEl);
    }
  }
  if (runMounts) runMounts();
}

function builderPaneHeadHtml(i, pane, focused) {
  const canBack = pane.hIdx > 0, canFwd = pane.hIdx < pane.history.length - 1;
  const nav = `
    <button class="btn btn-g btn-i bnav" ${canBack ? '' : 'disabled'} onclick="builderFocusPane(${i}).then(builderBack)" title="${t('navBack')}">◀</button>
    <button class="btn btn-g btn-i bnav" ${canFwd ? '' : 'disabled'} onclick="builderFocusPane(${i}).then(builderForward)" title="${t('navForward')}">▶</button>`;
  const tabs = pane.tabs.map(key => {
    const meta = builderTabMeta(key);
    if (!meta) return '';
    const active = key === pane.active;
    // Draggable target is a plain div, not a native form control — matches
    // the Nest tree row's own element choice for its draggable rows.
    return `<div class="project-tab module-tab ${active && focused ? 'active' : active ? 'pane-active' : ''}"
      draggable="true" ondragstart="onTabDragStart(event,${i},'${x(key)}')"
      ondragover="onTabDragOver(event,this)" ondragleave="onTabDragLeave(event,this)" ondrop="onTabDrop(event,${i},'${x(key)}',this)"
      ondragend="onTabDragEnd(event,${i},'${x(key)}')"
      onclick="builderSwitchTab(${i},'${x(key)}')" title="${x(meta.name)}">
      <span class="tab-dot" style="background:${x(meta.color)}"></span>
      <span class="tab-name">${x(meta.name)}</span>
      <span class="ek" data-no-i18n>${x(meta.badge)}</span>
      <span class="tab-close" onclick="event.stopPropagation();builderCloseTab(${i},'${x(key)}')" title="${t('closeTab')}">&times;</span>
    </div>`;
  }).join('');
  const isSplit = builderState().layoutTree.type === 'split';
  const inspectorToggle = !isSplit
    ? `<button class="btn btn-g btn-i bnav ${S.inspectorCollapsed ? '' : 'active'}" onclick="toggleModuleInspector()" title="${t('toggleInspector')}">${I.fields}</button>`
    : '';
  const splitBtns = `
    <button class="btn btn-g btn-i bnav" onclick="builderSplitPane(${i},'h')" title="${t('splitPane')}">◫</button>
    <button class="btn btn-g btn-i bnav" onclick="builderSplitPane(${i},'v')" title="${t('splitPane')}">⬓</button>
    ${isSplit ? `<button class="btn btn-g btn-i bnav" onclick="builderClosePane(${i})" title="${t('closePane')}">${I.close}</button>` : ''}`;
  return `${nav}<div class="bpane-tabs" ondragover="onTabStripDragOver(event,${i})" ondrop="onTabStripDrop(event,${i})">${tabs}</div>${inspectorToggle}${splitBtns}`;
}

// ═══ Tab drag-reorder / cross-pane move (Plan part3 #1) ═══════════════
// Same DnD cycle as onNestDragStart/onNestDragOver/onNestDrop (hub.js),
// adapted for a horizontal tab strip: only two drop zones (before/after —
// tabs don't nest), and a tab can land in any pane (cross-pane move). Tab
// order is pure UI-session state (S.builder.panes[i].tabs) — nothing to
// persist, unlike the Nest's module.move() DB write.
function onTabDragStart(ev, paneIdx, key) {
  S.dragTab = { key, paneIdx };
  ev.dataTransfer.effectAllowed = 'move';
  ev.stopPropagation();
}
function tabDropZone(ev, tabEl) {
  const r = tabEl.getBoundingClientRect();
  const frac = (ev.clientX - r.left) / r.width;
  return frac < 0.5 ? 'before' : 'after';
}
function onTabDragOver(ev, tabEl) {
  if (!S.dragTab) return;
  ev.preventDefault();
  ev.stopPropagation();
  tabEl.classList.remove('tab-drop-before', 'tab-drop-after');
  tabEl.classList.add(`tab-drop-${tabDropZone(ev, tabEl)}`);
}
function onTabDragLeave(ev, tabEl) {
  tabEl.classList.remove('tab-drop-before', 'tab-drop-after');
}
async function onTabDrop(ev, paneIdx, key, tabEl) {
  ev.preventDefault();
  ev.stopPropagation();
  tabEl.classList.remove('tab-drop-before', 'tab-drop-after');
  const drag = S.dragTab;
  S.dragTab = null;
  if (!drag || (drag.paneIdx === paneIdx && drag.key === key)) return; // dropped on itself
  await builderMoveTabTo(drag, paneIdx, key, tabDropZone(ev, tabEl));
}

// Fallback drop target: the `.bpane-tabs` strip itself, for dropping into
// an empty pane (nothing to drop "onto") or past the last tab. Per-tab
// handlers stopPropagation(), so this only fires on the strip's background.
function onTabStripDragOver(ev, paneIdx) {
  if (!S.dragTab) return;
  ev.preventDefault();
}
async function onTabStripDrop(ev, paneIdx) {
  ev.preventDefault();
  const drag = S.dragTab;
  S.dragTab = null;
  if (!drag) return;
  await builderMoveTabTo(drag, paneIdx, null, null); // no target key -> append to end
}

// Shared move: remove drag.key from its source pane, insert into dstPane
// at the position implied by targetKey/zone (append if targetKey is null).
// indexOf(targetKey) is looked up AFTER the source splice so same-pane
// reorders (srcPane === dstPane) get the correct post-removal index.
async function builderMoveTabTo(drag, paneIdx, targetKey, zone) {
  const b = builderState();
  const srcPane = b.panes[drag.paneIdx];
  const dstPane = b.panes[paneIdx];
  const srcIdx = srcPane.tabs.indexOf(drag.key);
  if (srcIdx < 0) return; // stale — dragged tab was closed mid-drag
  const crossPane = drag.paneIdx !== paneIdx;

  srcPane.tabs.splice(srcIdx, 1);
  let insAt = targetKey ? dstPane.tabs.indexOf(targetKey) : -1;
  if (insAt < 0) insAt = dstPane.tabs.length;
  else if (zone === 'after') insAt++;
  dstPane.tabs.splice(insAt, 0, drag.key);

  if (!crossPane) { renderNexusHome(); return; }

  // Cross-pane: same active-tab fallback builderCloseTab already uses.
  if (srcPane.active === drag.key) srcPane.active = srcPane.tabs[srcIdx] ?? srcPane.tabs[srcIdx - 1] ?? null;
  dstPane.active = drag.key;
  await builderFocusPane(paneIdx, builderParseKey(drag.key));
}

// ═══ Auto-split on drag-to-edge (Plan part4 #3) ════════════════════════
// Same clientX/clientY-vs-bounding-rect fraction technique tabDropZone and
// the split resize handles already use, extended to 2D: outer 25% bands on
// each side are "split here," the inner 50% is "drop into this pane"
// (today's tab-strip-drop behavior, now also reachable from the body).
const BODY_EDGE_FRAC = 0.25;
function bodyDropZone(ev, bodyEl) {
  const r = bodyEl.getBoundingClientRect();
  const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
  if (x < BODY_EDGE_FRAC) return 'left';
  if (x > 1 - BODY_EDGE_FRAC) return 'right';
  if (y < BODY_EDGE_FRAC) return 'top';
  if (y > 1 - BODY_EDGE_FRAC) return 'bottom';
  return 'center';
}
function onBodyDragOver(ev, bodyEl) {
  if (!S.dragTab) return;
  ev.preventDefault();
  ev.stopPropagation();
  bodyEl.classList.remove('drop-left', 'drop-right', 'drop-top', 'drop-bottom', 'drop-center');
  bodyEl.classList.add(`drop-${bodyDropZone(ev, bodyEl)}`);
}
function onBodyDragLeave(ev, bodyEl) {
  bodyEl.classList.remove('drop-left', 'drop-right', 'drop-top', 'drop-bottom', 'drop-center');
}
async function onBodyDrop(ev, targetPaneIdx, bodyEl) {
  const drag = S.dragTab;
  if (!drag) return; // nothing being dragged — let the grid-level fallback handle it
  ev.preventDefault();
  ev.stopPropagation();
  bodyEl.classList.remove('drop-left', 'drop-right', 'drop-top', 'drop-bottom', 'drop-center');
  S.dragTab = null;
  const zone = bodyDropZone(ev, bodyEl);
  if (zone === 'center') { await builderMoveTabTo(drag, targetPaneIdx, null, null); return; }
  const dir = (zone === 'left' || zone === 'right') ? 'h' : 'v';
  const newIdx = builderSplitPane(targetPaneIdx, dir, zone === 'left' || zone === 'top');
  await builderMoveTabTo(drag, newIdx, null, null);
}

// ═══ Pop-out to a free window (Plan part3 #2) ═════════════════════════
// Every successful drop (onTabDrop / onTabStripDrop) clears S.dragTab. If
// dragend fires and it's still set, nothing accepted the drop — either the
// user released outside #main-inner entirely (nav-sidebar, title bar,
// outside the OS window) or the whole drag was cancelled some other way
// (Escape mid-drag also lands here — a known, accepted ambiguity in the
// HTML5 DnD API, not distinguishable from a genuine miss).
async function onTabDragEnd(ev, paneIdx, key) {
  if (!S.dragTab) return; // a real drop already handled + cleared it
  S.dragTab = null;
  await builderPopOutTab(paneIdx, key);
}

async function builderPopOutTab(paneIdx, key) {
  await api.window.openBuilderTab(S.nexus.id, key);
  await builderCloseTab(paneIdx, key);
}

// Fallback for the builder grid itself: swallows a drop that missed every
// tab/tab-strip target but still landed somewhere inside #main-inner (e.g.
// a pane's content body) — treated as a no-op, NOT a pop-out. Only a drop
// that misses the whole grid reaches onTabDragEnd with S.dragTab still set.
// Bound once (see bindBuilderGridDrop, called from core.js's init()) since
// #main-inner is a persistent DOM node, never re-created by renderBuilderPanes.
function bindBuilderGridDrop() {
  const grid = q('#main-inner');
  if (!grid) return;
  grid.addEventListener('dragover', (ev) => { if (S.dragTab) ev.preventDefault(); });
  grid.addEventListener('drop', (ev) => {
    if (!S.dragTab) return;
    ev.preventDefault();
    S.dragTab = null;
  });
}

// Best-effort static content for a pane whose DOM was wiped (e.g. after a
// legacy view rewrote #main-inner). Interactions return when it's focused.
function builderStaticPageHtml(ref) {
  try {
    if (ref?.kind === 'module') {
      const m = findModuleNode(ref.id);
      if (m) return buildModuleDetailHtml(m);
    }
    if (ref?.kind === 'file' && S.filePreview?.id === ref.id) return buildFileViewerHtml();
    if (ref?.kind === 'sagehut' && S.sageHut) return buildSageHutHtml();
  } catch (_) {}
  return '';
}

function builderNeutralizeIds(paneEl) {
  paneEl.querySelectorAll('.bpane-body [id]').forEach(el => {
    el.dataset.bid = el.id;
    el.removeAttribute('id');
  });
}

// ── Focused-pane shortcuts (Ctrl+W close tab · Ctrl+Tab cycle) ──────────
async function builderCloseActiveTab() {
  const b = builderState();
  const pane = b.panes[b.focused];
  if (pane.active) await builderCloseTab(b.focused, pane.active);
}

async function builderCycleTab(dir) {
  const b = builderState();
  const pane = b.panes[b.focused];
  if (pane.tabs.length < 2) return;
  const cur = pane.tabs.indexOf(pane.active);
  const next = pane.tabs[(cur + dir + pane.tabs.length) % pane.tabs.length];
  await builderSwitchTab(b.focused, next);
}
