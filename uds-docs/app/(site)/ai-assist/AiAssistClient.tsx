'use client';

import { useState } from 'react';
import { DocsCodeBlock, DocsPageHeader, DocsSection, DocsTab, DocsTabPanel, DocsTabs } from '@/components/site/ui';

export default function AiAssistClient() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="sg-page-content">
      <div className="ai-context-summary" style={{ display: 'none' }} aria-hidden="true">
        {`UDS (Urban Design System) — token-first design system with a Web Components component API.
ARCHITECTURE: Tokens ship as semantic CSS custom properties. Components ship as framework-agnostic Web Components, with React wrappers available for React apps. The doc site is the design specification.
CRITICAL RULES:
1. NEVER use --uds-primitive-* tokens. Only semantic tokens (--uds-color-*, --uds-space-*, --uds-font-*).
2. NEVER hardcode colors (#xxx), spacing (16px), or fonts ('Inter'). Always use var(--uds-*).
3. For component code in any framework, use the Web Component tags (e.g. <udc-button>, <udc-text-input>) or React wrappers from @uds/react.
Tokens install: import the UDS CSS bundle so semantic tokens are available.
Icons: Material Symbols Outlined from Google Fonts CDN.
Component tag prefix: udc- (e.g. <udc-button>, <udc-notification>, <udc-tabs>).
Theming: set data-color-scheme="dark" on html for dark mode. Semantic tokens adapt automatically.
Pattern mapping: toast→udc-notification, modal→udc-dialog, select→udc-dropdown, tag→udc-chip, status→udc-badge, card→udc-tile, sidebar→udc-nav-vertical, topbar→udc-nav-header.
Full JSON context: https://udsdocs.com/ai-context.json
Per-component spec (with acceptance criteria, props, events, slots, states, accessibility): https://udsdocs.com/uds/components/<component>/spec.json
Schema: https://udsdocs.com/uds/schemas/spec.schema.json
Storybook (production components): see Storybook URL on the doc site.`}
      </div>

      <DocsPageHeader
        title="AI Assist"
        description="Everything an AI agent needs to use the Urban Design System. Point your AI coding tool at this page or download the Cursor rule file."
      />

      <DocsTabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
        <DocsTab value="overview">Overview</DocsTab>
        <DocsTab value="tokens">Tokens</DocsTab>
        <DocsTab value="components">Components</DocsTab>
        <DocsTab value="theming">Theming</DocsTab>
        <DocsTab value="rules">Do&apos;s & Don&apos;ts</DocsTab>

        {/* OVERVIEW TAB */}
        <DocsTabPanel value="overview">
          <DocsSection>
            <h3 className="ds-section__title">What is UDS?</h3>
            <p className="ds-section__description">UDS (Urban Design System) is a token-first design system with framework-agnostic Web Components. It works with any stack — HTML, React, Vue, Angular, Svelte — with React wrappers available for React apps.</p>
          </DocsSection>

          <DocsSection>
            <h3 className="ds-section__title">For AI Agents</h3>
            <p className="ds-section__description">If you&apos;re an AI coding assistant, here&apos;s what you need:</p>
            <ul style={{ fontSize: 'var(--uds-font-size-base)', lineHeight: 1.8, color: 'var(--uds-color-text-primary)', paddingLeft: 'var(--uds-space-250)' }}>
              <li><strong>Machine-readable context:</strong> Fetch <a href="ai-context.json" style={{ color: 'var(--uds-color-text-interactive)' }}>ai-context.json</a> for the complete token list, component catalog, and framework rules in structured JSON.</li>
              <li><strong>Cursor rule:</strong> Download <code >uds-design-system.mdc</code> and place it in <code >.cursor/rules/</code> — it contains everything inline.</li>
              <li><strong>Install UDS:</strong> import the UDS CSS bundle, register <code>@uds/web-components</code>, and use <code>@uds/react</code> wrappers in React apps.</li>
              <li><strong>Icons:</strong> Material Symbols Outlined from Google Fonts CDN.</li>
            </ul>
          </DocsSection>

          <div className="sg-subsection" style={{ display: 'flex', gap: 'var(--uds-space-200)', flexWrap: 'wrap' }}>
            <a href="uds-design-system.mdc" download style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--uds-space-100)', padding: 'var(--uds-space-150) var(--uds-space-200)', borderRadius: 'var(--uds-border-radius-input)', background: 'var(--uds-color-surface-interactive-default)', color: 'var(--uds-color-text-inverse)', textDecoration: 'none', fontWeight: 'var(--uds-font-weight-medium)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 'var(--uds-font-size-xl)' }}>download</span>Download Cursor Rule (.mdc)
            </a>
            <a href="ai-context.json" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--uds-space-100)', padding: 'var(--uds-space-150) var(--uds-space-200)', borderRadius: 'var(--uds-border-radius-input)', border: '1px solid var(--uds-color-border-interactive)', color: 'var(--uds-color-text-interactive)', textDecoration: 'none', fontWeight: 'var(--uds-font-weight-medium)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 'var(--uds-font-size-xl)' }}>data_object</span>View ai-context.json
            </a>
          </div>

          <DocsSection>
            <h3 className="ds-section__title">Full Example — Tenant Dashboard</h3>
            <p className="ds-section__description">Here&apos;s the target component API using the parallel Web Components package:</p>
            <DocsCodeBlock code={`import './uds/uds.css';
import { registerUdsComponents } from '@uds/web-components';

registerUdsComponents();

<udc-notification tone="info" dismissible>
  3 invoices are pending review.
</udc-notification>

<udc-tabs selected-panel="profile">
  <udc-tab panel="profile">Profile</udc-tab>
  <udc-tab panel="settings">Settings</udc-tab>
  <udc-tab-panel panel="profile">
    <udc-text-input label="Full name" helper-text="First and last name required"></udc-text-input>
    <udc-checkbox name="verified">Verified tenant</udc-checkbox>
    <udc-chip variant="filter" selected>Active</udc-chip>
    <udc-badge tone="success">In good standing</udc-badge>
    <udc-button variant="primary">Save</udc-button>
  </udc-tab-panel>
  <udc-tab-panel panel="settings">
    <udc-tile label="Notifications" description="Send updates by email" selectable></udc-tile>
  </udc-tab-panel>
</udc-tabs>`} language="html" />
          </DocsSection>
        </DocsTabPanel>

        {/* TOKENS TAB */}
        <DocsTabPanel value="tokens">
          <div className="sg-subsection" style={{ marginBottom: 'var(--uds-space-400)', padding: 'var(--uds-space-300)', background: 'var(--uds-color-surface-warning-subtle)', borderRadius: 'var(--uds-border-radius-input)', borderLeft: '4px solid var(--uds-color-text-warning)' }}>
            <h3 className="sg-subsection-title" style={{ color: 'var(--uds-color-text-warning)', marginTop: 0 }}>Token Architecture — Primitives vs Semantics</h3>
            <p style={{ fontSize: 'var(--uds-font-size-base)', lineHeight: 1.7, marginBottom: 'var(--uds-space-200)' }}>UDS has TWO layers of tokens. <strong>Primitive tokens</strong> (<code >--uds-primitive-*</code>) are raw palette values that NEVER change across themes. <strong>Semantic tokens</strong> (<code >--uds-color-*</code>, <code >--uds-space-*</code>, etc.) reference primitives and CHANGE when themes switch.</p>
            <p style={{ fontSize: 'var(--uds-font-size-base)', lineHeight: 1.7, marginBottom: 'var(--uds-space-200)' }}><strong>Flow:</strong> Figma variable → Primitive CSS token → Semantic CSS token → Your code</p>
            <p style={{ fontSize: 'var(--uds-font-size-base)', fontWeight: 'var(--uds-font-weight-bold)', color: 'var(--uds-color-text-error)' }}>RULE: If a variable name contains &quot;primitive&quot;, NEVER use it in component code. Only use semantic tokens.</p>
          </div>

          <DocsSection>
            <h3 className="ds-section__title">When to Use Which Token</h3>
            <table className="ds-table">
              <thead><tr><th>Token</th><th>When to use</th></tr></thead>
              <tbody>
                <tr><td><code>--uds-color-surface-page-main</code></td><td>Full page background</td></tr>
                <tr><td><code>--uds-color-surface-main</code></td><td>Card / content area backgrounds</td></tr>
                <tr><td><code>--uds-color-surface-subtle</code></td><td>Headers, table headers, secondary areas</td></tr>
                <tr><td><code>--uds-color-surface-alt</code></td><td>Zebra stripes, alternate rows, code blocks</td></tr>
                <tr><td><code>--uds-color-surface-interactive-default</code></td><td>Primary button fill, active accent</td></tr>
                <tr><td><code>--uds-color-text-primary</code></td><td>Main body text, headings</td></tr>
                <tr><td><code>--uds-color-text-secondary</code></td><td>Helper text, labels, captions, timestamps</td></tr>
                <tr><td><code>--uds-color-text-inverse</code></td><td>Text on dark/filled backgrounds</td></tr>
                <tr><td><code>--uds-color-text-interactive</code></td><td>Links, active tab labels, selected items</td></tr>
                <tr><td><code>--uds-color-border-primary</code></td><td>Default borders (input fields, cards)</td></tr>
                <tr><td><code>--uds-color-border-secondary</code></td><td>Subtle dividers, table cell borders</td></tr>
                <tr><td><code>--uds-color-border-outline-focus-visible</code></td><td>Focus rings (keyboard navigation)</td></tr>
              </tbody>
            </table>
          </DocsSection>

          <div id="sg-ai-tokens"></div>
        </DocsTabPanel>

        {/* COMPONENTS TAB */}
        <DocsTabPanel value="components">
          <div id="sg-ai-components"></div>
        </DocsTabPanel>

        {/* THEMING TAB */}
        <DocsTabPanel value="theming">
          <DocsSection>
            <h3 className="ds-section__title">How Theming Works</h3>
            <p className="ds-section__description">Theming works by setting data attributes on <code >{'<html>'}</code>. When these change, semantic token VALUES change automatically — your component code stays the same.</p>
            <DocsCodeBlock code={`/* Same token, different values per theme */
--uds-color-surface-main:    #fafafa   /* light mode (default) */
--uds-color-surface-main:    #1a1a1a   /* data-color-scheme="dark" */

--uds-color-text-interactive: #005ff0  /* base brand (default) */
--uds-color-text-interactive: #0066cc  /* data-theme="resman" */

/* Your code: always use the semantic token */
background: var(--uds-color-surface-main);  /* works in ALL themes */`} language="css" />
          </DocsSection>

          <div className="sg-subsection" style={{ padding: 'var(--uds-space-200)', background: 'var(--uds-color-surface-error-subtle)', borderRadius: 'var(--uds-border-radius-input)', borderLeft: '4px solid var(--uds-color-text-error)', marginBottom: 'var(--uds-space-300)' }}>
            <p style={{ fontSize: 'var(--uds-font-size-base)', fontWeight: 'var(--uds-font-weight-bold)', color: 'var(--uds-color-text-error)', marginBottom: 'var(--uds-space-050)' }}>Why Primitives Break Theming</p>
            <p style={{ fontSize: 'var(--uds-font-size-base)', lineHeight: 1.7 }}><code >--uds-primitive-color-blue-60-M</code> is ALWAYS <code >#005ff0</code> regardless of theme.<br /><code >--uds-color-text-interactive</code> changes per brand/mode.<br />If you use the primitive, your UI breaks when themes switch.</p>
          </div>

          <DocsSection>
            <h3 className="ds-section__title">Available Modes</h3>
            <table className="ds-table">
              <thead><tr><th>Attribute</th><th>Values</th><th>Default</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><code>data-color-scheme</code></td><td><code>dark</code></td><td>light</td><td>Dark mode — all surfaces, text, borders invert</td></tr>
                <tr><td><code>data-theme</code></td><td><code>resman</code>, <code>anyonehome</code>, <code>inhabit</code></td><td>base</td><td>Brand — accent colors (interactive, info, links) change</td></tr>
                <tr><td><code>data-font</code></td><td><code>poppins</code>, <code>roboto</code>, <code>lexend</code></td><td>Inter</td><td>Font family — all text changes typeface</td></tr>
                <tr><td><code>data-font-scale</code></td><td><code>smaller</code>, <code>larger</code></td><td>default</td><td>All font sizes scale proportionally</td></tr>
                <tr><td><code>data-density</code></td><td><code>comfortable</code></td><td>compact</td><td>All spacing tokens increase</td></tr>
              </tbody>
            </table>
          </DocsSection>

          <DocsSection>
            <h3 className="ds-section__title">Implementation</h3>
            <DocsCodeBlock code={`/* Dark mode — just set the attribute, everything adapts */
<html data-color-scheme="dark">

/* Brand switching — accent colors change automatically */
<html data-theme="resman">

/* Combine modes freely */
<html data-color-scheme="dark" data-theme="resman" data-font="poppins">`} language="html" />
          </DocsSection>
        </DocsTabPanel>

        {/* RULES TAB */}
        <DocsTabPanel value="rules">
          <DocsSection>
            <h3 className="sg-subsection-title" style={{ color: 'var(--uds-color-text-success)' }}>DO</h3>
            <DocsCodeBlock code={`color: var(--uds-color-text-primary);
padding: var(--uds-space-200);
font-family: var(--uds-font-family);
border-radius: var(--uds-border-radius-input);
box-shadow: var(--uds-shadow-depth-300);`} language="css" />
          </DocsSection>

          <DocsSection>
            <h3 className="sg-subsection-title" style={{ color: 'var(--uds-color-text-error)' }}>DON&apos;T</h3>
            <DocsCodeBlock code={`color: #171717;
padding: 16px;
font-family: 'Inter', sans-serif;
border-radius: 8px;
box-shadow: 0 4px 12px rgba(0,0,0,0.08);`} language="css" />
          </DocsSection>

          <DocsSection>
            <h3 className="ds-section__title">For Production Code</h3>
            <ul style={{ fontSize: 'var(--uds-font-size-base)', lineHeight: 1.8, paddingLeft: 'var(--uds-space-250)' }}>
              <li>Use the framework-agnostic <strong>Web Component tags</strong> as the component API once each component has landed.</li>
              <li>Use the <strong>React wrappers</strong> for React apps; they render the same Web Components.</li>
              <li>Per-component spec is in <code >{'uds/components/<component>/spec.json'}</code> on this site — fetch it for acceptance criteria, props, events, slots, accessibility.</li>
              <li>The current class-based docs examples stay in place only until the Web Component cutover is complete.</li>
            </ul>
          </DocsSection>

          <DocsSection>
            <h3 className="sg-subsection-title" style={{ color: 'var(--uds-color-text-error)' }}>Primitives Ban</h3>
            <DocsCodeBlock code={`/* NEVER use primitive tokens in components */
DON'T: color: var(--uds-primitive-color-blue-60-M);
DO:    color: var(--uds-color-text-interactive);

/* Primitives don't change with themes. Semantics do. */`} language="css" />
          </DocsSection>

          <DocsSection>
            <h3 className="ds-section__title">Keyboard Patterns</h3>
            <p className="ds-section__description">Every interactive UDS Web Component must own its keyboard behavior instead of relying on consumers to wire it manually.</p>
            <table className="ds-table">
              <thead><tr><th>Component</th><th>Keyboard Behavior</th></tr></thead>
              <tbody>
                <tr><td>Dropdown</td><td>ArrowUp/Down navigate items, Enter/Space select, Escape close</td></tr>
                <tr><td>Dialog</td><td>Escape close, Tab cycles within (focus trap), auto-focus first element on open</td></tr>
                <tr><td>Tabs</td><td>ArrowLeft/Right between tabs, Home/End for first/last</td></tr>
                <tr><td>List</td><td>ArrowUp/Down navigate, Enter/Space select</td></tr>
                <tr><td>Tile</td><td>Enter/Space toggle selection</td></tr>
                <tr><td>Data Table sort</td><td>Enter/Space on header to cycle sort direction</td></tr>
              </tbody>
            </table>
          </DocsSection>

          <DocsSection>
            <h3 className="ds-section__title">Error & Validation Patterns</h3>
            <ul style={{ fontSize: 'var(--uds-font-size-base)', lineHeight: 1.8, paddingLeft: 'var(--uds-space-250)' }}>
              <li>Validate on <strong>blur</strong> (not every keystroke)</li>
              <li>Set <code >data-state=&quot;error&quot;</code> on the <code >udc-text-input</code> or <code >udc-dropdown</code> wrapper</li>
              <li>Replace helper text with the error message</li>
              <li>Clear error on next input event</li>
              <li>For form-level errors, show <code >udc-notification</code> with <code >data-variant=&quot;error&quot;</code></li>
            </ul>
          </DocsSection>

          <DocsSection>
            <h3 className="ds-section__title">Common Icons</h3>
            <p className="ds-section__description">Material Symbols Outlined — browse at <a href="https://fonts.google.com/icons" target="_blank" style={{ color: 'var(--uds-color-text-interactive)' }}>fonts.google.com/icons</a></p>
            <table className="ds-table">
              <thead><tr><th>Category</th><th>Icons</th></tr></thead>
              <tbody>
                <tr><td>Navigation</td><td><code>space_dashboard</code>, <code>book</code>, <code>contact_phone</code>, <code>home_work</code>, <code>monetization_on</code>, <code>settings</code>, <code>account_circle</code>, <code>notifications</code></td></tr>
                <tr><td>Actions</td><td><code>add</code>, <code>edit</code>, <code>delete</code>, <code>close</code>, <code>search</code>, <code>clear</code>, <code>download</code>, <code>more_vert</code>, <code>chevron_right</code></td></tr>
                <tr><td>Status</td><td><code>info</code>, <code>check_circle</code>, <code>error_outline</code>, <code>warning_amber</code></td></tr>
                <tr><td>Content</td><td><code>apartment</code>, <code>home</code>, <code>mail</code>, <code>phone</code>, <code>calendar_today</code></td></tr>
              </tbody>
            </table>
          </DocsSection>
        </DocsTabPanel>
      </DocsTabs>
    </div>
  );
}
