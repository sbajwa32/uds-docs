/* UDS Component: chip — toggle selected on click, dismiss (input variant) */
(function () {
  'use strict';

  function initChip(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    el.addEventListener('click', function () {
      var variant = el.getAttribute('data-variant') || 'default';
      var isSelected = el.getAttribute('aria-selected') === 'true';

      if (variant === 'input' && isSelected) {
        el.dispatchEvent(new CustomEvent('uds-dismiss'));
        el.remove();
        return;
      }

      if (variant === 'filter' || variant === 'dropdown') {
        el.setAttribute('aria-selected', isSelected ? 'false' : 'true');
      }
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        var variant = el.getAttribute('data-variant') || 'default';
        if (variant === 'input') {
          el.dispatchEvent(new CustomEvent('uds-dismiss'));
          el.remove();
        }
      }
    });
  }

  window.UDS = window.UDS || {};
  window.UDS._initChip = initChip;
})();
