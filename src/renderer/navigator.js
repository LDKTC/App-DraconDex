// Navigator module (v2.5.2 "World") — cross-novel world-building.
// Worlds aggregate data from linked novels: characters, categories/objects,
// maps and a dated timeline. Mirrors the Director UX (left list + tabbed detail).
// Reduced to 3 destinations, each a static `.navigator-only` nav-rail button in
// index.html (data-worldtab="original"|"chars-cats"|"maps-timeline"). 'chars-cats' and
// 'maps-timeline' each fold two of the old 5 tabs together (see setWorldCharCatSub /
// the map-timeline board below).
const WORLD_TABS = ['original', 'chars-cats', 'maps-timeline', 'tags'];

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
  const worlds = await api.world.getAll(S.nexus?.id ?? null);
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
  S.worldCharCatSub = S.worldCharCatSub || 'characters';
  S.worldActiveTimelineId = null;
  S.worldActiveEventId = null;
  S.worldHashtagId = null;
  S.worldMapSelectedId = null;
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
  S.worldCharCatSub = S.worldCharCatSub || 'characters';
  if (!WORLD_TABS.includes(S.worldTab)) S.worldTab = 'original';
  // Render main first so it can resolve the default selected original category,
  // then render the sidebar so its highlight matches.
  await renderWorldMain();
  await renderWorldSidebar(world);
}

// ═══ Left sidebar (Director-style) ═══════════════════════
// Sidebar content is scoped to the active tab rather than always showing
// everything: 'original' -> World Origin Categories + Details only,
// 'chars-cats' -> Linked Novels only, 'maps-timeline' -> its own Map/Timeline picker.
async function renderWorldSidebar(world) {
  const w = world;
  if (!w) return;
  if (S.worldTab === 'maps-timeline') {
    await renderWorldMapsSidebar(w);
    return;
  }
  const col = w.color_code || '#6366f1';

  let h = `<div class="project-side-head">
    <div class="project-side-title">
      <span class="dot" style="background:${col}"></span>
      <span class="name">${x(w.name)}</span>
      <button class="btn btn-g btn-i" onclick="openWorldModal(${w.id})" title="Edit world">${I.edit}</button>
    </div>
    ${w.codename ? `<div class="project-side-code">${x(w.codename)}</div>` : ''}
  </div>`;

  if (S.worldTab === 'tags') {
    // ── Used tags (mirror of Director's project-hashtag sidebar) ──
    const tags = await api.world.getAllUsedTags(w.id);
    h += `<div class="ph compact"><h4>${t('worldTags')}</h4></div>`;
    if (tags.length) {
      h += tags.map(tg => {
        const tc = tg.color_code || '#6366f1';
        const act = S.worldHashtagId === tg.id;
        return `<div class="li ${act ? 'active' : ''}" onclick="selectWorldHashtag(${tg.id})">
          <span class="hn" style="color:${tc};font-weight:700">#${x(tg.tag_name)}</span>
        </div>`;
      }).join('');
    } else {
      h += `<div class="empty project-side-empty"><p>No tags used in this world yet</p></div>`;
    }
  } else if (S.worldTab === 'chars-cats') {
    const novels = await api.world.getNovels(w.id);
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
  } else {
    const [origCats, descs] = await Promise.all([
      api.world.origCat.getAll(w.id),
      api.world.desc.getAll(w.id),
    ]);
    const memo = w.memo || '';

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
  }

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

  // The 'maps-timeline' tab skips this generic world-name header entirely — its own
  // #world-tab-body header (timeline name, from renderWorldMapTimelineBoard) sits in
  // its place instead, so there's only ever one header stacked at the top of #main-inner.
  let h = S.worldTab === 'maps-timeline' ? '' : `<div class="ch">
    <div class="cdot" style="background:${col}"></div><h2>${x(w.name)}</h2>
    ${w.codename ? `<span class="tag">${x(w.codename)}</span>` : ''}
    <span style="color:var(--t3);font-size:.85em;margin-left:4px">· ${x(worldTabLabel(S.worldTab))}</span>
    <button class="btn btn-s btn-i" onclick="openWorldModal(${w.id})">${I.edit}</button>
    ${S.worldTab === 'original' ? `<button class="btn btn-p" onclick="openWorldOrigCatModal()" style="padding:6px 12px;font-size:calc(12.5px * var(--fsc,1))">${I.plus} Category</button>` : ''}
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
  } else if (S.worldTab === 'chars-cats') {
    const sub = S.worldCharCatSub === 'categories' ? 'categories' : 'characters';
    const body = sub === 'characters' ? await renderWorldChars(w.id) : await renderWorldCats(w.id);
    const hint = sub === 'characters'
      ? 'World characters are separate from novel objects — create one here, then use the link button to connect it to a character from a linked novel.'
      : 'These categories mirror the object categories of your linked novels. Add one from the left panel to browse its objects here.';
    h += `<div id="world-tab-body">
      <div class="detail-tabs" style="margin-bottom:10px">
        <button class="tab-btn ${sub === 'characters' ? 'active' : ''}" onclick="setWorldCharCatSub('characters')">${t('worldChars')}</button>
        <button class="tab-btn ${sub === 'categories' ? 'active' : ''}" onclick="setWorldCharCatSub('categories')">${t('worldCats')}</button>
      </div>
      <div class="modal-hint">${I.info}<span>${hint}</span></div>
      ${body}
    </div>`;
    q('#main-inner').innerHTML = h;
    if (sub === 'characters') refreshCharLinkOverflow();
  } else if (S.worldTab === 'maps-timeline') {
    h += `<div id="world-tab-body"></div>`;
    q('#main-inner').innerHTML = h;
    if (S.worldActiveTimelineId) {
      await renderWorldMapTimelineBoard(w.id, S.worldActiveTimelineId);
    } else {
      q('#world-tab-body').innerHTML = `<div class="empty"><div class="ei">${I.map}</div><h3>Select a timeline</h3>
        <p style="color:var(--t3)">Pick a map from the left panel, then one of its timelines.</p></div>`;
    }
  } else if (S.worldTab === 'tags') {
    // ── World Tags detail (mirror of Director's renderProjectHashtagView) ──
    const tags = await api.world.getAllUsedTags(w.id);
    if (S.worldHashtagId && !tags.find(tg => tg.id === S.worldHashtagId)) S.worldHashtagId = null;
    if (!S.worldHashtagId) {
      h += `<div class="empty"><div class="ei">${I.hashtag}</div><h3>${t('worldTags')}</h3>
        <p style="color:var(--t3)">Select a tag to see what uses it in this world.</p></div>`;
    } else {
      const tag = tags.find(tg => tg.id === S.worldHashtagId);
      const [chars, worldTags] = await Promise.all([
        api.world.getCharactersByTag(S.worldHashtagId, w.id),
        api.world.getTags(w.id),
      ]);
      const tc = tag?.color_code || '#6366f1';
      const onWorld = worldTags.some(tg => tg.id === S.worldHashtagId);
      const total = chars.length + (onWorld ? 1 : 0);
      h += `<div class="ch"><span class="hn" style="color:${tc};font-size:1.4em;font-weight:700">#${x(tag?.tag_name || '')}</span>
        <span style="font-size:calc(12px * var(--fsc,1));color:var(--t3);margin-left:8px">${total} items</span>
      </div>`;
      if (!total) {
        h += `<div class="empty"><div class="ei">${I.hashtag}</div><h3>Nothing uses this tag yet</h3></div>`;
      } else {
        const secHead = (label) => `<div style="padding:4px 16px 2px;font-size:calc(11px * var(--fsc,1));color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">${label}</div>`;
        if (onWorld) {
          h += secHead(`${t('world')} (1)`);
          h += `<div class="objlist"><div class="objrow" onclick="openWorldModal(${w.id})">
            <div class="odot" style="background:${col}"></div>
            <div style="flex:1;min-width:0"><div class="oname">${x(w.name)}</div>
            ${w.codename ? `<div style="font-size:calc(12px * var(--fsc,1));color:var(--t3);margin-top:2px">${x(w.codename)}</div>` : ''}</div>
          </div></div>`;
        }
        if (chars.length) {
          h += secHead(`${t('worldChars')} (${chars.length})`);
          h += `<div class="objlist">`;
          for (const c of chars) {
            const cc = c.color_code || '#6366f1';
            h += `<div class="objrow" onclick="openWorldCharModal(${w.id},${c.id})">
              <div class="odot" style="background:${cc}"></div>
              <div style="flex:1;min-width:0"><div class="oname">${c.symbol ? `${x(c.symbol)} ` : ''}${x(c.name)}</div></div>
            </div>`;
          }
          h += `</div>`;
        }
      }
    }
    q('#main-inner').innerHTML = h;
  }
  updateTopNavButton();
}

async function selectWorldHashtag(tagId) {
  S.worldHashtagId = tagId;
  await renderWorldMain();
  await renderWorldSidebar(S.world);
}

async function setWorldCharCatSub(sub) {
  S.worldCharCatSub = sub;
  await renderWorldMain();
}

// Used by character/category CRUD handlers to land back on the right sub-view
// after the merged 'chars-cats' tab performs a save/delete.
async function setWorldCharCatTab(sub) {
  S.worldCharCatSub = sub;
  await setWorldTab('chars-cats');
}

function worldTabLabel(tab) {
  const map = {
    original: t('worldOrig'), 'chars-cats': t('worldCharsCats'), 'maps-timeline': t('worldMapTimelines'), tags: t('worldTags'),
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
  const wTags = isEdit ? await api.world.getTags(id) : [];
  const picker = await colorPicker(w?.color || null);
  openModal(isEdit ? 'Edit World' : 'New World', `
    <div class="form-row"><label>Codename</label><input id="wm-code" value="${x(w?.codename || '')}" placeholder="e.g. AAA"></div>
    <div class="form-row"><label>Name *</label><input id="wm-name" value="${x(w?.name || '')}" placeholder="World name"></div>
    <div class="form-row"><label>Memo</label><textarea id="wm-memo" rows="3" style="width:100%;resize:vertical">${x(w?.memo || '')}</textarea></div>
    <div class="form-row"><label>Color</label>${picker}</div>
    ${await hashtagSelector('world', wTags)}
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:8px" onclick="deleteWorld(${id})">Delete World</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorld(${id || 'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
  setTimeout(() => renderModalTagSuggestions('world'), 60);
}

async function saveWorld(id) {
  const name = q('#wm-name')?.value?.trim();
  if (!name) return toast('Name required', 'err');
  const code = q('#wm-code')?.value?.trim() || null;
  const memo = q('#wm-memo')?.value?.trim() || null;
  const color = q('#sel-color')?.value || null;
  const tags = getModalTagIds('world');
  if (id) {
    await api.world.update(id, code, name, memo, color);
    await api.world.setTags(id, tags);
    S.world = await api.world.get(id);
  } else {
    const newId = await api.world.create(code, name, memo, color, S.nexus?.id ?? null);
    if (newId) {
      await api.world.setTags(newId, tags);
      S.world = await api.world.get(newId);
    }
  }
  closeModal();
  await renderNavigatorView();
}

async function deleteWorld(id) {
  if (!await uiConfirm('Delete this world and all its data?')) return;
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
  if (!await uiConfirm('Unlink this novel from the world?')) return;
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
      <button class="btn btn-g ${view === 'list' ? 'active' : ''}" style="padding:4px 10px;font-size:calc(12px * var(--fsc,1));border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setWorldOrigCatView('list')">${I.list} List</button>
      <button class="btn btn-g ${view === 'table' ? 'active' : ''}" style="padding:4px 10px;font-size:calc(12px * var(--fsc,1));border-radius:var(--rs);display:flex;align-items:center;gap:4px" onclick="setWorldOrigCatView('table')">${I.table} Table</button>
    </div>
    <span style="font-size:calc(11px * var(--fsc,1));color:var(--t3);flex:1">${objs.length} items</span>
    <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12px * var(--fsc,1))" onclick="openWorldOrigObjectModal(${catId})">${I.plus} Add</button>
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
    h += `<div class="empty" style="padding:24px 0"><p style="font-size:calc(12px * var(--fsc,1))">No fields</p>
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
  if (!await uiConfirm('Delete category? All its objects will be removed.')) return;
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
    <p style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3);margin-bottom:10px">Fields apply to every object in this category</p>
    <div class="tlist" id="wotlist">${tmpls.map(tp => _woTmplRow(tp, safeCatId)).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:calc(12px * var(--fsc,1))">No fields</p>'}</div>
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
    if (!await uiConfirm('Delete field? All its values will be lost')) return;
    await api.world.origTmpl.delete(id);
    const tmpls = await api.world.origTmpl.getAll(catId);
    q('#wotlist').innerHTML = tmpls.map(tp => _woTmplRow(tp, catId)).join('') || '<p style="color:var(--t3);text-align:center;padding:18px;font-size:calc(12px * var(--fsc,1))">No fields</p>';
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
  if (!await uiConfirm('Delete this item?')) return;
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
    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:calc(14px * var(--fsc,1)); padding:6px 0;">
      <input type="checkbox" id="wo-col-vis-all" ${allChecked ? 'checked' : ''} onchange="toggleAllWorldOrigColumns(${catId}, this.checked)">
      <strong>Show all</strong>
    </label>
    <div style="height:1px; background:var(--border); margin:4px 0;"></div>`;
  for (const tp of tmpls) {
    const isChecked = visibleCols[tp.id] !== false;
    html += `<label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:calc(14px * var(--fsc,1)); padding:4px 0;">
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
async function delWorldDesc(id) { if (!await uiConfirm('Delete this detail?')) return; await api.world.desc.delete(id); closeModal(); await renderWorldSidebar(S.world); toast('Deleted'); }

// ═══ Characters ══════════════════════════════════════
async function renderWorldChars(worldId) {
  const chars = await api.world.getCharacters(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;align-items:center;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12px * var(--fsc,1))" onclick="openWorldCharModal(${worldId})">${I.plus} ${t('worldCharNew')}</button>
  </div>`;

  if (!chars.length) {
    return head + `<div class="empty"><div class="ei">${I.person}</div>
      <p style="color:var(--t3)">No characters yet.</p></div>`;
  }

  let html = '';
  for (const c of chars) {
    const links = await api.world.getCharLinks(c.id);
    const linksHtml = links.length
      ? `<div class="char-link-wrap">
          <div class="char-link-row" id="clr-${c.id}">${links.map(lk =>
            `<div class="char-link-chip">
              <span>${x(lk.category_name || '?')} / ${x(lk.name || '?')}</span>
              <button class="btn btn-g btn-i" title="Remove" onclick="removeCharLink(${worldId},${lk.id})">×</button>
            </div>`).join('')}</div>
          <button class="char-link-expand" id="cle-${c.id}" title="Show all" onclick="toggleCharLinks(${c.id})">▾</button>
        </div>`
      : '';
    html += `<div class="li" style="flex-direction:column;align-items:flex-start;padding:8px 10px;gap:4px">
      <div style="display:flex;width:100%;align-items:center;gap:8px">
        <div class="dot" style="background:${c.color_code || '#6366f1'}"></div>
        <button class="btn btn-g btn-i char-sym-btn" style="padding:1px 5px;font-size:calc(11px * var(--fsc,1))" title="Choose symbol" data-symbol="${x(c.symbol || '')}" onclick="event.stopPropagation();openCharSymbolModal(${worldId},${c.id},this.dataset.symbol)">${c.symbol ? x(c.symbol) : I.plus}</button>
        <span class="name" style="flex:1;font-weight:500">${x(c.name)}</span>
        <button class="btn btn-g btn-i" title="Link this character to a novel object" onclick="openCharLinksModal(${worldId},${c.id})">${I.layer}</button>
        <button class="btn btn-g btn-i" title="Tags" onclick="openWorldCharTagsModal(${worldId},${c.id})">${I.hashtag}</button>
        <button class="btn btn-g btn-i" onclick="openWorldCharModal(${worldId},${c.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteWorldChar(${worldId},${c.id})">${I.delete}</button>
      </div>
      ${linksHtml}
    </div>`;
  }
  return head + html;
}

// Each .char-link-row is clamped to one row's height by CSS (see .char-link-row
// in style.css). After the chars-cats body is in the DOM, measure which rows
// actually wrapped past that one row and only then reveal their expand button —
// short lists that already fit on one line show no button at all.
function refreshCharLinkOverflow() {
  document.querySelectorAll('.char-link-row').forEach(row => {
    if (row.classList.contains('char-link-expanded')) return;
    const btn = document.getElementById(`cle-${row.id.slice(4)}`);
    if (btn) btn.classList.toggle('show', row.scrollHeight > row.clientHeight + 2);
  });
}

function toggleCharLinks(charId) {
  const row = q(`#clr-${charId}`);
  const btn = q(`#cle-${charId}`);
  if (!row) return;
  const expanding = !row.classList.contains('char-link-expanded');
  row.classList.toggle('char-link-expanded', expanding);
  if (btn) {
    btn.textContent = expanding ? '▴' : '▾';
    btn.title = expanding ? 'Show less' : 'Show all';
    // Collapsed rows re-run the overflow check to decide whether the
    // button should still be visible at the row's original clamp height.
    if (!expanding) btn.classList.toggle('show', row.scrollHeight > row.clientHeight + 2);
    else btn.classList.add('show');
  }
}

async function openWorldCharModal(worldId, id) {
  const isEdit = !!id;
  let c = null;
  if (isEdit) { const chars = await api.world.getCharacters(worldId); c = chars.find(ch => ch.id === id); }
  const cTags = isEdit ? await api.world.getCharTags(id) : [];
  const picker = await colorPicker(c?.color || null);
  openModal(isEdit ? 'Edit Character' : 'New Character', `
    <div class="form-row"><label>Name *</label><input id="wcm-name" value="${x(c?.name || '')}"></div>
    <div class="form-row"><label>Symbol</label><input id="wcm-sym" value="${x(c?.symbol || '')}" placeholder="e.g. ⚔️"></div>
    <div class="form-row"><label>Color</label>${picker}</div>
    ${await hashtagSelector('wchar', cTags)}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldChar(${worldId},${id || 'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
  setTimeout(() => renderModalTagSuggestions('wchar'), 60);
}

async function saveWorldChar(worldId, id) {
  const name = q('#wcm-name')?.value?.trim();
  if (!name) return toast('Name required', 'err');
  const sym = q('#wcm-sym')?.value?.trim() || null;
  const color = q('#sel-color')?.value || null;
  const tags = getModalTagIds('wchar');
  if (id) {
    await api.world.updateCharacter(id, name, sym, color);
    await api.world.setCharTags(id, tags);
  } else {
    const newId = await api.world.createCharacter(worldId, name, sym, color);
    if (newId) await api.world.setCharTags(newId, tags);
  }
  closeModal();
  // Editing straight from the Tags tab stays there instead of jumping to chars-cats.
  if (S.worldTab === 'tags') { await renderWorldMain(); await renderWorldSidebar(S.world); }
  else await setWorldCharCatTab('characters');
}

async function deleteWorldChar(worldId, id) {
  if (!await uiConfirm('Delete this character?')) return;
  await api.world.deleteCharacter(id);
  closeModal();
  await setWorldCharCatTab('characters');
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
  await setWorldCharCatTab('characters');
}

async function openCharLinksModal(worldId, charId) {
  const available = await api.world.getLinkableCharObjects(worldId, charId);
  const availHtml = available.length
    ? `<div class="modal-hint">${I.info}<span>Connect this world character to an object from one of your linked novels, so they stay in sync.</span></div>
      <div class="form-row"><label>Object</label>${buildObjectPickerHtml('wclm-obj', available)}</div>
      <div class="mfoot">
        <button class="btn btn-s" onclick="closeModal()">Cancel</button>
        <button class="btn btn-p" onclick="addCharLink(${worldId},${charId})">Link</button>
      </div>`
    : `<div class="modal-hint">${I.layer}<span>No objects available. Set a category as the character category for a linked novel (${I.person} button in the sidebar).</span></div>
      <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Close</button></div>`;
  openModal('Link Character to Novel Object', availHtml);
}

// Quick tag editor for a world character — same search+add tag UI as the
// full character modal (hashtagSelector), without the rest of the form.
async function openWorldCharTagsModal(worldId, charId) {
  const chars = await api.world.getCharacters(worldId);
  const c = chars.find(ch => ch.id === charId);
  const cTags = await api.world.getCharTags(charId);
  openModal(`Tags — ${c ? x(c.name) : ''}`, `
    ${await hashtagSelector('wchartag', cTags)}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldCharTags(${worldId},${charId})">Save</button>
    </div>`);
  setTimeout(() => renderModalTagSuggestions('wchartag'), 60);
}

async function saveWorldCharTags(worldId, charId) {
  await api.world.setCharTags(charId, getModalTagIds('wchartag'));
  closeModal();
  toast('Saved', 'ok');
  if (S.worldTab === 'tags') { await renderWorldMain(); await renderWorldSidebar(S.world); }
  else await setWorldCharCatTab('characters');
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
          <span style="color:var(--t3);font-size:calc(11px * var(--fsc,1))">${objs.length}</span>
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
        <span style="color:var(--t3);font-size:calc(11px * var(--fsc,1))">${novelCount}</span>
      </div>
      <div class="np-group-items">${catInner}</div>
    </div>`;
  }
  if (!inner) inner = `<div style="padding:10px 12px;color:var(--t3);font-size:calc(13px * var(--fsc,1))">No objects available</div>`;
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
  await setWorldCharCatTab('characters');
}

async function removeCharLink(worldId, linkId) {
  if (!await uiConfirm(t('confirmRemoveLink'), { okText: t('remove'), cancelText: t('cancel') })) return;
  await api.world.removeCharLink(linkId);
  await setWorldCharCatTab('characters');
}

// ═══ Categories / Objects ════════════════════════════
async function renderWorldCats(worldId) {
  const cats = await api.world.getCategories(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12px * var(--fsc,1))" onclick="openAddCategoryModal(${worldId})">${I.plus} Add Category</button>
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
              <button class="btn btn-g btn-i" style="padding:1px 5px;font-size:calc(11px * var(--fsc,1))" title="Choose symbol" data-symbol="${x(o.symbol || '')}" onclick="event.stopPropagation();openObjectSymbolModal(${worldId},${o.id},${o.symbol_ref || 'null'},this.dataset.symbol)">${o.symbol ? x(o.symbol) : I.plus}</button>
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
  await setWorldCharCatTab('categories');
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
  await setWorldCharCatTab('categories');
}

async function removeWorldCategory(worldId, id) {
  if (!await uiConfirm('Remove this category from the world?')) return;
  await api.world.removeCategory(id);
  await setWorldCharCatTab('categories');
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
  await setWorldCharCatTab('categories');
}

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
