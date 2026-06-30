# design-sync notes

## Repo shape
- **Not a React design-system repo.** DraconDex is an Electron desktop app written
  in vanilla JS (`renderer.js`, `src/renderer/*.js`). UI is built by string-
  templating HTML in JS; styled by one global `style.css` + inline SVG icons.
- No `dist/` of components, no `.d.ts`, no esbuild-able component exports, no
  Storybook. The converter (`package-build.mjs`) cannot run here.
- There is a parallel **Flutter port** under `flutter_app/` over the same SQLite
  schema — a possible future home for a real component-based DS.

## Decision (2026-07-01)
- User chose **tokens-only** extraction (see config `mode`). No components synced.
- Output written to `ds-bundle/` (tokens.css, tokens.json, styles.css, README.md).
- **Not uploaded** to claude.ai/design — a component-less bundle gives the design
  agent nothing to build with. Revisit if a real component library is built.

## If revisiting for a full sync
- The natural path is the **Flutter app** or a new React component library — not
  the Electron renderer. A real DS needs exported, individually-renderable
  components, which this codebase's string-template UI does not provide.
- Token source of truth: `style.css` `:root` + `body[data-theme="…"]` blocks.
