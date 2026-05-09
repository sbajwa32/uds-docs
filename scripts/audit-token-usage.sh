#!/usr/bin/env bash
# audit-token-usage.sh
# Scans every per-component CSS file for hardcoded color/spacing values that
# bypass UDS tokens. Catches drift away from the token-first principle.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/audit_token_usage.py" "$@"
