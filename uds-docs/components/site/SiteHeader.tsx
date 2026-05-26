'use client';

import { useState } from 'react';
import { SgHeader, SgBrandBar, SgThemeBar, SgThemeToggle } from './SgHeader';
import { TokenSearch } from './TokenSearch';
import { DemoBuilder } from './DemoBuilder';
import { VersionDropdown } from './VersionDropdown';
import { SITE_CHANGELOG } from '@/data/site-changelog';

const latestSiteChange = SITE_CHANGELOG[SITE_CHANGELOG.length - 1];
const SITE_BUILD_LABEL = latestSiteChange?.version ?? 'SITE';

export function SiteHeader() {
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <SgHeader>
      <SgBrandBar
        demoButton={<DemoBuilder />}
        searchTrigger={<TokenSearch />}
        versionDropdown={<VersionDropdown />}
        themeToggle={
          <SgThemeToggle
            open={themeOpen}
            onToggle={() => setThemeOpen((prev) => !prev)}
          />
        }
        buildLabel={SITE_BUILD_LABEL}
      />
      <SgThemeBar open={themeOpen} />
    </SgHeader>
  );
}
