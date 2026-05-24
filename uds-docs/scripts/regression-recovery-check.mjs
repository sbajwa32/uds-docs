#!/usr/bin/env node
// Focused regression recovery check for the four legacy behaviors restored
// after the Next.js stack rewrite:
//   1. Changelog toolbar + type/component filters + rail.
//   2. SITE build label in the brand bar.
//   3. Component sidebar hover/focus tooltip.
//   4. Clickable spec checklist popover on component pages.
//
// Prerequisites:
//   - `npm run build` has completed (this serves `out/`).
//   - `npm install --no-save ws` if `ws` is not present.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const SERVE_PORT = 4089;
const CDP_PORT = 9389;
const OUT_DIR = '/tmp/regression-recovery';
const OUT_ROOT = new URL('../out/', import.meta.url);
mkdirSync(OUT_DIR, { recursive: true });

const procs = [];

function spawnTracked(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { stdio: 'pipe', detached: true, ...opts });
  procs.push(child);
  return child;
}

function cleanup() {
  for (const child of procs) {
    if (child?.pid && !child.killed) {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        try {
          process.kill(child.pid, 'SIGKILL');
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

async function waitForPort(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // not ready
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  spawnTracked('npx', [
    'serve',
    '-l',
    String(SERVE_PORT),
    '--no-clipboard',
    '--no-port-switching',
    OUT_ROOT.pathname,
  ]);
  await waitForPort(`http://localhost:${SERVE_PORT}/`);

  spawnTracked('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,1000',
    `--user-data-dir=/tmp/regression-recovery-${Date.now()}`,
    `--remote-debugging-port=${CDP_PORT}`,
    `http://localhost:${SERVE_PORT}/`,
  ]);
  await waitForPort(`http://localhost:${CDP_PORT}/json/version`);
  await sleep(500);

  const targets = await (await fetch(`http://localhost:${CDP_PORT}/json`)).json();
  const target = targets.find((t) => (t.url || '').includes(`localhost:${SERVE_PORT}`));
  if (!target) throw new Error('No Chrome target found');

  const { default: WebSocket } = await import('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
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

  const send = (method, params = {}, timeoutMs = 15000) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP ${method} timeout`));
      }, timeoutMs);
      pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      ws.send(JSON.stringify({ id, method, params }));
    });

  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  }

  async function screenshot(name) {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    if (result?.data) {
      writeFileSync(`${OUT_DIR}/${name}.png`, Buffer.from(result.data, 'base64'));
    }
  }

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('[check 1] SITE build label appears in the header');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2500);
  const siteLabel = await evaluate(`document.querySelector('.sg-brand-bar-build')?.textContent.trim() || null`);
  if (!siteLabel || !siteLabel.startsWith('SITE ')) {
    throw new Error(`Missing SITE label; saw ${JSON.stringify(siteLabel)}`);
  }
  console.log(`  OK — ${siteLabel}`);

  console.log('[check 2] Changelog toolbar, component filter, rail, and empty state work');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/changelog` });
  await sleep(2000);
  const changelogInitial = await evaluate(`(() => {
    const railLink = document.querySelector('.sg-cl-rail-link');
    const railLinkStyle = railLink ? getComputedStyle(railLink) : null;
    return {
      toolbar: !!document.querySelector('.sg-cl-toolbar'),
      rail: document.querySelectorAll('.sg-cl-rail-link').length,
      componentChips: document.querySelectorAll('.sg-cl-component-filter .sg-cl-chip').length,
      releaseCards: document.querySelectorAll('.sg-cl-release').length,
      railHeading: document.querySelector('.sg-cl-rail .sg-cl-rail-heading')?.textContent.trim() || '',
      componentFilterHeading: document.querySelector('.sg-cl-component-filter .sg-cl-rail-heading')?.textContent.trim() || '',
      searchPlaceholder: document.querySelector('.sg-cl-search')?.getAttribute('placeholder') || '',
      railMeta: document.querySelector('.sg-cl-rail-link-meta')?.textContent.trim() || '',
      railLinkBorder: railLinkStyle?.borderTopWidth || '',
      railLinkBackground: railLinkStyle?.backgroundColor || '',
    };
  })()`);
  if (!changelogInitial.toolbar) throw new Error('Missing changelog toolbar');
  if (changelogInitial.rail < 1) throw new Error('Missing changelog rail links');
  if (changelogInitial.componentChips < 5) throw new Error('Missing component filter chips');
  if (changelogInitial.releaseCards < 1) throw new Error('Missing UDS release cards');
  if (changelogInitial.railHeading !== 'Jump to release') {
    throw new Error(`Rail heading should be "Jump to release", got "${changelogInitial.railHeading}"`);
  }
  if (changelogInitial.componentFilterHeading !== 'Filter by component') {
    throw new Error(
      `Component filter heading should be "Filter by component", got "${changelogInitial.componentFilterHeading}"`,
    );
  }
  if (changelogInitial.searchPlaceholder !== 'Search changes') {
    throw new Error(
      `Search placeholder should be "Search changes", got "${changelogInitial.searchPlaceholder}"`,
    );
  }
  if (!/changes?$/.test(changelogInitial.railMeta) && !/\d+\s+changes?/.test(changelogInitial.railMeta)) {
    throw new Error(`Rail meta missing change count: "${changelogInitial.railMeta}"`);
  }
  // Rail links should not have native button border (the legacy CSS reset above
  // was the symptom of round-2's regression).
  if (changelogInitial.railLinkBorder && changelogInitial.railLinkBorder !== '0px') {
    throw new Error(`Rail link has unwanted border: ${changelogInitial.railLinkBorder}`);
  }

  await screenshot('changelog-header');
  await evaluate(`(() => {
    const input = document.querySelector('.sg-cl-search');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'definitely-no-match-xyz');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(400);
  const emptyText = await evaluate(`document.querySelector('.sg-cl-empty')?.textContent.trim() || null`);
  if (!emptyText) throw new Error('Filtering did not show empty state');
  await screenshot('changelog-empty-state');
  console.log('  OK — toolbar/filter/rail present, empty state appears');

  console.log('[check 3] Sidebar hover/focus tooltip shows status + spec metadata');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2500);
  const tooltip = await evaluate(`(async () => {
    const link = document.querySelector('.sg-sidebar-link[href="/button"]');
    link.focus();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const tip = document.querySelector('.sg-sidebar-portal-tooltip');
    return {
      visible: tip?.dataset.visible,
      text: tip?.textContent || '',
      miniBars: tip?.querySelectorAll('.sg-sidebar-tooltip__mini-bar').length || 0,
    };
  })()`);
  if (tooltip.visible !== 'true') throw new Error('Sidebar tooltip did not become visible');
  if (!tooltip.text.includes('In Progress') || !tooltip.text.includes('fields filled')) {
    throw new Error(`Sidebar tooltip missing metadata: ${tooltip.text}`);
  }
  if (tooltip.miniBars !== 2) throw new Error(`Expected 2 mini bars, saw ${tooltip.miniBars}`);
  await screenshot('sidebar-tooltip');
  console.log('  OK — tooltip visible with status/spec mini-bars');

  console.log('[check 4] Spec bar opens the checklist popover');
  const popover = await evaluate(`(async () => {
    document.querySelector('.sg-spec-progress-trigger')?.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const pop = document.querySelector('.sg-spec-popover');
    return {
      open: !!pop,
      text: pop?.innerText || '',
      expanded: document.querySelector('.sg-spec-progress-trigger')?.getAttribute('aria-expanded'),
    };
  })()`);
  if (!popover.open) throw new Error('Spec popover did not open');
  if (popover.expanded !== 'true') throw new Error('Spec bar aria-expanded did not update');
  if (!popover.text.includes('FILLED') || !popover.text.includes('MISSING')) {
    throw new Error(`Popover missing checklist groups: ${popover.text.slice(0, 150)}`);
  }
  await screenshot('spec-popover');
  console.log('  OK — popover opens with checklist groups');

  console.log('[check 5] Component header has Figma / Storybook / GitHub / Report Issue links');
  // Close the popover from check 4 first so it doesn't intercept clicks.
  await evaluate(`document.querySelector('.sg-spec-popover__close')?.click()`);
  await sleep(200);
  const headerLinks = await evaluate(`(() => {
    const links = Array.from(document.querySelectorAll('.sg-page-links .sg-page-link'));
    return links.map((el) => el.textContent.trim());
  })()`);
  const requiredLinks = ['Figma', 'Storybook', 'GitHub', 'Report Issue'];
  for (const required of requiredLinks) {
    if (!headerLinks.some((label) => label.includes(required))) {
      throw new Error(`Missing header link "${required}". Saw: ${JSON.stringify(headerLinks)}`);
    }
  }
  console.log(`  OK — ${headerLinks.length} header links: ${headerLinks.join(' / ')}`);

  console.log('[check 6] Non-production component shows the "Not production-ready" banner');
  const banner = await evaluate(`(() => {
    const el = document.querySelector('.sg-not-for-production');
    return { present: !!el, text: el?.textContent.trim() || '' };
  })()`);
  if (!banner.present) throw new Error('Missing .sg-not-for-production banner');
  if (!banner.text.includes('Not production-ready')) {
    throw new Error(`Banner text wrong: ${banner.text.slice(0, 120)}`);
  }
  console.log(`  OK — banner reads "${banner.text.slice(0, 80)}…"`);

  console.log('[check 7] "Last updated" panel renders with version + recent changes');
  const lastUpdated = await evaluate(`(async () => {
    const det = document.querySelector('.sg-recent-changes');
    if (!det) return { present: false };
    const version = det.querySelector('.sg-recent-version')?.textContent.trim() || '';
    const releases = det.querySelectorAll('.sg-recent-release').length;
    const startsClosed = !det.open;
    det.open = true;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const innerVisible = !!det.querySelector('.sg-recent-inner');
    const fullLink = det.querySelector('.sg-recent-full')?.getAttribute('href') || '';
    return { present: true, version, releases, startsClosed, innerVisible, fullLink };
  })()`);
  if (!lastUpdated.present) throw new Error('Missing .sg-recent-changes panel');
  if (!lastUpdated.version) throw new Error('Last-updated panel has no version');
  if (lastUpdated.releases < 1) {
    throw new Error(`Last-updated panel has no recent releases: ${JSON.stringify(lastUpdated)}`);
  }
  if (!lastUpdated.startsClosed) throw new Error('Last-updated panel should start collapsed');
  if (!lastUpdated.innerVisible) throw new Error('Last-updated panel does not expand on toggle');
  if (!lastUpdated.fullLink.includes('changelog')) {
    throw new Error(`"View full changelog" link missing/wrong: ${lastUpdated.fullLink}`);
  }
  console.log(`  OK — last updated ${lastUpdated.version}, ${lastUpdated.releases} releases inline, expands cleanly`);

  console.log('[check 8] Version dropdown labels the live release as "(latest)"');
  const dropdown = await evaluate(`(() => {
    const opts = Array.from(document.querySelectorAll('.sg-version-select option'));
    return opts.map((o) => o.textContent.trim());
  })()`);
  if (!dropdown.some((label) => label.includes('(latest)'))) {
    throw new Error(`Version dropdown missing "(latest)" label: ${JSON.stringify(dropdown)}`);
  }
  if (dropdown.some((label) => label.includes('(current)'))) {
    throw new Error(`Version dropdown still uses "(current)": ${JSON.stringify(dropdown)}`);
  }
  await screenshot('header-and-banner');
  console.log(`  OK — dropdown: ${dropdown.join(' / ')}`);

  ws.close();
  console.log('[regression] all checks passed.');
}

const hardTimer = setTimeout(() => {
  console.error('[regression] hard timeout');
  cleanup();
  process.exit(2);
}, 180_000);
hardTimer.unref();

main()
  .then(() => {
    clearTimeout(hardTimer);
    cleanup();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[regression] FAILED:', err.message);
    cleanup();
    process.exit(1);
  });
