// Playground config for the <udc-chip> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      default: 'filter',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'filter', label: 'Filter' },
        { value: 'input', label: 'Input' },
        { value: 'dropdown', label: 'Dropdown' },
      ],
    },
    { key: 'label', label: 'Label', type: 'text', default: 'Chip label' },
    { key: 'selected', label: 'Selected', type: 'checkbox', default: false },
    { key: 'leadingIconOn', label: 'Show leading icon', type: 'checkbox', default: true },
    { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: 'check' },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
  ],
  render(s) {
    const attrs = [];
    if (s.variant && s.variant !== 'default') attrs.push(`variant="${escAttr(s.variant)}"`);
    if (s.selected) attrs.push('selected');
    if (s.disabled) attrs.push('disabled');
    if (s.variant === 'input') attrs.push('removable');
    if (s.leadingIconOn) attrs.push(`leading-icon="${escAttr(s.leadingIcon || 'check')}"`);

    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
    const html = `<udc-chip${attrStr}>${escText(s.label)}</udc-chip>`;
    return { html, code: html };
  },
};
