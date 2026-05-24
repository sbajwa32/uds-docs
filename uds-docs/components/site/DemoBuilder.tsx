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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { downloadDemoProject } from '@/lib/demo-builder/zip';
import { generateDemoHTML } from '@/lib/demo-builder/generate-html';
import { getHistory, pushHistory, type DemoHistoryEntry } from '@/lib/demo-builder/history';
import { useUdsTheme } from './UdsThemeProvider';

import '../../styles/site/demo-builder.css';

interface DemoComponent {
  id: string;
  label: string;
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

  return (
    <>
      <span className="udc-tooltip-wrapper">
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
        <span className="udc-tooltip" role="tooltip" data-position="bottom">
          Build a multi-component HTML demo
        </span>
      </span>

      {dialogOpen && (
        <DemoBuilderDialog
          onClose={closeDialog}
          onPreviewReady={(payload) => setOverlay(payload)}
          buildPreview={buildPreview}
        />
      )}

      {overlay && (
        <DemoPreviewOverlay
          html={overlay.html}
          components={overlay.components}
          buildPreview={buildPreview}
          onClose={closeOverlay}
        />
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
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEMO_COMPONENTS.map((c) => c.id)),
  );
  const [history, setHistory] = useState<DemoHistoryEntry[]>(() => getHistory());
  const [busy, setBusy] = useState<null | 'preview' | 'download'>(null);
  const [error, setError] = useState<string | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus management — push focus into the dialog when it opens.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

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
      className="udc-dialog-backdrop"
      data-open="true"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="udc-dialog sg-demo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sg-demo-title"
      >
        <div className="udc-dialog__header">
          <h2 className="udc-dialog__title" id="sg-demo-title">
            Build Demo Site
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="udc-dialog__close"
            aria-label="Close"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="udc-dialog__body">
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
            {DEMO_COMPONENTS.map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleOne(c.id)}
                  data-demo-comp={c.id}
                />
                {' ' + c.label}
              </label>
            ))}
          </div>

          {error && (
            <div className="sg-demo-error" role="alert" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </div>

        <div className="udc-dialog__footer">
          <button
            type="button"
            className="udc-button-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="udc-button-secondary"
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
            className="udc-button-primary"
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
        className="udc-button-secondary"
        data-size="sm"
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
    <div className="sg-demo-overlay" role="dialog" aria-modal="true" aria-label="UDS Demo Preview">
      <div className="sg-demo-overlay-toolbar">
        <span className="sg-demo-overlay-toolbar__title">UDS Demo Preview</span>
        <div className="sg-demo-overlay-toolbar__actions">
          <ToolbarBtn
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

function ToolbarBtn({
  onClick,
  disabled,
  icon,
  label,
  spinIcon,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: string;
  label: ReactNode;
  spinIcon?: boolean;
}) {
  return (
    <button
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
}
