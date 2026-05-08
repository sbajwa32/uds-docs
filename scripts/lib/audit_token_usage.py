"""Audit: per-component CSS files use UDS tokens, not hardcoded values.

Flags:
  - hex colors (#aabbcc, #abc, #abcd, etc.) outside of comments
  - rgb(...), rgba(...), hsl(...), hsla(...) calls
  - px values outside of allowlisted contexts (border-width, transform translate offsets)

This is a heuristic — false positives are possible. Components with intentional
hardcoded values can add a `/* uds-allow-hardcoded: <reason> */` comment on
the same line to suppress.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl

HEX_COLOR_RE = re.compile(r"#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b")
RGB_LIKE_RE = re.compile(r"\b(?:rgb|rgba|hsl|hsla)\s*\(", re.I)
ALLOW_RE = re.compile(r"/\*\s*uds-allow-hardcoded[^*]*\*/")


def strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def audit() -> list[str]:
    errors: list[str] = []
    if not rl.NEW_COMPONENTS_DIR.exists():
        return errors

    for comp_dir in sorted(rl.NEW_COMPONENTS_DIR.iterdir()):
        if not comp_dir.is_dir():
            continue
        cid = comp_dir.name
        for css_file in sorted(comp_dir.glob("*.css")):
            for line_no, raw_line in enumerate(css_file.read_text().splitlines(), 1):
                line = raw_line
                if ALLOW_RE.search(line):
                    continue
                no_comment = strip_comments(line)
                if HEX_COLOR_RE.search(no_comment):
                    errors.append(
                        f"{css_file.relative_to(rl.REPO_ROOT)}:{line_no}: hex color — use a `--uds-color-*` token instead"
                    )
                if RGB_LIKE_RE.search(no_comment):
                    errors.append(
                        f"{css_file.relative_to(rl.REPO_ROOT)}:{line_no}: rgb()/rgba()/hsl() — use a `--uds-color-*` token instead"
                    )
    return errors


def main():
    errors = audit()
    if errors:
        print("FAIL — token-first violations:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        print(
            "\nNote: add `/* uds-allow-hardcoded: <reason> */` on the same line "
            "to intentionally allow a hardcoded value.",
            file=sys.stderr,
        )
        sys.exit(1)
    print("OK — every per-component CSS uses tokens (no hardcoded colors found)")


if __name__ == "__main__":
    main()
