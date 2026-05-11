---
name: new-component
description: Scaffold a new UDS component end to end. Creates uds/components/<id>/ with all required files (CSS stub, spec.json, status.json, changelog.json, examples/, playground.js), bumps SITE, adds the sidebar link and placeholder data-page block. Triggers on phrases like "add a component", "scaffold a new component", "new component called X", "set up a new component for Y".
---

# New Component Scaffold

Walks the [How to Contribute](../../../uds-docs/index.html) workflow steps 4-5
mechanically. After the skill finishes, the component appears in the
sidebar with a "Spec X/22" pill in red (placeholder status), ready for the
designer to flesh out the spec and visual examples.

## Step 1 — Collect required inputs from the user

Ask for these. Don't proceed until you have all of them.

| Field | Format / example | Notes |
|---|---|---|
| `id` | kebab-case, no `udc-` prefix (e.g. `toggle-switch`) | Becomes the folder name `uds/components/<id>/`, the `data-page` attribute, and the `<id>.css` filename |
| `title` | Title Case (e.g. "Toggle Switch") | Sidebar label and `<h1>` page title |
| `description` | One paragraph | Why this component exists. Goes into `description` field. |
| `whenToUse` | 1-2 sentences | Goes into `whenToUse` field. |
| `whenNotToUse` | 1-2 sentences with an alternative component | Goes into `whenNotToUse` field. |
| `sidebarGroup` | One of: Forms & Actions / Status & Indicators / Layout / Navigation / Content / Feedback | Determines where the sidebar link is inserted. |
| `designerOwner` | Person's name, or "Unassigned" | Goes into `owner.designer`. |

Use the `AskQuestion` tool with multiple options where the answer is
constrained (sidebar group), and free-text questions for the rest. Group
questions logically — don't ask seven things at once.

## Step 2 — Run the SITE version bump first

Per [`uds-master-preflight.mdc`](../../rules/uds-master-preflight.mdc),
bump-first:

```bash
bash uds-docs/bump-site.sh
```

Capture the new version string from the script output. You'll need it for
the SITE_CHANGELOG entry at the end.

## Step 3 — Create the component folder

```bash
mkdir -p uds-docs/uds/components/<id>/examples
```

## Step 4 — Write `uds/components/<id>/spec.json`

Use this template, with `<...>` placeholders filled in from Step 1. All
other fields stay empty/null — the renderer hides empty sections.

```json
{
  "$schema": "../../schemas/spec.schema.json",
  "component": "<id>",
  "title": "<Title>",
  "description": "<one paragraph>",
  "whenToUse": "<when to use>",
  "whenNotToUse": "<when not to use>",
  "acceptanceCriteria": [],
  "dependencies": {
    "css": ["uds/components/<id>/<id>.css"],
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
  "storybookSlug": null,
  "implReference": null
}
```

## Step 5 — Write `uds/components/<id>/status.json`

```json
{
  "$schema": "../../schemas/status.schema.json",
  "current": "placeholder",
  "since": "<UDS_VERSION from uds/version.json>",
  "history": [
    { "version": "<UDS_VERSION>", "status": "placeholder" }
  ]
}
```

## Step 6 — Write `uds/components/<id>/changelog.json`

```json
{
  "$schema": "../../schemas/changelog.schema.json",
  "addedIn": "<UDS_VERSION>",
  "entries": [
    { "version": "<UDS_VERSION>", "type": "added", "text": "Initial placeholder for <Title>." }
  ]
}
```

## Step 7 — Create the empty CSS file + minimal example

```bash
touch uds-docs/uds/components/<id>/<id>.css
```

Write a placeholder example HTML file:

```bash
cat > uds-docs/uds/components/<id>/examples/default.html <<'EOF'
<div class="udc-<id>">
  <p>Default example placeholder. Designer to add real markup.</p>
</div>
EOF
```

And the manifest:

```json
{
  "$schema": "../../../schemas/manifest.schema.json",
  "examples": [
    {
      "id": "default",
      "file": "default.html",
      "label": "Default",
      "showInDocs": true,
      "demoWeight": 0
    }
  ]
}
```

`demoWeight: 0` excludes the placeholder from the Demo Builder until a real
example is written.

## Step 8 — Write `uds/components/<id>/playground.js`

```js
// Playground config for the <id> component.
export default {
  controls: [],
  render: function (state) {
    return {
      html: '<div class="udc-<id>">Placeholder</div>',
      code: '<!-- placeholder; designer to add real markup -->'
    };
  }
};
```

## Step 9 — Add the sidebar link in `uds-docs/index.html`

Find the requested sidebar group heading (e.g.
`<span class="sg-sidebar-heading">Forms &amp; Actions</span>`) and insert a
new link as the LAST entry within that group:

```html
<a class="sg-sidebar-link" href="#/<id>"><Title></a>
```

## Step 10 — Add page placeholder in `uds-docs/index.html`

Insert a new `<div data-page="<id>">` block just before `</main>`:

```html
<!-- <TITLE> -->
<div data-page="<id>" data-default-tab="examples">
  <h1 class="sg-page-title"><Title></h1>
  <p class="sg-page-desc"><description></p>
  <div class="sg-page-tabs" role="tablist">
    <button class="sg-page-tab" data-tab="examples" aria-selected="true">Examples</button>
    <button class="sg-page-tab" data-tab="code">Code</button>
    <button class="sg-page-tab" data-tab="guidelines">Guidelines</button>
    <button class="sg-page-tab" data-tab="changelog">Changelog</button>
    <button class="sg-page-tab" data-tab="playground">Playground</button>
  </div>
  <div data-tab-panel="examples" class="active" data-needs-fetch></div>
  <div data-tab-panel="code"><p class="sg-subsection-desc">Code examples will be added here.</p></div>
  <div data-tab-panel="guidelines"></div>
  <div data-tab-panel="changelog"><p class="sg-changelog-empty">No changes recorded yet.</p></div>
  <div data-tab-panel="playground"></div>
</div>
```

The `examples` panel uses `data-needs-fetch` so the docs renderer
lazy-loads from `uds/components/<id>/examples/`. The `guidelines` panel
stays empty — `renderGuidelines()` fills it from `spec.json` at runtime.

## Step 11 — Add the component CSS import

Run from the **repository root** (`/workspace/`) so `scripts/lib` resolves:

```bash
python3 -c "import sys; sys.path.insert(0, 'scripts/lib'); from migrate_component import regenerate_uds_orchestrators; print(regenerate_uds_orchestrators(False))"
```

This regenerates `uds-docs/uds/uds.css` with the new component's CSS
import. Hand-editing the imports is forbidden — always run the regenerator.

Then run `bash scripts/aggregate-components.sh` from the repo root so the new component appears in `uds-docs/uds/components.json` (the manifest used by `app.js` to enumerate components at boot).

## Step 12 — Cache-bust + SITE changelog entry

In `uds-docs/index.html`, bump `?v=N` on `docs/app.js` and `uds/uds.css`.

In `uds-docs/docs/data/site-changelog.js`, append to `SITE_CHANGELOG`:

```js
{
  version: '<SITE_VERSION_FROM_STEP_2>',
  date: '<YYYY-MM-DD>',
  changes: [
    { type: 'added', text: 'Scaffolded new <Title> component (<id>) — placeholder status, spec ~6/22' }
  ]
}
```

## Step 13 — Run audits + verify

```bash
bash scripts/audit-component-completeness.sh
bash scripts/audit-placeholders.sh
bash scripts/audit-token-usage.sh
```

All three must pass. Then open `http://localhost:4000/#/<id>` and confirm:
- Sidebar link appears under the requested group
- Page header shows "Spec X/22" pill (red, since spec is at minimum)
- Status badge reads "Not Started" / "Placeholder"
- "Not production-ready" banner appears below the title
- Guidelines tab renders the description, when-to-use, when-not-to-use,
  dependencies, and keyboard sections from the spec.json
- Examples tab shows the placeholder default example
- Changelog tab shows the initial entry

Then report to the user:
- Component `<id>` scaffolded at spec completeness ~6/22
- The `<id>.css` file is empty and ready for visual styles
- The placeholder example needs to be replaced by the designer with real markup
- Demo Builder excluded (`demoWeight: 0`) until a real example exists

## DO NOT

- **Don't fabricate visual examples or API tables.** Those need designer +
  developer input. Leave the placeholder example in place.
- **Don't add a per-component CHANGELOG entry that claims production-ready.**
  Status MUST start as `placeholder`.
- **Don't write Storybook code.** Production component code lives in the
  UDS Storybook repo.
- **Don't put HTML spec content into `index.html`'s Guidelines panel.** The
  panel must stay empty — the renderer fills it from `spec.json`.
- **Don't put example HTML inline in `index.html`.** Examples live in
  `uds/components/<id>/examples/*.html` and are rendered by the docs page +
  Demo Builder from there.
- **Don't fill `motion` or `responsive` fields.** They're intentionally
  deferred until UDS has motion / breakpoint tokens.

## See also

- [`uds/schemas/spec.schema.json`](../../../uds-docs/uds/schemas/spec.schema.json) — canonical spec field list
- [`uds-content-schema.mdc`](../../rules/uds-content-schema.mdc) — JSON-only spec editing rule
- [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc) — what "complete" means
- [How to Contribute](../../../uds-docs/docs/pages/contribute.html) page (rendered at `#/contribute` on the live site) — full contributor workflow
