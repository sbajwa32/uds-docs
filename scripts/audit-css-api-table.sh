#!/usr/bin/env bash
# audit-css-api-table.sh
#
# For each component, regex-extract udc-* selectors defined in
# uds-docs/uds/components/<id>/<id>.css and compare to the udc-* codes listed
# in the hardcoded Code-tab <table class="sg-api-table"> block inside
# <div data-page="<id>"> ... <div data-tab-panel="code"> in
# uds-docs/index.html.
#
# Fails on either-direction drift:
#   - selector defined in CSS but absent from the Code-tab table, OR
#   - code listed in the Code-tab table but not defined as a CSS selector
#     (within reasonable tolerance for variant attributes like
#     [data-something="x"]).
#
# Catches the failure mode where a component CSS class is added/renamed/removed
# but the hand-maintained Code-tab API table in index.html is not updated.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

python3 - <<'PYEOF'
import json
import re
import sys
from pathlib import Path

COMPONENTS_DIR = Path('uds-docs/uds/components')
INDEX_HTML = Path('uds-docs/index.html')
BASELINE_CONFIG = Path('.cursor/audit-baseline.json')

# Components whose drift is grandfathered. Empty if no baseline file present.
TOLERATED = set()
if BASELINE_CONFIG.exists():
    try:
        cfg = json.load(open(BASELINE_CONFIG))
        TOLERATED = set(cfg.get('audit-css-api-table', {}).get('toleratedComponents', []))
    except Exception:
        TOLERATED = set()

if not INDEX_HTML.exists():
    print('FAIL — missing uds-docs/index.html', file=sys.stderr)
    sys.exit(1)

html_text = INDEX_HTML.read_text()

# Selectors that are component-page-internal noise we don't want to flag.
# These are real CSS but they don't need to be in every component's API table:
#   - .udc-button-ghost (used inside nav-header examples without being the
#     component's own selector)
#   - .udc-icon-wrapper (cross-component)
#   - .udc-divider-horizontal (cross-component)
# We'll only diff selectors that BELONG to the component (i.e. start with
# .udc-<id> or .udc-nav-<id-tail>).

def belongs_to(selector, comp_id):
    """Whether a `.udc-<x>` selector belongs to component comp_id.

    Match if selector starts with `.udc-<comp_id>` (with optional __element,
    -modifier, or `:`/`[` pseudo-or-attribute suffix). Also tolerate
    nav-header naming where some classes use `.udc-nav-bento*`/`.udc-nav-tile`
    etc. — that is, anything whose `.udc-<token>` matches the component or a
    short prefix of it.
    """
    # Strip leading `.`
    s = selector.lstrip('.')
    if not s.startswith('udc-'):
        return False
    name = s[4:]
    # Acceptable prefixes for this component
    prefixes = {comp_id}
    # nav-header has subparts like nav-bento, nav-bento-button, nav-bento-wrapper,
    # nav-logo, nav-search, nav-mywork, nav-account, nav-tile, nav-title-area,
    # nav-button. These all live in nav-header.css. Build the prefix set from
    # the comp_id's namespace family.
    if comp_id.startswith('nav-'):
        prefixes.add('nav-')
    # general fallback: prefix matches comp_id followed by __/-/end-of-string
    for p in prefixes:
        if name == p:
            return True
        if name.startswith(p + '__') or name.startswith(p + '--') or name.startswith(p + '-'):
            return True
    return False


def extract_css_selectors(css_path, comp_id):
    """Extract `.udc-*` selectors belonging to the component, from its CSS file."""
    text = css_path.read_text()
    # Strip comments
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    found = set()
    # Match `.udc-foo`, `.udc-foo__bar`, `.udc-foo[data-x="y"]`, `.udc-foo:hover`
    for m in re.finditer(r'\.udc-[a-zA-Z0-9_-]+(?:\[[^\]]+\])?', text):
        sel = m.group(0)
        # We want the bare class name for comparison; ignore pseudo-classes and
        # attribute selectors when checking "is this selector in the table".
        # But the table CAN include attribute-style entries like
        # `.udc-nav-title-area[data-title-only="true"]`; we'll diff the full
        # selector text first, falling back to the bare class.
        if belongs_to(sel.split('[', 1)[0].split(':', 1)[0], comp_id):
            found.add(sel)
    return found


def extract_table_selectors(html_text, comp_id):
    """Extract `.udc-*` (or `udc-*`) codes listed inside the Code-tab table
    of <div data-page="comp_id"> ... <table class="sg-api-table">."""
    # Find the data-page block.
    page_re = re.compile(
        r'<div data-page="' + re.escape(comp_id) + r'"[^>]*>(.*?)(?=<div data-page="[^"]+"|</main>|<!-- *FOUNDATIONS|<!-- *END)',
        re.DOTALL
    )
    m = page_re.search(html_text)
    if not m:
        return None, 'page block not found'
    page_block = m.group(1)
    # Within the page block, find the sg-api-table.
    table_re = re.compile(r'<table[^>]*class="[^"]*sg-api-table[^"]*"[^>]*>(.*?)</table>', re.DOTALL)
    t = table_re.search(page_block)
    if not t:
        return set(), 'no sg-api-table'
    table_block = t.group(1)
    # Extract <code>...</code> bodies.
    codes = re.findall(r'<code[^>]*>([^<]+)</code>', table_block)
    found = set()
    for code in codes:
        code = code.strip()
        if code.startswith('.udc-') or code.startswith('udc-'):
            normalized = '.' + code.lstrip('.')
            found.add(normalized)
    return found, None


# Iterate components.
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
    css_selectors = extract_css_selectors(css_path, comp_id)
    table_selectors, reason = extract_table_selectors(html_text, comp_id)
    if table_selectors is None:
        # No page block; skip silently.
        continue
    if reason == 'no sg-api-table':
        # Component page has no Code-tab API table at all (some pages don't).
        # Not a drift failure; just informational.
        no_table.append(comp_id)
        continue

    # Compute drift on the "bare class" form (strip attribute brackets and
    # pseudo-classes) so the diff is meaningful regardless of how the table
    # writes its codes.
    def bare(s):
        return s.split('[', 1)[0].split(':', 1)[0]

    css_bare = {bare(s) for s in css_selectors}
    table_bare = {bare(s) for s in table_selectors}

    missing_from_table = css_bare - table_bare
    missing_from_css = table_bare - css_bare

    # Some CSS selectors are intentionally NOT API surface (e.g. private
    # state hooks like `.udc-button__icon-wrapper-internal`). We approximate
    # public-API surface by including everything except classes ending in
    # `__internal`, `__hidden`, or those that look like state combinators.
    # If false positives appear, tighten this filter.
    def is_public(sel):
        s = sel.lstrip('.')
        if s.endswith('__internal') or s.endswith('__hidden'):
            return False
        return True

    real_missing_from_table = {s for s in missing_from_table if is_public(s)}

    if real_missing_from_table or missing_from_css:
        if comp_id in TOLERATED:
            tolerated_drift.append(comp_id)
            continue
        lines = [f'  {comp_id}:']
        if real_missing_from_table:
            for sel in sorted(real_missing_from_table):
                lines.append(f'    - in CSS but missing from index.html sg-api-table: {sel}')
        if missing_from_css:
            for sel in sorted(missing_from_css):
                lines.append(f'    - in index.html sg-api-table but not in {comp_id}.css: {sel}')
        failures.extend(lines)
    else:
        ok_count += 1

if failures:
    print('FAIL — Code-tab API table in index.html is out of sync with udc-* selectors in component CSS:')
    for line in failures:
        print(line)
    print('')
    print('Fix: update the <table class="sg-api-table"> block inside the affected')
    print('<div data-page="<id>"> in uds-docs/index.html to match the CSS selectors')
    print('actually defined in uds-docs/uds/components/<id>/<id>.css.')
    print('')
    print('If the drift is legitimate (e.g. cross-component class reuse like nav-header')
    print('listing .udc-nav-button defined in nav-vertical.css), add the component id to')
    print('.cursor/audit-baseline.json audit-css-api-table.toleratedComponents — but only')
    print('after explicit user direction.')
    sys.exit(1)

print(f'OK — {ok_count} component(s) have a Code-tab API table consistent with their CSS')
if no_table:
    print(f'(Skipped {len(no_table)} component(s) with no Code-tab sg-api-table: {", ".join(no_table)})')
if tolerated_drift:
    print(f'(Tolerated drift on {len(tolerated_drift)} component(s) per audit-baseline.json: {", ".join(tolerated_drift)})')
PYEOF
