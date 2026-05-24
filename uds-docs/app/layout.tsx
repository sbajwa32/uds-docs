import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'UDS — Urban Design System',
  description:
    'The Urban Design System (UDS) — design-to-engineering specification, components, tokens, and documentation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
