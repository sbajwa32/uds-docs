/* ==========================================================================
   UDS Demo Site Builder
   Generates a vanilla HTML/CSS demo page from the selected UDS components.
   Supports live preview (iframe overlay) and ZIP download. Reference output
   only — production framework code lives in the UDS Storybook.
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
    { id: 'link',         label: 'Link' },
    { id: 'label',        label: 'Label' },
    { id: 'text-input',   label: 'Text Input' },
    { id: 'text-area',    label: 'Text Area' },
    { id: 'checkbox',     label: 'Checkbox' },
    { id: 'radio',        label: 'Radio' },
    { id: 'dropdown',     label: 'Dropdown' },
    { id: 'toggle',       label: 'Toggle' },
    { id: 'search',       label: 'Search' },
    { id: 'badge',        label: 'Badge' },
    { id: 'chip',         label: 'Chip' },
    { id: 'divider',      label: 'Divider' },
    { id: 'icon-wrapper', label: 'Icon Wrapper' },
    { id: 'spacer',       label: 'Spacer' },
    { id: 'breadcrumb',   label: 'Breadcrumb' },
    { id: 'pagination',   label: 'Pagination' },
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
     1. RNG + REALISTIC DATA POOLS
     Each Build / Rebuild calls reseedRandom() so every preview gets fresh
     content and states. The data is themed for property management
     (Boardroom). Layout structure (header on top, breadcrumb after,
     filter bar above table, etc.) is preserved by the assembler — only
     contents and per-component states vary.
     ======================================================================== */

  // Tiny seeded RNG so reseedRandom() makes a build deterministic within
  // its own scope. We don't expose the seed to the user; it just means a
  // build is internally consistent (same tenant in table = same balance).
  var _rng = Math.random;
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function reseedRandom(seed) {
    _rng = mulberry32(seed != null ? seed : (Date.now() ^ Math.floor(Math.random() * 1e9)));
  }
  function rnd() { return _rng(); }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function pickN(arr, n) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out.slice(0, Math.min(n, out.length));
  }
  function randInt(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
  function chance(p) { return rnd() < p; }
  function fmtMoney(n) {
    var s = n.toFixed(2);
    return '$' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  var DATA = {
    tenants: [
      'Brian Smith', 'Catherine Lee', 'David Brown', 'Eva White', 'Marcus Chen',
      'Priya Patel', 'Olivia García', 'Tomás Rivera', 'Ada Okafor', 'Jonas Becker',
      'Sofia Romano', 'Henry Müller', 'Naomi Tanaka', 'Lucas Dubois', 'Anya Volkov',
      'Liam O\'Connor', 'Isabela Costa', 'Yusuf Demir', 'Maya Goldberg', 'Felix Andersen',
      'Zara Ahmed', 'Ethan Wallace', 'Hana Park', 'Diego Morales', 'Ingrid Larsson',
      'Theo Bennett', 'Aisha Khan', 'Caleb Foster', 'Lina Schwarz', 'Rafael Silva'
    ],
    properties: [
      'Riverbend Estates', 'Sunnyvale Towers', 'Cedar Hills', 'Oakwood Gardens',
      'The Brookline', 'Maplewood Court', 'Harbor Point', 'Stonebridge Commons',
      'Willow Creek', 'Lakeside Place', 'Birchwood Lofts', 'Foxglove Apartments',
      'The Northgate', 'Pine Ridge', 'Summit View', 'Aurora Heights', 'The Linden'
    ],
    quickActions: [
      { label: 'Upload CSV',     body: 'Import tenants from a spreadsheet',     icon: 'upload_file' },
      { label: 'Manual Entry',   body: 'Add tenants one at a time',             icon: 'edit_note'   },
      { label: 'Send Statements',body: 'Email this month\'s balance summary',   icon: 'mail'        },
      { label: 'Generate Report',body: 'Build a custom owner report',           icon: 'description' },
      { label: 'Run Reconcile',  body: 'Match bank deposits to invoices',       icon: 'rule'        },
      { label: 'Schedule Tour',  body: 'Book a unit walkthrough',               icon: 'event'       },
      { label: 'New Work Order', body: 'Log a maintenance request',             icon: 'build'       },
      { label: 'Post Listing',   body: 'Publish a vacant unit',                 icon: 'campaign'    }
    ],
    notifications: [
      { variant: 'info',    icon: 'info',          msg: function () { return randInt(2,7) + ' invoices are pending review. Please check the table below.'; } },
      { variant: 'success', icon: 'check_circle',  msg: function () { return 'Payment of ' + fmtMoney(randInt(500, 9500)) + ' from ' + pick(DATA.tenants) + ' has been recorded.'; } },
      { variant: 'warning', icon: 'warning',       msg: function () { return randInt(1,4) + ' lease(s) expire within the next 30 days.'; } },
      { variant: 'error',   icon: 'error',         msg: function () { return 'Failed to sync with the accounting system. Last attempt ' + randInt(2, 18) + ' min ago.'; } },
      { variant: 'info',    icon: 'info',          msg: function () { return 'New maintenance request from ' + pick(DATA.tenants) + ' at ' + pick(DATA.properties) + '.'; } }
    ],
    pageTitles: ['Tenants', 'Invoices', 'Properties', 'Leases', 'Work Orders'],
    primaryActions: [
      { label: 'New Tenant',   icon: 'add'          },
      { label: 'Send Invoice', icon: 'send'         },
      { label: 'New Lease',    icon: 'description'  },
      { label: 'Add Property', icon: 'home_work'    },
      { label: 'New Work Order',icon: 'build'       }
    ],
    secondaryActions: ['Export', 'Print', 'Archive', 'Duplicate'],
    leaseTypes: ['Fixed term', 'Month-to-month', 'Sublease', 'Renewal'],
    statuses: [
      { variant: 'success',   label: 'Active',    weight: 5 },
      { variant: 'warning',   label: 'Pending',   weight: 3 },
      { variant: 'error',     label: 'Overdue',   weight: 2 },
      { variant: 'secondary', label: 'Draft',     weight: 1 },
      { variant: 'success',   label: 'Renewed',   weight: 1 },
      { variant: 'secondary', label: 'Archived',  weight: 1 }
    ],
    navItems: [
      { label: 'Dashboard',           icon: 'space_dashboard' },
      { label: 'Leasing / CRM',       icon: 'book'            },
      { label: 'People / Contacts',   icon: 'contact_phone'   },
      { label: 'Property / Assets',   icon: 'home_work'       },
      { label: 'Accounting',          icon: 'monetization_on' },
      { label: 'Maintenance',         icon: 'build'           },
      { label: 'Reports',             icon: 'analytics'       },
      { label: 'Settings',            icon: 'settings'        }
    ],
    tabSets: [
      ['Overview', 'Invoices', 'Tenants', 'Reports'],
      ['Summary', 'Payments', 'Documents', 'History'],
      ['Open', 'Scheduled', 'Closed', 'Archived'],
      ['Active', 'Pending', 'Renewals', 'Overdue']
    ],
    chipSets: [
      ['All', 'Active', 'Pending', 'Overdue'],
      ['All', 'This Month', 'Last 30 days', 'Custom'],
      ['All', 'Studio', '1 BR', '2 BR', '3+ BR'],
      ['All', 'Open', 'In Progress', 'Closed']
    ],
    breadcrumbTrails: [
      ['Home', 'Properties', null],
      ['Home', 'Tenants', null],
      ['Home', 'Accounting', 'Invoices'],
      ['Home', 'Leasing', 'Applications'],
      ['Home', 'Maintenance', 'Work Orders']
    ],
    dialogScripts: [
      { title: 'Confirm Archive',         body: 'Archive this lease? You can restore it within 30 days.',                            confirm: 'Archive',  cancel: 'Cancel' },
      { title: 'Send Late Notice',        body: 'A late-payment notice will be emailed to the tenant on file.',                      confirm: 'Send',     cancel: 'Cancel' },
      { title: 'Delete Draft Invoice',    body: 'This invoice is still in draft. Once deleted it cannot be recovered.',              confirm: 'Delete',   cancel: 'Keep'   },
      { title: 'Approve Application',     body: 'Approving will trigger the welcome email and create a new lease record.',           confirm: 'Approve',  cancel: 'Cancel' },
      { title: 'Schedule Maintenance',    body: 'A technician will be dispatched on the next available slot.',                       confirm: 'Schedule', cancel: 'Cancel' }
    ],
    tooltipPairs: [
      [{ icon: 'info',      tip: 'More information about this metric' }, { icon: 'help',         tip: 'Need help? Open the docs.' }],
      [{ icon: 'sync',      tip: 'Last synced just now' },                { icon: 'history',      tip: 'View change history' }],
      [{ icon: 'visibility',tip: 'Show full details' },                   { icon: 'lock',         tip: 'This field is read-only' }],
      [{ icon: 'star',      tip: 'Mark as priority' },                    { icon: 'flag',         tip: 'Flag for follow-up' }]
    ]
  };

  // Weighted status pick (Active is more common than Overdue, etc.)
  function pickStatus() {
    var total = DATA.statuses.reduce(function (s, x) { return s + x.weight; }, 0);
    var roll = rnd() * total;
    for (var i = 0; i < DATA.statuses.length; i++) {
      roll -= DATA.statuses[i].weight;
      if (roll <= 0) return DATA.statuses[i];
    }
    return DATA.statuses[0];
  }

  /* ========================================================================
     2. TEMPLATES — every function rolls fresh data + states from DATA.
     Layout structure stays in the assembler (header top, etc.).
     ======================================================================== */
  var DEMO_TEMPLATES = {

    'link': function () {
      var labels = ['View property', 'Open invoice', 'See tenant profile', 'Show payment history', 'Edit lease', 'View statement'];
      return '<a class="udc-link" href="#">' + pick(labels) + '</a>';
    },
    'label': function () {
      var fields = [
        { name: 'Full name',         required: true  },
        { name: 'Property address',  required: true  },
        { name: 'Lease end date',    required: true  },
        { name: 'Internal notes',    required: false },
        { name: 'Emergency contact', required: false }
      ];
      var f = pick(fields);
      var req = f.required ? ' data-required="true"' : '';
      var marker = f.required ? ' <span class="udc-label__required" aria-hidden="true"></span>' : '';
      return '<label class="udc-label"' + req + '>' + f.name + marker + '</label>';
    },
    'text-area': function () {
      var presets = [
        { label: 'Notes',                placeholder: 'Add notes...',                            helper: 'Optional internal note' },
        { label: 'Maintenance details',  placeholder: 'Describe the issue...',                   helper: 'Visible to the technician' },
        { label: 'Lease addendum',       placeholder: 'Custom clause text...',                   helper: 'Will be appended to the lease PDF' },
        { label: 'Property description', placeholder: 'Describe the unit for the listing...',    helper: 'Public-facing copy' }
      ];
      var p = pick(presets);
      var max = pick([200, 250, 500, 1000]);
      var len = chance(0.4) ? randInt(0, Math.floor(max * 0.6)) : 0;
      return '<div class="udc-text-area"><label class="udc-label" for="demo-notes">' + p.label + '</label><div class="udc-text-area__field"><textarea id="demo-notes" placeholder="' + p.placeholder + '"></textarea></div><div class="udc-text-area__helper"><span>' + p.helper + '</span><span>' + len + '/' + max + '</span></div></div>';
    },
    'toggle': function () {
      var presets = ['Email notifications', 'Auto-renew lease', 'Public listing visible', 'Send late-payment reminders', 'Allow guest access', 'Sync with accounting'];
      var checked = chance(0.7);
      return '<button class="udc-toggle" role="switch" aria-checked="' + checked + '"' + (chance(0.05) ? ' disabled' : '') + '><span class="udc-toggle__control"><span class="udc-toggle__thumb"></span></span><span class="udc-toggle__label">' + pick(presets) + '</span></button>';
    },
    'pagination': function () {
      var perPage = pick([25, 50, 100]);
      var total = randInt(perPage * 2 + 1, perPage * 8);
      var pages = Math.ceil(total / perPage);
      var current = randInt(1, Math.min(pages, 4));
      var maxBtns = Math.min(pages, 5);
      var pagesHtml = '';
      for (var i = 1; i <= maxBtns; i++) {
        pagesHtml += '<button class="udc-pagination__button"' + (i === current ? ' aria-current="page"' : '') + '>' + i + '</button>';
      }
      var start = (current - 1) * perPage + 1;
      var end = Math.min(current * perPage, total);
      return '<nav class="udc-pagination" aria-label="Pagination"><div class="udc-pagination__pages">' + pagesHtml + '</div><div class="udc-pagination__meta"><span>Rows per page</span><span>' + perPage + '</span><span>' + start + '-' + end + ' / ' + total + '</span></div></nav>';
    },
    'nav-header': function () {
      var unread = randInt(0, 12);
      var notifBadge = unread > 0
        ? '<span class="udc-badge" data-variant="error" data-size="sm" style="position:absolute;top:-2px;right:-2px;min-width:16px;height:16px;padding:0 4px;font-size:10px;">' + unread + '</span>'
        : '';
      return '<div class="udc-nav-header"><div class="udc-nav-header__left"><div class="udc-nav-logo"><span class="material-symbols-outlined" style="font-size:32px;color:var(--uds-color-icon-interactive);">apartment</span></div></div><div class="udc-nav-header__right"><span style="position:relative;display:inline-flex;"><button class="udc-button-ghost" data-icon-only data-size="sm" aria-label="Notifications"><span class="material-symbols-outlined">notifications</span></button>' + notifBadge + '</span><button class="udc-button-ghost" data-icon-only data-size="sm" aria-label="Account"><span class="material-symbols-outlined">account_circle</span></button></div></div>';
    },
    'nav-vertical': function () {
      var items = pickN(DATA.navItems, randInt(4, 6));
      var selectedIdx = randInt(0, items.length - 1);
      var html = items.map(function (it, i) {
        var sel = i === selectedIdx ? ' aria-selected="true"' : '';
        return '<button class="udc-nav-button"' + sel + '><span class="material-symbols-outlined">' + it.icon + '</span><span class="udc-nav-button__label">' + it.label + '</span></button>';
      }).join('');
      return '<nav class="udc-nav-vertical" aria-label="Main navigation" style="width:240px;">' + html + '</nav>';
    },
    'breadcrumb': function () {
      var trail = pick(DATA.breadcrumbTrails).slice();
      // Last segment may be a property name or a dynamic id
      if (trail[trail.length - 1] === null) trail[trail.length - 1] = pick(DATA.properties);
      else trail.push(pick(['#' + randInt(1000, 9999), pick(DATA.tenants), pick(DATA.properties)]));
      var crumbs = trail.map(function (c, i) {
        if (i === trail.length - 1) return '<li aria-current="page">' + c + '</li>';
        return '<li><a href="#">' + c + '</a></li>';
      }).join('');
      return '<nav class="udc-breadcrumb" aria-label="Breadcrumb"><ol>' + crumbs + '</ol></nav>';
    },
    'notification': function () {
      var n = pick(DATA.notifications);
      return '<div class="udc-notification" data-variant="' + n.variant + '"><span class="udc-notification__icon"><span class="material-symbols-outlined">' + n.icon + '</span></span><span class="udc-notification__text">' + n.msg() + '</span><button class="udc-notification__close" aria-label="Dismiss"><span class="material-symbols-outlined">close</span></button></div>';
    },
    'search': function () {
      var placeholders = [
        'Search tenants, properties, invoices...',
        'Search work orders...',
        'Find a lease by tenant or property...',
        'Search accounting transactions...',
        'Search applications...'
      ];
      // Sometimes show a "typed query" state with the clear button visible
      var typed = chance(0.3) ? pick([pick(DATA.tenants).split(' ')[0], pick(DATA.properties).split(' ')[0], 'overdue', 'invoice', 'lease']) : '';
      var inputAttrs = typed ? ' value="' + typed + '"' : '';
      return '<div class="udc-search"><div class="udc-search__field"><span class="udc-search__icon"><span class="material-symbols-outlined">search</span></span><input type="search" placeholder="' + pick(placeholders) + '"' + inputAttrs + ' /><button class="udc-search__clear" aria-label="Clear"' + (typed ? '' : ' style="visibility:hidden"') + '><span class="material-symbols-outlined">clear</span></button></div></div>';
    },
    'chip': function () {
      var set = pick(DATA.chipSets);
      var selectedIdx = randInt(0, set.length - 1);
      var html = set.map(function (label, i) {
        var sel = i === selectedIdx ? ' aria-selected="true"' : '';
        var leadingIcon = i === selectedIdx ? '<span class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span>' : '';
        return '<button class="udc-chip" data-variant="filter"' + sel + '>' + leadingIcon + '<span class="udc-chip__label">' + label + '</span></button>';
      }).join('');
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + html + '</div>';
    },
    'tabs': function () {
      var set = pick(DATA.tabSets).slice(0, randInt(3, 4));
      var selectedIdx = randInt(0, set.length - 1);
      // Occasionally disable the last tab to show that state
      var disabledIdx = chance(0.25) ? set.length - 1 : -1;
      if (disabledIdx === selectedIdx) selectedIdx = 0;
      var html = set.map(function (label, i) {
        var sel = i === selectedIdx ? ' aria-selected="true"' : '';
        var dis = i === disabledIdx ? ' disabled' : '';
        return '<button class="udc-tab" role="tab"' + sel + dis + '>' + label + '</button>';
      }).join('');
      return '<div class="udc-tabs" role="tablist">' + html + '</div>';
    },
    'data-table': function () {
      var rowCount = randInt(4, 7);
      var rowsTenants = pickN(DATA.tenants, rowCount);
      var rows = rowsTenants.map(function (name) {
        var status = pickStatus();
        var balance = status.label === 'Overdue' ? randInt(800, 6500)
                    : status.label === 'Pending' ? randInt(200, 2500)
                    : status.label === 'Active'  ? (chance(0.6) ? 0 : randInt(50, 800))
                    : randInt(0, 1500);
        return '<tr><td class="udc-dt-check"><input type="checkbox"' + (chance(0.15) ? ' checked' : '') + ' /></td><td>' + name + '</td><td><span class="udc-badge" data-variant="' + status.variant + '">' + status.label + '</span></td><td>' + pick(DATA.properties) + '</td><td class="udc-dt-align-right">' + fmtMoney(balance) + '</td><td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td></tr>';
      }).join('');
      var sortDir = pick(['asc', 'desc']);
      return '<div class="udc-data-table"><table><thead><tr><th class="udc-dt-check"><input type="checkbox" /></th><th>Tenant <span class="udc-dt-sort" data-dir="' + sortDir + '"></span></th><th>Status</th><th>Property</th><th class="udc-dt-align-right">Balance</th><th class="udc-dt-action"></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    },
    'tile': function () {
      var n = randInt(2, 3);
      var tiles = pickN(DATA.quickActions, n);
      var selectedIdx = randInt(0, tiles.length - 1);
      var html = tiles.map(function (t, i) {
        var sel = i === selectedIdx ? ' aria-selected="true"' : '';
        return '<div class="udc-tile" tabindex="0"' + sel + ' style="width:240px;"><div class="udc-tile__content"><div class="udc-tile__label">' + t.label + '</div><div class="udc-tile__body">' + t.body + '</div></div><span class="udc-tile__chevron"><span class="material-symbols-outlined">chevron_right</span></span></div>';
      }).join('');
      return '<div style="display:flex;gap:16px;flex-wrap:wrap;">' + html + '</div>';
    },
    'list': function () {
      var items = pickN(DATA.navItems, randInt(3, 5));
      var selectedIdx = randInt(0, items.length - 1);
      var html = items.map(function (it, i) {
        var sel = i === selectedIdx ? ' aria-selected="true"' : '';
        return '<div class="udc-list-item" tabindex="0"' + sel + '><span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">' + it.icon + '</span></span><span class="udc-list-item__label">' + it.label + '</span></div>';
      }).join('');
      return '<div class="udc-list" style="max-width:280px;">' + html + '</div>';
    },
    'button': function () {
      var primary = pick(DATA.primaryActions);
      var secondaries = pickN(DATA.secondaryActions, randInt(1, 2));
      var secHtml = secondaries.map(function (s) { return '<button class="udc-button-secondary">' + s + '</button>'; }).join('');
      var ghost = chance(0.6) ? '<button class="udc-button-ghost">Cancel</button>' : '';
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="udc-button-primary"><span class="material-symbols-outlined" style="font-size:20px;">' + primary.icon + '</span> ' + primary.label + '</button>' + secHtml + ghost + '</div>';
    },
    'text-input': function () {
      var presets = [
        { label: 'Full name',         placeholder: 'Enter tenant name...',         helper: 'As it appears on the lease',     required: true  },
        { label: 'Email',             placeholder: 'tenant@example.com',           helper: 'Used for digital statements',    required: true  },
        { label: 'Phone',             placeholder: '(555) 123-4567',               helper: 'Mobile preferred',               required: false },
        { label: 'Property address',  placeholder: 'Street, City, State, ZIP',     helper: '',                                required: true  },
        { label: 'Unit number',       placeholder: 'e.g. 4B',                      helper: '',                                required: false }
      ];
      var p = pick(presets);
      var hasError = chance(0.12);
      var hasValue = !hasError && chance(0.4);
      var value = hasValue ? (p.label === 'Full name' ? pick(DATA.tenants)
                            : p.label === 'Property address' ? pick(DATA.properties)
                            : p.label === 'Email' ? pick(DATA.tenants).toLowerCase().replace(/[^a-z]/g, '.') + '@example.com'
                            : p.label === 'Phone' ? '(' + randInt(200, 999) + ') ' + randInt(200, 999) + '-' + randInt(1000, 9999)
                            : p.label === 'Unit number' ? randInt(1, 24) + pick(['A','B','C','D'])
                            : '')
                          : '';
      var errorAttr = hasError ? ' data-error="true"' : '';
      var requiredMarker = p.required ? '<span class="udc-text-input__required"></span>' : '';
      var helperHtml = hasError ? '<div class="udc-text-input__helper"><span style="color:var(--uds-color-text-error);">This field is required.</span></div>'
                                : (p.helper ? '<div class="udc-text-input__helper"><span>' + p.helper + '</span></div>' : '');
      return '<div class="udc-text-input"' + errorAttr + ' style="max-width:360px;"><label class="udc-text-input__label">' + p.label + requiredMarker + '</label><div class="udc-text-input__field"><input type="text" placeholder="' + p.placeholder + '" value="' + value + '" /></div>' + helperHtml + '</div>';
    },
    'dropdown': function () {
      var configs = [
        { label: 'Property',   options: pickN(DATA.properties, randInt(3, 5)),  placeholder: 'Select property...' },
        { label: 'Lease type', options: DATA.leaseTypes.slice(0, randInt(3, 4)), placeholder: 'Select lease type...' },
        { label: 'Status',     options: DATA.statuses.map(function (s) { return s.label; }).slice(0, randInt(3, 5)), placeholder: 'Select status...' },
        { label: 'Owner',      options: pickN(DATA.tenants, randInt(3, 5)),    placeholder: 'Select owner...' }
      ];
      var c = pick(configs);
      var hasValue = chance(0.5);
      var selectedIdx = hasValue ? randInt(0, c.options.length - 1) : -1;
      var displayValue = hasValue
        ? '<span class="udc-dropdown__value">' + c.options[selectedIdx] + '</span>'
        : '<span class="udc-dropdown__value" data-placeholder>' + c.placeholder + '</span>';
      var optsHtml = c.options.map(function (o, i) {
        return '<div class="udc-dropdown__item" role="option"' + (i === selectedIdx ? ' aria-selected="true"' : '') + '>' + o + '</div>';
      }).join('');
      return '<div class="udc-dropdown" style="max-width:300px;"><label class="udc-dropdown__label">' + c.label + '</label><div class="udc-dropdown__trigger" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox">' + displayValue + '<span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span></div><div class="udc-dropdown__list" role="listbox">' + optsHtml + '</div></div>';
    },
    'checkbox': function () {
      var options = [
        'Send email notification', 'Include payment history', 'Auto-bill on the 1st',
        'Notify on missed payment', 'Allow online maintenance requests',
        'Subscribe to monthly statements', 'Share lease with co-tenant',
        'Apply security deposit interest'
      ];
      var picks = pickN(options, randInt(2, 4));
      var html = picks.map(function (label) {
        var checked = chance(0.55) ? ' checked' : '';
        return '<label class="udc-checkbox"><input type="checkbox"' + checked + ' /><span class="udc-checkbox__control"></span><span class="udc-checkbox__label">' + label + '</span></label>';
      }).join('');
      return '<div style="display:flex;flex-direction:column;gap:8px;">' + html + '</div>';
    },
    'radio': function () {
      var configs = [
        { legend: 'Lease type',         options: DATA.leaseTypes },
        { legend: 'Notification frequency', options: ['Realtime', 'Daily digest', 'Weekly summary'] },
        { legend: 'Payment method',     options: ['ACH transfer', 'Credit card', 'Mailed check'] },
        { legend: 'Default view',       options: ['List', 'Grid', 'Calendar'] }
      ];
      var c = pick(configs);
      var opts = c.options.slice(0, randInt(2, c.options.length));
      var checkedIdx = randInt(0, opts.length - 1);
      var html = opts.map(function (o, i) {
        var isChecked = i === checkedIdx ? ' checked' : '';
        var slug = o.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return '<label class="udc-radio"><input type="radio" name="demo-radio-grp" value="' + slug + '"' + isChecked + ' /><span class="udc-radio__control"></span><span class="udc-radio__label">' + o + '</span></label>';
      }).join('');
      return '<div class="udc-radio-group" role="radiogroup"><span class="udc-radio-group__legend">' + c.legend + '</span>' + html + '</div>';
    },
    'badge': function () {
      var variants = pickN(DATA.statuses, randInt(3, 5));
      var html = variants.map(function (s) {
        return '<span class="udc-badge" data-variant="' + s.variant + '">' + s.label + '</span>';
      }).join('');
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + html + '</div>';
    },
    'divider': function () {
      return '<hr class="udc-divider-horizontal" />';
    },
    'spacer': function () {
      var sizes = ['200', '300', '400', '500'];
      return '<div class="udc-spacer" data-size="' + pick(sizes) + '"></div>';
    },
    'icon-wrapper': function () {
      var icons = [
        { icon: 'info',           color: 'interactive' },
        { icon: 'check_circle',   color: 'success'     },
        { icon: 'error',          color: 'error'       },
        { icon: 'warning',        color: 'warning'     },
        { icon: 'home',           color: 'interactive' },
        { icon: 'mail',           color: 'interactive' },
        { icon: 'event',          color: 'interactive' },
        { icon: 'monetization_on',color: 'success'     }
      ];
      var picks = pickN(icons, 3);
      var size = pick(['16', '20', '24', '32']);
      var html = picks.map(function (it) {
        return '<span class="udc-icon-wrapper" data-size="' + size + '" style="color:var(--uds-color-icon-' + it.color + ');"><span class="material-symbols-outlined">' + it.icon + '</span></span>';
      }).join('');
      return '<div style="display:flex;gap:12px;align-items:center;">' + html + '</div>';
    },
    'dialog': function () {
      var s = pick(DATA.dialogScripts);
      return '<button class="udc-button-primary" onclick="document.getElementById(\'demo-dlg\').setAttribute(\'data-open\',\'true\');if(window.UDS)UDS.init();">Open Dialog</button><div class="udc-dialog-backdrop" id="demo-dlg" data-open="false"><div class="udc-dialog" role="dialog" aria-modal="true"><div class="udc-dialog__header"><h2 class="udc-dialog__title">' + s.title + '</h2><button class="udc-dialog__close" aria-label="Close" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');"><span class="material-symbols-outlined">close</span></button></div><div class="udc-dialog__body"><p style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-base);color:var(--uds-color-text-primary);">' + s.body + '</p></div><div class="udc-dialog__footer"><button class="udc-button-secondary" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');">' + s.cancel + '</button><button class="udc-button-primary" onclick="this.closest(\'.udc-dialog-backdrop\').setAttribute(\'data-open\',\'false\');">' + s.confirm + '</button></div></div></div>';
    },
    'tooltip': function () {
      var pair = pick(DATA.tooltipPairs);
      var html = pair.map(function (t) {
        return '<span class="udc-tooltip-wrapper"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">' + t.icon + '</span></button><span class="udc-tooltip" role="tooltip">' + t.tip + '</span></span>';
      }).join('');
      return '<div style="display:flex;gap:16px;">' + html + '</div>';
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
    if (has(components, 'link')) mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['link']() + '</div>');
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
      var pageTitle = pick(DATA.pageTitles);
      mainContent.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h2 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-xl);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0;">' + pageTitle + '</h2>' + DEMO_TEMPLATES['button']() + '</div>');
    } else if (has(components, 'button')) {
      mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['button']() + '</div>');
    }

    if (has(components, 'data-table')) mainContent.push('<div style="margin-bottom:24px;">' + DEMO_TEMPLATES['data-table']() + '</div>');
    if (has(components, 'pagination')) mainContent.push('<div style="margin-bottom:24px;">' + DEMO_TEMPLATES['pagination']() + '</div>');

    if (has(components, 'tile')) {
      var tileHeading = pick(['Quick Actions', 'Shortcuts', 'Get Started', 'What\'s next']);
      mainContent.push('<div style="margin-bottom:24px;"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 12px;">' + tileHeading + '</h3>' + DEMO_TEMPLATES['tile']() + '</div>');
    }

    if (has(components, 'divider') && mainContent.length > 0) mainContent.push(DEMO_TEMPLATES['divider']());

    var formFields = [];
    if (has(components, 'label') && !has(components, 'text-input') && !has(components, 'text-area')) formFields.push(DEMO_TEMPLATES['label']());
    if (has(components, 'text-input')) formFields.push(DEMO_TEMPLATES['text-input']());
    if (has(components, 'text-area')) formFields.push(DEMO_TEMPLATES['text-area']());
    if (has(components, 'dropdown')) formFields.push(DEMO_TEMPLATES['dropdown']());
    if (has(components, 'checkbox')) formFields.push(DEMO_TEMPLATES['checkbox']());
    if (has(components, 'radio')) formFields.push(DEMO_TEMPLATES['radio']());
    if (has(components, 'toggle')) formFields.push(DEMO_TEMPLATES['toggle']());

    if (formFields.length > 0) {
      var formHeading = pick(['Add Tenant', 'New Lease', 'Edit Property', 'Create Invoice', 'New Work Order', 'Update Owner']);
      mainContent.push('<div style="margin-top:24px;padding:24px;background:var(--uds-color-surface-subtle);border-radius:var(--uds-border-radius-container-md);"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 16px;">' + formHeading + '</h3><div style="display:flex;flex-direction:column;gap:16px;">' + formFields.join('') + '</div></div>');
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

  function generateDemoHTML(components, opts) {
    opts = opts || {};
    // Reseed on every generate so each Build / Rebuild rolls fresh data and
    // states. Within a single generate call, the seed stays put so a tenant
    // listed in the data table also gets a consistent property and balance.
    reseedRandom(opts.seed != null ? opts.seed : Date.now() ^ Math.floor(Math.random() * 1e9));
    var origin = getBaseUrl();
    var body = assembleHTMLBody(components);
    return baseHead('UDS Demo — HTML') + '<body>\n' + body + '\n<script src="' + origin + '/uds/uds.js"><\/script>\n</body>\n</html>';
  }

  // Exposed so the Rebuild button in the preview toolbar can re-roll content
  // for the same set of components.
  window.regenerateDemoHTML = function (components) {
    return generateDemoHTML(components);
  };


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

        openDemoOverlay(html, components);

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
    if (last.blobHtml) openDemoOverlay(last.blobHtml, last.components || []);
  };

  // Re-roll the iframe with fresh data/states for the same components,
  // without dismissing the overlay or polluting history.
  window.rebuildDemoPreview = function () {
    var overlay = document.getElementById('sg-demo-overlay');
    if (!overlay) return;
    var components = overlay._components || [];
    if (!components.length) return;
    var rebuildBtn = document.getElementById('sg-demo-rebuild-btn');
    if (rebuildBtn) {
      rebuildBtn.disabled = true;
      rebuildBtn.dataset.originalLabel = rebuildBtn.innerHTML;
      rebuildBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;animation:sg-spin 0.6s linear infinite;display:inline-block;">progress_activity</span>';
    }
    setTimeout(function () {
      var fresh = generateDemoHTML(components);
      var iframe = document.getElementById('sg-demo-iframe');
      if (iframe) iframe.srcdoc = fresh;
      if (rebuildBtn) {
        rebuildBtn.disabled = false;
        rebuildBtn.innerHTML = rebuildBtn.dataset.originalLabel || 'Refresh data';
      }
    }, 50);
  };

  function openDemoOverlay(html, components) {
    var existing = document.getElementById('sg-demo-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'sg-demo-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:var(--uds-z-index-modal);background:var(--uds-color-surface-page-main);display:flex;flex-direction:column;';
    // Stash components so the Rebuild button knows what to re-roll.
    overlay._components = components || [];

    var toolbarBtn = 'background:rgba(255,255,255,0.15);border:none;color:inherit;padding:4px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;display:inline-flex;align-items:center;gap:6px;';
    var iconStyle = 'font-size:16px;';

    var toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--uds-color-surface-interactive-default);color:var(--uds-color-text-inverse);font-family:var(--uds-font-family);font-size:14px;flex-shrink:0;';
    toolbar.innerHTML =
      '<span style="font-weight:700;">UDS Demo Preview</span>' +
      '<div style="display:flex;gap:8px;">' +
        '<button id="sg-demo-rebuild-btn" onclick="window.rebuildDemoPreview()" title="Re-roll fresh data and states without changing the selected components" style="' + toolbarBtn + '">' +
          '<span class="material-symbols-outlined" style="' + iconStyle + '">refresh</span>Refresh data' +
        '</button>' +
        '<button onclick="var b=new Blob([document.getElementById(\'sg-demo-iframe\').srcdoc],{type:\'text/html\'});var a=document.createElement(\'a\');a.href=URL.createObjectURL(b);a.download=\'demo.html\';a.click();" style="' + toolbarBtn + '">' +
          '<span class="material-symbols-outlined" style="' + iconStyle + '">download</span>Save HTML' +
        '</button>' +
        '<button onclick="document.getElementById(\'sg-demo-overlay\').remove();" style="' + toolbarBtn + '">' +
          '<span class="material-symbols-outlined" style="' + iconStyle + '">close</span>Close' +
        '</button>' +
      '</div>';

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
