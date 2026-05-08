// docs/modules/demo-builder/canonical-pool.js
// Fixed canonical pool — used by docs page Examples tab so the same example
// HTML always renders with the same realistic data ("Brian Smith / Riverbend
// Estates / $0.00") instead of churning per page-load.
//
// Mirrors the random pool's structured shape so substitution.js can resolve
// the same vocabulary against either pool. Wired up by Phase 7.

const tenant = { first: 'Brian', last: 'Smith', full: 'Brian Smith', email: 'brian.smith@example.com' };
const property = { name: 'Riverbend Estates' };
const status = { variant: 'success', label: 'Active', weight: 5 };

export const CANONICAL_POOL = {
  tenantRecords: [tenant],
  propertyRecords: [property],
  statusRecords: [status],
  tenants: [tenant.full],
  properties: [property.name],
  statuses: [status],

  quickActions: [
    { label: 'Upload CSV',   body: 'Import tenants from a spreadsheet', icon: 'upload_file' },
    { label: 'Manual Entry', body: 'Add tenants one at a time',         icon: 'edit_note'   }
  ],
  notifications: [
    { variant: 'info', icon: 'info', msg: () => '3 invoices are pending review. Please check the table below.' }
  ],
  pageTitles: ['Tenants'],
  primaryActions: [{ label: 'New Tenant', icon: 'add' }],
  secondaryActions: ['Export'],
  leaseTypes: ['Fixed term', 'Month-to-month'],
  navItems: [
    { label: 'Dashboard',     icon: 'space_dashboard' },
    { label: 'Leasing / CRM', icon: 'book'            },
    { label: 'Accounting',    icon: 'monetization_on' }
  ],
  tabSets: [['Overview', 'Invoices', 'Tenants', 'Reports']],
  chipSets: [['All', 'Active', 'Pending', 'Overdue']],
  breadcrumbTrails: [['Home', 'Properties', 'Riverbend Estates']],
  dialogScripts: [{
    title: 'Confirm Archive',
    body: 'Archive this lease? You can restore it within 30 days.',
    confirm: 'Archive',
    cancel: 'Cancel'
  }],
  tooltipPairs: [
    [{ icon: 'info', tip: 'More information about this metric' }, { icon: 'help', tip: 'Need help? Open the docs.' }]
  ]
};

// Canonical pool returns the same value every time — Demo Builder picks
// random; docs page picks canonical. Same substitution engine for both.
export function pickCanonicalStatus() {
  return CANONICAL_POOL.statuses[0];
}
