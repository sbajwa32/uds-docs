'use client';

// Shared 2-tab (Preview / Code) layout for token reference pages.
// Used by primitive-colors and semantic-colors pages — both have the same
// "swatch grid in Preview, source CSS in Code" shape.

import { useState, type ReactNode } from 'react';

import { DocsTab, DocsTabPanel, DocsTabs } from './ui';

export function TokenPageTabs({
  preview,
  code,
}: {
  preview: ReactNode;
  code: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  return (
    <>
      <DocsTabs
        activeTab={activeTab}
        onActiveTabChange={(v) => setActiveTab(v as 'preview' | 'code')}
        ariaLabel="Token preview vs source code"
      >
        <DocsTab value="preview">Preview</DocsTab>
        <DocsTab value="code">Code</DocsTab>
        <DocsTabPanel value="preview">{preview}</DocsTabPanel>
        <DocsTabPanel value="code">{code}</DocsTabPanel>
      </DocsTabs>
    </>
  );
}
