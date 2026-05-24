import type { ReactNode } from 'react';

// Dev-only layout — no chrome. Used by the kit-sink page (and any future
// dev-aid routes) that wants to render its own self-contained chrome demo
// without being double-wrapped by the (site) shell.

export default function DevLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
