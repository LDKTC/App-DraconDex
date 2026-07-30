'use strict';
// Github — Cloud Sync Function > Github (Plan.md). Install/list/uninstall
// UI for GitHub-hosted extensions — the actual sandboxed execution and the
// extApi.* table bridge live in main.js/preload-ext.js/src/db/extension.js;
// this file only talks to the main-app-facing api.extension.* surface
// (never api.extApi — that bridge doesn't even exist in this window). See
// docs/EXTENSIONS.md.

function extensionErrToast(r) {
  const map = {
    bad_repo: 'extensionErrBadRepo',
    no_manifest: 'extensionErrNoManifest',
    bad_manifest: 'extensionErrBadManifest',
    already_installed: 'extensionErrAlreadyInstalled',
    missing_file: 'extensionErrBadManifest',
    too_large: 'extensionErrBadManifest',
    network: 'extensionErrNetwork',
    install_failed: 'extensionErrServer',
    running: 'extensionErrRunning',
    not_found: 'extensionErrNotFound',
  };
  toast(t(map[r?.code] || 'extensionErrServer'), 'error');
}

// Setting-window page-render function — kicks off an async load and patches
// its own DOM once ready, same pattern every setting page uses. (Was
// prefsExtensionSectionHtml under the old Preferences panel; renamed,
// otherwise unchanged.)
function settingExtensionPageHtml() {
  extensionRefreshSection();
  return `<div class="settings-label">${t('prefs_extension')}</div><div id="extension-body">${t('syncWorking')}</div>`;
}
registerSettingPage('extension', 'extension', settingExtensionPageHtml);

async function extensionRefreshSection() {
  const list = await api.extension.list();
  const el = q('#extension-body');
  if (!el) return; // panel closed or switched section before this resolved
  const running = await Promise.all(list.map((e) => api.extension.isRunning(e.id)));
  el.innerHTML = extensionBodyHtml(list, running);
}

function extensionRowHtml(e, isRunning) {
  return `
    <div class="sync-upload-row">
      <div>
        <b>${x(e.name)}</b> <span class="sync-hint">v${x(e.version || '—')}</span>
        <div class="sync-hint">${x(e.repo_owner)}/${x(e.repo_name)}@${x(e.repo_ref)} · ${e.tables.length} ${t('extensionTablesLabel')}</div>
      </div>
      <div class="sync-upload-actions">
        ${isRunning
          ? `<button class="btn btn-d btn-sm" onclick="extensionStopClick(${e.id})">${t('extensionStop')}</button>`
          : `<button class="btn btn-s btn-sm" onclick="extensionLaunchClick(${e.id})">${t('extensionLaunch')}</button>`}
        <button class="btn btn-d btn-sm" onclick="extensionUninstallClick(${e.id})">${t('delete')}</button>
      </div>
    </div>`;
}

function extensionBodyHtml(list) {
  const rows = list.length
    ? list.map(extensionRowHtml).join('')
    : `<div class="modal-hint">${I.info}<span>${t('extensionNoneInstalled')}</span></div>`;
  return `
    <div class="fg">
      <label>${t('extensionInstallNew')}</label>
      <div class="sync-hint">${t('extensionInstallHint')}</div>
      <input id="ext-owner" placeholder="${t('extensionOwnerPlaceholder')}">
      <input id="ext-repo" placeholder="${t('extensionRepoPlaceholder')}">
      <input id="ext-ref" placeholder="main" value="main">
      <button class="btn btn-p" id="ext-install-btn" onclick="extensionInstallClick()">${t('extensionInstall')}</button>
    </div>
    ${rows}`;
}

async function extensionInstallClick() {
  const owner = q('#ext-owner')?.value.trim();
  const repo = q('#ext-repo')?.value.trim();
  const ref = q('#ext-ref')?.value.trim() || 'main';
  if (!owner || !repo) return toast(t('extensionErrBadRepo'), 'error');
  syncBtnBusy('#ext-install-btn', true);
  const r = await api.extension.install(owner, repo, ref);
  syncBtnBusy('#ext-install-btn', false);
  if (!r.ok) return extensionErrToast(r);
  toast(t('extensionInstalled'), 'ok');
  extensionRefreshSection();
}

async function extensionLaunchClick(id) {
  const r = await api.extension.launch(id);
  if (!r.ok) return extensionErrToast(r);
  extensionRefreshSection();
}

// extension:stop/isRunning have been fully wired end-to-end since the
// original GitHub-extension build — this is just the first UI caller.
async function extensionStopClick(id) {
  const r = await api.extension.stop(id);
  if (!r.ok) return extensionErrToast(r);
  extensionRefreshSection();
}

async function extensionUninstallClick(id) {
  if (!(await uiConfirm(t('extensionUninstallConfirm')))) return;
  const r = await api.extension.uninstall(id);
  if (!r.ok) return extensionErrToast(r);
  toast(t('extensionUninstalled'), 'ok');
  extensionRefreshSection();
}

// Setting window → Extension → Extension setting (Plan.md part1 #Setting).
// No installed-extension manifest declares a settings schema today — the
// dracondex-extension.json format (docs/EXTENSIONS.md) has no such field
// yet — so this just lists what's installed with an empty state instead of
// inventing a settings UI for a schema that doesn't exist. Once a manifest
// gains a `settingsEntry`/`settingsSchema` field, that's what renders here
// per extension instead of the placeholder line.
function settingExtSettingsPageHtml() {
  extensionRefreshSettingsSection();
  return `<div class="settings-label">${t('settingPageExtSettings')}</div><div id="extension-settings-body">${t('syncWorking')}</div>`;
}
async function extensionRefreshSettingsSection() {
  const list = await api.extension.list();
  const el = q('#extension-settings-body');
  if (!el) return;
  el.innerHTML = list.length
    ? list.map((e) => `<div class="li"><span class="name">${x(e.name)}</span><span class="tag">${t('settingExtNoSettings')}</span></div>`).join('')
    : `<div class="modal-hint">${I.info}<span>${t('extensionNoneInstalled')}</span></div>`;
}
registerSettingPage('extension', 'extsettings', settingExtSettingsPageHtml);
