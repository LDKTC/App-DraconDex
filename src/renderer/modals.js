async function openFolderModal(id=null){
  const f=id?S.folders.find(f=>f.id===id):null;
  openModal(f?'✏️ แก้ไขโฟลเดอร์':'📁 โฟลเดอร์ใหม่',`
    <div class="fg"><label>ชื่อ *</label><input id="fn" value="${x(f?.name||'')}"></div>
    <div class="fg"><label>รายละเอียด</label><textarea id="fm">${x(f?.folder_memo||'')}</textarea></div>
    <div class="fg"><label>สี</label>${await colorPicker(f?.folder_color)}</div>
    <div class="mfoot">${f?`<button class="btn btn-d" onclick="delFolder(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${f?'saveFolder('+id+')':'createFolder()'}">${f?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#fn').focus(),60);
}
async function createFolder(){ const n=q('#fn').value.trim(); if(!n) return; await api.folder.create(n,q('#fm').value.trim(),q('#sel-color').value||null); closeModal(); await reloadSidebar(); toast('สร้างโฟลเดอร์เรียบร้อยแล้ว','ok'); }
async function saveFolder(id){ const n=q('#fn').value.trim(); if(!n) return; await api.folder.update(id,n,q('#fm').value.trim(),q('#sel-color').value||null); closeModal(); await reloadSidebar(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delFolder(id){ if(!await uiConfirm('ลบโฟลเดอร์?')) return; await api.folder.delete(id); closeModal(); await reloadSidebar(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: PROJECT ═══════════════════════════════════
async function openProjectModal(id=null){
  const p=id?await api.project.get(id):null;
  const pTags = p?await api.project.getTags(p.id):[];
  openModal(p?'✏️ แก้ไขโปรเจกต์':'📖 โปรเจกต์ใหม่',`
    <div class="fg"><label>ชื่อนิยาย *</label><input id="pn" value="${x(p?.name||'')}"></div>
    <div class="fg"><label>Codename</label><input id="pc" value="${x(p?.codename||'')}" placeholder="เช่น AAA"></div>
    <div class="fg"><label>รายละเอียด</label><textarea id="pm">${x(p?.project_memo||'')}</textarea></div>
    <div class="fg"><label>โฟลเดอร์</label><select id="pf"><option value="">-- ไม่ระบุ --</option>${S.folders.map(f=>`<option value="${f.id}" ${p?.folder_id===f.id?'selected':''}>${x(f.name)}</option>`).join('')}</select></div>
    <div class="fg"><label>สี</label>${await colorPicker(p?.project_color)}</div>
    ${await hashtagSelector('proj', pTags)}
    <div class="mfoot">${p?`<button class="btn btn-d" onclick="delProject(${id})">ลบโปรเจกต์</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${p?'saveProject('+id+')':'createProject()'}">${p?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>{
    q('#pn').focus();
    renderModalTagSuggestions('proj');
  },60);
}
async function createProject(){
  const n=q('#pn').value.trim(); if(!n) return;
  const r=await api.project.create({name:n,codename:q('#pc').value.trim()||null,memo:q('#pm').value.trim(),folderId:q('#pf').value||null,colorId:q('#sel-color').value||null,nexusId:S.nexus?.id??null});
  // set tags
  const tags = getModalTagIds('proj');
  if(r?.lastInsertRowid) await api.project.setTags(r.lastInsertRowid,tags);
  closeModal(); await reloadSidebar(); await selectProject(r.lastInsertRowid); toast('สร้างโปรเจกต์แล้ว','ok');
}
async function saveProject(id){
  const n=q('#pn').value.trim(); if(!n) return;
  await api.project.update(id,{name:n,codename:q('#pc').value.trim()||null,memo:q('#pm').value.trim(),folderId:q('#pf').value||null,colorId:q('#sel-color').value||null});
  const tags = getModalTagIds('proj');
  await api.project.setTags(id,tags);
  closeModal();
  const updated = await api.project.get(id);
  if(updated){
    const idx = S.projectTabs.findIndex(t => t.id === id);
    if(idx >= 0) S.projectTabs[idx] = tabFromProject(updated);
    if(S.project?.id === id) S.project = updated;
  }
  await reloadSidebar();
  if(S.project?.id === id) await renderProject();
  toast('บันทึกเรียบร้อยแล้ว','ok');
}
async function delProject(id){
  if(!await uiConfirm('ลบโปรเจกต์? ข้อมูลทั้งหมดจะหาย')) return;
  const wasActive = S.project?.id === id;
  await api.project.delete(id);
  closeModal();
  S.projectTabs = S.projectTabs.filter(t => t.id !== id);
  await reloadSidebar();
  if(wasActive){
    S.project=null; S.category=null; S.object=null; S.timeline=null; S.map=null; S.mapAreaId=null;
    const next = S.projectTabs[0] || null;
    if(next) await switchProjectTab(next.id);
    else {
      S.activeProjectTabId = null;
      renderProjectTabs();
      renderWelcome();
    }
  } else {
    renderProjectTabs();
  }
  toast('ลบเรียบร้อยแล้ว');
}

// ═══ MODALS: PROJECT DESCRIPTION ═══════════════════════
async function openDescModal(id=null){
  let d=null;
  if(id){ const descs=await api.project.getDesc(S.project.id); d=descs.find(dd=>dd.id===id); }
  openModal(d?'✏️ แก้ไขรายละเอียด':'⭐ เพิ่มรายละเอียด',`
    <div class="fg"><label>ชื่อ Attribute</label><input id="dn" value="${x(d?.attribute_name||'')}" placeholder="เช่น แนวคิด, แรงบันดาลใจ"></div>
    <div class="fg"><label>ข้อความ</label><textarea id="dt" rows="4">${x(d?.attribute_text||'')}</textarea></div>
    <div class="mfoot">${d?`<button class="btn btn-d" onclick="delDesc(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${d?'saveDesc('+id+')':'addDesc()'}">${d?'บันทึก':'เพิ่ม'}</button></div>`);
  setTimeout(()=>q('#dn').focus(),60);
}
async function addDesc(){ const n=q('#dn').value.trim(),t=q('#dt').value.trim(); await api.project.addDesc(S.project.id,n,t); closeModal(); S.descOpen=true; await renderProject(); toast('เพิ่มเรียบร้อยแล้ว','ok'); }
async function saveDesc(id){ const n=q('#dn').value.trim(),t=q('#dt').value.trim(); await api.project.updDesc(id,n,t); closeModal(); await renderProject(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delDesc(id){ if(!await uiConfirm('ลบรายละเอียดนี้?')) return; await api.project.delDesc(id); closeModal(); await renderProject(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: CATEGORY ══════════════════════════════════
async function openCategoryModal(id=null){
  if(!S.project) return;
  let cat=null;
  if(id){ const cats=await api.category.getAll(S.project.id); cat=cats.find(c=>c.id===id); }
  openModal(cat?'✏️ แก้ไข Category':'📌 Category ใหม่',`
    <div class="fg"><label>ชื่อ *</label><input id="cn" value="${x(cat?.category_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(cat?.color)}</div>
    <div class="mfoot">${cat?`<button class="btn btn-d" onclick="delCategory(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${cat?'saveCategory('+id+')':'createCategory()'}">${cat?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#cn').focus(),60);
}
async function createCategory(){ const n=q('#cn').value.trim(); if(!n) return; await api.category.create(S.project.id,n,q('#sel-color').value||null); closeModal(); const cats=await api.category.getAll(S.project.id); S.category=cats[cats.length-1]; await renderProject(); toast('สร้าง Category เรียบร้อยแล้ว','ok'); }
async function saveCategory(id){ const n=q('#cn').value.trim(); if(!n) return; await api.category.update(id,n,q('#sel-color').value||null); closeModal(); const cats=await api.category.getAll(S.project.id); S.category=cats.find(c=>c.id===id)||cats[0]||null; await renderProject(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delCategory(id){ if(!await uiConfirm('ลบ Category? Objects ทั้งหมดจะหายด้วย')) return; await api.category.delete(id); closeModal(); const cats=await api.category.getAll(S.project.id); S.category=cats[0]||null; S.object=null; await renderProject(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: TEMPLATE ══════════════════════════════════
async function openTemplateModal(catId){
  const safeCatId=parseInt(catId,10);
  if(!safeCatId){ toast('Category ไม่ถูกต้อง','err'); return; }
  const tmpls=await api.template.getAll(safeCatId);
  openModal('🧩 จัดการ Fields',`
    <p style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3);margin-bottom:10px">ใช้เพิ่มช่องการเก็บข้อมูลให้กับ Object ในหมวดหมู่นี้ — Field ที่เพิ่มจะใช้ร่วมกันทุก Object ใน Category นี้</p>
    <div class="tlist" id="tlist">${tmpls.map(t=>`<div class="titem" id="tmpl-${t.id}"><span class="tname">${x(t.description)}</span><span class="ttype">${t.attribute_type}</span><button class="btn btn-g btn-i" onclick="delTemplate(${t.id},${safeCatId})" style="color:var(--danger)">❌</button></div>`).join('')||'<p style="color:var(--t3);text-align:center;padding:18px;font-size:calc(12px * var(--fsc,1))">ยังไม่มี Field</p>'}</div>
    <div class="div"></div>
    <div style="display:flex;gap:8px;align-items:flex-end">
      <div class="fg" style="flex:1;margin:0"><label>ชื่อ Field</label><input id="tnew" placeholder="เช่น อายุ, พลังพิเศษ"></div>
      <div class="fg" style="margin:0"><label>ประเภท</label><select id="ttype"><option value="text">text</option><option value="textarea">textarea</option><option value="number">number</option></select></div>
      <button class="btn btn-p" onclick="addTemplate(${safeCatId})">+ เพิ่ม</button>
    </div>`);
  setTimeout(()=>q('#tnew').focus(),60);
}
async function addTemplate(catId){
  try{
    const n=q('#tnew').value.trim(); if(!n) return;
    await api.template.create(catId,n,q('#ttype').value);
    q('#tnew').value='';
    const tmpls=await api.template.getAll(catId);
    q('#tlist').innerHTML=tmpls.map(t=>`<div class="titem" id="tmpl-${t.id}"><span class="tname">${x(t.description)}</span><span class="ttype">${t.attribute_type}</span><button class="btn btn-g btn-i" onclick="delTemplate(${t.id},${catId})" style="color:var(--danger)">❌</button></div>`).join('');
    toast('เพิ่ม Field เรียบร้อยแล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}
async function delTemplate(id,catId){
  try{
    if(!await uiConfirm('ลบ Field? ค่าทั้งหมดใน Field นี้จะหาย')) return;
    await api.template.delete(id);
    // Re-fetch templates and re-render list to keep UI consistent
    const tmpls = await api.template.getAll(catId);
    q('#tlist').innerHTML = tmpls.map(t=>`<div class="titem" id="tmpl-${t.id}"><span class="tname">${x(t.description)}</span><span class="ttype">${t.attribute_type}</span><button class="btn btn-g btn-i" onclick="delTemplate(${t.id},${catId})" style="color:var(--danger)">❌</button></div>`).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:calc(12px * var(--fsc,1))">ยังไม่มี Field</p>';
    // restore focus to the new-field input so user can continue adding — try multiple strategies
    setTimeout(()=>{
      const t=q('#tnew'); const modalEl=q('#modal');
      if(modalEl){ try{ modalEl.focus(); }catch(e){} }
      if(t){ try{ t.focus(); t.click(); if(typeof t.setSelectionRange==='function') t.setSelectionRange(t.value.length, t.value.length); }catch(e){} }
      // as a fallback, try focusing the window then the input
      try{ window.focus(); }catch(e){}
    },60);
    toast('ลบเรียบร้อยแล้ว');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

// ═══ MODALS: OBJECT ════════════════════════════════════
async function openObjectModal(catId=null,objId=null){
  const obj=objId?await api.object.get(objId):null;
  const objTags = objId?await api.object.getTags(objId):[];
  openModal(obj?'✏️ แก้ไขรายการ':'⭐ เพิ่มรายการ',`
    <div class="fg"><label>ชื่อ *</label><input id="on" value="${x(obj?.name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(obj?.color)}</div>
    ${await hashtagSelector('obj', objTags)}
    <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${obj?'saveObject('+objId+')':'createObject('+(catId||S.category.id)+')'}">${obj?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>{
    q('#on')?.focus();
    renderModalTagSuggestions('obj');
  },60);
}
async function createObject(catId){
  const n=q('#on').value.trim(); if(!n) return;
  const r=await api.object.create(S.project.id,catId,n,q('#sel-color').value||null);
  const tags = q('#obj-tag-value')?.value.split(',').filter(Boolean).map(Number) || [];
  if(r?.lastInsertRowid) await api.object.setTags(r.lastInsertRowid,tags);
  closeModal(); S.object=await api.object.get(r.lastInsertRowid); await renderCatBody(catId); toast('เพิ่มรายการเรียบร้อยแล้ว','ok');
}
async function saveObject(id){
  const n=q('#on').value.trim(); if(!n) return;
  const before=await api.object.get(id);
  await api.object.update(id,n,q('#sel-color').value||null);
  if(before && before.name!==n){
    const refs=await api.wiki.backlinks(`obj_${id}`);
    if(refs.length && await uiConfirm(t('renameUpdateLinks'),{danger:false})){
      await api.wiki.renameTarget(`obj_${id}`, before.name, n);
    }
  }
  const tags = q('#obj-tag-value')?.value.split(',').filter(Boolean).map(Number) || [];
  await api.object.setTags(id,tags);
  closeModal(); S.object=await api.object.get(id); await renderCatBody(S.category.id); toast('บันทึกเรียบร้อยแล้ว','ok');
}
async function delObject(id){ if(!await uiConfirm('ลบรายการนี้?')) return; await api.object.delete(id); closeModal(); if(S.object?.id===id) S.object=null; await renderCatBody(S.category.id); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: TIMELINE ══════════════════════════════════
async function openTimelineModal(id=null){
  let tl=null;
  if(id){ const tls=await api.timeline.getAll(S.project.id); tl=tls.find(t=>t.id===id); }
  openModal(tl?'✏️ แก้ไข Timeline':'📅 Timeline ใหม่',`
    <div class="fg"><label>ชื่อ Timeline *</label><input id="tn" value="${x(tl?.line_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(tl?.color)}</div>
    <div class="mfoot">${tl?`<button class="btn btn-d" onclick="delTimeline(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${tl?'saveTimeline('+id+')':'createTimeline()'}">${tl?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#tn').focus(),60);
}
async function createTimeline(){ const n=q('#tn').value.trim(); if(!n) return; const r=await api.timeline.create(S.project.id,n,q('#sel-color').value||null); closeModal(); const tls=await api.timeline.getAll(S.project.id); S.timeline=tls.find(t=>t.id===r.lastInsertRowid)||null; await renderTimelineView(); toast('สร้าง Timeline เรียบร้อยแล้ว','ok'); }
async function saveTimeline(id){ const n=q('#tn').value.trim(); if(!n) return; await api.timeline.update(id,n,q('#sel-color').value||null); closeModal(); const tls=await api.timeline.getAll(S.project.id); S.timeline=tls.find(t=>t.id===id)||null; await renderTimelineView(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delTimeline(id){ if(!await uiConfirm('ลบ Timeline? เหตุการณ์ทั้งหมดจะหาย')) return; await api.timeline.delete(id); closeModal(); if(S.timeline?.id===id) S.timeline=null; await renderTimelineView(); toast('ลบเรียบร้อยแล้ว'); }

function dateInputsHTML(prefix,ev,dayKey,mKey,yKey,hKey,minKey,onchangeFn=''){
  const oc = onchangeFn ? ` onchange="${onchangeFn}"` : '';
  return `<div class="date-row-inline">
    <input id="${prefix}-d" class="date-inp" type="number" placeholder="DD" min="1" value="${ev?ev[dayKey]||'':''}"${oc}>
    <span class="date-sep">/</span>
    <input id="${prefix}-m" class="date-inp" type="number" placeholder="MM" min="1" value="${ev?ev[mKey]||'':''}"${oc}>
    <span class="date-sep">/</span>
    <input id="${prefix}-y" class="date-inp date-inp-y" type="number" placeholder="YYYY" value="${ev?ev[yKey]||'':''}"${oc}>
    <input id="${prefix}-h" class="date-inp" type="number" placeholder="HH" min="0" max="23" value="${ev?ev[hKey]||0:0}"${oc}>
    <span class="date-sep">:</span>
    <input id="${prefix}-min" class="date-inp" type="number" placeholder="MM" min="0" max="59" value="${ev?ev[minKey]||0:0}"${oc}>
  </div>`;
}

async function openEventModal(tlid,evId=null){
  let ev=null;
  if(evId){ const evs=await api.timeline.getEvents(tlid); ev=evs.find(e=>e.id===evId); }
  const evTags = evId?await api.timeline.getEventTags(evId):[];
  openModal(ev?'✏️ แก้ไขเหตุการณ์':'📅 เพิ่มเหตุการณ์',`
    <div class="fg"><label>ชื่อเหตุการณ์ *</label><input id="ev-n" value="${x(ev?.event_name||'')}"></div>
    <div class="fg"><label>วันที่เริ่มต้น *</label>${dateInputsHTML('ev-s',ev,'s_day','s_month','s_years','s_hour','s_minute')}</div>
    <div class="fg"><label>วันที่สิ้นสุด (ไม่บังคับ)</label>${dateInputsHTML('ev-e',ev,'e_day','e_month','e_years','e_hour','e_minute')}</div>
    <div class="fg"><label>สี</label>${await colorPicker(ev?.color)}</div>
    <div class="fg"><label>สตอรี่</label><textarea id="ev-story" placeholder="เขียนสตอรี่ที่เกิดขึ้นในเหตุการณ์นี้...">${x(ev?.story||'')}</textarea></div>
    ${await hashtagSelector('ev', evTags)}
    ${evId ? '<div id="ev-tl-links-wrap"></div>' : ''}
    <div class="mfoot">${ev?`<button class="btn btn-d" onclick="delEvent(${evId},${tlid})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${ev?`saveEvent(${evId},${tlid})`:`createTimelineEvent(${tlid})`}">${ev?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>{
    q('#ev-n').focus();
    renderModalTagSuggestions('ev');
  },60);
  if(evId) refreshEventLinksSection(evId, tlid);
}

async function refreshEventLinksSection(evId, tlid){
  const wrap = q('#ev-tl-links-wrap');
  if(!wrap) return;
  const [links, allEvents, types] = await Promise.all([
    api.relation.getEventLinks(evId),
    api.relation.getProjectEvents(S.project.id),
    api.relation.getTypes(),
  ]);
  const otherEvents = allEvents.filter(e => e.timeline_id !== tlid);
  const typeOpts = `<option value="">-- ประเภท --</option>${types.map(t=>`<option value="${t.id}">${x(t.relation_name)}</option>`).join('')}`;
  let linksHtml = links.length ? links.map(l => {
    const isFrom = l.from_event_id === evId;
    const otherName = isFrom ? l.to_name : l.from_name;
    const otherTl   = isFrom ? l.to_tl   : l.from_tl;
    const relBadge  = l.relation_name ? `<span class="mini-rel-kind" style="color:${l.color_code||'var(--t3)'}">${x(l.relation_name)}</span>` : '';
    return `<div class="mini-rel-item">
      <span class="mini-rel-rel">${x(otherTl)}</span>
      <span style="color:var(--t3)">→</span>
      <span class="mini-rel-to" style="flex:1">${x(otherName)}</span>
      ${relBadge}
      <button class="btn btn-s btn-i" style="color:var(--danger)" onclick="removeEventTimelineLink(${l.id},${evId},${tlid})">${I.delete}</button>
    </div>`;
  }).join('') : `<div style="font-size:calc(12px * var(--fsc,1));color:var(--t3);padding:4px 0">ยังไม่มีการเชื่อมต่อ</div>`;
  const pickerHtml = otherEvents.length
    ? `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px">
        <select id="ev-tl-link-target" style="flex:1;min-width:140px">${evtOptions(otherEvents)}</select>
        <select id="ev-tl-link-type" style="min-width:110px">${typeOpts}</select>
        <button class="btn btn-s" onclick="addEventTimelineLink(${evId},${tlid})">เชื่อมต่อ</button>
      </div>`
    : `<div style="font-size:calc(12px * var(--fsc,1));color:var(--t3);margin-top:4px">ไม่มี Timeline อื่นในโปรเจกต์นี้</div>`;
  wrap.innerHTML = `<div class="detail-relations" style="padding:12px 0 0">
    <div class="tags-head"><span style="font-size:calc(12.5px * var(--fsc,1));font-weight:600;color:var(--t2)">เชื่อมต่อกับ Timeline อื่น</span></div>
    <div id="ev-tl-links-list">${linksHtml}</div>
    ${pickerHtml}
  </div>`;
}

async function addEventTimelineLink(evId, tlid){
  const targetId = parseInt(q('#ev-tl-link-target')?.value);
  if(!targetId){ toast('เลือกเหตุการณ์ที่ต้องการเชื่อมต่อ','err'); return; }
  const existing = await api.relation.getEventLinks(evId);
  const alreadyLinked = existing.some(l =>
    (l.from_event_id === evId && l.to_event_id === targetId) ||
    (l.to_event_id === evId && l.from_event_id === targetId)
  );
  if(alreadyLinked){ toast('มีการเชื่อมต่อนี้อยู่แล้ว','err'); return; }
  try{
    const typeId = q('#ev-tl-link-type')?.value || null;
    await api.relation.createTLTL(S.project.id, typeId||null, null, evId, targetId);
    await refreshEventLinksSection(evId, tlid);
    toast('เชื่อมต่อ Timeline แล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function removeEventTimelineLink(linkId, evId, tlid){
  if(!await uiConfirm('ลบการเชื่อมต่อนี้?')) return;
  await api.relation.deleteTLTL(linkId);
  await refreshEventLinksSection(evId, tlid);
  toast('ลบการเชื่อมต่อแล้ว');
}

async function getDateFromInputs(prefix){
  const d=parseInt(q(`#${prefix}-d`).value)||0, m=parseInt(q(`#${prefix}-m`).value)||0, y=parseInt(q(`#${prefix}-y`).value)||0;
  if(!d||!m||!y) return null;
  const h=parseInt(q(`#${prefix}-h`).value)||0, min=parseInt(q(`#${prefix}-min`).value)||0;
  return await api.timeline.getOrCreateDate(d,m,y,h,min);
}

async function createTimelineEvent(tlid){
  try{
    const n=q('#ev-n').value.trim(); if(!n){ toast('กรอกชื่อเหตุการณ์','err'); return; }
    const sid=await getDateFromInputs('ev-s'); if(!sid){ toast('กรอกวันที่เริ่มต้น','err'); return; }
    const eid=await getDateFromInputs('ev-e');
    const story=q('#ev-story')?.value.trim()||'';
    const r = await api.timeline.createEvent(tlid,n,sid,eid,q('#sel-color').value||null,story);
    const tags = getModalTagIds('ev');
    if(r?.lastInsertRowid) await api.timeline.setEventTags(r.lastInsertRowid,tags);
    closeModal(); await renderTimelineDetail(tlid); toast('เพิ่มเหตุการณ์แล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function saveEvent(evId,tlid){
  try{
    const n=q('#ev-n').value.trim(); if(!n){ toast('กรอกชื่อเหตุการณ์','err'); return; }
    const sid=await getDateFromInputs('ev-s'); if(!sid){ toast('กรอกวันที่เริ่มต้น','err'); return; }
    const eid=await getDateFromInputs('ev-e');
    const story=q('#ev-story')?.value.trim()||'';
    await api.timeline.updateEvent(evId,n,sid,eid,q('#sel-color').value||null,story);
    const tags = getModalTagIds('ev');
    await api.timeline.setEventTags(evId,tags);
    closeModal(); await renderTimelineDetail(tlid); toast('บันทึกเรียบร้อยแล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function saveEventStory(evId){
  const el=q(`#ev-story-${evId}`);
  if(!el) return;
  try{
    await api.timeline.updateEventStory(evId,el.value.trim());
    toast('บันทึกสตอรี่เรียบร้อย','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function delEvent(evId,tlid){ if(!await uiConfirm('ลบเหตุการณ์นี้?')) return; await api.timeline.deleteEvent(evId); closeModal(); await renderTimelineDetail(tlid); toast('ลบเรียบร้อยแล้ว'); }

// Scoped Object↔Event relation creator reachable straight from the timeline
// event list (the event side is fixed to `eventId`; only the object and
// relation type are picked) — reuses openRelModal's object picker/coloredSelect
// but, unlike openRelModal(1), refreshes the Timeline detail in place instead
// of jumping to the Relation panel.
async function openEventRelModal(tlid, eventId){
  if(!S.project) return;
  const types = await api.relation.getTypes();
  const typeOpts = `<option value="">-- ไม่ระบุ --</option>${types.map(t=>`<option value="${t.id}" style="${t.color_code?`color:${t.color_code}`:''}">${t.color_code?'● ':''}${x(t.relation_name)}</option>`).join('')}`;
  const oo = objOptions(await api.relation.getProjectObjects(S.project.id));
  openModal('🔗 เพิ่ม Object ที่เกี่ยวข้อง', `
    <div class="fg"><label>ประเภทความสัมพันธ์</label><select id="rel-type">${typeOpts}</select></div>
    ${coloredSelect('Object','rel-from',oo)}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">ยกเลิก</button>
      <button class="btn btn-p" onclick="createEventRel(${tlid},${eventId})">สร้าง</button>
    </div>`);
  initColoredSelects('rel-from');
}

async function createEventRel(tlid, eventId){
  try{
    await api.relation.createOBTL(S.project.id, q('#rel-type').value||null, null, parseInt(q('#rel-from').value), eventId);
    closeModal();
    await renderTimelineDetail(tlid);
    toast('เพิ่มความสัมพันธ์แล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

async function delEventRel(id, tlid){
  if(!await uiConfirm('ลบความสัมพันธ์?')) return;
  await api.relation.deleteOBTL(id);
  await renderTimelineDetail(tlid);
  toast('ลบเรียบร้อยแล้ว');
}

// ═══ MODALS: RELATION TYPE ═════════════════════════════
async function openRelTypeModal(id=null){
  const types = await api.relation.getTypes();
  const relType = id ? types.find(t=>t.id===id) : null;
  openModal(relType ? '✏️ แก้ไขประเภทความสัมพันธ์' : '🏷️ ประเภทความสัมพันธ์ใหม่',`
    <div class="fg"><label>ชื่อ *</label><input id="rt-n" value="${x(relType?.relation_name||'')}" placeholder="เช่น เพื่อน, ศัตรู, ครอบครัว"></div>
    <div class="fg"><label>สี</label>${await colorPicker(relType?.color)}</div>
    <div class="mfoot">${relType?`<button class="btn btn-d" onclick="delRelType(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${relType?`updateRelType(${id})`:'createRelType()'}">${relType?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#rt-n').focus(),60);
}
async function createRelType(){ const n=q('#rt-n').value.trim(); if(!n) return; await api.relation.createType(n,q('#sel-color').value||null); closeModal(); await renderRelationView(); toast('สร้างประเภทแล้ว','ok'); }
async function updateRelType(id){ const n=q('#rt-n').value.trim(); if(!n) return; await api.relation.updateType(id,n,q('#sel-color').value||null); closeModal(); await renderRelationView(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delRelType(id){ if(!await uiConfirm('ลบประเภทนี้?')) return; await api.relation.deleteType(id); await renderRelationView(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ MODALS: RELATION ══════════════════════════════════
function groupByKey(arr,key){ const g={}; arr.forEach(i=>{ const k=i[key]; if(!g[k])g[k]=[]; g[k].push(i); }); return g; }
function objOptions(objs){ const g=groupByKey(objs,'category_name'); return Object.entries(g).map(([cat,items])=>`<optgroup label="${x(cat)}">${items.map(o=>{ const col=o.color_code||o.category_color_code||'#6366f1'; return `<option value="${o.id}" data-color="${col}" style="color:${col}">● ${x(o.name)}</option>`; }).join('')}</optgroup>`).join(''); }
function evtOptions(evts){ const g=groupByKey(evts,'line_name'); return Object.entries(g).map(([tl,items])=>`<optgroup label="${x(tl)}">${items.map(e=>{ const col=e.color_code||e.timeline_color_code||'#06b6d4'; return `<option value="${e.id}" data-color="${col}" style="color:${col}">● ${x(e.event_name||'ไม่มีชื่อ')} (${fmtDate(e.s_day,e.s_month,e.s_years,0,0)})</option>`; }).join('')}</optgroup>`).join(''); }
function coloredSelect(label,id,options){
  return `<div class="fg"><label>${label}</label><select id="${id}" onchange="updateSelectColorLabel('${id}')">${options}</select><div class="select-color-label" id="${id}-color-label"></div></div>`;
}
function updateSelectColorLabel(id){
  const sel=q(`#${id}`), label=q(`#${id}-color-label`);
  if(!sel || !label) return;
  const opt=sel.options[sel.selectedIndex];
  const col=opt?.dataset?.color || '#6366f1';
  const txt=(opt?.textContent||'').replace(/^●\s*/,'');
  label.innerHTML = `<span class="select-color-dot" style="background:${col}"></span><span>${x(txt)}</span>`;
}
function initColoredSelects(...ids){ setTimeout(()=>ids.forEach(updateSelectColorLabel), 30); }

async function openRelModal(tab, rel=null){
  if(!S.project) return;
  const types = await api.relation.getTypes();
  const typeOpts = `<option value="">-- ไม่ระบุ --</option>${types.map(t=>`<option value="${t.id}" ${rel?.relation_type===t.id?'selected':''} style="${t.color_code?`color:${t.color_code}`:''}">${t.color_code?'● ':''}${x(t.relation_name)}</option>`).join('')}`;
  const typeRow  = `<div class="fg"><label>ประเภทความสัมพันธ์</label><select id="rel-type">${typeOpts}</select></div>`;
  if(rel){
    openModal('✏️ ปรับแต่งความสัมพันธ์',`${typeRow}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="saveRel(${rel.rel_id})">บันทึก</button></div>`);
    return;
  }
  if(tab===0){
    const oo=objOptions(await api.relation.getProjectObjects(S.project.id));
    openModal('🔗 Object ↔ Object',`${typeRow}${coloredSelect('จาก Object','rel-from',oo)}${coloredSelect('ไปยัง Object','rel-to',oo)}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="createRelOBOB()">สร้าง</button></div>`);
    initColoredSelects('rel-from','rel-to');
  } else if(tab===1){
    const oo=objOptions(await api.relation.getProjectObjects(S.project.id));
    const eo=evtOptions(await api.relation.getProjectEvents(S.project.id));
    openModal('🔗 Object ↔ Event',`${typeRow}${coloredSelect('Object','rel-from',oo)}${coloredSelect('เหตุการณ์','rel-to',eo)}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="createRelOBTL()">สร้าง</button></div>`);
    initColoredSelects('rel-from','rel-to');
  } else {
    const eo=evtOptions(await api.relation.getProjectEvents(S.project.id));
    openModal('🔗 Event ↔ Event',`${typeRow}${coloredSelect('เหตุการณ์ที่ 1','rel-from',eo)}${coloredSelect('เหตุการณ์ที่ 2','rel-to',eo)}<div class="mfoot"><button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="createRelTLTL()">สร้าง</button></div>`);
    initColoredSelects('rel-from','rel-to');
  }
}

async function createRelOBOB(){
  try{ const fid=parseInt(q('#rel-from').value),tid=parseInt(q('#rel-to').value); if(fid===tid){toast('เลือก Object ที่ต่างกัน','err');return;} await api.relation.createOBOB(S.project.id,q('#rel-type').value||null,null,fid,tid); closeModal(); S.relTab=0; await renderRelationView(); toast('เพิ่มความสัมพันธ์แล้ว','ok'); }
  catch(e){ toast(e.message,'err'); console.error(e); }
}
async function createRelOBTL(){
  try{ await api.relation.createOBTL(S.project.id,q('#rel-type').value||null,null,parseInt(q('#rel-from').value),parseInt(q('#rel-to').value)); closeModal(); S.relTab=1; await renderRelationView(); toast('เพิ่มความสัมพันธ์แล้ว','ok'); }
  catch(e){ toast(e.message,'err'); console.error(e); }
}
async function createRelTLTL(){
  try{ const fid=parseInt(q('#rel-from').value),tid=parseInt(q('#rel-to').value); if(fid===tid){toast('เลือกเหตุการณ์ที่ต่างกัน','err');return;} await api.relation.createTLTL(S.project.id,q('#rel-type').value||null,null,fid,tid); closeModal(); await renderRelationView(); toast('เพิ่มความสัมพันธ์แล้ว','ok'); }
  catch(e){ toast(e.message,'err'); console.error(e); }
}
async function delRel(id,type){ if(!await uiConfirm('ลบความสัมพันธ์?')) return; if(type==='obob') await api.relation.deleteOBOB(id); else if(type==='obtl') await api.relation.deleteOBTL(id); else await api.relation.deleteTLTL(id); await renderRelationView(); toast('ลบเรียบร้อยแล้ว'); }
async function saveRel(relId){
  try{
    await api.relation.update(relId, q('#rel-type').value||null, null);
    closeModal();
    await renderRelationView();
    toast('บันทึกความสัมพันธ์แล้ว','ok');
  }catch(e){ toast(e.message,'err'); console.error(e); }
}

// ═══ MODALS: HASHTAG ═══════════════════════════════════
async function openHashtagModal(id=null){
  const tag=id?(await api.hashtag.getAll()).find(t=>t.id===id):null;
  openModal(tag?'✏️ แก้ไข Tag':'🏷️ Tag ใหม่',`
    <div class="fg"><label>ชื่อ Tag *</label><input id="ht-n" value="${x(tag?.tag_name||'')}" placeholder="ชื่อ (ไม่ต้องใส่ #)"></div>
    <div class="fg"><label>สี</label>${await colorPicker(tag?.tag_color)}</div>
    <div class="mfoot">${tag?`<button class="btn btn-d" onclick="delHashtag(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${tag?'saveHashtag('+id+')':'createHashtag()'}">${tag?'บันทึก':'สร้าง'}</button></div>`);
  setTimeout(()=>q('#ht-n').focus(),60);
}
async function createHashtag(){ const n=q('#ht-n').value.trim(); if(!n) return; await api.hashtag.create(n,q('#sel-color').value||null); closeModal(); await renderHashtagView(); toast('สร้าง Tag เรียบร้อยแล้ว','ok'); }
async function saveHashtag(id){ const n=q('#ht-n').value.trim(); if(!n) return; await api.hashtag.update(id,n,q('#sel-color').value||null); closeModal(); await renderHashtagView(); toast('บันทึกเรียบร้อยแล้ว','ok'); }
async function delHashtag(id){ if(!await uiConfirm('ลบ Tag นี้?')) return; await api.hashtag.delete(id); closeModal(); await renderHashtagView(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ GLOBAL SEARCH ═════════════════════════════════════
let _searchTimeout;
