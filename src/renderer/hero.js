// Hero module — Game management
const HERO_TABS = ['overview','characters','items','story','functions','tags'];

async function renderHeroView() {
  S.view = 'hero';
  S.activeModule = 'hero';
  const games = await api.game.getAll();
  let h = `<div class="ph"><h4>${t('hero')}</h4>
    <button class="btn btn-g btn-i" onclick="openGameModal()" title="${t('gameNew')}">${I.plus}</button>
  </div>`;
  if (!games.length) {
    h += `<div class="empty" style="padding:32px 10px"><div class="ei">${I.hero}</div><p>${t('gameNew')}</p></div>`;
  } else {
    for (const g of games) {
      const col = g.color_code || '#6366f1';
      const sel = S.game?.id === g.id ? ' selected' : '';
      h += `<div class="li${sel}" onclick="selectGame(${g.id})" style="display:flex;align-items:center;gap:8px">
        <div class="dot" style="background:${col}"></div>
        <span class="name" style="flex:1">${x(g.name)}</span>
        <button class="btn btn-g btn-i" onclick="event.stopPropagation();openGameModal(${g.id})" title="Edit">${I.edit}</button>
      </div>`;
    }
  }
  q('#left-panel-inner').innerHTML = h;
  if (S.game) await renderGameDetail(S.game.id);
  else q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei">${I.hero}</div><h3>${t('hero')}</h3><p>${t('nexusWelcomeText')}</p></div>`;
  updateTopNavButton();
}

async function selectGame(id) {
  S.game = await api.game.get(id);
  S.gameTab = S.gameTab || 'overview';
  if (S.game) upsertEntityTab(S.game, 'game', 'hero');
  await renderHeroView();
}

async function renderGameDetail(id) {
  const g = S.game || await api.game.get(id);
  if (!g) return;
  const col = g.color_code || '#6366f1';
  let body = '';
  if (S.gameTab === 'overview') body = await renderGameOverview(g);
  else if (S.gameTab === 'characters') body = await renderGameChars(g.id);
  else if (S.gameTab === 'items') body = await renderGameItems(g.id);
  else if (S.gameTab === 'story') body = await renderGameStory(g.id);
  else if (S.gameTab === 'functions') body = await renderGameFunctions(g.id);
  else if (S.gameTab === 'tags') body = await renderGameTagsTab(g.id);

  q('#main-inner').innerHTML = `
    <div class="detail-head" style="border-left:4px solid ${col};padding-left:12px;margin-bottom:12px">
      <h2 style="margin:0;font-size:1.1em">${x(g.name)} <span style="color:var(--t3);font-weight:400;font-size:.8em">· ${x(gameTabLabel(S.gameTab))}</span></h2>
      ${g.memo ? `<div style="color:var(--t3);font-size:.85em;margin-top:2px">${x(g.memo)}</div>` : ''}
    </div>
    <div id="game-tab-body">${body}</div>`;
  updateTopNavButton();
}

function gameTabLabel(tab) {
  const map = { overview: t('gameOverview'), characters: t('gameChars'), items: t('gameItems'),
    story: t('gameStory'), functions: t('gameFunctions'), tags: t('gameTags') };
  return map[tab] || tab;
}

async function setGameTab(tab) {
  S.gameTab = tab;
  if (S.game) await renderGameDetail(S.game.id);
}

async function renderGameOverview(g) {
  const descs = await api.game.getDesc(g.id);
  const novelLink = await api.game.getNovelLink(g.id);
  const projs = await api.project.getAll();

  const novelSection = `
    <section style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <h4 style="margin:0">${t('gameNovelLink')}</h4>
      </div>
      ${novelLink
        ? `<div class="li" style="display:flex;align-items:center;gap:8px">
            <span class="name" style="flex:1">${x(novelLink.project_name)}</span>
            <button class="btn btn-g btn-i" onclick="setGameNovelLink(${g.id},null)">${I.delete}</button>
          </div>`
        : `<div style="display:flex;gap:6px;align-items:center">
            ${buildNovelPickerHtml('game-novel', null, new Set())}
            <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="linkGameNovel(${g.id})">${I.plus} Link</button>
          </div>`
      }
    </section>`;

  const descHtml = descs.length
    ? descs.map(d => `
      <div style="margin-bottom:12px;background:var(--bg2);border-radius:8px;padding:10px 12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <strong style="font-size:.9em">${x(d.title||'')}</strong>
          <span style="display:flex;gap:4px">
            <button class="btn btn-g btn-i" onclick="openGameDescModal(${g.id},${d.id})">${I.edit}</button>
            <button class="btn btn-g btn-i" onclick="deleteGameDesc(${d.id})">${I.delete}</button>
          </span>
        </div>
        <div style="font-size:.88em;color:var(--t2);white-space:pre-wrap">${x(d.content||'')}</div>
      </div>`).join('')
    : `<div class="empty" style="padding:20px 0"><p style="color:var(--t3)">No descriptions yet.</p></div>`;

  return novelSection + `
    <section>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <h4 style="margin:0">Descriptions</h4>
        <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openGameDescModal(${g.id})">${I.plus} Add</button>
      </div>
      ${descHtml}
    </section>`;
}

async function renderGameChars(gameId) {
  const chars = await api.game.getCharacters(gameId);
  let h = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openGameCharModal(${gameId})">${I.plus} ${t('gameCharNew')}</button>
  </div>`;
  if (!chars.length) return h + `<div class="empty"><div class="ei">${I.person}</div></div>`;

  for (const c of chars) {
    const stats = await api.game.getStats(c.id);
    const levelups = await api.game.getStatLevelups(c.id);
    const linkInfo = c.object_name
      ? `<span style="font-size:.78em;color:var(--t3)">${x(c.project_name)} / ${x(c.category_name)} / ${x(c.object_name)}</span>`
      : `<span style="font-size:.78em;color:var(--t3)">${t('noLink')}</span>`;

    // Build level-up table
    const maxLevel = levelups.reduce((m, lu) => Math.max(m, lu.level), 1);
    const levels = Array.from({length: maxLevel}, (_, i) => i + 1);
    const tableHtml = stats.length ? `
      <div style="margin-top:8px;overflow-x:auto">
        <table style="border-collapse:collapse;font-size:.82em;width:100%">
          <thead><tr style="background:var(--bg3)">
            <th style="padding:4px 8px;text-align:left">Stat</th>
            ${levels.map(lv => `<th style="padding:4px 8px;min-width:48px">Lv${lv}</th>`).join('')}
            <th style="padding:4px 8px"></th>
          </tr></thead>
          <tbody>${stats.map(st => {
            const vals = levels.map(lv => {
              const entry = levelups.find(lu => lu.template_ref === st.id && lu.level === lv);
              return `<td style="padding:2px 8px;text-align:center">
                <input style="width:44px;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--t1);text-align:center"
                  value="${x(entry?.value||'')}"
                  onchange="saveStatLevelup(${c.id},${st.id},${lv},this.value)">
              </td>`;
            }).join('');
            return `<tr>
              <td style="padding:2px 8px;white-space:nowrap">${x(st.stat_name)}<span style="color:var(--t3);font-size:.8em;margin-left:4px">${x(st.stat_type)}</span></td>
              ${vals}
              <td style="padding:2px 4px">
                <button class="btn btn-g btn-i" onclick="deleteGameStat(${gameId},${st.id})">${I.delete}</button>
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button class="btn btn-g btn-s" onclick="addGameStatLevel(${c.id})">+ Level</button>
          <button class="btn btn-g btn-s" onclick="openGameStatModal(${c.id})">+ Stat</button>
        </div>
      </div>` : `<div style="display:flex;gap:6px;margin-top:6px">
        <button class="btn btn-g btn-s" onclick="openGameStatModal(${c.id})">+ Stat</button>
      </div>`;

    h += `<div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-weight:500">${x(c.name)}</span>
        <button class="btn btn-g btn-i" onclick="openGameCharModal(${gameId},${c.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteGameChar(${gameId},${c.id})">${I.delete}</button>
      </div>
      ${linkInfo}
      ${c.memo ? `<div style="font-size:.82em;color:var(--t3);margin-top:2px">${x(c.memo)}</div>` : ''}
      ${tableHtml}
    </div>`;
  }
  return h;
}

async function addGameStatLevel(charId) {
  const levelups = await api.game.getStatLevelups(charId);
  const maxLevel = levelups.reduce((m, lu) => Math.max(m, lu.level), 0);
  const stats = await api.game.getStats(charId);
  for (const st of stats) {
    await api.game.upsertStatLevelup(charId, st.id, maxLevel + 1, '');
  }
  await setGameTab('characters');
}

async function saveStatLevelup(charId, templateId, level, value) {
  await api.game.upsertStatLevelup(charId, templateId, level, value);
}

async function renderGameItems(gameId) {
  const cats = await api.game.getItemCategories(gameId);
  let h = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openGameItemCatModal(${gameId})">${I.plus} ${t('gameItemCatNew')}</button>
  </div>`;
  if (!cats.length) return h + `<div class="empty"><div class="ei">${I.item}</div></div>`;

  for (const cat of cats) {
    const items = await api.game.getItems(cat.id);
    const templates = await api.game.getItemTemplates(cat.id);
    const itemsHtml = items.length
      ? items.map(it => `<div class="li" style="display:flex;align-items:center;gap:8px;padding:4px 8px">
          <span style="flex:1;font-size:.9em">${it.symbol ? `<span style="margin-right:4px">${x(it.symbol)}</span>` : ''}${x(it.name)}</span>
          <button class="btn btn-g btn-i" onclick="openGameItemModal(${cat.id},${it.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="deleteGameItem(${gameId},${it.id})">${I.delete}</button>
        </div>`).join('')
      : '';
    h += `<div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-weight:500">${x(cat.name)}</span>
        <button class="btn btn-g btn-i" onclick="openGameItemTemplateModal(${cat.id})">${I.fields}</button>
        <button class="btn btn-g btn-i" onclick="openGameItemModal(${cat.id})">${I.plus}</button>
        <button class="btn btn-g btn-i" onclick="openGameItemCatModal(${gameId},${cat.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteGameItemCat(${gameId},${cat.id})">${I.delete}</button>
      </div>
      ${templates.length ? `<div style="font-size:.78em;color:var(--t3);margin-bottom:4px">Fields: ${templates.map(t=>x(t.attr_name)).join(', ')}</div>` : ''}
      ${itemsHtml}
    </div>`;
  }
  return h;
}

async function renderGameStory(gameId) {
  const stories = await api.game.getStories(gameId);
  let h = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openGameStoryModal(${gameId})">${I.plus} ${t('gameStoryNew')}</button>
  </div>`;
  if (!stories.length) return h + `<div class="empty"><div class="ei">${I.story}</div></div>`;

  for (const story of stories) {
    const dialogues = await api.game.getDialogues(story.id);
    const edges = await api.game.getDialogueEdges(story.id);
    h += `<div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span class="name" style="flex:1;font-weight:500">${x(story.name)}</span>
        <button class="btn btn-g btn-i" onclick="openGameDialogueModal(${story.id})">${I.plus}</button>
        <button class="btn btn-g btn-i" onclick="openGameStoryModal(${gameId},${story.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteGameStory(${gameId},${story.id})">${I.delete}</button>
      </div>
      ${renderDialogueGraph(story.id, dialogues, edges)}
    </div>`;
  }
  return h;
}

function renderDialogueGraph(storyId, dialogues, edges) {
  if (!dialogues.length) return `<div style="color:var(--t3);font-size:.85em">No dialogue nodes yet. Click + to add.</div>`;
  const nodeMap = new Map(dialogues.map(d => [d.id, d]));
  return `<div style="overflow-x:auto;padding-bottom:4px">
    <div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap">
      ${dialogues.map(d => {
        const toEdges = edges.filter(e => e.from_ref === d.id);
        return `<div style="background:var(--bg3);border-radius:6px;padding:6px 10px;min-width:120px;border:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
            <span style="font-size:.88em;font-weight:500;flex:1">${x(d.name)}</span>
            <button class="btn btn-g btn-i" onclick="openGameDialogueModal(${storyId},${d.id})">${I.edit}</button>
            <button class="btn btn-g btn-i" onclick="deleteDialogue(${storyId},${d.id})">${I.delete}</button>
          </div>
          ${d.memo ? `<div style="font-size:.78em;color:var(--t3)">${x(d.memo)}</div>` : ''}
          ${toEdges.length ? `<div style="font-size:.75em;color:var(--t3);margin-top:4px">→ ${toEdges.map(e=>x(e.to_name)).join(', ')}</div>` : ''}
          <button class="btn btn-g btn-s" style="margin-top:4px;font-size:.75em" onclick="openDialogueLinesModal(${d.id})">Lines (${d.id})</button>
        </div>`;
      }).join('')}
    </div>
    <div style="margin-top:8px">
      <button class="btn btn-g btn-s" onclick="openAddDialogueEdgeModal(${storyId})">+ Add Edge</button>
    </div>
  </div>`;
}

async function renderGameFunctions(gameId) {
  const cats = await api.game.getFuncCategories(gameId);
  let h = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:12px" onclick="openGameFuncCatModal(${gameId})">${I.plus} ${t('gameFuncCatNew')}</button>
  </div>`;
  if (!cats.length) return h + `<div class="empty"><div class="ei">${I.func}</div></div>`;

  for (const cat of cats) {
    const funcs = await api.game.getFunctions(cat.id);
    const funcsHtml = funcs.length
      ? funcs.map(f => `<div class="li" style="display:flex;align-items:center;gap:8px;padding:4px 8px">
          <span style="flex:1;font-size:.9em">${x(f.name)}</span>
          <button class="btn btn-g btn-i" onclick="openGameFuncModal(${cat.id},${f.id})">${I.edit}</button>
          <button class="btn btn-g btn-i" onclick="deleteGameFunc(${gameId},${f.id})">${I.delete}</button>
        </div>`).join('')
      : '';
    h += `<div style="background:var(--bg2);border-radius:8px;padding:8px 10px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="name" style="flex:1;font-weight:500">${x(cat.name)}</span>
        <span style="font-size:.78em;color:var(--t3)">${x(cat.function_type)}</span>
        <button class="btn btn-g btn-i" onclick="openGameFuncModal(${cat.id})">${I.plus}</button>
        <button class="btn btn-g btn-i" onclick="openGameFuncCatModal(${gameId},${cat.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteGameFuncCat(${gameId},${cat.id})">${I.delete}</button>
      </div>
      ${funcsHtml}
    </div>`;
  }
  return h;
}

async function renderGameTagsTab(gameId) {
  const allTags = await api.hashtag.getAll();
  const gameTags = await api.game.getTags(gameId);
  const tagIds = new Set(gameTags.map(t => t.id));
  return `<div>
    <h4 style="margin:0 0 8px">${t('gameTags')}</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${allTags.map(tag => {
        const col = tag.color_code || '#6366f1';
        const sel = tagIds.has(tag.id);
        return `<span class="tag-chip${sel?' selected':''}" style="cursor:pointer;border:2px solid ${col};color:${col};padding:3px 10px;border-radius:99px;font-size:.82em;font-weight:700;background:${sel?col+'22':'transparent'}"
          onclick="toggleGameTag(${gameId},${tag.id},${sel})">#${x(tag.tag_name)}</span>`;
      }).join('')}
    </div>
  </div>`;
}

// ═══ GAME MODALS ═══════════════════════════════════

function openGameModal(id) {
  const isEdit = !!id;
  const g = isEdit ? S.game : null;
  openModal(isEdit ? 'Edit Game' : 'New Game', `
    <div class="form-row"><label>Name *</label><input id="gm-name" value="${x(g?.name||'')}"></div>
    <div class="form-row"><label>Memo</label><textarea id="gm-memo" rows="3" style="width:100%;resize:vertical">${x(g?.memo||'')}</textarea></div>
    <div class="form-row"><label>Color</label><div id="gm-color-pick"></div></div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:8px" onclick="deleteGame(${id})">Delete Game</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGame(${id||'null'})">${isEdit?'Save':'Create'}</button>
    </div>`);
  colorPicker('gm-color-pick', g?.color_ref||null, 'gm-selected-color');
}

async function saveGame(id) {
  const name = q('#gm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#gm-memo')?.value?.trim() || null;
  const colorRef = q('#gm-selected-color')?.dataset?.colorId || null;
  if (id) { await api.game.update(id, name, memo, colorRef); S.game = await api.game.get(id); }
  else { const r = await api.game.create(name, memo, colorRef); if (r?.lastInsertRowid) S.game = await api.game.get(r.lastInsertRowid); }
  closeModal(); await renderHeroView();
}

async function deleteGame(id) {
  if (!await uiConfirm('Delete this game and all its data?')) return;
  await api.game.delete(id); S.game = null; closeModal(); await renderHeroView();
}

function openGameDescModal(gameId, id) {
  const isEdit = !!id;
  openModal(isEdit ? 'Edit Description' : 'Add Description', `
    <div class="form-row"><label>Title</label><input id="gdm-title" value="" placeholder="Section title"></div>
    <div class="form-row"><label>Content</label><textarea id="gdm-content" rows="6" style="width:100%;resize:vertical"></textarea></div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameDesc(${gameId},${id||'null'})">${isEdit?'Save':'Add'}</button>
    </div>`);
  if (isEdit) api.game.getDesc(gameId).then(descs => {
    const d = descs.find(d => d.id === id);
    if (d) { q('#gdm-title').value = d.title||''; q('#gdm-content').value = d.content||''; }
  });
}

async function saveGameDesc(gameId, id) {
  const title = q('#gdm-title')?.value?.trim() || '';
  const content = q('#gdm-content')?.value?.trim() || '';
  if (id) await api.game.updateDesc(id, title, content);
  else await api.game.addDesc(gameId, title, content);
  closeModal(); await setGameTab('overview');
}

async function deleteGameDesc(id) {
  if (!await uiConfirm('Delete this description?')) return;
  await api.game.deleteDesc(id); await setGameTab('overview');
}

async function linkGameNovel(gameId) {
  const pid = Number(q('#np-wrap-game-novel')?.dataset.selectedId);
  if (!pid) return;
  await api.game.setNovelLink(gameId, pid); await setGameTab('overview');
}

async function setGameNovelLink(gameId, pid) {
  await api.game.setNovelLink(gameId, pid); await setGameTab('overview');
}

async function openGameCharModal(gameId, id) {
  const isEdit = !!id;
  const chars = isEdit ? await api.game.getCharacters(gameId) : [];
  const c = isEdit ? chars.find(ch => ch.id === id) : null;
  const projs = await api.project.getAll();
  const projOpts = projs.map(p => `<option value="${p.id}"${c?.project_ref===p.id?' selected':''}>${x(p.name)}</option>`).join('');
  openModal(isEdit ? 'Edit Character' : 'New Character', `
    <div class="form-row"><label>Name *</label><input id="gcm-name" value="${x(c?.name||'')}"></div>
    <div class="form-row"><label>Memo</label><textarea id="gcm-memo" rows="2" style="width:100%;resize:vertical">${x(c?.memo||'')}</textarea></div>
    <div class="form-row"><label>Link to Novel Object</label>
      <select id="gcm-proj" onchange="loadGameCharCatOpts(${gameId})">
        <option value="">— ${t('noLink')} —</option>${projOpts}
      </select>
    </div>
    <div id="gcm-cat-row" style="display:none" class="form-row"><label>Category</label>
      <select id="gcm-cat" onchange="loadGameCharObjOpts()"><option value="">—</option></select>
    </div>
    <div id="gcm-obj-row" style="display:none" class="form-row"><label>Object</label>
      <select id="gcm-obj"><option value="">—</option></select>
    </div>
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteGameChar(${gameId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameChar(${gameId},${id||'null'})">${isEdit?'Save':'Create'}</button>
    </div>`);
  if (c?.project_ref) {
    await loadGameCharCatOpts(gameId);
    if (c?.category_ref) { q('#gcm-cat').value = c.category_ref; await loadGameCharObjOpts(); }
    if (c?.object_ref) q('#gcm-obj').value = c.object_ref;
  }
}

async function loadGameCharCatOpts(gameId) {
  const pid = Number(q('#gcm-proj')?.value);
  if (!pid) { q('#gcm-cat-row').style.display='none'; q('#gcm-obj-row').style.display='none'; return; }
  const cats = await api.category.getAll(pid);
  q('#gcm-cat').innerHTML = `<option value="">—</option>` + cats.map(c => `<option value="${c.id}">${x(c.category_name)}</option>`).join('');
  q('#gcm-cat-row').style.display=''; q('#gcm-obj-row').style.display='none';
}

async function loadGameCharObjOpts() {
  const cid = Number(q('#gcm-cat')?.value);
  if (!cid) { q('#gcm-obj-row').style.display='none'; return; }
  const objs = await api.object.getAll(cid);
  q('#gcm-obj').innerHTML = `<option value="">—</option>` + objs.map(o => `<option value="${o.id}">${x(o.name)}</option>`).join('');
  q('#gcm-obj-row').style.display='';
}

async function saveGameChar(gameId, id) {
  const name = q('#gcm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#gcm-memo')?.value?.trim() || null;
  const pid = Number(q('#gcm-proj')?.value) || null;
  const catid = Number(q('#gcm-cat')?.value) || null;
  const oid = Number(q('#gcm-obj')?.value) || null;
  let charId = id;
  if (id) await api.game.updateCharacter(id, name, memo);
  else { const r = await api.game.createCharacter(gameId, name, memo); charId = r?.lastInsertRowid; }
  if (charId) await api.game.setCharLink(charId, pid, catid, oid);
  closeModal(); await setGameTab('characters');
}

async function deleteGameChar(gameId, id) {
  if (!await uiConfirm('Delete this character?')) return;
  await api.game.deleteCharacter(id); closeModal(); await setGameTab('characters');
}

function openGameStatModal(charId) {
  openModal('Add Stat', `
    <div class="form-row"><label>Stat Name *</label><input id="gsm-name" placeholder="HP, ATK, DEF..."></div>
    <div class="form-row"><label>Type</label>
      <select id="gsm-type"><option value="number">Number</option><option value="text">Text</option><option value="percent">Percent</option></select>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameStat(${charId})">Add</button>
    </div>`);
}

async function saveGameStat(charId) {
  const name = q('#gsm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const type = q('#gsm-type')?.value || 'number';
  await api.game.createStat(charId, name, type);
  closeModal(); await setGameTab('characters');
}

async function deleteGameStat(gameId, statId) {
  if (!await uiConfirm('Delete this stat?')) return;
  await api.game.deleteStat(statId); await setGameTab('characters');
}

function openGameItemCatModal(gameId, id) {
  openModal(id ? 'Edit Item Category' : 'New Item Category', `
    <div class="form-row"><label>Name *</label><input id="gicm-name" value=""></div>
    <div class="form-row"><label>Memo</label><textarea id="gicm-memo" rows="2" style="width:100%;resize:vertical"></textarea></div>
    ${id ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteGameItemCat(${gameId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameItemCat(${gameId},${id||'null'})">${id?'Save':'Create'}</button>
    </div>`);
  if (id) api.game.getItemCategories(gameId).then(cats => {
    const c = cats.find(c => c.id === id);
    if (c) { q('#gicm-name').value = c.name||''; q('#gicm-memo').value = c.memo||''; }
  });
}

async function saveGameItemCat(gameId, id) {
  const name = q('#gicm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#gicm-memo')?.value?.trim() || null;
  if (id) await api.game.updateItemCategory(id, name, memo);
  else await api.game.createItemCategory(gameId, name, memo);
  closeModal(); await setGameTab('items');
}

async function deleteGameItemCat(gameId, id) {
  if (!await uiConfirm('Delete this item category?')) return;
  await api.game.deleteItemCategory(id); closeModal(); await setGameTab('items');
}

function openGameItemTemplateModal(catId) {
  openModal('Manage Item Fields', `
    <div id="gitmpl-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:6px;align-items:center">
      <input id="gitmpl-name" placeholder="Field name" style="flex:1">
      <select id="gitmpl-type"><option value="text">Text</option><option value="number">Number</option><option value="boolean">Yes/No</option></select>
      <button class="btn btn-g" onclick="addGameItemTemplate(${catId})">Add</button>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Done</button>
    </div>`);
  api.game.getItemTemplates(catId).then(tmpls => {
    const el = q('#gitmpl-list');
    if (el) el.innerHTML = tmpls.map(t => `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">
      <span style="flex:1">${x(t.attr_name)}<span style="color:var(--t3);font-size:.8em;margin-left:6px">${x(t.attr_type)}</span></span>
      <button class="btn btn-g btn-i" onclick="deleteGameItemTemplate(${catId},${t.id})">${I.delete}</button>
    </div>`).join('');
  });
}

async function addGameItemTemplate(catId) {
  const name = q('#gitmpl-name')?.value?.trim();
  if (!name) return;
  const type = q('#gitmpl-type')?.value || 'text';
  await api.game.createItemTemplate(catId, name, type);
  q('#gitmpl-name').value = '';
  openGameItemTemplateModal(catId);
}

async function deleteGameItemTemplate(catId, id) {
  await api.game.deleteItemTemplate(id);
  openGameItemTemplateModal(catId);
}

function openGameItemModal(catId, id) {
  openModal(id ? 'Edit Item' : 'New Item', `
    <div class="form-row"><label>Name *</label><input id="gim-name" value=""></div>
    <div class="form-row"><label>Symbol / Icon</label><input id="gim-sym" value="" placeholder="e.g. ⚔️"></div>
    ${id ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteGameItemById(${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameItem(${catId},${id||'null'})">${id?'Save':'Create'}</button>
    </div>`);
  if (id) api.game.getItems(catId).then(items => {
    const it = items.find(i => i.id === id);
    if (it) { q('#gim-name').value = it.name||''; q('#gim-sym').value = it.symbol||''; }
  });
}

async function saveGameItem(catId, id) {
  const name = q('#gim-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const sym = q('#gim-sym')?.value?.trim() || null;
  if (id) await api.game.updateItem(id, name, sym);
  else await api.game.createItem(catId, name, sym);
  closeModal(); await setGameTab('items');
}

async function deleteGameItem(gameId, id) {
  if (!await uiConfirm('Delete this item?')) return;
  await api.game.deleteItem(id); await setGameTab('items');
}

async function deleteGameItemById(id) {
  if (!await uiConfirm('Delete this item?')) return;
  await api.game.deleteItem(id); closeModal(); await setGameTab('items');
}

function openGameStoryModal(gameId, id) {
  openModal(id ? 'Edit Story' : 'New Story', `
    <div class="form-row"><label>Name *</label><input id="gsm2-name" value=""></div>
    <div class="form-row"><label>Memo</label><textarea id="gsm2-memo" rows="2" style="width:100%;resize:vertical"></textarea></div>
    ${id ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteGameStory(${gameId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameStory(${gameId},${id||'null'})">${id?'Save':'Create'}</button>
    </div>`);
  if (id) api.game.getStories(gameId).then(stories => {
    const s = stories.find(s => s.id === id);
    if (s) { q('#gsm2-name').value = s.name||''; q('#gsm2-memo').value = s.memo||''; }
  });
}

async function saveGameStory(gameId, id) {
  const name = q('#gsm2-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#gsm2-memo')?.value?.trim() || null;
  if (id) await api.game.updateStory(id, name, memo);
  else await api.game.createStory(gameId, name, memo);
  closeModal(); await setGameTab('story');
}

async function deleteGameStory(gameId, id) {
  if (!await uiConfirm('Delete this story?')) return;
  await api.game.deleteStory(id); closeModal(); await setGameTab('story');
}

function openGameDialogueModal(storyId, id) {
  openModal(id ? 'Edit Dialogue Node' : 'New Dialogue Node', `
    <div class="form-row"><label>Name *</label><input id="gdlg-name" value=""></div>
    <div class="form-row"><label>Memo</label><textarea id="gdlg-memo" rows="2" style="width:100%;resize:vertical"></textarea></div>
    ${id ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteDialogue(${storyId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameDialogue(${storyId},${id||'null'})">${id?'Save':'Create'}</button>
    </div>`);
  if (id) api.game.getDialogues(storyId).then(dlgs => {
    const d = dlgs.find(d => d.id === id);
    if (d) { q('#gdlg-name').value = d.name||''; q('#gdlg-memo').value = d.memo||''; }
  });
}

async function saveGameDialogue(storyId, id) {
  const name = q('#gdlg-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const memo = q('#gdlg-memo')?.value?.trim() || null;
  if (id) await api.game.updateDialogue(id, name, memo, 0, 0);
  else await api.game.createDialogue(storyId, name, memo, 0, 0);
  closeModal(); await setGameTab('story');
}

async function deleteDialogue(storyId, id) {
  if (!await uiConfirm('Delete this dialogue node?')) return;
  await api.game.deleteDialogue(id); closeModal(); await setGameTab('story');
}

async function openAddDialogueEdgeModal(storyId) {
  const dialogues = await api.game.getDialogues(storyId);
  const opts = dialogues.map(d => `<option value="${d.id}">${x(d.name)}</option>`).join('');
  openModal('Add Dialogue Edge', `
    <div class="form-row"><label>From</label><select id="edge-from">${opts}</select></div>
    <div class="form-row"><label>To</label><select id="edge-to">${opts}</select></div>
    <div class="form-row"><label>Condition</label><input id="edge-cond" placeholder="e.g. choice==1"></div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveDialogueEdge(${storyId})">Add</button>
    </div>`);
}

async function saveDialogueEdge(storyId) {
  const fid = Number(q('#edge-from')?.value);
  const tid = Number(q('#edge-to')?.value);
  if (!fid || !tid || fid === tid) return toast('Select different from/to nodes','err');
  const cond = q('#edge-cond')?.value?.trim() || null;
  await api.game.createDialogueEdge(fid, tid, cond);
  closeModal(); await setGameTab('story');
}

async function openDialogueLinesModal(dialId) {
  const lines = await api.game.getDialogueLines(dialId);
  openModal('Dialogue Lines', `
    <div id="dlg-lines-list">
      ${lines.map((l, i) => `<div style="display:flex;gap:6px;align-items:center;padding:4px 0">
        <span style="color:var(--t3);min-width:20px">${i+1}</span>
        <span style="flex:1;font-size:.9em">${x(l.text)}</span>
        <button class="btn btn-g btn-i" onclick="deleteDialogueLine(${dialId},${l.id})">${I.delete}</button>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:6px;align-items:center;margin-top:8px">
      <input id="dlg-new-line" placeholder="Line text..." style="flex:1">
      <button class="btn btn-g" onclick="addDialogueLine(${dialId})">Add</button>
    </div>
    <div class="mfoot"><button class="btn btn-g" onclick="closeModal()">Done</button></div>`);
}

async function addDialogueLine(dialId) {
  const text = q('#dlg-new-line')?.value?.trim();
  if (!text) return;
  const lines = await api.game.getDialogueLines(dialId);
  await api.game.createDialogueLine(dialId, null, text, lines.length);
  openDialogueLinesModal(dialId);
}

async function deleteDialogueLine(dialId, id) {
  await api.game.deleteDialogueLine(id);
  openDialogueLinesModal(dialId);
}

function openGameFuncCatModal(gameId, id) {
  openModal(id ? 'Edit Function Category' : 'New Function Category', `
    <div class="form-row"><label>Name *</label><input id="gfcm-name" value=""></div>
    <div class="form-row"><label>Type</label><input id="gfcm-type" value="general" placeholder="general, trigger, action..."></div>
    ${id ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteGameFuncCat(${gameId},${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameFuncCat(${gameId},${id||'null'})">${id?'Save':'Create'}</button>
    </div>`);
  if (id) api.game.getFuncCategories(gameId).then(cats => {
    const c = cats.find(c => c.id === id);
    if (c) { q('#gfcm-name').value = c.name||''; q('#gfcm-type').value = c.function_type||'general'; }
  });
}

async function saveGameFuncCat(gameId, id) {
  const name = q('#gfcm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const type = q('#gfcm-type')?.value?.trim() || 'general';
  if (id) await api.game.updateFuncCategory(id, name, type);
  else await api.game.createFuncCategory(gameId, name, type);
  closeModal(); await setGameTab('functions');
}

async function deleteGameFuncCat(gameId, id) {
  if (!await uiConfirm('Delete this function category?')) return;
  await api.game.deleteFuncCategory(id); closeModal(); await setGameTab('functions');
}

function openGameFuncModal(catId, id) {
  openModal(id ? 'Edit Function' : 'New Function', `
    <div class="form-row"><label>Name *</label><input id="gfm-name" value=""></div>
    <div class="form-row"><label>Template</label><textarea id="gfm-tpl" rows="2" style="width:100%;resize:vertical" placeholder="Function signature / pseudo-code"></textarea></div>
    <div class="form-row"><label>Conditions (JSON)</label><textarea id="gfm-cond" rows="3" style="width:100%;resize:vertical;font-family:monospace" placeholder='[{"field":"hp","op":"<","value":50}]'></textarea></div>
    <div class="form-row"><label>Effects (JSON)</label><textarea id="gfm-eff" rows="3" style="width:100%;resize:vertical;font-family:monospace" placeholder='[{"action":"addItem","value":1}]'></textarea></div>
    ${id ? `<button class="btn btn-danger" style="margin-top:4px" onclick="deleteGameFunc(0,${id})">Delete</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveGameFunc(${catId},${id||'null'})">${id?'Save':'Create'}</button>
    </div>`);
  if (id) api.game.getFunctions(catId).then(funcs => {
    const f = funcs.find(f => f.id === id);
    if (f) { q('#gfm-name').value=f.name||''; q('#gfm-tpl').value=f.function_template||''; q('#gfm-cond').value=f.conditions_json||''; q('#gfm-eff').value=f.effects_json||''; }
  });
}

async function saveGameFunc(catId, id) {
  const name = q('#gfm-name')?.value?.trim();
  if (!name) return toast('Name required','err');
  const tpl = q('#gfm-tpl')?.value?.trim() || null;
  const cond = q('#gfm-cond')?.value?.trim() || null;
  const eff = q('#gfm-eff')?.value?.trim() || null;
  if (id) await api.game.updateFunction(id, name, tpl, cond, eff);
  else await api.game.createFunction(catId, name, tpl, cond, eff);
  closeModal(); await setGameTab('functions');
}

async function deleteGameFunc(gameId, id) {
  if (!await uiConfirm('Delete this function?')) return;
  await api.game.deleteFunction(id); closeModal(); await setGameTab('functions');
}

async function toggleGameTag(gameId, tagId, isSelected) {
  const tags = await api.game.getTags(gameId);
  let ids = tags.map(t => t.id);
  if (isSelected) ids = ids.filter(i => i !== tagId);
  else ids.push(tagId);
  await api.game.setTags(gameId, ids);
  await setGameTab('tags');
}
