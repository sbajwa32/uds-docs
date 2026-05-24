'use client';

// Page-level chrome: title, description, and tabs.
//
// SgPageTabs is a controlled-state tab strip with the same markup the legacy
// site uses. Behavior:
//   - Click a tab to activate.
//   - Arrow Left/Right move activation between tabs (automatic activation —
//     focus shift = activation, matches the legacy click-to-switch pattern).
//   - Home / End jump to first / last tab.
//   - The active tab has tabIndex=0 (others tabIndex=-1) so Tab key leaves
//     the tablist after one stop, per WAI-ARIA APG.

import '../../styles/site/page-chrome.css';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useRef,
  type ReactElement,
  type ReactNode,
  type KeyboardEvent,
} from 'react';

// ---------------------------------------------------------------------------
// SgPageTitle / SgPageDesc
// ---------------------------------------------------------------------------

export function SgPageTitle({ children }: { children: ReactNode }) {
  return <h1 className="sg-page-title">{children}</h1>;
}

export function SgPageDesc({ children }: { children: ReactNode }) {
  return <p className="sg-page-desc">{children}</p>;
}

// ---------------------------------------------------------------------------
// SgPageTabs / SgPageTab (controlled tab pattern)
// ---------------------------------------------------------------------------

interface SgPageTabsContextValue {
  activeTab: string;
  onSelect: (value: string) => void;
}

const SgPageTabsContext = createContext<SgPageTabsContextValue | null>(null);

export function SgPageTabs({
  activeTab,
  onActiveTabChange,
  ariaLabel,
  children,
}: {
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const tablistRef = useRef<HTMLDivElement>(null);

  // Extract tab values from children (in render order) for keyboard nav.
  const values: string[] = Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && (child.type as { displayName?: string }).displayName === 'SgPageTab') {
      const v = (child as ReactElement<{ value: string }>).props.value;
      return typeof v === 'string' ? [v] : [];
    }
    return [];
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = values.indexOf(activeTab);
    if (idx === -1) return;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % values.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + values.length) % values.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = values.length - 1;
    if (next === null) return;
    e.preventDefault();
    onActiveTabChange(values[next]);
    const buttons = tablistRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
    buttons?.[next]?.focus();
  };

  return (
    <SgPageTabsContext.Provider value={{ activeTab, onSelect: onActiveTabChange }}>
      <div
        ref={tablistRef}
        className="sg-page-tabs"
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </SgPageTabsContext.Provider>
  );
}

export function SgPageTab({
  value,
  count,
  children,
}: {
  value: string;
  /** Optional count badge rendered after the label, e.g. "Examples (3)". */
  count?: ReactNode;
  children: ReactNode;
}) {
  const ctx = useContext(SgPageTabsContext);
  if (!ctx) {
    throw new Error('<SgPageTab> must be a child of <SgPageTabs>');
  }
  const isActive = ctx.activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      className="sg-page-tab"
      data-tab={value}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => ctx.onSelect(value)}
    >
      {children}
      {count != null ? <span className="sg-page-tab__count">{count}</span> : null}
    </button>
  );
}
SgPageTab.displayName = 'SgPageTab';
