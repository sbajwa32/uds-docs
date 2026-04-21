/* UDS Component: nav-vertical — selection + keyboard navigation */
(function () {
  'use strict';

  function initNavVertical(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var buttons = Array.prototype.slice.call(el.querySelectorAll('.udc-nav-button'));
    if (!buttons.length) return;

    function select(btn) {
      buttons.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
        select(btn);
      });
      btn.addEventListener('keydown', function (e) {
        var idx = buttons.indexOf(btn); var next;
        if (e.key === 'ArrowDown') { e.preventDefault(); next = idx + 1; while (next < buttons.length && buttons[next].disabled) next++; if (next < buttons.length) buttons[next].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); next = idx - 1; while (next >= 0 && buttons[next].disabled) next--; if (next >= 0) buttons[next].focus(); }
      });
    });
  }

  window.UDS = window.UDS || {};
  window.UDS._initNavVertical = initNavVertical;
})();
