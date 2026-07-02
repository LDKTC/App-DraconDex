#!/usr/bin/env node
// DraconDex module style & wiring conformance checker (agent tooling).
//
// Usage (from repo root):
//   node .claude/skills/dracondex-module-style/check.mjs                     # lint all renderer modules + global checks
//   node .claude/skills/dracondex-module-style/check.mjs src/renderer/foo.js # lint specific file(s) + global checks
//   node .claude/skills/dracondex-module-style/check.mjs --module hero       # wiring checks for one module name
//
// ERRORs (exit 1): broken IPC chain, api.* call with no preload entry,
//   t('key') missing in a locale, alert()/window.confirm() usage, missing wiring.
// WARNINGs (exit 0): hardcoded colors, unknown CSS classes, <button> without
//   .btn, Thai string literals (untranslated). Compare counts against the
//   baseline table printed for existing modules — new code should not be worse.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const read = f => readFileSync(path.join(root, f), 'utf8');

let errors = 0, warnings = 0;
const err = m => { errors++; console.log(`  ERROR   ${m}`); };
const warn = m => { warnings++; console.log(`  warning ${m}`); };
const ok = m => console.log(`  ok      ${m}`);

// --- argv ---
const argv = process.argv.slice(2);
let moduleName = null;
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--module') moduleName = argv[++i];
  else files.push(argv[i].replace(/\\/g, '/'));
}

const coreSrc = read('src/renderer/core.js');
const i18nSrc = read('src/renderer/i18n.js');
const preloadSrc = read('preload.js');
const mainSrc = read('main.js');
const indexSrc = read('index.html');
const cssSrc = read('style.css');

const stripInterp = s => s.replace(/\$\{[^}]*\}/g, '');
const stripStrings = s => s.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''");

// --- parse preload: api path tree + invoked channels ---
function parsePreload(src) {
  const paths = new Set(); const channels = new Set();
  const stack = [];
  let inApi = false;
  for (const line of src.split('\n')) {
    if (!inApi) {
      if (line.includes("exposeInMainWorld('api'")) inApi = true;
      continue;
    }
    const group = line.match(/^\s*([A-Za-z0-9_]+):\s*\{\s*$/);
    const leaf = line.match(/^\s*([A-Za-z0-9_]+):\s*(?:async\s*)?\(/);
    for (const m of line.matchAll(/inv\('([^']+)'/g)) channels.add(m[1]);
    if (group) { stack.push(group[1]); continue; }
    if (leaf) { paths.add([...stack, leaf[1]].join('.')); continue; }
    // count closers minus openers to pop groups
    const net = (line.match(/\}/g) || []).length - (line.match(/\{/g) || []).length;
    for (let i = 0; i < net; i++) {
      if (stack.length) stack.pop();
      else { inApi = false; break; }
    }
  }
  return { paths, channels };
}
const api = parsePreload(preloadSrc);

// --- parse main.js registered channels ---
const mainChannels = new Set();
for (const m of mainSrc.matchAll(/\bh\('([^']+)'/g)) mainChannels.add(m[1]);
for (const m of mainSrc.matchAll(/ipcMain\.(?:handle|on)\('([^']+)'/g)) mainChannels.add(m[1]);

// --- parse i18n dict L in src/renderer/i18n.js ---
function parseLocales(src) {
  const start = src.indexOf('const L = {');
  const locales = {}; // name -> Set(keys)
  let depth = 0, current = null;
  for (const line of src.slice(start).split('\n')) {
    const localeOpen = line.match(/^  ([A-Za-z_]+): \{/);
    if (depth === 1 && localeOpen) { current = localeOpen[1]; locales[current] = new Set(); }
    if (depth >= 2 || (depth === 1 && localeOpen)) {
      const inBlock = stripStrings(line);
      for (const m of inBlock.matchAll(/([A-Za-z0-9_]+)\s*:/g)) {
        if (current && m[1] !== current) locales[current].add(m[1]);
      }
    }
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    if (depth <= 0 && current) break; // closed const L
  }
  return locales;
}
const locales = parseLocales(i18nSrc);
const localeNames = Object.keys(locales);

// --- CSS classes defined in style.css ---
const cssClasses = new Set();
for (const m of cssSrc.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)) cssClasses.add(m[1]);

// ═══ Global check 1: IPC chain preload -> main ═══
console.log('=== IPC chain (preload -> main.js) ===');
{
  const missing = [...api.channels].filter(c => !mainChannels.has(c));
  if (missing.length) missing.forEach(c => err(`preload invokes '${c}' but main.js has no handler`));
  else ok(`${api.channels.size} preload channels all have main.js handlers (${mainChannels.size} registered)`);
}

// ═══ Global check 2: i18n locale parity vs en ═══
console.log(`=== i18n parity (${localeNames.length} locales: ${localeNames.join(', ')}) ===`);
{
  const en = locales.en || new Set();
  let gaps = 0;
  for (const name of localeNames) {
    if (name === 'en') continue;
    const missing = [...en].filter(k => !locales[name].has(k));
    if (missing.length) { gaps++; warn(`locale '${name}' missing ${missing.length} key(s) vs en: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ', …' : ''}`); }
  }
  if (!gaps) ok(`all locales have every 'en' key (${en.size} keys)`);
}

// ═══ Per-file lint ═══
const targets = files.length ? files
  : readdirSync(path.join(root, 'src/renderer')).filter(f => f.endsWith('.js')).map(f => `src/renderer/${f}`);

const usedT = new Set();
for (const file of targets) {
  console.log(`=== ${file} ===`);
  if (!existsSync(path.join(root, file))) { err('file does not exist'); continue; }
  const src = read(file);
  const lines = src.split('\n');
  const lineOf = idx => src.slice(0, idx).split('\n').length;

  // api.* usage must exist in preload
  const badApi = new Set();
  for (const m of src.matchAll(/\bapi\.([A-Za-z0-9_.]+)\s*\(/g)) {
    if (!api.paths.has(m[1])) badApi.add(m[1]);
  }
  if (badApi.size) [...badApi].forEach(p => err(`api.${p}() called but preload.js exposes no such path`));
  else ok('all api.* calls exist in preload.js');

  // t('key') must exist in every locale
  const missingT = [];
  for (const m of src.matchAll(/\bt\(\s*['"]([A-Za-z0-9_]+)['"]\s*[,)]/g)) {
    usedT.add(m[1]);
    const gone = localeNames.filter(l => !locales[l].has(m[1]));
    if (gone.length === localeNames.length) missingT.push(`t('${m[1]}') defined in NO locale`);
    else if (gone.length) missingT.push(`t('${m[1]}') missing in: ${gone.join(', ')}`);
  }
  if (missingT.length) [...new Set(missingT)].forEach(err);
  else ok("all t('key') strings exist in all locales");

  // native dialogs are banned (frameless window; house style is toast()/confirmBox())
  for (const m of src.matchAll(/\b(alert|window\.confirm|window\.prompt)\s*\(/g)) {
    const line = lines[lineOf(m.index) - 1];
    const col = m.index - src.lastIndexOf('\n', m.index) - 1;
    const commentAt = line.indexOf('//');
    if (commentAt !== -1 && commentAt < col) continue;
    err(`${m[1]}() at line ${lineOf(m.index)} — use toast() / confirmBox() (src/renderer/core.js)`);
  }

  // hardcoded hex colors (allow `|| '#xxxxxx'` data-color fallbacks)
  const hexLines = [];
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const before = src.slice(Math.max(0, m.index - 12), m.index);
    if (/\|\|\s*['"]$/.test(before)) continue;
    hexLines.push(`${m[0]}@L${lineOf(m.index)}`);
  }
  if (hexLines.length) warn(`${hexLines.length} hardcoded color(s) — prefer var(--accent/--danger/…): ${hexLines.slice(0, 6).join(' ')}${hexLines.length > 6 ? ' …' : ''}`);
  else ok('no hardcoded colors (theme-safe)');

  // buttons without .btn class
  const badBtn = [];
  for (const m of src.matchAll(/<button[^>]*/g)) {
    if (!/class="[^"]*\bbtn\b/.test(stripInterp(m[0])) && !/class=\$\{|class="\$\{/.test(m[0])) badBtn.push(`L${lineOf(m.index)}`);
  }
  if (badBtn.length) warn(`${badBtn.length} <button> without .btn class (${badBtn.slice(0, 5).join(' ')}) — use btn btn-p/btn-s/btn-g/btn-d (+btn-i for icon)`);

  // Thai literals = untranslated UI strings
  const thai = [];
  lines.forEach((l, i) => { if (/[฀-๿]/.test(l)) thai.push(i + 1); });
  if (thai.length) warn(`${thai.length} line(s) with hardcoded Thai text (use t() + add key to all locales in src/renderer/i18n.js): L${thai.slice(0, 8).join(' L')}${thai.length > 8 ? ' …' : ''}`);

  // CSS classes used but not defined in style.css
  const unknown = new Set();
  for (const m of src.matchAll(/class="([^"]*)"/g)) {
    for (const cls of stripInterp(m[1]).split(/\s+/).filter(Boolean)) {
      if (!cssClasses.has(cls)) unknown.add(cls);
    }
  }
  if (unknown.size) warn(`class(es) not defined in style.css: ${[...unknown].join(', ')}`);
}

// ═══ Wiring checks for --module <name> ═══
if (moduleName) {
  const m = moduleName;
  console.log(`=== module wiring: '${m}' ===`);
  existsSync(path.join(root, `src/renderer/${m}.js`))
    ? ok(`src/renderer/${m}.js exists`) : err(`src/renderer/${m}.js missing`);
  coreSrc.includes(`selectModule('${m}')`)
    ? ok(`nexus tile / selectModule('${m}') present in core.js`) : err(`no selectModule('${m}') in src/renderer/core.js — add a .module-item in renderNexusHome() and a branch in selectModule()`);
  coreSrc.includes(`.nav-btn.${m}-only`)
    ? ok(`.nav-btn.${m}-only visibility handled in core.js`) : err(`core.js never toggles '.nav-btn.${m}-only' — add it to the nav visibility block`);
  indexSrc.includes(`${m}-only`)
    ? ok(`index.html has ${m}-only nav button(s)`) : err(`index.html has no 'nav-btn ${m}-only' buttons in #nav-sidebar`);
  if (m !== 'director') {
    coreSrc.includes(`src/renderer/${m}.js`)
      ? ok(`lazy-loaded via loadModule('src/renderer/${m}.js')`) : err(`core.js selectModule() must loadModule('src/renderer/${m}.js') then call its render entry`);
  }
  if (existsSync(path.join(root, `src/db/${m}.js`))) {
    read('database.js').includes(`./src/db/${m}`)
      ? ok(`src/db/${m}.js required by database.js`) : err(`src/db/${m}.js exists but database.js does not require/spread it`);
  } else {
    console.log(`  note    no src/db/${m}.js (fine if the module reuses another db file)`);
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
