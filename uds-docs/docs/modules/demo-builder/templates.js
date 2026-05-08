// docs/modules/demo-builder/templates.js
// Per-component HTML template functions used by the Demo Builder during
// Phase 4-6 of the UDS repo restructure.
//
// PHASE 7 DELETES THIS FILE. Once Phase 6 has migrated every component
// into uds/components/<id>/examples/, the Demo Builder switches to
// fetching example HTML directly + applying token substitution. These
// templates exist purely as a back-compat shim while the migration is
// in flight.
//
// Verbatim copy of the original DEMO_TEMPLATES object from the
// pre-restructure demo-builder.js. The data references (`DATA.tenants`,
// etc.) read from data-pools.js's flat-array views (which are derived
// from the structured records — see data-pools.js).

import { pick, pickN, randInt, chance, fmtMoney } from './rng.js';
import { DATA, pickStatus } from './data-pools.js';

export const DEMO_TEMPLATES = {

  'link': function () {
    const labels = ['View property', 'Open invoice', 'See tenant profile', 'Show payment history', 'Edit lease', 'View statement'];
    return '<a class="udc-link" href="#">' + pick(labels) + '</a>';
  },
  'label': function () {
    const fields = [
      { name: 'Full name',         required: true  },
      { name: 'Property address',  required: true  },
      { name: 'Lease end date',    required: true  },
      { name: 'Internal notes',    required: false },
      { name: 'Emergency contact', required: false }
    ];
    const f = pick(fields);
    const req = f.required ? ' data-required="true"' : '';
    const marker = f.required ? ' <span class="udc-label__required" aria-hidden="true"></span>' : '';
    return '<label class="udc-label"' + req + '>' + f.name + marker + '</label>';
  },
  'text-area': function () {
    const presets = [
      { label: 'Notes',                placeholder: 'Add notes...',                            helper: 'Optional internal note' },
      { label: 'Maintenance details',  placeholder: 'Describe the issue...',                   helper: 'Visible to the technician' },
      { label: 'Lease addendum',       placeholder: 'Custom clause text...',                   helper: 'Will be appended to the lease PDF' },
      { label: 'Property description', placeholder: 'Describe the unit for the listing...',    helper: 'Public-facing copy' }
    ];
    const p = pick(presets);
    const max = pick([200, 250, 500, 1000]);
    const len = chance(0.4) ? randInt(0, Math.floor(max * 0.6)) : 0;
    return '<div class="udc-text-area"><label class="udc-label" for="demo-notes">' + p.label + '</label><div class="udc-text-area__field"><textarea id="demo-notes" placeholder="' + p.placeholder + '"></textarea></div><div class="udc-text-area__helper"><span>' + p.helper + '</span><span>' + len + '/' + max + '</span></div></div>';
  },
  'toggle': function () {
    const presets = ['Email notifications', 'Auto-renew lease', 'Public listing visible', 'Send late-payment reminders', 'Allow guest access', 'Sync with accounting'];
    const checked = chance(0.7);
    return '<button class="udc-toggle" role="switch" aria-checked="' + checked + '"' + (chance(0.05) ? ' disabled' : '') + '><span class="udc-toggle__control"><span class="udc-toggle__thumb"></span></span><span class="udc-toggle__label">' + pick(presets) + '</span></button>';
  },
  'pagination': function () {
    const perPage = pick([25, 50, 100]);
    const total = randInt(perPage * 2 + 1, perPage * 8);
    const pages = Math.ceil(total / perPage);
    const current = randInt(1, Math.min(pages, 4));
    const maxBtns = Math.min(pages, 5);
    let pagesHtml = '';
    for (let i = 1; i <= maxBtns; i++) {
      pagesHtml += '<button class="udc-pagination__button"' + (i === current ? ' aria-current="page"' : '') + '>' + i + '</button>';
    }
    const start = (current - 1) * perPage + 1;
    const end = Math.min(current * perPage, total);
    return '<nav class="udc-pagination" aria-label="Pagination"><div class="udc-pagination__pages">' + pagesHtml + '</div><div class="udc-pagination__meta"><span>Rows per page</span><span>' + perPage + '</span><span>' + start + '-' + end + ' / ' + total + '</span></div></nav>';
  },
  'nav-header': function () {
    const brand = pick(['Boardroom', 'Tenant360', 'PropertyOS', 'LeasePro', 'Holdings']);
    const bentoItems = pickN(DATA.navItems, randInt(4, 6));
    const bentoSelectedIdx = randInt(0, bentoItems.length - 1);
    const bentoListHtml = bentoItems.map(function (it, i) {
      const sel = i === bentoSelectedIdx ? ' aria-selected="true"' : '';
      return '<button class="udc-nav-button"' + sel + '><span class="material-symbols-outlined">' + it.icon + '</span><span class="udc-nav-button__label">' + it.label + '</span></button>';
    }).join('');

    const searchPlaceholders = [
      'Search or ask a question',
      'Search tenants, properties, invoices...',
      'Find a lease, work order, or unit...',
      'Ask anything about your portfolio',
      'Search records or run a report'
    ];

    const myWorkCount = randInt(0, 15);
    const myWorkBadge = myWorkCount > 0
      ? ' <span class="udc-badge" data-variant="warning" style="width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;">' + myWorkCount + '</span>'
      : '';

    const accountCluster = '<button class="udc-button-ghost" data-icon-only aria-label="Notifications"><span class="material-symbols-outlined">notifications</span></button>'
      + (chance(0.6) ? '<button class="udc-button-ghost" data-icon-only aria-label="Settings"><span class="material-symbols-outlined">settings</span></button>' : '')
      + '<button class="udc-button-ghost" data-icon-only aria-label="Account"><span class="material-symbols-outlined">account_circle</span></button>';

    return '<div class="udc-nav-header">'
      + '<div class="udc-nav-header__left">'
        + '<div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:32px;color:var(--uds-color-icon-interactive);">apartment</span></div>'
        + '<div class="udc-nav-bento-wrapper">'
          + '<button class="udc-nav-bento-button" aria-expanded="false" aria-haspopup="true">'
            + '<span class="material-symbols-outlined" style="color:var(--uds-color-icon-interactive);">dashboard</span>'
            + brand
            + '<span class="material-symbols-outlined udc-nav-bento-button__chevron">keyboard_arrow_down</span>'
          + '</button>'
          + '<div class="udc-nav-bento" data-open="false">'
            + '<div class="udc-nav-bento__list">' + bentoListHtml + '</div>'
          + '</div>'
        + '</div>'
      + '</div>'
      + '<div class="udc-nav-header__center">'
        + '<div class="udc-nav-search">'
          + '<span class="material-symbols-outlined">auto_awesome</span>'
          + '<input class="udc-nav-search__input" type="text" placeholder="' + pick(searchPlaceholders) + '" />'
        + '</div>'
      + '</div>'
      + '<div class="udc-nav-header__right">'
        + '<button class="udc-nav-mywork">'
          + '<span class="material-symbols-outlined">notifications_active</span>'
          + 'My Work'
          + myWorkBadge
        + '</button>'
        + '<div class="udc-nav-account">' + accountCluster + '</div>'
      + '</div>'
    + '</div>';
  },
  'nav-vertical': function () {
    const items = pickN(DATA.navItems, randInt(4, 6));
    const selectedIdx = randInt(0, items.length - 1);
    const html = items.map(function (it, i) {
      const sel = i === selectedIdx ? ' aria-selected="true"' : '';
      return '<button class="udc-nav-button"' + sel + '><span class="material-symbols-outlined">' + it.icon + '</span><span class="udc-nav-button__label">' + it.label + '</span></button>';
    }).join('');
    return '<nav class="udc-nav-vertical" aria-label="Main navigation" style="width:240px;">' + html + '</nav>';
  },
  'breadcrumb': function () {
    const trail = pick(DATA.breadcrumbTrails).slice();
    if (trail[trail.length - 1] === null) trail[trail.length - 1] = pick(DATA.properties);
    else trail.push(pick(['#' + randInt(1000, 9999), pick(DATA.tenants), pick(DATA.properties)]));
    const crumbs = trail.map(function (c, i) {
      if (i === trail.length - 1) return '<li aria-current="page">' + c + '</li>';
      return '<li><a href="#">' + c + '</a></li>';
    }).join('');
    return '<nav class="udc-breadcrumb" aria-label="Breadcrumb"><ol>' + crumbs + '</ol></nav>';
  },
  'notification': function () {
    const n = pick(DATA.notifications);
    return '<div class="udc-notification" data-variant="' + n.variant + '"><span class="udc-notification__icon"><span class="material-symbols-outlined">' + n.icon + '</span></span><span class="udc-notification__text">' + n.msg() + '</span><button class="udc-notification__close" aria-label="Dismiss"><span class="material-symbols-outlined">close</span></button></div>';
  },
  'search': function () {
    const placeholders = [
      'Search tenants, properties, invoices...',
      'Search work orders...',
      'Find a lease by tenant or property...',
      'Search accounting transactions...',
      'Search applications...'
    ];
    const typed = chance(0.3) ? pick([pick(DATA.tenants).split(' ')[0], pick(DATA.properties).split(' ')[0], 'overdue', 'invoice', 'lease']) : '';
    const inputAttrs = typed ? ' value="' + typed + '"' : '';
    return '<div class="udc-search"><div class="udc-search__field"><span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span><input type="search" placeholder="' + pick(placeholders) + '"' + inputAttrs + ' /><button class="udc-search__clear" aria-label="Clear"' + (typed ? '' : ' style="visibility:hidden"') + '><span class="material-symbols-outlined">clear</span></button></div></div>';
  },
  'chip': function () {
    const set = pick(DATA.chipSets);
    const selectedIdx = randInt(0, set.length - 1);
    const html = set.map(function (label, i) {
      const sel = i === selectedIdx ? ' aria-selected="true"' : '';
      const leadingIcon = i === selectedIdx ? '<span class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span>' : '';
      return '<button class="udc-chip" data-variant="filter"' + sel + '>' + leadingIcon + '<span class="udc-chip__label">' + label + '</span></button>';
    }).join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + html + '</div>';
  },
  'tabs': function () {
    const set = pick(DATA.tabSets).slice(0, randInt(3, 4));
    let selectedIdx = randInt(0, set.length - 1);
    const disabledIdx = chance(0.25) ? set.length - 1 : -1;
    if (disabledIdx === selectedIdx) selectedIdx = 0;
    const html = set.map(function (label, i) {
      const sel = i === selectedIdx ? ' aria-selected="true"' : '';
      const dis = i === disabledIdx ? ' disabled' : '';
      return '<button class="udc-tab" role="tab"' + sel + dis + '>' + label + '</button>';
    }).join('');
    return '<div class="udc-tabs" role="tablist">' + html + '</div>';
  },
  'data-table': function () {
    const rowCount = randInt(4, 7);
    const rowsTenants = pickN(DATA.tenants, rowCount);
    const rows = rowsTenants.map(function (name) {
      const status = pickStatus();
      const balance = status.label === 'Overdue' ? randInt(800, 6500)
                    : status.label === 'Pending' ? randInt(200, 2500)
                    : status.label === 'Active'  ? (chance(0.6) ? 0 : randInt(50, 800))
                    : randInt(0, 1500);
      return '<tr><td class="udc-dt-check"><input type="checkbox"' + (chance(0.15) ? ' checked' : '') + ' /></td><td>' + name + '</td><td><span class="udc-badge" data-variant="' + status.variant + '">' + status.label + '</span></td><td>' + pick(DATA.properties) + '</td><td class="udc-dt-align-right">' + fmtMoney(balance) + '</td><td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td></tr>';
    }).join('');
    const sortDir = pick(['asc', 'desc']);
    return '<div class="udc-data-table"><table><thead><tr><th class="udc-dt-check"><input type="checkbox" /></th><th>Tenant <span class="udc-dt-sort" data-dir="' + sortDir + '"></span></th><th>Status</th><th>Property</th><th class="udc-dt-align-right">Balance</th><th class="udc-dt-action"></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  },
  'tile': function () {
    const n = randInt(2, 3);
    const tiles = pickN(DATA.quickActions, n);
    const selectedIdx = randInt(0, tiles.length - 1);
    const html = tiles.map(function (t, i) {
      const sel = i === selectedIdx ? ' aria-selected="true"' : '';
      return '<div class="udc-tile" tabindex="0"' + sel + ' style="width:240px;"><div class="udc-tile__content"><div class="udc-tile__label">' + t.label + '</div><div class="udc-tile__body">' + t.body + '</div></div><span class="udc-tile__chevron"><span class="material-symbols-outlined">chevron_right</span></span></div>';
    }).join('');
    return '<div style="display:flex;gap:16px;flex-wrap:wrap;">' + html + '</div>';
  },
  'list': function () {
    const items = pickN(DATA.navItems, randInt(3, 5));
    const selectedIdx = randInt(0, items.length - 1);
    const html = items.map(function (it, i) {
      const sel = i === selectedIdx ? ' aria-selected="true"' : '';
      return '<div class="udc-list-item" tabindex="0"' + sel + '><span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">' + it.icon + '</span></span><span class="udc-list-item__label">' + it.label + '</span></div>';
    }).join('');
    return '<div class="udc-list" style="max-width:280px;">' + html + '</div>';
  },
  'button': function () {
    const primary = pick(DATA.primaryActions);
    const secondaries = pickN(DATA.secondaryActions, randInt(1, 2));
    const secHtml = secondaries.map(function (s) { return '<button class="udc-button-secondary">' + s + '</button>'; }).join('');
    const ghost = chance(0.6) ? '<button class="udc-button-ghost">Cancel</button>' : '';
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="udc-button-primary"><span class="material-symbols-outlined" style="font-size:20px;">' + primary.icon + '</span> ' + primary.label + '</button>' + secHtml + ghost + '</div>';
  },
  'text-input': function () {
    const presets = [
      { label: 'Full name',         placeholder: 'Enter tenant name...',         helper: 'As it appears on the lease',     required: true  },
      { label: 'Email',             placeholder: 'tenant@example.com',           helper: 'Used for digital statements',    required: true  },
      { label: 'Phone',             placeholder: '(555) 123-4567',               helper: 'Mobile preferred',               required: false },
      { label: 'Property address',  placeholder: 'Street, City, State, ZIP',     helper: '',                                required: true  },
      { label: 'Unit number',       placeholder: 'e.g. 4B',                      helper: '',                                required: false }
    ];
    const p = pick(presets);
    const hasError = chance(0.12);
    const hasValue = !hasError && chance(0.4);
    const value = hasValue ? (p.label === 'Full name' ? pick(DATA.tenants)
                          : p.label === 'Property address' ? pick(DATA.properties)
                          : p.label === 'Email' ? pick(DATA.tenants).toLowerCase().replace(/[^a-z]/g, '.') + '@example.com'
                          : p.label === 'Phone' ? '(' + randInt(200, 999) + ') ' + randInt(200, 999) + '-' + randInt(1000, 9999)
                          : p.label === 'Unit number' ? randInt(1, 24) + pick(['A','B','C','D'])
                          : '')
                        : '';
    const errorAttr = hasError ? ' data-error="true"' : '';
    const requiredMarker = p.required ? '<span class="udc-text-input__required"></span>' : '';
    const helperHtml = hasError ? '<div class="udc-text-input__helper"><span style="color:var(--uds-color-text-error);">This field is required.</span></div>'
                              : (p.helper ? '<div class="udc-text-input__helper"><span>' + p.helper + '</span></div>' : '');
    return '<div class="udc-text-input"' + errorAttr + ' style="max-width:360px;"><label class="udc-text-input__label">' + p.label + requiredMarker + '</label><div class="udc-text-input__field"><input type="text" placeholder="' + p.placeholder + '" value="' + value + '" /></div>' + helperHtml + '</div>';
  },
  'dropdown': function () {
    const configs = [
      { label: 'Property',   options: pickN(DATA.properties, randInt(3, 5)),  placeholder: 'Select property...' },
      { label: 'Lease type', options: DATA.leaseTypes.slice(0, randInt(3, 4)), placeholder: 'Select lease type...' },
      { label: 'Status',     options: DATA.statuses.map(function (s) { return s.label; }).slice(0, randInt(3, 5)), placeholder: 'Select status...' },
      { label: 'Owner',      options: pickN(DATA.tenants, randInt(3, 5)),    placeholder: 'Select owner...' }
    ];
    const c = pick(configs);
    const hasValue = chance(0.5);
    const selectedIdx = hasValue ? randInt(0, c.options.length - 1) : -1;
    const displayValue = hasValue
      ? '<span class="udc-dropdown__value">' + c.options[selectedIdx] + '</span>'
      : '<span class="udc-dropdown__value" data-placeholder>' + c.placeholder + '</span>';
    const optsHtml = c.options.map(function (o, i) {
      return '<div class="udc-dropdown__item" role="option"' + (i === selectedIdx ? ' aria-selected="true"' : '') + '>' + o + '</div>';
    }).join('');
    return '<div class="udc-dropdown" style="max-width:300px;"><label class="udc-dropdown__label">' + c.label + '</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox">' + displayValue + '<span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div><div class="udc-dropdown__list" role="listbox">' + optsHtml + '</div></div>';
  },
  'checkbox': function () {
    const options = [
      'Send email notification', 'Include payment history', 'Auto-bill on the 1st',
      'Notify on missed payment', 'Allow online maintenance requests',
      'Subscribe to monthly statements', 'Share lease with co-tenant',
      'Apply security deposit interest'
    ];
    const picks = pickN(options, randInt(2, 4));
    const html = picks.map(function (label) {
      const checked = chance(0.55) ? ' checked' : '';
      return '<label class="udc-checkbox"><input type="checkbox"' + checked + ' /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">' + label + '</span></label>';
    }).join('');
    return '<div style="display:flex;flex-direction:column;gap:8px;">' + html + '</div>';
  },
  'radio': function () {
    const configs = [
      { legend: 'Lease type',         options: DATA.leaseTypes },
      { legend: 'Notification frequency', options: ['Realtime', 'Daily digest', 'Weekly summary'] },
      { legend: 'Payment method',     options: ['ACH transfer', 'Credit card', 'Mailed check'] },
      { legend: 'Default view',       options: ['List', 'Grid', 'Calendar'] }
    ];
    const c = pick(configs);
    const opts = c.options.slice(0, randInt(2, c.options.length));
    const checkedIdx = randInt(0, opts.length - 1);
    const html = opts.map(function (o, i) {
      const isChecked = i === checkedIdx ? ' checked' : '';
      const slug = o.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return '<label class="udc-radio"><input type="radio" name="demo-radio-grp" value="' + slug + '"' + isChecked + ' /><span class="udc-radio__control"></span><span class="udc-radio__label">' + o + '</span></label>';
    }).join('');
    return '<div class="udc-radio-group" role="radiogroup"><span class="udc-radio-group__legend">' + c.legend + '</span>' + html + '</div>';
  },
  'badge': function () {
    const variants = pickN(DATA.statuses, randInt(3, 5));
    const html = variants.map(function (s) {
      return '<span class="udc-badge" data-variant="' + s.variant + '">' + s.label + '</span>';
    }).join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + html + '</div>';
  },
  'divider': function () {
    return '<hr class="udc-divider-horizontal" />';
  },
  'spacer': function () {
    const sizes = ['200', '300', '400', '500'];
    return '<div class="udc-spacer" data-size="' + pick(sizes) + '"></div>';
  },
  'icon-wrapper': function () {
    const icons = [
      { icon: 'info',           color: 'interactive' },
      { icon: 'check_circle',   color: 'success'     },
      { icon: 'error',          color: 'error'       },
      { icon: 'warning',        color: 'warning'     },
      { icon: 'home',           color: 'interactive' },
      { icon: 'mail',           color: 'interactive' },
      { icon: 'event',          color: 'interactive' },
      { icon: 'monetization_on',color: 'success'     }
    ];
    const picks = pickN(icons, 3);
    const size = pick(['16', '20', '24', '32']);
    const html = picks.map(function (it) {
      return '<span class="udc-icon-wrapper" data-size="' + size + '" style="color:var(--uds-color-icon-' + it.color + ');"><span class="material-symbols-outlined">' + it.icon + '</span></span>';
    }).join('');
    return '<div style="display:flex;gap:12px;align-items:center;">' + html + '</div>';
  },
  'dialog': function () {
    const s = pick(DATA.dialogScripts);
    return '<button class="udc-button-primary" onclick="document.getElementById(\'demo-dlg\').setAttribute(\'data-open\',\'true\');if(window.UDS)UDS.init();">Open Dialog</button><div class="udc-dialog-backdrop" id="demo-dlg" data-open="false"><div class="udc-dialog" role="dialog" aria-modal="true"><div class="udc-dialog__header"><h2 class="udc-dialog__title">' + s.title + '</h2><button class="udc-dialog__close" aria-label="Close" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');"><span class="material-symbols-outlined">close</span></button></div><div class="udc-dialog__body"><p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-base);color:var(--uds-color-text-primary);">' + s.body + '</p></div><div class="udc-dialog__footer"><button class="udc-button-secondary" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');">' + s.cancel + '</button><button class="udc-button-primary" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');">' + s.confirm + '</button></div></div></div>';
  },
  'tooltip': function () {
    const pair = pick(DATA.tooltipPairs);
    const html = pair.map(function (t) {
      return '<span class="udc-tooltip-wrapper"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">' + t.icon + '</span></button><span class="udc-tooltip" role="tooltip">' + t.tip + '</span></span>';
    }).join('');
    return '<div style="display:flex;gap:16px;">' + html + '</div>';
  }
};
