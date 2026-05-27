---
name: web-components-visual-parity
overview: 'The cursor/web-components-rewrite branch turned every documented UDS component into a Lit Web Component (<udc-*>) with a React wrapper, but the rewrite stripped the per-component CSS down to skeletal Lit styles and replaced the rich interactive playgrounds with static HTML snippets. Dropdown has been restored to full visual + interactive parity as the pilot (commit 6645b59). The remaining 28 components need the same recipe applied. Architecture stays — only the per-component visual layer and the playground.js controls need to be brought back, ported into Lit shadow DOM.'
todos:
  - id: pilot-dropdown
    content: 'Pilot: restore Dropdown visual + interactive parity. Port the full 308 lines of dropdown.css into <udc-dropdown> shadow DOM, restructure the Lit template to match the original class structure, expose the full attribute API (show-label, placeholder, leading-icon, helper-text, counter-text, state, required, disabled, open, value, label), and rebuild playground.js with all 13 original controls. Verify visually in browser.'
    status: completed
  - id: pilot-confirm
    content: 'User confirms the Dropdown pilot pattern is the right shape before scaling to the remaining 28. Pick a priority order. Pick a commit/preview cadence (per-component, batches of 5, or all at once).'
    status: pending
  - id: scale-text-input
    content: 'Apply pattern to Text Input. Port text-input.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-button
    content: 'Apply pattern to Button. Port button.css (309 lines), restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-checkbox
    content: 'Apply pattern to Checkbox. Port checkbox.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-toggle
    content: 'Apply pattern to Toggle. Port toggle.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-radio
    content: 'Apply pattern to Radio + RadioGroup. Port radio.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-combobox
    content: 'Apply pattern to Combobox. Currently aliases Dropdown — extend with filtering/autocomplete behavior and port combobox.css overrides.'
    status: pending
  - id: scale-date-picker
    content: 'Apply pattern to Date Picker. Port date-picker.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-text-area
    content: 'Apply pattern to Text Area. Port text-area.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-search
    content: 'Apply pattern to Search. Port search.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-label
    content: 'Apply pattern to Label. Port label.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-link
    content: 'Apply pattern to Link. Port link.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-badge
    content: 'Apply pattern to Badge. Port badge.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-chip
    content: 'Apply pattern to Chip. Port chip.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-notification
    content: 'Apply pattern to Notification. Port notification.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-tooltip
    content: 'Apply pattern to Tooltip. Port tooltip.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-dialog
    content: 'Apply pattern to Dialog. Port dialog.css, restructure shadow DOM, rebuild playground.js. Heaviest of the feedback components.'
    status: pending
  - id: scale-tabs
    content: 'Apply pattern to Tabs (already in tabs.ts, needs CSS port + playground rebuild).'
    status: pending
  - id: scale-tile
    content: 'Apply pattern to Tile. Port tile.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-nav-header
    content: 'Apply pattern to Nav Header. Port nav-header.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-nav-vertical
    content: 'Apply pattern to Nav Vertical. Port nav-vertical.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-breadcrumb
    content: 'Apply pattern to Breadcrumb. Port breadcrumb.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-pagination
    content: 'Apply pattern to Pagination. Port pagination.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-list
    content: 'Apply pattern to List + ListItem. Port list.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-data-table
    content: 'Apply pattern to Data Table. Port data-table.css, restructure shadow DOM, rebuild playground.js. Heaviest of the content components.'
    status: pending
  - id: scale-data-view
    content: 'Apply pattern to Data View. Port data-view.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-divider
    content: 'Apply pattern to Divider. Port divider.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-spacer
    content: 'Apply pattern to Spacer. Port spacer.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: scale-icon-wrapper
    content: 'Apply pattern to Icon Wrapper. Port icon-wrapper.css, restructure shadow DOM, rebuild playground.js.'
    status: pending
  - id: final-cleanup
    content: 'After all 29 components have parity: delete the inline class-based markup from data/web-component-examples.ts that no longer matches the rich attribute API; consider whether to keep WEB_COMPONENT_EXAMPLES at all once playgrounds drive everything; verify audit:web-components passes; run the full regression-recovery-check.mjs against a Cloudflare preview build.'
    status: pending
isProject: false
---
# Web Components Visual + Interactive Parity Plan

## Why this plan exists

The `cursor/web-components-rewrite` PR migrated every documented UDS
component from class-based vanilla CSS/JS to Lit-based Web Components
(`<udc-*>`) with React wrappers. That part of the rewrite is the right
direction and stays.

What didn't survive the rewrite:

1. **Per-component visual fidelity.** Each component had 100–300 lines
   of polished, token-bound CSS in `uds/components/<id>/<id>.css`. The
   rewrite replaced that with skeletal Lit `static styles` — usually
   one or two lines of inline CSS per component.
2. **Interactive playgrounds.** Each component had a `playground.js`
   with 5–15 interactive controls (state, disabled, label text,
   placeholder, helper text, leading icon picker, etc.) that drove a
   live preview and generated example HTML. The rewrite replaced each
   playground with a static HTML snippet plus a dummy "Icon preview"
   control.

The user (a senior product designer running UDS through cloud agents)
caught the regression on the Cloudflare preview deploy and called it
"a massive, massive, massive regression in component styling and
properties." The Dropdown was the example they highlighted.

The pilot in commit `6645b59` proves the recovery recipe works on
Dropdown. The remaining 28 documented components need the same
treatment.

## What's done — the Dropdown pilot (commit 6645b59)

Branch: `cursor/web-components-rewrite`. Preview deploy URL pattern:
`<short-sha>.uds-docs-next.pages.dev`.

The pilot:

- New file `uds-docs/packages/uds-web-components/src/components/dropdown.ts`
  (~460 lines):
  - Full 308 lines of original `dropdown.css` ported into Lit
    `static styles`. Same token references, same class names — safe
    because shadow DOM doesn't leak.
  - Shadow DOM template restructured to mirror the original class
    structure: `.udc-dropdown` (root), `.udc-dropdown__label`,
    `.udc-dropdown__required`, `.udc-dropdown__trigger`,
    `.udc-dropdown__leading-icon`, `.udc-dropdown__value`,
    `.udc-dropdown__chevron`, `.udc-dropdown__helper`,
    `.udc-dropdown__counter`, `.udc-dropdown__list`.
  - Full attribute API exposed: `value`, `label`, `placeholder`,
    `helper-text`, `counter-text`, `state` ('default' | 'error'),
    `disabled`, `required`, `show-label`, `show-helper`, `show-counter`,
    `leading-icon`, `open`. All reflect to attributes.
  - `<udc-dropdown-item>` ported separately with item styling
    (hover, active, selected, focus-visible, disabled) and keyboard
    navigation (Arrow up/down, Enter/Space, Escape).
  - Form association via `ElementInternals` (when supported).
- `<udc-combobox>` and `<udc-combobox-option>` are now thin aliases
  of the new Dropdown classes (in `remaining.ts`).
- `register.ts` and `index.ts` import Dropdown from the new file.

Playground engine:

- `uds-docs/components/site/Playground.tsx`: removed the short-circuit
  that bypassed `playground.js` whenever a static
  `WEB_COMPONENT_EXAMPLES` entry existed. Now the component always
  loads `playground.js` and always calls `registerUdsComponents()`.
  The static example is only used as a fallback when no `playground.js`
  exists for the component.

Dropdown's playground:

- `uds-docs/uds/components/dropdown/playground.js` rebuilt with all
  13 original controls — state, disabled, show-label, label text,
  required, leading-icon checkbox, leading-icon name picker,
  placeholder, show-helper, helper text, show-counter, counter text,
  options count. `render()` emits `<udc-dropdown>` markup with the
  full attribute API applied based on control values.

Sync tooling:

- `uds-docs/scripts/sync-web-component-source.mjs` updated to preserve
  hand-curated `playground.js` files. Detection: if the existing file
  contains `controls: []` literal, it's the auto-generated stub and
  can be overwritten; otherwise it's hand-curated and left alone.

Changelogs:

- `SITE 2026.05.27.5` entry in `uds-docs/data/site-changelog.ts`.
- Per-component entry added to
  `uds-docs/uds/components/dropdown/changelog.json` for UDS 0.3.
- `uds-docs/uds/CHANGELOG.json` regenerated via
  `bash scripts/aggregate-changelog.sh`.

Visual proof:

- Pilot verified in a local browser session against the production
  Next.js build. All 13 controls render correctly; preview shows the
  proper styling (border, hover, focus, leading icon, label,
  placeholder, chevron rotation, helper text); the HTML output panel
  shows the right `<udc-dropdown>` markup with all attributes set.
  Clicking the trigger opens the listbox with properly-styled items.

## The recipe (for each remaining component)

1. Read the original CSS:
   `git show origin/main:uds-docs/uds/components/<id>/<id>.css`
2. Read the original playground:
   `git show origin/main:uds-docs/uds/components/<id>/playground.js`
3. Decide whether the component lives in its own file
   (`packages/uds-web-components/src/components/<id>.ts`) or stays in
   `remaining.ts`. Heavier components (>200 lines of CSS or non-trivial
   shadow DOM template) get their own file; trivial ones can stay
   inline.
4. Port the full CSS into Lit `static styles`. Same class names are
   safe — they're inside shadow DOM.
5. Restructure the shadow DOM template (in `render()`) to expose the
   same internal elements the original CSS expected.
6. Expose the rich attribute API on the Lit class:
   - Convert each per-control attribute (label, placeholder,
     helper-text, state, disabled, etc.) into a Lit property with
     `attribute:` mapping. Boolean attributes use `Boolean` type;
     enums use `String`. Reflect to attributes when the value should
     affect CSS selectors (e.g. `:host([state='error'])`).
7. If the component is form-associated, attach `ElementInternals` and
   call `setFormValue()` in `updated()`.
8. Update `register.ts` and `index.ts` if extracted to a new file.
9. Rebuild `uds-docs/uds/components/<id>/playground.js` with the
   original control set, but `render()` emits `<udc-*>` markup.
   Generate attribute lines from control values; preserve the
   `code` field for the right-hand panel.
10. If the default `WEB_COMPONENT_EXAMPLES[<id>]` entry in
    `uds-docs/data/web-component-examples.ts` is too minimal, expand
    it to use the new attributes properly (so the static fallback
    looks right too, and the Examples tab is meaningful).
11. Run `npm run build` from `uds-docs/` — confirms TS + Next build
    are clean.
12. Run `npx vitest run packages/uds-web-components/src/components.test.ts`
    from `uds-docs/` — confirms registration tests still pass.
    Add new tests for any new public API surface introduced.
13. Spot-check visually:
    `npx serve out -p 4321` from `uds-docs/`, then navigate to the
    component page and click Playground. Verify all controls render
    and toggle correctly.
14. Add a per-component changelog entry to
    `uds-docs/uds/components/<id>/changelog.json` under the current
    UDS version (0.3) following the voice in
    `.cursor/rules/uds-figma-change-classification.mdc`.
15. Run `bash scripts/aggregate-changelog.sh` from the repo root.
16. Add a SITE_CHANGELOG entry to `uds-docs/data/site-changelog.ts`
    following the voice in `.cursor/rules/uds-site-changelog.mdc`.
17. Commit with a clear message referencing the component, the CSS
    line count ported, and the control count restored. Push so
    Cloudflare picks up a fresh preview.

## Key files and locations

| Purpose | Path |
|---|---|
| Web Component implementations | `uds-docs/packages/uds-web-components/src/components/` |
| Component registry | `uds-docs/packages/uds-web-components/src/register.ts` |
| Package public API | `uds-docs/packages/uds-web-components/src/index.ts` |
| Web Component unit tests | `uds-docs/packages/uds-web-components/src/components.test.ts` |
| Shared Lit styles | `uds-docs/packages/uds-web-components/src/styles.ts` |
| Event helper | `uds-docs/packages/uds-web-components/src/events.ts` |
| React wrappers | `uds-docs/packages/uds-react/src/index.tsx` |
| Component source payload (per-component folders) | `uds-docs/uds/components/<id>/` |
| Token CSS (referenced from shadow DOM) | `uds-docs/uds/tokens/` |
| Playground engine | `uds-docs/components/site/Playground.tsx` |
| Static Web Component examples (data) | `uds-docs/data/web-component-examples.ts` |
| Examples tab | `uds-docs/app/(site)/[componentId]/ExamplesTab.tsx` |
| Code tab | `uds-docs/app/(site)/[componentId]/CodeTab.tsx` |
| Sync script (writes playground/impl/example) | `uds-docs/scripts/sync-web-component-source.mjs` |
| Web Component guidance audit | `uds-docs/scripts/audit-web-component-guidance.mjs` |

## Commands you'll use a lot

| Command | What it does |
|---|---|
| `npm run build:packages` | Builds `@uds/web-components` and `@uds/react` (in order). Run from `uds-docs/`. |
| `npm run build` | Full Next.js build (runs `build:packages` first, then `next build`, then `postbuild-copy`). Run from `uds-docs/`. |
| `npx vitest run packages/uds-web-components/src/components.test.ts` | Web Component unit tests. Run from `uds-docs/` (picks up the workspace `happy-dom`). |
| `npx serve out -p 4321` | Serve the built static export for visual verification. `serve` falls back to a random port if 4321 is busy — read the printed URL. Run from `uds-docs/`. |
| `bash scripts/aggregate-changelog.sh` | Refresh `uds-docs/uds/CHANGELOG.json` from per-component `changelog.json`. Run from repo root. |
| `bash scripts/audit-changelog-currency.sh` | Confirms every modified component has a corresponding changelog entry. |

## What NOT to revert

- The Web Components + React wrappers architecture. The user
  explicitly asked for this and reaffirmed it ("If we do it, we
  can't half-ass it. Complete and total rewrite from scratch for
  documented components — no vanilla.")
- The deletion of per-component `<id>.js` files. Behavior lives in
  the shared `web-components.js` bundle now.
- The reduction of `uds/uds.css` to a token-only entrypoint. Component
  styles live in shadow DOM.
- The `uds/uds.js` compatibility loader. It exists so existing example
  HTML that references `uds/uds.js` still works.
- The new attribute API on `<udc-dropdown>`. The user previewed the
  pilot and (assuming pattern confirmation lands) is the canonical
  shape.

## Open questions waiting for the user

1. **Pattern**: does the Dropdown pilot (commit `6645b59`, preview at
   `<short-sha>.uds-docs-next.pages.dev/dropdown`) match what you
   want? Anything you want changed in the API shape, internal
   structure, or playground behavior before scaling to 28 more?
2. **Priority order**: any components you want first? The default
   sequence (Text Input → Button → Checkbox → Toggle → Radio →
   Combobox → Date Picker → Text Area → Search → Label → Link → Badge
   → Chip → Notification → Tooltip → Dialog → Tabs → Tile → Nav
   Header → Nav Vertical → Breadcrumb → Pagination → List → Data
   Table → Data View → Divider → Spacer → Icon Wrapper) is in the
   todos[] above.
3. **Cadence**: commit + Cloudflare-preview-ping after each component,
   after each batch of 5, or after all 29?

## Resuming on another computer

1. Pull latest on `cursor/web-components-rewrite`:
   ```
   git fetch origin && git checkout cursor/web-components-rewrite && git pull --ff-only
   ```
2. Install in `uds-docs/`:
   ```
   cd uds-docs && npm install
   ```
3. Re-read this plan and the workspace rules (the master preflight at
   `.cursor/rules/uds-master-preflight.mdc` runs on session start).
4. Confirm the pilot still builds:
   ```
   cd uds-docs && npm run build
   ```
5. Pick up the first pending todo in the list above (likely
   `scale-text-input` if the pattern has been confirmed).

## Voice notes for whoever picks this up

- Designer-voice for the user-facing channels: chat replies, SITE_CHANGELOG
  entries, and prose on the docs site. See `.cursor/rules/communication-style.mdc`.
- Technical voice in the code, code comments, per-component
  `changelog.json` entries, commit messages, and PR descriptions.
- Don't narrate tool calls. Don't restate the obvious. Lead with the
  answer.
- The user does NOT write code. They read PRs and changelogs. Default
  to plain language unless the user is debugging with you and using
  specific file paths.
