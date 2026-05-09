// docs/modules/demo-builder/overlay.js
// Preview overlay + toolbar (Refresh data / Save HTML / Close). Hosts the
// iframe that renders the generated demo HTML via srcdoc.

const TOOLBAR_BTN_STYLE = 'background:rgba(255,255,255,0.15);border:none;color:inherit;padding:4px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;display:inline-flex;align-items:center;gap:6px;';
const ICON_STYLE = 'font-size:16px;';

export function openDemoOverlay(html, components) {
  const existing = document.getElementById('sg-demo-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sg-demo-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:var(--uds-z-index-modal);background:var(--uds-color-surface-page-main);display:flex;flex-direction:column;';
  // Stash components so the Rebuild button knows what to re-roll.
  overlay._components = components || [];

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:var(--uds-color-surface-interactive-default);color:var(--uds-color-text-inverse);font-family:var(--uds-font-family);font-size:14px;flex-shrink:0;';
  toolbar.innerHTML =
    '<span style="font-weight:700;">UDS Demo Preview</span>' +
    '<div style="display:flex;gap:8px;">' +
      '<button id="sg-demo-rebuild-btn" onclick="window.rebuildDemoPreview()" title="Re-roll fresh data and states without changing the selected components" style="' + TOOLBAR_BTN_STYLE + '">' +
        '<span class="material-symbols-outlined" style="' + ICON_STYLE + '">refresh</span>Refresh data' +
      '</button>' +
      '<button onclick="var b=new Blob([document.getElementById(\'sg-demo-iframe\').srcdoc],{type:\'text/html\'});var a=document.createElement(\'a\');a.href=URL.createObjectURL(b);a.download=\'demo.html\';a.click();" style="' + TOOLBAR_BTN_STYLE + '">' +
        '<span class="material-symbols-outlined" style="' + ICON_STYLE + '">download</span>Save HTML' +
      '</button>' +
      '<button onclick="document.getElementById(\'sg-demo-overlay\').remove();" style="' + TOOLBAR_BTN_STYLE + '">' +
        '<span class="material-symbols-outlined" style="' + ICON_STYLE + '">close</span>Close' +
      '</button>' +
    '</div>';

  const iframe = document.createElement('iframe');
  iframe.id = 'sg-demo-iframe';
  iframe.srcdoc = html;
  iframe.style.cssText = 'flex:1;border:none;width:100%;';

  overlay.appendChild(toolbar);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  const backdrop = document.getElementById('sg-demo-backdrop');
  if (backdrop) backdrop.setAttribute('data-open', 'false');
}

/**
 * In-place re-render of the iframe with fresh data/states for the same
 * components. Doesn't pollute build history. Caller provides the
 * generateDemoHTML function to avoid a circular import.
 *
 * Phase 7: generateDemoHTML is now async (fetches per-component examples),
 * so we await it.
 */
export function rebuildDemoPreview(generateDemoHTML) {
  const overlay = document.getElementById('sg-demo-overlay');
  if (!overlay) return;
  const components = overlay._components || [];
  if (!components.length) return;
  const rebuildBtn = document.getElementById('sg-demo-rebuild-btn');
  if (rebuildBtn) {
    rebuildBtn.disabled = true;
    rebuildBtn.dataset.originalLabel = rebuildBtn.innerHTML;
    rebuildBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;animation:sg-spin 0.6s linear infinite;display:inline-block;">progress_activity</span>';
  }
  setTimeout(async () => {
    const fresh = await generateDemoHTML(components);
    const iframe = document.getElementById('sg-demo-iframe');
    if (iframe) iframe.srcdoc = fresh;
    if (rebuildBtn) {
      rebuildBtn.disabled = false;
      rebuildBtn.innerHTML = rebuildBtn.dataset.originalLabel || 'Refresh data';
    }
  }, 50);
}
