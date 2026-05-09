"""Prune a frozen UDS snapshot. History (per-component changelogs) is preserved.

Refuses to prune:
  - the current live version (the one in uds/version.json)
  - a version whose snapshot doesn't exist on disk
  - the only remaining historical version (always keep at least one for
    historical reference, unless --force is passed)
"""
from __future__ import annotations

import json
import shutil
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl


VERSIONS_DIR = rl.UDS_DOCS / "versions"
VERSIONS_JSON = rl.UDS_DOCS / "versions.json"
PRUNED_LOG = VERSIONS_DIR / "PRUNED.md"


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        print("\nUsage: prune-version.sh <version> [--force]")
        sys.exit(0)
    version = args[0]
    force = "--force" in args

    snapshot = VERSIONS_DIR / version
    if not snapshot.exists():
        rl.die(f"Snapshot {snapshot} does not exist on disk — nothing to prune.")

    # Refuse to prune the current live version
    version_file = rl.UDS_DOCS / "uds" / "version.json"
    if version_file.exists():
        try:
            current = json.loads(version_file.read_text()).get("version")
        except Exception:
            current = None
        if current == version:
            rl.die(f"Refusing to prune {version} — it is the current live UDS version.")

    # Read versions.json
    if VERSIONS_JSON.exists():
        manifest = json.loads(VERSIONS_JSON.read_text())
    else:
        manifest = {"latest": current, "versions": []}

    versions = manifest.get("versions", [])
    if version not in versions and not force:
        rl.die(f"Version {version!r} not listed in versions.json. Use --force to prune anyway.")

    # Refuse to prune the only remaining historical version
    historical = [v for v in versions if v != manifest.get("latest")]
    if len(historical) <= 1 and version in historical and not force:
        rl.die(
            f"Refusing to prune {version} — it is the only remaining historical "
            f"snapshot. Use --force to override."
        )

    print(f"About to prune snapshot: {snapshot}")
    print(f"  Disk usage: ~{sum(p.stat().st_size for p in snapshot.rglob('*') if p.is_file()) // 1024} KB")
    print(f"  versions.json before: {versions}")

    # Delete the snapshot folder
    shutil.rmtree(snapshot)

    # Update versions.json
    new_versions = [v for v in versions if v != version]
    manifest["versions"] = new_versions
    VERSIONS_JSON.write_text(json.dumps(manifest, separators=(", ", ": ")))

    # Append to audit log
    today = date.today().isoformat()
    PRUNED_LOG.parent.mkdir(parents=True, exist_ok=True)
    if not PRUNED_LOG.exists():
        PRUNED_LOG.write_text(
            "# Pruned UDS Versions\n\n"
            "Audit trail of UDS snapshot folders that have been removed from "
            "`uds-docs/versions/`. Per-component changelog history for these "
            "versions is intentionally preserved — only the frozen snapshot "
            "of the spec was deleted.\n\n"
            "| Version | Pruned on | Notes |\n"
            "|---------|-----------|-------|\n"
        )
    with PRUNED_LOG.open("a") as f:
        f.write(f"| {version} | {today} | snapshot removed by prune-version.sh |\n")

    print(f"\nDone.")
    print(f"  Removed: {snapshot}")
    print(f"  versions.json after: {new_versions}")
    print(f"  Audit log: {PRUNED_LOG}")
    print()
    print(f"Per-component changelog entries for {version} are PRESERVED — the")
    print(f"Changelog page will still show '{version}: ...' entries.")


if __name__ == "__main__":
    main()
