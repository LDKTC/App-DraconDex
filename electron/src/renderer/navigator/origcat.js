// The world-owned ("original") category pack — its table/detail views, inline
// editors, templates, objects and column visibility. Mirrors Director's
// renderCatBody, but scoped to a world instead of a project.
// ═══ World-owned ("original") cat pack — mirrors Director's renderCatBody ════
function setWorldOrigCatView(view) { S.worldOrigCatView = view; if (S.worldOrigCat) renderWorldOrigCatBody(S.worldOrigCat.id); }

async function renderWorldOrigCatBody(catId) {
  const el = q('#world-cat-body'); if (!el) return;
  const objs = await api.world.origObj.getAll(catId);
  const view = S.worldOrigCatView || 'list';

  let h = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div class="view-toggles" style="display:flex;background:var(--surface);padding:3px;border-radius:var(--r);border:1px solid var(--border)">
      <button class="btn btn-g ${view === 'list' ? 'active' : ''}" style="padding:4px 10px;font-size:calc(12px * var(--fsc,1));border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setWorldOrigCatView('list')">${I.list} List</button>
      <button class="btn btn-g ${view === 'table' ? 'active' : ''}" style="padding:4px 10px;font-size:calc(12px * var(--fsc,1));border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setWorldOrigCatView('table')">${I.table} Table</button>
    </div>
    <span style="font-size:calc(11px * var(--fsc,1));color:var(--t3);flex:1">${objs.length} items</span>
    <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12px * var(--fsc,1))" onclick="openWorldOrigObjectModal(${catId})">${I.plus} Add</button>
    <button class="btn btn-s btn-i" onclick="openWorldOrigTemplateModal(${catId})" title="Manage Fields">${I.fields}</button>
  </div>`;

  if (view === 'table') {
    const tmpls = await api.world.origTmpl.getAll(catId);
    const attrMap = {};
    for (const o of objs) {
      const attrs = await api.world.origObj.getAttrs(o.id);
      attrMap[o.id] = {};
      for (const a of attrs) attrMap[o.id][a.id] = a.attribute_value ?? '';
    }
    const visColKey = `worldVisibleCols_${catId}`;
    let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
    if (Object.keys(visibleCols).length === 0) visibleCols = tmpls.reduce((acc, tp) => ({ ...acc, [tp.id]: true }), {});

    h += `<div style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openWorldOrigColVisModal(${catId})">${I.settings} Columns</button>
    </div>`;
    h += `<div class="table-container">`;
    if (!objs.length) {
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>No data</p></div>`;
    } else {
      h += `<div class="table-wrapper"><table class="dark-table"><thead><tr><th onclick="sortTable(${catId},'name')"><div class="sortable-header">Name <span class="sort-indicator">▲</span></div></th>`;
      for (const tp of tmpls) {
        const visible = visibleCols[tp.id] ? '' : 'display:none';
        h += `<th style="${visible}" onclick="sortTable(${catId},${tp.id})" data-template-id="${tp.id}"><div class="sortable-header">${x(tp.description)} <span class="sort-indicator">▲</span></div></th>`;
      }
      h += `<th style="width:80px;text-align:center">Manage</th></tr></thead><tbody>`;
      for (const o of objs) {
        const ocol = o.color_code || '#6366f1', act = S.worldOrigObject?.id === o.id;
        h += `<tr class="objrow ${act ? 'active' : ''}" id="worow-${o.id}" onclick="selectWorldOrigObject(${o.id})" data-sort-name="${x(o.name).toLowerCase()}">
          <td><div style="display:flex;align-items:center;gap:8px">
            <div class="odot" style="background:${ocol}"></div>
            <input class="table-inline-input wo-name-input" data-oid="${o.id}" data-color="${o.color ?? ''}" value="${x(o.name)}">
          </div></td>`;
        for (const tp of tmpls) {
          const val = attrMap[o.id]?.[tp.id] ?? '';
          const visible = visibleCols[tp.id] ? '' : 'display:none';
          h += `<td style="${visible}" data-template-id="${tp.id}" data-sort-value="${x(val).toLowerCase()}"><input class="table-inline-input wo-attr-input" data-oid="${o.id}" data-tid="${tp.id}" value="${x(val)}"></td>`;
        }
        h += `<td><div style="display:flex;gap:4px;justify-content:center" onclick="event.stopPropagation()">
          <button class="btn btn-g btn-i" onclick="openWorldOrigObjectModal(null,${o.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="delWorldOrigObject(${o.id})" style="color:var(--danger)">${I.delete}</button>
        </div></td></tr>`;
      }
      h += `</tbody></table></div>`;
    }
    h += `</div>`;
  } else {
    h += `<div class="split"><div><div class="objlist" id="wo-objlist">`;
    if (!objs.length) {
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>No data</p></div>`;
    } else {
      for (const o of objs) {
        const ocol = o.color_code || '#6366f1', act = S.worldOrigObject?.id === o.id;
        h += `<div class="objrow ${act ? 'active' : ''}" id="worow-${o.id}" onclick="selectWorldOrigObject(${o.id})">
          <div class="odot" style="background:${ocol}"></div><span class="oname">${x(o.name)}</span>
        </div>`;
      }
    }
    h += `</div></div><div id="wo-detail-panel">${S.worldOrigObject ? '' : worldOrigEmptyDetail()}</div></div>`;
  }

  el.innerHTML = h;
  if (view === 'table') bindWorldOrigTableInlineEditors();
  else if (S.worldOrigObject) await renderWorldOrigDetail(S.worldOrigObject.id);
}

function bindWorldOrigTableInlineEditors() {
  const onEnterBlur = (input, saveFn) => {
    input.dataset.prev = input.value.trim();
    const commit = async () => {
      const newVal = input.value.trim();
      if (newVal === input.dataset.prev) return;
      await saveFn(newVal);
      input.dataset.prev = newVal;
      flashSaved(input);
    };
    input.addEventListener('blur', () => commit().catch(() => toast('Save failed', 'err')));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  };
  document.querySelectorAll('.wo-name-input').forEach(input => {
    input.addEventListener('click', e => e.stopPropagation());
    onEnterBlur(input, async newName => {
      const oid = +input.dataset.oid, color = input.dataset.color ? +input.dataset.color : null;
      if (!newName) return;
      await api.world.origObj.update(oid, newName, color);
    });
  });
  document.querySelectorAll('.wo-attr-input').forEach(input => {
    input.addEventListener('click', e => e.stopPropagation());
    onEnterBlur(input, async newVal => {
      await api.world.origObj.upsertAttr(+input.dataset.oid, +input.dataset.tid, newVal);
    });
  });
}

function worldOrigEmptyDetail() { return `<div class="empty" style="padding:50px 20px"><div class="ei">${I.search}</div><p>Select an item to view details</p></div>`; }

async function selectWorldOrigObject(id) {
  S.worldOrigObject = await api.world.origObj.get(id);
  document.querySelectorAll('.objrow').forEach(r => r.classList.remove('active'));
  const row = q(`#worow-${id}`); if (row) row.classList.add('active');
  await renderWorldOrigDetail(id);
}

async function buildWorldOrigDetail(oid) {
  const obj = await api.world.origObj.get(oid);
  const attrs = await api.world.origObj.getAttrs(oid);
  const col = obj.color_code || '#6366f1';
  const note = obj.note || '';
  let h = `<div class="odetail">
    <div class="dhead">
      <div class="odot" style="background:${col};width:11px;height:11px"></div>
      <span class="dtitle">${x(obj.name)}</span>
      <button class="btn btn-g btn-i" onclick="openWorldOrigObjectModal(null,${obj.id})">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="delWorldOrigObject(${obj.id})" style="color:var(--danger)">${I.delete}</button>
    </div>
    <div class="detail-content">
    <div class="attrs" id="woaf-${oid}">`;
  if (!attrs.length) {
    h += `<div class="empty" style="padding:24px 0"><p style="font-size:calc(12px * var(--fsc,1))">No fields</p>
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openWorldOrigTemplateModal(${S.worldOrigCat.id})">${I.fields} Manage Fields</button></div>`;
  } else {
    for (const a of attrs) {
      const val = a.attribute_value || '', uid = `woai-${oid}-${a.id}`;
      h += `<div class="aitem"><label>${x(a.description)}</label>`;
      if (a.attribute_type === 'textarea') h += `<textarea id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="auto-expand wo-detail-attr-field" oninput="autoExpandTextarea(this)">${x(val)}</textarea>`;
      else h += `<input type="${a.attribute_type === 'number' ? 'number' : 'text'}" id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="wo-detail-attr-field" value="${x(val)}">`;
      h += `</div>`;
    }
  }
  h += `</div>
    <div class="note-section">
      <label style="display:flex;align-items:center;gap:4px"><span class="icon" style="width:12px;height:12px">${I.edit}</span> Note</label>
      <textarea class="note-textarea auto-expand wo-detail-note-field" id="wonote-${oid}" data-oid="${oid}" placeholder="Additional notes for this item..." oninput="autoExpandTextarea(this)">${x(note)}</textarea>
    </div>
    </div>
  </div>`;
  return h;
}

async function renderWorldOrigDetail(oid) {
  const panel = q('#wo-detail-panel'); if (!panel) return;
  panel.innerHTML = await buildWorldOrigDetail(oid);
  setTimeout(() => { panel.querySelectorAll('.auto-expand').forEach(ta => autoExpandTextarea(ta)); }, 0);
  bindWorldOrigDetailAutoSave(oid);
}

function bindWorldOrigDetailAutoSave(oid) {
  const onBlurSave = (el, saveFn) => {
    el.dataset.prev = el.value;
    const commit = async () => {
      if (el.value === el.dataset.prev) return;
      await saveFn(el.value);
      el.dataset.prev = el.value;
      flashSaved(el);
    };
    el.addEventListener('blur', () => commit().catch(() => toast('Save failed', 'err')));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' && el.tagName !== 'TEXTAREA') { e.preventDefault(); el.blur(); } });
  };
  document.querySelectorAll('.wo-detail-attr-field').forEach(el => {
    onBlurSave(el, async newVal => { await api.world.origObj.upsertAttr(+el.dataset.oid, +el.dataset.tid, newVal); });
  });
  const noteEl = q(`.wo-detail-note-field`);
  if (noteEl) onBlurSave(noteEl, async newVal => { await api.world.origObj.updateNote(+noteEl.dataset.oid, newVal.trim()); });
}

// ── Original category modal ──
async function openWorldOrigCatModal(id = null) {
  if (!S.world) return;
  let cat = null;
  if (id) { const cats = await api.world.origCat.getAll(S.world.id); cat = cats.find(c => c.id === id); }
  const picker = await colorPicker(cat?.color);
  openModal(cat ? 'Edit Category' : 'New Category', `
    <div class="fg"><label>Name *</label><input id="wocn" value="${x(cat?.category_name || '')}"></div>
    <div class="fg"><label>Color</label>${picker}</div>
    <div class="mfoot">${cat ? `<button class="btn btn-d" onclick="delWorldOrigCat(${id})">Delete</button>` : ''}<button class="btn btn-s" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="${cat ? 'saveWorldOrigCat(' + id + ')' : 'createWorldOrigCat()'}">${cat ? 'Save' : 'Create'}</button></div>`);
  setTimeout(() => q('#wocn')?.focus(), 60);
}
async function createWorldOrigCat() {
  const n = q('#wocn').value.trim(); if (!n) return;
  await api.world.origCat.create(S.world.id, n, q('#sel-color').value || null);
  closeModal();
  const cats = await api.world.origCat.getAll(S.world.id);
  S.worldOrigCat = cats[cats.length - 1]; S.worldOrigObject = null; S.worldTab = 'original';
  await renderWorldSidebar(S.world); await renderWorldMain();
  toast('Category created', 'ok');
}
async function saveWorldOrigCat(id) {
  const n = q('#wocn').value.trim(); if (!n) return;
  await api.world.origCat.update(id, n, q('#sel-color').value || null);
  closeModal();
  const cats = await api.world.origCat.getAll(S.world.id);
  S.worldOrigCat = cats.find(c => c.id === id) || cats[0] || null;
  await renderWorldSidebar(S.world); await renderWorldMain();
  toast('Saved', 'ok');
}
async function delWorldOrigCat(id) {
  if (!await uiConfirm('Delete category? All its objects will be removed.')) return;
  await api.world.origCat.delete(id);
  closeModal();
  const cats = await api.world.origCat.getAll(S.world.id);
  S.worldOrigCat = cats[0] || null; S.worldOrigObject = null;
  await renderWorldSidebar(S.world); await renderWorldMain();
  toast('Deleted');
}

// ── Original template (fields) modal ──
function _woTmplRow(tp, catId) {
  return `<div class="titem" id="wotmpl-${tp.id}"><span class="tname">${x(tp.description)}</span><span class="ttype">${tp.attribute_type}</span><button class="btn btn-g btn-i" onclick="delWorldOrigTemplate(${tp.id},${catId})" style="color:var(--danger)">❌</button></div>`;
}
async function openWorldOrigTemplateModal(catId) {
  const safeCatId = parseInt(catId, 10);
  if (!safeCatId) { toast('Invalid category', 'err'); return; }
  const tmpls = await api.world.origTmpl.getAll(safeCatId);
  openModal('Manage Fields', `
    <p style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3);margin-bottom:10px">Fields apply to every object in this category</p>
    <div class="tlist" id="wotlist">${tmpls.map(tp => _woTmplRow(tp, safeCatId)).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:calc(12px * var(--fsc,1))">No fields</p>'}</div>
    <div class="div"></div>
    <div style="display:flex;gap:8px;align-items:flex-end">
      <div class="fg" style="flex:1;margin:0"><label>Field name</label><input id="wotnew" placeholder="e.g. Age, Power"></div>
      <div class="fg" style="margin:0"><label>Type</label><select id="wottype"><option value="text">text</option><option value="textarea">textarea</option><option value="number">number</option></select></div>
      <button class="btn btn-p" onclick="addWorldOrigTemplate(${safeCatId})">+ Add</button>
    </div>`);
  setTimeout(() => q('#wotnew')?.focus(), 60);
}
async function addWorldOrigTemplate(catId) {
  try {
    const n = q('#wotnew').value.trim(); if (!n) return;
    await api.world.origTmpl.create(catId, n, q('#wottype').value);
    q('#wotnew').value = '';
    const tmpls = await api.world.origTmpl.getAll(catId);
    q('#wotlist').innerHTML = tmpls.map(tp => _woTmplRow(tp, catId)).join('');
    toast('Field added', 'ok');
  } catch (e) { toast(e.message, 'err'); console.error(e); }
}
async function delWorldOrigTemplate(id, catId) {
  try {
    if (!await uiConfirm('Delete field? All its values will be lost')) return;
    await api.world.origTmpl.delete(id);
    const tmpls = await api.world.origTmpl.getAll(catId);
    q('#wotlist').innerHTML = tmpls.map(tp => _woTmplRow(tp, catId)).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:calc(12px * var(--fsc,1))">No fields</p>';
    toast('Deleted');
  } catch (e) { toast(e.message, 'err'); console.error(e); }
}

// ── Original object modal ──
async function openWorldOrigObjectModal(catId = null, objId = null) {
  const obj = objId ? await api.world.origObj.get(objId) : null;
  const picker = await colorPicker(obj?.color);
  const targetCat = catId || S.worldOrigCat?.id;
  openModal(obj ? 'Edit Item' : 'Add Item', `
    <div class="fg"><label>Name *</label><input id="won" value="${x(obj?.name || '')}"></div>
    <div class="fg"><label>Color</label>${picker}</div>
    <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="${obj ? 'saveWorldOrigObject(' + objId + ')' : 'createWorldOrigObject(' + targetCat + ')'}">${obj ? 'Save' : 'Create'}</button></div>`);
  setTimeout(() => q('#won')?.focus(), 60);
}
async function createWorldOrigObject(catId) {
  const n = q('#won').value.trim(); if (!n) return;
  const r = await api.world.origObj.create(S.world.id, catId, n, q('#sel-color').value || null);
  closeModal();
  if (r?.lastInsertRowid) S.worldOrigObject = await api.world.origObj.get(r.lastInsertRowid);
  await renderWorldOrigCatBody(catId);
  toast('Item added', 'ok');
}
async function saveWorldOrigObject(id) {
  const n = q('#won').value.trim(); if (!n) return;
  await api.world.origObj.update(id, n, q('#sel-color').value || null);
  closeModal();
  S.worldOrigObject = await api.world.origObj.get(id);
  await renderWorldOrigCatBody(S.worldOrigCat.id);
  toast('Saved', 'ok');
}
async function delWorldOrigObject(id) {
  if (!await uiConfirm('Delete this item?')) return;
  await api.world.origObj.delete(id);
  closeModal();
  if (S.worldOrigObject?.id === id) S.worldOrigObject = null;
  await renderWorldOrigCatBody(S.worldOrigCat.id);
  toast('Deleted');
}

// ── Column visibility (table view) ──
async function openWorldOrigColVisModal(catId) {
  const tmpls = await api.world.origTmpl.getAll(catId);
  const visColKey = `worldVisibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  let hasDiff = false;
  for (const tp of tmpls) { if (visibleCols[tp.id] === undefined) { visibleCols[tp.id] = true; hasDiff = true; } }
  if (hasDiff) localStorage.setItem(visColKey, JSON.stringify(visibleCols));
  const allChecked = tmpls.every(tp => visibleCols[tp.id] !== false);
  let html = `<div style="display:flex; flex-direction:column; gap:10px;">
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:calc(14px * var(--fsc,1)); padding:6px 0;">
      <input type="checkbox" id="wo-col-vis-all" ${allChecked ? 'checked' : ''} onchange="toggleAllWorldOrigColumns(${catId}, this.checked)">
      <strong>Show all</strong>
    </label>
    <div style="height:1px; background:var(--border); margin:4px 0;"></div>`;
  for (const tp of tmpls) {
    const isChecked = visibleCols[tp.id] !== false;
    html += `<label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:calc(14px * var(--fsc,1)); padding:4px 0;">
        <input type="checkbox" class="wo-col-vis-check" data-tid="${tp.id}" ${isChecked ? 'checked' : ''} onchange="toggleWorldOrigColumn(${catId}, ${tp.id}, this.checked)">
        <span>${x(tp.description)}</span></label>`;
  }
  html += `</div><div class="mfoot"><button class="btn btn-p" onclick="closeModal()">OK</button></div>`;
  openModal('Select columns', html);
}
function toggleWorldOrigColumn(catId, templateId, isChecked) {
  const visColKey = `worldVisibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  visibleCols[templateId] = isChecked;
  localStorage.setItem(visColKey, JSON.stringify(visibleCols));
  const allCheckbox = q('#wo-col-vis-all');
  if (allCheckbox) { const cbs = document.querySelectorAll('.wo-col-vis-check'); allCheckbox.checked = Array.from(cbs).every(cb => cb.checked); }
  _applyColumnVisibility(templateId, isChecked);
}
function toggleAllWorldOrigColumns(catId, isChecked) {
  const visColKey = `worldVisibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  document.querySelectorAll('.wo-col-vis-check').forEach(cb => {
    cb.checked = isChecked;
    const tid = cb.dataset.tid;
    visibleCols[tid] = isChecked;
    _applyColumnVisibility(tid, isChecked);
  });
  localStorage.setItem(visColKey, JSON.stringify(visibleCols));
}

// ── World description (mirror of Director's project-description modal) ──
async function openWorldDescModal(id = null) {
  if (!S.world) return;
  let d = null;
  if (id) { const descs = await api.world.desc.getAll(S.world.id); d = descs.find(dd => dd.id === id); }
  openModal(d ? 'Edit Detail' : 'Add Detail', `
    <div class="fg"><label>Attribute name</label><input id="wodn" value="${x(d?.attribute_name || '')}" placeholder="e.g. Concept, Theme"></div>
    <div class="fg"><label>Text</label><textarea id="wodt" rows="4">${x(d?.attribute_text || '')}</textarea></div>
    <div class="mfoot">${d ? `<button class="btn btn-d" onclick="delWorldDesc(${id})">Delete</button>` : ''}<button class="btn btn-s" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="${d ? 'saveWorldDesc(' + id + ')' : 'addWorldDesc()'}">${d ? 'Save' : 'Add'}</button></div>`);
  setTimeout(() => q('#wodn')?.focus(), 60);
}
async function addWorldDesc() { const n = q('#wodn').value.trim(), tx2 = q('#wodt').value.trim(); await api.world.desc.add(S.world.id, n, tx2); closeModal(); await renderWorldSidebar(S.world); toast('Added', 'ok'); }
async function saveWorldDesc(id) { const n = q('#wodn').value.trim(), tx2 = q('#wodt').value.trim(); await api.world.desc.update(id, n, tx2); closeModal(); await renderWorldSidebar(S.world); toast('Saved', 'ok'); }
async function delWorldDesc(id) { if (!await uiConfirm('Delete this detail?')) return; await api.world.desc.delete(id); closeModal(); await renderWorldSidebar(S.world); toast('Deleted'); }

