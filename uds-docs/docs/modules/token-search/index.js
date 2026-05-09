// docs/modules/token-search/index.js
//
// Token Search modal — keyboard-accessible search over every --uds-* CSS
// custom property declared in the loaded stylesheets. Open with `/` or
// Cmd/Ctrl+K, type to filter, Enter to copy `var(--name)` to clipboard.
//
// Phase 15a: extracted from app.js. Pure ES module — no globals leaked
// other than the modal element it opens. The modal markup itself lives
// in index.html (the <div id="sg-token-search">…</div>).

let TOKEN_INDEX = [];

function tokenCategory(name) {
  if (name.indexOf('--uds-color-') === 0) return 'color';
  if (name.indexOf('--uds-space-') === 0) return 'space';
  if (name.indexOf('--uds-font-') === 0) return 'font';
  if (name.indexOf('--uds-border-') === 0) return 'border';
  if (name.indexOf('--uds-shadow-') === 0 || name.indexOf('--uds-overlay-') === 0) return 'shadow';
  if (name.indexOf('--uds-primitive-') === 0) return 'primitive';
  return 'other';
}

function isColorValue(v) {
  if (!v) return false;
  return /^#|^rgb|^hsl|^oklch|^color\(/i.test(v.trim());
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * buildTokenIndex() — walks every loaded stylesheet, harvests --uds-*
 * custom properties, and falls back to getComputedStyle on :root for
 * any token whose declaration isn't introspectable. Memoized: subsequent
 * calls return the cached index.
 */
function buildTokenIndex() {
  if (TOKEN_INDEX.length) return TOKEN_INDEX;

  const seen = {};

  function walkRules(rules) {
    if (!rules) return;
    Array.prototype.forEach.call(rules, function (rule) {
      if (rule.cssRules) walkRules(rule.cssRules);
      if (!rule.style) return;
      for (let i = 0; i < rule.style.length; i++) {
        const name = rule.style[i];
        if (name.indexOf('--uds-') !== 0) continue;
        if (seen[name]) continue;
        seen[name] = true;
        const value = rule.style.getPropertyValue(name).trim();
        TOKEN_INDEX.push({ name, value, category: tokenCategory(name) });
      }
    });
  }

  Array.prototype.forEach.call(document.styleSheets, function (sheet) {
    let rules;
    try { rules = sheet.cssRules || sheet.rules; } catch (e) { return; }
    walkRules(rules);
  });

  // Fallback: read computed style on :root for any tokens we missed
  const computed = getComputedStyle(document.documentElement);
  for (let i = 0; i < computed.length; i++) {
    const name = computed[i];
    if (name.indexOf('--uds-') !== 0 || seen[name]) continue;
    seen[name] = true;
    TOKEN_INDEX.push({
      name,
      value: computed.getPropertyValue(name).trim(),
      category: tokenCategory(name)
    });
  }

  // Resolve var() chains
  TOKEN_INDEX.forEach(function (t) {
    if (t.value && t.value.indexOf('var(') === 0) {
      const resolved = computed.getPropertyValue(t.name).trim();
      if (resolved) t.value = resolved;
    }
  });

  // Sort: semantic before primitive, then alphabetical.
  TOKEN_INDEX.sort(function (a, b) {
    const aPrim = a.name.indexOf('--uds-primitive-') === 0 ? 1 : 0;
    const bPrim = b.name.indexOf('--uds-primitive-') === 0 ? 1 : 0;
    if (aPrim !== bPrim) return aPrim - bPrim;
    return a.name.localeCompare(b.name);
  });
  return TOKEN_INDEX;
}

function searchTokens(query) {
  const idx = buildTokenIndex();
  if (!query) return idx.slice();
  const q = query.toLowerCase().replace(/^--/, '');
  return idx.filter(function (t) {
    return t.name.toLowerCase().indexOf(q) !== -1 ||
           t.value.toLowerCase().indexOf(q) !== -1;
  });
}

function highlightMatch(name, query) {
  if (!query) return name;
  const q = query.replace(/^--/, '');
  if (!q) return name;
  const re = new RegExp('(' + escapeRegex(q) + ')', 'gi');
  return name.replace(re, '<mark>$1</mark>');
}

function renderTokenSearchResults(query) {
  const resultsEl = document.getElementById('sg-token-search-results');
  if (!resultsEl) return;
  const results = searchTokens(query);
  const total = buildTokenIndex().length;

  if (!results.length) {
    resultsEl.innerHTML = '<div class="sg-token-search__empty">No tokens match "' +
      escapeHtml(query) + '" — searched ' + total + ' tokens.</div>';
    return;
  }

  // Group by category for visual structure
  const groups = {};
  results.forEach(function (t) {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  });
  const order = ['color', 'font', 'space', 'border', 'shadow', 'primitive', 'other'];
  const countLabel = query
    ? 'Showing <strong>' + results.length + '</strong> of <strong>' + total + '</strong> tokens'
    : '<strong>' + total + '</strong> tokens · semantic first, primitives last · click to copy <code>var(--name)</code>';
  let html = '<div class="sg-token-search__count">' + countLabel + '</div>';
  let rowIndex = 0;
  order.forEach(function (g) {
    if (!groups[g] || !groups[g].length) return;
    html += '<div class="sg-token-search__group-title">' + g +
      ' <span class="sg-token-search__group-count">' + groups[g].length + '</span></div>';
    groups[g].forEach(function (t) {
      const swatch = isColorValue(t.value)
        ? '<span class="sg-token-search__swatch" style="background:' + t.value + '"></span>'
        : '<span class="sg-token-search__swatch" style="background:transparent;border:none;"></span>';
      html += '<div class="sg-token-search__row" data-token="' + escapeHtml(t.name) +
                '" data-row-index="' + rowIndex + '"' +
                (rowIndex === 0 ? ' data-active="true"' : '') + '>' +
                swatch +
                '<span class="sg-token-search__name">' + highlightMatch(t.name, query) + '</span>' +
                '<span class="sg-token-search__value">' + escapeHtml(t.value || '') + '</span>' +
                '<span class="sg-token-search__category">' + g + '</span>' +
              '</div>';
      rowIndex++;
    });
  });
  resultsEl.innerHTML = html;

  // Click to copy + close
  resultsEl.querySelectorAll('.sg-token-search__row').forEach(function (row) {
    row.addEventListener('click', function () {
      const name = row.getAttribute('data-token');
      if (name && navigator.clipboard) {
        navigator.clipboard.writeText('var(' + name + ')').catch(function () {});
      }
      closeTokenSearch();
    });
  });
}

export function openTokenSearch() {
  const modal = document.getElementById('sg-token-search');
  if (!modal) return;
  modal.setAttribute('data-open', 'true');
  const input = document.getElementById('sg-token-search-input');
  if (input) {
    input.value = '';
    renderTokenSearchResults('');
    requestAnimationFrame(function () { input.focus(); });
  }
}

export function closeTokenSearch() {
  const modal = document.getElementById('sg-token-search');
  if (modal) modal.setAttribute('data-open', 'false');
}

function moveTokenSearchActive(delta) {
  const resultsEl = document.getElementById('sg-token-search-results');
  if (!resultsEl) return;
  const rows = resultsEl.querySelectorAll('.sg-token-search__row');
  if (!rows.length) return;
  let current = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].getAttribute('data-active') === 'true') { current = i; break; }
  }
  const next = Math.max(0, Math.min(rows.length - 1, current + delta));
  rows.forEach(function (r) { r.removeAttribute('data-active'); });
  rows[next].setAttribute('data-active', 'true');
  rows[next].scrollIntoView({ block: 'nearest' });
}

function activateTokenSearchRow() {
  const resultsEl = document.getElementById('sg-token-search-results');
  if (!resultsEl) return;
  const active = resultsEl.querySelector('.sg-token-search__row[data-active="true"]');
  if (active) active.click();
}

/**
 * initTokenSearch() — wires keyboard shortcuts (Cmd/Ctrl+K, /, Esc, arrow
 * keys, Enter), the input event for live filtering, click-outside-to-close,
 * and the visible header search trigger button. Safe to call before the
 * modal exists in the DOM (returns early).
 */
export function initTokenSearch() {
  if (!document.getElementById('sg-token-search')) return;

  document.addEventListener('keydown', function (e) {
    const isCmdK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
    const isSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
    const target = e.target;
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    const modal = document.getElementById('sg-token-search');
    const isOpen = modal && modal.getAttribute('data-open') === 'true';

    if (!isOpen && isCmdK) { e.preventDefault(); openTokenSearch(); return; }
    if (!isOpen && isSlash && !typing) { e.preventDefault(); openTokenSearch(); return; }
    if (isOpen) {
      if (e.key === 'Escape')    { e.preventDefault(); closeTokenSearch(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveTokenSearchActive(1); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); moveTokenSearchActive(-1); return; }
      if (e.key === 'Enter')     { e.preventDefault(); activateTokenSearchRow(); return; }
    }
  });

  const input = document.getElementById('sg-token-search-input');
  if (input) {
    input.addEventListener('input', function () { renderTokenSearchResults(input.value); });
  }

  // Click outside panel closes
  const modal = document.getElementById('sg-token-search');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeTokenSearch();
    });
  }

  // Header search trigger (visible search box in the brand bar)
  const headerTrigger = document.getElementById('sg-header-search-trigger');
  if (headerTrigger) {
    headerTrigger.addEventListener('click', function () { openTokenSearch(); });
  }
}

// Expose openTokenSearch on window for inline onclick handlers (e.g. in
// other modules that want to trigger the search programmatically). The
// dialog itself is owned by this module, but the trigger surface area
// includes inline buttons in fragments and is hard to refactor.
if (typeof window !== 'undefined') {
  window.openTokenSearch = openTokenSearch;
  window.closeTokenSearch = closeTokenSearch;
}
