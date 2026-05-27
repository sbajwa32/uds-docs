# UDS Documentation Site — Agent Notes

This repo is the design-to-engineering specification for the **Urban Design
System (UDS)**. The deployed site is hosted on Cloudflare Pages.

The site is a Next.js 15 + TypeScript + React app, built as a static export
(`output: 'export'`). Edit files, push, Cloudflare auto-deploys.

The pre-migration vanilla HTML/CSS/JS app under `uds-docs/docs/` +
`uds-docs/index.html` was migrated to Next.js across Chunks 01–17 of the
docs-site rewrite. Chunk 17 deletes the legacy tree entirely.

## Repo layout

```
uds-docs/                              # Repo root (the Next.js app)
├── package.json                       # Next.js 15 + React 19 + TypeScript
├── next.config.ts                     # output: 'export' (static build to out/)
├── tsconfig.json
├── AGENTS.md                          # This file
├── README.md                          # Public-facing readme
│
├── app/                               # Next.js App Router
│   ├── layout.tsx                     # Root layout (HTML scaffold, fonts, UDS CSS, ThemeProvider)
│   ├── (site)/                        # Public-facing pages with site chrome
│   │   ├── layout.tsx                 # Site shell (header, sidebar, archive banner)
│   │   ├── page.tsx                   # Home
│   │   ├── [componentId]/             # Dynamic per-component pages
│   │   │   ├── page.tsx               # Static shell (generateStaticParams from components.json)
│   │   │   ├── ComponentPageClient.tsx  # Tab state + version-aware fetches
│   │   │   ├── GuidelinesTab.tsx, CodeTab.tsx, ExamplesTab.tsx,
│   │   │   ├── ChangelogTab.tsx, FigmaNotesTab.tsx
│   │   ├── changelog/, contrast-checker/, design-language/,
│   │   ├── cursor-workflows/, design-process/, ai-assist/,
│   │   └── ... (all content pages)
│   └── (dev)/dev/kit/                 # Dev-only kit-sink (chrome QA)
│
├── components/site/                   # React components for site chrome + features
│   ├── SgHeader.tsx, SgSidebar.tsx, SgMain.tsx, SgPageHeader.tsx,
│   ├── SgSkipLink.tsx                 # .sg-* chrome primitives (Chunk 04)
│   ├── SiteHeader.tsx, SiteSidebar.tsx  # Composed shell (Chunk 05)
│   ├── UdsThemeProvider.tsx           # 6-theme context (Chunk 03)
│   ├── UdsVersionProvider.tsx, ArchiveBanner.tsx, VersionDropdown.tsx  # Archive viewing (Chunk 14)
│   ├── TokenSearch.tsx                # Command palette (Chunk 10)
│   ├── Playground.tsx                 # Per-component playground engine (Chunk 09)
│   ├── DemoBuilder.tsx                # Build Demo dialog + overlay (Chunk 12b)
│   ├── ContrastChecker.tsx, ContrastCheckerPicker.tsx  # Contrast tool (Chunk 11)
│
├── lib/                               # Pure data + helpers (no React)
│   ├── uds-data.ts                    # Typed async fetchers + udsResolve(path, version?)
│   ├── color-math.ts                  # WCAG luminance + contrastRatio + verdict
│   ├── examples-renderer.ts           # Canonical substitution + manifest fetcher
│   ├── uds-token-probes.ts            # Token harvest + per-theme RGB resolution
│   ├── contrast-checker-data.ts       # THEME_PROFILES, CURATED_PAIRINGS, MATRIX_SURFACES
│   └── demo-builder/                  # rng.ts, data-pools.ts, substitution.ts, assembler.ts,
│                                      # generate-html.ts, zip.ts, history.ts (+ Vitest tests)
│
├── data/                              # Typed data tables
│   ├── site-changelog.ts              # SITE_CHANGELOG (docs-site history)
│   ├── completeness-fields.ts         # COMPLETENESS_FIELDS + SPEC_FIELD_LABELS
│   ├── status-labels.ts               # STATUS_LABELS + STATUS_STEPS
│   └── component-api/<id>.ts          # Per-component Code-tab API tables
│
├── styles/                            # Plain CSS (not CSS Modules)
│   ├── site/                          # Site chrome (.sg-*): base, header, sidebar,
│   │                                  # main, page-chrome, shell, skip-link, theme-bar,
│   │                                  # token-search, archive-banner, figma-notes, demo-builder
│   └── pages/                         # Page-local styles (legacy.css, contrast-checker.css)
│
├── types/uds.ts                       # Generated TypeScript types from uds/schemas/*.schema.json
├── public/_headers                    # Cloudflare cache policy
├── scripts/                           # postbuild-copy, gen-types, smoke/audit helpers
├── packages/
│   ├── uds-web-components/            # Lit-based <udc-*> implementations + browser bundle
│   └── uds-react/                     # React wrappers around the Web Components
└── vitest.config.ts                   # Vitest config for lib/**/*.test.ts
│
├── uds/                               # THE DESIGN SYSTEM — fully self-contained, version-aware
│   ├── version.json                   # { version, released, schemaVersion } — single source of truth for current UDS version
│   ├── components.json                # Manifest: list of every component in this release (id, title, since). Source of truth for "which components exist". Generated by aggregate-components.sh.
│   ├── CHANGELOG.json                 # Aggregated release-level changelog (built from per-component changelogs)
│   ├── CHANGELOG.globalNotes.json     # Hand-curated non-component release notes (per version)
│   ├── tokens/
│   │   ├── primitives.css
│   │   ├── semantic.css               # 6 theme combos. WCAG AA contract is Figma-defined; some known AA failures (see "Accessibility contract" below).
│   │   ├── layers.css
│   │   └── text-styles.css
│   ├── uds.css                        # Token entrypoint; component runtime CSS lives in Web Component shadow DOM
│   ├── schemas/                       # JSON Schemas for every per-component file
│   │   ├── spec.schema.json
│   │   ├── manifest.schema.json
│   │   ├── status.schema.json
│   │   ├── changelog.schema.json
│   │   ├── version.schema.json
│   │   ├── components-manifest.schema.json   # Phase 13b — describes components.json
│   │   ├── impl.schema.json                  # Phase 13c — describes impl.json
│   │   └── placeholder-vocabulary.json
│   └── components/
│       └── <id>/                      # ONE folder per component — single source of truth
│           ├── <id>.css               # Token-only compatibility/stub CSS; runtime styles live in @uds/web-components
│           ├── spec.json              # Conforms to spec.schema.json. Has figmaNodeId (variant) + figmaPageNodeId (page-level).
│           ├── status.json            # { current, since, history[] }
│           ├── changelog.json         # All component history (oldest first within entries[])
│           ├── impl.json              # Implementation Reference data: { jsFunc, jsFile, tokens, html }
│           ├── playground.js          # ES module — default-exports the PLAYGROUND config. Loaded via dynamic import().
│           └── examples/
│               ├── manifest.json      # Lists examples, their labels, demoWeight, showInDocs
│               └── *.html             # Per-variant example HTML — read by docs page AND Demo Builder
│
├── versions/                          # UDS-only snapshots per release (post-Phase-14)
│   ├── 0.2/uds/                       # Same shape as live uds/ — components/, schemas/, CHANGELOG.json, etc.
│   └── PRUNED.md                      # Audit trail of pruned snapshots (history is preserved forever)
│
├── scripts/                           # Repo-level tooling (at REPO root, not under uds-docs)
│   ├── aggregate-changelog.sh         # Walks per-component changelogs → uds/CHANGELOG.json
│   ├── aggregate-components.sh        # Walks uds/components/<id>/ → uds/components.json
│   ├── prune-version.sh               # Removes a snapshot folder (keeps changelog history)
│   ├── audit-component-completeness.sh # Each per-component folder has all required files
│   ├── audit-demo-coverage.sh         # Every implementable component has ≥1 demoSuitable example
│   ├── audit-placeholders.sh          # Every {{token}} used is in placeholder-vocabulary.json
│   ├── audit-token-usage.sh           # Per-component CSS uses --uds-* tokens, no hardcoded colors
│   ├── audit-figma-card-template.sh   # Component-card template recipe currency
│   └── ...                            # plus changelog/aggregate/figma-sync/css-api/doc-internal/agent-docs/toolchain audits
│
└── uds-docs/release.sh                # Snapshots uds/ → versions/<X>/uds/, bumps uds/version.json
```

## Version tracking

The repo tracks the **UDS version** (e.g. `0.3`) — the design system.
Lives in `uds/version.json`. Bumped manually via `uds-docs/release.sh`
when there are real spec changes. Per-component changelogs feed into
`uds/CHANGELOG.json`.

Pre-migration there was also a SITE version (`version.txt`,
`bump-site.sh`, `?v=N` cache-bust query params, runtime auto-reload
polling). That apparatus was deleted in Chunk 17 of the Next.js
migration. Cloudflare handles cache invalidation now (per
`uds-docs/public/_headers`), and Next.js content-hashes its own static
assets — there's nothing for an agent to bump. The
`uds-docs/data/site-changelog.ts` file survives as the human-curated
docs-site history (rendered on the Changelog page's SITE tab).

## Per-component co-location (the structural drift fix)

Every component lives in `uds/components/<id>/` as a single folder
containing every fact about that component:

| File | Purpose |
|---|---|
| `<id>.css` | Token-only compatibility/stub CSS for the docs payload. Runtime styles live in `@uds/web-components` shadow DOM. Audited by `audit-token-usage.sh`. |
| `spec.json` | Spec data the docs Guidelines tab renders from. Conforms to `spec.schema.json`. Has both `figmaNodeId` (variant-level deep-link) and `figmaPageNodeId` (page-level fallback). |
| `status.json` | Current lifecycle status + since-version + history. |
| `changelog.json` | All component history, oldest first. Source of truth for UDS changelogs. |
| `impl.json` | Implementation Reference data — `{ jsFunc, jsFile, tokens, html }`. Powers the Code-tab "Implementation Reference" details. |
| `playground.js` | ES module that default-exports the playground config. Loaded via dynamic `import()` so the docs page and the archive-view both work. |
| `examples/manifest.json` | Lists examples with labels, demoWeight, showInDocs. |
| `examples/*.html` | Per-variant example HTML. **Read by docs page AND Demo Builder — same files, no drift.** |

Runtime implementation is no longer a per-component vanilla JS layer. Current
component code lives in `packages/uds-web-components/src/components/**`; React
consumers use the wrappers in `packages/uds-react/src/index.tsx`. Do not revive
`uds/uds.js` or add new `uds/components/<id>/<id>.js` behavior files.

The Demo Builder fetches `examples/*.html` and applies random token
substitution (`lib/demo-builder/substitution.ts` → `RANDOM_POOL` from
`lib/demo-builder/data-pools.ts`). The docs page Examples tab fetches
the same files and substitutes against the canonical pool
(`lib/examples-renderer.ts` → `CANONICAL_POOL`). Same files, two
substituters — drift between Demo Builder previews and the docs page
is structurally impossible.

## Version-aware data fetching

The version dropdown in the header doesn't navigate to a frozen folder —
it sets `?uds=X.Y` on the URL and the React app re-renders the archive
by reading data through `lib/uds-data.ts` with the version arg
threaded through from `useUdsVersion()`. Bug fixes to docs UI flow
automatically to historical views.

`UdsVersionProvider` (in `components/site/UdsVersionProvider.tsx`)
reads `?uds=` from `window.location.search` and exposes
`fetchVersion: string | undefined` to consumers. Every page-level
fetch (`ComponentPageClient`, `ChangelogClient`, `Playground`,
`ExamplesTab`) consumes it. The legacy `udsResolve()` and
`versionsReady` helpers from `docs/helpers/uds-path.js` are gone;
everything goes through `lib/uds-data.ts`:

```ts
import { useUdsVersion } from '@/components/site/UdsVersionProvider';
import { getComponentSpec } from '@/lib/uds-data';

function ComponentPage({ componentId }: { componentId: string }) {
  const { fetchVersion } = useUdsVersion();
  // Returns the live spec on /component-id; returns the 0.2 archived
  // spec on /component-id?uds=0.2.
  const spec = useFetch(() => getComponentSpec(componentId, fetchVersion));
  // ...
}
```

The `Playground` dynamic `import()` resolves
`new URL(udsResolve('components/<id>/playground.js', fetchVersion), document.baseURI).href`
so any deploy origin (live, preview, archive view) loads the right module.

### Archive contract (`?uds=<old-version>`)

**Archive snapshots are content-only.** The active UDS payload (CSS, JS,
playground modules, demo-builder assemblies) is always the live release.
Only versioned **data** flips when you switch the dropdown, and even
within that "versioned data" set, the historical archives in this repo
are not symmetric — older snapshots may only carry a subset of the
per-component files.

#### What's versioned in principle

Files that the docs site fetches with the `fetchVersion` arg and will
honor when present in `versions/<X>/uds/...`:

- `version.json`, `components.json`, `CHANGELOG.json`,
  `CHANGELOG.globalNotes.json`
- per-component `spec.json`, `status.json`, `changelog.json`,
  `impl.json`, `figmanotes.json`, `examples/manifest.json`,
  `examples/*.html`
- per-component `<id>.css` (consumed only by the Implementation
  Reference Styles tab; the live page chrome still uses live tokens)

#### What each archive actually ships

The 0.2 snapshot in this repo only carries `<id>.css`, `spec.json`,
`status.json`, `changelog.json` per component, plus the top-level
manifests. **It does not carry `examples/`, `impl.json`, `playground.js`,
or `figmanotes.json`.** That's why archive views hide Playground +
Implementation Reference + Build Demo (those tabs need files the archive
doesn't have) and the Examples tab surfaces a scoped "Examples aren't
archived for this UDS version" message instead of pretending the
component has no examples.

Future archives created via `uds-docs/release.sh` follow the same
content-only contract by default. Backfilling a sparse archive
(`versions/0.2/`) with examples/impl requires explicit user direction —
those files are part of Figma's source of truth for that release and
need a deliberate decision, not an autonomous agent edit.

#### What's always live (not versioned per `?uds=`)

- `uds/tokens/*.css`, `uds/uds.css`, and the live `web-components.js` browser bundle
- The Code-tab API tables in `data/component-api/<id>.ts`
- The React UI itself

The trade-off: docs UI improvements automatically benefit historical
views (you don't rebuild old archives to get a fixed sidebar tooltip),
but a 0.2 archive view renders 0.2 spec content with the live release's
tokens and component CSS. If a token value or class name changed between
0.2 and 0.3, the archive will visually disagree with what shipped at 0.2.

#### How the docs site keeps the contract honest

1. **`SiteSidebar` filters component links** against the active version's
   `components.json` manifest, so a 0.2 archive doesn't surface
   components that didn't exist yet (Link, Label, Text Area, Combobox,
   Date Picker, Toggle, Pagination, Data View).
2. **Sidebar, header, prose, and content links preserve `?uds=`** via
   `components/site/internal-href.ts`'s `withUdsVersion()` helper.
   Sidebar links use `next/link` for client-side navigation; static
   prose pages route through `components/site/ProseContent.tsx` which
   intercepts internal-link clicks and rewrites `href` for middle-click
   open-in-new-tab.
3. **Features that depend on live-only modules are hidden in archive**:
   Playground tab, Implementation Reference, Build Demo trigger.
4. **Unknown `?uds=` values are dropped.** `UdsVersionProvider`
   validates the query param against `versions.json` once the manifest
   loads; an unknown version (e.g. `?uds=9.9`) is cleared from the URL
   so the user doesn't see a "viewing UDS 9.9" banner over 404s.
5. **Archive-mode changelog failures surface a scoped error.** If
   `versions/<X>/uds/CHANGELOG.json` 404s, the page tells the reader
   the archive has no changelog instead of silently substituting the
   live changelog.

#### Path to fully versioned archives

If we later want fully versioned archives (tokens + component runtime frozen per
release), the lift is: load `versions/<v>/uds/uds.css` and a versioned
`web-components.js` bundle based on `fetchVersion`, version the Code-tab API
data into `versions/<v>/uds/components/<id>/api.json`, gate Playground/Demo
Builder on per-version module availability, and backfill the existing archives
with the missing per-component files. Not required for the current
designer-facing use of archives.

## Snapshot + pruning policy

- **Snapshots** (`versions/<X>/uds/`) freeze ONLY the `uds/` design system —
  not the whole docs site. The React app renders any version's UDS
  data via `lib/uds-data.ts` + `useUdsVersion()`, so docs improvements
  automatically benefit historical views.
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

The **Contrast Checker** tool at `/contrast-checker` evaluates every
text, icon, and border token against every surface token across all
**6 theme combinations**, computing WCAG ratios live from resolved CSS
variables. Use it after token imports or when reviewing contrast
trade-offs.

Whether a failing pairing is a bug or an accepted design trade-off is a
design decision recorded in Figma — never an agent call. See
`.cursor/rules/uds-source-of-truth.mdc` for the full rule.

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

These are not bugs to "fix" by editing tokens. Use the Contrast Checker
to review them and decide in Figma. Fix paths (any of which require
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

These conventions apply freely to **site chrome** (`.sg-*` classes
under `uds-docs/styles/site/`, React components under
`uds-docs/components/site/`, pages under `uds-docs/app/`) — that's
documentation-site chrome, not the design system.

## Standard task flow for an agent

### To make a SITE change (anything under `uds-docs/` outside `uds/`):

1. Make the change (edit React components, CSS, data tables, etc.).
2. Add a `SITE_CHANGELOG` entry to `uds-docs/data/site-changelog.ts`
   per [`.cursor/rules/uds-site-changelog.mdc`](.cursor/rules/uds-site-changelog.mdc).
3. `npm run build` from `uds-docs/` to confirm the static export still
   produces all pages.
4. `git add -A && git commit -m "<concise message>" && git push`.

There's no SITE bump preflight anymore — Cloudflare handles cache
invalidation (`uds-docs/public/_headers`) and Next.js content-hashes
its own static assets.

### To update a UDS COMPONENT (change spec, examples, implementation, etc.):

1. Find the component folder: `uds/components/<id>/`.
2. Edit the relevant file:
   - **Web Component runtime** → `packages/uds-web-components/src/components/<id>.ts`
   - **React wrapper** → `packages/uds-react/src/index.tsx`
   - **CSS payload stub** → `<id>.css` (tokens/stub only, not runtime behavior)
   - **Spec** (description, props, accessibility, etc.) → `spec.json`
   - **Examples** → `examples/<variant>.html` (and update `manifest.json` if adding variants)
   - **Status** (lifecycle change) → `status.json`
   - **Changelog entry** (new release entry for this component) → `changelog.json`, `entries[]` (oldest first)
   - **Implementation Reference** (Code-tab tokens/HTML/behavior notes) → `impl.json`
   - **Code-tab API table** (attributes/properties, slots, events, parts; not legacy runtime CSS classes) → `uds-docs/data/component-api/<id>.ts`
   - **Playground config** → `playground.js` (default export)
3. If you changed `changelog.json`, run `bash scripts/aggregate-changelog.sh`
   to refresh `uds/CHANGELOG.json`.
4. If you added/removed a component, run `bash scripts/aggregate-components.sh`
   to refresh the manifest, AND add/remove the sidebar link in
   `uds-docs/components/site/SiteSidebar.tsx`.
5. Run audits:
   ```
   bash scripts/audit-component-completeness.sh
   bash scripts/audit-placeholders.sh
   bash scripts/audit-token-usage.sh
   bash scripts/audit-css-api-table.sh
   bash scripts/audit-doc-internal-consistency.sh
   ```
6. If the change touched colors or themes, review pairings in the
   Contrast Checker at `/contrast-checker` after syncing from Figma.
7. Add a SITE_CHANGELOG entry and commit per the SITE flow above.

### To bump UDS to a new version:

1. Use `uds-docs/release.sh <NEW_VERSION>`. It snapshots the current `uds/`
   into `versions/<CURRENT_VERSION>/uds/`, bumps `uds/version.json`, updates
   `versions.json`, and runs `aggregate-changelog.sh`. (The pre-migration
   `bump-site.sh` call was removed in Chunk 17 of the docs Next.js migration.)

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
  (`import-figma-tokens`, `sync-figma-component-spec`, etc.).
  Contrast Checker findings are NOT a license to bump a token; surface
  them and wait for Figma direction.
- Don't add frameworks beyond what's already in `package.json`. The
  site is Next.js + React + plain CSS — no UI library, no CSS-in-JS,
  no extra state library.
- Don't put example HTML inline in React components — edit
  `uds/components/<id>/examples/*.html`. The Examples tab AND the
  Demo Builder both render from those files.
- Don't write to `uds/CHANGELOG.json` or `uds/components.json` by hand —
  they're regenerated by `aggregate-changelog.sh` and `aggregate-components.sh`
  respectively.
- Don't bypass `lib/uds-data.ts` for UDS-data fetches. Fetches like
  `fetch('./uds/components/foo/spec.json')` will work in the live view
  but break in archive views. Use the typed fetchers
  (`getComponentSpec(id, fetchVersion)`) and consume `fetchVersion`
  from `useUdsVersion()`.
- Don't add new top-level folders for caching external integrations
  (Storybook, Figma exports, etc.) inside `uds/`. Per convention, those
  go as siblings: `storybook-cache/`, `integrations/figma/`, etc. `uds/`
  stays clean and copy-portable.
- Don't auto-delete tokens or components on a UDS sync. Missing items get
  reported and (after explicit confirmation) deprecated; never wholesale
  removed silently.

## Cursor cloud agent specifics

- `.cursor/environment.json` declares the install and starts the
  Next.js dev server (or serves the built `out/` directory).
- All shell scripts in `scripts/` (at the repo root) are POSIX-friendly
  Linux/macOS.
- Headless Chrome via DevTools Protocol is the standard way to verify
  rendering during agent runs. The chunk-specific smoke tests under
  `uds-docs/scripts/chunk-*-smoke-test.mjs` are the patterns to follow
  for new headless-driven verifications. Use specific PIDs for
  cleanup; never `pkill -f` (which can take down the agent runtime).

## Common subagents

- **`spec-audit`** — read-only, audits `uds/components/*/spec.json` files
  and reports completeness gaps.

## Common skills

- **`new-component`** — scaffolds a new component folder with all required
  files. Use when adding a new component to UDS.
- **`uds-updated`** — orchestrates the full UDS sync workflow from Figma
  through to commit. Used when the user says "UDS updated."
