#!/usr/bin/env bash
# migrate-component.sh <component-id> [--dry-run]
# Moves one component from the legacy layout to uds-docs/uds/components/<id>/.
# Idempotent — running on an already-migrated component is a no-op except for
# regenerating uds.css/uds.js (which auto-walk the new components dir).
# MIGRATION ONLY. Phase 6 of the UDS repo restructure.
set -euo pipefail
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <component-id> [--dry-run]" >&2
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/migrate_component.py" "$@"
