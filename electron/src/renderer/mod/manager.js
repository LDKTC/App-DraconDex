'use strict';
// ═══ Project "Manager" (progress.md Phase 6) ══════════════════════════
// A Major-level organizer kind that — unlike Collector — opens to browse
// its Minor children: 4 views (Cards · List · Table · Recent). Children
// already come attached via api.module.getTree()'s `.children`, so the
// only extra data this loads is the persisted view preference and a
// per-child attribute count (Phase 4's module_attribute, generic across
// every kind) for the "kind badges + counts" acceptance criterion.

const MANAGER_VIEWS = ['cards', 'list', 'table', 'recent'];
const MANAGER_VIEW_LABEL = { cards: 'Cards', list: 'List', table: 'Table', recent: 'Recent' };

// Plan part2 #2.1: the per-child counts used to be one getAttrs round-trip
// per child, fetching every attribute row just to read .length. One GROUP BY
// (module:getAttrCounts) does the whole set.
async function loadManagerData(m) {
  const [ui, counts] = await Promise.all([
    api.module.getUi(m.id),
    api.module.getAttrCounts(m.id),
  ]);
  S.managerData = { moduleId: m.id, attrCounts: new Map(Object.entries(counts).map(([id, c]) => [Number(id), c])) };
  S.managerView = MANAGER_VIEWS.includes(ui.activeView) ? ui.activeView : 'cards';
}

async function setManagerView(moduleId, view) {
  S.managerView = view;
  await api.module.setUi(moduleId, 'activeView', view);
  if (S.inspectorData?.moduleId === moduleId) S.inspectorData.ui = { ...S.inspectorData.ui, activeView: view };
  renderNexusHome();
}

function buildManagerMainHtml(m) {
  const children = m.children || [];
  const counts = (S.managerData && S.managerData.moduleId === m.id) ? S.managerData.attrCounts : new Map();
  const view = S.managerView || 'cards';
  const viewBar = `<div class="viewbar">
    ${MANAGER_VIEWS.map(v => `<span class="vitem${v === view ? ' act' : ''}" onclick="setManagerView(${m.id},'${v}')">${MANAGER_VIEW_LABEL[v]}</span>`).join('')}
  </div>`;
  const toolbar = `<div class="classifier-toolbar">
    <button class="btn btn-p" onclick="event.stopPropagation();openMinorModuleModal(${m.id},this)">${I.plus} ${t('addMinorModule')}</button>
    ${viewBar}
  </div>`;
  if (!children.length) {
    return `${toolbar}<div class="empty" style="margin-top:30px"><div class="ei">${moduleIconHtml(m)}</div><h3>${x(m.name)}</h3><p>${t('nestEmpty')}</p></div>`;
  }
  let body;
  if (view === 'list') body = renderManagerList(children);
  else if (view === 'table') body = renderManagerTable(children, counts);
  else if (view === 'recent') body = renderManagerList([...children].sort((a, b) => (b.update_at || '').localeCompare(a.update_at || '')));
  else body = renderManagerCards(children, counts);
  return `${toolbar}${body}`;
}

function renderManagerCards(children, counts) {
  return `<div class="cls-grid">${children.map(c => `
    <div class="cls-card mgr-card" onclick="openModuleNode(${c.id})">
      <span class="disp-thumb"><img data-display-key="module_${c.id}" alt=""></span>
      <div class="mgr-card-icon" style="color:${x(c.icon_color_code || c.color_code || 'var(--accent)')}">${moduleIconHtml(c)}</div>
      <div class="cls-card-name">${x(c.name)}</div>
      <span class="kind">${x(kindLabel(c.kind))}</span>
      <span class="mgr-card-count">${(counts.get(c.id) || 0)} ${t('moduleAttribute')}</span>
    </div>`).join('')}</div>`;
}

function renderManagerList(children) {
  return children.map(c => `<div class="li" onclick="openModuleNode(${c.id})">
    <span class="kicon" style="color:${x(c.icon_color_code || c.color_code || 'var(--accent)')}">${moduleIconHtml(c)}</span>
    <span class="name">${x(c.name)}</span>
    <span class="kind">${x(kindLabel(c.kind))}</span>
  </div>`).join('');
}

function renderManagerTable(children, counts) {
  let html = `<div class="cls-table-wrap"><table class="cls-table"><tr><th>${t('name')}</th><th>${t('moduleKind')}</th><th>${t('moduleAttribute')}</th></tr>`;
  for (const c of children) {
    html += `<tr onclick="openModuleNode(${c.id})" style="cursor:pointer">
      <td><span class="dot" style="background:${x(c.color_code || '#6366f1')}"></span>${x(c.name)}</td>
      <td>${x(kindLabel(c.kind))}</td>
      <td>${counts.get(c.id) || 0}</td>
    </tr>`;
  }
  html += `</table></div>`;
  return html;
}
