# UDS Repo Restructure — Migration Tracking

Live tracker for the UDS repo restructure currently in progress on the
`cursor/uds-restructure-afda` branch. The migration runs strictly phased; the
site on `main` is untouched until the final atomic merge in Phase 12.

## Why we're doing this

The pre-restructure repo had Demo Builder drift, Examples-vs-Code drift, and
scattered per-component data across 6+ files. This restructure makes each
component a single folder so drift becomes structurally impossible. See the
plan file referenced in the repo root for the full rationale.

## Baseline

- **Tag:** `pre-restructure-baseline` on `main`
- **Commit:** `7cfccbdb99a17d21dbb71719bd6b69d6fb130afb`
- **UDS version at baseline:** `0.3`
- **SITE version at baseline:** `2026.05.08.7`
- **Components at baseline:** 29 (26 implementable + 3 placeholder-only)
- **Snapshots:** `/tmp/baseline-screenshots/` (39 PNGs) and `/tmp/baseline-data/` (data dump)

## Rollback

If anything goes wrong, the entire migration is contained on
`cursor/uds-restructure-afda`. To roll back:

```bash
git checkout main
git branch -D cursor/uds-restructure-afda  # local
git push origin --delete cursor/uds-restructure-afda  # remote
```

The baseline tag stays on `main` permanently as a recovery anchor.

## Phase status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Baseline capture + branch creation | done |
| 1 | Migration tooling + JSON schemas | done |
| 2 | Target layout scaffolding | in progress |
| 3 | Extract docs site shell (CSS, ES modules, global tables) | pending |
| 4 | Extract site modules (Demo Builder, Token Search, Playground) | partial — Demo Builder done in 4a; 4b (Token Search) and 4c (Playground) deferred to Phase 6 |
| 5 | Extract non-component pages with data wiring | done |
| 6 | Per-component migration (26 components) | done — all 29 components migrated to per-component folders |
| 7 | Demo Builder reads source-of-truth examples | done — examples live in one place, Demo Builder + docs page both fetch them |
| 8 | Versioning model + per-component changelog aggregation | done — uds/CHANGELOG.json + uds/version.json are source of truth |
| 9 | Snapshot strategy + retroactive archive conversion | partial — udsPath() helper, prune-version.sh, new release.sh done; 0.2 conversion + dropdown rewrite deferred (see notes below) |
| 10 | Rules, audits, AGENTS.md, README, skills + drift fixes | done |
| 11 | Performance + accessibility verification | pending |
| 12 | Final verification + PR + CI workflow | pending |

## Per-component migration status (Phase 6)

All 29 components migrated to `uds/components/<id>/`.

Tier rollout (lowest-risk → highest-risk):

| Tier | Components | Commit |
|------|-----------|--------|
| 1 | divider, spacer, icon-wrapper, label, link | 2d20ed9 |
| 2 | badge, chip, breadcrumb, tabs, pagination, toggle | 57f6454 |
| 3 | radio, checkbox, text-input, text-area, dropdown, search | ce6f147 |
| 4 | tile, list, notification, tooltip | e7bb88f |
| 5 | dialog, data-table | cc5f169 |
| 6 | nav-header, nav-vertical (most complex; status.since corrected from 0.1 → 0.2 to reflect post-split id semantics) | 3f16142 |
| 7 + button | combobox, date-picker, data-view (placeholder-only) + button | 4eedf96 |
| 6c cleanup | content/ removed, uds.js orchestrator paths updated, loader fallback removed | 331545c |

## Deferral notes

- **4b (Token Search extraction)** — deferred to Phase 6. Token Search depends
  on `escapeHtml` and the in-memory tokens index used elsewhere in app.js.
  Extracting in Phase 4 would force either circular imports or helper
  duplication, both of which get re-resolved in Phase 6. Empty
  `docs/modules/token-search/` directory exists as a placeholder.
- **4c (Playground engine extraction)** — deferred to Phase 6. The Playground
  engine consumes `PLAYGROUNDS` (still in app.js until Phase 6 dissolves it
  into per-component `playground.js` files), `buildIconPicker`,
  `buildCopyButton`, `buildImplSection`, and `refreshImplSections`. All of
  those move during Phase 6 anyway, at which point a clean
  `docs/modules/playground/index.js` falls out naturally. Empty
  `docs/modules/playground/` directory exists as a placeholder.
- **9c (versions/0.2/ retroactive conversion + version-aware dropdown rewrite)** —
  deferred. Phase 9 delivers the foundation (`udsPath()` helper,
  `prune-version.sh`, new `release.sh` for UDS-only snapshots going forward),
  but conversion of the existing `versions/0.2/` archive to the new shape AND
  the dropdown/router rewrite to use `udsPath()` for fetches is a substantial
  follow-up. Current behavior is preserved: the dropdown still navigates to
  `versions/0.2/index.html` and serves the frozen full-site archive as
  before. Future releases (`release.sh` v2) will use the UDS-only snapshot
  model. The 0.2 conversion + dropdown rewrite can be a small standalone
  PR after this restructure merges, OR get bundled in if Phase 11 quality
  verification surfaces issues with the frozen archive.

## Things that will become true at the end of the migration

- `uds/` is the design system. Self-contained, copy-portable.
- `docs/` is the documentation site. Consumes `uds/`.
- `scripts/` holds tooling (release, bump-site, audits, migration).
- Every component lives in `uds/components/<id>/` with `<id>.css`, `spec.json`,
  `status.json`, `changelog.json`, `examples/*.html` + `manifest.json`,
  optionally `<id>.js` and `playground.js`.
- Demo Builder fetches example HTML from `uds/components/<id>/examples/` —
  same source as the docs page Examples tab.
- Per-component `changelog.json` is the source of truth for UDS changelogs.
  `release.sh` aggregates them into `uds/CHANGELOG.json`.
- Snapshots at `versions/<X>/uds/` are UDS-only. Modern docs UI renders any
  historical version via `udsPath()` helper.
- ES modules throughout `docs/`. No build step. No bundler.

## Notes

This file stays in the repo as a historical record after Phase 12. The
per-component status table will be emptied when migration completes, but the
file itself stays so anyone reading the repo later understands what happened.
