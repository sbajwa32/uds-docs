'use client';

// Header chrome — sticky top bar with brand bar (top row) and theme bar (bottom row).
//
// SgBrandBar takes slots (children-as-named-props) for the controls it doesn't
// own internally — Build Demo button, Search trigger, Version dropdown — so
// later chunks can drop in real implementations without changing this file.
//
// SgThemeBar is wired directly to UdsThemeProvider (Chunk 03) — it owns the
// real theme controls; no slots needed.

import '../../styles/site/header.css';
import '../../styles/site/theme-bar.css';

import type { ReactNode } from 'react';
import {
  useUdsTheme,
  type ColorScheme,
  type Theme,
  type Font,
  type FontScale,
  type Density,
} from './UdsThemeProvider';

// ---------------------------------------------------------------------------
// SgHeader
// ---------------------------------------------------------------------------

export function SgHeader({ children }: { children: ReactNode }) {
  return <header className="sg-header">{children}</header>;
}

// ---------------------------------------------------------------------------
// SgBrandBar
// ---------------------------------------------------------------------------

export function SgBrandBar({
  title = 'UDS',
  subtitle = 'Urban Design System',
  buildLabel,
  demoButton,
  searchTrigger,
  versionDropdown,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned build version badge, e.g. "SITE 2026.05.24.1". */
  buildLabel?: ReactNode;
  /** Build Demo trigger — populated by Chunk 12b. */
  demoButton?: ReactNode;
  /** Token search trigger — populated by Chunk 10. */
  searchTrigger?: ReactNode;
  /** Version dropdown — populated by Chunk 14. */
  versionDropdown?: ReactNode;
}) {
  return (
    <div className="sg-brand-bar">
      <span className="sg-brand-bar-title">{title}</span>
      <span className="sg-brand-bar-subtitle">{subtitle}</span>
      {demoButton}
      {searchTrigger}
      {versionDropdown}
      {buildLabel ? <span className="sg-brand-bar-build">{buildLabel}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SgThemeBar
// ---------------------------------------------------------------------------

export function SgThemeBar() {
  const t = useUdsTheme();

  return (
    <div className="sg-theme-bar">
      <ThemeGroup label="Color">
        <ThemeButton active={t.colorScheme === ''} onClick={() => t.setColorScheme('')}>
          Light
        </ThemeButton>
        <ThemeButton active={t.colorScheme === 'dark'} onClick={() => t.setColorScheme('dark')}>
          Dark
        </ThemeButton>
      </ThemeGroup>

      <ThemeGroup label="Brand">
        {(['', 'resman', 'anyonehome', 'inhabit'] as Theme[]).map((value) => (
          <ThemeButton
            key={value || 'base'}
            active={t.theme === value}
            onClick={() => t.setTheme(value)}
          >
            {value === '' ? 'Base' : labelize(value)}
          </ThemeButton>
        ))}
      </ThemeGroup>

      <ThemeGroup label="Font">
        {(['', 'poppins', 'roboto', 'lexend'] as Font[]).map((value) => (
          <ThemeButton
            key={value || 'inter'}
            active={t.font === value}
            onClick={() => t.setFont(value)}
          >
            {value === '' ? 'Inter' : labelize(value)}
          </ThemeButton>
        ))}
      </ThemeGroup>

      <ThemeGroup label="Scale">
        {(['smaller', '', 'larger'] as FontScale[]).map((value) => (
          <ThemeButton
            key={value || 'default'}
            active={t.fontScale === value}
            onClick={() => t.setFontScale(value)}
          >
            {value === '' ? 'Default' : labelize(value)}
          </ThemeButton>
        ))}
      </ThemeGroup>

      <ThemeGroup label="Density">
        {(['', 'comfortable'] as Density[]).map((value) => (
          <ThemeButton
            key={value || 'default'}
            active={t.density === value}
            onClick={() => t.setDensity(value)}
          >
            {value === '' ? 'Default' : labelize(value)}
          </ThemeButton>
        ))}
      </ThemeGroup>
    </div>
  );
}

function ThemeGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sg-theme-group">
      <span className="sg-theme-bar-label">{label}</span>
      {children}
    </div>
  );
}

function ThemeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={active ? 'udc-button-primary active' : 'udc-button-secondary'}
      data-size="sm"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function labelize(value: string): string {
  // 'anyonehome' -> 'AnyoneHome', 'resman' -> 'ResMan', 'larger' -> 'Larger'.
  // Verbatim from legacy markup labels.
  switch (value) {
    case 'anyonehome':
      return 'AnyoneHome';
    case 'resman':
      return 'ResMan';
    case 'inhabit':
      return 'Inhabit';
    case 'poppins':
      return 'Poppins';
    case 'roboto':
      return 'Roboto';
    case 'lexend':
      return 'Lexend';
    case 'smaller':
      return 'Smaller';
    case 'larger':
      return 'Larger';
    case 'comfortable':
      return 'Comfortable';
    default:
      return value;
  }
}

// Suppress unused-import warning on ColorScheme (kept for API symmetry / future expansion).
export type { ColorScheme };
