<p align="center">
  <img src="Image/DraconDex_Color.png" alt="DraconDex logo" width="160">
</p>

<h1 align="center">DraconDex</h1>

<p align="center">
  A desktop app for organizing world-building data for novels — characters,
  places, timelines, relationships, and free-form notes.
</p>

<p align="center">
  <em>แอปจัดการข้อมูลโลกในนิยาย — ตัวละคร, สถานที่, ไทม์ไลน์, ความสัมพันธ์,
  และโน้ตอิสระ (ภาษาไทยเป็นภาษาหลักของแอป)</em>
</p>

---

## What is DraconDex

DraconDex is an **Electron** desktop app (`"Novel data management app"` per
`package.json`) for novelists and world-builders. It stores characters,
places, timelines, relationships, game/story design data, and free-form
Obsidian-style markdown notes with `[[wikilinks]]`, all in a local SQLite
database — no account, no cloud, no internet required.

The default UI language is **Thai**, with **18 locales** supported
(`en`, `ja`, `ko`, `th`, `zh`, `vi`, `id`, `es`, `pt`, `fr`, `de`, `ru`,
`it`, `nl`, `pl`, `uk`, `tr`, and `qd` — a fictional "dragonish" placeholder
locale).

A separate, in-progress **Flutter mobile port** lives in
[`flutter_app/`](flutter_app/). It shares the same SQLite schema as the
desktop app (databases can be transferred between the two — see
[Mobile (Flutter) build](#mobile-flutter-build) below) but is developed
independently and is currently **behind** the desktop app in features.

> หมายเหตุ: เวอร์ชัน Flutter สำหรับมือถือยังพัฒนาตามหลังเวอร์ชัน Electron
> อยู่ — ฟีเจอร์บางส่วน (เช่น v3 module tree, Hero/Writer/Scribe/Sage/Artisan
> บางส่วน) ยังไม่มีในฝั่งมือถือ

## Features

- **Two coexisting module systems**: 7 legacy fixed modules (Director,
  Navigator, Hero, Writer, Scribe, Sage, Artisan) alongside a
  user-buildable **v3 "Nexus nest" module tree** — an unlimited tree of
  nodes, each picking one of 15 kinds (collector, manager, inspector,
  classifier, locator, chronicler, wanderer, narrator, author, scribe,
  drafter, viewer, connector, sketcher, designer).
- **Obsidian-style `[[wikilinks]]`** with backlinks across all note content.
- **Maps, timelines, dialogue graphs, sketching and diagramming canvases**
  built on vendored D3 and Konva (offline-first — no CDN dependency
  required at runtime).
- **Theming** and a fully localized UI across 18 languages.
- **Portable by design** — the portable build keeps your data next to the
  executable, so a whole project folder travels on a flash drive.

## Tech stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron (`contextIsolation: true`, `nodeIntegration: false`) |
| Renderer (UI) | Vanilla JS — no framework, HTML built as strings |
| Data layer | `node-sqlite3-wasm`, accessed from the renderer via Electron IPC |
| Mobile port | Flutter + Riverpod (`flutter_app/`), same SQLite schema |

## Getting started (desktop / dev)

Requirements: Node.js and npm.

```bash
npm install     # postinstall runs ensure-electron.js to validate the Electron binary
npm start       # launches the app against local dev data in tmp-user-data/
```

`npm start` runs `start.js` and opens the app against an isolated dev
database in `tmp-user-data/` (override with the `DRACONDEX_DATA_DIR`
environment variable). Note that pressing Ctrl-C in the terminal won't
close the Electron window — close the window itself to stop the app.

## Building

```bash
npm run build:portable    # electron-builder dir target (portable app folder)
npm run build:exe         # legacy single-file portable .exe
npm run build:installer   # NSIS installer (DraconDexPortable/DraconDex-Setup-<version>.exe)
```

- `build:portable` produces a portable app folder (roughly 200–220 MB) at
  `DraconDexPortable/DraconDex-<version>/`. Copy that whole folder to a
  flash drive and run `DraconDex.exe` on any Windows PC — no install
  needed, and your data (kept in `novel-manager-data` next to the exe)
  travels with the folder.
- `build:installer` builds a Windows installer with a normal
  install/uninstall flow (choose install folder, desktop + Start Menu
  shortcuts). Installed data is kept in `%APPDATA%/DraconDex/`, so it
  survives uninstall/update.
- `build:exe` builds the older single-file portable `.exe` instead of the
  `build:portable` folder target.

## Mobile (Flutter) build

> ฝั่งมือถือยังไม่ครบทุกฟีเจอร์เท่าเวอร์ชัน Desktop — ดูรายละเอียดใน
> `flutter_app/README.md`

Requirements: Flutter SDK 3.44.4+, Android Studio with Android SDK 24+, and
either a phone with USB debugging on or an Android emulator.

```bash
cd flutter_app
flutter pub get
flutter doctor       # confirm the Android toolchain shows no red X
flutter run          # launch on a connected phone or emulator

# Build a release APK:
flutter build apk --release --split-per-abi   # smaller, per-ABI APKs (recommended)
flutter build apk --release                   # universal APK, works on all devices
```

APKs are written to `flutter_app/build/app/outputs/flutter-apk/`
(`app-arm64-v8a-release.apk`, `app-armeabi-v7a-release.apk`, or
`app-release.apk`). You can also build without a local Flutter setup via
the repo's **"Build Flutter APK"** GitHub Actions workflow (Actions tab →
run workflow → download the `release-apks` artifact).

To install manually: `adb install build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`,
or copy the APK to your phone and open it (allow "Install unknown apps" if
prompted).

To move a project from the desktop app to the mobile app: export/locate
`novel-manager.db` from the desktop app's user data folder, copy it to your
phone, then use **Settings → Import Database** in the Android app.

## Project structure

```
main.js             Electron main process — window creation, all IPC handlers (delegates to database.js)
preload.js           contextBridge — exposes window.api.<namespace>.<fn>, 1:1 with main.js IPC channels
database.js          require()s + re-exports everything in src/db/*.js as one object
index.html           near-empty HTML shell; loads css/ and every renderer script in order
css/                 all styling (tokens → themes → base → chrome → layout → components → v3)
src/db/              data layer (runs in main process), one file per system
src/renderer/        UI layer, one file per legacy module/system
src/renderer/core/   global state, UI primitives, settings/theme, nav, routing
src/renderer/hub/    the v3 Hub: kind registry, nest tree, menus, module CRUD
src/renderer/mod/    UI layer for the 15 v3 "module kind" renderers
vendor/              vendored D3 + Konva (offline-first; unpkg CDN is fallback only)
scripts/             build/packaging helper scripts
docs/                architecture, per-system behavior, per-file reference, changelog (see below)
flutter_app/         separate Flutter front-end, same DB schema, behind parity
test/                a handful of node --test regression tests
```

## Testing

```bash
node --test 'test/*.test.mjs'
```

There is no linter configured for this project. Correctness is otherwise
verified by driving the real Electron app.

## Documentation

This repo keeps detailed, actively-maintained docs under `docs/`, written
in **Thai** (the project's primary language):

| Doc | Covers |
|---|---|
| [`docs/Architec.md`](docs/Architec.md) | Module-tree / v3 architecture, kind ↔ file ↔ IPC mapping |
| [`docs/SYSTEMS.md`](docs/SYSTEMS.md) | How each system behaves (Director, Navigator, Hero, Writer, Scribe, Sage, Artisan, wikilinks, IDE shell) |
| [`docs/FILES.md`](docs/FILES.md) | What's in each file, line-by-line responsibilities |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | History of what changed and why, session to session |

> เอกสารเหล่านี้เขียนเป็นภาษาไทยโดยตั้งใจ ให้สอดคล้องกับภาษาไทยที่เป็น
> ภาษาหลักของโปรเจกต์

## Contributing / AI-assisted development

This repo is developed with heavy use of [Claude Code](https://claude.com/claude-code).
[`CLAUDE.md`](CLAUDE.md) documents the architecture and conventions for AI
assistants (and human contributors) working in this codebase, and
`.claude/skills/` contains project-specific skills — including a driver for
running/screenshotting the real app (`run-dracondex`) and static checkers
for UI/UX wiring conventions (`dracondex-module-style`) and file
organization (`dracondex-file-arch`).

## License

No license file is currently included in this repository.
