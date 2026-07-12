'use strict';
// ═══ BUILDER SHELL (progress.md Phase 19) ══════════════════════════════
// VS Code-style editor groups for the v3 builder (mockups 16/17): the
// main area is a grid of 1 / 2 (1×2) / 4 (2×2) panes; each pane carries
// its own tab row and a browser-style ◀/▶ history stack. Only the
// FOCUSED pane is re-rendered + mounted by renderNexusHome — unfocused
// panes keep their live DOM (listeners stay attached), with their element
// ids neutralized so the focused pane's `q('#…')` mounts never bind
// across panes. Clicking an unfocused pane focuses it first (its content
// re-renders fresh), exactly like clicking an inactive editor group.
//
// A "page" is one of: {kind:'module',id} · {kind:'file',id} ·
// {kind:'sagehut',tab}. Legacy Director/entity tabs stay in the slim
// global #builder-tabs strip (renderProjectTabs), which also hosts the
// split-layout buttons.

function builderState() {
  if (!S.builder) S.builder = { layout: 1, focused: 0, panes: [builderNewPane()] };
  return S.builder;
}
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

// ── Layout / focus ──────────────────────────────────────────────────────
function builderSetLayout(n) {
  const b = builderState();
  b.layout = n;
  while (b.panes.length < n) b.panes.push(builderNewPane());
  if (b.panes.length > n) {
    // fold surplus panes' tabs into the last surviving pane
    const keep = b.panes.slice(0, n);
    for (const extra of b.panes.slice(n)) {
      for (const tb of extra.tabs) if (!keep[n - 1].tabs.includes(tb)) keep[n - 1].tabs.push(tb);
    }
    b.panes = keep;
  }
  if (b.focused >= n) b.focused = n - 1;
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

// ── Rendering ───────────────────────────────────────────────────────────
// renderNexusHome delegates the whole main area here. contentHtml/mounts
// describe the focused pane's page (built from the S.* page mirrors).
function renderBuilderPanes(contentHtml, runMounts) {
  const b = builderState();
  const main = q('#main-inner');
  if (!main) return;
  main.classList.add('builder-grid');
  main.classList.remove('bl-1', 'bl-2', 'bl-4');
  main.classList.add(`bl-${b.layout}`);

  // Ensure persistent pane elements (never innerHTML-wipe #main-inner —
  // unfocused panes keep their live DOM between renders).
  let panes = [...main.querySelectorAll(':scope > .bpane')];
  if (panes.length !== b.layout) {
    main.innerHTML = '';
    panes = b.panes.map((_, i) => {
      const el = document.createElement('div');
      el.className = 'bpane';
      el.dataset.pane = i;
      el.innerHTML = `<div class="bpane-head"></div><div class="bpane-body"></div>`;
      el.addEventListener('pointerdown', (ev) => {
        if (builderState().focused !== Number(el.dataset.pane)) {
          ev.stopPropagation();
          builderFocusPane(Number(el.dataset.pane));
        }
      }, true);
      main.appendChild(el);
      return el;
    });
  }

  for (const [i, paneEl] of panes.entries()) {
    const pane = b.panes[i];
    const focused = i === b.focused;
    paneEl.classList.toggle('focused', focused && b.layout > 1);
    paneEl.querySelector('.bpane-head').innerHTML = builderPaneHeadHtml(i, pane, focused);
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
    return `<button class="project-tab module-tab ${active && focused ? 'active' : active ? 'pane-active' : ''}"
      onclick="builderSwitchTab(${i},'${x(key)}')" title="${x(meta.name)}">
      <span class="tab-dot" style="background:${x(meta.color)}"></span>
      <span class="tab-name">${x(meta.name)}</span>
      <span class="ek" data-no-i18n>${x(meta.badge)}</span>
      <span class="tab-close" onclick="event.stopPropagation();builderCloseTab(${i},'${x(key)}')" title="${t('closeTab')}">&times;</span>
    </button>`;
  }).join('');
  return `${nav}<div class="bpane-tabs">${tabs}</div>`;
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

// Split buttons for the global strip (rendered by renderProjectTabs).
function builderSplitButtonsHtml() {
  const layout = builderState().layout;
  return `<span class="bsplit" data-no-i18n title="${t('splitLayout')}">
    ${[1, 2, 4].map(n => `<button class="btn btn-g btn-i${layout === n ? ' act' : ''}" onclick="builderSetLayout(${n})">${n === 1 ? '▢' : n === 2 ? '◫' : '⊞'}</button>`).join('')}
  </span>`;
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
