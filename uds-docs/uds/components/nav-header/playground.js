// Playground config for the nav-header component.
// Bento app-switcher controls removed in UDS 0.3 once Figma's canonical
// udc-nav-header stopped nesting _udc-nav-header_dropdown. The title-area
// is now a static pill that displays the current page title.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'titleOnly', label: 'Title-only mode (bare page title, no pill chrome)', type: 'checkbox', default: false },
        { key: 'showSearch', label: 'Show search', type: 'checkbox', default: true },
        { key: 'showMyWork', label: 'Show My Work', type: 'checkbox', default: true },
        { key: 'appName', label: 'Page title', type: 'text', default: 'Boardroom' }
      ],
      render(s) {
        var appName = esc(s.appName || 'Boardroom');
        var hl = ['<div class="udc-nav-header">'];
        hl.push('  <div class="udc-nav-header__left">');
        hl.push('    <div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:32px;color:var(--uds-color-icon-interactive);">apartment</span></div>');
        if (s.titleOnly) {
          hl.push('    <div class="udc-nav-title-area" data-title-only="true">' + appName + '</div>');
        } else {
          hl.push('    <div class="udc-nav-title-area">');
          hl.push('      <span class="material-symbols-outlined" style="color:var(--uds-color-icon-interactive);">dashboard</span>');
          hl.push('      ' + appName);
          hl.push('      <span class="material-symbols-outlined udc-nav-title-area__chevron">keyboard_arrow_down</span>');
          hl.push('    </div>');
        }
        hl.push('  </div>');
        if (s.showSearch) {
          hl.push('  <div class="udc-nav-header__center">');
          hl.push('    <div class="udc-nav-search">');
          hl.push('      <span class="material-symbols-outlined">auto_awesome</span>');
          hl.push('      <input class="udc-nav-search__input" type="text" placeholder="Search or ask a question">');
          hl.push('    </div>');
          hl.push('  </div>');
        }
        hl.push('  <div class="udc-nav-header__right">');
        if (s.showMyWork) {
          hl.push('    <button class="udc-nav-mywork"><span class="material-symbols-outlined">notifications_active</span> My Work <span class="udc-badge" data-variant="warning" style="width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;">5</span></button>');
        }
        hl.push('    <div class="udc-nav-account">');
        hl.push('      <button class="udc-button-ghost" data-icon-only aria-label="Notifications"><span class="material-symbols-outlined">notifications</span></button>');
        hl.push('      <button class="udc-button-ghost" data-icon-only aria-label="Settings"><span class="material-symbols-outlined">settings</span></button>');
        hl.push('      <button class="udc-button-ghost" data-icon-only aria-label="Account"><span class="material-symbols-outlined">account_circle</span></button>');
        hl.push('    </div>');
        hl.push('  </div>');
        hl.push('</div>');
        var code = hl.join('\n');
        var html = '<div style="background:var(--uds-color-surface-page);border-radius:8px;overflow:hidden;">' + code + '</div>';
        return { html: html, code: code };
      }
    };
