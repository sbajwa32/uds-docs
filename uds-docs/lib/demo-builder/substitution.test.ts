import { beforeEach, describe, expect, it } from 'vitest';

import { reseedRandom } from './rng';
import { applyRandomSubstitution } from './substitution';
import { RANDOM_POOL } from './data-pools';

describe('applyRandomSubstitution', () => {
  beforeEach(() => {
    reseedRandom(42);
  });

  it('replaces {{tenant}} with a tenant full name from the pool', () => {
    const out = applyRandomSubstitution('<p>{{tenant}}</p>');
    const m = out.match(/<p>(.*)<\/p>/);
    expect(m).not.toBeNull();
    const picked = m![1];
    expect(RANDOM_POOL.tenants).toContain(picked);
  });

  it('produces consistent output for the same seed', () => {
    const html = '<p>{{tenant}}</p><span>{{property}}</span><em>{{amount}}</em>';
    reseedRandom(99);
    const a = applyRandomSubstitution(html);
    reseedRandom(99);
    const b = applyRandomSubstitution(html);
    expect(a).toBe(b);
  });

  it('produces different output for different seeds', () => {
    const html =
      '<p>{{tenant}}</p><span>{{property}}</span><em>{{amount}}</em><b>{{leaseType}}</b>';
    reseedRandom(1);
    const a = applyRandomSubstitution(html);
    reseedRandom(2);
    const b = applyRandomSubstitution(html);
    expect(a).not.toBe(b);
  });

  it('resolves every documented placeholder name to a non-passthrough value', () => {
    const placeholders = [
      'tenant',
      'tenant.first',
      'tenant.last',
      'tenant.email',
      'property',
      'property.name',
      'status.label',
      'status.variant',
      'balance',
      'amount',
      'leaseType',
      'pageTitle',
      'brand',
      'date.relative',
      'id.short',
      'count.unread',
    ];
    for (const name of placeholders) {
      const out = applyRandomSubstitution(`{{${name}}}`);
      expect(out).not.toBe(`{{${name}}}`);
      expect(out.length).toBeGreaterThan(0);
    }
  });

  it('leaves unknown placeholders verbatim so missing tokens are visible', () => {
    expect(applyRandomSubstitution('{{this.does.not.exist}}')).toBe(
      '{{this.does.not.exist}}',
    );
  });

  it('formats {{balance}} and {{amount}} as a dollar string with thousands separator', () => {
    const out = applyRandomSubstitution('{{balance}}');
    expect(out).toMatch(/^\$\d{1,3}(,\d{3})*\.\d{2}$/);
  });

  it('formats {{id.short}} as #XXXX where XXXX is between 1000 and 9999', () => {
    const out = applyRandomSubstitution('{{id.short}}');
    const m = out.match(/^#(\d{4})$/);
    expect(m).not.toBeNull();
    const value = Number(m![1]);
    expect(value).toBeGreaterThanOrEqual(1000);
    expect(value).toBeLessThanOrEqual(9999);
  });

  it('formats {{date.relative}} as "N min ago"', () => {
    const out = applyRandomSubstitution('{{date.relative}}');
    expect(out).toMatch(/^\d+ min ago$/);
  });
});
