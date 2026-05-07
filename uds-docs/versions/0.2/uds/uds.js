/* ==========================================================================
   UDS — Urban Design System
   Orchestrator — loads per-component behavior scripts and wires up UDS.init().

   Architecture (mirrors uds.css):
     uds.js                          ← this file (orchestrator)
     components/text-input.js        ← character counter, validation, clear
     components/tabs.js              ← click-select, arrow keys, ARIA panels
     components/checkbox.js          ← indeterminate support
     components/dropdown.js          ← open/close, select, keyboard nav
     components/notification.js      ← dismiss on close click
     components/dialog.js            ← open/close, backdrop, Escape
     components/tile.js              ← toggle selected on click
     components/list.js              ← single selection, keyboard nav
     components/data-table.js        ← checkbox toggle-all, sort cycling
     components/nav-header.js        ← bento dropdown toggle
     components/nav-vertical.js      ← sidebar nav selection, keyboard nav

   CSS-only components (no JS needed):
     button, badge, divider, icon-wrapper, spacer, breadcrumb, radio

   Usage:
     <script src="uds/uds.js"></script>
     — or load individual component scripts for tree-shaking.

   Auto-initialises all UDS components on DOMContentLoaded.
   Call UDS.init() to re-initialise after dynamically adding components.
   ========================================================================== */

(function (root) {
  'use strict';

  var UDS = root.UDS || {};

  /* ========================================================================
     Load component scripts dynamically
     ======================================================================== */
  var COMPONENT_SCRIPTS = [
    'components/text-input.js',
    'components/tabs.js',
    'components/checkbox.js',
    'components/dropdown.js',
    'components/notification.js',
    'components/dialog.js',
    'components/tile.js',
    'components/list.js',
    'components/data-table.js',
    'components/nav-header.js',
    'components/nav-vertical.js',
    'components/chip.js',
    'components/search.js'
  ];

  var basePath = '';
  var scripts = document.querySelectorAll('script[src]');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute('src');
    if (src && src.indexOf('uds.js') !== -1) {
      basePath = src.replace(/uds\.js.*$/, '');
      break;
    }
  }

  var loadedCount = 0;
  var totalScripts = COMPONENT_SCRIPTS.length;

  function onScriptReady() {
    loadedCount++;
    if (loadedCount >= totalScripts) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { UDS.init(); });
      } else {
        UDS.init();
      }
    }
  }

  COMPONENT_SCRIPTS.forEach(function (path) {
    var script = document.createElement('script');
    script.src = basePath + path;
    script.async = false;
    script.onload = onScriptReady;
    script.onerror = onScriptReady;
    document.head.appendChild(script);
  });

  /* ========================================================================
     Public API — delegates to per-component init functions
     ======================================================================== */
  UDS.init = function (scope) {
    var root = scope || document;

    if (UDS._initTextInput)    root.querySelectorAll('.udc-text-input').forEach(UDS._initTextInput);
    if (UDS._initTabs)         root.querySelectorAll('.udc-tabs').forEach(UDS._initTabs);
    if (UDS._initCheckbox)     root.querySelectorAll('.udc-checkbox').forEach(UDS._initCheckbox);
    if (UDS._initNavBento)     root.querySelectorAll('.udc-nav-bento-wrapper').forEach(UDS._initNavBento);
    if (UDS._initNavVertical)  root.querySelectorAll('.udc-nav-vertical').forEach(UDS._initNavVertical);
    if (UDS._initDropdown)     root.querySelectorAll('.udc-dropdown').forEach(UDS._initDropdown);
    if (UDS._initNotification) root.querySelectorAll('.udc-notification').forEach(UDS._initNotification);
    if (UDS._initDialog)       root.querySelectorAll('.udc-dialog-backdrop').forEach(UDS._initDialog);
    if (UDS._initTile)         root.querySelectorAll('.udc-tile').forEach(UDS._initTile);
    if (UDS._initList)         root.querySelectorAll('.udc-list').forEach(UDS._initList);
    if (UDS._initDataTable)    root.querySelectorAll('.udc-data-table').forEach(UDS._initDataTable);
    if (UDS._initChip)         root.querySelectorAll('.udc-chip').forEach(UDS._initChip);
    if (UDS._initSearch)       root.querySelectorAll('.udc-search').forEach(UDS._initSearch);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UDS;
  } else {
    root.UDS = UDS;
  }

})(typeof window !== 'undefined' ? window : this);
