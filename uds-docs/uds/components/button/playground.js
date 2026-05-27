// Playground config for the <udc-button> Web Component.

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
      default: 'primary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'ghost', label: 'Ghost' },
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
    {
      key: 'color',
      label: 'Color',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'danger', label: 'Danger' },
        { value: 'success', label: 'Success' },
        { value: 'warning', label: 'Warning' },
        { value: 'neutral', label: 'Neutral' },
      ],
    },
    { key: 'showLeadingIcon', label: 'Show leading icon', type: 'checkbox', default: false },
    { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: 'add' },
    { key: 'showTrailingIcon', label: 'Show trailing icon', type: 'checkbox', default: false },
    { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: 'arrow_forward' },
    { key: 'iconOnly', label: 'Icon only', type: 'checkbox', default: false },
    { key: 'iconOnlyName', label: 'Icon', type: 'icon-search', default: 'add' },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    { key: 'selected', label: 'Selected', type: 'checkbox', default: false },
    { key: 'label', label: 'Label', type: 'text', default: 'Button label' },
  ],
  render(s) {
    const attrs = [`variant="${escAttr(s.variant)}"`];
    if (s.size && s.size !== 'default') attrs.push(`size="${escAttr(s.size)}"`);
    if (s.color && s.color !== 'default') attrs.push(`color="${escAttr(s.color)}"`);
    if (s.disabled) attrs.push('disabled');
    if (s.selected) attrs.push('selected');

    let inner = '';
    if (s.iconOnly) {
      attrs.push('icon-only');
      attrs.push(`aria-label="${escAttr(s.label)}"`);
      attrs.push(`leading-icon="${escAttr(s.iconOnlyName || 'add')}"`);
    } else {
      if (s.showLeadingIcon) attrs.push(`leading-icon="${escAttr(s.leadingIcon || 'add')}"`);
      if (s.showTrailingIcon) attrs.push(`trailing-icon="${escAttr(s.trailingIcon || 'arrow_forward')}"`);
      inner = escText(s.label);
    }

    const html = `<udc-button\n  ${attrs.join('\n  ')}\n>${inner}</udc-button>`;
    return { html, code: html };
  },
};
