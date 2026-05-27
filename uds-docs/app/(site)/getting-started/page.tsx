import { VersionedLink as Link } from '@/components/site/VersionedLink';
import { UdsDownloadButton } from '@/components/site/UdsDownloadButton';
import { DocsCard, DocsCodeBlock, DocsPageHeader, DocsSection, DocsStateMessage } from '@/components/site/ui';

export const metadata = { title: 'Getting Started — UDS' };

const howItWorks = [
  {
    icon: 'download',
    title: '1. Get the files',
    body: (
      <>
        Download the UDS bundle below (CSS + JS), or copy the <code>uds/</code> folder from the shared repository.
      </>
    ),
  },
  {
    icon: 'link',
    title: '2. Add to your project',
    body: (
      <>
        Link <code>uds.css</code> for styling and <code>uds.js</code> for component behavior. The JS orchestrator
        auto-loads per-component scripts (one <code>.js</code> file per interactive component).
      </>
    ),
  },
  {
    icon: 'content_copy',
    title: '3. Copy & paste',
    body: 'Browse component pages, copy the markup from any example or playground, and paste it into your project. Done.',
  },
];

const npmInstallCode = 'npm install uds-core';

const npmImportCode = `// In your entry file (main.jsx, main.js, etc.)
import 'uds-core/uds.css';`;

const cdnCode = `<link rel="stylesheet" href="https://udsdocs.com/uds/uds.css" />
<script src="https://udsdocs.com/uds/uds.js"></script>`;

const pinnedVersionCode = '<link rel="stylesheet" href="https://udsdocs.com/versions/0.2/uds/uds.css" />';

const aiAssistPathCode = 'your-project/.cursor/rules/uds-design-system.mdc';

const fileStructureCode = `uds/
├── uds.css              ← master stylesheet (imports all component CSS)
├── uds.js               ← orchestrator (loads all component JS)
├── tokens/
│   ├── primitives.css   ← raw color palette
│   ├── semantic.css     ← themed color, spacing, font tokens
│   └── text-styles.css  ← typography utility classes
└── components/
    ├── button/
    │   ├── button.css              ← component styles
    │   ├── spec.json               ← Guidelines data
    │   ├── impl.json               ← Code-tab reference data
    │   ├── playground.js           ← interactive playground config
    │   └── examples/*.html         ← example markup
    ├── text-input/
    │   ├── text-input.css
    │   ├── text-input.js
    │   └── ...
    └── ...`;

const tokenLayerCode = `<head>
  <!-- Material Symbols icon font (required for icons) -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

  <!-- UDS tokens + base styles -->
  <link rel="stylesheet" href="uds/uds.css" />
</head>`;

const webComponentsCode = `// app entry (any framework)
import 'uds-core/uds.css';
import { registerUdsComponents } from '@uds/components'; // (TODO: real package once published)
registerUdsComponents();`;

const webComponentsTemplateCode = `<!-- Then in any framework's template -->
<udc-button variant="primary">Save</udc-button>
<udc-dialog open>...</udc-dialog>`;

const vanillaFallbackCode = `<link rel="stylesheet" href="uds/uds.css" />
<script src="uds/uds.js"></script>

<!-- Copy markup from any component page -->
<button class="udc-button-primary">Save changes</button>`;

const themingCode = `<!-- Light mode (default — no attributes needed) -->
<html>

<!-- Dark mode -->
<html data-color-scheme="dark">

<!-- Brand override -->
<html data-theme="resman">

<!-- Combine multiple -->
<html data-color-scheme="dark" data-theme="anyonehome" data-font="poppins">`;

export default function GettingStartedPage() {
  return (
    <>
      <DocsPageHeader
        title="Getting Started"
        description={
          <>
            UDS (Urban Design System) ships in two layers: <strong>tokens</strong> (semantic CSS custom properties)
            and <strong>components</strong> (framework-agnostic web components in Storybook). Tokens drop into any
            stack via <code>uds.css</code>; components register once and work in React, Vue, Svelte, Angular, or
            vanilla. The doc site is the design specification — all code shown is example-only.
          </>
        }
      />

      <DocsSection title="How it works">
        <div
          style={{
            display: 'grid',
            gap: 'var(--uds-space-200)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {howItWorks.map((step) => (
            <DocsCard key={step.title} elevated>
              <div style={{ padding: 'var(--uds-space-300)' }}>
                <h3 className="ds-section__title">
                  <span className="material-symbols-outlined">{step.icon}</span> {step.title}
                </h3>
                <p className="ds-guideline-prose">{step.body}</p>
              </div>
            </DocsCard>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        title="Download"
        description="The bundle contains all tokens (colors, spacing, typography), every component stylesheet, and the JS behavior file. No dependencies, no build step."
      >
        <UdsDownloadButton />
        <DocsStateMessage tone="info">
          Or, if your team uses a shared repo, copy the <code>uds/</code> folder directly into your project.
        </DocsStateMessage>
      </DocsSection>

      <DocsSection
        title="npm"
        description="Install the UDS token layer as an npm package for any bundler-based project."
      >
        <DocsCodeBlock code={npmInstallCode} language="shell" />
        <div style={{ marginTop: 'var(--uds-space-150)' }}>
          <DocsCodeBlock code={npmImportCode} language="js" />
        </div>
        <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-200)' }}>
          Works with Vite, Next.js, Nuxt, and most bundlers. This is the <strong>token layer</strong> only — for
          production component code, register the framework-agnostic web components from the UDS Storybook.
        </p>
      </DocsSection>

      <DocsSection title="CDN" description="Add UDS to any page with two tags — no build step required.">
        <DocsCodeBlock code={cdnCode} language="html" />
        <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-200)' }}>
          Pin to a specific version:
        </p>
        <div style={{ marginTop: 'var(--uds-space-100)' }}>
          <DocsCodeBlock code={pinnedVersionCode} language="html" />
        </div>
      </DocsSection>

      <DocsSection
        title="AI Assist"
        description="Using Cursor or another AI coding tool? Download the UDS rule file and drop it in your project."
      >
        <DocsCodeBlock code={aiAssistPathCode} language="text" />
        <DocsStateMessage tone="info">
          The rule tells your AI to use UDS tokens and components automatically. See the{' '}
          <Link href="/ai-assist">
            AI Assist
          </Link>{' '}
          page for details and downloads.
        </DocsStateMessage>
      </DocsSection>

      <DocsSection
        title="File Structure"
        description={
          <>
            You can import <code>uds.css</code> for the full bundle, or cherry-pick individual token and component
            files.
          </>
        }
      >
        <DocsCodeBlock code={fileStructureCode} language="text" />
      </DocsSection>

      <DocsSection
        title="Two Layers"
        description="UDS ships in two layers. Use both, or just the tokens layer if you're using the Storybook web components."
      >
        <DocsSection
          title="1. Tokens (CSS only)"
          description="Semantic CSS custom properties for colors, spacing, type, borders, and shadows. Drop the stylesheet in any project — the icon font is a separate link."
          level={3}
        >
          <DocsCodeBlock code={tokenLayerCode} language="html" />
        </DocsSection>

        <DocsSection
          title="2. Components — Storybook web components (recommended)"
          description="Production component code lives in the UDS Storybook as framework-agnostic web components. Register them once at app entry, then use the tags in any framework — React, Vue, Svelte, Angular, vanilla."
          level={3}
        >
          <DocsCodeBlock code={webComponentsCode} language="js" />
          <div style={{ marginTop: 'var(--uds-space-150)' }}>
            <DocsCodeBlock code={webComponentsTemplateCode} language="html" />
          </div>
          <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-200)' }}>
            Browse the Storybook for live demos, props, and the full component API. Until the Storybook is live, this
            section is a placeholder.
          </p>
        </DocsSection>

        <DocsSection
          title="2b. Components — vanilla HTML fallback"
          description={
            <>
              If a project can&apos;t use web components (strictly server-rendered, etc.), copy the HTML structure shown
              on each component page into your markup and load <code>uds.js</code> for interactive behavior. Note:{' '}
              <strong>all code on this site is example only</strong> — production code lives in Storybook.
            </>
          }
          level={3}
        >
          <DocsCodeBlock code={vanillaFallbackCode} language="html" />
        </DocsSection>
      </DocsSection>

      <DocsSection
        title="Using the Docs"
        description="Each component page in the sidebar has everything you need to spec the component:"
      >
        <table className="ds-table">
          <thead>
            <tr>
              <th>Tab</th>
              <th>What you&apos;ll find</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Examples</strong>
              </td>
              <td>
                Live previews with a &quot;Show code&quot; toggle. Data-consuming components (Data Table, List, Dropdown,
                Search, Breadcrumb) include realistic data examples (tiny / large / long-content / empty / loading)
              </td>
            </tr>
            <tr>
              <td>
                <strong>Code</strong>
              </td>
              <td>
                Vanilla HTML/CSS structure showing the design intent. Example only — for production framework code, use
                the Storybook web components
              </td>
            </tr>
            <tr>
              <td>
                <strong>Guidelines</strong>
              </td>
              <td>
                Full handoff spec: when to use, acceptance criteria, props, events, slots, states, accessibility,
                ownership. Auto-rendered from <code>content/&lt;component&gt;.json</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Changelog</strong>
              </td>
              <td>Per-component release history</td>
            </tr>
            <tr>
              <td>
                <strong>Playground</strong>
              </td>
              <td>Interactive sandbox — configure variants and states to see the markup the spec implies</td>
            </tr>
          </tbody>
        </table>
        <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-200)' }}>
          Hit <kbd>/</kbd> or <kbd>⌘K</kbd> anywhere to open the global token search.
        </p>
      </DocsSection>

      <DocsSection
        title="Theming"
        description={
          <>
            UDS supports multiple themes via <code>data-*</code> attributes on the <code>&lt;html&gt;</code> element. Set
            them to switch color schemes, brands, fonts, and density at runtime — no rebuild needed.
          </>
        }
      >
        <DocsCodeBlock code={themingCode} language="html" />

        <DocsSection title="Available theme attributes" level={3}>
          <table className="ds-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Values</th>
                <th>Effect</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>data-color-scheme</code>
                </td>
                <td>
                  <code>dark</code>
                </td>
                <td>Dark mode (light is default)</td>
              </tr>
              <tr>
                <td>
                  <code>data-theme</code>
                </td>
                <td>
                  <code>resman</code>, <code>anyonehome</code>, <code>inhabit</code>
                </td>
                <td>Brand accent colors</td>
              </tr>
              <tr>
                <td>
                  <code>data-font</code>
                </td>
                <td>
                  <code>poppins</code>, <code>roboto</code>, <code>lexend</code>
                </td>
                <td>Font family override</td>
              </tr>
              <tr>
                <td>
                  <code>data-font-scale</code>
                </td>
                <td>
                  <code>smaller</code>, <code>larger</code>
                </td>
                <td>Global font size scale</td>
              </tr>
              <tr>
                <td>
                  <code>data-density</code>
                </td>
                <td>
                  <code>comfortable</code>
                </td>
                <td>Relaxed spacing</td>
              </tr>
            </tbody>
          </table>
          <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-200)' }}>
            Try these live using the appearance bar at the top of this site.
          </p>
        </DocsSection>
      </DocsSection>
    </>
  );
}
