#!/usr/bin/env bash
# audit-aggregate-currency.sh
#
# Re-runs aggregate-changelog.sh and aggregate-components.sh into temp
# files, then diffs against the committed uds/CHANGELOG.json and
# uds/components.json. Fails if either differs.
#
# Catches the "edited per-component changelog.json but forgot to re-aggregate"
# and "added/removed a component folder but forgot to refresh
# components.json" failure modes.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

CHANGELOG="uds-docs/uds/CHANGELOG.json"
COMPONENTS="uds-docs/uds/components.json"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# aggregate-changelog.sh writes to the canonical path. Stash the current file,
# regenerate, diff, then restore.
fail=0

# --- changelog ---
cp "$CHANGELOG" "$TMPDIR/CHANGELOG.committed.json"
bash scripts/aggregate-changelog.sh >/dev/null 2>&1 || {
  echo "FAIL — aggregate-changelog.sh exited non-zero" >&2
  exit 1
}
cp "$CHANGELOG" "$TMPDIR/CHANGELOG.regenerated.json"
# Restore the committed version before diffing so a failing audit doesn't leave the
# working tree modified.
cp "$TMPDIR/CHANGELOG.committed.json" "$CHANGELOG"

if ! diff -q "$TMPDIR/CHANGELOG.committed.json" "$TMPDIR/CHANGELOG.regenerated.json" >/dev/null; then
  echo "FAIL — $CHANGELOG is out of sync with per-component changelog.json files."
  echo "Run: bash scripts/aggregate-changelog.sh"
  echo "Diff (committed \u2192 regenerated, first 60 lines):"
  diff -u "$TMPDIR/CHANGELOG.committed.json" "$TMPDIR/CHANGELOG.regenerated.json" | head -60
  fail=1
fi

# --- components.json ---
cp "$COMPONENTS" "$TMPDIR/components.committed.json"
bash scripts/aggregate-components.sh >/dev/null 2>&1 || {
  echo "FAIL — aggregate-components.sh exited non-zero" >&2
  exit 1
}
cp "$COMPONENTS" "$TMPDIR/components.regenerated.json"
cp "$TMPDIR/components.committed.json" "$COMPONENTS"

if ! diff -q "$TMPDIR/components.committed.json" "$TMPDIR/components.regenerated.json" >/dev/null; then
  echo "FAIL — $COMPONENTS is out of sync with uds/components/<id>/ folders."
  echo "Run: bash scripts/aggregate-components.sh"
  echo "Diff (committed \u2192 regenerated, first 40 lines):"
  diff -u "$TMPDIR/components.committed.json" "$TMPDIR/components.regenerated.json" | head -40
  fail=1
fi

if [ "$fail" -eq 1 ]; then
  exit 1
fi

echo "OK — uds/CHANGELOG.json and uds/components.json match a fresh aggregate"
