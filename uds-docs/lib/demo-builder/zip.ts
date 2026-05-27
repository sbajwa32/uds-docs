// ZIP download for the Demo Builder. Bundles the generated demo HTML
// + the runnable UDS payload (tokens + per-component CSS/JS) at `uds/`.
//
// Direct port of `downloadDemoProject` from docs/modules/demo-builder/zip.js.
// The file list was hand-curated in the legacy module (UDS_FILES); we
// preserve that here. Chunk 17 will revisit whether to walk
// `uds/components/` dynamically.

import type JSZipType from 'jszip';

import { generateDemoHTML } from './generate-html';

// JSZip is lazy-loaded the first time the user clicks Download. It's
// ~95 KB minified and not used on first paint — keeping it out of the
// initial bundle saves that weight from every page load.
let cachedJsZip: typeof JSZipType | null = null;
async function loadJSZip(): Promise<typeof JSZipType> {
  if (cachedJsZip) return cachedJsZip;
  const mod = await import('jszip');
  cachedJsZip = mod.default;
  return cachedJsZip;
}

const UDS_FILES: ReadonlyArray<string> = [
  'uds.css',
  'uds.js',
  'tokens/primitives.css',
  'tokens/semantic.css',
  'tokens/text-styles.css',
  'components/button.css',
  'components/text-input.css',
  'components/text-input.js',
  'components/checkbox.css',
  'components/checkbox.js',
  'components/radio.css',
  'components/badge.css',
  'components/divider.css',
  'components/icon-wrapper.css',
  'components/spacer.css',
  'components/breadcrumb.css',
  'components/tab-horizontal.css',
  'components/tabs.js',
  'components/dropdown.css',
  'components/dropdown.js',
  'components/nav-header.css',
  'components/nav-header.js',
  'components/nav-vertical.css',
  'components/nav-vertical.js',
  'components/notification.css',
  'components/notification.js',
  'components/dialog.css',
  'components/dialog.js',
  'components/tile.css',
  'components/tile.js',
  'components/list.css',
  'components/list.js',
  'components/data-table.css',
  'components/data-table.js',
  'components/chip.css',
  'components/chip.js',
  'components/search.css',
  'components/search.js',
  'components/tooltip.css',
];

async function bundleWebComponentsBundle(zip: JSZipType, origin: string): Promise<void> {
  try {
    const res = await fetch(`${origin}/web-components.js`);
    if (!res.ok) return;
    zip.file('web-components.js', await res.text());
  } catch {
    // Preview/download still contains semantic tokens even if the bundle is
    // missing in a local dev session; production builds publish this file.
  }
}

async function bundleUdsFiles(zip: JSZipType, prefix: string, origin: string): Promise<void> {
  await Promise.all(
    UDS_FILES.map(async (f) => {
      try {
        const res = await fetch(`${origin}/uds/${f}`);
        if (!res.ok) return;
        const text = await res.text();
        zip.file(prefix + f, text);
      } catch {
        // Skip files that don't resolve (matches legacy behavior — the
        // hand-curated list can drift ahead of reality and we don't
        // want one missing file to abort the whole download).
      }
    }),
  );
}

/**
 * Bundle just the UDS payload (tokens + per-component CSS/JS) into a
 * single zip, no demo HTML wrapper. Used by the Getting Started
 * "Download UDS (.zip)" button.
 */
export async function downloadUdsBundle(
  origin: string,
  filename: string = 'uds.zip',
): Promise<{ filename: string; sizeKB: number }> {
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  await bundleUdsFiles(zip, '', origin);
  await bundleWebComponentsBundle(zip, origin);
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { filename, sizeKB: Math.round(blob.size / 1024) };
}

export interface DownloadOptions {
  components: ReadonlyArray<string>;
  origin: string;
  themeAttrs: Record<string, string>;
  filename?: string;
}

/**
 * Builds the demo HTML, bundles it with the UDS payload at `uds/`, and
 * triggers a browser download. Resolves when the download has been
 * initiated (the actual file save is the browser's job).
 *
 * The downloaded HTML uses RELATIVE paths (`./uds/...`) so the bundle
 * works locally when extracted — the user double-clicks `index.html` and
 * the runtime loads from the sibling `uds/` folder.
 */
export async function downloadDemoProject(
  options: DownloadOptions,
): Promise<{ filename: string; sizeKB: number }> {
  const { components, origin, themeAttrs, filename = 'demo-html.zip' } = options;
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  const html = await generateDemoHTML(components, {
    origin,
    themeAttrs,
    absoluteAssets: false,
  });
  zip.file('index.html', html);
  await bundleUdsFiles(zip, 'uds/', origin);
  await bundleWebComponentsBundle(zip, origin);
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { filename, sizeKB: Math.round(blob.size / 1024) };
}
