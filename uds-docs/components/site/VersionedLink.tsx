'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

import { useUdsVersion } from './UdsVersionProvider';
import { withUdsVersion } from './internal-href';

type LinkProps = ComponentProps<typeof Link>;

/**
 * Drop-in replacement for Next.js `<Link>` that preserves the `?uds=X.Y`
 * archive query param. Use this for any internal link on the doc site so
 * archive viewers don't silently drop back to the live release.
 */
export function VersionedLink({ href, ...rest }: LinkProps) {
  const { fetchVersion } = useUdsVersion();
  const versionedHref = withUdsVersion(String(href), fetchVersion);
  return <Link href={versionedHref} {...rest} />;
}
