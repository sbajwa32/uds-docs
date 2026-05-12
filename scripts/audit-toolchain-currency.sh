#!/usr/bin/env bash
# scripts/audit-toolchain-currency.sh
#
# Verifies the agent toolchain bookkeeping is current. Runs three
# bundled checks against every .cursor/{rules,skills,agents}/* file
# and the .cursor/TOOLCHAIN.md index:
#
#   CHECK 1 — frontmatter `lastUpdated:` is at least as recent as the
#             file's git mtime (catches "edited a file but forgot to
#             bump the date stamp"). Date-only comparison so sub-day
#             skew between the bump and the commit doesn't fire.
#
#   CHECK 2 — every rule/skill/subagent file has a row in
#             .cursor/TOOLCHAIN.md (catches "added a new file but
#             forgot the index").
#
#   CHECK 3 — the date in every TOOLCHAIN.md row matches the source
#             file's frontmatter `lastUpdated:` exactly (catches
#             "bumped the file but forgot to regenerate the index").
#
# Run locally: bash scripts/audit-toolchain-currency.sh
# Wired into  .github/workflows/audits.yml (see "Toolchain currency").
#
# Exit codes:
#   0 — all checks pass
#   1 — at least one check failed; details printed to stderr
#
# Failure messages are grouped by check so the user knows which one
# to fix and how. The fix path for each is documented inline.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

INDEX=".cursor/TOOLCHAIN.md"

if [ ! -f "$INDEX" ]; then
  echo "FAIL — $INDEX does not exist." >&2
  echo "       Fix: bash scripts/regenerate-toolchain.sh" >&2
  exit 1
fi

python3 - "$INDEX" <<'PYEOF'
import glob
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

INDEX = sys.argv[1]


def parse_frontmatter(path: Path) -> Dict[str, str]:
    text = path.read_text()
    if not text.startswith('---\n'):
        return {}
    end = text.find('\n---\n', 4)
    if end == -1:
        return {}
    fm: Dict[str, str] = {}
    current = None
    for line in text[4:end].split('\n'):
        m = re.match(r'^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$', line)
        if m:
            current = m.group(1)
            fm[current] = m.group(2).strip()
        elif current and line.strip():
            fm[current] += ' ' + line.strip()
    return fm


def git_mtime_date(path: Path) -> Optional[str]:
    """Return the git author date of the most recent commit touching
    `path`, in YYYY-MM-DD form (UTC). Returns None if the file is
    untracked or has no commits yet."""
    try:
        out = subprocess.check_output(
            ['git', 'log', '-1', '--format=%aI', '--', str(path)],
            stderr=subprocess.DEVNULL,
        ).decode().strip()
    except subprocess.CalledProcessError:
        return None
    if not out:
        return None
    # %aI is strict ISO 8601 like "2026-05-12T13:31:14-05:00".
    # Convert to UTC date by parsing with datetime.
    import datetime
    try:
        dt = datetime.datetime.fromisoformat(out)
        return dt.astimezone(datetime.timezone.utc).date().isoformat()
    except ValueError:
        return None


def parse_iso_to_date(value: str) -> Optional[str]:
    """Parse a `lastUpdated:` value into YYYY-MM-DD (UTC). Accepts
    both date-only (legacy) and full ISO 8601 datetime forms."""
    import datetime
    v = value.strip()
    # Strip trailing Z and treat as UTC.
    if v.endswith('Z'):
        v = v[:-1] + '+00:00'
    # Date-only form: just YYYY-MM-DD.
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}', v):
        return v
    try:
        dt = datetime.datetime.fromisoformat(v)
        return dt.astimezone(datetime.timezone.utc).date().isoformat()
    except ValueError:
        return None


def link_target(p: Path, kind: str) -> str:
    if kind == 'rule':
        return f"./rules/{p.name}"
    if kind == 'skill':
        return f"./skills/{p.parent.name}/SKILL.md"
    return f"./agents/{p.name}"


def parse_index_rows(text: str) -> Dict[str, str]:
    """Map link target -> raw lastUpdated value (the string between
    backticks in the second column)."""
    rows: Dict[str, str] = {}
    pattern = re.compile(
        r'\|\s*\[`[^`]+`\]\(([^)]+)\)\s*\|\s*`([^`]+)`\s*\|',
    )
    for m in pattern.finditer(text):
        rows[m.group(1)] = m.group(2)
    return rows


# ----- gather -----
files: List[Tuple[Path, str]] = (
    [(p, 'rule')   for p in sorted(Path('.').glob('.cursor/rules/*.mdc'))]
    + [(p, 'skill')  for p in sorted(Path('.').glob('.cursor/skills/*/SKILL.md'))]
    + [(p, 'agent')  for p in sorted(Path('.').glob('.cursor/agents/*.md'))]
)

index_text = Path(INDEX).read_text()
index_rows = parse_index_rows(index_text)

failures: List[str] = []
checked = {'mtime': 0, 'index_present': 0, 'index_date_match': 0}

# ----- CHECK 1: frontmatter lastUpdated >= git mtime (date-only) -----
for p, _kind in files:
    fm = parse_frontmatter(p)
    last = fm.get('lastUpdated', '').strip()
    if not last:
        failures.append(
            f"[CHECK 1: lastUpdated missing] {p}\n"
            f"           Fix: add `lastUpdated: $(date -u +%Y-%m-%dT%H:%M:%SZ)` "
            f"to YAML frontmatter, then run bash scripts/regenerate-toolchain.sh"
        )
        continue
    last_date = parse_iso_to_date(last)
    if not last_date:
        failures.append(
            f"[CHECK 1: lastUpdated unparseable] {p}: {last!r}\n"
            f"           Fix: replace with ISO 8601 UTC, e.g. `date -u +%Y-%m-%dT%H:%M:%SZ`"
        )
        continue
    git_date = git_mtime_date(p)
    if git_date is None:
        # File is untracked or no commits — skip mtime check, the
        # other two checks still apply.
        checked['mtime'] += 1
        continue
    if last_date < git_date:
        failures.append(
            f"[CHECK 1: lastUpdated stale] {p}\n"
            f"           lastUpdated date: {last_date}\n"
            f"           git mtime date:   {git_date}\n"
            f"           Fix: bash scripts/seed-toolchain-timestamps.sh "
            f"(or manually update lastUpdated to today)"
        )
    checked['mtime'] += 1

# ----- CHECK 2: every file has a row in TOOLCHAIN.md -----
for p, kind in files:
    target = link_target(p, kind)
    if target not in index_rows:
        failures.append(
            f"[CHECK 2: TOOLCHAIN row missing] {p}\n"
            f"           Expected link target: {target}\n"
            f"           Fix: bash scripts/regenerate-toolchain.sh"
        )
        continue
    checked['index_present'] += 1

# ----- CHECK 3: TOOLCHAIN row date matches frontmatter -----
for p, kind in files:
    target = link_target(p, kind)
    if target not in index_rows:
        # Already reported by CHECK 2.
        continue
    fm = parse_frontmatter(p)
    last = fm.get('lastUpdated', '').strip()
    if not last:
        # Already reported by CHECK 1.
        continue
    indexed = index_rows[target].strip()
    if indexed != last:
        failures.append(
            f"[CHECK 3: TOOLCHAIN row date mismatch] {p}\n"
            f"           frontmatter lastUpdated: {last}\n"
            f"           TOOLCHAIN.md row date:    {indexed}\n"
            f"           Fix: bash scripts/regenerate-toolchain.sh"
        )
        continue
    checked['index_date_match'] += 1

# ----- report -----
total_files = len(files)
if failures:
    print(f"FAIL \u2014 {len(failures)} toolchain currency issue(s) across {total_files} files:")
    print()
    for f in failures:
        print(f)
        print()
    print("All checks must pass. Each failure has a specific fix command above.")
    sys.exit(1)

print(
    f"OK \u2014 {total_files} toolchain artifacts current "
    f"(check 1: {checked['mtime']} mtime, "
    f"check 2: {checked['index_present']} indexed, "
    f"check 3: {checked['index_date_match']} matched)"
)
PYEOF
