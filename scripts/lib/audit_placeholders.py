"""Audit: every {{placeholder}} used in any examples/*.html appears in
placeholder-vocabulary.json. Catches typos and ensures the substitution
engine always has a definition for whatever it's asked to resolve.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl

VOCAB_PATH = rl.SCHEMAS_DIR / "placeholder-vocabulary.json"
PLACEHOLDER_RE = re.compile(r"\{\{\s*([\w.]+)\s*\}\}")


def load_vocabulary() -> set[str]:
    if not VOCAB_PATH.exists():
        return set()
    data = json.loads(VOCAB_PATH.read_text())
    return set(data.get("placeholders", {}).keys())


def audit(target: str | None = None) -> list[str]:
    errors: list[str] = []
    vocab = load_vocabulary()
    if not vocab:
        return ["placeholder-vocabulary.json missing or empty"]

    if not rl.NEW_COMPONENTS_DIR.exists():
        return errors

    if target:
        comp_dirs = [rl.NEW_COMPONENTS_DIR / target]
    else:
        comp_dirs = [p for p in rl.NEW_COMPONENTS_DIR.iterdir() if p.is_dir()]

    for cdir in sorted(comp_dirs):
        cid = cdir.name
        ex_dir = cdir / "examples"
        if not ex_dir.exists():
            continue
        for html in sorted(ex_dir.glob("*.html")):
            content = html.read_text()
            for m in PLACEHOLDER_RE.finditer(content):
                ph = m.group(1)
                if ph not in vocab:
                    errors.append(
                        f"{cid}/{html.name}: unknown placeholder '{{{{{ph}}}}}'"
                    )
    return errors


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else None
    errors = audit(target)
    if errors:
        print("FAIL — placeholder vocabulary mismatches:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)
    print("OK — every placeholder in examples/ is registered in placeholder-vocabulary.json")


if __name__ == "__main__":
    main()
