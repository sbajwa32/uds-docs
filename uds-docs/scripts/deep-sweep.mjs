#!/usr/bin/env node
// Deep visual sweep — every page, every theme, multiple viewports.
// Also catches console errors and network failures by URL.
//
// Output: /tmp/deep-sweep/<name>.png + a JSON summary.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4090;
const CDP_PORT = 9390;
const OUT_DIR = '/tmp/deep-sweep';
const OUT_ROOT = new URL('../out/', import.meta.url);

mkdirSync(OUT_DIR, { recursive: true });

const procs = [];
function spawnTracked(cmd, args, opts = {}) {
  const p = spawn(cmd, args, { stdio: 'pipe', detached: true, ...opts });
  procs.push(p);
  return p;
}
function cleanup() {
  for (const p of procs) {
    if (p?.pid && !p.killed) {
      try { process.kill(-p.pid, 'SIGKILL'); }
      catch { try { process.kill(p.pid, 'SIGKILL'); } catch {} }
    }
  }
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

// All 29 component pages + all content pages + state-variation pages.
const ALL_ROUTES = [
  ['00-home', '/'],
  ['01-changelog', '/changelog'],
  ['02-contrast-checker', '/contrast-checker'],
  ['03-cursor-workflows', '/cursor-workflows'],
  ['04-design-language', '/design-language'],
  ['05-design-process', '/design-process'],
  ['06-getting-started', '/getting-started'],
  ['07-ai-assist', '/ai-assist'],
  ['08-about', '/about'],
  ['09-recipes', '/recipes'],
  ['10-templates', '/templates'],
  ['11-semantic-colors', '/semantic-colors'],
  ['12-primitive-colors', '/primitive-colors'],
  ['13-text-styles', '/text-styles'],
  ['14-spacing', '/spacing'],
  // All 29 components
  ['c-badge', '/badge'],
  ['c-breadcrumb', '/breadcrumb'],
  ['c-button', '/button'],
  ['c-checkbox', '/checkbox'],
  ['c-chip', '/chip'],
  ['c-combobox', '/combobox'],
  ['c-data-table', '/data-table'],
  ['c-data-view', '/data-view'],
  ['c-date-picker', '/date-picker'],
  ['c-dialog', '/dialog'],
  ['c-divider', '/divider'],
  ['c-dropdown', '/dropdown'],
  ['c-icon-wrapper', '/icon-wrapper'],
  ['c-label', '/label'],
  ['c-link', '/link'],
  ['c-list', '/list'],
  ['c-nav-header', '/nav-header'],
  ['c-nav-vertical', '/nav-vertical'],
  ['c-notification', '/notification'],
  ['c-pagination', '/pagination'],
  ['c-radio', '/radio'],
  ['c-search', '/search'],
  ['c-spacer', '/spacer'],
  ['c-tabs', '/tabs'],
  ['c-text-area', '/text-area'],
  ['c-text-input', '/text-input'],
  ['c-tile', '/tile'],
  ['c-toggle', '/toggle'],
  ['c-tooltip', '/tooltip'],
];

async function main() {
  const serveProc = spawnTracked('npx', ['serve', '-l', String(SERVE_PORT), '--no-clipboard', '--no-port-switching', OUT_ROOT.pathname]);
  serveProc.stderr.on('data', () => {});
  await waitForPort(SERVE_PORT, `http://localhost:${SERVE_PORT}/`);

  const userDataDir = `/tmp/deep-sweep-chrome-${Date.now()}`;
  spawnTracked('google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--window-size=1400,1000',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${CDP_PORT}`,
    `http://localhost:${SERVE_PORT}/`,
  ]);
  await waitForPort(CDP_PORT, `http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);

  const targets = await (await fetch(`http://localhost:${CDP_PORT}/json`)).json();
  const target = targets.find((t) => (t.url || '').includes(`localhost:${SERVE_PORT}`));
  const { default: WebSocket } = await import('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.once('open', res); ws.once('error', rej); });

  let nextId = 1;
  const pending = new Map();
  const consoleEvents = [];
  const networkFailures = [];

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
      consoleEvents.push({ type: msg.params.type, args: msg.params.args.map(a => a.value).join(' ').slice(0, 200) });
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleEvents.push({ type: 'exception', text: msg.params.exceptionDetails.exception?.description?.slice(0, 200) });
    }
    if (msg.method === 'Network.responseReceived') {
      const r = msg.params.response;
      if (r.status >= 400 && !r.url.includes('storybook')) {
        networkFailures.push({ url: r.url.replace(/^http:\/\/localhost:\d+/, ''), status: r.status });
      }
    }
  });
  function send(method, params = {}, t = 10000) {
    const id = nextId++;
    return new Promise((res, rej) => {
      const timer = setTimeout(() => { pending.delete(id); rej(new Error(`${method} timeout`)); }, t);
      pending.set(id, { resolve: (v) => { clearTimeout(timer); res(v); }, reject: (e) => { clearTimeout(timer); rej(e); } });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const findings = [];

  // Round 1: Light mode, default size, every page.
  console.log('=== ROUND 1: light mode, desktop (1400×1000) ===');
  for (const [name, path] of ALL_ROUTES) {
    consoleEvents.length = 0;
    const nfBefore = networkFailures.length;
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}${path}` });
    await sleep(2200);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(shot.data, 'base64'));
    const newConsole = consoleEvents.slice();
    const newNF = networkFailures.slice(nfBefore).filter(f => !f.url.includes('figmanotes.json'));
    if (newConsole.length || newNF.length) {
      findings.push({ name, path, console: newConsole, networkFailures: newNF });
    }
  }

  // Round 2: Dark mode on a sample of key pages.
  console.log('=== ROUND 2: dark mode ===');
  const DARK_SAMPLE = ['00-home', '01-changelog', '03-cursor-workflows', '06-getting-started', 'c-button', 'c-data-table', 'c-dialog', 'c-nav-header'];
  for (const targetName of DARK_SAMPLE) {
    const route = ALL_ROUTES.find(r => r[0] === targetName);
    if (!route) continue;
    const [name, path] = route;
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}${path}` });
    await sleep(1800);
    await send('Runtime.evaluate', { expression: `
      Array.from(document.querySelectorAll('.sg-theme-bar button')).find(b => b.textContent.trim() === 'Dark')?.click()
    ` });
    await sleep(700);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) writeFileSync(`${OUT_DIR}/dark-${name}.png`, Buffer.from(shot.data, 'base64'));
  }

  // Round 3: Mobile viewport.
  console.log('=== ROUND 3: mobile viewport (375×900) ===');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 900, deviceScaleFactor: 1, mobile: true });
  const MOBILE_SAMPLE = ['00-home', '06-getting-started', 'c-button', 'c-data-table'];
  for (const targetName of MOBILE_SAMPLE) {
    const route = ALL_ROUTES.find(r => r[0] === targetName);
    if (!route) continue;
    const [name, path] = route;
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}${path}` });
    await sleep(1800);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) writeFileSync(`${OUT_DIR}/mobile-${name}.png`, Buffer.from(shot.data, 'base64'));
  }
  await send('Emulation.clearDeviceMetricsOverride');

  // Round 4: Modals — open Token Search, Demo Builder.
  console.log('=== ROUND 4: modals ===');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(1500);
  await send('Runtime.evaluate', { expression: `document.querySelector('.sg-header-search-trigger')?.click()` });
  await sleep(600);
  const tsShot = await send('Page.captureScreenshot', { format: 'png' });
  if (tsShot?.data) writeFileSync(`${OUT_DIR}/modal-token-search.png`, Buffer.from(tsShot.data, 'base64'));

  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(1500);
  await send('Runtime.evaluate', { expression: `document.querySelector('.sg-demo-btn')?.click()` });
  await sleep(700);
  const dbShot = await send('Page.captureScreenshot', { format: 'png' });
  if (dbShot?.data) writeFileSync(`${OUT_DIR}/modal-demo-builder.png`, Buffer.from(dbShot.data, 'base64'));

  // Round 5: Brand themes (ResMan, AnyoneHome, Inhabit) on a key page.
  console.log('=== ROUND 5: brand themes ===');
  for (const brand of ['ResMan', 'AnyoneHome', 'Inhabit']) {
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
    await sleep(1500);
    await send('Runtime.evaluate', { expression: `
      Array.from(document.querySelectorAll('.sg-theme-bar button')).find(b => b.textContent.trim() === '${brand}')?.click()
    ` });
    await sleep(600);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) writeFileSync(`${OUT_DIR}/brand-${brand.toLowerCase()}-button.png`, Buffer.from(shot.data, 'base64'));
  }

  // Round 6: Archive view + components that may not exist in archive
  console.log('=== ROUND 6: archive view ===');
  for (const path of ['/button?uds=0.2', '/dropdown?uds=0.2', '/contrast-checker?uds=0.2']) {
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}${path}` });
    await sleep(2500);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const safeName = path.replace(/[\/?=]/g, '-');
    if (shot?.data) writeFileSync(`${OUT_DIR}/archive${safeName}.png`, Buffer.from(shot.data, 'base64'));
  }

  // Report
  console.log('');
  console.log('=== FINDINGS ===');
  if (findings.length === 0) {
    console.log('  (no console errors or non-figmanotes 404s)');
  } else {
    for (const f of findings) {
      console.log(`  ${f.name} (${f.path})`);
      for (const c of f.console) console.log(`    console-${c.type}: ${(c.text || c.args || '').slice(0, 120)}`);
      for (const n of f.networkFailures) console.log(`    net-${n.status}: ${n.url}`);
    }
  }
  console.log('');
  console.log(`Screenshots: ${OUT_DIR}/`);

  ws.close();
}

async function waitForPort(port, url) {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(url); if (r.ok || r.status === 404 || r.status === 200) return; } catch {}
    await sleep(250);
  }
  throw new Error(`Timeout: ${url}`);
}

setTimeout(() => { console.error('hard timeout'); cleanup(); process.exit(2); }, 360_000).unref();
main().then(() => { cleanup(); process.exit(0); }).catch((e) => { console.error('FAIL:', e.message); cleanup(); process.exit(1); });
