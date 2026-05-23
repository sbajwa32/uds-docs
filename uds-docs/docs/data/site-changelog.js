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
        { type: 'changed', text: 'Pivoted to a design-to-engineering handoff spec — Storybook will handle React/Vue component implementations going forward.' },
        { type: 'removed', text: 'All React/Vue code generation stripped from Playgrounds, Code tabs, Implementation Reference, and Demo Builder. The doc site shows vanilla HTML/CSS/JS only now.' },
        { type: 'removed', text: 'Framework selector bar removed from component pages.' },
        { type: 'removed', text: 'Demo Builder simplified to vanilla HTML only. Vite ZIP scaffolds for React/Vue removed.' },
        { type: 'removed', text: 'Old versions/0.1/ snapshot deleted — fresh start for the next release.' }
      ]
    },
    {
      version: 'SITE 2026.04.21.2',
      date: '2026-04-21',
      changes: [
        { type: 'changed', text: 'Per-component spec content moved from hand-coded HTML into JSON files (content/*.json) with a schema and a client-side renderer.' },
        { type: 'added', text: 'content/schema.json — JSON schema for per-component spec data (description, props, events, slots, states, accessibility, owner).' },
        { type: 'added', text: 'content/<component>.json — 21 initial files populated from existing Usage content.' },
        { type: 'added', text: 'Guidelines tab (renamed from Usage) renders from JSON. Empty sections are hidden automatically.' },
        { type: 'added', text: 'Spec completeness indicator: "Spec X/Y" pill next to each component title plus a colored dot in the sidebar (green ≥80%, yellow 50–80%, red <50%).' }
      ]
    },
    {
      version: 'SITE 2026.04.28.1',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: '"View in Storybook" button on every component page (placeholder URL until Storybook is live).' },
        { type: 'added', text: '"Report Issue" button — opens a GitHub issue template prefilled with component context.' },
        { type: 'added', text: '"Not production-ready" banner on any component whose status is not Production.' },
        { type: 'added', text: '"Last updated" collapsible box at the top of every component page showing the last few changelog entries.' },
        { type: 'added', text: '"Example only" banner on Examples / Code / Playground tabs — reminder that this site is reference, Storybook is production.' },
        { type: 'changed', text: 'Figma button now reads "Figma (variant)" when a per-variant node ID is present in the spec.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.2',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Composition Recipes page — curated multi-component patterns (Modal form, Searchable data table, Settings panel, App shell).' },
        { type: 'added', text: 'Layout Templates page — starter page structures (App shell, Settings, Data browsing, Marketing landing).' },
        { type: 'added', text: 'Glossary page — UDS terminology reference.' },
        { type: 'added', text: 'FAQ page covering theming, tokens, requests, and versioning.' },
        { type: 'added', text: 'How to Contribute page — workflow for designers proposing new components, plus draft and editing guidance.' },
        { type: 'added', text: 'Roadmap page — foundation prerequisites, auto-rendered components table, and site-feature roadmap.' },
        { type: 'added', text: 'Platform Support page — browser compatibility, performance baseline, web component lifecycle, SSR notes.' },
        { type: 'added', text: 'Migration Guides page — per-version upgrade notes, starting with 0.1 → 0.2.' },
        { type: 'changed', text: 'Sidebar reorganized to add Patterns and Reference groups at the bottom.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.3',
      date: '2026-04-28',
      changes: [
        { type: 'added', text: 'Token search modal — open with / or Cmd/Ctrl+K. Indexes every --uds-* token, fuzzy-matches name and value, click a result to copy var(--name) to the clipboard.' },
        { type: 'added', text: 'Draft mode — set "draft": true on a component\'s spec to hide it from production. Append ?draft=1 to any URL to view drafts with a watermark.' },
        { type: 'added', text: 'Realistic-data examples on data-consuming components (Data Table, List, Dropdown, Search, Breadcrumb) — tiny / large / long-content / empty / loading-state previews so you can see how each component handles real content.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.4',
      date: '2026-04-28',
      changes: [
        { type: 'changed', text: 'AI context, Cursor rules, pre-flight, and Getting Started updated for the doc-site-as-spec model — every reference to React/Vue boilerplate now points at Storybook for production code.' },
        { type: 'removed', text: 'Cursor rule uds-framework-code-quality.mdc — the banned React/Vue patterns it covered no longer apply.' },
        { type: 'added', text: 'New Cursor rule uds-content-schema.mdc — enforces JSON-driven spec editing so component HTML stays out of index.html.' },
        { type: 'changed', text: 'Pre-flight dialog: "Sample Code Standards" section replaced with "Content Schema".' },
        { type: 'changed', text: 'Getting Started rewritten around the two-layer architecture (tokens + Storybook web components). Per-framework setup, React/Vue snippets, and the Framework Patterns tab are gone.' }
      ]
    },
    {
      version: 'SITE 2026.04.28.5',
      date: '2026-04-28',
      changes: [
        { type: 'changed', text: 'Final cleanup of the design-spec pivot: uds/package.json description now reflects the tokens-only scope (with a pointer to Storybook for components), and the stale "(React/Vue)" labels left in headings and copy are gone.' }
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
        { type: 'fixed', text: 'Corrected a non-existent border token reference (`--uds-color-border-default`) to the real token (`--uds-color-border-primary`) in the Cursor rule and six places in index.html. Borders that had been silently failing now render.' },
        { type: 'fixed', text: 'Button Implementation Reference markup used a non-existent `data-icon-position="leading"` attribute; switched to the real `data-leading-icon` and added an icon-only variant. Copy-pasting from Code tab now produces correct icon spacing.' },
        { type: 'fixed', text: 'Added the standard `?v=` cache-bust to the material-icons.js script tag, lining up with the rest of the site\'s cache discipline.' },
        { type: 'fixed', text: 'Roadmap site-features list: Token search marked Shipped (it landed earlier the same week).' },
        { type: 'fixed', text: 'Demo Builder header comment in demo-builder.js no longer claims React/Vue live previews.' },
        { type: 'fixed', text: 'Text-styles demo no longer hardcodes a hex color — now uses the secondary-text and xs-size tokens. Dogfooding fix.' },
        { type: 'changed', text: 'Demo Builder header tooltip clarified to "Build a multi-component HTML demo".' },
        { type: 'added', text: 'Spec X/22 pill on each component page is now a clickable popover that lists exactly which fields are filled and which are missing, explains what the deferred motion/responsive fields are, and links to the source spec file.' },
        { type: 'changed', text: 'Removed all leftover static Guidelines HTML from component pages. The Guidelines tab is now rendered exclusively from each component\'s spec JSON, matching the uds-content-schema rule.' },
        { type: 'removed', text: 'Stripped ~114 lines of dead `react: function () {}` and `vue: function () {}` properties from the Implementation Reference data — nothing read them once the design-spec pivot landed.' },
        { type: 'changed', text: 'Removed the per-component `cssFile` field; the Implementation Reference now reads each component\'s CSS path from its spec JSON, so there\'s a single source of truth.' }
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
        { type: 'changed', text: 'Spec audit follow-up: filled in nine component specs (badge, divider, icon-wrapper, spacer, button, text-input, dropdown, data-table, dialog) with props, events, slots, states, accessibility, do/don\'ts, and commonly-paired-with — derived from the existing CSS and examples. Average completeness across the nine jumped from 22% to 80%+, and the four decorative primitives now document their non-interactive a11y model explicitly so screen-reader audits can verify coverage.' },
        { type: 'fixed', text: 'Guidelines tab no longer parses literal HTML tag names as live elements. Spec prose, the Acceptance Criteria checklist, and the prop/event/slot code cells all switched from innerHTML to textContent + the existing escape helper, so a spec that mentions `<input>` or `<button>` no longer ended up rendering one inline.' },
        { type: 'fixed', text: 'bump-site.sh now uses portable sed flags so it works on both macOS and Linux Cloud Agent VMs.' }
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
        { type: 'changed', text: 'Figma workflows now treat any Figma page whose name contains `{Ignore}` as out of scope — every read-only inspector and every sync skill skips those pages. The convention is documented on the Cursor Workflows page.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.1',
      date: '2026-05-07',
      changes: [
        { type: 'changed', text: 'Figma read-only agents no longer set `readonly: true` in their frontmatter. They\'re still read-only by instruction, but Cloud Agents need MCP tool access to actually read Figma files.' }
      ]
    },
    {
      version: 'SITE 2026.05.07.2',
      date: '2026-05-07',
      changes: [
        { type: 'added', text: 'UDS 0.3 release sync from Figma — archived 0.2 under versions/0.2/, added the `--uds-color-icon-destructive` semantic token, and scaffolded eight public Figma component pages (combobox, date-picker, data-view, label, link, pagination, text-area, toggle). Internal support pages stayed out of public docs.' },
        { type: 'fixed', text: 'release.sh and bump.sh now use portable sed flags on macOS and Linux. bump.sh also keeps version.txt and the inline SITE_VERSION in sync so release bumps don\'t leave the auto-reload metadata stale.' }
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
        { type: 'fixed', text: 'UDS 0.3 verification pass: filled in figmaNodeId for sixteen components that previously fell back to a page-level link. The "View in Figma" button on those component pages now deep-links to the actual component set. button, data-table, text-input, and tooltip are intentionally still null — Figma has no single canonical set for those.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.2',
      date: '2026-05-08',
      changes: [
        { type: 'changed', text: 'Status segmented bar on each component page now uses stoplight-mapped surface tokens — black for Not Started, red for Blocked, orange for In Progress, yellow for In Review, green for Production. Completed steps render as a subtle "passed-through" treatment.' },
        { type: 'changed', text: 'Spec segmented bar uses surface-success for filled segments and surface-warning-subtle for unfilled. The same colors apply to the mini bars inside the sidebar tooltip.' },
        { type: 'fixed', text: 'Demo Builder: removed an orphan udc-nav-logo__text reference left over from the icon-only logo refactor.' },
        { type: 'added', text: 'New scripts/audit-demo-builder.sh polices drift between the Demo Builder and the rest of the site — every implementable component is in the demo data, and every udc-* class the Demo Builder emits is defined somewhere in uds/components/*.css. Wired into the uds-updated skill\'s verification step.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.3',
      date: '2026-05-08',
      changes: [
        { type: 'added', text: 'New layer tokens in uds/tokens/layers.css define a 10-step z-index scale (base / sticky / decoration / dropdown / header / overlay / modal / popover / tooltip / toast / skip-link). Tooltips intentionally sit above modals because a tooltip can be triggered from a button inside a modal.' },
        { type: 'changed', text: 'Every hardcoded z-index across the codebase replaced with the new layer tokens. No more ad-hoc values.' },
        { type: 'fixed', text: 'Sidebar component tooltip is now portaled to body so the sidebar\'s sticky stacking context can\'t paint it under the main content. It also auto-hides when the sidebar scrolls.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.4',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'Sidebar tooltip was rendering off-screen after the portal refactor — the portal element inherited a high-specificity right-position rule from `.udc-tooltip[data-position="right"]`. Dropped data-position on the portaled tooltip; it now positions correctly.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.5',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'Component-name pills on the changelog page were rendering as nearly-empty rectangles. The secondary badge variant was pairing surface-bold with text-inverse (white-on-light-gray, ~1:1 contrast). Swapped to text-primary; contrast jumps past 9.7:1 on both themes. The colored badge variants (info/success/error/warning) still use text-inverse — their surfaces are saturated enough for white text.' },
        { type: 'fixed', text: 'SITE_CHANGELOG entries were appearing in the wrong order. AGENTS.md was telling agents to put newest entries first in the array, but the renderer reverses on display — so newest needs to be last. Fixed AGENTS.md and reordered the four 2026.05.08.* entries chronologically.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.6',
      date: '2026-05-08',
      changes: [
        { type: 'changed', text: 'Demo Builder previews are no longer static. Every Build seeds a small RNG and rolls fresh content from realistic property-management data pools — tenant names, properties, lease and payment messages — plus per-component state variation (which tab is selected, which radio is checked, sort direction, pagination, search-query state, occasional error, occasional disabled item, varying item counts). Layout structure stays the same; only the contents and states vary.' },
        { type: 'added', text: 'Preview overlay toolbar gets a "Refresh data" button that re-rolls the iframe contents in place with a new seed. Doesn\'t pollute build history; just swaps the iframe srcdoc so scroll position resets cleanly.' },
        { type: 'added', text: 'Toolbar buttons get Material Symbol icons (refresh, download, close) for clearer affordance.' }
      ]
    },
    {
      version: 'SITE 2026.05.08.7',
      date: '2026-05-08',
      changes: [
        { type: 'fixed', text: 'Demo Builder\'s nav-header template was missing the bento brand dropdown, the center search slot, and the My Work / account cluster — just a logo and two ghost buttons in an empty bar. Rewrote the template to match the canonical pattern shown on the Nav Header component page.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.1',
      date: '2026-05-09',
      changes: [
        { type: 'changed', text: 'Per-component file restructure: the long-running global tables in app.js (FIGMA_LINKS, COMPONENT_STATUS, IMPL_DATA, JS_FUNC_TO_FILE, the ~98 KB PLAYGROUNDS literal) are gone. Each component now owns its own files in uds/components/<id>/ — spec.json (with figmaNodeId and figmaPageNodeId), status.json, impl.json, and playground.js as a dynamically-imported ES module. New manifest at uds/components.json drives the boot map; aggregate-components.sh regenerates it. Net effect: app.js shrinks from ~5,200 to ~2,980 lines, and every component\'s data is co-located.' },
        { type: 'added', text: 'New manifest uds/components.json lists every component in the current release in display order (earliest version first, alphabetical tiebreak). Schema lives next to it.' },
        { type: 'fixed', text: 'Behavior tab no longer 404s — JS_FUNC_TO_FILE had stale pre-restructure paths. Now reads from each component\'s impl.json.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.2',
      date: '2026-05-09',
      changes: [
        { type: 'added', text: 'Version-aware UDS data routing. Selecting a historical UDS version from the version dropdown no longer navigates to a frozen full-site snapshot; it sets ?uds=X.Y on the URL and the live docs site re-renders the archive. Bug fixes to docs UI now flow automatically to historical views; only the UDS data itself is frozen per release.' },
        { type: 'changed', text: 'Old versions/0.2/ snapshot retroactively converted to UDS-only — every component, schema, and token, plus the components manifest and version.json. The frozen index.html / app.js / etc. are gone. ~2 MB saved per archived version going forward.' },
        { type: 'added', text: 'New udsResolve(path) helper in docs/helpers/uds-path.js returns a fetchable URL routed through the viewing version. Sibling helpers viewingVersion(), isViewingHistorical(), and currentVersion() let any module check the routing state.' },
        { type: 'added', text: 'Archive-view banner appears at the top of every page when ?uds=X.Y is set. One-click return to live. Pre-flight and Build Demo buttons dim in archive view since they only run against the live UDS.' },
        { type: 'added', text: 'Playground tab is hidden in archive view — historical snapshots don\'t carry playground.js modules.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.3',
      date: '2026-05-09',
      changes: [
        { type: 'changed', text: 'Token Search modal extracted from app.js into docs/modules/token-search/. Self-contained ES module wired up via a single import.' },
        { type: 'changed', text: 'Playground engine extracted from app.js into docs/modules/playground/ as a factory module. createPlaygroundEngine(ctx) takes its DOM helper deps via a context object so the engine stays decoupled without forcing extraction of every transitive helper.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.4',
      date: '2026-05-09',
      changes: [
        { type: 'fixed', text: 'Site-wide accessibility pass on Base Light: WCAG color-contrast violations dropped from 308 nodes to 3 (the remaining three are timing-related edge cases on the archive-view fragment loader). The fixes are at the token layer where possible so every consumer benefits, not just the docs site.' },
        { type: 'changed', text: 'Bumped six semantic color tokens in semantic.css so text/surface combinations clear WCAG AA. text-secondary, text-info, text-warning, text-success, surface-success, surface-error, surface-warning, surface-info, and surface-interactive-red all moved one step within the same color family — visual identity preserved, contrast lifted comfortably above 4.5:1.' },
        { type: 'fixed', text: 'ARIA cleanup: added role="tab" to every page-tab button so the sg-page-tabs tablists pass aria-required-children. Switched aria-selected to aria-current="page" on nav-button / nav-tile examples (the WCAG-correct attribute for a navigation item), and to aria-pressed on the button "selected" example (the right pattern for a toggle button). Old attributes still styled in CSS for backward compat.' },
        { type: 'changed', text: 'Header brand bar text opacity bumped from 0.5–0.7 to 0.95 so subtitle, version, and build text pass WCAG AA against the blue brand background. Search trigger background switched from a light overlay to a dark overlay; white text now sits at ~7.9:1.' },
        { type: 'changed', text: 'Button color overrides (success / warning / neutral) switched from primitive-token references to semantic tokens — the audit-token-usage rule no longer flags the button.' },
        { type: 'changed', text: 'Site-CSS section labels (.sg-theme-bar-label, .sg-sidebar-heading) switched from text-secondary to text-primary. Even with the bumped text-secondary they sat right at the AA threshold on subtle surfaces; text-primary clears 10:1.' }
      ]
    },
    {
      version: 'SITE 2026.05.09.5',
      date: '2026-05-09',
      changes: [
        { type: 'fixed', text: 'Multi-theme accessibility audit. The previous pass only verified Base Light; cross-theme scanning surfaced 297 more contrast failures across Base Dark, ResMan Dark, AnyoneHome Light, and Inhabit Light. Token-level fixes brought all six theme combinations × seven representative pages (42 combos) to zero violations.' },
        { type: 'changed', text: 'Dark-mode status text tokens (text-info, text-warning, text-success, text-error) bumped one step lighter so they clear AA on dark subtle surfaces. The cluster sat right under threshold; the new values land above 6:1 across the board.' },
        { type: 'changed', text: 'AnyoneHome (emerald) and Inhabit (amber) brand-accent surfaces bumped one step darker so white text on the primary action passes AA. The accent is still recognizably emerald and amber, just deeper. Hover and active levels move with it so the visual hierarchy is preserved.' },
        { type: 'fixed', text: 'Header search-trigger kbd shortcuts (/ and ⌘K) now use a fixed near-white instead of text-inverse. text-inverse flips with the theme, but the kbd has its own dark overlay that doesn\'t — dark-on-dark in dark mode dropped to 2.45:1. Theme-invariant text is correct here.' },
        { type: 'added', text: 'New scripts/audit-theme-contrast.sh runs axe-core against all six theme combinations on seven representative pages. Wired into CI as its own job; future theme-specific contrast regressions show up before they ship.' }
      ]
    },
    {
      version: 'SITE 2026.05.10.1',
      date: '2026-05-10',
      changes: [
        { type: 'added', text: 'New sidebar category "UDS Tools" with its first tool: a Contrast Checker at #/contrast-checker. It evaluates every text, icon, and border token against every surface token, computes the WCAG ratio live from the resolved CSS variables, and re-renders whenever the theme bar flips so you can validate pairings across all six theme combinations without leaving the page.' },
        { type: 'added', text: 'The Contrast Checker uses kind-aware WCAG thresholds — text foregrounds follow SC 1.4.3 (4.5:1 AA, 7:1 AAA, 3:1 large text), icons and borders follow SC 1.4.11 Non-text Contrast (3:1 AA). Transparent tokens are tagged "N/A"; intentionally-low-contrast disabled tokens are tagged "by design" so they don\'t read as bugs.' },
        { type: 'added', text: 'Layout has three sections: hand-curated recommended pairings, an interactive picker (by surface or by foreground, filterable by kind), and a full surface × foreground matrix with sticky headers and kind-aware cell rendering.' }
      ]
    },
    {
      version: 'SITE 2026.05.10.2',
      date: '2026-05-10',
      changes: [
        { type: 'fixed', text: 'Universal site cache-bypass. The inline auto-reload loader in index.html used to call window.location.reload() on version mismatch, but modern browsers serve index.html from HTTP cache anyway (GitHub Pages defaults to a ~10-minute TTL on HTML). Tabs could get stuck on a stale SPA shell after a deploy with no way out short of a manual hard refresh. The loader now navigates to a new query-string URL via location.replace(), which forces a network revalidate; every fresh deploy reaches every open tab within ~60 seconds. A one-per-minute cooldown prevents a misconfigured deploy from trapping a tab in a redirect spiral.' },
        { type: 'fixed', text: 'Runtime fetches now auto-version-stamp. Previously only the static script and link tags in index.html carried ?v=N cache-busters; every runtime fetch (page fragments, per-component JSON, examples HTML, playground modules, version manifests) had no cache-buster and could sit in the HTTP cache indefinitely. The inline bypass script now monkey-patches window.fetch to auto-append ?v=<SITE_VERSION> to same-origin relative URLs. Absolute URLs and URLs that already carry a cache-buster pass through untouched.' }
      ]
    },
    {
      version: 'SITE 2026.05.11.1',
      date: '2026-05-11',
      changes: [
        { type: 'removed', text: 'Reverted the unauthorized design-system edits a previous agent applied during the repo restructure — about 38 semantic token value bumps and a button.css primitive→semantic swap, all aimed at clearing axe-core contrast violations. Both layers restored to the UDS 0.3 release state so Figma and code agree again. Known trade-off: the contrast failures Phase 16/17 was masking are now visible again as a documented issue (white text on the AnyoneHome and Inhabit primary actions falls below AA, plus a few light-mode status-on-subtle pairings). Four candidate fix paths are laid out in PR #7; the theme-contrast audit will fail until that conversation lands, on purpose.' },
        { type: 'added', text: 'New always-on rule .cursor/rules/uds-source-of-truth.mdc — uds-docs/uds/ is Figma-as-source-of-truth across every file kind (tokens, component CSS, specs, examples, status, schemas). Agents must not autonomously modify anything under that path in response to audit findings or any other code-detected concern; findings get reported, not applied. The only authorized write paths are the named Figma-sync skills, each requiring explicit user direction. Closes the structural gap that allowed the Phase 16/17 overreach.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.1',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Nav Header figmaNodeId corrected. The spec was pointing at the bento sub-component instead of the canonical header component set, so "Open in Figma" deep links from the Nav Header docs page were landing on the wrong node. Repointed to the actual nav-header set.' },
        { type: 'added', text: 'Nav Header spec populated from a deep Figma inspection: props (showSearch, showMyWork — both booleans the Figma set exposes), events (bento-toggle, bento-dismiss), slots for the brand / bento / center / actions / account regions plus the bento dropdown\'s tiles / list / footer, states (default and bento-open), the components nav-header is commonly paired with, and eight acceptance criteria derivable from the anatomy and keyboard model. All additions are additive — no existing non-empty field was overwritten.' },
        { type: 'added', text: 'Nav Header accessibility entries filled in. Screen-reader notes cover the banner landmark, the aria-expanded / aria-haspopup contract on the bento trigger, aria-label expectations on icon-only ghost buttons, and the badge-count name pattern for My Work. WCAG criteria 1.3.1, 1.4.3, 2.1.1, 2.4.7, and 4.1.2 each got a how-met statement. Per-theme contrast measurements deferred until the upstream contrast conversation lands.' },
        { type: 'added', text: 'Nav Header knownIssues now lists twelve Figma↔code divergences the inspector turned up but that aren\'t being auto-applied. Notable items: chevron color, nav-tile font size and background, bento footer typography, bento icon size, the logo-glyph mismatch, missing dividers in the bento dropdown, missing aria-labels in the default example, Escape-while-open not closing the panel, and a couple of Figma-side authoring errors that hold the page at the red blocked status.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.2',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'The "component set has errors" message previously attributed to nav-header actually originates from udc-badge — the My Work pill nests a badge instance, so the badge\'s authoring errors surface during nav-header inspection. The knownIssues text now reflects the right attribution. The nav-header page stays at the red blocked status thanks to the remaining issues.' },
        { type: 'added', text: 'Documented the Figma sub-component rename `_udc-nav-header_bentobutton` → `_udc-nav-header_title-area` (id preserved; every variant, property, and binding preserved). The doc site intentionally keeps the `bento-button` / `bento-toggle` / `bento-dismiss` vocabulary for now because the canonical anatomy still uses the same pill — mirroring the rename in code is a future contract change.' },
        { type: 'added', text: 'Documented the Title Only=True variant on the trigger pill — a 132×48 transparent pill with xl-bold text, no leading icon, no chevron. The doc site\'s canonical anatomy doesn\'t expose this variant yet; surfacing it would mean a titleOnly boolean on the public nav-header API.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.3',
      date: '2026-05-12',
      changes: [
        { type: 'changed', text: 'Nav Header trigger pill renamed in code to mirror the Figma rename `_udc-nav-header_bentobutton` → `_udc-nav-header_title-area`. The bento-button CSS classes, JS query selectors, examples, impl reference, playground render, the API table in index.html, and the spec\'s slot name all switched. The dropdown panel itself intentionally keeps the bento vocabulary in code — that sub-component wasn\'t renamed in Figma.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.4',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Nav Header — chevron color now binds icon-primary (matches Figma) instead of icon-secondary. Removes the long-running color drift on the trigger glyph.' },
        { type: 'fixed', text: 'Nav Header — trigger icon size now binds the 2xl font-size token (24 px) instead of a hardcoded 20px. Matches Figma\'s 24px icon-wrapper on every leading-icon and chevron position.' },
        { type: 'fixed', text: 'Nav Header — bento dropdown shadow now binds depth-300 (matches Figma\'s elevation system). The legacy --uds-shadow-bento token stays in semantic.css for now; removing it is a separate Figma-side decision.' },
        { type: 'fixed', text: 'Nav Header — bento dropdown footer now binds the sm font-size + text-primary, matching Figma\'s "Customize menu" treatment. Was 14px + text-interactive.' },
        { type: 'fixed', text: 'Nav Header — nav-tile font size now binds the sm token (12 px), matching Figma\'s label/sm-medium style. Was a hardcoded 10px literal that also violated the token-usage audit.' },
        { type: 'fixed', text: 'Nav Header — nav-tile background and foreground now match Figma\'s two-state anatomy. Default state is transparent with blue text and icon; selected state (aria-current="page") is filled blue with white text. Hover bindings split per state. Was always rendering as filled blue.' },
        { type: 'added', text: 'Nav Header — Title-Only variant exposed in code. A new data-title-only="true" attribute on the trigger pill renders the Figma "Title Only=True" anatomy (transparent fill, no border, no shadow, no leading icon, no chevron, xl-bold text). Spec gets a titleOnly boolean prop and a title-only state; playground gets a checkbox; new examples/title-only.html.' },
        { type: 'fixed', text: 'Nav Header — Escape now closes the bento dropdown from anywhere, not just when focus is on the trigger. The handler moved to document level and gates on the panel\'s open state.' },
        { type: 'fixed', text: 'Nav Header — examples/default.html now sets aria-label on the three icon-only ghost buttons in the account-actions pill (Notifications / Settings / Account). Closes a WCAG 4.1.2 gap in the most-shown example.' },
        { type: 'fixed', text: 'Nav Header — bento dropdown markup now renders the dividers Figma shows between tiles, list, and footer. Examples and playground render both updated.' },
        { type: 'changed', text: 'Nav Header knownIssues reduced from 14 entries to 3. Eleven Figma-drift items resolved in code; the three that remain are blocked on Figma-side work (the udc-badge authoring errors, the logo SVG export, and the max-width token import).' }
      ]
    },
    {
      version: 'SITE 2026.05.12.5',
      date: '2026-05-12',
      changes: [
        { type: 'added', text: 'Nav Header per-component changelog populated with thirteen 0.3 entries covering the recent sync round (the figmaNodeId correction, the spec sync, the bento-button → title-area rename, ten Figma-aligned drift fixes, and the Title-Only variant). Closes the gap where major nav-header behavior changes had landed without per-component changelog history.' },
        { type: 'fixed', text: 'Page-chrome drift class eliminated. Every component-page block in index.html had been carrying its own hardcoded `<h1>` title and `<p>` description while the spec also held a title and description — and the two sources drifted (nav-header was still showing "bento dropdown for app switching" in the chrome after the rename). The hardcoded text is gone; the chrome now binds from spec.json on first fetch. The spec is the sole source of truth for component title and description.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.6',
      date: '2026-05-12',
      changes: [
        { type: 'changed', text: 'Agent toolchain refresh: rewrote the four sync skills (sync-figma-component-status, sync-figma-release-notes, link-figma-nodes, sync-figma-component-spec) to target the current per-component file layout. Two stale rule files corrected, the figma-component-card rule got proper frontmatter, and three subagent definitions had broken file paths fixed.' },
        { type: 'added', text: 'Four new CI audits gate per-component changes: changelog-currency (every source-file change has a changelog entry), aggregate-currency (the aggregated CHANGELOG.json and components.json don\'t drift from per-component sources), figma-sync-state-currency (each component\'s figmaNodeId matches the snapshot), and css-api-table (the API table in index.html doesn\'t drift from the component\'s actual classes). Together they hard-block the failure modes that produced the nav-header drift in the previous round.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.7',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'PR2 hotfix: audit-baseline.json moved from .cursor/ to scripts/. The .gitignore allowlist for .cursor/ only covers a few specific subdirectories, so a top-level .cursor/audit-baseline.json was silently ignored and never committed. The audits that read it now point at the new path.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.8',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Cursor Workflows page refreshed end-to-end to match the post-PR2 agent toolchain. The page had drifted: stale rule counts, references to the long-gone content/<id>.json directory, references to the deleted COMPONENT_STATUS table, and missing rows for the figma-component-card skill, the figma-component-card-audit subagent, and several new audits.' },
        { type: 'added', text: 'Cursor Workflows page reorganized into four kinds of guidance (Rules, Skills, Subagents, Audits) with rules split into Always-on vs Glob-scoped and skills split into Orchestrators vs Specialist sync skills. New "Baselines and exemptions" subsection documents the audit baseline file.' },
        { type: 'added', text: 'Four inline workflow diagrams on the Cursor Workflows page covering the major end-to-end flows — UDS version release, mid-release component sync, adding a new component, and a single-component edit — each as a numbered step chain with a summary of every file that changes.' },
        { type: 'added', text: 'New CI audit scripts/audit-agent-docs-currency.sh cross-checks every rule, skill, and subagent file against references on the Cursor Workflows page; fails when a file exists but isn\'t documented (or the page references a deleted file). Brings the total CI audit count to nine.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.9',
      date: '2026-05-12',
      changes: [
        { type: 'added', text: 'New sessionStart Cursor hook at .cursor/hooks/sync-check.sh fetches origin/main at the start of every session and warns the agent if the local branch is behind, with the recommended pull command. Closes a real cloud-vs-local drift class — agents had been working from stale rule files without realizing it. A "Verify sync state" phase prepended to the master preflight rule covers the case where the hook didn\'t fire.' },
        { type: 'added', text: 'Every rule, skill, and subagent file under .cursor/ now carries a lastUpdated date stamp in its YAML frontmatter, seeded from git mtime. The agent gets an in-context signal of how fresh each artifact is without having to run `git log`.' },
        { type: 'added', text: 'New top-level inventory at .cursor/TOOLCHAIN.md lists every rule, skill, and subagent in three tables with their lastUpdated date and a short description. The agent-toolchain equivalent of SITE_CHANGELOG.' },
        { type: 'added', text: 'New glob-scoped rule .cursor/rules/uds-rule-discipline.mdc auto-attaches whenever an agent edits a file under .cursor/rules/, .cursor/skills/, or .cursor/agents/ and reminds it to bump lastUpdated and refresh the TOOLCHAIN row.' }
      ]
    },
    {
      version: 'SITE 2026.05.12.10',
      date: '2026-05-12',
      changes: [
        { type: 'changed', text: 'Toolchain lastUpdated stamps upgraded from date-only to full ISO 8601 UTC across every rule, skill, and subagent file. Date-only stamps lost information when a file was edited more than once in a day; the full timestamp matches the precedent already set by .cursor/figma/state/last-sync.json. The currency audit still compares dates only, so sub-day skew between a bump and the resulting commit doesn\'t false-positive.' },
        { type: 'added', text: 'New tracked script scripts/regenerate-toolchain.sh deterministically rebuilds .cursor/TOOLCHAIN.md from the frontmatter of every rule, skill, and subagent file. Replaces the unreproducible inline script that originally generated the index. Hand-editing the tables is discouraged now — the generator overwrites.' },
        { type: 'added', text: 'New CI audit scripts/audit-toolchain-currency.sh runs three checks: every file\'s lastUpdated is at least as recent (date-only) as the file\'s git mtime; every file has a row in TOOLCHAIN.md; and every row\'s date matches the source file. Catches the three drift modes the previous round had to police by hand.' },
        { type: 'changed', text: 'uds-master-preflight workflow renumbered from Phase -1 / 0 / 1 / 2 / 3 to Phase 1 / 2 / 3 / 4 / 5. The negative phase was a kludge introduced when the sync-check was prepended; renumbering removes the smell. Title updated to "SYNC FIRST — Source-of-truth check — BUMP — Change — Finalize" to match the new order.' },
        { type: 'changed', text: '.cursor/hooks/sync-check.sh now also writes a canonical state file at .cursor/state/sync-status.json so the rule can read sync status from disk instead of relying solely on the additional_context injection (which has had inconsistent reliability across Cursor versions).' }
      ]
    },
    {
      version: 'SITE 2026.05.12.11',
      date: '2026-05-12',
      changes: [
        { type: 'fixed', text: 'Token T-1: --uds-color-text-secondary in dark mode now points at neutral-60-M instead of neutral-70 to match Figma. Improves dark-mode text-secondary on surface-main contrast from ~2.6:1 to ~4.3:1 (still below AA 4.5:1, but a meaningful move). The only token-value drift across the entire token set on this dry-run.' },
        { type: 'fixed', text: 'Nav Header — three CSS micro-alignments to Figma: title-area title-only variant gets the matching xl line-height to pair with its xl font-size; bento dropdown padding-bottom widened to match Figma; bento footer gets the matching sm line-height to pair with its sm font-size.' },
        { type: 'changed', text: 'Nav Vertical — spec props and states populated from a deep Figma inspection that the previous quick-look pass had left blank. New leadingIcons boolean prop, and the five states the underlying list-item exposes (default, hover, active, selected, focused). Disabled exists in code but isn\'t in Figma — left out of states intentionally and surfaced as an open question.' },
        { type: 'fixed', text: 'scripts/lib/restructure_lib.py: replaced Python 3.10+ union syntax (str | None) with Optional[str] so the audits that import it run on macOS systems with stock Python 3.9 instead of crashing.' },
        { type: 'changed', text: 'Surfaced twelve open design questions from the nav-header and nav-vertical inspections that need designer input before any further apply — bento footer color, nav-tile structure, nav-tile font size, nav-vertical container chrome, item heights, focused-state radius, the Disabled state mismatch, and a few more. Captured in the relevant component knownIssues until the conversation lands.' }
      ]
    },
    {
      version: 'SITE 2026.05.13.1',
      date: '2026-05-13',
      changes: [
        { type: 'changed', text: 'Figma → docs sync workflow upgraded to detect deletions and renames. The bug class: the inspector and sync skill only compared Figma → docs (what\'s in Figma that\'s missing from docs), never the reverse. Deletions in Figma left orphan slots, events, states, CSS rules, and examples in the doc site indefinitely because the inspector silently reported "all good." The nav-header bento miss exemplified this; the upgrade prevents the recurrence.' },
        { type: 'changed', text: 'figma-component-inspector now requires two new sections on every inspection: a Doc-site surplus pass that walks every doc-side artifact (spec fields, CSS selectors, examples, API table rows, JS functions, playground controls) and tags each as attested by Figma, unattested, or infrastructure; and a Snapshot delta that diffs the prior snapshot against current Figma to report removed/renamed/added nodes explicitly.' },
        { type: 'changed', text: 'sync-figma-component-spec gains a new step that consumes the inspector\'s surplus and snapshot-delta sections and proposes file deletions — surplus slot/event/state/prop → potentially-breaking removal; surplus example file → destructive removal; surplus CSS or JS → potentially-breaking. Per the classification rule, no removal auto-applies; the skill stops and asks.' },
        { type: 'added', text: 'New CI audit scripts/audit-doc-internal-consistency.sh as the safety net for partial cleanups — five repo-only consistency checks (every CSS class is referenced in an example or the API table, every spec event is dispatched in JS, every impl token is defined in tokens.css, every commonlyPairedWith id exists, every orchestrator entry points at a real JS file). Pre-existing findings grandfathered; new drift fails the build.' }
      ]
    },
    {
      version: 'SITE 2026.05.13.2',
      date: '2026-05-13',
      changes: [
        { type: 'removed', text: 'Nav Header bento app-switcher removed in full — the proof-of-fix for the bidirectional sync workflow that shipped earlier the same day. The canonical nav-header in Figma no longer nests any bento sub-component, so the inspector\'s surplus pass surfaced ~22 doc-side bento artifacts and the sync skill proposed their removal. nav-header.js deleted (the only function was the bento toggler), about 100 lines of CSS removed, two example files deleted, the playground simplified to four controls, and the spec\'s slots, events, states, and acceptance criteria all dropped their bento entries. The header is CSS-only now and matches the Figma anatomy exactly.' },
        { type: 'changed', text: 'Three new Figma-side findings logged on the nav-header page: a new logo-pill component sitting unattached on the page (treating as design exploration pending designer confirmation); a Logo Outline=True variant defined in Figma but not yet a doc-side prop; and the standalone dropdown and nav-tile components left as orphans after the bento removal.' },
        { type: 'fixed', text: 'Nav Header per-component changelog gets four 0.3 entries covering this round (the bento cleanup, the commonlyPairedWith corrections, the new findings, and a snapshot precision update).' }
      ]
    },
    {
      version: 'SITE 2026.05.13.3',
      date: '2026-05-13',
      changes: [
        { type: 'added', text: 'New "Figma Notes" tab on component pages. Surfaces open Figma findings the inspector flagged but did not auto-apply — design questions, new Figma components that aren\'t wired into the canonical contract yet, orphans left over from previous designs, and Figma↔code drift awaiting designer direction. The tab appears only when a component has notes; an open-count badge shows next to the tab name. Each note has a plain-language title, summary, optional "Decision needed" callout, deep links to the relevant Figma nodes, and an auto-resolve condition.' },
        { type: 'added', text: 'Inspector and sync skill now manage Figma Notes automatically. The inspector reads existing notes at the start of each run and resolves any whose condition is now met (the node got wired in, or got deleted, or values now agree). The sync skill prunes resolved notes and adds new ones for findings the inspector marks "needs review." No user confirmation needed — surfacing a finding is informational, not a contract change.' },
        { type: 'added', text: 'New schema uds/schemas/figmanotes.schema.json defines the figmanotes.json shape: a stable id, a kind enum (new-in-figma, figma-orphan, drift, question), a plain-language title and summary, a raised-on date, optional decision question, Figma references, and an auto-prune condition.' },
        { type: 'changed', text: 'Nav Header knownIssues migrated to figmanotes.json. The seven Figma-side findings (logo-pill exploration, Outline=True variant, dropdown/nav-tile orphans, decorative chevron, logo SVG export gap, max-width token, badge upstream errors) are now structured notes with proper deep links and auto-prune conditions. The spec\'s knownIssues stays in the schema for non-Figma implementation notes but is empty for nav-header now.' },
        { type: 'changed', text: 'Dropped knownIssues from the spec completeness fields. The signal was backwards — a component scored more "complete" if it had unresolved issues. With Figma findings moving to figmanotes.json (which doesn\'t count toward completeness), the metric reads more honestly now.' }
      ]
    },
    {
      version: 'SITE 2026.05.14.1',
      date: '2026-05-14',
      changes: [
        { type: 'added', text: 'New always-on rule .cursor/rules/communication-style.mdc — default chat tone for this repo. Agent responses stay concise and in plain language; written artifacts (changelogs, commits, PR descriptions, audits, schemas, code) keep their own technical voice contracts.' }
      ]
    },
    {
      version: 'SITE 2026.05.18.1',
      date: '2026-05-18',
      changes: [
        { type: 'added', text: 'New skill .cursor/skills/generate-uds-figma-component/ — the UDS Component Factory. Drafts a token-bound component set directly in the UDS Components Figma file on a new `🟠 <Title> {Cursor}{Ignore}` page; the `{Ignore}` marker keeps the draft out of every other UDS automation until the designer accepts it by renaming the page. Three phases: Phase A reads the brief, sibling specs, and the semantic tokens, then proposes a component model that needs explicit "approved" before any Figma write; Phase B builds the component set with auto-layout, token bindings, and nested instances; Phase C emits a quality-gate report plus designer-facing questions. The factory stops at Figma — landing into the docs is the separate uds-updated skill, designer-initiated.' },
        { type: 'changed', text: 'uds-figma-write-safety.mdc adds a fourth allowed write scope for component drafts on `{Cursor}{Ignore}` pages. Allowed only when the user explicitly invokes the factory and names the target component. The designer accepts a draft by renaming the page (dropping `{Cursor}{Ignore}` and setting the stoplight prefix) — the factory never auto-renames.' }
      ]
    },
    {
      version: 'SITE 2026.05.19.1',
      date: '2026-05-19',
      changes: [
        { type: 'fixed', text: 'Main content area was blank after the previous bump because the new SITE_CHANGELOG entry used SQL-style apostrophe escaping (`\'\'`) inside JavaScript single-quoted strings, which threw a SyntaxError when app.js imported the changelog. The header, theme bar, and sidebar still rendered (they\'re plain HTML), so the failure was easy to miss. Fixed the escaping and bumped the app.js cache-bust so deployed clients pick up the corrected import.' }
      ]
    },
    {
      version: 'SITE 2026.05.20.1',
      date: '2026-05-20',
      changes: [
        { type: 'added', text: 'New Reference page docs/pages/design-process.html — a discussion document (not a live process) that proposes a five-stage stoplight lifecycle for UDS components, splits ownership cleanly between Figma and the doc site, and reviews five recommendations against Polaris / Carbon / Lightning / Spectrum / Material. The page opens with a prominent banner: "This is a discussion document, not a live process. The current process inside the repo has not been changed." Nothing in the actual lifecycle — status enums, sync skills, status.json files — moves with this commit.' }
      ]
    },
    {
      version: 'SITE 2026.05.20.2',
      date: '2026-05-20',
      changes: [
        { type: 'changed', text: 'Rewrote the design-process page body for a designer audience. The first cut leaned heavily on engineering vocabulary — file paths, schema field names, workflow script names, "spec contract" / "off-stoplight" / "audit trail" / "back-compat consumers." All restated in plain language. Stage cards now say "Lives in: Figma | Who works on it: Designer" instead of "Universe | Key | Owner," sub-headings read "While you\'re here" and "To move to Orange," and the cross-reference footer points generically at Cursor Workflows instead of naming six skill files. Same five stage cards, same five recommendations; only the words changed.' }
      ]
    },
    {
      version: 'SITE 2026.05.21.1',
      date: '2026-05-21',
      changes: [
        { type: 'added', text: 'Two new Cursor rules learned from the first factory run on Text Input. uds-figma-plugin-api-gotchas captures four use_figma truths that bit the factory and would bite any other Plugin API script the same way (local vs. subscribed-library component resolution, INSTANCE_SWAP defaults expecting node IDs not published keys, hidden white fills on fresh frames, resize forcing both axes to fixed). uds-figma-factory-quality codifies five component-agnostic quality gates for any factory-style Figma build — full state-design contract at design time, machine-verified audit before the report, per-column variant packing, visibility defaults that render the standard anatomy, and a dependency manifest before any write.' }
      ]
    },
    {
      version: 'SITE 2026.05.21.2',
      date: '2026-05-21',
      changes: [
        { type: 'added', text: 'New Design Language reference page (docs/pages/design-language.html) plus a matching agent-facing rule at .cursor/rules/uds-design-language.mdc. Documents the standard UDS visual constructions derived from every existing component CSS — interaction states, validation states, availability states, selection states, the three focus-ring constructions, the surface and elevation scales, the border-radius families, density patterns, and a naming guide for Checked vs Selected vs Active. Five per-component inconsistencies surfaced in a "Known inconsistencies" section for the next Figma round-trip (the agent can\'t autonomously fix anything in uds/).' },
        { type: 'changed', text: 'Refactored uds-figma-factory-quality.mdc to be design-system-agnostic. The state-design-contract section now points at the new uds-design-language.mdc for the actual UDS standard rather than embedding UDS-specific examples. Factory-quality is purely about process; design-language is the visual standard. Together they tell a factory build both what to build and how to build it.' }
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
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; full layout redesign. Previous page was an 11,780-px-tall single-scroll wall of 28 stacked numbered step cards (`.sg-wf-step`/`.sg-wf-arrow`/`.sg-wf-summary`), four dense reference tables (rules / skills / subagents / audits), and a paragraph-text "how to add" section &mdash; written for someone who already knew what they were looking for. Top-of-page `<h1 data-bind="title"></h1>` + `<p data-bind="description"></p>` placeholders rendered as literally-empty title and description because no JS binds them for non-component pages (only `bindSpecToPageChrome()` does, and only for components with a `spec.json`). New layout is task-first and scannable, organized around the question "what would a designer actually do on this page?"' },
        { type: 'added', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; new hero with literal `<h1>Cursor Workflows</h1>` + designer-voice lede that explains the page in one sentence ("this site asks Cursor to do most of the design-system housekeeping &mdash; bumping versions, syncing Figma, writing changelogs, rebuilding release notes. You type a plain-English prompt; Cursor picks the right tool. This page is the map"). Fixes the previously-blank title/description issue without re-introducing the `data-bind` mechanism (which doesn\'t apply to non-component pages anyway).' },
        { type: 'added', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; new "Say this &mdash; get that" Quick Start section. Six prompt cards (`.sg-cw-prompt`) showing the most common phrases a designer might type ("UDS updated", "Sync nav-header from Figma", "Add a tooltip component", "Build the Figma page for Button", "Factory me an Avatar", "Audit our specs") with the say-quote at top, the do-outcome with a strong-tagged headline, and a "USES" footer that chip-links to the workflow + skill that gets triggered. Surfaces the right answer to "what do I type?" without making the designer first read the catalog.' },
        { type: 'added', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; new Concept Primer with four side-by-side cards (`.sg-cw-concept[data-type="rule|skill|subagent|audit"]`) replacing the previous 4-row overview table. Each card has a colored top-border accent (info / success / warning / error tints), a tinted material-symbols icon (policy / menu_book / support_agent / verified), the kind name, a 1-line "what it is" body, a "like-an-X" italicized analogy, the canonical filesystem path as a code chip, and the current count of that kind in this repo (20 rules / 9 skills / 7 subagents / 13 audits &mdash; corrects the old page\'s stale "14 rules" / "9 audits" headers).' },
        { type: 'added', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; the full catalog is now behind a tab strip (Workflows / Rules / Skills / Subagents / CI Audits / Add your own) using the existing `.sg-page-tabs` + `[data-tab-panel]` chrome from `app.js`. Default tab wired via `data-default-tab="workflows"` on the `<div data-page="cursor-workflows">` block in `index.html` so `navigate() → switchTab(pageId, defaultTab)` lands on the right panel instead of the global `examples` default (which silently deactivated every panel on this page since none of them are named `examples`). All other tab plumbing &mdash; hashchange routing, aria-selected toggling, panel `.active` class, keyboard arrow nav &mdash; reuses the existing global handlers without changes.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; Workflows tab redesign. Old layout was four `<div class="sg-wf-chain">` blocks each containing 4-8 `<div class="sg-wf-step">` cards alternating with `<div class="sg-wf-arrow">` down-arrows (28 step cards stacked vertically). New layout collapses each workflow into a single `.sg-cw-workflow` card with a fixed structure: numbered circle badge + name + one-line summary + stats pills ("8 steps", "11 audits gate it"); a "TRIGGERS" chip row showing the prompts that fire this workflow; a clean `<ol class="sg-cw-steps">` step list with each step rendered as `<li class="sg-cw-step">` (small numbered circle + bold title + 1-2 line description + chip cloud of the skill names used); a footer with a red `.sg-cw-workflow-audits` strip listing every audit name that gates this workflow; and a collapsible `<details class="sg-cw-details">` "what gets touched, end to end" expander for the file-by-file detail (previously a separate `.sg-wf-summary` block at the bottom of each chain). Total height of the workflows tab dropped from ~11,780 px on the old single-scroll layout to ~5,040 px now (4 workflow cards) &mdash; each workflow takes roughly one screen instead of three.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; Rules tab redesign. Old layout was two `.sg-gl-table` tables with header rows + body rows (Rule name / What it does / Loads when…) &mdash; dense, hard to scan, three-column wrapping at narrow widths. New layout is `<div class="sg-cw-cards">` card grids inside two `<div class="sg-cw-group">` blocks ("Always-on (8)" / "Glob-scoped (12)"). Each rule renders as a `.sg-cw-card` with the rule name in monospace as the card title, an `.sg-cw-pill` showing activation behavior (`.sg-cw-pill--always` info-tinted for always-on, `.sg-cw-pill--scoped` neutral-tinted with a `.sg-cw-scope` mono-code chip showing the actual glob for glob-scoped), a designer-voice 1-paragraph body explaining what the rule does in plain language, and an "Open file →" link to the rule\'s GitHub blob. Also corrects the previously-incorrect "14 rules" header to the actual count of 20 (8 always-on + 12 glob-scoped). The `uds-figma-plugin-api-gotchas` and `uds-figma-factory-quality` card descriptions incorporate the wording updates main shipped in `2026.05.22.5` / `.6` / `.7` (auto-layout has five bindable spacing properties not two, effects must bind via `setEffectStyleIdAsync` not raw literals, Phase C audit must report unbound paints + per-side spacing + effect-style + per-variant `INSTANCE_SWAP` defaults) in designer-voice form rather than mirroring the rule frontmatter verbatim &mdash; the rule files themselves remain the technical reference.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; Skills tab redesign. Old layout was 3 `.sg-wf-card`s (orchestrators) above a separate 6-row `.sg-gl-table` (specialist sync skills) with inconsistent styling between the two groups. New layout uses the same `.sg-cw-card` grid for both groups, with `.sg-cw-pill--orch` for orchestrators (warning-tinted) and `.sg-cw-pill--sync` for specialists (info-tinted). Each skill card includes a `.sg-cw-triggers` chip cloud showing the typical user prompts ("UDS updated", "factory me an Avatar", etc.) so designers can see which phrases fire which skill without having to read the description.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; Subagents tab redesign. Old layout was a 4-column `.sg-gl-table` (Subagent / What it reads / Returns / Typically called by). New layout is a 7-card grid with each card showing the subagent name, a `.sg-cw-pill--readonly` lock-icon pill (every subagent is read-only by contract), a designer-voice description that merges the reads + returns columns into one paragraph, and a footer line for "typically called by". Same content, dramatically more scannable.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; CI Audits tab redesign. Old layout was three section headings ("Pre-existing audits (4)" / "PR2 + PR3 audits (5)" / "Theme-contrast audit (separate CI job)") above small `.sg-gl-table`s, plus a fourth section "Baselines and exemptions" as a paragraph with a bulleted list. New layout uses three `.sg-cw-group` blocks (Pre-existing 4 / Drift-detection 7 / Accessibility 1) with `.sg-cw-cards` grids inside each. Every audit card has a `.sg-cw-pill--blocks` (error-tinted "Blocks merge") OR `.sg-cw-pill--grand` (warning-tinted "Grandfathered") badge so a designer can tell at a glance whether a failing run is a "fix immediately" or "pre-existing drift" situation. Also picks up two audits that were missing from the old page (`audit-toolchain-currency`, `audit-figma-card-template`) &mdash; total now 13, matching `scripts/audit-*.sh`.' },
        { type: 'changed', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; "Add your own" tab redesign. Old layout was four `<p>` paragraphs (Add a Rule / Add a Skill / Add a Subagent / Add an Audit) stacked with their step lists as run-on sentences. New layout is a 4-card grid (`.sg-cw-recipe`) with each card showing a material icon next to the heading and a properly-numbered `<ol>` of the 3-4 concrete steps, so each kind\'s "how to add" recipe is scannable and parallel-structured.' },
        { type: 'added', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; final `.sg-cw-callout` info-tinted box with the "you don\'t have to memorize any of this" message that previously sat at the very bottom of the page as a small `<p class="sg-subsection-desc">`. Promoted to a stars-icon callout pinned below the catalog tabs so the designer-facing punchline is the last thing in view regardless of which tab is active.' },
        { type: 'added', text: '`uds-docs/docs/pages/cursor-workflows.html` &mdash; ~750 lines of new page-local `<style>` block with the `.sg-cw-*` prefix (`-section`, `-eyebrow`, `-prompts/-prompt`, `-concepts/-concept`, `-workflow/-workflow-num/-workflow-header/-workflow-summary/-workflow-stats/-workflow-stat/-workflow-triggers/-trigger/-workflow-footer/-workflow-audits/-workflow-audits-label`, `-steps/-step/-step-num/-step-body/-step-title/-step-desc/-step-uses`, `-details/-details-body`, `-group/-group-header/-group-name/-group-count/-group-desc`, `-cards/-card/-card-head/-card-name/-card-body/-card-foot/-card-link`, `-pill/-pill--{always,scoped,blocks,grand,ok,readonly,orch,sync}`, `-scope`, `-triggers/-triggers-label`, `-recipes/-recipe`, `-callout/-callout-body/-callout-title/-callout-text`). Replaces the old `.sg-wf-*` block (`-chain/-step/-step-num/-step-body/-step-title/-step-desc/-step-touches/-arrow/-summary/-card-grid/-card`) which is now removed. All new CSS uses `var(--uds-*)` tokens throughout &mdash; surface / text / border / icon / spacing / radius / font-size / font-weight / font-family / shadow / z-index &mdash; nothing hardcoded. Verified against all 6 theme combinations (Base Light / Base Dark / ResMan Light / ResMan Dark / AnyoneHome Light / Inhabit Light) via headless Chrome captures.' },
        { type: 'fixed', text: '`uds-docs/index.html` &mdash; added `data-default-tab="workflows"` to the `<div data-page="cursor-workflows" data-page-fragment></div>` block. Without it, `navigate()` falls back to `defaultTab = "examples"` (the global default in `app.js`); `switchTab("cursor-workflows", "examples")` then runs, which loops over every `[data-tab-panel]` and removes `.active`, then tries to find a panel named "examples" (doesn\'t exist), so EVERY panel ends up display-none and the whole page shows as just the hero + quick-start + concept primer + an empty catalog body. Pattern matches existing `data-default-tab="overview"` (`ai-assist`), `data-default-tab="uds"` (`changelog`), and `data-default-tab="preview"` (`semantic-colors` / `primitive-colors`) blocks.' },
        { type: 'changed', text: 'Merge with `main` resolution. While this branch was in flight, `main` shipped PR #39 (Contrast Checker redesign, `2026.05.22.5`) and PR #40 (factory Phase C gates + asymmetry-wording fixes, `2026.05.22.6` and `.7`). Conflicts were on the SITE-bookkeeping files (`version.txt`, `index.html` `SITE_VERSION` + brand-bar + `app.js?v=` cache-bust) and on `docs/pages/cursor-workflows.html` (main extended the descriptions of the `uds-figma-plugin-api-gotchas` and `uds-figma-factory-quality` rule rows in the OLD page format; this branch had rewritten the whole page into the new `.sg-cw-card` grid). Resolved by accepting all of `main`\'s entries verbatim, dropping the entire main-side of the cursor-workflows.html conflict (the old `.sg-wf-*` markup that this branch removed), folding the substance of main\'s two wording updates into the new `.sg-cw-card` descriptions for both rules in designer-voice form, and renumbering this branch\'s SITE entry from `2026.05.22.6` to `2026.05.22.8` (`.6` and `.7` were both taken by main).' },
        { type: 'changed', text: 'SITE bumped 2026.05.22.7 &rarr; 2026.05.22.8. `app.js?v=` bumped 145 &rarr; 146 because `docs/data/site-changelog.js` changed (and `docs/app.js` imports it per `uds-site-changelog.mdc`). `site.css?v=`, `uds.css?v=`, `uds.js?v=`, and `demo-builder/index.js?v=` unchanged &mdash; no underlying file in those bundles changed. `cursor-workflows.html` is lazy-fetched via `fetch-versioned.js` which cache-busts per fetch, so no manual `?v=` bump for the page fragment itself.' }
      ]
    }
];

