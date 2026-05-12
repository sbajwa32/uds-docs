# Cursor Toolchain Index

Inventory of every Cursor rule, skill, and subagent in this repo, with
the date each was last modified. The agent reads this at session start to
see at a glance what has changed in the instruction layer.

## Discipline

Whenever you edit any file under `.cursor/rules/`, `.cursor/skills/`,
or `.cursor/agents/`:

1. Bump that file's `lastUpdated:` in its YAML frontmatter to today's
   date (use the system `date` command — never guess).
2. Update the matching row in this file (date column, and description if
   the frontmatter description changed).
3. If you add a new file, add a new row in the right section.

CI does not enforce this yet. Treat it the same way you treat
SITE_CHANGELOG discipline: it is a non-negotiable post-edit step.

## Sync check

Before relying on anything below, confirm the local repo is current with
`origin/main`. The `sessionStart` hook in `.cursor/hooks.json` does this
automatically; the `Phase -1` step in `uds-master-preflight.mdc` is the
manual fallback.

## Rules (16)

| File | Last updated | Description |
|---|---|---|
| [`uds-component-checklist.mdc`](./rules/uds-component-checklist.mdc) | 2026-05-08 | Checklist for implementing or updating a UDS component — ensures the per-component folder is whole and consistent across CSS, spec,… |
| [`uds-content-schema.mdc`](./rules/uds-content-schema.mdc) | 2026-05-08 | When editing per-component spec content, edit the spec.json INSIDE that component's folder — never re-introduce component spec content into… |
| [`uds-figma-change-classification.mdc`](./rules/uds-figma-change-classification.mdc) | 2026-04-30 | Classifies Figma-derived token and component changes by confidence and breaking-change risk before anything is applied. |
| [`uds-figma-component-card-update.mdc`](./rules/uds-figma-component-card-update.mdc) | 2026-05-12 | Update-mode companion to uds-figma-component-card.mdc. Defines what to do when the figma-component-card skill is re-run on a page that… |
| [`uds-figma-component-card.mdc`](./rules/uds-figma-component-card.mdc) | 2026-05-12 | Canonical card layout for UDS Components Figma pages. Defines the seven-card structure, token bindings, and read-only contract against… |
| [`uds-figma-component-inspection.mdc`](./rules/uds-figma-component-inspection.mdc) | 2026-05-09 | Requires deep Figma node inspection for UDS Components; screenshots are supporting evidence only. |
| [`uds-figma-preflight.mdc`](./rules/uds-figma-preflight.mdc) | 2026-05-09 | Required preflight for any task that reads or writes UDS Figma files. |
| [`uds-figma-sync-state.mdc`](./rules/uds-figma-sync-state.mdc) | 2026-04-30 | Defines tracked Figma sync snapshots and when agents may update them. |
| [`uds-figma-write-safety.mdc`](./rules/uds-figma-write-safety.mdc) | 2026-04-30 | Prevents accidental Figma mutations during UDS sync work. Read-only is the default; writes are explicitly scoped and summarized. |
| [`uds-master-preflight.mdc`](./rules/uds-master-preflight.mdc) | 2026-05-12 | Master workflow rule — enforces version bump FIRST, then changes, then finalize. Runs on every task that modifies uds-docs/. |
| [`uds-release-workflow.mdc`](./rules/uds-release-workflow.mdc) | 2026-05-12 | UDS Design System release workflow -- detects Figma version bumps and guides the release process for the documentation site |
| [`uds-rule-discipline.mdc`](./rules/uds-rule-discipline.mdc) | 2026-05-12 | Discipline that fires whenever you edit a Cursor rule, skill, or subagent file. Bump that file's `lastUpdated:` frontmatter and update the matching row in `.cursor/TOOLCHAIN.md` in the same commit. |
| [`uds-site-changelog.mdc`](./rules/uds-site-changelog.mdc) | 2026-05-08 | Enforces site version bumping, SITE_CHANGELOG updates, and cache busting on every documentation site change. |
| [`uds-source-of-truth.mdc`](./rules/uds-source-of-truth.mdc) | 2026-05-11 | Figma is the source of truth for everything under uds-docs/uds/ — tokens, component CSS, specs, examples, schemas, all of it. Agents must… |
| [`uds-token-architecture.mdc`](./rules/uds-token-architecture.mdc) | 2026-05-08 | Canonical UDS Tokens Figma variable architecture and CSS output contract. Direct Figma Variables reads are primary; ZIP exports are… |
| [`uds-token-first-css.mdc`](./rules/uds-token-first-css.mdc) | 2026-04-28 | Enforces UDS token usage in all CSS — no hardcoded colors, spacing, fonts, or radii. |

## Skills (8)

| Skill | Last updated | Description |
|---|---|---|
| [`figma-component-card`](./skills/figma-component-card/SKILL.md) | 2026-05-12 | Build or update the canonical "component card" canvas layout on a UDS component page in Figma. Use when the user says "build/update the… |
| [`import-figma-tokens`](./skills/import-figma-tokens/SKILL.md) | 2026-05-12 | Import UDS token changes from the UDS Tokens Figma file. Uses direct Figma Variables reads first and token ZIP exports only as fallback.… |
| [`link-figma-nodes`](./skills/link-figma-nodes/SKILL.md) | 2026-05-12 | Populate figmaNodeId and figmaPageNodeId fields in per-component spec.json files from canonical UDS Components Figma nodes. Use when Figma… |
| [`new-component`](./skills/new-component/SKILL.md) | 2026-05-08 | Scaffold a new UDS component end to end. Creates uds/components/<id>/ with all required files (CSS stub, spec.json, status.json,… |
| [`sync-figma-component-spec`](./skills/sync-figma-component-spec/SKILL.md) | 2026-05-12 | Update a UDS component's per-component artifacts (spec.json, CSS, examples, impl.json, playground.js) from a deep Figma component… |
| [`sync-figma-component-status`](./skills/sync-figma-component-status/SKILL.md) | 2026-05-12 | Sync UDS Components Figma stoplight page prefixes into per-component status.json files. Use after figma-inventory reports status mismatches. |
| [`sync-figma-release-notes`](./skills/sync-figma-release-notes/SKILL.md) | 2026-05-12 | Rebuild Release Notes frames in both UDS Figma files from the aggregated UDS CHANGELOG. Use during releases or after CHANGELOG changes that… |
| [`uds-updated`](./skills/uds-updated/SKILL.md) | 2026-05-08 | Orchestrate a full UDS Figma-to-docs sync from a simple prompt like "UDS updated" or "Figma updated". Reads Figma Tokens and Components,… |

## Subagents (7)

| Agent | Last updated | Description |
|---|---|---|
| [`figma-capability-check`](./agents/figma-capability-check.md) | 2026-05-07 | Read-only probe that reports what the current Figma integration can actually access for UDS Tokens and UDS Components. Use before relying… |
| [`figma-component-card-audit`](./agents/figma-component-card-audit.md) | 2026-05-11 | Audits one or all UDS component pages in a Figma file against the canonical component-card spec. Verifies structure, token bindings, status… |
| [`figma-component-inspector`](./agents/figma-component-inspector.md) | 2026-05-12 | Deep-inspects a single UDS component in the UDS Components Figma file by reading node trees, component sets, variants, layer details, token… |
| [`figma-inventory`](./agents/figma-inventory.md) | 2026-05-12 | Read-only inventory of UDS Figma files. Lists versions, component pages, statuses, new/missing components, node fingerprints, and doc-site… |
| [`figma-spec-gap`](./agents/figma-spec-gap.md) | 2026-05-12 | Read-only agent that compares UDS Components Figma coverage against the doc site's component JSON specs, sidebar pages, figmaNodeId fields,… |
| [`figma-token-audit`](./agents/figma-token-audit.md) | 2026-05-07 | Directly reads the UDS Tokens Figma Variables structure, validates it against the token architecture contract, diffs it against the last… |
| [`spec-audit`](./agents/spec-audit.md) | 2026-05-12 | Audits per-component spec.json completeness across one or all UDS components. Reports gaps and recommends the highest-impact fields to fill… |
