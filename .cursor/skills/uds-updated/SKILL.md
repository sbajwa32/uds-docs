---
name: uds-updated
description: Orchestrate a full UDS Figma-to-docs sync from a simple prompt like "UDS updated" or "Figma updated". Reads Figma Tokens and Components, classifies changes, applies only high-confidence non-breaking updates, and falls back to dry-run/reporting for ambiguous or breaking changes.
lastUpdated: 2026-05-12T18:41:50Z
---

# UDS Updated

This is the top-level workflow for prompts like:

- `UDS updated`
- `Figma updated`
- `sync UDS from Figma`
- `pull latest UDS changes`

The goal is one reliable end-to-end Figma-to-docs pass:

1. Read UDS Tokens and UDS Components from Figma.
2. Compare against the last successful sync snapshot and the current doc site.
3. Classify all token/component/status/spec changes.
4. Apply only high-confidence, non-breaking updates.
5. Stop and ask on ambiguity, breaking changes, or destructive writes.
6. Update sync snapshots after verification.
7. Commit and push directly to `main`.

## Default mode

Default the first run on a new environment or after major workflow changes to
**dry run** unless the user explicitly says `apply`, `sync live`, or similar.

Explicit dry-run prompt:

```text
UDS updated -- dry run
```

Dry run means:

- no file edits
- no Figma writes
- no SITE bump
- no commits
- produce a structured "would change" report only

## MCP-enabled read requirement

The Figma agents used by this skill are **read-only in behavior**, but they
must run with MCP-enabled tool access. Do not invoke them with a subagent
`readonly: true` flag, Ask-mode restriction, or any execution mode that blocks
Figma MCP calls. If a read-only subagent reports that the Figma server is ready
but file access is blocked, rerun the Figma read from the main MCP-enabled
agent context before falling back to ZIPs or stopping.

## Required order

### 1. Capability check

Run `figma-capability-check`.

Stop if the tool cannot:

- list both Figma files' pages
- read UDS Tokens Variables collections and modes
- read UDS Components node trees

If Variables direct-read fails but file/page reads work, continue only in
ZIP-fallback planning mode for tokens.

### 2. Figma preflight

Follow `uds-figma-preflight.mdc`:

- UDS Tokens file key: `iqKgR73ubUHpQTIcF7XGMy`
- UDS Components file key: `1XJoUJgtNpw4R0IIT3VjoK`
- detect both `UDS Version: X.Y` pages
- compare to `UDS_VERSION` in `uds-docs/docs/app.js`
- skip any Figma page whose page name contains `{Ignore}`

If Figma version is higher than site version, report it and continue into this
sync workflow only if the user asked for a Figma sync/release. Otherwise pause.

### 3. Token audit

Run `figma-token-audit`.

Direct Figma Variables are the primary source. ZIPs are fallback only.

The token audit must return:

- architecture check
- structure diff
- value diff
- deleted/missing token classification
- confidence for every finding
- recommended action

Never auto-apply:

- token removals
- token renames
- collection/mode removals
- unresolved aliases
- any CSS custom property name change

### 4. Component inventory

Run `figma-inventory`.

The inventory must return:

- component status comparison
- missing/new/deleted component candidates
- page/component-set fingerprints
- component-set variant coverage for **every** non-ignored component page with
  a component set, including property names, enum values, and variant counts
- components requiring deep inspection
- ignored page count/list for any pages containing `{Ignore}`

For release/changelog work, broad inventory is not optional. The release is
incomplete if the changelog was written before this component-set variant
coverage is reviewed.

Never auto-apply:

- component removals
- split/merge candidates
- ambiguous node matches
- status moves backward from `review` or `production`

### 5. Release coverage pass

Before writing a UDS `CHANGELOG` entry or saying the release is complete,
perform a release coverage pass over the full non-ignored UDS Components
inventory:

1. Read every non-ignored status-prefixed component page.
2. For every component set on each page, extract:
   - component-set name
   - variant-property names
   - values for each variant property
   - variant/component count
3. Compare this matrix against the existing `CHANGELOG` entry being drafted.
4. The release changelog must include:
   - new public component pages
   - token additions/changes
   - status changes
   - meaningful new or confirmed variant/state coverage on existing components
   - internal/support pages intentionally excluded from public docs

Do not rely only on new/missing page detection. A release with no new pages can
still contain important variant/state coverage changes.

### 5a. Implementation-readiness classification

Every public Figma component page found during release sync must be classified
before it is added to the docs site:

| Classification | Requirements | Required docs treatment |
|---|---|---|
| `implementation-ready` | Has at least one inspectable component set, variant matrix, layer tree, and enough anatomy/token information to produce reference markup | Add or update JSON spec, Examples tab, Code tab, token-first CSS, Implementation Reference, Playground when useful, ZIP file list, and Demo Builder template when the component can appear in demos |
| `placeholder-only` | Public Figma page exists but has no component set or insufficient structure | Keep page only if useful, document `knownIssues`, keep examples/code/playground/demo-builder out, and say exactly what Figma data is missing |
| `internal-support` | Component exists only to support other components, such as low-level input/slot/control parts | Do not add as public docs unless the user explicitly asks |

Do not leave a public page with generic scaffold text like
`Examples will be added after the Figma component spec is inspected` when the
Figma page already has an inspectable component set. That is a failed sync.

### 6. Deep inspect changed/new components

For every component that inventory flags as changed or new, run
`figma-component-inspector`.

Do not use screenshots as source of truth. The inspector must read:

- node tree
- component-set variants
- layer names
- nested instances
- auto-layout
- token bindings
- text nodes
- hidden/off-canvas state matrices
- doc-site JSON/CSS/example comparison

### 7. Classify and decide

Use `uds-figma-change-classification.mdc`.

Auto-apply only:

- high-confidence token additions or value changes
- high-confidence status changes that are not backward moves from
  `review`/`production`
- high-confidence `figmaNodeId` additions
- high-confidence component spec updates from inspector output
- new component scaffolds when the required minimum data exists

Ask before applying:

- medium/low-confidence changes
- any breaking change
- any deletion/removal
- any component split/merge
- any Figma write
- any change that conflicts with current CSS implementation

### 8. Apply safe updates

If there are safe updates and the run is not dry-run:

1. If touching any `uds-docs/` file, run `bash uds-docs/bump-site.sh` before
   edits.
2. Apply narrow updates using the delegated skill:
   - tokens → `import-figma-tokens`
   - status → `sync-figma-component-status`
   - component spec → `sync-figma-component-spec`
   - node links → `link-figma-nodes`
   - release notes → `sync-figma-release-notes`
3. Add/update a SITE_CHANGELOG entry for the SITE version from the bump script.
4. Cache-bust changed assets in `index.html`.

### 9. Verify

Required verification:

- parse changed JSON files
- run token CSS sanity checks if token files changed
- visually inspect affected pages in the desktop preview when available
- confirm `version.txt` matches the SITE version displayed in `index.html`
- confirm no generated docs render literal HTML as elements
- **run `bash uds-docs/scripts/audit-demo-builder.sh`** — must exit 0.
  This catches Demo Builder drift: any implementable component (one whose
  `content/<id>.json` `knownIssues` does NOT contain "no inspectable
  component set yet") MUST be in both `DEMO_COMPONENTS` and `DEMO_TEMPLATES`,
  and every `udc-*` class used in `demo-builder.js` MUST be defined in some
  `uds/components/*.css` file. If this fails, fix Demo Builder before
  declaring the sync complete.
- confirm the UDS `CHANGELOG`  entry includes the release coverage pass:
  tokens, new component pages, existing-component variant/state coverage, and
  internal/support exclusions
- confirm Figma Release Notes frames in both UDS files contain the same
  expanded release text as the site changelog

### 10. Update sync snapshots

After verification, update:

- `.cursor/figma/state/last-sync.json`
- `.cursor/figma/state/tokens.snapshot.json`
- `.cursor/figma/state/components.snapshot.json`

Do not update snapshots for failed, partial, dry-run, or unverified runs.

### 11. Commit and push

Per `AGENTS.md`, commit and push directly to `main`:

```bash
git add -A
git commit -m "Sync UDS from Figma"
git push origin main
```

Use a more specific commit message when possible, e.g.
`Sync UDS tokens from Figma` or `Sync Figma component statuses`.

## Output format

Always end with:

```markdown
## UDS Figma sync result

Mode: dry-run | applied
Tokens: no changes | N safe changes | blocked
Components: no changes | N safe changes | blocked
Statuses: no changes | N changes | blocked
New components: none | list
Deleted/missing candidates: none | list, not applied
Figma writes: none | list
Docs deployed: yes/no

## Applied changes
- ...

## Blocked / needs user decision
- ...

## Verification
- ...
```

## Do not

- Do not ask for token ZIPs before trying direct Figma Variables.
- Do not derive component specs from screenshots.
- Do not write a release changelog from page names alone.
- Do not skip the component-set variant coverage pass for a UDS release.
- Do not auto-delete tokens/components.
- Do not update snapshots before verification.
- Do not create PRs; push directly to `main` after confirmed writes.
