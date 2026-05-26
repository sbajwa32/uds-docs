import { SgHeader, SgBrandBar, SgThemeBar } from './SgHeader';
import { TokenSearch } from './TokenSearch';
import { DemoBuilder } from './DemoBuilder';
import { VersionDropdown } from './VersionDropdown';
import { SITE_CHANGELOG } from '@/data/site-changelog';

// Site-wide header for the Next.js shell. Composes the Chunk 04 chrome
// primitives and populates the SgBrandBar slots:
//
//   - demoButton      → <DemoBuilder /> (Chunk 12b) — owns the construction-
//     icon button, the dialog, the preview overlay, and the localStorage
//     history.
//   - searchTrigger   → <TokenSearch /> (Chunk 10) — owns both the trigger
//     button and the modal markup.
//   - versionDropdown → <VersionDropdown /> (Chunk 14) — populates from
//     versions.json, switching versions updates `?uds=` client-side.

const latestSiteChange = SITE_CHANGELOG[SITE_CHANGELOG.length - 1];
const SITE_BUILD_LABEL = latestSiteChange?.version ?? 'SITE';

export function SiteHeader() {
  return (
    <SgHeader>
      <SgBrandBar
        demoButton={<DemoBuilder />}
        searchTrigger={<TokenSearch />}
        versionDropdown={<VersionDropdown />}
        buildLabel={SITE_BUILD_LABEL}
      />
      <SgThemeBar />
    </SgHeader>
  );
}
