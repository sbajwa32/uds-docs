// Renders per-component example HTML on the docs page.
//
// Lives outside lib/demo-builder/ because the docs page's Examples tab uses
// canonical (fixed) substitution
// while Demo Builder uses random substitution. Both need the same fetch +
// resolve mechanism, but only Demo Builder needs the random pool.
//
// Tokens use the same {{placeholder.name}} vocabulary as Demo Builder; see
// uds/schemas/placeholder-vocabulary.json.

import { udsResolve } from './uds-data';

// ---------------------------------------------------------------------------
// Canonical pool — fixed values for the docs Examples tab. Same shape as the
// random pool in data-pools.js so applyTokenSubstitution() can resolve the
// same placeholder vocabulary against either.
// ---------------------------------------------------------------------------

interface TenantRecord {
  first: string;
  last: string;
  full: string;
  email: string;
}

interface PropertyRecord {
  name: string;
}

interface StatusRecord {
  variant: string;
  label: string;
  weight: number;
}

interface QuickAction {
  label: string;
  body: string;
  icon: string;
}

interface NotificationRecord {
  variant: string;
  icon: string;
  msg: () => string;
}

interface PrimaryAction {
  label: string;
  icon: string;
}

interface NavItem {
  label: string;
  icon: string;
}

interface DialogScript {
  title: string;
  body: string;
  confirm: string;
  cancel: string;
}

interface TooltipPair {
  icon: string;
  tip: string;
}

export interface SubstitutionPool {
  tenantRecords: TenantRecord[];
  propertyRecords: PropertyRecord[];
  statusRecords: StatusRecord[];
  tenants: string[];
  properties: string[];
  statuses: StatusRecord[];
  quickActions: QuickAction[];
  notifications: NotificationRecord[];
  pageTitles: string[];
  primaryActions: PrimaryAction[];
  secondaryActions: string[];
  leaseTypes: string[];
  navItems: NavItem[];
  tabSets: string[][];
  chipSets: string[][];
  breadcrumbTrails: string[][];
  dialogScripts: DialogScript[];
  tooltipPairs: TooltipPair[][];
}

const tenant: TenantRecord = {
  first: 'Brian',
  last: 'Smith',
  full: 'Brian Smith',
  email: 'brian.smith@example.com',
};
const property: PropertyRecord = { name: 'Riverbend Estates' };
const status: StatusRecord = { variant: 'success', label: 'Active', weight: 5 };

export const CANONICAL_POOL: SubstitutionPool = {
  tenantRecords: [tenant],
  propertyRecords: [property],
  statusRecords: [status],
  tenants: [tenant.full],
  properties: [property.name],
  statuses: [status],

  quickActions: [
    { label: 'Upload CSV', body: 'Import tenants from a spreadsheet', icon: 'upload_file' },
    { label: 'Manual Entry', body: 'Add tenants one at a time', icon: 'edit_note' },
  ],
  notifications: [
    {
      variant: 'info',
      icon: 'info',
      msg: () => '3 invoices are pending review. Please check the table below.',
    },
  ],
  pageTitles: ['Tenants'],
  primaryActions: [{ label: 'New Tenant', icon: 'add' }],
  secondaryActions: ['Export'],
  leaseTypes: ['Fixed term', 'Month-to-month'],
  navItems: [
    { label: 'Dashboard', icon: 'space_dashboard' },
    { label: 'Leasing / CRM', icon: 'book' },
    { label: 'Accounting', icon: 'monetization_on' },
  ],
  tabSets: [['Overview', 'Invoices', 'Tenants', 'Reports']],
  chipSets: [['All', 'Active', 'Pending', 'Overdue']],
  breadcrumbTrails: [['Home', 'Properties', 'Riverbend Estates']],
  dialogScripts: [
    {
      title: 'Confirm Archive',
      body: 'Archive this lease? You can restore it within 30 days.',
      confirm: 'Archive',
      cancel: 'Cancel',
    },
  ],
  tooltipPairs: [
    [
      { icon: 'info', tip: 'More information about this metric' },
      { icon: 'help', tip: 'Need help? Open the docs.' },
    ],
  ],
};

// ---------------------------------------------------------------------------
// Substitution engine — resolves {{placeholder.name}} → string via pool.
// Canonical mode uses fixed values; the docs Examples tab is deterministic.
// Demo Builder (Chunk 12) will reuse `applyTokenSubstitution` with a random
// pool + RNG-backed amounts.
// ---------------------------------------------------------------------------

const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

function fmtMoney(n: number): string {
  const s = n.toFixed(2);
  return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function pickFirst<T>(arr: T[]): T {
  return arr[0];
}

/**
 * Canonical placeholder resolver — fixed values for every placeholder so the
 * docs page renders the same example output every load. Random-mode resolver
 * (used by Demo Builder) lives in lib/demo-builder/ and shares the
 * applyTokenSubstitution mechanism.
 */
function resolveCanonical(name: string, pool: SubstitutionPool): string {
  switch (name) {
    case 'tenant':
      return pickFirst(pool.tenantRecords).full;
    case 'tenant.first':
      return pickFirst(pool.tenantRecords).first;
    case 'tenant.last':
      return pickFirst(pool.tenantRecords).last;
    case 'tenant.email':
      return pickFirst(pool.tenantRecords).email;
    case 'property':
    case 'property.name':
      return pickFirst(pool.propertyRecords).name;
    case 'status.label':
      return pickFirst(pool.statusRecords).label;
    case 'status.variant':
      return pickFirst(pool.statusRecords).variant;
    case 'balance':
    case 'amount':
      // Canonical mode — same number every page load. The docstring on the
      // legacy canonical-pool says "$0.00"; legacy substitution.js used
      // randInt(0, 6500) even for canonical, which made amounts vary. We
      // honor the docstring contract here: fixed.
      return fmtMoney(0);
    case 'leaseType':
      return pickFirst(pool.leaseTypes);
    case 'pageTitle':
      return pickFirst(pool.pageTitles);
    case 'brand':
      return 'Boardroom';
    case 'date.relative':
      return '12 min ago';
    case 'id.short':
      return '#5482';
    case 'count.unread':
      return '7';
    default:
      // Surface unresolved placeholders verbatim so the missing token is
      // obvious in the rendered output.
      return `{{${name}}}`;
  }
}

export function applyTokenSubstitution(html: string, pool: SubstitutionPool = CANONICAL_POOL): string {
  return html.replace(PLACEHOLDER_RE, (_match, name: string) => resolveCanonical(name, pool));
}

// ---------------------------------------------------------------------------
// Manifest + example HTML fetchers. Caches per-component so re-renders don't
// hammer the network. Routes through udsResolve() so archive views work
// (Chunk 14 — version param flows through).
// ---------------------------------------------------------------------------

export interface ExampleManifestEntry {
  id: string;
  file: string;
  label?: string;
  description?: string;
  showInDocs?: boolean;
  demoWeight?: number;
}

interface ExampleManifest {
  examples: ExampleManifestEntry[];
}

const manifestCache = new Map<string, ExampleManifest>();
const htmlCache = new Map<string, string>();

function manifestKey(componentId: string, version?: string): string {
  return version ? `${version}/${componentId}` : componentId;
}

async function fetchManifest(
  componentId: string,
  version?: string,
): Promise<ExampleManifest> {
  const key = manifestKey(componentId, version);
  const cached = manifestCache.get(key);
  if (cached) return cached;
  const url = udsResolve(`components/${componentId}/examples/manifest.json`, version);
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`No manifest for component ${componentId} (HTTP ${res.status})`);
  }
  const data = (await res.json()) as ExampleManifest;
  manifestCache.set(key, data);
  return data;
}

async function fetchExampleFile(
  componentId: string,
  fileName: string,
  version?: string,
): Promise<string> {
  const key = `${manifestKey(componentId, version)}::${fileName}`;
  const cached = htmlCache.get(key);
  if (cached) return cached;
  const url = udsResolve(`components/${componentId}/examples/${fileName}`, version);
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`No example file ${fileName} for ${componentId} (HTTP ${res.status})`);
  }
  const text = await res.text();
  htmlCache.set(key, text);
  return text;
}

export interface RenderedExample {
  id: string;
  label: string;
  description: string;
  html: string;
}

/**
 * Fetches every showInDocs example for a component and applies canonical
 * token substitution to each. Returns ready-to-render entries for the docs
 * page Examples tab. Returns an empty array on any error.
 */
export async function fetchAllExamples(
  componentId: string,
  options: { version?: string; pool?: SubstitutionPool } = {},
): Promise<RenderedExample[]> {
  const { version, pool = CANONICAL_POOL } = options;
  try {
    const manifest = await fetchManifest(componentId, version);
    const visible = (manifest.examples || []).filter((e) => e.showInDocs !== false);
    const out: RenderedExample[] = [];
    for (const entry of visible) {
      const html = await fetchExampleFile(componentId, entry.file, version);
      out.push({
        id: entry.id,
        label: entry.label || entry.id,
        description: entry.description || '',
        html: applyTokenSubstitution(html, pool),
      });
    }
    return out;
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn(`fetchAllExamples failed for ${componentId}:`, err);
    }
    return [];
  }
}

/**
 * Fetches a single example variant by id. Used by the per-component
 * Implementation Reference panel (Code tab) and any future inline-example
 * embed.
 */
export async function fetchExampleHTML(
  componentId: string,
  options: { variantId?: string; version?: string; pool?: SubstitutionPool } = {},
): Promise<string | null> {
  const { variantId, version, pool = CANONICAL_POOL } = options;
  try {
    const manifest = await fetchManifest(componentId, version);
    const entries = manifest.examples || [];
    const variant = variantId
      ? entries.find((e) => e.id === variantId)
      : entries.find((e) => e.showInDocs !== false) ?? entries[0];
    if (!variant) return null;
    const html = await fetchExampleFile(componentId, variant.file, version);
    return applyTokenSubstitution(html, pool);
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn(`fetchExampleHTML failed for ${componentId}:`, err);
    }
    return null;
  }
}
