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
    }
];

