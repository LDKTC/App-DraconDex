# Process — Plan.md rollout roadmap

Roadmap breaking `Plan.md` into ordered, one-topic-at-a-time phases. Status per item is tracked here; the matching checkbox in `Plan.md` is ticked once a phase is verified working in the running app.

Note: `docs/SYSTEMS.md` / `docs/FILES.md` predate this Hub/Builder "v3 module system" (git history: Phase 1–24) and don't document it at all — flagged here, not addressed by this roadmap.

## Done (Part 1 — แก้ไข Hub, cleared from Plan.md)
All 8 items shipped and verified via `run-dracondex`: nexus-vault-head repositioned + workspace switcher/new-window, collapsed Hub sections dock to the bottom, redundant panel-collapse buttons removed, Major/Minor move rules + arbitrary-depth nesting, rename-mode focus lock (+ the click/dblclick bug that caused it), and the icon/symbol popup's scrollable dock.

One item carried forward as unresolved rather than silently dropped: the **"Symbols tab won't open after the app's been running a while"** runtime bug (originally Part 1 #6) — investigated (DB layer ruled out stateless/fresh-per-call, a 40-iteration stress test found no DOM leak) but never reproduced; a related-but-different bug (search-filter residue between icon/symbol tabs) was found and fixed instead. Needs to be caught live next time it happens — check the console/DOM at that moment.

## Part 2 — เพิ่ม / แก้ไข feature
- [ ] 1. Right-click context menu, contents vary by click target
  - Spec (from `Plan.md`): click on Nexus Hub background → module-create list. Click on a **Major** module → module-create list + "add Minor/Element" (if any) + rename + duplicate + move-to + delete + pin-toggle. Click on a **Minor** module → rename + duplicate + delete. Click on Nav-sidebar → *(not yet specified in `Plan.md` — TBD, skip until filled in)*.
  - No existing context-menu component; base it on `positionPopupNear`/`closeAllPopups` (hub.js) anchored at cursor instead of a button. The "pin toggle" action ties into Part 2 item 2 below (pin system). Status: not started
- [ ] 2. Nav-sidebar: remove the module rail, replace with a pin-module system
  - Currently `renderModuleRail()` (`src/renderer/hub.js`) puts every top-level module's icon in `#nav-sidebar`. This replaces that with an explicit pin/unpin model (pinned modules show in the rail, others don't) — ties into item 1's "pin toggle" context-menu action. Status: not started

## Part 3 — แก้ไข Builder
Files: `src/renderer/builder.js`

- [ ] 1. Dockable/reorderable tabs, drag across split panes
  - `builderPaneHeadHtml` tabs have no `draggable`/`ondragstart` today; adapt the Hub's Major-module drag cycle as the DnD precedent. Status: not started
- [ ] 2. Add a button to toggle the Module Inspector dock
  - The always-on `.module-inspector` dock (`buildInspectorHtml`, `src/renderer/inspector.js`) needs a show/hide toggle. Status: not started
