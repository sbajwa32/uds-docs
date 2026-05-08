// docs/modules/demo-builder/zip.js
// ZIP download for the Demo Builder. Bundles the generated demo HTML +
// the entire UDS package (tokens + components CSS/JS).
//
// Per the locked decision in the restructure plan, the ZIP includes ONLY
// the runnable design system (tokens + per-component CSS/JS). Documentation
// metadata (examples/, manifest.json, spec.json, status.json,
// changelog.json, playground.js) is excluded.

// Static list of files the design system ships. After Phase 6 this will
// expand to walk uds/components/*/<id>.{css,js} dynamically; for now it's
// the verbatim list from the pre-restructure shipper.
const UDS_FILES = [
  'uds.css', 'uds.js', 'tokens/primitives.css', 'tokens/semantic.css', 'tokens/text-styles.css',
  'components/button.css', 'components/text-input.css', 'components/text-input.js',
  'components/checkbox.css', 'components/checkbox.js', 'components/radio.css',
  'components/badge.css', 'components/divider.css', 'components/icon-wrapper.css',
  'components/spacer.css', 'components/breadcrumb.css', 'components/tab-horizontal.css',
  'components/tabs.js', 'components/dropdown.css', 'components/dropdown.js',
  'components/nav-header.css', 'components/nav-header.js', 'components/nav-vertical.css',
  'components/nav-vertical.js', 'components/notification.css', 'components/notification.js',
  'components/dialog.css', 'components/dialog.js', 'components/tile.css', 'components/tile.js',
  'components/list.css', 'components/list.js', 'components/data-table.css', 'components/data-table.js',
  'components/chip.css', 'components/chip.js', 'components/search.css', 'components/search.js',
  'components/tooltip.css'
];

function downloadUdsFiles(zip, prefix, origin) {
  return Promise.all(UDS_FILES.map((f) =>
    fetch(origin + '/uds/' + f)
      .then((r) => r.text())
      .then((text) => { zip.file(prefix + f, text); })
      .catch(() => {})
  ));
}

function triggerZipDownload(zip, filename) {
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

/**
 * downloadDemoProject(getOrigin, generateDemoHTML, getSelectedComponents) —
 * builds the demo HTML for the currently-selected components, packages
 * it together with the UDS source under `uds/`, and triggers a download.
 *
 * Caller provides the dependencies to avoid circular imports between this
 * module and index.js.
 */
export function downloadDemoProject({ getOrigin, generateDemoHTML, getSelectedComponents }) {
  const btn = document.getElementById('sg-demo-download-btn');
  const errEl = document.getElementById('sg-demo-error');
  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

  const components = getSelectedComponents();
  if (!components.length) {
    if (errEl) { errEl.textContent = 'Select at least one component.'; errEl.style.display = 'block'; }
    return;
  }

  if (typeof JSZip === 'undefined') {
    if (errEl) { errEl.textContent = 'JSZip not available.'; errEl.style.display = 'block'; }
    return;
  }

  const origLabel = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="sg-demo-spinner"></span>Packaging...';
  }

  setTimeout(() => {
    try {
      const zip = new JSZip();
      const origin = getOrigin();
      zip.file('index.html', generateDemoHTML(components));
      downloadUdsFiles(zip, 'uds/', origin).then(() => {
        triggerZipDownload(zip, 'demo-html.zip');
        if (btn) { btn.disabled = false; btn.innerHTML = origLabel; }
      });
    } catch (e) {
      if (errEl) { errEl.textContent = 'Download failed: ' + e.message; errEl.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.innerHTML = origLabel; }
    }
  }, 50);
}
