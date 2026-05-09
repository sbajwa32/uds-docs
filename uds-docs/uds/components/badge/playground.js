// Playground config for the badge component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default (Info)' }, { value: 'secondary', label: 'Secondary' },
          { value: 'success', label: 'Success' }, { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]},
        { key: 'prominent', label: 'Prominent', type: 'checkbox', default: true },
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'label', label: 'Label', type: 'text', default: 'Badge' }
      ],
      render(s) {
        const attrs = [];
        if (s.variant !== 'default') attrs.push('data-variant="' + s.variant + '"');
        if (!s.prominent) attrs.push('data-prominent="false"');
        if (s.size === 'sm') attrs.push('data-size="sm"');
        const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
        const code = '<span class="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>';

        var rCode = 'function StatusBadge() {\n  return <span className="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>;\n}';
        var vCode = '<template>\n  <span class="udc-badge"' + attrStr + '>' + esc(s.label) + '</span>\n</template>\n\n<script setup>\n// CSS-only — no script needed\n</script>';
        return { html: code, code };
      }
    };
