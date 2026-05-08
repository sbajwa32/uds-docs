// Playground config for the pagination component.
// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.
export default {
      controls: [
        { key: 'page', label: 'Current page', type: 'select', default: '1', options: [
          { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }
        ]}
      ],
      render(s) {
        function btn(n){ return '<button class="udc-pagination__button"' + (s.page === String(n) ? ' aria-current="page"' : '') + '>' + n + '</button>'; }
        var code = '<nav class="udc-pagination" aria-label="Pagination">\n  <div class="udc-pagination__pages">\n    <button class="udc-pagination__button" aria-label="Previous page"><span class="material-symbols-outlined">chevron_left</span></button>\n    ' + btn(1) + '\n    ' + btn(2) + '\n    ' + btn(3) + '\n    <button class="udc-pagination__button" aria-label="Next page"><span class="material-symbols-outlined">chevron_right</span></button>\n  </div>\n  <div class="udc-pagination__meta"><span>Rows per page</span><span>50</span><span>1-50 / 100</span></div>\n</nav>';
        return { html: code, code: code };
      }
    };
