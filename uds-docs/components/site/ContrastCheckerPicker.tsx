'use client';

// Searchable popover picker for the Contrast Checker. Direct port of
// `openPopover` / `closePopover` / `renderPopoverList` from the legacy
// `docs/modules/contrast-checker/index.js` (lines 988–1126), turned into
// a self-contained React component.
//
// Behavior parity points:
//   - `fg` slot lists Text + Icon + Border tokens (filterable via
//     checkbox chips); `bg` slot lists only Surface tokens (no chips).
//   - Free-text search filters by the short name (the part after
//     `--uds-color-`).
//   - Clicking a row commits the selection and closes the popover.
//   - Click outside (anywhere not in the popover or its trigger) closes.
//   - Esc closes (handled by the parent's global keydown listener).

import { useEffect, useRef, useState } from 'react';

import { FG_KINDS, KIND_LABEL, type TokenKind } from '@/lib/contrast-checker-data';
import { shortName, type Token, type TokenSet } from '@/lib/uds-token-probes';

interface ContrastCheckerPickerProps {
  slot: 'fg' | 'bg';
  tokens: TokenSet;
  selected: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onSelect: (tokenName: string) => void;
  onClose: () => void;
}

export function ContrastCheckerPicker({
  slot,
  tokens,
  selected,
  anchorRef,
  onSelect,
  onClose,
}: ContrastCheckerPickerProps) {
  const [query, setQuery] = useState('');
  const [kindFilters, setKindFilters] = useState<Set<Exclude<TokenKind, 'surface'>>>(
    () => new Set(FG_KINDS),
  );

  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount; auto-close on Esc / outside click.
  useEffect(() => {
    const raf = requestAnimationFrame(() => searchRef.current?.focus());

    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (popoverRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [anchorRef, onClose]);

  const toggleKind = (k: Exclude<TokenKind, 'surface'>) => {
    setKindFilters((current) => {
      const next = new Set(current);
      if (next.has(k)) {
        if (next.size > 1) next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });
  };

  const q = query.trim().toLowerCase();

  // Groups + filtering — parity with legacy renderPopoverList.
  const groups: Array<[TokenKind, Token[]]> = [];
  if (slot === 'bg') {
    groups.push(['surface', tokens.surfaces]);
  } else {
    if (kindFilters.has('text')) groups.push(['text', tokens.texts]);
    if (kindFilters.has('icon')) groups.push(['icon', tokens.icons]);
    if (kindFilters.has('border')) groups.push(['border', tokens.borders]);
  }

  const filteredGroups = groups
    .map(([kind, list]) => {
      const filtered = list.filter((t) => {
        if (q && !shortName(t.name).toLowerCase().includes(q)) return false;
        return true;
      });
      return [kind, filtered] as [TokenKind, Token[]];
    })
    .filter(([, list]) => list.length);

  const totalShown = filteredGroups.reduce((n, [, l]) => n + l.length, 0);

  return (
    <div
      ref={popoverRef}
      className="cc-popover"
      role="dialog"
      aria-label={slot === 'fg' ? 'Choose foreground token' : 'Choose surface token'}
    >
      <div className="cc-popover-search-row">
        <span
          className="material-symbols-outlined cc-popover-search-icon"
          aria-hidden="true"
        >
          search
        </span>
        <input
          ref={searchRef}
          type="text"
          className="cc-popover-search"
          placeholder="Search tokens"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {slot === 'fg' && (
        <div className="cc-popover-kinds" role="group" aria-label="Filter by foreground kind">
          {FG_KINDS.map((k) => (
            <label key={k} className="cc-popover-kind">
              <input
                type="checkbox"
                value={k}
                checked={kindFilters.has(k)}
                onChange={() => toggleKind(k)}
              />
              <span>{KIND_LABEL[k]}</span>
            </label>
          ))}
        </div>
      )}

      <div className="cc-popover-list" role="listbox">
        {totalShown === 0 ? (
          <div className="cc-popover-empty">No tokens match.</div>
        ) : (
          filteredGroups.map(([kind, list]) => (
            <div key={kind} className="cc-popover-group">
              <div className="cc-popover-group-head">
                {KIND_LABEL[kind]}{' '}
                <span className="cc-popover-group-count">{list.length}</span>
              </div>
              {list.map((t) => {
                const isSelected = t.name === selected;
                return (
                  <button
                    key={t.name}
                    type="button"
                    className={
                      'cc-popover-option' +
                      (isSelected ? ' cc-popover-option--selected' : '')
                    }
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(t.name);
                    }}
                  >
                    {t.kind === 'border' ? (
                      <span
                        className="cc-popover-swatch cc-popover-swatch--border"
                        style={{
                          borderColor: `var(${t.name})`,
                          background: 'var(--uds-color-surface-main)',
                        }}
                      />
                    ) : (
                      <span
                        className="cc-popover-swatch"
                        style={{ background: `var(${t.name})` }}
                      />
                    )}
                    <code className="cc-popover-option-name">{shortName(t.name)}</code>
                    {isSelected && (
                      <span
                        className="material-symbols-outlined cc-popover-option-check"
                        aria-hidden="true"
                      >
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
