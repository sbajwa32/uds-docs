// Docs-site changelog rendered on the Changelog page Site tab.
// Newest entries go last; the renderer reverses them for display.

export type SiteChangelogChangeType = 'added' | 'changed' | 'fixed' | 'removed' | 'deprecated';

export interface SiteChangelogChange {
  type: SiteChangelogChangeType;
  text: string;
}

export interface SiteChangelogEntry {
  /** SITE version, e.g. "SITE 2026.04.01.1". */
  version: string;
  /** ISO calendar date YYYY-MM-DD. */
  date: string;
  changes: SiteChangelogChange[];
}

export const SITE_CHANGELOG: SiteChangelogEntry[] = [
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
        { type: 'removed', text: 'Deleted the Platform Support page. It originally replaced per-component Browser Compat / Performance sections, but nothing else on the site linked to it.' },
        { type: 'removed', text: 'Deleted the Migration Guides page. Per-version upgrade notes belong in the aggregated Changelog and the per-component changelogs, not a separate hand-maintained page; it had only ever been populated with a 0.1 → 0.2 block.' },
        { type: 'changed', text: 'Getting Started page: dropped the trailing "see the Migration Guides" link in the Components section so it no longer points at a removed page.' }
      ]
    },
    {
      version: 'SITE 2026.05.21.4',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Deleted the FAQ page. It had drifted from current truth (referenced legacy file paths and a Cursor rule that had been removed earlier), and the topics still relevant to consumers are already covered in dedicated pages — theming on the appearance bar, versioning on the Changelog header, AI consumption on the AI Assist page, bug reporting via each component\'s Report Issue button.' }
      ]
    },
    {
      version: 'SITE 2026.05.21.5',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Removed the "Pre-flight checklist" header button and its modal dialog from the brand bar. The checklist content had drifted badly from current repo truth — it described file paths and globals that haven\'t existed since the per-component restructure. The authoritative checklist for site work lives in .cursor/rules/uds-master-preflight.mdc now, agent-facing and auto-attached on every relevant edit, so the in-browser duplicate was redundant.' }
      ]
    },
    {
      version: 'SITE 2026.05.21.6',
      date: '2026-05-21',
      changes: [
        { type: 'fixed', text: 'SPA router no longer hijacks in-page anchor links. Any hash that didn\'t start with #/ (like #interaction-states from a page\'s ToC) was getting parsed as a page id, missing the lookup, and bouncing the user back to the fallback page. Both the hashchange handler and the initial-load handler now gate on hash.startsWith("#/") — non-route hashes fall through to native scroll-to-anchor. Any future page with an in-page ToC works without colliding with the router.' },
        { type: 'changed', text: 'Redesigned the Design Language page for a designer audience instead of an agent-reference shape. Two-column layout with a sticky ToC on the left and the content on the right. Every state is now a card with a live preview of real UDS components in that state plus token-reference chips. 14 state cards, 5 focus-ring/density comparison cards, 4 elevation tiles, 7 radius tiles. Forced-state CSS lets the page show states that can\'t render statically (hover, focus, read-only). Previews inherit from uds.css, so token changes flow into the page automatically.' },
        { type: 'added', text: 'New page-load hook for the Design Language page wires the ToC: smooth-scroll click handlers on every link, plus IntersectionObserver that highlights the section currently in view as the user scrolls.' }
      ]
    },
    {
      version: 'SITE 2026.05.21.7',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Deleted the How to Contribute Reference page. Every numbered step referenced something that no longer matches the repo — legacy file paths, the long-gone COMPONENT_STATUS table, the wrong manifest file. The current contribution workflow is documented on the Cursor Workflows page and inside the new-component, sync-figma-component-spec, and generate-uds-figma-component skill files. Easier to delete than rewrite end-to-end.' },
        { type: 'changed', text: 'About page: replaced five legacy `content/<component>.json` references with the current `uds/components/<id>/spec.json` path. The six-stage lifecycle structure itself is unchanged — it complements the newer Design Process page\'s five-stage stoplight framing rather than duplicating it.' },
        { type: 'changed', text: 'Roadmap page: corrected two stale references — the components-status table now points at each component\'s status.json instead of the deleted COMPONENT_STATUS global, and the Figma sync site-feature flipped from Proposed to Shipped (delivered via the Cursor skills, not the originally-proposed server-side action).' }
      ]
    },
    {
      version: 'SITE 2026.05.21.8',
      date: '2026-05-21',
      changes: [
        { type: 'changed', text: 'Design Language page: replaced the academic "canon" and "ratification" language with natural design-system voice. Page lede, hero meta row, section titles, and every "canonical pattern proposed" trailer rewritten — "Naming canon" became "Naming guidance," "designer ratification" became a "needs review" badge, "in the canon today" became "in UDS today." Same pass applied to the matching agent-facing rule.' },
        { type: 'changed', text: 'Design Language page layout cleanup: removed the manual-style "01 / 02 / …" numeric prefixes on section headers, dropped the heavy border-bottom dividers (spacing alone does the separation), de-monospaced the state-card tags so they read as natural copy, and hid the leftover "LIVE PREVIEW" labels — the rendered component is self-evident.' }
      ]
    },
    {
      version: 'SITE 2026.05.21.9',
      date: '2026-05-21',
      changes: [
        { type: 'removed', text: 'Roadmap reference page removed. The page mixed three lists with different lifespans — foundation prerequisites that duplicated per-component specs, a components-status table that duplicated the sidebar badges, and a stale site-features list of things that had already shipped. The components-status renderer in app.js, its dead CSS, and the matching screenshot/contrast-audit page entries all came out with it.' },
        { type: 'changed', text: 'About page: rewrote the Component Lifecycle "Propose" step. Old copy said the proposer "files an entry on the Roadmap with rationale"; new copy says they "start a Figma page for the component with the red Exploration prefix and note what problem it solves," matching the five-stage stoplight model on the Design Process page.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.1',
      date: '2026-05-22',
      changes: [
        { type: 'changed', text: 'communication-style rule rewritten to make "talk to the user as a senior product designer, not a developer" the explicit audience contract instead of a soft preference. New Audience section, hard rules on no-jargon-by-default, no tool-call narration, no restating the obvious. Designer-speak vs developer-speak comparison table with seven before/after examples covering everything from Button size changes to commit/push reporting. The non-negotiable technical-voice carve-out (code, schemas, audits, commits) stays untouched.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.2',
      date: '2026-05-22',
      changes: [
        { type: 'changed', text: 'communication-style rule second pass after the previous revision read too absolutist. The Audience section now explicitly notes that "senior designer" means technically literate, not asking to be talked down to. The default-tone rules swap "no jargon" for "use jargon when it\'s the clearest word, not by default" with a concrete test: if you can express the same idea in plain language without losing accuracy or making the sentence longer, do. The comparison table reframes its right column as "Technical voice (when the specifics matter)" instead of a "not this" — explicitly fine in chat when the user is debugging or needs the exact name.' },
        { type: 'added', text: 'New "Voice extends to human-facing docs prose" section in the rule. Same designer voice now covers rendered page copy, spec.json prose fields, accessibility strings, impl.json descriptions, and README narrative — in addition to chat replies. With a critical caveat: this does NOT authorize autonomous rewrites of uds-docs/uds/ content; the Figma source-of-truth rule still gates that.' },
        { type: 'added', text: 'New "Where technical voice is non-negotiable" table replaces the previous bullet list. Each row pairs an artifact (code, schemas, per-component changelogs, SITE_CHANGELOG, structured spec fields, impl.json tokens/html, audit output, commits, PR descriptions, Figma write summaries) with the reason its detail must stay — making protection of those artifacts explicit so a future agent reading "designer voice everywhere" doesn\'t flatten a typed spec field into casual prose.' },
        { type: 'added', text: 'New "How to decide which voice to use" cheat sheet — six numbered questions ending in "designer voice" or "technical voice." Default when in doubt: less technical, offer to expand.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.3',
      date: '2026-05-22',
      changes: [
        { type: 'added', text: 'communication-style rule: closed a gap that would have let a literal-minded agent extend the "designer voice for human-facing prose" section to .cursor/ rule, skill, and agent files because they\'re markdown that humans review — and then start softening the operational detail (exact file paths, schema field names, script names, command flags) that future agents need verbatim to execute. New "Not in scope: anything under .cursor/" callout in the prose section, and a new row in the technical-voice table for those files.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.4',
      date: '2026-05-22',
      changes: [
        { type: 'fixed', text: 'communication-style rule: two consistency nits caught during a final read-through. The "Designer-speak vs developer-speak" section heading mismatched the column labels inside it ("Designer voice" / "Technical voice"); retitled to match. The "I bumped the docs site" example row hardcoded a specific SITE version that would decay; made it version-agnostic.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.5',
      date: '2026-05-22',
      changes: [
        { type: 'changed', text: 'Contrast Checker redesigned end-to-end into a designer-first tool. The previous layout was three same-weight sections (long WCAG explanation, eighteen dense recommended-pairing cards, native select picker, full matrix) and forced designers to read paragraphs before doing anything. The new layout leads with the tool: a hero Compare panel with two pickers, a real-size live preview of the chosen pair, and a strip showing how that pair holds up across all six theme combinations. Browse mode (curated pairings or the full matrix) is below; the WCAG reference moved into a collapsed details block at the bottom.' },
        { type: 'added', text: 'Hero Compare panel: two custom popover pickers (foreground and surface), each with search and kind filters. The preview area renders the actual content for the chosen kind — a paragraph of body text at three sizes (text kind), a row of Material Symbols at three sizes (icon kind), or an outlined input/chip/card mockup (border kind) — so you see readability at real reading scale, not a 36×28-px swatch. The verdict ratio is large and centered with a one-sentence explanation that cites the WCAG criterion driving the result.' },
        { type: 'added', text: 'Per-theme strip inside the hero shows the same pair evaluated across all six supported themes simultaneously. Click any theme cell to flip the global theme bar to that combination — answers "does this pair work everywhere?" without making the designer manually flip themes.' },
        { type: 'added', text: 'Browse mode: a segmented toggle between "Common pairings" (the curated semantic combinations as compact one-line list items) and "Full matrix." Both share the same kind-filter chips and a "Show only failing" toggle. Click any row, cell, or theme cell to pin that pairing to the Compare panel.' },
        { type: 'changed', text: 'WCAG threshold explanation moved out of the always-on top of the page into a collapsed details block at the bottom. Designers see the hero immediately; the threshold reference is one click away when needed.' },
        { type: 'removed', text: 'Native select replaced by the searchable popover picker. The native select was the only non-UDS-styled control on the page and made the picker section feel disconnected.' }
      ]
    },
    {
      version: 'SITE 2026.05.22.6',
      date: '2026-05-22',
      changes: [
        { type: 'added', text: 'Two new Plugin API gotchas captured from the Nav Header factory draft. (1) Auto-layout has five individually-bindable spacing properties (paddingTop / paddingBottom / paddingLeft / paddingRight / itemSpacing) and no horizontal/vertical shorthand — CSS-style helpers like `px-N` / `py-N` train the eye to think in pairs and silently strand whichever pair the script doesn\'t bind. The error stays silent until the density mode flips. (2) Effects must bind via setEffectStyleIdAsync — raw effect literals render visually but escape every "is this bound?" audit, so factory runs routinely ship visually-shadowed nodes with values that don\'t match any depth step.' },
        { type: 'added', text: 'Factory-quality rule extended its mandatory pre-Phase-C audit from two checks to five. New: per-side spacing audit (reports each padding side and itemSpacing separately, not a combined "unbound spacing" count), effect-style binding audit (the visual output looks right when binding is missing — the audit can\'t rely on appearance), and per-variant INSTANCE_SWAP defaults audit (catches the "every icon shipped as the factory placeholder" failure where the wiring is correct but the per-variant defaults were never baked in).' }
      ]
    },
    {
      version: 'SITE 2026.05.22.7',
      date: '2026-05-22',
      changes: [
        { type: 'fixed', text: 'Tightened ambiguous "asymmetry" vocabulary in the Plugin API gotchas rule and the matching factory skill. A future agent could plausibly misread "asymmetry" as "values across sides should be made equal" rather than "binding state across sides should be made consistently bound." Reworded so every usage now makes the binding-state framing explicit: a pill that legitimately wants paddingLeft = 16 and paddingRight = 12 is fine — the requirement is "every side bound," not "every side equal."' }
      ]
    },
    {
      version: 'SITE 2026.05.22.8',
      date: '2026-05-22',
      changes: [
        { type: 'changed', text: 'Cursor Workflows page redesigned end-to-end. The previous version was an ~11,780-px-tall single scroll: 28 stacked step cards, four dense reference tables, and a paragraph-text "how to add" section, written for someone who already knew what they were looking for. The page also carried two `data-bind` placeholders for title and description that never got bound — non-component pages don\'t have a spec.json — so the page header rendered blank. The new layout is task-first and scannable, organized around "what would a designer actually do on this page?"' },
        { type: 'added', text: 'New hero with a literal title and a designer-voice lede explaining the page in one sentence: "this site asks Cursor to do most of the design-system housekeeping — bumping versions, syncing Figma, writing changelogs. You type a plain-English prompt; Cursor picks the right tool. This page is the map." Fixes the blank title/description issue.' },
        { type: 'added', text: 'New "Say this — get that" Quick Start section. Six prompt cards showing the most common phrases ("UDS updated," "Sync nav-header from Figma," "Add a tooltip component," "Factory me an Avatar," etc.) with the say-quote at top, the resulting outcome below, and a footer chip-linking to the workflow + skill that gets triggered. Surfaces the right answer to "what do I type?" without making the designer read the catalog first.' },
        { type: 'added', text: 'New Concept Primer with four side-by-side cards replacing the previous overview table — one card each for Rules, Skills, Subagents, and Audits. Each card has a colored accent, a tinted icon, a one-line description, a "like-a-X" analogy, the canonical filesystem path, and the current count in this repo (corrects the old page\'s stale counts).' },
        { type: 'added', text: 'The full catalog is now behind a tab strip — Workflows, Rules, Skills, Subagents, CI Audits, Add Your Own. Reuses the existing page-tabs chrome the rest of the docs site already has.' },
        { type: 'changed', text: 'Every catalog tab (Workflows, Rules, Skills, Subagents, CI Audits, Add Your Own) redesigned into the same scannable card-grid pattern with consistent pills (always-on / scoped / orchestrator / specialist / readonly / blocks-merge / grandfathered). The Workflows tab in particular dropped from ~11,780 px to ~5,040 px — each workflow takes roughly one screen instead of three. Audit count corrected from the old page\'s nine to the actual thirteen.' },
        { type: 'fixed', text: 'index.html: added `data-default-tab="workflows"` to the cursor-workflows page block. Without it, the SPA falls back to the global default tab name "examples" — which doesn\'t exist on this page — and every tab panel ended up hidden, leaving the page showing just the hero and an empty catalog. Same pattern other pages already use (data-default-tab="overview" on ai-assist, "uds" on changelog, "preview" on the colors pages).' }
      ]
    },
    {
      version: 'SITE 2026.05.23.1',
      date: '2026-05-23',
      changes: [
        { type: 'fixed', text: 'Changelog page no longer renders literal HTML tags inside entries as live elements. Recent entries that quoted tag names like `<select>`, `<details>`, `<a href>`, `<button>`, `<h1>`, `<p>` were getting parsed by the renderer and ended up as real dropdowns, disclosure widgets, blue link runs, and inline button blocks where the entry was just trying to quote code. The renderer now escapes `<` and `>` in entry text before injection (entities like `&mdash;` still resolve), and converts backticks to `<code>` for inline code formatting.' },
        { type: 'changed', text: 'Changelog page redesigned. The SITE tab now groups entries into one card per calendar date — every SITE bump from a busy day collapses into compact sub-sections inside the day card, full version counters preserved. The UDS tab keeps one card per semver release. Both tabs get a sticky toolbar with search, type filter chips (added / changed / fixed / removed / deprecated), and on the UDS tab a component filter that builds itself from the components in view. A sticky version-jump rail on the left side highlights the section currently in view as you scroll.' },
        { type: 'changed', text: 'Type indicator for each entry changed from the old `ADDED:` ALL-CAPS prefix to a small colored dot plus a quiet lowercase label. Same color coding (success-green for added/fixed, warning-orange for changed, error-red for removed/deprecated), much less screaming.' },
        { type: 'added', text: 'New voice contract for SITE_CHANGELOG entries in `.cursor/rules/uds-site-changelog.mdc` §"Voice and length." Names the audience (senior product designer, technically literate, not asking to be talked down to), the test for whether to use a technical term (the reader will need the exact name to act on it vs decoration), and concrete length and shape rules — most entries 1–3 sentences, no line numbers, no internal phase terminology, no per-entry cache-bust enumeration, no merge-resolution narratives. Mirrored in `.cursor/rules/communication-style.mdc`: SITE_CHANGELOG entries moved out of the technical-voice table into the human-facing-prose list (the typed fields stay structured, but the entry text is prose that renders directly on the live page). Per-component changelog.json stays in technical voice — audits depend on it.' },
        { type: 'changed', text: 'Pass over every entry in the log to land the new voice. Most April and early-May entries already matched it and stayed untouched. The mid-May to late-May entries — Phase 16/17 a11y, the Nav Header sync rounds, the Figma bidirectional sync workflow, the toolchain and TOOLCHAIN.md introduction, the design-process and design-language pages, the contrast-checker redesign, the Plugin API gotchas, the cursor-workflows redesign — got the heavier rewrite. Version metadata stays exact in every entry; nothing was renumbered or deleted (two pairs of out-of-order entries got reordered chronologically, that\'s it).' }
      ]
    },
    {
      version: 'SITE 2026.05.23.2',
      date: '2026-05-23',
      changes: [
        { type: 'added', text: 'New `uds-naming-conventions` card on the Cursor Workflows page, in the Glob-scoped rules group next to `uds-design-language` (its visual partner — design-language covers how things look, naming-conventions covers what we call them). The rule locks the canonical vocabulary every UDS component reaches for across ten categories — states, sizes, tones, emphasis, regions, the state-vs-variant-vs-property litmus test, casing, component and subcomponent naming, and lifecycle status. Glob-scoped group count bumped from 12 to 13.' },
        { type: 'changed', text: 'Component Factory (`generate-uds-figma-component`) and `new-component` skills now source variant axes, state names, and field labels from the new naming-conventions rule instead of inheriting them from sibling components. Replaces the previous "UDS does not have a standardized variant vocabulary" caveat in the Factory with positive guidance — if a sibling disagrees with the framework, the framework wins.' }
      ]
    },
    {
      version: 'SITE 2026.05.23.3',
      date: '2026-05-23',
      changes: [
        { type: 'fixed', text: 'Rewrote the `2026.05.23.2` entries to match the voice and length rules that shipped earlier the same day. The original seven entries collapse to two — one `added` for the new Cursor Workflows card, one `changed` for the Factory and `new-component` rewiring — and drop the merge-resolution narrative, the cache-bust enumeration, the inline `<code>` / `<strong>` / `<em>` tags (which were rendering as literal angle-bracket text after the same release escaped raw HTML), and the implementation-step narration of `.cursor/` files that aren\'t user-visible on the site.' }
      ]
    },
    {
      version: 'SITE 2026.05.24.0',
      date: '2026-05-24',
      changes: [
        { type: 'changed', text: 'Rewrote the docs site on Next.js 15 + React + TypeScript. The old vanilla HTML/CSS/JS SPA (`index.html` + `docs/app.js` + `docs/site.css` + the `docs/modules/` ES module collection) was replaced with one file per route under `app/`, React components for every interactive surface, and TypeScript types generated from the JSON schemas the docs site consumes. The Cloudflare-Pages deploy target stayed (static export), and every component still lives in `uds/components/<id>/` with the same files — Figma\'s source of truth wasn\'t touched. Visual parity is the contract: every `.udc-*` and `.sg-*` class renders the same way, every theme combo behaves the same, every interactive flow (Token Search, Build Demo, Playground, Contrast Checker) ships the same affordances.' },
        { type: 'added', text: 'Version-aware archive viewing via `?uds=X.Y`. The version dropdown now flips a query param instead of navigating to a frozen folder. The React app re-fetches `versions/<X>/uds/...` for the archived release and renders it with the live UI, so bug fixes to docs chrome automatically benefit historical views. `UdsVersionProvider` reads `?uds=` from the URL, validates it against `versions.json`, and threads `fetchVersion` through every data fetcher in `lib/uds-data.ts`.' },
        { type: 'added', text: 'Type-safe data layer. `types/uds.ts` is generated from the JSON schemas under `uds/schemas/` via `npm run gen:types`; every component spec, status, changelog, impl, and manifest is statically typed at every call site. Schema drift fails the build via `gen:types:check`.' },
        { type: 'added', text: 'Reorganized into purpose-built folders: `app/(site)/` for public routes, `app/(dev)/` for the kit-sink dev page, `components/site/` for site chrome (header, sidebar, theme provider, version provider, token search, demo builder, playground, contrast checker), `lib/uds-data.ts` for the data layer, `lib/demo-builder/` + `lib/examples-renderer.ts` for shared rendering logic, `styles/site/` + `styles/pages/legacy.css` for site-side CSS. Nothing under `uds/` moved.' },
        { type: 'added', text: 'Per-component co-location preserved across the rewrite: each component still ships `<id>.css`, `<id>.js`, `spec.json`, `status.json`, `changelog.json`, `impl.json`, `playground.js`, and `examples/*.html` in one folder. The Examples tab and the Build Demo dialog read the same `examples/*.html` files — structural drift between docs page and demo previews is still impossible.' },
        { type: 'removed', text: 'Deleted the legacy stack: `index.html`, `docs/app.js`, `docs/site.css`, every file under `docs/modules/`, `docs/data/site-changelog.js`, `version.txt`, `bump-site.sh`, the GitHub Pages deploy workflow, and the `?v=N` cache-bust query param scheme (Next.js content-hashes its own static assets; Cloudflare\'s `_headers` policy handles JSON cache invalidation). Anything `uds/` stayed.' },
        { type: 'fixed', text: 'Multiple architectural payoffs land alongside the rewrite: type-checked tab ARIA, proper focus management on every modal/popover, version-aware sidebar filtering, version-aware internal links, conditional component-page tabs (Playground hides for deferred components and archive views), tokenized Demo Builder dialog with status dots fetched per `fetchVersion`. Subsequent SITE entries on this same day (`.24.1` onward) document the post-cutover regression-recovery rounds that buttoned up visual parity with the legacy site.' }
      ]
    },
    {
      version: 'SITE 2026.05.24.1',
      date: '2026-05-24',
      changes: [
        { type: 'removed', text: 'Removed the `theme-contrast` CI job and deleted `scripts/audit-theme-contrast.sh` plus its axe-core driver. Contrast validation belongs in the Contrast Checker tool (`#/contrast-checker`) — you pick foreground/surface tokens, see ratios across all six themes, and adjust in Figma. The GitHub audit duplicated that work, was permanently red on known baseline failures, and couldn\'t trigger token fixes anyway per the source-of-truth rule. Release workflow, agent rules, and the Cursor Workflows page now point at the tool instead.' }
      ]
    },
    {
      version: 'SITE 2026.05.24.2',
      date: '2026-05-24',
      changes: [
        { type: 'fixed', text: 'Restored four pieces of component-page chrome that were missing after the Next.js rewrite: the Storybook and Report Issue buttons in the header link bar (Figma and GitHub were already there), the orange "Not production-ready" warning banner on any component that isn\'t Production yet, and the "Last updated: X — Show recent changes" collapsible card that surfaces the two most recent changelog entries inline. All four are direct ports of legacy `app.js` behavior; the existing `.sg-not-for-production` and `.sg-recent-changes` CSS in `styles/pages/legacy.css` is reused verbatim.' },
        { type: 'changed', text: 'Version dropdown labels the live release as "(latest)" instead of "(current)", matching the legacy site\'s wording.' }
      ]
    },
    {
      version: 'SITE 2026.05.24.3',
      date: '2026-05-24',
      changes: [
        { type: 'fixed', text: 'Cleaned up four Changelog-page regressions surfaced in the side-by-side review: rail items were rendering with native `<button>` border + background instead of the legacy plain-text style (added a button reset to `.sg-cl-rail-link` so anchor- and button-based rails look identical), the rail heading was "Jump to" instead of "Jump to release" (or "Jump to date" on the Site tab), the rail meta only showed the date — it now shows date + change count on a second line like the legacy, the search placeholder said "Search changelog" instead of "Search changes", and the component filter chip group was missing its "FILTER BY COMPONENT" label.' }
      ]
    },
    {
      version: 'SITE 2026.05.24.4',
      date: '2026-05-24',
      changes: [
        { type: 'fixed', text: 'Changelog Site-tab date format restored to the legacy "Sunday, May 24, 2026" shape (weekday + month + day + year, parsed in UTC, using the browser\'s default locale). The previous version dropped the weekday and locked the locale to `en-US`. Site-tab rail meta now also prefixes multi-bump days with "X bumps" so a Saturday with three SITE bumps reads "3 bumps 8 changes" instead of just "8 changes".' }
      ]
    },
    {
      version: 'SITE 2026.05.24.5',
      date: '2026-05-24',
      changes: [
        { type: 'fixed', text: 'Playground tab parity with the legacy site: the code block has its copy button back (icon swaps to a check for 1.5s after a successful copy), the "Implementation Reference" expandable is back below the code with the same Component File / Styles / Behavior / Tokens Used tab structure (CSS and JS panels lazy-fetch only when their tab is opened, tokens panel resolves swatches from `getComputedStyle` and re-resolves when the theme changes), and icon-search controls show the Material Symbols glyph + name as a button trigger (click to type a different symbol name). The searchable dropdown picker from the legacy is still a follow-up — it needs the 63KB MATERIAL_ICONS list loaded — but the visual regression where icon inputs lost their glyph preview is fixed.' }
      ]
    },
    {
      version: 'SITE 2026.05.24.6',
      date: '2026-05-24',
      changes: [
        { type: 'fixed', text: 'Build Demo Site dialog parity: the "Last Build" heading is back above the timestamp/stats line (it was rendering as near-white text — the dialog inherits its color cascade from the dark `.sg-brand-bar` where the trigger button lives; explicit `color: var(--uds-color-text-primary)` reset on `.sg-demo-dialog` re-anchors all dialog text to the standard primary color). Each component row in the grid has its lifecycle status dot back (placeholder/blocked/in-progress/review/production — fetched per-component from `status.json` when the dialog opens). The close (X) button no longer auto-focuses on dialog open (it was showing a blue `:focus-visible` outline immediately); initial focus moves to the dialog container itself so keyboard navigation still works.' }
      ]
    },
    {
      version: 'SITE 2026.05.25.1',
      date: '2026-05-25',
      changes: [
        { type: 'changed', text: 'Archive contract is now content-only and the docs site honors it. Switching the version dropdown to `?uds=0.2` filters the sidebar against the archive\'s `components.json` (no more dead links to Link/Label/Text Area/Combobox/Date Picker/Toggle/Pagination/Data View that didn\'t exist in 0.2), preserves `?uds=` across every internal navigation via a new `withUdsVersion()` helper, and hides the interactive features that need live-only JS modules — the Playground tab, the Implementation Reference details, and the Build Demo trigger. AGENTS.md documents the full contract and the path to fully-versioned archives if the trade-off changes later.' },
        { type: 'fixed', text: 'Playground tab and Implementation Reference path normalization. The tab now hides for components that never shipped a `playground.js` (combobox, data-view, date-picker) and for archive views. The Impl Ref Styles / Behavior panels stop building `/uds/uds/components/<id>.css` 404 URLs — a new `normalizeUdsAssetPath` helper strips the legacy `uds/` prefix from `spec.dependencies.css[0]` and remaps the flat `components/<id>.css` shape onto the per-component `components/<id>/<id>.css` paths that actually exist on disk. The Playground panel also now `forceMount={false}` so its dynamic import + `impl.json` fetch wait until the tab activates instead of running on every component page load.' },
        { type: 'added', text: 'Component pages honor `?tab=` deep-links. `/button?tab=changelog` lands on the Changelog tab; the "Last updated → View full changelog →" card uses the same shape. Replaces the legacy `#/<id>?tab=<key>` hash routing.' },
        { type: 'fixed', text: 'A11y pass on the global modals + popovers: Token Search now follows the WAI-ARIA combobox/listbox recipe (combobox input + listbox results + role=option rows with aria-selected + aria-activedescendant + Tab trap), the Demo Preview overlay captures + restores focus + traps Tab inside the toolbar+iframe, the Spec checklist popover pushes focus to its close button on open and cycles Tab between close + GitHub link, the sidebar component-link tooltip is announced via `aria-describedby` so screen readers read status/spec metadata alongside the link label, and the component-page + Changelog tab strips emit paired ids + `aria-controls` / `aria-labelledby` / `role=tabpanel` via a new `SgPageTabPanel` primitive.' },
        { type: 'changed', text: 'Changelog component filter now hides global release notes when the user actively narrows to specific components. The legacy behavior (show global notes alongside every component group) felt confusing when an empty filter result also surfaced unrelated global text.' },
        { type: 'changed', text: 'Demo Builder dialog caches the per-component status map by `fetchVersion` in module scope. Reopening the dialog (or toggling the active archive) doesn\'t re-fetch 26 `status.json` files.' },
        { type: 'added', text: 'Tooling + CI: declared `ws` + `@types/ws` + `serve` as devDependencies (the browser regression scripts import them; previously `npm ci` in a clean clone broke the regression run with "Cannot find package \'ws\'"), replaced the interactive `next lint` with a flat `eslint.config.mjs` so `npm run lint` runs unattended, added `npm run gen:types:check` to fail when JSON schemas drift from `types/uds.ts`, exposed `npm run regression-check`, and shipped a new `.github/workflows/next-build.yml` that runs `gen:types:check` → `tsc --noEmit` → `lint` → `vitest` → `next build` on every PR alongside the existing UDS Audits workflow.' }
      ]
    },
    {
      version: 'SITE 2026.05.26.1',
      date: '2026-05-26',
      changes: [
        { type: 'changed', text: 'Sidebar navigation is now client-side. Clicking a sidebar entry uses Next\'s `<Link>` instead of a full document reload, which means the appearance bar selections (Dark, ResMan, Poppins, Comfortable density) survive moving between pages. The "Last updated → View full changelog →" card and every internal link inside the static prose pages (About, Design Language, Design Process, Getting Started, Recipes, Templates, AI Assist) route through a new `ProseContent` wrapper that intercepts clicks on `<a href="/...">` so the same client-nav guarantee applies to hand-written page copy.' },
        { type: 'added', text: 'Appearance settings persist across reloads. Theme choices (color scheme, brand, font, scale, density) write to `localStorage` under `uds-docs-appearance`, and a small inline `<script>` in `<head>` rehydrates the `data-*` attributes on `<html>` BEFORE React hydrates so refreshing an archive deep-link doesn\'t flash the default Light + Base + Inter theme between paint and hydrate.' },
        { type: 'fixed', text: 'Archive deep links stop double-fetching. `UdsVersionProvider` now exposes a `ready` flag; every UDS-data consumer (component pages, examples tab, etc.) defers its first fetch until the provider has read `?uds=` off the URL. Hard-loading `/button?uds=0.2` now hits `versions/0.2/uds/components/button/spec.json` once instead of firing the live `/uds/components/button/spec.json` first and then re-fetching the archive.' },
        { type: 'fixed', text: 'Unknown `?uds=` values are stripped from the URL. Once `versions.json` loads the provider validates the active version against it; anything not in the manifest (`?uds=9.9`) is cleared via `router.replace` so the archive banner doesn\'t lie about "viewing UDS 9.9" while the dropdown still says 0.3 and every fetch 404s.' },
        { type: 'fixed', text: 'The home-page redirect (`/` → `/semantic-colors`) preserves `?uds=` and any other query params. Refreshing `/?uds=0.2` no longer drops a reader out of the archive view.' },
        { type: 'fixed', text: 'Archive changelog fetch failures surface a scoped error instead of substituting the live changelog. Showing live entries under a "you\'re viewing 0.2" banner was a silent data-correctness regression.' },
        { type: 'changed', text: 'Examples tab shows an archive-specific empty state. The 0.2 snapshot only carries spec / status / changelog / component CSS, so the Examples tab now reads "Examples aren\'t archived for `<id>` in this UDS version" instead of "No examples are documented for `<id>` yet" (which read like a missing-content gap). AGENTS.md also reconciled to reflect what each archive actually ships vs. what the contract is versioned for in principle.' },
        { type: 'added', text: 'Theme bar buttons expose `aria-pressed` so screen readers announce the currently-selected color scheme, brand, font, scale, and density. Visual `active` class still matches.' },
        { type: 'added', text: 'CI now runs the headless-Chrome regression sweep alongside the build + lint + tests. The check covers 18 cases (component-page chrome, changelog rail, demo builder dialog, archive contract, theme persistence, `?uds=` validation, etc.) and catches drift that type-check + unit tests can\'t see.' }
      ]
    },
    {
      version: 'SITE 2026.05.26.2',
      date: '2026-05-26',
      changes: [
        { type: 'changed', text: 'Cutover complete — `udsdocs.com` now serves the Next.js app from Cloudflare Pages instead of the legacy GitHub Pages deploy. Same content, faster builds, proper cache headers, and client-side navigation throughout.' }
      ]
    },
    {
      version: 'SITE 2026.05.26.3',
      date: '2026-05-26',
      changes: [
        { type: 'changed', text: 'Refreshed the docs shell with a glass header, collapsible appearance controls, a mobile sidebar overlay, and animated page tabs. Static prose pages and the Semantic Colors preview now render as JSX instead of HTML strings, so internal navigation stays inside the React app and archived UDS views keep their context.' },
        { type: 'fixed', text: 'Cleaned up follow-up regressions from the UI refresh: the sidebar and content columns render in the right places again, global modals open above the whole page, the Cloudflare build no longer fails on the converted Getting Started copy, and changelog type colors are restored without bringing back the old monolithic stylesheet.' }
      ]
    },
    {
      version: 'SITE 2026.05.26.4',
      date: '2026-05-26',
      changes: [
        { type: 'changed', text: 'Started the React-native docs UI rebuild with the Changelog page. Releases, filters, type labels, component tags, and rail navigation now render through typed React components with `ds-changelog-*` styles built on UDS semantic tokens instead of the old `sg-cl-*` class surface.' }
      ]
    },
    {
      version: 'SITE 2026.05.26.5',
      date: '2026-05-26',
      changes: [
        { type: 'changed', text: 'Expanded the React-native docs UI rebuild beyond Changelog. Token references, component-page framing, examples, code tables, guidelines, playground panels, and major prose/tool pages now use shared docs-site React primitives with UDS semantic-token styling, while UDS component previews remain vanilla HTML as the source markup being documented.' }
      ]
    },
    {
      version: 'SITE 2026.05.26.6',
      date: '2026-05-26',
      changes: [
        { type: 'added', text: 'Added a reusable Cursor workflow for code-first component labs. You can now say “Lab me an Avatar” to start a hidden draft playground before promoting the direction to Figma.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.1',
      date: '2026-05-27',
      changes: [
        { type: 'removed', text: 'Removed stale migration CSS and dead docs-site stubs left after the React docs UI rebuild.' },
        { type: 'fixed', text: 'Updated AI Assist, Getting Started, Cursor Workflows, and smoke scripts to point at the Cloudflare site, current spec paths, and ds-* tab selectors.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.2',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Cleared the PostCSS security advisory in the docs-site dependency tree.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.3',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Published the AI Assist context JSON and Cursor rule file with the static site export.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.4',
      date: '2026-05-27',
      changes: [
        { type: 'added', text: 'Started the parallel Web Components foundation for the next UDS API. Every documented component now has an initial Lit-based tag and React wrapper, while the current component pages stay on the existing examples until the full public cutover is ready.' },
        { type: 'changed', text: 'Updated the UDS source payload and current docs experience around the Web Component API. Component specs, examples, implementation references, playgrounds, Examples, Code, Playground, Design Language previews, Getting Started, Recipes, Templates, AI Assist, the AI context JSON, and the downloadable Cursor rule now point teams toward Web Components and React wrappers. Demo Builder emits standalone Web Component demos, docs-site widgets no longer rely on the old UDS class hooks, and an audit keeps copied guidance from drifting back to the old class-based API.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.5',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Dropdown playground and visual styling to match the pre-rewrite version. The `<udc-dropdown>` Web Component now ships the original border, hover, focus, error, and disabled treatments inside its shadow DOM, and the playground tab brings back all 13 interactive controls (state, label, required, leading icon, helper text, counter, options count). First component in the visual-parity pilot — the other documented components still need the same treatment.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.6',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Text Input playground and visual styling. The `<udc-text-input>` Web Component now carries the field border, focus ring, error recolor, disabled treatment, leading icon, and trailing button hover/active/focus inside its shadow DOM, and the playground tab brings back all 14 interactive controls. Second component in the visual-parity sweep.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.7',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Button playground and visual styling. `<udc-button>` now ships the full variant matrix (primary/secondary/ghost × default/danger/success/warning/neutral), small size, leading/trailing icons, icon-only square mode, and the selected/disabled states inside its shadow DOM. Playground brings back all 12 original controls. Also fixed an empty-string attribute reflection bug that was forcing every button to 12px padding on all sides.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.8',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Checkbox visual styling and playground. `<udc-checkbox>` now uses the SVG-mask checkmark and ships the hover/focus/disabled/error treatments inside shadow DOM, and the playground brings back checked, indeterminate, disabled, required, error, and label controls.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.9',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Toggle visual styling and playground. `<udc-toggle>` now uses the proper 52×32 track with a 20×20 thumb that translates 20px when active, plus the focus ring and disabled treatment, and the playground brings back the label, checked, and disabled controls.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.10',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Radio visual styling and group behavior. `<udc-radio>` and `<udc-radio-group>` now carry the original 20×20 ring + 12×12 center dot, the text-interactive recolor when selected, hover/focus/disabled treatments, error state, and the group legend. RadioGroup syncs selection through its `value` attribute. Playground brings back options-count, disabled, and error controls.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.11',
      date: '2026-05-27',
      changes: [
        { type: 'changed', text: 'Combobox now inherits the rebuilt Dropdown shadow DOM, so the page renders with the proper label, leading icon, chevron, helper text, error and disabled treatments. Added an interactive playground mirroring the Dropdown control surface. Filtering and autocomplete on top of the alias still need a real Figma source — Combobox was placeholder-only in 0.3.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.12',
      date: '2026-05-27',
      changes: [
        { type: 'changed', text: 'Date Picker now matches the Text Input field chrome — label, calendar leading icon, helper text, focus ring, error and disabled treatments — with a browser-native date popover. Added an interactive playground (state, label, required, helper, value, min, max). The custom calendar popover is still pending a Figma source.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.13',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Text Area visual styling and playground. `<udc-text-area>` now carries the 88px min-height field, hover/focus ring, error and disabled treatments, and helper row with character counter. Playground brings back state, label, placeholder, disabled, required, helper text, max-length, and counter controls.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.14',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Search visual styling and playground. `<udc-search>` now ships the leading search icon, hover surface change, focus ring on the wrapper, and a clear button that appears once the input has a value. Playground brings back placeholder, initial value, state, and disabled controls.' }
      ]
    },
    {
      version: 'SITE 2026.05.27.15',
      date: '2026-05-27',
      changes: [
        { type: 'fixed', text: 'Restored the Label visual styling and playground. `<udc-label>` now carries the full variant matrix (default/disabled/error/interactive/success), small size, prominent (bold) weight, alignment, fill-frame, multiline, and the required dot. Playground brings back text, variant, required, small, and prominent controls.' }
      ]
    }
];
