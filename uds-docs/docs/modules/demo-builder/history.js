// docs/modules/demo-builder/history.js
// localStorage-backed history of recent Demo Builder builds. Capped at 2
// entries because the inline blob HTML pushes localStorage hard.

export const STORAGE_KEY = 'uds-demo-history';

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { return []; }
}

export function saveHistory(history) {
  while (history.length > 2) history.shift();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }
  catch (e) {
    if (history.length > 1) { history.shift(); saveHistory(history); }
  }
}

export function renderHistoryCard() {
  const slot = document.getElementById('sg-demo-history-slot');
  if (!slot) return;
  const history = getHistory();
  if (!history.length) {
    slot.innerHTML = '<div class="sg-demo-history-empty">No previous builds</div>';
    return;
  }
  const last = history[history.length - 1];
  const d = new Date(last.timestamp);
  const timeStr = d.toLocaleString();
  const themeSummary = [];
  if (last.theme.colorScheme) themeSummary.push(last.theme.colorScheme);
  if (last.theme.brand) themeSummary.push(last.theme.brand);
  if (last.theme.font) themeSummary.push(last.theme.font);
  const themeLabel = themeSummary.length ? themeSummary.join(' / ') : 'Default';

  slot.innerHTML = '<div class="sg-demo-history"><div class="sg-demo-history-meta"><strong>Last Build</strong><span>' + timeStr + ' &middot; ' + last.framework.toUpperCase() + ' &middot; ' + last.componentCount + ' components &middot; ' + last.sizeKB + ' KB</span><br><span>Theme: ' + themeLabel + '</span></div><button class="udc-button-secondary" data-size="sm" onclick="window.openPreviousBuild()"><span class="material-symbols-outlined" style="font-size:16px;margin-right:4px;">open_in_new</span>Open</button></div>';
}
