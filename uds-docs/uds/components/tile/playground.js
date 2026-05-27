// Playground config for the <udc-tile> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'label', label: 'Label', type: 'text', default: 'Upload CSV' },
    { key: 'body1', label: 'Body line 1', type: 'text', default: 'Import residents from a spreadsheet.' },
    { key: 'body2', label: 'Body line 2', type: 'text', default: '' },
    { key: 'required', label: 'Required dot', type: 'checkbox', default: true },
    { key: 'showChevron', label: 'Show chevron', type: 'checkbox', default: true },
    {
      key: 'state',
      label: 'State',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'selected', label: 'Selected' },
        { value: 'disabled', label: 'Disabled' },
      ],
    },
  ],
  render(s) {
    const attrs = [`label="${escAttr(s.label)}"`];
    if (s.required) attrs.push('required');
    if (!s.showChevron) attrs.push('no-chevron');
    if (s.state === 'selected') attrs.push('selected');
    if (s.state === 'disabled') attrs.push('disabled');

    const body = [];
    if (s.body1) body.push(`  ${escText(s.body1)}`);
    if (s.body2) body.push(`  ${escText(s.body2)}`);

    const html = `<udc-tile\n  ${attrs.join('\n  ')}\n>\n${body.join('\n')}\n</udc-tile>`;
    return { html, code: html };
  },
};
