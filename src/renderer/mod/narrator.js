'use strict';
// ═══ Story "Narrator" (progress.md Phase 10) ══════════════════════════
// Route board (mockup docs/mockups/11-narrator.png): Dialogue node cards
// on a pannable/zoomable grid board, directed edges with arrowheads and
// optional labels, and an embedded conversation editor for the selected
// node. Interaction patterns (pointer-capture node drag, right-drag pan,
// click-to-connect edges, center-to-center SVG edges) mirror the legacy
// Hero story graph (src/renderer/hero.js renderHeroStory et al.); data
// lives in the module-scoped story_* tables (src/db/narrator.js).

const NARRATOR_VIEWS = ['board', 'routes', 'reader', 'dialogue'];
const NARRATOR_VIEW_LABEL = { board: 'Board', routes: 'Routes', reader: 'Reader', dialogue: 'Dialogue' };
const narratorZoom = {}; // moduleId -> scale (board zoom persists per module per session)
const narratorPan = {}; // moduleId -> {x,y} (Plan part5 #1 — pan is a translate now, not scrollLeft/scrollTop)
const NARRATOR_LINK_TYPES = ['note', 'object', 'character', 'chapter', 'project', 'module', 'chat'];

async function loadNarratorData(m) {
  const [dialogues, edges, ui] = await Promise.all([
    api.narrator.getDialogues(m.id),
    api.narrator.getEdges(m.id),
    api.module.getUi(m.id),
  ]);
  const prev = (S.narratorData && S.narratorData.moduleId === m.id) ? S.narratorData : null;
  let selectedId = prev?.selectedId || null;
  if (selectedId && !dialogues.find(d => d.id === selectedId)) selectedId = null;
  const talks = selectedId ? await api.narrator.getTalks(selectedId) : [];
  const view = NARRATOR_VIEWS.includes(ui.activeView) ? ui.activeView : 'board';
  S.narratorData = { moduleId: m.id, dialogues, edges, talks, selectedId, edgeFrom: prev?.edgeFrom || null, view };
}

async function setNarratorView(view) {
  const d = S.narratorData;
  d.view = view;
  await api.module.setUi(d.moduleId, 'activeView', view);
  if (S.inspectorData?.moduleId === d.moduleId) S.inspectorData.ui = { ...S.inspectorData.ui, activeView: view };
  renderNexusHome();
}

function buildNarratorMainHtml(m) {
  const d = (S.narratorData && S.narratorData.moduleId === m.id) ? S.narratorData : null;
  if (!d) return `<div class="empty" style="margin-top:40px"><div class="ei">${moduleIconHtml(m)}</div><h3>${x(m.name)}</h3></div>`;
  const viewBar = `<div class="viewbar">
    ${NARRATOR_VIEWS.map(v => `<span class="vitem${v === d.view ? ' act' : ''}" onclick="setNarratorView('${v}')">${NARRATOR_VIEW_LABEL[v]}</span>`).join('')}
  </div>`;
  const toolbar = `<div class="classifier-toolbar">
    <button class="btn btn-p" onclick="openNarratorDialogueModal(${m.id})">${I.plus} ${t('addDialogue')}</button>
    ${viewBar}
  </div>`;
  if (!d.dialogues.length) {
    return `${toolbar}<div class="empty" style="margin-top:30px"><div class="ei">${moduleIconHtml(m)}</div>
      <h3>${x(m.name)}</h3><p>${t('nestEmpty')}</p></div>`;
  }
  if (d.view === 'routes') return `${toolbar}${buildNarratorRoutesHtml(d)}`;
  if (d.view === 'reader') return `${toolbar}${buildNarratorReaderHtml(d)}`;
  if (d.view === 'dialogue') return `${toolbar}${buildNarratorDialogueListHtml(d)}`;
  return `${toolbar}${buildNarratorBoardHtml(m, d)}`;
}

// ── Dialogue list view (Plan part5 #4) ──────────────────────────────────
// One dropdown open at a time (single id, not a Set) — same precedent as
// Chronicler's inspectorEventId.
function buildNarratorDialogueListHtml(d) {
  let html = `<div class="objlist">`;
  for (const dl of d.dialogues) {
    const open = d.openDialogueId === dl.id;
    html += `<div class="chr-insp-row${open ? ' open' : ''}">
      <div class="objrow" onclick="toggleNarratorDialogueOpen(${dl.id})">
        <div class="odot" style="background:${x(dl.color_code || '#6366f1')}"></div>
        <div style="flex:1;min-width:0">
          <div class="oname">${x(dl.name)}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px" data-no-i18n>${dl.speaker_count || 0} ${t('speaker')} · ${dl.talk_count || 0} ${t('conversation')}</div>
        </div>
        <svg class="icon tree-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="${open ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"/></svg>
      </div>
      ${open ? `<div class="chr-insp-body">
        <div class="fg"><label>${t('description')}</label><textarea onchange="saveNarratorDialogueDescription(${dl.id},this)">${x(dl.description || '')}</textarea></div>
      </div>` : ''}
    </div>`;
  }
  return html + `</div>`;
}

function toggleNarratorDialogueOpen(id) {
  const d = S.narratorData;
  d.openDialogueId = d.openDialogueId === id ? null : id;
  renderNexusHome();
}

async function saveNarratorDialogueDescription(id, el) {
  const d = S.narratorData;
  const dl = d.dialogues.find(dd => dd.id === id);
  if (!dl) return;
  const description = el.value.trim();
  if (description === (dl.description || '')) return;
  await api.narrator.updateDialogueDescription(id, description);
  dl.description = description;
  toast(t('saved'), 'ok');
}

// ── Board view ──────────────────────────────────────────────────────────
function buildNarratorBoardHtml(m, d) {
  const scale = narratorZoom[m.id] || 1;
  const pan = narratorPan[m.id] || { x: 0, y: 0 };
  // Branch count = dialogues with more than one outgoing edge (mockup 11's
  // czoom shows "Route: N ทางแยก").
  const outDeg = new Map();
  for (const e of d.edges) outDeg.set(e.from_ref, (outDeg.get(e.from_ref) || 0) + 1);
  const branches = [...outDeg.values()].filter(n => n > 1).length;
  let nodes = '';
  for (const dl of d.dialogues) {
    const col = dl.color_code || '#6366f1';
    const sel = d.selectedId === dl.id;
    const from = d.edgeFrom === dl.id;
    nodes += `<div class="nar-node${sel ? ' sel' : ''}${from ? ' edge-from' : ''}" data-dial="${dl.id}" style="left:${dl.pos_x || 20}px;top:${dl.pos_y || 20}px;border-color:${x(col)}">
      <div class="nar-node-head">
        <span class="nn-name" style="color:${x(col)}">${x(dl.name)}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();startNarratorEdge(${dl.id})" title="${t('edgeTool')}">${I.relation}</button>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openNarratorDialogueModal(${m.id},${dl.id})" title="${t('edit')}">${I.edit}</button>
      </div>
      ${dl.snippet ? `<div class="nn-snippet">${x(dl.snippet)}</div>` : `<div class="nn-snippet ghost">${t('conversation')} · 0</div>`}
      ${dl.talk_count ? `<div class="nn-count">${dl.talk_count} ${t('conversation')}</div>` : ''}
      ${dl.description ? `<div class="nn-desc">${x(dl.description)}</div>` : ''}
    </div>`;
  }
  const board = `
  <div id="nar-graph-wrap" class="nar-board">
    <div id="nar-graph" style="transform:translate(${pan.x}px,${pan.y}px) scale(${scale})">
      <svg id="nar-edges" width="2400" height="1600">
        <defs><marker id="nar-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--t3)"/>
        </marker></defs>
      </svg>
      ${nodes}
    </div>
    <div id="nar-notice" class="nar-notice"></div>
    <div class="chint">${t('narratorPanHint')}</div>
    <div class="czoom">
      <span class="zbtn" onclick="zoomNarrator(-1)">−</span>
      <span class="zlvl" id="nar-zoom-lvl">${Math.round(scale * 100)}%</span>
      <span class="zbtn" onclick="zoomNarrator(1)">+</span>
      <span class="zsep"></span>
      <span data-no-i18n>Route: ${branches}</span>
    </div>
  </div>`;
  const conv = d.selectedId ? buildNarratorConvHtml(d) : '';
  return `<div class="nar-layout">${board}${conv}</div>`;
}

function drawNarratorEdges() {
  const svg = q('#nar-edges');
  const graph = q('#nar-graph');
  const d = S.narratorData;
  if (!svg || !graph || !d) return;
  const defs = svg.querySelector('defs').outerHTML;
  let body = '';
  for (const e of d.edges) {
    const fn = graph.querySelector(`[data-dial="${e.from_ref}"]`);
    const tn = graph.querySelector(`[data-dial="${e.to_ref}"]`);
    if (!fn || !tn) continue;
    const x1 = fn.offsetLeft + fn.offsetWidth / 2, y1 = fn.offsetTop + fn.offsetHeight / 2;
    const x2 = tn.offsetLeft + tn.offsetWidth / 2, y2 = tn.offsetTop + tn.offsetHeight / 2;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    body += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--t3)" stroke-width="1.6" marker-end="url(#nar-arrow)"/>
      <g style="pointer-events:auto;cursor:pointer" onclick="openNarratorEdgeModal(${e.id})">
        ${e.label
          ? `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="var(--t2)" paint-order="stroke" stroke="var(--bg)" stroke-width="5">${x(e.label)}</text>`
          : `<circle cx="${mx}" cy="${my}" r="7" fill="var(--surface)" stroke="var(--t3)" stroke-width="1.3"/>
             <text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="var(--t3)">·</text>`}
      </g>`;
  }
  svg.innerHTML = defs + body;
}

// Post-DOM hook, registered in renderNexusHome beside the other kinds.
function mountNarratorBoard() {
  const d = S.narratorData;
  if (!d || S.activeModuleNode?.id !== d.moduleId || d.view !== 'board') return;
  drawNarratorEdges();
  initNarratorPan();
  initNarratorNodes();
}

// Right-drag pans #nar-graph itself via translate (Plan part5 #1) — the
// wrap (.nar-board) never scrolls anymore, so .chint/.czoom/.nar-notice
// (siblings of #nar-graph, outside its transform) stay fixed through both
// pan and zoom, the same way Locator's Konva stage pans/zooms internally
// without ever scrolling its own wrapper.
function narratorTransform(moduleId) {
  const scale = narratorZoom[moduleId] || 1;
  const pan = narratorPan[moduleId] || { x: 0, y: 0 };
  return `translate(${pan.x}px,${pan.y}px) scale(${scale})`;
}

function initNarratorPan() {
  const wrap = q('#nar-graph-wrap');
  const graph = q('#nar-graph');
  const d = S.narratorData;
  if (!wrap || !graph || !d) return;
  wrap.addEventListener('contextmenu', (e) => e.preventDefault());
  let panning = false, sx = 0, sy = 0, s0 = { x: 0, y: 0 };
  wrap.addEventListener('mousedown', (e) => {
    if (e.button !== 2) return;
    panning = true;
    sx = e.clientX; sy = e.clientY;
    s0 = narratorPan[d.moduleId] || { x: 0, y: 0 };
    wrap.classList.add('is-panning');
  });
  window.addEventListener('mousemove', (e) => {
    if (!panning) return;
    narratorPan[d.moduleId] = { x: s0.x + (e.clientX - sx), y: s0.y + (e.clientY - sy) };
    graph.style.transform = narratorTransform(d.moduleId);
  });
  window.addEventListener('mouseup', () => { panning = false; wrap.classList.remove('is-panning'); });
  wrap.addEventListener('wheel', (e) => { if (e.ctrlKey) { e.preventDefault(); zoomNarrator(e.deltaY < 0 ? 1 : -1); } }, { passive: false });
}

function zoomNarrator(dir) {
  const d = S.narratorData;
  if (!d) return;
  const cur = narratorZoom[d.moduleId] || 1;
  const next = Math.max(0.4, Math.min(2.5, cur * (dir > 0 ? 1.15 : 1 / 1.15)));
  narratorZoom[d.moduleId] = next;
  const graph = q('#nar-graph');
  if (graph) graph.style.transform = narratorTransform(d.moduleId);
  const lvl = q('#nar-zoom-lvl');
  if (lvl) lvl.textContent = `${Math.round(next * 100)}%`;
}

function initNarratorNodes() {
  const graph = q('#nar-graph');
  const d = S.narratorData;
  if (!graph || !d) return;
  graph.querySelectorAll('.nar-node').forEach(node => {
    const id = Number(node.dataset.dial);
    let dragMoved = false;
    node.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('button') || ev.button !== 0) return;
      const scale = narratorZoom[d.moduleId] || 1;
      const startX = ev.clientX, startY = ev.clientY;
      const origL = node.offsetLeft, origT = node.offsetTop;
      dragMoved = false;
      try { node.setPointerCapture(ev.pointerId); } catch (_) {}
      node.style.cursor = 'grabbing';
      const onMove = (e) => {
        const dx = (e.clientX - startX) / scale, dy = (e.clientY - startY) / scale;
        if (!dragMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        dragMoved = true;
        node.style.left = Math.max(0, origL + dx) + 'px';
        node.style.top = Math.max(0, origT + dy) + 'px';
        drawNarratorEdges();
      };
      const onUp = async () => {
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerup', onUp);
        node.style.cursor = 'grab';
        if (dragMoved) {
          await api.narrator.updateDialoguePos(id, node.offsetLeft, node.offsetTop);
          const dl = d.dialogues.find(dd => dd.id === id);
          if (dl) { dl.pos_x = node.offsetLeft; dl.pos_y = node.offsetTop; }
        }
      };
      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerup', onUp);
    });
    // Click = complete a pending edge, or select the node (opens its
    // conversation editor beside the board). A drag vetoes the click.
    node.addEventListener('click', async (ev) => {
      if (ev.target.closest('button') || dragMoved) return;
      if (d.edgeFrom && d.edgeFrom !== id) {
        await api.narrator.createEdge(d.moduleId, d.edgeFrom, id, null);
        d.edgeFrom = null;
        hideNarratorNotice();
        await openModuleNode(d.moduleId);
      } else {
        d.selectedId = d.selectedId === id ? null : id;
        d.edgeFrom = null;
        hideNarratorNotice();
        await openModuleNode(d.moduleId);
      }
    });
  });
}

let _narNoticeTimer = null;
function showNarratorNotice(msg) {
  const el = q('#nar-notice');
  if (!el) return;
  el.textContent = tr(msg);
  el.classList.add('show');
  clearTimeout(_narNoticeTimer);
  _narNoticeTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function hideNarratorNotice() {
  const el = q('#nar-notice');
  if (el) el.classList.remove('show');
  clearTimeout(_narNoticeTimer);
}

function startNarratorEdge(dialId) {
  const d = S.narratorData;
  d.edgeFrom = dialId;
  showNarratorNotice(t('narratorPickTarget'));
  document.querySelectorAll('.nar-node').forEach(n =>
    n.classList.toggle('edge-from', Number(n.dataset.dial) === dialId));
}

// ── Conversation editor (right of the board) ────────────────────────────
function buildNarratorConvHtml(d) {
  const dl = d.dialogues.find(dd => dd.id === d.selectedId);
  if (!dl) return '';
  const col = dl.color_code || '#6366f1';
  const rows = d.talks.map(tk => `
    <div class="nar-talk">
      <input class="nt-speaker" value="${x(tk.speaker || '')}" placeholder="${t('speaker')}"
        onblur="saveNarratorTalk(${tk.id},this,'speaker')">
      <input class="nt-text" value="${x(tk.talk_sentence || '')}" placeholder="…"
        onblur="saveNarratorTalk(${tk.id},this,'text')">
      <button class="btn btn-g btn-i${tk.linker_key ? ' act' : ''}" onclick="openNarratorTalkLinkModal(${tk.id})" title="${t('moduleLink')}">${I.relation}</button>
      <button class="btn btn-g btn-i" onclick="deleteNarratorTalk(${tk.id})" title="${t('delete')}">${I.delete}</button>
    </div>`).join('');
  return `<div class="nar-conv">
    <div class="ph"><h4 style="border-left:3px solid ${x(col)};padding-left:8px">${x(dl.name)} · ${t('conversation')}</h4>
      <button class="btn btn-g btn-i" onclick="openNarratorLinkFilterModal(${d.moduleId})" title="${t('narratorLinkFilter')}">${I.edit}</button>
    </div>
    <div class="nar-talks">${rows || `<div class="empty" style="padding:14px"><p>${t('nestEmpty')}</p></div>`}</div>
    <div class="nar-talk nar-talk-new">
      <input id="nt-new-speaker" class="nt-speaker" placeholder="${t('speaker')}">
      <input id="nt-new-text" class="nt-text" placeholder="…" onkeydown="if(event.key==='Enter')addNarratorTalk()">
      <button class="btn btn-p btn-i" onclick="addNarratorTalk()" title="${t('addTalk')}">${I.plus}</button>
    </div>
  </div>`;
}

async function saveNarratorTalk(id, el, field) {
  const d = S.narratorData;
  const tk = d.talks.find(t2 => t2.id === id);
  if (!tk) return;
  const speaker = field === 'speaker' ? el.value.trim() : (tk.speaker || '');
  const text = field === 'text' ? el.value : (tk.talk_sentence || '');
  if (speaker === (tk.speaker || '') && text === (tk.talk_sentence || '')) return;
  await api.narrator.updateTalk(id, speaker, text, tk.linker_key || null);
  tk.speaker = speaker; tk.talk_sentence = text;
}

async function addNarratorTalk() {
  const d = S.narratorData;
  if (!d?.selectedId) return;
  const speaker = q('#nt-new-speaker')?.value.trim() || '';
  const text = q('#nt-new-text')?.value.trim() || '';
  if (!text) return;
  await api.narrator.createTalk(d.selectedId, speaker, text);
  await openModuleNode(d.moduleId);
}

// Plan part5 Narrator #2: per-talk-line link to any vault entity, filtered
// by an allowlist of quickIndex types saved on the module itself
// (module_ui.narratorLinkFilter) — same JSON-blob convention Chronicler's
// calendarConfig already uses.
async function narratorLinkFilterTypes(moduleId) {
  const ui = await api.module.getUi(moduleId);
  try {
    const arr = ui.narratorLinkFilter ? JSON.parse(ui.narratorLinkFilter) : null;
    return Array.isArray(arr) && arr.length ? arr : null;
  } catch (_) { return null; }
}

async function openNarratorTalkLinkModal(talkId) {
  const d = S.narratorData;
  const tk = d.talks.find(t2 => t2.id === talkId);
  if (!tk || !S.nexus) return;
  const [ix, allow] = await Promise.all([api.wiki.quickIndex(S.nexus.id), narratorLinkFilterTypes(d.moduleId)]);
  const filtered = allow ? ix.filter(e => allow.includes(e.type)) : ix;
  const opts = `<option value="">--</option>` + filtered.map(e =>
    `<option value="${x(e.key)}" ${tk.linker_key === e.key ? 'selected' : ''}>${x(e.name)} (${x(e.type)})</option>`).join('');
  openModal(t('moduleLink'), `
    <div class="fg"><label>${t('moduleLink')}</label><select id="nt-link-key">${opts}</select></div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitNarratorTalkLink(${talkId})">${t('save')}</button>
    </div>`);
}

async function submitNarratorTalkLink(talkId) {
  const d = S.narratorData;
  const tk = d.talks.find(t2 => t2.id === talkId);
  if (!tk) return;
  const key = q('#nt-link-key')?.value || null;
  await api.narrator.updateTalk(talkId, tk.speaker || '', tk.talk_sentence || '', key);
  tk.linker_key = key;
  closeModal();
  await openModuleNode(d.moduleId);
  toast(t('saved'), 'ok');
}

async function openNarratorLinkFilterModal(moduleId) {
  const allow = (await narratorLinkFilterTypes(moduleId)) || [];
  const rows = NARRATOR_LINK_TYPES.map(ty => `
    <div class="togglerow" onclick="toggleNarratorLinkFilterType(this)" data-type="${ty}">
      <span class="tg${allow.includes(ty) ? ' on' : ''}"></span><span data-no-i18n>${ty}</span>
    </div>`).join('');
  openModal(t('narratorLinkFilter'), `
    <div id="nar-link-filter-rows">${rows}</div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveNarratorLinkFilter(${moduleId})">${t('save')}</button>
    </div>`);
}

function toggleNarratorLinkFilterType(el) {
  el.querySelector('.tg').classList.toggle('on');
}

async function saveNarratorLinkFilter(moduleId) {
  const allow = [...document.querySelectorAll('#nar-link-filter-rows .togglerow')]
    .filter(row => row.querySelector('.tg').classList.contains('on'))
    .map(row => row.dataset.type);
  await api.module.setUi(moduleId, 'narratorLinkFilter', JSON.stringify(allow));
  closeModal();
  toast(t('saved'), 'ok');
}

async function deleteNarratorTalk(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.narrator.deleteTalk(id);
  await openModuleNode(S.narratorData.moduleId);
}

// ── Dialogue CRUD ───────────────────────────────────────────────────────
async function openNarratorDialogueModal(moduleId, id = null) {
  const d = S.narratorData;
  const dl = id ? d.dialogues.find(dd => dd.id === id) : null;
  openModal(dl ? t('moduleEdit') : t('addDialogue'), `
    <div class="fg"><label>${t('name')} *</label><input id="nd-name" value="${x(dl?.name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(dl?.color || null)}</div>
    <div class="mfoot">
      ${dl ? `<button class="btn btn-d" onclick="deleteNarratorDialogue(${dl.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="submitNarratorDialogue(${moduleId},${dl ? dl.id : 'null'})">${dl ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#nd-name').focus(), 60);
}

async function submitNarratorDialogue(moduleId, id) {
  const name = q('#nd-name').value.trim();
  if (!name) return;
  const colorId = q('#sel-color').value || null;
  if (id) await api.narrator.updateDialogue(id, name, colorId);
  else {
    // Stagger fresh nodes diagonally so they never stack on one spot.
    const n = S.narratorData?.dialogues.length || 0;
    await api.narrator.createDialogue(moduleId, name, colorId, 40 + (n % 8) * 60, 40 + n * 40);
  }
  closeModal();
  await openModuleNode(moduleId);
  toast(id ? t('saved') : t('created'), 'ok');
}

async function deleteNarratorDialogue(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.narrator.deleteDialogue(id);
  closeModal();
  const d = S.narratorData;
  if (d.selectedId === id) d.selectedId = null;
  await openModuleNode(d.moduleId);
  toast(t('deleted'), 'ok');
}

// ── Edge modal ──────────────────────────────────────────────────────────
async function openNarratorEdgeModal(id) {
  const d = S.narratorData;
  const e = d.edges.find(ed => ed.id === id);
  if (!e) return;
  const nameOf = (nid) => x(d.dialogues.find(dd => dd.id === nid)?.name || '—');
  openModal(t('edgeLabel'), `
    <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px" data-no-i18n>${nameOf(e.from_ref)} → ${nameOf(e.to_ref)}</p>
    <div class="fg"><label>${t('edgeLabel')}</label><input id="ne-label" value="${x(e.label || '')}"></div>
    <div class="mfoot">
      <button class="btn btn-d" onclick="deleteNarratorEdge(${e.id})">${t('delete')}</button>
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveNarratorEdgeLabel(${e.id})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#ne-label').focus(), 60);
}

async function saveNarratorEdgeLabel(id) {
  await api.narrator.updateEdgeLabel(id, q('#ne-label').value.trim() || null);
  closeModal();
  await openModuleNode(S.narratorData.moduleId);
}

async function deleteNarratorEdge(id) {
  if (!await uiConfirm(t('moduleDeleteConfirm'))) return;
  await api.narrator.deleteEdge(id);
  closeModal();
  await openModuleNode(S.narratorData.moduleId);
}

// ── Route list view ─────────────────────────────────────────────────────
function buildNarratorRoutesHtml(d) {
  const nameOf = (nid) => d.dialogues.find(dd => dd.id === nid)?.name || '—';
  if (!d.edges.length) return `<div class="empty" style="margin-top:30px"><p>${t('nestEmpty')}</p></div>`;
  let html = `<div class="cls-table-wrap"><table class="cls-table">
    <tr><th data-no-i18n>From</th><th data-no-i18n>→</th><th data-no-i18n>To</th><th>${t('edgeLabel')}</th><th></th></tr>`;
  for (const e of d.edges) {
    html += `<tr>
      <td>${x(nameOf(e.from_ref))}</td><td data-no-i18n>→</td><td>${x(nameOf(e.to_ref))}</td>
      <td>${x(e.label || '')}</td>
      <td class="cls-rowacts">
        <button class="btn btn-g btn-i" onclick="openNarratorEdgeModal(${e.id})" title="${t('edit')}">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteNarratorEdge(${e.id})" title="${t('delete')}">${I.delete}</button>
      </td></tr>`;
  }
  return html + `</table></div>`;
}

// ── Conversation reader view ────────────────────────────────────────────
// The host is filled by mountNarratorReader() after render — the reader
// needs each node's talks, fetched lazily so the board view never loads
// every conversation up front.
function buildNarratorReaderHtml() {
  return `<div class="nar-reader" id="nar-reader"><div class="empty" style="padding:20px"><p>…</p></div></div>`;
}

// Walks the route graph from its roots (in-degree 0) in DFS order and lays
// the conversations out as a readable script; branch points list their
// outgoing route labels.
async function mountNarratorReader() {
  const d = S.narratorData;
  const host = q('#nar-reader');
  if (!d || !host) return;
  const inDeg = new Map();
  for (const e of d.edges) inDeg.set(e.to_ref, (inDeg.get(e.to_ref) || 0) + 1);
  const roots = d.dialogues.filter(dl => !inDeg.get(dl.id));
  const order = [];
  const seen = new Set();
  const visit = (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    order.push(id);
    for (const e of d.edges.filter(ed => ed.from_ref === id)) visit(e.to_ref);
  };
  for (const r of (roots.length ? roots : d.dialogues)) visit(r.id);
  for (const dl of d.dialogues) visit(dl.id);
  const talksById = new Map(await Promise.all(order.map(async id => [id, await api.narrator.getTalks(id)])));
  let html = '';
  for (const id of order) {
    const dl = d.dialogues.find(dd => dd.id === id);
    if (!dl) continue;
    const col = dl.color_code || '#6366f1';
    const outs = d.edges.filter(e => e.from_ref === id);
    const talks = talksById.get(id) || [];
    html += `<div class="nar-read-sec" style="border-left:3px solid ${x(col)}">
      <h4 style="color:${x(col)}">${x(dl.name)}</h4>
      ${talks.map(tk => `<div class="nar-read-line">${tk.speaker ? `<b>${x(tk.speaker)}:</b> ` : ''}${x(tk.talk_sentence || '')}</div>`).join('') || `<div class="nar-read-line ghost">—</div>`}
      ${outs.length > 1 ? `<div class="nar-read-branch" data-no-i18n>⑂ ${outs.map(e => `${x(e.label || '')} → ${x(d.dialogues.find(dd => dd.id === e.to_ref)?.name || '')}`).join(' · ')}</div>` : ''}
    </div>`;
  }
  host.innerHTML = html || `<div class="empty"><p>${t('nestEmpty')}</p></div>`;
}
