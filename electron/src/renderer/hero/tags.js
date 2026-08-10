// The Game Tags submodule — mirrors Director's project tags.
// ═══ SUBMODULE: GAME TAGS (mirrors Director project tags) ═══
async function renderHeroTags() {
  const g = S.game;
  const tags = await api.game.getUsedTags(g.id);
  let lh = `<div class="ph"><h4>${t('gameTags')}</h4></div>`;
  if (tags.length) {
    lh += tags.map(tg => {
      const col = tg.color_code || '#6366f1';
      const act = S.gameTagId === tg.id;
      return `<div class="li ${act ? 'active' : ''}" onclick="selectGameTag(${tg.id})">
        <span class="hn" style="color:${col};font-weight:700">#${x(tg.tag_name)}</span>
      </div>`;
    }).join('');
  } else {
    lh += `<div class="empty" style="padding:20px 10px"><p style="font-size:calc(12px * var(--fsc,1));color:var(--t3);text-align:center">-</p></div>`;
  }
  q('#left-panel-inner').innerHTML = lh;

  if (!S.gameTagId || !tags.find(tg => tg.id === S.gameTagId)) {
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px"><div class="ei">${I.hashtag}</div><h3>${t('gameTags')}</h3></div>`;
    return;
  }
  const tag = tags.find(tg => tg.id === S.gameTagId);
  const [chars, elems] = await Promise.all([
    api.game.getCharsByTag(S.gameTagId, g.id),
    api.game.getElementsByTag(S.gameTagId, g.id),
  ]);
  const col = tag?.color_code || '#6366f1';
  const total = chars.length + elems.length;
  let h = `<div class="ch"><span class="hn" style="color:${col};font-size:1.4em;font-weight:700">#${x(tag?.tag_name || '')}</span>
    <span style="font-size:calc(12px * var(--fsc,1));color:var(--t3);margin-left:8px">${total}</span></div>`;
  if (!total) {
    h += `<div class="empty"><div class="ei">${I.hashtag}</div></div>`;
  } else {
    if (chars.length) {
      h += `<div style="padding:4px 16px 2px;font-size:calc(11px * var(--fsc,1));color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">${t('gameChars')} (${chars.length})</div><div class="objlist">`;
      for (const c of chars) {
        h += `<div class="objrow" onclick="setGameTab('project').then(()=>selectGameChar(${c.id}))">
          <div class="odot" style="background:${c.color_code || '#6366f1'}"></div><span class="oname">${x(c.name)}</span>
        </div>`;
      }
      h += `</div>`;
    }
    if (elems.length) {
      h += `<div style="padding:4px 16px 2px;font-size:calc(11px * var(--fsc,1));color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">${t('gameCollections')} (${elems.length})</div><div class="objlist">`;
      for (const e of elems) {
        h += `<div class="objrow">
          <div class="odot" style="background:${e.color_code || '#6366f1'}"></div>
          <div style="flex:1;min-width:0"><div class="oname">${x(e.name)}</div>
          <div style="font-size:calc(12px * var(--fsc,1));color:var(--t3)">${x(e.collection_name)}</div></div>
        </div>`;
      }
      h += `</div>`;
    }
  }
  q('#main-inner').innerHTML = h;
}

async function selectGameTag(tagId) {
  S.gameTagId = tagId;
  await renderHeroTags();
}

