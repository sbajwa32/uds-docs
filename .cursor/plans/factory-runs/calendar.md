# Factory Phase A Model — `calendar`

Status: **awaiting approval**. No Figma writes have happened.

## Purpose

A month-view calendar grid. Renders a full month of day cells with the
ability to select a single date or a date range, and to navigate forward
and backward by month / year. Can stand alone (event browsing,
availability) or anchor a `udc-date-picker` / `udc-date-time-picker`
popover.

## When to use / when not to use

| Use when | Don't use when |
|---|---|
| Users need to see dates in a full month context | A single date inside a form fits in a smaller field → use Date Picker |
| Selecting a range matters | The picker only needs a typed value → use Text Input |
| Browsing scheduled events / availability | Picking a time of day → use Time Picker |

## Anatomy

```
udc-calendar (root, vertical auto-layout)
├── udc-calendar__header (horizontal auto-layout, space-between)
│   ├── udc-calendar__nav-prev (icon button — udc-icon-wrapper "chevron_left")
│   ├── udc-calendar__title (TEXT — "June 2026")
│   └── udc-calendar__nav-next (icon button — udc-icon-wrapper "chevron_right")
├── udc-calendar__weekdays (horizontal auto-layout, 7 cells)
│   └── udc-calendar__weekday × 7 (TEXT — "Mon" "Tue" ... "Sun")
└── udc-calendar__grid (vertical auto-layout, 6 rows)
    └── udc-calendar__row (horizontal auto-layout, 7 cells)
        └── _udc-calendar-day × 7 (nested INSTANCE of the day subcomponent)
```

## Subcomponent classification

| Set | Classification | Reason |
|---|---|---|
| `udc-calendar` | **Main component** | Designers reach for it from the library picker; lives at `uds/components/calendar/` |
| `_udc-calendar-day` | **Subcomponent of calendar** | A day cell makes no sense outside a month grid; its variant axes (`isToday`, `isOtherMonth`, `isInRange`) are meaningless standalone |

## Variant axes — `udc-calendar` (main)

| Axis | Values | Default | Rationale |
|---|---|---|---|
| `mode` | `single`, `range` | `single` | Single is the common case; range supports start-end selection |
| `size` | `sm`, `md` | `md` | `sm` for inline popovers, `md` for standalone calendars |
| `state` | `default`, `disabled` | `default` | Disabled = entire calendar non-interactive (rare; e.g. read-only display) |

## Variant axes — `_udc-calendar-day` (subcomponent)

| Axis | Values | Default | Rationale |
|---|---|---|---|
| `state` | `default`, `hover`, `focus-visible`, `selected`, `range-start`, `range-end`, `in-range`, `disabled`, `today` | `default` | Every interactive day state designers will paint per-state |
| `month` | `current`, `other` | `current` | Days from prev / next month shown for grid alignment use `other` (muted) |

## State matrix — `udc-calendar` (main)

| State | Visual treatment | Notes |
|---|---|---|
| default | Standard surface, all day cells interactive | The primary state |
| disabled | Surface dims, all cells `disabled`, nav arrows muted | Whole-calendar lockout |
| loading | Spinner overlay; nav + grid greyed | **DEFERRED** — UDS has no spinner component yet; flag in spec.json knownIssues |

## Accessibility plan

- **Role**: outer `<div role="application">` or `<div role="grid">` (the W3C ARIA APG calendar grid pattern). Decision to be confirmed in Storybook implementation; the Figma layer hints at `grid`.
- **Keyboard**:
  - `Arrow Left/Right`: previous/next day
  - `Arrow Up/Down`: previous/next week
  - `Home`/`End`: first/last day of week
  - `PageUp`/`PageDown`: previous/next month
  - `Shift+PageUp/PageDown`: previous/next year
  - `Enter`/`Space`: select focused date
  - `Esc`: in popover context, close the calendar
- **Focus visible**: ring on the focused day cell using `--uds-color-border-outline-focus-visible`.
- **Screen reader**:
  - On day cell focus: announces full date (e.g. "Tuesday, June 17, 2026") via `aria-label`.
  - `aria-selected="true"` on the selected day.
  - `aria-current="date"` on today's cell.
  - `aria-disabled="true"` on out-of-range or disabled days.
- **Reduced motion**: month transitions should respect `prefers-reduced-motion` (no slide animation if user opts out). **Figma-side note only** — UDS has no motion tokens yet.

## Token plan

Every property bound; no raw hex.

| Role | Token |
|---|---|
| Root background | `--uds-color-surface-main` |
| Root border | `--uds-color-border-tertiary` (1px) |
| Root radius | `--uds-border-radius-container` (8px) |
| Header gap / row gap | `--uds-space-100` (8px) |
| Cell gap | `--uds-space-050` (4px) |
| Title text | `--uds-color-text-primary`, `--uds-font-size-base`, weight `medium` |
| Weekday text | `--uds-color-text-secondary`, `--uds-font-size-sm`, weight `medium` |
| Nav icon color | `--uds-color-icon-primary` (default), `--uds-color-icon-secondary` (disabled) |
| Day cell default text | `--uds-color-text-primary` |
| Day cell other-month text | `--uds-color-text-disabled` |
| Day cell hover bg | `--uds-color-surface-interactive-subtle-hover` |
| Day cell selected bg | `--uds-color-surface-interactive-default` |
| Day cell selected text | `--uds-color-text-inverse` |
| Day cell today border | `--uds-color-border-interactive` (1px inner outline) |
| Day cell in-range bg | `--uds-color-surface-interactive-subtle` |
| Day cell range-start / range-end bg | `--uds-color-surface-interactive-default` |
| Day cell disabled text | `--uds-color-text-disabled` |
| Day cell focus ring | `--uds-color-border-outline-focus-visible` (2px outset) |

No `MISSING` token. All required tokens present in UDS Tokens 0.3.

## Typography binding strategy

To be confirmed during Phase B discovery (`search_design_system includeStyles: true`):

- **If bundled UDS text styles exist** (`uds/text/label/sm-medium`, `uds/text/body/base-regular`, etc.), bind via `textNode.textStyleId = style.id`.
- **Otherwise**, bind the four individual font variables per text node:
  `fontFamily`, `fontSize`, `fontStyle`, `lineHeight` — never less than all four together.

Title row uses the equivalent of `--uds-font-size-base` (14px) medium-weight.
Weekday header row uses `--uds-font-size-sm` (12px) medium-weight.
Day cell numbers use `--uds-font-size-base` regular-weight.

Color is bound separately per the rule.

## Inspector-editable properties

### Variant axes (recap)
- `udc-calendar`: `mode`, `size`, `state`
- `_udc-calendar-day`: `state`, `month`

### TEXT properties

| Component | propName | default | Linked node | Notes |
|---|---|---|---|---|
| `udc-calendar` | `title` | `June 2026` | `.title` text node | Designer overrides per-instance; defaults to current month/year |
| `_udc-calendar-day` | `day` | `1` | `.day-number` text node | Day-of-month number (1-31) |

### BOOLEAN properties

| Component | propName | default | Toggles | Notes |
|---|---|---|---|---|
| `udc-calendar` | `showWeekdays` | `true` | `.weekdays` row visibility | Some compact popovers may hide the header row |
| `udc-calendar` | `showNavigation` | `true` | `.header > .nav-prev` and `.nav-next` visibility | Decorative use cases (read-only month display) may hide arrows |

### INSTANCE_SWAP properties

| Component | propName | default | Linked node | Notes |
|---|---|---|---|---|
| `udc-calendar` | `prevIcon` | `udc-icon-wrapper` instance with `iconName=chevron_left` | `.nav-prev` instance | RTL flips defaulted at instance level by designer |
| `udc-calendar` | `nextIcon` | `udc-icon-wrapper` instance with `iconName=chevron_right` | `.nav-next` instance | Same |

No raw Unicode chevrons in TEXT nodes. Always `udc-icon-wrapper` instances per skill rule.

## Container count axis

**Not applicable.** Calendar is not a container of N variable instances —
it's always a fixed 7×6 grid of `_udc-calendar-day` cells (42 instances). The
day instances aren't a variant axis on `udc-calendar`; they're pre-built
children of every variant.

## Sibling reuse

- `udc-icon-wrapper` — for the prev/next month nav buttons (INSTANCE_SWAP defaults: `chevron_left`, `chevron_right`).
- No reuse of `udc-button`, `udc-text-input`, `udc-dropdown` directly inside the calendar (the field/popover wrapping happens at `udc-date-picker` level, not here).

## Assumptions and acceptance criteria

1. Bundled UDS text styles are discovered during Phase B; fall back to four-variable binding if absent. Either way is acceptable per the typography rule.
2. The calendar is week-starts-Monday by default. Designers can swap to Sunday-start by adjusting the weekday row; no separate variant axis for that (not a strong UX gain to encode it as a variant).
3. Year navigation is via `Shift+PageUp/PageDown` (keyboard) and a single year-jump UI deferred to a future iteration. No "click month name to open a year picker" pattern in this draft.
4. Range selection visual treatment is "left-half fill" on `range-start`, "full fill" on `in-range`, "right-half fill" on `range-end`. Implementing the half-fill via auto-layout pseudo-elements is a Storybook implementation detail; in Figma, draw a full-cell background with a horizontal accent that aligns to the cell edge.
5. Acceptance criteria for the eventual production-ready release:
   - Keyboard nav works per the table above
   - Selected, today, range-* states are visually distinguishable in both light and dark modes at WCAG AA contrast
   - aria-label on each day cell announces the full date
   - Component CSS uses only UDS tokens
   - Single-mode and range-mode visual treatments are both Figma-confirmed

## Open questions for designer

- Do we want a separate `weekStart` variant (Mon vs Sun) on `udc-calendar`, or keep it as locale-driven config the consumer sets at render time? **Default: config, not variant.**
- Range-mode selection: should `range-start` and `range-end` have asymmetric visual treatment (e.g. rounded outer corners)? **Default: yes — round outer, square inner.**
