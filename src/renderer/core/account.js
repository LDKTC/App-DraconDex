'use strict';
// Setting window → User → Account / User profile (Plan.md part1 #Setting).
// Account reads the Cloud Sync login (src/renderer/sync.js's api.sync.*) —
// deliberately does NOT introduce a new unified account concept: Sync and
// Drive are independent Google logins by design (see docs/DRIVE.md), so this
// page shows Sync's login/tier (the thing that actually HAS a tier) and
// links to the existing Backup page for Drive's own connect flow instead of
// duplicating an OAuth button here. User profile manages named layout
// slots in Drive appdata (src/db/drive.js's driveListLayoutSlots and
// friends) — that needs a connected Drive, so it also links to Backup when
// not yet connected, rather than inventing a second Drive login button.

const SETTING_TIER_COPY = {
  free: { labelKey: 'settingAccountTierFree', benefitsKey: 'settingAccountBenefitsFree' },
  pro: { labelKey: 'settingAccountTierPro', benefitsKey: 'settingAccountBenefitsPro' },
};

function settingAccountPageHtml(){
  settingRefreshAccountSection();
  return `<div class="settings-label">${t('settingPageAccount')}</div><div id="setting-account-body">${t('syncWorking')}</div>`;
}
async function settingRefreshAccountSection(){
  const [auth, status] = await Promise.all([api.sync.authStatus(), api.sync.status(null)]);
  const el = q('#setting-account-body');
  if (!el) return; // window closed or switched page before this resolved
  el.innerHTML = settingAccountBodyHtml(auth, status);
}
function settingAccountBodyHtml(auth, status){
  if (!auth.loggedIn) {
    return `
      <div class="modal-hint">${I.info}<span>${t('settingAccountNotLoggedIn')}</span></div>
      <button class="btn btn-p" id="setting-account-login-btn" onclick="settingAccountLoginClick()">☁ ${t('syncLoginGoogle')}</button>`;
  }
  const tierCopy = SETTING_TIER_COPY[status?.tier] || SETTING_TIER_COPY.free;
  return `
    <div class="sync-status-row"><span>${t('settingAccountLoggedInAs')}</span><b>${x(auth.email || '')}</b></div>
    <div class="sync-status-row"><span>${t('settingAccountTierLabel')}</span><b>${t(tierCopy.labelKey)}</b></div>
    <div class="modal-hint">${I.info}<span>${t(tierCopy.benefitsKey)}</span></div>
    <div class="mfoot">
      <button class="btn btn-d" onclick="settingAccountLogoutClick()">${t('driveDisconnect')}</button>
    </div>
    <div class="settings-label" style="margin-top:14px">${t('settingAccountDriveSection')}</div>
    <button class="btn btn-s" onclick="selectSettingPage('appdata','backup')">${t('prefs_backup')} →</button>`;
}
async function settingAccountLoginClick(){
  syncBtnBusy('#setting-account-login-btn', true);
  const r = await api.sync.googleLogin();
  syncBtnBusy('#setting-account-login-btn', false);
  if (!r.ok) return toast(t('driveErrAuth'), 'error');
  toast(t('driveConnected'), 'ok');
  settingRefreshAccountSection();
  renderSettingsMenu();
}
async function settingAccountLogoutClick(){
  if (!(await uiConfirm(t('driveDisconnectConfirm')))) return;
  await api.sync.googleLogout();
  settingRefreshAccountSection();
  renderSettingsMenu();
}
registerSettingPage('user', 'account', settingAccountPageHtml);

// Compact quick-popup "Account status" extra (Tool toggle opt-in).
function quickAccountExtraHtml(){
  settingRefreshQuickAccountBlock();
  return `<div class="settings-group"><div class="settings-label">${t('settingExtraAccount')}</div>
    <div id="quick-account-body">${t('syncWorking')}</div></div>`;
}
async function settingRefreshQuickAccountBlock(){
  const auth = await api.sync.authStatus();
  const el = q('#quick-account-body');
  if (!el) return;
  el.innerHTML = auth.loggedIn
    ? `<div class="sync-hint" data-no-i18n>${x(auth.email || '')}</div>`
    : `<div class="sync-hint">${t('settingAccountNotLoggedIn')}</div>`;
}

// ═══ User profile — named layout-profile slots in Drive appdata ═════════
function settingProfilePageHtml(){
  settingRefreshProfileSection();
  return `<div class="settings-label">${t('settingPageProfile')}</div><div id="setting-profile-body">${t('syncWorking')}</div>`;
}
async function settingRefreshProfileSection(){
  const st = await api.drive.status();
  const el = q('#setting-profile-body');
  if (!el) return;
  if (!st.connected) {
    el.innerHTML = `
      <div class="modal-hint">${I.info}<span>${t('driveNotConnected')}</span></div>
      <button class="btn btn-s" onclick="selectSettingPage('appdata','backup')">${t('prefs_backup')} →</button>`;
    return;
  }
  const r = await api.drive.listLayoutSlots();
  if (!q('#setting-profile-body')) return; // page switched again while awaiting
  el.innerHTML = settingProfileBodyHtml(r.ok ? r.slots : []);
}
function settingProfileSlotRowHtml(slot){
  return `<div class="sync-upload-row">
    <div><b data-no-i18n>${x(slot.name)}</b> <span class="sync-hint">${driveFmtTime(slot.updatedAt)}</span></div>
    <div class="sync-upload-actions">
      <button class="btn btn-s btn-sm" onclick="settingProfileRestoreClick('${slot.id}')">${t('settingProfileRestore')}</button>
      <button class="btn btn-d btn-sm" onclick="settingProfileDeleteClick('${slot.id}')">${t('delete')}</button>
    </div>
  </div>`;
}
function settingProfileBodyHtml(slots){
  const rows = slots.length
    ? slots.map(settingProfileSlotRowHtml).join('')
    : `<div class="modal-hint">${I.info}<span>${t('settingProfileNone')}</span></div>`;
  return `<div class="fg">
      <label>${t('settingProfileSlotName')}</label>
      <input id="setting-profile-name">
      <button class="btn btn-p" id="setting-profile-save-btn" onclick="settingProfileSaveClick()">${t('settingProfileSaveCurrent')}</button>
    </div>
    ${rows}`;
}
async function settingProfileSaveClick(){
  const name = q('#setting-profile-name')?.value.trim();
  if (!name) return toast(t('settingProfileSlotName'), 'error');
  syncBtnBusy('#setting-profile-save-btn', true);
  const r = await api.drive.saveLayoutSlot(name, localStorage.getItem(UI_SETTINGS_KEY));
  syncBtnBusy('#setting-profile-save-btn', false);
  if (!r.ok) return driveErrToast(r);
  toast(t('settingProfileSaved'), 'ok');
  settingRefreshProfileSection();
}
async function settingProfileRestoreClick(id){
  if (!(await uiConfirm(t('driveRestoreLayoutConfirm')))) return;
  const r = await api.drive.restoreLayoutSlot(id);
  if (!r.ok) return driveErrToast(r);
  try { localStorage.setItem(UI_SETTINGS_KEY, r.json); }
  catch (_) { return toast(t('driveErrServer'), 'error'); }
  location.reload();
}
async function settingProfileDeleteClick(id){
  if (!(await uiConfirm(t('settingProfileDeleteConfirm')))) return;
  const r = await api.drive.deleteLayoutSlot(id);
  if (!r.ok) return driveErrToast(r);
  toast(t('applied'), 'ok');
  settingRefreshProfileSection();
}
registerSettingPage('user', 'profile', settingProfilePageHtml);

// Compact quick-popup "User profile" extra — just a shortcut into the page.
function quickProfileExtraHtml(){
  return `<div class="settings-group"><div class="settings-label">${t('settingPageProfile')}</div>
    <button class="btn btn-s" style="width:100%" onclick="toggleSettingsMenu(false);openSettingWindow('user','profile')">${t('settingPageProfile')} →</button>
  </div>`;
}
