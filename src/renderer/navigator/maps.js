// The Maps + Timeline tab's sidebar and modals: map picker, timelines,
// events, and the object/character pickers used when placing a pin.
// ═══ Maps + Timeline (merged tab) ══════════════════════
// Sidebar: a list of linked maps, each a collapsible folder listing the
// timelines anchored to it (world_timeline.world_map_ref). Selecting a
// timeline renders the 2-graph board (map + timeline) into #main-inner.
// Maps come solely from the world's linked novels (api.world.getMaps keeps
// world_map synced to world_novel server-side) — no manual add/remove step.
let _worldMapPickerMaps = [];

async function renderWorldMapsSidebar(w) {
  const col = w.color_code || '#6366f1';
  const [maps, timelines] = await Promise.all([
    api.world.getMaps(w.id),
    api.world.getTimelines(w.id),
  ]);
  _worldMapPickerMaps = maps;

  let h = `<div class="project-side-head">
    <div class="project-side-title">
      <span class="dot" style="background:${col}"></span>
      <span class="name">${x(w.name)}</span>
    </div>
  </div>`;
  if (!maps.length) {
    h += `<div class="ph compact"><h4>${t('worldMapTimelines')}</h4></div>
      <div class="empty project-side-empty"><p>No maps yet. Link a novel with a map to this world first.</p></div>`;
    q('#left-panel-inner').innerHTML = h;
    return;
  }

  if (!S.worldMapSelectedId || !maps.find(m => m.id === S.worldMapSelectedId)) {
    // Default to the selected timeline's own map so switching timelines from
    // elsewhere keeps this dropdown in sync; else just the first map.
    const activeTl = S.worldActiveTimelineId ? timelines.find(tl => tl.id === S.worldActiveTimelineId) : null;
    S.worldMapSelectedId = activeTl?.world_map_ref || maps[0].id;
  }
  const selMap = maps.find(m => m.id === S.worldMapSelectedId) || maps[0];

  h += `<div class="ph compact"><h4>${t('worldMapTimelines')}</h4>
    <button class="btn btn-g btn-i" title="New timeline on this map" onclick="openWorldTimelineModal(${w.id},null,${selMap.id})">${I.plus}</button>
  </div>
  <div class="fg" style="padding:0 10px;margin:0 0 8px">
    ${buildWorldMapPickerHtml(w.id, maps, selMap)}
  </div>`;

  const tls = timelines.filter(tl => tl.world_map_ref === selMap.id);
  h += tls.length
    ? tls.map(tl => {
        const active = S.worldActiveTimelineId === tl.id;
        return `<div class="li ${active ? 'active' : ''}" style="display:flex;align-items:center;gap:6px" onclick="selectWorldTimeline(${w.id},${tl.id})">
          <span class="name" style="flex:1">${x(tl.name)}</span>
          <button class="btn btn-g btn-i btn-i-sm" title="Edit" onclick="event.stopPropagation();openWorldTimelineModal(${w.id},${tl.id})">${I.edit}</button>
          <button class="btn btn-g btn-i btn-i-sm" title="Delete" onclick="event.stopPropagation();deleteWorldTimeline(${w.id},${tl.id})">${I.delete}</button>
        </div>`;
      }).join('')
    : `<div class="empty project-side-empty"><p>No timelines yet on this map.</p></div>`;

  q('#left-panel-inner').innerHTML = h;
}

// Folder-grouped dropdown for picking among the world's linked maps, matching
// the novel-picker's .novel-picker/.np-* look (buildNpTree) instead of a flat
// native <select> that gave no sense of which novel/folder a map belonged to.
function buildWorldMapPickerHtml(worldId, maps, selMap) {
  const pickId = 'wm-map';
  const label = selMap ? `${selMap.map_name || '(untitled map)'} · ${selMap.project_name || ''}` : '— select map —';
  const mapRow = (m) => `<div class="np-item" onclick="event.stopPropagation();selectWorldMapFromPicker(${worldId},${m.id})">${x(m.map_name || '(untitled map)')} <span style="color:var(--t3);font-size:.85em">· ${x(m.project_name || '')}</span></div>`;
  let html = '';
  for (const f of (S.folders || [])) {
    const fps = maps.filter(m => m.folder_id === f.id);
    if (!fps.length) continue;
    const open = S.npOpenFolders.has(f.id);
    const fcol = f.color_code || '#6366f1';
    html += `<div class="np-folder">
      <div class="np-folder-head" onclick="event.stopPropagation();toggleWorldMapPickerFolder(${f.id})">
        <svg style="width:8px;height:8px;flex-shrink:0;transform:rotate(${open ? 90 : 0}deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="color:${fcol};line-height:1;display:flex;align-items:center">${I.folder}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(f.name)}</span>
        <span style="color:var(--t3);font-size:calc(11px * var(--fsc,1))">${fps.length}</span>
      </div>
      ${open ? fps.map(mapRow).join('') : ''}
    </div>`;
  }
  const unfiled = maps.filter(m => !m.folder_id);
  if (unfiled.length) {
    if ((S.folders || []).length && html) html += `<div style="border-top:1px solid var(--border);margin:4px 0"></div>`;
    html += unfiled.map(mapRow).join('');
  }
  if (!html) html = `<div style="padding:10px 12px;color:var(--t3);font-size:calc(13px * var(--fsc,1))">No maps available</div>`;
  return `<div class="novel-picker" id="np-wrap-${pickId}" style="width:100%">
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button" style="width:100%;min-width:0">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(label)}</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">${html}</div>
  </div>`;
}

function toggleWorldMapPickerFolder(folderId) {
  if (S.npOpenFolders.has(folderId)) S.npOpenFolders.delete(folderId);
  else S.npOpenFolders.add(folderId);
  const drop = q('#np-drop-wm-map');
  if (!drop) return;
  const selMap = _worldMapPickerMaps.find(m => m.id === S.worldMapSelectedId) || _worldMapPickerMaps[0];
  drop.innerHTML = buildWorldMapPickerHtml(S.world.id, _worldMapPickerMaps, selMap);
  drop.style.display = '';
}

async function selectWorldMapFromPicker(worldId, mapId) {
  S.worldMapSelectedId = Number(mapId);
  await renderWorldSidebar(S.world);
}

async function selectWorldTimeline(worldId, timelineId) {
  S.worldActiveTimelineId = timelineId;
  S.worldActiveEventId = null;
  await renderWorldSidebar(S.world);
  await renderWorldMapTimelineBoard(worldId, timelineId);
}

// Re-renders the sidebar (map/timeline list) and the main board after any
// map/timeline/event CRUD — drops S.worldActiveTimelineId if it no longer exists.
async function refreshWorldMapsTimeline(worldId) {
  if (S.worldActiveTimelineId) {
    const timelines = await api.world.getTimelines(worldId);
    if (!timelines.find(tl => tl.id === S.worldActiveTimelineId)) {
      S.worldActiveTimelineId = null;
      S.worldActiveEventId = null;
    }
  }
  await renderWorldSidebar(S.world);
  await renderWorldMain();
}

async function openWorldTimelineModal(worldId, id, presetMapId) {
  const isEdit = !!id;
  const tls = await api.world.getTimelines(worldId);
  const tl = isEdit ? tls.find(t => t.id === id) : null;
  const wMaps = await api.world.getMaps(worldId);
  const selMap = tl?.world_map_ref ?? presetMapId ?? null;
  const mapOpts = wMaps.map(m => `<option value="${m.id}"${selMap === m.id ? ' selected' : ''}>${x(m.map_name || '(untitled map)')}</option>`).join('');
  openModal(isEdit ? 'Edit Timeline' : 'New Timeline', `
    <div class="form-row"><label>Name *</label><input id="wtm-name" value="${x(tl?.name || '')}"></div>
    <div class="form-row"><label>Anchor map (optional)</label>
      <select id="wtm-map"><option value="">— none —</option>${mapOpts}</select>
    </div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteWorldTimeline(${worldId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldTimeline(${worldId},${id || 'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
}

async function saveWorldTimeline(worldId, id) {
  const name = q('#wtm-name')?.value?.trim();
  if (!name) return toast('Name required', 'err');
  const wmref = Number(q('#wtm-map')?.value) || null;
  if (id) await api.world.updateTimeline(id, name, wmref);
  else await api.world.createTimeline(worldId, name, wmref);
  closeModal();
  if (wmref) S.worldMapSelectedId = wmref;
  await refreshWorldMapsTimeline(worldId);
}

async function deleteWorldTimeline(worldId, id) {
  if (!await uiConfirm('Delete this timeline and its events?')) return;
  await api.world.deleteTimeline(id);
  closeModal();
  await refreshWorldMapsTimeline(worldId);
}

function openWorldEventModal(worldId, tlId) {
  openModal('New Event', `
    <div class="form-row" style="display:flex;gap:6px">
      <div style="flex:1"><label>Day</label><input id="wem-d" type="number" value="1"></div>
      <div style="flex:1"><label>Month</label><input id="wem-mo" type="number" value="1"></div>
      <div style="flex:1"><label>Year</label><input id="wem-y" type="number" value="0"></div>
      <div style="flex:1"><label>Hour</label><input id="wem-h" type="number" value="0"></div>
      <div style="flex:1"><label>Minute</label><input id="wem-mi" type="number" value="0"></div>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldEvent(${worldId},${tlId})">Create</button>
    </div>`);
}

async function saveWorldEvent(worldId, tlId) {
  const num = (sel) => Number(q(sel)?.value) || 0;
  await api.world.createEvent(tlId, num('#wem-d'), num('#wem-mo'), num('#wem-y'), num('#wem-h'), num('#wem-mi'));
  closeModal();
  await renderWorldMapTimelineBoard(worldId, tlId);
}

async function deleteWorldEvent(worldId, id) {
  if (!await uiConfirm('Delete this event?')) return;
  await api.world.deleteEvent(id);
  if (S.worldActiveEventId === id) S.worldActiveEventId = null;
  if (S.worldActiveTimelineId) await renderWorldMapTimelineBoard(worldId, S.worldActiveTimelineId);
}

// Read-only list of what's placed on this event — adding is done by clicking
// the map with the "Add" tool (see renderWorldMapToolbarHtml/openPlaceObjectAtModal).
async function openEventObjectsModal(worldId, eventId) {
  const placed = await api.world.getEventObjects(eventId);
  const placedHtml = placed.length
    ? placed.map(p => `<div class="li" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${p.color_code || '#6366f1'}"></div>
        ${p.symbol ? `<span style="font-size:calc(13px * var(--fsc,1));line-height:1;flex-shrink:0">${x(p.symbol)}</span>` : ''}
        <span class="name" style="flex:1;font-size:.88em">${x(p.label)} ${p.x != null ? `<span style="color:var(--t3)">(${Math.round(p.x)}, ${Math.round(p.y)})</span>` : ''}</span>
        <button class="btn btn-g btn-i" title="Remove" onclick="removeEventObject(${worldId},${eventId},${p.id})">${I.delete}</button>
      </div>`).join('')
    : `<div style="color:var(--t3);font-size:.85em;padding:6px 0">Nothing placed yet. Use the Add tool on the map to place one.</div>`;

  openModal('Event Objects', `
    <h4 style="margin:0 0 4px">Placed</h4>${placedHtml}
    <div class="mfoot"><button class="btn btn-g" onclick="closeEventObjectsModal(${worldId})">Close</button></div>`);
}

async function closeEventObjectsModal(worldId) {
  closeModal();
  if (S.worldActiveTimelineId) await renderWorldMapTimelineBoard(worldId, S.worldActiveTimelineId);
}

async function removeEventObject(worldId, eventId, id) {
  // NB: the map "delete" tool calls api.world.removeEventObject directly (it
  // deletes on a single canvas click by design) and deliberately bypasses this.
  if (!await uiConfirm(t('confirmRemoveLink'), { okText: t('remove'), cancelText: t('cancel') })) return;
  await api.world.removeEventObject(id);
  await openEventObjectsModal(worldId, eventId);
  if (S.worldActiveEventId === eventId && S.worldActiveTimelineId) await renderWorldMapTimelineBoard(worldId, S.worldActiveTimelineId);
}

// Opens after clicking the map with the "Add" tool active — lets the user pick
// which object/character to place at the clicked (px,py), bound to the event
// that was already selected on the timeline.
async function openPlaceObjectAtModal(worldId, eventId, px, py) {
  const [objs, chars] = await Promise.all([
    api.world.getPlaceableObjects(worldId),
    api.world.getPlaceableCharacters(worldId),
  ]);
  if (!objs.length && !chars.length) return toast('Add world objects/characters first', 'err');
  const rx = Math.round(px * 100) / 100, ry = Math.round(py * 100) / 100;
  openModal('Place Object', `
    <div class="form-row"><label>Entity</label>${buildEntityPickerHtml('wpo-entity', objs, chars)}</div>
    <p style="color:var(--t3);font-size:.85em;margin:6px 0 0">Position: (${rx}, ${ry})</p>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="confirmPlaceObjectAt(${worldId},${eventId},${rx},${ry})">Place</button>
    </div>`);
}

// A dropdown like buildNovelPickerHtml/buildObjectPickerHtml (.novel-picker/.np-*),
// but each row is an object/character with its color as a leading dot and its
// symbol glyph (if any) — a native <select><option> can't render either.
function buildEntityPickerHtml(pickId, objs, chars) {
  const row = (kind, item) => `<div class="np-item" style="display:flex;align-items:center;gap:6px" onclick="event.stopPropagation();selectEntityFromPicker('${pickId}','${kind}',${item.id},'${x(item.name)}')">
      <div class="dot" style="background:${item.color_code || '#6366f1'};width:8px;height:8px;border-radius:50%;flex-shrink:0"></div>
      ${item.symbol ? `<span style="flex-shrink:0">${x(item.symbol)}</span>` : ''}
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(item.name)}</span>
    </div>`;
  let inner = '';
  if (objs.length) inner += `<div style="padding:4px 12px;font-size:calc(11px * var(--fsc,1));color:var(--t3);font-weight:600">Objects</div>${objs.map(o => row('obj', o)).join('')}`;
  if (chars.length) inner += `<div style="padding:4px 12px;font-size:calc(11px * var(--fsc,1));color:var(--t3);font-weight:600">Characters</div>${chars.map(c => row('char', c)).join('')}`;
  return `<div class="novel-picker" id="np-wrap-${pickId}" data-selected-id="" data-selected-kind="" style="width:100%">
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button" style="width:100%;min-width:0">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">— select —</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">${inner}</div>
  </div>`;
}

function selectEntityFromPicker(pickId, kind, id, name) {
  const lbl = q(`#np-label-${pickId}`);
  if (lbl) lbl.textContent = name;
  const drop = q(`#np-drop-${pickId}`);
  if (drop) drop.style.display = 'none';
  const wrap = q(`#np-wrap-${pickId}`);
  if (wrap) { wrap.dataset.selectedId = id; wrap.dataset.selectedKind = kind; }
}

async function confirmPlaceObjectAt(worldId, eventId, px, py) {
  const wrap = q('#np-wrap-wpo-entity');
  const kind = wrap?.dataset.selectedKind;
  const id = Number(wrap?.dataset.selectedId) || 0;
  if (!id) return toast('Pick an object or character first', 'err');
  const oref = kind === 'obj' ? id : null;
  const cref = kind === 'char' ? id : null;
  await api.world.addEventObject(eventId, oref, cref, px, py);
  closeModal();
  if (worldKonvaStage) await paintEventObjectsOnBoard(eventId, worldKonvaStage.scaleX());
  toast('Placed', 'ok');
}

