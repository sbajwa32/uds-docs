---
name: import-figma-tokens
description: Import UDS token changes from the UDS Tokens Figma file. Uses direct Figma Variables reads first and token ZIP exports only as fallback. Writes token CSS only after token-audit passes.
---

# Import Figma Tokens

Use when the user asks to import token changes, sync Figma variables, or when
the `uds-updated` skill delegates token changes to this skill.

## Inputs

- A `figma-token-audit` report.
- The normalized token model from the audit, if direct Figma Variables read
  succeeded.
- Optional fallback ZIP paths only if the audit explicitly says fallback is
  required.

Do not start by asking for ZIPs.

## Required order

### 1. Run / read the token audit

If there is no fresh `figma-token-audit` report, run that read-only agent first.

The audit must include:

- direct Variables read status
- architecture check
- structure diff
- value diff
- confidence
- classification
- fallback ZIP requirement

If the audit reports:

- missing collections
- missing modes
- token deletions
- token renames
- mode removals
- unresolved aliases
- medium/low confidence

stop and ask the user before writing.

### 2. Confirm source

Use source in this order:

1. Direct normalized Figma Variables model.
2. Fallback ZIP normalized model, only if direct read failed.

Never manually type token values into CSS.

### 3. Bump first

Before editing anything under `uds-docs/`, run:

```bash
bash uds-docs/bump-site.sh
```

Use the script output for the `SITE_CHANGELOG` entry.

### 4. Generate CSS deterministically

Regenerate only affected files:

- `_uds-primitive` → `uds-docs/uds/tokens/primitives.css`
- `uds-color`, `uds-font`, `uds-font-scale`, `uds-space`, `uds-border` →
  `uds-docs/uds/tokens/semantic.css`
- text styles → `uds-docs/uds/tokens/text-styles.css`, only if text-style
  mappings changed

Preserve:

- existing file ordering
- section headings
- alias references as `var(--uds-...)` where Figma values are aliases
- comments that describe generated structure

Do not import deferred collections:

- `uds-elevation`
- `uds-motion`
- `uds-style-icon`
- `uds-rules`

Report them as non-imported if they contain variables.

### 5. Validate generated CSS

Before committing:

- compare generated CSS variable names to the previous CSS
- run token page visual smoke checks
- search changed token names for references in component CSS
- verify no dangling aliases

### 6. Changelog and cache busting

Update `SITE_CHANGELOG` with:

- direct Variables or ZIP fallback source
- added tokens
- changed token values
- renamed/deleted tokens, if user confirmed them
- deferred collections ignored

Cache-bust token CSS links if the linked bundle changed.

If the UDS `CHANGELOG` array changes, sync Figma release notes immediately via
`sync-figma-release-notes`.

### 7. Update sync state

After successful verification, update:

- `.cursor/figma/state/tokens.snapshot.json`
- `.cursor/figma/state/last-sync.json`

Only update snapshots after CSS and docs match the new token model.

### 8. Commit and push

Commit and push directly to `main`:

```bash
git add -A
git commit -m "Import Figma token updates"
git push origin main
```

## Never auto-apply

- token deletions
- token renames
- mode removals
- collection removals
- unresolved alias changes
- direct-read failures unless fallback ZIPs pass audit

Default deletion policy: preserve/deprecate/report, never remove.
