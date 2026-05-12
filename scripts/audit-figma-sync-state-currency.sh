#!/usr/bin/env bash
# audit-figma-sync-state-currency.sh
#
# State-based check: for each component in uds-docs/uds/components.json,
# compare its spec.json figmaNodeId + figmaPageNodeId against the matching
# componentSetNodeId + pageNodeId in .cursor/figma/state/components.snapshot.json.
# Fails on mismatch.
#
# Directly detects the failure mode where spec.json was updated from a Figma
# read (e.g. via link-figma-nodes or sync-figma-component-spec) but the
# .cursor/figma/state snapshot wasn't updated. A stale snapshot makes
# subsequent uds-updated runs misclassify changes against the wrong baseline.
#
# Exemption: a spec field set while the snapshot field is null is treated as
# "newly populated, snapshot will be filled on the next inventory pass" and
# only emits a warning, not a failure. The reverse (snapshot set, spec null)
# IS a failure — that means a deep link was deleted from spec without
# matching the snapshot.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

SNAPSHOT=".cursor/figma/state/components.snapshot.json"
MANIFEST="uds-docs/uds/components.json"

if [ ! -f "$SNAPSHOT" ]; then
  echo "FAIL — missing $SNAPSHOT" >&2
  exit 1
fi
if [ ! -f "$MANIFEST" ]; then
  echo "FAIL — missing $MANIFEST" >&2
  exit 1
fi

python3 - <<'PYEOF'
import json
import sys
from pathlib import Path

snapshot = json.load(open('.cursor/figma/state/components.snapshot.json'))
manifest = json.load(open('uds-docs/uds/components.json'))

snap_by_id = {c['id']: c for c in snapshot.get('components', [])}

failures = []
warnings = []
ok_count = 0

# Iterate over manifest, since it's the source of truth for "what exists".
component_list = manifest.get('components', manifest) if isinstance(manifest, dict) else manifest
if isinstance(component_list, dict):
    component_list = list(component_list.values()) if 'id' in next(iter(component_list.values()), {}) else []

# Normalize: manifest entries look like { id, title, since } (or similar)
for entry in component_list:
    cid = entry.get('id')
    if not cid:
        continue
    spec_path = Path(f'uds-docs/uds/components/{cid}/spec.json')
    if not spec_path.exists():
        continue
    try:
        spec = json.load(open(spec_path))
    except Exception as e:
        failures.append(f'  {cid}: failed to parse spec.json ({e})')
        continue

    snap_entry = snap_by_id.get(cid, {})

    # spec.json field names: figmaNodeId / figmaPageNodeId.
    # snapshot field names: componentSetNodeId / pageNodeId.
    spec_node = spec.get('figmaNodeId')
    spec_page = spec.get('figmaPageNodeId')
    snap_node = snap_entry.get('componentSetNodeId')
    snap_page = snap_entry.get('pageNodeId')

    def normalize(v):
        # Figma node ids can be written as 'X:Y' or 'X-Y' (URL form). Normalize for comparison.
        if v is None:
            return None
        return str(v).replace('-', ':').strip() or None

    sn = normalize(spec_node)
    sp = normalize(spec_page)
    nn = normalize(snap_node)
    np_ = normalize(snap_page)

    # Component-set / variant deep link
    if sn is not None and nn is not None and sn != nn:
        failures.append(
            f'  {cid}: spec.figmaNodeId={spec_node!r} != snapshot.componentSetNodeId={snap_node!r}'
        )
    elif sn is not None and nn is None:
        warnings.append(
            f'  {cid}: spec.figmaNodeId={spec_node!r} but snapshot.componentSetNodeId is null (snapshot lags spec)'
        )
    elif sn is None and nn is not None:
        failures.append(
            f'  {cid}: spec.figmaNodeId is null but snapshot.componentSetNodeId={snap_node!r} (spec lost a link)'
        )

    # Page deep link
    if sp is not None and np_ is not None and sp != np_:
        failures.append(
            f'  {cid}: spec.figmaPageNodeId={spec_page!r} != snapshot.pageNodeId={snap_page!r}'
        )

    if not any(cid in f for f in failures):
        ok_count += 1

if failures:
    print('FAIL — spec.json vs .cursor/figma/state/components.snapshot.json mismatches:')
    for line in failures:
        print(line)
    if warnings:
        print('')
        print('Warnings (snapshot lags spec; will resolve on next inventory pass):')
        for line in warnings:
            print(line)
    print('')
    print('Fix:')
    print('  1. Run a fresh figma-inventory or figma-component-inspector against the affected component(s).')
    print('  2. Update .cursor/figma/state/components.snapshot.json with the captured node IDs and metadata.')
    print('  3. Bump .cursor/figma/state/last-sync.json lastSuccessfulSync and recompute components.snapshotChecksum.')
    sys.exit(1)

print(f'OK — {ok_count} component(s) match between spec.json and .cursor/figma/state/components.snapshot.json')
if warnings:
    print('Warnings (snapshot lags spec; will resolve on next inventory pass):')
    for line in warnings:
        print(line)
PYEOF
