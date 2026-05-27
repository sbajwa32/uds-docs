// DOM utilities for resolving --uds-* tokens to actual RGB values, both
// in the active theme (single probe under <body>) and in each of the 6
// theme profiles (per-theme detached probes whose `data-*` attributes
// short-circuit the CSS attribute selectors that drive theming).
//
// Probes are lazily created on first use via
// `ensureLiveProbe()` / `ensureThemeProbes()`. Both are no-ops on the
// server.

import { isNoneName, isDisabledName, parseRgb, type Rgb } from './color-math';
import {
  KIND_PREFIX,
  THEME_PROFILES,
  type ThemeProfileId,
  type TokenKind,
} from './contrast-checker-data';

export interface Token {
  name: string;
  kind: TokenKind;
  isNone: boolean;
  isDisabled: boolean;
  rgb?: Rgb;
}

export interface TokenSet {
  surfaces: Token[];
  texts: Token[];
  icons: Token[];
  borders: Token[];
}

// ---------------------------------------------------------------------------
// Probes
// ---------------------------------------------------------------------------

let liveProbe: HTMLDivElement | null = null;
const themeProbes = new Map<ThemeProfileId, HTMLDivElement>();

function probeStyle(): string {
  return 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
}

function ensureLiveProbe(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;
  if (liveProbe && liveProbe.isConnected) return liveProbe;
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = probeStyle();
  document.body.appendChild(el);
  liveProbe = el;
  return el;
}

export function ensureThemeProbes(): void {
  if (typeof document === 'undefined') return;
  for (const profile of THEME_PROFILES) {
    const existing = themeProbes.get(profile.id);
    if (existing && existing.isConnected) continue;
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = probeStyle();
    for (const [k, v] of Object.entries(profile.attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    themeProbes.set(profile.id, el);
  }
}

/**
 * Tear down every probe element this module owns. Call from cleanup
 * effects when the Contrast Checker unmounts so detached probes don't
 * accumulate across navigations.
 */
export function disposeProbes(): void {
  if (liveProbe?.isConnected) liveProbe.remove();
  liveProbe = null;
  for (const el of themeProbes.values()) {
    if (el.isConnected) el.remove();
  }
  themeProbes.clear();
}

// ---------------------------------------------------------------------------
// Live (active-theme) resolution
// ---------------------------------------------------------------------------

const liveRgbCache = new Map<string, Rgb>();

export function resolveLiveRgb(tokenName: string): Rgb {
  const cached = liveRgbCache.get(tokenName);
  if (cached) return cached;
  const probe = ensureLiveProbe();
  if (!probe) return { r: 0, g: 0, b: 0, a: 1 };
  probe.style.backgroundColor = '';
  probe.style.backgroundColor = `var(${tokenName})`;
  const raw = getComputedStyle(probe).backgroundColor || '';
  const rgb = parseRgb(raw);
  liveRgbCache.set(tokenName, rgb);
  return rgb;
}

export function clearLiveRgbCache(): void {
  liveRgbCache.clear();
}

// ---------------------------------------------------------------------------
// Per-theme resolution
// ---------------------------------------------------------------------------

export function resolveTokenInTheme(profileId: ThemeProfileId, tokenName: string): Rgb {
  ensureThemeProbes();
  const probe = themeProbes.get(profileId);
  if (!probe) return { r: 0, g: 0, b: 0, a: 1 };
  probe.style.backgroundColor = '';
  probe.style.backgroundColor = `var(${tokenName})`;
  return parseRgb(getComputedStyle(probe).backgroundColor || '');
}

// ---------------------------------------------------------------------------
// Harvest + bulk-resolve
// ---------------------------------------------------------------------------

/**
 * Walks `getComputedStyle(document.documentElement)` and collects every
 * `--uds-color-{surface,text,icon,border}-*` token name. The walk is
 * order-stable and de-duplicates by name.
 */
export function harvestTokens(): TokenSet {
  if (typeof document === 'undefined') {
    return { surfaces: [], texts: [], icons: [], borders: [] };
  }
  const computed = getComputedStyle(document.documentElement);
  const buckets: Record<TokenKind, Token[]> = {
    surface: [],
    text: [],
    icon: [],
    border: [],
  };
  const seen = new Set<string>();
  for (let i = 0; i < computed.length; i++) {
    const name = computed[i];
    if (seen.has(name)) continue;
    if (!name.startsWith('--uds-color-')) continue;
    let kind: TokenKind | null = null;
    for (const k of Object.keys(KIND_PREFIX) as TokenKind[]) {
      if (name.startsWith(KIND_PREFIX[k])) {
        kind = k;
        break;
      }
    }
    if (!kind) continue;
    seen.add(name);
    buckets[kind].push({
      name,
      kind,
      isNone: isNoneName(name),
      isDisabled: isDisabledName(name),
    });
  }

  const sortFn = (a: Token, b: Token) => a.name.localeCompare(b.name);
  for (const k of Object.keys(buckets) as TokenKind[]) buckets[k].sort(sortFn);

  return {
    surfaces: buckets.surface,
    texts: buckets.text,
    icons: buckets.icon,
    borders: buckets.border,
  };
}

/**
 * Resolves every token's RGB value via the live probe. Mutates the input
 * tokens (sets `t.rgb`). Clears the live cache first so re-resolves after a
 * theme change pick up the
 * new values.
 */
export function resolveAllTokens(tokens: TokenSet): void {
  clearLiveRgbCache();
  const all = [...tokens.surfaces, ...tokens.texts, ...tokens.icons, ...tokens.borders];
  for (const t of all) t.rgb = resolveLiveRgb(t.name);
}

export function tokenLookup(tokens: TokenSet): Record<string, Token> {
  const map: Record<string, Token> = Object.create(null);
  for (const k of ['surfaces', 'texts', 'icons', 'borders'] as const) {
    for (const t of tokens[k]) map[t.name] = t;
  }
  return map;
}

export function shortName(tokenName: string): string {
  return tokenName.replace('--uds-color-', '');
}
