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
  mobileOpen,
  onMobileClose,
}: {
  children: ReactNode;
  ariaLabel?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  return (
    <>
      <div
        className="sg-sidebar-backdrop"
        data-visible={mobileOpen || undefined}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <nav
        className="sg-sidebar"
        aria-label={ariaLabel}
        data-mobile-open={mobileOpen || undefined}
      >
        {children}
      </nav>
    </>
  );
}

// ---------------------------------------------------------------------------
// SgSidebarToggle — floating button for mobile sidebar open/close
// ---------------------------------------------------------------------------

export function SgSidebarToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="sg-sidebar-toggle"
      aria-label={open ? 'Close navigation' : 'Open navigation'}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {open ? 'close' : 'menu'}
      </span>
    </button>
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
  variant?: 'getting-started';
  icon?: string;
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

  const content = (
    <>
      {icon ? (
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: 18 }}
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
