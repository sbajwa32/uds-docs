---
name: next migration findings
overview: 'Second-pass validation of the UDS Docs Next.js migration review. The document ranks confirmed staging parity issues, newly found archive/tooling/a11y gaps, and a recommended fix order before cutover.'
todos:
  - id: archive-contract
    content: 'Fix archive routing and archive-only UI: preserve ?uds, filter sidebar from active manifest, and disable/hide Playground, Demo Builder, and Implementation Reference in archive views.'
    status: pending
  - id: playground-paths
    content: Make Playground conditional per component and normalize Implementation Reference CSS/JS paths.
    status: pending
  - id: tooling-ci
    content: 'Declare browser-test dependencies, replace interactive linting, and add Next build/type/test/gen-types checks to CI.'
    status: pending
  - id: a11y-focus
    content: 'Add focus management and assistive-tech semantics for Token Search, Demo Preview, Spec popover, sidebar tooltip, and local tabsets.'
    status: pending
  - id: archive-policy
    content: Decide and document whether archive CSS and Code-tab API data should be versioned or intentionally current-only.
    status: pending
isProject: false
---
# UDS Docs Next.js Migration Findings

## Review target

- Branch: `cursor/migration-next-stack`
- Staging: `https://staging.udsdocs.com`
- Legacy reference: `https://udsdocs.com`
- Evidence from prior browser pass: `/tmp/uds-next-review/report.json`
- Constraint: do not change `uds-docs/uds/` autonomously; all proposed fixes stay in the Next/docs layer or tooling.

## Validated cutover blockers

- Severity: major
- Area: functional / architecture
- Location: [`/workspace/uds-docs/components/site/SgSidebar.tsx`](/workspace/uds-docs/components/site/SgSidebar.tsx), [`/workspace/uds-docs/components/site/ActiveSgSidebarLink.tsx`](/workspace/uds-docs/components/site/ActiveSgSidebarLink.tsx), [`/workspace/uds-docs/components/site/ComponentSidebarLink.tsx`](/workspace/uds-docs/components/site/ComponentSidebarLink.tsx)
- Finding: Archive navigation drops `?uds=0.2`. Sidebar links are plain `href="/button"` style anchors, so moving between pages exits archive mode.
- Repro: Open `https://staging.udsdocs.com/button?uds=0.2`, click `Dropdown`, URL becomes `/dropdown` and the archive banner disappears.
- Suggested fix: Create a version-aware internal link helper/component that preserves `?uds=<archive>` for sidebar/header links when `isArchive` is true.

- Severity: major
- Area: functional / architecture
- Location: [`/workspace/uds-docs/components/site/SiteSidebar.tsx`](/workspace/uds-docs/components/site/SiteSidebar.tsx)
- Finding: Archive sidebar lists live-only 0.3 components. The nav is a static array, so 0.2 still shows Link, Label, Text Area, Combobox, Date Picker, Toggle, Pagination, and Data View even though those are absent from the 0.2 manifest.
- Repro: Open `https://staging.udsdocs.com/link?uds=0.2`; page shows `Couldn't load component` because `versions/0.2/uds/components/link/spec.json` is missing.
- Suggested fix: Generate or filter component links from the active version's `components.json`. Hide or disable components not present in the selected archive.

- Severity: major
- Area: functional / visual
- Location: [`/workspace/uds-docs/app/(site)/[componentId]/ComponentPageClient.tsx`](/workspace/uds-docs/app/(site)/[componentId]/ComponentPageClient.tsx), [`/workspace/uds-docs/components/site/DemoBuilder.tsx`](/workspace/uds-docs/components/site/DemoBuilder.tsx), [`/workspace/uds-docs/styles/pages/legacy.css`](/workspace/uds-docs/styles/pages/legacy.css)
- Finding: Archive view exposes features legacy disables. Playground is visible, Build Demo is clickable, and Implementation Reference is reachable even though historical snapshots do not carry the required interactive modules.
- Repro: Open `https://staging.udsdocs.com/button?uds=0.2`, click Playground; it reports a failed dynamic import from `versions/0.2/uds/components/button/playground.js`. Build Demo remains active.
- Suggested fix: In archive mode, hide Playground and Implementation Reference and disable or hide Demo Builder. Also set `data-archive-view` on the document if retaining legacy CSS behavior.

- Severity: major
- Area: functional
- Location: [`/workspace/uds-docs/app/(site)/[componentId]/ComponentPageClient.tsx`](/workspace/uds-docs/app/(site)/[componentId]/ComponentPageClient.tsx)
- Finding: Deferred components show a broken Playground tab. Combobox, Data View, and Date Picker do not have `playground.js`, but the tab is still shown and the hidden Playground panel mounts immediately.
- Repro: Open `https://staging.udsdocs.com/combobox`; the page can surface `Couldn't load playground for combobox.../playground.js` even before the user intentionally needs that tab.
- Suggested fix: Only render the Playground tab when a component has a playground config. Conditionally mount the active panel instead of mounting all panels behind `hidden`.

- Severity: major
- Area: functional / code-quality
- Location: [`/workspace/uds-docs/components/site/Playground.tsx`](/workspace/uds-docs/components/site/Playground.tsx), [`/workspace/uds-docs/lib/uds-data.ts`](/workspace/uds-docs/lib/uds-data.ts)
- Finding: Implementation Reference CSS and JS fetches build bad URLs such as `/uds/uds/components/dropdown.css` and `/uds/uds/components/dropdown/dropdown.js`.
- Repro: Open `https://staging.udsdocs.com/dropdown`, go to Playground, expand Implementation Reference, click `Styles (CSS)` or `Behavior (JS)`; the panel shows `/* CSS file not found */` or `/* JS file not found */`.
- Suggested fix: Normalize `spec.dependencies.css` and `impl.jsFile` before passing through `udsResolve`, including stripping leading `uds/` and mapping legacy flat paths to per-component folder paths.

- Severity: major
- Area: architecture / functional
- Location: [`/workspace/uds-docs/lib/demo-builder/generate-html.ts`](/workspace/uds-docs/lib/demo-builder/generate-html.ts), [`/workspace/uds-docs/lib/demo-builder/zip.ts`](/workspace/uds-docs/lib/demo-builder/zip.ts), [`/workspace/uds-docs/components/site/DemoBuilder.tsx`](/workspace/uds-docs/components/site/DemoBuilder.tsx)
- Finding: Demo Builder always uses live UDS paths. Status dots are version-aware, but example fetches and generated assets are hardcoded to `./uds/...` or `/uds/...`.
- Repro: In `?uds=0.2`, Build Demo still builds from live component examples and live UDS CSS/JS.
- Suggested fix: If Demo Builder remains disabled in archive mode, guard it fully. If it needs archive support later, thread `fetchVersion` through `generateDemoHTML`, `fetchRawExample`, and ZIP generation using `udsResolve`.

- Severity: major
- Area: architecture / visual parity
- Location: [`/workspace/uds-docs/app/layout.tsx`](/workspace/uds-docs/app/layout.tsx)
- Finding: Archive views always use the live UDS stylesheet because the root layout imports `../uds/uds.css` statically. This means archive JSON can be from 0.2 while component CSS/tokens are still live 0.3.
- Repro: Any `?uds=0.2` page on staging still receives the bundled live UDS CSS from the Next build.
- Suggested fix: Decide archive contract. Either clearly label archive as content-only, or add a client-side versioned stylesheet swap for `versions/<version>/uds/uds.css`.

## Validated tooling and CI gaps

- Severity: major
- Area: code-quality / tooling
- Location: [`/workspace/uds-docs/package.json`](/workspace/uds-docs/package.json), [`/workspace/uds-docs/scripts/regression-recovery-check.mjs`](/workspace/uds-docs/scripts/regression-recovery-check.mjs), other CDP scripts under [`/workspace/uds-docs/scripts/`](/workspace/uds-docs/scripts/)
- Finding: Browser regression scripts import `ws`, but `ws` is not declared in dependencies. Many scripts also shell out to `npx serve` without `serve` declared.
- Repro: From a clean install, `npm ci && npm run build && node scripts/regression-recovery-check.mjs` fails with `Cannot find package 'ws'`.
- Suggested fix: Add `ws`, `@types/ws`, and `serve` as dev dependencies, then expose the checks through package scripts.

- Severity: major
- Area: tooling / CI
- Location: [`/workspace/uds-docs/package.json`](/workspace/uds-docs/package.json)
- Finding: `npm run lint` is interactive. It calls `next lint`, which prompts to configure ESLint and cannot be used safely in CI or agent runs.
- Repro: Run `npm run lint`; it prompts for Strict/Base/Cancel setup.
- Suggested fix: Add an explicit ESLint config and move to the ESLint CLI, or remove the lint script until configured.

- Severity: major
- Area: CI
- Location: [`/workspace/.github/workflows/audits.yml`](/workspace/.github/workflows/audits.yml)
- Finding: GitHub CI still only runs the bash audit layer. It does not run the Next app build, typecheck, unit tests, lint, type generation freshness, or regression checks.
- Repro: A PR can break TypeScript or `next build` while the `UDS Audits` workflow still passes.
- Suggested fix: Add a Node job for `npm ci`, `npm run gen:types` plus diff check, `npm run build`, `npm test`, and lint once configured.

- Severity: minor
- Area: tooling
- Location: [`/workspace/uds-docs/scripts/tab-sweep.mjs`](/workspace/uds-docs/scripts/tab-sweep.mjs), [`/workspace/uds-docs/scripts/visual-sweep.mjs`](/workspace/uds-docs/scripts/visual-sweep.mjs), [`/workspace/uds-docs/scripts/deep-sweep.mjs`](/workspace/uds-docs/scripts/deep-sweep.mjs)
- Finding: Several sweep scripts print warnings but exit 0, so they are useful for manual review but not reliable gates.
- Suggested fix: Add a strict mode or convert accumulated warnings to non-zero exit codes for CI usage.

## Validated accessibility and UX gaps

- Severity: major
- Area: a11y
- Location: [`/workspace/uds-docs/components/site/TokenSearch.tsx`](/workspace/uds-docs/components/site/TokenSearch.tsx)
- Finding: Token Search is `aria-modal`, but focus can escape the modal. Results are clickable `div`s with no `role`, `tabIndex`, `aria-activedescendant`, or listbox option semantics.
- Repro: Open Token Search with `/`, press Tab repeatedly; focus moves to controls behind the modal.
- Suggested fix: Add a focus trap/background inert handling, model results as a listbox or real buttons, and announce the active result.

- Severity: major
- Area: a11y
- Location: [`/workspace/uds-docs/components/site/DemoBuilder.tsx`](/workspace/uds-docs/components/site/DemoBuilder.tsx)
- Finding: Demo Preview overlay is `role="dialog" aria-modal="true"`, but it does not move focus into the overlay, trap focus, or restore focus to the trigger on close.
- Repro: Build Demo, click Preview, press Tab; focus can move outside the overlay or into the preview iframe unexpectedly.
- Suggested fix: Focus the first toolbar action on open, trap focus inside the overlay, make iframe focus intentional, and restore focus on close.

- Severity: medium
- Area: a11y
- Location: [`/workspace/uds-docs/app/(site)/[componentId]/ComponentHeader.tsx`](/workspace/uds-docs/app/(site)/[componentId]/ComponentHeader.tsx)
- Finding: Spec checklist popover uses `role="dialog"`, but focus stays on the trigger and there is no focus trap, `aria-controls`, or predictable focus restore.
- Repro: Open any component, click the spec segmented bar, then Tab through the page.
- Suggested fix: Add dialog focus handling or downgrade semantics if it is intended to be a lightweight popover.

- Severity: medium
- Area: a11y
- Location: [`/workspace/uds-docs/components/site/ComponentSidebarLink.tsx`](/workspace/uds-docs/components/site/ComponentSidebarLink.tsx)
- Finding: Sidebar metadata tooltip is visual-only for assistive tech. The portaled tooltip is not connected to the focused link via `aria-describedby`.
- Repro: Keyboard-focus a component sidebar link with a screen reader; only the link label is exposed, not status/spec metadata.
- Suggested fix: Give the tooltip a stable id and link it with `aria-describedby`, or provide a visually hidden status/spec description.

- Severity: medium
- Area: a11y
- Location: [`/workspace/uds-docs/components/site/Playground.tsx`](/workspace/uds-docs/components/site/Playground.tsx), [`/workspace/uds-docs/components/site/SgPageHeader.tsx`](/workspace/uds-docs/components/site/SgPageHeader.tsx), [`/workspace/uds-docs/components/site/ContrastChecker.tsx`](/workspace/uds-docs/components/site/ContrastChecker.tsx)
- Finding: Several tab patterns are partial. Component page tabs have keyboard support but panels lack `role="tabpanel"`; Implementation Reference tabs lack roving keyboard behavior and panel linkage; Contrast Checker browse tabs have similar panel linkage gaps.
- Suggested fix: Extend the shared tab primitive to generate ids, `aria-controls`, `aria-labelledby`, and `role="tabpanel"`, then reuse it for local tab sets.

- Severity: medium
- Area: a11y
- Location: [`/workspace/uds-docs/components/site/ContrastCheckerPicker.tsx`](/workspace/uds-docs/components/site/ContrastCheckerPicker.tsx), [`/workspace/uds-docs/components/site/ContrastChecker.tsx`](/workspace/uds-docs/components/site/ContrastChecker.tsx)
- Finding: Contrast Checker picker trigger says `aria-haspopup="listbox"`, but the popover is `role="dialog"`. The option list has options, but no arrow-key navigation.
- Suggested fix: Align roles to dialog or implement a complete listbox/combobox interaction model.

## Medium-priority behavior and maintainability issues

- Severity: medium
- Area: functional / UX
- Location: [`/workspace/uds-docs/app/(site)/changelog/ChangelogClient.tsx`](/workspace/uds-docs/app/(site)/changelog/ChangelogClient.tsx)
- Finding: Changelog filters are shared across UDS and Site tabs, and component filtering does not hide release-level global notes. This can make the Site tab look unexpectedly empty or make filtered UDS releases appear to match when only global notes remain.
- Suggested fix: Scope filters by tab, and decide whether component filter should hide global release notes when specific components are selected.

- Severity: medium
- Area: architecture / archive
- Location: [`/workspace/uds-docs/app/(site)/[componentId]/CodeTab.tsx`](/workspace/uds-docs/app/(site)/[componentId]/CodeTab.tsx), [`/workspace/uds-docs/data/component-api/`](/workspace/uds-docs/data/component-api/)
- Finding: Code-tab API data is live-only static TypeScript. Archive pages can show current API tables rather than historical API surfaces.
- Suggested fix: Either mark Code tab as current-only in archive mode, hide it in archive mode, or move API data into versioned UDS payloads later.

- Severity: medium
- Area: perf
- Location: [`/workspace/uds-docs/components/site/DemoBuilder.tsx`](/workspace/uds-docs/components/site/DemoBuilder.tsx)
- Finding: Opening Build Demo fetches every component status each time.
- Suggested fix: Cache the status map per `fetchVersion`, or load it once in the site shell.

## Recommended fix order

1. Archive contract fixes: preserve `?uds`, filter sidebar by active manifest, and hide/disable archive-incompatible tools.
2. Component-page tab mounting fixes: only render Playground when supported and only mount active panels.
3. Implementation Reference path normalization.
4. Tooling stabilization: declare `ws`/`serve`, replace interactive lint, and add a Node CI job.
5. Modal/popover focus pass: Token Search, Demo Preview, Spec popover, Sidebar tooltip.
6. Shared tab semantics polish and Changelog filter behavior.
7. Decide whether archive CSS/API should become fully versioned or explicitly current-only.
