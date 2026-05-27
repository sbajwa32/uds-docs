// ZIP download for the Demo Builder. Bundles the generated demo HTML
// + the runnable UDS payload (tokens + `web-components.js`) at `uds/`.
//
// Post-Web-Components rewrite: per-component CSS lives inside each
// `<udc-*>` shadow DOM (compiled into `web-components.js`), so the ZIP
// only needs the token layer and the bundle. The pre-rewrite layout
// shipped 39 hand-curated per-component CSS + JS files; those don't
// exist any more.

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

// Files that always ship with a UDS download: the master CSS entrypoint
// + every token CSS file it imports. Component styling is in
// `web-components.js` (bundled separately via `bundleWebComponentsBundle`).
const UDS_FILES: ReadonlyArray<string> = [
  'uds.css',
  'tokens/primitives.css',
  'tokens/semantic.css',
  'tokens/layers.css',
  'tokens/text-styles.css',
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
