# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repo.

## What this is

DraconDex is an **Electron desktop app** ("Novel data management app" per
`package.json`) for organizing world-building data for novels: characters,
places, timelines, relationships, game/story design, and free-form
Obsidian-style markdown notes with `[[wikilinks]]`. The renderer is
**vanilla JS** (no framework) that builds all UI as HTML strings; the data
layer is `node-sqlite3-wasm` behind Electron IPC. The default UI language is
**Thai**, with 18 locales supported (see `electron/src/renderer/i18n.js`:
`en ja ko th zh vi id es pt fr de ru it nl pl uk tr qd` — `qd` is a fictional
"dragonish" placeholder locale, keep it filled in like any other).

There is also an independent **Flutter port** in `flutter/` sharing the
same SQLite schema but a separate, behind-parity codebase (see its own
section below). Everything else in this file describes the Electron app.

This repo already has an extensive, actively-maintained documentation set and
nine project-specific Claude skills — **read those before re-deriving
things from scratch.** This file is a map, not a replacement for them.

| Need to know... | Go to |
|---|---|
| Module-tree / v3 architecture, kind ↔ file ↔ IPC mapping | `docs/Architec.md` |
| How each system behaves (Director, Navigator, Hero, Writer, Scribe, Sage, Artisan, wikilinks, IDE shell) | `docs/SYSTEMS.md` |
| What's in a specific file, line-by-line responsibilities | `docs/FILES.md` |
| History of what changed and why, session to session | `docs/CHANGELOG.md` |
| Google Drive backup (the app's one connected cloud feature) | `docs/DRIVE.md` |
| Per-Nexus `.ddx` files, vault routing, the split migration | `docs/VAULTS.md` |
| The cloud-provider seam (nothing new connected yet) | `docs/CLOUD.md` |
| Sandboxed plugin runtime (installed from a git repo link) | `docs/PLUGINS.md` |
| Cloud Sync / Supabase Token Sync — **disabled since v4.5.0**, kept for history | `docs/SYNC.md` |
| Update-check notice (not an auto-updater) | `docs/UPDATE.md` |
| How to run/click/screenshot the real app | `.claude/skills/run-dracondex/SKILL.md` |
| UI/UX + wiring conventions and the static checker | `.claude/skills/dracondex-module-style/SKILL.md`, `STYLE.md` |
| Whether a file should be split, and how to split it safely | `.claude/skills/dracondex-file-arch/SKILL.md` |
| How to keep the docs above in sync after a change | `.claude/skills/write-docs/SKILL.md` |
| Bumping `package.json`'s version (x.y.z-n scheme) | `.claude/skills/version-update/SKILL.md` |
| Deciding/cutting a GitHub release (`vX.Y.Z` tag → build workflow) | `.claude/skills/build-release-git/SKILL.md` |
| Closing out a finished `Plan.md` into `procress.md` | `.claude/skills/procress-writing/SKILL.md` |
| Visual/theming review (contrast, spacing, polish across 30+ themes) | `.claude/skills/ui-researcher/SKILL.md` (also an `Agent` type) |
| UX review (task flow, information architecture, discoverability) | `.claude/skills/ux-researcher/SKILL.md` (also an `Agent` type) |

These docs are written in **Thai** (matching the project's primary language)
— that's intentional and expected; don't "fix" them to English.

## Repo layout

Three top-level folders carry the code: `electron/` (this app), `flutter/`
(the port), and `src/` (**shared resources only — no app code**). Everything
else at the root is project-wide: `package.json`, `docs/`, `.claude/`,
`.github/`.

```
electron/                    THE ELECTRON APP — everything only this side uses
  main.js                    main process — window creation, all IPC handlers (no business logic; delegates straight to database.js)
  preload.js                 contextBridge — exposes window.api.<namespace>.<fn>, 1:1 with main.js IPC channels
  database.js                require()s + re-exports everything in src/db/*.js as one object
  index.html                 near-empty HTML shell; <link>s css/ and loads every renderer script IN ORDER
  css/                       all styling, 16 files (tokens → themes → base → chrome → layout → components → legacy → v3). ORDER IS THE CASCADE; url() is relative to the stylesheet, hence ../../src/assets/brand/…
  start.js                   `npm start` entry point
  ensure-electron.js         postinstall — validates/repairs the Electron binary (node_modules is at the repo root, hence ../)
  src/db/                    data layer (runs in main process), one file per system
  src/db/schema/             ddl.js / indexes.js / seed.js (SQL data), init.js (schemaStamp+initDB), migrations.js
  src/renderer/              UI layer, one file per legacy module/system
  src/renderer/core/         global state, UI primitives, settings/theme, nav, pickers, views, routing (state.js first)
  src/renderer/hub/          the v3 Hub: kind registry, nest tree, menus, module CRUD (7 files, eager)
  src/renderer/navigator/, src/renderer/hero/   the two big legacy modules, lazy-loaded as a group via loadGroup()
  src/renderer/mod/          UI layer for the 15 v3 "module kind" renderers
  vendor/                    vendored D3 + Konva (offline-first; unpkg CDN is fallback only)
  scripts/                   finish-portable.mjs (post-build packaging step)
  test/                      a handful of node --test regression tests (`node --test 'electron/test/*.test.mjs'`)

flutter/                     separate Flutter front-end, same DB schema, behind parity

src/                         SHARED between Electron and Flutter — see src/README.md
  assets/brand/              logo/icon set Electron reads directly (../src/assets/brand/… from index.html)
  assets/flutter/, assets/fonts/   masters mirrored into flutter/assets/ by src/sync-assets.mjs
  schema/                    the SQLite contract — which side owns what; read before changing a table
  design/                    design tokens extracted from electron/css/
  supabase/                  server-side migrations for Cloud Sync (disabled since v4.5.0)
  sync-assets.mjs            copies the asset masters into flutter/assets/ (`--check` to verify only)

package.json       root — "main" points at electron/main.js; files/build.files ship electron/** + src/assets/brand/**
docs/              Architec.md, SYSTEMS.md, FILES.md, CHANGELOG.md, DRIVE.md, PLUGINS.md,
                   SYNC.md, UPDATE.md — see table above; mockups/ (static HTML/PNG design
                   references from the v3 design pass) and superpowers/plans+specs/ (past
                   feature plan/spec write-ups) are historical, not live docs
.claude/skills/    run-dracondex, dracondex-module-style, dracondex-file-arch, write-docs,
                   version-update, build-release-git, procress-writing, ui-researcher,
                   ux-researcher (see table above)
.claude/agents/    ui-researcher.md, ux-researcher.md — same research role as the two
                   skills above, invocable as an `Agent` subagent_type instead of a skill
tmp-user-data/     real dev-mode database (gitignored) — don't wipe casually
tmp-driver-data/   scratch data dir for the run-dracondex driver (gitignored)
```

**Paths inside `electron/` stay relative to `electron/`** — `index.html` loads
`src/renderer/…`, `database.js` requires `./src/db/…`. Only references that
leave the folder (the shared assets, `node_modules`, `tmp-user-data/`) carry a
`../`. Paths given to the checkers and to `node --test` are relative to the
repo root and therefore start with `electron/`.

For exhaustive per-file detail (line counts, exported functions, IPC
channels), use `docs/FILES.md` instead of re-reading every file cold.

## Architecture in one page

```
Main process (electron/main.js)
  picks a data dir (dev / portable / installer), opens a frameless
  BrowserWindow (1280x800, contextIsolation:true, nodeIntegration:false),
  registers ~470+ IPC handlers grouped by namespace, each delegating
  straight to electron/database.js
        │ ipcRenderer.invoke, via contextBridge
electron/preload.js
  window.api.<namespace>.<fn>(...) → invoke('<namespace>:<fn>', ...)
  — this file is the best "table of contents" for what the renderer can do
Renderer (electron/src/renderer/*.js, vanilla JS)
  global state object `S` holds everything (open project, selected tab, …)
  render = build an HTML string → innerHTML; handlers are global functions
  wired via onclick="..."; shared components: openModal/closeModal, toast(),
  uiConfirm() (never native alert/confirm), colorPicker(), hashtagSelector()
electron/src/db/*.js (main process)
  node-sqlite3-wasm; since v4.9.0 the store is app.ddx (settings, plugins,
  the vault registry) PLUS one <name>-<id>.ddx per Nexus under vaults/ —
  read docs/VAULTS.md before touching src/db/. One source file per system.
```

**Two coexisting module systems**, both live and both real:

1. **7 legacy fixed modules** — Director, Navigator, Hero, Writer, Scribe,
   Sage, Artisan. Each has its own `electron/src/renderer/<name>.js` +
   `electron/src/db/<name>.js` + IPC namespace. Director/Navigator/Hero/Writer are
   **hidden from the nav rail** (code still fully works) — reachable only by
   creating new ones through Artisan or migrating old data via
   `electron/src/db/migrate_v3.js`. Scribe/Sage/Artisan remain normal rail buttons.
2. **v3 generic module tree ("Nexus nest")** — a user-buildable tree of
   nodes under a vault (Nexus), each node picking one of **15 kinds**
   (collector, manager, inspector, classifier, locator, chronicler, wanderer,
   narrator, author, scribe, drafter, viewer, connector, sketcher, designer).
   `hub.js`'s `KIND_MAIN_BUILDER` registry maps kind → renderer builder;
   `openModuleNode` dispatches kind → data loader. Full kind↔file↔IPC table
   lives in `docs/Architec.md` §1 — don't guess this mapping, look it up.

**Vault files (v4.9.0).** `getDB()` is still what ~464 call sites in `src/db/`
use, but it now resolves the *active vault* from an `AsyncLocalStorage` context
that `main.js`'s `h()` wrapper sets per IPC call. App-level code
(`plugin.js`, `app_setting`, anything main.js touches outside a handler) must
use `getAppDB()` instead — `getDB()` with no vault throws rather than guessing.
`docs/VAULTS.md` explains why ALS and not a module-scoped variable, and which
delete ordering in the split migration is load-bearing.

Data-dir selection (`electron/main.js`): dev (`npm start`) → `tmp-user-data/` (or
`DRACONDEX_DATA_DIR` env override); portable build → next to the exe;
installer build → `%APPDATA%/DraconDex/`. The `run-dracondex` driver always
uses an isolated scratch dir — it never touches your real dev data.

For per-system behavior (what happens when a user does X, data flow, edge
cases already found and fixed) read `docs/SYSTEMS.md` rather than inferring
it from the code — most of it was verified by actually driving the app, not
just reading source.

## Dev workflow

```bash
npm install     # postinstall runs electron/ensure-electron.js to validate the Electron binary
npm start       # launches the app against real dev data in tmp-user-data/ (Ctrl-C won't kill Electron — close the window)

npm run build:portable    # electron-builder dir target
npm run build:exe         # legacy single-file portable exe
npm run build:installer   # NSIS installer
```

There is **no linter**, and only a handful of regression tests
(`node --test 'electron/test/*.test.mjs'` — note the glob; `node --test electron/test/` fails).
Correctness is verified by actually running the app (see next section) and by
the two static checkers.

## Verifying a change — always drive the real app

Don't claim a renderer/main/db change works without exercising it. Use the
`run-dracondex` skill:

```bash
node .claude/skills/run-dracondex/driver.mjs --fresh \
  "ss 01-before" \
  "click .module-item:has-text('Director')" "wait 400" "ss 02-after"
```

- Screenshots land in `tmp-driver-data/shots/` — **read them**, don't assume.
- If the Electron binary can't be downloaded in this environment (GitHub
  releases blocked, `electron/ensure-electron.js` 403s), use
  `.claude/skills/run-dracondex/web-driver.mjs` instead — same command
  vocabulary, runs the real renderer/preload/db stack inside Playwright
  Chromium with only the Electron shell stubbed.
- Default locale is Thai — don't rely on English `text=` selectors; use
  `onclick`-attribute or id selectors instead (see the skill for id
  conventions like `#pn`, `#fn`, `#cn`, `#on`).
- You can also assert DB/IPC state directly without clicking, e.g.
  `node .claude/skills/run-dracondex/driver.mjs "eval window.api.project.getAll(null)"`.

Full command vocabulary, gotchas (single-instance lock per data dir, frameless
window chrome, etc.) and troubleshooting are in that skill's `SKILL.md`.

## Conventions the codebase enforces

These are the **hard failures** the `dracondex-module-style` checker
(`check.mjs`) flags — treat them as required, not optional:

- Every `window.api.<ns>.<fn>()` call in the renderer must have a matching
  entry in `electron/preload.js`, which must have a matching handler in `electron/main.js`.
- Every `t('key')` used in the renderer must exist in **all 18 locale
  blocks** in `electron/src/renderer/i18n.js` (`const L`), including `qd`. A missing
  key renders as the literal key string, not an error — easy to miss without
  the checker.
- Never use `alert()` / `window.confirm()` — use the shared `openModal`/
  `closeModal`, `toast(msg, type)`, and `uiConfirm(message)` from `core.js`.
- New modules/panels need the full wiring checklist (nav rail, selectModule,
  IPC, preload) in `.claude/skills/dracondex-module-style/STYLE.md` — read
  it **before** writing new UI code; it has copy-paste shapes for the
  standard `.ph` header / `.li` row / empty state / modal / detail-head
  patterns every module reuses.

Splitting or reorganising files has its own checker and its own rules — see
`.claude/skills/dracondex-file-arch/SKILL.md` before moving code between files:

```bash
node .claude/skills/dracondex-file-arch/check-arch.mjs        # sizes + wiring
```

It hard-fails on the things a split breaks silently: a renderer file no
`<script>` tag or `loadModule()` ever loads, the same top-level name declared in
two renderer files (they share one global scope), an unlinked stylesheet or a
`url()` that lost its `../`, `build.files` not shipping a source dir, and a
`electron/src/db` file `electron/database.js` can't reach.

Run the style checker after any renderer/module change:

```bash
node .claude/skills/dracondex-module-style/check.mjs electron/src/renderer/<file>.js
node .claude/skills/dracondex-module-style/check.mjs --module <kind> electron/src/renderer/<file>.js   # new module: full wiring check
node .claude/skills/dracondex-module-style/check.mjs                                          # full sweep
```

Warnings (hardcoded colors, untranslated Thai literals, unstyled classes) are
metrics against a known baseline (**56** as of 2026-08-10 — it jumped from 31
when the sweep started recursing into `mod/` and the split folders, so those
are newly-visible pre-existing warnings, not new debt) — new code should add
**zero new warnings**, but don't chase down the pre-existing baseline unless
asked.

## Keeping the docs in sync

After a meaningful code change (new function, new IPC channel, new table
column, changed user-visible behavior), run the `write-docs` skill's
workflow rather than leaving `docs/` stale:

```bash
bash .claude/skills/write-docs/docs-diff.sh   # see what changed since the last doc sync
# update docs/FILES.md and docs/SYSTEMS.md for what actually changed
# prepend a dated entry to docs/CHANGELOG.md (Thai, matches existing format)
bash .claude/skills/write-docs/mark-synced.sh # only once all three are updated (or confirmed not needed)
```

Cosmetic-only diffs (formatting, renames with no behavior change) don't need
a doc update. Don't run `mark-synced.sh` while you still have uncommitted
work you intend to keep editing.

## Known rough edges (don't re-report these as new)

See `docs/SYSTEMS.md` §11 for the full list; notably:

- The i18n auto-translate pass (`translateCommonUiText()`, a DOM-walking
  fallback for old hardcoded strings) can visually re-translate **user
  data** that happens to match a dictionary key — display-only, doesn't
  corrupt the DB, but is a known and accepted quirk.
- `openObjectModal()` in `electron/src/renderer/modals.js` throws if called without a
  `catId` in a project with no category — current UI always passes it, so
  it's latent, not currently reachable.
- The v3 "module tree" system (`docs/Architec.md`) is documented at the
  structural level (verified by reading code) but not yet at the same
  behavior-verified depth as the 7 legacy modules in `docs/SYSTEMS.md` §3–9
  — treat v3 behavioral claims as less certain until driven live.

## Flutter port (`flutter/`)

Separate front-end, Riverpod-based, structured under `lib/{core,data,
providers,widgets,features}/`. Shares the same SQLite schema/file as the
Electron app but is developed independently and is **behind** it — it has no
`module` table at all, so none of the v3 module-tree system exists there yet,
and several legacy modules (Hero, Writer, Scribe, Sage, Artisan, wikilinks,
IDE shell) aren't implemented on this side either. It is **not** covered by
`run-dracondex` or `dracondex-module-style` — those are Electron-only.
