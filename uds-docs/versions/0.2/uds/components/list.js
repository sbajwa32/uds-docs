/* UDS Component: list — single selection via click + keyboard */
(function () {
  'use strict';

  function initList(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var items = Array.prototype.slice.call(el.querySelectorAll('.udc-list-item'));

    function select(item) {
      items.forEach(function (it) { it.setAttribute('aria-selected', 'false'); });
      item.setAttribute('aria-selected', 'true');
      item.focus();
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { select(item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' && i < items.length - 1) { e.preventDefault(); items[i + 1].focus(); }
        if (e.key === 'ArrowUp' && i > 0) { e.preventDefault(); items[i - 1].focus(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(item); }
      });
    });
  }

  window.UDS = window.UDS || {};
  window.UDS._initList = initList;
})();
