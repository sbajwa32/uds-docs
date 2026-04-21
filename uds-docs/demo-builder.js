/* ==========================================================================
   UDS Demo Site Builder
   Generates realistic demo pages using selected UDS components.
   Supports HTML/CSS, React (CDN), and Vue (CDN) live previews + ZIP download.
   ========================================================================== */

(function () {
  'use strict';

  function getBaseUrl() {
    var path = window.location.pathname;
    var idx = path.indexOf('/index.html');
    if (idx === -1) idx = path.lastIndexOf('/');
    var base = path.substring(0, idx);
    if (base.endsWith('/')) base = base.slice(0, -1);
    return window.location.origin + base;
  }

  var DEMO_COMPONENTS = [
    { id: 'button',       label: 'Button' },
    { id: 'text-input',   label: 'Text Input' },
    { id: 'checkbox',     label: 'Checkbox' },
    { id: 'radio',        label: 'Radio' },
    { id: 'dropdown',     label: 'Dropdown' },
    { id: 'search',       label: 'Search' },
    { id: 'badge',        label: 'Badge' },
    { id: 'chip',         label: 'Chip' },
    { id: 'divider',      label: 'Divider' },
    { id: 'icon-wrapper', label: 'Icon Wrapper' },
    { id: 'spacer',       label: 'Spacer' },
    { id: 'breadcrumb',   label: 'Breadcrumb' },
    { id: 'tabs',         label: 'Tabs' },
    { id: 'nav-header',   label: 'Nav Header' },
    { id: 'nav-vertical', label: 'Nav Vertical' },
    { id: 'tile',         label: 'Tile' },
    { id: 'list',         label: 'List' },
    { id: 'data-table',   label: 'Data Table' },
    { id: 'notification', label: 'Notification' },
    { id: 'dialog',       label: 'Dialog' },
    { id: 'tooltip',      label: 'Tooltip' }
  ];

  var STORAGE_KEY = 'uds-demo-history';

  /* ========================================================================
     1. TEMPLATES — Realistic HTML snippets per component
     ======================================================================== */
  var DEMO_TEMPLATES = {
    'nav-header': function () {
      return '<div class="udc-nav-header"><div class="udc-nav-header__left"><div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:24px;color:var(--uds-color-icon-interactive);">apartment</span><span class="udc-nav-logo__text">Boardroom</span></div></div><div class="udc-nav-header__right"><button class="udc-button-ghost" data-icon-only data-size="sm"><span class="material-symbols-outlined">notifications</span></button><button class="udc-button-ghost" data-icon-only data-size="sm"><span class="material-symbols-outlined">account_circle</span></button></div></div>';
    },
    'nav-vertical': function () {
      return '<nav class="udc-nav-vertical" aria-label="Main navigation" style="width:240px;"><button class="udc-nav-button" aria-selected="true"><span class="material-symbols-outlined">space_dashboard</span><span class="udc-nav-button__label">Dashboard</span></button><button class="udc-nav-button"><span class="material-symbols-outlined">book</span><span class="udc-nav-button__label">Leasing / CRM</span></button><button class="udc-nav-button"><span class="material-symbols-outlined">contact_phone</span><span class="udc-nav-button__label">People / Contacts</span></button><button class="udc-nav-button"><span class="material-symbols-outlined">home_work</span><span class="udc-nav-button__label">Property / Assets</span></button><button class="udc-nav-button"><span class="material-symbols-outlined">monetization_on</span><span class="udc-nav-button__label">Accounting</span></button></nav>';
    },
    'breadcrumb': function () {
      return '<nav class="udc-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Home</a></li><li><a href="#">Properties</a></li><li aria-current="page">Riverbend Estates</li></ol></nav>';
    },
    'notification': function () {
      return '<div class="udc-notification" data-variant="info"><span class="udc-notification__icon"><span class="material-symbols-outlined">info</span></span><span class="udc-notification__text">3 invoices are pending review. Please check the table below.</span><button class="udc-notification__close" aria-label="Dismiss"><span class="material-symbols-outlined">close</span></button></div>';
    },
    'search': function () {
      return '<div class="udc-search"><div class="udc-search__field"><span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span><input type="search" placeholder="Search tenants, properties, invoices..." /><button class="udc-search__clear" aria-label="Clear"><span class="material-symbols-outlined">clear</span></button></div></div>';
    },
    'chip': function () {
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="udc-chip" data-variant="filter" aria-selected="true"><span class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span><span class="udc-chip__label">All</span></button><button class="udc-chip" data-variant="filter"><span class="udc-chip__label">Active</span></button><button class="udc-chip" data-variant="filter"><span class="udc-chip__label">Pending</span></button><button class="udc-chip" data-variant="filter"><span class="udc-chip__label">Overdue</span></button></div>';
    },
    'tabs': function () {
      return '<div class="udc-tabs" role="tablist"><button class="udc-tab" role="tab" aria-selected="true">Overview</button><button class="udc-tab" role="tab">Invoices</button><button class="udc-tab" role="tab">Tenants</button><button class="udc-tab" role="tab" disabled>Reports</button></div>';
    },
    'data-table': function () {
      return '<div class="udc-data-table"><table><thead><tr><th class="udc-dt-check"><input type="checkbox" /></th><th>Tenant <span class="udc-dt-sort" data-dir="asc"></span></th><th>Status</th><th>Property</th><th class="udc-dt-align-right">Balance</th><th class="udc-dt-action"></th></tr></thead><tbody><tr><td class="udc-dt-check"><input type="checkbox" /></td><td>Brian Smith</td><td><span class="udc-badge" data-variant="success">Active</span></td><td>Riverbend Estates</td><td class="udc-dt-align-right">$0.00</td><td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td></tr><tr><td class="udc-dt-check"><input type="checkbox" /></td><td>Catherine Lee</td><td><span class="udc-badge" data-variant="warning">Pending</span></td><td>Sunnyvale Towers</td><td class="udc-dt-align-right">$1,200</td><td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td></tr><tr><td class="udc-dt-check"><input type="checkbox" /></td><td>David Brown</td><td><span class="udc-badge" data-variant="error">Overdue</span></td><td>Cedar Hills</td><td class="udc-dt-align-right">$3,450</td><td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td></tr><tr><td class="udc-dt-check"><input type="checkbox" /></td><td>Eva White</td><td><span class="udc-badge" data-variant="success">Active</span></td><td>Oakwood Gardens</td><td class="udc-dt-align-right">$0.00</td><td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td></tr></tbody></table></div>';
    },
    'tile': function () {
      return '<div style="display:flex;gap:16px;flex-wrap:wrap;"><div class="udc-tile" tabindex="0" style="width:240px;"><div class="udc-tile__content"><div class="udc-tile__label">Upload CSV</div><div class="udc-tile__body">Import tenants from a spreadsheet</div></div><span class="udc-tile__chevron"><span class="material-symbols-outlined">chevron_right</span></span></div><div class="udc-tile" tabindex="0" aria-selected="true" style="width:240px;"><div class="udc-tile__content"><div class="udc-tile__label">Manual Entry</div><div class="udc-tile__body">Add tenants one at a time</div></div><span class="udc-tile__chevron"><span class="material-symbols-outlined">chevron_right</span></span></div></div>';
    },
    'list': function () {
      return '<div class="udc-list" style="max-width:280px;"><div class="udc-list-item" tabindex="0" aria-selected="true"><span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">space_dashboard</span></span><span class="udc-list-item__label">Dashboard</span></div><div class="udc-list-item" tabindex="0"><span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">book</span></span><span class="udc-list-item__label">Leasing</span></div><div class="udc-list-item" tabindex="0"><span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">monetization_on</span></span><span class="udc-list-item__label">Accounting</span></div></div>';
    },
    'button': function () {
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="udc-button-primary"><span class="material-symbols-outlined" style="font-size:20px;">add</span> New Tenant</button><button class="udc-button-secondary">Export</button><button class="udc-button-ghost">Cancel</button></div>';
    },
    'text-input': function () {
      return '<div class="udc-text-input" style="max-width:360px;"><label class="udc-text-input__label">Full name<span class="udc-text-input__required"></span></label><div class="udc-text-input__field"><input type="text" placeholder="Enter tenant name..." /></div><div class="udc-text-input__helper"><span>As it appears on the lease</span></div></div>';
    },
    'dropdown': function () {
      return '<div class="udc-dropdown" style="max-width:300px;"><label class="udc-dropdown__label">Property</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox"><span class="udc-dropdown__value" data-placeholder>Select property...</span><span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div><div class="udc-dropdown__list" role="listbox"><div class="udc-dropdown__item" role="option">Riverbend Estates</div><div class="udc-dropdown__item" role="option">Sunnyvale Towers</div><div class="udc-dropdown__item" role="option">Cedar Hills</div></div></div>';
    },
    'checkbox': function () {
      return '<div style="display:flex;flex-direction:column;gap:8px;"><label class="udc-checkbox"><input type="checkbox" checked /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">Send email notification</span></label><label class="udc-checkbox"><input type="checkbox" /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">Include payment history</span></label></div>';
    },
    'radio': function () {
      return '<div class="udc-radio-group" role="radiogroup"><span class="udc-radio-group__legend">Lease type</span><label class="udc-radio"><input type="radio" name="demo-lease" value="fixed" checked /><span class="udc-radio__control"></span><span class="udc-radio__label">Fixed term</span></label><label class="udc-radio"><input type="radio" name="demo-lease" value="month" /><span class="udc-radio__control"></span><span class="udc-radio__label">Month-to-month</span></label></div>';
    },
    'badge': function () {
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;"><span class="udc-badge" data-variant="success">Active</span><span class="udc-badge" data-variant="warning">Pending</span><span class="udc-badge" data-variant="error">Overdue</span><span class="udc-badge" data-variant="secondary">Draft</span></div>';
    },
    'divider': function () {
      return '<hr class="udc-divider-horizontal" />';
    },
    'spacer': function () {
      return '<div class="udc-spacer" data-size="300"></div>';
    },
    'icon-wrapper': function () {
      return '<div style="display:flex;gap:12px;align-items:center;"><span class="udc-icon-wrapper" data-size="24" style="color:var(--uds-color-icon-interactive);"><span class="material-symbols-outlined">info</span></span><span class="udc-icon-wrapper" data-size="24" style="color:var(--uds-color-icon-success);"><span class="material-symbols-outlined">check_circle</span></span><span class="udc-icon-wrapper" data-size="24" style="color:var(--uds-color-icon-error);"><span class="material-symbols-outlined">error</span></span></div>';
    },
    'dialog': function () {
      return '<button class="udc-button-primary" onclick="document.getElementById(\'demo-dlg\').setAttribute(\'data-open\',\'true\');if(window.UDS)UDS.init();">Open Dialog</button><div class="udc-dialog-backdrop" id="demo-dlg" data-open="false"><div class="udc-dialog" role="dialog" aria-modal="true"><div class="udc-dialog__header"><h2 class="udc-dialog__title">Confirm Action</h2><button class="udc-dialog__close" aria-label="Close"><span class="material-symbols-outlined">close</span></button></div><div class="udc-dialog__body"><p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-base);color:var(--uds-color-text-primary);">Are you sure you want to proceed?</p></div><div class="udc-dialog__footer"><button class="udc-button-secondary" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');">Cancel</button><button class="udc-button-primary" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');">Confirm</button></div></div></div>';
    },
    'tooltip': function () {
      return '<div style="display:flex;gap:16px;"><span class="udc-tooltip-wrapper"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">info</span></button><span class="udc-tooltip" role="tooltip">More information</span></span><span class="udc-tooltip-wrapper"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">help</span></button><span class="udc-tooltip" role="tooltip">Need help?</span></span></div>';
    }
  };

  /* ========================================================================
     2. LAYOUT ASSEMBLER — composes templates into a realistic page
     ======================================================================== */
  function has(components, id) { return components.indexOf(id) !== -1; }

  function assembleHTMLBody(components) {
    var sections = [];
    var useShell = has(components, 'nav-header') || has(components, 'nav-vertical');

    if (has(components, 'nav-header')) sections.push(DEMO_TEMPLATES['nav-header']());

    var mainContent = [];

    if (has(components, 'breadcrumb')) mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['breadcrumb']() + '</div>');
    if (has(components, 'notification')) mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['notification']() + '</div>');

    if (has(components, 'tabs')) mainContent.push('<div style="margin-bottom:24px;">' + DEMO_TEMPLATES['tabs']() + '</div>');

    if (has(components, 'search') || has(components, 'chip')) {
      var filterBar = '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;">';
      if (has(components, 'search')) filterBar += '<div style="flex:1;min-width:200px;">' + DEMO_TEMPLATES['search']() + '</div>';
      if (has(components, 'chip')) filterBar += '<div style="flex-shrink:0;padding-top:12px;">' + DEMO_TEMPLATES['chip']() + '</div>';
      filterBar += '</div>';
      mainContent.push(filterBar);
    }

    if (has(components, 'button') && has(components, 'data-table')) {
      mainContent.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h2 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-xl);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0;">Tenants</h2>' + DEMO_TEMPLATES['button']() + '</div>');
    } else if (has(components, 'button')) {
      mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['button']() + '</div>');
    }

    if (has(components, 'data-table')) mainContent.push('<div style="margin-bottom:24px;">' + DEMO_TEMPLATES['data-table']() + '</div>');

    if (has(components, 'tile')) mainContent.push('<div style="margin-bottom:24px;"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 12px;">Quick Actions</h3>' + DEMO_TEMPLATES['tile']() + '</div>');

    if (has(components, 'divider') && mainContent.length > 0) mainContent.push(DEMO_TEMPLATES['divider']());

    var formFields = [];
    if (has(components, 'text-input')) formFields.push(DEMO_TEMPLATES['text-input']());
    if (has(components, 'dropdown')) formFields.push(DEMO_TEMPLATES['dropdown']());
    if (has(components, 'checkbox')) formFields.push(DEMO_TEMPLATES['checkbox']());
    if (has(components, 'radio')) formFields.push(DEMO_TEMPLATES['radio']());

    if (formFields.length > 0) {
      mainContent.push('<div style="margin-top:24px;padding:24px;background:var(--uds-color-surface-subtle);border-radius:var(--uds-border-radius-container-md);"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 16px;">Add Tenant</h3><div style="display:flex;flex-direction:column;gap:16px;">' + formFields.join('') + '</div></div>');
    }

    if (has(components, 'badge') && !has(components, 'data-table')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['badge']() + '</div>');
    if (has(components, 'icon-wrapper')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['icon-wrapper']() + '</div>');
    if (has(components, 'spacer') && mainContent.length > 0) mainContent.push(DEMO_TEMPLATES['spacer']());
    if (has(components, 'dialog')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['dialog']() + '</div>');
    if (has(components, 'tooltip')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['tooltip']() + '</div>');
    if (has(components, 'list') && !has(components, 'nav-vertical')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['list']() + '</div>');

    var mainHtml = mainContent.join('\n');

    if (useShell) {
      var shell = '<div style="display:flex;min-height:calc(100vh - 76px);">';
      if (has(components, 'nav-vertical')) shell += '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;">' + DEMO_TEMPLATES['nav-vertical']() + '</div>';
      else if (has(components, 'list')) shell += '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;width:260px;">' + DEMO_TEMPLATES['list']() + '</div>';
      shell += '<div style="flex:1;padding:24px;overflow-y:auto;">' + mainHtml + '</div></div>';
      sections.push(shell);
    } else {
      sections.push('<div style="max-width:1000px;margin:0 auto;padding:32px 24px;">' + mainHtml + '</div>');
    }

    return sections.join('\n');
  }

  /* ========================================================================
     3. PAGE GENERATORS — full HTML for each framework
     ======================================================================== */
  function getThemeAttrs() {
    var html = document.documentElement;
    var attrs = {};
    ['data-color-scheme', 'data-theme', 'data-font', 'data-font-scale', 'data-density'].forEach(function (a) {
      var v = html.getAttribute(a);
      if (v) attrs[a] = v;
    });
    return attrs;
  }

  function themeAttrString(attrs) {
    return Object.keys(attrs).map(function (k) { return ' ' + k + '="' + attrs[k] + '"'; }).join('');
  }

  function baseHead(title) {
    var origin = getBaseUrl();
    return '<!DOCTYPE html>\n<html lang="en"' + themeAttrString(getThemeAttrs()) + '>\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>' + title + '</title>\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lexend:wght@400;500;700&display=swap" rel="stylesheet" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />\n  <link rel="stylesheet" href="' + origin + '/uds/uds.css" />\n  <style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: var(--uds-font-family); background: var(--uds-color-surface-page-main); color: var(--uds-color-text-primary); }</style>\n</head>\n';
  }

  function generateDemoHTML(components) {
    var origin = getBaseUrl();
    var body = assembleHTMLBody(components);
    return baseHead('UDS Demo — HTML') + '<body>\n' + body + '\n<script src="' + origin + '/uds/uds.js"><\/script>\n</body>\n</html>';
  }


  /* ========================================================================
     4. HISTORY MANAGEMENT
     ======================================================================== */
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveHistory(history) {
    while (history.length > 2) history.shift();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }
    catch (e) {
      if (history.length > 1) { history.shift(); saveHistory(history); }
    }
  }

  function renderHistoryCard() {
    var slot = document.getElementById('sg-demo-history-slot');
    if (!slot) return;
    var history = getHistory();
    if (!history.length) {
      slot.innerHTML = '<div class="sg-demo-history-empty">No previous builds</div>';
      return;
    }
    var last = history[history.length - 1];
    var d = new Date(last.timestamp);
    var timeStr = d.toLocaleString();
    var themeSummary = [];
    if (last.theme.colorScheme) themeSummary.push(last.theme.colorScheme);
    if (last.theme.brand) themeSummary.push(last.theme.brand);
    if (last.theme.font) themeSummary.push(last.theme.font);
    var themeLabel = themeSummary.length ? themeSummary.join(' / ') : 'Default';

    slot.innerHTML = '<div class="sg-demo-history"><div class="sg-demo-history-meta"><strong>Last Build</strong><span>' + timeStr + ' &middot; ' + last.framework.toUpperCase() + ' &middot; ' + last.componentCount + ' components &middot; ' + last.sizeKB + ' KB</span><br><span>Theme: ' + themeLabel + '</span></div><button class="udc-button-secondary" data-size="sm" onclick="window.openPreviousBuild()"><span class="material-symbols-outlined" style="font-size:16px;margin-right:4px;">open_in_new</span>Open</button></div>';
  }

  /* ========================================================================
     5. DIALOG INIT — populate checkboxes
     ======================================================================== */
  window.initDemoDialog = function () {
    var grid = document.getElementById('sg-demo-grid');
    if (!grid || grid.children.length > 0) { renderHistoryCard(); return; }

    DEMO_COMPONENTS.forEach(function (comp) {
      var label = document.createElement('label');
      var statusCls = '';
      if (window.COMPONENT_STATUS_MAP && window.COMPONENT_STATUS_MAP[comp.id]) {
        statusCls = window.COMPONENT_STATUS_MAP[comp.id];
      }
      var dot = statusCls ? ' <span class="sg-demo-status-dot sg-demo-status-dot--' + statusCls + '" title="' + statusCls.replace('-', ' ') + '"></span>' : '';
      label.innerHTML = '<input type="checkbox" checked data-demo-comp="' + comp.id + '" /> ' + comp.label + dot;
      grid.appendChild(label);
    });

    var toggleAll = document.getElementById('sg-demo-toggle-all');
    if (toggleAll) {
      toggleAll.addEventListener('click', function () {
        var boxes = grid.querySelectorAll('input[type="checkbox"]');
        var allChecked = Array.prototype.every.call(boxes, function (b) { return b.checked; });
        boxes.forEach(function (b) { b.checked = !allChecked; });
        toggleAll.textContent = allChecked ? 'Select All' : 'Deselect All';
      });
    }

    renderHistoryCard();
  };

  function getSelectedComponents() {
    var grid = document.getElementById('sg-demo-grid');
    if (!grid) return [];
    var boxes = grid.querySelectorAll('input[type="checkbox"]:checked');
    return Array.prototype.map.call(boxes, function (b) { return b.getAttribute('data-demo-comp'); });
  }

  /* ========================================================================
     6. BUILD PREVIEW
     ======================================================================== */
  window.buildDemoPreview = function () {
    var btn = document.getElementById('sg-demo-preview-btn');
    var errEl = document.getElementById('sg-demo-error');
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

    var components = getSelectedComponents();
    if (!components.length) {
      if (errEl) { errEl.textContent = 'Select at least one component.'; errEl.style.display = 'block'; }
      return;
    }

    var origLabel = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="sg-demo-spinner"></span>Building...';

    setTimeout(function () {
      try {
        var html = generateDemoHTML(components);

        openDemoOverlay(html);

        var attrs = getThemeAttrs();
        var entry = {
          timestamp: new Date().toISOString(),
          framework: 'html',
          theme: {
            colorScheme: attrs['data-color-scheme'] || '',
            brand: attrs['data-theme'] || '',
            font: attrs['data-font'] || ''
          },
          components: components,
          componentCount: components.length,
          sizeKB: Math.round(html.length / 1024),
          blobHtml: html
        };

        var history = getHistory();
        history.push(entry);
        saveHistory(history);
        renderHistoryCard();
      } catch (e) {
        if (errEl) { errEl.textContent = 'Build failed: ' + e.message; errEl.style.display = 'block'; }
      }

      btn.disabled = false;
      btn.innerHTML = origLabel;
    }, 50);
  };

  /* ========================================================================
     7. OPEN PREVIOUS BUILD
     ======================================================================== */
  window.openPreviousBuild = function () {
    var history = getHistory();
    if (!history.length) return;
    var last = history[history.length - 1];
    if (last.blobHtml) openDemoOverlay(last.blobHtml);
  };

  function openDemoOverlay(html) {
    var existing = document.getElementById('sg-demo-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'sg-demo-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:var(--uds-color-surface-page-main);display:flex;flex-direction:column;';

    var toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--uds-color-surface-interactive-default);color:var(--uds-color-text-inverse);font-family:var(--uds-font-family);font-size:14px;flex-shrink:0;';
    toolbar.innerHTML = '<span style="font-weight:700;">UDS Demo Preview</span><div style="display:flex;gap:8px;"><button onclick="var b=new Blob([document.getElementById(\'sg-demo-iframe\').srcdoc],{type:\'text/html\'});var a=document.createElement(\'a\');a.href=URL.createObjectURL(b);a.download=\'demo.html\';a.click();" style="background:rgba(255,255,255,0.15);border:none;color:inherit;padding:4px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;">Save HTML</button><button onclick="document.getElementById(\'sg-demo-overlay\').remove();" style="background:rgba(255,255,255,0.15);border:none;color:inherit;padding:4px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;">Close</button></div>';

    var iframe = document.createElement('iframe');
    iframe.id = 'sg-demo-iframe';
    iframe.srcdoc = html;
    iframe.style.cssText = 'flex:1;border:none;width:100%;';

    overlay.appendChild(toolbar);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    document.getElementById('sg-demo-backdrop').setAttribute('data-open', 'false');
  }

  /* ========================================================================
     8. DOWNLOAD ZIP
     ======================================================================== */
  window.downloadDemoProject = function () {
    var btn = document.getElementById('sg-demo-download-btn');
    var errEl = document.getElementById('sg-demo-error');
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

    var components = getSelectedComponents();
    if (!components.length) {
      if (errEl) { errEl.textContent = 'Select at least one component.'; errEl.style.display = 'block'; }
      return;
    }

    if (typeof JSZip === 'undefined') {
      if (errEl) { errEl.textContent = 'JSZip not available.'; errEl.style.display = 'block'; }
      return;
    }

    var origLabel = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="sg-demo-spinner"></span>Packaging...';

    setTimeout(function () {
      try {
        var zip = new JSZip();
        var origin = getBaseUrl();

        zip.file('index.html', generateDemoHTML(components));
        downloadUdsFiles(zip, 'uds/', origin).then(function () {
          triggerZipDownload(zip, 'demo-html.zip');
          btn.disabled = false; btn.innerHTML = origLabel;
        });
      } catch (e) {
        if (errEl) { errEl.textContent = 'Download failed: ' + e.message; errEl.style.display = 'block'; }
        btn.disabled = false; btn.innerHTML = origLabel;
      }
    }, 50);
  };

  var UDS_FILES = [
    'uds.css', 'uds.js', 'tokens/primitives.css', 'tokens/semantic.css', 'tokens/text-styles.css',
    'components/button.css', 'components/text-input.css', 'components/text-input.js',
    'components/checkbox.css', 'components/checkbox.js', 'components/radio.css',
    'components/badge.css', 'components/divider.css', 'components/icon-wrapper.css',
    'components/spacer.css', 'components/breadcrumb.css', 'components/tab-horizontal.css',
    'components/tabs.js', 'components/dropdown.css', 'components/dropdown.js',
    'components/nav-header.css', 'components/nav-header.js', 'components/nav-vertical.css',
    'components/nav-vertical.js', 'components/notification.css', 'components/notification.js',
    'components/dialog.css', 'components/dialog.js', 'components/tile.css', 'components/tile.js',
    'components/list.css', 'components/list.js', 'components/data-table.css', 'components/data-table.js',
    'components/chip.css', 'components/chip.js', 'components/search.css', 'components/search.js',
    'components/tooltip.css'
  ];

  function downloadUdsFiles(zip, prefix, origin) {
    return Promise.all(UDS_FILES.map(function (f) {
      return fetch(origin + '/uds/' + f).then(function (r) { return r.text(); }).then(function (text) {
        zip.file(prefix + f, text);
      }).catch(function () {});
    }));
  }

  function triggerZipDownload(zip, filename) {
    zip.generateAsync({ type: 'blob' }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

})();
