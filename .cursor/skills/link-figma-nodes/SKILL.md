---
name: link-figma-nodes
description: Populate figmaNodeId fields in UDS component JSON specs from canonical UDS Components Figma nodes. Use when Figma deep links are missing or stale.
---

# Link Figma Nodes

Adds stable Figma node deep links to `uds-docs/content/<component>.json`.

This skill exists because `figmaNodeId` is a fast, high-value completeness field
but it is unsafe to guess when multiple nodes match a component name.

## Inputs

| Input | Behavior |
|---|---|
| component ID | Link one component |
| `all` / omitted | Audit all missing `figmaNodeId` fields |

## Required preflight

1. Apply `.cursor/rules/uds-figma-preflight.mdc`.
2. Apply `.cursor/rules/uds-figma-component-inspection.mdc`.
3. Apply `.cursor/rules/uds-figma-change-classification.mdc`.
4. Run `figma-spec-gap`.
5. For every component that may be updated, run `figma-component-inspector`.

## Node selection policy

Prefer in order:

1. Canonical component set node.
2. Canonical default variant node.
3. Page-level component frame, only when no component set exists.

Do not use:

- random rendered example frames
- screenshots
- hidden scratch layers
- ambiguous name matches
- nodes from a different Figma file

## Workflow

### 1. Build proposal table

Return this before writing:

```markdown
| Component | Current figmaNodeId | Proposed node | Node type | Confidence | Reason |
|---|---|---|---|---|---|
| button | null | 123:456 | COMPONENT_SET | high | Exact component set name `Button` |
```

### 2. Apply only high-confidence additions

Auto-apply only when:

- current `figmaNodeId` is null
- proposed node confidence is high
- node is canonical and unambiguous

Ask before:

- overwriting a non-null `figmaNodeId`
- choosing between multiple possible nodes
- linking to a frame rather than a component/component-set node

### 3. Bump-first for doc edits

Before editing `uds-docs/`:

```bash
bash uds-docs/bump-site.sh
```

Then:

1. Update only `figmaNodeId` fields in `content/*.json`.
2. Add a SITE_CHANGELOG entry.
3. Cache-bust `app.js` if needed only when app code changed (usually no).
4. Visual-check that page link buttons now deep-link correctly.
5. Commit and push directly to `main`.

## Output

```markdown
# Figma Node Link Sync

## Updated
- component: old -> new

## Skipped
- component: reason

## Ambiguous / needs user
- component: candidate nodes
```

## Do not

- Do not infer a node ID from screenshots.
- Do not overwrite non-null links silently.
- Do not modify component specs beyond `figmaNodeId`.
- Do not mark this as a component release unless component behavior changed.
