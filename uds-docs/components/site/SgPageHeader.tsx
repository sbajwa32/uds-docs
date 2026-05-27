'use client';

// Page-level chrome: title, description, and tabs.
//
// SgPageTabs is a controlled-state tab strip. Behavior:
//   - Click a tab to activate.
//   - Arrow Left/Right move activation between tabs (automatic activation).
//   - Home / End jump to first / last tab.
//   - The active tab has tabIndex=0 (others tabIndex=-1) so Tab key leaves
//     the tablist after one stop, per WAI-ARIA APG.

import '../../styles/site/page-chrome.css';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
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
  /** Prefix shared across tabs + panels in this set, used to derive
      paired `id` / `aria-controls` / `aria-labelledby` attributes. */
  idPrefix: string;
}

const SgPageTabsContext = createContext<SgPageTabsContextValue | null>(null);

function tabId(prefix: string, value: string): string {
  return `${prefix}-tab-${value}`;
}

function panelId(prefix: string, value: string): string {
  return `${prefix}-panel-${value}`;
}

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
  const reactId = useId();
  // useId returns ":r0:"-style identifiers. CSS-safe but unfit for HTML
  // ids that flow through aria-controls / aria-labelledby (the colons
  // are valid per HTML5 but break some AT). Normalize.
  const idPrefix = `sg-tabs-${reactId.replace(/[:]/g, '')}`;

  // Split children into the tab strip (SgPageTab) and panels
  // (SgPageTabPanel). The tabs render inside the `role="tablist"`
  // wrapper; the panels render after it as siblings so the tablist
  // doesn't accidentally include the panel content as an aria child.
  // Anything else (raw nodes, custom buttons) passes through into the
  // tablist slot so consumers retain composition flexibility.
  const tabs: ReactNode[] = [];
  const panels: ReactNode[] = [];
  const values: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const display = (child.type as { displayName?: string }).displayName;
      if (display === 'SgPageTabPanel') {
        panels.push(child);
        return;
      }
      if (display === 'SgPageTab') {
        const v = (child as ReactElement<{ value: string }>).props.value;
        if (typeof v === 'string') values.push(v);
      }
    }
    tabs.push(child);
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
    <SgPageTabsContext.Provider
      value={{ activeTab, onSelect: onActiveTabChange, idPrefix }}
    >
      <div
        ref={tablistRef}
        className="sg-page-tabs"
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {tabs}
      </div>
      {panels}
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
      id={tabId(ctx.idPrefix, value)}
      aria-controls={panelId(ctx.idPrefix, value)}
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

/**
 * Paired panel for a `<SgPageTab>`. Resolves the tab/panel id pair from
 * the shared `<SgPageTabs>` context so consumers don't have to manage ids
 * themselves. Hidden via the `hidden` attribute when inactive, preserving
 * mounted state while visibility toggles.
 *
 * Consumers can pass `forceMount={false}` to unmount inactive panels
 * instead (used for the Playground tab on component pages, where the
 * panel is dynamically imported only when active).
 */
export function SgPageTabPanel({
  value,
  forceMount = true,
  children,
}: {
  value: string;
  forceMount?: boolean;
  children: ReactNode;
}) {
  const ctx = useContext(SgPageTabsContext);
  if (!ctx) {
    throw new Error('<SgPageTabPanel> must be a child of <SgPageTabs>');
  }
  const isActive = ctx.activeTab === value;
  if (!forceMount && !isActive) return null;
  return (
    <div
      role="tabpanel"
      id={panelId(ctx.idPrefix, value)}
      aria-labelledby={tabId(ctx.idPrefix, value)}
      hidden={!isActive}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
SgPageTabPanel.displayName = 'SgPageTabPanel';
