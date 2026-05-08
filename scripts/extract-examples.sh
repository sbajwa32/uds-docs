#!/usr/bin/env bash
# extract-examples.sh <component-id>
# Splits the Examples-tab block from index.html into per-variant HTML files
# under uds-docs/uds/components/<id>/examples/, plus a manifest.json.
# MIGRATION ONLY — used by migrate-component.sh.
set -euo pipefail
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <component-id> [--dry-run]" >&2
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/extract_examples.py" "$@"
