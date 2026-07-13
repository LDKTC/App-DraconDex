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

## Part 2 — เพิ่ม / แก้ไข feature

### เพิ่ม feature (add)
- [ ] 1. Right-click context menu, contents vary by click target
  - Spec (from `Plan.md`): click on Nexus Hub background → module-create list. Click on a **Major** module → module-create list + "add Minor/Element" (if any) + rename + duplicate + move-to + delete + pin-toggle. Click on a **Minor** module → rename + duplicate + move-to + delete. Click on Nav-sidebar → a toggle list to choose which buttons show on the nav sidebar.
  - No existing context-menu component; base it on `positionPopupNear`/`closeAllPopups` (hub.js) anchored at cursor instead of a button. The "pin toggle" action ties into this section's "แก้ไข feature" item 1 below (pin system), and the Nav-sidebar toggle-list ties into that same pin system too. Status: not started
- [ ] 2. Artisan — once the user picks a template, show a step-by-step modal wizard letting them configure each module themselves
  - Starts at the Manager modal, then opens each subsequent module's modal per the chosen template, letting the user pick name/icon/color themselves at each step. Status: not started
- [ ] 3. Icon import — let the user import their own image, crop it to a circle, and use that as a module's icon
  - Status: not started

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
