// Playground config for the divider component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'padding', label: 'Padding', type: 'select', default: 'default', options: [
          { value: 'default', label: 'sm (default)' }, { value: 'md', label: 'md' }, { value: 'lg', label: 'lg' }, { value: 'xl', label: 'xl' }
        ]}
      ],
      render(s) {
        const padAttr = s.padding !== 'default' ? ' data-padding="' + s.padding + '"' : '';
        const code = '<hr class="udc-divider-horizontal"' + padAttr + ' />';
        const html = '<div style="width:100%;"><p style="font-size:13px;color:var(--uds-color-text-secondary);">Content above</p>' + code + '<p style="font-size:13px;color:var(--uds-color-text-secondary);">Content below</p></div>';
        var reactCode = 'function Divider() {\n  return <hr className="udc-divider-horizontal"' + padAttr + ' />;\n}';
        var vueCode = '<template>\n  <hr class="udc-divider-horizontal"' + padAttr + ' />\n</template>\n\n<script setup>\n// CSS-only\n</script>';
        return { html, code };
      }
    };
