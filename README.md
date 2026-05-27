# UDS — Urban Design System

Design-to-engineering specification for the Urban Design System (UDS), the
shared design system used by Boardroom and adjacent property-management apps.

The site lives at <https://udsdocs.com/> and is hosted on Cloudflare Pages.

## What's in this repo

The repo cleanly separates the **design system** from the **documentation
site that documents it**:

- **`uds-docs/uds/`** — the portable design-system payload: tokens, specs,
  examples, changelogs, statuses, and manifests. Runtime component
  implementations now ship through `@uds/web-components`.
- **`uds-docs/packages/uds-web-components/`** and **`uds-docs/packages/uds-react/`** —
  the native Web Component implementation and React wrapper package.
- **`uds-docs/app/`, `uds-docs/components/`, `uds-docs/lib/`, `uds-docs/styles/`** —
  the Next.js documentation site. Routing, page rendering, the Demo Builder,
  the Token Search modal, and the Playground engine all live there.
- **`scripts/`** — repo-level tooling: release management, audits, the
  changelog aggregator, prune-version, screenshot tooling.
- **`uds-docs/versions/`** — frozen UDS-only snapshots per release.

See [AGENTS.md](./AGENTS.md) for the full repo layout and detailed
contribution guidelines.

## Quick start

The site is a static Next.js export.

### Run locally

```bash
cd uds-docs
npm install
npm run dev
# Open http://localhost:3000/
```

For a production-style check, run `npm run build` from `uds-docs/`.

### Make a SITE change

1. Edit the docs-site files.
2. Add a `SITE_CHANGELOG` entry in `uds-docs/data/site-changelog.ts`.
3. Run `npm run build` from `uds-docs/`.
4. `git add -A && git commit -m "..." && git push`

Cloudflare Pages auto-deploys the static export on push to `main`.

### Update a UDS component

Every component is one folder under `uds/components/<id>/` containing:

- `<id>.css` — token-only compatibility/stub CSS
- `spec.json` — Guidelines-tab data (description, props, accessibility, etc.)
- `status.json` — lifecycle status + since-version
- `changelog.json` — full history for that component
- `impl.json` — Implementation Reference data (Code-tab tokens / HTML / behavior notes)
- `playground.js` — ES-module playground config (loaded via dynamic import)
- `examples/*.html` + `manifest.json` — example variants used by both
  the docs page Examples tab AND the Demo Builder

Runtime behavior lives in `uds-docs/packages/uds-web-components/src/components/**`.
React wrappers live in `uds-docs/packages/uds-react/src/index.tsx`. Pick the
right file, re-run the audits, add changelog entries, commit when requested.
Detailed flow in [AGENTS.md](./AGENTS.md).

### Bump UDS to a new release

```bash
bash uds-docs/release.sh 0.4
```

Snapshots the current `uds/` into `versions/0.3/uds/`, bumps
`uds/version.json` to `0.4`, updates `versions.json`, regenerates
`uds/CHANGELOG.json` from per-component changelogs.

## Design system layers

- **Tokens** (`uds-docs/uds/tokens/`) — primitives (raw color/font palette),
  semantic tokens (named role aliases), font scale, layers (z-index scale).
- **Components** (`uds-docs/packages/uds-web-components/`) — native
  `<udc-*>` Web Components with shadow-DOM styles.
- **React wrappers** (`uds-docs/packages/uds-react/`) — React-friendly wrappers
  around the same Web Components.
- **Documentation** (`uds-docs/app/`) — the React app that renders specs,
  examples, guidelines, playgrounds, the Demo Builder, and the Token Search modal.

## Version dropdown — view any historical UDS release

The version dropdown in the header sets `?uds=X.Y` on the URL and the
modern docs site renders the archive by reading data through the
`lib/uds-data.ts` fetchers. Bug fixes to the docs UI flow automatically to
historical views; only the UDS data itself is frozen per release.

```
http://localhost:3000/button?uds=0.2
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
```

CI workflow in `.github/workflows/audits.yml` runs all of these on every PR.

## Accessibility contract

The repo supports **6 theme combinations** (Base/ResMan/AnyoneHome ×
Light/Dark, plus Inhabit Light). Use the **Contrast Checker** tool on
the docs site (`/contrast-checker`) to evaluate token pairings across
all themes from resolved CSS variables. Token changes flow through Figma
first — see `.cursor/rules/uds-source-of-truth.mdc`.

- Tabs → `role="tab"` inside `[role="tablist"]`
- Nav items → `aria-current="page"` (NOT `aria-selected`)
- Toggle buttons → `aria-pressed="true"` (NOT `aria-selected`)
- Icon-only buttons → must have `aria-label`

## Versioning policy

UDS history is preserved forever in per-component `changelog.json` files.
Snapshots may be pruned (via `scripts/prune-version.sh <version>`) to free
disk space, but the changelog entries always remain — the Changelog page
on the docs site shows entries for pruned versions just like any other.

See `versions/PRUNED.md` for the audit trail of pruned snapshots.

## Recent restructure

This repo just went through a major restructure (silo design system from
docs site, co-locate per-component, eliminate drift between Demo Builder
and docs page). See [MIGRATION.md](./MIGRATION.md) for the full record.

## License

Proprietary — © Boardroom / property-management portfolio. Not open source.
