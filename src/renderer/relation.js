const relationNodeState = {catView:{}, objView:{}, projectView:{}};
const relationWbViewState = {catView:{}, objView:{}, projectView:{}};

async function renderForceGraph(graphData, opts={}){
  const c = q('#wb-container');
  if(!c) return;
  c.innerHTML = `<div id="react-graph"></div><div class="rel-resize-handle" title="Drag to resize graph"></div>`;
  await ensureD3();
  if(!document.getElementById('react-graph')) return;
  await renderForceGraphWithD3(graphData, opts);
}

// D3 loader + renderer. Vendored copy first (app must work offline);
// CDN only as a fallback for trees missing vendor/.
function ensureD3(){
  if(window.d3) return Promise.resolve();
  if(window.__d3Loading) return new Promise(resolve=>{ const iv=setInterval(()=>{ if(window.d3){ clearInterval(iv); resolve(); } },50); });
  window.__d3Loading = true;
  const load = (src) => new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = src;
    s.onload = ()=>resolve();
    s.onerror = ()=>{ s.remove(); reject(new Error('Failed to load '+src)); };
    document.head.appendChild(s);
  });
  return load('vendor/d3.min.js')
    .catch(()=>load('https://unpkg.com/d3@7/dist/d3.min.js'))
    .finally(()=>{ window.__d3Loading = false; });
}

async function renderForceGraphWithD3(graphData, opts={}){
  const el = document.getElementById('react-graph');
  if(!el) return;
  el.innerHTML = '';
  const width = el.clientWidth || 800;
  const height = el.clientHeight || 420;
  const svg = window.d3.create('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'transparent')
    .style('cursor', 'grab');
  const g = svg.append('g');
  const link = g.append('g').attr('stroke', '#999').attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('stroke-width', d=>d.width||2)
    .style('stroke', d=>d.color||'#999')
    .style('stroke-dasharray', d=>d.dashed?'4 2':null);
  const node = g.append('g').attr('stroke', '#fff').attr('stroke-width', 1.2)
    .selectAll('circle')
    .data(graphData.nodes)
    .join('circle')
    .attr('r', d=>d.size?d.size:10)
    .attr('fill', d=>d.color||'#6366f1')
    .style('cursor', 'pointer');
  const label = g.append('g').selectAll('text').data(graphData.nodes).join('text')
    .attr('class', 'graph-label')
    .attr('font-size', 12)
    .attr('dy', -12)
    .attr('text-anchor', 'middle')
    .text(d=>d.name);

  const zoom = window.d3.zoom()
    .filter(event=> event.type === 'wheel' || event.type === 'mousedown' || event.type === 'mousemove' || event.type === 'mouseup')
    .scaleExtent([0.4, 3])
    .on('zoom', (event)=>{
      g.attr('transform', event.transform);
    });
  svg.call(zoom).on('dblclick.zoom', null).on('contextmenu', (event)=>event.preventDefault());

  function ticked(){
    link.attr('x1', d=>d.source.x)
      .attr('y1', d=>d.source.y)
      .attr('x2', d=>d.target.x)
      .attr('y2', d=>d.target.y);
    node.attr('cx', d=>d.x).attr('cy', d=>d.y);
    label.attr('x', d=>d.x).attr('y', d=>d.y - (d.size?d.size:10) - 4);
  }

  const simulation = window.d3.forceSimulation(graphData.nodes)
    .force('link', window.d3.forceLink(graphData.links).id(d=>d.id).distance(70).strength(0.9))
    .force('charge', window.d3.forceManyBody().strength(-110))
    .force('center', window.d3.forceCenter(width/2, height/2))
    .force('collide', window.d3.forceCollide().radius(d=>Math.max(14, (d.size||10) + 8)).strength(0.9))
    .force('x', window.d3.forceX(width/2).strength(0.05))
    .force('y', window.d3.forceY(height/2).strength(0.05))
    .on('tick', ticked);

  simulation.alpha(1).restart();

  function dragstarted(event,d){
    if(!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event,d){ d.fx = event.x; d.fy = event.y; }
  function dragended(event,d){
    if(!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  node.call(window.d3.drag()
    .filter(event=> event.button === 0)
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended));

  node.on('mouseover', function(event,d){
    window.d3.select(this).attr('stroke-width', 2.4);
    label.filter(l=>l.id === d.id).style('opacity', 1);
  });
  node.on('mouseout', function(event,d){
    window.d3.select(this).attr('stroke-width', 1.2);
    label.filter(l=>l.id === d.id).style('opacity', 0);
  });
  node.on('click', (event,d)=>{ if(opts.onNodeClick) opts.onNodeClick(d, event); });

  el.appendChild(svg.node());
}

// Small floating note (not a modal) shown on object-node click — name,
// category, and an Edit button that opens the real object modal.
function closeRelNodeNote(){
  const el = q('#rel-node-note');
  if(el) el.remove();
  document.removeEventListener('mousedown', relNodeNoteOutsideHandler, true);
}
function relNodeNoteOutsideHandler(e){
  const el = q('#rel-node-note');
  if(el && !el.contains(e.target)) closeRelNodeNote();
}
function showRelationNodeNote(event, node){
  closeRelNodeNote();
  const el = document.createElement('div');
  el.id = 'rel-node-note';
  el.className = 'rel-node-note';
  el.innerHTML = `
    <button class="btn btn-g btn-i rel-node-note-close" onclick="closeRelNodeNote()">${I.close}</button>
    <div class="rel-node-note-name">${x(node.name)}</div>
    ${node.category ? `<div class="rel-node-note-cat">${x(node.category)}</div>` : ''}
    <button class="btn btn-p rel-node-note-edit" onclick="closeRelNodeNote();openObjectModal(null,${node.origId})">${I.edit} แก้ไข</button>`;
  document.body.appendChild(el);
  const pad = 10;
  el.style.left = `${event.clientX + pad}px`;
  el.style.top = `${event.clientY + pad}px`;
  requestAnimationFrame(() => {
    const rect = el.getBoundingClientRect();
    if(rect.right > window.innerWidth) el.style.left = `${Math.max(pad, window.innerWidth - rect.width - pad)}px`;
    if(rect.bottom > window.innerHeight) el.style.top = `${Math.max(pad, window.innerHeight - rect.height - pad)}px`;
  });
  setTimeout(() => document.addEventListener('mousedown', relNodeNoteOutsideHandler, true), 0);
}

async function renderRelationView(){
  closeRelNodeNote();
  q('#main-inner')?.classList.add('relation-main');
  if(!S.project){
    q('#left-panel-inner').innerHTML=`<div class="empty" style="padding:40px 10px"><div class="ei">${I.relation}</div><p style="text-align:center">เลือกโปรเจกต์ก่อน</p></div>`;
    q('#main-inner').innerHTML=`<div class="empty" style="margin-top:80px"><div class="ei">${I.relation}</div><h3>Relations</h3><p>กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    return;
  }
  const types = await api.relation.getTypes();
  let lh = `<div class="ph"><h4>ประเภทความสัมพันธ์</h4><button class="btn btn-g btn-i" onclick="openRelTypeModal()">${I.plus}</button></div>`;
  if(!types.length) lh += `<p style="font-size:12px;color:var(--t3);padding:10px 12px">ยังไม่มีประเภท</p>`;
  for(const t of types){
    const color = t.color_code || '#6366f1';
    lh += `<div class="li" onclick="openRelTypeModal(${t.id})">
      <span class="dot" style="background:${color}"></span>
      <span class="name">${x(t.relation_name)}</span>
      <div class="acts"><button class="btn btn-g btn-i" onclick="event.stopPropagation();openRelTypeModal(${t.id})">${I.edit}</button><button class="btn btn-g btn-i" onclick="event.stopPropagation();delRelType(${t.id})" style="color:var(--danger)">${I.delete}</button></div>
    </div>`;
  }
  q('#left-panel-inner').innerHTML = lh;

  const viewMode = S.relTab||0;
  let renderWhiteboard = null;
  let h = `<div class="ch">
    <h2>Node Whiteboard</h2>
    <div class="rel-view-btns">
      <button class="btn ${viewMode===0?'btn-p':'btn-s'}" onclick="switchRelViewMode(0)">Category View</button>
      <button class="btn ${viewMode===1?'btn-p':'btn-s'}" onclick="switchRelViewMode(1)">Object View</button>
      <button class="btn ${viewMode===2?'btn-p':'btn-s'}" onclick="switchRelViewMode(2)">Project View</button>
    </div>
  </div>`;

  if(viewMode===0){
    const cats = await api.category.getAll(S.project.id);
    const selCatId = cats.find(c=>c.id===S.relCatId)?.id || cats[0]?.id;
    S.relCatId = selCatId || null;
    const catOpts = cats.map(c=>`<option value="${c.id}" ${c.id===selCatId?'selected':''}>${x(c.category_name)}</option>`).join('');
    h += `<div class="rel-toolbar">
      <select id="rel-cat-select" onchange="updateRelCategoryView(this.value)">
        ${catOpts || '<option value="">-- ยังไม่มี Category --</option>'}
      </select>
      <button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openRelModal(0)">${I.plus} เพิ่มความสัมพันธ์</button>
    </div>
    <div id="wb-container" class="rel-whiteboard">
      <svg id="wb-svg" class="rel-svg"></svg>
      <div id="wb-nodes" class="rel-nodes"></div>
    </div>
    <div class="rel-list-slider" onmousedown="startRelListResize(event)" title="Drag to resize relation list"></div>
    <div class="rel-underboard">
      <div class="ph">
        <h4>ความสัมพันธ์ที่กำลังแสดงอยู่</h4>
        <div class="acts">
          <button class="btn btn-g" onclick="openRelModal(0)">${I.plus} Object ↔ Object</button>
          <button class="btn btn-g" onclick="openRelModal(1)">${I.plus} Object ↔ Event</button>
          <button class="btn btn-g" onclick="openRelModal(2)">${I.plus} Event ↔ Event</button>
        </div>
      </div>
      <div id="rel-list" class="rel-list"></div>
    </div>`;
    if(selCatId) renderWhiteboard = () => renderCategoryWhiteboard(selCatId);
  } else if(viewMode===1) {
    const objs = await api.relation.getProjectObjects(S.project.id);
    const objOpts = objs.map(o=>`<option value="${o.id}">${x(o.category_name)} / ${x(o.name)}</option>`).join('');
    const selObjId = S.relObjId||objs[0]?.id;
    h += `<div class="rel-toolbar">
      <select id="obj-select" onchange="updateRelObjectView(this.value)">
        <option value="">-- เลือก Object --</option>${objOpts}
      </select>
      <button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openRelModal(0)">${I.plus} เพิ่มความสัมพันธ์</button>
    </div>
    <div id="wb-container" class="rel-whiteboard">
      <svg id="wb-svg" class="rel-svg"></svg>
      <div id="wb-nodes" class="rel-nodes"></div>
    </div>
    <div class="rel-list-slider" onmousedown="startRelListResize(event)" title="Drag to resize relation list"></div>
    <div class="rel-underboard">
      <div class="ph">
        <h4>ความสัมพันธ์ที่กำลังแสดงอยู่</h4>
        <div class="acts">
          <button class="btn btn-g" onclick="openRelModal(0)">${I.plus} Object ↔ Object</button>
          <button class="btn btn-g" onclick="openRelModal(1)">${I.plus} Object ↔ Event</button>
          <button class="btn btn-g" onclick="openRelModal(2)">${I.plus} Event ↔ Event</button>
        </div>
      </div>
      <div id="rel-list" class="rel-list"></div>
    </div>`;
    if(selObjId) renderWhiteboard = async () => { await renderObjectWhiteboard(selObjId); const sel = q('#obj-select'); if(sel) sel.value=selObjId; };
  } else {
    h += `<div class="rel-toolbar">
      <div style="font-size:12.5px;color:var(--t2)">แสดง Object ทั้งหมดในโปรเจกต์: <b>${x(S.project.name||'')}</b></div>
      <button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openRelModal(0)">${I.plus} เพิ่มความสัมพันธ์</button>
    </div>
    <div id="wb-container" class="rel-whiteboard">
      <svg id="wb-svg" class="rel-svg"></svg>
      <div id="wb-nodes" class="rel-nodes"></div>
    </div>
    <div class="rel-list-slider" onmousedown="startRelListResize(event)" title="Drag to resize relation list"></div>
    <div class="rel-underboard">
      <div class="ph">
        <h4>ความสัมพันธ์ที่กำลังแสดงอยู่</h4>
        <div class="acts">
          <button class="btn btn-g" onclick="openRelModal(0)">${I.plus} Object ↔ Object</button>
          <button class="btn btn-g" onclick="openRelModal(1)">${I.plus} Object ↔ Event</button>
          <button class="btn btn-g" onclick="openRelModal(2)">${I.plus} Event ↔ Event</button>
        </div>
      </div>
      <div id="rel-list" class="rel-list"></div>
    </div>`;
    renderWhiteboard = () => renderProjectWhiteboard(S.project.id);
  }
  q('#main-inner').innerHTML = h;
  applyRelListHeight();
  if(renderWhiteboard) setTimeout(()=>renderWhiteboard(),10);
}

async function switchRelViewMode(mode){
  const nextMode = Number.parseInt(mode, 10);
  if(![0, 1, 2].includes(nextMode)) return;
  S.relTab = nextMode;
  await renderRelationView();
}

async function updateRelCategoryView(catId){
  const nextCatId = Number.parseInt(catId, 10);
  S.relCatId = Number.isNaN(nextCatId) ? null : nextCatId;
  await renderRelationView();
}

async function updateRelObjectView(objId){
  const nextObjId = Number.parseInt(objId, 10);
  S.relObjId = Number.isNaN(nextObjId) ? null : nextObjId;
  await renderRelationView();
}

async function renderCategoryWhiteboard(catId){
  const selectedCatId = parseInt(catId,10);
  S.relCatId = selectedCatId;
  const objs = await api.object.getAll(selectedCatId);
  const rels = await api.relation.getOBOB(S.project.id);
  const projectObjs = await api.relation.getProjectObjects(S.project.id);
  const byKey = new Map(projectObjs.map(o=>[`${o.category_name}::${o.name}`,o.id]));
  const objIdSet = new Set(objs.map(o=>o.id));
  if(!relationNodeState.catView[selectedCatId]) relationNodeState.catView[selectedCatId]={};
  const positions = relationNodeState.catView[selectedCatId];
  const radius=150, cx=300, cy=200, anglePerNode=Math.PI*2/Math.max(objs.length,1);
  objs.forEach((o,i)=>{ if(!positions[o.id]) positions[o.id]={x:cx+Math.cos(i*anglePerNode)*radius, y:cy+Math.sin(i*anglePerNode)*radius}; });
  // Build graph data for React Force Graph
  const catRow = (await api.category.getAll(S.project.id)).find(c=>c.id===selectedCatId);
  const nodes = objs.map(o=>({ id: `obj-${o.id}`, origId:o.id, name: x(o.name), category: catRow?.category_name||'', color: o.color_code||o.category_color_code||'#6366f1' }));
  const nodeIdSet = new Set(nodes.map(n=>n.id));
  const links = [];
  for(const rel of rels){
    const fromId=byKey.get(`${rel.from_cat}::${rel.from_name}`), toId=byKey.get(`${rel.to_cat}::${rel.to_name}`);
    if(!objIdSet.has(fromId)||!objIdSet.has(toId)) continue;
    const src = `obj-${fromId}`, dst = `obj-${toId}`;
    if(!nodeIdSet.has(src) || !nodeIdSet.has(dst)) continue;
    links.push({ source: src, target: dst, name: rel.relation_name||'', color: rel.color_code||'#999' });
  }
  await renderForceGraph({ nodes, links }, { onNodeClick: (n,event) => { if(n.origId) showRelationNodeNote(event, n); } });
  renderRelList(rels.filter(rel=>{
    const fromId=byKey.get(`${rel.from_cat}::${rel.from_name}`);
    const toId=byKey.get(`${rel.to_cat}::${rel.to_name}`);
    return objIdSet.has(fromId) && objIdSet.has(toId);
  }).map(r=>({ ...r, kind:'obob' })));
  ensureWbViewState('cat', selectedCatId);
  bindWhiteboardInteractions('cat', selectedCatId);
}

async function renderObjectWhiteboard(objId){
  const selectedObjId = parseInt(objId,10); S.relObjId=selectedObjId;
  const allObjs = await api.relation.getProjectObjects(S.project.id);
  const selObj  = allObjs.find(o=>o.id===selectedObjId);
  const rels    = await api.relation.getOBOB(S.project.id);
  const tlRels  = await api.relation.getOBTL(S.project.id);
  const objByKey= new Map(allObjs.map(o=>[`${o.category_name}::${o.name}`,o]));
  const connected = rels.filter(r=>{
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`), to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    return from?.id===selectedObjId||to?.id===selectedObjId;
  });
  const relObjMap=new Map();
  for(const r of connected){
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`), to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    const peer=from?.id===selectedObjId?to:from;
    if(peer) relObjMap.set(peer.id, peer);
  }
  const relObjs  = Array.from(relObjMap.values());
  const myTlRels = tlRels.filter(r=>{ const from=objByKey.get(`${r.from_cat}::${r.from_name}`); return from?.id===selectedObjId; });
  const tlNodes  = myTlRels.map((r,i)=>({ id:`tl-${i}-${r.id}`, name:r.to_name||'Event', type:'timeline', color_code:r.color_code||'#06b6d4', relation_name:r.relation_name||'', date_text:fmtDate(r.s_day,r.s_month,r.s_years,0,0) }));
  if(!relationNodeState.objView[selectedObjId]) relationNodeState.objView[selectedObjId]={};
  const positions = relationNodeState.objView[selectedObjId];
  if(!positions[selectedObjId]) positions[selectedObjId]={x:300,y:200};
  const radius=120, cx=300, cy=200;
  const aroundNodes=[...relObjs,...tlNodes];
  const anglePerNode=(2*Math.PI)/Math.max(aroundNodes.length,1);
  aroundNodes.forEach((o,i)=>{ if(!positions[o.id]) positions[o.id]={x:cx+Math.cos(i*anglePerNode)*radius, y:cy+Math.sin(i*anglePerNode)*radius}; });
  // Build graph data for React Force Graph (center node + peers + timeline nodes)
  const nodes = [];
  const centerId = `obj-${selectedObjId}`;
  nodes.push({ id: centerId, origId: selectedObjId, name: x(selObj?.name||''), category: selObj?.category_name||'', color: selObj?.category_color_code||'#6366f1', size: 12 });
  for(const o of relObjs){ nodes.push({ id: `obj-${o.id}`, origId:o.id, name: x(o.name), category: o.category_name||'', color: o.category_color_code||'#6366f1', size:8 }); }
  for(const t of tlNodes){ nodes.push({ id: t.id, origId:null, name: t.name, color: t.color_code||'#06b6d4', size:8 }); }
  const nodeIdSet = new Set(nodes.map(n=>n.id));
  const links = [];
  for(const r of connected){
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`), to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    const peer = from?.id===selectedObjId?to:from; if(!peer) continue;
    const src = centerId, dst = `obj-${peer.id}`; if(!nodeIdSet.has(dst)) continue;
    links.push({ source: src, target: dst, name: r.relation_name||'', color: r.color_code||'#999' });
  }
  for(const r of myTlRels){
    const tlNode = tlNodes.find(t=>t.name===r.to_name&&t.relation_name===r.relation_name); if(!tlNode) continue;
    const dst = tlNode.id; if(!nodeIdSet.has(dst)) continue;
    links.push({ source: centerId, target: dst, name: r.relation_name||'', color: r.color_code||'#06b6d4', dashed:true });
  }
  await renderForceGraph({ nodes, links }, { onNodeClick: (n,event) => { if(n.origId) showRelationNodeNote(event, n); } });
  renderRelList([
    ...connected.map(r=>({ ...r, kind:'obob' })),
    ...myTlRels.map(r=>({ ...r, kind:'obtl' }))
  ]);
  ensureWbViewState('obj', selectedObjId);
  bindWhiteboardInteractions('obj', selectedObjId);
}

async function renderProjectWhiteboard(projectId){
  const allObjs = await api.relation.getProjectObjects(projectId);
  const rels = await api.relation.getOBOB(projectId);
  const objByKey = new Map(allObjs.map(o=>[`${o.category_name}::${o.name}`, o]));
  const objIdSet = new Set(allObjs.map(o=>o.id));
  if(!relationNodeState.projectView[projectId]) relationNodeState.projectView[projectId]={};
  const positions = relationNodeState.projectView[projectId];
  const radius=170, cx=300, cy=200, anglePerNode=(2*Math.PI)/Math.max(allObjs.length,1);
  allObjs.forEach((o,i)=>{
    if(!positions[o.id]) positions[o.id]={ x:cx+Math.cos(i*anglePerNode)*radius, y:cy+Math.sin(i*anglePerNode)*radius };
  });
  // Build graph data for project view
  const nodes = allObjs.map(o=>({ id:`obj-${o.id}`, origId:o.id, name:x(o.name), category:o.category_name||'', color:o.category_color_code||'#6366f1' }));
  const nodeIdSet = new Set(nodes.map(n=>n.id));
  const links = [];
  for(const r of rels){
    const from=objByKey.get(`${r.from_cat}::${r.from_name}`);
    const to=objByKey.get(`${r.to_cat}::${r.to_name}`);
    if(!from || !to || !objIdSet.has(from.id) || !objIdSet.has(to.id)) continue;
    const src=`obj-${from.id}`, dst=`obj-${to.id}`; if(!nodeIdSet.has(src) || !nodeIdSet.has(dst)) continue;
    links.push({ source: src, target: dst, name: r.relation_name||'', color: r.color_code||'#999' });
  }
  await renderForceGraph({ nodes, links }, { onNodeClick: (n,event) => { if(n.origId) showRelationNodeNote(event, n); } });
  renderRelList(rels.map(r=>({ ...r, kind:'obob' })));
  ensureWbViewState('proj', projectId);
  bindWhiteboardInteractions('proj', projectId);
}

let dragState=null;
let panState=null;
let wbResizeState=null;
let relListResizeState=null;

function applyRelListHeight(){
  const listPanel = q('.relation-main .rel-underboard');
  if(!listPanel) return;
  if(S.relListHeight){
    listPanel.style.flex = `0 0 ${S.relListHeight}px`;
    listPanel.style.height = `${S.relListHeight}px`;
  } else {
    listPanel.style.flex = '';
    listPanel.style.height = '';
  }
}

function startRelListResize(e){
  if(e.button !== 0) return;
  const listPanel = q('.relation-main .rel-underboard');
  const graphPanel = q('#wb-container');
  if(!listPanel || !graphPanel) return;
  e.preventDefault();
  const listRect = listPanel.getBoundingClientRect();
  const graphRect = graphPanel.getBoundingClientRect();
  q('#main-inner')?.classList.add('is-rel-list-resizing');
  relListResizeState = {
    startY:e.clientY,
    startListH:listRect.height,
    startGraphH:graphRect.height,
  };
}

function getWbViewStore(viewType){
  if(viewType==='cat') return relationWbViewState.catView;
  if(viewType==='obj') return relationWbViewState.objView;
  return relationWbViewState.projectView;
}
function ensureWbViewState(viewType,viewId){
  const store = getWbViewStore(viewType);
  if(!store[viewId]) store[viewId] = { scale:1, tx:0, ty:0, width:null, height:null };
  return store[viewId];
}
function applyWhiteboardSize(viewType,viewId){
  const c = q('#wb-container');
  if(!c) return;
  const t = ensureWbViewState(viewType, viewId);
  c.style.flex = t.width || t.height ? '0 0 auto' : '';
  c.style.width = t.width ? `${t.width}px` : '';
  c.style.height = t.height ? `${t.height}px` : '';
}
function applyWhiteboardTransform(viewType,viewId){
  const t = ensureWbViewState(viewType, viewId);
  const svg = q('#wb-svg');
  const nodes = q('#wb-nodes');
  if(!svg || !nodes) return;
  const transform = `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})`;
  svg.style.transformOrigin = '0 0';
  nodes.style.transformOrigin = '0 0';
  svg.style.transform = transform;
  nodes.style.transform = transform;
}
function bindWhiteboardInteractions(viewType,viewId){
  const c = q('#wb-container');
  if(!c) return;
  applyWhiteboardSize(viewType, viewId);
  c.oncontextmenu = (e)=>e.preventDefault();
  c.onwheel = (e)=>{
    e.preventDefault();
    const t = ensureWbViewState(viewType, viewId);
    const rect = c.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const oldScale = t.scale;
    const step = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.3, Math.min(3, oldScale * step));
    const worldX = (px - t.tx) / oldScale;
    const worldY = (py - t.ty) / oldScale;
    t.scale = newScale;
    t.tx = px - worldX * newScale;
    t.ty = py - worldY * newScale;
    applyWhiteboardTransform(viewType, viewId);
  };
  c.onmousedown = (e)=>{
    if(e.button!==2) return;
    e.preventDefault();
    c.classList.add('is-panning');
    panState = { viewType, viewId, startX:e.clientX, startY:e.clientY };
  };
  const resizeHandle = c.querySelector('.rel-resize-handle');
  if(resizeHandle){
    resizeHandle.onmousedown = (e)=>{
      if(e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = c.getBoundingClientRect();
      c.classList.add('is-resizing');
      wbResizeState = {
        viewType,
        viewId,
        startX:e.clientX,
        startY:e.clientY,
        startW:rect.width,
        startH:rect.height,
        maxW:Math.max(420, c.parentElement?.clientWidth || rect.width),
      };
    };
  }
}

function startNodeDrag(e,objId,viewType,viewId){
  if(e.button!==0) return;
  e.preventDefault();
  dragState={objId,viewType,viewId,startX:e.clientX,startY:e.clientY};
}
document.addEventListener('mousemove',function(e){
  if(relListResizeState){
    const listPanel = q('.relation-main .rel-underboard');
    const graphPanel = q('#wb-container');
    if(listPanel && graphPanel){
      const delta = relListResizeState.startY - e.clientY;
      const nextListH = Math.max(180, Math.min(760, relListResizeState.startListH + delta));
      const nextGraphH = Math.max(220, relListResizeState.startGraphH - delta);
      S.relListHeight = Math.round(nextListH);
      listPanel.style.flex = `0 0 ${S.relListHeight}px`;
      listPanel.style.height = `${S.relListHeight}px`;
      graphPanel.style.flex = '0 0 auto';
      graphPanel.style.height = `${Math.round(nextGraphH)}px`;
    }
    return;
  }
  if(wbResizeState){
    const c = q('#wb-container');
    if(c){
      const t = ensureWbViewState(wbResizeState.viewType, wbResizeState.viewId);
      const nextW = Math.max(360, Math.min(wbResizeState.maxW, wbResizeState.startW + e.clientX - wbResizeState.startX));
      const nextH = Math.max(260, Math.min(1000, wbResizeState.startH + e.clientY - wbResizeState.startY));
      t.width = Math.round(nextW);
      t.height = Math.round(nextH);
      applyWhiteboardSize(wbResizeState.viewType, wbResizeState.viewId);
    }
    return;
  }
  if(panState){
    const t = ensureWbViewState(panState.viewType, panState.viewId);
    t.tx += e.clientX - panState.startX;
    t.ty += e.clientY - panState.startY;
    panState.startX = e.clientX; panState.startY = e.clientY;
    applyWhiteboardTransform(panState.viewType, panState.viewId);
  }
  if(dragState){
    const viewKey = dragState.viewType==='cat' ? 'catView' : (dragState.viewType==='obj' ? 'objView' : 'projectView');
    const pos=relationNodeState[viewKey][dragState.viewId]||{};
    if(!pos[dragState.objId]) pos[dragState.objId]={x:0,y:0};
    const t = ensureWbViewState(dragState.viewType, dragState.viewId);
    const scale = t.scale || 1;
    pos[dragState.objId].x+=(e.clientX-dragState.startX)/scale;
    pos[dragState.objId].y+=(e.clientY-dragState.startY)/scale;
    dragState.startX=e.clientX; dragState.startY=e.clientY;
    const node=q(`[data-obj-id="${dragState.objId}"]`);
    if(node){
      node.style.left=pos[dragState.objId].x+'px'; node.style.top=pos[dragState.objId].y+'px';
    }
    const { viewType, viewId } = dragState;
    if(viewType==='cat') setTimeout(()=>renderCategoryWhiteboard(viewId),0);
    else if(viewType==='obj') setTimeout(()=>renderObjectWhiteboard(viewId),0);
    else setTimeout(()=>renderProjectWhiteboard(viewId),0);
  }
});
document.addEventListener('mouseup',function(){
  if(relListResizeState){
    relListResizeState = null;
    q('#main-inner')?.classList.remove('is-rel-list-resizing');
    return;
  }
  if(wbResizeState){
    const { viewType, viewId } = wbResizeState;
    wbResizeState = null;
    q('#wb-container')?.classList.remove('is-resizing');
    if(viewType==='cat') setTimeout(()=>renderCategoryWhiteboard(viewId),0);
    else if(viewType==='obj') setTimeout(()=>renderObjectWhiteboard(viewId),0);
    else setTimeout(()=>renderProjectWhiteboard(viewId),0);
    return;
  }
  dragState=null;
});

function ensureKonva(){
  if(window.Konva) return Promise.resolve();
  if(window.__konvaLoading) return new Promise(resolve=>{ const iv=setInterval(()=>{ if(window.Konva){ clearInterval(iv); resolve(); } },50); });
  window.__konvaLoading = true;
  // Vendored copy first (offline app); CDN only as a fallback.
  const load = (src) => new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = src;
    s.onload = ()=>resolve();
    s.onerror = ()=>{ s.remove(); reject(new Error('Failed to load '+src)); };
    document.body.appendChild(s);
  });
  return load('vendor/konva.min.js')
    .catch(()=>load('https://unpkg.com/konva@9/konva.min.js'))
    .finally(()=>{ window.__konvaLoading = false; });
}

