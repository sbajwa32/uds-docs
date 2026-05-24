'use client';

// Site chrome kit-sink — renders every chrome primitive in approximated
// context for visual QA. Permanent (kept past cutover); useful when later
// chunks add new chrome or tweak existing chrome.
//
// Not linked from the public site nav. Reach via /_dev/kit.

import { useState } from 'react';

import { SgSkipLink } from '@/components/site/SgSkipLink';
import { SgHeader, SgBrandBar, SgThemeBar } from '@/components/site/SgHeader';
import {
  SgShell,
  SgSidebar,
  SgSidebarHeading,
  SgSidebarLink,
} from '@/components/site/SgSidebar';
import { SgMain } from '@/components/site/SgMain';
import {
  SgPageTitle,
  SgPageDesc,
  SgPageTabs,
  SgPageTab,
} from '@/components/site/SgPageHeader';
import {
  SgSubsection,
  SgSubsectionTitle,
  SgSubsectionDesc,
} from '@/components/site/SgSubsection';

const SITE_BUILD_LABEL = 'SITE 2026.05.24.kit';

const COMPONENT_TABS = [
  { value: 'examples', label: 'Examples' },
  { value: 'code', label: 'Code' },
  { value: 'guidelines', label: 'Guidelines' },
  { value: 'changelog', label: 'Changelog' },
  { value: 'playground', label: 'Playground' },
];

export default function KitSinkPage() {
  const [activeTab, setActiveTab] = useState<string>('examples');

  // Inert stubs so the chrome's slots are visible without depending on later
  // chunks (10/12b/14). The button + select are non-functional.
  const demoButton = (
    <button type="button" className="sg-demo-btn" aria-label="Build Demo (stub — Chunk 12b)">
      <span className="material-symbols-outlined">construction</span>
    </button>
  );

  const searchTrigger = (
    <button
      type="button"
      className="sg-header-search-trigger"
      aria-label="Search tokens (stub — Chunk 10)"
      aria-haspopup="dialog"
      disabled
    >
      <span className="material-symbols-outlined sg-header-search-trigger__icon">search</span>
      <span className="sg-header-search-trigger__placeholder">Search tokens...</span>
      <span className="sg-header-search-trigger__kbds">
        <kbd>/</kbd>
        <kbd>⌘K</kbd>
      </span>
    </button>
  );

  const versionDropdown = (
    <select
      className="sg-version-select"
      aria-label="UDS version (stub — Chunk 14)"
      disabled
      defaultValue="0.3"
    >
      <option value="0.3">UDS 0.3 (current)</option>
    </select>
  );

  return (
    <>
      <SgSkipLink />

      <SgHeader>
        <SgBrandBar
          buildLabel={SITE_BUILD_LABEL}
          demoButton={demoButton}
          searchTrigger={searchTrigger}
          versionDropdown={versionDropdown}
        />
        <SgThemeBar />
      </SgHeader>

      <SgShell>
        <SgSidebar>
          <SgSidebarLink href="#" variant="getting-started" icon="smart_toy">
            AI Assist
          </SgSidebarLink>
          <SgSidebarLink href="#" variant="getting-started" icon="history">
            Changelog
          </SgSidebarLink>
          <SgSidebarLink href="#" variant="getting-started" icon="download">
            Getting Started
          </SgSidebarLink>

          <SgSidebarHeading>Foundations</SgSidebarHeading>
          <SgSidebarLink href="#">Semantic Colors</SgSidebarLink>
          <SgSidebarLink href="#">Primitive Colors</SgSidebarLink>
          <SgSidebarLink href="#">Text Styles</SgSidebarLink>
          <SgSidebarLink href="#">Spacing</SgSidebarLink>

          <SgSidebarHeading>Forms &amp; Actions</SgSidebarHeading>
          <SgSidebarLink href="#" active>
            Button (active state shown)
          </SgSidebarLink>
          <SgSidebarLink href="#">Link</SgSidebarLink>
          <SgSidebarLink href="#" disabled>
            Disabled link
          </SgSidebarLink>

          <SgSidebarHeading>UDS Tools</SgSidebarHeading>
          <SgSidebarLink href="#">Contrast Checker</SgSidebarLink>
        </SgSidebar>

        <SgMain>
          <SgPageTitle>Site chrome kit-sink</SgPageTitle>
          <SgPageDesc>
            Every <code>.sg-*</code> chrome primitive rendered in approximated
            context. Use this page to spot visual regressions when chrome
            changes. Permanent — kept past cutover.
          </SgPageDesc>

          <SgPageTabs
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            ariaLabel="Kit-sink demo tabs"
          >
            {COMPONENT_TABS.map((t) => (
              <SgPageTab key={t.value} value={t.value}>
                {t.label}
              </SgPageTab>
            ))}
          </SgPageTabs>

          <SgSubsection>
            <SgSubsectionTitle>Active tab</SgSubsectionTitle>
            <SgSubsectionDesc>
              Currently selected: <code>{activeTab}</code>. Try arrow-left /
              arrow-right while a tab has focus to verify keyboard navigation
              moves activation between tabs (per WAI-ARIA APG).
            </SgSubsectionDesc>
          </SgSubsection>

          <SgSubsection>
            <SgSubsectionTitle>Subsection primitive</SgSubsectionTitle>
            <SgSubsectionDesc>
              <code>SgSubsection</code> wraps a content section. The title is
              <code>SgSubsectionTitle</code> (defaults to <code>h3</code>) and
              the description is <code>SgSubsectionDesc</code>.
            </SgSubsectionDesc>
          </SgSubsection>

          <SgSubsection>
            <SgSubsectionTitle>Sidebar variants (left)</SgSubsectionTitle>
            <SgSubsectionDesc>
              The sidebar shows the &quot;getting-started&quot; variant on the
              top three links (bolder, with bottom-divider), a regular
              category, an <em>active</em> link, and a <em>disabled</em>{' '}
              link.
            </SgSubsectionDesc>
          </SgSubsection>

          <SgSubsection>
            <SgSubsectionTitle>Header slots</SgSubsectionTitle>
            <SgSubsectionDesc>
              The header has three slots populated with inert stubs in this
              kit: the Build Demo button (real impl in Chunk 12b), the search
              trigger (Chunk 10), and the version dropdown (Chunk 14). The
              theme bar below is wired live to the <code>UdsThemeProvider</code>
              {' '}from Chunk 03 — flip any theme dimension and watch every
              primitive on this page reflow accordingly.
            </SgSubsectionDesc>
          </SgSubsection>
        </SgMain>
      </SgShell>
    </>
  );
}
