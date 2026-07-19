'use strict';
// ═══ Category "Classifier" (progress.md Phase 5) ══════════════════════
// Major-level kind, 4 views (Table · List + Detail · Relation in Cat ·
// Grid Collection). A Classifier module IS its category — objects live
// directly under it (src/db/classifier.js, a parallel schema; see
// progress.md Section C for why it doesn't reuse Director's object_*
// tables). "Relation in Cat" is a lightweight static layout for now — a
// full relationship-authoring system for classifier objects is out of
// scope for this phase.

const CLASSIFIER_VIEWS = ['table', 'listDetail', 'relationCat', 'grid'];
const CLASSIFIER_VIEW_LABEL = { table: 'Table', listDetail: 'Detail', relationCat: 'Relation', grid: 'Grid' };

async function loadClassifierData(m) {
  const [objects, templates, ui] = await Promise.all([
    api.classifier.getObjects(m.id),
    api.classifier.getTemplates(m.id),
    api.module.getUi(m.id),
  ]);
  await Promise.all(objects.map(async (o) => {
    // getAttrs only returns templates that already have a saved value row;
    // getObjectTemplates lists every template (shared + this object's own
    // private one) so a freshly-created private template with no value yet
    // still shows up as an empty editable field.
    const [attrs, objTemplates] = await Promise.all([
      api.classifier.getAttrs(o.id),
      api.classifier.getObjectTemplates(m.id, o.id),
    ]);
    o.attrMap = {};
    for (const a of attrs) o.attrMap[a.template_ref] = a.attribute_value;
    o.privateTemplates = objTemplates
      .filter(tpl => tpl.object_ref === o.id)
      .map(tpl => ({ id: tpl.id, description: tpl.description, value: o.attrMap[tpl.id] || '' }));
  }));
  S.classifierData = { moduleId: m.id, objects, templates };
  S.classifierView = CLASSIFIER_VIEWS.includes(ui.activeView) ? ui.activeView : 'table';
  if (S.classifierSelectedObject && !objects.find(o => o.id === S.classifierSelectedObject)) S.classifierSelectedObject = null;
  if (!S.classifierSelectedObject && objects.length) S.classifierSelectedObject = objects[0].id;
}

async function setClassifierView(moduleId, view) {
  S.classifierView = view;
  await api.module.setUi(moduleId, 'activeView', view);
  if (S.inspectorData?.moduleId === moduleId) S.inspectorData.ui = { ...S.inspectorData.ui, activeView: view };
  renderNexusHome();
}

function buildClassifierMainHtml(m) {
  const d = (S.classifierData && S.classifierData.moduleId === m.id) ? S.classifierData : { objects: [], templates: [] };
  const view = S.classifierView || 'table';
  const viewBar = `<div class="viewbar">
    ${CLASSIFIER_VIEWS.map(v => `<span class="vitem${v === view ? ' act' : ''}" onclick="setClassifierView(${m.id},'${v}')">${CLASSIFIER_VIEW_LABEL[v]}</span>`).join('')}
  </div>`;
  const toolbar = `<div class="classifier-toolbar">
    <button class="btn btn-p" onclick="openClassifierObjectModal(${m.id})">${I.plus} ${t('addObject')}</button>
    <button class="btn btn-s" onclick="openClassifierTemplateModal(${m.id})">${I.edit} ${t('editTemplate')}</button>
    ${viewBar}
  </div>`;
  let body;
  if (!d.objects.length) {
    body = `<div class="empty" style="margin-top:30px"><div class="ei">${moduleIconHtml(m)}</div><h3>${x(m.name)}</h3><p>${t('nestEmpty')}</p></div>`;
  } else if (view === 'listDetail') body = renderClassifierListDetail(m, d);
  else if (view === 'grid') body = renderClassifierGrid(m, d);
  else if (view === 'relationCat') body = renderClassifierRelation(m, d);
  else body = renderClassifierTable(m, d);
  return `${toolbar}${body}`;
}

// ── Table view (default) ────────────────────────────────────────────────
function renderClassifierTable(m, d) {
  let html = `<div class="cls-table-wrap"><table class="cls-table"><tr><th>${t('name')}</th>${d.templates.map(c => `<th>${x(c.description)}</th>`).join('')}<th></th></tr>`;
  for (const o of d.objects) {
    html += `<tr><td><span class="dot" style="background:${x(o.color_code || '#6366f1')}"></span>${x(o.name)}</td>`;
    for (const c of d.templates) {
      html += `<td class="cls-cell" contenteditable="true" data-oid="${o.id}" data-tid="${c.id}" onblur="saveClassifierAttrCell(this)">${x(o.attrMap[c.id] || '')}</td>`;
    }
    html += `<td class="cls-rowacts">
      <button class="btn btn-g btn-i" onclick="openClassifierObjectModal(${m.id},${o.id})" title="${t('edit')}">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="deleteClassifierObjectRow(${o.id})" title="${t('delete')}">${I.delete}</button>
    </td></tr>`;
  }
  html += `</table></div>`;
  return html;
}

async function saveClassifierAttrCell(el) {
  const oid = Number(el.dataset.oid), tid = Number(el.dataset.tid);
  const value = el.textContent.trim();
  await api.classifier.upsertAttr(oid, tid, value);
  const obj = S.classifierData?.objects.find(o => o.id === oid);
  if (obj) obj.attrMap[tid] = value;
}

// ── Grid Collection view ────────────────────────────────────────────────
function renderClassifierGrid(m, d) {
  // Mockup 21: card with a color top border and a circled, tinted object
  // icon; character-type classifiers use the person glyph.
  const icon = m.cat_type === 'character' ? I.person : I.item;
  return `<div class="cls-grid">${d.objects.map(o => {
    const col = o.color_code || '#6366f1';
    return `
    <div class="cls-card" style="border-top:3px solid ${x(col)}" onclick="openClassifierObjectModal(${m.id},${o.id})">
      <span class="disp-thumb"><img data-display-key="cobj_${o.id}" alt=""></span>
      <span class="cls-card-icon" style="border-color:${x(col)};color:${x(col)}">${icon}</span>
      <div class="cls-card-name">${x(o.name)}</div>
    </div>`;
  }).join('')}</div>`;
}

// ── List + Detail view ──────────────────────────────────────────────────
function renderClassifierListDetail(m, d) {
  const sel = d.objects.find(o => o.id === S.classifierSelectedObject) || d.objects[0];
  const rowIcon = m.cat_type === 'character' ? I.person : I.item;
  const list = d.objects.map(o => `<div class="li${sel && o.id === sel.id ? ' sel' : ''}" onclick="selectClassifierObject(${o.id})">
    <span class="kicon" style="color:${x(o.color_code || '#6366f1')}">${rowIcon}</span><span class="name">${x(o.name)}</span></div>`).join('');
  const detail = sel ? renderClassifierObjectDetail(m, sel) : '';
  return `<div class="cls-listdetail"><div class="cls-list">${list}</div><div class="cls-detail">${detail}</div></div>`;
}

// `templates` defaults to the ambient module-view cache — the item page
// (Plan part4, src/renderer/mod/item.js) passes its own freshly-fetched
// templates instead, since it can be opened without the module's own view
// ever having loaded S.classifierData.
function renderClassifierObjectDetail(m, o, templates = S.classifierData?.templates || []) {
  let html = `<h3 style="margin-bottom:8px">${x(o.name)}</h3>`;
  for (const c of templates) {
    html += `<div class="prop"><span class="pk">${x(c.description)}</span>
      <span class="pv" contenteditable="true" data-oid="${o.id}" data-tid="${c.id}" onblur="saveClassifierAttrCell(this)">${x(o.attrMap[c.id] || '')}</span></div>`;
  }
  if (m.cat_type === 'character') {
    html += `<div class="insp-label">${t('customAttribute')}</div>`;
    if (o.privateTemplates.length) {
      const pt = o.privateTemplates[0];
      html += `<div class="prop"><span class="pk">${x(pt.description)}</span>
        <span class="pv" contenteditable="true" data-oid="${o.id}" data-tid="${pt.id}" onblur="saveClassifierAttrCell(this)">${x(pt.value || '')}</span></div>`;
    } else {
      html += `<button class="btn btn-g" style="margin:4px 14px" onclick="openClassifierCustomAttrModal(${m.id},${o.id})">${I.plus} ${t('customAttribute')}</button>`;
    }
  }
  return html;
}

function selectClassifierObject(id) {
  S.classifierSelectedObject = id;
  renderNexusHome();
}

// ── Relation in Cat view (static preview) ───────────────────────────────
function renderClassifierRelation(m, d) {
  return `<div class="cls-relation-wrap">${d.objects.map((o, i) =>
    `<div class="cls-reldot" style="left:${20 + (i % 6) * 140}px;top:${20 + Math.floor(i / 6) * 90}px;border-color:${x(o.color_code || '#6366f1')}">${x(o.name)}</div>`
  ).join('')}</div>`;
}

// ── Object CRUD ─────────────────────────────────────────────────────────
async function openClassifierObjectModal(moduleId, objectId) {
  const o = objectId ? S.classifierData?.objects.find(x2 => x2.id === objectId) : null;
  openModal(o ? t('moduleEdit') : t('addObject'), `
    <div class="fg"><label>${t('name')} *</label><input id="co-name" value="${x(o?.name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(o?.color || null)}</div>
    <div class="mfoot">
      ${o ? `<button class="btn btn-d" onclick="deleteClassifierObjectRow(${o.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitClassifierObjectForm(${moduleId},${o ? o.id : 'null'})">${o ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#co-name').focus(), 60);
}

async function submitClassifierObjectForm(moduleId, objectId) {
  const name = q('#co-name').value.trim();
  if (!name) return;
  const colorId = q('#sel-color').value || null;
  if (objectId) await api.classifier.updateObject(objectId, name, colorId);
  else await api.classifier.createObject(moduleId, name, colorId);
  closeModal();
  await loadClassifierData(S.activeModuleNode);
  renderNexusHome();
  invalidateNestItems(moduleId, objectId ? 0 : 1);
  toast(objectId ? t('saved') : t('created'), 'ok');
}

async function deleteClassifierObjectRow(objectId) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  const moduleId = S.activeModuleNode?.id;
  await api.classifier.deleteObject(objectId);
  closeModal();
  if (S.classifierSelectedObject === objectId) S.classifierSelectedObject = null;
  await loadClassifierData(S.activeModuleNode);
  renderNexusHome();
  if (moduleId != null) invalidateNestItems(moduleId, -1);
  toast(t('deleted'), 'ok');
}

// ── Shared template CRUD ────────────────────────────────────────────────
async function openClassifierTemplateModal(moduleId) {
  const m = S.activeModuleNode;
  const templates = S.classifierData?.templates || [];
  const isElement = m.cat_type === 'element';
  openModal(t('editTemplate'), `
    <div>${templates.map(tpl => `
      <div class="prop insp-attr">
        <span class="pk">${x(tpl.description)}</span>
        <span class="pv ghost">${isElement ? [tpl.levelable ? t('levelable') : '', tpl.has_condition ? t('condition') : ''].filter(Boolean).join(' · ') : ''}</span>
        <span class="acts"><button class="btn btn-g btn-i" onclick="deleteClassifierTemplateRow(${tpl.id})">${I.delete}</button></span>
      </div>`).join('') || `<p style="color:var(--t3);font-size:12px;padding:4px 0">${t('nestEmpty')}</p>`}
    </div>
    <div class="fg" style="margin-top:10px"><label>${t('addAttribute')}</label><input id="ct-name" placeholder="${t('name')}"></div>
    ${isElement ? `
    <div class="togglerow" onclick="toggleTemplateFlag('lv')"><span class="tg" id="ct-lv-tg"></span>${t('levelable')}</div>
    <div class="togglerow" onclick="toggleTemplateFlag('cond')"><span class="tg" id="ct-cond-tg"></span>${t('condition')}</div>
    <input type="hidden" id="ct-lv" value="0"><input type="hidden" id="ct-cond" value="0">` : ''}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitClassifierTemplateForm(${moduleId})">${t('addAttribute')}</button>
    </div>`);
}

function toggleTemplateFlag(key) {
  const hidden = q(`#ct-${key}`);
  const on = hidden.value === '1';
  hidden.value = on ? '0' : '1';
  q(`#ct-${key}-tg`)?.classList.toggle('on', !on);
}

async function submitClassifierTemplateForm(moduleId) {
  const name = q('#ct-name').value.trim();
  if (!name) return;
  const levelable = q('#ct-lv')?.value === '1';
  const hasCondition = q('#ct-cond')?.value === '1';
  await api.classifier.createTemplate(moduleId, name, 'text', levelable, hasCondition, null);
  await loadClassifierData(S.activeModuleNode);
  renderNexusHome();
  toast(t('created'), 'ok');
  openClassifierTemplateModal(moduleId);
}

async function deleteClassifierTemplateRow(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.classifier.deleteTemplate(id);
  await loadClassifierData(S.activeModuleNode);
  renderNexusHome();
  toast(t('deleted'), 'ok');
  openClassifierTemplateModal(S.activeModuleNode.id);
}

// ── Character type's one private attribute ──────────────────────────────
async function openClassifierCustomAttrModal(moduleId, objectId) {
  const count = await api.classifier.countObjectTemplates(objectId);
  if (count > 0) return;
  openModal(t('customAttribute'), `
    <div class="fg"><label>${t('name')} *</label><input id="cca-name"></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitClassifierCustomAttr(${moduleId},${objectId})">${t('create')}</button>
    </div>`);
  setTimeout(() => q('#cca-name').focus(), 60);
}

async function submitClassifierCustomAttr(moduleId, objectId) {
  const name = q('#cca-name').value.trim();
  if (!name) return;
  await api.classifier.createTemplate(moduleId, name, 'text', 0, 0, objectId);
  closeModal();
  await loadClassifierData(S.activeModuleNode);
  renderNexusHome();
  toast(t('created'), 'ok');
}
