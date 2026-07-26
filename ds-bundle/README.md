# DraconDex — design tokens (tokens-only export)

This bundle was produced by `/design-sync` in **tokens-only** mode. DraconDex is a
vanilla-JS Electron app with no React component library, so there are **no
components to sync** — only the design-token layer was extracted from
[`css/tokens.css`](../css/tokens.css) and [`css/themes.css`](../css/themes.css)
(both were part of the single `style.css` when this bundle was produced).

## Contents
- `styles.css` — entry stylesheet; `@import`s the tokens.
- `tokens/tokens.css` — the CSS custom properties, organized by theme.
- `tokens/tokens.json` — the same tokens in structured form.

## Themes
Three themes, selected via `body[data-theme="…"]`: `midnight` (default), `daylight`,
`moonlight`. Color roles are theme-scoped; radius/layout/motion tokens are global.

## Token roles
| Role | var | Meaning |
|------|-----|---------|
| bg / surface / raised / hover | `--bg` `--surface` `--raised` `--hover` | Surface elevation ladder |
| border | `--border` | Hairline borders |
| text-1/2/3 | `--t1` `--t2` `--t3` | Primary → tertiary text |
| accent / accent-hover | `--accent` `--accentH` | Brand / interactive |
| danger / success | `--danger` `--success` | Status |
| radius sm/md/lg | `--rs` `--r` `--rl` | 4 / 8 / 12px |
| nav / sidebar | `--nav` `--sidebar` | 56 / 264px |
| ease | `--ease` | `.15s ease` |

Fonts: sans = Segoe UI stack; mono = `'Courier New', monospace`. Base size 14px.

> Elevation shadows in the app are ad-hoc (not CSS variables); a few common
> patterns are catalogued under `elevation` in `tokens.json` for reference only.
