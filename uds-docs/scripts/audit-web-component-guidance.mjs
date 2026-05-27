import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const files = [
  'ai-context.json',
  'uds-design-system.mdc',
  'data/web-component-examples.ts',
  'app/(site)/getting-started/page.tsx',
  'app/(site)/recipes/page.tsx',
  'app/(site)/templates/page.tsx',
  'app/(site)/design-language/page.tsx',
  'app/(site)/ai-assist/AiAssistClient.tsx',
  'app/(site)/[componentId]/ExamplesTab.tsx',
  'app/(site)/[componentId]/CodeTab.tsx',
  'components/site/Playground.tsx',
];

const banned = [
  /<[^>]+\sclass=["']udc-/,
  /class=\\["']udc-/,
  /\budc-button-(primary|secondary|ghost)\b/,
  /\buds-core\b/,
  /@uds\/components\b/,
  /BEM-style/i,
  /vanilla HTML/i,
];

const allowedLineFragments = [
  'className="',
  "className='",
  'className={',
  'class-based',
  'old class-based',
  'current class-based',
];

const findings = [];

for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (allowedLineFragments.some((fragment) => line.includes(fragment))) return;
    for (const pattern of banned) {
      if (pattern.test(line)) {
        findings.push(`${file}:${index + 1}: ${line.trim()}`);
        break;
      }
    }
  });
}

if (findings.length > 0) {
  console.error('Class-based UDS guidance found in Web Component public guidance files:\n');
  console.error(findings.join('\n'));
  process.exit(1);
}

console.log('Web Component guidance audit passed.');
