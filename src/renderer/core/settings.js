// UI settings + the surfaces that edit them: t()/tr() translation lookup,
// load/save/apply of the settings blob, font & UI scale, the gear dropdown,
// the shortcuts modal and the Preferences panel (theme / language / size).
function t(key){
  const lang = S.settings?.language || 'th';
  return L[lang]?.[key] || L.en[key] || key;
}

// Translate a source UI string (Thai or English) through COMMON_UI_TEXT.
// Used for strings rendered outside the DOM observer's reach (toasts,
// confirm dialogs, modal titles) so they translate immediately.
function tr(text){
  const lang = S.settings?.language || 'th';
  const entry = COMMON_UI_TEXT[String(text)];
  if(!entry) return text;
  return entry[lang] || (lang === 'th' ? text : (entry.en || text));
}

function saveUiSettings(){
  localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(S.settings));
}

function applyUiSettings(){
  // custom themes (Phase 22): data-theme 'custom' + the 10 palette tokens
  // as inline CSS vars; built-ins clear them and use style.css rules.
  const custom = String(S.settings.theme).startsWith('custom:')
    ? (S.settings.customThemes || []).find(ct => `custom:${ct.id}` === S.settings.theme) : null;
  document.body.dataset.theme = custom ? 'custom' : S.settings.theme;
  for (const tok of CUSTOM_THEME_TOKENS) {
    if (custom && custom.vars?.[tok]) document.body.style.setProperty(tok, custom.vars[tok]);
    else document.body.style.removeProperty(tok);
  }
  document.documentElement.style.setProperty('--fsc', String((S.settings.fontScale || 100) / 100));
  document.documentElement.lang = S.settings.language;
  const scale = S.settings.size / 100;
  document.documentElement.style.setProperty('--ui-scale', String(scale));
  document.body.style.zoom = String(scale);
  if(scale !== 1){
    document.body.style.height = `${(100 / scale).toFixed(4)}vh`;
    document.body.style.width  = `${(100 / scale).toFixed(4)}vw`;
  } else {
    document.body.style.height = '';
    document.body.style.width  = '';
  }
}

function setUiSetting(key, value){
  const isCustomTheme = String(value).startsWith('custom:') &&
    (S.settings.customThemes || []).some(ct => `custom:${ct.id}` === value);
  if(key === 'theme' && !UI_THEME_OPTIONS.includes(value) && !isCustomTheme) return;
  if(key === 'nameMode' && !['unique','classic'].includes(value)) return;
  if(key === 'fontScale'){
    value = Math.min(130, Math.max(80, Math.round(Number(value) || 100)));
  }
  if(key === 'language' && !UI_LANGUAGE_OPTIONS.includes(value)) return;
  if(key === 'size'){
    value = Number(value);
    if(!Number.isFinite(value)) return;
    value = Math.min(UI_SIZE_MAX, Math.max(UI_SIZE_MIN, Math.round(value)));
  }
  S.settings[key] = value;
  saveUiSettings();
  applyUiSettings();
  renderSettingsMenu();
  if(q('#prefs-panel')) renderPreferencesPanel();
  translateStaticChrome();
  renderProjectTabs();
  if(key === 'language') switchView(S.view || 'projects');
  // the name-mode toggle relabels nest badges / tabs / inspector / status
  // bar instantly (Phase 22 acceptance)
  if(key === 'nameMode' && S.view === 'nexus' && !S.activeModule){ renderNexusHome(); updateStatusBar({}); }
  toast(t('applied'),'ok');
}

function setFontScaleFromSlider(value){
  const v = Math.min(130, Math.max(80, Math.round(Number(value) || 100)));
  S.settings.fontScale = v;
  saveUiSettings();
  document.documentElement.style.setProperty('--fsc', String(v / 100));
  const el = q('#settings-font-value');
  if(el) el.textContent = `${v}%`;
}

function setUiSizeFromSlider(value){
  const size = Math.min(UI_SIZE_MAX, Math.max(UI_SIZE_MIN, Math.round(Number(value) || 100)));
  S.settings.size = size;
  saveUiSettings();
  applyUiSettings();
  const valueEl = q('#settings-size-value');
  if(valueEl) valueEl.textContent = `${size}%`;
}

function updateUiSizeLabel(value){
  const size = Math.min(UI_SIZE_MAX, Math.max(UI_SIZE_MIN, Math.round(Number(value) || 100)));
  const valueEl = q('#settings-size-value');
  if(valueEl) valueEl.textContent = `${size}%`;
}

// Read each theme's live palette straight from the CSS variables so the
// settings picker never drifts from style.css. We briefly swap body's
// data-theme to sample the computed vars, then restore it — all synchronous,
// so the browser never paints an intermediate theme. Result is cached.
let THEME_PALETTE_CACHE = null;
const THEME_SWATCH_VARS = ['--bg','--raised','--accent','--accentH','--t1']; // quick-dropdown swatch strip
function getThemePalettes(){
  if(THEME_PALETTE_CACHE) return THEME_PALETTE_CACHE;
  const body = document.body;
  const prev = body.dataset.theme;
  const cache = {};
  for(const theme of UI_THEME_OPTIONS){
    body.dataset.theme = theme;
    const cs = getComputedStyle(body);
    // Full CUSTOM_THEME_TOKENS superset (not just THEME_SWATCH_VARS) so the
    // Preferences theme-grid mockup (Plan part3) can use the same cache.
    cache[theme] = Object.fromEntries(CUSTOM_THEME_TOKENS.map(tok => [tok, cs.getPropertyValue(tok).trim()]));
  }
  if(prev === undefined) delete body.dataset.theme; else body.dataset.theme = prev;
  THEME_PALETTE_CACHE = cache;
  return cache;
}

// Shared by the quick settings dropdown and the Preferences panel (Plan
// part3) so both surfaces render the identical control from one source.
function nameModeSegHtml(){
  return `<div class="name-mode-seg">
    <button class="btn ${S.settings.nameMode !== 'classic' ? 'btn-p' : 'btn-s'}" onclick="setUiSetting('nameMode','unique')" data-no-i18n>Unique</button>
    <button class="btn ${S.settings.nameMode === 'classic' ? 'btn-p' : 'btn-s'}" onclick="setUiSetting('nameMode','classic')" data-no-i18n>Classic</button>
  </div>
  <div class="settings-hint">${t('moduleNameModeHint')}</div>`;
}
function uiSizeSlidersHtml(){
  return `
    <div class="settings-group">
      <div class="settings-label settings-label-row">
        <span>${t('uiSize')}</span>
        <span id="settings-size-value">${S.settings.size}%</span>
      </div>
      <input class="settings-slider" type="range" min="${UI_SIZE_MIN}" max="${UI_SIZE_MAX}" step="${UI_SIZE_STEP}" value="${S.settings.size}" oninput="updateUiSizeLabel(this.value)" onchange="setUiSizeFromSlider(this.value)">
      <div class="settings-slider-scale"><span>${UI_SIZE_MIN}%</span><span>100%</span><span>${UI_SIZE_MAX}%</span></div>
    </div>
    <div class="settings-group">
      <div class="settings-label settings-label-row">
        <span>${t('fontSize')}</span>
        <span id="settings-font-value">${S.settings.fontScale || 100}%</span>
      </div>
      <input class="settings-slider" type="range" min="80" max="130" step="5" value="${S.settings.fontScale || 100}" oninput="setFontScaleFromSlider(this.value)">
      <div class="settings-slider-scale"><span>80%</span><span>100%</span><span>130%</span></div>
    </div>`;
}

function renderSettingsMenu(){
  const menu = q('#settings-menu');
  if(!menu) return;
  const palettes = getThemePalettes();
  const themeOptions = UI_THEME_OPTIONS.map(theme => {
    const active = S.settings.theme === theme;
    const swatches = THEME_SWATCH_VARS.map(v =>
      `<i style="background:${palettes[theme]?.[v] || ''}"></i>`
    ).join('');
    return `<button type="button" class="theme-item${active?' active':''}" onclick="setUiSetting('theme','${theme}')" title="${t(theme)}">
        <span class="theme-swatches">${swatches}</span>
        <span class="theme-name">${t(theme)}</span>
        ${active?'<span class="theme-check">✓</span>':''}
      </button>`;
  }).join('');
  const customOptions = (S.settings.customThemes || []).map(ct => {
    const key = `custom:${ct.id}`;
    const active = S.settings.theme === key;
    const swatches = ['--bg','--raised','--accent','--accentH','--t1'].map(tok =>
      `<i style="background:${x(ct.vars?.[tok] || '#000')}"></i>`).join('');
    return `<button type="button" class="theme-item${active?' active':''}" onclick="setUiSetting('theme','${key}')" title="${x(ct.name)}">
        <span class="theme-swatches">${swatches}</span>
        <span class="theme-name" data-no-i18n>${x(ct.name)}</span>
        <span class="theme-tools">
          <span class="theme-tool" onclick="event.stopPropagation();openCustomThemeModal('${ct.id}')" title="${t('edit')}">✎</span>
          <span class="theme-tool" onclick="event.stopPropagation();deleteCustomTheme('${ct.id}')" title="${t('delete')}">×</span>
        </span>
        ${active?'<span class="theme-check">✓</span>':''}
      </button>`;
  }).join('');
  const languageOptions = UI_LANGUAGE_OPTIONS.map(lang =>
    `<option value="${lang}" ${S.settings.language===lang?'selected':''}>${LANGUAGE_LABELS[lang]}</option>`
  ).join('');
  menu.innerHTML = `
    <div class="settings-head">
      <span>${t('settings')}</span>
      <button class="settings-close" onclick="toggleSettingsMenu(false)" title="${t('close')}">x</button>
    </div>
    <button class="btn btn-p" style="width:100%;margin-bottom:8px" onclick="toggleSettingsMenu(false);openPreferencesPanel()">${I.settings} ${t('preferencesOpen')}</button>
    <div class="settings-group">
      <div class="settings-label">${t('theme')}</div>
      <div class="theme-list">
        ${themeOptions}${customOptions}
      </div>
      <button class="btn btn-s" style="margin-top:8px;width:100%" onclick="openCustomThemeModal()">${I.plus} ${t('customThemeNew')}</button>
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('language')}</div>
      <select class="settings-select" onchange="setUiSetting('language', this.value)">
        ${languageOptions}
      </select>
    </div>
    ${uiSizeSlidersHtml()}
    <div class="settings-group">
      <div class="settings-label">${t('moduleNameMode')}</div>
      ${nameModeSegHtml()}
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('versionLimit')}</div>
      <input class="settings-number" type="number" min="1" max="500" value="${S.versionLimitCache ?? 50}"
        onchange="setVersionLimit(this.value)">
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('help')}</div>
      <button class="btn btn-s" style="width:100%;margin-bottom:6px" onclick="toggleSettingsMenu(false);openShortcutsModal()">${I.info} ${t('shortcuts')}</button>
      <button class="btn btn-s" style="width:100%" onclick="toggleSettingsMenu(false);replayGuideTour()">${I.book} ${t('replayTour')}</button>
    </div>
  `;
}

// The Ctrl+P/W/Tab/N/E bindings in bindGlobalShortcuts() were previously
// undiscoverable — they appeared nowhere in the UI. Keys stay data-no-i18n
// (they're literal key names, not translatable text).
const SHORTCUT_HELP = [
  ['Ctrl+P', 'scQuickSwitch'],
  ['Ctrl+W', 'scCloseTab'],
  ['Ctrl+Tab', 'scNextTab'],
  ['Ctrl+Shift+Tab', 'scPrevTab'],
  ['Ctrl+N', 'scNewNote'],
  ['Ctrl+E', 'scToggleEditor'],
];
function openShortcutsModal(){
  const rows = SHORTCUT_HELP.map(([combo, key]) =>
    `<div class="li"><span class="name">${t(key)}</span><span class="tag" data-no-i18n>${combo}</span></div>`).join('');
  openModal(t('shortcuts'), `<div class="modal-data">${rows}</div>`);
}

// The first-run coach marks previously fired from exactly one place (the
// welcome modal's tour checkbox) with no way to see them again. guide.js
// already skips steps whose target element is absent, so replaying from an
// arbitrary app state is safe.
async function replayGuideTour(){
  if (typeof startNexusGuide !== 'function') await loadModule('src/renderer/guide.js');
  if (typeof startNexusGuide === 'function') startNexusGuide();
}

async function setVersionLimit(v){
  const n = Math.min(500, Math.max(1, Math.round(Number(v) || 50)));
  S.versionLimitCache = n;
  await api.setting.set('versionLimit', n);
  toast(t('applied'),'ok');
}

// ═══ PREFERENCES PANEL (Plan part3 setting#2) ═══════════════════════════
// Modeless floating panel with sidebar navigation, reached from the quick
// settings dropdown's "Preferences..." button. Deeper/richer surface for
// theme (grid+mockup+duplicate+gradient), language (list+preview) and UI
// size (sliders+advanced numeric entry) — the quick dropdown stays as the
// fast flat picker for the same underlying S.settings.
const PREFS_SECTIONS = ['theme', 'language', 'uisize'];
function openPreferencesPanel(section = S.prefsSection || 'theme'){
  S.prefsSection = section;
  openFloatingPanel('prefs-panel', `${I.settings} ${t('preferencesOpen')}`, prefsBodyHtml(), {width:900, height:620});
}
function selectPrefsSection(key){
  S.prefsSection = key;
  renderPreferencesPanel();
}
function renderPreferencesPanel(){
  const body = q('#prefs-panel .fp-body');
  if(body) body.innerHTML = prefsBodyHtml();
}
function prefsBodyHtml(){
  const nav = PREFS_SECTIONS.map(k =>
    `<button type="button" class="prefs-nav-item${S.prefsSection===k?' active':''}" onclick="selectPrefsSection('${k}')">${t('prefs_'+k)}</button>`
  ).join('');
  const content = S.prefsSection === 'theme' ? prefsThemeSectionHtml()
    : S.prefsSection === 'language' ? prefsLanguageSectionHtml()
    : prefsUiSizeSectionHtml();
  return `<div class="prefs-shell"><div class="prefs-sidebar">${nav}</div><div class="prefs-content">${content}</div></div>`;
}

// ── Theme color section: grid of mini mockups instead of the quick
// dropdown's flat swatch list, plus duplicate + the custom-theme "+" box.
function themeGridCellHtml(key, name, vars, {active, isCustom} = {}){
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
function prefsThemeSectionHtml(){
  const palettes = getThemePalettes();
  const builtins = UI_THEME_OPTIONS.map(key =>
    themeGridCellHtml(key, t(key), palettes[key] || {}, {active: S.settings.theme === key})
  ).join('');
  const customs = (S.settings.customThemes || []).map(ct =>
    themeGridCellHtml(`custom:${ct.id}`, ct.name, ct.vars || {}, {active: S.settings.theme === `custom:${ct.id}`, isCustom: true})
  ).join('');
  const addBox = `<div class="prefs-theme-cell prefs-theme-add" onclick="openCustomThemeModal()" title="${t('customThemeNew')}">+</div>`;
  return `<div class="settings-label">${t('theme')}</div><div class="prefs-theme-grid">${builtins}${customs}${addBox}</div>`;
}

// ── Languages section: real list box + live translation preview (reads
// straight from the L locale table, no separate preview data needed) +
// the module name-mode control underneath.
// kcFolder/kcProject/kcCategory are the Classic-mode module-kind labels
// (KIND_CLASSIC_KEY) — real translated strings, unlike the Unique-mode kind
// names (KIND_LABEL), which are intentionally locale-invariant by design.
const PREFS_LANG_PREVIEW_KEYS = ['settings', 'theme', 'uiSize', 'kcFolder', 'kcProject', 'kcCategory', 'edit', 'delete'];
function previewLangStrings(lang){
  return PREFS_LANG_PREVIEW_KEYS.map(k => L[lang]?.[k] || L.en[k] || k);
}
function prefsLangPreviewHtml(lang){
  return previewLangStrings(lang).map(s => `<div data-no-i18n>${x(s)}</div>`).join('');
}
function prefsPreviewLang(lang){
  S.prefsPreviewLang = lang;
  const el = q('.prefs-lang-preview');
  if (el) el.innerHTML = prefsLangPreviewHtml(lang);
}
function prefsLanguageSectionHtml(){
  const rows = UI_LANGUAGE_OPTIONS.map(lang => `
    <div class="lang-item${S.settings.language===lang?' active':''}" onmouseenter="prefsPreviewLang('${lang}')" onclick="setUiSetting('language','${lang}')">
      <span>${LANGUAGE_LABELS[lang]}</span>${S.settings.language===lang?'<span class="theme-check">✓</span>':''}
    </div>`).join('');
  return `<div class="settings-label">${t('language')}</div>
    <div class="prefs-lang-shell">
      <div class="lang-list">${rows}</div>
      <div class="prefs-lang-preview">${prefsLangPreviewHtml(S.prefsPreviewLang || S.settings.language)}</div>
    </div>
    <div class="settings-group">
      <div class="settings-label">${t('moduleNameMode')}</div>
      ${nameModeSegHtml()}
    </div>`;
}

// ── UI size section: the same sliders as the quick dropdown, plus an
// "Advanced" reveal for typed exact-percent entry (the sliders snap to
// step 5) — reuses S.settings.size/fontScale through the same setUiSetting
// path, no new state surface.
function prefsUiSizeSectionHtml(){
  return `<div class="settings-label">${t('uiSize')}</div>
    ${uiSizeSlidersHtml()}
    <button class="btn ${S.prefsAdvanced ? 'btn-p' : 'btn-s'}" onclick="togglePrefsAdvanced()">${t('advanced')}</button>
    ${S.prefsAdvanced ? `<div class="prefs-advanced">
      <div class="fg"><label>${t('uiSize')} (%)</label>
        <input class="settings-number" type="number" min="${UI_SIZE_MIN}" max="${UI_SIZE_MAX}" value="${S.settings.size}" onchange="setUiSetting('size', this.value)"></div>
      <div class="fg"><label>${t('fontSize')} (%)</label>
        <input class="settings-number" type="number" min="80" max="130" value="${S.settings.fontScale || 100}" onchange="setUiSetting('fontScale', this.value)"></div>
    </div>` : ''}`;
}
function togglePrefsAdvanced(){
  S.prefsAdvanced = !S.prefsAdvanced;
  renderPreferencesPanel();
}

// ═══ CUSTOM THEME EDITOR (Phase 22, mockup 27) ═════════════════════════
function currentPaletteVars(){
  const cs = getComputedStyle(document.body);
  const out = {};
  for (const tok of CUSTOM_THEME_TOKENS) out[tok] = (cs.getPropertyValue(tok) || '#000000').trim();
  return out;
}

