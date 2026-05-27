// Playground config for the <udc-pagination> Web Component.

export default {
  controls: [
    {
      key: 'page',
      label: 'Current page',
      type: 'select',
      default: '1',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
      ],
    },
    {
      key: 'totalPages',
      label: 'Total pages',
      type: 'select',
      default: '3',
      options: [
        { value: '3', label: '3' },
        { value: '5', label: '5' },
        { value: '10', label: '10' },
      ],
    },
    { key: 'showMeta', label: 'Show meta row', type: 'checkbox', default: true },
  ],
  render(s) {
    const attrs = [];
    attrs.push(`page="${parseInt(s.page, 10) || 1}"`);
    attrs.push(`total-pages="${parseInt(s.totalPages, 10) || 3}"`);
    if (s.showMeta) {
      attrs.push('show-meta');
      attrs.push('rows-per-page="50"');
      attrs.push('total-items="100"');
    }
    const html = `<udc-pagination\n  ${attrs.join('\n  ')}\n></udc-pagination>`;
    return { html, code: html };
  },
};
