#!/usr/bin/env bash
# aggregate-changelog.sh
# Walks uds-docs/uds/components/*/changelog.json and writes a release-level
# uds-docs/uds/CHANGELOG.json that groups entries by UDS version.
#
# Optionally merges in entries from uds-docs/uds/CHANGELOG.globalNotes.json
# (hand-curated non-component notes per release).
#
# Phase 9's release.sh will call this automatically. For Phase 8 it's run
# manually to bootstrap the initial uds/CHANGELOG.json.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/aggregate_changelog.py" "$@"
