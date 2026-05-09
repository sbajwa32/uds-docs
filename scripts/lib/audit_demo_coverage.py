"""Audit: every implementable component has at least one Demo Builder-eligible example.

A component is "implementable" iff its spec.json knownIssues does NOT contain
"no inspectable component set yet". Implementable components MUST have at least
one entry in examples/manifest.json with demoWeight > 0, otherwise the Demo
Builder can't generate output for them.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl

NO_SET_MARKER = "no inspectable component set yet"


def audit() -> list[str]:
    errors: list[str] = []
    if not rl.NEW_COMPONENTS_DIR.exists():
        return errors

    for comp_dir in sorted(rl.NEW_COMPONENTS_DIR.iterdir()):
        if not comp_dir.is_dir():
            continue
        cid = comp_dir.name
        spec = comp_dir / "spec.json"
        if not spec.exists():
            continue
        try:
            data = json.loads(spec.read_text())
        except Exception:
            continue
        issues = data.get("knownIssues") or []
        if any(NO_SET_MARKER in (i or "") for i in issues):
            continue  # placeholder-only component, intentionally excluded
        manifest_path = comp_dir / "examples" / "manifest.json"
        if not manifest_path.exists():
            errors.append(f"{cid}: implementable but missing examples/manifest.json")
            continue
        try:
            m = json.loads(manifest_path.read_text())
        except Exception as e:
            errors.append(f"{cid}: examples/manifest.json invalid: {e}")
            continue
        eligible = [e for e in m.get("examples", []) if (e.get("demoWeight") or 0) > 0]
        if not eligible:
            errors.append(f"{cid}: implementable but no manifest entry has demoWeight > 0")

    return errors


def main():
    errors = audit()
    if errors:
        print("FAIL — Demo Builder coverage gaps:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)
    print("OK — every implementable component has a Demo Builder-eligible example")


if __name__ == "__main__":
    main()
