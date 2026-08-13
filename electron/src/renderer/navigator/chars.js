// World characters — the character list, their linked objects, symbol picker
// and tag assignment.
// ═══ Characters ══════════════════════════════════════
async function renderWorldChars(worldId) {
  const chars = await api.world.getCharacters(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;align-items:center;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12px * var(--fsc,1))" onclick="openWorldCharModal(${worldId})">${I.plus} ${t('worldCharNew')}</button>
  </div>`;

  if (!chars.length) {
    return head + `<div class="empty"><div class="ei">${I.person}</div>
      <p style="color:var(--t3)">No characters yet.</p></div>`;
  }

  let html = '';
  for (const c of chars) {
    const links = await api.world.getCharLinks(c.id);
    const linksHtml = links.length
      ? `<div class="char-link-wrap">
          <div class="char-link-row" id="clr-${c.id}">${links.map(lk =>
            `<div class="char-link-chip">
              <span>${x(lk.category_name || '?')} / ${x(lk.name || '?')}</span>
              <button class="btn btn-g btn-i" title="Remove" onclick="removeCharLink(${worldId},${lk.id})">×</button>
            </div>`).join('')}</div>
          <button class="char-link-expand" id="cle-${c.id}" title="Show all" onclick="toggleCharLinks(${c.id})">▾</button>
        </div>`
      : '';
    html += `<div class="li" style="flex-direction:column;align-items:flex-start;padding:8px 10px;gap:4px">
      <div style="display:flex;width:100%;align-items:center;gap:8px">
        <div class="dot" style="background:${c.color_code || '#6366f1'}"></div>
        <button class="btn btn-g btn-i char-sym-btn" style="padding:1px 5px;font-size:calc(11px * var(--fsc,1))" title="Choose symbol" data-symbol="${x(c.symbol || '')}" onclick="event.stopPropagation();openCharSymbolModal(${worldId},${c.id},this.dataset.symbol)">${c.symbol ? x(c.symbol) : I.plus}</button>
        <span class="name" style="flex:1;font-weight:500">${x(c.name)}</span>
        <button class="btn btn-g btn-i" title="Link this character to a novel object" onclick="openCharLinksModal(${worldId},${c.id})">${I.layer}</button>
        <button class="btn btn-g btn-i" title="Tags" onclick="openWorldCharTagsModal(${worldId},${c.id})">${I.hashtag}</button>
        <button class="btn btn-g btn-i" onclick="openWorldCharModal(${worldId},${c.id})">${I.edit}</button>
        <button class="btn btn-g btn-i" onclick="deleteWorldChar(${worldId},${c.id})">${I.delete}</button>
      </div>
      ${linksHtml}
    </div>`;
  }
  return head + html;
}

// Each .char-link-row is clamped to one row's height by CSS (see .char-link-row
// in style.css). After the chars-cats body is in the DOM, measure which rows
// actually wrapped past that one row and only then reveal their expand button —
// short lists that already fit on one line show no button at all.
function refreshCharLinkOverflow() {
  document.querySelectorAll('.char-link-row').forEach(row => {
    if (row.classList.contains('char-link-expanded')) return;
    const btn = document.getElementById(`cle-${row.id.slice(4)}`);
    if (btn) btn.classList.toggle('show', row.scrollHeight > row.clientHeight + 2);
  });
}

function toggleCharLinks(charId) {
  const row = q(`#clr-${charId}`);
  const btn = q(`#cle-${charId}`);
  if (!row) return;
  const expanding = !row.classList.contains('char-link-expanded');
  row.classList.toggle('char-link-expanded', expanding);
  if (btn) {
    btn.textContent = expanding ? '▴' : '▾';
    btn.title = expanding ? 'Show less' : 'Show all';
    // Collapsed rows re-run the overflow check to decide whether the
    // button should still be visible at the row's original clamp height.
    if (!expanding) btn.classList.toggle('show', row.scrollHeight > row.clientHeight + 2);
    else btn.classList.add('show');
  }
}

async function openWorldCharModal(worldId, id) {
  const isEdit = !!id;
  let c = null;
  if (isEdit) { const chars = await api.world.getCharacters(worldId); c = chars.find(ch => ch.id === id); }
  const cTags = isEdit ? await api.world.getCharTags(id) : [];
  const picker = await colorPicker(c?.color || null);
  openModal(isEdit ? 'Edit Character' : 'New Character', `
    <div class="form-row"><label>Name *</label><input id="wcm-name" value="${x(c?.name || '')}"></div>
    <div class="form-row"><label>Symbol</label><input id="wcm-sym" value="${x(c?.symbol || '')}" placeholder="e.g. ⚔️"></div>
    <div class="form-row"><label>Color</label>${picker}</div>
    ${await hashtagSelector('wchar', cTags)}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldChar(${worldId},${id || 'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
  setTimeout(() => renderModalTagSuggestions('wchar'), 60);
}

async function saveWorldChar(worldId, id) {
  const name = q('#wcm-name')?.value?.trim();
  if (!name) return toast('Name required', 'err');
  const sym = q('#wcm-sym')?.value?.trim() || null;
  const color = q('#sel-color')?.value || null;
  const tags = getModalTagIds('wchar');
  if (id) {
    await api.world.updateCharacter(id, name, sym, color);
    await api.world.setCharTags(id, tags);
  } else {
    const newId = await api.world.createCharacter(worldId, name, sym, color);
    if (newId) await api.world.setCharTags(newId, tags);
  }
  closeModal();
  // Editing straight from the Tags tab stays there instead of jumping to chars-cats.
  if (S.worldTab === 'tags') { await renderWorldMain(); await renderWorldSidebar(S.world); }
  else await setWorldCharCatTab('characters');
}

async function deleteWorldChar(worldId, id) {
  if (!await uiConfirm('Delete this character?')) return;
  await api.world.deleteCharacter(id);
  closeModal();
  await setWorldCharCatTab('characters');
}

async function openCharSymbolModal(worldId, charId, currentSymbolText) {
  const picker = await symbolPicker('wcs-sym-ref', null, 'wcs-sym-preview', 'wcs-sym-custom');
  openModal('Choose Symbol', `
    <div class="symsel-box">
      <span class="symsel-preview" id="wcs-sym-preview">${x(currentSymbolText || '+')}</span>
      <input type="text" class="symsel-input" id="wcs-sym-custom" placeholder="Type a custom symbol..." maxlength="4" value="${x(currentSymbolText || '')}" oninput="onSymbolCustomInput('wcs-sym-ref','wcs-sym-preview',this.value)">
    </div>
    <div class="form-row"><label>Symbol</label>${picker}</div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveCharSymbol(${worldId},${charId})">Save</button>
    </div>`);
}

async function saveCharSymbol(worldId, charId) {
  const symRef = Number(q('#wcs-sym-ref')?.value) || null;
  const customText = (q('#wcs-sym-custom')?.value || '').trim();
  let symbol = customText || null;
  if (symRef) {
    const symbols = await api.world.getSymbolCollection();
    const found = symbols.find(s => s.id === symRef);
    if (found) symbol = found.glyph;
  }
  const chars = await api.world.getCharacters(worldId);
  const c = chars.find(ch => ch.id === charId);
  if (!c) return closeModal();
  await api.world.updateCharacter(charId, c.name, symbol, c.color);
  closeModal();
  await setWorldCharCatTab('characters');
}

async function openCharLinksModal(worldId, charId) {
  const available = await api.world.getLinkableCharObjects(worldId, charId);
  const availHtml = available.length
    ? `<div class="modal-hint">${I.info}<span>Connect this world character to an object from one of your linked novels, so they stay in sync.</span></div>
      <div class="form-row"><label>Object</label>${buildObjectPickerHtml('wclm-obj', available)}</div>
      <div class="mfoot">
        <button class="btn btn-s" onclick="closeModal()">Cancel</button>
        <button class="btn btn-p" onclick="addCharLink(${worldId},${charId})">Link</button>
      </div>`
    : `<div class="modal-hint">${I.layer}<span>No objects available. Set a category as the character category for a linked novel (${I.person} button in the sidebar).</span></div>
      <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Close</button></div>`;
  openModal('Link Character to Novel Object', availHtml);
}

// Quick tag editor for a world character — same search+add tag UI as the
// full character modal (hashtagSelector), without the rest of the form.
async function openWorldCharTagsModal(worldId, charId) {
  const chars = await api.world.getCharacters(worldId);
  const c = chars.find(ch => ch.id === charId);
  const cTags = await api.world.getCharTags(charId);
  openModal(`Tags — ${c ? x(c.name) : ''}`, `
    ${await hashtagSelector('wchartag', cTags)}
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorldCharTags(${worldId},${charId})">Save</button>
    </div>`);
  setTimeout(() => renderModalTagSuggestions('wchartag'), 60);
}

async function saveWorldCharTags(worldId, charId) {
  await api.world.setCharTags(charId, getModalTagIds('wchartag'));
  closeModal();
  toast('Saved', 'ok');
  if (S.worldTab === 'tags') { await renderWorldMain(); await renderWorldSidebar(S.world); }
  else await setWorldCharCatTab('characters');
}

// Category→object picker — same visual style as the novel picker (.np-*),
// grouping objects by linked novel first, then by category (with the
// category's color shown as a dot) nested inside.
function buildObjectPickerHtml(pickId, objects) {
  const novelGroups = new Map();
  for (const o of (objects || [])) {
    const nk = o.project_name || '—';
    if (!novelGroups.has(nk)) novelGroups.set(nk, new Map());
    const catGroups = novelGroups.get(nk);
    const ck = o.category_name || '—';
    if (!catGroups.has(ck)) catGroups.set(ck, { color: o.category_color || '#6366f1', objs: [] });
    catGroups.get(ck).objs.push(o);
  }
  let inner = '';
  for (const [novel, catGroups] of novelGroups) {
    const novelCount = [...catGroups.values()].reduce((n, g) => n + g.objs.length, 0);
    let catInner = '';
    for (const [cat, { color, objs }] of catGroups) {
      catInner += `<div class="np-folder">
        <div class="np-folder-head" style="padding-left:22px" onclick="event.stopPropagation();toggleObjPickerGroup(this)">
          <svg class="np-caret" style="width:8px;height:8px;flex-shrink:0;transform:rotate(90deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <div class="dot" style="background:${color};width:8px;height:8px;flex-shrink:0"></div>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x(cat)}</span>
          <span style="color:var(--t3);font-size:calc(11px * var(--fsc,1))">${objs.length}</span>
        </div>
        <div class="np-group-items">
          ${objs.map(o => `<div class="np-item" style="padding-left:42px" onclick="event.stopPropagation();selectNovelFromPicker(${xj(pickId)},${o.id},${xj(o.name)})">${x(o.name)}</div>`).join('')}
        </div>
      </div>`;
    }
    inner += `<div class="np-folder">
      <div class="np-folder-head" onclick="event.stopPropagation();toggleObjPickerGroup(this)">
        <svg class="np-caret" style="width:8px;height:8px;flex-shrink:0;transform:rotate(90deg);transition:transform .15s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500">${x(novel)}</span>
        <span style="color:var(--t3);font-size:calc(11px * var(--fsc,1))">${novelCount}</span>
      </div>
      <div class="np-group-items">${catInner}</div>
    </div>`;
  }
  if (!inner) inner = `<div style="padding:10px 12px;color:var(--t3);font-size:calc(13px * var(--fsc,1))">No objects available</div>`;
  return `<div class="novel-picker" id="np-wrap-${pickId}" data-selected-id="" style="width:100%">
    <button class="np-btn" onclick="event.stopPropagation();toggleNovelPicker('${pickId}')" type="button" style="width:100%;min-width:0">
      <span id="np-label-${pickId}" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">— select object —</span>
      <svg style="width:10px;height:10px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="np-dropdown" id="np-drop-${pickId}" style="display:none">${inner}</div>
  </div>`;
}

function toggleObjPickerGroup(headEl) {
  const items = headEl.nextElementSibling;
  if (!items) return;
  const hidden = items.style.display === 'none';
  items.style.display = hidden ? '' : 'none';
  const caret = headEl.querySelector('.np-caret');
  if (caret) caret.style.transform = hidden ? 'rotate(90deg)' : 'rotate(0deg)';
}

async function addCharLink(worldId, charId) {
  const oid = Number(q('#np-wrap-wclm-obj')?.dataset.selectedId);
  if (!oid) return;
  await api.world.addCharLink(charId, oid);
  closeModal();
  await setWorldCharCatTab('characters');
}

async function removeCharLink(worldId, linkId) {
  if (!await uiConfirm(t('confirmRemoveLink'), { okText: t('remove'), cancelText: t('cancel') })) return;
  await api.world.removeCharLink(linkId);
  await setWorldCharCatTab('characters');
}

