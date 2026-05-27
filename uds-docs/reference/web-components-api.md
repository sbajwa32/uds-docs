# UDS Web Components API Contract

This is the replacement contract for the current unshipped class-based documented API. It does not edit Figma-derived component specs or examples; it translates the current documented intent into a Lit Web Components architecture that can run in parallel until UDS is ready to cut over.

## Standard Contract

Every component package entry must define:

- Tag name: `udc-<component-id>`.
- Shadow DOM: enabled by default. Light DOM content enters through named slots.
- Attributes: public, documented kebab-case attributes that reflect to typed properties.
- Events: `udc-*` custom events for component-specific behavior. Native events are preserved where the component wraps a native control.
- CSS parts: documented `::part()` hooks for supported styling. Internal selectors are not public API.
- Tokens: styling uses existing `--uds-*` CSS custom properties inherited from the host page.
- Accessibility: keyboard behavior and ARIA are implemented inside the component where the component owns the interaction.
- React wrapper: exported from `@uds/react` and backed by the same Web Component, with React-friendly props and event callbacks.

## Implemented Components

These components have initial Web Component and React wrapper implementations in this branch:

| Component | Tag | React wrapper | Status | Notes |
|---|---|---|---|---|
| Button | `udc-button` | `UdsButton` | Implemented | Uses native button semantics inside shadow DOM, supports `variant`, `size`, `color`, icons, `selected`, `disabled`, and `type`. |
| Badge | `udc-badge` | `UdsBadge` | Implemented | Static status label with `tone`, `variant`, and `size`. |
| Chip | `udc-chip` | `UdsChip` | Implemented | Supports filter/input/dropdown patterns, selection, dismiss events, and keyboard dismissal. |
| Notification | `udc-notification` | `UdsNotification` | Implemented | Supports tone, prominence, inline mode, dismiss button, and `udc-dismiss`. |
| Tile | `udc-tile` | `UdsTile` | Implemented | Selectable card-like option with selected/disabled states and activation events. |
| Text Input | `udc-text-input` | `UdsTextInput` | Implemented | Form-associated text field with visible label, helper text, counter, icons, and error state. |
| Checkbox | `udc-checkbox` | `UdsCheckbox` | Implemented | Form-associated checkbox with checked, indeterminate, required, error, and disabled states. |
| Tabs | `udc-tabs`, `udc-tab`, `udc-tab-panel` | `UdsTabs`, `UdsTab`, `UdsTabPanel` | Implemented | Roving focus, keyboard navigation, selected panel management, and `udc-tab-change`. |
| Breadcrumb | `udc-breadcrumb` | `UdsBreadcrumb` | Implemented | Slotted breadcrumb shell with navigation semantics. |
| Combobox | `udc-combobox`, `udc-combobox-option` | `UdsCombobox`, `UdsComboboxOption` | Implemented | Initial form-associated popup selection API. Filtering and async behavior remain contract-expansion items. |
| Data Table | `udc-data-table` | `UdsDataTable` | Implemented | Shadow-DOM wrapper for slotted table content with supported wrapper part. |
| Data View | `udc-data-view` | `UdsDataView` | Implemented | Header/body/action slot structure for summary layouts. |
| Date Picker | `udc-date-picker` | `UdsDatePicker` | Implemented | Form-associated date field backed by a native date input. |
| Dialog | `udc-dialog` | `UdsDialog` | Implemented | Modal shell with backdrop, heading, action slot, and `udc-close`. |
| Divider | `udc-divider` | `UdsDivider` | Implemented | Static separator with horizontal/vertical orientation. |
| Dropdown | `udc-dropdown`, `udc-dropdown-item` | `UdsDropdown`, `UdsDropdownItem` | Implemented | Form-associated popup selection API with `udc-change`. |
| Icon Wrapper | `udc-icon-wrapper` | `UdsIconWrapper` | Implemented | Token-bound icon surface with accessible-label support. |
| Label | `udc-label` | `UdsLabel` | Implemented | Form label helper with `for`, required, and disabled states. |
| Link | `udc-link` | `UdsLink` | Implemented | Anchor wrapper with icon slots and disabled state. |
| List | `udc-list`, `udc-list-item` | `UdsList`, `UdsListItem` | Implemented | Slotted list shell with selectable item events. |
| Nav Header | `udc-nav-header` | `UdsNavHeader` | Implemented | Brand/nav/action slot structure. |
| Nav Vertical | `udc-nav-vertical`, `udc-nav-item` | `UdsNavVertical`, `UdsNavItem` | Implemented | Side navigation shell with current-page item support. |
| Pagination | `udc-pagination` | `UdsPagination` | Implemented | Previous/next page control with `udc-page-change`. |
| Radio | `udc-radio`, `udc-radio-group` | `UdsRadio`, `UdsRadioGroup` | Implemented | Radio group and option tags with value-change events. |
| Search | `udc-search` | `UdsSearch` | Implemented | Form-associated search input with `udc-input` and `udc-change`. |
| Spacer | `udc-spacer` | `UdsSpacer` | Implemented | Token-sized spacing utility element. |
| Text Area | `udc-text-area` | `UdsTextArea` | Implemented | Form-associated multiline input with helper and counter support. |
| Toggle | `udc-toggle` | `UdsToggle` | Implemented | Form-associated switch with `udc-change`. |
| Tooltip | `udc-tooltip` | `UdsTooltip` | Implemented | Trigger/content slots with hover and focus visibility. |

## Replacement Map

| Current documented API | Web Component API | Notes |
|---|---|---|
| `<button class="udc-button-primary">Save</button>` | `<udc-button variant="primary">Save</udc-button>` | `variant` values: `primary`, `secondary`, `ghost`. |
| `<button class="udc-button-secondary" data-size="sm">Cancel</button>` | `<udc-button variant="secondary" size="sm">Cancel</udc-button>` | `data-size` becomes `size`. |
| `<button class="udc-button-primary" data-btn-color="danger">Delete</button>` | `<udc-button variant="primary" color="danger">Delete</udc-button>` | Destructive styling remains opt-in. |
| `<button class="udc-button-ghost" data-leading-icon="edit">Edit</button>` | `<udc-button variant="ghost" leading-icon="edit">Edit</udc-button>` | Icon names still map to Material Symbols. |
| `<span class="udc-badge" data-variant="success">Active</span>` | `<udc-badge tone="success">Active</udc-badge>` | Badge `data-variant` is now `tone` to avoid conflict with Button variant. |
| `<span class="udc-badge" data-prominent="false">Info</span>` | `<udc-badge variant="subtle">Info</udc-badge>` | `variant` values: `prominent`, `subtle`. |
| `<button class="udc-chip" data-variant="filter" aria-selected="true">Active</button>` | `<udc-chip variant="filter" selected>Active</udc-chip>` | Selection is a property and reflects to ARIA internally. |
| `<button class="udc-chip" data-variant="input">Leaseholder</button>` | `<udc-chip variant="input" removable>Leaseholder</udc-chip>` | Delete/Backspace dispatches `udc-dismiss`. |
| `<div class="udc-notification" data-variant="warning">...</div>` | `<udc-notification tone="warning">...</udc-notification>` | Icon and message layout live in shadow DOM. |
| `<div class="udc-notification" data-prominent="true">...</div>` | `<udc-notification variant="prominent">...</udc-notification>` | `inline` remains a boolean attribute. |
| `<div class="udc-tile" aria-selected="true">...</div>` | `<udc-tile selected>...</udc-tile>` | `label` and `description` can be attributes or slotted content. |
| `<div class="udc-text-input">...<input /></div>` | `<udc-text-input label="Full name" helper-text="First and last name required"></udc-text-input>` | The native input is internal and form-associated. |
| `<label class="udc-checkbox"><input type="checkbox" />...</label>` | `<udc-checkbox name="terms">I agree</udc-checkbox>` | The component owns the native checkbox and form value. |
| `<div class="udc-tabs" role="tablist"><button class="udc-tab">Overview</button></div>` | `<udc-tabs><udc-tab panel="overview">Overview</udc-tab><udc-tab-panel panel="overview">...</udc-tab-panel></udc-tabs>` | Tabs manage ARIA, roving focus, and panel visibility. |

## Contract Expansion Items

The full documented component inventory now has initial tags and React wrappers. The complex components still need deeper behavior passes before public cutover: Combobox filtering and async options, Data Table sorting/selection/virtualization, Date Picker calendar behavior, Dialog focus trapping, Dropdown menu-vs-select variants, Nav responsive behavior, and Tooltip positioning/dismissal.

## Cutover Guardrails

- Do not replace public examples under `uds-docs/uds/components/*/examples` until every documented component has a Web Component, React wrapper, examples, playground coverage, and verification.
- Do not delete or rewrite Figma-derived specs as part of this parallel package work.
- Any component with a sparse spec can land as an internal implementation only if the contract file calls out the design-content gap.
- The docs site can point to the package foundation, but it should not present the full class-to-Web-Component cutover as complete until examples, playgrounds, and deeper complex-component behavior are verified.
