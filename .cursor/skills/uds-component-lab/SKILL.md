---
name: uds-component-lab
description: Create a dev-only code-first UDS component lab for draft exploration. Use when the user says "Lab me a [component]", "start a code-first lab for [component]", "prototype [component] in code first", or asks for a playground before Figma/docs.
lastUpdated: 2026-05-27T00:16:27Z
---

# UDS Component Lab

Create a code-first drafting space for a new UDS component. The lab is a
sketchpad: useful for previewing shape, states, content, and interaction before
the designer asks to recreate the direction in Figma.

## Trigger phrases

Use this skill for prompts like:

- "Lab me an Avatar"
- "Lab me a Stepper"
- "Start a code-first lab for Empty State"
- "Prototype Banner in code before Figma"
- "Make me a playground for a new component idea"

## Boundaries

- Do not edit anything under `uds-docs/uds/`.
- Do not add the draft to `uds-docs/uds/components.json`.
- Do not add it to `uds-docs/components/site/SiteSidebar.tsx`.
- Do not create per-component `spec.json`, `status.json`, `changelog.json`,
  `impl.json`, examples, or `playground.js`.
- Do not write to Figma unless the user explicitly asks to promote the lab
  direction into Figma.
- Treat the lab as hidden, not secret. Dev routes can still appear in local or
  preview builds if the branch is deployed.

## Default output

Create a dev-only route under:

```text
uds-docs/app/(dev)/dev/lab/<component-id>/page.tsx
```

If shared lab helpers are needed, put them near the dev route, for example:

```text
uds-docs/app/(dev)/dev/lab/_components/
```

Use `kebab-case` for `<component-id>` and Title Case for display names. If the
component name is ambiguous, ask the user before creating files.

## Lab page requirements

The first version should include:

- A clear "draft lab" banner explaining that this is not official UDS.
- A preview area that renders the draft component.
- Controls for likely variants, states, density/content toggles, or sample
  data. Keep the controls simple; the user will iterate in chat.
- A code preview showing the current draft markup or React structure.
- Real UDS tokens for color, type, spacing, radius, and borders where practical.
- Draft class names that do not pretend to be final `.udc-*` API.

Prefer plain React state and existing site primitives. Do not add dependencies.

## Preview instructions

When finished, tell the user to preview locally at:

```text
/dev/lab/<component-id>
```

If the dev server is not running, start it from `uds-docs/` with:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/dev/lab/<component-id>
```

## Iteration loop

After the lab exists, expect short designer prompts:

- "Make the compact size tighter."
- "Add an error state."
- "Show it with and without an icon."
- "Try three density options."
- "Make the preview feel more like a product screen."

Update only the lab route and any lab-local helpers/styles unless the user
explicitly changes scope.

## Promotion to Figma

If the user says the direction is ready for Figma, stop coding and switch to the
Figma draft workflow:

1. Confirm the target component title and id.
2. Use `generate-uds-figma-component` to create a token-bound draft in the UDS
   Components Figma file on a new `🟠 <Title> {Cursor}{Ignore}` page.
3. Treat the code lab as reference only. Rebuild the component in Figma using
   real variables, auto layout, component sets, and variants.
4. Do not sync the component into docs until the designer accepts the Figma
   draft.

## Promotion to official docs

Only after Figma is accepted should the component enter official UDS docs. Use
the normal Figma-to-docs flow (`uds-updated`, `new-component`, or
`sync-figma-component-spec`, depending on the situation). The direction of
truth becomes Figma → `uds-docs/uds/`, not lab code → `uds-docs/uds/`.

## Finalization

Because the lab route lives under `uds-docs/`, follow the docs-site workflow:

- Add a `SITE_CHANGELOG` entry for the lab feature or durable lab route.
- Run the relevant Next.js checks for the files touched.
- If the change also edited `.cursor/skills/`, follow `uds-rule-discipline`:
  bump `lastUpdated:` and regenerate `.cursor/TOOLCHAIN.md`.
