// Playground config for the <udc-tabs> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const LABELS = ['Overview', 'Details', 'History', 'Settings', 'Admin'];

export default {
  controls: [
    {
      key: 'count',
      label: 'Tab count',
      type: 'select',
      default: '3',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
      ],
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      default: 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'sm', label: 'Small' },
      ],
    },
    {
      key: 'disabledIdx',
      label: 'Disabled tab',
      type: 'select',
      default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: '1', label: 'Tab 2' },
        { value: '2', label: 'Tab 3' },
        { value: '3', label: 'Tab 4' },
      ],
    },
  ],
  render(s) {
    const n = parseInt(s.count, 10) || 3;
    const sizeAttr = s.size === 'sm' ? ' size="sm"' : '';
    const disIdx = s.disabledIdx === 'none' ? -1 : parseInt(s.disabledIdx, 10);

    const tabs = [];
    const panels = [];
    for (let i = 0; i < n; i++) {
      const label = LABELS[i];
      const panelId = `panel-${i}`;
      const isFirst = i === 0;
      const isDisabled = i === disIdx;
      const tabAttrs = [
        `slot="tab"`,
        `panel="${panelId}"`,
      ];
      if (isFirst) tabAttrs.push('selected');
      if (isDisabled) tabAttrs.push('disabled');
      tabs.push(`  <udc-tab ${tabAttrs.join(' ')}>${escText(label)}</udc-tab>`);
      panels.push(`  <udc-tab-panel slot="panel" panel="${panelId}"${isFirst ? ' selected' : ''}>${escText(label)} content</udc-tab-panel>`);
    }

    const html = `<udc-tabs${sizeAttr}>\n${tabs.join('\n')}\n${panels.join('\n')}\n</udc-tabs>`;
    return { html, code: html };
  },
};
