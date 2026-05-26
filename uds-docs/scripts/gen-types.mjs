#!/usr/bin/env node
// Compiles every UDS JSON schema into a single types/uds.ts.
//
// Run via `npm run gen:types` after editing any uds/schemas/*.schema.json.
// The output file is committed so consumers don't have to run this script
// just to typecheck.
//
// Why a script (not just the json2ts CLI): the CLI emits one file per schema
// and uses the schema `title` as the interface name (which produces verbose
// names like `UDSComponentSpecSchema`). This script consolidates everything
// into one types module and uses tighter, ergonomic names that match how the
// data loaders refer to each shape.

import { compile } from 'json-schema-to-typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const ROOT = process.cwd();
const SCHEMAS_DIR = resolve(ROOT, 'uds/schemas');
const OUTPUT = resolve(ROOT, 'types/uds.ts');

// Schemas in the order they appear in the generated file (related shapes
// grouped together). The exported interface name comes from each schema's
// `title` field (json-schema-to-typescript convention) — for our schemas
// that yields names like UDSComponentSpecSchema, UDSComponentStatus, etc.
// `lib/uds-data.ts` re-exports those with shorter, ergonomic aliases.
const SCHEMAS = [
  'version.schema.json',
  'components-manifest.schema.json',
  'spec.schema.json',
  'status.schema.json',
  'changelog.schema.json',
  'impl.schema.json',
  'manifest.schema.json',
  'figmanotes.schema.json',
];

const HEADER = `// AUTO-GENERATED — do not edit by hand.
//
// Run \`npm run gen:types\` to regenerate from uds/schemas/*.schema.json.
// Source schemas: ${SCHEMAS.join(', ')}
//
// The pure data loaders in lib/uds-data.ts re-export these with shorter
// aliases as the public surface of the UDS data layer; consumer code
// should import from there, not from this file directly.
`;

const COMPILE_OPTIONS = {
  bannerComment: '',
  style: {
    singleQuote: true,
    semi: true,
    printWidth: 100,
  },
  // Schemas don't define every nested object exhaustively (some spec fields are
  // free-form catch-alls); tolerating additional properties matches the
  // permissive behavior the renderer already assumes.
  additionalProperties: true,
  // Generate enums as union types of literals (cleaner TS output, no const
  // enum baggage).
  enableConstEnums: false,
};

async function main() {
  await mkdir(dirname(OUTPUT), { recursive: true });

  const sections = [HEADER];

  for (const file of SCHEMAS) {
    const schemaPath = resolve(SCHEMAS_DIR, file);
    const raw = await readFile(schemaPath, 'utf8');
    const schema = JSON.parse(raw);

    // The second arg is a fallback name if schema.title is absent; for our
    // schemas the title is always present and wins, so this string is only
    // a last-resort label.
    const ts = await compile(schema, file, COMPILE_OPTIONS);

    sections.push(
      `\n// ============================================================================\n// ${file}\n// ============================================================================\n\n${ts.trim()}\n`,
    );
  }

  const output = sections.join('');
  await writeFile(OUTPUT, output, 'utf8');
  console.log(`[gen-types] wrote ${OUTPUT} (${SCHEMAS.length} schemas).`);
}

main().catch((err) => {
  console.error('[gen-types] FATAL:', err);
  process.exit(1);
});
