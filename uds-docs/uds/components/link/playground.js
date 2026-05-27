// Playground config for the <udc-link> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  controls: [
    { key: 'label', label: 'Label', type: 'text', default: 'View property' },
    { key: 'href', label: 'Href', type: 'text', default: '#' },
    { key: 'current', label: 'Current page', type: 'checkbox', default: false },
    { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    { key: 'newWindow', label: 'Open in new window', type: 'checkbox', default: false },
    { key: 'leadingIconOn', label: 'Show leading icon', type: 'checkbox', default: false },
    { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: 'open_in_new' },
    { key: 'trailingIconOn', label: 'Show trailing icon', type: 'checkbox', default: false },
    { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: 'chevron_right' },
  ],
  render(s) {
    const attrs = [];
    if (s.href && !s.disabled) attrs.push(`href="${escAttr(s.href)}"`);
    if (s.current) attrs.push('current');
    if (s.disabled) attrs.push('disabled');
    if (s.newWindow) attrs.push('new-window');
    if (s.leadingIconOn) attrs.push(`leading-icon="${escAttr(s.leadingIcon || 'open_in_new')}"`);
    if (s.trailingIconOn) attrs.push(`trailing-icon="${escAttr(s.trailingIcon || 'chevron_right')}"`);
    const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
    const html = `<udc-link${attrStr}>${escText(s.label)}</udc-link>`;
    return { html, code: html };
  },
};
