// Hero (legacy Game module) — entry point, tab routing and the game list.
// FIRST file of the hero/ group, which is lazy-loaded as a set by loadGroup()
// (src/renderer/core/views.js); it awaits every file before rendering.
// Hero module (v2.6) — game projects with 4 submodules on the nav rail:
// project (characters + collections; the Hero rail button itself), novel link,
// story graph, and game tags. See Plan.md.

// ═══ ENTRY / ROUTING ══════════════════════════════════
async function renderHeroView() {
  S.view = 'hero';
  S.activeModule = 'hero';
  if (!S.game) { await renderGameList(); updateTopNavButton(); return; }
  if (S.gameTab === 'novel')      await renderHeroNovel();
  else if (S.gameTab === 'story') await renderHeroStory();
  else if (S.gameTab === 'tags')  await renderHeroTags();
  else                            await renderHeroProject();
  updateTopNavButton();
}

async function setGameTab(tab) {
  if (!S.game) return;
  S.gameTab = tab;
  await renderHeroView();
}

function goToGameList() {
  S.game = null; S.gameTab = 'project';
  S.gameView = 'chars'; S.gameColId = null; S.gameCharId = null; S.gameElemId = null;
  S.gameCatId = null; S.gameStoryId = null; S.gameDialId = null; S.gameTagId = null; S.gameEdgeFrom = null;
  renderHeroView();
}

async function selectGame(id) {
  S.game = await api.game.get(id);
  S.gameTab = 'project'; S.gameView = 'chars';
  S.gameColId = null; S.gameCharId = null; S.gameElemId = null;
  S.gameCatId = null; S.gameStoryId = null; S.gameDialId = null; S.gameTagId = null; S.gameEdgeFrom = null;
  if (S.game) upsertEntityTab(S.game, 'game', 'hero');
  await renderHeroView();
}

// ═══ GAME LIST (no game selected) ═════════════════════
async function renderGameList() {
  const games = await api.game.getAll(S.nexus?.id ?? null);
  let h = `<div class="ph"><h4>${t('hero')}</h4>
    <button class="btn btn-g btn-i" onclick="openGameModal()" title="${t('gameNew')}">${I.plus}</button>
  </div>`;
  if (!games.length) {
    h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.hero}</div><p>${t('gameNew')}</p></div>`;
  } else {
    for (const g of games) {
      const col = g.color_code || '#6366f1';
      h += `<div class="li" onclick="selectGame(${g.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(g.name)}${g.codename ? ` <span style="color:var(--t3);font-size:.8em">· ${x(g.codename)}</span>` : ''}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openGameModal(${g.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = h;
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.hero}</div><h3>${t('hero')}</h3><p>${t('nexusWelcomeText')}</p></div>`;
}

