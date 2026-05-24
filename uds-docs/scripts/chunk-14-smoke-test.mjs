#!/usr/bin/env node
// Chunk 14 (Version-aware archive viewing) — headless smoke test.
//
// Prerequisites:
//   1. `npm run build` must have completed.
//   2. `npm install --no-save ws` if `ws` is not present.
//
// Verifies:
//   1. The version dropdown in the header is enabled (no longer the stub)
//      and lists both versions from `versions.json`.
//   2. Changing the dropdown to "0.2" updates the URL to `?uds=0.2` and
//      renders the archive banner without navigating.
//   3. On `/button?uds=0.2`, the spec.json fetched is the archived one
//      (it has `since: "0.1"` in both archive and live but the fetched
//      URL must include `/versions/0.2/`).
//   4. Clicking "Return to current" removes `?uds=` and hides the banner.
//
// PID hygiene: spawned children killed by specific PID via SIGKILL on
// their own process group.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4005;
const CDP_PORT = 9305;
const OUT_DIR = '/tmp/chunk-14-smoke';
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
          // gone
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
  const userDataDir = `/tmp/chunk-14-chrome-${Date.now()}`;
  spawnTracked('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,1000',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${CDP_PORT}`,
    `http://localhost:${SERVE_PORT}/button`,
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

  // Enable Network domain so we can observe the fetch URLs the page
  // makes to prove archive paths are being hit.
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  const requestUrls = [];
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.method === 'Network.requestWillBeSent') {
      requestUrls.push(msg.params.request.url);
    }
  });

  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2500);

  console.log('[check 1] version dropdown is enabled and lists both versions');
  const dropdownInfo = await evaluate(`
    (() => {
      const sel = document.querySelector('.sg-version-select');
      if (!sel) return { found: false };
      const opts = Array.from(sel.querySelectorAll('option')).map((o) => o.value);
      return {
        found: true,
        disabled: sel.disabled,
        value: sel.value,
        options: opts,
      };
    })()
  `);
  if (!dropdownInfo.found || dropdownInfo.disabled) {
    throw new Error('dropdown not enabled: ' + JSON.stringify(dropdownInfo));
  }
  if (
    dropdownInfo.options.length < 2 ||
    !dropdownInfo.options.includes('0.3') ||
    !dropdownInfo.options.includes('0.2')
  ) {
    throw new Error(
      'dropdown missing options 0.2/0.3, got ' + JSON.stringify(dropdownInfo.options),
    );
  }
  if (dropdownInfo.value !== '0.3') {
    throw new Error('dropdown should default to 0.3 (current), got ' + dropdownInfo.value);
  }
  console.log(`[check 1] OK — dropdown enabled with options ${JSON.stringify(dropdownInfo.options)}`);
  await screenshot('01-live-dropdown');

  console.log('[check 2] switching to 0.2 sets ?uds=0.2 and shows the archive banner');
  requestUrls.length = 0; // clear before the switch so we can see what fetches the archive triggers
  await evaluate(`
    (() => {
      const sel = document.querySelector('.sg-version-select');
      sel.value = '0.2';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    })()
  `);
  await sleep(1500);
  const archiveInfo = await evaluate(`
    (() => {
      const banner = document.querySelector('.sg-archive-banner');
      return {
        url: window.location.search,
        bannerVisible: !!banner,
        bannerText: banner ? banner.textContent.trim().slice(0, 100) : null,
      };
    })()
  `);
  if (!archiveInfo.url.includes('uds=0.2')) {
    throw new Error('URL did not get ?uds=0.2: ' + archiveInfo.url);
  }
  if (!archiveInfo.bannerVisible) throw new Error('archive banner not visible');
  console.log(`[check 2] OK — URL "${archiveInfo.url}", banner "${archiveInfo.bannerText}..."`);
  await screenshot('02-archive-view');

  console.log('[check 3] fetches go to /versions/0.2/uds/ paths');
  const archiveFetches = requestUrls.filter((u) => u.includes('/versions/0.2/uds/'));
  if (archiveFetches.length === 0) {
    throw new Error(
      'no archive fetches observed after switching to 0.2; saw URLs:\n' +
        requestUrls.slice(0, 10).join('\n'),
    );
  }
  console.log(
    `[check 3] OK — ${archiveFetches.length} archive fetches, e.g. ${archiveFetches[0]}`,
  );

  console.log('[check 4] clicking "Return to current" exits the archive view');
  await evaluate(`document.querySelector('.sg-archive-banner__exit').click()`);
  await sleep(1000);
  const liveInfo = await evaluate(`
    (() => ({
      url: window.location.search,
      bannerVisible: !!document.querySelector('.sg-archive-banner'),
      dropdownValue: document.querySelector('.sg-version-select')?.value,
    }))()
  `);
  if (liveInfo.url.includes('uds=')) {
    throw new Error('URL still has uds= after returning to current: ' + liveInfo.url);
  }
  if (liveInfo.bannerVisible) throw new Error('banner still visible after exit');
  if (liveInfo.dropdownValue !== '0.3') {
    throw new Error(
      'dropdown did not snap back to 0.3 after exit: ' + liveInfo.dropdownValue,
    );
  }
  console.log(`[check 4] OK — URL clean, banner gone, dropdown back at "${liveInfo.dropdownValue}"`);
  await screenshot('03-restored-live');

  console.log('[check 5] deep-link to /button?uds=0.2 hydrates with archive banner visible');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button?uds=0.2` });
  await sleep(2500);
  const deepLinkInfo = await evaluate(`
    (() => ({
      url: window.location.search,
      bannerVisible: !!document.querySelector('.sg-archive-banner'),
      dropdownValue: document.querySelector('.sg-version-select')?.value,
    }))()
  `);
  if (deepLinkInfo.url !== '?uds=0.2') {
    throw new Error('deep-link URL should be ?uds=0.2, got ' + deepLinkInfo.url);
  }
  if (!deepLinkInfo.bannerVisible) throw new Error('deep-link did not show banner');
  if (deepLinkInfo.dropdownValue !== '0.2') {
    throw new Error('deep-link dropdown not 0.2: ' + deepLinkInfo.dropdownValue);
  }
  console.log(
    `[check 5] OK — deep-link hydrates with URL=${deepLinkInfo.url}, dropdown=${deepLinkInfo.dropdownValue}`,
  );
  await screenshot('04-deeplink-archive');

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
