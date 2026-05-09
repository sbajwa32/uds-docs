#!/usr/bin/env bash
# baseline-screenshot.sh [output-dir]
# Captures full-page screenshots of every page on the docs site at known
# viewport sizes. Writes to /tmp/uds-screenshots/<output-dir>/ by default.
# Used to capture the pre-migration baseline (Phase 0) and the post-migration
# state (Phase 12).
set -euo pipefail
OUT_DIR="${1:-/tmp/uds-screenshots/current}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$SCRIPT_DIR/lib/baseline_screenshot.js" "$OUT_DIR"
