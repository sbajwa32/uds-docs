---
name: generate-uds-figma-component
description: UDS Component Factory. Drafts a token-bound UDS component set directly inside the UDS Components Figma file on a brand-new `🟠 <Title> {Cursor}{Ignore}` page. Use when the user says "generate a UDS component for X", "factory me an Avatar", "draft a new UDS component called Y", "build a UDS component for Z in Figma", or "use the component factory to start <Title>". Stops at Figma — never writes to `uds-docs/uds/`. Docs landing is the existing `uds-updated` skill, run later by the designer.
lastUpdated: 2026-06-03T18:36:15Z
---

# UDS Component Factory — Generate UDS Figma Component

This skill takes a short component brief and returns a strong, token-bound
Figma component set on a brand-new `🟠 <Title> {Cursor}{Ignore}` page in the
[`UDS Components`](https://www.figma.com/file/1XJoUJgtNpw4R0IIT3VjoK)
file. The designer remains the design lead and the approval authority;
the factory handles the repetitive construction, quality checks, and
cleanup.

The factory's job ends when the designer accepts the draft. Mainline
rename, docs scaffold, status sync, and changelog are NOT in scope —
those happen later via the existing
[`uds-updated`](../uds-updated/SKILL.md) skill, designer-initiated.

## Locked decisions

These four decisions govern the factory's behavior. They are the
contract; the phases below are the operational implementation.

1. **Marker convention.** The factory creates pages in `UDS Components`
   named `🟠 <Title> {Cursor}{Ignore}` — orange/in-progress stoplight
   prefix + `{Cursor}` designer label + `{Ignore}` exclusion marker.
   The `{Ignore}` does the filtering, so every UDS automation already
   skips these pages — no rule changes required.
2. **Existing-page collision.** If a `<Title> {Cursor}{Ignore}` page
   already exists, the factory inspects it to decide whether to
   resume/extend or rebuild. Because the `{Cursor}` tag is a standing
   write grant (decision #5), rebuilding does NOT require fresh
   permission — but the factory reports what it found and its plan
   before writing.
3. **Stoplight prefix while in review.** The page is born with `🟠`
   (in-progress). When the designer accepts and moves it to mainline,
   the rename drops `{Cursor}{Ignore}` and updates the stoplight —
   `🟠 Avatar {Cursor}{Ignore}` becomes `🟡 Avatar` (review) or
   `🟢 Avatar` (production). The factory never performs that rename.
4. **Write safety.** The factory's only write scope is scope #4 in
   [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc)
   — component drafts on a `{Cursor}{Ignore}` page in `UDS Components`.
   Any write to a page without that suffix requires explicit per-target
   user direction.
5. **The `{Cursor}` tag = standing write grant.** Any page whose name
   contains `{Cursor}` is Cursor's to create, modify, rebuild, or
   delete nodes on — freely, without per-action permission — until the
   user removes the `{Cursor}` tag. The factory never removes the
   `{Cursor}` / `{Ignore}` tags itself; that rename is the designer's
   ownership/acceptance gesture and revokes the grant.

## Mandatory prerequisite skills

You MUST load these BEFORE any `use_figma` call. Loading order matters:

1. `figma-use` (load from the active Figma plugin skill path in the
   available skills list)
   — Plugin API rules: page-context reset per call, return-pattern, ID
   return, font preload, color 0–1 range, atomic-failure semantics.
   Required by every `use_figma` invocation.
2. `figma-generate-library` (load from the active Figma plugin skill
   path in the available skills list)
   — supplies the state ledger
   (`setSharedPluginData('dsb','run_id', RUN_ID)`), the
   sequential-call rule, the library-discovery pattern
   (`get_libraries` + `search_design_system`), the validation pattern,
   and the Phase 3 component pattern. This factory inherits all of
   that and only defines UDS-specific deltas on top.

The Figma plugin cache path can move between environments. Prefer the
active paths from the available skills list, or the official Figma MCP
skill loader by name (`figma-use`, `figma-generate-library`) when it is
available. Do NOT proceed without both loaded; they are not optional.

## Mandatory rules

These auto-attach via globs but are the contract this skill operates
under. If any of them is unread in the current session, read them now:

- [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc) —
  read-only discovery first; mandatory preflight output before any
  Figma read or write; ignore `{Ignore}` pages.
- [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc)
  — Figma writes denied unless explicitly scoped. The factory writes
  ONLY into **scope #4** (component drafts on a page whose name
  contains `{Cursor}{Ignore}` in `UDS Components`). Every write must
  produce the standard before/after summary.
- [`uds-token-architecture.mdc`](../../rules/uds-token-architecture.mdc)
  — token vocabulary contract. Bind only via library variable keys;
  do not invent tokens.
- [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc) —
  the factory NEVER modifies anything under `uds-docs/uds/`.
- [`uds-rule-discipline.mdc`](../../rules/uds-rule-discipline.mdc) —
  any edit to this SKILL.md or to the write-safety rule must bump
  `lastUpdated:` and re-run `bash scripts/regenerate-toolchain.sh`.
- [`uds-master-preflight.mdc`](../../rules/uds-master-preflight.mdc)
  Phase 5 — round-trip checklist that applies if a follow-on edit
  touches anything under `uds-docs/`.
- [`uds-naming-conventions.mdc`](../../rules/uds-naming-conventions.mdc)
  — the design-system-level naming framework. Source of truth for
  every state name (sections 1, 6), variant axis name (sections 3,
  4, 6), size step (section 2), region name (section 5), casing
  rule (section 7), and component / subcomponent name (sections 8,
  9). The factory picks names from this framework rather than
  inheriting whatever the closest sibling happens to use.
- [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc)
  — the completeness rulebook. Defines the component class taxonomy
  and, per class, which states and which API surface (events, parts,
  slots) are REQUIRED vs. `notApplicable`. The factory uses this to
  decide what "complete" means for the component being drafted — it is
  the spine of the Phase A model, not an afterthought. A draft that
  skips a class-required state or event is incomplete.

## Inputs

Ask the user (via `AskQuestion`) for any of these that aren't clear
from context:

| Input | Required | Notes |
|---|---|---|
| `componentTitle` | Yes | Title Case (e.g. `Avatar`, `Banner`, `Stepper`). Used in the page name and the component-set node name. |
| `componentId` | Yes | kebab-case (e.g. `avatar`). Must NOT collide with an existing entry in [`uds-docs/uds/components.json`](../../../uds-docs/uds/components.json). |
| `brief` | Yes | Short prose describing purpose, when-to-use, when-not-to-use, and any non-obvious constraints. The factory expands this into the full model in Phase A. |
| `siblings` | Optional | Up to 3 component IDs to use as anatomy/state/accessibility references. Default: factory picks the closest siblings from `components.json` based on the brief. |
| `pageBaseline` | Default `🟠` | Stoplight prefix for the new page. Defaults to `🟠` (in-progress) per locked decision #3 above. |

The component target is always the `UDS Components` file, file key
`1XJoUJgtNpw4R0IIT3VjoK`. The skill never writes to `UDS Tokens`.

## Pre-flight (do these once at the start of the session)

1. **Confirm explicit user intent.** Per
   [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc),
   Figma writes are denied unless the user named the target. Confirm
   the user wants a draft component built for the named title, in the
   named file, on a `{Cursor}{Ignore}` page.
2. **Run the preflight output block** from
   [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc)
   §"Mandatory preflight output": Tokens version, Components version,
   site `UDS_VERSION`, mismatch yes/no, capability check pass/partial/fail,
   action.
3. **Verify the UDS Tokens library is subscribed.** Call
   `get_libraries({ fileKey: '1XJoUJgtNpw4R0IIT3VjoK' })`. If
   `libraries_added_to_file` does not include `UDS Tokens`, STOP and
   ask the user to subscribe it via Figma's library picker. Do not
   attempt to auto-subscribe. Same exit pattern as the
   [`figma-component-card`](../figma-component-card/SKILL.md)
   pre-flight.
4. **Check id collision.** Read
   [`uds-docs/uds/components.json`](../../../uds-docs/uds/components.json)
   and confirm the proposed `componentId` is not already taken. If it
   is, stop and ask whether the user wants to use a different id, sync
   the existing component instead (different workflow), or override.
5. **Check existing-page collision.** List the pages of `UDS Components`
   and check whether a page named `<anyPrefix> <Title> {Cursor}{Ignore}`
   already exists. If it does, inspect it and decide whether to
   resume/extend or rebuild (per locked decisions #2 and #5). The
   `{Cursor}` tag means you don't need fresh permission to rebuild —
   but report what's there and your plan before writing.
6. **Locate or create the resume-state file.** State path is
   `.cursor/state/component-factory/<componentId>.md`. If it exists,
   read it and resume from where the prior session left off; do not
   overwrite the model. If it does not exist, you'll create it during
   Phase A. (`.cursor/state/` is gitignored — proposals are runtime
   state, not committed history.)

## Phase A — Brief to model (no Figma writes)

Inputs the skill reads — keep the cumulative payload under 30 KB; if
sibling specs are larger, read only the sections you need (`anatomy`,
`states`, `accessibility`, `props`):

- The user's `brief`.
- [`uds-docs/uds/components.json`](../../../uds-docs/uds/components.json)
  — full component list.
- The 2–3 closest sibling components' `spec.json` files at
  `uds-docs/uds/components/<id>/spec.json`. Schema is
  [`uds-docs/uds/schemas/spec.schema.json`](../../../uds-docs/uds/schemas/spec.schema.json).
- [`uds-docs/uds/tokens/semantic.css`](../../../uds-docs/uds/tokens/semantic.css)
  — available semantic surfaces, text, borders, and status treatments.
- [`uds-token-architecture.mdc`](../../rules/uds-token-architecture.mdc)
  — token-role contract (which token role binds to which CSS variable
  family).
- [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc)
  — the component class taxonomy and the per-class required-state /
  required-API baseline. Read this BEFORE drafting the model; it
  decides what a complete version of this component must include.
- [`uds-docs/uds/components/button/spec.json`](../../../uds-docs/uds/components/button/spec.json)
  — the bar for a fleshed-out contract (`props`, `events`, `slots`,
  `states`, full `accessibility`, contract-tied `acceptanceCriteria`).
  Use it as the completeness reference, not a thing to copy.

### Discovery sweep (run before drafting the model)

Run `search_design_system` against the UDS Tokens library across **both
publishable artifact categories** before writing the Token plan or any
binding decision:

- **Variables** (`includeVariables: true`) — color, border, space, font,
  font-scale, etc. These fill the Token plan section.
- **Styles** (`includeStyles: true`) — covers BOTH Text Styles *and*
  Effect Styles, but you have to query each style family explicitly:
  - Text Styles — `uds/text`, `label`, `heading`, `paragraph`, etc.
  - Effect Styles — `uds/effect`, `elevation`, `shadow`, `depth`, `blur`.

A typography-keyword sweep alone will NOT return Effect Styles, even
though both flow through the same `includeStyles` flag. If the
component's anatomy has any shadow, blur, or surface elevation, an
Effect Style query is mandatory; missing it leads to hardcoded
`node.effects = [...]` literals, which is the same anti-pattern as
inventing token variables (prohibited by Phase B.3). Effect Styles
bind via `await node.setEffectStyleIdAsync(style.id)`, the same way
bundled Text Styles bind via `setTextStyleIdAsync`.

Persist the proposed model to
`.cursor/state/component-factory/<componentId>.md`. Sections:

- **Component class** — classify the component as exactly one of
 `layout`, `display`, `action`, `form`, `navigation`, `feedback`, or
 `data` per
 [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc)
 §"Component class". This is the FIRST decision in the model because it
 drives the required-state baseline and the required API surface
 (events, parts) for every section below. Completeness is judged
 against this class, not picked ad hoc.
- **Purpose** — why this component exists.
- **When to use** / **When not to use** — paired guidance.
- **Anatomy, slots, and parts** — root, label, icon/content regions,
 helper text, action area, supporting parts. Formalize this into two
 lists the docs contract needs:
   - **Slots** — every content region a consumer fills, named as a
     slot contract (`default` plus named regions like `leading`,
     `trailing`, `helper`). Maps to `spec.json` `slots[]`.
   - **CSS parts** — internal regions worth exposing via `::part()`
     for external styling (e.g. `field`, `icon`, `helper`). Maps to
     the Web Component `parts` surface. If none apply, say so
     explicitly rather than omitting the list.
- **Subcomponent classification** — for every distinct Figma component
 set the factory plans to build, declare exactly one of:
   - **Main component** — the design unit a designer reaches for in
     the library picker. Named `udc-<id>` (no underscore prefix).
     Visible in the asset picker. When the designer later runs
     [`uds-updated`](../uds-updated/SKILL.md), gets its own
     `uds-docs/uds/components/<id>/` folder with `spec.json`,
     `status.json`, `changelog.json`, examples, etc., and its own
     entry in `uds-docs/uds/components.json`.
   - **Subcomponent of `<parent>`** — a building block of a parent
     component (`step` of Stepper, `card` of Carousel, `item` of
     Breadcrumb, `avatar` of Avatar Group, `tab` of Tabs, `crumb` of
     Breadcrumb, `option` of Segmented Control, ...). Named
     `_udc-<parent>-<sub>` with a **leading underscore** so Figma
     hides it from the asset picker (Figma's standard private-
     component convention). Its anatomy, props, states, and
     accessibility live inside the parent component's `spec.json`,
     NOT a separate component entry. No standalone `status.json` /
     `changelog.json` / Storybook story.

   Default heuristic for "main vs subcomponent": if the component's
   variant axes only make sense in the context of a parent (e.g.
   `hasConnector` on a step is meaningless outside a stepper), or
   if the component is unlikely to be useful when dropped standalone
   into a layout (e.g. a single tab without its tab-list), it's a
   subcomponent. When in doubt, default to subcomponent and surface
   the question in the model for designer approval.

   Multi-set components are common: most container-of-N patterns are
   **two component sets** — one main (the container with `count` and
   the orchestration variants) and one subcomponent (the per-item
   building block).
- **Variant axes** — pick axis names and values from
 [`uds-naming-conventions.mdc`](../../rules/uds-naming-conventions.mdc).
 Section 2 covers Size (`Small` / `Medium` / `Large`), section 3
 covers Tone (`Info` / `Success` / `Warning` / `Error` /
 `Neutral`), section 4 covers Emphasis (either Primary / Secondary
 / Tertiary OR Bold / Default / Subtle depending on the
 component), section 6 covers when something is a variant vs a
 state vs a property, section 7 covers Title Case in Figma. Don't
 inherit a sibling's name if the sibling disagrees with the
 framework — the framework wins.
- **State matrix (class-driven)** — start from the component class's
 required-state baseline in
 [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc)
 §"State baseline", NOT from a generic list. That baseline is
 conditional on class: form controls require `error` / `required` /
 `disabled` (and `readonly` if text-entry); selectable controls
 require `checked` / `selected`; disclosure controls require
 `expanded` / `collapsed`; data / search surfaces require `empty`;
 pointer-interactive controls require `hover`; keyboard-focusable
 controls require `focus-visible`; actions/toggles/tabs require
 `active` / `pressed`. For EVERY state the class requires, mark it
 either supported (it WILL be built as a Figma variant in Phase B) or
 `notApplicable` with a one-line reason. Never silently omit a
 class-required state. Pick the exact state NAMES from section 1 of
 [`uds-naming-conventions.mdc`](../../rules/uds-naming-conventions.mdc)
 (including its Selected / Checked / Current reserved-word
 distinction). Maps to `spec.json` `states[]`.
- **Accessibility plan** — keyboard, focus, screen reader, and
 disabled / loading / error behaviors, derived from the component
 class and node structure (never from screenshots). Maps to
 `spec.json` `accessibility.keyboard[]` / `screenReader[]` / `wcag[]`.
- **Events** — every custom event the finished Web Component will
 dispatch: `name`, when it fires, and payload shape. Derive from the
 class — `action` → `click`; `form` → `change` / `input`; `feedback`
 → `dismiss` / `open` / `close`; `navigation` → `select`; etc. Figma
 cannot draw an event, so this list lives only in the model and in the
 component-description contract written in Phase B (B.3.5) — but it is
 REQUIRED for any class that dispatches events. If the class
 genuinely dispatches none, state that explicitly. Maps to `spec.json`
 `events[]`.
- **Token plan** — explicit role-to-token map, e.g.
 `background.default = --uds-color-surface-interactive-default`. Every
 visual property the component will bind belongs in this map. If a
 needed token is missing from UDS Tokens, mark it `MISSING` and STOP
 the model there — new tokens flow through the
 [`import-figma-tokens`](../import-figma-tokens/SKILL.md) skill, NOT
 through this factory.
- **Typography binding strategy** — typography is one of the most
 common places ad-hoc font choices leak past the design system, so
 the factory has explicit defaults:
   - **If the design system has bundled `TextStyle` objects**
     (Figma's named text styles, e.g. `uds/text/label/base-medium`,
     `uds/text/heading/h2`, `uds/text/paragraph/xl`), they are the
     source of truth. Bind each text node via
     `textNode.textStyleId = style.id` after importing the style
     with `figma.importStyleByKeyAsync(STYLE_KEY)`. Bundled styles
     handle `fontFamily`, `fontSize`, `fontStyle` (weight), and
     `lineHeight` in one attachment, AND they automatically follow
     the design system's font-family modes (Inter / Poppins /
     Roboto / Lexend, etc.) and font-scale modes (smaller / default
     / larger). One binding, four properties tracked.
   - **If the design system has only individual font variables**
     (no bundled styles), bind each of the four font properties
     separately on every text node:
     `setBoundVariable('fontFamily', familyVar)`,
     `setBoundVariable('fontSize', sizeVar)`,
     `setBoundVariable('fontStyle', weightVar)`, and
     `setBoundVariable('lineHeight', lineHeightVar)`. Skipping any
     one means that property silently escapes the design system —
     a designer flipping the font-family mode will see partial
     updates, not full theme switches.
   - **Discover bundled styles via `search_design_system` with
     `includeStyles: true`** in Phase A. The Phase A model must
     enumerate either (a) the bundled style key per text role
     (`indicator-number → uds/text/label/base-medium`) OR (b) the
     four individual variable keys per text role, with rationale
     for which strategy applies.
   - **Color is bound separately.** Well-architected design system
     `TextStyle` objects do NOT include color — color belongs to
     the semantic-tokens layer because it varies by state, surface,
     and theme. Bind text-color fills via the appropriate `text-*`
     color variable independently of the text style. If the design
     system's text styles happen to include color, surface that as
     a finding for the designer; apply the style anyway and bind
     a per-state color fill on top.
   - **Font-loading prerequisite.** Before applying a bundled text
     style or binding `fontFamily` / `fontStyle` to a multi-mode
     variable, preload every font family + every weight the styles
     and variables span (Inter Regular/Medium/Bold AND Poppins
     Regular/Medium/Bold AND Roboto AND Lexend, etc.). Per
     `figma-use`
     rule 8 + the `FONT_FAMILY` gotcha: missing fonts cause silent
     fallback or "missing font" placeholders.
- **Inspector-editable properties** — enumerate every per-instance
 variation point the component should expose. The factory MUST default
 to exposing variation rather than burying it inside the variant
 hierarchy where a designer has to dive multiple levels to edit it.
 Four lists, every time, regardless of component type — even if a
 list is empty, state that explicitly:
   - **Variant axes (recap)** — the variant axes from above, restated
     here so the property surface for the component is in one place.
   - **TEXT properties** — every non-decorative text node a designer
     would reasonably override per-instance (labels, descriptions,
     titles, captions, counts, badge text, helper copy). Default rule:
     every text node not bound to an icon glyph gets a TEXT property.
     For each, list `propName`, `defaultValue`, and which node(s) the
     property links to via `componentPropertyReferences = { characters: propName }`.
     **Non-skippable: the editable entry node of any text-entry
     component** (the input/value text of an Input, Text Area,
     Combobox, Search, Date Picker, etc.) MUST get a TEXT property — it
     is the component's primary editable surface, so it is never a
     candidate for omission. Differing baked-in display text across
     variants (placeholder vs. a selected value vs. a multi "Add…"
     hint) is NOT a reason to skip the property: bind the property
     anyway with a sensible default; per-variant display differences
     are demo cosmetics, not a contract. The earlier Combobox draft
     shipped without this property — that was the miss this rule
     prevents.
   - **BOOLEAN properties** — every show/hide region (optional icons,
     optional descriptions, dividers, dismiss affordances, helper
     text, support indicators). For each, list `propName`,
     `defaultValue`, and which node(s) the property toggles via
     `componentPropertyReferences = { visible: propName }`.
   - **INSTANCE_SWAP properties** — every nested instance a designer
     would reasonably swap (icons, avatars, slot fillers, leading /
     trailing adornments). When the design system or its subscribed
     libraries provide a wrapper or primitive for a category, the
     factory MUST nest that wrapper as the default INSTANCE_SWAP
     component. Do NOT fall back to:
       - Unicode characters or font-glyph text nodes (`✓`, `!`, `★`,
         `→`, etc.) for icons — they don't follow size or color
         tokens, they break across font-family modes, and they're
         a code smell that signals the design system isn't being
         honored.
       - Raw library components used directly when an established
         wrapper exists (e.g. a Material Icons component used
         directly when UDS has `udc-icon-wrapper` as the
         standardized icon container — the wrapper handles size
         normalization and color binding; bypassing it leaks
         ad-hoc sizing into the file).
       - Inventing a new local pattern for something a published
         primitive already covers.
     For each property, list `propName`, `defaultValue` (the
     appropriate wrapper / primitive — wrapper when one exists in the
     design system, raw library component only when no wrapper
     applies), and which instance node the property links to via
     `componentPropertyReferences = { mainComponent: propName }`. The
     `defaultValue` FORMAT depends on where the target lives: in-file
     node ID for a local wrapper (`udc-icon-wrapper` is local), the
     published KEY only for a remote-library target — see
     [`uds-figma-plugin-api-gotchas.mdc`](../../rules/uds-figma-plugin-api-gotchas.mdc)
     §2.

     **Per-variant defaults follow component anatomy and state
     semantics**, not a single property-level default. For a
     Stepper, the `complete` variant's icon slot defaults to the
     wrapper containing `check`; the `error` variant defaults to
     the wrapper containing `priority_high`; the `upcoming` /
     `current` / `disabled` variants default to a hidden state or
     a neutral icon, depending on the model's anatomy decision.
     For a Notification, the `success` variant defaults to
     `check_circle`, the `error` to `error`, the `warning` to
     `warning_amber`, etc. State-specific defaults are baked into
     each variant via `setProperties` during the Phase B build, not
     hand-overridden by designers each time.
- **Container count axis (if the component is a container of N
 repeating instances)** — if the component is a *container of N
 repeating instances of the same sub-component* (stepper, breadcrumb,
 tabs, pagination, carousel, avatar group, list, segmented control,
 ...), specify a `count` variant axis with a range appropriate to the
 component's UX. Derive the range from the component's nature plus
 comparable patterns in production design systems (Material, Polaris,
 Carbon, ...). Don't pick a global default — choose per-component,
 justify the range in the model, and surface for designer approval.
 Indicative ranges (not contracts):

 | Pattern | Indicative range | Why |
 |---|---|---|
 | Stepper | 2–7 | <2 isn't a stepper; >7 is bad UX, use overflow |
 | Breadcrumb | 2–5 | Deeper than 5 = use overflow menu |
 | Tabs (horizontal) | 2–6 | More = vertical nav or overflow |
 | Avatar group | 2–8 | Past 8, use "+N more" pill |
 | Carousel | 3–10 | <3 isn't really a carousel |
 | Pagination | 5–10 visible page buttons | Standard pattern |
 | Segmented control | 2–5 | Past 5, use dropdown |
 | List (open-ended) | not via variant — instance duplication | Don't fight the medium |

 Each `count` variant pre-builds the layout with N child instances
 and the terminal-position instance gets the correct terminal-state
 variant baked in (e.g. `hasConnector=false` on the last step) so
 the designer doesn't have to manually correct it after dropping in
 the stepper.
- **Sibling reuse — reach for an existing DS component for EVERY
 standard affordance, never rebuild one from raw nodes.** The factory
 nests existing UDS components as instances rather than re-drawing
 their anatomy. This is not just icons:
   - **Field label → `udc-label`** (NOT a raw text node + a separate
     required-dot ellipse). `udc-label` already owns the required
     indicator, the error/disabled/success tones, and multiline
     wrapping — rebuilding it as raw text strands all of that and
     drifts from the design system. The Combobox draft originally
     shipped a raw `label` + `required-dot`; that was the miss this
     rule prevents.
   - **Icons → `udc-icon-wrapper`** (per the INSTANCE_SWAP rules above).
   - **Badges/counts → `udc-badge`; inline actions → `udc-button`;
     selectable tokens → `udc-chip`;** etc.
   Before drawing any sub-part, check `uds-docs/uds/components.json`
   for an existing component that covers it and nest that instead.
   If the existing component is missing a property you need to drive
   from the parent (e.g. its label text isn't exposed), surface that
   as a finding — the fix is to improve that component (a separate
   `{Cursor}` draft), not to bypass it with raw nodes.
   Common reuse set: `udc-label`, `udc-icon-wrapper`, `udc-button`,
   `udc-text-input`, `udc-chip`, `udc-badge`, `udc-card`,
   `udc-notification`.
- **Assumptions and acceptance criteria** — plain-language list the
 designer can scan in under a minute. Acceptance criteria must be
 contract-tied, not generic: name the `<udc-<id>>` tag, the variants
 that must render, each required state's distinct visual, the focus
 token, the events that must fire, and the key keyboard / screen-reader
 behavior — the way a fleshed-out component's `acceptanceCriteria[]`
 reads (see `uds-docs/uds/components/button/spec.json` for the bar).
 Maps to `spec.json` `acceptanceCriteria[]`.

### The drawable vs. non-drawable contract

Figma can draw variants, states, anatomy, slots, and nested instances.
It CANNOT draw events, `::part()` exposure, keyboard / screen-reader
behavior, or the acceptance checklist. Those non-drawable parts are
still required for a complete component, so the factory handles them in
two places:

1. They live in the model file (sections above), so the designer
   reviews them at the approval gate.
2. Phase B writes them into the Figma component's **description** as a
   delimited factory-contract block (step B.3.5). The
   [`figma-component-inspector`](../../agents/figma-component-inspector.md)
   reads the component description, so when the designer later runs
   [`uds-updated`](../uds-updated/SKILL.md) the contract round-trips
   into `spec.json` (`events[]`, `slots[]`, `accessibility`,
   `acceptanceCriteria[]`) instead of landing empty. This is the
   synergy: the factory authors the full web-component contract once,
   and the docs sync consumes it.

### Approval gate (mandatory before Phase B)

After persisting the model, present it inline and pause. Per
`figma-generate-library` §"Explicit phase approval", "looks good" /
"fine" / "OK" do NOT count. Wait for the literal word `approved`
(case-insensitive) before any Figma write.

**Approval with changes.** If the designer says "approved, but change
X" or "approved with: <list>", apply the requested changes to the
model (overwriting the persisted markdown), confirm the changes are
captured, then proceed to Phase B. Do NOT require a second
`approved`.

**Pure rejection.** "Not yet" / "rework this" returns to Phase A
research. Do not proceed.

## Phase B — Draft page build (Figma writes, scope #4 only)

After the model is approved, the skill writes ONLY to a new
`{Cursor}{Ignore}` page on the `UDS Components` file. Every
`use_figma` call MUST:

- Re-import variables in that call. Do not rely on stale variable IDs
  from prior calls (variable IDs are not stable across `use_figma`
  invocations — see the
  [`figma-component-card` gotchas](../figma-component-card/references/gotchas.md)).
- Tag every created node immediately with
  `setSharedPluginData('dsb','run_id', RUN_ID)` plus a logical key,
  per the `figma-generate-library` state ledger. The `run_id` is what
  the future `purge-failed-factory-run` skill will use to clean up
  failed runs without name-guessing.
- Pass `skillNames: "generate-uds-figma-component, figma-generate-library, figma-use"`
  to `use_figma` so the call is logged correctly.

The build is a small chain of sequential `use_figma` calls (never
parallel — `figma-generate-library` rule 13). Each call is its own
atomic Figma transaction; if one throws, no nodes from that call land
and you can re-run after fixing the cause.

### B.1 — Create the page

- Page name: `<pageBaseline> <componentTitle> {Cursor}{Ignore}`. With
  the default baseline that's `🟠 <Title> {Cursor}{Ignore}`.
- The `{Ignore}` marker takes the page out of every UDS automation
  ([`figma-inventory`](../../agents/figma-inventory.md),
  [`sync-figma-component-status`](../sync-figma-component-status/SKILL.md),
  [`uds-updated`](../uds-updated/SKILL.md),
  [`figma-spec-gap`](../../agents/figma-spec-gap.md),
  [`figma-component-inspector`](../../agents/figma-component-inspector.md))
  per [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc).
  No rule changes are needed.
- The `{Cursor}` label tells designers it's a factory draft.
- Designer accepts later by renaming the page (drop `{Cursor}{Ignore}`,
  set the stoplight prefix to `🟡` review or `🟢` production).

### B.2 — Build the component set

- Create each component set with the name agreed in the model:
  - **Main components:** `udc-<id>` (no underscore).
  - **Subcomponents:** `_udc-<parent>-<sub>` with a **leading
    underscore**. Figma's standard private-component convention
    keeps the subcomponent out of the asset picker so designers
    don't accidentally pick the building block instead of the
    container. Parent components reference subcomponents via
    component KEY (stable across files), so the underscore prefix
    has no functional effect on parent → child instance binding.
- Variant property names and values follow
  [`uds-naming-conventions.mdc`](../../rules/uds-naming-conventions.mdc)
  exactly — Title Case in Figma (section 7), canonical state /
  variant / size / tone / emphasis names from sections 1-4. If the
  Phase A model picked a name that doesn't appear in the framework
  for a category the framework covers, fix it before this step
  rather than encoding the drift into Figma.
- Build variants and states with auto-layout. **Build every state the
  Phase A model marked supported for the component's class** — not just
  the visually obvious ones. A `form` draft must include `error`,
  `required`, and (if supported) `readonly` as real variants; a
  selectable control must include `selected` / `checked`; a disclosure
  control must include `expanded` / `collapsed`; a data/search surface
  must include `empty`. States the model marked `notApplicable` are
  skipped (their reason rides in the B.3.5 contract block). Defaults:
  containers hug content unless a fixed dimension is part of the spec;
  **every used spacing property is bound per side** (see below); flat
  structure preferred unless nesting is required.
- **Per-side spacing binding (all five properties).** The Plugin API
  has no `paddingHorizontal` / `paddingVertical` shorthand — auto-layout
  exposes `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`,
  and `itemSpacing` as five independent bindable properties. Bind all
  five per `setBoundVariable('paddingTop', spaceVar)`, never assign
  `node.paddingTop = 8` directly. The requirement is *every side
  bound*, not *every side equal* — a pill that legitimately wants
  `paddingLeft = uds-space-200` (16px) and `paddingRight = uds-space-150`
  (12px) is fine; what's not fine is pairing those bound horizontal
  values with raw `paddingTop = 8` and `paddingBottom = 8` literals.
  When the real component does want the same value on both sides of an
  axis, pass the same `uds-space-100` variable to both sides — that's
  still five `setBoundVariable` calls. Helper functions that wrap
  padding configuration MUST take all five properties (or a
  `{ top, right, bottom, left, gap }` object); the two-axis helper
  signature `(h, v)` is an anti-pattern — it binds whichever pair the
  helper takes and leaves the other pair as raw pixel literals. See
  [`uds-figma-plugin-api-gotchas.mdc`](../../rules/uds-figma-plugin-api-gotchas.mdc)
  §5 for the underlying API truth and the silent-failure mode.
- **Effect-style binding (never raw effects literals).** For every
  drop shadow, blur, or other elevation visual the model specifies,
  bind via `await node.setEffectStyleIdAsync(effectStyle.id)` after
  `await figma.importStyleByKeyAsync(EFFECT_STYLE_KEY)`. Never write
  `node.effects = [{ type: 'DROP_SHADOW', ... }]` even if the literal
  values exactly match the design system's depth scale — raw effect
  literals escape every "is this bound to a token?" check, and
  factory runs that copy depth values from inspection rather than
  binding the style routinely ship visually-shadowed nodes whose
  values don't match any depth step at all. See
  [`uds-figma-plugin-api-gotchas.mdc`](../../rules/uds-figma-plugin-api-gotchas.mdc)
  §6 for the wrong/correct contract and audit signature.
- Bind fills, strokes, **typography**, spacing (per the per-side rule
  above), radius, **and effects** (per the effect-style rule above)
  to UDS Tokens via the role-to-token map from Phase A. For typography
  specifically: prefer bundled `textStyleId = style.id` when UDS has
  the matching bundled text style; fall back to four individual
  variable bindings (`fontFamily`, `fontSize`, `fontStyle`,
  `lineHeight`) only when bundled styles are absent. Never hardcode
  font names, sizes, weights, or line-heights as raw values.
- Use the actual library variable / style keys returned by
  `get_libraries` + `search_design_system` — never hardcode hex
  values into bound paints.
- Use existing UDS components as nested instances where the model says
  to (per Phase A "Sibling reuse").
- **For every icon slot the model enumerates, nest the appropriate
  UDS wrapper component as an INSTANCE** (`udc-icon-wrapper` for
  icons, etc.) — never a Unicode glyph in a TEXT node, never a raw
  Material Icons component referenced directly. For each variant,
  set the wrapper's swap property to the per-variant default the
  model specifies (e.g. `check` for the Stepper's `complete` variant
  indicator). Use `setProperties` on the variant's instance node
  with the wrapper's swap-property full name to bake in the
  per-state default.
- Use meaningful layer names that match the anatomy. Names like
  `Frame 12` are a layer-hygiene gate failure in Phase C.

### B.2.5 — Wire inspector properties

Every TEXT / BOOLEAN / INSTANCE_SWAP property the model enumerates in
its "Inspector-editable properties" section MUST be registered on the
component set and linked to the relevant nodes. Done after the
component set is combined (so the property surface lives on the
set, not on individual variants), and BEFORE the B.4 write summary.

Plugin API recipe (per `figma-use`
rule 15: re-capture node IDs from the state ledger, do not guess):

```js
// 1. Register each property on the component set.
componentSet.addComponentProperty('label',        'TEXT',          'Step label');
componentSet.addComponentProperty('description',  'TEXT',          'Optional description');
componentSet.addComponentProperty('showDescription','BOOLEAN',      true);
// INSTANCE_SWAP default: local target = node ID (NOT the published key).
// Recover via: (await someInstance.getMainComponentAsync()).id
componentSet.addComponentProperty('leadingIcon',  'INSTANCE_SWAP', iconWrapperNodeId);

// 2. Link the property to the node(s) it controls. The propName must
//    match the registration. For variant-scoped components, walk each
//    variant child of the set and link the equivalent node in each.
for (const variant of componentSet.children) {
  const label = variant.findOne(n => n.name === 'label');
  label.componentPropertyReferences = { characters: 'label' };

  const description = variant.findOne(n => n.name === 'description');
  description.componentPropertyReferences = { characters: 'description' };

  const labelGroup = variant.findOne(n => n.name === 'label-group');
  // BOOLEAN visibility lives on the section the property hides, NOT
  // on the parent containing it. The parent stays visible; the section
  // toggles.
  description.componentPropertyReferences = {
    ...description.componentPropertyReferences,
    visible: 'showDescription'
  };

  const icon = variant.findOne(n => n.name === 'leading-icon' && n.type === 'INSTANCE');
  if (icon) icon.componentPropertyReferences = { mainComponent: 'leadingIcon' };
}
```

Key rules:

- **Property surface lives on the set, not the variant.** Variants
  inherit from the set; per-variant registration causes inspector
  panel noise and inconsistent property surfaces across variants.
- **`propName` must be unique within the set.** Figma silently
  prefixes the name with a hash on registration, but the *base name*
  you pass to `addComponentProperty` is what designers see.
- **Re-link in every variant.** When a component set is combined from
  pre-existing variants, the child variants each carry their own node
  trees. The property reference must be applied to the matching node
  in each variant child, not just the first.
- **Text-node `characters` property links override the baked-in text.**
  If a variant has special baked-in text (e.g. the `complete` state
  shows `✓` instead of a number), and you link a `stepNumber` TEXT
  property to that node, the property value overrides the baked-in
  `✓`. If you want a variant to keep baked-in text, either (a) skip
  the property reference on that variant's node, or (b) split the
  node into two — one bound to the property, one with the baked-in
  glyph — and use BOOLEAN visibility to toggle which one shows.
- **INSTANCE_SWAP default-value format depends on where the swap
  target lives** (see
  [`uds-figma-plugin-api-gotchas.mdc`](../../rules/uds-figma-plugin-api-gotchas.mdc)
  §2). A **local** target (same file — e.g. `udc-icon-wrapper`, which
  lives on a page in `UDS Components`) takes the in-file **node ID**
  (`5657:6767`), recovered via
  `await instance.getMainComponentAsync()` → `.id`. A **remote**
  (subscribed-library) target takes the published **KEY**. Passing a
  key for a local target throws `Property value is incompatible with
  component property type` — that error means the format is
  mis-scoped, not that the property type is wrong.

If the component is a container of repeating instances (per the
"Container count axis" model section), build **one variant per
count value**. Each variant pre-populates the correct number of
child instances and the terminal-position instance(s) get the
appropriate terminal-state variant set (e.g. `hasConnector=false`
on the last step in a horizontal stepper). The designer should not
have to manually fix anything about the terminal-position instance
when they drop the parent component into a layout.

### B.3 — Token discipline

- If a needed token is missing from UDS Tokens, STOP and ask. New
  tokens flow through the UDS Tokens Figma file, then the
  [`import-figma-tokens`](../import-figma-tokens/SKILL.md) skill —
  never via this factory's `use_figma` calls. Document the missing
  token in the model's "Token plan" section as `MISSING` and surface
  it to the user.
- Never write raw hex into a bound paint's `color` field unless you
  also bind it to a variable. The literal is the design-time fallback;
  the binding is what survives mode flips.

### B.3.5 — Author the factory contract into the component description

Write the non-drawable contract (the parts Figma can't represent
visually) into the component set's `description` field so it
round-trips into `spec.json` when the designer later runs
[`uds-updated`](../uds-updated/SKILL.md). Setting the description of a
component that lives on the `{Cursor}{Ignore}` draft page is covered by
scope #4 — it's part of building the draft, not a separate write
target. Use a delimited block so the inspector can find and parse it
and the designer can edit or delete it freely:

```text
<<UDS-FACTORY-CONTRACT v1>>
Component: <Title> (<id>)
Class: <layout|display|action|form|navigation|feedback|data>
Events:
  - <name> — <when it fires> — payload: <shape>
  (or: none (class does not dispatch))
Slots:
  - <name> — <what it holds>
Parts:
  - <name> — <region exposed for ::part() styling>
  (or: none)
States (class baseline):
  - <state> — supported | notApplicable: <reason>
Keyboard:
  - <key> — <action>
Screen reader:
  - <trigger> — <announcement>
Acceptance criteria:
  - <contract-tied item>
Designer: edit or remove this block freely — it's a factory draft.
<<END-UDS-FACTORY-CONTRACT>>
```

Rules:

- **Human-readable.** A designer sees this in Figma's asset panel.
  Keep it as the plain-text block above, not a JSON dump.
- **No silent omission.** Every section appears. If a section doesn't
  apply, write `none` or `none (class does not dispatch)` rather than
  dropping the heading — the inspector relies on the section being
  present.
- **Keep it consistent with the model file.** The block is the
  description's copy of the model's non-drawable sections (class,
  events, slots, parts, states, accessibility, acceptance). If you
  revise the model on iterate, rewrite the block too.
- **Single round-trip source.** This block is the only place the
  inspector can read events, parts, keyboard, and acceptance for a
  brand-new component (there's no Web Component source yet). If it's
  missing or malformed, those `spec.json` fields land empty on first
  sync.

### B.4 — Required write summary

After the build, emit ONE Figma write summary per the
[`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc)
§"Required before/after report" template, scoped to the new page:

```markdown
## Figma write summary

- File: UDS Components
- File key: 1XJoUJgtNpw4R0IIT3VjoK
- Page: 🟠 <Title> {Cursor}{Ignore}  (newly created)
- Node/frame: udc-<componentId>  (component set)
- Operation: create
- Old value: (page did not exist)
- New value: <list of variant property names + values + node IDs>
- Rollback note: delete the page or run purge-failed-factory-run with run_id=<RUN_ID>
```

If the build fails partway through, stop and report the exact last
successful operation. Do NOT continue with more writes until the user
reviews the state. Re-run from the failed step after fixing the
cause.

### B.5 — Post-build verification (mandatory before Phase C)

Per `figma-generate-library` rule 12 ("Validate before proceeding")
and the `figma-use` "always read IDs from the state ledger" rule:

1. Call `get_metadata` on the new page node to confirm structure:
   page child count, component-set children, variant-property names
   match the approved model.
2. Call `get_screenshot` on the page node to capture a visual record.
3. Cross-check that every created node ID returned by Phase B is
   present in the metadata response. Any missing or duplicate ID
   STOPS the run for investigation — Phase C does not run on
   unverified work.
4. Confirm the component set's `description` contains a well-formed
   `<<UDS-FACTORY-CONTRACT v1>> … <<END-UDS-FACTORY-CONTRACT>>` block
   (B.3.5) with every section present. A missing or malformed block
   STOPS the run — the contract round-trip depends on it.

## Phase C — Quality-gate report

The first draft is not production-ready by default. Goal: a high-quality
starting point + a clear report of what still needs review. Emit a
structured report with two sections.

### Tool-emitted gates (deterministic — counts, not opinions)

- **Token bindings.** Raw color/fill/stroke values found: N. Unbound
 corner radii: N at `<nodeIds>`.
- **Per-side spacing bindings.** Every auto-layout frame the factory
 created MUST have all five spacing properties (`paddingTop`,
 `paddingBottom`, `paddingLeft`, `paddingRight`, `itemSpacing`) bound
 to a `uds-space` variable when that property has a non-zero value.
 Per-side counts:
 - Frames with unbound `paddingTop`: N at `<nodeIds>`.
 - Frames with unbound `paddingBottom`: N at `<nodeIds>`.
 - Frames with unbound `paddingLeft`: N at `<nodeIds>`.
 - Frames with unbound `paddingRight`: N at `<nodeIds>`.
 - Frames with unbound `itemSpacing` (gap > 0): N at `<nodeIds>`.

 The five must be reported separately. A combined "unbound spacing"
 count hides the most common asymmetry — horizontal pair bound,
 vertical pair stranded as raw pixels — which renders correctly in
 the default density mode and only breaks under
 `[data-density="comfortable"]`. See
 [`uds-figma-plugin-api-gotchas.mdc`](../../rules/uds-figma-plugin-api-gotchas.mdc)
 §5.
- **Effect-style bindings.** Every node where `effects.length > 0`
 MUST have `effectStyleId !== ''`. Nodes with raw `effects = [...]`
 literals and no effect style attached: N at `<nodeIds>`. This is a
 separate gate from "Token bindings" because the visual output looks
 right even when the binding is missing — the gate must check
 `effectStyleId` directly, not infer from `effects.length`. See
 [`uds-figma-plugin-api-gotchas.mdc`](../../rules/uds-figma-plugin-api-gotchas.mdc)
 §6.
- **Typography binding.** Every text node MUST have either a
 `textStyleId` (bundled UDS text style) OR a complete set of four
 font variable bindings (`fontFamily`, `fontSize`, `fontStyle`,
 `lineHeight`). Text nodes with neither: N. Text nodes with partial
 individual bindings (some but not all four): N. The Phase A model
 decides which strategy applies; the file must follow it
 consistently. Color binding is checked separately under "Token
 bindings" since color is not part of typography styles.
- **Text wrap.** Every copy-bearing text node (helper/error text,
 descriptions, option supporting text, the value/input line) MUST be
 `textAutoResize='HEIGHT'` + `layoutSizingHorizontal='FILL'` inside a
 width-bound parent — never the default `WIDTH_AND_HEIGHT` auto-width,
 which overflows the component on long content instead of wrapping.
 Auto-width copy nodes: N at `<nodeIds>`. Fixed short labels are
 exempt. See
 [`uds-figma-plugin-api-gotchas.mdc`](../../rules/uds-figma-plugin-api-gotchas.mdc)
 §8.
- **Variant matrix.** Generated variant axes and values vs. the
 approved model. Match / mismatch report. For container-of-N
 components, this includes the `count` variant axis — each enumerated
 count value MUST be present as a variant.
- **Property wiring.** Component properties registered on the set vs.
 the approved model's "Inspector-editable properties" lists.
 Match / mismatch per list (TEXT / BOOLEAN / INSTANCE_SWAP). For each
 registered TEXT property, every variant in the set MUST have at
 least one descendant node linking via
 `componentPropertyReferences.characters`. Same for BOOLEAN
 (`visible`) and INSTANCE_SWAP (`mainComponent`). Heuristic gap
 detection: text nodes whose name suggests editable copy (`label`,
 `description`, `title`, `caption`, `count`, `body`, `helper`, etc.)
 lacking a `characters` reference are flagged as *candidate* gaps —
 designer judges whether each is intentionally decorative. **Hard
 failure (not a candidate): the editable entry node of a text-entry
 component** (`value`, `input`, `value-text`, search/entry field)
 without a `characters` TEXT-property reference fails this gate
 outright, per the non-skippable rule in Phase A.
- **Per-variant INSTANCE_SWAP defaults.** For every component property
 of type `INSTANCE_SWAP` registered on the set, walk every variant
 and compare its current swap target against the per-variant default
 the Phase A model specified for that variant. Variants still holding
 the factory's universal default (when the model said otherwise): N
 at `<variantIds>`. This catches "every icon shipped as the same
 placeholder" — the technical wiring (property exists, real wrapper
 default) is correct but the per-variant differentiation
 (`complete → check`, `error → priority_high`, etc.) was never baked
 in via `setProperties`. The model file under
 `.cursor/state/component-factory/<componentId>.md` is the source of
 truth for "what each variant should default to."
- **Layer hygiene.** Unnamed nodes: N. Generic names (`Frame N`,
 `Rectangle N`): N. Orphan top-level nodes on the page: N.
- **Auto-layout coverage.** Frames without auto-layout: N at
 `<nodeIds>`.
- **Subcomponent visibility.** Every component set the model
 classified as a subcomponent must be named with a leading `_`.
 Subcomponents named without `_`: N. Inversely, main components
 named with a leading `_` (would be hidden from the picker by
 mistake): N. The model's "Subcomponent classification" entry is
 the source of truth — if the file disagrees, that's a gate failure.
- **Library reuse.** For every icon / avatar / swappable adornment
 the model declared in its INSTANCE_SWAP list, the file must
 contain an INSTANCE node of the agreed wrapper (or library
 primitive) at the documented anatomy location. Heuristic gap
 detection: text nodes whose `characters` is a single non-ASCII
 glyph (Unicode code point > U+0080, or any single character that
 isn't a digit / letter / common punctuation) when a wrapper
 component for that category exists in the subscribed libraries
 are flagged as candidate gaps. Designer judges whether each is
 intentional decoration vs. a missed icon-wrapper instance.
 **Also flag raw rebuilds of an existing DS component:** a field
 label drawn as a raw text node (+ a sibling required-dot) where
 `udc-label` exists, an inline button drawn as a raw frame where
 `udc-button` exists, etc. Any sub-part a published UDS component
 already covers MUST be a nested instance of that component, not
 raw nodes — per the Phase A "Sibling reuse" rule.
- **Class-required state coverage.** Every state the component's class
 requires (per
 [`uds-component-checklist.mdc`](../../rules/uds-component-checklist.mdc)
 §"State baseline") MUST be present as a Figma variant OR marked
 `notApplicable` with a reason in the contract block. Required states
 with neither a variant nor a `notApplicable` reason: N at `<list>`.
 This is the gate that stops a `form` draft shipping without `error` /
 `required`, or a disclosure control without `expanded` / `collapsed`.
- **Events planned.** For any class that dispatches events (`action`,
 `form`, `feedback`, `navigation`, …), the contract block's `Events`
 section MUST list at least one event or the explicit `none (class
 does not dispatch)`. An empty `Events` section on a class that should
 have them: fail.
- **Contract block present and well-formed.** The component
 description MUST contain a `<<UDS-FACTORY-CONTRACT v1>> …
 <<END-UDS-FACTORY-CONTRACT>>` block with all sections present (Class,
 Events, Slots, Parts, States, Keyboard, Screen reader, Acceptance) —
 each either filled or explicitly `none` / `notApplicable`. Missing or
 malformed: fail. The `spec.json` round-trip via `uds-updated` depends
 on this block.
- **Slots and parts enumerated.** The contract block's `Slots` and
 `Parts` sections must each be filled or explicitly `none`. An empty
 (not `none`) section is a gap.

If any tool-emitted gate fires with non-zero findings, the skill
reports the issue and proposes a fix. Design-changing, destructive, or
token-creating fixes require explicit approval before applying.

### Human-judged gates (Cursor flags; designer decides)

- **State coverage.** Are all states present and visually
  distinguishable?
- **Accessibility plan.** Is the documented keyboard / focus / SR
  behavior plausible and complete?
- **Visual direction.** Does the draft match the intended UDS feel?

### Review-ready definition

The factory job is complete when:

- Every tool-emitted gate above reports zero findings, AND
- The human-judged gates have been written into a designer-facing
  prompt block (one paragraph per gate; no decision required to
  finish — the designer reads them as part of acceptance).

Production-ready is a higher bar that happens later, after designer
rename + the eventual `uds-updated` run. The factory does not chase
it.

## Phase D — Designer hand-off (factory done)

When the designer accepts the draft, factory's job is done. What
happens next is NOT this skill's responsibility:

- The designer renames the page in `UDS Components` to drop
 `{Cursor}{Ignore}` and update the stoplight prefix to whatever
 status they want (`🟠` in-progress, `🟡` review, `🟢` production).
- When the designer is ready, they run
 [`uds-updated`](../uds-updated/SKILL.md) (or equivalent prompt:
 "UDS updated", "Figma updated", "sync UDS from Figma"). That
 workflow handles `new-component` scaffold,
 `sync-figma-component-spec`, `link-figma-nodes`, status sync,
 changelog, commit, and push. (Cloudflare and Next handle cache
 freshness post-migration — there's no cache-bust step.)
- Optionally, the designer may run
 [`figma-component-card`](../figma-component-card/SKILL.md) to build
 the seven-section page layout in Figma. Independent of this
 factory.

**Docs-side hint about subcomponents.** When the page contains a
main component plus one or more `_`-prefixed subcomponents, the
docs-side scaffold (`new-component` + `components.json` aggregator)
should land **only** the main component — the subcomponent's anatomy,
props, states, and accessibility live inside the parent's `spec.json`.
The subcomponent does not get its own `uds-docs/uds/components/<sub>/`
folder, its own `components.json` entry, its own `status.json`, its
own `changelog.json`, or its own Storybook story. If `uds-updated`
behaves as if a subcomponent were a peer, surface that as a finding;
fix is in `uds-updated` / `new-component`, not here.

The model proposal at `.cursor/state/component-factory/<componentId>.md`
can be deleted once the component has landed in docs, or left in
place — cleanup is optional, since `.cursor/state/` is gitignored.

## Procedure (single-component, the only mode in this version)

1. **Pre-flight** (above).
2. **Phase A** — read brief + siblings + tokens, persist model to
   `.cursor/state/component-factory/<componentId>.md`, present
   inline, wait for `approved`.
3. **Phase B** — sequential `use_figma` calls: B.1 page, B.2
   component set, B.4 write summary, B.5 verification.
4. **Phase C** — emit the quality-gate report.
5. **Phase D** — hand off to the designer; do NOT rename the page; do
   NOT run any docs-side skill; do NOT touch `uds-docs/uds/`.

If the designer says "iterate" / "revise" after Phase C, return to
Phase B with the requested changes and re-run B.5 + Phase C. Do not
rebuild the page from scratch unless the designer explicitly asks
(per locked decision #2 above).

## Output principles

- **Single source of truth for the design model is the persisted
  `.cursor/state/component-factory/<componentId>.md` file.** If
  conversation context is truncated, re-read the file before
  resuming.
- **Variables MUST be re-imported every `use_figma` call.** See the
  [`figma-component-card` gotchas](../figma-component-card/references/gotchas.md).
- **Never write raw hex into bound paints' `color` field unless you
  also bind it.**
- **Never modify any file under `uds-docs/uds/`.** The factory's
  output is Figma-only.
- **Every Figma write must be paired with a write-summary report.**
  See [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc).

## DO NOT

- **Don't write to `UDS Components`** outside the new
  `{Cursor}{Ignore}` page. Other pages are not in scope #4.
- **Don't write to `UDS Tokens`** at all. Token additions flow
  through the UDS Tokens Figma file (designer-side) and
  [`import-figma-tokens`](../import-figma-tokens/SKILL.md).
- **Don't auto-rename the page** to drop `{Cursor}{Ignore}` or to
  change the stoplight. That's the designer's acceptance gesture.
- **Don't ship a draft with an incomplete behavior contract for a
  class that requires one.** A `form` component with no `error` /
  `required` states, an `action` / `feedback` component with no events,
  or any draft missing the B.3.5 contract block is incomplete — fix it
  before Phase D, or record an explicit `notApplicable` reason in the
  contract.
- **Don't run [`new-component`](../new-component/SKILL.md),
  [`sync-figma-component-spec`](../sync-figma-component-spec/SKILL.md),
  [`link-figma-nodes`](../link-figma-nodes/SKILL.md), or any
  `uds-docs/uds/` writer skill** as part of this workflow. Docs
  landing is the designer's separate `uds-updated` invocation.
- **Don't proceed past Phase A without the literal `approved`** (or
  "approved with: …"). "Looks good" is not approval.
- **Don't parallelize `use_figma` calls.** Sequential only, per
  `figma-generate-library` rule 13.
- **Don't invent tokens.** If the model's token plan needs something
  that isn't in UDS Tokens, STOP and ask the user to add it via the
  UDS Tokens Figma file + `import-figma-tokens`.
- **Don't remove the `{Cursor}` or `{Ignore}` tags from a page.** That
  rename is the designer's acceptance gesture and revokes Cursor's
  standing write grant (locked decision #5). A pre-existing
  `{Cursor}{Ignore}` page may be rebuilt without asking — inspect it
  and report your plan first.
- **Don't skip the Phase B.5 verification.** The quality-gate report
  in Phase C does not run on unverified work.

## See also

- `figma-use` (active Figma plugin skill)
  — Plugin API rules.
- `figma-generate-library` (active Figma plugin skill)
  — state ledger, sequential rule, Phase 3 component pattern.
- [`figma-component-card`](../figma-component-card/SKILL.md) — sibling
  Figma writer skill (writes the page-layout cards). Pairs with this
  factory after the docs scaffold exists.
- [`uds-updated`](../uds-updated/SKILL.md) — designer-initiated
  follow-on that lands the accepted draft into the docs site.
- [`new-component`](../new-component/SKILL.md) — docs-side scaffold
  the `uds-updated` workflow calls. Not invoked by this factory.
- [`uds-figma-preflight.mdc`](../../rules/uds-figma-preflight.mdc) —
  preflight discovery requirements.
- [`uds-figma-write-safety.mdc`](../../rules/uds-figma-write-safety.mdc)
  — write scopes (this factory's writes are scope #4).
- [`uds-token-architecture.mdc`](../../rules/uds-token-architecture.mdc)
  — token vocabulary contract.
- [`uds-source-of-truth.mdc`](../../rules/uds-source-of-truth.mdc) —
  why the factory stops at Figma.
- [`uds-rule-discipline.mdc`](../../rules/uds-rule-discipline.mdc) —
  bookkeeping when this skill itself is edited.
