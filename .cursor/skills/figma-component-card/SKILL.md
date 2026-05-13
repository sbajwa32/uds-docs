---
name: figma-component-card
description: Build or update the canonical "component card" canvas layout on a UDS component page in Figma. Use when the user says "build/update the figma page for X", "regenerate the component cards", "scaffold the figma page for <component>", "apply the component card pilot to <component>", or "roll out the component card design across the library". Produces the seven-section card layout (HEADER, ANATOMY, VARIANTS, SUB-COMPONENTS, USAGE, ACCESSIBILITY, META) per `.cursor/rules/uds-figma-component-card.mdc`.
lastUpdated: 2026-05-13T19:04:48Z
---

# UDS Figma Component Card Skill

Builds the canonical seven-section card layout on a UDS component page in Figma. The visual spec is defined by [`uds-figma-component-card.mdc`](../../rules/uds-figma-component-card.mdc) — load that rule before reading further. This skill is the *implementation* of that rule; the rule is the *specification*. If the two ever drift, the rule wins and the skill must be updated.

## Mandatory prerequisite

You MUST load these BEFORE any `use_figma` call:

- [`figma-use`](../../../plugins/cache/cursor-public/figma/3590366424deba5651026319b71b291d10004f1b/skills/figma-use/SKILL.md) — Plugin API rules (font preload, paint binding, layout sizing, atomic-failure semantics)
- [`uds-figma-component-card.mdc`](../../rules/uds-figma-component-card.mdc) — the design specification this skill implements (create mode)
- [`uds-figma-component-card-update.mdc`](../../rules/uds-figma-component-card-update.mdc) — update-mode rule for any page that already has a `udc-<id>-page` frame
- [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc) — read-only discovery first
- [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc) — Figma writes are denied unless explicitly user-invoked, and require the standard write-summary report
- [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc) — `uds-docs/uds/` is read-only for this skill

This skill is the *implementation* of the rule; the rule is the *specification*. If the two ever drift, the rule wins and the skill must be updated.

## Update mode vs create mode

For ANY page that already has a `udc-<id>-page` frame, this skill defaults to **update mode** per [`uds-figma-component-card-update.mdc`](../../rules/uds-figma-component-card-update.mdc). The decision tree:

| Condition | Mode |
|---|---|
| No `udc-<id>-page` frame exists on the page | **create** — full builder per the original card rule |
| Frame exists, matches `📐 _TEMPLATE`, no new page content to absorb, all `spec.json` fields in sync | **no-op** — emit a write summary that says "no-op — already in sync"; do nothing else |
| Frame exists, ANY drift (template, page content, or `spec.json`) | **update** — see below |

Drift is detected against three sources:

1. **Template diff** — the existing card's structure vs the current `📐 _TEMPLATE` page in the same file
2. **Page-content diff** — the COMPONENTs / COMPONENT_SETs / INSTANCEs on the page (top-level + every descendant of the existing wrapper) vs what's actually placed inside the card sections
3. **Spec.json diff** — the card's text content vs the current `uds-docs/uds/components/<id>/spec.json` and `status.json`

On rebuild, the builder MUST first inventory the existing wrapper's full descendant tree (every COMPONENT_SET, COMPONENT, and INSTANCE) BEFORE destroying the wrapper, park those nodes at page level, then reparent them into the new card. Nothing may be lost or duplicated. If the builder's `droppedNodes` return field is non-empty, STOP and report — that's a critical failure.

For no-op runs, still emit the standard Figma write summary with operation `no-op` so the rollout report is complete.

## Inputs

Ask the user (via `AskQuestion`) for any of these that aren't already obvious from context:

| Input | Required | Notes |
|---|---|---|
| `fileKey` | Yes | Always `1XJoUJgtNpw4R0IIT3VjoK` (`UDS Components`). Per [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc) the user must name the target component(s) explicitly before the builder writes to this file. |
| `componentId` | Yes | Kebab-case (e.g. `button`, `text-input`). Must match an existing page in the file AND a directory at `uds-docs/uds/components/<id>/` containing `spec.json`. |
| Scope | Default: pilot | Single component → build that one page; `all` → build every component page in the file with a stoplight prefix. |

For a batch run, the four phase scripts each loop their own internal `BATCH` array, so a single rollout of N components is exactly four `use_figma` calls (one per phase) regardless of N. Each phase returns per-component IDs so the next phase can resume.

## Pre-flight (do these once at the start of the session)

1. **Confirm explicit user intent.** Per [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc), Figma writes are denied unless the user named the target. Confirm they want a card built/rebuilt for the named component(s) in the named file.
2. **Verify UDS Tokens library is subscribed.** Call `get_libraries`. If `libraries_added_to_file` does not include `UDS Tokens`, stop and ask the user to subscribe it via Figma's library picker. Do not attempt to auto-subscribe.
3. **Read the rule.** [`uds-figma-component-card.mdc`](../../rules/uds-figma-component-card.mdc).
4. **Read the gotchas.** [`references/gotchas.md`](references/gotchas.md). Skip any of those and you will waste 30 turns relearning them.
5. **Read the token map.** [`references/token-map.json`](references/token-map.json). Hardcoded library variable keys for every UDS token used by the builder. Do not look these up dynamically per-run; they are stable.
6. **Read the `📐 _TEMPLATE` page as a design reference (NOT a runtime input).** The template page in `UDS Components` documents every section and slot a card can contain. The builder stamps from the hardcoded recipe in `references/build-card-sections-A.js` + `build-card-sections-B.js` — neither phase ever opens the template page. If the rolled-out cards drift from the template, that's a recipe bug to fix in code (see [`references/card-rollout-drift-report.md`](references/card-rollout-drift-report.md) for the prior rollout's drift catalog). Run `bash scripts/audit-figma-card-template.sh` before any rollout to verify the recipe still matches the snapshot at `.cursor/figma/state/card-template.snapshot.json`.
7. **Read the spec and status.** `uds-docs/uds/components/<id>/spec.json` and `uds-docs/uds/components/<id>/status.json`. Cross-check that `status.json#current` matches the Figma page's stoplight prefix; if not, surface the mismatch and stop — that's a [`sync-figma-component-status`](../sync-figma-component-status/SKILL.md) job, not this one.

## The build recipe — four sequential `use_figma` calls per rollout

The builder is **four separate scripts** in `references/`, each focused on
a single phase of the pipeline. Splitting was forced by the use_figma
`code` parameter limit (50,000 chars): a single-script builder grew too
large to fit a payload with full comment density. Each script in this
directory is self-contained and well under the limit, with the natural
phase boundary (inventory → render top → render bottom → workspace)
producing four scripts that read independently:

| Script | Purpose | Size | Returns |
|---|---|---|---|
| [`references/build-card-inventory.js`](references/build-card-inventory.js) | Phase 1a — inventory + park + teardown | ~14k | classification IDs |
| [`references/build-card-sections-A.js`](references/build-card-sections-A.js) | Phase 1b-A — outer wrapper + HEADER + ANATOMY + VARIANTS | ~39k | `outerFrameId`, `contentFrameId`, partial `sectionIds` |
| [`references/build-card-sections-B.js`](references/build-card-sections-B.js) | Phase 1b-B — SUB-COMPONENTS + USAGE + ACCESSIBILITY + META + cleanup | ~45k | full `sectionIds`, `workspaceHandoff` |
| [`references/build-workspace-card.js`](references/build-workspace-card.js) | Phase 2 — workspace card at (2900, 0) | ~23k | workspace frame ID, reparented + skipped |

Each phase is its own atomic Figma transaction. If a phase throws, no
nodes from that phase are created and you can re-run after fixing the
cause. **Phases must run in order** — each phase reads IDs returned by
the prior phase and looks them up via `figma.getNodeById` (Figma node
IDs are stable across `use_figma` calls).

For a rollout of N components: four `use_figma` calls total (each phase
script loops its own `BATCH` array with one entry per component). Not
N×4. The scripts are designed for batch runs from the start.

### What each phase does

**Phase 1a — `build-card-inventory.js`.** Switches to the target page,
walks the existing `udc-<id>-page` wrapper (if any), classifies every
preservable `COMPONENT_SET` / `COMPONENT` / `INSTANCE` as primary set,
variant set, sub-component set, or unclassified. Captures top-level
ad-hoc frames separately. Parks all preserved nodes at `(5000, -5000)`
so they survive the wrapper teardown that follows. Tears down the old
component wrapper (NOT the workspace — phase 2 owns that). Loads no
fonts and imports no library variables — pure structural work.

**Phase 1b-A — `build-card-sections-A.js`.** Loads fonts, imports
library variables. Reads phase 1a's classification from
`CONFIG.inventory`. Creates the `udc-<id>-page` wrapper at `(0, 0)`
with the status accent strip and inner content frame. Renders HEADER
(dark card, eyebrow 01) — title, description, status pill, CSS chip,
hero with the primary set's `defaultVariant` cloned in. Renders
ANATOMY (light card, eyebrow 02) when at least Default + one other
state variant exist. Renders VARIANTS (light card, eyebrow 03) —
HORIZONTAL row of FIXED-width stages reparenting every non-underscore
COMPONENT_SET. Returns `outerFrameId` + `contentFrameId` for phase 1b-B.

**Phase 1b-B — `build-card-sections-B.js`.** Loads fonts, imports
library variables. Looks up `outerFrameId` + `contentFrameId` from
phase 1b-A's return. Renders SUB-COMPONENTS (light card, eyebrow 04)
when underscore-prefixed COMPONENT_SETs exist. Renders USAGE (light
card, eyebrow 05) when `spec.json#whenToUse` and/or `whenNotToUse`
are populated. Renders ACCESSIBILITY (light card, eyebrow 06) when
`spec.json#accessibility.keyboard` has at least one entry. Always
renders META (dark card, eyebrow 07) — links + meta-row + status pill.
Runs the cleanup pass: every preserved node from phase 1a that didn't
land inside the wrapper goes to `workspaceHandoff.unclassifiedNodeIds`.
Adhoc top-level frames go to `workspaceHandoff.adhocFrameIds`.

**Phase 2 — `build-workspace-card.js`.** Builds the `udc-<id>-workspace`
card at `(2900, 0)` with three sections — W01 EXAMPLES (4 empty labeled
slot frames), W02 UNCLASSIFIED COMPONENT NODES (reparents
`unclassifiedNodeIds` from phase 1b-B), W03 DESIGNER SCRATCH (reparents
`adhocFrameIds`). Update mode: if a workspace already exists, captures
W01 slot contents by index and restores them after teardown so designer-
populated slots persist across rebuilds.

## Per-phase config (BATCH entries)

Each phase script declares `const BATCH = [CONFIG, ...]` at the top.
The agent injects this before sending the script to use_figma. Phase
input fields (cumulative — each phase reads everything earlier phases
read, plus what they returned):

```js
// Phase 1a CONFIG fields
const phase1aFields = {
  pageId: '5055:139',                          // Figma page id
  componentId: 'button',                       // kebab-case slug
};

// Phase 1b-A CONFIG fields  (= phase 1a + ...)
const phase1bAFields = {
  ...phase1aFields,
  componentTitle: 'Button',                    // HEADER title (defaults to json.title)
  status: 'in-progress',                       // in-progress | review | blocked | production | placeholder
  udsVersion: '0.3',                           // recorded but unused in current recipe
  docsUrl: 'https://uds-docs/?#button',        // META "UDS Docs page" link target
  storybookUrl: 'https://storybook/?path=/story/button (placeholder)',
  json: { /* parsed uds-docs/uds/components/button/spec.json */ },
  statusJson: { /* parsed uds-docs/uds/components/button/status.json */ },
  inventory: { /* phase 1a return verbatim */ },
};

// Phase 1b-B CONFIG fields  (= phase 1b-A + phase 1b-A's return)
const phase1bBFields = {
  ...phase1bAFields,
  fromPhase1bA: { /* phase 1b-A return verbatim, must include outerFrameId + contentFrameId */ },
};

// Phase 2 CONFIG fields  (= the workspaceHandoff from phase 1b-B)
const phase2Fields = {
  pageId: '5055:139',
  componentId: 'button',
  componentTitle: 'Button',
  unclassifiedNodeIds: ['…', '…'],             // from phase 1b-B's workspaceHandoff
  adhocFrameIds: ['…'],                        // from phase 1b-B's workspaceHandoff
};
```

Each phase script's per-script return value is consumed by the next
phase as `CONFIG.inventory` (phase 1a → 1b-A) or `CONFIG.fromPhase1bA`
(phase 1b-A → 1b-B) or as the unclassified/adhoc IDs for phase 2.

## Status detection (page-name prefix → status)

| Prefix character(s) | Status |
|---|---|
| 🟠 (orange large circle) | `in-progress` |
| 🟡 (yellow large circle) | `review` |
| 🔴 (red large circle) | `blocked` |
| 🟢 (green large circle) | `production` |
| ⚫ / ⚫️ (black large circle / variation selector) | `placeholder` |

If the page name starts with anything else (e.g. `_support`, `📗`, `🎬`, `🛝`, `---`), this skill should refuse to run — those are non-component pages.

## Procedure for a single component

1. **Identify the page.** Match `componentId` to a page in the file. Confirm with the user if there are multiple matches.
2. **Pre-flight checks** (above).
3. **Read spec + status JSON.** `uds-docs/uds/components/<componentId>/spec.json` and `status.json`. If `spec.json` is absent, treat as placeholder (`status: 'placeholder'`, no sections requiring spec content).
4. **Phase 1a** — copy `references/build-card-inventory.js`, prepend `const BATCH = [{ pageId, componentId }];`, send to `use_figma`. Capture the return value as `phase1aResult`.
5. **Phase 1b-A** — copy `references/build-card-sections-A.js`, prepend `const BATCH = [{ ...all phase 1b-A fields..., inventory: phase1aResult.results[0] }];`, send. Capture as `phase1bAResult`.
6. **Phase 1b-B** — copy `references/build-card-sections-B.js`, prepend `const BATCH = [{ ...all phase 1b-A fields..., inventory: phase1aResult.results[0], fromPhase1bA: phase1bAResult.results[0] }];`, send. Capture as `phase1bBResult`.
7. **Phase 2** — copy `references/build-workspace-card.js`, prepend `const BATCH = [{ pageId, componentId, componentTitle, unclassifiedNodeIds: phase1bBResult.results[0].workspaceHandoff.unclassifiedNodeIds, adhocFrameIds: phase1bBResult.results[0].workspaceHandoff.adhocFrameIds }];`, send.
8. **Emit Figma write summary** per [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc) — one summary per component covering all four phases.
9. **Run the audit.** Invoke the [`figma-component-card-audit`](../../agents/figma-component-card-audit.md) subagent on the just-built page.
10. **Report to the user.** Summary of what was built, what was omitted (and why), audit findings.

If a phase throws partway through (e.g. variable import fails, font load times out), STOP and report. Don't proceed to the next phase — the wrapper would be left half-built. Re-run the failed phase after fixing the cause.

## Procedure for a batch (all components)

1. Pre-flight (once).
2. **Read all spec + status JSONs in parallel** from `uds-docs/uds/components/*/spec.json` and `uds-docs/uds/components/*/status.json`.
3. **Inspect every page's children** in one `use_figma` call to gather: page id, name (status emoji), top-level component sets, sub-components. Cross-check each page's emoji prefix against its `status.json#current`; surface mismatches.
4. **Phase 1a (batch)** — one `use_figma` call with `BATCH` containing one entry per component. Returns one classification payload per component in `results[]`.
5. **Phase 1b-A (batch)** — one `use_figma` call with `BATCH` mapping each component's CONFIG with its phase 1a result attached as `inventory`.
6. **Phase 1b-B (batch)** — one `use_figma` call wiring each entry's `fromPhase1bA` from the prior step's results.
7. **Phase 2 (batch)** — one `use_figma` call with `BATCH` containing the workspace-handoff IDs from phase 1b-B.
8. **Emit one Figma write summary block per component**, plus a top-level batch summary.
9. **Run the audit** for `all` after the batch completes.
10. **Report a single summary** at the end.

A full N-component rollout is exactly four `use_figma` calls regardless of N.

If a phase errors mid-batch, identify which components succeeded (their results are in the `results[]` array preceding the error) and which need re-running. Re-run the failed phase with a `BATCH` containing only the unfinished components.

## Output principles

- **Single source of truth for the card structure is the rule and the `_TEMPLATE` Figma page.** This skill is the wiring; if the wiring drifts from the rule, fix the wiring.
- **Variables MUST be re-imported every `use_figma` call.** See [gotchas.md](references/gotchas.md). Stored variable IDs from previous calls return stub variables that look bound but render as the literal color.
- **Never write raw hex into bound paints' `color` field unless you also bind it.** The literal is the design-time fallback; the binding is what survives mode flips.
- **Never modify any file under `uds-docs/uds/`.** Per [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc), that path is read-only for this skill. Spec/status/changelog/impl edits go through the named Figma-sync skills ([`sync-figma-component-spec`](../sync-figma-component-spec/SKILL.md), [`sync-figma-component-status`](../sync-figma-component-status/SKILL.md), [`new-component`](../new-component/SKILL.md), [`link-figma-nodes`](../link-figma-nodes/SKILL.md), [`import-figma-tokens`](../import-figma-tokens/SKILL.md)) — not this one.
- **Every Figma write must be paired with a write-summary report.** See [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc).

## DO NOT

- **Don't write to `UDS Components`** without explicit user direction naming the target component(s) per [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc).
- **Don't reorder card sections.** HEADER → ANATOMY → VARIANTS → SUB-COMPONENTS → USAGE → ACCESSIBILITY → META, always.
- **Don't renumber eyebrows.** If a section is omitted, the next section keeps its assigned number — the sequence has gaps.
- **Don't use `Read` to verify Figma screenshots.** The Cursor `Read` tool aggressively caches by some opaque key; Figma screenshots routinely show stale content. Use the inline `await node.screenshot()` pattern documented in [gotchas.md](references/gotchas.md), or pipe the screenshot URL through a fresh-named tmp file and read with a UUID filename. Honestly, just trust the structural inspection from `use_figma` and only screenshot at the end.
- **Don't add new card sections without updating the rule first.** This skill follows the rule, not the other way around.
- **Don't introduce new tokens.** Use only what's in [`references/token-map.json`](references/token-map.json). If a needed token is missing, surface that to the user — they may need to update the UDS Tokens library, which is outside this skill's scope.
- **Don't run this skill on `_support`, `📗 Cover`, `🎬 Demo`, `🛝 Playground` pages.** They are not components.

## See also

- [`uds-figma-component-card.mdc`](../../rules/uds-figma-component-card.mdc) — design specification (the "what")
- [`uds-figma-component-card-update.mdc`](../../rules/uds-figma-component-card-update.mdc) — update-mode rule (when to rebuild, how to preserve content)
- [`figma-component-card-audit.md`](../../agents/figma-component-card-audit.md) — read-only verification subagent
- [`figma-use`](../../../plugins/cache/cursor-public/figma/3590366424deba5651026319b71b291d10004f1b/skills/figma-use/SKILL.md) — Plugin API rules (mandatory pre-load before any `use_figma`)
- [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc) — `uds-docs/uds/` is read-only for this skill
- [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc) — Figma write discipline + required summary
- [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc) — pre-flight discovery requirements
- [`uds-figma-component-inspection.mdc`](../../rules/uds-figma-component-inspection.mdc) — read-only inspection patterns
- [`uds-content-schema.mdc`](../../rules/uds-content-schema.mdc) — spec.json field rules
- [`uds-release-workflow.mdc`](../../rules/uds-release-workflow.mdc) — release-time Figma synchronization
- Companion Figma-sync skills (the AUTHORIZED writers of `uds-docs/uds/`):
  - [`import-figma-tokens`](../import-figma-tokens/SKILL.md)
  - [`sync-figma-component-spec`](../sync-figma-component-spec/SKILL.md)
  - [`sync-figma-component-status`](../sync-figma-component-status/SKILL.md)
  - [`link-figma-nodes`](../link-figma-nodes/SKILL.md)
  - [`new-component`](../new-component/SKILL.md)
- [`references/build-card.js`](references/build-card.js) — full builder script
- [`references/gotchas.md`](references/gotchas.md) — known pitfalls (read these first!)
- [`references/token-map.json`](references/token-map.json) — UDS Tokens library variable keys
