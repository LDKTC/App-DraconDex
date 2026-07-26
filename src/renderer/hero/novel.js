// The Novel Link submodule — bind a game to a Director novel and import that
// novel's category objects into the game.
// ═══ SUBMODULE: NOVEL LINK ═════════════════════════════
async function renderHeroNovel() {
  const g = S.game;
  const [link, novels] = await Promise.all([api.game.getNovelLink(g.id), api.project.getAll(null, S.nexus?.id ?? null)]);
  const pid = link?.project_ref || '';
  let lh = `<div class="ph"><h4>${t('gameNovelLink')}</h4></div>
    <div class="fg" style="padding:6px 10px;margin:0">
      <label>${t('gameSelectNovel')}</label>
      <select onchange="setHeroNovel(this.value)">
        <option value="">--</option>
        ${novels.map(p => `<option value="${p.id}" ${pid === p.id ? 'selected' : ''}>${x(p.name)}</option>`).join('')}
      </select>
    </div>`;
  if (pid) {
    const [cats, gcats] = await Promise.all([api.category.getAll(pid), api.game.getCategories(g.id)]);
    const counts = new Map(gcats.map(c => [c.category_ref, c.object_count]));
    lh += `<div class="ph" style="margin-top:8px"><h4>Categories</h4></div>`;
    if (!cats.length) {
      lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:calc(12px * var(--fsc,1));color:var(--t3);text-align:center">-</p></div>`;
    } else {
      for (const cat of cats) {
        const act = S.gameCatId === cat.id;
        const cnt = counts.get(cat.id) || 0;
        lh += `<div class="li ${act ? 'active' : ''}" onclick="selectHeroCategory(${cat.id})" style="display:flex;align-items:center;gap:8px">
          <span class="name" style="flex:1">${x(cat.category_name)}</span>
          ${cnt ? `<span class="cs-count" style="color:var(--success)">${cnt}</span>` : ''}
        </div>`;
      }
    }
  }
  q('#left-panel-inner').innerHTML = lh;

  if (pid && S.gameCatId) {
    const [objs, cats] = await Promise.all([api.game.getCategoryObjects(g.id, S.gameCatId), api.category.getAll(pid)]);
    const cat = cats.find(c => c.id === S.gameCatId);
    let h = `<div class="ch"><h2>${x(cat?.category_name || '')}</h2></div><div class="objlist">`;
    if (!objs.length) {
      h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.star}</div><p>-</p></div>`;
    } else {
      for (const o of objs) {
        const col = o.color_code || '#6366f1';
        h += `<div class="objrow">
          <div class="odot" style="background:${col}"></div>
          <span class="oname" style="flex:1">${x(o.name)}</span>
          ${o.imported_id
            ? `<button class="btn btn-d" style="padding:3px 10px;font-size:calc(11.5px * var(--fsc,1))" onclick="toggleHeroImport(${S.gameCatId},${o.id},false)">${I.delete} ${t('delete')}</button>`
            : `<button class="btn btn-p" style="padding:3px 10px;font-size:calc(11.5px * var(--fsc,1))" onclick="toggleHeroImport(${S.gameCatId},${o.id},true)">${I.plus} ${t('gameImportObj')}</button>`}
        </div>`;
      }
    }
    h += `</div>`;
    q('#main-inner').innerHTML = h;
  } else {
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei">${I.relation}</div><h3>${t('gameNovelLink')}</h3><p>${t('gameSelectNovel')}</p></div>`;
  }
}

async function setHeroNovel(pid) {
  await api.game.setNovelLink(S.game.id, pid ? Number(pid) : null);
  S.gameCatId = null;
  toast(t('saved'), 'ok');
  await renderHeroNovel();
}

async function selectHeroCategory(catId) {
  S.gameCatId = catId;
  await renderHeroNovel();
}

async function toggleHeroImport(catId, objectId, add) {
  if (add) await api.game.addCatObject(S.game.id, catId, objectId);
  else await api.game.removeCatObject(S.game.id, catId, objectId);
  await renderHeroNovel();
}

