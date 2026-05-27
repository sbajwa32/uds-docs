// Playground config for the <udc-tooltip> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'text', label: 'Tooltip text', type: 'text', default: 'Helpful tooltip information' },
    {
      key: 'position',
      label: 'Position',
      type: 'select',
      default: 'top',
      options: [
        { value: 'top', label: 'Top' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    },
    { key: 'open', label: 'Always open (preview only)', type: 'checkbox', default: true },
  ],
  render(s) {
    const attrs = [];
    if (s.position && s.position !== 'top') attrs.push(`position="${escAttr(s.position)}"`);
    if (s.open) attrs.push('open');
    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';

    const padStyle = s.position === 'top' ? 'padding-top:64px;' : s.position === 'bottom' ? 'padding-bottom:64px;' : s.position === 'left' ? 'padding-left:200px;' : 'padding-right:200px;';
    const inner = `<udc-tooltip${attrStr}>\n  <udc-button slot="trigger" variant="secondary">Hover me</udc-button>\n  ${escText(s.text)}\n</udc-tooltip>`;
    const html = `<div style="display:flex;justify-content:center;${padStyle}">${inner}</div>`;
    return { html, code: inner };
  },
};
