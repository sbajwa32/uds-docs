// Playground config for the nav-vertical component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'leadingIcons', label: 'Leading Icons', type: 'checkbox', default: true },
        { key: 'itemCount', label: 'Item count', type: 'select', default: '5', options: [
          { value: '3', label: '3' }, { value: '5', label: '5' }, { value: '7', label: '7' }
        ]},
        { key: 'selectedIdx', label: 'Selected item', type: 'select', default: '0', options: [
          { value: '0', label: '1st' }, { value: '1', label: '2nd' }, { value: '2', label: '3rd' }, { value: 'none', label: 'None' }
        ]},
        { key: 'style', label: 'Style', type: 'select', default: 'list', options: [
          { value: 'list', label: 'List (default)' }, { value: 'rail', label: 'Rail (compact)' }
        ]}
      ],
      render(s) {
        var items = [
          { icon: 'space_dashboard', label: 'Dashboard' },
          { icon: 'book', label: 'Leasing / CRM' },
          { icon: 'contact_phone', label: 'People / Contacts' },
          { icon: 'home_work', label: 'Property / Assets' },
          { icon: 'monetization_on', label: 'Accounting / Finance' },
          { icon: 'summarize', label: 'Compliance / Reporting' },
          { icon: 'admin_panel_settings', label: 'Admin / Settings' }
        ].slice(0, parseInt(s.itemCount, 10));
        var selIdx = s.selectedIdx === 'none' ? -1 : parseInt(s.selectedIdx, 10);
        var html = '', code = '', reactCode = '', vueCode = '';
        var liAttr = s.leadingIcons ? '' : ' data-leading-icons="false"';

        if (s.style === 'rail') {
          var vbl = [];
          items.slice(0, 3).forEach(function (item, i) {
            var sel = i === selIdx ? ' aria-selected="true"' : '';
            vbl.push('<button class="udc-nav-button-vertical"' + sel + '>');
            vbl.push('  <span class="material-symbols-outlined">' + item.icon + '</span>');
            vbl.push('  ' + item.label.split(' / ')[0]);
            vbl.push('</button>');
          });
          code = vbl.join('\n');
          html = '<div style="display:flex;gap:8px;">' + code + '</div>';
          var rRail = ["import { useState } from 'react';", '', 'function NavRail() {', '  const [selected, setSelected] = useState(' + (selIdx >= 0 ? selIdx : 'null') + ');', '  const items = ['];
          items.slice(0, 3).forEach(function (item) { rRail.push("    { icon: '" + item.icon + "', label: '" + item.label.split(' / ')[0] + "' },"); });
          rRail.push('  ];', '', '  return (', '    <div style={{ display: "flex", gap: 8 }}>');
          rRail.push('      {items.map((item, i) => (', '        <button key={i} className="udc-nav-button-vertical" aria-selected={selected === i} onClick={() => setSelected(i)}>');
          rRail.push('          <span className="material-symbols-outlined">{item.icon}</span>');
          rRail.push('          {item.label}', '        </button>', '      ))}', '    </div>', '  );', '}');
          reactCode = rRail.join('\n');
          var vRailItems = items.slice(0, 3);
          var vRailItemsStr = vRailItems.map(function(it) { return "  { icon: '" + it.icon + "', label: '" + it.label.split(' / ')[0] + "' }"; }).join(',\n');
          vueCode = "<script setup>\nimport { ref } from 'vue';\n\nconst selected = ref(" + (selIdx >= 0 ? selIdx : 'null') + ");\nconst items = [\n" + vRailItemsStr + "\n];\n</script>\n\n<template>\n  <div style=\"display:flex;gap:8px;\">\n    <button v-for=\"(item, i) in items\" :key=\"i\" class=\"udc-nav-button-vertical\" :aria-selected=\"selected === i\" @click=\"selected = i\">\n      <span class=\"material-symbols-outlined\">{{ item.icon }}</span>\n      {{ item.label }}\n    </button>\n  </div>\n</template>";
        } else {
          var lines = ['<nav class="udc-nav-vertical"' + liAttr + ' aria-label="Main navigation">'];
          items.forEach(function (item, i) {
            var sel = i === selIdx ? ' aria-selected="true"' : '';
            lines.push('  <button class="udc-nav-button"' + sel + '>');
            if (s.leadingIcons) {
              lines.push('    <span class="material-symbols-outlined">' + item.icon + '</span>');
            }
            lines.push('    <span class="udc-nav-button__label">' + item.label + '</span>');
            lines.push('  </button>');
          });
          lines.push('</nav>');
          code = lines.join('\n');
          html = '<div style="max-width:240px;">' + code + '</div>';

          var rL = ["import { useState } from 'react';", '', 'const navItems = ['];
          items.forEach(function (item) { rL.push("  { icon: '" + item.icon + "', label: '" + item.label + "' },"); });
          rL.push('];', '', 'function NavVertical() {', '  const [selected, setSelected] = useState(' + (selIdx >= 0 ? selIdx : 'null') + ');', '', '  return (', '    <nav className="udc-nav-vertical"' + liAttr + ' aria-label="Main navigation">');
          rL.push('      {navItems.map((item, i) => (', '        <button', '          key={i}', '          className="udc-nav-button"', '          aria-selected={selected === i}', '          onClick={() => setSelected(i)}', '        >');
          if (s.leadingIcons) rL.push('          <span className="material-symbols-outlined">{item.icon}</span>');
          rL.push('          <span className="udc-nav-button__label">{item.label}</span>', '        </button>', '      ))}', '    </nav>', '  );', '}');
          reactCode = rL.join('\n');

          var vL = ['<script setup>', "import { ref } from 'vue';", '', 'const selected = ref(' + (selIdx >= 0 ? selIdx : 'null') + ');', 'const navItems = ['];
          items.forEach(function (item) { vL.push("  { icon: '" + item.icon + "', label: '" + item.label + "' },"); });
          vL.push('];', '</script>', '', '<template>', '  <nav class="udc-nav-vertical"' + liAttr + ' aria-label="Main navigation">', '    <button', '      v-for="(item, i) in navItems" :key="i"', '      class="udc-nav-button"', '      :aria-selected="selected === i"', '      @click="selected = i"', '    >');
          if (s.leadingIcons) vL.push('      <span class="material-symbols-outlined">{{ item.icon }}</span>');
          vL.push('      <span class="udc-nav-button__label">{{ item.label }}</span>', '    </button>', '  </nav>', '</template>');
          vueCode = vL.join('\n');
        }

        return { html: html, code: code };
      }
    };
