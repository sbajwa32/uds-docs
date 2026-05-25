'use client';

// Sidebar link with automatic active-state detection from the current pathname.
// Wraps the plain SgSidebarLink (Chunk 04) which is server-renderable; this
// thin client wrapper consults usePathname() to decide whether `.active`
// should be applied.
//
// Also routes the href through `withUdsVersion` so clicking a sidebar entry
// while viewing an archive snapshot keeps the user inside that archive
// instead of silently dropping `?uds=`.

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { SgSidebarLink } from './SgSidebar';
import { useUdsVersion } from './UdsVersionProvider';
import { withUdsVersion } from './internal-href';

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
  const { fetchVersion } = useUdsVersion();
  // Strict-equality match. The migration uses a flat URL space (`/button`,
  // `/changelog`, etc.) — no nested routes yet. When component pages get
  // sub-tab URLs in a later chunk, the comparison may need to widen to
  // `pathname === href || pathname.startsWith(href + '/')`.
  const active = pathname === href;
  const versionedHref = withUdsVersion(href, fetchVersion);

  return (
    <SgSidebarLink href={versionedHref} active={active} variant={variant} icon={icon}>
      {children}
    </SgSidebarLink>
  );
}
