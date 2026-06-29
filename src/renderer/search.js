function bindSearch() {
  const inp=q('#search-input'); if(!inp) return;
  inp.addEventListener('input',()=>{
    clearTimeout(_searchTimeout);
    _searchTimeout=setTimeout(async()=>{
      const val=inp.value.trim();
      if(!val) switchView(S.view);
      else { const results=await api.search.all(val); renderSearchResults(results,val); }
    },300);
  });
}

function renderSearchResults(res,query){
  const el=q('#left-panel-inner'); if(!el) return;
  let h=`<div class="ph"><h4>ผลการค้นหา "${x(query)}"</h4></div>`;
  if(res.projects?.length){
    h+=`<div class="search-sec"><div class="search-sec-hd">📁 โปรเจกต์</div>`;
    for(const p of res.projects){ const col=p.color_code||'#6366f1'; h+=`<div class="li search-res-item" onclick="selectSearchProject(${p.id})"><div class="dot" style="background:${col}"></div><span class="name">${x(p.name)} ${p.codename?`<span class="tag" style="margin-left:4px">${x(p.codename)}</span>`:''}</span></div>`; }
    h+=`</div>`;
  }
  if(res.objects?.length){
    h+=`<div class="search-sec"><div class="search-sec-hd">⭐ รายการ (Objects)</div>`;
    for(const o of res.objects){ const col=o.color_code||'#6366f1'; h+=`<div class="li search-res-item" onclick="selectSearchObject(${o.project_id},${o.category_id},${o.id})" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:8px 10px"><div style="display:flex;align-items:center;gap:8px;width:100%"><div class="dot" style="background:${col}"></div><span class="name" style="font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(o.name)}</span></div><span style="font-size:10px;color:var(--t3);margin-left:16px">${x(o.project_name)} / ${x(o.category_name)}</span></div>`; }
    h+=`</div>`;
  }
  if(res.hashtags?.length){
    h+=`<div class="search-sec"><div class="search-sec-hd">🏷️ ป้ายกำกับ (Hashtags)</div>`;
    for(const t of res.hashtags){ const col=t.color_code||'#6366f1'; h+=`<div class="li search-res-item" onclick="selectSearchHashtag(${t.id})"><span class="hn" style="color:${col};font-weight:700">#${x(t.tag_name)}</span></div>`; }
    h+=`</div>`;
  }
  if(!res.projects?.length&&!res.objects?.length&&!res.hashtags?.length){
    h+=`<div class="empty" style="padding:40px 10px"><div class="ei" style="font-size:28px">🔍</div><p>ไม่พบผลลัพธ์การค้นหา</p></div>`;
  }
  el.innerHTML=h;
}

async function selectSearchProject(id){ const inp=q('#search-input'); if(inp) inp.value=''; await selectProject(id); }
async function selectSearchObject(pid,cid,oid){ const inp=q('#search-input'); if(inp) inp.value=''; await selectProject(pid); await selectCategory(cid); await selectObject(oid); }
async function selectSearchHashtag(tid){
  const inp=q('#search-input'); if(inp) inp.value='';
  S.view='hashtag';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
  q('.nav-btn[data-panel="hashtag"]').classList.add('active');
  await loadModule('src/renderer/hashtag.js');
  await renderHashtagView();
  const el=q(`#tag-item-${tid}`);
  if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.boxShadow='0 0 12px var(--tc)'; el.style.transform='scale(1.05)'; setTimeout(()=>{ el.style.boxShadow=''; el.style.transform=''; },1800); }
}

// All functions declared in regular <script> tags are already global.
// No Object.assign needed — lazy-loaded modules (timeline/relation/map/hashtag)
// register their own globals when first loaded.

// ═══ START ═════════════════════════════════════════════
init();
