#!/usr/bin/env node
// Quick check: every component's Code tab renders something useful.
// Components with empty cssClasses (badge, link, tooltip, etc.) should
// either show rawCodeHtml or a friendly empty state — not a blank panel.

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4096;
const CDP_PORT = 9396;
const OUT_ROOT = new URL('../out/', import.meta.url);

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

const COMPONENTS = [
  'button', 'link', 'label', 'text-input', 'text-area', 'checkbox',
  'radio', 'dropdown', 'combobox', 'date-picker', 'toggle', 'search',
  'badge', 'chip', 'divider', 'icon-wrapper', 'spacer', 'breadcrumb',
  'tabs', 'nav-header', 'nav-vertical', 'pagination', 'tile', 'list',
  'data-table', 'data-view', 'notification', 'dialog', 'tooltip',
];

async function main() {
  const serveProc = spawnTracked('npx', ['serve', '-l', String(SERVE_PORT), '--no-clipboard', '--no-port-switching', OUT_ROOT.pathname]);
  serveProc.stderr.on('data', () => {});
  await waitForPort(SERVE_PORT, `http://localhost:${SERVE_PORT}/`);

  const userDataDir = `/tmp/code-tab-chrome-${Date.now()}`;
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
  async function evaluate(expr) {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { error: r.exceptionDetails.exception?.description };
    return { value: r.result.value };
  }

  await send('Page.enable');
  await send('Runtime.enable');

  for (const id of COMPONENTS) {
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/${id}` });
    await sleep(1500);
    await evaluate(`document.querySelector('.sg-page-tab[data-tab="code"]')?.click()`);
    await sleep(800);
    const state = await evaluate(`
      (() => {
        // Find the active code panel.
        const panels = Array.from(document.querySelectorAll('main > div, main section, .sg-tab-content, div[hidden="false"]'));
        const main = document.querySelector('main');
        const text = main ? main.innerText : '';
        // Heuristic: are there code blocks / tables on this page?
        const tables = document.querySelectorAll('.sg-api-table, .sg-gl-table').length;
        const pres = document.querySelectorAll('pre').length;
        const codes = document.querySelectorAll('code').length;
        return { textLen: text.length, tables, pres, codes };
      })()
    `);
    const v = state.value;
    const flag = (v.codes < 3 && v.tables === 0 && v.pres === 0) ? '⚠' : 'OK';
    console.log(`  ${id.padEnd(15)}  ${flag}  codes=${v.codes} tables=${v.tables} pres=${v.pres} text=${v.textLen}`);
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

setTimeout(() => { cleanup(); process.exit(2); }, 240_000).unref();
main().then(() => { cleanup(); process.exit(0); }).catch((e) => { console.error('FAIL:', e.message); cleanup(); process.exit(1); });
