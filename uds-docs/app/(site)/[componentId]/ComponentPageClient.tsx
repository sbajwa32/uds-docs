'use client';

// Per-component page renderer. Establishes the standard pattern that Chunks
// 08, 09, 13, and 14 reuse:
//   server [componentId]/page.tsx pre-renders the static shell + passes the
//   component id to this client wrapper; the wrapper fetches all UDS data
//   client-side via lib/uds-data.ts, manages tab state, renders loading +
//   error UI explicitly.
//
// Tabs (in display order):
//   Examples | Code | Guidelines | Figma Notes (only if notes exist) | Changelog | Playground
//
// Default tab is `examples`. Examples (Chunk 08), Playground (Chunk 09), and
// Figma Notes (Chunk 13) tab bodies are stubbed for now.

import { useEffect, useState } from 'react';

import { SgPageTabs, SgPageTab } from '@/components/site/SgPageHeader';
import {
  getComponentSpec,
  getComponentStatus,
  getComponentChangelog,
  getComponentImpl,
  getComponentManifest,
  getComponentFigmaNotes,
  type ComponentSpec,
  type ComponentStatus,
  type ComponentChangelog,
  type ComponentImpl,
  type ExamplesManifest,
  type FigmaNotes,
} from '@/lib/uds-data';

import { Playground } from '@/components/site/Playground';
import { useUdsVersion } from '@/components/site/UdsVersionProvider';

import { ComponentHeader } from './ComponentHeader';
import { GuidelinesTab } from './GuidelinesTab';
import { CodeTab } from './CodeTab';
import { ChangelogTab } from './ChangelogTab';
import { ExamplesTab } from './ExamplesTab';
import { FigmaNotesTab } from './FigmaNotesTab';

type TabKey = 'examples' | 'code' | 'guidelines' | 'figma-notes' | 'changelog' | 'playground';

interface ComponentData {
  spec: ComponentSpec;
  status: ComponentStatus;
  changelog: ComponentChangelog | null;
  impl: ComponentImpl | null;
  manifest: ExamplesManifest | null;
  figmaNotes: FigmaNotes | null;
}

interface FetchState {
  data: ComponentData | null;
  loading: boolean;
  error: string | null;
}

export function ComponentPageClient({ componentId }: { componentId: string }) {
  const { fetchVersion } = useUdsVersion();
  const [activeTab, setActiveTab] = useState<TabKey>('examples');
  const [{ data, loading, error }, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    (async () => {
      try {
        // spec.json + status.json are required; everything else is optional
        // and rendered conditionally.
        const [spec, status] = await Promise.all([
          getComponentSpec(componentId, fetchVersion),
          getComponentStatus(componentId, fetchVersion),
        ]);

        // Optional fetches — tolerate per-resource 404 so a missing impl.json
        // (CSS-only component) doesn't break the page.
        const [changelog, impl, manifest, figmaNotes] = await Promise.all([
          getComponentChangelog(componentId, fetchVersion).catch(() => null),
          getComponentImpl(componentId, fetchVersion).catch(() => null),
          getComponentManifest(componentId, fetchVersion).catch(() => null),
          getComponentFigmaNotes(componentId, fetchVersion), // already returns null on 404
        ]);

        if (cancelled) return;
        setState({
          data: { spec, status, changelog, impl, manifest, figmaNotes },
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [componentId, fetchVersion]);

  if (loading) {
    return <p className="sg-changelog-empty">Loading component data…</p>;
  }
  if (error || !data) {
    return (
      <div role="alert">
        <h1 className="sg-page-title">Couldn&apos;t load component</h1>
        <p className="sg-page-desc">
          {error || 'Unknown error while fetching component data.'}
        </p>
      </div>
    );
  }

  const { spec, status, changelog, impl, manifest, figmaNotes } = data;
  void manifest; // Used by Examples tab in Chunk 08.

  // Conditionally show Figma Notes tab only when the component has notes.
  const showFigmaNotes = !!(figmaNotes?.notes && figmaNotes.notes.length > 0);

  return (
    <>
      <ComponentHeader componentId={componentId} spec={spec} status={status} />

      <SgPageTabs
        activeTab={activeTab}
        onActiveTabChange={(v) => setActiveTab(v as TabKey)}
        ariaLabel="Component documentation"
      >
        <SgPageTab value="examples">Examples</SgPageTab>
        <SgPageTab value="code">Code</SgPageTab>
        <SgPageTab value="guidelines">Guidelines</SgPageTab>
        {showFigmaNotes ? (
          <SgPageTab value="figma-notes" count={figmaNotes!.notes.length}>
            Figma Notes
          </SgPageTab>
        ) : null}
        <SgPageTab value="changelog">Changelog</SgPageTab>
        <SgPageTab value="playground">Playground</SgPageTab>
      </SgPageTabs>

      <div hidden={activeTab !== 'examples'}>
        <ExamplesTab componentId={componentId} />
      </div>
      <div hidden={activeTab !== 'code'}>
        <CodeTab componentId={componentId} />
      </div>
      <div hidden={activeTab !== 'guidelines'}>
        <GuidelinesTab spec={spec} impl={impl} />
      </div>
      {showFigmaNotes ? (
        <div hidden={activeTab !== 'figma-notes'}>
          <FigmaNotesTab notes={figmaNotes!.notes} />
        </div>
      ) : null}
      <div hidden={activeTab !== 'changelog'}>
        <ChangelogTab componentId={componentId} changelog={changelog} />
      </div>
      <div hidden={activeTab !== 'playground'}>
        <Playground componentId={componentId} />
      </div>
    </>
  );
}
