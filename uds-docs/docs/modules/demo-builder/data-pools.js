// docs/modules/demo-builder/data-pools.js
// Random pool for Demo Builder previews. Property-management themed.
//
// Refactored in Phase 4 from flat string arrays into structured records so
// the placeholder vocabulary's transforms (`{{tenant.first}}`,
// `{{tenant.email}}`, `{{property.name}}`, etc.) can resolve from a single
// source. Legacy flat-array views are derived from the records so
// existing DEMO_TEMPLATES that still call `pick(DATA.tenants)` (and expect
// a string back) keep working until Phase 7 deletes the templates.

import { rnd, pick, randInt, fmtMoney } from './rng.js';

function emailFor(first, last) {
  const norm = (s) =>
    s.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  return `${norm(first)}.${norm(last)}@example.com`;
}

const TENANT_RECORDS = [
  ['Brian', 'Smith'], ['Catherine', 'Lee'], ['David', 'Brown'], ['Eva', 'White'], ['Marcus', 'Chen'],
  ['Priya', 'Patel'], ['Olivia', 'García'], ['Tomás', 'Rivera'], ['Ada', 'Okafor'], ['Jonas', 'Becker'],
  ['Sofia', 'Romano'], ['Henry', 'Müller'], ['Naomi', 'Tanaka'], ['Lucas', 'Dubois'], ['Anya', 'Volkov'],
  ['Liam', "O'Connor"], ['Isabela', 'Costa'], ['Yusuf', 'Demir'], ['Maya', 'Goldberg'], ['Felix', 'Andersen'],
  ['Zara', 'Ahmed'], ['Ethan', 'Wallace'], ['Hana', 'Park'], ['Diego', 'Morales'], ['Ingrid', 'Larsson'],
  ['Theo', 'Bennett'], ['Aisha', 'Khan'], ['Caleb', 'Foster'], ['Lina', 'Schwarz'], ['Rafael', 'Silva']
].map(([first, last]) => ({ first, last, full: `${first} ${last}`, email: emailFor(first, last) }));

const PROPERTY_RECORDS = [
  'Riverbend Estates', 'Sunnyvale Towers', 'Cedar Hills', 'Oakwood Gardens',
  'The Brookline', 'Maplewood Court', 'Harbor Point', 'Stonebridge Commons',
  'Willow Creek', 'Lakeside Place', 'Birchwood Lofts', 'Foxglove Apartments',
  'The Northgate', 'Pine Ridge', 'Summit View', 'Aurora Heights', 'The Linden'
].map((name) => ({ name }));

const STATUS_RECORDS = [
  { variant: 'success',   label: 'Active',    weight: 5 },
  { variant: 'warning',   label: 'Pending',   weight: 3 },
  { variant: 'error',     label: 'Overdue',   weight: 2 },
  { variant: 'secondary', label: 'Draft',     weight: 1 },
  { variant: 'success',   label: 'Renewed',   weight: 1 },
  { variant: 'secondary', label: 'Archived',  weight: 1 }
];

export const DATA = {
  // --- Structured records (preferred — used by Phase 7 substitution engine)
  tenantRecords: TENANT_RECORDS,
  propertyRecords: PROPERTY_RECORDS,
  statusRecords: STATUS_RECORDS,

  // --- Legacy flat views derived from records (consumed by current DEMO_TEMPLATES)
  tenants: TENANT_RECORDS.map((r) => r.full),
  properties: PROPERTY_RECORDS.map((p) => p.name),
  statuses: STATUS_RECORDS,

  quickActions: [
    { label: 'Upload CSV',     body: 'Import tenants from a spreadsheet',     icon: 'upload_file' },
    { label: 'Manual Entry',   body: 'Add tenants one at a time',             icon: 'edit_note'   },
    { label: 'Send Statements',body: "Email this month's balance summary",    icon: 'mail'        },
    { label: 'Generate Report',body: 'Build a custom owner report',           icon: 'description' },
    { label: 'Run Reconcile',  body: 'Match bank deposits to invoices',       icon: 'rule'        },
    { label: 'Schedule Tour',  body: 'Book a unit walkthrough',               icon: 'event'       },
    { label: 'New Work Order', body: 'Log a maintenance request',             icon: 'build'       },
    { label: 'Post Listing',   body: 'Publish a vacant unit',                 icon: 'campaign'    }
  ],
  notifications: [
    { variant: 'info',    icon: 'info',          msg: () => randInt(2, 7) + ' invoices are pending review. Please check the table below.' },
    { variant: 'success', icon: 'check_circle',  msg: () => 'Payment of ' + fmtMoney(randInt(500, 9500)) + ' from ' + pick(DATA.tenants) + ' has been recorded.' },
    { variant: 'warning', icon: 'warning',       msg: () => randInt(1, 4) + ' lease(s) expire within the next 30 days.' },
    { variant: 'error',   icon: 'error',         msg: () => 'Failed to sync with the accounting system. Last attempt ' + randInt(2, 18) + ' min ago.' },
    { variant: 'info',    icon: 'info',          msg: () => 'New maintenance request from ' + pick(DATA.tenants) + ' at ' + pick(DATA.properties) + '.' }
  ],
  pageTitles: ['Tenants', 'Invoices', 'Properties', 'Leases', 'Work Orders'],
  primaryActions: [
    { label: 'New Tenant',    icon: 'add'         },
    { label: 'Send Invoice',  icon: 'send'        },
    { label: 'New Lease',     icon: 'description' },
    { label: 'Add Property',  icon: 'home_work'   },
    { label: 'New Work Order',icon: 'build'       }
  ],
  secondaryActions: ['Export', 'Print', 'Archive', 'Duplicate'],
  leaseTypes: ['Fixed term', 'Month-to-month', 'Sublease', 'Renewal'],
  navItems: [
    { label: 'Dashboard',          icon: 'space_dashboard' },
    { label: 'Leasing / CRM',      icon: 'book'            },
    { label: 'People / Contacts',  icon: 'contact_phone'   },
    { label: 'Property / Assets',  icon: 'home_work'       },
    { label: 'Accounting',         icon: 'monetization_on' },
    { label: 'Maintenance',        icon: 'build'           },
    { label: 'Reports',            icon: 'analytics'       },
    { label: 'Settings',           icon: 'settings'        }
  ],
  tabSets: [
    ['Overview', 'Invoices', 'Tenants', 'Reports'],
    ['Summary', 'Payments', 'Documents', 'History'],
    ['Open', 'Scheduled', 'Closed', 'Archived'],
    ['Active', 'Pending', 'Renewals', 'Overdue']
  ],
  chipSets: [
    ['All', 'Active', 'Pending', 'Overdue'],
    ['All', 'This Month', 'Last 30 days', 'Custom'],
    ['All', 'Studio', '1 BR', '2 BR', '3+ BR'],
    ['All', 'Open', 'In Progress', 'Closed']
  ],
  breadcrumbTrails: [
    ['Home', 'Properties', null],
    ['Home', 'Tenants', null],
    ['Home', 'Accounting', 'Invoices'],
    ['Home', 'Leasing', 'Applications'],
    ['Home', 'Maintenance', 'Work Orders']
  ],
  dialogScripts: [
    { title: 'Confirm Archive',      body: 'Archive this lease? You can restore it within 30 days.',                       confirm: 'Archive',  cancel: 'Cancel' },
    { title: 'Send Late Notice',     body: 'A late-payment notice will be emailed to the tenant on file.',                  confirm: 'Send',     cancel: 'Cancel' },
    { title: 'Delete Draft Invoice', body: 'This invoice is still in draft. Once deleted it cannot be recovered.',          confirm: 'Delete',   cancel: 'Keep'   },
    { title: 'Approve Application',  body: 'Approving will trigger the welcome email and create a new lease record.',       confirm: 'Approve',  cancel: 'Cancel' },
    { title: 'Schedule Maintenance', body: 'A technician will be dispatched on the next available slot.',                   confirm: 'Schedule', cancel: 'Cancel' }
  ],
  tooltipPairs: [
    [{ icon: 'info',       tip: 'More information about this metric' }, { icon: 'help',    tip: 'Need help? Open the docs.' }],
    [{ icon: 'sync',       tip: 'Last synced just now' },                { icon: 'history', tip: 'View change history' }],
    [{ icon: 'visibility', tip: 'Show full details' },                   { icon: 'lock',    tip: 'This field is read-only' }],
    [{ icon: 'star',       tip: 'Mark as priority' },                    { icon: 'flag',    tip: 'Flag for follow-up' }]
  ]
};

// Weighted status pick (Active is more common than Overdue, etc.)
export function pickStatus() {
  const total = DATA.statuses.reduce((s, x) => s + x.weight, 0);
  let roll = rnd() * total;
  for (let i = 0; i < DATA.statuses.length; i++) {
    roll -= DATA.statuses[i].weight;
    if (roll <= 0) return DATA.statuses[i];
  }
  return DATA.statuses[0];
}
