'use client';

// Shared 2-tab (Preview / Code) layout for token reference pages.
// Used by primitive-colors and semantic-colors pages — both have the same
// "swatch grid in Preview, source CSS in Code" shape.

import { useState, type ReactNode } from 'react';

import { SgPageTabs, SgPageTab } from './SgPageHeader';

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
      <SgPageTabs
        activeTab={activeTab}
        onActiveTabChange={(v) => setActiveTab(v as 'preview' | 'code')}
        ariaLabel="Token preview vs source code"
      >
        <SgPageTab value="preview">Preview</SgPageTab>
        <SgPageTab value="code">Code</SgPageTab>
      </SgPageTabs>
      <div hidden={activeTab !== 'preview'}>{preview}</div>
      <div hidden={activeTab !== 'code'}>{code}</div>
    </>
  );
}
