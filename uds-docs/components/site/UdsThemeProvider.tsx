'use client';

// React port of the legacy theme switcher (setupGroup() in docs/app.js:23-46).
// Drives the same five data-* attributes on <html> that the UDS CSS reads:
// data-color-scheme, data-theme, data-font, data-font-scale, data-density.
//
// Vocabulary per dimension (empty string == default; the attribute is removed
// from <html> so the CSS falls through to its base rule):
//   colorScheme: '' (light) | 'dark'
//   theme:       '' (Base) | 'resman' | 'anyonehome' | 'inhabit'
//   font:        '' (Inter) | 'poppins' | 'roboto' | 'lexend'
//   fontScale:   '' (default) | 'smaller' | 'larger'
//   density:     '' (default) | 'comfortable'
//
// State is persisted to localStorage so refreshes + new tabs keep the
// reader's appearance choices. A small <script> in <head> (see
// app/layout.tsx) reads the same key BEFORE React hydrates and sets the
// data-* attributes on <html> directly — that prevents the default-theme
// flash on archive deep-links or hard reloads. The script schema matches
// THEME_STORAGE_SCHEMA below.

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * localStorage key for the persisted theme state. Read both by this
 * provider and by the inline head-bootstrap script in `app/layout.tsx`.
 * If you rename, update both — the audit-baseline doesn't catch this
 * (yet).
 */
export const THEME_STORAGE_KEY = 'uds-docs-appearance';


/**
 * Head-bootstrap script source. Exported so `app/layout.tsx` can inject
 * it verbatim and so a Vitest test can assert it stays in sync with the
 * provider's read/write logic.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){
  try {
    var raw = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (!raw) return;
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    var html = document.documentElement;
    var pairs = [
      ['colorScheme', 'data-color-scheme'],
      ['theme', 'data-theme'],
      ['font', 'data-font'],
      ['fontScale', 'data-font-scale'],
      ['density', 'data-density'],
    ];
    for (var i = 0; i < pairs.length; i++) {
      var v = parsed[pairs[i][0]];
      if (typeof v === 'string' && v.length > 0) {
        html.setAttribute(pairs[i][1], v);
      }
    }
  } catch (e) { /* corrupt storage — fall through to defaults */ }
})();`;

export type ColorScheme = '' | 'dark';
export type Theme = '' | 'resman' | 'anyonehome' | 'inhabit';
export type Font = '' | 'poppins' | 'roboto' | 'lexend';
export type FontScale = '' | 'smaller' | 'larger';
export type Density = '' | 'comfortable';

export interface UdsThemeState {
  colorScheme: ColorScheme;
  theme: Theme;
  font: Font;
  fontScale: FontScale;
  density: Density;
}

export interface UdsThemeContextValue extends UdsThemeState {
  setColorScheme: (v: ColorScheme) => void;
  setTheme: (v: Theme) => void;
  setFont: (v: Font) => void;
  setFontScale: (v: FontScale) => void;
  setDensity: (v: Density) => void;
  /** Set multiple dimensions at once. Useful for "preset" buttons. */
  setThemeState: (patch: Partial<UdsThemeState>) => void;
}

const DEFAULT_STATE: UdsThemeState = {
  colorScheme: '',
  theme: '',
  font: '',
  fontScale: '',
  density: '',
};

const UdsThemeContext = createContext<UdsThemeContextValue | null>(null);

function setOrRemoveAttr(el: HTMLElement, name: string, value: string) {
  if (value) el.setAttribute(name, value);
  else el.removeAttribute(name);
}

function readStoredState(): UdsThemeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UdsThemeState>;
    if (!parsed || typeof parsed !== 'object') return null;
    // Pull each field separately so TypeScript narrows the literal-union
    // value type per key. A generic loop over `KEYS` would widen each
    // assignment to "any string" and fail strict typing.
    return {
      colorScheme: (parsed.colorScheme ?? DEFAULT_STATE.colorScheme) as ColorScheme,
      theme: (parsed.theme ?? DEFAULT_STATE.theme) as Theme,
      font: (parsed.font ?? DEFAULT_STATE.font) as Font,
      fontScale: (parsed.fontScale ?? DEFAULT_STATE.fontScale) as FontScale,
      density: (parsed.density ?? DEFAULT_STATE.density) as Density,
    };
  } catch {
    return null;
  }
}

function writeStoredState(state: UdsThemeState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / private-mode failures are silently ignored; in-memory state
    // still works, just doesn't persist.
  }
}

export function UdsThemeProvider({ children }: { children: ReactNode }) {
  // Initial state is DEFAULT_STATE for SSR (so server-rendered HTML
  // matches what the client first renders). The mount effect below
  // rehydrates from localStorage if present. The head bootstrap script
  // (THEME_BOOTSTRAP_SCRIPT, wired in app/layout.tsx) sets the data-*
  // attributes earlier so the user doesn't see a default-theme flash
  // between paint and hydrate.
  const [state, setState] = useState<UdsThemeState>(DEFAULT_STATE);

  useEffect(() => {
    const stored = readStoredState();
    if (stored) setState(stored);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    setOrRemoveAttr(html, 'data-color-scheme', state.colorScheme);
    setOrRemoveAttr(html, 'data-theme', state.theme);
    setOrRemoveAttr(html, 'data-font', state.font);
    setOrRemoveAttr(html, 'data-font-scale', state.fontScale);
    setOrRemoveAttr(html, 'data-density', state.density);
    writeStoredState(state);
  }, [state]);

  const value: UdsThemeContextValue = {
    ...state,
    setColorScheme: (v) => setState((s) => ({ ...s, colorScheme: v })),
    setTheme: (v) => setState((s) => ({ ...s, theme: v })),
    setFont: (v) => setState((s) => ({ ...s, font: v })),
    setFontScale: (v) => setState((s) => ({ ...s, fontScale: v })),
    setDensity: (v) => setState((s) => ({ ...s, density: v })),
    setThemeState: (patch) => setState((s) => ({ ...s, ...patch })),
  };

  return <UdsThemeContext.Provider value={value}>{children}</UdsThemeContext.Provider>;
}

export function useUdsTheme(): UdsThemeContextValue {
  const ctx = useContext(UdsThemeContext);
  if (!ctx) {
    throw new Error('useUdsTheme must be used inside <UdsThemeProvider>');
  }
  return ctx;
}
