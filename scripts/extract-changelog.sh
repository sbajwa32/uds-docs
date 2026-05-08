#!/usr/bin/env bash
# extract-changelog.sh <component-id>
# Extracts per-component changelog entries from the global CHANGELOG array
# in app.js and writes uds-docs/uds/components/<id>/changelog.json.
# MIGRATION ONLY — used by migrate-component.sh.
set -euo pipefail
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <component-id> [--dry-run]" >&2
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/extract_changelog.py" "$@"
