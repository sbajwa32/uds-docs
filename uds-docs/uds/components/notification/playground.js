// Playground config for the notification component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'info', options: [
          { value: 'info', label: 'Info' }, { value: 'success', label: 'Success' },
          { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]},
        { key: 'style', label: 'Style', type: 'select', default: 'subtle', options: [
          { value: 'subtle', label: 'Subtle (default)' }, { value: 'prominent', label: 'Prominent' },
          { value: 'inline', label: 'Inline' }
        ]},
        { key: 'message', label: 'Message', type: 'text', default: 'This is a notification message.' },
        { key: 'dismissible', label: 'Show close button', type: 'checkbox', default: false },
        { key: 'icon', label: 'Icon', type: 'icon-search', default: '' }
      ],
      render(s) {
        var variantIcons = { info: 'info', success: 'check_circle', error: 'error_outline', warning: 'warning_amber' };
        var icon = s.icon || variantIcons[s.variant] || 'info';
        var styleAttr = '';
        if (s.style === 'prominent') styleAttr = ' data-prominent="true"';
        else if (s.style === 'inline') styleAttr = ' data-inline="true"';

        var closeHtml = s.dismissible ? '\n  <button class="udc-notification__close" aria-label="Dismiss">\n    <span class="material-symbols-outlined">close</span>\n  </button>' : '';
        var closeCode = s.dismissible ? '\n  <button class="udc-notification__close" aria-label="Dismiss">\n    <span class="material-symbols-outlined">close</span>\n  </button>' : '';

        var code = '<div class="udc-notification" data-variant="' + s.variant + '"' + styleAttr + '>\n  <span class="udc-notification__icon">\n    <span class="material-symbols-outlined">' + icon + '</span>\n  </span>\n  <span class="udc-notification__text">' + s.message + '</span>' + closeCode + '\n</div>';
        var html = code;

        var reactCode = "import { useState } from 'react';\n\nfunction Notification() {\n  const [visible, setVisible] = useState(true);\n  if (!visible) return null;\n\n  return (\n    <div className=\"udc-notification\" data-variant=\"" + s.variant + "\"" + styleAttr + ">\n      <span className=\"udc-notification__icon\">\n        <span className=\"material-symbols-outlined\">" + icon + "</span>\n      </span>\n      <span className=\"udc-notification__text\">" + s.message + "</span>" + (s.dismissible ? "\n      <button className=\"udc-notification__close\" aria-label=\"Dismiss\" onClick={() => setVisible(false)}>\n        <span className=\"material-symbols-outlined\">close</span>\n      </button>" : "") + "\n    </div>\n  );\n}";

        var vueCode = "<script setup>\nimport { ref } from 'vue';\nconst visible = ref(true);\n</script>\n\n<template>\n  <div v-if=\"visible\" class=\"udc-notification\" data-variant=\"" + s.variant + "\"" + styleAttr + ">\n    <span class=\"udc-notification__icon\">\n      <span class=\"material-symbols-outlined\">" + icon + "</span>\n    </span>\n    <span class=\"udc-notification__text\">" + s.message + "</span>" + (s.dismissible ? "\n    <button class=\"udc-notification__close\" aria-label=\"Dismiss\" @click=\"visible = false\">\n      <span class=\"material-symbols-outlined\">close</span>\n    </button>" : "") + "\n  </div>\n</template>";

        return { html: html, code: code };
      }
    };
