'use client';

// Contrast Checker — React port of docs/modules/contrast-checker/index.js
// (1,127 lines). Same three-zone layout as the legacy tool:
//
//   1. Hero "Compare" panel — pick one foreground × one surface, see the
//      pair rendered at real reading scale on the actual surface fill,
//      with a big WCAG ratio + verdict and a per-theme strip showing the
//      same pair evaluated across all 6 supported themes via hidden
//      detached probe divs.
//   2. "Browse" — segmented toggle between curated semantic pairings and
//      a full surface × foreground matrix. Click any row/cell to load
//      it into the Compare panel. Filters: kind chips + "Only failing".
//   3. WCAG threshold reference — collapsed <details> at the bottom.
//
// Theme reactivity: instead of the legacy MutationObserver on <html>
// data-attributes, this version consumes useUdsTheme() — the React
// re-render on theme change re-fires the resolve effect.
//
// Static-export safety: every DOM-touching utility is gated on
// `typeof document !== 'undefined'`. The page renders an empty shell on
// the server and hydrates on the client.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  classifyVerdict,
  contrastRatio,
  formatRatio,
  isTransparent,
  verdictBigLabel,
  verdictClass,
  verdictExplanation,
  verdictLabel,
  type FgKind,
  type Rgb,
  type Verdict,
} from '@/lib/color-math';
import {
  CURATED_PAIRINGS,
  FG_KINDS,
  KIND_LABEL,
  MATRIX_SURFACES,
  THEME_PROFILES,
  type ThemeProfile,
  type ThemeProfileId,
} from '@/lib/contrast-checker-data';
import {
  disposeProbes,
  ensureThemeProbes,
  harvestTokens,
  resolveAllTokens,
  resolveTokenInTheme,
  shortName,
  tokenLookup,
  type Token,
  type TokenSet,
} from '@/lib/uds-token-probes';

import '../../styles/pages/contrast-checker.css';
import { useUdsTheme, type ColorScheme, type Theme } from './UdsThemeProvider';
import { ContrastCheckerPicker } from './ContrastCheckerPicker';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_FG = '--uds-color-text-primary';
const DEFAULT_BG = '--uds-color-surface-main';

interface HeroState {
  fg: string;
  bg: string;
}

interface BrowseState {
  view: 'curated' | 'matrix';
  kinds: Set<Exclude<FgKind, 'surface'>>;
  failOnly: boolean;
}

// ---------------------------------------------------------------------------
// Verdict helpers (HTML-flavoured legacy buildVerdictPill turned into props)
// ---------------------------------------------------------------------------

interface VerdictResult {
  status: Verdict;
  ratio: number;
  isByDesign: boolean;
}

function evaluatePair(
  fgToken: Token | undefined,
  bgToken: Token | undefined,
  rgbOverride?: { fg: Rgb; bg: Rgb },
): VerdictResult {
  if (!fgToken || !bgToken) {
    return { status: 'na', ratio: NaN, isByDesign: false };
  }
  if (fgToken.isNone || bgToken.isNone) {
    return { status: 'na', ratio: NaN, isByDesign: false };
  }
  const fgRgb = rgbOverride?.fg ?? fgToken.rgb;
  const bgRgb = rgbOverride?.bg ?? bgToken.rgb;
  if (!fgRgb || !bgRgb || isTransparent(fgRgb) || isTransparent(bgRgb)) {
    return { status: 'na', ratio: NaN, isByDesign: false };
  }
  const ratio = contrastRatio(fgRgb, bgRgb);
  const status = classifyVerdict(ratio, fgToken.kind);
  return { status, ratio, isByDesign: fgToken.isDisabled || bgToken.isDisabled };
}

function VerdictPill({
  fgToken,
  bgToken,
  rgbOverride,
}: {
  fgToken: Token | undefined;
  bgToken: Token | undefined;
  rgbOverride?: { fg: Rgb; bg: Rgb };
}) {
  const v = evaluatePair(fgToken, bgToken, rgbOverride);
  if (v.status === 'na' || !fgToken) {
    return <span className="cc-verdict cc-verdict-na">Transparent — N/A</span>;
  }
  return (
    <>
      <span className="cc-ratio">{formatRatio(v.ratio)}</span>
      <span className={verdictClass(v.status)}>
        {verdictLabel(v.status, fgToken.kind)}
      </span>
      {v.isByDesign && (
        <span className="cc-by-design">
          by&nbsp;design
        </span>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Theme profile <-> theme state plumbing
// ---------------------------------------------------------------------------

function profileAttrsToState(profile: ThemeProfile): {
  colorScheme: ColorScheme;
  theme: Theme;
} {
  const colorScheme: ColorScheme = profile.attrs['data-color-scheme'] === 'dark' ? 'dark' : '';
  const themeAttr = profile.attrs['data-theme'];
  const theme: Theme =
    themeAttr === 'resman'
      ? 'resman'
      : themeAttr === 'anyonehome'
        ? 'anyonehome'
        : themeAttr === 'inhabit'
          ? 'inhabit'
          : '';
  return { colorScheme, theme };
}

function activeThemeProfileId(scheme: ColorScheme, theme: Theme): ThemeProfileId {
  if (theme === 'resman') return scheme === 'dark' ? 'resman-dark' : 'resman-light';
  if (theme === 'anyonehome') return 'anyonehome';
  if (theme === 'inhabit') return 'inhabit';
  return scheme === 'dark' ? 'base-dark' : 'base-light';
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ContrastChecker() {
  const themeCtx = useUdsTheme();
  const [tokens, setTokens] = useState<TokenSet | null>(null);
  const [hero, setHero] = useState<HeroState>({ fg: DEFAULT_FG, bg: DEFAULT_BG });
  const [browse, setBrowse] = useState<BrowseState>({
    view: 'curated',
    kinds: new Set(FG_KINDS),
    failOnly: false,
  });
  const [popoverSlot, setPopoverSlot] = useState<'fg' | 'bg' | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const fgTriggerRef = useRef<HTMLButtonElement>(null);
  const bgTriggerRef = useRef<HTMLButtonElement>(null);

  // Mount-once token harvest + theme-probe creation.
  useEffect(() => {
    ensureThemeProbes();
    const harvested = harvestTokens();
    resolveAllTokens(harvested);
    setTokens(harvested);
    return () => {
      disposeProbes();
    };
  }, []);

  // Re-resolve every token's RGB after any theme change. The theme-strip
  // probes are theme-isolated and don't need re-creation; only the live
  // RGBs flip. requestAnimationFrame defers the read until after the
  // CSSOM has applied the new <html> attributes (the UdsThemeProvider
  // sets them in its own useEffect, which runs in the same commit).
  useEffect(() => {
    if (!tokens) return;
    const raf = requestAnimationFrame(() => {
      resolveAllTokens(tokens);
      // Trigger a re-render by replacing the tokens ref with a shallow
      // copy — the inner Token objects mutated in-place are unchanged
      // identity-wise.
      setTokens({ ...tokens });
    });
    return () => cancelAnimationFrame(raf);
    // We deliberately don't include `tokens` in the deps — that would
    // loop. The theme state is the only signal that should refire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeCtx.colorScheme, themeCtx.theme, themeCtx.font, themeCtx.fontScale, themeCtx.density]);

  const byName = useMemo(() => (tokens ? tokenLookup(tokens) : {}), [tokens]);
  const fgToken: Token | undefined =
    byName[hero.fg] ??
    byName[DEFAULT_FG] ??
    tokens?.texts[0];
  const bgToken: Token | undefined =
    byName[hero.bg] ??
    byName[DEFAULT_BG] ??
    tokens?.surfaces[0];

  // If the resolved tokens differ from the stored hero (e.g. fallback
  // kicked in because the user opened a deep link with a stale token
  // name), commit the resolved names so picker UI agrees with reality.
  useEffect(() => {
    if (!tokens) return;
    if (fgToken && fgToken.name !== hero.fg) setHero((h) => ({ ...h, fg: fgToken.name }));
    if (bgToken && bgToken.name !== hero.bg) setHero((h) => ({ ...h, bg: bgToken.name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

  const onPickToken = useCallback(
    (slot: 'fg' | 'bg', tokenName: string) => {
      setHero((h) => ({ ...h, [slot]: tokenName }));
      setPopoverSlot(null);
    },
    [],
  );

  const onLoadPair = useCallback(
    (fgName: string, bgName: string) => {
      setHero({ fg: fgName, bg: bgName });
      // Scroll hero into view if it's offscreen.
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight - 80) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [],
  );

  const activeProfileId = activeThemeProfileId(themeCtx.colorScheme, themeCtx.theme);

  if (!tokens) {
    return (
      <section className="cc-app" data-cc-zone="loading">
        <p className="cc-loading">Loading tokens…</p>
      </section>
    );
  }

  return (
    <section className="cc-app">
      <section className="cc-hero" data-cc-zone="hero" ref={heroRef}>
        <div className="cc-pickers">
          <PickerTrigger
            slot="fg"
            triggerRef={fgTriggerRef}
            token={fgToken}
            open={popoverSlot === 'fg'}
            onClick={() => setPopoverSlot((s) => (s === 'fg' ? null : 'fg'))}
          />
          <span className="cc-pickers-on" aria-hidden="true">
            on
          </span>
          <PickerTrigger
            slot="bg"
            triggerRef={bgTriggerRef}
            token={bgToken}
            open={popoverSlot === 'bg'}
            onClick={() => setPopoverSlot((s) => (s === 'bg' ? null : 'bg'))}
          />
        </div>

        {popoverSlot === 'fg' && (
          <ContrastCheckerPicker
            slot="fg"
            tokens={tokens}
            selected={hero.fg}
            anchorRef={fgTriggerRef}
            onSelect={(name) => onPickToken('fg', name)}
            onClose={() => setPopoverSlot(null)}
          />
        )}
        {popoverSlot === 'bg' && (
          <ContrastCheckerPicker
            slot="bg"
            tokens={tokens}
            selected={hero.bg}
            anchorRef={bgTriggerRef}
            onSelect={(name) => onPickToken('bg', name)}
            onClose={() => setPopoverSlot(null)}
          />
        )}

        <HeroStage fgToken={fgToken} bgToken={bgToken} />
        <HeroVerdict fgToken={fgToken} bgToken={bgToken} />

        <div className="cc-themes-wrap">
          <div className="cc-themes-head">
            <span className="cc-themes-label">Across themes</span>
            <span className="cc-themes-hint">Click any theme to apply it globally</span>
          </div>
          <div className="cc-themes">
            {THEME_PROFILES.map((profile) => (
              <ThemeCell
                key={profile.id}
                profile={profile}
                fgToken={fgToken}
                bgToken={bgToken}
                active={profile.id === activeProfileId}
                onApply={() => themeCtx.setThemeState(profileAttrsToState(profile))}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="cc-browse" data-cc-zone="browse">
        <BrowseToolbar browse={browse} setBrowse={setBrowse} />
        <div className="cc-browse-body">
          {browse.view === 'curated' ? (
            <CuratedList
              tokens={tokens}
              hero={hero}
              browse={browse}
              onLoadPair={onLoadPair}
            />
          ) : (
            <MatrixView
              tokens={tokens}
              hero={hero}
              browse={browse}
              onLoadPair={onLoadPair}
            />
          )}
        </div>
      </section>

      <HelpDetails />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Picker trigger
// ---------------------------------------------------------------------------

function PickerTrigger({
  slot,
  triggerRef,
  token,
  open,
  onClick,
}: {
  slot: 'fg' | 'bg';
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  token: Token | undefined;
  open: boolean;
  onClick: () => void;
}) {
  const labelText = slot === 'fg' ? 'Foreground' : 'Surface';
  const swatchStyle: React.CSSProperties =
    slot === 'fg' && token?.kind === 'border'
      ? {
          background: 'transparent',
          border: `2px solid var(${token.name})`,
        }
      : {
          background: token ? `var(${token.name})` : 'transparent',
          border: '1px solid var(--uds-color-border-tertiary)',
        };
  return (
    <div className="cc-picker" data-cc-slot={slot}>
      <span className="cc-picker-label">{labelText}</span>
      <button
        ref={triggerRef}
        type="button"
        className="cc-picker-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onClick}
      >
        <span className="cc-picker-trigger-swatch" style={swatchStyle} aria-hidden="true" />
        <span className="cc-picker-trigger-name">
          {token ? shortName(token.name) : '—'}
        </span>
        <span className="cc-picker-trigger-kind">
          {token && token.kind !== 'surface' ? KIND_LABEL[token.kind] : ''}
        </span>
        <span
          className="material-symbols-outlined cc-picker-trigger-chevron"
          aria-hidden="true"
        >
          keyboard_arrow_down
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero — stage (text/icon/border sample)
// ---------------------------------------------------------------------------

function HeroStage({
  fgToken,
  bgToken,
}: {
  fgToken: Token | undefined;
  bgToken: Token | undefined;
}) {
  if (!fgToken || !bgToken) return null;

  const isBorderFg = fgToken.kind === 'border';
  const fgColor = isBorderFg ? 'var(--uds-color-text-primary)' : `var(${fgToken.name})`;
  const heading =
    fgToken.kind === 'text'
      ? 'The quick brown fox jumps over the lazy dog'
      : fgToken.kind === 'icon'
        ? 'Icon at body, headline, and large sizes'
        : 'Border on field, chip, and outlined card';

  return (
    <div
      className="cc-hero-stage"
      data-cc-stage
      data-fg-kind={fgToken.kind}
      style={{
        background: `var(${bgToken.name})`,
        color: fgColor,
      }}
    >
      <div className="cc-stage-heading">{heading}</div>
      {fgToken.kind === 'text' && <TextStageSample fgToken={fgToken} />}
      {fgToken.kind === 'icon' && <IconStageSample fgToken={fgToken} />}
      {fgToken.kind === 'border' && <BorderStageSample fgToken={fgToken} />}
    </div>
  );
}

function TextStageSample({ fgToken }: { fgToken: Token }) {
  const fg = `var(${fgToken.name})`;
  return (
    <>
      <p className="cc-stage-text cc-stage-text--lg" style={{ color: fg }}>
        Aa — 22 px headline. Pack my box with five dozen liquor jugs.
      </p>
      <p className="cc-stage-text cc-stage-text--md" style={{ color: fg }}>
        Aa — 16 px body. Sphinx of black quartz, judge my vow. The five boxing
        wizards jump quickly. How vexingly quick daft zebras jump! Bright vixens
        jump; dozy fowl quack.
      </p>
      <p className="cc-stage-text cc-stage-text--sm" style={{ color: fg }}>
        Aa — 14 px supporting copy. Waltz, bad nymph, for quick jigs vex. Glib
        jocks quiz nymph to vex dwarf.
      </p>
    </>
  );
}

function IconStageSample({ fgToken }: { fgToken: Token }) {
  const fg = `var(${fgToken.name})`;
  return (
    <>
      <div className="cc-stage-icons" style={{ color: fg }}>
        <span className="material-symbols-outlined cc-stage-icon--xl">favorite</span>
        <span className="material-symbols-outlined cc-stage-icon--lg">star</span>
        <span className="material-symbols-outlined cc-stage-icon--md">check_circle</span>
        <span className="material-symbols-outlined cc-stage-icon--md">notifications</span>
        <span className="material-symbols-outlined cc-stage-icon--md">settings</span>
        <span className="material-symbols-outlined cc-stage-icon--md">search</span>
        <span className="material-symbols-outlined cc-stage-icon--md">arrow_forward</span>
      </div>
      <p className="cc-stage-text cc-stage-text--sm" style={{ color: fg }}>
        Icons must hit 3:1 against the surface they sit on (WCAG SC 1.4.11).
      </p>
    </>
  );
}

function BorderStageSample({ fgToken }: { fgToken: Token }) {
  const fg = `var(${fgToken.name})`;
  return (
    <>
      <div className="cc-stage-border-row">
        <span className="cc-stage-border-input" style={{ borderColor: fg }}>
          Field with border
        </span>
        <span className="cc-stage-border-chip" style={{ borderColor: fg }}>
          Chip outline
        </span>
      </div>
      <div className="cc-stage-border-card" style={{ borderColor: fg }}>
        <strong>Outlined card</strong>
        <p className="cc-stage-text cc-stage-text--sm">
          A 1px border on this surface needs to clear 3:1 to read as a UI
          boundary.
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Hero — big verdict pill
// ---------------------------------------------------------------------------

function HeroVerdict({
  fgToken,
  bgToken,
}: {
  fgToken: Token | undefined;
  bgToken: Token | undefined;
}) {
  if (!fgToken || !bgToken) return null;
  const v = evaluatePair(fgToken, bgToken);
  return (
    <div className="cc-verdict-row" data-cc-verdict-row>
      <div className="cc-big-pair">
        {isFinite(v.ratio) ? (
          <span className="cc-big-ratio">{formatRatio(v.ratio)}</span>
        ) : (
          <span className="cc-big-ratio cc-big-ratio--na">N/A</span>
        )}
        {v.status === 'na' ? (
          <span className="cc-big-verdict cc-big-verdict-na">Transparent</span>
        ) : (
          <span className={`cc-big-verdict cc-big-verdict-${v.status}`}>
            {verdictBigLabel(v.status, fgToken.kind)}
          </span>
        )}
      </div>
      {v.isByDesign ? (
        <span className="cc-big-note">
          Disabled tokens are intentionally low-contrast — verdict shown but
          treated as <em>by design</em>.
        </span>
      ) : (
        <span className="cc-big-note">{verdictExplanation(v.status, fgToken.kind)}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-theme strip
// ---------------------------------------------------------------------------

function ThemeCell({
  profile,
  fgToken,
  bgToken,
  active,
  onApply,
}: {
  profile: ThemeProfile;
  fgToken: Token | undefined;
  bgToken: Token | undefined;
  active: boolean;
  onApply: () => void;
}) {
  // Resolve this profile's RGBs lazily on render. resolveTokenInTheme
  // re-uses the cached probe element; cost is two getComputedStyle reads.
  const v = useMemo(() => {
    if (!fgToken || !bgToken) {
      return { status: 'na' as Verdict, ratio: NaN, fgRgb: null, bgRgb: null };
    }
    const fgRgb = resolveTokenInTheme(profile.id, fgToken.name);
    const bgRgb = resolveTokenInTheme(profile.id, bgToken.name);
    const evaluated = evaluatePair(fgToken, bgToken, { fg: fgRgb, bg: bgRgb });
    return { status: evaluated.status, ratio: evaluated.ratio, fgRgb, bgRgb };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id, fgToken, bgToken, fgToken?.rgb, bgToken?.rgb]);

  const swatchBg =
    v.bgRgb && !isTransparent(v.bgRgb)
      ? `rgb(${Math.round(v.bgRgb.r)},${Math.round(v.bgRgb.g)},${Math.round(v.bgRgb.b)})`
      : 'transparent';
  const fgSwatchColor = v.fgRgb
    ? `rgb(${Math.round(v.fgRgb.r)},${Math.round(v.fgRgb.g)},${Math.round(v.fgRgb.b)})`
    : 'transparent';
  const icon =
    v.status === 'na'
      ? 'remove'
      : v.status === 'fail'
        ? 'close'
        : 'check';

  return (
    <button
      type="button"
      className={'cc-theme-cell' + (active ? ' cc-theme-cell--active' : '')}
      data-cc-theme={profile.id}
      data-status={v.status}
      onClick={onApply}
    >
      <span className="cc-theme-name">{profile.label}</span>
      <span
        className="cc-theme-preview"
        style={{ background: swatchBg, color: fgSwatchColor }}
      >
        {fgToken?.kind === 'border' ? (
          <span
            className="cc-theme-preview-ring"
            style={{ borderColor: fgSwatchColor }}
          />
        ) : fgToken?.kind === 'icon' ? (
          <span className="material-symbols-outlined" aria-hidden="true">
            star
          </span>
        ) : (
          'Aa'
        )}
      </span>
      <span className="cc-theme-result">
        <span
          className={`cc-theme-icon material-symbols-outlined cc-theme-icon--${v.status}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="cc-theme-ratio">
          {isFinite(v.ratio) ? formatRatio(v.ratio) : '—'}
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Browse toolbar (tabs + filters)
// ---------------------------------------------------------------------------

function BrowseToolbar({
  browse,
  setBrowse,
}: {
  browse: BrowseState;
  setBrowse: React.Dispatch<React.SetStateAction<BrowseState>>;
}) {
  return (
    <div className="cc-browse-toolbar">
      <div className="cc-browse-tabs" role="tablist" aria-label="Browse view">
        <BrowseTab
          value="curated"
          activeValue={browse.view}
          onSelect={(v) => setBrowse((b) => ({ ...b, view: v }))}
        >
          Common pairings
        </BrowseTab>
        <BrowseTab
          value="matrix"
          activeValue={browse.view}
          onSelect={(v) => setBrowse((b) => ({ ...b, view: v }))}
        >
          Full matrix
        </BrowseTab>
      </div>

      <div className="cc-browse-filters">
        <span className="cc-browse-filters-label">Show:</span>
        {FG_KINDS.map((k) => {
          const active = browse.kinds.has(k);
          return (
            <button
              key={k}
              type="button"
              className="udc-chip cc-kind-chip"
              data-variant="filter"
              data-cc-kind={k}
              aria-selected={active}
              onClick={() =>
                setBrowse((b) => {
                  const kinds = new Set(b.kinds);
                  if (kinds.has(k)) {
                    if (kinds.size > 1) kinds.delete(k);
                  } else {
                    kinds.add(k);
                  }
                  return { ...b, kinds };
                })
              }
            >
              <span className="udc-chip__leading-icon">
                <span className="material-symbols-outlined" aria-hidden="true">
                  check
                </span>
              </span>
              <span className="udc-chip__label">{KIND_LABEL[k]}</span>
            </button>
          );
        })}
        <label className="cc-fail-only">
          <input
            type="checkbox"
            checked={browse.failOnly}
            onChange={(e) => setBrowse((b) => ({ ...b, failOnly: e.target.checked }))}
          />
          <span>Only failing</span>
        </label>
      </div>
    </div>
  );
}

function BrowseTab({
  value,
  activeValue,
  onSelect,
  children,
}: {
  value: 'curated' | 'matrix';
  activeValue: string;
  onSelect: (v: 'curated' | 'matrix') => void;
  children: ReactNode;
}) {
  const active = value === activeValue;
  return (
    <button
      type="button"
      className={'cc-tab' + (active ? ' cc-tab--active' : '')}
      data-cc-view={value}
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(value)}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Curated list
// ---------------------------------------------------------------------------

function CuratedList({
  tokens,
  hero,
  browse,
  onLoadPair,
}: {
  tokens: TokenSet;
  hero: HeroState;
  browse: BrowseState;
  onLoadPair: (fg: string, bg: string) => void;
}) {
  const byName = tokenLookup(tokens);
  const rows: ReactNode[] = [];

  for (const pair of CURATED_PAIRINGS) {
    const surface = byName[pair.surface];
    if (!surface) continue;
    for (const kind of FG_KINDS) {
      if (!browse.kinds.has(kind)) continue;
      const fgName = pair[kind];
      if (!fgName) continue;
      const fg = byName[fgName];
      if (!fg) continue;
      const v = evaluatePair(fg, surface);
      if (browse.failOnly && v.status !== 'fail') continue;
      const isActivePair = fg.name === hero.fg && surface.name === hero.bg;

      rows.push(
        <button
          key={`${pair.surface}__${kind}__${fgName}`}
          type="button"
          className={'cc-curated-row' + (isActivePair ? ' cc-curated-row--active' : '')}
          data-status={v.status}
          onClick={() => onLoadPair(fg.name, surface.name)}
        >
          <span className="cc-curated-title">
            <span className={`cc-curated-pill cc-curated-pill--${kind}`}>
              {KIND_LABEL[kind]}
            </span>
            <span className="cc-curated-titletext">{pair.title}</span>
          </span>
          <span
            className="cc-curated-preview"
            style={{ background: `var(${surface.name})` }}
          >
            {kind === 'border' ? (
              <span
                className="cc-curated-preview-border"
                style={{ borderColor: `var(${fg.name})` }}
              />
            ) : kind === 'icon' ? (
              <span
                className="material-symbols-outlined"
                style={{ color: `var(${fg.name})` }}
                aria-hidden="true"
              >
                star
              </span>
            ) : (
              <span
                className="cc-curated-preview-text"
                style={{ color: `var(${fg.name})` }}
              >
                Aa
              </span>
            )}
          </span>
          <span className="cc-curated-tokens">
            <code className="cc-curated-token">{shortName(fg.name)}</code>
            <span className="cc-curated-on">on</span>
            <code className="cc-curated-token">{shortName(surface.name)}</code>
          </span>
          <span className="cc-curated-verdict">
            <VerdictPill fgToken={fg} bgToken={surface} />
          </span>
          <span
            className="material-symbols-outlined cc-curated-arrow"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </button>,
      );
    }
  }

  if (!rows.length) {
    return <div className="cc-empty">No curated pairings match the current filters.</div>;
  }
  return <div className="cc-curated-list">{rows}</div>;
}

// ---------------------------------------------------------------------------
// Full-matrix view
// ---------------------------------------------------------------------------

function MatrixView({
  tokens,
  hero,
  browse,
  onLoadPair,
}: {
  tokens: TokenSet;
  hero: HeroState;
  browse: BrowseState;
  onLoadPair: (fg: string, bg: string) => void;
}) {
  const byName = tokenLookup(tokens);
  const cols: Token[] = [];
  if (browse.kinds.has('text')) cols.push(...tokens.texts);
  if (browse.kinds.has('icon')) cols.push(...tokens.icons);
  if (browse.kinds.has('border')) cols.push(...tokens.borders);
  const surfaces = MATRIX_SURFACES.map((n) => byName[n]).filter(Boolean) as Token[];

  return (
    <div className="cc-matrix-scroll">
      <table className="cc-matrix" role="grid">
        <thead>
          <tr>
            <th className="cc-matrix-corner" scope="col">
              <span className="cc-matrix-corner-label">Surface</span>
              <span className="cc-matrix-corner-arrow">↓</span>
              <span className="cc-matrix-corner-divider" />
              <span className="cc-matrix-corner-label">Foreground</span>
              <span className="cc-matrix-corner-arrow">→</span>
            </th>
            {cols.map((c) => (
              <th
                key={c.name}
                className={`cc-matrix-col cc-matrix-col--${c.kind}`}
                scope="col"
                title={c.name}
              >
                <span className="cc-matrix-col-kind">{KIND_LABEL[c.kind]}</span>
                <code className="cc-matrix-col-name">{shortName(c.name)}</code>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {surfaces.map((s) => {
            let rowHasContent = false;
            const cellNodes = cols.map((c) => {
              const v = evaluatePair(c, s);
              if (browse.failOnly && v.status !== 'fail') {
                return (
                  <td
                    key={c.name}
                    className="cc-matrix-cell cc-matrix-cell--blank"
                  />
                );
              }
              rowHasContent = true;
              const isActive = c.name === hero.fg && s.name === hero.bg;
              return (
                <td
                  key={c.name}
                  className={
                    'cc-matrix-cell cc-matrix-cell--' +
                    v.status +
                    (isActive ? ' cc-matrix-cell--active' : '')
                  }
                  data-kind={c.kind}
                >
                  <button
                    type="button"
                    className="cc-matrix-cell-btn"
                    onClick={() => onLoadPair(c.name, s.name)}
                  >
                    <div className="cc-matrix-cell-sample">
                      <MatrixCellSample fgToken={c} bgToken={s} />
                    </div>
                    <div className="cc-matrix-cell-meta">
                      <VerdictPill fgToken={c} bgToken={s} />
                    </div>
                  </button>
                </td>
              );
            });
            if (browse.failOnly && !rowHasContent) return null;
            return (
              <tr key={s.name}>
                <th className="cc-matrix-row" scope="row" title={s.name}>
                  <span
                    className="cc-matrix-row-swatch"
                    style={{ background: `var(${s.name})` }}
                  />
                  <code className="cc-matrix-row-name">{shortName(s.name)}</code>
                </th>
                {cellNodes}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatrixCellSample({
  fgToken,
  bgToken,
}: {
  fgToken: Token;
  bgToken: Token;
}) {
  if (fgToken.kind === 'text') {
    return (
      <span
        className="cc-sample cc-sample--text cc-sample--sm"
        style={{ color: `var(${fgToken.name})`, background: `var(${bgToken.name})` }}
      >
        Aa
      </span>
    );
  }
  if (fgToken.kind === 'icon') {
    return (
      <span
        className="cc-sample cc-sample--icon cc-sample--sm"
        style={{ color: `var(${fgToken.name})`, background: `var(${bgToken.name})` }}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          star
        </span>
      </span>
    );
  }
  return (
    <span
      className="cc-sample cc-sample--border cc-sample--sm"
      style={{
        borderColor: `var(${fgToken.name})`,
        background: `var(${bgToken.name})`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Help (collapsible WCAG threshold ref)
// ---------------------------------------------------------------------------

function HelpDetails() {
  return (
    <details className="cc-help">
      <summary className="cc-help-summary">
        <span className="material-symbols-outlined" aria-hidden="true">
          help_outline
        </span>
        WCAG thresholds and conventions
      </summary>
      <div className="cc-help-body">
        <ul className="cc-help-list">
          <li>
            <strong>Text</strong> — WCAG SC 1.4.3: <strong>4.5:1</strong> for
            normal body (AA), <strong>7:1</strong> for AAA, <strong>3:1</strong>{' '}
            for large text (18 pt+ regular or 14 pt+ bold).
          </li>
          <li>
            <strong>Icons</strong> and <strong>borders</strong> — WCAG SC 1.4.11
            Non-text Contrast: <strong>3:1</strong> against the adjacent
            surface. SC 1.4.11 doesn&apos;t define an AAA tier.
          </li>
          <li>
            Transparent tokens (<code>*-none</code>) are skipped — contrast is
            undefined against / using a transparent fill.
          </li>
          <li>
            Tokens whose name contains <code>-disabled</code> are intentionally
            low-contrast by design; the ratio is still shown but the verdict
            pill is labelled <em>by design</em> so the result is not misread as
            a bug.
          </li>
        </ul>
      </div>
    </details>
  );
}
