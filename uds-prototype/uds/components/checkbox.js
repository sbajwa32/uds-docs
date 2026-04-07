/* UDS Component: checkbox — indeterminate support */
(function () {
  'use strict';

  function initCheckbox(el) {
    if (el._udsInit) return;
    el._udsInit = true;
    var input = el.querySelector('input[type="checkbox"]');
    if (!input) return;
    if (el.getAttribute('data-indeterminate') === 'true') input.indeterminate = true;
  }

  window.UDS = window.UDS || {};
  window.UDS._initCheckbox = initCheckbox;
})();
