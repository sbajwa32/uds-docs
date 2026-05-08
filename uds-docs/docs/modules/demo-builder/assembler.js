// docs/modules/demo-builder/assembler.js
// Composes per-component template HTML into a logical page layout.
// Layout structure (header on top, breadcrumb after, filter bar above table,
// form section below table, etc.) is preserved here — only contents and
// per-component states vary per build.

import { pick } from './rng.js';
import { DATA } from './data-pools.js';
import { DEMO_TEMPLATES } from './templates.js';

function has(components, id) { return components.indexOf(id) !== -1; }

export function assembleHTMLBody(components) {
  const sections = [];
  const useShell = has(components, 'nav-header') || has(components, 'nav-vertical');

  if (has(components, 'nav-header')) sections.push(DEMO_TEMPLATES['nav-header']());

  const mainContent = [];

  if (has(components, 'breadcrumb')) mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['breadcrumb']() + '</div>');
  if (has(components, 'link')) mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['link']() + '</div>');
  if (has(components, 'notification')) mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['notification']() + '</div>');

  if (has(components, 'tabs')) mainContent.push('<div style="margin-bottom:24px;">' + DEMO_TEMPLATES['tabs']() + '</div>');

  if (has(components, 'search') || has(components, 'chip')) {
    let filterBar = '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;">';
    if (has(components, 'search')) filterBar += '<div style="flex:1;min-width:200px;">' + DEMO_TEMPLATES['search']() + '</div>';
    if (has(components, 'chip')) filterBar += '<div style="flex-shrink:0;padding-top:12px;">' + DEMO_TEMPLATES['chip']() + '</div>';
    filterBar += '</div>';
    mainContent.push(filterBar);
  }

  if (has(components, 'button') && has(components, 'data-table')) {
    const pageTitle = pick(DATA.pageTitles);
    mainContent.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h2 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-xl);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0;">' + pageTitle + '</h2>' + DEMO_TEMPLATES['button']() + '</div>');
  } else if (has(components, 'button')) {
    mainContent.push('<div style="margin-bottom:16px;">' + DEMO_TEMPLATES['button']() + '</div>');
  }

  if (has(components, 'data-table')) mainContent.push('<div style="margin-bottom:24px;">' + DEMO_TEMPLATES['data-table']() + '</div>');
  if (has(components, 'pagination')) mainContent.push('<div style="margin-bottom:24px;">' + DEMO_TEMPLATES['pagination']() + '</div>');

  if (has(components, 'tile')) {
    const tileHeading = pick(['Quick Actions', 'Shortcuts', 'Get Started', "What's next"]);
    mainContent.push('<div style="margin-bottom:24px;"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 12px;">' + tileHeading + '</h3>' + DEMO_TEMPLATES['tile']() + '</div>');
  }

  if (has(components, 'divider') && mainContent.length > 0) mainContent.push(DEMO_TEMPLATES['divider']());

  const formFields = [];
  if (has(components, 'label') && !has(components, 'text-input') && !has(components, 'text-area')) formFields.push(DEMO_TEMPLATES['label']());
  if (has(components, 'text-input')) formFields.push(DEMO_TEMPLATES['text-input']());
  if (has(components, 'text-area')) formFields.push(DEMO_TEMPLATES['text-area']());
  if (has(components, 'dropdown')) formFields.push(DEMO_TEMPLATES['dropdown']());
  if (has(components, 'checkbox')) formFields.push(DEMO_TEMPLATES['checkbox']());
  if (has(components, 'radio')) formFields.push(DEMO_TEMPLATES['radio']());
  if (has(components, 'toggle')) formFields.push(DEMO_TEMPLATES['toggle']());

  if (formFields.length > 0) {
    const formHeading = pick(['Add Tenant', 'New Lease', 'Edit Property', 'Create Invoice', 'New Work Order', 'Update Owner']);
    mainContent.push('<div style="margin-top:24px;padding:24px;background:var(--uds-color-surface-subtle);border-radius:var(--uds-border-radius-container-md);"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 16px;">' + formHeading + '</h3><div style="display:flex;flex-direction:column;gap:16px;">' + formFields.join('') + '</div></div>');
  }

  if (has(components, 'badge') && !has(components, 'data-table')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['badge']() + '</div>');
  if (has(components, 'icon-wrapper')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['icon-wrapper']() + '</div>');
  if (has(components, 'spacer') && mainContent.length > 0) mainContent.push(DEMO_TEMPLATES['spacer']());
  if (has(components, 'dialog')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['dialog']() + '</div>');
  if (has(components, 'tooltip')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['tooltip']() + '</div>');
  if (has(components, 'list') && !has(components, 'nav-vertical')) mainContent.push('<div style="margin-top:16px;">' + DEMO_TEMPLATES['list']() + '</div>');

  const mainHtml = mainContent.join('\n');

  if (useShell) {
    let shell = '<div style="display:flex;min-height:calc(100vh - 76px);">';
    if (has(components, 'nav-vertical')) shell += '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;">' + DEMO_TEMPLATES['nav-vertical']() + '</div>';
    else if (has(components, 'list')) shell += '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;width:260px;">' + DEMO_TEMPLATES['list']() + '</div>';
    shell += '<div style="flex:1;padding:24px;overflow-y:auto;">' + mainHtml + '</div></div>';
    sections.push(shell);
  } else {
    sections.push('<div style="max-width:1000px;margin:0 auto;padding:32px 24px;">' + mainHtml + '</div>');
  }

  return sections.join('\n');
}
