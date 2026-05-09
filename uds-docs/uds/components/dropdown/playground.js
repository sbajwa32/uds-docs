// Playground config for the dropdown component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'error', label: 'Error' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'showLabel', label: 'Show label', type: 'checkbox', default: true },
        { key: 'label', label: 'Label text', type: 'text', default: 'Select option' },
        { key: 'required', label: 'Required', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: true },
        { key: 'leadingName', label: 'Leading icon', type: 'icon-search', default: 'add_circle_outline' },
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Choose...' },
        { key: 'showHelper', label: 'Show helper', type: 'checkbox', default: true },
        { key: 'helper', label: 'Helper text', type: 'text', default: 'Helper text' },
        { key: 'showCounter', label: 'Show counter', type: 'checkbox', default: false },
        { key: 'counterText', label: 'Counter text', type: 'text', default: '0/1' },
        { key: 'itemCount', label: 'Options count', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]}
      ],
      render(s) {
        var stateAttr = s.state === 'error' ? ' data-state="error"' : '';
        var disClass = s.disabled ? ' disabled' : '';
        var disAria = s.disabled ? ' aria-disabled="true"' : '';
        var tabIdx = s.disabled ? ' tabindex="-1"' : ' tabindex="0"';
        var iconHtml = '<span class="material-symbols-outlined">' + esc(s.leadingName || 'add_circle_outline') + '</span>';
        var n = parseInt(s.itemCount, 10);
        var optionLabels = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];

        var h = '<div class="udc-dropdown"' + stateAttr + ' style="max-width:340px;">\n';
        if (s.showLabel) {
          h += '  <label class="udc-dropdown__label">' + esc(s.label);
          if (s.required) h += '\n    <span class="udc-dropdown__required"></span>';
          h += '</label>\n';
        }
        h += '  <div class="udc-dropdown__trigger' + disClass + '"' + tabIdx + ' role="combobox" aria-expanded="false" aria-haspopup="listbox"' + disAria + '>\n';
        if (s.leadingIcon) h += '    <span class="udc-dropdown__leading-icon">' + iconHtml + '</span>\n';
        h += '    <span class="udc-dropdown__value" data-placeholder>' + esc(s.placeholder) + '</span>\n';
        h += '    <span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span>\n';
        h += '  </div>\n';
        if (s.showHelper || s.showCounter) {
          h += '  <div class="udc-dropdown__helper">';
          if (s.showHelper) h += '<span>' + esc(s.helper) + '</span>';
          if (s.showCounter) h += '<span class="udc-dropdown__counter">' + esc(s.counterText) + '</span>';
          h += '</div>\n';
        }
        h += '  <div class="udc-dropdown__list" role="listbox">\n';
        for (var i = 0; i < n; i++) {
          h += '    <div class="udc-dropdown__item" role="option">' + optionLabels[i] + '</div>\n';
        }
        h += '  </div>\n';
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState, useRef, useEffect } from 'react';");
        rLines.push('');
        rLines.push('function Dropdown() {');
        rLines.push('  const [open, setOpen] = useState(false);');
        rLines.push("  const [selected, setSelected] = useState('');");
        if (s.state === 'error') rLines.push('  const [error, setError] = useState(true);');
        rLines.push('  const ref = useRef(null);');
        rLines.push('');
        rLines.push('  useEffect(() => {');
        rLines.push('    const handler = (e) => {');
        rLines.push('      if (ref.current && !ref.current.contains(e.target)) setOpen(false);');
        rLines.push('    };');
        rLines.push("    document.addEventListener('click', handler);");
        rLines.push("    return () => document.removeEventListener('click', handler);");
        rLines.push('  }, []);');
        rLines.push('');
        var optArr = [];
        for (var i2 = 0; i2 < n; i2++) optArr.push("'" + optionLabels[i2] + "'");
        rLines.push('  const options = [' + optArr.join(', ') + '];');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-dropdown" ref={ref}' + (s.state === 'error' ? ' data-state={error ? "error" : undefined}' : '') + ' data-open={open}>');
        if (s.showLabel) {
          var reqJsx = s.required ? '<span className="udc-dropdown__required" />' : '';
          rLines.push('      <label className="udc-dropdown__label">' + esc(s.label) + reqJsx + '</label>');
        }
        rLines.push('      <div');
        rLines.push('        className="udc-dropdown__trigger"');
        rLines.push('        tabIndex={0}');
        rLines.push('        role="combobox"');
        rLines.push('        aria-expanded={open}');
        rLines.push('        aria-haspopup="listbox"');
        if (s.disabled) rLines.push('        aria-disabled="true"');
        rLines.push('        onClick={() => setOpen(!open)}');
        rLines.push('      >');
        if (s.leadingIcon) rLines.push('        <span className="udc-dropdown__leading-icon"><span className="material-symbols-outlined">' + esc(s.leadingName || 'add_circle_outline') + '</span></span>');
        rLines.push('        <span className="udc-dropdown__value" data-placeholder={!selected || undefined}>');
        rLines.push("          {selected || '" + esc(s.placeholder) + "'}");
        rLines.push('        </span>');
        rLines.push('        <span className="udc-dropdown__chevron"><span className="material-symbols-outlined">keyboard_arrow_down</span></span>');
        rLines.push('      </div>');
        if (s.showHelper || s.showCounter) {
          rLines.push('      <div className="udc-dropdown__helper">');
          if (s.showHelper) rLines.push('        <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) rLines.push('        <span className="udc-dropdown__counter">' + esc(s.counterText) + '</span>');
          rLines.push('      </div>');
        }
        rLines.push('      {open && (');
        rLines.push('        <div className="udc-dropdown__list" role="listbox">');
        rLines.push('          {options.map((opt) => (');
        rLines.push('            <div');
        rLines.push('              key={opt}');
        rLines.push('              className="udc-dropdown__item"');
        rLines.push('              role="option"');
        rLines.push('              aria-selected={selected === opt}');
        rLines.push('              onClick={() => { setSelected(opt); setOpen(false); }}');
        rLines.push('            >');
        rLines.push('              {opt}');
        rLines.push('            </div>');
        rLines.push('          ))}');
        rLines.push('        </div>');
        rLines.push('      )}');
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const open = ref(false);');
        vLines.push("const selected = ref('');");
        if (s.state === 'error') vLines.push('const error = ref(true);');
        vLines.push('const options = [' + optArr.join(', ') + '];');
        vLines.push('');
        vLines.push('function select(opt) {');
        vLines.push('  selected.value = opt;');
        vLines.push('  open.value = false;');
        vLines.push('}');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-dropdown"' + (s.state === 'error' ? ' :data-state="error ? \'error\' : undefined"' : '') + ' :data-open="open">');
        if (s.showLabel) {
          var reqVue = s.required ? '<span class="udc-dropdown__required" />' : '';
          vLines.push('    <label class="udc-dropdown__label">' + esc(s.label) + reqVue + '</label>');
        }
        vLines.push('    <div');
        vLines.push('      class="udc-dropdown__trigger"');
        vLines.push('      tabindex="0"');
        vLines.push('      role="combobox"');
        vLines.push('      :aria-expanded="open"');
        vLines.push('      aria-haspopup="listbox"');
        if (s.disabled) vLines.push('      aria-disabled="true"');
        vLines.push('      @click="open = !open"');
        vLines.push('    >');
        if (s.leadingIcon) vLines.push('      <span class="udc-dropdown__leading-icon"><span class="material-symbols-outlined">' + esc(s.leadingName || 'add_circle_outline') + '</span></span>');
        vLines.push('      <span class="udc-dropdown__value" :data-placeholder="!selected || undefined">');
        vLines.push("        {{ selected || '" + esc(s.placeholder) + "' }}");
        vLines.push('      </span>');
        vLines.push('      <span class="udc-dropdown__chevron"><span class="material-symbols-outlined">keyboard_arrow_down</span></span>');
        vLines.push('    </div>');
        if (s.showHelper || s.showCounter) {
          vLines.push('    <div class="udc-dropdown__helper">');
          if (s.showHelper) vLines.push('      <span>' + esc(s.helper) + '</span>');
          if (s.showCounter) vLines.push('      <span class="udc-dropdown__counter">' + esc(s.counterText) + '</span>');
          vLines.push('    </div>');
        }
        vLines.push('    <div v-if="open" class="udc-dropdown__list" role="listbox">');
        vLines.push('      <div');
        vLines.push('        v-for="opt in options"');
        vLines.push('        :key="opt"');
        vLines.push('        class="udc-dropdown__item"');
        vLines.push('        role="option"');
        vLines.push('        :aria-selected="selected === opt"');
        vLines.push('        @click="select(opt)"');
        vLines.push('      >');
        vLines.push('        {{ opt }}');
        vLines.push('      </div>');
        vLines.push('    </div>');
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    };
