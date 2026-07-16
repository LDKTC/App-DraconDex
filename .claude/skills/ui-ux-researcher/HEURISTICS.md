# Usability checklist for DraconDex

Adapted from Nielsen's 10 usability heuristics, with a DraconDex-specific
angle on each one. Use this as a scoring rubric during Step 4 of the
`ui-ux-researcher` skill — not every item applies to every flow, skip what
doesn't.

## 1. Visibility of system status
- Does an autosave (mdeditor.js debounce, chapter editor) show its state
  ("…" / "saved") clearly, or does the user wonder if their edit is lost?
- Do long operations (import merge, DB export) show progress, or does the
  UI look frozen?
- Toast placement/timing — does it appear near the action that caused it, or
  somewhere the user isn't looking?

## 2. Match between system and the real world
- Do labels match worldbuilding/novel-writing vocabulary the target user
  (a novelist) actually uses, or generic database terms ("category",
  "object", "attribute")?
- Do the 15 v3 module kinds have names/icons a new user can guess the
  purpose of without reading docs (`classifier`, `narrator`, `wanderer` are
  not self-explanatory in isolation)?

## 3. User control and freedom
- Is there an obvious way out of a modal/wizard step (cancel, back) at every
  point, especially mid-way through the Artisan wizard?
- Can a mistaken action be undone, or only prevented via a confirm dialog?

## 4. Consistency and standards
- Does this flow match the shapes in `dracondex-module-style/STYLE.md`
  (`.ph` header, `.li` row, empty state, modal, detail-head)? Inconsistency
  here is itself a usability cost, independent of whether `check.mjs` flags
  it as a style violation.
- Does similar data (e.g. "delete" across different entity types) behave the
  same way everywhere?

## 5. Error prevention
- Destructive actions (delete module/subtree, delete vault) — is the
  confirm specific ("delete 'X' and its 4 children?") or generic ("are you
  sure?")? Generic confirms get reflexively clicked through.
- Are there states the UI lets a user reach that have no good outcome (e.g.
  creating a `classifier` node without picking `cat_type`)?

## 6. Recognition rather than recall
- Does the user have to remember where something lives (which of the 15
  kinds, which legacy module) or can they find it by browsing/searching
  (quick switcher, explorer tree)?
- Are recently-used/pinned items surfaced, or does everything require
  navigating from the top every time?

## 7. Flexibility and efficiency of use
- Power-user paths: keyboard shortcuts (Ctrl+P, Ctrl+E, Ctrl+N, Ctrl+W,
  Ctrl+Tab), bulk actions, templates (Artisan). Do they exist for
  frequent/repetitive tasks, or is everything click-only?
- Does a first-time user get a *simpler* path than a power user, or is there
  only one path that's simple for neither (see progressive disclosure)?

## 8. Aesthetic and minimalist design
- Is there information on screen the current task doesn't need? Does the 15-
  kind picker present all 15 with equal visual weight regardless of how
  commonly each is used?

## 9. Help users recognize, diagnose, and recover from errors
- If an operation fails (import merge conflict, migration), does the toast
  say what happened and what to do, or just "error"?

## 10. Help and documentation
- Is there in-context guidance for a first-time user (the coach-mark
  `guide.js` first-run flow) for *new* complex features, or only for the
  original onboarding moment?

## DraconDex-specific angles (beyond classic Nielsen)

- **Discoverability of hidden power**: Director/Navigator/Hero/Writer are
  fully working but hidden from the nav rail, reachable only via Artisan or
  migration. Is that discoverable to a user who doesn't already know it
  exists, or does it read as "missing feature"?
- **Cognitive load of the module-kind system**: 15 kinds, unlimited nesting,
  per-node icon/color/tags/attributes/version history. Compare against how
  Notion or Obsidian's plugin ecosystem progressively reveals complexity
  rather than presenting it all at once.
- **i18n readability, not just parity**: a string existing in all 18 locales
  (checked by `check.mjs`) doesn't mean it *reads well* in that locale —
  literal machine-shaped translations can still be confusing even if
  technically present. Spot-check phrasing in Thai (the default) especially.
- **Theme accessibility**: with 30+ themes, does contrast hold up across
  families (Daylight/Moonlight/Midnight/Eclipse), or only the one the
  developer tests in? Screenshot at least one light and one dark theme for
  any finding about visual hierarchy.
- **Frameless-window conventions**: no OS chrome — are window drag regions,
  min/max/close, and focus states discoverable without OS affordances to
  lean on?

## Comparison-app cheat sheet

| Pattern in DraconDex | Look at how... |
|---|---|
| Module-kind picker (15 kinds) | Notion's "turn into" / slash-command type picker — grouped, searchable, most-used-first |
| Nest tree (nested modules, drag/reorder) | Obsidian's file explorer, Notion's sidebar page tree |
| Quick switcher (Ctrl+P) | Obsidian's / VS Code's command palette — ranking, recency, scope chips |
| Wikilinks/backlinks/graph | Obsidian's linking model directly — DraconDex's is a close analog |
| Artisan wizard (template → step-by-step config) | Notion's "use a template" gallery, typeform-style multi-step setup |
| World/character/timeline structure | World Anvil, Campfire, LegendKeeper — purpose-built competitors, not general note apps |
