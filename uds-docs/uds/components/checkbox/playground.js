// Playground config for the <udc-checkbox> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'checked', label: 'Checked', type: 'checkbox', default: false },
    { key: 'indeterminate', label: 'Indeterminate', type: 'checkbox', default: false },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    { key: 'required', label: 'Required', type: 'checkbox', default: false },
    { key: 'error', label: 'Error state', type: 'checkbox', default: false },
    { key: 'label', label: 'Label text', type: 'text', default: 'Option label' },
  ],
  render(s) {
    const attrs = [];
    if (s.checked) attrs.push('checked');
    if (s.indeterminate) attrs.push('indeterminate');
    if (s.disabled) attrs.push('disabled');
    if (s.required) attrs.push('required');
    if (s.error) attrs.push('state="error"');

    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
    const html = `<udc-checkbox${attrStr}>${escText(s.label)}</udc-checkbox>`;
    return { html, code: html };
  },
};
