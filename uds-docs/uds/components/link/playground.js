// Playground config for the link component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'label', label: 'Label', type: 'text', default: 'View property' },
        { key: 'current', label: 'Current page', type: 'checkbox', default: false },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'newWindow', label: 'Open in new window', type: 'checkbox', default: false }
      ],
      render(s) {
        var attrs = ['class="udc-link"'];
        if (!s.disabled) attrs.push('href="#"');
        if (s.current) attrs.push('aria-current="page"');
        if (s.disabled) attrs.push('aria-disabled="true"');
        if (s.newWindow) attrs.push('target="_blank" rel="noopener noreferrer" data-new-window');
        var icon = s.newWindow ? ' <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>' : '';
        var code = '<a ' + attrs.join(' ') + '>' + esc(s.label) + icon + '</a>';
        return { html: code, code: code };
      }
    };
