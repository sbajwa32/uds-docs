'use client';

// UDS theme provider — stub. Populated in the next commit of Chunk 03.
//
// Will port the legacy theme switcher (setupGroup() in docs/app.js:23-46) into
// a React context that drives the same data-* attributes on <html>:
// data-color-scheme, data-theme, data-font, data-font-scale, data-density.

import type { ReactNode } from 'react';

export function UdsThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
