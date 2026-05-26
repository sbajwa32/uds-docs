// Ported from docs/pages/tokens/primitive-colors.html + the primitive-colors
// render function in docs/app.js (~lines 3100-3130) during Chunk 06a.
//
// Server component reads uds/tokens/primitives.css at build time and passes
// it to the client wrapper for the Code tab. The Preview tab renders 13
// color families × 11 steps from the same hardcoded data the legacy JS used.

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { TokenPageTabs } from '@/components/site/TokenPageTabs';

export const metadata = { title: 'Primitive Colors — UDS' };

const FAMILIES = [
  'slate',
  'neutral',
  'stone',
  'blue',
  'cyan',
  'purple',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
] as const;
const STEPS = [10, 20, 30, 40, 50, '60-M', 70, 80, 90, 100, 110] as const;

const SPECIAL = [
  {
    name: '--uds-primitive-color-special-white',
    value: '#ffffff',
    style: { background: 'var(--uds-primitive-color-special-white)' },
  },
  {
    name: '--uds-primitive-color-special-black',
    value: '#000000',
    style: { background: 'var(--uds-primitive-color-special-black)' },
  },
  {
    name: '--uds-primitive-color-special-none',
    value: 'transparent',
    style: {
      background: 'var(--uds-primitive-color-special-none)',
      backgroundImage:
        'linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)',
      backgroundSize: '8px 8px',
      backgroundPosition: '0 0,4px 4px',
    },
  },
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PreviewTab() {
  return (
    <>
      <div className="sg-subsection" id="prim-special">
        <h3 className="sg-subsection-title">Special</h3>
        <div className="sg-token-list">
          {SPECIAL.map((sw) => (
            <div key={sw.name} className="sg-token-row">
              <div className="sg-token-swatch" style={sw.style} />
              <span className="sg-token-name">{sw.name}</span>
              <span className="sg-token-value">{sw.value}</span>
            </div>
          ))}
        </div>
      </div>

      {FAMILIES.map((family) => (
        <div key={family} className="sg-subsection" id={`prim-${family}`}>
          <h3 className="sg-subsection-title">{capitalize(family)}</h3>
          <div className="sg-token-list">
            {STEPS.map((step) => {
              const varName = `--uds-primitive-color-${family}-${step}`;
              return (
                <div key={step} className="sg-token-row">
                  <div className="sg-token-swatch" style={{ background: `var(${varName})` }} />
                  <span className="sg-token-name">{varName}</span>
                  <span className="sg-token-value">{`${family}-${step}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function CodeTab({ css }: { css: string }) {
  return (
    <>
      <h3 className="sg-subsection-title">Import</h3>
      <pre className="sg-playground-code" style={{ marginBottom: 24 }}>
        @import url(&apos;./tokens/primitives.css&apos;);
      </pre>
      <h3 className="sg-subsection-title">All Primitive Color Tokens</h3>
      <p className="sg-subsection-desc">
        Copy the full CSS below to include all primitive color tokens in your
        project.
      </p>
      <pre className="sg-playground-code" id="prim-code-block">
        {css}
      </pre>
    </>
  );
}

export default async function PrimitiveColorsPage() {
  const cssPath = path.join(process.cwd(), 'uds/tokens/primitives.css');
  const css = await fs.readFile(cssPath, 'utf8');

  return (
    <>
      <h1 className="sg-page-title">Primitive Colors</h1>
      <p className="sg-page-desc">
        Raw palette values. These are referenced by semantic tokens — avoid
        using primitives directly in component code.
      </p>
      <TokenPageTabs preview={<PreviewTab />} code={<CodeTab css={css} />} />
    </>
  );
}
