// The Welcome screen (v4.6.0) — its own Electron window, not an overlay.
//
// Before, this was a 480px modal shown on top of the vault picker, and only
// when the database held zero vaults. Now main.js opens a dedicated window
// (index.html?welcome=1, createWelcomeWindow) on every launch, boot.js no
// longer restores the last vault, and this screen is the only way into one.
// It reuses the app's own shell — left panel + main area, chrome hidden by
// body.welcome-mode (css/welcome.css) — so modals, the color picker, toasts,
// i18n and theming all come for free.
//
// Picking a vault hands off to a real app window and closes this one
// (window:openNexusReplace), so nothing here ever renders the hub.
//
// On a database with no vaults at all, this window opens on the first-run
// setup wizard instead (S.welcomeStep, set in boot.js) — see the wizard block
// at the bottom of this file.

function renderWelcomeWindow() {
  if (S.welcomeStep != null) return renderWelcomeWizard();
  const recent = recentNexuses(3, null);
  const hasVaults = S.nexuses.length > 0;
  // Left panel: every vault, most-recently-opened first so the list matches
  // the order of the cards on the right, then the rest in the alphabetical
  // order getNexuses() returns.
  const ordered = [...recentNexuses(S.nexuses.length, null)];
  q('#left-panel-inner').innerHTML = `
    <div class="ph"><h4>${t('nexus')}</h4>
      <button class="btn btn-p btn-sm" onclick="welcomeCreateNexus()">+ ${t('nexusNew')}</button>
    </div>
    ${ordered.map(n => `
      <div class="module-item nexus-item" onclick="welcomeOpenNexus(${n.id})" title="${t('wmOpenNexus')}">
        <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>
        <span class="module-name">${x(n.name)}</span>
        <span class="nexus-count">${n.project_count}</span>
        <button class="btn-icon" onclick="event.stopPropagation();openNexusModal(${n.id})" title="${t('edit')}">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
      </div>`).join('')}
    ${hasVaults ? '' : `<div class="welcome-side-empty">${t('nexusEmpty')}</div>`}`;
  q('#left-panel-foot').innerHTML = '';
  q('#main-inner').innerHTML = `
    <div class="welcome-hero">
      <div class="ei"><img src="Image/DraconDex_WhiteOut.png" class="brand-img" alt="DraconDex" style="height:72px;width:72px;opacity:.4"></div>
      <h2 class="welcome-title">${t('wmTitle')}</h2>
      <p class="welcome-text">${hasVaults ? t('nexusSelect') : t('wmText')}</p>
      ${recent.length ? `
        <div class="welcome-recent">
          <div class="welcome-recent-label">${t('wmRecent')}</div>
          <div class="welcome-recent-row">
            ${recent.map(n => `
              <div class="welcome-recent-card" onclick="welcomeOpenNexus(${n.id})" title="${t('wmOpenNexus')}">
                <span class="nexus-vault-dot" style="${n.color_code ? `background:${x(n.color_code)}` : ''}"></span>
                <span class="welcome-recent-name">${x(n.name)}</span>
                <span class="nexus-count">${n.project_count}</span>
              </div>`).join('')}
          </div>
        </div>` : ''}
      <div class="welcome-actions">
        <button class="btn btn-p" onclick="welcomeCreateNexus()">${t('wmCreateNew')}</button>
        <button class="btn btn-s" onclick="importDatabaseFile()">${t('wmImport')}</button>
      </div>
    </div>`;
}

// Hand the chosen vault to a real app window; main.js closes this one once
// that window exists. The MRU is written first — this renderer is about to go
// away, and the new window reads the list at boot.
async function welcomeOpenNexus(id) {
  pushRecentNexus(id);
  await api.window.openNexusReplace(id);
}

// "Create new Nexus" opens the standard vault form with the optional tour
// checkbox. createNexusSubmit (nexus.js) reads it after the vault is created
// and, in this window, defers the tour to the app window it opens.
async function welcomeCreateNexus() {
  openNexusModal(null, { showGuideChoice: true });
}

// ═══ FIRST-RUN SETUP WIZARD ════════════════════════════
// Everything that decides how the whole app looks — language, theme, layout
// style, module naming — plus the optional Drive sign-in, surfaced once on a
// brand-new install instead of staying buried in the Setting window. Every
// step drives the SAME setting the Setting window drives, so there is no
// parallel state: whatever is picked here can be changed there later, and
// vice versa.
//
// Step bodies are pure `() => html` and are read from this one table by both
// the sidebar and the main pane, so adding a step means adding a row here.
const WELCOME_STEPS = [
  { key:'lang',    labelKey:'language',                  body:welcomeStepLangHtml },
  { key:'theme',   labelKey:'theme',                     body:welcomeStepThemeHtml },
  { key:'layout',  labelKey:'settingPageWorkspaceStyle', body:welcomeStepLayoutHtml },
  { key:'names',   labelKey:'moduleNameMode',            body:welcomeStepNamesHtml },
  { key:'account', labelKey:'settingPageAccount',        body:welcomeStepAccountHtml },
];

function renderWelcomeWizard() {
  const idx = Math.max(0, Math.min(WELCOME_STEPS.length - 1, S.welcomeStep));
  const step = WELCOME_STEPS[idx];
  const last = idx === WELCOME_STEPS.length - 1;
  q('#left-panel-inner').innerHTML = `
    <div class="ph"><h4>${t('wzTitle')}</h4></div>
    ${WELCOME_STEPS.map((s, i) => `
      <div class="welcome-step-item${i === idx ? ' active' : ''}${i < idx ? ' done' : ''}" onclick="welcomeWizardGo(${i})">
        <span class="welcome-step-num" data-no-i18n>${i < idx ? '✓' : i + 1}</span>
        <span class="module-name">${t(s.labelKey)}</span>
      </div>`).join('')}
    <button class="btn btn-g btn-sm welcome-step-skip" onclick="welcomeWizardFinish()">${t('guideSkip')}</button>`;
  q('#left-panel-foot').innerHTML = '';
  q('#main-inner').innerHTML = `
    <div class="welcome-wizard">
      <div class="welcome-wizard-head">
        <h2 class="welcome-title">${t(step.labelKey)}</h2>
        <p class="welcome-text">${t('wzIntro')}</p>
      </div>
      <div class="welcome-wizard-body">${step.body()}</div>
      <div class="welcome-wizard-foot">
        ${idx ? `<button class="btn btn-s" onclick="welcomeWizardGo(${idx - 1})">${t('guideBack')}</button>` : ''}
        <button class="btn btn-p" onclick="${last ? 'welcomeWizardFinish()' : `welcomeWizardGo(${idx + 1})`}">${last ? t('guideDone') : t('guideNext')}</button>
      </div>
    </div>`;
  // Drive status is a real IPC (and, when connected, a network) round-trip, so
  // the sign-in step paints its shell first and fills itself in after — same
  // split as settingRefreshAccountSection() in core/account.js.
  if (step.key === 'account') welcomeRefreshLogin();
}

function welcomeWizardGo(n) {
  S.welcomeStep = Math.max(0, Math.min(WELCOME_STEPS.length - 1, n));
  renderWelcomeWindow();
}

// Leaving the wizard just clears the step — nothing is persisted, so a fresh
// launch with still-zero vaults shows it again (boot.js).
function welcomeWizardFinish() {
  S.welcomeStep = null;
  renderWelcomeWindow();
}

// setUiSetting() re-renders different things per key (a theme change only
// calls applyUiSettings(), so the ✓ would not move). Re-rendering here means
// the wizard never depends on which branch it happened to take.
function welcomeSetUi(key, value) {
  setUiSetting(key, value);
  renderWelcomeWindow();
}

// ── Step 1: language ──
function welcomeStepLangHtml() {
  const rows = UI_LANGUAGE_OPTIONS.map(lang => `
    <div class="lang-item${S.settings.language === lang ? ' active' : ''}" onmouseenter="settingPreviewLang('${lang}')" onclick="welcomeSetUi('language','${lang}')">
      <span data-no-i18n>${x(LANGUAGE_LABELS[lang] || lang)}</span>${S.settings.language === lang ? '<span class="theme-check">✓</span>' : ''}
    </div>`).join('');
  return `<div class="prefs-lang-shell">
    <div class="lang-list">${rows}</div>
    <div class="prefs-lang-preview">${settingLangPreviewHtml(S.settingPreviewLang || S.settings.language)}</div>
  </div>`;
}

// ── Step 2: theme ──
function welcomeStepThemeHtml() {
  const palettes = getThemePalettes();
  const cells = UI_THEME_OPTIONS.map(key => settingThemeGridCellHtml(key, t(key), palettes[key] || {}, {
    active: S.settings.theme === key,
    tools: false,
    onclick: `welcomeSetUi('theme','${key}')`,
  })).join('');
  return `<div class="prefs-theme-grid">${cells}</div>`;
}

// ── Step 3: layout (workspace style) ──
function welcomeStepLayoutHtml() {
  const cells = WORKSPACE_STYLE_OPTIONS.map(style => {
    const active = S.settings.workspaceStyle === style;
    const label = style.charAt(0).toUpperCase() + style.slice(1);
    return `<div class="prefs-theme-cell${active ? ' active' : ''}" onclick="welcomeSetWorkspaceStyle('${style}')">
      ${workspaceStylePreviewHtml(style)}
      <div class="prefs-theme-name" data-no-i18n>${label}</div>
      <div class="settings-hint">${t(WORKSPACE_STYLE_DESC_KEY[style])}</div>
      ${active ? '<span class="prefs-theme-check">✓</span>' : ''}
    </div>`;
  }).join('');
  return `<div class="prefs-theme-grid">${cells}</div>`;
}

// Deliberately NOT applyWorkspaceStyleChoice() (core/workspace-style.js): that
// one confirms and reloads because it swaps the app chrome out from under a
// running window. This window renders none of that chrome, and the choice only
// takes effect in the app window opened later, so writing the setting is enough.
//
// And deliberately NOT touching document.body.dataset.workspace: the wyvern
// and dragon rules in css/workspace.css hide #left-panel, which in THIS window
// is the wizard's own step list. The selected card's ✓ is the feedback here;
// the style itself is applied by applyWorkspaceStyle() in the app window.
function welcomeSetWorkspaceStyle(style) {
  if (!WORKSPACE_STYLE_OPTIONS.includes(style)) return;
  S.settings.workspaceStyle = style;
  saveUiSettings();
  toast(t('applied'), 'ok');
  renderWelcomeWindow();
}

// ── Step 4: module names (nameMode) ──
// Four kinds are enough to make the two vocabularies obvious side by side.
const WELCOME_NAME_PREVIEW_KINDS = ['collector', 'manager', 'classifier', 'chronicler'];
function welcomeStepNamesHtml() {
  const uniqueName = k => (typeof KIND_LABEL !== 'undefined' && KIND_LABEL[k]) || k;
  const modes = [
    { mode: 'unique',  label: 'Unique',  names: WELCOME_NAME_PREVIEW_KINDS.map(uniqueName) },
    { mode: 'classic', label: 'Classic', names: WELCOME_NAME_PREVIEW_KINDS.map(k => t(KIND_CLASSIC_KEY[k])) },
  ];
  const cells = modes.map(m => {
    const active = (S.settings.nameMode === 'classic') === (m.mode === 'classic');
    return `<div class="prefs-theme-cell${active ? ' active' : ''}" onclick="welcomeSetUi('nameMode','${m.mode}')">
      <div class="welcome-namemode-preview">
        ${m.names.map(n => `<span class="welcome-namemode-chip">${x(n)}</span>`).join('')}
      </div>
      <div class="prefs-theme-name" data-no-i18n>${m.label}</div>
      ${active ? '<span class="prefs-theme-check">✓</span>' : ''}
    </div>`;
  }).join('');
  return `<div class="prefs-theme-grid">${cells}</div>
    <div class="settings-hint" style="margin-top:10px">${t('moduleNameModeHint')}</div>`;
}

// ── Step 5: sign in (optional) ──
function welcomeStepAccountHtml() {
  return `<p class="welcome-text">${t('wzAccountHint')}</p>
    <div id="welcome-login-body" class="welcome-login-body"></div>`;
}

async function welcomeRefreshLogin() {
  const st = await api.drive.status().catch(() => null);
  // The user can step away while that round-trip is in flight.
  const el = q('#welcome-login-body');
  if (el) el.innerHTML = welcomeLoginBodyHtml(st);
}

function welcomeLoginBodyHtml(st) {
  // No client id/secret baked into this build — sign-in cannot start at all,
  // so point at where the credentials go instead of a button that would fail.
  if (!st?.ok || !st.configured) return `<div class="settings-hint">${t('driveNotConnected')}</div>`;
  if (!st.connected) return `<button class="btn btn-p" id="welcome-login-btn" onclick="welcomeLoginClick()">☁ ${t('driveConnect')}</button>`;
  return `<div class="sync-status-row"><span>${t('settingAccountLoggedInAs')}</span><b data-no-i18n>${x(st.email || '')}</b></div>`;
}

async function welcomeLoginClick() {
  const btn = q('#welcome-login-btn');
  if (btn) btn.disabled = true;
  const r = await api.drive.connect().catch(() => null);
  if (btn) btn.disabled = false;
  if (!r?.ok) { if (typeof driveErrToast === 'function') driveErrToast(r); return; }
  toast(t('driveConnected'), 'ok');
  welcomeRefreshLogin();
}
