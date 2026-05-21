# Factory Phase A Model — `date-picker`

Status: **awaiting approval**. No Figma writes have happened.

## ⚠️ Existing-component collision (surfaces for user decision)

`date-picker` already has:
- An entry in `uds-docs/uds/components.json` (placeholder, since 0.3).
- A public Figma page `⚫️ date-picker` (node `6094:27859`) with no inspectable component set.
- A doc-site placeholder folder `uds-docs/uds/components/date-picker/` with a knownIssues entry deferring Figma inspection.

**Proposed handling (per locked decision #2):**
- Factory writes ONLY to a fresh `🟠 Date Picker {Cursor}{Ignore}` page.
- The existing `⚫️ date-picker` page is NOT touched.
- On designer acceptance (page rename), the designer decides whether to delete the now-redundant `⚫️ date-picker` placeholder page, merge content, or leave both for a transition period.
- Doc-site landing happens later via `uds-updated`, which will see two competing Figma artifacts and ask the designer to reconcile.

If the user prefers a different handling — override the existing page, pick a different id, or skip date-picker — they should say so before the factory writes.

## Purpose

A date picker is a form field that lets a user enter or select a single
calendar date. It pairs a text-input-style field with an icon affordance
that opens a `udc-calendar` popover anchored to the field.

## When to use / when not to use

| Use when | Don't use when |
|---|---|
| A form needs a calendar date and visual context helps | Approximate / freeform date text → Text Input |
| Constrained date ranges or formats matter | Both date and time are required → Date Time Picker |
| Single date entry | Selecting a range → Date Range Picker variant (`mode=range` on Calendar in this draft; full DRP component is a future iteration) |

## Anatomy

```
udc-date-picker (root, vertical auto-layout)
├── udc-date-picker__label (TEXT — Sibling reuse: udc-label, optional asterisk)
├── udc-date-picker__field (horizontal auto-layout)
│   ├── _udc-date-picker_input (TEXT — formatted date string, e.g. "MM/DD/YYYY")
│   └── _udc-date-picker_trigger (INSTANCE of udc-icon-wrapper, iconName="calendar_today")
├── udc-date-picker__popover (vertical auto-layout, position: absolute)
│   └── udc-calendar (INSTANCE — mode=single)
└── udc-date-picker__helper (TEXT — helper or error text)
```

`udc-date-picker__field` is visually similar to `udc-text-input`'s field
row, but typing is constrained to a date-format mask.

## Subcomponent classification

| Set | Classification | Reason |
|---|---|---|
| `udc-date-picker` | **Main component** | Designers pick it from the library; lives at `uds/components/date-picker/` |

No sibling subcomponents besides the existing `udc-text-input`,
`udc-icon-wrapper`, `udc-label`, and the brand-new `udc-calendar` (factory'd
in the same approval round). Internal nodes named `__input` and `__trigger`
are layer-level, not separate Figma component sets.

## Variant axes

| Axis | Values | Default | Rationale |
|---|---|---|---|
| `data-state` | `default`, `error` | `default` | Validation state; mirrors `udc-text-input` |
| `data-open` | `false`, `true` | `false` | Popover visibility (matches `udc-dropdown` `data-open`) |
| `size` | `sm`, `md` | `md` | `sm` for filter rows; `md` standard form size |
| `disabled` | `false`, `true` | `false` | Non-interactive field; popover never opens |

## State matrix

| State | Visual treatment | Notes |
|---|---|---|
| default | Field with border, calendar icon | Closed popover |
| hover | Field border darkens | Light feedback |
| focus-visible | Outline ring on field | Keyboard focus |
| open (`data-open=true`) | Field border = interactive color; calendar popover visible below | Popover is part of the variant — pre-built in the open variant |
| error (`data-state=error`) | Label, border, helper text recolor to error tokens | Pairs with `aria-invalid` |
| disabled | Field surface dims; icon greyed; popover never opens | Field non-interactive |
| loading | **DEFERRED** — UDS has no spinner yet | Same posture as `udc-text-input` |

## Accessibility plan

- **Role on trigger field**: `<button role="combobox" aria-haspopup="dialog" aria-expanded>` wrapping a non-typeable display, OR an `<input type="text">` with strict masking + an icon button that toggles the popover. Decision deferred to Storybook implementation; Figma layer naming hints at the latter.
- **Keyboard on field**:
  - `Tab` / `Shift+Tab` — move focus in/out
  - `Enter` / `Space` / `Down Arrow` — open popover
  - Typing — input mask (e.g. `MM/DD/YYYY`); valid date selects/highlights matching cell in popover
- **Keyboard inside open popover**: inherits `udc-calendar` keyboard plan; `Esc` closes popover and returns focus to field.
- **Screen reader**:
  - Label association via `for`/`id` (sibling reuse with `udc-label`).
  - `aria-describedby` on field points to helper text.
  - `aria-invalid="true"` when `data-state=error`.
  - Popover open/close announces "Date picker, expanded/collapsed" via `aria-expanded`.

## Token plan

| Role | Token |
|---|---|
| Label color | `--uds-color-text-primary` |
| Field background | `--uds-color-surface-main` |
| Field border (default) | `--uds-color-border-primary` |
| Field border (hover) | `--uds-color-border-interactive-hover` |
| Field border (focus-visible) | `--uds-color-border-outline-focus-visible` (2px ring) |
| Field border (error) | `--uds-color-border-error` |
| Field border (disabled) | `--uds-color-border-disabled` |
| Field text color | `--uds-color-text-primary` (default), `--uds-color-text-disabled` (disabled) |
| Field placeholder text color | `--uds-color-text-secondary` |
| Trigger icon color | `--uds-color-icon-primary` (default), `--uds-color-icon-disabled` (disabled), `--uds-color-icon-interactive` (hover) |
| Field padding | `--uds-space-150` (12px) vertical, `--uds-space-200` (16px) horizontal |
| Field radius | `--uds-border-radius-input` (8px) |
| Field gap (input↔trigger) | `--uds-space-100` |
| Helper text default | `--uds-color-text-secondary`, `--uds-font-size-sm` |
| Helper text error | `--uds-color-text-error`, `--uds-font-size-sm` |
| Popover surface | `--uds-color-surface-main` |
| Popover border | `--uds-color-border-tertiary` |
| Popover radius | `--uds-border-radius-container` |
| Popover shadow | `--uds-shadow-depth-300` (confirm in Phase B; fall back to `depth-200` if missing) |

No `MISSING` token expected. The popover shadow is the one item I'd
double-check during Phase B variable resolution.

## Typography binding strategy

Same rule as `udc-calendar`. Bundled style discovery in Phase B; fall back to four-variable binding.

- Label: `--uds-font-size-base` medium-weight
- Field value: `--uds-font-size-base` regular-weight
- Helper text: `--uds-font-size-sm` regular-weight

## Inspector-editable properties

### Variant axes (recap)
`data-state`, `data-open`, `size`, `disabled`

### TEXT properties

| propName | default | Linked node |
|---|---|---|
| `label` | `Date` | `.label` text |
| `value` | `MM/DD/YYYY` (placeholder format) | `._udc-date-picker_input` text |
| `helperText` | `` (empty by default) | `.helper` text |

### BOOLEAN properties

| propName | default | Toggles |
|---|---|---|
| `showLabel` | `true` | `.label` visibility |
| `showHelperText` | `false` | `.helper` visibility |
| `required` | `false` | Required asterisk in label |

### INSTANCE_SWAP properties

| propName | default | Linked node |
|---|---|---|
| `triggerIcon` | `udc-icon-wrapper` with `iconName=calendar_today` | `._udc-date-picker_trigger` instance |

## Container count axis

Not applicable.

## Sibling reuse

- `udc-icon-wrapper` — trigger icon
- `udc-text-input` — visual baseline for the field (factory will NOT nest a text-input instance; it'll build the field row natively, but match the styling exactly so future re-sync via `sync-figma-component-spec` is easy)
- `udc-label` — label row (instance reuse where sensible)
- `udc-calendar` — popover content (INSTANCE; the just-factory'd component)

## Assumptions and acceptance criteria

1. Locale / date-format is a runtime config, not a variant.
2. Min/max date bounds are runtime config, not a variant.
3. The popover position is absolute below the field by default. Edge-flip behavior (when near viewport bottom) is implementation-detail, not a separate variant.
4. The factory will NOT auto-create a `udc-date-range-picker` component in this round. Range selection is handled by `udc-calendar`'s `mode=range`; whether to surface a dedicated DRP component is a follow-up designer decision.
5. Acceptance criteria for the eventual production-ready release:
   - Field + popover meet WCAG AA contrast in light and dark modes
   - Error state visually distinguishable from default
   - Popover anchors correctly and closes on `Esc` / outside-click
   - Component CSS uses only UDS tokens
   - All variants (24 = 2×2×2×3 if I expand size×state×open×disabled fully) are buildable

## Open questions for designer

- Do we ship a dedicated `udc-date-range-picker` in a future iteration, or keep range selection inside `udc-calendar`'s `mode=range` and let the consumer wire two date-picker fields together? **Default: keep range in calendar for now; revisit in 0.4.**
- For the existing-component collision, which path: factory-on-new-page-and-reconcile-later (default), override the public placeholder page, or skip date-picker entirely?
