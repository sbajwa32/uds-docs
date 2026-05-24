'use client';

// Temporary home page for the rebuild. Renders a "UDS migration in progress"
// placeholder plus a developer-facing theme-toggle UI that exercises every
// dimension of the UdsThemeProvider so designers can confirm all 6 advertised
// theme combos flip cleanly on the Cloudflare preview.
//
// The toggle uses the UDS button classes (.udc-button-primary / -secondary)
// so the controls themselves theme correctly across all 6 combos — no inline
// CSS-variable management.
//
// Removed in Chunk 05 (App Shell), which moves the real theme controls into
// the header chrome.

import {
  useUdsTheme,
  type ColorScheme,
  type Theme,
  type Font,
  type FontScale,
  type Density,
} from '@/components/site/UdsThemeProvider';

const COMBO_PRESETS: {
  label: string;
  patch: { colorScheme: ColorScheme; theme: Theme };
}[] = [
  { label: 'Base Light', patch: { colorScheme: '', theme: '' } },
  { label: 'Base Dark', patch: { colorScheme: 'dark', theme: '' } },
  { label: 'ResMan Light', patch: { colorScheme: '', theme: 'resman' } },
  { label: 'ResMan Dark', patch: { colorScheme: 'dark', theme: 'resman' } },
  { label: 'AnyoneHome Light', patch: { colorScheme: '', theme: 'anyonehome' } },
  { label: 'Inhabit Light', patch: { colorScheme: '', theme: 'inhabit' } },
];

const COLOR_SCHEMES: { label: string; value: ColorScheme }[] = [
  { label: 'Light', value: '' },
  { label: 'Dark', value: 'dark' },
];

const THEMES: { label: string; value: Theme }[] = [
  { label: 'Base', value: '' },
  { label: 'ResMan', value: 'resman' },
  { label: 'AnyoneHome', value: 'anyonehome' },
  { label: 'Inhabit', value: 'inhabit' },
];

const FONTS: { label: string; value: Font }[] = [
  { label: 'Inter', value: '' },
  { label: 'Poppins', value: 'poppins' },
  { label: 'Roboto', value: 'roboto' },
  { label: 'Lexend', value: 'lexend' },
];

const FONT_SCALES: { label: string; value: FontScale }[] = [
  { label: 'Smaller', value: 'smaller' },
  { label: 'Default', value: '' },
  { label: 'Larger', value: 'larger' },
];

const DENSITIES: { label: string; value: Density }[] = [
  { label: 'Default', value: '' },
  { label: 'Comfortable', value: 'comfortable' },
];

export default function HomeContent() {
  const t = useUdsTheme();

  return (
    <main
      style={{
        maxWidth: '52rem',
        margin: '3rem auto',
        padding: '0 1.5rem',
        color: 'var(--uds-color-text-primary)',
        background: 'var(--uds-color-surface-main)',
        minHeight: '100vh',
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ marginTop: 0, fontSize: '2rem', fontWeight: 700 }}>
        UDS migration in progress
      </h1>
      <p>
        The Urban Design System documentation site is being rebuilt on
        TypeScript + React + Next.js. This URL is the staging build — pages
        appear here as the migration progresses.
      </p>
      <p>
        Live site:{' '}
        <a href="https://udsdocs.com" style={{ color: 'var(--uds-color-text-interactive)' }}>
          udsdocs.com
        </a>
      </p>

      <hr
        style={{
          margin: '2rem 0',
          border: 0,
          borderTop: '1px solid var(--uds-color-border-secondary)',
        }}
      />

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Theme toggle (developer aid)
      </h2>
      <p style={{ marginTop: 0, fontSize: '0.9rem', color: 'var(--uds-color-text-secondary)' }}>
        Temporary surface so designers can verify every theme combo on the
        preview URL. Removed in Chunk 05 when the real theme controls land in
        the header.
      </p>

      <ToggleRow
        label="Combos (the 6 advertised pairings)"
        items={COMBO_PRESETS.map((c) => ({ label: c.label, value: c.label }))}
        active={
          COMBO_PRESETS.find(
            (c) => c.patch.colorScheme === t.colorScheme && c.patch.theme === t.theme,
          )?.label ?? ''
        }
        onPick={(label) => {
          const preset = COMBO_PRESETS.find((c) => c.label === label);
          if (preset) t.setThemeState(preset.patch);
        }}
      />

      <ToggleRow
        label="Color scheme"
        items={COLOR_SCHEMES.map((c) => ({ label: c.label, value: c.value }))}
        active={t.colorScheme}
        onPick={(v) => t.setColorScheme(v as ColorScheme)}
      />

      <ToggleRow
        label="Theme"
        items={THEMES.map((c) => ({ label: c.label, value: c.value }))}
        active={t.theme}
        onPick={(v) => t.setTheme(v as Theme)}
      />

      <ToggleRow
        label="Font"
        items={FONTS.map((c) => ({ label: c.label, value: c.value }))}
        active={t.font}
        onPick={(v) => t.setFont(v as Font)}
      />

      <ToggleRow
        label="Font scale"
        items={FONT_SCALES.map((c) => ({ label: c.label, value: c.value }))}
        active={t.fontScale}
        onPick={(v) => t.setFontScale(v as FontScale)}
      />

      <ToggleRow
        label="Density"
        items={DENSITIES.map((c) => ({ label: c.label, value: c.value }))}
        active={t.density}
        onPick={(v) => t.setDensity(v as Density)}
      />

      <CurrentState state={t} />
    </main>
  );
}

function ToggleRow({
  label,
  items,
  active,
  onPick,
}: {
  label: string;
  items: { label: string; value: string }[];
  active: string;
  onPick: (value: string) => void;
}) {
  return (
    <div style={{ margin: '1rem 0' }}>
      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: 'var(--uds-color-text-secondary)',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {items.map((item) => {
          const isActive = item.value === active;
          return (
            <button
              key={item.label}
              type="button"
              data-size="sm"
              className={isActive ? 'udc-button-primary' : 'udc-button-secondary'}
              onClick={() => onPick(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CurrentState({
  state,
}: {
  state: { colorScheme: string; theme: string; font: string; fontScale: string; density: string };
}) {
  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        border: '1px solid var(--uds-color-border-secondary)',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        background: 'var(--uds-color-surface-subtle)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
        Current &lt;html&gt; data-* attributes
      </div>
      <div>data-color-scheme: &quot;{state.colorScheme}&quot;</div>
      <div>data-theme: &quot;{state.theme}&quot;</div>
      <div>data-font: &quot;{state.font}&quot;</div>
      <div>data-font-scale: &quot;{state.fontScale}&quot;</div>
      <div>data-density: &quot;{state.density}&quot;</div>
    </div>
  );
}
