---
name: generate-uds-figma-component
description: UDS Component Factory. Drafts a token-bound UDS component set directly inside the UDS Components Figma file on a brand-new `🟠 <Title> {Cursor}{Ignore}` page. Use when the user says "generate a UDS component for X", "factory me an Avatar", "draft a new UDS component called Y", "build a UDS component for Z in Figma", or "use the component factory to start <Title>". Stops at Figma — never writes to `uds-docs/uds/`. Docs landing is the existing `uds-updated` skill, run later by the designer.
lastUpdated: 2026-05-18T19:06:07Z
---

# UDS Component Factory — Generate UDS Figma Component

This skill takes a short component brief and returns a strong, token-bound
Figma component set on a brand-new `🟠 <Title> {Cursor}{Ignore}` page in the
[`UDS Components`](https://www.figma.com/file/1XJoUJgtNpw4R0IIT3VjoK)
file. The designer remains the design lead and the approval authority;
the factory handles the repetitive construction, quality checks, and
cleanup.

The factory's job ends when the designer accepts the draft. Mainline
rename, docs scaffold, status sync, and changelog are NOT in scope —
those happen later via the existing
[`uds-updated`](../uds-updated/SKILL.md) skill, designer-initiated.

The full spec for this skill lives in the plan at
[`.cursor/plans/uds-component-factory.md`](../../plans/uds-component-factory.md).
That plan is the source of truth for scope, locked decisions, and
risks; the steps below are the operational implementation.

## Mandatory prerequisite skills

You MUST load these BEFORE any `use_figma` call. Loading order matters:

1. [`figma-use`](../../../plugins/cache/cursor-public/657/dd9335f17413d9185c6bc8426798b714ab1d29cb/skills/figma-use/SKILL.md)
   — Plugin API rules: page-context reset per call, return-pattern, ID
   return, font preload, color 0–1 range, atomic-failure semantics.
   Required by every `use_figma` invocation.
2. [`figma-generate-library`](../../../plugins/cache/cursor-public/657/dd9335f17413d9185c6bc8426798b714ab1d29cb/skills/figma-generate-library/SKILL.md)
   — supplies the state ledger
   (`setSharedPluginData('dsb','run_id', RUN_ID)`), the
   sequential-call rule, the library-discovery pattern
   (`get_libraries` + `search_design_system`), the validation pattern,
   and the Phase 3 component pattern. This factory inherits all of
   that and only defines UDS-specific deltas on top.

If the cached plugin path resolves differently in the user's
environment, both skills are also available via the official Figma MCP
server's skill loader — load by name (`figma-use`,
`figma-generate-library`) and let the loader resolve the path. Do NOT
proceed without both loaded; they are not optional.

## Mandatory rules

These auto-attach via globs but are the contract this skill operates
under. If any of them is unread in the current session, read them now:

- [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc) —
  read-only discovery first; mandatory preflight output before any
  Figma read or write; ignore `{Ignore}` pages.
- [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc)
  — Figma writes denied unless explicitly scoped. The factory writes
  ONLY into **scope #4** (component drafts on a page whose name
  contains `{Cursor}{Ignore}` in `UDS Components`). Every write must
  produce the standard before/after summary.
- [`uds-token-architecture.mdc`](../../rules/uds-token-architecture.mdc)
  — token vocabulary contract. Bind only via library variable keys;
  do not invent tokens.
- [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc) —
  the factory NEVER modifies anything under `uds-docs/uds/`.
- [`uds-rule-discipline.mdc`](../../rules/uds-rule-discipline.mdc) —
  any edit to this SKILL.md or to the write-safety rule must bump
  `lastUpdated:` and re-run `bash scripts/regenerate-toolchain.sh`.
- [`uds-master-preflight.mdc`](../../rules/uds-master-preflight.mdc)
  Phase 5 — round-trip checklist that applies if a follow-on edit
  touches anything under `uds-docs/`.

## Inputs

Ask the user (via `AskQuestion`) for any of these that aren't clear
from context:

| Input | Required | Notes |
|---|---|---|
| `componentTitle` | Yes | Title Case (e.g. `Avatar`, `Banner`, `Stepper`). Used in the page name and the component-set node name. |
| `componentId` | Yes | kebab-case (e.g. `avatar`). Must NOT collide with an existing entry in [`uds-docs/uds/components.json`](../../../uds-docs/uds/components.json). |
| `brief` | Yes | Short prose describing purpose, when-to-use, when-not-to-use, and any non-obvious constraints. The factory expands this into the full model in Phase A. |
| `siblings` | Optional | Up to 3 component IDs to use as anatomy/state/accessibility references. Default: factory picks the closest siblings from `components.json` based on the brief. |
| `pageBaseline` | Default `🟠` | Stoplight prefix for the new page. Defaults to `🟠` (in-progress) per [locked decision #3 in the plan](../../plans/uds-component-factory.md#2-locked-decisions-this-conversation). |

The component target is always the `UDS Components` file, file key
`1XJoUJgtNpw4R0IIT3VjoK`. The skill never writes to `UDS Tokens`.

## Pre-flight (do these once at the start of the session)

1. **Confirm explicit user intent.** Per
   [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc),
   Figma writes are denied unless the user named the target. Confirm
   the user wants a draft component built for the named title, in the
   named file, on a `{Cursor}{Ignore}` page.
2. **Run the preflight output block** from
   [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc)
   §"Mandatory preflight output": Tokens version, Components version,
   site `UDS_VERSION`, mismatch yes/no, capability check pass/partial/fail,
   action.
3. **Verify the UDS Tokens library is subscribed.** Call
   `get_libraries({ fileKey: '1XJoUJgtNpw4R0IIT3VjoK' })`. If
   `libraries_added_to_file` does not include `UDS Tokens`, STOP and
   ask the user to subscribe it via Figma's library picker. Do not
   attempt to auto-subscribe. Same exit pattern as the
   [`figma-component-card`](../figma-component-card/SKILL.md)
   pre-flight.
4. **Check id collision.** Read
   [`uds-docs/uds/components.json`](../../../uds-docs/uds/components.json)
   and confirm the proposed `componentId` is not already taken. If it
   is, stop and ask whether the user wants to use a different id, sync
   the existing component instead (different workflow), or override.
5. **Check existing-page collision.** List the pages of `UDS Components`
   and check whether a page named `<anyPrefix> <Title> {Cursor}{Ignore}`
   already exists for this title. If it does, do NOT touch it yet —
   ask the user (per [locked decision #2 in the plan](../../plans/uds-component-factory.md#2-locked-decisions-this-conversation))
   whether to inspect-and-resume, destroy-and-rebuild, or pick a new
   title.
6. **Locate or create the resume-state file.** State path is
   `.cursor/state/component-factory/<componentId>.md`. If it exists,
   read it and resume from where the prior session left off; do not
   overwrite the model. If it does not exist, you'll create it during
   Phase A. (`.cursor/state/` is gitignored — proposals are runtime
   state, not committed history.)

## Phase A — Brief to model (no Figma writes)

Inputs the skill reads — keep the cumulative payload under 30 KB; if
sibling specs are larger, read only the sections you need (`anatomy`,
`states`, `accessibility`, `props`):

- The user's `brief`.
- [`uds-docs/uds/components.json`](../../../uds-docs/uds/components.json)
  — full component list.
- The 2–3 closest sibling components' `spec.json` files at
  `uds-docs/uds/components/<id>/spec.json`. Schema is
  [`uds-docs/uds/schemas/spec.schema.json`](../../../uds-docs/uds/schemas/spec.schema.json).
- [`uds-docs/uds/tokens/semantic.css`](../../../uds-docs/uds/tokens/semantic.css)
  — available semantic surfaces, text, borders, and status treatments.
- [`uds-token-architecture.mdc`](../../rules/uds-token-architecture.mdc)
  — token-role contract (which token role binds to which CSS variable
  family).

Persist the proposed model to
`.cursor/state/component-factory/<componentId>.md`. Sections:

- **Purpose** — why this component exists.
- **When to use** / **When not to use** — paired guidance.
- **Anatomy** — root, label, icon/content slots, helper text, action
  area, supporting parts.
- **Variant axes** — drawn from siblings where possible (size,
  emphasis, tone, state, density, orientation, selection, validation).
  Note that UDS does not have a standardized variant vocabulary
  ([plan §12 risk](../../plans/uds-component-factory.md#12-open-risks))
  — inherit the closest sibling's vocabulary rather than inventing
  new axis names.
- **State matrix** — default, hover, active/pressed, focus-visible,
  disabled, selected, error, loading, empty, as appropriate.
- **Accessibility plan** — keyboard, focus, screen reader, disabled /
  loading / error behaviors.
- **Token plan** — explicit role-to-token map, e.g.
  `background.default = --uds-color-surface-interactive-default`. Every
  visual property the component will bind belongs in this map. If a
  needed token is missing from UDS Tokens, mark it `MISSING` and STOP
  the model there — new tokens flow through the
  [`import-figma-tokens`](../import-figma-tokens/SKILL.md) skill, NOT
  through this factory.
- **Sibling reuse** — components to reuse as nested instances
  (`Button`, `Text Input`, `Card`, `Notification`, `Icon Wrapper`,
  `Badge`, etc.).
- **Assumptions and acceptance criteria** — plain-language list the
  designer can scan in under a minute.

### Approval gate (mandatory before Phase B)

After persisting the model, present it inline and pause. Per
`figma-generate-library` §"Explicit phase approval", "looks good" /
"fine" / "OK" do NOT count. Wait for the literal word `approved`
(case-insensitive) before any Figma write.

**Approval with changes.** If the designer says "approved, but change
X" or "approved with: <list>", apply the requested changes to the
model (overwriting the persisted markdown), confirm the changes are
captured, then proceed to Phase B. Do NOT require a second
`approved`.

**Pure rejection.** "Not yet" / "rework this" returns to Phase A
research. Do not proceed.

## Phase B — Draft page build (Figma writes, scope #4 only)

After the model is approved, the skill writes ONLY to a new
`{Cursor}{Ignore}` page on the `UDS Components` file. Every
`use_figma` call MUST:

- Re-import variables in that call. Do not rely on stale variable IDs
  from prior calls (variable IDs are not stable across `use_figma`
  invocations — see the
  [`figma-component-card` gotchas](../figma-component-card/references/gotchas.md)).
- Tag every created node immediately with
  `setSharedPluginData('dsb','run_id', RUN_ID)` plus a logical key,
  per the `figma-generate-library` state ledger. The `run_id` is what
  the future `purge-failed-factory-run` skill will use to clean up
  failed runs without name-guessing.
- Pass `skillNames: "generate-uds-figma-component, figma-generate-library, figma-use"`
  to `use_figma` so the call is logged correctly.

The build is a small chain of sequential `use_figma` calls (never
parallel — `figma-generate-library` rule 13). Each call is its own
atomic Figma transaction; if one throws, no nodes from that call land
and you can re-run after fixing the cause.

### B.1 — Create the page

- Page name: `<pageBaseline> <componentTitle> {Cursor}{Ignore}`. With
  the default baseline that's `🟠 <Title> {Cursor}{Ignore}`.
- The `{Ignore}` marker takes the page out of every UDS automation
  ([`figma-inventory`](../../agents/figma-inventory.md),
  [`sync-figma-component-status`](../sync-figma-component-status/SKILL.md),
  [`uds-updated`](../uds-updated/SKILL.md),
  [`figma-spec-gap`](../../agents/figma-spec-gap.md),
  [`figma-component-inspector`](../../agents/figma-component-inspector.md))
  per [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc).
  No rule changes are needed.
- The `{Cursor}` label tells designers it's a factory draft.
- Designer accepts later by renaming the page (drop `{Cursor}{Ignore}`,
  set the stoplight prefix to `🟡` review or `🟢` production).

### B.2 — Build the component set

- Create a component set named `udc-<componentId>` with clean variant
  properties using the agreed vocabulary.
- Build variants and states with auto-layout. Defaults: containers hug
  content unless a fixed dimension is part of the spec; padding axes
  use UDS spacing tokens, not raw pixels; flat structure preferred
  unless nesting is required.
- Bind fills, strokes, type, spacing, and radius to UDS Tokens via the
  role-to-token map from Phase A. Use the actual library variable
  keys returned by `get_libraries` + `search_design_system` — never
  hardcode hex values into bound paints.
- Use existing UDS components as nested instances where the model says
  to (per Phase A "Sibling reuse").
- Use meaningful layer names that match the anatomy. Names like
  `Frame 12` are a layer-hygiene gate failure in Phase C.

### B.3 — Token discipline

- If a needed token is missing from UDS Tokens, STOP and ask. New
  tokens flow through the UDS Tokens Figma file, then the
  [`import-figma-tokens`](../import-figma-tokens/SKILL.md) skill —
  never via this factory's `use_figma` calls. Document the missing
  token in the model's "Token plan" section as `MISSING` and surface
  it to the user.
- Never write raw hex into a bound paint's `color` field unless you
  also bind it to a variable. The literal is the design-time fallback;
  the binding is what survives mode flips.

### B.4 — Required write summary

After the build, emit ONE Figma write summary per the
[`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc)
§"Required before/after report" template, scoped to the new page:

```markdown
## Figma write summary

- File: UDS Components
- File key: 1XJoUJgtNpw4R0IIT3VjoK
- Page: 🟠 <Title> {Cursor}{Ignore}  (newly created)
- Node/frame: udc-<componentId>  (component set)
- Operation: create
- Old value: (page did not exist)
- New value: <list of variant property names + values + node IDs>
- Rollback note: delete the page or run purge-failed-factory-run with run_id=<RUN_ID>
```

If the build fails partway through, stop and report the exact last
successful operation. Do NOT continue with more writes until the user
reviews the state. Re-run from the failed step after fixing the
cause.

### B.5 — Post-build verification (mandatory before Phase C)

Per `figma-generate-library` rule 12 ("Validate before proceeding")
and the `figma-use` "always read IDs from the state ledger" rule:

1. Call `get_metadata` on the new page node to confirm structure:
   page child count, component-set children, variant-property names
   match the approved model.
2. Call `get_screenshot` on the page node to capture a visual record.
3. Cross-check that every created node ID returned by Phase B is
   present in the metadata response. Any missing or duplicate ID
   STOPS the run for investigation — Phase C does not run on
   unverified work.

## Phase C — Quality-gate report

The first draft is not production-ready by default. Goal: a high-quality
starting point + a clear report of what still needs review. Emit a
structured report with two sections.

### Tool-emitted gates (deterministic — counts, not opinions)

- **Token bindings.** Raw color/fill/stroke values found: N. Unbound
  corner radii: N at `<nodeIds>`. Unbound spacing: N at `<nodeIds>`.
  Unbound typography: N.
- **Variant matrix.** Generated variant axes and values vs. the
  approved model. Match / mismatch report.
- **Layer hygiene.** Unnamed nodes: N. Generic names (`Frame N`,
  `Rectangle N`): N. Orphan top-level nodes on the page: N.
- **Auto-layout coverage.** Frames without auto-layout: N at
  `<nodeIds>`.

If any tool-emitted gate fires with non-zero findings, the skill
reports the issue and proposes a fix. Design-changing, destructive, or
token-creating fixes require explicit approval before applying.

### Human-judged gates (Cursor flags; designer decides)

- **State coverage.** Are all states present and visually
  distinguishable?
- **Accessibility plan.** Is the documented keyboard / focus / SR
  behavior plausible and complete?
- **Visual direction.** Does the draft match the intended UDS feel?

### Review-ready definition

The factory job is complete when:

- All four tool-emitted gates report zero findings, AND
- The human-judged gates have been written into a designer-facing
  prompt block (one paragraph per gate; no decision required to
  finish — the designer reads them as part of acceptance).

Production-ready is a higher bar that happens later, after designer
rename + the eventual `uds-updated` run. The factory does not chase
it.

## Phase D — Designer hand-off (factory done)

When the designer accepts the draft, factory's job is done. What
happens next is NOT this skill's responsibility:

- The designer renames the page in `UDS Components` to drop
  `{Cursor}{Ignore}` and update the stoplight prefix to whatever
  status they want (`🟠` in-progress, `🟡` review, `🟢` production).
- When the designer is ready, they run
  [`uds-updated`](../uds-updated/SKILL.md) (or equivalent prompt:
  "UDS updated", "Figma updated", "sync UDS from Figma"). That
  workflow handles `new-component` scaffold,
  `sync-figma-component-spec`, `link-figma-nodes`, status sync,
  changelog, cache-bust, commit, push.
- Optionally, the designer may run
  [`figma-component-card`](../figma-component-card/SKILL.md) to build
  the seven-section page layout in Figma. Independent of this
  factory.

The model proposal at `.cursor/state/component-factory/<componentId>.md`
can be deleted once the component has landed in docs, or left in
place — cleanup is optional, since `.cursor/state/` is gitignored.

## Procedure (single-component, the only mode in this version)

1. **Pre-flight** (above).
2. **Phase A** — read brief + siblings + tokens, persist model to
   `.cursor/state/component-factory/<componentId>.md`, present
   inline, wait for `approved`.
3. **Phase B** — sequential `use_figma` calls: B.1 page, B.2
   component set, B.4 write summary, B.5 verification.
4. **Phase C** — emit the quality-gate report.
5. **Phase D** — hand off to the designer; do NOT rename the page; do
   NOT run any docs-side skill; do NOT touch `uds-docs/uds/`.

If the designer says "iterate" / "revise" after Phase C, return to
Phase B with the requested changes and re-run B.5 + Phase C. Do not
rebuild the page from scratch unless the designer explicitly asks
(per [locked decision #2](../../plans/uds-component-factory.md#2-locked-decisions-this-conversation)).

## Output principles

- **Single source of truth for the design model is the persisted
  `.cursor/state/component-factory/<componentId>.md` file.** If
  conversation context is truncated, re-read the file before
  resuming.
- **Variables MUST be re-imported every `use_figma` call.** See the
  [`figma-component-card` gotchas](../figma-component-card/references/gotchas.md).
- **Never write raw hex into bound paints' `color` field unless you
  also bind it.**
- **Never modify any file under `uds-docs/uds/`.** The factory's
  output is Figma-only.
- **Every Figma write must be paired with a write-summary report.**
  See [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc).

## DO NOT

- **Don't write to `UDS Components`** outside the new
  `{Cursor}{Ignore}` page. Other pages are not in scope #4.
- **Don't write to `UDS Tokens`** at all. Token additions flow
  through the UDS Tokens Figma file (designer-side) and
  [`import-figma-tokens`](../import-figma-tokens/SKILL.md).
- **Don't auto-rename the page** to drop `{Cursor}{Ignore}` or to
  change the stoplight. That's the designer's acceptance gesture.
- **Don't run [`new-component`](../new-component/SKILL.md),
  [`sync-figma-component-spec`](../sync-figma-component-spec/SKILL.md),
  [`link-figma-nodes`](../link-figma-nodes/SKILL.md), or any
  `uds-docs/uds/` writer skill** as part of this workflow. Docs
  landing is the designer's separate `uds-updated` invocation.
- **Don't proceed past Phase A without the literal `approved`** (or
  "approved with: …"). "Looks good" is not approval.
- **Don't parallelize `use_figma` calls.** Sequential only, per
  `figma-generate-library` rule 13.
- **Don't invent tokens.** If the model's token plan needs something
  that isn't in UDS Tokens, STOP and ask the user to add it via the
  UDS Tokens Figma file + `import-figma-tokens`.
- **Don't proceed if the existing-page collision check found a
  pre-existing `<Title> {Cursor}{Ignore}` page.** Ask the user first
  ([locked decision #2](../../plans/uds-component-factory.md#2-locked-decisions-this-conversation)).
- **Don't skip the Phase B.5 verification.** The quality-gate report
  in Phase C does not run on unverified work.

## See also

- [Plan: UDS Component Factory](../../plans/uds-component-factory.md)
  — full scope, locked decisions, risks, pilot defaults, kill criteria.
- [`figma-use` (cached plugin skill)](../../../plugins/cache/cursor-public/657/dd9335f17413d9185c6bc8426798b714ab1d29cb/skills/figma-use/SKILL.md)
  — Plugin API rules.
- [`figma-generate-library` (cached plugin skill)](../../../plugins/cache/cursor-public/657/dd9335f17413d9185c6bc8426798b714ab1d29cb/skills/figma-generate-library/SKILL.md)
  — state ledger, sequential rule, Phase 3 component pattern.
- [`figma-component-card`](../figma-component-card/SKILL.md) — sibling
  Figma writer skill (writes the page-layout cards). Pairs with this
  factory after the docs scaffold exists.
- [`uds-updated`](../uds-updated/SKILL.md) — designer-initiated
  follow-on that lands the accepted draft into the docs site.
- [`new-component`](../new-component/SKILL.md) — docs-side scaffold
  the `uds-updated` workflow calls. Not invoked by this factory.
- [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc) —
  preflight discovery requirements.
- [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc)
  — write scopes (this factory's writes are scope #4).
- [`uds-token-architecture.mdc`](../../rules/uds-token-architecture.mdc)
  — token vocabulary contract.
- [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc) —
  why the factory stops at Figma.
- [`uds-rule-discipline.mdc`](../../rules/uds-rule-discipline.mdc) —
  bookkeeping when this skill itself is edited.
