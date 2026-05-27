// Playground config for the <udc-combobox> Web Component.
// Combobox currently aliases Dropdown — filtering/autocomplete arrives later.

const OPTION_LABELS = ['Apartment A', 'Apartment B', 'Apartment C', 'Apartment D', 'Apartment E'];

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
    { key: 'label', label: 'Label text', type: 'text', default: 'Apartment' },
    { key: 'required', label: 'Required', type: 'checkbox', default: false },
    { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: false },
    { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'search' },
    { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Search apartments…' },
    { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: false },
    { key: 'helper', label: 'Helper text', type: 'text', default: 'Type to filter' },
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
    if (s.leadingIcon) attrs.push(`leading-icon="${escAttr(s.leadingName || 'search')}"`);
    if (s.showHelper) {
      attrs.push('show-helper');
      attrs.push(`helper-text="${escAttr(s.helper)}"`);
    }

    const optionsHtml = [];
    for (let i = 0; i < count; i++) {
      const label = OPTION_LABELS[i];
      const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      optionsHtml.push(`  <udc-combobox-option value="${escAttr(value)}">${escText(label)}</udc-combobox-option>`);
    }

    const html = `<udc-combobox\n  ${attrs.join('\n  ')}\n>\n${optionsHtml.join('\n')}\n</udc-combobox>`;
    return { html, code: html };
  },
};
