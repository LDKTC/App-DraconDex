'use strict';
// The full "Setting window" (Plan.md part1 #Setting) — replaces the old
// Preferences floating panel. Two-level nav (group → page) instead of the
// old flat PREFS_SECTIONS sidebar. Each page is contributed by whichever
// file owns that feature (same "section-per-file" convention the old
// Preferences panel used for Backup/Extension) via registerSettingPage() —
// this file only owns the shell plus the Workspace → Theme/Text&Size pages
// that used to live in settings.js's Preferences panel code.
const SETTING_GROUPS = {
  workspace: ['theme', 'textsize', 'tooltoggle', 'style'],
  user: ['account', 'profile'],
  appdata: ['tokensync', 'database', 'backup'],
  plugin: ['plugin', 'pluginsettings'],
};
const SETTING_GROUP_LABEL_KEY = {
  workspace: 'settingGroupWorkspace', user: 'settingGroupUser',
  appdata: 'settingGroupAppdata', plugin: 'settingGroupPlugin',
};
const SETTING_PAGE_LABEL_KEY = {
  theme: 'theme', textsize: 'settingPageTextSize', tooltoggle: 'settingPageToolToggle',
  style: 'settingPageWorkspaceStyle',
  account: 'settingPageAccount', profile: 'settingPageProfile',
  tokensync: 'settingPageTokenSync', database: 'settingPageDatabase', backup: 'prefs_backup',
  plugin: 'prefs_plugin', pluginsettings: 'settingPagePluginSettings',
};
// Populated by each page's owning file at parse time — key is 'group.page'.
// A page renderer may be synchronous (returns final HTML) or kick off an
// async load and patch its own DOM once ready (the pattern drive.js/
// plugin.js already used for the old Preferences panel sections).
const SETTING_PAGE_RENDERERS = {};
function registerSettingPage(group, page, fn){
  SETTING_PAGE_RENDERERS[`${group}.${page}`] = fn;
}

function openSettingWindow(group, page){
  S.settingGroup = group || S.settingGroup || 'workspace';
  const pages = SETTING_GROUPS[S.settingGroup] || SETTING_GROUPS.workspace;
  S.settingPage = page || (pages.includes(S.settingPage) ? S.settingPage : pages[0]);
  openFloatingPanel('setting-window', `${I.settings} ${t('settingWindowTitle')}`, settingWindowBodyHtml(), {width:1040, height:680});
}
function selectSettingPage(group, page){
  S.settingGroup = group;
  S.settingPage = page;
  renderSettingWindow();
}
function renderSettingWindow(){
  const body = q('#setting-window .fp-body');
  if(body) body.innerHTML = settingWindowBodyHtml();
}
function settingWindowNavHtml(){
  return Object.keys(SETTING_GROUPS).map(g => {
    const openGroup = S.settingGroup === g;
    const pages = SETTING_GROUPS[g].map(p => {
      const active = openGroup && S.settingPage === p;
      return `<button type="button" class="setting-nav-item${active?' active':''}" onclick="selectSettingPage('${g}','${p}')">${t(SETTING_PAGE_LABEL_KEY[p])}</button>`;
    }).join('');
    return `<div class="setting-nav-group${openGroup?' open':''}">
      <div class="setting-nav-head" onclick="selectSettingPage('${g}','${SETTING_GROUPS[g][0]}')">${t(SETTING_GROUP_LABEL_KEY[g])}</div>
      ${openGroup ? `<div class="setting-nav-pages">${pages}</div>` : ''}
    </div>`;
  }).join('');
}
function settingWindowBodyHtml(){
  const key = `${S.settingGroup}.${S.settingPage}`;
  const renderer = SETTING_PAGE_RENDERERS[key];
  const content = renderer ? renderer() : `<div class="empty"><p>${t('syncWorking')}</p></div>`;
  return `<div class="setting-shell"><div class="setting-sidebar">${settingWindowNavHtml()}</div><div class="setting-content">${content}</div></div>`;
}

// ═══ Workspace → Theme (moved from settings.js's old Preferences panel) ══
function settingThemeGridCellHtml(key, name, vars, {active, isCustom} = {}){
  const rawId = isCustom ? key.split(':')[1] : null;
  return `<div class="prefs-theme-cell${active?' active':''}" onclick="setUiSetting('theme','${key}')">
    <div class="ctm-preview mini" style="background:${x(vars['--bg'])};border-color:${x(vars['--border'])}">
      <div class="ctm-pv-side" style="background:${x(vars['--surface'])}">
        <i class="ctm-pv-acc" style="background:${x(vars['--accent'])}"></i>
        <i style="background:${x(vars['--raised'])}"></i>
        <i style="background:${x(vars['--raised'])}"></i>
      </div>
      <div class="ctm-pv-main">
        <span class="ctm-pv-txt w80" style="color:${x(vars['--t2'])}"></span>
        <span class="ctm-pv-txt w60" style="color:${x(vars['--t3'])}"></span>
        <span class="ctm-pv-btn" style="background:${x(vars['--accent'])}"></span>
      </div>
    </div>
    <div class="prefs-theme-name" data-no-i18n>${x(name)}</div>
    <div class="prefs-theme-tools">
      <span onclick="event.stopPropagation();duplicateTheme('${key}')" title="${t('duplicate')}">⧉</span>
      ${isCustom ? `<span onclick="event.stopPropagation();openCustomThemeModal('${rawId}')" title="${t('edit')}">✎</span>
                    <span onclick="event.stopPropagation();deleteCustomTheme('${rawId}')" title="${t('delete')}">×</span>` : ''}
    </div>
    ${active ? '<span class="prefs-theme-check">✓</span>' : ''}
  </div>`;
}
function settingThemePageHtml(){
  const palettes = getThemePalettes();
  const builtins = UI_THEME_OPTIONS.map(key =>
    settingThemeGridCellHtml(key, t(key), palettes[key] || {}, {active: S.settings.theme === key})
  ).join('');
  const customs = (S.settings.customThemes || []).map(ct =>
    settingThemeGridCellHtml(`custom:${ct.id}`, ct.name, ct.vars || {}, {active: S.settings.theme === `custom:${ct.id}`, isCustom: true})
  ).join('');
  const addBox = `<div class="prefs-theme-cell prefs-theme-add" onclick="openCustomThemeModal()" title="${t('customThemeNew')}">+</div>`;
  return `<div class="settings-label">${t('theme')}</div><div class="prefs-theme-grid">${builtins}${customs}${addBox}</div>`;
}
registerSettingPage('workspace', 'theme', settingThemePageHtml);

// ═══ Workspace → Text&Size (language + UI size + font size merged, plus
// an Advanced reveal carrying the per-area size sliders and — since they
// had no other home in the new structure — the shortcuts/tour help block
// and the per-module version-history limit) ═══════════════════════════
const SETTING_LANG_PREVIEW_KEYS = ['settings', 'theme', 'uiSize', 'kcFolder', 'kcProject', 'kcCategory', 'edit', 'delete'];
function settingPreviewLangStrings(lang){
  return SETTING_LANG_PREVIEW_KEYS.map(k => L[lang]?.[k] || L.en[k] || k);
}
function settingLangPreviewHtml(lang){
  return settingPreviewLangStrings(lang).map(s => `<div data-no-i18n>${x(s)}</div>`).join('');
}
function settingPreviewLang(lang){
  S.settingPreviewLang = lang;
  const el = q('.prefs-lang-preview');
  if (el) el.innerHTML = settingLangPreviewHtml(lang);
}
// Per-area UI scale (Plan part1 #Setting, the "advanced" reveal): every text/icon size in
// the app already resolves through `calc(Npx * var(--fsc,1))` (300+ rules,
// see tokens.css) — so overriding `--fsc` as an inline style on just the
// area's own container reuses all of them for free instead of touching any
// component stylesheet. 100% = no override (falls back to the inherited/
// global font scale from applyUiSettings()).
const SETTING_AREA_CONTAINERS = {
  leftPanel: ['#left-panel'],
  navSidebar: ['#nav-sidebar'],
  builder: ['#builder-tabs', '#main-area'],
};
function applyAreaScales(){
  const areas = S.settings.areaScale || {};
  const globalFsc = (S.settings.fontScale || 100) / 100;
  for (const key of Object.keys(SETTING_AREA_CONTAINERS)) {
    const pct = Number(areas[key]);
    const value = Number.isFinite(pct) && pct !== 100 ? String(globalFsc * (pct / 100)) : null;
    for (const sel of SETTING_AREA_CONTAINERS[key]) {
      const el = q(sel);
      if (!el) continue;
      if (value) el.style.setProperty('--fsc', value);
      else el.style.removeProperty('--fsc');
    }
  }
}
function setAreaScale(key, value){
  const v = Math.min(150, Math.max(50, Math.round(Number(value) || 100)));
  S.settings.areaScale = Object.assign({}, S.settings.areaScale, { [key]: v });
  saveUiSettings();
  applyAreaScales();
  renderSettingWindow();
}
function settingTextSizePageHtml(){
  const rows = UI_LANGUAGE_OPTIONS.map(lang => `
    <div class="lang-item${S.settings.language===lang?' active':''}" onmouseenter="settingPreviewLang('${lang}')" onclick="setUiSetting('language','${lang}')">
      <span>${LANGUAGE_LABELS[lang]}</span>${S.settings.language===lang?'<span class="theme-check">✓</span>':''}
    </div>`).join('');
  const areaRows = Object.keys(SETTING_AREA_CONTAINERS).map(key => `
    <div class="fg"><label>${t('settingArea_'+key)} (%)</label>
      <input class="settings-number" type="number" min="50" max="150" value="${(S.settings.areaScale||{})[key] ?? 100}" onchange="setAreaScale('${key}', this.value)"></div>`).join('');
  return `<div class="settings-label">${t('language')}</div>
    <div class="prefs-lang-shell">
      <div class="lang-list">${rows}</div>
      <div class="prefs-lang-preview">${settingLangPreviewHtml(S.settingPreviewLang || S.settings.language)}</div>
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('moduleNameMode')}</div>
      ${nameModeSegHtml()}
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('uiSize')}</div>
      ${uiSizeSlidersHtml()}
    </div>
    <button class="btn ${S.settingAdvanced ? 'btn-p' : 'btn-s'}" onclick="toggleSettingAdvanced()">${t('advanced')}</button>
    ${S.settingAdvanced ? `<div class="prefs-advanced">
      <div class="fg"><label>${t('uiSize')} (%)</label>
        <input class="settings-number" type="number" min="${UI_SIZE_MIN}" max="${UI_SIZE_MAX}" value="${S.settings.size}" onchange="setUiSetting('size', this.value)"></div>
      <div class="fg"><label>${t('fontSize')} (%)</label>
        <input class="settings-number" type="number" min="80" max="130" value="${S.settings.fontScale || 100}" onchange="setUiSetting('fontScale', this.value)"></div>
      <div class="settings-label">${t('settingAreaScale')}</div>
      ${areaRows}
      <div class="settings-label">${t('versionLimit')}</div>
      <input class="settings-number" type="number" min="1" max="500" value="${S.versionLimitCache ?? 50}" onchange="setVersionLimit(this.value)">
      <div class="settings-label">${t('help')}</div>
      <button class="btn btn-s" style="width:100%;margin-bottom:6px" onclick="openShortcutsModal()">${I.info} ${t('shortcuts')}</button>
      <button class="btn btn-s" style="width:100%" onclick="replayGuideTour()">${I.book} ${t('replayTour')}</button>
    </div>` : ''}`;
}
function toggleSettingAdvanced(){
  S.settingAdvanced = !S.settingAdvanced;
  renderSettingWindow();
}
registerSettingPage('workspace', 'textsize', settingTextSizePageHtml);
