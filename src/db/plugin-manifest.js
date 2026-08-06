'use strict';
// Pure logic for the Plugin system — manifest validation and git-URL parsing.
// Deliberately requires NOTHING (no electron, no ./core, no fs), so it can be
// imported by `node --test` directly; src/db/plugin.js (which does need
// electron + the DB) re-exports what it needs from here. See docs/PLUGINS.md.
//
// Identifier safety is the whole security boundary at this layer: no
// prepared-statement parameter can bind a table/column name, so every dynamic
// SQL identifier composed from a manifest is checked against a strict
// whitelist regex before it ever reaches a query string.

const PLUGIN_ID_RE     = /^[a-z0-9_]{1,20}$/;
const PLUGIN_TABLE_RE  = /^[a-z0-9_]{1,20}$/;
const PLUGIN_COLUMN_RE = /^[a-z][a-z0-9_]{0,29}$/;
const FULL_TABLE_RE    = /^plg_[a-z0-9_]{1,41}$/; // 'plg_' + id(<=20) + '_' + name(<=20)
const LEGACY_TABLE_RE  = /^ext_[a-z0-9_]{1,41}$/; // pre-v4.2.0 prefix, migration only
// One path segment of a repo URL (owner, repo name, or a GitLab namespace
// level). Same character class the old GITHUB_ID_RE allowed.
const REPO_SEG_RE      = /^[A-Za-z0-9._-]{1,100}$/;
const COL_TYPES        = new Set(['TEXT', 'INTEGER', 'REAL']);
const RESERVED_COLS    = new Set(['id', 'rowid', 'oid', '_rowid_']);
const MAX_TABLES_PER_PLUGIN = 10;
const MAX_COLS_PER_TABLE = 25;
const MAX_FILES = 30;
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB/file
const MAX_GITLAB_NS_DEPTH = 5;          // gitlab.com/a/b/c/d/project

// The manifest filename is looked up in this order, so a repo written for the
// pre-v4.2.0 "extension" naming still installs unchanged.
const MANIFEST_NAMES = ['dracondex-plugin.json', 'dracondex-extension.json'];
// Tried in order when the URL carries no explicit branch/tag.
const REF_CANDIDATES = ['main', 'master'];

// ---------------------------------------------------------------------------
// Manifest validation — rejects before anything is written to disk or the DB.
// ---------------------------------------------------------------------------
function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') return { ok: false, error: 'manifest is not an object' };
  const { id, name, version, entry, files, tables } = manifest;

  if (!PLUGIN_ID_RE.test(String(id || ''))) return { ok: false, error: 'invalid or missing "id"' };
  if (!name || typeof name !== 'string' || name.length > 80) return { ok: false, error: 'invalid or missing "name"' };
  if (version != null && (typeof version !== 'string' || version.length > 40)) return { ok: false, error: 'invalid "version"' };
  if (!entry || typeof entry !== 'string') return { ok: false, error: 'invalid or missing "entry"' };

  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) {
    return { ok: false, error: `"files" must be a non-empty array of at most ${MAX_FILES} entries` };
  }
  for (const f of files) {
    if (typeof f !== 'string' || !f || f.includes('..') || f.startsWith('/') || f.includes('\\')) {
      return { ok: false, error: `unsafe file path: ${f}` };
    }
  }
  if (!files.includes(entry)) return { ok: false, error: '"entry" must be listed in "files"' };

  const tableList = Array.isArray(tables) ? tables : [];
  if (tableList.length > MAX_TABLES_PER_PLUGIN) return { ok: false, error: `too many tables (max ${MAX_TABLES_PER_PLUGIN})` };
  const seenTables = new Set();
  for (const t of tableList) {
    if (!t || !PLUGIN_TABLE_RE.test(String(t.name || ''))) return { ok: false, error: `invalid table name: ${t?.name}` };
    if (seenTables.has(t.name)) return { ok: false, error: `duplicate table name: ${t.name}` };
    seenTables.add(t.name);

    const cols = Array.isArray(t.columns) ? t.columns : [];
    if (cols.length === 0 || cols.length > MAX_COLS_PER_TABLE) {
      return { ok: false, error: `table "${t.name}" must have 1-${MAX_COLS_PER_TABLE} columns` };
    }
    const seenCols = new Set();
    for (const c of cols) {
      const cname = String(c?.name || '');
      if (!c || !PLUGIN_COLUMN_RE.test(cname)) return { ok: false, error: `invalid column name in table "${t.name}": ${c?.name}` };
      if (RESERVED_COLS.has(cname.toLowerCase())) return { ok: false, error: `reserved column name: ${c.name}` };
      if (!COL_TYPES.has(String(c.type || '').toUpperCase())) return { ok: false, error: `invalid column type for "${c.name}": ${c.type}` };
      if (seenCols.has(cname)) return { ok: false, error: `duplicate column name: ${c.name}` };
      seenCols.add(cname);
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Git URL parsing — one input field accepts every shape a user can copy out of
// GitHub/GitLab. Returns { ok, host, owner, repo, ref } or { ok:false, code }.
// `owner` may contain '/' for GitLab nested groups; `repo` never does.
// `ref` is null when the URL didn't name one (caller then tries
// REF_CANDIDATES). This function never touches the network.
// ---------------------------------------------------------------------------
const HOST_BY_DOMAIN = {
  'github.com': 'github', 'www.github.com': 'github',
  'gitlab.com': 'gitlab', 'www.gitlab.com': 'gitlab',
};

// Strips scheme/userinfo and the scp-style `git@host:path` form down to
// "host/path", so one path-splitting routine handles every shape below.
function stripToHostPath(raw) {
  let s = raw;
  const scp = s.match(/^(?:ssh:\/\/)?[A-Za-z0-9._-]+@([A-Za-z0-9.-]+):(?!\/\/)(.+)$/);
  if (scp) return `${scp[1]}/${scp[2]}`;         // git@github.com:o/r.git
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, ''); // https:// http:// ssh:// git://
  s = s.replace(/^[A-Za-z0-9._-]+@/, '');        // ssh://git@github.com/o/r
  return s;
}

function parseRepoUrl(input) {
  let s = String(input == null ? '' : input).trim();
  if (!s) return { ok: false, code: 'bad_url' };
  if (/\s/.test(s)) return { ok: false, code: 'bad_url' };

  s = stripToHostPath(s);
  s = s.split('#')[0].split('?')[0];             // drop fragment/query
  s = s.replace(/\/+$/, '');                     // drop trailing slashes
  if (!s) return { ok: false, code: 'bad_url' };

  let segs = s.split('/').filter(Boolean);
  if (!segs.length) return { ok: false, code: 'bad_url' };

  // Leading segment is a host only if it looks like one. `owner/repo`
  // shorthand has no host at all and defaults to GitHub.
  let host = null;
  const first = segs[0].toLowerCase();
  if (HOST_BY_DOMAIN[first]) { host = HOST_BY_DOMAIN[first]; segs = segs.slice(1); }
  else if (first.includes('.')) return { ok: false, code: 'unsupported_host' };
  else host = 'github';

  if (segs.length < 2) return { ok: false, code: 'bad_url' };

  // Split "project path" from an optional "/tree/<ref>" | "/blob/<ref>/…"
  // suffix. GitLab puts a literal `/-/` marker before those; GitHub doesn't.
  let ref = null;
  const dash = segs.indexOf('-');
  let pathSegs;
  if (host === 'gitlab' && dash > 0) {
    pathSegs = segs.slice(0, dash);
    const rest = segs.slice(dash + 1);
    if (rest.length >= 2 && (rest[0] === 'tree' || rest[0] === 'blob' || rest[0] === 'raw')) {
      ref = rest.slice(1).join('/');
    }
  } else {
    const kw = segs.findIndex((v, i) => i >= 2 && (v === 'tree' || v === 'blob' || v === 'raw'));
    if (kw > 0) {
      pathSegs = segs.slice(0, kw);
      const rest = segs.slice(kw + 1);
      if (!rest.length) return { ok: false, code: 'bad_url' };
      // For /blob/<ref>/<file> the file path is unknowable from the ref alone;
      // take the first segment as the ref and ignore the rest. For /tree/<ref>
      // the whole remainder is the ref (branch names may contain '/').
      ref = segs[kw] === 'tree' ? rest.join('/') : rest[0];
    } else {
      pathSegs = segs;
    }
  }

  if (pathSegs.length < 2) return { ok: false, code: 'bad_url' };
  // Strip the .git suffix off the project segment only.
  pathSegs = pathSegs.slice();
  pathSegs[pathSegs.length - 1] = pathSegs[pathSegs.length - 1].replace(/\.git$/i, '');

  if (host === 'github' && pathSegs.length !== 2) return { ok: false, code: 'bad_url' };
  if (host === 'gitlab' && pathSegs.length > MAX_GITLAB_NS_DEPTH + 1) return { ok: false, code: 'bad_url' };
  for (const seg of pathSegs) {
    if (!REPO_SEG_RE.test(seg) || seg === '.' || seg === '..') return { ok: false, code: 'bad_url' };
  }

  if (ref != null) {
    const refSegs = ref.split('/').filter(Boolean);
    if (!refSegs.length || refSegs.length > 8) return { ok: false, code: 'bad_url' };
    for (const seg of refSegs) {
      if (!REPO_SEG_RE.test(seg) || seg === '.' || seg === '..') return { ok: false, code: 'bad_url' };
    }
    ref = refSegs.join('/');
  }

  const repo = pathSegs[pathSegs.length - 1];
  const owner = pathSegs.slice(0, -1).join('/');
  if (!owner || !repo) return { ok: false, code: 'bad_url' };
  return { ok: true, host, owner, repo, ref };
}

// Encodes each '/'-separated segment individually — encodeURIComponent on the
// whole string would turn the separators into %2F and break the URL.
const encPath = (p) => String(p).split('/').map(encodeURIComponent).join('/');

// Raw-file URL for one declared manifest file. GitHub serves bytes straight
// from raw.githubusercontent.com; GitLab from /-/raw/ on the main domain.
// Neither needs the Contents API (no base64 round-trip, no token).
function rawUrl(repoRef, filePath) {
  const { host, owner, repo, ref } = repoRef;
  if (host === 'gitlab') {
    return `https://gitlab.com/${encPath(owner)}/${encodeURIComponent(repo)}/-/raw/${encPath(ref)}/${encPath(filePath)}`;
  }
  return `https://raw.githubusercontent.com/${encPath(owner)}/${encodeURIComponent(repo)}/${encPath(ref)}/${encPath(filePath)}`;
}

module.exports = {
  PLUGIN_ID_RE, PLUGIN_TABLE_RE, PLUGIN_COLUMN_RE, FULL_TABLE_RE, LEGACY_TABLE_RE,
  REPO_SEG_RE, COL_TYPES, RESERVED_COLS,
  MAX_TABLES_PER_PLUGIN, MAX_COLS_PER_TABLE, MAX_FILES, MAX_FILE_BYTES,
  MANIFEST_NAMES, REF_CANDIDATES,
  validateManifest, parseRepoUrl, rawUrl,
};
