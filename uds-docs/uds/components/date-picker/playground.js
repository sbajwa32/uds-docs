// Playground config for the <udc-date-picker> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default {
  controls: [
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
    { key: 'showLabel', label: 'Show label', type: 'checkbox', default: true },
    { key: 'label', label: 'Label text', type: 'text', default: 'Move-in date' },
    { key: 'required', label: 'Required', type: 'checkbox', default: false },
    { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
    { key: 'helper', label: 'Helper text', type: 'text', default: 'Pick the day you take possession.' },
    { key: 'value', label: 'Value (YYYY-MM-DD)', type: 'text', default: '' },
    { key: 'min', label: 'Min (YYYY-MM-DD)', type: 'text', default: '' },
    { key: 'max', label: 'Max (YYYY-MM-DD)', type: 'text', default: '' },
  ],
  render(s) {
    const attrs = [];
    if (s.value) attrs.push(`value="${escAttr(s.value)}"`);
    if (s.min) attrs.push(`min="${escAttr(s.min)}"`);
    if (s.max) attrs.push(`max="${escAttr(s.max)}"`);
    if (s.state && s.state !== 'default') attrs.push(`state="${escAttr(s.state)}"`);
    if (s.disabled) attrs.push('disabled');
    if (s.required) attrs.push('required');
    if (s.showLabel) {
      attrs.push('show-label');
      attrs.push(`label="${escAttr(s.label)}"`);
    }
    if (s.showHelper) {
      attrs.push('show-helper');
      attrs.push(`helper-text="${escAttr(s.helper)}"`);
    }

    const html = attrs.length
      ? `<udc-date-picker\n  ${attrs.join('\n  ')}\n></udc-date-picker>`
      : `<udc-date-picker></udc-date-picker>`;
    return { html, code: html };
  },
};
