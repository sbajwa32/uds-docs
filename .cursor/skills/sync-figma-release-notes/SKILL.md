---
name: sync-figma-release-notes
description: Rebuild Release Notes frames in both UDS Figma files from the aggregated UDS CHANGELOG. Use during releases or after CHANGELOG changes that must be mirrored in Figma.
---

# Sync Figma Release Notes

Rebuilds Release Notes frames in both Figma files from the aggregated UDS
changelog `uds-docs/uds/CHANGELOG.json`. (After Phase 8 of the repo restructure
this is the canonical changelog file. The legacy in-memory `CHANGELOG` array in
`docs/app.js` no longer exists; the site renders the Changelog page by fetching
`uds/CHANGELOG.json` at runtime.)

## Trigger phrases

- "sync Figma release notes"
- "update Figma changelog"
- "rebuild Release Notes in Figma"
- Release workflow step after `uds/CHANGELOG.json` changes (whether via
  release or via mid-release additions to per-component `changelog.json` +
  `aggregate-changelog.sh`)

## Source of truth

- `uds-docs/uds/CHANGELOG.json` (aggregated; built by
  `scripts/aggregate-changelog.sh` from per-component `changelog.json` files
  plus `uds-docs/uds/CHANGELOG.globalNotes.json`).
- Do NOT read from `docs/app.js` — there is no in-memory CHANGELOG table.
- Do not invent release notes from memory or from the visible changelog page.

## Required rules

- `.cursor/rules/uds-figma-preflight.mdc`
- `.cursor/rules/uds-figma-write-safety.mdc`
- `.cursor/rules/uds-release-workflow.mdc`

## Workflow

### 1. Parse the aggregated CHANGELOG

Read `uds-docs/uds/CHANGELOG.json` (a sorted-oldest-first array of releases).
Each release entry has:

```json
{
  "version": "0.3",
  "date": "2026-05-07",
  "globalNotes": [
    { "type": "added", "text": "..." },
    { "type": "changed", "text": "..." }
  ],
  "byComponent": {
    "Button": [{ "type": "changed", "text": "..." }],
    "Nav Header": [{ "type": "fixed", "text": "..." }]
  }
}
```

For grouping into the Figma Release Notes frame:

- **TOKENS** \u2014 token-related entries from `globalNotes` (typically
  `added` / `changed` for `--uds-color-*`, `--uds-space-*` etc.).
- **NEW COMPONENT PAGES** \u2014 components whose first changelog entry at this
  version is `type: added` (i.e. this version introduced the page).
- **EXISTING COMPONENT COVERAGE** \u2014 components with `type: changed` /
  `fixed` / `deprecated` at this version (existing component received an
  update). Summarize multi-entry components into one line; do not dump every
  raw entry verbatim.
- **POST-RELEASE NOTES** (or **GLOBAL NOTES**) \u2014 remaining `globalNotes`
  entries that aren't token-specific (rule additions, reverts, agent-process
  changes, etc.).

Preserve original ordering within each group. Newest version first if rendering
multiple versions in one frame.

### 2. Preflight both Figma files

For each file:

- UDS Tokens: `iqKgR73ubUHpQTIcF7XGMy`
- UDS Components: `1XJoUJgtNpw4R0IIT3VjoK`

Apply `.cursor/rules/uds-figma-preflight.mdc`. Report:

```markdown
Figma preflight:
- File:
- Version page:
- Site UDS_VERSION (from uds/version.json):
- Mismatch:
- Confidence:
```

If the target `UDS Version: X.Y` page is missing, stop and ask.

### 3. Confirm write scope

This skill is a Figma write. Confirm that the intended write is exactly:

```text
Remove and rebuild the existing "Release Notes" frame on the target UDS
Version: X.Y page in both files.
```

Do NOT edit:

- component pages
- token variables
- library publish notes
- version history
- unrelated frames

This is allowed-scope #1 under `.cursor/rules/uds-figma-write-safety.mdc`.

### 4. Inspect existing frame style (read-only)

Before deleting, read the existing `Release Notes` frame to capture:

- frame dimensions (width, padding, item-spacing, layoutMode, fills)
- typography per element kind (h1 title, h2 version header, section header,
  bullet item, closing note) \u2014 font family, weight, size, line-height,
  fill color

Use these to construct the rebuild so the new frame matches the established
style.

### 5. Rebuild frames

For each target Figma file:

1. Navigate to the target `UDS Version: X.Y` page.
2. Find the existing frame named `Release Notes`.
3. Delete ONLY that frame (preserve x/y/width for the rebuild).
4. Create a new frame with the captured dimensions and auto-layout.
5. Append text children for each row in the normalized model (h1, version
   header, section header, bulleted items grouped by section, closing note).
6. Use the captured typography contract.

The two files must receive **identical** release-note text. Run the same code
against both `fileKey`s.

## Formatting contract

The established style (as observed in the current frames):

- White (`#ffffff`) frame background, 32px L/R padding, 28px T/B padding,
  vertical auto-layout, 12px item spacing.
- h1 \u2014 "UDS Release Notes": Inter Bold 24 / 35, `#171717`.
- Version header \u2014 "Version X.Y  YYYY-MM-DD": Inter Bold 18 / 26,
  `#171717`.
- Section header: Inter Bold 11 / 16, `#006be6` (blue).
- Bullet item: Inter Regular 12 / 17, color by type:
  - `added` / `fixed` \u2014 green `#16a34a`
  - `changed` / `deprecated` \u2014 orange `#ea580c`
  - `removed` \u2014 red `#dc2626`
- Closing note: Inter Regular 12 / 17, gray `#525252`.

If style extraction fails on read, fall back to a simple text layout and
report the limitation rather than guessing.

## Verification

After writing:

- Read both rebuilt frames.
- Compare extracted text.
- Confirm both match the normalized aggregated CHANGELOG.

Report:

```markdown
# Figma Release Notes Sync

## Source
- CHANGELOG path: uds-docs/uds/CHANGELOG.json
- Versions included:
- Target version page:

## Writes performed
| File | Page | Frame removed | Frame rebuilt | Old children | New children | Confidence |
|---|---|---|---|---|---|---|

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

- Do not modify `uds/CHANGELOG.json` in this skill (the source of truth flows
  per-component \u2192 aggregate-changelog.sh \u2192 `uds/CHANGELOG.json`; do
  not reverse-engineer changes from Figma).
- Do not run `release.sh`.
- Do not change token or component data.
- Do not edit Figma pages other than the target `UDS Version: X.Y` page's
  `Release Notes` frame.
- If one file writes successfully and the other fails, report partial sync
  clearly and do not claim success. State which file is current and which is
  stale.

Before commit, complete the round-trip checklist in
`.cursor/rules/uds-master-preflight.mdc` Phase 3.
