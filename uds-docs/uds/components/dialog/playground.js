// Playground config for the dialog component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'title', label: 'Title', type: 'text', default: 'Dialog title' },
        { key: 'slots', label: 'Content slots', type: 'select', default: '1', options: [
          { value: '1', label: '1 slot' }, { value: '2', label: '2 slots' },
          { value: '3', label: '3 slots' }, { value: '4', label: '4 slots' }
        ]},
        { key: 'primaryLabel', label: 'Primary button', type: 'text', default: 'Confirm' },
        { key: 'secondaryLabel', label: 'Secondary button', type: 'text', default: 'Cancel' }
      ],
      render(s) {
        var count = parseInt(s.slots, 10);
        var slotLines = '';
        for (var i = 0; i < count; i++) {
          slotLines += '\n    <div style="background:var(--uds-color-surface-alt);padding:var(--uds-space-300);text-align:center;font-size:12px;border-radius:4px;">Slot ' + (count === 1 ? '– Replace This' : (i + 1)) + '</div>';
        }

        var code = '<div class="udc-dialog-backdrop" data-open="true">\n  <div class="udc-dialog" role="dialog" aria-modal="true">\n    <div class="udc-dialog__header">\n      <h2 class="udc-dialog__title">' + s.title + '</h2>\n      <button class="udc-dialog__close" aria-label="Close">\n        <span class="material-symbols-outlined">close</span>\n      </button>\n    </div>\n    <div class="udc-dialog__body">' + slotLines + '\n    </div>\n    <div class="udc-dialog__footer">\n      <button class="udc-button-secondary">' + s.secondaryLabel + '</button>\n      <button class="udc-button-primary">' + s.primaryLabel + '</button>\n    </div>\n  </div>\n</div>';

        var previewHtml = '<div style="display:flex;justify-content:center;"><div class="udc-dialog" role="dialog" aria-modal="false" style="position:relative;box-shadow:0 10px 20px 2px rgba(0,0,0,0.2);">\n  <div class="udc-dialog__header">\n    <h2 class="udc-dialog__title">' + s.title + '</h2>\n    <button class="udc-dialog__close" aria-label="Close"><span class="material-symbols-outlined">close</span></button>\n  </div>\n  <div class="udc-dialog__body">' + slotLines + '\n  </div>\n  <div class="udc-dialog__footer">\n    <button class="udc-button-secondary">' + s.secondaryLabel + '</button>\n    <button class="udc-button-primary">' + s.primaryLabel + '</button>\n  </div>\n</div></div>';

        var reactCode = "import { useState } from 'react';\n\nfunction MyDialog({ open, onClose }) {\n  if (!open) return null;\n\n  return (\n    <div className=\"udc-dialog-backdrop\" data-open=\"true\" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>\n      <div className=\"udc-dialog\" role=\"dialog\" aria-modal=\"true\">\n        <div className=\"udc-dialog__header\">\n          <h2 className=\"udc-dialog__title\">" + s.title + "</h2>\n          <button className=\"udc-dialog__close\" aria-label=\"Close\" onClick={onClose}>\n            <span className=\"material-symbols-outlined\">close</span>\n          </button>\n        </div>\n        <div className=\"udc-dialog__body\">\n          {/* Your content here */}\n        </div>\n        <div className=\"udc-dialog__footer\">\n          <button className=\"udc-button-secondary\" onClick={onClose}>" + s.secondaryLabel + "</button>\n          <button className=\"udc-button-primary\">" + s.primaryLabel + "</button>\n        </div>\n      </div>\n    </div>\n  );\n}";

        var vueCode = "<script setup>\ndefineProps({ open: Boolean });\nconst emit = defineEmits(['close']);\n</script>\n\n<template>\n  <div v-if=\"open\" class=\"udc-dialog-backdrop\" data-open=\"true\" @click.self=\"emit('close')\">\n    <div class=\"udc-dialog\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"udc-dialog__header\">\n        <h2 class=\"udc-dialog__title\">" + s.title + "</h2>\n        <button class=\"udc-dialog__close\" aria-label=\"Close\" @click=\"emit('close')\">\n          <span class=\"material-symbols-outlined\">close</span>\n        </button>\n      </div>\n      <div class=\"udc-dialog__body\">\n        <slot />\n      </div>\n      <div class=\"udc-dialog__footer\">\n        <button class=\"udc-button-secondary\" @click=\"emit('close')\">" + s.secondaryLabel + "</button>\n        <button class=\"udc-button-primary\">" + s.primaryLabel + "</button>\n      </div>\n    </div>\n  </div>\n</template>";

        return { html: previewHtml, code: code };
      }
    };
