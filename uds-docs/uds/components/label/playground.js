// Playground config for the label component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'text', label: 'Text', type: 'text', default: 'Full name' },
        { key: 'variant', label: 'Variant', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'disabled', label: 'Disabled' }, { value: 'error', label: 'Error' }, { value: 'interactive', label: 'Interactive' }, { value: 'success', label: 'Success' }
        ]},
        { key: 'required', label: 'Required', type: 'checkbox', default: true },
        { key: 'small', label: 'Small', type: 'checkbox', default: false },
        { key: 'prominent', label: 'Prominent', type: 'checkbox', default: false }
      ],
      render(s) {
        var attrs = ['class="udc-label"'];
        if (s.variant !== 'default') attrs.push('data-variant="' + s.variant + '"');
        if (s.small) attrs.push('data-size="sm"');
        if (s.prominent) attrs.push('data-prominent="true"');
        var dot = s.required ? ' <span class="udc-label__required" aria-hidden="true"></span>' : '';
        var code = '<label ' + attrs.join(' ') + '>' + esc(s.text) + dot + '</label>';
        return { html: code, code: code };
      }
    };
