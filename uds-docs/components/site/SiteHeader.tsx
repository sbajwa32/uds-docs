import { SgHeader, SgBrandBar, SgThemeBar } from './SgHeader';
import { TokenSearch } from './TokenSearch';
import { DemoBuilder } from './DemoBuilder';
import { VersionDropdown } from './VersionDropdown';

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
//
// The build-label slot is intentionally left empty: the SITE-versioning
// apparatus is being deleted in Chunk 17 and there's no UDS-equivalent label
// that fits in the brand bar.

export function SiteHeader() {
  return (
    <SgHeader>
      <SgBrandBar
        demoButton={<DemoBuilder />}
        searchTrigger={<TokenSearch />}
        versionDropdown={<VersionDropdown />}
      />
      <SgThemeBar />
    </SgHeader>
  );
}
