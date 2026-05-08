"""Compare two directories of screenshots side-by-side and report differences.

Used to verify migration phases didn't change rendering. The plan tolerates
intentional rendering improvements (we're not aiming for pixel-perfect parity
across the whole migration), so this script reports differences for human
review rather than failing on any pixel diff.
"""
from __future__ import annotations

import hashlib
import sys
from pathlib import Path


def file_hash(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    if len(sys.argv) != 3:
        print("Usage: diff-screenshots.sh <baseline-dir> <current-dir>", file=sys.stderr)
        sys.exit(1)
    baseline = Path(sys.argv[1])
    current = Path(sys.argv[2])
    if not baseline.exists():
        print(f"Baseline dir does not exist: {baseline}", file=sys.stderr)
        sys.exit(1)
    if not current.exists():
        print(f"Current dir does not exist: {current}", file=sys.stderr)
        sys.exit(1)

    baseline_files = {p.name: p for p in baseline.glob("*.png")}
    current_files = {p.name: p for p in current.glob("*.png")}

    only_baseline = sorted(set(baseline_files) - set(current_files))
    only_current = sorted(set(current_files) - set(baseline_files))
    both = sorted(set(baseline_files) & set(current_files))

    identical: list[str] = []
    changed: list[tuple[str, int, int]] = []
    for name in both:
        bh = file_hash(baseline_files[name])
        ch = file_hash(current_files[name])
        if bh == ch:
            identical.append(name)
        else:
            bsize = baseline_files[name].stat().st_size
            csize = current_files[name].stat().st_size
            changed.append((name, bsize, csize))

    print(f"Comparing {baseline} -> {current}")
    print(f"  Identical: {len(identical)}")
    print(f"  Changed:   {len(changed)}")
    print(f"  Missing in current ({len(only_baseline)}):")
    for n in only_baseline:
        print(f"    - {n}")
    print(f"  New in current ({len(only_current)}):")
    for n in only_current:
        print(f"    + {n}")

    if changed:
        print("\nChanged pages (size before -> size after):")
        for name, b, c in changed:
            sign = "+" if c > b else "-"
            print(f"  {name}: {b:,} -> {c:,} ({sign}{abs(c - b):,} bytes)")

    # Always exit 0 — humans review the diff. The plan's verify steps gate on
    # specific checks, not blanket pixel parity.
    print("\n(Visual diffs are reported for review. Audit scripts gate on data integrity.)")


if __name__ == "__main__":
    main()
