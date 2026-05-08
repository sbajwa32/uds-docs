// docs/modules/demo-builder/assembler.js
// Composes per-component example HTML into a logical page layout.
// Layout structure (header on top, breadcrumb after, filter bar above table,
// form section below table, etc.) is preserved here — only contents and
// per-component states vary per build.
//
// Phase 7: example HTML now comes from uds/components/<id>/examples/*.html
// via fetchExampleHTML, NOT from a per-component template function. The
// drift fix is structural — the demo IS the docs example.

import { pick } from './rng.js';
import { DATA } from './data-pools.js';
import { fetchExampleHTML } from './example-fetcher.js';

function has(components, id) { return components.indexOf(id) !== -1; }

/**
 * Build a map of { componentId: rendered-html-string } by fetching each
 * selected component's example in parallel. Used by assembleHTMLBody.
 */
async function fetchAll(components, pool) {
  const out = {};
  await Promise.all(components.map(async (cid) => {
    const html = await fetchExampleHTML(cid, pool);
    out[cid] = html || ''; // empty string if fetch failed (assembler skips empty)
  }));
  return out;
}

/**
 * assembleHTMLBody(components, pool) — async entry that fetches all
 * per-component examples then composes them into a logical page layout.
 *
 * pool: data-pools.js DATA (random) or canonical-pool.js CANONICAL_POOL.
 *       Demo Builder uses random; docs page Examples tab uses canonical.
 */
export async function assembleHTMLBody(components, pool) {
  const t = await fetchAll(components, pool);
  const sections = [];
  const useShell = has(components, 'nav-header') || has(components, 'nav-vertical');

  if (has(components, 'nav-header') && t['nav-header']) sections.push(t['nav-header']);

  const mainContent = [];

  if (has(components, 'breadcrumb') && t['breadcrumb']) mainContent.push('<div style="margin-bottom:16px;">' + t['breadcrumb'] + '</div>');
  if (has(components, 'link') && t['link']) mainContent.push('<div style="margin-bottom:16px;">' + t['link'] + '</div>');
  if (has(components, 'notification') && t['notification']) mainContent.push('<div style="margin-bottom:16px;">' + t['notification'] + '</div>');

  if (has(components, 'tabs') && t['tabs']) mainContent.push('<div style="margin-bottom:24px;">' + t['tabs'] + '</div>');

  if (has(components, 'search') || has(components, 'chip')) {
    let filterBar = '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;">';
    if (has(components, 'search') && t['search']) filterBar += '<div style="flex:1;min-width:200px;">' + t['search'] + '</div>';
    if (has(components, 'chip') && t['chip']) filterBar += '<div style="flex-shrink:0;padding-top:12px;">' + t['chip'] + '</div>';
    filterBar += '</div>';
    if (filterBar !== '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;"></div>') {
      mainContent.push(filterBar);
    }
  }

  if (has(components, 'button') && has(components, 'data-table') && t['button']) {
    const pageTitle = pick(DATA.pageTitles);
    mainContent.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h2 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-xl);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0;">' + pageTitle + '</h2>' + t['button'] + '</div>');
  } else if (has(components, 'button') && t['button']) {
    mainContent.push('<div style="margin-bottom:16px;">' + t['button'] + '</div>');
  }

  if (has(components, 'data-table') && t['data-table']) mainContent.push('<div style="margin-bottom:24px;">' + t['data-table'] + '</div>');
  if (has(components, 'pagination') && t['pagination']) mainContent.push('<div style="margin-bottom:24px;">' + t['pagination'] + '</div>');

  if (has(components, 'tile') && t['tile']) {
    const tileHeading = pick(['Quick Actions', 'Shortcuts', 'Get Started', "What's next"]);
    mainContent.push('<div style="margin-bottom:24px;"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 12px;">' + tileHeading + '</h3>' + t['tile'] + '</div>');
  }

  if (has(components, 'divider') && mainContent.length > 0 && t['divider']) mainContent.push(t['divider']);

  const formFields = [];
  if (has(components, 'label') && !has(components, 'text-input') && !has(components, 'text-area') && t['label']) formFields.push(t['label']);
  if (has(components, 'text-input') && t['text-input']) formFields.push(t['text-input']);
  if (has(components, 'text-area') && t['text-area']) formFields.push(t['text-area']);
  if (has(components, 'dropdown') && t['dropdown']) formFields.push(t['dropdown']);
  if (has(components, 'checkbox') && t['checkbox']) formFields.push(t['checkbox']);
  if (has(components, 'radio') && t['radio']) formFields.push(t['radio']);
  if (has(components, 'toggle') && t['toggle']) formFields.push(t['toggle']);

  if (formFields.length > 0) {
    const formHeading = pick(['Add Tenant', 'New Lease', 'Edit Property', 'Create Invoice', 'New Work Order', 'Update Owner']);
    mainContent.push('<div style="margin-top:24px;padding:24px;background:var(--uds-color-surface-subtle);border-radius:var(--uds-border-radius-container-md);"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 16px;">' + formHeading + '</h3><div style="display:flex;flex-direction:column;gap:16px;">' + formFields.join('') + '</div></div>');
  }

  if (has(components, 'badge') && !has(components, 'data-table') && t['badge']) mainContent.push('<div style="margin-top:16px;">' + t['badge'] + '</div>');
  if (has(components, 'icon-wrapper') && t['icon-wrapper']) mainContent.push('<div style="margin-top:16px;">' + t['icon-wrapper'] + '</div>');
  if (has(components, 'spacer') && mainContent.length > 0 && t['spacer']) mainContent.push(t['spacer']);
  if (has(components, 'dialog') && t['dialog']) mainContent.push('<div style="margin-top:16px;">' + t['dialog'] + '</div>');
  if (has(components, 'tooltip') && t['tooltip']) mainContent.push('<div style="margin-top:16px;">' + t['tooltip'] + '</div>');
  if (has(components, 'list') && !has(components, 'nav-vertical') && t['list']) mainContent.push('<div style="margin-top:16px;">' + t['list'] + '</div>');

  const mainHtml = mainContent.join('\n');

  if (useShell) {
    let shell = '<div style="display:flex;min-height:calc(100vh - 76px);">';
    if (has(components, 'nav-vertical') && t['nav-vertical']) shell += '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;">' + t['nav-vertical'] + '</div>';
    else if (has(components, 'list') && t['list']) shell += '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;width:260px;">' + t['list'] + '</div>';
    shell += '<div style="flex:1;padding:24px;overflow-y:auto;">' + mainHtml + '</div></div>';
    sections.push(shell);
  } else {
    sections.push('<div style="max-width:1000px;margin:0 auto;padding:32px 24px;">' + mainHtml + '</div>');
  }

  return sections.join('\n');
}
