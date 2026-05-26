'use client';

import '../../styles/site/header.css';
import '../../styles/site/theme-bar.css';

import { useState, type ReactNode } from 'react';
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
  themeToggle,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  buildLabel?: ReactNode;
  demoButton?: ReactNode;
  searchTrigger?: ReactNode;
  versionDropdown?: ReactNode;
  themeToggle?: ReactNode;
}) {
  return (
    <div className="sg-brand-bar">
      <span className="sg-brand-bar-title">{title}</span>
      <span className="sg-brand-bar-subtitle">{subtitle}</span>
      {demoButton}
      {searchTrigger}
      {versionDropdown}
      {themeToggle}
      {buildLabel ? <span className="sg-brand-bar-build">{buildLabel}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SgThemeBar — collapsible appearance controls
// ---------------------------------------------------------------------------

export function SgThemeBar({ open }: { open: boolean }) {
  const t = useUdsTheme();

  return (
    <div className="sg-theme-bar-wrapper" data-open={open}>
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// SgThemeToggle — gear icon button that controls the collapsible theme bar
// ---------------------------------------------------------------------------

export function SgThemeToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="sg-theme-toggle-btn"
      aria-label={open ? 'Close appearance settings' : 'Open appearance settings'}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        settings
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

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
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function labelize(value: string): string {
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

export type { ColorScheme };
