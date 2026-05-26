import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { UdsThemeProvider } from '@/components/site/UdsThemeProvider';

import '../uds/uds.css';
import '../styles/site/base.css';

export const metadata: Metadata = {
  title: 'UDS — Urban Design System',
  description:
    'The Urban Design System (UDS) — design-to-engineering specification, components, tokens, and documentation.',
};

// Slim root layout — only what every route needs regardless of context:
// HTML scaffold, fonts, the global UDS stylesheet, the base reset, and the
// theme provider. The actual chrome (header / sidebar / main) lives in the
// (site) route group's layout. Dev-only routes (kit-sink) sit in (dev)
// without chrome.

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
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
