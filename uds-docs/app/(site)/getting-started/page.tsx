import { VersionedLink as Link } from '@/components/site/VersionedLink';
import { SgPageTitle, SgPageDesc } from '@/components/site/SgPageHeader';
import { SgSubsectionTitle, SgSubsectionDesc } from '@/components/site/SgSubsection';
import { UdsDownloadButton } from '@/components/site/UdsDownloadButton';

export const metadata = { title: 'Getting Started — UDS' };

export default function GettingStartedPage() {
  return (
    <div className="sg-page-content">
      <SgPageTitle>Getting Started</SgPageTitle>
      <SgPageDesc>UDS (Urban Design System) ships in two layers: <strong>tokens</strong> (semantic CSS custom properties) and <strong>components</strong> (framework-agnostic web components in Storybook). Tokens drop into any stack via <code className="sg-inline-code">uds.css</code>; components register once and work in React, Vue, Svelte, Angular, or vanilla. The doc site is the design specification — all code shown is example-only.</SgPageDesc>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 8 }}>How it works</h2>
      <div className="sg-package-cards">
        <div className="sg-package-card">
          <h3><span className="material-symbols-outlined">download</span> 1. Get the files</h3>
          <p>Download the UDS bundle below (CSS + JS), or copy the <code style={{ display: 'inline', padding: '2px 5px' }}>uds/</code> folder from the shared repository.</p>
        </div>
        <div className="sg-package-card">
          <h3><span className="material-symbols-outlined">link</span> 2. Add to your project</h3>
          <p>Link <code style={{ display: 'inline', padding: '2px 5px' }}>uds.css</code> for styling and <code style={{ display: 'inline', padding: '2px 5px' }}>uds.js</code> for component behavior. The JS orchestrator auto-loads per-component scripts (one <code style={{ display: 'inline', padding: '2px 5px' }}>.js</code> file per interactive component).</p>
        </div>
        <div className="sg-package-card">
          <h3><span className="material-symbols-outlined">content_copy</span> 3. Copy & paste</h3>
          <p>Browse component pages, copy the markup from any example or playground, and paste it into your project. Done.</p>
        </div>
      </div>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 0 }}>Download</h2>
      <SgPageDesc>The bundle contains all tokens (colors, spacing, typography), every component stylesheet, and the JS behavior file. No dependencies, no build step.</SgPageDesc>

      <UdsDownloadButton />

      <p style={{ fontSize: 'var(--uds-font-size-sm)', color: 'var(--uds-color-text-secondary)', marginTop: 'var(--uds-space-050)' }}>Or, if your team uses a shared repo, copy the <code className="sg-inline-code">uds/</code> folder directly into your project.</p>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 'var(--uds-space-500)' }}>npm</h2>
      <SgPageDesc>Install the UDS token layer as an npm package for any bundler-based project.</SgPageDesc>
      <pre className="sg-playground-code" style={{ marginBottom: 'var(--uds-space-100)' }}>npm install uds-core</pre>
      <pre className="sg-playground-code" style={{ marginBottom: 'var(--uds-space-200)' }}>{`// In your entry file (main.jsx, main.js, etc.)
import 'uds-core/uds.css';`}</pre>
      <p style={{ fontSize: 'var(--uds-font-size-sm)', color: 'var(--uds-color-text-secondary)' }}>Works with Vite, Next.js, Nuxt, and most bundlers. This is the <strong>token layer</strong> only — for production component code, register the framework-agnostic web components from the UDS Storybook.</p>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 'var(--uds-space-500)' }}>CDN</h2>
      <SgPageDesc>Add UDS to any page with two tags — no build step required.</SgPageDesc>
      <pre className="sg-playground-code" style={{ marginBottom: 'var(--uds-space-200)' }}>{`<link rel="stylesheet" href="https://sbajwa32.github.io/uds-docs/uds/uds.css" />
<script src="https://sbajwa32.github.io/uds-docs/uds/uds.js"></script>`}</pre>
      <p style={{ fontSize: 'var(--uds-font-size-sm)', color: 'var(--uds-color-text-secondary)', marginBottom: 'var(--uds-space-100)' }}>Pin to a specific version:</p>
      <pre className="sg-playground-code" style={{ marginBottom: 'var(--uds-space-200)' }}>{`<link rel="stylesheet" href="https://sbajwa32.github.io/uds-docs/versions/0.2/uds/uds.css" />`}</pre>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 'var(--uds-space-500)' }}>AI Assist</h2>
      <SgPageDesc>Using Cursor or another AI coding tool? Download the UDS rule file and drop it in your project.</SgPageDesc>
      <pre className="sg-playground-code" style={{ marginBottom: 'var(--uds-space-100)' }}>your-project/.cursor/rules/uds-design-system.mdc</pre>
      <p style={{ fontSize: 'var(--uds-font-size-sm)', color: 'var(--uds-color-text-secondary)', marginBottom: 'var(--uds-space-200)' }}>The rule tells your AI to use UDS tokens and components automatically. See the <Link href="/ai-assist" style={{ color: 'var(--uds-color-text-interactive)' }}>AI Assist</Link> page for details and downloads.</p>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 'var(--uds-space-500)' }}>File Structure</h2>
      <SgPageDesc>You can import <code className="sg-inline-code">uds.css</code> for the full bundle, or cherry-pick individual token and component files.</SgPageDesc>

      <pre className="sg-file-tree"><span className="dir">uds/</span>{`
├── `}<strong>uds.css</strong>{`              `}<span className="comment">← master stylesheet (imports all component CSS)</span>{`
├── `}<strong>uds.js</strong>{`               `}<span className="comment">← orchestrator (loads all component JS)</span>{`
├── `}<span className="dir">tokens/</span>{`
│   ├── primitives.css   `}<span className="comment">← raw color palette</span>{`
│   ├── semantic.css     `}<span className="comment">← themed color, spacing, font tokens</span>{`
│   └── text-styles.css  `}<span className="comment">← typography utility classes</span>{`
└── `}<span className="dir">components/</span>{`
    ├── button.css                  `}<span className="comment">← CSS-only</span>{`
    ├── text-input.css  + .js       `}<span className="comment">← validation, counter, clear</span>{`
    ├── checkbox.css    + .js       `}<span className="comment">← indeterminate support</span>{`
    ├── radio.css                   `}<span className="comment">← CSS-only</span>{`
    ├── dropdown.css    + .js       `}<span className="comment">← open/close, select, keyboard</span>{`
    ├── tabs.js  (tab-horizontal.css)  `}<span className="comment">← click, arrows, ARIA</span>{`
    ├── notification.css + .js      `}<span className="comment">← dismiss</span>{`
    ├── dialog.css      + .js       `}<span className="comment">← backdrop, Escape</span>{`
    ├── tile.css        + .js       `}<span className="comment">← toggle selected</span>{`
    ├── list.css        + .js       `}<span className="comment">← single select, keyboard</span>{`
    ├── data-table.css  + .js       `}<span className="comment">← checkbox all, sort</span>{`
    ├── nav-header.css  + .js       `}<span className="comment">← bento dropdown</span>{`
    ├── nav-vertical.css + .js      `}<span className="comment">← sidebar selection</span>{`
    ├── badge.css                   `}<span className="comment">← CSS-only</span>{`
    ├── divider.css                 `}<span className="comment">← CSS-only</span>{`
    ├── icon-wrapper.css            `}<span className="comment">← CSS-only</span>{`
    ├── spacer.css                  `}<span className="comment">← CSS-only</span>{`
    └── breadcrumb.css              `}<span className="comment">← CSS-only</span></pre>

      <h2 className="sg-page-title" style={{ fontSize: 22 }}>Two Layers</h2>
      <SgPageDesc>UDS ships in two layers. Use both, or just the tokens layer if you&apos;re using the Storybook web components.</SgPageDesc>

      <SgSubsectionTitle>1. Tokens (CSS only)</SgSubsectionTitle>
      <SgSubsectionDesc>Semantic CSS custom properties for colors, spacing, type, borders, and shadows. Drop the stylesheet in any project — the icon font is a separate link.</SgSubsectionDesc>
      <pre className="sg-playground-code">{`<head>
  <!-- Material Symbols icon font (required for icons) -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

  <!-- UDS tokens + base styles -->
  <link rel="stylesheet" href="uds/uds.css" />
</head>`}</pre>

      <h3 className="sg-subsection-title" style={{ marginTop: 32 }}>2. Components — Storybook web components (recommended)</h3>
      <SgSubsectionDesc>Production component code lives in the UDS Storybook as framework-agnostic web components. Register them once at app entry, then use the tags in any framework — React, Vue, Svelte, Angular, vanilla.</SgSubsectionDesc>
      <pre className="sg-playground-code">{`// app entry (any framework)
import 'uds-core/uds.css';
import { registerUdsComponents } from '@uds/components'; // (TODO: real package once published)
registerUdsComponents();`}</pre>
      <pre className="sg-playground-code" style={{ marginTop: 12 }}>{`<!-- Then in any framework's template -->
<udc-button variant="primary">Save</udc-button>
<udc-dialog open>...</udc-dialog>`}</pre>
      <p style={{ fontSize: 13, color: 'var(--uds-color-text-secondary)', marginTop: 8, lineHeight: 1.6 }}>Browse the Storybook for live demos, props, and the full component API. Until the Storybook is live, this section is a placeholder.</p>

      <h3 className="sg-subsection-title" style={{ marginTop: 32 }}>2b. Components — vanilla HTML fallback</h3>
      <SgSubsectionDesc>If a project can&apos;t use web components (strictly server-rendered, etc.), copy the HTML structure shown on each component page into your markup and load <code className="sg-inline-code">uds.js</code> for interactive behavior. Note: <strong>all code on this site is example only</strong> — production code lives in Storybook.</SgSubsectionDesc>
      <pre className="sg-playground-code">{`<link rel="stylesheet" href="uds/uds.css" />
<script src="uds/uds.js"></script>

<!-- Copy markup from any component page -->
<button class="udc-button-primary">Save changes</button>`}</pre>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 40 }}>Using the Docs</h2>
      <SgPageDesc>Each component page in the sidebar has everything you need to spec the component:</SgPageDesc>
      <table className="sg-api-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Tab</th><th>What you&apos;ll find</th></tr></thead>
        <tbody>
          <tr><td><strong>Examples</strong></td><td>Live previews with a &quot;Show code&quot; toggle. Data-consuming components (Data Table, List, Dropdown, Search, Breadcrumb) include realistic data examples (tiny / large / long-content / empty / loading)</td></tr>
          <tr><td><strong>Code</strong></td><td>Vanilla HTML/CSS structure showing the design intent. Example only — for production framework code, use the Storybook web components</td></tr>
          <tr><td><strong>Guidelines</strong></td><td>Full handoff spec: when to use, acceptance criteria, props, events, slots, states, accessibility, ownership. Auto-rendered from <code className="sg-inline-code">{`content/<component>.json`}</code></td></tr>
          <tr><td><strong>Changelog</strong></td><td>Per-component release history</td></tr>
          <tr><td><strong>Playground</strong></td><td>Interactive sandbox — configure variants and states to see the markup the spec implies</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: 'var(--uds-color-text-secondary)', marginTop: 12, lineHeight: 1.6 }}>Hit <kbd style={{ fontFamily: 'monospace', background: 'var(--uds-color-surface-alt)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--uds-color-border-primary)' }}>/</kbd> or <kbd style={{ fontFamily: 'monospace', background: 'var(--uds-color-surface-alt)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--uds-color-border-primary)' }}>⌘K</kbd> anywhere to open the global token search.</p>

      <h2 className="sg-page-title" style={{ fontSize: 22, marginTop: 40 }}>Theming</h2>
      <SgPageDesc>UDS supports multiple themes via <code className="sg-inline-code">data-*</code> attributes on the <code className="sg-inline-code">{`<html>`}</code> element. Set them to switch color schemes, brands, fonts, and density at runtime — no rebuild needed.</SgPageDesc>
      <pre className="sg-playground-code">{`<!-- Light mode (default — no attributes needed) -->
<html>

<!-- Dark mode -->
<html data-color-scheme="dark">

<!-- Brand override -->
<html data-theme="resman">

<!-- Combine multiple -->
<html data-color-scheme="dark" data-theme="anyonehome" data-font="poppins">`}</pre>

      <h3 className="sg-subsection-title" style={{ marginTop: 28 }}>Available theme attributes</h3>
      <table className="sg-api-table">
        <thead><tr><th>Attribute</th><th>Values</th><th>Effect</th></tr></thead>
        <tbody>
          <tr><td><code>data-color-scheme</code></td><td><code>dark</code></td><td>Dark mode (light is default)</td></tr>
          <tr><td><code>data-theme</code></td><td><code>resman</code>, <code>anyonehome</code>, <code>inhabit</code></td><td>Brand accent colors</td></tr>
          <tr><td><code>data-font</code></td><td><code>poppins</code>, <code>roboto</code>, <code>lexend</code></td><td>Font family override</td></tr>
          <tr><td><code>data-font-scale</code></td><td><code>smaller</code>, <code>larger</code></td><td>Global font size scale</td></tr>
          <tr><td><code>data-density</code></td><td><code>comfortable</code></td><td>Relaxed spacing</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: 'var(--uds-color-text-secondary)', marginTop: 12, lineHeight: 1.6 }}>Try these live using the appearance bar at the top of this site.</p>
    </div>
  );
}
