import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { UdsThemeProvider } from '@/components/site/UdsThemeProvider';

// Global UDS stylesheet — primitives, semantic tokens, layers, text styles, and
// every component CSS that uds.css @imports. The whole design system payload
// is published into out/uds/ by the postbuild step (Chunk 01), so this @import
// resolves both at build time (Next bundles it) and at runtime (the bundled
// CSS references uds/components/<id>/<id>.css from the deployed origin).
import '../uds/uds.css';

export const metadata: Metadata = {
  title: 'UDS — Urban Design System',
  description:
    'The Urban Design System (UDS) — design-to-engineering specification, components, tokens, and documentation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UdsThemeProvider>{children}</UdsThemeProvider>
      </body>
    </html>
  );
}
