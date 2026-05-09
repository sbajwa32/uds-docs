// Playground config for the data-table component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'rows', label: 'Rows', type: 'select', default: '5', options: [
          { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '5', label: '5' },
          { value: '8', label: '8' }, { value: '10', label: '10' }
        ]},
        { key: 'columns', label: 'Data columns', type: 'select', default: 'standard', options: [
          { value: 'minimal', label: 'Minimal (Name + Amount)' },
          { value: 'standard', label: 'Standard (Name, Status, Property, Amount)' },
          { value: 'full', label: 'Full (+ Invoice #, Due Date)' }
        ]},
        { key: 'showCheck', label: 'Checkbox column', type: 'checkbox', default: true },
        { key: 'showAction', label: 'Action column (⋮)', type: 'checkbox', default: true },
        { key: 'sortCol', label: 'Sort column', type: 'select', default: 'name-asc', options: [
          { value: 'none', label: 'None' },
          { value: 'name-asc', label: 'Name ↑' }, { value: 'name-desc', label: 'Name ↓' },
          { value: 'amount-asc', label: 'Amount ↑' }, { value: 'amount-desc', label: 'Amount ↓' }
        ]},
        { key: 'showFilter', label: 'Filter icon on Status', type: 'checkbox', default: false },
        { key: 'striped', label: 'Striped rows', type: 'checkbox', default: false },
        { key: 'highlightError', label: 'Error highlight row', type: 'select', default: 'none', options: [
          { value: 'none', label: 'None' }, { value: '1', label: 'Row 1' },
          { value: '2', label: 'Row 2' }, { value: '3', label: 'Row 3' }
        ]},
        { key: 'prominentName', label: 'Prominent name text', type: 'checkbox', default: false },
        { key: 'amountAlign', label: 'Amount alignment', type: 'select', default: 'right', options: [
          { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }
        ]},
        { key: 'cellDividers', label: 'Column dividers', type: 'checkbox', default: false }
      ],
      render(s) {
        var count = parseInt(s.rows, 10);
        var data = [
          { name: 'Brian Smith',     status: 'Low Confidence',      sv: 'warning', prop: 'Riverbend Estates',    inv: 'INV-002', due: 'Feb 20, 2024', amt: '$75' },
          { name: 'Catherine Lee',   status: 'Delivered',           sv: 'success', prop: 'Sunnyvale Towers',     inv: 'INV-003', due: 'Mar 5, 2024',  amt: '$100' },
          { name: 'David Brown',     status: 'Delivery Failed',     sv: 'error',   prop: 'Cedar Hills Residence',inv: 'INV-004', due: 'Apr 12, 2024', amt: '$150' },
          { name: 'Eva White',       status: 'Suspected Duplicate', sv: 'warning', prop: 'Oakwood Gardens',      inv: 'INV-005', due: 'May 30, 2024', amt: '$200' },
          { name: 'Frank Garcia',    status: 'Delivered',           sv: 'success', prop: 'Birchwood Apartments', inv: 'INV-006', due: 'Jun 18, 2024', amt: '$250' },
          { name: 'Grace Kim',       status: 'Delivered',           sv: 'success', prop: 'Silver Lake Apartments',inv: 'INV-007', due: 'Jul 25, 2024', amt: '$300' },
          { name: 'Henry Martinez',  status: 'Low Confidence',      sv: 'warning', prop: 'Pine Crest Estates',   inv: 'INV-008', due: 'Aug 14, 2024', amt: '$400' },
          { name: 'Isabella Wang',   status: 'Delivered',           sv: 'success', prop: 'Elmwood Place',        inv: 'INV-009', due: 'Sep 22, 2024', amt: '$500' },
          { name: 'Jack Thompson',   status: 'Delivered',           sv: 'success', prop: 'Hillside Meadows',     inv: 'INV-010', due: 'Oct 11, 2024', amt: '$750' },
          { name: 'Katherine Patel', status: 'Delivered',           sv: 'success', prop: 'Willow Creek',         inv: 'INV-011', due: 'Nov 3, 2024',  amt: '$1000' }
        ];
        var rows = data.slice(0, count);

        var isStd = s.columns === 'standard' || s.columns === 'full';
        var isFull = s.columns === 'full';
        var amtCls = s.amountAlign === 'right' ? 'udc-dt-align-right' : s.amountAlign === 'center' ? 'udc-dt-align-center' : '';
        var divAttr = s.cellDividers ? ' data-right-divider="true"' : '';

        var nameSortAttr = '';
        var amtSortHtml = '';
        if (s.sortCol === 'name-asc') nameSortAttr = ' data-dir="asc"';
        else if (s.sortCol === 'name-desc') nameSortAttr = ' data-dir="desc"';
        var nameSort = s.sortCol.startsWith('name') ? '<span class="udc-dt-sort"' + nameSortAttr + '></span>' : '<span class="udc-dt-sort"></span>';
        if (s.sortCol === 'amount-asc') amtSortHtml = ' <span class="udc-dt-sort" data-dir="asc"></span>';
        else if (s.sortCol === 'amount-desc') amtSortHtml = ' <span class="udc-dt-sort" data-dir="desc"></span>';
        else amtSortHtml = '';

        var filterHtml = s.showFilter ? ' <span class="udc-dt-filter"></span>' : '';
        var stripedAttr = s.striped ? ' data-striped="true"' : '';
        var errIdx = s.highlightError === 'none' ? -1 : parseInt(s.highlightError, 10) - 1;

        var L = [];
        L.push('<div class="udc-data-table"' + stripedAttr + '>');
        L.push('  <table>');

        L.push('    <thead>');
        L.push('      <tr>');
        if (s.showCheck) L.push('        <th class="udc-dt-check"><input type="checkbox" /></th>');
        L.push('        <th' + divAttr + '>Uploaded By ' + nameSort + '</th>');
        if (isStd) L.push('        <th' + divAttr + '>Invoice Status' + filterHtml + '</th>');
        if (isStd) L.push('        <th' + divAttr + '>Property</th>');
        if (isFull) L.push('        <th' + divAttr + '>Invoice Number</th>');
        if (isFull) L.push('        <th' + divAttr + '>Due Date</th>');
        L.push('        <th' + (amtCls ? ' class="' + amtCls + '"' : '') + '>Amount' + amtSortHtml + '</th>');
        if (s.showAction) L.push('        <th class="udc-dt-action"></th>');
        L.push('      </tr>');
        L.push('    </thead>');

        L.push('    <tbody>');
        rows.forEach(function (r, i) {
          var trAttr = i === errIdx ? ' data-highlight="error"' : '';
          L.push('      <tr' + trAttr + '>');
          if (s.showCheck) L.push('        <td class="udc-dt-check"><input type="checkbox" /></td>');
          var nameWrap = s.prominentName ? '<span class="udc-dt-prominent">' + r.name + '</span>' : r.name;
          L.push('        <td' + divAttr + '>' + nameWrap + '</td>');
          if (isStd) L.push('        <td' + divAttr + '><span class="udc-badge" data-variant="' + r.sv + '">' + r.status + '</span></td>');
          if (isStd) L.push('        <td' + divAttr + '>' + r.prop + '</td>');
          if (isFull) L.push('        <td' + divAttr + '>' + r.inv + '</td>');
          if (isFull) L.push('        <td' + divAttr + '>' + r.due + '</td>');
          L.push('        <td' + (amtCls ? ' class="' + amtCls + '"' : '') + '>' + r.amt + '</td>');
          if (s.showAction) L.push('        <td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td>');
          L.push('      </tr>');
        });
        L.push('    </tbody>');
        L.push('  </table>');
        L.push('</div>');

        var code = L.join('\n');
        var html = code;

        var rCols = [];
        rCols.push("              <td>{row.name}</td>");
        if (isStd) rCols.push("              <td><span className=\"udc-badge\" data-variant={row.sv}>{row.status}</span></td>");
        if (isStd) rCols.push("              <td>{row.property}</td>");
        if (isFull) rCols.push("              <td>{row.inv}</td>");
        if (isFull) rCols.push("              <td>{row.due}</td>");
        rCols.push("              <td" + (amtCls ? " className=\"" + amtCls + "\"" : "") + ">{row.amount}</td>");

        var rL = ["import { useState } from 'react';", '', 'const rows = [', "  { name: 'Brian Smith', status: 'Delivered', sv: 'success', property: 'Riverbend', inv: 'INV-002', due: 'Feb 20', amount: '$75' },", "  { name: 'Catherine Lee', status: 'Low Confidence', sv: 'warning', property: 'Sunnyvale', inv: 'INV-003', due: 'Mar 5', amount: '$100' },", '];', '', 'function InvoiceTable() {', '  const [checked, setChecked] = useState(new Set());'];
        if (s.sortCol !== 'none') rL.push("  const [sortDir, setSortDir] = useState('" + (s.sortCol.includes('asc') ? 'asc' : 'desc') + "');");
        rL.push('', '  function toggleRow(idx) {', '    setChecked(prev => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });', '  }', '  function toggleAll() {', '    setChecked(prev => prev.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)));', '  }', '', '  return (', '    <div className="udc-data-table"' + stripedAttr + '>', '      <table>', '        <thead><tr>');
        if (s.showCheck) rL.push('          <th className="udc-dt-check"><input type="checkbox" checked={checked.size === rows.length} onChange={toggleAll} /></th>');
        rL.push('          <th>Uploaded By <span className="udc-dt-sort"' + nameSortAttr + ' /></th>');
        if (isStd) rL.push('          <th>Invoice Status</th>');
        if (isStd) rL.push('          <th>Property</th>');
        if (isFull) rL.push('          <th>Invoice Number</th>', '          <th>Due Date</th>');
        rL.push('          <th' + (amtCls ? ' className="' + amtCls + '"' : '') + '>Amount</th>');
        if (s.showAction) rL.push('          <th className="udc-dt-action" />');
        rL.push('        </tr></thead>', '        <tbody>', '          {rows.map((row, i) => (', '            <tr key={i}>');
        if (s.showCheck) rL.push('              <td className="udc-dt-check"><input type="checkbox" checked={checked.has(i)} onChange={() => toggleRow(i)} /></td>');
        rL.push('              <td>{row.name}</td>');
        if (isStd) rL.push('              <td><span className="udc-badge" data-variant={row.sv}>{row.status}</span></td>', '              <td>{row.property}</td>');
        if (isFull) rL.push('              <td>{row.inv}</td>', '              <td>{row.due}</td>');
        rL.push('              <td' + (amtCls ? ' className="' + amtCls + '"' : '') + '>{row.amount}</td>');
        if (s.showAction) rL.push('              <td className="udc-dt-action"><button className="udc-button-ghost" data-icon-only><span className="material-symbols-outlined">more_vert</span></button></td>');
        rL.push('            </tr>', '          ))}', '        </tbody>', '      </table>', '    </div>', '  );', '}');

        var vCols = [];
        vCols.push("          <td>{{ row.name }}</td>");
        if (isStd) vCols.push("          <td><span class=\"udc-badge\" :data-variant=\"row.sv\">{{ row.status }}</span></td>");
        if (isStd) vCols.push("          <td>{{ row.property }}</td>");
        if (isFull) vCols.push("          <td>{{ row.inv }}</td>");
        if (isFull) vCols.push("          <td>{{ row.due }}</td>");
        vCols.push("          <td" + (amtCls ? " class=\"" + amtCls + "\"" : "") + ">{{ row.amount }}</td>");

        var vL = ['<script setup>', "import { ref } from 'vue';", '', 'const rows = [', "  { name: 'Brian Smith', status: 'Delivered', sv: 'success', property: 'Riverbend', inv: 'INV-002', due: 'Feb 20', amount: '$75' },", "  { name: 'Catherine Lee', status: 'Low Confidence', sv: 'warning', property: 'Sunnyvale', inv: 'INV-003', due: 'Mar 5', amount: '$100' },", '];', 'const checked = ref(new Set());', '', 'function toggleRow(i) { const s = new Set(checked.value); s.has(i) ? s.delete(i) : s.add(i); checked.value = s; }', 'function toggleAll() { checked.value = checked.value.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)); }', '</script>', '', '<template>', '  <div class="udc-data-table"' + stripedAttr + '>', '    <table>', '      <thead><tr>'];
        if (s.showCheck) vL.push('        <th class="udc-dt-check"><input type="checkbox" :checked="checked.size === rows.length" @change="toggleAll" /></th>');
        vL.push('        <th>Uploaded By <span class="udc-dt-sort"' + nameSortAttr + ' /></th>');
        if (isStd) vL.push('        <th>Invoice Status</th>');
        if (isStd) vL.push('        <th>Property</th>');
        if (isFull) vL.push('        <th>Invoice Number</th>', '        <th>Due Date</th>');
        vL.push('        <th' + (amtCls ? ' class="' + amtCls + '"' : '') + '>Amount</th>');
        if (s.showAction) vL.push('        <th class="udc-dt-action" />');
        vL.push('      </tr></thead>', '      <tbody>', '        <tr v-for="(row, i) in rows" :key="i">');
        if (s.showCheck) vL.push('          <td class="udc-dt-check"><input type="checkbox" :checked="checked.has(i)" @change="toggleRow(i)" /></td>');
        vL.push('          <td>{{ row.name }}</td>');
        if (isStd) vL.push('          <td><span class="udc-badge" :data-variant="row.sv">{{ row.status }}</span></td>', '          <td>{{ row.property }}</td>');
        if (isFull) vL.push('          <td>{{ row.inv }}</td>', '          <td>{{ row.due }}</td>');
        vL.push('          <td' + (amtCls ? ' class="' + amtCls + '"' : '') + '>{{ row.amount }}</td>');
        if (s.showAction) vL.push('          <td class="udc-dt-action"><button class="udc-button-ghost" data-icon-only><span class="material-symbols-outlined">more_vert</span></button></td>');
        vL.push('        </tr>', '      </tbody>', '    </table>', '  </div>', '</template>');

        return { html: html, code: code };
      }
    };
