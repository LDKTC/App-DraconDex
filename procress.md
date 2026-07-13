# Process — Plan.md rollout roadmap

Roadmap breaking `Plan.md` into ordered, one-topic-at-a-time phases. Status per item is tracked here; the matching checkbox in `Plan.md` is ticked once a phase is verified working in the running app.

Note: `docs/SYSTEMS.md` / `docs/FILES.md` predate this Hub/Builder "v3 module system" (git history: Phase 1–24) and don't document it at all — flagged here, not addressed by this roadmap.

## Done (Part 1 — แก้ไข Hub, cleared from Plan.md)
All 8 items shipped and verified via `run-dracondex`: nexus-vault-head repositioned + workspace switcher/new-window, collapsed Hub sections dock to the bottom, redundant panel-collapse buttons removed, Major/Minor move rules + arbitrary-depth nesting, rename-mode focus lock (+ the click/dblclick bug that caused it), and the icon/symbol popup's scrollable dock.

One item carried forward as unresolved rather than silently dropped: the **"Symbols tab won't open after the app's been running a while"** runtime bug (originally Part 1 #6) — investigated (DB layer ruled out stateless/fresh-per-call, a 40-iteration stress test found no DOM leak) but never reproduced; a related-but-different bug (search-filter residue between icon/symbol tabs) was found and fixed instead. Needs to be caught live next time it happens — check the console/DOM at that moment.

## Part 1 — ปรับแก้ Hub (new, added after the first Part 1 was cleared)
- [x] 1. Import Dock — add a delete-imported-content feature
  - Status: **done** — a working per-file delete already existed (`deleteImportFileRow`, `src/renderer/mod/fileviewer.js`) but only reachable after opening a file into its full viewer page. Added an inline delete button (`.acts`, hover-reveal, same convention as Nest rows) directly on each Import Dock row in `buildImportDockRows()`, reusing that existing function/IPC as-is — no new backend. Also fixed a real bug this exposed: `deleteImportFileRow` unconditionally cleared `S.filePreview`, so deleting file B from its row while file A was open in the main preview would have wrongly closed A's preview; now it only clears the preview if the deleted file *is* the one being previewed.
  - Verified via `run-dracondex`: added two seed files, deleted one from its row (confirm dialog handled via a real click on the danger button, not the row's own hover-only button — Playwright won't click a `display:none` element), confirmed it's gone from both the DOM and `importdock.list` while the sibling file remains; separately confirmed deleting an unrelated file does not close a different file's already-open preview.
- [x] 2. Import Dock — for an imported folder, add a toggle button (as a dropdown list) for storing files into a folder
  - Status: **done** (clarified with user: expand/collapse toggle on each folder header, accordion-style, matching the Nest tree's chevron pattern). `buildImportDockRows()` (`src/renderer/mod/fileviewer.js`) now renders each `.dock-folder` header as clickable with a `.tree-chev` chevron, tracked via new `S.importFolderCollapsed` Set (keyed by folder name, `core.js`); file rows under a collapsed folder are skipped during render. New `toggleImportFolder(folder)` function, CSS `cursor:pointer` added to `.dock-folder`.
  - Verified via `run-dracondex`: two folders (F1, F2) both expanded by default; clicking F2's header hides its files (d.txt, e.txt) while F1 stays expanded (b.txt visible) — chevron direction reflects each folder's own state independently.
- [x] 3. **Bug**: Nexus Nest module move (drag-and-drop) still doesn't work — you can grab/drag it, but it doesn't actually move to the new position after release
  - Status: **done** — found two real, distinct bugs, neither of which showed up in the old synthetic-call verification (confirming the suspicion that harness was blind to real DnD wiring problems). Extended `run-dracondex`'s `driver.mjs`/`web-driver.mjs` with a genuine mouse-driven `dragto <src> :: <dst> :: [frac]` command (real `mouse.down/move/up`, not a synthetic `dispatchEvent`, not Playwright's single-jump `dragAndDrop` helper) to actually test this properly.
  - **Bug A (the real regression)**: only the tiny 6-dot grip icon (`.grip`, `opacity:0` until row-hover, ~10px wide) had `draggable="true"` — the rest of the row (name, icon, background, i.e. what a user would actually grab) had no drag affordance at all, so dragging from anywhere but that near-invisible handle silently did nothing. Fixed in `src/renderer/hub.js`'s `buildNestRow`: `draggable`/`ondragstart` moved from the grip span to the whole `.li` row (off while renaming, so it can't fight the rename `<input>` for the mousedown); grip is now purely a visual cue. Also added `-webkit-user-drag:none` (`style.css`) to `.li .acts`/`.li .kicon` so grabbing the small edit/icon buttons can't accidentally start a row drag.
  - **Bug B (found while verifying the fix)**: fixing Bug A exposed a latent issue in topic 5's rename-mode focus lock — `body.renaming-lock *{pointer-events:none}` with only `.rename-input{pointer-events:auto}` is enough to keep the input clickable for hit-testing, but Chromium's mousedown-to-*focus* handling for a descendant can still misfire when any ancestor has `pointer-events:none`, so a click meant to place the caret inside the rename box instead blurred it (triggering `saveModuleRename` and closing the box) — effectively the same symptom topic 5 was supposed to fix, just via a different mechanism. Fixed with `body.renaming-lock *:has(.rename-input){pointer-events:auto}` (`style.css`) so the input's entire ancestor chain, not just the input itself, stays interactive; everything outside that chain is still locked.
  - Verified live via the new `dragto` command: dragging from a row's name text (not the grip) now correctly reorders siblings and nests into another module; clicking inside an active rename box now keeps focus and lets you reposition the caret; clicking outside it still blurs/saves as intended; a nav button stays `pointer-events:none` throughout. Also root-caused (not just patched around) a measurement gotcha in the new `dragto` harness itself: hovering a row reveals its `.acts` buttons and grows the row's height, shifting rows below it — the command now re-measures the drop target's position *after* hovering the source, not before.

## Part 2 — เพิ่ม / แก้ไข feature

### เพิ่ม feature (add)
- [ ] 1. Right-click context menu, contents vary by click target
  - Spec (from `Plan.md`): click on Nexus Hub background → module-create list. Click on a **Major** module → module-create list + "add Minor/Element" (if any) + rename + duplicate + move-to + delete + pin-toggle. Click on a **Minor** module → rename + duplicate + move-to + delete. Click on Nav-sidebar → a toggle list to choose which buttons show on the nav sidebar.
  - No existing context-menu component; base it on `positionPopupNear`/`closeAllPopups` (hub.js) anchored at cursor instead of a button. The "pin toggle" action ties into this section's "แก้ไข feature" item 1 below (pin system), and the Nav-sidebar toggle-list ties into that same pin system too. Status: not started
- [ ] 2. Artisan — once the user picks a template, show a step-by-step modal wizard letting them configure each module themselves
  - Starts at the Manager modal, then opens each subsequent module's modal per the chosen template, letting the user pick name/icon/color themselves at each step. Status: not started
- [ ] 3. Icon import — *(stub in `Plan.md`, no detail yet — TBD, skip until filled in)*

### แก้ไข feature (fix/change)
- [ ] 1. Nav-sidebar: remove the module rail, replace with a pin-module system
  - Currently `renderModuleRail()` (`src/renderer/hub.js`) puts every top-level module's icon in `#nav-sidebar`. This replaces that with an explicit pin/unpin model (pinned modules show in the rail, others don't). Status: not started
- [ ] 2. Artisan — remove the full module, no longer used
  - Status: not started
- [ ] 3. Icon popup — either expand the popup to show content in full, or add a vertical slider/scrollbar to the icon-collection div so it scrolls vertically
  - Overlaps with (refines) the scrollable-dock work already done for the old Part 1 #6 icon/symbol popup — re-check whether that already satisfies this before changing anything further. Status: not started
- [ ] 4. Icon popup — move the Preview to the top of the overlay, and remove the Search box
  - Status: not started

## Part 3 — แก้ไข Builder
Files: `src/renderer/builder.js`

- [ ] 1. Dockable/reorderable tabs, drag across split panes
  - `builderPaneHeadHtml` tabs have no `draggable`/`ondragstart` today; adapt the Hub's Major-module drag cycle as the DnD precedent. Status: not started
- [ ] 2. Add a button to toggle the Module Inspector dock
  - The always-on `.module-inspector` dock (`buildInspectorHtml`, `src/renderer/inspector.js`) needs a show/hide toggle. Status: not started
