"""Aggregate per-component changelog.json files into uds/CHANGELOG.json.

Output format:
    [
      {
        "version": "0.3",
        "date": "2026-05-07",
        "globalNotes": [
          { "type": "added", "text": "Internal support pages..." }
        ],
        "byComponent": {
          "Button": [
            { "type": "fixed", "text": "..." }
          ],
          "Badge": [...]
        }
      },
      ...
    ]

Versions are sorted oldest-first (matches the global CHANGELOG convention).
The docs Changelog page renderer reverses for display.
"""
from __future__ import annotations

import json
import re
import sys
from collections import OrderedDict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl


# --- Per-release dates (legacy data — globalNotes file overrides if present) -
RELEASE_DATES = {
    "0.1": "2026-04-02",
    "0.2": "2026-04-15",
    "0.3": "2026-05-07",
}


def _semver_key(v: str) -> tuple:
    return tuple(int(x) if x.isdigit() else 0 for x in re.split(r"[.\-]", v))


def aggregate() -> list:
    components_dir = rl.UDS_DOCS / "uds" / "components"
    if not components_dir.exists():
        return []

    by_version: dict = {}

    for comp_dir in sorted(components_dir.iterdir()):
        if not comp_dir.is_dir():
            continue
        changelog = comp_dir / "changelog.json"
        if not changelog.exists():
            continue
        try:
            data = json.loads(changelog.read_text())
        except Exception as e:
            print(f"  WARN: bad JSON in {changelog}: {e}", file=sys.stderr)
            continue

        # Component name = capitalize id parts (e.g. 'nav-header' -> 'Nav Header')
        comp_name = rl.id_to_title(comp_dir.name)

        for entry in data.get("entries", []):
            v = entry.get("version")
            if not v:
                continue
            if v not in by_version:
                by_version[v] = {
                    "version": v,
                    "date": RELEASE_DATES.get(v, ""),
                    "globalNotes": [],
                    "byComponent": {},
                }
            by_version[v]["byComponent"].setdefault(comp_name, []).append({
                "type": entry["type"],
                "text": entry["text"],
            })

    # Merge optional hand-curated global notes
    global_notes_file = rl.UDS_DOCS / "uds" / "CHANGELOG.globalNotes.json"
    if global_notes_file.exists():
        try:
            global_notes = json.loads(global_notes_file.read_text())
        except Exception as e:
            print(f"  WARN: bad JSON in {global_notes_file}: {e}", file=sys.stderr)
            global_notes = {}
        for v, info in global_notes.items():
            if v not in by_version:
                by_version[v] = {
                    "version": v,
                    "date": info.get("date", RELEASE_DATES.get(v, "")),
                    "globalNotes": [],
                    "byComponent": {},
                }
            if info.get("date"):
                by_version[v]["date"] = info["date"]
            for note in info.get("notes", []):
                by_version[v]["globalNotes"].append(note)

    # Sort byComponent map alphabetically + sort entries by type per the
    # SITE rendering convention (added → changed → fixed → deprecated → removed)
    type_order = ["added", "changed", "fixed", "deprecated", "removed"]
    type_rank = {t: i for i, t in enumerate(type_order)}
    for v_data in by_version.values():
        v_data["byComponent"] = OrderedDict(
            sorted(v_data["byComponent"].items())
        )
        for comp_entries in v_data["byComponent"].values():
            comp_entries.sort(key=lambda e: type_rank.get(e["type"], 99))
        v_data["globalNotes"].sort(key=lambda e: type_rank.get(e.get("type", ""), 99))

    # Order versions oldest-first
    out = sorted(by_version.values(), key=lambda x: _semver_key(x["version"]))
    return out


def main():
    dry_run = "--dry-run" in sys.argv[1:]
    aggregated = aggregate()
    out_path = rl.UDS_DOCS / "uds" / "CHANGELOG.json"

    payload = json.dumps(aggregated, indent=2) + "\n"

    if dry_run:
        print(f"(dry-run) Would write {out_path}")
        print(f"  {len(aggregated)} releases:")
        for r in aggregated:
            comp_count = len(r["byComponent"])
            entry_count = sum(len(v) for v in r["byComponent"].values()) + len(r.get("globalNotes", []))
            print(f"    {r['version']} ({r.get('date', 'no date')}): {comp_count} components, {entry_count} entries")
        return

    out_path.write_text(payload)
    print(f"OK — wrote {out_path}")
    print(f"  {len(aggregated)} releases:")
    for r in aggregated:
        comp_count = len(r["byComponent"])
        entry_count = sum(len(v) for v in r["byComponent"].values()) + len(r.get("globalNotes", []))
        print(f"    {r['version']} ({r.get('date', 'no date')}): {comp_count} components, {entry_count} entries")


if __name__ == "__main__":
    main()
