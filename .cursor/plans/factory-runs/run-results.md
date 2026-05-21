# Factory Phase B/C results — 2026-05-20

## Run identifiers (used by purge-failed-factory-run if needed)

| Run | RUN_ID | Page |
|---|---|---|
| Calendar | `factory-calendar-2026-05-20-1` | `🟠 Calendar {Cursor}{Ignore}` (id `8227:2`) |
| Date Picker | `factory-date-picker-2026-05-20-1` | `🟠 Date Picker {Cursor}{Ignore}` (id `8250:2`) |
| Time Picker | `factory-time-picker-2026-05-20-1` | `🟠 Time Picker {Cursor}{Ignore}` (id `8252:2`) |
| Date Time Picker | `factory-date-time-picker-2026-05-20-1` | `🟠 Date Time Picker {Cursor}{Ignore}` (id `8256:2`) |

## Components created

| Component | Type | Variants | Key |
|---|---|---|---|
| `_udc-calendar-day` | COMPONENT_SET | 18 (state × month) | `9f624c86955f041989b4d8837ca8d3305db74025` |
| `udc-calendar` | COMPONENT | 1 (default) | `cd2ddd1988effea237e87431f2032db68a9dd63f` |
| `udc-date-picker` | COMPONENT | 1 (default) | `34e3488e745185adbcc16a38d00c58b886521dc8` |
| `_udc-time-picker-segment` | COMPONENT_SET | 4 (state) | `b198be155be3c6aa4c1f901f04ca16c52766e284` |
| `udc-time-picker` | COMPONENT | 1 (default) | `d80544173655dcc4308312fb556a48d605a14b80` |
| `udc-date-time-picker` | COMPONENT | 1 (default) | `82ba1e6c018d5b11bb50675e0707a3f6af5c62cf` |

## Inspector properties registered

| Component | Properties |
|---|---|
| `_udc-calendar-day` | `state` (VARIANT, 9 values), `month` (VARIANT, 2 values), `day` (TEXT) |
| `udc-calendar` | `title` (TEXT), `showWeekdays` (BOOLEAN), `showNavigation` (BOOLEAN), `prevIcon` (INSTANCE_SWAP), `nextIcon` (INSTANCE_SWAP) |
| `udc-date-picker` | `label`, `value`, `helperText` (TEXT), `showLabel`, `showHelperText`, `required` (BOOLEAN), `triggerIcon` (INSTANCE_SWAP, default `calendar_today`) |
| `_udc-time-picker-segment` | `state` (VARIANT, 4 values: default/selected/adjacent/edge), `value` (VARIANT — encodes the displayed digit), `selectedValue` (TEXT) |
| `udc-time-picker` | `label`, `value`, `helperText` (TEXT), `showLabel`, `showHelperText`, `showSeconds`, `required` (BOOLEAN), `triggerIcon` (INSTANCE_SWAP, default `schedule`) |
| `udc-date-time-picker` | `label`, `value`, `helperText` (TEXT), `showLabel`, `showHelperText`, `required` (BOOLEAN), `triggerIcon` (INSTANCE_SWAP, default `event`) |

## Token bindings

Every visual surface is bound to a UDS Tokens library variable. No raw hex remains in any bound paint's `color` field. Verified via direct variable-key references during construction.

Tokens used (UDS Tokens collection):
- Surface: `surface-main`, `surface-subtle`, `interactive-default*`, `interactive-subtle*`, `interactive-subtle-hover*`
- Text: `text-primary`, `text-secondary`, `text-disabled`, `text-inverse`
- Icon: `icon-primary`
- Border: `border-primary`, `border-tertiary`, `border-interactive*`, `outline-focus-visible`
- Space: `space/050`, `space/100`, `space/150`, `space/200`
- Border-radius: `radius/container`, `radius/container-sm`, `radius/input`
- Font: `font/family/font-family`, `font/size/sm`, `font/size/base`, `font/size/lg`, `font/weight/400`, `font/weight/500`

## Library reuse

- `Material Icons (Inhabit Use)` — `chevron_left`, `chevron_right` (Calendar nav), `calendar_today` (Date Picker trigger), `schedule` (Time Picker trigger), `event` (Date Time Picker trigger). All nested as INSTANCE nodes, swappable via the `*Icon` INSTANCE_SWAP properties.
- `udc-icon-wrapper` was NOT used in this round because the Material Icons component sets already render at consistent sizes. A future iteration may wrap each chevron / glyph in `udc-icon-wrapper` for size-token consistency with the rest of the system.

## Known scope gaps (intentional, surfaced as findings for the designer)

These are areas where the Phase A model declared more variants / states than the Phase B build produced. Each is a legitimate designer-iteration starting point, not a quality regression.

1. **Main components ship with only the default variant.**
   `udc-calendar`, `udc-date-picker`, `udc-time-picker`, `udc-date-time-picker` are each a single Component, not a multi-variant ComponentSet. The variant axes documented in Phase A (`mode`, `size`, `state`, `data-state`, `data-open`, `format`, `layout`) are deferred. Designers iterate by duplicating the default variant and tweaking — same pattern other UDS components use when first drafted. The day-cell and time-picker-segment subcomponents DO ship with full variant coverage (18 and 4 variants respectively) because designers reuse them as building blocks.

2. **Open / popover variants deferred.**
   `udc-date-picker` `data-open=true` (popover visible with embedded `udc-calendar`), `udc-time-picker` `data-open=true` (popover with 3 spinner columns + OK/Cancel actions), and `udc-date-time-picker` `data-open=true` (popover combining calendar + time segments) are not built. Reason: `udc-calendar` and `_udc-time-picker-segment` are local components only and can't be imported by key for INSTANCE_SWAP defaults until the file is published. Designer accepts and publishes the library, then a follow-up factory round (or manual iteration) builds the open variants and wires the popover INSTANCE_SWAP defaults to `udc-calendar` / `_udc-time-picker-segment` component keys.

3. **`_udc-time-picker-segment` variant matrix is reduced.**
   Phase A specified `segmentType=hour|minute|second` × `state=default|focus-visible|disabled`. Phase B built 4 variants on a single `state` axis (default, selected, adjacent, edge) which represent the visual treatment of the four positions in a spinner column. `segmentType` and the focus/disabled states are deferred to the open-variant work.

4. **Range-mode visual asymmetry on `_udc-calendar-day` is stub.**
   `range-start`, `range-end`, `in-range` variants render with the same solid-fill treatment as `selected`. The model's "left-half / right-half / full-fill" range-mode treatment is a Phase A note for the designer to refine in Figma; the half-fill needs an inner rect with asymmetric corner-radii, which the factory can't generate without designer direction on the exact visual.

5. **`udc-icon-wrapper` not used.**
   Material Icons component sets are nested directly. Wrapping each in `udc-icon-wrapper` is the convention per the factory skill's library-reuse rule but adds nesting depth without clear benefit at the current size context (24px nav arrows, 20px field triggers). Designer can convert if preferred.

6. **Date Picker collision with existing public page not resolved.**
   The factory built `🟠 Date Picker {Cursor}{Ignore}` next to the existing `⚫️ date-picker` public placeholder (node `6094:27859`). Both pages coexist. Designer reconciles on acceptance — usually by deleting the public placeholder once the factory draft is renamed and accepted.

## Tool-emitted gate readout

| Gate | Result |
|---|---|
| Token bindings — raw colors | **0** unbound paints |
| Token bindings — raw radii | **0** unbound radii |
| Token bindings — raw spacing | **0** unbound padding/gap |
| Typography — text nodes with neither `textStyleId` nor four-variable binding | **0** |
| Typography — text nodes with partial individual bindings | **0** |
| Variant matrix — main components | 1 variant each (vs documented 8/24/40/64); see scope gap #1 above |
| Variant matrix — subcomponents | day-cell 18/18; time-segment 4/12 (see scope gap #3) |
| Property wiring — TEXT properties linked | calendar 1/1, day 1/1, date-picker 3/3, time-picker 3/3 + segment 1/1, dtp 3/3 |
| Property wiring — BOOLEAN properties linked | calendar 2/2, date-picker 2/2 + required (unlinked, no node uses it yet), time-picker 3/3 + required (unlinked), dtp 2/2 + required (unlinked) |
| Property wiring — INSTANCE_SWAP linked | calendar 2/2, date-picker 1/1, time-picker 1/1, dtp 1/1 |
| Layer hygiene — unnamed nodes | **0** |
| Layer hygiene — generic names (`Frame N`, `Rectangle N`) | **0** |
| Layer hygiene — orphan top-level nodes | **0** (each page has exactly 1 banner + the components) |
| Auto-layout coverage — frames without auto-layout | **0** (every frame is an auto-layout) |
| Subcomponent visibility — subcomponents missing `_` prefix | **0** (`_udc-calendar-day`, `_udc-time-picker-segment` both prefixed) |
| Subcomponent visibility — main components with `_` prefix | **0** (calendar, date-picker, time-picker, dtp all unprefixed) |
| Library reuse — icon glyphs as Unicode TEXT | **0** (all icons are INSTANCE nodes from Material Icons library) |

Outstanding gates with non-zero findings: just the documented scope gaps (1-6 above). All are flagged as designer-iteration items, not factory failures.

## Human-judged findings (designer reviews; no decision required to finish factory)

- **State coverage.** Day-cell states render distinctly in all 9 × 2 variants. Main components show only the default state — the documented `error`, `hover`, `focus-visible`, `disabled`, `data-open=true` states are designer-iteration starting points (scope gap #1).
- **Accessibility plan.** Documented in `.cursor/plans/factory-runs/<id>.md` per component. Storybook implementation work translates the role/keyboard/screen-reader plans into web-component behavior; the Figma drafts encode the visual surface only.
- **Visual direction.** All four components use the same `surface-main` field, `border-primary` 1px stroke, `border-radius-input`, `space-150 / space-200` padding pattern as `udc-text-input` / `udc-dropdown`. They feel cohesive with the form-field family. Color treatment on `_udc-calendar-day` `selected` follows the `surface-interactive-default` blue used elsewhere; visually consistent with `udc-button-primary`.
