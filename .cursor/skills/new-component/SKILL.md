---
name: new-component
description: Scaffold a new UDS component end to end. Creates uds/components/<id>/ with all required files (CSS stub, spec.json, status.json, changelog.json, examples/, playground.js), adds the sidebar link in components/site/SiteSidebar.tsx, and adds a SITE_CHANGELOG entry. Triggers on phrases like "add a component", "scaffold a new component", "new component called X", "set up a new component for Y".
lastUpdated: 2026-05-24T09:19:52Z
---

# New Component Scaffold

Scaffolds a new UDS component end-to-end: creates the
`uds/components/<id>/` folder with every required file (CSS stub,
`spec.json`, `status.json`, `changelog.json`, `examples/`,
`playground.js`, `impl.json`) and wires the sidebar link in
`uds-docs/components/site/SiteSidebar.tsx`. The dynamic component
renderer at `app/(site)/[componentId]/page.tsx` picks up the new
component automatically via `generateStaticParams`, so no per-page
scaffolding is needed beyond the sidebar link and the `data/` entry.

After the skill finishes, the component appears in the sidebar with a
"Spec X/22" pill in red (placeholder status), ready for the designer to
flesh out the spec and visual examples.

## Naming source of truth

Every name written into `spec.json` — `component`, `title`, slot
names, state names, prop names, variant values, event names — comes
from [`uds-naming-conventions.mdc`](../../rules/uds-naming-conventions.mdc),
not from this skill's prose or from sibling specs. Specifically:

- **`component`** — kebab-case (section 8 of the naming framework).
- **`title`** — Title Case with spaces (section 8).
- **`states[]`** — the eight standard state names plus the two
 conditional ones (section 1). Reserve Checked for form controls
 and Current for navigation (also section 1).
- **`props[]`** for size — `sm` / `md` / `lg`, only on components
 that are genuinely on the perceptual size scale (section 2).
- **`props[]`** for tone, emphasis, slot regions — match sections
 3, 4, and 5.
- **`events[]`** — present tense, single word where possible
 (section 7).

When this skill fills the template with placeholders, the placeholders
should look like the framework's vocabulary so the designer's first
real edit is "add the details," not "rename half of these."

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

## Step 2 — Create the component folder

```bash
mkdir -p uds-docs/uds/components/<id>/examples
```

## Step 3 — Write `uds/components/<id>/spec.json`

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

## Step 4 — Write `uds/components/<id>/status.json`

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

## Step 5 — Write `uds/components/<id>/changelog.json`

```json
{
  "$schema": "../../schemas/changelog.schema.json",
  "addedIn": "<UDS_VERSION>",
  "entries": [
    { "version": "<UDS_VERSION>", "type": "added", "text": "Initial placeholder for <Title>." }
  ]
}
```

## Step 6 — Create the empty CSS file + minimal example

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

## Step 7 — Write `uds/components/<id>/playground.js`

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

## Step 8 — Add the sidebar link in `components/site/SiteSidebar.tsx`

Find the requested sidebar group's `NavSection` block (e.g.
`heading: 'Forms & Actions'`) and append a new `NavLink` entry inside
its `links` array, alphabetised against its siblings:

```ts
{ label: '<Title>', href: '/<id>' },
```

The component renderer at `app/(site)/[componentId]/page.tsx` picks up
the new id automatically via `generateStaticParams` — no per-page
scaffolding is needed.

## Step 9 — Add the Code-tab API data

Create `uds-docs/data/component-api/<id>.ts` so the Code tab can render
the component's API surface (CSS classes + data attributes). Use the
minimum shape:

```ts
import type { ComponentApi } from './types';

export const <camelId>Api: ComponentApi = {
  importPath: './components/<id>.css',
  cssClasses: [
    // Placeholder — designer to fill in after the real CSS is written.
  ],
  attributes: [],
};
```

`audit-css-api-table.sh` will pass even with an empty `cssClasses` array
(it skips components with no `cssClasses`); it fails only when the
array exists but disagrees with the CSS file.

## Step 10 — Add the component CSS import

Run:

```bash
python3 -c "import sys; sys.path.insert(0, 'scripts/lib'); from migrate_component import regenerate_uds_orchestrators; print(regenerate_uds_orchestrators(False))"
```

This regenerates `uds-docs/uds/uds.css` with the new component's CSS
import. Hand-editing the imports is forbidden — always run the regenerator.

## Step 11 — SITE changelog entry

Append to the `SITE_CHANGELOG` array in
`uds-docs/data/site-changelog.ts`:

```ts
{
  version: '<YYYY.MM.DD.N>',
  date: '<YYYY-MM-DD>',
  changes: [
    { type: 'added', text: 'Scaffolded new <Title> component (<id>) — placeholder status.' },
  ],
},
```

Use `date -u +%Y-%m-%d` if you need to look up today's date.

## Step 12 — Run audits + verify

```bash
bash scripts/audit-component-completeness.sh
bash scripts/audit-placeholders.sh
bash scripts/audit-token-usage.sh
```

All three must pass. Then run `npm run build && npx serve uds-docs/out -p 4000`
(or use the existing dev server) and open `http://localhost:4000/<id>` and confirm:
- Sidebar link appears under the requested group
- Page header shows "Spec X/22" pill (red, since spec is at minimum)
- Status badge reads "Not Started" / "Placeholder"
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
- **Don't put example HTML inline in any React component.** Examples
  live in `uds/components/<id>/examples/*.html` and are rendered by the
  Examples tab + Demo Builder from there.
- **Don't fill `motion` or `responsive` fields.** They're intentionally
  deferred until UDS has motion / breakpoint tokens.

## See also

- [`uds/schemas/spec.schema.json`](../../../uds-docs/uds/schemas/spec.schema.json) — canonical spec field list
- [`uds-content-schema.mdc`](../../rules/uds-content-schema.mdc) — JSON-only spec editing rule
- [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc) — what "complete" means
