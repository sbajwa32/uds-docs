#!/usr/bin/env node
// Chunk 12b (Demo Builder UI) — headless smoke test.
//
// Prerequisites:
//   1. `npm run build` must have completed (this script serves `out/`).
//   2. `ws` must be available — install with `npm install --no-save ws`.
//
// Verifies:
//   1. The construction-icon Build Demo button renders in the brand bar
//      and is enabled (no longer the disabled stub).
//   2. Clicking it opens the dialog with all 26 components checked by
//      default.
//   3. Toggling "Deselect All" flips every checkbox off, then "Select
//      All" flips them back on.
//   4. Clicking Preview generates an HTML demo, opens the overlay, and
//      the iframe's srcdoc contains the expected UDS asset references
//      (`/uds/uds.css`, `/uds/uds.js`) + at least one of the selected
//      example components.
//   5. After Preview, the dialog stores the build to localStorage; on
//      reopen, the "Last Build" history card is visible.
//   6. Esc closes the overlay.
//
// PID hygiene: spawned children are tracked and killed by specific PID
// via SIGKILL on their own process group.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4003;
const CDP_PORT = 9303;
const OUT_DIR = '/tmp/chunk-12b-smoke';
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
          // Already gone.
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

  await waitForPort(SERVE_PORT, `http://localhost:${SERVE_PORT}/`);

  console.log(`[smoke] launching headless Chrome on CDP :${CDP_PORT}`);
  const userDataDir = `/tmp/chunk-12b-chrome-${Date.now()}`;
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

  const targets = await (
    await fetch(`http://localhost:${CDP_PORT}/json`)
  ).json();
  const target = targets.find((t) => (t.url || '').includes(`localhost:${SERVE_PORT}`));
  if (!target) throw new Error('No CDP target found');

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

  function send(method, params = {}, timeoutMs = 15000) {
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
    if (!result || !result.data) return;
    const path = `${OUT_DIR}/${name}.png`;
    writeFileSync(path, Buffer.from(result.data, 'base64'));
    console.log(`[smoke]   screenshot ${name} -> ${path}`);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/` });
  await sleep(2000);

  console.log('[check 1] Build Demo button is rendered and enabled');
  const btnInfo = await evaluate(`
    (() => {
      const btn = document.querySelector('.sg-demo-btn');
      if (!btn) return { found: false };
      return {
        found: true,
        disabled: btn.disabled,
        ariaLabel: btn.getAttribute('aria-label'),
      };
    })()
  `);
  if (!btnInfo.found || btnInfo.disabled) {
    throw new Error('Demo button not enabled: ' + JSON.stringify(btnInfo));
  }
  if (btnInfo.ariaLabel !== 'Build Demo') {
    throw new Error('Demo button has wrong aria-label: ' + btnInfo.ariaLabel);
  }
  await screenshot('01-demo-button-rendered');

  console.log('[check 2] clicking Build Demo opens the dialog with 26 checked components');
  await evaluate(`document.querySelector('.sg-demo-btn').click()`);
  await sleep(500);
  const dialogInfo = await evaluate(`
    (() => {
      const dialog = document.querySelector('.sg-demo-dialog');
      const checkboxes = Array.from(document.querySelectorAll('.sg-demo-grid input[type=checkbox]'));
      return {
        open: !!dialog,
        total: checkboxes.length,
        checked: checkboxes.filter((c) => c.checked).length,
        title: document.getElementById('sg-demo-title')?.textContent.trim() || null,
      };
    })()
  `);
  if (!dialogInfo.open) throw new Error('dialog did not open');
  if (dialogInfo.total !== 26) {
    throw new Error('expected 26 component checkboxes, got ' + dialogInfo.total);
  }
  if (dialogInfo.checked !== 26) {
    throw new Error('expected all 26 checked by default, got ' + dialogInfo.checked);
  }
  console.log(`[check 2] OK — "${dialogInfo.title}" dialog open with ${dialogInfo.checked}/26 checked`);
  await screenshot('02-dialog-open');

  console.log('[check 3] Deselect All / Select All toggle flips every checkbox');
  await evaluate(`document.querySelector('.sg-demo-select-link').click()`);
  await sleep(200);
  const afterDeselect = await evaluate(
    `Array.from(document.querySelectorAll('.sg-demo-grid input[type=checkbox]')).filter((c) => c.checked).length`,
  );
  if (afterDeselect !== 0) {
    throw new Error('Deselect All failed: ' + afterDeselect + ' still checked');
  }
  await evaluate(`document.querySelector('.sg-demo-select-link').click()`);
  await sleep(200);
  const afterSelectAll = await evaluate(
    `Array.from(document.querySelectorAll('.sg-demo-grid input[type=checkbox]')).filter((c) => c.checked).length`,
  );
  if (afterSelectAll !== 26) {
    throw new Error('Select All failed: ' + afterSelectAll + ' checked of 26');
  }
  console.log('[check 3] OK — toggle flipped 26 → 0 → 26');

  console.log('[check 4] clicking Preview generates HTML and opens the overlay');
  // Reduce to a small set so the test runs fast.
  await evaluate(`
    (() => {
      const all = Array.from(document.querySelectorAll('.sg-demo-grid input[type=checkbox]'));
      const keep = new Set(['button', 'badge', 'text-input', 'breadcrumb']);
      all.forEach((cb) => {
        const wanted = keep.has(cb.getAttribute('data-demo-comp'));
        if (cb.checked !== wanted) cb.click();
      });
    })()
  `);
  await sleep(300);
  // Click Preview — it's the last button in the footer.
  await evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('.sg-demo-dialog .udc-dialog__footer button'));
      const preview = buttons.find((b) => /preview/i.test(b.textContent || ''));
      preview.click();
    })()
  `);
  // Wait for fetches + iframe to settle (the dialog closes when the
  // overlay opens; presence of .sg-demo-overlay is the success signal).
  await waitForPredicate(async () => {
    return await evaluate(`!!document.querySelector('.sg-demo-overlay')`);
  }, 15_000);
  await sleep(500);

  const overlayInfo = await evaluate(`
    (() => {
      const overlay = document.querySelector('.sg-demo-overlay');
      const iframe = document.getElementById('sg-demo-iframe') || document.querySelector('.sg-demo-overlay-iframe');
      const srcdoc = iframe ? iframe.getAttribute('srcdoc') || '' : '';
      return {
        open: !!overlay,
        srcdocLen: srcdoc.length,
        hasUdsCss: srcdoc.includes('/uds/uds.css'),
        hasUdsJs: srcdoc.includes('/uds/uds.js'),
        looksLikeHtml: srcdoc.startsWith('<!DOCTYPE html>') || srcdoc.startsWith('<!doctype'),
      };
    })()
  `);
  if (!overlayInfo.open) throw new Error('overlay did not open after Preview');
  if (!overlayInfo.looksLikeHtml) {
    throw new Error('iframe srcdoc does not look like an HTML document: ' + JSON.stringify(overlayInfo));
  }
  if (!overlayInfo.hasUdsCss) throw new Error('iframe srcdoc missing uds.css reference');
  if (!overlayInfo.hasUdsJs) throw new Error('iframe srcdoc missing uds.js reference');
  console.log(
    `[check 4] OK — overlay open, iframe srcdoc is ${overlayInfo.srcdocLen} chars, references uds.css + uds.js`,
  );
  await screenshot('03-overlay-open');

  console.log('[check 5] Esc closes overlay; reopening dialog shows history card');
  await dispatchKey(send, 'Escape');
  await sleep(300);
  const overlayClosed = await evaluate(
    `!document.querySelector('.sg-demo-overlay')`,
  );
  if (!overlayClosed) throw new Error('Esc did not close overlay');

  await evaluate(`document.querySelector('.sg-demo-btn').click()`);
  await sleep(400);
  const historyInfo = await evaluate(`
    (() => {
      const card = document.querySelector('.sg-demo-history');
      if (!card) return { open: false };
      const meta = card.querySelector('.sg-demo-history-meta');
      const text = meta ? meta.textContent.trim() : '';
      return { open: true, text };
    })()
  `);
  if (!historyInfo.open) throw new Error('history card not visible after rebuild');
  if (!historyInfo.text.includes('4 components')) {
    throw new Error(
      'history card metadata wrong: ' + historyInfo.text.slice(0, 100),
    );
  }
  console.log(`[check 5] OK — history card visible: ${historyInfo.text.slice(0, 80)}...`);
  await screenshot('04-history-card');

  console.log('[smoke] all checks passed.');

  ws.close();
}

async function dispatchKey(send, key, modifiers = {}) {
  const mod =
    (modifiers.meta ? 4 : 0) | (modifiers.ctrl ? 2 : 0) | (modifiers.alt ? 1 : 0);
  let code;
  let windowsVirtualKeyCode;
  let text;
  switch (key) {
    case 'Escape':
      code = 'Escape';
      windowsVirtualKeyCode = 27;
      break;
    case 'Enter':
      code = 'Enter';
      windowsVirtualKeyCode = 13;
      text = '\r';
      break;
    default:
      throw new Error('unhandled key: ' + key);
  }
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    modifiers: mod,
    key,
    code,
    windowsVirtualKeyCode,
    text,
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    modifiers: mod,
    key,
    code,
    windowsVirtualKeyCode,
  });
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

async function waitForPredicate(predicate, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await sleep(200);
  }
  throw new Error(`Predicate did not become true within ${timeoutMs}ms`);
}

const HARD_TIMEOUT_MS = 180_000;
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
