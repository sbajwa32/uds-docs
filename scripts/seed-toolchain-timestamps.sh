#!/usr/bin/env bash
# scripts/seed-toolchain-timestamps.sh
#
# One-shot tool: sets `lastUpdated:` in every
# .cursor/{rules,skills,agents}/* file's YAML frontmatter to a single
# ISO 8601 UTC timestamp (the moment this script runs).
#
# Output format: YYYY-MM-DDTHH:MM:SSZ (e.g. 2026-05-12T18:39:50Z).
# This matches the precedent set by `.cursor/figma/state/last-sync.json`
# (`lastSuccessfulSync` field) and is the canonical timestamp shape for
# "when did this happen" across the repo.
#
# Use cases:
#   - Initial seeding of toolchain timestamps after introducing the
#     `lastUpdated:` convention.
#   - Deliberate "we just audited every rule/skill/subagent and they
#     are all current as of this moment" reset.
#
# This script does NOT regenerate `.cursor/TOOLCHAIN.md` — run
# `bash scripts/regenerate-toolchain.sh` after seeding so the index
# reflects the new timestamps.
#
# Files without YAML frontmatter are skipped with a warning so the
# caller can add frontmatter manually before re-running.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Seeding lastUpdated: $NOW into every .cursor/{rules,skills,agents}/* file..."
echo

python3 - "$NOW" <<'PYEOF'
import glob
import re
import sys
from typing import List

NOW = sys.argv[1]

targets: List[str] = (
    sorted(glob.glob('.cursor/rules/*.mdc'))
    + sorted(glob.glob('.cursor/skills/*/SKILL.md'))
    + sorted(glob.glob('.cursor/agents/*.md'))
)

updated = 0
inserted = 0
skipped: List[str] = []

for path in targets:
    with open(path) as f:
        text = f.read()
    lines = text.splitlines(keepends=False)
    if not lines or lines[0].strip() != '---':
        skipped.append(path)
        continue
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            end_idx = i
            break
    if end_idx is None:
        skipped.append(path)
        continue
    fm = lines[1:end_idx]
    new_field = f'lastUpdated: {NOW}'
    found = False
    for j in range(len(fm)):
        if re.match(r'^lastUpdated:\s*', fm[j]):
            lines[1 + j] = new_field
            updated += 1
            found = True
            break
    if not found:
        lines.insert(end_idx, new_field)
        inserted += 1
    trailing = '\n' if text.endswith('\n') else ''
    with open(path, 'w') as f:
        f.write('\n'.join(lines) + trailing)

print(f"Updated {updated} file(s) (existing lastUpdated replaced).")
print(f"Inserted {inserted} new lastUpdated line(s) (no prior field).")
if skipped:
    print(f"\nSkipped {len(skipped)} file(s) with no YAML frontmatter:")
    for p in skipped:
        print(f"  {p}")
    print("\nAdd frontmatter to those files and re-run if you want them seeded.")
PYEOF
