// docs/modules/demo-builder/index.js
// UDS Demo Site Builder — entry point.
//
// Generates a vanilla HTML/CSS demo page from the selected UDS components.
// Supports live preview (iframe overlay), Refresh data re-roll, and ZIP
// download. Reference output only — production framework code lives in
// the UDS Storybook.
//
// Loaded as an ES module by index.html. Sets up the window.* globals that
// the inline dialog HTML uses for onclick handlers.

import { reseedRandom } from './rng.js';
import { assembleHTMLBody } from './assembler.js';
import { getHistory, saveHistory, renderHistoryCard } from './history.js';
import { openDemoOverlay, rebuildDemoPreview as rebuildOverlay } from './overlay.js';
import { downloadDemoProject as downloadProject } from './zip.js';

const DEMO_COMPONENTS = [
  { id: 'button',       label: 'Button' },
  { id: 'link',         label: 'Link' },
  { id: 'label',        label: 'Label' },
  { id: 'text-input',   label: 'Text Input' },
  { id: 'text-area',    label: 'Text Area' },
  { id: 'checkbox',     label: 'Checkbox' },
  { id: 'radio',        label: 'Radio' },
  { id: 'dropdown',     label: 'Dropdown' },
  { id: 'toggle',       label: 'Toggle' },
  { id: 'search',       label: 'Search' },
  { id: 'badge',        label: 'Badge' },
  { id: 'chip',         label: 'Chip' },
  { id: 'divider',      label: 'Divider' },
  { id: 'icon-wrapper', label: 'Icon Wrapper' },
  { id: 'spacer',       label: 'Spacer' },
  { id: 'breadcrumb',   label: 'Breadcrumb' },
  { id: 'pagination',   label: 'Pagination' },
  { id: 'tabs',         label: 'Tabs' },
  { id: 'nav-header',   label: 'Nav Header' },
  { id: 'nav-vertical', label: 'Nav Vertical' },
  { id: 'tile',         label: 'Tile' },
  { id: 'list',         label: 'List' },
  { id: 'data-table',   label: 'Data Table' },
  { id: 'notification', label: 'Notification' },
  { id: 'dialog',       label: 'Dialog' },
  { id: 'tooltip',      label: 'Tooltip' }
];

function getBaseUrl() {
  const path = window.location.pathname;
  let idx = path.indexOf('/index.html');
  if (idx === -1) idx = path.lastIndexOf('/');
  let base = path.substring(0, idx);
  if (base.endsWith('/')) base = base.slice(0, -1);
  return window.location.origin + base;
}

function getThemeAttrs() {
  const html = document.documentElement;
  const attrs = {};
  ['data-color-scheme', 'data-theme', 'data-font', 'data-font-scale', 'data-density'].forEach((a) => {
    const v = html.getAttribute(a);
    if (v) attrs[a] = v;
  });
  return attrs;
}

function themeAttrString(attrs) {
  return Object.keys(attrs).map((k) => ' ' + k + '="' + attrs[k] + '"').join('');
}

function baseHead(title) {
  const origin = getBaseUrl();
  return '<!DOCTYPE html>\n<html lang="en"' + themeAttrString(getThemeAttrs()) + '>\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>' + title + '</title>\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lexend:wght@400;500;700&display=swap" rel="stylesheet" />\n  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />\n  <link rel="stylesheet" href="' + origin + '/uds/uds.css" />\n  <style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: var(--uds-font-family); background: var(--uds-color-surface-page-main); color: var(--uds-color-text-primary); }</style>\n</head>\n';
}

export function generateDemoHTML(components, opts = {}) {
  // Reseed on every generate so each Build / Rebuild rolls fresh data and
  // states. Within a single generate call, the seed stays put so a tenant
  // listed in the data table also gets a consistent property and balance.
  reseedRandom(opts.seed != null ? opts.seed : (Date.now() ^ Math.floor(Math.random() * 1e9)));
  const origin = getBaseUrl();
  const body = assembleHTMLBody(components);
  return baseHead('UDS Demo — HTML') + '<body>\n' + body + '\n<script src="' + origin + '/uds/uds.js"><\/script>\n</body>\n</html>';
}

function getSelectedComponents() {
  const grid = document.getElementById('sg-demo-grid');
  if (!grid) return [];
  const boxes = grid.querySelectorAll('input[type="checkbox"]:checked');
  return Array.prototype.map.call(boxes, (b) => b.getAttribute('data-demo-comp'));
}

export function initDemoDialog() {
  const grid = document.getElementById('sg-demo-grid');
  if (!grid || grid.children.length > 0) { renderHistoryCard(); return; }

  DEMO_COMPONENTS.forEach((comp) => {
    const label = document.createElement('label');
    let statusCls = '';
    if (window.COMPONENT_STATUS_MAP && window.COMPONENT_STATUS_MAP[comp.id]) {
      statusCls = window.COMPONENT_STATUS_MAP[comp.id];
    }
    const dot = statusCls
      ? ' <span class="sg-demo-status-dot sg-demo-status-dot--' + statusCls + '" title="' + statusCls.replace('-', ' ') + '"></span>'
      : '';
    label.innerHTML = '<input type="checkbox" checked data-demo-comp="' + comp.id + '" /> ' + comp.label + dot;
    grid.appendChild(label);
  });

  const toggleAll = document.getElementById('sg-demo-toggle-all');
  if (toggleAll) {
    toggleAll.addEventListener('click', () => {
      const boxes = grid.querySelectorAll('input[type="checkbox"]');
      const allChecked = Array.prototype.every.call(boxes, (b) => b.checked);
      boxes.forEach((b) => { b.checked = !allChecked; });
      toggleAll.textContent = allChecked ? 'Select All' : 'Deselect All';
    });
  }

  renderHistoryCard();
}

export function buildDemoPreview() {
  const btn = document.getElementById('sg-demo-preview-btn');
  const errEl = document.getElementById('sg-demo-error');
  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

  const components = getSelectedComponents();
  if (!components.length) {
    if (errEl) { errEl.textContent = 'Select at least one component.'; errEl.style.display = 'block'; }
    return;
  }

  const origLabel = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="sg-demo-spinner"></span>Building...';
  }

  setTimeout(() => {
    try {
      const html = generateDemoHTML(components);
      openDemoOverlay(html, components);

      const attrs = getThemeAttrs();
      const entry = {
        timestamp: new Date().toISOString(),
        framework: 'html',
        theme: {
          colorScheme: attrs['data-color-scheme'] || '',
          brand: attrs['data-theme'] || '',
          font: attrs['data-font'] || ''
        },
        components,
        componentCount: components.length,
        sizeKB: Math.round(html.length / 1024),
        blobHtml: html
      };

      const history = getHistory();
      history.push(entry);
      saveHistory(history);
      renderHistoryCard();
    } catch (e) {
      if (errEl) { errEl.textContent = 'Build failed: ' + e.message; errEl.style.display = 'block'; }
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origLabel;
    }
  }, 50);
}

export function openPreviousBuild() {
  const history = getHistory();
  if (!history.length) return;
  const last = history[history.length - 1];
  if (last.blobHtml) openDemoOverlay(last.blobHtml, last.components || []);
}

export function rebuildDemoPreview() {
  rebuildOverlay(generateDemoHTML);
}

export function downloadDemoProject() {
  downloadProject({
    getOrigin: getBaseUrl,
    generateDemoHTML,
    getSelectedComponents
  });
}

// ============================================================================
// Window globals — the inline dialog markup in index.html uses onclick="..."
// attributes that reference these by name. Exposing them on window keeps that
// HTML-driven contract intact while the module runs in module scope.
// ============================================================================
window.initDemoDialog = initDemoDialog;
window.buildDemoPreview = buildDemoPreview;
window.openPreviousBuild = openPreviousBuild;
window.rebuildDemoPreview = rebuildDemoPreview;
window.downloadDemoProject = downloadDemoProject;
window.regenerateDemoHTML = (components) => generateDemoHTML(components);
