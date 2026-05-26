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
  /**
   * False during the first render (when `?uds=` hasn't been read off
   * the URL yet — the provider has to defer that to a mount effect so
   * static-export SSR doesn't crash on `window`). Consumers that fetch
   * UDS data MUST gate on `ready === true` before firing, otherwise an
   * archive deep-link burns one fetch of the live payload before the
   * archive version resolves. See `ComponentPageClient` for the
   * canonical use.
   */
  ready: boolean;
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
  const [ready, setReady] = useState(false);

  // Mount once — read the URL param synchronously, then fetch the
  // versions manifest in parallel. `ready` flips true as soon as the URL
  // param is on the wire so consumers can stop deferring fetches. The
  // manifest's job is validation + dropdown content; if it never arrives
  // we still treat the provider as ready and let consumers fall back to
  // the URL value (caveat: an unknown version will surface as an
  // archive view until the manifest validates it). useLayoutEffect so
  // the state is committed before children's useEffects fetch.
  useEffect(() => {
    setActiveVersionState(readActiveVersionFromUrl());
    setReady(true);

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

  // When the URL param doesn't match a known archive, drop it. This
  // prevents `/button?uds=9.9` from looking like a real archive view
  // (banner says "UDS 9.9", dropdown says 0.3, data fetches all 404).
  // Runs after the manifest loads so the validation is real, not a
  // race against the initial mount fetch.
  useEffect(() => {
    if (!manifest) return;
    if (activeVersion === null) return;
    if (manifest.versions.includes(activeVersion)) return;
    setActiveVersionState(null);
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.delete('uds');
    const qs = params.toString();
    const url = pathname + (qs ? `?${qs}` : '');
    router.replace(url, { scroll: false });
  }, [manifest, activeVersion, pathname, router]);

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
      ready,
    }),
    [activeVersion, liveVersion, versions, setActiveVersion, isArchive, fetchVersion, ready],
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
