/* UDS Component: text-input — character counter, validation, clear button */
(function () {
  'use strict';

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

  window.UDS = window.UDS || {};
  window.UDS._initTextInput = initTextInput;
})();
