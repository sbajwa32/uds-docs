#!/usr/bin/env bash
# audit-factory-version-currency.sh
#
# Fail if any commit after the audit baseline touched a FACTORY file — a file
# whose edits can change what the component factory PRODUCES — WITHOUT also
# touching .cursor/figma/state/factory-version.json in the same commit. That
# is: factory output may have changed but the build version wasn't bumped.
#
# Factory files (per .cursor/rules/uds-factory-versioning.mdc "When to bump"
# globs):
#   .cursor/skills/generate-uds-figma-component/**
#   .cursor/rules/uds-figma-factory-quality.mdc
#   .cursor/rules/uds-figma-plugin-api-gotchas.mdc
#   .cursor/rules/uds-design-language.mdc
#   .cursor/rules/uds-naming-conventions.mdc
#
# Exemption: commits whose message contains '[no-factory-bump: <reason>]' are
# intentional skips — the edit is output-neutral (prose, typo, reordering,
# audit/process-only). The reason is surfaced in the audit output. This mirrors
# the '[no-changelog: ...]' escape in audit-changelog-currency.sh.
#
# Grandfathering: commits at or before the baseline SHA (scripts/audit-baseline.json)
# are ignored, so pre-existing history doesn't fail CI. Re-baseline only on a
# deliberate decision.
#
# NOTE: an audit cannot judge whether an edit *actually* changed factory output —
# that's a semantic call. What it CAN do is force the decision to be made and
# reviewed on every PR: bump, or say in writing why not. That's the point.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

BASELINE_CONFIG="scripts/audit-baseline.json"
VERSION_FILE=".cursor/figma/state/factory-version.json"
FACTORY_PATHS=(
  ".cursor/skills/generate-uds-figma-component"
  ".cursor/rules/uds-figma-factory-quality.mdc"
  ".cursor/rules/uds-figma-plugin-api-gotchas.mdc"
  ".cursor/rules/uds-design-language.mdc"
  ".cursor/rules/uds-naming-conventions.mdc"
)

if [ ! -f "$BASELINE_CONFIG" ]; then
  echo "FAIL — missing $BASELINE_CONFIG" >&2
  exit 1
fi

BASELINE_SHA="$(python3 -c "import json; print(json.load(open('$BASELINE_CONFIG'))['audit-factory-version-currency']['baseline'])")"

if [ -z "$BASELINE_SHA" ]; then
  echo "FAIL — baseline SHA not set in $BASELINE_CONFIG" >&2
  exit 1
fi

# Verify the baseline SHA is reachable. If not (shallow clone), fall back to the
# merge-base with origin/main so the audit still runs over the PR's commits.
if ! git rev-parse --verify --quiet "${BASELINE_SHA}^{commit}" >/dev/null; then
  echo "NOTE: baseline $BASELINE_SHA not reachable locally; falling back to merge-base with origin/main"
  if git rev-parse --verify --quiet origin/main >/dev/null; then
    BASELINE_SHA="$(git merge-base HEAD origin/main 2>/dev/null || echo "")"
  fi
  if [ -z "$BASELINE_SHA" ]; then
    echo "audit-factory-version-currency: no usable baseline; skipping (PASS)"
    exit 0
  fi
fi

# Commits after the baseline that touched any factory file.
# Format: SHA<TAB>subject (subject used to detect [no-factory-bump: ...]).
factory_commits="$(git log --pretty=format:'%H%x09%s' "${BASELINE_SHA}..HEAD" -- "${FACTORY_PATHS[@]}" 2>/dev/null || true)"

if [ -z "$factory_commits" ]; then
  echo "OK — no factory-file commits since baseline ($BASELINE_SHA); factory version current"
  exit 0
fi

bad_commits=()
exempt_commits=()
while IFS=$'\t' read -r sha subject; do
  [ -n "$sha" ] || continue

  # Covered if the same commit also bumped factory-version.json.
  if git diff-tree --no-commit-id --name-only -r "$sha" 2>/dev/null | grep -Fxq "$VERSION_FILE"; then
    continue
  fi

  # Exempt if the commit message declares the edit output-neutral.
  full_msg="$(git log -1 --pretty=%B "$sha" 2>/dev/null || true)"
  if echo "$full_msg" | grep -Eq '\[no-factory-bump:'; then
    reason="$(echo "$full_msg" | grep -oE '\[no-factory-bump:[^]]+\]' | head -1)"
    exempt_commits+=("    - $sha $subject  $reason")
    continue
  fi

  bad_commits+=("    - $sha  $subject")
done <<< "$factory_commits"

if [ ${#bad_commits[@]} -gt 0 ]; then
  echo "FAIL — factory-file commits since baseline ($BASELINE_SHA) without a factory-version.json bump:"
  for line in "${bad_commits[@]}"; do
    echo "$line"
  done
  echo ""
  echo "A factory file changed (generate-uds-figma-component / uds-figma-factory-quality /"
  echo "uds-figma-plugin-api-gotchas / uds-design-language / uds-naming-conventions)."
  echo "If it changed factory OUTPUT, bump .cursor/figma/state/factory-version.json in the SAME"
  echo "commit (fresh YYYY.MM.DD.N + newest-first changelog entry) per"
  echo ".cursor/rules/uds-factory-versioning.mdc."
  echo "If the edit is output-neutral (prose, typo, reordering, audit/process-only), add"
  echo "'[no-factory-bump: <reason>]' to the commit message."
  if [ ${#exempt_commits[@]} -gt 0 ]; then
    echo ""
    echo "Exempt via [no-factory-bump: ...]: ${#exempt_commits[@]}"
    for line in "${exempt_commits[@]}"; do
      echo "$line"
    done
  fi
  exit 1
fi

echo "OK — all factory-file commits since baseline ($BASELINE_SHA) carry a factory-version.json bump or an explicit [no-factory-bump: ...] exemption"
if [ ${#exempt_commits[@]} -gt 0 ]; then
  echo "Exempt commits (allowed via [no-factory-bump: ...]):"
  for line in "${exempt_commits[@]}"; do
    echo "$line"
  done
fi
