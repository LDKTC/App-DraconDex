# Process — Plan.md rollout roadmap

Roadmap breaking `Plan.md` into ordered, one-topic-at-a-time phases. Status per item is tracked here; the matching checkbox in `Plan.md` is ticked once a phase is verified working in the running app.

Note: `docs/SYSTEMS.md` / `docs/FILES.md` predate this Hub/Builder "v3 module system" (git history: Phase 1–24) and don't document it at all — flagged here, not addressed by this roadmap.

## Done (cleared from Plan.md)

**Part 1 round 1 — แก้ไข Hub** (8 items): nexus-vault-head repositioned + workspace switcher/new-window, collapsed Hub sections dock to the bottom, redundant panel-collapse buttons removed, Major/Minor move rules + arbitrary-depth nesting, rename-mode focus lock, and the icon/symbol popup's scrollable dock. All verified via `run-dracondex`.

Carried forward as unresolved rather than silently dropped: the **"Symbols tab won't open after the app's been running a while"** runtime bug (originally Part 1 #6) — investigated (DB layer ruled out stateless/fresh-per-call, a 40-iteration stress test found no DOM leak) but never reproduced; a related-but-different bug (search-filter residue between icon/symbol tabs) was found and fixed instead. Needs to be caught live next time it happens.

**Part 1 round 2 — ปรับแก้ Hub** (3 items):
- Import Dock delete — exposed the already-working `deleteImportFileRow` (`src/renderer/mod/fileviewer.js`) as an inline row button; fixed a real bug where deleting one file could wrongly close an unrelated open preview.
- Import Dock folder toggle — accordion expand/collapse per folder header (`S.importFolderCollapsed`, `toggleImportFolder`), matching the Nest tree's chevron pattern.
- **Bug**: Nexus Nest drag-and-drop didn't work — root cause was that only the tiny, invisible-until-hover grip icon had `draggable="true"`, not the row itself (what a user would actually grab). Fixed in `buildNestRow` (`src/renderer/hub.js`). Verifying that fix also surfaced a second latent bug in the rename-mode focus lock (`pointer-events:none` on ancestors broke click-to-focus on the rename `<input>` itself, via a Chromium quirk) — fixed with `body.renaming-lock *:has(.rename-input){pointer-events:auto}` (`style.css`). Both verified with genuine mouse-driven drag/click simulation via a new `dragto` command added to the `run-dracondex` skill's `driver.mjs`/`web-driver.mjs` (the old synthetic-event tests had missed both bugs).

**Part 2 round 1 — Pin-module system + right-click context menu** (2 items):
- Pin system — `renderModuleRail()` (`src/renderer/hub.js`) now filters `#nav-sidebar`'s rail to `S.moduleTree.filter(m => m.pinned)` instead of showing every top-level module; `toggleModulePin(id)` plus a nav-sidebar right-click checklist (`openNavSidebarContextMenu`/`buildNavPinListHtml`/`toggleNavPinAndRefresh`) toggle it, staying open across multiple toggles.
- Right-click context menu — cursor-anchored popups (`ctxAnchor`, `onHubBackgroundContextMenu`, `openModuleContextMenu`/`buildModuleContextMenuHtml`) varying by target: Hub background → create-list; Major module → create-list + separator + Add Minor/Element + Rename + Duplicate + Move to… + Delete + Pin/Unpin; Minor module → Rename + Duplicate + Move to… + Delete only. "Move to…" swaps the same popup in place (`openMoveToListInPlace`/`buildMoveToListHtml`/`moveModuleTo`). "Duplicate" clones a module and its whole descendant subtree as a new sibling (`duplicateModule`/`cloneModuleSubtree`, `src/db/module.js`, new `module:duplicate` IPC).
- **Bugs found and fixed**: `module.pinned` had no upgrade migration (present in fresh-DB schema only, silently missing on existing DBs — `src/db/core.js`); `updateModule()` silently dropped `pinned` from update payloads (`src/db/module.js`), making pin-toggling a no-op even after the column existed.
- Deliberately simplified: `duplicateModule` always resets clones' `pinned` to 0 (a duplicate can't silently clutter the pinned rail); "Move to…" is a flat depth-indented list, not a nested tree-picker.
- Flutter parity: none needed — the Flutter port has no `module` table yet (pre-existing gap, unrelated to this change).
- Verified live via `app-run-tester` (real mouse events); the real-mouse `rclick` verb was folded permanently into the `run-dracondex` skill's `driver.mjs` (documented in its `SKILL.md`), matching how `dragto` was made permanent after Part 1 round 2's drag-and-drop bug.

## Part 2 — เพิ่ม / แก้ไข feature

**PAUSED here mid-round-2** — round 2 (Artisan wizard, icon popup fixes, icon crop-import) was split across two parallel agents to go faster. Both landed code and passed static/self-review, but live verification (`app-run-tester`) was interrupted mid-run when the agents were stopped to commit at a safe checkpoint. Nothing below is confirmed working in the actual running app yet — next session should resume with a live verification pass on all three items before ticking anything in `Plan.md`.

### เพิ่ม feature (add)
- [ ] 2. Artisan — once the user picks a template, show a step-by-step modal wizard letting them configure each module themselves
  - Starts at the Manager modal, then opens each subsequent module's modal per the chosen template, letting the user pick name/icon/color themselves at each step. Status: **implemented, not yet live-verified**. Legacy one-shot per-target templates (Novel/World/Game/Write) removed per user confirmation ("the one that was opening the full module page on the hub"); only the v3 Manager+Minors structure remains, rebuilt as the step wizard. One bug found and fixed mid-implementation: the Writer target's Author-minor step had no default name.
- [ ] 3. Icon import — let the user import their own image, crop it to a circle, and use that as a module's icon
  - Status: **implemented, not yet live-verified**. New "Uploaded" tab in the icon/color picker (`src/renderer/iconpicker.js`): file input → offscreen canvas crop UI (circular mask overlay, drag-to-pan, zoom slider) → `icropConfirm()` composites to a 128×128 PNG via `toDataURL`, stored as `icon = "img:" + dataURI` (no schema change — `icon` is already free-form TEXT). `moduleIconHtml()` (`hub.js`) has a new third branch rendering `<img class="kicon-img-icon">` for `img:`-prefixed icons, styled circular everywhere a module icon renders (Nest tree, nav rail, module header, empty state). Known non-blocking nits: reopening the picker on an existing `img:` icon shows a blank upload prompt instead of the prior image; the "change image" button reuses the upload-prompt copy string.

### แก้ไข feature (fix/change)
- [ ] 2. Artisan — remove the full module, no longer used
  - Status: **done as part of the wizard rewrite above** (see เพิ่ม feature #2) — same change, tracked as one item.
- [ ] 3. Icon popup — either expand the popup to show content in full, or add a vertical slider/scrollbar to the icon-collection div so it scrolls vertically
  - Confirmed already satisfied by the existing popup-level scroll dock from Part 1 #6 (`.icon-edit-popup`'s `max-height`/`overflow-y:auto`) — no further code change needed, just needs a live re-check to tick the box.
- [ ] 4. Icon popup — move the Preview to the top of the overlay, and remove the Search box
  - Status: **implemented, not yet live-verified**. `iconPicker()` (`iconpicker.js`) reordered: Preview now renders first, Search box and its filter binding removed.

## Part 3 — แก้ไข Builder
Files: `src/renderer/builder.js`

- [ ] 1. Dockable/reorderable tabs, drag across split panes
  - `builderPaneHeadHtml` tabs have no `draggable`/`ondragstart` today; adapt the Hub's Major-module drag cycle as the DnD precedent. Status: not started
- [ ] 2. Add a button to toggle the Module Inspector dock
  - The always-on `.module-inspector` dock (`buildInspectorHtml`, `src/renderer/inspector.js`) needs a show/hide toggle. Status: not started
