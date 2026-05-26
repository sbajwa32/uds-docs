// Left navigation chrome — sticky sidebar with section headings + links.
//
// SgSidebarLink supports `active` (current page) and `disabled` (non-clickable).
// The "getting started" variant is used for the prominent links at the top
// (AI Assist, Changelog, Getting Started) — bolder font + bottom-divider.
//
// Internal navigation uses Next's <Link> so route transitions are
// client-side. The theme provider + UDS-version provider live above the
// page boundary and stay mounted across navigation, which prevents the
// "switch sidebar entry → theme bar snaps back to Light / Base / Inter"
// reset the second review caught. Disabled links still render as plain
// <a aria-disabled="true"> since <Link> always navigates.

import '../../styles/site/sidebar.css';
import '../../styles/site/shell.css';

import Link from 'next/link';
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
  /** Id of an element that describes this link (passed through to aria-describedby). */
  ariaDescribedBy?: string;
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
    ariaDescribedBy,
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

  // Disabled links still render as a plain anchor — we never want a
  // disabled <Link> to silently navigate. Otherwise use Next's <Link>
  // for client-side route transitions that keep providers mounted.
  const content = (
    <>
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
    </>
  );

  if (disabled) {
    return (
      <a
        ref={ref}
        className={classes.join(' ')}
        href={href}
        aria-current={active ? 'page' : undefined}
        aria-disabled="true"
        aria-describedby={ariaDescribedBy}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      ref={ref}
      className={classes.join(' ')}
      href={href}
      aria-current={active ? 'page' : undefined}
      aria-describedby={ariaDescribedBy}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {content}
    </Link>
  );
});
