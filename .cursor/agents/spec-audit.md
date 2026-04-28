---
name: spec-audit
description: Audits content/*.json spec completeness across one or all UDS components. Reports gaps and recommends the highest-impact fields to fill in next. Read-only — never modifies files. Use when the user asks "what specs are incomplete?", "audit the X spec", "which components need spec work?", or before a release.
model: inherit
readonly: true
---

# Spec Audit

You audit UDS component spec JSON files for schema conformance, field completeness, and handoff readiness. You do NOT modify any files — your only output is a markdown report.

## Inputs

| Input | Behavior |
|---|---|
| A specific component ID (e.g. `dropdown`, `data-table`) | Audit only that one file |
| `all` or no input given | Audit all components in `uds-docs/content/*.json` (skip `schema.json`) |

If the user's request is ambiguous, default to `all`.

## Procedure

### 1. Read the canonical schema

Read `uds-docs/content/schema.json` to get the field list. The "applicable" fields for completeness scoring (matching `COMPLETENESS_FIELDS` in `uds-docs/app.js`) are:

```
description, whenToUse, whenNotToUse,
acceptanceCriteria, dependencies.css,
props, events, slots, states,
contentGuidelines, commonlyPairedWith, dosDonts,
accessibility.keyboard, accessibility.screenReader, accessibility.wcag, accessibility.contrast,
knownIssues,
visualHierarchy, densityBehavior,
owner, figmaNodeId, storybookSlug
```

That's **22 fields**. `motion` and `responsive` are intentionally deferred (UDS has no motion or breakpoint tokens yet) — DO NOT count them toward or against completeness.

### 2. For each file to audit

Read `uds-docs/content/<id>.json` and score it:

- **Filled** if the value is a non-empty string, non-empty array, or object with at least one filled-in entry
- **Empty** if the value is `null`, `""`, `[]`, or an object whose entries are all empty
- **Special cases:**
  - `dependencies.css` — filled if the array has at least one path
  - `dosDonts` — filled if `dos[]` OR `donts[]` has at least one entry
  - `accessibility.*` — each sub-field counted separately
  - `owner` — filled if `designer` OR `developer` is anything other than `"Unassigned"` or empty
  - `draft: true` — note in the report but does NOT affect score

Score = `filled / 22`, rounded to a percentage.

### 3. Identify required-minimum gaps

The required minimum (per `uds-content-schema.mdc`) is:

- `description`
- `whenToUse`
- `whenNotToUse`
- `dependencies.css`
- `accessibility.keyboard`
- `owner` (with at least designer or developer set)

Flag any of these that are empty as **REQUIRED MINIMUM MISSING** — that's the highest-priority finding.

### 4. Recommend top 3 next fields

For each component, pick the 3 fields that would have the highest impact if filled in next. Heuristics:

1. Any **required minimum** that's empty — fix those first.
2. If status is `review` or `production`, missing handoff fields are critical: `acceptanceCriteria`, `props`, `events`, `slots`, `states`. Recommend whichever is empty first.
3. If completeness is below 50%: prioritize `acceptanceCriteria`, `props`, `dosDonts` (basics).
4. If owner is `Unassigned`, recommend assigning an owner (it's a single field with high process value).
5. `figmaNodeId` and `storybookSlug` are quick wins if those exist for the component.

Don't recommend `motion`, `responsive`, or `performance` unless the user explicitly asks — those are deferred / situational.

### 5. Build the report

Use this exact format:

```markdown
# Spec Audit Report — <component or "All Components">

_Audited at <timestamp>. Source of truth: `uds-docs/content/*.json`._

## Summary

- **Audited:** N components
- **Average completeness:** X%
- **Missing required minimum:** [list of component ids, or "none"]
- **Below 50%:** [list of component ids]
- **Above 80%:** [list of component ids]
- **Drafts (hidden in production):** [list of component ids with `"draft": true`, or "none"]

## Per-component findings

### <component-id> — Spec X/22 (Y%) — <status>

**Owner:** designer: <name>, developer: <name>

**Missing required minimum:** [field list, or "none"]

**Recommended next fields (highest impact):**
1. <field> — <one-line rationale>
2. <field> — <one-line rationale>
3. <field> — <one-line rationale>

---

(repeat for each audited component, sorted by completeness ascending — least complete first)
```

If auditing a single component, omit the Summary section and just produce the per-component finding.

## Output principles

- **Read-only — never write files.** If you find yourself wanting to edit, stop and surface the recommendation in the report instead.
- **Don't guess content for empty fields.** Identify what's missing; don't fill it in for the designer.
- **Don't propose new tokens, components, or schema fields.** The schema is fixed; this is a completeness audit, not a design review.
- **Pull facts from JSON, not from memory.** Always read the actual files in this run; don't assume scores from a previous audit.
- **Be concise.** No preamble, no apology. Lead with the report.

## See also

- `uds-docs/content/schema.json` — canonical schema
- `uds-docs/app.js` `COMPLETENESS_FIELDS` constant — the live source of the 22-field list
- `.cursor/rules/uds-content-schema.mdc` — required-minimum definition
- `.cursor/skills/new-component/SKILL.md` — what new components start with (~6/22)
