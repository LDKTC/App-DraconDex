// Nexus (vault) lifecycle: the workspace switcher dropdown, the picker grid,
// open/close/reload, the first-run welcome modal and create/edit/delete.
// Workspace switcher — dropdown of every Nexus, opened above the vault-head
// name pinned at the bottom of the left panel. Picking one opens it in a new
// window rather than switching in-place (that's still the ⇄ button).
function toggleNexusSwitcher(e) {
  e.stopPropagation();
  if (document.querySelector('.nexus-switcher-popup')) { closeAllPopups(); return; }
  closeAllPopups();
  const anchor = e.currentTarget;
  const pop = document.createElement('div');
  pop.className = 'kind-popup nexus-switcher-popup';
  pop.innerHTML = S.nexuses.map(n => `
    <div class="nexus-switcher-item${n.id === S.nexus.id ? ' active' : ''}" onclick="openNexusWindow(${n.id})">
      <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>${x(n.name)}
    </div>`).join('');
  document.body.appendChild(pop);
  pop.addEventListener('click', ev => ev.stopPropagation());
  positionPopupNear(pop, anchor.getBoundingClientRect());
}

async function openNexusWindow(nexusId) {
  closeAllPopups();
  if (nexusId === S.nexus?.id) return;
  await api.window.openNexus(nexusId);
}

function renderNexusPicker() {
  leaveBuilderGrid();
  // First-run onboarding: no Nexus exists at all. The init() gate opens the Welcome
  // modal on top of this screen; if the user picks "create later" they land here, so
  // the primary button reopens the same Welcome modal for a consistent entry point.
  if (!S.nexuses.length) {
    q('#left-panel-inner').innerHTML = `
      <div class="ph"><h4>${t('nexus')}</h4>
        <button class="btn btn-p btn-sm" onclick="openWelcomeModal()">+ ${t('nexusNew')}</button>
      </div>`;
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei"><img src="Image/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:64px;width:64px;opacity:.35"></div>
      <h3>${t('nexusWelcomeTitle')}</h3>
      <p>${t('nexusEmpty')}</p>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center;margin-top:18px">
        <button class="btn btn-p" style="min-width:180px" onclick="openWelcomeModal()">+ ${t('nexusNew')}</button>
        <button class="btn btn-s" style="min-width:180px" onclick="importDatabaseFile()">${t('importDb')}</button>
      </div>
    </div>`;
    return;
  }
  q('#left-panel-inner').innerHTML = `
    <div class="ph"><h4>${t('nexus')}</h4>
      <button class="btn btn-p btn-sm" onclick="openNexusModal()">+ ${t('nexusNew')}</button>
    </div>
    ${S.nexuses.map(n => `
      <div class="module-item nexus-item" onclick="selectNexus(${n.id})">
        <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>
        <span class="module-name">${x(n.name)}</span>
        <span class="nexus-count">${n.project_count}</span>
        <button class="btn-icon" onclick="event.stopPropagation();openNexusModal(${n.id})" title="${t('edit')}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
      </div>`).join('')}`;
  q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
    <div class="ei"><img src="Image/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:64px;width:64px;opacity:.35"></div>
    <h3>${t('nexusWelcomeTitle')}</h3>
    <p>${t('nexusSelect')}</p>
  </div>`;
}

async function reloadNexuses() {
  S.nexuses = await api.nexus.getAll();
  if (S.nexus) S.nexus = S.nexuses.find(n => n.id === S.nexus.id) || null;
}

function clearWorkspaceTabs() {
  S.projectTabs = []; S.activeProjectTabId = null;
  S.entityTabs = []; S.activeEntityTabKey = null;
  S.project = null; S.category = null; S.object = null;
  S.timeline = null; S.map = null; S.mapAreaId = null;
  S.world = null; S.game = null; S.write = null;
  S.scribeNote = null; S.scribeOpenFolders = new Set();
  S.moduleTree = []; S.activeModuleNode = null; S.moduleTabs = [];
  S.builder = null; S.filePreview = null; S.sageHut = null; S.sageHutCache = null; S.kindBrowserPage = false; S.importDockPage = false; S.importFiles = undefined;
  S.wyvernBrowsePath = [];
  if (S.importDbMode) { S.importDbMode = false; api.setImportDbMode(false); }
  if (typeof invalidateDisplayImages === 'function') invalidateDisplayImages();
  q('#main-inner')?.querySelectorAll(':scope > .bpane').forEach(el => el.remove());
  renderProjectTabs();
}

async function selectNexus(id) {
  await reloadNexuses();
  S.nexus = S.nexuses.find(n => n.id === id) || null;
  if (!S.nexus) return;
  localStorage.setItem(NEXUS_ACTIVE_KEY, String(id));
  clearWorkspaceTabs();
  // Same three-call wave as boot (Plan part2 #2.5): seeding the Nest items
  // here is what stops the first render firing one lazy fetch + one full
  // re-render per content module. Two sequential awaits became one.
  const [projects, moduleTree, nestItems] = await Promise.all([
    api.project.getAll(null, S.nexus.id),
    api.module.getTree(S.nexus.id),
    api.module.getNestItems(S.nexus.id),
  ]);
  S.projects = projects; S.moduleTree = moduleTree;
  seedNestItems(nestItems);
  renderNexusHome();
  renderModuleRail();
  updateStatusBar({ item: null, words: null, saveState: null });
}

function closeNexus() {
  S.nexus = null;
  localStorage.removeItem(NEXUS_ACTIVE_KEY);
  clearWorkspaceTabs();
  renderNexusHome();
  renderModuleRail();
  updateStatusBar({ item: null, words: null, saveState: null });
}

// First-run Welcome modal: a required-choice screen shown while no Nexus exists.
// Offers create / import / "create later" (the low-emphasis skip). The ✕ is hidden so
// the choice is explicit; "create later" just closes it and the picker hero stays.
function openWelcomeModal() {
  openModal(t('wmTitle'), `
    <div style="text-align:center">
      <div class="ei" style="margin:0 auto 6px;width:56px"><img src="Image/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:56px;width:56px;opacity:.5"></div>
      <p style="color:var(--t2);margin:0 0 18px">${t('wmText')}</p>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        <button class="btn btn-p" style="min-width:200px" onclick="welcomeCreateNexus()">${t('wmCreateNew')}</button>
        <button class="btn btn-s" style="min-width:200px" onclick="closeModal();importDatabaseFile()">${t('wmImport')}</button>
        <button class="btn btn-g btn-sm" style="margin-top:6px;color:var(--t3)" onclick="closeModal()">${t('wmLater')}</button>
      </div>
    </div>`);
  const closeBtn = q('#modal-close'); if(closeBtn) closeBtn.style.display='none';
}

// "Create new Nexus" from the Welcome modal opens the form with an optional tour.
// createNexusSubmit reads the checkbox after the vault is created.
async function welcomeCreateNexus() {
  openNexusModal(null, { showGuideChoice: true });
}

async function openNexusModal(id = null, { showGuideChoice = false } = {}) {
  await reloadNexuses();
  const n = id ? S.nexuses.find(v => v.id === id) : null;
  openModal(n ? `✏️ ${t('nexusEdit')}` : `🗄️ ${t('nexusNew')}`, `
    <div class="fg"><label>${t('name')} *</label><input id="nx-name" value="${x(n?.name || '')}"></div>
    <div class="fg"><label>${t('memo')}</label><textarea id="nx-memo">${x(n?.memo || '')}</textarea></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker(n?.color)}</div>
    ${!n && showGuideChoice ? `<div class="fg"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input id="nx-guide" type="checkbox" checked> ${t('nexusTourOption')}</label></div>` : ''}
    <div class="mfoot">
      ${n ? `<button class="btn btn-d" onclick="delNexus(${id})">${t('delete')}</button>`
          : `<button class="btn btn-s" onclick="closeModal();importDatabaseFile()">${t('importDb')}</button>`}
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="${n ? `saveNexus(${id})` : 'createNexusSubmit()'}">${n ? t('save') : t('create')}</button>
    </div>`);
  setTimeout(() => q('#nx-name').focus(), 60);
}

async function createNexusSubmit() {
  const name = q('#nx-name').value.trim(); if (!name) return;
  S._guideAfterCreate = Boolean(q('#nx-guide')?.checked);
  try {
    const newId = await api.nexus.create(name, q('#nx-memo').value.trim(), q('#sel-color').value || null);
    closeModal();
    await reloadNexuses();
    toast(t('nexusCreated'), 'ok');
    await selectNexus(newId);
    // Users who opted in get the coach-marks tour once the vault home is rendered.
    if (S._guideAfterCreate) {
      S._guideAfterCreate = false;
      await loadModule('src/renderer/guide.js');
      if (typeof startNexusGuide === 'function') startNexusGuide();
    }
  } catch (e) { toast(t('nexusNameTaken'), 'error'); }
}

async function saveNexus(id) {
  const name = q('#nx-name').value.trim(); if (!name) return;
  try {
    await api.nexus.update(id, name, q('#nx-memo').value.trim(), q('#sel-color').value || null);
    closeModal();
    await reloadNexuses();
    toast(t('saved'), 'ok');
    renderNexusHome();
  } catch (e) { toast(t('nexusNameTaken'), 'error'); }
}

async function delNexus(id) {
  if (!await uiConfirm(t('nexusDeleteConfirm'))) return;
  const r = await api.nexus.delete(id);
  if (r?.blocked) { toast(t('nexusDeleteBlocked'), 'error'); return; }
  closeModal();
  if (S.nexus?.id === id) { S.nexus = null; localStorage.removeItem(NEXUS_ACTIVE_KEY); clearWorkspaceTabs(); }
  await reloadNexuses();
  toast(t('deleted'), 'ok');
  renderNexusHome();
}

