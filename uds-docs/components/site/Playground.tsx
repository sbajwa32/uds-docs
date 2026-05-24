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

import { useEffect, useMemo, useState } from 'react';

import { udsResolve } from '@/lib/uds-data';
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
            <pre className="sg-playground-code">
              <code>{output?.code ?? ''}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
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
      // The legacy icon-search control is a searchable Material Symbols
      // picker (depends on the global MATERIAL_ICONS list + a search palette).
      // For Chunk 09 we ship a plain text input — designers type the icon
      // name directly. Promoting to a real picker is a follow-up; the legacy
      // picker shares search infrastructure with Chunk 10's token search and
      // can plausibly reuse that component once it lands.
      return (
        <input
          type="text"
          className="sg-pg-input"
          placeholder="Material symbol name (e.g. add)"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return null;
  }
}
