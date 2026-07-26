// The Navigator left sidebar — world list, per-world novel folders and their
// character categories (Director-style tree).
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

