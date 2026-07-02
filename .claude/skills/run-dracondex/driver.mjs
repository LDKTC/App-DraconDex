#!/usr/bin/env node
// Batch driver for the DraconDex Electron app (agent tooling, not product code).
//
// Launches the app against an isolated scratch data dir (DRACONDEX_DATA_DIR),
// runs the commands given as argv, then quits. Each argv entry is one command:
//
//   node .claude/skills/run-dracondex/driver.mjs [--fresh] [--data-dir <path>] \
//     "ss nexus" "click .module-item" "wait 400" "ss director"
//
// Commands:
//   ss <name>              screenshot -> tmp-driver-data/shots/<name>.png
//   click <selector>       click first match (Playwright selector syntax)
//   fill <selector> :: <text>   set an input's value
//   type <text>            type into focused element
//   press <key>            keyboard key, e.g. Enter, Control+A
//   waitfor <selector>     wait for selector to be visible (10s timeout)
//   wait <ms>              sleep
//   text <selector>        print innerText of first match
//   count <selector>       print number of matches
//   eval <js>              run JS in the renderer, print JSON result
//   evalmain <js>          run JS in the Electron main process, print JSON result
// Flags:
//   --fresh                wipe the scratch data dir before launching
//   --data-dir <path>      scratch data dir (default: <repo>/tmp-driver-data)

import path from 'node:path';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { _electron as electron } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const require_ = createRequire(import.meta.url);
const { ensureElectron } = require_(path.join(root, 'ensure-electron.js'));

// --- parse argv ---
const commands = [];
let dataDir = path.join(root, 'tmp-driver-data');
let fresh = false;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--fresh') fresh = true;
  else if (argv[i] === '--data-dir') dataDir = path.resolve(argv[++i]);
  else commands.push(argv[i]);
}
const shotsDir = path.join(dataDir, 'shots');

if (fresh && existsSync(dataDir)) rmSync(dataDir, { recursive: true, force: true });
mkdirSync(shotsDir, { recursive: true });

const env = { ...process.env, DRACONDEX_DATA_DIR: dataDir };
delete env.ELECTRON_RUN_AS_NODE;

console.log(`[driver] data dir: ${dataDir}`);
const app = await electron.launch({
  executablePath: ensureElectron(),
  args: [root],
  cwd: root,
  env,
});
const win = await app.firstWindow();
await win.waitForLoadState('domcontentloaded');
// Renderer builds the UI at DOMContentLoaded; nexus tiles are the ready signal.
await win.waitForSelector('.module-item', { timeout: 15000 });
console.log('[driver] app ready');

let failed = false;
for (const raw of commands) {
  const sp = raw.indexOf(' ');
  const verb = sp === -1 ? raw : raw.slice(0, sp);
  const rest = sp === -1 ? '' : raw.slice(sp + 1).trim();
  try {
    switch (verb) {
      case 'ss': {
        const file = path.join(shotsDir, `${rest || 'shot'}.png`);
        await win.screenshot({ path: file });
        console.log(`[ss] ${file}`);
        break;
      }
      case 'click':
        await win.click(rest, { timeout: 5000 });
        console.log(`[click] ${rest}`);
        break;
      case 'fill': {
        const [sel, text] = rest.split(' :: ');
        await win.fill(sel.trim(), text ?? '', { timeout: 5000 });
        console.log(`[fill] ${sel.trim()}`);
        break;
      }
      case 'type':
        await win.keyboard.type(rest);
        console.log(`[type] ${rest}`);
        break;
      case 'press':
        await win.keyboard.press(rest);
        console.log(`[press] ${rest}`);
        break;
      case 'waitfor':
        await win.waitForSelector(rest, { timeout: 10000 });
        console.log(`[waitfor] ${rest} visible`);
        break;
      case 'wait':
        await new Promise(r => setTimeout(r, parseInt(rest, 10) || 250));
        console.log(`[wait] ${rest}ms`);
        break;
      case 'text': {
        const t = await win.locator(rest).first().innerText({ timeout: 5000 });
        console.log(`[text] ${JSON.stringify(t)}`);
        break;
      }
      case 'count': {
        const n = await win.locator(rest).count();
        console.log(`[count] ${n}`);
        break;
      }
      case 'eval': {
        const result = await win.evaluate(rest);
        console.log(`[eval] ${JSON.stringify(result)}`);
        break;
      }
      case 'evalmain': {
        const result = await app.evaluate((electronMod, code) => {
          const { app, BrowserWindow, ipcMain } = electronMod;
          return eval(code);
        }, rest);
        console.log(`[evalmain] ${JSON.stringify(result)}`);
        break;
      }
      default:
        throw new Error(`unknown command: ${verb}`);
    }
  } catch (err) {
    console.error(`[FAIL] ${raw}\n${err.message}`);
    failed = true;
    try {
      await win.screenshot({ path: path.join(shotsDir, '_failure.png') });
      console.error(`[ss] ${path.join(shotsDir, '_failure.png')}`);
    } catch { /* window may be gone */ }
    break;
  }
}

await app.close();
process.exit(failed ? 1 : 0);
