'use client';

import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import '../../styles/pages/legacy.css';
import '../../styles/pages/component.css';
import '../../styles/pages/changelog.css';
import '../../styles/pages/tokens.css';
import '../../styles/pages/prose.css';
import '../../styles/pages/contrast-checker.css';
import '../../styles/pages/cursor-workflows.css';
import '../../styles/pages/design-language.css';

import { SgSkipLink } from '@/components/site/SgSkipLink';
import { SgShell, SgSidebarToggle } from '@/components/site/SgSidebar';
import { SgMain } from '@/components/site/SgMain';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteSidebar } from '@/components/site/SiteSidebar';
import { UdsVersionProvider } from '@/components/site/UdsVersionProvider';
import { ArchiveBanner } from '@/components/site/ArchiveBanner';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  return (
    <UdsVersionProvider>
      <SgSkipLink />
      <SiteHeader />
      <ArchiveBanner />
      <SgShell>
        <SiteSidebar mobileOpen={sidebarOpen} onMobileClose={closeSidebar} />
        <SgMain>{children}</SgMain>
      </SgShell>
      <SgSidebarToggle
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
    </UdsVersionProvider>
  );
}
