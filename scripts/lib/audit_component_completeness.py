"""Audit: every per-component folder has the required files.

Required for every component:
  - <id>.css                          (token-first component CSS)
  - spec.json                         (conforms to spec.schema.json)
  - status.json                       (conforms to status.schema.json)
  - changelog.json                    (conforms to changelog.schema.json)
  - examples/manifest.json            (conforms to manifest.schema.json)
  - examples/*.html                   (at least one HTML example)
Optional:
  - <id>.js                           (interactive components)
  - playground.js                     (default-export object literal)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl


def audit_one(comp_id: str) -> list[str]:
    cdir = rl.NEW_COMPONENTS_DIR / comp_id
    errors: list[str] = []
    if not cdir.exists():
        return [f"{comp_id}: folder {cdir} does not exist"]
    required = [
        f"{comp_id}.css",
        "spec.json",
        "status.json",
        "changelog.json",
        "examples/manifest.json",
    ]
    for r in required:
        if not (cdir / r).exists():
            errors.append(f"{comp_id}: missing required file {r}")
    # Need at least one .html example
    html = list((cdir / "examples").glob("*.html")) if (cdir / "examples").exists() else []
    if not html:
        errors.append(f"{comp_id}: examples/ has no .html files")
    # If manifest exists, every declared file must exist
    mf = cdir / "examples" / "manifest.json"
    if mf.exists():
        try:
            m = json.loads(mf.read_text())
            for e in m.get("examples", []):
                fp = cdir / "examples" / e["file"]
                if not fp.exists():
                    errors.append(f"{comp_id}: manifest declares {e['file']} but it doesn't exist")
        except Exception as exc:
            errors.append(f"{comp_id}: manifest.json invalid JSON: {exc}")
    return errors


def main():
    args = sys.argv[1:]
    if args:
        targets = args
    else:
        if not rl.NEW_COMPONENTS_DIR.exists():
            print("OK — no per-component folders yet (audit is a no-op pre-migration)")
            return
        targets = sorted(p.name for p in rl.NEW_COMPONENTS_DIR.iterdir() if p.is_dir())

    all_errors: list[str] = []
    for cid in targets:
        all_errors.extend(audit_one(cid))

    if all_errors:
        print("FAIL — component completeness errors:", file=sys.stderr)
        for e in all_errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)
    print(f"OK — {len(targets)} component(s) complete")


if __name__ == "__main__":
    main()
