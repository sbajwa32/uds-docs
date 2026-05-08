// Playground config for the toggle component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'label', label: 'Label', type: 'text', default: 'Email notifications' },
        { key: 'checked', label: 'Checked', type: 'checkbox', default: true },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false }
      ],
      render(s) {
        var dis = s.disabled ? ' aria-disabled="true"' : '';
        var code = '<button class="udc-toggle" role="switch" aria-checked="' + (s.checked ? 'true' : 'false') + '"' + dis + '>\n  <span class="udc-toggle__control"><span class="udc-toggle__thumb"></span></span>\n  <span class="udc-toggle__label">' + esc(s.label) + '</span>\n</button>';
        return { html: code, code: code };
      }
    };
