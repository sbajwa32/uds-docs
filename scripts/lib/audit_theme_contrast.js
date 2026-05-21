// scripts/lib/audit_theme_contrast.js
//
// Multi-theme accessibility audit. Drives a headless Chrome via CDP across
// the 6 supported UDS theme combinations and runs axe-core on each. Exits
// non-zero if any violations exist for color-contrast, aria-allowed-attr,
// or aria-required-children across the representative page set.
//
// Designed to be invoked by `scripts/audit-theme-contrast.sh` and from
// `.github/workflows/audits.yml`. The CI environment is responsible for
// starting the docs server (`python3 -m http.server 4000` from
// uds-docs/) and headless Chrome with `--remote-debugging-port=9332`
// before this script runs.
//
// To run locally:
//   cd uds-docs && python3 -m http.server 4000 &
//   google-chrome --headless --disable-gpu --no-sandbox \
//                 --user-data-dir=/tmp/cdp-audit \
//                 --remote-debugging-port=9332 \
//                 --disable-application-cache \
//                 http://localhost:4000/
//   bash scripts/audit-theme-contrast.sh

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const AXE_PATH = path.join(REPO_ROOT, 'node_modules', 'axe-core', 'axe.min.js');

if (!fs.existsSync(AXE_PATH)) {
  console.error(`ERROR: axe-core not found at ${AXE_PATH}`);
  console.error('  Run: npm install --no-save axe-core ws');
  process.exit(1);
}
const axeSrc = fs.readFileSync(AXE_PATH, 'utf8');

const PORT = parseInt(process.env.CDP_PORT || '9332', 10);
const SERVER_URL = process.env.UDS_DOCS_URL || 'http://localhost:4000/';

const THEMES = [
  ['Base Light',       '',           'light'],
  ['Base Dark',        '',           'dark'],
  ['ResMan Light',     'resman',     'light'],
  ['ResMan Dark',      'resman',     'dark'],
  ['AnyoneHome Light', 'anyonehome', 'light'],
  ['Inhabit Light',    'inhabit',    'light'],
];

// Representative page set — one of each kind: changelog (data-heavy),
// about (component lifecycle status pills), button (accent buttons),
// data-table (rich data), nav-header (chrome), token-page (semantic-colors
// fragment), archive-view (?uds=0.2 path).
const PAGES = [
  ['changelog',         `${SERVER_URL}#/changelog`],
  ['about',             `${SERVER_URL}#/about`],
  ['button',            `${SERVER_URL}#/button`],
  ['data-table',        `${SERVER_URL}#/data-table`],
  ['nav-header',        `${SERVER_URL}#/nav-header`],
  ['semantic-colors',   `${SERVER_URL}#/semantic-colors`],
  ['archive-changelog', `${SERVER_URL}?uds=0.2#/changelog`],
];

const RULES = ['color-contrast', 'aria-allowed-attr', 'aria-required-children'];

let targetWs;
try {
  const targets = await fetch(`http://localhost:${PORT}/json`).then(r => r.json());
  const target = targets.find(t => t.url.includes(SERVER_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')));
  if (!target) throw new Error('no docs target found');
  targetWs = target.webSocketDebuggerUrl;
} catch (e) {
  console.error(`ERROR: cannot reach Chrome DevTools at port ${PORT}: ${e.message}`);
  console.error('  Start headless Chrome with --remote-debugging-port=' + PORT);
  process.exit(1);
}

const WS = (await import('ws')).default;
const ws = new WS(targetWs);
let id = 1;
const pending = {};
ws.on('message', d => { const m = JSON.parse(d); if (m.id != null && pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; } });
const send = (m, p) => new Promise(r => { const i = id++; pending[i] = r; ws.send(JSON.stringify({ id: i, method: m, params: p })); });
await new Promise(r => ws.once('open', r));
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Runtime.enable');

const totalsByTheme = {};
let grandTotal = 0;
const allFailures = [];

for (const [themeName, brand, scheme] of THEMES) {
  let nodesForTheme = 0;
  for (const [pageLabel, url] of PAGES) {
    await send('Page.navigate', { url: `${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}` });
    // Phase 17: 5500ms gives lazy fragments (token pages, page-load hooks)
    // time to settle before axe scans. With shorter waits axe sometimes
    // flagged transient sg-page-tabs states where role="tab" hadn't yet
    // been parsed.
    await new Promise(r => setTimeout(r, 5500));
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', '${brand}');
        document.documentElement.setAttribute('data-color-scheme', '${scheme}');
      })()`
    });
    await new Promise(r => setTimeout(r, 800));
    await send('Runtime.evaluate', { expression: axeSrc });
    const r = await send('Runtime.evaluate', {
      expression: `(async () => {
        const result = await axe.run(document, { runOnly: ${JSON.stringify(RULES)} });
        return JSON.stringify(result.violations.map(v => ({
          id: v.id,
          nodes: v.nodes.map(n => ({
            target: n.target.join(' ').slice(0, 100),
            failure: (n.failureSummary || '').replace(/\\n/g, ' | ').slice(0, 200)
          }))
        })));
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    const violations = JSON.parse(r.result.value || '[]');
    for (const v of violations) {
      for (const n of v.nodes) {
        nodesForTheme++;
        grandTotal++;
        allFailures.push({ theme: themeName, page: pageLabel, rule: v.id, target: n.target, failure: n.failure });
      }
    }
  }
  totalsByTheme[themeName] = nodesForTheme;
  console.log(`  ${themeName.padEnd(22)} ${nodesForTheme} nodes`);
}

ws.close();

console.log('');
if (grandTotal === 0) {
  console.log('OK — all 6 themes pass color-contrast + aria-allowed-attr + aria-required-children');
  process.exit(0);
}

console.log(`FAIL — ${grandTotal} violations across all themes:`);
for (const f of allFailures.slice(0, 20)) {
  console.log(`  [${f.theme}/${f.page}] ${f.rule}: ${f.target}`);
  console.log(`    ${f.failure}`);
}
if (allFailures.length > 20) {
  console.log(`  ... and ${allFailures.length - 20} more`);
}
process.exit(1);
