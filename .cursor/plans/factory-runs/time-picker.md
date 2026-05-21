# Factory Phase A Model — `time-picker`

Status: **awaiting approval**. No Figma writes have happened.

## Purpose

A time picker lets users select a time of day. The field shows a
formatted time string (e.g. `09:30 AM` or `21:30`); the trigger opens a
popover with hour, minute (and optional second) segments plus an AM/PM
toggle in 12-hour format.

## When to use / when not to use

| Use when | Don't use when |
|---|---|
| Capturing a specific clock time matters | Approximate time text ("morning") → Text Input |
| Scheduling, reminders, time-stamped events | Both date and time are needed → Date Time Picker |
| Discrete granularity (typically minute or 5-minute) | Continuous duration spans → consider a slider |

## Anatomy

```
udc-time-picker (root, vertical auto-layout)
├── udc-time-picker__label (TEXT — sibling reuse: udc-label)
├── udc-time-picker__field (horizontal auto-layout)
│   ├── _udc-time-picker_input (TEXT — formatted time, e.g. "09:30 AM")
│   └── _udc-time-picker_trigger (INSTANCE of udc-icon-wrapper, iconName="schedule")
├── udc-time-picker__popover (vertical auto-layout, position: absolute)
│   ├── udc-time-picker__columns (horizontal auto-layout, 3 columns)
│   │   ├── _udc-time-picker-segment (hour spinner — list of hour values)
│   │   ├── _udc-time-picker-segment (minute spinner — list of minute values)
│   │   └── _udc-time-picker-meridiem (AM/PM toggle, visible only in 12h format)
│   └── udc-time-picker__actions (horizontal auto-layout — Cancel / OK buttons)
└── udc-time-picker__helper (TEXT — helper or error text)
```

`_udc-time-picker-segment` is a vertical list with a focused/selected
middle row + adjacent rows shown faded. Mimics native iOS-style picker
wheels visually but is a scroll-list (`role="listbox"`) for accessibility.

## Subcomponent classification

| Set | Classification | Reason |
|---|---|---|
| `udc-time-picker` | **Main component** | Designers pick from library |
| `_udc-time-picker-segment` | **Subcomponent** | A single spinner column has no UX value standalone; its variant axes (`segmentType=hour|minute|second`, `selected-value`) are meaningless outside the parent |
| `_udc-time-picker-meridiem` | **Subcomponent** | AM/PM pill toggle; only meaningful in 12h time-picker context |

## Variant axes — `udc-time-picker` (main)

| Axis | Values | Default | Rationale |
|---|---|---|---|
| `data-state` | `default`, `error` | `default` | Matches form field convention |
| `data-open` | `false`, `true` | `false` | Popover visibility |
| `format` | `12h`, `24h` | `12h` | 12h shows meridiem column; 24h hides it |
| `size` | `sm`, `md` | `md` | `sm` for filter rows |
| `disabled` | `false`, `true` | `false` | Field non-interactive |

## Variant axes — `_udc-time-picker-segment` (subcomponent)

| Axis | Values | Default | Rationale |
|---|---|---|---|
| `segmentType` | `hour`, `minute`, `second` | `minute` | Drives which numeric range is shown |
| `state` | `default`, `focus-visible`, `disabled` | `default` | Three states are enough for the column |

## State matrix — `udc-time-picker` (main)

| State | Visual treatment | Notes |
|---|---|---|
| default | Field with clock icon | Closed |
| focus-visible | Focus ring on field | Keyboard focus |
| open | Popover visible, segment wheels in focus | `data-open=true` |
| error | Recolor label, border, helper | Validation feedback |
| disabled | Field dims; popover never opens | Non-interactive |

## Accessibility plan

- **Role on field**: `<button role="combobox" aria-haspopup="dialog" aria-expanded>` or `<input type="text">` with mask. Same posture as `udc-date-picker`.
- **Keyboard on field**:
  - `Tab` / `Shift+Tab` — move focus
  - `Enter` / `Space` / `Down Arrow` — open popover
  - Direct typing — input mask `HH:MM AM/PM` (12h) or `HH:MM` (24h)
- **Keyboard inside popover**:
  - `Tab` cycles hour → minute → meridiem (if 12h) → OK → Cancel
  - Within a segment column: `ArrowUp` / `ArrowDown` change value; `PageUp` / `PageDown` jump by 5
  - `Enter` confirms; `Esc` cancels (closes popover, no commit)
- **Screen reader**:
  - Each segment column = `role="listbox"` with `role="option"` rows.
  - `aria-label` on hour column: "Hour"; minute column: "Minute"; meridiem: "Period".
  - Selected option per column has `aria-selected="true"`.
  - Field announces the full time on focus.

## Token plan

Field tokens are identical to `udc-date-picker` (same form-field surface).
Popover-specific additions:

| Role | Token |
|---|---|
| Segment column background | `--uds-color-surface-main` |
| Segment selected row background | `--uds-color-surface-interactive-subtle` |
| Segment selected row text | `--uds-color-text-primary`, weight `medium` |
| Segment adjacent row text | `--uds-color-text-secondary` |
| Segment column divider | `--uds-color-border-tertiary` (1px) |
| Meridiem toggle background | `--uds-color-surface-subtle` |
| Meridiem active pill background | `--uds-color-surface-interactive-default` |
| Meridiem active pill text | `--uds-color-text-inverse` |
| Actions row gap | `--uds-space-100` |
| Trigger icon | `material-icons: schedule` (via `udc-icon-wrapper`) |

No `MISSING` token expected.

## Typography binding strategy

Same as date-picker / calendar. Phase B confirms bundled style availability.

- Field value: `--uds-font-size-base` regular
- Segment selected value: `--uds-font-size-lg` (18px) medium
- Segment adjacent values: `--uds-font-size-base` regular
- Meridiem toggle text: `--uds-font-size-sm` medium

## Inspector-editable properties

### Variant axes (recap)
`data-state`, `data-open`, `format`, `size`, `disabled`

### TEXT properties

| Component | propName | default | Linked node |
|---|---|---|---|
| `udc-time-picker` | `label` | `Time` | `.label` |
| `udc-time-picker` | `value` | `HH:MM AM/PM` | `._udc-time-picker_input` |
| `udc-time-picker` | `helperText` | `` (empty) | `.helper` |
| `_udc-time-picker-segment` | `selectedValue` | `00` | `.selected-row` |

### BOOLEAN properties

| Component | propName | default | Toggles |
|---|---|---|---|
| `udc-time-picker` | `showLabel` | `true` | `.label` visibility |
| `udc-time-picker` | `showHelperText` | `false` | `.helper` visibility |
| `udc-time-picker` | `showSeconds` | `false` | The third segment column visibility |
| `udc-time-picker` | `required` | `false` | Required asterisk in label |

### INSTANCE_SWAP properties

| Component | propName | default | Linked node |
|---|---|---|---|
| `udc-time-picker` | `triggerIcon` | `udc-icon-wrapper` with `iconName=schedule` | `._udc-time-picker_trigger` |

## Container count axis

**Conditionally applicable** for `_udc-time-picker-segment`:

| Pattern | Indicative range | Why |
|---|---|---|
| Hour segment | 12 (12h format) or 24 (24h format) | Driven by `format` axis on parent |
| Minute segment | 60 (or 12 if `step=5`) | Step is a runtime config, not a variant |
| Second segment | 60 (or 12 if `step=5`) | Hidden when `showSeconds=false` |

The segment subcomponent itself does NOT need a `count` variant — it's a
scrollable list that renders all values for its range at runtime. Figma
will show a 5-row visible window with the selected row centered; the full
list isn't rendered statically.

## Sibling reuse

- `udc-icon-wrapper` — trigger icon (`schedule`)
- `udc-text-input` — visual baseline for the field row
- `udc-label` — label row
- `udc-button` — OK / Cancel buttons in the actions row (INSTANCE reuse)

## Assumptions and acceptance criteria

1. The minute / second `step` (e.g. `step=5`) is a runtime config, not a variant.
2. Min/max bounds are runtime config, not a variant.
3. The OK / Cancel actions row inside the popover is part of `udc-time-picker`, not a separate component. Two `udc-button` instances nested in.
4. No "now" button in this draft. Could be added in a 0.4 iteration.
5. Acceptance criteria for the eventual production-ready release:
   - Both 12h and 24h formats render correctly
   - Segment columns scroll keyboard-accessibly
   - Field + popover meet WCAG AA contrast across themes
   - Error state recolors as documented
   - Component CSS uses only UDS tokens

## Open questions for designer

- Should the popover present hour/minute as **spinner wheels** (vertical scroll lists, iOS-style) or as **dropdowns** (each column is a `udc-dropdown`)? **Default: spinner wheels** — feels native for time, better keyboard ergonomics with arrow keys, and matches the visual treatment most modern web/mobile design systems converge on (Carbon, Polaris, Material). Confirm.
- Do we want a "Now" quick-select button in the popover? **Default: no** — adds complexity; not common in form contexts.
