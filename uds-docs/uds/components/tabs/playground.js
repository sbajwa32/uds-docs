// Playground config for the tabs component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'count', label: 'Tab count', type: 'select', default: '3', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }
        ]},
        { key: 'size', label: 'Size', type: 'select', default: 'default', options: [
          { value: 'default', label: 'Default' }, { value: 'sm', label: 'Small' }
        ]},
        { key: 'disabledIdx', label: 'Disabled tab', type: 'select', default: 'none', options: [
          { value: 'none', label: 'None' }, { value: '1', label: 'Tab 2' }, { value: '2', label: 'Tab 3' }, { value: '3', label: 'Tab 4' }
        ]}
      ],
      render(s) {
        const n = parseInt(s.count, 10);
        const labels = ['Overview', 'Details', 'History', 'Settings', 'Admin'];
        const sizeAttr = s.size === 'sm' ? ' data-size="sm"' : '';
        const disIdx = s.disabledIdx === 'none' ? -1 : parseInt(s.disabledIdx, 10);
        let h = '<div class="udc-tabs" role="tablist"' + sizeAttr + '>\n';
        for (let i = 0; i < n; i++) {
          const sel = i === 0 ? ' aria-selected="true"' : '';
          const dis = i === disIdx ? ' disabled' : '';
          h += '  <button class="udc-tab" role="tab"' + sel + dis + '>' + labels[i] + '</button>\n';
        }
        h += '</div>';

        var rLines = [];
        rLines.push("import { useState } from 'react';");
        rLines.push('');
        rLines.push('function Tabs() {');
        rLines.push('  const [active, setActive] = useState(0);');
        rLines.push("  const tabs = [" + labels.slice(0,n).map(function(l){return "'"+l+"'";}).join(', ') + "];");
        if (disIdx >= 0) rLines.push('  const disabledIdx = ' + disIdx + ';');
        rLines.push('');
        rLines.push('  return (');
        rLines.push('    <div className="udc-tabs" role="tablist"' + sizeAttr + '>');
        rLines.push('      {tabs.map((label, i) => (');
        rLines.push('        <button');
        rLines.push('          key={i}');
        rLines.push('          className="udc-tab"');
        rLines.push('          role="tab"');
        rLines.push('          aria-selected={i === active}');
        rLines.push('          onClick={() => setActive(i)}');
        if (disIdx >= 0) rLines.push('          disabled={i === disabledIdx}');
        rLines.push('        >');
        rLines.push('          {label}');
        rLines.push('        </button>');
        rLines.push('      ))}');
        rLines.push('    </div>');
        rLines.push('  );');
        rLines.push('}');

        var vLines = [];
        vLines.push('<script setup>');
        vLines.push("import { ref } from 'vue';");
        vLines.push('');
        vLines.push('const active = ref(0);');
        vLines.push("const tabs = [" + labels.slice(0,n).map(function(l){return "'"+l+"'";}).join(', ') + "];");
        if (disIdx >= 0) vLines.push('const disabledIdx = ' + disIdx + ';');
        vLines.push('</script>');
        vLines.push('');
        vLines.push('<template>');
        vLines.push('  <div class="udc-tabs" role="tablist"' + sizeAttr + '>');
        vLines.push('    <button');
        vLines.push('      v-for="(label, i) in tabs"');
        vLines.push('      :key="i"');
        vLines.push('      class="udc-tab"');
        vLines.push('      role="tab"');
        vLines.push('      :aria-selected="i === active"');
        vLines.push('      @click="active = i"');
        if (disIdx >= 0) vLines.push('      :disabled="i === disabledIdx"');
        vLines.push('    >');
        vLines.push('      {{ label }}');
        vLines.push('    </button>');
        vLines.push('  </div>');
        vLines.push('</template>');

        return { html: h, code: h };
      }
    };
