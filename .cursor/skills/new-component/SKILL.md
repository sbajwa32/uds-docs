---
name: new-component
description: Scaffold a new UDS component end to end. Creates uds/components/<id>/ with all required files (CSS stub, spec.json, status.json, changelog.json, examples/, playground.js), adds the sidebar link in components/site/SiteSidebar.tsx, and adds a SITE_CHANGELOG entry. Triggers on phrases like "add a component", "scaffold a new component", "new component called X", "set up a new component for Y".
lastUpdated: 2026-06-25T21:03:47Z
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

## Families (one folder, multiple member tags)

A **family** is ONE docs component (the stem id) whose Figma page hosts several
public `udc-<stem>...` member sets — `udc-data-field` + `udc-data-field-group`,
or `udc-accordion-item` + `udc-accordion-group` — documented together in one
spec, the way `radio` documents `<udc-radio>` and `<udc-radio-group>`. See
[`uds-naming-conventions.mdc`](../../rules/uds-naming-conventions.mdc) §8.

A family scaffolds ONE `uds/components/<stem>/` folder and ONE sidebar link
(the stem), but registers EVERY member tag. The shape to mirror is the live
`radio` component: one spec, one nested example, and a Web Component file +
React wrappers that define every member element. Where a step below has a
**Family** note, follow it. Two rules hold throughout:

- ONE folder, ONE sidebar link, ONE status, ONE changelog — never one per member.
- The **primary** member is the base `udc-<stem>` if it exists (`data-field`),
  else the member you designate (`accordion`, which has no bare `udc-accordion`).
  `figmaNodeId` and the default example lead with the primary.

The one current limit: the Code-tab API table (`data/component-api/<stem>.ts`)
is built for a single tag, so a family starts with a stub there (same as
`radio` today). Per-tag API tables are a separate docs-site enhancement, not a
scaffolder job.

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

## Component contract baseline

Before writing the scaffold, apply
[`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc).
Classify the component as `layout`, `display`, `action`, `form`,
`navigation`, `feedback`, or `data`, then include starter placeholders for the
states and API fields that class requires. If a baseline state does not belong
to the component, write an explicit `notApplicable` reason instead of leaving
the gap ambiguous.

New documented components target the current stack:

- Web Component implementation in `@uds/web-components`
- React wrapper in `@uds/react`
- real `<udc-*>` examples and playground markup
- no new legacy per-component behavior file and no `uds/uds.js` wiring

## Step 1 — Collect required inputs from the user

Ask for these. Don't proceed until you have all of them.

| Field | Format / example | Notes |
|---|---|---|
| `id` | kebab-case, no `udc-` prefix (e.g. `toggle-switch`) | Becomes the folder name `uds/components/<id>/`, the route segment, the `<udc-*>` tag suffix, and the `<id>.css` filename. For a **family**, this is the stem (`data-field`, `accordion`). |
| `familyMembers` | List of the OTHER member tags, kebab-case, no `udc-` prefix (e.g. `["data-field-group"]`) | Optional — present only for a **family**. Each becomes a `<udc-<member>>` tag + Web Component element + React wrapper under the one stem folder. Primary = `id` if it's a member, else the first `familyMembers` entry. |
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

**Family.** Keep ONE spec.json at the stem id. Add an `acceptanceCriteria`
entry naming the public tags (mirror radio: `"Public API uses <udc-<stem>>,
<udc-<stem>-group> Web Component tags."`) and merge each member's props /
events / slots into the one list, naming the owning member in each `description`
when it isn't obvious (the schema keeps props in one flat list — that's how
radio does it). Point `figmaNodeId` at the primary member.

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

## Step 6 — Create the CSS payload stub + minimal Web Component example

```bash
touch uds-docs/uds/components/<id>/<id>.css
```

Write a placeholder example HTML file:

```bash
cat > uds-docs/uds/components/<id>/examples/default.html <<'EOF'
<udc-<id>>
  Default example placeholder. Designer to add real markup.
</udc-<id>>
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

**Family.** Write ONE example that nests the members the way they're really
used, mirroring `uds/components/radio/examples/web-component.html`:

```html
<udc-<stem>-group ...>
  <udc-<stem> ...>Item</udc-<stem>>
  <udc-<stem> ...>Item</udc-<stem>>
</udc-<stem>-group>
```

Lead the default example with the primary member. (For `data-field`, the base
field is a standalone member and the group wraps several.)

## Step 7 — Write `uds/components/<id>/playground.js`

```js
// Playground config for the <id> component.
export default {
  controls: [],
  render: function (state) {
    const html = '<udc-<id>>Placeholder</udc-<id>>';
    return {
      html,
      code: html
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
the component's public API surface (attributes/properties, slots, events,
parts, and any retained CSS-class compatibility rows). Use the
minimum shape:

```ts
import type { ComponentApi } from './types';

export const <camelId>Api: ComponentApi = {
  importPath: '@uds/web-components',
  cssClasses: [],
  attributes: [],
};
```

`audit-css-api-table.sh` will pass even with an empty `cssClasses` array
(the Web Components runtime API usually lives in attributes/properties,
slots, events, and parts); it fails only when retained CSS-class rows
disagree with the payload CSS.

**Family.** One `data/component-api/<stem>.ts` for the stem. radio's is an empty
stub, so starting that way is fine; per-tag attributes/events for each member
are a later docs-site enhancement (the type is currently single-tag).

## Step 10 — Add the Web Component + React wrapper source

Add the runtime implementation to:

- `uds-docs/packages/uds-web-components/src/components/<id>.ts`
- `uds-docs/packages/uds-web-components/src/components/remaining.ts`
- `uds-docs/packages/uds-web-components/src/register.ts`
- `uds-docs/packages/uds-web-components/src/index.ts`
- `uds-docs/packages/uds-react/src/index.tsx`

The initial Web Component can be a token-bound placeholder, but it must register
the real `<udc-<id>>` tag and the React package must export a wrapper. Do not
add a legacy per-component behavior file or revive `uds/uds.js`.

**Family.** Define EVERY member element in
`packages/uds-web-components/src/components/<stem>.ts` (mirror `radio.ts`, which
defines both the radio and radio-group elements), register each `<udc-<member>>`
tag in `register.ts` + `index.ts`, and export one React wrapper per member in
`packages/uds-react/src/index.tsx` (mirror `UdsRadio` + `UdsRadioGroup`).

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
bash scripts/audit-demo-coverage.sh
bash scripts/audit-placeholders.sh
bash scripts/audit-token-usage.sh
bash scripts/audit-css-api-table.sh
bash scripts/audit-doc-internal-consistency.sh
```

All audits must pass. Then run `cd uds-docs && npm run build && npx vitest run`.
Use the dev server or static preview to open `/<id>` and confirm:
- Sidebar link appears under the requested group
- Page header shows "Spec X/22" pill (red, since spec is at minimum)
- Status badge reads "Not Started" / "Placeholder"
- Guidelines tab renders the description, when-to-use, when-not-to-use,
  dependencies, and keyboard sections from the spec.json
- Examples tab shows the placeholder default example
- Changelog tab shows the initial entry

Then report to the user:
- Component `<id>` scaffolded at spec completeness ~6/22
- The Web Component and React wrapper placeholders exist and need real design
  details before production use
- The placeholder example needs to be replaced with real `<udc-*>` markup
- Demo Builder excluded (`demoWeight: 0`) until a real example exists

## DO NOT

- **Don't fabricate visual examples or API tables.** Those need designer +
  developer input. Leave the placeholder example in place.
- **Don't add a per-component CHANGELOG entry that claims production-ready.**
  Status MUST start as `placeholder`.
- **Don't write Storybook code.** The docs package exports the Web Component
  and React wrapper; Storybook integration belongs in the Storybook repo when
  that package consumes the released component.
- **Don't put example HTML inline in any React component.** Examples
  live in `uds/components/<id>/examples/*.html` and are rendered by the
  Examples tab + Demo Builder from there.
- **Don't fill `motion` or `responsive` fields.** They're intentionally
  deferred until UDS has motion / breakpoint tokens.

## See also

- [`uds/schemas/spec.schema.json`](../../../uds-docs/uds/schemas/spec.schema.json) — canonical spec field list
- [`uds-content-schema.mdc`](../../rules/uds-content-schema.mdc) — JSON-only spec editing rule
- [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc) — what "complete" means
