# DraconDex v3 — Implementation Design (Obsidian + VS Code reference)

**Status:** design complete — implementation-ready. No source/DB/schema changes yet.
**Source:** `Plan.md` (repo root), part 1 — "Main v.3" architecture/UI redesign,
plus all design decisions iterated with the user against visual mockups
(`docs/mockups/`).
**Purpose:** the single execution plan for the v3 rework. Work proceeds phase
by phase in the order of the checklist below.

**How to update this doc (per Plan.md):** when a phase is finished, check it
off in the Master Checklist *and delete its detail block from Section B*, so
the list always shows only remaining work. Never renumber remaining phases.

This builds on top of the existing v2.8 "Nexus" rework already in the app
(vault picker home screen, wikilinks/backlinks, IDE-shell with Explorer tree,
status bar, Ctrl+P quick switcher, graph view). It reuses the app's layout
chrome and theme system — no new design system.

---

## Master checklist

> 2026-07-11 — Phases 1–8 re-aligned to the approved mockups
> (`docs/mockups/`): title bar carries no tabs (vault label + hub toggle
> only), a minimal builder tab strip hosts all open tabs (name + kind badge
> + ×; ◀/▶ history and splits remain Phase 19), module headers show the
> kind chip + tag/🔗-link chips, the Inspector gained Tag link / UI-spec
> view / Version-history sections, the status bar shows the
> `Major › Minor` breadcrumb + type badge, the rail's create tool is
> accent-styled and the four legacy fixed modules moved off the rail into a
> hub "Legacy modules" section (until Phase 23), Chronicler defaults to
> One-line with alternating event labels and Down-line became the vertical
> line + event list layout, and Locator's tools float on the canvas with
> the scale label in the zoom pill.

**M1 — Foundation**
- [x] Phase 1 — Dynamic module toolbar (nav rail)
- [x] Phase 2 — Hub panel shell (accordion + title-bar hub toggle)
- [x] Phase 3 — Nexus nest tree (Major/Minor)

**M2 — Module core**
- [x] Phase 4 — Module Inspector (detail spec · UI spec · attributes · tags · links)
- [x] Phase 5 — Category "Classifier" (+ Icon Collection picker)
- [x] Phase 6 — Folder "Collector" / Project "Manager" / Detail "Inspector"

**M3 — Graph kinds**
- [x] Phase 7 — Map "Locator"
- [x] Phase 8 — Timeline "Chronicler"
- [x] Phase 9 — TimeMap "Wanderer"
- [x] Phase 10 — Story "Narrator"

**M4 — Content kinds**
- [x] Phase 11 — Book "Author"
- [x] Phase 12 — Chat "Scribe"
- [ ] Phase 13 — Doc "Drafter"
- [ ] Phase 14 — Analys "Viewer" / Relation "Connector"

**M5 — New kinds**
- [ ] Phase 15 — Drawing "Sketcher"
- [ ] Phase 16 — Graph "Designer"

**M6 — Hub utilities**
- [ ] Phase 17 — Sage Hut section
- [ ] Phase 18 — Import Dock section (file↔linker · viewers)

**M7 — Shell & system**
- [ ] Phase 19 — Builder shell (tabs · ◀▶ history · split 2/4)
- [ ] Phase 20 — Search Link overlay
- [ ] Phase 21 — Version control
- [ ] Phase 22 — Settings expansion (module names · font size · custom themes)
- [ ] Phase 23 — Artisan template migration
- [ ] Phase 24 — Legacy data migration

---

## Section A — Obsidian / VS Code reference map

| DraconDex element | Reference pattern | What changes |
|---|---|---|
| `#title-tab-bar` | Obsidian window chrome | **Carries no tabs.** Keeps only the vault name and an Obsidian-style **hub toggle** button (show/hide `#left-panel`, wired onto `setLeftPanelCollapsed()`). The project-tab strip (`#project-tabs` / `renderProjectTabs()`) moves entirely into the builder's tab bar (Phase 19). |
| `#nav-sidebar` (56px icon rail) | VS Code **Activity Bar** | Becomes a **dynamic module toolbar**: a pinned "create Major module" tool at the top, then an icon strip auto-populated from user-created Major modules (icon tinted with the module's color, color dot badge). App-level tools that are *not* user modules — Scribe, Sage Hut, Import Dock, Artisan — stay pinned. |
| Nexus home screen | Obsidian **vault picker** | Unchanged in concept — entry point before a vault's data loads. |
| `#left-panel` (264px) | VS Code **Explorer** + Obsidian **file list** | Becomes the **hub panel**: three root accordion sections (Nexus nest / Sage Hut / Import Dock), independently collapsible. See A.1. |
| `#main-area` — the **builder** | VS Code **tabbed editor area** | Every opened module/file is a tab. Adds ◀/▶ navigation history and **split 2 / split 4** layouts. See A.2. |
| `#status-bar` | VS Code **status bar** | Adds breadcrumb (`Major › Minor › item`) and a module-type badge. |
| Ctrl+P quick switcher | Command Palette / Quick Switcher | Extended into the **Search Link overlay** (Phase 20): searches everything, scope + kind filters, Enter opens / Ctrl+Enter inserts `[[link]]`. |
| `relation.js` graph view | Obsidian **graph view** | Reused as the render engine for Connector, Narrator's board, and the Wanderer overlays — one engine, several data overlays. |
| Module Inspector | Obsidian **file properties panel** | Docked panel in the builder: detail spec, UI spec, free-form attributes, tag links, module links (outgoing/backlinks), version-history entry. |
| `markdown.js` / `mdeditor.js` | Obsidian **markdown editor** | Reused as-is for Drafter and Author chapter editing. |
| Artisan module | VS Code **template library** | Home of the old fixed modules: Director/Navigator/Hero/Writer become built-in templates (Phase 23). |

> **Notation note:** Plan.md's `-` (Major), `=` (Minor), `+` (detail spec) and
> `:` (UI spec) symbols are **notation only** — they never appear in the UI.

### A.1 — Hub panel anatomy

```
#title-tab-bar   [logo] [hub-toggle] MyVault — DraconDex          [⚙][–][▢][✕]
#left-panel (hub)
├─ ▾ Nexus nest      Major/Minor module tree — Majors drag-reorder (grip ⠿),
│                     Minors locked under their parent, one level only.
│                     Row = kind icon tinted with item color + name + kind badge.
├─ ▸ Sage Hut        expands into 4 analytics rows (Phase 17)
└─ ▸ Import Dock     imported files, each linkable to a nest item (Phase 18)
```

All three are root accordion sections in one panel — not separate nav-rail
destinations (VS Code sidebar-panel stack).

### A.2 — Builder anatomy

```
#main-area (builder)
[◀][▶] │ tab │ tab │ tab …            ← nav history + tabs (from title bar)
─────────────────────────────────────
single pane  ·  split 2 (1×2)  ·  split 4 (2×2) — each pane has its own tab row
```

- Every openable module opens here. **Minor modules open in the builder**
  and appear in the nest; only **Folder "Collector" cannot be opened**
  (pure organizer).
- ◀/▶ = browser-style back/forward through previously opened builder pages.

### A.3 — Cross-cutting module features (apply to every phase in Section B)

1. **Tag links** — hashtag chips under the module header (canvas corner for
   graph kinds) and a "Tag link" row in the Inspector. Reuses `hashtag`
   tables + `hashtagSelector()`; new `module_hashtag` join table.
2. **Module links** — module↔module wikilinks: "🔗 n links" chip on the
   header; Inspector "Module link" section shows Outgoing + Backlinks.
   Reuses `wiki_link` (`src/db/wiki.js`) with a new `module_<id>` key kind.
3. **Free-form attributes** — every Minor kind carries attributes created
   ad-hoc (no template required; Classifier additionally has its templated
   path). Inspector "Module attribute" section; `module_attribute` table.
4. **Multi-view pattern** — a "View:" segmented switcher in the module
   header. Major kinds ship **4+ views**, Minor kinds **2–3+ views**; the
   active view persists in the module's UI spec. Views per kind are listed
   in each phase.
5. **Version history** — every edit is recorded (Phase 21) and restorable.
6. **Pan/zoom** — every canvas/graph kind: right-drag pans, wheel zooms,
   zoom control (−/%/+) bottom-right, hint pill bottom-left.
7. **Naming** — the quoted unique names (Classifier, Locator, …) ARE the
   displayed type names; a Settings toggle switches Classic ↔ Unique
   (Phase 22).

---

## Section B — Phases

Format per phase: **Goal · Panel · Reference · Reuses · New · Files ·
Depends · Views · i18n · Acceptance**. "Files" lists the main touch points;
`src/renderer/mod/` is a new folder for per-kind renderers. Every
user-visible string goes through `t('key')` in **all 18 locales**
(`UI_LANGUAGE_OPTIONS` in `src/renderer/core.js`).

### Phase 13 — Doc "Drafter"
- **Goal:** blank `.md`-like page for general notes.
- **Panel:** builder. **Reference:** Obsidian blank note.
- **Reuses:** `markdown.js`/`mdeditor.js` — functionally the *existing*
  Scribe module under the new name (see C1).
- **Files:** `src/renderer/mod/drafter.js` (thin wrapper), `src/db/scribe.js`.
- **Depends:** 4; C1. **Views (2):** Edit · Read (Ctrl+E toggle).
- **Acceptance:** markdown + [[wikilinks]] render; backlinks update.

### Phase 14 — Analys "Viewer" / Relation "Connector"
- **Goal:** two read-only kinds bound to a **saved filter**: Viewer shows the
  filtered list; Connector shows its relation graph. Filters update live
  when source data changes.
- **Panel:** builder. **Reference:** VS Code search results / scoped graph.
- **Reuses:** `search.js` filtering, `relation.js` engine.
- **New:** persistent saved-filter modules (`saved_filter` def JSON).
- **Files:** `src/renderer/mod/viewer.js`, `src/renderer/mod/connector.js`,
  `src/db/module.js`.
- **Depends:** 4, E. **Views — Viewer (3):** Table · Cards · Board (grouped
  by source module; switchable to tag/kind). **Connector (2):** Graph · Edge list.
- **Acceptance:** edit an object matched by the filter → Viewer updates on
  next open; Board groups match source modules; Connector renders labeled edges.

### Phase 15 — Drawing "Sketcher"  *(new kind)*
- **Goal:** freehand canvas: **pen + eraser** (color/stroke-width picker),
  handwriting notes, multiple pages, pan/zoom, **module links pinnable as
  nodes** on the canvas (drag from Search Link), and **export to PNG**.
- **Panel:** builder full canvas.
- **Reuses:** canvas pan/zoom chrome (7/8), Search Link (20) for pinning.
- **New:** stroke capture/render; PNG export via `toDataURL`/`nativeImage`.
- **Files:** `src/renderer/mod/sketcher.js`, `src/db/module.js`
  (`sketch_page`/`sketch_stroke`), `main.js` (export dialog).
- **Depends:** 4, E. **Views (Major-level, 4):** Canvas · Pages · Gallery ·
  Export preview.
- **Acceptance:** draw, erase (strokes only), page 2 of 3, pin `[[อาริน]]`
  node, export produces a PNG file.

### Phase 16 — Graph "Designer"  *(new kind)*
- **Goal:** free-form diagram builder: shape palette (box/circle/diamond/
  text), labeled edges with arrowheads, drag-to-arrange, double-click text
  edit, module links pinnable as diagram nodes.
- **Panel:** builder full canvas.
- **Reuses:** canvas chrome; edge rendering patterns from `relation.js`.
- **New:** `design_node`(shape, x, y, text, color, linker_key) +
  `design_edge`(from, to, label).
- **Files:** `src/renderer/mod/designer.js`, `src/db/module.js`.
- **Depends:** 4, E. **Views (Major-level, 4):** Canvas · Outline · Matrix ·
  (optional) Presentation.
- **Acceptance:** build a 5-node flowchart with labeled edges incl. a
  diamond condition; pin a module link node; layout persists.

### Phase 17 — Sage Hut section
- **Goal:** global analytics across the vault, as a hub accordion section
  expanding into its 4 existing views; opening one renders analytics in the
  builder (summary tiles + per-module bars).
- **Reference:** VS Code Output/Problems panel.
- **Reuses:** `sage.js` tabs/rendering wholesale.
- **New:** entry point relocated from nav rail into the hub accordion.
- **Files:** `src/renderer/hub.js`, `src/renderer/sage.js`.
- **Depends:** 2. **Views (4):** Data size · Object amount · Linker list ·
  Linker graph.
- **Acceptance:** the four rows open in the builder as tabs; counts match DB.

### Phase 18 — Import Dock section
- **Goal:** import from a folder; imported files list in the hub section.
  **Image files link to a linker (nest item) and can be set as that item's
  display image** (shown on cards / List+Detail / Grid). **Image and
  document files open in the builder** as read-only viewer tabs (image
  viewer with zoom; document reader for .md/.docx — editing an imported doc
  converts it into a Drafter). UI copy: the action is labeled plainly
  "นำเข้าโฟลเดอร์".
- **Reuses:** `#btn-import-db` flow as starting point, `toast()`/`uiConfirm()`.
- **New:** `import_file` table incl. `linker_key` + `use_as_image`;
  file-viewer tabs.
- **Files:** `src/renderer/hub.js`, `src/renderer/mod/fileviewer.js`,
  `src/db/module.js`, `main.js` (fs access).
- **Depends:** 2, 19. **Acceptance:** import a folder; link an image to a
  Character → its card shows the image; open .png/.md in builder tabs.

### Phase 19 — Builder shell
- **Goal:** the builder's chrome: tab strip (relocated from the title bar,
  per-pane), **◀/▶ navigation history** (browser-style stack, per pane),
  and **split 2 (1×2) / split 4 (2×2)** layouts where each pane holds its
  own tabs.
- **Reference:** VS Code editor groups.
- **Reuses:** existing tab state (`S.projectTabs`/`S.entityTabs` merged into
  one builder-tab model), Ctrl+W / Ctrl+Tab shortcuts.
- **New:** pane manager; history stack; split commands.
- **Files:** new `src/renderer/builder.js`, `src/renderer/core.js`
  (`renderProjectTabs` removed from title bar), `index.html`, `style.css`.
- **Depends:** 2. **Acceptance:** open 3 modules → tabs in builder; back
  button returns to previous page; split 4 shows four independent panes.

### Phase 20 — Search Link overlay
- **Goal:** extend Ctrl+P into an overlay popup searching **everything**
  (modules, objects, events, dialogues, notes, chapters, tags) with
  **scope filters** — whole vault / same folder + same level only / current
  subtree (lower levels) — plus a kind filter. Enter opens in the builder;
  Ctrl+Enter inserts the result as `[[link]]`; results show path breadcrumb
  + kind badge + link count.
- **Reuses:** `quickswitch.js`, `wiki.quickIndex`, `searchAll()`.
- **New:** scope filtering against the module tree; insert-as-link action.
- **Files:** `src/renderer/quickswitch.js`, `src/db/wiki.js`, `src/db/module.js`.
- **Depends:** 3, E. **Acceptance:** query with scope "same folder/level"
  excludes deeper items; Ctrl+Enter inserts a working wikilink at the caret.

### Phase 21 — Version control
- **Goal:** record every edit per module (attribute edits, object
  add/delete, template changes, notes, tags) into a **Version History**
  panel with **Restore** (restore creates a new version — never overwrites).
  Retention defaults to **50 versions/module**, user-adjustable in Settings;
  oldest pruned beyond the limit.
- **Reuses:** Inspector dock chrome (Phase 4).
- **New:** `module_version`(module_ref, seq, action, payload JSON,
  create_at); write hooks in `src/db/module.js` mutations.
- **Files:** `src/renderer/versions.js`, `src/db/module.js`, `preload.js`,
  `main.js`.
- **Depends:** 4, E. **Acceptance:** edit an attribute → v(n+1) appears with
  a diff summary; Restore of v(n-2) creates v(n+2) with old values; the 51st
  version prunes the 1st.

### Phase 22 — Settings expansion
- **Goal:** four additions to the settings menu:
  1. **Module names: Classic ↔ Unique** — swaps displayed type names between
     Folder/Project/Detail/Category/Map/Timeline/TimeMap/Story/Book/Chat/
     Doc/Analys/Relation/Drawing/Graph and Collector/Manager/Inspector/
     Classifier/Locator/Chronicler/Wanderer/Narrator/Author/Scribe/Drafter/
     Viewer/Connector/Sketcher/Designer.
  2. **Font size** slider — scales text only (`--font-scale` on root; icons
     and layout untouched), alongside the existing whole-UI size slider.
  3. **Custom themes** — editor ("+ สร้างธีมเอง"): pick all 10 palette tokens
     with live preview, name it, save; appears in the theme list; edit /
     delete / import palette. Rainbow's special `style.css` rules must keep
     applying to all new v3 chrome.
  4. **Version limit** number input (Phase 21).
- **Reuses:** `renderSettingsMenu()`, `setUiSetting()`, `getThemePalettes()`,
  `UI_THEME_OPTIONS`.
- **New:** `custom_theme` storage (settings JSON or table) applied as inline
  CSS vars; both name sets in all 18 locales.
- **Files:** `src/renderer/core.js`, `src/renderer/i18n.js`, `style.css`,
  `src/db/module.js`.
- **Depends:** —. **Acceptance:** toggling name mode relabels nest badges,
  tabs, Inspector and status bar instantly; font slider changes text only;
  a saved custom theme survives restart and renders the shell correctly.

### Phase 23 — Artisan template migration
- **Goal:** Director (novel), Navigator (world), Hero (game), Writer (write)
  stop being fixed top-level modules and become **built-in templates** in
  Artisan, carrying their schemas/default attributes from
  `src/db/director.js` / `navigator.js` / `hero.js` / `writer.js`. Creating
  a Major module via Classifier (Phase 5) can start from one, pre-filled.
- **Reuses:** all four modules' DB schema + `src/db/artisan.js` create-from-
  template transactions — no data model thrown away, only entry points change.
- **New:** template registration so the four appear beside user-authored
  templates; Classifier hookup instantiating Major/Minor sets from a template.
- **Files:** `src/renderer/artisan.js`, `src/db/artisan.js`,
  `src/renderer/mod/classifier.js`.
- **Depends:** 5. **Acceptance:** new Major from "Navigator" template gets
  the world-style categories/attributes; old fixed nav-rail buttons gone.

### Phase 24 — Legacy data migration
- **Goal:** map existing rows (project / world_project / game_project /
  write_project trees) onto Major/Minor instances created from their Artisan
  templates. Migration runs **lazily at template-instantiation time**;
  legacy modules stay readable until the user migrates/removes them.
- **Files:** new `src/db/migrate_v3.js`, `main.js`.
- **Depends:** 23. **Acceptance:** a legacy Navigator world converts into a
  Manager Major with its categories as Classifiers, maps as Locators,
  timelines as Chroniclers; original rows preserved until confirmed.

---

## Section C — Decisions (resolved)

1. **Scribe naming (was open):** working decision — the *existing*
   markdown-notes Scribe module is functionally Doc "Drafter" and takes that
   name; the *new* chat-bubble kind takes "Scribe", exactly as Plan.md
   assigns. The Classic↔Unique name mode (Phase 22) further reduces
   ambiguity. **Gate passed:** user approved the M4-M6 plan carrying this
   naming; Phases 12/13 are built on it.
2. **Director/Navigator/Hero/Writer** do not remain fixed modules — they
   migrate into Artisan as templates (Phase 23). *(User-confirmed.)*
3. **Scribe (chat) and Sage** stay **pinned** app-level tools on the rail /
   hub — not instantiable kinds. *(Working decision, drafted in Phases
   12/17.)*
4. **Data migration** is in scope as Phase 24 (lazy, non-destructive).
5. All mockup-iteration decisions (icons in tree rows, notation-only
   symbols, unique names + name mode, tag links, multi-node areas, true
   time scale, pan/zoom, module links, multi-view counts, open/move rules,
   free-form attributes, Search Link scopes, nav history, version control,
   no title-bar tabs + hub toggle, font-size setting, custom themes,
   Sketcher, Import Dock linking/viewers, Icon Collection, Designer,
   Viewer's three views) are folded into Sections A/B above.
6. **M1 build strategy (Phases 1-3, implemented):** built **additively**,
   not as a literal replacement. The legacy Director/Navigator/Hero/Writer/
   Scribe/Sage/Artisan modules and their `.nav-btn.nexus-only` rail buttons
   are untouched and stay fully reachable exactly as before — Phase 23's own
   acceptance criterion ("old fixed nav-rail buttons gone") already implies
   they still exist until then, so removing them in Phase 1 would have
   contradicted Phase 23 and broken the app's only way to reach existing
   user data for the whole M1-M6 window. Concretely: the new Major-module
   icon strip is *inserted* into `#nav-sidebar` (after `#nav-logo-btn`),
   not a replacement of the existing buttons; the Nexus nest / Sage Hut /
   Import Dock accordion replaces only the old flat module-card list inside
   `renderNexusHome()` (`#left-panel-inner`) on the vault-picker screen —
   Sage Hut's row opens the real Sage module via the existing `selectModule
   ('sage')`, so nothing about Sage itself is reimplemented; Import Dock is
   a static "coming later" placeholder until Phase 18. Title-bar project
   tabs (`#project-tabs`) are also left in place — Phase 2's mockup shows
   them removed, but that's only safe once Phase 19's builder tab strip
   exists to replace them, so removal is deferred to Phase 19 as that
   phase's own dependency chain (`19 → M1`) already implies.
   Opening a Major/Minor module (any kind other than Collector) renders a
   minimal placeholder detail (name, kind badge, tinted icon) in
   `#main-inner` — the real per-kind editors (Table/Canvas/Chat/…) are
   Phases 5-16; nothing about this placeholder is meant to survive once a
   kind gets its real renderer. The Classifier create flow used for now is
   a plain name/kind-select/color modal, not the full type-picker + Icon
   Collection picker — that arrives with Phase 5 and should replace
   `moduleFormModal()` in `src/renderer/hub.js` rather than sit beside it.
7. **Phase 4 build notes (implemented):** the Inspector (`src/renderer/
   inspector.js`) is docked inside the same `#main-inner` placeholder from
   Phase 1-3 (a `.module-builder` flex row: `.module-main` + `.module-
   inspector`), not a separate builder pane — there is no builder yet
   (Phase 19). Module links are wired through the *existing* generic
   `wiki_link` system exactly as Section E.2 specifies: `src/db/wiki.js`
   gained a `module` resolver, `KEY_LOOKUPS` entry, `quickIndex`/
   `getEntityPath` cases and a `CONTENT_SOURCES` entry, so modules are now
   first-class wiki citizens — any content can `[[link]]` to a module and
   vice versa, `openEntityByKey()` navigates to them, and renaming a module
   rewrites `[[old name]]` occurrences elsewhere (`renameWikiTarget`) the
   same way object/chapter renames already did. The `description` column
   added to `module` is the free-text field wikilinks live in — kind-
   specific "detail spec" fields (grid scale, linked timeline, …) don't
   exist yet since no kind has kind-specific settings until Phases 5+; the
   Module UI spec section is a placeholder pointing at Version History
   (Phase 21) for the same reason. `getAttrs/upsertAttr/deleteAttr`,
   `getUi/setUi`, `getTags/setTags`, `getLinks` all match Section E.3's
   `api.module.*` surface as specified.
8. **Phase 5 build notes (implemented) — parallel schema instead of reusing
   Director's tables:** Section E.2 originally said Classifier should reuse
   `object_category`/`object_template`/`object`/`object_attribute`. Investi-
   gating that turned up more risk than expected: those tables are read
   through `INNER JOIN`s that assume every row belongs to a real legacy
   `project` (most importantly `wiki.js`'s `obj` resolver, `nexusOfObject`,
   `quickIndex`, and `rebuildWikiIndex`'s object loop all `JOIN project p ON
   o.project_id=p.id`), plus Director/Navigator/Hero/relation.js/hashtag.js
   all query `object_category`/`object` directly. Making `object.project_id`
   nullable for module-scoped rows would have meant auditing and patching
   every one of those call sites, on tables three already-shipped modules
   depend on. Given that risk, Classifier instead got its own parallel
   tables — `classifier_object`/`classifier_template`/`classifier_attribute`
   (Section E.1) — mirroring Director's category→template→object→attribute
   shape without touching the shared tables at all. `object_ref` on
   `classifier_template` (NULL = shared category template, set = a
   Character's one private attribute) is the mechanism for Section E.2's
   "per-character custom attribute = one template row scoped by object_ref."
   `cat_type` ended up as a nullable column directly on `module` (alongside
   `description` from Phase 4) rather than in Section E.1's original
   location, matching how `description` was added.
   The **Artisan template picker** in the create-Classifier flow is not
   implemented — Phase 23 (the thing it would pick from) doesn't exist yet,
   so the modal only offers a blank category, per the Phase 23 dependency
   already implied by Section F's recommended order. **"Relation in Cat"**
   (one of the four views) is a static grid layout of the category's object
   names, not a real relationship graph — Classifier objects have no
   relation-type system of their own yet (Director's `relation`/
   `relation_obob` tables are project-scoped, not usable here), and building
   one was out of scope for this phase; revisit alongside Phase 14
   (Connector) or a future phase if per-category relationships are wanted.
   `classifier_attribute` values are edited inline (contenteditable table
   cells / detail-panel fields) with no version history yet — same
   Phase-21-shaped gap as everything else in M1-M2 so far.
9. **Phase 6 build notes (implemented):** Collector's "cannot open in the
   builder" behavior was already correct since Phase 3 (`openModuleNode()`
   already special-cased `kind==='collector'` to toggle-expand instead of
   opening) — Phase 6 added no Collector code, just re-verified it. Manager
   (`src/renderer/mod/manager.js`) reads its children straight off the
   `.children` array `api.module.getTree()` already attaches to Majors, so
   the only network round-trip is the persisted view + a per-child
   attribute count; "counts" is Phase 4's `module_attribute` count (generic
   across every kind), not a kind-specific object count, since a generic
   Manager has no way to know what "objects" mean for an arbitrary child
   kind. Detail/Inspector (`src/renderer/mod/detail.js`) doesn't introduce
   a new note field — it mounts the shared `createMarkdownEditor` (same
   component Scribe/object notes use) directly on `module.description`
   (the same field Phase 4's Inspector dock already edits in its small
   textarea), so the two views literally show the same data. That surfaced
   a real bug during testing — saving from the big editor left the Inspector
   dock's mirrored textarea and outgoing-link chips stale until the module
   was reopened — fixed by having the editor's save callback reload and
   swap in a fresh Inspector dock (`.module-inspector` outerHTML) without
   tearing down the editor mid-edit.
10. **Phase 7 build notes (implemented):** matched Section E.2's
    "generalize, don't replace" call — `map` gained a nullable `module_ref`
    column via a table-rebuild migration (`migrateMapV3` in `src/db/core.js`,
    same CREATE-new/copy/DROP/RENAME pattern as other v3 migrations) rather
    than a parallel schema, since `map`/`map_area`/`map_point` had no
    `wiki.js`/cross-module `INNER JOIN` coupling to worry about (unlike
    Phase 5's Classifier) and Director's own map queries already filter by
    `project_id`, so a `module_ref`-scoped row is invisible to them for free.
    `src/renderer/map.js`'s existing Konva pan/zoom/polygon engine is shared
    as-is between Director's legacy per-project Map and the new Locator
    kind: the handful of call sites that used to assume a Director context
    (`selectMapArea`/`setMapTool`/`createMapArea`/`saveMapArea`/`delMapArea`)
    now route their refresh through a small `refreshMapHost()` dispatcher
    that calls `mountLocatorBoard()` when `S.activeModuleNode?.kind ===
    'locator'` and falls back to the original `renderMapView()` otherwise,
    instead of forking the file. The on-shape label (area name + centroid
    x/y + node count, required by this phase's acceptance criteria) and its
    zoom-independent sizing (`fontSize: 12.5 / scale`, recentered via
    `offsetX`/`offsetY`) were added directly inside `renderMapBoard()`, so
    Director's legacy Map view picked up the same on-shape labels as a
    side effect — left as-is since it's a strict improvement and keeps the
    two Map surfaces visually consistent. Rescaling Circle/Line/Text
    children on zoom (both the canvas wheel handler and Locator's +/−
    buttons) was factored into one `rescaleMapLayer(layer, newScale)`
    helper in `map.js` used by both `map.js`'s own wheel handler and
    `zoomLocator()` in `src/renderer/mod/locator.js`, instead of duplicating
    the rescale logic per call site. The distance grid (`24px = 10 km`) is
    scoped to Locator only via a `.map-whiteboard.locator-board` compound
    selector in `style.css` — a plain `.locator-board{background-image:…}`
    rule was tried first but lost the cascade to the pre-existing
    `.map-whiteboard{background:var(--raised)}` shorthand (equal
    specificity, later in file, `background` resets `background-image`),
    so it had to be bumped to match specificity rather than reordering the
    file.
11. **Phase 8 build notes (implemented):** same generalize-don't-replace
    call as Phase 7 — `timeline` gained a nullable `module_ref` via
    `migrateTimelineV3` (identical table-rebuild shape to `migrateMapV3`),
    since `getTimelines`/`getEventsByHashtag`/`hashtag.js`'s timeline join
    all filter by `project_id` in a `WHERE` clause rather than an
    `INNER JOIN` that would break on a NULL, and `timeline_event`/
    `timeline_date` never reference `project_id` at all. A Chronicler
    module owns any number of timeline "lines" directly (new
    `getModuleTimelines`/`createModuleTimeline` in `src/db/timeline.js`,
    scoped by `module_ref` the same way Director's project-scoped
    `getTimelines`/`createTimeline` already worked) rather than nesting a
    single container row, matching how a Director project also owns
    several timelines side by side. `src/renderer/timeline.js`'s existing
    true-time-scale SVG graph was split into a standalone
    `buildTimelineGraphHtml(evs, tlid, color)` (previously inlined in
    `renderTimelineDetail`) plus the already-reusable
    `bindTimelineGraphInteractions(tlid)` (it only ever depended on DOM
    ids and `timelineGraphState[tlid]`, never `S.project`) — Chronicler's
    Down-line view calls both directly instead of duplicating the SVG
    generation, the same reuse shape as Locator sharing `map.js`. A month/
    year ruler (`buildTimelineRulerSvg`, tick step switches from month to
    year past a 4-year span to avoid overdraw) was added to that shared
    builder to satisfy the Goal's "month ruler on the axis" line, so
    Director's legacy Timeline view picked up the same ruler as a side
    effect — left in, same reasoning as Phase 7's on-shape map labels
    flowing back into Director's Map. One-line and Compare Parallel are
    new, lighter builders in `src/renderer/mod/chronicler.js` that plot
    on flat axis lines instead of the zigzag layout, but stay on the same
    SVG id/dataset contract (`data-start-ts`, `.tl-ruler-tick`, etc.) so
    `bindTimelineGraphInteractions` drives their pan/wheel-zoom for free;
    `updateTimelineGraphX()` gained two more rescale cases (`.tl-ruler-*`,
    `.tl-cmp-link`) to keep ruler ticks and Compare's dashed connectors
    correctly positioned through a zoom. A "shared event" in Compare
    Parallel is defined as two events with the same `start_at` id (the
    `timeline_date` row `getOrCreateDate` already dedupes identical dates
    to) — the natural, no-extra-schema definition of "the same moment"
    across two lines. Event modals are Chronicler-specific
    (`openChroniclerEventModal` etc.) rather than reusing Director's
    `openEventModal`/`openTimelineModal`: those are wired to
    `S.project`/`S.timeline` and to the project-scoped Object↔Event and
    Timeline↔Timeline relation systems (`relation_obtl`/`relation_tltl`),
    which — like Classifier's own relation gap documented in item 8 above
    — were out of scope for a module-scoped timeline; Chronicler's modals
    cover name/dates/color/story only.

---

## Section D — Component / style inventory

Everything reuses `.claude/skills/dracondex-module-style/STYLE.md` — no new
design system:

- **Colors:** CSS custom properties only (`--bg --surface --raised --hover
  --border --t1 --t2 --t3 --accent --accentH --danger --success`); no
  hardcoded hex except user-data color fallback. Custom themes (Phase 22)
  inject the same tokens.
- **Radii:** `--r` 8px / `--rs` 4px / `--rl` 12px.
- **Buttons:** `btn` + `btn-p`/`btn-s`/`btn-g`/`btn-d`, `btn-i`; icons `I.*`.
- **Text:** every user-visible string through `t('key')`, added to **all 18
  locales** (`en ja ko th zh vi id es pt fr de ru it nl pl uk tr qd`).
- **Data:** all interpolation escaped with `x()`.
- **Feedback:** `toast()` / `uiConfirm()` — never `alert()`/`confirm()`.
- **Shapes to copy:** `.ph` header, `.li` row, `.empty`, `openModal()` +
  `.fg`/`.mfoot`, `.detail-head` color-coded left border.
- **New shared v3 components (build once, reuse):** hub accordion section,
  tree row w/ tinted kind icon, builder pane + tab row + ◀▶ history,
  view switcher ("View:" segmented control), canvas chrome (grid BG,
  toolbar, zoom control, hint pill), Inspector dock, tag/link chips,
  Search Link overlay, Icon Collection modal, Version History dock.

---

## Section E — Data architecture

Conventions follow `src/db/core.js`: `INTEGER PRIMARY KEY`, `nexus_ref` FK to
`nexus`, colors via `use_color` FK, `create_at`/`update_at` TEXT defaults
`datetime('now')`, `CREATE TABLE IF NOT EXISTS` blocks appended in
`src/db/core.js`. New module logic lives in `src/db/module.js`, aggregated
via `database.js`.

### E.1 New tables

```
module            id, nexus_ref, parent_id (NULL = Major; set = Minor, one level only),
                  name, kind TEXT CHECK(kind IN ('collector','manager','inspector',
                  'classifier','locator','chronicler','wanderer','narrator','author',
                  'scribe','drafter','viewer','connector','sketcher','designer')),
                  icon TEXT, icon_color→use_color, color→use_color, description TEXT,
                  cat_type TEXT('object'|'element'|'character'), display_order INT, pinned INT DEFAULT 0
                  -- description (added in Phase 4): free-text "Module detail spec"
                  -- field, [[wikilink]]-indexed under key kind `module_<id>` (below)
                  -- cat_type (added in Phase 5): meaningful only for kind='classifier'
classifier_object     id, module_ref→module, name, color→use_color, note TEXT, display_order
classifier_template   id, module_ref→module, object_ref→classifier_object NULL,
                       description, attribute_type, levelable INT, has_condition INT, display_order
                       -- object_ref NULL = shared category template; set = the one
                       -- private attribute a Character-type object may carry
classifier_attribute  id, object_ref→classifier_object, template_ref→classifier_template,
                       attribute_value TEXT   (UNIQUE object_ref+template_ref)
                       -- Phase 5: parallel to object_category/object_template/object/
                       -- object_attribute rather than reusing them — see Section C item 8
module_attribute  id, module_ref→module, attr_name, attr_value, display_order   -- free-form "+"
module_ui         id, module_ref, ui_key, ui_value                              -- ":" incl. active view
module_hashtag    module_ref, hashtag_id  (UNIQUE pair)
module_version    id, module_ref, seq, action TEXT, payload TEXT(JSON), create_at
saved_filter      id, module_ref (viewer/connector), def TEXT(JSON)
map_event         id, module_ref (wanderer), map_module→module,
                  timeline_module→module, area_ref, event_ref, label
sketch_page       id, module_ref, page_no, name
sketch_stroke     id, page_ref→sketch_page, tool('pen'|'eraser'), color, width,
                  points TEXT(JSON [x,y,...])
design_node       id, module_ref, shape('box'|'circle'|'diamond'|'text'),
                  x, y, w, text, color, linker_key TEXT NULL
design_edge       id, module_ref, from_node, to_node, label
import_file       id, nexus_ref, folder, filename, path, mime,
                  linker_key TEXT NULL, use_as_image INT DEFAULT 0
custom_theme      id, name UNIQUE, palette TEXT(JSON: 10 tokens)
```

### E.2 Generalized existing tables (add `module_ref`, keep legacy columns)

| Kind | Reuse |
|---|---|
| Locator | `map`, `map_area`, `map_point` — area+points already model 1-area/N-nodes; add `module_ref` on `map`; render points as polygon vertices |
| Chronicler | `timeline`, `timeline_date`, `timeline_event` + `module_ref` on `timeline` |
| Narrator | `game_story`/`game_dialogue`/`game_conversation` shape, generalized (or new `story_*` mirrors) |
| Author | `write_book`, `write_chapter` + `module_ref` |
| Scribe (chat) | `write_note`/`write_chat` shape, generalized |
| Drafter | `note` (markdown) + `module_ref` |
| Classifier | *(not generalized — see Section E.1's `classifier_object`/`classifier_template`/`classifier_attribute` and Section C item 8 for why)* |
| Links | `wiki_link` — new source/target key kind `module_<id>` |
| Tags | `hashtag` + new `module_hashtag` |

### E.3 IPC surface (`preload.js` → `main.js` handlers → `src/db/module.js`)

```
api.module:   getTree(nx) · get(id) · create(data) · update(id,data) · delete(id)
              reorder(id,order) — Majors only; move rejected for Minors
              getAttrs/upsertAttr/deleteAttr · getUi/setUi
              getTags/setTags · getLinks(id)            (wiki-backed)
              getVersions(id)/restoreVersion(id,seq)
api.classifier: setCatType(id,catType) · getObjects/getObject/createObject/updateObject/
              updateObjectNote/deleteObject · getTemplates/getObjectTemplates/
              createTemplate/updateTemplate/deleteTemplate/countObjectTemplates ·
              getAttrs(objectId)/upsertAttr(objectId,templateId,value)
              -- Phase 5, not in the original Section E.3 draft (added when
              -- Classifier got its own tables instead of reusing object.*)
api.searchlink: query(nx, text, scope('vault'|'siblings'|'subtree'), kind)
api.importdock: importFolder() · list(nx) · linkFile(id,key,useAsImage) · readFile(id)
api.sketch:   pages/strokes CRUD · exportPng(moduleId,pageNo)
api.design:   nodes/edges CRUD
api.theme:    listCustom() · saveCustom(name,palette) · deleteCustom(id)
```

Channel naming mirrors existing style: `module:getTree`, `sketch:exportPng`, …

---

## Section F — Work-order summary

| Milestone | Phases | Depends on | Size |
|---|---|---|---|
| M1 Foundation | 1–3 | E schema | M |
| M2 Module core | 4–6 | M1 | L |
| M3 Graph kinds | 7–10 | M2 (9 needs 7+8) | L |
| M4 Content kinds | 11–14 | M2 (12/13 need C1 gate) | M |
| M5 New kinds | 15–16 | M2 (+20 for pinning) | M |
| M6 Hub utilities | 17–18 | M1 (18 also needs 19) | M |
| M7 Shell & system | 19–24 | 19→M1 · 20→3 · 21→4 · 22→— · 23→5 · 24→23 | L |

Recommended order: E schema → 1,2,3 → 19 → 4 → 5 → 6 → 7,8 → 20 → 9,10 →
11–14 → 15,16 → 17,18 → 21,22 → 23 → 24.

---

## Visual mockups (`docs/mockups/`)

Static, non-functional HTML mockups + PNG renders, built with DraconDex's
actual midnight-theme tokens from `style.css` (plus 7 real theme palettes).
Sources: `build.js` (generator), `mock.css`, one HTML per screen.

| Screens | Shows | Phase |
|---|---|---|
| 01-shell | toolbar + hub accordion + nest tree + builder tabs | 1–3, 19 |
| 02-classifier | create-Classifier modal (Object/Element/Character) | 5 |
| 03-locator | multi-node polygon areas + grid + pan/zoom | 7 |
| 04-chronicler, 22, 23 | true time scale · down-line+list · compare parallel | 8 |
| 05-inspector | Module Inspector: detail/attributes/tags/links/UI spec | 4 |
| 06-scribe-chat | chat bubbles | 12 |
| 07-settings | name mode · font size · UI size · version limit · themes | 22 |
| 08-manager, 09-detail | Manager browse view · Detail note | 6 |
| 10-wanderer | dual map+timeline with MapEvent link | 9 |
| 11-narrator | dialogue route board | 10 |
| 12-author | chapters + long-form editor | 11 |
| 13-drafter | markdown page | 13 |
| 14-viewer, 32, 33 | Viewer: Table · Cards · Board | 14 |
| 15-connector | relation graph of a filter | 14 |
| 16-split2, 17-split4 | builder split layouts | 19 |
| 18-final, 19-overview | full final state · montage of all screens | — |
| 20, 21 | Classifier views: List+Detail · Grid | 5 |
| 24-searchlink | Search Link overlay + scope filter | 20 |
| 25-sagehut | Sage Hut analytics | 17 |
| 26-versions | Version History + ◀▶ nav buttons | 21, 19 |
| 27-customtheme | custom theme editor | 22 |
| 28-sketcher | drawing canvas + link nodes + export | 15 |
| 29-importdock | file↔linker + image/doc viewers | 18 |
| 30-iconpicker | Icon Collection modal | 5 |
| 31-designer | free-form diagram builder | 16 |
| theme-* | shell in daylight/moonlight/redEclipse/clearSky/atDusk/clearAurora/rainbow | 22 |

---

## Verification (of this design pass)

- Every Plan.md part-1 bullet (Major/Minor/detail/UI specifiers,
  Collector/Manager/Inspector/Classifier + Object/Element/Character,
  Locator/Chronicler/Wanderer/Narrator/Author/Scribe/Drafter/Viewer/
  Connector, Sage Hut, Import Dock) maps to exactly one phase, plus the
  user-added Sketcher, Designer and system features (Phases 15–16, 19–22).
- Artisan migration for Director/Navigator/Hero/Writer is Phase 23; data
  migration is Phase 24.
- File paths named in phases exist in the repo today (verified during
  exploration); table/column conventions match `src/db/core.js`.
- During implementation, each phase's acceptance criteria are exercised with
  the `run-dracondex` skill (launch, click-through, screenshot).
- No automated tests apply to this pass — documentation/design deliverable.
