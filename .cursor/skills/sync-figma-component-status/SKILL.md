---
name: sync-figma-component-status
description: Sync UDS Components Figma stoplight page prefixes into per-component status.json files. Use after figma-inventory reports status mismatches.
lastUpdated: 2026-05-24T09:19:52Z
---

# Sync Figma Component Status

Updates `uds-docs/uds/components/<id>/status.json` from UDS Components page-name
prefixes. It does not edit component specs, examples, CSS, or Figma.

After Phase 13b of the repo restructure, the legacy `COMPONENT_STATUS` table in
`docs/app.js` no longer exists. The doc site builds the in-memory status map at
runtime from `uds/components.json` plus each `uds/components/<id>/status.json`
file. Editing `status.json` is the only correct way to flip a component's
lifecycle state.

## Inputs

- A `figma-inventory` report.
- Optional explicit component IDs to sync.

## Procedure

1. Verify the inventory report includes:
   - Figma preflight versions.
   - Component status comparison (Figma stoplight prefix vs per-component
     `status.json` `current` field).
   - Confidence per mismatch.
   - Classification per mismatch (see `.cursor/rules/uds-figma-change-classification.mdc`).
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
5. For each high-confidence status change, edit
   `uds-docs/uds/components/<id>/status.json`:
   - Update `current` to the new value (one of `placeholder`, `blocked`,
     `in-progress`, `review`, `production`, `deprecated`).
   - Update `since` to the current UDS version.
   - Append the prior status to the `history[]` array with `{ status, version }`.
   - Do NOT edit any other field.
7. Add a per-component `changelog.json` entry for each component whose status
   changed: `{ "version": "<UDS>", "type": "changed", "text": "Status: <old> \u2192 <new>" }`.
   This keeps the changelog-currency audit green and surfaces the change on
   the docs site Changelog tab.
8. Run `bash scripts/aggregate-changelog.sh` to refresh `uds/CHANGELOG.json`.
9. Update `.cursor/figma/state/components.snapshot.json` — bump each affected
   component's `status` field to the new value; bump `.cursor/figma/state/last-sync.json`
   `lastSuccessfulSync` and recompute `components.snapshotChecksum`.
10. Add a concise `SITE_CHANGELOG` entry in `data/site-changelog.ts`
    listing the changed statuses. Per
    [`uds-site-changelog.mdc`](../../rules/uds-site-changelog.mdc),
    there's no cache-bust step post-migration; Cloudflare and Next handle
    invalidation automatically.
11. Visual-check the sidebar status badges and each affected component
    page's header badge.
13. Commit and push directly to `main`.

The Phase 5 finalize checklist in `.cursor/rules/uds-master-preflight.mdc` is
the canonical round-trip checklist; steps 6\u201311 above are this skill's
specialization of it.

## Output

```markdown
# Component Status Sync

## Applied
| Component | Old | New | Confidence | status.json updated | changelog.json entry |

## Skipped
| Component | Reason |

## Verification
- Sidebar status badges checked: yes/no
- Component-page header badges checked: yes/no
- SITE version:
- Snapshot updated: yes/no
- Figma Release Notes need rebuild: yes/no
```
