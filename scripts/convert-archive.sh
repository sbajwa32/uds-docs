#!/usr/bin/env bash
# One-time conversion of a legacy versions/<X>/ frozen full-site archive into
# the new UDS-only per-component shape. Reads the frozen content/<id>.json
# spec files + app.js (COMPONENT_STATUS, CHANGELOG, FIGMA_LINKS) and writes
# uds/components/<id>/{spec,status,changelog}.json plus uds/components.json,
# version.json, and CHANGELOG.json. Then deletes the frozen full-site files
# (index.html, app.js, demo-builder.js, content/, etc.) — only versions/<X>/uds/
# survives.
#
# Usage: bash scripts/convert-archive.sh <version> [--dry-run]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$HERE/lib/convert_archive.py" "$@"
