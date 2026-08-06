import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

// src/db/plugin-manifest.js is the electron-free half of the Plugin system
// (src/db/plugin.js requires electron + the DB and cannot be loaded here).
// Everything a malicious repo URL or manifest could do goes through these two
// functions, so they are the two things worth a real regression test.
const require_ = createRequire(import.meta.url);
const { parseRepoUrl, validateManifest, rawUrl } = require_('../src/db/plugin-manifest.js');

test('parseRepoUrl accepts every shape a user can copy out of GitHub', () => {
  const github = (owner, repo, ref) => ({ ok: true, host: 'github', owner, repo, ref });
  const cases = [
    ['https://github.com/acme/my-plugin.git',        github('acme', 'my-plugin', null)],
    ['https://github.com/acme/my-plugin',            github('acme', 'my-plugin', null)],
    ['https://github.com/acme/my-plugin/',           github('acme', 'my-plugin', null)],
    ['http://github.com/acme/my-plugin.git',         github('acme', 'my-plugin', null)],
    ['https://www.github.com/acme/my-plugin',        github('acme', 'my-plugin', null)],
    ['git@github.com:acme/my-plugin.git',            github('acme', 'my-plugin', null)],
    ['ssh://git@github.com/acme/my-plugin.git',      github('acme', 'my-plugin', null)],
    ['github.com/acme/my-plugin',                    github('acme', 'my-plugin', null)],
    ['acme/my-plugin',                               github('acme', 'my-plugin', null)],
    ['  https://github.com/acme/my-plugin.git  ',    github('acme', 'my-plugin', null)],
    ['https://github.com/acme/my-plugin?tab=readme', github('acme', 'my-plugin', null)],
    ['https://github.com/acme/my-plugin/tree/dev',   github('acme', 'my-plugin', 'dev')],
    ['https://github.com/acme/my-plugin/tree/feat/x', github('acme', 'my-plugin', 'feat/x')],
    ['https://github.com/acme/my-plugin/blob/dev/index.html', github('acme', 'my-plugin', 'dev')],
  ];
  for (const [input, want] of cases) {
    assert.deepEqual(parseRepoUrl(input), want, `parseRepoUrl(${JSON.stringify(input)})`);
  }
});

test('parseRepoUrl handles GitLab, including nested groups', () => {
  assert.deepEqual(parseRepoUrl('https://gitlab.com/acme/my-plugin.git'),
    { ok: true, host: 'gitlab', owner: 'acme', repo: 'my-plugin', ref: null });
  assert.deepEqual(parseRepoUrl('https://gitlab.com/acme/team/my-plugin'),
    { ok: true, host: 'gitlab', owner: 'acme/team', repo: 'my-plugin', ref: null });
  assert.deepEqual(parseRepoUrl('https://gitlab.com/acme/my-plugin/-/tree/dev'),
    { ok: true, host: 'gitlab', owner: 'acme', repo: 'my-plugin', ref: 'dev' });
  assert.deepEqual(parseRepoUrl('git@gitlab.com:acme/team/my-plugin.git'),
    { ok: true, host: 'gitlab', owner: 'acme/team', repo: 'my-plugin', ref: null });
});

test('parseRepoUrl rejects anything it cannot safely turn into a raw URL', () => {
  const rejects = {
    '': 'bad_url',
    '   ': 'bad_url',
    'acme': 'bad_url',
    'https://github.com/acme': 'bad_url',
    'https://github.com/acme/repo/extra': 'bad_url',       // not a tree/blob URL
    'https://github.com/../../etc/passwd': 'bad_url',
    'https://github.com/acme/../secret': 'bad_url',
    'https://github.com/ac me/repo': 'bad_url',            // whitespace
    'https://github.com/acme/re%2Fpo': 'bad_url',          // percent-encoding
    'https://github.com/acme/repo/tree/..': 'bad_url',
    'https://evil.com/acme/repo': 'unsupported_host',
    'https://bitbucket.org/acme/repo.git': 'unsupported_host',
    'git@evil.com:acme/repo.git': 'unsupported_host',
    'https://gitlab.example.com/acme/repo.git': 'unsupported_host', // self-hosted, out of scope
  };
  for (const [input, code] of Object.entries(rejects)) {
    const r = parseRepoUrl(input);
    assert.equal(r.ok, false, `${JSON.stringify(input)} should be rejected`);
    assert.equal(r.code, code, `${JSON.stringify(input)} error code`);
  }
  assert.equal(parseRepoUrl(null).ok, false);
  assert.equal(parseRepoUrl(undefined).ok, false);
  assert.equal(parseRepoUrl({}).ok, false);
});

test('rawUrl encodes per segment and never collapses a nested GitLab namespace', () => {
  assert.equal(
    rawUrl({ host: 'github', owner: 'acme', repo: 'my-plugin', ref: 'feat/x' }, 'sub/app.js'),
    'https://raw.githubusercontent.com/acme/my-plugin/feat/x/sub/app.js');
  assert.equal(
    rawUrl({ host: 'gitlab', owner: 'acme/team', repo: 'my-plugin', ref: 'main' }, 'index.html'),
    'https://gitlab.com/acme/team/my-plugin/-/raw/main/index.html');
});

const goodManifest = () => ({
  id: 'myplugin', name: 'My Plugin', version: '1.0.0',
  entry: 'index.html', files: ['index.html', 'app.js'],
  tables: [{ name: 'notes', columns: [{ name: 'title', type: 'TEXT' }, { name: 'rating', type: 'INTEGER' }] }],
});

test('validateManifest accepts a well-formed manifest', () => {
  assert.deepEqual(validateManifest(goodManifest()), { ok: true });
  const noTables = goodManifest(); delete noTables.tables;
  assert.equal(validateManifest(noTables).ok, true, 'tables are optional');
});

test('validateManifest rejects every shape that could reach SQL or the filesystem', () => {
  const bad = (mutate) => { const m = goodManifest(); mutate(m); return validateManifest(m); };

  // id — composed into a table identifier, so the strictest gate of all.
  assert.equal(bad((m) => { m.id = 'My Plugin'; }).ok, false);
  assert.equal(bad((m) => { m.id = 'drop;--'; }).ok, false);
  assert.equal(bad((m) => { m.id = 'x'.repeat(21); }).ok, false);
  assert.equal(bad((m) => { delete m.id; }).ok, false);

  // file paths — written straight to disk under the plugin's own directory.
  assert.equal(bad((m) => { m.files = ['../../etc/passwd']; m.entry = '../../etc/passwd'; }).ok, false);
  assert.equal(bad((m) => { m.files = ['/etc/passwd']; m.entry = '/etc/passwd'; }).ok, false);
  assert.equal(bad((m) => { m.files = ['sub\\win.js']; m.entry = 'sub\\win.js'; }).ok, false);
  assert.equal(bad((m) => { m.entry = 'not-listed.html'; }).ok, false);
  assert.equal(bad((m) => { m.files = []; }).ok, false);
  assert.equal(bad((m) => { m.files = Array.from({ length: 31 }, (_, i) => `f${i}.js`); m.entry = 'f0.js'; }).ok, false);

  // table + column identifiers.
  assert.equal(bad((m) => { m.tables[0].name = 'notes; DROP TABLE plugin'; }).ok, false);
  assert.equal(bad((m) => { m.tables[0].columns[0].name = 'id'; }).ok, false, 'reserved column');
  assert.equal(bad((m) => { m.tables[0].columns[0].name = 'rowid'; }).ok, false, 'reserved column');
  assert.equal(bad((m) => { m.tables[0].columns[0].name = '1bad'; }).ok, false);
  assert.equal(bad((m) => { m.tables[0].columns[0].type = 'BLOB'; }).ok, false);
  assert.equal(bad((m) => { m.tables[0].columns[0].type = 'TEXT DEFAULT (x)'; }).ok, false);
  assert.equal(bad((m) => { m.tables[0].columns.push({ name: 'title', type: 'TEXT' }); }).ok, false, 'duplicate column');
  assert.equal(bad((m) => { m.tables.push({ name: 'notes', columns: [{ name: 'a', type: 'TEXT' }] }); }).ok, false, 'duplicate table');
  assert.equal(bad((m) => {
    m.tables = Array.from({ length: 11 }, (_, i) => ({ name: `t${i}`, columns: [{ name: 'a', type: 'TEXT' }] }));
  }).ok, false, 'too many tables');
  assert.equal(bad((m) => {
    m.tables[0].columns = Array.from({ length: 26 }, (_, i) => ({ name: `c${i}`, type: 'TEXT' }));
  }).ok, false, 'too many columns');

  assert.equal(validateManifest(null).ok, false);
  assert.equal(validateManifest('nope').ok, false);
});
