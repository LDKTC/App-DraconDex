import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Same CRLF-safe read the other tests use — see module-transfer.test.mjs.
const readSource = (relPath) =>
  readFileSync(new URL(relPath, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// src/db/update.js can't be imported directly here (it pulls in electron, and
// transitively sync.js/drive.js/the DB), so the pure parsing half is lifted out
// of the source and exercised on its own. That keeps the assertions about real
// behaviour rather than about the text of the file.
function loadParser() {
  const src = readSource('../src/db/update.js');
  const prefix = src.match(/const RELEASE_URL_PREFIX = ([^\n]+);/)?.[1];
  const tagRe = src.match(/const TAG_RE = ([^\n]+);/)?.[1];
  const notesMax = src.match(/const NOTES_MAX = ([^\n]+);/)?.[1];
  const repo = src.match(/const REPO = ([^\n]+);/)?.[1];
  const fn = src.match(/function parseGithubRelease\(json\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(prefix && tagRe && notesMax && repo && fn, 'update.js parser pieces not found');
  // eslint-disable-next-line no-new-func
  return new Function(`
    const REPO = ${repo};
    const RELEASE_URL_PREFIX = ${prefix};
    const TAG_RE = ${tagRe};
    const NOTES_MAX = ${notesMax};
    ${fn}
    return { parseGithubRelease, RELEASE_URL_PREFIX };
  `)();
}

// The shape below is a real response from
// GET /repos/LDKTC/App-DraconDex/releases/latest, trimmed to the fields the
// parser reads.
const REAL_RELEASE = {
  tag_name: 'v4.7.1',
  name: 'DraconDex 4.7.1',
  draft: false,
  prerelease: false,
  body: "## What's Changed\n* CI: publish @ldktc/dracondex to GitHub Packages\n",
  html_url: 'https://github.com/LDKTC/App-DraconDex/releases/tag/v4.7.1',
};

test('parseGithubRelease reads a real GitHub release payload', () => {
  const { parseGithubRelease } = loadParser();
  const r = parseGithubRelease(REAL_RELEASE);
  assert.equal(r.version, '4.7.1', 'leading v is stripped off tag_name');
  assert.equal(r.url, REAL_RELEASE.html_url);
  assert.match(r.notes, /What's Changed/);
});

// The whole point of moving off the old Firestore doc was that its project id
// was never registered, so ANY response had to be treated as attacker-shaped.
// These are the checks that make the new source safe to trust.
test('parseGithubRelease rejects a version that is not a version', () => {
  const { parseGithubRelease } = loadParser();
  for (const tag of ['', 'latest', 'v', '4.7.1-rc1; DROP', '../../etc', 'v4.7.1/../..', 'nightly']) {
    assert.equal(parseGithubRelease({ ...REAL_RELEASE, tag_name: tag }), null, `tag ${JSON.stringify(tag)} must be rejected`);
  }
  assert.equal(parseGithubRelease({}), null, 'an empty payload is not an update');
  assert.equal(parseGithubRelease(null), null);
});

test('parseGithubRelease pins the download URL to this repo releases path', () => {
  const { parseGithubRelease, RELEASE_URL_PREFIX } = loadParser();
  const hostile = [
    'https://evil.example/pwn',
    'https://github.com/evil/repo/releases/tag/v1',
    'https://github.com.evil.example/LDKTC/App-DraconDex/releases/tag/v1',
    'javascript:alert(1)',
    '',
  ];
  for (const html_url of hostile) {
    const r = parseGithubRelease({ ...REAL_RELEASE, html_url });
    assert.equal(r.url, RELEASE_URL_PREFIX, `${JSON.stringify(html_url)} must fall back to the pinned prefix`);
  }
});

test('parseGithubRelease caps the length of remote release notes', () => {
  const { parseGithubRelease } = loadParser();
  const r = parseGithubRelease({ ...REAL_RELEASE, body: 'x'.repeat(50000) });
  assert.ok(r.notes.length <= 4000, `notes should be capped, got ${r.notes.length}`);
});

test('openUpdateDownload only opens the pinned releases prefix', () => {
  const src = readSource('../src/db/update.js');
  const fn = src.match(/function openUpdateDownload\(url\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(fn, 'openUpdateDownload not found');
  // A bare protocol test would let a compromised renderer open any site.
  assert.doesNotMatch(fn, /\^https\?:\\\/\\\//, 'must not fall back to a bare ^https?:// check');
  assert.match(fn, /RELEASE_URL_PREFIX/, 'must gate on the pinned prefix');
});

test('the old unregistered Firestore trust root is gone', () => {
  const src = readSource('../src/db/update.js');
  assert.doesNotMatch(src, /firestore\.googleapis\.com/, 'Firestore endpoint must not come back');
  assert.doesNotMatch(src, /FIRESTORE_PROJECT_ID/, 'the unowned project id constant must not come back');
});
