#!/usr/bin/env bash
# round-trip-check.sh [<component-id> | --all-components | --changelogs | --statuses]
# Verifies that data extracted into per-component files re-aggregates to the
# original data — proves nothing was lost during extraction.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/round_trip_check.py" "$@"
