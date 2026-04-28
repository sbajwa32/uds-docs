---
name: new-component
description: Scaffold a new UDS component end to end. Use when adding a new component to UDS — creates content/<id>.json, an empty CSS file, sidebar entry, page section, COMPONENT_STATUS entry, and bumps the SITE version. Triggers on phrases like "add a component", "scaffold a new component", "new component called X", "set up a new component for Y".
---

# New Component Scaffold

Walks the [How to Contribute](../../uds-docs/index.html) workflow steps 4-5 mechanically. After the skill finishes, the component appears in the sidebar with a "Spec X/22" pill in red (placeholder status), ready for the designer to flesh out the spec and visual examples.

## Step 1 — Collect required inputs from the user

Ask the user for these. Don't proceed until you have all of them.

| Field | Format / example | Notes |
|---|---|---|
| `id` | kebab-case, no `udc-` prefix (e.g. `toggle-switch`) | Becomes `data-page="<id>"`, `content/<id>.json`, `uds/components/<id>.css` |
| `title` | Title Case (e.g. "Toggle Switch") | Sidebar label and `<h1>` page title |
| `description` | One paragraph | Why this component exists. Goes into `description` field. |
| `whenToUse` | 1-2 sentences | Goes into `whenToUse` field. |
| `whenNotToUse` | 1-2 sentences with an alternative component | Goes into `whenNotToUse` field. |
| `sidebarGroup` | One of: Forms & Actions / Status & Indicators / Layout / Navigation / Content / Feedback | Determines where the sidebar link is inserted. |
| `designerOwner` | Person's name, or "Unassigned" | Goes into `owner.designer`. |

Use the `AskQuestion` tool with multiple options where the answer is constrained (sidebar group), and free-text questions for the rest. Group questions logically — don't ask seven things at once.

## Step 2 — Run the SITE version bump first

Per [`uds-master-preflight.mdc`](../../rules/uds-master-preflight.mdc), bump-first:

```bash
bash uds-docs/bump-site.sh
```

Capture the new version string from the script output. You'll need it for the SITE_CHANGELOG entry at the end.

## Step 3 — Create the JSON spec file

Write `uds-docs/content/<id>.json` using this exact template, with `<...>` placeholders filled in from Step 1. All other fields stay empty/null — the renderer hides empty sections, so there's no "TBD" noise on the live page.

```json
{
  "component": "<id>",
  "title": "<Title>",
  "description": "<one paragraph>",
  "whenToUse": "<when to use>",
  "whenNotToUse": "<when not to use>",
  "acceptanceCriteria": [],
  "dependencies": {
    "css": ["uds/components/<id>.css"],
    "js": []
  },
  "props": [],
  "events": [],
  "slots": [],
  "states": [],
  "contentGuidelines": null,
  "commonlyPairedWith": [],
  "dosDonts": { "dos": [], "donts": [] },
  "accessibility": {
    "keyboard": [
      { "key": "Tab", "action": "Move focus to/from the component" }
    ],
    "screenReader": [],
    "wcag": [],
    "contrast": []
  },
  "knownIssues": [],
  "performance": null,
  "motion": null,
  "responsive": null,
  "visualHierarchy": null,
  "densityBehavior": null,
  "owner": { "designer": "<designerOwner>", "developer": "Unassigned" },
  "draft": false,
  "figmaNodeId": null,
  "storybookSlug": null
}
```

This produces a spec at the required minimum (~6/22 fields). The renderer will show "Spec 6/22" in red on the page header until more fields get filled in.

## Step 4 — Create an empty CSS file

```bash
touch uds-docs/uds/components/<id>.css
```

The file should exist but stay empty — the designer/dev will fill it in. The component's `dependencies.css` JSON entry already references this path.

## Step 5 — Add sidebar entry to `uds-docs/index.html`

Find the requested sidebar group heading (e.g. `<span class="sg-sidebar-heading">Forms &amp; Actions</span>`) and insert a new link as the LAST entry within that group:

```html
<a class="sg-sidebar-link" href="#/<id>"><Title></a>
```

Place it just before the next `<span class="sg-sidebar-heading">` or before `</nav>` if it's the last group.

## Step 6 — Add page section to `uds-docs/index.html`

Insert a new `<div data-page="<id>">` block at the end of `<main class="sg-main">`, just before the closing `</main>` or just after the last existing component page. Use this exact structure (every component page on the site follows this shape — copy it):

```html
<!-- <TITLE> -->
<div data-page="<id>">
  <h1 class="sg-page-title"><Title></h1>
  <p class="sg-page-desc"><description></p>
  <div class="sg-page-tabs" role="tablist">
    <button class="sg-page-tab" data-tab="examples" aria-selected="true">Examples</button>
    <button class="sg-page-tab" data-tab="code">Code</button>
    <button class="sg-page-tab" data-tab="guidelines">Guidelines</button>
    <button class="sg-page-tab" data-tab="changelog">Changelog</button>
    <button class="sg-page-tab" data-tab="playground">Playground</button>
  </div>
  <div data-tab-panel="examples" class="active">
    <p class="sg-subsection-desc">Examples will be added here.</p>
  </div>
  <div data-tab-panel="code">
    <p class="sg-subsection-desc">Code examples will be added here.</p>
  </div>
  <div data-tab-panel="guidelines"></div>
  <div data-tab-panel="changelog"><p class="sg-changelog-empty">No changes recorded yet.</p></div>
  <div data-tab-panel="playground"></div>
</div>
```

The `guidelines` panel MUST stay empty — `renderGuidelines()` in `app.js` fills it from the JSON spec at runtime. See [`uds-content-schema.mdc`](../../rules/uds-content-schema.mdc).

## Step 7 — Add COMPONENT_STATUS entry in `uds-docs/app.js`

Find the `COMPONENT_STATUS` object and add a new entry. Use the current `UDS_VERSION` constant (read it from the same file) for `since`:

```js
'<id>': { status: 'placeholder', since: '<UDS_VERSION>' },
```

Status starts as `placeholder` — the designer bumps it through `blocked` → `in-progress` → `review` → `production` over time.

## Step 8 — Bump the cache-bust on `app.js`

Find the `<script src="./app.js?v=N"></script>` line in `index.html` and increment `N` by 1.

## Step 9 — Add SITE_CHANGELOG entry

Find the `SITE_CHANGELOG` array in `app.js` and append a new entry at the end (newest entries go last):

```js
{
  version: '<SITE_VERSION_FROM_STEP_2>',
  date: '<YYYY-MM-DD>',
  changes: [
    { type: 'added', text: 'Scaffolded new <Title> component (<id>) — placeholder status, spec ~6/22' }
  ]
}
```

## Step 10 — Verify and report

Open the site at `#/<id>` and confirm:
- Sidebar link appears under the requested group with a red dot (low spec completeness)
- Page header shows "Spec X/22" pill (red)
- Status badge reads "Not Started" / "Placeholder"
- "Not production-ready" banner appears below the title
- Guidelines tab renders the description, when-to-use, when-not-to-use, dependencies, and keyboard sections from the JSON

Then report to the user:
- Component `<id>` scaffolded at spec completeness ~6/22
- What's still empty in the JSON: `acceptanceCriteria`, `props`, `events`, `slots`, `states`, `dosDonts`, `accessibility.screenReader`, `accessibility.wcag`, `accessibility.contrast`, `commonlyPairedWith`, `knownIssues`, `figmaNodeId`, `storybookSlug`
- The `<id>.css` file is empty and ready for visual styles
- Examples tab and Code tab still show placeholder text — the designer needs to add real visual examples and HTML markup

## DO NOT

- **Don't fabricate visual examples or API tables.** Those need designer + developer input. Leave the Examples/Code tab placeholder paragraphs in place.
- **Don't add a CHANGELOG entry under `category: 'components'`.** That happens at release time per [`uds-release-workflow.mdc`](../../rules/uds-release-workflow.mdc), not when scaffolding. The SITE_CHANGELOG entry from Step 9 is enough.
- **Don't claim production-ready.** Status MUST start as `placeholder`. The designer changes it later.
- **Don't write Storybook code.** Production component code lives in the UDS Storybook repo, not the doc site.
- **Don't put HTML spec content into `index.html`'s Guidelines panel.** The panel must stay empty — the renderer fills it from the JSON. Per [`uds-content-schema.mdc`](../../rules/uds-content-schema.mdc).
- **Don't fill `motion` or `responsive` fields.** They're intentionally deferred until UDS has motion / breakpoint tokens.

## See also

- [`content/schema.json`](../../../uds-docs/content/schema.json) — canonical field list
- [`uds-content-schema.mdc`](../../rules/uds-content-schema.mdc) — JSON-only spec editing rule
- [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc) — what "complete" means
- [How to Contribute](../../../uds-docs/index.html) page (`#/contribute`) — full 9-step workflow on the doc site
