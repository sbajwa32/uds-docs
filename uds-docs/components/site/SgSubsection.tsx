// Content section primitives — used to break up tab panels into smaller
// content groups (e.g. "Import" / "CSS Classes" / "Data Attributes" within a
// component's Code tab).

import '../../styles/site/page-chrome.css';

import type { ReactNode } from 'react';

export function SgSubsection({ children }: { children: ReactNode }) {
  return <section className="sg-subsection">{children}</section>;
}

export function SgSubsectionTitle({
  children,
  level = 3,
}: {
  children: ReactNode;
  /** HTML heading level — defaults to <h3>, matches legacy markup. */
  level?: 2 | 3 | 4;
}) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
  return <Tag className="sg-subsection-title">{children}</Tag>;
}

export function SgSubsectionDesc({ children }: { children: ReactNode }) {
  return <p className="sg-subsection-desc">{children}</p>;
}
