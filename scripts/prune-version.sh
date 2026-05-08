#!/usr/bin/env bash
# prune-version.sh <version>
# Forward-looking pruning support: deletes the snapshot folder
# uds-docs/versions/<version>/ to save disk, and updates
# uds-docs/versions.json to drop that entry.
#
# IMPORTANT: per the locked policy, UDS history is preserved forever.
# This script does NOT touch any per-component changelog.json files.
# The Changelog page will still show entries for the pruned version;
# users just won't be able to navigate to the frozen snapshot of its specs.
#
# Refuses to prune the current live version (the one in uds/version.json).
# Logs the action to uds-docs/versions/PRUNED.md as an audit trail.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/prune_version.py" "$@"
