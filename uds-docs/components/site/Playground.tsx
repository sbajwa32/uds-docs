'use client';

// Generic playground engine. Dynamic-imports the per-component playground.js
// module (which lives at uds/components/<id>/playground.js — unchanged source-
// of-truth file), reads its controls + render function, then renders the live
// preview + code output reactively on every control change.
//
// Direct port of createPlaygroundEngine() from docs/modules/playground/index.js
// into a React component. The legacy engine was DOM-imperative; this version
// keeps the same control vocabulary (select / checkbox / text / icon-search)
// but lets React own the state + re-render lifecycle.
//
// The per-component playground.js modules are unchanged. They still:
//   - import { esc } from '../../../docs/helpers/esc.js' (resolved at runtime
//     via the postbuild copy of docs/helpers/ into out/docs/helpers/)
//   - export default { controls: [...], render(state) -> { html, code } }

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  udsResolve,
  getComponentImpl,
  getComponentSpec,
  type ComponentImpl,
  type ComponentSpec,
} from '@/lib/uds-data';
import { useUdsVersion } from './UdsVersionProvider';

interface PlaygroundControlSelect {
  key: string;
  label: string;
  type: 'select';
  default: string;
  options: { value: string; label: string }[];
}

interface PlaygroundControlCheckbox {
  key: string;
  label: string;
  type: 'checkbox';
  default: boolean;
}

interface PlaygroundControlText {
  key: string;
  label: string;
  type: 'text';
  default: string;
}

interface PlaygroundControlIconSearch {
  key: string;
  label: string;
  type: 'icon-search';
  default: string;
}

type PlaygroundControl =
  | PlaygroundControlSelect
  | PlaygroundControlCheckbox
  | PlaygroundControlText
  | PlaygroundControlIconSearch;

interface PlaygroundConfig {
  controls: PlaygroundControl[];
  render: (state: Record<string, unknown>) => { html: string; code: string };
}

interface LoadState {
  config: PlaygroundConfig | null;
  loading: boolean;
  error: string | null;
}

export function Playground({ componentId }: { componentId: string }) {
  const { fetchVersion } = useUdsVersion();
  const [load, setLoad] = useState<LoadState>({ config: null, loading: true, error: null });
  const [state, setState] = useState<Record<string, unknown>>({});

  // Dynamic import of the per-component playground.js. Anchored at
  // document.baseURI so the import works from any deploy URL (production +
  // per-PR previews + archive views).
  useEffect(() => {
    let cancelled = false;
    setLoad({ config: null, loading: true, error: null });
    setState({});

    (async () => {
      try {
        const url = new URL(
          udsResolve(`components/${componentId}/playground.js`, fetchVersion),
          document.baseURI,
        ).href;
        const mod = (await import(/* webpackIgnore: true */ url)) as {
          default?: PlaygroundConfig;
        };
        if (cancelled) return;
        const cfg = mod?.default ?? null;
        if (!cfg || !Array.isArray(cfg.controls) || typeof cfg.render !== 'function') {
          setLoad({ config: null, loading: false, error: null });
          return;
        }
        // Seed state with each control's default value.
        const init: Record<string, unknown> = {};
        for (const c of cfg.controls) init[c.key] = c.default;
        setState(init);
        setLoad({ config: cfg, loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setLoad({
          config: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [componentId, fetchVersion]);

  const output = useMemo(() => {
    if (!load.config) return null;
    try {
      return load.config.render(state);
    } catch (err) {
      // A bad render() shouldn't kill the whole page; surface in the code
      // pane and keep the controls usable.
      return {
        html: '',
        code: `// playground render() threw: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }, [load.config, state]);

  if (load.loading) {
    return <p className="sg-changelog-empty">Loading playground…</p>;
  }
  if (load.error) {
    return (
      <p className="sg-changelog-empty" role="alert">
        Couldn&apos;t load playground for <code>{componentId}</code>: {load.error}
      </p>
    );
  }
  if (!load.config) {
    return (
      <p className="sg-changelog-empty">
        No playground is configured for <code>{componentId}</code>.
      </p>
    );
  }

  return (
    <div>
      <div className="sg-example-only-banner">
        <span className="material-symbols-outlined">code_blocks</span>
        <span>
          <strong>Example only.</strong> All code on this page is reference.
          Production components live in Storybook.
        </span>
      </div>

      <div className="sg-playground-layout">
        <div className="sg-playground-left">
          <div
            className="sg-playground-preview"
            dangerouslySetInnerHTML={{ __html: output?.html ?? '' }}
          />
          <div className="sg-playground-controls">
            {load.config.controls.map((c) => (
              <PlaygroundControlRow
                key={c.key}
                control={c}
                value={state[c.key]}
                onChange={(v) => setState((s) => ({ ...s, [c.key]: v }))}
              />
            ))}
          </div>
        </div>
        <div className="sg-playground-right">
          <div className="sg-code-wrap">
            <CopyButton getText={() => output?.code ?? ''} />
            <pre className="sg-playground-code">
              <code>{output?.code ?? ''}</code>
            </pre>
          </div>
          <ImplementationReference componentId={componentId} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CopyButton — direct port of legacy buildCopyButton(). Lives next to a
// <pre>; click copies the supplied text to the clipboard and flashes the
// check icon for 1.5s. Uses the existing .sg-code-copy CSS.
// ---------------------------------------------------------------------------
function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
    } catch {
      // Clipboard not available (e.g. insecure context) — silent fail
      // matches legacy behavior.
    }
  };

  return (
    <button
      type="button"
      className="sg-code-copy"
      title="Copy code"
      data-copied={copied || undefined}
      onClick={onClick}
    >
      <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ImplementationReference — direct port of legacy buildImplSection(). Lazy-
// fetches impl.json + spec.json + the component CSS file; renders a tabbed
// <details> below the playground code. Uses .sg-impl-* CSS verbatim.
// ---------------------------------------------------------------------------
function ImplementationReference({ componentId }: { componentId: string }) {
  const { fetchVersion } = useUdsVersion();
  const [impl, setImpl] = useState<ComponentImpl | null>(null);
  const [spec, setSpec] = useState<ComponentSpec | null>(null);
  const [cssText, setCssText] = useState<string | null>(null);
  const [jsText, setJsText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'component' | 'styles' | 'behavior' | 'tokens'>('component');

  useEffect(() => {
    let cancelled = false;
    setImpl(null);
    setSpec(null);
    setCssText(null);
    setJsText(null);
    setActiveTab('component');
    (async () => {
      try {
        const [implData, specData] = await Promise.all([
          getComponentImpl(componentId, fetchVersion).catch(() => null),
          getComponentSpec(componentId, fetchVersion).catch(() => null),
        ]);
        if (cancelled) return;
        setImpl(implData);
        setSpec(specData);
      } catch {
        // No impl available; just don't render the section.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [componentId, fetchVersion]);

  // Lazy-fetch CSS when the Styles tab is first opened.
  const cssPath = spec?.dependencies?.css?.[0] || null;
  useEffect(() => {
    if (activeTab !== 'styles' || cssText !== null || !cssPath) return;
    let cancelled = false;
    fetch(udsResolve(cssPath, fetchVersion), { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : '/* CSS file not found */'))
      .then((text) => {
        if (!cancelled) setCssText(text);
      })
      .catch(() => {
        if (!cancelled) setCssText('/* Failed to load CSS */');
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, cssText, cssPath, fetchVersion]);

  // Lazy-fetch JS when the Behavior tab is first opened.
  const jsFile = impl?.jsFile || null;
  useEffect(() => {
    if (activeTab !== 'behavior' || jsText !== null || !jsFile) return;
    let cancelled = false;
    fetch(udsResolve(jsFile, fetchVersion), { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : '/* JS file not found */'))
      .then((text) => {
        if (!cancelled) setJsText(text);
      })
      .catch(() => {
        if (!cancelled) setJsText('/* Failed to load JS */');
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, jsText, jsFile, fetchVersion]);

  if (!impl) return null;

  const hasBehavior = !!impl.jsFunc;
  const hasTokens =
    impl.tokens && typeof impl.tokens === 'object' && Object.keys(impl.tokens).length > 0;

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'component', label: 'Component File' },
    { id: 'styles', label: 'Styles (CSS)' },
  ];
  if (hasBehavior) tabs.push({ id: 'behavior', label: 'Behavior (JS)' });
  if (hasTokens) tabs.push({ id: 'tokens', label: 'Tokens Used' });

  return (
    <details className="sg-impl-details">
      <summary>Implementation Reference</summary>
      <div className="sg-impl-body">
        <div className="sg-impl-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="sg-impl-tab"
              role="tab"
              aria-selected={activeTab === tab.id}
              data-impl-tab={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>
          <div
            className={`sg-impl-panel${activeTab === 'component' ? ' active' : ''}`}
            data-impl-panel="component"
          >
            <div className="sg-code-wrap">
              <CopyButton getText={() => impl.html || ''} />
              <pre>{impl.html || '/* No example HTML in impl.json */'}</pre>
            </div>
          </div>
          <div
            className={`sg-impl-panel${activeTab === 'styles' ? ' active' : ''}`}
            data-impl-panel="styles"
          >
            <div className="sg-code-wrap">
              <CopyButton getText={() => cssText || ''} />
              <pre>{cssText ?? 'Loading…'}</pre>
            </div>
          </div>
          {hasBehavior ? (
            <div
              className={`sg-impl-panel${activeTab === 'behavior' ? ' active' : ''}`}
              data-impl-panel="behavior"
            >
              <div className="sg-code-wrap">
                <CopyButton getText={() => jsText || ''} />
                <pre>{jsText ?? 'Loading…'}</pre>
              </div>
            </div>
          ) : null}
          {hasTokens ? (
            <div
              className={`sg-impl-panel${activeTab === 'tokens' ? ' active' : ''}`}
              data-impl-panel="tokens"
            >
              <TokensPanel tokens={impl.tokens as Record<string, string[]>} />
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}

function TokensPanel({ tokens }: { tokens: Record<string, string[]> }) {
  const [resolved, setResolved] = useState<Record<string, string>>({});
  // Resolve each token via getComputedStyle of <html>. Recompute on mount and
  // any time the theme classes on <html> change (so the swatch updates when
  // the user switches color scheme/brand).
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const compute = () => {
      const style = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const group of Object.values(tokens)) {
        for (const tok of group) {
          next[tok] = style.getPropertyValue(tok).trim();
        }
      }
      setResolved(next);
    };
    compute();
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [tokens]);

  return (
    <div ref={containerRef} className="sg-impl-tokens">
      {Object.entries(tokens).map(([group, items]) => (
        <FragmentGroup key={group} group={group} items={items} resolved={resolved} />
      ))}
    </div>
  );
}

function IconPickerControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="sg-pg-input"
        placeholder="Material symbol name (e.g. add)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="sg-icon-picker-trigger"
      onClick={() => setEditing(true)}
      title="Click to type a different Material Symbol name"
    >
      <span className="material-symbols-outlined">{value || 'info'}</span>
      <span className="sg-icon-picker-name">{value || 'info'}</span>
    </button>
  );
}

function FragmentGroup({
  group,
  items,
  resolved,
}: {
  group: string;
  items: string[];
  resolved: Record<string, string>;
}) {
  return (
    <>
      <div className="sg-impl-token-group">{group}</div>
      {items.map((tok) => {
        const val = resolved[tok] || '';
        const isColor = tok.includes('color');
        return (
          <div key={tok} className="sg-impl-token-row">
            {isColor && val ? (
              <div className="sg-impl-token-swatch" style={{ background: val }} />
            ) : null}
            <span className="sg-impl-token-name">{tok}</span>
            <span className="sg-impl-token-val">{val}</span>
          </div>
        );
      })}
    </>
  );
}

function PlaygroundControlRow({
  control,
  value,
  onChange,
}: {
  control: PlaygroundControl;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <div className="sg-pg-control">
      <label className="sg-pg-label">{control.label}</label>
      <ControlInput control={control} value={value} onChange={onChange} />
    </div>
  );
}

function ControlInput({
  control,
  value,
  onChange,
}: {
  control: PlaygroundControl;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (control.type) {
    case 'select':
      return (
        <select
          className="sg-pg-select"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          {control.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'checkbox':
      return (
        <input
          type="checkbox"
          className="sg-pg-checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'text':
      return (
        <input
          type="text"
          className="sg-pg-input"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'icon-search':
      // Legacy parity (without the searchable dropdown yet): a button-style
      // trigger displaying `<glyph> <name>` so designers see what the icon
      // will look like in the live preview. Clicking the trigger swaps to a
      // text input for typing a new symbol name; the live Material Symbols
      // font renders any value as a glyph immediately. The full searchable
      // picker (legacy buildIconPicker) is a follow-up that needs the
      // 63KB MATERIAL_ICONS list to load.
      return <IconPickerControl value={String(value ?? '')} onChange={onChange} />;
    default:
      return null;
  }
}
