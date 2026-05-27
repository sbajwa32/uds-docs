#!/usr/bin/env node

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const examplesPath = resolve(ROOT, 'data/web-component-examples.ts');
const source = await readFile(examplesPath, 'utf8');

const entryRe =
  /^  ['"]?([a-z0-9-]+)['"]?: \[\n    \{\n      id: '([^']+)',\n      label: '([^']+)',\n      description: '([^']*)',\n      html: `([\s\S]*?)`,\n    \},\n  \],/gm;

const entries = [];
let match;
while ((match = entryRe.exec(source))) {
  entries.push({
    componentId: match[1],
    id: match[2],
    label: match[3],
    description: match[4],
    html: match[5].trim(),
  });
}

if (entries.length < 20) {
  throw new Error(`Expected the full component inventory, found ${entries.length} entries.`);
}

function htmlDocument(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
  <link rel="stylesheet" href="uds/uds.css" />
  <script type="module" src="web-components.js"></script>
  <title>${title}</title>
</head>
<body>
${body}
</body>
</html>
`;
}

function playgroundModule(html) {
  const escaped = JSON.stringify(html);
  return `const html = ${escaped};

export default {
  controls: [],
  render() {
    return { html, code: html };
  },
};
`;
}

function implJson(componentId, html) {
  return {
    $schema: '../../schemas/impl.schema.json',
    jsFunc: null,
    jsFile: null,
    tokens: {
      Color: [
        '--uds-color-surface-main',
        '--uds-color-surface-subtle',
        '--uds-color-surface-interactive-default',
        '--uds-color-text-primary',
        '--uds-color-text-secondary',
        '--uds-color-text-interactive',
        '--uds-color-border-primary',
        '--uds-color-border-secondary',
        '--uds-color-border-outline-focus-visible',
      ],
      Font: ['--uds-font-family', '--uds-font-size-base', '--uds-font-weight-medium'],
      Space: ['--uds-space-100', '--uds-space-150', '--uds-space-200', '--uds-space-300'],
      Border: ['--uds-border-radius-input', '--uds-border-radius-container-md'],
    },
    html: htmlDocument(componentId, html).trim(),
  };
}

for (const entry of entries) {
  const base = resolve(ROOT, 'uds/components', entry.componentId);
  const examplesDir = resolve(base, 'examples');
  await mkdir(examplesDir, { recursive: true });

  await writeFile(resolve(examplesDir, 'web-component.html'), `${entry.html}\n`);
  await writeFile(
    resolve(examplesDir, 'manifest.json'),
    `${JSON.stringify(
      {
        $schema: '../../../schemas/manifest.schema.json',
        examples: [
          {
            id: 'web-component',
            file: 'web-component.html',
            label: entry.label,
            showInDocs: true,
            demoWeight: 3,
            description: entry.description,
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  // Only overwrite playground.js if it's the auto-generated stub (controls: []).
  // Hand-curated playgrounds with real controls take precedence.
  const playgroundPath = resolve(base, 'playground.js');
  let existing = '';
  try {
    existing = await readFile(playgroundPath, 'utf8');
  } catch {}
  const isStub = !existing || /controls:\s*\[\s*\]/m.test(existing);
  if (isStub) {
    await writeFile(playgroundPath, playgroundModule(entry.html));
  }

  await writeFile(resolve(base, 'impl.json'), `${JSON.stringify(implJson(entry.componentId, entry.html), null, 2)}\n`);
}

console.log(`Synced ${entries.length} component source payloads to Web Component examples.`);
