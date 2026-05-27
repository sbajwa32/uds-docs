// Playground config for the <udc-badge> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      default: 'info',
      options: [
        { value: 'info', label: 'Info' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
        { value: 'warning', label: 'Warning' },
      ],
    },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      default: 'prominent',
      options: [
        { value: 'prominent', label: 'Prominent (filled)' },
        { value: 'subtle', label: 'Subtle' },
      ],
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'sm', label: 'Small' },
      ],
    },
    { key: 'label', label: 'Label', type: 'text', default: 'Badge' },
  ],
  render(s) {
    const attrs = [];
    if (s.tone && s.tone !== 'info') attrs.push(`tone="${escAttr(s.tone)}"`);
    if (s.variant && s.variant !== 'prominent') attrs.push(`variant="${escAttr(s.variant)}"`);
    if (s.size && s.size !== 'default') attrs.push(`size="${escAttr(s.size)}"`);
    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
    const html = `<udc-badge${attrStr}>${escText(s.label)}</udc-badge>`;
    return { html, code: html };
  },
};
