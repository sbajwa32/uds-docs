"""Round-trip data integrity checks for the UDS repo restructure.

Modes:
  - <component-id>          Run all checks for one component.
  - --all-components        Run all checks for every migrated component.
  - --changelogs            Re-aggregate per-component changelogs and diff
                             against the global CHANGELOG snapshot.
  - --statuses              Verify per-component status.json matches
                             COMPONENT_STATUS in app.js (or in baseline).

Exits non-zero on any mismatch.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl

BASELINE_DIR = Path("/tmp/baseline-data")


def check_component(comp_id: str) -> list[str]:
    errors: list[str] = []
    cdir = rl.NEW_COMPONENTS_DIR / comp_id
    if not cdir.exists():
        return [f"{comp_id}: not migrated yet ({cdir} missing)"]

    # 1. spec.json equals legacy content/<id>.json (modulo intentional
    # post-baseline additions: $schema and figmaPageNodeId — the latter was
    # migrated from the legacy FIGMA_LINKS table during Phase 13a).
    spec = cdir / "spec.json"
    legacy_spec = BASELINE_DIR / "content" / f"{comp_id}.json"
    POST_BASELINE_FIELDS = {"$schema", "figmaPageNodeId"}
    if spec.exists() and legacy_spec.exists():
        new = json.loads(spec.read_text())
        old = json.loads(legacy_spec.read_text())
        new_filtered = {k: v for k, v in new.items() if k not in POST_BASELINE_FIELDS}
        if new_filtered != old:
            diff_keys = sorted(set(new_filtered.keys()) ^ set(old.keys()))
            errors.append(
                f"{comp_id}: spec.json differs from baseline (key diff: {diff_keys})"
            )
    elif spec.exists() and not legacy_spec.exists():
        errors.append(f"{comp_id}: spec.json exists but baseline content/{comp_id}.json missing")
    elif not spec.exists():
        errors.append(f"{comp_id}: spec.json missing in new shape")

    # 2. status.json matches COMPONENT_STATUS in baseline
    status_path = cdir / "status.json"
    if status_path.exists():
        s = json.loads(status_path.read_text())
        bm = json.loads((BASELINE_DIR / "manifest.json").read_text())
        baseline_entry = bm["componentStatus"].get(comp_id)
        if baseline_entry is None:
            errors.append(f"{comp_id}: COMPONENT_STATUS baseline has no entry")
        else:
            if s["current"] != baseline_entry["status"]:
                errors.append(
                    f"{comp_id}: status.current={s['current']!r} but baseline status={baseline_entry['status']!r}"
                )
            if s["since"] != baseline_entry["since"]:
                errors.append(
                    f"{comp_id}: status.since={s['since']!r} but baseline since={baseline_entry['since']!r}"
                )

    # 3. changelog.json addedIn matches status.since (or earliest changelog version)
    changelog = cdir / "changelog.json"
    if changelog.exists() and status_path.exists():
        cl = json.loads(changelog.read_text())
        s = json.loads(status_path.read_text())
        if cl.get("addedIn") and s.get("since") and cl["addedIn"] != s["since"]:
            errors.append(
                f"{comp_id}: changelog.addedIn={cl['addedIn']!r} != status.since={s['since']!r}"
            )

    # 4. examples/manifest.json declares all .html files in examples/
    manifest_path = cdir / "examples" / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        declared = {e["file"] for e in manifest.get("examples", [])}
        actual = {p.name for p in (cdir / "examples").glob("*.html")}
        missing_files = declared - actual
        undeclared = actual - declared
        if missing_files:
            errors.append(f"{comp_id}: manifest declares files that don't exist: {sorted(missing_files)}")
        if undeclared:
            errors.append(f"{comp_id}: examples/ has files not declared in manifest: {sorted(undeclared)}")

    return errors


def check_changelogs() -> list[str]:
    """Re-aggregate per-component changelogs and verify every (version, type, text)
    triple from the baseline global CHANGELOG appears somewhere in a per-component
    changelog.json (or in CHANGELOG.globalNotes.json once that file exists).

    Recognizes component splits — the pre-split 'Nav' component became
    nav-header + nav-vertical in UDS 0.2, so its history is searched in
    BOTH successor changelogs.
    """
    errors: list[str] = []
    parsed = rl.parse_changelog_per_component(open(BASELINE_DIR / "app.js").read())
    baseline_per = parsed["perComponent"]

    # When a baseline component id splits into successors, search its history
    # across all successors. Each historical entry is "accounted for" if it
    # appears in at least one successor's changelog.
    SPLITS = {
        "nav": ["nav-header", "nav-vertical"],
    }

    for comp_id, expected_entries in baseline_per.items():
        successor_ids = SPLITS.get(comp_id, [comp_id])
        actual_triples: set = set()
        any_exists = False
        for sid in successor_ids:
            cl = rl.NEW_COMPONENTS_DIR / sid / "changelog.json"
            if not cl.exists():
                continue
            any_exists = True
            actual = json.loads(cl.read_text())
            actual_triples.update(
                (e["version"], e["type"], e["text"]) for e in actual.get("entries", [])
            )
        if not any_exists:
            errors.append(
                f"{comp_id}: per-component changelog missing in any successor "
                f"({', '.join(successor_ids)}); {len(expected_entries)} entries unaccounted for"
            )
            continue
        for e in expected_entries:
            triple = (e["version"], e["type"], e["text"])
            if triple not in actual_triples:
                errors.append(
                    f"{comp_id}: missing baseline entry: ({e['version']}, {e['type']}, {e['text'][:60]}...)"
                )
    return errors


def all_components() -> list[str]:
    cs = rl.parse_component_status(open(BASELINE_DIR / "app.js").read())
    return sorted(cs.keys())


def main():
    args = sys.argv[1:]
    if not args:
        rl.die("Usage: round-trip-check.sh [<component-id> | --all-components | --changelogs]")

    all_errors: list[str] = []
    target = args[0]
    if target == "--all-components":
        for cid in all_components():
            all_errors.extend(check_component(cid))
    elif target == "--changelogs":
        all_errors.extend(check_changelogs())
    elif target == "--statuses":
        for cid in all_components():
            for e in check_component(cid):
                if "status" in e or "since" in e:
                    all_errors.append(e)
    else:
        all_errors.extend(check_component(target))

    if all_errors:
        print("FAIL — round-trip check found mismatches:", file=sys.stderr)
        for e in all_errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)
    print("OK — round-trip check passed")


if __name__ == "__main__":
    main()
