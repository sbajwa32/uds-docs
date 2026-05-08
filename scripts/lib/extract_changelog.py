"""Extract per-component changelog entries from the global CHANGELOG in app.js."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl


def extract(comp_id: str, dry_run: bool = False) -> dict:
    parsed = rl.parse_changelog_per_component()
    per = parsed["perComponent"]
    entries = per.get(comp_id, [])

    # Sort oldest-first within entries[] (matches global CHANGELOG convention).
    # The parser already iterates the global array in source order (oldest
    # first in the file because the array was reordered to be chronological).
    # No additional sort needed; trust source order.

    if not entries:
        # Component has never been mentioned in the global changelog.
        # Still produce a stub with addedIn from COMPONENT_STATUS.since.
        status = rl.parse_component_status().get(comp_id, {})
        added_in = status.get("since", "")
    else:
        added_in = entries[0]["version"]

    out = {
        "$schema": "../../schemas/changelog.schema.json",
        "addedIn": added_in,
        "entries": entries,
    }

    out_path = rl.NEW_COMPONENTS_DIR / comp_id / "changelog.json"
    if not dry_run:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(out, indent=2) + "\n")

    return {"count": len(entries), "addedIn": added_in, "outPath": str(out_path)}


def main():
    if len(sys.argv) < 2:
        rl.die("Usage: extract-changelog.sh <component-id> [--dry-run]")
    comp_id = sys.argv[1]
    dry_run = "--dry-run" in sys.argv[2:]
    r = extract(comp_id, dry_run=dry_run)
    print(
        f"{'(dry-run) ' if dry_run else ''}Extracted {r['count']} entries for '{comp_id}' (addedIn {r['addedIn']})"
    )
    if not dry_run:
        print(f"  -> {r['outPath']}")


if __name__ == "__main__":
    main()
