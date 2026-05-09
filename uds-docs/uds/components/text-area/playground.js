// Playground config for the text-area component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'label', label: 'Label', type: 'text', default: 'Notes' },
        { key: 'placeholder', label: 'Placeholder', type: 'text', default: 'Add notes...' },
        { key: 'state', label: 'State', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'focused', label: 'Focused' }, { value: 'error-focused', label: 'Error focused' }
        ]}
      ],
      render(s) {
        var state = s.state !== 'default' ? ' data-state="' + s.state + '"' : '';
        var invalid = s.state === 'error-focused' ? ' aria-invalid="true"' : '';
        var code = '<div class="udc-text-area"' + state + '>\n  <label class="udc-label" for="pg-textarea">' + esc(s.label) + '</label>\n  <div class="udc-text-area__field"><textarea id="pg-textarea" placeholder="' + esc(s.placeholder) + '"' + invalid + '></textarea></div>\n  <div class="udc-text-area__helper"><span>' + (s.state === 'error-focused' ? 'Enter at least 10 characters' : 'Optional internal note') + '</span><span>0/250</span></div>\n</div>';
        return { html: code, code: code };
      }
    };
