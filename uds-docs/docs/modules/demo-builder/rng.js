// docs/modules/demo-builder/rng.js
// Tiny seeded RNG so reseedRandom() makes a build deterministic within
// its own scope. We don't expose the seed to the user; it just means a
// build is internally consistent (same tenant in table = same balance).

let _rng = Math.random;

export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function reseedRandom(seed) {
  _rng = mulberry32(seed != null ? seed : (Date.now() ^ Math.floor(Math.random() * 1e9)));
}

export function rnd() { return _rng(); }
export function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
export function pickN(arr, n) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out.slice(0, Math.min(n, out.length));
}
export function randInt(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
export function chance(p) { return rnd() < p; }
export function fmtMoney(n) {
  const s = n.toFixed(2);
  return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
