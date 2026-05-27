'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

function renderSectionHeading(level: HeadingLevel, children: ReactNode) {
  switch (level) {
    case 1:
      return <h1 className="ds-section__title">{children}</h1>;
    case 2:
      return <h2 className="ds-section__title">{children}</h2>;
    case 3:
      return <h3 className="ds-section__title">{children}</h3>;
    case 4:
      return <h4 className="ds-section__title">{children}</h4>;
    case 5:
      return <h5 className="ds-section__title">{children}</h5>;
    case 6:
      return <h6 className="ds-section__title">{children}</h6>;
  }
}

export function DocsPageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="ds-page-header">
      <div className="ds-page-header__copy">
        {eyebrow ? <div className="ds-page-header__eyebrow">{eyebrow}</div> : null}
        <h1 className="ds-page-header__title">{title}</h1>
        {description ? <p className="ds-page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="ds-page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function DocsCard({
  children,
  className,
  elevated = false,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <section
      className={['ds-card', elevated ? 'ds-card--elevated' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}

export function DocsSection({
  title,
  description,
  children,
  level = 2,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  level?: HeadingLevel;
  className?: string;
}) {
  return (
    <section className={['ds-section', className ?? ''].filter(Boolean).join(' ')}>
      {title || description ? (
        <header className="ds-section__header">
          {title ? renderSectionHeading(level, title) : null}
          {description ? <p className="ds-section__description">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function DocsBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'brand';
}) {
  return (
    <span className="ds-badge" data-tone={tone}>
      {children}
    </span>
  );
}

export function DocsStateMessage({
  title,
  children,
  tone = 'neutral',
}: {
  title?: ReactNode;
  children: ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'error';
}) {
  return (
    <div className="ds-state-message" data-tone={tone} role={tone === 'error' ? 'alert' : undefined}>
      {title ? <strong className="ds-state-message__title">{title}</strong> : null}
      <div className="ds-state-message__body">{children}</div>
    </div>
  );
}

export function DocsCodeBlock({
  code,
  language,
  copyLabel = 'Copy',
}: {
  code: string;
  language?: string;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable in some preview contexts.
    }
  };
  return (
    <div className="ds-code-block">
      <div className="ds-code-block__toolbar">
        {language ? <span className="ds-code-block__language">{language}</span> : <span />}
        <button type="button" className="ds-code-block__copy" onClick={copy}>
          {copied ? 'Copied' : copyLabel}
        </button>
      </div>
      <pre className="ds-code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface DocsTabsContextValue {
  activeTab: string;
  onSelect: (value: string) => void;
  idPrefix: string;
}

const DocsTabsContext = createContext<DocsTabsContextValue | null>(null);

function docsTabId(prefix: string, value: string): string {
  return `${prefix}-tab-${value}`;
}

function docsPanelId(prefix: string, value: string): string {
  return `${prefix}-panel-${value}`;
}

export function DocsTabs({
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
  const idPrefix = `ds-tabs-${reactId.replace(/[:]/g, '')}`;
  const tabs: ReactNode[] = [];
  const panels: ReactNode[] = [];
  const values: string[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const display = (child.type as { displayName?: string }).displayName;
      if (display === 'DocsTabPanel') {
        panels.push(child);
        return;
      }
      if (display === 'DocsTab') {
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
    tablistRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')?.[next]?.focus();
  };

  return (
    <DocsTabsContext.Provider value={{ activeTab, onSelect: onActiveTabChange, idPrefix }}>
      <div
        ref={tablistRef}
        className="ds-tabs"
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {tabs}
      </div>
      {panels}
    </DocsTabsContext.Provider>
  );
}

export function DocsTab({
  value,
  count,
  children,
}: {
  value: string;
  count?: ReactNode;
  children: ReactNode;
}) {
  const ctx = useContext(DocsTabsContext);
  if (!ctx) throw new Error('<DocsTab> must be a child of <DocsTabs>');
  const isActive = ctx.activeTab === value;
  return (
    <button
      type="button"
      role="tab"
      id={docsTabId(ctx.idPrefix, value)}
      aria-controls={docsPanelId(ctx.idPrefix, value)}
      className="ds-tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => ctx.onSelect(value)}
    >
      {children}
      {count != null ? <span className="ds-tab__count">{count}</span> : null}
    </button>
  );
}
DocsTab.displayName = 'DocsTab';

export function DocsTabPanel({
  value,
  forceMount = true,
  children,
}: {
  value: string;
  forceMount?: boolean;
  children: ReactNode;
}) {
  const ctx = useContext(DocsTabsContext);
  if (!ctx) throw new Error('<DocsTabPanel> must be a child of <DocsTabs>');
  const isActive = ctx.activeTab === value;
  if (!forceMount && !isActive) return null;
  return (
    <div
      role="tabpanel"
      id={docsPanelId(ctx.idPrefix, value)}
      aria-labelledby={docsTabId(ctx.idPrefix, value)}
      hidden={!isActive}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
DocsTabPanel.displayName = 'DocsTabPanel';

export function TokenSwatchCard({
  name,
  value,
  swatch,
  checkerboard = false,
}: {
  name: string;
  value?: ReactNode;
  swatch: string;
  checkerboard?: boolean;
}) {
  const swatchStyle = {
    '--token-swatch': swatch,
  } as React.CSSProperties;
  return (
    <div className="ds-token-card">
      <div
        className="ds-token-card__swatch"
        data-checkerboard={checkerboard || undefined}
        style={swatchStyle}
      />
      <div className="ds-token-card__body">
        <code className="ds-token-card__name">{name}</code>
        {value ? <span className="ds-token-card__value">{value}</span> : null}
      </div>
    </div>
  );
}

export function TokenGroup({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DocsSection title={title} description={description} className="ds-token-group">
      <div className="ds-token-grid">{children}</div>
    </DocsSection>
  );
}
