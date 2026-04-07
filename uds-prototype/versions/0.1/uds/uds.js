/* ==========================================================================
   UDS — Urban Design System
   Vanilla JavaScript behaviors for interactive components.

   Usage:
     <script src="uds.js"></script>
     — or —
     import './uds.js';

   Auto-initialises all UDS components on DOMContentLoaded.
   Call UDS.init() to re-initialise after dynamically adding components.
   ========================================================================== */

(function (root) {
  'use strict';

  var UDS = {};

  /* ========================================================================
     Text Input
     - Character counter (live update)
     - Required validation on blur
     - Clearing via trailing button
     ======================================================================== */
  function initTextInput(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var field = el.querySelector('.udc-text-input__field');
    var input = field ? field.querySelector('input, textarea') : null;
    if (!input) return;

    var counter = el.querySelector('.udc-text-input__counter');
    var trailingBtn = el.querySelector('.udc-text-input__trailing-btn');
    var helperSpan = el.querySelector('.udc-text-input__helper > span:not(.udc-text-input__counter)');

    var maxLength = input.getAttribute('maxlength');
    var origHelper = helperSpan ? helperSpan.textContent : '';

    function updateCounter() {
      if (!counter || !maxLength) return;
      counter.textContent = input.value.length + '/' + maxLength;
    }

    function validate() {
      if (input.disabled) return;
      var isEmpty = input.value.trim() === '';
      var isRequired = input.required || input.hasAttribute('required');
      var pattern = input.getAttribute('pattern');
      var hasPatternError = pattern && input.value && !new RegExp(pattern).test(input.value);

      if (isRequired && isEmpty) {
        el.setAttribute('data-state', 'error');
        if (helperSpan) helperSpan.textContent = 'This field is required';
      } else if (hasPatternError) {
        el.setAttribute('data-state', 'error');
        if (helperSpan) helperSpan.textContent = input.title || 'Invalid format';
      } else {
        el.removeAttribute('data-state');
        if (helperSpan) helperSpan.textContent = origHelper;
      }
    }

    input.addEventListener('input', updateCounter);
    input.addEventListener('blur', validate);
    input.addEventListener('input', function () {
      if (el.getAttribute('data-state') === 'error') validate();
    });

    if (trailingBtn) {
      trailingBtn.addEventListener('click', function () {
        input.value = '';
        input.focus();
        updateCounter();
        if (el.getAttribute('data-state') === 'error') validate();
      });
    }

    updateCounter();
  }

  /* ========================================================================
     Tabs
     - Click to select
     - Arrow key navigation
     - ARIA attribute management
     - Panel show/hide (if panels use aria-labelledby matching tab id)
     ======================================================================== */
  function initTabs(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var tabs = Array.prototype.slice.call(el.querySelectorAll('.udc-tab'));
    if (!tabs.length) return;

    function selectTab(tab) {
      tabs.forEach(function (t) {
        var isSelected = t === tab;
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        t.setAttribute('tabindex', isSelected ? '0' : '-1');

        var panelId = t.getAttribute('aria-controls');
        if (panelId) {
          var panel = document.getElementById(panelId);
          if (panel) panel.hidden = !isSelected;
        }
      });
      tab.focus();
    }

    tabs.forEach(function (tab, i) {
      if (!tab.hasAttribute('tabindex')) {
        tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
      }

      tab.addEventListener('click', function () {
        if (tab.disabled) return;
        selectTab(tab);
      });

      tab.addEventListener('keydown', function (e) {
        var idx = tabs.indexOf(tab);
        var next;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          next = idx + 1;
          while (next < tabs.length && tabs[next].disabled) next++;
          if (next < tabs.length) selectTab(tabs[next]);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          next = idx - 1;
          while (next >= 0 && tabs[next].disabled) next--;
          if (next >= 0) selectTab(tabs[next]);
        } else if (e.key === 'Home') {
          e.preventDefault();
          for (next = 0; next < tabs.length; next++) {
            if (!tabs[next].disabled) { selectTab(tabs[next]); break; }
          }
        } else if (e.key === 'End') {
          e.preventDefault();
          for (next = tabs.length - 1; next >= 0; next--) {
            if (!tabs[next].disabled) { selectTab(tabs[next]); break; }
          }
        }
      });
    });
  }

  /* ========================================================================
     Checkbox — indeterminate support
     Set data-indeterminate="true" on the <label> to activate.
     ======================================================================== */
  function initCheckbox(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var input = el.querySelector('input[type="checkbox"]');
    if (!input) return;

    if (el.getAttribute('data-indeterminate') === 'true') {
      input.indeterminate = true;
    }
  }

  /* ========================================================================
     Nav — bento dropdown toggle, vertical nav selection, keyboard nav
     ======================================================================== */
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

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener('click', function (e) {
      if (!el.contains(e.target)) toggle(false);
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggle(false);
    });
  }

  function initNavVertical(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var buttons = Array.prototype.slice.call(el.querySelectorAll('.udc-nav-button'));
    if (!buttons.length) return;

    function select(btn) {
      buttons.forEach(function (b) {
        var isSelected = b === btn;
        b.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
        select(btn);
      });

      btn.addEventListener('keydown', function (e) {
        var idx = buttons.indexOf(btn);
        var next;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          next = idx + 1;
          while (next < buttons.length && buttons[next].disabled) next++;
          if (next < buttons.length) { buttons[next].focus(); }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          next = idx - 1;
          while (next >= 0 && buttons[next].disabled) next--;
          if (next >= 0) { buttons[next].focus(); }
        }
      });
    });
  }

  /* ========================================================================
     Public API
     ======================================================================== */
  UDS.init = function (scope) {
    var root = scope || document;

    root.querySelectorAll('.udc-text-input').forEach(initTextInput);
    root.querySelectorAll('.udc-tabs').forEach(initTabs);
    root.querySelectorAll('.udc-checkbox').forEach(initCheckbox);
    root.querySelectorAll('.udc-nav-bento-wrapper').forEach(initNavBento);
    root.querySelectorAll('.udc-nav-vertical').forEach(initNavVertical);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { UDS.init(); });
  } else {
    UDS.init();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UDS;
  } else {
    root.UDS = UDS;
  }

})(typeof window !== 'undefined' ? window : this);
