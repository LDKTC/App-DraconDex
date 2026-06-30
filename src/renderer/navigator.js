// Navigator module (v2.5.2 "World") — cross-novel world-building.
// Worlds aggregate data from linked novels: characters, categories/objects,
// maps and a dated timeline. Mirrors the Director UX (left list + tabbed detail).
const WORLD_TABS = ['overview', 'characters', 'categories', 'maps', 'timeline'];

async function renderNavigatorView() {
  S.view = 'navigator';
  S.activeModule = 'navigator';
  const worlds = await api.world.getAll();
  let h = `<div class="ph"><h4>${t('navigator')}</h4>
    <button class="btn btn-g btn-i" onclick="openWorldModal()" title="${t('worldNew')}">${I.plus}</button>
  </div>`;
  if (!worlds.length) {
    h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.globe}</div><p>${t('worldNew')}</p></div>`;
  } else {
    for (const w of worlds) {
      const col = w.color_code || '#6366f1';
      const sel = S.world?.id === w.id ? ' selected' : '';
      h += `<div class="li${sel}" onclick="selectWorld(${w.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(w.name)}${w.codename ? ` <span style="color:var(--t3);font-size:.8em">${x(w.codename)}</span>` : ''}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWorldModal(${w.id})" title="Edit">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = h;
  if (S.world) {
    await renderWorldDetail(S.world.id);
  } else {
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei">${I.globe}</div>
      <h3>${t('navigator')}</h3>
      <p>${t('nexusWelcomeText')}</p>
    </div>`;
  }
  updateTopNavButton();
}

async function selectWorld(id) {
  S.world = await api.world.get(id);
  S.worldTab = WORLD_TABS.includes(S.worldTab) ? S.worldTab : 'overview';
  S.worldCatOpen = S.worldCatOpen || new Set();
  if (S.world) upsertEntityTab(S.world, 'world', 'navigator');
  await renderNavigatorView();
}

async function renderWorldDetail(id) {
  const w = S.world || await api.world.get(id);
  if (!w) return;
  const col = w.color_code || '#6366f1';

  let body = '';
  if (S.worldTab === 'overview') body = await renderWorldOverview(w);
  else if (S.worldTab === 'characters') body = await renderWorldChars(w.id);
  else if (S.worldTab === 'categories') body = await renderWorldCats(w.id);
  else if (S.worldTab === 'maps') body = await renderWorldMaps(w.id);
  else if (S.worldTab === 'timeline') body = await renderWorldTimelines(w.id);

  q('#main-inner').innerHTML = `
    <div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:12px">
      <h2 style="margin:0;font-size:1.1em">${x(w.name)} <span style="color:var(--t3);font-weight:400;font-size:.8em">· ${x(worldTabLabel(S.worldTab))}</span></h2>
      ${w.memo ? `<div style="color:var(--t3);font-size:.85em;margin-top:2px">${x(w.memo)}</div>` : ''}
    </div>
    <div id="world-tab-body">${body}</div>`;
  updateTopNavButton();
}

function worldTabLabel(tab) {
  const map = {
    overview: t('worldOverview'), characters: t('worldChars'),
    categories: t('worldCats'), maps: t('worldMaps'), timeline: t('worldTimeline'),
  };
  return map[tab] || tab;
}

async function setWorldTab(tab) {
  S.worldTab = tab;
  if (S.world) await renderWorldDetail(S.world.id);
}

// ═══ World CRUD ══════════════════════════════════════
async function openWorldModal(id) {
  const isEdit = !!id;
  const w = isEdit ? (await api.world.get(id)) : null;
  const picker = await colorPicker(w?.color || null);
  openModal(isEdit ? 'Edit World' : 'New World', `
    <div class="form-row"><label>Codename</label><input id="wm-code" value="${x(w?.codename || '')}" placeholder="e.g. AAA"></div>
    <div class="form-row"><label>Name *</label><input id="wm-name" value="${x(w?.name || '')}" placeholder="World name"></div>
    <div class="form-row"><label>Memo</label><textarea id="wm-memo" rows="3" style="width:100%;resize:vertical">${x(w?.memo || '')}</textarea></div>
    <div class="form-row"><label>Color</label>${picker}</div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:8px" onclick="deleteWorld(${id})">Delete World</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorld(${id || 'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
}

async function saveWorld(id) {
  const name = q('#wm-name')?.value?.trim();
  if (!name) return toast('Name required', 'err');
  const code = q('#wm-code')?.value?.trim() || null;
  const memo = q('#wm-memo')?.value?.trim() || null;
  const color = q('#sel-color')?.value || null;
  if (id) {
    await api.world.update(id, code, name, memo, color);
    S.world = await api.world.get(id);
  } else {
    const newId = await api.world.create(code, name, memo, color);
    if (newId) S.world = await api.world.get(newId);
  }
  closeModal();
  await renderNavigatorView();
}

async function deleteWorld(id) {
  if (!confirm('Delete this world and all its data?')) return;
  await api.world.delete(id);
  if (S.world?.id === id) S.world = null;
  closeModal();
  await renderNavigatorView();
}

// ═══ Overview (linked novels) ════════════════════════
async function renderWorldOverview(w) {
  const [novels, linkable] = await Promise.all([
    api.world.getNovels(w.id),
    api.world.getLinkableProjects(w.id),
  ]);

  const novelsHtml = novels.length
    ? novels.map(n => `<div class="li" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${n.color_code || '#6366f1'}"></div>
        <span class="name" style="flex:1">${x(n.name)}${n.codename ? ` <span style="color:var(--t3);font-size:.8em">${x(n.codename)}</span>` : ''}</span>
        <button class="btn btn-g btn-i" title="Unlink" onclick="removeWorldNovel(${n.id})">${I.delete}</button>
      </div>`).join('')
    : `<div style="color:var(--t3);font-size:.85em;padding:8px 0">No novels linked.</div>`;

  const linkedIds = new Set(novels.map(n => n.project_ref));
  const addHtml = linkable.length
    ? `<div style="display:flex;gap:6px;align-items:center">
        <select id="wov-novel" style="font-size:.85em;max-width:220px">
          ${linkable.map(p => `<option value="${p.id}">${x(p.name)}${p.codename ? ' · ' + x(p.codename) : ''}</option>`).join('')}
        </select>
        <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="addWorldNovel(${w.id})">${I.plus} Link</button>
      </div>`
    : `<span style="color:var(--t3);font-size:.8em">All novels linked</span>`;

  return `<section>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <h4 style="margin:0">${t('worldLinkedNovels')}</h4>
      ${addHtml}
    </div>
    ${novelsHtml}
  </section>`;
}

async function addWorldNovel(worldId) {
  const pid = Number(q('#wov-novel')?.value);
  if (!pid) return;
  await api.world.addNovel(worldId, pid);
  await setWorldTab('overview');
}

async function removeWorldNovel(id) {
  await api.world.removeNovel(id);
  await setWorldTab('overview');
}

// ═══ Characters ══════════════════════════════════════
async function renderWorldChars(worldId) {
  const chars = await api.world.getCharacters(worldId);
  const head = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <button class="btn btn-g" style="padding:5px 11px;font-size:12px" onclick="openCharCategoriesModal(${worldId})">${I.layer} Categories</button>
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openWorldCharModal(${worldId})">${I.plus} ${t('worldCharNew')}</button>
  </div>`;

  if (!chars.length) {
    return head + `<div class="empty"><div class="ei">${I.person}</div>
      <p style="color:var(--t3)">No characters yet.</p></div>`;
  }

  let html = '';
  for (const c of chars) {
    const links = await api.world.getCharLinks(c.id);
    const linksHtml = links.map(lk =>
      `<div style="display:flex;align-items:center;gap:4px;font-size:.8em;color:var(--t3);padding:1px 0">
        <span style="flex:1">${x(lk.category_name || '?')} / ${x(lk.name || '?')}</span>
        <button class="btn btn-g btn-i" style="padding:1px 5px;font-size:11px" title="Remove" onclick="removeCharLink(${worldId},${lk.id})">×</button>
      </div>`).join('');
    html += `<div class="li" style="flex-direction:column;align-items:flex-start;padding:8px 10px;gap:4px">
      <div style="display:flex;width:100%;align-items:center;gap:8px">
        <div class="dot" style="background:${c.color_code || '#6366f1'}"></div>
        <span class="name" style="flex:1;font-weight:500">${x(c.name)}${c.symbol ? ` <span style="color:var(--t3)">${x(c.symbol)}</span>` : ''}</span>
        <button class="btn btn-g btn-i" onclick="openWorldCharModal(${worldId},${c.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteWorldChar(${worldId},${c.id})">${I.delete}</button>
      </div>
      ${linksHtml}
      <button class="btn btn-g" style="font-size:.8em;padding:3px 8px;margin-top:2px" onclick="openCharLinksModal(${worldId},${c.id})">${I.plus} Link object</button>
    </div>`;
  }
  return head + html;
}

async function openWorldCharModal(worldId, id) {
  const isEdit = !!id;
  let c = null;
  if (isEdit) { const chars = await api.world.getCharacters(worldId); c = chars.find(ch => ch.id === id); }
  const picker = await colorPicker(c?.color || null);
  openModal(isEdit ? 'Edit Character' : 'New Character', `
    <div class="form-row"><label>Name *</label><input id="wcm-name" value="${x(c?.name || '')}"></div>
    <div class="form-row"><label>Symbol</label><input id="wcm-sym" value="${x(c?.symbol || '')}" placeholder="e.g. ⚔️"></div>
    <div class="form-row"><label>Color</label>${picker}</div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldChar(${worldId},${id || 'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
}

async function saveWorldChar(worldId, id) {
  const name = q('#wcm-name')?.value?.trim();
  if (!name) return toast('Name required', 'err');
  const sym = q('#wcm-sym')?.value?.trim() || null;
  const color = q('#sel-color')?.value || null;
  if (id) await api.world.updateCharacter(id, name, sym, color);
  else await api.world.createCharacter(worldId, name, sym, color);
  closeModal();
  await setWorldTab('characters');
}

async function deleteWorldChar(worldId, id) {
  if (!confirm('Delete this character?')) return;
  await api.world.deleteCharacter(id);
  closeModal();
  await setWorldTab('characters');
}

async function openCharCategoriesModal(worldId) {
  const [enabled, available] = await Promise.all([
    api.world.getCharCategories(worldId),
    api.world.getLinkableCategories(worldId, true),
  ]);
  const enabledHtml = enabled.length
    ? enabled.map(c => `<div class="li" style="display:flex;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-size:.88em">${x(c.category_name)} <span style="color:var(--t3);font-size:.85em">${x(c.project_name || '')}</span></span>
        <button class="btn btn-g btn-i" title="Remove" onclick="removeCharCategory(${worldId},${c.id})">${I.delete}</button>
      </div>`).join('')
    : `<div style="color:var(--t3);font-size:.85em;padding:6px 0">None enabled.</div>`;
  const availHtml = available.length
    ? available.map(c => `<div class="li" style="display:flex;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-size:.88em">${x(c.category_name)} <span style="color:var(--t3);font-size:.85em">${x(c.project_name || '')}</span></span>
        <button class="btn btn-g btn-i" title="Enable" onclick="addCharCategory(${worldId},${c.id})">${I.plus}</button>
      </div>`).join('')
    : `<div style="color:var(--t3);font-size:.85em;padding:6px 0">None — link more novels.</div>`;
  openModal('Character Categories', `
    <p style="color:var(--t3);font-size:.85em;margin:0 0 8px">Enable categories whose objects can be linked to characters.</p>
    <h4 style="margin:8px 0 4px">Enabled</h4>${enabledHtml}
    <h4 style="margin:12px 0 4px">Available</h4>${availHtml}
    <div class="mfoot"><button class="btn btn-g" onclick="closeModal()">Close</button></div>`);
}

async function addCharCategory(worldId, catref) {
  await api.world.addCharCategory(worldId, catref);
  await openCharCategoriesModal(worldId);
}

async function removeCharCategory(worldId, id) {
  await api.world.removeCharCategory(id);
  await openCharCategoriesModal(worldId);
}

async function openCharLinksModal(worldId, charId) {
  const available = await api.world.getLinkableCharObjects(worldId, charId);
  const availHtml = available.length
    ? `<select id="wclm-obj" style="width:100%">
        ${available.map(o => `<option value="${o.id}">${x(o.category_name || '')} / ${x(o.name)}</option>`).join('')}
      </select>
      <div class="mfoot">
        <button class="btn btn-g" onclick="closeModal()">Cancel</button>
        <button class="btn btn-p" onclick="addCharLink(${worldId},${charId})">Link</button>
      </div>`
    : `<p style="color:var(--t3)">No objects available. Enable character categories that contain objects.</p>
      <div class="mfoot"><button class="btn btn-g" onclick="closeModal()">Close</button></div>`;
  openModal('Link Object', `<div class="form-row"><label>Object</label></div>${availHtml}`);
}

async function addCharLink(worldId, charId) {
  const oid = Number(q('#wclm-obj')?.value);
  if (!oid) return;
  await api.world.addCharLink(charId, oid);
  closeModal();
  await setWorldTab('characters');
}

async function removeCharLink(worldId, linkId) {
  await api.world.removeCharLink(linkId);
  await setWorldTab('characters');
}

// ═══ Categories / Objects ════════════════════════════
async function renderWorldCats(worldId) {
  const cats = await api.world.getCategories(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openAddCategoryModal(${worldId})">${I.plus} Add Category</button>
  </div>`;
  if (!cats.length) {
    return head + `<div class="empty"><div class="ei">${I.layer}</div>
      <p style="color:var(--t3);text-align:center;max-width:280px">No categories yet. Link novels, then add their categories.</p></div>`;
  }
  S.worldCatOpen = S.worldCatOpen || new Set();
  let h = '';
  for (const cat of cats) {
    const isOpen = S.worldCatOpen.has(cat.id);
    let objsHtml = '';
    if (isOpen) {
      const objs = await api.world.getObjects(cat.id);
      objsHtml = objs.length
        ? `<div style="padding-left:14px;margin-top:4px">` + objs.map(o =>
            `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:.87em;color:var(--t2)">
              <div class="dot" style="background:${o.color_code || '#6366f1'};width:8px;height:8px"></div>
              <span style="flex:1">${o.symbol ? `<span style="margin-right:4px">${x(o.symbol)}</span>` : ''}${x(o.name)}</span>
              <button class="btn btn-g btn-i" style="padding:1px 5px;font-size:11px" title="Remove" onclick="removeWorldObject(${worldId},${o.id})">×</button>
            </div>`).join('') + `</div>`
        : `<div style="padding-left:14px;font-size:.82em;color:var(--t3);margin-top:4px">No objects.</div>`;
    }
    h += `<div style="background:var(--bg2);border-radius:6px;padding:6px 10px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1" onclick="toggleWorldCat(${worldId},${cat.id})">
          <svg style="width:8px;height:8px;flex-shrink:0;transform:rotate(${isOpen ? 90 : 0}deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span style="font-size:.9em">${x(cat.category_name)} <span style="color:var(--t3);font-size:.85em">${x(cat.project_name || '')}</span></span>
        </div>
        <button class="btn btn-g btn-i" title="Add object" onclick="openAddObjectModal(${worldId},${cat.id})">${I.plus}</button>
        <button class="btn btn-g btn-i" title="Remove category" onclick="removeWorldCategory(${worldId},${cat.id})">${I.delete}</button>
      </div>
      ${objsHtml}
    </div>`;
  }
  return head + h;
}

async function toggleWorldCat(worldId, catId) {
  S.worldCatOpen = S.worldCatOpen || new Set();
  if (S.worldCatOpen.has(catId)) S.worldCatOpen.delete(catId);
  else S.worldCatOpen.add(catId);
  await setWorldTab('categories');
}

async function openAddCategoryModal(worldId) {
  const linkable = await api.world.getLinkableCategories(worldId, false);
  if (!linkable.length) return toast('No categories available from linked novels', 'err');
  openModal('Add Category', `
    <div class="form-row"><label>Category</label>
      <select id="wac-cat" style="width:100%">
        ${linkable.map(c => `<option value="${c.id}">${x(c.category_name)} · ${x(c.project_name || '')}</option>`).join('')}
      </select>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="addWorldCategory(${worldId})">Add</button>
    </div>`);
}

async function addWorldCategory(worldId) {
  const catref = Number(q('#wac-cat')?.value);
  if (!catref) return;
  await api.world.addCategory(worldId, catref);
  closeModal();
  await setWorldTab('categories');
}

async function removeWorldCategory(worldId, id) {
  if (!confirm('Remove this category from the world?')) return;
  await api.world.removeCategory(id);
  await setWorldTab('categories');
}

async function openAddObjectModal(worldId, wcid) {
  const linkable = await api.world.getLinkableObjects(wcid);
  if (!linkable.length) return toast('No objects available in this category', 'err');
  openModal('Add Object', `
    <div class="form-row"><label>Object</label>
      <select id="wao-obj" style="width:100%">
        ${linkable.map(o => `<option value="${o.id}">${x(o.name)}</option>`).join('')}
      </select>
    </div>
    <div class="form-row"><label>Symbol</label><input id="wao-sym" value="" placeholder="optional"></div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="addWorldObject(${worldId},${wcid})">Add</button>
    </div>`);
}

async function addWorldObject(worldId, wcid) {
  const oref = Number(q('#wao-obj')?.value);
  if (!oref) return;
  const sym = q('#wao-sym')?.value?.trim() || null;
  await api.world.addObject(wcid, oref, sym);
  S.worldCatOpen = S.worldCatOpen || new Set();
  S.worldCatOpen.add(wcid);
  closeModal();
  await setWorldTab('categories');
}

async function removeWorldObject(worldId, id) {
  await api.world.removeObject(id);
  await setWorldTab('categories');
}

// ═══ Maps ════════════════════════════════════════════
async function renderWorldMaps(worldId) {
  const maps = await api.world.getMaps(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openAddMapModal(${worldId})">${I.plus} Add Map</button>
  </div>`;
  if (!maps.length) {
    return head + `<div class="empty"><div class="ei">${I.map}</div>
      <p style="color:var(--t3);text-align:center;max-width:280px">No maps yet. Link novels, then add their maps.</p></div>`;
  }
  return head + maps.map(m => `<div class="li" style="display:flex;align-items:center;gap:8px">
    <div class="dot" style="background:${m.color_code || '#6366f1'}"></div>
    <span class="name" style="flex:1">${x(m.map_name || '(untitled map)')} <span style="color:var(--t3);font-size:.8em">${x(m.project_name || '')}</span></span>
    <button class="btn btn-g btn-i" title="Remove" onclick="removeWorldMap(${worldId},${m.id})">${I.delete}</button>
  </div>`).join('');
}

async function openAddMapModal(worldId) {
  const linkable = await api.world.getLinkableMaps(worldId);
  if (!linkable.length) return toast('No maps available from linked novels', 'err');
  openModal('Add Map', `
    <div class="form-row"><label>Map</label>
      <select id="wam-map" style="width:100%">
        ${linkable.map(m => `<option value="${m.id}">${x(m.map_name || '(untitled map)')} · ${x(m.project_name || '')}</option>`).join('')}
      </select>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="addWorldMap(${worldId})">Add</button>
    </div>`);
}

async function addWorldMap(worldId) {
  const mref = Number(q('#wam-map')?.value);
  if (!mref) return;
  await api.world.addMap(worldId, mref);
  closeModal();
  await setWorldTab('maps');
}

async function removeWorldMap(worldId, id) {
  if (!confirm('Remove this map from the world?')) return;
  await api.world.removeMap(id);
  await setWorldTab('maps');
}

// ═══ Timeline ════════════════════════════════════════
async function renderWorldTimelines(worldId) {
  const timelines = await api.world.getTimelines(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openWorldTimelineModal(${worldId})">${I.plus} New Timeline</button>
  </div>`;
  if (!timelines.length) {
    return head + `<div class="empty"><div class="ei">${I.timeline}</div>
      <p style="color:var(--t3)">No timelines yet.</p></div>`;
  }
  let h = head;
  for (const tl of timelines) {
    const events = await api.world.getEvents(tl.id);
    const evHtml = events.length
      ? `<div style="margin-top:6px;padding-left:12px">` + events.map(ev => {
          const label = `${ev.years}-${String(ev.month).padStart(2, '0')}-${String(ev.day).padStart(2, '0')} ${String(ev.hour).padStart(2, '0')}:${String(ev.minute).padStart(2, '0')}`;
          return `<div class="li" style="display:flex;align-items:center;gap:8px;padding:4px 8px">
            <span style="flex:1;font-size:.88em">${x(label)}</span>
            <button class="btn btn-g btn-i" title="Objects" onclick="openEventObjectsModal(${worldId},${ev.id})">${I.layer}</button>
            <button class="btn btn-g btn-i" title="Delete" onclick="deleteWorldEvent(${worldId},${ev.id})">${I.delete}</button>
          </div>`;
        }).join('') + `</div>`
      : `<div style="color:var(--t3);font-size:.82em;padding:4px 12px">No events yet.</div>`;
    h += `<div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-weight:500">${x(tl.name)}</span>
        <button class="btn btn-g btn-i" title="Add event" onclick="openWorldEventModal(${worldId},${tl.id})">${I.plus}</button>
        <button class="btn btn-g btn-i" title="Edit" onclick="openWorldTimelineModal(${worldId},${tl.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" title="Delete" onclick="deleteWorldTimeline(${worldId},${tl.id})">${I.delete}</button>
      </div>
      ${evHtml}
    </div>`;
  }
  return h;
}

async function openWorldTimelineModal(worldId, id) {
  const isEdit = !!id;
  const tls = await api.world.getTimelines(worldId);
  const tl = isEdit ? tls.find(t => t.id === id) : null;
  const wMaps = await api.world.getMaps(worldId);
  const mapOpts = wMaps.map(m => `<option value="${m.id}"${tl?.world_map_ref === m.id ? ' selected' : ''}>${x(m.map_name || '(untitled map)')}</option>`).join('');
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
  await setWorldTab('timeline');
}

async function deleteWorldTimeline(worldId, id) {
  if (!confirm('Delete this timeline and its events?')) return;
  await api.world.deleteTimeline(id);
  closeModal();
  await setWorldTab('timeline');
}

function openWorldEventModal(worldId, tlId) {
  openModal('New Event', `
    <div class="form-row" style="display:flex;gap:6px">
      <div style="flex:1"><label>Year</label><input id="wem-y" type="number" value="0"></div>
      <div style="flex:1"><label>Month</label><input id="wem-mo" type="number" value="1"></div>
      <div style="flex:1"><label>Day</label><input id="wem-d" type="number" value="1"></div>
    </div>
    <div class="form-row" style="display:flex;gap:6px">
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
  await setWorldTab('timeline');
}

async function deleteWorldEvent(worldId, id) {
  if (!confirm('Delete this event?')) return;
  await api.world.deleteEvent(id);
  await setWorldTab('timeline');
}

async function openEventObjectsModal(worldId, eventId) {
  const [placed, objs, chars] = await Promise.all([
    api.world.getEventObjects(eventId),
    api.world.getPlaceableObjects(worldId),
    api.world.getPlaceableCharacters(worldId),
  ]);
  const placedHtml = placed.length
    ? placed.map(p => `<div class="li" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${p.color_code || '#6366f1'}"></div>
        <span class="name" style="flex:1;font-size:.88em">${x(p.label)} ${p.x != null ? `<span style="color:var(--t3)">(${p.x}, ${p.y})</span>` : ''}</span>
        <button class="btn btn-g btn-i" title="Remove" onclick="removeEventObject(${worldId},${eventId},${p.id})">${I.delete}</button>
      </div>`).join('')
    : `<div style="color:var(--t3);font-size:.85em;padding:6px 0">Nothing placed yet.</div>`;

  const objOpts = objs.map(o => `<option value="obj:${o.id}">${x(o.name)}</option>`).join('');
  const charOpts = chars.map(c => `<option value="char:${c.id}">${x(c.name)}</option>`).join('');
  const canPlace = objs.length || chars.length;

  openModal('Event Objects', `
    <h4 style="margin:0 0 4px">Placed</h4>${placedHtml}
    <h4 style="margin:12px 0 4px">Place new</h4>
    ${canPlace ? `
    <div class="form-row"><label>Entity</label>
      <select id="weo-entity" style="width:100%">
        ${objs.length ? `<optgroup label="Objects">${objOpts}</optgroup>` : ''}
        ${chars.length ? `<optgroup label="Characters">${charOpts}</optgroup>` : ''}
      </select>
    </div>
    <div class="form-row" style="display:flex;gap:6px">
      <div style="flex:1"><label>X</label><input id="weo-x" type="number" value="0" step="any"></div>
      <div style="flex:1"><label>Y</label><input id="weo-y" type="number" value="0" step="any"></div>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Close</button>
      <button class="btn btn-p" onclick="addEventObject(${worldId},${eventId})">Place</button>
    </div>` : `<p style="color:var(--t3)">Add world objects/characters first.</p>
    <div class="mfoot"><button class="btn btn-g" onclick="closeModal()">Close</button></div>`}`);
}

async function addEventObject(worldId, eventId) {
  const val = q('#weo-entity')?.value || '';
  const [kind, idStr] = val.split(':');
  const id = Number(idStr);
  if (!id) return;
  const cx = Number(q('#weo-x')?.value) || 0;
  const cy = Number(q('#weo-y')?.value) || 0;
  const oref = kind === 'obj' ? id : null;
  const cref = kind === 'char' ? id : null;
  await api.world.addEventObject(eventId, oref, cref, cx, cy);
  await openEventObjectsModal(worldId, eventId);
}

async function removeEventObject(worldId, eventId, id) {
  await api.world.removeEventObject(id);
  await openEventObjectsModal(worldId, eventId);
}
