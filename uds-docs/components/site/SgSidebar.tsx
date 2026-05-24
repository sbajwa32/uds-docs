// Left navigation chrome — sticky sidebar with section headings + links.
//
// SgSidebarLink supports `active` (current page) and `disabled` (non-clickable).
// The "getting started" variant is used for the prominent links at the top
// (AI Assist, Changelog, Getting Started) — bolder font + bottom-divider.

import '../../styles/site/sidebar.css';
import '../../styles/site/shell.css';

import { forwardRef } from 'react';
import type { FocusEventHandler, MouseEventHandler, ReactNode } from 'react';

// ---------------------------------------------------------------------------
// SgShell — top-level shell layout (sidebar + main split).
// ---------------------------------------------------------------------------

export function SgShell({ children }: { children: ReactNode }) {
  return <div className="sg-shell">{children}</div>;
}

// ---------------------------------------------------------------------------
// SgSidebar
// ---------------------------------------------------------------------------

export function SgSidebar({
  children,
  ariaLabel = 'Site navigation',
}: {
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <nav className="sg-sidebar" aria-label={ariaLabel}>
      {children}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// SgSidebarHeading
// ---------------------------------------------------------------------------

export function SgSidebarHeading({ children }: { children: ReactNode }) {
  return <span className="sg-sidebar-heading">{children}</span>;
}

// ---------------------------------------------------------------------------
// SgSidebarLink
// ---------------------------------------------------------------------------

export const SgSidebarLink = forwardRef<HTMLAnchorElement, {
  href: string;
  active?: boolean;
  disabled?: boolean;
  /** 'getting-started' renders the prominent top-of-sidebar variant. */
  variant?: 'getting-started';
  /** Optional Material Symbol icon (only shown for the 'getting-started' variant in legacy markup). */
  icon?: string;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
  onBlur?: FocusEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}>(function SgSidebarLink(
  {
    href,
    active = false,
    disabled = false,
    variant,
    icon,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    children,
  },
  ref,
) {
  const classes = ['sg-sidebar-link'];
  if (variant === 'getting-started') classes.push('sg-sidebar-link--getting-started');
  if (active) classes.push('active');
  if (disabled) classes.push('disabled');

  return (
    <a
      ref={ref}
      className={classes.join(' ')}
      href={href}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {icon ? (
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: 18, verticalAlign: -3, marginRight: 6 }}
        >
          {icon}
        </span>
      ) : null}
      {children}
    </a>
  );
});
