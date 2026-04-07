/* UDS Component: nav-header — bento dropdown toggle, click-outside close */
(function () {
  'use strict';

  function initNavBento(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var trigger = el.querySelector('.udc-nav-bento-button');
    var panel = el.querySelector('.udc-nav-bento');
    if (!trigger || !panel) return;

    function toggle(open) {
      var isOpen = typeof open === 'boolean' ? open : panel.getAttribute('data-open') !== 'true';
      panel.setAttribute('data-open', isOpen ? 'true' : 'false');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    trigger.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    document.addEventListener('click', function (e) { if (!el.contains(e.target)) toggle(false); });
    trigger.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  window.UDS = window.UDS || {};
  window.UDS._initNavBento = initNavBento;
})();
