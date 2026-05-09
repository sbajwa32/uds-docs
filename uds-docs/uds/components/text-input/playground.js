// Playground config for the text-input component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'error', label: 'Error' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'showLabel', label: 'Show label', type: 'checkbox', default: true },
        { key: 'label', label: 'Label text', type: 'text', default: 'Field label' },
        { key: 'required', label: 'Required', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: false },
        { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'search' },
        { key: 'trailingBtn', label: 'Trailing button', type: 'checkbox', default: false },
        { key: 'trailingName', label: 'Trailing icon', type: 'icon-search', default: 'close' },
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Enter value...' },
        { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
        { key: 'helper', label: 'Helper text', type: 'text', default: 'Helper text here' },
        { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: false },
        { key: 'counterText', label: 'Counter text', type: 'text', default: '0/20' }
      ],
      render(s) {
        const stateAttr = s.state === 'error' ? ' data-state="error"' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        const leadingIcon = '<span class="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span>';
        const trailingIcon = '<span class="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>';
        let h = '<div class="udc-text-input"' + stateAttr + ' style="max-width:340px;">\n';
        if (s.showLabel) {
          h += '  <label class="udc-text-input__label">' + esc(s.label);
          if (s.required) h += '\n    <span class="udc-text-input__required"></span>';
          h += '</label>\n';
        }
        h += '  <div class="udc-text-input__field">\n';
        if (s.leadingIcon) h += '    <span class="udc-text-input__leading-icon">' + leadingIcon + '</span>\n';
        h += '    <input type="text" placeholder="' + esc(s.placeholder) + '"' + disAttr + ' />\n';
        if (s.trailingBtn) h += '    <button class="udc-text-input__trailing-btn" type="button">' + trailingIcon + '</button>\n';
        h += '  </div>\n';
        if (s.showHelper || s.showCounter) {
          h += '  <div class="udc-text-input__helper">';
          if (s.showHelper) h += '<span>' + esc(s.helper) + '</span>';
          if (s.showCounter) h += '<span class="udc-text-input__counter">' + esc(s.counterText) + '</span>';
          h += '</div>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function TextInput() {');
        rLines.push('  const [value, setValue] = useState(\'\');');
        if (s.state === 'error') rLines.push('  const [error, setError] = useState(true);');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-text-input"' + (s.state === 'error' ? ' data-state={error ? "error" : undefined}' : '') + '>');
        if (s.showLabel) {
          var reqJsx = s.required ? '<span className="udc-text-input__required" />' : '';
          rLines.push('      <label className="udc-text-input__label">' + esc(s.label) + reqJsx + '</label>');
        }
        rLines.push('      <div className="udc-text-input__field">');
        if (s.leadingIcon) rLines.push('        <span className="udc-text-input__leading-icon"><span className="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span></span>');
        rLines.push('        <input');
        rLines.push('          type="text"');
        rLines.push('          placeholder="' + esc(s.placeholder) + '"');
        rLines.push('          value={value}');
        rLines.push('          onChange={(e) => setValue(e.target.value)}');
        if (s.disabled) rLines.push('          disabled');
        rLines.push('        />');
        if (s.trailingBtn) {
          rLines.push('        <button');
          rLines.push('          className="udc-text-input__trailing-btn"');
          rLines.push('          type="button"');
          rLines.push('          onClick={() => setValue(\'\')}');
          rLines.push('        >');
          rLines.push('          <span className="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>');
          rLines.push('        </button>');
        }
        rLines.push('      </div>');
        if (s.showHelper || s.showCounter) {
          rLines.push('      <div className="udc-text-input__helper">');
          if (s.showHelper) rLines.push('        <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) rLines.push('        <span className="udc-text-input__counter">{value.length}/20</span>');
          rLines.push('      </div>');
        }
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push("const value = ref('');");
        if (s.state === 'error') vLines.push('const error = ref(true);');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-text-input"' + (s.state === 'error' ? ' :data-state="error ? \'error\' : undefined"' : '') + '>');
        if (s.showLabel) {
          var reqVue = s.required ? '<span class="udc-text-input__required" />' : '';
          vLines.push('    <label class="udc-text-input__label">' + esc(s.label) + reqVue + '</label>');
        }
        vLines.push('    <div class="udc-text-input__field">');
        if (s.leadingIcon) vLines.push('      <span class="udc-text-input__leading-icon"><span class="material-symbols-outlined">' + esc(s.leadingName || 'search') + '</span></span>');
        var vInputAttrs = 'type="text" placeholder="' + esc(s.placeholder) + '" v-model="value"';
        if (s.disabled) vInputAttrs += ' disabled';
        vLines.push('      <input ' + vInputAttrs + ' />');
        if (s.trailingBtn) {
          vLines.push('      <button class="udc-text-input__trailing-btn" type="button" @click="value = \'\'">');
          vLines.push('        <span class="material-symbols-outlined">' + esc(s.trailingName || 'close') + '</span>');
          vLines.push('      </button>');
        }
        vLines.push('    </div>');
        if (s.showHelper || s.showCounter) {
          vLines.push('    <div class="udc-text-input__helper">');
          if (s.showHelper) vLines.push('      <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) vLines.push('      <span class="udc-text-input__counter">{{ value.length }}/20</span>');
          vLines.push('    </div>');
        }
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    };
