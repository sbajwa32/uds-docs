import type { RenderedExample } from '@/lib/examples-renderer';

export const WEB_COMPONENT_EXAMPLES: Record<string, RenderedExample[]> = {
  button: [
    {
      id: 'default',
      label: 'Button',
      description: 'Primary, secondary, and ghost actions.',
      html: `<udc-button variant="primary">Save changes</udc-button>
<udc-button variant="secondary">Cancel</udc-button>
<udc-button variant="ghost" leading-icon="edit">Edit</udc-button>`,
    },
  ],
  link: [
    {
      id: 'default',
      label: 'Link',
      description: 'Inline navigation with optional icons.',
      html: `<udc-link href="/leases" trailing-icon="chevron_right">View leases</udc-link>`,
    },
  ],
  label: [
    {
      id: 'default',
      label: 'Label',
      description: 'A form label with required indicator support.',
      html: `<udc-label for="email" required>Email address</udc-label>`,
    },
  ],
  'text-input': [
    {
      id: 'default',
      label: 'Text Input',
      description: 'A form-associated text field.',
      html: `<udc-text-input
  name="email"
  label="Email address"
  type="email"
  helper-text="We'll never share your email."
  required
></udc-text-input>`,
    },
  ],
  'text-area': [
    {
      id: 'default',
      label: 'Text Area',
      description: 'A form-associated multiline field.',
      html: `<udc-text-area
  name="notes"
  label="Notes"
  helper-text="Add context for the leasing team."
  max-length="500"
></udc-text-area>`,
    },
  ],
  checkbox: [
    {
      id: 'default',
      label: 'Checkbox',
      description: 'A form-associated checkbox.',
      html: `<udc-checkbox name="terms" required>Accept terms</udc-checkbox>`,
    },
  ],
  radio: [
    {
      id: 'default',
      label: 'Radio Group',
      description: 'A grouped set of radio options.',
      html: `<udc-radio-group name="contact" label="Preferred contact" value="email">
  <udc-radio value="email">Email</udc-radio>
  <udc-radio value="phone">Phone</udc-radio>
</udc-radio-group>`,
    },
  ],
  dropdown: [
    {
      id: 'default',
      label: 'Dropdown',
      description: 'A popup selection control.',
      html: `<udc-dropdown
  show-label
  label="Property"
  placeholder="Choose…"
  leading-icon="add_circle_outline"
  show-helper
  helper-text="Helper text"
  value="riverbend"
>
  <udc-dropdown-item value="riverbend">Riverbend Estates</udc-dropdown-item>
  <udc-dropdown-item value="lakeside">Lakeside Villas</udc-dropdown-item>
  <udc-dropdown-item value="rolling-pines">Rolling Pines</udc-dropdown-item>
</udc-dropdown>`,
    },
  ],
  combobox: [
    {
      id: 'default',
      label: 'Combobox',
      description: 'A selectable option list prepared for filtering behavior.',
      html: `<udc-combobox label="Property" value="riverbend">
  <udc-combobox-option value="riverbend">Riverbend Estates</udc-combobox-option>
  <udc-combobox-option value="lakeside">Lakeside Villas</udc-combobox-option>
</udc-combobox>`,
    },
  ],
  'date-picker': [
    {
      id: 'default',
      label: 'Date Picker',
      description: 'A form-associated date field.',
      html: `<udc-date-picker name="move-in" label="Move-in date"></udc-date-picker>`,
    },
  ],
  toggle: [
    {
      id: 'default',
      label: 'Toggle',
      description: 'A switch for on/off settings.',
      html: `<udc-toggle name="notifications" checked>Email notifications</udc-toggle>`,
    },
  ],
  search: [
    {
      id: 'default',
      label: 'Search',
      description: 'A form-associated search field.',
      html: `<udc-search label="Search tenants" placeholder="Search by name"></udc-search>`,
    },
  ],
  badge: [
    {
      id: 'default',
      label: 'Badge',
      description: 'A static status label.',
      html: `<udc-badge tone="success">Active</udc-badge>
<udc-badge tone="warning">Pending</udc-badge>
<udc-badge tone="error">Overdue</udc-badge>`,
    },
  ],
  chip: [
    {
      id: 'default',
      label: 'Chip',
      description: 'An interactive filter or input chip.',
      html: `<udc-chip variant="filter" selected>Active</udc-chip>
<udc-chip variant="input" removable>Leaseholder</udc-chip>`,
    },
  ],
  divider: [
    {
      id: 'default',
      label: 'Divider',
      description: 'A visual separator.',
      html: `<udc-divider></udc-divider>`,
    },
  ],
  'icon-wrapper': [
    {
      id: 'default',
      label: 'Icon Wrapper',
      description: 'A token-bound icon surface.',
      html: `<udc-icon-wrapper icon="info" label="Information"></udc-icon-wrapper>`,
    },
  ],
  spacer: [
    {
      id: 'default',
      label: 'Spacer',
      description: 'A token-sized spacing utility.',
      html: `<udc-spacer size="md"></udc-spacer>`,
    },
  ],
  breadcrumb: [
    {
      id: 'default',
      label: 'Breadcrumb',
      description: 'A breadcrumb navigation shell.',
      html: `<udc-breadcrumb>
  <a href="/">Home</a>
  <a href="/properties">Properties</a>
  <span aria-current="page">Riverbend Estates</span>
</udc-breadcrumb>`,
    },
  ],
  tabs: [
    {
      id: 'default',
      label: 'Tabs',
      description: 'Tabs with associated panels.',
      html: `<udc-tabs selected-panel="overview">
  <udc-tab panel="overview">Overview</udc-tab>
  <udc-tab panel="details">Details</udc-tab>
  <udc-tab-panel panel="overview">Overview content</udc-tab-panel>
  <udc-tab-panel panel="details">Details content</udc-tab-panel>
</udc-tabs>`,
    },
  ],
  'nav-header': [
    {
      id: 'default',
      label: 'Nav Header',
      description: 'A top application header.',
      html: `<udc-nav-header>
  <span slot="brand">Boardroom</span>
  <udc-button slot="actions" variant="ghost" leading-icon="account_circle">Profile</udc-button>
</udc-nav-header>`,
    },
  ],
  'nav-vertical': [
    {
      id: 'default',
      label: 'Nav Vertical',
      description: 'A side navigation shell.',
      html: `<udc-nav-vertical aria-label="Main navigation">
  <udc-nav-item href="/dashboard" current>Dashboard</udc-nav-item>
  <udc-nav-item href="/leases">Leases</udc-nav-item>
</udc-nav-vertical>`,
    },
  ],
  pagination: [
    {
      id: 'default',
      label: 'Pagination',
      description: 'Previous/next page navigation.',
      html: `<udc-pagination page="1" total-pages="10"></udc-pagination>`,
    },
  ],
  tile: [
    {
      id: 'default',
      label: 'Tile',
      description: 'A selectable card-like option.',
      html: `<udc-tile
  label="Upload CSV"
  description="Import tenants from a spreadsheet"
  selectable
></udc-tile>`,
    },
  ],
  list: [
    {
      id: 'default',
      label: 'List',
      description: 'A selectable list.',
      html: `<udc-list selectable>
  <udc-list-item value="dashboard" selected>Dashboard</udc-list-item>
  <udc-list-item value="settings">Settings</udc-list-item>
</udc-list>`,
    },
  ],
  'data-table': [
    {
      id: 'default',
      label: 'Data Table',
      description: 'A token-bound table wrapper.',
      html: `<udc-data-table>
  <table>
    <thead><tr><th data-sort-key="tenant" tabindex="0">Tenant</th><th>Status</th></tr></thead>
    <tbody><tr><td>Brian Smith</td><td><udc-badge tone="success">Active</udc-badge></td></tr></tbody>
  </table>
</udc-data-table>`,
    },
  ],
  'data-view': [
    {
      id: 'default',
      label: 'Data View',
      description: 'A structured content view.',
      html: `<udc-data-view>
  <span slot="header">Lease Summary</span>
  <p>Current balance: $0.00</p>
  <udc-button slot="actions" variant="secondary">View details</udc-button>
</udc-data-view>`,
    },
  ],
  notification: [
    {
      id: 'default',
      label: 'Notification',
      description: 'A message with optional dismissal.',
      html: `<udc-notification tone="info" dismissible>
  3 invoices are pending review.
</udc-notification>`,
    },
  ],
  dialog: [
    {
      id: 'default',
      label: 'Dialog',
      description: 'A modal dialog shell.',
      html: `<udc-dialog heading="Confirm archive" open>
  Archive this lease?
  <div slot="actions">
    <udc-button variant="secondary">Cancel</udc-button>
    <udc-button variant="primary" color="danger">Archive</udc-button>
  </div>
</udc-dialog>`,
    },
  ],
  tooltip: [
    {
      id: 'default',
      label: 'Tooltip',
      description: 'A trigger/content tooltip.',
      html: `<udc-tooltip>
  <udc-button slot="trigger" variant="ghost" icon-only leading-icon="info" aria-label="More information"></udc-button>
  More information about this field.
</udc-tooltip>`,
    },
  ],
};
