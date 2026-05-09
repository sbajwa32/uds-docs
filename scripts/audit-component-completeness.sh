#!/usr/bin/env bash
# audit-component-completeness.sh [<component-id>]
# Verifies every uds-docs/uds/components/<id>/ folder has the required files.
# Replaces the original audit-demo-builder.sh (kept for back-compat in
# uds-docs/scripts/ until Phase 11).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/audit_component_completeness.py" "$@"
