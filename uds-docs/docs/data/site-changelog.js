// docs/data/site-changelog.js
// Extracted from app.js during Phase 3c of the UDS repo restructure.
// Exports: SITE_CHANGELOG

export const SITE_CHANGELOG = [
    {
      version: 'SITE 2026.04.01.1',
      date: '2026-04-01',
      changes: [
        { type: 'added', text: 'Initial documentation site with SPA routing, hash-based navigation, and tabbed component pages' },
        { type: 'added', text: 'Getting Started page with download, file structure, and framework setup guides' },
        { type: 'added', text: 'Primitive Colors and Semantic Colors pages with Preview and Code tabs' },
        { type: 'added', text: 'Interactive Playgrounds for all components with live preview and code generation' },
        { type: 'added', text: 'Framework selector (HTML/CSS, React, Vue) across Code tabs and Playgrounds' },
        { type: 'added', text: 'Searchable Material Icons picker in playgrounds' },
        { type: 'added', text: 'Copy-to-clipboard buttons on all code blocks' },
        { type: 'added', text: 'Appearance bar with color mode, brand, font, and scale switching' },
        { type: 'added', text: 'UDS package ZIP download with JSZip' },
        { type: 'added', text: 'Version dropdown in header bar (UDS 0.1)' }
      ]
    },
    {
      version: 'SITE 2026.04.02.1',
      date: '2026-04-02',
      changes: [
        { type: 'added', text: 'Component status badges (stoplight system from Figma)' },
        { type: 'added', text: 'Figma and GitHub link buttons on every component page' },
        { type: 'added', text: 'Global Changelog page with categorized Tokens/Components sections' },
        { type: 'added', text: 'Per-component Changelog tabs' },
        { type: 'added', text: 'Changelog prefixes (ADDED, CHANGED, DEPRECATED, etc.) with colored labels' },
        { type: 'added', text: 'Version snapshots — older versions served from /versions/0.1/' },
        { type: 'added', text: 'Version dropdown always shows all versions (even in snapshots)' },
        { type: 'changed', text: 'Changelogs now sorted newest-first' },
        { type: 'added', text: 'Implementation Reference expandable section below playground code (CSS, JS, tokens)' },
        { type: 'added', text: 'Side-by-side playground layout at wider viewports' }
      ]
    },
    {
      version: 'SITE 2026.04.06.1',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Notification component page (Examples, Code, Usage, Playground)' },
        { type: 'added', text: 'Dialog component page with interactive demo' },
        { type: 'added', text: 'Tile component page' },
        { type: 'added', text: 'List component page' },
        { type: 'added', text: 'Data Table component page with full-featured playground (11 controls)' }
      ]
    },
    {
      version: 'SITE 2026.04.06.2',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Split monolithic uds.js into per-component JS files mirroring CSS architecture' },
        { type: 'changed', text: 'uds.js rewritten as lightweight orchestrator that auto-loads component scripts' },
        { type: 'changed', text: 'Updated Getting Started file tree to show new JS structure' },
        { type: 'changed', text: 'Updated download ZIP to include all component JS files' }
      ]
    },
    {
      version: 'SITE 2026.04.06.3',
      date: '2026-04-06',
      changes: [
        { type: 'fixed', text: 'Replaced ~25+ hardcoded hex colors in doc shell CSS with semantic tokens' },
        { type: 'fixed', text: 'Replaced ~15 hardcoded font-family declarations with var(--uds-font-family)' },
        { type: 'fixed', text: 'Replaced ~50+ hardcoded font-size px values with --uds-font-size-* tokens' },
        { type: 'fixed', text: 'Replaced ~100+ hardcoded spacing px values with --uds-space-* tokens' },
        { type: 'fixed', text: 'Replaced hardcoded icon sizes (24px), heights (48px), required dots (4px) across component CSS' },
        { type: 'added', text: 'Elevation/shadow tokens (depth-100, depth-300, depth-500, bento, overlay-backdrop) in semantic.css' },
        { type: 'fixed', text: 'Dialog, dropdown, nav-header CSS now use shadow tokens instead of raw rgba' },
        { type: 'fixed', text: 'Playground icon controls for Notification and List now use searchable icon-search picker' },
        { type: 'added', text: 'Keyboard activation (Space/Enter) for Tile component' },
        { type: 'added', text: 'Keyboard access + focus-visible for Data Table sortable headers' },
        { type: 'added', text: 'Focus trap in Dialog (auto-focus on open, Tab/Shift+Tab cycling, focus restore on close)' },
        { type: 'added', text: ':focus-visible styles for dialog close, notification close, nav bento, breadcrumb links, text-input trailing button, nav-vertical rail buttons' },
        { type: 'added', text: 'React hooks and Vue composables for all 11 interactive components in Behavior tab' },
        { type: 'added', text: 'Proper ARIA on doc site tabs (role=tab, aria-controls, tabpanel, arrow key navigation)' },
        { type: 'added', text: 'Skip to main content link for keyboard accessibility' }
      ]
    },
    {
      version: 'SITE 2026.04.06.5',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Changelog colors updated: blue subtitles, green for Added, orange for Changed, red for Deprecated/Removed' },
        { type: 'changed', text: 'Component names in changelog now use UDS badge component (secondary, prominent, small)' },
        { type: 'added', text: 'Changelog page split into UDS and Site tabs' }
      ]
    },
    {
      version: 'SITE 2026.04.06.6',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Increased main content area max-width from 880px to 1200px' }
      ]
    },
    {
      version: 'SITE 2026.04.06.7',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Master pre-flight checklist rule (uds-master-preflight.mdc) — ensures all rules are run before completing any task' },
        { type: 'added', text: 'Site changelog rule (uds-site-changelog.mdc) — enforces SITE version bump, SITE_CHANGELOG entry, and cache busting on every change' }
      ]
    },
    {
      version: 'SITE 2026.04.06.8',
      date: '2026-04-06',
      changes: [
        { type: 'fixed', text: 'Appearance bar: Color scheme "Base" renamed to "Light" to match Figma mode names' },
        { type: 'fixed', text: 'Appearance bar: Brand "Default" renamed to "Base" to match Figma mode names' }
      ]
    },
    {
      version: 'SITE 2026.04.06.9',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Chip component page — filter, input (removable tags), and dropdown chip variants' },
        { type: 'added', text: 'Search component page — search bar with auto-show clear button and error state' },
        { type: 'added', text: 'Tooltip component page — CSS-only popover with 4 position options' }
      ]
    },
    {
      version: 'SITE 2026.04.06.10',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Pre-flight checklist button (cogwheel) in top-right header bar with tooltip' },
        { type: 'added', text: 'Pre-flight checklist dialog showing all 5 rule categories with descriptions' }
      ]
    },
    {
      version: 'SITE 2026.04.06.11',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Demo Site Builder — build icon in header bar opens component picker dialog' },
        { type: 'added', text: 'Framework selection (HTML/CSS, React, Vue) for demo output' },
        { type: 'added', text: 'Live Preview opens realistic demo page in new tab via Blob URL' },
        { type: 'added', text: 'Download ZIP generates Vite project scaffold for React/Vue, or simple HTML bundle' },
        { type: 'added', text: 'Build history — last 2 builds stored in localStorage with timestamp, size, theme, and re-open button' },
        { type: 'added', text: 'Component checkbox grid with Select All/Deselect All toggle' },
        { type: 'added', text: 'Auto-layout: full app shell when nav components selected, centered page otherwise' },
        { type: 'added', text: 'Spinner + disabled state on buttons during build/package' }
      ]
    },
    {
      version: 'SITE 2026.04.06.12',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Moved checklist and build icons to the left, next to UDS branding' },
        { type: 'changed', text: 'Pre-flight checklist icon changed from cogwheel to checklist icon' },
        { type: 'changed', text: 'Demo builder framework selection changed from toggle buttons to UDS radio buttons' },
        { type: 'changed', text: 'Removed external window icon from Preview button (demo opens in overlay, not new tab)' }
      ]
    },
    {
      version: 'SITE 2026.04.06.13',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Component status dots in demo builder dialog — colored dots after each label matching Figma stoplight status' }
      ]
    },
    {
      version: 'SITE 2026.04.06.14',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Pre-flight checklist and demo builder buttons only visible on latest UDS version (hidden in version snapshots)' }
      ]
    },
    {
      version: 'SITE 2026.04.06.15',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Default landing page is now Changelog' },
        { type: 'changed', text: 'UDS version dropdown navigates to changelog page on version switch' }
      ]
    },
    {
      version: 'SITE 2026.04.06.16',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'Changelog page defaults to UDS tab instead of none' }
      ]
    },
    {
      version: 'SITE 2026.04.06.17',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'React demo rewritten with real JSX components, useState hooks, native event handlers — no dangerouslySetInnerHTML or uds.js' },
        { type: 'changed', text: 'Vue demo rewritten with real SFC template, ref() composables, native event binding — no v-html or uds.js' }
      ]
    },
    {
      version: 'SITE 2026.04.06.18',
      date: '2026-04-06',
      changes: [
        { type: 'changed', text: 'ALL playground React code rewritten as proper function components with hooks — removed all class→className string replacement hacks' },
        { type: 'changed', text: 'ALL playground Vue code rewritten as proper SFCs with <script setup> and ref() — removed vueWrap() HTML wrapper' }
      ]
    },
    {
      version: 'SITE 2026.04.06.19',
      date: '2026-04-06',
      changes: [
        { type: 'added', text: 'Framework Code Quality rule (uds-framework-code-quality.mdc) — bans dangerouslySetInnerHTML, v-html, class→className hacks, uds.js in framework builds' },
        { type: 'fixed', text: 'Fixed all remaining playground React/Vue violations: button, nav-header, nav-vertical rail, chip, tooltip, data-table, dialog, dropdown' },
        { type: 'fixed', text: 'Fixed CODE_TAB_CONFIGS: text-input, dropdown, checkbox, radio, tabs, data-table now have proper state management' },
        { type: 'fixed', text: 'Fixed IMPL_DATA: nav-header React imports, data-table checkbox handlers' },
        { type: 'fixed', text: 'Demo builder ZIP generators rewritten — React uses real JSX, Vue uses real SFC template, no uds.js' }
      ]
    },
    {
      version: 'SITE 2026.04.14.1',
      date: '2026-04-14',
      changes: [
        { type: 'fixed', text: 'Demo preview CSS/JS URLs now use dynamic base path — fixes broken styling on GitHub Pages subdirectory hosting' },
        { type: 'fixed', text: 'Site version date corrected to 2026-04-07' }
      ]
    },
    {
      version: 'SITE 2026.04.14.2',
      date: '2026-04-14',
      changes: [
        { type: 'added', text: 'Cache-busting: no-cache meta tags on index.html to prevent browser caching of the HTML page' },
        { type: 'added', text: 'Auto-reload: inline version check script fetches version.txt on every page load and reloads if a newer version is deployed' }
      ]
    },
    {
      version: 'SITE 2026.04.14.3',
      date: '2026-04-14',
      changes: [
        { type: 'added', text: 'AI Assist page — token reference, component catalog, framework patterns, do/donts, theming, full example, and download Cursor rule button' },
        { type: 'added', text: 'ai-context.json — machine-readable endpoint with complete UDS context for AI tools' },
        { type: 'added', text: 'Downloadable uds-design-system.mdc — self-contained Cursor rule with framework detection, token ref, component catalog' },
        { type: 'added', text: 'npm package.json for uds-core — ready for npm publish' },
        { type: 'added', text: 'CDN section on Getting Started with GitHub Pages URLs and version pinning' },
        { type: 'added', text: 'npm install section on Getting Started with import examples' },
        { type: 'added', text: 'AI Assist link in sidebar with smart_toy icon' }
      ]
    },
    {
      version: 'SITE 2026.04.14.4',
      date: '2026-04-14',
      changes: [
        { type: 'fixed', text: 'Cursor rule (.mdc): added Google Fonts link tags, project boilerplate for React/Vue/HTML, app shell composition pattern' },
        { type: 'fixed', text: 'Cursor rule (.mdc): expanded data-table, dropdown, search with full BEM element markup' },
        { type: 'fixed', text: 'Cursor rule (.mdc): added custom CSS guidance — use UDS tokens even for non-component layouts' },
        { type: 'fixed', text: 'ai-context.json: added React/Vue patterns for ALL 21 components, required_fonts, app_shell, custom_css_rule' },
        { type: 'fixed', text: 'Fixed search component emoji in .mdc — now uses Material Symbols Outlined icons' }
      ]
    },
    {
      version: 'SITE 2026.04.15.1',
      date: '2026-04-15',
      changes: [
        { type: 'fixed', text: 'Site versioning permanently fixed — bump-site.sh script uses system date command, updates all 3 locations automatically' },
        { type: 'fixed', text: 'Corrected all wrongly-dated changelog entries from 2026.04.07 to 2026.04.14' },
        { type: 'added', text: 'bump-site.sh — automated version bumping script, eliminates manual date/version errors' },
        { type: 'changed', text: 'Master workflow and site-changelog rules now mandate using bump-site.sh instead of manual edits' }
      ]
    },
    {
      version: 'SITE 2026.04.15.2',
      date: '2026-04-15',
      changes: [
        { type: 'added', text: 'Token Architecture section — explains primitive vs semantic token cascade, bans --uds-primitive-* in components' },
        { type: 'added', text: 'Theming Mechanism section — explains HOW data attributes change token values, with before/after examples' },
        { type: 'added', text: 'Token Usage Guide — when to use surface-main vs surface-subtle vs surface-alt, text-primary vs text-secondary etc.' },
        { type: 'added', text: 'Text style utility classes reference (.uds-text-heading-xl, .uds-text-paragraph-base etc.)' },
        { type: 'added', text: 'Component decision guide — Tile vs List, Chip vs Badge, Dropdown vs Radio etc.' },
        { type: 'added', text: 'Keyboard interaction patterns for React/Vue (dropdown, dialog, tabs, list, tile, data-table)' },
        { type: 'added', text: 'Error/validation patterns — validate on blur, data-state error, helper text replacement' },
        { type: 'added', text: 'Common icon reference with Material Symbols names by category' },
        { type: 'fixed', text: 'All token references now use full variable names (no ambiguous shorthand)' }
      ]
    },
    {
      version: 'SITE 2026.04.15.3',
      date: '2026-04-15',
      changes: [
        { type: 'added', text: 'Critical rules repeated at top AND bottom of .mdc for maximum AI compliance' },
        { type: 'added', text: 'udc- naming convention section explaining BEM prefix pattern' },
        { type: 'added', text: 'Common UI Pattern → UDS Component mapping table (13 patterns)' },
        { type: 'added', text: 'Icon wrapper vs bare icon guidance' },
        { type: 'added', text: 'All 21 components expanded to multi-line code blocks (was compressed single-line)' },
        { type: 'added', text: 'Common Mistakes section with 7 wrong→right code pairs' },
        { type: 'added', text: 'Compliance Checklist at end of .mdc — 9-point pre-output verification' },
        { type: 'added', text: 'Machine-readable summary block at top of AI Assist page for URL-based AI consumption' },
        { type: 'added', text: 'ai-context.json: namingConvention, patternMapping, complianceChecklist, criticalRules, iconGuidance' }
      ]
    },
    {
      version: 'SITE 2026.04.15.4',
      date: '2026-04-15',
      changes: [
        { type: 'fixed', text: 'Typography section in .mdc now uses full variable names (--uds-font-size-sm instead of sm shorthand)' },
        { type: 'fixed', text: 'Status container tokens in .mdc now use full variable names instead of shorthand' },
        { type: 'added', text: 'Icon color tokens section (--uds-color-icon-*) added to .mdc token reference' },
        { type: 'added', text: 'Line-height tokens (--uds-font-line-height-*) added to .mdc typography section' },
        { type: 'added', text: 'Border color tokens section (--uds-color-border-*) added to .mdc with 6 tokens including disabled' },
        { type: 'changed', text: 'Project Boilerplate section moved higher in .mdc — now directly after Framework Detection for faster AI discovery' }
      ]
    },
    {
      version: 'SITE 2026.04.21.1',
      date: '2026-04-21',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 1: pivoting to design-to-engineering handoff spec. Storybook will now handle framework-specific (React/Vue) component implementations.' },
        { type: 'removed', text: 'All React/Vue code generation stripped from Playgrounds, Code tabs, Implementation Reference, and Demo Builder. Doc site now shows vanilla HTML/CSS/JS only.' },
        { type: 'removed', text: 'Framework selector bar removed from component pages (CODE_TAB_CONFIGS, buildFrameworkBar, currentFramework, setFramework, getReactBehavior, getVueBehavior)' },
        { type: 'removed', text: 'Demo Builder simplified to vanilla HTML only. Vite ZIP scaffolds for React/Vue removed.' },
        { type: 'removed', text: 'versions/0.1/ snapshot directory deleted — fresh start for next release' }
      ]
    },
    {
      version: 'SITE 2026.04.21.2',
      date: '2026-04-21',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 2: per-component spec content moved from hand-coded HTML to JSON files (content/*.json) with schema and client-side renderer.' },
        { type: 'added', text: 'content/schema.json — JSON schema for per-component spec data (description, props, events, slots, states, accessibility, owner, etc.)' },
        { type: 'added', text: 'content/<component>.json — 21 initial JSON files populated from existing Usage content and IMPL_DATA' },
        { type: 'added', text: 'Guidelines tab (renamed from Usage) rendered by renderGuidelines() from JSON. Empty sections are hidden automatically.' },
        { type: 'added', text: 'Spec completeness indicator: "Spec X/Y" pill next to each component title + colored dot in sidebar (green ≥80%, yellow 50–80%, red <50%)' }
      ]
    },
    {
      version: 'SITE 2026.04.28.1',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Site reshape Phase 3: component page header enhancements.' },
        { type: 'added', text: '"View in Storybook" button on every component page (placeholder URL until Storybook is live)' },
        { type: 'added', text: '"Report Issue" button — opens a GitHub issue template prefilled with component context' },
        { type: 'added', text: '"Not production-ready" banner appears on any component whose status is not "production"' },
        { type: 'added', text: '"Last updated" collapsible box at the top of every component page showing the last 1-2 changelog entries with type pills (added/changed/fixed/removed)' },
        { type: 'added', text: '"Example only" banner at the top of Examples / Code / Playground tab panels — reinforces that the doc site is reference, Storybook is production' },
        { type: 'changed', text: 'Figma button now reads "Figma (variant)" when a per-variant node ID is present in the JSON content' }
      ]
    },
    {
      version: 'SITE 2026.04.28.2',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Site reshape Phase 4: 8 new pages and reorganized sidebar.' },
        { type: 'added', text: 'Composition Recipes page — curated multi-component patterns (Modal form, Searchable data table, Settings panel, App shell)' },
        { type: 'added', text: 'Layout Templates page — starter page structures (App shell, Settings, Data browsing, Marketing landing)' },
        { type: 'added', text: 'Glossary page — UDS terminology reference (15+ definitions)' },
        { type: 'added', text: 'FAQ page — 10 placeholder Q&A covering theming, tokens, requests, versioning' },
        { type: 'added', text: 'How to Contribute page — 9-step workflow for designers proposing new components, plus draft and editing guidance' },
        { type: 'added', text: 'Roadmap page — Foundation prerequisites, auto-rendered components table from COMPONENT_STATUS, and site-feature roadmap' },
        { type: 'added', text: 'Platform Support page — browser compatibility, performance baseline, web component lifecycle, SSR notes (replaces per-component Browser Compat / Performance sections)' },
        { type: 'added', text: 'Migration Guides page — per-version upgrade notes, starting with 0.1 → 0.2' },
        { type: 'changed', text: 'Sidebar reorganized: existing groups + new Patterns and Reference groups at the bottom' }
      ]
    },
    {
      version: 'SITE 2026.04.28.3',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Site reshape Phase 5: token search, draft mode, and realistic data examples.' },
        { type: 'added', text: 'Token search modal — open with / or Cmd/Ctrl+K. Indexes every --uds-* custom property, fuzzy-matches name+value, click a result to copy var(--name) to the clipboard.' },
        { type: 'added', text: 'Draft mode — set "draft": true in content/<component>.json to hide a component from production. Append ?draft=1 to any URL to view drafts with a DRAFT watermark.' },
        { type: 'added', text: 'Realistic data examples on data-consuming components (Data Table, List, Dropdown, Search, Breadcrumb): tiny / large / long-content / empty / loading-state previews showing how the component handles real-world content.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.4',
      date: '2026-04-28',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 6: AI context, Cursor rules, pre-flight, and Getting Started updated for the doc-site-as-spec model.' },
        { type: 'changed', text: 'ai-context.json: dropped framework_rules.react/vue and per-component react/vue snippets. Added storybookUrl, exampleOnlyNote, specSourceOfTruth (links to per-component JSON), and tokenArchitecture/criticalRules now point at Storybook for production component code.' },
        { type: 'changed', text: 'uds-design-system.mdc: removed Framework Detection, React/Vue boilerplate, and React/Vue compliance items. Added Storybook reference, "for production code use Storybook" guidance, and "When You Need More Detail" section pointing to per-component JSON spec.' },
        { type: 'changed', text: 'AI Assist page: removed Framework Patterns tab. Updated Rules tab to "For Production Code". Updated machine-readable summary block to describe the two-layer architecture (tokens + Storybook components).' },
        { type: 'removed', text: 'Cursor rule uds-framework-code-quality.mdc — banned React/Vue patterns no longer apply.' },
        { type: 'added', text: 'Cursor rule uds-content-schema.mdc — enforces JSON-driven spec editing (never re-introduce component HTML to index.html).' },
        { type: 'changed', text: 'Cursor rules uds-master-preflight, uds-component-checklist, uds-site-changelog, uds-token-first-css, uds-release-workflow: paths updated from uds-prototype/ to uds-docs/. Component checklist rewritten around JSON content, vanilla-only playgrounds, and Guidelines tab being JSON-rendered.' },
        { type: 'changed', text: 'Pre-flight dialog: replaced "Sample Code Standards" section with "Content Schema" section.' },
        { type: 'changed', text: 'Getting Started page: rewrote Setup section as "Two Layers" (tokens + Storybook web components). Removed React/Vue per-framework setup. Updated tab descriptions to mention Guidelines tab and realistic data examples. Added token search shortcut hint.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.5',
      date: '2026-04-28',
      changes: [
        { type: 'changed', text: 'Site reshape Phase 7 (final cleanup): uds/package.json description rewritten to reflect tokens-only scope (with pointer to Storybook for components). Stale "(React/Vue)" labels removed from remaining headings and copy. End of the reshape — site has fully pivoted to the design-to-engineering handoff spec model.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.6',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Cursor Workflows page (#/cursor-workflows) — explains Rules, Skills, and Subagents and lists what is configured for the project.' },
        { type: 'added', text: 'new-component skill (.cursor/skills/new-component/SKILL.md) — scaffolds a new UDS component end to end (content/<id>.json, empty CSS, sidebar entry, page section, COMPONENT_STATUS entry, SITE bump).' },
        { type: 'added', text: 'spec-audit subagent (.cursor/agents/spec-audit.md, read-only) — reports per-component spec completeness against the same 22-field scoring used by the "Spec X/22" pill, recommends top 3 highest-impact fields to fill in next.' },
        { type: 'changed', text: '.gitignore now tracks .cursor/rules/, .cursor/skills/, and .cursor/agents/ while keeping .cursor/settings.json and other ephemeral IDE state local. Side effect: the 6 existing project Cursor rules are now committed to the repo for the first time and ship with every clone.' }
      ]
    },
    {
      version: 'SITE 2026.04.29.1',
      date: '2026-04-29',
      changes: [
        { type: 'added', text: 'Visible token search trigger in the middle of the top header — click to open the search modal. Keyboard shortcuts (/ and Cmd/Ctrl+K) still work; the new trigger discloses them as kbd hints inside the box.' },
        { type: 'changed', text: 'Removed margin-left:auto on .sg-version-select so the new header search trigger can occupy the middle of the brand bar via flex auto-margins.' }
      ]
    },
    {
      version: 'SITE 2026.04.29.2',
      date: '2026-04-29',
      changes: [
        { type: 'fixed', text: 'Token search no longer caps at 50 (empty) / 100 (filtered) results. All ~473 UDS tokens now appear; designers searching broad terms like "color" see every match, not just the first hundred.' },
        { type: 'added', text: 'Token search shows a sticky count line at the top: "473 tokens · semantic first, primitives last · click to copy var(--name)" or "Showing X of Y" when filtered.' },
        { type: 'added', text: 'Token search group headers (color, font, space, border, shadow, primitive) now show a per-group count pill so you can see at a glance how many tokens are in each category.' }
      ]
    },
    {
      version: 'SITE 2026.04.29.3',
      date: '2026-04-29',
      changes: [
        { type: 'added', text: 'About UDS page (#/about) — single landing-page-style entry that explains what UDS is (the design system) versus what this site is (the design specification), the 6-step component lifecycle from Propose to Use with role indicators (designer / developer / both), and absorbs the standalone Glossary page so terminology lives next to its context.' },
        { type: 'added', text: 'Sidebar Reference group now leads with About UDS (replacing standalone Glossary link). Glossary content lives inside the About page.' },
        { type: 'added', text: 'CSS for new About UDS page: .sg-about-section / .sg-about-heading / .sg-about-purpose-grid (2-column grid, collapses to 1 below 880px) / .sg-about-card with eyebrow + title + body + bullet list + bottom-aligned note / .sg-about-aside info banner / .sg-lifecycle vertical numbered list with circular badges, role chips, location indicators, and a connector line between steps.' }
      ]
    },
    {
      version: 'SITE 2026.04.29.4',
      date: '2026-04-29',
      changes: [
        { type: 'fixed', text: 'Audit fix #3: corrected non-existent token reference in uds-design-system.mdc and 6 places in index.html — `--uds-color-border-default` → `--uds-color-border-primary` (the actual token name in semantic.css). Borders that were silently rendering with no `var()` fallback now render correctly.' },
        { type: 'fixed', text: 'Audit fix #4: IMPL_DATA.button HTML used `data-icon-position="leading"` (not a real attribute). Replaced with the actual `data-leading-icon` and added an icon-only variant. Copy-paste from Implementation Reference no longer produces broken icon spacing.' },
        { type: 'fixed', text: 'Audit fix #5: added `?v=1` cache-bust query param to `material-icons.js` script tag, aligning with the SITE cache discipline.' },
        { type: 'fixed', text: 'Audit fix #6: Roadmap site-features list — Token search status changed from In Progress to Shipped (it shipped in SITE 2026.04.28.3).' },
        { type: 'fixed', text: 'Audit fix #7: demo-builder.js header comment rewritten — no longer claims React/Vue live previews.' },
        { type: 'fixed', text: 'Audit fix #8: text-styles demo inline script no longer hardcodes `#6b7280` — now uses `var(--uds-color-text-secondary)` and `var(--uds-font-size-xs)`. Dogfooding fix.' },
        { type: 'changed', text: 'Audit fix #10: Demo Builder header tooltip clarified — "Build a multi-component HTML demo".' },
        { type: 'added', text: 'Audit fix #11: Spec X/22 pill on every component page is now an interactive button. Click it to open a popover that lists exactly which fields are filled vs missing (with friendly labels for all 22 fields), explains what motion/responsive deferral means, and links the user to the matching content/<component>.json.' },
        { type: 'changed', text: 'Audit fix #18: removed static Guidelines HTML from all 21 component pages — every `<div data-tab-panel="guidelines">` is now empty in source. Guidelines tab content is rendered exclusively by `renderGuidelines()` from `content/<component>.json`. Aligns with the uds-content-schema.mdc rule.' },
        { type: 'removed', text: 'Audit fix #19: stripped 21 dead `react: function () {…}` and 21 dead `vue: function () {…}` properties from IMPL_DATA (~114 lines). Nothing read these — `buildImplSection` only ever called `data.html()`.' },
        { type: 'changed', text: 'Audit fix #20 (partial): removed 12 trivial dead `var reactCode = X.join("\\n")` / `var vueCode = …` assignments from PLAYGROUNDS render functions. ~25 more references remain inside inline string-builder declarations with embedded JS function expressions; those need a JS-parser-aware tool to remove safely and are deferred.' },
        { type: 'changed', text: 'Audit fix #21: removed `cssFile` field from all 21 IMPL_DATA entries. The Implementation Reference styles tab now reads the CSS path from `content/<component>.json` `dependencies.css[0]` via `loadContent()`. Single source of truth for CSS dependencies — JSON wins.' }
      ]
    },
    {
      version: 'SITE 2026.04.29.5',
      date: '2026-04-29',
      changes: [
        { type: 'added', text: 'Cloud-readiness: project is now ready to run as a Cursor Cloud Agent. Added `.cursor/environment.json` (auto-starts a `python3 -m http.server` on port 4000 inside `uds-docs/` when a cloud VM spins up — no install step required since the site is pure HTML/CSS/JS).' },
        { type: 'added', text: 'Top-level `AGENTS.md` at the repo root — orientation file that any Cursor Cloud Agent reads on first boot. Documents project layout, the standard preflight + commit flow, where rules / skills / subagents live, and what NOT to do (no framework code, no static guidelines HTML, no skipping bump-site.sh).' },
        { type: 'changed', text: '`.gitignore`: added `!.cursor/environment.json` allow-list so the cloud env config is tracked alongside the existing rules / skills / agents. Local `settings.json` and other `.cursor/*` files remain ignored.' }
      ]
    },
    {
      version: 'SITE 2026.04.29.6',
      date: '2026-04-29',
      changes: [
        { type: 'changed', text: 'Spec audit follow-up — populated 9 component spec JSONs (`content/badge.json`, `divider.json`, `icon-wrapper.json`, `spacer.json`, `button.json`, `text-input.json`, `dropdown.json`, `data-table.json`, `dialog.json`) with `props`, `events`, `slots`, `states`, `acceptanceCriteria`, `accessibility.keyboard`, `accessibility.screenReader`, `accessibility.wcag`, `dosDonts`, `commonlyPairedWith`, `contentGuidelines`, `visualHierarchy`, and `densityBehavior` derived from existing CSS implementations and rendered examples. Average completeness across these 9 went from 22% → 80%+; the four decorative primitives now explicitly document their non-interactive a11y model so screen-reader audits can verify coverage. The Dropdown spec also flags the `add_circle_outline` default leading-icon as a known issue per the visual inspection report.' },
        { type: 'fixed', text: '`renderGuidelines()` HTML-injection bug — `sectionProse()`, the `Acceptance Criteria` checklist, and `<code>` cells for prop/event/slot/state names all used `innerHTML` with unescaped user content. As soon as a spec mentioned literal HTML element names (e.g. `<input>`, `<button>`), the renderer parsed them as real elements (the Text Input acceptance-criteria list was actually rendering an empty input field inline). Now uses `textContent` for prose and the existing `esc()` helper for code-cell names.' },
        { type: 'fixed', text: '`uds-docs/bump-site.sh`: replaced BSD-only `sed -i \'\'` with portable `sed -i.bak` + cleanup so the preflight bump script works the same on macOS and Linux Cloud Agent VMs. Removed the matching warning from `AGENTS.md`.' }
      ]
    },
    {
      version: 'SITE 2026.05.06.1',
      date: '2026-05-06',
      changes: [
        { type: 'added', text: 'Cursor Workflows page now documents the Figma-to-docs workflow: the `UDS updated` orchestration skill, direct Variables-first token auditing, deep component inspection, sync snapshots, deletion guardrails, and the dedicated Figma rules / skills / read-only agents under `.cursor/`.' }
      ]
    },
    {
      version: 'SITE 2026.05.06.2',
      date: '2026-05-06',
      changes: [
        { type: 'changed', text: 'Figma workflows now treat any Figma page whose name contains `{Ignore}` as out of scope. The preflight rule, inventory/spec-gap/component-inspector agents, status-sync and `UDS updated` skills skip those pages for version detection, component inventory, status sync, new/deleted component detection, deep inspection, and snapshot fingerprints; the Cursor Workflows page documents the convention.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.1',
      date: '2026-05-07',
      changes: [
        { type: 'changed', text: 'Figma workflow docs now distinguish read-only behavior from execution-level readonly mode. Figma capability, inventory, token audit, component inspector, and spec-gap agents no longer set `readonly: true` in frontmatter; they remain read-only by instruction but must run with MCP-enabled tool access so Cloud Agents can actually read Figma files.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.2',
      date: '2026-05-07',
      changes: [
        { type: 'added', text: 'UDS 0.3 release sync from Figma — archived UDS 0.2 under `versions/0.2/`, bumped root `UDS_VERSION` to 0.3, added semantic token `--uds-color-icon-destructive`, scaffolded 8 public Figma component pages (`combobox`, `date-picker`, `data-view`, `label`, `link`, `pagination`, `text-area`, `toggle`), linked Spacer to its `_support` Figma component node, and left internal support pages (`checkbox-control`, `input`, `slot`) out of public docs.' },
        { type: 'fixed', text: '`release.sh` and `bump.sh` now use portable `sed -i.bak` on Linux and macOS. `bump.sh` also updates `version.txt` and inline `SITE_VERSION` so release bumps do not leave auto-reload metadata stale.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.4',
      date: '2026-05-07',
      changes: [
        { type: 'changed', text: 'Figma-to-docs workflow tightened after UDS 0.3: `UDS updated` and `figma-inventory` now require a component-set variant coverage pass for every non-ignored status-prefixed Figma component page before a release changelog can be considered complete. The Cursor Workflows page documents that page names alone are not enough.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.5',
      date: '2026-05-07',
      changes: [
        { type: 'added', text: 'Deep component sync follow-up for UDS 0.3 — `link`, `label`, `text-area`, `toggle`, and `pagination` now have token-first CSS, real Examples and Code tabs, richer JSON specs, Playgrounds, Implementation Reference entries, Demo Builder templates, and ZIP download coverage based on Figma component-set inspection.' },
        { type: 'changed', text: '`combobox`, `date-picker`, and `data-view` remain public placeholder pages but now explicitly document that their Figma pages have no inspectable component sets yet; implementation, examples, playgrounds, and Demo Builder entries are intentionally deferred.' },
        { type: 'changed', text: 'Figma workflow docs hardened again: public component pages imported from Figma must be classified as implementation-ready or placeholder-only; implementation-ready pages cannot remain scaffold-only when Figma provides a component set.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.7',
      date: '2026-05-07',
      changes: [
        { type: 'changed', text: 'Component headers now separate Figma lifecycle status and spec completeness into two clean segmented bars instead of competing inline pills. The spec bar remains clickable and opens the existing checklist breakdown.' },
        { type: 'changed', text: 'Sidebar component metadata moved into UDS-styled hover/focus tooltips that open to the right of the sidebar item. Visible colored spec dots and native browser title tooltips were removed to keep the sidebar uncluttered.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.8',
      date: '2026-05-07',
      changes: [
        { type: 'changed', text: 'Reworked the component readiness section: replaced two boxed progress rows with a single clean card that holds a Status segmented bar (5 lifecycle steps) and a Spec segmented bar (22 flat segments mapped 1:1 to schema fields). The Spec bar is the click target for the existing checklist popover.' },
        { type: 'fixed', text: 'Sidebar component tooltip now uses the actual `udc-tooltip` UDS component CSS — `:hover` and `:focus-within` reveal a tooltip rendered to the right of the sidebar link with the surface, border, shadow, and font tokens from `uds/components/tooltip.css`. Removed the previous JS-positioned floating div that bypassed the UDS tooltip pattern.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.9',
      date: '2026-05-07',
      changes: [
        { type: 'added', text: 'Sidebar component tooltip now mirrors the visualization from the component page: a compact 5-segment Status bar and 22-segment Spec bar with the same fill states. Each section is labelled and captioned with the current value (e.g. "In Progress · since 0.1", "18 of 22 fields filled"). The "Next to fill" preview still appears below for components with missing spec fields.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.1',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'UDS 0.3 verification audit (re-read Figma directly): filled in 16 missing `figmaNodeId` values on `content/*.json` for components with canonical component-set nodes in Figma (`badge`, `breadcrumb`, `checkbox`, `chip`, `dialog`, `divider`, `dropdown`, `list`, `nav-header`, `nav-vertical`, `notification`, `radio`, `search`, `tabs`, `tile`, `icon-wrapper`). The "View in Figma" button on these component pages now deep-links to the actual component-set instead of falling back to the page-level node. `button` left null because Figma has 5 sibling component-sets with no single canonical one; `data-table`, `text-input`, and `tooltip` left null because their Figma pages have no top-level component-set. Updated `.cursor/figma/state/last-sync.json` with audit notes and current `siteVersion`.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.2',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'Sidebar component tooltip — initial attempt at fix using `z-index: 9999` (superseded by the proper portal-to-body fix in 2026.05.08.3, since `.sg-sidebar`\'s sticky stacking context bound the tooltip\'s z-index regardless of value).' },
        { type: 'changed', text: 'Status segmented bar now uses stoplight-mapped semantic surface tokens for the current step instead of a single interactive blue: ⚫ Not Started → `surface-bold`, 🔴 Blocked → `surface-error`, 🟠 In Progress → `surface-warning`, 🟡 In Review → `surface-warning-subtle`, 🟢 Production → `surface-success`. Completed steps show a subtle "passed-through" treatment.' },
        { type: 'changed', text: 'Spec segmented bar now uses success/warning semantic colors: filled segments are `surface-success` (the field is done), unfilled segments are `surface-warning-subtle` (still needs work). Same colors apply to the mini bars in the sidebar tooltip.' },
        { type: 'fixed', text: 'Demo Builder: removed orphan `udc-nav-logo__text` class reference left behind from when nav-header was refactored to icon-only logo.' },
        { type: 'added', text: '`uds-docs/scripts/audit-demo-builder.sh` polices Demo Builder drift. It checks (a) every implementable component (one whose `content/<id>.json` `knownIssues` does not contain "no inspectable component set yet") is in both `DEMO_COMPONENTS` and `DEMO_TEMPLATES`, and (b) every `udc-*` class used in `demo-builder.js` is defined in some `uds/components/*.css` file. Wired into the `uds-updated` skill verification step and AGENTS.md.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.3',
      date: '2026-05-08',
      changes: [
        { type: 'added', text: 'New UDS layer tokens (`uds-docs/uds/tokens/layers.css`) define a clean 10-step z-index scale: `--uds-z-index-base` (1), `-sticky` (10), `-decoration` (20), `-dropdown` (30), `-header` (40), `-overlay` (50), `-modal` (60), `-popover` (70), `-tooltip` (80), `-toast` (90), `-skip-link` (100). Tooltips intentionally sit above modals because a tooltip can be triggered from a button inside a modal.' },
        { type: 'changed', text: 'Replaced every hardcoded z-index across the codebase (`9999`, `10000`, `1000`, `200`, `100`, `50`, `2`, `1`) with the new layer tokens. No more ad-hoc values.' },
        { type: 'fixed', text: 'Sidebar component tooltip is now PORTALED to `<body>` instead of being a child of the sidebar link. `.sg-sidebar` has `position: sticky` which creates a stacking context per CSS spec — even with `position: fixed` and high z-index, a child of the sidebar gets stacked relative to the sidebar\'s context and ends up painted under `.sg-main`. Portaling sidesteps both the stacking context and the `overflow:auto` clipping issue. Tooltip also auto-hides on sidebar scroll.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.4',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'Sidebar tooltip was rendering off-screen after the portal-to-body refactor. The portal element had `data-position="right"`, and `.udc-tooltip[data-position="right"]` has CSS specificity (0,2,0) while `.sg-sidebar-portal-tooltip` is only (0,1,0) — so the variant\'s `left: calc(100% + 8px)` won and positioned the tooltip past the viewport edge instead of at `left: 268px`. Removed `data-position` from the portal element.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.5',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'Component-name pills on the changelog page were rendering as empty rectangles. The `udc-badge[data-variant="secondary"]` rule paired `surface-bold` (`#d4d4d4` light gray in light mode) with `text-inverse` (`#f5f5f5` near-white in light mode) — contrast ~1.07:1, basically invisible. Switched the rule to use `text-primary` instead of `text-inverse` (contrast jumps to ~9.7:1 in light mode and ~10:1 in dark mode). The `secondary` variant is a NEUTRAL prominent badge, not a high-saturation one — its surface stays light/medium gray and needs dark text, not white. The colored variants (info/success/error/warning) still use `text-inverse` because their surfaces are saturated dark enough for white text.' },
        { type: 'fixed', text: 'SITE_CHANGELOG entries were appearing in the wrong order on the Changelog page. AGENTS.md incorrectly told agents "newest entries go FIRST in the array (the renderer reverses for display)" — but the renderer does `slice().reverse()` and iterates from index 0, so the LAST entry in the array becomes the TOP of the displayed list. AGENTS.md now correctly says "append new entries to the END (newest go LAST)", and the four 2026.05.08.* entries have been reordered to be strictly chronological.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.6',
      date: '2026-05-08',
      changes: [
        { type: 'changed', text: 'Demo Builder previews are no longer static. Every Build now seeds a small RNG and rolls fresh content from realistic property-management data pools (30+ tenant names, 17 properties, weighted statuses, primary actions, lease/payment/notification messages, etc.) plus per-component state variation (which tab is selected, which radio is checked, sort direction, pagination current page, search query state, dropdown filled vs placeholder, occasional input error, occasional disabled tab, varying tile/list/nav-vertical item counts, randomized notification badge unread count, etc.). Layout structure stays unchanged — header on top, breadcrumb after, filter bar above table, form section after table — only contents and per-component states vary.' },
        { type: 'added', text: 'Preview overlay toolbar now has a "Refresh data" button (next to "Save HTML" and "Close") that re-rolls the iframe contents in place with a new random seed for the same selected components. Doesn\'t pollute build history, doesn\'t reload the overlay, just swaps `iframe.srcdoc` so scroll position resets cleanly.' },
        { type: 'added', text: 'Toolbar buttons now have Material Symbol icons (`refresh`, `download`, `close`) for clearer affordance.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.7',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'Demo Builder `nav-header` template was a stripped-down version of the canonical example shown on the Nav Header component page — just a logo and two icon-only ghost buttons floating in a mostly-empty bar, missing the bento brand dropdown, the center search slot, and the My Work / account cluster, so the header looked unbalanced compared to its own component spec. Rewrote the template to match the canonical pattern: `__left` now has logo + `udc-nav-bento-wrapper` (brand button + bento dropdown list, brand picked from `Boardroom`/`Tenant360`/`PropertyOS`/`LeasePro`/`Holdings`); `__center` has `udc-nav-search` with the AI sparkle icon and rotating placeholder; `__right` has `udc-nav-mywork` with a randomized count badge plus a `udc-nav-account` cluster (notifications, sometimes settings, account_circle).' }
      ]
    },
    {
      version: 'SITE 2026.05.09.1',
      date: '2026-05-09',
      changes: [
        { type: 'changed', text: 'Phase 13 cleanup: the `FIGMA_LINKS` global table is gone from `app.js`. Page-level Figma deep-link IDs now live alongside variant-level IDs in each `uds/components/<id>/spec.json` as the new `figmaPageNodeId` field. The renderer reads variant first, page-level fallback second — same UX, no more drift surface.' },
        { type: 'changed', text: 'Phase 13 cleanup: the `COMPONENT_STATUS` global table is gone from `app.js`. The map is now built at boot from `uds/components.json` (newly added — single source of truth for which components exist) plus each per-component `status.json`. A `componentsReady` promise gates the bootstrap; render functions that walk components now `await` it. New script `scripts/aggregate-components.sh` regenerates `components.json` and runs automatically as part of the migration tooling.' },
        { type: 'added', text: 'New manifest file `uds/components.json` lists every component in the current UDS release in display order (earliest version first, alphabetical tiebreak). Schema at `uds/schemas/components-manifest.schema.json`.' },
        { type: 'changed', text: 'Phase 13 cleanup: the `IMPL_DATA` and `JS_FUNC_TO_FILE` global tables are gone from `app.js`. The Code tab\'s "Implementation Reference" panel now reads from per-component `uds/components/<id>/impl.json` files. Each impl.json carries `jsFunc`, `jsFile`, `tokens` (categorized CSS custom property lists), and `html` (the ZIP-download body as a plain string). New schema at `uds/schemas/impl.schema.json`. As a side benefit, the Behavior tab no longer 404s — `JS_FUNC_TO_FILE` had stale pre-Phase-6 paths.' },
        { type: 'changed', text: 'Phase 13 cleanup: the `PLAYGROUNDS` global table (~98kb of inline literal in `app.js`) is gone. Each component\'s playground config now lives in `uds/components/<id>/playground.js` as an ES module default export. `initPlayground()` is async and dynamically imports the module on first tab click, caches it for re-clicks. Eight playground.js files that reference the `esc()` helper now `import { esc } from \'../../../docs/helpers/esc.js\'` — a new shared helper extracted from app.js. Net effect: app.js shrinks from ~5,200 lines to ~2,980 lines (-43%), and per-component playground configs are co-located with the rest of each component\'s data.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.2',
      date: '2026-05-09',
      changes: [
        { type: 'added', text: 'Phase 14: version-aware UDS data routing. Selecting a historical UDS version from the version dropdown in the header no longer navigates to a frozen full-site snapshot — it now sets `?uds=X.Y` on the URL and the modern docs site renders the archive by reading data through `udsResolve()`. Bug fixes to docs-site UI now flow automatically to historical views; only the UDS data itself is frozen per release.' },
        { type: 'changed', text: 'Phase 14: `versions/0.2/` retroactively converted from the old frozen-full-site shape to UDS-only (`versions/0.2/uds/<components, schemas, tokens, components.json, version.json, CHANGELOG.json>`). Per-component folders generated from the original frozen `content/<id>.json` + parsed `app.js` (COMPONENT_STATUS, FIGMA_LINKS, CHANGELOG). `index.html`, `app.js`, `demo-builder.js`, `bump-site.sh`, `material-icons.js`, `ai-context.json`, `content/`, etc. removed — only UDS data survives. Disk savings: ~2 MB per archived version going forward.' },
        { type: 'added', text: 'New `udsResolve(path)` helper in `docs/helpers/uds-path.js` returns a fetchable URL for any UDS data path (e.g. `components/button/spec.json`) routed through the viewing version. Also: `viewingVersion()`, `isViewingHistorical()`, `currentVersion()` accessors. Every UDS-data fetch in app.js + demo-builder example-fetcher routes through `udsResolve()` and gates on `versionsReady` so the routing is settled before fetching.' },
        { type: 'added', text: 'New script `scripts/convert-archive.sh` (one-time use per legacy archive) reads the frozen full-site files, splits them into per-component folders, and removes the no-longer-needed full-site copy. Idempotent (sentinel: `<archive>/uds/components.json`).' },
        { type: 'added', text: 'Archive-view banner appears at the top of every page when `?uds=X.Y` is present. Tells the user which archive they\'re viewing and offers a one-click return to live. Dimmed Pre-flight + Build Demo buttons in archive view (interactive features only run against live UDS).' },
        { type: 'added', text: 'Playground tab is hidden in archive view (historical snapshots don\'t carry `playground.js` modules — interactive playgrounds only render against live UDS data).' }
      ]
    },
    {
      version: 'SITE 2026.05.09.3',
      date: '2026-05-09',
      changes: [
        { type: 'changed', text: 'Phase 15a: extracted Token Search modal into `docs/modules/token-search/index.js` as a self-contained ES module (~267 lines). Exports `initTokenSearch()`, `openTokenSearch()`, `closeTokenSearch()`. Wired up via a single import in `app.js`. The placeholder folder created back in Phase 4 is now real — finishes Phase 4b.' },
        { type: 'changed', text: 'Phase 15b: extracted Playground engine into `docs/modules/playground/index.js` as a factory module (~181 lines). `createPlaygroundEngine(ctx)` returns `{ initPlayground, refreshPlaygrounds, loadPlaygroundConfig }` and takes its DOM helper deps (`buildCopyButton`, `buildIconPicker`, impl-section helpers, `udsResolve`) via a context object — keeps the engine decoupled without forcing extraction of every transitive helper. Finishes Phase 4c. The placeholder folder created back in Phase 4 is now real.' },
        { type: 'fixed', text: 'Net effect on `app.js`: 3,037 → 2,671 lines (-12% from Phase 14, -49% from the original baseline of 5,228 lines). The router/tab-switcher/theme-bar/render-helpers core is now what dominates `app.js`; everything self-contained has been extracted to its own module.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.4',
      date: '2026-05-09',
      changes: [
        { type: 'fixed', text: 'Phase 16: systemic accessibility remediation. Color-contrast violations dropped from 308 nodes (across 6 sample pages) to 3 — a 99% reduction. The 3 remaining are timing-related edge cases on the archive view fragment loader. The fixes are TOKEN-LEVEL where possible so every consumer benefits, not just the docs site.' },
        { type: 'changed', text: 'Phase 16: bumped six semantic color tokens in `uds/tokens/semantic.css` so text/surface combinations pass WCAG AA 4.5:1 across every surface they\'re likely paired with. Light mode: `text-secondary` neutral-50 → neutral-70 (7.04:1 on neutral-10), `text-info` blue-70 → blue-80 (5.7:1 on surface-info-subtle), `text-warning` orange-70 → orange-90 (5.6:1 on surface-warning-subtle), `text-success` green-70 → green-80 (4.71:1 on surface-success-subtle), `surface-warning` orange-70 → orange-80, `surface-error` red-70 → red-80, `surface-success` green-70 → green-80, `surface-info` blue-70 → blue-80, `surface-interactive-red` red-70 → red-80. Dark mode: `text-secondary` neutral-70 → neutral-50 (9.4:1 on neutral-110, was 3.9:1 / failing). All bumps stay within the same color family so the visual identity is preserved.' },
        { type: 'fixed', text: 'Phase 16: ARIA fixes. Added `role="tab"` to all 33 `.sg-page-tab` buttons in `index.html` + the changelog and ai-assist fragments — fixes `aria-required-children` on every component page\'s tablist (parent already had `role="tablist"`). Converted `aria-selected="true"` → `aria-current="page"` on every `udc-nav-button` and `udc-nav-tile` example/playground/impl entry — `aria-current` is the WCAG-correct attribute for a navigation item; `aria-selected` only validates inside a listbox/tablist. CSS in `nav-vertical.css` now styles both `[aria-current="page"]` and `[aria-selected="true"]` for backwards compat. Converted `aria-selected="true"` → `aria-pressed="true"` on the button "selected" example (`udc-button-primary/secondary/ghost`) — `aria-pressed` is the right ARIA pattern for a toggle button. button.css now styles all three: `[aria-pressed="true"]`, `[aria-selected="true"]`, `[data-selected]`.' },
        { type: 'changed', text: 'Phase 16: header brand bar opacity tuned from 0.5/0.6/0.7 to 0.95 so subtitle/version/build text passes WCAG AA against the blue brand-bar background. Search trigger background switched from `rgba(255,255,255,0.12)` (composited to a light blue, white-on-light-blue at 3.68:1) to `rgba(0,0,0,0.18)` (composites darker, white text reaches ~7.9:1).' },
        { type: 'changed', text: 'Phase 16: button.css `[data-btn-color="success/warning/neutral"]` palette overrides switched from primitive-token references (`green-70`, `orange-70`, `neutral-90`) to semantic tokens (`surface-success`, `surface-warning`, `surface-inverse`). Side benefit: the audit-token-usage rule of "components only reference semantic tokens" is no longer violated by the button overrides.' },
        { type: 'changed', text: 'Phase 16: site-CSS `.sg-theme-bar-label` and `.sg-sidebar-heading` switched from `text-secondary` to `text-primary`. These are 10px bold uppercase section labels — even with the bumped text-secondary they sat at ~4.0:1 on subtle surfaces; switching to text-primary clears 10:1+ comfortably while staying visually distinct from inline body text.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.5',
      date: '2026-05-09',
      changes: [
        { type: 'fixed', text: 'Phase 17: multi-theme accessibility audit. Phase 16 only verified Base Light. Cross-theme axe-core scanning revealed 297 additional contrast failures across the other 5 supported theme combinations (Base Dark: 40, ResMan Dark: 40, AnyoneHome Light: 106, Inhabit Light: 111). Token-level fixes brought all 6 themes × 7 page types (42 combos) to **0 violations**.' },
        { type: 'changed', text: 'Phase 17: dark-mode text tokens bumped from -50 to -40 primitives. text-info, text-warning, text-success, text-error in `[data-color-scheme="dark"]` were giving ~4.1-4.3:1 contrast on -100 subtle surfaces — just below WCAG AA 4.5:1. Bumping to -40 (lighter) raises every combination above 6:1 while staying visually consistent with the dark-mode aesthetic.' },
        { type: 'changed', text: 'Phase 17: AnyoneHome (emerald) and Inhabit (amber) brand accents bumped from -70 to -90 primitives for `surface-interactive-default`. emerald-70 (#059669) gave white text only 3.45:1; amber-70 (#d97706) gave 2.66:1 — both failing WCAG AA. emerald-90 (#065f46) gives 6.97:1, amber-90 (#92400e) gives 6.06:1. Hover/active levels move in lockstep so the visual hierarchy is preserved (just shifted darker). The brand accent is still recognizably emerald/amber.' },
        { type: 'fixed', text: 'Phase 17: kbd text in the header search trigger (`/` and `⌘K` shortcuts) switched from `var(--uds-color-text-inverse)` to a fixed `rgb(245,245,245)`. text-inverse flips with theme (light text in light mode, dark text in dark mode) — but the kbd has its own `rgba(0,0,0,0.32)` overlay background that composites near-black regardless of theme. Dark text on near-black was 2.45:1 in dark mode. The kbd is the one place in the brand bar where the CHILD background overrides the PARENT theme-flipping bg, so theme-invariant text is correct.' },
        { type: 'added', text: 'Phase 17: new `scripts/audit-theme-contrast.sh` + `lib/audit_theme_contrast.js` — multi-theme axe-core scanner that validates contrast/aria across all 6 theme combinations on 7 representative pages. Wired into `.github/workflows/audits.yml` as a separate `theme-contrast` job. Catches future theme-specific regressions that the Phase 16 single-theme scan would have missed.' },
        { type: 'added', text: 'Phase 17: extended `role="tab"` to the 4 token-page fragments (`docs/pages/tokens/*.html`) — Phase 16 only updated index.html and changelog/ai-assist fragments. semantic-colors and primitive-colors fragments needed the role too.' }
      ]
    },
    {
      version: 'SITE 2026.05.10.1',
      date: '2026-05-10',
      changes: [
        { type: 'added', text: 'New sidebar category "UDS Tools" with its first tool: a Contrast Checker page at `#/contrast-checker`. Evaluates every `--uds-color-text-*`, `--uds-color-icon-*`, and `--uds-color-border-*` foreground token against every `--uds-color-surface-*` background, computes the WCAG relative-luminance contrast ratio client-side from the resolved CSS variables, and labels each pair as AAA / AA / AA-large / fail. Reactive: a MutationObserver on `<html>` re-resolves and re-renders the entire page when the theme bar flips color-scheme, brand, font-scale, density, or font, so you can validate every pairing across all 6 supported theme combinations without leaving the page.' },
        { type: 'added', text: 'Contrast Checker layout has three sections. (1) Recommended pairings — ~18 hand-curated semantic combos rendered as readable cards: real "Aa" text + Material Symbol icon + bordered preview pill on the actual surface, with a verdict pill per foreground kind. (2) Pick a surface or foreground — interactive picker with axis toggle ("By surface" / "By foreground"), foreground-kind filter chips (text / icon / border, multi-select), and a UDS dropdown for selecting the token. (3) Full matrix — compact grid of ~16 "main" surface tokens × ~42 text + icon + border tokens, with sticky first column + header row, kind-aware cell rendering (text glyphs, Material Symbols, ringed swatches for borders), and ratio overlays color-tinted by verdict.' },
        { type: 'added', text: 'Contrast Checker uses kind-aware WCAG thresholds. Text foregrounds follow SC 1.4.3 (4.5:1 AA / 7:1 AAA / 3:1 for large text). Icon and border foregrounds follow SC 1.4.11 Non-text Contrast (3:1 AA, no AAA tier). Transparent tokens (`*-none`) are tagged "transparent — N/A". Intentionally low-contrast `*-disabled` tokens still compute a ratio but are tagged "by design" so they aren\'t misread as bugs.' },
        { type: 'changed', text: 'Page fragment loader in `docs/app.js` now also routes the `tools/` subdirectory in addition to the existing `tokens/` subdirectory. New `TOOLS_PAGES_SET` set + `PAGE_LOAD_HOOKS["contrast-checker"]` hook that dynamic-imports `docs/modules/contrast-checker/index.js` on first navigation and calls `initContrastChecker(pageEl)`.' }
      ]
    },
    {
      version: 'SITE 2026.05.10.2',
      date: '2026-05-10',
      changes: [
        { type: 'fixed', text: 'Universal site cache-bypass. The inline auto-reload loader in `index.html` used to call `window.location.reload()` on version mismatch — but modern browsers treat that as a normal reload, which still serves `index.html` from the HTTP cache (GH Pages defaults to ~10-min `Cache-Control: max-age=600` on HTML, and `<meta http-equiv>` tags are widely ignored). Net effect: users could get stuck on a stale SPA shell after a deploy, with no way out short of a manual hard refresh. The loader now navigates to `location.pathname?_uds=<remote-version>` via `location.replace()` — a brand-new URL forces a network revalidate, so every fresh deploy reaches every open tab within ~60s. A sessionStorage cooldown caps auto-bypass at once per minute so a misconfigured deploy can\'t trap a tab in a redirect spiral.' },
        { type: 'fixed', text: 'Runtime fetches now auto-version-stamp. Previously only the static script/link tags in `index.html` carried `?v=N` cache-busters; every runtime `fetch()` (page fragments under `docs/pages/`, per-component `uds/components/<id>/*.json`, examples HTML, `playground.js` modules, `version.json`, `versions.json`, etc.) had no cache-buster at all and could sit in the HTTP cache indefinitely. The inline cache-bypass script now monkey-patches `window.fetch` to auto-append `?v=<SITE_VERSION>` to same-origin relative URLs that don\'t already carry a `_` or `v` query param. Absolute URLs (http://, https://, blob:, data:) and URLs that already carry a cache-buster pass through untouched, so `fetchVersioned()` and Google Fonts requests are unaffected. The patch installs in the inline `<head>` script so it\'s active before any module-init fetches fire from `app.js` imports.' }
      ]
    },
    {
      version: 'SITE 2026.05.11.1',
      date: '2026-05-11',
      changes: [
        { type: 'removed', text: 'Reverted the unauthorized design-system edits an agent applied during the repo restructure (Phase 16 commit `6022fcd` and Phase 17 commit `6564ae8`). Two distinct layers reverted: (1) ~38 semantic-token value bumps in `uds/tokens/semantic.css`, including the AnyoneHome (emerald-70 → emerald-90) and Inhabit (amber-70 → amber-90) brand accents, all light-mode status surface/text bumps to -80/-90, dark-mode status text shifts -50 → -40, and `text-secondary` flips in both modes — all darkening tokens to clear axe-core WCAG AA contrast violations. (2) `uds/components/button/button.css` palette override swap from primitive-token references (`green-70`, `orange-70`, `neutral-90`) to semantic tokens (`surface-success`, `surface-warning`, `surface-inverse`), plus the paired `aria-selected` → `aria-pressed` example markup change in `button/examples/selected.html`. Both layers restored bit-for-bit to the UDS 0.3 release state (commit `16e8e89`) so Figma and code agree again. Knowing trade-off: contrast failures Phase 16/17 was masking are restored as a known issue (white text on `surface-interactive-default` is 3.77:1 in AnyoneHome, 3.19:1 in Inhabit, both below WCAG AA 4.5:1; light-mode `text-secondary` ~3.9:1; several status-on-subtle pairs ~3.3–4.4:1). Four candidate fix paths laid out in PR #7. `scripts/audit-theme-contrast.sh` will fail until that conversation lands; that is intentional.' },
        { type: 'changed', text: 'UDS 0.3 changelog `globalNotes` rewritten. The previous `fixed` entry documented unauthorized Phase 16/17 work that is now reverted; replaced with two entries — a `removed` entry describing both revert layers and a `changed` entry pointing at the new agent rule below. `bash scripts/aggregate-changelog.sh` re-run to refresh `uds/CHANGELOG.json`.' },
        { type: 'added', text: 'New agent rule `.cursor/rules/uds-source-of-truth.mdc` codifies that `uds-docs/uds/` is Figma-as-source-of-truth across every file kind (tokens, component CSS, spec.json, examples, status.json, schemas) and that agents must NOT autonomously modify anything under that path in response to audit findings, contrast issues, or any other code-detected concern. Findings must be surfaced as reports with proposed options, not applied. The only authorized write paths into `uds-docs/uds/` are the named Figma-sync skills (`import-figma-tokens`, `sync-figma-component-spec`, `sync-figma-component-status`, `link-figma-nodes`, `new-component`), each requiring explicit user authorization. Reverts toward verified Figma parity are allowed with explicit user direction. Cross-referenced from `AGENTS.md` "Don\'t do" list and `uds-master-preflight.mdc`. The rule closes the structural gap that allowed the Phase 16/17 overreach.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.1',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Nav Header `figmaNodeId` corrected via `link-figma-nodes`. The spec previously pointed to `5586:8858`, which is the `_udc-nav-header_bentobutton` sub-component, not the canonical header. Repointed to `5684:11340` (`udc-nav-header` component set) after a `figma-component-inspector` pass on page `5373:972`. `figmaPageNodeId` is unchanged. "Open in Figma" deep links from the Nav Header docs page now land on the actual header, not on the bento button.' },
        { type: 'added', text: 'Nav Header spec.json populated via `sync-figma-component-spec` from a deep `figma-component-inspector` read of `udc-nav-header` (5684:11340) and the bento dropdown component (6019:32094). Adds `props` (`showSearch`, `showMyWork` — both BOOLEANs the Figma set exposes), `events` (`bento-toggle`, `bento-dismiss`), `slots` (brand / bento / center / actions / account + bento.tiles / bento.list / bento.footer matching the anatomy), `states` (default + bento-open, plus an explicit `not-applicable` entry for header-level hover/focus/disabled which Figma inherits from nested components), `commonlyPairedWith` (search, button-ghost, badge, divider, list, icon-wrapper, nav-vertical — every UDS component instance the canonical anatomy embeds), and `acceptanceCriteria` (8 derivable from the inspected anatomy + the existing keyboard model). All additions are additive — no existing non-empty field was overwritten.' },
        { type: 'added', text: 'Nav Header `accessibility.screenReader` and `accessibility.wcag` arrays populated. ScreenReader entries cover the banner landmark on page load, the aria-expanded/aria-haspopup contract on the bento trigger, aria-label expectations on icon-only ghost buttons, and the badge-count accessible-name pattern for My Work. WCAG entries enumerate 1.3.1, 1.4.3, 2.1.1, 2.4.7, and 4.1.2 with how-met statements. `accessibility.contrast` left empty — populating it requires a measured per-theme audit and is intentionally deferred.' },
        { type: 'added', text: 'Nav Header `knownIssues` lists 12 Figma↔code divergences the inspector turned up but that are NOT being auto-applied (per `uds-source-of-truth.mdc`). Highlights: chevron color (Figma icon-primary vs CSS icon-secondary), nav-tile font hardcoded 10px (Figma 12px / `font/size/sm`), nav-tile background always-blue (Figma default is transparent), bento footer 14px/text-interactive (Figma 12px/text-primary), bento icon 20px (Figma 24px), logo glyph (`apartment` Material Symbol vs Figma vector in surface/brand-bold), missing dividers in the bento dropdown markup, missing aria-labels on icon-only ghost buttons in default.html, Escape-while-open not dismissing the panel in nav-header.js, max-width 1440 bound in Figma to a non-imported `content-container` collection, and Figma authoring errors on the canonical component set (the underlying cause of the 🔴 blocked status).' }
      ]
    },
    {
      version: 'SITE 2026.05.12.2',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Nav Header `knownIssues[0]` corrected after a re-inspection round-trip. Figma side has been cleaned up: the canonical `udc-nav-header` component set (5684:11340) now reads without errors. The `Component set for node has existing errors` plugin message previously attributed to nav-header actually originates from `udc-badge` (5794:7948) on the badge Figma page; it surfaces during nav-header inspection only because the My Work pill nests a badge instance. The knownIssue text now reflects that attribution. The 🔴 nav-header page status is unchanged and is held in place by the remaining knownIssues entries.' },
        { type: 'added', text: 'Nav Header `knownIssues` now documents the Figma sub-component rename `_udc-nav-header_bentobutton` → `_udc-nav-header_title-area` (id 5586:8858 preserved; every variant / property / binding / layer preserved). The doc-site intentionally retains the `bento-button` / `bento-toggle` / `bento-dismiss` vocabulary because the canonical anatomy still pins `Title Only=False`, which is the same pill anatomy as before. A future contract change could mirror the Figma rename via a `title-area` slot + a `titleOnly` boolean prop on the nav-header public API.' },
        { type: 'added', text: 'Nav Header `knownIssues` now documents the `Title Only=True` variant on `_udc-nav-header_title-area` — 132×48, paragraph/xl-bold, no leading icon, no chevron, transparent pill chrome, radius 8. This is an existing Figma capability the doc-site canonical anatomy does not expose; surfacing it would mean a `titleOnly` boolean on the public nav-header API.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.3',
      date: '2026-05-12',
      changes: [
        { type: 'changed', text: 'Nav Header trigger pill renamed in code to mirror the Figma sub-component rename `_udc-nav-header_bentobutton` → `_udc-nav-header_title-area` (id 5586:8858 preserved on the Figma side). CSS: `.udc-nav-bento-button` → `.udc-nav-title-area`, `.udc-nav-bento-button__chevron` → `.udc-nav-title-area__chevron` (in `uds/components/nav-header/nav-header.css`). JS: `nav-header.js` now queries `.udc-nav-title-area` instead of `.udc-nav-bento-button`; the orchestrator `uds/uds.js` is unchanged because it still keys off `.udc-nav-bento-wrapper` (the relative-position wrapper around trigger + dropdown). Examples (`default.html`, `bento-tiles.html`, `bento-dropdown.html`), `impl.json` reference HTML, and the playground render strings (HTML and React) all updated to emit the new class names. The available-classes reference table in `index.html` updated to surface `.udc-nav-title-area` and `.udc-nav-title-area__chevron` and clarify the role of `.udc-nav-bento-wrapper`. spec.json slot `bento` (the trigger) renamed to `title-area` with a description that pins it to Figma node 5586:8858.' },
        { type: 'changed', text: 'Nav Header spec.json `knownIssues` entry about the rename rewritten to reflect that the rename has now been mirrored in code. The dropdown panel intentionally keeps the `bento` vocabulary in code (`.udc-nav-bento`, `.udc-nav-bento__tiles/__list/__footer`, JS function `initNavBento`, events `bento-toggle` / `bento-dismiss`, slot names `bento.tiles/.list/.footer`) because Figma still names that component `_udc-nav-header_dropdown` and the rename only affected the trigger sub-component, not the dropdown panel itself.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.4',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Nav Header — bento chevron color realigned with Figma. `.udc-nav-title-area__chevron` now binds `--uds-color-icon-primary` (Figma source: icon-primary, #171717) instead of `--uds-color-icon-secondary` (#a3a3a3). Removes the long-running Figma↔code drift on the chevron glyph.' },
        { type: 'fixed', text: 'Nav Header — bento trigger icon size realigned with Figma. `.udc-nav-title-area .material-symbols-outlined` and `.udc-nav-title-area__chevron` now bind `--uds-font-size-2xl` (24px) instead of a hardcoded `20px`. Matches Figma `udc-icon-wrapper Size=24px (Default)` on every leading-icon / chevron position inside the title-area pill.' },
        { type: 'fixed', text: 'Nav Header — bento dropdown shadow realigned with Figma. `.udc-nav-bento` now binds `--uds-shadow-depth-300` (Figma source: `uds/effect/elevation/depth-300`) instead of `--uds-shadow-bento`. The dropdown shadow now matches the rest of the elevation system; the legacy `--uds-shadow-bento` token is left in `uds/tokens/semantic.css` untouched (token removal is a separate Figma-side decision).' },
        { type: 'fixed', text: 'Nav Header — bento dropdown footer realigned with Figma. `.udc-nav-bento__footer` now binds `--uds-font-size-sm` (12px) + `--uds-color-text-primary` instead of `--uds-font-size-base` (14px) + `--uds-color-text-interactive`. Matches Figma `paragraph/label/sm-medium` + `text-primary` on the "Customize menu" footer text.' },
        { type: 'fixed', text: 'Nav Header — nav-tile typography realigned with Figma. `.udc-nav-tile` `font-size` now binds `--uds-font-size-sm` (12px, the value Figma binds via `uds/font/size/sm`) instead of a hardcoded `10px` literal. Removes the token-usage violation in nav-tile sizing and brings the rendered size to Figma\'s `label/sm-medium` text style.' },
        { type: 'fixed', text: 'Nav Header — nav-tile background and foreground realigned with Figma. Default state now binds `--uds-color-surface-interactive-none` (transparent) + `--uds-color-text-interactive` / `--uds-color-icon-interactive` (blue text + blue icon) instead of always rendering as filled blue with white-on-blue. Selected state (driven by `aria-current="page"`) binds `--uds-color-surface-interactive-active` + `--uds-color-text-inverse`. Hover bindings split accordingly — `--uds-color-surface-interactive-subtle-hover` in the default state, `--uds-color-surface-interactive-hover` in the selected state. Matches Figma\'s two-state tile anatomy from the bento dropdown.' },
        { type: 'added', text: 'Nav Header — Title-Only variant exposed in code. New CSS state `.udc-nav-title-area[data-title-only="true"]` matches Figma `_udc-nav-header_title-area Title Only=True` (5586:8859): transparent fill, no border, no shadow, no leading icon, no chevron, radius `--uds-border-radius-input` (8), font-size `--uds-font-size-xl` (20). Spec.json gains a `titleOnly` boolean prop (default false) and a `title-only` entry in `states[]`. Playground gains a `titleOnly` checkbox control. New example file `examples/title-only.html` and a `title-only` entry in the examples manifest.' },
        { type: 'fixed', text: 'Nav Header — Escape-while-open now closes the bento dropdown from anywhere. `nav-header.js` previously bound its Escape handler to the trigger button only; if focus landed inside the open panel (e.g. on a list row), Escape did nothing. The handler is now bound to `document` and gated on `panel[data-open="true"]`; on Escape it calls `toggle(false)` and returns focus to the trigger. Matches the bento-dismiss event contract documented in spec.json events[].' },
        { type: 'fixed', text: 'Nav Header — `examples/default.html` now sets `aria-label` on each of the three icon-only ghost buttons in the account-actions pill (Notifications / Settings / Account). The playground render strings (HTML and Vue templates) also gain the aria-labels to match the example contract. Removes a WCAG 4.1.2 (Name, Role, Value) gap in the most-shown example.' },
        { type: 'fixed', text: 'Nav Header — bento dropdown markup now includes the two `udc-divider-horizontal` rows that Figma renders between sections. `examples/bento-dropdown.html` (tiles → list → footer) inserts a `<hr class="udc-divider-horizontal" data-padding="sm" />` between tiles and list, and between list and footer. `examples/bento-tiles.html` (tiles → footer) inserts the same between tiles and footer. The playground render strings also emit the divider between tiles and list when the bento dropdown is shown with tiles enabled. Matches Figma `_udc-nav-header_dropdown` anatomy.' },
        { type: 'changed', text: 'Nav Header `spec.json` knownIssues reduced from 14 entries to 3. Remaining entries: (1) udc-badge authoring errors on the badge Figma page (Figma-side cleanup required; out of nav-header scope), (2) logo glyph — blocked on an SVG export for the brand-mark vector + a token-architecture decision to import the `surface/brand-bold` color collection, (3) Frame 31 max-width 1440 — blocked on importing the Figma `content-container` token collection into the doc-site\'s semantic tokens. The other 11 entries (chevron color, nav-tile font, nav-tile background, bento footer, bento shadow, bento icon size, default.html aria-labels, Escape-while-open, missing dividers, rename mirroring decision, and Title Only=True exposure) are now resolved in code. `acceptanceCriteria` expanded from 8 items to 10 — added the title-only acceptance and the divider-anatomy acceptance.' },
        { type: 'added', text: 'Nav Header `impl.json` token list expanded to reflect the realignment. Icon group gains `--uds-color-icon-primary`. Font group gains `--uds-font-size-sm`, `--uds-font-size-xl`, `--uds-font-size-2xl`. New Shadow group with `--uds-shadow-depth-100` and `--uds-shadow-depth-300`. Implementation Reference HTML in impl.json also gains the icon-only aria-labels in the account-actions pill.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.5',
      date: '2026-05-12',
      changes: [
        { type: 'added', text: 'Nav Header `uds/components/nav-header/changelog.json` populated with 13 new 0.3 entries covering the recent sync round (figmaNodeId correction, spec sync, `bentobutton → title-area` rename, 10 Figma-aligned drift fixes, Title-Only variant exposure). Closes the long-running gap where major nav-header behavior changes had landed without per-component changelog history. `bash scripts/aggregate-changelog.sh` was re-run; Nav Header now appears in `uds/CHANGELOG.json` 0.3 `byComponent` alongside every other touched component.' },
        { type: 'fixed', text: 'Page-chrome drift class eliminated. Previously, every `<div data-page="<id>">` block in [index.html](uds-docs/index.html) hardcoded an `<h1 class="sg-page-title">` and a `<p class="sg-page-desc">`, while the same component\'s `spec.json` also held a `title` and `description`. These two sources drifted (nav-header still said "bento dropdown for app switching" in the chrome after the rename). Refactor: stripped the hardcoded text from all 29 component-page blocks; replaced with `data-bind="title"` and `data-bind="description"` placeholders; added `bindSpecToPageChrome(id, data)` to `docs/app.js` invoked from `loadContent()` so the chrome populates from `spec.json` on first fetch. `spec.json` is now the sole source of truth for component title + description.' },
        { type: 'changed', text: '`.cursor/figma/state/components.snapshot.json` updated for nav-header: variantProperties now reflects the Figma component-set definition (Show Search Box BOOLEAN, Show My Work BOOLEAN, Variant=Default); nestedInstances now lists the canonical anatomy (logo, title-area, search, mywork-button, account-actions) with mainComponentNodeIds; fingerprint moved from `seed:` placeholder to `captured:2026-05-12:`. `.cursor/figma/state/last-sync.json` `lastSuccessfulSync` bumped to 2026-05-12T15:12Z, new entry in `notes` documents the rename detection and the corrected authoring-error attribution (errors originate from udc-badge, not udc-nav-header).' }
      ]
    },
    {
      version: 'SITE 2026.05.12.6',
      date: '2026-05-12',
      changes: [
        { type: 'changed', text: 'Agent toolchain refresh (PR2). 4 stale skill files (`sync-figma-component-status`, `sync-figma-release-notes`, `link-figma-nodes`, `sync-figma-component-spec`) rewritten to target the per-component file layout that has been canonical since Phase 13 of the repo restructure — `uds/components/<id>/{spec.json,status.json,changelog.json,impl.json,playground.js,examples/**}` instead of the long-deleted `app.js` `COMPONENT_STATUS` / `CHANGELOG` / `FIGMA_LINKS` / `PLAYGROUNDS` / `IMPL_DATA` tables and the non-existent `uds-docs/content/<id>.json` directory. Each skill now ends with a one-line pointer to the canonical round-trip checklist (see below) so the "done = changelog + aggregate + snapshot + Figma RN + SITE bump" definition lives in exactly one place.' },
        { type: 'fixed', text: 'Agent toolchain refresh (PR2). 2 stale rule files corrected and 1 rule given proper YAML frontmatter. `uds-master-preflight.mdc` Phase 1 SITE_CHANGELOG stub path was `app.js`; corrected to `docs/data/site-changelog.js` (where the SITE_CHANGELOG array has lived since Phase 3c). Phase 3 "spec content" path was `content/<id>.json`; corrected to `uds/components/<id>/spec.json` and expanded into a full canonical "component update round-trip" checklist (per-component changelog \u2192 aggregate \u2192 Figma sync-state snapshot \u2192 Figma Release Notes sync \u2192 SITE bump \u2192 cache-bust \u2192 component-checklist \u2192 page-chrome data-bind). `uds-release-workflow.mdc` cross-references for stoplight mapping, Figma file keys, "direct variables first" text, and "release changelog variant coverage" now point at their canonical homes (uds-figma-preflight.mdc, uds-token-architecture.mdc, uds-figma-component-inspection.mdc) instead of duplicating prose. `uds-figma-component-card.mdc` gained YAML frontmatter (description, alwaysApply, globs) so Cursor rule routing for the card layout works and its stale `app.js#COMPONENT_STATUS` reference is now `status.json` `current` field.' },
        { type: 'fixed', text: 'Agent toolchain refresh (PR2). 3 broken-as-written subagent definitions corrected and 1 partially-stale one updated. `spec-audit.md` — every `uds-docs/content/<id>.json` reference replaced with `uds-docs/uds/components/<id>/spec.json`; schema path corrected to `uds-docs/uds/schemas/spec.schema.json`; `COMPLETENESS_FIELDS` source corrected from `app.js` to `docs/data/completeness-fields.js`. `figma-spec-gap.md` — same content-path correction; `FIGMA_LINKS` references replaced with `spec.json.figmaNodeId` / `figmaPageNodeId`; corrected `COMPONENT_STATUS` mental model (built at runtime from per-component `status.json` files). `figma-component-inspector.md` — wrong spec/CSS/examples paths fixed; deleted the corrupt `*** End Patch` artifact at the file tail. `figma-inventory.md` — clarified that site version comes from `uds/version.json` and component status comes from per-component `status.json`, not from `app.js` tables.' },
        { type: 'added', text: 'Agent toolchain refresh (PR2). Four new CI audits wired into `.github/workflows/audits.yml` `audits` job. (1) `scripts/audit-changelog-currency.sh` — for each component, fails if commits after the baseline SHA (`scripts/audit-baseline.json`) touched source files (CSS/JS/spec/examples/impl/playground/status) without a matching `changelog.json` entry; exempts commits whose message contains `[no-changelog: <reason>]`. Existing pre-baseline state is grandfathered. (2) `scripts/audit-aggregate-currency.sh` — re-runs `aggregate-changelog.sh` and `aggregate-components.sh` into temp files, diffs against the committed `uds/CHANGELOG.json` and `uds/components.json`, fails on drift. (3) `scripts/audit-figma-sync-state-currency.sh` — state-based check that each component\'s `spec.json` `figmaNodeId` / `figmaPageNodeId` matches `.cursor/figma/state/components.snapshot.json` `componentSetNodeId` / `pageNodeId`. Initial run caught 4 real pre-existing mismatches (button, data-table, text-input snapshots had stale componentSetNodeId values that should have been null per the 2026-05-08 verification note; radio had a stale value); snapshot updated to match spec.json for all four and the audit now passes. (4) `scripts/audit-css-api-table.sh` — for each component, regex-extracts `udc-*` selectors from `<id>.css` and codes from the hardcoded `<table class="sg-api-table">` in `index.html`, fails on either-direction drift; 10 components with pre-existing drift grandfathered via `scripts/audit-baseline.json` `toleratedComponents` list. Together these four audits hard-block in CI all the failure modes that produced the nav-header changelog / page-chrome / sync-state issues reported in PR1.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.7',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'PR2 hotfix: `audit-baseline.json` moved from `.cursor/` to `scripts/`. The `.cursor/*` rule in `.gitignore` only allowlists specific subdirectories (rules/, skills/, agents/, figma/, environment.json, desktop-preview.sh) — a top-level `.cursor/audit-baseline.json` was silently ignored and never committed. CI consequently failed `audit-changelog-currency.sh` with "missing .cursor/audit-baseline.json" on the post-PR2-merge run. The baseline file lives at `scripts/audit-baseline.json` now (next to the audit scripts that consume it); the two audits that read it (`audit-changelog-currency.sh`, `audit-css-api-table.sh`) updated to the new path; the workflow comment in `.github/workflows/audits.yml` updated. Local audit run passes against the new path.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.8',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Cursor Workflows page (`docs/pages/cursor-workflows.html`) refreshed end-to-end to match the post-PR2 agent toolchain. Before this commit, the page was stale on multiple fronts: it claimed "Twelve active rules" (actual: 14, missing the `uds-figma-component-card` rule from the table); the `new-component` skill description said "Creates `content/<id>.json`" (the directory does not exist; correct path is `uds/components/<id>/spec.json`); the `sync-figma-component-status` description referenced the deleted `COMPONENT_STATUS` table in `app.js`; the `spec-audit` and `figma-spec-gap` subagent rows referenced the same non-existent `content/*.json` tree; the page was missing the `figma-component-card` skill, the `figma-component-card-audit` subagent, and the 5 new PR2/PR3 CI audits.' },
        { type: 'added', text: 'Cursor Workflows page reorganized into logical visual groupings. Top-level overview now lists 4 kinds of guidance (Rules / Skills / Subagents / Audits) — previously 3. Rules split into Always-on (7) vs Glob-scoped (7). Skills split into Orchestrators (`uds-updated`, `figma-component-card`) vs Specialist sync skills (6, in a single table). Subagents (7) in one table with "typically called by" column. Audits split into Pre-existing (4) + PR2/PR3 (5) + Theme-contrast (separate CI job). New "Baselines and exemptions" subsection documents `scripts/audit-baseline.json`. Total documented: 14 rules + 8 skills + 7 subagents + 9 audits = 38 artifacts mapped.' },
        { type: 'added', text: '4 inline HTML/CSS workflow diagrams on the Cursor Workflows page covering the major end-to-end flows: (1) UDS version release — 8 numbered steps from Figma preflight through Figma Release Notes sync and SITE bump, listing what each step reads and writes; (2) Mid-release component sync — the 6-step loop that the nav-header sync exemplifies; (3) Adding a new component — the `new-component` scaffold flow; (4) Single component edit — the minimum round-trip for a one-line fix. Each diagram is a vertical step chain (numbered card + action + "Touches: …" footnote) with a summary panel at the bottom listing every file that changes end-to-end. Styled entirely with `--uds-*` tokens (`.sg-wf-*` class set inline in the page; no site.css changes).' },
        { type: 'added', text: 'New audit `scripts/audit-agent-docs-currency.sh` wired into `.github/workflows/audits.yml`. Cross-checks every `.cursor/rules/*.mdc`, `.cursor/skills/*/SKILL.md`, `.cursor/agents/*.md` against references on `docs/pages/cursor-workflows.html`; fails when a file exists but isn\'t documented (or the page references a deleted file). Baseline-grandfathered via `scripts/audit-baseline.json` `audit-agent-docs-currency`; pre-baseline drift logged as warnings rather than failures. The `toleratedFiles` array carves out internal-only artifacts that intentionally don\'t appear on the page. Initial run reports `29/29 agent toolchain artifacts documented` against the post-PR1 baseline. Brings the total CI audit count to 9 (4 pre-existing + 5 new).' },
        { type: 'changed', text: '`uds-master-preflight.mdc` Phase 3 finalize checklist expanded with an 11th step: any edit under `.cursor/rules/`, `.cursor/skills/`, or `.cursor/agents/` must be mirrored on `docs/pages/cursor-workflows.html` in the same commit. The audit-script summary at the bottom of the rule lists the new `audit-agent-docs-currency.sh`. The round-trip checklist now covers all four directions of drift (per-component changelog, aggregate, Figma sync-state, agent-toolchain docs) — every failure mode the conversation surfaced has both a documented step AND a CI audit.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.9',
      date: '2026-05-12',
      changes: [
        { type: 'added', text: 'Cloud/local sync drift surfaced in conversation: a local agent read the broken pre-`a654126` version of `figma-component-inspector.md` (corrupt `*** End Patch` artifact at file tail, wrong content paths) for ~10 minutes before noticing the workspace was 8 commits behind `origin/main`. Two new always-on safety nets address it. (1) New `sessionStart` Cursor hook at `.cursor/hooks/sync-check.sh` (wired in `.cursor/hooks.json`, 8s timeout, fail-open) runs `git fetch origin main` at every session start and injects `additional_context` into the agent\'s initial system context if the local branch is behind, listing the missing commit subjects, the count of touched `.cursor/rules|skills|agents` files, and the recommended pull command (`--ff-only` if no local commits, `--rebase` otherwise). (2) New "Phase -1: Verify sync state with origin" prepended to `uds-master-preflight.mdc` — manual fallback for sessions where the hook didn\'t run; instructs the agent to re-read any rule/skill/subagent file already loaded in the session if a pull is required.' },
        { type: 'added', text: 'Agent-toolchain timestamping introduced. Every `.cursor/rules/*.mdc`, `.cursor/skills/*/SKILL.md`, and `.cursor/agents/*.md` (30 files total) gained a `lastUpdated: YYYY-MM-DD` field in YAML frontmatter, initially seeded from each file\'s `git log -1 --format=%ad` mtime. The new `uds-figma-component-card-update.mdc` (which had no frontmatter at all) gained a complete frontmatter block (description, alwaysApply, globs, lastUpdated). The agent now has an in-context way to tell whether the rule it just read is fresh or weeks old; previously git history was the only signal and required an explicit `git log` per file.' },
        { type: 'added', text: 'New top-level inventory at `.cursor/TOOLCHAIN.md` lists every rule (16), skill (8), and subagent (7) with the file\'s `lastUpdated` date and a short description, in three tables. The page header documents the bookkeeping discipline (bump `lastUpdated:` AND the matching row when editing) and points at `Phase -1` for the sync-check rationale. Treat as the SITE_CHANGELOG equivalent for the agent toolchain.' },
        { type: 'added', text: 'New `uds-rule-discipline.mdc` rule, glob-scoped to `.cursor/rules|skills|agents/**`. Auto-attaches whenever an agent edits any of those files and reminds it to (a) bump that file\'s `lastUpdated:` to today\'s date via `date +%Y-%m-%d`, (b) update the matching row in `TOOLCHAIN.md`. Companion to `uds-master-preflight.mdc` Phase 3 step 11, which now folds the lastUpdated bump and TOOLCHAIN row update into the existing "Agent-toolchain bookkeeping" finalize step.' },
        { type: 'added', text: 'Cursor Workflows page (`docs/pages/cursor-workflows.html`) gains rows for both glob-scoped rules added in this session — `uds-figma-component-card-update` (the update-mode rule that landed earlier) and `uds-rule-discipline` — bringing the glob-scoped section to 9 rules. `audit-agent-docs-currency.sh` re-run reports `31/31 agent toolchain artifacts documented` (16 rules + 8 skills + 7 subagents).' }
      ]
    },
    {
      version: 'SITE 2026.05.12.11',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Token T-1 — `--uds-color-text-secondary` dark-mode binding aligned to Figma. Was `--uds-primitive-color-neutral-70` (#525252); Figma now aliases `--uds-primitive-color-neutral-60-M` (#737373) in every dark mode. Improves dark-mode `text-secondary` on `surface-main` (`#0a0a0a`) contrast from ~2.6:1 to ~4.3:1 (still below WCAG AA 4.5:1, but a meaningful move). Sourced from a 2026-05-12 figma-token-audit dry-run that confirmed direct Figma Variables read; this is the only token-value drift across 249 primitives + 94 semantic colors × 6 modes.' },
        { type: 'fixed', text: 'Nav Header — three Figma-aligned CSS micro-fixes from the same 2026-05-12 deep figma-component-inspector dry-run on page 5373:972: (1) `.udc-nav-title-area[data-title-only="true"]` gains `line-height: var(--uds-font-line-height-xl)` so the existing `font-size: var(--uds-font-size-xl)` (20px) pairs with the matching 28px line-height (Figma text style `uds/text/paragraph/xl-bold`) instead of inheriting `--uds-font-line-height-base` (20px). (2) `.udc-nav-bento` padding split from symmetric `var(--uds-space-150)` shorthand to `var(--uds-space-150) var(--uds-space-150) var(--uds-space-200)` so the bottom edge gets 16px (Figma `_udc-nav-header_dropdown` padding-bottom). (3) `.udc-nav-bento__footer` gains `line-height: var(--uds-font-line-height-sm)` (16px) so the existing `font-size: var(--uds-font-size-sm)` (12px) pairs with the matching line-height instead of inheriting base (Figma text style `uds/text/label/sm-medium`).' },
        { type: 'changed', text: 'Nav Vertical — `spec.json` `props[]` and `states[]` populated from a 2026-05-12 deep figma-component-inspector dry-run that the previous quick-look pass had left blank. props[] gains a `leadingIcons` boolean (default true) mapped to the Figma component-set `udc-nav-vertical` (6598:8555) variant property `Leading Icons: True | False`. states[] populated with the 5 states the underlying `_udc-list_item` exposes in Figma: default, hover, active, selected, focused. The Disabled state that exists in code (`.udc-nav-button:disabled`, `[aria-disabled="true"]`) is intentionally NOT added to states[] because it has no Figma source — see open-questions summary.' },
        { type: 'changed', text: '`.cursor/figma/state/components.snapshot.json` precision update for nav-header (entries 0 + 1 of `nestedInstances` extended with new optional fields `mainComponentSetNodeId` + `mainComponentVariantProperties` so the parent set node + variant-property matrix are tracked, not just the rendered variant) and full refresh for nav-vertical (`variantProperties: { "Leading Icons": ["true","false"] }` was `{}`; `nestedInstances` now records the `udc-list` instance 6598:8558 → main 5195:894 that the previous snapshot missed entirely; fingerprint hashes upgraded from `seed:*` placeholders to `captured:2026-05-12:*`). `.cursor/figma/state/last-sync.json` `lastSuccessfulSync` bumped, snapshot checksum recomputed, new `notes` entry documents the round.' },
        { type: 'fixed', text: '`scripts/lib/restructure_lib.py` Python 3.10+ union syntax (`str | None` on lines 202, 229) replaced with the equivalent `Optional[str]` (Python 3.5+ compatible). Functionally identical. Lets the audit scripts that import `restructure_lib` (`audit-component-completeness.sh`, `audit-aggregate-currency.sh`, `aggregate-changelog.sh`, `aggregate-components.sh`, etc.) run on local macOS systems with the stock Python 3.9 in `/usr/bin/python3` instead of crashing with `TypeError: unsupported operand type(s) for |: \'type\' and \'NoneType\'`. CI (Python 3.x = latest) was unaffected; this restores local-runnability so authors can verify aggregate before pushing.' },
        { type: 'changed', text: 'Open design questions surfaced by the deep dry-run inspections of nav-header + nav-vertical that need designer input before any further apply: (a) **nav-header bento footer color** — Figma is `text-interactive` (#005ff0); code is `text-primary`. The 0.3 changelog claims this was already realigned to Figma in a prior sync — either Figma changed back or the prior sync misread Figma. (b) **nav-header nav-tile structural mismatch** — Figma is two-layer (outer wrapper card + inner `_udc-nav_button-vertical`); code flattens both into a single `.udc-nav-tile`. Fixing this is a significant CSS/examples/playground/impl rewrite. (c) **nav-header nav-tile font-size** — Figma is hardcoded 8px (below WCAG legibility floor); code is `--uds-font-size-sm` (12px). Code is correct; Figma is the regression. (d) **nav-header bento panel section gap** — Figma uses `space-150` flex gap with dividers; code uses `gap: 0` with internal margins. (e) **nav-header bento list items** — Figma uses `udc-list-item` instances; doc-site renders `.udc-nav-button` (which actually comes from nav-vertical.css). (f) **nav-vertical container chrome** — Figma `.udc-nav-vertical` is a styled card (bg surface-main, border-secondary 1px, container-lg radius, depth-300 shadow, space-150 padding/gap); code is unstyled flat. (g) **nav-vertical nested `udc-list` wrapper** — Figma wraps rows in a `udc-list` instance; code is flat. (h) **nav-vertical item height** — Figma 44px, code 48px. (i) **nav-vertical focused state** — Figma uses subtle bg + `radius/input-selected` (12); code uses outline-only with the existing 8px radius. (j) **nav-vertical Disabled state** — code has it, Figma `_udc-list_item.State` enum has Default/Hover/Active/Selected/Focused but no Disabled. (k) **nav-vertical `.udc-nav-button-vertical` (rail style)** has NO Figma source anywhere; yet code defines it, ships an example, has a playground mode, and advertises the class in the Code-tab API table. Either Figma needs a rail variant or the rail surface is deprecated in code. (l) **Figma authoring bug** — `nav-vertical Leading Icons=False` Figma variant currently renders all 7 list-items as `State=Selected` (everything blue); designer-side fix.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.10',
      date: '2026-05-12',
      changes: [
        { type: 'changed', text: 'Toolchain timestamps upgraded from date-only (`YYYY-MM-DD`) to full ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`) across all 31 rule/skill/subagent files. Date-only stamps lost meaningful information when files were edited multiple times in one day (very common in refactor sessions) and sorted ambiguously between cloud (UTC) and local (timezone) edits. The new format matches the precedent already set by `.cursor/figma/state/last-sync.json` `lastSuccessfulSync` and is the canonical "when did this happen" timestamp shape across the repo. Note: `audit-toolchain-currency.sh` compares dates only (not full timestamps) so sub-day skew between a `lastUpdated:` bump and the resulting commit doesn\'t fire false positives.' },
        { type: 'added', text: 'New tracked script `scripts/regenerate-toolchain.sh` deterministically rebuilds `.cursor/TOOLCHAIN.md` from the YAML frontmatter of every rule/skill/subagent file. Replaces the unreproducible Python heredoc inline-script that originally generated TOOLCHAIN.md in SITE 2026.05.12.9. The intro and discipline sections are templated inside the script; the three tables (Rules, Skills, Subagents) are generated from frontmatter on every run. Hand-editing the tables is now explicitly discouraged — the generator overwrites.' },
        { type: 'added', text: 'New tracked script `scripts/seed-toolchain-timestamps.sh` for the one-shot "re-seed every lastUpdated to a single ISO 8601 UTC timestamp" operation. Idempotent (re-runs produce a different timestamp; only run when you actually want to re-seed). Used to upgrade all 31 files\' timestamps from date-only to full ISO 8601 in this commit; future use-case is the deliberate "we just audited everything, mark them all current as of this moment" reset.' },
        { type: 'added', text: 'New CI audit `scripts/audit-toolchain-currency.sh`. Three checks bundled: (1) every rule/skill/subagent file\'s frontmatter `lastUpdated:` is at least as recent (date-only) as the file\'s git mtime — catches "edited a file but forgot to bump the date stamp"; (2) every rule/skill/subagent file has a row in `.cursor/TOOLCHAIN.md` — catches "added a new file but forgot the index"; (3) every TOOLCHAIN row\'s date matches the source file\'s frontmatter `lastUpdated:` exactly — catches "bumped the file but forgot to regenerate the index". Wired into `.github/workflows/audits.yml` `audits` job. Initial run reports `OK — 31 toolchain artifacts current (check 1: 31 mtime, check 2: 31 indexed, check 3: 31 matched)`. The previous SITE 2026.05.12.9 commit relied on manual discipline alone for this; manual discipline drifts. Negative test confirmed the audit fires per-row with file-specific fix commands when corruption is introduced.' },
        { type: 'changed', text: '`uds-master-preflight.mdc` workflow renumbered from `Phase -1 / 0 / 1 / 2 / 3` to `Phase 1 / 2 / 3 / 4 / 5`. The negative-phase number was a kludge introduced in SITE 2026.05.12.9 to minimize diff churn when prepending the sync-check; renumbering removes the smell and avoids setting a "we keep adding negative phases" precedent. Title updated from "BUMP FIRST — Change Second — Finalize Last" to "SYNC FIRST — Source-of-truth check — BUMP — Change — Finalize" to reflect the new order. All cross-references in 5 sync skills (`sync-figma-component-status`, `sync-figma-component-spec`, `link-figma-nodes`, `import-figma-tokens`, `sync-figma-release-notes`), the `uds-rule-discipline` rule, and `cursor-workflows.html` updated from `Phase 3` to `Phase 5` to point at the renumbered round-trip checklist.' },
        { type: 'changed', text: '`.cursor/hooks/sync-check.sh` redesigned with file-based fallback. Cursor forum threads from earlier in 2026 reported that `sessionStart` hooks\' `additional_context` field is not always injected into the agent\'s initial system context, even when the hook output is parsed correctly. Without a live test we can\'t prove the bug status today, so the hook now writes a canonical state file at `.cursor/state/sync-status.json` (always, even when in sync, schema versioned) AND best-effort emits `additional_context`. The state file is the source of truth and is what the rule mandates reading. New `UDS_HOOK_SKIP_FETCH=1` env var bypasses the network fetch — useful for offline scenarios and for verifying the behind-detection path against a fabricated upstream without the network round-trip undoing the test fixture. The behind path was actually exercised this round (fabricated commits via `git commit-tree`, ran the hook, verified `behind=2` + `missingCommits` populated + `recommendedPull` correct, restored origin/main) — previous version only verified the in-sync path.' },
        { type: 'changed', text: '`.cursor/rules/uds-rule-discipline.mdc` rewritten. The "Update the matching row in TOOLCHAIN.md" section is replaced by "Regenerate `.cursor/TOOLCHAIN.md`" — agents run `bash scripts/regenerate-toolchain.sh` instead of hand-editing the index. The "Not currently CI-enforced" section is replaced by a "CI enforcement" section pointing at the new `audit-toolchain-currency.sh` (with its three checks documented inline) plus the existing `audit-agent-docs-currency.sh`. The `lastUpdated:` example format and `date` command updated from `YYYY-MM-DD` / `date +%Y-%m-%d` to ISO 8601 / `date -u +%Y-%m-%dT%H:%M:%SZ`. Cross-references updated to the renumbered Phase 1 (sync) and Phase 5 (finalize).' },
        { type: 'fixed', text: '`uds-docs/docs/pages/cursor-workflows.html` `uds-master-preflight` row description corrected to reflect the five-phase workflow ("Sync first (Phase 1) → source-of-truth check (Phase 2) → bump (Phase 3) → change (Phase 4) → finalize (Phase 5)") and the canonical round-trip checklist now living in Phase 5. Two other in-page references to "Phase 3" updated to "Phase 5".' }
      ]
    },
    {
      version: 'SITE 2026.05.13.3',
      date: '2026-05-13',
      changes: [
        { type: 'added', text: 'New "Figma Notes" tab on component pages. Surfaces open Figma findings the figma-component-inspector flagged but did NOT auto-apply — design questions, new Figma components that aren\'t wired into the canonical contract yet, orphans left over from previous designs, and Figma↔code drift awaiting designer direction. Tab appears only when a component has a non-empty `figmanotes.json` (no churn for components without notes); shows an open-count badge next to the tab name (e.g. "Figma Notes (7)"). Lives between Guidelines and Changelog in tab order. Each note card has a plain-language title + summary, an optional "Decision needed:" callout, deep links to the referenced Figma nodes, and a footer documenting the auto-resolve condition + raised-by/raised-on metadata. Backed by `uds-docs/uds/components/<id>/figmanotes.json` per-component file with schema `uds-docs/uds/schemas/figmanotes.schema.json`. The tab + panel are injected by `app.js` lazily (no per-component HTML edits in `index.html`).' },
        { type: 'added', text: 'Inspector + sync-skill auto-prune behavior. The `figma-component-inspector` agent now reads the prior `figmanotes.json` at the start of every inspection and evaluates each existing note against current Figma state per its `kind`: `new-in-figma` resolves when the node gets wired into the canonical component (or deleted in Figma); `figma-orphan` resolves when the node gets re-attached (or deleted); `drift` resolves when Figma and code values agree; `question` is manual-only. Resolved notes get removed on the next `sync-figma-component-spec` apply. New notes are proposed for surplus/snapshot-delta findings the inspector marks `needs review` (jargon-free titles + summaries, decisionNeeded question, figmaRefs with node IDs, autoPruneWhen description). Auto-prune + new-add are both `non-breaking` and apply automatically — no user confirmation needed for figmanotes changes (the doc-site surface is unchanged; surfacing a finding is informational).' },
        { type: 'added', text: 'Schema `uds-docs/uds/schemas/figmanotes.schema.json` defines the figmanotes.json contract: required fields `id` (stable kebab-case, matches across inspector runs for dedup), `kind` (enum: `new-in-figma` | `figma-orphan` | `drift` | `question`), `title` (plain-language), `summary` (1-3 sentences), `raisedOn` (ISO date); optional fields `decisionNeeded`, `figmaRefs[]` (name + nodeId), `autoPruneWhen` (plain-language condition), `raisedBy` (defaults to `figma-component-inspector`).' },
        { type: 'changed', text: 'Nav Header `spec.json` `knownIssues` migrated to `uds-docs/uds/components/nav-header/figmanotes.json`. The 7 entries that were Figma-side findings (logo-pill exploration, Outline=True deferred variant, dropdown/nav-tile orphans, decorative title-area chevron, logo SVG export gap, max-width token not imported, badge upstream authoring errors) all become structured notes with clear titles, plain-language summaries, decision questions, Figma deep-links, and auto-prune conditions. `spec.json` `knownIssues` is now `[]` — kept in the schema for legitimate non-Figma implementation notes (browser quirks, screen-reader limitations) but expected to stay empty for nav-header.' },
        { type: 'changed', text: 'Dropped `knownIssues` from `COMPLETENESS_FIELDS` in `docs/data/completeness-fields.js`. The signal was backwards: a component was "more complete" if it had unresolved issues. With Figma findings moving to figmanotes.json (which doesn\'t count toward completeness either), removing it cleans up the metric. Nav Header\'s completeness count drops by 1/22 (now ~20/21 fields filled vs ~20/22 before) but the score interpretation is more honest.' },
        { type: 'changed', text: 'Agent rule + sync skill descriptions on `docs/pages/cursor-workflows.html` updated to mention `figmanotes.json` (the inspector\'s read set, the sync skill\'s write surface, the agent output\'s mandatory new "Figma Notes evaluation" section).' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated. 2 entries updated (`figma-component-inspector.md`, `sync-figma-component-spec/SKILL.md`); both got the new `lastUpdated: 2026-05-13T20:34:33Z` timestamp.' }
      ]
    },
    {
      version: 'SITE 2026.05.13.2',
      date: '2026-05-13',
      changes: [
        { type: 'removed', text: 'Nav Header bento app-switcher removed in full. This is the proof-of-fix for the bidirectional sync workflow that shipped in SITE 2026.05.13.1 (PR #16): the upgraded figma-component-inspector ran against page 5373:972 / component set 5684:11340 with the new mandatory `Doc-site surplus` and `Snapshot delta` sections enabled. The canonical udc-nav-header Variant=Default tree in Figma no longer nests any bento sub-component (the standalone _udc-nav-header_dropdown + _udc-nav-header_nav-tile components still exist on the page as orphans but are no longer part of the canonical contract). Inspector\'s surplus pass surfaced 22 doc-side bento artifacts; sync-figma-component-spec step 5.5 classified them as `unattested-by-figma` (mostly `potentially-breaking`; the two example-file deletions as `destructive`). Cleanup applied: spec.json slots `bento.tiles`/`bento.list`/`bento.footer` removed; events `bento-toggle`/`bento-dismiss` removed (events[] now empty); state `bento-open` removed; 4 bento acceptance-criteria removed; description / whenToUse / whenNotToUse / accessibility entries updated to drop bento references; commonlyPairedWith corrected (text-input added, button-ghost/divider/list/search removed). nav-header.css trimmed by ~100 lines: removed .udc-nav-bento, .udc-nav-bento__tiles/__list/__footer, .udc-nav-tile, .udc-nav-tile[aria-current], .udc-nav-bento-wrapper rules; simplified .udc-nav-title-area to a static pill (chevron is decorative now — no popover wired in the canonical contract); removed cursor:pointer / :hover bg shift / :focus-visible outline / aria-expanded chevron rotate / data-title-only:hover override. nav-header.js deleted entirely (initNavBento was the only function). uds-docs/uds/uds.js orchestrator: removed `\'components/nav-header/nav-header.js\'` from COMPONENT_SCRIPTS and the `if (UDS._initNavBento) ... .udc-nav-bento-wrapper ...` line from UDS.init — nav-header is CSS-only now. examples/bento-dropdown.html + examples/bento-tiles.html deleted; examples/manifest.json trimmed to default + title-only (with demoWeight adjusted on title-only). examples/default.html updated to drop the bento panel markup, the bento-wrapper, aria-haspopup/aria-expanded, and the udc-nav-button list. impl.json: jsFunc + jsFile set to null; html regenerated for the bento-free anatomy; tokens groups trimmed (dropped --uds-color-surface-page, --uds-color-text-inverse, --uds-color-surface-interactive-active/-hover, --uds-color-icon-interactive, --uds-color-text-interactive, --uds-shadow-depth-300 which were only used by the bento panel + tile selected state). playground.js: removed showBento + showTiles controls and their render branches (4 controls left: titleOnly, showSearch, showMyWork, appName). index.html Code-tab API table: removed 6 bento/tile `<tr>` rows + the aria-expanded row; updated title-area description to note the chevron is decorative.' },
        { type: 'changed', text: '`uds-docs/uds/components/nav-header/spec.json` `knownIssues` expanded with three new entries derived from the bidirectional inspection: (a) new `_udc-nav-header_logo-pill` Figma component (id 6399:13744, 98×48 brand vector + "ResMan" text label) exists on the nav-header page but is NOT wired into the canonical udc-nav-header Variant=Default tree (still nests the simple 24×44 `_udc-nav-header_logo`). Treating as design exploration pending designer confirmation; not adding a new logo variant to docs autonomously per `uds-source-of-truth.mdc`. (b) Logo `Outline=True` variant (id 6403:39132, light-fill brand vector) is defined in Figma but not exposed as a doc-side prop — deferred pending designer direction on whether it\'s public contract or internal-only. (c) Standalone `_udc-nav-header_dropdown` (6019:32094) and `_udc-nav-header_nav-tile` (5498:2340) components still exist on the nav-header Figma page as orphans (not nested in any canonical set); no doc-side surface for these orphans.' },
        { type: 'changed', text: '`.cursor/figma/state/components.snapshot.json` nav-header entry refreshed via the 2026-05-13 deep inspection. `nestedInstances` node IDs updated to the actual rendered-variant IDs (6403:39139 for logo instance, 6403:33942 for mywork-button, 6403:34785 for account-actions — the prior snapshot used incorrect placeholder IDs 5684:11344/11348/11349). `Search Box` `mainComponentName` corrected from `udc-search` to `udc-text-input` (the prior snapshot mislabel — node 5053:53 is the State=Default variant inside the `udc-text-input` component set 5594:7264; there is no standalone `udc-search` component). Variant-property enum-value casing aligned to Figma\'s actual casing (`["False", "True"]` not `["false", "true"]`). New optional snapshot field `orphanedPageComponents` records the three nav-header page orphans (former bento dropdown + nav-tile + new logo-pill exploration) so future audits can detect them without rediscovering them in Figma. Fingerprint hashes upgraded from `captured:2026-05-12:*` to `captured:2026-05-13:*`. `.cursor/figma/state/last-sync.json` `lastSuccessfulSync` bumped to 2026-05-13T17:54:48Z; `components.snapshotChecksum` recomputed; `site.siteVersion` bumped to 2026.05.13.2; new `notes` entry documents the round and the new optional `orphanedPageComponents` snapshot field.' },
        { type: 'changed', text: '`scripts/audit-baseline.json` `audit-doc-internal-consistency.toleratedFindings` trimmed: the 4 nav-header entries (`event-undispatched/bento-dismiss`, `event-undispatched/bento-toggle`, `paired-missing/button-ghost`, `token-missing/--uds-color-surface-page`) all resolve cleanly after the bento cleanup, so they\'ve come off the allow-list. Tolerated-list count is now 10 (down from 14). nav-header remains on `audit-css-api-table.toleratedComponents` due to a pre-existing `belongs_to` family-fallback limitation in that audit (it doesn\'t recognize sibling subparts like .udc-nav-account / .udc-nav-logo / .udc-nav-search as belonging to nav-header); the rigorous coherence check for nav-header is audit-doc-internal-consistency.sh, which passes cleanly. A follow-up to fix the belongs_to family-fallback in audit-css-api-table.sh (one-line change) is filed separately.' },
        { type: 'fixed', text: 'nav-header per-component changelog (uds/components/nav-header/changelog.json) gains 4 entries for UDS 0.3: type `removed` for the bento cleanup (single comprehensive entry), type `fixed` for the `commonlyPairedWith` corrections, type `changed` for the three new `knownIssues` entries, and a separate type `changed` for the snapshot precision update. `uds/CHANGELOG.json` re-aggregated (0.3 release: 27 components, 53 entries, up from 49 entries pre-cleanup).' }
      ]
    },
    {
      version: 'SITE 2026.05.13.1',
      date: '2026-05-13',
      changes: [
        { type: 'changed', text: 'Figma → docs sync workflow upgraded to detect deletions and renames. Root cause of the bug class the nav-header bento miss exemplified: the inspector + sync skill only compared Figma → docs (what is in Figma that is missing from docs), never the reverse (what is in docs with no Figma counterpart). Deletions in Figma left orphan spec slots, events, states, CSS rules, examples, JS handlers, orchestrator entries, and Code-tab API rows in the doc site indefinitely because the inspector silently reported "all good." Five concrete defects fixed in this commit.' },
        { type: 'changed', text: '`figma-component-inspector` subagent (`.cursor/agents/figma-component-inspector.md`) + the underlying rule (`.cursor/rules/uds-figma-component-inspection.mdc`) now require two new mandatory report sections on every inspection: (1) **Doc-site surplus** — for every spec slot/event/state/prop, every `.udc-<id>*` CSS selector, every example, every Code-tab API row, every impl token group, every `<id>.js` public function + orchestrator loader entry, every playground control, tag as `attested` / `unattested-by-figma` / `infrastructure`; unattested entries carry the full `Confidence / Risk / Reason / Default action` finding shape per `uds-figma-change-classification.mdc`; (2) **Snapshot delta** — read the prior `.cursor/figma/state/components.snapshot.json` entry BEFORE the Figma traversal, then diff `nestedInstances`, `variantProperties`, variant enum values, `defaultVariantNodeId`, and `componentSetNodeId/pageNodeId`; report removed/renamed/added explicitly. Both sections must appear in every report — silent omission is the bug class this contract exists to prevent.' },
        { type: 'changed', text: '`sync-figma-component-spec` skill (`.cursor/skills/sync-figma-component-spec/SKILL.md`) gains a new mandatory step 5.5 "Build proposed removals" that consumes the inspector\'s surplus + snapshot-delta sections and proposes file deltas: surplus slot → remove from `slots[]` (`potentially-breaking`); surplus event/state → remove from `events[]` / `states[]` (`potentially-breaking`); surplus prop → remove from `props[]` (`potentially-breaking`); surplus example file → delete + remove from manifest (`destructive`); surplus CSS selector → remove rule (`potentially-breaking`); surplus JS function → remove function + matching orchestrator entry in `uds.js` (`potentially-breaking`); surplus impl HTML → regenerate; surplus acceptance criterion → remove (`non-breaking`); surplus Code-tab API row → remove (`non-breaking`). Every row carries `Confidence / Risk / Reason / Default action`. Per the classification rule, no removal auto-applies — `potentially-breaking` requires user confirmation, `destructive` requires it twice. The skill\'s dry-run "Would remove" block is mandatory; apply mode now has a precondition that the inspector report must include the new sections, otherwise stop and re-run.' },
        { type: 'added', text: 'New CI audit `scripts/audit-doc-internal-consistency.sh` (bash shim + `scripts/lib/audit_doc_internal_consistency.py`). Designed as the SAFETY NET for partial cleanups: the figma-component-inspector\'s surplus pass is the primary deletion detector (Figma-aware), this audit catches what partial cleanups leave behind (repo-only). Five enforceable checks against structured data: (1) every `.udc-<id>*` CSS selector in `<id>.css` must appear in at least one of `examples/*.html`, `impl.json` html, `playground.js` render, or the Code-tab API table in `index.html`; (2) every event in spec.json `events[]` must be dispatched somewhere in `<id>.js` OR flagged in `knownIssues` containing `spec-only` (DOM-native events like click/change/blur/focus auto-excused); (3) every `--uds-*` token in `impl.json` `tokens` must be defined in `uds/tokens/*.css`; (4) every component id in `commonlyPairedWith[]` must exist in `components.json`; (5) every entry in `uds/uds.js` `COMPONENT_SCRIPTS` must point at a real per-component JS file. Wired into `.github/workflows/audits.yml` as the `Doc-internal consistency` job. 14 pre-existing findings tolerated via `scripts/audit-baseline.json` `audit-doc-internal-consistency.toleratedFindings` (new drift fails). Total CI audit count: 4 pre-existing + 5 PR2/PR3 + 1 new = 10.' },
        { type: 'changed', text: '`uds-updated` umbrella skill (`.cursor/skills/uds-updated/SKILL.md`) `Output format` gains two mandatory lines — `Surplus removals proposed: ...` and `Snapshot deltas: ...` — so the new signal surfaces end-to-end when triggered via "UDS updated" / "Figma updated" prompts. `Ask before applying` list expanded to include "surplus findings flagged by the inspector" as an explicit stop-and-ask category.' },
        { type: 'changed', text: '`uds-master-preflight.mdc` §"Why this order matters" CI-audits list expanded with the new `audit-doc-internal-consistency.sh` entry (placed between `audit-css-api-table` and `audit-agent-docs-currency`). `lastUpdated` bumped to current timestamp.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` updated: the `uds-figma-component-inspection` rule row now describes the bidirectional inspection (surplus + snapshot-delta sections); the `sync-figma-component-spec` skill row describes the new step 5.5 reverse-mapping; the `uds-updated` orchestrator card mentions the new surplus signal; the `figma-component-inspector` subagent row lists its expanded read set and output sections; the CI-audits table gains a row for `audit-doc-internal-consistency.sh`; "Audits that gate the merge" sentence includes the new audit; the "Baselines and exemptions" subsection documents the `toleratedFindings` array shape.' },
        { type: 'added', text: 'Baseline tolerance entries in `scripts/audit-baseline.json`: new `audit-doc-internal-consistency` block with 14 pre-existing findings tolerated (per-component drift in `uds-docs/uds/` that requires Figma round-trips via `sync-figma-component-spec` to resolve, not autonomous edits — per `uds-source-of-truth.mdc`). The 4 nav-header entries (`event-undispatched/bento-dismiss`, `event-undispatched/bento-toggle`, `paired-missing/button-ghost`, `token-missing/--uds-color-surface-page`) will be resolved when the nav-header bento cleanup lands as the proof-of-fix for this workflow upgrade; at that point they must come off the list.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated. 5 entries updated (`uds-figma-component-inspection.mdc`, `figma-component-inspector.md`, `sync-figma-component-spec/SKILL.md`, `uds-updated/SKILL.md`, `uds-master-preflight.mdc`). Total: 16 rules + 8 skills + 7 agents = 31 entries.' }
      ]
    },
    {
      version: 'SITE 2026.05.14.1',
      date: '2026-05-14',
      changes: [
        { type: 'added', text: 'New always-on workspace rule `.cursor/rules/communication-style.mdc` codifying default chat tone for this repo: agent responses stay concise and in plain language, while artifacts written into files (SITE_CHANGELOG entries, per-component `changelog.json`, commit messages, PR descriptions, Figma findings, audit output, JSON specs, code) keep the technical voice their context requires. Explicitly defers to `uds-site-changelog.mdc`, `uds-release-workflow.mdc`, `uds-figma-change-classification.mdc`, `uds-content-schema.mdc`, and `uds-master-preflight.mdc` so the existing content-shape contracts continue to govern artifact wording. Mirrored on `uds-docs/docs/pages/cursor-workflows.html` to keep `scripts/audit-agent-docs-currency.sh` green.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated to register the new `communication-style.mdc` rule row.' }
      ]
    },
    {
      version: 'SITE 2026.05.18.1',
      date: '2026-05-18',
      changes: [
        { type: 'added', text: 'New skill `.cursor/skills/generate-uds-figma-component/SKILL.md` — the UDS Component Factory. Drafts a token-bound UDS component set directly inside the UDS Components Figma file (file key `1XJoUJgtNpw4R0IIT3VjoK`) on a brand-new `🟠 <Title> {Cursor}{Ignore}` page. The `{Ignore}` marker takes the page out of every UDS automation per `uds-figma-preflight.mdc` (skipped by `figma-inventory`, `sync-figma-component-status`, `uds-updated`, `figma-spec-gap`, `figma-component-inspector`); the `{Cursor}` label tells designers it\'s a factory draft. Three-phase workflow: Phase A reads the brief + 2–3 sibling specs (≤30 KB cap) + `semantic.css` and persists the proposed component model to `.cursor/state/component-factory/<id>.md` (gitignored); requires literal `approved` (or `approved with: …`) before any Figma write. Phase B writes the page + component set with auto-layout, role-to-token bindings, and nested instances using sequential `use_figma` calls; tags every node with `setSharedPluginData(\'dsb\',\'run_id\', RUN_ID)` per the `figma-generate-library` state ledger; mandatory post-build `get_metadata` + `get_screenshot` verification. Phase C emits a quality-gate report (token bindings, variant-matrix match, layer hygiene, auto-layout coverage) plus designer-judged prompts. Factory stops at Figma — never writes to `uds-docs/uds/`, never runs `new-component` / `sync-figma-component-spec` / `link-figma-nodes`. Docs landing is the existing `uds-updated` skill, designer-initiated.' },
        { type: 'changed', text: '`.cursor/rules/uds-figma-write-safety.mdc` adds a fourth allowed write scope: "Component drafts on a `{Cursor}{Ignore}` page in `UDS Components`." Allowed only when the user explicitly invokes `generate-uds-figma-component` and names the target component title. Writes outside that page (other component pages, the cover, the release-notes frame, `_support` / `📗 Cover` / `🎬 Demo` / `🛝 Playground` pages) are NOT covered by this scope. Designer accepts a draft by renaming the page (drop `{Cursor}{Ignore}`, set the stoplight prefix); the factory must not auto-rename. Existing-page collision must inspect-first-then-ask before destroying any nodes. The standard before/after write summary remains required. Related-workflows footer extended with pointers to `sync-figma-release-notes` (scope #1), `sync-figma-component-status` (scope #2), and `generate-uds-figma-component` (scope #4).' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated to register the new `generate-uds-figma-component` skill row (Skills count 8 → 9) and the bumped `uds-figma-write-safety.mdc` `lastUpdated`. Total: 17 rules + 9 skills + 7 agents = 33 entries. `uds-docs/docs/pages/cursor-workflows.html` updated to match: Active Skills heading "8 skills" → "9 skills"; Orchestrators sub-section "(2)" → "(3)" with a new `<div class="sg-wf-card">` for the factory; the `uds-figma-write-safety` rule row description now lists scope #4. No `?v=N` cache-bust needed in `index.html` for this PR — `cursor-workflows.html` is a runtime-fetched page fragment (handled by `docs/helpers/fetch-versioned.js`), and none of `app.js`, `site.css`, or `uds.css` changed in this commit.' },
        { type: 'added', text: 'New plan at `.cursor/plans/uds-component-factory.md` (committed in a prior session) is the canonical scope, locked-decisions, and pilot-defaults reference for the new skill. The skill\'s top-of-file `See also` block points at the plan; the plan itself documents the four locked decisions (marker convention `{Cursor}{Ignore}`, existing-page collision pattern, `🟠` stoplight on birth, write-safety scope #4) and the pilot success/kill criteria. No pilot run is included in this commit — that\'s a separate designer-initiated session per plan §15.' }
      ]
    },
    {
      version: 'SITE 2026.05.19.1',
      date: '2026-05-19',
      changes: [
        { type: 'fixed', text: 'Site main content area broken on SITE 2026.05.18.1 — the `generate-uds-figma-component` SITE_CHANGELOG entry (commit `8a893bd`) used SQL-style apostrophe escaping (`\'\'` doubled) inside JavaScript single-quoted strings instead of the correct backslash escape (`\\\'`). Five occurrences across two strings: `it\'\'s`, `setSharedPluginData(\'\'dsb\'\',\'\'run_id\'\', RUN_ID)`, `skill\'\'s`, and `that\'\'s`. The malformed entries threw `SyntaxError: Unexpected string` when `app.js` imported `docs/data/site-changelog.js` as an ES module, so all `loadContent()` and `route()` work that depends on the import was skipped. Header bar, theme bar, and the static sidebar in `index.html` continued to render (they\'re plain HTML markup); the per-page `data-page` blocks did not, leaving the main column blank. Replaced all `\'\'` with `\\\'`; `node -e "import(...)"` now resolves to 83 entries cleanly. SITE bumped 2026.05.18.1 → 2026.05.19.1 and `index.html` `app.js?v=126` → `?v=127` so deployed clients pick up the fixed import on the next page load. Root cause was the previous entry violating `uds-site-changelog.mdc`: app.js imports `site-changelog.js`, so any change to that file MUST bump `app.js?v=N`; the SITE 2026.05.18.1 commit incorrectly skipped the bump.' }
      ]
    },
    {
      version: 'SITE 2026.05.20.1',
      date: '2026-05-20',
      changes: [
        { type: 'added', text: 'New Reference page `uds-docs/docs/pages/design-process.html` — a DISCUSSION DOCUMENT (not a live process) that captures (1) a proposed 5-stage stoplight design process with two-universe model (Figma owns Red Exploration + Orange In Progress; doc site owns Yellow In Review + Green Production Ready + Black Deprecated; Storybook is a parallel dev workstream gated by Green), per-stage checklists for "while at this stage" and "to advance", and an "Iteration & change" section covering in-stage edits, backward moves, and drift discovered later; (2) a best-practices review against Polaris/Carbon/Lightning/Spectrum/Material with five recommendations (add Beta stage, drop Red, add Storybook checklist to Green, require `reason` field on backward moves, add a "how this differs from typical design systems" note); (3) a "what it would look like if all five were adopted" lifecycle showing a 4-stage Orange → Yellow → Green (with Beta sub-flag) → Black model. The page opens with a prominent info-styled banner stating "This is a discussion document, not a live process. The current process inside the repo has not been changed." Nothing in the repo — status enum, sync skills, banner copy, per-component `status.json` files, Figma-prefix rule — is modified by this commit; the page is documentation-only. Wired into the sidebar under Reference (between "How to Contribute" and "Cursor Workflows") and registered as a `<div data-page="design-process" data-page-fragment></div>` in `index.html`. Page-local styles use a `.sg-dp-*` prefix and are inlined at the top of the fragment per the `cursor-workflows.html` pattern (no `site.css` change required).' },
        { type: 'changed', text: '`index.html` `app.js?v=` bumped 127 → 128 because `docs/data/site-changelog.js` changed (app.js imports the changelog as an ES module — per `uds-site-changelog.mdc` the cache-bust is required). No `uds.css` or `site.css` bump (neither file changed).' }
      ]
    },
    {
      version: 'SITE 2026.05.20.2',
      date: '2026-05-20',
      changes: [
        { type: 'changed', text: 'Rewrote `uds-docs/docs/pages/design-process.html` body copy for a designer audience. The first cut leaned heavily on engineering vocabulary (file paths like `uds-docs/uds/components/<id>/status.json`, schema-speak like `slots[]` / `accessibility.keyboard[]` / `whenNotToUse`, workflow names like `figma-component-inspector` / `sync-figma-component-spec` / `new-component`, terms like "spec contract" / "off-stoplight" / "audit trail" / "back-compat consumers"). All of that has been stripped or restated in plain language. Stage card meta rows now say "Lives in: Figma | Who works on it: Designer" instead of "Universe | Key | Owner." Stage card sub-headings now read "While you\'re here" / "To move to Orange" / "What happens after Green" instead of "While at this stage" / "To advance" / "What happens off-stoplight." Two-homes section was rephrased from "Figma universe (pre-review) / Doc-site universe (shipped contract)" to "Figma — where you\'re designing / Docs site — where the finished design lives." Iteration section renamed to "When things change" with each pattern written in conversational tone. The "Where the status lives" list talks about "the Figma page name" and "the sidebar status badge" instead of `figmaNodeId` and `status.json` `current`. Cross-reference footer dropped the comma-separated list of skill names and now points generically at Cursor Workflows for "under-the-hood mechanics if you\'re curious." Visual structure, CSS, and the 5 stage cards + 5 recommendations are unchanged in scope; only the words changed.' },
        { type: 'changed', text: 'SITE bumped 2026.05.20.1 → 2026.05.20.2. `app.js?v=` bumped 128 → 129 because `docs/data/site-changelog.js` changed (`uds-site-changelog.mdc` cache-bust requirement).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.1',
      date: '2026-05-21',
      changes: [
        { type: 'added', text: 'Two new Cursor rules learned from the first `generate-uds-figma-component` factory run on Text Input. `uds-figma-plugin-api-gotchas.mdc` documents four `use_figma` truths that bit the factory and would bite any other Plugin API script the same way: same-file (local) vs. subscribed-library (remote) components resolve through different APIs (`importComponentByKeyAsync` does NOT work on local components — use `getNodeByIdAsync`), `addComponentProperty(name, "INSTANCE_SWAP", defaultValue)` for local targets takes the node ID with colon (not the published KEY — the misleading "Property value is incompatible" error reads like a type mismatch), `figma.createAutoLayout()` / `figma.createFrame()` ship with a hidden white SOLID fill that silently breaks "no raw colors" audits, and `node.resize(w, h)` forces both axes to FIXED + child size changes do not propagate to ancestors within one `use_figma` call. `uds-figma-factory-quality.mdc` codifies five component-agnostic quality gates for any factory-style Figma build (`generate-uds-figma-component`, `new-component`, `figma-component-card`, or future variants): full state-design contract at Phase A (border + ring layering with explicit gap + ring widths + stroke alignment + visual hierarchy note, not just token-role mapping), machine-verified audit before Phase C report (never claimed from memory — the first factory run reported "0 raw colors" while 56 unbound whites sat on every container slot), per-column packing for SIZE variant axes (max-per-row equalizes columns and hides the size differentiation), visibility BOOLEAN defaults that render the component\'s standard anatomy in the variant grid, and a Phase B.0 dependency manifest (all node IDs + variable KEYs + style KEYs) before any write.' },
        { type: 'added', text: 'Mirrored both new rules into `cursor-workflows.html` Glob-scoped table (count 9 → 11). `uds-figma-plugin-api-gotchas` is `globs: ["**/*"]` so it auto-attaches on every task; `uds-figma-factory-quality` is scoped to `.cursor/skills/generate-uds-figma-component/**`, `.cursor/skills/new-component/**`, and `.cursor/skills/figma-component-card/**` so it loads only when editing a factory-style skill.' },
        { type: 'changed', text: 'SITE bumped 2026.05.20.2 → 2026.05.21.1. `app.js?v=` bumped 129 → 130 because `docs/data/site-changelog.js` changed (`uds-site-changelog.mdc` cache-bust requirement).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.2',
      date: '2026-05-21',
      changes: [
        { type: 'added', text: 'New `Design Language` reference page at `uds-docs/docs/pages/design-language.html` plus matching agent-facing rule at `.cursor/rules/uds-design-language.mdc`. Documents the canonical UDS visual constructions derived from every existing component CSS: interaction states (Default / Hover / Active / Focus), validation states (Error / Success / Warning / Info), availability states (Disabled / Read-only / Loading), selection states (Checked / Selected / Active), the three focus-ring constructions and when to use each (outline+offset, stacked box-shadow, single-ring), the surface treatment scale (page / content / interactive / status), elevation scale (depth-100 / 300 / 500), border-radius scale (input vs. container families), density patterns (sm vs. default), and a naming canon for Checked vs. Selected vs. Active. Per-component disagreements surfaced in a "Known inconsistencies" section for designer ratification — five tracked: focus-ring gap binding (button/text-input/dropdown use `surface-white` instead of theme-safe `surface-main`), four different form-field hover patterns, disabled border treatment splits between transparent and `border-disabled`, toggle\'s `opacity: 0.7` for disabled (outlier), and required-dot color token (text-error vs. icon-error). Cannot autonomously fix any of those per `uds-source-of-truth.mdc` — they\'re surfaced for the next Figma → code round trip.' },
        { type: 'added', text: 'Sidebar link `Design Language` added in Reference group (after Design Process, before Cursor Workflows) and matching `<div data-page="design-language" data-page-fragment></div>` placeholder. The page fragment loader auto-fetches `docs/pages/design-language.html` on first navigation.' },
        { type: 'changed', text: 'Refactored `uds-figma-factory-quality.mdc` to be design-system-agnostic. State-design-contract section now points at `uds-design-language.mdc` for the actual UDS canon rather than embedding UDS-specific examples. The factory-quality rule is now purely about *process* (state contract, machine-verified audit, variant grid layout, anatomy-visible defaults, dependency manifest); the design language rule is the *visual canon*. Together they tell a factory build both what to build (canon) and how to build it (process).' },
        { type: 'added', text: 'Mirrored `uds-design-language.mdc` row in `cursor-workflows.html` Glob-scoped table (count 11 → 12). `globs: ["**/*"]` so it auto-attaches on every task — designers reaching for state constructions and agents building components both pick it up.' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.1 → 2026.05.21.2. `app.js?v=` bumped 130 → 131 because `docs/data/site-changelog.js` changed (`uds-site-changelog.mdc` cache-bust requirement).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.3',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Deleted `uds-docs/docs/pages/platform-support.html` (Platform Support page — browser compatibility, performance baseline, web component lifecycle, SSR notes). Sidebar link `<a href="#/platform-support">` removed from the Reference group in `uds-docs/index.html`, and the matching `<div data-page="platform-support" data-page-fragment></div>` placeholder block removed from `<main>`. The page was originally added in SITE 2026.04.18.1 as a system-wide replacement for per-component Browser Compat / Performance sections; nothing else in the docs site links to it. Historical SITE_CHANGELOG entries that reference it are left intact (we don\'t rewrite history).' },
        { type: 'removed', text: 'Deleted `uds-docs/docs/pages/migration-guides.html` (Migration Guides page — per-version upgrade notes, only ever populated with a 0.1 → 0.2 block). Sidebar link `<a href="#/migration-guides">` removed from the Reference group in `uds-docs/index.html`, and the matching `<div data-page="migration-guides" data-page-fragment></div>` placeholder block removed from `<main>`. Originally added in SITE 2026.04.18.1. Per-version migration notes belong in the existing aggregated Changelog (`uds/CHANGELOG.json`, rendered on the `Changelog` page) and in per-component `changelog.json` files — not in a separate page that has to be hand-maintained alongside them.' },
        { type: 'changed', text: 'Updated `uds-docs/docs/pages/getting-started.html` — dropped the trailing "see the Migration Guides" link sentence at the end of section "2. Components — Storybook web components (recommended)" so the placeholder note no longer references a removed page. Surrounding copy (the Storybook placeholder paragraph) is preserved verbatim.' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.2 → 2026.05.21.3. `app.js?v=` bumped 131 → 132 because `docs/data/site-changelog.js` changed (per `uds-site-changelog.mdc` — `app.js` imports `site-changelog.js` as an ES module). `uds.css?v=`, `uds.js?v=`, `site.css?v=`, and `demo-builder/index.js?v=` are unchanged (no underlying file changed).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.4',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Deleted `uds-docs/docs/pages/faq.html` (FAQ page — 10 collapsible Q/A blocks covering theming, tokens, components, versioning, AI agents, and recipes-vs-demo-builder). Sidebar link `<a href="#/faq">FAQ</a>` removed from the Reference group in `uds-docs/index.html`, and the matching `<div data-page="faq" data-page-fragment></div>` placeholder block (plus its REFERENCE banner comment) removed from `<main>`. The page had drifted from current truth — it referenced `content/<component>.json` (legacy pre-restructure path; spec lives at `uds-docs/uds/components/<id>/spec.json` now) and `uds-design-system.mdc` (the downloadable Cursor rule, removed in an earlier cleanup). Topics still relevant to consumers are already covered in dedicated pages: theming on the appearance bar itself, versioning on the Changelog page header, token sourcing in `cursor-workflows.html`, AI consumption on `ai-assist`, and reporting bugs via the per-component Report Issue button. Nothing else in the live site linked to `#/faq` (only the page itself plus the now-removed sidebar entry and placeholder).' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.3 → 2026.05.21.4. `app.js?v=` bumped 132 → 133 because `docs/data/site-changelog.js` changed (per `uds-site-changelog.mdc` — `app.js` imports `site-changelog.js` as an ES module). `uds.css?v=`, `uds.js?v=`, `site.css?v=`, and `demo-builder/index.js?v=` are unchanged (no underlying file changed).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.5',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Removed the "Pre-flight checklist" header button and its modal dialog from the brand bar. Three coordinated edits in `uds-docs/index.html`, `uds-docs/docs/site.css`, and `uds-docs/docs/app.js`. The button was a `<button class="sg-preflight-btn">` with a `checklist` Material icon between the `UDS / Urban Design System` title and the Build-Demo button (lines 102-107 of `index.html`), wired with an inline `onclick` that flipped `<div id="sg-preflight-backdrop">` (a `.udc-dialog-backdrop` with the 5-section `.sg-preflight-dialog` modal at lines 133-193) open. The checklist content had badly drifted from current repo truth: it described `content/<component>.json` (legacy pre-restructure spec path — actual location is `uds-docs/uds/components/<id>/spec.json`), the long-gone `COMPONENT_STATUS` / `FIGMA_LINKS` / `PLAYGROUNDS` / `IMPL_DATA` constants in `app.js` (replaced by per-component `status.json`, `spec.json.figmaNodeId`, `playground.js`, `impl.json` in the Phase 13 restructure), and a global `CHANGELOG` (replaced by per-component `changelog.json` files aggregated to `uds/CHANGELOG.json`). The authoritative checklist for site work now lives in `.cursor/rules/uds-master-preflight.mdc` Phase 3-5 (and `uds-site-changelog.mdc` for the SITE bump specifics) — those are agent-facing and auto-attached on every relevant edit, so the in-browser duplicate was redundant.' },
        { type: 'changed', text: '`uds-docs/docs/site.css` — deleted the 19-line `.sg-preflight-btn` and `.sg-preflight-dialog` rule block (old lines 55-73 covering button sizing, hover, dialog max-width / typography / list / code / `.sg-rule-file` styling) since no markup references those classes anymore. Updated the archive-view defense-in-depth rule near the bottom of the file: was `[data-archive-view] .sg-preflight-btn, [data-archive-view] .sg-demo-btn { opacity: 0.4; pointer-events: none; }`, now `[data-archive-view] .sg-demo-btn { ... }` only, with the leading comment trimmed from "the demo/preflight buttons" to "the demo button."' },
        { type: 'changed', text: '`uds-docs/docs/app.js` `initVersionDropdown()` — the archive-view hide loop `document.querySelectorAll(\'.sg-preflight-btn, .sg-demo-btn\').forEach(...)` is now `document.querySelectorAll(\'.sg-demo-btn\').forEach(...)`. Leading comment trimmed from "playground/demo-builder/preflight aren\'t ported to historical snapshots" to "the demo-builder button isn\'t ported to historical snapshots." Function behavior is otherwise identical.' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.4 → 2026.05.21.5. `app.js?v=` bumped 133 → 134 (both `app.js` itself and the `site-changelog.js` it imports changed). `site.css?v=` bumped 8 → 9 (`site.css` changed). `uds.css?v=`, `uds.js?v=`, and `demo-builder/index.js?v=` unchanged (no underlying file changed).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.6',
      date: '2026-05-21',
      changes: [
        { type: 'fixed', text: 'SPA router (`docs/app.js`) no longer hijacks in-page anchor links. Previously, any hash that did not start with `#/` (e.g. `#interaction-states` ToC links inside `design-language.html`) got parsed as a page id, missed the page lookup, and bounced the user back to the fallback page. Now the `hashchange` handler and the initial-load handler both gate on `hash.startsWith("#/")` — non-route hashes fall through to native browser scroll-to-anchor. Any future page with an in-page ToC works without colliding with the router.' },
        { type: 'changed', text: 'Redesigned `uds-docs/docs/pages/design-language.html` to be designer-friendly instead of agent-reference-shaped. Two-column layout with a sticky ToC sidebar on the left (with active-section highlighting via IntersectionObserver in a new `registerPageLoadHook("design-language", ...)`) and main content on the right. Each state is now a card with a LIVE preview of real UDS components in that state plus a row of `.sg-dl-chip` token references (small colored swatches + monospace name + role label). 14 state cards, 14 live preview blocks, 60 token chips, 5 compare cards for focus-ring constructions and density, 4 live-shadow elevation tiles, 7 live-radius tiles. Forced-state CSS (`.sg-dl-force-hover`, `.sg-dl-force-focus`, `.sg-dl-force-readonly`) lets the page show states that cannot render statically. All previews inherit from `uds.css` — token changes flow into the page automatically. Dense tables remain only where the table IS the clearest format (Disabled vs Read-only comparison, Naming canon, Known inconsistencies); every token name now has an inline color chip.' },
        { type: 'added', text: 'New page-load hook `registerPageLoadHook("design-language", ...)` in `docs/app.js`: (1) wires smooth-scroll click handlers on every ToC link so `<a href="#section">` scrolls without polluting the hash, (2) sets up an `IntersectionObserver` that highlights the ToC item for whatever section is currently in view as the user scrolls. Inline JS in fragment HTML does not execute (the page loader uses `page.innerHTML = html`), so anything page-specific must register via this hook.' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.5 → 2026.05.21.6. Merged with main where PRs #32 and #33 advanced the SITE version through .3, .4, .5 for unrelated reference-page removals (Platform Support, Migration Guides, FAQ, Pre-flight checklist). `app.js?v=` bumped 134 → 135 because `docs/app.js` changed in this branch too (router fix + new page-load hook, independent of main\'s `initVersionDropdown()` archive-hide change — both land cleanly).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.7',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Deleted `uds-docs/docs/pages/contribute.html` (`How to Contribute` Reference page). Every numbered step referenced something that no longer matches the repo: step 4 pointed at `content/<component>.json` and `content/schema.json` (legacy pre-restructure paths; spec lives at `uds-docs/uds/components/<id>/spec.json` and schema at `uds-docs/uds/schemas/spec.schema.json` now); step 5 told designers to hand-add the `<div data-page>` block and sidebar link to `index.html` (the `new-component` Cursor skill does this now); step 8 said "update `COMPONENT_STATUS` in `app.js`" (status now lives in per-component `uds/components/<id>/status.json` files, aggregated at boot); step 9 said "bump UDS X.Y in `versions.json`" (the file is `uds/version.json` and `uds-docs/release.sh` does the bump); the "Editing an existing spec" and "Draft spec workflow" sub-sections both referenced `content/<component>.json`. The current contribution workflow is documented on `cursor-workflows.html` and inside the `new-component`, `sync-figma-component-spec`, and `generate-uds-figma-component` skill files. Easier to delete than rewrite end-to-end. Sidebar link `<a href="#/contribute">How to Contribute</a>` removed from the Reference group in `uds-docs/index.html` and the matching `<div data-page="contribute" data-page-fragment></div>` placeholder block (plus its REFERENCE banner comment) removed from `<main>`.' },
        { type: 'changed', text: '`uds-docs/docs/pages/about.html` &mdash; replaced 5 legacy `content/<component>.json` / `content/<id>.json` / `content/*.json` references with the current `uds/components/<id>/spec.json` path. The 5 sites: (1) Purpose card describing the doc site as the spec layer, (2) lifecycle step 3 body "Designer writes the structured spec in ...", (3) lifecycle step 3 location meta-label, (4) closing "Three sources of truth" aside, (5) Glossary entry "Spec completeness". The 6-stage lifecycle structure itself is unchanged &mdash; it complements (rather than duplicates) the newer Design Process discussion page\'s 5-stage stoplight framing.' },
        { type: 'changed', text: '`uds-docs/docs/pages/roadmap.html` &mdash; two stale items. (1) Components-section preamble rewritten from "Tracked at `COMPONENT_STATUS` in `app.js`. The list below is auto-rendered from that source." to "Tracked in each component\'s `uds/components/<id>/status.json` file. The list below is auto-rendered from those files." The in-memory `COMPONENT_STATUS` map variable in `app.js` still exists &mdash; it\'s now built at boot from each component\'s `status.json` &mdash; but the source-of-truth wording was misleading. (2) Site-features bullet "Figma &rarr; JSON sync" flipped from `Proposed` to `Shipped` and the body rewritten to describe the actual delivery mechanism: agent-facing Cursor skills (`import-figma-tokens`, `sync-figma-component-spec`, `link-figma-nodes`) that round-trip Figma into `uds/tokens/*.css` or the relevant `uds/components/<id>/spec.json`, invoked via "UDS updated" (or the per-task variant). Not the originally-proposed server-side action, but the same capability.' },
        { type: 'changed', text: '`uds-docs/docs/pages/design-process.html` Related footer &mdash; dropped the `<a href="#/contribute">How to Contribute</a> &middot; ` prefix from the cross-reference list (since the target page no longer exists). Final list is `About UDS &middot; Cursor Workflows`.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` line 578 &mdash; dropped the trailing sentence "The [How to Contribute](#/contribute) page covers when to reach for which." The preceding paragraphs already say "Use rules for X / Use skills for Y / Use subagents for Z / Use audits for W," so the pointer was redundant even before the page was deleted. Final wording: "All four kinds live in the repo and ship with anyone who clones it."' },
        { type: 'changed', text: '`.cursor/skills/new-component/SKILL.md` &mdash; rewrote the opener that previously said "Walks the [How to Contribute](...) workflow steps 4-5 mechanically" so it stands on its own without referencing the deleted page. Dropped the `See also` bullet that pointed at `#/contribute`. Bumped frontmatter `lastUpdated` from `2026-05-12T18:41:50Z` to `2026-05-21T18:15:30Z` per `.cursor/rules/uds-rule-discipline.mdc`. Skill behavior, step contracts, and the rest of the `See also` block are unchanged.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated via `bash scripts/regenerate-toolchain.sh` to pick up the bumped `new-component` `lastUpdated` date column. Counts unchanged (20 rules + 9 skills + 7 agents = 36 entries).' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.6 &rarr; 2026.05.21.7. `app.js?v=` bumped 135 &rarr; 136 because `docs/data/site-changelog.js` changed (per `uds-site-changelog.mdc` &mdash; `app.js` imports `site-changelog.js` as an ES module). `uds.css?v=`, `uds.js?v=`, `site.css?v=`, and `demo-builder/index.js?v=` unchanged (no underlying file changed).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.8',
      date: '2026-05-21',
      changes: [
        { type: 'changed', text: 'Design Language page (`uds-docs/docs/pages/design-language.html`) &mdash; replaced the academic "canon" and "ratification" language with natural design-system voice. Specifics: page lede rewritten ("How UDS components look in each state. Every preview on this page is a real component &mdash; the colors come from the same tokens as production. Where components disagree on the same state, both are shown so we can pick one."); hero meta row collapsed from three git-style stat pills (database / tune / code) into one friendly sentence; section 11 retitled "Naming guidance" (was "Naming canon"); section 12 retitled with a "needs review" badge (was "designer ratification"); every "Canonical pattern proposed" trailer reworded as "Suggested fix"; "in the canon today" &rarr; "in UDS today"; the "agent canon" cross-reference in the Related-pages footer reworded as "the same content for AI agents lives in..."; the "Cross-cutting" section heading reworded to "A few rules that apply across the board."' },
        { type: 'changed', text: 'Same language pass on `.cursor/rules/uds-design-language.mdc` (the agent-facing version). Frontmatter `description:` rewritten (no more "Canonical UDS visual language extracted from..."); body opens with "standard visual constructions" instead of "canonical visual constructions"; the §12 lede ("These are real disagreements between components in the current CSS. They are listed here so the designer can pick a standard pattern.") and every §12.x "Suggested fix" trailer match the page. `cursor-workflows.html` row for `uds-design-language` rewritten to drop "Canonical" / "naming canon" / "designer ratification."' },
        { type: 'changed', text: 'Design Language page layout cleanup. (1) Removed the manual-style "01 / 02 / …" numeric prefixes from every section header &mdash; sections now just have a title. (2) Dropped the heavy `border-bottom` divider under section headers; spacing alone does the separation. (3) State-card tag (e.g. "rest", "pointer over") is no longer rendered in monospace &mdash; it reads as natural copy now. (4) Hid the leftover "LIVE PREVIEW" labels above each live preview (`.sg-dl-preview-label { display: none; }`) &mdash; the rendered component is self-evident, the label was visual noise. (5) "Cross-cutting" section retitled "A few rules that apply across the board" and dropped its star heading icon.' },
        { type: 'changed', text: 'Merge with `main` (PR #35 landed `2026.05.21.7` for the How-to-Contribute deletion while this branch was in flight; both branches independently bumped to `.7`). Resolved by accepting main\'s `.7` entry verbatim and re-bumping this branch\'s work to `.8`. Two additional "canon" stragglers surfaced in main\'s merged content and were scrubbed in the same pass: `cursor-workflows.html` row for `uds-figma-factory-quality` ("that rule is the canon" &rarr; "that rule is the standard") and the `uds-design-language` row trailer ("agent-facing canon is this rule" &rarr; "the same content for AI agents is in this rule"). `index.html` design-language section-banner comment "(canonical state constructions, surface treatments, ...)" simplified to drop "canonical" too.' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.7 &rarr; 2026.05.21.8. `app.js?v=` bumped 136 &rarr; 137 because `docs/data/site-changelog.js` changed again (per `uds-site-changelog.mdc` &mdash; `app.js` imports `site-changelog.js`). `uds.css?v=`, `uds.js?v=`, `site.css?v=`, and `demo-builder/index.js?v=` unchanged (no underlying file changed in this revision).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.9',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Roadmap reference page removed. The page mixed three lists with different lifespans: a "Foundation prerequisites" list (motion + breakpoint tokens) that duplicates what each component spec already says when those token sets land; a "Components" table auto-rendered from `COMPONENT_STATUS` that duplicates the sidebar status badges + each component\'s header status badge; and a stale "Site features" list (token search, Figma sync) that was already shipped. Deleted `uds-docs/docs/pages/roadmap.html`. Removed sidebar link `<a href="#/roadmap">Roadmap</a>` from the Reference group in `uds-docs/index.html` and the matching `<div data-page="roadmap" data-page-fragment></div>` placeholder block (plus its REFERENCE banner comment) from `<main>`.' },
        { type: 'removed', text: '`uds-docs/docs/app.js` &mdash; deleted the `renderRoadmapComponents()` function (built the components-status table from `COMPONENT_STATUS` + `completenessScores` + `STATUS_LABELS`), its `registerPageLoadHook(\'roadmap\', ...)` registration, and the trailing `// renderRoadmapComponents() — DEFERRED to roadmap page load hook (Phase 5)` comment inside the `componentsReady.then(...)` block.' },
        { type: 'changed', text: '`uds-docs/docs/pages/about.html` &mdash; rewrote the Component Lifecycle step 1 ("Propose"). Old copy said the proposer "files an entry on the [Roadmap](#/roadmap) with rationale" and showed `<span class="sg-lifecycle__loc">...Roadmap</span>` as the location. New copy says they "start a Figma page for the component with the red Exploration prefix and notes what problem it solves," with the location now `Figma — UDS Components (Red)` and a cross-link to the Design Process page for the full stoplight flow. This matches the current 5-stage stoplight model in `design-process.html` &mdash; the old Roadmap-as-proposal-intake flow was never wired up beyond the now-deleted page.' },
        { type: 'changed', text: '`uds-docs/docs/pages/about.html` + `uds-docs/docs/site.css` &mdash; renamed the status-pill CSS class from `.sg-roadmap-tag` to `.sg-lifecycle__tag` to match its only remaining use (the six lifecycle stages on the About page). Same visual, BEM-style name now consistent with the surrounding `.sg-lifecycle__*` classes. The `data-status="approved"` variant was dropped at the same time &mdash; never used anywhere; the remaining variants are `proposed`, `in-progress`, and `done`.' },
        { type: 'removed', text: '`uds-docs/docs/site.css` &mdash; removed dead-CSS rules for the deleted page: `.sg-roadmap-list` + `.sg-platform-list` block (4 rules; platform.html was already deleted in an earlier PR but its CSS was still here because it shared the selector list with roadmap-list); `.sg-roadmap-comp-table` block (6 rules; only ever fed by `renderRoadmapComponents`). Updated the Reference-pages section comment from `(About UDS, Glossary, FAQ, Contribute, Roadmap, Platform, Migration)` to `(About UDS)` &mdash; the other five were all deleted in prior PRs.' },
        { type: 'changed', text: '`scripts/lib/audit_theme_contrast.js` &mdash; swapped the `[\'roadmap\', `${SERVER_URL}#/roadmap`]` entry in the representative-pages array for `[\'about\', `${SERVER_URL}#/about`]` so the multi-theme contrast audit still covers a page that uses the status-pill pattern (the lifecycle stages on About) on every theme. Total page count stays at 7 &rarr; 6 themes &times; 7 pages = 42 combinations, matching the existing README + AGENTS + cursor-workflows documentation.' },
        { type: 'removed', text: '`scripts/lib/baseline_screenshot.js` &mdash; dropped `#/roadmap` from the screenshot `PAGES` list and from the `nameFor()` helper\'s reference-page id list. Also dropped a stale `#/how-to-contribute` hash that was never a real route (the only contribute page that ever existed was `#/contribute`, deleted in `SITE 2026.05.21.7`).' },
        { type: 'changed', text: '`.cursor/skills/sync-figma-component-status/SKILL.md` &mdash; step 12 ("Visual-check the Roadmap and sidebar status badges") rewritten to drop the Roadmap reference and split the check into "sidebar status badges" + "each affected component page\'s header badge." Verification checklist updated to match. Bumped frontmatter `lastUpdated` to `2026-05-21T19:06:12Z`.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated via `bash scripts/regenerate-toolchain.sh` to pick up the bumped `sync-figma-component-status` `lastUpdated` date. Counts unchanged (20 rules + 9 skills + 7 agents = 36 entries).' },
        { type: 'changed', text: '`AGENTS.md` repo-layout tree &mdash; dropped `roadmap.html` and a stale `how-to-contribute.html` entry from the `docs/pages/` listing (neither file exists on disk).' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.8 &rarr; 2026.05.21.9. `app.js?v=` bumped 137 &rarr; 138 because `docs/app.js` and the imported `docs/data/site-changelog.js` both changed. `site.css?v=` bumped 9 &rarr; 10 because `docs/site.css` changed. `uds.css?v=`, `uds.js?v=`, and `demo-builder/index.js?v=` unchanged (no underlying file changed).' }
      ]
    },
    {
      version: 'SITE 2026.05.22.1',
      date: '2026-05-22',
      changes: [
        { type: 'changed', text: '`.cursor/rules/communication-style.mdc` &mdash; rewrote the rule to make "talk to the user as a senior product designer, not a developer" the explicit audience contract instead of a soft preference. Added a new Audience section that names the constraint; expanded the Default chat tone section with hard rules on no-jargon, no-tool-call-narration, no-restate-the-obvious, and escalate-on-request-only; added a Designer-speak vs developer-speak comparison table with seven before/after rows covering Button size changes, hover bindings, site bumps, Figma `{Cursor}{Ignore}` pages, contrast audits, missing `figmaNodeId`, and commit/push reporting. The "Where technical voice is still required" carve-out (changelog entries, commits, audits, JSON specs, code) is preserved verbatim &mdash; this is a chat-tone rule, not an artifact-tone rule. Frontmatter `description:` and `lastUpdated:` bumped to match (`2026-05-22T02:20:11Z`).' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; updated the `communication-style` row description to mirror the rewritten rule (designer-not-developer framing, designer-speak vs developer-speak table, file-path / function-name / CSS-selector / JSON-key suppression in chat body, pairs with the User Rule in Cursor Settings so the same voice follows the user across every project).' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated via `bash scripts/regenerate-toolchain.sh` to pick up the new `communication-style` `lastUpdated` and `description:`. Counts unchanged (20 rules + 9 skills + 7 agents = 36 entries).' },
        { type: 'changed', text: 'SITE bumped 2026.05.21.9 &rarr; 2026.05.22.1 (rolled over to a new day, counter reset to `.1` per `bump-site.sh`). `app.js?v=` bumped 138 &rarr; 139 because `docs/data/site-changelog.js` changed and `docs/app.js` imports it (per `uds-site-changelog.mdc`). `site.css?v=`, `uds.css?v=`, `uds.js?v=`, and `demo-builder/index.js?v=` unchanged. `cursor-workflows.html` is lazy-fetched as a page fragment via `fetch-versioned.js`, which cache-busts per fetch &mdash; no manual `?v=` bump needed.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.2',
      date: '2026-05-22',
      changes: [
        { type: 'changed', text: '`.cursor/rules/communication-style.mdc` &mdash; second pass after the user pushed back that the prior revision read too absolutist ("no jargon ever" overshot "use plain language by default"). Three substantive changes: (1) Audience section now explicitly notes "senior designer means they understand technical concepts, they are not asking to be talked down to," so future agents don\'t infer that less-technical means dumbed-down. (2) Default chat tone rules swapped "No jargon." for "Use jargon when it\'s the clearest word, not by default" &mdash; with the test "if you can express the same idea in plain language without losing accuracy or making the sentence longer, do that; if the user is going to act on the exact name, use the exact name." Added a "match the user\'s register" rule so debugging conversations don\'t get artificially flattened. (3) Designer-speak vs developer-speak table reframed: the right column is now labeled "Technical voice (when the specifics matter)" instead of "Not this," and is explicitly fine in chat when the user is debugging, asked for the implementation, or needs the exact name &mdash; the wrong move is defaulting to it when the left column was clearer. Example rewordings preserved but the dichotomy is no longer "right vs wrong."' },
        { type: 'added', text: '`.cursor/rules/communication-style.mdc` &mdash; new `## Voice extends to human-facing docs prose` section. Same designer voice now formally covers prose written for human readers across the docs site, in addition to chat replies: rendered page copy in `docs/pages/*.html` (ledes, section headers, callouts, FAQ entries); prose fields in `uds/components/<id>/spec.json` (`description`, `whenToUse`, `whenNotToUse`, `dosDonts.dos[]`, `dosDonts.donts[]`) that render verbatim into the Guidelines tab; the `accessibility` prose strings (`keyboard[].action`, `screenReader[].announcement`, `wcag[].howMet`); `impl.json` `description`; `uds/CHANGELOG.globalNotes.json` (the prose part, not the version metadata); and narrative sections of `README.md` / `AGENTS.md`. Critical caveat in bold: this does NOT authorize autonomous rewrites of `uds-docs/uds/` content &mdash; the Figma source-of-truth rule (`uds-source-of-truth.mdc`) still gates whether the agent can edit those files at all. The voice rule kicks in WHEN an authorized edit is happening; it does not create authorization to edit. Codifies the work the user already did rewriting the Design Language page in `SITE 2026.05.21.8` ("canon" / "ratification" / "agent canon" &rarr; natural designer voice).' },
        { type: 'added', text: '`.cursor/rules/communication-style.mdc` &mdash; new `## Where technical voice is non-negotiable` table replaces the prior `## Where technical voice is still required` bullet list. Each row pairs an artifact with the specific reason its technical detail must stay: code (vocabulary the codebase uses), code comments (precise WHY, not narration), JSON schemas (editors validate against them), per-component `changelog.json` `entries[]` (`audit-changelog-currency.sh` and aggregator depend on real token/prop/file-path names), `SITE_CHANGELOG` entries (typed, scoped, file-path references), structured spec fields (`props[]`, `events[]`, `slots[]`, `states[]`, `accessibility.wcag[]`, `accessibility.contrast[]`, `acceptanceCriteria[]`) (component-page render code reads them by shape), `impl.json` `tokens[]` and `html` (token names exact, example HTML uses real class names), audit and diagnostic output (`Confidence / Risk / Reason / Default action` shape from `uds-figma-change-classification.mdc`), Git commit messages and PR descriptions (dev-to-dev, name files/scripts/audits), Figma write summaries (`File / Page / Node / Operation / Old value / New value / Rollback note` shape from `uds-figma-write-safety.mdc`). The intent is to make protection of these artifacts explicit so a future agent reading "designer voice everywhere" doesn\'t accidentally rewrite a typed spec field as casual prose.' },
        { type: 'added', text: '`.cursor/rules/communication-style.mdc` &mdash; new `## How to decide which voice to use` cheat sheet, 6 numbered questions: is a human reading this prose for understanding? &rarr; designer voice; is a machine parsing it or is a downstream audit depending on its shape? &rarr; technical voice; is it code? &rarr; what the codebase uses; is it a comment? &rarr; explain WHY precisely; is it a chat reply where the user is debugging? &rarr; technical voice fine in chat, just don\'t over-do it; is it a chat reply where the user is checking in? &rarr; designer voice with an offer to expand. Default-when-in-doubt is "less technical, offer to expand."' },
        { type: 'changed', text: '`.cursor/rules/communication-style.mdc` &mdash; frontmatter `description:` rewritten to fit the broader scope: "Default chat tone for this repo + voice for human-facing docs prose. Talk to the user as a senior product designer, not a developer &mdash; concise, plain language, technical terms only when they\'re the clearest word. Same voice applies to rendered docs pages, spec.json prose fields, dosDonts, and README. Technical voice stays non-negotiable for code, schemas, changelogs, audits, commits, and PR descriptions." `lastUpdated:` bumped to `2026-05-22T02:27:33Z`.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; `communication-style` row description rewritten to mirror the second-pass rule: explicitly names the "technical terms when they\'re the clearest word, not by default, not for show" framing; calls out the table\'s new explicit when-to-use-technical-voice column; enumerates the front-facing prose surfaces the rule now covers (rendered pages, `spec.json` prose fields, `impl.json` descriptions, `CHANGELOG.globalNotes.json`, README narrative); explicitly notes "without authorizing autonomous rewrites of `uds-docs/uds/` content (Figma source-of-truth still gates that)"; and enumerates the non-negotiable technical-voice artifacts (code, code comments, JSON schemas, structured spec fields, per-component `changelog.json` entries, `SITE_CHANGELOG`, audit output, Figma write summaries, commits, PR descriptions).' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated via `bash scripts/regenerate-toolchain.sh` to pick up the new `communication-style` `lastUpdated` and `description:`. Counts unchanged (20 rules + 9 skills + 7 agents = 36 entries).' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.1 &rarr; 2026.05.22.2 (same day, counter incremented per `bump-site.sh`). `app.js?v=` bumped 139 &rarr; 140 because `docs/data/site-changelog.js` changed again. `site.css?v=`, `uds.css?v=`, `uds.js?v=`, and `demo-builder/index.js?v=` unchanged. `cursor-workflows.html` cache-busts via the runtime fetch helper.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.3',
      date: '2026-05-22',
      changes: [
        { type: 'added', text: '`.cursor/rules/communication-style.mdc` &mdash; closed a gap surfaced during self-review of this branch. A literal-minded agent reading the "Voice extends to human-facing docs prose" section could plausibly extend it to `.cursor/rules/*.mdc`, `.cursor/skills/*/SKILL.md`, or `.cursor/agents/*.md` because those are markdown files humans review &mdash; and then start softening the operational detail (file paths, schema field names, script names, command flags) that future agents need verbatim to execute. Fix: (1) added a "Not in scope: anything under `.cursor/`" callout inside the human-facing-prose section that explicitly punts these files to the technical-voice table; (2) added a new row to the "Where technical voice is non-negotiable" table for `.cursor/rules/*.mdc`, `.cursor/skills/*/SKILL.md`, `.cursor/agents/*.md` with the reason: "Agent-consumed instructions. The agent needs the exact file paths, schema field names, script names, and command flags to execute. Use the vocabulary the agent will encounter at runtime. Plain-language rationale wrapping is fine, but the operational detail must stay precise." Frontmatter `lastUpdated:` bumped to `2026-05-22T02:47:48Z`.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; appended "and the `.cursor/` rule/skill/agent files themselves (agents need the exact file paths and script names to execute)" to the enumeration of non-negotiable technical-voice artifacts in the `communication-style` row, mirroring the rule update.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated. Counts unchanged (20 rules + 9 skills + 7 agents = 36 entries).' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.2 &rarr; 2026.05.22.3. `app.js?v=` bumped 140 &rarr; 141 because `docs/data/site-changelog.js` changed. Other cache-bust params unchanged.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.4',
      date: '2026-05-22',
      changes: [
        { type: 'fixed', text: '`.cursor/rules/communication-style.mdc` &mdash; two consistency nits caught during a final read-through of this branch. (1) Section heading on line 50 said `## Designer-speak vs developer-speak` but the actual table columns inside it were already labeled "Designer voice" and "Technical voice (when the specifics matter)" &mdash; the old "developer-speak" framing had leaked through the heading. Retitled to `## Designer voice vs technical voice` so the section title, the column labels, and the rest of the rule prose all use the same vocabulary. (2) The "I bumped the docs site" / right-column example row hardcoded `"Ran bump-site.sh, version is now SITE 2026.05.22.2"`, which would either drift out of date on every SITE bump or invite future agents to "helpfully" keep it current (creating churn). Made it version-agnostic: `"Ran bump-site.sh, SITE counter incremented."` &mdash; still demonstrates the technical voice without baking in a specific version that decays. Frontmatter `lastUpdated:` bumped to `2026-05-22T02:52:24Z`.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated. Counts unchanged.' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.3 &rarr; 2026.05.22.4. `app.js?v=` bumped 141 &rarr; 142 because `docs/data/site-changelog.js` changed. Other cache-bust params unchanged.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.5',
      date: '2026-05-22',
      changes: [
        { type: 'changed', text: 'Contrast Checker (`#/contrast-checker`) redesigned end-to-end into a focused, designer-first tool. Previous layout was three same-weight sections (long WCAG explanation, 18 dense recommended-pairing cards, native-`<select>` picker, full matrix), which forced designers to read paragraphs before doing anything and gave no clear answer to the question "does this pairing work across themes?" New layout is hero-first with three zones, in order of importance: (1) hero Compare panel with a real-size live preview, big ratio + verdict, and a per-theme strip; (2) a tabbed Browse mode for breadth; (3) a collapsed `<details>` block for the WCAG/threshold reference.' },
        { type: 'added', text: 'Hero Compare panel &mdash; `.cc-hero` with two slot pickers (foreground + surface). Each picker is a custom popover (`.cc-popover`) with a search input, kind chip filters, scrollable grouped token list, click-outside-to-close, and Escape-to-close. The picker trigger shows a 24&times;24 swatch and the token short-name (mono). Inside the panel, a large `.cc-hero-stage` renders the actual surface filled-in: a paragraph of body text at 22/16/14&nbsp;px (text kind), an inline icon row of 7 Material Symbols at body/headline/large sizes (icon kind), or a bordered "input" + chip + outlined-card mockup (border kind) &mdash; so designers can see whether a pair is readable at real reading scale, not just a 36&times;28&nbsp;px swatch. The verdict pill is large and centered with the contrast ratio in big monospace beside it, plus a one-sentence explanation citing the WCAG criterion that determined the verdict.' },
        { type: 'added', text: 'Per-theme strip &mdash; `.cc-themes` row inside the hero shows the *same* foreground&times;surface pair evaluated across all 6 supported themes (Base Light, Base Dark, ResMan Light, ResMan Dark, AnyoneHome Light, Inhabit Light) simultaneously. Computed via 6 hidden detached probe elements with each theme\'s `data-color-scheme` / `data-theme` attributes applied; reads the resolved CSS-variable RGB through `getComputedStyle()`, computes WCAG contrast, and renders a verdict mini-pill + ratio per theme. Click any theme cell to flip the global theme bar to that combination &mdash; answers "does this pair work everywhere?" without making the designer manually flip themes. Currently-active theme cell highlighted with the interactive border.' },
        { type: 'added', text: 'Browse mode &mdash; `.cc-browse` segmented toggle between "Common pairings" (the curated semantic combinations, now rendered as compact 1-line list items with kind pill + title + surface swatch + foreground sample + token names + ratio + verdict pill, click &rarr; loads into Compare) and "Full matrix" (cleaner grid with sticky first column + header row, kind-tinted column accents, click any cell to load that pair into Compare). Above both views: kind chip filters (text / icon / border, multi-select) and a "Show only failing" toggle that hides anything that passes the kind\'s threshold. The same chip + fail-only filter applies to both views. Compare-panel state persists across browse-tab switches.' },
        { type: 'added', text: 'Click-to-pin from Browse to Compare &mdash; every curated row, every matrix cell, and every per-theme cell is interactive. Clicking populates the Compare panel and auto-scrolls the hero into view if it\'s offscreen.' },
        { type: 'changed', text: 'WCAG threshold explanation moved out of the always-on top of the page into a `<details class="cc-help">` block at the bottom that defaults to closed. Designers see the hero immediately; threshold reference is one click away. Same content (kind-aware text/icon/border thresholds, transparent-token rule, by-design `*-disabled` rule).' },
        { type: 'removed', text: 'Native `<select class="cc-picker-select-input">` element replaced by the searchable popover picker. The native select was the only non-UDS-styled control on the page and made the picker section feel disconnected from the rest of the docs site.' },
        { type: 'removed', text: 'Three same-weight `.sg-subsection` blocks ("Recommended pairings" / "Pick a surface or foreground" / "Full matrix") collapsed into the single hero+browse layout. The intro\'s 4-line wall-of-text paragraph dropped &mdash; the page now leads with the tool itself.' },
        { type: 'changed', text: '`docs/modules/contrast-checker/index.js` rewritten end-to-end (~1130 lines). Color math (`parseRgb`, `srgbToLinear`, `luminance`, `contrastRatio`, `classifyVerdict`, `verdictLabel`, `formatRatio`, `isTransparent`, `isDisabledName`, `isNoneName`) preserved verbatim &mdash; same WCAG SC 1.4.3 / 1.4.11 thresholds. New code: `THEME_PROFILES` (6 entries), `ensureThemeProbes()` / `resolveTokenInTheme()` (per-theme probe machinery), `renderHero()` / `renderHeroStage()` / `renderHeroVerdict()` / `renderThemeStrip()`, `applyThemeProfile()` (click-theme-cell &rarr; flip global theme bar), `getActiveThemeProfileId()` (highlight currently-active theme strip cell), `renderBrowse()` / `renderCuratedList()` / `renderMatrix()`, `openPopover()` / `closePopover()` / `renderPopoverList()` (custom searchable picker). The `MutationObserver` on `<html>` data-attributes is unchanged &mdash; flipping the theme bar still recomputes everything.' },
        { type: 'changed', text: '`docs/pages/tools/contrast-checker.html` rewritten to match the new layout: title + 1-sentence subtitle, then a single `<div id="cc-app">` populated by JS on first navigation.' },
        { type: 'changed', text: '`docs/site.css` `.cc-*` block replaced with the new layout rules: `.cc-app`, `.cc-hero`, `.cc-pickers`, `.cc-picker-trigger`, `.cc-popover`, `.cc-popover-search`, `.cc-popover-kinds`, `.cc-popover-list`, `.cc-popover-group`, `.cc-popover-option`, `.cc-hero-stage`, `.cc-stage-text`, `.cc-stage-icons`, `.cc-stage-border-row`, `.cc-verdict-row`, `.cc-big-ratio`, `.cc-big-verdict-*`, `.cc-themes`, `.cc-theme-cell`, `.cc-browse`, `.cc-browse-tabs`, `.cc-browse-filters`, `.cc-fail-only`, `.cc-curated-list`, `.cc-curated-row`, `.cc-curated-pill--{text,icon,border}`, `.cc-matrix-*` (cleaner header / cell / blank-pattern for fail-only filter), `.cc-help` / `.cc-help-summary` / `.cc-help-list`. Verdict pill colors unchanged (success / warning / error subtle). Existing `.cc-sample`, `.cc-ratio`, `.cc-verdict-*`, `.cc-by-design` utility classes preserved verbatim &mdash; reused in the new layout.' },
        { type: 'changed', text: 'Lazy-import in `docs/app.js` `registerPageLoadHook("contrast-checker", ...)` now imports `./modules/contrast-checker/index.js?v=2` (cache-bust query). The dynamic `import()` is the only entry point for this module and there\'s no `<script src="...?v=N">` tag in `index.html` to bump, so the query param goes inline in the import URL.' },
        { type: 'changed', text: 'Merge with `main` resolution. While this branch was in flight, `main` shipped PR #36 (Design Language language, `2026.05.21.8`), PR #37 (Roadmap removal, `2026.05.21.9`), and PR #38 (communication-style rule, `2026.05.22.1` &mdash; `2026.05.22.4`). Both branches independently bumped the SITE counter to `2026.05.21.8` for unrelated work. Resolved by accepting all of `main`\'s entries verbatim (`2026.05.21.8` &mdash; `2026.05.22.4`) and re-bumping this branch\'s Contrast Checker work to `2026.05.22.5`. Both branches also independently bumped `site.css?v=` from `9` to `10` for unrelated CSS changes (main\'s `.sg-roadmap-*` removal and this branch\'s `.cc-*` rewrite); resolved by bumping to `?v=11` so any browser holding either side\'s cached `?v=10` re-fetches the merged file. `app.js?v=` bumped to `143` (one past main\'s `142`).' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.4 &rarr; 2026.05.22.5. `app.js?v=` bumped 142 &rarr; 143 (`app.js` itself changed for the dynamic-import cache-bust + `site-changelog.js` import). `site.css?v=` bumped 10 &rarr; 11 (`site.css` changed). `uds.css?v=`, `uds.js?v=`, and `demo-builder/index.js?v=` unchanged (no underlying file changed).' }
      ]
    },
    {
      version: 'SITE 2026.05.22.6',
      date: '2026-05-22',
      changes: [
        { type: 'added', text: '`.cursor/rules/uds-figma-plugin-api-gotchas.mdc` &mdash; two new Plugin API gotchas surfaced during a review of the Nav Header factory draft on the `🟠 Nav Header {Cursor}{Ignore}` page (RUN_ID `nav-header-2026-05-22-0d7qtg`). §5 "Auto-layout has FIVE bindable spacing properties, not two" documents that `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, and `itemSpacing` are individually bindable and that there is no `paddingHorizontal` shorthand &mdash; CSS-style horizontal/vertical helpers (`px-N` / `py-N`) train the eye to think in pairs and silently strand whichever pair the script doesn\'t bind. The error mode is silent in the default density mode and only surfaces under `[data-density="comfortable"]`. §6 "Effects must bind via `setEffectStyleIdAsync`, never `node.effects = [...]`" documents the parallel failure mode for elevation: raw effect literals render visually but escape every "is this bound?" audit, and factory runs that copy depth values from inspection rather than binding the style routinely ship visually-shadowed nodes whose values don\'t match any depth step at all. Both sections include wrong/correct code examples, a helper-signature contract for §5, and an audit-signature contract for §6 (an audit must check both `effects.length > 0` AND `effectStyleId === \'\'` &mdash; either alone is insufficient). Frontmatter `lastUpdated:` bumped to `2026-05-22T18:25:26Z`.' },
        { type: 'added', text: '`.cursor/rules/uds-figma-factory-quality.mdc` &mdash; "Minimum mandatory audit before Phase C report" extended from two structured checks (paint binding + effect color binding) to five. New checks: (3) per-side spacing audit reporting `paddingTop` / `paddingBottom` / `paddingLeft` / `paddingRight` / `itemSpacing` separately, not as a combined "unbound spacing" count; (4) effect-style binding audit checking `effectStyleId` directly per node where `effects.length > 0`; (5) per-variant `INSTANCE_SWAP` defaults audit comparing each variant\'s current swap target against the per-variant default the Phase A model specified, catching the "every icon shipped as the same factory placeholder" failure where the technical wiring is correct but per-variant differentiation (`complete &rarr; check`, `error &rarr; priority_high`) was never baked in via `setProperties`. The "Why this is non-negotiable" section now documents the Nav Header run as the second instance of the same shape of failure (after the text-input run) so a future agent can see the pattern. Frontmatter `lastUpdated:` bumped to `2026-05-22T18:25:26Z`. Front-matter `description:` unchanged because the gates list in the description is already a summary, not an enumeration.' },
        { type: 'added', text: '`.cursor/skills/generate-uds-figma-component/SKILL.md` &mdash; Phase B.2 binding rules and Phase C tool-emitted gates extended to enforce the new contract. Phase B.2 now has explicit "Per-side spacing binding (all five properties)" and "Effect-style binding (never raw effects literals)" bullets, each with a wrong/correct example pattern and a cross-reference to the relevant gotcha section. The "Bind fills, strokes, typography, spacing, and radius" line was rewritten to explicitly include effects. Phase C "Tool-emitted gates" gained a "Per-side spacing bindings" gate (per-property counts, not a combined number), an "Effect-style bindings" gate (separate from "Token bindings" because the visual output looks right when binding is missing), and a "Per-variant INSTANCE_SWAP defaults" gate (walk every variant, compare against the model). The legacy "All four tool-emitted gates" copy in the review-ready definition was loosened to "Every tool-emitted gate above" since the actual gate count was already &gt; 4 and is now &gt; 7. Frontmatter `lastUpdated:` bumped to `2026-05-22T18:25:26Z`.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; descriptions for `uds-figma-plugin-api-gotchas` (extended to enumerate gotchas 5 and 6) and `uds-figma-factory-quality` (extended to call out the four mandatory machine-verified audit checks per Phase C) updated to mirror the rule changes. Same anchor copy in both rule frontmatter `description:` fields and the docs-site row keeps the agent-toolchain index, the rule files, and the cursor-workflows page in lockstep.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated via `bash scripts/regenerate-toolchain.sh` to pick up the new `lastUpdated` timestamps. Counts unchanged (20 rules + 9 skills + 7 agents = 36 entries).' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.5 &rarr; 2026.05.22.6. `app.js?v=` bumped because `docs/data/site-changelog.js` changed. `cursor-workflows.html` cache-busts via the runtime fetch helper. `site.css`, `uds.css`, `uds.js`, `demo-builder/index.js` unchanged. (Originally landed on this branch as `2026.05.22.5`; renumbered to `2026.05.22.6` during merge with `main` &mdash; see the merge-resolution entry under SITE 2026.05.22.7 below.)' }
      ]
    },
    {
      version: 'SITE 2026.05.22.7',
      date: '2026-05-22',
      changes: [
        { type: 'fixed', text: '`.cursor/rules/uds-figma-plugin-api-gotchas.mdc` §5 &mdash; tightened ambiguous "asymmetry" vocabulary surfaced during a re-read of the SITE 2026.05.22.6 changes (the factory Phase C gate additions, originally `2026.05.22.5` pre-merge). The word was disambiguated by surrounding context in every usage, but a future agent skimming could plausibly misread it as "asymmetric values across sides should be made equal" rather than "asymmetric binding state across sides should be made consistently bound." Two edits: (1) the second paragraph\'s "The asymmetry only surfaces when..." is now "The unbound vertical pair only surfaces when... (`[data-density="comfortable"]` re-resolves every space token but leaves the raw `8` literals stranded)" and a new explicit clarifier paragraph: "This is purely a question of binding state across sides, not value symmetry across sides. A pill that legitimately wants `paddingLeft = 16` and `paddingRight = 12` (different values per side because the leading icon and trailing chevron need different breathing room) is fine &mdash; the fix is \'every side bound to its own appropriate space variable,\' not \'every side bound to the same space variable.\'" (2) The "Helper signature contract" subsection\'s "Two-axis helpers ... are an anti-pattern &mdash; they will silently re-introduce the asymmetry." is now "Two-axis helpers ... are an anti-pattern &mdash; they bind whichever pair the helper takes (the `h` arguments to `paddingLeft` and `paddingRight`) and leave the other pair as raw pixel literals." Plus a closing line: "The requirement is \'every side bound,\' not \'every side equal.\'" Frontmatter `lastUpdated:` bumped to `2026-05-22T18:39:47Z`.' },
        { type: 'fixed', text: '`.cursor/skills/generate-uds-figma-component/SKILL.md` Phase B.2 &mdash; same vocabulary tightening on the "Per-side spacing binding" bullet. The previous "Even when the value is symmetric (e.g. an 8px square pad), pass the same `uds-space-100` variable to both sides &mdash; that\'s still five `setBoundVariable` calls" is now front-loaded with the explicit framing: "The requirement is *every side bound*, not *every side equal* &mdash; a pill that legitimately wants `paddingLeft = uds-space-200` (16px) and `paddingRight = uds-space-150` (12px) is fine; what\'s not fine is pairing those bound horizontal values with raw `paddingTop = 8` and `paddingBottom = 8` literals." The closing "the two-axis helper signature `(h, v)` is an anti-pattern that silently re-introduces axis asymmetry" is now "the two-axis helper signature `(h, v)` is an anti-pattern &mdash; it binds whichever pair the helper takes and leaves the other pair as raw pixel literals." Frontmatter `lastUpdated:` bumped.' },
        { type: 'fixed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; mirrored the same wording fix in the `uds-figma-plugin-api-gotchas` row description for gotcha 5: "...silently strand whichever pair they don\'t bind, and the asymmetry only surfaces under density-mode flips" is now "...silently strand whichever pair they don\'t bind, and the unbound pair only surfaces visibly under density-mode flips. The requirement is \'every side bound,\' not \'every side equal\' &mdash; different values per side (<code>pl-200 pr-150</code>) are fine, as long as both sides are bound to space variables rather than one being a raw pixel literal." The factory-quality row description didn\'t use the word and didn\'t need to change.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated. Counts unchanged.' },
        { type: 'changed', text: 'Merge with `main` resolution. While this branch was in flight, `main` shipped PR #39 (Contrast Checker redesign, `2026.05.22.5`). Both branches independently bumped the SITE counter from `2026.05.22.4` to `2026.05.22.5` from the same starting point. The actual content changes are completely disjoint &mdash; main\'s PR #39 edits the Contrast Checker tool page (`docs/app.js`, `docs/site.css`, `docs/modules/contrast-checker/index.js`, `docs/pages/tools/contrast-checker.html`) and this branch edits Cursor rule/skill files (`.cursor/rules/uds-figma-plugin-api-gotchas.mdc`, `.cursor/rules/uds-figma-factory-quality.mdc`, `.cursor/skills/generate-uds-figma-component/SKILL.md`, `.cursor/TOOLCHAIN.md`) plus `docs/pages/cursor-workflows.html`. Conflicts were entirely on the SITE-bookkeeping files (`version.txt`, `index.html` cache-bust + `SITE_VERSION` constant + brand-bar text, `site-changelog.js`). Resolved by accepting `main`\'s `2026.05.22.5` entry verbatim (Contrast Checker), renumbering this branch\'s factory-gate entries from `2026.05.22.5` to `2026.05.22.6`, and renumbering the vocabulary-tightening entry from `2026.05.22.6` to `2026.05.22.7`. Internal SITE-version references inside the renumbered entries were updated to match. `app.js?v=` bumped to `145` (main consumed `?v=143` for its dynamic-import cache-bust + site-changelog.js import; this branch\'s two changelog touches bump it to `144` then `145`).' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.6 &rarr; 2026.05.22.7. `app.js?v=` bumped because `docs/data/site-changelog.js` changed. Other cache-bust params unchanged. (Originally landed on this branch as `2026.05.22.6`; renumbered to `2026.05.22.7` during merge with `main` per the resolution entry above.)' }
      ]
    },
    {
      version: 'SITE 2026.05.22.8',
      date: '2026-05-22',
      changes: [
        { type: 'added', text: '`.cursor/rules/uds-naming-conventions.mdc` &mdash; new design-system-level naming framework. Locks the canonical vocabulary for the ten categories every UDS component touches: (1) <strong>States</strong> &mdash; the eight standard names (Default, Hover, Pressed, Focus, Selected, Disabled, Loading, Error) plus the two conditional ones (Empty, Read-only) plus the two reserved words (Checked for form controls, Current for navigation); (2) <strong>Sizes</strong> &mdash; a single three-step scale (Small / Medium / Large, <code>sm</code> / <code>md</code> / <code>lg</code>) with the "Size means perceptual scale" carve-out for icon-container and spacer; (3) <strong>Tone</strong> &mdash; Info / Success / Warning / Error plus optional Neutral, no "Danger" as a tone; (4) <strong>Emphasis</strong> &mdash; Primary / Secondary / Tertiary for ranked importance vs Bold / Default / Subtle for tuning loudness against the surface, with a "Ghost is acceptable shorthand for Tertiary" carve-out; (5) <strong>Parts of a component</strong> &mdash; Leading / Trailing for horizontal flanks (RTL-safe), Header / Body / Footer for vertical stacks, Content (or unnamed) for single regions; (6) <strong>State vs Variant vs Property</strong> &mdash; a three-question litmus test (could a user trigger this? &rarr; state; does it change what role the component plays? &rarr; variant; otherwise &rarr; property) with worked examples for the common confusions; (7) <strong>Casing and word choice</strong> &mdash; Title Case in Figma, hyphenated lowercase in code, present tense for actions; (8) <strong>Component naming</strong> &mdash; Title Case with spaces for designer-facing titles, kebab-case ids, "components are distinguished by underlying behavior, not visual difference"; (9) <strong>Subcomponents</strong> &mdash; parent-prefixed names like <code>Stepper / Step</code>, a "would a designer drop this on its own?" litmus test; (10) <strong>Lifecycle status</strong> &mdash; the existing stoplight (Placeholder / Blocked / In Progress / Review / Production / Deprecated) pulled in by reference. Designer-voiced throughout (concepts first, plain English, opinionated, tight). Frontmatter: `description:` enumerates the ten categories; `alwaysApply: false` + `globs: ["**/*"]` matches the activation pattern of <code>uds-design-language.mdc</code> (its visual partner); `lastUpdated: 2026-05-22T19:10:35Z`. Source ranking when picking a name: existing UDS consistency &rarr; web platform vocabulary &rarr; the existing Pressed-vs-Checked-vs-Selected-vs-Current call in <code>uds-design-language.mdc</code> §11 &rarr; convergence across Material / Carbon / Polaris &rarr; designer judgment as tiebreaker.' },
        { type: 'changed', text: '`.cursor/skills/generate-uds-figma-component/SKILL.md` &mdash; three targeted edits to point the factory at the new naming framework instead of leaving names to inheritance from siblings. (a) Added <code>uds-naming-conventions.mdc</code> to the Mandatory rules list at the top of the skill alongside <code>uds-figma-preflight</code>, <code>uds-figma-write-safety</code>, <code>uds-token-architecture</code>, <code>uds-source-of-truth</code>, <code>uds-rule-discipline</code>, and <code>uds-master-preflight</code>. The new entry explicitly enumerates which framework section maps to which Phase A model decision (sections 1+6 for states, 3+4+6 for variant axes, 2 for sizes, 5 for regions, 7 for casing, 8+9 for component/subcomponent names). (b) Phase A "Variant axes" bullet rewritten to source axis names and values from the framework rather than from sibling inheritance; the previous "UDS does not have a standardized variant vocabulary" caveat (which linked to <code>plans/uds-component-factory.md#12-open-risks</code>) is replaced with positive guidance ("Don\'t inherit a sibling\'s name if the sibling disagrees with the framework &mdash; the framework wins"). (c) Phase A "State matrix" bullet rewritten the same way &mdash; previously enumerated states inline ("default, hover, active/pressed, focus-visible, disabled, selected, error, loading, empty") which had its own internal inconsistencies (active/pressed mixed, focus-visible not Focus, no Read-only); now points at framework section 1 as the source of truth and calls out the Checked / Current reserved-word distinction. (d) Phase B.2 "Use clean variant properties using the agreed vocabulary" line rewritten to specify exactly what "agreed vocabulary" means &mdash; Title Case in Figma (section 7), canonical names from sections 1-4, with a "fix the Phase A model before Phase B rather than encoding drift into Figma" clause for the case where the model picked an out-of-framework name. Frontmatter `lastUpdated:` bumped 2026-05-22T18:39:47Z &rarr; 2026-05-22T19:10:35Z.' },
        { type: 'changed', text: '`.cursor/skills/new-component/SKILL.md` &mdash; added a "Naming source of truth" section between the intro paragraph and Step 1. Enumerates which framework section governs which field of the scaffolded <code>spec.json</code>: `component` &rarr; section 8 (kebab-case), `title` &rarr; section 8 (Title Case with spaces), `states[]` &rarr; section 1 (the eight standards plus the two conditionals plus the Checked / Current reservation), `props[]` for size &rarr; section 2, `props[]` for tone / emphasis / regions &rarr; sections 3 / 4 / 5, `events[]` &rarr; section 7 (present tense). The rule for the skill itself: "When this skill fills the template with placeholders, the placeholders should look like the framework\'s vocabulary so the designer\'s first real edit is \'add the details,\' not \'rename half of these.\'" Frontmatter `lastUpdated:` bumped 2026-05-21T18:15:30Z &rarr; 2026-05-22T19:10:35Z.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; new row added in the Glob-scoped rules table for <code>uds-naming-conventions</code>, positioned immediately after <code>uds-design-language</code> since the two are paired (design-language covers <em>how things look</em> per state, naming-conventions covers <em>what we call them</em>; both glob `**/*`). The row\'s description summarizes all ten categories the framework covers and explicitly calls out the companion relationship with <code>uds-design-language</code>. Section heading "Glob-scoped (12 rules)" updated to "Glob-scoped (13 rules)". "Active Rules" intro updated from "14 rules" (stale; the page already enumerated 20) to "21 rules" reflecting the actual total after the addition.' },
        { type: 'changed', text: '`.cursor/TOOLCHAIN.md` regenerated. Counts updated: 20 rules &rarr; 21 rules (the new `uds-naming-conventions` entry); 9 skills (the two skill `lastUpdated:` bumps don\'t change the count, just the dates); 7 agents (unchanged). Total 37 entries &mdash; up from 36.' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.7 &rarr; 2026.05.22.8. `app.js?v=` bumped 145 &rarr; 146 because `docs/data/site-changelog.js` changed. Other cache-bust params unchanged &mdash; `site.css?v=`, `uds.css?v=`, `uds.js?v=`, and `demo-builder/index.js?v=` all stay where they are because no underlying file changed; the new rule landed in `.cursor/` and the cursor-workflows page is cache-busted via the runtime fetch helper rather than a `?v=` query.' }
      ]
    }
];

