// Playground config for the <udc-nav-vertical> + <udc-nav-item> Web Components.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const ITEMS = [
  { icon: 'space_dashboard', label: 'Dashboard' },
  { icon: 'book', label: 'Leasing / CRM' },
  { icon: 'contact_phone', label: 'People / Contacts' },
  { icon: 'home_work', label: 'Property / Assets' },
  { icon: 'monetization_on', label: 'Accounting / Finance' },
  { icon: 'summarize', label: 'Compliance / Reporting' },
  { icon: 'admin_panel_settings', label: 'Admin / Settings' },
];

export default {
  controls: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      default: 'list',
      options: [
        { value: 'list', label: 'List (default)' },
        { value: 'rail', label: 'Rail (compact)' },
      ],
    },
    { key: 'leadingIcons', label: 'Leading icons', type: 'checkbox', default: true },
    {
      key: 'itemCount',
      label: 'Item count',
      type: 'select',
      default: '5',
      options: [
        { value: '3', label: '3' },
        { value: '5', label: '5' },
        { value: '7', label: '7' },
      ],
    },
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
  ],
  render(s) {
    const n = parseInt(s.itemCount, 10) || 5;
    const selIdx = s.selectedIdx === 'none' ? -1 : parseInt(s.selectedIdx, 10);
    const items = ITEMS.slice(0, n);
    const containerAttrs = [];
    if (s.variant && s.variant !== 'list') containerAttrs.push(`variant="${escAttr(s.variant)}"`);
    if (!s.leadingIcons) containerAttrs.push('leading-icons="false"');
    containerAttrs.push('aria-label="Main navigation"');

    const itemMarkup = items
      .map((item, i) => {
        const attrs = [`icon="${escAttr(item.icon)}"`];
        if (i === selIdx) attrs.push('current');
        const label = s.variant === 'rail' ? item.label.split(' / ')[0] : item.label;
        return `  <udc-nav-item ${attrs.join(' ')}>${escText(label)}</udc-nav-item>`;
      })
      .join('\n');

    const html = `<udc-nav-vertical\n  ${containerAttrs.join('\n  ')}\n>\n${itemMarkup}\n</udc-nav-vertical>`;
    return { html, code: html };
  },
};
