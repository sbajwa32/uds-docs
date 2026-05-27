// Playground config for the <udc-nav-header> Web Component.

function escAttr(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export default {
  controls: [
    { key: 'appName', label: 'Page title', type: 'text', default: 'Boardroom' },
    { key: 'titleOnly', label: 'Title-only mode', type: 'checkbox', default: false },
    { key: 'showSearch', label: 'Show search', type: 'checkbox', default: true },
    { key: 'showMyWork', label: 'Show My Work', type: 'checkbox', default: true },
    { key: 'myworkBadge', label: 'My Work badge', type: 'text', default: '5' },
  ],
  render(s) {
    const attrs = [];
    if (s.appName) attrs.push(`app-name="${escAttr(s.appName)}"`);
    if (s.titleOnly) attrs.push('title-only');
    if (!s.showSearch) attrs.push('show-search="false"');
    if (!s.showMyWork) attrs.push('show-mywork="false"');
    if (s.myworkBadge && s.showMyWork) attrs.push(`mywork-badge="${escAttr(s.myworkBadge)}"`);

    const html = attrs.length
      ? `<udc-nav-header\n  ${attrs.join('\n  ')}\n></udc-nav-header>`
      : `<udc-nav-header></udc-nav-header>`;
    return { html, code: html };
  },
};
