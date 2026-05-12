// Playground config for the nav-header component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'showSearch', label: 'Show search', type: 'checkbox', default: true },
        { key: 'showMyWork', label: 'Show My Work', type: 'checkbox', default: true },
        { key: 'showBento', label: 'Show bento dropdown', type: 'checkbox', default: false },
        { key: 'showTiles', label: 'Bento tiles', type: 'checkbox', default: true },
        { key: 'appName', label: 'App name', type: 'text', default: 'Boardroom' }
      ],
      render(s) {
        var appName = esc(s.appName || 'Boardroom');
        var hl = ['<div class="udc-nav-header">'];
        hl.push('  <div class="udc-nav-header__left">');
        hl.push('    <div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:32px;color:var(--uds-color-icon-interactive);">apartment</span></div>');
        hl.push('    <div class="udc-nav-bento-wrapper">');
        hl.push('      <button class="udc-nav-title-area" aria-expanded="' + (s.showBento ? 'true' : 'false') + '">');
        hl.push('        <span class="material-symbols-outlined" style="color:var(--uds-color-icon-interactive);">dashboard</span>');
        hl.push('        ' + appName);
        hl.push('        <span class="material-symbols-outlined udc-nav-title-area__chevron">keyboard_arrow_down</span>');
        hl.push('      </button>');
        if (s.showBento) {
          hl.push('      <div class="udc-nav-bento" data-open="true" style="position:relative;top:auto;">');
          if (s.showTiles) {
            hl.push('        <div class="udc-nav-bento__tiles">');
            hl.push('          <a class="udc-nav-tile" href="javascript:void(0)"><span class="material-symbols-outlined">home</span>Transaction</a>');
            hl.push('          <a class="udc-nav-tile" href="javascript:void(0)"><span class="material-symbols-outlined">assignment</span>Leads</a>');
            hl.push('        </div>');
          }
          hl.push('        <div class="udc-nav-bento__list">');
          hl.push('          <button class="udc-nav-button" aria-current="page"><span class="material-symbols-outlined">space_dashboard</span><span class="udc-nav-button__label">Dashboard</span></button>');
          hl.push('          <button class="udc-nav-button"><span class="material-symbols-outlined">book</span><span class="udc-nav-button__label">Leasing / CRM</span></button>');
          hl.push('        </div>');
          hl.push('      </div>');
        }
        hl.push('    </div>');
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
        hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">notifications</span></button>');
        hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">settings</span></button>');
        hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">account_circle</span></button>');
        hl.push('    </div>');
        hl.push('  </div>');
        hl.push('</div>');
        var code = hl.join('\n');
        var html = '<div style="background:var(--uds-color-surface-page);border-radius:8px;overflow:hidden;">' + code + '</div>';
        var rL = ["import { useState, useRef, useEffect } from 'react';", '', 'function NavHeader() {'];
        rL.push('  const [bentoOpen, setBentoOpen] = useState(false);');
        rL.push('  const bentoRef = useRef(null);');
        rL.push('  useEffect(() => {');
        rL.push('    const close = (e) => { if (bentoRef.current && !bentoRef.current.contains(e.target)) setBentoOpen(false); };');
        rL.push('    document.addEventListener("click", close);');
        rL.push('    return () => document.removeEventListener("click", close);');
        rL.push('  }, []);');
        rL.push('  return (');
        rL.push('    <div className="udc-nav-header">');
        rL.push('      <div className="udc-nav-header__left">');
        rL.push('        <div className="udc-nav-logo"><span className="material-symbols-outlined">apartment</span><span className="udc-nav-logo__text">Boardroom</span></div>');
        if (s.showBento) {
          rL.push('        <div className="udc-nav-bento-wrapper" ref={bentoRef}>');
          rL.push('          <button className="udc-nav-title-area" aria-expanded={bentoOpen} onClick={() => setBentoOpen(!bentoOpen)}>');
          rL.push('            <span className="material-symbols-outlined">dashboard</span> Apps');
          rL.push('            <span className="material-symbols-outlined udc-nav-title-area__chevron">keyboard_arrow_down</span>');
          rL.push('          </button>');
          rL.push('        </div>');
        }
        rL.push('      </div>');
        rL.push('      <div className="udc-nav-header__right">');
        rL.push('        <button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">notifications</span></button>');
        rL.push('        <button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">account_circle</span></button>');
        rL.push('      </div>');
        rL.push('    </div>');
        rL.push('  );');
        rL.push('}');

        var vL = ['<script setup>', "import { ref, onMounted, onUnmounted } from 'vue';", '', 'const bentoOpen = ref(false);', '</script>', '', '<template>'];
        vL.push('  <div class="udc-nav-header">');
        vL.push('    <div class="udc-nav-header__left">');
        vL.push('      <div class="udc-nav-logo"><span class="material-symbols-outlined">apartment</span><span class="udc-nav-logo__text">Boardroom</span></div>');
        vL.push('    </div>');
        vL.push('    <div class="udc-nav-header__right">');
        vL.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">notifications</span></button>');
        vL.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">account_circle</span></button>');
        vL.push('    </div>');
        vL.push('  </div>');
        vL.push('</template>');
        return { html: html, code: code };
      }
    };
