// The Project submodule: game characters, collections, their elements, and
// the levelable attribute editor shared by both.
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
    lh += `<div class="empty" style="padding:16px 10px"><p style="font-size:calc(12px * var(--fsc,1));color:var(--t3);text-align:center">${t('gameCollectionNew')}</p></div>`;
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
      <button class="btn btn-s" style="padding:5px 11px;font-size:calc(12.5px * var(--fsc,1))" title="Add or edit the data fields characters in this game can have (e.g. HP, Attack)" onclick="openCharTemplatesModal()">${I.fields} ${t('gameStats')}</button>
      <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12.5px * var(--fsc,1))" onclick="openCharModal()">${I.plus} ${t('gameCharNew')}</button>
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
        ${c.object_name ? `<div style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3)">${x(c.category_name || '')} · ${x(c.object_name)}</div>` : ''}</div>
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
  let h = `<div style="padding:16px">
  <div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <h2 style="margin:0;font-size:1.05em;flex:1">${x(c.name)}</h2>
    <button class="btn btn-g btn-i" onclick="openCharModal(${c.id})" title="${t('edit')}">${I.edit}</button>
    <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteGameChar(${c.id})" title="${t('delete')}">${I.delete}</button>
  </div>`;
  if (c.object_name) {
    h += `<div class="project-detail-item"><span class="dk">${t('gameNovelLink')}</span><span class="dv">${x(c.category_name || '')} · ${x(c.object_name)}</span></div>`;
  }
  // element chips
  h += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0">
    <span style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3);font-weight:600">${t('gameCollections')}:</span>
    ${elements.map(e => `<span class="cs-count" style="border-left:3px solid ${e.color_code || '#6366f1'}">${x(e.collection_name)} · ${x(e.name)}</span>`).join('')}
    <button class="btn btn-g btn-i" onclick="openCharElementsModal(${c.id})" title="${t('edit')}">${I.plus}</button>
  </div>`;
  // tag chips
  if (tags.length) {
    h += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">${tags.map(tg => `<span class="hn" style="color:${tg.color_code || '#6366f1'};font-weight:700;font-size:calc(12px * var(--fsc,1))">#${x(tg.tag_name)}</span>`).join('')}</div>`;
  }
  h += renderAttrEditor('char', c.id, templates, attrs);
  h += `</div>`;
  q('#detail-panel').innerHTML = h;
}

// Shared attribute editor for characters and elements. kind: 'char' | 'elem'.
function renderAttrEditor(kind, ownerId, templates, attrs) {
  if (!templates.length) {
    return `<div class="empty" style="padding:20px 10px"><p style="font-size:calc(12px * var(--fsc,1));color:var(--t3);text-align:center">${t('gameFields')}</p></div>`;
  }
  const byTpl = new Map();
  for (const a of attrs) {
    if (!byTpl.has(a.template_ref)) byTpl.set(a.template_ref, new Map());
    byTpl.get(a.template_ref).set(a.level, a);
  }
  const rowHtml = (tpl, lv, vals) => {
    const v = vals.get(lv)?.attribute_text || '';
    const inp = tpl.attribute_type === 'textarea'
      ? `<textarea class="table-inline-input" style="flex:1;min-height:48px" onchange="saveHeroAttr('${kind}',${ownerId},${tpl.id},${lv},this.value)">${x(v)}</textarea>`
      : `<input class="table-inline-input" style="flex:1" type="${tpl.attribute_type === 'num' ? 'number' : 'text'}" value="${x(v)}" onchange="saveHeroAttr('${kind}',${ownerId},${tpl.id},${lv},this.value)">`;
    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
      ${tpl.levelable ? `<span class="cs-count" style="min-width:34px;text-align:center">Lv ${lv}</span>` : ''}
      ${inp}
      ${tpl.levelable && lv > 0 ? `<button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteHeroAttrLevel('${kind}',${ownerId},${tpl.id},${lv})" title="${t('delete')}">${I.delete}</button>` : ''}
    </div>`;
  };
  let h = '';
  for (const tpl of templates) {
    const vals = byTpl.get(tpl.id) || new Map();
    const levels = tpl.levelable ? [...new Set([0, ...vals.keys()])].sort((a, b) => a - b) : [0];
    if (!tpl.levelable) {
      h += `<div style="margin-bottom:10px">
        <div style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3);font-weight:600;margin-bottom:3px">${x(tpl.attribute_name)}</div>
        ${rowHtml(tpl, 0, vals)}
      </div>`;
      continue;
    }
    // Levelable attributes can accumulate many level rows — collapse them
    // behind a dropdown header instead of always showing every level flat.
    const openKey = `${kind}-${ownerId}-${tpl.id}`;
    const open = S.heroLevelOpen.has(openKey);
    const next = Math.max(...levels) + 1;
    h += `<div style="margin-bottom:10px">
      <div class="lv-acc-head" onclick="toggleHeroLevelGroup('${kind}',${ownerId},${tpl.id})">
        <svg class="ftgl ${open ? 'open' : ''}" style="width:8px;height:8px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="flex:1;font-size:calc(11.5px * var(--fsc,1));color:var(--t3);font-weight:600">${x(tpl.attribute_name)} <span style="color:var(--accent)">· ${t('gameLevel')} (${levels.length})</span></span>
      </div>
      ${open ? `<div style="padding-left:14px">
        ${levels.map(lv => rowHtml(tpl, lv, vals)).join('')}
        <button class="btn btn-g" style="padding:2px 10px;font-size:calc(11.5px * var(--fsc,1))" onclick="addHeroAttrLevel('${kind}',${ownerId},${tpl.id},${next})">${I.plus} ${t('gameLevel')} ${next}</button>
      </div>` : ''}
    </div>`;
  }
  return h;
}

function toggleHeroLevelGroup(kind, ownerId, tplId) {
  const key = `${kind}-${ownerId}-${tplId}`;
  if (S.heroLevelOpen.has(key)) S.heroLevelOpen.delete(key);
  else S.heroLevelOpen.add(key);
  if (kind === 'char') renderCharDetail(ownerId);
  else renderElementDetail(ownerId);
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
  if (!await uiConfirm(t('confirmDeleteItem'), { okText: t('delete'), cancelText: t('cancel') })) return;
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
      <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12.5px * var(--fsc,1))" onclick="openElementModal(${c.id})">${I.plus} ${t('gameElementNew')}</button>
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
  let h = `<div style="padding:16px">
  <div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <h2 style="margin:0;font-size:1.05em;flex:1">${x(e.name)}</h2>
    <button class="btn btn-g btn-i" onclick="openElementModal(${S.gameColId},${e.id})" title="${t('edit')}">${I.edit}</button>
    <button class="btn btn-g btn-i" style="color:var(--danger)" onclick="deleteHeroElement(${e.id})" title="${t('delete')}">${I.delete}</button>
  </div>`;
  if (tags.length) {
    h += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">${tags.map(tg => `<span class="hn" style="color:${tg.color_code || '#6366f1'};font-weight:700;font-size:calc(12px * var(--fsc,1))">#${x(tg.tag_name)}</span>`).join('')}</div>`;
  }
  h += renderAttrEditor('elem', e.id, templates, attrs);
  h += `</div>`;
  q('#detail-panel').innerHTML = h;
}

