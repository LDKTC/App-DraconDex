---
name: version-update
description: Bump package.json's (and package-lock.json's mirrored) "version" field per DraconDex's own x.y.z-n scheme — x for a UI/UX or architecture overhaul, y for a whole module/major feature added or removed, z for everything else (bug fixes, small tweaks — the default), and a -n suffix while that bump is still mid-flight across several commits (dropped once finished). Recognizes "Pre" commits (plan/design write-ups in Plan.md/procress.md with no app code touched yet) and skips bumping entirely for those. Never commits, never touches any other field. Use when asked to "bump version", "update the version", "release this as vX.Y.Z", "อัปเดตเวอร์ชัน", "เพิ่มเลขเวอร์ชัน", "ขึ้นเวอร์ชันใหม่", or after a commit/set of edits that should carry a version change.
---

# version-update — bump package.json's version per DraconDex's x.y.z-n scheme

There is no marker file and no cached state for this skill. The current
`"version"` field in `package.json` is the only state that matters, and it's
always read fresh. Everything else — what changed, how big, whether it's
finished — is re-derived from git each run. The actual write happens via
`npm version`, never a hand-edited JSON patch, and never a commit — that
still holds even now that `.claude/skills/procress-writing/SKILL.md` calls
this skill automatically as step 7 of its own close-out flow. This skill
bumps the field and stops; the caller (`procress-writing`) is the one that
stages, commits, and pushes afterward.

## The scheme

| Segment | Bumps when... | Real example from this repo |
|---|---|---|
| `x` (major) | UI/UX or architecture overhaul | `2.7.3 → 3.0.0` (`5d5d40e`) — the story-info "collector" rebuilt into the IDE-shell Scribe vault; submodules promoted into major modules, old ones moved to template |
| `y` (minor) | a whole new module added, or an existing major module/function added or removed | adding a new fixed module (own renderer + db file + IPC + preload wiring) |
| `z` (patch) | everything else — bug fixes, small tweaks. **This is the default when scope is genuinely ambiguous.** | `3.7.1 → 3.7.2 → 3.7.3` |
| `-n` | this cycle's bump (x, y, or z) is still mid-flight across multiple commits, not finished yet | not yet used in this repo — this skill introduces it |
| **"Pre"** | the commit only updates planning/write-up docs (`Plan.md`, `procress.md`) — no app code touched at all | already informal in this repo's history: `pre v.3.7.2`, `pre v.3.7.3` commits preceding the real bump |

"Pre" is not a value of x/y/z/-n — it's a separate gate that applies
*before* any of the above, because nothing in the running app changed.

## Run

1. **Read the current version** straight from `package.json`'s `"version"`
   field. If it doesn't parse as `X.Y.Z` or `X.Y.Z-N`, stop and ask the user
   what it should be — don't guess.

2. **Find the anchor commit** — the commit that introduced the *current*
   `X.Y.Z` base (ignoring any existing `-N` suffix). Use a content pickaxe
   on the version line itself, not a plain path filter — `git log --
   package.json` overcounts badly in this repo (many commits touch
   `package.json` for unrelated reasons — deps, scripts — without touching
   the version line):

   ```bash
   git log -G'"version":\s*"' -- package.json
   ```

   Walk back from HEAD to the first commit in that log whose new value's
   `X.Y.Z` (ignoring suffix) equals the current `X.Y.Z`. That's the start of
   "this cycle," even if there have been several `-N` checkpoints since.

3. **Gather the real diff since that anchor**: `git log --oneline
   <anchor>..HEAD`, `git diff <anchor>..HEAD`, plus any uncommitted work
   (`git status --porcelain`, `git diff`, `git diff --staged`). Read the
   actual diff — don't classify from commit subjects alone, a message can
   undersell what changed.

4. **Pre gate**: does that diff touch *only* planning/write-up files
   (`Plan.md`, `procress.md`, and similarly-purposed planning docs) with
   zero changes to actual app source (`src/`, `main.js`, `preload.js`,
   `database.js`, `style.css`, `index.html`, `flutter_app/`, etc.)? If so:
   **stop here.** Report that this is a "Pre" commit — nothing in the app
   changed, so `package.json` stays untouched. You may mention, purely as
   information for the user's own commit message, what version this plan
   looks like it's preparing for (mirroring the existing `pre v.X.Y.Z`
   convention) — but never write that to `package.json`.

5. If app source *is* touched, check `Plan.md` (checkbox list, "Part N"
   sections) and `procress.md` (prose log, ending "Part N complete" when
   done) for a finished/in-progress signal if they're relevant to this
   diff — an all-checked Part with a matching "complete" line is strong
   FINISHED evidence; a partially-checked Part is strong IN-PROGRESS
   evidence. Treat this as a hint, not an oracle — reconcile against the
   actual diff, a repo change doesn't have to route through these files.

6. **Classify scope**: MAJOR / MINOR / PATCH — see the decision table
   below. Default to PATCH when genuinely unsure.

7. **Classify finished vs in-progress.** If it's not obvious from the diff
   or the Plan.md/procress.md signal, ask the user directly rather than
   guess — this decision changes what ships in the version string.

8. **Escalation check**: if the current version already has a `-N` suffix
   (an in-flight series), compare the *whole* accumulated diff since the
   anchor (step 3) against the segment level already reflected in `X.Y.Z`.
   If it now looks like it deserves a bigger segment than what's already
   there, **stop and ask the user** how to reclassify — concretely, show
   them the accumulated diff and ask "still `z`-level, or has this grown
   into `y`/`x`?" Never silently re-decide mid-series.

9. **Apply the transition table** below to compute the exact target
   version string.

10. **Write it**:

    ```bash
    npm version <target> --no-git-tag-version
    ```

    `--no-git-tag-version` is mandatory on every invocation — it updates
    `package.json`'s `version` field and both mirrored `"version"` fields in
    `package-lock.json` (top-level and `packages[""]`) in one step, matching
    this repo's own historical convention, without creating a commit or tag.

11. **Report**: old → new version, one-line rationale for the
    classification, and note that `build.nsis.artifactName` (installer
    filename) and `scripts/finish-portable.mjs` (portable build's output
    folder name) both read this field — so the next build's artifact names
    will change too. Do not commit. If useful, suggest (don't run) a commit
    message matching this repo's own style: `v.X.Y.Z` or `v.X.Y.Z-N`.

## Decision table — scope

| Signal in the diff | Classification |
|---|---|
| Diff touches only `Plan.md`/`procress.md`, no app source | **Pre** — no bump at all, see step 4 |
| Restructures the module system, nav rail, or overall UI/UX architecture | **Major** — e.g. `2.7.3 → 3.0.0`, the collector→IDE-shell rework |
| Adds or removes a whole module (own renderer + db + IPC + preload) or a major existing function | **Minor** |
| Anything else — bug fix, CSS tweak, i18n key fix, small refactor, doc sync | **Patch** — the default when unsure |

## Decision table — transitions

| Current state | This change is... | New version |
|---|---|---|
| no `-N` suffix | IN-PROGRESS | bump the classified segment, reset lower segments to 0, append `-1` |
| existing `-N` suffix | IN-PROGRESS | keep `X.Y.Z`, increment `N` |
| existing `-N` suffix | FINISHED | drop `-N`, keep `X.Y.Z` as-is (already bumped when the series started) |
| no `-N` suffix | FINISHED | bump the classified segment, reset lower segments to 0, no suffix |

Worked examples:
- `3.7.3`, a commit that only edits `Plan.md`/`procress.md` → **Pre**,
  version stays `3.7.3`, no `npm version` call.
- `3.7.3`, a self-contained bug fix, finished in one commit → `3.7.4`.
- `3.7.3`, starting a multi-commit fix, not done yet → `3.7.4-1`.
- `3.7.4-1`, still not done → `3.7.4-2`.
- `3.7.4-2`, this commit finishes it → `3.7.4`.
- `3.7.3`, a new module added in one commit, finished → `3.8.0`.
- `3.8.0`, a UI/architecture overhaul, finished → `4.0.0`.

## Gotchas

- `git log -- package.json` overcounts — always pickaxe the version line
  itself (`-G'"version":\s*"'`), not a plain path filter. A meaningful
  fraction of commits touch `package.json` for deps/scripts without
  touching the version line, and those aren't cycle boundaries.
- No marker file, by design — unlike `write-docs` (which needs one to
  survive rebases/squashes), there's no persisted belief to protect here.
  The version field itself is the only state, always read fresh; nothing
  to seed on a "first run."
- `package-lock.json`'s two mirrored version fields get updated too, via
  `npm version` — not by hand-editing JSON. This matches 100% of this
  repo's historical version-bump commits; it's intentionally broader than
  "package.json only," not an oversight.
- `--no-git-tag-version` is mandatory on every `npm version` call — this
  skill never commits or tags.
- A plan-only diff is **Pre**, not Patch — never fold "only touched
  Plan.md/procress.md" into the PATCH default just because PATCH is the
  fallback for ambiguous *app* changes. Pre means skip entirely.
- Mixed/dirty diffs spanning clearly unrelated systems: surface that to the
  user and ask what should count toward this bump, rather than silently
  picking the loudest change.
- Malformed/unparseable current version field, or nothing changed since the
  anchor: stop and say so — don't guess, don't bump on an empty diff.
- `Plan.md`/`procress.md` are a hint for finished/in-progress, not ground
  truth — a change might not route through them at all.
