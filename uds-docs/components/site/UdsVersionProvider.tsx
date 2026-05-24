'use client';

// Active UDS version context. Reads `?uds=X.Y` from the URL on every
// render and exposes it as `activeVersion` to consumers. Defaults to
// `null` (live) when the param is absent.
//
// Constraint: this site builds with `output: 'export'`. No server-side
// routing is allowed for the version axis — switching versions must be
// a client-side URL change that re-fires data fetches.
//
// `setActiveVersion(v)` updates `?uds=` via `router.replace()` so the
// URL is bookmark-able. `null` removes the param.
//
// Chunk 14 stub — full implementation lands in step 2.

import { createContext, useContext, type ReactNode } from 'react';

export interface UdsVersionContextValue {
  /** Live (null) or archive version (e.g. "0.2"). */
  activeVersion: string | null;
  /** The version reported by the live payload — defaults to '0.3' until step 2 wires the manifest fetch. */
  liveVersion: string;
  /** Available archive + live versions, ready for the dropdown UI. */
  versions: string[];
  /** Switch the active version. `null` returns to live. */
  setActiveVersion: (version: string | null) => void;
  /** True when activeVersion is non-null and differs from liveVersion. */
  isArchive: boolean;
}

const UdsVersionContext = createContext<UdsVersionContextValue | null>(null);

export function UdsVersionProvider({ children }: { children: ReactNode }) {
  const value: UdsVersionContextValue = {
    activeVersion: null,
    liveVersion: '0.3',
    versions: ['0.3', '0.2'],
    setActiveVersion: () => {
      // Wired up in step 2.
    },
    isArchive: false,
  };
  return <UdsVersionContext.Provider value={value}>{children}</UdsVersionContext.Provider>;
}

export function useUdsVersion(): UdsVersionContextValue {
  const ctx = useContext(UdsVersionContext);
  if (!ctx) {
    throw new Error('useUdsVersion must be used inside <UdsVersionProvider>');
  }
  return ctx;
}
