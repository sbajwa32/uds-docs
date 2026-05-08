// Playground config for the chip component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'filter', options: [
          { value: 'default', label: 'Default' }, { value: 'filter', label: 'Filter' },
          { value: 'input', label: 'Input' }, { value: 'dropdown', label: 'Dropdown' }
        ]},
        { key: 'label', label: 'Label', type: 'text', default: 'Chip label' },
        { key: 'selected', label: 'Selected', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'checkbox', default: true },
        { key: 'trailingIcon', label: 'Trailing icon', type: 'checkbox', default: true }
      ],
      render(s) {
        var selAttr = s.selected ? ' aria-selected="true"' : '';
        var varAttr = s.variant !== 'default' ? ' data-variant="' + s.variant + '"' : '';
        var trailingName = s.variant === 'dropdown' ? 'keyboard_arrow_down' : 'close';
        var lead = s.leadingIcon ? '<span class="udc-chip__leading-icon"><span class="material-symbols-outlined">check</span></span>' : '';
        var trail = s.trailingIcon ? '<span class="udc-chip__trailing-icon"><span class="material-symbols-outlined">' + trailingName + '</span></span>' : '';

        var code = '<button class="udc-chip"' + varAttr + selAttr + '>\n  ' + lead + '\n  <span class="udc-chip__label">' + s.label + '</span>\n  ' + trail + '\n</button>';
        code = code.replace(/\n  \n/g, '\n');
        var html = code;

        var reactCode = "function Chip({ label, variant, selected, onToggle, onDismiss }) {\n  return (\n    <button\n      className=\"udc-chip\"\n      data-variant={variant}\n      aria-selected={selected}\n      onClick={variant === 'input' && selected ? onDismiss : onToggle}\n    >\n" + (s.leadingIcon ? "      <span className=\"udc-chip__leading-icon\"><span className=\"material-symbols-outlined\">check</span></span>\n" : "") + "      <span className=\"udc-chip__label\">{label}</span>\n" + (s.trailingIcon ? "      <span className=\"udc-chip__trailing-icon\"><span className=\"material-symbols-outlined\">" + trailingName + "</span></span>\n" : "") + "    </button>\n  );\n}";

        var vueCode = "<script setup>\ndefineProps({ label: String, variant: String, selected: Boolean });\nconst emit = defineEmits(['toggle', 'dismiss']);\n</script>\n\n<template>\n  <button class=\"udc-chip\"" + varAttr + "\n    :aria-selected=\"selected\"\n    @click=\"variant === 'input' && selected ? emit('dismiss') : emit('toggle')\">\n" + (s.leadingIcon ? "    <span class=\"udc-chip__leading-icon\"><span class=\"material-symbols-outlined\">check</span></span>\n" : "") + "    <span class=\"udc-chip__label\">{{ label }}</span>\n" + (s.trailingIcon ? "    <span class=\"udc-chip__trailing-icon\"><span class=\"material-symbols-outlined\">" + trailingName + "</span></span>\n" : "") + "  </button>\n</template>";

        return { html: html, code: code };
      }
    };
