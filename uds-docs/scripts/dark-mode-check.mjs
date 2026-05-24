#!/usr/bin/env node
// Quick dark-mode pass — flip the theme provider to dark and screenshot
// every page. Catches stale token references, hardcoded colors,
// surface-on-surface contrast disasters.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4097;
const CDP_PORT = 9397;
const OUT_DIR = '/tmp/dark-mode-check';
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

const ROUTES = [
  ['home', '/semantic-colors'],
  ['contrast-checker', '/contrast-checker'],
  ['changelog', '/changelog'],
  ['design-language', '/design-language'],
  ['design-process', '/design-process'],
  ['cursor-workflows', '/cursor-workflows'],
  ['getting-started', '/getting-started'],
  ['component-button', '/button'],
  ['component-data-table', '/data-table'],
  ['component-dialog', '/dialog'],
  ['component-nav-header', '/nav-header'],
];

async function main() {
  const serveProc = spawnTracked('npx', ['serve', '-l', String(SERVE_PORT), '--no-clipboard', '--no-port-switching', OUT_ROOT.pathname]);
  serveProc.stderr.on('data', (d) => process.stderr.write(`[serve] ${d}`));
  await waitForPort(SERVE_PORT, `http://localhost:${SERVE_PORT}/`);

  const userDataDir = `/tmp/dark-chrome-${Date.now()}`;
  spawnTracked('google-chrome', ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1400,1000', `--user-data-dir=${userDataDir}`, `--remote-debugging-port=${CDP_PORT}`, `http://localhost:${SERVE_PORT}/`]);
  await waitForPort(CDP_PORT, `http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);

  const targets = await (await fetch(`http://localhost:${CDP_PORT}/json`)).json();
  const target = targets.find((t) => (t.url || '').includes(`localhost:${SERVE_PORT}`));
  const { default: WebSocket } = await import('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.once('open', res); ws.once('error', rej); });

  let nextId = 1;
  const pending = new Map();
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
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

  for (const [name, path] of ROUTES) {
    console.log(`[dark] ${name}`);
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}${path}` });
    await sleep(2000);
    // Flip to dark via the Theme bar's Dark button.
    await send('Runtime.evaluate', { expression: `
      (() => {
        const darkBtn = Array.from(document.querySelectorAll('.sg-theme-bar button'))
          .find(b => b.textContent.trim() === 'Dark');
        if (darkBtn) darkBtn.click();
      })()
    ` });
    await sleep(800);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(shot.data, 'base64'));
  }

  ws.close();
}

async function waitForPort(port, url) {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(url); if (r.ok || r.status === 404 || r.status === 200) return; } catch {}
    await sleep(250);
  }
  throw new Error(`Timeout: ${url}`);
}

setTimeout(() => { console.error('hard timeout'); cleanup(); process.exit(2); }, 180_000).unref();
main().then(() => { cleanup(); process.exit(0); }).catch((e) => { console.error('FAIL:', e.message); cleanup(); process.exit(1); });
