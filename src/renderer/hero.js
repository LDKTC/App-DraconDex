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
  const games = await api.game.getAll();
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

// ═══ SUBMODULE: PROJECT (characters + collections) ═════
async function renderHeroProject() {
  const g = S.game;
  const cols = await api.game.getCollections(g.id);
  const gcol = g.color_code || '#6366f1';
  let lh = `<div class="ph"><h4 style="border-left:3px solid ${gcol};padding-left:8px">${x(g.name)}</h4>
    <button class="btn btn-g btn-i" onclick="openGameModal(${g.id})" title="${t('edit')}">${I.edit}</button>
  </div>
  <div class="li ${S.gameView !== 'collection' ? 'active' : ''}" onclick="openHeroChars()" style="display:flex;align-items:center;gap:8px">
    <span style="display:flex;align-items:center">${I.person}</span>
    <span class="name" style="flex:1">${t('gameChars')}</span>
  </div>
  <div class="ph" style="margin-top:10px"><h4>${t('gameCollections')}</h4>
    <button class="btn btn-g btn-i" onclick="openCollectionModal()" title="${t('gameCollectionNew')}">${I.plus}</button>
  </div>`;
  if (!cols.length) {
    lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">${t('gameCollectionNew')}</p></div>`;
  } else {
    for (const c of cols) {
      const col = c.color_code || '#6366f1';
      const act = S.gameView === 'collection' && S.gameColId === c.id;
      lh += `<div class="li ${act ? 'active' : ''}" onclick="selectHeroCollection(${c.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(c.name)}</span>
        <span class="cs-count">${c.element_count}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openCollectionModal(${c.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = lh;

  if (S.gameView === 'collection' && S.gameColId) await renderCollectionPage();
  else await renderCharsPage();
}

async function openHeroChars() {
  S.gameView = 'chars'; S.gameColId = null;
  await renderHeroProject();
  updateTopNavButton();
}

async function selectHeroCollection(id) {
  S.gameView = 'collection'; S.gameColId = id; S.gameElemId = null;
  await renderHeroProject();
  updateTopNavButton();
}

// ─── Characters page (Director project-page layout) ───
async function renderCharsPage() {
  const g = S.game;
  const chars = await api.game.getCharacters(g.id);
  let h = `<div class="ch">
    <h2 style="display:flex;align-items:center;gap:8px">${I.person} ${t('gameChars')}</h2>
    <div style="display:flex;gap:6px">
      <button class="btn btn-s btn-i" onclick="openCharTemplatesModal()" title="${t('gameFields')}">${I.fields}</button>
      <button class="btn btn-p" style="padding:5px 11px;font-size:12.5px" onclick="openCharModal()">${I.plus} ${t('gameCharNew')}</button>
    </div>
  </div>`;
  h += `<div class="split"><div><div class="objlist">`;
  if (!chars.length) {
    h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.person}</div><p>${t('gameCharNew')}</p></div>`;
  } else {
    for (const c of chars) {
      const col = c.color_code || '#6366f1';
      const act = S.gameCharId === c.id;
      h += `<div class="objrow ${act ? 'active' : ''}" onclick="selectGameChar(${c.id})">
        <div class="odot" style="background:${col}"></div>
        <div style="flex:1;min-width:0"><div class="oname">${x(c.name)}</div>
        ${c.object_name ? `<div style="font-size:11.5px;color:var(--t3)">${x(c.category_name || '')} · ${x(c.object_name)}</div>` : ''}</div>
      </div>`;
    }
  }
  h += `</div></div><div id="detail-panel"></div></div>`;
  q('#main-inner').innerHTML = h;
  if (S.gameCharId && chars.find(c => c.id === S.gameCharId)) await renderCharDetail(S.gameCharId);
  else q('#detail-panel').innerHTML = `<div class="empty" style="margin-top:60px"><div class="ei">${I.person}</div><p>${t('gameChars')}</p></div>`;
}

async function selectGameChar(id) {
  S.gameCharId = id;
  await renderCharsPage();
}

async function renderCharDetail(charId) {
  const [chars, templates, attrs, elements, tags] = await Promise.all([
    api.game.getCharacters(S.game.id),
    api.game.getCharTemplates(S.game.id),
    api.game.getCharAttrs(charId),
    api.game.getCharElements(charId),
    api.game.getCharTags(charId),
  ]);
  const c = chars.find(ch => ch.id === charId);
  if (!c) return;
  const col = c.color_code || '#6366f1';
  let h = `<div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <h2 style="margin:0;font-size:1.05em;flex:1">${x(c.name)}</h2>
    <button class="btn btn-g btn-i" onclick="openCharModal(${c.id})" title="${t('edit')}">${I.edit}</button>
    <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameChar(${c.id})" title="${t('delete')}">${I.delete}</button>
  </div>`;
  if (c.object_name) {
    h += `<div class="project-detail-item"><span class="dk">${t('gameNovelLink')}</span><span class="dv">${x(c.category_name || '')} · ${x(c.object_name)}</span></div>`;
  }
  // element chips
  h += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0">
    <span style="font-size:11.5px;color:var(--t3);font-weight:600">${t('gameCollections')}:</span>
    ${elements.map(e => `<span class="cs-count" style="border-left:3px solid ${e.color_code || '#6366f1'}">${x(e.collection_name)} · ${x(e.name)}</span>`).join('')}
    <button class="btn btn-g btn-i" onclick="openCharElementsModal(${c.id})" title="${t('edit')}">${I.plus}</button>
  </div>`;
  // tag chips
  if (tags.length) {
    h += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">${tags.map(tg => `<span class="hn" style="color:${tg.color_code || '#6366f1'};font-weight:700;font-size:12px">#${x(tg.tag_name)}</span>`).join('')}</div>`;
  }
  h += renderAttrEditor('char', c.id, templates, attrs);
  q('#detail-panel').innerHTML = h;
}

// Shared attribute editor for characters and elements. kind: 'char' | 'elem'.
function renderAttrEditor(kind, ownerId, templates, attrs) {
  if (!templates.length) {
    return `<div class="empty" style="padding:20px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">${t('gameFields')}</p></div>`;
  }
  const byTpl = new Map();
  for (const a of attrs) {
    if (!byTpl.has(a.template_ref)) byTpl.set(a.template_ref, new Map());
    byTpl.get(a.template_ref).set(a.level, a);
  }
  let h = '';
  for (const tpl of templates) {
    const vals = byTpl.get(tpl.id) || new Map();
    h += `<div style="margin-bottom:10px">
      <div style="font-size:11.5px;color:var(--t3);font-weight:600;margin-bottom:3px">${x(tpl.attribute_name)}${tpl.levelable ? ` <span style="color:var(--accent)">· ${t('gameLevel')}</span>` : ''}</div>`;
    const levels = tpl.levelable ? [...new Set([0, ...vals.keys()])].sort((a, b) => a - b) : [0];
    for (const lv of levels) {
      const v = vals.get(lv)?.attribute_text || '';
      const inp = tpl.attribute_type === 'textarea'
        ? `<textarea class="table-inline-input" style="flex:1;min-height:48px" onchange="saveHeroAttr('${kind}',${ownerId},${tpl.id},${lv},this.value)">${x(v)}</textarea>`
        : `<input class="table-inline-input" style="flex:1" type="${tpl.attribute_type === 'num' ? 'number' : 'text'}" value="${x(v)}" onchange="saveHeroAttr('${kind}',${ownerId},${tpl.id},${lv},this.value)">`;
      h += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        ${tpl.levelable ? `<span class="cs-count" style="min-width:34px;text-align:center">Lv ${lv}</span>` : ''}
        ${inp}
        ${tpl.levelable && lv > 0 ? `<button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteHeroAttrLevel('${kind}',${ownerId},${tpl.id},${lv})" title="${t('delete')}">${I.delete}</button>` : ''}
      </div>`;
    }
    if (tpl.levelable) {
      const next = Math.max(...levels) + 1;
      h += `<button class="btn btn-g" style="padding:2px 10px;font-size:11.5px" onclick="addHeroAttrLevel('${kind}',${ownerId},${tpl.id},${next})">${I.plus} ${t('gameLevel')} ${next}</button>`;
    }
    h += `</div>`;
  }
  return h;
}

async function saveHeroAttr(kind, ownerId, tplId, level, value) {
  if (kind === 'char') await api.game.upsertCharAttr(ownerId, tplId, level, value);
  else await api.game.upsertElementAttr(ownerId, tplId, level, value);
  toast(t('saved'), 'ok');
}

async function addHeroAttrLevel(kind, ownerId, tplId, level) {
  if (kind === 'char') { await api.game.upsertCharAttr(ownerId, tplId, level, ''); await renderCharDetail(ownerId); }
  else { await api.game.upsertElementAttr(ownerId, tplId, level, ''); await renderElementDetail(ownerId); }
}

async function deleteHeroAttrLevel(kind, ownerId, tplId, level) {
  if (kind === 'char') { await api.game.deleteCharAttr(ownerId, tplId, level); await renderCharDetail(ownerId); }
  else { await api.game.deleteElementAttr(ownerId, tplId, level); await renderElementDetail(ownerId); }
}

// ─── Collection page ───
async function renderCollectionPage() {
  const cols = await api.game.getCollections(S.game.id);
  const c = cols.find(cc => cc.id === S.gameColId);
  if (!c) { S.gameView = 'chars'; return renderCharsPage(); }
  const elems = await api.game.getColElements(c.id);
  const col = c.color_code || '#6366f1';
  let h = `<div class="ch">
    <h2 style="border-left:4px solid ${col};padding-left:10px">${x(c.name)}</h2>
    <div style="display:flex;gap:6px">
      <button class="btn btn-s btn-i" onclick="openColTemplatesModal(${c.id})" title="${t('gameFields')}">${I.fields}</button>
      <button class="btn btn-p" style="padding:5px 11px;font-size:12.5px" onclick="openElementModal(${c.id})">${I.plus} ${t('gameElementNew')}</button>
    </div>
  </div>`;
  h += `<div class="split"><div><div class="objlist">`;
  if (!elems.length) {
    h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.item}</div><p>${t('gameElementNew')}</p></div>`;
  } else {
    for (const e of elems) {
      const ecol = e.color_code || '#6366f1';
      const act = S.gameElemId === e.id;
      h += `<div class="objrow ${act ? 'active' : ''}" onclick="selectHeroElement(${e.id})">
        <div class="odot" style="background:${ecol}"></div><span class="oname">${x(e.name)}</span>
      </div>`;
    }
  }
  h += `</div></div><div id="detail-panel"></div></div>`;
  q('#main-inner').innerHTML = h;
  if (S.gameElemId && elems.find(e => e.id === S.gameElemId)) await renderElementDetail(S.gameElemId);
  else q('#detail-panel').innerHTML = `<div class="empty" style="margin-top:60px"><div class="ei">${I.item}</div><p>${x(c.name)}</p></div>`;
}

async function selectHeroElement(id) {
  S.gameElemId = id;
  await renderCollectionPage();
}

async function renderElementDetail(elemId) {
  const [elems, templates, attrs, tags] = await Promise.all([
    api.game.getColElements(S.gameColId),
    api.game.getColTemplates(S.gameColId),
    api.game.getElementAttrs(elemId),
    api.game.getElementTags(elemId),
  ]);
  const e = elems.find(el => el.id === elemId);
  if (!e) return;
  const col = e.color_code || '#6366f1';
  let h = `<div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <h2 style="margin:0;font-size:1.05em;flex:1">${x(e.name)}</h2>
    <button class="btn btn-g btn-i" onclick="openElementModal(${S.gameColId},${e.id})" title="${t('edit')}">${I.edit}</button>
    <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteHeroElement(${e.id})" title="${t('delete')}">${I.delete}</button>
  </div>`;
  if (tags.length) {
    h += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">${tags.map(tg => `<span class="hn" style="color:${tg.color_code || '#6366f1'};font-weight:700;font-size:12px">#${x(tg.tag_name)}</span>`).join('')}</div>`;
  }
  h += renderAttrEditor('elem', e.id, templates, attrs);
  q('#detail-panel').innerHTML = h;
}

// ═══ SUBMODULE: NOVEL LINK ═════════════════════════════
async function renderHeroNovel() {
  const g = S.game;
  const [link, novels] = await Promise.all([api.game.getNovelLink(g.id), api.project.getAll(null)]);
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
      lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">-</p></div>`;
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
            ? `<button class="btn btn-d" style="padding:3px 10px;font-size:11.5px" onclick="toggleHeroImport(${S.gameCatId},${o.id},false)">${I.delete} ${t('delete')}</button>`
            : `<button class="btn btn-p" style="padding:3px 10px;font-size:11.5px" onclick="toggleHeroImport(${S.gameCatId},${o.id},true)">${I.plus} ${t('gameImportObj')}</button>`}
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

// ═══ SUBMODULE: STORY GRAPH ════════════════════════════
let _heroEdges = [];
async function renderHeroStory() {
  const g = S.game;
  const stories = await api.game.getStories(g.id);
  let lh = `<div class="ph"><h4>${t('gameStory')}</h4>
    <button class="btn btn-g btn-i" onclick="openGameStoryModal()" title="${t('gameStoryNew')}">${I.plus}</button>
  </div>`;
  if (!stories.length) {
    lh += `<div class="empty" style="padding:16px 10px"><div class="ei">${I.story}</div><p style="font-size:12px;color:var(--t3);text-align:center">${t('gameStoryNew')}</p></div>`;
  } else {
    for (const s of stories) {
      const col = s.color_code || '#6366f1';
      const act = S.gameStoryId === s.id;
      lh += `<div class="li ${act ? 'active' : ''}" onclick="selectGameStory(${s.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(s.name)}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openGameStoryModal(${s.id})" title="${t('edit')}">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = lh;

  const story = stories.find(s => s.id === S.gameStoryId);
  if (!story) {
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei">${I.story}</div><h3>${t('gameStory')}</h3><p>${t('gameStoryNew')}</p></div>`;
    return;
  }
  const [dialogues, edges] = await Promise.all([api.game.getDialogues(story.id), api.game.getStorylines(story.id)]);
  _heroEdges = edges;
  const scol = story.color_code || '#6366f1';
  let h = `<div class="ch" style="margin-bottom:8px">
    <h2 style="border-left:4px solid ${scol};padding-left:10px">${x(story.name)}${story.memo ? ` <span style="color:var(--t3);font-weight:400;font-size:.72em">· ${x(story.memo)}</span>` : ''}</h2>
    <div style="display:flex;gap:6px">
      <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameStoryUI(${story.id})" title="${t('delete')}">${I.delete}</button>
      <button class="btn btn-p" style="padding:5px 11px;font-size:12.5px" onclick="openGameDialogueModal(${story.id})">${I.plus} ${t('gameDialogueNew')}</button>
    </div>
  </div>
  <div style="display:flex;gap:10px;height:calc(100% - 56px);min-height:360px">
    <div id="story-graph-wrap" style="flex:1;position:relative;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div id="story-graph" style="position:relative;width:2400px;height:1600px">
        <svg id="story-edges" width="2400" height="1600" style="position:absolute;inset:0;pointer-events:none">
          <defs><marker id="hero-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--t3)"/>
          </marker></defs>
        </svg>`;
  for (const d of dialogues) {
    const dcol = d.color_code || '#6366f1';
    const act = S.gameDialId === d.id;
    h += `<div class="hero-dial-node" data-dial="${d.id}" style="position:absolute;left:${d.pos_x || 20}px;top:${d.pos_y || 20}px;min-width:130px;max-width:220px;background:var(--raised);border:1px solid ${act ? 'var(--accent)' : 'var(--border)'};border-left:4px solid ${dcol};border-radius:var(--rs);padding:6px 8px;cursor:grab;user-select:none;box-shadow:0 2px 8px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:center;gap:4px">
        <span style="font-size:.88em;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(d.name)}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();startHeroEdge(${d.id})" title="${t('gameAddEdge')}">${I.relation}</button>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openGameDialogueModal(${story.id},${d.id})" title="${t('edit')}">${I.edit}</button>
      </div>
      ${d.memo ? `<div style="font-size:.76em;color:var(--t3);margin-top:2px">${x(d.memo)}</div>` : ''}
      ${d.conv_count ? `<div style="font-size:.72em;color:var(--accent);margin-top:2px">${d.conv_count} ${t('gameConversations')}</div>` : ''}
    </div>`;
  }
  h += `</div></div>`;
  if (S.gameDialId && dialogues.find(d => d.id === S.gameDialId)) {
    h += await renderConversationPanel(S.gameDialId, dialogues);
  }
  h += `</div>`;
  q('#main-inner').innerHTML = h;
  drawHeroEdges();
  initHeroGraphInteractions(story.id);
}

async function selectGameStory(id) {
  S.gameStoryId = id; S.gameDialId = null; S.gameEdgeFrom = null;
  await renderHeroStory();
}

function drawHeroEdges() {
  const svg = q('#story-edges');
  const graph = q('#story-graph');
  if (!svg || !graph) return;
  const defs = svg.querySelector('defs').outerHTML;
  let body = '';
  for (const e of _heroEdges) {
    const fn = graph.querySelector(`[data-dial="${e.from_ref}"]`);
    const tn = graph.querySelector(`[data-dial="${e.to_ref}"]`);
    if (!fn || !tn) continue;
    const x1 = fn.offsetLeft + fn.offsetWidth / 2, y1 = fn.offsetTop + fn.offsetHeight / 2;
    const x2 = tn.offsetLeft + tn.offsetWidth / 2, y2 = tn.offsetTop + tn.offsetHeight / 2;
    const col = e.color_code || 'var(--t3)';
    body += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="1.6" marker-end="url(#hero-arrow)"/>
      <circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="6" fill="var(--surface)" stroke="${col}" stroke-width="1.4" style="pointer-events:auto;cursor:pointer" onclick="deleteStorylineEdge(${e.id})"><title>${t('delete')}</title></circle>`;
  }
  svg.innerHTML = defs + body;
}

function initHeroGraphInteractions(storyId) {
  const graph = q('#story-graph');
  if (!graph) return;
  graph.querySelectorAll('.hero-dial-node').forEach(node => {
    const id = Number(node.dataset.dial);
    let dragMoved = false;
    node.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('button')) return;
      const startX = ev.clientX, startY = ev.clientY;
      const origL = node.offsetLeft, origT = node.offsetTop;
      dragMoved = false;
      try { node.setPointerCapture(ev.pointerId); } catch (_) {}
      node.style.cursor = 'grabbing';
      const onMove = (e) => {
        const dx = e.clientX - startX, dy = e.clientY - startY;
        if (!dragMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        dragMoved = true;
        node.style.left = Math.max(0, origL + dx) + 'px';
        node.style.top = Math.max(0, origT + dy) + 'px';
        drawHeroEdges();
      };
      const onUp = async () => {
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerup', onUp);
        node.style.cursor = 'grab';
        if (dragMoved) await api.game.updateDialoguePos(id, node.offsetLeft, node.offsetTop);
      };
      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerup', onUp);
    });
    // Selection and edge completion ride the click event (fires after the
    // pointer pair), so a drag can veto it via dragMoved.
    node.addEventListener('click', async (ev) => {
      if (ev.target.closest('button') || dragMoved) return;
      if (S.gameEdgeFrom && S.gameEdgeFrom !== id) {
        await api.game.createStoryline(storyId, S.gameEdgeFrom, id, null);
        S.gameEdgeFrom = null;
        await renderHeroStory();
      } else {
        S.gameDialId = id;
        await renderHeroStory();
      }
    });
  });
}

function startHeroEdge(dialId) {
  S.gameEdgeFrom = dialId;
  toast(t('gameAddEdge'), 'ok');
}

async function deleteStorylineEdge(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.deleteStoryline(id);
  await renderHeroStory();
}

// ─── Conversations (right of the graph) ───
async function renderConversationPanel(dialId, dialogues) {
  const [convs, chars] = await Promise.all([api.game.getConversations(dialId), api.game.getCharacters(S.game.id)]);
  const d = dialogues.find(dd => dd.id === dialId);
  const charOpts = (sel) => `<option value="">--</option>` + chars.map(c => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${x(c.name)}</option>`).join('');
  let h = `<div style="width:320px;flex:none;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:8px;overflow-y:auto">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
      <span style="font-weight:600;font-size:.95em;flex:1">${x(d?.name || '')} · ${t('gameConversations')}</span>
      <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameDialogueUI(${dialId})" title="${t('delete')}">${I.delete}</button>
    </div>`;
  for (const cv of convs) {
    const col = cv.char_color || '#6366f1';
    h += `<div style="border:1px solid var(--border);border-left:3px solid ${col};border-radius:var(--rs);padding:6px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
        <span class="cs-count" style="min-width:22px;text-align:center">${cv.talk_order + 1}</span>
        <select style="flex:1;font-size:12px" onchange="saveGameConv(${cv.id},this.value,null)">${charOpts(cv.char_ref)}</select>
        <button class="btn btn-g btn-i" onclick="moveGameConv(${cv.id},-1)" title="↑">▲</button>
        <button class="btn btn-g btn-i" onclick="moveGameConv(${cv.id},1)" title="↓">▼</button>
        <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameConv(${cv.id})" title="${t('delete')}">${I.delete}</button>
      </div>
      <textarea class="table-inline-input" style="width:100%;min-height:44px;font-size:12.5px" onchange="saveGameConv(${cv.id},null,this.value)">${x(cv.talk_sentence || '')}</textarea>
    </div>`;
  }
  h += `<button class="btn btn-p" style="margin-top:2px" onclick="addGameConv(${dialId})">${I.plus} ${t('gameConvNew')}</button></div>`;
  return h;
}

async function addGameConv(dialId) {
  await api.game.createConversation(dialId, null, '');
  await renderHeroStory();
}

async function saveGameConv(id, charId, text) {
  const convs = await api.game.getConversations(S.gameDialId);
  const cv = convs.find(c => c.id === id);
  if (!cv) return;
  await api.game.updateConversation(id,
    charId !== null ? (charId ? Number(charId) : null) : cv.char_ref,
    text !== null ? text : cv.talk_sentence);
  toast(t('saved'), 'ok');
}

async function moveGameConv(id, dir) {
  await api.game.moveConversation(id, dir);
  await renderHeroStory();
}

async function deleteGameConv(id) {
  await api.game.deleteConversation(id);
  await renderHeroStory();
}

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
    lh += `<div class="empty" style="padding:20px 10px"><p style="font-size:12px;color:var(--t3);text-align:center">-</p></div>`;
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
    <span style="font-size:12px;color:var(--t3);margin-left:8px">${total}</span></div>`;
  if (!total) {
    h += `<div class="empty"><div class="ei">${I.hashtag}</div></div>`;
  } else {
    if (chars.length) {
      h += `<div style="padding:4px 16px 2px;font-size:11px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">${t('gameChars')} (${chars.length})</div><div class="objlist">`;
      for (const c of chars) {
        h += `<div class="objrow" onclick="setGameTab('project').then(()=>selectGameChar(${c.id}))">
          <div class="odot" style="background:${c.color_code || '#6366f1'}"></div><span class="oname">${x(c.name)}</span>
        </div>`;
      }
      h += `</div>`;
    }
    if (elems.length) {
      h += `<div style="padding:4px 16px 2px;font-size:11px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">${t('gameCollections')} (${elems.length})</div><div class="objlist">`;
      for (const e of elems) {
        h += `<div class="objrow">
          <div class="odot" style="background:${e.color_code || '#6366f1'}"></div>
          <div style="flex:1;min-width:0"><div class="oname">${x(e.name)}</div>
          <div style="font-size:12px;color:var(--t3)">${x(e.collection_name)}</div></div>
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

// ═══ MODALS ════════════════════════════════════════════
async function openGameModal(id = null) {
  const g = id ? await api.game.get(id) : null;
  const gTags = g ? await api.game.getTags(g.id) : [];
  openModal(g ? `${t('edit')} — ${x(g.name)}` : t('gameNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="gn" value="${x(g?.name || '')}"></div>
    <div class="fg"><label>Codename</label><input id="gcn" value="${x(g?.codename || '')}"></div>
    <div class="fg"><label>${t('memo')}</label><textarea id="gm">${x(g?.memo || '')}</textarea></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(g?.color_ref)}</div>
    ${await hashtagSelector('game', gTags)}
    <div class="mfoot">
      ${g ? `<button class="btn btn-d" onclick="deleteGameProject(${g.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveGameProject(${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => { q('#gn')?.focus(); renderModalTagSuggestions('game'); }, 60);
}

async function saveGameProject(id) {
  const n = q('#gn').value.trim(); if (!n) return;
  const cn = q('#gcn').value.trim() || null;
  const m = q('#gm').value.trim() || null;
  const c = q('#sel-color').value || null;
  let gid = id;
  if (id) await api.game.update(id, n, cn, m, c);
  else { const r = await api.game.create(n, cn, m, c); gid = r?.lastInsertRowid; }
  if (gid) await api.game.setTags(gid, getModalTagIds('game'));
  closeModal();
  toast(t('saved'), 'ok');
  if (!id && gid) { await selectGame(gid); return; }
  if (S.game && id === S.game.id) S.game = await api.game.get(id);
  await renderHeroView();
}

async function deleteGameProject(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.delete(id);
  closeModal();
  if (S.game?.id === id) goToGameList();
  else await renderHeroView();
  toast(t('deleted'), 'ok');
}

async function openCharModal(id = null) {
  const chars = id ? await api.game.getCharacters(S.game.id) : [];
  const c = id ? chars.find(ch => ch.id === id) : null;
  const [imported, cTags] = await Promise.all([
    api.game.getImportedObjects(S.game.id),
    id ? api.game.getCharTags(id) : Promise.resolve([]),
  ]);
  openModal(c ? `${t('edit')} — ${x(c.name)}` : t('gameCharNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="chn" value="${x(c?.name || '')}"></div>
    <div class="fg"><label>${t('gameNovelLink')}</label>
      <select id="chobj"><option value="">--</option>
        ${imported.map(o => `<option value="${o.id}" ${c?.object_link === o.id ? 'selected' : ''}>${x(o.category_name)} · ${x(o.name)}</option>`).join('')}
      </select></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(c?.color_ref)}</div>
    ${await hashtagSelector('gchar', cTags)}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveGameChar(${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => { q('#chn')?.focus(); renderModalTagSuggestions('gchar'); }, 60);
}

async function saveGameChar(id) {
  const n = q('#chn').value.trim(); if (!n) return;
  const ol = q('#chobj').value ? Number(q('#chobj').value) : null;
  const c = q('#sel-color').value || null;
  let cid = id;
  if (id) await api.game.updateCharacter(id, n, ol, c);
  else { const r = await api.game.createCharacter(S.game.id, n, ol, c); cid = r?.lastInsertRowid; }
  if (cid) await api.game.setCharTags(cid, getModalTagIds('gchar'));
  closeModal();
  S.gameCharId = cid;
  toast(t('saved'), 'ok');
  await renderHeroProject();
}

async function deleteGameChar(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.deleteCharacter(id);
  if (S.gameCharId === id) S.gameCharId = null;
  toast(t('deleted'), 'ok');
  await renderHeroProject();
}

async function openCharElementsModal(charId) {
  const [cols, linked] = await Promise.all([api.game.getCollections(S.game.id), api.game.getCharElements(charId)]);
  const linkedIds = new Set(linked.map(l => l.element_ref));
  let body = '';
  for (const c of cols) {
    const elems = await api.game.getColElements(c.id);
    if (!elems.length) continue;
    body += `<div style="font-size:11.5px;color:var(--t3);font-weight:600;margin:6px 0 3px">${x(c.name)}</div>`;
    body += elems.map(e => `<label style="display:flex;align-items:center;gap:8px;padding:3px 2px;cursor:pointer">
      <input type="checkbox" class="char-elem-check" value="${e.id}" ${linkedIds.has(e.id) ? 'checked' : ''}>
      <span class="dot" style="background:${e.color_code || '#6366f1'}"></span>${x(e.name)}
    </label>`).join('');
  }
  openModal(t('gameCollections'), `
    ${body || `<p style="color:var(--t3);font-size:12.5px">${t('gameCollectionNew')}</p>`}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveCharElements(${charId})">${t('save')}</button>
    </div>`);
}

async function saveCharElements(charId) {
  const ids = [...document.querySelectorAll('.char-elem-check:checked')].map(cb => Number(cb.value));
  await api.game.setCharElements(charId, ids);
  closeModal();
  toast(t('saved'), 'ok');
  await renderCharDetail(charId);
}

// Attribute-template manager, shared by characters (per game) and
// collections (per collection).
async function openHeroTemplatesModal(kind, ownerId) {
  const tpls = kind === 'char' ? await api.game.getCharTemplates(ownerId) : await api.game.getColTemplates(ownerId);
  const typeOpts = (sel) => ['text', 'num', 'textarea'].map(tp => `<option value="${tp}" ${sel === tp ? 'selected' : ''}>${tp}</option>`).join('');
  let rows = tpls.map(tp => `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
      <input style="flex:1" value="${x(tp.attribute_name)}" onchange="saveHeroTemplate('${kind}',${tp.id},this.value,null,null)">
      <select style="width:92px" onchange="saveHeroTemplate('${kind}',${tp.id},null,this.value,null)">${typeOpts(tp.attribute_type)}</select>
      <label style="display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--t3)">
        <input type="checkbox" ${tp.levelable ? 'checked' : ''} onchange="saveHeroTemplate('${kind}',${tp.id},null,null,this.checked)">${t('gameLevel')}
      </label>
      <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteHeroTemplate('${kind}',${ownerId},${tp.id})">${I.delete}</button>
    </div>`).join('');
  openModal(t('gameFields'), `
    <div id="hero-tpl-list">${rows || `<p style="color:var(--t3);font-size:12.5px">-</p>`}</div>
    <div style="display:flex;align-items:flex-end;gap:6px;margin-top:8px">
      <div class="fg" style="flex:1;margin:0"><label>${t('name')}</label><input id="htpl-name"></div>
      <select id="htpl-type" style="width:92px">${typeOpts('text')}</select>
      <label style="display:flex;align-items:center;gap:4px;font-size:11.5px;color:var(--t3)"><input type="checkbox" id="htpl-lv">${t('gameLevel')}</label>
      <button class="btn btn-p" onclick="addHeroTemplate('${kind}',${ownerId})">${I.plus}</button>
    </div>
    <div class="mfoot"><button class="btn btn-p" onclick="closeHeroTemplatesModal('${kind}')">${t('close')}</button></div>`);
  setTimeout(() => q('#htpl-name')?.focus(), 60);
}

function openCharTemplatesModal() { openHeroTemplatesModal('char', S.game.id); }
function openColTemplatesModal(colId) { openHeroTemplatesModal('elem', colId); }

async function addHeroTemplate(kind, ownerId) {
  const n = q('#htpl-name').value.trim(); if (!n) return;
  const tp = q('#htpl-type').value, lv = q('#htpl-lv').checked;
  if (kind === 'char') await api.game.createCharTemplate(ownerId, n, tp, lv);
  else await api.game.createColTemplate(ownerId, n, tp, lv);
  await openHeroTemplatesModal(kind, ownerId);
}

async function saveHeroTemplate(kind, id, name, type, levelable) {
  const tpls = kind === 'char' ? await api.game.getCharTemplates(S.game.id) : await api.game.getColTemplates(S.gameColId);
  const tp = tpls.find(tt => tt.id === id);
  if (!tp) return;
  const args = [id, name !== null ? name : tp.attribute_name, type !== null ? type : tp.attribute_type, levelable !== null ? levelable : !!tp.levelable];
  if (kind === 'char') await api.game.updateCharTemplate(...args);
  else await api.game.updateColTemplate(...args);
  toast(t('saved'), 'ok');
}

async function deleteHeroTemplate(kind, ownerId, id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  if (kind === 'char') await api.game.deleteCharTemplate(id);
  else await api.game.deleteColTemplate(id);
  await openHeroTemplatesModal(kind, ownerId);
}

async function closeHeroTemplatesModal(kind) {
  closeModal();
  if (kind === 'char') { if (S.gameCharId) await renderCharDetail(S.gameCharId); }
  else if (S.gameElemId) await renderElementDetail(S.gameElemId);
}

async function openCollectionModal(id = null) {
  const cols = await api.game.getCollections(S.game.id);
  const c = id ? cols.find(cc => cc.id === id) : null;
  openModal(c ? `${t('edit')} — ${x(c.name)}` : t('gameCollectionNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="gcoln" value="${x(c?.name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(c?.color_ref)}</div>
    <div class="mfoot">
      ${c ? `<button class="btn btn-d" onclick="deleteHeroCollection(${c.id})">${t('delete')}</button>` : ''}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveHeroCollection(${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#gcoln')?.focus(), 60);
}

async function saveHeroCollection(id) {
  const n = q('#gcoln').value.trim(); if (!n) return;
  const c = q('#sel-color').value || null;
  if (id) await api.game.updateCollection(id, n, c);
  else await api.game.createCollection(S.game.id, n, c);
  closeModal();
  toast(t('saved'), 'ok');
  await renderHeroProject();
}

async function deleteHeroCollection(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.deleteCollection(id);
  closeModal();
  if (S.gameColId === id) { S.gameColId = null; S.gameView = 'chars'; }
  toast(t('deleted'), 'ok');
  await renderHeroProject();
}

async function openElementModal(colId, id = null) {
  const elems = await api.game.getColElements(colId);
  const e = id ? elems.find(el => el.id === id) : null;
  const eTags = id ? await api.game.getElementTags(id) : [];
  openModal(e ? `${t('edit')} — ${x(e.name)}` : t('gameElementNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="geln" value="${x(e?.name || '')}"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(e?.color_ref)}</div>
    ${await hashtagSelector('gelem', eTags)}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveHeroElement(${colId},${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => { q('#geln')?.focus(); renderModalTagSuggestions('gelem'); }, 60);
}

async function saveHeroElement(colId, id) {
  const n = q('#geln').value.trim(); if (!n) return;
  const c = q('#sel-color').value || null;
  let eid = id;
  if (id) await api.game.updateColElement(id, n, c);
  else { const r = await api.game.createColElement(colId, n, c); eid = r?.lastInsertRowid; }
  if (eid) await api.game.setElementTags(eid, getModalTagIds('gelem'));
  closeModal();
  S.gameElemId = eid;
  toast(t('saved'), 'ok');
  await renderHeroProject(); // refresh the collection count badge in the sidebar too
}

async function deleteHeroElement(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.deleteColElement(id);
  if (S.gameElemId === id) S.gameElemId = null;
  toast(t('deleted'), 'ok');
  await renderHeroProject();
}

async function openGameStoryModal(id = null) {
  const stories = await api.game.getStories(S.game.id);
  const s = id ? stories.find(st => st.id === id) : null;
  openModal(s ? `${t('edit')} — ${x(s.name)}` : t('gameStoryNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="gsn" value="${x(s?.name || '')}"></div>
    <div class="fg"><label>${t('memo')}</label><textarea id="gsm">${x(s?.memo || '')}</textarea></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(s?.color_ref)}</div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveGameStory(${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#gsn')?.focus(), 60);
}

async function saveGameStory(id) {
  const n = q('#gsn').value.trim(); if (!n) return;
  const m = q('#gsm').value.trim() || null;
  const c = q('#sel-color').value || null;
  if (id) await api.game.updateStory(id, n, m, c);
  else { const r = await api.game.createStory(S.game.id, n, m, c); S.gameStoryId = r?.lastInsertRowid; }
  closeModal();
  toast(t('saved'), 'ok');
  await renderHeroStory();
}

async function deleteGameStoryUI(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.deleteStory(id);
  if (S.gameStoryId === id) { S.gameStoryId = null; S.gameDialId = null; }
  toast(t('deleted'), 'ok');
  await renderHeroStory();
}

async function openGameDialogueModal(storyId, id = null) {
  const dialogues = await api.game.getDialogues(storyId);
  const d = id ? dialogues.find(dd => dd.id === id) : null;
  openModal(d ? `${t('edit')} — ${x(d.name)}` : t('gameDialogueNew'), `
    <div class="fg"><label>${t('name')} *</label><input id="gdn" value="${x(d?.name || '')}"></div>
    <div class="fg"><label>${t('memo')}</label><textarea id="gdm">${x(d?.memo || '')}</textarea></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(d?.color_ref)}</div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveGameDialogue(${storyId},${id || 'null'})">${t('save')}</button>
    </div>`);
  setTimeout(() => q('#gdn')?.focus(), 60);
}

async function saveGameDialogue(storyId, id) {
  const n = q('#gdn').value.trim(); if (!n) return;
  const m = q('#gdm').value.trim() || null;
  const c = q('#sel-color').value || null;
  if (id) await api.game.updateDialogue(id, n, m, c);
  else {
    // Drop new nodes near the visible top-left corner of the graph viewport.
    const wrap = q('#story-graph-wrap');
    const px = (wrap?.scrollLeft || 0) + 40, py = (wrap?.scrollTop || 0) + 40;
    await api.game.createDialogue(storyId, n, m, c, px, py);
  }
  closeModal();
  toast(t('saved'), 'ok');
  await renderHeroStory();
}

async function deleteGameDialogueUI(id) {
  if (!await uiConfirm(`${t('delete')}?`)) return;
  await api.game.deleteDialogue(id);
  if (S.gameDialId === id) S.gameDialId = null;
  toast(t('deleted'), 'ok');
  await renderHeroStory();
}
