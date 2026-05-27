// Playground config for the <udc-label> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'text', label: 'Text', type: 'text', default: 'Full name' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'disabled', label: 'Disabled' },
        { value: 'error', label: 'Error' },
        { value: 'interactive', label: 'Interactive' },
        { value: 'success', label: 'Success' },
      ],
    },
    { key: 'required', label: 'Required', type: 'checkbox', default: true },
    { key: 'small', label: 'Small', type: 'checkbox', default: false },
    { key: 'prominent', label: 'Prominent', type: 'checkbox', default: false },
  ],
  render(s) {
    const attrs = [];
    if (s.variant && s.variant !== 'default') attrs.push(`variant="${escAttr(s.variant)}"`);
    if (s.small) attrs.push('size="sm"');
    if (s.prominent) attrs.push('prominent');
    if (s.required) attrs.push('required');
    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
    const html = `<udc-label${attrStr}>${escText(s.text)}</udc-label>`;
    return { html, code: html };
  },
};
