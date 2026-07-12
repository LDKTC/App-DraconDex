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

// Selection made in the Icon Collection picker (Phase 5): `svg:<I-key>` or
// `sym:<glyph>`, stored verbatim in module.icon. Falls back to the kind's
// default icon when unset.
function moduleIconHtml(m) {
  if (m.icon) {
    if (m.icon.startsWith('sym:')) return `<span class="kicon-glyph">${x(m.icon.slice(4))}</span>`;
    const key = m.icon.startsWith('svg:') ? m.icon.slice(4) : m.icon;
    if (I[key]) return I[key];
  }
  return I[KIND_ICON[m.kind]] || I.layer;
}

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
  let html = `<button class="nav-btn create module-rail-tool" title="${t('createMajorModule')}" onclick="openMajorModuleModal()">${I.plus}</button>`;
  if (S.moduleTree.length) html += `<div class="rail-sep module-rail-tool"></div>`;
  for (const m of S.moduleTree) {
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
  return `<div id="hub-body">
    ${buildAccSection('nest', t('nexusNest'), buildNestTreeHtml(),
      `<button class="btn btn-g btn-i" onclick="event.stopPropagation();openMajorModuleModal()" title="${t('createMajorModule')}">${I.plus}</button>`)}
    ${buildAccSection('sage', t('sageHut'), buildSageHutRows())}
    ${buildAccSection('dock', t('importDock'),
      typeof buildImportDockRows === 'function' ? buildImportDockRows() : '',
      `<button class="btn btn-g btn-i" onclick="event.stopPropagation();importDockPickFolder()" title="${t('importFolder')}">${I.import}</button>`)}
  </div>`;
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
    <span class="kicon" style="color:${x(col)}">${moduleIconHtml(m)}</span>
    <span class="name">${x(m.name)}</span>
    <span class="kind">${x(kindLabel(m.kind))}</span>
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

function toggleClassifierFieldsVisibility() {
  const wrap = q('#mm-cattype-wrap');
  if (wrap) wrap.style.display = q('#mm-kind').value === 'classifier' ? '' : 'none';
}

async function moduleFormModal(existing, parentId) {
  const kindOptions = MODULE_KINDS.map(k => `<option value="${k}" ${existing?.kind === k ? 'selected' : ''}>${kindLabel(k)}</option>`).join('');
  const title = existing ? t('moduleEdit') : (parentId ? t('minorModuleNew') : t('majorModuleNew'));
  const startKind = existing?.kind || 'manager';
  openModal(title, `
    <div class="fg"><label>${t('name')} *</label><input id="mm-name" value="${x(existing?.name || '')}"></div>
    ${!existing && !parentId ? `<div class="fg"><label>${t('artStartTemplate')}</label>
      <select id="mm-template">
        <option value="">${t('artNoTemplate')}</option>
        ${['director','navigator','hero','writer'].map(tg => `<option value="${tg}">${t(tg)} — ${t('artV3Card')}</option>`).join('')}
      </select></div>` : ''}
    <div class="fg"><label>${t('moduleKind')}</label><select id="mm-kind" ${existing ? 'disabled' : ''} onchange="toggleClassifierFieldsVisibility()">${kindOptions}</select></div>
    <div id="mm-cattype-wrap" style="display:${startKind === 'classifier' ? '' : 'none'}">${buildCatTypePicker(existing?.cat_type)}</div>
    <div class="fg"><label>${t('iconCollection')}</label>${await iconPicker(existing?.icon || null, existing?.color || null, existing?.name || '', existing ? (kindLabel(existing.kind)) : '')}</div>
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
  // "เริ่มจาก template" (Phase 23): scaffold the whole Major/Minor set
  // through Artisan's v3 structure builder instead of one bare module.
  const tplTarget = q('#mm-template')?.value;
  if (!existingId && !parentId && tplTarget) {
    if (typeof artisanV3Spec !== 'function') await loadModule('src/renderer/artisan.js');
    const res = await api.artisan.createV3(S.nexus.id, artisanV3Spec(tplTarget, name, q('#sel-color').value || null));
    closeModal();
    await reloadModuleTree();
    toast(t('artisanCreated'), 'ok');
    if (res?.id) openModuleNode(res.id);
    return;
  }
  const kind = q('#mm-kind').value;
  const colorId = q('#sel-color').value || null;
  const icon = getIconPickerValue() || null;
  const catType = kind === 'classifier' ? (q('#mm-cattype')?.value || 'object') : null;
  let moduleId = existingId;
  if (existingId) {
    await api.module.update(existingId, { name, color: colorId, icon_color: colorId, icon });
    if (kind === 'classifier') await api.classifier.setCatType(existingId, catType);
  } else {
    moduleId = await api.module.create({ nexus_ref: S.nexus.id, parent_id: parentId, name, kind, color: colorId, icon_color: colorId, icon, cat_type: catType });
  }
  closeModal();
  await reloadModuleTree();
  toast(existingId ? t('saved') : t('created'), 'ok');
  if (!existingId) openModuleNode(moduleId);
}

async function deleteModuleNode(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.module.delete(id);
  closeModal();
  if (S.activeModuleNode?.id === id) S.activeModuleNode = null;
  await reloadModuleTree();
  toast(t('deleted'), 'ok');
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
  return `<div class="module-builder">
    <div class="module-main">
      <div class="detail-head module-head" style="border-left:4px solid ${x(col)};padding-left:12px">
        <h2 style="margin:0;font-size:1.15em">${x(m.name)} <span class="kind-chip" data-no-i18n>${x(kindLabel(m.kind))}${m.kind === 'classifier' && m.cat_type ? ` · ${m.cat_type.charAt(0).toUpperCase()}${m.cat_type.slice(1)}` : ''}</span></h2>
        <div class="mtags">${tagChips}${linkChip}<button class="btn btn-g btn-i" onclick="openModuleTagModal(${m.id})" title="${t('tagLink')}">${I.plus}</button></div>
      </div>
      ${mainHtml}
    </div>
    ${buildInspectorHtml(m)}
  </div>`;
}
