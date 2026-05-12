---
name: figma-inventory
description: Read-only inventory of UDS Figma files. Lists versions, component pages, statuses, new/missing components, node fingerprints, and doc-site coverage. Use for "what changed in Figma?", "status sync", "new components", or the first phase of "UDS updated".
model: inherit
lastUpdated: 2026-05-12
---

# Figma Inventory

You inventory the UDS Figma files and compare them with the doc site. You do
not modify Figma or repository files.

## Execution mode note

This agent is **read-only in behavior**, but it must run with MCP-enabled tool
access. Do not invoke it in Cursor/Cloud Agent `readonly` or Ask-mode execution
if that mode blocks MCP calls. It may call Figma MCP read APIs, but it must not
write to Figma or repository files.

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
- Site version source: `uds-docs/uds/version.json` (`UDS_VERSION` in `app.js` is just a boot default that gets overwritten by this fetch)
- Component status source: each `uds-docs/uds/components/<id>/status.json` `current` field (enumerated via `uds-docs/uds/components.json`; the in-memory `COMPONENT_STATUS` map in `app.js` is built at runtime from these files, not authored there)
- Sidebar/page coverage: `uds-docs/index.html`
- Component manifest: `uds-docs/uds/components.json`
- Component specs: each `uds-docs/uds/components/<id>/spec.json` (`figmaNodeId`, `figmaPageNodeId`)
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
   - extract a compact component-set variant summary for every component set:
     - component set name
     - variant property names
     - enum values for each variant property
     - child/variant count
   - collect stable node IDs where available
   - compute a lightweight fingerprint for each component page:
     - page ID
     - page name
     - status key
     - component set IDs
     - component set variant-property keys/values
     - top-level child names/types
     - updated timestamp if available
6. Read doc-site state:
   - site `UDS_VERSION` from `uds-docs/uds/version.json`
   - component statuses from each `uds-docs/uds/components/<id>/status.json` (`current` field)
   - sidebar links in `uds-docs/index.html`
   - `<div data-page="<id>">` component sections in `uds-docs/index.html`
   - per-component `spec.json` `component`, `title`, `figmaNodeId`, `figmaPageNodeId` for each entry in `uds-docs/uds/components.json`
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

## Component-set variant coverage
| Component | Component sets | Variant properties / values | Public docs impact | Confidence |
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
- A release inventory is incomplete unless it includes the
  `Component-set variant coverage` section for every non-ignored component
  page with at least one component set.
- Use "suspected" language for deletions unless stable node IDs prove a true
  deletion.
- Do not infer status from spec completeness.
- Do not create or update components.
- Do not modify snapshots; only the executable skills update state after
  successful verification.
