import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { UdsThemeProvider } from '@/components/site/UdsThemeProvider';

// Global UDS stylesheet — primitives, semantic tokens, layers, text styles, and
// every component CSS that uds.css @imports. The whole design system payload
// is published into out/uds/ by the postbuild step (Chunk 01), so this @import
// resolves both at build time (Next bundles it) and at runtime (the bundled
// CSS references uds/components/<id>/<id>.css from the deployed origin).
import '../uds/uds.css';
import '../styles/site/base.css';

export const metadata: Metadata = {
  title: 'UDS — Urban Design System',
  description:
    'The Urban Design System (UDS) — design-to-engineering specification, components, tokens, and documentation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* UDS-defined fonts. Loaded via plain <link> tags rather than next/font
            because Material Symbols isn't in next/font's catalog and we want
            consistency in how all five fonts arrive. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lexend:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>
        <UdsThemeProvider>{children}</UdsThemeProvider>
      </body>
    </html>
  );
}
