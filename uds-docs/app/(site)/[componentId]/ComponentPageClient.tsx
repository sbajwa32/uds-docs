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
// Default tab is `examples`. The Playground tab is conditional:
//   - Hidden for components without a `playground.js` module
//     (currently combobox, data-view, date-picker)
//   - Hidden in archive views (?uds=) — archive snapshots don't carry the
//     interactive JS modules the Playground engine dynamic-imports

import { useEffect, useState } from 'react';

import { DocsStateMessage, DocsTab, DocsTabPanel, DocsTabs } from '@/components/site/ui';
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

// Components that ship spec/CSS/examples but no interactive Playground yet.
// Mirrors the on-disk truth: `ls uds/components/*/playground.js` excludes
// these three. Listed here rather than runtime-probed because:
//   - Static export can't easily ship a "does this file exist?" probe
//   - The list rarely changes (lifecycle status governs it)
//   - Wrong-positive shows the Playground tab and the user clicks into a
//     dynamic-import error; wrong-negative just hides a feature
const COMPONENTS_WITHOUT_PLAYGROUND = new Set<string>([
  'combobox',
  'data-view',
  'date-picker',
]);

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

// Tab keys accepted via `?tab=` URL param. Same as the legacy SPA's hash-
// based `#/<component>?tab=<key>` so existing deep-links keep working.
const TAB_QUERY_KEYS: ReadonlySet<TabKey> = new Set([
  'examples',
  'code',
  'guidelines',
  'figma-notes',
  'changelog',
  'playground',
]);

function readTabFromUrl(): TabKey {
  if (typeof window === 'undefined') return 'examples';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('tab');
  if (raw && (TAB_QUERY_KEYS as Set<string>).has(raw)) return raw as TabKey;
  return 'examples';
}

export function ComponentPageClient({ componentId }: { componentId: string }) {
  const { fetchVersion, isArchive, ready: versionReady } = useUdsVersion();
  const [activeTab, setActiveTab] = useState<TabKey>('examples');

  // Hydrate the active tab from `?tab=` on mount. Doing it post-mount
  // avoids the SSR/CSR mismatch you get from reading `window` during
  // render. Designers landing on `/button?tab=changelog` get the right
  // tab; everyone else starts on Examples.
  useEffect(() => {
    setActiveTab(readTabFromUrl());
  }, [componentId]);
  const [{ data, loading, error }, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Defer fetching until the version provider has read ?uds= off the URL.
    // Without this gate, a hard load of `/button?uds=0.2` fires the live
    // spec.json fetch first (because activeVersion is still null in the
    // first render), then re-fires the archive fetch when the provider
    // commits. Wasted bytes + a flash of the live data.
    if (!versionReady) return;

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
  }, [componentId, fetchVersion, versionReady]);

  if (loading) {
    return <DocsStateMessage>Loading component data…</DocsStateMessage>;
  }
  if (error || !data) {
    return (
      <DocsStateMessage title="Couldn’t load component" tone="error">
          {error || 'Unknown error while fetching component data.'}
      </DocsStateMessage>
    );
  }

  const { spec, status, changelog, impl, manifest, figmaNotes } = data;
  void manifest; // Used by Examples tab in Chunk 08.

  // Conditionally show Figma Notes tab only when the component has notes.
  const showFigmaNotes = !!(figmaNotes?.notes && figmaNotes.notes.length > 0);

  // Playground tab is conditional. Hidden when:
  //   (a) the component doesn't ship a playground.js (deferred components)
  //   (b) we're viewing an archive — archive snapshots don't include
  //       playground modules, so dynamic-import would fail
  const showPlayground =
    !isArchive && !COMPONENTS_WITHOUT_PLAYGROUND.has(componentId);

  // If the user landed on the Playground tab via a stale URL/state and the
  // tab no longer exists for this component, snap back to Examples.
  if (activeTab === 'playground' && !showPlayground) {
    setActiveTab('examples');
  }
  if (activeTab === 'figma-notes' && !showFigmaNotes) {
    setActiveTab('examples');
  }

  return (
    <>
      <ComponentHeader
        componentId={componentId}
        spec={spec}
        status={status}
        changelog={changelog}
      />

      <DocsTabs
        activeTab={activeTab}
        onActiveTabChange={(v) => setActiveTab(v as TabKey)}
        ariaLabel="Component documentation"
      >
        <DocsTab value="examples">Examples</DocsTab>
        <DocsTab value="code">Code</DocsTab>
        <DocsTab value="guidelines">Guidelines</DocsTab>
        {showFigmaNotes ? (
          <DocsTab value="figma-notes" count={figmaNotes!.notes.length}>
            Figma Notes
          </DocsTab>
        ) : null}
        <DocsTab value="changelog">Changelog</DocsTab>
        {showPlayground ? (
          <DocsTab value="playground">Playground</DocsTab>
        ) : null}

        <DocsTabPanel value="examples">
          <ExamplesTab componentId={componentId} />
        </DocsTabPanel>
        <DocsTabPanel value="code">
          <CodeTab componentId={componentId} />
        </DocsTabPanel>
        <DocsTabPanel value="guidelines">
          <GuidelinesTab spec={spec} impl={impl} />
        </DocsTabPanel>
        {showFigmaNotes ? (
          <DocsTabPanel value="figma-notes">
            <FigmaNotesTab notes={figmaNotes!.notes} />
          </DocsTabPanel>
        ) : null}
        <DocsTabPanel value="changelog">
          <ChangelogTab componentId={componentId} changelog={changelog} />
        </DocsTabPanel>
        {showPlayground ? (
          <DocsTabPanel value="playground" forceMount={false}>
            <Playground componentId={componentId} />
          </DocsTabPanel>
        ) : null}
      </DocsTabs>
    </>
  );
}
