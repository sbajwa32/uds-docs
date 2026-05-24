#!/usr/bin/env bash
# audit-css-api-table.sh
#
# For each component, regex-extract udc-* selectors defined in
# uds-docs/uds/components/<id>/<id>.css and compare them to the udc-*
# codes listed in uds-docs/data/component-api/<id>.ts (the typed data
# files that drive the Code tab in the Next.js app).
#
# Pre-migration: the source of truth lived inline in
# uds-docs/index.html as <table class="sg-api-table"> blocks. Chunk 07
# of the Next.js migration extracted that content into typed
# data/component-api/<id>.ts files; Chunk 15 (this file's last update)
# repointed the audit at those files so the audit keeps working after
# Chunk 17 deletes index.html.
#
# Fails on either-direction drift:
#   - selector defined in CSS but absent from the API data, OR
#   - code listed in the API data but not defined as a CSS selector
#     (within reasonable tolerance for variant attributes like
#     [data-something="x"]).
#
# Catches the failure mode where a component CSS class is added/renamed/removed
# but the hand-maintained API table is not updated.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

python3 - <<'PYEOF'
import json
import re
import sys
from pathlib import Path

COMPONENTS_DIR = Path('uds-docs/uds/components')
API_DIR = Path('uds-docs/data/component-api')
BASELINE_CONFIG = Path('scripts/audit-baseline.json')

TOLERATED = set()
if BASELINE_CONFIG.exists():
    try:
        cfg = json.load(open(BASELINE_CONFIG))
        TOLERATED = set(cfg.get('audit-css-api-table', {}).get('toleratedComponents', []))
    except Exception:
        TOLERATED = set()

if not API_DIR.exists():
    print(f'FAIL — missing {API_DIR}', file=sys.stderr)
    sys.exit(1)


def belongs_to(selector, comp_id):
    """Whether a `.udc-<x>` selector belongs to component comp_id."""
    s = selector.lstrip('.')
    if not s.startswith('udc-'):
        return False
    name = s[4:]
    prefixes = {comp_id}
    if comp_id.startswith('nav-'):
        prefixes.add('nav-')
    for p in prefixes:
        if name == p:
            return True
        if name.startswith(p + '__') or name.startswith(p + '--') or name.startswith(p + '-'):
            return True
    return False


def extract_css_selectors(css_path, comp_id):
    """Extract `.udc-*` selectors belonging to the component, from its CSS file."""
    text = css_path.read_text()
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    found = set()
    for m in re.finditer(r'\.udc-[a-zA-Z0-9_-]+(?:\[[^\]]+\])?', text):
        sel = m.group(0)
        if belongs_to(sel.split('[', 1)[0].split(':', 1)[0], comp_id):
            found.add(sel)
    return found


_CSS_CLASSES_BLOCK_RE = re.compile(
    r'cssClasses\s*:\s*\[(.*?)\]',
    re.DOTALL,
)
_NAME_FIELD_RE = re.compile(r'name\s*:\s*["\'`]([^"\'`]+)["\'`]')


def extract_api_selectors(api_path, comp_id):
    """Extract `.udc-*` codes from the cssClasses array in a component-api TS file.

    Returns (selector_set, reason). reason is None on success, or:
    - 'no-file' if the TS file is missing
    - 'no-css-classes' if cssClasses is empty or omitted (raw-HTML fallback
      components like link)
    """
    if not api_path.exists():
        return None, 'no-file'
    text = api_path.read_text()
    m = _CSS_CLASSES_BLOCK_RE.search(text)
    if not m:
        return set(), 'no-css-classes'
    block = m.group(1).strip()
    if not block:
        return set(), 'no-css-classes'
    found = set()
    for nm in _NAME_FIELD_RE.finditer(block):
        code = nm.group(1).strip()
        if code.startswith('.udc-') or code.startswith('udc-'):
            found.add('.' + code.lstrip('.'))
    return found, None


failures = []
ok_count = 0
no_table = []
tolerated_drift = []

for comp_dir in sorted(COMPONENTS_DIR.iterdir()):
    if not comp_dir.is_dir():
        continue
    comp_id = comp_dir.name
    css_path = comp_dir / f'{comp_id}.css'
    if not css_path.exists():
        continue
    api_path = API_DIR / f'{comp_id}.ts'
    css_selectors = extract_css_selectors(css_path, comp_id)
    api_selectors, reason = extract_api_selectors(api_path, comp_id)
    if reason == 'no-file':
        failures.append(f'  {comp_id}: missing {api_path}')
        continue
    if reason == 'no-css-classes':
        no_table.append(comp_id)
        continue

    def bare(s):
        return s.split('[', 1)[0].split(':', 1)[0]

    css_bare = {bare(s) for s in css_selectors}
    api_bare = {bare(s) for s in api_selectors}

    missing_from_api = css_bare - api_bare
    missing_from_css = api_bare - css_bare

    def is_public(sel):
        s = sel.lstrip('.')
        if s.endswith('__internal') or s.endswith('__hidden'):
            return False
        return True

    real_missing_from_api = {s for s in missing_from_api if is_public(s)}

    if real_missing_from_api or missing_from_css:
        if comp_id in TOLERATED:
            tolerated_drift.append(comp_id)
            continue
        lines = [f'  {comp_id}:']
        if real_missing_from_api:
            for sel in sorted(real_missing_from_api):
                lines.append(f'    - in CSS but missing from data/component-api/{comp_id}.ts cssClasses: {sel}')
        if missing_from_css:
            for sel in sorted(missing_from_css):
                lines.append(f'    - in data/component-api/{comp_id}.ts cssClasses but not in {comp_id}.css: {sel}')
        failures.extend(lines)
    else:
        ok_count += 1

if failures:
    print('FAIL — Code-tab API data is out of sync with udc-* selectors in component CSS:')
    for line in failures:
        print(line)
    print('')
    print('Fix: update the `cssClasses` array in uds-docs/data/component-api/<id>.ts')
    print('to match the CSS selectors actually defined in uds-docs/uds/components/<id>/<id>.css.')
    print('')
    print('If the drift is legitimate (e.g. cross-component class reuse like nav-header')
    print('listing .udc-nav-button defined in nav-vertical.css), add the component id to')
    print('scripts/audit-baseline.json audit-css-api-table.toleratedComponents — but only')
    print('after explicit user direction.')
    sys.exit(1)

print(f'OK — {ok_count} component(s) have a Code-tab API table consistent with their CSS')
if no_table:
    print(f'(Skipped {len(no_table)} component(s) with no cssClasses in their API data: {", ".join(no_table)})')
if tolerated_drift:
    print(f'(Tolerated drift on {len(tolerated_drift)} component(s) per audit-baseline.json: {", ".join(tolerated_drift)})')
PYEOF
