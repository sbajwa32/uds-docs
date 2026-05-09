"""One-time conversion of versions/<X>/ from the legacy frozen full-site
shape to the new UDS-only per-component shape.

Walks versions/<X>/content/<id>.json + versions/<X>/app.js + versions/<X>/uds/
and emits the per-component folder structure under versions/<X>/uds/.
Then deletes the frozen full-site files (index.html, app.js, demo-builder.js,
content/, etc.) — only versions/<X>/uds/ + history files survive.

After conversion, the current docs site can render the archive by reading
data through udsPath('<X>'). All historical CSS, specs, statuses, and
changelog entries are preserved verbatim.

This script is intended to be run ONCE per legacy archive that needs
upgrading. It's idempotent — safe to re-run, but writes nothing if the
target folder shape already exists.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def parse_old_app_js(app_src: str) -> dict:
    """Parse COMPONENT_STATUS, FIGMA_LINKS, and CHANGELOG from a frozen
    versions/<X>/app.js (which still uses the legacy var-foo = {...} layout).
    Returns { 'status': {id: {status, since}}, 'figma': {id: nodeId},
    'changelog': [{version, date, components: [{component, type, text}], globalNotes: [...]}] }.
    """
    out = {"status": {}, "figma": {}, "changelog": []}

    # COMPONENT_STATUS — tolerate any leading indentation (frozen app.js is
    # often wrapped in an IIFE so the declaration is indented two spaces)
    m = re.search(r"^[ \t]*var\s+COMPONENT_STATUS\s*=\s*\{", app_src, re.M)
    if m:
        block = _extract_object(app_src, m.start())
        for em in re.finditer(
            r"['\"]?([\w-]+)['\"]?\s*:\s*\{\s*status:\s*'([^']+)'\s*,\s*since:\s*'([^']+)'\s*\}",
            block,
        ):
            out["status"][em.group(1)] = {
                "status": em.group(2),
                "since": em.group(3),
            }

    # FIGMA_LINKS — tolerate any leading indentation
    m = re.search(r"^[ \t]*var\s+FIGMA_LINKS\s*=\s*\{", app_src, re.M)
    if m:
        block = _extract_object(app_src, m.start())
        for em in re.finditer(r"['\"]?([\w-]+)['\"]?\s*:\s*'([^']+)'", block):
            out["figma"][em.group(1)] = em.group(2)

    # CHANGELOG — array of release objects, tolerate any leading indentation
    m = re.search(r"^[ \t]*var\s+CHANGELOG\s*=\s*\[", app_src, re.M)
    if m:
        # Find matching ]
        i = m.end() - 1  # at the [
        depth = 0
        in_string = None
        j = i
        while j < len(app_src):
            c = app_src[j]
            if in_string:
                if c == in_string and app_src[j - 1] != "\\":
                    in_string = None
            else:
                if c in "\"'`":
                    in_string = c
                elif c == "[":
                    depth += 1
                elif c == "]":
                    depth -= 1
                    if depth == 0:
                        break
            j += 1
        # Use Node to evaluate this — Python regex is too brittle
        out["_changelog_raw"] = app_src[m.end() - 1 : j + 1]

    return out


def _extract_object(src: str, start: int) -> str:
    """Given src and a position pointing at 'var X = {' or 'X = {' or just '{',
    return the substring covering that brace block."""
    i = src.index("{", start)
    depth = 0
    in_string = None
    while i < len(src):
        c = src[i]
        if in_string:
            if c == in_string and src[i - 1] != "\\":
                in_string = None
        else:
            if c in "\"'`":
                in_string = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return src[start : i + 1]
        i += 1
    raise ValueError("Unterminated object")


def evaluate_changelog_via_node(raw_array_literal: str) -> list:
    """Use Node to eval the legacy CHANGELOG array literal. Returns a Python
    list of release objects. Falls back to an empty list on failure.
    """
    import subprocess, tempfile

    js = f"""
    const data = {raw_array_literal};
    process.stdout.write(JSON.stringify(data));
    """
    try:
        r = subprocess.run(
            ["node", "-e", js],
            capture_output=True,
            timeout=10,
            text=True,
        )
        if r.returncode != 0:
            print("  WARN: changelog eval failed:", r.stderr[:200], file=sys.stderr)
            return []
        return json.loads(r.stdout)
    except Exception as e:
        print("  WARN: changelog eval exception:", e, file=sys.stderr)
        return []


def convert_archive(version: str, dry_run: bool = False) -> int:
    arch = REPO_ROOT / "uds-docs" / "versions" / version
    if not arch.exists():
        print(f"versions/{version}/ not found")
        return 1

    uds = arch / "uds"
    if not uds.exists():
        print(f"versions/{version}/uds/ not found — nothing to convert")
        return 1

    # Already converted? Check for sentinel
    if (uds / "components.json").exists():
        print(f"versions/{version}/uds/components.json already exists — already converted")
        return 0

    # 1. Read frozen content/<id>.json files
    content_dir = arch / "content"
    spec_files = {}
    if content_dir.exists():
        for p in content_dir.glob("*.json"):
            try:
                spec_files[p.stem] = json.loads(p.read_text())
            except Exception as e:
                print(f"  WARN: invalid {p}: {e}")

    # 2. Read frozen app.js for status, figma, changelog
    app_path = arch / "app.js"
    parsed = {"status": {}, "figma": {}, "_changelog_raw": ""}
    if app_path.exists():
        parsed = parse_old_app_js(app_path.read_text())

    changelog_releases = []
    if parsed.get("_changelog_raw"):
        changelog_releases = evaluate_changelog_via_node(parsed["_changelog_raw"])
        # Filter to releases ≤ this version
        def vkey(s):
            return tuple(int(x) if x.isdigit() else 0 for x in s.split("."))
        target_v = vkey(version)
        changelog_releases = [r for r in changelog_releases if vkey(r["version"]) <= target_v]

    # 3. Per-component dirs in versions/<X>/uds/components/<id>/
    components_dir = uds / "components"
    legacy_files = list(components_dir.iterdir())
    # Component IDs: union of CSS/JS basenames + content keys + status keys
    cids = set()
    for f in legacy_files:
        if f.is_file() and f.suffix in (".css", ".js"):
            stem = f.stem
            # special-case: tab-horizontal.css → tabs (matches Phase 6 fix)
            if stem == "tab-horizontal":
                stem = "tabs"
            cids.add(stem)
    cids.update(spec_files.keys())
    cids.update(parsed["status"].keys())
    cids.discard("schema")  # legacy schema file, not a component

    print(f"  converting {len(cids)} component IDs in versions/{version}/")

    written = 0
    for cid in sorted(cids):
        cdir = components_dir / cid
        if dry_run:
            print(f"    DRY {cid}")
            continue
        cdir.mkdir(parents=True, exist_ok=True)

        # Move CSS file
        legacy_css = components_dir / f"{cid}.css"
        if cid == "tabs":
            legacy_css_alt = components_dir / "tab-horizontal.css"
            if legacy_css_alt.exists() and not legacy_css.exists():
                legacy_css = legacy_css_alt
        if legacy_css.exists() and legacy_css.is_file():
            shutil.move(str(legacy_css), str(cdir / f"{cid}.css"))

        # Move JS file
        legacy_js = components_dir / f"{cid}.js"
        if legacy_js.exists() and legacy_js.is_file():
            shutil.move(str(legacy_js), str(cdir / f"{cid}.js"))

        # Spec
        spec = spec_files.get(cid)
        if spec is None and (legacy_css.exists() or legacy_js.exists()):
            # Minimal stub spec
            spec = {
                "component": cid,
                "title": cid.replace("-", " ").title(),
                "description": f"Archived {cid} component (UDS {version}).",
            }
        if spec:
            spec_out = {"$schema": "../../schemas/spec.schema.json"}
            spec_out.update(spec)
            # figmaPageNodeId from FIGMA_LINKS (Phase 13 field)
            page_node = parsed["figma"].get(cid)
            if page_node:
                spec_out["figmaPageNodeId"] = page_node
            (cdir / "spec.json").write_text(json.dumps(spec_out, indent=2) + "\n")

        # Status
        st = parsed["status"].get(cid)
        if st:
            status_out = {
                "$schema": "../../schemas/status.schema.json",
                "current": st["status"],
                "since": st["since"],
                "history": [{"version": st["since"], "status": st["status"]}],
            }
            (cdir / "status.json").write_text(json.dumps(status_out, indent=2) + "\n")

        # Changelog — handle both modern (globalNotes/components) and legacy
        # (flat changes[]) release shapes.
        entries = []
        for rel in changelog_releases:
            for c in rel.get("components", []):
                entry_cid = str(c.get("component", "")).lower().replace(" ", "-")
                if entry_cid != cid:
                    continue
                entries.append({
                    "version": rel["version"],
                    "type": c.get("type", "added"),
                    "text": c.get("text", ""),
                })
            for ch in rel.get("changes", []):
                if not ch.get("component"):
                    continue
                entry_cid = str(ch["component"]).lower().replace(" ", "-")
                if entry_cid != cid:
                    continue
                entries.append({
                    "version": rel["version"],
                    "type": ch.get("type", "added"),
                    "text": ch.get("text", ""),
                })
        if entries or st:
            cl_out = {
                "$schema": "../../schemas/changelog.schema.json",
                "addedIn": st["since"] if st else (entries[0]["version"] if entries else version),
                "entries": entries,
            }
            (cdir / "changelog.json").write_text(json.dumps(cl_out, indent=2) + "\n")

        written += 1

    # 4. Generate components.json manifest
    if not dry_run:
        manifest_components = []
        for cdir in sorted(components_dir.iterdir()):
            if not cdir.is_dir():
                continue
            spec_p = cdir / "spec.json"
            status_p = cdir / "status.json"
            if not (spec_p.exists() and status_p.exists()):
                continue
            spec = json.loads(spec_p.read_text())
            status = json.loads(status_p.read_text())
            manifest_components.append({
                "id": spec.get("component", cdir.name),
                "title": spec.get("title", cdir.name),
                "since": status.get("since", "0.0"),
            })
        manifest_components.sort(key=lambda c: (
            tuple(int(x) if x.isdigit() else 0 for x in c["since"].split(".")),
            c["id"],
        ))
        (uds / "components.json").write_text(json.dumps({
            "$schema": "./schemas/components-manifest.schema.json",
            "components": manifest_components,
        }, indent=2) + "\n")
        print(f"  wrote components.json: {len(manifest_components)} components")

    # 5. version.json
    if not dry_run:
        (uds / "version.json").write_text(json.dumps({
            "$schema": "./schemas/version.schema.json",
            "version": version,
            "released": "2026-04-15" if version == "0.2" else "unknown",
            "schemaVersion": "1.0",
        }, indent=2) + "\n")

    # 6. Aggregated CHANGELOG.json from frozen CHANGELOG (releases ≤ this version)
    # Modern shape: { version, date, globalNotes: [...], byComponent: { Title: [{type,text}, ...] } }
    # Legacy app.js uses a flat `changes: [{type, category, component, text}]`
    # array per release; we group entries with component set by component
    # title (preserving case).
    if not dry_run and changelog_releases:
        agg = []
        for rel in changelog_releases:
            global_notes = []
            by_component: dict = {}
            # Modern shape (already split)
            if "globalNotes" in rel or "byComponent" in rel:
                global_notes = [
                    {"type": g.get("type", "added"), "text": g.get("text", "")}
                    for g in rel.get("globalNotes", [])
                ]
                by_component = rel.get("byComponent", {}) or {}
            # Legacy flat shape
            elif "changes" in rel:
                for ch in rel["changes"]:
                    if ch.get("component"):
                        title = str(ch["component"])
                        by_component.setdefault(title, []).append({
                            "type": ch.get("type", "added"),
                            "text": ch.get("text", ""),
                        })
                    else:
                        global_notes.append({
                            "type": ch.get("type", "added"),
                            "text": ch.get("text", ""),
                        })
            agg.append({
                "version": rel["version"],
                "date": rel.get("date", ""),
                "globalNotes": global_notes,
                "byComponent": by_component,
            })
        (uds / "CHANGELOG.json").write_text(json.dumps(agg, indent=2) + "\n")
        total_comp = sum(sum(len(v) for v in r["byComponent"].values()) for r in agg)
        print(f"  wrote CHANGELOG.json: {len(agg)} releases, "
              f"{sum(len(r['globalNotes']) for r in agg)} global notes, "
              f"{total_comp} component entries across "
              f"{sum(len(r['byComponent']) for r in agg)} component groups")

    # 7. Delete the frozen full-site files we no longer need
    if not dry_run:
        for victim in ["index.html", "app.js", "bump-site.sh", "demo-builder.js",
                       "material-icons.js", "ai-context.json", "version.txt",
                       "uds-design-system.mdc", "content"]:
            p = arch / victim
            if p.exists():
                if p.is_dir():
                    shutil.rmtree(p)
                else:
                    p.unlink()
                print(f"  removed {p.relative_to(REPO_ROOT)}")

    print(f"  converted {written} components in versions/{version}/")
    return 0


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        print("usage: convert-archive.sh <version> [--dry-run]")
        return 1
    version = argv[0]
    dry_run = "--dry-run" in argv
    return convert_archive(version, dry_run=dry_run)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
