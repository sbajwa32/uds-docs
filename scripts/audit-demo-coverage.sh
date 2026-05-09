#!/usr/bin/env bash
# audit-demo-coverage.sh
# Verifies every implementable component has at least one demoSuitable example
# (manifest entry with demoWeight > 0). The Demo Builder picks weighted-randomly
# among these.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/audit_demo_coverage.py" "$@"
