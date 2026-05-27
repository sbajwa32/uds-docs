#!/usr/bin/env node
// Click through each tab on a representative component and check that the
// content actually renders correctly. The chunk-specific smoke tests
// only verify the default tab; this checks Code, Guidelines, Changelog,
// Playground, and Examples explicitly.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4098;
const CDP_PORT = 9398;
const OUT_DIR = '/tmp/tab-sweep';
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
    if (p && p.pid && !p.killed) {
      try {
        process.kill(-p.pid, 'SIGKILL');
      } catch {
        try {
          process.kill(p.pid, 'SIGKILL');
        } catch {
          // already gone
        }
      }
    }
  }
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

// (component, tab) pairs. We sample a couple of components to cover the
// space of what each tab can show.
const ROUTES = [
  ['button', 'examples'],
  ['button', 'code'],
  ['button', 'guidelines'],
  ['button', 'changelog'],
  ['button', 'playground'],
  ['text-input', 'guidelines'],
  ['text-input', 'playground'],
  ['data-table', 'examples'],
  ['data-table', 'code'],
  ['nav-header', 'figma-notes'],
  ['nav-header', 'examples'],
  ['nav-header', 'playground'],
  ['tooltip', 'examples'],
  ['tooltip', 'playground'],
];

async function main() {
  const serveProc = spawnTracked('npx', [
    'serve',
    '-l',
    String(SERVE_PORT),
    '--no-clipboard',
    '--no-port-switching',
    OUT_ROOT.pathname,
  ]);
  serveProc.stderr.on('data', (d) => process.stderr.write(`[serve] ${d}`));
  await waitForPort(SERVE_PORT, `http://localhost:${SERVE_PORT}/`);

  const userDataDir = `/tmp/tab-sweep-chrome-${Date.now()}`;
  spawnTracked('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,1000',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${CDP_PORT}`,
    `http://localhost:${SERVE_PORT}/`,
  ]);

  await waitForPort(CDP_PORT, `http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);

  const targets = await (await fetch(`http://localhost:${CDP_PORT}/json`)).json();
  const target = targets.find((t) => (t.url || '').includes(`localhost:${SERVE_PORT}`));
  if (!target) throw new Error('No CDP target');

  const { default: WebSocket } = await import('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.once('open', res);
    ws.once('error', rej);
  });

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

  function send(method, params = {}, timeoutMs = 10000) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP ${method} timeout`));
      }, timeoutMs);
      pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      return { error: result.exceptionDetails.exception?.description || result.exceptionDetails.text };
    }
    return { value: result.result.value };
  }

  async function screenshot(name) {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    if (!result?.data) return;
    writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(result.data, 'base64'));
  }

  await send('Page.enable');
  await send('Runtime.enable');

  for (const [comp, tab] of ROUTES) {
    const name = `${comp}-${tab}`;
    console.log(`[tabs] ${name}`);
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/${comp}` });
    await sleep(2000);
    // Click the tab.
    const clicked = await evaluate(`
      (() => {
        const tab = document.querySelector('.ds-tab[id$="-tab-${tab}"]');
        if (!tab) return { ok: false, reason: 'tab-not-found' };
        tab.click();
        return { ok: true };
      })()
    `);
    if (!clicked.value?.ok) {
      console.log(`  ⚠  ${clicked.value?.reason || clicked.error || 'click-failed'}`);
      continue;
    }
    await sleep(1500);

    const state = await evaluate(`
      (() => {
        const activePanel = document.querySelector('div[role="tabpanel"]:not([hidden])');
        // Just get the visible main content text snapshot.
        const main = document.querySelector('main');
        const text = main ? main.innerText : '';
        const errorBlocks = Array.from(document.querySelectorAll('[role="alert"], .sg-changelog-empty')).map(e => e.textContent.trim()).filter(Boolean);
        const buttons = Array.from(document.querySelectorAll('.udc-button-primary, .udc-button-secondary, .udc-button-ghost')).length;
        return {
          textPreview: text.slice(0, 300),
          textLen: text.length,
          errorBlocks,
          buttons,
        };
      })()
    `);
    if (state.error) {
      console.log(`  ⚠  eval-error: ${state.error.slice(0, 80)}`);
      continue;
    }
    const issues = [];
    if (state.value.textLen < 100) issues.push(`short-text(${state.value.textLen})`);
    if (state.value.errorBlocks.length) issues.push(`errors: ${JSON.stringify(state.value.errorBlocks).slice(0, 60)}`);
    console.log(`  ${issues.length ? '⚠' : 'OK'}  ${state.value.textLen} chars, ${state.value.buttons} buttons, ${issues.join('; ')}`);
    await screenshot(name);
  }

  ws.close();
}

async function waitForPort(port, probeUrl) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(probeUrl);
      if (r.ok || r.status === 404 || r.status === 200) return;
    } catch {
      /* not ready */
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${probeUrl}`);
}

const HARD_TIMEOUT_MS = 180_000;
const hardTimer = setTimeout(() => {
  console.error(`[tabs] FAILED: hard timeout`);
  cleanup();
  process.exit(2);
}, HARD_TIMEOUT_MS);
hardTimer.unref();

main()
  .then(() => {
    clearTimeout(hardTimer);
    cleanup();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[tabs] FAILED:', err.message);
    cleanup();
    process.exit(1);
  });
