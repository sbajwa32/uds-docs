#!/usr/bin/env bash
# release.sh — Snapshot the current UDS as a versioned archive and bump to a new UDS version
#
# Usage: ./release.sh [NEW_VERSION]
#   e.g. ./release.sh 0.4
#
# Phase 9 model: snapshots archive ONLY uds/ (not the whole docs site).
# The modern docs UI renders any version's UDS data through the udsPath()
# helper, so docs improvements automatically benefit historical views
# without per-snapshot re-rendering.
#
# Per the locked policy, UDS history (per-component changelogs) is preserved
# forever. This script never touches changelog data — pruning a snapshot
# (via scripts/prune-version.sh) only frees disk; the entries stay.
#
# Steps:
#   1. Read current UDS version from uds/version.json
#   2. Copy uds/ -> versions/<current>/uds/ as a frozen UDS-only snapshot
#   3. Bump uds/version.json to NEW_VERSION
#   4. Update versions.json to include the archived version
#   5. Re-aggregate uds/CHANGELOG.json from per-component changelogs (so the
#      release captures any changelog edits that happened before the bump)
#
# Pre-migration this script also called bump-site.sh to reset the SITE
# build counter. That apparatus (version.txt, bump-site.sh, ?v=N
# cache-bust query params, runtime auto-reload polling) was removed in
# Chunk 17 of the docs Next.js migration. Cache invalidation is now
# Cloudflare's job (see uds-docs/public/_headers) and Next.js handles
# content-hashed static assets automatically.

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$DIR/.." && pwd)"
VERSION_JSON="$DIR/uds/version.json"
VERSIONS_JSON="$DIR/versions.json"

if [[ ! -f "$VERSION_JSON" ]]; then
  echo "Error: $VERSION_JSON not found" >&2
  exit 1
fi

CURRENT_VERSION=$(python3 -c "import json; print(json.load(open('$VERSION_JSON'))['version'])")

if [[ -z "$CURRENT_VERSION" ]]; then
  echo "Error: Could not read version from $VERSION_JSON" >&2
  exit 1
fi

echo "Current UDS version: $CURRENT_VERSION"

if [[ $# -ge 1 ]]; then
  NEW_VERSION="$1"
else
  read -rp "New version number (e.g. 0.4): " NEW_VERSION
fi

if [[ -z "$NEW_VERSION" ]]; then
  echo "Error: No version provided" >&2
  exit 1
fi

if [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
  echo "Error: New version ($NEW_VERSION) is the same as current ($CURRENT_VERSION)" >&2
  exit 1
fi

SNAPSHOT_DIR="$DIR/versions/$CURRENT_VERSION/uds"

if [[ -d "$SNAPSHOT_DIR" ]]; then
  echo "Warning: $SNAPSHOT_DIR already exists. Overwriting..."
  rm -rf "$SNAPSHOT_DIR"
fi

echo ""
echo "Aggregating per-component changelogs into uds/CHANGELOG.json ..."
bash "$REPO_ROOT/scripts/aggregate-changelog.sh"

echo ""
echo "Archiving uds/ -> versions/$CURRENT_VERSION/uds/ ..."
mkdir -p "$(dirname "$SNAPSHOT_DIR")"
cp -R "$DIR/uds" "$SNAPSHOT_DIR"
echo "  Snapshot created: versions/$CURRENT_VERSION/uds/"

echo ""
echo "Bumping uds/version.json: $CURRENT_VERSION -> $NEW_VERSION ..."
python3 -c "
import json
data = json.load(open('$VERSION_JSON'))
data['version'] = '$NEW_VERSION'
import datetime; data['released'] = datetime.date.today().isoformat()
json.dump(data, open('$VERSION_JSON', 'w'), indent=2)
open('$VERSION_JSON', 'a').write('\\n')
print('  Updated uds/version.json')
"

echo ""
echo "Updating versions.json ..."
python3 -c "
import json, os
path = '$VERSIONS_JSON'
manifest = json.load(open(path)) if os.path.exists(path) else {'latest': None, 'versions': []}
versions = manifest.get('versions', [])
# Ensure CURRENT_VERSION is in the list (it just got archived)
if '$CURRENT_VERSION' not in versions:
    versions.insert(0, '$CURRENT_VERSION')
# Add NEW_VERSION as latest if not present
if '$NEW_VERSION' not in versions:
    versions.insert(0, '$NEW_VERSION')
manifest['latest'] = '$NEW_VERSION'
manifest['versions'] = versions
with open(path, 'w') as f:
    json.dump(manifest, f)
print('  Written: latest=$NEW_VERSION, versions=' + str(versions))
"

echo ""
echo "========================================"
echo "  Release complete!"
echo "  Archived: UDS $CURRENT_VERSION -> versions/$CURRENT_VERSION/uds/"
echo "  Current:  UDS $NEW_VERSION (live in uds/)"
echo "========================================"
echo ""
echo "Reminders:"
echo "  - Update per-component changelog.json files for any UDS $NEW_VERSION changes"
echo "  - Re-run scripts/aggregate-changelog.sh after editing changelogs"
echo "  - Run audit scripts to verify component completeness"
echo "  - To prune old archives later: scripts/prune-version.sh <version>"
echo "    (history is preserved per the locked policy — only disk space is freed)"
