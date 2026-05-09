#!/usr/bin/env bash
# diff-screenshots.sh <baseline-dir> <current-dir>
# Compares two screenshot directories side-by-side.
# - Lists pages present in only one directory.
# - For pages present in both, computes pixel-byte hash equality.
# - Prints a summary table of identical / changed / missing / new pages.
set -euo pipefail
BASELINE="${1:?Usage: $0 <baseline-dir> <current-dir>}"
CURRENT="${2:?Usage: $0 <baseline-dir> <current-dir>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/diff_screenshots.py" "$BASELINE" "$CURRENT"
