# Process 2 — Nexus Hub structure rework (Kind Browser into Hub, nav-rail highlight), legacy module system deleted

## Part 1 — Nexus Hub structure
Files: `electron/src/renderer/hub/{kinds,sections,open}.js`, `electron/src/renderer/core/{nexus,state,views}.js`, `electron/src/renderer/{builder,dragon,wyvern}.js`, `electron/css/nav-hub.css`, i18n

- [x] Nav-bar active highlight changed to a background-removal, side-bar-only
  style — the active rail button no longer gets a filled background, only a
  highlight bar.
  - [x] The highlight bar now tracks whichever Hub panel is actually
    displayed (e.g. opening Nexus Nest highlights the Nexus Nest button on
    the nav rail) instead of the button that was last clicked.
  - [x] Highlight bar renders on the left side of the nav rail.
- [x] "เรียกดูตามประเภท" (Kind Browser) button reworked: pressing it now
  swaps the Hub panel's own list rendering into kind-browser mode instead of
  changing what's shown on the Builder pane.
  - [x] Opening a module from inside the Kind Browser no longer flips the
    Hub back to the Nexus Nest tree — it stays in kind-browser mode.
  - [x] Renamed "เรียกดูตามประเภท" → "ลิสโมดูล" for brevity.
- [x] Nav-rail buttons no longer change their active/highlighted state just
  because a *different* rail button was pressed — the highlight now only
  moves when an actual module is opened.

**Part 1 complete** — shipped `v.4.9.9` (reconstructed from commit
`0c94e1b`'s diff/message; prior session).

## Part 2 — Legacy module structure (import-db views removed, Nexus conversion, physical deletion)

The legacy pre-v3 fixed modules (Director/Navigator/Hero/Writer) are fully
superseded by the v3 "Nexus module tree." This part retired them for good —
first the UI entry points and conversion tooling, then (after a deliberate
"build first, delete later" pause across sessions) the ~5,600-line physical
deletion of the renderer/db/IPC code itself.

- [x] Import DB views and the whole legacy builder system removed from the
  app and made permanently unreachable. The legacy tables and
  `migrate_v3.js` stay untouched — they're what makes conversion possible
  at all, indefinitely.
  - [x] Module-conversion matching: legacy project/module/submodule structures
    map onto the existing v3 Nexus Nest module kinds during conversion.
  - [x] **Physical deletion** (the deferred half, completed later in the
    same overall cycle): `director.js`, `modals.js` (Director's own modals),
    `relation.js` (Director-only relation graph), the whole `navigator/`
    (9 files) and `hero/` (6 files) folders, and `writer.js` deleted from
    the renderer; `src/db/{director,navigator,hero,writer,relation}.js`
    deleted from the data layer; `electron/database.js`'s requires/spreads
    for all four trimmed; `electron/main.js`'s IPC handler blocks for
    `folder:`/`project:`/`category:`/`template:`/`object:`/`search:all`/
    `world:`/`game:`/`write:`/`relation:` removed (~228 handlers,
    495→268 total); `electron/preload.js`'s matching `api.*` namespaces
    removed, including the now-dead `importDbMode` readonly-IPC guard
    machinery. `electron/index.html` lost the `<script>` tags for the
    deleted renderer files, ~124 lines of hidden `.director-only`/
    `.navigator-only`/`.hero-only`/`.writer-only`/`.project-only` nav-rail
    button markup, and the `legacy-views.css`/`legacy-tables.css` links.
    Ten "core" renderer files (`router.js`, `nav.js`, `views.js`,
    `shortcuts.js`, `boot.js`, `chrome.js`, `pickers.js`, `state.js`,
    `nexus.js`, `wyvern.js`) that actively branched into the legacy
    systems were surgically edited rather than deleted — including
    `router.js`'s `openEntityByKey()`, rewritten so a wikilink pointing at
    un-migrated legacy data now toasts and opens the conversion-preview
    modal instead of routing into a deleted renderer.
    Several look-alike files turned out to be **dual-use** with the still-
    live v3 system and were split rather than deleted outright:
    `timeline.js` (Director-only event functions removed, the shared
    Chronicler/Director timeline graph engine + `dateInputsHTML`/
    `getDateFromInputs` relocated in from doomed `modals.js` kept),
    `map.js` (Director-only map view removed, Locator's shared area-card
    rendering kept), `hashtag.js` (Director-only project-tag junction
    functions removed from both the renderer and `src/db/hashtag.js`;
    generic `getHashtags`/`createHashtag`/etc. and the modal functions
    relocated in from `modals.js` kept), `search.js` (legacy no-vault
    search path removed). A genuine regression was caught and fixed along
    the way: `iconpicker.js`'s still-live module icon/symbol picker
    depended on `getSymbolCollection`, wrongly assumed Navigator-exclusive
    — recovered into `src/db/color.js` and re-wired as `color:getSymbolCollection`.
    A CSS regression (three deleted-but-actually-shared rule blocks, most
    impactfully the app-wide `.empty .ei` empty-state icon class) was
    caught by a warning-count diff against baseline and fixed by extracting
    the genuinely shared ~40 rules into a new `electron/css/shared-carryover.css`.
    Verified: `dracondex-module-style`/`dracondex-file-arch` checkers at
    0 errors (39/7 warnings, both at or better than baseline), full
    `node --test` suite (29/29), and live via `web-driver.mjs` — boot with
    no dead nav slots, Settings→Database "Convert legacy data" still finds
    and converts seeded legacy rows, a wikilink to un-migrated data
    toasts+opens the preview modal instead of crashing.
- [x] On first launch after this update, a user with existing Legacy-module
  data is prompted via popup: export to `.ddx` for later import/convert, or
  auto-convert immediately.
  - [x] Choosing auto-convert shows a two-sided comparison list of what each
    legacy project/module becomes in the Nexus Nest.
    - [x] The same comparison-list UI is reused by the app's Import DB
      system.

**Part 2 complete** — the deferred physical-deletion half was built,
verified, and checkpointed in this session (`v.4.10.0`, bundled together
with Process 3 Part 1's terminology rename in the same commit/version bump
since both were finished back-to-back before the next checkpoint). The
earlier UI/conversion-tooling half of this part was prior-session.

**`Plan.md` rollout complete** — 2 parts this cycle (Process 2). Part 1
reconstructed from its own checkpoint commit (prior session); Part 2's
conversion tooling likewise prior-session, its physical-deletion half
built and verified in this conversation.
