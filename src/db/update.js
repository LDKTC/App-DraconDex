'use strict';
// Firebase — Cloud Sync Function > Firebase (Plan.md): a read-only version-
// update notice, not an auto-updater. One publicly-readable Firestore doc
// holds { version, notes, url }; checkForUpdate() offers it to a user logged
// into EITHER of this app's two existing, independent Google logins (Cloud
// Sync's Supabase login, sync.js, or Drive Backup's own login, drive.js —
// there is no unified account system yet). Plain fetch() against Firestore's
// REST API, same as sync.js/drive.js — no firebase/firebase-admin SDK for
// one read-only doc. See docs/UPDATE.md.
const { app, shell } = require('electron');
const { getAppSetting, setAppSetting } = require('./versions');
const { syncAuthStatus } = require('./sync');
const { driveStatus } = require('./drive');

// This app's own single canonical project — every install reads the SAME
// doc, unlike sync:url/drive:clientId (per-deployment operator config) —
// so this is a source constant, not a runtime app_setting.
const FIRESTORE_PROJECT_ID = 'dracondex-app'; // TODO(maintainer): real Firebase project id
const DOC_PATH = 'public_config/latest_version';
const DOC_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${DOC_PATH}`;

const IS_DEV = !app.isPackaged;
const SEEN_KEY = 'update:seenVersion';

// ponytail: no in-process mock server (unlike sync-devserver.js/drive-
// devserver.js) — one stateless public GET doesn't need one. Env-var forced
// "latest" mirrors DDX_DEV_DRIVE_QUOTA_PCT; unset = "no update" by default.
function fakeDoc() {
  const version = process.env.DDX_DEV_UPDATE_VERSION || app.getVersion();
  return { version, notes: `Dev mock update notes for v${version}`, url: 'https://example.com/dracondex-download' };
}

function parseFirestoreDoc(json) {
  const f = json?.fields;
  const version = f?.version?.stringValue;
  const url = f?.url?.stringValue;
  if (!version || !url) return null;
  return { version, notes: f?.notes?.stringValue || '', url };
}

async function fetchLatest() {
  if (IS_DEV) return fakeDoc();
  let res;
  try { res = await fetch(DOC_URL, { signal: AbortSignal.timeout(10000) }); }
  catch (_) { return null; }
  if (!res.ok) return null;
  try { return parseFirestoreDoc(await res.json()); }
  catch (_) { return null; }
}

const stripPrerelease = (v) => String(v || '').split('-')[0];
const parts = (v) => stripPrerelease(v).split('.').map((n) => parseInt(n, 10) || 0);
function isNewerVersion(remote, local) {
  const r = parts(remote), l = parts(local);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const d = (r[i] || 0) - (l[i] || 0);
    if (d) return d > 0;
  }
  return false;
}

async function checkForUpdate() {
  const current = app.getVersion();
  let loggedIn = false;
  try {
    const [s, d] = await Promise.all([syncAuthStatus(), driveStatus()]);
    loggedIn = !!(s.loggedIn || d.connected);
  } catch (_) { /* treat as not logged in */ }
  if (!loggedIn) return { ok: true, available: false };

  const latest = await fetchLatest();
  if (!latest || !isNewerVersion(latest.version, current)) return { ok: true, available: false };

  const dismissed = (getAppSetting(SEEN_KEY) || '') === latest.version;
  return { ok: true, available: true, dismissed, version: latest.version, notes: latest.notes, url: latest.url, current };
}

function dismissUpdate(version) { setAppSetting(SEEN_KEY, String(version || '')); return { ok: true }; }

function openUpdateDownload(url) {
  if (/^https?:\/\//i.test(String(url || ''))) shell.openExternal(url);
  return { ok: true };
}

module.exports = { checkForUpdate, dismissUpdate, openUpdateDownload };
