#!/usr/bin/env bash
# audit-placeholders.sh [<component-id>]
# Walks every uds-docs/uds/components/*/examples/*.html (or just one component)
# and verifies every {{token}} appears in placeholder-vocabulary.json.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/audit_placeholders.py" "$@"
