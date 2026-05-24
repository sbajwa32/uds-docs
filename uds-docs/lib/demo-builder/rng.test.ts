import { beforeEach, describe, expect, it } from 'vitest';

import {
  chance,
  fmtMoney,
  mulberry32,
  pick,
  pickN,
  randInt,
  reseedRandom,
  rnd,
} from './rng';

describe('mulberry32', () => {
  it('produces values in [0, 1)', () => {
    const next = mulberry32(123);
    for (let i = 0; i < 1000; i++) {
      const v = next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is fully deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 50; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces different streams for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const aValues = Array.from({ length: 10 }, () => a());
    const bValues = Array.from({ length: 10 }, () => b());
    expect(aValues).not.toEqual(bValues);
  });
});

describe('module-level RNG state', () => {
  beforeEach(() => {
    reseedRandom(42);
  });

  it('rnd() is deterministic after reseedRandom()', () => {
    const first = [rnd(), rnd(), rnd(), rnd()];
    reseedRandom(42);
    const second = [rnd(), rnd(), rnd(), rnd()];
    expect(first).toEqual(second);
  });

  it('pick() draws by index from the shared stream', () => {
    const arr = ['a', 'b', 'c', 'd', 'e', 'f'];
    const drawn = [pick(arr), pick(arr), pick(arr), pick(arr)];
    reseedRandom(42);
    const redrawn = [pick(arr), pick(arr), pick(arr), pick(arr)];
    expect(drawn).toEqual(redrawn);
  });

  it('pickN() returns up to n unique elements', () => {
    const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const drawn = pickN(arr, 3);
    expect(drawn).toHaveLength(3);
    expect(new Set(drawn).size).toBe(3);
  });

  it('pickN() respects array length cap', () => {
    const arr = ['a', 'b'];
    expect(pickN(arr, 10)).toHaveLength(2);
  });

  it('randInt() is inclusive on both bounds', () => {
    const values = new Set<number>();
    for (let i = 0; i < 200; i++) values.add(randInt(1, 5));
    expect([...values].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('chance(0) always returns false; chance(1) always returns true', () => {
    for (let i = 0; i < 50; i++) {
      expect(chance(0)).toBe(false);
      expect(chance(1)).toBe(true);
    }
  });
});

describe('fmtMoney', () => {
  it('formats with two decimals and a $ prefix', () => {
    expect(fmtMoney(0)).toBe('$0.00');
    expect(fmtMoney(5)).toBe('$5.00');
  });

  it('inserts thousands separators', () => {
    expect(fmtMoney(1500)).toBe('$1,500.00');
    expect(fmtMoney(1_234_567.89)).toBe('$1,234,567.89');
  });

  it('rounds to two decimals', () => {
    expect(fmtMoney(12.345)).toBe('$12.35');
  });
});
