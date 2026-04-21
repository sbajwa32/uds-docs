/* UDS Component: dialog — open/close, backdrop click, Escape key, focus trap */
(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function initDialog(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var dialog = el.querySelector('.udc-dialog');
    var closeBtn = el.querySelector('.udc-dialog__close');

    function close() {
      el.setAttribute('data-open', 'false');
      if (el._previousFocus) { el._previousFocus.focus(); el._previousFocus = null; }
      el.dispatchEvent(new CustomEvent('uds-close'));
    }

    function trapFocus(e) {
      if (el.getAttribute('data-open') !== 'true' || !dialog) return;
      var focusable = Array.prototype.slice.call(dialog.querySelectorAll(FOCUSABLE));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    el.addEventListener('click', function (e) { if (e.target === el) close(); });
    if (closeBtn) closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (el.getAttribute('data-open') !== 'true') return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') trapFocus(e);
    });

    var observer = new MutationObserver(function () {
      if (el.getAttribute('data-open') === 'true' && dialog) {
        el._previousFocus = document.activeElement;
        var first = dialog.querySelector(FOCUSABLE);
        if (first) first.focus();
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-open'] });
  }

  window.UDS = window.UDS || {};
  window.UDS._initDialog = initDialog;
})();
