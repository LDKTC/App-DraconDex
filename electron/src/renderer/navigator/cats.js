// Categories borrowed from Director projects into a world, and the objects
// underneath them.
// ═══ Categories / Objects ════════════════════════════
async function renderWorldCats(worldId) {
  const cats = await api.world.getCategories(worldId);
  const head = `<div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="btn btn-p" style="padding:5px 11px;font-size:calc(12px * var(--fsc,1))" onclick="openAddCategoryModal(${worldId})">${I.plus} Add Category</button>
  </div>`;
  if (!cats.length) {
    return head + `<div class="empty"><div class="ei">${I.layer}</div>
      <p style="color:var(--t3);text-align:center;max-width:280px">No categories yet. Link novels, then add their categories.</p></div>`;
  }
  S.worldCatOpen = S.worldCatOpen || new Set();
  let h = '';
  for (const cat of cats) {
    const open = S.worldCatOpen.has(cat.id);
    let objsHtml = '';
    if (open) {
      // Objects are auto-synced live from the novel's category — no manual add/remove.
      const objs = await api.world.getObjects(cat.id);
      objsHtml = objs.length
        ? `<div class="fchildren">` + objs.map(o =>
            `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:.87em;color:var(--t2)">
              <div class="dot" style="background:${o.color_code || '#6366f1'};width:8px;height:8px"></div>
              <button class="btn btn-g btn-i" style="padding:1px 5px;font-size:calc(11px * var(--fsc,1))" title="Choose symbol" data-symbol="${x(o.symbol || '')}" onclick="event.stopPropagation();openObjectSymbolModal(${worldId},${o.id},${o.symbol_ref || 'null'},this.dataset.symbol)">${o.symbol ? x(o.symbol) : I.plus}</button>
              <span style="flex:1">${x(o.name)}</span>
            </div>`).join('') + `</div>`
        : `<div class="fchildren"><div style="font-size:.82em;color:var(--t3)">No objects.</div></div>`;
    }
    h += `<div class="folder-sec" style="background:var(--bg2);border-radius:6px;padding:6px 10px;margin-bottom:6px">
      <div class="fhead" style="gap:8px;padding:0;text-transform:none;font-weight:400;color:inherit" onclick="toggleWorldCatOpen(${cat.id})">
        <svg class="ftgl ${open ? 'open' : ''}" style="width:8px;height:8px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style="font-size:.9em;flex:1">${x(cat.category_name)} <span style="color:var(--t3);font-size:.85em">${x(cat.project_name || '')}</span></span>
        <button class="btn btn-g btn-i" title="Remove category" onclick="event.stopPropagation();removeWorldCategory(${worldId},${cat.id})">${I.delete}</button>
      </div>
      ${objsHtml}
    </div>`;
  }
  return head + h;
}

async function toggleWorldCatOpen(catId) {
  S.worldCatOpen = S.worldCatOpen || new Set();
  if (S.worldCatOpen.has(catId)) S.worldCatOpen.delete(catId);
  else S.worldCatOpen.add(catId);
  await setWorldCharCatTab('categories');
}

async function openAddCategoryModal(worldId) {
  const linkable = await api.world.getLinkableCategories(worldId, false);
  if (!linkable.length) return toast('No categories available from linked novels', 'err');
  openModal('Add Category', `
    <div class="form-row"><label>Category</label>
      <select id="wac-cat" style="width:100%">
        ${linkable.map(c => `<option value="${c.id}">${x(c.category_name)} · ${x(c.project_name || '')}</option>`).join('')}
      </select>
    </div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="addWorldCategory(${worldId})">Add</button>
    </div>`);
}

async function addWorldCategory(worldId) {
  const catref = Number(q('#wac-cat')?.value);
  if (!catref) return;
  await api.world.addCategory(worldId, catref);
  closeModal();
  await setWorldCharCatTab('categories');
}

async function removeWorldCategory(worldId, id) {
  if (!await uiConfirm('Remove this category from the world?')) return;
  await api.world.removeCategory(id);
  await setWorldCharCatTab('categories');
}

async function openObjectSymbolModal(worldId, objectId, currentSymbolRef, currentSymbolText) {
  const picker = await symbolPicker('wos-sym-ref', currentSymbolRef || null, 'wos-sym-preview', 'wos-sym-custom');
  openModal('Choose Symbol', `
    <div class="symsel-box">
      <span class="symsel-preview" id="wos-sym-preview">${x(currentSymbolText || '+')}</span>
      <input type="text" class="symsel-input" id="wos-sym-custom" placeholder="Type a custom symbol..." maxlength="4" value="${x(currentSymbolText || '')}" oninput="onSymbolCustomInput('wos-sym-ref','wos-sym-preview',this.value)">
    </div>
    <div class="form-row"><label>Symbol</label>${picker}</div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveObjectSymbol(${worldId},${objectId})">Save</button>
    </div>`);
}

async function saveObjectSymbol(worldId, objectId) {
  const symRef = Number(q('#wos-sym-ref')?.value) || null;
  const customText = (q('#wos-sym-custom')?.value || '').trim();
  await api.world.updateObjectSymbol(objectId, symRef, symRef ? null : (customText || null));
  closeModal();
  await setWorldCharCatTab('categories');
}

