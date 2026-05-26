import { promises as fs } from 'node:fs';
import path from 'node:path';

import { TokenPageTabs } from '@/components/site/TokenPageTabs';

import {
  SEMANTIC_COLOR_GROUPS,
  type TokenSwatch,
  type TokenSwatchGroup,
} from './token-preview-data';

export const metadata = { title: 'Semantic Colors — UDS' };

const CHECKERBOARD_BG =
  'linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),' +
  'linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)';

function TokenRow({ token }: { token: TokenSwatch }) {
  const swatchStyle: React.CSSProperties = {
    background: `var(${token.name})`,
    ...(token.checkerboard && {
      backgroundImage: CHECKERBOARD_BG,
      backgroundSize: '8px 8px',
      backgroundPosition: '0 0, 4px 4px',
    }),
  };

  return (
    <div className="sg-token-row">
      <div className="sg-token-swatch" style={swatchStyle} />
      <span className="sg-token-name">{token.name}</span>
      {token.value && <span className="sg-token-value">{token.value}</span>}
    </div>
  );
}

function TokenSwatchPreview({ groups }: { groups: TokenSwatchGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.title} className="sg-subsection">
          <h3 className="sg-subsection-title">{group.title}</h3>
          {group.description && (
            <p className="sg-subsection-desc">{group.description}</p>
          )}
          <div className="sg-token-table">
            {group.tokens.map((token) => (
              <TokenRow key={token.name} token={token} />
            ))}
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

  return (
    <>
      <h1 className="sg-page-title">Semantic Colors</h1>
      <p className="sg-page-desc">
        Role-based color tokens that adapt across themes, brands, and light/dark
        modes. Use these instead of primitives in component and layout code.
      </p>
      <TokenPageTabs
        preview={<TokenSwatchPreview groups={SEMANTIC_COLOR_GROUPS} />}
        code={<CodeTab css={css} />}
      />
    </>
  );
}
