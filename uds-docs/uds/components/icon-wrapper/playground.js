// Playground config for the icon-wrapper component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'icon', label: 'Icon', type: 'icon-search', default: 'info' },
        { key: 'size', label: 'Size', type: 'select', default: '24', options: [
          { value: '16', label: '16' }, { value: '20', label: '20' }, { value: '24', label: '24 (default)' },
          { value: '32', label: '32' }, { value: '48', label: '48' }, { value: '64', label: '64' }
        ]},
        { key: 'color', label: 'Color', type: 'select', default: 'interactive', options: [
          { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' },
          { value: 'interactive', label: 'Interactive' }, { value: 'success', label: 'Success' },
          { value: 'error', label: 'Error' }, { value: 'warning', label: 'Warning' }
        ]}
      ],
      render(s) {
        const sizeAttr = s.size !== '24' ? ' data-size="' + s.size + '"' : '';
        const colorToken = 'var(--uds-color-icon-' + s.color + ')';
        const icon = '<span class="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>';
        const code = '<span class="udc-icon-wrapper"' + sizeAttr + ' style="color:' + colorToken + ';">\n  ' + icon + '\n</span>';
        var reactCode = 'function Icon() {\n  return (\n    <span\n      className="udc-icon-wrapper"\n' + (sizeAttr ? '      ' + sizeAttr + '\n' : '') + '      style={{ color: \'' + colorToken + '\' }}\n    >\n      <span className="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>\n    </span>\n  );\n}';
        var vueCode = '<template>\n  <span class="udc-icon-wrapper"' + sizeAttr + ' :style="{ color: \'' + colorToken + '\' }">\n    <span class="material-symbols-outlined">' + esc(s.icon || 'info') + '</span>\n  </span>\n</template>\n\n<script setup>\n// CSS-only\n</script>';
        return { html: code, code };
      }
    };
