# Nexus Creation Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a first-time user opt into the Nexus coach-mark tour within the creation form rather than answer an unexplained intermediate confirmation.

**Architecture:** `welcomeCreateNexus()` will pass a first-run flag to `openNexusModal()`. The existing modal owns the localized checkbox and `createNexusSubmit()` reads its value before selecting the new Nexus and conditionally starts the existing guide. No IPC or database changes are required.

**Tech Stack:** Vanilla browser JavaScript, existing `t()` i18n dictionaries, Electron/Playwright driver, Node test runner.

## Global Constraints

- Use only theme tokens and existing modal/button classes.
- All new visible copy must be present in every locale.
- Preserve the existing normal new-Nexus path without a guide choice.

---

### Task 1: Add regression coverage for the first-run creation flow

**Files:**
- Create: `test/onboarding-tour.test.mjs`
- Test: `test/onboarding-tour.test.mjs`

**Interfaces:**
- Consumes: `src/renderer/core.js`
- Produces: a regression check for the welcome-to-Nexus form handoff.

- [x] **Step 1: Write the failing test**

```js
assert.doesNotMatch(welcomeCreateNexus, /uiConfirm\(/);
assert.match(core, /id="nx-guide"/);
assert.match(core, /S\._guideAfterCreate\s*=\s*Boolean\(q\('#nx-guide'\)\?\.checked\)/);
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test test/onboarding-tour.test.mjs`

Expected: failure because `welcomeCreateNexus()` currently calls `uiConfirm()` and the guide checkbox does not exist.

- [x] **Step 3: Write minimal implementation**

Change `welcomeCreateNexus()`, `openNexusModal()`, and `createNexusSubmit()` in `src/renderer/core.js`; add the localized guide-choice strings in `src/renderer/i18n.js`.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test test/onboarding-tour.test.mjs`

Expected: one passing test.

### Task 2: Validate the completed flow

**Files:**
- Modify: `src/renderer/core.js`
- Modify: `src/renderer/i18n.js`
- Test: `test/onboarding-tour.test.mjs`

**Interfaces:**
- Consumes: the existing `startNexusGuide()` and `run-dracondex` driver.
- Produces: a verified first-run onboarding flow with no nested confirmation.

- [x] **Step 1: Run static renderer validation**

Run: `node .claude/skills/dracondex-module-style/check.mjs src/renderer/core.js`

Expected: exit 0 with no new warnings.

- [x] **Step 2: Drive the form with the tour enabled**

Run: `node .claude/skills/run-dracondex/driver.mjs --fresh "click button[onclick='welcomeCreateNexus()']" "wait 200" "ss 01-direct-create" "fill #nx-name :: Guided Nexus" "click button[onclick='createNexusSubmit()']" "wait 600" "ss 02-guide-started"`

Expected: the first screenshot shows the Nexus form and optional guide control with no experience confirmation; the second shows the guide.

- [x] **Step 3: Drive the form with the tour disabled**

Run: `node .claude/skills/run-dracondex/driver.mjs --fresh "click button[onclick='welcomeCreateNexus()']" "wait 200" "click #nx-guide" "fill #nx-name :: Unguided Nexus" "click button[onclick='createNexusSubmit()']" "wait 600" "ss 03-guide-skipped"`

Expected: the creation completes without a guide overlay.

- [x] **Step 4: Inspect saved screenshots**

Open all three saved PNGs and reject any that show a nested confirmation, clipped control, or incorrect state.
