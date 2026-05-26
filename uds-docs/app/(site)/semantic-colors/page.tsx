import { promises as fs } from 'node:fs';
import path from 'node:path';

import { TokenPageTabs } from '@/components/site/TokenPageTabs';
import { DocsCodeBlock, DocsPageHeader, DocsSection, TokenGroup, TokenSwatchCard } from '@/components/site/ui';

import {
  SEMANTIC_COLOR_GROUPS,
  type TokenSwatch,
  type TokenSwatchGroup,
} from './token-preview-data';

export const metadata = { title: 'Semantic Colors — UDS' };

function TokenRow({ token }: { token: TokenSwatch }) {
  return (
    <TokenSwatchCard
      name={token.name}
      value={token.value}
      swatch={`var(${token.name})`}
      checkerboard={token.checkerboard}
    />
  );
}

function TokenSwatchPreview({ groups }: { groups: TokenSwatchGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <TokenGroup key={group.title} title={group.title} description={group.description}>
          {group.tokens.map((token) => (
            <TokenRow key={token.name} token={token} />
          ))}
        </TokenGroup>
      ))}
    </>
  );
}

function CodeTab({ css }: { css: string }) {
  return (
    <>
      <DocsSection title="Import">
        <DocsCodeBlock code="@import url('./tokens/semantic.css');" language="css" />
      </DocsSection>
      <DocsSection
        title="Base Semantic Color Tokens (full source)"
        description={
          <>
            The complete <code>semantic.css</code> source. Includes <code>:root</code> defaults
            plus dark mode, brand, font, scale, and density overrides via <code>[data-*]</code>{' '}
            attribute selectors.
          </>
        }
      >
        <DocsCodeBlock code={css} language="css" />
      </DocsSection>
    </>
  );
}

export default async function SemanticColorsPage() {
  const cssPath = path.join(process.cwd(), 'uds/tokens/semantic.css');
  const css = await fs.readFile(cssPath, 'utf8');

  return (
    <>
      <DocsPageHeader
        title="Semantic Colors"
        description="Role-based color tokens that adapt across themes, brands, and light/dark modes. Use these instead of primitives in component and layout code."
      />
      <TokenPageTabs
        preview={<TokenSwatchPreview groups={SEMANTIC_COLOR_GROUPS} />}
        code={<CodeTab css={css} />}
      />
    </>
  );
}
