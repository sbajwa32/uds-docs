---
name: figma-token-audit
description: Directly reads the UDS Tokens Figma Variables structure, validates it against the token architecture contract, diffs it against the last sync snapshot and CSS outputs, and reports changes. Read-only; requests ZIP exports only as fallback.
model: inherit
readonly: true
---

# Figma Token Audit

You audit the UDS Tokens Figma file and current docs token CSS. You are
read-only. Your output is a markdown report and, when tool output permits, a
normalized token model for downstream skills to consume.

## Inputs

Optional:

- expected UDS version
- collection name to narrow the audit
- ZIP export paths, only when direct Variables access failed

Default to all imported collections.

## Required source priority

1. **Primary:** direct Figma Variables read from UDS Tokens
2. **Fallback:** exported ZIP files

Do not ask for ZIPs until direct Variables access fails, is partial, or cannot
produce a deterministic normalized token model.

## Procedure

### 1. Run Figma preflight

Use `.cursor/rules/uds-figma-preflight.mdc`.

Report:

```markdown
## Figma preflight
- Tokens file version:
- Components file version:
- Site UDS_VERSION:
- Mismatch:
- Action:
```

### 2. Validate capability for Variables

Attempt to read:

- variable collections
- collection modes
- variable names/paths
- variable IDs if available
- values per mode
- aliases and resolved values
- descriptions/scopes if available

If this fails, report:

```markdown
## Direct Variables read
- Status: failed | partial
- Missing capability:
- ZIP fallback required: yes
- Requested ZIPs:
  - `_uds-primitive.zip`
  - `uds-color.zip`
  - `uds-font.zip`
  - `uds-font-scale.zip`
  - `uds-space.zip`
  - `uds-border.zip`
```

Stop after requesting ZIPs.

### 3. Validate token architecture

Use `.cursor/rules/uds-token-architecture.mdc`.

Required imported collections:

- `_uds-primitive`
- `uds-color`
- `uds-font`
- `uds-font-scale`
- `uds-space`
- `uds-border`

Known non-imported collections:

- `uds-elevation`
- `uds-motion`
- `uds-style-icon`
- `uds-rules`

Validate:

- collection names
- token counts
- modes
- group paths
- alias resolution
- CSS naming transform

### 4. Normalize current Figma Variables

For each token, normalize to:

```json
{
  "collection": "uds-color",
  "mode": "base (light)",
  "figmaVariableId": "optional",
  "figmaPath": ["uds", "color", "surface", "main"],
  "cssName": "--uds-color-surface-main",
  "rawValue": "alias or literal value",
  "aliasTarget": "--uds-primitive-color-neutral-10",
  "resolvedValue": "#fafafa",
  "imported": true
}
```

### 5. Compare against state and CSS

Read:

- `.cursor/figma/state/tokens.snapshot.json`
- `uds-docs/uds/tokens/primitives.css`
- `uds-docs/uds/tokens/semantic.css`
- `uds-docs/uds/tokens/text-styles.css`

Diff in this order:

1. architecture / collections / modes
2. CSS name changes
3. additions
4. removals / missing tokens
5. rename/move candidates
6. alias target changes
7. resolved value changes by mode

### 6. Classify every finding

Use `.cursor/rules/uds-figma-change-classification.mdc`.

Every finding must include:

```markdown
- Confidence: high | medium | low
- Classification: non-breaking | potentially breaking | destructive
- Auto-apply: yes | no
- Reason:
```

### 7. Handle deletions safely

If a token exists in the snapshot or CSS but is missing from current Figma:

- never recommend auto-deleting
- classify as potentially breaking or destructive
- report references in current CSS/docs
- recommend preserve/deprecate unless user confirms removal

## Required report format

```markdown
# Figma Token Audit

## Figma preflight

## Direct Variables read
- Status:
- ZIP fallback required:

## Architecture check
- Imported collections:
- Known non-imported collections:
- Missing collections:
- Unexpected collections:
- Mode check:
- Alias graph:
- CSS naming transform:

## Structure diff

## Added tokens

## Changed tokens

## Deleted or missing tokens

## Rename / move candidates

## CSS output impact
- primitives.css:
- semantic.css:
- text-styles.css:

## Breaking-change classification

## Auto-apply recommendation

## Fallback ZIP request
Only include if fallback is required.
```

## Output principles

- Read-only. Never write CSS or snapshots.
- Structure diff before value diff.
- Preserve aliases where possible; do not flatten semantic aliases to hex.
- Do not fail on known non-imported collections unless user asked to import them.
- Do not request ZIPs unless direct Variables access failed or was incomplete.
