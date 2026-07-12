'use strict';
// Artisan module (v2.8) — create-from-template studio. Pick a target module
// in the sidebar, pick a template card in the main area, fill in a name and a
// few basics, and Artisan scaffolds a ready-to-extend base project in that
// module (categories + fields, timelines, stat templates, series/books/…).
// Reached from the nexus tile and from the rail shortcut shown inside each
// project module (openArtisanFromModule in core.js).

const ARTISAN_TARGETS = [
  { id: 'director',  icon: 'director',  labelKey: 'director' },
  { id: 'navigator', icon: 'navigator', labelKey: 'navigator' },
  { id: 'hero',      icon: 'hero',      labelKey: 'hero' },
  { id: 'writer',    icon: 'writer',    labelKey: 'writer' },
];

// Templates are built at call time so every name runs through t() in the
// user's current language — the scaffolded rows become user data.
function artisanTemplates(target) {
  const fld = (key, type) => ({ name: t(key), type: type || 'text' });
  const stat = (name) => ({ name, type: 'num', levelable: true });
  if (target === 'director') return [
    { id: 'novel-std', nameKey: 'artTplNovelStd', descKey: 'artTplNovelStdD',
      preview: [t('worldChars'), t('artLocations'), t('gameItems'), t('artMainTimeline')],
      build: () => ({
        categories: [
          { name: t('worldChars'),   fields: [fld('artFldRole'), fld('artFldAge'), fld('artFldPersonality', 'textarea'), fld('artFldGoal')] },
          { name: t('artLocations'), fields: [fld('artFldDescription', 'textarea'), fld('artFldHistory', 'textarea')] },
          { name: t('gameItems'),    fields: [fld('artFldDescription', 'textarea'), fld('artFldOwner')] },
        ],
        timelines: [t('artMainTimeline')],
        descs: [t('artFldPremise')],
      }) },
    { id: 'novel-fantasy', nameKey: 'artTplNovelFantasy', descKey: 'artTplNovelFantasyD',
      preview: [t('worldChars'), t('artLocations'), t('artFactions'), t('artMagic'), t('artCreatures'), t('artMainTimeline')],
      build: () => ({
        categories: [
          { name: t('worldChars'),   fields: [fld('artFldRole'), fld('artFldAge'), fld('artFldPersonality', 'textarea'), fld('artFldGoal'), fld('artFldBackstory', 'textarea')] },
          { name: t('artLocations'), fields: [fld('artFldDescription', 'textarea'), fld('artFldHistory', 'textarea')] },
          { name: t('artFactions'),  fields: [fld('artFldDescription', 'textarea'), fld('artFldGoal')] },
          { name: t('artMagic'),     fields: [fld('artFldDescription', 'textarea'), fld('artFldRules', 'textarea')] },
          { name: t('artCreatures'), fields: [fld('artFldDescription', 'textarea')] },
        ],
        timelines: [t('artMainTimeline')],
        descs: [t('artFldPremise')],
      }) },
    { id: 'novel-mystery', nameKey: 'artTplNovelMystery', descKey: 'artTplNovelMysteryD',
      preview: [t('worldChars'), t('artLocations'), t('artClues'), t('artMainTimeline')],
      build: () => ({
        categories: [
          { name: t('worldChars'),   fields: [fld('artFldRole'), fld('artFldMotive'), fld('artFldBackstory', 'textarea')] },
          { name: t('artLocations'), fields: [fld('artFldDescription', 'textarea')] },
          { name: t('artClues'),     fields: [fld('artFldDescription', 'textarea'), fld('artFldOwner')] },
        ],
        timelines: [t('artMainTimeline')],
        descs: [t('artFldPremise')],
      }) },
  ];
  if (target === 'navigator') return [
    { id: 'world-std', nameKey: 'artTplWorldStd', descKey: 'artTplWorldStdD',
      preview: [t('artLocations'), t('artFactions'), t('worldOverview'), t('artFldRules'), t('artFldHistory')],
      build: () => ({
        categories: [
          { name: t('artLocations'), fields: [fld('artFldDescription', 'textarea'), fld('artFldHistory', 'textarea')] },
          { name: t('artFactions'),  fields: [fld('artFldDescription', 'textarea'), fld('artFldGoal')] },
        ],
        descs: [t('worldOverview'), t('artFldRules'), t('artFldHistory')],
      }) },
    { id: 'world-fantasy', nameKey: 'artTplWorldFantasy', descKey: 'artTplWorldFantasyD',
      preview: [t('artLocations'), t('artFactions'), t('artMagic'), t('artCreatures'), t('worldOverview')],
      build: () => ({
        categories: [
          { name: t('artLocations'), fields: [fld('artFldDescription', 'textarea'), fld('artFldHistory', 'textarea')] },
          { name: t('artFactions'),  fields: [fld('artFldDescription', 'textarea'), fld('artFldGoal')] },
          { name: t('artMagic'),     fields: [fld('artFldDescription', 'textarea'), fld('artFldRules', 'textarea')] },
          { name: t('artCreatures'), fields: [fld('artFldDescription', 'textarea')] },
        ],
        descs: [t('worldOverview'), t('artFldHistory')],
      }) },
    { id: 'world-scifi', nameKey: 'artTplWorldScifi', descKey: 'artTplWorldScifiD',
      preview: [t('artLocations'), t('artFactions'), t('artTech'), t('worldOverview')],
      build: () => ({
        categories: [
          { name: t('artLocations'), fields: [fld('artFldDescription', 'textarea'), fld('artFldHistory', 'textarea')] },
          { name: t('artFactions'),  fields: [fld('artFldDescription', 'textarea'), fld('artFldGoal')] },
          { name: t('artTech'),      fields: [fld('artFldDescription', 'textarea'), fld('artFldRules', 'textarea')] },
        ],
        descs: [t('worldOverview'), t('artFldHistory')],
      }) },
  ];
  if (target === 'hero') return [
    { id: 'game-rpg', nameKey: 'artTplGameRpg', descKey: 'artTplGameRpgD',
      preview: ['HP / MP / ATK / DEF', t('gameItems'), t('artSkills'), t('artMainStory')],
      build: () => ({
        charFields: [stat('HP'), stat('MP'), stat('ATK'), stat('DEF'), fld('artFldRole'), fld('artFldBackstory', 'textarea')],
        collections: [
          { name: t('gameItems'), fields: [fld('artFldDescription', 'textarea'), fld('artFldEffect')] },
          { name: t('artSkills'), fields: [fld('artFldDescription', 'textarea'), fld('artFldEffect')] },
        ],
        stories: [t('artMainStory')],
      }) },
    { id: 'game-vn', nameKey: 'artTplGameVn', descKey: 'artTplGameVnD',
      preview: [t('gameChars'), t('artMainStory')],
      build: () => ({
        charFields: [fld('artFldRole'), fld('artFldAppearance', 'textarea'), fld('artFldPersonality', 'textarea'), fld('artFldBackstory', 'textarea')],
        collections: [],
        stories: [t('artMainStory')],
      }) },
    { id: 'game-adv', nameKey: 'artTplGameAdv', descKey: 'artTplGameAdvD',
      preview: ['HP', t('gameItems'), t('artQuests'), t('artMainStory')],
      build: () => ({
        charFields: [stat('HP'), fld('artFldRole')],
        collections: [
          { name: t('gameItems'),  fields: [fld('artFldDescription', 'textarea'), fld('artFldEffect')] },
          { name: t('artQuests'),  fields: [fld('artFldDescription', 'textarea'), fld('artFldEffect')] },
        ],
        stories: [t('artMainStory')],
      }) },
  ];
  if (target === 'writer') return [
    { id: 'write-book', nameKey: 'artTplWriteBook', descKey: 'artTplWriteBookD',
      preview: [`1 ${t('writeSeries')}`, `1 ${t('artBook')}`, `3 ${t('writeChapters')}`],
      build: (name) => ({
        series: [{ name, books: [{ name, chapters: [1, 2, 3].map(n => `${t('artChapter')} ${n}`) }] }],
      }) },
    { id: 'write-trilogy', nameKey: 'artTplWriteTrilogy', descKey: 'artTplWriteTrilogyD',
      preview: [`1 ${t('writeSeries')}`, `3 ${t('writeBooks')}`],
      build: (name) => ({
        series: [{ name, books: [1, 2, 3].map(n => ({ name: `${t('artBook')} ${n}`, chapters: [`${t('artChapter')} 1`] })) }],
      }) },
    { id: 'write-serial', nameKey: 'artTplWriteSerial', descKey: 'artTplWriteSerialD',
      preview: [`1 ${t('writeSeries')}`, `5 ${t('writeChapters')}`, t('artIdeas')],
      build: (name) => ({
        series: [{ name, books: [{ name: `${t('artBook')} 1`, chapters: [1, 2, 3, 4, 5].map(n => `${t('artChapter')} ${n}`) }] }],
        notes: [t('artIdeas')],
      }) },
  ];
  return [];
}

// ═══ v3 STRUCTURE TEMPLATES (Phase 23) ═════════════════════════════════
// The four legacy fixed modules as built-in Nexus-nest templates: each
// scaffolds a Manager Major + pre-filled Minors through
// api.artisan.createV3. Names run through t() at call time — the rows
// become user data in the current language.
function artisanV3Spec(target, name, colorId) {
  const f = (key, type, levelable) => ({ name: t(key), type: type || 'text', levelable: !!levelable });
  const stat = (nm) => ({ name: nm, type: 'number', levelable: true });
  const minors = [];
  if (target === 'director') {
    minors.push(
      { kind: 'classifier', catType: 'character', name: t('worldChars'),
        templates: [f('artFldRole'), f('artFldAge'), f('artFldPersonality', 'textarea'), f('artFldGoal')] },
      { kind: 'classifier', name: t('artLocations'), templates: [f('artFldDescription', 'textarea'), f('artFldHistory', 'textarea')] },
      { kind: 'classifier', name: t('gameItems'), templates: [f('artFldDescription', 'textarea'), f('artFldOwner')] },
      { kind: 'chronicler', name: t('artMainTimeline') },
      { kind: 'drafter', name: t('artFldPremise') },
    );
  } else if (target === 'navigator') {
    minors.push(
      { kind: 'classifier', catType: 'character', name: t('worldChars'),
        templates: [f('artFldRole'), f('artFldAge'), f('artFldPersonality', 'textarea'), f('artFldGoal')] },
      { kind: 'classifier', name: t('artLocations'), templates: [f('artFldDescription', 'textarea'), f('artFldHistory', 'textarea')] },
      { kind: 'classifier', name: t('artFactions'), templates: [f('artFldDescription', 'textarea'), f('artFldGoal')] },
      { kind: 'locator', name: t('kcMap') },
      { kind: 'chronicler', name: t('kcTimeline') },
      { kind: 'drafter', name: t('worldOverview') },
    );
  } else if (target === 'hero') {
    minors.push(
      { kind: 'classifier', catType: 'character', name: t('gameChars'),
        templates: [stat('HP'), stat('MP'), stat('ATK'), stat('DEF'), f('artFldRole'), f('artFldBackstory', 'textarea')] },
      { kind: 'classifier', name: t('gameItems'), templates: [f('artFldDescription', 'textarea'), f('artFldEffect')] },
      { kind: 'narrator', name: t('artMainStory') },
    );
  } else if (target === 'writer') {
    minors.push(
      { kind: 'author', name, chapters: [1, 2, 3].map(n => `${t('artChapter')} ${n}`) },
      { kind: 'drafter', name: t('artIdeas') },
    );
  }
  return { name, colorId: colorId || null, minors };
}

async function createArtisanV3(target) {
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); return; }
  const name = q('#art-name').value.trim();
  if (!name) return;
  const colorId = q('#sel-color')?.value || null;
  const res = await api.artisan.createV3(S.nexus.id, artisanV3Spec(target, name, colorId));
  if (!res?.id) return;
  closeModal();
  toast(t('artisanCreated'), 'ok');
  await returnToNexus();
  await reloadModuleTree();
  await openModuleNode(res.id);
}

async function openArtisanV3Modal(target) {
  const tg = ARTISAN_TARGETS.find(a => a.id === target);
  openModal(`${t(tg.labelKey)} — ${t('artV3Card')}`, `
    <div class="fg"><label>${t('name')} *</label><input id="art-name"></div>
    <div class="fg"><label>${t('color')}</label>${await colorPicker()}</div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="createArtisanV3('${target}')">${t('artisanCreate')}</button>
    </div>`);
  setTimeout(() => q('#art-name').focus(), 60);
}

// ═══ ENTRY / ROUTING ══════════════════════════════════
function renderArtisanView() {
  S.view = 'artisan';
  S.activeModule = 'artisan';
  let h = `<div class="ph"><h4>${t('artisan')}</h4></div>`;
  for (const tg of ARTISAN_TARGETS) {
    h += `<div class="li ${S.artisanTarget === tg.id ? 'active' : ''}" onclick="selectArtisanTarget('${tg.id}')" style="display:flex;align-items:center;gap:8px">
      <span style="display:flex;align-items:center">${I[tg.icon]}</span>
      <span class="name" style="flex:1">${t(tg.labelKey)}</span>
      <span class="cs-count">${artisanTemplates(tg.id).length}</span>
    </div>`;
  }
  // The legacy fixed modules moved off the hub into here (Phase 23) —
  // still reachable until their data is migrated (Phase 24).
  h += `<div class="ph" style="margin-top:14px"><h4>${t('artLegacySection')}</h4></div>`;
  for (const tg of ARTISAN_TARGETS) {
    h += `<div class="li" onclick="selectModule('${tg.id}')" style="display:flex;align-items:center;gap:8px">
      <span style="display:flex;align-items:center">${I[tg.icon]}</span>
      <span class="name" style="flex:1">${t(tg.labelKey)}</span>
    </div>`;
  }
  q('#left-panel-inner').innerHTML = h;
  renderArtisanMain();
  updateTopNavButton();
}

function selectArtisanTarget(target) {
  S.artisanTarget = target;
  renderArtisanView();
}

function renderArtisanMain() {
  if (!S.artisanTarget) {
    q('#main-inner').innerHTML = `<div class="empty" style="margin-top:80px">
      <div class="ei">${I.artisan}</div><h3>${t('artisan')}</h3><p>${t('artisanWelcomeText')}</p></div>`;
    return;
  }
  const tg = ARTISAN_TARGETS.find(a => a.id === S.artisanTarget);
  let h = `<div class="detail-head" style="border-left:4px solid var(--accent);padding-left:12px">
    <h2 style="margin:0;font-size:1.1em">${t(tg.labelKey)} <span style="color:var(--t3);font-weight:400;font-size:.8em">· ${t('artisanPickTemplate')}</span></h2>
  </div>
  <div class="artisan-grid">`;
  // Built-in v3 structure card first (Phase 23) — creates a Nexus-nest
  // Major/Minor set instead of a legacy project.
  const v3Spec = artisanV3Spec(S.artisanTarget, '·');
  h += `<div class="artisan-card artisan-v3" onclick="openArtisanV3Modal('${S.artisanTarget}')">
    <div class="artisan-card-head">
      <span class="artisan-card-icon">${I[tg.icon]}</span>
      <h4>${t('artV3Card')} <span class="kind-chip" data-no-i18n>v3</span></h4>
    </div>
    <p>${t('artV3CardD')}</p>
    <div class="artisan-inc">${t('artisanIncludes')}</div>
    <div class="artisan-inc-list">${v3Spec.minors.map(mn => `<span class="artisan-chip">${x(mn.name)} <small data-no-i18n>${x(kindLabel(mn.kind))}</small></span>`).join('')}</div>
    <button class="btn btn-p" style="margin-top:10px;width:100%" onclick="event.stopPropagation();openArtisanV3Modal('${S.artisanTarget}')">${I.plus} ${t('artisanCreate')}</button>
  </div>`;
  for (const tpl of artisanTemplates(S.artisanTarget)) {
    h += `<div class="artisan-card" onclick="openArtisanCreateModal('${tpl.id}')">
      <div class="artisan-card-head">
        <span class="artisan-card-icon">${I[tg.icon]}</span>
        <h4>${t(tpl.nameKey)}</h4>
      </div>
      <p>${t(tpl.descKey)}</p>
      <div class="artisan-inc">${t('artisanIncludes')}</div>
      <div class="artisan-inc-list">${tpl.preview.map(p => `<span class="artisan-chip">${x(p)}</span>`).join('')}</div>
      <button class="btn btn-p" style="margin-top:10px;width:100%" onclick="event.stopPropagation();openArtisanCreateModal('${tpl.id}')">${I.plus} ${t('artisanCreate')}</button>
    </div>`;
  }
  h += `</div>
  <div class="detail-head" style="border-left:4px solid var(--border);padding-left:12px;margin-top:22px">
    <h2 style="margin:0;font-size:1.05em">${t('artMigrateSection')}</h2>
  </div>
  <div id="art-migrate-list" class="hlist" style="max-width:560px"><div class="empty" style="padding:14px"><p>…</p></div></div>`;
  q('#main-inner').innerHTML = h;
  fillArtisanMigrateList(S.artisanTarget);
}

// Legacy projects of this target, each importable as a v3 structure
// (Phase 24 — lazy, non-destructive; original rows stay).
async function fillArtisanMigrateList(target) {
  const el = q('#art-migrate-list');
  if (!el) return;
  const rows = await api.migrate.list(target);
  if (S.artisanTarget !== target || !q('#art-migrate-list')) return;
  el.innerHTML = rows.length ? rows.map(r => `
    <div class="li">
      <span class="name">${x(r.name)}</span>
      <button class="btn btn-s btn-sm" onclick="runArtisanMigration('${target}',${r.id},this)">${t('artMigrateBtn')}</button>
    </div>`).join('') : `<div class="empty" style="padding:14px"><p>${t('artMigrateEmpty')}</p></div>`;
}

async function runArtisanMigration(target, legacyId, btn) {
  if (!S.nexus) { toast(t('nexusSelectFirst'), 'error'); return; }
  if (btn) btn.disabled = true;
  try {
    const res = await api.migrate.run(S.nexus.id, target, legacyId);
    const c = res.counts || {};
    toast(`${t('artMigrateDone')} — ${c.modules} modules · ${c.objects} objects · ${c.events} events · ${c.chapters} chapters · ${c.dialogues} dialogues`, 'ok');
    await returnToNexus();
    await reloadModuleTree();
    if (res.id) await openModuleNode(res.id);
  } catch (e) {
    toast(t('vRestoreFailed'), 'error');
    if (btn) btn.disabled = false;
  }
}

// ═══ CREATE MODAL ═════════════════════════════════════
async function openArtisanCreateModal(tplId) {
  const tpl = artisanTemplates(S.artisanTarget).find(tp => tp.id === tplId);
  if (!tpl) return;
  const hasMemo = S.artisanTarget !== 'writer'; // write_project has no memo column
  openModal(`${t(tpl.nameKey)}`, `
    <div class="fg"><label>${t('name')} *</label><input id="art-name"></div>
    <div class="fg"><label>Codename</label><input id="art-code"></div>
    ${hasMemo ? `<div class="fg"><label>${t('memo')}</label><textarea id="art-memo"></textarea></div>` : ''}
    <div class="fg"><label>${t('color')}</label>${await colorPicker()}</div>
    <div class="mfoot">
      <button class="btn btn-s" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-p" onclick="createFromArtisanTemplate('${tpl.id}')">${t('artisanCreate')}</button>
    </div>`);
  setTimeout(() => q('#art-name').focus(), 60);
}

async function createFromArtisanTemplate(tplId) {
  const tpl = artisanTemplates(S.artisanTarget).find(tp => tp.id === tplId);
  if (!tpl) return;
  const name = q('#art-name').value.trim();
  if (!name) return;
  const base = {
    name,
    codename: q('#art-code').value.trim() || null,
    memo: q('#art-memo')?.value.trim() || null,
    colorId: q('#sel-color')?.value || null,
  };
  const spec = tpl.build(name);
  let res;
  if      (S.artisanTarget === 'director')  res = await api.artisan.createNovel(base, spec);
  else if (S.artisanTarget === 'navigator') res = await api.artisan.createWorld(base, spec);
  else if (S.artisanTarget === 'hero')      res = await api.artisan.createGame(base, spec);
  else if (S.artisanTarget === 'writer')    res = await api.artisan.createWrite(base, spec);
  if (!res?.id) return;
  closeModal();
  toast(t('artisanCreated'), 'ok');
  await artisanOpenCreated(S.artisanTarget, res);
}

// Jump into the freshly scaffolded entity inside its own module, mirroring
// what selectModule() + the module's own select fn would do.
async function artisanOpenCreated(target, res) {
  document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
  if (target === 'director') {
    S.activeModule = 'director';
    S.view = 'projects';
    q('.nav-btn[data-panel="projects"]')?.classList.add('active');
    await reloadSidebar();
    await selectProject(res.id);
  } else if (target === 'navigator') {
    S.activeModule = 'navigator';
    S.view = 'navigator';
    q('.nav-btn[data-panel="navigator"]')?.classList.add('active');
    await loadModule('src/renderer/navigator.js');
    await selectWorld(res.id);
  } else if (target === 'hero') {
    S.activeModule = 'hero';
    S.view = 'hero';
    q('.nav-btn[data-panel="hero"]')?.classList.add('active');
    await loadModule('src/renderer/hero.js');
    await selectGame(res.id);
  } else if (target === 'writer') {
    S.activeModule = 'writer';
    S.view = 'writer';
    q('.nav-btn[data-panel="writer"]')?.classList.add('active');
    await loadModule('src/renderer/writer.js');
    await selectWriteSeries(res.id, res.seriesId ?? null);
  }
}
