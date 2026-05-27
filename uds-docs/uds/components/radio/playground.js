// Playground config for the <udc-radio-group> + <udc-radio> Web Components.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const OPTION_LABELS = ['Option A', 'Option B', 'Option C', 'Option D'];

export default {
  controls: [
    {
      key: 'count',
      label: 'Options',
      type: 'select',
      default: '3',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
    },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    { key: 'error', label: 'Error state', type: 'checkbox', default: false },
  ],
  render(s) {
    const n = parseInt(s.count, 10) || 3;
    const stateAttr = s.error ? ' state="error"' : '';
    const disAttr = s.disabled ? ' disabled' : '';

    const radios = [];
    for (let i = 0; i < n; i++) {
      const label = OPTION_LABELS[i];
      const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const checked = i === 0 ? ' checked' : '';
      radios.push(
        `  <udc-radio value="${escAttr(value)}"${checked}${disAttr}${stateAttr}>${escText(label)}</udc-radio>`,
      );
    }

    const html = `<udc-radio-group name="pg-radio" label="Choose one" value="${escAttr(OPTION_LABELS[0].toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">\n${radios.join('\n')}\n</udc-radio-group>`;
    return { html, code: html };
  },
};
