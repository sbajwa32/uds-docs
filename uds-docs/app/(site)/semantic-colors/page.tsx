// Ported from docs/pages/tokens/semantic-colors.html during Chunk 06a.
//
// Preview tab uses dangerouslySetInnerHTML for the verbatim swatch markup —
// every <div class="sg-token-row"> with its inline `style="background:var(...)"`
// carries through unchanged. That keeps the visual diff at zero without
// rewriting 148 lines of repetitive token rows in JSX.
//
// Code tab reads uds/tokens/semantic.css at build time, so the displayed CSS
// is always the live source rather than the legacy hardcoded inline copy.

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { TokenPageTabs } from '@/components/site/TokenPageTabs';

export const metadata = { title: 'Semantic Colors — UDS' };

// The full Preview content (148 lines of repetitive token rows) lives in a
// sibling preview-content.html file rather than inline. Read at build time.
async function loadPreviewHtml(): Promise<string> {
  const previewPath = path.join(
    process.cwd(),
    'app/(site)/semantic-colors/preview-content.html',
  );
  return fs.readFile(previewPath, 'utf8');
}

function CodeTab({ css }: { css: string }) {
  return (
    <>
      <h3 className="sg-subsection-title">Import</h3>
      <pre className="sg-playground-code" style={{ marginBottom: 24 }}>
        @import url(&apos;./tokens/semantic.css&apos;);
      </pre>
      <h3 className="sg-subsection-title">Base Semantic Color Tokens (full source)</h3>
      <p className="sg-subsection-desc">
        The complete <code className="sg-inline-code">semantic.css</code>{' '}
        source. Includes <code className="sg-inline-code">:root</code> defaults
        plus dark mode, brand, font, scale, and density overrides via{' '}
        <code className="sg-inline-code">[data-*]</code> attribute selectors.
      </p>
      <pre className="sg-playground-code">{css}</pre>
    </>
  );
}

export default async function SemanticColorsPage() {
  const cssPath = path.join(process.cwd(), 'uds/tokens/semantic.css');
  const css = await fs.readFile(cssPath, 'utf8');
  const previewHtml = await loadPreviewHtml();

  return (
    <>
      <h1 className="sg-page-title">Semantic Colors</h1>
      <p className="sg-page-desc">
        Role-based color tokens that adapt across themes, brands, and light/dark
        modes. Use these instead of primitives in component and layout code.
      </p>
      <TokenPageTabs
        preview={<div dangerouslySetInnerHTML={{ __html: previewHtml }} />}
        code={<CodeTab css={css} />}
      />
    </>
  );
}
