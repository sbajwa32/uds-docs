'use client';

// Examples tab — fetches every showInDocs example for the component and
// renders each with canonical token substitution applied.
//
// Direct port of the legacy app.js renderComponentExamplesTab(pageId) flow,
// but the substitution + fetch logic now live in lib/examples-renderer.ts
// (shared with future Demo Builder work in Chunk 12).

import { useEffect, useState } from 'react';

import { fetchAllExamples, type RenderedExample } from '@/lib/examples-renderer';

interface State {
  examples: RenderedExample[] | null;
  loading: boolean;
  error: string | null;
}

export function ExamplesTab({ componentId }: { componentId: string }) {
  const [{ examples, loading, error }, setState] = useState<State>({
    examples: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ examples: null, loading: true, error: null });

    (async () => {
      const result = await fetchAllExamples(componentId);
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
  }, [componentId]);

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
            <h3 className="sg-subsection-title">{ex.label}</h3>
          ) : null}
          {ex.description ? (
            <p className="sg-subsection-desc">{ex.description}</p>
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
