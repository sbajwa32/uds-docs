/* UDS Component: search — clear button visibility, clear on click */
(function () {
  'use strict';

  function initSearch(el) {
    if (el._udsInit) return;
    el._udsInit = true;

    var input = el.querySelector('input');
    var clearBtn = el.querySelector('.udc-search__clear');
    if (!input) return;

    function updateHasValue() {
      el.setAttribute('data-has-value', input.value.length > 0 ? 'true' : 'false');
    }

    input.addEventListener('input', updateHasValue);
    updateHasValue();

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        updateHasValue();
        input.focus();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }

  window.UDS = window.UDS || {};
  window.UDS._initSearch = initSearch;
})();
