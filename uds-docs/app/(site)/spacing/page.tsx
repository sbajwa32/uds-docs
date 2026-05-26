// Ported from docs/pages/tokens/spacing.html during Chunk 06a.
//
// Truly static — just inline swatch divs sized via UDS spacing tokens. Switch
// the Density theme control to see comfortable-mode adjustments.

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
      <h1 className="sg-page-title">Spacing</h1>
      <p className="sg-page-desc">
        A consistent spacing scale used for padding, margins, and gaps. Switch
        the <strong>Density</strong> control above to see the comfortable mode
        adjustments.
      </p>
      <div className="sg-example">
        <div
          className="sg-example-preview"
          style={{ alignItems: 'flex-end', gap: 16 }}
        >
          {STEPS.map(({ id, token }) => (
            <div key={id} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: token,
                  height: token,
                  background: 'var(--uds-color-surface-interactive-default)',
                  margin: '0 auto 4px',
                  minWidth: id === '050' ? 2 : undefined,
                  minHeight: id === '050' ? 2 : undefined,
                }}
              />
              <span className="sg-swatch-label">{id}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
