// Playground config for the tooltip component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'text', label: 'Tooltip text', type: 'text', default: 'Helpful tooltip information' },
        { key: 'position', label: 'Position', type: 'select', default: 'top', options: [
          { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' },
          { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }
        ]}
      ],
      render(s) {
        var posAttr = s.position !== 'top' ? ' data-position="' + s.position + '"' : '';
        var code = '<span class="udc-tooltip-wrapper">\n  <button class="udc-button-secondary">Hover me</button>\n  <span class="udc-tooltip" role="tooltip"' + posAttr + '>' + s.text + '</span>\n</span>';
        var padStyle = s.position === 'top' ? 'padding-top:60px;' : s.position === 'bottom' ? 'padding-bottom:60px;' : s.position === 'left' ? 'padding-left:160px;' : 'padding-right:160px;';
        var html = '<div style="display:flex;justify-content:center;' + padStyle + '">' + code + '</div>';

        var reactCode = "function TooltipDemo() {\n  return (\n    <span className=\"udc-tooltip-wrapper\">\n      <button className=\"udc-button-secondary\">Hover me</button>\n      <span className=\"udc-tooltip\" role=\"tooltip\"" + posAttr + ">\n        " + s.text + "\n      </span>\n    </span>\n  );\n}";

        var vueCode = "<script setup>\ndefineProps({ text: String, position: String });\n</script>\n\n<template>\n  <span class=\"udc-tooltip-wrapper\">\n    <slot />\n    <span class=\"udc-tooltip\" role=\"tooltip\"" + posAttr + ">\n      " + s.text + "\n    </span>\n  </span>\n</template>";

        return { html: html, code: code };
      }
    };
