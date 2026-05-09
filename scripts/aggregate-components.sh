#!/usr/bin/env bash
# Aggregate uds/components/*/ into uds/components.json — the single source of
# truth for which components exist. Run after migrating, adding, or removing
# components. release.sh runs this automatically before each UDS snapshot.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$HERE/lib/aggregate_components.py" "$@"
