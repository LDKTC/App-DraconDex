---
name: procress-writing
description: Once every checklist item in Plan.md is ticked [x], write a detailed roundup of what was actually built into procress.md (per-part write-up — files/functions touched, bugs found and fixed with root cause, deliberate simplifications, how it was verified) and reset Plan.md's checklist body back to an empty template, ready for the next plan. If anything in Plan.md is still unchecked, does nothing to either file — only reports which items remain. Use when the user wants to close out a finished plan ("ทำ procress.md", "เคลียร์ plan", "log the finished plan", "sync procress with what's done", "clear Plan.md"), or says they want to run/execute/close out "the plan I wrote down".
---

# procress-writing — log a finished Plan.md rollout into procress.md, then reset Plan.md

`Plan.md` is ephemeral and cycle-scoped: the user writes a checklist up
front, ticks items off as they're built, and it gets wiped clean once
everything's done. `procress.md` is permanent and append-only across the
project's whole lifetime — it never gets truncated, only added to. This
skill is the one that writes that permanent record and performs the wipe.
It has no persisted state of its own — everything is re-derived fresh from
`Plan.md`'s current content and git history each run, same rationale as
`.claude/skills/version-update/SKILL.md` (which reads these two files as a
finished/in-progress signal but never writes them — this skill is the one
that actually produces the `**Part N complete**` line version-update looks
for).

## Run

1. **Read `Plan.md`.** Split it into:
   - **Header** = every line before the first `-----` delimiter. Standing
     Thai instructions the user wrote to themselves/future Claude — never
     edit this block, no matter how its exact wording drifts over time.
   - **Body** = everything strictly between the first and last `-----`
     line.

2. **Parse the body**:
   - A **part boundary** is a body line with zero leading whitespace,
     non-blank, not starting with `-`, and not a `-----` line itself (e.g.
     `part 1`, or `part 2 เพิ่มfeature`). It's plain text, never a `##`
     heading.
   - A **checklist item** is any line matching `^\s*-\s*\[([ xX])\]\s*(.*)$`,
     at any indentation depth (real files nest 2-3 levels).
   - **Ignore** plain `-`-prefixed lines with no bracket at all — the file
     freely mixes in prose sub-notes (e.g. `-click บน Nexus Hub -> ...`)
     among checklist items; these never count toward completion either way.

3. **Completion check** — see the decision table below. Only continue past
   this step when every checklist line in the body is `[x]`/`[X]` and at
   least one checklist line exists. Otherwise stop here.

4. **Gather implementation detail** (only once you know the plan is fully
   finished):
   - **Session memory first** — if this conversation is the one that did
     the implementation work, use what you already know directly. This is
     the common case; don't go spelunking through git if you already know
     what was built.
   - **Git fallback**, for a fresh session or when memory is insufficient —
     find an anchor commit to diff from, in this order:
     1. `git log --grep="[Pp]lan clear" -i -1 --format=%H` (this repo's own
        precedent: commit `1c77b39 "Plan clear"`).
     2. If no such commit: walk `git log --oneline -- Plan.md` newest-first
        and `git show <sha>:Plan.md` each one, looking for the most recent
        revision where the checklist was empty/near-empty — a structural
        reset point that might not say "Plan clear" in its message.
     3. Last resort: the commit that first added the file
        (`git log --diff-filter=A --oneline -- Plan.md | tail -1`).
   - Gather `git log --oneline <anchor>..HEAD` and `git diff
     <anchor>..HEAD -- . ':!Plan.md' ':!procress.md'`, plus always include
     uncommitted state (`git status --porcelain`, `git diff`, `git diff
     --staged`) — work may not be committed yet.
   - Read the actual diffs — function names, file paths, what a bug's real
     root cause was. Never synthesize detail from commit subjects alone.
   - **Scope guard**: if the gathered diff clearly spans unrelated work
     too, only write up the portions that map onto this Plan.md's own
     Part-N items. Mention the out-of-scope changes to the user, don't fold
     them into the file.

5. **Write `procress.md`.** If it doesn't exist yet, create it first with:
   ```
   # Process — Plan.md rollout roadmap

   Roadmap breaking `Plan.md` into ordered, one-topic-at-a-time phases.
   Status per item is tracked here; the matching checkbox in `Plan.md` is
   ticked once a phase is verified working in the running app.
   ```
   Then append one `## Part N — <title>` section per part found in
   `Plan.md` (title = the free text after `part N` if present, else
   derived from the part's first-level checklist label), each with a prose
   overview plus per-item bullets carrying the real detail from step 4:
   what was built, exact files/functions touched, bugs found and fixed
   with root cause, deliberate simplifications, and how it was verified
   (name `run-dracondex`/`app-run-tester` when that's genuinely how it was
   confirmed). Close each part's section with a `**Part N complete**`
   line. Once every part in this cycle has been written, also close with a
   final `` **`Plan.md` rollout complete** `` line — matching the existing
   file's own convention exactly.

6. **Clear `Plan.md`.** Find the first and last `-----` line in the file;
   replace everything strictly between them (keep the delimiters, never
   touch the header above the first one) with:
   ```
   part 1
   - [ ] 
   ```

7. **Report** what was written to `procress.md` and confirm `Plan.md` was
   cleared. Do not commit — leave that to the user.

## Decision table — is this run a no-op?

| State found in `Plan.md`'s body | Action |
|---|---|
| Any `- [ ]` present | Do nothing to either file; report which items/parts remain unchecked |
| Zero checkbox lines at all (only prose bullets, or truly empty) | Do nothing; ask the user — don't declare "vacuously done" over an empty set |
| Body already equals the empty skeleton | Report "nothing to do" |
| Inconsistent nesting (parent checked, a child not, or vice versa) | Surface to the user, don't auto-resolve which one is truth |
| Every checkbox line is `[x]`/`[X]`, at least one exists | Proceed: write `procress.md`, then clear `Plan.md` |

## Gotchas

- Only bracketed `- [ ]`/`- [x]` lines count as checklist items for the
  completion check — plain `-`-prefixed prose sub-bullets never need
  brackets and never count either way.
- `part N` lines are bare plain text, not markdown headings — don't look
  for `##`.
- Zero checkbox lines anywhere in the body means ask the user, not
  "nothing to check off so it's done."
- Never edit the header block above the first `-----`, even though its
  exact wording has drifted before (the one historical clear commit dropped
  a header line, but that was an incidental manual edit riding along in
  the same commit — not license for this skill to touch it).
- All-or-nothing gate: no partial, mid-plan writes to `procress.md`. If
  anything in `Plan.md` is unchecked, touch neither file.
- Git-anchor search order for the fallback path: "plan clear" commit
  message first, then a structural empty-checklist scan, then the commit
  that first added `Plan.md`. Always exclude `Plan.md`/`procress.md`
  themselves from the gathered implementation diff — they aren't the
  implementation.
- Prefer live session memory over git spelunking — only fall back to git
  when this session didn't do the work or doesn't remember enough of it.
- No helper script or marker file, by design — this is stateless; every
  run re-derives everything fresh from `Plan.md`'s current content and git,
  same as `version-update`'s own rationale for having none.
- Don't auto-invoke `version-update` — finishing a plan is a natural moment
  to bump the version, but that's the user's call, not an automatic
  chained action.
- `procress.md` is append-only for the life of the project; `Plan.md` is
  the only file this skill ever wipes.
