/* UDS Component: dropdown — open/close, select, keyboard nav, click-outside */
(function () {
  'use strict';

  function initDropdown(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var trigger = el.querySelector('.udc-dropdown__trigger');
    var list = el.querySelector('.udc-dropdown__list');
    var valueEl = el.querySelector('.udc-dropdown__value');
    if (!trigger || !list) return;

    var items = Array.prototype.slice.call(list.querySelectorAll('.udc-dropdown__item'));

    function isOpen() { return el.getAttribute('data-open') === 'true'; }

    function toggle(open) {
      var shouldOpen = typeof open === 'boolean' ? open : !isOpen();
      if (trigger.getAttribute('aria-disabled') === 'true') return;
      el.setAttribute('data-open', shouldOpen ? 'true' : 'false');
      trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      if (shouldOpen && items.length) {
        var sel = list.querySelector('[aria-selected="true"]') || items[0];
        sel.focus();
      }
    }

    function select(item) {
      items.forEach(function (it) { it.setAttribute('aria-selected', it === item ? 'true' : 'false'); });
      if (valueEl) { valueEl.textContent = item.textContent; valueEl.removeAttribute('data-placeholder'); }
      toggle(false);
      trigger.focus();
      el.dispatchEvent(new CustomEvent('uds-change', { detail: { value: item.textContent } }));
    }

    trigger.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isOpen()) toggle(true); }
      else if (e.key === 'Escape') toggle(false);
    });

    items.forEach(function (item) {
      item.setAttribute('tabindex', '-1');
      item.addEventListener('click', function (e) { e.stopPropagation(); select(item); });
      item.addEventListener('keydown', function (e) {
        var idx = items.indexOf(item);
        if (e.key === 'ArrowDown') { e.preventDefault(); if (idx + 1 < items.length) items[idx + 1].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (idx - 1 >= 0) items[idx - 1].focus(); else trigger.focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(item); }
        else if (e.key === 'Escape') { toggle(false); trigger.focus(); }
      });
    });

    document.addEventListener('click', function (e) { if (!el.contains(e.target)) toggle(false); });
  }

  window.UDS = window.UDS || {};
  window.UDS._initDropdown = initDropdown;
})();
