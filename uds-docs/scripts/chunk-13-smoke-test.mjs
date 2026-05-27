#!/usr/bin/env node
// Chunk 13 (Figma Notes tab) — headless smoke test.
//
// Prerequisites:
//   1. `npm run build` must have completed.
//   2. `npm install --no-save ws` if `ws` is not already in node_modules.
//
// Verifies:
//   1. /nav-header renders a Figma Notes tab in the tablist (with a count
//      badge showing the number of open notes).
//   2. /button (a component without figmanotes.json) does NOT render the
//      tab.
//   3. Clicking the Figma Notes tab on /nav-header shows note cards with
//      the expected structure (title, kind badge, summary, refs, footer).
//
// PID hygiene: spawned children killed by specific PID via SIGKILL on
// their own process group.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4004;
const CDP_PORT = 9304;
const OUT_DIR = '/tmp/chunk-13-smoke';
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
  const userDataDir = `/tmp/chunk-13-chrome-${Date.now()}`;
  spawnTracked('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,1000',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${CDP_PORT}`,
    `http://localhost:${SERVE_PORT}/nav-header`,
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

  function send(method, params = {}, timeoutMs = 15000) {
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
      throw new Error(
        `Runtime.evaluate threw: ${result.exceptionDetails.exception?.description || result.exceptionDetails.text}`,
      );
    }
    return result.result.value;
  }

  async function screenshot(name) {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    if (!result?.data) return;
    const path = `${OUT_DIR}/${name}.png`;
    writeFileSync(path, Buffer.from(result.data, 'base64'));
    console.log(`[smoke]   screenshot ${name} -> ${path}`);
  }

  await send('Page.enable');
  await send('Runtime.enable');

  // First page: nav-header (has figmanotes.json with 7 notes).
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/nav-header` });
  await sleep(2500);

  console.log('[check 1] /nav-header renders the Figma Notes tab with count badge');
  const navHeaderInfo = await evaluate(`
    (() => {
      const tab = document.querySelector('.ds-tab[id$="-tab-figma-notes"]');
      if (!tab) return { found: false };
      const count = tab.querySelector('.ds-tab__count');
      return {
        found: true,
        countText: count ? count.textContent.trim() : null,
      };
    })()
  `);
  if (!navHeaderInfo.found) throw new Error('Figma Notes tab missing on /nav-header');
  if (navHeaderInfo.countText !== '7') {
    throw new Error(
      `expected count badge "7", got "${navHeaderInfo.countText}"`,
    );
  }
  console.log(`[check 1] OK — tab present with count badge "${navHeaderInfo.countText}"`);

  console.log('[check 2] clicking the tab renders 7 note cards with kinds + refs');
  await evaluate(`document.querySelector('.ds-tab[id$="-tab-figma-notes"]').click()`);
  await sleep(400);
  const noteInfo = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.sg-figma-note'));
      const kinds = cards.map((c) => c.getAttribute('data-kind'));
      const firstCard = cards[0];
      const titleEl = firstCard?.querySelector('.sg-figma-note__title');
      const kindEl = firstCard?.querySelector('.sg-figma-note__kind');
      const refsEls = Array.from(document.querySelectorAll('.sg-figma-note__ref-link'));
      return {
        cardCount: cards.length,
        kinds,
        firstTitle: titleEl?.textContent.trim() || null,
        firstKindLabel: kindEl?.textContent.trim() || null,
        firstKindAttr: kindEl?.getAttribute('data-kind') || null,
        figmaLinks: refsEls.slice(0, 3).map((a) => a.href),
      };
    })()
  `);
  if (noteInfo.cardCount !== 7) {
    throw new Error('expected 7 note cards, got ' + noteInfo.cardCount);
  }
  const uniqKinds = [...new Set(noteInfo.kinds)].sort();
  const expectedKinds = ['drift', 'figma-orphan', 'new-in-figma', 'question'].sort();
  if (JSON.stringify(uniqKinds) !== JSON.stringify(expectedKinds)) {
    throw new Error(
      'unexpected kind set: ' + JSON.stringify(uniqKinds) + ' vs ' + JSON.stringify(expectedKinds),
    );
  }
  if (noteInfo.firstKindAttr !== 'new-in-figma' || noteInfo.firstKindLabel !== 'New in Figma') {
    throw new Error(
      `first card kind mismatch: attr=${noteInfo.firstKindAttr}, label=${noteInfo.firstKindLabel}`,
    );
  }
  if (!noteInfo.figmaLinks.length || !noteInfo.figmaLinks.every((href) => href.includes('figma.com/design/1XJoUJgtNpw4R0IIT3VjoK'))) {
    throw new Error('Figma deep-link href shape wrong: ' + JSON.stringify(noteInfo.figmaLinks));
  }
  console.log(
    `[check 2] OK — ${noteInfo.cardCount} cards, kinds=${JSON.stringify(uniqKinds)}, first="${noteInfo.firstTitle}..."`,
  );
  await screenshot('01-nav-header-figma-notes');

  // Second page: button (no figmanotes.json).
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2000);

  console.log('[check 3] /button does NOT render the Figma Notes tab');
  const buttonInfo = await evaluate(`
    (() => {
      const tab = document.querySelector('.ds-tab[id$="-tab-figma-notes"]');
      const allTabs = Array.from(document.querySelectorAll('.ds-tab')).map((t) => t.id.replace(/^.*-tab-/, ''));
      return {
        figmaTab: !!tab,
        tabs: allTabs,
      };
    })()
  `);
  if (buttonInfo.figmaTab) {
    throw new Error('Figma Notes tab should not render on /button');
  }
  console.log(`[check 3] OK — /button has tabs ${JSON.stringify(buttonInfo.tabs)} (no figma-notes)`);
  await screenshot('02-button-no-figma-notes');

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
