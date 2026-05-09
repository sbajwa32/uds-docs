// docs/modules/demo-builder/substitution.js
// Token placeholder resolver.
//
// Replaces every {{placeholder}} in an example HTML string with a value
// from a pool. Used by:
//   - docs page Examples tab (canonical pool — fixed values)
//   - Demo Builder previews (random pool — varied per build)
//
// Wired up by Phase 7 when DEMO_TEMPLATES is deleted and the Demo Builder
// starts fetching uds/components/<id>/examples/*.html directly. Stubbed
// here so Phase 4 has the file in place.

import { rnd, pick, randInt, fmtMoney } from './rng.js';

const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

/**
 * resolvePlaceholder(name, pool) — given a placeholder name like
 * 'tenant.first' and a pool, return the resolved string. Returns the
 * literal `{{name}}` if the placeholder cannot be resolved (so debug is
 * obvious in the browser).
 */
function resolvePlaceholder(name, pool) {
  switch (name) {
    case 'tenant':         return pick(pool.tenantRecords).full;
    case 'tenant.first':   return pick(pool.tenantRecords).first;
    case 'tenant.last':    return pick(pool.tenantRecords).last;
    case 'tenant.email':   return pick(pool.tenantRecords).email;
    case 'property':
    case 'property.name':  return pick(pool.propertyRecords).name;
    case 'status.label':   return pick(pool.statusRecords).label;
    case 'status.variant': return pick(pool.statusRecords).variant;
    case 'balance':
    case 'amount':         return fmtMoney(randInt(0, 6500));
    case 'leaseType':      return pick(pool.leaseTypes);
    case 'pageTitle':      return pick(pool.pageTitles);
    case 'brand':          return pick(['Boardroom', 'Tenant360', 'PropertyOS', 'LeasePro', 'Holdings']);
    case 'date.relative':  return randInt(1, 23) + ' min ago';
    case 'id.short':       return '#' + randInt(1000, 9999);
    case 'count.unread':   return String(randInt(0, 15));
    default: return '{{' + name + '}}';
  }
}

/**
 * applyTokenSubstitution(html, pool) — walks every {{...}} occurrence in
 * the HTML and substitutes resolved values from the pool.
 */
export function applyTokenSubstitution(html, pool) {
  return html.replace(PLACEHOLDER_RE, (_, name) => resolvePlaceholder(name, pool));
}
