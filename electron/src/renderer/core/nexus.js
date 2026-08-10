// Nexus (vault) lifecycle: the workspace switcher dropdown, the picker grid,
// open/close/reload, the recent-vault MRU and create/edit/delete. The Welcome
// screen itself lives in core/welcome.js (its own window since v4.6.0).

// ═══ RECENT VAULTS (MRU) ═══════════════════════════════
// Backed by NEXUS_RECENT_KEY (state.js) — see the note there for why recency
// isn't a DB column. Ids only; names/colors are always read back from
// S.nexuses so a renamed or deleted vault can never go stale here.
function loadRecentNexusIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(NEXUS_RECENT_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(Number.isInteger) : [];
  } catch (e) { return []; }
}

function pushRecentNexus(id) {
  if (!Number.isInteger(id)) return;
  const next = [id, ...loadRecentNexusIds().filter(v => v !== id)].slice(0, 10);
  localStorage.setItem(NEXUS_RECENT_KEY, JSON.stringify(next));
}

function dropRecentNexus(id) {
  localStorage.setItem(NEXUS_RECENT_KEY, JSON.stringify(loadRecentNexusIds().filter(v => v !== id)));
}

// The N most-recently-opened vaults as real rows from S.nexuses, current one
// excluded. Falls back to S.nexuses' own (alphabetical) order to fill the
// list when the MRU is short — a fresh install has no history at all.
function recentNexuses(limit, excludeId = S.nexus?.id) {
  const byId = new Map(S.nexuses.map(n => [n.id, n]));
  const out = [];
  for (const id of loadRecentNexusIds()) {
    if (id === excludeId || !byId.has(id)) continue;
    out.push(byId.get(id));
    if (out.length >= limit) return out;
  }
  for (const n of S.nexuses) {
    if (n.id === excludeId || out.some(v => v.id === n.id)) continue;
    out.push(n);
    if (out.length >= limit) break;
  }
  return out;
}

// Workspace switcher — dropdown opened above the vault-head name pinned at the
// bottom of the left panel. Shows only the 3 most recent vaults (v4.6.0);
// picking one opens it in a new window rather than switching in-place. The
// last row leads to the Welcome window, which is now the full vault list.
function toggleNexusSwitcher(e) {
  e.stopPropagation();
  if (document.querySelector('.nexus-switcher-popup')) { closeAllPopups(); return; }
  closeAllPopups();
  const anchor = e.currentTarget;
  const pop = document.createElement('div');
  pop.className = 'kind-popup nexus-switcher-popup';
  pop.innerHTML = recentNexuses(3).map(n => `
    <div class="nexus-switcher-item" onclick="openNexusWindow(${n.id})">
      <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>${x(n.name)}
    </div>`).join('') + `
    <div class="nexus-switcher-item nexus-switcher-more" onclick="openWelcomeWindow()">${t('wmChangeNexus')}</div>`;
  document.body.appendChild(pop);
  pop.addEventListener('click', ev => ev.stopPropagation());
  positionPopupNear(pop, anchor.getBoundingClientRect());
}

// Every "let me pick a different vault" entry point funnels here: the switcher
// row above, the vault-head ⇄ button (views.js) and the picker fallback below.
function openWelcomeWindow() {
  closeAllPopups();
  api.window.openWelcome();
}

async function openNexusWindow(nexusId) {
  closeAllPopups();
  if (nexusId === S.nexus?.id) return;
  pushRecentNexus(nexusId);
  await api.window.openNexus(nexusId);
}

// Fallback screen for an app window with no vault open. Since v4.6.0 that is
// no longer the normal way in — the Welcome window is — so this is only
// reached after deleting the vault the window had open, or when index.html is
// loaded with no ?nexus= at all (the web-driver harness does exactly that).
// Both "pick a different vault" buttons therefore hand off to the Welcome
// window instead of duplicating its job here.
function renderNexusPicker() {
  leaveBuilderGrid();
  if (!S.nexuses.length) {
    q('#left-panel-inner').innerHTML = `
      <div class="ph"><h4>${t('nexus')}</h4>
        <button class="btn btn-p btn-sm" onclick="openWelcomeWindow()">+ ${t('nexusNew')}</button>
      </div>`;
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei"><img src="../src/assets/brand/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:64px;width:64px;opacity:.35"></div>
      <h3>${t('nexusWelcomeTitle')}</h3>
      <p>${t('nexusEmpty')}</p>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:center;margin-top:18px">
        <button class="btn btn-p" style="min-width:180px" onclick="openWelcomeWindow()">+ ${t('nexusNew')}</button>
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
    <div class="ei"><img src="../src/assets/brand/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:64px;width:64px;opacity:.35"></div>
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
  S.dragonBrowsePath = [];
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
  pushRecentNexus(id);
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

// closeNexus() lived here until v4.6.0: it dropped the window to the in-hub
// picker, which was how you changed vault. The vault-head ⇄ button and the
// switcher's last row now open the Welcome window instead and leave this
// window on its vault, so nothing called it any more.

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
    // Created from the Welcome window: this window is about to close, so hand
    // the new vault to a fresh app window and let the tour start over there
    // (boot.js picks the flag up) instead of running it in a dying renderer.
    if (S.isWelcome) {
      if (S._guideAfterCreate) localStorage.setItem(NEXUS_PENDING_GUIDE_KEY, String(newId));
      S._guideAfterCreate = false;
      await welcomeOpenNexus(newId);
      return;
    }
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
  dropRecentNexus(id);
  await reloadNexuses();
  toast(t('deleted'), 'ok');
  renderNexusHome();
}

