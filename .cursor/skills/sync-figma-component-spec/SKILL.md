---
name: sync-figma-component-spec
description: Update a UDS component's per-component artifacts (spec.json, CSS, examples, impl.json, playground.js, figmanotes.json) from a deep Figma component inspection. Bidirectional — consumes the inspector's `Doc-site surplus` + `Snapshot delta` sections to propose removals (deleted slots/events/states/CSS/JS/examples) as classified `potentially-breaking` or `destructive` findings that default to ask-user, AND consumes the inspector's `Figma Notes evaluation` section to update `figmanotes.json` (auto-prune resolved notes, add new ones). Use for prompts like "sync Button from Figma" or after figma-component-inspector reports high-confidence changes.
lastUpdated: 2026-06-07T20:26:28Z
---

# Sync Figma Component Spec

This skill updates a component's doc-site surface from the UDS Components Figma
file, but only after a deep node-tree inspection. It is the write step that
consumes `figma-component-inspector`.

After Phase 13 of the repo restructure, every per-component artifact lives in
`uds-docs/uds/components/<id>/`:

```
uds-docs/uds/components/<id>/
  <id>.css                # token-only compatibility/stub CSS
  spec.json               # contract (props, events, slots, states, a11y, knownIssues, ...)
  status.json             # lifecycle state
  changelog.json          # per-component history
  impl.json               # Code-tab Implementation Reference data ({ jsFunc, jsFile, tokens, html })
  playground.js           # default-export of { controls, render }
  examples/
    manifest.json
    *.html
```

The legacy `PLAYGROUNDS`, `IMPL_DATA`, and `demo-builder.js` ZIP-file-list
tables in the legacy `docs/app.js` no longer exist; every spec field is
sourced from `uds/components/<id>/spec.json` and rendered by the
per-component React renderer.

## Non-negotiable rule

Do not update a component spec from a screenshot. Screenshots are supporting
evidence only. The source of truth is:

- component-set variant properties
- layer tree
- hidden / visible layers
- nested instances
- token bindings
- auto-layout and sizing metadata
- current doc-site JSON / CSS / examples / impl / playground

## Component contract baseline

Every sync must apply
[`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc) before
writing files. Classify the component (`layout`, `display`, `action`, `form`,
`navigation`, `feedback`, or `data`), then compare the Figma inspection and
current docs against the standard state/API/accessibility/playground baseline.

Report gaps explicitly:

- high-confidence supported states become `states[]`, props, examples,
  playground controls, Web Component behavior, and React wrapper props.
- unsupported states become `notApplicable` findings with a reason.
- ambiguous, missing, removed, or potentially-breaking states follow
  `uds-figma-change-classification.mdc` and default to ask-user/stop.

Do not backfill missing states from intuition. If Figma does not define focus,
error, selected, expanded, etc., report the baseline gap instead of inventing
the behavior.

## Inputs

Ask for the component id if it is not clear from the prompt.

Inputs:

- component id, e.g. `button`, `dropdown`, `data-table`
- optional mode:
  - `dry run` (default recommended)
  - `apply`

## Procedure

### 1. Run Figma preflight

Follow `.cursor/rules/uds-figma-preflight.mdc`.

### 2. Run `figma-component-inspector`

Ask the read-only agent to inspect exactly one component and return:

- located nodes
- canonical component set
- variant matrix
- anatomy
- nested UDS components
- token bindings
- hardcoded values
- accessibility implications
- doc-site comparison
- confidence score

If confidence is low, stop and ask the user.

### 3. Classify changes

Use `.cursor/rules/uds-figma-change-classification.mdc`.

Never auto-apply:

- removed variants
- renamed required props
- component split/merge
- ambiguous canonical node
- hardcoded Figma value changes without token binding

### 4. Classify implementation readiness

Before proposing writes, classify the component:

- `implementation-ready`: Figma exposes a component set, variant matrix, node
  tree, anatomy, and enough token / layer information to generate reference
  docs.
- `placeholder-only`: Figma has a public page but no inspectable component set
  or not enough structure to generate reference docs.
- `internal-support`: Figma node is a low-level support component and should
  not become a public docs page unless explicitly requested.

For UDS release sync, `implementation-ready` components must update more than
JSON. See the "Build proposed docs/code patch" table below.

### 5. Build proposed JSON patch

Map inspector output to schema fields in `uds-docs/uds/components/<id>/spec.json`
(schema: `uds-docs/uds/schemas/spec.schema.json`):

| Inspector finding | spec.json field |
|---|---|
| variant properties / instance-level booleans | `props[]` |
| factory-contract `Props (behavioral)` (no Figma property — e.g. `selectable`) | `props[]` |
| emitted interactions | `events[]` |
| anatomy / content regions | `slots[]` |
| variant states (default / hover / focused / disabled / selected / open / ...) | `states[]` |
| explicit behavior expectations | `acceptanceCriteria[]` |
| text rules | `contentGuidelines` |
| nested instances | `commonlyPairedWith[]` (component IDs) |
| do/don't guidance | `dosDonts` |
| keyboard / SR / WCAG | `accessibility.*` |
| unresolved Figma/doc mismatches | `knownIssues[]` |
| canonical component set node | `figmaNodeId` |
| component page node | `figmaPageNodeId` |

Do not overwrite non-empty fields with lower-confidence text. Additions are
preferred over rewrites.

**Factory-contract source.** When the inspector reports fields sourced
from a `factory-contract` block — the `generate-uds-figma-component`
factory wrote the component's non-drawable contract into its Figma
description — treat those `events[]`, `slots[]`, `parts`, behavioral
`props[]` (from the block's `Props (behavioral, non-drawable)` section,
e.g. `selectable`), `accessibility.*`, `states[]`, and
`acceptanceCriteria[]` values as high-confidence authored input, not
intuition. On a first sync of a
factory-drafted component these are usually the ONLY source for
events / parts / keyboard (there is no Web Component source yet), and
landing them is the round-trip the factory was designed for. Still
classify per `uds-figma-change-classification.mdc`: additions are
non-breaking and auto-apply at high confidence; anything that would
remove or rename an existing field follows the normal ask-user path.

### 5.5. Build proposed removals (REVERSE MAPPING — mandatory)

Consume the inspector's `Doc-site surplus` table and `Snapshot delta`
section. For each `unattested-by-figma` artifact and each prior-only
nestedInstance / variantProperty / variant-value, produce a removal
proposal. Every row carries the full classification finding shape from
`.cursor/rules/uds-figma-change-classification.mdc` — `Confidence` /
`Risk` / `Reason` / `Default action`:

**Do not propose removing a field the inspector tagged `attested` via
the factory-contract block.** A behavioral prop (`selectable`) or a
contract-declared event / slot / state that has no variant property and
no Web Component source yet is still attested (Figma authored it into
the contract block) — it is NOT surplus. Proposing its removal would
undo exactly what the prior sync landed. Only act on entries the
inspector tagged `unattested-by-figma`.

| Surplus finding | File change | Risk class |
|---|---|---|
| `spec.json` `slots[]` entry with no Figma counterpart | Remove from `slots[]` | `potentially-breaking` |
| `spec.json` `events[]` entry with no Figma counterpart | Remove from `events[]` | `potentially-breaking` |
| `spec.json` `states[]` entry with no Figma counterpart | Remove from `states[]` | `potentially-breaking` |
| `spec.json` `props[]` entry with no Figma counterpart | Remove from `props[]` | `potentially-breaking` |
| `spec.json` `acceptanceCriteria[]` mentioning a removed concept | Remove from `acceptanceCriteria[]` | `non-breaking` |
| retained `.udc-<id>*` selector unattested in Figma AND no example/impl/playground reference | Remove rule from `<id>.css` | `potentially-breaking` |
| Example file unattested in Figma | Delete `examples/<file>.html` + remove `manifest.json` entry | `destructive` |
| Web Component public event/prop/slot/part whose Figma counterpart no longer exists | Propose removing or deprecating it in `@uds/web-components` and the `@uds/react` wrapper | `potentially-breaking` |
| `impl.json` `html` references a removed selector | Regenerate `html` for the post-removal anatomy | `non-breaking` if every removed selector is also a surplus finding, else `potentially-breaking` |
| `impl.json` `tokens` group references a token that's no longer in any retained CSS rule | Trim the token from `impl.json` `tokens` | `non-breaking` |
| `playground.js` control with no surviving Figma prop or no matching Web Component API surface | Remove control + corresponding `render()` branch | `potentially-breaking` |
| Code-tab API data row in `uds-docs/data/component-api/<id>.ts` paired with a surplus API surface | Remove the row | `non-breaking` |
| `nestedInstance.name` in `Snapshot delta` "removed" list AND matching `commonlyPairedWith[]` entry that is no longer attested | Remove from `spec.json` `commonlyPairedWith[]` | `non-breaking` |

Also list any `scripts/audit-baseline.json` allow-list entries for this
component that should be REMOVED after the cleanup completes (so future
drift fails CI for real). The most common one is
`audit-css-api-table.toleratedComponents`.

Per `uds-figma-change-classification.mdc` §"Auto-apply policy":

- `non-breaking` + high confidence  → auto-apply allowed
- `potentially-breaking`            → ask user
- `destructive`                     → stop and ask user

This step MUST run on every component sync. If the inspector report is
missing the `Doc-site surplus` or `Snapshot delta` sections, the sync
skill must stop and re-run the inspector — never silently skip.

### 5.6. Build proposed figmanotes update (mandatory)

Consume the inspector's `Figma Notes evaluation` section (see
`.cursor/agents/figma-component-inspector.md` §7c). Produce:

- **Auto-prune list** — note ids the inspector flagged as resolved. The
  apply step removes them from `figmanotes.json` `notes[]`.
- **Add list** — new notes the inspector proposed (with `id`, `kind`,
  `title`, `summary`, `decisionNeeded`, `figmaRefs`, `autoPruneWhen`,
  `raisedBy`, `raisedOn`). The apply step appends them.

If the proposed-new note `id` is already in the existing
`figmanotes.json`, treat it as a no-op (don't add duplicate). Re-emit
the note in the dry-run report so the reviewer can confirm the existing
one still applies.

Auto-prune is `non-breaking` + high-confidence by definition (the
condition is met) and auto-applies. Adding a new note is also
`non-breaking` and auto-applies — surfacing a finding doesn't change
the doc-site surface; it just makes the open question visible.

If the inspector report is missing the `Figma Notes evaluation`
section, the sync skill must stop and re-run the inspector — never
silently skip.

### 6. Build proposed docs/code patch

For `implementation-ready` components, also propose updates to:

| Inspector finding | Per-component file |
|---|---|
| primary / default variants | `examples/<variant>.html` + `examples/manifest.json` |
| anatomy HTML | `impl.json` `html` field |
| CSS tokens consumed | `impl.json` `tokens` groups |
| Web Component public API and behavior | `packages/uds-web-components/src/components/<id>.ts` |
| React wrapper prop/event mapping | `packages/uds-react/src/index.tsx` |
| token payload/stub CSS | `uds/components/<id>/<id>.css` |
| controls that can vary safely | `playground.js` default-export `controls` array |
| playground rendered output | `playground.js` `render(state)` function (must return `{ html, code }`) |
| demo suitability | `examples/manifest.json` `demoWeight` / `showInDocs` per example |

Do not generate a second React implementation. Production behavior lives in
`@uds/web-components`; `@uds/react` is a wrapper around the same custom element.

Do not edit any React component or page file for component-specific
data — there are no
`PLAYGROUNDS`, `IMPL_DATA`, or `FIGMA_LINKS` tables there anymore. Every
component-data fetch in the Next app routes through `lib/uds-data.ts` to the
per-component file, and runtime examples/playgrounds render real `<udc-*>`
elements.

### 7. Dry-run output

If dry-run mode, output:

```markdown
# Proposed Component Spec Sync

## Component
...

## Confidence
...

## Implementation readiness
...

## Would update (per-component files)
- spec.json: field: old \u2192 new summary
- <id>.css: change summary
- examples/*.html: which files
- impl.json: tokens + html updates
- playground.js: controls + render changes
- examples/manifest.json: new/changed entries

## Would remove (from step 5.5)
| Artifact | File change | Confidence | Risk | Default action |
|---|---|---|---|---|

(One row per surplus finding + per snapshot-delta removal. If no
removals, state `No removals proposed.` explicitly \u2014 do NOT omit the
section, that's the silent-deletion bug class.)

## Would update figmanotes.json (from step 5.6)
- Auto-prune (resolved): id1, id2, ...   (or `none`)
- Add new notes:        id3, id4, ...    (or `none`)

(If both are empty, state `No figmanotes.json changes proposed.`
explicitly. Auto-prune + new-add are non-breaking and apply
automatically without confirmation.)

## Would re-tighten audits
- scripts/audit-baseline.json: remove "<comp-id>" from <audit>.tolerated... (if applicable)

## Blocked / needs user
...
```

Stop without editing.

### 8. Apply mode

Preconditions before any apply:

- Removals from step 5.5 are NEVER auto-applied. Every
  `potentially-breaking` removal requires explicit user confirmation
  ("apply removals" / "yes, remove the bento" / similar). Every
  `destructive` removal (file deletion) requires it twice \u2014 once for
  the proposal, once for the apply.
- If the inspector report did not include `Doc-site surplus` or
  `Snapshot delta` sections, stop here and re-run the inspector. Do not
  apply with an incomplete inspection.
- If applying both updates AND removals in the same run, apply removals
  first so the additions land on a clean baseline (avoids transient
  states where a deleted slot is briefly co-present with a new one of
  the same name).

If applying:

1. Apply the edits in this order:
2. For `implementation-ready` components, update files under
   `uds/components/<id>/` and the matching Web Component / React wrapper source
   per the table in step 6 \u2014 spec.json, payload CSS, examples, impl.json,
   playground.js, figmanotes.json, Web Component source, and React wrapper \u2014 as
   applicable. Match Figma bindings verbatim. Apply step 5.5 removals
   into the same files (deletions, retained CSS-rule removals, manifest trims,
   Web Component API removals, wrapper trims).
   Apply step 5.6 figmanotes updates: remove resolved notes from
   `figmanotes.json` `notes[]`; append new notes. If `figmanotes.json`
   doesn't exist yet and there are notes to add, create it from the
   schema-conformant template. If it ends up empty after pruning,
   delete the file (the doc-site UI hides the tab when 404).
3. For `placeholder-only` components, update `knownIssues` and visible docs
   so the reason is explicit; do not add demo coverage or fabricate examples.
4. Add a per-component `changelog.json` entry for THIS UDS version for each
   logical change. One entry per field group at minimum (one for the
   figmaNodeId fix, one for the spec content additions, one per drift fix,
   etc.). Without entries here the `audit-changelog-currency.sh` will fail
   CI; without aggregation the `audit-aggregate-currency.sh` will fail.
5. Run `bash scripts/aggregate-changelog.sh` to refresh `uds/CHANGELOG.json`.
6. Update `.cursor/figma/state/components.snapshot.json` \u2014 set the
   component's `componentSetNodeId`, `defaultVariantNodeId`,
   `variantProperties`, and `nestedInstances` to the values captured by the
   inspector. Bump `.cursor/figma/state/last-sync.json` `lastSuccessfulSync`
   and recompute `components.snapshotChecksum`.
7. Add or update the `SITE_CHANGELOG` entry in `uds-docs/data/site-changelog.ts`.
8. No manual cache busting is required; Cloudflare headers and Next static
   asset hashes handle deploy freshness.
9. If step 5.5 listed `scripts/audit-baseline.json` allow-list entries
   to remove (e.g. the component's id under
   `audit-css-api-table.toleratedComponents`), remove them in the same
   commit as the CSS + API-table edits so CI does not pass on stale
   tolerance.
10. After commit + push + deploy, the next required step (per
    `.cursor/rules/uds-release-workflow.mdc` "Changelog Sync Rule") is to run
    `sync-figma-release-notes` so both UDS Figma files' Release Notes frames
    match the updated `uds/CHANGELOG.json`.
11. Visual-check Examples, Code, Guidelines, and Playground on the affected
    component page.

The Phase 5 finalize checklist in `.cursor/rules/uds-master-preflight.mdc` is
the canonical round-trip checklist; steps 4\u20139 above are this skill's
specialization of it.

## Output

Report:

- component updated
- fields changed (per spec.json + per-component file)
- skipped lower-confidence fields
- per-component changelog entries added
- snapshot updated
- visual verification result
- deploy status
- Figma Release Notes sync queued: yes/no
