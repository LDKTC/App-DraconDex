// Reusable modal pickers: the novel/folder tree picker, icon refs, the color
// picker (+ inline add), the symbol picker and hashtagSelector's tag chips.
// Also carries switchProjectTab/closeProjectTab, which sit between the novel
// picker and the color picker in the original file — kept in place so this
// family stays a verbatim slice of core.js.
// ═══ NOVEL PICKER ════════════════════════════════════════
function buildNovelPickerHtml(pickId, currentName, excludeIds) {
  const label = currentName || '— select novel —';
  const exStr = excludeIds ? [...excludeIds].join(',') : '';
  return `<div class="novel-picker" id="np-wrap-${pickId}" data-selected-id="" data-exclude-ids="${exStr}">
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(label)}</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">
      ${buildNpTree(pickId, excludeIds)}
    </div>
  </div>`;
}

function buildNpTree(pickId, excludeIds) {
  const ex = excludeIds || new Set();
  let html = '';
  for (const f of (S.folders || [])) {
    const open = S.npOpenFolders.has(f.id);
    const fps = (S.projects || []).filter(p => p.folder_id === f.id && !ex.has(p.id));
    const col = f.color_code || '#6366f1';
    html += `<div class="np-folder">
      <div class="np-folder-head" onclick="event.stopPropagation();toggleNpFolder('${pickId}',${f.id})">
        <svg style="width:8px;height:8px;flex-shrink:0;transform:rotate(${open?90:0}deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="color:${col};line-height:1;display:flex;align-items:center">${I.folder}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(f.name)}</span>
        <span style="color:var(--t3);font-size:calc(11px * var(--fsc,1))">${fps.length}</span>
      </div>
      ${open ? fps.map(p => `<div class="np-item" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('') : ''}
    </div>`;
  }
  const unfiled = (S.projects || []).filter(p => !p.folder_id && !ex.has(p.id));
  if (unfiled.length) {
    if ((S.folders||[]).length) html += `<div style="border-top:1px solid var(--border);margin:4px 0"></div>`;
    html += unfiled.map(p => `<div class="np-item np-unfiled" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('');
  }
  if (!html) html = `<div style="padding:10px 12px;color:var(--t3);font-size:calc(13px * var(--fsc,1))">No novels available</div>`;
  return html;
}

function buildLinkedNovelPicker(pickId, linkedProjects, currentName, onSelectCb) {
  const label = currentName || '— select novel —';
  const ids = new Set((linkedProjects || []).map(p => p.id));
  let html = '';
  for (const f of (S.folders || [])) {
    const fps = (linkedProjects || []).filter(p => p.folder_id === f.id);
    if (!fps.length) continue;
    const open = S.npOpenFolders.has(f.id);
    const col = f.color_code || '#6366f1';
    html += `<div class="np-folder">
      <div class="np-folder-head" onclick="event.stopPropagation();toggleNpFolder('${pickId}',${f.id})">
        <svg style="width:8px;height:8px;flex-shrink:0;transform:rotate(${open?90:0}deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="color:${col};line-height:1;display:flex;align-items:center">${I.folder}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(f.name)}</span>
        <span style="color:var(--t3);font-size:calc(11px * var(--fsc,1))">${fps.length}</span>
      </div>
      ${open ? fps.map(p => `<div class="np-item" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('') : ''}
    </div>`;
  }
  const unfiled = (linkedProjects || []).filter(p => !p.folder_id);
  if (unfiled.length) {
    if ((S.folders||[]).length && html) html += `<div style="border-top:1px solid var(--border);margin:4px 0"></div>`;
    html += unfiled.map(p => `<div class="np-item np-unfiled" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${p.id},'${x(p.name)}')">${x(p.name)}</div>`).join('');
  }
  if (!html) html = `<div style="padding:10px 12px;color:var(--t3);font-size:calc(13px * var(--fsc,1))">No linked novels</div>`;
  const cbAttr = onSelectCb ? ` data-on-select="${x(onSelectCb)}"` : '';
  return `<div class="novel-picker" id="np-wrap-${pickId}" data-selected-id=""${cbAttr}>
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(label)}</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">${html}</div>
  </div>`;
}

function toggleNovelPicker(pickId) {
  const drop = q(`#np-drop-${pickId}`);
  if (!drop) return;
  const isOpen = drop.style.display !== 'none';
  document.querySelectorAll('.np-dropdown').forEach(d => d.style.display = 'none');
  if (!isOpen) drop.style.display = '';
}

function toggleNpFolder(pickId, folderId) {
  if (S.npOpenFolders.has(folderId)) S.npOpenFolders.delete(folderId);
  else S.npOpenFolders.add(folderId);
  const drop = q(`#np-drop-${pickId}`);
  if (!drop) return;
  const wrap = q(`#np-wrap-${pickId}`);
  const exStr = wrap?.dataset.excludeIds || '';
  const ex = new Set(exStr.split(',').filter(Boolean).map(Number));
  drop.innerHTML = buildNpTree(pickId, ex);
}

function selectNovelFromPicker(pickId, projId, name) {
  const lbl = q(`#np-label-${pickId}`);
  if (lbl) lbl.textContent = name;
  const drop = q(`#np-drop-${pickId}`);
  if (drop) drop.style.display = 'none';
  const wrap = q(`#np-wrap-${pickId}`);
  if (wrap) {
    wrap.dataset.selectedId = projId;
    const cb = wrap.dataset.onSelect;
    if (cb && typeof window[cb] === 'function') window[cb](projId);
  }
}

async function switchProjectTab(id){
  const project = await api.project.get(id);
  if(!project){
    await closeProjectTab(id);
    return;
  }
  upsertProjectTab(project);
  await activateProject(project);
}

async function closeProjectTab(id){
  const idx = S.projectTabs.findIndex(t => t.id === id);
  if(idx < 0) return;
  const wasActive = S.activeModule === 'director' && S.activeProjectTabId === id;
  S.projectTabs.splice(idx, 1);
  if(!wasActive){
    renderProjectTabs();
    return;
  }
  const next = S.projectTabs[idx] || S.projectTabs[idx - 1] || null;
  if(next){
    await switchProjectTab(next.id);
    return;
  }
  S.activeProjectTabId = null;
  returnToProjectList();
}

// Shared `svg:<I-key>` / `sym:<glyph>` / `img:<dataURI>` icon-ref renderer
// (the value shape iconPicker() writes) — used by hub.js's moduleIconHtml
// and Classifier's own object icons.
function iconRefHtml(ref, fallbackHtml) {
  if (ref) {
    if (ref.startsWith('sym:')) return `<span class="kicon-glyph">${x(ref.slice(4))}</span>`;
    if (ref.startsWith('img:')) return `<img src="${x(ref.slice(4))}" class="kicon-img-icon" alt="">`;
    const key = ref.startsWith('svg:') ? ref.slice(4) : ref;
    if (I[key]) return I[key];
  }
  return fallbackHtml;
}

// ═══ COLOR PICKER ══════════════════════════════════════
function buildColorSwatches(colors, selId){
  return colors.map(c =>
    `<div class="cswatch ${selId===c.id?'sel':''}" style="background:${c.color_code}" data-cid="${c.id}" onclick="pickColor(this,${c.id})"></div>`
  ).join('');
}

// #cpicker-grid always lists every color sorted by hex code, independent of use/recency order.
const sortColorsByHex = (colors) => [...(colors||[])].sort((a,b) => a.color_code.localeCompare(b.color_code));

async function colorPicker(selId=null) {
  S.recentColors = await api.color.getRecent();
  const recent = buildColorSwatches(S.recentColors, selId);
  const all    = buildColorSwatches(sortColorsByHex(S.colors), selId);
  const selColor = (S.colors || []).find(c => c.id === selId) || (S.recentColors || []).find(c => c.id === selId);
  const nativeVal = selColor?.color_code || '#6366f1';
  return `<div class="cpicker-wrap">
    <div class="cpicker-custom">
      <input type="color" id="cpicker-native" value="${nativeVal}" oninput="onColorPickerPreview(this.value)" title="เลือกสี">
      <span class="cpicker-hex-lbl" id="cpicker-hex-lbl">${nativeVal}</span>
      <button class="btn btn-s" type="button" onclick="addColorFromPicker()">เพิ่มสีใหม่</button>
    </div>
    <div class="cpicker-row-lbl">ใช้ล่าสุด</div>
    <div class="crecent-row" id="cpicker-recent">${recent || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>'}</div>
    <div class="cpicker-row-lbl">สีทั้งหมด</div>
    <div class="cgrid" id="cpicker-grid">${all}</div>
    <input type="hidden" id="sel-color" value="${selId||''}">
  </div>`;
}

// ═══ SYMBOL PICKER ═════════════════════════════════════
function buildSymbolSwatches(symbols, selId, hiddenInputId, previewId, customInputId){
  return symbols.map(s =>
    `<button type="button" class="symswatch ${selId===s.id?'sel':''}" title="${x(s.label||'')}" onclick="pickSymbol('${hiddenInputId}','${previewId||''}','${customInputId||''}',this,${s.id},'${x(s.glyph).replace(/'/g,"\\'")}')">${x(s.glyph)}</button>`
  ).join('');
}

async function symbolPicker(hiddenInputId, selId=null, previewId=null, customInputId=null) {
  const symbols = await api.world.getSymbolCollection();
  return `<div class="cpicker-wrap">
    <div class="cgrid">${buildSymbolSwatches(symbols, selId, hiddenInputId, previewId, customInputId) || '<span class="cpicker-empty">No symbols available</span>'}</div>
    <input type="hidden" id="${hiddenInputId}" value="${selId||''}">
  </div>`;
}

function pickSymbol(hiddenInputId, previewId, customInputId, el, id, glyph){
  const input = q(`#${hiddenInputId}`);
  if (input) input.value = id;
  el.parentElement.querySelectorAll('.symswatch').forEach(n => n.classList.remove('sel'));
  el.classList.add('sel');
  if (previewId) { const p = q(`#${previewId}`); if (p) p.textContent = glyph || '+'; }
  if (customInputId) { const c = q(`#${customInputId}`); if (c) c.value = glyph || ''; }
}

// Typing a custom glyph deselects any picked collection symbol — the two are mutually exclusive.
function onSymbolCustomInput(hiddenInputId, previewId, value){
  const preview = q(`#${previewId}`);
  if (preview) preview.textContent = value || '+';
  const input = q(`#${hiddenInputId}`);
  if (input) {
    input.value = '';
    input.closest('.cpicker-wrap')?.querySelectorAll('.symswatch').forEach(n => n.classList.remove('sel'));
  }
}

async function hashtagSelector(prefix, selectedIds){
  const tags = await api.hashtag.getAll();
  const selected = (selectedIds||[]).map(t=>typeof t==='object'?t.id:parseInt(t,10)).filter(Boolean);
  const selectedTags = tags.filter(t => selected.includes(t.id));
  return `<div class="fg"><label>ป้ายกำกับ (Tags)</label>
    <input id="${prefix}-tag-search" class="tag-search-input" type="text" placeholder="พิมพ์ค้นหา Tag..." oninput="renderModalTagSuggestions('${prefix}')">
    <div class="tag-add-box">
      <div class="tag-suggestions" id="${prefix}-tag-sug"></div>
      <div class="htag-row" id="${prefix}-tag-list">${selectedTags.map(t=>`<span class="htag-chip" style="border-color:${t.color_code||'#6366f1'}"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span><button class="btn btn-s btn-i" type="button" onclick="removeModalTag('${prefix}',${t.id})">✕</button></span>`).join('')}</div>
    </div>
    <input type="hidden" id="${prefix}-tag-value" value="${selected.join(',')}">
  </div>`;
}

function getModalTagIds(prefix){
  const input = q(`#${prefix}-tag-value`);
  return input ? input.value.split(',').filter(Boolean).map(Number) : [];
}

function setModalTagIds(prefix, ids){
  const input = q(`#${prefix}-tag-value`);
  if(input) input.value = ids.filter(Boolean).join(',');
}

async function renderModalTagSuggestions(prefix){
  const input = q(`#${prefix}-tag-search`);
  const container = q(`#${prefix}-tag-sug`);
  if(!input || !container) return;
  const value = input.value.trim().toLowerCase();
  const tags = await api.hashtag.getAll();
  const selectedIds = new Set(getModalTagIds(prefix));
  const filtered = tags.filter(t => !selectedIds.has(t.id) && (!value || t.tag_name.toLowerCase().includes(value)));
  const recent = filtered
    .sort((a,b)=> (b.update_at||'').localeCompare(a.update_at||''))
    .slice(0,5);
  container.innerHTML = recent.length
    ? recent.map(t=>`<div class="htag-item" style="border-color:${t.color_code||'#6366f1'};cursor:pointer" onclick="addModalTag('${prefix}',${t.id})"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span></div>`).join('')
    : `<div class="empty" style="padding:10px 6px;font-size:calc(12px * var(--fsc,1));color:var(--t3)">ไม่มี Tag ให้เลือก</div>`;
}

function renderModalSelectedTags(prefix){
  const ids = new Set(getModalTagIds(prefix));
  const list = q(`#${prefix}-tag-list`);
  if(!list) return;
  api.hashtag.getAll().then(tags => {
    const selectedTags = tags.filter(t => ids.has(t.id));
    list.innerHTML = selectedTags.map(t=>`<span class="htag-chip" style="border-color:${t.color_code||'#6366f1'}"><span class="hn" style="color:${t.color_code||'#6366f1'}">#${x(t.tag_name)}</span><button class="btn btn-s btn-i" type="button" onclick="removeModalTag('${prefix}',${t.id})">✕</button></span>`).join('');
  });
}

function addModalTag(prefix, tagId){
  const ids = new Set(getModalTagIds(prefix));
  ids.add(tagId);
  setModalTagIds(prefix, Array.from(ids));
  renderModalSelectedTags(prefix);
  renderModalTagSuggestions(prefix);
}

function removeModalTag(prefix, tagId){
  const ids = getModalTagIds(prefix).filter(id => id !== tagId);
  setModalTagIds(prefix, ids);
  renderModalSelectedTags(prefix);
  renderModalTagSuggestions(prefix);
}

function filterTagSelector(prefix){
  const input = q(`#${prefix}-tag-search`); if(!input) return;
  const filter = input.value.trim().toLowerCase();
  const list = q(`#${prefix}-tag-list`); if(!list) return;
  list.querySelectorAll('label').forEach(label => {
    label.style.display = !filter || label.dataset.name.includes(filter) ? 'inline-flex' : 'none';
  });
}

async function pickColor(el,id) {
  const wrap = el.closest('.cpicker-wrap');
  if (wrap) wrap.querySelectorAll('.cswatch').forEach(s=>s.classList.remove('sel'));
  el.classList.add('sel');
  q('#sel-color').value = id;
  const code = (S.colors||[]).find(c=>c.id===id)?.color_code || (S.recentColors||[]).find(c=>c.id===id)?.color_code;
  if (code) {
    const native = q('#cpicker-native'); if (native) native.value = code;
    const lbl = q('#cpicker-hex-lbl'); if (lbl) lbl.textContent = code;
  }
  await api.color.markUsed(id);
  S.recentColors = await api.color.getRecent();
  const rec = q('#cpicker-recent');
  if (rec) rec.innerHTML = buildColorSwatches(S.recentColors, id) || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>';
}

function onColorPickerPreview(code){
  if(!/^#[0-9a-fA-F]{6}$/.test(code)) return;
  q('#cpicker-hex-lbl').textContent = code;
}

async function addColorFromPicker(){
  const code = q('#cpicker-native')?.value?.trim() || '';
  if(!/^#[0-9a-fA-F]{6}$/.test(code)) return;
  await api.color.add(code);
  S.colors = await api.color.getAll();
  const nc = S.colors.find(c => c.color_code.toLowerCase() === code.toLowerCase());
  if (nc) await api.color.markUsed(nc.id);
  S.recentColors = await api.color.getRecent();
  const grid = q('#cpicker-grid');
  if (grid) grid.innerHTML = buildColorSwatches(sortColorsByHex(S.colors), nc?.id);
  const rec = q('#cpicker-recent');
  if (rec) rec.innerHTML = buildColorSwatches(S.recentColors, nc?.id) || '<span class="cpicker-empty">ยังไม่มีประวัติการใช้สี</span>';
  if (nc) q('#sel-color').value = nc.id;
  toast('เพิ่มสีใหม่เรียบร้อย','ok');
}

