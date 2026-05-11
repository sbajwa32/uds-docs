---
name: sync-figma-component-status
description: Sync UDS Components Figma stoplight page prefixes to per-component status.json files in the doc site. Use after figma-inventory reports status mismatches.
---

# Sync Figma Component Status

Updates the `current` field in each affected `uds-docs/uds/components/<id>/status.json` from UDS Components page-name prefixes (and appends to `history[]` if the status moved). It does not edit component specs, examples, CSS, or Figma. The legacy `COMPONENT_STATUS` table in `app.js` is gone (Phase 13b) — `app.js` builds the in-memory map at boot from `uds/components.json` + each `status.json`, so changes to `status.json` propagate without any code edit.

## Inputs

- A `figma-inventory` report.
- Optional explicit component IDs to sync.

## Procedure

1. Verify the inventory report includes:
   - Figma preflight versions.
   - Component status comparison.
   - Confidence per mismatch.
   - Classification per mismatch.
2. Filter to high-confidence mismatches only unless the user explicitly
   approves medium-confidence items.
3. Never auto-apply:
   - backward moves from `review` or `production`;
   - missing/deleted components;
   - split/merged components;
   - ambiguous page-name matches.
4. Exclude any Figma page whose name contains `{Ignore}`. These pages are
   intentionally out of scope and must not create status updates, deletion
   candidates, or missing-doc findings.
5. Before editing `uds-docs/`, run `bash uds-docs/bump-site.sh`.
6. For each affected component, update `current` (and append to `history[]` with the new `since` version when the status actually moved) in `uds-docs/uds/components/<id>/status.json`. NOTE: this is one of the authorized write paths into `uds-docs/uds/` (see `uds-source-of-truth.mdc`).
7. Add a concise `SITE_CHANGELOG` entry in `uds-docs/docs/data/site-changelog.js` listing changed statuses.
8. No `app.js` cache-bust is required — `app.js` reads `status.json` at runtime via `udsResolve()`. (If you also touched a docs-site asset, bump that asset's `?v=N` instead.)
9. Visual-check the Roadmap and sidebar status badges.
10. Commit and push directly to `main`.

## Output

```markdown
# Component Status Sync

## Applied
| Component | Old | New | Confidence |

## Skipped
| Component | Reason |

## Verification
- Roadmap checked: yes/no
- Sidebar checked: yes/no
- SITE version:
```

