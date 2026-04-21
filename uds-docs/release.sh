#!/usr/bin/env bash
# release.sh — Snapshot current site as a versioned archive and bump to a new UDS version
#
# Usage: ./release.sh [NEW_VERSION]
#   e.g. ./release.sh 0.2
#
# What it does:
#   1. Reads current UDS version from app.js
#   2. Copies the site into versions/<current>/ as a frozen snapshot
#   3. Bumps UDS_VERSION in app.js to the new version
#   4. Updates versions.json to include the archived version
#   5. Resets the SITE build counter via bump.sh

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
APP_JS="$DIR/app.js"
INDEX_HTML="$DIR/index.html"
VERSIONS_JSON="$DIR/versions.json"

if [[ ! -f "$APP_JS" ]]; then
  echo "Error: $APP_JS not found" >&2
  exit 1
fi

CURRENT_VERSION=$(sed -n "s/.*var UDS_VERSION = '\([^']*\)'.*/\1/p" "$APP_JS" | head -1)

if [[ -z "$CURRENT_VERSION" ]]; then
  echo "Error: Could not read UDS_VERSION from $APP_JS" >&2
  exit 1
fi

echo "Current UDS version: $CURRENT_VERSION"

if [[ $# -ge 1 ]]; then
  NEW_VERSION="$1"
else
  read -rp "New version number (e.g. 0.2): " NEW_VERSION
fi

if [[ -z "$NEW_VERSION" ]]; then
  echo "Error: No version provided" >&2
  exit 1
fi

if [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
  echo "Error: New version ($NEW_VERSION) is the same as current ($CURRENT_VERSION)" >&2
  exit 1
fi

SNAPSHOT_DIR="$DIR/versions/$CURRENT_VERSION"

if [[ -d "$SNAPSHOT_DIR" ]]; then
  echo "Warning: $SNAPSHOT_DIR already exists. Overwriting..."
  rm -rf "$SNAPSHOT_DIR"
fi

echo ""
echo "Archiving v$CURRENT_VERSION to versions/$CURRENT_VERSION/ ..."
mkdir -p "$SNAPSHOT_DIR"

shopt -s dotglob
for item in "$DIR"/*; do
  base=$(basename "$item")
  [[ "$base" == "versions" ]] && continue
  [[ "$base" == "versions.json" ]] && continue
  [[ "$base" == "release.sh" ]] && continue
  [[ "$base" == "bump.sh" ]] && continue
  [[ "$base" == ".git" ]] && continue
  cp -R "$item" "$SNAPSHOT_DIR/"
done
shopt -u dotglob

echo "  Snapshot created: versions/$CURRENT_VERSION/"

echo ""
echo "Bumping UDS version: $CURRENT_VERSION -> $NEW_VERSION ..."
sed -i '' "s/var UDS_VERSION = '$CURRENT_VERSION'/var UDS_VERSION = '$NEW_VERSION'/" "$APP_JS"
echo "  Updated app.js"

echo ""
echo "Updating versions.json ..."
# Build the versions array: newest first (NEW_VERSION, then all archived)
ARCHIVED_VERSIONS=""
if [[ -f "$VERSIONS_JSON" ]]; then
  ARCHIVED_VERSIONS=$(python3 -c "
import json, sys
with open('$VERSIONS_JSON') as f:
    data = json.load(f)
versions = data.get('versions', data) if isinstance(data, dict) else data
# Add current version if not already listed
if '$CURRENT_VERSION' not in versions:
    versions.insert(0, '$CURRENT_VERSION')
# Remove new version if present (it will be latest)
versions = [v for v in versions if v != '$NEW_VERSION']
print(json.dumps(versions))
" 2>/dev/null || echo "[\"$CURRENT_VERSION\"]")
else
  ARCHIVED_VERSIONS="[\"$CURRENT_VERSION\"]"
fi
# Write new format: latest + all versions (newest first)
python3 -c "
import json
archived = json.loads('$ARCHIVED_VERSIONS')
all_versions = ['$NEW_VERSION'] + [v for v in archived if v != '$NEW_VERSION']
json.dump({'latest': '$NEW_VERSION', 'versions': all_versions}, open('$VERSIONS_JSON', 'w'))
print('  Written: latest=$NEW_VERSION, versions=' + str(all_versions))
"

echo ""
echo "Resetting SITE build counter ..."
if [[ -f "$DIR/bump.sh" ]]; then
  bash "$DIR/bump.sh"
else
  echo "  Warning: bump.sh not found, skipping SITE counter reset"
fi

echo ""
echo "========================================"
echo "  Release complete!"
echo "  Archived: v$CURRENT_VERSION -> versions/$CURRENT_VERSION/"
echo "  Current:  v$NEW_VERSION (root site)"
echo "========================================"
echo ""
echo "Reminders:"
echo "  1. If token values changed, re-export ZIPs from Figma and regenerate CSS"
echo "  2. Update the CHANGELOG object in app.js with release notes for v$NEW_VERSION"
echo "  3. Update COMPONENT_STATUS in app.js if any statuses changed"
echo "  4. Run bump.sh after any further changes"
