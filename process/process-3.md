# Process 3 — Major/Minor terminology correction, Hub context-menu overhaul

## Part 1 — Major-minor module knowledge update
Files: `electron/src/renderer/i18n.js` (7 keys × 18 locales), `electron/src/renderer/hub/popups.js`, `electron/src/renderer/mod/{manager,classifier,viewer,inspector}.js`, `electron/src/renderer/artisan.js`, `electron/src/renderer/hub/kinds.js`, `electron/src/db/schema/ddl.js`, `docs/Architec.md`

The term "Major module" had been used for two years to mean "the top-level
module of a tree" — with every child underneath called "Minor module." This
was a longstanding misunderstanding that skewed feature/function design
away from what the terminology was actually meant to describe.

- [x] Terminology corrected app-wide: the old "Major module" (top-level
  only) is now called **"Main module"**. The new **"Major module"** now
  means *every* module regardless of depth — a main module and all its
  descendants alike. The new **"Minor element"** now means the sub-items
  *within* a Major module — an object of a Classifier, an area of a
  Locator, an event of a Chronicler, and equivalents for the other kinds.
  - [x] Applied consistently: i18n copy (7 keys, all 18 locales including
    `qd`), the `openMajorModuleModal` → `openMainModuleModal` rename (and
    every call site), and code comments across `mod/manager.js`,
    `classifier.js`, `viewer.js`, `inspector.js`, `artisan.js`,
    `hub/kinds.js`, `schema/ddl.js`, and `docs/Architec.md` reworded to the
    new Main/Major/Minor-element split. Persisted settings keys
    `nestShowMajorIcon`/`nestShowMinorIcon` deliberately left unrenamed
    internally (label text only changed) to avoid a silent toggle-state
    reset for existing users. `hub/menus.js`'s `isMajor` gate and
    `Architec.md`'s "Major เท่านั้น" context-menu lines were left describing
    the *old* gating behavior at this point — deliberately, since fixing
    the actual gate is Part 2's job, not a renaming exercise.

**Part 1 complete** — shipped bundled into the same `v.4.10.0` commit as
Part 2's legacy-deletion checkpoint (both finished back-to-back in one
session before the next version classification ran).

## Part 2 — Context menu
Files: `electron/src/renderer/hub/{menus,popups,tree}.js`, `electron/src/renderer/core/views.js`, `electron/src/renderer/mod/fileviewer.js`, `electron/src/renderer/i18n.js` (1 new key × 18 locales), `docs/Architec.md`, `docs/FILES.md`

The module context menu still gated several rows behind `isMajor =
m.parent_id==null` — the *old*, pre-Part-1 meaning of "Major" (top-level
only). This part is the behavioral follow-through: widen that gate, and
restructure the menu around it (Create/Import/Export/Edit rows added,
Add-Minor removed, Collector folded into Create, Move-to as a hover
flyout, Delete styled red, two redundant UI surfaces removed, and a new
right-click menu added to Import Dock file rows).

- [x] "Pin" now shows on every Major module's context menu regardless of
  tree depth — the `isMajor` variable and parameter were removed entirely
  from `openModuleContextMenu`/`buildModuleContextMenuHtml` (`hub/menus.js`)
  rather than passed as always-true, so nothing gates Create/Pin anymore.
- [x] "Move to" is now a hover flyout, matching "Create"'s existing pattern,
  instead of a click that swapped the whole popup's content in place.
  `openMoveToListInPlace` deleted; new `openMoveToSubmenu(ev,id)`
  (`hub/popups.js`) mirrors `openCreateSubmenu`'s shape exactly — appends a
  `.ctx-submenu` flyout, reuses the existing `buildMoveToListHtml`/
  `flattenModuleTree`/`positionSubmenuNear`/hover-close-timer machinery
  unchanged.
- [x] "Create" shows on every Major module (gate removed, see above).
  - [x] Create auto-parents to whichever module's context menu was opened
    — already correct from an earlier round, verified unchanged.
  - [x] "Add Minor module" row removed — Create now covers that job.
  - [x] Collector moved into the Create submenu as its first row, relabeled
    "create folder" (new i18n key `createFolder`, all 18 locales) — kept as
    a dedicated hand-written row rather than un-excluding it from the
    generic 15-kind list, so it doesn't also show up alphabetically as
    plain "Collector."
- [x] "Import module"/"Export module" rows added below Create, reusing the
  already-translated `settingDbImportModule`/`settingDbExportModule` i18n
  keys. New thin wrappers `ctxImportModule`/`ctxExportModule` (`hub/menus.js`)
  call `api.db.importModuleFile`/`exportModuleFile` directly against
  `S.nexus.id` + `findModuleNode`, rather than reusing the Settings-page
  versions in `core/db-transfer.js` (those depend on a `S.settingDbModuleTrees`
  cache the Hub never populates).
- [x] "Edit module" row added to every context menu (`openModuleEditModal`,
  already existed).
  - [x] The per-row hover "+"/pencil buttons on Nest tree rows removed
    (`buildNestRow`'s `.acts` span deleted, `hub/tree.js`) — their jobs now
    live in the context menu.
- [x] The right-click-anywhere-on-Hub "create module" popup removed —
  `onHubBackgroundContextMenu` (`hub/menus.js`) and its binding
  (`core/views.js`) deleted. The two legitimate "+"-button triggers of the
  same underlying flow (Nest section header, empty-tree CTA) were
  deliberately left untouched — they're explicit button clicks, not the
  background catch-all.
- [x] Import Dock file rows got a right-click context menu — one row,
  "delete import" (reuses the existing `t('delete')` label and the
  existing `deleteImportFileRow` action, which was already metadata-only —
  `DELETE FROM import_file WHERE id=?`, never touches the file on disk).
  New `openImportFileContextMenu(ev,id)` (`mod/fileviewer.js`) mirrors
  `openNexusOptionsPopup`'s one-row-popup shape. Scoped to file rows only —
  a folder-row bulk delete would need new backend surface (`api.importdock.delete`
  is single-id today) and was explicitly deferred rather than built here.
- [x] The context menu's "Delete" row (and the new Import Dock delete-import
  row) use `.kli-danger` — an existing token already used identically by
  `core/nexus-options.js`'s own delete row — for red/danger styling. Zero
  new CSS.

A local `row(onclick,label,cls)` helper (named `ctxRow` inside
`hub/menus.js` to avoid shadowing `buildNestOptionsPopupHtml`'s own local
`row`) was introduced for the menu's now-larger set of simple rows,
mirroring the shape `core/nexus-options.js` already used.

Verified: `dracondex-module-style`/`dracondex-file-arch` checkers at 0
errors (39/7 warnings, unchanged from baseline), full `node --test` suite
(29/29 unaffected), and live via `web-driver.mjs` against a seeded 3-deep
module tree (Manager → Classifier → Locator, plus a sibling Collector) —
right-clicking the deepest-nested module showed the full row set including
Create/Import/Export/Edit/Pin (the actual regression test for the
`isMajor` fix), the Create submenu opened on hover with "Create folder"
first, the Move-to flyout opened on hover with the correct flattened
target list (self and self's descendants excluded), a Collector-kind
module's menu correctly hid the "open in new tab/window/pane" rows, the
Delete row rendered in the danger/red color, the hub-background right-click
opened nothing while the Nest section's own "+" button still worked, and
the Import Dock file context-menu's wiring (row markup → popup → `.kli-danger`
row → `deleteImportFileRow` onclick) was confirmed directly.

**Part 2 complete** — shipped `v.4.10.1`, this session.

**`Plan.md` rollout complete** — 2 parts this cycle (Process 3). Both parts
built and verified in this session; Part 1 in an earlier segment of the
conversation, Part 2 as this cycle's closing work. No open follow-ups
identified beyond the deliberately-scoped-out Import Dock folder-row bulk
delete (needs new backend surface, not part of this checklist).
