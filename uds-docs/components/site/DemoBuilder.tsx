'use client';

// Demo Builder — Build Demo trigger button (brand bar) + dialog + preview
// overlay. React port of docs/modules/demo-builder/index.js + overlay.js +
// the dialog markup that used to live inline in index.html.
//
// Behavior parity with the legacy site:
//   - The construction-icon button in the brand bar opens a modal listing
//     all 26 demo-eligible components as checkboxes (all checked by
//     default). The "Select All / Deselect All" toggle flips them en masse.
//   - "Preview" generates a multi-component HTML demo with random data
//     substitution (Chunk 12a) and opens a full-window overlay containing
//     the result in an <iframe srcdoc>. A "Refresh data" button on the
//     overlay re-rolls the same components with a fresh seed.
//   - "Download ZIP" bundles the same demo HTML + UDS payload (tokens +
//     per-component CSS/JS) into a `demo-html.zip` via JSZip.
//   - The last build is saved to localStorage and surfaced on the next
//     dialog open as an "Open" card so the user can revisit without
//     re-rolling.
//   - Esc closes the dialog (and the overlay). Focus is trapped inside
//     the dialog while it's open.

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { downloadDemoProject } from '@/lib/demo-builder/zip';
import { generateDemoHTML } from '@/lib/demo-builder/generate-html';
import { getHistory, pushHistory, type DemoHistoryEntry } from '@/lib/demo-builder/history';
import { getComponentStatus } from '@/lib/uds-data';
import { useUdsTheme } from './UdsThemeProvider';
import { useUdsVersion } from './UdsVersionProvider';

import '../../styles/site/demo-builder.css';

interface DemoComponent {
  id: string;
  label: string;
}

// Module-scoped cache so opening the Build Demo dialog multiple times
// doesn't re-fetch 26 status.json files each time. Keyed by fetchVersion
// — undefined for live, '0.2' for the archive, etc. The dialog only
// renders the status dots, so a stale cache is bounded to one open
// session and refreshes naturally on hard reload.
const statusMapCache = new Map<string, Record<string, string>>();

function statusMapCacheKey(fetchVersion: string | undefined): string {
  return fetchVersion ?? '__live__';
}

const DEMO_COMPONENTS: ReadonlyArray<DemoComponent> = [
  { id: 'button', label: 'Button' },
  { id: 'link', label: 'Link' },
  { id: 'label', label: 'Label' },
  { id: 'text-input', label: 'Text Input' },
  { id: 'text-area', label: 'Text Area' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'radio', label: 'Radio' },
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'toggle', label: 'Toggle' },
  { id: 'search', label: 'Search' },
  { id: 'badge', label: 'Badge' },
  { id: 'chip', label: 'Chip' },
  { id: 'divider', label: 'Divider' },
  { id: 'icon-wrapper', label: 'Icon Wrapper' },
  { id: 'spacer', label: 'Spacer' },
  { id: 'breadcrumb', label: 'Breadcrumb' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'nav-header', label: 'Nav Header' },
  { id: 'nav-vertical', label: 'Nav Vertical' },
  { id: 'tile', label: 'Tile' },
  { id: 'list', label: 'List' },
  { id: 'data-table', label: 'Data Table' },
  { id: 'notification', label: 'Notification' },
  { id: 'dialog', label: 'Dialog' },
  { id: 'tooltip', label: 'Tooltip' },
];

// ---------------------------------------------------------------------------
// DemoBuilder — public component (the construction-icon button slot).
// ---------------------------------------------------------------------------

export function DemoBuilder() {
  const { isArchive } = useUdsVersion();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [overlay, setOverlay] = useState<{
    html: string;
    components: string[];
  } | null>(null);

  const closeDialog = useCallback(() => setDialogOpen(false), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  // Pump a fresh preview into the overlay (used by both initial build and
  // "Refresh data" inside the overlay). The selected component list is
  // captured at build time and stays put for refreshes.
  const buildPreview = useCallback(
    async (components: string[]): Promise<{ html: string; sizeKB: number }> => {
      const html = await generateDemoHTML(components);
      return { html, sizeKB: Math.round(html.length / 1024) };
    },
    [],
  );

  // Archive snapshots don't carry the interactive JS modules the demo
  // builder needs (per-component examples + uds.js orchestrator are loaded
  // from live paths). Hide the trigger in archive mode rather than ship a
  // broken preview. Matches the legacy behavior that hides .sg-demo-btn
  // when `isViewingHistorical()`. The early return sits below the hooks
  // so we don't violate Rules of Hooks when archive flips.
  if (isArchive) return null;

  return (
    <>
      <span className="sg-demo-tooltip-wrapper">
        <button
          type="button"
          className="sg-demo-btn"
          aria-label="Build Demo"
          aria-haspopup="dialog"
          aria-expanded={dialogOpen}
          onClick={() => setDialogOpen(true)}
        >
          <span className="material-symbols-outlined">construction</span>
        </button>
        <span className="sg-demo-tooltip" role="tooltip">
          Build a multi-component HTML demo
        </span>
      </span>

      {dialogOpen && typeof document !== 'undefined' && createPortal(
        <DemoBuilderDialog
          onClose={closeDialog}
          onPreviewReady={(payload) => setOverlay(payload)}
          buildPreview={buildPreview}
        />,
        document.body,
      )}

      {overlay && typeof document !== 'undefined' && createPortal(
        <DemoPreviewOverlay
          html={overlay.html}
          components={overlay.components}
          buildPreview={buildPreview}
          onClose={closeOverlay}
        />,
        document.body,
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// DemoBuilderDialog — the modal with component grid, history card, and the
// Preview / Download buttons.
// ---------------------------------------------------------------------------

function DemoBuilderDialog({
  onClose,
  onPreviewReady,
  buildPreview,
}: {
  onClose: () => void;
  onPreviewReady: (payload: { html: string; components: string[] }) => void;
  buildPreview: (components: string[]) => Promise<{ html: string; sizeKB: number }>;
}) {
  const themeCtx = useUdsTheme();
  const { fetchVersion } = useUdsVersion();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEMO_COMPONENTS.map((c) => c.id)),
  );
  const [history, setHistory] = useState<DemoHistoryEntry[]>(() => getHistory());
  const [busy, setBusy] = useState<null | 'preview' | 'download'>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management — focus the dialog container itself (tabindex=-1) so
  // keyboard navigation works while keeping the close button free of an
  // auto-applied :focus-visible outline on first open. The legacy dialog
  // was static markup that never auto-focused the close button.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Fetch lifecycle status for each demo component to render the colored
  // status dot next to its label. Direct port of legacy
  // window.COMPONENT_STATUS_MAP[comp.id] behavior — drops `sg-demo-status-dot
  // --<status>` on each row.
  //
  // Result is cached per fetchVersion in `statusMapCache` so reopening the
  // dialog (or switching the active archive and back) doesn't re-issue 26
  // status.json fetches. The cache is bounded to the page lifecycle.
  useEffect(() => {
    const key = statusMapCacheKey(fetchVersion);
    const cached = statusMapCache.get(key);
    if (cached) {
      setStatusMap(cached);
      return;
    }
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      const results = await Promise.all(
        DEMO_COMPONENTS.map((c) =>
          getComponentStatus(c.id, fetchVersion)
            .then((s) => [c.id, s?.current || ''] as const)
            .catch(() => [c.id, ''] as const),
        ),
      );
      if (cancelled) return;
      for (const [id, status] of results) next[id] = status;
      statusMapCache.set(key, next);
      setStatusMap(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchVersion]);

  // Esc closes; backdrop click closes; basic focus trap with Tab.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const allChecked = useMemo(
    () => DEMO_COMPONENTS.every((c) => selected.has(c.id)),
    [selected],
  );

  const toggleAll = useCallback(() => {
    setSelected((current) => {
      const next = new Set<string>();
      if (!DEMO_COMPONENTS.every((c) => current.has(c.id))) {
        for (const c of DEMO_COMPONENTS) next.add(c.id);
      }
      return next;
    });
  }, []);

  const toggleOne = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onPreview = useCallback(async () => {
    setError(null);
    const components = DEMO_COMPONENTS.filter((c) => selected.has(c.id)).map((c) => c.id);
    if (!components.length) {
      setError('Select at least one component.');
      return;
    }
    setBusy('preview');
    try {
      const { html, sizeKB } = await buildPreview(components);
      const entry: DemoHistoryEntry = {
        timestamp: new Date().toISOString(),
        framework: 'html',
        theme: {
          colorScheme: themeCtx.colorScheme,
          brand: themeCtx.theme,
          font: themeCtx.font,
        },
        components,
        componentCount: components.length,
        sizeKB,
        blobHtml: html,
      };
      setHistory(pushHistory(entry));
      onPreviewReady({ html, components });
      onClose();
    } catch (e) {
      setError('Build failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(null);
    }
  }, [selected, themeCtx, buildPreview, onPreviewReady, onClose]);

  const onDownload = useCallback(async () => {
    setError(null);
    const components = DEMO_COMPONENTS.filter((c) => selected.has(c.id)).map((c) => c.id);
    if (!components.length) {
      setError('Select at least one component.');
      return;
    }
    setBusy('download');
    try {
      const origin = window.location.origin;
      const themeAttrs: Record<string, string> = {};
      if (themeCtx.colorScheme) themeAttrs['data-color-scheme'] = themeCtx.colorScheme;
      if (themeCtx.theme) themeAttrs['data-theme'] = themeCtx.theme;
      if (themeCtx.font) themeAttrs['data-font'] = themeCtx.font;
      if (themeCtx.fontScale) themeAttrs['data-font-scale'] = themeCtx.fontScale;
      if (themeCtx.density) themeAttrs['data-density'] = themeCtx.density;
      await downloadDemoProject({ components, origin, themeAttrs });
    } catch (e) {
      setError('Download failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(null);
    }
  }, [selected, themeCtx]);

  const openPrevious = useCallback(() => {
    const last = history[history.length - 1];
    if (last) {
      onPreviewReady({ html: last.blobHtml, components: last.components });
      onClose();
    }
  }, [history, onPreviewReady, onClose]);

  return (
    <div
      ref={backdropRef}
      className="sg-demo-dialog-backdrop"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="sg-demo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sg-demo-title"
        tabIndex={-1}
      >
        <div className="sg-demo-dialog__header">
          <h2 className="sg-demo-dialog__title" id="sg-demo-title">
            Build Demo Site
          </h2>
          <button
            type="button"
            className="sg-demo-dialog__close"
            aria-label="Close"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="sg-demo-dialog__body">
          <HistoryCard history={history} onOpen={openPrevious} />

          <div className="sg-demo-select-row">
            <span>Components</span>
            <button
              type="button"
              className="sg-demo-select-link"
              onClick={toggleAll}
            >
              {allChecked ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="sg-demo-grid">
            {DEMO_COMPONENTS.map((c) => {
              const status = statusMap[c.id];
              const dotClass = status ? `sg-demo-status-dot--${status}` : '';
              return (
                <label key={c.id}>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    data-demo-comp={c.id}
                  />
                  {' ' + c.label}
                  {status ? (
                    <span
                      className={`sg-demo-status-dot ${dotClass}`}
                      title={status.replace('-', ' ')}
                    />
                  ) : null}
                </label>
              );
            })}
          </div>

          {error && (
            <div className="sg-demo-error" role="alert" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </div>

        <div className="sg-demo-dialog__footer">
          <button
            type="button"
            className="sg-demo-action-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="sg-demo-action-btn"
            onClick={onDownload}
            disabled={busy !== null}
          >
            {busy === 'download' ? (
              <ToolbarBusy label="Packaging..." />
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 'var(--uds-font-size-md)',
                    marginRight: 'var(--uds-space-050)',
                  }}
                >
                  download
                </span>
                Download ZIP
              </>
            )}
          </button>
          <button
            type="button"
            className="sg-demo-action-btn sg-demo-action-btn--primary"
            onClick={onPreview}
            disabled={busy !== null}
          >
            {busy === 'preview' ? <ToolbarBusy label="Building..." /> : 'Preview'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarBusy({ label }: { label: string }) {
  return (
    <>
      <span className="sg-demo-spinner" />
      {label}
    </>
  );
}

function HistoryCard({
  history,
  onOpen,
}: {
  history: DemoHistoryEntry[];
  onOpen: () => void;
}) {
  if (!history.length) {
    return <div className="sg-demo-history-empty">No previous builds</div>;
  }
  const last = history[history.length - 1];
  const time = new Date(last.timestamp).toLocaleString();
  const themeSummary = [last.theme.colorScheme, last.theme.brand, last.theme.font]
    .filter(Boolean)
    .join(' / ');
  return (
    <div className="sg-demo-history">
      <div className="sg-demo-history-meta">
        <strong>Last Build</strong>
        <span>
          {time} · {last.framework.toUpperCase()} · {last.componentCount} components ·{' '}
          {last.sizeKB} KB
        </span>
        <br />
        <span>Theme: {themeSummary || 'Default'}</span>
      </div>
      <button
        type="button"
        className="sg-demo-action-btn sg-demo-action-btn--sm"
        onClick={onOpen}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 16, marginRight: 4 }}
        >
          open_in_new
        </span>
        Open
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DemoPreviewOverlay — full-window overlay with the live preview iframe.
// ---------------------------------------------------------------------------

function DemoPreviewOverlay({
  html: initialHtml,
  components,
  buildPreview,
  onClose,
}: {
  html: string;
  components: string[];
  buildPreview: (components: string[]) => Promise<{ html: string; sizeKB: number }>;
  onClose: () => void;
}) {
  const [html, setHtml] = useState(initialHtml);
  const [rebuilding, setRebuilding] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const refreshBtnRef = useRef<HTMLButtonElement | null>(null);
  // Capture the element that had focus before the overlay opened so we can
  // restore it on close — required by the WAI-ARIA APG modal pattern.
  const restoreFocusToRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocusToRef.current =
      typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    // Push focus into the overlay so screen-reader users land somewhere
    // sensible. The Refresh button is the first interactive control
    // (matches the legacy buildDemoToolbar() focus target).
    const raf = requestAnimationFrame(() => {
      refreshBtnRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      // Restore focus on close. Guarded against the case where the
      // previous element was unmounted while the overlay was open.
      const target = restoreFocusToRef.current;
      if (target && document.body.contains(target)) {
        target.focus();
      }
    };
  }, []);

  // Esc closes + Tab traps focus inside the overlay. Without a trap, Tab
  // can land in the iframe or escape to underlying page chrome — the
  // review caught both.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !overlayRef.current) return;
      const focusables = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), iframe',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !overlayRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const refresh = useCallback(async () => {
    if (!components.length) return;
    setRebuilding(true);
    try {
      const { html: fresh } = await buildPreview(components);
      setHtml(fresh);
    } finally {
      setRebuilding(false);
    }
  }, [components, buildPreview]);

  const saveHtml = useCallback(() => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [html]);

  return (
    <div
      ref={overlayRef}
      className="sg-demo-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="UDS Demo Preview"
    >
      <div className="sg-demo-overlay-toolbar">
        <span className="sg-demo-overlay-toolbar__title">UDS Demo Preview</span>
        <div className="sg-demo-overlay-toolbar__actions">
          <ToolbarBtn
            ref={refreshBtnRef}
            onClick={refresh}
            disabled={rebuilding}
            icon={rebuilding ? 'progress_activity' : 'refresh'}
            label={rebuilding ? 'Refreshing' : 'Refresh data'}
            spinIcon={rebuilding}
          />
          <ToolbarBtn onClick={saveHtml} icon="download" label="Save HTML" />
          <ToolbarBtn onClick={onClose} icon="close" label="Close" />
        </div>
      </div>
      <iframe
        title="UDS Demo Preview"
        className="sg-demo-overlay-iframe"
        srcDoc={html}
      />
    </div>
  );
}

const ToolbarBtn = forwardRef<HTMLButtonElement, {
  onClick: () => void;
  disabled?: boolean;
  icon: string;
  label: ReactNode;
  spinIcon?: boolean;
}>(function ToolbarBtn(
  { onClick, disabled, icon, label, spinIcon },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className="sg-demo-overlay-toolbar__btn"
      onClick={onClick}
      disabled={disabled}
    >
      <span
        className="material-symbols-outlined"
        style={spinIcon ? { animation: 'sg-spin 0.6s linear infinite' } : undefined}
      >
        {icon}
      </span>
      {label}
    </button>
  );
});
