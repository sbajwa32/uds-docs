// Playground config for the <udc-search> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default {
  controls: [
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Search…' },
    { key: 'value', label: 'Initial value', type: 'text', default: '' },
    {
      key: 'state',
      label: 'State',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'error', label: 'Error' },
      ],
    },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
  ],
  render(s) {
    const attrs = [`placeholder="${escAttr(s.placeholder)}"`];
    if (s.value) attrs.push(`value="${escAttr(s.value)}"`);
    if (s.state && s.state !== 'default') attrs.push(`state="${escAttr(s.state)}"`);
    if (s.disabled) attrs.push('disabled');

    const html = `<udc-search\n  ${attrs.join('\n  ')}\n></udc-search>`;
    return { html, code: html };
  },
};
