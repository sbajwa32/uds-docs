---
name: sync-figma-component-spec
description: Update a UDS component spec from a deep Figma component inspection. Use for prompts like "sync Button from Figma", "update Dropdown spec from Figma", or after figma-component-inspector reports high-confidence changes.
---

# Sync Figma Component Spec

This skill updates `uds-docs/content/<component>.json` from the UDS Components Figma file, but only after a deep node-tree inspection. It is the write step that consumes `figma-component-inspector`.

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

### 4. Build proposed JSON patch

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

### 5. Dry-run output

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

### 6. Apply mode

If applying:

1. Run `bash uds-docs/bump-site.sh` before edits.
2. Edit only `uds-docs/content/<component>.json` unless the user explicitly asked for examples/code/CSS updates too.
3. Add or update the `SITE_CHANGELOG` entry.
4. Cache-bust `app.js` if it changed.
5. Visual-check the component Guidelines tab.
6. Commit and push directly to `main`.

## Output

Report:

- component updated
- fields changed
- skipped lower-confidence fields
- visual verification result
- deploy status

