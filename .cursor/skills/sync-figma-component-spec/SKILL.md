---
name: sync-figma-component-spec
description: Update a UDS component's per-component artifacts (spec.json, CSS, examples, impl.json, playground.js) from a deep Figma component inspection. Use for prompts like "sync Button from Figma" or after figma-component-inspector reports high-confidence changes.
lastUpdated: 2026-05-12
---

# Sync Figma Component Spec

This skill updates a component's doc-site surface from the UDS Components Figma
file, but only after a deep node-tree inspection. It is the write step that
consumes `figma-component-inspector`.

After Phase 13 of the repo restructure, every per-component artifact lives in
`uds-docs/uds/components/<id>/`:

```
uds-docs/uds/components/<id>/
  <id>.css                # token-first component CSS
  <id>.js                 # optional interactive behavior
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
tables in `docs/app.js` no longer exist; everything is per-component now.

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

### 6. Build proposed docs/code patch

For `implementation-ready` components, also propose updates to:

| Inspector finding | Per-component file |
|---|---|
| primary / default variants | `examples/<variant>.html` + `examples/manifest.json` |
| anatomy HTML | `impl.json` `html` field |
| CSS tokens consumed | `impl.json` `tokens` groups |
| JS entry point | `impl.json` `jsFunc` + `jsFile` |
| component classes and states | `uds/components/<id>/<id>.css` |
| controls that can vary safely | `playground.js` default-export `controls` array |
| playground rendered output | `playground.js` `render(state)` function (must return `{ html, code }`) |
| demo suitability | `examples/manifest.json` `demoWeight` / `showInDocs` per example |

Do not generate production framework code. The docs site remains vanilla
HTML/CSS/JS reference only.

Do not edit `docs/app.js` for component-specific data \u2014 there are no
`PLAYGROUNDS`, `IMPL_DATA`, or `FIGMA_LINKS` tables there anymore. Every
component-data fetch in `app.js` routes through `udsResolve()` to the
per-component file.

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

## Blocked / needs user
...
```

Stop without editing.

### 8. Apply mode

If applying:

1. Run `bash uds-docs/bump-site.sh` before edits (preflight).
2. For `implementation-ready` components, update files under
   `uds/components/<id>/` per the table in step 6 \u2014 spec.json, CSS,
   examples, impl.json, playground.js \u2014 as applicable. Match Figma
   bindings verbatim.
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
7. Add or update the `SITE_CHANGELOG` entry in `docs/data/site-changelog.js`.
8. Cache-bust changed assets in `index.html?v=` (`uds.css` if any component
   CSS changed; `uds.js` if any component JS changed; `app.js` if any of its
   imports changed).
9. After commit + push + deploy, the next required step (per
   `.cursor/rules/uds-release-workflow.mdc` "Changelog Sync Rule") is to run
   `sync-figma-release-notes` so both UDS Figma files' Release Notes frames
   match the updated `uds/CHANGELOG.json`.
10. Visual-check Examples, Code, Guidelines, and Playground on the affected
    component page.

The Phase 3 finalize checklist in `.cursor/rules/uds-master-preflight.mdc` is
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
