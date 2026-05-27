#!/usr/bin/env bash
# audit-component-completeness.sh [<component-id>]
# Verifies every uds-docs/uds/components/<id>/ folder has the required files.
# Replaces the deleted legacy audit-demo-builder.sh.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/audit_component_completeness.py" "$@"
