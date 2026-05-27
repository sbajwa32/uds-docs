// Playground config for the <udc-data-table> Web Component.

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, prominent: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'date', label: 'Order date', sortable: true },
  { key: 'amount', label: 'Amount', align: 'right', sortable: true },
];

const ROWS = [
  { name: 'Brian Smith', status: 'Delivered', date: '2026-02-12', amount: '$75' },
  { name: 'Mia Chen', status: 'Pending', date: '2026-02-13', amount: '$42' },
  { name: 'Aria Johnson', status: 'Cancelled', date: '2026-02-13', amount: '$0' },
  { name: 'Carlos Rivera', status: 'Delivered', date: '2026-02-14', amount: '$128' },
  { name: 'Priya Patel', status: 'Delivered', date: '2026-02-15', amount: '$36' },
];

export default {
  controls: [
    {
      key: 'rowCount',
      label: 'Row count',
      type: 'select',
      default: '5',
      options: [
        { value: '3', label: '3' },
        { value: '5', label: '5' },
      ],
    },
    { key: 'striped', label: 'Striped rows', type: 'checkbox', default: false },
    { key: 'selectable', label: 'Selectable rows', type: 'checkbox', default: true },
    {
      key: 'sortKey',
      label: 'Initial sort column',
      type: 'select',
      default: '',
      options: [
        { value: '', label: 'None' },
        { value: 'name', label: 'Name' },
        { value: 'amount', label: 'Amount' },
      ],
    },
    {
      key: 'sortDirection',
      label: 'Initial sort direction',
      type: 'select',
      default: 'asc',
      options: [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' },
      ],
    },
  ],
  render(s) {
    const count = parseInt(s.rowCount, 10) || 5;
    const columnsJson = JSON.stringify(COLUMNS);
    const rowsJson = JSON.stringify(ROWS.slice(0, count));

    const attrs = [`columns='${columnsJson}'`, `rows='${rowsJson}'`];
    if (s.striped) attrs.push('striped');
    if (s.selectable) attrs.push('selectable');
    if (s.sortKey) {
      attrs.push(`sort-key="${s.sortKey}"`);
      attrs.push(`sort-direction="${s.sortDirection || 'asc'}"`);
    }

    const html = `<udc-data-table\n  ${attrs.join('\n  ')}\n></udc-data-table>`;
    return { html, code: html };
  },
};
