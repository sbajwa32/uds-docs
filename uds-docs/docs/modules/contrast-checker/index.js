// docs/modules/contrast-checker/index.js
//
// UDS Tools — Contrast Checker
//
// Renders three sections (curated pairings, interactive picker, full
// matrix) showing the WCAG contrast ratio between every
// --uds-color-text-* / --uds-color-icon-* / --uds-color-border-* token
// and every --uds-color-surface-* token. All contrast is computed
// client-side from the currently-resolved CSS variables, so the page
// recomputes live whenever the global theme bar flips an attribute on
// <html> (color-scheme / theme / font-scale / density / font).
//
// Threshold rules:
//   text   — WCAG 1.4.3:  AAA >= 7, AA >= 4.5, AA-large-only >= 3, fail < 3
//   icon   — WCAG 1.4.11: AA  >= 3, fail < 3 (no AAA tier in SC 1.4.11)
//   border — WCAG 1.4.11: AA  >= 3, fail < 3
//
// Transparent tokens (`*-none`) are tagged "transparent — N/A".
// Tokens whose name contains `-disabled` still compute a ratio but are
// marked "by design" since they're intentionally low-contrast.

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KIND_PREFIX = {
  surface: '--uds-color-surface-',
  text: '--uds-color-text-',
  icon: '--uds-color-icon-',
  border: '--uds-color-border-'
};
const FG_KINDS = ['text', 'icon', 'border'];
const KIND_LABEL = { text: 'Text', icon: 'Icon', border: 'Border' };
const KIND_ICON = { text: 'text_format', icon: 'star', border: 'crop_square' };

// Surfaces visible in the full matrix. The picker can still hit every
// surface — the matrix only includes "main" tokens so it stays glanceable.
const MATRIX_SURFACES = [
  '--uds-color-surface-page-main',
  '--uds-color-surface-page-subtle',
  '--uds-color-surface-page-alt',
  '--uds-color-surface-page-bold',
  '--uds-color-surface-page-inverse',
  '--uds-color-surface-main',
  '--uds-color-surface-subtle',
  '--uds-color-surface-alt',
  '--uds-color-surface-bold',
  '--uds-color-surface-xbold',
  '--uds-color-surface-inverse',
  '--uds-color-surface-info',
  '--uds-color-surface-info-subtle',
  '--uds-color-surface-success',
  '--uds-color-surface-success-subtle',
  '--uds-color-surface-error',
  '--uds-color-surface-error-subtle',
  '--uds-color-surface-warning',
  '--uds-color-surface-warning-subtle',
  '--uds-color-surface-interactive-default',
  '--uds-color-surface-interactive-subtle',
  '--uds-color-surface-interactive-disabled',
  '--uds-color-surface-interactive-red',
  '--uds-color-surface-interactive-red-subtle',
  '--uds-color-surface-brand-dynamic-bold'
];

// Hand-curated semantic pairings shown in the "Recommended pairings"
// section. Each entry targets one surface and assigns the most
// semantically-appropriate text/icon/border token (any of which can be
// null if not applicable for that surface).
const CURATED_PAIRINGS = [
  { surface: '--uds-color-surface-main',                    text: '--uds-color-text-primary',     icon: '--uds-color-icon-primary',   border: '--uds-color-border-primary',                title: 'Body text on the page' },
  { surface: '--uds-color-surface-main',                    text: '--uds-color-text-secondary',   icon: '--uds-color-icon-secondary', border: null,                                          title: 'Secondary text' },
  { surface: '--uds-color-surface-main',                    text: '--uds-color-text-brand',       icon: '--uds-color-icon-brand',     border: '--uds-color-border-brand',                    title: 'Brand accent on main surface' },
  { surface: '--uds-color-surface-main',                    text: '--uds-color-text-interactive', icon: '--uds-color-icon-interactive', border: '--uds-color-border-interactive',            title: 'Interactive (links, focus)' },
  { surface: '--uds-color-surface-main',                    text: null,                           icon: null,                          border: '--uds-color-border-outline-focus-visible',  title: 'Focus-visible ring' },
  { surface: '--uds-color-surface-subtle',                  text: '--uds-color-text-primary',     icon: '--uds-color-icon-primary',   border: '--uds-color-border-secondary',                title: 'Body text on subtle surface' },
  { surface: '--uds-color-surface-alt',                     text: '--uds-color-text-primary',     icon: '--uds-color-icon-primary',   border: '--uds-color-border-secondary',                title: 'Body text on alt surface' },
  { surface: '--uds-color-surface-inverse',                 text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',   border: '--uds-color-border-inverse',                  title: 'Inverse pairing' },
  { surface: '--uds-color-surface-info-subtle',             text: '--uds-color-text-info',        icon: '--uds-color-icon-info',      border: '--uds-color-border-info',                     title: 'Info banner (subtle)' },
  { surface: '--uds-color-surface-success-subtle',          text: '--uds-color-text-success',     icon: '--uds-color-icon-success',   border: '--uds-color-border-success',                  title: 'Success banner (subtle)' },
  { surface: '--uds-color-surface-error-subtle',            text: '--uds-color-text-error',       icon: '--uds-color-icon-error',     border: '--uds-color-border-error',                    title: 'Error banner (subtle)' },
  { surface: '--uds-color-surface-warning-subtle',          text: '--uds-color-text-warning',     icon: '--uds-color-icon-warning',   border: '--uds-color-border-warning',                  title: 'Warning banner (subtle)' },
  { surface: '--uds-color-surface-info',                    text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',   border: null,                                          title: 'Info — bold (white-on-color)' },
  { surface: '--uds-color-surface-success',                 text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',   border: null,                                          title: 'Success — bold' },
  { surface: '--uds-color-surface-error',                   text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',   border: null,                                          title: 'Error — bold' },
  { surface: '--uds-color-surface-warning',                 text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',   border: null,                                          title: 'Warning — bold' },
  { surface: '--uds-color-surface-interactive-default',     text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',   border: null,                                          title: 'Primary button label' },
  { surface: '--uds-color-surface-brand-dynamic-bold',      text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',   border: null,                                          title: 'Brand-bold surface (header)' }
];

// ---------------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------------

const _probeEl = (() => {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
  document.body.appendChild(el);
  return el;
})();

// Resolve a CSS custom property (e.g. `--uds-color-text-primary`) into
// an { r, g, b, a } object by routing it through a hidden probe and
// reading getComputedStyle().backgroundColor. This handles arbitrary
// var() chains without us having to re-implement alias resolution.
const _rgbCache = new Map();
function resolveTokenRgb(tokenName) {
  if (_rgbCache.has(tokenName)) return _rgbCache.get(tokenName);
  _probeEl.style.backgroundColor = '';
  _probeEl.style.backgroundColor = `var(${tokenName})`;
  const raw = getComputedStyle(_probeEl).backgroundColor || '';
  const rgb = parseRgb(raw);
  _rgbCache.set(tokenName, rgb);
  return rgb;
}

function parseRgb(str) {
  const m = String(str).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/i);
  if (!m) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseFloat(m[1]),
    g: parseFloat(m[2]),
    b: parseFloat(m[3]),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1
  };
}

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

function isTransparent(rgb) {
  return !rgb || rgb.a === 0;
}

function isDisabledName(name) {
  return /-disabled(\b|-)/.test(name);
}

function isNoneName(name) {
  return /-none(\b|$)/.test(name);
}

// Verdict band per WCAG. Returns one of:
//   'aaa'      — text only, ratio >= 7
//   'aa'       — passes the relevant AA threshold
//   'aa-large' — text only, [3, 4.5)
//   'fail'     — below the relevant threshold
function classifyVerdict(ratio, fgKind) {
  if (fgKind === 'text') {
    if (ratio >= 7) return 'aaa';
    if (ratio >= 4.5) return 'aa';
    if (ratio >= 3) return 'aa-large';
    return 'fail';
  }
  if (ratio >= 3) return 'aa';
  return 'fail';
}

function verdictLabel(v, fgKind) {
  if (v === 'aaa') return 'AAA';
  if (v === 'aa') return fgKind === 'text' ? 'AA' : 'AA (non-text)';
  if (v === 'aa-large') return 'AA large only';
  return 'Fail';
}

function verdictClass(v) {
  return 'cc-verdict cc-verdict-' + v;
}

function formatRatio(r) {
  if (r >= 100) return r.toFixed(0) + ':1';
  if (r >= 10) return r.toFixed(1) + ':1';
  return r.toFixed(2) + ':1';
}

// ---------------------------------------------------------------------------
// Token harvesting
// ---------------------------------------------------------------------------

// Returns { surfaces: [Token], texts: [Token], icons: [Token], borders: [Token] }
// where Token = { name, kind, isNone, isDisabled, rgb }
function harvestTokens() {
  const computed = getComputedStyle(document.documentElement);
  const buckets = { surface: [], text: [], icon: [], border: [] };
  const seen = new Set();
  for (let i = 0; i < computed.length; i++) {
    const name = computed[i];
    if (seen.has(name)) continue;
    if (!name.startsWith('--uds-color-')) continue;
    let kind = null;
    for (const k of Object.keys(KIND_PREFIX)) {
      if (name.startsWith(KIND_PREFIX[k])) { kind = k; break; }
    }
    if (!kind) continue;
    seen.add(name);
    buckets[kind].push({
      name,
      kind,
      isNone: isNoneName(name),
      isDisabled: isDisabledName(name)
    });
  }

  const sortFn = (a, b) => a.name.localeCompare(b.name);
  for (const k of Object.keys(buckets)) buckets[k].sort(sortFn);

  return {
    surfaces: buckets.surface,
    texts: buckets.text,
    icons: buckets.icon,
    borders: buckets.border
  };
}

function resolveAllTokens(tokens) {
  _rgbCache.clear();
  const all = [...tokens.surfaces, ...tokens.texts, ...tokens.icons, ...tokens.borders];
  for (const t of all) t.rgb = resolveTokenRgb(t.name);
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shortName(tokenName) {
  return tokenName.replace('--uds-color-', '');
}

// ---------------------------------------------------------------------------
// State (module-scoped)
// ---------------------------------------------------------------------------

let _tokens = null;
let _pageEl = null;
let _observer = null;
let _rafScheduled = false;
let _pickerState = {
  axis: 'surface',
  selectedSurface: '--uds-color-surface-main',
  selectedFg: '--uds-color-text-primary',
  kinds: new Set(['text', 'icon', 'border'])
};
let _matrixState = {
  kinds: new Set(['text', 'icon', 'border'])
};

// ---------------------------------------------------------------------------
// Verdict cell helpers
// ---------------------------------------------------------------------------

// Returns { html, status } where html is a small flex row showing the
// ratio + verdict pill (and a "by design" / "transparent" caveat
// when applicable). `status` is one of 'aaa'|'aa'|'aa-large'|'fail'|
// 'na'|'disabled'.
function buildVerdictPill(fgToken, bgToken) {
  if (!fgToken || !bgToken) return { html: '', status: 'na' };
  if (fgToken.isNone || bgToken.isNone) {
    return {
      html: '<span class="cc-verdict cc-verdict-na">Transparent — N/A</span>',
      status: 'na'
    };
  }
  if (isTransparent(fgToken.rgb) || isTransparent(bgToken.rgb)) {
    return {
      html: '<span class="cc-verdict cc-verdict-na">Transparent — N/A</span>',
      status: 'na'
    };
  }
  const ratio = contrastRatio(fgToken.rgb, bgToken.rgb);
  const verdict = classifyVerdict(ratio, fgToken.kind);
  const note = (fgToken.isDisabled || bgToken.isDisabled)
    ? '<span class="cc-by-design">by&nbsp;design</span>'
    : '';
  const html =
    '<span class="cc-ratio">' + esc(formatRatio(ratio)) + '</span>' +
    '<span class="' + verdictClass(verdict) + '">' + esc(verdictLabel(verdict, fgToken.kind)) + '</span>' +
    note;
  return { html, status: verdict };
}

// Render a small foreground sample on the surface. `kind` controls
// the visual: text → "Aa" glyph, icon → Material Symbol, border →
// 2px ring containing the surface color.
function renderSample(fgToken, bgToken, kind, size) {
  size = size || 'md';
  const sizeCls = size === 'sm' ? 'cc-sample--sm' : '';
  if (!fgToken || !bgToken) return '';
  if (kind === 'text') {
    return '<span class="cc-sample cc-sample--text ' + sizeCls + '" style="color:var(' + fgToken.name + ');background:var(' + bgToken.name + ');">Aa</span>';
  }
  if (kind === 'icon') {
    return '<span class="cc-sample cc-sample--icon ' + sizeCls + '" style="color:var(' + fgToken.name + ');background:var(' + bgToken.name + ');">' +
      '<span class="material-symbols-outlined" aria-hidden="true">star</span></span>';
  }
  if (kind === 'border') {
    return '<span class="cc-sample cc-sample--border ' + sizeCls + '" style="border-color:var(' + fgToken.name + ');background:var(' + bgToken.name + ');"></span>';
  }
  return '';
}

// ---------------------------------------------------------------------------
// Section 1 — Recommended pairings
// ---------------------------------------------------------------------------

function renderCurated() {
  const host = _pageEl.querySelector('#cc-curated');
  if (!host) return;
  const byName = tokenLookup(_tokens);

  const html = CURATED_PAIRINGS.map((pair) => {
    const surface = byName[pair.surface];
    if (!surface) return '';
    const rows = FG_KINDS.map((kind) => {
      const fgName = pair[kind];
      if (!fgName) return '';
      const fg = byName[fgName];
      if (!fg) return '';
      const pill = buildVerdictPill(fg, surface);
      return (
        '<div class="cc-card-row">' +
          '<span class="cc-card-row-kind">' + KIND_LABEL[kind] + '</span>' +
          renderSample(fg, surface, kind) +
          '<code class="cc-card-fg">' + esc(shortName(fg.name)) + '</code>' +
          '<span class="cc-card-pill">' + pill.html + '</span>' +
        '</div>'
      );
    }).join('');
    const cardBg = 'var(' + surface.name + ')';
    return (
      '<article class="cc-card" style="--cc-card-bg:' + cardBg + '">' +
        '<header class="cc-card-head">' +
          '<span class="cc-card-title">' + esc(pair.title) + '</span>' +
          '<code class="cc-card-surface">' + esc(shortName(surface.name)) + '</code>' +
        '</header>' +
        '<div class="cc-card-body">' + rows + '</div>' +
      '</article>'
    );
  }).join('');
  host.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Section 2 — Interactive picker
// ---------------------------------------------------------------------------

function renderPicker() {
  const host = _pageEl.querySelector('#cc-picker');
  if (!host) return;
  if (!host.dataset.shellBuilt) {
    host.innerHTML = pickerShell();
    host.dataset.shellBuilt = 'true';
    wirePickerEvents(host);
  }
  syncPickerControls(host);
  renderPickerBody(host);
}

function pickerShell() {
  return [
    '<div class="cc-picker-controls">',
      '<div class="cc-picker-axis" role="tablist" aria-label="Picker axis">',
        '<button type="button" class="cc-picker-axis-btn udc-button-primary" data-size="sm" data-axis="surface" role="tab" aria-selected="true">By surface</button>',
        '<button type="button" class="cc-picker-axis-btn udc-button-secondary" data-size="sm" data-axis="foreground" role="tab" aria-selected="false">By foreground</button>',
      '</div>',
      '<div class="cc-picker-kinds" role="group" aria-label="Foreground kinds">',
        '<span class="cc-picker-kinds-label">Show:</span>',
        FG_KINDS.map((k) => (
          '<button type="button" class="udc-chip cc-picker-kind" data-variant="filter" data-kind="' + k + '" aria-selected="true">' +
            '<span class="udc-chip__leading-icon"><span class="material-symbols-outlined" aria-hidden="true">check</span></span>' +
            '<span class="udc-chip__label">' + KIND_LABEL[k] + '</span>' +
          '</button>'
        )).join(''),
      '</div>',
      '<label class="cc-picker-select">',
        '<span class="cc-picker-select-label" data-axis-label></span>',
        '<select class="cc-picker-select-input" data-picker-select></select>',
      '</label>',
    '</div>',
    '<div class="cc-picker-body" data-picker-body></div>'
  ].join('');
}

function wirePickerEvents(host) {
  host.addEventListener('click', (e) => {
    const axisBtn = e.target.closest('[data-axis]');
    if (axisBtn) {
      _pickerState.axis = axisBtn.dataset.axis;
      renderPicker();
      return;
    }
    const kindBtn = e.target.closest('.cc-picker-kind');
    if (kindBtn) {
      const k = kindBtn.dataset.kind;
      if (_pickerState.kinds.has(k)) {
        if (_pickerState.kinds.size > 1) _pickerState.kinds.delete(k);
      } else {
        _pickerState.kinds.add(k);
      }
      renderPicker();
      return;
    }
  });
  host.addEventListener('change', (e) => {
    if (e.target.matches('[data-picker-select]')) {
      const val = e.target.value;
      if (_pickerState.axis === 'surface') _pickerState.selectedSurface = val;
      else _pickerState.selectedFg = val;
      renderPickerBody(host);
    }
  });
}

function syncPickerControls(host) {
  host.querySelectorAll('[data-axis]').forEach((btn) => {
    const isActive = btn.dataset.axis === _pickerState.axis;
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.classList.toggle('udc-button-primary', isActive);
    btn.classList.toggle('udc-button-secondary', !isActive);
    btn.classList.toggle('active', isActive);
  });
  host.querySelectorAll('.cc-picker-kind').forEach((btn) => {
    btn.setAttribute('aria-selected', _pickerState.kinds.has(btn.dataset.kind) ? 'true' : 'false');
  });
  const select = host.querySelector('[data-picker-select]');
  const axisLabel = host.querySelector('[data-axis-label]');
  if (axisLabel) {
    axisLabel.textContent = _pickerState.axis === 'surface' ? 'Surface token' : 'Foreground token';
  }
  if (!select) return;
  let opts;
  let current;
  if (_pickerState.axis === 'surface') {
    opts = _tokens.surfaces;
    current = _pickerState.selectedSurface;
  } else {
    opts = [..._tokens.texts, ..._tokens.icons, ..._tokens.borders];
    current = _pickerState.selectedFg;
  }
  if (!opts.find((t) => t.name === current)) {
    current = opts[0] ? opts[0].name : '';
    if (_pickerState.axis === 'surface') _pickerState.selectedSurface = current;
    else _pickerState.selectedFg = current;
  }
  select.innerHTML = opts.map((t) => {
    const sel = t.name === current ? ' selected' : '';
    const tag = t.kind === 'surface' ? '' : ' [' + t.kind + ']';
    return '<option value="' + esc(t.name) + '"' + sel + '>' + esc(shortName(t.name)) + tag + '</option>';
  }).join('');
}

function renderPickerBody(host) {
  const body = host.querySelector('[data-picker-body]');
  if (!body) return;
  const byName = tokenLookup(_tokens);
  if (_pickerState.axis === 'surface') {
    const surface = byName[_pickerState.selectedSurface];
    if (!surface) { body.innerHTML = ''; return; }
    const fgs = [];
    if (_pickerState.kinds.has('text')) fgs.push(..._tokens.texts);
    if (_pickerState.kinds.has('icon')) fgs.push(..._tokens.icons);
    if (_pickerState.kinds.has('border')) fgs.push(..._tokens.borders);
    body.innerHTML =
      '<div class="cc-picker-target">' +
        '<span class="cc-picker-target-label">Surface</span>' +
        '<span class="cc-picker-target-swatch" style="background:var(' + surface.name + ')"></span>' +
        '<code class="cc-picker-target-name">' + esc(shortName(surface.name)) + '</code>' +
      '</div>' +
      '<div class="cc-picker-grid">' +
        fgs.map((fg) => buildPickerTile(fg, surface, fg.kind)).join('') +
      '</div>';
  } else {
    const fg = byName[_pickerState.selectedFg];
    if (!fg) { body.innerHTML = ''; return; }
    body.innerHTML =
      '<div class="cc-picker-target">' +
        '<span class="cc-picker-target-label">' + KIND_LABEL[fg.kind] + '</span>' +
        renderSample(fg, byName['--uds-color-surface-main'] || _tokens.surfaces[0], fg.kind, 'sm') +
        '<code class="cc-picker-target-name">' + esc(shortName(fg.name)) + '</code>' +
      '</div>' +
      '<div class="cc-picker-grid">' +
        _tokens.surfaces.map((surface) => buildPickerTile(fg, surface, fg.kind)).join('') +
      '</div>';
  }
}

function buildPickerTile(fg, surface, kind) {
  const pill = buildVerdictPill(fg, surface);
  const subjectIsFg = _pickerState.axis === 'surface';
  const labelToken = subjectIsFg ? fg : surface;
  return (
    '<div class="cc-tile" data-status="' + pill.status + '">' +
      '<div class="cc-tile-sample">' + renderSample(fg, surface, kind) + '</div>' +
      '<code class="cc-tile-name">' + esc(shortName(labelToken.name)) + '</code>' +
      '<div class="cc-tile-verdict">' + pill.html + '</div>' +
    '</div>'
  );
}

// ---------------------------------------------------------------------------
// Section 3 — Full matrix
// ---------------------------------------------------------------------------

function renderMatrix() {
  const host = _pageEl.querySelector('#cc-matrix');
  if (!host) return;
  if (!host.dataset.shellBuilt) {
    host.innerHTML = matrixShell();
    host.dataset.shellBuilt = 'true';
    wireMatrixEvents(host);
  }
  syncMatrixControls(host);
  renderMatrixBody(host);
}

function matrixShell() {
  return [
    '<div class="cc-matrix-controls">',
      '<span class="cc-matrix-controls-label">Show columns:</span>',
      FG_KINDS.map((k) => (
        '<button type="button" class="udc-chip cc-matrix-kind" data-variant="filter" data-kind="' + k + '" aria-selected="true">' +
          '<span class="udc-chip__leading-icon"><span class="material-symbols-outlined" aria-hidden="true">check</span></span>' +
          '<span class="udc-chip__label">' + KIND_LABEL[k] + '</span>' +
        '</button>'
      )).join(''),
    '</div>',
    '<div class="cc-matrix-scroll" data-matrix-scroll></div>'
  ].join('');
}

function wireMatrixEvents(host) {
  host.addEventListener('click', (e) => {
    const kindBtn = e.target.closest('.cc-matrix-kind');
    if (kindBtn) {
      const k = kindBtn.dataset.kind;
      if (_matrixState.kinds.has(k)) {
        if (_matrixState.kinds.size > 1) _matrixState.kinds.delete(k);
      } else {
        _matrixState.kinds.add(k);
      }
      renderMatrix();
    }
  });
}

function syncMatrixControls(host) {
  host.querySelectorAll('.cc-matrix-kind').forEach((btn) => {
    btn.setAttribute('aria-selected', _matrixState.kinds.has(btn.dataset.kind) ? 'true' : 'false');
  });
}

function renderMatrixBody(host) {
  const scroll = host.querySelector('[data-matrix-scroll]');
  if (!scroll) return;
  const byName = tokenLookup(_tokens);

  const cols = [];
  if (_matrixState.kinds.has('text')) cols.push(..._tokens.texts);
  if (_matrixState.kinds.has('icon')) cols.push(..._tokens.icons);
  if (_matrixState.kinds.has('border')) cols.push(..._tokens.borders);

  const surfaces = MATRIX_SURFACES
    .map((n) => byName[n])
    .filter(Boolean);

  let html = '<table class="cc-matrix" role="grid">';
  html += '<thead><tr><th class="cc-matrix-corner" scope="col">Surface ↓ &nbsp;/&nbsp; Foreground →</th>';
  for (const c of cols) {
    html += '<th class="cc-matrix-col cc-matrix-col--' + c.kind + '" scope="col" title="' + esc(c.name) + '">' +
      '<span class="cc-matrix-col-kind">' + KIND_LABEL[c.kind] + '</span>' +
      '<code class="cc-matrix-col-name">' + esc(shortName(c.name)) + '</code>' +
    '</th>';
  }
  html += '</tr></thead><tbody>';

  for (const s of surfaces) {
    html += '<tr>';
    html += '<th class="cc-matrix-row" scope="row" title="' + esc(s.name) + '">' +
      '<span class="cc-matrix-row-swatch" style="background:var(' + s.name + ')"></span>' +
      '<code class="cc-matrix-row-name">' + esc(shortName(s.name)) + '</code>' +
    '</th>';
    for (const c of cols) {
      const pill = buildVerdictPill(c, s);
      html += '<td class="cc-matrix-cell cc-matrix-cell--' + pill.status + '" data-kind="' + c.kind + '">' +
        '<div class="cc-matrix-cell-sample">' + renderSample(c, s, c.kind, 'sm') + '</div>' +
        '<div class="cc-matrix-cell-meta">' + pill.html + '</div>' +
      '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  scroll.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

function tokenLookup(tokens) {
  const map = Object.create(null);
  for (const k of ['surfaces', 'texts', 'icons', 'borders']) {
    for (const t of tokens[k]) map[t.name] = t;
  }
  return map;
}

// ---------------------------------------------------------------------------
// Reactive recompute
// ---------------------------------------------------------------------------

function recomputeAndRender() {
  // Re-resolve every token's RGB against the current theme attributes,
  // then re-render all three sections in place.
  resolveAllTokens(_tokens);
  renderCurated();
  renderPicker();
  renderMatrix();
}

function scheduleRecompute() {
  if (_rafScheduled) return;
  _rafScheduled = true;
  requestAnimationFrame(() => {
    _rafScheduled = false;
    try { recomputeAndRender(); } catch (e) { console.error('contrast checker recompute failed', e); }
  });
}

// ---------------------------------------------------------------------------
// Public init
// ---------------------------------------------------------------------------

export function initContrastChecker(pageEl) {
  _pageEl = pageEl;
  _tokens = harvestTokens();
  resolveAllTokens(_tokens);
  renderCurated();
  renderPicker();
  renderMatrix();

  if (_observer) _observer.disconnect();
  _observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes') {
        scheduleRecompute();
        return;
      }
    }
  });
  _observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-color-scheme', 'data-theme', 'data-font-scale', 'data-density', 'data-font']
  });
}

export default initContrastChecker;
