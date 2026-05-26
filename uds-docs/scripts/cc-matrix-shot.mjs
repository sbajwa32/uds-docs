#!/usr/bin/env node
// Single shot of Contrast Checker after switching to matrix view.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
const SERVE_PORT = 4095;
const CDP_PORT = 9395;
const OUT_ROOT = new URL('../out/', import.meta.url);
const procs = [];
function spawnTracked(c, a, o = {}) { const p = spawn(c, a, { stdio: 'pipe', detached: true, ...o }); procs.push(p); return p; }
function cleanup() { for (const p of procs) { if (p?.pid && !p.killed) try { process.kill(-p.pid, 'SIGKILL'); } catch {} } }
process.on('exit', cleanup);
async function waitForPort(port, url) { for (let i = 0; i < 60; i++) { try { const r = await fetch(url); if (r.ok || r.status === 404 || r.status === 200) return; } catch {} await sleep(250); } throw new Error('Timeout'); }
async function main() {
  spawnTracked('npx', ['serve', '-l', String(SERVE_PORT), '--no-clipboard', '--no-port-switching', OUT_ROOT.pathname]);
  await waitForPort(SERVE_PORT, `http://localhost:${SERVE_PORT}/`);
  const userDataDir = `/tmp/cc-shot-chrome-${Date.now()}`;
  spawnTracked('google-chrome', ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1600,2400', `--user-data-dir=${userDataDir}`, `--remote-debugging-port=${CDP_PORT}`, `http://localhost:${SERVE_PORT}/contrast-checker`]);
  await waitForPort(CDP_PORT, `http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);
  const target = (await (await fetch(`http://localhost:${CDP_PORT}/json`)).json()).find(t => (t.url||'').includes(`localhost:${SERVE_PORT}`));
  const WebSocket = (await import('ws')).default;
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
  let id = 1; const pending = new Map();
  ws.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.id && pending.has(m.id)) { const { resolve } = pending.get(m.id); pending.delete(m.id); resolve(m.result || m.error); } });
  function send(method, params = {}) { return new Promise((res) => { const i = id++; pending.set(i, { resolve: res }); ws.send(JSON.stringify({ id: i, method, params })); }); }
  await send('Page.enable'); await send('Runtime.enable');
  await sleep(3000);
  await send('Runtime.evaluate', { expression: `document.querySelector('[data-cc-view="matrix"]')?.click()` });
  await sleep(1500);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) writeFileSync('/tmp/cc-matrix.png', Buffer.from(shot.data, 'base64'));
  console.log('done');
  ws.close();
}
setTimeout(() => { cleanup(); process.exit(2); }, 60_000).unref();
main().then(() => { cleanup(); process.exit(0); }).catch((e) => { console.error(e.message); cleanup(); process.exit(1); });
