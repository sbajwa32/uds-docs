#!/usr/bin/env bash
# audit-agent-docs-currency.sh
#
# Cross-checks the agent-toolchain documentation page
# (uds-docs/app/(site)/cursor-workflows/CursorWorkflowsClient.tsx, post-
# migration; was uds-docs/docs/pages/cursor-workflows.html pre-migration)
# against the actual file list under .cursor/rules/, .cursor/skills/, and
# .cursor/agents/.
#
# Fails when:
#   - a rule / skill / subagent file exists but is not referenced on the
#     docs page (added a new artifact, forgot to document it), OR
#   - the docs page references a rule / skill / subagent that does not
#     exist on disk (deleted/renamed, but stale reference still on the page).
#
# Reference detection is permissive: any occurrence of the file's basename
# (without extension, or with the explicit path) on the docs page counts as
# documented. The page should mention every rule's `.mdc` filename, every
# skill's directory name, and every subagent's `.md` filename — the new
# CursorWorkflowsClient.tsx does so via the github-blob links it emits.
#
# Grandfathering: pre-baseline state is grandfathered via the
# scripts/audit-baseline.json audit-agent-docs-currency.baseline SHA, mirroring
# audit-changelog-currency. The tolerated-files array carves out individual
# rules / skills / agents that intentionally don't appear on the docs page
# (e.g. internal-only ones).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

DOCS_PAGE="uds-docs/app/(site)/cursor-workflows/CursorWorkflowsClient.tsx"
BASELINE_CONFIG="scripts/audit-baseline.json"

if [ ! -f "$DOCS_PAGE" ]; then
  echo "FAIL — docs page $DOCS_PAGE does not exist" >&2
  exit 1
fi

python3 - <<'PYEOF'
import json
import re
import subprocess
import sys
from pathlib import Path

DOCS_PAGE = Path('uds-docs/app/(site)/cursor-workflows/CursorWorkflowsClient.tsx')
BASELINE_CONFIG = Path('scripts/audit-baseline.json')

# Load baseline + tolerated-files config.
TOLERATED = set()
BASELINE_SHA = None
if BASELINE_CONFIG.exists():
    try:
        cfg = json.load(open(BASELINE_CONFIG))
        block = cfg.get('audit-agent-docs-currency', {})
        BASELINE_SHA = block.get('baseline')
        TOLERATED = set(block.get('toleratedFiles', []))
    except Exception as e:
        print(f'NOTE: could not parse {BASELINE_CONFIG}: {e}')

# Verify baseline reachable; fall back to merge-base if needed.
def resolve_baseline(sha):
    if not sha:
        return None
    res = subprocess.run(['git', 'rev-parse', '--verify', '--quiet', f'{sha}^{{commit}}'],
                          capture_output=True, text=True)
    if res.returncode == 0:
        return sha
    # Fallback: merge-base with origin/main
    res = subprocess.run(['git', 'merge-base', 'HEAD', 'origin/main'],
                          capture_output=True, text=True)
    if res.returncode == 0 and res.stdout.strip():
        return res.stdout.strip()
    return None

BASELINE_SHA = resolve_baseline(BASELINE_SHA)

# Enumerate what should be documented.
rules = sorted([p.stem for p in Path('.cursor/rules').glob('*.mdc')])
skills = sorted([p.parent.name for p in Path('.cursor/skills').glob('*/SKILL.md')])
agents = sorted([p.stem for p in Path('.cursor/agents').glob('*.md')])

# Read docs page once.
docs_text = DOCS_PAGE.read_text()

# For each artifact, check it appears on the docs page (by basename or path).
def is_documented(kind, name):
    """Is this artifact mentioned on the docs page?"""
    # Try the github blob path first (most authoritative form on this page).
    if kind == 'rule':
        if f'.cursor/rules/{name}.mdc' in docs_text:
            return True
        # Fallback: bare name in <code>...</code>
        if f'<code>{name}</code>' in docs_text:
            return True
    elif kind == 'skill':
        if f'.cursor/skills/{name}/SKILL.md' in docs_text:
            return True
        if f'<code>{name}</code>' in docs_text:
            return True
    elif kind == 'agent':
        if f'.cursor/agents/{name}.md' in docs_text:
            return True
        if f'<code>{name}</code>' in docs_text:
            return True
    return False

missing_from_docs = []  # exists in repo, not on docs page
for r in rules:
    if r in TOLERATED:
        continue
    if not is_documented('rule', r):
        missing_from_docs.append(('rule', r))
for s in skills:
    if s in TOLERATED:
        continue
    if not is_documented('skill', s):
        missing_from_docs.append(('skill', s))
for a in agents:
    if a in TOLERATED:
        continue
    if not is_documented('agent', a):
        missing_from_docs.append(('agent', a))

# Reverse direction: docs page references files that don't exist on disk.
# Extract all .cursor/{rules|skills|agents}/... mentions from the docs page.
# Only match real filename characters (a-z, 0-9, -, _, ., /) so that
# placeholder text like `.cursor/agents/<name>.md` or `.cursor/rules/*.mdc`
# (rendered as &lt;name&gt; / * in HTML) does NOT match.
ref_re = re.compile(r'\.cursor/(rules|skills|agents)/([a-z0-9][a-z0-9_\-./]*?\.(?:mdc|md))(?=["\'<>\s])', re.IGNORECASE)
referenced = set()
for m in ref_re.finditer(docs_text):
    kind, rest = m.group(1), m.group(2)
    if kind == 'rules' and rest.endswith('.mdc'):
        referenced.add(('rule', rest[:-4]))
    elif kind == 'skills' and rest.endswith('/SKILL.md'):
        referenced.add(('skill', rest[:-len('/SKILL.md')]))
    elif kind == 'agents' and rest.endswith('.md') and '/' not in rest:
        referenced.add(('agent', rest[:-3]))

exists_on_disk = (
    {('rule', r) for r in rules}
    | {('skill', s) for s in skills}
    | {('agent', a) for a in agents}
)
stale_refs = sorted(referenced - exists_on_disk)

# If there's nothing pre-baseline to consider, both checks above are the
# whole story. If we have a baseline SHA, we also tolerate pre-baseline drift
# (i.e., artifacts that already existed and were already undocumented at
# baseline). Implementation: for any "missing from docs" finding, check
# whether the artifact already existed at the baseline commit; if so, it
# was pre-existing and should have been added to toleratedFiles. We still
# report it (helps future cleanup) but as a WARNING, not a failure.
warnings = []
failures = []

if BASELINE_SHA:
    for kind, name in missing_from_docs:
        if kind == 'rule':
            path = f'.cursor/rules/{name}.mdc'
        elif kind == 'skill':
            path = f'.cursor/skills/{name}/SKILL.md'
        else:
            path = f'.cursor/agents/{name}.md'
        # Did this path exist at the baseline?
        res = subprocess.run(['git', 'cat-file', '-e', f'{BASELINE_SHA}:{path}'],
                              capture_output=True)
        if res.returncode == 0:
            warnings.append((kind, name, path))
        else:
            failures.append((kind, name, path))
else:
    # No baseline: every missing is a failure.
    for kind, name in missing_from_docs:
        if kind == 'rule':
            path = f'.cursor/rules/{name}.mdc'
        elif kind == 'skill':
            path = f'.cursor/skills/{name}/SKILL.md'
        else:
            path = f'.cursor/agents/{name}.md'
        failures.append((kind, name, path))

# Stale references are always failures (a reference to a missing file is
# always a bug, regardless of baseline).
if failures or stale_refs:
    print('FAIL — agent toolchain docs are out of sync with .cursor/ files:')
    if failures:
        print('  Missing from docs page (added after baseline):')
        for kind, name, path in failures:
            print(f'    - {kind}: {path}')
    if stale_refs:
        print('  Stale references on docs page (point at deleted files):')
        for kind, name in stale_refs:
            print(f'    - {kind}: {name}')
    print('')
    print(f'Fix: edit {DOCS_PAGE} to add/remove the affected rule/skill/agent rows.')
    print('If the artifact is intentionally internal-only, add its basename to')
    print('scripts/audit-baseline.json audit-agent-docs-currency.toleratedFiles.')
    sys.exit(1)

# Summary.
total = len(rules) + len(skills) + len(agents)
documented = total - len(missing_from_docs) - len(TOLERATED)
print(f'OK — {documented}/{total} agent toolchain artifacts documented on {DOCS_PAGE}')
if warnings:
    print(f'(Pre-baseline drift, not blocking: {len(warnings)} artifact(s))')
    for kind, name, _ in warnings:
        print(f'    - {kind}: {name}')
if TOLERATED:
    print(f'(Tolerated via audit-baseline.json toleratedFiles: {len(TOLERATED)})')
PYEOF
