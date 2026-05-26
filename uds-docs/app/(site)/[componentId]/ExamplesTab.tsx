'use client';

// Examples tab — fetches every showInDocs example for the component and
// renders each with canonical token substitution applied.
//
// Direct port of the legacy app.js renderComponentExamplesTab(pageId) flow,
// but the substitution + fetch logic now live in lib/examples-renderer.ts
// (shared with future Demo Builder work in Chunk 12).

import { useEffect, useState } from 'react';

import { useUdsVersion } from '@/components/site/UdsVersionProvider';
import { fetchAllExamples, type RenderedExample } from '@/lib/examples-renderer';

// Some example manifests have HTML entities (`&amp;`, `&lt;`) in their
// label / description fields, because the legacy site rendered them via
// `innerHTML` which decoded them on the way in. React renders strings
// as plain text, so those entities show up literally. Decode the common
// ones inline. (The manifest data files are inside the Figma source-of-
// truth tree and can't be autonomously rewritten — see
// `.cursor/rules/uds-source-of-truth.mdc`.)
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

interface State {
  examples: RenderedExample[] | null;
  loading: boolean;
  error: string | null;
}

export function ExamplesTab({ componentId }: { componentId: string }) {
  const { fetchVersion, isArchive, ready: versionReady } = useUdsVersion();
  const [{ examples, loading, error }, setState] = useState<State>({
    examples: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!versionReady) return;
    let cancelled = false;
    setState({ examples: null, loading: true, error: null });

    (async () => {
      const result = await fetchAllExamples(componentId, { version: fetchVersion });
      if (cancelled) return;
      if (result.length === 0) {
        setState({ examples: [], loading: false, error: null });
        return;
      }
      setState({ examples: result, loading: false, error: null });
    })().catch((err) => {
      if (cancelled) return;
      setState({
        examples: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [componentId, fetchVersion, versionReady]);

  if (loading) {
    return <p className="sg-changelog-empty">Loading examples…</p>;
  }
  if (error) {
    return (
      <p className="sg-changelog-empty" role="alert">
        Couldn&apos;t load examples for <code>{componentId}</code>: {error}
      </p>
    );
  }
  if (!examples || examples.length === 0) {
    // Archive snapshots may not carry per-component examples (the 0.2
    // archive in this repo only ships spec/status/changelog/CSS). Show a
    // scoped message instead of the live "no examples documented yet"
    // copy so the reader knows they're hitting an archive limitation,
    // not a missing-content gap.
    if (isArchive) {
      return (
        <p className="sg-changelog-empty">
          Examples aren&apos;t archived for <code>{componentId}</code> in this
          UDS version. Switch the version dropdown back to the latest release
          to see them.
        </p>
      );
    }
    return (
      <p className="sg-changelog-empty">
        No examples are documented for <code>{componentId}</code> yet.
      </p>
    );
  }

  return (
    <>
      {examples.map((ex) => (
        <section key={ex.id} className="sg-example-block">
          {ex.label ? (
            <h3 className="sg-subsection-title">{decodeHtmlEntities(ex.label)}</h3>
          ) : null}
          {ex.description ? (
            <p className="sg-subsection-desc">{decodeHtmlEntities(ex.description)}</p>
          ) : null}
          <div className="sg-example">
            <div
              className="sg-example-preview"
              dangerouslySetInnerHTML={{ __html: ex.html }}
            />
            <details className="sg-example-code">
              <summary>Show code</summary>
              <pre>
                <code>{ex.html}</code>
              </pre>
            </details>
          </div>
        </section>
      ))}
    </>
  );
}
