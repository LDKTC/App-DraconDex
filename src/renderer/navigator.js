// Navigator module (v2.5.2 "World") — cross-novel world-building.
// Worlds aggregate data from linked novels: characters, categories/objects,
// maps and a dated timeline. Mirrors the Director UX (left list + tabbed detail).
const WORLD_TABS = ['original', 'characters', 'categories', 'maps', 'timeline'];

// When a world is active the navigator mirrors the Director project view:
// a rich left sidebar + a main "cat pack" work area. When no world is active
// the left panel shows the world ("navi project") list.
async function renderNavigatorView() {
  S.view = 'navigator';
  S.activeModule = 'navigator';
  if (S.world) {
    await renderWorldActive(S.world);
    updateTopNavButton();
    return;
  }
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
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.globe}</div>
    <h3>${t('navigator')}</h3>
    <p>${t('nexusWelcomeText')}</p>
  </div>`;
  updateTopNavButton();
}

async function selectWorld(id) {
  S.world = await api.world.get(id);
  S.worldTab = WORLD_TABS.includes(S.worldTab) ? S.worldTab : 'original';
  S.worldCatOpen = S.worldCatOpen || new Set();
  S.worldNovelOpen = S.worldNovelOpen || new Set();
  S.worldOrigCatView = S.worldOrigCatView || 'list';
  if (S.world) {
    const ocats = await api.world.origCat.getAll(S.world.id);
    S.worldOrigCat = ocats[0] || null;
    S.worldOrigObject = null;
    upsertEntityTab(S.world, 'world', 'navigator');
  }
  await renderNavigatorView();
}

async function renderWorldActive(world) {
  S.worldNovelOpen = S.worldNovelOpen || new Set();
  S.worldCatOpen = S.worldCatOpen || new Set();
  S.worldOrigCatView = S.worldOrigCatView || 'list';
  if (!WORLD_TABS.includes(S.worldTab)) S.worldTab = 'original';
  // Render main first so it can resolve the default selected original category,
  // then render the sidebar so its highlight matches.
  await renderWorldMain();
  await renderWorldSidebar(world);
}

// ═══ Left sidebar (Director-style) ═══════════════════════
async function renderWorldSidebar(world) {
  const w = world;
  if (!w) return;
  const col = w.color_code || '#6366f1';
  const [novels, origCats, descs] = await Promise.all([
    api.world.getNovels(w.id),
    api.world.origCat.getAll(w.id),
    api.world.desc.getAll(w.id),
  ]);
  const memo = w.memo || '';

  let h = `<div class="project-side-head">
    <div class="project-side-title">
      <button class="btn btn-g btn-i" onclick="goToNavigatorList()" title="Back to worlds">${I.return}</button>
      <span class="dot" style="background:${col}"></span>
      <span class="name">${x(w.name)}</span>
      <button class="btn btn-g btn-i" onclick="openWorldModal(${w.id})" title="Edit world">${I.edit}</button>
    </div>
    ${w.codename ? `<div class="project-side-code">${x(w.codename)}</div>` : ''}
  </div>`;

  // ── Linked Novels (folders → novel categories, with a per-novel char-cat fav) ──
  h += `<div class="ph compact"><h4>${t('worldLinkedNovels')}</h4>
    <button class="btn btn-g btn-i" onclick="openAddNovelModal(${w.id})" title="Link novel">${I.plus}</button>
  </div>`;
  if (novels.length) {
    for (const n of novels) {
      const open = S.worldNovelOpen.has(n.id);
      const ncol = n.color_code || '#6366f1';
      let catsHtml = '';
      if (open) {
        const cats = await api.category.getAll(n.project_ref);
        catsHtml = cats.length
          ? `<div class="fchildren">` + cats.map(c => {
              const active = n.char_category_ref === c.id;
              const cc = c.color_code || '#6366f1';
              return `<div class="li" style="display:flex;align-items:center;gap:6px">
                <button class="char-fav${active ? ' active' : ''}" title="Set as the character category for this novel" onclick="event.stopPropagation();toggleNovelCharCat(${n.id},${c.id})">${I.person}</button>
                <div class="dot" style="background:${cc}"></div>
                <span class="name" style="flex:1">${x(c.category_name)}</span>
              </div>`;
            }).join('') + `</div>`
          : `<div class="fchildren"><div class="empty project-side-empty"><p>No categories</p></div></div>`;
      }
      h += `<div class="folder-sec">
        <div class="fhead" onclick="toggleWorldNovelFolder(${n.id})">
          <svg class="ftgl ${open ? 'open' : ''}" style="width:8px;height:8px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span style="color:${ncol};margin-right:6px;display:flex;align-items:center;">${I.folder}</span>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(n.name)}</span>
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();removeWorldNovel(${n.id})" title="Unlink" style="color:var(--danger)">${I.delete}</button>
        </div>
        ${catsHtml}
      </div>`;
    }
  } else {
    h += `<div class="empty project-side-empty"><p>No novels linked</p></div>`;
  }

  // ── Original Categories (world-owned, selectable → main area) ──
  h += `<div class="ph compact"><h4>${t('worldOrigCats')}</h4>
    <button class="btn btn-g btn-i" onclick="openWorldOrigCatModal()" title="New category">${I.plus}</button>
  </div>`;
  if (origCats.length) {
    h += origCats.map(c => {
      const cc = c.color_code || '#6366f1';
      const act = S.worldOrigCat?.id === c.id && S.worldTab === 'original';
      return `<div class="li ${act ? 'active' : ''}" onclick="selectWorldOrigCat(${c.id})">
        <div class="dot" style="background:${cc}"></div><span class="name">${x(c.category_name)}</span>
        <div class="acts">
          <button class="btn btn-g btn-i" onclick="event.stopPropagation();openWorldOrigCatModal(${c.id})">${I.edit}</button>
        </div>
      </div>`;
    }).join('');
  } else {
    h += `<div class="empty project-side-empty"><p>No categories</p></div>`;
  }

  // ── World Details (mirror of Director's project-description) ──
  h += `<div class="ph compact project-detail-ph"><h4>${t('worldDetails')}</h4>
    <button class="btn btn-g btn-i" onclick="openWorldDescModal()" title="Add detail">${I.plus}</button>
  </div>
  <div class="project-detail-list">`;
  if (memo) {
    h += `<div class="project-detail-item" onclick="openWorldModal(${w.id})"><span class="dk">Memo</span><span class="dv">${x(memo)}</span></div>`;
  }
  h += descs.length
    ? descs.map(d => `<div class="project-detail-item" onclick="openWorldDescModal(${d.id})">
        <span class="dk">${x(d.attribute_name || 'Detail')}</span>
        <span class="dv">${x(d.attribute_text || '')}</span>
      </div>`).join('')
    : (!memo ? `<div class="empty project-side-empty"><p>No details</p></div>` : '');
  h += `</div>`;

  q('#left-panel-inner').innerHTML = h;
}

async function toggleWorldNovelFolder(novelId) {
  S.worldNovelOpen = S.worldNovelOpen || new Set();
  if (S.worldNovelOpen.has(novelId)) S.worldNovelOpen.delete(novelId);
  else S.worldNovelOpen.add(novelId);
  await renderWorldSidebar(S.world);
}

// Exactly one category per linked novel may be the "character category".
// Clicking the active one clears it.
async function toggleNovelCharCat(worldNovelId, categoryId) {
  const novels = await api.world.getNovels(S.world.id);
  const n = novels.find(nn => nn.id === worldNovelId);
  const next = (n && n.char_category_ref === categoryId) ? null : categoryId;
  await api.world.setNovelCharCat(worldNovelId, next);
  await renderWorldSidebar(S.world);
}

// ═══ Main work area (Director-style header + tabs) ═══════
async function renderWorldMain() {
  const w = S.world;
  if (!w) return;
  const col = w.color_code || '#6366f1';

  let h = `<div class="ch">
    <div class="cdot" style="background:${col}"></div><h2>${x(w.name)}</h2>
    ${w.codename ? `<span class="tag">${x(w.codename)}</span>` : ''}
    <span style="color:var(--t3);font-size:.85em;margin-left:4px">· ${x(worldTabLabel(S.worldTab))}</span>
    <button class="btn btn-s btn-i" onclick="openWorldModal(${w.id})">${I.edit}</button>
    ${S.worldTab === 'original' ? `<button class="btn btn-p" onclick="openWorldOrigCatModal()" style="padding:6px 12px;font-size:12.5px">${I.plus} Category</button>` : ''}
  </div>`;

  if (S.worldTab === 'original') {
    const cats = await api.world.origCat.getAll(w.id);
    if (!cats.length) {
      h += `<div class="empty"><div class="ei">${I.pin}</div><h3>No categories</h3>
        <p>Add an original category for this world</p>
        <button class="btn btn-p" onclick="openWorldOrigCatModal()">${I.plus} Add Category</button></div>`;
      q('#main-inner').innerHTML = h;
    } else {
      if (!S.worldOrigCat || !cats.find(c => c.id === S.worldOrigCat.id)) S.worldOrigCat = cats[0];
      h += `<div id="world-cat-body"></div>`;
      q('#main-inner').innerHTML = h;
      await renderWorldOrigCatBody(S.worldOrigCat.id);
    }
  } else {
    let body = '';
    if (S.worldTab === 'characters') body = await renderWorldChars(w.id);
    else if (S.worldTab === 'categories') body = await renderWorldCats(w.id);
    else if (S.worldTab === 'maps') body = await renderWorldMaps(w.id);
    else if (S.worldTab === 'timeline') body = await renderWorldTimelines(w.id);
    h += `<div id="world-tab-body">${body}</div>`;
    q('#main-inner').innerHTML = h;
  }
  updateTopNavButton();
}

function worldTabLabel(tab) {
  const map = {
    original: t('worldOrig'), characters: t('worldChars'),
    categories: t('worldCats'), maps: t('worldMaps'), timeline: t('worldTimeline'),
  };
  return map[tab] || tab;
}

async function setWorldTab(tab) {
  S.worldTab = tab;
  if (S.world) { await renderWorldMain(); await renderWorldSidebar(S.world); }
}

async function selectWorldOrigCat(id) {
  const cats = await api.world.origCat.getAll(S.world.id);
  S.worldOrigCat = cats.find(c => c.id === id) || null;
  S.worldOrigObject = null;
  S.worldTab = 'original';
  await renderWorldSidebar(S.world);
  await renderWorldMain();
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

// ═══ Linked novels (added from the sidebar, like Director's "add category") ══
async function openAddNovelModal(worldId) {
  const [novels, linkable] = await Promise.all([
    api.world.getNovels(worldId),
    api.world.getLinkableProjects(worldId),
  ]);
  if (!linkable.length) return toast('All novels are already linked', 'err');
  const linkedIds = new Set(novels.map(n => n.project_ref));
  openModal('Link Novel', `
    <div class="form-row"><label>Novel</label>${buildNovelPickerHtml('wln-novel', null, linkedIds)}</div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="addWorldNovel(${worldId})">Link</button>
    </div>`);
}

async function addWorldNovel(worldId) {
  const pid = Number(q('#np-wrap-wln-novel')?.dataset.selectedId);
  if (!pid) return toast('Select a novel', 'err');
  await api.world.addNovel(worldId, pid);
  closeModal();
  await renderWorldSidebar(S.world);
}

async function removeWorldNovel(id) {
  if (!confirm('Unlink this novel from the world?')) return;
  await api.world.removeNovel(id);
  await renderWorldSidebar(S.world);
}

// ═══ World-owned ("original") cat pack — mirrors Director's renderCatBody ════
function setWorldOrigCatView(view) { S.worldOrigCatView = view; if (S.worldOrigCat) renderWorldOrigCatBody(S.worldOrigCat.id); }

async function renderWorldOrigCatBody(catId) {
  const el = q('#world-cat-body'); if (!el) return;
  const objs = await api.world.origObj.getAll(catId);
  const view = S.worldOrigCatView || 'list';

  let h = `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div class="view-toggles" style="display:flex;background:var(--surface);padding:3px;border-radius:var(--r);border:1px solid var(--border)">
      <button class="btn btn-g ${view === 'list' ? 'active' : ''}" style="padding:4px 10px;font-size:12px;border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setWorldOrigCatView('list')">${I.list} List</button>
      <button class="btn btn-g ${view === 'table' ? 'active' : ''}" style="padding:4px 10px;font-size:12px;border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setWorldOrigCatView('table')">${I.table} Table</button>
    </div>
    <span style="font-size:11px;color:var(--t3);flex:1">${objs.length} items</span>
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openWorldOrigObjectModal(${catId})">${I.plus} Add</button>
    <button class="btn btn-s btn-i" onclick="openWorldOrigTemplateModal(${catId})" title="Manage Fields">${I.fields}</button>
  </div>`;

  if (view === 'table') {
    const tmpls = await api.world.origTmpl.getAll(catId);
    const attrMap = {};
    for (const o of objs) {
      const attrs = await api.world.origObj.getAttrs(o.id);
      attrMap[o.id] = {};
      for (const a of attrs) attrMap[o.id][a.id] = a.attribute_value ?? '';
    }
    const visColKey = `worldVisibleCols_${catId}`;
    let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
    if (Object.keys(visibleCols).length === 0) visibleCols = tmpls.reduce((acc, tp) => ({ ...acc, [tp.id]: true }), {});

    h += `<div style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openWorldOrigColVisModal(${catId})">${I.settings} Columns</button>
    </div>`;
    h += `<div class="table-container">`;
    if (!objs.length) {
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>No data</p></div>`;
    } else {
      h += `<div class="table-wrapper"><table class="dark-table"><thead><tr><th onclick="sortTable(${catId},'name')"><div class="sortable-header">Name <span class="sort-indicator">▲</span></div></th>`;
      for (const tp of tmpls) {
        const visible = visibleCols[tp.id] ? '' : 'display:none';
        h += `<th style="${visible}" onclick="sortTable(${catId},${tp.id})" data-template-id="${tp.id}"><div class="sortable-header">${x(tp.description)} <span class="sort-indicator">▲</span></div></th>`;
      }
      h += `<th style="width:80px;text-align:center">Manage</th></tr></thead><tbody>`;
      for (const o of objs) {
        const ocol = o.color_code || '#6366f1', act = S.worldOrigObject?.id === o.id;
        h += `<tr class="objrow ${act ? 'active' : ''}" id="worow-${o.id}" onclick="selectWorldOrigObject(${o.id})" data-sort-name="${x(o.name).toLowerCase()}">
          <td><div style="display:flex;align-items:center;gap:8px">
            <div class="odot" style="background:${ocol}"></div>
            <input class="table-inline-input wo-name-input" data-oid="${o.id}" data-color="${o.color ?? ''}" value="${x(o.name)}">
          </div></td>`;
        for (const tp of tmpls) {
          const val = attrMap[o.id]?.[tp.id] ?? '';
          const visible = visibleCols[tp.id] ? '' : 'display:none';
          h += `<td style="${visible}" data-template-id="${tp.id}" data-sort-value="${x(val).toLowerCase()}"><input class="table-inline-input wo-attr-input" data-oid="${o.id}" data-tid="${tp.id}" value="${x(val)}"></td>`;
        }
        h += `<td><div style="display:flex;gap:4px;justify-content:center" onclick="event.stopPropagation()">
          <button class="btn btn-g btn-i" onclick="openWorldOrigObjectModal(null,${o.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="delWorldOrigObject(${o.id})" style="color:var(--danger)">${I.delete}</button>
        </div></td></tr>`;
      }
      h += `</tbody></table></div>`;
    }
    h += `</div>`;
  } else {
    h += `<div class="split"><div><div class="objlist" id="wo-objlist">`;
    if (!objs.length) {
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>No data</p></div>`;
    } else {
      for (const o of objs) {
        const ocol = o.color_code || '#6366f1', act = S.worldOrigObject?.id === o.id;
        h += `<div class="objrow ${act ? 'active' : ''}" id="worow-${o.id}" onclick="selectWorldOrigObject(${o.id})">
          <div class="odot" style="background:${ocol}"></div><span class="oname">${x(o.name)}</span>
        </div>`;
      }
    }
    h += `</div></div><div id="wo-detail-panel">${S.worldOrigObject ? '' : worldOrigEmptyDetail()}</div></div>`;
  }

  el.innerHTML = h;
  if (view === 'table') bindWorldOrigTableInlineEditors();
  else if (S.worldOrigObject) await renderWorldOrigDetail(S.worldOrigObject.id);
}

function bindWorldOrigTableInlineEditors() {
  const onEnterBlur = (input, saveFn) => {
    input.dataset.prev = input.value.trim();
    const commit = async () => {
      const newVal = input.value.trim();
      if (newVal === input.dataset.prev) return;
      await saveFn(newVal);
      input.dataset.prev = newVal;
      flashSaved(input);
    };
    input.addEventListener('blur', () => commit().catch(() => toast('Save failed', 'err')));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  };
  document.querySelectorAll('.wo-name-input').forEach(input => {
    input.addEventListener('click', e => e.stopPropagation());
    onEnterBlur(input, async newName => {
      const oid = +input.dataset.oid, color = input.dataset.color ? +input.dataset.color : null;
      if (!newName) return;
      await api.world.origObj.update(oid, newName, color);
    });
  });
  document.querySelectorAll('.wo-attr-input').forEach(input => {
    input.addEventListener('click', e => e.stopPropagation());
    onEnterBlur(input, async newVal => {
      await api.world.origObj.upsertAttr(+input.dataset.oid, +input.dataset.tid, newVal);
    });
  });
}

function worldOrigEmptyDetail() { return `<div class="empty" style="padding:50px 20px"><div class="ei">${I.search}</div><p>Select an item to view details</p></div>`; }

async function selectWorldOrigObject(id) {
  S.worldOrigObject = await api.world.origObj.get(id);
  document.querySelectorAll('.objrow').forEach(r => r.classList.remove('active'));
  const row = q(`#worow-${id}`); if (row) row.classList.add('active');
  await renderWorldOrigDetail(id);
}

async function buildWorldOrigDetail(oid) {
  const obj = await api.world.origObj.get(oid);
  const attrs = await api.world.origObj.getAttrs(oid);
  const col = obj.color_code || '#6366f1';
  const note = obj.note || '';
  let h = `<div class="odetail">
    <div class="dhead">
      <div class="odot" style="background:${col};width:11px;height:11px"></div>
      <span class="dtitle">${x(obj.name)}</span>
      <button class="btn btn-g btn-i" onclick="openWorldOrigObjectModal(null,${obj.id})">${I.edit}</button>
      <button class="btn btn-g btn-i" onclick="delWorldOrigObject(${obj.id})" style="color:var(--danger)">${I.delete}</button>
    </div>
    <div class="detail-content">
    <div class="attrs" id="woaf-${oid}">`;
  if (!attrs.length) {
    h += `<div class="empty" style="padding:24px 0"><p style="font-size:12px">No fields</p>
      <button class="btn btn-s" style="display:flex;align-items:center;gap:4px" onclick="openWorldOrigTemplateModal(${S.worldOrigCat.id})">${I.fields} Manage Fields</button></div>`;
  } else {
    for (const a of attrs) {
      const val = a.attribute_value || '', uid = `woai-${oid}-${a.id}`;
      h += `<div class="aitem"><label>${x(a.description)}</label>`;
      if (a.attribute_type === 'textarea') h += `<textarea id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="auto-expand wo-detail-attr-field" oninput="autoExpandTextarea(this)">${x(val)}</textarea>`;
      else h += `<input type="${a.attribute_type === 'number' ? 'number' : 'text'}" id="${uid}" data-tid="${a.id}" data-oid="${oid}" class="wo-detail-attr-field" value="${x(val)}">`;
      h += `</div>`;
    }
  }
  h += `</div>
    <div class="note-section">
      <label style="display:flex;align-items:center;gap:4px"><span class="icon" style="width:12px;height:12px">${I.edit}</span> Note</label>
      <textarea class="note-textarea auto-expand wo-detail-note-field" id="wonote-${oid}" data-oid="${oid}" placeholder="Additional notes for this item..." oninput="autoExpandTextarea(this)">${x(note)}</textarea>
    </div>
    </div>
  </div>`;
  return h;
}

async function renderWorldOrigDetail(oid) {
  const panel = q('#wo-detail-panel'); if (!panel) return;
  panel.innerHTML = await buildWorldOrigDetail(oid);
  setTimeout(() => { panel.querySelectorAll('.auto-expand').forEach(ta => autoExpandTextarea(ta)); }, 0);
  bindWorldOrigDetailAutoSave(oid);
}

function bindWorldOrigDetailAutoSave(oid) {
  const onBlurSave = (el, saveFn) => {
    el.dataset.prev = el.value;
    const commit = async () => {
      if (el.value === el.dataset.prev) return;
      await saveFn(el.value);
      el.dataset.prev = el.value;
      flashSaved(el);
    };
    el.addEventListener('blur', () => commit().catch(() => toast('Save failed', 'err')));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' && el.tagName !== 'TEXTAREA') { e.preventDefault(); el.blur(); } });
  };
  document.querySelectorAll('.wo-detail-attr-field').forEach(el => {
    onBlurSave(el, async newVal => { await api.world.origObj.upsertAttr(+el.dataset.oid, +el.dataset.tid, newVal); });
  });
  const noteEl = q(`.wo-detail-note-field`);
  if (noteEl) onBlurSave(noteEl, async newVal => { await api.world.origObj.updateNote(+noteEl.dataset.oid, newVal.trim()); });
}

// ── Original category modal ──
async function openWorldOrigCatModal(id = null) {
  if (!S.world) return;
  let cat = null;
  if (id) { const cats = await api.world.origCat.getAll(S.world.id); cat = cats.find(c => c.id === id); }
  const picker = await colorPicker(cat?.color);
  openModal(cat ? 'Edit Category' : 'New Category', `
    <div class="fg"><label>Name *</label><input id="wocn" value="${x(cat?.category_name || '')}"></div>
    <div class="fg"><label>Color</label>${picker}</div>
    <div class="mfoot">${cat ? `<button class="btn btn-d" onclick="delWorldOrigCat(${id})">Delete</button>` : ''}<button class="btn btn-s" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="${cat ? 'saveWorldOrigCat(' + id + ')' : 'createWorldOrigCat()'}">${cat ? 'Save' : 'Create'}</button></div>`);
  setTimeout(() => q('#wocn')?.focus(), 60);
}
async function createWorldOrigCat() {
  const n = q('#wocn').value.trim(); if (!n) return;
  await api.world.origCat.create(S.world.id, n, q('#sel-color').value || null);
  closeModal();
  const cats = await api.world.origCat.getAll(S.world.id);
  S.worldOrigCat = cats[cats.length - 1]; S.worldOrigObject = null; S.worldTab = 'original';
  await renderWorldSidebar(S.world); await renderWorldMain();
  toast('Category created', 'ok');
}
async function saveWorldOrigCat(id) {
  const n = q('#wocn').value.trim(); if (!n) return;
  await api.world.origCat.update(id, n, q('#sel-color').value || null);
  closeModal();
  const cats = await api.world.origCat.getAll(S.world.id);
  S.worldOrigCat = cats.find(c => c.id === id) || cats[0] || null;
  await renderWorldSidebar(S.world); await renderWorldMain();
  toast('Saved', 'ok');
}
async function delWorldOrigCat(id) {
  if (!confirm('Delete category? All its objects will be removed.')) return;
  await api.world.origCat.delete(id);
  closeModal();
  const cats = await api.world.origCat.getAll(S.world.id);
  S.worldOrigCat = cats[0] || null; S.worldOrigObject = null;
  await renderWorldSidebar(S.world); await renderWorldMain();
  toast('Deleted');
}

// ── Original template (fields) modal ──
function _woTmplRow(tp, catId) {
  return `<div class="titem" id="wotmpl-${tp.id}"><span class="tname">${x(tp.description)}</span><span class="ttype">${tp.attribute_type}</span><button class="btn btn-g btn-i" onclick="delWorldOrigTemplate(${tp.id},${catId})" style="color:var(--danger)">❌</button></div>`;
}
async function openWorldOrigTemplateModal(catId) {
  const safeCatId = parseInt(catId, 10);
  if (!safeCatId) { toast('Invalid category', 'err'); return; }
  const tmpls = await api.world.origTmpl.getAll(safeCatId);
  openModal('Manage Fields', `
    <p style="font-size:11.5px;color:var(--t3);margin-bottom:10px">Fields apply to every object in this category</p>
    <div class="tlist" id="wotlist">${tmpls.map(tp => _woTmplRow(tp, safeCatId)).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:12px">No fields</p>'}</div>
    <div class="div"></div>
    <div style="display:flex;gap:8px;align-items:flex-end">
      <div class="fg" style="flex:1;margin:0"><label>Field name</label><input id="wotnew" placeholder="e.g. Age, Power"></div>
      <div class="fg" style="margin:0"><label>Type</label><select id="wottype"><option value="text">text</option><option value="textarea">textarea</option><option value="number">number</option></select></div>
      <button class="btn btn-p" onclick="addWorldOrigTemplate(${safeCatId})">+ Add</button>
    </div>`);
  setTimeout(() => q('#wotnew')?.focus(), 60);
}
async function addWorldOrigTemplate(catId) {
  try {
    const n = q('#wotnew').value.trim(); if (!n) return;
    await api.world.origTmpl.create(catId, n, q('#wottype').value);
    q('#wotnew').value = '';
    const tmpls = await api.world.origTmpl.getAll(catId);
    q('#wotlist').innerHTML = tmpls.map(tp => _woTmplRow(tp, catId)).join('');
    toast('Field added', 'ok');
  } catch (e) { toast(e.message, 'err'); console.error(e); }
}
async function delWorldOrigTemplate(id, catId) {
  try {
    if (!confirm('Delete field? All its values will be lost')) return;
    await api.world.origTmpl.delete(id);
    const tmpls = await api.world.origTmpl.getAll(catId);
    q('#wotlist').innerHTML = tmpls.map(tp => _woTmplRow(tp, catId)).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:12px">No fields</p>';
    toast('Deleted');
  } catch (e) { toast(e.message, 'err'); console.error(e); }
}

// ── Original object modal ──
async function openWorldOrigObjectModal(catId = null, objId = null) {
  const obj = objId ? await api.world.origObj.get(objId) : null;
  const picker = await colorPicker(obj?.color);
  const targetCat = catId || S.worldOrigCat?.id;
  openModal(obj ? 'Edit Item' : 'Add Item', `
    <div class="fg"><label>Name *</label><input id="won" value="${x(obj?.name || '')}"></div>
    <div class="fg"><label>Color</label>${picker}</div>
    <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="${obj ? 'saveWorldOrigObject(' + objId + ')' : 'createWorldOrigObject(' + targetCat + ')'}">${obj ? 'Save' : 'Create'}</button></div>`);
  setTimeout(() => q('#won')?.focus(), 60);
}
async function createWorldOrigObject(catId) {
  const n = q('#won').value.trim(); if (!n) return;
  const r = await api.world.origObj.create(S.world.id, catId, n, q('#sel-color').value || null);
  closeModal();
  if (r?.lastInsertRowid) S.worldOrigObject = await api.world.origObj.get(r.lastInsertRowid);
  await renderWorldOrigCatBody(catId);
  toast('Item added', 'ok');
}
async function saveWorldOrigObject(id) {
  const n = q('#won').value.trim(); if (!n) return;
  await api.world.origObj.update(id, n, q('#sel-color').value || null);
  closeModal();
  S.worldOrigObject = await api.world.origObj.get(id);
  await renderWorldOrigCatBody(S.worldOrigCat.id);
  toast('Saved', 'ok');
}
async function delWorldOrigObject(id) {
  if (!confirm('Delete this item?')) return;
  await api.world.origObj.delete(id);
  closeModal();
  if (S.worldOrigObject?.id === id) S.worldOrigObject = null;
  await renderWorldOrigCatBody(S.worldOrigCat.id);
  toast('Deleted');
}

// ── Column visibility (table view) ──
async function openWorldOrigColVisModal(catId) {
  const tmpls = await api.world.origTmpl.getAll(catId);
  const visColKey = `worldVisibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  let hasDiff = false;
  for (const tp of tmpls) { if (visibleCols[tp.id] === undefined) { visibleCols[tp.id] = true; hasDiff = true; } }
  if (hasDiff) localStorage.setItem(visColKey, JSON.stringify(visibleCols));
  const allChecked = tmpls.every(tp => visibleCols[tp.id] !== false);
  let html = `<div style="display:flex; flex-direction:column; gap:10px;">
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; padding:6px 0;">
      <input type="checkbox" id="wo-col-vis-all" ${allChecked ? 'checked' : ''} onchange="toggleAllWorldOrigColumns(${catId}, this.checked)">
      <strong>Show all</strong>
    </label>
    <div style="height:1px; background:var(--border); margin:4px 0;"></div>`;
  for (const tp of tmpls) {
    const isChecked = visibleCols[tp.id] !== false;
    html += `<label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; padding:4px 0;">
        <input type="checkbox" class="wo-col-vis-check" data-tid="${tp.id}" ${isChecked ? 'checked' : ''} onchange="toggleWorldOrigColumn(${catId}, ${tp.id}, this.checked)">
        <span>${x(tp.description)}</span></label>`;
  }
  html += `</div><div class="mfoot"><button class="btn btn-p" onclick="closeModal()">OK</button></div>`;
  openModal('Select columns', html);
}
function toggleWorldOrigColumn(catId, templateId, isChecked) {
  const visColKey = `worldVisibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  visibleCols[templateId] = isChecked;
  localStorage.setItem(visColKey, JSON.stringify(visibleCols));
  const allCheckbox = q('#wo-col-vis-all');
  if (allCheckbox) { const cbs = document.querySelectorAll('.wo-col-vis-check'); allCheckbox.checked = Array.from(cbs).every(cb => cb.checked); }
  _applyColumnVisibility(templateId, isChecked);
}
function toggleAllWorldOrigColumns(catId, isChecked) {
  const visColKey = `worldVisibleCols_${catId}`;
  let visibleCols = JSON.parse(localStorage.getItem(visColKey) || '{}');
  document.querySelectorAll('.wo-col-vis-check').forEach(cb => {
    cb.checked = isChecked;
    const tid = cb.dataset.tid;
    visibleCols[tid] = isChecked;
    _applyColumnVisibility(tid, isChecked);
  });
  localStorage.setItem(visColKey, JSON.stringify(visibleCols));
}

// ── World description (mirror of Director's project-description modal) ──
async function openWorldDescModal(id = null) {
  if (!S.world) return;
  let d = null;
  if (id) { const descs = await api.world.desc.getAll(S.world.id); d = descs.find(dd => dd.id === id); }
  openModal(d ? 'Edit Detail' : 'Add Detail', `
    <div class="fg"><label>Attribute name</label><input id="wodn" value="${x(d?.attribute_name || '')}" placeholder="e.g. Concept, Theme"></div>
    <div class="fg"><label>Text</label><textarea id="wodt" rows="4">${x(d?.attribute_text || '')}</textarea></div>
    <div class="mfoot">${d ? `<button class="btn btn-d" onclick="delWorldDesc(${id})">Delete</button>` : ''}<button class="btn btn-s" onclick="closeModal()">Cancel</button><button class="btn btn-p" onclick="${d ? 'saveWorldDesc(' + id + ')' : 'addWorldDesc()'}">${d ? 'Save' : 'Add'}</button></div>`);
  setTimeout(() => q('#wodn')?.focus(), 60);
}
async function addWorldDesc() { const n = q('#wodn').value.trim(), tx2 = q('#wodt').value.trim(); await api.world.desc.add(S.world.id, n, tx2); closeModal(); await renderWorldSidebar(S.world); toast('Added', 'ok'); }
async function saveWorldDesc(id) { const n = q('#wodn').value.trim(), tx2 = q('#wodt').value.trim(); await api.world.desc.update(id, n, tx2); closeModal(); await renderWorldSidebar(S.world); toast('Saved', 'ok'); }
async function delWorldDesc(id) { if (!confirm('Delete this detail?')) return; await api.world.desc.delete(id); closeModal(); await renderWorldSidebar(S.world); toast('Deleted'); }

// ═══ Characters ══════════════════════════════════════
async function renderWorldChars(worldId) {
  const chars = await api.world.getCharacters(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;align-items:center;margin-bottom:8px">
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
        <button class="btn btn-g btn-i char-sym-btn" style="padding:1px 5px;font-size:11px" title="Choose symbol" data-symbol="${x(c.symbol || '')}" onclick="event.stopPropagation();openCharSymbolModal(${worldId},${c.id},this.dataset.symbol)">${c.symbol ? x(c.symbol) : I.plus}</button>
        <span class="name" style="flex:1;font-weight:500">${x(c.name)}</span>
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

async function openCharSymbolModal(worldId, charId, currentSymbolText) {
  const picker = await symbolPicker('wcs-sym-ref', null, 'wcs-sym-preview', 'wcs-sym-custom');
  openModal('Choose Symbol', `
    <div class="symsel-box">
      <span class="symsel-preview" id="wcs-sym-preview">${x(currentSymbolText || '+')}</span>
      <input type="text" class="symsel-input" id="wcs-sym-custom" placeholder="Type a custom symbol..." maxlength="4" value="${x(currentSymbolText || '')}" oninput="onSymbolCustomInput('wcs-sym-ref','wcs-sym-preview',this.value)">
    </div>
    <div class="form-row"><label>Symbol</label>${picker}</div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveCharSymbol(${worldId},${charId})">Save</button>
    </div>`);
}

async function saveCharSymbol(worldId, charId) {
  const symRef = Number(q('#wcs-sym-ref')?.value) || null;
  const customText = (q('#wcs-sym-custom')?.value || '').trim();
  let symbol = customText || null;
  if (symRef) {
    const symbols = await api.world.getSymbolCollection();
    const found = symbols.find(s => s.id === symRef);
    if (found) symbol = found.glyph;
  }
  const chars = await api.world.getCharacters(worldId);
  const c = chars.find(ch => ch.id === charId);
  if (!c) return closeModal();
  await api.world.updateCharacter(charId, c.name, symbol, c.color);
  closeModal();
  await setWorldTab('characters');
}

async function openCharLinksModal(worldId, charId) {
  const available = await api.world.getLinkableCharObjects(worldId, charId);
  const availHtml = available.length
    ? `<div class="form-row"><label>Object</label>${buildObjectPickerHtml('wclm-obj', available)}</div>
      <div class="mfoot">
        <button class="btn btn-s" onclick="closeModal()">Cancel</button>
        <button class="btn btn-p" onclick="addCharLink(${worldId},${charId})">Link</button>
      </div>`
    : `<div class="modal-hint">${I.layer}<span>No objects available. Set a category as the character category for a linked novel (${I.person} button in the sidebar).</span></div>
      <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Close</button></div>`;
  openModal('Link Object', availHtml);
}

// Category→object picker — same visual style as the novel picker (.np-*),
// grouping objects by linked novel first, then by category (with the
// category's color shown as a dot) nested inside.
function buildObjectPickerHtml(pickId, objects) {
  const novelGroups = new Map();
  for (const o of (objects || [])) {
    const nk = o.project_name || '—';
    if (!novelGroups.has(nk)) novelGroups.set(nk, new Map());
    const catGroups = novelGroups.get(nk);
    const ck = o.category_name || '—';
    if (!catGroups.has(ck)) catGroups.set(ck, { color: o.category_color || '#6366f1', objs: [] });
    catGroups.get(ck).objs.push(o);
  }
  let inner = '';
  for (const [novel, catGroups] of novelGroups) {
    const novelCount = [...catGroups.values()].reduce((n, g) => n + g.objs.length, 0);
    let catInner = '';
    for (const [cat, { color, objs }] of catGroups) {
      catInner += `<div class="np-folder">
        <div class="np-folder-head" style="padding-left:22px" onclick="event.stopPropagation();toggleObjPickerGroup(this)">
          <svg class="np-caret" style="width:8px;height:8px;flex-shrink:0;transform:rotate(90deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <div class="dot" style="background:${color};width:8px;height:8px;flex-shrink:0"></div>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(cat)}</span>
          <span style="color:var(--t3);font-size:11px">${objs.length}</span>
        </div>
        <div class="np-group-items">
          ${objs.map(o => `<div class="np-item" style="padding-left:42px" onclick="event.stopPropagation();selectNovelFromPicker('${pickId}',${o.id},'${x(o.name)}')">${x(o.name)}</div>`).join('')}
        </div>
      </div>`;
    }
    inner += `<div class="np-folder">
      <div class="np-folder-head" onclick="event.stopPropagation();toggleObjPickerGroup(this)">
        <svg class="np-caret" style="width:8px;height:8px;flex-shrink:0;transform:rotate(90deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500">${x(novel)}</span>
        <span style="color:var(--t3);font-size:11px">${novelCount}</span>
      </div>
      <div class="np-group-items">${catInner}</div>
    </div>`;
  }
  if (!inner) inner = `<div style="padding:10px 12px;color:var(--t3);font-size:13px">No objects available</div>`;
  return `<div class="novel-picker" id="np-wrap-${pickId}" data-selected-id="" style="width:100%">
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button" style="width:100%;min-width:0">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">— select object —</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">${inner}</div>
  </div>`;
}

function toggleObjPickerGroup(headEl) {
  const items = headEl.nextElementSibling;
  if (!items) return;
  const hidden = items.style.display === 'none';
  items.style.display = hidden ? '' : 'none';
  const caret = headEl.querySelector('.np-caret');
  if (caret) caret.style.transform = hidden ? 'rotate(90deg)' : 'rotate(0deg)';
}

async function addCharLink(worldId, charId) {
  const oid = Number(q('#np-wrap-wclm-obj')?.dataset.selectedId);
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
    const open = S.worldCatOpen.has(cat.id);
    let objsHtml = '';
    if (open) {
      // Objects are auto-synced live from the novel's category — no manual add/remove.
      const objs = await api.world.getObjects(cat.id);
      objsHtml = objs.length
        ? `<div class="fchildren">` + objs.map(o =>
            `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:.87em;color:var(--t2)">
              <div class="dot" style="background:${o.color_code || '#6366f1'};width:8px;height:8px"></div>
              <button class="btn btn-g btn-i" style="padding:1px 5px;font-size:11px" title="Choose symbol" data-symbol="${x(o.symbol || '')}" onclick="event.stopPropagation();openObjectSymbolModal(${worldId},${o.id},${o.symbol_ref || 'null'},this.dataset.symbol)">${o.symbol ? x(o.symbol) : I.plus}</button>
              <span style="flex:1">${x(o.name)}</span>
            </div>`).join('') + `</div>`
        : `<div class="fchildren"><div style="font-size:.82em;color:var(--t3)">No objects.</div></div>`;
    }
    h += `<div class="folder-sec" style="background:var(--bg2);border-radius:6px;padding:6px 10px;margin-bottom:6px">
      <div class="fhead" style="gap:8px;padding:0;text-transform:none;font-weight:400;color:inherit" onclick="toggleWorldCatOpen(${cat.id})">
        <svg class="ftgl ${open ? 'open' : ''}" style="width:8px;height:8px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="font-size:.9em;flex:1">${x(cat.category_name)} <span style="color:var(--t3);font-size:.85em">${x(cat.project_name || '')}</span></span>
        <button class="btn btn-g btn-i" title="Remove category" onclick="event.stopPropagation();removeWorldCategory(${worldId},${cat.id})">${I.delete}</button>
      </div>
      ${objsHtml}
    </div>`;
  }
  return head + h;
}

async function toggleWorldCatOpen(catId) {
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

async function openObjectSymbolModal(worldId, objectId, currentSymbolRef, currentSymbolText) {
  const picker = await symbolPicker('wos-sym-ref', currentSymbolRef || null, 'wos-sym-preview', 'wos-sym-custom');
  openModal('Choose Symbol', `
    <div class="symsel-box">
      <span class="symsel-preview" id="wos-sym-preview">${x(currentSymbolText || '+')}</span>
      <input type="text" class="symsel-input" id="wos-sym-custom" placeholder="Type a custom symbol..." maxlength="4" value="${x(currentSymbolText || '')}" oninput="onSymbolCustomInput('wos-sym-ref','wos-sym-preview',this.value)">
    </div>
    <div class="form-row"><label>Symbol</label>${picker}</div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveObjectSymbol(${worldId},${objectId})">Save</button>
    </div>`);
}

async function saveObjectSymbol(worldId, objectId) {
  const symRef = Number(q('#wos-sym-ref')?.value) || null;
  const customText = (q('#wos-sym-custom')?.value || '').trim();
  await api.world.updateObjectSymbol(objectId, symRef, symRef ? null : (customText || null));
  closeModal();
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
  let h = '';
  for (const m of maps) {
    // Areas are auto-synced live from the novel's map — no manual add/remove.
    const areas = await api.world.getMapAreas(m.id);
    const areasHtml = areas.length
      ? `<div style="padding-left:14px;margin-top:4px">` + areas.map(a =>
          `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:.87em;color:var(--t2)">
            <div class="dot" style="background:${a.color_code || '#6366f1'};width:8px;height:8px"></div>
            <span style="flex:1">${x(a.area_name || '(untitled area)')}</span>
          </div>`).join('') + `</div>`
      : `<div style="padding-left:14px;font-size:.82em;color:var(--t3);margin-top:4px">No areas.</div>`;
    h += `<div style="background:var(--bg2);border-radius:6px;padding:6px 10px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${m.color_code || '#6366f1'}"></div>
        <span class="name" style="flex:1">${x(m.map_name || '(untitled map)')} <span style="color:var(--t3);font-size:.8em">${x(m.project_name || '')}</span></span>
        <button class="btn btn-g btn-i" title="Remove" onclick="removeWorldMap(${worldId},${m.id})">${I.delete}</button>
      </div>
      ${areasHtml}
    </div>`;
  }
  return head + h;
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
