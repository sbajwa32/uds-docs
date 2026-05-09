"""Move one component into uds-docs/uds/components/<id>/ shape.

Steps performed (in order):
  1. Create uds-docs/uds/components/<id>/
  2. git mv uds/components/<id>.css   -> uds/components/<id>/<id>.css
     git mv uds/components/<id>.js    -> uds/components/<id>/<id>.js   (if exists)
  3. git mv content/<id>.json         -> uds/components/<id>/spec.json (and add $schema)
  4. Run extract-examples for <id>    -> uds/components/<id>/examples/*.html + manifest.json
  5. Run extract-changelog for <id>   -> uds/components/<id>/changelog.json
  6. Build uds/components/<id>/status.json from COMPONENT_STATUS[<id>]
  7. Move PLAYGROUNDS[<id>] from app.js into uds/components/<id>/playground.js
  8. Regenerate uds/uds.css and uds/uds.js to walk the new per-component folders.

All steps are idempotent — re-running is safe.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl
import extract_examples
import extract_changelog


def _legacy_css(comp_id: str) -> Path:
    return rl.LEGACY_COMPONENT_CSS_DIR / f"{comp_id}.css"


def _legacy_js(comp_id: str) -> Path:
    return rl.LEGACY_COMPONENT_CSS_DIR / f"{comp_id}.js"


def _legacy_spec(comp_id: str) -> Path:
    return rl.LEGACY_CONTENT_DIR / f"{comp_id}.json"


def _new_dir(comp_id: str) -> Path:
    return rl.NEW_COMPONENTS_DIR / comp_id


def _new_css(comp_id: str) -> Path:
    return _new_dir(comp_id) / f"{comp_id}.css"


def _new_js(comp_id: str) -> Path:
    return _new_dir(comp_id) / f"{comp_id}.js"


def _new_spec(comp_id: str) -> Path:
    return _new_dir(comp_id) / "spec.json"


def step_create_dir(comp_id: str, dry_run: bool) -> str:
    nd = _new_dir(comp_id)
    if nd.exists():
        return f"  ~  Folder already exists: {nd}"
    if not dry_run:
        nd.mkdir(parents=True, exist_ok=True)
    return f"  +  Created folder: {nd}"


def step_move_css(comp_id: str, dry_run: bool) -> str:
    src = _legacy_css(comp_id)
    dst = _new_css(comp_id)
    if dst.exists():
        return f"  ~  CSS already at {dst}"
    if not src.exists():
        return f"  !  No CSS file at legacy path {src} — skipped (placeholder?)"
    if not dry_run:
        rl.git_mv(src, dst)
    return f"  ->  CSS:  {src.relative_to(rl.REPO_ROOT)}  ->  {dst.relative_to(rl.REPO_ROOT)}"


def step_move_js(comp_id: str, dry_run: bool) -> str:
    src = _legacy_js(comp_id)
    dst = _new_js(comp_id)
    if dst.exists():
        return f"  ~  JS already at {dst}"
    if not src.exists():
        return f"  -  No JS file (component is CSS-only)"
    if not dry_run:
        rl.git_mv(src, dst)
    return f"  ->  JS:   {src.relative_to(rl.REPO_ROOT)}  ->  {dst.relative_to(rl.REPO_ROOT)}"


def step_move_spec(comp_id: str, dry_run: bool) -> str:
    src = _legacy_spec(comp_id)
    dst = _new_spec(comp_id)
    if dst.exists():
        return f"  ~  Spec already at {dst}"
    if not src.exists():
        rl.die(f"Required spec file missing at {src}")
    if not dry_run:
        rl.git_mv(src, dst)
        # Add $schema field
        data = json.loads(dst.read_text())
        if "$schema" not in data:
            new = {"$schema": "../../schemas/spec.schema.json"}
            new.update(data)
            dst.write_text(json.dumps(new, indent=2) + "\n")
    return f"  ->  Spec: {src.relative_to(rl.REPO_ROOT)}  ->  {dst.relative_to(rl.REPO_ROOT)}"


def step_extract_examples(comp_id: str, dry_run: bool) -> str:
    out_dir = _new_dir(comp_id) / "examples"
    if out_dir.exists() and any(out_dir.iterdir()):
        return f"  ~  Examples already exist at {out_dir}"
    r = extract_examples.extract(comp_id, dry_run=dry_run)
    return f"  +  Extracted {r['count']} example(s) -> {Path(r['outDir']).relative_to(rl.REPO_ROOT)}"


def step_extract_changelog(comp_id: str, dry_run: bool) -> str:
    out_path = _new_dir(comp_id) / "changelog.json"
    if out_path.exists():
        return f"  ~  changelog.json already at {out_path}"
    r = extract_changelog.extract(comp_id, dry_run=dry_run)
    return f"  +  Extracted {r['count']} changelog entries (addedIn {r['addedIn']})"


def step_build_status(comp_id: str, dry_run: bool) -> str:
    out_path = _new_dir(comp_id) / "status.json"
    if out_path.exists():
        return f"  ~  status.json already at {out_path}"
    status = rl.parse_component_status().get(comp_id)
    if status is None:
        rl.die(f"COMPONENT_STATUS has no entry for '{comp_id}'")
    body = {
        "$schema": "../../schemas/status.schema.json",
        "current": status["status"],
        "since": status["since"],
        "history": [{"version": status["since"], "status": status["status"]}],
    }
    if not dry_run:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(body, indent=2) + "\n")
    return f"  +  Built status.json: {status['status']} since {status['since']}"


def step_extract_playground(comp_id: str, dry_run: bool) -> str:
    """Extract PLAYGROUNDS[<id>] from app.js into uds/components/<id>/playground.js as
    an ES-module export.

    This is one of the trickier extractions because the playground bodies can
    contain arbitrary JS (controls, render functions). We snip the
    `<id>: { ... },` block textually and wrap it as a default export.
    """
    out_path = _new_dir(comp_id) / "playground.js"
    if out_path.exists():
        return f"  ~  playground.js already at {out_path}"
    src = rl.read_app_js()

    m = re.search(r"const\s+PLAYGROUNDS\s*=\s*\{(.*?)\n[ ]{0,2}\};", src, re.S)
    if not m:
        return f"  !  PLAYGROUNDS table not found in app.js — skipped"
    block = m.group(1)
    body = _slice_object_entry(block, comp_id)
    if body is None:
        return f"  -  No PLAYGROUNDS entry for '{comp_id}'"
    js = (
        f"// Playground config for the {comp_id} component.\n"
        f"// Extracted from app.js PLAYGROUNDS during the UDS repo restructure.\n"
        f"export default {body.strip()};\n"
    )
    if not dry_run:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(js)
    return f"  +  Wrote playground.js"


def _slice_object_entry(block: str, key: str) -> str | None:
    """Find `<key>: { ... },` (or trailing) in a JS object literal and return
    the value text including the braces. Handles nested braces and string
    quotes.
    """
    pat = re.compile(r"(?:^|\n)\s*['\"]?" + re.escape(key) + r"['\"]?\s*:\s*\{")
    m = pat.search(block)
    if not m:
        return None
    open_idx = block.find("{", m.start())
    if open_idx == -1:
        return None
    depth = 0
    in_str: str | None = None
    escape = False
    i = open_idx
    while i < len(block):
        ch = block[i]
        if escape:
            escape = False
        elif ch == "\\":
            escape = True
        elif in_str:
            if ch == in_str:
                in_str = None
        elif ch in ("'", '"', "`"):
            in_str = ch
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return block[open_idx : i + 1]
        i += 1
    return None


def regenerate_uds_orchestrators(dry_run: bool) -> str:
    """Rewrite uds-docs/uds/uds.css to import every uds/components/*/<id>.css
    discovered in the filesystem, and uds-docs/uds/uds.js to load every
    uds/components/*/<id>.js similarly.

    Hand-edits to component imports in either file are forbidden going forward.
    """
    css_path = rl.UDS_DOCS / "uds" / "uds.css"
    js_path = rl.UDS_DOCS / "uds" / "uds.js"

    # CSS: collect new-shape per-component CSS files.
    new_imports = []
    for comp_dir in sorted((rl.UDS_DOCS / "uds" / "components").iterdir()):
        if not comp_dir.is_dir():
            continue
        cid = comp_dir.name
        css_file = comp_dir / f"{cid}.css"
        if css_file.exists():
            new_imports.append(f"@import url('./components/{cid}/{cid}.css');")

    # Also keep any LEGACY top-level component CSS files still present
    # (for components not yet migrated; will be empty after Phase 6 finishes).
    for f in sorted((rl.UDS_DOCS / "uds" / "components").glob("*.css")):
        cid = f.stem
        # Skip components that already exist as a folder
        if (rl.UDS_DOCS / "uds" / "components" / cid).is_dir():
            continue
        new_imports.append(f"@import url('./components/{cid}.css');")

    # Read existing CSS and rewrite the components section.
    if css_path.exists():
        css = css_path.read_text()
    else:
        css = (
            "/* ==========================================================================\n"
            "   UDS — Urban Design System\n"
            "   Master stylesheet. Import this single file in any project.\n"
            "   ========================================================================== */\n\n"
            "/* Tokens */\n"
            "@import url('./tokens/primitives.css');\n"
            "@import url('./tokens/semantic.css');\n"
            "@import url('./tokens/layers.css');\n"
            "@import url('./tokens/text-styles.css');\n\n"
            "/* Components — auto-generated by scripts/migrate-component.sh; do not edit by hand */\n"
        )
    # Strip everything from "/* Components" line forward and rewrite.
    css_head = re.split(r"/\* Components.*?\*/", css, maxsplit=1, flags=re.S)[0]
    new_css = (
        css_head.rstrip()
        + "\n\n/* Components — auto-generated by scripts/migrate-component.sh; do not edit by hand */\n"
        + "\n".join(new_imports)
        + "\n"
    )
    if not dry_run:
        css_path.write_text(new_css)

    # JS orchestrator: today's uds.js loads component JS via <script> tags
    # discovered at runtime. We don't need to edit it during Phase 6 because
    # the JS files are referenced from index.html or auto-loaded. We DO note
    # the per-component JS file path move so anyone reading uds.js sees the
    # new shape (handled in Phase 6 verify, not here).

    return f"  +  Regenerated uds.css with {len(new_imports)} component imports"


def main():
    if len(sys.argv) < 2:
        rl.die("Usage: migrate-component.sh <component-id> [--dry-run]")
    comp_id = sys.argv[1]
    dry_run = "--dry-run" in sys.argv[2:]
    print(f"{'(dry-run) ' if dry_run else ''}Migrating component: {comp_id}")

    print(step_create_dir(comp_id, dry_run))
    print(step_move_css(comp_id, dry_run))
    print(step_move_js(comp_id, dry_run))
    print(step_move_spec(comp_id, dry_run))
    print(step_extract_examples(comp_id, dry_run))
    print(step_extract_changelog(comp_id, dry_run))
    print(step_build_status(comp_id, dry_run))
    print(step_extract_playground(comp_id, dry_run))
    print(regenerate_uds_orchestrators(dry_run))

    print(f"\n{'(dry-run) ' if dry_run else ''}Done.")


if __name__ == "__main__":
    main()
