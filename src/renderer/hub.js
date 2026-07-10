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

function findModuleNode(id) {
  for (const m of S.moduleTree) {
    if (m.id === id) return m;
    const c = (m.children || []).find(ch => ch.id === id);
    if (c) return c;
  }
  return null;
}

async function reloadModuleTree() {
  S.moduleTree = S.nexus ? await api.module.getTree(S.nexus.id) : [];
  S.activeModuleNode = S.activeModuleNode ? findModuleNode(S.activeModuleNode.id) : null;
  renderModuleRail();
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
  let html = `<button class="nav-btn module-rail-tool" title="${t('createMajorModule')}" onclick="openMajorModuleModal()">${I.plus}</button>`;
  if (S.moduleTree.length) html += `<div class="rail-sep module-rail-tool"></div>`;
  for (const m of S.moduleTree) {
    const active = S.activeModuleNode?.id === m.id ? ' active' : '';
    html += `<button class="nav-btn module-rail-item${active}" title="${x(m.name)}" onclick="openModuleNode(${m.id})">
      ${I[KIND_ICON[m.kind]] || I.layer}<span class="mdot" style="background:${x(m.color_code || '#6366f1')}"></span>
    </button>`;
  }
  anchor.insertAdjacentHTML('afterend', html);
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
  return `<div id="hub-body">
    ${buildAccSection('nest', t('nexusNest'), buildNestTreeHtml(),
      `<button class="btn btn-g btn-i" onclick="event.stopPropagation();openMajorModuleModal()" title="${t('createMajorModule')}">${I.plus}</button>`)}
    ${buildAccSection('sage', t('sageHut'), `<div class="li" onclick="selectModule('sage')">${I.sage}<span class="name">${t('sage')}</span></div>`)}
    ${buildAccSection('dock', t('importDock'), `<div class="empty" style="padding:24px 10px"><p>${t('importDockComingSoon')}</p></div>`)}
  </div>`;
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
  let html = '';
  for (const m of S.moduleTree) html += buildNestRow(m, 0) + buildNestChildren(m);
  return html;
}

function buildNestChildren(major) {
  if (!major.children?.length || S.moduleCollapsed.has(major.id)) return '';
  return major.children.map(c => buildNestRow(c, 1)).join('');
}

function buildNestRow(m, depth) {
  const sel = S.activeModuleNode?.id === m.id ? ' sel' : '';
  const col = m.icon_color_code || m.color_code || 'var(--accent)';
  const hasChildren = depth === 0 && m.children?.length;
  const chev = hasChildren
    ? `<svg class="icon tree-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" onclick="event.stopPropagation();toggleMajorExpand(${m.id})"><polyline points="${S.moduleCollapsed.has(m.id) ? '9 18 15 12 9 6' : '6 9 12 15 18 9'}"/></svg>`
    : '';
  const grip = depth === 0 ? `<span class="grip" draggable="true" ondragstart="onNestDragStart(event,${m.id})">⠿</span>` : '';
  const openable = m.kind !== 'collector';
  const rowClick = openable ? `openModuleNode(${m.id})` : (hasChildren ? `toggleMajorExpand(${m.id})` : '');
  return `<div class="li${depth ? ` indent${depth}` : ''}${sel}" ${depth === 0 ? `ondragover="onNestDragOver(event)" ondrop="onNestDrop(event,${m.id})"` : ''}
      onclick="${rowClick}">
    ${grip}${chev}
    <span class="kicon" style="color:${x(col)}">${I[KIND_ICON[m.kind]] || I.layer}</span>
    <span class="name">${x(m.name)}</span>
    <span class="kind">${x(KIND_LABEL[m.kind] || m.kind)}</span>
    <span class="acts">
      ${depth === 0 ? `<button class="btn btn-g btn-i" onclick="event.stopPropagation();openMinorModuleModal(${m.id})" title="${t('addMinorModule')}">${I.plus}</button>` : ''}
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openModuleEditModal(${m.id})" title="${t('moduleEdit')}">${I.edit}</button>
    </span>
  </div>`;
}

// ═══ Drag-reorder — Majors only (Phase 3) ═════════════════════════════
function onNestDragStart(ev, id) {
  S.dragMajorId = id;
  ev.dataTransfer.effectAllowed = 'move';
}
function onNestDragOver(ev) {
  if (S.dragMajorId != null) ev.preventDefault();
}
async function onNestDrop(ev, targetId) {
  ev.preventDefault();
  const dragId = S.dragMajorId;
  S.dragMajorId = null;
  if (dragId == null || dragId === targetId) return;
  const ids = S.moduleTree.map(m => m.id);
  const from = ids.indexOf(dragId);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0) return;
  ids.splice(from, 1);
  ids.splice(to, 0, dragId);
  await api.module.reorder(S.nexus.id, ids);
  await reloadModuleTree();
}

// ═══ Create / edit / delete (minimal form — the full Classifier wizard +
// Icon Collection picker is Phase 5) ═══════════════════════════════════
async function openMajorModuleModal() {
  if (!S.nexus) return;
  await moduleFormModal(null, null);
}
async function openMinorModuleModal(parentId) {
  if (!S.nexus) return;
  await moduleFormModal(null, parentId);
}
async function openModuleEditModal(id) {
  const m = findModuleNode(id);
  if (!m) return;
  await moduleFormModal(m, m.parent_id);
}

async function moduleFormModal(existing, parentId) {
  const kindOptions = MODULE_KINDS.map(k => `<option value="${k}" ${existing?.kind === k ? 'selected' : ''}>${KIND_LABEL[k]}</option>`).join('');
  const title = existing ? t('moduleEdit') : (parentId ? t('minorModuleNew') : t('majorModuleNew'));
  openModal(title, `
    <div class="fg"><label>${t('name')} *</label><input id="mm-name" value="${x(existing?.name || '')}"></div>
    <div class="fg"><label>${t('moduleKind')}</label><select id="mm-kind" ${existing ? 'disabled' : ''}>${kindOptions}</select></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(existing?.color || null)}</div>
    <div class="mfoot">
      ${existing ? `<button class="btn btn-d" onclick="deleteModuleNode(${existing.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitModuleForm(${existing ? existing.id : 'null'},${parentId ?? 'null'})">${existing ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#mm-name').focus(), 60);
}

async function submitModuleForm(existingId, parentId) {
  const name = q('#mm-name').value.trim();
  if (!name) return;
  const kind = q('#mm-kind').value;
  const colorId = q('#sel-color').value || null;
  if (existingId) {
    await api.module.update(existingId, { name, color: colorId, icon_color: colorId });
  } else {
    await api.module.create({ nexus_ref: S.nexus.id, parent_id: parentId, name, kind, color: colorId, icon_color: colorId });
  }
  closeModal();
  await reloadModuleTree();
  toast(existingId ? t('saved') : t('created'), 'ok');
}

async function deleteModuleNode(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.module.delete(id);
  closeModal();
  if (S.activeModuleNode?.id === id) S.activeModuleNode = null;
  await reloadModuleTree();
  toast(t('deleted'), 'ok');
}

// ═══ Open a module — minimal placeholder detail; the real per-kind
// renderers (Table/Canvas/Editor/...) are Phases 5-16 ═════════════════
function openModuleNode(id) {
  const m = findModuleNode(id);
  if (!m) return;
  if (m.kind === 'collector') { if (m.parent_id == null) toggleMajorExpand(id); return; }
  S.activeModuleNode = m;
  renderModuleRail();
  renderNexusHome();
}

function buildModuleDetailHtml(m) {
  const col = m.icon_color_code || m.color_code || 'var(--accent)';
  return `
    <div class="detail-head" style="border-left:4px solid ${x(col)};padding-left:12px">
      <h2 style="margin:0;font-size:1.1em">${x(m.name)} <span style="color:var(--t3);font-weight:400;font-size:.8em">· ${x(KIND_LABEL[m.kind] || m.kind)}</span></h2>
    </div>
    <div class="empty" style="margin-top:40px">
      <div class="ei" style="color:${x(col)}">${I[KIND_ICON[m.kind]] || I.layer}</div>
      <h3>${x(m.name)}</h3>
      <p>${x(KIND_LABEL[m.kind] || m.kind)}</p>
    </div>`;
}
