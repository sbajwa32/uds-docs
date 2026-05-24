import { SgHeader, SgBrandBar, SgThemeBar } from './SgHeader';
import { TokenSearch } from './TokenSearch';

// Site-wide header for the Next.js shell. Composes the Chunk 04 chrome
// primitives and populates the SgBrandBar slots:
//
//   - searchTrigger   → <TokenSearch /> (Chunk 10) — owns both the trigger
//     button and the modal markup.
//   - versionDropdown → disabled <select> with the current UDS version as the
//     only option. Chunk 14 enables it and wires up the version-switching.
//   - demoButton      → omitted for now; Chunk 12b builds the real Demo Builder
//     trigger. The legacy site's construction-icon button is rebuilt in 12b.
//
// The build-label slot is intentionally left empty: the SITE-versioning
// apparatus is being deleted in Chunk 17 and there's no UDS-equivalent label
// that fits in the brand bar.

const CURRENT_UDS_VERSION = '0.3';

function VersionDropdownStub() {
  return (
    <select
      className="sg-version-select"
      aria-label="UDS version"
      disabled
      defaultValue={CURRENT_UDS_VERSION}
      title="Version switching wired in Chunk 14"
    >
      <option value={CURRENT_UDS_VERSION}>UDS {CURRENT_UDS_VERSION}</option>
    </select>
  );
}

export function SiteHeader() {
  return (
    <SgHeader>
      <SgBrandBar
        searchTrigger={<TokenSearch />}
        versionDropdown={<VersionDropdownStub />}
      />
      <SgThemeBar />
    </SgHeader>
  );
}
