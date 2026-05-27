'use client';

import { useState } from 'react';
import { DocsCodeBlock, DocsPageHeader, DocsSection, DocsTab, DocsTabPanel, DocsTabs } from '@/components/site/ui';

export default function AiAssistClient() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="sg-page-content">
      <div className="ai-context-summary" style={{ display: 'none' }} aria-hidden="true">
        {`UDS (Urban Design System) — CSS-first design system.
ARCHITECTURE: Tokens published as 'uds-core' on npm. Components published as framework-agnostic web components in the UDS Storybook. The doc site is the design specification — all HTML/CSS/JS shown here is example only.
CRITICAL RULES:
1. NEVER use --uds-primitive-* tokens. Only semantic tokens (--uds-color-*, --uds-space-*, --uds-font-*).
2. NEVER hardcode colors (#xxx), spacing (16px), or fonts ('Inter'). Always use var(--uds-*).
3. For production component code in any framework, use the Storybook web components (e.g. <udc-button>, <udc-dialog>). Do not copy doc-site example HTML into framework projects as production code.
Tokens install: npm install uds-core, then import 'uds-core/uds.css'.
Icons: Material Symbols Outlined from Google Fonts CDN.
Component prefix: udc- (e.g. udc-button-primary, udc-dropdown, udc-data-table).
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
            <p className="ds-section__description">UDS (Urban Design System) is a CSS-first design system with semantic tokens and BEM-style components. It works with any stack — HTML, React, Vue, Angular, Svelte — no framework dependency.</p>
          </DocsSection>

          <DocsSection>
            <h3 className="ds-section__title">For AI Agents</h3>
            <p className="ds-section__description">If you&apos;re an AI coding assistant, here&apos;s what you need:</p>
            <ul style={{ fontSize: 'var(--uds-font-size-base)', lineHeight: 1.8, color: 'var(--uds-color-text-primary)', paddingLeft: 'var(--uds-space-250)' }}>
              <li><strong>Machine-readable context:</strong> Fetch <a href="ai-context.json" style={{ color: 'var(--uds-color-text-interactive)' }}>ai-context.json</a> for the complete token list, component catalog, and framework rules in structured JSON.</li>
              <li><strong>Cursor rule:</strong> Download <code >uds-design-system.mdc</code> and place it in <code >.cursor/rules/</code> — it contains everything inline.</li>
              <li><strong>Install UDS:</strong> <code >npm install uds-core</code> then <code >{"import 'uds-core/uds.css'"}</code></li>
              <li><strong>Icons:</strong> Material Symbols Outlined from Google Fonts CDN.</li>
            </ul>
          </DocsSection>

          <div className="sg-subsection" style={{ display: 'flex', gap: 'var(--uds-space-200)', flexWrap: 'wrap' }}>
            <button className="udc-button-primary" id="sg-download-mdc-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--uds-space-100)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 'var(--uds-font-size-xl)' }}>download</span>Download Cursor Rule (.mdc)
            </button>
            <a href="ai-context.json" target="_blank" className="udc-button-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--uds-space-100)', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 'var(--uds-font-size-xl)' }}>data_object</span>View ai-context.json
            </a>
          </div>

          <DocsSection>
            <h3 className="ds-section__title">Full Example — Tenant Dashboard</h3>
            <p className="ds-section__description">Here&apos;s how UDS components compose together in a real page:</p>
            <DocsCodeBlock code={`<!-- Nav Header -->
<div class="udc-nav-header">
  <div class="udc-nav-header__left">
    <div class="udc-nav-logo">...</div>
  </div>
  <div class="udc-nav-header__right">
    <button class="udc-button-ghost" data-icon-only>
      <span class="material-symbols-outlined">notifications</span>
    </button>
  </div>
</div>

<!-- App Shell -->
<div style="display:flex;">
  <!-- Sidebar -->
  <nav class="udc-nav-vertical">
    <button class="udc-nav-button" aria-selected="true">
      <span class="material-symbols-outlined">space_dashboard</span>
      <span class="udc-nav-button__label">Dashboard</span>
    </button>
  </nav>

  <!-- Main Content -->
  <main style="flex:1;padding:var(--uds-space-300);">
    <!-- Breadcrumb -->
    <nav class="udc-breadcrumb" aria-label="Breadcrumb">
      <ol><li><a href="#">Home</a></li><li aria-current="page">Dashboard</li></ol>
    </nav>

    <!-- Notification -->
    <div class="udc-notification" data-variant="info">
      <span class="udc-notification__icon"><span class="material-symbols-outlined">info</span></span>
      <span class="udc-notification__text">3 invoices pending review.</span>
    </div>

    <!-- Search + Filter Chips -->
    <div class="udc-search">...</div>
    <button class="udc-chip" data-variant="filter" aria-selected="true">
      <span class="udc-chip__label">All</span>
    </button>

    <!-- Data Table -->
    <div class="udc-data-table">
      <table>
        <thead><tr><th>Tenant</th><th>Status</th><th>Balance</th></tr></thead>
        <tbody><tr>
          <td>Brian Smith</td>
          <td><span class="udc-badge" data-variant="success">Active</span></td>
          <td>$0.00</td>
        </tr></tbody>
      </table>
    </div>
  </main>
</div>`} language="html" />
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
              <li>The HTML examples on this site are <strong>example only</strong> — they show the design intent (markup shape, classes, ARIA, keyboard behavior).</li>
              <li>Use the framework-agnostic <strong>web components from the UDS Storybook</strong> in production projects (any framework).</li>
              <li>Per-component spec is in <code >{'uds/components/<component>/spec.json'}</code> on this site — fetch it for acceptance criteria, props, events, slots, accessibility.</li>
              <li>Vanilla HTML projects can use <code >uds/uds.css</code> + <code >uds/uds.js</code> directly with the example markup as a fallback.</li>
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
            <p className="ds-section__description">Every interactive UDS component must support these keyboard interactions. The Storybook web components implement them; vanilla-HTML pages get them from <code >uds.js</code>.</p>
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
