import type { ReactNode } from 'react';

import { SgSkipLink } from '@/components/site/SgSkipLink';
import { SgShell } from '@/components/site/SgSidebar';
import { SgMain } from '@/components/site/SgMain';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteSidebar } from '@/components/site/SiteSidebar';

// Site-shell layout — chrome that wraps every public-facing docs page.
// Dev-only pages (e.g. /dev/kit) live under (dev) and bypass this chrome.

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SgSkipLink />
      <SiteHeader />
      <SgShell>
        <SiteSidebar />
        <SgMain>{children}</SgMain>
      </SgShell>
    </>
  );
}
