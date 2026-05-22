#!/usr/bin/env node
// Capture screenshots of every page in the docs site via Chrome DevTools Protocol.
// Assumes the docs site is being served at http://localhost:4000.
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || '/tmp/uds-screenshots/current';
const PORT = 9300;

const PAGES = [
  '#/changelog',
  '#/getting-started',
  '#/ai-assist',
  '#/cursor-workflows',
  '#/semantic-colors',
  '#/primitive-colors',
  '#/text-styles',
  '#/spacing',
  '#/button',
  '#/link',
  '#/label',
  '#/text-input',
  '#/text-area',
  '#/checkbox',
  '#/radio',
  '#/dropdown',
  '#/combobox',
  '#/date-picker',
  '#/toggle',
  '#/search',
  '#/badge',
  '#/chip',
  '#/divider',
  '#/icon-wrapper',
  '#/spacer',
  '#/breadcrumb',
  '#/tabs',
  '#/pagination',
  '#/nav-header',
  '#/nav-vertical',
  '#/tile',
  '#/list',
  '#/data-table',
  '#/data-view',
  '#/notification',
  '#/dialog',
  '#/tooltip'
];

function nameFor(hash) {
  const id = hash.replace('#/', '');
  if (['changelog','getting-started','ai-assist','cursor-workflows'].includes(id)) {
    return id;
  }
  if (['semantic-colors','primitive-colors','text-styles','spacing'].includes(id)) {
    return 'tokens-' + id;
  }
  return 'comp-' + id;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Start headless Chrome
  try { execSync(`pkill -9 -f "chrome.*${PORT}" 2>/dev/null || true`); } catch (_) {}
  const userData = `/tmp/cdp-shots-${Date.now()}`;
  const chrome = spawn('google-chrome', [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${userData}`,
    `--remote-debugging-port=${PORT}`,
    '--window-size=1280,1600',
    'http://localhost:4000/'
  ], { stdio: 'ignore', detached: true });
  chrome.unref();

  // Wait for chrome to be ready
  let ready = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch(`http://localhost:${PORT}/json/version`);
      if (res.ok) { ready = true; break; }
    } catch (_) {}
  }
  if (!ready) { console.error('Chrome failed to start'); process.exit(1); }

  const targets = await fetch(`http://localhost:${PORT}/json`).then(r => r.json());
  const target = targets.find(t => t.url.includes('localhost:4000'));
  if (!target) { console.error('no target'); process.exit(1); }
  const WS = (await import('ws')).default;
  const ws = new WS(target.webSocketDebuggerUrl);
  let id = 1;
  const pending = {};
  ws.on('message', d => {
    const msg = JSON.parse(d);
    if (msg.id != null && pending[msg.id]) {
      pending[msg.id](msg.result);
      delete pending[msg.id];
    }
  });
  const send = (m, p) => new Promise(r => {
    const i = id++;
    pending[i] = r;
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
  await new Promise(r => ws.once('open', r));
  await send('Runtime.enable');

  for (const hash of PAGES) {
    const name = nameFor(hash);
    process.stdout.write(`  ${name}... `);
    await send('Page.navigate', { url: `http://localhost:4000/?cb=${Date.now()}${hash}` });
    await new Promise(r => setTimeout(r, 1500));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync(path.join(OUT_DIR, `${name}.png`), Buffer.from(shot.data, 'base64'));
      process.stdout.write('ok\n');
    } else {
      process.stdout.write('FAIL\n');
    }
  }

  ws.close();
  try { execSync(`pkill -9 -f "chrome.*${PORT}" 2>/dev/null || true`); } catch (_) {}
  console.log(`\nScreenshots saved to ${OUT_DIR}/ (${PAGES.length} pages)`);
  process.exit(0);
})();
