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
// Behaviour matches the legacy site: no persistence, every refresh starts at
// defaults. Adding localStorage + a head-side inline script (to avoid the
// default-flash on non-default themes) is a separate enhancement.

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

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

export function UdsThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UdsThemeState>(DEFAULT_STATE);

  useEffect(() => {
    const html = document.documentElement;
    setOrRemoveAttr(html, 'data-color-scheme', state.colorScheme);
    setOrRemoveAttr(html, 'data-theme', state.theme);
    setOrRemoveAttr(html, 'data-font', state.font);
    setOrRemoveAttr(html, 'data-font-scale', state.fontScale);
    setOrRemoveAttr(html, 'data-density', state.density);
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
