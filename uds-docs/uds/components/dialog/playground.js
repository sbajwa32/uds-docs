// Playground config for the <udc-dialog> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'heading', label: 'Heading', type: 'text', default: 'Dialog title' },
    {
      key: 'slots',
      label: 'Content slots',
      type: 'select',
      default: '1',
      options: [
        { value: '1', label: '1 slot' },
        { value: '2', label: '2 slots' },
        { value: '3', label: '3 slots' },
        { value: '4', label: '4 slots' },
      ],
    },
    { key: 'primaryLabel', label: 'Primary button', type: 'text', default: 'Confirm' },
    { key: 'secondaryLabel', label: 'Secondary button', type: 'text', default: 'Cancel' },
  ],
  render(s) {
    const count = parseInt(s.slots, 10) || 1;
    const slotLines = [];
    for (let i = 0; i < count; i++) {
      slotLines.push(
        `  <div style="background:var(--uds-color-surface-alt);padding:var(--uds-space-300);text-align:center;border-radius:4px;">Slot ${count === 1 ? '— Replace This' : i + 1}</div>`,
      );
    }

    const body = slotLines.join('\n');
    const actions = `  <udc-button slot="actions" variant="secondary">${escText(s.secondaryLabel)}</udc-button>\n  <udc-button slot="actions" variant="primary">${escText(s.primaryLabel)}</udc-button>`;

    const html = `<udc-dialog open heading="${escAttr(s.heading)}">\n${body}\n${actions}\n</udc-dialog>`;
    return { html, code: html };
  },
};
