// Playground config for the <udc-text-input> Web Component.
// Renders the <udc-text-input> tag with the full attribute API.

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
    { key: 'label', label: 'Label text', type: 'text', default: 'Field label' },
    { key: 'required', label: 'Required', type: 'checkbox', default: false },
    { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: false },
    { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'search' },
    { key: 'trailingBtn', label: 'Trailing button', type: 'checkbox', default: false },
    { key: 'trailingName', label: 'Trailing icon', type: 'icon-search', default: 'close' },
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Enter value…' },
    { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
    { key: 'helper', label: 'Helper text', type: 'text', default: 'Helper text here' },
    { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: false },
    { key: 'maxLength', label: 'Max length', type: 'text', default: '20' },
  ],
  render(s) {
    const attrs = [];
    attrs.push(`placeholder="${escAttr(s.placeholder)}"`);
    if (s.state && s.state !== 'default') attrs.push(`state="${escAttr(s.state)}"`);
    if (s.disabled) attrs.push('disabled');
    if (s.required) attrs.push('required');
    if (s.showLabel) {
      attrs.push('show-label');
      attrs.push(`label="${escAttr(s.label)}"`);
    }
    if (s.leadingIcon) attrs.push(`leading-icon="${escAttr(s.leadingName || 'search')}"`);
    if (s.trailingBtn) attrs.push(`trailing-icon="${escAttr(s.trailingName || 'close')}"`);
    if (s.showHelper) {
      attrs.push('show-helper');
      attrs.push(`helper-text="${escAttr(s.helper)}"`);
    }
    if (s.showCounter) {
      const max = parseInt(s.maxLength, 10);
      if (Number.isFinite(max) && max > 0) attrs.push(`max-length="${max}"`);
    }

    const html = `<udc-text-input\n  ${attrs.join('\n  ')}\n></udc-text-input>`;
    return { html, code: html };
  },
};
