'use client';

// Active UDS version context. Tracks `?uds=X.Y` in the URL and exposes
// the resolved version to consumers. Defaults to `null` (live) when the
// param is absent. Switching versions does NOT navigate — it updates the
// URL via `router.replace()` and lets the React tree re-render with the
// new fetcher arg.
//
// Constraint: `output: 'export'` is set in next.config.ts. Version
// routing must be client-side only. Specifically:
//   - No `[version]` route segment (would require generateStaticParams
//     enumerating versions — fine in principle but loses the
//     bookmark-friendly `?uds=` semantic).
//   - No Server Component consumes the version. Every fetcher lives in
//     `lib/uds-data.ts` (pure async) and gets its `version` arg from
//     `useUdsVersion()` inside its calling client component.
//
// Implementation note: reads the URL via `window.location.search`
// directly (in a mount effect) rather than `useSearchParams()`. That
// avoids the static-export Suspense-bailout requirement; the trade-off
// is a tiny first-paint flicker on archive deep-links (the URL has the
// param immediately, but our state hasn't read it yet) which is
// acceptable for a designer-facing tool.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { getVersions, type VersionsManifest } from '@/lib/uds-data';

export interface UdsVersionContextValue {
  /** Live (null) or archive version (e.g. "0.2"). */
  activeVersion: string | null;
  /** The version currently shipped as "live" (read from versions.json). */
  liveVersion: string;
  /** All versions known to versions.json (live + archives). */
  versions: string[];
  /** Switch the active version. `null` returns to live. */
  setActiveVersion: (version: string | null) => void;
  /** True when activeVersion is non-null and differs from liveVersion. */
  isArchive: boolean;
  /**
   * The version that should be passed into `lib/uds-data.ts` fetchers.
   * Equal to `activeVersion` for archive views, `undefined` for live.
   * Type matches the fetcher signature so consumers can spread it
   * directly.
   */
  fetchVersion: string | undefined;
}

const FALLBACK_LIVE_VERSION = '0.3';

const UdsVersionContext = createContext<UdsVersionContextValue | null>(null);

function readActiveVersionFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('uds');
}

export function UdsVersionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeVersion, setActiveVersionState] = useState<string | null>(null);
  const [manifest, setManifest] = useState<VersionsManifest | null>(null);

  // Mount once — read the URL param and the versions manifest.
  useEffect(() => {
    setActiveVersionState(readActiveVersionFromUrl());

    let cancelled = false;
    getVersions()
      .then((m) => {
        if (!cancelled) setManifest(m);
      })
      .catch(() => {
        // versions.json fetch failed — fall back to a single-version
        // shape so the dropdown still renders something sensible.
        if (!cancelled) {
          setManifest({
            latest: FALLBACK_LIVE_VERSION,
            versions: [FALLBACK_LIVE_VERSION],
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for back/forward navigations so the active version stays
  // synced with the URL.
  useEffect(() => {
    function onPop() {
      setActiveVersionState(readActiveVersionFromUrl());
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const liveVersion = manifest?.latest ?? FALLBACK_LIVE_VERSION;
  const versions = manifest?.versions ?? [liveVersion];

  const setActiveVersion = useCallback(
    (next: string | null) => {
      setActiveVersionState(next);
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      if (next && next !== liveVersion) {
        params.set('uds', next);
      } else {
        params.delete('uds');
      }
      const qs = params.toString();
      const url = pathname + (qs ? `?${qs}` : '');
      router.replace(url, { scroll: false });
    },
    [liveVersion, pathname, router],
  );

  const isArchive = activeVersion !== null && activeVersion !== liveVersion;
  const fetchVersion = isArchive ? activeVersion! : undefined;

  const value = useMemo<UdsVersionContextValue>(
    () => ({
      activeVersion,
      liveVersion,
      versions,
      setActiveVersion,
      isArchive,
      fetchVersion,
    }),
    [activeVersion, liveVersion, versions, setActiveVersion, isArchive, fetchVersion],
  );

  return <UdsVersionContext.Provider value={value}>{children}</UdsVersionContext.Provider>;
}

export function useUdsVersion(): UdsVersionContextValue {
  const ctx = useContext(UdsVersionContext);
  if (!ctx) {
    throw new Error('useUdsVersion must be used inside <UdsVersionProvider>');
  }
  return ctx;
}
