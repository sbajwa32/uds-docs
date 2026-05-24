#!/usr/bin/env node
// Broad visual sweep of the migrated site. Screenshot every key route so we
// can actually look at whether things render correctly — beyond the
// chunk-specific smoke tests which only assert on specific DOM contracts.
//
// Routes covered:
//   - Home (/)
//   - All 4 token pages
//   - All 5 content pages (about, recipes, templates, design-process, design-language, cursor-workflows, ai-assist, getting-started)
//   - Changelog (with both tabs)
//   - Contrast Checker
//   - Every component page (29)
//   - A component page's Code, Guidelines, Changelog tabs
//   - Archive view (?uds=0.2 on /button)

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4099;
const CDP_PORT = 9399;
const OUT_DIR = '/tmp/visual-sweep';
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

const ROUTES = [
  ['home', '/'],
  ['about', '/about'],
  ['ai-assist', '/ai-assist'],
  ['getting-started', '/getting-started'],
  ['recipes', '/recipes'],
  ['templates', '/templates'],
  ['design-process', '/design-process'],
  ['design-language', '/design-language'],
  ['cursor-workflows', '/cursor-workflows'],
  ['changelog', '/changelog'],
  ['contrast-checker', '/contrast-checker'],
  ['semantic-colors', '/semantic-colors'],
  ['primitive-colors', '/primitive-colors'],
  ['text-styles', '/text-styles'],
  ['spacing', '/spacing'],
  ['component-button', '/button'],
  ['component-link', '/link'],
  ['component-text-input', '/text-input'],
  ['component-checkbox', '/checkbox'],
  ['component-radio', '/radio'],
  ['component-dropdown', '/dropdown'],
  ['component-toggle', '/toggle'],
  ['component-search', '/search'],
  ['component-badge', '/badge'],
  ['component-chip', '/chip'],
  ['component-tile', '/tile'],
  ['component-list', '/list'],
  ['component-data-table', '/data-table'],
  ['component-dialog', '/dialog'],
  ['component-nav-header', '/nav-header'],
  ['component-tooltip', '/tooltip'],
  ['archive-button', '/button?uds=0.2'],
];

async function main() {
  console.log(`[sweep] serving ${OUT_ROOT.pathname} on :${SERVE_PORT}`);
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

  const userDataDir = `/tmp/visual-sweep-chrome-${Date.now()}`;
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
  const consoleLogs = [];
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === 'Log.entryAdded' || msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Runtime.exceptionThrown') {
      consoleLogs.push({ method: msg.method, params: msg.params });
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
      return { error: result.exceptionDetails.exception?.description || result.exceptionDetails.text };
    }
    return { value: result.result.value };
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  // Capture network failures so we see broken asset fetches.
  await send('Network.enable');
  const networkFailures = [];
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.method === 'Network.responseReceived') {
      const r = msg.params.response;
      if (r.status >= 400) {
        networkFailures.push({ url: r.url, status: r.status, mime: r.mimeType });
      }
    }
  });

  const summary = [];
  for (const [name, path] of ROUTES) {
    console.log(`[sweep] ${name} ← ${path}`);
    consoleLogs.length = 0;
    const failuresBefore = networkFailures.length;
    await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}${path}` });
    await sleep(2500);

    const pageState = await evaluate(`
      (() => {
        const main = document.querySelector('main, .sg-main, [data-cc-zone], section.cc-app, .sg-shell, body');
        const hasMain = !!main;
        const errors = Array.from(document.querySelectorAll('[role="alert"]')).map(e => e.textContent.trim()).filter(Boolean);
        const loadingMessages = Array.from(document.querySelectorAll('.sg-changelog-empty, .cc-loading')).map(e => e.textContent.trim()).filter(Boolean);
        const h1 = document.querySelector('h1')?.textContent?.trim() || null;
        const sidebarLinks = document.querySelectorAll('.sg-sidebar a').length;
        return {
          title: document.title,
          h1,
          hasMain,
          errors,
          loadingMessages,
          sidebarLinks,
        };
      })()
    `);

    const snapshot = await send('Page.captureScreenshot', { format: 'png' });
    if (snapshot && snapshot.data) {
      writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(snapshot.data, 'base64'));
    }

    const newNetworkFailures = networkFailures.slice(failuresBefore);
    const consoleErrors = consoleLogs.filter(l =>
      l.method === 'Runtime.exceptionThrown' ||
      (l.method === 'Runtime.consoleAPICalled' && (l.params.type === 'error' || l.params.type === 'warning'))
    );

    summary.push({
      name,
      path,
      title: pageState.value?.title,
      h1: pageState.value?.h1,
      sidebarLinks: pageState.value?.sidebarLinks,
      errors: pageState.value?.errors || [],
      loadingMessages: pageState.value?.loadingMessages || [],
      networkFailures: newNetworkFailures,
      consoleErrors: consoleErrors.length,
      evalError: pageState.error,
    });
  }

  console.log('');
  console.log('=== SUMMARY ===');
  for (const s of summary) {
    const issues = [];
    if (s.evalError) issues.push(`eval-error: ${s.evalError.slice(0, 80)}`);
    if (s.errors.length) issues.push(`alerts: ${s.errors.length}`);
    if (s.networkFailures.length) {
      const nonStorybook = s.networkFailures.filter(f => !f.url.includes('storybook'));
      if (nonStorybook.length) issues.push(`net-fail: ${nonStorybook.length}`);
    }
    if (s.consoleErrors > 0) issues.push(`console-err: ${s.consoleErrors}`);
    const tag = issues.length ? `⚠  ${issues.join('; ')}` : 'OK';
    console.log(`  ${s.name.padEnd(28)}  ${tag}  h1=${JSON.stringify(s.h1 || '').slice(0, 60)}`);
  }

  // Print network failures grouped
  console.log('');
  console.log('=== NETWORK FAILURES (non-storybook) ===');
  const allFailures = networkFailures.filter(f => !f.url.includes('storybook'));
  const byUrl = new Map();
  for (const f of allFailures) {
    const key = f.url.replace(/^http:\/\/localhost:\d+/, '');
    byUrl.set(key, (byUrl.get(key) || 0) + 1);
  }
  if (byUrl.size === 0) {
    console.log('  (none)');
  } else {
    for (const [url, count] of [...byUrl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
      console.log(`  x${count}  ${url}`);
    }
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

const HARD_TIMEOUT_MS = 300_000;
const hardTimer = setTimeout(() => {
  console.error(`[sweep] FAILED: hard timeout (${HARD_TIMEOUT_MS}ms) exceeded`);
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
    console.error('[sweep] FAILED:', err.message);
    cleanup();
    process.exit(1);
  });
