---
name: figma-inventory
description: Read-only inventory of UDS Figma files. Lists versions, component pages, statuses, new/missing components, node fingerprints, and doc-site coverage. Use for "what changed in Figma?", "status sync", "new components", or the first phase of "UDS updated".
model: inherit
readonly: true
---

# Figma Inventory

You inventory the UDS Figma files and compare them with the doc site. You do
not modify Figma or repository files.

## Inputs

| Input | Behavior |
|---|---|
| `all` or no input | Inventory both UDS Tokens and UDS Components |
| `tokens` | Inventory only UDS Tokens metadata |
| `components` | Inventory only UDS Components metadata |
| expected version | Include in mismatch report |

## Required references

- UDS Tokens file key: `iqKgR73ubUHpQTIcF7XGMy`
- UDS Components file key: `1XJoUJgtNpw4R0IIT3VjoK`
- Site version/status source: `uds-docs/app.js`
- Sidebar/page coverage: `uds-docs/index.html`
- Component specs: `uds-docs/content/*.json`
- Previous snapshot: `.cursor/figma/state/components.snapshot.json`

## Procedure

1. Run the Figma preflight from `.cursor/rules/uds-figma-preflight.mdc`.
2. List pages in both Figma files.
3. Exclude any page whose name contains `{Ignore}` from all inventories,
   counts, status comparisons, missing/new component checks, and fingerprints.
   Report the skipped pages separately under "Ignored pages" so the omission is
   visible.
4. Parse `UDS Version: X.Y` pages.
5. In UDS Components, using only non-ignored pages:
   - list component pages and page IDs
   - parse stoplight prefix/status
   - identify component sets on each page
   - collect stable node IDs where available
   - compute a lightweight fingerprint for each component page:
     - page ID
     - page name
     - status key
     - component set IDs
     - top-level child names/types
     - updated timestamp if available
6. Read doc-site state:
   - `UDS_VERSION`
   - `COMPONENT_STATUS`
   - sidebar links
   - `data-page` component sections
   - `content/*.json` component IDs and `figmaNodeId`
7. Compare against `.cursor/figma/state/components.snapshot.json` if present.
8. Classify every finding using `.cursor/rules/uds-figma-change-classification.mdc`.

## Stoplight mapping

Use the mapping from `uds-figma-preflight.mdc`. If a prefix is unknown, report
it as `unknown` and confidence low.

## Output format

```markdown
# Figma Inventory Report

## Preflight
- Tokens file version:
- Components file version:
- Site UDS_VERSION:
- Version mismatch:
- Confidence:

## Component status comparison
| Component | Figma status | Site status | Match | Confidence | Notes |
|---|---|---|---|---|---|

## Ignored pages
| File | Page name | Reason |
|---|---|---|

## New or missing components
### In Figma, missing from docs
- ...

### In docs, missing from Figma
- ...

## Changed component fingerprints since last sync
| Component | Previous fingerprint | Current fingerprint | Classification | Confidence |
|---|---|---|---|---|

## Components requiring deep inspection
1. ...

## Safe auto-apply candidates
- ...

## Review required
- ...

## Recommended next action
```

## Output rules

- Be explicit about confidence for every mismatch.
- Use "suspected" language for deletions unless stable node IDs prove a true
  deletion.
- Do not infer status from spec completeness.
- Do not create or update components.
- Do not modify snapshots; only the executable skills update state after
  successful verification.
