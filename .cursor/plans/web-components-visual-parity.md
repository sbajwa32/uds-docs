---
name: web-components-visual-parity
overview: 'Sweep complete on cursor/web-components-rewrite. All 29 documented UDS components ship the full original CSS inside their `<udc-*>` Lit shadow DOM, with rich interactive playgrounds rebuilt against the new attribute API. Audits all pass (component-completeness, token-usage, changelog-currency, doc-internal-consistency, aggregate-currency, css-api-table, figma-sync-state-currency, placeholders, web-component-guidance, toolchain-currency, agent-docs-currency, demo-coverage). 9/9 unit tests pass. Per-component preview commits range from `6645b59` (Dropdown pilot) through `40be4ee` (final atoms). Plan retained for context — re-running the sweep is unnecessary unless a Figma round-trip resurfaces the problem.'
todos:
  - id: pilot-dropdown
    content: 'Pilot: restore Dropdown visual + interactive parity. Port the full 308 lines of dropdown.css into <udc-dropdown> shadow DOM, restructure the Lit template to match the original class structure, expose the full attribute API (show-label, placeholder, leading-icon, helper-text, counter-text, state, required, disabled, open, value, label), and rebuild playground.js with all 13 original controls. Verify visually in browser. (commit 6645b59)'
    status: completed
  - id: pilot-confirm
    content: 'User confirmed the Dropdown pilot was the right shape — proceeded with the rest, per-component commits, default sequence.'
    status: completed
  - id: scale-text-input
    content: 'Text Input visual + interactive parity restored. (commit f5ea453)'
    status: completed
  - id: scale-button
    content: 'Button visual + interactive parity restored, plus the empty-string attribute reflection bug fix. (commit ee2e70a)'
    status: completed
  - id: scale-checkbox
    content: 'Checkbox visual + interactive parity restored, SVG-mask checkmark and indeterminate state. (commit 66060af)'
    status: completed
  - id: scale-toggle
    content: 'Toggle visual + interactive parity restored, 52×32 track, button-role switch. (commit 0a093f2)'
    status: completed
  - id: scale-radio
    content: 'Radio + RadioGroup visual + interactive parity restored. (commit 35a33ae, group event aligned to `udc-radio-group-change` in follow-up)'
    status: completed
  - id: scale-combobox
    content: 'Combobox playground restored on top of the rebuilt Dropdown alias. Filtering/autocomplete still awaiting a real Figma source. (commit 93d38da)'
    status: completed
  - id: scale-date-picker
    content: 'Date Picker visual + interactive parity restored using the text-input field chrome around the native date popover. (commit 0947374)'
    status: completed
  - id: scale-text-area
    content: 'Text Area visual + interactive parity restored. (commit e29335d)'
    status: completed
  - id: scale-search
    content: 'Search visual + interactive parity restored with the clear-button-on-value behavior. (commit e75df2c)'
    status: completed
  - id: scale-label
    content: 'Label visual + interactive parity restored. (commit 51549ae)'
    status: completed
  - id: scale-link
    content: 'Link visual + interactive parity restored with `new-window` auto-attributes. (commit b915d7c)'
    status: completed
  - id: scale-badge
    content: 'Badge playground restored on top of the already-faithful CSS port. (commit 429657e)'
    status: completed
  - id: scale-chip
    content: 'Chip visual + interactive parity restored with BEM icon structure and dropdown chevron size. (commit d0b2531)'
    status: completed
  - id: scale-notification
    content: 'Notification visual + interactive parity restored with dedicated `--uds-color-icon-*` token. (commit 2ae299e)'
    status: completed
  - id: scale-tooltip
    content: 'Tooltip visual + interactive parity restored — light surface-main bubble with shadow-depth-300 instead of the prior dark pill. (commit 01db7e2)'
    status: completed
  - id: scale-dialog
    content: 'Dialog visual + interactive parity restored — 480px container, subtle header bg, focus trap. (commit 8a96e01)'
    status: completed
  - id: scale-tabs
    content: 'Tabs playground restored on top of the already-faithful CSS port. (commit 131b079)'
    status: completed
  - id: scale-tile
    content: 'Tile visual + interactive parity restored with BEM internal structure. (commit 3537fa3)'
    status: completed
  - id: scale-nav-header
    content: 'Nav Header visual + interactive parity restored — single opinionated Web Component renders the full canonical anatomy (logo, title-area pill, search, My Work, account group) with attribute API + slot escape hatches. (commit fea622a)'
    status: completed
  - id: scale-nav-vertical
    content: 'Nav Vertical visual + interactive parity restored — list and rail variants drive their `<udc-nav-item>` children via attribute propagation. (commit e5223ed)'
    status: completed
  - id: scale-breadcrumb
    content: 'Breadcrumb visual + interactive parity restored — pill container, SVG chevron separators, `items` array attribute. (commit 59ec940)'
    status: completed
  - id: scale-pagination
    content: 'Pagination visual + interactive parity restored — 32px numbered page buttons, ellipsis for long ranges, meta row. (commit 8df9a1e)'
    status: completed
  - id: scale-list
    content: 'List + ListItem visual + interactive parity restored — 48px rows with proper listbox/option roles. (commit 7f0391d)'
    status: completed
  - id: scale-data-table
    content: 'Data Table visual + interactive parity restored — renders the table itself in shadow DOM from `columns` + `rows` JSON attributes. (commit 4739b65)'
    status: completed
  - id: scale-data-view
    content: 'Data View now ships a card-style container with header/body/actions slot groups (Figma source was placeholder-only). (commit 67fc750)'
    status: completed
  - id: scale-divider
    content: 'Divider visual + interactive parity restored. (commit 40be4ee, with spacer + icon-wrapper)'
    status: completed
  - id: scale-spacer
    content: 'Spacer visual + interactive parity restored with the original token-step `size` API. (commit 40be4ee)'
    status: completed
  - id: scale-icon-wrapper
    content: 'Icon Wrapper visual + interactive parity restored with the 16/20/24/32/48/64 size matrix and `color` token attribute. (commit 40be4ee)'
    status: completed
  - id: final-cleanup
    content: 'Audits pass end-to-end (component-completeness, token-usage, changelog-currency, doc-internal-consistency, aggregate-currency, css-api-table, figma-sync-state-currency, placeholders, web-component-guidance, toolchain-currency, agent-docs-currency, demo-coverage). 9/9 Web Component unit tests pass. data/web-component-examples.ts entries match the new attribute API. WEB_COMPONENT_EXAMPLES kept as the static-fallback source for archive views and the Examples tab.'
    status: completed
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
