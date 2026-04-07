/* UDS Component: notification — dismiss on close button click */
(function () {
  'use strict';

  function initNotification(el) {
    if (el._udsInit) return;
    el._udsInit = true;
    var closeBtn = el.querySelector('.udc-notification__close');
    if (!closeBtn) return;
    closeBtn.addEventListener('click', function () {
      el.style.display = 'none';
      el.dispatchEvent(new CustomEvent('uds-dismiss'));
    });
  }

  window.UDS = window.UDS || {};
  window.UDS._initNotification = initNotification;
})();
