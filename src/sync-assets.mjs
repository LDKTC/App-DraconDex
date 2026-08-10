#!/usr/bin/env node
// sync-assets.mjs — mirror the shared asset masters into the Flutter app.
//
// Flutter's pubspec.yaml can only declare assets that live inside its own
// package directory, so flutter/assets/ cannot point at src/assets/. The
// masters live here; flutter/assets/ is a committed mirror of them (git stores
// identical content as one blob, so the copy costs nothing in history).
//
//   node src/sync-assets.mjs           copy masters -> flutter/assets/
//   node src/sync-assets.mjs --check   compare only; exit 1 if out of sync
//
// Edit the masters under src/assets/, never the mirror.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const check = process.argv.includes('--check');

// [master dir, mirror dir] — relative to the repo root.
const PAIRS = [
  ['src/assets/flutter', 'flutter/assets/images'],
  ['src/assets/fonts', 'flutter/assets/fonts'],
];

let copied = 0;
let stale = 0;

for (const [fromRel, toRel] of PAIRS) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  if (!fs.existsSync(from)) {
    console.error(`sync-assets: master dir missing: ${fromRel}`);
    process.exit(1);
  }
  if (!check) fs.mkdirSync(to, { recursive: true });

  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    if (!fs.statSync(src).isFile()) continue;
    const dest = path.join(to, name);
    const same = fs.existsSync(dest) && fs.readFileSync(src).equals(fs.readFileSync(dest));
    if (same) continue;
    if (check) {
      console.error(`out of sync: ${toRel}/${name} differs from ${fromRel}/${name}`);
      stale++;
    } else {
      fs.copyFileSync(src, dest);
      console.log(`copied ${fromRel}/${name} -> ${toRel}/${name}`);
      copied++;
    }
  }

  // A file in the mirror with no master is a leftover, not an asset.
  if (fs.existsSync(to)) {
    for (const name of fs.readdirSync(to)) {
      if (fs.existsSync(path.join(from, name))) continue;
      console.error(`orphan in mirror (no master): ${toRel}/${name}`);
      stale++;
    }
  }
}

if (check) {
  if (stale) {
    console.error(`\n${stale} file(s) out of sync — run: node src/sync-assets.mjs`);
    process.exit(1);
  }
  console.log('assets in sync');
} else {
  console.log(copied ? `\n${copied} file(s) copied` : 'assets already in sync');
}
