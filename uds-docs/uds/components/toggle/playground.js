// Playground config for the <udc-toggle> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'label', label: 'Label', type: 'text', default: 'Email notifications' },
    { key: 'checked', label: 'Checked', type: 'checkbox', default: true },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
  ],
  render(s) {
    const attrs = [];
    if (s.checked) attrs.push('checked');
    if (s.disabled) attrs.push('disabled');
    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
    const html = `<udc-toggle${attrStr}>${escText(s.label)}</udc-toggle>`;
    return { html, code: html };
  },
};
