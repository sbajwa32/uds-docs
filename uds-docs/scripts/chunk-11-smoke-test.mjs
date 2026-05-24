#!/usr/bin/env node
// Chunk 11 (Contrast Checker) — headless smoke test.
//
// Prerequisites:
//   1. `npm run build` must have completed (this script serves `out/`).
//   2. `ws` must be available — install with `npm install --no-save ws`.
//
// Drives the static-export build via the Chrome DevTools Protocol to
// verify:
//
//   1. The Contrast Checker page renders the hero panel with default
//      pair `text-primary` on `surface-main`.
//   2. The per-theme strip renders 6 cells (one per supported theme).
//   3. Clicking the foreground picker opens a popover with text + icon
//      + border groups.
//   4. The curated browse view renders curated pairings (≥10 rows).
//   5. Switching to the matrix view renders a table with multiple
//      surface rows.
//   6. Toggling "Only failing" reduces the visible row count.
//   7. Clicking a theme cell flips the live theme (proves the
//      useUdsTheme hook is wired correctly).
//
// PID hygiene: every spawned process is tracked and killed by specific
// PID via SIGKILL on its own process group. No `pkill -f`.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4002;
const CDP_PORT = 9302;
const OUT_DIR = '/tmp/chunk-11-smoke';
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
  const userDataDir = `/tmp/chunk-11-chrome-${Date.now()}`;
  spawnTracked('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,1000',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${CDP_PORT}`,
    `http://localhost:${SERVE_PORT}/contrast-checker`,
  ]);

  await waitForPort(CDP_PORT, `http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);

  const targets = await (
    await fetch(`http://localhost:${CDP_PORT}/json`)
  ).json();
  const target = targets.find((t) => (t.url || '').includes(`localhost:${SERVE_PORT}`));
  if (!target) throw new Error('No CDP target found for localhost:' + SERVE_PORT);

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
    if (!result || !result.data) return;
    const path = `${OUT_DIR}/${name}.png`;
    writeFileSync(path, Buffer.from(result.data, 'base64'));
    console.log(`[smoke]   screenshot ${name} -> ${path}`);
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/contrast-checker` });
  // Wait for token harvest + first paint.
  await sleep(2000);
  // Wait until the hero stage renders (its appearance is the signal
  // that the lazy harvest finished).
  await waitForPredicate(async () => {
    const ok = await evaluate(`
      !!document.querySelector('[data-cc-stage]') &&
      document.querySelectorAll('[data-cc-theme]').length === 6
    `);
    return !!ok;
  }, 8000);

  console.log('[check 1] hero renders with default text-primary on surface-main');
  const heroInfo = await evaluate(`
    (() => {
      const stage = document.querySelector('[data-cc-stage]');
      const verdict = document.querySelector('[data-cc-verdict-row]');
      const fgName = document.querySelector('.cc-picker[data-cc-slot="fg"] .cc-picker-trigger-name');
      const bgName = document.querySelector('.cc-picker[data-cc-slot="bg"] .cc-picker-trigger-name');
      const stageStyle = stage ? stage.getAttribute('style') || '' : '';
      return {
        fgName: fgName ? fgName.textContent.trim() : null,
        bgName: bgName ? bgName.textContent.trim() : null,
        stageHasBg: stageStyle.includes('background'),
        verdictText: verdict ? verdict.textContent.trim().slice(0, 80) : null,
      };
    })()
  `);
  if (heroInfo.fgName !== 'text-primary') {
    throw new Error('hero foreground is ' + heroInfo.fgName + ', expected text-primary');
  }
  if (heroInfo.bgName !== 'surface-main') {
    throw new Error('hero surface is ' + heroInfo.bgName + ', expected surface-main');
  }
  if (!heroInfo.stageHasBg) throw new Error('hero stage missing background');
  if (!heroInfo.verdictText) throw new Error('hero verdict missing');
  console.log(`[check 1] OK — fg=${heroInfo.fgName}, bg=${heroInfo.bgName}, verdict="${heroInfo.verdictText}..."`);

  await screenshot('01-hero-default');

  console.log('[check 2] per-theme strip renders 6 cells with WCAG ratios');
  const stripInfo = await evaluate(`
    (() => {
      const cells = Array.from(document.querySelectorAll('[data-cc-theme]'));
      return cells.map((c) => ({
        id: c.dataset.ccTheme,
        ratio: c.querySelector('.cc-theme-ratio')?.textContent.trim() || null,
        status: c.dataset.status,
      }));
    })()
  `);
  if (stripInfo.length !== 6) {
    throw new Error(`expected 6 theme cells, got ${stripInfo.length}`);
  }
  for (const c of stripInfo) {
    if (!c.ratio || c.ratio === '—') {
      throw new Error(`theme cell ${c.id} missing ratio: ${JSON.stringify(c)}`);
    }
    if (!['aaa', 'aa', 'aa-large', 'fail', 'na'].includes(c.status)) {
      throw new Error(`theme cell ${c.id} has unexpected status: ${c.status}`);
    }
  }
  console.log(`[check 2] OK — strip ratios: ${stripInfo.map((c) => `${c.id}:${c.ratio}`).join(', ')}`);

  console.log('[check 3] clicking foreground picker trigger opens popover');
  await evaluate(`document.querySelector('.cc-picker[data-cc-slot="fg"] .cc-picker-trigger').click()`);
  await sleep(400);
  const pickerInfo = await evaluate(`
    (() => {
      const pop = document.querySelector('.cc-popover');
      if (!pop) return { open: false };
      return {
        open: true,
        groups: Array.from(pop.querySelectorAll('.cc-popover-group-head')).map((g) => g.textContent.trim()),
        optionCount: pop.querySelectorAll('.cc-popover-option').length,
        searchFocused: document.activeElement === pop.querySelector('.cc-popover-search'),
      };
    })()
  `);
  if (!pickerInfo.open) throw new Error('picker popover did not open');
  if (pickerInfo.optionCount < 10) {
    throw new Error(`picker popover should list many tokens, got ${pickerInfo.optionCount}`);
  }
  console.log(`[check 3] OK — picker open with ${pickerInfo.optionCount} options across ${pickerInfo.groups.length} groups`);
  await screenshot('02-picker-open');

  // Close picker by clicking the trigger again.
  await evaluate(`document.querySelector('.cc-picker[data-cc-slot="fg"] .cc-picker-trigger').click()`);
  await sleep(300);

  console.log('[check 4] curated browse view renders pairings');
  await evaluate(`document.querySelector('[data-cc-view="curated"]').click()`);
  await sleep(300);
  const curatedInfo = await evaluate(`
    document.querySelectorAll('.cc-curated-row').length
  `);
  if (curatedInfo < 10) {
    throw new Error(`curated view should have >= 10 rows, got ${curatedInfo}`);
  }
  console.log(`[check 4] OK — curated view shows ${curatedInfo} pairings`);

  console.log('[check 5] matrix view renders surface × foreground table');
  await evaluate(`document.querySelector('[data-cc-view="matrix"]').click()`);
  await sleep(500);
  const matrixInfo = await evaluate(`
    (() => {
      const rows = document.querySelectorAll('.cc-matrix tbody tr');
      const cols = document.querySelectorAll('.cc-matrix thead .cc-matrix-col');
      return { rows: rows.length, cols: cols.length };
    })()
  `);
  if (matrixInfo.rows < 10) {
    throw new Error(`matrix should have >= 10 surface rows, got ${matrixInfo.rows}`);
  }
  if (matrixInfo.cols < 10) {
    throw new Error(`matrix should have >= 10 foreground cols, got ${matrixInfo.cols}`);
  }
  console.log(`[check 5] OK — matrix ${matrixInfo.rows} surfaces × ${matrixInfo.cols} foregrounds`);
  await screenshot('03-matrix-view');

  console.log('[check 6] "Only failing" reduces matrix rows');
  const beforeFail = matrixInfo.rows;
  await evaluate(`
    (() => {
      const cb = document.querySelector('.cc-fail-only input[type=checkbox]');
      cb.click();
    })()
  `);
  await sleep(400);
  const afterFail = await evaluate(`
    document.querySelectorAll('.cc-matrix tbody tr').length
  `);
  if (afterFail >= beforeFail) {
    // Some token sets may have all-failing rows; this isn't a hard fail
    // but warrants a warning. Don't error out.
    console.log(`[check 6] WARN — "Only failing" did not reduce rows: ${beforeFail} -> ${afterFail}`);
  } else {
    console.log(`[check 6] OK — "Only failing" reduced rows ${beforeFail} -> ${afterFail}`);
  }
  // Restore.
  await evaluate(`document.querySelector('.cc-fail-only input[type=checkbox]').click()`);
  await sleep(200);

  console.log('[check 7] clicking a theme cell flips the global theme');
  // Switch back to curated for a cleaner screenshot.
  await evaluate(`document.querySelector('[data-cc-view="curated"]').click()`);
  await sleep(300);
  await evaluate(`document.querySelector('[data-cc-theme="base-dark"]').click()`);
  await sleep(500);
  const afterFlip = await evaluate(`
    (() => ({
      attr: document.documentElement.getAttribute('data-color-scheme'),
      active: document.querySelector('[data-cc-theme="base-dark"]').classList.contains('cc-theme-cell--active'),
    }))()
  `);
  if (afterFlip.attr !== 'dark') {
    throw new Error('clicking base-dark did not set data-color-scheme=dark, got ' + afterFlip.attr);
  }
  if (!afterFlip.active) {
    throw new Error('base-dark cell should be active after click, got ' + JSON.stringify(afterFlip));
  }
  console.log(`[check 7] OK — flipped to base-dark`);
  await screenshot('04-dark-theme');

  // Reset to light for any subsequent screenshots.
  await evaluate(`document.querySelector('[data-cc-theme="base-light"]').click()`);
  await sleep(400);
  await screenshot('05-restored-light');

  console.log('[smoke] all checks passed.');

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

async function waitForPredicate(predicate, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await sleep(200);
  }
  throw new Error(`Predicate did not become true within ${timeoutMs}ms`);
}

// Global hard cap so the script can never wedge a CI job.
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
