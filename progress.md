# DraconDex v3 — UI Design (Obsidian + VS Code reference)

**Status:** design phase — not implemented. No source/DB/schema changes yet.
**Source:** `Plan.md` (repo root), part 1 — "Main v.3" architecture/UI redesign.
**Purpose:** translate Plan.md's v3 concept into a concrete interface design,
divided into work phases, so implementation can proceed phase by phase later.

This build on top of the existing v2.8 "Nexus" rework already in the app
(vault picker home screen, wikilinks/backlinks, IDE-shell with Explorer
tree, status bar, Ctrl+P quick switcher, graph view). It does not replace
the app's layout chrome or theme system — it reuses them.

---

## Section A — Obsidian / VS Code reference map

How each piece of the new UI maps to an existing Obsidian or VS Code
pattern, and what DraconDex piece it replaces or extends.

| DraconDex element | Reference pattern | What changes |
|---|---|---|
| `#nav-sidebar` (56px icon rail) | VS Code **Activity Bar** | Re-purposed. Today it's a fixed set of buttons (`.nexus-only`: Director/Navigator/Hero/Writer/Scribe/Sage/Artisan). Under v3, modules are no longer a fixed set, so the rail becomes a **dynamic module toolbar**: a pinned "create Major module" tool at the top (opens the Category "Classifier" / Artisan-template picker), followed by an icon strip that auto-populates as the user creates Major modules — like VS Code's pinnable Activity Bar entries or Obsidian's customizable ribbon. App-level tools that are *not* user-created modules — Scribe, Sage, Import Dock, Artisan — stay pinned by default. |
| Nexus home screen | Obsidian **vault picker/switcher** | Unchanged in concept — still the entry point before a project's data loads. |
| `#left-panel` (264px) | VS Code **Explorer** + Obsidian **file list**, merged | Becomes the **hub panel**: three expandable root sections stacked and independently collapsible, VS Code sidebar-panel style (like Explorer/Search/Source Control). See Section A.1 below. |
| `#main-area` + `#title-tab-bar` | VS Code **tabbed editor area** | Each opened module/detail/category opens as a tab, the way Obsidian opens notes as tabs. |
| `#status-bar` | VS Code **status bar** | Adds a breadcrumb (`Major › Minor › Detail`) and a module-type indicator badge. |
| Ctrl+P quick switcher | VS Code **Command Palette** / Obsidian **Quick Switcher** | Extended to jump to any Major/Minor module, Category, or Detail — not just notes. |
| `relation.js` graph view | Obsidian **graph view** | Reused as the render engine for Relation "Connector", Story "Narrator"'s graph board, and the Map/Timeline/TimeMap graphs — one graph engine, several data overlays. |
| Module detail (`+`) / module UI (`:`) specifiers | Obsidian **file properties panel** | A docked inspector panel in `#main-area` for editing a module's extra detail spec and its UI presentation spec. |
| `markdown.js` / `mdeditor.js` | Obsidian **markdown editor** | Reused as-is for Doc "Drafter" and for Book "Author" chapter editing — no new editor is built. |
| Artisan module | VS Code **snippet/template library** | Becomes the home for the **old fixed modules**. Director (novel), Navigator (world), Hero (game), and Writer (write) are converted into module *templates* inside Artisan instead of remaining standalone top-level modules. Creating a new Major module via Category "Classifier" can start from one of these templates, pre-filled from the old schema. Scribe and Sage are **not** part of this conversion — see Section C. |

### A.1 — Hub panel anatomy

```
#left-panel
├─ ▾ Nexus nest        (Major/Minor module tree — drag-reorder Majors,
│                        Minors locked under their parent)
├─ ▸ Sage Hut            (collapsed — expands into 4 analytics tabs)
└─ ▸ Import Dock         (collapsed — Obsidian-vault-style folder import)
```

All three are root-level accordion sections in the same panel — not
separate top-level views, not separate nav-rail destinations. Matches VS
Code's sidebar where Explorer/Search/Source Control/Debug stack as
collapsible sections in one panel.

---

## Section B — Phased breakdown

Each phase lists: **goal**, **panel(s)** it lives in, the **reference
pattern** it follows, **reused components** (per `.claude/skills/
dracondex-module-style/STYLE.md`), and **what's new**.

### Phase 1 — Dynamic module toolbar
- **Goal:** replace `#nav-sidebar`'s fixed `.nexus-only` buttons with a
  "create Major module" tool + auto-populated icon strip for user-created
  Major modules.
- **Panel:** `#nav-sidebar`.
- **Reference:** VS Code Activity Bar (pinnable entries) / Obsidian ribbon.
- **Reuses:** `nav-btn` button styling, `I.*` icon dict, `toast()`.
- **New:** dynamic icon population logic (today's icons are static markup
  in `index.html`); default-pinned set for Scribe/Sage/Import Dock/Artisan.

### Phase 2 — Hub panel shell
- **Goal:** the three-section accordion (Nexus nest / Sage Hut / Import
  Dock) in `#left-panel`, independently collapsible, matching VS Code's
  sidebar-panel behavior (one expanded by default — Nexus nest).
- **Panel:** `#left-panel` → `#left-panel-inner`.
- **Reference:** VS Code sidebar panel stack.
- **Reuses:** `.ph` sidebar header pattern, `--r`/`--rs` radii, `--border`.
- **New:** accordion/collapse mechanic (no precedent in current codebase).

### Phase 3 — Nexus nest section
- **Goal:** the Major/Minor module tree itself — Major modules (`-`)
  freely reorderable via drag, Minor modules (`=`) nested under their
  Major and locked (cannot move across Majors).
- **Panel:** `#left-panel-inner`, inside the Nexus nest accordion section.
- **Reference:** Obsidian file-tree explorer (nested, draggable folders).
- **Reuses:** `.li` list-row shape, `.dot` color indicator, `x()` escaping.
- **New:** drag-reorder for Major modules; enforced one-level nesting lock
  for Minors (no existing tree component in the app does this).

### Phase 4 — Module detail (`+`) & module UI (`:`) inspector
- **Goal:** editable panel for a module's extra detail spec (`+`) and its
  requested UI presentation (`:`).
- **Panel:** docked in `#main-area`.
- **Reference:** Obsidian's file-properties panel.
- **Reuses:** `.fg` form-group shapes, `openModal()` conventions for the
  editing form, `btn-p`/`btn-s`.
- **New:** the property schema itself (detail spec + UI spec are new
  concepts, not present in any current module).

### Phase 5 — Category "Classifier"
- **Goal:** category creation flow — pick a template as the module's core,
  then one data type per category: `Object` (default, Attribute-from-
  template), `Element` (adds Levelable/Condition toggles), `Character`
  (adds one custom Attribute unique to that Character).
- **Panel:** modal, opened from Nexus nest section.
- **Reference:** VS Code's "new file from template" flow.
- **Reuses:** `openModal()` shape, `.mfoot` footer, existing Attribute
  template logic in `src/db/director.js` (categories already have this
  concept today — Object/Element/Character generalizes it).
- **New:** the three-way type picker and its per-type toggle set.

### Phase 6 — Folder "Collector" / Project "Manager" / Detail "Inspector"
- **Goal:** three lightweight organizational module types — Folder groups
  data, Project also groups but can be opened to browse contents, Detail
  is a small note field.
- **Panel:** tree rows in Nexus nest section; Project opens into
  `#main-area`.
- **Reference:** Obsidian folder vs. note distinction.
- **Reuses:** `.li` list-row, `.empty` empty-state shape, existing project
  browsing pattern from `director.js`.
- **New:** Folder as a pure organizer with no openable content (today
  every list item leads somewhere).

### Phase 7 — Map "Locator"
- **Goal:** a graph/canvas area with a background grid for gauging
  distance; `Area` items placed by x,y coordinate.
- **Panel:** `#main-area` (full canvas view).
- **Reference:** Obsidian canvas plugin-style free-form board.
- **Reuses:** existing `map.js` canvas rendering as the base.
- **New:** grid-pattern background overlay for distance gauging (not in
  current `map.js`).

### Phase 8 — Timeline "Chronicler"
- **Goal:** a straight-line graph for time-mapping; `Event` nodes overlaid
  on the line, storing date (d/m/y) and time (h:min).
- **Panel:** `#main-area`.
- **Reference:** VS Code's minimap / git timeline view (linear, scrubbable).
- **Reuses:** existing `timeline.js` as the base renderer.
- **New:** generalizing today's timeline (currently tied to Navigator) into
  a standalone module type usable by any Major module.

### Phase 9 — TimeMap "Wanderer"
- **Goal:** combines Map + Timeline into a dual graph; `MapEvent` items
  reference one existing Map and one Timeline, then place a Link item on
  the Map, choosing which Event sets its displayed time.
- **Panel:** `#main-area`, split view (map pane + timeline pane).
- **Reference:** VS Code split editor (two synced panes).
- **Reuses:** Phase 7 (Locator) and Phase 8 (Chronicler) renderers, composed.
- **New:** the sync/link layer between the two panes (`MapEvent`).

### Phase 10 — Story "Narrator"
- **Goal:** a story-route system on a graph board; `Dialogue` nodes placed
  on the board hold stored Conversation content, building branching routes.
- **Panel:** `#main-area`, full graph board.
- **Reference:** Obsidian Canvas (node-and-edge board) + graph view engine.
- **Reuses:** `relation.js` graph engine as the render base.
- **New:** Dialogue node type with embedded Conversation editor
  (conceptually close to Scribe's chat bubbles — see Section C).

### Phase 11 — Book "Author"
- **Goal:** long-form novel content storage; `Chapter` splits content into
  sections.
- **Panel:** `#main-area`, document view with a chapter list in
  `#left-panel-inner` when a Book is open.
- **Reference:** Obsidian long-form note editing + VS Code file outline.
- **Reuses:** `markdown.js`/`mdeditor.js` directly; existing Writer
  module's Book→Chapter structure (`src/db/writer.js`) as the data model
  to carry over.
- **New:** none structurally — this is closest to an existing module
  (Writer), reframed as a module type rather than a fixed module.

### Phase 12 — Chat "Scribe" (new type, name conflict — see Section C)
- **Goal:** chat-style note page; one session (`note`) records messages as
  bubble text.
- **Panel:** `#main-area`.
- **Reference:** any chat UI (bubbles, timestamps, session list in sidebar).
- **Reuses:** `.li` list-row for session list, `toast()` for send feedback.
- **New:** the bubble-message renderer itself does not exist in the
  current codebase (existing `scribe.js` is a markdown/wikilink note
  editor, not a chat UI — this is the naming conflict flagged in Section C).

### Phase 13 — Doc "Drafter"
- **Goal:** a blank markdown page for general notes, `.md`-like.
- **Panel:** `#main-area`.
- **Reference:** Obsidian blank note.
- **Reuses:** `markdown.js`/`mdeditor.js` directly — this is functionally
  what the *existing* Scribe module already does today.
- **New:** none — likely the same component as current Scribe under a
  different name (see Section C).

### Phase 14 — Analys "Viewer" / Relation "Connector"
- **Goal:** two read-only display module types: Viewer shows the result of
  a filtered list; Connector shows a relation graph of a filtered list.
- **Panel:** `#main-area`.
- **Reference:** VS Code's Search results panel (Viewer) / Obsidian graph
  view scoped to a query (Connector).
- **Reuses:** existing `search.js` filtering logic; `relation.js` graph
  engine for Connector.
- **New:** binding a saved filter definition to a persistent module
  instance (today filters are transient, not saved as their own module).

### Phase 15 — Sage Hut section
- **Goal:** global analytics across all app data, expands into its 4
  existing tabs.
- **Panel:** `#left-panel-inner`, as a root accordion section (Phase 2) —
  not a separate nav-rail module tile.
- **Reference:** VS Code's Output/Problems panel (an always-available
  utility panel, not a "file").
- **Reuses:** existing `sage.js` tabs and rendering wholesale.
- **New:** relocating Sage's entry point from a nav-rail button into the
  hub panel accordion.

### Phase 16 — Import Dock section
- **Goal:** import from a folder Obsidian-Vault-style — images/documents
  imported and linked to lists in the nest.
- **Panel:** `#left-panel-inner`, root accordion section.
- **Reference:** Obsidian's vault attachment folder + drag-and-drop import.
- **Reuses:** existing DB import/export button pattern (`#btn-import-db`)
  as a starting point, `toast()`/`confirmBox()` for feedback.
- **New:** file-to-nest-item linking (today's import is whole-DB import,
  not per-file linking).

### Phase 17 — Artisan template migration
- **Goal:** Director (novel), Navigator (world), Hero (game), and Writer
  (write) stop being fixed top-level modules and become built-in templates
  inside Artisan's template tool, carrying over their schema and default
  attributes from `src/db/director.js`, `navigator.js`, `hero.js`,
  `writer.js`. A new Major module can be created from one of these
  templates via Category "Classifier" (Phase 5), pre-filled accordingly.
- **Panel:** Artisan's existing template picker UI (`#main-area`).
- **Reference:** VS Code's "New Project from Template" / Obsidian
  community templates.
- **Reuses:** all four modules' existing DB schema and attribute logic —
  no data model is thrown away, only its entry point changes.
- **New:** template registration wiring so these four appear alongside any
  user-authored Artisan templates, and the Classifier hookup that
  instantiates a Major/Minor module from a chosen template.

---

## Section C — Open questions (flagged, not silently resolved)

1. **`Scribe` naming collision.** Plan.md assigns "Scribe" to the new Chat
   module type (bubble notes, Phase 12) and "Drafter" to the blank
   markdown page (Phase 13). But the *existing* DraconDex module already
   named Scribe is markdown/wikilink notes — functionally closer to
   Drafter than to the new Chat concept. Needs a decision before
   implementation: rename the existing Scribe module, merge Drafter into
   it, or keep both under different names?
2. **Resolved by user feedback (this session):** Director/Navigator/
   Hero/Writer do *not* remain as coexisting fixed modules — they migrate
   into Artisan as templates (Phase 17).
3. **Still open:** do Scribe and Sage also fold into the new Major/Minor
   system as instantiable module types, or do they stay as their own
   permanently-pinned hub-panel/nav-rail entities (as drafted in Phases
   12/13/15 above)? This design assumes the latter (pinned, not
   instantiable) but that's an assumption, not a confirmed decision.
4. **Data migration.** How do existing DB rows for Director/Navigator/
   Hero/Writer map onto new Major/Minor instances created from their
   Artisan templates once a user actually creates one? Out of scope for
   this design pass — flagged for the implementation phase.

---

## Section D — Component / style inventory

Every phase above is scoped to reuse what already exists in
`.claude/skills/dracondex-module-style/STYLE.md` — no new design system:

- **Colors:** CSS custom properties only (`--bg --surface --raised --hover
  --border --t1 --t2 --t3 --accent --accentH --danger --success`); no
  hardcoded hex except the existing user-data color fallback.
- **Radii:** `--r` (8px) / `--rs` (4px) / `--rl` (12px).
- **Buttons:** `btn` + `btn-p`/`btn-s`/`btn-g`/`btn-d`, `btn-i` for
  icon-only, icons from `I.*`.
- **Text:** every user-visible string through `t('key')`, added to all 13
  locales.
- **Data:** all interpolation escaped with `x()`.
- **Feedback:** `toast()` / `confirmBox()` — never `alert()`/`confirm()`.
- **Shapes to copy:** `.ph` sidebar header, `.li` list row, `.empty`
  empty-state, `openModal()` + `.fg`/`.mfoot`, `.detail-head` with
  color-coded left border.

---

## Visual mockup

A static, non-functional HTML mockup accompanies this design (published as
a Claude Artifact), built with DraconDex's actual theme tokens pulled from
`style.css` (dark default + `daylight` theme) so it reads as native
DraconDex rather than a generic concept. It shows:

1. The hub panel with all three accordion sections (Nexus nest expanded
   showing the Major/Minor tree, Sage Hut and Import Dock collapsed) plus
   the dynamic module toolbar and a tabbed `#main-area`.
2. A Map "Locator" canvas with grid background and placed Area nodes.
3. The module detail/UI inspector panel (Obsidian properties-panel style).

The mockup is illustrative only — no click-through, no app wiring.

---

## Verification (of this design pass)

- Every Plan.md bullet (Major/Minor/detail/UI specifiers, Collector/
  Manager/Inspector/Classifier + Object/Element/Character, Locator/
  Chronicler/Wanderer/Narrator/Author/Scribe/Drafter/Viewer/Connector,
  Sage Hut, Import Dock) maps to exactly one phase above.
- The Artisan-template migration for Director/Navigator/Hero/Writer
  (user-directed addition) is captured as Phase 17.
- No automated tests apply — this is a documentation/design deliverable.
