// Demo Builder HTML generator. Combines the Chunk 12a assembler with the
// head/body wrapper (theme attrs, font links, UDS CSS/JS) so the output
// is a complete, standalone HTML document.
//
// Direct port of `generateDemoHTML` + `baseHead` from
// docs/modules/demo-builder/index.js.
//
// Asset paths: the generated HTML references UDS CSS / JS as
// absolute-origin URLs (`https://host/uds/uds.css`). This matches the
// legacy behavior — a user who saves the HTML standalone and opens it
// can still load the runtime from the same deploy. Downloaded ZIPs
// re-write paths to the relative `uds/...` bundle layout via
// `lib/demo-builder/zip.ts`.

import { reseedRandom } from './rng';
import { WEB_COMPONENT_EXAMPLES } from '@/data/web-component-examples';
import { assembleHTMLBody, type FetchRawExampleFn } from './assembler';
import { RANDOM_POOL } from './data-pools';
import { applyRandomSubstitution } from './substitution';

export interface GenerateDemoOptions {
  seed?: number;
  origin?: string;
  themeAttrs?: Record<string, string>;
  /** Override the raw example fetcher (useful in tests / archive views). */
  fetchRawExample?: FetchRawExampleFn;
  /** If false, asset URLs are written as `./uds/...` rather than absolute
   *  origin paths. Used by the ZIP builder so the downloaded HTML works
   *  when extracted locally. */
  absoluteAssets?: boolean;
}

function getCurrentOrigin(): string {
  if (typeof window === 'undefined' || !window.location) return '';
  return window.location.origin;
}

function getCurrentThemeAttrs(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const html = document.documentElement;
  const out: Record<string, string> = {};
  for (const key of [
    'data-color-scheme',
    'data-theme',
    'data-font',
    'data-font-scale',
    'data-density',
  ]) {
    const v = html.getAttribute(key);
    if (v) out[key] = v;
  }
  return out;
}

function themeAttrString(attrs: Record<string, string>): string {
  return Object.keys(attrs)
    .map((k) => ` ${k}="${attrs[k]}"`)
    .join('');
}

function baseHead(
  title: string,
  attrs: Record<string, string>,
  udsBase: string,
  webComponentsSrc: string,
): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="en"' + themeAttrString(attrs) + '>',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>' + title + '</title>',
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lexend:wght@400;500;700&display=swap" rel="stylesheet" />',
    '  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />',
    '  <link rel="stylesheet" href="' + udsBase + '/uds.css" />',
    '  <style>',
    '    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
    '    body { font-family: var(--uds-font-family); background: var(--uds-color-surface-page-main); color: var(--uds-color-text-primary); }',
    '  </style>',
    '  <script type="module" src="' + webComponentsSrc + '"></script>',
    '</head>',
    '',
  ].join('\n');
}

/**
 * Default fetcher — uses the same /uds/components/<id>/examples/manifest.json
 * + per-variant file fetch that lib/examples-renderer.ts uses, but skips
 * canonical substitution so the assembler can apply random substitution.
 *
 * Implementation note: rather than weave a "substitute=false" flag into
 * examples-renderer, we re-do the fetch inline here. Both code paths walk
 * the same files so there's no drift risk.
 */
async function defaultFetchRawExample(componentId: string): Promise<string | null> {
  const webComponentExample = WEB_COMPONENT_EXAMPLES[componentId]?.[0];
  if (webComponentExample) return webComponentExample.html;

  try {
    const manifestUrl = `./uds/components/${componentId}/examples/manifest.json`;
    const manifestRes = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!manifestRes.ok) return null;
    const manifest = (await manifestRes.json()) as {
      examples?: Array<{ id: string; file: string; demoWeight?: number; showInDocs?: boolean }>;
    };
    const examples = manifest.examples || [];
    // Demo Builder weights variants by `demoWeight`. We pick the highest-weight
    // variant for deterministic ordering — the legacy code did a weighted
    // random pick but with the seeded RNG, this gets called inside the
    // build's seeded scope anyway. Picking by weight keeps the behavior
    // stable while still respecting the manifest's "preferred" entry.
    const eligible = examples.filter((e) => (e.demoWeight || 0) > 0);
    const pickList = eligible.length ? eligible : examples;
    if (!pickList.length) return null;
    const sorted = [...pickList].sort((a, b) => (b.demoWeight || 0) - (a.demoWeight || 0));
    const chosen = sorted[0];
    const fileRes = await fetch(
      `./uds/components/${componentId}/examples/${chosen.file}`,
      { cache: 'no-cache' },
    );
    if (!fileRes.ok) return null;
    return await fileRes.text();
  } catch {
    return null;
  }
}

export async function generateDemoHTML(
  components: ReadonlyArray<string>,
  opts: GenerateDemoOptions = {},
): Promise<string> {
  // Reseed once at the top of each build. Inside the build the seed stays
  // put so the same tenant in the table also gets the same balance in
  // their tooltip, etc. (Same pattern as legacy.)
  reseedRandom(opts.seed != null ? opts.seed : (Date.now() ^ Math.floor(Math.random() * 1e9)) | 0);

  const origin = opts.origin ?? getCurrentOrigin();
  const themeAttrs = opts.themeAttrs ?? getCurrentThemeAttrs();
  const absolute = opts.absoluteAssets ?? true;
  const udsBase = absolute ? `${origin}/uds` : './uds';
  const webComponentsSrc = absolute ? `${origin}/web-components.js` : './web-components.js';
  const fetchFn = opts.fetchRawExample ?? defaultFetchRawExample;

  const body = await assembleHTMLBody(components, {
    pool: RANDOM_POOL,
    fetchRawExample: fetchFn,
  });

  return (
    baseHead('UDS Demo — HTML', themeAttrs, udsBase, webComponentsSrc) +
    '<body>\n' +
    body +
    '\n</body>\n</html>'
  );
}

// Helper exported for tests / Code-tab parity checks: lets a caller
// substitute random tokens into an HTML string without going through the
// full assembler.
export function previewRandomSubstitution(html: string): string {
  return applyRandomSubstitution(html);
}
