---
name: sync-figma-component-spec
description: Update a UDS component spec from a deep Figma component inspection. Use for prompts like "sync Button from Figma", "update Dropdown spec from Figma", or after figma-component-inspector reports high-confidence changes.
---

# Sync Figma Component Spec

This skill updates a component's doc-site surface from the UDS Components Figma
file, but only after a deep node-tree inspection. It is the write step that
consumes `figma-component-inspector`.

## Non-negotiable rule

Do not update a component spec from a screenshot. Screenshots are supporting evidence only. The source of truth is:

- component-set variant properties
- layer tree
- hidden/visible layers
- nested instances
- token bindings
- auto-layout and sizing metadata
- current doc-site JSON/CSS/examples

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
  tree, anatomy, and enough token/layer information to generate reference docs.
- `placeholder-only`: Figma has a public page but no inspectable component set
  or not enough structure to generate reference docs.
- `internal-support`: Figma node is a low-level support component and should not
  become a public docs page unless explicitly requested.

For UDS release sync, `implementation-ready` components must update more than
JSON. They should receive Examples, Code, token-first CSS, Implementation
Reference, Playground when useful, ZIP file-list coverage, and Demo Builder
templates where applicable.

### 5. Build proposed JSON patch

Map inspector output to schema fields:

| Inspector finding | JSON field |
|---|---|
| variant properties / layer attributes | `props[]` |
| emitted interactions | `events[]` |
| anatomy / content regions | `slots[]` |
| variant states | `states[]` |
| explicit behavior expectations | `acceptanceCriteria[]` |
| text rules | `contentGuidelines` |
| nested instances | `commonlyPairedWith[]` |
| do/don't guidance | `dosDonts` |
| keyboard / SR / WCAG | `accessibility.*` |
| unresolved Figma/doc mismatches | `knownIssues[]` |
| canonical node | `figmaNodeId` |

Do not overwrite non-empty fields with lower-confidence text.

### 6. Build proposed docs/code patch

For `implementation-ready` components, also propose:

| Inspector finding | Doc-site output |
|---|---|
| primary/default variants | Examples tab |
| HTML anatomy | Code tab |
| component classes and states | `uds/components/<component>.css` |
| controls that can vary safely | `PLAYGROUNDS` entry |
| implementation reference | `IMPL_DATA` entry |
| demo suitability | `demo-builder.js` template and component picker entry |
| distributable CSS | ZIP file list in `app.js` |

Do not generate production framework code. The docs site remains vanilla
HTML/CSS/JS reference only.

### 7. Dry-run output

If dry-run mode, output:

```markdown
# Proposed Component Spec Sync

## Component
...

## Confidence
...

## Would update
- field: old → new summary

## Blocked / needs user
...
```

Stop without editing.

### 8. Apply mode

If applying:

1. Run `bash uds-docs/bump-site.sh` before edits.
2. For `implementation-ready` components, update JSON, Examples, Code, CSS,
   Implementation Reference, Playground/Demo Builder, and ZIP file list as
   applicable.
3. For `placeholder-only` components, update `knownIssues` and visible docs so
   the reason is explicit; do not add Demo Builder entries.
4. Add or update the `SITE_CHANGELOG` entry.
5. Cache-bust changed assets.
6. Visual-check Examples, Code, Guidelines, and Demo Builder if affected.
7. Commit and push directly to `main`.

## Output

Report:

- component updated
- fields changed
- skipped lower-confidence fields
- visual verification result
- deploy status

