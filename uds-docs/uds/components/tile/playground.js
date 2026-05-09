// Playground config for the tile component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'label', label: 'Label', type: 'text', default: 'Upload CSV' },
        { key: 'body1', label: 'Body line 1', type: 'text', default: 'Import residents from a spreadsheet' },
        { key: 'body2', label: 'Body line 2', type: 'text', default: '' },
        { key: 'required', label: 'Required dot', type: 'checkbox', default: true },
        { key: 'showChevron', label: 'Show chevron', type: 'checkbox', default: true },
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'selected', label: 'Selected' }, { value: 'disabled', label: 'Disabled' }
        ]}
      ],
      render(s) {
        var reqDot = s.required ? '\n    <span class="udc-tile__required"></span>' : '';
        var bodyLines = '<div class="udc-tile__body">' + s.body1 + '</div>';
        if (s.body2) bodyLines += '\n    <div class="udc-tile__body">' + s.body2 + '</div>';
        var chevron = s.showChevron ? '\n  <span class="udc-tile__chevron">\n    <span class="material-symbols-outlined">chevron_right</span>\n  </span>' : '';
        var attrs = ' tabindex="0"';
        if (s.state === 'selected') attrs += ' aria-selected="true"';
        if (s.state === 'disabled') attrs = ' tabindex="-1" aria-disabled="true"';

        var code = '<div class="udc-tile"' + attrs + '>\n  <div class="udc-tile__content">\n    <div class="udc-tile__label">' + s.label + reqDot + '</div>\n    ' + bodyLines + '\n  </div>' + chevron + '\n</div>';
        var html = '<div style="max-width:280px;">' + code + '</div>';

        var reactCode = "import { useState } from 'react';\n\nfunction Tile({ label, body, required, showChevron = true, disabled }) {\n  const [selected, setSelected] = useState(false);\n\n  return (\n    <div\n      className=\"udc-tile\"\n      tabIndex={disabled ? -1 : 0}\n      aria-selected={selected}\n      aria-disabled={disabled || undefined}\n      onClick={() => !disabled && setSelected(!selected)}\n    >\n      <div className=\"udc-tile__content\">\n        <div className=\"udc-tile__label\">\n          {label}\n          {required && <span className=\"udc-tile__required\" />}\n        </div>\n        {body.map((line, i) => (\n          <div key={i} className=\"udc-tile__body\">{line}</div>\n        ))}\n      </div>\n      {showChevron && (\n        <span className=\"udc-tile__chevron\">\n          <span className=\"material-symbols-outlined\">chevron_right</span>\n        </span>\n      )}\n    </div>\n  );\n}";

        var vueCode = "<script setup>\nimport { ref } from 'vue';\n\nconst props = defineProps({\n  label: String,\n  body: Array,\n  required: Boolean,\n  showChevron: { type: Boolean, default: true },\n  disabled: Boolean\n});\nconst selected = ref(false);\nfunction toggle() { if (!props.disabled) selected.value = !selected.value; }\n</script>\n\n<template>\n  <div class=\"udc-tile\" :tabindex=\"disabled ? -1 : 0\"\n    :aria-selected=\"selected\" :aria-disabled=\"disabled || undefined\"\n    @click=\"toggle\">\n    <div class=\"udc-tile__content\">\n      <div class=\"udc-tile__label\">\n        {{ label }}\n        <span v-if=\"required\" class=\"udc-tile__required\" />\n      </div>\n      <div v-for=\"(line, i) in body\" :key=\"i\" class=\"udc-tile__body\">{{ line }}</div>\n    </div>\n    <span v-if=\"showChevron\" class=\"udc-tile__chevron\">\n      <span class=\"material-symbols-outlined\">chevron_right</span>\n    </span>\n  </div>\n</template>";

        return { html: html, code: code };
      }
    };
