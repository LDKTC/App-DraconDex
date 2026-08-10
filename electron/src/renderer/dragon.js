'use strict';
// Dragon workspace style (Plan.md part2 #New Workspace, direction confirmed
// with the user as a "freeform spatial canvas") — the sandbox/expert
// layout: keeps Drake's normal nav-sidebar tools (import/export/hashtag/
// colors etc, per Plan.md's "show the usual tools" requirement) but
// replaces the left-panel Nest tree + split-pane Builder with one big
// draggable board.
// Modules become cards the user can freely arrange; opening a card's
// content reuses buildBuilderPageHtml()/KIND_MAIN_BUILDER exactly like
// Drake and Wyvern do — Dragon only owns how the tree gets BROWSED, never
// how a module's own content renders once opened.

const DRAGON_COL_W = 190, DRAGON_ROW_H = 120, DRAGON_COLS = 5, DRAGON_PAD = 40;

// ═══ Layout persistence — client-only (see Plan.md's Dragon section: a
// DB-backed position table like designer.js's own node table would be real
// schema work for something nobody asked to sync across devices; this is
// the deliberately lighter alternative, same localStorage tier as
// theme/areaScale). Keyed by nexus + the parent module currently being
// browsed, so positions at different Nest depths never collide. ═════════
function dragonParentKey() {
  return S.dragonBrowsePath.length ? String(S.dragonBrowsePath[S.dragonBrowsePath.length - 1]) : 'root';
}
function dragonLayoutFor(parentKey) {
  const nexusId = String(S.nexus.id);
  const byNexus = S.settings.dragonLayout[nexusId] || (S.settings.dragonLayout[nexusId] = {});
  return byNexus[parentKey] || (byNexus[parentKey] = {});
}
// Saved position if the user has dragged this card before; otherwise a
// deterministic grid slot so an untouched level isn't a pile at (0,0).
function dragonNodePosition(m, index, layout) {
  const saved = layout[m.id];
  if (saved) return saved;
  const col = index % DRAGON_COLS, row = Math.floor(index / DRAGON_COLS);
  return { x: DRAGON_PAD + col * DRAGON_COL_W, y: DRAGON_PAD + row * DRAGON_ROW_H };
}

// ═══ Drill-down state — identical shape/semantics to S.wyvernBrowsePath.
// Needed because collector-kind modules have no standalone detail page
// (hub/open.js's openModuleNode toggles the left-panel tree instead) and
// Dragon has no left-panel tree to expand them in — each level renders as
// its own freeform board instead of Wyvern's fixed card grid, which is
// what keeps this from just being Wyvern with drag added. ═══════════════
function dragonBrowseCurrentList() {
  if (!S.dragonBrowsePath.length) return S.moduleTree;
  const parent = findModuleNode(S.dragonBrowsePath[S.dragonBrowsePath.length - 1]);
  return parent?.children || [];
}
function dragonBreadcrumbHtml() {
  const crumbs = [`<span class="wyvern-crumb" onclick="dragonDrillUp(-1)" data-no-i18n>${x(S.nexus.name)}</span>`];
  S.dragonBrowsePath.forEach((id, i) => {
    const m = findModuleNode(id);
    if (!m) return;
    crumbs.push(`<span class="wyvern-crumb" onclick="dragonDrillUp(${i})" data-no-i18n>${x(m.name)}</span>`);
  });
  return crumbs.join('<span class="wyvern-crumb-sep">›</span>');
}
function dragonDrillInto(id) {
  if (!findModuleNode(id)) return;
  S.dragonBrowsePath = [...S.dragonBrowsePath, id];
  renderNexusHome();
}
function dragonDrillUp(index) {
  S.dragonBrowsePath = index < 0 ? [] : S.dragonBrowsePath.slice(0, index + 1);
  renderNexusHome();
}

// ═══ Board ════════════════════════════════════════════════════════════
// Mutually exclusive with the board exactly like Wyvern's somethingOpen —
// same precedence chain, just named per-file since dragon.js has no other
// reason to share state with wyvern.js.
function dragonSomethingOpen() {
  return !!(S.activeItemNode || S.activeModuleNode || S.filePreview || S.sageHut || S.kindBrowserPage || S.importDockPage);
}
function buildDragonCanvasHtml() {
  const list = dragonBrowseCurrentList();
  const head = `<div class="detail-head module-head" style="border-left:4px solid var(--accent);padding-left:12px">
      <div class="wyvern-breadcrumb">${dragonBreadcrumbHtml()}</div>
    </div>`;
  if (!list.length) {
    return `${head}<div class="empty"><div class="ei">${I.layer}</div><h3>${t('nestEmpty')}</h3></div>`;
  }
  const layout = dragonLayoutFor(dragonParentKey());
  const positions = list.map((m, i) => dragonNodePosition(m, i, layout));
  const maxX = Math.max(DRAGON_PAD * 2 + DRAGON_COL_W, ...positions.map(p => p.x + DRAGON_COL_W));
  const maxY = Math.max(DRAGON_PAD * 2 + DRAGON_ROW_H, ...positions.map(p => p.y + DRAGON_ROW_H));
  const cards = list.map((m, i) => {
    const pos = positions[i];
    const hasChildren = !!(m.children && m.children.length);
    const canOpen = m.kind !== 'collector';
    return `<div class="typecard dragon-card" data-node="${m.id}" style="left:${pos.x}px;top:${pos.y}px" oncontextmenu="openModuleContextMenu(event,${m.id})">
      <h5 style="color:${x(m.icon_color_code || m.color_code || '#6366f1')}" data-no-i18n>${moduleIconHtml(m)} ${x(m.name)}</h5>
      <p data-no-i18n>${x(kindLabel(m.kind))}${hasChildren ? ` · ${m.children.length}` : ''}</p>
      ${hasChildren && canOpen ? `<button class="btn btn-s btn-sm" onclick="event.stopPropagation();openModuleNode(${m.id})">${t('open')}</button>` : ''}
    </div>`;
  }).join('');
  return `${head}<div id="dragon-board" class="dragon-board"><div id="dragon-stage" style="width:${maxX}px;height:${maxY}px;position:relative">${cards}</div></div>`;
}
// Attaches drag-to-arrange to each rendered card — mirrors mod/designer.js's
// existing pointerdown/pointermove/pointerup free-drag (moved-flag
// distinguishes a drag from a plain click) rather than reinventing it or
// reaching for HTML5 dragstart/drop, which doesn't suit arbitrary x/y.
function mountDragonBoard() {
  if (S.settings.workspaceStyle !== 'dragon' || dragonSomethingOpen()) return;
  const stage = q('#dragon-stage');
  if (!stage) return;
  const list = dragonBrowseCurrentList();
  const layout = dragonLayoutFor(dragonParentKey());
  stage.querySelectorAll('.dragon-card').forEach((el, i) => {
    const id = Number(el.dataset.node);
    const m = list.find(n => n.id === id);
    if (!m) return;
    el.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0 || ev.target.closest('button')) return;
      ev.preventDefault();
      try { el.setPointerCapture(ev.pointerId); } catch (_) {}
      const sx = ev.clientX, sy = ev.clientY;
      const start = dragonNodePosition(m, i, layout);
      const ox = start.x, oy = start.y;
      let moved = false;
      el.classList.add('dragging');
      const mv = (ev2) => {
        const dx = ev2.clientX - sx, dy = ev2.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        el.style.left = `${ox + dx}px`;
        el.style.top = `${oy + dy}px`;
      };
      const up = (ev2) => {
        el.removeEventListener('pointermove', mv);
        el.removeEventListener('pointerup', up);
        el.classList.remove('dragging');
        if (moved) {
          const dx = ev2.clientX - sx, dy = ev2.clientY - sy;
          layout[m.id] = { x: ox + dx, y: oy + dy };
          saveUiSettings();
        } else {
          const hasChildren = !!(m.children && m.children.length);
          const canOpen = m.kind !== 'collector';
          if (hasChildren || !canOpen) dragonDrillInto(m.id); else openModuleNode(m.id);
        }
      };
      el.addEventListener('pointermove', mv);
      el.addEventListener('pointerup', up);
    });
  });
}

// ═══ Home entry point (renderNexusHome's workspace-style branch) ════════
// Defers to the shared builder-page precedence chain whenever anything is
// open (a module/file/item/sagehut/kindBrowser/importDock page — all
// chrome-agnostic already); only the empty-state welcome fallback is
// replaced with Dragon's own board.
function buildDragonPageHtml() {
  return dragonSomethingOpen() ? buildBuilderPageHtml() : buildDragonCanvasHtml();
}
// No dedicated toolbar unlike renderWyvernHome() — Dragon keeps the normal
// nav-sidebar tools, it only replaces the left-panel tree/Builder panes.
function renderDragonHome() {
  S.view = 'nexus';
  S.activeModule = null;
  document.body.classList.toggle('renaming-lock', S.renamingModuleId != null);
  updateTopNavButton();
  q('#main-inner')?.classList.remove('relation-main');
  if (!S.nexus) {
    renderNexusPicker();
    if (S.nexuses.length) q('#main-inner').innerHTML = buildWyvernNexusPickerHtml();
    return;
  }
  renderBuilderPanes(buildDragonPageHtml, runBuilderMounts);
}
