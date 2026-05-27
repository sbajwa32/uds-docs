// Playground config for the <udc-list> + <udc-list-item> Web Components.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const LABELS = [
  'Dashboard',
  'Leasing / CRM',
  'People / Contacts',
  'Property / Assets',
  'Accounting / Finance',
  'Compliance / Reporting',
  'Admin / Settings',
  'Reports',
  'Integrations',
  'Support',
];

export default {
  controls: [
    {
      key: 'itemCount',
      label: 'Items',
      type: 'select',
      default: '5',
      options: [
        { value: '3', label: '3' },
        { value: '5', label: '5' },
        { value: '7', label: '7' },
        { value: '10', label: '10' },
      ],
    },
    { key: 'leadingIconOn', label: 'Show leading icon', type: 'checkbox', default: false },
    { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: 'folder' },
    { key: 'trailingIconOn', label: 'Show trailing icon', type: 'checkbox', default: false },
    { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: 'chevron_right' },
    {
      key: 'selectedIdx',
      label: 'Selected item',
      type: 'select',
      default: '0',
      options: [
        { value: '0', label: '1st' },
        { value: '1', label: '2nd' },
        { value: '2', label: '3rd' },
        { value: 'none', label: 'None' },
      ],
    },
    { key: 'selectable', label: 'Selectable (listbox)', type: 'checkbox', default: false },
  ],
  render(s) {
    const count = parseInt(s.itemCount, 10) || 5;
    const selIdx = s.selectedIdx === 'none' ? -1 : parseInt(s.selectedIdx, 10);

    const listAttrs = [];
    if (s.selectable) listAttrs.push('selectable');

    const items = [];
    for (let i = 0; i < count; i++) {
      const label = LABELS[i % LABELS.length];
      const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const itemAttrs = [`value="${escAttr(value)}"`];
      if (i === selIdx) itemAttrs.push('selected');
      if (s.leadingIconOn) itemAttrs.push(`leading-icon="${escAttr(s.leadingIcon || 'folder')}"`);
      if (s.trailingIconOn) itemAttrs.push(`trailing-icon="${escAttr(s.trailingIcon || 'chevron_right')}"`);
      items.push(`  <udc-list-item ${itemAttrs.join(' ')}>${escText(label)}</udc-list-item>`);
    }

    const listAttrStr = listAttrs.length ? ` ${listAttrs.join(' ')}` : '';
    const html = `<udc-list${listAttrStr}>\n${items.join('\n')}\n</udc-list>`;
    return { html, code: html };
  },
};
