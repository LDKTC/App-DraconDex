async function renderProjectSidebar(){
  if(!S.project){
    renderSidebar();
    return;
  }
  const p = S.project;
  const col = p.color_code || '#6366f1';
  const cats = await api.category.getAll(p.id);
  const descs = await api.project.getDesc(p.id);
  const memo = p.project_memo || p.memo || '';
  let h = `<div class="project-side-head">
    <div class="project-side-title">
      <span class="dot" style="background:${col}"></span>
      <span class="name">${x(p.name)}</span>
      <button class="btn btn-g btn-i" onclick="openProjectModal(${p.id})" title="Edit project">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="openFolderModal()" title="${t('newFolder')}">${I.folder}</button>
      <button class="btn btn-g btn-i" onclick="openProjectModal()" title="${t('newProject')}">${I.plus}</button>
    </div>
    ${p.codename ? `<div class="project-side-code">${x(p.codename)}</div>` : ''}
  </div>`;

  h += `<div class="ph compact"><h4>Category</h4>
    <button class="btn btn-g btn-i" onclick="openCategoryModal()" title="New category">${I.plus}</button>
  </div>`;
  if(cats.length){
    h += cats.map(c => {
      const cc = c.color_code || '#6366f1';
      const act = S.category?.id === c.id;
      return `<div class="li ${act?'active':''}" onclick="selectCategory(${c.id})">
        <div class="dot" style="background:${cc}"></div><span class="name">${x(c.category_name)}</span>
        <div class="acts">
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();openCategoryModal(${c.id})">${I.edit}</button>
        </div>
      </div>`;
    }).join('');
  } else {
    h += `<div class="empty project-side-empty"><p>No categories</p></div>`;
  }

  h += `<div class="ph compact project-detail-ph"><h4>Project Details</h4>
    <button class="btn btn-g btn-i" onclick="openDescModal()" title="Add detail">${I.plus}</button>
  </div>
  <div class="project-detail-list">`;
  if(memo){
    h += `<div class="project-detail-item" onclick="openProjectModal(${p.id})"><span class="dk">Memo</span><span class="dv">${x(memo)}</span></div>`;
  }
  h += descs.length
    ? descs.map(d => `<div class="project-detail-item" onclick="openDescModal(${d.id})">
        <span class="dk">${x(d.attribute_name || 'Detail')}</span>
        <span class="dv">${x(d.attribute_text || '')}</span>
      </div>`).join('')
    : (!memo ? `<div class="empty project-side-empty"><p>No details</p></div>` : '');
  h += `</div>`;
  q('#left-panel-inner').innerHTML = h;
}

function projItem(p){
  const act=S.project?.id===p.id, col=p.color_code||'#6366f1';
  return `<div class="li ${act?'active':''}" onclick="selectProject(${p.id})">
    <div class="dot" style="background:${col}"></div><span class="name">${x(p.name)}</span>
    <div class="acts">
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();openProjectModal(${p.id})">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="event.stopPropagation();delProject(${p.id})" style="color:var(--danger)">${I.delete}</button>
    </div>
  </div>`;
}

function tglFolder(id){ S.openFolders.has(id)?S.openFolders.delete(id):S.openFolders.add(id); renderSidebar(); }

// ═══ WELCOME ═══════════════════════════════════════════
function renderWelcome() {
  q('#main-inner')?.classList.remove('relation-main');
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.book}</div><h3>${t('welcomeTitle')}</h3>
    <p>${t('welcomeText')}</p>
    <button class="btn btn-p" onclick="openProjectModal()">${I.plus} ${t('createProject')}</button>
  </div>`;
}

function renderRelList(relations){
  const list = q('#rel-list');
  if(!list) return;
  list.innerHTML = '';
  if(!relations.length){
    list.innerHTML = `<div class="empty" style="padding:18px 10px"><p>ยังไม่มีความสัมพันธ์ที่แสดงอยู่</p></div>`;
    return;
  }
  for(const rel of relations){
    const card = document.createElement('div'); card.className='rel-card';
    const badge = document.createElement('span'); badge.className='rel-type-badge';
    badge.style.borderColor = rel.color_code || 'transparent';
    badge.style.color = rel.color_code || 'var(--t1)';
    badge.textContent = rel.relation_name || 'ไม่ระบุ';

    const body = document.createElement('div'); body.className='rel-card-content';
    const title = document.createElement('div');
    title.textContent = rel.kind==='obtl' ? `${rel.from_cat} / ${rel.from_name} → ${rel.to_tl} / ${rel.to_name}` : rel.kind==='tltl' ? `${rel.from_tl} / ${rel.from_name} → ${rel.to_tl} / ${rel.to_name}` : `${rel.from_cat} / ${rel.from_name} → ${rel.to_cat} / ${rel.to_name}`;
    const subtitle = document.createElement('span'); subtitle.className='rel-cat';
    subtitle.textContent = rel.kind==='obtl' ? 'Object ↔ Event' : rel.kind==='tltl' ? 'Event ↔ Event' : 'Object ↔ Object';
    body.appendChild(title);
    body.appendChild(subtitle);

    const actions = document.createElement('div'); actions.className='rel-card-actions';
    const editBtn = document.createElement('button'); editBtn.className='btn btn-s btn-i'; editBtn.innerHTML=I.edit;
    editBtn.onclick = () => openRelModal(rel.kind, rel);
    const deleteBtn = document.createElement('button'); deleteBtn.className='btn btn-s btn-i'; deleteBtn.innerHTML=I.delete;
    deleteBtn.onclick = () => delRel(rel.id, rel.kind);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(badge);
    card.appendChild(body);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

// ═══ PROJECT VIEW ══════════════════════════════════════
async function selectProject(id) {
  const project = await api.project.get(id);
  if(!project) return;
  upsertProjectTab(project);
  await activateProject(project);
}

async function activateProject(project) {
  S.activeModule = 'director';
  S.project = project; S.object=null; S.timeline=null; S.map=null; S.mapAreaId=null; S.projectHashtagId=null;
  S.activeProjectTabId = project.id;
  const cats = await api.category.getAll(project.id); S.category=cats[0]||null;
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]')?.classList.add('active');
  renderProjectTabs();
  updateTopNavButton();
  await renderProject();
}

async function renderProject(){
  q('#main-inner')?.classList.remove('relation-main');
  const p=S.project, col=p.color_code||'#6366f1';
  const cats = await api.category.getAll(p.id);
  if(S.view === 'projects') await renderProjectSidebar();

  let h = `<div class="ch">
    <div class="cdot" style="background:${col}"></div><h2>${x(p.name)}</h2>
    ${p.codename?`<span class="tag">${x(p.codename)}</span>`:''}
    <button class="btn btn-s btn-i" onclick="openProjectModal(${p.id})">${I.edit}</button>
    <button class="btn btn-p" onclick="openCategoryModal()" style="padding:6px 12px;font-size:12.5px">${I.plus} Category</button>
  </div>`;


  if(!cats.length){
    h += `<div class="empty"><div class="ei">${I.pin}</div><h3>ยังไม่มี Category</h3>
      <p>เพิ่ม Category เช่น ตัวละคร, อาวุธ</p>
      <button class="btn btn-p" onclick="openCategoryModal()">${I.plus} เพิ่ม Category</button></div>`;
  } else {
    h += `<div id="cat-body"></div>`;
  }
  q('#main-inner').innerHTML = h;
  if(S.category) await renderCatBody(S.category.id);
}

function tglDesc(){ S.descOpen=!S.descOpen; renderProject(); }

async function selectCategory(id){
  const cats = await api.category.getAll(S.project.id);
  S.category = cats.find(c=>c.id===id)||null; S.object=null;
  await renderProject();
}

function setCatView(view){ S.catView=view; if(S.category) renderCatBody(S.category.id); }

async function renderCatBody(catId){
  const el=q('#cat-body'); if(!el) return;
  const objs = await api.object.getAll(catId);

  let h = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div class="view-toggles" style="display:flex;background:var(--surface);padding:3px;border-radius:var(--r);border:1px solid var(--border)">
      <button class="btn btn-g ${S.catView==='list'?'active':''}" style="padding:4px 10px;font-size:12px;border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setCatView('list')">${I.list} List</button>
      <button class="btn btn-g ${S.catView==='table'?'active':''}" style="padding:4px 10px;font-size:12px;border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setCatView('table')">${I.table} Table</button>
    </div>
    <span style="font-size:11px;color:var(--t3);flex:1">${objs.length} รายการ</span>
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openObjectModal(${catId})">${I.plus} เพิ่ม</button>
    <button class="btn btn-s btn-i" onclick="openTemplateModal(${catId})" title="จัดการ Fields">${I.fields}</button>
  </div>`;

  if(S.catView === 'table'){
    const tmpls   = await api.template.getAll(catId);
    const attrMap = {};
    for(const o of objs){
      const attrs = await api.object.getAttrs(o.id);
      attrMap[o.id] = {};
      for(const a of attrs) attrMap[o.id][a.id] = a.attribute_value ?? '';
    }
    
    // Initialize visible columns state
    const visColKey = `visibleCols_${catId}`;
    let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
    if(Object.keys(visibleCols).length === 0) {
      visibleCols = tmpls.reduce((acc, t) => ({...acc, [t.id]: true}), {});
    }
    
    h += `<div style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openColumnVisibilityModal(${catId})">${I.settings} เลือกคอลัมน์ที่แสดง</button>
    </div>`;
    
    h += `<div class="table-container">`;
    if(!objs.length){
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>ยังไม่มีข้อมูล</p></div>`;
    } else {
      h += `<div class="table-wrapper"><table class="dark-table"><thead><tr><th onclick="sortTable(${catId},'name')"><div class="sortable-header">ชื่อ <span class="sort-indicator">▲</span></div></th>`;
      for(const t of tmpls) {
        const visible = visibleCols[t.id] ? '' : 'display:none';
        h += `<th style="${visible}" onclick="sortTable(${catId},${t.id})" data-template-id="${t.id}"><div class="sortable-header">${x(t.description)} <span class="sort-indicator">▲</span></div></th>`;
      }
      h += `<th style="width:80px;text-align:center">จัดการ</th></tr></thead><tbody>`;
      for(const o of objs){
        const col=o.color_code||'#6366f1', act=S.object?.id===o.id;
        h += `<tr class="objrow ${act?'active':''}" id="row-${o.id}" onclick="selectObject(${o.id})" data-sort-name="${x(o.name).toLowerCase()}">
          <td><div style="display:flex;align-items:center;gap:8px">
            <div class="odot" style="background:${col}"></div>
            <input class="table-inline-input table-name-input" data-oid="${o.id}" data-color="${o.color_id??o.color??''}" value="${x(o.name)}">
          </div></td>`;
        for(const t of tmpls){
          const val = attrMap[o.id]?.[t.id] ?? '';
          const visible = visibleCols[t.id] ? '' : 'display:none';
          h += `<td style="${visible}" data-template-id="${t.id}" data-sort-value="${x(val).toLowerCase()}"><input class="table-inline-input table-attr-input" data-oid="${o.id}" data-tid="${t.id}" value="${x(val)}"></td>`;
        }
        h += `<td><div style="display:flex;gap:4px;justify-content:center" onclick="event.stopPropagation()">
          <button class="btn btn-g btn-i" onclick="openObjectModal(null,${o.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="delObject(${o.id})" style="color:var(--danger)">${I.delete}</button>
        </div></td></tr>`;
      }
      h += `</tbody></table></div>`;
    }
    h += `</div>`;
  } else {
    h += `<div class="split"><div><div class="objlist" id="objlist">`;
    if(!objs.length){
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>ยังไม่มีข้อมูล</p></div>`;
    } else {
      for(const o of objs){
        const col=o.color_code||'#6366f1', act=S.object?.id===o.id;
        h += `<div class="objrow ${act?'active':''}" id="row-${o.id}" onclick="selectObject(${o.id})">
          <div class="odot" style="background:${col}"></div><span class="oname">${x(o.name)}</span>
        </div>`;
      }
    }
    h += `</div></div><div id="detail-panel">${S.object?'':emptyDetail()}</div></div>`;
  }

  el.innerHTML = h;
  if(S.catView==='table') bindTableInlineEditors();
  else if(S.object) await renderDetail(S.object.id);
}

function flashSaved(el){
  if(!el) return;
  el.classList.remove('saved-flash'); void el.offsetWidth; el.classList.add('saved-flash');
}

function bindTableInlineEditors(){
  const onEnterBlur = (input, saveFn) => {
    input.dataset.prev = input.value.trim();
    const commit = async () => {
      const newVal = input.value.trim();
      if(newVal === input.dataset.prev) return;
      await saveFn(newVal);
      input.dataset.prev = newVal;
      flashSaved(input);
    };
    input.addEventListener('blur', ()=>commit().catch(()=>toast('บันทึกข้อมูลไม่สำเร็จ','err')));
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); input.blur(); } });
  };
  document.querySelectorAll('.table-name-input').forEach(input=>{
    input.addEventListener('click', e=>e.stopPropagation());
    onEnterBlur(input, async newName=>{
      const oid=+input.dataset.oid, color=input.dataset.color?+input.dataset.color:null;
      if(!newName) return;
      await api.object.update(oid, newName, color);
    });
  });
  document.querySelectorAll('.table-attr-input').forEach(input=>{
    input.addEventListener('click', e=>e.stopPropagation());
    onEnterBlur(input, async newVal=>{
      await api.object.upsertAttr(+input.dataset.oid, +input.dataset.tid, newVal);
    });
  });
}

async function openColumnVisibilityModal(catId) {
  const tmpls = await api.template.getAll(catId);
  const visColKey = `visibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  
  // Setup defaults if not exist
  let hasDiff = false;
  for (const t of tmpls) {
    if (visibleCols[t.id] === undefined) {
      visibleCols[t.id] = true;
      hasDiff = true;
    }
  }
  if (hasDiff) {
    localStorage.setItem(visColKey, JSON.stringify(visibleCols));
  }
  
  let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
  
  const allChecked = tmpls.every(t => visibleCols[t.id] !== false);
  html += `
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; padding:6px 0;">
      <input type="checkbox" id="col-vis-all" ${allChecked ? 'checked' : ''} onchange="toggleAllColumnsFromModal(${catId}, this.checked)">
      <strong>แสดงทั้งหมด</strong>
    </label>
    <div style="height:1px; background:var(--border); margin:4px 0;"></div>
  `;

  for(const t of tmpls) {
    const isChecked = visibleCols[t.id] !== false;
    html += `
      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; padding:4px 0;">
        <input type="checkbox" class="col-vis-check" data-tid="${t.id}" ${isChecked ? 'checked' : ''} onchange="toggleColumnVisibilityFromModal(${catId}, ${t.id}, this.checked)">
        <span>${x(t.description)}</span>
      </label>
    `;
  }
  
  html += `</div>`;
  html += `<div class="mfoot">
    <button class="btn btn-p" onclick="closeModal()">ตกลง</button>
  </div>`;
  
  openModal('เลือกคอลัมน์ที่แสดง', html);
}

function toggleColumnVisibilityFromModal(catId, templateId, isChecked) {
  const visColKey = `visibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  visibleCols[templateId] = isChecked;
  localStorage.setItem(visColKey, JSON.stringify(visibleCols));

  // Update "all" checkbox state inside modal
  const allCheckbox = q('#col-vis-all');
  if (allCheckbox) {
    const checkboxes = document.querySelectorAll('.col-vis-check');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    allCheckbox.checked = allChecked;
  }

  // Toggle column visibility in-place without re-rendering the whole table
  _applyColumnVisibility(templateId, isChecked);
}

function toggleAllColumnsFromModal(catId, isChecked) {
  const visColKey = `visibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');

  const checkboxes = document.querySelectorAll('.col-vis-check');
  checkboxes.forEach(cb => {
    cb.checked = isChecked;
    const tid = cb.dataset.tid;
    visibleCols[tid] = isChecked;
    _applyColumnVisibility(tid, isChecked);
  });

  localStorage.setItem(visColKey, JSON.stringify(visibleCols));
}

// Apply show/hide to all th/td with a given template id without touching the modal
function _applyColumnVisibility(templateId, isVisible) {
  const disp = isVisible ? '' : 'none';
  document.querySelectorAll(`[data-template-id="${templateId}"]`).forEach(el => {
    el.style.display = disp;
  });
}

function sortTable(catId, sortBy) {
  const table = q('.dark-table');
  if(!table) return;
  
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Determine sort direction
  const th = table.querySelector(`th[data-template-id="${sortBy}"]`) || table.querySelector('th:first-child');
  const header = th?.querySelector('.sortable-header');
  const currentSort = header?.className || '';
  const isAscending = currentSort.includes('sort-asc');
  
  // Sort rows
  rows.sort((a, b) => {
    let aVal, bVal;
    if(sortBy === 'name') {
      aVal = a.dataset.sortName || '';
      bVal = b.dataset.sortName || '';
    } else {
      const aCell = a.querySelector(`td[data-template-id="${sortBy}"]`);
      const bCell = b.querySelector(`td[data-template-id="${sortBy}"]`);
      aVal = aCell?.dataset.sortValue || '';
      bVal = bCell?.dataset.sortValue || '';
    }
    
    const comparison = aVal.localeCompare(bVal, 'th');
    return isAscending ? -comparison : comparison;
  });
  
  // Update header classes
  table.querySelectorAll('.sortable-header').forEach(h => {
    h.classList.remove('sort-asc', 'sort-desc');
  });
  header?.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
  
  // Re-append sorted rows
  rows.forEach(row => tbody.appendChild(row));
}

function emptyDetail(){ return `<div class="empty" style="padding:50px 20px"><div class="ei">${I.search}</div><p>เลือกรายการเพื่อดูรายละเอียด</p></div>`; }

async function selectObject(id){
  S.object = await api.object.get(id);
  document.querySelectorAll('.objrow').forEach(r=>r.classList.remove('active'));
  const row=q(`#row-${id}`); if(row) row.classList.add('active');
  await renderDetail(id);
}

async function buildDetail(oid){
  const obj=await api.object.get(oid), attrs=await api.object.getAttrs(oid);
  const tags = await api.object.getTags(oid);
  const relationRows = await getObjectRelationRows(oid);
  const col=obj.color_code||'#6366f1';
  const objNote = obj.note || '';
  let h = `<div class="odetail">
    <div class="dhead">
      <div class="odot" style="background:${col};width:11px;height:11px"></div>
      <span class="dtitle">${x(obj.name)}</span>
      <button class="btn btn-g btn-i" onclick="openObjectModal(null,${obj.id})">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="delObject(${obj.id})" style="color:var(--danger)">${I.delete}</button>
    </div>
    <div class="detail-content">
    <div class="attrs" id="af-${oid}">`;
  if(!attrs.length){
    h += `<div class="empty" style="padding:24px 0"><p style="font-size:12px">ยังไม่มี Field</p>
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openTemplateModal(${S.category.id})">${I.fields} จัดการ Fields</button></div>`;
  } else {
    for(const a of attrs){
      const val=a.attribute_value||'', uid=`ai-${oid}-${a.id}`;
      h += `<div class="aitem"><label>${x(a.description)}</label>`;
      if(a.attribute_type==='textarea') h += `<textarea id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="auto-expand detail-attr-field" oninput="autoExpandTextarea(this)">${x(val)}</textarea>`;
      else h += `<input type="${a.attribute_type==='number'?'number':'text'}" id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="detail-attr-field" value="${x(val)}">`;
      h += `</div>`;
    }
  }
  h += `</div>
    <div class="note-section">
      <label style="display:flex;align-items:center;gap:4px"><span class="icon" style="width:12px;height:12px">${I.edit}</span> โน็ต (Note)</label>
      <textarea class="note-textarea auto-expand detail-note-field" id="note-${oid}" data-oid="${oid}" placeholder="เพิ่มหมายเหตุเพิ่มเติมสำหรับรายการนี้..." oninput="autoExpandTextarea(this)">${x(objNote)}</textarea>
    </div>
    <div class="detail-relations">
      <div class="tags-head"><span>ความสัมพันธ์ของรายการนี้</span></div>
      <div class="relation-mini-list">${renderObjectRelationRows(relationRows)}</div>
    </div>
    <div class="detail-tags">
      <div class="tags-head">
        <span>ป้ายกำกับของรายการ</span>
        <div class="tag-add-box">
          <input id="tag-search-${oid}" class="tag-search-input" type="text" placeholder="พิมพ์ค้นหา Tag เพื่อเพิ่ม" oninput="renderTagSuggestions(${oid})">
          <div class="tag-suggestions" id="tag-sug-${oid}"></div>
        </div>
      </div>
      <div class="htags-grid" id="tag-list-${oid}">${tags.map(t=>`<span class="htag-item" style="border-color:${t.color_code||'#6366f1'}"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span><button class="btn btn-s btn-i" title="ลบ Tag" onclick="removeObjectTag(${oid},${t.id})">${I.close}</button></span>`).join('')}</div>
    </div>
    </div>
  </div>`;
  return h;
}

async function getObjectRelationRows(oid){
  if(!S.project?.id) return [];
  const [allObjs, obob, obtl] = await Promise.all([
    api.relation.getProjectObjects(S.project.id),
    api.relation.getOBOB(S.project.id),
    api.relation.getOBTL(S.project.id),
  ]);
  const selected = allObjs.find(o=>o.id===oid);
  if(!selected) return [];

  const selectedKey = `${selected.category_name}::${selected.name}`;
  const rows = [];

  for(const r of obob){
    if(r.from_cat===selected.category_name && r.from_name===selected.name){
      rows.push({
        kind: 'Object',
        relation: r.relation_name || 'สัมพันธ์',
        target: `${r.to_cat} / ${r.to_name}`,
        color: r.color_code || '#8b9',
      });
    } else if(r.to_cat===selected.category_name && r.to_name===selected.name){
      rows.push({
        kind: 'Object',
        relation: r.relation_name || 'สัมพันธ์',
        target: `${r.from_cat} / ${r.from_name}`,
        color: r.color_code || '#8b9',
      });
    }
  }

  for(const r of obtl){
    const fromKey = `${r.from_cat}::${r.from_name}`;
    if(fromKey!==selectedKey) continue;
    rows.push({
      kind: 'Event',
      relation: r.relation_name || 'สัมพันธ์',
      target: `${r.to_tl} / ${r.to_name}${r.s_years ? ` (${fmtDate(r.s_day,r.s_month,r.s_years,0,0)})` : ''}`,
      color: r.color_code || '#8b9',
    });
  }
  return rows;
}

function renderObjectRelationRows(rows){
  if(!rows.length) return `<div class="empty" style="padding:12px 0;font-size:12px">ยังไม่มี Relation</div>`;
  return rows.map(r=>`<div class="mini-rel-item">
    <span class="mini-rel-dot" style="background:${x(r.color)}"></span>
    <span class="mini-rel-kind">${x(r.kind)}</span>
    <span class="mini-rel-rel">${x(r.relation)}</span>
    <span class="mini-rel-to">${x(r.target)}</span>
  </div>`).join('');
}

async function renderTagSuggestions(oid){
  const input = q(`#tag-search-${oid}`);
  const container = q(`#tag-sug-${oid}`);
  const current = await api.object.getTags(oid);
  if(!input || !container) return;
  const value = input.value.trim().toLowerCase();
  const tags = await api.hashtag.getAll();
  const selectedIds = new Set(current.map(t=>t.id));
  const filtered = tags.filter(t => !selectedIds.has(t.id) && (!value || t.tag_name.toLowerCase().includes(value)));
  const recent = filtered
    .sort((a,b)=> (b.update_at||'').localeCompare(a.update_at||''))
    .slice(0,10);
  container.innerHTML = recent.length
    ? recent.map(t=>`<div class="htag-item" style="border-color:${t.color_code||'#6366f1'};cursor:pointer" onclick="addObjectTag(${oid},${t.id})"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span></div>`).join('')
    : `<div class="empty" style="padding:10px 6px;font-size:12px;color:var(--t3)">ไม่มี Tag ให้เลือก</div>`;
}

async function addObjectTag(oid, tagId){
  await api.object.addTag(oid, tagId);
  await renderDetail(oid);
}

async function removeObjectTag(oid, tagId){
  await api.object.removeTag(oid, tagId);
  await renderDetail(oid);
}

async function saveAttrs(oid){
  const form=q(`#af-${oid}`); if(!form) return;
  for(const inp of form.querySelectorAll('[data-tid]')) await api.object.upsertAttr(oid,+inp.dataset.tid,inp.value);
  toast('บันทึกสำเร็จ','ok');
  if(S.catView==='table') await renderCatBody(S.category.id);
}

function autoExpandTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
}

async function saveNote(oid) {
  const noteEl = q(`#note-${oid}`);
  if(!noteEl) return;
  const noteText = noteEl.value.trim();
  await api.object.updateNote(oid, noteText);
  toast('บันทึกสำเร็จ','ok');
}

function bindDetailAutoSave(oid) {
  const onBlurSave = (el, saveFn) => {
    el.dataset.prev = el.value;
    const commit = async () => {
      if(el.value === el.dataset.prev) return;
      await saveFn(el.value);
      el.dataset.prev = el.value;
      flashSaved(el);
    };
    el.addEventListener('blur', () => commit().catch(() => toast('บันทึกข้อมูลไม่สำเร็จ', 'err')));
    el.addEventListener('keydown', e => { if(e.key === 'Enter' && el.tagName !== 'TEXTAREA') { e.preventDefault(); el.blur(); } });
  };
  document.querySelectorAll('.detail-attr-field').forEach(el => {
    onBlurSave(el, async newVal => {
      await api.object.upsertAttr(+el.dataset.oid, +el.dataset.tid, newVal);
    });
  });
  const noteEl = q(`.detail-note-field`);
  if(noteEl) {
    onBlurSave(noteEl, async newVal => {
      await api.object.updateNote(+noteEl.dataset.oid, newVal.trim());
    });
  }
}

async function renderDetail(oid){
  const panel=q('#detail-panel'); if(!panel) return;
  panel.innerHTML = await buildDetail(oid);
  // Auto-expand all textareas
  setTimeout(() => {
    panel.querySelectorAll('.auto-expand').forEach(ta => {
      autoExpandTextarea(ta);
    });
  }, 0);
  bindDetailAutoSave(oid);
  renderTagSuggestions(oid);
}

// ═══ TIMELINE VIEW ═════════════════════════════════════
