// Ported from docs/pages/tokens/spacing.html during Chunk 06a.
//
// Truly static — just inline swatch divs sized via UDS spacing tokens. Switch
// the Density theme control to see comfortable-mode adjustments.

import { DocsCard, DocsPageHeader, DocsSection } from '@/components/site/ui';

export const metadata = { title: 'Spacing — UDS' };

const STEPS = [
  { id: '050', token: 'var(--uds-space-050)' },
  { id: '100', token: 'var(--uds-space-100)' },
  { id: '150', token: 'var(--uds-space-150)' },
  { id: '200', token: 'var(--uds-space-200)' },
  { id: '300', token: 'var(--uds-space-300)' },
  { id: '400', token: 'var(--uds-space-400)' },
  { id: '500', token: 'var(--uds-space-500)' },
  { id: '600', token: 'var(--uds-space-600)' },
];

export default function SpacingPage() {
  return (
    <>
      <DocsPageHeader
        title="Spacing"
        description={
          <>
            A consistent spacing scale used for padding, margins, and gaps. Switch the{' '}
            <strong>Density</strong> control above to see the comfortable mode adjustments.
          </>
        }
      />
      <DocsSection title="Spacing scale">
        <DocsCard>
          <div className="ds-spacing-scale">
          {STEPS.map(({ id, token }) => (
            <div key={id} className="ds-spacing-scale__item">
              <div
                className="ds-spacing-scale__bar"
                style={{
                  width: token,
                  height: token,
                  minWidth: id === '050' ? 2 : undefined,
                  minHeight: id === '050' ? 2 : undefined,
                }}
              />
              <code className="ds-spacing-scale__label">space-{id}</code>
            </div>
          ))}
          </div>
        </DocsCard>
      </DocsSection>
    </>
  );
}
