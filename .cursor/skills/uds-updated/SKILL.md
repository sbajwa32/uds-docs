---
name: uds-updated
description: Orchestrate a full UDS Figma-to-docs sync from a simple prompt like "UDS updated" or "Figma updated". Reads Figma Tokens and Components, classifies changes, applies only high-confidence non-breaking updates, and falls back to dry-run/reporting for ambiguous or breaking changes.
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
- compare to `UDS_VERSION` in `uds-docs/app.js`
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
- components requiring deep inspection
- ignored page count/list for any pages containing `{Ignore}`

Never auto-apply:

- component removals
- split/merge candidates
- ambiguous node matches
- status moves backward from `review` or `production`

### 5. Deep inspect changed/new components

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

### 6. Classify and decide

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

### 7. Apply safe updates

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

### 8. Verify

Required verification:

- parse changed JSON files
- run token CSS sanity checks if token files changed
- visually inspect affected pages in the desktop preview when available
- confirm `version.txt` matches the SITE version displayed in `index.html`
- confirm no generated docs render literal HTML as elements

### 9. Update sync snapshots

After verification, update:

- `.cursor/figma/state/last-sync.json`
- `.cursor/figma/state/tokens.snapshot.json`
- `.cursor/figma/state/components.snapshot.json`

Do not update snapshots for failed, partial, dry-run, or unverified runs.

### 10. Commit and push

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
- Do not auto-delete tokens/components.
- Do not update snapshots before verification.
- Do not create PRs; push directly to `main` after confirmed writes.
