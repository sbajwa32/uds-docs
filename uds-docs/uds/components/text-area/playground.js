// Playground config for the <udc-text-area> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default {
  controls: [
    { key: 'label', label: 'Label', type: 'text', default: 'Notes' },
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Add notes…' },
    {
      key: 'state',
      label: 'State',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'focused', label: 'Focused' },
        { value: 'error', label: 'Error' },
        { value: 'error-focused', label: 'Error focused' },
      ],
    },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    { key: 'required', label: 'Required', type: 'checkbox', default: false },
    { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: true },
    { key: 'maxLength', label: 'Max length', type: 'text', default: '250' },
    { key: 'helper', label: 'Helper text', type: 'text', default: 'Optional internal note.' },
  ],
  render(s) {
    const attrs = [];
    attrs.push('show-label');
    attrs.push(`label="${escAttr(s.label)}"`);
    attrs.push(`placeholder="${escAttr(s.placeholder)}"`);
    if (s.state && s.state !== 'default') attrs.push(`state="${escAttr(s.state)}"`);
    if (s.disabled) attrs.push('disabled');
    if (s.required) attrs.push('required');
    if (s.helper) {
      attrs.push('show-helper');
      attrs.push(`helper-text="${escAttr(s.helper)}"`);
    }
    if (s.showCounter) {
      const max = parseInt(s.maxLength, 10);
      if (Number.isFinite(max) && max > 0) attrs.push(`max-length="${max}"`);
    }

    const html = `<udc-text-area\n  ${attrs.join('\n  ')}\n></udc-text-area>`;
    return { html, code: html };
  },
};
