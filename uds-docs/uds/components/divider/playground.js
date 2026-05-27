// Playground config for the <udc-divider> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default {
  controls: [
    {
      key: 'padding',
      label: 'Padding',
      type: 'select',
      default: 'sm',
      options: [
        { value: 'sm', label: 'sm (4px, default)' },
        { value: 'md', label: 'md (8px)' },
        { value: 'lg', label: 'lg (12px)' },
        { value: 'xl', label: 'xl (16px)' },
      ],
    },
  ],
  render(s) {
    const attrs = [];
    if (s.padding && s.padding !== 'sm') attrs.push(`padding="${escAttr(s.padding)}"`);
    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';

    const inner = `<udc-divider${attrStr}></udc-divider>`;
    const html = `<div style="width:100%;"><p style="font-size:14px;color:var(--uds-color-text-secondary);">Content above</p>${inner}<p style="font-size:14px;color:var(--uds-color-text-secondary);">Content below</p></div>`;
    return { html, code: inner };
  },
};
