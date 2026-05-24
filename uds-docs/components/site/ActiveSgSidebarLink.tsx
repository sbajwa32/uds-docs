'use client';

// Sidebar link with automatic active-state detection from the current pathname.
// Wraps the plain SgSidebarLink (Chunk 04) which is server-renderable; this
// thin client wrapper consults usePathname() to decide whether `.active`
// should be applied.

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { SgSidebarLink } from './SgSidebar';

export function ActiveSgSidebarLink({
  href,
  variant,
  icon,
  children,
}: {
  href: string;
  variant?: 'getting-started';
  icon?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Strict-equality match. The migration uses a flat URL space (`/button`,
  // `/changelog`, etc.) — no nested routes yet. When component pages get
  // sub-tab URLs in a later chunk, the comparison may need to widen to
  // `pathname === href || pathname.startsWith(href + '/')`.
  const active = pathname === href;

  return (
    <SgSidebarLink href={href} active={active} variant={variant} icon={icon}>
      {children}
    </SgSidebarLink>
  );
}
