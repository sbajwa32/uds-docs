// Playground config for the <udc-breadcrumb> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const NAMES = ['Home', 'Products', 'Category', 'Sub-category', 'Current Page'];

export default {
  controls: [
    {
      key: 'items',
      label: 'Items',
      type: 'select',
      default: '3',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
      ],
    },
    { key: 'frameless', label: 'Frameless', type: 'checkbox', default: false },
  ],
  render(s) {
    const n = parseInt(s.items, 10) || 3;
    const itemsJson = JSON.stringify(
      NAMES.slice(0, n).map((label, i) => ({
        label,
        ...(i < n - 1 ? { href: '#' } : {}),
      })),
    );

    const attrs = [`items='${itemsJson}'`];
    if (s.frameless) attrs.push('frameless');

    const html = `<udc-breadcrumb\n  ${attrs.join('\n  ')}\n></udc-breadcrumb>`;
    return { html, code: html };
  },
};
