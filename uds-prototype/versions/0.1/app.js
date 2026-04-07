/* ==========================================================================
   UDS Design System — SPA Application Logic
   Router, tab system, playground engine, theme switcher
   ========================================================================== */

(function () {
  'use strict';

  const html = document.documentElement;

  /* ========================================================================
     1. THEME SWITCHER
     ======================================================================== */
  function dataKey(attr) {
    return attr.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }

  function setupGroup(htmlAttr, btnSelector) {
    const btnAttr = 'data-set-' + htmlAttr.replace(/^data-/, '');
    const key = dataKey(btnAttr);
    document.querySelectorAll(btnSelector).forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset[key];
        if (val) html.setAttribute(htmlAttr, val);
        else html.removeAttribute(htmlAttr);
        document.querySelectorAll(btnSelector).forEach(b => {
          b.classList.remove('udc-button-primary', 'active');
          b.classList.add('udc-button-secondary');
        });
        btn.classList.remove('udc-button-secondary');
        btn.classList.add('udc-button-primary', 'active');
        refreshPlaygrounds();
      });
    });
  }

  setupGroup('data-color-scheme', '[data-set-color-scheme]');
  setupGroup('data-theme', '[data-set-theme]');
  setupGroup('data-font', '[data-set-font]');
  setupGroup('data-font-scale', '[data-set-font-scale]');
  setupGroup('data-density', '[data-set-density]');

  /* ========================================================================
     2. COPY BUTTON UTILITY
     ======================================================================== */
  function buildCopyButton(getText) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sg-code-copy';
    btn.title = 'Copy code';
    btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
    btn.addEventListener('click', function () {
      var text = typeof getText === 'function' ? getText() : getText;
      navigator.clipboard.writeText(text).then(function () {
        btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        btn.setAttribute('data-copied', '');
        setTimeout(function () {
          btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
          btn.removeAttribute('data-copied');
        }, 1500);
      });
    });
    return btn;
  }

  /* ========================================================================
     2b. FRAMEWORK SELECTOR
     ======================================================================== */
  var currentFramework = localStorage.getItem('uds-framework') || 'html';

  function setFramework(fw) {
    currentFramework = fw;
    localStorage.setItem('uds-framework', fw);
    document.querySelectorAll('.sg-fw-btn').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.fw === fw ? 'true' : 'false');
    });
    document.querySelectorAll('[data-fw-panel]').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-fw-panel') === fw);
    });
    refreshPlaygrounds();
  }

  function buildFrameworkBar() {
    var bar = document.createElement('div');
    bar.className = 'sg-fw-bar';
    bar.innerHTML = '<span class="sg-fw-bar-label">Framework</span>';
    ['html', 'react', 'vue'].forEach(function (fw) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sg-fw-btn';
      btn.textContent = fw === 'html' ? 'HTML / CSS' : fw.charAt(0).toUpperCase() + fw.slice(1);
      btn.dataset.fw = fw;
      btn.setAttribute('aria-selected', fw === currentFramework ? 'true' : 'false');
      btn.addEventListener('click', function () { setFramework(fw); });
      bar.appendChild(btn);
    });
    return bar;
  }

  /* ========================================================================
     2c. FRAMEWORK CODE GENERATORS
     Each component has handcrafted React / Vue output — no string hacks.
     ======================================================================== */

  /* ========================================================================
     3. SPA ROUTER
     ======================================================================== */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [pageId, qs] = raw.split('?');
    const params = {};
    if (qs) qs.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      params[k] = decodeURIComponent(v || '');
    });
    return { pageId: pageId || 'getting-started', tab: params.tab || 'examples' };
  }

  function navigate(pageId, tab) {
    document.querySelectorAll('[data-page]').forEach(p => p.classList.remove('active'));
    const page = document.querySelector('[data-page="' + pageId + '"]');
    if (page) {
      page.classList.add('active');
    } else {
      const fallback = document.querySelector('[data-page="semantic-colors"]');
      if (fallback) fallback.classList.add('active');
      pageId = 'semantic-colors';
    }

    document.querySelectorAll('.sg-sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector('.sg-sidebar-link[href="#/' + pageId + '"]');
    if (link) link.classList.add('active');

    var defaultTab = page ? (page.getAttribute('data-default-tab') || 'examples') : 'examples';
    switchTab(pageId, tab || defaultTab);
    document.querySelector('.sg-main').scrollTo(0, 0);
  }

  document.querySelectorAll('.sg-sidebar-link[href^="#/"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const pageId = link.getAttribute('href').replace('#/', '');
      history.pushState(null, '', '#/' + pageId);
      var targetPage = document.querySelector('[data-page="' + pageId + '"]');
      var defaultTab = targetPage ? (targetPage.getAttribute('data-default-tab') || 'examples') : 'examples';
      navigate(pageId, defaultTab);
    });
  });

  window.addEventListener('hashchange', () => {
    const { pageId, tab } = parseHash();
    navigate(pageId, tab);
  });

  /* ========================================================================
     3. TAB SYSTEM
     ======================================================================== */
  function switchTab(pageId, tabId) {
    const page = document.querySelector('[data-page="' + pageId + '"]');
    if (!page) return;
    const tabs = page.querySelectorAll('.sg-page-tab');
    if (!tabs.length) return;

    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    page.querySelectorAll('[data-tab-panel]').forEach(p => p.classList.remove('active'));

    const tab = page.querySelector('.sg-page-tab[data-tab="' + tabId + '"]');
    const panel = page.querySelector('[data-tab-panel="' + tabId + '"]');
    if (tab) tab.setAttribute('aria-selected', 'true');
    if (panel) panel.classList.add('active');

    if (tabId === 'playground') initPlayground(pageId);
  }

  document.addEventListener('click', e => {
    const tab = e.target.closest('.sg-page-tab');
    if (!tab) return;
    e.preventDefault();
    const page = tab.closest('[data-page]');
    if (!page) return;
    const pageId = page.dataset.page;
    const tabId = tab.dataset.tab;
    const hashBase = '#/' + pageId;
    const newHash = tabId === 'examples' ? hashBase : hashBase + '?tab=' + tabId;
    history.replaceState(null, '', newHash);
    switchTab(pageId, tabId);
  });

  /* ========================================================================
     4. ICON PICKER (searchable dropdown for Material Symbols)
     ======================================================================== */
  const iconList = window.MATERIAL_ICONS || [];
  const MAX_RESULTS = 60;

  function buildIconPicker(defaultVal, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'sg-icon-picker';

    const selected = document.createElement('button');
    selected.type = 'button';
    selected.className = 'sg-icon-picker-trigger';
    selected.innerHTML = '<span class="material-symbols-outlined">' + (defaultVal || 'info') + '</span><span class="sg-icon-picker-name">' + (defaultVal || 'info') + '</span>';
    wrap.appendChild(selected);

    const dropdown = document.createElement('div');
    dropdown.className = 'sg-icon-picker-dropdown';
    dropdown.style.display = 'none';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'sg-icon-picker-search';
    searchInput.placeholder = 'Search icons…';
    searchInput.value = '';
    dropdown.appendChild(searchInput);

    const results = document.createElement('div');
    results.className = 'sg-icon-picker-results';
    dropdown.appendChild(results);
    wrap.appendChild(dropdown);

    let currentVal = defaultVal || 'info';
    let open = false;

    function renderResults(query) {
      const q = (query || '').toLowerCase().replace(/\s+/g, '_');
      const matches = q
        ? iconList.filter(n => n.includes(q)).slice(0, MAX_RESULTS)
        : iconList.slice(0, MAX_RESULTS);
      results.innerHTML = '';
      if (!matches.length) {
        results.innerHTML = '<div class="sg-icon-picker-empty">No icons found</div>';
        return;
      }
      matches.forEach(name => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'sg-icon-picker-item' + (name === currentVal ? ' active' : '');
        item.innerHTML = '<span class="material-symbols-outlined">' + name + '</span><span>' + name + '</span>';
        item.addEventListener('click', () => {
          currentVal = name;
          selected.innerHTML = '<span class="material-symbols-outlined">' + name + '</span><span class="sg-icon-picker-name">' + name + '</span>';
          closeDropdown();
          onChange(name);
        });
        results.appendChild(item);
      });
    }

    function openDropdown() {
      open = true;
      dropdown.style.display = '';
      searchInput.value = '';
      renderResults('');
      requestAnimationFrame(() => searchInput.focus());
    }

    function closeDropdown() {
      open = false;
      dropdown.style.display = 'none';
    }

    selected.addEventListener('click', e => {
      e.stopPropagation();
      if (open) closeDropdown(); else openDropdown();
    });

    searchInput.addEventListener('input', () => renderResults(searchInput.value));
    searchInput.addEventListener('click', e => e.stopPropagation());
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDropdown();
    });

    document.addEventListener('click', e => {
      if (open && !wrap.contains(e.target)) closeDropdown();
    });

    return wrap;
  }

  /* ========================================================================
     5. PLAYGROUND ENGINE
     ======================================================================== */
  const playgroundInited = {};

  function refreshPlaygrounds() {
    Object.keys(playgroundInited).forEach(id => {
      const cfg = PLAYGROUNDS[id];
      if (cfg && cfg._update) cfg._update();
    });
    refreshImplSections();
  }

  function initPlayground(pageId) {
    if (playgroundInited[pageId]) return;
    const cfg = PLAYGROUNDS[pageId];
    if (!cfg) return;

    const panel = document.querySelector('[data-page="' + pageId + '"] [data-tab-panel="playground"]');
    if (!panel) return;

    const previewEl = document.createElement('div');
    previewEl.className = 'sg-playground-preview';

    const controlsEl = document.createElement('div');
    controlsEl.className = 'sg-playground-controls';

    const codeEl = document.createElement('pre');
    codeEl.className = 'sg-playground-code';

    panel.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'sg-playground-layout';

    const left = document.createElement('div');
    left.className = 'sg-playground-left';
    left.appendChild(previewEl);
    left.appendChild(controlsEl);

    const right = document.createElement('div');
    right.className = 'sg-playground-right';
    right.appendChild(buildFrameworkBar());

    const codeWrap = document.createElement('div');
    codeWrap.className = 'sg-code-wrap';
    const copyBtn = buildCopyButton(function() { return codeEl.textContent; });
    codeWrap.appendChild(copyBtn);
    codeWrap.appendChild(codeEl);
    right.appendChild(codeWrap);

    layout.appendChild(left);
    layout.appendChild(right);
    panel.appendChild(layout);

    const state = {};
    cfg.controls.forEach(c => { state[c.key] = c.default; });

    function update() {
      const result = cfg.render(state);
      previewEl.innerHTML = result.html;
      var code = result.code;
      if (currentFramework === 'react' && result.reactCode) code = result.reactCode;
      else if (currentFramework === 'vue' && result.vueCode) code = result.vueCode;
      codeEl.textContent = code;
    }

    cfg.controls.forEach(ctrl => {
      const row = document.createElement('div');
      row.className = 'sg-pg-control';

      const label = document.createElement('label');
      label.className = 'sg-pg-label';
      label.textContent = ctrl.label;
      row.appendChild(label);

      if (ctrl.type === 'select') {
        const sel = document.createElement('select');
        sel.className = 'sg-pg-select';
        ctrl.options.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o.value;
          opt.textContent = o.label;
          if (o.value === ctrl.default) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', () => { state[ctrl.key] = sel.value; update(); });
        row.appendChild(sel);
      } else if (ctrl.type === 'checkbox') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'sg-pg-checkbox';
        cb.checked = !!ctrl.default;
        cb.addEventListener('change', () => { state[ctrl.key] = cb.checked; update(); });
        row.appendChild(cb);
      } else if (ctrl.type === 'text') {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'sg-pg-input';
        inp.value = ctrl.default || '';
        inp.addEventListener('input', () => { state[ctrl.key] = inp.value; update(); });
        row.appendChild(inp);
      } else if (ctrl.type === 'icon-search') {
        row.appendChild(buildIconPicker(ctrl.default || 'info', val => {
          state[ctrl.key] = val;
          update();
        }));
      }

      controlsEl.appendChild(row);
    });

    cfg._update = update;
    update();

    var implSection = buildImplSection(pageId);
    if (implSection) right.appendChild(implSection);

    playgroundInited[pageId] = true;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ========================================================================
     6. PLAYGROUND CONFIGS
     ======================================================================== */
  /* -------------------------------------------------------------------------
     Shared indenter — wraps code lines inside a Vue <template>
     ------------------------------------------------------------------------- */
  function vueWrap(body) {
    return '<template>\n' + body.split('\n').map(function (l) { return '  ' + l; }).join('\n') + '\n</template>';
  }

  const PLAYGROUNDS = {
    button: {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'primary', options: [
          { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'ghost', label: 'Ghost' }
        ]},
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'destructive', label: 'Destructive', type: 'checkbox', default: false },
        { key: 'showLeadingIcon', label: 'Show Leading Icon', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: 'add' },
        { key: 'showTrailingIcon', label: 'Show Trailing Icon', type: 'checkbox', default: false },
        { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: 'arrow_forward' },
        { key: 'iconOnly', label: 'Icon Only', type: 'checkbox', default: false },
        { key: 'iconOnlyName', label: 'Icon', type: 'icon-search', default: 'add' },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'selected', label: 'Selected', type: 'checkbox', default: false },
        { key: 'label', label: 'Label', type: 'text', default: 'Button label' }
      ],
      render(s) {
        const cls = 'udc-button-' + s.variant;
        const btnAttrs = [];
        if (s.size === 'sm') btnAttrs.push('data-size="sm"');
        if (s.disabled) btnAttrs.push('disabled');
        if (s.selected) btnAttrs.push('aria-selected="true"');

        if (s.iconOnly) {
          btnAttrs.push('data-icon-only');
          btnAttrs.push('aria-label="' + esc(s.label) + '"');
          const iconName = esc(s.iconOnlyName || 'add');
          const inner = '<span class="material-symbols-outlined">' + iconName + '</span>';
          const attrStr = btnAttrs.length ? ' ' + btnAttrs.join(' ') : '';
          const wrapOpen = s.destructive ? '<div data-btn-color="danger">\n  ' : '';
          const wrapClose = s.destructive ? '\n</div>' : '';
          const tag = '<button class="' + cls + '"' + attrStr + '>' + inner + '</button>';
          const html = s.destructive ? '<div data-btn-color="danger">' + tag + '</div>' : tag;
          const code = wrapOpen + tag + wrapClose;

          var rAttrs = [];
          rAttrs.push('className="' + cls + '"');
          if (s.size === 'sm') rAttrs.push('data-size="sm"');
          if (s.disabled) rAttrs.push('disabled');
          if (s.selected) rAttrs.push('aria-selected="true"');
          rAttrs.push('data-icon-only');
          rAttrs.push('aria-label="' + esc(s.label) + '"');
          var rBtn = '<button ' + rAttrs.join(' ') + '>\n  <span className="material-symbols-outlined">' + iconName + '</span>\n</button>';
          if (s.destructive) rBtn = '<div data-btn-color="danger">\n  ' + rBtn + '\n</div>';
          var reactCode = 'function IconButton() {\n  return (\n' + rBtn.split('\n').map(function(l){return '    '+l;}).join('\n') + '\n  );\n}';

          var vBody = code;
          var vueCode = vueWrap(vBody);
          return { html, code, reactCode, vueCode };
        }

        if (s.showLeadingIcon) btnAttrs.push('data-leading-icon');
        if (s.showTrailingIcon) btnAttrs.push('data-trailing-icon');
        const attrStr = btnAttrs.length ? ' ' + btnAttrs.join(' ') : '';

        let inner = '';
        if (s.showLeadingIcon) inner += '<span class="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span> ';
        inner += esc(s.label);
        if (s.showTrailingIcon) inner += ' <span class="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';

        const tag = '<button class="' + cls + '"' + attrStr + '>' + inner + '</button>';
        const wrapOpen = s.destructive ? '<div data-btn-color="danger">\n  ' : '';
        const wrapClose = s.destructive ? '\n</div>' : '';
        const html = s.destructive ? '<div data-btn-color="danger">' + tag + '</div>' : tag;
        const code = wrapOpen + tag + wrapClose;

        var rAttrs2 = [];
        rAttrs2.push('className="' + cls + '"');
        if (s.size === 'sm') rAttrs2.push('data-size="sm"');
        if (s.disabled) rAttrs2.push('disabled');
        if (s.selected) rAttrs2.push('aria-selected="true"');
        if (s.showLeadingIcon) rAttrs2.push('data-leading-icon');
        if (s.showTrailingIcon) rAttrs2.push('data-trailing-icon');
        var rInner = '';
        if (s.showLeadingIcon) rInner += '\n  <span className="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span>';
        rInner += '\n  ' + esc(s.label);
        if (s.showTrailingIcon) rInner += '\n  <span className="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';
        var rBtn2 = '<button ' + rAttrs2.join(' ') + '>' + rInner + '\n</button>';
        if (s.destructive) rBtn2 = '<div data-btn-color="danger">\n  ' + rBtn2 + '\n</div>';
        var reactCode2 = 'function MyButton() {\n  return (\n' + rBtn2.split('\n').map(function(l){return '    '+l;}).join('\n') + '\n  );\n}';

        var vueCode2 = vueWrap(code);
        return { html, code, reactCode: reactCode2, vueCode: vueCode2 };
      }
    },

    'text-input': {
      controls: [
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'error', label: 'Error' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'showLabel', label: 'Show label', type: 'checkbox', default: true },
        { key: 'label', label: 'Label text', type: 'text', default: 'Field label' },
        { key: 'required', label: 'Required', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: false },
        { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'search' },
        { key: 'trailingBtn', label: 'Trailing button', type: 'checkbox', default: false },
        { key: 'trailingName', label: 'Trailing icon', type: 'icon-search', default: 'close' },
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Enter value...' },
        { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
        { key: 'helper', label: 'Helper text', type: 'text', default: 'Helper text here' },
        { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: false },
        { key: 'counterText', label: 'Counter text', type: 'text', default: '0/20' }
      ],
      render(s) {
        const stateAttr = s.state === 'error' ? ' data-state="error"' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        const leadingIcon = '<span class="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span>';
        const trailingIcon = '<span class="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>';
        let h = '<div class="udc-text-input"' + stateAttr + ' style="max-width:340px;">\n';
        if (s.showLabel) {
          h += '  <label class="udc-text-input__label">' + esc(s.label);
          if (s.required) h += '\n    <span class="udc-text-input__required"></span>';
          h += '</label>\n';
        }
        h += '  <div class="udc-text-input__field">\n';
        if (s.leadingIcon) h += '    <span class="udc-text-input__leading-icon">' + leadingIcon + '</span>\n';
        h += '    <input type="text" placeholder="' + esc(s.placeholder) + '"' + disAttr + ' />\n';
        if (s.trailingBtn) h += '    <button class="udc-text-input__trailing-btn" type="button">' + trailingIcon + '</button>\n';
        h += '  </div>\n';
        if (s.showHelper || s.showCounter) {
          h += '  <div class="udc-text-input__helper">';
          if (s.showHelper) h += '<span>' + esc(s.helper) + '</span>';
          if (s.showCounter) h += '<span class="udc-text-input__counter">' + esc(s.counterText) + '</span>';
          h += '</div>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function TextInput() {');
        rLines.push('  const [value, setValue] = useState(\'\');');
        if (s.state === 'error') rLines.push('  const [error, setError] = useState(true);');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-text-input"' + (s.state === 'error' ? ' data-state={error ? "error" : undefined}' : '') + '>');
        if (s.showLabel) {
          var reqJsx = s.required ? '<span className="udc-text-input__required" />' : '';
          rLines.push('      <label className="udc-text-input__label">' + esc(s.label) + reqJsx + '</label>');
        }
        rLines.push('      <div className="udc-text-input__field">');
        if (s.leadingIcon) rLines.push('        <span className="udc-text-input__leading-icon"><span className="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span></span>');
        rLines.push('        <input');
        rLines.push('          type="text"');
        rLines.push('          placeholder="' + esc(s.placeholder) + '"');
        rLines.push('          value={value}');
        rLines.push('          onChange={(e) => setValue(e.target.value)}');
        if (s.disabled) rLines.push('          disabled');
        rLines.push('        />');
        if (s.trailingBtn) {
          rLines.push('        <button');
          rLines.push('          className="udc-text-input__trailing-btn"');
          rLines.push('          type="button"');
          rLines.push('          onClick={() => setValue(\'\')}');
          rLines.push('        >');
          rLines.push('          <span className="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>');
          rLines.push('        </button>');
        }
        rLines.push('      </div>');
        if (s.showHelper || s.showCounter) {
          rLines.push('      <div className="udc-text-input__helper">');
          if (s.showHelper) rLines.push('        <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) rLines.push('        <span className="udc-text-input__counter">{value.length}/20</span>');
          rLines.push('      </div>');
        }
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');
        var reactCode = rLines.join('\n');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push("const value = ref('');");
        if (s.state === 'error') vLines.push('const error = ref(true);');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-text-input"' + (s.state === 'error' ? ' :data-state="error ? \'error\' : undefined"' : '') + '>');
        if (s.showLabel) {
          var reqVue = s.required ? '<span class="udc-text-input__required" />' : '';
          vLines.push('    <label class="udc-text-input__label">' + esc(s.label) + reqVue + '</label>');
        }
        vLines.push('    <div class="udc-text-input__field">');
        if (s.leadingIcon) vLines.push('      <span class="udc-text-input__leading-icon"><span class="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span></span>');
        var vInputAttrs = 'type="text" placeholder="' + esc(s.placeholder) + '" v-model="value"';
        if (s.disabled) vInputAttrs += ' disabled';
        vLines.push('      <input ' + vInputAttrs + ' />');
        if (s.trailingBtn) {
          vLines.push('      <button class="udc-text-input__trailing-btn" type="button" @click="value = \'\'">');
          vLines.push('        <span class="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>');
          vLines.push('      </button>');
        }
        vLines.push('    </div>');
        if (s.showHelper || s.showCounter) {
          vLines.push('    <div class="udc-text-input__helper">');
          if (s.showHelper) vLines.push('      <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) vLines.push('      <span class="udc-text-input__counter">{{ value.length }}/20</span>');
          vLines.push('    </div>');
        }
        vLines.push('  </div>');
        vLines.push('</template>');
        var vueCode = vLines.join('\n');

        return { html: h, code: h, reactCode, vueCode };
      }
    },

    checkbox: {
      controls: [
        { key: 'checked', label: 'Checked', type: 'checkbox', default: false },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'error', label: 'Error state', type: 'checkbox', default: false },
        { key: 'label', label: 'Label text', type: 'text', default: 'Option label' }
      ],
      render(s) {
        const errAttr = s.error ? ' data-state="error"' : '';
        const chkAttr = s.checked ? ' checked' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        const code = '<label class="udc-checkbox"' + errAttr + '>\n  <input type="checkbox"' + chkAttr + disAttr + ' />\n  <span class="udc-checkbox__control"></span>\n  <span class="udc-checkbox__label">' + esc(s.label) + '</span>\n</label>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function MyCheckbox() {');
        rLines.push('  const [checked, setChecked] = useState(' + (s.checked ? 'true' : 'false') + ');');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <label className="udc-checkbox"' + (s.error ? ' data-state="error"' : '') + '>');
        rLines.push('      <input');
        rLines.push('        type="checkbox"');
        rLines.push('        checked={checked}');
        rLines.push('        onChange={(e) => setChecked(e.target.checked)}');
        if (s.disabled) rLines.push('        disabled');
        rLines.push('      />');
        rLines.push('      <span className="udc-checkbox__control" />');
        rLines.push('      <span className="udc-checkbox__label">' + esc(s.label) + '</span>');
        rLines.push('    </label>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const checked = ref(' + (s.checked ? 'true' : 'false') + ');');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <label class="udc-checkbox"' + (s.error ? ' data-state="error"' : '') + '>');
        var vChkAttrs = 'type="checkbox" v-model="checked"';
        if (s.disabled) vChkAttrs += ' disabled';
        vLines.push('    <input ' + vChkAttrs + ' />');
        vLines.push('    <span class="udc-checkbox__control" />');
        vLines.push('    <span class="udc-checkbox__label">' + esc(s.label) + '</span>');
        vLines.push('  </label>');
        vLines.push('</template>');

        return { html: code, code, reactCode: rLines.join('\n'), vueCode: vLines.join('\n') };
      }
    },

    radio: {
      controls: [
        { key: 'count', label: 'Options', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'error', label: 'Error state', type: 'checkbox', default: false }
      ],
      render(s) {
        const n = parseInt(s.count, 10);
        const labels = ['Option A', 'Option B', 'Option C', 'Option D'];
        const errAttr = s.error ? ' data-state="error"' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        let h = '<div class="udc-radio-group" role="radiogroup" aria-labelledby="pg-radio-legend">\n';
        h += '  <span class="udc-radio-group__legend" id="pg-radio-legend">Choose one</span>\n';
        for (let i = 0; i < n; i++) {
          const chk = i === 0 ? ' checked' : '';
          h += '  <label class="udc-radio"' + errAttr + '>\n    <input type="radio" name="pg-radio" value="' + i + '"' + chk + disAttr + ' />\n    <span class="udc-radio__control"></span>\n    <span class="udc-radio__label">' + labels[i] + '</span>\n  </label>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function RadioGroup() {');
        rLines.push("  const [selected, setSelected] = useState('0');");
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-radio-group" role="radiogroup" aria-labelledby="legend">');
        rLines.push('      <span className="udc-radio-group__legend" id="legend">Choose one</span>');
        for (var ri = 0; ri < n; ri++) {
          rLines.push('      <label className="udc-radio"' + (s.error ? ' data-state="error"' : '') + '>');
          rLines.push('        <input');
          rLines.push('          type="radio"');
          rLines.push('          name="choice"');
          rLines.push('          value="' + ri + '"');
          rLines.push("          checked={selected === '" + ri + "'}");
          rLines.push("          onChange={() => setSelected('" + ri + "')}");
          if (s.disabled) rLines.push('          disabled');
          rLines.push('        />');
          rLines.push('        <span className="udc-radio__control" />');
          rLines.push('        <span className="udc-radio__label">' + labels[ri] + '</span>');
          rLines.push('      </label>');
        }
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push("const selected = ref('0');");
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-radio-group" role="radiogroup" aria-labelledby="legend">');
        vLines.push('    <span class="udc-radio-group__legend" id="legend">Choose one</span>');
        for (var vi = 0; vi < n; vi++) {
          vLines.push('    <label class="udc-radio"' + (s.error ? ' data-state="error"' : '') + '>');
          var vRadioAttrs = 'type="radio" name="choice" value="' + vi + '" v-model="selected"';
          if (s.disabled) vRadioAttrs += ' disabled';
          vLines.push('      <input ' + vRadioAttrs + ' />');
          vLines.push('      <span class="udc-radio__control" />');
          vLines.push('      <span class="udc-radio__label">' + labels[vi] + '</span>');
          vLines.push('    </label>');
        }
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h, reactCode: rLines.join('\n'), vueCode: vLines.join('\n') };
      }
    },

    badge: {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default (Info)' }, { value: 'secondary', label: 'Secondary' },
          { value: 'success', label: 'Success' }, { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]},
        { key: 'prominent', label: 'Prominent', type: 'checkbox', default: true },
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'label', label: 'Label', type: 'text', default: 'Badge' }
      ],
      render(s) {
        const attrs = [];
        if (s.variant !== 'default') attrs.push('data-variant="' + s.variant + '"');
        if (!s.prominent) attrs.push('data-prominent="false"');
        if (s.size === 'sm') attrs.push('data-size="sm"');
        const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
        const code = '<span class="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>';

        var rCode = '<span className="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>';
        var vCode = vueWrap(code);
        return { html: code, code, reactCode: rCode, vueCode: vCode };
      }
    },

    breadcrumb: {
      controls: [
        { key: 'items', label: 'Items', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]},
        { key: 'frameless', label: 'Frameless', type: 'checkbox', default: false }
      ],
      render(s) {
        const n = parseInt(s.items, 10);
        const names = ['Home', 'Products', 'Category', 'Sub-category', 'Current Page'];
        const fl = s.frameless ? ' data-frameless' : '';
        let h = '<nav class="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">\n  <ol>\n';
        for (let i = 0; i < n; i++) {
          if (i < n - 1) h += '    <li><a href="#">' + names[i] + '</a></li>\n';
          else h += '    <li aria-current="page">' + names[i] + '</li>\n';
        }
        h += '  </ol>\n</nav>';

        var rLines = [];
        rLines.push('function Breadcrumb() {');
        rLines.push('  const items = [');
        for (var bi = 0; bi < n; bi++) {
          if (bi < n - 1) rLines.push("    { label: '" + names[bi] + "', href: '#' },");
          else rLines.push("    { label: '" + names[bi] + "' },");
        }
        rLines.push('  ];');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <nav className="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">');
        rLines.push('      <ol>');
        rLines.push('        {items.map((item, i) => (');
        rLines.push('          <li key={i} aria-current={i === items.length - 1 ? "page" : undefined}>');
        rLines.push('            {item.href ? <a href={item.href}>{item.label}</a> : item.label}');
        rLines.push('          </li>');
        rLines.push('        ))}');
        rLines.push('      </ol>');
        rLines.push('    </nav>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push('const items = [');
        for (var bv = 0; bv < n; bv++) {
          if (bv < n - 1) vLines.push("  { label: '" + names[bv] + "', href: '#' },");
          else vLines.push("  { label: '" + names[bv] + "' },");
        }
        vLines.push('];');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <nav class="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">');
        vLines.push('    <ol>');
        vLines.push('      <li');
        vLines.push('        v-for="(item, i) in items"');
        vLines.push('        :key="i"');
        vLines.push('        :aria-current="i === items.length - 1 ? \'page\' : undefined"');
        vLines.push('      >');
        vLines.push('        <a v-if="item.href" :href="item.href">{{ item.label }}</a>');
        vLines.push('        <template v-else>{{ item.label }}</template>');
        vLines.push('      </li>');
        vLines.push('    </ol>');
        vLines.push('  </nav>');
        vLines.push('</template>');

        return { html: h, code: h, reactCode: rLines.join('\n'), vueCode: vLines.join('\n') };
      }
    },

    tabs: {
      controls: [
        { key: 'count', label: 'Tab count', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]},
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'disabledIdx', label: 'Disabled tab', type: 'select', default: 'none', options: [
          { value: 'none', label: 'None' }, { value: '1', label: 'Tab 2' }, { value: '2', label: 'Tab 3' }, { value: '3', label: 'Tab 4' }
        ]}
      ],
      render(s) {
        const n = parseInt(s.count, 10);
        const labels = ['Overview', 'Details', 'History', 'Settings', 'Admin'];
        const sizeAttr = s.size === 'sm' ? ' data-size="sm"' : '';
        const disIdx = s.disabledIdx === 'none' ? -1 : parseInt(s.disabledIdx, 10);
        let h = '<div class="udc-tabs" role="tablist"' + sizeAttr + '>\n';
        for (let i = 0; i < n; i++) {
          const sel = i === 0 ? ' aria-selected="true"' : '';
          const dis = i === disIdx ? ' disabled' : '';
          h += '  <button class="udc-tab" role="tab"' + sel + dis + '>' + labels[i] + '</button>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function Tabs() {');
        rLines.push('  const [active, setActive] = useState(0);');
        rLines.push("  const tabs = [" + labels.slice(0,n).map(function(l){return "'"+l+"'";}).join(', ') + "];");
        if (disIdx >= 0) rLines.push('  const disabledIdx = ' + disIdx + ';');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-tabs" role="tablist"' + sizeAttr + '>');
        rLines.push('      {tabs.map((label, i) => (');
        rLines.push('        <button');
        rLines.push('          key={i}');
        rLines.push('          className="udc-tab"');
        rLines.push('          role="tab"');
        rLines.push('          aria-selected={i === active}');
        rLines.push('          onClick={() => setActive(i)}');
        if (disIdx >= 0) rLines.push('          disabled={i === disabledIdx}');
        rLines.push('        >');
        rLines.push('          {label}');
        rLines.push('        </button>');
        rLines.push('      ))}');
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const active = ref(0);');
        vLines.push("const tabs = [" + labels.slice(0,n).map(function(l){return "'"+l+"'";}).join(', ') + "];");
        if (disIdx >= 0) vLines.push('const disabledIdx = ' + disIdx + ';');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-tabs" role="tablist"' + sizeAttr + '>');
        vLines.push('    <button');
        vLines.push('      v-for="(label, i) in tabs"');
        vLines.push('      :key="i"');
        vLines.push('      class="udc-tab"');
        vLines.push('      role="tab"');
        vLines.push('      :aria-selected="i === active"');
        vLines.push('      @click="active = i"');
        if (disIdx >= 0) vLines.push('      :disabled="i === disabledIdx"');
        vLines.push('    >');
        vLines.push('      {{ label }}');
        vLines.push('    </button>');
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h, reactCode: rLines.join('\n'), vueCode: vLines.join('\n') };
      }
    },

    divider: {
      controls: [
        { key: 'padding', label: 'Padding', type: 'select', default: 'default', options: [
          { value: 'default', label: 'sm (default)' }, { value: 'md', label: 'md' }, { value: 'lg', label: 'lg' }, { value: 'xl', label: 'xl' }
        ]}
      ],
      render(s) {
        const padAttr = s.padding !== 'default' ? ' data-padding="' + s.padding + '"' : '';
        const code = '<hr class="udc-divider-horizontal"' + padAttr + ' />';
        const html = '<div style="width:100%;"><p style="font-size:13px;color:var(--uds-color-text-secondary);">Content above</p>' + code + '<p style="font-size:13px;color:var(--uds-color-text-secondary);">Content below</p></div>';
        var reactCode = '<hr className="udc-divider-horizontal"' + padAttr + ' />';
        var vueCode = vueWrap(code);
        return { html, code, reactCode, vueCode };
      }
    },

    'icon-wrapper': {
      controls: [
        { key: 'icon', label: 'Icon', type: 'icon-search', default: 'info' },
        { key: 'size', label: 'Size', type: 'select', default: '24', options: [
          { value: '16', label: '16' }, { value: '20', label: '20' }, { value: '24', label: '24 (default)' },
          { value: '32', label: '32' }, { value: '48', label: '48' }, { value: '64', label: '64' }
        ]},
        { key: 'color', label: 'Color', type: 'select', default: 'interactive', options: [
          { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' },
          { value: 'interactive', label: 'Interactive' }, { value: 'success', label: 'Success' },
          { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]}
      ],
      render(s) {
        const sizeAttr = s.size !== '24' ? ' data-size="' + s.size + '"' : '';
        const colorToken = 'var(--uds-color-icon-' + s.color + ')';
        const icon = '<span class="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>';
        const code = '<span class="udc-icon-wrapper"' + sizeAttr + ' style="color:' + colorToken + ';">\n  ' + icon + '\n</span>';
        var reactCode = '<span\n  className="udc-icon-wrapper"\n' + (sizeAttr ? '  ' + sizeAttr + '\n' : '') + '  style={{ color: \'' + colorToken + '\' }}\n>\n  <span className="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>\n</span>';
        var vueCode = vueWrap(code);
        return { html: code, code, reactCode, vueCode };
      }
    },

    spacer: {
      controls: [
        { key: 'size', label: 'Size', type: 'select', default: '200', options: [
          { value: '050', label: '050 (4px)' }, { value: '075', label: '075 (6px)' }, { value: '100', label: '100 (8px)' },
          { value: '150', label: '150 (12px)' }, { value: '200', label: '200 (16px)' }, { value: '300', label: '300 (24px)' },
          { value: '400', label: '400 (32px)' }, { value: '600', label: '600 (48px)' }
        ]}
      ],
      render(s) {
        const code = '<div class="udc-spacer" data-size="' + s.size + '"></div>';
        const html = '<div style="display:flex;align-items:center;gap:0;"><span class="udc-badge">Before</span><div class="udc-spacer" data-size="' + s.size + '" style="background:var(--uds-color-surface-info-subtle);outline:1px dashed var(--uds-color-border-interactive);"></div><span class="udc-badge" data-variant="success">After</span></div>';
        var reactCode = '<div className="udc-spacer" data-size="' + s.size + '" />';
        var vueCode = vueWrap(code);
        return { html, code, reactCode, vueCode };
      }
    },

    nav: {
      controls: [
        { key: 'subComponent', label: 'Sub-component', type: 'select', default: 'vertical', options: [
          { value: 'vertical', label: 'Nav Vertical (sidebar)' },
          { value: 'header', label: 'Nav Header' },
          { value: 'bento', label: 'Nav Bento (dropdown)' },
          { value: 'button-vertical', label: 'Nav Button Vertical (rail)' }
        ]},
        { key: 'itemCount', label: 'Item count', type: 'select', default: '5', options: [
          { value: '3', label: '3' }, { value: '5', label: '5' }, { value: '7', label: '7' }
        ]},
        { key: 'selectedIdx', label: 'Selected item', type: 'select', default: '0', options: [
          { value: '0', label: '1st' }, { value: '1', label: '2nd' }, { value: '2', label: '3rd' }, { value: 'none', label: 'None' }
        ]},
        { key: 'showTiles', label: 'Show bento tiles', type: 'checkbox', default: true },
        { key: 'showSearch', label: 'Show search (header)', type: 'checkbox', default: true },
        { key: 'appName', label: 'App name', type: 'text', default: 'Boardroom' }
      ],
      render(s) {
        var items = [
          { icon: 'space_dashboard', label: 'Dashboard' },
          { icon: 'book', label: 'Leasing / CRM' },
          { icon: 'contact_phone', label: 'People / Contacts' },
          { icon: 'home_work', label: 'Property / Assets' },
          { icon: 'monetization_on', label: 'Accounting / Finance' },
          { icon: 'summarize', label: 'Compliance / Reporting' },
          { icon: 'admin_panel_settings', label: 'Admin / Settings' }
        ].slice(0, parseInt(s.itemCount, 10));
        var selIdx = s.selectedIdx === 'none' ? -1 : parseInt(s.selectedIdx, 10);
        var appName = esc(s.appName || 'Boardroom');
        var html = '', code = '', reactCode = '', vueCode = '';

        if (s.subComponent === 'vertical') {
          var lines = ['<nav class="udc-nav-vertical" aria-label="Main navigation">'];
          items.forEach(function (item, i) {
            var sel = i === selIdx ? ' aria-selected="true"' : '';
            lines.push('  <button class="udc-nav-button"' + sel + '>');
            lines.push('    <span class="material-symbols-outlined">' + item.icon + '</span>');
            lines.push('    <span class="udc-nav-button__label">' + item.label + '</span>');
            lines.push('  </button>');
          });
          lines.push('</nav>');
          code = lines.join('\n');
          html = '<div style="max-width:240px;">' + code + '</div>';

          var rL = ["import { useState } from 'react';", '', 'const navItems = ['];
          items.forEach(function (item) { rL.push("  { icon: '" + item.icon + "', label: '" + item.label + "' },"); });
          rL.push('];', '', 'function NavVertical() {', '  const [selected, setSelected] = useState(' + (selIdx >= 0 ? selIdx : 'null') + ');', '', '  return (', '    <nav className="udc-nav-vertical" aria-label="Main navigation">');
          rL.push('      {navItems.map((item, i) => (', '        <button', '          key={i}', '          className="udc-nav-button"', '          aria-selected={selected === i}', '          onClick={() => setSelected(i)}', '        >', '          <span className="material-symbols-outlined">{item.icon}</span>', '          <span className="udc-nav-button__label">{item.label}</span>', '        </button>', '      ))}', '    </nav>', '  );', '}');
          reactCode = rL.join('\n');

          var vL = ['<script setup>', "import { ref } from 'vue';", '', 'const selected = ref(' + (selIdx >= 0 ? selIdx : 'null') + ');', 'const navItems = ['];
          items.forEach(function (item) { vL.push("  { icon: '" + item.icon + "', label: '" + item.label + "' },"); });
          vL.push('];', '</script>', '', '<template>', '  <nav class="udc-nav-vertical" aria-label="Main navigation">', '    <button', '      v-for="(item, i) in navItems" :key="i"', '      class="udc-nav-button"', '      :aria-selected="selected === i"', '      @click="selected = i"', '    >', '      <span class="material-symbols-outlined">{{ item.icon }}</span>', '      <span class="udc-nav-button__label">{{ item.label }}</span>', '    </button>', '  </nav>', '</template>');
          vueCode = vL.join('\n');

        } else if (s.subComponent === 'header') {
          var hl = ['<div class="udc-nav-header">'];
          hl.push('  <div class="udc-nav-header__left">');
          hl.push('    <div class="udc-nav-logo">');
          hl.push('      <span class="material-symbols-outlined" style="font-size:32px;color:var(--uds-color-icon-interactive);">apartment</span>');
          hl.push('    </div>');
          hl.push('    <button class="udc-nav-bento-button">');
          hl.push('      <span class="material-symbols-outlined" style="color:var(--uds-color-icon-interactive);">dashboard</span>');
          hl.push('      ' + appName);
          hl.push('      <span class="material-symbols-outlined udc-nav-bento-button__chevron">keyboard_arrow_down</span>');
          hl.push('    </button>');
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
          hl.push('    <div class="udc-nav-account">');
          hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">notifications</span></button>');
          hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">settings</span></button>');
          hl.push('      <button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">account_circle</span></button>');
          hl.push('    </div>');
          hl.push('  </div>');
          hl.push('</div>');
          code = hl.join('\n');
          html = '<div style="background:var(--uds-color-surface-page);border-radius:var(--uds-border-radius-container-lg);overflow:hidden;">' + code + '</div>';
          reactCode = code.replace(/class="/g, 'className="').replace(/<input ([^>]+)>/g, '<input $1 />');
          vueCode = vueWrap(code);

        } else if (s.subComponent === 'bento') {
          var bl = ['<div class="udc-nav-bento-wrapper">'];
          bl.push('  <button class="udc-nav-bento-button" aria-expanded="false" aria-haspopup="true">');
          bl.push('    <span class="material-symbols-outlined" style="color:var(--uds-color-icon-interactive);">dashboard</span>');
          bl.push('    ' + appName);
          bl.push('    <span class="material-symbols-outlined udc-nav-bento-button__chevron">keyboard_arrow_down</span>');
          bl.push('  </button>');
          bl.push('  <div class="udc-nav-bento" data-open="true" style="position:relative;top:auto;">');
          if (s.showTiles) {
            bl.push('    <div class="udc-nav-bento__tiles">');
            bl.push('      <a class="udc-nav-tile" href="javascript:void(0)"><span class="material-symbols-outlined">home</span>Transaction</a>');
            bl.push('      <a class="udc-nav-tile" href="javascript:void(0)"><span class="material-symbols-outlined">assignment</span>Leads</a>');
            bl.push('      <a class="udc-nav-tile" href="javascript:void(0)"><span class="material-symbols-outlined">monetization_on</span>Accounting</a>');
            bl.push('    </div>');
          }
          bl.push('    <div class="udc-nav-bento__list">');
          items.forEach(function (item, i) {
            var sel = i === selIdx ? ' aria-selected="true"' : '';
            bl.push('      <button class="udc-nav-button"' + sel + '><span class="material-symbols-outlined">' + item.icon + '</span><span class="udc-nav-button__label">' + item.label + '</span></button>');
          });
          bl.push('    </div>');
          bl.push('    <a class="udc-nav-bento__footer" href="javascript:void(0)">Customize menu</a>');
          bl.push('  </div>');
          bl.push('</div>');
          code = bl.join('\n');
          html = code;
          reactCode = code.replace(/class="/g, 'className="').replace(/javascript:void\(0\)/g, '#');
          vueCode = vueWrap(code);

        } else if (s.subComponent === 'button-vertical') {
          var vbl = [];
          items.slice(0, 3).forEach(function (item, i) {
            var sel = i === selIdx ? ' aria-selected="true"' : '';
            vbl.push('<button class="udc-nav-button-vertical"' + sel + '>');
            vbl.push('  <span class="material-symbols-outlined">' + item.icon + '</span>');
            vbl.push('  ' + item.label.split(' / ')[0]);
            vbl.push('</button>');
          });
          code = vbl.join('\n');
          html = '<div style="display:flex;gap:8px;">' + code + '</div>';
          reactCode = code.replace(/class="/g, 'className="');
          vueCode = vueWrap(code);
        }

        return { html: html, code: code, reactCode: reactCode, vueCode: vueCode };
      }
    }
  };

  /* ========================================================================
     6b. IMPLEMENTATION REFERENCE DATA
     ======================================================================== */
  var IMPL_DATA = {
    button: {
      cssFile: 'uds/components/button.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-surface-interactive-default','--uds-color-surface-interactive-hover',
          '--uds-color-surface-interactive-active','--uds-color-surface-interactive-disabled',
          '--uds-color-surface-interactive-none','--uds-color-surface-interactive-subtle-hover',
          '--uds-color-surface-interactive-subtle-active',
          '--uds-color-surface-interactive-red','--uds-color-surface-interactive-red-hover',
          '--uds-color-surface-interactive-red-active','--uds-color-surface-interactive-red-subtle-hover',
          '--uds-color-surface-interactive-red-subtle-active','--uds-color-surface-white',
          '--uds-color-text-inverse','--uds-color-text-brand','--uds-color-text-disabled-bold',
          '--uds-color-text-error',
          '--uds-color-border-interactive','--uds-color-border-error',
          '--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-medium'],
        'Space': ['--uds-space-075','--uds-space-100','--uds-space-150','--uds-space-200'],
        'Border': ['--uds-border-radius-input']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <!-- Primary -->\n  <button class="udc-button-primary">Save changes</button>\n\n  <!-- Secondary -->\n  <button class="udc-button-secondary">Cancel</button>\n\n  <!-- Ghost -->\n  <button class="udc-button-ghost">Learn more</button>\n\n  <!-- With leading icon -->\n  <button class="udc-button-primary" data-icon-position="leading">\n    <span class="material-symbols-outlined">add</span>\n    New item\n  </button>\n\n  <!-- Small + destructive -->\n  <div data-btn-color="danger">\n    <button class="udc-button-primary" data-size="sm">Delete</button>\n  </div>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Button({ variant = \'primary\', size, destructive, icon, iconPosition, disabled, children }) {\n  const cls = \'udc-button-\' + variant;\n  const attrs = {};\n  if (size) attrs[\'data-size\'] = size;\n  if (iconPosition) attrs[\'data-icon-position\'] = iconPosition;\n  if (disabled) attrs.disabled = true;\n\n  const btn = (\n    <button className={cls} {...attrs}>\n      {icon && iconPosition === \'leading\' && <span className=\"material-symbols-outlined\">{icon}</span>}\n      {children}\n      {icon && iconPosition === \'trailing\' && <span className=\"material-symbols-outlined\">{icon}</span>}\n    </button>\n  );\n\n  return destructive ? <div data-btn-color=\"danger\">{btn}</div> : btn;\n}\n\nexport default Button;\n\n/* Usage:\n  <Button variant=\"primary\" icon=\"add\" iconPosition=\"leading\">New item</Button>\n  <Button variant=\"secondary\">Cancel</Button>\n  <Button variant=\"primary\" destructive>Delete</Button>\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  variant: { type: String, default: \'primary\' },\n  size: String,\n  destructive: Boolean,\n  icon: String,\n  iconPosition: String,\n  disabled: Boolean,\n});\n</script>\n\n<template>\n  <div v-if=\"destructive\" data-btn-color=\"danger\">\n    <button :class=\"\'udc-button-\' + variant\" :data-size=\"size\" :data-icon-position=\"iconPosition\" :disabled=\"disabled\">\n      <span v-if=\"icon && iconPosition === \'leading\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n      <slot />\n      <span v-if=\"icon && iconPosition === \'trailing\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n    </button>\n  </div>\n  <button v-else :class=\"\'udc-button-\' + variant\" :data-size=\"size\" :data-icon-position=\"iconPosition\" :disabled=\"disabled\">\n    <span v-if=\"icon && iconPosition === \'leading\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n    <slot />\n    <span v-if=\"icon && iconPosition === \'trailing\'\" class=\"material-symbols-outlined\">{{ icon }}</span>\n  </button>\n</template>';
      }
    },

    'text-input': {
      cssFile: 'uds/components/text-input.css',
      jsFunc: 'initTextInput',
      tokens: {
        'Color': [
          '--uds-color-surface-main','--uds-color-surface-white',
          '--uds-color-surface-interactive-none','--uds-color-surface-interactive-disabled',
          '--uds-color-surface-interactive-subtle-hover','--uds-color-surface-interactive-subtle-active',
          '--uds-color-text-primary','--uds-color-text-secondary','--uds-color-text-disabled',
          '--uds-color-text-disabled-bold','--uds-color-text-error',
          '--uds-color-border-primary','--uds-color-border-error',
          '--uds-color-border-outline-focus-visible',
          '--uds-color-icon-secondary','--uds-color-icon-error'
        ],
        'Font': [
          '--uds-font-family','--uds-font-size-xs','--uds-font-size-sm','--uds-font-size-base',
          '--uds-font-line-height-xs','--uds-font-line-height-sm','--uds-font-line-height-base',
          '--uds-font-weight-regular','--uds-font-weight-medium','--uds-font-weight-bold'
        ],
        'Space': ['--uds-space-050','--uds-space-075','--uds-space-100'],
        'Border': ['--uds-border-radius-input']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-text-input">\n    <label class="udc-text-input__label">Email address</label>\n    <div class="udc-text-input__field">\n      <input type="email" placeholder="you@example.com" required />\n    </div>\n    <div class="udc-text-input__helper">\n      <span>We\'ll never share your email</span>\n    </div>\n  </div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState, useRef, useCallback } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction TextInput({ label, helper, placeholder, required, maxLength, disabled, state }) {\n  const [value, setValue] = useState(\'\');\n  const [error, setError] = useState(\'\');\n  const inputRef = useRef(null);\n\n  const validate = useCallback(() => {\n    if (required && !value.trim()) {\n      setError(\'This field is required\');\n      return;\n    }\n    setError(\'\');\n  }, [value, required]);\n\n  const dataState = error ? \'error\' : state;\n\n  return (\n    <div className=\"udc-text-input\" data-state={dataState || undefined}>\n      {label && <label className=\"udc-text-input__label\">{label}</label>}\n      <div className=\"udc-text-input__field\">\n        <input\n          ref={inputRef}\n          value={value}\n          onChange={e => setValue(e.target.value)}\n          onBlur={validate}\n          placeholder={placeholder}\n          required={required}\n          maxLength={maxLength}\n          disabled={disabled}\n        />\n      </div>\n      <div className=\"udc-text-input__helper\">\n        <span>{error || helper}</span>\n        {maxLength && <span className=\"udc-text-input__counter\">{value.length}/{maxLength}</span>}\n      </div>\n    </div>\n  );\n}\n\nexport default TextInput;';
      },
      vue: function () {
        return '<script setup>\nimport { ref, computed } from \'vue\';\n\nconst props = defineProps({\n  label: String,\n  helper: String,\n  placeholder: String,\n  required: Boolean,\n  maxLength: Number,\n  disabled: Boolean,\n  state: String,\n});\n\nconst value = ref(\'\');\nconst error = ref(\'\');\n\nfunction validate() {\n  if (props.required && !value.value.trim()) {\n    error.value = \'This field is required\';\n    return;\n  }\n  error.value = \'\';\n}\n\nconst dataState = computed(() => error.value ? \'error\' : props.state);\n</script>\n\n<template>\n  <div class=\"udc-text-input\" :data-state=\"dataState || undefined\">\n    <label v-if=\"label\" class=\"udc-text-input__label\">{{ label }}</label>\n    <div class=\"udc-text-input__field\">\n      <input\n        v-model=\"value\"\n        @blur=\"validate\"\n        :placeholder=\"placeholder\"\n        :required=\"required\"\n        :maxlength=\"maxLength\"\n        :disabled=\"disabled\"\n      />\n    </div>\n    <div class=\"udc-text-input__helper\">\n      <span>{{ error || helper }}</span>\n      <span v-if=\"maxLength\" class=\"udc-text-input__counter\">{{ value.length }}/{{ maxLength }}</span>\n    </div>\n  </div>\n</template>';
      }
    },

    checkbox: {
      cssFile: 'uds/components/checkbox.css',
      jsFunc: 'initCheckbox',
      tokens: {
        'Color': [
          '--uds-color-surface-interactive-default','--uds-color-surface-interactive-disabled',
          '--uds-color-surface-interactive-red-subtle',
          '--uds-color-text-primary','--uds-color-text-disabled','--uds-color-text-error',
          '--uds-color-icon-inverse','--uds-color-icon-error',
          '--uds-color-border-primary','--uds-color-border-disabled','--uds-color-border-error',
          '--uds-color-border-interactive','--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-medium','--uds-font-weight-bold'],
        'Space': ['--uds-space-100']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <label class="udc-checkbox">\n    <input type="checkbox" />\n    <span class="udc-checkbox__control"></span>\n    <span class="udc-checkbox__label">Accept terms</span>\n  </label>\n\n  <!-- Required -->\n  <label class="udc-checkbox" data-required="true">\n    <input type="checkbox" required />\n    <span class="udc-checkbox__control"></span>\n    <span class="udc-checkbox__label">I agree</span>\n    <span class="udc-checkbox__required"></span>\n  </label>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction Checkbox({ label, checked: initial = false, required, disabled, error, onChange }) {\n  const [checked, setChecked] = useState(initial);\n\n  function handleChange(e) {\n    setChecked(e.target.checked);\n    onChange?.(e.target.checked);\n  }\n\n  return (\n    <label className=\"udc-checkbox\" data-state={error ? \'error\' : undefined} data-required={required || undefined}>\n      <input type=\"checkbox\" checked={checked} onChange={handleChange} disabled={disabled} required={required} />\n      <span className=\"udc-checkbox__control\" />\n      <span className=\"udc-checkbox__label\">{label}</span>\n      {required && <span className=\"udc-checkbox__required\" />}\n    </label>\n  );\n}\n\nexport default Checkbox;';
      },
      vue: function () {
        return '<script setup>\nimport { ref } from \'vue\';\n\nconst props = defineProps({\n  label: String,\n  required: Boolean,\n  disabled: Boolean,\n  error: Boolean,\n  modelValue: Boolean,\n});\n\nconst emit = defineEmits([\'update:modelValue\']);\nconst checked = ref(props.modelValue);\n\nfunction toggle(e) {\n  checked.value = e.target.checked;\n  emit(\'update:modelValue\', checked.value);\n}\n</script>\n\n<template>\n  <label class=\"udc-checkbox\" :data-state=\"error ? \'error\' : undefined\" :data-required=\"required || undefined\">\n    <input type=\"checkbox\" :checked=\"checked\" @change=\"toggle\" :disabled=\"disabled\" :required=\"required\" />\n    <span class=\"udc-checkbox__control\" />\n    <span class=\"udc-checkbox__label\">{{ label }}</span>\n    <span v-if=\"required\" class=\"udc-checkbox__required\" />\n  </label>\n</template>';
      }
    },

    radio: {
      cssFile: 'uds/components/radio.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-text-primary','--uds-color-text-disabled','--uds-color-text-error',
          '--uds-color-text-interactive',
          '--uds-color-icon-error','--uds-color-icon-interactive',
          '--uds-color-border-primary','--uds-color-border-disabled','--uds-color-border-error',
          '--uds-color-border-interactive','--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-sm','--uds-font-size-base','--uds-font-line-height-sm','--uds-font-line-height-base','--uds-font-weight-medium','--uds-font-weight-bold'],
        'Space': ['--uds-space-050','--uds-space-100']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <fieldset class="udc-radio-group">\n    <legend class="udc-radio-group__legend">Preferred contact</legend>\n    <label class="udc-radio">\n      <input type="radio" name="contact" value="email" checked />\n      <span class="udc-radio__control"></span>\n      <span class="udc-radio__label">Email</span>\n    </label>\n    <label class="udc-radio">\n      <input type="radio" name="contact" value="phone" />\n      <span class="udc-radio__control"></span>\n      <span class="udc-radio__label">Phone</span>\n    </label>\n    <label class="udc-radio">\n      <input type="radio" name="contact" value="sms" />\n      <span class="udc-radio__control"></span>\n      <span class="udc-radio__label">SMS</span>\n    </label>\n  </fieldset>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction RadioGroup({ legend, name, options, value: initial, disabled, error, onChange }) {\n  const [value, setValue] = useState(initial || options[0]?.value);\n\n  function handleChange(v) {\n    setValue(v);\n    onChange?.(v);\n  }\n\n  return (\n    <fieldset className=\"udc-radio-group\" data-state={error ? \'error\' : undefined}>\n      {legend && <legend className=\"udc-radio-group__legend\">{legend}</legend>}\n      {options.map(opt => (\n        <label key={opt.value} className=\"udc-radio\">\n          <input\n            type=\"radio\" name={name} value={opt.value}\n            checked={value === opt.value}\n            onChange={() => handleChange(opt.value)}\n            disabled={disabled}\n          />\n          <span className=\"udc-radio__control\" />\n          <span className=\"udc-radio__label\">{opt.label}</span>\n        </label>\n      ))}\n    </fieldset>\n  );\n}\n\nexport default RadioGroup;\n\n/* Usage:\n  <RadioGroup\n    legend=\"Contact method\"\n    name=\"contact\"\n    options={[\n      { value: \'email\', label: \'Email\' },\n      { value: \'phone\', label: \'Phone\' },\n    ]}\n  />\n*/';
      },
      vue: function () {
        return '<script setup>\nimport { ref } from \'vue\';\n\nconst props = defineProps({\n  legend: String,\n  name: String,\n  options: Array,\n  modelValue: String,\n  disabled: Boolean,\n  error: Boolean,\n});\n\nconst emit = defineEmits([\'update:modelValue\']);\nconst selected = ref(props.modelValue || props.options?.[0]?.value);\n\nfunction pick(val) {\n  selected.value = val;\n  emit(\'update:modelValue\', val);\n}\n</script>\n\n<template>\n  <fieldset class=\"udc-radio-group\" :data-state=\"error ? \'error\' : undefined\">\n    <legend v-if=\"legend\" class=\"udc-radio-group__legend\">{{ legend }}</legend>\n    <label v-for=\"opt in options\" :key=\"opt.value\" class=\"udc-radio\">\n      <input type=\"radio\" :name=\"name\" :value=\"opt.value\" :checked=\"selected === opt.value\" @change=\"pick(opt.value)\" :disabled=\"disabled\" />\n      <span class=\"udc-radio__control\" />\n      <span class=\"udc-radio__label\">{{ opt.label }}</span>\n    </label>\n  </fieldset>\n</template>';
      }
    },

    badge: {
      cssFile: 'uds/components/badge.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-surface-alt','--uds-color-surface-bold',
          '--uds-color-surface-info','--uds-color-surface-info-subtle',
          '--uds-color-surface-success','--uds-color-surface-success-subtle',
          '--uds-color-surface-error','--uds-color-surface-error-subtle',
          '--uds-color-surface-warning','--uds-color-surface-warning-subtle',
          '--uds-color-text-inverse','--uds-color-text-secondary',
          '--uds-color-text-info','--uds-color-text-success','--uds-color-text-error','--uds-color-text-warning'
        ],
        'Font': ['--uds-font-family','--uds-font-size-xs','--uds-font-size-base','--uds-font-line-height-sm','--uds-font-line-height-base','--uds-font-weight-regular'],
        'Space': ['--uds-space-025','--uds-space-050','--uds-space-100'],
        'Border': ['--uds-border-radius-container-sm']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <span class="udc-badge">Default</span>\n  <span class="udc-badge" data-variant="success">Active</span>\n  <span class="udc-badge" data-variant="error">Failed</span>\n  <span class="udc-badge" data-variant="warning">Pending</span>\n  <span class="udc-badge" data-variant="secondary">Draft</span>\n\n  <!-- Subtle / tinted -->\n  <span class="udc-badge" data-prominent="false">Info</span>\n  <span class="udc-badge" data-variant="success" data-prominent="false">Active</span>\n\n  <!-- Small -->\n  <span class="udc-badge" data-size="sm">Sm</span>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Badge({ variant, prominent = true, size, children }) {\n  return (\n    <span\n      className=\"udc-badge\"\n      data-variant={variant || undefined}\n      data-prominent={prominent === false ? \'false\' : undefined}\n      data-size={size || undefined}\n    >\n      {children}\n    </span>\n  );\n}\n\nexport default Badge;\n\n/* Usage:\n  <Badge>Default</Badge>\n  <Badge variant=\"success\">Active</Badge>\n  <Badge variant=\"error\" prominent={false}>Failed</Badge>\n  <Badge size=\"sm\">Sm</Badge>\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  variant: String,\n  prominent: { type: Boolean, default: true },\n  size: String,\n});\n</script>\n\n<template>\n  <span\n    class=\"udc-badge\"\n    :data-variant=\"variant || undefined\"\n    :data-prominent=\"prominent === false ? \'false\' : undefined\"\n    :data-size=\"size || undefined\"\n  >\n    <slot />\n  </span>\n</template>';
      }
    },

    breadcrumb: {
      cssFile: 'uds/components/breadcrumb.css',
      jsFunc: null,
      tokens: {
        'Color': [
          '--uds-color-surface-main','--uds-color-text-primary','--uds-color-text-interactive-neutral',
          '--uds-color-icon-secondary','--uds-color-border-tertiary'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-regular','--uds-font-weight-bold'],
        'Space': ['--uds-space-150','--uds-space-200','--uds-space-300'],
        'Border': ['--uds-border-radius-container-xl']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <nav class="udc-breadcrumb" aria-label="Breadcrumb">\n    <ol>\n      <li><a href="/">Home</a></li>\n      <li><a href="/products">Products</a></li>\n      <li><a href="/products/widgets" aria-current="page">Widgets</a></li>\n    </ol>\n  </nav>\n\n  <!-- Frameless variant -->\n  <nav class="udc-breadcrumb" data-frameless aria-label="Breadcrumb">\n    <ol>\n      <li><a href="/">Home</a></li>\n      <li><a href="/settings" aria-current="page">Settings</a></li>\n    </ol>\n  </nav>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Breadcrumb({ items, frameless }) {\n  return (\n    <nav className=\"udc-breadcrumb\" data-frameless={frameless || undefined} aria-label=\"Breadcrumb\">\n      <ol>\n        {items.map((item, i) => (\n          <li key={item.href}>\n            <a href={item.href} aria-current={i === items.length - 1 ? \'page\' : undefined}>\n              {item.label}\n            </a>\n          </li>\n        ))}\n      </ol>\n    </nav>\n  );\n}\n\nexport default Breadcrumb;\n\n/* Usage:\n  <Breadcrumb items={[\n    { href: \'/\', label: \'Home\' },\n    { href: \'/products\', label: \'Products\' },\n    { href: \'/products/widgets\', label: \'Widgets\' },\n  ]} />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  items: Array,\n  frameless: Boolean,\n});\n</script>\n\n<template>\n  <nav class=\"udc-breadcrumb\" :data-frameless=\"frameless || undefined\" aria-label=\"Breadcrumb\">\n    <ol>\n      <li v-for=\"(item, i) in items\" :key=\"item.href\">\n        <a :href=\"item.href\" :aria-current=\"i === items.length - 1 ? \'page\' : undefined\">\n          {{ item.label }}\n        </a>\n      </li>\n    </ol>\n  </nav>\n</template>';
      }
    },

    tabs: {
      cssFile: 'uds/components/tab-horizontal.css',
      jsFunc: 'initTabs',
      tokens: {
        'Color': [
          '--uds-color-text-primary','--uds-color-text-disabled','--uds-color-text-interactive',
          '--uds-color-surface-interactive-subtle-hover',
          '--uds-color-border-primary','--uds-color-border-disabled','--uds-color-border-interactive',
          '--uds-color-border-interactive-hover','--uds-color-border-outline-focus-visible'
        ],
        'Font': ['--uds-font-family','--uds-font-size-base','--uds-font-line-height-base','--uds-font-weight-medium'],
        'Space': ['--uds-space-100','--uds-space-200','--uds-space-300']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div class="udc-tabs" role="tablist">\n    <button class="udc-tab" role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Overview</button>\n    <button class="udc-tab" role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Details</button>\n    <button class="udc-tab" role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3" disabled>Disabled</button>\n  </div>\n\n  <div id="panel-1" role="tabpanel" aria-labelledby="tab-1">Overview content</div>\n  <div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Details content</div>\n  <div id="panel-3" role="tabpanel" aria-labelledby="tab-3" hidden>Disabled content</div>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return 'import { useState } from \'react\';\nimport \'./uds/uds.css\';\n\nfunction Tabs({ tabs, size }) {\n  const [active, setActive] = useState(tabs[0]?.id);\n\n  return (\n    <>\n      <div className=\"udc-tabs\" role=\"tablist\" data-size={size || undefined}>\n        {tabs.map(tab => (\n          <button\n            key={tab.id}\n            className=\"udc-tab\"\n            role=\"tab\"\n            aria-selected={active === tab.id}\n            onClick={() => !tab.disabled && setActive(tab.id)}\n            disabled={tab.disabled}\n          >\n            {tab.label}\n          </button>\n        ))}\n      </div>\n      {tabs.map(tab => (\n        <div key={tab.id} role=\"tabpanel\" hidden={active !== tab.id}>\n          {tab.content}\n        </div>\n      ))}\n    </>\n  );\n}\n\nexport default Tabs;\n\n/* Usage:\n  <Tabs tabs={[\n    { id: \'overview\', label: \'Overview\', content: <p>Overview content</p> },\n    { id: \'details\', label: \'Details\', content: <p>Details content</p> },\n    { id: \'disabled\', label: \'Disabled\', content: null, disabled: true },\n  ]} />\n*/';
      },
      vue: function () {
        return '<script setup>\nimport { ref } from \'vue\';\n\nconst props = defineProps({\n  tabs: Array,\n  size: String,\n});\n\nconst active = ref(props.tabs?.[0]?.id);\n</script>\n\n<template>\n  <div class=\"udc-tabs\" role=\"tablist\" :data-size=\"size || undefined\">\n    <button\n      v-for=\"tab in tabs\" :key=\"tab.id\"\n      class=\"udc-tab\" role=\"tab\"\n      :aria-selected=\"active === tab.id\"\n      @click=\"!tab.disabled && (active = tab.id)\"\n      :disabled=\"tab.disabled\"\n    >\n      {{ tab.label }}\n    </button>\n  </div>\n  <div v-for=\"tab in tabs\" :key=\"tab.id\" role=\"tabpanel\" :hidden=\"active !== tab.id\">\n    <slot :name=\"tab.id\" />\n  </div>\n</template>';
      }
    },

    divider: {
      cssFile: 'uds/components/divider.css',
      jsFunc: null,
      tokens: {
        'Color': ['--uds-color-border-tertiary'],
        'Space': ['--uds-space-050','--uds-space-100','--uds-space-150','--uds-space-200'],
        'Border': ['--uds-border-radius-full']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <p>Content above</p>\n  <hr class="udc-divider-horizontal" />\n  <p>Content below</p>\n\n  <!-- With padding variants -->\n  <hr class="udc-divider-horizontal" data-padding="md" />\n  <hr class="udc-divider-horizontal" data-padding="lg" />\n  <hr class="udc-divider-horizontal" data-padding="xl" />\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Divider({ padding }) {\n  return <hr className=\"udc-divider-horizontal\" data-padding={padding || undefined} />;\n}\n\nexport default Divider;\n\n/* Usage:\n  <Divider />\n  <Divider padding=\"md\" />\n  <Divider padding=\"lg\" />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({ padding: String });\n</script>\n\n<template>\n  <hr class=\"udc-divider-horizontal\" :data-padding=\"padding || undefined\" />\n</template>';
      }
    },

    'icon-wrapper': {
      cssFile: 'uds/components/icon-wrapper.css',
      jsFunc: null,
      tokens: {},
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <span class="udc-icon-wrapper" data-size="16"><span class="material-symbols-outlined">info</span></span>\n  <span class="udc-icon-wrapper" data-size="24"><span class="material-symbols-outlined">info</span></span>\n  <span class="udc-icon-wrapper" data-size="48"><span class="material-symbols-outlined">info</span></span>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Icon({ name, size = 24 }) {\n  return (\n    <span className=\"udc-icon-wrapper\" data-size={size}>\n      <span className=\"material-symbols-outlined\">{name}</span>\n    </span>\n  );\n}\n\nexport default Icon;\n\n/* Usage:\n  <Icon name=\"info\" size={16} />\n  <Icon name=\"settings\" />\n  <Icon name=\"home\" size={48} />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({\n  name: String,\n  size: { type: [String, Number], default: 24 },\n});\n</script>\n\n<template>\n  <span class=\"udc-icon-wrapper\" :data-size=\"size\">\n    <span class=\"material-symbols-outlined\">{{ name }}</span>\n  </span>\n</template>';
      }
    },

    spacer: {
      cssFile: 'uds/components/spacer.css',
      jsFunc: null,
      tokens: {
        'Space': ['--uds-space-050','--uds-space-100','--uds-space-150','--uds-space-200','--uds-space-300','--uds-space-400','--uds-space-500','--uds-space-600']
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <div style="display:flex; flex-direction:column;">\n    <p>First section</p>\n    <div class="udc-spacer" data-size="200"></div>\n    <p>Second section</p>\n    <div class="udc-spacer" data-size="400"></div>\n    <p>Third section</p>\n  </div>\n\n</body>\n</html>';
      },
      react: function () {
        return 'import \'./uds/uds.css\';\n\nfunction Spacer({ size = \'200\' }) {\n  return <div className=\"udc-spacer\" data-size={size} />;\n}\n\nexport default Spacer;\n\n/* Usage:\n  <Spacer size=\"100\" />\n  <Spacer />            {/* 200 default */}\n  <Spacer size=\"400\" />\n*/';
      },
      vue: function () {
        return '<script setup>\ndefineProps({ size: { type: String, default: \'200\' } });\n</script>\n\n<template>\n  <div class=\"udc-spacer\" :data-size=\"size\" />\n</template>';
      }
    },

    nav: {
      cssFile: 'uds/components/nav.css',
      jsFunc: 'initNavBento',
      tokens: {
        'Surface': [
          '--uds-color-surface-main','--uds-color-surface-interactive-none',
          '--uds-color-surface-interactive-subtle-hover','--uds-color-surface-interactive-subtle-active',
          '--uds-color-surface-interactive-active','--uds-color-surface-interactive-hover',
          '--uds-color-surface-interactive-default','--uds-color-surface-page'
        ],
        'Text': [
          '--uds-color-text-primary','--uds-color-text-inverse','--uds-color-text-secondary',
          '--uds-color-text-interactive','--uds-color-text-interactive-hover','--uds-color-text-disabled'
        ],
        'Icon': [
          '--uds-color-icon-primary','--uds-color-icon-secondary','--uds-color-icon-interactive',
          '--uds-color-icon-inverse','--uds-color-icon-disabled'
        ],
        'Border': [
          '--uds-color-border-secondary','--uds-color-border-outline-focus-visible',
          '--uds-border-radius-input','--uds-border-radius-container-full',
          '--uds-border-radius-container-lg','--uds-border-radius-container-xl'
        ],
        'Space': [
          '--uds-space-025','--uds-space-050','--uds-space-075','--uds-space-100',
          '--uds-space-150','--uds-space-200','--uds-space-250','--uds-space-300'
        ],
        'Font': [
          '--uds-font-family','--uds-font-size-base','--uds-font-line-height-base',
          '--uds-font-weight-medium','--uds-font-weight-bold'
        ]
      },
      html: function () {
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />\n  <link rel="stylesheet" href="uds/uds.css" />\n</head>\n<body>\n\n  <!-- Header -->\n  <div class="udc-nav-header">\n    <div class="udc-nav-header__left">\n      <div class="udc-nav-logo">\n        <span class="material-symbols-outlined" style="font-size:32px;">apartment</span>\n      </div>\n      <div class="udc-nav-bento-wrapper">\n        <button class="udc-nav-bento-button" aria-expanded="false">\n          <span class="material-symbols-outlined">dashboard</span>\n          Boardroom\n          <span class="material-symbols-outlined udc-nav-bento-button__chevron">keyboard_arrow_down</span>\n        </button>\n        <div class="udc-nav-bento" data-open="false">\n          <div class="udc-nav-bento__list">\n            <button class="udc-nav-button" aria-selected="true">\n              <span class="material-symbols-outlined">space_dashboard</span>\n              <span class="udc-nav-button__label">Dashboard</span>\n            </button>\n            <button class="udc-nav-button">\n              <span class="material-symbols-outlined">book</span>\n              <span class="udc-nav-button__label">Leasing / CRM</span>\n            </button>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="udc-nav-header__center">\n      <div class="udc-nav-search">\n        <span class="material-symbols-outlined">auto_awesome</span>\n        <input class="udc-nav-search__input" type="text" placeholder="Search or ask a question">\n      </div>\n    </div>\n    <div class="udc-nav-header__right">\n      <div class="udc-nav-account">\n        <button class="udc-button-ghost" data-icon-only>\n          <span class="material-symbols-outlined">notifications</span>\n        </button>\n        <button class="udc-button-ghost" data-icon-only>\n          <span class="material-symbols-outlined">settings</span>\n        </button>\n        <button class="udc-button-ghost" data-icon-only>\n          <span class="material-symbols-outlined">account_circle</span>\n        </button>\n      </div>\n    </div>\n  </div>\n\n  <!-- Sidebar -->\n  <nav class="udc-nav-vertical" aria-label="Main navigation">\n    <button class="udc-nav-button" aria-selected="true">\n      <span class="material-symbols-outlined">space_dashboard</span>\n      <span class="udc-nav-button__label">Dashboard</span>\n    </button>\n    <button class="udc-nav-button">\n      <span class="material-symbols-outlined">book</span>\n      <span class="udc-nav-button__label">Leasing / CRM</span>\n    </button>\n  </nav>\n\n  <script src="uds/uds.js"><\/script>\n</body>\n</html>';
      },
      react: function () {
        return "import { useState, useRef, useEffect } from 'react';\nimport './uds/uds.css';\n\nconst navItems = [\n  { icon: 'space_dashboard', label: 'Dashboard' },\n  { icon: 'book', label: 'Leasing / CRM' },\n  { icon: 'contact_phone', label: 'People / Contacts' },\n  { icon: 'home_work', label: 'Property / Assets' },\n  { icon: 'monetization_on', label: 'Accounting / Finance' },\n];\n\nfunction NavVertical({ selected, onSelect }) {\n  return (\n    <nav className=\"udc-nav-vertical\" aria-label=\"Main navigation\">\n      {navItems.map((item, i) => (\n        <button\n          key={i}\n          className=\"udc-nav-button\"\n          aria-selected={selected === i}\n          onClick={() => onSelect(i)}\n        >\n          <span className=\"material-symbols-outlined\">{item.icon}</span>\n          <span className=\"udc-nav-button__label\">{item.label}</span>\n        </button>\n      ))}\n    </nav>\n  );\n}\n\nfunction NavBento({ appName, open, onToggle }) {\n  const ref = useRef(null);\n\n  useEffect(() => {\n    function close(e) {\n      if (ref.current && !ref.current.contains(e.target)) onToggle(false);\n    }\n    document.addEventListener('click', close);\n    return () => document.removeEventListener('click', close);\n  }, [onToggle]);\n\n  return (\n    <div className=\"udc-nav-bento-wrapper\" ref={ref}>\n      <button\n        className=\"udc-nav-bento-button\"\n        aria-expanded={open}\n        onClick={() => onToggle(!open)}\n      >\n        <span className=\"material-symbols-outlined\">dashboard</span>\n        {appName}\n        <span className=\"material-symbols-outlined udc-nav-bento-button__chevron\">keyboard_arrow_down</span>\n      </button>\n      <div className=\"udc-nav-bento\" data-open={open}>\n        <div className=\"udc-nav-bento__list\">\n          {navItems.map((item, i) => (\n            <button key={i} className=\"udc-nav-button\">\n              <span className=\"material-symbols-outlined\">{item.icon}</span>\n              <span className=\"udc-nav-button__label\">{item.label}</span>\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n}\n\nexport { NavVertical, NavBento };";
      },
      vue: function () {
        return "<script setup>\nimport { ref } from 'vue';\n\nconst navItems = [\n  { icon: 'space_dashboard', label: 'Dashboard' },\n  { icon: 'book', label: 'Leasing / CRM' },\n  { icon: 'contact_phone', label: 'People / Contacts' },\n  { icon: 'home_work', label: 'Property / Assets' },\n  { icon: 'monetization_on', label: 'Accounting / Finance' },\n];\n\nconst selected = ref(0);\nconst bentoOpen = ref(false);\n</script>\n\n<template>\n  <!-- Nav Vertical -->\n  <nav class=\"udc-nav-vertical\" aria-label=\"Main navigation\">\n    <button\n      v-for=\"(item, i) in navItems\" :key=\"i\"\n      class=\"udc-nav-button\"\n      :aria-selected=\"selected === i\"\n      @click=\"selected = i\"\n    >\n      <span class=\"material-symbols-outlined\">{{ item.icon }}</span>\n      <span class=\"udc-nav-button__label\">{{ item.label }}</span>\n    </button>\n  </nav>\n\n  <!-- Nav Bento -->\n  <div class=\"udc-nav-bento-wrapper\">\n    <button\n      class=\"udc-nav-bento-button\"\n      :aria-expanded=\"bentoOpen\"\n      @click=\"bentoOpen = !bentoOpen\"\n    >\n      <span class=\"material-symbols-outlined\">dashboard</span>\n      Boardroom\n      <span class=\"material-symbols-outlined udc-nav-bento-button__chevron\">keyboard_arrow_down</span>\n    </button>\n    <div class=\"udc-nav-bento\" :data-open=\"bentoOpen\">\n      <div class=\"udc-nav-bento__list\">\n        <button\n          v-for=\"(item, i) in navItems\" :key=\"i\"\n          class=\"udc-nav-button\"\n        >\n          <span class=\"material-symbols-outlined\">{{ item.icon }}</span>\n          <span class=\"udc-nav-button__label\">{{ item.label }}</span>\n        </button>\n      </div>\n    </div>\n  </div>\n</template>";
      }
    }
  };

  /* ========================================================================
     6c. BUILD IMPLEMENTATION REFERENCE SECTION
     ======================================================================== */
  var jsBehaviorCache = {};

  function fetchJsBehavior(funcName, callback) {
    if (jsBehaviorCache[funcName] !== undefined) {
      callback(jsBehaviorCache[funcName]);
      return;
    }
    fetch('uds/uds.js').then(function (r) { return r.text(); }).then(function (text) {
      var pattern = new RegExp('(  function ' + funcName + '\\([^)]*\\)[\\s\\S]*?\\n  \\})');
      var match = text.match(pattern);
      jsBehaviorCache[funcName] = match ? match[1] : '// ' + funcName + ' — see uds.js';
      callback(jsBehaviorCache[funcName]);
    });
  }

  var cssFileCache = {};

  function fetchCssFile(path, callback) {
    if (cssFileCache[path] !== undefined) {
      callback(cssFileCache[path]);
      return;
    }
    fetch(path).then(function (r) { return r.text(); }).then(function (text) {
      cssFileCache[path] = text;
      callback(text);
    });
  }

  function buildImplSection(pageId) {
    var data = IMPL_DATA[pageId];
    if (!data) return null;

    var details = document.createElement('details');
    details.className = 'sg-impl-details';

    var summary = document.createElement('summary');
    summary.textContent = 'Implementation Reference';
    details.appendChild(summary);

    var body = document.createElement('div');
    body.className = 'sg-impl-body';

    var tabBar = document.createElement('div');
    tabBar.className = 'sg-impl-tabs';

    var panels = document.createElement('div');

    var tabDefs = [{ id: 'component', label: 'Component File' }, { id: 'styles', label: 'Styles (CSS)' }];
    if (data.jsFunc) tabDefs.push({ id: 'behavior', label: 'Behavior (JS)' });
    var hasTokens = data.tokens && Object.keys(data.tokens).length > 0;
    if (hasTokens) tabDefs.push({ id: 'tokens', label: 'Tokens Used' });

    var activePanelEl = null;

    tabDefs.forEach(function (td, idx) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'sg-impl-tab';
      tab.textContent = td.label;
      tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      tab.dataset.implTab = td.id;

      var panel = document.createElement('div');
      panel.className = 'sg-impl-panel' + (idx === 0 ? ' active' : '');
      panel.dataset.implPanel = td.id;

      tab.addEventListener('click', function () {
        tabBar.querySelectorAll('.sg-impl-tab').forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        panels.querySelectorAll('.sg-impl-panel').forEach(function (p) { p.classList.remove('active'); });
        tab.setAttribute('aria-selected', 'true');
        panel.classList.add('active');
      });

      tabBar.appendChild(tab);
      panels.appendChild(panel);

      if (td.id === 'component') {
        var pre = document.createElement('pre');
        var wrap = document.createElement('div');
        wrap.className = 'sg-code-wrap';
        wrap.appendChild(buildCopyButton(function () { return pre.textContent; }));
        wrap.appendChild(pre);
        panel.appendChild(wrap);
        panel._pre = pre;
        updateComponentTab(panel, data);
      }

      if (td.id === 'styles') {
        var pre2 = document.createElement('pre');
        pre2.textContent = 'Loading…';
        var wrap2 = document.createElement('div');
        wrap2.className = 'sg-code-wrap';
        wrap2.appendChild(buildCopyButton(function () { return pre2.textContent; }));
        wrap2.appendChild(pre2);
        panel.appendChild(wrap2);
        fetchCssFile(data.cssFile, function (text) { pre2.textContent = text; });
      }

      if (td.id === 'behavior') {
        var pre3 = document.createElement('pre');
        pre3.textContent = 'Loading…';
        var wrap3 = document.createElement('div');
        wrap3.className = 'sg-code-wrap';
        wrap3.appendChild(buildCopyButton(function () { return pre3.textContent; }));
        wrap3.appendChild(pre3);
        panel.appendChild(wrap3);
        panel._pre = pre3;
        updateBehaviorTab(panel, data);
      }

      if (td.id === 'tokens') {
        buildTokensPanel(panel, data.tokens);
      }
    });

    body.appendChild(tabBar);
    body.appendChild(panels);
    details.appendChild(body);
    details._data = data;

    return details;
  }

  function updateComponentTab(panel, data) {
    var pre = panel._pre;
    if (!pre) return;
    if (currentFramework === 'react') pre.textContent = data.react();
    else if (currentFramework === 'vue') pre.textContent = data.vue();
    else pre.textContent = data.html();
  }

  function updateBehaviorTab(panel, data) {
    var pre = panel._pre;
    if (!pre) return;
    if (currentFramework === 'html') {
      if (data.jsFunc) {
        fetchJsBehavior(data.jsFunc, function (code) { pre.textContent = code; });
      }
    } else if (currentFramework === 'react') {
      pre.textContent = getReactBehavior(data.jsFunc);
    } else if (currentFramework === 'vue') {
      pre.textContent = getVueBehavior(data.jsFunc);
    }
  }

  function getReactBehavior(funcName) {
    var behaviors = {
      initTextInput: 'import { useState, useRef, useCallback } from \'react\';\n\nfunction useTextInput({ required, pattern, patternMessage }) {\n  const [value, setValue] = useState(\'\');\n  const [error, setError] = useState(\'\');\n\n  const validate = useCallback(() => {\n    if (required && !value.trim()) {\n      setError(\'This field is required\');\n    } else if (pattern && value && !new RegExp(pattern).test(value)) {\n      setError(patternMessage || \'Invalid format\');\n    } else {\n      setError(\'\');\n    }\n  }, [value, required, pattern, patternMessage]);\n\n  const clear = useCallback(() => setValue(\'\'), []);\n\n  return { value, setValue, error, validate, clear };\n}',
      initTabs: 'import { useState, useCallback } from \'react\';\n\nfunction useTabs(tabs) {\n  const enabledTabs = tabs.filter(t => !t.disabled);\n  const [active, setActive] = useState(enabledTabs[0]?.id);\n\n  const onKeyDown = useCallback((e, tabId) => {\n    const ids = enabledTabs.map(t => t.id);\n    const idx = ids.indexOf(tabId);\n    let next;\n\n    if (e.key === \'ArrowRight\') {\n      next = ids[(idx + 1) % ids.length];\n    } else if (e.key === \'ArrowLeft\') {\n      next = ids[(idx - 1 + ids.length) % ids.length];\n    } else if (e.key === \'Home\') {\n      next = ids[0];\n    } else if (e.key === \'End\') {\n      next = ids[ids.length - 1];\n    }\n    if (next) { e.preventDefault(); setActive(next); }\n  }, [enabledTabs]);\n\n  return { active, setActive, onKeyDown };\n}',
      initCheckbox: 'import { useRef, useEffect } from \'react\';\n\nfunction useIndeterminate(ref, indeterminate) {\n  useEffect(() => {\n    if (ref.current) ref.current.indeterminate = !!indeterminate;\n  }, [ref, indeterminate]);\n}'
    };
    return behaviors[funcName] || '// No React equivalent needed';
  }

  function getVueBehavior(funcName) {
    var behaviors = {
      initTextInput: 'import { ref, computed } from \'vue\';\n\nexport function useTextInput({ required, pattern, patternMessage } = {}) {\n  const value = ref(\'\');\n  const error = ref(\'\');\n\n  function validate() {\n    if (required && !value.value.trim()) {\n      error.value = \'This field is required\';\n    } else if (pattern && value.value && !new RegExp(pattern).test(value.value)) {\n      error.value = patternMessage || \'Invalid format\';\n    } else {\n      error.value = \'\';\n    }\n  }\n\n  function clear() { value.value = \'\'; }\n\n  const state = computed(() => error.value ? \'error\' : undefined);\n\n  return { value, error, validate, clear, state };\n}',
      initTabs: 'import { ref } from \'vue\';\n\nexport function useTabs(tabs) {\n  const enabledTabs = tabs.filter(t => !t.disabled);\n  const active = ref(enabledTabs[0]?.id);\n\n  function onKeyDown(e, tabId) {\n    const ids = enabledTabs.map(t => t.id);\n    const idx = ids.indexOf(tabId);\n    let next;\n\n    if (e.key === \'ArrowRight\') {\n      next = ids[(idx + 1) % ids.length];\n    } else if (e.key === \'ArrowLeft\') {\n      next = ids[(idx - 1 + ids.length) % ids.length];\n    } else if (e.key === \'Home\') {\n      next = ids[0];\n    } else if (e.key === \'End\') {\n      next = ids[ids.length - 1];\n    }\n    if (next) { e.preventDefault(); active.value = next; }\n  }\n\n  return { active, onKeyDown };\n}',
      initCheckbox: 'import { ref, watch, onMounted } from \'vue\';\n\nexport function useIndeterminate(inputRef, indeterminate) {\n  const isIndeterminate = ref(indeterminate);\n\n  function apply() {\n    if (inputRef.value) inputRef.value.indeterminate = isIndeterminate.value;\n  }\n\n  onMounted(apply);\n  watch(isIndeterminate, apply);\n\n  return isIndeterminate;\n}'
    };
    return behaviors[funcName] || '// No Vue equivalent needed';
  }

  function buildTokensPanel(panel, tokenGroups) {
    var container = document.createElement('div');
    container.className = 'sg-impl-tokens';

    var computedStyle = getComputedStyle(document.documentElement);

    Object.keys(tokenGroups).forEach(function (group) {
      var header = document.createElement('div');
      header.className = 'sg-impl-token-group';
      header.textContent = group;
      container.appendChild(header);

      tokenGroups[group].forEach(function (token) {
        var row = document.createElement('div');
        row.className = 'sg-impl-token-row';

        var resolved = computedStyle.getPropertyValue(token).trim();
        var isColor = token.indexOf('color') !== -1;

        if (isColor && resolved) {
          var swatch = document.createElement('div');
          swatch.className = 'sg-impl-token-swatch';
          swatch.style.background = resolved;
          row.appendChild(swatch);
        }

        var nameSpan = document.createElement('span');
        nameSpan.className = 'sg-impl-token-name';
        nameSpan.textContent = token;
        row.appendChild(nameSpan);

        var valSpan = document.createElement('span');
        valSpan.className = 'sg-impl-token-val';
        valSpan.textContent = resolved || '';
        row.appendChild(valSpan);

        container.appendChild(row);
      });
    });

    panel.appendChild(container);
  }

  function refreshImplSections() {
    document.querySelectorAll('.sg-impl-details').forEach(function (details) {
      var data = details._data;
      if (!data) return;

      var compPanel = details.querySelector('[data-impl-panel="component"]');
      if (compPanel) updateComponentTab(compPanel, data);

      var behavPanel = details.querySelector('[data-impl-panel="behavior"]');
      if (behavPanel && data.jsFunc) updateBehaviorTab(behavPanel, data);
    });
  }

  /* ========================================================================
     7. TOKEN COPY BUTTONS
     ======================================================================== */
  const copyIcon = '<span class="material-symbols-outlined">content_copy</span>';
  const checkIcon = '<span class="material-symbols-outlined">check</span>';

  document.querySelectorAll('.sg-token-row').forEach(row => {
    const nameEl = row.querySelector('.sg-token-name');
    if (!nameEl) return;
    const btn = document.createElement('button');
    btn.className = 'sg-token-copy';
    btn.type = 'button';
    btn.title = 'Copy token name';
    btn.innerHTML = copyIcon;
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(nameEl.textContent.trim()).then(() => {
        btn.innerHTML = checkIcon;
        btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = copyIcon; btn.classList.remove('copied'); }, 1500);
      });
    });
    row.appendChild(btn);
  });

  /* ========================================================================
     8. CODE BLOCK COPY BUTTONS — add to all "Show code" example blocks
     ======================================================================== */
  document.querySelectorAll('.sg-example-code').forEach(function (details) {
    var pre = details.querySelector('pre');
    if (!pre) return;
    var wrap = document.createElement('div');
    wrap.className = 'sg-code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    wrap.appendChild(buildCopyButton(function () { return pre.textContent; }));
  });

  document.querySelectorAll('[data-tab-panel="code"] pre.sg-playground-code').forEach(function (pre) {
    if (pre.parentNode.classList.contains('sg-code-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'sg-code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    wrap.appendChild(buildCopyButton(function () { return pre.textContent; }));
  });

  /* ========================================================================
     9. POPULATE PRIMITIVE COLOR SWATCHES
     ======================================================================== */
  var PRIM_FAMILIES = [
    'slate','neutral','stone','blue','cyan','purple',
    'red','orange','amber','yellow','lime','green','emerald'
  ];
  var PRIM_STEPS = [10,20,30,40,50,'60-M',70,80,90,100,110];

  document.querySelectorAll('#prim-special .sg-token-row').forEach(function (row) {
    var name = row.querySelector('.sg-token-name');
    if (name) row.appendChild(buildCopyButton(name.textContent));
  });

  PRIM_FAMILIES.forEach(function (family) {
    var container = document.querySelector('#prim-' + family + ' .sg-token-list');
    if (!container) return;
    PRIM_STEPS.forEach(function (step) {
      var varName = '--uds-primitive-color-' + family + '-' + step;
      var row = document.createElement('div');
      row.className = 'sg-token-row';
      row.innerHTML =
        '<div class="sg-token-swatch" style="background:var(' + varName + ')"></div>' +
        '<span class="sg-token-name">' + varName + '</span>' +
        '<span class="sg-token-value">' + family + '-' + step + '</span>';
      var copyBtn = buildCopyButton(varName);
      row.appendChild(copyBtn);
      container.appendChild(row);
    });
  });

  /* ========================================================================
     10. FRAMEWORK SWITCHER FOR CODE TABS
     ======================================================================== */
  var CODE_TAB_CONFIGS = {
    'semantic-colors': {
      react: "/* src/index.js — import UDS once at the top */\nimport './uds/uds.css';\n\n/* ----- MyCard.module.css ----- */\n.card {\n  background: var(--uds-color-surface-main);\n  border: 1px solid var(--uds-color-border-primary);\n  border-radius: var(--uds-border-radius-card);\n  padding: var(--uds-space-300);\n}\n\n.title {\n  color: var(--uds-color-text-primary);\n  font-family: var(--uds-font-family);\n}\n\n.subtitle {\n  color: var(--uds-color-text-secondary);\n}\n\n/* ----- MyCard.jsx ----- */\nimport styles from './MyCard.module.css';\n\nfunction MyCard() {\n  return (\n    <div className={styles.card}>\n      <h2 className={styles.title}>Card title</h2>\n      <p className={styles.subtitle}>Description text</p>\n    </div>\n  );\n}",
      vue: "<style scoped>\n.card {\n  background: var(--uds-color-surface-main);\n  border: 1px solid var(--uds-color-border-primary);\n  border-radius: var(--uds-border-radius-card);\n  padding: var(--uds-space-300);\n}\n\n.title {\n  color: var(--uds-color-text-primary);\n  font-family: var(--uds-font-family);\n}\n\n.subtitle {\n  color: var(--uds-color-text-secondary);\n}\n</style>\n\n<template>\n  <div class=\"card\">\n    <h2 class=\"title\">Card title</h2>\n    <p class=\"subtitle\">Description text</p>\n  </div>\n</template>",
      note: 'Use UDS tokens via var() in your stylesheets — CSS Modules, scoped styles, or plain CSS. Avoid inline styles for tokens.'
    },
    'primitive-colors': {
      react: "/* Primitives are available as CSS custom properties.\n   Prefer semantic tokens in component code — \n   use primitives only for one-off overrides. */\n\n/* ----- Highlight.module.css ----- */\n.highlight {\n  background: var(--uds-primitive-color-yellow-100);\n  border-left: 3px solid var(--uds-primitive-color-yellow-500);\n  padding: var(--uds-space-200);\n}\n\n/* ----- Highlight.jsx ----- */\nimport styles from './Highlight.module.css';\n\nfunction Highlight({ children }) {\n  return <div className={styles.highlight}>{children}</div>;\n}",
      vue: "<!-- Prefer semantic tokens — use primitives for one-off overrides -->\n\n<style scoped>\n.highlight {\n  background: var(--uds-primitive-color-yellow-100);\n  border-left: 3px solid var(--uds-primitive-color-yellow-500);\n  padding: var(--uds-space-200);\n}\n</style>\n\n<template>\n  <div class=\"highlight\">\n    <slot />\n  </div>\n</template>",
      note: 'Primitive tokens are raw palette values. Prefer semantic tokens in component code.'
    },
    'button': {
      react: "/* UDS CSS is already imported in your app entry point */\n\nfunction MyPage() {\n  return (\n    <>\n      <button className=\"udc-button-primary\">Save</button>\n      <button className=\"udc-button-secondary\">Cancel</button>\n      <button className=\"udc-button-ghost\">More</button>\n    </>\n  );\n}",
      vue: "<!-- UDS CSS is already imported in main.js -->\n\n<template>\n  <button class=\"udc-button-primary\">Save</button>\n  <button class=\"udc-button-secondary\">Cancel</button>\n  <button class=\"udc-button-ghost\">More</button>\n</template>"
    },
    'text-input': {
      react: "function EmailInput() {\n  return (\n    <div className=\"udc-text-input\">\n      <label className=\"udc-text-input__label\">\n        Email\n        <span className=\"udc-text-input__required\"></span>\n      </label>\n      <div className=\"udc-text-input__field\">\n        <input type=\"email\" placeholder=\"Enter email...\" />\n      </div>\n      <div className=\"udc-text-input__helper\">\n        <span>We'll never share your email</span>\n      </div>\n    </div>\n  );\n}",
      vue: "<template>\n  <div class=\"udc-text-input\">\n    <label class=\"udc-text-input__label\">\n      Email\n      <span class=\"udc-text-input__required\"></span>\n    </label>\n    <div class=\"udc-text-input__field\">\n      <input type=\"email\" placeholder=\"Enter email...\" />\n    </div>\n    <div class=\"udc-text-input__helper\">\n      <span>We'll never share your email</span>\n    </div>\n  </div>\n</template>"
    },
    'checkbox': {
      react: "function TermsCheckbox() {\n  return (\n    <label className=\"udc-checkbox\">\n      <input type=\"checkbox\" />\n      <span className=\"udc-checkbox__control\"></span>\n      <span className=\"udc-checkbox__label\">Accept terms</span>\n    </label>\n  );\n}",
      vue: "<template>\n  <label class=\"udc-checkbox\">\n    <input type=\"checkbox\" />\n    <span class=\"udc-checkbox__control\"></span>\n    <span class=\"udc-checkbox__label\">Accept terms</span>\n  </label>\n</template>"
    },
    'radio': {
      react: "function NotificationPref() {\n  return (\n    <div className=\"udc-radio-group\" role=\"radiogroup\">\n      <span className=\"udc-radio-group__legend\">Preference</span>\n      <label className=\"udc-radio\">\n        <input type=\"radio\" name=\"pref\" value=\"email\" defaultChecked />\n        <span className=\"udc-radio__control\"></span>\n        <span className=\"udc-radio__label\">Email</span>\n      </label>\n      <label className=\"udc-radio\">\n        <input type=\"radio\" name=\"pref\" value=\"sms\" />\n        <span className=\"udc-radio__control\"></span>\n        <span className=\"udc-radio__label\">SMS</span>\n      </label>\n    </div>\n  );\n}",
      vue: "<template>\n  <div class=\"udc-radio-group\" role=\"radiogroup\">\n    <span class=\"udc-radio-group__legend\">Preference</span>\n    <label class=\"udc-radio\">\n      <input type=\"radio\" name=\"pref\" value=\"email\" checked />\n      <span class=\"udc-radio__control\"></span>\n      <span class=\"udc-radio__label\">Email</span>\n    </label>\n    <label class=\"udc-radio\">\n      <input type=\"radio\" name=\"pref\" value=\"sms\" />\n      <span class=\"udc-radio__control\"></span>\n      <span class=\"udc-radio__label\">SMS</span>\n    </label>\n  </div>\n</template>"
    },
    'badge': {
      react: "function StatusBadges() {\n  return (\n    <>\n      <span className=\"udc-badge\">Default</span>\n      <span className=\"udc-badge\" data-variant=\"success\">Active</span>\n      <span className=\"udc-badge\" data-variant=\"error\" data-prominent=\"false\">Error</span>\n    </>\n  );\n}",
      vue: "<template>\n  <span class=\"udc-badge\">Default</span>\n  <span class=\"udc-badge\" data-variant=\"success\">Active</span>\n  <span class=\"udc-badge\" data-variant=\"error\" data-prominent=\"false\">Error</span>\n</template>"
    },
    'breadcrumb': {
      react: "function PageBreadcrumb() {\n  return (\n    <nav className=\"udc-breadcrumb\" aria-label=\"Breadcrumb\">\n      <ol>\n        <li><a href=\"/\">Home</a></li>\n        <li><a href=\"/products\">Products</a></li>\n        <li aria-current=\"page\">Widget Pro</li>\n      </ol>\n    </nav>\n  );\n}",
      vue: "<template>\n  <nav class=\"udc-breadcrumb\" aria-label=\"Breadcrumb\">\n    <ol>\n      <li><a href=\"/\">Home</a></li>\n      <li><a href=\"/products\">Products</a></li>\n      <li aria-current=\"page\">Widget Pro</li>\n    </ol>\n  </nav>\n</template>"
    },
    'tabs': {
      react: "function SectionTabs() {\n  return (\n    <div className=\"udc-tabs\" role=\"tablist\">\n      <button className=\"udc-tab\" role=\"tab\" aria-selected=\"true\">Overview</button>\n      <button className=\"udc-tab\" role=\"tab\">Details</button>\n      <button className=\"udc-tab\" role=\"tab\" disabled>History</button>\n    </div>\n  );\n}",
      vue: "<template>\n  <div class=\"udc-tabs\" role=\"tablist\">\n    <button class=\"udc-tab\" role=\"tab\" aria-selected=\"true\">Overview</button>\n    <button class=\"udc-tab\" role=\"tab\">Details</button>\n    <button class=\"udc-tab\" role=\"tab\" disabled>History</button>\n  </div>\n</template>"
    },
    'divider': {
      react: "/* In your JSX */\n<hr className=\"udc-divider-horizontal\" />\n<hr className=\"udc-divider-horizontal\" data-padding=\"lg\" />",
      vue: "<template>\n  <hr class=\"udc-divider-horizontal\" />\n  <hr class=\"udc-divider-horizontal\" data-padding=\"lg\" />\n</template>"
    },
    'icon-wrapper': {
      react: "<span className=\"udc-icon-wrapper\" data-size=\"32\"\n  style={{ color: 'var(--uds-color-icon-interactive)' }}>\n  <span className=\"material-symbols-outlined\">info</span>\n</span>",
      vue: "<template>\n  <span class=\"udc-icon-wrapper\" data-size=\"32\"\n    :style=\"{ color: 'var(--uds-color-icon-interactive)' }\">\n    <span class=\"material-symbols-outlined\">info</span>\n  </span>\n</template>"
    },
    'spacer': {
      react: "<div className=\"udc-spacer\" data-size=\"200\"></div>",
      vue: "<template>\n  <div class=\"udc-spacer\" data-size=\"200\"></div>\n</template>"
    },
    'nav': {
      react: "import { useState, useRef, useEffect } from 'react';\n\nfunction NavVertical({ items, selected, onSelect }) {\n  return (\n    <nav className=\"udc-nav-vertical\" aria-label=\"Main navigation\">\n      {items.map((item, i) => (\n        <button\n          key={i}\n          className=\"udc-nav-button\"\n          aria-selected={selected === i}\n          onClick={() => onSelect(i)}\n        >\n          <span className=\"material-symbols-outlined\">{item.icon}</span>\n          <span className=\"udc-nav-button__label\">{item.label}</span>\n        </button>\n      ))}\n    </nav>\n  );\n}",
      vue: "<script setup>\nimport { ref } from 'vue';\n\nconst selected = ref(0);\nconst items = [\n  { icon: 'space_dashboard', label: 'Dashboard' },\n  { icon: 'book', label: 'Leasing / CRM' },\n];\n</script>\n\n<template>\n  <nav class=\"udc-nav-vertical\" aria-label=\"Main navigation\">\n    <button\n      v-for=\"(item, i) in items\" :key=\"i\"\n      class=\"udc-nav-button\"\n      :aria-selected=\"selected === i\"\n      @click=\"selected = i\"\n    >\n      <span class=\"material-symbols-outlined\">{{ item.icon }}</span>\n      <span class=\"udc-nav-button__label\">{{ item.label }}</span>\n    </button>\n  </nav>\n</template>"
    }
  };

  document.querySelectorAll('[data-tab-panel="code"]').forEach(function (panel) {
    var page = panel.closest('[data-page]');
    if (!page) return;
    var pageId = page.getAttribute('data-page');
    var cfg = CODE_TAB_CONFIGS[pageId];
    if (!cfg) return;

    var bar = buildFrameworkBar();
    panel.insertBefore(bar, panel.firstChild);

    var htmlPanel = document.createElement('div');
    htmlPanel.setAttribute('data-fw-panel', 'html');
    htmlPanel.className = currentFramework === 'html' ? 'active' : '';
    while (panel.childNodes.length > 1) {
      htmlPanel.appendChild(panel.childNodes[1]);
    }
    panel.appendChild(htmlPanel);

    ['react', 'vue'].forEach(function (fw) {
      var fwPanel = document.createElement('div');
      fwPanel.setAttribute('data-fw-panel', fw);
      fwPanel.className = currentFramework === fw ? 'active' : '';

      var fwLabel = fw === 'react' ? 'React' : 'Vue';
      var impTitle = document.createElement('h3');
      impTitle.className = 'sg-subsection-title';
      impTitle.textContent = fwLabel + ' Usage';
      fwPanel.appendChild(impTitle);

      var codePre = document.createElement('pre');
      codePre.className = 'sg-playground-code';
      codePre.textContent = cfg[fw];
      fwPanel.appendChild(codePre);

      if (cfg.note) {
        var note = document.createElement('p');
        note.className = 'sg-subsection-desc';
        note.style.marginTop = '16px';
        note.textContent = cfg.note;
        fwPanel.appendChild(note);
      }

      fwPanel.querySelectorAll('pre.sg-playground-code').forEach(function (pre) {
        var wrap = document.createElement('div');
        wrap.className = 'sg-code-wrap';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
        wrap.appendChild(buildCopyButton(function () { return pre.textContent; }));
      });

      panel.appendChild(fwPanel);
    });
  });

  /* ========================================================================
     11. DOWNLOAD UDS ZIP
     ======================================================================== */
  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  var dlBtn = document.getElementById('gs-download-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (typeof JSZip === 'undefined') {
        alert('JSZip library failed to load. Please check your internet connection and try again.');
        return;
      }

      var originalText = dlBtn.innerHTML;
      dlBtn.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Building zip\u2026';
      dlBtn.style.pointerEvents = 'none';

      var files = [
        'uds.css',
        'uds.js',
        'tokens/primitives.css',
        'tokens/semantic.css',
        'tokens/text-styles.css',
        'components/button.css',
        'components/text-input.css',
        'components/checkbox.css',
        'components/radio.css',
        'components/badge.css',
        'components/divider.css',
        'components/icon-wrapper.css',
        'components/spacer.css',
        'components/breadcrumb.css',
        'components/tab-horizontal.css'
      ];

      Promise.all(files.map(function (f) {
        return fetch('uds/' + f).then(function (r) {
          if (!r.ok) throw new Error('Failed to fetch ' + f + ' (' + r.status + ')');
          return r.text();
        }).then(function (text) {
          return { path: f, content: text };
        });
      })).then(function (results) {
        var zip = new JSZip();
        var folder = zip.folder('uds');
        results.forEach(function (r) {
          folder.file(r.path, r.content);
        });
        return zip.generateAsync({ type: 'blob' });
      }).then(function (blob) {
        triggerDownload(blob, 'uds.zip');
        dlBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Downloaded!';
        setTimeout(function () {
          dlBtn.innerHTML = originalText;
          dlBtn.style.pointerEvents = '';
        }, 2000);
      }).catch(function (err) {
        console.error('Download failed:', err);
        dlBtn.innerHTML = '<span class="material-symbols-outlined">error</span> Download failed';
        setTimeout(function () {
          dlBtn.innerHTML = originalText;
          dlBtn.style.pointerEvents = '';
        }, 3000);
      });
    });
  }

  /* ========================================================================
     12. CHANGELOG + COMPONENT STATUS + VERSION DROPDOWN
     ======================================================================== */

  var CHANGELOG = [
    {
      version: '0.1',
      date: '2026-04-01',
      changes: [
        { type: 'added', category: null, component: null, text: 'Initial release: 11 components, primitive + semantic tokens, 6 color modes, 4 font families, 3 font scales, 2 density modes' },
        { type: 'added', category: 'tokens', component: null, text: '249 primitive tokens (color, font, text, space, border, style)' },
        { type: 'added', category: 'tokens', component: null, text: '93 semantic color tokens across 6 modes (Base Light, Base Dark, ResMan Light, ResMan Dark, AnyoneHome Light, Inhabit Light)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic font tokens with 4 font families (Inter, Poppins, Roboto, Lexend)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic font-scale tokens with 3 scales (default, smaller, larger)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic space tokens with 2 density modes (default, comfortable)' },
        { type: 'added', category: 'tokens', component: null, text: 'Semantic border tokens (radius + width)' },
        { type: 'added', category: 'tokens', component: null, text: 'Text styles for headings, body, labels, inputs, data cells' },
        { type: 'added', category: 'components', component: 'Button', text: 'Primary, secondary, ghost variants; small + default sizes; icon support; disabled + loading states' },
        { type: 'added', category: 'components', component: 'Text Input', text: 'Label, helper text, error state, character counter, leading/trailing icons' },
        { type: 'added', category: 'components', component: 'Checkbox', text: 'Label, disabled, and error states' },
        { type: 'added', category: 'components', component: 'Radio', text: 'Label, disabled, and error states' },
        { type: 'added', category: 'components', component: 'Badge', text: 'Status variants and sizes' },
        { type: 'added', category: 'components', component: 'Breadcrumb', text: 'Navigation component' },
        { type: 'added', category: 'components', component: 'Tabs', text: 'Horizontal tab component with keyboard navigation' },
        { type: 'added', category: 'components', component: 'Divider', text: 'Horizontal and vertical orientations' },
        { type: 'added', category: 'components', component: 'Icon Wrapper', text: 'Size and color variants for Material Symbols' },
        { type: 'added', category: 'components', component: 'Spacer', text: 'Spacing utility component' },
        { type: 'added', category: 'components', component: 'Nav', text: 'Navigation system: header bar, vertical sidebar, bento dropdown, rail buttons, search, and account actions' }
      ]
    }
  ];

  var STATUS_LABELS = {
    'placeholder':  { label: 'Not Started',       css: 'placeholder'  },
    'blocked':      { label: 'Blocked',            css: 'blocked'      },
    'in-progress':  { label: 'In Progress',        css: 'in-progress'  },
    'review':       { label: 'In Review',          css: 'review'       },
    'production':   { label: 'Production Ready',   css: 'production'   },
    'deprecated':   { label: 'Deprecated',         css: 'deprecated'   }
  };

  var COMPONENT_STATUS = {
    button:         { status: 'in-progress', since: '0.1' },
    'text-input':   { status: 'blocked',     since: '0.1' },
    checkbox:       { status: 'in-progress', since: '0.1' },
    radio:          { status: 'in-progress', since: '0.1' },
    badge:          { status: 'in-progress', since: '0.1' },
    breadcrumb:     { status: 'blocked',     since: '0.1' },
    tabs:           { status: 'blocked',     since: '0.1' },
    divider:        { status: 'blocked',     since: '0.1' },
    'icon-wrapper': { status: 'in-progress', since: '0.1' },
    spacer:         { status: 'in-progress', since: '0.1' },
    nav:            { status: 'blocked',     since: '0.1' }
  };

  var UDS_VERSION = '0.1';

  function renderChangeItems(parent, entries, type) {
    entries.forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'sg-cl-item' + (type === 'deprecated' || type === 'removed' ? ' sg-cl-item--' + type : '');
      var compLabels = '';
      if (entry.component) {
        var comps = Array.isArray(entry.component) ? entry.component : [entry.component];
        comps.forEach(function (c) {
          compLabels += '<span class="sg-cl-component">' + c + '</span>';
        });
      }
      item.innerHTML = compLabels + entry.text;
      parent.appendChild(item);
    });
  }

  function renderCategorySection(parent, categoryTitle, changes, typeOrder) {
    var grouped = {};
    changes.forEach(function (c) {
      if (!grouped[c.type]) grouped[c.type] = [];
      grouped[c.type].push(c);
    });

    var hasEntries = false;
    typeOrder.forEach(function (type) { if (grouped[type]) hasEntries = true; });
    if (!hasEntries) return;

    var catGroup = document.createElement('div');
    catGroup.className = 'sg-cl-group';
    var catTitle = document.createElement('div');
    catTitle.className = 'sg-cl-group-title sg-cl-group-title--added';
    catTitle.textContent = categoryTitle;
    catGroup.appendChild(catTitle);

    typeOrder.forEach(function (type) {
      if (!grouped[type]) return;
      if (categoryTitle) {
        renderChangeItems(catGroup, grouped[type], type);
      }
    });

    parent.appendChild(catGroup);
  }

  function renderGlobalChangelog() {
    var container = document.getElementById('sg-global-changelog');
    if (!container) return;
    container.innerHTML = '';

    CHANGELOG.forEach(function (release) {
      var section = document.createElement('div');
      section.className = 'sg-cl-version';

      var header = document.createElement('div');
      header.className = 'sg-cl-header';
      header.innerHTML = '<span class="sg-cl-ver-num">' + release.version + '</span>' +
        '<span class="sg-cl-ver-date">' + release.date + '</span>';
      section.appendChild(header);

      if (release.migration) {
        var mig = document.createElement('div');
        mig.className = 'sg-cl-migration';
        mig.innerHTML = '<div class="sg-cl-migration-title">Migration Guide</div>' + release.migration;
        section.appendChild(mig);
      }

      var typeOrder = ['added', 'changed', 'fixed', 'deprecated', 'removed'];

      var general = release.changes.filter(function (c) { return !c.category; });
      var tokens = release.changes.filter(function (c) { return c.category === 'tokens'; });
      var components = release.changes.filter(function (c) { return c.category === 'components'; });

      if (general.length) {
        general.forEach(function (entry) {
          var item = document.createElement('div');
          item.className = 'sg-cl-item';
          item.style.fontSize = '15px';
          item.style.fontWeight = '500';
          item.innerHTML = entry.text;
          section.appendChild(item);
        });
      }

      if (tokens.length) {
        renderCategorySection(section, 'Tokens', tokens, typeOrder);
      }

      if (components.length) {
        renderCategorySection(section, 'Components', components, typeOrder);
      }

      container.appendChild(section);
    });
  }

  function renderComponentChangelog(pageId) {
    var panel = document.querySelector('[data-page="' + pageId + '"] [data-tab-panel="changelog"]');
    if (!panel) return;

    var pageName = pageId.split('-').map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');

    var entries = [];
    CHANGELOG.forEach(function (release) {
      var matching = release.changes.filter(function (c) {
        if (!c.component) return false;
        if (Array.isArray(c.component)) {
          return c.component.some(function (comp) { return comp.toLowerCase() === pageName.toLowerCase(); });
        }
        return c.component.toLowerCase() === pageName.toLowerCase();
      });
      if (matching.length > 0) {
        entries.push({ version: release.version, date: release.date, changes: matching });
      }
    });

    if (entries.length === 0) {
      panel.innerHTML = '<p class="sg-changelog-empty">No changes recorded yet. This component was introduced in the initial release.</p>';
      return;
    }

    panel.innerHTML = '';
    entries.forEach(function (release) {
      var section = document.createElement('div');
      section.className = 'sg-cl-version';

      var header = document.createElement('div');
      header.className = 'sg-cl-header';
      header.innerHTML = '<span class="sg-cl-ver-num" style="font-size:22px;">' + release.version + '</span>' +
        '<span class="sg-cl-ver-date">' + release.date + '</span>';
      section.appendChild(header);

      release.changes.forEach(function (c) {
        var item = document.createElement('div');
        item.className = 'sg-cl-item' + (c.type === 'deprecated' || c.type === 'removed' ? ' sg-cl-item--' + c.type : '');
        var typeLabel = '<span class="sg-cl-component">' + c.type + '</span>';
        item.innerHTML = typeLabel + c.text;
        section.appendChild(item);
      });

      panel.appendChild(section);
    });
  }

  function renderStatusBadges() {
    Object.keys(COMPONENT_STATUS).forEach(function (id) {
      var info = COMPONENT_STATUS[id];
      var meta = STATUS_LABELS[info.status];
      if (!meta) return;
      var titleEl = document.querySelector('[data-page="' + id + '"] .sg-page-title');
      if (!titleEl) return;
      if (titleEl.querySelector('.sg-status-badge')) return;
      var badge = document.createElement('span');
      badge.className = 'sg-status-badge sg-status-badge--' + meta.css;
      badge.innerHTML = meta.label + '<span class="sg-status-since">since ' + info.since + '</span>';
      titleEl.appendChild(badge);
    });
  }

  function initVersionDropdown() {
    var dropdown = document.getElementById('sg-version-dropdown');
    if (!dropdown) return;

    var path = window.location.pathname;
    var snapshotMatch = path.match(/\/versions\/([^/]+)\//);
    var basePath = snapshotMatch
      ? path.substring(0, path.indexOf('/versions/')) + '/'
      : path.substring(0, path.lastIndexOf('/') + 1);
    var viewingVersion = snapshotMatch ? snapshotMatch[1] : UDS_VERSION;

    fetch(basePath + 'versions.json').then(function (r) {
      if (!r.ok) throw new Error('no versions.json');
      return r.json();
    }).then(function (data) {
      var latestVersion = data.latest || UDS_VERSION;
      var allVersions = data.versions || data;
      dropdown.innerHTML = '';

      allVersions.forEach(function (v) {
        var opt = document.createElement('option');
        var isLatest = v === latestVersion;
        opt.value = isLatest
          ? basePath + 'index.html'
          : basePath + 'versions/' + v + '/index.html';
        opt.textContent = 'UDS ' + v + (isLatest ? ' (latest)' : '');
        opt.selected = v === viewingVersion;
        dropdown.appendChild(opt);
      });

      dropdown.addEventListener('change', function () {
        if (dropdown.value) {
          window.location.href = dropdown.value;
        }
      });
    }).catch(function () {
      var opt = document.createElement('option');
      opt.textContent = 'UDS ' + UDS_VERSION;
      dropdown.appendChild(opt);
    });
  }

  function initAllChangelogs() {
    renderGlobalChangelog();
    var compPages = Object.keys(COMPONENT_STATUS);
    compPages.forEach(function (id) {
      renderComponentChangelog(id);
    });
  }

  /* ========================================================================
     13. INIT — navigate to current hash
     ======================================================================== */
  renderStatusBadges();
  initVersionDropdown();
  initAllChangelogs();

  const { pageId, tab } = parseHash();
  navigate(pageId, tab);

})();
