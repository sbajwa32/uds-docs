/* UDS Component: tile — toggle selected on click */
(function () {
  'use strict';

  function initTile(el) {
    if (el._udsInit) return;
    el._udsInit = true;
    function toggle() {
      if (el.getAttribute('aria-disabled') === 'true' || el.getAttribute('data-disabled') === 'true') return;
      var isSelected = el.getAttribute('aria-selected') === 'true';
      el.setAttribute('aria-selected', isSelected ? 'false' : 'true');
    }

    el.addEventListener('click', toggle);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  window.UDS = window.UDS || {};
  window.UDS._initTile = initTile;
})();
