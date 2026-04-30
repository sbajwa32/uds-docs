# UDS Figma Sync State

This directory stores non-secret, normalized metadata used by Cursor agents
when syncing the UDS Figma files to the documentation site.

## Why this exists

Without a tracked baseline, an agent can compare current Figma data to the
current doc site, but it cannot reliably know what changed since the last
successful sync. These snapshots make the prompt `UDS updated` deterministic:

1. Read the current Figma files.
2. Normalize tokens/components into stable JSON models.
3. Compare current models to the previous snapshots.
4. Apply high-confidence non-breaking updates.
5. Write new snapshots only after verification succeeds.

## Files

| Path | Purpose |
| --- | --- |
| `schemas/token-model.schema.json` | Shape of normalized Figma token data |
| `schemas/component-model.schema.json` | Shape of normalized Figma component data |
| `state/last-sync.json` | Metadata for the most recent successful sync |
| `state/tokens.snapshot.json` | Last known-good normalized token model |
| `state/components.snapshot.json` | Last known-good normalized component model |

## Rules

- Do not store secrets, API tokens, screenshots, or raw Figma file dumps here.
- Store only normalized names, IDs, modes, aliases, checksums, and timestamps.
- Update snapshots only after docs-site updates verify successfully.
- If Figma cannot be read completely, do not overwrite snapshots.
- Deletions are never applied automatically; preserve and report first.
