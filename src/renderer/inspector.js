'use strict';
// ═══ Module Inspector (progress.md Phase 4) ═══════════════════════════
// Docked right-side panel for the focused Major/Minor module: detail spec
// (kind + free-text description, wikilink-aware), free-form attributes,
// tag links, module links (outgoing/backlinks via the generic wiki_link
// index — see src/db/wiki.js's `module_<id>` key kind), and a Version
// History entry point (the real history is Phase 21).

async function loadInspectorData(moduleId) {
  const [attrs, tags, links] = await Promise.all([
    api.module.getAttrs(moduleId),
    api.module.getTags(moduleId),
    api.module.getLinks(moduleId),
  ]);
  S.inspectorData = { moduleId, attrs, tags, links };
}

function buildInspectorHtml(m) {
  const d = (S.inspectorData && S.inspectorData.moduleId === m.id) ? S.inspectorData : { attrs: [], tags: [], links: { outgoing: [], backlinks: [] } };
  return `<aside class="module-inspector">
    <div class="insp-head">${I.fields}<span>${t('moduleInspector')} — ${x(m.name)}</span></div>

    <div class="insp-label">${t('moduleDetailSpec')}</div>
    <div class="prop"><span class="pk">${t('moduleKind')}</span><span class="pv">${x(KIND_LABEL[m.kind] || m.kind)}</span></div>
    <div class="insp-desc-wrap">
      <textarea id="insp-desc" rows="3" placeholder="${t('addDetail')}"
        onblur="saveModuleDescription(${m.id})">${x(m.description || '')}</textarea>
    </div>
    <div class="insp-chips">
      ${d.tags.map(tg => `<span class="htag" style="border-color:${x(tg.color_code || '#6366f1')};color:${x(tg.color_code || '#6366f1')}">#${x(tg.tag_name)}</span>`).join('')}
      <button class="btn btn-g btn-i" onclick="openModuleTagModal(${m.id})" title="${t('tagLink')}">${I.plus}</button>
    </div>

    <div class="insp-label">${t('moduleAttribute')}</div>
    ${d.attrs.map(a => `
      <div class="prop insp-attr">
        <span class="pk">${x(a.attr_name)}</span><span class="pv">${x(a.attr_value || '')}</span>
        <span class="acts">
          <button class="btn btn-g btn-i" onclick="openAttrModal(${m.id},${a.id})" title="${t('moduleEdit')}">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="deleteModuleAttrRow(${m.id},${a.id})" title="${t('delete')}">${I.delete}</button>
        </span>
      </div>`).join('')}
    <button class="btn btn-g" style="margin:4px 14px" onclick="openAttrModal(${m.id})">${I.plus} ${t('addAttribute')}</button>

    <div class="insp-label">${t('moduleLink')}</div>
    <div class="prop"><span class="pk">${t('outgoingLinks')}</span></div>
    <div class="insp-chips">${d.links.outgoing.length ? d.links.outgoing.map(l =>
      l.key ? `<span class="htag lk" onclick="openEntityByKey('${l.key}')">[[${x(l.name)}]]</span>` : `<span class="htag" style="opacity:.5">[[${x(l.name)}]]</span>`
    ).join('') : `<span class="pv ghost">—</span>`}</div>
    <div class="prop"><span class="pk">${t('backlinks')}</span></div>
    <div class="insp-chips">${d.links.backlinks.length ? d.links.backlinks.map(l =>
      `<span class="htag lk" onclick="openEntityByKey('${l.key}')">${x(l.name)}</span>`
    ).join('') : `<span class="pv ghost">${t('noBacklinks')}</span>`}</div>

    <div class="insp-label">${t('moduleUiSpec')}</div>
    <div class="prop"><span class="pv ghost">${t('versionHistoryComingSoon')}</span></div>

    <button class="btn btn-s" style="margin:10px 14px 14px;width:calc(100% - 28px)" onclick="toast(t('versionHistoryComingSoon'))">${I.info} ${t('versionHistory')}</button>
  </aside>`;
}

async function saveModuleDescription(moduleId) {
  const el = q('#insp-desc');
  if (!el) return;
  await api.module.updateDescription(moduleId, el.value);
  if (S.activeModuleNode) S.activeModuleNode.description = el.value;
  await loadInspectorData(moduleId);
  renderNexusHome();
}

function openAttrModal(moduleId, attrId = null) {
  const a = attrId ? (S.inspectorData?.attrs || []).find(x => x.id === attrId) : null;
  openModal(a ? t('moduleEdit') : t('addAttribute'), `
    <div class="fg"><label>${t('name')} *</label><input id="ia-name" value="${x(a?.attr_name || '')}"></div>
    <div class="fg"><label>${t('content')}</label><input id="ia-value" value="${x(a?.attr_value || '')}"></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitAttrForm(${moduleId},${attrId ?? 'null'})">${a ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#ia-name').focus(), 60);
}

async function submitAttrForm(moduleId, attrId) {
  const name = q('#ia-name').value.trim();
  if (!name) return;
  const value = q('#ia-value').value;
  await api.module.upsertAttr(moduleId, attrId, name, value);
  closeModal();
  await loadInspectorData(moduleId);
  renderNexusHome();
  toast(attrId ? t('saved') : t('created'), 'ok');
}

async function deleteModuleAttrRow(moduleId, attrId) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.module.deleteAttr(attrId);
  await loadInspectorData(moduleId);
  renderNexusHome();
  toast(t('deleted'), 'ok');
}

async function openModuleTagModal(moduleId) {
  const current = (S.inspectorData?.tags || []).map(t => t.id);
  openModal(t('tagLink'), `
    ${await hashtagSelector('modtag', current)}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitModuleTags(${moduleId})">${t('save')}</button>
    </div>`);
  renderModalTagSuggestions('modtag');
}

async function submitModuleTags(moduleId) {
  const ids = getModalTagIds('modtag');
  await api.module.setTags(moduleId, ids);
  closeModal();
  await loadInspectorData(moduleId);
  renderNexusHome();
  toast(t('saved'), 'ok');
}
