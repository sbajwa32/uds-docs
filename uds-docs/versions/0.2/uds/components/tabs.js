/* UDS Component: tabs — click to select, arrow keys, ARIA, panel show/hide */
(function () {
  'use strict';

  function initTabs(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var tabs = Array.prototype.slice.call(el.querySelectorAll('.udc-tab'));
    if (!tabs.length) return;

    function selectTab(tab) {
      tabs.forEach(function (t) {
        var isSelected = t === tab;
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        t.setAttribute('tabindex', isSelected ? '0' : '-1');
        var panelId = t.getAttribute('aria-controls');
        if (panelId) {
          var panel = document.getElementById(panelId);
          if (panel) panel.hidden = !isSelected;
        }
      });
      tab.focus();
    }

    tabs.forEach(function (tab, i) {
      if (!tab.hasAttribute('tabindex')) {
        tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
      }
      tab.addEventListener('click', function () { if (!tab.disabled) selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        var idx = tabs.indexOf(tab);
        var next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault(); next = idx + 1;
          while (next < tabs.length && tabs[next].disabled) next++;
          if (next < tabs.length) selectTab(tabs[next]);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault(); next = idx - 1;
          while (next >= 0 && tabs[next].disabled) next--;
          if (next >= 0) selectTab(tabs[next]);
        } else if (e.key === 'Home') {
          e.preventDefault();
          for (next = 0; next < tabs.length; next++) { if (!tabs[next].disabled) { selectTab(tabs[next]); break; } }
        } else if (e.key === 'End') {
          e.preventDefault();
          for (next = tabs.length - 1; next >= 0; next--) { if (!tabs[next].disabled) { selectTab(tabs[next]); break; } }
        }
      });
    });
  }

  window.UDS = window.UDS || {};
  window.UDS._initTabs = initTabs;
})();
