'use strict';
// Firebase — Cloud Sync Function > Firebase (Plan.md). Read-only: checks
// src/db/update.js's Firestore doc via api.update.check() and, for a user
// logged into either Cloud Sync or Drive Backup, shows a modal with a
// download link when a newer version exists. Not an auto-updater.

async function initVersionCheck() {
  if (S.isPopup) return; // one check per app session — a popup must not duplicate the modal
  let r;
  try { r = await api.update.check(); } catch (_) { return; } // never surface a check failure to the user
  if (!r?.ok || !r.available || r.dismissed) return;
  showUpdateModal(r);
}

function showUpdateModal(r) {
  openModal(`☁ ${t('updateAvailableTitle')}`, `
    <div class="modal-hint">${I.info}<span>${t('updateAvailableHint')} ${x(r.version)}</span></div>
    ${r.notes ? `<div class="modal-hint"><span>${x(r.notes)}</span></div>` : ''}
    <div class="mfoot">
      <button class="btn btn-s" onclick="updateRemindLaterClick('${x(r.version)}')">${t('updateRemindLater')}</button>
      <button class="btn btn-p" onclick="updateDownloadClick('${x(r.url)}')">${t('updateDownload')}</button>
    </div>
  `);
}

function updateDownloadClick(url) { api.update.openDownload(url); }
function updateRemindLaterClick(version) { api.update.dismiss(version); closeModal(); }
