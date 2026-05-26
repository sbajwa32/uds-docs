// Demo Builder random-mode substitution engine. Direct port of
// docs/modules/demo-builder/substitution.js. Resolves `{{placeholder}}`
// occurrences in example HTML using random picks from the supplied pool.
//
// Different from canonical substitution in `lib/examples-renderer.ts`:
//   - Canonical mode uses `pickFirst(pool.x)` so output is deterministic.
//   - Random mode uses `pick(pool.x)` and `randInt()` so each build
//     produces fresh-looking content.
//
// Tests should call `reseedRandom(seed)` first to get reproducible output.

import { fmtMoney, pick, randInt } from './rng';
import type { SubstitutionPool } from '../examples-renderer';
import { RANDOM_POOL } from './data-pools';

const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

function resolveRandom(name: string, pool: SubstitutionPool): string {
  switch (name) {
    case 'tenant':
      return pick(pool.tenantRecords).full;
    case 'tenant.first':
      return pick(pool.tenantRecords).first;
    case 'tenant.last':
      return pick(pool.tenantRecords).last;
    case 'tenant.email':
      return pick(pool.tenantRecords).email;
    case 'property':
    case 'property.name':
      return pick(pool.propertyRecords).name;
    case 'status.label':
      return pick(pool.statusRecords).label;
    case 'status.variant':
      return pick(pool.statusRecords).variant;
    case 'balance':
    case 'amount':
      return fmtMoney(randInt(0, 6500));
    case 'leaseType':
      return pick(pool.leaseTypes);
    case 'pageTitle':
      return pick(pool.pageTitles);
    case 'brand':
      return pick(['Boardroom', 'Tenant360', 'PropertyOS', 'LeasePro', 'Holdings']);
    case 'date.relative':
      return randInt(1, 23) + ' min ago';
    case 'id.short':
      return '#' + randInt(1000, 9999);
    case 'count.unread':
      return String(randInt(0, 15));
    default:
      // Surface unresolved placeholders verbatim so missing tokens are
      // obvious in the rendered output.
      return `{{${name}}}`;
  }
}

export function applyRandomSubstitution(
  html: string,
  pool: SubstitutionPool = RANDOM_POOL,
): string {
  return html.replace(PLACEHOLDER_RE, (_match, name: string) => resolveRandom(name, pool));
}
