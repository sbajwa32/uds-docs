// Main content area inside the shell. Provides the sticky-overflow + max-width
// behavior the legacy site has, and lands the `id="main-content"` target the
// SgSkipLink jumps to.

import '../../styles/site/main.css';

import type { ReactNode } from 'react';

export function SgMain({
  id = 'main-content',
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <main className="sg-main" id={id}>
      {children}
    </main>
  );
}
