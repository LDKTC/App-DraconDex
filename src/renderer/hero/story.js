// The Story Graph submodule: the dialogue route board (pan/zoom, edge
// handles, storyline icons) and the conversation panel for a node.
// ═══ SUBMODULE: STORY GRAPH ════════════════════════════
let _heroEdges = [];
async function renderHeroStory() {
  const g = S.game;
  const stories = await api.game.getStories(g.id);
  let lh = `<div class="ph"><h4>${t('gameStory')}</h4>
    <button class="btn btn-g btn-i" onclick="openGameStoryModal()" title="${t('gameStoryNew')}">${I.plus}</button>
  </div>`;
  if (!stories.length) {
    lh += `<div class="empty" style="padding:16px 10px"><div class="ei">${I.story}</div><p style="font-size:calc(12px * var(--fsc,1));color:var(--t3);text-align:center">${t('gameStoryNew')}</p></div>`;
  } else {
    for (const s of stories) {
      const col = s.color_code || '#6366f1';
      const act = S.gameStoryId === s.id;
      lh += `<div class="li ${act ? 'active' : ''}" onclick="selectGameStory(${s.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(s.name)}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openGameStoryModal(${s.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = lh;

  const story = stories.find(s => s.id === S.gameStoryId);
  if (!story) {
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei">${I.story}</div><h3>${t('gameStory')}</h3><p>${t('gameStoryNew')}</p></div>`;
    return;
  }
  const [dialogues, edges] = await Promise.all([api.game.getDialogues(story.id), api.game.getStorylines(story.id)]);
  _heroEdges = edges;
  const scol = story.color_code || '#6366f1';
  let h = `<div class="ch" style="margin-bottom:8px">
    <h2 style="border-left:4px solid ${scol};padding-left:10px">${x(story.name)}${story.memo ? ` <span style="color:var(--t3);font-weight:400;font-size:.72em">· ${x(story.memo)}</span>` : ''}</h2>
    <div style="display:flex;gap:6px">
      <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameStoryUI(${story.id})" title="${t('delete')}">${I.delete}</button>
      <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12.5px * var(--fsc,1))" onclick="openGameDialogueModal(${story.id})">${I.plus} ${t('gameDialogueNew')}</button>
    </div>
  </div>
  <div style="display:flex;gap:10px;height:calc(100% - 56px);min-height:360px">
    <div id="story-graph-wrap" style="flex:1;position:relative;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div id="story-graph" style="position:relative;width:2400px;height:1600px">
        <svg id="story-edges" width="2400" height="1600" style="position:absolute;inset:0;pointer-events:none">
          <defs><marker id="hero-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--t3)"/>
          </marker></defs>
        </svg>`;
  for (const d of dialogues) {
    const dcol = d.color_code || '#6366f1';
    const act = S.gameDialId === d.id;
    h += `<div class="hero-dial-node" data-dial="${d.id}" style="position:absolute;left:${d.pos_x || 20}px;top:${d.pos_y || 20}px;min-width:130px;max-width:220px;background:var(--raised);border:1px solid ${act ? 'var(--accent)' : 'var(--border)'};border-left:4px solid ${dcol};border-radius:var(--rs);padding:6px 8px;cursor:grab;user-select:none;box-shadow:0 2px 8px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:center;gap:4px">
        <span style="font-size:.88em;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(d.name)}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();startHeroEdge(${d.id})" title="${t('gameAddEdge')}">${I.relation}</button>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openGameDialogueModal(${story.id},${d.id})" title="${t('edit')}">${I.edit}</button>
      </div>
      ${d.memo ? `<div style="font-size:.76em;color:var(--t3);margin-top:2px">${x(d.memo)}</div>` : ''}
      ${d.conv_count ? `<div style="font-size:.72em;color:var(--accent);margin-top:2px">${d.conv_count} ${t('gameConversations')}</div>` : ''}
    </div>`;
  }
  h += `</div></div>`;
  if (S.gameDialId && dialogues.find(d => d.id === S.gameDialId)) {
    h += await renderConversationPanel(S.gameDialId, dialogues);
  }
  h += `</div>`;
  q('#main-inner').innerHTML = h;
  drawHeroEdges();
  initHeroGraphInteractions(story.id);
}

async function selectGameStory(id) {
  S.gameStoryId = id; S.gameDialId = null; S.gameEdgeFrom = null;
  await renderHeroStory();
}

function drawHeroEdges() {
  const svg = q('#story-edges');
  const graph = q('#story-graph');
  if (!svg || !graph) return;
  const defs = svg.querySelector('defs').outerHTML;
  let body = '';
  for (const e of _heroEdges) {
    const fn = graph.querySelector(`[data-dial="${e.from_ref}"]`);
    const tn = graph.querySelector(`[data-dial="${e.to_ref}"]`);
    if (!fn || !tn) continue;
    const x1 = fn.offsetLeft + fn.offsetWidth / 2, y1 = fn.offsetTop + fn.offsetHeight / 2;
    const x2 = tn.offsetLeft + tn.offsetWidth / 2, y2 = tn.offsetTop + tn.offsetHeight / 2;
    const col = e.color_code || 'var(--t3)';
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    // "+" drag handle sits 3/4 of the way toward the target (the storyline's
    // right/leading edge) — grabbing and dropping it on another dialogue
    // creates a new storyline sharing this one's origin.
    const hx = x1 + (x2 - x1) * 0.75, hy = y1 + (y2 - y1) * 0.75;
    body += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="1.6" marker-end="url(#hero-arrow)"/>
      <circle cx="${mx}" cy="${my}" r="8" fill="var(--surface)" stroke="${col}" stroke-width="1.4" style="pointer-events:auto;cursor:pointer" onclick="openStorylineIconModal(${e.id})"><title>${t('edit')}</title></circle>
      ${e.symbol_glyph ? `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="10.5" style="pointer-events:none">${x(e.symbol_glyph)}</text>` : ''}
      <circle class="hero-edge-handle" data-edge="${e.id}" data-from="${e.from_ref}" cx="${hx}" cy="${hy}" r="7" fill="${col}" style="pointer-events:auto;cursor:grab"><title>${t('gameAddEdge')}</title></circle>
      <line x1="${hx - 3}" y1="${hy}" x2="${hx + 3}" y2="${hy}" stroke="#fff" stroke-width="1.6" style="pointer-events:none"/>
      <line x1="${hx}" y1="${hy - 3}" x2="${hx}" y2="${hy + 3}" stroke="#fff" stroke-width="1.6" style="pointer-events:none"/>`;
  }
  svg.innerHTML = defs + body;
}

async function openStorylineIconModal(edgeId) {
  const edge = _heroEdges.find(e => e.id === edgeId);
  if (!edge) return;
  const picker = await symbolPicker('hsl-sym-ref', edge.symbol_ref || null, 'hsl-sym-preview', 'hsl-sym-custom');
  openModal('Choose Symbol', `
    <div class="symsel-box">
      <span class="symsel-preview" id="hsl-sym-preview">${x(edge.symbol_glyph || '+')}</span>
      <input type="text" class="symsel-input" id="hsl-sym-custom" placeholder="Type a custom symbol..." maxlength="4" value="${edge.symbol_ref ? '' : x(edge.symbol_glyph || '')}" oninput="onSymbolCustomInput('hsl-sym-ref','hsl-sym-preview',this.value)">
    </div>
    <div class="form-row"><label>Symbol</label>${picker}</div>
    <div class="mfoot">
      <button class="btn btn-d" style="margin-right:auto" onclick="deleteStorylineEdge(${edgeId})">${t('delete')}</button>
      <button class="btn btn-g" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveStorylineIcon(${edgeId})">${t('save')}</button>
    </div>`);
}

async function saveStorylineIcon(edgeId) {
  const symRef = Number(q('#hsl-sym-ref')?.value) || null;
  const customText = (q('#hsl-sym-custom')?.value || '').trim();
  await api.game.updateStorylineSymbol(edgeId, symRef, symRef ? null : (customText || null));
  closeModal();
  await renderHeroStory();
}

let heroGraphPanCleanup = null;

// Right-click + drag pans #story-graph-wrap, matching the same gesture used
// on the Navigator map board (Konva stage) — the story graph is a plain
// scrollable div, so panning just adjusts scrollLeft/scrollTop directly.
function initHeroGraphPan() {
  const wrap = q('#story-graph-wrap');
  if (!wrap) return;
  if (heroGraphPanCleanup) heroGraphPanCleanup();
  const controller = new AbortController();
  heroGraphPanCleanup = () => controller.abort();
  const { signal } = controller;
  wrap.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
  let panning = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
  wrap.addEventListener('mousedown', (e) => {
    if (e.button !== 2) return;
    panning = true;
    startX = e.clientX; startY = e.clientY;
    startLeft = wrap.scrollLeft; startTop = wrap.scrollTop;
    wrap.classList.add('is-panning');
  }, { signal });
  window.addEventListener('mousemove', (e) => {
    if (!panning) return;
    wrap.scrollLeft = startLeft - (e.clientX - startX);
    wrap.scrollTop = startTop - (e.clientY - startY);
  }, { signal });
  window.addEventListener('mouseup', () => {
    panning = false;
    wrap.classList.remove('is-panning');
  }, { signal });
}

// The "+" handle on each storyline (drawHeroEdges) is grabbed and dropped on
// a different dialogue node to spawn a new storyline sharing the dragged
// edge's origin — a shortcut to branching without reaching for the node's
// own "start edge" button. Bound once on the svg itself (not per-handle)
// since drawHeroEdges rewrites the handles' markup on every node drag.
function initHeroEdgeHandles(storyId) {
  const svg = q('#story-edges');
  if (!svg) return;
  svg.addEventListener('pointerdown', (ev) => {
    const handle = ev.target.closest('.hero-edge-handle');
    if (!handle) return;
    ev.stopPropagation();
    const fromRef = Number(handle.dataset.from);
    let dropTarget = null;
    const onMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const node = el?.closest('.hero-dial-node');
      document.querySelectorAll('.hero-dial-node.edge-drop-hint').forEach(n => n.classList.remove('edge-drop-hint'));
      dropTarget = null;
      if (node && Number(node.dataset.dial) !== fromRef) {
        node.classList.add('edge-drop-hint');
        dropTarget = Number(node.dataset.dial);
      }
    };
    const onUp = async () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.querySelectorAll('.hero-dial-node.edge-drop-hint').forEach(n => n.classList.remove('edge-drop-hint'));
      if (dropTarget) {
        await api.game.createStoryline(storyId, fromRef, dropTarget, null);
        await renderHeroStory();
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

function initHeroGraphInteractions(storyId) {
  const graph = q('#story-graph');
  if (!graph) return;
  initHeroGraphPan();
  initHeroEdgeHandles(storyId);
  graph.querySelectorAll('.hero-dial-node').forEach(node => {
    const id = Number(node.dataset.dial);
    let dragMoved = false;
    node.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('button')) return;
      const startX = ev.clientX, startY = ev.clientY;
      const origL = node.offsetLeft, origT = node.offsetTop;
      dragMoved = false;
      try { node.setPointerCapture(ev.pointerId); } catch (_) {}
      node.style.cursor = 'grabbing';
      const onMove = (e) => {
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (!dragMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        dragMoved = true;
        node.style.left = Math.max(0, origL + dx) + 'px';
        node.style.top = Math.max(0, origT + dy) + 'px';
        drawHeroEdges();
      };
      const onUp = async () => {
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerup', onUp);
        node.style.cursor = 'grab';
        if (dragMoved) await api.game.updateDialoguePos(id, node.offsetLeft, node.offsetTop);
      };
      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerup', onUp);
    });
    // Selection and edge completion ride the click event (fires after the
    // pointer pair), so a drag can veto it via dragMoved.
    node.addEventListener('click', async (ev) => {
      if (ev.target.closest('button') || dragMoved) return;
      if (S.gameEdgeFrom && S.gameEdgeFrom !== id) {
        await api.game.createStoryline(storyId, S.gameEdgeFrom, id, null);
        S.gameEdgeFrom = null;
        await renderHeroStory();
      } else {
        S.gameDialId = id;
        await renderHeroStory();
      }
    });
  });
}

function startHeroEdge(dialId) {
  S.gameEdgeFrom = dialId;
  toast(t('gameAddEdge'), 'ok');
}

async function deleteStorylineEdge(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.deleteStoryline(id);
  closeModal();
  await renderHeroStory();
}

// ─── Conversations (right of the graph) ───
async function renderConversationPanel(dialId, dialogues) {
  const [convs, chars] = await Promise.all([api.game.getConversations(dialId), api.game.getCharacters(S.game.id)]);
  const d = dialogues.find(dd => dd.id === dialId);
  const charOpts = (sel) => `<option value="">--</option>` + chars.map(c => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${x(c.name)}</option>`).join('');
  let h = `<div style="width:320px;flex:none;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:8px;overflow-y:auto">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <span style="font-weight:600;font-size:.95em;flex:1">${x(d?.name || '')} · ${t('gameConversations')}</span>
      <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameDialogueUI(${dialId})" title="${t('delete')}">${I.delete}</button>
    </div>`;
  for (const cv of convs) {
    const col = cv.char_color || '#6366f1';
    h += `<div style="border:1px solid var(--border);border-left:3px solid ${col};border-radius:var(--rs);padding:6px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
        <span class="cs-count" style="min-width:22px;text-align:center">${cv.talk_order + 1}</span>
        <select style="flex:1;font-size:calc(12px * var(--fsc,1))" onchange="saveGameConv(${cv.id},this.value,null)">${charOpts(cv.char_ref)}</select>
        <button class="btn btn-g btn-i" onclick="moveGameConv(${cv.id},-1)" title="↑">▲</button>
        <button class="btn btn-g btn-i" onclick="moveGameConv(${cv.id},1)" title="↓">▼</button>
        <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameConv(${cv.id})" title="${t('delete')}">${I.delete}</button>
      </div>
      <textarea class="table-inline-input" style="width:100%;min-height:44px;font-size:calc(12.5px * var(--fsc,1))" onchange="saveGameConv(${cv.id},null,this.value)">${x(cv.talk_sentence || '')}</textarea>
    </div>`;
  }
  h += `<button class="btn btn-p" style="margin-top:2px" onclick="addGameConv(${dialId})">${I.plus} ${t('gameConvNew')}</button></div>`;
  return h;
}

async function addGameConv(dialId) {
  await api.game.createConversation(dialId, null, '');
  await renderHeroStory();
}

async function saveGameConv(id, charId, text) {
  const convs = await api.game.getConversations(S.gameDialId);
  const cv = convs.find(c => c.id === id);
  if (!cv) return;
  await api.game.updateConversation(id,
    charId !== null ? (charId ? Number(charId) : null) : cv.char_ref,
    text !== null ? text : cv.talk_sentence);
  toast(t('saved'), 'ok');
}

async function moveGameConv(id, dir) {
  await api.game.moveConversation(id, dir);
  await renderHeroStory();
}

async function deleteGameConv(id) {
  if (!await uiConfirm(t('confirmDeleteItem'), { okText: t('delete'), cancelText: t('cancel') })) return;
  await api.game.deleteConversation(id);
  await renderHeroStory();
}

