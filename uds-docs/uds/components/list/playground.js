// Playground config for the list component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'itemCount', label: 'Items', type: 'select', default: '5', options: [
          { value: '3', label: '3' }, { value: '5', label: '5' }, { value: '7', label: '7' }, { value: '10', label: '10' }
        ]},
        { key: 'leadingIcon', label: 'Leading icon', type: 'icon-search', default: '' },
        { key: 'trailingIcon', label: 'Trailing icon', type: 'icon-search', default: '' },
        { key: 'selectedIdx', label: 'Selected item', type: 'select', default: '0', options: [
          { value: '0', label: '1st' }, { value: '1', label: '2nd' }, { value: '2', label: '3rd' }, { value: 'none', label: 'None' }
        ]}
      ],
      render(s) {
        var count = parseInt(s.itemCount, 10);
        var labels = ['Dashboard','Leasing / CRM','People / Contacts','Property / Assets','Accounting / Finance','Compliance / Reporting','Admin / Settings','Reports','Integrations','Support'];
        var selIdx = s.selectedIdx === 'none' ? -1 : parseInt(s.selectedIdx, 10);
        var leadingHtml = s.leadingIcon ? '<span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">' + s.leadingIcon + '</span></span>' : '';
        var trailingHtml = s.trailingIcon ? '<span class="udc-list-item__trailing-icon"><span class="material-symbols-outlined">' + s.trailingIcon + '</span></span>' : '';

        var lines = ['<div class="udc-list">'];
        for (var i = 0; i < count; i++) {
          var sel = i === selIdx ? ' aria-selected="true"' : '';
          lines.push('  <div class="udc-list-item" tabindex="0"' + sel + '>');
          if (leadingHtml) lines.push('    ' + leadingHtml);
          lines.push('    <span class="udc-list-item__label">' + labels[i % labels.length] + '</span>');
          if (trailingHtml) lines.push('    ' + trailingHtml);
          lines.push('  </div>');
        }
        lines.push('</div>');
        var code = lines.join('\n');
        var html = '<div style="max-width:320px;">' + code + '</div>';

        var rL = ["import { useState } from 'react';", '', 'const items = ['];
        for (var j = 0; j < count; j++) rL.push("  '" + labels[j % labels.length] + "',");
        rL.push('];', '', 'function MyList() {', '  const [selected, setSelected] = useState(' + (selIdx >= 0 ? selIdx : 'null') + ');', '', '  return (', '    <div className="udc-list">');
        rL.push('      {items.map((label, i) => (', '        <div', '          key={i}', '          className="udc-list-item"', '          tabIndex={0}', '          aria-selected={selected === i}', '          onClick={() => setSelected(i)}', '        >');
        if (s.leadingIcon) rL.push('          <span className="udc-list-item__leading-icon"><span className="material-symbols-outlined">' + s.leadingIcon + '</span></span>');
        rL.push('          <span className="udc-list-item__label">{label}</span>');
        if (s.trailingIcon) rL.push('          <span className="udc-list-item__trailing-icon"><span className="material-symbols-outlined">' + s.trailingIcon + '</span></span>');
        rL.push('        </div>', '      ))}', '    </div>', '  );', '}');

        var vL = ['<script setup>', "import { ref } from 'vue';", '', 'const selected = ref(' + (selIdx >= 0 ? selIdx : 'null') + ');', 'const items = ['];
        for (var k = 0; k < count; k++) vL.push("  '" + labels[k % labels.length] + "',");
        vL.push('];', '</script>', '', '<template>', '  <div class="udc-list">', '    <div', '      v-for="(label, i) in items" :key="i"', '      class="udc-list-item"', '      tabindex="0"', '      :aria-selected="selected === i"', '      @click="selected = i"', '    >');
        if (s.leadingIcon) vL.push('      <span class="udc-list-item__leading-icon"><span class="material-symbols-outlined">' + s.leadingIcon + '</span></span>');
        vL.push('      <span class="udc-list-item__label">{{ label }}</span>');
        if (s.trailingIcon) vL.push('      <span class="udc-list-item__trailing-icon"><span class="material-symbols-outlined">' + s.trailingIcon + '</span></span>');
        vL.push('    </div>', '  </div>', '</template>');

        return { html: html, code: code };
      }
    };
