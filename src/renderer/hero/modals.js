// Every Hero modal: game / character / collection / element / template /
// story / dialogue create-edit-delete forms.
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
  else { const r = await api.game.create(n, cn, m, c, S.nexus?.id ?? null); gid = r?.lastInsertRowid; }
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
    body += `<div style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3);font-weight:600;margin:6px 0 3px">${x(c.name)}</div>`;
    body += `<div class="elem-pick-grid">` + elems.map(e => `<div class="elem-pick ${linkedIds.has(e.id) ? 'sel' : ''}" data-elem-id="${e.id}" onclick="this.classList.toggle('sel')">
      <span class="dot" style="background:${e.color_code || '#6366f1'}"></span><span style="flex:1">${x(e.name)}</span>
    </div>`).join('') + `</div>`;
  }
  openModal(t('gameCollections'), `
    ${body || `<p style="color:var(--t3);font-size:calc(12.5px * var(--fsc,1))">${t('gameCollectionNew')}</p>`}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="saveCharElements(${charId})">${t('save')}</button>
    </div>`);
}

async function saveCharElements(charId) {
  const ids = [...document.querySelectorAll('.elem-pick.sel')].map(el => Number(el.dataset.elemId));
  await api.game.setCharElements(charId, ids);
  closeModal();
  toast(t('saved'), 'ok');
  await renderCharDetail(charId);
}

// Attribute-template manager, shared by characters (per game) and
// collections (per collection).
// Same visual pattern as Director's category field modal (openTemplateModal
// in modals.js: hint paragraph + .tlist/.titem rows + inline add-row) with
// one addition Director's fields don't have: the per-level ("levelable")
// toggle, shown as an extra badge/checkbox inside the row.
async function openHeroTemplatesModal(kind, ownerId) {
  const tpls = kind === 'char' ? await api.game.getCharTemplates(ownerId) : await api.game.getColTemplates(ownerId);
  const typeOpts = (sel) => ['text', 'num', 'textarea'].map(tp => `<option value="${tp}" ${sel === tp ? 'selected' : ''}>${tp}</option>`).join('');
  const hintText = kind === 'char'
    ? 'Fields ใช้กับตัวละครทุกตัวในเกมนี้'
    : 'Fields ใช้กับ Element ทุกตัวในคอลเลกชันนี้';
  const rowHtml = (tp) => `<div class="titem" id="hero-tpl-${tp.id}">
      <input class="tname" style="background:transparent;border:none;color:inherit;font-size:calc(13px * var(--fsc,1))" value="${x(tp.attribute_name)}" onchange="saveHeroTemplate('${kind}',${tp.id},this.value,null,null)">
      <select class="ttype" style="border:none" onchange="saveHeroTemplate('${kind}',${tp.id},null,this.value,null)">${typeOpts(tp.attribute_type)}</select>
      <label style="display:flex;align-items:center;gap:4px;font-size:calc(11px * var(--fsc,1));color:var(--t3)">
        <input type="checkbox" ${tp.levelable ? 'checked' : ''} onchange="saveHeroTemplate('${kind}',${tp.id},null,null,this.checked)">${t('gameLevel')}
      </label>
      <button class="btn btn-g btn-i" onclick="deleteHeroTemplate('${kind}',${ownerId},${tp.id})" style="color:var(--danger)">${I.delete}</button>
    </div>`;
  openModal(t('gameFields'), `
    <p style="font-size:calc(11.5px * var(--fsc,1));color:var(--t3);margin-bottom:10px">${hintText}</p>
    <div class="tlist" id="hero-tpl-list">${tpls.map(rowHtml).join('') || `<p style="color:var(--t3);text-align:center;padding:18px;font-size:calc(12px * var(--fsc,1))">-</p>`}</div>
    <div class="div"></div>
    <div style="display:flex;align-items:flex-end;gap:8px">
      <div class="fg" style="flex:1;margin:0"><label>${t('name')}</label><input id="htpl-name"></div>
      <div class="fg" style="margin:0"><label>ประเภท</label><select id="htpl-type">${typeOpts('text')}</select></div>
      <label style="display:flex;align-items:center;gap:4px;font-size:calc(11.5px * var(--fsc,1));color:var(--t3);padding-bottom:9px"><input type="checkbox" id="htpl-lv">${t('gameLevel')}</label>
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
