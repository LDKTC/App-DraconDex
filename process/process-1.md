# Process 1 — Nexus module count badge, Settings polish, Hub head layout, navbar labels, Import Dock scroll fix

## Part 1 — Nexus (module count badge)
Files: `electron/src/renderer/wyvern.js`, `electron/src/renderer/dragon.js`

- [x] Module-count badge on a browsed module card changed from a bare child
  count (`"2"`) to `"2:144"` — the count of that card's direct children,
  colon, the total module count across the whole open Nexus
  (`flattenModulesByKind(S.moduleTree).length`), computed once per render
  and threaded into `wyvernBrowseCardHtml`/the Dragon canvas card builder
  instead of recomputed per card.

**Part 1 complete** — shipped `v.4.9.4` (reconstructed from commit
`abea2b3`'s own diff/message; prior session).

## Part 2 — Setting (plugin marker filter, version auto-updater)
Files: `electron/src/db/plugin.js`, `electron/src/renderer/{update,versions}.js`, `electron/main.js`, `electron/src/db/update.js`, i18n

- [x] Plugin recommend list (Settings → Plugins → "install from @LDKTC")
  now requires a `.dracondex` marker file at the candidate repo's root
  (checked via the GitHub Contents API, `repoHasDracondexMarker()`) and
  always excludes `DraconDex-Plugin-Template` by name — `pluginListOrgRepos()`
  previously only filtered `is_template`/`archived`. The template repo and
  all 4 real plugins in the account got the marker file added.
- [x] Version auto-updater — no login required. New Settings → Appdata →
  "Versions" page pulls release data straight from the DraconDex GitHub repo.
  The page's first row has a "check version" button and a hidden "install"
  button that only appears once a check finds something newer than the
  running version.
  - [x] Below the update button, an "auto-version check" checkbox — when on,
    checks for a new version automatically on every app launch, and shows a
    green download icon on the title bar next to Settings whenever a newer
    version is found.

**Part 2 complete** — shipped as two separate checkpoints, `v.4.9.3`-series
(pre-commits) → plugin-marker work landed uncommitted-to-versioned, and
`v.4.9.8` for the version auto-updater page (reconstructed from commit
history; prior session).

## Part 3 — Hub (Sage relocation, redundant switch-nexus removal, section-head collapse layout)
Files: `electron/src/renderer/hub/sections.js`, `electron/src/renderer/guide.js`, `electron/index.html`, `electron/src/renderer/core/views.js`, `electron/css/nav-hub.css`

- [x] Sage's standalone nav-rail button moved into the Sage Hut accordion
  section's own head — a new header action (`openSageTab('dataSize')`)
  jumps straight into the Sage analytics page without needing to open the
  section first, replacing the old nav-rail button one-for-one.
- [x] The Nexus title header's separate "switch nexus" (⇄) button removed —
  redundant with the existing "click the nexus name to switch" flow.
  `guide.js`'s onboarding tour step updated to point at `.nexus-vault-name`
  instead of the removed button.
- [x] Section-head collapse layout rewritten: collapsed section heads now
  sit flush against whatever follows them (the next section's head, or the
  bottom of the hub body if last in order) instead of the old stable-sort
  behavior that grouped every collapsed section after every open one.
  Section order (Nest, Sage, Import Dock) is now fixed regardless of
  collapse state — `#hub-body` is a flex column, each open `.acc-body` is
  `flex:1`, each collapsed one is `display:none`, so the layout falls out
  naturally without a sort step.
  - [x] Last-in-order collapsed section aligns to the bottom of the hub body.
  - [x] Verified the exact scenario from the plan: Import (order 3) open,
    Sage (order 2) collapsed — order stays 1/2/3, collapsed Sage's head
    rides up to sit just above Import's head while still under Nest's body.

**Part 3 complete** — shipped `v.4.9.7` (reconstructed from commit
`49cef56`'s diff/message; prior session).

## Part 4 — Navbar (full labels on expand, duplicate create-module button removed)
Files: `electron/css/nav-hub.css`, `electron/index.html`, `electron/src/renderer/core/nav.js`, `electron/src/renderer/hub/kinds.js`

- [x] Expanding the nav sidebar past the label threshold now shows a text
  label next to every rail button, not just the dynamic v3 rail items
  (home/kind-browser/create/pinned modules) — the `.nav-expanded` CSS rule
  broadened from `.nav-btn.module-rail-item,.nav-btn.module-rail-tool` to
  plain `.nav-btn`, and every static legacy button in `index.html` gained
  its own `<span class="nav-label">`.
- [x] The nav rail's standalone "+ create module" tool removed — redundant
  with the Nexus Nest section's own create button on the Hub. `guide.js`'s
  tour step retargeted to the section header's create action.

**Part 4 complete** — shipped `v.4.9.6` (reconstructed from commit
`bcb537a`'s diff/message; prior session).

## Part 5 — Import Dock (scroll position preserved across re-renders)
Files: `electron/src/renderer/core/views.js`

- [x] Opening an imported file no longer resets the Import Dock section's
  scroll position — the list stays at whatever point the user had scrolled
  to instead of jumping back to the top on every re-render.

**Part 5 complete** — shipped `v.4.9.5` (reconstructed from commit
`97547b7`'s diff/message; prior session).

**`Plan.md` rollout complete** — 5 parts this cycle (Process 1). Parts 1, 3,
4, 5 and half of Part 2 (plugin marker filter) reconstructed from their own
checkpoint commits (prior session, before this conversation's context);
Part 2's version auto-updater page likewise prior-session. No open
follow-ups identified for this cycle.
