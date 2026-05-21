# Factory Phase A Model — `date-time-picker`

Status: **awaiting approval**. No Figma writes have happened.

## Purpose

A date time picker combines date selection and time selection into one
form control, returning a full timestamp. Two layout modes: a single
field that opens a unified popover containing both calendar and time
columns, or two side-by-side fields (date + time) sharing one logical
value.

## When to use / when not to use

| Use when | Don't use when |
|---|---|
| Both date and time are required together | Only date matters → Date Picker |
| Appointment scheduling, event start/end, timestamp entry | Only time matters → Time Picker |
| The value semantically IS a timestamp (one decision, two parts) | Two independent decisions → two separate fields |

## Anatomy — two layout variants

### `layout=combined` — single field, single popover

```
udc-date-time-picker (root, vertical auto-layout)
├── udc-date-time-picker__label
├── udc-date-time-picker__field (horizontal auto-layout)
│   ├── _udc-date-time-picker_input (TEXT — "MM/DD/YYYY HH:MM AM/PM")
│   └── _udc-date-time-picker_trigger (INSTANCE of udc-icon-wrapper, iconName="event")
├── udc-date-time-picker__popover (vertical or horizontal auto-layout)
│   ├── udc-calendar (INSTANCE, mode=single)
│   ├── udc-divider (INSTANCE — visual separator)
│   ├── udc-date-time-picker__time-row (horizontal auto-layout)
│   │   └── 3 instances of _udc-time-picker-segment (hour, minute, meridiem)
│   └── udc-date-time-picker__actions (Cancel + OK udc-button instances)
└── udc-date-time-picker__helper
```

### `layout=split` — two fields, one logical value

```
udc-date-time-picker (root, horizontal or vertical auto-layout)
├── udc-date-time-picker__label
├── udc-date-time-picker__fields (horizontal auto-layout, gap=--uds-space-150)
│   ├── udc-date-picker (INSTANCE — handles date half)
│   └── udc-time-picker (INSTANCE — handles time half)
└── udc-date-time-picker__helper
```

In `split` mode, this component is effectively a layout + label wrapper
around two existing pickers. In `combined` mode, it builds its own
popover that nests `udc-calendar` + the time-segment subcomponents.

## Subcomponent classification

| Set | Classification | Reason |
|---|---|---|
| `udc-date-time-picker` | **Main component** | Designers pick from library |

No new subcomponents. Reuses:
- `udc-calendar` for the date half
- `_udc-time-picker-segment` for the time spinners in `combined` mode
- `udc-date-picker` + `udc-time-picker` as nested instances in `split` mode
- `udc-icon-wrapper`, `udc-divider`, `udc-button`, `udc-label`

## Variant axes

| Axis | Values | Default | Rationale |
|---|---|---|---|
| `layout` | `combined`, `split` | `combined` | Combined is the most common UX; split is for cases where the user mentally treats them as two separate fields |
| `data-state` | `default`, `error` | `default` | Standard form validation |
| `data-open` | `false`, `true` | `false` | Popover visibility (only relevant in `combined`) |
| `size` | `sm`, `md` | `md` | `sm` for filter rows |
| `disabled` | `false`, `true` | `false` | Non-interactive |
| `timeFormat` | `12h`, `24h` | `12h` | Inherits format of the time half |

Total nominal variant count: 2 × 2 × 2 × 2 × 2 × 2 = 64. **In practice we
build only the meaningful combinations** — e.g. `data-open=true` doesn't
apply when `layout=split` (no unified popover). Aim for ~20 distinct
variants covering the actual usable combinations, not the full Cartesian
product. Phase B builds the variants we agree on in this Phase A.

## State matrix

| State | combined treatment | split treatment |
|---|---|---|
| default | Field with event icon | Two fields side-by-side |
| focus-visible | Focus ring on field | Focus ring on whichever sub-field has focus |
| open | Popover visible with calendar + time | N/A (sub-pickers each have their own popover) |
| error | Field border + helper recolor | Both sub-fields recolor (consumer can target a specific half) |
| disabled | Field + popover lockout | Both sub-fields disabled |

## Accessibility plan

### `combined` layout

- Field role: `<button role="combobox" aria-haspopup="dialog" aria-expanded>`
- Popover is `role="dialog"` with `aria-modal="false"`
- `aria-label` on field: "Date and time picker, <current value>"
- Keyboard inside popover: Tab cycles through `udc-calendar` grid → hour segment → minute segment → meridiem (if 12h) → OK → Cancel
- `Esc` closes popover; `Enter` commits

### `split` layout

- Two separately-labeled controls grouped via `<fieldset><legend>`
- Each sub-control has its own ARIA wiring (inherited from `udc-date-picker` and `udc-time-picker`)
- Shared `aria-describedby` for the wrapper helper text

## Token plan

Identical to date-picker + time-picker. No new tokens needed.

`combined`-layout popover dimensions are wider than either sub-picker
alone because it horizontally combines calendar + time. Default width
~360px (calendar) + space + ~180px (time column) ≈ 580px. Will adjust
during Phase B based on actual layout measurements.

## Typography binding strategy

Same as siblings.

## Inspector-editable properties

### Variant axes (recap)
`layout`, `data-state`, `data-open`, `size`, `disabled`, `timeFormat`

### TEXT properties

| propName | default | Linked node |
|---|---|---|
| `label` | `Date & time` | `.label` |
| `value` | `MM/DD/YYYY HH:MM AM/PM` (combined) | `._udc-date-time-picker_input` |
| `helperText` | `` | `.helper` |

In `split` layout, the nested `udc-date-picker` and `udc-time-picker`
instances expose their own TEXT properties via instance-swap. The
parent doesn't re-expose them.

### BOOLEAN properties

| propName | default | Toggles |
|---|---|---|
| `showLabel` | `true` | `.label` visibility |
| `showHelperText` | `false` | `.helper` visibility |
| `required` | `false` | Required asterisk |

### INSTANCE_SWAP properties

| propName | default | Linked node |
|---|---|---|
| `triggerIcon` | `udc-icon-wrapper` with `iconName=event` | `._udc-date-time-picker_trigger` (combined layout only) |

## Container count axis

Not applicable at the top level. The contained `udc-calendar` and
`_udc-time-picker-segment` instances each follow their own count rules.

## Sibling reuse

- `udc-calendar` (INSTANCE in `combined` popover)
- `udc-date-picker` + `udc-time-picker` (INSTANCES in `split` layout)
- `_udc-time-picker-segment` (INSTANCES for hour/minute/meridiem inside `combined` popover)
- `udc-icon-wrapper`, `udc-divider`, `udc-button`, `udc-label`

## Assumptions and acceptance criteria

1. `combined` layout is the default and primary use case.
2. `split` layout exists for design contexts where the user mentally separates date and time; ergonomically it's two instances side-by-side, not a new control.
3. Min/max datetime bounds, locale, and minute step are all runtime config — not variants.
4. Acceptance criteria for the eventual production-ready release:
   - Both layout modes render correctly across themes
   - Field + popover meet WCAG AA contrast
   - Error state visually distinguishable
   - Component CSS uses only UDS tokens
   - Popover layout doesn't clip at narrow viewports

## Open questions for designer

- For `combined` popover layout: calendar above, time below (vertical stack), OR calendar left, time right (horizontal)? **Default: horizontal**, since vertical can stretch the popover past viewport height on smaller screens. Confirm.
- Do we want a "now" button alongside OK / Cancel? **Default: no** for parity with `udc-time-picker`'s default.
- Should `split` layout be a separate component (`udc-date-time-fields`) instead of a layout variant on `udc-date-time-picker`? **Default: keep as a layout variant** — it's still semantically one value, just visually split. If the designer prefers a separate component, that's a 0.4 conversation.
