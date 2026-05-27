// Playground config for the <udc-data-view> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'heading', label: 'Heading', type: 'text', default: 'Recent activity' },
    {
      key: 'body',
      label: 'Body content',
      type: 'select',
      default: 'cards',
      options: [
        { value: 'cards', label: 'Card grid' },
        { value: 'list', label: 'Item list' },
        { value: 'empty', label: 'Empty state' },
      ],
    },
    { key: 'showActions', label: 'Show actions', type: 'checkbox', default: true },
  ],
  render(s) {
    const heading = `heading="${escAttr(s.heading || 'Data View')}"`;

    let body = '';
    if (s.body === 'cards') {
      body = [
        '  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--uds-space-200);">',
        '    <div style="padding:var(--uds-space-200);background:var(--uds-color-surface-alt);border-radius:var(--uds-border-radius-input);">Record A</div>',
        '    <div style="padding:var(--uds-space-200);background:var(--uds-color-surface-alt);border-radius:var(--uds-border-radius-input);">Record B</div>',
        '    <div style="padding:var(--uds-space-200);background:var(--uds-color-surface-alt);border-radius:var(--uds-border-radius-input);">Record C</div>',
        '    <div style="padding:var(--uds-space-200);background:var(--uds-color-surface-alt);border-radius:var(--uds-border-radius-input);">Record D</div>',
        '  </div>',
      ].join('\n');
    } else if (s.body === 'list') {
      body = [
        '  <udc-list>',
        '    <udc-list-item value="alpha">Alpha</udc-list-item>',
        '    <udc-list-item value="beta">Beta</udc-list-item>',
        '    <udc-list-item value="gamma">Gamma</udc-list-item>',
        '  </udc-list>',
      ].join('\n');
    } else {
      body = '  <p style="color:var(--uds-color-text-secondary);">No records to display.</p>';
    }

    const actions = s.showActions
      ? [
          '  <udc-button slot="actions" variant="secondary">Export</udc-button>',
          '  <udc-button slot="actions" variant="primary">Refresh</udc-button>',
        ].join('\n')
      : '';

    const html = `<udc-data-view ${heading}>\n${body}${actions ? '\n' + actions : ''}\n</udc-data-view>`;
    return { html, code: html };
  },
};
