---
name: link-figma-nodes
description: Populate figmaNodeId and figmaPageNodeId fields in per-component spec.json files from canonical UDS Components Figma nodes. Use when Figma deep links are missing or stale.
lastUpdated: 2026-05-27T22:21:24Z
---

# Link Figma Nodes

Adds stable Figma node deep links to `uds-docs/uds/components/<id>/spec.json`.

This skill exists because `figmaNodeId` (variant-level) and `figmaPageNodeId`
(page-level fallback) are fast, high-value completeness fields but it is
unsafe to guess when multiple nodes match a component name.

After Phase 13 of the repo restructure, the legacy `FIGMA_LINKS` table in
`docs/app.js` no longer exists. The "Figma" deep-link button on each component
docs page is built at runtime from `spec.json.figmaNodeId` (preferred) with
`spec.json.figmaPageNodeId` as fallback. Editing `spec.json` is the only
correct way to update these links.

## Inputs

| Input | Behavior |
|---|---|
| component ID | Link one component |
| `all` / omitted | Audit all missing or stale `figmaNodeId` fields |

## Required preflight

1. Apply `.cursor/rules/uds-figma-preflight.mdc`.
2. Apply `.cursor/rules/uds-figma-component-inspection.mdc`.
3. Apply `.cursor/rules/uds-figma-change-classification.mdc`.
4. Run `figma-spec-gap`.
5. For every component that may be updated, run `figma-component-inspector`.

## Node selection policy

For `figmaNodeId` (variant deep link), prefer in order:

1. Canonical component set node.
2. Canonical default variant node.
3. Page-level component frame, only when no component set exists.

`figmaPageNodeId` always points at the component's Figma page node, never a
variant or frame.

Do not use:

- random rendered example frames
- screenshots
- hidden scratch layers
- ambiguous name matches
- nodes from a different Figma file
- sub-component nodes (e.g. `_udc-nav-header_title-area`) when a canonical
  parent set exists. Pointing `figmaNodeId` at a sub-component sends docs
  users to the wrong place \u2014 this is the failure mode that motivated
  the nav-header re-sync (commit `c656da7`).

## Workflow

### 1. Build proposal table

Return this before writing:

```markdown
| Component | Current figmaNodeId | Current figmaPageNodeId | Proposed nodeId | Proposed pageNodeId | Node type | Confidence | Reason |
|---|---|---|---|---|---|---|---|
| button | null | null | 123:456 | 100:200 | COMPONENT_SET | high | Exact component set name `udc-button` on page `\ud83d\udfe1 button` |
```

### 2. Apply only high-confidence additions

Auto-apply only when:

- current `figmaNodeId` is `null`
- proposed node confidence is `high`
- node is canonical and unambiguous

Ask before:

- overwriting a non-null `figmaNodeId` (even when the existing value is
  provably wrong \u2014 the user needs to know which deep link is changing)
- choosing between multiple possible nodes
- linking to a frame rather than a component / component-set node

### 3. Apply the doc edits

1. Update `figmaNodeId` and/or `figmaPageNodeId` in
   `uds-docs/uds/components/<id>/spec.json`. Do NOT modify any other field
   in `spec.json` in this skill.
2. Add a per-component `changelog.json` entry for each component whose
   deep link changed:
   - If `figmaNodeId` was `null` and is now set: `{ "type": "added", "text": "figmaNodeId pinned to <new> after deep inspection." }`.
   - If `figmaNodeId` was non-null and was overwritten: `{ "type": "fixed", "text": "figmaNodeId corrected from <old> (sub-component / wrong node) to <new> (canonical <name>)." }`.
   This is a real contract change \u2014 every "Open in Figma" deep link
   from the docs page lands somewhere different. Treat it as such.
3. Run `bash scripts/aggregate-changelog.sh` to refresh `uds/CHANGELOG.json`.
4. Update `.cursor/figma/state/components.snapshot.json` \u2014 set the
   affected component's `componentSetNodeId` (and `pageNodeId` if changed)
   to match the new spec.json values. Bump
   `.cursor/figma/state/last-sync.json` `lastSuccessfulSync` and recompute
   `components.snapshotChecksum`. (`scripts/audit-figma-sync-state-currency.sh`
   will fail CI if you skip this step.)
5. Add a `SITE_CHANGELOG` entry in `uds-docs/data/site-changelog.ts`.
6. No manual cache busting is required; Cloudflare headers and Next static
   asset hashes handle deploy freshness.
7. Visual-check that the "Figma" page-link button on each affected docs
   page deep-links to the correct node in Figma.
8. Commit and push.

The Phase 5 finalize checklist in `.cursor/rules/uds-master-preflight.mdc`
is the canonical round-trip checklist; steps 2\u20137 above are this skill's
specialization of it.

## Output

```markdown
# Figma Node Link Sync

## Updated
| Component | Field | Old | New | changelog.json entry | snapshot updated |

## Skipped
- component: reason

## Ambiguous / needs user
- component: candidate nodes
```

## Do not

- Do not infer a node ID from screenshots.
- Do not overwrite non-null links silently \u2014 always ask first, even if
  the existing value is clearly wrong.
- Do not modify component specs beyond `figmaNodeId` and `figmaPageNodeId`.
- Do not point `figmaNodeId` at a sub-component when a canonical parent set
  exists.
- Do not skip the per-component `changelog.json` entry. Correcting a wrong
  `figmaNodeId` is a `fixed` change worth recording, not a silent no-op.
