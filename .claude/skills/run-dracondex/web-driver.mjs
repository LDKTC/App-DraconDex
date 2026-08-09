#!/usr/bin/env node
// Fallback driver for environments where the Electron binary cannot be
// downloaded (e.g. Linux CI/sandbox without GitHub release access).
// Runs the REAL renderer (index.html + src/renderer/*) in Playwright Chromium,
// the REAL preload.js mapping, and the REAL db layer (main.js IPC handlers) in
// this Node process — only Electron's shell (app/BrowserWindow/Menu/dialog) is
// stubbed. Same command vocabulary as driver.mjs.
//
//   node .claude/skills/run-dracondex/web-driver.mjs --fresh "ss 01" "click .module-item" ...
//
// Screenshots land in tmp-driver-data/shots/<name>.png (same as driver.mjs).

import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const argv = process.argv.slice(2);
const fresh = argv.includes('--fresh');
const ddIdx = argv.indexOf('--data-dir');
const dataDir = ddIdx !== -1 ? path.resolve(argv[ddIdx + 1]) : path.join(root, 'tmp-driver-data');
// Query string appended to index.html. There is no main process here to open
// windows, so the modes it would normally pick (welcome=1, nexus=<id>,
// popup=1, workspace=<style>) have to be requested by hand — e.g.
// --query welcome=1 to drive the Welcome screen.
const qIdx = argv.indexOf('--query');
const query = qIdx !== -1 ? argv[qIdx + 1] : '';
const flagArgIdxs = new Set([ddIdx, qIdx].filter(i => i !== -1).map(i => i + 1));
const commands = argv.filter((a, i) =>
  a !== '--fresh' && a !== '--data-dir' && a !== '--query' && !flagArgIdxs.has(i));

if (fresh) fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(path.join(dataDir, 'shots'), { recursive: true });
process.env.DRACONDEX_DATA_DIR = dataDir;

// ── Electron stub ──────────────────────────────────────────────────────────
const handlers = new Map();
const paths = { userData: path.join(dataDir, 'electron-user-data'), exe: process.execPath, appData: dataDir };
const fakeElectron = {
  app: {
    isPackaged: false,
    getPath: (k) => paths[k] ?? dataDir,
    setPath: (k, v) => { paths[k] = v; },
    commandLine: { appendSwitch: () => {} },
    requestSingleInstanceLock: () => true,
    on: () => {},
    whenReady: () => new Promise(() => {}), // never create a BrowserWindow
    quit: () => {},
  },
  BrowserWindow: class { static getAllWindows() { return []; } static getFocusedWindow() { return null; } static fromWebContents() { return null; } },
  ipcMain: { handle: (ch, fn) => handlers.set(ch, fn) },
  dialog: { showSaveDialog: async () => ({ canceled: true }), showOpenDialog: async () => ({ canceled: true }) },
  Menu: { buildFromTemplate: () => ({}), setApplicationMenu: () => {} },
};
const Module = require('module');
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'electron') return fakeElectron;
  return origLoad.call(this, request, ...rest);
};
require(path.join(root, 'main.js')); // registers all ~230 IPC handlers
console.log(`[web-driver] ${handlers.size} IPC handlers registered`);

// BigInt (lastInsertRowid) is not JSON-serializable across the page bridge.
const sanitize = (v) => JSON.parse(JSON.stringify(v, (_, x) => (typeof x === 'bigint' ? Number(x) : x)) ?? 'null');

// ── Chromium ───────────────────────────────────────────────────────────────
const { chromium } = require(path.join(root, 'node_modules', 'playwright-core'));
const exeCandidates = [undefined, '/opt/pw-browsers/chromium'];
// Persistent context keeps localStorage (theme/language/active nexus) across
// invocations, mirroring how the real Electron user-data dir behaves.
let browser;
for (const executablePath of exeCandidates) {
  try {
    browser = await chromium.launchPersistentContext(path.join(dataDir, 'chromium-profile'), {
      executablePath, args: ['--no-sandbox'], viewport: { width: 1280, height: 800 },
    });
    break;
  } catch (e) { if (executablePath === exeCandidates.at(-1)) throw e; }
}
const page = browser.pages()[0] ?? await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('[renderer:error]', m.text()); });
page.on('pageerror', (e) => console.log('[renderer:pageerror]', e.message));

await page.exposeFunction('__ipc', async (ch, args) => {
  const fn = handlers.get(ch);
  if (!fn) throw new Error(`no IPC handler for ${ch}`);
  return sanitize(await fn({ sender: null }, ...args));
});

// Run the real preload.js with contextBridge/ipcRenderer shims.
const preloadSrc = fs.readFileSync(path.join(root, 'preload.js'), 'utf8');
await page.addInitScript(`
  (() => {
    // preload.js destructures these from require('electron') itself.
    const require = () => ({
      contextBridge: { exposeInMainWorld: (k, v) => { window[k] = v; } },
      // .on() is a fire-and-forget subscribe (e.g. onTabInbound) with no
      // second Electron window to ever push an event in this single-page
      // harness — a no-op is enough to stop it throwing during boot.
      ipcRenderer: { invoke: (ch, ...a) => window.__ipc(ch, a), on: () => {} },
    });
    ${preloadSrc}
  })();
`);

await page.goto('file://' + path.join(root, 'index.html') + (query ? `?${query}` : ''));
await page.waitForSelector('.module-item, #left-panel-inner .empty, #left-panel-inner .ph, #hub-body', { timeout: 15000 });
console.log('[web-driver] app ready');

// ── Command loop (same vocabulary as driver.mjs) ───────────────────────────
let failed = false;
for (const raw of commands) {
  const sp = raw.indexOf(' ');
  const verb = sp === -1 ? raw : raw.slice(0, sp);
  const rest = sp === -1 ? '' : raw.slice(sp + 1).trim();
  try {
    switch (verb) {
      case 'ss': {
        const file = path.join(dataDir, 'shots', `${rest || 'shot'}.png`);
        await page.screenshot({ path: file });
        console.log(`[ss] ${file}`);
        break;
      }
      case 'click': await page.click(rest, { timeout: 5000 }); console.log(`[click] ${rest}`); break;
      case 'hover': await page.hover(rest, { timeout: 5000 }); console.log(`[hover] ${rest}`); break;
      case 'dragto': {
        // Real HTML5 drag-and-drop via actual mouse.down/move/up (multiple
        // intermediate moves, like a human drag) — ported from driver.mjs so
        // Playwright-Chromium sessions can verify draggable="true" handlers
        // the same way genuine Electron sessions do. Optional third segment
        // picks the vertical fraction of the target row to drop on (0=top
        // edge, 0.5=center, 1=bottom edge); defaults to center.
        const [srcSel, dstSel, fracStr] = rest.split(' :: ').map(s => s.trim());
        const frac = fracStr !== undefined ? parseFloat(fracStr) : 0.5;
        const src = page.locator(srcSel).first();
        const dst = page.locator(dstSel).first();
        const srcBox = await src.boundingBox({ timeout: 5000 });
        if (!srcBox) throw new Error('dragto: source element not visible');
        const sx = srcBox.x + srcBox.width / 2, sy = srcBox.y + srcBox.height / 2;
        await page.mouse.move(sx, sy);
        const dstBox = await dst.boundingBox({ timeout: 5000 });
        if (!dstBox) throw new Error('dragto: destination element not visible');
        const dx = dstBox.x + dstBox.width / 2, dy = dstBox.y + dstBox.height * frac;
        await page.mouse.down();
        await page.mouse.move(sx + (dx - sx) / 2, sy + (dy - sy) / 2, { steps: 5 });
        await page.mouse.move(dx, dy, { steps: 5 });
        await page.mouse.move(dx, dy, { steps: 2 });
        await page.mouse.up();
        console.log(`[dragto] ${srcSel} -> ${dstSel} @${frac}`);
        break;
      }
      case 'rclick': {
        // Real mouse-driven right-click so it fires a genuine `contextmenu`
        // event, not a synthetic dispatchEvent — ported from driver.mjs.
        const el = page.locator(rest).first();
        const box = await el.boundingBox({ timeout: 5000 });
        if (!box) throw new Error('rclick: element not visible');
        const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
        await page.mouse.move(cx, cy);
        await page.mouse.down({ button: 'right' });
        await page.mouse.up({ button: 'right' });
        console.log(`[rclick] ${rest} @ ${cx},${cy}`);
        break;
      }
      case 'fill': {
        const [sel, text] = rest.split(' :: ');
        await page.fill(sel.trim(), text ?? '', { timeout: 5000 });
        console.log(`[fill] ${sel.trim()}`);
        break;
      }
      case 'upload': {
        // Real file-input upload (setInputFiles fires a genuine `change`
        // event) so FileReader-based handlers (e.g. the icon-crop uploader)
        // are exercised end-to-end, not bypassed with a synthetic value set.
        const [sel, filePath] = rest.split(' :: ').map(s => s.trim());
        await page.setInputFiles(sel, filePath, { timeout: 5000 });
        console.log(`[upload] ${sel} <- ${filePath}`);
        break;
      }
      case 'type': await page.keyboard.type(rest); console.log(`[type] ${rest}`); break;
      case 'press': await page.keyboard.press(rest); console.log(`[press] ${rest}`); break;
      case 'waitfor': await page.waitForSelector(rest, { timeout: 8000 }); console.log(`[waitfor] ${rest}`); break;
      case 'wait': await new Promise((r) => setTimeout(r, Number(rest) || 250)); console.log(`[wait] ${rest}ms`); break;
      case 'text': console.log(`[text] ${await page.locator(rest).first().innerText()}`); break;
      case 'count': console.log(`[count] ${await page.locator(rest).count()}`); break;
      case 'eval': {
        const v = await page.evaluate(`(async () => (${rest}))()`);
        console.log(`[eval] ${JSON.stringify(v)}`);
        break;
      }
      default: throw new Error(`unknown command: ${raw}`);
    }
  } catch (e) {
    failed = true;
    console.error(`[FAIL] ${raw}\n${e.message}`);
    try { await page.screenshot({ path: path.join(dataDir, 'shots', '_failure.png') }); } catch {}
    break;
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
