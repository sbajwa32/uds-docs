'use client';

// Generic playground engine. Dynamic-imports the per-component playground.js
// module from `uds/components/<id>/playground.js`, reads its `controls` +
// `render(state)` function, then renders the live preview + code output
// reactively on every control change. Same player + cartridge split as the
// Examples tab and Demo Builder — see lib/examples-renderer.ts and
// lib/demo-builder/ for the matching engines.
//
// Each cartridge is a self-contained ES module that default-exports
// `{ controls: PlaygroundControl[], render(state) -> { html, code } }`.
// Cartridges define their own `escAttr` / `escText` helpers inline so they
// don't depend on shared runtime modules.

import { useEffect, useMemo, useRef, useState } from 'react';

import { WEB_COMPONENT_EXAMPLES } from '@/data/web-component-examples';
import { MATERIAL_ICONS } from '@/lib/material-icons';
import {
  udsResolve,
  getComponentImpl,
  getComponentSpec,
  type ComponentImpl,
  type ComponentSpec,
} from '@/lib/uds-data';
import { registerUdsComponents } from '@uds/web-components';
import { useUdsVersion } from './UdsVersionProvider';
import { DocsCodeBlock, DocsStateMessage } from './ui';

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
  const { fetchVersion, isArchive } = useUdsVersion();
  const [load, setLoad] = useState<LoadState>({ config: null, loading: true, error: null });
  const [state, setState] = useState<Record<string, unknown>>({});
  const webComponentExample = !isArchive ? WEB_COMPONENT_EXAMPLES[componentId]?.[0] ?? null : null;

  // Make sure the live `<udc-*>` tags inside the preview pane get upgraded.
  // Safe to call repeatedly — registration is idempotent.
  useEffect(() => {
    if (!isArchive) {
      registerUdsComponents();
    }
  }, [isArchive]);

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
    return <DocsStateMessage>Loading playground…</DocsStateMessage>;
  }
  if (load.error) {
    return (
      <DocsStateMessage tone="error">
        Couldn&apos;t load playground for <code>{componentId}</code>: {load.error}
      </DocsStateMessage>
    );
  }
  if (!load.config) {
    // No playground.js exists. If we have a static Web Component example,
    // fall back to that — show the tag for reference, no interactive controls.
    if (webComponentExample) {
      return (
        <div>
          <div className="sg-example-only-banner">
            <span className="material-symbols-outlined">code_blocks</span>
            <span>
              <strong>Web Component API.</strong> This playground shows the target
              component tag for the live docs view.
            </span>
          </div>
          <div className="ds-playground-layout">
            <div className="ds-playground-left">
              <div
                className="ds-playground-preview"
                dangerouslySetInnerHTML={{ __html: webComponentExample.html }}
              />
            </div>
            <div className="ds-playground-right">
              <DocsCodeBlock code={webComponentExample.html} language="html" />
              <ImplementationReference componentId={componentId} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <DocsStateMessage>
        No playground is configured for <code>{componentId}</code>.
      </DocsStateMessage>
    );
  }

  return (
    <div>
      <div className="sg-example-only-banner">
        <span className="material-symbols-outlined">code_blocks</span>
        <span>
          {webComponentExample ? (
            <>
              <strong>Web Component API.</strong> Adjust the controls to preview
              <code> &lt;udc-{componentId}&gt;</code> live.
            </>
          ) : (
            <>
              <strong>Example only.</strong> All code on this page is reference.
              Production components live in Storybook.
            </>
          )}
        </span>
      </div>

      <div className="ds-playground-layout">
        <div className="ds-playground-left">
          <div
            className="ds-playground-preview"
            dangerouslySetInnerHTML={{ __html: output?.html ?? '' }}
          />
          <div className="ds-playground-controls">
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
        <div className="ds-playground-right">
          <DocsCodeBlock code={output?.code ?? ''} language="html" />
          <ImplementationReference componentId={componentId} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImplementationReference — direct port of legacy buildImplSection(). Lazy-
// fetches impl.json + spec.json + the component CSS file; renders a tabbed
// <details> below the playground code. Uses .sg-impl-* CSS verbatim.
// ---------------------------------------------------------------------------

// Normalize a UDS-relative asset path declared in spec.json or impl.json
// into a path that udsResolve() can consume.
//
// Two shapes need handling:
//   1. Leading "uds/" — both spec.dependencies.css[0] and impl.jsFile
//      include the leading "uds/" prefix from the pre-restructure layout.
//      udsResolve already prepends "./uds/" (or "./versions/<v>/uds/"), so
//      a raw path of "uds/components/button.css" becomes
//      "./uds/uds/components/button.css" — 404. Strip the prefix.
//   2. Flat legacy CSS paths — spec.json still says "components/button.css"
//      after stripping the prefix, but on disk every component CSS lives at
//      "components/<id>/<id>.css" after the per-component restructure.
//      Detect a `components/<filename>.css` path with no nested dir and
//      remap to the canonical `components/<componentId>/<componentId>.css`.
//      (For `tabs`, spec.json says `tab-horizontal.css`, but the file is
//       `tabs/tabs.css`. Using componentId on both sides lands correctly.)
function normalizeUdsAssetPath(path: string, componentId: string): string {
  let p = path.replace(/^\/+/, '').replace(/^uds\//, '');
  // Flat CSS: "components/<anything>.css" → "components/<id>/<id>.css".
  const flatCss = /^components\/([^/]+)\.css$/.exec(p);
  if (flatCss) {
    p = `components/${componentId}/${componentId}.css`;
  }
  return p;
}

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
  const rawCssPath = spec?.dependencies?.css?.[0] || null;
  const cssPath = rawCssPath ? normalizeUdsAssetPath(rawCssPath, componentId) : null;
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
  const rawJsFile = impl?.jsFile || null;
  const jsFile = rawJsFile ? normalizeUdsAssetPath(rawJsFile, componentId) : null;
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
            <DocsCodeBlock code={impl.html || '/* No example HTML in impl.json */'} language="html" />
          </div>
          <div
            className={`sg-impl-panel${activeTab === 'styles' ? ' active' : ''}`}
            data-impl-panel="styles"
          >
            <DocsCodeBlock code={cssText ?? 'Loading…'} language="css" />
          </div>
          {hasBehavior ? (
            <div
              className={`sg-impl-panel${activeTab === 'behavior' ? ' active' : ''}`}
              data-impl-panel="behavior"
            >
              <DocsCodeBlock code={jsText ?? 'Loading…'} language="js" />
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

// Max number of icons rendered in the dropdown. Bumping much higher makes the
// picker sluggish on lower-end laptops.
const ICON_PICKER_MAX_RESULTS = 60;

function IconPickerControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const display = value || 'info';

  // Filter against the full Material Symbols vocabulary, capped at
  // ICON_PICKER_MAX_RESULTS so the dropdown doesn't render thousands of
  // glyphs at once. Empty query falls back to the first N icons so the
  // dropdown isn't blank when first opened.
  const matches = useMemo<readonly string[]>(() => {
    const normalized = query.trim().toLowerCase().replace(/\s+/g, '_');
    const source = normalized
      ? MATERIAL_ICONS.filter((n) => n.includes(normalized))
      : MATERIAL_ICONS;
    return source.slice(0, ICON_PICKER_MAX_RESULTS);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  // Close on outside-click + Escape, matching the legacy picker behavior.
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="sg-icon-picker" ref={wrapRef}>
      <button
        type="button"
        className="sg-icon-picker-trigger"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="material-symbols-outlined">{display}</span>
        <span className="sg-icon-picker-name">{display}</span>
      </button>
      {open ? (
        <div className="sg-icon-picker-dropdown" role="dialog">
          <input
            ref={searchRef}
            type="text"
            className="sg-icon-picker-search"
            placeholder="Search icons…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClick={(event) => event.stopPropagation()}
          />
          <div className="sg-icon-picker-results" role="listbox">
            {matches.length === 0 ? (
              <div className="sg-icon-picker-empty">No icons found</div>
            ) : (
              matches.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={name === value}
                  className={`sg-icon-picker-item${name === value ? ' active' : ''}`}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  <span className="material-symbols-outlined">{name}</span>
                  <span>{name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
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
    <div className="ds-playground-control">
      <label className="ds-playground-control__label">{control.label}</label>
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
          className="ds-playground-input"
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
          className="ds-playground-checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'text':
      return (
        <input
          type="text"
          className="ds-playground-input"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'icon-search':
      // Searchable Material Symbols picker. Trigger button displays the
      // current glyph + name; clicking opens a dropdown with a search
      // input and the filtered icon list, capped to 60 results at a time.
      return <IconPickerControl value={String(value ?? '')} onChange={(v) => onChange(v)} />;
    default:
      return null;
  }
}
