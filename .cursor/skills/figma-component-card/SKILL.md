---
name: figma-component-card
description: Build or update the canonical "component card" canvas layout on a UDS component page in Figma. Use when the user says "build/update the figma page for X", "regenerate the component cards", "scaffold the figma page for <component>", "apply the component card pilot to <component>", or "roll out the component card design across the library". Produces the seven-section card layout (HEADER, ANATOMY, VARIANTS, SUB-COMPONENTS, USAGE, ACCESSIBILITY, META) per `.cursor/rules/uds-figma-component-card.mdc`.
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
| `fileKey` | Yes | Default to the testbed (`HuQdX4txzccYX5GEnFnxAn`). Only target mainline (`1XJoUJgtNpw4R0IIT3VjoK`) on explicit user request — and per [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc) the user must name "mainline" specifically. |
| `componentId` | Yes | Kebab-case (e.g. `button`, `text-input`). Must match an existing page in the file AND a directory at `uds-docs/uds/components/<id>/` containing `spec.json`. |
| Scope | Default: pilot | Single component → build that one page; `all` → build every component page in the file with a stoplight prefix. |

For a batch run, do NOT iterate one component at a time across many `use_figma` calls. Use a single script that loops, building 5–8 components per call (per the figma-use 10-op limit), and `return` per-component IDs so the next call can resume.

## Pre-flight (do these once at the start of the session)

1. **Confirm explicit user intent.** Per [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc), Figma writes are denied unless the user named the target. Confirm they want a card built/rebuilt for the named component(s) in the named file.
2. **Verify UDS Tokens library is subscribed.** Call `get_libraries`. If `libraries_added_to_file` does not include `UDS Tokens`, stop and ask the user to subscribe it via Figma's library picker. Do not attempt to auto-subscribe.
3. **Read the rule.** [`uds-figma-component-card.mdc`](../../rules/uds-figma-component-card.mdc).
4. **Read the gotchas.** [`references/gotchas.md`](references/gotchas.md). Skip any of those and you will waste 30 turns relearning them.
5. **Read the token map.** [`references/token-map.json`](references/token-map.json). Hardcoded library variable keys for every UDS token used by the builder. Do not look these up dynamically per-run; they are stable.
6. **Open the `📐 _TEMPLATE` page.** If it exists, inspect its structure FIRST. The template overrides this skill if there's a difference (designers can edit the template without touching code).
7. **Read the spec and status.** `uds-docs/uds/components/<id>/spec.json` and `uds-docs/uds/components/<id>/status.json`. Cross-check that `status.json#current` matches the Figma page's stoplight prefix; if not, surface the mismatch and stop — that's a [`sync-figma-component-status`](../sync-figma-component-status/SKILL.md) job, not this one.

## The build recipe (single `use_figma` call per component)

The builder is a single self-contained script that:

1. Switches to the target page
2. Preloads all fonts: Inter Bold/Semi Bold/Medium/Regular and Geist Mono Bold/Medium/Regular
3. Imports every needed library variable fresh via `figma.variables.importVariableByKeyAsync` (the keys are in `references/token-map.json`)
4. Discovers existing nodes on the page:
   - Component sets at top level (these become VARIANTS)
   - Sub-component COMPONENTs / COMPONENT_SETs with leading underscore or matching `<id>-<sub>` names (these become SUB-COMPONENTS)
   - Default state instance: parse children of the primary set for `State=Default, Size=Default` (or fall back to the set's `defaultVariant`)
   - Hover, Active, Disabled state instances by parsing children of the primary set
5. Reads `uds-docs/uds/components/<id>/spec.json` and `status.json` from disk (the agent supplies these as string parameters, since `use_figma` cannot read the filesystem)
6. Determines status from `status.json#current`; cross-checks against page-name emoji prefix and halts if they disagree
7. Tears down any existing `udc-<id>-page` frame
8. Reparents existing component sets to a temp position so the wrapper can be deleted safely
9. Builds the new `udc-<id>-page` frame top-down: outer wrapper → content → 7 sections → reparent sets back into the right cards → cleanup
10. Returns `{ pageId, sectionIds, droppedNodes }`

The full builder script lives in [`references/build-card.js`](references/build-card.js). Copy that script into the `code` parameter of `use_figma` for each invocation, with the per-component config substituted at the top.

## Per-component config object

The builder accepts (at the top of the script):

```js
const CONFIG = {
  fileKey: 'HuQdX4txzccYX5GEnFnxAn',         // testbed
  pageId: '5055:139',                          // the component's Figma page id
  componentId: 'button',                       // kebab-case
  status: 'in-progress',                       // mapped from page-name emoji
  json: { /* parsed uds-docs/uds/components/button/spec.json */ },  // injected from disk
  statusJson: { /* parsed uds-docs/uds/components/button/status.json */ },  // injected from disk
  storybookUrl: 'https://storybook/?path=/story/button (placeholder)',
  docsUrl: 'https://uds-docs/?#button',
  // Optional overrides; if not provided, builder discovers via convention
  primarySetId: null,
  subSetIds: null,
  stateInstanceIds: null,
};
```

The builder logs (via `return`) any field it had to auto-discover so you can verify.

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
4. **Substitute config and run the builder.** One `use_figma` call.
5. **Emit the Figma write summary report** per [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc).
6. **Run the audit.** Invoke the [`figma-component-card-audit`](../../agents/figma-component-card-audit.md) subagent on the just-built page.
7. **Report to the user.** Summary of what was built, what was omitted (and why), audit findings.

## Procedure for a batch (all components)

1. Pre-flight (once).
2. **Read all spec + status JSONs in parallel** from `uds-docs/uds/components/*/spec.json` and `uds-docs/uds/components/*/status.json`.
3. **Inspect every page's children** in one `use_figma` call to gather: page id, name (status emoji), top-level component sets, sub-components. Cross-check each page's emoji prefix against its `status.json#current`; surface mismatches.
4. **Run the builder in batches of 5–8 components per `use_figma` call.** Each batch returns the IDs of pages it built.
5. **Emit one Figma write summary block per component**, plus a top-level batch summary.
6. **Run the audit** for `all` after every batch.
7. **Report a single summary** at the end.

If any batch errors, the next batch starts from where it left off — don't restart the whole thing.

## Output principles

- **Single source of truth for the card structure is the rule and the `_TEMPLATE` Figma page.** This skill is the wiring; if the wiring drifts from the rule, fix the wiring.
- **Variables MUST be re-imported every `use_figma` call.** See [gotchas.md](references/gotchas.md). Stored variable IDs from previous calls return stub variables that look bound but render as the literal color.
- **Never write raw hex into bound paints' `color` field unless you also bind it.** The literal is the design-time fallback; the binding is what survives mode flips.
- **Never modify any file under `uds-docs/uds/`.** Per [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc), that path is read-only for this skill. Spec/status/changelog/impl edits go through the named Figma-sync skills ([`sync-figma-component-spec`](../sync-figma-component-spec/SKILL.md), [`sync-figma-component-status`](../sync-figma-component-status/SKILL.md), [`new-component`](../new-component/SKILL.md), [`link-figma-nodes`](../link-figma-nodes/SKILL.md), [`import-figma-tokens`](../import-figma-tokens/SKILL.md)) — not this one.
- **Every Figma write must be paired with a write-summary report.** See [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc).

## DO NOT

- **Don't write to the mainline `UDS Components` file** without explicit user approval.
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
