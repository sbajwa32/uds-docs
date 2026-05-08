#!/usr/bin/env bash
# audit-demo-builder.sh
# ----------------------------------------------------------------------------
# Polices that uds-docs/demo-builder.js stays in sync with the rest of the
# doc site:
#   1. Every non-placeholder, non-deprecated component in COMPONENT_STATUS
#      MUST appear in the DEMO_COMPONENTS picker AND have a DEMO_TEMPLATES
#      entry. Placeholder components (Combobox, Date Picker, Data View, etc.)
#      are intentionally excluded — they don't have inspectable Figma
#      component sets yet, so generating demo HTML would be guessing.
#   2. Every udc-* class name used in demo-builder.js must be defined in at
#      least one uds-docs/uds/components/*.css file.
#
# Exits non-zero on drift. Run before any UDS release sync, and as part of the
# `uds-updated` skill.
# ----------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

python3 - <<'PY'
import re, sys
from pathlib import Path

errors = []
warnings = []

# --- 1. COMPONENT_STATUS vs Demo Builder picker/templates ---------------------
import json

app = Path('app.js').read_text()
m = re.search(r'var COMPONENT_STATUS = \{(.*?)\n  \};', app, re.S)
if not m:
    errors.append('Could not find COMPONENT_STATUS in app.js')
    sys.exit(1)
status_block = m.group(1)
component_status = {}
for line in status_block.splitlines():
    mm = re.match(r"\s*'?([\w-]+)'?\s*:\s*\{\s*status:\s*'([^']+)'", line)
    if mm:
        component_status[mm.group(1)] = mm.group(2)

# A component is "implementable" iff its content/<id>.json knownIssues does
# NOT contain the "no inspectable component set" marker. Figma stoplight
# status is independent — text-area and toggle are marked ⚫ in Figma but
# DO have component sets, so they're implementable.
NO_SET_MARKER = 'no inspectable component set yet'
implementable = []
non_implementable = []
for cid, st in component_status.items():
    if st == 'deprecated':
        continue
    spec = Path(f'content/{cid}.json')
    if not spec.exists():
        # Components without a spec file (none today) are not Demo Builder candidates
        continue
    data = json.loads(spec.read_text())
    issues = data.get('knownIssues') or []
    if any(NO_SET_MARKER in (i or '') for i in issues):
        non_implementable.append(cid)
    else:
        implementable.append(cid)
required_in_demo = sorted(implementable)

demo = Path('demo-builder.js').read_text()
demo_picker = set(re.findall(r"\{\s*id:\s*'([\w-]+)'", demo))
template_keys = set(re.findall(r"'([\w-]+)':\s*function\s*\(\)\s*\{", demo))

for cid in required_in_demo:
    if cid not in demo_picker:
        errors.append(f"Component '{cid}' (status={component_status[cid]}) is missing from DEMO_COMPONENTS picker in demo-builder.js")
    if cid not in template_keys:
        errors.append(f"Component '{cid}' (status={component_status[cid]}) is missing from DEMO_TEMPLATES in demo-builder.js")

for cid in demo_picker:
    if cid not in component_status:
        errors.append(f"Demo Builder picker contains '{cid}' which is not in COMPONENT_STATUS")
    elif cid in non_implementable:
        errors.append(f"Demo Builder picker contains '{cid}' which has a 'no inspectable component set yet' knownIssue (should be excluded until Figma exposes the component set)")

# --- 2. udc-* class names used vs defined -----------------------------------
udc_classes_in_demo = set(re.findall(r'udc-[\w-]+', demo))

defined_classes = set()
for f in Path('uds/components').glob('*.css'):
    s = f.read_text()
    defined_classes.update(re.findall(r'\.(udc-[\w-]+)', s))

orphans = sorted(udc_classes_in_demo - defined_classes)
for c in orphans:
    errors.append(f"Demo Builder uses class '.{c}' which is not defined in any uds/components/*.css file")

# --- Report ----------------------------------------------------------------
if errors:
    print('FAIL — Demo Builder drift detected:')
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print(f"OK — Demo Builder is in sync.")
    print(f"  {len(required_in_demo)} implementation-ready components covered (picker + templates)")
    print(f"  {len(udc_classes_in_demo)} udc-* class names used, all defined in component CSS")
PY
