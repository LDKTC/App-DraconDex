// Navigator (legacy World module) — entry point, world selection and tab
// routing. FIRST file of the navigator/ group: it owns WORLD_TABS, the only
// top-level const here. The group is lazy-loaded together by loadGroup()
// (src/renderer/core/views.js), which awaits all files before rendering.
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

