---
name: sync-figma-component-status
description: Sync UDS Components Figma stoplight page prefixes to COMPONENT_STATUS in the doc site. Use after figma-inventory reports status mismatches.
---

# Sync Figma Component Status

Updates `COMPONENT_STATUS` in `uds-docs/app.js` from UDS Components page-name
prefixes. It does not edit component specs, examples, CSS, or Figma.

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
6. Update only `COMPONENT_STATUS` in `uds-docs/app.js`.
7. Add a concise `SITE_CHANGELOG` entry listing changed statuses.
8. Cache-bust `app.js` in `uds-docs/index.html`.
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

