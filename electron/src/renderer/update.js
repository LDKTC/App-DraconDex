'use strict';
// Read-only: checks this repo's latest GitHub Release via src/db/update.js's
// api.update.check() and, for a user logged into either Cloud Sync or Drive
// Backup, shows a modal with a download link when a newer version exists.
// Not an auto-updater.

async function initVersionCheck() {
  if (S.isPopup) return; // one check per app session — a popup must not duplicate the modal
  let r;
  try { r = await api.update.check(); } catch (_) { return; } // never surface a check failure to the user
  if (!r?.ok || !r.available || r.dismissed) return;
  showUpdateModal(r);
}

// `version`/`notes`/`url` come off the network, so they are never interpolated
// into the inline handlers below — the release is parked here and the buttons
// take no arguments at all. (Putting remote text inside onclick="f('...')" was
// a live injection: the shared escaper leaves `'` alone, so a quote in the
// value closed the JS string literal and the rest ran in this renderer, which
// holds the whole window.api surface.) The two text-context interpolations
// still go through x().
let _pendingUpdate = null;

function showUpdateModal(r) {
  _pendingUpdate = r;
  openModal(`☁ ${t('updateAvailableTitle')}`, `
    <div class="modal-hint">${I.info}<span>${t('updateAvailableHint')} ${x(r.version)}</span></div>
    ${r.notes ? `<div class="modal-hint"><span>${x(r.notes)}</span></div>` : ''}
    <div class="mfoot">
      <button class="btn btn-s" onclick="updateRemindLaterClick()">${t('updateRemindLater')}</button>
      <button class="btn btn-p" onclick="updateDownloadClick()">${t('updateDownload')}</button>
    </div>
  `);
}

function updateDownloadClick() {
  if (_pendingUpdate) api.update.openDownload(_pendingUpdate.url);
}
function updateRemindLaterClick() {
  if (_pendingUpdate) api.update.dismiss(_pendingUpdate.version);
  closeModal();
}
