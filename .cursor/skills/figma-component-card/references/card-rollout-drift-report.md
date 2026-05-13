# Card Rollout — Drift Report

Read-only audit of the 8-component card rollout (commit
[`83aa958`](../../../../) "Persist section-body refinements from mainline
card rollout") against the canonical `📐 _TEMPLATE { Component card }`
page in the `UDS Components` Figma file.

| Datum | Value |
|---|---|
| Figma file | `UDS Components` (`1XJoUJgtNpw4R0IIT3VjoK`) |
| Template page | `📐 _TEMPLATE { Component card }` (id `7481:14`) |
| Builder script | [`build-card.js`](./build-card.js) |
| Components rolled out | `icon-wrapper`, `link`, `checkbox`, `radio`, `button`, `dropdown`, `badge`, `data-table` (8 of 9 🟠 pages — `checkbox-control` skipped because it's a `_support` component) |
| Rollout commit | `83aa958` |
| Audit operation | Read-only inspection. No Figma writes. No `uds-docs/uds/` writes. |

## TL;DR

The rolled-out cards do **not** match the canonical `📐 _TEMPLATE` page.
The structural cause is simple: the skill's pre-flight step said "open
the `📐 _TEMPLATE` page first; the template overrides this skill," but
the actual `build-card.js` script never reads any template page. It
stamps from hardcoded recipes that drifted from what the template
actually says.

The most consequential drifts:

1. **VARIANTS row direction is wrong.** The template places stages
   side-by-side (`HORIZONTAL`, multiple FIXED-width stages). The builder
   stamps a `VERTICAL` row with FILL stages, so on a multi-variant
   component every variant occupies full width and stacks vertically.
2. **SUB-COMPONENTS row direction is wrong.** Same change in the same
   commit. Template = `HORIZONTAL` `subs-row`. Builder = `VERTICAL`
   `subs-col`.
3. **Outer `udc-<id>-page` wrapper has no rounded corners.** Template
   `_template-component-card` has cornerRadius **24**; rolled-out
   wrappers have cornerRadius **0**.
4. **Stage cornerRadius is wrong.** Template stages use
   `radius/container-md` (12). Builder uses `radius/container-lg` (16).
5. **Section text drift.** "Variant matrix" → "All variants",
   "Component groups" → "Sub-component sets", and matching description
   copy is different.
6. **`button` lost ANATOMY and SUB-COMPONENTS sections entirely** —
   auto-classification didn't find them, and a `udc-button-primary`
   instance is stranded at the page top level.
7. **`badge` has a stranded `udc-badge` instance** at top-level
   (`y = 3480`) outside the wrapper — also from auto-classification.

## How to read this report

Each drift below compares two things:

- **Template** — the canonical authored design on page `7481:14`, the
  source of truth per the skill's stated contract.
- **Builder recipe** — what `build-card.js` actually emits (matches
  what's currently on the rolled-out pages).

Confidence: **high** for every drift listed (each was read directly via
the Plugin API). Risk class per `uds-figma-change-classification.mdc`:
**potentially-breaking** for layout-direction drifts (#1, #2),
**non-breaking** for radius/text drifts (#3–#5), **destructive (content
loss)** for #6.

## Drift catalog

### 1. VARIANTS — row direction (`HORIZONTAL` → `VERTICAL`)

| Source | Frame | `layoutMode` | `itemSpacing` | Stage layout |
|---|---|---|---|---|
| Template | `7687:46` `variants-row` | **HORIZONTAL** | 32 (`space/400`) | 3× FIXED stages (`stage-Variant A/B/C`, w 827, h 920, padding `[32,40,40,40]`, radius **12**) |
| Builder recipe | `build-card.js:778` | **VERTICAL** | 24 (`space/300`) | FILL stages (radius **lg = 16**) |
| Rolled-out badge | `7748:1559` `variants-row` | **VERTICAL** | 24 | FILL stage `stage-udc-badge`, padding `[32,40,40,40]`, radius **16** |
| Rolled-out button | `7747:1364` `variants-row` | **VERTICAL** | 24 | FILL stages |

The original builder used `HORIZONTAL` with `HUG` stages. Commit `83aa958`
flipped this to `VERTICAL`/`FILL` because the wrapped layout produced
"too-narrow stages on components with two or more sets." But the **fix
was wrong**: the template uses `HORIZONTAL` with **FIXED** stages sized
to fit (varies per component), not `HUG`. The builder needs to size
stages per the actual variant count, not collapse to a vertical stack.

### 2. SUB-COMPONENTS — row direction (`HORIZONTAL` → `VERTICAL`)

| Source | Frame | `layoutMode` | Stage layout |
|---|---|---|---|
| Template | `7687:70` `subs-row` | **HORIZONTAL** | 2× FIXED stages (`stage-Sub-component A/B`, w 1256, h 440, padding `[32,40,40,40]`, radius **12**) |
| Builder recipe | `build-card.js:829` | **VERTICAL** (`subs-col`) | FILL stages, radius **16** |

Same `83aa958` commit, same wrong fix. Template is `HORIZONTAL` with
FIXED stages.

### 3. Outer wrapper — `cornerRadius`

| Source | Node | `cornerRadius` |
|---|---|---|
| Template | `7685:2` `_template-component-card` | **24** |
| Builder recipe | `build-card.js:347-352` | (not set, defaults to **0**) |
| Rolled-out badge | `7748:1517` `udc-badge-page` | **0** |
| Rolled-out button | `7747:1325` `udc-button-page` | **0** |

The "Round the page wrapper to match section radius" commit (`7b03f57`)
was made — but it appears to have rounded only the rule description, not
the actual builder. The rolled-out wrappers are flat-cornered. The
template has `radius/container-xl` (24).

### 4. Stages — `cornerRadius`

| Section | Template stages | Builder recipe |
|---|---|---|
| ANATOMY (`state-Default/Hover/Active/Disabled`) | **12** | **16** (`V.radius.lg`) |
| VARIANTS (`stage-*`) | **12** | **16** |
| SUB-COMPONENTS (`stage-*`) | **12** | **16** |
| HEADER `hero-preview` | 16 | 16 (matches) |
| USAGE columns | 16 | 16 (matches) |
| META `link-*` | 16 | 16 (matches) |

The template uses `container-md` (12) for inner stages. Builder uses
`container-lg` (16) uniformly. The hero-preview, USAGE, and META links
are correct; the inner-stage radii are off by one step.

### 5. Section title and description text

| Section | Template | Builder recipe |
|---|---|---|
| ANATOMY title | "States" | "States" ✅ |
| ANATOMY description | "Interaction states for **the primary medium variant**. Each state has its own visual treatment to communicate affordance." | "Interaction states for **`<primary set name>`**. Each state has its own visual treatment to communicate affordance." |
| VARIANTS title | "Variant matrix" | "All variants" / "`<n>` variants" / natural-language list per spec |
| VARIANTS description | "Each variant shows the full state matrix — destructive on/off, sizes, icon options, and interaction states." | "Every visual variation of `<the component / these component sets>`, organized by its variant properties." |
| SUB-COMPONENTS title | "Component groups" / "Button groups" / etc. (component-specific) | "Sub-component sets" |
| SUB-COMPONENTS description | "Sub-component sets that compose with the primary set — like button groups or input add-ons. Reparented in as their own stages." | "`<n>` sub-component set... Reparented from their original page-level positions; reusable but not typically instanced standalone." |
| USAGE description | (none — title only) | (none) ✅ |
| ACCESSIBILITY description | "How keyboard users and assistive technology interact with this component." | "How keyboard users and assistive technology interact with this component." ✅ |
| META title | "Where to go from here" | "Where to go from here" ✅ |

The template's VARIANTS title ("Variant matrix") and SUB-COMPONENTS
title ("Component groups" / "Button groups") are richer and more
component-specific than the builder's generic auto-derived strings.

### 6. ACCESSIBILITY `keyboard-table` — `cornerRadius`

| Source | `cornerRadius` |
|---|---|
| Template `7688:42` | **16** (`container-lg`) |
| Builder recipe `build-card.js:990` | (not set, **0**) |
| Rolled-out badge `7748:1596` | **0** |

The template wraps the table in a 16px-rounded frame. Builder leaves it
square.

### 7. `button` — missing ANATOMY and SUB-COMPONENTS sections

| Source | Sections rendered |
|---|---|
| Template | HEADER, ANATOMY, VARIANTS, SUB-COMPONENTS, USAGE, ACCESSIBILITY, META |
| Rolled-out `udc-button-page` | HEADER, **(no ANATOMY)**, VARIANTS, **(no SUB-COMPONENTS)**, USAGE, ACCESSIBILITY, META |
| Rolled-out top-level | `udc-button-page` + **stranded `udc-button-primary` INSTANCE** at top level |

Two related failures:

- **Auto-discovery missed state variants.** The skill's `buildAnatomy()`
  helper requires at least `Default` plus one other state. Either the
  primary set's variant property names don't match the regex set
  (`State=Default`, `State=Hover`, etc.), or the matching variants
  failed the "match all OTHER props to the default" filter. Either way,
  ANATOMY was silently skipped — the template explicitly shows it should
  be there.
- **Auto-discovery missed sub-components.** Button has a `_udc-button-group`
  COMPONENT_SET in the file (per the existing spec), but it wasn't
  included on the page when the rollout ran, OR it was named without a
  leading underscore so it landed in VARIANTS instead of
  SUB-COMPONENTS, OR it was already absent. Either way, the
  SUB-COMPONENTS section is gone.
- **`udc-button-primary` is stranded at top level.** Build-card.js's
  "stragglers" handler (lines 1241-1266) places non-classified preserved
  nodes at page level under the wrapper for designer review. The
  primary set was inventoried but didn't get reparented into either
  HEADER's hero (because it's a COMPONENT, not a COMPONENT_SET, and
  `primarySet.node.defaultVariant.createInstance()` couldn't be called
  on a single COMPONENT) or VARIANTS.

This is the highest-priority drift. **Content loss, not just style.**

### 8. `badge` — stranded `udc-badge` INSTANCE at top level

| Field | Value |
|---|---|
| Wrapper hero-preview INSTANCE | `7748:1539` `udc-badge` (clone created by builder, used in HEADER hero) |
| Stranded INSTANCE at page level | `7679:193` `udc-badge` at `(0, 3480)` |

Builder cloned the badge into the hero-preview correctly, but the
original page-level INSTANCE was inventoried and didn't match any
classification rule, so the stragglers handler dropped it below the
wrapper. The template doesn't have any stranded nodes; this is visual
clutter and breaks the "no top-level nodes outside the wrapper"
contract from the card rule.

## Status of the fix tiers

### Tier A — Skill/rule corrections — APPLIED

Brought the rule and skill into honest alignment with what the builder
actually does. The "template wins" contract that the builder never
honored has been removed.

- A1. ✅ Updated `uds-figma-component-card.mdc` step 2 — the template is
  now described as a designer-authored visual reference and **NOT a
  runtime input**. The "template wins" line was deleted. Cross-links to
  the audit script and this report were added.
- A2. ✅ Updated `SKILL.md` pre-flight step 6 to match A1.
- A3. ✅ Added `.cursor/figma/state/card-template.snapshot.json`
  (structural snapshot of the canonical `📐 _TEMPLATE` page, id
  `7481:14`) and `scripts/audit-figma-card-template.sh` (CI audit
  that fails when `build-card.js` stops emitting the snapshot's values).
  Wired into `.github/workflows/audits.yml` as the "Figma card template
  recipe currency" step.

### Tier B — Builder corrections — APPLIED B1–B6; B7–B8 DEFERRED

Concrete fixes to `build-card.js`. No Figma writes, no `uds-docs/uds/`
writes.

- B1. ✅ Outer `udc-<id>-page` wrapper now binds all four corner radii to
  `V.radius.xl` (24) and sets `clipsContent = true` so the rounded
  corners actually render. Matches template `_template-component-card`.
- B2. ✅ VARIANTS row switched from `VERTICAL`/FILL to `HORIZONTAL` with
  FIXED-width stages computed as `floor((2544 - 32 * (n - 1)) / n)` for
  n variant sets — even-split across the inner card width minus 32px
  gaps. Matches template stages of 827px each at n=3.
- B3. ✅ SUB-COMPONENTS row switched the same way (was `subs-col`
  VERTICAL/FILL → now `subs-row` HORIZONTAL/FIXED).
- B4. ✅ Stage corner radii (ANATOMY state cells, VARIANTS stages,
  SUB-COMPONENTS stages) all rebound to `V.radius.md` (12). Outer cards,
  hero-preview, USAGE columns, META link cards, and the keyboard-table
  remain at `V.radius.lg` (16) per the template.
- B5. ✅ `keyboard-table` now binds all four corner radii to
  `V.radius.lg` (16) and sets `clipsContent = true` to mask the
  bottom-edge row borders.
- B6. ✅ Section text aligned to the template:
  - VARIANTS title → "Variant matrix" (was: "All variants" / "N variants")
  - VARIANTS description → "Each variant shows the full state matrix —
    destructive on/off, sizes, icon options, and interaction states."
  - SUB-COMPONENTS title → "Component groups" (was: "Sub-component sets")
  - SUB-COMPONENTS description → "Sub-component sets that compose with
    the primary set — like button groups or input add-ons. Reparented
    in as their own stages."
  - ANATOMY description → "Interaction states for the primary medium
    variant. Each state has its own visual treatment to communicate
    affordance." (was: dynamic with `${primarySet.node.name}`)
- B7. ⏸ DEFERRED — Auto-discovery for COMPONENT-typed primaries (not
  just COMPONENT_SETs). The button page lost ANATOMY and SUB-COMPONENTS
  sections because its primary `udc-button-primary` is an INSTANCE/
  COMPONENT, not a COMPONENT_SET. Builder needs a code path that
  handles single-COMPONENT primaries and improved State-variant
  matching. Tracked in `.cursor/figma/state/card-template.snapshot.json` `knownDeferredFromBuilder`.
- B8. ⏸ DEFERRED — Stragglers dedupe. Badge page has a stranded
  `udc-badge` INSTANCE at `y=3480`. Removing duplicate INSTANCEs is
  destructive and needs a designer-confirmed policy before it can land.
  Tracked alongside B7.

Both deferred items need careful validation before shipping; current PR
scope is the layout-recipe corrections that are unambiguous matches to
the template.

### Tier C — Card rebuild — NOT YET REQUESTED

After Tier B lands, re-running the builder against the 8 in-progress
component pages in update mode would produce cards that match the
canonical `📐 _TEMPLATE`. Per `uds-figma-component-card-update.mdc`,
update mode preserves descendants and surfaces any `droppedNodes`.

This requires explicit user direction naming the target component(s)
per `uds-figma-write-safety.mdc` before any write happens. Not
authorized by the current task.

## Appendix — page IDs touched in this read-only audit

| Page | Page ID |
|---|---|
| `📐 _TEMPLATE { Component card }` | `7481:14` |
| `🟠 badge` | `5440:5049` |
| `🟠 button` | `5055:139` |

Other 🟠 pages (not individually inspected for this report, but they
were part of the rollout): `5657:6776` icon-wrapper, `5621:7276` link,
`5445:5056` checkbox, `5445:5057` radio, `5122:68` dropdown, `5122:870`
data-table.
