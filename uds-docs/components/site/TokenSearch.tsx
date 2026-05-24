'use client';

// Token Search command palette — keyboard-accessible search over every
// --uds-* CSS custom property declared in the loaded stylesheets.
// Open with `/` or Cmd/Ctrl+K, type to filter, Enter to copy var(--name)
// to clipboard.
//
// Direct port of docs/modules/token-search/index.js (Phase 15a) into a
// single client component. The legacy version mounted a static modal in
// index.html and wired imperative listeners against the DOM; this version
// owns the trigger button + modal markup and keeps state in React. The
// token-index walk over document.styleSheets is identical to the legacy
// code (Variables aren't introspectable in the CSSOM for some browsers,
// so we walk rules first and fall back to getComputedStyle on :root).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import '../../styles/site/token-search.css';

type TokenCategory =
  | 'color'
  | 'space'
  | 'font'
  | 'border'
  | 'shadow'
  | 'primitive'
  | 'other';

interface Token {
  name: string;
  value: string;
  category: TokenCategory;
}

const CATEGORY_ORDER: TokenCategory[] = [
  'color',
  'font',
  'space',
  'border',
  'shadow',
  'primitive',
  'other',
];

function tokenCategory(name: string): TokenCategory {
  if (name.indexOf('--uds-color-') === 0) return 'color';
  if (name.indexOf('--uds-space-') === 0) return 'space';
  if (name.indexOf('--uds-font-') === 0) return 'font';
  if (name.indexOf('--uds-border-') === 0) return 'border';
  if (name.indexOf('--uds-shadow-') === 0 || name.indexOf('--uds-overlay-') === 0)
    return 'shadow';
  if (name.indexOf('--uds-primitive-') === 0) return 'primitive';
  return 'other';
}

function isColorValue(v: string): boolean {
  if (!v) return false;
  return /^#|^rgb|^hsl|^oklch|^color\(/i.test(v.trim());
}

/**
 * buildTokenIndex() — walks every loaded stylesheet, harvests --uds-*
 * custom properties, falls back to getComputedStyle on :root for any
 * token whose declaration isn't introspectable. Resolves var() chains.
 * Pure function — caller memoizes the result for the session.
 */
function buildTokenIndex(): Token[] {
  const tokens: Token[] = [];
  const seen: Record<string, true> = {};

  function walkRules(rules: CSSRuleList | undefined) {
    if (!rules) return;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i] as CSSRule & {
        cssRules?: CSSRuleList;
        style?: CSSStyleDeclaration;
      };
      if (rule.cssRules) walkRules(rule.cssRules);
      const style = rule.style;
      if (!style) continue;
      for (let j = 0; j < style.length; j++) {
        const name = style[j];
        if (name.indexOf('--uds-') !== 0) continue;
        if (seen[name]) continue;
        seen[name] = true;
        const value = style.getPropertyValue(name).trim();
        tokens.push({ name, value, category: tokenCategory(name) });
      }
    }
  }

  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    let rules: CSSRuleList | undefined;
    try {
      rules = sheet.cssRules ?? undefined;
    } catch {
      continue;
    }
    walkRules(rules);
  }

  // Fallback: read computed style on :root for any tokens we missed
  // (e.g. cross-origin sheets, vendor browser quirks).
  const computed = getComputedStyle(document.documentElement);
  for (let i = 0; i < computed.length; i++) {
    const name = computed[i];
    if (name.indexOf('--uds-') !== 0 || seen[name]) continue;
    seen[name] = true;
    tokens.push({
      name,
      value: computed.getPropertyValue(name).trim(),
      category: tokenCategory(name),
    });
  }

  // Resolve var() chains so the swatch + value column show the final
  // computed string, not "var(--foo)".
  for (const t of tokens) {
    if (t.value && t.value.indexOf('var(') === 0) {
      const resolved = computed.getPropertyValue(t.name).trim();
      if (resolved) t.value = resolved;
    }
  }

  // Semantic before primitive, then alphabetical within each group.
  tokens.sort((a, b) => {
    const aPrim = a.name.indexOf('--uds-primitive-') === 0 ? 1 : 0;
    const bPrim = b.name.indexOf('--uds-primitive-') === 0 ? 1 : 0;
    if (aPrim !== bPrim) return aPrim - bPrim;
    return a.name.localeCompare(b.name);
  });

  return tokens;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filterTokens(tokens: Token[], query: string): Token[] {
  if (!query) return tokens.slice();
  const q = query.toLowerCase().replace(/^--/, '');
  return tokens.filter(
    (t) =>
      t.name.toLowerCase().indexOf(q) !== -1 ||
      t.value.toLowerCase().indexOf(q) !== -1,
  );
}

function groupByCategory(tokens: Token[]): Partial<Record<TokenCategory, Token[]>> {
  const groups: Partial<Record<TokenCategory, Token[]>> = {};
  for (const t of tokens) {
    const list = groups[t.category] ?? (groups[t.category] = []);
    list.push(t);
  }
  return groups;
}

interface HighlightPart {
  text: string;
  mark: boolean;
}

function splitHighlight(name: string, query: string): HighlightPart[] {
  if (!query) return [{ text: name, mark: false }];
  const q = query.replace(/^--/, '');
  if (!q) return [{ text: name, mark: false }];
  const parts: HighlightPart[] = [];
  const re = new RegExp(escapeRegex(q), 'gi');
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(name)) !== null) {
    if (match.index > last) parts.push({ text: name.slice(last, match.index), mark: false });
    parts.push({ text: match[0], mark: true });
    last = match.index + match[0].length;
    if (match[0].length === 0) re.lastIndex++;
  }
  if (last < name.length) parts.push({ text: name.slice(last), mark: false });
  return parts;
}

// ---------------------------------------------------------------------------
// TokenSearch (trigger button + modal)
// ---------------------------------------------------------------------------

export function TokenSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Token index is built lazily on first open and memoized in a ref so
  // every subsequent open reuses it. The first build is ~5–10ms on a
  // production stylesheet; not worth re-walking.
  const indexRef = useRef<Token[] | null>(null);
  const [indexReady, setIndexReady] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const ensureIndex = useCallback(() => {
    if (indexRef.current) return;
    indexRef.current = buildTokenIndex();
    setIndexReady(true);
  }, []);

  const openModal = useCallback(() => {
    ensureIndex();
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  }, [ensureIndex]);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  // Filter + flatten the result rows in render order so keyboard nav can
  // address them by a single linear index. Recomputed on every query or
  // index change; for ~600 tokens this is cheap.
  const { rows, groups } = useMemo(() => {
    const tokens = indexRef.current ?? [];
    const filtered = filterTokens(tokens, query);
    const byCategory = groupByCategory(filtered);
    const ordered: Token[] = [];
    for (const cat of CATEGORY_ORDER) {
      const list = byCategory[cat];
      if (list) ordered.push(...list);
    }
    return { rows: ordered, groups: byCategory };
    // indexReady is in the deps so the first build triggers a re-memo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, indexReady]);

  // Clamp active index when results shrink.
  useEffect(() => {
    if (activeIndex >= rows.length) setActiveIndex(Math.max(0, rows.length - 1));
  }, [rows.length, activeIndex]);

  // Focus management — push focus into the input when the modal opens,
  // restore it to the trigger when the modal closes.
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
    if (triggerRef.current) triggerRef.current.focus();
  }, [open]);

  // Scroll the active row into view (mirrors legacy scrollIntoView).
  useEffect(() => {
    if (!open) return;
    const el = modalRef.current?.querySelector<HTMLElement>(
      `.sg-token-search__row[data-row-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const activateRow = useCallback(
    (index: number) => {
      const token = rows[index];
      if (token && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(`var(${token.name})`).catch(() => {});
      }
      closeModal();
    },
    [rows, closeModal],
  );

  // Global keyboard shortcuts — `/`, `Cmd+K`, `Esc`, arrows, `Enter`.
  // Same gating as the legacy module: `/` is suppressed while the user is
  // typing in another input or contenteditable surface.
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      const isCmdK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
      const isSlash =
        e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const typing =
        !!target &&
        (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable);

      if (!open) {
        if (isCmdK) {
          e.preventDefault();
          openModal();
        } else if (isSlash && !typing) {
          e.preventDefault();
          openModal();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, rows.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        activateRow(activeIndex);
      }
    }

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, rows.length, activeIndex, openModal, closeModal, activateRow]);

  const totalCount = indexRef.current?.length ?? 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="sg-header-search-trigger"
        aria-label="Search tokens"
        aria-haspopup="dialog"
        aria-controls="sg-token-search"
        aria-expanded={open}
        onClick={openModal}
      >
        <span className="material-symbols-outlined sg-header-search-trigger__icon">
          search
        </span>
        <span className="sg-header-search-trigger__placeholder">Search tokens...</span>
        <span className="sg-header-search-trigger__kbds">
          <kbd>/</kbd>
          <kbd>⌘K</kbd>
        </span>
      </button>

      <div
        ref={modalRef}
        id="sg-token-search"
        className="sg-token-search"
        data-open={open ? 'true' : 'false'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sg-token-search-input"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="sg-token-search__panel">
          <div className="sg-token-search__field">
            <span className="material-symbols-outlined sg-token-search__icon">
              search
            </span>
            <input
              ref={inputRef}
              type="search"
              id="sg-token-search-input"
              className="sg-token-search__input"
              placeholder="Search tokens (try 'color-text', 'space-200', 'border-radius'...)"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
            />
            <kbd className="sg-token-search__hint">Esc</kbd>
          </div>

          <div className="sg-token-search__results">
            <ResultsBody
              query={query}
              rows={rows}
              groups={groups}
              total={totalCount}
              activeIndex={activeIndex}
              onActivate={activateRow}
              onHover={setActiveIndex}
            />
          </div>

          <div className="sg-token-search__footer">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate
            </span>
            <span>
              <kbd>Enter</kbd> open
            </span>
            <span>
              <kbd>Esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ResultsBody
// ---------------------------------------------------------------------------

function ResultsBody({
  query,
  rows,
  groups,
  total,
  activeIndex,
  onActivate,
  onHover,
}: {
  query: string;
  rows: Token[];
  groups: Partial<Record<TokenCategory, Token[]>>;
  total: number;
  activeIndex: number;
  onActivate: (index: number) => void;
  onHover: (index: number) => void;
}) {
  if (!rows.length) {
    return (
      <div className="sg-token-search__empty">
        {query
          ? `No tokens match "${query}" — searched ${total} tokens.`
          : 'Loading tokens…'}
      </div>
    );
  }

  let rowIndex = 0;

  return (
    <>
      <div className="sg-token-search__count">
        {query ? (
          <>
            Showing <strong>{rows.length}</strong> of <strong>{total}</strong> tokens
          </>
        ) : (
          <>
            <strong>{total}</strong> tokens · semantic first, primitives last ·
            click to copy <code>var(--name)</code>
          </>
        )}
      </div>
      {CATEGORY_ORDER.map((cat) => {
        const list = groups[cat];
        if (!list || !list.length) return null;
        return (
          <div key={cat}>
            <div className="sg-token-search__group-title">
              {cat}
              <span className="sg-token-search__group-count">{list.length}</span>
            </div>
            {list.map((t) => {
              const myIndex = rowIndex;
              rowIndex++;
              return (
                <ResultRow
                  key={t.name}
                  token={t}
                  query={query}
                  category={cat}
                  active={myIndex === activeIndex}
                  rowIndex={myIndex}
                  onClick={() => onActivate(myIndex)}
                  onMouseEnter={() => onHover(myIndex)}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

function ResultRow({
  token,
  query,
  category,
  active,
  rowIndex,
  onClick,
  onMouseEnter,
}: {
  token: Token;
  query: string;
  category: TokenCategory;
  active: boolean;
  rowIndex: number;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  const parts = splitHighlight(token.name, query);
  const swatchStyle = isColorValue(token.value)
    ? { background: token.value }
    : { background: 'transparent', border: 'none' };

  return (
    <div
      className="sg-token-search__row"
      data-token={token.name}
      data-row-index={rowIndex}
      data-active={active ? 'true' : undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className="sg-token-search__swatch" style={swatchStyle} />
      <span className="sg-token-search__name">
        {parts.map((p, i) =>
          p.mark ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>,
        )}
      </span>
      <span className="sg-token-search__value">{token.value}</span>
      <span className="sg-token-search__category">{category}</span>
    </div>
  );
}
