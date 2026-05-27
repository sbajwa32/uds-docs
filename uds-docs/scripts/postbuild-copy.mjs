#!/usr/bin/env node
// Copies the runtime-required UDS payload into the Next.js static-export output.
//
// Next.js with `output: 'export'` only emits the React app to `out/`. The docs site
// also fetches UDS data and assets from sibling folders (`uds/`, `versions/`),
// top-level runtime manifests, and AI-assist files; those are not part of the
// React build but must be served from the same origin. This script publishes them.
//
// Run from `uds-docs/` (the directory where `npm run build` runs). Wired as the
// `postbuild` npm script in package.json so it executes automatically after build.

import { cp, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, 'out');

const COPIES = [
  { src: 'uds', dest: 'out/uds', kind: 'dir', label: 'UDS design system payload' },
  { src: 'versions', dest: 'out/versions', kind: 'dir', label: 'UDS version archives' },
  { src: 'versions.json', dest: 'out/versions.json', kind: 'file', label: 'versions manifest' },
  { src: 'ai-context.json', dest: 'out/ai-context.json', kind: 'file', label: 'AI context JSON' },
  { src: 'uds-design-system.mdc', dest: 'out/uds-design-system.mdc', kind: 'file', label: 'Cursor rule download' },
  {
    src: 'packages/uds-web-components/dist/web-components.js',
    dest: 'out/web-components.js',
    kind: 'file',
    label: 'UDS Web Components browser bundle',
  },
];

// Each per-component `uds/components/<id>/playground.js` cartridge is
// self-contained — it defines its own `escAttr` / `escText` helpers
// inline, so no shared `esc.js` ship needs to be staged here.

async function main() {
  if (!existsSync(OUT_DIR)) {
    console.error(
      `[postbuild-copy] ERROR: ${OUT_DIR} does not exist. Run \`next build\` first.`,
    );
    process.exit(1);
  }

  for (const { src, dest, kind, label } of COPIES) {
    const absSrc = resolve(ROOT, src);
    const absDest = resolve(ROOT, dest);

    if (!existsSync(absSrc)) {
      console.error(`[postbuild-copy] ERROR: source ${absSrc} missing (${label}).`);
      process.exit(1);
    }

    const stats = await stat(absSrc);
    const sourceIsDir = stats.isDirectory();
    if ((kind === 'dir' && !sourceIsDir) || (kind === 'file' && sourceIsDir)) {
      console.error(
        `[postbuild-copy] ERROR: ${src} kind mismatch — expected ${kind}, got ${
          sourceIsDir ? 'directory' : 'file'
        }.`,
      );
      process.exit(1);
    }

    if (kind === 'dir') {
      await mkdir(absDest, { recursive: true });
      await cp(absSrc, absDest, { recursive: true, force: true, errorOnExist: false });
    } else {
      await cp(absSrc, absDest, { force: true });
    }

    console.log(`[postbuild-copy] copied ${src} → ${dest}  (${label})`);
  }

  console.log('[postbuild-copy] done.');
}

main().catch((err) => {
  console.error('[postbuild-copy] FATAL:', err);
  process.exit(1);
});
