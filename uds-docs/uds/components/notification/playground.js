// Playground config for the <udc-notification> Web Component.

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
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
        { value: 'warning', label: 'Warning' },
      ],
    },
    {
      key: 'style',
      label: 'Style',
      type: 'select',
      default: 'subtle',
      options: [
        { value: 'subtle', label: 'Subtle (default)' },
        { value: 'prominent', label: 'Prominent' },
        { value: 'inline', label: 'Inline' },
      ],
    },
    { key: 'message', label: 'Message', type: 'text', default: 'This is a notification message.' },
    { key: 'dismissible', label: 'Show close button', type: 'checkbox', default: false },
  ],
  render(s) {
    const attrs = [];
    if (s.tone && s.tone !== 'info') attrs.push(`tone="${escAttr(s.tone)}"`);
    if (s.style === 'prominent') attrs.push('variant="prominent"');
    if (s.style === 'inline') attrs.push('inline');
    if (s.dismissible) attrs.push('dismissible');
    const attrStr = attrs.length ? `\n  ${attrs.join('\n  ')}\n` : '';
    const html = attrs.length
      ? `<udc-notification${attrStr}>${escText(s.message)}</udc-notification>`
      : `<udc-notification>${escText(s.message)}</udc-notification>`;
    return { html, code: html };
  },
};
