// Playground config for the breadcrumb component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'items', label: 'Items', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]},
        { key: 'frameless', label: 'Frameless', type: 'checkbox', default: false }
      ],
      render(s) {
        const n = parseInt(s.items, 10);
        const names = ['Home', 'Products', 'Category', 'Sub-category', 'Current Page'];
        const fl = s.frameless ? ' data-frameless' : '';
        let h = '<nav class="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">\n  <ol>\n';
        for (let i = 0; i < n; i++) {
          if (i < n - 1) h += '    <li><a href="#">' + names[i] + '</a></li>\n';
          else h += '    <li aria-current="page">' + names[i] + '</li>\n';
        }
        h += '  </ol>\n</nav>';

        var rLines = [];
        rLines.push('function Breadcrumb() {');
        rLines.push('  const items = [');
        for (var bi = 0; bi < n; bi++) {
          if (bi < n - 1) rLines.push("    { label: '" + names[bi] + "', href: '#' },");
          else rLines.push("    { label: '" + names[bi] + "' },");
        }
        rLines.push('  ];');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <nav className="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">');
        rLines.push('      <ol>');
        rLines.push('        {items.map((item, i) => (');
        rLines.push('          <li key={i} aria-current={i === items.length - 1 ? "page" : undefined}>');
        rLines.push('            {item.href ? <a href={item.href}>{item.label}</a> : item.label}');
        rLines.push('          </li>');
        rLines.push('        ))}');
        rLines.push('      </ol>');
        rLines.push('    </nav>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push('const items = [');
        for (var bv = 0; bv < n; bv++) {
          if (bv < n - 1) vLines.push("  { label: '" + names[bv] + "', href: '#' },");
          else vLines.push("  { label: '" + names[bv] + "' },");
        }
        vLines.push('];');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <nav class="udc-breadcrumb"' + fl + ' aria-label="Breadcrumb">');
        vLines.push('    <ol>');
        vLines.push('      <li');
        vLines.push('        v-for="(item, i) in items"');
        vLines.push('        :key="i"');
        vLines.push('        :aria-current="i === items.length - 1 ? \'page\' : undefined"');
        vLines.push('      >');
        vLines.push('        <a v-if="item.href" :href="item.href">{{ item.label }}</a>');
        vLines.push('        <template v-else>{{ item.label }}</template>');
        vLines.push('      </li>');
        vLines.push('    </ol>');
        vLines.push('  </nav>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    };
