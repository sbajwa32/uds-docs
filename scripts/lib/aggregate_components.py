"""Aggregate component manifest.

Walks uds-docs/uds/components/<id>/ folders, reads each spec.json + status.json,
and writes uds-docs/uds/components.json — a flat array of component IDs in the
display order encoded by the per-component status.json's earliest "since" version
(earlier first), with alphabetical tiebreak.

This is the single source of truth for "which components exist". The docs site
fetches this file, then fetches each component's status.json + spec.json in
parallel to build its runtime component metadata. release.sh and the
new-component skill keep it in sync.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
COMPONENTS_DIR = REPO_ROOT / "uds-docs" / "uds" / "components"
OUT_FILE = REPO_ROOT / "uds-docs" / "uds" / "components.json"


def version_key(version: str) -> tuple[int, ...]:
    """0.10 sorts after 0.2."""
    return tuple(int(x) if x.isdigit() else 0 for x in version.split("."))


def main(argv: list[str]) -> int:
    components: list[dict] = []
    for child in sorted(COMPONENTS_DIR.iterdir()):
        if not child.is_dir():
            continue
        spec_p = child / "spec.json"
        status_p = child / "status.json"
        if not (spec_p.exists() and status_p.exists()):
            continue
        try:
            spec = json.loads(spec_p.read_text())
            status = json.loads(status_p.read_text())
        except json.JSONDecodeError as exc:
            print(f"  ERROR: invalid JSON in {child.name}: {exc}", file=sys.stderr)
            return 1
        components.append({
            "id": spec.get("component", child.name),
            "title": spec.get("title", child.name),
            "since": status.get("since", "0.0"),
        })

    components.sort(key=lambda c: (version_key(c["since"]), c["id"]))

    payload = {
        "$schema": "./schemas/components-manifest.schema.json",
        "components": components,
    }
    OUT_FILE.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"OK — wrote {OUT_FILE}")
    print(f"  {len(components)} components, ordered by since/id")
    print(f"  first: {components[0]['id']}, last: {components[-1]['id']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
