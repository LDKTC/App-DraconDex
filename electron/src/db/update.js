'use strict';
// A read-only version-update notice, not an auto-updater. Reads this repo's
// latest GitHub Release and offers it to the user. Plain fetch() against the
// GitHub REST API, same style as sync.js/drive.js. See docs/UPDATE.md.
//
// Plan process1 part2 #1: no longer gated behind either of this app's two
// independent logins (Cloud Sync's Supabase login, Drive Backup's own login)
// — a GitHub Releases check is public data, so there is no reason to require
// login just to see whether a newer version exists.
//
// This used to read a Firestore doc under a project id that was never actually
// registered (it carried a `TODO(maintainer): real Firebase project id`).
// Firebase project ids are globally unique and first-come-first-served, so an
// unclaimed id is a trust root anyone can take over and then serve arbitrary
// `version`/`notes`/`url` to every install. GitHub Releases moves that trust
// root onto the repo the project already owns, and nothing here trusts the
// response shape: see parseGithubRelease below.
const { app, shell } = require('electron');
const { getAppSetting, setAppSetting } = require('./versions');

// This app's own canonical repo — every install reads the SAME release feed,
// unlike sync:url/drive:clientId (per-deployment operator config), so this is
// a source constant, not a runtime app_setting.
// FORKERS: a fork MUST edit this to its own repo, or the update check reports
// the upstream project's releases. Everything else in this app is configurable
// without touching source; this is the one exception.
const REPO = 'LDKTC/App-DraconDex';
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
// Every URL this module is willing to hand to the browser must start with
// this. Pinning the host alone is not enough — the path prefix is what keeps a
// compromised or unexpected API response from pointing anywhere else.
const RELEASE_URL_PREFIX = `https://github.com/${REPO}/releases`;
const NOTES_MAX = 4000;

const IS_DEV = !app.isPackaged;
const SEEN_KEY = 'update:seenVersion';
const AUTO_CHECK_KEY = 'update:autoCheck';

// ponytail: no in-process mock server (unlike sync-devserver.js/drive-
// devserver.js) — one stateless public GET doesn't need one. Env-var forced
// "latest" mirrors DDX_DEV_DRIVE_QUOTA_PCT; unset = "no update" by default.
function fakeDoc() {
  const version = process.env.DDX_DEV_UPDATE_VERSION || app.getVersion();
  return { version, notes: `Dev mock update notes for v${version}`, url: `${RELEASE_URL_PREFIX}/tag/v${version}` };
}

// A release tag we are willing to compare against app.getVersion(). Anything
// else (a codename, an empty tag, a tag with a path in it) is rejected outright
// rather than coerced — isNewerVersion() would happily parse garbage to 0.
const TAG_RE = /^\d+(\.\d+){0,3}$/;

// The response is remote data, so every field is validated, never trusted:
// the version must look like a version, and the URL must live under this
// repo's own releases path. Returning null means "no update", which is the
// same path every other failure takes.
function parseGithubRelease(json) {
  const version = String(json?.tag_name || '').replace(/^v/i, '').trim();
  if (!TAG_RE.test(version)) return null;
  const htmlUrl = String(json?.html_url || '');
  const url = htmlUrl.startsWith(`${RELEASE_URL_PREFIX}/`) ? htmlUrl : RELEASE_URL_PREFIX;
  return { version, notes: String(json?.body || '').slice(0, NOTES_MAX), url };
}

async function fetchLatest() {
  if (IS_DEV) return fakeDoc();
  let res;
  try {
    // /releases/latest already excludes drafts and prereleases. The API
    // rejects requests without a User-Agent.
    res = await fetch(RELEASES_URL, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': `DraconDex/${app.getVersion()}`,
      },
    });
  } catch (_) { return null; }
  if (!res.ok) return null;
  try { return parseGithubRelease(await res.json()); }
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
  const latest = await fetchLatest();
  if (!latest || !isNewerVersion(latest.version, current)) return { ok: true, available: false, current };

  const dismissed = (getAppSetting(SEEN_KEY) || '') === latest.version;
  return { ok: true, available: true, dismissed, version: latest.version, notes: latest.notes, url: latest.url, current };
}

function dismissUpdate(version) { setAppSetting(SEEN_KEY, String(version || '')); return { ok: true }; }

// Plan process1 part2 #1.2: on by default (unset/anything but the literal
// '0' reads as enabled) — same getAppSetting boolean-as-string convention as
// drive.js's own `drive:autoBackup` flag, checked once per app open by
// initVersionCheck() (renderer/update.js) rather than on an interval.
function getAutoCheck() { return getAppSetting(AUTO_CHECK_KEY) !== '0'; }
function setAutoCheck(enabled) { setAppSetting(AUTO_CHECK_KEY, enabled ? '1' : '0'); return { ok: true }; }

// The renderer passes the URL back in, so this re-checks it rather than
// assuming it is the one checkForUpdate() handed out. A bare `^https?://`
// test would let any renderer-side compromise pop the browser at an arbitrary
// site; pinning the releases prefix means the only reachable destination is
// this repo's own release pages.
function openUpdateDownload(url) {
  const u = String(url || '');
  if (u === RELEASE_URL_PREFIX || u.startsWith(`${RELEASE_URL_PREFIX}/`)) shell.openExternal(u);
  return { ok: true };
}

module.exports = { checkForUpdate, dismissUpdate, openUpdateDownload, getAutoCheck, setAutoCheck };
