// Playground config for the <udc-spacer> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default {
  controls: [
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      default: '200',
      options: [
        { value: '050', label: '050 (4px)' },
        { value: '075', label: '075 (6px)' },
        { value: '100', label: '100 (8px)' },
        { value: '150', label: '150 (12px)' },
        { value: '200', label: '200 (16px)' },
        { value: '300', label: '300 (24px)' },
        { value: '400', label: '400 (32px)' },
        { value: '600', label: '600 (48px)' },
      ],
    },
  ],
  render(s) {
    const code = `<udc-spacer size="${escAttr(s.size)}"></udc-spacer>`;
    const html = `<div style="display:flex;align-items:center;gap:0;"><udc-badge>Before</udc-badge><udc-spacer size="${escAttr(s.size)}" style="background:var(--uds-color-surface-info-subtle);outline:1px dashed var(--uds-color-border-interactive);"></udc-spacer><udc-badge tone="success">After</udc-badge></div>`;
    return { html, code };
  },
};
