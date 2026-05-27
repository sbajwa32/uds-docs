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
    const railLink = document.querySelector('.ds-changelog-rail-link');
    const railLinkStyle = railLink ? getComputedStyle(railLink) : null;
    return {
      toolbar: !!document.querySelector('.ds-changelog-toolbar'),
      rail: document.querySelectorAll('.ds-changelog-rail-link').length,
      componentChips: document.querySelectorAll('.ds-changelog-component-filter .ds-changelog-component-filter-chip').length,
      releaseCards: document.querySelectorAll('.ds-changelog-card').length,
      railHeading: document.querySelector('.ds-changelog-rail .ds-changelog-rail-heading')?.textContent.trim() || '',
      componentFilterHeading: document.querySelector('.ds-changelog-component-filter .ds-changelog-filter-label')?.textContent.trim() || '',
      searchPlaceholder: document.querySelector('.ds-changelog-search-input')?.getAttribute('placeholder') || '',
      railMeta: document.querySelector('.ds-changelog-rail-meta')?.textContent.trim() || '',
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

  // Switch to the Site tab and check the weekday + "X bumps" rail meta.
  await evaluate(`(() => {
    const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((t) => t.textContent.trim() === 'Site');
    tab?.click();
  })()`);
  await new Promise((r) => setTimeout(r, 400));
  const siteRail = await evaluate(`(() => {
    const labels = Array.from(document.querySelectorAll('[data-changelog-tab="site"] .ds-changelog-rail-link'));
    const ranked = labels
      .map((el) => ({
        label: el.firstChild?.textContent?.trim() || '',
        meta: el.querySelector('.ds-changelog-rail-meta')?.textContent.trim() || '',
      }))
      .filter((row) => row.label);
    const heading = document.querySelector('[data-changelog-tab="site"] .ds-changelog-rail-heading')?.textContent.trim() || '';
    return { heading, ranked };
  })()`);
  if (siteRail.heading !== 'Jump to date') {
    throw new Error(`Site rail heading should be "Jump to date", got "${siteRail.heading}"`);
  }
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sampleLabel = siteRail.ranked[0]?.label || '';
  if (!weekdays.some((w) => sampleLabel.startsWith(w))) {
    throw new Error(`Site rail label should start with a weekday, got "${sampleLabel}"`);
  }
  const bumpsRow = siteRail.ranked.find((row) => /\d+\s+bumps/.test(row.meta));
  if (!bumpsRow) {
    throw new Error(`No site-rail row has "X bumps" meta — got ${JSON.stringify(siteRail.ranked.slice(0, 3))}`);
  }
  await screenshot('changelog-site-tab');
  // Switch back to the UDS tab for downstream checks.
  await evaluate(`(() => {
    const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((t) => t.textContent.trim() === 'UDS');
    tab?.click();
  })()`);
  await new Promise((r) => setTimeout(r, 400));

  await screenshot('changelog-header');
  await evaluate(`(() => {
    const input = document.querySelector('.ds-changelog-search-input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'definitely-no-match-xyz');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(400);
  const emptyText = await evaluate(`document.querySelector('.ds-changelog-empty')?.textContent.trim() || null`);
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
    const links = Array.from(document.querySelectorAll('.ds-page-actions .ds-page-action'));
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

  console.log('[check 8a] Demo Builder dialog renders Last-Build heading, status dots, and clean close-button focus');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(1500);
  // Seed a history entry so the "Last Build" card has data to display.
  await evaluate(`(() => {
    const entry = {
      timestamp: new Date().toISOString(),
      framework: 'html',
      theme: { colorScheme: '', brand: '', font: '' },
      components: ['button', 'link', 'label'],
      componentCount: 3,
      sizeKB: 12,
      blobHtml: '<html><body>Test</body></html>',
    };
    localStorage.setItem('uds-demo-history', JSON.stringify([entry]));
  })()`);
  await evaluate(`document.querySelector('.sg-demo-btn')?.click()`);
  await sleep(800);
  const demo = await evaluate(`(() => {
    const dialog = document.querySelector('.sg-demo-dialog');
    if (!dialog) return { open: false };
    const closeBtn = dialog.querySelector('.udc-dialog__close');
    const lastBuildStrong = dialog.querySelector('.sg-demo-history-meta strong');
    const computed = lastBuildStrong ? getComputedStyle(lastBuildStrong) : null;
    const labels = Array.from(dialog.querySelectorAll('.sg-demo-grid label'));
    const labelsWithDots = labels.filter((l) => l.querySelector('.sg-demo-status-dot')).length;
    const rect = lastBuildStrong?.getBoundingClientRect?.();
    return {
      open: true,
      lastBuildText: lastBuildStrong?.textContent.trim() || '',
      lastBuildDisplay: computed?.display || '',
      lastBuildFontSize: computed?.fontSize || '',
      lastBuildColor: computed?.color || '',
      lastBuildVisibility: computed?.visibility || '',
      lastBuildOpacity: computed?.opacity || '',
      lastBuildHeight: rect?.height || 0,
      lastBuildWidth: rect?.width || 0,
      labelsTotal: labels.length,
      labelsWithDots,
      closeFocusedOnOpen: document.activeElement === closeBtn,
    };
  })()`);
  const themeDebug = await evaluate(`(() => {
    const strong = document.querySelector('.sg-demo-history-meta strong');
    const chain = [];
    let el = strong;
    while (el && el !== document.documentElement) {
      chain.push({
        tag: el.tagName,
        cls: el.className || '',
        color: getComputedStyle(el).color,
      });
      el = el.parentElement;
    }
    return {
      htmlScheme: document.documentElement.getAttribute('data-color-scheme') || '',
      htmlTheme: document.documentElement.getAttribute('data-theme') || '',
      bodyScheme: document.body.getAttribute('data-color-scheme') || '',
      textPrimary: getComputedStyle(document.documentElement).getPropertyValue('--uds-color-text-primary').trim(),
      htmlColor: getComputedStyle(document.documentElement).color,
      chain,
    };
  })()`);
  void themeDebug;
  if (!demo.open) throw new Error('Demo Builder dialog failed to open');
  if (demo.lastBuildText !== 'Last Build') {
    throw new Error(`"Last Build" heading missing or wrong: "${demo.lastBuildText}"`);
  }
  if (demo.lastBuildDisplay !== 'block') {
    throw new Error(`"Last Build" should be display:block, got "${demo.lastBuildDisplay}"`);
  }
  // Color check: in the default base-light theme, text should be dark
  // (text-primary = #171717). If it's bright (≥ 200 average channel), the
  // dialog is inheriting the .sg-brand-bar's near-white color and the
  // text disappears against the dialog body background.
  const colorMatch = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(demo.lastBuildColor);
  if (colorMatch) {
    const avg = (Number(colorMatch[1]) + Number(colorMatch[2]) + Number(colorMatch[3])) / 3;
    if (avg > 200) {
      throw new Error(`"Last Build" color too bright (${demo.lastBuildColor}) — likely inheriting from .sg-brand-bar`);
    }
  }
  if (demo.labelsWithDots < demo.labelsTotal) {
    throw new Error(`Only ${demo.labelsWithDots}/${demo.labelsTotal} demo components have status dots`);
  }
  if (demo.closeFocusedOnOpen) {
    throw new Error('Close button should NOT auto-focus on dialog open (causes blue outline)');
  }
  await screenshot('demo-builder-dialog');
  console.log(`  OK — "Last Build" present, ${demo.labelsWithDots}/${demo.labelsTotal} status dots, close button not auto-focused`);
  await evaluate(`document.querySelector('.sg-demo-dialog .udc-dialog__close')?.click()`);
  await sleep(200);

  console.log('[check 8b] Playground tab restores copy button, Implementation Reference, and icon-preview controls');
  await evaluate(`(() => {
    const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((t) => t.textContent.trim() === 'Playground');
    tab?.click();
  })()`);
  await new Promise((r) => setTimeout(r, 800));
  const playground = await evaluate(`(() => {
    const findVisible = (sel) => Array.from(document.querySelectorAll(sel)).find((el) => el.offsetParent !== null) || null;
    return {
      copyBtn: !!findVisible('.ds-playground-right .ds-code-block__copy'),
      implDetails: !!findVisible('.sg-impl-details'),
      implTabs: findVisible('.sg-impl-details') ? document.querySelectorAll('.sg-impl-details .sg-impl-tab').length : 0,
      iconPicker: !!findVisible('.sg-icon-picker-trigger'),
      iconPickerHasGlyph: !!(findVisible('.sg-icon-picker-trigger')?.querySelector('.material-symbols-outlined')),
    };
  })()`);
  if (!playground.copyBtn) throw new Error('Playground code block missing copy button');
  if (!playground.implDetails) throw new Error('Playground missing Implementation Reference details');
  if (playground.implTabs < 2) {
    throw new Error(`Implementation Reference should have at least Component + Styles tabs, got ${playground.implTabs}`);
  }
  if (!playground.iconPicker) throw new Error('Playground icon-search control missing icon preview trigger');
  if (!playground.iconPickerHasGlyph) throw new Error('Icon preview missing Material Symbols glyph');
  // Scroll the playground into view so the screenshot captures the
  // controls, code block, copy button, and Impl Ref details.
  await evaluate(`(() => {
    document.querySelector('.ds-playground-layout')?.scrollIntoView({ block: 'start' });
  })()`);
  await new Promise((r) => setTimeout(r, 200));
  await screenshot('playground-tab');
  console.log(`  OK — copy button, Impl Ref (${playground.implTabs} tabs), icon preview all present`);

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

  console.log('[check 9] Playground hidden for deferred components (combobox)');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/combobox` });
  await sleep(2000);
  const comboboxTabs = await evaluate(`(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]')).map((t) => t.textContent.trim());
    return { tabs };
  })()`);
  if (comboboxTabs.tabs.some((t) => t === 'Playground')) {
    throw new Error(`Playground tab should be hidden for combobox; saw tabs: ${JSON.stringify(comboboxTabs.tabs)}`);
  }
  console.log(`  OK — combobox tabs: ${comboboxTabs.tabs.join(' / ')}`);

  console.log('[check 10] Impl Ref CSS panel loads CSS from per-component path');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/dropdown` });
  await sleep(2000);
  await evaluate(`(() => {
    const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((t) => t.textContent.trim() === 'Playground');
    tab?.click();
  })()`);
  await sleep(800);
  // Open Impl Ref details + click the Styles tab.
  await evaluate(`(() => {
    const details = document.querySelector('.sg-impl-details');
    if (details) details.open = true;
  })()`);
  await sleep(200);
  await evaluate(`(() => {
    const stylesTab = Array.from(document.querySelectorAll('.sg-impl-tab')).find((t) => t.textContent.trim().startsWith('Styles'));
    stylesTab?.click();
  })()`);
  await sleep(1500);
  const implStyles = await evaluate(`(() => {
    const panel = document.querySelector('.sg-impl-panel[data-impl-panel="styles"]');
    const pre = panel?.querySelector('pre');
    const text = pre?.textContent?.trim() || '';
    return { hasError: /CSS file not found|Failed to load/i.test(text), preview: text.slice(0, 80) };
  })()`);
  if (implStyles.hasError) {
    throw new Error(`Impl Ref Styles panel failed to load CSS: ${implStyles.preview}`);
  }
  if (!implStyles.preview.length) {
    throw new Error('Impl Ref Styles panel rendered empty');
  }
  console.log(`  OK — CSS loaded (preview: ${implStyles.preview.slice(0, 60).replace(/\\s+/g, ' ')}…)`);

  console.log('[check 11] Impl Ref JS panel loads JS from per-component path');
  await evaluate(`(() => {
    const behaviorTab = Array.from(document.querySelectorAll('.sg-impl-tab')).find((t) => t.textContent.trim().startsWith('Behavior'));
    behaviorTab?.click();
  })()`);
  await sleep(1500);
  const implBehavior = await evaluate(`(() => {
    const panel = document.querySelector('.sg-impl-panel[data-impl-panel="behavior"]');
    if (!panel) return { skipped: true };
    const pre = panel.querySelector('pre');
    const text = pre?.textContent?.trim() || '';
    return { skipped: false, hasError: /JS file not found|Failed to load/i.test(text), preview: text.slice(0, 80) };
  })()`);
  if (!implBehavior.skipped) {
    if (implBehavior.hasError) {
      throw new Error(`Impl Ref Behavior panel failed to load JS: ${implBehavior.preview}`);
    }
    if (!implBehavior.preview.length) {
      throw new Error('Impl Ref Behavior panel rendered empty');
    }
    console.log(`  OK — JS loaded (preview: ${implBehavior.preview.slice(0, 60).replace(/\\s+/g, ' ')}…)`);
  } else {
    console.log('  OK — dropdown has no Behavior tab (no impl.jsFunc)');
  }

  console.log('[check 12] Archive mode hides Playground tab + Demo Builder + filters sidebar');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button?uds=0.2` });
  await sleep(2500);
  const archive = await evaluate(`(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]')).map((t) => t.textContent.trim());
    const demoBtn = !!document.querySelector('.sg-demo-btn');
    const linkLink = !!document.querySelector('.sg-sidebar-link[href^="/link"]');
    const labelLink = !!document.querySelector('.sg-sidebar-link[href^="/label"]');
    const buttonHref = document.querySelector('.sg-sidebar-link[href^="/button"]')?.getAttribute('href') || '';
    const banner = !!document.querySelector('#sg-archive-banner, [data-archive-banner], .sg-archive-banner');
    return { tabs, demoBtn, linkLink, labelLink, buttonHref, banner };
  })()`);
  if (archive.tabs.some((t) => t === 'Playground')) {
    throw new Error(`Playground tab should hide in archive; saw tabs: ${JSON.stringify(archive.tabs)}`);
  }
  if (archive.demoBtn) {
    throw new Error('Demo Builder trigger should hide in archive mode');
  }
  if (archive.linkLink || archive.labelLink) {
    throw new Error('Sidebar should not show 0.3-only Link/Label rows in the 0.2 archive');
  }
  if (!/[?&]uds=0\.2/.test(archive.buttonHref)) {
    throw new Error(`Sidebar links should preserve ?uds=0.2; saw "${archive.buttonHref}"`);
  }
  console.log(`  OK — archive tabs: ${archive.tabs.join(' / ')}; sidebar /button → ${archive.buttonHref}`);

  console.log('[check 13] ?tab= deep-link hydrates the right component tab');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button?tab=changelog` });
  await sleep(2500);
  const tabActive = await evaluate(`(() => {
    const active = document.querySelector('[role="tab"][aria-selected="true"]')?.textContent.trim() || '';
    return { active };
  })()`);
  if (tabActive.active !== 'Changelog') {
    throw new Error(`?tab=changelog should activate the Changelog tab; saw "${tabActive.active}"`);
  }
  console.log(`  OK — /button?tab=changelog activated "${tabActive.active}"`);

  console.log('[check 14] Theme buttons expose aria-pressed for assistive tech');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button` });
  await sleep(2000);
  const aria = await evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('.sg-theme-bar button'));
    return buttons.map((b) => ({
      label: b.textContent.trim(),
      pressed: b.getAttribute('aria-pressed'),
      active: b.classList.contains('active'),
    }));
  })()`);
  const missing = aria.find((b) => b.pressed !== 'true' && b.pressed !== 'false');
  if (missing) {
    throw new Error(`Theme button "${missing.label}" missing aria-pressed`);
  }
  console.log(`  OK — ${aria.length} theme buttons all expose aria-pressed`);

  console.log('[check 15] Theme persistence survives a page navigation');
  await evaluate(`(() => {
    const darkBtn = Array.from(document.querySelectorAll('.sg-theme-bar button')).find((b) => b.textContent.trim() === 'Dark');
    darkBtn?.click();
  })()`);
  await sleep(200);
  const beforeNav = await evaluate(`document.documentElement.getAttribute('data-color-scheme')`);
  if (beforeNav !== 'dark') {
    throw new Error(`Expected data-color-scheme="dark" after clicking Dark, saw "${beforeNav}"`);
  }
  // Click a sidebar link to switch pages via client navigation.
  await evaluate(`document.querySelector('.sg-sidebar-link[href^="/link"]')?.click()`);
  await sleep(1500);
  const afterNav = await evaluate(`(() => ({
    path: window.location.pathname,
    scheme: document.documentElement.getAttribute('data-color-scheme'),
  }))()`);
  if (afterNav.path === '/button') {
    throw new Error('Sidebar navigation did not change pathname — Link not wired?');
  }
  if (afterNav.scheme !== 'dark') {
    throw new Error(`Theme reset on navigation: data-color-scheme is "${afterNav.scheme}" instead of "dark"`);
  }
  console.log(`  OK — ${afterNav.path} kept data-color-scheme=dark across nav`);
  // Restore theme to default for downstream checks.
  await evaluate(`(() => {
    const lightBtn = Array.from(document.querySelectorAll('.sg-theme-bar button')).find((b) => b.textContent.trim() === 'Light');
    lightBtn?.click();
  })()`);
  await sleep(200);

  console.log('[check 16] Invalid ?uds= values are stripped from the URL');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/button?uds=9.9` });
  await sleep(3000);
  const invalidVersion = await evaluate(`(() => ({
    search: window.location.search,
    title: document.querySelector('.ds-page-header__title, .sg-page-title')?.textContent.trim() || '',
  }))()`);
  if (/[?&]uds=/.test(invalidVersion.search)) {
    throw new Error(`Invalid ?uds=9.9 should be cleared; URL search is still "${invalidVersion.search}"`);
  }
  console.log(`  OK — invalid ?uds=9.9 dropped; landed on "${invalidVersion.title}"`);

  console.log('[check 17] Root redirect preserves ?uds= query param');
  await send('Page.navigate', { url: `http://localhost:${SERVE_PORT}/?uds=0.2` });
  await sleep(2500);
  const rootRedirect = await evaluate(`(() => ({
    path: window.location.pathname,
    search: window.location.search,
  }))()`);
  if (rootRedirect.path !== '/semantic-colors') {
    throw new Error(`/?uds=0.2 should redirect to /semantic-colors; saw "${rootRedirect.path}"`);
  }
  if (!/uds=0\.2/.test(rootRedirect.search)) {
    throw new Error(`Root redirect dropped ?uds=0.2; saw search "${rootRedirect.search}"`);
  }
  console.log(`  OK — /?uds=0.2 -> ${rootRedirect.path}${rootRedirect.search}`);

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
