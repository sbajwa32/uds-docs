// Playground config for the search component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Search...' },
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'error', label: 'Error' }
        ]}
      ],
      render(s) {
        var stateAttr = s.state === 'error' ? ' data-state="error"' : '';
        var code = '<div class="udc-search"' + stateAttr + '>\n  <div class="udc-search__field">\n    <span class="udc-search__icon">\n      <span class="material-symbols-outlined">search</span>\n    </span>\n    <input type="search" placeholder="' + s.placeholder + '" />\n    <button class="udc-search__clear" aria-label="Clear">\n      <span class="material-symbols-outlined">clear</span>\n    </button>\n  </div>\n</div>';
        var html = '<div style="max-width:400px;">' + code + '</div>';

        var reactCode = "import { useState, useCallback } from 'react';\n\nfunction SearchBar({ placeholder = '" + s.placeholder + "', onSearch }) {\n  const [value, setValue] = useState('');\n\n  const clear = useCallback(() => {\n    setValue('');\n    onSearch?.('');\n  }, [onSearch]);\n\n  return (\n    <div className=\"udc-search\"" + stateAttr + " data-has-value={value.length > 0 ? 'true' : 'false'}>\n      <div className=\"udc-search__field\">\n        <span className=\"udc-search__icon\">\n          <span className=\"material-symbols-outlined\">search</span>\n        </span>\n        <input\n          type=\"search\"\n          placeholder={placeholder}\n          value={value}\n          onChange={(e) => { setValue(e.target.value); onSearch?.(e.target.value); }}\n        />\n        <button className=\"udc-search__clear\" aria-label=\"Clear\" onClick={clear}>\n          <span className=\"material-symbols-outlined\">clear</span>\n        </button>\n      </div>\n    </div>\n  );\n}";

        var vueCode = "<script setup>\nimport { ref, computed } from 'vue';\n\nconst props = defineProps({ placeholder: { type: String, default: '" + s.placeholder + "' } });\nconst emit = defineEmits(['search']);\nconst value = ref('');\nconst hasValue = computed(() => value.value.length > 0);\n\nfunction clear() { value.value = ''; emit('search', ''); }\nfunction onInput(e) { value.value = e.target.value; emit('search', e.target.value); }\n</script>\n\n<template>\n  <div class=\"udc-search\"" + stateAttr + " :data-has-value=\"hasValue ? 'true' : 'false'\">\n    <div class=\"udc-search__field\">\n      <span class=\"udc-search__icon\">\n        <span class=\"material-symbols-outlined\">search</span>\n      </span>\n      <input type=\"search\" :placeholder=\"placeholder\" :value=\"value\" @input=\"onInput\" />\n      <button class=\"udc-search__clear\" aria-label=\"Clear\" @click=\"clear\">\n        <span class=\"material-symbols-outlined\">clear</span>\n      </button>\n    </div>\n  </div>\n</template>";

        return { html: html, code: code };
      }
    };
