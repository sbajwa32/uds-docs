// Keyboard-only "Skip to main content" link.
// Hidden until focused (per WCAG 2.4.1).

import '../../styles/site/skip-link.css';

import type { ReactNode } from 'react';

export function SgSkipLink({
  href = '#main-content',
  children = 'Skip to main content',
}: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <a className="sg-skip-link" href={href}>
      {children}
    </a>
  );
}
