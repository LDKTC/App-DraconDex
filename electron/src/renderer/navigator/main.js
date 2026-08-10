// The Navigator main work area: the world header, its four tabs and the
// tab/sub-tab setters that drive them.
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

