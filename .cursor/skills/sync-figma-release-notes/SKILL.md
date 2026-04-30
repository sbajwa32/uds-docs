---
name: sync-figma-release-notes
description: Rebuild Release Notes frames in both UDS Figma files from the site CHANGELOG. Use during releases or after CHANGELOG changes that must be mirrored in Figma.
---

# Sync Figma Release Notes

Rebuilds Release Notes in both Figma files from the canonical `CHANGELOG`
array in `uds-docs/app.js`.

## Trigger phrases

- "sync Figma release notes"
- "update Figma changelog"
- "rebuild Release Notes in Figma"
- Release workflow step after `CHANGELOG` changes

## Source of truth

- `uds-docs/app.js` `CHANGELOG`

Do not invent release notes from memory or from the visible changelog page.

## Required rules

- `.cursor/rules/uds-figma-preflight.mdc`
- `.cursor/rules/uds-figma-write-safety.mdc`
- `.cursor/rules/uds-release-workflow.mdc`

## Workflow

### 1. Parse the site CHANGELOG

Read `uds-docs/app.js` and normalize every release into:

```json
{
  "version": "0.2",
  "date": "2026-04-02",
  "summary": [],
  "tokens": [],
  "components": [],
  "migration": null
}
```

Group changes by:

- global / `category: null`
- `category: "tokens"`
- `category: "components"`

Preserve original order within each release.

### 2. Preflight both Figma files

For each file:

- UDS Tokens: `iqKgR73ubUHpQTIcF7XGMy`
- UDS Components: `1XJoUJgtNpw4R0IIT3VjoK`

Report:

```markdown
Figma preflight:
- File:
- Version page:
- Site UDS_VERSION:
- Mismatch:
- Confidence:
```

If the target release page is missing, stop and ask.

### 3. Confirm write scope

This skill is a Figma write. Confirm that the intended write is exactly:

```text
Remove and rebuild the existing "Release Notes" frame on the target UDS Version page in both files.
```

Do not edit:

- component pages
- token variables
- library publish notes
- version history
- unrelated frames

### 4. Rebuild frames

For each target Figma file:

1. Navigate to the target `UDS Version: X.Y` page.
2. Find the existing frame named `Release Notes`.
3. Delete only that frame.
4. Rebuild the frame from the normalized release-note model.

The two files must receive identical release-note text.

## Formatting contract

Use the established release-note style:

- bold version numbers
- gray dates
- blue uppercase category headers
- colored bullet type labels (`ADDED`, `CHANGED`, `FIXED`, `DEPRECATED`, `REMOVED`)
- newest release first

If an existing style frame is present, match it. If style extraction fails,
fall back to a simple text layout and report the limitation.

## Verification

After writing:

- Read both rebuilt frames.
- Compare extracted text.
- Confirm both match the normalized site CHANGELOG.

Report:

```markdown
# Figma Release Notes Sync

## Source
- CHANGELOG releases:
- Target version page:

## Writes performed
| File | Page | Frame removed | Frame rebuilt | Confidence |
|---|---|---|---|---|

## Verification
- Tokens file text matches site: yes/no
- Components file text matches site: yes/no
- Files match each other: yes/no

## Manual Figma steps remaining
- Publish library if this is a release
- Save to version history
- Update cover page text if needed
```

## Guardrails

- Do not modify the `CHANGELOG` array in this skill.
- Do not run `release.sh`.
- Do not change token or component data.
- Do not edit Figma pages other than the target release page.
- If one file writes successfully and the other fails, report partial sync
  clearly and do not claim success.
