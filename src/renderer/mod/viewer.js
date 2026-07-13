'use strict';
// ═══ Analys "Viewer" (progress.md Phase 14) ════════════════════════════
// A read-only lens over a saved filter (mockups 14 / 32 / 33): the filter
// definition persists in module_ui key 'filterDef' and re-evaluates
// against api.viewer.index(nexus) on every open, so source-data edits
// show up automatically. Three views: Table · Cards · Board (grouped by
// source module, switchable to kind/tag). The filter editor modal here is
// shared with Relation "Connector" (mod/connector.js).

const VIEWER_VIEWS = ['table', 'cards', 'board'];
const VIEWER_VIEW_LABEL = { table: 'Table', cards: 'Cards', board: 'Board' };
// Locale-invariant kind badges, like KIND_LABEL (A.3 #7).
const VIEWER_ITEM_KINDS = ['object', 'event', 'dialogue', 'chapter', 'chat', 'module'];
const VIEWER_KIND_LABEL = { object: 'Object', event: 'Event', dialogue: 'Dialogue', chapter: 'Chapter', chat: 'Chat', module: 'Module' };

function parseFilterDef(ui) {
  let def = {};
  try { def = JSON.parse(ui.filterDef || '{}'); } catch (_) {}
  return {
    query: def.query || '',
    kinds: Array.isArray(def.kinds) ? def.kinds : [],
    moduleIds: Array.isArray(def.moduleIds) ? def.moduleIds : [],
    tag: def.tag || '',
  };
}

function applySavedFilter(items, def, selfModuleId) {
  const ql = def.query.trim().toLowerCase();
  const tag = def.tag.trim().replace(/^#/, '').toLowerCase();
  return items.filter(it => {
    if (it.key === `module_${selfModuleId}`) return false; // not itself
    if (def.kinds.length && !def.kinds.includes(it.kind)) return false;
    if (def.moduleIds.length && !def.moduleIds.includes(it.moduleId)) return false;
    if (tag && !(it.tags || []).some(tg => tg.toLowerCase() === tag)) return false;
    if (ql && !it.name.toLowerCase().includes(ql)) return false;
    return true;
  });
}

function filterChipsHtml(def) {
  const chips = [];
  if (def.kinds.length) chips.push(`${t('moduleKind')} = ${def.kinds.map(k => VIEWER_KIND_LABEL[k]).join(' + ')}`);
  if (def.tag) chips.push(`tag = #${def.tag.replace(/^#/, '')}`);
  if (def.moduleIds.length) chips.push(`module × ${def.moduleIds.length}`);
  if (def.query) chips.push(`"${def.query}"`);
  if (!chips.length) chips.push(t('filterAll'));
  return chips.map(c => `<span class="vw-chip">${x(c)}</span>`).join('');
}

const viewerTimeText = (it) => it.time && it.time.years != null
  ? fmtDate(it.time.day, it.time.month, it.time.years, it.time.hour, it.time.minute) : '';

async function loadViewerData(m) {
  const [items, ui] = await Promise.all([
    api.viewer.index(S.nexus.id),
    api.module.getUi(m.id),
  ]);
  const def = parseFilterDef(ui);
  const view = VIEWER_VIEWS.includes(ui.activeView) ? ui.activeView : 'table';
  S.viewerData = {
    moduleId: m.id, def, view,
    groupBy: ui.boardGroupBy || 'module',
    items: applySavedFilter(items, def, m.id),
  };
}

async function setViewerView(view) {
  const d = S.viewerData;
  d.view = view;
  await api.module.setUi(d.moduleId, 'activeView', view);
  if (S.inspectorData?.moduleId === d.moduleId) S.inspectorData.ui = { ...S.inspectorData.ui, activeView: view };
  renderNexusHome();
}

async function setViewerGroupBy(g) {
  const d = S.viewerData;
  d.groupBy = g;
  await api.module.setUi(d.moduleId, 'boardGroupBy', g);
  renderNexusHome();
}

function openViewerItem(key, moduleId) {
  // Keys without a wiki kind (tlev_/sdlg_) open their source module.
  if (/^(tlev|sdlg)_/.test(key)) openModuleNode(moduleId);
  else openEntityByKey(key);
}

function buildViewerMainHtml(m) {
  const d = (S.viewerData && S.viewerData.moduleId === m.id) ? S.viewerData : null;
  if (!d) return `<div class="empty" style="margin-top:40px"><div class="ei">${moduleIconHtml(m)}</div><h3>${x(m.name)}</h3></div>`;
  const viewBar = `<div class="viewbar">
    ${VIEWER_VIEWS.map(v => `<span class="vitem${v === d.view ? ' act' : ''}" onclick="setViewerView('${v}')" data-no-i18n>${VIEWER_VIEW_LABEL[v]}</span>`).join('')}
  </div>`;
  const toolbar = `<div class="classifier-toolbar">
    <span class="vw-filterlabel">Filter:</span>${filterChipsHtml(d.def)}
    <button class="btn btn-g btn-i" onclick="openSavedFilterModal('viewer')" title="${t('editFilter')}">${I.edit}</button>
    ${viewBar}
  </div>
  <div class="drafter-hint">${t('viewerHint')}</div>`;
  if (!d.items.length) {
    return `${toolbar}<div class="empty" style="margin-top:30px"><div class="ei">${moduleIconHtml(m)}</div>
      <h3>${x(m.name)}</h3><p>${t('noFilterResults')}</p></div>`;
  }
  let body;
  if (d.view === 'cards') body = buildViewerCardsHtml(d);
  else if (d.view === 'board') body = buildViewerBoardHtml(d);
  else body = buildViewerTableHtml(d);
  return toolbar + body;
}

// ── Table view (mockup 14) ──────────────────────────────────────────────
function buildViewerTableHtml(d) {
  const rows = d.items.map(it => `
    <tr onclick="openViewerItem('${x(it.key)}',${it.moduleId})">
      <td><span class="dot" style="background:${x(it.color || 'var(--accent)')}"></span> ${x(it.name)}</td>
      <td>${x(it.moduleName)}</td>
      <td data-no-i18n>${VIEWER_KIND_LABEL[it.kind] || it.kind}</td>
      <td data-no-i18n>${x(viewerTimeText(it))}</td>
      <td>${(it.tags || []).map(tg => `<span class="htag">#${x(tg)}</span>`).join(' ')}</td>
    </tr>`).join('');
  return `<table class="vw-table">
    <thead><tr><th>${t('name')}</th><th data-no-i18n>Module</th><th>${t('moduleKind')}</th><th>${t('timeLabel')}</th><th data-no-i18n>Tags</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── Cards view (mockup 32) ──────────────────────────────────────────────
function buildViewerCardsHtml(d) {
  return `<div class="vw-cards">${d.items.map(it => `
    <div class="vw-card" style="border-top:3px solid ${x(it.color || 'var(--accent)')}" onclick="openViewerItem('${x(it.key)}',${it.moduleId})">
      <div class="vw-card-head"><span class="vw-card-name">${x(it.name)}</span>
        <span class="vw-card-kind" data-no-i18n>${VIEWER_KIND_LABEL[it.kind] || it.kind}</span></div>
      <div class="vw-card-src" data-no-i18n>Module: ${x(it.moduleName)}</div>
      ${viewerTimeText(it) ? `<div class="vw-card-time" data-no-i18n>${x(viewerTimeText(it))}</div>` : ''}
      ${(it.tags || []).length ? `<div class="vw-card-tags">${it.tags.map(tg => `<span class="htag">#${x(tg)}</span>`).join(' ')}</div>` : ''}
    </div>`).join('')}</div>`;
}

// ── Board view (mockup 33): grouped columns ─────────────────────────────
function buildViewerBoardHtml(d) {
  const groups = new Map();
  for (const it of d.items) {
    let gk, gl;
    if (d.groupBy === 'kind') { gk = it.kind; gl = VIEWER_KIND_LABEL[it.kind] || it.kind; }
    else if (d.groupBy === 'tag') { gk = (it.tags || [])[0] || '—'; gl = gk === '—' ? '—' : `#${gk}`; }
    else { gk = `m${it.moduleId}`; gl = `${it.moduleName} (${kindLabel(it.moduleKind)})`; }
    if (!groups.has(gk)) groups.set(gk, { label: gl, items: [] });
    groups.get(gk).items.push(it);
  }
  const cols = [...groups.values()].map(g => `
    <div class="vw-col">
      <div class="vw-col-head" data-no-i18n><span>${x(g.label)}</span><span class="cnt">${g.items.length}</span></div>
      ${g.items.map(it => `
        <div class="vw-col-card" style="border-left:3px solid ${x(it.color || 'var(--accent)')}" onclick="openViewerItem('${x(it.key)}',${it.moduleId})">
          <div class="vw-card-name">${x(it.name)}</div>
          <div class="vw-card-src" data-no-i18n>${VIEWER_KIND_LABEL[it.kind] || it.kind}${viewerTimeText(it) ? ` · ${x(viewerTimeText(it))}` : ''}</div>
        </div>`).join('')}
    </div>`).join('');
  return `<div class="vw-board">${cols}</div>
    <div class="drafter-hint">${t('groupBy')}:
      <select class="vw-groupby" onchange="setViewerGroupBy(this.value)" data-no-i18n>
        ${['module', 'kind', 'tag'].map(g => `<option value="${g}" ${d.groupBy === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select></div>`;
}

// ── Saved-filter editor (shared with Connector) ─────────────────────────
function openSavedFilterModal(which) {
  const d = which === 'connector' ? S.connectorData : S.viewerData;
  const def = d.def;
  const mods = [];
  for (const mm of S.moduleTree) {
    mods.push(mm);
    for (const c of (mm.children || [])) mods.push(c);
  }
  openModal(t('editFilter'), `
    <div class="fg"><label>${t('search')}</label><input id="vf-query" value="${x(def.query)}"></div>
    <div class="fg"><label>${t('moduleKind')}</label>
      <div class="vw-kindchecks" data-no-i18n>${VIEWER_ITEM_KINDS.map(k => `
        <label class="vw-kc"><input type="checkbox" value="${k}" ${def.kinds.includes(k) ? 'checked' : ''}> ${VIEWER_KIND_LABEL[k]}</label>`).join('')}
      </div></div>
    <div class="fg"><label data-no-i18n>Module</label>
      <select id="vf-mods" multiple size="5">${mods.map(mm =>
        `<option value="${mm.id}" ${def.moduleIds.includes(mm.id) ? 'selected' : ''}>${x(mm.name)} (${kindLabel(mm.kind)})</option>`).join('')}
      </select></div>
    <div class="fg"><label data-no-i18n>Tag</label><input id="vf-tag" value="${x(def.tag)}" placeholder="#tag"></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitSavedFilter('${which}')">${t('save')}</button>
    </div>`);
}

async function submitSavedFilter(which) {
  const d = which === 'connector' ? S.connectorData : S.viewerData;
  const def = {
    query: q('#vf-query').value.trim(),
    kinds: [...document.querySelectorAll('.vw-kc input:checked')].map(el => el.value),
    moduleIds: [...q('#vf-mods').selectedOptions].map(o => Number(o.value)),
    tag: q('#vf-tag').value.trim(),
  };
  await api.module.setUi(d.moduleId, 'filterDef', JSON.stringify(def));
  closeModal();
  await openModuleNode(d.moduleId);
  toast(t('saved'), 'ok');
}
