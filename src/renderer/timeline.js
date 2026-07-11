function autoExpand(el){
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

async function renderTimelineView(){
  if(!S.project){
    q('#left-panel-inner').innerHTML=`<div class="empty" style="padding:40px 10px"><div class="ei">${I.timeline}</div><p style="text-align:center">กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    q('#main-inner').innerHTML=`<div class="empty" style="margin-top:80px"><div class="ei">${I.timeline}</div><h3>Timeline</h3><p>กรุณาเลือกโปรเจกต์ก่อน</p></div>`;
    return;
  }
  const tls = await api.timeline.getAll(S.project.id);
  let lh = `<div class="ph"><h4>Timeline</h4><button class="btn btn-g btn-i" onclick="openTimelineModal()">${I.plus}</button></div>`;
  for(const t of tls){
    const col=t.color_code||'#06b6d4', act=S.timeline?.id===t.id;
    lh += `<div class="li ${act?'active':''}" onclick="selectTimeline(${t.id})">
      <div class="dot" style="background:${col}"></div>
      <span class="name">${x(t.line_name||'ไม่มีชื่อ')}</span>
      <div class="acts">
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openTimelineModal(${t.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();delTimeline(${t.id})" style="color:var(--danger)">${I.delete}</button>
      </div>
    </div>`;
  }
  q('#left-panel-inner').innerHTML = lh;
  if(!S.timeline){
    q('#main-inner').innerHTML = tls.length
      ? `<div class="empty" style="margin-top:80px"><div class="ei">${I.timeline}</div><h3>เลือก Timeline จากรายการ</h3></div>`
      : `<div class="empty" style="margin-top:80px"><div class="ei">${I.timeline}</div><h3>ยังไม่มี Timeline</h3><button class="btn btn-p" onclick="openTimelineModal()">${I.plus} สร้าง Timeline</button></div>`;
    return;
  }
  await renderTimelineDetail(S.timeline.id);
}

async function selectTimeline(id){
  const tls = await api.timeline.getAll(S.project.id);
  S.timeline = tls.find(t=>t.id===id)||null;
  await renderTimelineView();
}

// ── Shared graph builder (Chronicler, progress.md Phase 8, reuses this
// exact SVG + bindTimelineGraphInteractions for its own Down-line view) ──
function timelineTsFromParts(d,m,y,hh,min){
  if(!d||!m||!y) return null;
  return Date.UTC(Number(y), Number(m)-1, Number(d), Number(hh||0), Number(min||0), 0, 0);
}

// Month/year tick marks along the axis so gaps read as a true time scale,
// not just proportional dot spacing. Ticks carry data-tick-ts so
// updateTimelineGraphX() (pan/zoom) can reposition them like everything else.
function buildTimelineRulerSvg(minTs, maxTs, xFromTs, LINE_Y){
  if(!(maxTs > minTs)) return '';
  const spanDays = (maxTs-minTs)/86400000;
  const byYear = spanDays > 365*4;
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const start = new Date(minTs);
  let cursor = byYear
    ? Date.UTC(start.getUTCFullYear(), 0, 1)
    : Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1);
  let svg = '';
  let guard = 0;
  while(cursor <= maxTs && guard < 240){
    guard++;
    if(cursor >= minTs){
      const cx = xFromTs(cursor);
      const d = new Date(cursor);
      const label = byYear ? String(d.getUTCFullYear()) : `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      svg += `<line class="tl-ruler-tick" data-tick-ts="${cursor}" x1="${cx}" y1="${LINE_Y-14}" x2="${cx}" y2="${LINE_Y+14}" stroke="var(--border)" stroke-width="1.5" opacity="0.55"/>
        <text class="tl-ruler-label" data-tick-ts="${cursor}" x="${cx}" y="${LINE_Y+30}" text-anchor="middle" font-size="10.5" fill="var(--t3)">${label}</text>`;
    }
    const d = new Date(cursor);
    cursor = byYear ? Date.UTC(d.getUTCFullYear()+1, 0, 1) : Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 1);
  }
  return svg;
}

function buildTimelineGraphHtml(evs, tlid, fallbackColor){
  const col = fallbackColor || '#06b6d4';
  const MARGIN=80, LINE_Y=180, CARD_W=120, SVG_H=400;
  const n=evs.length;
  const hostW=q('#main-inner')?.offsetWidth||900;
  const trackW=Math.max(hostW, 900);
  const usable=trackW-(2*MARGIN);
  const graphState = timelineGraphState[tlid] ||= { scale:1, tx:0, yOffsets:{} };

  const startTs = evs.map(ev=>timelineTsFromParts(ev.s_day,ev.s_month,ev.s_years,ev.s_hour,ev.s_minute));
  const endTs = evs.map(ev=>timelineTsFromParts(ev.e_day,ev.e_month,ev.e_years,ev.e_hour,ev.e_minute));
  const allTs = [];
  for(let i=0;i<n;i++){
    if(startTs[i]!==null) allTs.push(startTs[i]);
    if(endTs[i]!==null) allTs.push(endTs[i]);
  }
  const minTs = allTs.length ? Math.min(...allTs) : 0;
  const maxTs = allTs.length ? Math.max(...allTs) : 1;
  const spanTs = Math.max(1, maxTs-minTs);
  const xFromTs = (ts)=>{
    if(ts===null) return MARGIN;
    const ratio = (ts-minTs)/spanTs;
    return MARGIN + (ratio*usable*graphState.scale);
  };
  const xs=evs.map((_,i)=>xFromTs(startTs[i]));

  let svg = `<svg id="timeline-graph-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="${SVG_H}" viewBox="0 0 ${trackW} ${SVG_H}" data-min-ts="${minTs}" data-span-ts="${spanTs}" data-usable="${usable}" data-margin="${MARGIN}" data-line-y="${LINE_Y}" data-card-w="${CARD_W}" data-tlid="${tlid}">
    <g id="timeline-graph-content" transform="translate(${graphState.tx},0)">
    <line id="timeline-axis-line" x1="${MARGIN}" y1="${LINE_Y}" x2="${MARGIN + usable*graphState.scale}" y2="${LINE_Y}" stroke="var(--border)" stroke-width="8" stroke-linecap="round" opacity="0.75" style="cursor:crosshair"/>
    ${buildTimelineRulerSvg(minTs, maxTs, xFromTs, LINE_Y)}`;
  for(let i=0;i<n;i++){
    const ev=evs[i], ec=ev.color_code||col, xi=xs[i];
    const up=i%2===0, defaultBy=up?(LINE_Y-120):(LINE_Y+120);
    const by=Math.max(36, Math.min(SVG_H-36, graphState.yOffsets[ev.id] ?? defaultBy));
    const cardY=up?(by-68):(by+10);
    const sTxt=fmtDate(ev.s_day,ev.s_month,ev.s_years,ev.s_hour,ev.s_minute);
    const hasEnd=!!(ev.e_day&&ev.e_month&&ev.e_years);
    const eTxt=hasEnd?fmtDate(ev.e_day,ev.e_month,ev.e_years,ev.e_hour,ev.e_minute):'';
    const dateTxt=hasEnd?`${sTxt} - ${eTxt}`:sTxt;
    let rangeSvg = '';
    if(hasEnd){
      let xe = xFromTs(endTs[i]);
      let xStart = xi, xEnd = xe;
      if(xEnd<xStart){ const t=xStart; xStart=xEnd; xEnd=t; }
      const rw=Math.max(2, xEnd-xStart);
      rangeSvg = `<rect data-event-range="${ev.id}" data-start-ts="${startTs[i]||''}" data-end-ts="${endTs[i]||''}" x="${xStart}" y="${LINE_Y-4}" width="${rw}" height="8" rx="4" fill="${ec}" opacity="0.28" style="pointer-events:none"/>`;
    }
    svg += `
      ${rangeSvg}
      <line data-event-stem="${ev.id}" data-start-ts="${startTs[i]||''}" x1="${xi}" y1="${LINE_Y}" x2="${xi}" y2="${by}" stroke="${ec}" stroke-width="2"/>
      <circle data-event-dot="${ev.id}" data-start-ts="${startTs[i]||''}" cx="${xi}" cy="${LINE_Y}" r="6.5" fill="${ec}"/>
      <circle data-event-node="${ev.id}" data-start-ts="${startTs[i]||''}" data-card-up="${up?'1':'0'}" cx="${xi}" cy="${by}" r="11" fill="${ec}" style="cursor:ns-resize"/>
      <foreignObject data-event-card="${ev.id}" data-start-ts="${startTs[i]||''}" x="${xi-(CARD_W/2)}" y="${cardY}" width="${CARD_W}" height="64" style="cursor:pointer" onclick="openEventModal(${tlid},${ev.id})">
        <div xmlns="http://www.w3.org/1999/xhtml" style="background:var(--surface);border:1px solid var(--border);border-left:4px solid ${ec};border-radius:8px;padding:6px 8px;font-size:12px;line-height:1.3;overflow:hidden">
          <div style="font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x(ev.event_name||'ไม่มีชื่อ')}</div>
          <div style="color:var(--t3);font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x(dateTxt)}</div>
        </div>
      </foreignObject>`;
  }
  svg += `</g></svg>`;
  return `<div class="timeline-graph-board" id="timeline-graph-board">${svg}<div id="timeline-axis-tip" class="timeline-axis-tip hidden"></div></div>`;
}

async function renderTimelineDetail(tlid){
  const tl=S.timeline, col=tl.color_code||'#06b6d4';
  const allEvs = await api.timeline.getEvents(tlid);
  const evs = allEvs.slice().sort((a,b)=>{
    const ka=(a.s_years||0)*10000+(a.s_month||0)*100+(a.s_day||0);
    const kb=(b.s_years||0)*10000+(b.s_month||0)*100+(b.s_day||0);
    return ka-kb;
  });

  let h = `<div class="ch">
    <div class="cdot" style="background:${col}"></div><h2>${x(tl.line_name||'ไม่มีชื่อ')}</h2>
    <button class="btn btn-s btn-i" onclick="openTimelineModal(${tl.id})">${I.edit}</button>
    <button class="btn btn-p" onclick="openEventModal(${tlid})" style="padding:6px 12px;font-size:12.5px">${I.plus} เพิ่มเหตุการณ์</button>
  </div>`;

  if(!evs.length){
    h += `<div class="empty"><div class="ei">${I.timeline}</div><h3>ยังไม่มีเหตุการณ์</h3>
      <button class="btn btn-p" onclick="openEventModal(${tlid})">${I.plus} เพิ่มเหตุการณ์</button></div>`;
  } else {
    h += buildTimelineGraphHtml(evs, tlid, col);

    const evtObtl = await api.relation.getOBTL(S.project.id);
    h += `<div style="margin-top:24px">
      <div class="ph"><h4>เหตุการณ์ทั้งหมด</h4><button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openEventModal(${tlid})">${I.plus} เพิ่มเหตุการณ์</button></div>
      <div class="objlist">`;
    for(const ev of evs){
      const ec=ev.color_code||col;
      const sTxt=fmtDate(ev.s_day,ev.s_month,ev.s_years,ev.s_hour,ev.s_minute);
      const hasEnd=!!(ev.e_day&&ev.e_month&&ev.e_years);
      const eTxt=hasEnd?fmtDate(ev.e_day,ev.e_month,ev.e_years,ev.e_hour,ev.e_minute):'';
      const dateTxt=hasEnd?`${sTxt} - ${eTxt}`:sTxt;
      const evRels = evtObtl.filter(r=>r.event_id===ev.id);
      h += `<div class="objrow" onclick="openEventModal(${tlid},${ev.id})">
        <div class="odot" style="background:${ec}"></div>
        <div style="flex:1;min-width:0">
          <div class="oname">${x(ev.event_name||'ไม่มีชื่อ')}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x(dateTxt)}</div>
        </div>
        <div class="acts">
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();openEventModal(${tlid},${ev.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();delEvent(${ev.id},${tlid})" style="color:var(--danger)">${I.delete}</button>
        </div>
      </div>
      <div class="objrow-story">
        <textarea id="ev-story-${ev.id}" class="tl-story" placeholder="เขียนสตอรี่ที่เกิดขึ้นในเหตุการณ์นี้..." onclick="event.stopPropagation()" oninput="autoExpand(this)" onchange="saveEventStory(${ev.id})">${x(ev.story||'')}</textarea>
        <div style="margin-top:8px">
          <div class="tags-head" style="flex-direction:row;justify-content:space-between;align-items:center">
            <span>Object ที่เกี่ยวข้องกับเหตุการณ์นี้</span>
            <button class="btn btn-g btn-i" title="เพิ่มความสัมพันธ์ Object ↔ Event" onclick="event.stopPropagation();openEventRelModal(${tlid},${ev.id})">${I.plus}</button>
          </div>
          <div class="relation-mini-list">${evRels.length ? evRels.map(r=>`<div class="mini-rel-item">
            <span class="mini-rel-dot" style="background:${x(r.color_code||'#8b9')}"></span>
            <span class="mini-rel-kind">Object</span>
            <span class="mini-rel-rel">${x(r.relation_name||'สัมพันธ์')}</span>
            <span class="mini-rel-to">${x(r.from_cat)} / ${x(r.from_name)}</span>
            <button class="btn btn-g btn-i" onclick="event.stopPropagation();delEventRel(${r.id},${tlid})" style="color:var(--danger)">${I.close}</button>
          </div>`).join('') : `<div class="empty" style="padding:8px 0;font-size:12px">ยังไม่มี Relation</div>`}</div>
        </div>
      </div>`;
    }
    h += `</div></div>`;
  }
  q('#main-inner').innerHTML = h;
  document.querySelectorAll('.tl-story').forEach(ta => autoExpand(ta));
  if(evs.length) bindTimelineGraphInteractions(tlid);
}

function applyTimelineGraphTransform(tlid){
  const st = timelineGraphState[tlid];
  const g = q('#timeline-graph-content');
  if(!st || !g) return;
  g.setAttribute('transform', `translate(${st.tx},0)`);
}

function bindTimelineGraphInteractions(tlid){
  if(timelineGraphCleanup) timelineGraphCleanup();
  const board = q('#timeline-graph-board');
  const svg = q('#timeline-graph-svg');
  const tip = q('#timeline-axis-tip');
  const axis = q('#timeline-axis-line');
  if(!board || !svg) return;
  const st = timelineGraphState[tlid] ||= { scale:1, tx:0, yOffsets:{} };
  let pan = null;
  let nodeDrag = null;
  let movedNode = false;
  const controller = new AbortController();
  timelineGraphCleanup = () => controller.abort();

  const svgX = (clientX) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return ((clientX - rect.left) / rect.width) * vb.width;
  };
  const svgY = (clientY) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return ((clientY - rect.top) / rect.height) * vb.height;
  };
  const margin = Number(svg.dataset.margin||80);
  const usable = Number(svg.dataset.usable||1);
  const cardW = Number(svg.dataset.cardW||96);
  const minTs = Number(svg.dataset.minTs||0);
  const spanTs = Number(svg.dataset.spanTs||1);
  const clampTx = () => {
    const width = svg.viewBox.baseVal.width;
    const minTx = Math.min(0, width - margin - (margin + usable) * st.scale);
    st.tx = Math.max(minTx - 80, Math.min(80, st.tx));
  };
  const xFromTs = (ts) => {
    if(ts===null || ts==='') return margin;
    const ratio = (ts - minTs)/spanTs;
    return margin + (ratio*usable*st.scale);
  };
  const updateTimelineGraphX = () => {
    const axisLine = q('#timeline-axis-line');
    if(axisLine) axisLine.setAttribute('x2', String(margin + usable * st.scale));
    svg.querySelectorAll('[data-event-range]').forEach(rect => {
      const s = Number(rect.dataset.startTs||'');
      const e = Number(rect.dataset.endTs||'');
      if(isNaN(s) || isNaN(e)) return;
      let xStart = xFromTs(s);
      let xEnd = xFromTs(e);
      if(xEnd < xStart){ const t = xStart; xStart = xEnd; xEnd = t; }
      rect.setAttribute('x', xStart);
      rect.setAttribute('width', Math.max(2, xEnd - xStart));
    });
    svg.querySelectorAll('[data-event-stem]').forEach(stem => {
      const s = Number(stem.dataset.startTs||'');
      if(isNaN(s)) return;
      const x = xFromTs(s);
      stem.setAttribute('x1', x);
      stem.setAttribute('x2', x);
    });
    svg.querySelectorAll('[data-event-dot]').forEach(dot => {
      const s = Number(dot.dataset.startTs||'');
      if(isNaN(s)) return;
      dot.setAttribute('cx', xFromTs(s));
    });
    svg.querySelectorAll('[data-event-node]').forEach(node => {
      const s = Number(node.dataset.startTs||'');
      if(isNaN(s)) return;
      node.setAttribute('cx', xFromTs(s));
    });
    svg.querySelectorAll('[data-event-card]').forEach(card => {
      const s = Number(card.dataset.startTs||'');
      if(isNaN(s)) return;
      card.setAttribute('x', xFromTs(s) - (cardW / 2));
    });
    svg.querySelectorAll('.tl-ruler-tick').forEach(tick => {
      const s = Number(tick.dataset.tickTs||'');
      if(isNaN(s)) return;
      const tx = xFromTs(s);
      tick.setAttribute('x1', tx);
      tick.setAttribute('x2', tx);
    });
    svg.querySelectorAll('.tl-ruler-label').forEach(label => {
      const s = Number(label.dataset.tickTs||'');
      if(isNaN(s)) return;
      label.setAttribute('x', xFromTs(s));
    });
    svg.querySelectorAll('.tl-cmp-link').forEach(link => {
      const a = Number(link.dataset.aTs||''), b = Number(link.dataset.bTs||'');
      if(isNaN(a) || isNaN(b)) return;
      link.setAttribute('x1', xFromTs(a));
      link.setAttribute('x2', xFromTs(b));
    });
  };

  board.oncontextmenu = (e) => e.preventDefault();
  board.onwheel = (e) => {
    e.preventDefault();
    const mx = svgX(e.clientX);
    const oldScale = st.scale || 1;
    const nextScale = Math.max(0.5, Math.min(8, oldScale * (e.deltaY < 0 ? 1.12 : 0.88)));
    const worldX = (mx - st.tx) / oldScale;
    st.scale = nextScale;
    st.tx = mx - worldX * nextScale;
    clampTx();
    applyTimelineGraphTransform(tlid);
    updateTimelineGraphX();
  };
  board.onmousedown = (e) => {
    if(e.button !== 2) return;
    e.preventDefault();
    pan = { x:e.clientX, tx:st.tx };
    board.classList.add('is-panning');
  };
  document.addEventListener('mousemove', onMove, { signal: controller.signal });
  document.addEventListener('mouseup', onUp, { signal: controller.signal });

  function onMove(e){
    if(pan){
      const rect = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      st.tx = pan.tx + ((e.clientX - pan.x) / rect.width) * vb.width;
      clampTx();
      applyTimelineGraphTransform(tlid);
    }
    if(nodeDrag){
      movedNode = true;
      const y = Math.max(34, Math.min(svg.viewBox.baseVal.height - 34, svgY(e.clientY)));
      const id = nodeDrag.id;
      st.yOffsets[id] = y;
      const node = q(`[data-event-node="${id}"]`);
      const stem = q(`[data-event-stem="${id}"]`);
      const card = q(`[data-event-card="${id}"]`);
      if(node) node.setAttribute('cy', y);
      if(stem) stem.setAttribute('y2', y);
      if(card){
        const up = node?.dataset.cardUp === '1';
        card.setAttribute('y', up ? y - 66 : y + 10);
      }
    }
  }
  function onUp(){
    pan = null;
    nodeDrag = null;
    board.classList.remove('is-panning');
    setTimeout(()=>{ movedNode = false; }, 0);
  }

  svg.querySelectorAll('[data-event-node]').forEach(node => {
    node.addEventListener('mousedown', e => {
      if(e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      nodeDrag = { id: node.dataset.eventNode };
      movedNode = false;
    });
    node.addEventListener('click', e => {
      e.stopPropagation();
      if(movedNode) return;
      openEventModal(tlid, Number(node.dataset.eventNode));
    });
  });
  svg.querySelectorAll('[data-event-card]').forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      openEventModal(tlid, Number(card.dataset.eventCard));
    });
  });

  if(axis && tip){
    axis.addEventListener('mousemove', e => {
      const xWorld = svgX(e.clientX) - st.tx;
      const ratio = Math.max(0, Math.min(1, (xWorld - margin) / (usable * st.scale)));
      tip.textContent = fmtTimelinePoint(minTs + ratio * spanTs);
      tip.style.left = `${e.clientX - board.getBoundingClientRect().left + 10}px`;
      tip.style.top = `${e.clientY - board.getBoundingClientRect().top - 28}px`;
      tip.classList.remove('hidden');
    });
    axis.addEventListener('mouseleave', () => tip.classList.add('hidden'));
  }
}

// ═══ RELATION VIEW ═════════════════════════════════════
const nodeState = {catView:{}, objView:{}, projectView:{}}; 
const wbViewState = {catView:{}, objView:{}, projectView:{}};

// Graph render helpers
