// Random pool for Demo Builder previews. Property-management themed.
// Direct port of docs/modules/demo-builder/data-pools.js into TypeScript,
// reusing the `SubstitutionPool` shape from Chunk 08's
// `lib/examples-renderer.ts` so the same placeholder vocabulary resolves
// against either pool.
//
// The notification `msg()` thunks consume the module-level RNG via the
// `randInt` / `pick` / `fmtMoney` helpers — call `reseedRandom()` before
// drawing if reproducibility is needed.

import { fmtMoney, pick, randInt, rnd } from './rng';
import type { SubstitutionPool } from '../examples-renderer';

interface TenantTuple {
  first: string;
  last: string;
}

function emailFor(first: string, last: string): string {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  return `${norm(first)}.${norm(last)}@example.com`;
}

const TENANT_TUPLES: TenantTuple[] = [
  { first: 'Brian', last: 'Smith' },
  { first: 'Catherine', last: 'Lee' },
  { first: 'David', last: 'Brown' },
  { first: 'Eva', last: 'White' },
  { first: 'Marcus', last: 'Chen' },
  { first: 'Priya', last: 'Patel' },
  { first: 'Olivia', last: 'García' },
  { first: 'Tomás', last: 'Rivera' },
  { first: 'Ada', last: 'Okafor' },
  { first: 'Jonas', last: 'Becker' },
  { first: 'Sofia', last: 'Romano' },
  { first: 'Henry', last: 'Müller' },
  { first: 'Naomi', last: 'Tanaka' },
  { first: 'Lucas', last: 'Dubois' },
  { first: 'Anya', last: 'Volkov' },
  { first: 'Liam', last: "O'Connor" },
  { first: 'Isabela', last: 'Costa' },
  { first: 'Yusuf', last: 'Demir' },
  { first: 'Maya', last: 'Goldberg' },
  { first: 'Felix', last: 'Andersen' },
  { first: 'Zara', last: 'Ahmed' },
  { first: 'Ethan', last: 'Wallace' },
  { first: 'Hana', last: 'Park' },
  { first: 'Diego', last: 'Morales' },
  { first: 'Ingrid', last: 'Larsson' },
  { first: 'Theo', last: 'Bennett' },
  { first: 'Aisha', last: 'Khan' },
  { first: 'Caleb', last: 'Foster' },
  { first: 'Lina', last: 'Schwarz' },
  { first: 'Rafael', last: 'Silva' },
];

const TENANT_RECORDS = TENANT_TUPLES.map(({ first, last }) => ({
  first,
  last,
  full: `${first} ${last}`,
  email: emailFor(first, last),
}));

const PROPERTY_NAMES = [
  'Riverbend Estates',
  'Sunnyvale Towers',
  'Cedar Hills',
  'Oakwood Gardens',
  'The Brookline',
  'Maplewood Court',
  'Harbor Point',
  'Stonebridge Commons',
  'Willow Creek',
  'Lakeside Place',
  'Birchwood Lofts',
  'Foxglove Apartments',
  'The Northgate',
  'Pine Ridge',
  'Summit View',
  'Aurora Heights',
  'The Linden',
];
const PROPERTY_RECORDS = PROPERTY_NAMES.map((name) => ({ name }));

const STATUS_RECORDS = [
  { variant: 'success', label: 'Active', weight: 5 },
  { variant: 'warning', label: 'Pending', weight: 3 },
  { variant: 'error', label: 'Overdue', weight: 2 },
  { variant: 'secondary', label: 'Draft', weight: 1 },
  { variant: 'success', label: 'Renewed', weight: 1 },
  { variant: 'secondary', label: 'Archived', weight: 1 },
];

export const RANDOM_POOL: SubstitutionPool = {
  tenantRecords: TENANT_RECORDS,
  propertyRecords: PROPERTY_RECORDS,
  statusRecords: STATUS_RECORDS,

  // Legacy flat views derived from records — still used by some
  // notification thunks until the substitution engine is the only caller.
  tenants: TENANT_RECORDS.map((r) => r.full),
  properties: PROPERTY_RECORDS.map((p) => p.name),
  statuses: STATUS_RECORDS,

  quickActions: [
    { label: 'Upload CSV', body: 'Import tenants from a spreadsheet', icon: 'upload_file' },
    { label: 'Manual Entry', body: 'Add tenants one at a time', icon: 'edit_note' },
    { label: 'Send Statements', body: "Email this month's balance summary", icon: 'mail' },
    { label: 'Generate Report', body: 'Build a custom owner report', icon: 'description' },
    { label: 'Run Reconcile', body: 'Match bank deposits to invoices', icon: 'rule' },
    { label: 'Schedule Tour', body: 'Book a unit walkthrough', icon: 'event' },
    { label: 'New Work Order', body: 'Log a maintenance request', icon: 'build' },
    { label: 'Post Listing', body: 'Publish a vacant unit', icon: 'campaign' },
  ],
  notifications: [
    {
      variant: 'info',
      icon: 'info',
      msg: () =>
        randInt(2, 7) +
        ' invoices are pending review. Please check the table below.',
    },
    {
      variant: 'success',
      icon: 'check_circle',
      msg: () =>
        'Payment of ' +
        fmtMoney(randInt(500, 9500)) +
        ' from ' +
        pick(RANDOM_POOL.tenants) +
        ' has been recorded.',
    },
    {
      variant: 'warning',
      icon: 'warning',
      msg: () => randInt(1, 4) + ' lease(s) expire within the next 30 days.',
    },
    {
      variant: 'error',
      icon: 'error',
      msg: () =>
        'Failed to sync with the accounting system. Last attempt ' +
        randInt(2, 18) +
        ' min ago.',
    },
    {
      variant: 'info',
      icon: 'info',
      msg: () =>
        'New maintenance request from ' +
        pick(RANDOM_POOL.tenants) +
        ' at ' +
        pick(RANDOM_POOL.properties) +
        '.',
    },
  ],
  pageTitles: ['Tenants', 'Invoices', 'Properties', 'Leases', 'Work Orders'],
  primaryActions: [
    { label: 'New Tenant', icon: 'add' },
    { label: 'Send Invoice', icon: 'send' },
    { label: 'New Lease', icon: 'description' },
    { label: 'Add Property', icon: 'home_work' },
    { label: 'New Work Order', icon: 'build' },
  ],
  secondaryActions: ['Export', 'Print', 'Archive', 'Duplicate'],
  leaseTypes: ['Fixed term', 'Month-to-month', 'Sublease', 'Renewal'],
  navItems: [
    { label: 'Dashboard', icon: 'space_dashboard' },
    { label: 'Leasing / CRM', icon: 'book' },
    { label: 'People / Contacts', icon: 'contact_phone' },
    { label: 'Property / Assets', icon: 'home_work' },
    { label: 'Accounting', icon: 'monetization_on' },
    { label: 'Maintenance', icon: 'build' },
    { label: 'Reports', icon: 'analytics' },
    { label: 'Settings', icon: 'settings' },
  ],
  tabSets: [
    ['Overview', 'Invoices', 'Tenants', 'Reports'],
    ['Summary', 'Payments', 'Documents', 'History'],
    ['Open', 'Scheduled', 'Closed', 'Archived'],
    ['Active', 'Pending', 'Renewals', 'Overdue'],
  ],
  chipSets: [
    ['All', 'Active', 'Pending', 'Overdue'],
    ['All', 'This Month', 'Last 30 days', 'Custom'],
    ['All', 'Studio', '1 BR', '2 BR', '3+ BR'],
    ['All', 'Open', 'In Progress', 'Closed'],
  ],
  breadcrumbTrails: [
    ['Home', 'Properties'],
    ['Home', 'Tenants'],
    ['Home', 'Accounting', 'Invoices'],
    ['Home', 'Leasing', 'Applications'],
    ['Home', 'Maintenance', 'Work Orders'],
  ],
  dialogScripts: [
    {
      title: 'Confirm Archive',
      body: 'Archive this lease? You can restore it within 30 days.',
      confirm: 'Archive',
      cancel: 'Cancel',
    },
    {
      title: 'Send Late Notice',
      body: 'A late-payment notice will be emailed to the tenant on file.',
      confirm: 'Send',
      cancel: 'Cancel',
    },
    {
      title: 'Delete Draft Invoice',
      body: 'This invoice is still in draft. Once deleted it cannot be recovered.',
      confirm: 'Delete',
      cancel: 'Keep',
    },
    {
      title: 'Approve Application',
      body: 'Approving will trigger the welcome email and create a new lease record.',
      confirm: 'Approve',
      cancel: 'Cancel',
    },
    {
      title: 'Schedule Maintenance',
      body: 'A technician will be dispatched on the next available slot.',
      confirm: 'Schedule',
      cancel: 'Cancel',
    },
  ],
  tooltipPairs: [
    [
      { icon: 'info', tip: 'More information about this metric' },
      { icon: 'help', tip: 'Need help? Open the docs.' },
    ],
    [
      { icon: 'sync', tip: 'Last synced just now' },
      { icon: 'history', tip: 'View change history' },
    ],
    [
      { icon: 'visibility', tip: 'Show full details' },
      { icon: 'lock', tip: 'This field is read-only' },
    ],
    [
      { icon: 'star', tip: 'Mark as priority' },
      { icon: 'flag', tip: 'Flag for follow-up' },
    ],
  ],
};

// Weighted status pick (Active more common than Overdue, etc.).
// Consumes the module-level RNG.
export function pickStatus(): SubstitutionPool['statuses'][number] {
  const total = RANDOM_POOL.statuses.reduce((s, x) => s + x.weight, 0);
  let roll = rnd() * total;
  for (let i = 0; i < RANDOM_POOL.statuses.length; i++) {
    roll -= RANDOM_POOL.statuses[i].weight;
    if (roll <= 0) return RANDOM_POOL.statuses[i];
  }
  return RANDOM_POOL.statuses[0];
}
