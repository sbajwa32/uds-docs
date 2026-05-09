// Playground config for the radio component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'count', label: 'Options', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }
        ]},
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'error', label: 'Error state', type: 'checkbox', default: false }
      ],
      render(s) {
        const n = parseInt(s.count, 10);
        const labels = ['Option A', 'Option B', 'Option C', 'Option D'];
        const errAttr = s.error ? ' data-state="error"' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        let h = '<div class="udc-radio-group" role="radiogroup" aria-labelledby="pg-radio-legend">\n';
        h += '  <span class="udc-radio-group__legend" id="pg-radio-legend">Choose one</span>\n';
        for (let i = 0; i < n; i++) {
          const chk = i === 0 ? ' checked' : '';
          h += '  <label class="udc-radio"' + errAttr + '>\n    <input type="radio" name="pg-radio" value="' + i + '"' + chk + disAttr + ' />\n    <span class="udc-radio__control"></span>\n    <span class="udc-radio__label">' + labels[i] + '</span>\n  </label>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function RadioGroup() {');
        rLines.push("  const [selected, setSelected] = useState('0');");
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-radio-group" role="radiogroup" aria-labelledby="legend">');
        rLines.push('      <span className="udc-radio-group__legend" id="legend">Choose one</span>');
        for (var ri = 0; ri < n; ri++) {
          rLines.push('      <label className="udc-radio"' + (s.error ? ' data-state="error"' : '') + '>');
          rLines.push('        <input');
          rLines.push('          type="radio"');
          rLines.push('          name="choice"');
          rLines.push('          value="' + ri + '"');
          rLines.push("          checked={selected === '" + ri + "'}");
          rLines.push("          onChange={() => setSelected('" + ri + "')}");
          if (s.disabled) rLines.push('          disabled');
          rLines.push('        />');
          rLines.push('        <span className="udc-radio__control" />');
          rLines.push('        <span className="udc-radio__label">' + labels[ri] + '</span>');
          rLines.push('      </label>');
        }
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push("const selected = ref('0');");
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-radio-group" role="radiogroup" aria-labelledby="legend">');
        vLines.push('    <span class="udc-radio-group__legend" id="legend">Choose one</span>');
        for (var vi = 0; vi < n; vi++) {
          vLines.push('    <label class="udc-radio"' + (s.error ? ' data-state="error"' : '') + '>');
          var vRadioAttrs = 'type="radio" name="choice" value="' + vi + '" v-model="selected"';
          if (s.disabled) vRadioAttrs += ' disabled';
          vLines.push('      <input ' + vRadioAttrs + ' />');
          vLines.push('      <span class="udc-radio__control" />');
          vLines.push('      <span class="udc-radio__label">' + labels[vi] + '</span>');
          vLines.push('    </label>');
        }
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    };
