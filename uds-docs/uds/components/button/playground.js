// Playground config for the button component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
import { esc } from '../../../docs/helpers/esc.js';
export default {
      controls: [
        { key: 'variant', label: 'Variant', type: 'select', default: 'primary', options: [
          { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'ghost', label: 'Ghost' }
        ]},
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'destructive', label: 'Destructive', type: 'checkbox', default: false },
        { key: 'showLeadingIcon', label: 'Show Leading Icon', type: 'checkbox', default: false },
        { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: 'add' },
        { key: 'showTrailingIcon', label: 'Show Trailing Icon', type: 'checkbox', default: false },
        { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: 'arrow_forward' },
        { key: 'iconOnly', label: 'Icon Only', type: 'checkbox', default: false },
        { key: 'iconOnlyName', label: 'Icon', type: 'icon-search', default: 'add' },
        { key: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
        { key: 'selected', label: 'Selected', type: 'checkbox', default: false },
        { key: 'label', label: 'Label', type: 'text', default: 'Button label' }
      ],
      render(s) {
        const cls = 'udc-button-' + s.variant;
        const btnAttrs = [];
        if (s.size === 'sm') btnAttrs.push('data-size="sm"');
        if (s.disabled) btnAttrs.push('disabled');
        if (s.selected) btnAttrs.push('aria-selected="true"');

        if (s.iconOnly) {
          btnAttrs.push('data-icon-only');
          btnAttrs.push('aria-label="' + esc(s.label) + '"');
          const iconName = esc(s.iconOnlyName || 'add');
          const inner = '<span class="material-symbols-outlined">' + iconName + '</span>';
          const attrStr = btnAttrs.length ? ' ' + btnAttrs.join(' ') : '';
          const wrapOpen = s.destructive ? '<div data-btn-color="danger">\n  ' : '';
          const wrapClose = s.destructive ? '\n</div>' : '';
          const tag = '<button class="' + cls + '"' + attrStr + '>' + inner + '</button>';
          const html = s.destructive ? '<div data-btn-color="danger">' + tag + '</div>' : tag;
          const code = wrapOpen + tag + wrapClose;

          var rAttrs = [];
          rAttrs.push('className="' + cls + '"');
          if (s.size === 'sm') rAttrs.push('data-size="sm"');
          if (s.disabled) rAttrs.push('disabled');
          if (s.selected) rAttrs.push('aria-selected="true"');
          rAttrs.push('data-icon-only');
          rAttrs.push('aria-label="' + esc(s.label) + '"');
          var rBtn = '<button ' + rAttrs.join(' ') + '>\n  <span className="material-symbols-outlined">' + iconName + '</span>\n</button>';
          if (s.destructive) rBtn = '<div data-btn-color="danger">\n  ' + rBtn + '\n</div>';
          var reactCode = 'function IconButton() {\n  return (\n' + rBtn.split('\n').map(function(l){return '    '+l;}).join('\n') + '\n  );\n}';

          var vueLines = ['<script setup>', '// CSS-only — button has no interactive state to manage', '</script>', '', '<template>'];
          if (s.destructive) vueLines.push('  <div data-btn-color="danger">');
          vueLines.push((s.destructive ? '    ' : '  ') + '<button class="' + cls + '"' + attrStr + ' aria-label="' + esc(s.label) + '">');
          vueLines.push((s.destructive ? '      ' : '    ') + '<span class="material-symbols-outlined">' + iconName + '</span>');
          vueLines.push((s.destructive ? '    ' : '  ') + '</button>');
          if (s.destructive) vueLines.push('  </div>');
          vueLines.push('</template>');
          return { html, code };
        }

        if (s.showLeadingIcon) btnAttrs.push('data-leading-icon');
        if (s.showTrailingIcon) btnAttrs.push('data-trailing-icon');
        const attrStr = btnAttrs.length ? ' ' + btnAttrs.join(' ') : '';

        let inner = '';
        if (s.showLeadingIcon) inner += '<span class="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span> ';
        inner += esc(s.label);
        if (s.showTrailingIcon) inner += ' <span class="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';

        const tag = '<button class="' + cls + '"' + attrStr + '>' + inner + '</button>';
        const wrapOpen = s.destructive ? '<div data-btn-color="danger">\n  ' : '';
        const wrapClose = s.destructive ? '\n</div>' : '';
        const html = s.destructive ? '<div data-btn-color="danger">' + tag + '</div>' : tag;
        const code = wrapOpen + tag + wrapClose;

        var rAttrs2 = [];
        rAttrs2.push('className="' + cls + '"');
        if (s.size === 'sm') rAttrs2.push('data-size="sm"');
        if (s.disabled) rAttrs2.push('disabled');
        if (s.selected) rAttrs2.push('aria-selected="true"');
        if (s.showLeadingIcon) rAttrs2.push('data-leading-icon');
        if (s.showTrailingIcon) rAttrs2.push('data-trailing-icon');
        var rInner = '';
        if (s.showLeadingIcon) rInner += '\n  <span className="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span>';
        rInner += '\n  ' + esc(s.label);
        if (s.showTrailingIcon) rInner += '\n  <span className="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';
        var rBtn2 = '<button ' + rAttrs2.join(' ') + '>' + rInner + '\n</button>';
        if (s.destructive) rBtn2 = '<div data-btn-color="danger">\n  ' + rBtn2 + '\n</div>';
        var reactCode2 = 'function MyButton() {\n  return (\n' + rBtn2.split('\n').map(function(l){return '    '+l;}).join('\n') + '\n  );\n}';

        var vL = ['<script setup>', '// CSS-only — button has no interactive state to manage', '</script>', '', '<template>'];
        if (s.destructive) vL.push('  <div data-btn-color="danger">');
        var vBtnInner = '';
        if (s.showLeadingIcon) vBtnInner += '<span class="material-symbols-outlined">' + esc(s.leadingIcon || 'add') + '</span> ';
        vBtnInner += esc(s.label);
        if (s.showTrailingIcon) vBtnInner += ' <span class="material-symbols-outlined">' + esc(s.trailingIcon || 'arrow_forward') + '</span>';
        var vBtnAttrs = 'class="' + cls + '"';
        if (s.size === 'sm') vBtnAttrs += ' data-size="sm"';
        if (s.disabled) vBtnAttrs += ' disabled';
        if (s.showLeadingIcon) vBtnAttrs += ' data-leading-icon';
        if (s.showTrailingIcon) vBtnAttrs += ' data-trailing-icon';
        vL.push((s.destructive ? '    ' : '  ') + '<button ' + vBtnAttrs + '>' + vBtnInner + '</button>');
        if (s.destructive) vL.push('  </div>');
        vL.push('</template>');
        return { html, code };
      }
    };
