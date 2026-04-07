/* ==========================================================================
   UDS Demo Site Builder
   Generates realistic demo pages using selected UDS components.
   Supports HTML/CSS, React (CDN), and Vue (CDN) live previews + ZIP download.
   ========================================================================== */

(function () {
  'use strict';

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
    var origin = window.location.origin;
    return '<!DOCTYPE html>\n<html lang="en"' + themeAttrString(getThemeAttrs()) + '>\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>' + title + '</title>\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lexend:wght@400;500;700&display=swap" rel="stylesheet" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />\n  <link rel="stylesheet" href="' + origin + '/uds/uds.css" />\n  <style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: var(--uds-font-family); background: var(--uds-color-surface-page-main); color: var(--uds-color-text-primary); }</style>\n</head>\n';
  }

  function generateDemoHTML(components) {
    var origin = window.location.origin;
    var body = assembleHTMLBody(components);
    return baseHead('UDS Demo — HTML') + '<body>\n' + body + '\n<script src="' + origin + '/uds/uds.js"><\/script>\n</body>\n</html>';
  }

  /* ========================================================================
     REACT TEMPLATES — proper JSX with useState hooks, no uds.js
     ======================================================================== */
  var REACT_TEMPLATES = {
    'nav-header': function () { return '      <div className="udc-nav-header">\n        <div className="udc-nav-header__left">\n          <div className="udc-nav-logo"><span className="material-symbols-outlined" style={{fontSize:24,color:"var(--uds-color-icon-interactive)"}}>apartment</span><span className="udc-nav-logo__text">Boardroom</span></div>\n        </div>\n        <div className="udc-nav-header__right">\n          <button className="udc-button-ghost" data-icon-only data-size="sm"><span className="material-symbols-outlined">notifications</span></button>\n          <button className="udc-button-ghost" data-icon-only data-size="sm"><span className="material-symbols-outlined">account_circle</span></button>\n        </div>\n      </div>'; },
    'nav-vertical': function () { return '        <nav className="udc-nav-vertical" aria-label="Main navigation" style={{width:240}}>\n          {["Dashboard","Leasing / CRM","People / Contacts","Property / Assets","Accounting"].map((label, i) => (\n            <button key={i} className="udc-nav-button" aria-selected={navIdx === i} onClick={() => setNavIdx(i)}>\n              <span className="material-symbols-outlined">{["space_dashboard","book","contact_phone","home_work","monetization_on"][i]}</span>\n              <span className="udc-nav-button__label">{label}</span>\n            </button>\n          ))}\n        </nav>'; },
    'breadcrumb': function () { return '        <nav className="udc-breadcrumb" aria-label="Breadcrumb" style={{marginBottom:16}}><ol><li><a href="#">Home</a></li><li><a href="#">Properties</a></li><li aria-current="page">Riverbend Estates</li></ol></nav>'; },
    'notification': function () { return '        {showNotif && <div className="udc-notification" data-variant="info" style={{marginBottom:16}}><span className="udc-notification__icon"><span className="material-symbols-outlined">info</span></span><span className="udc-notification__text">3 invoices are pending review.</span><button className="udc-notification__close" aria-label="Dismiss" onClick={() => setShowNotif(false)}><span className="material-symbols-outlined">close</span></button></div>}'; },
    'tabs': function () { return '        <div className="udc-tabs" role="tablist" style={{marginBottom:24}}>\n          {["Overview","Invoices","Tenants"].map((t, i) => (\n            <button key={i} className="udc-tab" role="tab" aria-selected={activeTab === i} onClick={() => setActiveTab(i)}>{t}</button>\n          ))}\n          <button className="udc-tab" role="tab" disabled>Reports</button>\n        </div>'; },
    'search': function () { return '        <div className="udc-search" data-has-value={searchVal.length > 0 ? "true" : "false"} style={{flex:1,minWidth:200}}>\n          <div className="udc-search__field">\n            <span className="udc-search__icon"><span className="material-symbols-outlined">search</span></span>\n            <input type="search" placeholder="Search tenants, properties..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />\n            <button className="udc-search__clear" aria-label="Clear" onClick={() => setSearchVal("")}><span className="material-symbols-outlined">clear</span></button>\n          </div>\n        </div>'; },
    'chip': function () { return '        <div style={{flexShrink:0,paddingTop:12,display:"flex",gap:8}}>\n          {["All","Active","Pending","Overdue"].map(f => (\n            <button key={f} className="udc-chip" data-variant="filter" aria-selected={activeFilters.has(f)} onClick={() => { const s = new Set(activeFilters); s.has(f) ? s.delete(f) : s.add(f); setActiveFilters(s); }}>\n              {activeFilters.has(f) && <span className="udc-chip__leading-icon"><span className="material-symbols-outlined">check</span></span>}\n              <span className="udc-chip__label">{f}</span>\n            </button>\n          ))}\n        </div>'; },
    'button': function () { return '        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>\n          <button className="udc-button-primary"><span className="material-symbols-outlined" style={{fontSize:20}}>add</span> New Tenant</button>\n          <button className="udc-button-secondary">Export</button>\n          <button className="udc-button-ghost">Cancel</button>\n        </div>'; },
    'data-table': function () { return '        <div className="udc-data-table" style={{marginBottom:24}}>\n          <table>\n            <thead><tr>\n              <th className="udc-dt-check"><input type="checkbox" checked={checkedRows.size === 4} onChange={() => setCheckedRows(checkedRows.size === 4 ? new Set() : new Set([0,1,2,3]))} /></th>\n              <th>Tenant <span className="udc-dt-sort" data-dir={sortDir} onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} style={{cursor:"pointer"}}></span></th>\n              <th>Status</th>\n              <th>Property</th>\n              <th className="udc-dt-align-right">Balance</th>\n              <th className="udc-dt-action"></th>\n            </tr></thead>\n            <tbody>\n              {tenants.map((t, i) => (\n                <tr key={i}>\n                  <td className="udc-dt-check"><input type="checkbox" checked={checkedRows.has(i)} onChange={() => { const s = new Set(checkedRows); s.has(i) ? s.delete(i) : s.add(i); setCheckedRows(s); }} /></td>\n                  <td>{t.name}</td>\n                  <td><span className="udc-badge" data-variant={t.variant}>{t.status}</span></td>\n                  <td>{t.property}</td>\n                  <td className="udc-dt-align-right">{t.balance}</td>\n                  <td className="udc-dt-action"><button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">more_vert</span></button></td>\n                </tr>\n              ))}\n            </tbody>\n          </table>\n        </div>'; },
    'tile': function () { return '        <div style={{marginBottom:24}}>\n          <h3 style={{fontFamily:"var(--uds-font-family)",fontSize:"var(--uds-font-size-lg)",fontWeight:"var(--uds-font-weight-bold)",margin:"0 0 12px"}}>Quick Actions</h3>\n          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>\n            {["Upload CSV","Manual Entry"].map((label, i) => (\n              <div key={i} className="udc-tile" tabIndex={0} aria-selected={selectedTile === i} onClick={() => setSelectedTile(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedTile(i); }}} style={{width:240}}>\n                <div className="udc-tile__content"><div className="udc-tile__label">{label}</div><div className="udc-tile__body">{i === 0 ? "Import from spreadsheet" : "Add one at a time"}</div></div>\n                <span className="udc-tile__chevron"><span className="material-symbols-outlined">chevron_right</span></span>\n              </div>\n            ))}\n          </div>\n        </div>'; },
    'list': function () { return '        <div className="udc-list" style={{maxWidth:280}}>\n          {["Dashboard","Leasing","Accounting"].map((label, i) => (\n            <div key={i} className="udc-list-item" tabIndex={0} aria-selected={listIdx === i} onClick={() => setListIdx(i)}>\n              <span className="udc-list-item__leading-icon"><span className="material-symbols-outlined">{["space_dashboard","book","monetization_on"][i]}</span></span>\n              <span className="udc-list-item__label">{label}</span>\n            </div>\n          ))}\n        </div>'; },
    'text-input': function () { return '        <div className="udc-text-input" style={{maxWidth:360}}>\n          <label className="udc-text-input__label">Full name<span className="udc-text-input__required"></span></label>\n          <div className="udc-text-input__field"><input type="text" placeholder="Enter tenant name..." value={nameVal} onChange={e => setNameVal(e.target.value)} /></div>\n          <div className="udc-text-input__helper"><span>As it appears on the lease</span></div>\n        </div>'; },
    'dropdown': function () { return '        <div className="udc-dropdown" data-open={ddOpen ? "true" : "false"} style={{maxWidth:300}}>\n          <label className="udc-dropdown__label">Property</label>\n          <div className="udc-dropdown__trigger" tabIndex={0} role="combobox" aria-expanded={ddOpen} aria-haspopup="listbox" onClick={() => setDdOpen(!ddOpen)}>\n            <span className="udc-dropdown__value" {...(ddVal ? {} : {"data-placeholder": true})}>{ddVal || "Select property..."}</span>\n            <span className="udc-dropdown__chevron"><span className="material-symbols-outlined">keyboard_arrow_down</span></span>\n          </div>\n          <div className="udc-dropdown__list" role="listbox">\n            {["Riverbend Estates","Sunnyvale Towers","Cedar Hills"].map(opt => (\n              <div key={opt} className="udc-dropdown__item" role="option" aria-selected={ddVal === opt} onClick={() => { setDdVal(opt); setDdOpen(false); }}>{opt}</div>\n            ))}\n          </div>\n        </div>'; },
    'checkbox': function () { return '        <div style={{display:"flex",flexDirection:"column",gap:8}}>\n          <label className="udc-checkbox"><input type="checkbox" checked={checks.email} onChange={() => setChecks({...checks, email: !checks.email})} /><span className="udc-checkbox__control"></span><span className="udc-checkbox__label">Send email notification</span></label>\n          <label className="udc-checkbox"><input type="checkbox" checked={checks.history} onChange={() => setChecks({...checks, history: !checks.history})} /><span className="udc-checkbox__control"></span><span className="udc-checkbox__label">Include payment history</span></label>\n        </div>'; },
    'radio': function () { return '        <div className="udc-radio-group" role="radiogroup">\n          <span className="udc-radio-group__legend">Lease type</span>\n          {["Fixed term","Month-to-month"].map((label, i) => (\n            <label key={i} className="udc-radio"><input type="radio" name="lease" checked={leaseType === i} onChange={() => setLeaseType(i)} /><span className="udc-radio__control"></span><span className="udc-radio__label">{label}</span></label>\n          ))}\n        </div>'; },
    'badge': function () { return '        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>\n          <span className="udc-badge" data-variant="success">Active</span>\n          <span className="udc-badge" data-variant="warning">Pending</span>\n          <span className="udc-badge" data-variant="error">Overdue</span>\n          <span className="udc-badge" data-variant="secondary">Draft</span>\n        </div>'; },
    'divider': function () { return '        <hr className="udc-divider-horizontal" />'; },
    'spacer': function () { return '        <div className="udc-spacer" data-size="300"></div>'; },
    'icon-wrapper': function () { return '        <div style={{display:"flex",gap:12,alignItems:"center",marginTop:16}}>\n          <span className="udc-icon-wrapper" data-size="24" style={{color:"var(--uds-color-icon-interactive)"}}><span className="material-symbols-outlined">info</span></span>\n          <span className="udc-icon-wrapper" data-size="24" style={{color:"var(--uds-color-icon-success)"}}><span className="material-symbols-outlined">check_circle</span></span>\n          <span className="udc-icon-wrapper" data-size="24" style={{color:"var(--uds-color-icon-error)"}}><span className="material-symbols-outlined">error</span></span>\n        </div>'; },
    'dialog': function () { return '        <div style={{marginTop:16}}>\n          <button className="udc-button-primary" onClick={() => setDlgOpen(true)}>Open Dialog</button>\n          {dlgOpen && <div className="udc-dialog-backdrop" data-open="true" onClick={e => { if (e.target === e.currentTarget) setDlgOpen(false); }}>\n            <div className="udc-dialog" role="dialog" aria-modal="true">\n              <div className="udc-dialog__header"><h2 className="udc-dialog__title">Confirm Action</h2><button className="udc-dialog__close" aria-label="Close" onClick={() => setDlgOpen(false)}><span className="material-symbols-outlined">close</span></button></div>\n              <div className="udc-dialog__body"><p style={{fontFamily:"var(--uds-font-family)",fontSize:"var(--uds-font-size-base)",color:"var(--uds-color-text-primary)"}}>Are you sure you want to proceed?</p></div>\n              <div className="udc-dialog__footer"><button className="udc-button-secondary" onClick={() => setDlgOpen(false)}>Cancel</button><button className="udc-button-primary" onClick={() => setDlgOpen(false)}>Confirm</button></div>\n            </div>\n          </div>}\n        </div>'; },
    'tooltip': function () { return '        <div style={{display:"flex",gap:16,marginTop:16}}>\n          <span className="udc-tooltip-wrapper"><button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">info</span></button><span className="udc-tooltip" role="tooltip">More information</span></span>\n          <span className="udc-tooltip-wrapper"><button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">help</span></button><span className="udc-tooltip" role="tooltip">Need help?</span></span>\n        </div>'; }
  };

  function assembleReactJSX(components) {
    var useShell = has(components, 'nav-header') || has(components, 'nav-vertical');
    var parts = [];

    if (has(components, 'nav-header')) parts.push(REACT_TEMPLATES['nav-header']());

    var main = [];
    if (has(components, 'breadcrumb')) main.push(REACT_TEMPLATES['breadcrumb']());
    if (has(components, 'notification')) main.push(REACT_TEMPLATES['notification']());
    if (has(components, 'tabs')) main.push(REACT_TEMPLATES['tabs']());

    if (has(components, 'search') || has(components, 'chip')) {
      var fb = '        <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap",marginBottom:16}}>\n';
      if (has(components, 'search')) fb += REACT_TEMPLATES['search']() + '\n';
      if (has(components, 'chip')) fb += REACT_TEMPLATES['chip']() + '\n';
      fb += '        </div>';
      main.push(fb);
    }

    if (has(components, 'button') && has(components, 'data-table')) {
      main.push('        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>\n          <h2 style={{fontFamily:"var(--uds-font-family)",fontSize:"var(--uds-font-size-xl)",fontWeight:"var(--uds-font-weight-bold)",margin:0}}>Tenants</h2>\n' + REACT_TEMPLATES['button']() + '\n        </div>');
    } else if (has(components, 'button')) {
      main.push('<div style={{marginBottom:16}}>' + REACT_TEMPLATES['button']() + '</div>');
    }

    if (has(components, 'data-table')) main.push(REACT_TEMPLATES['data-table']());
    if (has(components, 'tile')) main.push(REACT_TEMPLATES['tile']());
    if (has(components, 'divider') && main.length > 0) main.push(REACT_TEMPLATES['divider']());

    var formFields = [];
    if (has(components, 'text-input')) formFields.push(REACT_TEMPLATES['text-input']());
    if (has(components, 'dropdown')) formFields.push(REACT_TEMPLATES['dropdown']());
    if (has(components, 'checkbox')) formFields.push(REACT_TEMPLATES['checkbox']());
    if (has(components, 'radio')) formFields.push(REACT_TEMPLATES['radio']());
    if (formFields.length) {
      main.push('        <div style={{marginTop:24,padding:24,background:"var(--uds-color-surface-subtle)",borderRadius:"var(--uds-border-radius-container-md)"}}>\n          <h3 style={{fontFamily:"var(--uds-font-family)",fontSize:"var(--uds-font-size-lg)",fontWeight:"var(--uds-font-weight-bold)",margin:"0 0 16px"}}>Add Tenant</h3>\n          <div style={{display:"flex",flexDirection:"column",gap:16}}>\n' + formFields.join('\n') + '\n          </div>\n        </div>');
    }

    if (has(components, 'badge') && !has(components, 'data-table')) main.push(REACT_TEMPLATES['badge']());
    if (has(components, 'icon-wrapper')) main.push(REACT_TEMPLATES['icon-wrapper']());
    if (has(components, 'spacer') && main.length > 0) main.push(REACT_TEMPLATES['spacer']());
    if (has(components, 'dialog')) main.push(REACT_TEMPLATES['dialog']());
    if (has(components, 'tooltip')) main.push(REACT_TEMPLATES['tooltip']());
    if (has(components, 'list') && !has(components, 'nav-vertical')) main.push('<div style={{marginTop:16}}>' + REACT_TEMPLATES['list']() + '</div>');

    var mainJsx = main.join('\n');

    if (useShell) {
      var shell = '      <div style={{display:"flex",minHeight:"calc(100vh - 76px)"}}>\n';
      if (has(components, 'nav-vertical')) shell += '        <div style={{borderRight:"1px solid var(--uds-color-border-secondary)",padding:"16px 0",flexShrink:0}}>\n' + REACT_TEMPLATES['nav-vertical']() + '\n        </div>\n';
      else if (has(components, 'list')) shell += '        <div style={{borderRight:"1px solid var(--uds-color-border-secondary)",padding:"16px 0",flexShrink:0,width:260}}>\n' + REACT_TEMPLATES['list']() + '\n        </div>\n';
      shell += '        <div style={{flex:1,padding:24,overflowY:"auto"}}>\n' + mainJsx + '\n        </div>\n      </div>';
      parts.push(shell);
    } else {
      parts.push('      <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>\n' + mainJsx + '\n      </div>');
    }

    return parts.join('\n');
  }

  function buildReactStateHooks(components) {
    var hooks = [];
    if (has(components, 'nav-vertical')) hooks.push('  const [navIdx, setNavIdx] = useState(0);');
    if (has(components, 'notification')) hooks.push('  const [showNotif, setShowNotif] = useState(true);');
    if (has(components, 'tabs')) hooks.push('  const [activeTab, setActiveTab] = useState(0);');
    if (has(components, 'search')) hooks.push('  const [searchVal, setSearchVal] = useState("");');
    if (has(components, 'chip')) hooks.push('  const [activeFilters, setActiveFilters] = useState(new Set(["All"]));');
    if (has(components, 'data-table')) {
      hooks.push('  const [checkedRows, setCheckedRows] = useState(new Set());');
      hooks.push('  const [sortDir, setSortDir] = useState("asc");');
      hooks.push('  const tenants = [\n    {name:"Brian Smith",status:"Active",variant:"success",property:"Riverbend Estates",balance:"$0.00"},\n    {name:"Catherine Lee",status:"Pending",variant:"warning",property:"Sunnyvale Towers",balance:"$1,200"},\n    {name:"David Brown",status:"Overdue",variant:"error",property:"Cedar Hills",balance:"$3,450"},\n    {name:"Eva White",status:"Active",variant:"success",property:"Oakwood Gardens",balance:"$0.00"}\n  ];');
    }
    if (has(components, 'tile')) hooks.push('  const [selectedTile, setSelectedTile] = useState(1);');
    if (has(components, 'list')) hooks.push('  const [listIdx, setListIdx] = useState(0);');
    if (has(components, 'text-input')) hooks.push('  const [nameVal, setNameVal] = useState("");');
    if (has(components, 'dropdown')) {
      hooks.push('  const [ddOpen, setDdOpen] = useState(false);');
      hooks.push('  const [ddVal, setDdVal] = useState("");');
    }
    if (has(components, 'checkbox')) hooks.push('  const [checks, setChecks] = useState({email: true, history: false});');
    if (has(components, 'radio')) hooks.push('  const [leaseType, setLeaseType] = useState(0);');
    if (has(components, 'dialog')) hooks.push('  const [dlgOpen, setDlgOpen] = useState(false);');
    return hooks.join('\n');
  }

  function generateDemoReact(components) {
    var origin = window.location.origin;
    var stateHooks = buildReactStateHooks(components);
    var jsx = assembleReactJSX(components);

    return '<!DOCTYPE html>\n<html lang="en"' + themeAttrString(getThemeAttrs()) + '>\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>UDS Demo — React</title>\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lexend:wght@400;500;700&display=swap" rel="stylesheet" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />\n  <link rel="stylesheet" href="' + origin + '/uds/uds.css" />\n  <style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: var(--uds-font-family); background: var(--uds-color-surface-page-main); color: var(--uds-color-text-primary); } #root { min-height: 100vh; }</style>\n</head>\n<body>\n  <div id="root"><p style="padding:40px;text-align:center;color:#999;">Loading React + Babel...</p></div>\n  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>\n  <script type="text/babel">\n  const { useState } = React;\n\n  function App() {\n' + stateHooks + '\n\n    return (\n      <>\n' + jsx + '\n      </>\n    );\n  }\n\n  ReactDOM.createRoot(document.getElementById("root")).render(<App />);\n  <\/script>\n</body>\n</html>';
  }

  /* ========================================================================
     VUE TEMPLATES — proper template + setup with ref(), no uds.js
     ======================================================================== */
  function buildVueSetup(components) {
    var lines = ['    const { ref } = Vue;'];
    if (has(components, 'nav-vertical')) lines.push('    const navIdx = ref(0);');
    if (has(components, 'notification')) lines.push('    const showNotif = ref(true);');
    if (has(components, 'tabs')) lines.push('    const activeTab = ref(0);');
    if (has(components, 'search')) lines.push('    const searchVal = ref("");');
    if (has(components, 'chip')) lines.push('    const activeFilters = ref(new Set(["All"]));');
    if (has(components, 'chip')) lines.push('    function toggleFilter(f) { const s = new Set(activeFilters.value); s.has(f) ? s.delete(f) : s.add(f); activeFilters.value = s; }');
    if (has(components, 'data-table')) {
      lines.push('    const checkedRows = ref(new Set());');
      lines.push('    const sortDir = ref("asc");');
      lines.push('    const tenants = [\n      {name:"Brian Smith",status:"Active",variant:"success",property:"Riverbend Estates",balance:"$0.00"},\n      {name:"Catherine Lee",status:"Pending",variant:"warning",property:"Sunnyvale Towers",balance:"$1,200"},\n      {name:"David Brown",status:"Overdue",variant:"error",property:"Cedar Hills",balance:"$3,450"},\n      {name:"Eva White",status:"Active",variant:"success",property:"Oakwood Gardens",balance:"$0.00"}\n    ];');
      lines.push('    function toggleRow(i) { const s = new Set(checkedRows.value); s.has(i) ? s.delete(i) : s.add(i); checkedRows.value = s; }');
      lines.push('    function toggleAllRows() { checkedRows.value = checkedRows.value.size === 4 ? new Set() : new Set([0,1,2,3]); }');
    }
    if (has(components, 'tile')) lines.push('    const selectedTile = ref(1);');
    if (has(components, 'list')) lines.push('    const listIdx = ref(0);');
    if (has(components, 'text-input')) lines.push('    const nameVal = ref("");');
    if (has(components, 'dropdown')) { lines.push('    const ddOpen = ref(false);'); lines.push('    const ddVal = ref("");'); }
    if (has(components, 'checkbox')) lines.push('    const checks = ref({email: true, history: false});');
    if (has(components, 'radio')) lines.push('    const leaseType = ref(0);');
    if (has(components, 'dialog')) lines.push('    const dlgOpen = ref(false);');
    lines.push('    return {' + lines.filter(function(l){return l.indexOf('const ') !== -1 && l.indexOf('ref(') !== -1;}).map(function(l){var m=l.match(/const (\w+)/);return m?m[1]:null;}).filter(Boolean).join(', ') + (has(components,'chip')?', toggleFilter':'') + (has(components,'data-table')?', tenants, toggleRow, toggleAllRows':'') + '};');
    return lines.join('\n');
  }

  function assembleVueTemplate(components) {
    var useShell = has(components, 'nav-header') || has(components, 'nav-vertical');
    var parts = [];

    if (has(components, 'nav-header')) parts.push('    <div class="udc-nav-header"><div class="udc-nav-header__left"><div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:24px;color:var(--uds-color-icon-interactive);">apartment</span><span class="udc-nav-logo__text">Boardroom</span></div></div><div class="udc-nav-header__right"><button class="udc-button-ghost" data-icon-only data-size="sm"><span class="material-symbols-outlined">notifications</span></button><button class="udc-button-ghost" data-icon-only data-size="sm"><span class="material-symbols-outlined">account_circle</span></button></div></div>');

    var main = [];
    if (has(components, 'breadcrumb')) main.push('        <nav class="udc-breadcrumb" aria-label="Breadcrumb" style="margin-bottom:16px;"><ol><li><a href="#">Home</a></li><li><a href="#">Properties</a></li><li aria-current="page">Riverbend Estates</li></ol></nav>');
    if (has(components, 'notification')) main.push('        <div v-if="showNotif" class="udc-notification" data-variant="info" style="margin-bottom:16px;"><span class="udc-notification__icon"><span class="material-symbols-outlined">info</span></span><span class="udc-notification__text">3 invoices are pending review.</span><button class="udc-notification__close" aria-label="Dismiss" @click="showNotif=false"><span class="material-symbols-outlined">close</span></button></div>');
    if (has(components, 'tabs')) main.push('        <div class="udc-tabs" role="tablist" style="margin-bottom:24px;"><button v-for="(t,i) in [\'Overview\',\'Invoices\',\'Tenants\']" :key="i" class="udc-tab" role="tab" :aria-selected="activeTab===i" @click="activeTab=i">{{t}}</button><button class="udc-tab" role="tab" disabled>Reports</button></div>');

    if (has(components, 'search') || has(components, 'chip')) {
      var fb = '        <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;">';
      if (has(components, 'search')) fb += '<div class="udc-search" :data-has-value="searchVal.length>0?\'true\':\'false\'" style="flex:1;min-width:200px;"><div class="udc-search__field"><span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span><input type="search" placeholder="Search tenants..." v-model="searchVal" /><button class="udc-search__clear" aria-label="Clear" @click="searchVal=\'\'"><span class="material-symbols-outlined">clear</span></button></div></div>';
      if (has(components, 'chip')) fb += '<div style="flex-shrink:0;padding-top:12px;display:flex;gap:8px;"><button v-for="f in [\'All\',\'Active\',\'Pending\',\'Overdue\']" :key="f" class="udc-chip" data-variant="filter" :aria-selected="activeFilters.has(f)" @click="toggleFilter(f)"><span v-if="activeFilters.has(f)" class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span><span class="udc-chip__label">{{f}}</span></button></div>';
      fb += '</div>';
      main.push(fb);
    }

    if (has(components, 'button')) main.push('        <div style="display:flex;gap:8px;margin-bottom:16px;"><button class="udc-button-primary"><span class="material-symbols-outlined" style="font-size:20px;">add</span> New Tenant</button><button class="udc-button-secondary">Export</button><button class="udc-button-ghost">Cancel</button></div>');

    if (has(components, 'data-table')) main.push('        <div class="udc-data-table" style="margin-bottom:24px;"><table><thead><tr><th class="udc-dt-check"><input type="checkbox" :checked="checkedRows.size===4" @change="toggleAllRows" /></th><th style="cursor:pointer;" @click="sortDir=sortDir===\'asc\'?\'desc\':\'asc\'">Tenant <span class="udc-dt-sort" :data-dir="sortDir"></span></th><th>Status</th><th>Property</th><th class="udc-dt-align-right">Balance</th><th class="udc-dt-action"></th></tr></thead><tbody><tr v-for="(t,i) in tenants" :key="i"><td class="udc-dt-check"><input type="checkbox" :checked="checkedRows.has(i)" @change="toggleRow(i)" /></td><td>{{t.name}}</td><td><span class="udc-badge" :data-variant="t.variant">{{t.status}}</span></td><td>{{t.property}}</td><td class="udc-dt-align-right">{{t.balance}}</td><td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td></tr></tbody></table></div>');
    if (has(components, 'tile')) main.push('        <div style="margin-bottom:24px;"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);margin:0 0 12px;">Quick Actions</h3><div style="display:flex;gap:16px;flex-wrap:wrap;"><div v-for="(label,i) in [\'Upload CSV\',\'Manual Entry\']" :key="i" class="udc-tile" tabindex="0" :aria-selected="selectedTile===i" @click="selectedTile=i" style="width:240px;"><div class="udc-tile__content"><div class="udc-tile__label">{{label}}</div><div class="udc-tile__body">{{i===0?\'Import from spreadsheet\':\'Add one at a time\'}}</div></div><span class="udc-tile__chevron"><span class="material-symbols-outlined">chevron_right</span></span></div></div></div>');
    if (has(components, 'divider') && main.length > 0) main.push('        <hr class="udc-divider-horizontal" />');

    var formFields = [];
    if (has(components, 'text-input')) formFields.push('<div class="udc-text-input" style="max-width:360px;"><label class="udc-text-input__label">Full name<span class="udc-text-input__required"></span></label><div class="udc-text-input__field"><input type="text" placeholder="Enter tenant name..." v-model="nameVal" /></div><div class="udc-text-input__helper"><span>As it appears on the lease</span></div></div>');
    if (has(components, 'dropdown')) formFields.push('<div class="udc-dropdown" :data-open="ddOpen?\'true\':\'false\'" style="max-width:300px;"><label class="udc-dropdown__label">Property</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" :aria-expanded="ddOpen" aria-haspopup="listbox" @click="ddOpen=!ddOpen"><span class="udc-dropdown__value" :data-placeholder="!ddVal||undefined">{{ddVal||\'Select property...\'}}</span><span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div><div class="udc-dropdown__list" role="listbox"><div v-for="opt in [\'Riverbend Estates\',\'Sunnyvale Towers\',\'Cedar Hills\']" :key="opt" class="udc-dropdown__item" role="option" :aria-selected="ddVal===opt" @click="ddVal=opt;ddOpen=false">{{opt}}</div></div></div>');
    if (has(components, 'checkbox')) formFields.push('<div style="display:flex;flex-direction:column;gap:8px;"><label class="udc-checkbox"><input type="checkbox" v-model="checks.email" /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">Send email notification</span></label><label class="udc-checkbox"><input type="checkbox" v-model="checks.history" /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">Include payment history</span></label></div>');
    if (has(components, 'radio')) formFields.push('<div class="udc-radio-group" role="radiogroup"><span class="udc-radio-group__legend">Lease type</span><label v-for="(label,i) in [\'Fixed term\',\'Month-to-month\']" :key="i" class="udc-radio"><input type="radio" name="lease" :checked="leaseType===i" @change="leaseType=i" /><span class="udc-radio__control"></span><span class="udc-radio__label">{{label}}</span></label></div>');
    if (formFields.length) main.push('        <div style="margin-top:24px;padding:24px;background:var(--uds-color-surface-subtle);border-radius:var(--uds-border-radius-container-md);"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);margin:0 0 16px;">Add Tenant</h3><div style="display:flex;flex-direction:column;gap:16px;">' + formFields.join('') + '</div></div>');

    if (has(components, 'badge') && !has(components, 'data-table')) main.push('        <div style="display:flex;gap:8px;margin-top:16px;"><span class="udc-badge" data-variant="success">Active</span><span class="udc-badge" data-variant="warning">Pending</span><span class="udc-badge" data-variant="error">Overdue</span></div>');
    if (has(components, 'icon-wrapper')) main.push('        <div style="display:flex;gap:12px;align-items:center;margin-top:16px;"><span class="udc-icon-wrapper" data-size="24" style="color:var(--uds-color-icon-interactive);"><span class="material-symbols-outlined">info</span></span><span class="udc-icon-wrapper" data-size="24" style="color:var(--uds-color-icon-success);"><span class="material-symbols-outlined">check_circle</span></span></div>');
    if (has(components, 'dialog')) main.push('        <div style="margin-top:16px;"><button class="udc-button-primary" @click="dlgOpen=true">Open Dialog</button><div v-if="dlgOpen" class="udc-dialog-backdrop" data-open="true" @click.self="dlgOpen=false"><div class="udc-dialog" role="dialog" aria-modal="true"><div class="udc-dialog__header"><h2 class="udc-dialog__title">Confirm Action</h2><button class="udc-dialog__close" aria-label="Close" @click="dlgOpen=false"><span class="material-symbols-outlined">close</span></button></div><div class="udc-dialog__body"><p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-base);color:var(--uds-color-text-primary);">Are you sure?</p></div><div class="udc-dialog__footer"><button class="udc-button-secondary" @click="dlgOpen=false">Cancel</button><button class="udc-button-primary" @click="dlgOpen=false">Confirm</button></div></div></div></div>');
    if (has(components, 'tooltip')) main.push('        <div style="display:flex;gap:16px;margin-top:16px;"><span class="udc-tooltip-wrapper"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">info</span></button><span class="udc-tooltip" role="tooltip">More information</span></span></div>');
    if (has(components, 'list') && !has(components, 'nav-vertical')) main.push('        <div class="udc-list" style="max-width:280px;margin-top:16px;"><div v-for="(label,i) in [\'Dashboard\',\'Leasing\',\'Accounting\']" :key="i" class="udc-list-item" tabindex="0" :aria-selected="listIdx===i" @click="listIdx=i"><span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">{{[\'space_dashboard\',\'book\',\'monetization_on\'][i]}}</span></span><span class="udc-list-item__label">{{label}}</span></div></div>');

    var mainTmpl = main.join('\n');

    if (useShell) {
      var shell = '    <div style="display:flex;min-height:calc(100vh - 76px);">\n';
      if (has(components, 'nav-vertical')) shell += '      <div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;"><nav class="udc-nav-vertical" aria-label="Main navigation" style="width:240px;"><button v-for="(label,i) in [\'Dashboard\',\'Leasing / CRM\',\'People / Contacts\',\'Property / Assets\',\'Accounting\']" :key="i" class="udc-nav-button" :aria-selected="navIdx===i" @click="navIdx=i"><span class="material-symbols-outlined">{{[\'space_dashboard\',\'book\',\'contact_phone\',\'home_work\',\'monetization_on\'][i]}}</span><span class="udc-nav-button__label">{{label}}</span></button></nav></div>\n';
      shell += '      <div style="flex:1;padding:24px;overflow-y:auto;">\n' + mainTmpl + '\n      </div>\n    </div>';
      parts.push(shell);
    } else {
      parts.push('    <div style="max-width:1000px;margin:0 auto;padding:32px 24px;">\n' + mainTmpl + '\n    </div>');
    }

    return parts.join('\n');
  }

  function generateDemoVue(components) {
    var origin = window.location.origin;
    var template = assembleVueTemplate(components);
    var setup = buildVueSetup(components);

    return '<!DOCTYPE html>\n<html lang="en"' + themeAttrString(getThemeAttrs()) + '>\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>UDS Demo — Vue</title>\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lexend:wght@400;500;700&display=swap" rel="stylesheet" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />\n  <link rel="stylesheet" href="' + origin + '/uds/uds.css" />\n  <style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: var(--uds-font-family); background: var(--uds-color-surface-page-main); color: var(--uds-color-text-primary); }</style>\n</head>\n<body>\n  <div id="app"></div>\n  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>\n  <script>\n  const app = Vue.createApp({\n    setup() {\n' + setup + '\n    },\n    template: `\n  <div>\n' + template + '\n  </div>\n  `\n  });\n  app.mount("#app");\n  <\/script>\n</body>\n</html>';
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
     5. DIALOG INIT — populate checkboxes, wire framework toggle
     ======================================================================== */
  var selectedFramework = 'html';

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

    document.querySelectorAll('input[name="demo-fw"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) selectedFramework = radio.value;
      });
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
        var html;
        if (selectedFramework === 'react') html = generateDemoReact(components);
        else if (selectedFramework === 'vue') html = generateDemoVue(components);
        else html = generateDemoHTML(components);

        openDemoOverlay(html);

        var attrs = getThemeAttrs();
        var entry = {
          timestamp: new Date().toISOString(),
          framework: selectedFramework,
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
        var origin = window.location.origin;

        if (selectedFramework === 'html') {
          zip.file('index.html', generateDemoHTML(components));
          downloadUdsFiles(zip, 'uds/', origin).then(function () {
            triggerZipDownload(zip, 'demo-html.zip');
            btn.disabled = false; btn.innerHTML = origLabel;
          });
        } else if (selectedFramework === 'react') {
          var appJsx = generateReactAppJsx(components);
          zip.file('package.json', JSON.stringify({
            name: 'uds-demo-react', version: '0.1.0', private: true, type: 'module',
            scripts: { dev: 'vite', build: 'vite build' },
            dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
            devDependencies: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.0.0' }
          }, null, 2));
          zip.file('vite.config.js', "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });");
          zip.file('index.html', '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>UDS Demo</title>\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"><\/script>\n</body>\n</html>');
          zip.file('src/main.jsx', "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './uds/uds.css';\nimport App from './App.jsx';\n\nReactDOM.createRoot(document.getElementById('root')).render(<App />);");
          zip.file('src/App.jsx', appJsx);
          downloadUdsFiles(zip, 'src/uds/', origin, true).then(function () {
            triggerZipDownload(zip, 'demo-react.zip');
            btn.disabled = false; btn.innerHTML = origLabel;
          });
        } else {
          var appVue = generateVueAppSfc(components);
          zip.file('package.json', JSON.stringify({
            name: 'uds-demo-vue', version: '0.1.0', private: true, type: 'module',
            scripts: { dev: 'vite', build: 'vite build' },
            dependencies: { vue: '^3.3.0' },
            devDependencies: { vite: '^5.0.0', '@vitejs/plugin-vue': '^4.0.0' }
          }, null, 2));
          zip.file('vite.config.js', "import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({ plugins: [vue()] });");
          zip.file('index.html', '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>UDS Demo</title>\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />\n</head>\n<body>\n  <div id="app"></div>\n  <script type="module" src="/src/main.js"><\/script>\n</body>\n</html>');
          zip.file('src/main.js', "import { createApp } from 'vue';\nimport './uds/uds.css';\nimport App from './App.vue';\n\ncreateApp(App).mount('#app');");
          zip.file('src/App.vue', appVue);
          downloadUdsFiles(zip, 'src/uds/', origin, true).then(function () {
            triggerZipDownload(zip, 'demo-vue.zip');
            btn.disabled = false; btn.innerHTML = origLabel;
          });
        }
      } catch (e) {
        if (errEl) { errEl.textContent = 'Download failed: ' + e.message; errEl.style.display = 'block'; }
        btn.disabled = false; btn.innerHTML = origLabel;
      }
    }, 50);
  };

  function generateReactAppJsx(components) {
    var stateHooks = buildReactStateHooks(components);
    var jsx = assembleReactJSX(components);
    return "import { useState } from 'react';\nimport './uds/uds.css';\n\nexport default function App() {\n" + stateHooks + "\n\n  return (\n    <>\n" + jsx + "\n    </>\n  );\n}";
  }

  function generateVueAppSfc(components) {
    var setup = buildVueSetup(components);
    var template = assembleVueTemplate(components);
    return "<script setup>\n" + setup + "\n</script>\n\n<template>\n  <div>\n" + template + "\n  </div>\n</template>";
  }

  var UDS_CSS_ONLY_FILES = [
    'uds.css', 'tokens/primitives.css', 'tokens/semantic.css', 'tokens/text-styles.css',
    'components/button.css', 'components/text-input.css', 'components/checkbox.css',
    'components/radio.css', 'components/badge.css', 'components/divider.css',
    'components/icon-wrapper.css', 'components/spacer.css', 'components/breadcrumb.css',
    'components/tab-horizontal.css', 'components/dropdown.css', 'components/nav-header.css',
    'components/nav-vertical.css', 'components/notification.css', 'components/dialog.css',
    'components/tile.css', 'components/list.css', 'components/data-table.css',
    'components/chip.css', 'components/search.css', 'components/tooltip.css'
  ];

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

  function downloadUdsFiles(zip, prefix, origin, cssOnly) {
    var fileList = cssOnly ? UDS_CSS_ONLY_FILES : UDS_FILES;
    return Promise.all(fileList.map(function (f) {
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
