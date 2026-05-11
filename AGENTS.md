# UDS Documentation Site — Agent Notes

This repo is the design-to-engineering specification for the **Urban Design
System (UDS)**. The deployed site is hosted on GitHub Pages.

The site is a static HTML/CSS/JS app — no build step, no bundler, no
framework. Edit files, push, GitHub Actions auto-deploys.

## Repo layout

The git repo root is the workspace folder, NOT `uds-docs/`. `uds-docs/` is the
GitHub Pages deploy artifact root (its `index.html` is what gets published);
`scripts/`, `.cursor/`, `.github/`, and the top-level docs files sit beside it
at the repo root.

```
.                                      # Repo root (workspace folder)
├── AGENTS.md                          # This file
├── README.md                          # Public-facing readme
├── MIGRATION.md                       # Tracker for the recent repo restructure
├── .cursor/                           # Cursor rules, skills, agents, env config
│   ├── rules/                         # Always-applied + opt-in workspace rules (.mdc)
│   ├── skills/                        # Skill packages (SKILL.md + helpers/refs)
│   ├── agents/                        # Subagent description files (.md)
│   ├── figma/                         # Figma sync state + schemas
│   ├── environment.json               # Cloud-agent env: starts python3 -m http.server 4000 in uds-docs/
│   └── desktop-preview.sh             # Launches Chrome at localhost:4000
├── .github/
│   └── workflows/
│       ├── deploy.yml                 # GitHub Pages deploy from uds-docs/
│       └── audits.yml                 # Static audits + multi-theme contrast audit
│
├── scripts/                           # Repo-level tooling (sibling to uds-docs/)
│   ├── aggregate-changelog.sh         # Walks per-component changelog.json -> uds/CHANGELOG.json
│   ├── aggregate-components.sh        # Walks uds/components/<id>/ -> uds/components.json (manifest)
│   ├── prune-version.sh               # Removes a snapshot folder (keeps changelog history)
│   ├── convert-archive.sh             # ONE-TIME PER LEGACY ARCHIVE — converts a frozen full-site versions/<X>/ to UDS-only shape
│   ├── migrate-component.sh           # MIGRATION ONLY — moves a component to per-component folder
│   ├── extract-examples.sh            # MIGRATION ONLY — splits Examples-tab HTML into files
│   ├── extract-changelog.sh           # MIGRATION ONLY — extracts per-component history
│   ├── round-trip-check.sh            # Verifies extracted data re-aggregates to original
│   ├── baseline-screenshot.sh         # Captures all pages via headless Chrome
│   ├── diff-screenshots.sh            # Compares two screenshot directories
│   ├── audit-component-completeness.sh # Each per-component folder has all required files
│   ├── audit-demo-coverage.sh         # Every implementable component has >=1 demoSuitable example
│   ├── audit-placeholders.sh          # Every {{token}} used is in placeholder-vocabulary.json
│   ├── audit-token-usage.sh           # Per-component CSS uses --uds-* tokens, no hardcoded colors
│   ├── audit-theme-contrast.sh        # axe-core multi-theme audit (Phase 17). Requires headless Chrome at port 9332.
│   └── lib/                           # Python + JS helpers used by the audit + aggregate + migration scripts
│
└── uds-docs/                          # GitHub Pages deploy artifact root
    ├── index.html                     # SPA entry point
    ├── version.txt                    # SITE version (auto-bumped on every site change)
    ├── bump-site.sh                   # Bumps SITE version (display + inline + version.txt)
    ├── release.sh                     # Snapshots uds/ -> versions/<X>/uds/, bumps uds/version.json
    │
    ├── docs/                          # The documentation site (consumes uds/)
    │   ├── app.js                     # Router, tab switcher, theme bar (ES module, ~2,670 lines after extractions)
    │   ├── site.css                   # Site-only styles (sg-* classes)
    │   ├── data/
    │   │   ├── site-changelog.js      # SITE_CHANGELOG (docs-site changes)
    │   │   ├── completeness-fields.js # COMPLETENESS_FIELDS + SPEC_FIELD_LABELS
    │   │   └── status-labels.js       # STATUS_LABELS + STATUS_STEPS
    │   ├── pages/                     # Non-component page fragments (lazy-fetched)
    │   │   ├── about.html
    │   │   ├── ai-assist.html
    │   │   ├── changelog.html
    │   │   ├── contribute.html
    │   │   ├── cursor-workflows.html
    │   │   ├── faq.html
    │   │   ├── getting-started.html
    │   │   ├── migration-guides.html
    │   │   ├── platform-support.html
    │   │   ├── recipes.html
    │   │   ├── roadmap.html
    │   │   ├── templates.html
    │   │   ├── tokens/{semantic-colors,primitive-colors,text-styles,spacing}.html
    │   │   └── tools/contrast-checker.html
    │   ├── modules/
    │   │   ├── demo-builder/          # 9 ES modules: rng, data-pools,
    │   │   │                          # canonical-pool, substitution,
    │   │   │                          # example-fetcher, assembler, overlay,
    │   │   │                          # history, zip, index
    │   │   ├── token-search/          # initTokenSearch + open/close (Phase 15a)
    │   │   │   └── index.js
    │   │   └── playground/            # createPlaygroundEngine factory (Phase 15b)
    │   │       └── index.js
    │   └── helpers/
    │       ├── fetch-versioned.js     # Cache-busting fetch wrapper
    │       ├── uds-path.js            # Version-aware path resolver: udsResolve(),
    │       │                          # viewingVersion(), isViewingHistorical()
    │       └── esc.js                 # Shared HTML-escape used by per-component
    │                                  # playground.js modules
    │
    ├── uds/                           # THE DESIGN SYSTEM — fully self-contained, version-aware
    │   ├── version.json               # { version, released, schemaVersion } — single source of truth for current UDS version
    │   ├── components.json            # Manifest: list of every component in this release (id, title, since). Source of truth for "which components exist". Generated by aggregate-components.sh.
    │   ├── CHANGELOG.json             # Aggregated release-level changelog (built from per-component changelogs)
    │   ├── CHANGELOG.globalNotes.json # Hand-curated non-component release notes (per version)
    │   ├── tokens/
    │   │   ├── primitives.css
    │   │   ├── semantic.css           # 6 theme combos. WCAG AA contract is Figma-defined; some known AA failures (see "Accessibility contract" below).
    │   │   ├── layers.css
    │   │   └── text-styles.css
    │   ├── uds.css                    # Master entry — imports tokens + every component CSS (auto-regenerated by migrate-component.sh)
    │   ├── uds.js                     # Component JS orchestrator
    │   ├── schemas/                   # JSON Schemas for every per-component file
    │   │   ├── spec.schema.json
    │   │   ├── manifest.schema.json
    │   │   ├── status.schema.json
    │   │   ├── changelog.schema.json
    │   │   ├── version.schema.json
    │   │   ├── components-manifest.schema.json   # Phase 13b — describes components.json
    │   │   ├── impl.schema.json                  # Phase 13c — describes impl.json
    │   │   └── placeholder-vocabulary.json
    │   └── components/
    │       └── <id>/                  # ONE folder per component — single source of truth
    │           ├── <id>.css           # Token-first CSS (audit-token-usage.sh enforces)
    │           ├── <id>.js            # If interactive
    │           ├── spec.json          # Conforms to spec.schema.json. Has figmaNodeId (variant) + figmaPageNodeId (page-level).
    │           ├── status.json        # { current, since, history[] }
    │           ├── changelog.json     # All component history (oldest first within entries[])
    │           ├── impl.json          # Implementation Reference data: { jsFunc, jsFile, tokens, html }
    │           ├── playground.js      # ES module — default-exports the PLAYGROUND config. Loaded via dynamic import().
    │           └── examples/
    │               ├── manifest.json  # Lists examples, their labels, demoWeight, showInDocs
    │               └── *.html         # Per-variant example HTML — read by docs page AND Demo Builder
    │
    └── versions/                      # UDS-only snapshots per release (post-Phase-14)
        ├── 0.2/uds/                   # Same shape as live uds/ — components/, schemas/, CHANGELOG.json, etc.
        └── PRUNED.md                  # Audit trail of pruned snapshots (history is preserved forever)
```

## Two version streams

The repo has two independent version trackers:

- **UDS version** (e.g. `0.3`) — the design system. Lives in `uds/version.json`.
  Bumped manually via `uds-docs/release.sh` when there are real spec changes.
  Per-component changelogs feed into `uds/CHANGELOG.json`.
- **SITE version** (e.g. `2026.05.08.7`) — the documentation site build.
  Lives in `version.txt`. Bumped automatically by `uds-docs/bump-site.sh`
  on every site code change. `docs/data/site-changelog.js` records what changed.

These are completely independent. UDS can stay at `0.3` while the site
ships 30 builds; one site bump can include changes to multiple components.

## Per-component co-location (the structural drift fix)

Every component lives in `uds/components/<id>/` as a single folder
containing every fact about that component:

| File | Purpose |
|---|---|
| `<id>.css` | Token-first component CSS. Audited by `audit-token-usage.sh`. |
| `<id>.js` | Optional — only if the component has interactive behavior. |
| `spec.json` | Spec data the docs Guidelines tab renders from. Conforms to `spec.schema.json`. Has both `figmaNodeId` (variant-level deep-link) and `figmaPageNodeId` (page-level fallback). |
| `status.json` | Current lifecycle status + since-version + history. |
| `changelog.json` | All component history, oldest first. Source of truth for UDS changelogs. |
| `impl.json` | Implementation Reference data — `{ jsFunc, jsFile, tokens, html }`. Powers the Code-tab "Implementation Reference" details. |
| `playground.js` | ES module that default-exports the playground config. Loaded via dynamic `import()` so the docs page and the archive-view both work. |
| `examples/manifest.json` | Lists examples with labels, demoWeight, showInDocs. |
| `examples/*.html` | Per-variant example HTML. **Read by docs page AND Demo Builder — same files, no drift.** |

The Demo Builder fetches `examples/*.html` and applies token-substitution
against the random pool (`docs/modules/demo-builder/data-pools.js`).
The docs page Examples tab fetches the same files and substitutes against
the canonical pool (`docs/modules/demo-builder/canonical-pool.js`). Drift
between Demo Builder previews and the docs page is structurally impossible.

## Version-aware data fetching (Phase 14)

The version dropdown in the header doesn't navigate to a frozen folder —
it sets `?uds=X.Y` on the URL and the modern docs site re-renders the
archive by reading data through `udsResolve()`. Bug fixes to docs UI
flow automatically to historical views.

Every UDS-data fetch in `docs/app.js` and `docs/modules/demo-builder/
example-fetcher.js` routes through `udsResolve(path)` from
`docs/helpers/uds-path.js`:

```js
import { udsResolve, viewingVersion, isViewingHistorical } from './helpers/uds-path.js';

// Returns './uds/components/button/spec.json' on live,
//          './versions/0.2/uds/components/button/spec.json' when ?uds=0.2.
fetch(udsResolve('components/button/spec.json'));
```

Every UDS-data fetch site MUST go through `udsResolve()` and gate on
`versionsReady` so the routing is settled before the first request fires:

```js
versionsReady.then(() => fetch(udsResolve(...)));
```

The dynamic `import()` of `playground.js` uses
`new URL(udsResolve('components/<id>/playground.js'), document.baseURI).href`
for portable resolution from any base.

## Snapshot + pruning policy

- **Snapshots** (`versions/<X>/uds/`) freeze ONLY the `uds/` design system —
  not the whole docs site. The modern docs UI renders any version's UDS
  data via the `udsResolve()` helper, so docs improvements automatically
  benefit historical views.
- **Pruning** is supported via `scripts/prune-version.sh <version>`.
  Per the locked policy, **per-component changelog history is preserved
  forever**. Pruning only removes the snapshot folder + drops the entry
  from `versions.json`. The Changelog page continues to show entries for
  pruned versions.
- The `versions/0.2/` archive was retroactively converted to the new
  UDS-only shape in Phase 14 via `scripts/convert-archive.sh`. Going
  forward, every snapshot is born in the new shape via `release.sh`.

## Accessibility contract

The site supports **6 theme combinations**:

1. Base Light (default)
2. Base Dark
3. ResMan Light
4. ResMan Dark
5. AnyoneHome Light (emerald accent)
6. Inhabit Light (amber accent)

`scripts/audit-theme-contrast.sh` runs axe-core across **6 themes ×
7 representative pages = 42 page-theme combinations** to detect WCAG
color-contrast violations and a related set of ARIA failures
(`aria-allowed-attr`, `aria-required-children`). Wired into
`.github/workflows/audits.yml` as the `theme-contrast` job; runs on
every PR + push to main.

The audit is a **diagnostic**, not a token authority. It reports what's
there. Whether a reported failure is a bug or an accepted design
trade-off is a design decision recorded in Figma — never an agent call.
See `.cursor/rules/uds-source-of-truth.mdc` for the full rule.

### Currently known WCAG AA failures (pending design conversation)

After the PR #7 revert that restored `semantic.css` and `button.css` to
the UDS 0.3 Figma-sync state, several WCAG AA contrast pairings fail:

| Pairing | Ratio | Threshold |
|---|---|---|
| White text on AnyoneHome `surface-interactive-default` (emerald-70) | 3.77:1 | 4.5:1 |
| White text on Inhabit `surface-interactive-default` (amber-70) | 3.19:1 | 4.5:1 |
| Several light-mode status text on subtle-bg pairings | 3.3–4.4:1 | 4.5:1 |
| Light-mode `text-secondary` on `surface-main` | ~3.9:1 | 4.5:1 |
| Dark-mode `text-secondary` on `surface-main` (neutral-110) | ~3.9:1 | 4.5:1 |

These are not bugs to "fix" by editing tokens. The `audit-theme-contrast`
CI job will fail with these present; that failing CI is the surface the
design conversation happens on. Fix paths (any of which require
explicit user direction):

1. Accept the failing contrasts as documented exceptions.
2. Change the foreground token at the **non-`uds/`** layer (e.g. a
   `.sg-*` site-CSS class) — does NOT apply to a `.udc-*` component
   class, since those are inside the design system.
3. Change a component to bind a different foreground token, performed
   via `sync-figma-component-spec` after the designer updates Figma.
4. Bump the offending token value in Figma, then run
   `import-figma-tokens` to resync the code-side `semantic.css`.

### ARIA guidance (informational)

The following ARIA usage patterns are accepted modern conventions, but
**applying them to existing UDS components is a design-system change**
(public component contract change) and must flow through Figma + a
`sync-figma-component-spec` round-trip, not an autonomous agent edit:

- **Tabs**: `<button role="tab">` inside `<div role="tablist">`. Sites
  consuming UDS need this for axe-core compliance; if a UDS component
  is missing it, surface as a Figma-side spec gap.
- **Navigation items**: `aria-current="page"` (not `aria-selected`)
  for the currently-active nav link.
- **Toggle buttons**: `aria-pressed="true"` (not `aria-selected`).
- **Icon-only buttons**: must have `aria-label`.

These conventions apply freely to **site-CSS** code (`.sg-*` classes,
`uds-docs/docs/*`, `uds-docs/index.html`) — that's documentation-site
chrome, not the design system.

## Standard task flow for an agent

### To make a SITE change (anything in docs/, index.html, scripts/):

1. `bash uds-docs/bump-site.sh` (preflight — bumps SITE version)
2. Make the change
3. Add a `SITE_CHANGELOG` entry in `docs/data/site-changelog.js` matching the new version
4. Cache-bust `docs/app.js`, `uds/uds.css`, etc. in `index.html` if their files changed
5. `git add -A && git commit -m "<concise message>" && git push`

### To update a UDS COMPONENT (change CSS, spec, examples, etc.):

1. Find the component folder: `uds/components/<id>/`
2. Edit the relevant file:
   - **CSS** → `<id>.css`
   - **Spec** (description, props, accessibility, etc.) → `spec.json`
   - **Examples** → `examples/<variant>.html` (and update `manifest.json` if adding variants)
   - **Status** (lifecycle change) → `status.json`
   - **Changelog** entry (new release entry for this component) → `changelog.json`, `entries[]` (oldest first)
   - **Implementation Reference** (Code-tab tokens/HTML/JS) → `impl.json`
   - **Playground config** → `playground.js` (default export)
3. If you changed `changelog.json`, run `bash scripts/aggregate-changelog.sh` to refresh `uds/CHANGELOG.json`
4. If you added/removed a component, run `bash scripts/aggregate-components.sh` to refresh the manifest
5. Run audits to make sure nothing's broken:
   ```
   bash scripts/audit-component-completeness.sh
   bash scripts/audit-placeholders.sh
   bash scripts/audit-token-usage.sh
   ```
6. If the change touched colors or themes, also run:
   ```
   # Server + headless Chrome must be running first; CI does this automatically.
   bash scripts/audit-theme-contrast.sh
   ```
7. Bump SITE + commit per the SITE flow above

### To bump UDS to a new version:

1. Use `uds-docs/release.sh <NEW_VERSION>`. It snapshots the current `uds/`
   into `versions/<CURRENT_VERSION>/uds/`, bumps `uds/version.json`, updates
   `versions.json`, runs `aggregate-changelog.sh`, and triggers `bump-site.sh`.

### To prune an old archive:

1. `bash scripts/prune-version.sh <version>` — removes the snapshot folder,
   updates `versions.json`, logs to `versions/PRUNED.md`. **Does NOT touch
   any per-component changelog data — UDS history is preserved forever.**

## Don't do

- **Don't autonomously modify anything under `uds-docs/uds/`** — that
  whole directory is Figma's source of truth (tokens, component CSS,
  spec.json, examples, schemas, all of it). Surface findings; don't
  apply fixes. See `.cursor/rules/uds-source-of-truth.mdc` for the full
  rule, the prohibited-edit list, and the authorized write paths
  (`import-figma-tokens`, `sync-figma-component-spec`, etc.). A failing
  `audit-theme-contrast.sh` is NOT a license to bump a token; it's a
  design conversation in disguise.
- Don't add framework code (React/Vue/Svelte) anywhere. The site is vanilla.
- Don't put component spec content directly in `index.html` — edit
  `uds/components/<id>/spec.json` (the Guidelines tab renders from it).
- Don't put example HTML directly in `index.html` — edit
  `uds/components/<id>/examples/*.html` (the docs page Examples tab AND the
  Demo Builder both render from these files).
- Don't skip the SITE bump preflight when changing site code.
- Don't write to `uds/CHANGELOG.json` or `uds/components.json` by hand —
  they're regenerated by `aggregate-changelog.sh` and `aggregate-components.sh`
  respectively.
- Don't bypass `udsResolve()` for UDS-data fetches in `docs/`. New
  fetches like `fetch('./uds/components/foo/spec.json')` will work in
  the live view but break in archive views. Use
  `fetch(udsResolve('components/foo/spec.json'))` and gate on
  `versionsReady`.
- Don't add new top-level folders for caching external integrations
  (Storybook, Figma exports, etc.) inside `uds/`. Per convention, those
  go as siblings: `storybook-cache/`, `integrations/figma/`, etc. `uds/`
  stays clean and copy-portable.
- Don't auto-delete tokens or components on a UDS sync. Missing items get
  reported and (after explicit confirmation) deprecated; never wholesale
  removed silently.
- Don't manually edit component CSS imports in `uds/uds.css` —
  `migrate-component.sh` regenerates them by walking the components dir.

## Cursor cloud agent specifics

- `.cursor/environment.json` declares an empty install and starts
  `python3 -m http.server 4000` inside `uds-docs/`. The server is the only
  thing needed to serve the site.
- `.cursor/desktop-preview.sh` launches Chrome at `http://localhost:4000/`
  and arranges the window in the cloud agent VM.
- All shell scripts in `scripts/` are POSIX-friendly Linux/Mac.
- Headless Chrome via DevTools Protocol is the standard way to verify
  rendering during agent runs (see `scripts/baseline-screenshot.sh`).

## Common subagents

- **`spec-audit`** — read-only, audits `uds/components/*/spec.json` files
  and reports completeness gaps.

## Common skills

- **`new-component`** — scaffolds a new component folder with all required
  files. Use when adding a new component to UDS.
- **`uds-updated`** — orchestrates the full UDS sync workflow from Figma
  through to commit. Used when the user says "UDS updated."
