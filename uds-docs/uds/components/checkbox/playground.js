// Playground config for the checkbox component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'checked', label: 'Checked', type: 'checkbox', default: false },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'error', label: 'Error state', type: 'checkbox', default: false },
        { key: 'label', label: 'Label text', type: 'text', default: 'Option label' }
      ],
      render(s) {
        const errAttr = s.error ? ' data-state="error"' : '';
        const chkAttr = s.checked ? ' checked' : '';
        const disAttr = s.disabled ? ' disabled' : '';
        const code = '<label class="udc-checkbox"' + errAttr + '>\n  <input type="checkbox"' + chkAttr + disAttr + ' />\n  <span class="udc-checkbox__control"></span>\n  <span class="udc-checkbox__label">' + esc(s.label) + '</span>\n</label>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function MyCheckbox() {');
        rLines.push('  const [checked, setChecked] = useState(' + (s.checked ? 'true' : 'false') + ');');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <label className="udc-checkbox"' + (s.error ? ' data-state="error"' : '') + '>');
        rLines.push('      <input');
        rLines.push('        type="checkbox"');
        rLines.push('        checked={checked}');
        rLines.push('        onChange={(e) => setChecked(e.target.checked)}');
        if (s.disabled) rLines.push('        disabled');
        rLines.push('      />');
        rLines.push('      <span className="udc-checkbox__control" />');
        rLines.push('      <span className="udc-checkbox__label">' + esc(s.label) + '</span>');
        rLines.push('    </label>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const checked = ref(' + (s.checked ? 'true' : 'false') + ');');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <label class="udc-checkbox"' + (s.error ? ' data-state="error"' : '') + '>');
        var vChkAttrs = 'type="checkbox" v-model="checked"';
        if (s.disabled) vChkAttrs += ' disabled';
        vLines.push('    <input ' + vChkAttrs + ' />');
        vLines.push('    <span class="udc-checkbox__control" />');
        vLines.push('    <span class="udc-checkbox__label">' + esc(s.label) + '</span>');
        vLines.push('  </label>');
        vLines.push('</template>');

        return { html: code, code };
      }
    };
