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

// These three were previously (and incorrectly) only defined in relation.js —
// map.js's own markup calls them, so opening Map without having first
// visited Relation left them undefined (ReferenceError on click).
async function selectMap(id){
  const maps = await api.map.getAll(S.project.id);
  S.map = maps.find(m => m.id === id) || null;
  S.mapAreaId = null;
  await renderMapView();
}
function selectMapArea(id){ S.mapAreaId=id; renderMapView(); }
function setMapTool(tool){ S.mapTool=tool; renderMapView(); }

function renderAreaList(areas){
  if(!areas.length){
    return `<div class="empty" style="padding:18px 10px"><p>ยังไม่มี Area</p></div>`;
  }
  return areas.map(area => {
    const color = area.color_code || '#06b6d4';
    const active = S.mapAreaId === area.id;
    const points = mapState.pointsByArea[area.id]?.length || 0;
    return `<div class="rel-card ${active?'active':''}" onclick="selectMapArea(${area.id})">
      <span class="dot" style="background:${color}"></span>
      <div class="rel-card-content">
        <div>${x(area.area_name || 'ไม่มีชื่อ')}</div>
        <span class="rel-cat">${points} points</span>
      </div>
      <div class="rel-card-actions">
        <button class="btn btn-s btn-i" onclick="event.stopPropagation();openMapAreaModal(${area.id})">${I.edit}</button>
        <button class="btn btn-s btn-i" onclick="event.stopPropagation();delMapArea(${area.id})" style="color:var(--danger)">${I.delete}</button>
      </div>
    </div>`;
  }).join('');
}

const MAP_GEOMETRY_EPS = 0.000001;

function sameMapPoint(a,b){
  return Math.abs(a.x - b.x) < MAP_GEOMETRY_EPS && Math.abs(a.y - b.y) < MAP_GEOMETRY_EPS;
}

function mapCross(o,a,b){
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function getMapAreaBoundaryPoints(points){
  const unique = [];
  for(const p of points){
    if(!unique.some(u => sameMapPoint(u,p))) unique.push(p);
  }
  if(unique.length <= 2) return unique;

  const sorted = [...unique].sort((a,b) => a.x === b.x ? a.y - b.y : a.x - b.x);
  const lower = [];
  for(const p of sorted){
    while(lower.length >= 2 && mapCross(lower[lower.length-2], lower[lower.length-1], p) <= MAP_GEOMETRY_EPS){
      lower.pop();
    }
    lower.push(p);
  }
  const upper = [];
  for(let i=sorted.length-1;i>=0;i--){
    const p = sorted[i];
    while(upper.length >= 2 && mapCross(upper[upper.length-2], upper[upper.length-1], p) <= MAP_GEOMETRY_EPS){
      upper.pop();
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function mapAreaLinePoints(points){
  return points.map(p => [p.x, p.y]).flat();
}

async function renderMapView(){
  if(!S.project){
    q('#left-panel-inner').innerHTML=`<div class="empty" style="padding:40px 10px"><div class="ei">${I.map}</div><p style="text-align:center">กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    q('#main-inner').innerHTML=`<div class="empty" style="margin-top:80px"><div class="ei">${I.map}</div><h3>Mapping</h3><p>กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    return;
  }
  await ensureKonva();
  const maps = await api.map.getAll(S.project.id);
  let lh = `<div class="ph"><h4>Map</h4><button class="btn btn-g btn-i" onclick="openMapModal()">${I.plus}</button></div>`;
  for(const m of maps){
    const col=m.color_code||'#06b6d4', act=S.map?.id===m.id;
    lh += `<div class="li ${act?'active':''}" onclick="selectMap(${m.id})"><div class="dot" style="background:${col}"></div><span class="name">${x(m.map_name||'ไม่มีชื่อ')}</span><div class="acts"><button class="btn btn-g btn-i" onclick="event.stopPropagation();openMapModal(${m.id})">${I.edit}</button><button class="btn btn-g btn-i" onclick="event.stopPropagation();delMap(${m.id})" style="color:var(--danger)">${I.delete}</button></div></div>`;
  }
  if(!maps.length) lh += `<p style="font-size:12px;color:var(--t3);padding:10px 12px">ยังไม่มี Map</p>`;
  q('#left-panel-inner').innerHTML = lh;

  if(!S.map){
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px"><div class="ei">${I.map}</div><h3>ยังไม่มี Map</h3><button class="btn btn-p" onclick="openMapModal()">${I.plus} สร้าง Map</button></div>`;
    return;
  }
  const areas = await api.map.getAreas(S.map.id);
  if(S.mapAreaId && !areas.find(a=>a.id===S.mapAreaId)) S.mapAreaId = null;
  await Promise.all(areas.map(async a => {
    mapState.pointsByArea[a.id] = await api.map.getPoints(a.id);
  }));
  let h = `<div class="ch"><h2>${x(S.map.map_name||'Map')}</h2><button class="btn btn-s btn-i" onclick="openMapModal(${S.map.id})">${I.edit}</button></div>
  <div class="rel-toolbar">
    <button class="btn btn-i ${S.mapTool==='create'?'btn-p':'btn-s'}" onclick="setMapTool('create')" title="Create point" aria-label="Create point">${I.plus}</button>
    <button class="btn btn-i ${S.mapTool==='delete'?'btn-p':'btn-s'}" onclick="setMapTool('delete')" title="Delete point" aria-label="Delete point">${I.delete}</button>
    <button class="btn btn-i ${S.mapTool==='move'?'btn-p':'btn-s'}" onclick="setMapTool('move')" title="Move point" aria-label="Move point">${I.move}</button>
    <span style="font-size:12px;color:var(--t3)">ต้องเลือก Area ก่อนใช้ Tool</span>
  </div>
  <div id="map-board" class="map-whiteboard">
    <div id="map-konva-container" style="width:100%; height:100%;"></div>
  </div>
  <div class="rel-underboard">
    <div class="ph"><h4>Area</h4><div class="acts"><button class="btn btn-g" onclick="openMapAreaModal()">${I.plus} เพิ่ม Area</button></div></div>
    <div class="map-area-list">${renderAreaList(areas)}</div>
  </div>`;
  q('#main-inner').innerHTML = h;
  await renderMapBoard();
}

function getMapViewState(mapId){
  if(!mapState.viewByMap[mapId]) mapState.viewByMap[mapId] = { scale:1, tx:0, ty:0 };
  return mapState.viewByMap[mapId];
}

async function renderMapBoard(){
  if(!S.map) return;
  const areas = await api.map.getAreas(S.map.id);
  for(const a of areas) mapState.pointsByArea[a.id] = await api.map.getPoints(a.id);
  
  const container = q('#map-konva-container');
  if(!container) return;

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 540;
  
  const v = getMapViewState(S.map.id);
  
  if (konvaStage) {
    try { konvaStage.destroy(); } catch(e){}
  }

  const boardEl = q('#map-board');
  if (boardEl) {
    boardEl.oncontextmenu = (e)=>e.preventDefault();
  }

  konvaStage = new Konva.Stage({
    container: 'map-konva-container',
    width: width,
    height: height,
  });

  const layer = new Konva.Layer();
  konvaStage.add(layer);

  konvaStage.scale({ x: v.scale, y: v.scale });
  konvaStage.position({ x: v.tx, y: v.ty });

  for(const area of areas){
    const pts = mapState.pointsByArea[area.id] || [];
    const boundaryPts = getMapAreaBoundaryPoints(pts);
    const color = area.color_code || '#06b6d4';
    const isActiveArea = S.mapAreaId === area.id;

    let poly = null;
    if(boundaryPts.length >= 2){
      poly = new Konva.Line({
        points: mapAreaLinePoints(pts),
        fill: boundaryPts.length >= 3 ? color : 'transparent',
        opacity: boundaryPts.length >= 3 ? 0.18 : 0,
        stroke: color,
        strokeWidth: 2 / v.scale,
        closed: true,
      });
      poly.on('click tap', (e) => {
        if(e.evt.button === 0){
          e.cancelBubble = true;
          if(S.mapTool === 'create' && S.mapAreaId === area.id){
            const pointer = konvaStage.getPointerPosition();
            const wx = (pointer.x - konvaStage.x()) / konvaStage.scaleX();
            const wy = (pointer.y - konvaStage.y()) / konvaStage.scaleX();
            pts.push({ x: wx, y: wy });
            mapState.pointsByArea[area.id] = pts;
            api.map.setPoints(area.id, pts).then(renderMapBoard);
            return;
          }
          selectMapArea(area.id);
        }
      });
      layer.add(poly);
    }

    for(const p of pts){
      const circle = new Konva.Circle({
        x: p.x,
        y: p.y,
        radius: (isActiveArea ? 7 : 5) / v.scale,
        fill: isActiveArea ? '#ffffff' : color,
        stroke: color,
        strokeWidth: 2 / v.scale,
        draggable: S.mapTool === 'move' && isActiveArea,
        areaId: area.id,
      });

      circle.on('dragmove', (e) => {
        const newPos = circle.position();
        p.x = newPos.x;
        p.y = newPos.y;
        if(poly) {
          const nextBoundaryPts = getMapAreaBoundaryPoints(pts);
          poly.points(mapAreaLinePoints(pts));
          poly.fill(nextBoundaryPts.length >= 3 ? color : 'transparent');
          poly.opacity(nextBoundaryPts.length >= 3 ? 0.18 : 0);
        }
        layer.batchDraw();
      });

      circle.on('dragend', () => {
        api.map.setPoints(area.id, pts).then(() => {
          const list = q('.map-area-list');
          if(list) list.innerHTML = renderAreaList(areas);
        });
      });

      circle.on('click tap', (e) => {
        if(e.evt.button === 0){
          e.cancelBubble = true;
          if(S.mapTool === 'delete'){
            const idx = pts.indexOf(p);
            if(idx >= 0){
              pts.splice(idx, 1);
              api.map.setPoints(area.id, pts).then(renderMapBoard);
            }
          } else {
            selectMapArea(area.id);
          }
        }
      });

      layer.add(circle);
    }
  }

  let isPanning = false;
  let startPos = { x: 0, y: 0 };

  konvaStage.on('mousedown', (e) => {
    if (e.evt.button === 2) {
      isPanning = true;
      startPos = { x: e.evt.clientX, y: e.evt.clientY };
      q('#map-board')?.classList.add('is-panning');
    }
  });

  konvaStage.on('mousemove', (e) => {
    if (isPanning) {
      const dx = e.evt.clientX - startPos.x;
      const dy = e.evt.clientY - startPos.y;
      startPos = { x: e.evt.clientX, y: e.evt.clientY };
      const newPos = {
        x: konvaStage.x() + dx,
        y: konvaStage.y() + dy,
      };
      konvaStage.position(newPos);
      v.tx = newPos.x;
      v.ty = newPos.y;
      layer.batchDraw();
    }
  });

  konvaStage.on('click tap', (e) => {
    if (e.evt.button !== 0) return;
    if (e.target === konvaStage) {
      if (!S.mapAreaId) {
        toast('เลือก Area ก่อนใช้งาน Tool', 'err');
        return;
      }
      const pointer = konvaStage.getPointerPosition();
      const wx = (pointer.x - konvaStage.x()) / konvaStage.scaleX();
      const wy = (pointer.y - konvaStage.y()) / konvaStage.scaleX();
      const points = mapState.pointsByArea[S.mapAreaId] || [];

      if (S.mapTool === 'create') {
        points.push({ x: wx, y: wy });
        mapState.pointsByArea[S.mapAreaId] = points;
        api.map.setPoints(S.mapAreaId, points).then(renderMapBoard);
      }
    }
  });

  konvaStage.on('wheel', (e) => {
    e.evt.preventDefault();
    const oldScale = konvaStage.scaleX();
    const pointer = konvaStage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - konvaStage.x()) / oldScale,
      y: (pointer.y - konvaStage.y()) / oldScale,
    };

    const step = e.evt.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.3, Math.min(4, oldScale * step));

    konvaStage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    konvaStage.position(newPos);
    v.scale = newScale;
    v.tx = newPos.x;
    v.ty = newPos.y;

    layer.getChildren().forEach((node) => {
      if (node instanceof Konva.Circle) {
        const isActive = S.mapAreaId === node.attrs.areaId;
        node.radius((isActive ? 7 : 5) / newScale);
        node.strokeWidth(2 / newScale);
      } else if (node instanceof Konva.Line) {
        node.strokeWidth(2 / newScale);
      }
    });

    layer.batchDraw();
  });

  const cleanupPan = () => {
    if (isPanning) {
      isPanning = false;
      q('#map-board')?.classList.remove('is-panning');
    }
  };
  window.removeEventListener('mouseup', cleanupPan);
  window.addEventListener('mouseup', cleanupPan);

  layer.batchDraw();
}

async function openMapModal(id=null){
  let m=null;
  if(id){ const maps=await api.map.getAll(S.project.id); m=maps.find(t=>t.id===id); }
  openModal(m?'✏️ แก้ไข Map':'🧭 Map ใหม่',`
    <div class="fg"><label>ชื่อ Map *</label><input id="map-n" value="${x(m?.map_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(m?.color)}</div>
    <div class="mfoot">${m?`<button class="btn btn-d" onclick="delMap(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${m?'saveMap('+id+')':'createMap()'}">${m?'บันทึก':'สร้าง'}</button></div>`);
}
async function createMap(){ const n=q('#map-n').value.trim(); if(!n) return; const r=await api.map.create(S.project.id,n,q('#sel-color').value||null); closeModal(); const maps=await api.map.getAll(S.project.id); S.map=maps.find(t=>t.id===r.lastInsertRowid)||null; await renderMapView(); toast('สร้าง Map แล้ว','ok'); }
async function saveMap(id){ const n=q('#map-n').value.trim(); if(!n) return; await api.map.update(id,n,q('#sel-color').value||null); closeModal(); const maps=await api.map.getAll(S.project.id); S.map=maps.find(t=>t.id===id)||null; await renderMapView(); toast('บันทึกแล้ว','ok'); }
async function delMap(id){ if(!await uiConfirm('ลบ Map นี้?')) return; await api.map.delete(id); closeModal(); if(S.map?.id===id) S.map=null; S.mapAreaId=null; await renderMapView(); toast('ลบเรียบร้อยแล้ว'); }

async function openMapAreaModal(id=null){
  if(!S.map) return;
  const areas = await api.map.getAreas(S.map.id);
  const a = id ? areas.find(v=>v.id===id) : null;
  openModal(a?'✏️ แก้ไข Area':'🧩 Area ใหม่',`
    <div class="fg"><label>ชื่อ Area *</label><input id="area-n" value="${x(a?.area_name||'')}"></div>
    <div class="fg"><label>สี</label>${await colorPicker(a?.color)}</div>
    <div class="mfoot">${a?`<button class="btn btn-d" onclick="delMapArea(${id})">ลบ</button>`:''}<button class="btn btn-s" onclick="closeModal()">ยกเลิก</button><button class="btn btn-p" onclick="${a?'saveMapArea('+id+')':'createMapArea()'}">${a?'บันทึก':'สร้าง'}</button></div>`);
}
async function createMapArea(){ const n=q('#area-n').value.trim(); if(!n || !S.map) return; const r=await api.map.createArea(S.map.id,n,q('#sel-color').value||null); closeModal(); S.mapAreaId=r.lastInsertRowid; mapState.pointsByArea[S.mapAreaId]=[]; await renderMapView(); toast('สร้าง Area แล้ว','ok'); }
async function saveMapArea(id){ const n=q('#area-n').value.trim(); if(!n) return; await api.map.updateArea(id,n,q('#sel-color').value||null); closeModal(); await renderMapView(); toast('บันทึกแล้ว','ok'); }
async function delMapArea(id){ if(!await uiConfirm('ลบ Area นี้?')) return; await api.map.deleteArea(id); closeModal(); if(S.mapAreaId===id) S.mapAreaId=null; delete mapState.pointsByArea[id]; await renderMapView(); toast('ลบเรียบร้อยแล้ว'); }

// ═══ HASHTAG VIEW ══════════════════════════════════════
function autoExpand(el){
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

