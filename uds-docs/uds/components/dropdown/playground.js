// Playground config for the <udc-dropdown> Web Component.
// Renders <udc-dropdown> + <udc-dropdown-item> tags; the component owns its
// internal markup and styling via shadow DOM.

const OPTION_LABELS = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    { key: 'label', label: 'Label text', type: 'text', default: 'Select option' },
    { key: 'required', label: 'Required', type: 'checkbox', default: false },
    { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: true },
    { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'add_circle_outline' },
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Choose…' },
    { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
    { key: 'helper', label: 'Helper text', type: 'text', default: 'Helper text' },
    { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: false },
    { key: 'counterText', label: 'Counter text', type: 'text', default: '0/1' },
    {
      key: 'itemCount',
      label: 'Options count',
      type: 'select',
      default: '3',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
      ],
    },
  ],
  render(s) {
    const count = parseInt(s.itemCount, 10) || 3;
    const attrs = [];
    attrs.push(`placeholder="${escAttr(s.placeholder)}"`);
    if (s.state && s.state !== 'default') attrs.push(`state="${escAttr(s.state)}"`);
    if (s.disabled) attrs.push('disabled');
    if (s.required) attrs.push('required');
    if (s.showLabel) {
      attrs.push('show-label');
      attrs.push(`label="${escAttr(s.label)}"`);
    }
    if (s.leadingIcon) attrs.push(`leading-icon="${escAttr(s.leadingName || 'add_circle_outline')}"`);
    if (s.showHelper) {
      attrs.push('show-helper');
      attrs.push(`helper-text="${escAttr(s.helper)}"`);
    }
    if (s.showCounter) {
      attrs.push('show-counter');
      attrs.push(`counter-text="${escAttr(s.counterText)}"`);
    }

    const itemsHtml = [];
    for (let i = 0; i < count; i++) {
      const label = OPTION_LABELS[i];
      const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      itemsHtml.push(`  <udc-dropdown-item value="${escAttr(value)}">${escText(label)}</udc-dropdown-item>`);
    }

    const html = `<udc-dropdown\n  ${attrs.join('\n  ')}\n>\n${itemsHtml.join('\n')}\n</udc-dropdown>`;

    return { html, code: html };
  },
};
