// Color math for the Contrast Checker.
//
// Direct port of the pure-function block in
// docs/modules/contrast-checker/index.js (lines 113–199 of the legacy
// module — `parseRgb`, `srgbToLinear`, `luminance`, `contrastRatio`,
// `classifyVerdict`, `verdictLabel`, `verdictClass`, `formatRatio`,
// `isTransparent`, `isDisabledName`, `isNoneName`).
//
// No DOM access. Trivially unit-testable. The Contrast Checker is the
// primary consumer today; later chunks can also reuse the verdict logic
// without dragging the rest of the checker in.

export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type FgKind = 'text' | 'icon' | 'border' | 'surface';

export type Verdict = 'aaa' | 'aa' | 'aa-large' | 'fail' | 'na';

export function parseRgb(str: string | null | undefined): Rgb {
  const m = String(str ?? '').match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/i,
  );
  if (!m) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseFloat(m[1]),
    g: parseFloat(m[2]),
    b: parseFloat(m[3]),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

export function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function luminance({ r, g, b }: Rgb): number {
  return (
    0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
  );
}

export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

export function isTransparent(rgb: Rgb | null | undefined): boolean {
  return !rgb || rgb.a === 0;
}

export function isDisabledName(name: string): boolean {
  return /-disabled(\b|-)/.test(name);
}

export function isNoneName(name: string): boolean {
  return /-none(\b|$)/.test(name);
}

/**
 * Verdict band per WCAG. Returns one of:
 *   'aaa'      — text only, ratio ≥ 7
 *   'aa'       — passes the relevant AA threshold (text or non-text)
 *   'aa-large' — text only, [3, 4.5)
 *   'fail'     — below the relevant threshold
 */
export function classifyVerdict(ratio: number, fgKind: FgKind): Verdict {
  if (fgKind === 'text') {
    if (ratio >= 7) return 'aaa';
    if (ratio >= 4.5) return 'aa';
    if (ratio >= 3) return 'aa-large';
    return 'fail';
  }
  if (ratio >= 3) return 'aa';
  return 'fail';
}

export function verdictLabel(v: Verdict, _fgKind: FgKind): string {
  if (v === 'aaa') return 'AAA';
  if (v === 'aa') return 'AA';
  if (v === 'aa-large') return 'AA large only';
  if (v === 'na') return 'N/A';
  return 'Fail';
}

export function verdictBigLabel(status: Verdict, fgKind: FgKind): string {
  if (status === 'aaa') return 'Passes AAA';
  if (status === 'aa') return fgKind === 'text' ? 'Passes AA' : 'Passes AA · non-text';
  if (status === 'aa-large') return 'Passes AA · large text only';
  if (status === 'fail') return 'Fails';
  return 'N/A';
}

export function verdictExplanation(status: Verdict, fgKind: FgKind): string {
  if (fgKind === 'text') {
    if (status === 'aaa') return 'Meets WCAG 1.4.3 AAA (≥ 7:1).';
    if (status === 'aa') return 'Meets WCAG 1.4.3 AA for normal body text (≥ 4.5:1).';
    if (status === 'aa-large')
      return 'Meets WCAG 1.4.3 only for large text (≥ 3:1, < 4.5:1). Fails for normal body.';
    if (status === 'fail') return 'Below WCAG 1.4.3 — body text needs ≥ 4.5:1.';
  } else {
    if (status === 'aa') return 'Meets WCAG 1.4.11 Non-text Contrast (≥ 3:1).';
    if (status === 'fail') return 'Below WCAG 1.4.11 — UI elements need ≥ 3:1.';
  }
  return '';
}

export function verdictClass(v: Verdict): string {
  return `cc-verdict cc-verdict-${v}`;
}

export function formatRatio(r: number): string {
  if (!isFinite(r)) return '—';
  if (r >= 100) return r.toFixed(0) + ':1';
  if (r >= 10) return r.toFixed(1) + ':1';
  return r.toFixed(2) + ':1';
}
