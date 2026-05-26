---
name: post opus findings
overview: 'Fresh findings from a second review of `cursor/migration-next-stack` after Opus''s review-driven fixes. This pass validates the patched staging site and calls out remaining functional, archive, tooling, and a11y gaps, with special attention to appearance state across navigation.'
todos:
  - id: theme-navigation
    content: Preserve appearance settings across internal navigation and reloads; avoid full document reloads for internal docs links.
    status: completed
  - id: archive-initialization
    content: Initialize archive version before UDS-data fetches and validate unknown ?uds values.
    status: completed
  - id: archive-payload-contract
    content: 'Align 0.2 archive payload, archive UI, and AGENTS archive contract for examples and impl data.'
    status: completed
  - id: content-link-routing
    content: Route static prose links through version-aware client navigation and preserve archive query params.
    status: completed
  - id: regression-ci
    content: Decide whether to add the browser regression check to CI and document the expected gate.
    status: completed
isProject: false
---
# UDS Docs Next.js Migration Findings - Post-Opus Pass

## Review target

- Branch: `cursor/migration-next-stack`
- Reviewed remote commit: `c655057` (`Merge review-driven fixes into production branch`)
- Staging: `https://staging.udsdocs.com`
- Staging SITE label observed: `SITE 2026.05.25.1`
- Legacy reference: `https://udsdocs.com`
- Browser evidence from this pass: `/tmp/uds-next-review-2/report.json`

## What Opus appears to have fixed

These earlier findings validated as fixed on staging or in code:

- Archive sidebar links now preserve `?uds=0.2` for sidebar navigation.
- Archive sidebar filters out components absent from the 0.2 manifest.
- Archive view hides Build Demo and Playground.
- Deferred components like Combobox no longer show the Playground tab.
- Playground Implementation Reference now loads Dropdown CSS/JS instead of `/uds/uds/...` 404s.
- Token Search now traps focus and exposes results as options.
- The Next build/lint/test/type-generation CI job exists, and `ws` / `serve` are declared.

## Current findings

### 1. Appearance settings reset on page navigation

- Severity: major
- Area: functional / architecture
- Location: [`/workspace/uds-docs/components/site/UdsThemeProvider.tsx`](/workspace/uds-docs/components/site/UdsThemeProvider.tsx), [`/workspace/uds-docs/components/site/SgSidebar.tsx`](/workspace/uds-docs/components/site/SgSidebar.tsx), [`/workspace/uds-docs/components/site/SgHeader.tsx`](/workspace/uds-docs/components/site/SgHeader.tsx)
- Description: Theme state is memory-only. Sidebar navigation uses normal anchors, which cause a full document navigation. The selected appearance attributes are removed and the theme bar returns to Light / Base / Inter / Default.
- Repro: Open `https://staging.udsdocs.com/button`, choose Dark + ResMan + Poppins, click Changelog in the sidebar. The URL changes to `/changelog`, but `data-color-scheme`, `data-theme`, and `data-font` are all cleared.
- Suggested fix: Use client-side navigation for internal links so providers persist across pages, and/or persist appearance to `localStorage` with a small head-side bootstrap script to avoid a default-theme flash on reload.

### 2. Internal docs links still cause full page reloads

- Severity: major
- Area: architecture / perf / functional
- Location: [`/workspace/uds-docs/components/site/SgSidebar.tsx`](/workspace/uds-docs/components/site/SgSidebar.tsx), [`/workspace/uds-docs/components/site/ActiveSgSidebarLink.tsx`](/workspace/uds-docs/components/site/ActiveSgSidebarLink.tsx), [`/workspace/uds-docs/components/site/ComponentSidebarLink.tsx`](/workspace/uds-docs/components/site/ComponentSidebarLink.tsx)
- Description: The migration moved to Next.js, but core internal navigation still uses plain `<a>` tags. That reloads the document, resets provider state, reruns initial data loading, and makes the app behave less like the legacy SPA.
- Repro: Same as finding 1; the page reload is also visible through the repeated `Loading component data...` / token-search boot state.
- Suggested fix: Wrap version-aware hrefs in `next/link` or a small internal link component that combines `withUdsVersion()` with Next client navigation.

### 3. Archive deep links fetch live data before archive data

- Severity: major
- Area: archive / functional
- Location: [`/workspace/uds-docs/components/site/UdsVersionProvider.tsx`](/workspace/uds-docs/components/site/UdsVersionProvider.tsx), [`/workspace/uds-docs/app/(site)/[componentId]/ComponentPageClient.tsx`](/workspace/uds-docs/app/(site)/[componentId]/ComponentPageClient.tsx)
- Description: `activeVersion` starts as `null` and `?uds=` is read in a mount effect. On a hard load of an archive URL, component fetchers first request live `./uds/...`, then re-fetch `./versions/0.2/...`.
- Repro: Load `https://staging.udsdocs.com/button?uds=0.2`. Network evidence shows both `/uds/components/button/spec.json` and `/versions/0.2/uds/components/button/spec.json`.
- Suggested fix: Initialize archive state synchronously from `window.location.search`, or gate UDS-data fetching behind a `versionReady` state so archive deep links never fetch live data first.

### 4. 0.2 archive payload is missing examples and impl data

- Severity: major
- Area: archive / content parity
- Location: [`/workspace/uds-docs/versions/0.2/uds/components/button/`](/workspace/uds-docs/versions/0.2/uds/components/button/), [`/workspace/uds-docs/versions/0.2/uds/components/dropdown/`](/workspace/uds-docs/versions/0.2/uds/components/dropdown/), [`/workspace/AGENTS.md`](/workspace/AGENTS.md)
- Description: The archive contract says `examples/*.html`, `examples/manifest.json`, and `impl.json` are versioned per `?uds=`, but the 0.2 component folders only contain CSS/spec/status/changelog for sampled components. The archive Examples tab therefore claims there are no examples.
- Repro: Open `https://staging.udsdocs.com/button?uds=0.2`. The Examples tab says `No examples are documented for button yet.` Network 404s include `/versions/0.2/uds/components/button/examples/manifest.json` and `/versions/0.2/uds/components/button/impl.json`.
- Suggested fix: Either backfill the 0.2 archive with examples and impl files, or change the archive contract/UI so Examples and impl-backed content are clearly current-only or unavailable in archive mode.

### 5. Archive contract documentation contradicts the implemented behavior

- Severity: medium
- Area: architecture / docs
- Location: [`/workspace/AGENTS.md`](/workspace/AGENTS.md)
- Description: The new archive contract says examples and `impl.json` are versioned, then later says Implementation Reference is hidden because it uses live-only modules and live paths. Staging currently hides Playground/Implementation Reference but still shows the Examples tab, which fetches missing archive examples.
- Repro: Compare AGENTS archive contract text with `button?uds=0.2` behavior and the 0.2 component folder contents.
- Suggested fix: Decide one archive contract and make AGENTS, UI behavior, and archive payload shape agree.

### 6. Invalid `?uds=` values are accepted as archive versions

- Severity: medium
- Area: functional / archive
- Location: [`/workspace/uds-docs/components/site/UdsVersionProvider.tsx`](/workspace/uds-docs/components/site/UdsVersionProvider.tsx), [`/workspace/uds-docs/components/site/VersionDropdown.tsx`](/workspace/uds-docs/components/site/VersionDropdown.tsx)
- Description: Any `?uds=` value becomes the active archive version if it differs from live. The banner can show UDS 9.9 while the dropdown shows UDS 0.3, and component fetches 404.
- Repro: Open `https://staging.udsdocs.com/button?uds=9.9`. The banner says `You're viewing UDS 9.9`, the dropdown value is 0.3, and the page shows `Couldn't load component`.
- Suggested fix: Validate URL params against `versions.json`. Unknown versions should redirect to live, remove the query param, or show a specific invalid-version state.

### 7. Root redirect drops the archive query from the URL

- Severity: medium
- Area: functional / archive
- Location: [`/workspace/uds-docs/app/(site)/page.tsx`](/workspace/uds-docs/app/(site)/page.tsx)
- Description: The home page redirects to `/semantic-colors` without preserving the search string. The in-memory provider can still show the archive banner, but the URL no longer contains `?uds=0.2`, so a refresh loses archive context.
- Repro: Open `https://staging.udsdocs.com/?uds=0.2`. It lands on `https://staging.udsdocs.com/semantic-colors` while still showing the UDS 0.2 archive banner.
- Suggested fix: Preserve the search params in the root redirect, e.g. `/semantic-colors${window.location.search}` or a version-aware route helper.

### 8. Static content links bypass the version-aware href helper

- Severity: medium
- Area: functional / archive / navigation
- Location: [`/workspace/uds-docs/app/(site)/about/page.tsx`](/workspace/uds-docs/app/(site)/about/page.tsx), [`/workspace/uds-docs/app/(site)/design-language/page.tsx`](/workspace/uds-docs/app/(site)/design-language/page.tsx), [`/workspace/uds-docs/app/(site)/design-process/page.tsx`](/workspace/uds-docs/app/(site)/design-process/page.tsx), [`/workspace/uds-docs/app/(site)/getting-started/page.tsx`](/workspace/uds-docs/app/(site)/getting-started/page.tsx)
- Description: Opus fixed sidebar links, but content pages still contain raw internal links like `href="/semantic-colors"` and `href="/cursor-workflows"`. Those links drop `?uds=` and also trigger the appearance reset described above.
- Repro: In archive mode, click internal links embedded in About, Design Language, Design Process, or Getting Started copy.
- Suggested fix: Introduce a small reusable internal-link component or content transform for site prose links that preserves `?uds=` and uses client navigation.

### 9. Changelog archive fetch failure still falls back to live data

- Severity: medium
- Area: archive / data correctness
- Location: [`/workspace/uds-docs/app/(site)/changelog/ChangelogClient.tsx`](/workspace/uds-docs/app/(site)/changelog/ChangelogClient.tsx)
- Description: On archive changelog fetch failure, the client explicitly resets to the build-time live changelog. That can show live release history while the UI says the user is viewing an archive.
- Repro: Code path at `getChangelog(fetchVersion).catch(() => setUdsChangelog(initialUdsChangelog))`; this is still present after the patch.
- Suggested fix: Show a scoped archive error or empty state instead of substituting live changelog data.

### 10. Regression browser check exists but is not part of CI

- Severity: medium
- Area: tooling / CI
- Location: [`/workspace/uds-docs/package.json`](/workspace/uds-docs/package.json), [`/workspace/.github/workflows/next-build.yml`](/workspace/.github/workflows/next-build.yml), [`/workspace/uds-docs/scripts/regression-recovery-check.mjs`](/workspace/uds-docs/scripts/regression-recovery-check.mjs)
- Description: `regression-check` is now declared and has more cases, but the Next CI workflow runs generated types, TypeScript, lint, unit tests, and build only. It does not run the browser regression check.
- Repro: Inspect `.github/workflows/next-build.yml`; there is no `npm run regression-check` step.
- Suggested fix: Decide whether the CDP regression check should be a CI gate. If yes, add Chrome setup and run it after `npm run build`.

### 11. Theme controls do not expose pressed state to assistive tech

- Severity: minor
- Area: a11y
- Location: [`/workspace/uds-docs/components/site/SgHeader.tsx`](/workspace/uds-docs/components/site/SgHeader.tsx)
- Description: Theme buttons visually toggle through `active` class and primary/secondary button styles, but they do not set `aria-pressed`. Screen reader users do not get the same selected-state signal.
- Repro: Inspect `ThemeButton`; it renders a plain `<button>` with no `aria-pressed`.
- Suggested fix: Add `aria-pressed={active}` to `ThemeButton`.

## Recommended fix order

1. Fix appearance persistence and internal navigation together: use client-side internal links and persist theme state across reloads.
2. Fix archive initialization so deep links do not fetch live data first.
3. Resolve the archive payload/contract mismatch for examples and impl data.
4. Validate `?uds=` values and preserve query params in the root redirect and content links.
5. Decide whether `regression-check` should run in CI.
6. Add small a11y polish for theme button pressed states.
