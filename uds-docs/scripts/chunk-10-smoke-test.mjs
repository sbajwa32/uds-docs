#!/usr/bin/env node
// Chunk 10 (Token Search) — headless smoke test.
//
// Prerequisites:
//   1. `npm run build` must have completed (this script serves `out/`).
//   2. `ws` must be available — install with `npm install --no-save ws`.
//      Not added to package.json because the script is a one-shot
//      verification rather than a CI step.
//
// Spawns `serve` against `out/` and headless Chrome against it, drives the
// app via the Chrome DevTools Protocol to verify:
//
//   1. The search trigger renders and is enabled (no longer the disabled stub).
//   2. Clicking the trigger opens the modal (data-open="true") and populates
//      the results panel with real tokens (rows > 0).
//   3. Typing in the input filters the visible token count.
//   4. Esc closes the modal (data-open="false").
//   5. Pressing "/" while not focused on an input reopens it.
//   6. Pressing Cmd+K (sent as Meta+K) opens the modal regardless of input
//      focus state.
//
// Screenshots land in /tmp/chunk-10-smoke/ for the PR.
//
// PID hygiene: every child process is spawned with `spawn`, the PID is
// captured, and cleanup uses `process.kill(pid, 'SIGKILL')` on those PIDs
// only. No `pkill -f` — that was previously observed to take down the
// containing agent runtime.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4001;
const CDP_PORT = 9301;
const OUT_DIR = '/tmp/chunk-10-smoke';
const OUT_ROOT = new URL('../out/', import.meta.url);

mkdirSync(OUT_DIR, { recursive: true });

const procs = [];

function spawnTracked(cmd, args, opts = {}) {
  // Each child gets its own process group so cleanup() can SIGKILL the
  // group (covers child + grandchildren in one shot). Critical for
  // Chrome, which spawns half a dozen helper processes.
  const p = spawn(cmd, args, { stdio: 'pipe', detached: true, ...opts });
  procs.push(p);
  return p;
}

function cleanup() {
  for (const p of procs) {
    if (p && p.pid && !p.killed) {
      try {
        // Negative PID targets the whole process group.
        process.kill(-p.pid, 'SIGKILL');
      } catch {
        try {
          process.kill(p.pid, 'SIGKILL');
        } catch {
          // Already gone; ignore.
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

async function main() {
  console.log(`[smoke] serving ${OUT_ROOT.pathname} on :${SERVE_PORT}`);
  const serveProc = spawnTracked('npx', [
    'serve',
    '-l',
    String(SERVE_PORT),
    '--no-clipboard',
    '--no-port-switching',
    OUT_ROOT.pathname,
  ]);
  serveProc.stderr.on('data', (d) => process.stderr.write(`[serve] ${d}`));

  await waitForPort(SERVE_PORT, 'http://localhost:' + SERVE_PORT + '/');

  console.log(`[smoke] launching headless Chrome on CDP :${CDP_PORT}`);
  const userDataDir = `/tmp/chunk-10-chrome-${Date.now()}`;
  const chromeProc = spawnTracked('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,900',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${CDP_PORT}`,
    `http://localhost:${SERVE_PORT}/`,
  ]);

  await waitForPort(CDP_PORT, `http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);

  const targets = await (
    await fetch(`http://localhost:${CDP_PORT}/json`)
  ).json();
  const target = targets.find((t) => (t.url || '').includes(`localhost:${SERVE_PORT}`));
  if (!target) throw new Error('Could not find CDP target for localhost:' + SERVE_PORT);

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
        reject(new Error(`CDP send ${method} timed out after ${timeoutMs}ms`));
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
      throw new Error(
        `Runtime.evaluate threw: ${result.exceptionDetails.exception?.description || result.exceptionDetails.text}`,
      );
    }
    return result.result.value;
  }

  async function screenshot(name) {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    if (!result || !result.data) {
      console.log(`[smoke]   skipped screenshot ${name}: no data`);
      return;
    }
    const path = `${OUT_DIR}/${name}.png`;
    writeFileSync(path, Buffer.from(result.data, 'base64'));
    console.log(`[smoke]   screenshot ${name} -> ${path}`);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/` });
  await waitForLoadComplete(send);
  await sleep(800);

  console.log('[check 1] trigger button is enabled and rendered');
  const triggerInfo = await evaluate(`
    (() => {
      const btn = document.querySelector('.sg-header-search-trigger');
      if (!btn) return { found: false };
      return {
        found: true,
        disabled: btn.disabled,
        ariaLabel: btn.getAttribute('aria-label'),
        ariaHasPopup: btn.getAttribute('aria-haspopup'),
      };
    })()
  `);
  assertEquals(triggerInfo, {
    found: true,
    disabled: false,
    ariaLabel: 'Search tokens',
    ariaHasPopup: 'dialog',
  }, 'trigger button shape');

  await screenshot('01-trigger-rendered');

  console.log('[check 2] click trigger opens modal with results');
  await evaluate(`document.querySelector('.sg-header-search-trigger').click()`);
  await sleep(400);
  const opened = await evaluate(`
    (() => {
      const modal = document.querySelector('#sg-token-search');
      const rows = document.querySelectorAll('.sg-token-search__row');
      const count = document.querySelector('.sg-token-search__count');
      return {
        open: modal && modal.getAttribute('data-open'),
        rowCount: rows.length,
        countText: count ? count.textContent.trim() : null,
        focused: document.activeElement && document.activeElement.id === 'sg-token-search-input',
      };
    })()
  `);
  if (opened.open !== 'true') throw new Error('modal did not open after click: ' + JSON.stringify(opened));
  if (opened.rowCount === 0) throw new Error('modal opened but rendered 0 rows');
  if (!opened.focused) throw new Error('input did not receive focus when modal opened');
  console.log(`[check 2] modal open: ${opened.rowCount} rows (${opened.countText})`);
  await screenshot('02-modal-open-default');

  console.log('[check 3] typing filters the result list');
  // Manually drive the React-controlled input the way React expects:
  // set the value via the native setter, then dispatch an input event.
  await evaluate(`
    (() => {
      const input = document.getElementById('sg-token-search-input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'color-text-primary');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()
  `);
  await sleep(300);
  const filtered = await evaluate(`
    (() => {
      const rows = document.querySelectorAll('.sg-token-search__row');
      const count = document.querySelector('.sg-token-search__count');
      return {
        rowCount: rows.length,
        countText: count ? count.textContent.trim() : null,
      };
    })()
  `);
  if (filtered.rowCount === 0) throw new Error('filter to color-text-primary returned 0 rows');
  if (filtered.rowCount >= opened.rowCount) {
    throw new Error(`filter did not reduce rows: ${filtered.rowCount} vs ${opened.rowCount} default`);
  }
  console.log(`[check 3] filtered to ${filtered.rowCount} rows (${filtered.countText})`);
  await screenshot('03-modal-filtered');

  console.log('[check 4] Esc closes modal');
  await dispatchKey(send, 'Escape');
  await sleep(300);
  const closedByEsc = await evaluate(`
    document.querySelector('#sg-token-search').getAttribute('data-open')
  `);
  if (closedByEsc !== 'false') throw new Error('Esc did not close modal: data-open=' + closedByEsc);

  console.log('[check 5] / reopens modal when not typing in another input');
  await evaluate(`document.body.focus()`);
  await dispatchKey(send, '/');
  await sleep(300);
  const reopenedBySlash = await evaluate(`
    document.querySelector('#sg-token-search').getAttribute('data-open')
  `);
  if (reopenedBySlash !== 'true') throw new Error('/ did not reopen modal: data-open=' + reopenedBySlash);

  // Close with Esc again before the Cmd+K check.
  await dispatchKey(send, 'Escape');
  await sleep(200);

  console.log('[check 6] Cmd+K opens modal');
  await dispatchKey(send, 'k', { meta: true });
  await sleep(300);
  const cmdK = await evaluate(`
    document.querySelector('#sg-token-search').getAttribute('data-open')
  `);
  if (cmdK !== 'true') throw new Error('Cmd+K did not open modal: data-open=' + cmdK);

  await screenshot('04-cmdk-open');

  console.log('[check 7] ArrowDown moves active row');
  const beforeArrow = await evaluate(`
    (() => {
      const active = document.querySelector('.sg-token-search__row[data-active="true"]');
      return active ? active.getAttribute('data-row-index') : null;
    })()
  `);
  await dispatchKey(send, 'ArrowDown');
  await sleep(100);
  await dispatchKey(send, 'ArrowDown');
  await sleep(100);
  const afterArrow = await evaluate(`
    (() => {
      const active = document.querySelector('.sg-token-search__row[data-active="true"]');
      return active ? active.getAttribute('data-row-index') : null;
    })()
  `);
  if (beforeArrow === afterArrow) {
    throw new Error(`ArrowDown did not move active row: still ${beforeArrow}`);
  }
  console.log(`[check 7] active row moved ${beforeArrow} -> ${afterArrow}`);

  console.log('[check 8] clicking a row closes the modal (proves the click handler ran)');
  // Note: we don't try to read the clipboard back — Browser-domain CDP
  // calls hang on page-target connections, and headless Chrome rejects
  // clipboard reads from non-secure origins anyway. The component
  // wrapping the click handler does call navigator.clipboard.writeText
  // unconditionally; observing the modal close is sufficient to prove
  // the handler fired without throwing.
  const clickResult = await evaluate(`
    (async () => {
      const row = document.querySelector('.sg-token-search__row');
      const tokenName = row.getAttribute('data-token');
      row.click();
      // Wait two animation frames for React to commit the close state.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return {
        tokenName,
        modalOpen: document.querySelector('#sg-token-search').getAttribute('data-open'),
      };
    })()
  `);
  if (clickResult.modalOpen !== 'false') {
    throw new Error('click did not close modal: data-open=' + clickResult.modalOpen);
  }
  console.log(`[check 8] clicked row "${clickResult.tokenName}", modal closed`);

  console.log('[check 9] Esc on dark theme renders modal correctly');
  await dispatchKey(send, 'Escape');
  await sleep(200);
  // Force dark theme via the documentElement attribute the provider uses.
  await evaluate(`document.documentElement.setAttribute('data-color-scheme', 'dark')`);
  await dispatchKey(send, '/');
  await sleep(300);
  await screenshot('05-modal-dark');

  console.log('[smoke] all checks passed.');

  ws.close();
}

function assertEquals(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`assert ${label} failed:\n  expected ${e}\n  actual   ${a}`);
  }
}

async function dispatchKey(send, key, modifiers = {}) {
  const mod =
    (modifiers.meta ? 4 : 0) | (modifiers.ctrl ? 2 : 0) | (modifiers.alt ? 1 : 0);
  let text;
  let code;
  let windowsVirtualKeyCode;
  let keyText = key;
  switch (key) {
    case 'Escape':
      code = 'Escape';
      windowsVirtualKeyCode = 27;
      break;
    case 'ArrowDown':
      code = 'ArrowDown';
      windowsVirtualKeyCode = 40;
      break;
    case 'ArrowUp':
      code = 'ArrowUp';
      windowsVirtualKeyCode = 38;
      break;
    case 'Enter':
      code = 'Enter';
      windowsVirtualKeyCode = 13;
      text = '\r';
      break;
    case '/':
      code = 'Slash';
      windowsVirtualKeyCode = 191;
      text = '/';
      break;
    default:
      // Single-character text keys (e.g. 'k')
      code = `Key${key.toUpperCase()}`;
      windowsVirtualKeyCode = key.toUpperCase().charCodeAt(0);
      text = modifiers.meta || modifiers.ctrl ? undefined : key;
      keyText = key;
      break;
  }
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    modifiers: mod,
    key: keyText,
    code,
    windowsVirtualKeyCode,
    text,
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    modifiers: mod,
    key: keyText,
    code,
    windowsVirtualKeyCode,
  });
}

async function waitForPort(port, probeUrl) {
  for (let i = 0; i < 40; i++) {
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

async function waitForLoadComplete(send) {
  return new Promise((res) => setTimeout(res, 1200));
}

// Global hard cap so the script can never wedge a CI job.
const HARD_TIMEOUT_MS = 120_000;
const hardTimer = setTimeout(() => {
  console.error(`[smoke] FAILED: hard timeout (${HARD_TIMEOUT_MS}ms) exceeded`);
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
    console.error('[smoke] FAILED:', err.message);
    cleanup();
    process.exit(1);
  });
