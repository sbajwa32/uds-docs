/* UDS Component: data-table — checkbox toggle-all, sort cycling */
(function () {
  'use strict';

  function initDataTable(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var headerCb = el.querySelector('thead .udc-dt-check input[type="checkbox"]');
    var rowCbs = Array.prototype.slice.call(el.querySelectorAll('tbody .udc-dt-check input[type="checkbox"]'));

    if (headerCb && rowCbs.length) {
      headerCb.addEventListener('change', function () {
        rowCbs.forEach(function (cb) { cb.checked = headerCb.checked; });
      });
      rowCbs.forEach(function (cb) {
        cb.addEventListener('change', function () {
          var allChecked = rowCbs.every(function (c) { return c.checked; });
          var someChecked = rowCbs.some(function (c) { return c.checked; });
          headerCb.checked = allChecked;
          headerCb.indeterminate = !allChecked && someChecked;
        });
      });
    }

    var sortHeaders = Array.prototype.slice.call(el.querySelectorAll('.udc-dt-sort'));
    sortHeaders.forEach(function (span) {
      var th = span.closest('th');
      if (!th) return;
      if (!th.hasAttribute('tabindex')) th.setAttribute('tabindex', '0');

      function cycleSort() {
        var cur = span.getAttribute('data-dir') || '';
        var next = cur === '' ? 'asc' : cur === 'asc' ? 'desc' : '';
        sortHeaders.forEach(function (s) { if (s !== span) s.removeAttribute('data-dir'); });
        if (next) span.setAttribute('data-dir', next);
        else span.removeAttribute('data-dir');
      }

      th.addEventListener('click', cycleSort);
      th.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleSort(); }
      });
    });
  }

  window.UDS = window.UDS || {};
  window.UDS._initDataTable = initDataTable;
})();
