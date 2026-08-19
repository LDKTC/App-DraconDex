## Part 1 — UI style changes: btn/hub polish
Files: `electron/css/{builder,components,inspector,layout,nav-hub,titlebar}.css`, `electron/src/renderer/builder.js`, `electron/src/renderer/core/state.js`, `electron/src/renderer/mod/sagehut.js`

- [x] Btn — `.bpane-head .bnav` (builder pane nav buttons) reset to `border-radius:0;padding:0`. Icon-only buttons (`.btn-i:not(.btn-d)`) no longer background-highlight on hover, only the icon's own color changes — six hover rules across `components.css`/`layout.css`/`inspector.css`/`nav-hub.css`/`titlebar.css` dropped their `background:var(--hover)` half while keeping `color:var(--t1)`. `.btn-d` deliberately kept its red hover fill (a destructive-action cue, not decorative chrome).
- [x] Forward/Backward — builder pane nav buttons swapped from `◀`/`▶` glyphs to real one-color SVG icons (new `I.chevronLeft`/`I.chevronRight` in `core/state.js`), wired in `builderPaneHeadHtml` (`builder.js`).
- [x] Sage Hut header — added an invisible `visibility:hidden` spacer button next to the subtitle (`buildSageHutHtml`, `mod/sagehut.js`) so its header reserves the same height as every other page header that has real action buttons.
- [x] Hub tree guide-line — **bug found and fixed**: each depth's dotted guide line was drawn from its OWN chevron center instead of its ancestor's, so it looked one step out of alignment with the arrow it should track. Fixed by shifting every `.li.indentN::after` `background-position` back one depth step (30.5/46.5/62.5/78.5/94.5px → 14.5/30.5/46.5/62.5/78.5px, `nav-hub.css`).
- [x] Hub list rows — `border-radius:0`, scoped to `#hub-body .li` only (`.li` is a shared row primitive used 30+ places app-wide, so the reset stays local to the Nest tree/Sage Hut/Import Dock accordion).

**Part 1 complete** — all 5 items shipped, `v.4.7.3`.

## Part 2 — Builder tab system rework
Files: `electron/src/renderer/builder.js`, `electron/src/renderer/hub/menus.js`, `electron/src/renderer/i18n.js`

- [x] Tab system — `builderNavigate`'s normal-open path now REPLACES the pane's current active tab in place instead of always pushing a new one (mirrors the Sage Hut branch's own pre-existing replace-in-place trick). A new escape hatch, `openModuleInNewTab` (`hub/menus.js`), pushes the target's key into `pane.tabs` itself first so `builderNavigate` takes its "already includes" branch and switches to it instead of replacing — wired as a new "Open in new tab" context-menu item alongside the existing "Open in new window"/"Open in new pane".
- [x] Split/close-pane buttons — removed from the always-visible pane header row, moved into a right-click context menu (`openBuilderPaneContextMenu`/`buildBuilderPaneContextMenuHtml`, new in `builder.js`) reusing the Nest tree's existing popup plumbing (`hub/popups.js`'s `closeAllPopups`/`positionPopupNear`/`positionSubmenuNear`/`ctxAnchor`) instead of a second one. "Separate pane" opens a hover submenu (`openBuilderSeparateSubmenu`) with the same ◫/⬓ split-direction choices the inline buttons used to offer, plus "Close pane" when the layout is actually split. Bound once in `ensureNodeElement` (survives re-renders, same lifecycle as its neighboring `ResizeObserver`).
- [x] Empty tab strip — **bug found and fixed**: closing a pane's last tab called a bare `renderNexusHome()`, which left `S.activeModuleNode`/`filePreview`/`sageHut`/`activeItemNode` stale — the pane body kept showing the just-closed page's content even with an empty tab strip. Fixed by routing through `builderOpenPage(null)` instead, which clears all of those globals before rendering.
- i18n: new context-menu item labels (`openInNewTab`, `separatePane`, `closePane`, etc.) added across all 18 locales.

**Part 2 complete** — all 3 items shipped, `v.4.7.4`.

## Part 3 — Setting window real-time state
Files: `electron/src/renderer/core/{setting-window,settings,theme}.js`

- [x] Selected-state real-time — **bug found and fixed**: `setUiSetting`/`deleteCustomTheme`/`duplicateTheme` all still guarded their refresh with `if(q('#prefs-panel'))` — checking for the OLD Preferences floating panel the Setting window had already replaced, so the guard silently skipped the refresh every time since `#prefs-panel` no longer exists. A checkmark/selected-state change only became visible after manually closing and reopening the window. Replaced all three call sites with an unconditional `renderSettingWindow()` (which already no-ops safely when the window isn't open).
- [x] Language live-update — the Setting window's own title (baked in once via `openFloatingPanel`'s `data-no-i18n`, exempt from the auto-translate DOM walk) now re-renders explicitly inside `renderSettingWindow()` too, so switching language updates it immediately instead of only on next open.

**Part 3 complete** — both items shipped, `v.4.7.5`.

**`Plan.md` rollout complete** — 3 parts this cycle (procress 1), reconstructed from `git log`/`git show` on each part's own checkpoint commit (`b76a019`/`e7cc1bf`/`b316cca`) since this session didn't do the implementation itself. No open follow-ups identified.
