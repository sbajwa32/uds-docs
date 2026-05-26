// Ported from docs/pages/tokens/primitive-colors.html + the primitive-colors
// render function in docs/app.js (~lines 3100-3130) during Chunk 06a.
//
// Server component reads uds/tokens/primitives.css at build time and passes
// it to the client wrapper for the Code tab. The Preview tab renders 13
// color families × 11 steps from the same hardcoded data the legacy JS used.

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { TokenPageTabs } from '@/components/site/TokenPageTabs';
import { DocsCodeBlock, DocsPageHeader, DocsSection, TokenGroup, TokenSwatchCard } from '@/components/site/ui';

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
  },
  {
    name: '--uds-primitive-color-special-black',
    value: '#000000',
  },
  {
    name: '--uds-primitive-color-special-none',
    value: 'transparent',
    checkerboard: true,
  },
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PreviewTab() {
  return (
    <>
      <TokenGroup title="Special">
        {SPECIAL.map((sw) => (
          <TokenSwatchCard
            key={sw.name}
            name={sw.name}
            value={sw.value}
            swatch={`var(${sw.name})`}
            checkerboard={'checkerboard' in sw && Boolean(sw.checkerboard)}
          />
        ))}
      </TokenGroup>

      {FAMILIES.map((family) => (
        <TokenGroup key={family} title={capitalize(family)}>
          {STEPS.map((step) => {
            const varName = `--uds-primitive-color-${family}-${step}`;
            return (
              <TokenSwatchCard
                key={step}
                name={varName}
                value={`${family}-${step}`}
                swatch={`var(${varName})`}
              />
            );
          })}
        </TokenGroup>
      ))}
    </>
  );
}

function CodeTab({ css }: { css: string }) {
  return (
    <>
      <DocsSection title="Import">
        <DocsCodeBlock code="@import url('./tokens/primitives.css');" language="css" />
      </DocsSection>
      <DocsSection
        title="All Primitive Color Tokens"
        description="Copy the full CSS below to include all primitive color tokens in your project."
      >
        <DocsCodeBlock code={css} language="css" />
      </DocsSection>
    </>
  );
}

export default async function PrimitiveColorsPage() {
  const cssPath = path.join(process.cwd(), 'uds/tokens/primitives.css');
  const css = await fs.readFile(cssPath, 'utf8');

  return (
    <>
      <DocsPageHeader
        title="Primitive Colors"
        description="Raw palette values. These are referenced by semantic tokens — avoid using primitives directly in component code."
      />
      <TokenPageTabs preview={<PreviewTab />} code={<CodeTab css={css} />} />
    </>
  );
}
