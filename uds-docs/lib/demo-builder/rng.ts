// Seeded RNG for Demo Builder. Direct port of docs/modules/demo-builder/rng.js.
//
// Why a custom RNG instead of Math.random? The Demo Builder's "rebuild"
// button should be deterministic within a single build — the same tenant
// who appears in the table row also has the same balance shown in their
// detail tooltip, the same notification mentions the same person, etc.
// A reseed-able PRNG (mulberry32) makes that easy: reseed once at the
// top of a build, and every downstream `pick()` / `randInt()` consumes
// from the same stream.
//
// Singleton state — the module-level `_rng` reference is shared by every
// caller. Tests must call `reseedRandom(<seed>)` first so they're not
// affected by what previous tests did.

let _rng: () => number = Math.random;

export function mulberry32(seedArg: number): () => number {
  let a = seedArg;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function reseedRandom(seed?: number): void {
  _rng =
    seed != null
      ? mulberry32(seed)
      : mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) | 0);
}

export function rnd(): number {
  return _rng();
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(_rng() * arr.length)];
}

export function pickN<T>(arr: T[], n: number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(_rng() * (i + 1));
    const t = out[i];
    out[i] = out[j];
    out[j] = t;
  }
  return out.slice(0, Math.min(n, out.length));
}

export function randInt(min: number, max: number): number {
  return Math.floor(_rng() * (max - min + 1)) + min;
}

export function chance(p: number): boolean {
  return _rng() < p;
}

export function fmtMoney(n: number): string {
  const s = n.toFixed(2);
  return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
