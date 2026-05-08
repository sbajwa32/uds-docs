"""Shared helpers for migration scripts during the UDS repo restructure.

Used by:
  - migrate-component.sh
  - extract-examples.sh
  - extract-changelog.sh
  - round-trip-check.sh
  - audit-component-completeness.sh
  - audit-demo-coverage.sh
  - audit-placeholders.sh
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
UDS_DOCS = REPO_ROOT / "uds-docs"
LEGACY_CONTENT_DIR = UDS_DOCS / "content"
LEGACY_COMPONENT_CSS_DIR = UDS_DOCS / "uds" / "components"
NEW_COMPONENTS_DIR = UDS_DOCS / "uds" / "components"
SCHEMAS_DIR = UDS_DOCS / "uds" / "schemas"


def app_js_path() -> Path:
    """Return the current location of app.js (root or moved into docs/)."""
    moved = UDS_DOCS / "docs" / "app.js"
    if moved.exists():
        return moved
    return UDS_DOCS / "app.js"


def index_html_path() -> Path:
    return UDS_DOCS / "index.html"


def demo_builder_path() -> Path:
    moved_dir = UDS_DOCS / "docs" / "modules" / "demo-builder"
    if moved_dir.exists():
        return moved_dir / "index.js"
    return UDS_DOCS / "demo-builder.js"


def read_app_js() -> str:
    return app_js_path().read_text()


def read_index_html() -> str:
    return index_html_path().read_text()


def parse_component_status(src: str = None) -> dict:
    """Returns {id: {status, since}} from COMPONENT_STATUS in app.js.

    Tolerant of indent — works whether COMPONENT_STATUS is at indent 2
    (pre-Phase-3 IIFE-wrapped) or indent 0 (post-Phase-3 ES module).
    """
    if src is None:
        src = read_app_js()
    m = re.search(r"var COMPONENT_STATUS = \{(.*?)\n[ ]{0,2}\};", src, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        mm = re.match(
            r"\s*'?([\w-]+)'?\s*:\s*\{\s*status:\s*'([^']+)',\s*since:\s*'([^']+)'", line
        )
        if mm:
            out[mm.group(1)] = {"status": mm.group(2), "since": mm.group(3)}
    return out


def parse_figma_links(src: str = None) -> dict:
    if src is None:
        src = read_app_js()
    m = re.search(r"var\s+FIGMA_LINKS\s*=\s*\{(.*?)\n[ ]{0,2}\};", src, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        mm = re.match(r"\s*'?([\w-]+)'?\s*:\s*['\"]([^'\"]+)['\"]", line)
        if mm:
            out[mm.group(1)] = mm.group(2)
    return out


def parse_changelog_per_component(src: str = None) -> dict:
    """Returns {component_id: [{version, type, text}, ...]} grouped by component.

    Walks the global CHANGELOG array. Entries with a 'component' field are
    attributed to that component (or each component, if it's an array).
    Entries without a 'component' field go into the 'globalNotes' bucket
    keyed by version.
    """
    if src is None:
        src = read_app_js()
    m = re.search(r"var CHANGELOG = \[(.*?)\n[ ]{0,2}\];", src, re.S)
    if not m:
        return {"perComponent": {}, "globalNotes": {}}

    block = m.group(0)

    per_component: dict = {}
    global_notes: dict = {}

    # Split into top-level release objects.
    release_re = re.compile(
        r"\{\s*\n\s*version:\s*'([^']+)',\s*\n\s*date:\s*'([^']+)',\s*\n\s*changes:\s*\[(.*?)\n\s*\]\s*\n\s*\}",
        re.S,
    )
    for rm in release_re.finditer(block):
        version = rm.group(1)
        changes_block = rm.group(3)

        for entry_match in re.finditer(
            r"\{\s*type:\s*'([^']+)',\s*category:\s*([^,]+),\s*component:\s*([^,]+),\s*text:\s*([\"'])((?:\\.|(?!\4).)*?)\4\s*\}",
            changes_block,
            re.S,
        ):
            etype = entry_match.group(1)
            comp_raw = entry_match.group(3).strip()
            text_quote = entry_match.group(4)
            text = entry_match.group(5)
            text = text.replace("\\" + text_quote, text_quote).replace("\\\\", "\\")

            if comp_raw == "null":
                global_notes.setdefault(version, []).append({"type": etype, "text": text})
                continue

            comps: list = []
            arr_match = re.match(r"\[(.*?)\]", comp_raw, re.S)
            if arr_match:
                for s in re.findall(r"['\"]([^'\"]+)['\"]", arr_match.group(1)):
                    comps.append(s)
            else:
                sm = re.match(r"['\"]([^'\"]+)['\"]", comp_raw)
                if sm:
                    comps.append(sm.group(1))

            for comp in comps:
                comp_id = title_to_id(comp)
                per_component.setdefault(comp_id, []).append(
                    {"version": version, "type": etype, "text": text}
                )

    return {"perComponent": per_component, "globalNotes": global_notes}


def title_to_id(title_or_id: str) -> str:
    """Map a CHANGELOG `component` field (which is sometimes a Title and
    sometimes an id) to a canonical kebab-case id matching folder names.

    e.g. 'Text Input' -> 'text-input', 'Nav Header' -> 'nav-header',
         'button' -> 'button', 'Data Table' -> 'data-table'.
    """
    s = title_or_id.strip()
    if not s:
        return s
    if "-" in s and s == s.lower():
        return s
    return re.sub(r"\s+", "-", s.strip()).lower().replace("/", "-").replace("--", "-")


def id_to_title(comp_id: str) -> str:
    return " ".join(p.capitalize() for p in comp_id.split("-"))


def git_mv(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "mv", str(src), str(dst)], check=True, cwd=REPO_ROOT)


def list_implementable_components(src: str = None) -> list:
    """Returns sorted list of component ids that should appear in Demo Builder
    (i.e. have an inspectable component set per their knownIssues).
    """
    NO_SET_MARKER = "no inspectable component set yet"
    status = parse_component_status(src)
    out = []
    for cid, st in status.items():
        if st["status"] == "deprecated":
            continue
        spec = LEGACY_CONTENT_DIR / f"{cid}.json"
        if not spec.exists():
            new_spec = NEW_COMPONENTS_DIR / cid / "spec.json"
            if not new_spec.exists():
                continue
            spec = new_spec
        try:
            data = json.loads(spec.read_text())
        except Exception:
            continue
        issues = data.get("knownIssues") or []
        if any(NO_SET_MARKER in (i or "") for i in issues):
            continue
        out.append(cid)
    return sorted(out)


def get_data_page_block(html: str, comp_id: str) -> str | None:
    """Return the substring of `html` that is the `<div data-page="<id>">...</div>` block.

    Walks divs with depth tracking since these blocks are large and contain
    nested divs.
    """
    pat = re.compile(r'<div data-page="' + re.escape(comp_id) + r'"[^>]*>')
    m = pat.search(html)
    if not m:
        return None
    start = m.start()
    depth = 0
    i = start
    while i < len(html):
        if html.startswith("<div", i):
            depth += 1
            i += 4
        elif html.startswith("</div>", i):
            depth -= 1
            if depth == 0:
                return html[start : i + 6]
            i += 6
        else:
            i += 1
    return html[start:]


def get_examples_panel(html_block: str) -> str | None:
    """Return the inner HTML of <div data-tab-panel="examples"> within a
    component's data-page block.
    """
    m = re.search(r'<div data-tab-panel="examples"[^>]*>', html_block)
    if not m:
        return None
    start = m.end()
    depth = 1
    i = start
    while i < len(html_block):
        if html_block.startswith("<div", i):
            depth += 1
            i += 4
        elif html_block.startswith("</div>", i):
            depth -= 1
            if depth == 0:
                return html_block[start:i]
            i += 6
        else:
            i += 1
    return html_block[start:]


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower())
    return re.sub(r"-+", "-", s).strip("-")


def report_pass(msg: str) -> None:
    print(f"OK  {msg}")


def report_fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)
