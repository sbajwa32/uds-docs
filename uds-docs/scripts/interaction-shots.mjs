#!/usr/bin/env node
// Quick screenshots of specific interactions.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
const SERVE_PORT = 4094;
const CDP_PORT = 9394;
const OUT_DIR = '/tmp/interaction-shots';
const OUT_ROOT = new URL('../out/', import.meta.url);
mkdirSync(OUT_DIR, { recursive: true });
const procs = [];
function spawnTracked(c, a, o = {}) { const p = spawn(c, a, { stdio: 'pipe', detached: true, ...o }); procs.push(p); return p; }
function cleanup() { for (const p of procs) { if (p?.pid && !p.killed) try { process.kill(-p.pid, 'SIGKILL'); } catch {} } }
process.on('exit', cleanup);
async function waitForPort(port, url) { for (let i = 0; i < 60; i++) { try { const r = await fetch(url); if (r.ok || r.status === 404 || r.status === 200) return; } catch {} await sleep(250); } throw new Error('Timeout'); }
async function main() {
  spawnTracked('npx', ['serve', '-l', String(SERVE_PORT), '--no-clipboard', '--no-port-switching', OUT_ROOT.pathname]);
  await waitForPort(SERVE_PORT, `http://localhost:${SERVE_PORT}/`);
  const userDataDir = `/tmp/interaction-chrome-${Date.now()}`;
  spawnTracked('google-chrome', ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1400,1200', `--user-data-dir=${userDataDir}`, `--remote-debugging-port=${CDP_PORT}`, `http://localhost:${SERVE_PORT}/`]);
  await waitForPort(CDP_PORT, `http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);
  const target = (await (await fetch(`http://localhost:${CDP_PORT}/json`)).json()).find(t => (t.url||'').includes(`localhost:${SERVE_PORT}`));
  const WebSocket = (await import('ws')).default;
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
  let id = 1; const pending = new Map();
  ws.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.id && pending.has(m.id)) { const { resolve } = pending.get(m.id); pending.delete(m.id); resolve(m.result || m.error); } });
  function send(method, params = {}) { return new Promise((res) => { const i = id++; pending.set(i, { resolve: res }); ws.send(JSON.stringify({ id: i, method, params })); }); }
  async function shoot(name) { await sleep(800); const s = await send('Page.captureScreenshot', { format: 'png' }); if (s?.data) writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(s.data, 'base64')); }
  await send('Page.enable'); await send('Runtime.enable');

  // 1. Examples "Show code" expanded.
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2500);
  await send('Runtime.evaluate', { expression: `document.querySelectorAll('.sg-example-code')[0]?.setAttribute('open', '')` });
  await shoot('01-show-code-expanded');

  // 2. Demo Builder preview overlay.
  await send('Runtime.evaluate', { expression: `document.querySelector('.sg-demo-btn').click()` });
  await sleep(500);
  // Limit components to a small set for fast preview
  await send('Runtime.evaluate', { expression: `
    document.querySelector('.sg-demo-select-link').click();
    const keep = new Set(['button', 'breadcrumb', 'badge']);
    document.querySelectorAll('.sg-demo-grid input[type=checkbox]').forEach((cb) => {
      const want = keep.has(cb.getAttribute('data-demo-comp'));
      if (cb.checked !== want) cb.click();
    });
  ` });
  await sleep(400);
  const buttons = await send('Runtime.evaluate', { expression: `Array.from(document.querySelectorAll('.sg-demo-dialog .udc-dialog__footer button')).find(b => /preview/i.test(b.textContent)).click()` });
  // wait for overlay to appear
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const r = await send('Runtime.evaluate', { expression: `!!document.querySelector('.sg-demo-overlay')`, returnByValue: true });
    if (r?.result?.value) break;
  }
  await sleep(1000);
  await shoot('02-demo-builder-overlay');

  // 3. Dropdown page — the trigger looks odd in the first sweep.
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/dropdown` });
  await sleep(2200);
  await shoot('03-dropdown-page');

  // 4. Dark contrast-checker matrix
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/contrast-checker` });
  await sleep(2500);
  await send('Runtime.evaluate', { expression: `
    Array.from(document.querySelectorAll('.sg-theme-bar button')).find(b => b.textContent.trim() === 'Dark')?.click()
  ` });
  await sleep(800);
  await send('Runtime.evaluate', { expression: `document.querySelector('[data-cc-view="matrix"]')?.click()` });
  await shoot('04-dark-cc-matrix');

  // 5. Smaller font scale + Comfortable density on button
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2200);
  await send('Runtime.evaluate', { expression: `
    Array.from(document.querySelectorAll('.sg-theme-bar button')).find(b => b.textContent.trim() === 'Smaller')?.click()
  ` });
  await sleep(400);
  await send('Runtime.evaluate', { expression: `
    Array.from(document.querySelectorAll('.sg-theme-bar button')).find(b => b.textContent.trim() === 'Comfortable')?.click()
  ` });
  await shoot('05-smaller-comfortable-button');

  // 6. Token search after typing
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2000);
  await send('Runtime.evaluate', { expression: `document.querySelector('.sg-header-search-trigger').click()` });
  await sleep(500);
  await send('Runtime.evaluate', { expression: `
    const input = document.getElementById('sg-token-search-input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'space');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  ` });
  await shoot('06-token-search-typed');

  console.log('done');
  ws.close();
}
setTimeout(() => { cleanup(); process.exit(2); }, 120_000).unref();
main().then(() => { cleanup(); process.exit(0); }).catch((e) => { console.error(e.message); cleanup(); process.exit(1); });
