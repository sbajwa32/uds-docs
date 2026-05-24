// Demo Builder page assembler. Composes per-component example HTML
// fragments into a logical multi-component page layout (nav header
// across the top, breadcrumb above, filter bar above table, form
// section below, etc.).
//
// Refactored from the legacy `docs/modules/demo-builder/assembler.js`
// into two layers:
//
//   1. `composeHTMLBody(examples, components, pool)` — pure: takes a
//      map of pre-fetched/pre-substituted HTML strings keyed by
//      component id and returns the composed page HTML. RNG-consuming
//      only via `pick(pool.pageTitles)` etc. for headings.
//   2. `assembleHTMLBody(components, options)` — async wrapper that
//      fetches each component's example, applies random substitution,
//      then calls `composeHTMLBody`. Chunk 12b wires the real fetcher
//      from `lib/examples-renderer`; tests inject a mock.
//
// The split makes the composition logic unit-testable (no network,
// no DOM) without losing the legacy single-entry-point API.

import { pick } from './rng';
import { RANDOM_POOL } from './data-pools';
import { applyRandomSubstitution } from './substitution';
import type { SubstitutionPool } from '../examples-renderer';

export type ExampleMap = Record<string, string>;

function has(components: ReadonlyArray<string>, id: string): boolean {
  return components.indexOf(id) !== -1;
}

// ---------------------------------------------------------------------------
// composeHTMLBody — pure composition. Public so tests can exercise it.
// ---------------------------------------------------------------------------

export function composeHTMLBody(
  examples: ExampleMap,
  components: ReadonlyArray<string>,
  pool: SubstitutionPool = RANDOM_POOL,
): string {
  const t = examples;
  const sections: string[] = [];
  const useShell = has(components, 'nav-header') || has(components, 'nav-vertical');

  if (has(components, 'nav-header') && t['nav-header']) sections.push(t['nav-header']);

  const mainContent: string[] = [];

  if (has(components, 'breadcrumb') && t['breadcrumb']) {
    mainContent.push('<div style="margin-bottom:16px;">' + t['breadcrumb'] + '</div>');
  }
  if (has(components, 'link') && t['link']) {
    mainContent.push('<div style="margin-bottom:16px;">' + t['link'] + '</div>');
  }
  if (has(components, 'notification') && t['notification']) {
    mainContent.push('<div style="margin-bottom:16px;">' + t['notification'] + '</div>');
  }
  if (has(components, 'tabs') && t['tabs']) {
    mainContent.push('<div style="margin-bottom:24px;">' + t['tabs'] + '</div>');
  }

  if (has(components, 'search') || has(components, 'chip')) {
    let filterBar =
      '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;">';
    if (has(components, 'search') && t['search']) {
      filterBar += '<div style="flex:1;min-width:200px;">' + t['search'] + '</div>';
    }
    if (has(components, 'chip') && t['chip']) {
      filterBar += '<div style="flex-shrink:0;padding-top:12px;">' + t['chip'] + '</div>';
    }
    filterBar += '</div>';
    if (
      filterBar !==
      '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px;"></div>'
    ) {
      mainContent.push(filterBar);
    }
  }

  if (has(components, 'button') && has(components, 'data-table') && t['button']) {
    const pageTitle = pick(pool.pageTitles);
    mainContent.push(
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
        '<h2 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-xl);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0;">' +
        pageTitle +
        '</h2>' +
        t['button'] +
        '</div>',
    );
  } else if (has(components, 'button') && t['button']) {
    mainContent.push('<div style="margin-bottom:16px;">' + t['button'] + '</div>');
  }

  if (has(components, 'data-table') && t['data-table']) {
    mainContent.push('<div style="margin-bottom:24px;">' + t['data-table'] + '</div>');
  }
  if (has(components, 'pagination') && t['pagination']) {
    mainContent.push('<div style="margin-bottom:24px;">' + t['pagination'] + '</div>');
  }

  if (has(components, 'tile') && t['tile']) {
    const tileHeading = pick(['Quick Actions', 'Shortcuts', 'Get Started', "What's next"]);
    mainContent.push(
      '<div style="margin-bottom:24px;"><h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 12px;">' +
        tileHeading +
        '</h3>' +
        t['tile'] +
        '</div>',
    );
  }

  if (has(components, 'divider') && mainContent.length > 0 && t['divider']) {
    mainContent.push(t['divider']);
  }

  const formFields: string[] = [];
  if (
    has(components, 'label') &&
    !has(components, 'text-input') &&
    !has(components, 'text-area') &&
    t['label']
  ) {
    formFields.push(t['label']);
  }
  if (has(components, 'text-input') && t['text-input']) formFields.push(t['text-input']);
  if (has(components, 'text-area') && t['text-area']) formFields.push(t['text-area']);
  if (has(components, 'dropdown') && t['dropdown']) formFields.push(t['dropdown']);
  if (has(components, 'checkbox') && t['checkbox']) formFields.push(t['checkbox']);
  if (has(components, 'radio') && t['radio']) formFields.push(t['radio']);
  if (has(components, 'toggle') && t['toggle']) formFields.push(t['toggle']);

  if (formFields.length > 0) {
    const formHeading = pick([
      'Add Tenant',
      'New Lease',
      'Edit Property',
      'Create Invoice',
      'New Work Order',
      'Update Owner',
    ]);
    mainContent.push(
      '<div style="margin-top:24px;padding:24px;background:var(--uds-color-surface-subtle);border-radius:var(--uds-border-radius-container-md);">' +
        '<h3 style="font-family:var(--uds-font-family);font-size:var(--uds-font-size-lg);font-weight:var(--uds-font-weight-bold);color:var(--uds-color-text-primary);margin:0 0 16px;">' +
        formHeading +
        '</h3>' +
        '<div style="display:flex;flex-direction:column;gap:16px;">' +
        formFields.join('') +
        '</div></div>',
    );
  }

  if (has(components, 'badge') && !has(components, 'data-table') && t['badge']) {
    mainContent.push('<div style="margin-top:16px;">' + t['badge'] + '</div>');
  }
  if (has(components, 'icon-wrapper') && t['icon-wrapper']) {
    mainContent.push('<div style="margin-top:16px;">' + t['icon-wrapper'] + '</div>');
  }
  if (has(components, 'spacer') && mainContent.length > 0 && t['spacer']) {
    mainContent.push(t['spacer']);
  }
  if (has(components, 'dialog') && t['dialog']) {
    mainContent.push('<div style="margin-top:16px;">' + t['dialog'] + '</div>');
  }
  if (has(components, 'tooltip') && t['tooltip']) {
    mainContent.push('<div style="margin-top:16px;">' + t['tooltip'] + '</div>');
  }
  if (has(components, 'list') && !has(components, 'nav-vertical') && t['list']) {
    mainContent.push('<div style="margin-top:16px;">' + t['list'] + '</div>');
  }

  const mainHtml = mainContent.join('\n');

  if (useShell) {
    let shell = '<div style="display:flex;min-height:calc(100vh - 76px);">';
    if (has(components, 'nav-vertical') && t['nav-vertical']) {
      shell +=
        '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;">' +
        t['nav-vertical'] +
        '</div>';
    } else if (has(components, 'list') && t['list']) {
      shell +=
        '<div style="border-right:1px solid var(--uds-color-border-secondary);padding:16px 0;flex-shrink:0;width:260px;">' +
        t['list'] +
        '</div>';
    }
    shell +=
      '<div style="flex:1;padding:24px;overflow-y:auto;">' + mainHtml + '</div></div>';
    sections.push(shell);
  } else {
    sections.push(
      '<div style="max-width:1000px;margin:0 auto;padding:32px 24px;">' +
        mainHtml +
        '</div>',
    );
  }

  return sections.join('\n');
}

// ---------------------------------------------------------------------------
// assembleHTMLBody — async wrapper. Chunk 12b passes the real
// `fetchExampleHTML` from `lib/examples-renderer` (after wiring it for
// raw fetches that skip canonical substitution); tests inject a mock.
// ---------------------------------------------------------------------------

export interface FetchRawExampleFn {
  (componentId: string): Promise<string | null>;
}

export interface AssembleOptions {
  pool?: SubstitutionPool;
  fetchRawExample: FetchRawExampleFn;
}

export async function assembleHTMLBody(
  components: ReadonlyArray<string>,
  options: AssembleOptions,
): Promise<string> {
  const { pool = RANDOM_POOL, fetchRawExample } = options;
  const fetched: ExampleMap = {};
  await Promise.all(
    components.map(async (cid) => {
      const raw = await fetchRawExample(cid).catch(() => null);
      fetched[cid] = raw ? applyRandomSubstitution(raw, pool) : '';
    }),
  );
  return composeHTMLBody(fetched, components, pool);
}
