# UDS — Urban Design System

Design-to-engineering specification for the Urban Design System (UDS), the
shared design system used by Boardroom and adjacent property-management apps.

The site lives at <https://sbajwa32.github.io/uds-docs/> and is hosted via
GitHub Pages.

## What's in this repo

The git repo root contains:

- **`uds-docs/`** — the GitHub Pages deploy artifact root. Holds the SPA
  entry (`index.html`), the design system itself, the docs SPA, and the
  per-release UDS snapshots.
- **`scripts/`** — repo-level tooling at the workspace root: audits,
  changelog/components aggregators, prune-version, archive conversion,
  screenshot tooling.
- **`.cursor/`**, **`.github/`** — Cursor rules/skills/agents, GitHub
  Actions workflows.
- Top-level `AGENTS.md`, `README.md`, `MIGRATION.md`.

Inside `uds-docs/` the design system is cleanly separated from the
documentation site:

- **`uds-docs/uds/`** — the design system itself. Tokens (CSS custom
  properties), per-component CSS/JS, component specs, examples.
  Self-contained — anyone can copy this folder into another project to
  consume the design system.
- **`uds-docs/docs/`** — the documentation site. Routing, page rendering,
  the Demo Builder, the Token Search modal, the Playground engine.
  Consumes `uds-docs/uds/`.
- **`uds-docs/versions/`** — frozen UDS-only snapshots per release.
- **`uds-docs/index.html`** — SPA entry point (the GitHub Pages artifact
  root).
- **`uds-docs/bump-site.sh`**, **`uds-docs/release.sh`** — version-bump
  scripts (run from the repo root).

See [AGENTS.md](./AGENTS.md) for the full repo layout and detailed
contribution guidelines.

## Quick start

The site is static — no build step, no bundler, no framework.

### Run locally

```bash
cd uds-docs
python3 -m http.server 4000
# Open http://localhost:4000/
```

That's it. Edit any file, refresh the browser.

### Make a SITE change

1. `bash uds-docs/bump-site.sh` (preflight — bumps SITE version)
2. Edit whatever
3. Add a `SITE_CHANGELOG` entry in `docs/data/site-changelog.js` matching
   the new version
4. Cache-bust `docs/app.js` / `uds/uds.css` etc. in `index.html` if those
   files changed
5. `git add -A && git commit -m "..." && git push`

GitHub Actions auto-deploys on push to `main`.

### Update a UDS component

Every component is one folder under `uds-docs/uds/components/<id>/` containing:

- `<id>.css` — token-first component CSS
- `<id>.js` — optional, for interactive components
- `spec.json` — Guidelines-tab data (description, props, accessibility, etc.)
- `status.json` — lifecycle status + since-version
- `changelog.json` — full history for that component
- `impl.json` — Implementation Reference data (Code-tab tokens / HTML / JS)
- `playground.js` — ES-module playground config (loaded via dynamic import)
- `examples/*.html` + `manifest.json` — example variants used by both
  the docs page Examples tab AND the Demo Builder

Pick the file, edit, re-run the audits, bump SITE, commit. Detailed flow
in [AGENTS.md](./AGENTS.md).

### Bump UDS to a new release

```bash
bash uds-docs/release.sh 0.4
```

Snapshots the current `uds-docs/uds/` into `uds-docs/versions/0.3/uds/`,
bumps `uds-docs/uds/version.json` to `0.4`, updates `uds-docs/versions.json`,
regenerates `uds-docs/uds/CHANGELOG.json` from per-component changelogs.

## Design system layers

- **Tokens** (`uds-docs/uds/tokens/`) — primitives (raw color/font palette),
  semantic tokens (named role aliases), font scale, layers (z-index scale).
- **Components** (`uds-docs/uds/components/<id>/`) — CSS-only or CSS+JS. All
  framework-agnostic vanilla web components / utility classes.
- **Documentation** (`uds-docs/docs/`) — the SPA that renders specs, examples,
  guidelines, playgrounds, the Demo Builder, the Token Search modal.

Production framework wrappers (React, Vue, etc.) for each component live
in the UDS Storybook repo, NOT this repo. This repo is the **specification**.

## Version dropdown — view any historical UDS release

The version dropdown in the header sets `?uds=X.Y` on the URL and the
modern docs site renders the archive by reading data through the
`udsResolve()` helper. Bug fixes to the docs UI flow automatically to
historical views; only the UDS data itself is frozen per release.

```
http://localhost:4000/?uds=0.2#/button
```

A yellow banner appears at the top of the page when an archived version
is active. Interactive features (Playground, Demo Builder, Pre-flight
checklist) are hidden in archive view since they only run against live
UDS data.

## Audits

```bash
bash scripts/audit-component-completeness.sh   # every component folder has all required files
bash scripts/audit-demo-coverage.sh            # every implementable component has a demoSuitable example
bash scripts/audit-placeholders.sh             # every {{token}} used in examples is in the vocabulary
bash scripts/audit-token-usage.sh              # per-component CSS uses --uds-* tokens, no hardcoded colors

# Multi-theme accessibility (requires headless Chrome at port 9332):
bash scripts/audit-theme-contrast.sh
```

CI workflow in `.github/workflows/audits.yml` runs all of these on every
PR. The `theme-contrast` job verifies WCAG AA contrast across all 6
supported theme combinations (Base/ResMan/AnyoneHome × Light/Dark + Inhabit
Light) on 7 representative pages — 42 page-theme combinations.

## Accessibility contract

The repo enforces **WCAG AA contrast across all 6 supported theme
combinations**. Token bumps to keep this contract are documented in
`uds-docs/uds/CHANGELOG.globalNotes.json`. Component CSS that wants to
style a "selected" or "active" state should follow these ARIA conventions:

- Tabs → `role="tab"` inside `[role="tablist"]`
- Nav items → `aria-current="page"` (NOT `aria-selected`)
- Toggle buttons → `aria-pressed="true"` (NOT `aria-selected`)
- Icon-only buttons → must have `aria-label`

## Versioning policy

UDS history is preserved forever in per-component `changelog.json` files.
Snapshots may be pruned (via `bash scripts/prune-version.sh <version>`) to
free disk space, but the changelog entries always remain — the Changelog
page on the docs site shows entries for pruned versions just like any
other.

See `uds-docs/versions/PRUNED.md` for the audit trail of pruned snapshots.

## Recent restructure

This repo just went through a major restructure (silo design system from
docs site, co-locate per-component, eliminate drift between Demo Builder
and docs page). See [MIGRATION.md](./MIGRATION.md) for the full record.

## License

Proprietary — © Boardroom / property-management portfolio. Not open source.
