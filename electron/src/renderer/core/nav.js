// Nav rail + tab bars: MODULE_SUBNAV (per-module rail sub-icons), nav-button
// visibility, the project/module/entity tab strip and its open/switch/close
// paths, the layout menu button and the title-bar vault label.
// Submodule symbols shown on the nav rail when a module's project/entity is active,
// mirroring Director's project-only icons (Timeline / Relation / Map / Tags).
// Navigator's 3 world tabs are plain static `.navigator-only` buttons in index.html
// (each carries a `data-worldtab`) rather than a MODULE_SUBNAV-driven row, since there
// are only 3 of them and the first one doubles as the module's main nav-rail button.
const MODULE_SUBNAV = {
  hero: { setter:'setGameTab', items:[
    ['novel','relation','gameNovelLink'], ['story','story','gameStory'],
    ['tags','hashtag','gameTags'] ] },
  writer: { setter:'setWriteTab', items:[
    ['novel','relation','writeNovelLink'], ['note','story','writeChatnote'] ] },
};

function buildModuleSubNav(){
  const rail = q('#nav-sidebar');
  if(!rail) return;
  // Insert before the flex-spacer (bottom of the module cluster) so the
  // create-from-template button always sits under a module's subnav icons —
  // used to anchor before the Artisan shortcut (Plan part2 #1: removed).
  const anchor = rail.querySelector('div[style*="flex:1"]');
  let html = '';
  for(const [mod, cfg] of Object.entries(MODULE_SUBNAV)){
    for(const [tab, icon, key] of cfg.items){
      html += `<button class="nav-btn ${mod}-sub" data-subtab="${tab}" data-i18n="${key}" style="display:none" onclick="${cfg.setter}('${tab}')">${I[icon]}<span class="nav-label"></span></button>`;
    }
  }
  if(anchor) anchor.insertAdjacentHTML('beforebegin', html);
  else rail.insertAdjacentHTML('beforeend', html);
}

function updateModuleSubNav(){
  const show = {
    hero:      S.activeModule === 'hero'      && !!S.game,
    writer:    S.activeModule === 'writer'    && !!S.write,
  };
  const cur = { hero:S.gameTab, writer:S.writeTab };
  for(const mod of Object.keys(MODULE_SUBNAV)){
    document.querySelectorAll(`.nav-btn.${mod}-sub`).forEach(btn => {
      btn.style.display = show[mod] ? '' : 'none';
      btn.classList.toggle('active', !!show[mod] && btn.dataset.subtab === cur[mod]);
      if(btn.dataset.i18n) {
        const label = t(btn.dataset.i18n);
        btn.setAttribute('title', label);
        const labelEl = btn.querySelector('.nav-label');
        if (labelEl) labelEl.textContent = label;
      }
    });
  }
}


function updateTopNavButton(){
  const logoBtn = q('#nav-logo-btn');
  const inModule = !!S.activeModule;
  if(logoBtn){
    // process2 part1 #3: a collapsed hub always wins the logo slot, even
    // inside a legacy module — it's the app icon's only way back to expand
    // #left-panel now that #hub-toggle-btn lives inside it (see views.js's
    // #nav-logo-btn click handler for the matching click-priority change).
    if(S.leftPanelCollapsed){
      logoBtn.innerHTML = I.panelLeft;
      logoBtn.setAttribute('title', t('toggleHub'));
      logoBtn.classList.remove('is-return');
    } else {
      logoBtn.innerHTML = inModule
        ? I.return
        : `<img src="../src/assets/brand/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex">`;
      const title = !inModule ? 'DraconDex' : S.project ? tr('Back to project list') : S.world ? tr('Back to world list') : tr('Back to Nexus');
      logoBtn.setAttribute('title', title);
      logoBtn.classList.toggle('is-return', inModule);
    }
  }
  document.querySelectorAll('.nav-btn.nexus-only').forEach(btn => {
    // Phase 1 (progress.md Section A): the rail's pinned tools are only
    // Scribe / Sage / Artisan (+ Import Dock) — the four legacy fixed
    // modules leave the rail and live in the hub's Legacy section until
    // their Phase 23 migration into Artisan templates.
    const oc = btn.getAttribute('onclick') || '';
    // Plan part2 §2: un-hidden while S.importDbMode is active, so the
    // read-only Import DB hub can switch between the 4 legacy panels the
    // same way a normal Nexus once did — still calls the unchanged
    // selectModule(...), gated read-only by installImportDbGuard() instead.
    if (/selectModule\('(director|navigator|hero|writer)'\)/.test(oc)) { btn.style.display = S.importDbMode ? '' : 'none'; return; }
    btn.style.display = (!S.activeModule) ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.director-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'director') ? 'flex' : 'none';
  });
  q('#director-project-shortcut')?.classList.toggle('active', S.activeModule === 'director' && S.view === 'projects');
  document.querySelectorAll('.nav-btn.project-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'director' && !!S.project) ? '' : 'none';
  });
  document.querySelectorAll('.nav-btn.navigator-only').forEach(btn => {
    const isMain = btn.dataset.worldtab === 'original';
    btn.style.display = (S.activeModule === 'navigator' && (isMain || !!S.world)) ? '' : 'none';
    btn.classList.toggle('active', S.activeModule === 'navigator' && !!S.world && btn.dataset.worldtab === S.worldTab);
  });
  document.querySelectorAll('.nav-btn.hero-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'hero') ? '' : 'none';
    // With a game active the Hero rail button doubles as the "project"
    // submodule (characters + collections), mirroring Navigator's first tab.
    btn.classList.toggle('active', S.activeModule === 'hero' && !!S.game && S.gameTab === 'project');
  });
  document.querySelectorAll('.nav-btn.writer-only').forEach(btn => {
    btn.style.display = (S.activeModule === 'writer') ? '' : 'none';
    // With a project active the Writer rail button doubles as the "project"
    // submodule (series → books → chapters), mirroring Hero's rail button.
    btn.classList.toggle('active', S.activeModule === 'writer' && !!S.write && S.writeTab === 'project');
  });
  updateModuleSubNav();
}

function returnToProjectList(){
  if (typeof closeRelNodeNote === 'function') closeRelNodeNote();
  S.project = null; S.category = null; S.object = null; S.timeline = null; S.map = null; S.mapAreaId = null;
  S.activeProjectTabId = null; S.projectHashtagId = null;
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b=>b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]')?.classList.add('active');
  renderProjectTabs();
  updateTopNavButton();
  renderSidebar();
  renderWelcome();
}


async function goToActiveProject(){
  S.view = 'projects';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  q('.nav-btn[data-panel="projects"]')?.classList.add('active');
  updateTopNavButton();
  if(S.project) await renderProject();
  else { renderSidebar(); renderWelcome(); }
}

async function openDirectorProjectShortcut(){
  if(S.activeModule !== 'director') S.activeModule = 'director';
  await goToActiveProject();
}

// Navigator equivalent of returnToProjectList: deselect the active world and
// show the world ("navi project") list in the left panel.
async function goToNavigatorList(){
  S.world = null;
  S.view = 'navigator';
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  q('.nav-btn[data-panel="navigator"]')?.classList.add('active');
  updateTopNavButton();
  await loadGroup('navigator');
  renderNavigatorView();
}

function tabFromProject(project){
  return {
    id: project.id,
    name: project.name || 'Untitled',
    codename: project.codename || '',
    color: project.color_code || '#6366f1',
  };
}

function upsertProjectTab(project){
  const next = tabFromProject(project);
  const idx = S.projectTabs.findIndex(t => t.id === next.id);
  if(idx >= 0) S.projectTabs[idx] = next;
  else S.projectTabs.push(next);
  S.activeProjectTabId = next.id;
  renderProjectTabs();
}

// Tabs stay visible across every module — closing one module's window on a
// tab used to hide the tabs of every other module, so an open project/world/
// game/write tab appeared to vanish the moment you switched modules even
// though its state (S.projectTabs / S.entityTabs) was never cleared.
// The tab strip lives inline in the title bar (#builder-tabs, moved up from a
// second row below it), left-aligned with #main-area via #title-left-zone.
// It merges legacy Director project tabs and legacy entity tabs; v3 module
// tabs stay per-pane (Phase 19 — builder.js). The split-layout control lives
// next to it as its own #layout-menu-wrap button (renderLayoutMenuBtn below).
function renderProjectTabs(){
  updateTitlebarVault();
  const el = q('#builder-tabs');
  if(el){
    const dirTabs = S.projectTabs.map(tab => `
      <button class="project-tab ${S.activeModule==='director' && S.activeProjectTabId===tab.id?'active':''}" onclick="switchProjectTab(${tab.id})" title="${x(tab.name)}">
        <span class="tab-dot" style="background:${tab.color}"></span>
        <span class="tab-name">${x(tab.name)}</span>
        <span class="tab-close" onclick="event.stopPropagation();closeProjectTab(${tab.id})" title="${t('closeTab')}">&times;</span>
      </button>
    `).join('');
    const entTabs = S.entityTabs.map(tab => `
      <button class="project-tab ${S.activeModule===tab.module && S.activeEntityTabKey===tab.key?'active':''}" onclick="switchEntityTab(${xj(tab.key)})" title="${x(tab.name)}">
        <span class="tab-dot" style="background:${tab.color}"></span>
        <span class="tab-name">${x(tab.name)}</span>
        <span class="tab-close" onclick="event.stopPropagation();closeEntityTab(${xj(tab.key)})" title="${t('closeTab')}">&times;</span>
      </button>
    `).join('');
    el.innerHTML = dirTabs + entTabs;
    el.classList.toggle('empty', !(dirTabs + entTabs).trim());
  }
  renderLayoutMenuBtn();
  document.title = S.project ? `${S.project.name} - DraconDex` : 'DraconDex';
}

// Title-bar split-layout picker: one trigger button + an overlay list of
// named preset shapes (Plan part4 #2 — builderResetToPreset resets the
// whole tree to a fresh named shape; arbitrary further splitting/closing
// happens per-pane via buttons in builderPaneHeadHtml, builder.js).
// Labels are numeric/symbolic ("1×"/"2×"/"3×"), matching the original
// 3-item menu's own data-no-i18n convention — no new i18n keys needed
// since there's nothing language-specific to translate. With an arbitrary
// tree there's no longer a single "current preset" to highlight against,
// so (unlike the old menu) no item shows an active state.
function renderLayoutMenuBtn(){
  const wrap = q('#layout-menu-wrap');
  const btn = q('#layout-menu-btn');
  const menu = q('#layout-menu');
  if(!wrap || !btn || !menu) return;
  wrap.style.display = S.nexus ? '' : 'none';
  if(!S.nexus) return;
  btn.textContent = '⊞';
  const items = [
    { name: '1',  glyph: '▢', label: '1×' },
    { name: '2h', glyph: '◫', label: '2×' },
    { name: '2v', glyph: '⬓', label: '2×' },
    { name: '3',  glyph: '⊟', label: '3×' },
  ];
  menu.innerHTML = items.map(it => `
    <button class="layout-menu-item" data-no-i18n onclick="builderResetToPreset('${it.name}');toggleLayoutMenu(false)">
      <span>${it.glyph}</span><span>${it.label}</span>
    </button>`).join('');
}

function toggleLayoutMenu(force){
  const menu = q('#layout-menu');
  const btn = q('#layout-menu-btn');
  if(!menu || !btn) return;
  const open = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !open);
  btn.classList.toggle('active', open);
  btn.setAttribute('aria-expanded', String(open));
}

function updateTitlebarVault(){
  const el = q('#titlebar-vault');
  if(el) el.textContent = S.nexus ? `${S.nexus.name} — DraconDex` : 'DraconDex';
}

// v3 module tabs are pane-scoped now (Phase 19): opening a module books it
// into the focused builder pane's tab row + history stack.
function upsertModuleTab(id){
  if (typeof builderNavigate === 'function') builderNavigate({ kind: 'module', id });
  renderProjectTabs();
}

// Legacy views rewrite #main-inner wholesale — drop the builder grid so
// their layout isn't trapped inside it (panes rebuild on return to nexus).
function leaveBuilderGrid(){
  q('#main-inner')?.classList.remove('builder-grid','bl-1','bl-2','bl-4');
}

function upsertEntityTab(entity, type, module) {
  const key = `${type}-${entity.id}`;
  const moduleColors = { world:'#22c55e', game:'#f59e0b', write:'#8b5cf6', note:'#0ea5e9' };
  const tab = { key, id:entity.id, type, module, name:entity.name, color: entity.color_code || moduleColors[type] || '#6366f1' };
  const idx = S.entityTabs.findIndex(t => t.key === key);
  if (idx >= 0) S.entityTabs[idx] = tab;
  else S.entityTabs.push(tab);
  S.activeEntityTabKey = key;
  renderProjectTabs();
}

async function switchEntityTab(key) {
  const tab = S.entityTabs.find(t => t.key === key);
  if (!tab) return;
  S.activeEntityTabKey = key;
  if (tab.type === 'world') {
    S.world = await api.world.get(tab.id);
    S.worldTab = S.worldTab || 'original';
    S.worldChar = null; S.worldCat = null; S.worldMap = null; S.worldMapTl = null;
    const ocats = await api.world.origCat.getAll(tab.id);
    S.worldOrigCat = ocats[0] || null; S.worldOrigObject = null;
    await renderNavigatorView();
  } else if (tab.type === 'game') {
    S.game = await api.game.get(tab.id);
    S.gameTab = S.gameTab || 'project';
    await renderHeroView();
  } else if (tab.type === 'write') {
    S.write = await api.write.getProject(tab.id);
    S.writeTab = 'project'; S.writeSeries = null; S.writeBook = null; S.writeChapter = null;
    S.writeWikiChapter = null; S.writeNote = null;
    await renderWriterView();
  } else if (tab.type === 'note') {
    S.activeModule = 'scribe';
    S.view = 'scribe';
    document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
    q('.nav-btn[data-panel="scribe"]')?.classList.add('active');
    updateTopNavButton();
    await loadModule('src/renderer/scribe.js');
    S.scribeNote = await api.note.get(tab.id);
    await renderScribeView();
  } else {
    renderProjectTabs();
  }
}

async function closeEntityTab(key) {
  const idx = S.entityTabs.findIndex(t => t.key === key);
  if (idx < 0) return;
  const closing = S.entityTabs[idx];
  const wasActive = S.activeModule === closing.module && S.activeEntityTabKey === key;
  S.entityTabs.splice(idx, 1);
  if (!wasActive) { renderProjectTabs(); return; }
  const sameMod = S.entityTabs.filter(t => t.module === closing.module);
  if (sameMod.length > 0) {
    await switchEntityTab(sameMod[Math.min(idx, sameMod.length - 1)].key);
    return;
  }
  S.activeEntityTabKey = null;
  if (closing.type === 'world') { S.world = null; if (S.activeModule==='navigator') await renderNavigatorView(); }
  else if (closing.type === 'game') { S.game = null; if (S.activeModule==='hero') await renderHeroView(); }
  else if (closing.type === 'write') { S.write = null; if (S.activeModule==='writer') await renderWriterView(); }
  else if (closing.type === 'note') { S.scribeNote = null; if (S.activeModule==='scribe') await renderScribeView(); }
  renderProjectTabs();
}

