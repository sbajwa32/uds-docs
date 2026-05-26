// Contrast Checker data — curated pairings, theme profiles, and matrix
// surface list. Direct port of the constants block in
// docs/modules/contrast-checker/index.js (lines 38–111 of the legacy
// module).
//
// Edits to the curated pairings or the matrix surface list belong here.
// The legacy single-file structure put data and view code side-by-side;
// the React port extracts the data so the React components stay focused
// on rendering.

import type { FgKind } from './color-math';

export type TokenKind = FgKind;

export const KIND_PREFIX: Record<TokenKind, string> = {
  surface: '--uds-color-surface-',
  text: '--uds-color-text-',
  icon: '--uds-color-icon-',
  border: '--uds-color-border-',
};

export const FG_KINDS: ReadonlyArray<Exclude<TokenKind, 'surface'>> = [
  'text',
  'icon',
  'border',
];

export const KIND_LABEL: Record<TokenKind, string> = {
  text: 'Text',
  icon: 'Icon',
  border: 'Border',
  surface: 'Surface',
};

export type ThemeProfileId =
  | 'base-light'
  | 'base-dark'
  | 'resman-light'
  | 'resman-dark'
  | 'anyonehome'
  | 'inhabit';

export interface ThemeProfile {
  id: ThemeProfileId;
  label: string;
  attrs: Record<string, string>;
}

// The 6 supported theme combinations — same set the Contrast Checker
// evaluates. Order matches the legacy strip.
export const THEME_PROFILES: ReadonlyArray<ThemeProfile> = [
  { id: 'base-light', label: 'Base · Light', attrs: {} },
  { id: 'base-dark', label: 'Base · Dark', attrs: { 'data-color-scheme': 'dark' } },
  { id: 'resman-light', label: 'ResMan · Light', attrs: { 'data-theme': 'resman' } },
  {
    id: 'resman-dark',
    label: 'ResMan · Dark',
    attrs: { 'data-color-scheme': 'dark', 'data-theme': 'resman' },
  },
  { id: 'anyonehome', label: 'AnyoneHome · Light', attrs: { 'data-theme': 'anyonehome' } },
  { id: 'inhabit', label: 'Inhabit · Light', attrs: { 'data-theme': 'inhabit' } },
];

export interface CuratedPairing {
  surface: string;
  text: string | null;
  icon: string | null;
  border: string | null;
  title: string;
}

// Curated semantic pairings — used by the "Common pairings" browse view.
// Each entry attaches the most semantically-appropriate text/icon/border
// foreground tokens to a single surface. Click any (surface, fg) cell to
// load that pair into Compare.
export const CURATED_PAIRINGS: ReadonlyArray<CuratedPairing> = [
  {
    surface: '--uds-color-surface-main',
    text: '--uds-color-text-primary',
    icon: '--uds-color-icon-primary',
    border: '--uds-color-border-primary',
    title: 'Body text on the page',
  },
  {
    surface: '--uds-color-surface-main',
    text: '--uds-color-text-secondary',
    icon: '--uds-color-icon-secondary',
    border: null,
    title: 'Secondary text',
  },
  {
    surface: '--uds-color-surface-main',
    text: '--uds-color-text-brand',
    icon: '--uds-color-icon-brand',
    border: '--uds-color-border-brand',
    title: 'Brand accent on main',
  },
  {
    surface: '--uds-color-surface-main',
    text: '--uds-color-text-interactive',
    icon: '--uds-color-icon-interactive',
    border: '--uds-color-border-interactive',
    title: 'Interactive (links, focus)',
  },
  {
    surface: '--uds-color-surface-main',
    text: null,
    icon: null,
    border: '--uds-color-border-outline-focus-visible',
    title: 'Focus-visible ring',
  },
  {
    surface: '--uds-color-surface-subtle',
    text: '--uds-color-text-primary',
    icon: '--uds-color-icon-primary',
    border: '--uds-color-border-secondary',
    title: 'Body on subtle surface',
  },
  {
    surface: '--uds-color-surface-alt',
    text: '--uds-color-text-primary',
    icon: '--uds-color-icon-primary',
    border: '--uds-color-border-secondary',
    title: 'Body on alt surface',
  },
  {
    surface: '--uds-color-surface-inverse',
    text: '--uds-color-text-inverse',
    icon: '--uds-color-icon-inverse',
    border: '--uds-color-border-inverse',
    title: 'Inverse pairing',
  },
  {
    surface: '--uds-color-surface-info-subtle',
    text: '--uds-color-text-info',
    icon: '--uds-color-icon-info',
    border: '--uds-color-border-info',
    title: 'Info banner (subtle)',
  },
  {
    surface: '--uds-color-surface-success-subtle',
    text: '--uds-color-text-success',
    icon: '--uds-color-icon-success',
    border: '--uds-color-border-success',
    title: 'Success banner (subtle)',
  },
  {
    surface: '--uds-color-surface-error-subtle',
    text: '--uds-color-text-error',
    icon: '--uds-color-icon-error',
    border: '--uds-color-border-error',
    title: 'Error banner (subtle)',
  },
  {
    surface: '--uds-color-surface-warning-subtle',
    text: '--uds-color-text-warning',
    icon: '--uds-color-icon-warning',
    border: '--uds-color-border-warning',
    title: 'Warning banner (subtle)',
  },
  {
    surface: '--uds-color-surface-info',
    text: '--uds-color-text-inverse',
    icon: '--uds-color-icon-inverse',
    border: null,
    title: 'Info — bold',
  },
  {
    surface: '--uds-color-surface-success',
    text: '--uds-color-text-inverse',
    icon: '--uds-color-icon-inverse',
    border: null,
    title: 'Success — bold',
  },
  {
    surface: '--uds-color-surface-error',
    text: '--uds-color-text-inverse',
    icon: '--uds-color-icon-inverse',
    border: null,
    title: 'Error — bold',
  },
  {
    surface: '--uds-color-surface-warning',
    text: '--uds-color-text-inverse',
    icon: '--uds-color-icon-inverse',
    border: null,
    title: 'Warning — bold',
  },
  {
    surface: '--uds-color-surface-interactive-default',
    text: '--uds-color-text-inverse',
    icon: '--uds-color-icon-inverse',
    border: null,
    title: 'Primary button label',
  },
  {
    surface: '--uds-color-surface-brand-dynamic-bold',
    text: '--uds-color-text-inverse',
    icon: '--uds-color-icon-inverse',
    border: null,
    title: 'Brand-bold (header)',
  },
];

// Surface tokens visible in the Full Matrix browse view. Picker still
// covers every surface — the matrix only includes "main" tokens so it
// stays glanceable.
export const MATRIX_SURFACES: ReadonlyArray<string> = [
  '--uds-color-surface-page-main',
  '--uds-color-surface-page-subtle',
  '--uds-color-surface-page-alt',
  '--uds-color-surface-page-bold',
  '--uds-color-surface-page-inverse',
  '--uds-color-surface-main',
  '--uds-color-surface-subtle',
  '--uds-color-surface-alt',
  '--uds-color-surface-bold',
  '--uds-color-surface-xbold',
  '--uds-color-surface-inverse',
  '--uds-color-surface-info',
  '--uds-color-surface-info-subtle',
  '--uds-color-surface-success',
  '--uds-color-surface-success-subtle',
  '--uds-color-surface-error',
  '--uds-color-surface-error-subtle',
  '--uds-color-surface-warning',
  '--uds-color-surface-warning-subtle',
  '--uds-color-surface-interactive-default',
  '--uds-color-surface-interactive-subtle',
  '--uds-color-surface-interactive-disabled',
  '--uds-color-surface-interactive-red',
  '--uds-color-surface-interactive-red-subtle',
  '--uds-color-surface-brand-dynamic-bold',
];
