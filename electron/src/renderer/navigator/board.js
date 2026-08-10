// The Maps + Timeline board itself — the Konva map canvas (pan/zoom, areas,
// placed objects, hover tooltip) and the SVG timeline graph beneath it.
// ═══ Map + Timeline board (2 graphs) ══════════════════
// Graph 1 (#timeline-graph-board, shown first): an SVG line of the timeline's
// events. Graph 2 (#map-board): a Konva canvas showing the timeline's anchor
// map's areas (reusing map.js's ensureKonva/getMapAreaBoundaryPoints/mapAreaLinePoints
// helpers), plus the objects/characters placed on the active event as symbol
// icons (world_timeline_object + world_timeline_point).
// Clicking an event card on Graph 1 selects it as S.worldActiveEventId, loading
// its placed objects onto Graph 2. A toolbar (mirrors map.js's create/delete/move
// tool pattern) lets the active event's objects be added/deleted/moved directly
// on Graph 2: Add opens a picker modal at the clicked point, Delete removes an
// icon on click, Move makes icons draggable and persists on drop.
let worldKonvaStage = null;
let worldKonvaObjLayer = null;
let worldMapBoardCleanup = null;
const worldMapBoardState = {};
const worldTimelineGraphState = {};

function getWorldMapBoardState(mapId) {
  if (!worldMapBoardState[mapId]) worldMapBoardState[mapId] = { scale: 1, tx: 0, ty: 0, fitted: false };
  return worldMapBoardState[mapId];
}

// Runs once per map (until the user pans/zooms) so the board opens showing
// every area instead of defaulting to identity scale/position, which could
// leave areas drawn off-screen depending on how the map's points were placed.
function fitWorldMapBoardView(state, pointsByArea, width, height) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pts of Object.values(pointsByArea)) {
    for (const p of (pts || [])) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return;
  const boundsW = Math.max(1, maxX - minX), boundsH = Math.max(1, maxY - minY);
  const padding = 0.85;
  const scale = Math.max(0.3, Math.min(4, Math.min((width / boundsW) * padding, (height / boundsH) * padding, 1)));
  state.scale = scale;
  state.tx = (width - boundsW * scale) / 2 - minX * scale;
  state.ty = (height - boundsH * scale) / 2 - minY * scale;
}

// Toolbar for the active event's placed objects — mirrors map.js's
// create/delete/move tool pattern (S.mapTool). Tools stay selectable even with
// no active event; using one without an event picked just toasts a hint.
function renderWorldMapToolbarHtml() {
  const hint = S.worldActiveEventId
    ? 'Add: click the map · Delete: click an object · Move: drag an object'
    : 'Select a date on the timeline first';
  return `<div class="rel-toolbar" id="wmtl-toolbar">
    <button class="btn btn-i ${S.worldMapTool === 'add' ? 'btn-p' : 'btn-s'}" onclick="setWorldMapTool('add')" title="Add object" aria-label="Add object">${I.plus}</button>
    <button class="btn btn-i ${S.worldMapTool === 'delete' ? 'btn-p' : 'btn-s'}" onclick="setWorldMapTool('delete')" title="Delete object" aria-label="Delete object">${I.delete}</button>
    <button class="btn btn-i ${S.worldMapTool === 'move' ? 'btn-p' : 'btn-s'}" onclick="setWorldMapTool('move')" title="Move object" aria-label="Move object">${I.move}</button>
    <span style="font-size:calc(12px * var(--fsc,1));color:var(--t3)">${hint}</span>
  </div>`;
}

function setWorldMapTool(tool) {
  S.worldMapTool = S.worldMapTool === tool ? null : tool;
  const bar = q('#wmtl-toolbar');
  if (bar) bar.outerHTML = renderWorldMapToolbarHtml();
  if (S.worldActiveEventId && worldKonvaStage) paintEventObjectsOnBoard(S.worldActiveEventId, worldKonvaStage.scaleX());
}

async function renderWorldMapTimelineBoard(worldId, timelineId) {
  await loadModule('src/renderer/map.js');
  await ensureKonva();
  const timelines = await api.world.getTimelines(worldId);
  const tl = timelines.find(t => t.id === timelineId);
  const body = q('#world-tab-body');
  if (!tl || !body) return;
  const events = await api.world.getEvents(timelineId);

  let h = `<div class="ch" id="wmtl-head">
    <h2 style="flex:1">${x(tl.name)}</h2>
    <button class="btn btn-p" onclick="openWorldEventModal(${worldId},${timelineId})" style="padding:6px 12px;font-size:calc(12.5px * var(--fsc,1))">${I.plus} Event</button>
    ${S.worldActiveEventId ? `<button class="btn btn-s" style="padding:6px 12px;font-size:calc(12.5px * var(--fsc,1))" onclick="openEventObjectsModal(${worldId},${S.worldActiveEventId})">${I.layer} Objects</button>` : ''}
  </div>
  <div class="wmtl-hint" id="wmtl-hint">
    <span>🖱️ Right-click + drag to pan</span>
    <span>🔍 Scroll to zoom</span>
    <span>📍 Click a date on the timeline to select it</span>
  </div>
  <div id="wmtl-graphs" style="display:flex;flex-direction:column;gap:8px;min-height:0">
    ${renderWorldTimelineGraphSvg(worldId, timelineId, events)}
    ${renderWorldMapToolbarHtml()}
    <div id="map-board" class="map-whiteboard" style="flex:8 1 0;min-height:0;height:auto;position:relative">
      <div id="world-map-konva-container" style="width:100%;height:100%;"></div>
      <div id="world-map-obj-tip" class="konva-tooltip" style="display:none"></div>
    </div>
  </div>`;

  body.innerHTML = h;
  fitWorldMapTimelineGraphs();
  await renderWorldMapBoard(tl.world_map_ref);
  bindWorldTimelineGraphInteractions(timelineId);
}

// Splits the available #main-inner height (minus the header + hint) roughly 8:1
// between the map board and the timeline graph, so the pair always fits the
// window with no overflow. The timeline height is clamped so it stays readable
// on short windows and doesn't grow oversized on tall ones; the map board
// (flex:8) fills whatever remains.
function fitWorldMapTimelineGraphs() {
  const wrap = q('#wmtl-graphs');
  const head = q('#wmtl-head');
  const hint = q('#wmtl-hint');
  const mainInner = q('#main-inner');
  if (!wrap || !mainInner) return;
  const headH = head?.offsetHeight || 0;
  const hintH = hint?.offsetHeight || 0;
  const avail = Math.max(320, mainInner.clientHeight - headH - hintH - 12);
  wrap.style.height = `${avail}px`;
  const tlBoard = q('#timeline-graph-board');
  if (tlBoard) tlBoard.style.height = `${Math.min(150, Math.max(96, Math.round(avail / 9)))}px`;
}

async function renderWorldMapBoard(worldMapId) {
  const container = q('#world-map-konva-container');
  if (!container) return;
  if (!worldMapId) {
    container.innerHTML = `<div class="empty" style="margin-top:60px"><p style="color:var(--t3)">This timeline has no anchor map.</p></div>`;
    return;
  }
  const areas = await api.world.getMapAreas(worldMapId);
  const pointsByArea = {};
  await Promise.all(areas.map(async a => { pointsByArea[a.id] = await api.map.getPoints(a.area_ref); }));

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 460;
  const v = getWorldMapBoardState(worldMapId);
  if (!v.fitted) { fitWorldMapBoardView(v, pointsByArea, width, height); v.fitted = true; }

  if (worldKonvaStage) { try { worldKonvaStage.destroy(); } catch (e) {} }
  worldKonvaStage = new Konva.Stage({ container: 'world-map-konva-container', width, height });
  const areaLayer = new Konva.Layer();
  worldKonvaStage.add(areaLayer);
  worldKonvaStage.scale({ x: v.scale, y: v.scale });
  worldKonvaStage.position({ x: v.tx, y: v.ty });

  for (const area of areas) {
    const pts = pointsByArea[area.id] || [];
    const boundaryPts = getMapAreaBoundaryPoints(pts);
    const color = area.color_code || '#06b6d4';
    if (boundaryPts.length >= 2) {
      areaLayer.add(new Konva.Line({
        points: mapAreaLinePoints(pts),
        fill: boundaryPts.length >= 3 ? color : 'transparent',
        opacity: boundaryPts.length >= 3 ? 0.18 : 0,
        stroke: color, strokeWidth: 2 / v.scale, closed: true,
      }));
    }
  }

  worldKonvaObjLayer = new Konva.Layer();
  worldKonvaStage.add(worldKonvaObjLayer);
  if (S.worldActiveEventId) await paintEventObjectsOnBoard(S.worldActiveEventId, v.scale);

  const boardEl = q('#map-board');
  if (boardEl) boardEl.oncontextmenu = (e) => e.preventDefault();
  if (worldMapBoardCleanup) worldMapBoardCleanup();
  const mapPanController = new AbortController();
  worldMapBoardCleanup = () => mapPanController.abort();
  let isPanning = false, startPos = { x: 0, y: 0 };
  worldKonvaStage.on('mousedown', (e) => {
    if (e.evt.button === 2) { isPanning = true; startPos = { x: e.evt.clientX, y: e.evt.clientY }; boardEl?.classList.add('is-panning'); }
  });
  worldKonvaStage.on('mousemove', (e) => {
    if (!isPanning) return;
    const dx = e.evt.clientX - startPos.x, dy = e.evt.clientY - startPos.y;
    startPos = { x: e.evt.clientX, y: e.evt.clientY };
    const newPos = { x: worldKonvaStage.x() + dx, y: worldKonvaStage.y() + dy };
    worldKonvaStage.position(newPos);
    v.tx = newPos.x; v.ty = newPos.y;
    areaLayer.batchDraw(); worldKonvaObjLayer.batchDraw();
  });
  const cleanupPan = () => { if (isPanning) { isPanning = false; boardEl?.classList.remove('is-panning'); } };
  window.addEventListener('mouseup', cleanupPan, { signal: mapPanController.signal });
  worldKonvaStage.on('wheel', (e) => {
    e.evt.preventDefault();
    const oldScale = worldKonvaStage.scaleX();
    const pointer = worldKonvaStage.getPointerPosition();
    const mousePointTo = { x: (pointer.x - worldKonvaStage.x()) / oldScale, y: (pointer.y - worldKonvaStage.y()) / oldScale };
    const newScale = Math.max(0.3, Math.min(4, oldScale * (e.evt.deltaY < 0 ? 1.1 : 0.9)));
    worldKonvaStage.scale({ x: newScale, y: newScale });
    const newPos = { x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale };
    worldKonvaStage.position(newPos);
    v.scale = newScale; v.tx = newPos.x; v.ty = newPos.y;
    areaLayer.getChildren().forEach(n => { if (n instanceof Konva.Line) n.strokeWidth(2 / newScale); });
    areaLayer.batchDraw();
    worldKonvaObjLayer.getChildren().forEach(n => n.scale({ x: 1 / newScale, y: 1 / newScale }));
    worldKonvaObjLayer.batchDraw();
  });

  // "Add" tool: click anywhere on the map (including on top of an area, since
  // area shapes have no click handler of their own here and the event bubbles
  // up) to open a picker modal that places the chosen object at that point.
  // Placed-object icons cancelBubble on their own click, so this never fires
  // when the click actually landed on an existing icon.
  worldKonvaStage.on('click tap', (e) => {
    if (e.evt.button !== 0 || S.worldMapTool !== 'add') return;
    if (!S.worldActiveEventId) return toast('Select a date on the timeline first', 'err');
    const pointer = worldKonvaStage.getPointerPosition();
    const wx = (pointer.x - worldKonvaStage.x()) / worldKonvaStage.scaleX();
    const wy = (pointer.y - worldKonvaStage.y()) / worldKonvaStage.scaleX();
    openPlaceObjectAtModal(S.world.id, S.worldActiveEventId, wx, wy);
  });

  areaLayer.batchDraw();
}

// Draws the objects/characters placed on this event (world_timeline_object + point)
// as symbol-glyph labels at their (x,y), scaled inversely so they stay a fixed size.
// Each icon's interactivity follows the current toolbar tool (S.worldMapTool):
// 'delete' removes it on click, 'move' makes it draggable and persists on drop.
async function paintEventObjectsOnBoard(eventId, scale) {
  if (!worldKonvaObjLayer) return;
  worldKonvaObjLayer.destroyChildren();
  const objs = await api.world.getEventObjects(eventId);
  const inv = 1 / (scale || 1);
  for (const o of objs) {
    if (o.x == null || o.y == null) continue;
    const label = new Konva.Label({ x: o.x, y: o.y, scale: { x: inv, y: inv }, draggable: S.worldMapTool === 'move' });
    label.add(new Konva.Tag({ fill: o.color_code || '#6366f1', cornerRadius: 4, opacity: 0.92 }));
    label.add(new Konva.Text({ text: o.symbol || '●', fontSize: 14, padding: 4, fill: '#fff' }));
    label.offsetX(label.width() / 2);
    label.offsetY(label.height() / 2);
    label.on('click tap', (e) => {
      if (e.evt.button !== 0) return;
      e.cancelBubble = true;
      if (S.worldMapTool === 'delete') {
        api.world.removeEventObject(o.id).then(() => paintEventObjectsOnBoard(eventId, worldKonvaStage.scaleX()));
      }
    });
    label.on('dragend', () => {
      const pos = label.position();
      api.world.updateEventObjectPoint(o.id, pos.x, pos.y);
    });
    label.on('mouseenter', () => { document.body.style.cursor = S.worldMapTool === 'move' ? 'grab' : 'pointer'; showWorldMapObjTip(o.label, label); });
    label.on('mousemove', () => showWorldMapObjTip(o.label, label));
    label.on('dragmove', () => showWorldMapObjTip(o.label, label));
    label.on('mouseleave', () => { document.body.style.cursor = 'default'; hideWorldMapObjTip(); });
    worldKonvaObjLayer.add(label);
  }
  worldKonvaObjLayer.batchDraw();
}

// Placed objects/characters live on a Konva canvas, which has no DOM element
// per node to attach a native title= to — this floating div stands in.
function showWorldMapObjTip(label, node) {
  const tip = q('#world-map-obj-tip');
  if (!tip || !node) return;
  const pos = node.getAbsolutePosition();
  tip.textContent = label || '';
  tip.style.left = `${pos.x}px`;
  tip.style.top = `${pos.y - 10}px`;
  tip.style.display = 'block';
}
function hideWorldMapObjTip() {
  const tip = q('#world-map-obj-tip');
  if (tip) tip.style.display = 'none';
}

function renderWorldTimelineGraphSvg(worldId, tlid, events) {
  if (!events.length) {
    return `<div class="timeline-graph-board" id="timeline-graph-board" style="height:96px;display:flex;align-items:center;justify-content:center">
      <p style="color:var(--t3)">No events yet.</p>
    </div>`;
  }
  const MARGIN = 60, LINE_Y = 30, CARD_W = 110, SVG_H = 96;
  const sorted = events.slice().sort((a, b) => {
    const ka = (a.years || 0) * 10000 + (a.month || 0) * 100 + (a.day || 0);
    const kb = (b.years || 0) * 10000 + (b.month || 0) * 100 + (b.day || 0);
    return ka - kb;
  });
  const hostW = q('#main-inner')?.offsetWidth || 900;
  const trackW = Math.max(hostW, 700);
  const usable = trackW - (2 * MARGIN);
  const st = worldTimelineGraphState[tlid] ||= { scale: 1, tx: 0 };
  const toTs = (ev) => Date.UTC(ev.years || 0, (ev.month || 1) - 1, ev.day || 1, ev.hour || 0, ev.minute || 0);
  const tss = sorted.map(toTs);
  const minTs = Math.min(...tss), maxTs = Math.max(...tss);
  const spanTs = Math.max(1, maxTs - minTs);
  const xFromTs = (ts) => MARGIN + (((ts - minTs) / spanTs) * usable * st.scale);

  let svg = `<svg id="world-timeline-graph-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block" viewBox="0 0 ${trackW} ${SVG_H}" data-min-ts="${minTs}" data-span-ts="${spanTs}" data-margin="${MARGIN}" data-usable="${usable}" data-card-w="${CARD_W}" data-tlid="${tlid}">
    <g id="world-timeline-graph-content" transform="translate(${st.tx},0)">
    <line id="world-timeline-axis-line" x1="${MARGIN}" y1="${LINE_Y}" x2="${MARGIN + usable * st.scale}" y2="${LINE_Y}" stroke="var(--border)" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`;
  sorted.forEach((ev, i) => {
    const xi = xFromTs(tss[i]);
    const active = S.worldActiveEventId === ev.id;
    const label = `${ev.years}-${String(ev.month).padStart(2, '0')}-${String(ev.day).padStart(2, '0')}`;
    svg += `
      <circle data-event-dot="${ev.id}" data-ts="${tss[i]}" cx="${xi}" cy="${LINE_Y}" r="${active ? 7 : 5}" fill="${active ? 'var(--accent)' : '#6366f1'}"/>
      <foreignObject data-event-card="${ev.id}" data-ts="${tss[i]}" x="${xi - (CARD_W / 2)}" y="${LINE_Y + 16}" width="${CARD_W}" height="46" style="cursor:pointer" onclick="selectWorldTimelineEvent(${worldId},${tlid},${ev.id})">
        <div xmlns="http://www.w3.org/1999/xhtml" style="background:var(--surface);border:1px solid ${active ? 'var(--accent)' : 'var(--border)'};border-radius:8px;padding:4px 6px;font-size:calc(10px * var(--fsc,1));text-align:center;overflow:hidden">
          <div style="font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x(label)}</div>
        </div>
      </foreignObject>`;
  });
  svg += `</g></svg>`;
  return `<div class="timeline-graph-board" id="timeline-graph-board" style="height:${SVG_H}px">${svg}</div>`;
}

async function selectWorldTimelineEvent(worldId, tlid, eventId) {
  S.worldActiveEventId = S.worldActiveEventId === eventId ? null : eventId;
  await renderWorldMapTimelineBoard(worldId, tlid);
}

let worldTimelineGraphCleanup = null;

function bindWorldTimelineGraphInteractions(tlid) {
  if (worldTimelineGraphCleanup) worldTimelineGraphCleanup();
  const board = q('#timeline-graph-board');
  const svg = q('#world-timeline-graph-svg');
  if (!board || !svg) return;
  const controller = new AbortController();
  worldTimelineGraphCleanup = () => controller.abort();
  const st = worldTimelineGraphState[tlid] ||= { scale: 1, tx: 0 };
  const margin = Number(svg.dataset.margin || 60);
  const usable = Number(svg.dataset.usable || 1);
  const cardW = Number(svg.dataset.cardW || 110);
  const minTs = Number(svg.dataset.minTs || 0);
  const spanTs = Number(svg.dataset.spanTs || 1);
  const xFromTs = (ts) => margin + (((ts - minTs) / spanTs) * usable * st.scale);
  const updateX = () => {
    const axis = q('#world-timeline-axis-line');
    if (axis) axis.setAttribute('x2', String(margin + usable * st.scale));
    svg.querySelectorAll('[data-event-dot]').forEach(dot => dot.setAttribute('cx', xFromTs(Number(dot.dataset.ts || 0))));
    svg.querySelectorAll('[data-event-card]').forEach(card => card.setAttribute('x', xFromTs(Number(card.dataset.ts || 0)) - (cardW / 2)));
  };
  const applyTransform = () => {
    const g = q('#world-timeline-graph-content');
    if (g) g.setAttribute('transform', `translate(${st.tx},0)`);
  };
  let pan = null;
  board.oncontextmenu = (e) => e.preventDefault();
  board.onwheel = (e) => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const mx = ((e.clientX - rect.left) / rect.width) * vb.width;
    const oldScale = st.scale || 1;
    const nextScale = Math.max(0.5, Math.min(8, oldScale * (e.deltaY < 0 ? 1.12 : 0.88)));
    const worldX = (mx - st.tx) / oldScale;
    st.scale = nextScale;
    st.tx = mx - worldX * nextScale;
    applyTransform(); updateX();
  };
  board.onmousedown = (e) => {
    if (e.button !== 2) return;
    e.preventDefault();
    pan = { x: e.clientX, tx: st.tx };
    board.classList.add('is-panning');
  };
  const onMove = (e) => {
    if (!pan) return;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    st.tx = pan.tx + ((e.clientX - pan.x) / rect.width) * vb.width;
    applyTransform();
  };
  const onUp = () => { pan = null; board.classList.remove('is-panning'); };
  document.addEventListener('mousemove', onMove, { signal: controller.signal });
  document.addEventListener('mouseup', onUp, { signal: controller.signal });
}
