#!/usr/bin/env bash
# audit-changelog-currency.sh
#
# For each component under uds-docs/uds/components/<id>/, fail if any commit
# after the audit baseline (scripts/audit-baseline.json) touched a source
# file (CSS, JS, spec.json, examples/**, impl.json, playground.js,
# status.json) WITHOUT also touching changelog.json — i.e., the source files
# have moved ahead of the per-component changelog.
#
# Exemption: commits whose message contains '[no-changelog: <reason>]' are
# treated as intentional skips (typically reverts toward verified Figma
# parity). The reason is surfaced in the audit output.
#
# Grandfathering: commits at or before the baseline SHA are ignored, so
# pre-existing un-changelog'd state does not fail CI. To re-baseline (e.g.
# after a sweep that backfills all changelogs), update
# scripts/audit-baseline.json.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

BASELINE_CONFIG="scripts/audit-baseline.json"
COMPONENTS_DIR="uds-docs/uds/components"

if [ ! -f "$BASELINE_CONFIG" ]; then
  echo "FAIL — missing $BASELINE_CONFIG" >&2
  exit 1
fi

BASELINE_SHA="$(python3 -c "import json; print(json.load(open('$BASELINE_CONFIG'))['audit-changelog-currency']['baseline'])")"

if [ -z "$BASELINE_SHA" ]; then
  echo "FAIL — baseline SHA not set in $BASELINE_CONFIG" >&2
  exit 1
fi

# Verify the baseline SHA is reachable in this repo's history. If not (e.g.
# shallow clone in CI), fall back to the merge-base with origin/main so the
# audit still runs but only checks the current PR's commits.
if ! git rev-parse --verify --quiet "${BASELINE_SHA}^{commit}" >/dev/null; then
  echo "NOTE: baseline $BASELINE_SHA not reachable locally; falling back to merge-base with origin/main"
  if git rev-parse --verify --quiet origin/main >/dev/null; then
    BASELINE_SHA="$(git merge-base HEAD origin/main 2>/dev/null || echo "")"
  fi
  if [ -z "$BASELINE_SHA" ]; then
    echo "audit-changelog-currency: no usable baseline; skipping (PASS)"
    exit 0
  fi
fi

FAIL=0
FAIL_LINES=()
SKIP_LINES=()
OK_COUNT=0

for comp_dir in "$COMPONENTS_DIR"/*/; do
  [ -d "$comp_dir" ] || continue
  comp_id="$(basename "$comp_dir")"

  # Source files = everything in the component folder except changelog.json
  # itself. We pass them all to git log so any commit touching any of them
  # counts.
  # $comp_dir already ends in '/' (from the */ glob on the for-loop line), so
  # paths are built as "${comp_dir}<basename>" — adding a literal '/' would
  # produce a double-slash path that git tolerates but `grep -Fxq` against
  # `git diff-tree`'s canonical single-slash output cannot match (see the
  # changelog_path check below).
  src_paths=(
    "${comp_dir}${comp_id}.css"
    "${comp_dir}${comp_id}.js"
    "${comp_dir}spec.json"
    "${comp_dir}status.json"
    "${comp_dir}impl.json"
    "${comp_dir}playground.js"
    "${comp_dir}examples"
  )
  # Only keep paths that actually exist (some components have no JS).
  existing_src=()
  for p in "${src_paths[@]}"; do
    [ -e "$p" ] && existing_src+=("$p")
  done
  [ ${#existing_src[@]} -gt 0 ] || continue

  changelog_path="${comp_dir}changelog.json"
  [ -f "$changelog_path" ] || continue

  # Find all commits after the baseline that touched any source file.
  # Format: SHA<TAB>subject (subject is used to detect [no-changelog: ...]).
  src_commits="$(git log --pretty=format:'%H%x09%s' "${BASELINE_SHA}..HEAD" -- "${existing_src[@]}" 2>/dev/null || true)"

  if [ -z "$src_commits" ]; then
    OK_COUNT=$((OK_COUNT + 1))
    continue
  fi

  # For each source-touching commit, decide whether it's covered.
  # Covered if:
  #   - the same commit also touches changelog.json, OR
  #   - the commit subject/body contains '[no-changelog:'
  bad_commits=()
  exempt_commits=()
  while IFS=$'\t' read -r sha subject; do
    [ -n "$sha" ] || continue

    # Was changelog.json touched in this commit?
    if git diff-tree --no-commit-id --name-only -r "$sha" 2>/dev/null | grep -Fxq "$changelog_path"; then
      continue
    fi

    # Full commit message (subject + body) for the exemption regex.
    full_msg="$(git log -1 --pretty=%B "$sha" 2>/dev/null || true)"
    if echo "$full_msg" | grep -Eq '\[no-changelog:'; then
      reason="$(echo "$full_msg" | grep -oE '\[no-changelog:[^]]+\]' | head -1)"
      exempt_commits+=("    - $sha $subject  $reason")
      continue
    fi

    bad_commits+=("    - $sha  $subject")
  done <<< "$src_commits"

  if [ ${#bad_commits[@]} -gt 0 ]; then
    FAIL=1
    FAIL_LINES+=("  $comp_id: ${#bad_commits[@]} un-changelog'd commit(s) since baseline:")
    for line in "${bad_commits[@]}"; do
      FAIL_LINES+=("$line")
    done
    if [ ${#exempt_commits[@]} -gt 0 ]; then
      FAIL_LINES+=("    (exempt via [no-changelog: ...]: ${#exempt_commits[@]})")
    fi
  else
    if [ ${#exempt_commits[@]} -gt 0 ]; then
      SKIP_LINES+=("  $comp_id: ${#exempt_commits[@]} exempt commit(s)")
    fi
    OK_COUNT=$((OK_COUNT + 1))
  fi
done

if [ $FAIL -eq 1 ]; then
  echo "FAIL — components have source-file commits since baseline ($BASELINE_SHA) without a matching changelog.json entry:"
  for line in "${FAIL_LINES[@]}"; do
    echo "$line"
  done
  echo ""
  echo "Fix: add a per-component changelog.json entry for the current UDS version in the same"
  echo "commit, or include '[no-changelog: <reason>]' in the commit message if the change is"
  echo "exempt (e.g. revert toward verified Figma parity)."
  exit 1
fi

echo "OK — $OK_COUNT component(s) have up-to-date changelog.json relative to source files (baseline: $BASELINE_SHA)"
if [ ${#SKIP_LINES[@]} -gt 0 ]; then
  echo "Exempt commits (allowed via [no-changelog: ...]):"
  for line in "${SKIP_LINES[@]}"; do
    echo "$line"
  done
fi
