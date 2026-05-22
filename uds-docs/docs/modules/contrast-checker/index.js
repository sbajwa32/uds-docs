// docs/modules/contrast-checker/index.js
//
// UDS Tools — Contrast Checker
//
// Single-page tool with three zones (top to bottom):
//
//   1. Hero "Compare" panel — pick one foreground × one surface, see the
//      pair rendered at real reading scale (a paragraph of body text, an
//      icon row, a bordered "input" mockup) on the actual surface fill,
//      with a big WCAG ratio + verdict. A per-theme strip below the
//      stage shows the same pair evaluated across all 6 supported themes
//      (Base Light/Dark, ResMan Light/Dark, AnyoneHome Light, Inhabit
//      Light) computed via a hidden detached probe — no need to flip the
//      global theme bar to validate "does this work everywhere?".
//   2. "Browse" — segmented toggle between the curated semantic pairings
//      and a full surface×foreground matrix. Click any row/cell to load
//      it into the Compare panel. Filters: kind chips (text/icon/border)
//      and a "Show only failing" toggle.
//   3. WCAG threshold reference — collapsed <details> at the bottom.
//
// All contrast is computed client-side from currently-resolved CSS
// variables. A MutationObserver on <html> data-attributes (color-scheme,
// theme, font-scale, density, font) re-resolves and re-renders.
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
const KIND_LABEL = { text: 'Text', icon: 'Icon', border: 'Border', surface: 'Surface' };

// 6 supported theme combinations — same set covered by the
// `audit-theme-contrast.sh` axe-core run.
const THEME_PROFILES = [
  { id: 'base-light',     label: 'Base · Light',       attrs: {} },
  { id: 'base-dark',      label: 'Base · Dark',        attrs: { 'data-color-scheme': 'dark' } },
  { id: 'resman-light',   label: 'ResMan · Light',     attrs: { 'data-theme': 'resman' } },
  { id: 'resman-dark',    label: 'ResMan · Dark',      attrs: { 'data-color-scheme': 'dark', 'data-theme': 'resman' } },
  { id: 'anyonehome',     label: 'AnyoneHome · Light', attrs: { 'data-theme': 'anyonehome' } },
  { id: 'inhabit',        label: 'Inhabit · Light',    attrs: { 'data-theme': 'inhabit' } }
];

// Curated semantic pairings — used by the "Common pairings" browse view.
// Each entry attaches the most semantically-appropriate text/icon/border
// foreground tokens to a single surface. Click any (surface, fg) cell in
// the curated view to load that pair into Compare.
const CURATED_PAIRINGS = [
  { surface: '--uds-color-surface-main',                text: '--uds-color-text-primary',     icon: '--uds-color-icon-primary',     border: '--uds-color-border-primary',                title: 'Body text on the page' },
  { surface: '--uds-color-surface-main',                text: '--uds-color-text-secondary',   icon: '--uds-color-icon-secondary',   border: null,                                          title: 'Secondary text' },
  { surface: '--uds-color-surface-main',                text: '--uds-color-text-brand',       icon: '--uds-color-icon-brand',       border: '--uds-color-border-brand',                    title: 'Brand accent on main' },
  { surface: '--uds-color-surface-main',                text: '--uds-color-text-interactive', icon: '--uds-color-icon-interactive', border: '--uds-color-border-interactive',              title: 'Interactive (links, focus)' },
  { surface: '--uds-color-surface-main',                text: null,                           icon: null,                            border: '--uds-color-border-outline-focus-visible',   title: 'Focus-visible ring' },
  { surface: '--uds-color-surface-subtle',              text: '--uds-color-text-primary',     icon: '--uds-color-icon-primary',     border: '--uds-color-border-secondary',                title: 'Body on subtle surface' },
  { surface: '--uds-color-surface-alt',                 text: '--uds-color-text-primary',     icon: '--uds-color-icon-primary',     border: '--uds-color-border-secondary',                title: 'Body on alt surface' },
  { surface: '--uds-color-surface-inverse',             text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',     border: '--uds-color-border-inverse',                  title: 'Inverse pairing' },
  { surface: '--uds-color-surface-info-subtle',         text: '--uds-color-text-info',        icon: '--uds-color-icon-info',        border: '--uds-color-border-info',                     title: 'Info banner (subtle)' },
  { surface: '--uds-color-surface-success-subtle',      text: '--uds-color-text-success',     icon: '--uds-color-icon-success',     border: '--uds-color-border-success',                  title: 'Success banner (subtle)' },
  { surface: '--uds-color-surface-error-subtle',        text: '--uds-color-text-error',       icon: '--uds-color-icon-error',       border: '--uds-color-border-error',                    title: 'Error banner (subtle)' },
  { surface: '--uds-color-surface-warning-subtle',      text: '--uds-color-text-warning',     icon: '--uds-color-icon-warning',     border: '--uds-color-border-warning',                  title: 'Warning banner (subtle)' },
  { surface: '--uds-color-surface-info',                text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',     border: null,                                          title: 'Info — bold' },
  { surface: '--uds-color-surface-success',             text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',     border: null,                                          title: 'Success — bold' },
  { surface: '--uds-color-surface-error',               text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',     border: null,                                          title: 'Error — bold' },
  { surface: '--uds-color-surface-warning',             text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',     border: null,                                          title: 'Warning — bold' },
  { surface: '--uds-color-surface-interactive-default', text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',     border: null,                                          title: 'Primary button label' },
  { surface: '--uds-color-surface-brand-dynamic-bold',  text: '--uds-color-text-inverse',     icon: '--uds-color-icon-inverse',     border: null,                                          title: 'Brand-bold (header)' }
];

// Surface tokens visible in the Full Matrix browse view. Picker still
// covers every surface — the matrix only includes "main" tokens so it
// stays glanceable.
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

// ---------------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------------

// Hidden probe attached under <body> for live (active-theme) reads. The
// per-theme strip uses its own dedicated probes (see THEME_PROBES).
const _liveProbe = (() => {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
  document.body.appendChild(el);
  return el;
})();

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
  if (v === 'aa') return fgKind === 'text' ? 'AA' : 'AA';
  if (v === 'aa-large') return 'AA large only';
  return 'Fail';
}

function verdictClass(v) {
  return 'cc-verdict cc-verdict-' + v;
}

function formatRatio(r) {
  if (!isFinite(r)) return '—';
  if (r >= 100) return r.toFixed(0) + ':1';
  if (r >= 10) return r.toFixed(1) + ':1';
  return r.toFixed(2) + ':1';
}

// ---------------------------------------------------------------------------
// Token harvesting + live RGB resolution (active theme)
// ---------------------------------------------------------------------------

const _liveRgbCache = new Map();
function resolveLiveRgb(tokenName) {
  if (_liveRgbCache.has(tokenName)) return _liveRgbCache.get(tokenName);
  _liveProbe.style.backgroundColor = '';
  _liveProbe.style.backgroundColor = `var(${tokenName})`;
  const raw = getComputedStyle(_liveProbe).backgroundColor || '';
  const rgb = parseRgb(raw);
  _liveRgbCache.set(tokenName, rgb);
  return rgb;
}

// Returns { surfaces, texts, icons, borders } where each entry is
// { name, kind, isNone, isDisabled, rgb? }. RGB filled in by
// resolveAllTokens().
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
  _liveRgbCache.clear();
  const all = [...tokens.surfaces, ...tokens.texts, ...tokens.icons, ...tokens.borders];
  for (const t of all) t.rgb = resolveLiveRgb(t.name);
}

// ---------------------------------------------------------------------------
// Per-theme RGB resolution — hidden probes outside <html>'s influence
// ---------------------------------------------------------------------------

// One probe div per theme profile. Each probe has its own data-* attrs
// applied at construction; CSS attribute selectors (`[data-color-scheme="dark"]`)
// match the probe regardless of <html>'s state, so we can read the
// resolved CSS variables as they would be in any of the 6 themes
// without flashing the global UI.
const _themeProbes = new Map();
function ensureThemeProbes() {
  if (_themeProbes.size) return;
  for (const profile of THEME_PROFILES) {
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
    for (const [k, v] of Object.entries(profile.attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    _themeProbes.set(profile.id, el);
  }
}

function resolveTokenInTheme(profileId, tokenName) {
  ensureThemeProbes();
  const probe = _themeProbes.get(profileId);
  if (!probe) return { r: 0, g: 0, b: 0, a: 1 };
  probe.style.backgroundColor = '';
  probe.style.backgroundColor = `var(${tokenName})`;
  return parseRgb(getComputedStyle(probe).backgroundColor || '');
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

function tokenLookup(tokens) {
  const map = Object.create(null);
  for (const k of ['surfaces', 'texts', 'icons', 'borders']) {
    for (const t of tokens[k]) map[t.name] = t;
  }
  return map;
}

// Build a verdict pill (ratio + AAA/AA/Fail label + optional "by design")
// for an arbitrary fg/bg pair. `rgbOverride` — when supplied — replaces
// fgToken.rgb / bgToken.rgb (used for per-theme strip computation).
function buildVerdictPill(fgToken, bgToken, rgbOverride) {
  if (!fgToken || !bgToken) return { html: '', status: 'na', ratio: NaN };
  if (fgToken.isNone || bgToken.isNone) {
    return { html: '<span class="cc-verdict cc-verdict-na">Transparent — N/A</span>', status: 'na', ratio: NaN };
  }
  const fgRgb = (rgbOverride && rgbOverride.fg) || fgToken.rgb;
  const bgRgb = (rgbOverride && rgbOverride.bg) || bgToken.rgb;
  if (isTransparent(fgRgb) || isTransparent(bgRgb)) {
    return { html: '<span class="cc-verdict cc-verdict-na">Transparent — N/A</span>', status: 'na', ratio: NaN };
  }
  const ratio = contrastRatio(fgRgb, bgRgb);
  const verdict = classifyVerdict(ratio, fgToken.kind);
  const note = (fgToken.isDisabled || bgToken.isDisabled)
    ? '<span class="cc-by-design">by&nbsp;design</span>'
    : '';
  const html =
    '<span class="cc-ratio">' + esc(formatRatio(ratio)) + '</span>' +
    '<span class="' + verdictClass(verdict) + '">' + esc(verdictLabel(verdict, fgToken.kind)) + '</span>' +
    note;
  return { html, status: verdict, ratio };
}

// Render a small foreground sample on a surface (used in browse views).
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
// Module state
// ---------------------------------------------------------------------------

let _tokens = null;
let _pageEl = null;
let _appEl = null;
let _observer = null;
let _rafScheduled = false;
let _activePopover = null;

const _hero = {
  fg: '--uds-color-text-primary',
  bg: '--uds-color-surface-main'
};

const _browse = {
  view: 'curated',          // 'curated' | 'matrix'
  kinds: new Set(['text', 'icon', 'border']),
  failOnly: false
};

// ---------------------------------------------------------------------------
// Public init
// ---------------------------------------------------------------------------

export function initContrastChecker(pageEl) {
  _pageEl = pageEl;
  _appEl = pageEl.querySelector('#cc-app');
  if (!_appEl) return;

  _tokens = harvestTokens();
  resolveAllTokens(_tokens);
  ensureThemeProbes();

  buildShell();
  renderAll();
  wireEvents();

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

// ---------------------------------------------------------------------------
// Recompute / re-render
// ---------------------------------------------------------------------------

function scheduleRecompute() {
  if (_rafScheduled) return;
  _rafScheduled = true;
  requestAnimationFrame(() => {
    _rafScheduled = false;
    try {
      resolveAllTokens(_tokens);
      renderAll();
    } catch (e) {
      console.error('contrast checker recompute failed', e);
    }
  });
}

function renderAll() {
  renderHero();
  renderBrowse();
  syncBrowseControls();
  syncThemeStripActive();
}

// ---------------------------------------------------------------------------
// Shell — one-time DOM build for the whole tool
// ---------------------------------------------------------------------------

function buildShell() {
  _appEl.innerHTML = [
    '<section class="cc-hero" data-cc-zone="hero">',
      '<div class="cc-pickers">',
        pickerTriggerHtml('fg'),
        '<span class="cc-pickers-on" aria-hidden="true">on</span>',
        pickerTriggerHtml('bg'),
      '</div>',

      '<div class="cc-hero-stage" data-cc-stage></div>',

      '<div class="cc-verdict-row" data-cc-verdict-row></div>',

      '<div class="cc-themes-wrap">',
        '<div class="cc-themes-head">',
          '<span class="cc-themes-label">Across themes</span>',
          '<span class="cc-themes-hint">Click any theme to apply it globally</span>',
        '</div>',
        '<div class="cc-themes" data-cc-themes></div>',
      '</div>',
    '</section>',

    '<section class="cc-browse" data-cc-zone="browse">',
      '<div class="cc-browse-toolbar">',
        '<div class="cc-browse-tabs" role="tablist" aria-label="Browse view">',
          '<button type="button" class="cc-tab" data-cc-view="curated" role="tab" aria-selected="true">Common pairings</button>',
          '<button type="button" class="cc-tab" data-cc-view="matrix"  role="tab" aria-selected="false">Full matrix</button>',
        '</div>',
        '<div class="cc-browse-filters">',
          '<span class="cc-browse-filters-label">Show:</span>',
          FG_KINDS.map((k) => (
            '<button type="button" class="udc-chip cc-kind-chip" data-variant="filter" data-cc-kind="' + k + '" aria-selected="true">' +
              '<span class="udc-chip__leading-icon"><span class="material-symbols-outlined" aria-hidden="true">check</span></span>' +
              '<span class="udc-chip__label">' + KIND_LABEL[k] + '</span>' +
            '</button>'
          )).join(''),
          '<label class="cc-fail-only">',
            '<input type="checkbox" data-cc-fail-only />',
            '<span>Only failing</span>',
          '</label>',
        '</div>',
      '</div>',
      '<div class="cc-browse-body" data-cc-browse-body></div>',
    '</section>',

    '<details class="cc-help">',
      '<summary class="cc-help-summary">',
        '<span class="material-symbols-outlined" aria-hidden="true">help_outline</span>',
        'WCAG thresholds and conventions',
      '</summary>',
      '<div class="cc-help-body">',
        '<ul class="cc-help-list">',
          '<li><strong>Text</strong> — WCAG SC 1.4.3: <strong>4.5:1</strong> for normal body (AA), <strong>7:1</strong> for AAA, <strong>3:1</strong> for large text (18&nbsp;pt+ regular or 14&nbsp;pt+ bold).</li>',
          '<li><strong>Icons</strong> and <strong>borders</strong> — WCAG SC 1.4.11 Non-text Contrast: <strong>3:1</strong> against the adjacent surface. SC 1.4.11 doesn\'t define an AAA tier.</li>',
          '<li>Transparent tokens (<code>*-none</code>) are skipped — contrast is undefined against / using a transparent fill.</li>',
          '<li>Tokens whose name contains <code>-disabled</code> are intentionally low-contrast by design; the ratio is still shown but the verdict pill is labelled <em>by design</em> so the result is not misread as a bug.</li>',
        '</ul>',
      '</div>',
    '</details>'
  ].join('');
}

function pickerTriggerHtml(slot) {
  const labelText = slot === 'fg' ? 'Foreground' : 'Surface';
  return [
    '<div class="cc-picker" data-cc-slot="' + slot + '">',
      '<span class="cc-picker-label">' + labelText + '</span>',
      '<button type="button" class="cc-picker-trigger" data-cc-trigger="' + slot + '" aria-haspopup="listbox" aria-expanded="false">',
        '<span class="cc-picker-trigger-swatch" data-cc-trigger-swatch aria-hidden="true"></span>',
        '<span class="cc-picker-trigger-name" data-cc-trigger-name>—</span>',
        '<span class="cc-picker-trigger-kind" data-cc-trigger-kind></span>',
        '<span class="material-symbols-outlined cc-picker-trigger-chevron" aria-hidden="true">keyboard_arrow_down</span>',
      '</button>',
    '</div>'
  ].join('');
}

// ---------------------------------------------------------------------------
// Hero — Compare panel
// ---------------------------------------------------------------------------

function renderHero() {
  const byName = tokenLookup(_tokens);
  const fgToken = byName[_hero.fg] || byName['--uds-color-text-primary'] || _tokens.texts[0];
  const bgToken = byName[_hero.bg] || byName['--uds-color-surface-main'] || _tokens.surfaces[0];
  if (!fgToken || !bgToken) return;
  _hero.fg = fgToken.name;
  _hero.bg = bgToken.name;

  syncPickerTrigger('fg', fgToken);
  syncPickerTrigger('bg', bgToken);

  renderHeroStage(fgToken, bgToken);
  renderHeroVerdict(fgToken, bgToken);
  renderThemeStrip(fgToken, bgToken);
}

function syncPickerTrigger(slot, token) {
  const trigger = _appEl.querySelector('[data-cc-trigger="' + slot + '"]');
  if (!trigger) return;
  const swatch = trigger.querySelector('[data-cc-trigger-swatch]');
  const name = trigger.querySelector('[data-cc-trigger-name]');
  const kind = trigger.querySelector('[data-cc-trigger-kind]');
  if (swatch) {
    swatch.style.background = 'var(' + token.name + ')';
    if (slot === 'fg' && token.kind === 'border') {
      swatch.style.background = 'transparent';
      swatch.style.border = '2px solid var(' + token.name + ')';
    } else {
      swatch.style.border = '1px solid var(--uds-color-border-tertiary)';
    }
  }
  if (name) name.textContent = shortName(token.name);
  if (kind) kind.textContent = token.kind === 'surface' ? '' : KIND_LABEL[token.kind];
}

function renderHeroStage(fgToken, bgToken) {
  const stage = _appEl.querySelector('[data-cc-stage]');
  if (!stage) return;

  const isBorderFg = fgToken.kind === 'border';
  const fgColor = isBorderFg ? 'var(--uds-color-text-primary)' : 'var(' + fgToken.name + ')';

  stage.style.background = 'var(' + bgToken.name + ')';
  stage.style.color = fgColor;
  stage.dataset.fgKind = fgToken.kind;

  const heading =
    fgToken.kind === 'text' ? 'The quick brown fox jumps over the lazy dog' :
    fgToken.kind === 'icon' ? 'Icon at body, headline, and large sizes' :
                              'Border on field, chip, and outlined card';

  const sample =
    fgToken.kind === 'text'   ? renderTextStageSample(fgToken, bgToken) :
    fgToken.kind === 'icon'   ? renderIconStageSample(fgToken, bgToken) :
                                renderBorderStageSample(fgToken, bgToken);

  stage.innerHTML = [
    '<div class="cc-stage-heading">' + esc(heading) + '</div>',
    sample
  ].join('');
}

function renderTextStageSample(fgToken, bgToken) {
  const fg = 'var(' + fgToken.name + ')';
  return [
    '<p class="cc-stage-text cc-stage-text--lg" style="color:' + fg + '">',
      'Aa &mdash; 22&nbsp;px headline. Pack my box with five dozen liquor jugs.',
    '</p>',
    '<p class="cc-stage-text cc-stage-text--md" style="color:' + fg + '">',
      'Aa &mdash; 16&nbsp;px body. Sphinx of black quartz, judge my vow. The five boxing wizards jump quickly. ',
      'How vexingly quick daft zebras jump! Bright vixens jump; dozy fowl quack.',
    '</p>',
    '<p class="cc-stage-text cc-stage-text--sm" style="color:' + fg + '">',
      'Aa &mdash; 14&nbsp;px supporting copy. Waltz, bad nymph, for quick jigs vex. Glib jocks quiz nymph to vex dwarf.',
    '</p>'
  ].join('');
}

function renderIconStageSample(fgToken, bgToken) {
  const fg = 'var(' + fgToken.name + ')';
  return [
    '<div class="cc-stage-icons" style="color:' + fg + '">',
      '<span class="material-symbols-outlined cc-stage-icon--xl">favorite</span>',
      '<span class="material-symbols-outlined cc-stage-icon--lg">star</span>',
      '<span class="material-symbols-outlined cc-stage-icon--md">check_circle</span>',
      '<span class="material-symbols-outlined cc-stage-icon--md">notifications</span>',
      '<span class="material-symbols-outlined cc-stage-icon--md">settings</span>',
      '<span class="material-symbols-outlined cc-stage-icon--md">search</span>',
      '<span class="material-symbols-outlined cc-stage-icon--md">arrow_forward</span>',
    '</div>',
    '<p class="cc-stage-text cc-stage-text--sm" style="color:' + fg + '">',
      'Icons must hit 3:1 against the surface they sit on (WCAG SC&nbsp;1.4.11).',
    '</p>'
  ].join('');
}

function renderBorderStageSample(fgToken, bgToken) {
  const fg = 'var(' + fgToken.name + ')';
  return [
    '<div class="cc-stage-border-row">',
      '<span class="cc-stage-border-input" style="border-color:' + fg + '">Field with border</span>',
      '<span class="cc-stage-border-chip" style="border-color:' + fg + '">Chip outline</span>',
    '</div>',
    '<div class="cc-stage-border-card" style="border-color:' + fg + '">',
      '<strong>Outlined card</strong>',
      '<p class="cc-stage-text cc-stage-text--sm">A 1px border on this surface needs to clear 3:1 to read as a UI boundary.</p>',
    '</div>'
  ].join('');
}

function renderHeroVerdict(fgToken, bgToken) {
  const row = _appEl.querySelector('[data-cc-verdict-row]');
  if (!row) return;

  const pill = buildVerdictPill(fgToken, bgToken);
  const ratioBig = isFinite(pill.ratio)
    ? '<span class="cc-big-ratio">' + esc(formatRatio(pill.ratio)) + '</span>'
    : '<span class="cc-big-ratio cc-big-ratio--na">N/A</span>';

  const verdictBig = pill.status === 'na'
    ? '<span class="cc-big-verdict cc-big-verdict-na">Transparent</span>'
    : '<span class="cc-big-verdict cc-big-verdict-' + pill.status + '">' + esc(verdictBigLabel(pill.status, fgToken.kind)) + '</span>';

  const note = (fgToken.isDisabled || bgToken.isDisabled)
    ? '<span class="cc-big-note">Disabled tokens are intentionally low-contrast — verdict shown but treated as <em>by design</em>.</span>'
    : '<span class="cc-big-note">' + esc(verdictExplanation(pill.status, fgToken.kind)) + '</span>';

  row.innerHTML = [
    '<div class="cc-big-pair">',
      ratioBig,
      verdictBig,
    '</div>',
    note
  ].join('');
}

function verdictBigLabel(status, fgKind) {
  if (status === 'aaa') return 'Passes AAA';
  if (status === 'aa') return fgKind === 'text' ? 'Passes AA' : 'Passes AA · non-text';
  if (status === 'aa-large') return 'Passes AA · large text only';
  if (status === 'fail') return 'Fails';
  return 'N/A';
}

function verdictExplanation(status, fgKind) {
  if (fgKind === 'text') {
    if (status === 'aaa') return 'Meets WCAG 1.4.3 AAA (≥ 7:1).';
    if (status === 'aa') return 'Meets WCAG 1.4.3 AA for normal body text (≥ 4.5:1).';
    if (status === 'aa-large') return 'Meets WCAG 1.4.3 only for large text (≥ 3:1, < 4.5:1). Fails for normal body.';
    if (status === 'fail') return 'Below WCAG 1.4.3 — body text needs ≥ 4.5:1.';
  } else {
    if (status === 'aa') return 'Meets WCAG 1.4.11 Non-text Contrast (≥ 3:1).';
    if (status === 'fail') return 'Below WCAG 1.4.11 — UI elements need ≥ 3:1.';
  }
  return '';
}

// ---------------------------------------------------------------------------
// Hero — per-theme strip
// ---------------------------------------------------------------------------

function renderThemeStrip(fgToken, bgToken) {
  const host = _appEl.querySelector('[data-cc-themes]');
  if (!host) return;
  const html = THEME_PROFILES.map((profile) => {
    const fgRgb = resolveTokenInTheme(profile.id, fgToken.name);
    const bgRgb = resolveTokenInTheme(profile.id, bgToken.name);
    const pill = buildVerdictPill(fgToken, bgToken, { fg: fgRgb, bg: bgRgb });
    const surfaceRgb = bgRgb;
    const swatchBg = isTransparent(surfaceRgb)
      ? 'transparent'
      : 'rgb(' + Math.round(surfaceRgb.r) + ',' + Math.round(surfaceRgb.g) + ',' + Math.round(surfaceRgb.b) + ')';
    const fgSwatchColor = 'rgb(' + Math.round(fgRgb.r) + ',' + Math.round(fgRgb.g) + ',' + Math.round(fgRgb.b) + ')';
    const verdictIcon = pill.status === 'na'
      ? 'remove'
      : pill.status === 'fail' ? 'close' : 'check';
    return [
      '<button type="button" class="cc-theme-cell" data-cc-theme="' + esc(profile.id) + '" data-status="' + pill.status + '">',
        '<span class="cc-theme-name">' + esc(profile.label) + '</span>',
        '<span class="cc-theme-preview" style="background:' + swatchBg + ';color:' + fgSwatchColor + '">',
          fgToken.kind === 'border'
            ? '<span class="cc-theme-preview-ring" style="border-color:' + fgSwatchColor + '"></span>'
            : (fgToken.kind === 'icon'
              ? '<span class="material-symbols-outlined" aria-hidden="true">star</span>'
              : 'Aa'),
        '</span>',
        '<span class="cc-theme-result">',
          '<span class="cc-theme-icon material-symbols-outlined cc-theme-icon--' + pill.status + '" aria-hidden="true">' + verdictIcon + '</span>',
          '<span class="cc-theme-ratio">' + esc(isFinite(pill.ratio) ? formatRatio(pill.ratio) : '—') + '</span>',
        '</span>',
      '</button>'
    ].join('');
  }).join('');
  host.innerHTML = html;
}

function syncThemeStripActive() {
  const activeId = getActiveThemeProfileId();
  _appEl.querySelectorAll('[data-cc-theme]').forEach((btn) => {
    btn.classList.toggle('cc-theme-cell--active', btn.dataset.ccTheme === activeId);
  });
}

function getActiveThemeProfileId() {
  const html = document.documentElement;
  const scheme = html.getAttribute('data-color-scheme') === 'dark' ? 'dark' : 'light';
  const theme = html.getAttribute('data-theme') || '';
  if (theme === 'resman') return scheme === 'dark' ? 'resman-dark' : 'resman-light';
  if (theme === 'anyonehome') return 'anyonehome';
  if (theme === 'inhabit') return 'inhabit';
  return scheme === 'dark' ? 'base-dark' : 'base-light';
}

function applyThemeProfile(profileId) {
  const profile = THEME_PROFILES.find((p) => p.id === profileId);
  if (!profile) return;
  const html = document.documentElement;
  if (profile.attrs['data-color-scheme'] === 'dark') {
    html.setAttribute('data-color-scheme', 'dark');
  } else {
    html.setAttribute('data-color-scheme', 'light');
  }
  if (profile.attrs['data-theme']) {
    html.setAttribute('data-theme', profile.attrs['data-theme']);
  } else {
    html.setAttribute('data-theme', 'base');
  }
}

// ---------------------------------------------------------------------------
// Browse — toolbar + curated list + matrix
// ---------------------------------------------------------------------------

function renderBrowse() {
  const body = _appEl.querySelector('[data-cc-browse-body]');
  if (!body) return;
  if (_browse.view === 'curated') {
    body.innerHTML = renderCuratedList();
  } else {
    body.innerHTML = renderMatrix();
  }
}

function syncBrowseControls() {
  _appEl.querySelectorAll('[data-cc-view]').forEach((btn) => {
    const isActive = btn.dataset.ccView === _browse.view;
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.classList.toggle('cc-tab--active', isActive);
  });
  _appEl.querySelectorAll('[data-cc-kind]').forEach((btn) => {
    btn.setAttribute('aria-selected', _browse.kinds.has(btn.dataset.ccKind) ? 'true' : 'false');
  });
  const failOnly = _appEl.querySelector('[data-cc-fail-only]');
  if (failOnly) failOnly.checked = _browse.failOnly;
}

function renderCuratedList() {
  const byName = tokenLookup(_tokens);
  const rows = [];
  for (const pair of CURATED_PAIRINGS) {
    const surface = byName[pair.surface];
    if (!surface) continue;
    for (const kind of FG_KINDS) {
      if (!_browse.kinds.has(kind)) continue;
      const fgName = pair[kind];
      if (!fgName) continue;
      const fg = byName[fgName];
      if (!fg) continue;
      const pill = buildVerdictPill(fg, surface);
      if (_browse.failOnly && pill.status !== 'fail') continue;
      const isActivePair = (fg.name === _hero.fg && surface.name === _hero.bg);
      rows.push([
        '<button type="button" class="cc-curated-row' + (isActivePair ? ' cc-curated-row--active' : '') + '"',
          ' data-cc-load-fg="' + esc(fg.name) + '"',
          ' data-cc-load-bg="' + esc(surface.name) + '"',
          ' data-status="' + pill.status + '">',
          '<span class="cc-curated-title">',
            '<span class="cc-curated-pill cc-curated-pill--' + kind + '">' + esc(KIND_LABEL[kind]) + '</span>',
            '<span class="cc-curated-titletext">' + esc(pair.title) + '</span>',
          '</span>',
          '<span class="cc-curated-preview" style="background:var(' + surface.name + ')">',
            kind === 'border'
              ? '<span class="cc-curated-preview-border" style="border-color:var(' + fg.name + ')"></span>'
              : (kind === 'icon'
                ? '<span class="material-symbols-outlined" style="color:var(' + fg.name + ')" aria-hidden="true">star</span>'
                : '<span class="cc-curated-preview-text" style="color:var(' + fg.name + ')">Aa</span>'),
          '</span>',
          '<span class="cc-curated-tokens">',
            '<code class="cc-curated-token">' + esc(shortName(fg.name)) + '</code>',
            '<span class="cc-curated-on">on</span>',
            '<code class="cc-curated-token">' + esc(shortName(surface.name)) + '</code>',
          '</span>',
          '<span class="cc-curated-verdict">' + pill.html + '</span>',
          '<span class="material-symbols-outlined cc-curated-arrow" aria-hidden="true">arrow_forward</span>',
        '</button>'
      ].join(''));
    }
  }
  if (!rows.length) {
    return '<div class="cc-empty">No curated pairings match the current filters.</div>';
  }
  return '<div class="cc-curated-list">' + rows.join('') + '</div>';
}

function renderMatrix() {
  const byName = tokenLookup(_tokens);

  const cols = [];
  if (_browse.kinds.has('text'))   cols.push(..._tokens.texts);
  if (_browse.kinds.has('icon'))   cols.push(..._tokens.icons);
  if (_browse.kinds.has('border')) cols.push(..._tokens.borders);

  const surfaces = MATRIX_SURFACES.map((n) => byName[n]).filter(Boolean);

  let html = '<div class="cc-matrix-scroll"><table class="cc-matrix" role="grid">';
  html += '<thead><tr><th class="cc-matrix-corner" scope="col">';
  html += '<span class="cc-matrix-corner-label">Surface</span>';
  html += '<span class="cc-matrix-corner-arrow">↓</span>';
  html += '<span class="cc-matrix-corner-divider"></span>';
  html += '<span class="cc-matrix-corner-label">Foreground</span>';
  html += '<span class="cc-matrix-corner-arrow">→</span>';
  html += '</th>';
  for (const c of cols) {
    html += '<th class="cc-matrix-col cc-matrix-col--' + c.kind + '" scope="col" title="' + esc(c.name) + '">' +
      '<span class="cc-matrix-col-kind">' + esc(KIND_LABEL[c.kind]) + '</span>' +
      '<code class="cc-matrix-col-name">' + esc(shortName(c.name)) + '</code>' +
    '</th>';
  }
  html += '</tr></thead><tbody>';

  for (const s of surfaces) {
    let rowHasContent = false;
    let rowHtml = '<tr>';
    rowHtml += '<th class="cc-matrix-row" scope="row" title="' + esc(s.name) + '">' +
      '<span class="cc-matrix-row-swatch" style="background:var(' + s.name + ')"></span>' +
      '<code class="cc-matrix-row-name">' + esc(shortName(s.name)) + '</code>' +
    '</th>';
    for (const c of cols) {
      const pill = buildVerdictPill(c, s);
      if (_browse.failOnly && pill.status !== 'fail') {
        rowHtml += '<td class="cc-matrix-cell cc-matrix-cell--blank"></td>';
        continue;
      }
      rowHasContent = true;
      const isActive = (c.name === _hero.fg && s.name === _hero.bg);
      rowHtml += '<td class="cc-matrix-cell cc-matrix-cell--' + pill.status + (isActive ? ' cc-matrix-cell--active' : '') + '" data-kind="' + c.kind + '">' +
        '<button type="button" class="cc-matrix-cell-btn"' +
          ' data-cc-load-fg="' + esc(c.name) + '"' +
          ' data-cc-load-bg="' + esc(s.name) + '">' +
          '<div class="cc-matrix-cell-sample">' + renderSample(c, s, c.kind, 'sm') + '</div>' +
          '<div class="cc-matrix-cell-meta">' + pill.html + '</div>' +
        '</button>' +
      '</td>';
    }
    rowHtml += '</tr>';
    if (!_browse.failOnly || rowHasContent) {
      html += rowHtml;
    }
  }
  html += '</tbody></table></div>';
  return html;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function wireEvents() {
  _appEl.addEventListener('click', onAppClick);
  _appEl.addEventListener('change', onAppChange);
  document.addEventListener('keydown', onDocKeydown);
  document.addEventListener('click', onDocClickOutside, true);
}

function onAppClick(e) {
  const triggerBtn = e.target.closest('[data-cc-trigger]');
  if (triggerBtn) {
    e.stopPropagation();
    openPopover(triggerBtn.dataset.ccTrigger, triggerBtn);
    return;
  }
  const themeCell = e.target.closest('[data-cc-theme]');
  if (themeCell) {
    e.preventDefault();
    applyThemeProfile(themeCell.dataset.ccTheme);
    return;
  }
  const tab = e.target.closest('[data-cc-view]');
  if (tab) {
    e.preventDefault();
    _browse.view = tab.dataset.ccView;
    renderBrowse();
    syncBrowseControls();
    return;
  }
  const kindBtn = e.target.closest('[data-cc-kind]');
  if (kindBtn) {
    e.preventDefault();
    const k = kindBtn.dataset.ccKind;
    if (_browse.kinds.has(k)) {
      if (_browse.kinds.size > 1) _browse.kinds.delete(k);
    } else {
      _browse.kinds.add(k);
    }
    renderBrowse();
    syncBrowseControls();
    return;
  }
  const loader = e.target.closest('[data-cc-load-fg]');
  if (loader) {
    e.preventDefault();
    _hero.fg = loader.getAttribute('data-cc-load-fg') || _hero.fg;
    _hero.bg = loader.getAttribute('data-cc-load-bg') || _hero.bg;
    renderHero();
    renderBrowse();
    syncBrowseControls();
    syncThemeStripActive();
    scrollHeroIntoView();
    return;
  }
}

function onAppChange(e) {
  if (e.target.matches('[data-cc-fail-only]')) {
    _browse.failOnly = !!e.target.checked;
    renderBrowse();
    syncBrowseControls();
    return;
  }
  if (e.target.matches('[data-cc-popover-search]')) {
    renderPopoverList(_activePopover);
    return;
  }
  if (e.target.matches('[data-cc-popover-kind]')) {
    if (!_activePopover) return;
    const kind = e.target.value;
    if (e.target.checked) _activePopover.kindFilters.add(kind);
    else _activePopover.kindFilters.delete(kind);
    if (!_activePopover.kindFilters.size) _activePopover.kindFilters.add(kind);
    renderPopoverList(_activePopover);
    return;
  }
}

function onDocKeydown(e) {
  if (e.key === 'Escape' && _activePopover) {
    closePopover();
  }
}

function onDocClickOutside(e) {
  if (!_activePopover) return;
  if (_activePopover.el.contains(e.target)) return;
  if (_activePopover.triggerBtn && _activePopover.triggerBtn.contains(e.target)) return;
  closePopover();
}

function scrollHeroIntoView() {
  const hero = _appEl.querySelector('[data-cc-zone="hero"]');
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  if (rect.top < 0 || rect.top > window.innerHeight - 80) {
    hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------------------------------------------------------------------------
// Popover picker — searchable, grouped token list
// ---------------------------------------------------------------------------

function openPopover(slot, triggerBtn) {
  if (_activePopover) closePopover();

  const wrap = triggerBtn.closest('.cc-picker');
  if (!wrap) return;

  const allowedKinds = slot === 'fg'
    ? new Set(['text', 'icon', 'border'])
    : new Set(['surface']);

  const initialKinds = slot === 'fg'
    ? new Set(['text', 'icon', 'border'])
    : new Set(['surface']);

  const el = document.createElement('div');
  el.className = 'cc-popover';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', slot === 'fg' ? 'Choose foreground token' : 'Choose surface token');

  el.innerHTML = [
    '<div class="cc-popover-search-row">',
      '<span class="material-symbols-outlined cc-popover-search-icon" aria-hidden="true">search</span>',
      '<input type="text" class="cc-popover-search" data-cc-popover-search placeholder="Search tokens" autocomplete="off" spellcheck="false" />',
    '</div>',
    slot === 'fg' ? renderPopoverKindFilters(initialKinds) : '',
    '<div class="cc-popover-list" data-cc-popover-list role="listbox"></div>'
  ].join('');

  wrap.appendChild(el);
  triggerBtn.setAttribute('aria-expanded', 'true');

  _activePopover = {
    slot,
    el,
    triggerBtn,
    allowedKinds,
    kindFilters: initialKinds
  };

  renderPopoverList(_activePopover);

  // focus search after layout
  requestAnimationFrame(() => {
    const search = el.querySelector('[data-cc-popover-search]');
    if (search) search.focus();
  });
}

function closePopover() {
  if (!_activePopover) return;
  _activePopover.triggerBtn.setAttribute('aria-expanded', 'false');
  _activePopover.el.remove();
  _activePopover = null;
}

function renderPopoverKindFilters(initialKinds) {
  return [
    '<div class="cc-popover-kinds" role="group" aria-label="Filter by foreground kind">',
      FG_KINDS.map((k) => (
        '<label class="cc-popover-kind">' +
          '<input type="checkbox" data-cc-popover-kind value="' + k + '"' + (initialKinds.has(k) ? ' checked' : '') + ' />' +
          '<span>' + KIND_LABEL[k] + '</span>' +
        '</label>'
      )).join(''),
    '</div>'
  ].join('');
}

function renderPopoverList(state) {
  if (!state) return;
  const listEl = state.el.querySelector('[data-cc-popover-list]');
  if (!listEl) return;

  const search = state.el.querySelector('[data-cc-popover-search]');
  const q = (search ? search.value : '').trim().toLowerCase();

  const groups = [];
  if (state.allowedKinds.has('surface')) {
    groups.push(['surface', _tokens.surfaces]);
  }
  if (state.allowedKinds.has('text')) groups.push(['text', _tokens.texts]);
  if (state.allowedKinds.has('icon')) groups.push(['icon', _tokens.icons]);
  if (state.allowedKinds.has('border')) groups.push(['border', _tokens.borders]);

  let html = '';
  let totalShown = 0;
  for (const [kind, list] of groups) {
    if (state.slot === 'fg' && !state.kindFilters.has(kind)) continue;
    const filtered = list.filter((t) => {
      if (q && !shortName(t.name).toLowerCase().includes(q)) return false;
      return true;
    });
    if (!filtered.length) continue;
    html += '<div class="cc-popover-group">';
    html += '<div class="cc-popover-group-head">' + esc(KIND_LABEL[kind]) + ' <span class="cc-popover-group-count">' + filtered.length + '</span></div>';
    for (const t of filtered) {
      const isSelected =
        (state.slot === 'fg' && t.name === _hero.fg) ||
        (state.slot === 'bg' && t.name === _hero.bg);
      const swatchHtml = renderPopoverSwatch(t);
      html += [
        '<button type="button" class="cc-popover-option' + (isSelected ? ' cc-popover-option--selected' : '') + '" role="option" aria-selected="' + (isSelected ? 'true' : 'false') + '" data-cc-pick-name="' + esc(t.name) + '">',
          swatchHtml,
          '<code class="cc-popover-option-name">' + esc(shortName(t.name)) + '</code>',
          isSelected ? '<span class="material-symbols-outlined cc-popover-option-check" aria-hidden="true">check</span>' : '',
        '</button>'
      ].join('');
      totalShown++;
    }
    html += '</div>';
  }

  if (!totalShown) {
    html = '<div class="cc-popover-empty">No tokens match.</div>';
  }

  listEl.innerHTML = html;

  listEl.querySelectorAll('[data-cc-pick-name]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-cc-pick-name');
      if (state.slot === 'fg') _hero.fg = name;
      else _hero.bg = name;
      closePopover();
      renderHero();
      renderBrowse();
      syncBrowseControls();
      syncThemeStripActive();
    });
  });
}

function renderPopoverSwatch(token) {
  if (token.kind === 'border') {
    return '<span class="cc-popover-swatch cc-popover-swatch--border" style="border-color:var(' + token.name + ');background:var(--uds-color-surface-main);"></span>';
  }
  return '<span class="cc-popover-swatch" style="background:var(' + token.name + ')"></span>';
}
