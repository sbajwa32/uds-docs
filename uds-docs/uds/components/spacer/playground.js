// Playground config for the spacer component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'size', label: 'Size', type: 'select', default: '200', options: [
          { value: '050', label: '050 (4px)' }, { value: '075', label: '075 (6px)' }, { value: '100', label: '100 (8px)' },
          { value: '150', label: '150 (12px)' }, { value: '200', label: '200 (16px)' }, { value: '300', label: '300 (24px)' },
          { value: '400', label: '400 (32px)' }, { value: '600', label: '600 (48px)' }
        ]}
      ],
      render(s) {
        const code = '<div class="udc-spacer" data-size="' + s.size + '"></div>';
        const html = '<div style="display:flex;align-items:center;gap:0;"><span class="udc-badge">Before</span><div class="udc-spacer" data-size="' + s.size + '" style="background:var(--uds-color-surface-info-subtle);outline:1px dashed var(--uds-color-border-interactive);"></div><span class="udc-badge" data-variant="success">After</span></div>';
        var reactCode = 'function Spacer() {\n  return <div className="udc-spacer" data-size="' + s.size + '" />;\n}';
        var vueCode = '<template>\n  <div class="udc-spacer" data-size="' + s.size + '"></div>\n</template>\n\n<script setup>\n// CSS-only\n</script>';
        return { html, code };
      }
    };
