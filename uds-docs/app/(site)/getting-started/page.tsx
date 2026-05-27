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
        Import the UDS CSS bundle for tokens, then register the Web Components package once at app startup.
      </>
    ),
  },
  {
    icon: 'link',
    title: '2. Add to your project',
    body: (
      <>
        Use <code>@uds/web-components</code> in any framework, or <code>@uds/react</code> when your app is React.
      </>
    ),
  },
  {
    icon: 'content_copy',
    title: '3. Copy & paste',
    body: 'Use the Web Component tags as the public API. Current class-based examples stay in place only until cutover.',
  },
];

const npmInstallCode = `# Once the package is published
npm install @uds/web-components @uds/react`;

const npmImportCode = `// In your entry file (main.jsx, main.js, etc.)
import './uds/uds.css';
import { registerUdsComponents } from '@uds/web-components';

registerUdsComponents();`;

const cdnCode = `<link rel="stylesheet" href="https://udsdocs.com/uds/uds.css" />
<!-- Web Component registration bundle will replace the legacy uds.js path at public cutover. -->`;

const pinnedVersionCode = '<link rel="stylesheet" href="https://udsdocs.com/versions/0.2/uds/uds.css" />';

const aiAssistPathCode = 'your-project/.cursor/rules/uds-design-system.mdc';

const fileStructureCode = `uds/
├── uds.css              ← master stylesheet (imports all component CSS)
├── uds.js               ← legacy orchestrator kept until Web Component cutover
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
import './uds/uds.css';
import { registerUdsComponents } from '@uds/web-components';

registerUdsComponents();`;

const webComponentsTemplateCode = `<!-- Then in any framework's template -->
<udc-button variant="primary">Save</udc-button>
<udc-text-input label="Full name" helper-text="First and last name required"></udc-text-input>`;

const reactWrapperCode = `import { UdsButton, UdsTextInput } from '@uds/react';

export function ProfileForm() {
  return (
    <>
      <UdsTextInput label="Full name" helperText="First and last name required" />
      <UdsButton variant="primary">Save</UdsButton>
    </>
  );
}`;

const vanillaFallbackCode = `<link rel="stylesheet" href="uds/uds.css" />
<script type="module" src="path/to/register-uds-components.js"></script>

<udc-button variant="primary">Save changes</udc-button>`;

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
        description="The current bundle contains the token CSS and legacy component payload. The Web Components package is being built beside it for the public API cutover."
      >
        <UdsDownloadButton />
        <DocsStateMessage tone="info">
          Or, if your team uses a shared repo, copy the <code>uds/</code> folder directly into your project.
        </DocsStateMessage>
      </DocsSection>

      <DocsSection
        title="npm"
        description="Install the Web Component package for framework-agnostic components, or add the React wrapper package when your app is React."
      >
        <DocsCodeBlock code={npmInstallCode} language="shell" />
        <div style={{ marginTop: 'var(--uds-space-150)' }}>
          <DocsCodeBlock code={npmImportCode} language="js" />
        </div>
        <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-200)' }}>
          The Web Component package is being built beside the current docs examples. Every documented component now
          has an initial tag and React wrapper; the current component pages stay on the existing examples until
          examples, playgrounds, and deeper complex-component behavior are ready for the full cutover.
        </p>
      </DocsSection>

      <DocsSection title="CDN" description="Add the UDS token CSS to any page. Component registration will move to the Web Components bundle at cutover.">
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
        description="UDS ships in two layers. Use both, or just the tokens layer when you only need foundations."
      >
        <DocsSection
          title="1. Tokens (CSS only)"
          description="Semantic CSS custom properties for colors, spacing, type, borders, and shadows. Drop the stylesheet in any project — the icon font is a separate link."
          level={3}
        >
          <DocsCodeBlock code={tokenLayerCode} language="html" />
        </DocsSection>

        <DocsSection
          title="2. Components — Web Components"
          description="The replacement component API is framework-agnostic Web Components. Register them once at app entry, then use the tags in any framework — React, Vue, Svelte, Angular, or plain HTML."
          level={3}
        >
          <DocsCodeBlock code={webComponentsCode} language="js" />
          <div style={{ marginTop: 'var(--uds-space-150)' }}>
            <DocsCodeBlock code={webComponentsTemplateCode} language="html" />
          </div>
          <p className="ds-guideline-prose" style={{ marginTop: 'var(--uds-space-200)' }}>
            This package is landing in parallel with the current docs. Wait for the public cutover before replacing
            every class-based example in product guidance.
          </p>
        </DocsSection>

        <DocsSection
          title="2b. React wrappers"
          description="React apps should use the wrapper package. It renders the same Web Components and provides React-friendly prop and event names."
          level={3}
        >
          <DocsCodeBlock code={reactWrapperCode} language="tsx" />
        </DocsSection>

        <DocsSection
          title="2c. Current docs examples"
          description={
            <>
              Component pages still show the current class-based examples while the Web Component set is incomplete.
              Those examples remain useful for design review, but they are no longer the target public API.
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
                Current HTML/CSS examples showing the design intent. For production framework code, use the Web
                Component package once the matching component has landed.
              </td>
            </tr>
            <tr>
              <td>
                <strong>Guidelines</strong>
              </td>
              <td>
                Full handoff spec: when to use, acceptance criteria, props, events, slots, states, accessibility,
                ownership. Auto-rendered from <code>uds/components/&lt;component&gt;/spec.json</code>
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
