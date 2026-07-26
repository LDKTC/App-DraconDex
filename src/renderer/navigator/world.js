// World CRUD (create / rename / delete) and the linked-novel list a world
// pulls in from Director.
// ═══ World CRUD ══════════════════════════════════════
async function openWorldModal(id) {
  const isEdit = !!id;
  const w = isEdit ? (await api.world.get(id)) : null;
  const wTags = isEdit ? await api.world.getTags(id) : [];
  const picker = await colorPicker(w?.color || null);
  openModal(isEdit ? 'Edit World' : 'New World', `
    <div class="form-row"><label>Codename</label><input id="wm-code" value="${x(w?.codename || '')}" placeholder="e.g. AAA"></div>
    <div class="form-row"><label>Name *</label><input id="wm-name" value="${x(w?.name || '')}" placeholder="World name"></div>
    <div class="form-row"><label>Memo</label><textarea id="wm-memo" rows="3" style="width:100%;resize:vertical">${x(w?.memo || '')}</textarea></div>
    <div class="form-row"><label>Color</label>${picker}</div>
    ${await hashtagSelector('world', wTags)}
    ${isEdit ? `<button class="btn btn-danger" style="margin-top:8px" onclick="deleteWorld(${id})">Delete World</button>` : ''}
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="saveWorld(${id || 'null'})">${isEdit ? 'Save' : 'Create'}</button>
    </div>`);
  setTimeout(() => renderModalTagSuggestions('world'), 60);
}

async function saveWorld(id) {
  const name = q('#wm-name')?.value?.trim();
  if (!name) return toast('Name required', 'err');
  const code = q('#wm-code')?.value?.trim() || null;
  const memo = q('#wm-memo')?.value?.trim() || null;
  const color = q('#sel-color')?.value || null;
  const tags = getModalTagIds('world');
  if (id) {
    await api.world.update(id, code, name, memo, color);
    await api.world.setTags(id, tags);
    S.world = await api.world.get(id);
  } else {
    const newId = await api.world.create(code, name, memo, color, S.nexus?.id ?? null);
    if (newId) {
      await api.world.setTags(newId, tags);
      S.world = await api.world.get(newId);
    }
  }
  closeModal();
  await renderNavigatorView();
}

async function deleteWorld(id) {
  if (!await uiConfirm('Delete this world and all its data?')) return;
  await api.world.delete(id);
  if (S.world?.id === id) S.world = null;
  closeModal();
  await renderNavigatorView();
}

// ═══ Linked novels (added from the sidebar, like Director's "add category") ══
async function openAddNovelModal(worldId) {
  const [novels, linkable] = await Promise.all([
    api.world.getNovels(worldId),
    api.world.getLinkableProjects(worldId),
  ]);
  if (!linkable.length) return toast('All novels are already linked', 'err');
  const linkedIds = new Set(novels.map(n => n.project_ref));
  openModal('Link Novel', `
    <div class="form-row"><label>Novel</label>${buildNovelPickerHtml('wln-novel', null, linkedIds)}</div>
    <div class="mfoot">
      <button class="btn btn-g" onclick="closeModal()">Cancel</button>
      <button class="btn btn-p" onclick="addWorldNovel(${worldId})">Link</button>
    </div>`);
}

async function addWorldNovel(worldId) {
  const pid = Number(q('#np-wrap-wln-novel')?.dataset.selectedId);
  if (!pid) return toast('Select a novel', 'err');
  await api.world.addNovel(worldId, pid);
  closeModal();
  await renderWorldSidebar(S.world);
}

async function removeWorldNovel(id) {
  if (!await uiConfirm('Unlink this novel from the world?')) return;
  await api.world.removeNovel(id);
  await renderWorldSidebar(S.world);
}

