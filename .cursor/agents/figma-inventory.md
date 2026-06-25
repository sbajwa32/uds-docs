---
name: figma-inventory
description: Read-only inventory of UDS Figma files. Lists versions, component pages, statuses, new/missing components, node fingerprints, and doc-site coverage. Use for "what changed in Figma?", "status sync", "new components", or the first phase of "UDS updated".
model: inherit
lastUpdated: 2026-06-25T21:03:47Z
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
- Site version source: `uds-docs/uds/version.json`
- Component status source: each `uds-docs/uds/components/<id>/status.json` `current` field, enumerated via `uds-docs/uds/components.json`
- Sidebar/page coverage: `uds-docs/components/site/SiteSidebar.tsx` and generated component routes from `uds-docs/uds/components.json`
- Component manifest: `uds-docs/uds/components.json`
- Component specs: each `uds-docs/uds/components/<id>/spec.json` (`figmaNodeId`, `figmaPageNodeId`)
- Previous snapshot: `.cursor/figma/state/components.snapshot.json`
- Factory version: `.cursor/figma/state/factory-version.json` (current `version`, the newest-first `changelog`, and the `labels` registry)

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
   - recognize **families**: a page can host several public `udc-<stem>...`
     member sets (`udc-data-field` + `udc-data-field-group`) that together are
     ONE docs component (the page/stem), not separate components — see
     [`uds-naming-conventions.mdc`](../rules/uds-naming-conventions.mdc) §8.
     Report all member sets under the one component in variant coverage; do NOT
     count secondary members as their own components.
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
  - sidebar links in `uds-docs/components/site/SiteSidebar.tsx`
  - generated component routes from `uds-docs/uds/components.json`
   - per-component `spec.json` `component`, `title`, `figmaNodeId`, `figmaPageNodeId` for each entry in `uds-docs/uds/components.json`
7. Compare against `.cursor/figma/state/components.snapshot.json` if present.
8. **Factory-version drift.** Read the current factory `version`,
   `fVersion`, and `changelog` from
   `.cursor/figma/state/factory-version.json`. For each LIVE component
   (non-`{Ignore}`, non-`{Cursor}`) whose component set carries a
   `factory_version` plugin-data stamp, find its entry in the changelog,
   read that entry's `f` (built F#), and collect the entries with higher
   `f` (`behind = fVersion − builtF`; F# is derived from the stamped
   date — the node carries only the date). Keep a newer entry only if one
   of its `affects[]` labels matches the component's anatomy,
   evaluated with the label's detector from
   [`uds-factory-versioning.mdc`](../rules/uds-factory-versioning.mdc)
   §"How `affects[]` matching works" (the single detector table — match
   against it, don't re-derive a partial copy here). An unstamped live
   component is pre-versioning ("rebuild to assess"). A `{Frozen}` /
   `{NoFactory}` page is reported as behind but marked hands-off — never
   propose an upgrade for it. This pass is read-only and reports; it
   never writes Figma or files. (This is the BATCH, live-only pass.
   Single-component drift for ONE named component — including `{Cursor}`
   drafts, which this pass skips — comes from `figma-component-inspector`
   §3, which matches against the same table.)
9. Classify every finding using `.cursor/rules/uds-figma-change-classification.mdc`.

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

## Factory version drift
| Component | Built (F# · vintage) | Current (F# · bar) | Behind | Applicable changes (affects[] matched) | Frozen? |
|---|---|---|---|---|---|

(One row per live component. `Behind` = currentF − builtF. Unstamped →
"pre-versioning". `{Frozen}` → list applicable changes but mark
hands-off. If none are behind, state "All live components current." If
versioning isn't in use yet, state "Factory versioning not active.")

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
- New/missing is PAGE-keyed: compare page names (the stem / docs id) against
  `uds-docs/uds/components.json`, not individual component sets. A family's
  extra `udc-<stem>...` member sets are part of the one component and must not
  be reported as "missing from docs."
- A release inventory is incomplete unless it includes the
  `Component-set variant coverage` section for every non-ignored component
  page with at least one component set.
- Use "suspected" language for deletions unless stable node IDs prove a true
  deletion.
- Do not infer status from spec completeness.
- Do not create or update components.
- Do not modify snapshots; only the executable skills update state after
  successful verification.
