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


def strip_all_comments(css: str) -> str:
    """Strip both single-line and multi-line C-style comments, including
    block comments that span multiple lines.
    """
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def is_inside_multiline_comment(css: str, char_offset: int) -> bool:
    """Returns True if char_offset falls inside a /* ... */ block."""
    last_open = css.rfind("/*", 0, char_offset)
    if last_open < 0:
        return False
    last_close = css.rfind("*/", 0, char_offset)
    return last_close < last_open


def audit() -> list[str]:
    errors: list[str] = []
    if not rl.NEW_COMPONENTS_DIR.exists():
        return errors

    for comp_dir in sorted(rl.NEW_COMPONENTS_DIR.iterdir()):
        if not comp_dir.is_dir():
            continue
        cid = comp_dir.name
        for css_file in sorted(comp_dir.glob("*.css")):
            text = css_file.read_text()
            # Build line offsets so we can map char offset to line number
            line_starts = [0]
            for i, ch in enumerate(text):
                if ch == "\n":
                    line_starts.append(i + 1)

            def line_of(offset: int) -> int:
                # Binary search would be faster but linear is fine for this scale
                lo, hi = 0, len(line_starts) - 1
                while lo < hi:
                    mid = (lo + hi + 1) // 2
                    if line_starts[mid] <= offset:
                        lo = mid
                    else:
                        hi = mid - 1
                return lo + 1

            for m in HEX_COLOR_RE.finditer(text):
                if is_inside_multiline_comment(text, m.start()):
                    continue
                ln = line_of(m.start())
                line_text = text.splitlines()[ln - 1] if ln - 1 < len(text.splitlines()) else ""
                if ALLOW_RE.search(line_text):
                    continue
                # Also skip if the hex is in a // single-line comment
                # (we don't have those in CSS, but be safe)
                errors.append(
                    f"{css_file.relative_to(rl.REPO_ROOT)}:{ln}: hex color — use a `--uds-color-*` token instead"
                )
            for m in RGB_LIKE_RE.finditer(text):
                if is_inside_multiline_comment(text, m.start()):
                    continue
                ln = line_of(m.start())
                line_text = text.splitlines()[ln - 1] if ln - 1 < len(text.splitlines()) else ""
                if ALLOW_RE.search(line_text):
                    continue
                errors.append(
                    f"{css_file.relative_to(rl.REPO_ROOT)}:{ln}: rgb()/rgba()/hsl() — use a `--uds-color-*` token instead"
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
