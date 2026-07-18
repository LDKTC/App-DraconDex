'use strict';
// ═══ Timeline "Chronicler" (progress.md Phase 8) ══════════════════════
// A module owns any number of timeline "lines" (generalized `timeline`
// table, module_ref instead of project_id — same shape as Director's
// project-scoped timelines). Down-line reuses timeline.js's existing
// true-time-scale SVG graph + pan/zoom/drag interactions as-is
// (buildTimelineGraphHtml / bindTimelineGraphInteractions are already
// project-agnostic, keyed only by timeline id). One-line and Compare
// Parallel are new, lighter views built the same way but plotted on flat
// axis lines instead of the zigzag layout.

const CHRONICLER_VIEWS = ['oneline', 'downline', 'compare'];
const CHRONICLER_VIEW_LABEL = { oneline: 'Oneline', downline: 'Downline', compare: 'Compare' };

function sortChroniclerEvents(evs) {
  return evs.slice().sort((a, b) => {
    const ka = (a.s_years || 0) * 10000 + (a.s_month || 0) * 100 + (a.s_day || 0);
    const kb = (b.s_years || 0) * 10000 + (b.s_month || 0) * 100 + (b.s_day || 0);
    return ka - kb;
  });
}

async function loadChroniclerData(m) {
  await loadModule('src/renderer/timeline.js');
  const [timelines, ui] = await Promise.all([
    api.timeline.getModuleTimelines(m.id),
    api.module.getUi(m.id),
  ]);
  const prev = (S.chroniclerData && S.chroniclerData.moduleId === m.id) ? S.chroniclerData : null;
  let activeId = prev?.activeId;
  if (!activeId || !timelines.find(t => t.id === activeId)) activeId = timelines[0]?.id || null;
  let compareId = prev?.compareId;
  if (compareId && !timelines.find(t => t.id === compareId)) compareId = null;
  const view = CHRONICLER_VIEWS.includes(ui.view) ? ui.view : 'oneline';
  S.chroniclerData = { moduleId: m.id, timelines, activeId, compareId, view, inspectorEventId: prev?.inspectorEventId ?? null };
}

async function setChroniclerView(view) {
  S.chroniclerData.view = view;
  S.chroniclerData.inspectorEventId = null;
  await api.module.setUi(S.chroniclerData.moduleId, 'view', view);
  if (S.inspectorData?.moduleId === S.chroniclerData.moduleId) S.inspectorData.ui = { ...S.inspectorData.ui, view };
  renderNexusHome();
}

async function selectChroniclerTimeline(moduleId, id) {
  S.chroniclerData.activeId = Number(id) || null;
  S.chroniclerData.inspectorEventId = null;
  renderNexusHome();
}

async function setChroniclerCompare(id) {
  S.chroniclerData.compareId = Number(id) || null;
  S.chroniclerData.inspectorEventId = null;
  await mountChroniclerGraph();
}

function buildChroniclerMainHtml(m) {
  const data = (S.chroniclerData && S.chroniclerData.moduleId === m.id) ? S.chroniclerData : null;
  if (!data) return `<div class="empty" style="margin-top:40px"><div class="ei">${moduleIconHtml(m)}</div><h3>${x(m.name)}</h3></div>`;
  const { timelines, activeId, compareId, view } = data;
  const viewBar = `<div class="viewbar">
    ${CHRONICLER_VIEWS.map(v => `<span class="vitem${v === view ? ' act' : ''}" onclick="setChroniclerView('${v}')">${CHRONICLER_VIEW_LABEL[v]}</span>`).join('')}
  </div>`;
  const lineSelect = timelines.length ? `<select id="chr-line-select" onchange="selectChroniclerTimeline(${m.id},this.value)">
    ${timelines.map(t => `<option value="${t.id}" ${t.id === activeId ? 'selected' : ''}>${x(t.line_name || '—')}</option>`).join('')}
  </select>` : '';
  const toolbar = `<div class="classifier-toolbar">
    ${lineSelect}
    <button class="btn btn-g btn-i" onclick="openChroniclerTimelineModal(${m.id})" title="${t('addTimelineLine')}">${I.plus}</button>
    ${activeId ? `<button class="btn btn-g btn-i" onclick="openChroniclerTimelineModal(${m.id},${activeId})" title="${t('edit')}">${I.edit}</button>` : ''}
    ${activeId ? `<button class="btn btn-p" onclick="openChroniclerEventModal(${activeId})">${I.plus} ${t('addEvent')}</button>` : ''}
    ${viewBar}
  </div>`;

  if (!timelines.length) {
    return `${toolbar}<div class="empty" style="margin-top:30px"><div class="ei">${I.timeline}</div><h3>${t('noTimelineYet')}</h3>
      <button class="btn btn-p" onclick="openChroniclerTimelineModal(${m.id})">${I.plus} ${t('createTimelineLine')}</button></div>`;
  }

  let compareBar = '';
  if (view === 'compare') {
    const opts = timelines.filter(tl => tl.id !== activeId);
    compareBar = `<div class="classifier-toolbar" style="margin-top:8px">
      <span class="vlbl">${t('compareWith')}:</span>
      <select id="chr-compare-select" onchange="setChroniclerCompare(this.value)">
        <option value="">--</option>
        ${opts.map(tl => `<option value="${tl.id}" ${tl.id === compareId ? 'selected' : ''}>${x(tl.line_name || '—')}</option>`).join('')}
      </select>
    </div>`;
  }

  return `${toolbar}${compareBar}
    <div id="chronicler-graph-host"></div>`;
}

// Post-DOM hook (parallels mountLocatorBoard/mountDetailEditor): fetches
// events for whichever timeline(s) the current view needs and renders the
// SVG graph, then binds the shared pan/zoom/drag interactions.
async function mountChroniclerGraph() {
  const data = S.chroniclerData;
  const host = q('#chronicler-graph-host');
  if (!data || !host || !data.activeId) return;
  const activeTl = data.timelines.find(t => t.id === data.activeId);
  const col = activeTl?.color_code || '#06b6d4';
  const evs = sortChroniclerEvents(await api.timeline.getEvents(data.activeId));

  if (data.view === 'compare') {
    if (!data.compareId) {
      host.innerHTML = `<div class="empty" style="margin-top:20px"><div class="ei">${I.timeline}</div><h3>${t('pickCompareTimeline')}</h3></div>`;
      return;
    }
    const compareTl = data.timelines.find(t => t.id === data.compareId);
    const evsB = sortChroniclerEvents(await api.timeline.getEvents(data.compareId));
    const key = `cmp-${data.activeId}-${data.compareId}`;
    host.innerHTML = buildChroniclerCompareHtml(evs, evsB, key, col, compareTl?.color_code || '#f97316');
    bindTimelineGraphInteractions(key);
    return;
  }

  if (!evs.length) {
    host.innerHTML = `<div class="empty" style="margin-top:20px"><div class="ei">${I.timeline}</div><h3>${t('noEventsYet')}</h3>
        <button class="btn btn-p" onclick="openChroniclerEventModal(${data.activeId})">${I.plus} ${t('addEvent')}</button></div>`;
    return;
  }
  if (data.view === 'downline') {
    // Mockup 22: a vertical proportional time line on the left, the event
    // list on the right — no pan/zoom on this view.
    host.innerHTML = await buildChroniclerDownlineHtml(evs, data.activeId, col, data.inspectorEventId);
    if (data.inspectorEventId && evs.some(e => e.id === data.inspectorEventId)) {
      bindChroniclerInspectorColor(`chr-insp-body-${data.inspectorEventId}`, data.inspectorEventId, data.activeId);
    }
    return;
  }
  host.innerHTML = await buildChroniclerOneLineHtml(evs, data.activeId, col, data.inspectorEventId);
  bindTimelineGraphInteractions(data.activeId);
  if (data.inspectorEventId && evs.some(e => e.id === data.inspectorEventId)) {
    bindChroniclerInspectorColor('chr-oneline-insp', data.inspectorEventId, data.activeId);
  }
}

// ═══ Event Inspector (Plan part3 #2/#2.1/#2.2) ═════════════════════════
// A single id on chroniclerData (not a Set) — only one inspector is ever
// open at a time, in either view. That's a hard requirement (#2.2) rather
// than just a UX choice: the shared colorPicker() widget below renders
// singleton ids (#sel-color, #cpicker-grid, …), so more than one instance
// mounted at once would collide.
async function toggleChroniclerInspector(tlid, evId) {
  const data = S.chroniclerData;
  if (!data) return;
  data.inspectorEventId = (data.inspectorEventId === evId) ? null : evId;
  await mountChroniclerGraph();
}

async function buildChroniclerEventInspectorHtml(ev, tlid) {
  return `
    <div class="fg"><label>${t('name')} *</label><input id="chr-insp-n" value="${x(ev.event_name || '')}" onchange="saveChroniclerInspectorField(${ev.id},${tlid})"></div>
    <div class="fg"><label>${t('startDate')} *</label>${dateInputsHTML('chr-insp-s', ev, 's_day', 's_month', 's_years', 's_hour', 's_minute', `saveChroniclerInspectorField(${ev.id},${tlid})`)}</div>
    <div class="fg"><label>${t('endDate')}</label>${dateInputsHTML('chr-insp-e', ev, 'e_day', 'e_month', 'e_years', 'e_hour', 'e_minute', `saveChroniclerInspectorField(${ev.id},${tlid})`)}</div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(ev.color)}</div>
    <div class="fg"><label>${t('story')}</label><textarea id="chr-insp-story" onchange="saveChroniclerInspectorField(${ev.id},${tlid})">${x(ev.story || '')}</textarea></div>`;
}

// colorPicker's swatches/custom-color button set #sel-color via direct
// property assignment (no native change event), so autosave on color picks
// is wired here instead of the onchange delegation the other fields use.
function bindChroniclerInspectorColor(wrapId, evId, tlid) {
  const wrap = q(`#${wrapId}`);
  if (!wrap) return;
  wrap.addEventListener('click', (e) => {
    if (e.target.closest('.cswatch')) { saveChroniclerInspectorField(evId, tlid); return; }
    if (e.target.closest('.cpicker-custom button')) setTimeout(() => saveChroniclerInspectorField(evId, tlid), 150);
  });
}

async function saveChroniclerInspectorField(evId, tlid) {
  try {
    const n = q('#chr-insp-n')?.value.trim();
    if (!n) { toast(t('name'), 'err'); return; }
    const sid = await getDateFromInputs('chr-insp-s');
    if (!sid) { toast(t('startDate'), 'err'); return; }
    const eid = await getDateFromInputs('chr-insp-e');
    const story = q('#chr-insp-story')?.value.trim() || '';
    const colorId = q('#sel-color')?.value || null;
    await api.timeline.updateEvent(evId, n, sid, eid, colorId, story);
    await mountChroniclerGraph();
    toast(t('saved'), 'ok');
  } catch (e) { toast(e.message, 'err'); console.error(e); }
}

async function buildChroniclerDownlineHtml(evs, tlid, col, inspectorEventId) {
  const TOP = 26, W = 340, LINE_X = 40;
  const H = Math.max(360, Math.min(720, evs.length * 96));
  const tsOf = (ev) => timelineTsFromParts(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute);
  const allTs = evs.map(tsOf).filter(ts => ts !== null);
  const minTs = allTs.length ? Math.min(...allTs) : 0;
  const spanTs = Math.max(1, (allTs.length ? Math.max(...allTs) : 1) - minTs);
  const yFromTs = (ts) => ts === null ? TOP : TOP + ((ts - minTs) / spanTs) * (H - 2 * TOP);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <line x1="${LINE_X}" y1="${TOP - 10}" x2="${LINE_X}" y2="${H - TOP + 10}" stroke="var(--border)" stroke-width="2"/>`;
  for (const ev of evs) {
    const ts = tsOf(ev), y = yFromTs(ts), ec = ev.color_code || col;
    const sTxt = fmtDate(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute);
    svg += `<circle cx="${LINE_X}" cy="${y}" r="6" fill="${ec}" style="cursor:pointer" onclick="toggleChroniclerInspector(${tlid},${ev.id})"/>
      <text x="${LINE_X + 20}" y="${y - 1}" fill="var(--t1)" font-size="12.5">${x(ev.event_name || '—')}</text>
      <text x="${LINE_X + 20}" y="${y + 14}" fill="var(--t3)" font-size="10.5">${x(sTxt)}</text>`;
  }
  svg += `</svg>`;
  return `<div class="chr-downline">
    <div class="chr-downline-graph">${svg}<div class="chr-downline-note" data-no-i18n>${t('trueTimeScaleNote')}</div></div>
    <div class="chr-downline-list">${await buildChroniclerEventListHtml(evs, tlid, col, inspectorEventId)}</div>
  </div>`;
}

async function buildChroniclerOneLineHtml(evs, tlid, col, inspectorEventId) {
  const MARGIN = 80, LINE_Y = 90, SVG_H = 180;
  const hostW = q('#main-inner')?.offsetWidth || 900;
  const trackW = Math.max(hostW, 900);
  const usable = trackW - (2 * MARGIN);
  const graphState = timelineGraphState[tlid] ||= { scale: 1, tx: 0, yOffsets: {} };
  const startTs = evs.map(ev => timelineTsFromParts(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute));
  const allTs = startTs.filter(ts => ts !== null);
  const minTs = allTs.length ? Math.min(...allTs) : 0;
  const maxTs = allTs.length ? Math.max(...allTs) : 1;
  const spanTs = Math.max(1, maxTs - minTs);
  const xFromTs = (ts) => ts === null ? MARGIN : MARGIN + ((ts - minTs) / spanTs) * usable * graphState.scale;

  let svg = `<svg id="timeline-graph-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="${SVG_H}" viewBox="0 0 ${trackW} ${SVG_H}" data-min-ts="${minTs}" data-span-ts="${spanTs}" data-usable="${usable}" data-margin="${MARGIN}" data-line-y="${LINE_Y}" data-card-w="0" data-tlid="${tlid}">
    <g id="timeline-graph-content" transform="translate(${graphState.tx},0)">
    <line id="timeline-axis-line" x1="${MARGIN}" y1="${LINE_Y}" x2="${MARGIN + usable * graphState.scale}" y2="${LINE_Y}" stroke="var(--border)" stroke-width="8" stroke-linecap="round" opacity="0.75" style="cursor:crosshair"/>
    ${buildTimelineRulerSvg(minTs, maxTs, xFromTs, LINE_Y)}`;
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i], ec = ev.color_code || col, xi = xFromTs(startTs[i]);
    const sTxt = fmtDate(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute);
    // Mockup 04: event name + date alternate above/below the axis with a
    // short connector tick, instead of tooltip-only dots.
    const above = i % 2 === 0;
    const tickY1 = above ? LINE_Y - 10 : LINE_Y + 10;
    const tickY2 = above ? LINE_Y - 26 : LINE_Y + 26;
    const nameY = above ? LINE_Y - 42 : LINE_Y + 42;
    const dateY = above ? LINE_Y - 30 : LINE_Y + 56;
    // data-event-tick/-label/-date carry the same start-ts key as the dot so
    // updateTimelineGraphX() (pan/zoom) repositions the whole cluster together
    // — without these, only the dot moved on zoom and the name/date/tick
    // connector were left behind at their original x (Plan part3 #1).
    svg += `<line data-event-tick="${ev.id}" data-start-ts="${startTs[i] || ''}" x1="${xi}" y1="${tickY1}" x2="${xi}" y2="${tickY2}" stroke="var(--border)" stroke-width="1"/>
      <text data-event-label="${ev.id}" data-start-ts="${startTs[i] || ''}" x="${xi}" y="${nameY}" text-anchor="middle" fill="var(--t1)" font-size="12">${x(ev.event_name || '—')}</text>
      <text data-event-date="${ev.id}" data-start-ts="${startTs[i] || ''}" x="${xi}" y="${dateY}" text-anchor="middle" fill="var(--t3)" font-size="10">${x(sTxt)}</text>
      <circle data-event-dot="${ev.id}" data-start-ts="${startTs[i] || ''}" cx="${xi}" cy="${LINE_Y}" r="7" fill="${ec}" style="cursor:pointer" onclick="toggleChroniclerInspector(${tlid},${ev.id})"><title>${x(ev.event_name || '')} — ${x(sTxt)}</title></circle>`;
  }
  svg += `</g></svg>`;

  // Plan part3 #2: clicking a node selects it and shows an editable
  // inspector below the graph instead of only opening the full modal.
  let inspHtml = '';
  const selEv = inspectorEventId ? evs.find(e => e.id === inspectorEventId) : null;
  if (selEv) {
    inspHtml = `<div class="chr-insp-row open" style="margin-top:14px">
      <div class="ph"><h4>${x(selEv.event_name || t('name'))}</h4>
        <button class="btn btn-g btn-i" onclick="toggleChroniclerInspector(${tlid},${selEv.id})" title="${t('close')}">${I.close}</button>
      </div>
      <div class="chr-insp-body" id="chr-oneline-insp">${await buildChroniclerEventInspectorHtml(selEv, tlid)}</div>
    </div>`;
  }
  return `<div class="timeline-graph-board" id="timeline-graph-board" style="height:${SVG_H}px">${svg}<div id="timeline-axis-tip" class="timeline-axis-tip hidden"></div></div>${inspHtml}`;
}

// Dashed connectors join events that share the exact same start date
// (same timeline_date row id, from api.timeline.getOrCreateDate's dedupe) —
// the natural definition of "the same moment" across two lines.
function buildChroniclerCompareHtml(evsA, evsB, key, colA, colB) {
  const MARGIN = 80, LINE_Y_A = 90, LINE_Y_B = 260, SVG_H = 340;
  const hostW = q('#main-inner')?.offsetWidth || 900;
  const trackW = Math.max(hostW, 900);
  const usable = trackW - (2 * MARGIN);
  const graphState = timelineGraphState[key] ||= { scale: 1, tx: 0, yOffsets: {} };
  const tsOf = (ev) => timelineTsFromParts(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute);
  const allTs = [...evsA, ...evsB].map(tsOf).filter(ts => ts !== null);
  const minTs = allTs.length ? Math.min(...allTs) : 0;
  const maxTs = allTs.length ? Math.max(...allTs) : 1;
  const spanTs = Math.max(1, maxTs - minTs);
  const xFromTs = (ts) => ts === null ? MARGIN : MARGIN + ((ts - minTs) / spanTs) * usable * graphState.scale;

  let svg = `<svg id="timeline-graph-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="${SVG_H}" viewBox="0 0 ${trackW} ${SVG_H}" data-min-ts="${minTs}" data-span-ts="${spanTs}" data-usable="${usable}" data-margin="${MARGIN}" data-line-y="${LINE_Y_A}" data-card-w="0" data-tlid="${key}">
    <g id="timeline-graph-content" transform="translate(${graphState.tx},0)">
    <line id="timeline-axis-line" x1="${MARGIN}" y1="${LINE_Y_A}" x2="${MARGIN + usable * graphState.scale}" y2="${LINE_Y_A}" stroke="var(--border)" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
    <line x1="${MARGIN}" y1="${LINE_Y_B}" x2="${MARGIN + usable * graphState.scale}" y2="${LINE_Y_B}" stroke="var(--border)" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
    ${buildTimelineRulerSvg(minTs, maxTs, xFromTs, (LINE_Y_A + LINE_Y_B) / 2)}`;

  for (const evA of evsA) {
    const evB = evsB.find(e => e.start_at === evA.start_at);
    if (!evB) continue;
    const aTs = tsOf(evA), bTs = tsOf(evB);
    svg += `<line class="tl-cmp-link" data-a-ts="${aTs}" data-b-ts="${bTs}" x1="${xFromTs(aTs)}" y1="${LINE_Y_A}" x2="${xFromTs(bTs)}" y2="${LINE_Y_B}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5,4" opacity="0.85"/>`;
  }
  for (const ev of evsA) {
    const ts = tsOf(ev), ec = ev.color_code || colA, sTxt = fmtDate(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute);
    svg += `<circle data-event-dot="${ev.id}" data-start-ts="${ts || ''}" cx="${xFromTs(ts)}" cy="${LINE_Y_A}" r="7" fill="${ec}" style="cursor:pointer" onclick="openChroniclerEventModal(${ev.timeline_id},${ev.id})"><title>${x(ev.event_name || '')} — ${x(sTxt)}</title></circle>`;
  }
  for (const ev of evsB) {
    const ts = tsOf(ev), ec = ev.color_code || colB, sTxt = fmtDate(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute);
    svg += `<circle data-event-dot="${ev.id}" data-start-ts="${ts || ''}" cx="${xFromTs(ts)}" cy="${LINE_Y_B}" r="7" fill="${ec}" style="cursor:pointer" onclick="openChroniclerEventModal(${ev.timeline_id},${ev.id})"><title>${x(ev.event_name || '')} — ${x(sTxt)}</title></circle>`;
  }
  svg += `</g></svg>`;
  return `<div class="timeline-graph-board" id="timeline-graph-board" style="height:${SVG_H}px">${svg}<div id="timeline-axis-tip" class="timeline-axis-tip hidden"></div></div>`;
}

// Plan part3 #2.1/#2.2: each row expands into an inline, autosaving
// inspector instead of jumping to the modal — and since inspectorEventId is
// a single value (not a Set), opening one row's dropdown always collapses
// whichever other row was open.
async function buildChroniclerEventListHtml(evs, tlid, col, inspectorEventId) {
  if (!evs.length) return '';
  let html = `<div class="ph"><h4>${t('name')}</h4><button class="btn btn-p" style="padding:6px 12px;font-size:12.5px" onclick="openChroniclerEventModal(${tlid})">${I.plus} ${t('addEvent')}</button></div><div class="objlist">`;
  for (const ev of evs) {
    const ec = ev.color_code || col;
    const sTxt = fmtDate(ev.s_day, ev.s_month, ev.s_years, ev.s_hour, ev.s_minute);
    const hasEnd = !!(ev.e_day && ev.e_month && ev.e_years);
    const dateTxt = hasEnd ? `${sTxt} - ${fmtDate(ev.e_day, ev.e_month, ev.e_years, ev.e_hour, ev.e_minute)}` : sTxt;
    const open = inspectorEventId === ev.id;
    html += `<div class="chr-insp-row${open ? ' open' : ''}">
      <div class="objrow" onclick="toggleChroniclerInspector(${tlid},${ev.id})">
        <div class="odot" style="background:${ec}"></div>
        <div style="flex:1;min-width:0">
          <div class="oname">${x(ev.event_name || '—')}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px">${x(dateTxt)}</div>
        </div>
        <svg class="icon tree-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="${open ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"/></svg>
        <div class="acts">
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();deleteChroniclerEvent(${ev.id},${tlid})" style="color:var(--danger)">${I.delete}</button>
        </div>
      </div>
      ${open ? `<div class="chr-insp-body" id="chr-insp-body-${ev.id}">${await buildChroniclerEventInspectorHtml(ev, tlid)}</div>` : ''}
    </div>`;
  }
  html += `</div>`;
  return html;
}

// ═══ Timeline line CRUD ════════════════════════════════════════════════
async function openChroniclerTimelineModal(moduleId, id = null) {
  const tl = id ? S.chroniclerData.timelines.find(t => t.id === id) : null;
  openModal(tl ? t('chroniclerLineEdit') : t('chroniclerLineNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="chr-tl-name" value="${x(tl?.line_name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(tl?.color)}</div>
    <div class="mfoot">${tl ? `<button class="btn btn-d" onclick="deleteChroniclerTimeline(${moduleId},${id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitChroniclerTimelineForm(${moduleId},${tl ? id : 'null'})">${tl ? t('save') : t('create')}</button></div>`);
  setTimeout(() => q('#chr-tl-name').focus(), 60);
}

async function submitChroniclerTimelineForm(moduleId, id) {
  const name = q('#chr-tl-name').value.trim();
  if (!name) return;
  const colorId = q('#sel-color').value || null;
  if (id) {
    await api.timeline.update(id, name, colorId);
  } else {
    const r = await api.timeline.createModuleTimeline(moduleId, name, colorId);
    S.chroniclerData.activeId = r.lastInsertRowid;
  }
  closeModal();
  const m = findModuleNode(moduleId);
  await loadChroniclerData(m);
  renderNexusHome();
  toast(id ? t('saved') : t('created'), 'ok');
}

async function deleteChroniclerTimeline(moduleId, id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.timeline.delete(id);
  closeModal();
  const m = findModuleNode(moduleId);
  if (S.chroniclerData.activeId === id) S.chroniclerData.activeId = null;
  await loadChroniclerData(m);
  renderNexusHome();
  toast(t('deleted'), 'ok');
}

// ═══ Event CRUD (module-scoped: no Director relation/hashtag coupling —
// those systems are project-scoped, see progress.md Section C item 8 for
// the same reasoning applied to Classifier) ═════════════════════════════
async function openChroniclerEventModal(tlid, evId = null) {
  let ev = null;
  if (evId) { const evs = await api.timeline.getEvents(tlid); ev = evs.find(e => e.id === evId); }
  openModal(ev ? t('chroniclerEventEdit') : t('chroniclerEventNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="chr-ev-n" value="${x(ev?.event_name || '')}"></div>
    <div class="fg"><label>${t('startDate')} *</label>${dateInputsHTML('chr-ev-s', ev, 's_day', 's_month', 's_years', 's_hour', 's_minute')}</div>
    <div class="fg"><label>${t('endDate')}</label>${dateInputsHTML('chr-ev-e', ev, 'e_day', 'e_month', 'e_years', 'e_hour', 'e_minute')}</div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(ev?.color)}</div>
    <div class="fg"><label>${t('story')}</label><textarea id="chr-ev-story">${x(ev?.story || '')}</textarea></div>
    <div class="mfoot">${ev ? `<button class="btn btn-d" onclick="deleteChroniclerEvent(${evId},${tlid})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="${ev ? `saveChroniclerEvent(${evId},${tlid})` : `createChroniclerEvent(${tlid})`}">${ev ? t('save') : t('create')}</button></div>`);
  setTimeout(() => q('#chr-ev-n').focus(), 60);
}

async function createChroniclerEvent(tlid) {
  try {
    const n = q('#chr-ev-n').value.trim();
    if (!n) { toast(t('name'), 'err'); return; }
    const sid = await getDateFromInputs('chr-ev-s');
    if (!sid) { toast(t('startDate'), 'err'); return; }
    const eid = await getDateFromInputs('chr-ev-e');
    const story = q('#chr-ev-story')?.value.trim() || '';
    await api.timeline.createEvent(tlid, n, sid, eid, q('#sel-color').value || null, story);
    closeModal();
    await mountChroniclerGraph();
    toast(t('created'), 'ok');
  } catch (e) { toast(e.message, 'err'); console.error(e); }
}

async function saveChroniclerEvent(evId, tlid) {
  try {
    const n = q('#chr-ev-n').value.trim();
    if (!n) { toast(t('name'), 'err'); return; }
    const sid = await getDateFromInputs('chr-ev-s');
    if (!sid) { toast(t('startDate'), 'err'); return; }
    const eid = await getDateFromInputs('chr-ev-e');
    const story = q('#chr-ev-story')?.value.trim() || '';
    await api.timeline.updateEvent(evId, n, sid, eid, q('#sel-color').value || null, story);
    closeModal();
    await mountChroniclerGraph();
    toast(t('saved'), 'ok');
  } catch (e) { toast(e.message, 'err'); console.error(e); }
}

async function deleteChroniclerEvent(evId, tlid) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.timeline.deleteEvent(evId);
  if (S.chroniclerData?.inspectorEventId === evId) S.chroniclerData.inspectorEventId = null;
  closeModal();
  await mountChroniclerGraph();
  toast(t('deleted'), 'ok');
}
