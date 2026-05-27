// Playground config for the <udc-icon-wrapper> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default {
  controls: [
    { key: 'icon', label: 'Icon', type: 'icon-search', default: 'info' },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      default: '24',
      options: [
        { value: '16', label: '16' },
        { value: '20', label: '20' },
        { value: '24', label: '24 (default)' },
        { value: '32', label: '32' },
        { value: '48', label: '48' },
        { value: '64', label: '64' },
      ],
    },
    {
      key: 'color',
      label: 'Color',
      type: 'select',
      default: 'interactive',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'interactive', label: 'Interactive' },
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
        { value: 'warning', label: 'Warning' },
      ],
    },
  ],
  render(s) {
    const attrs = [`icon="${escAttr(s.icon || 'info')}"`];
    if (s.size && s.size !== '24') attrs.push(`size="${escAttr(s.size)}"`);
    if (s.color) attrs.push(`color="${escAttr(s.color)}"`);
    const html = `<udc-icon-wrapper ${attrs.join(' ')}></udc-icon-wrapper>`;
    return { html, code: html };
  },
};
