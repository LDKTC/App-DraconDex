// Navigator module — World/universe management
const NAV_TABS = ['overview','characters','categories','maps','maptimelines','tags'];

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
        <span class="name" style="flex:1">${x(w.name)}</span>
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
  S.worldTab = S.worldTab || 'overview';
  S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
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
  else if (S.worldTab === 'maptimelines') body = await renderWorldMapTimelines(w.id);
  else if (S.worldTab === 'tags') body = await renderWorldTagsTab(w.id);

  q('#main-inner').innerHTML = `
    <div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:12px">
      <h2 style="margin:0;font-size:1.1em">${x(w.name)} <span style="color:var(--t3);font-weight:400;font-size:.8em">· ${x(worldTabLabel(S.worldTab))}</span></h2>
      ${w.memo ? `<div style="color:var(--t3);font-size:.85em;margin-top:2px">${x(w.memo)}</div>` : ''}
    </div>
    <div id="world-tab-body">${body}</div>`;
  updateTopNavButton();
}

function worldTabLabel(tab) {
  const map = { overview: t('worldOverview'), characters: t('worldChars'), categories: t('worldCats'),
    maps: t('worldMaps'), maptimelines: t('worldMapTimelines'), tags: t('worldTags') };
  return map[tab] || tab;
}

async function setWorldTab(tab) {
  S.worldTab = tab;
  if (S.world) await renderWorldDetail(S.world.id);
}

async function renderWorldOverview(w) {
  const descs = await api.world.getDesc(w.id);
  const links = await api.world.getNovelLinks(w.id);
  const projs = await api.project.getAll();

  const descHtml = descs.length
    ? descs.map(d => `
      <div class="desc-row" style="margin-bottom:12px;background:var(--bg2);border-radius:8px;padding:10px 12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <strong style="font-size:.9em">${x(d.title||'')}</strong>
          <span style="display:flex;gap:4px">
            <button class="btn btn-g btn-i" onclick="openWorldDescModal(${w.id},${d.id})">${I.edit}</button>
            <button class="btn btn-g btn-i" onclick="deleteWorldDesc(${d.id})">${I.delete}</button>
          </span>
        </div>
        <div style="font-size:.88em;color:var(--t2);white-space:pre-wrap">${x(d.content||'')}</div>
      </div>`).join('')
    : `<div class="empty" style="padding:20px 0"><p style="color:var(--t3)">No descriptions yet.</p></div>`;

  const linkedIds = new Set(links.map(l => l.project_ref));
  const available = projs.filter(p => !linkedIds.has(p.id));
  const linksHtml = links.length
    ? links.map(l => `<div class="li" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${l.color_code||'#6366f1'}"></div>
        <span class="name" style="flex:1">${x(l.project_name)}</span>
        <button class="btn btn-g btn-i" onclick="removeWorldNovelLink(${l.id})">${I.delete}</button>
      </div>`).join('')
    : `<div style="color:var(--t3);font-size:.85em;padding:8px 0">No novels linked.</div>`;

  return `
    <section style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <h4 style="margin:0">${t('worldLinkedNovels')}</h4>
        ${available.length ? `<div style="display:flex;gap:6px;align-items:center">
          ${buildNovelPickerHtml('world-novel', null, linkedIds)}
          <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="linkWorldNovel(${w.id})">${I.plus} Link</button>
        </div>` : ''}
      </div>
      ${linksHtml}
    </section>
    <section>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <h4 style="margin:0">Descriptions</h4>
        <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openWorldDescModal(${w.id})">${I.plus} Add</button>
      </div>
      ${descHtml}
    </section>`;
}

async function renderWorldChars(worldId) {
  const [novelLinks, chars] = await Promise.all([
    api.world.getNovelLinks(worldId),
    api.world.getCharacters(worldId),
  ]);

  let filterHtml = '';
  if (novelLinks.length) {
    const rows = await Promise.all(novelLinks.map(async lk => {
      const cats = await api.category.getAll(lk.project_ref);
      const selCatId = S.worldCharCatFilter[lk.project_ref] || '';
      const opts = cats.map(c => `<option value="${c.id}"${selCatId==c.id?' selected':''}>${x(c.category_name)}</option>`).join('');
      return `<div style="display:flex;align-items:center;gap:8px;background:var(--bg2);padding:5px 10px;border-radius:6px">
        <span style="font-size:.83em;color:var(--t2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(lk.project_name)}</span>
        <select style="font-size:.83em;max-width:160px" onchange="setWorldCharCatFilter(${lk.project_ref},this.value)">
          <option value="">— category —</option>${opts}
        </select>
      </div>`;
    }));
    filterHtml = `<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">${rows.join('')}</div>`;
  }

  const addBtn = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openWorldCharModal(${worldId})">${I.plus} ${t('worldCharNew')}</button>
  </div>`;

  if (!chars.length) return filterHtml + `<div class="empty"><div class="ei">${I.person}</div>
    <button class="btn btn-p" onclick="openWorldCharModal(${worldId})">${I.plus} ${t('worldCharNew')}</button></div>`;

  let charsHtml = '';
  for (const c of chars) {
    const charLinks = await api.world.getCharLinks(c.id);
    const linksHtml = charLinks.map(lk =>
      `<div style="display:flex;align-items:center;gap:4px;font-size:.8em;color:var(--t3);padding:1px 0">
        <span style="flex:1">${x(lk.project_name||'?')} / ${x(lk.category_name||'?')} / ${x(lk.object_name||'?')}</span>
        <button class="btn btn-g btn-i" style="padding:1px 5px;font-size:11px" title="Remove link" onclick="removeWorldCharLink(${worldId},${lk.id})">×</button>
      </div>`
    ).join('');
    charsHtml += `<div class="li" style="flex-direction:column;align-items:flex-start;padding:8px 10px;gap:4px">
      <div style="display:flex;width:100%;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-weight:500">${x(c.name)}</span>
        <button class="btn btn-g btn-i" onclick="openEditWorldCharModal(${worldId},${c.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteWorldChar(${worldId},${c.id})">${I.delete}</button>
      </div>
      ${c.memo ? `<div style="font-size:.82em;color:var(--t3)">${x(c.memo)}</div>` : ''}
      ${linksHtml}
      <button class="btn btn-g" style="font-size:.8em;padding:3px 8px;margin-top:2px" onclick="openAddCharLinkModal(${worldId},${c.id})">${I.plus} Add Novel Link</button>
    </div>`;
  }
  return filterHtml + addBtn + charsHtml;
}

function setWorldCharCatFilter(projectId, categoryId) {
  S.worldCharCatFilter[projectId] = categoryId ? Number(categoryId) : null;
}

async function renderWorldCats(worldId) {
  const [charObjIds, novCats] = await Promise.all([
    api.world.getCharObjectIds(worldId),
    api.world.getLinkedNovCats(worldId),
  ]);

  if (!novCats.length) return `<div class="empty"><div class="ei">${I.layer}</div>
    <p style="color:var(--t3);font-size:.9em;max-width:280px;text-align:center">No novels linked to this world. Link novels in the Overview tab.</p></div>`;

  const byNovel = new Map();
  for (const cat of novCats) {
    if (!byNovel.has(cat.project_id)) byNovel.set(cat.project_id, {name: cat.project_name, cats: []});
    byNovel.get(cat.project_id).cats.push(cat);
  }

  let h = '';
  for (const [, proj] of byNovel) {
    h += `<div style="margin-bottom:16px">
      <div style="font-weight:600;font-size:.93em;padding:4px 0 6px;color:var(--t1);border-bottom:1px solid var(--border);margin-bottom:6px">${x(proj.name)}</div>`;
    for (const cat of proj.cats) {
      const isOpen = S.worldCatOpen.has(cat.id);
      let objsHtml = '';
      if (isOpen) {
        const objs = await api.world.getLinkedCatObjs(cat.id, charObjIds);
        if (objs.length) {
          objsHtml = `<div style="padding-left:14px;margin-top:4px">` + objs.map(o =>
            `<div style="padding:3px 0;font-size:.87em;color:var(--t2)">${o.symbol ? `<span style="margin-right:4px">${x(o.symbol)}</span>` : ''}${x(o.name)}</div>`
          ).join('') + `</div>`;
        } else {
          objsHtml = `<div style="padding-left:14px;font-size:.82em;color:var(--t3);margin-top:4px">No objects (or all linked as characters)</div>`;
        }
      }
      h += `<div style="background:var(--bg2);border-radius:6px;padding:6px 10px;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="toggleWorldCat(${worldId},${cat.id})">
          <svg style="width:8px;height:8px;flex-shrink:0;transform:rotate(${isOpen?90:0}deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span style="flex:1;font-size:.9em">${x(cat.category_name)}</span>
        </div>
        ${objsHtml}
      </div>`;
    }
    h += `</div>`;
  }
  return h;
}

async function toggleWorldCat(worldId, catId) {
  if (S.worldCatOpen.has(catId)) S.worldCatOpen.delete(catId);
  else S.worldCatOpen.add(catId);
  await setWorldTab('categories');
}

async function renderWorldMaps(worldId) {
  const maps = await api.world.getMaps(worldId);
  if (!maps.length) return `<div class="empty"><div class="ei">${I.map}</div>
    <button class="btn btn-p" onclick="openWorldMapModal(${worldId})">${I.plus} ${t('worldMapNew')}</button></div>`;

  return `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openWorldMapModal(${worldId})">${I.plus} ${t('worldMapNew')}</button>
  </div>` + maps.map(m => {
    const linkInfo = m.project_name
      ? `<span style="font-size:.8em;color:var(--t3)">${x(m.project_name)}${m.src_map_name ? ' / ' + x(m.src_map_name) : ''}${m.area_name ? ' / ' + x(m.area_name) : ''}</span>`
      : `<span style="font-size:.8em;color:var(--t3)">${t('noLink')}</span>`;
    return `<div class="li" style="flex-direction:column;align-items:flex-start;padding:8px 10px;gap:2px">
      <div style="display:flex;width:100%;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-weight:500">${x(m.name)}</span>
        <button class="btn btn-g btn-i" onclick="openWorldMapModal(${worldId},${m.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteWorldMap(${worldId},${m.id})">${I.delete}</button>
      </div>
      ${linkInfo}
      ${m.memo ? `<div style="font-size:.82em;color:var(--t3)">${x(m.memo)}</div>` : ''}
    </div>`;
  }).join('');
}

async function renderWorldMapTimelines(worldId) {
  const timelines = await api.world.getMapTimelines(worldId);
  const worldMaps = await api.world.getMaps(worldId);
  if (!timelines.length) return `<div class="empty"><div class="ei">${I.timeline}</div>
    <button class="btn btn-p" onclick="openWorldMaptlModal(${worldId})">${I.plus} ${t('worldMaptlNew')}</button></div>`;

  let h = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openWorldMaptlModal(${worldId})">${I.plus} ${t('worldMaptlNew')}</button>
  </div>`;
  for (const tl of timelines) {
    const events = await api.world.getMaptlEvents(tl.id);
    const evHtml = events.length
      ? `<div style="margin-top:6px;padding-left:12px">` + events.map((ev, i) =>
          `<div class="li" style="display:flex;align-items:center;gap:8px;padding:4px 8px">
            <span style="color:var(--t3);font-size:.75em;min-width:20px">${i+1}</span>
            <span style="flex:1;font-size:.9em">${x(ev.name)}</span>
            <button class="btn btn-g btn-i" onclick="openWorldMaptlEventModal(${tl.id},${ev.id})">${I.edit}</button>
            <button class="btn btn-g btn-i" onclick="deleteWorldMaptlEvent(${worldId},${ev.id})">${I.delete}</button>
          </div>`).join('') + `</div>`
      : `<div style="color:var(--t3);font-size:.82em;padding:4px 12px">No events yet.</div>`;
    h += `<div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-weight:500">${x(tl.name)}</span>
        ${tl.map_name ? `<span style="font-size:.8em;color:var(--t3)">${x(tl.map_name)}</span>` : ''}
        <button class="btn btn-g btn-i" onclick="openWorldMaptlEventModal(${tl.id})">${I.plus}</button>
        <button class="btn btn-g btn-i" onclick="openWorldMaptlModal(${worldId},${tl.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteWorldMaptl(${worldId},${tl.id})">${I.delete}</button>
      </div>
      ${evHtml}
    </div>`;
  }
  return h;
}

async function renderWorldTagsTab(worldId) {
  const allTags = await api.hashtag.getAll();
  const worldTags = await api.world.getTags(worldId);
  const tagIds = new Set(worldTags.map(t => t.id));
  return `<div style="margin-bottom:8px">
    <h4 style="margin:0 0 8px">${t('worldTags')}</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${allTags.map(tag => {
        const col = tag.color_code || '#6366f1';
        const sel = tagIds.has(tag.id);
        return `<span class="tag-chip${sel?' selected':''}" style="cursor:pointer;border:2px solid ${col};color:${col};padding:3px 10px;border-radius:99px;font-size:.82em;font-weight:700;background:${sel?col+'22':'transparent'}"
          onclick="toggleWorldTag(${worldId},${tag.id},${sel})">#${x(tag.tag_name)}</span>`;
      }).join('')}
    </div>
    ${!allTags.length ? '<p style="color:var(--t3)">No tags created yet. Add tags in the Tags panel.</p>' : ''}
  </div>`;
}

// ═══ MODAL OPENERS ═══════════════════════════════════

function openWorldModal(id) {
  const isEdit = !!id;
  const w = isEdit ? S.world : null;
  openModal(isEdit ? 'Edit World' : 'New World', `
    <div class="form-row"><label>Name *</label><input id="wm-name" value="${x(w?.name||'')}" placeholder="World name"></div>
    <div class="form-row"><label>Memo</label><textarea id="wm-memo" rows="3" style="width:100%;resize:vertical">${x(w?.memo||'')}</textarea></div>
    <div class="form-row"><label>Color</label><div id="wm-color-pick"></div></div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:8px" onclick="deleteWorld(${id})">Delete World</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorld(${id||'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
  if (w?.color_ref) colorPicker('wm-color-pick', w.color_ref, 'wm-selected-color');
  else colorPicker('wm-color-pick', null, 'wm-selected-color');
}

async function saveWorld(id) {
  const name = q('#wm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#wm-memo')?.value?.trim() || null;
  const colorRef = q('#wm-selected-color')?.dataset?.colorId || null;
  if (id) {
    await api.world.update(id, name, memo, colorRef);
    S.world = await api.world.get(id);
  } else {
    const r = await api.world.create(name, memo, colorRef);
    if (r?.lastInsertRowid) S.world = await api.world.get(r.lastInsertRowid);
  }
  closeModal();
  await renderNavigatorView();
}

async function deleteWorld(id) {
  if (!confirm('Delete this world and all its data?')) return;
  await api.world.delete(id);
  S.world = null;
  closeModal();
  await renderNavigatorView();
}

function openWorldDescModal(worldId, id) {
  const isEdit = !!id;
  openModal(isEdit ? 'Edit Description' : 'Add Description', `
    <div class="form-row"><label>Title</label><input id="wdm-title" value="" placeholder="Section title"></div>
    <div class="form-row"><label>Content</label><textarea id="wdm-content" rows="6" style="width:100%;resize:vertical"></textarea></div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldDesc(${worldId},${id||'null'})">${isEdit?'Save':'Add'}</button>
    </div>`);
  if (isEdit) {
    api.world.getDesc(worldId).then(descs => {
      const d = descs.find(d => d.id === id);
      if (d) { q('#wdm-title').value = d.title||''; q('#wdm-content').value = d.content||''; }
    });
  }
}

async function saveWorldDesc(worldId, id) {
  const title = q('#wdm-title')?.value?.trim() || '';
  const content = q('#wdm-content')?.value?.trim() || '';
  if (id) await api.world.updateDesc(id, title, content);
  else await api.world.addDesc(worldId, title, content);
  closeModal();
  await setWorldTab('overview');
}

async function deleteWorldDesc(id) {
  if (!confirm('Delete this description?')) return;
  await api.world.deleteDesc(id);
  await setWorldTab('overview');
}

async function linkWorldNovel(worldId) {
  const pid = Number(q('#np-wrap-world-novel')?.dataset.selectedId);
  if (!pid) return;
  await api.world.addNovelLink(worldId, pid);
  await setWorldTab('overview');
}

async function removeWorldNovelLink(id) {
  await api.world.removeNovelLink(id);
  await setWorldTab('overview');
}

async function openWorldCharModal(worldId) {
  const links = await api.world.getNovelLinks(worldId);
  const pickerHtml = buildLinkedNovelPicker('wcm-proj', links.map(l => ({
    id: l.project_ref, name: l.project_name,
    folder_id: (S.projects||[]).find(p => p.id===l.project_ref)?.folder_id,
  })), null, 'loadWorldCharCatOptsFromPicker');

  openModal('New Character', `
    <div class="form-row"><label>Name *</label><input id="wcm-name" value=""></div>
    <div class="form-row"><label>Memo</label><textarea id="wcm-memo" rows="2" style="width:100%;resize:vertical"></textarea></div>
    <div class="form-row"><label>${t('worldCharLink')}</label>${pickerHtml}</div>
    <div id="wcm-cat-row" style="display:none" class="form-row"><label>Category</label>
      <select id="wcm-cat" onchange="loadWorldCharObjOpts()"><option value="">—</option></select>
    </div>
    <div id="wcm-obj-row" style="display:none" class="form-row"><label>Object</label>
      <select id="wcm-obj"><option value="">—</option></select>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldChar(${worldId})">Create</button>
    </div>`);
}

async function openEditWorldCharModal(worldId, id) {
  const chars = await api.world.getCharacters(worldId);
  const c = chars.find(ch => ch.id === id);
  openModal('Edit Character', `
    <div class="form-row"><label>Name *</label><input id="wcm-name" value="${x(c?.name||'')}"></div>
    <div class="form-row"><label>Memo</label><textarea id="wcm-memo" rows="2" style="width:100%;resize:vertical">${x(c?.memo||'')}</textarea></div>
    <button class="btn btn-danger" style="margin-top:4px" onclick="deleteWorldChar(${worldId},${id})">Delete</button>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="updateWorldChar(${worldId},${id})">Save</button>
    </div>`);
}

async function openAddCharLinkModal(worldId, charId) {
  const links = await api.world.getNovelLinks(worldId);
  const pickerHtml = buildLinkedNovelPicker('aclm-proj', links.map(l => ({
    id: l.project_ref, name: l.project_name,
    folder_id: (S.projects||[]).find(p => p.id===l.project_ref)?.folder_id,
  })), null, 'loadAddCharLinkCatOpts');

  openModal('Add Novel Link', `
    <div class="form-row"><label>Novel</label>${pickerHtml}</div>
    <div id="aclm-cat-row" style="display:none" class="form-row"><label>Category</label>
      <select id="aclm-cat" onchange="loadAddCharLinkObjOpts()"><option value="">—</option></select>
    </div>
    <div id="aclm-obj-row" style="display:none" class="form-row"><label>Object</label>
      <select id="aclm-obj"><option value="">—</option></select>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveAddCharLink(${worldId},${charId})">Add Link</button>
    </div>`);
}

window.loadWorldCharCatOptsFromPicker = async function(projId) {
  const pid = Number(projId);
  const catRow = q('#wcm-cat-row');
  const objRow = q('#wcm-obj-row');
  if (!pid) { if(catRow) catRow.style.display='none'; if(objRow) objRow.style.display='none'; return; }
  const cats = await api.category.getAll(pid);
  q('#wcm-cat').innerHTML = `<option value="">—</option>` + cats.map(c => `<option value="${c.id}">${x(c.category_name)}</option>`).join('');
  if(catRow) catRow.style.display='';
  if(objRow) objRow.style.display='none';
};

window.loadAddCharLinkCatOpts = async function(projId) {
  const pid = Number(projId);
  const catRow = q('#aclm-cat-row');
  const objRow = q('#aclm-obj-row');
  if (!pid) { if(catRow) catRow.style.display='none'; if(objRow) objRow.style.display='none'; return; }
  const cats = await api.category.getAll(pid);
  q('#aclm-cat').innerHTML = `<option value="">—</option>` + cats.map(c => `<option value="${c.id}">${x(c.category_name)}</option>`).join('');
  if(catRow) catRow.style.display='';
  if(objRow) objRow.style.display='none';
};

async function loadWorldCharObjOpts() {
  const cid = Number(q('#wcm-cat')?.value);
  const objRow = q('#wcm-obj-row');
  if (!cid) { if(objRow) objRow.style.display='none'; return; }
  const objs = await api.object.getAll(cid);
  q('#wcm-obj').innerHTML = `<option value="">—</option>` + objs.map(o => `<option value="${o.id}">${x(o.name)}</option>`).join('');
  if(objRow) objRow.style.display='';
}

async function loadAddCharLinkObjOpts() {
  const cid = Number(q('#aclm-cat')?.value);
  const objRow = q('#aclm-obj-row');
  if (!cid) { if(objRow) objRow.style.display='none'; return; }
  const objs = await api.object.getAll(cid);
  q('#aclm-obj').innerHTML = `<option value="">—</option>` + objs.map(o => `<option value="${o.id}">${x(o.name)}</option>`).join('');
  if(objRow) objRow.style.display='';
}

async function saveWorldChar(worldId) {
  const name = q('#wcm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#wcm-memo')?.value?.trim() || null;
  const r = await api.world.createCharacter(worldId, name, memo);
  const charId = r?.lastInsertRowid;
  if (charId) {
    const pid = Number(q('#np-wrap-wcm-proj')?.dataset.selectedId) || null;
    const catid = Number(q('#wcm-cat')?.value) || null;
    const oid = Number(q('#wcm-obj')?.value) || null;
    if (pid && oid) await api.world.addCharLink(charId, pid, catid, oid);
  }
  closeModal();
  await setWorldTab('characters');
}

async function updateWorldChar(worldId, id) {
  const name = q('#wcm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#wcm-memo')?.value?.trim() || null;
  await api.world.updateCharacter(id, name, memo);
  closeModal();
  await setWorldTab('characters');
}

async function saveAddCharLink(worldId, charId) {
  const pid = Number(q('#np-wrap-aclm-proj')?.dataset.selectedId) || null;
  const catid = Number(q('#aclm-cat')?.value) || null;
  const oid = Number(q('#aclm-obj')?.value) || null;
  if (!pid || !oid) return toast('Select a novel and object','err');
  await api.world.addCharLink(charId, pid, catid, oid);
  closeModal();
  await setWorldTab('characters');
}

async function removeWorldCharLink(worldId, linkId) {
  await api.world.removeCharLinkById(linkId);
  await setWorldTab('characters');
}

async function deleteWorldChar(worldId, id) {
  if (!confirm('Delete this character?')) return;
  await api.world.deleteCharacter(id);
  closeModal();
  await setWorldTab('characters');
}

async function openWorldCatModal(worldId, id) {
  const isEdit = !!id;
  const cats = isEdit ? await api.world.getCategories(worldId) : [];
  const cat = isEdit ? cats.find(c => c.id === id) : null;
  const novelLinks = await api.world.getNovelLinks(worldId);
  const currentProjName = cat?.project_name || null;
  const pickerHtml = buildLinkedNovelPicker('wcatm-proj', novelLinks.map(l => ({
    id: l.project_ref, name: l.project_name,
    folder_id: (S.projects||[]).find(p => p.id===l.project_ref)?.folder_id,
  })), currentProjName, 'loadWorldCatCatOptsFromPicker');

  openModal(isEdit ? 'Edit Category' : 'New Category', `
    <div class="form-row"><label>Name *</label><input id="wcatm-name" value="${x(cat?.name||'')}"></div>
    <div class="form-row"><label>Memo</label><textarea id="wcatm-memo" rows="2" style="width:100%;resize:vertical">${x(cat?.memo||'')}</textarea></div>
    <div class="form-row"><label>${t('worldCatLink')}</label>${pickerHtml}</div>
    <div id="wcatm-cat-row" style="display:none" class="form-row"><label>Novel Category</label>
      <select id="wcatm-cat"><option value="">—</option></select>
    </div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteWorldCat(${worldId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldCat(${worldId},${id||'null'})">${isEdit?'Save':'Create'}</button>
    </div>`);

  if (cat?.project_ref) {
    const wcatmWrap = q('#np-wrap-wcatm-proj');
    if (wcatmWrap) wcatmWrap.dataset.selectedId = cat.project_ref;
    await loadWorldCatCatOptsFromPicker(cat.project_ref);
    if (cat?.category_ref) q('#wcatm-cat').value = cat.category_ref;
  }
}

window.loadWorldCatCatOptsFromPicker = async function(projId) {
  const pid = Number(projId);
  const row = q('#wcatm-cat-row');
  if (!pid) { if(row) row.style.display='none'; return; }
  const cats = await api.category.getAll(pid);
  q('#wcatm-cat').innerHTML = `<option value="">—</option>` + cats.map(c => `<option value="${c.id}">${x(c.category_name)}</option>`).join('');
  if(row) row.style.display='';
};

async function saveWorldCat(worldId, id) {
  const name = q('#wcatm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#wcatm-memo')?.value?.trim() || null;
  const pid = Number(q('#np-wrap-wcatm-proj')?.dataset.selectedId) || null;
  const catref = Number(q('#wcatm-cat')?.value) || null;
  let catId = id;
  if (id) await api.world.updateCategory(id, name, memo);
  else { const r = await api.world.createCategory(worldId, name, memo); catId = r?.lastInsertRowid; }
  if (catId) await api.world.setCatLink(catId, pid, catref);
  closeModal();
  await setWorldTab('categories');
}

async function deleteWorldCat(worldId, id) {
  if (!confirm('Delete this category and all its objects?')) return;
  await api.world.deleteCategory(id);
  closeModal();
  await setWorldTab('categories');
}

function openWorldCatObjModal(catId, id) {
  const isEdit = !!id;
  openModal(isEdit ? 'Edit Object' : 'New Object', `
    <div class="form-row"><label>Name *</label><input id="wobjm-name" value=""></div>
    <div class="form-row"><label>Symbol / Icon</label><input id="wobjm-sym" value="" placeholder="e.g. 🏔️"></div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteWorldCatObjById(${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldCatObj(${catId},${id||'null'})">${isEdit?'Save':'Create'}</button>
    </div>`);
  if (isEdit) {
    api.world.getCatObjects(catId).then(objs => {
      const o = objs.find(o => o.id === id);
      if (o) { q('#wobjm-name').value = o.name||''; q('#wobjm-sym').value = o.symbol||''; }
    });
  }
}

async function saveWorldCatObj(catId, id) {
  const name = q('#wobjm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const sym = q('#wobjm-sym')?.value?.trim() || null;
  if (id) await api.world.updateCatObject(id, name, sym);
  else await api.world.createCatObject(catId, name, sym);
  closeModal();
  await setWorldTab('categories');
}

async function deleteWorldCatObj(worldId, id) {
  if (!confirm('Delete this object?')) return;
  await api.world.deleteCatObject(id);
  await setWorldTab('categories');
}

async function deleteWorldCatObjById(id) {
  if (!confirm('Delete this object?')) return;
  await api.world.deleteCatObject(id);
  closeModal();
  await setWorldTab('categories');
}

async function openWorldMapModal(worldId, id) {
  const isEdit = !!id;
  const maps = isEdit ? await api.world.getMaps(worldId) : [];
  const m = isEdit ? maps.find(m => m.id === id) : null;
  const projs = await api.project.getAll();
  const projOpts = projs.map(p => `<option value="${p.id}"${m?.project_ref===p.id?' selected':''}>${x(p.name)}</option>`).join('');

  openModal(isEdit ? 'Edit Map Link' : 'New Map', `
    <div class="form-row"><label>Name *</label><input id="wmapm-name" value="${x(m?.name||'')}"></div>
    <div class="form-row"><label>Memo</label><textarea id="wmapm-memo" rows="2" style="width:100%;resize:vertical">${x(m?.memo||'')}</textarea></div>
    <div class="form-row"><label>${t('worldMapLink')}</label>
      <select id="wmapm-proj" onchange="loadWorldMapOpts()">
        <option value="">— ${t('noLink')} —</option>${projOpts}
      </select>
    </div>
    <div id="wmapm-map-row" style="display:none" class="form-row"><label>Project Map</label>
      <select id="wmapm-map" onchange="loadWorldMapAreaOpts()"><option value="">—</option></select>
    </div>
    <div id="wmapm-area-row" style="display:none" class="form-row"><label>Area</label>
      <select id="wmapm-area"><option value="">—</option></select>
    </div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteWorldMap(${worldId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldMap(${worldId},${id||'null'})">${isEdit?'Save':'Create'}</button>
    </div>`);

  if (m?.project_ref) {
    await loadWorldMapOpts();
    if (m?.map_ref_src) { q('#wmapm-map').value = m.map_ref_src; await loadWorldMapAreaOpts(); }
    if (m?.area_ref) q('#wmapm-area').value = m.area_ref;
  }
}

async function loadWorldMapOpts() {
  const pid = Number(q('#wmapm-proj')?.value);
  const row = q('#wmapm-map-row');
  const arow = q('#wmapm-area-row');
  if (!pid) { row.style.display='none'; arow.style.display='none'; return; }
  const maps = await api.map.getAll(pid);
  q('#wmapm-map').innerHTML = `<option value="">—</option>` + maps.map(m => `<option value="${m.id}">${x(m.map_name)}</option>`).join('');
  row.style.display='';
  arow.style.display='none';
}

async function loadWorldMapAreaOpts() {
  const mid = Number(q('#wmapm-map')?.value);
  const row = q('#wmapm-area-row');
  if (!mid) { row.style.display='none'; return; }
  const areas = await api.map.getAreas(mid);
  q('#wmapm-area').innerHTML = `<option value="">—</option>` + areas.map(a => `<option value="${a.id}">${x(a.area_name)}</option>`).join('');
  row.style.display='';
}

async function saveWorldMap(worldId, id) {
  const name = q('#wmapm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#wmapm-memo')?.value?.trim() || null;
  const pid = Number(q('#wmapm-proj')?.value) || null;
  const msrc = Number(q('#wmapm-map')?.value) || null;
  const aref = Number(q('#wmapm-area')?.value) || null;
  let mapId = id;
  if (id) await api.world.updateMap(id, name, memo);
  else { const r = await api.world.createMap(worldId, name, memo); mapId = r?.lastInsertRowid; }
  if (mapId) await api.world.setMapLink(mapId, pid, msrc, aref);
  closeModal();
  await setWorldTab('maps');
}

async function deleteWorldMap(worldId, id) {
  if (!confirm('Delete this map?')) return;
  await api.world.deleteMap(id);
  closeModal();
  await setWorldTab('maps');
}

async function openWorldMaptlModal(worldId, id) {
  const isEdit = !!id;
  const tls = isEdit ? await api.world.getMapTimelines(worldId) : [];
  const tl = isEdit ? tls.find(t => t.id === id) : null;
  const wMaps = await api.world.getMaps(worldId);
  const mapOpts = wMaps.map(m => `<option value="${m.id}"${tl?.map_ref===m.id?' selected':''}>${x(m.name)}</option>`).join('');
  openModal(isEdit ? 'Edit Map Timeline' : 'New Map Timeline', `
    <div class="form-row"><label>Name *</label><input id="wmtm-name" value="${x(tl?.name||'')}"></div>
    <div class="form-row"><label>World Map</label>
      <select id="wmtm-map"><option value="">— none —</option>${mapOpts}</select>
    </div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteWorldMaptl(${worldId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldMaptl(${worldId},${id||'null'})">${isEdit?'Save':'Create'}</button>
    </div>`);
}

async function saveWorldMaptl(worldId, id) {
  const name = q('#wmtm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const mid = Number(q('#wmtm-map')?.value) || null;
  if (id) await api.world.updateMapTimeline(id, mid, name);
  else await api.world.createMapTimeline(worldId, mid, name);
  closeModal();
  await setWorldTab('maptimelines');
}

async function deleteWorldMaptl(worldId, id) {
  if (!confirm('Delete this timeline?')) return;
  await api.world.deleteMapTimeline(id);
  closeModal();
  await setWorldTab('maptimelines');
}

function openWorldMaptlEventModal(tlId, id) {
  const isEdit = !!id;
  openModal(isEdit ? 'Edit Event' : 'New Event', `
    <div class="form-row"><label>Name *</label><input id="wmtem-name" value=""></div>
    <div class="form-row"><label>Order</label><input id="wmtem-ord" type="number" value="0" min="0"></div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteWorldMaptlEventById(${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldMaptlEvent(${tlId},${id||'null'})">${isEdit?'Save':'Create'}</button>
    </div>`);
  if (isEdit) {
    api.world.getMaptlEvents(tlId).then(evs => {
      const ev = evs.find(e => e.id === id);
      if (ev) { q('#wmtem-name').value = ev.name||''; q('#wmtem-ord').value = ev.order_index??0; }
    });
  }
}

async function saveWorldMaptlEvent(tlId, id) {
  const name = q('#wmtem-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const ord = Number(q('#wmtem-ord')?.value) || 0;
  if (id) await api.world.updateMaptlEvent(id, name, ord);
  else await api.world.createMaptlEvent(tlId, name, ord);
  closeModal();
  await setWorldTab('maptimelines');
}

async function deleteWorldMaptlEvent(worldId, id) {
  if (!confirm('Delete this event?')) return;
  await api.world.deleteMaptlEvent(id);
  await setWorldTab('maptimelines');
}

async function deleteWorldMaptlEventById(id) {
  if (!confirm('Delete this event?')) return;
  await api.world.deleteMaptlEvent(id);
  closeModal();
  await setWorldTab('maptimelines');
}

async function toggleWorldTag(worldId, tagId, isSelected) {
  const tags = await api.world.getTags(worldId);
  let ids = tags.map(t => t.id);
  if (isSelected) ids = ids.filter(i => i !== tagId);
  else ids.push(tagId);
  await api.world.setTags(worldId, ids);
  await setWorldTab('tags');
}
