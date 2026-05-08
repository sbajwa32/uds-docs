"""Splits the docs-page Examples panel for one component into per-variant files.

Contract per the migration plan:
  - Each <div class="sg-subsection"> inside <div data-tab-panel="examples">
    becomes one example HTML file.
  - The <h3 class="sg-subsection-title"> inside that subsection becomes the
    manifest's `label`.
  - The first <p class="sg-subsection-desc"> becomes `description`.
  - Code inside <details class="sg-example-code"> is stripped from the example
    file (it gets regenerated at render time from the example file itself).
  - The remaining HTML inside the subsection (preview wrappers, prose
    headings, etc.) is preserved as the example's body — minus those code
    details.
  - One generated manifest.json that lists every example, in the order they
    appeared on the page.

Default settings on each manifest entry:
  - showInDocs: true
  - demoWeight: based on whether this is the first / only example (3) or
    a later variant (1). Phase 6 will let me tune these per-component.
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restructure_lib as rl


def _slug(s: str) -> str:
    return rl.slugify(s) or "example"


class _SubsectionExtractor(HTMLParser):
    """Walks <div data-tab-panel="examples">...</div> looking for top-level
    <div class="sg-subsection"> blocks. Collects (label, description, body) tuples.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.subsections: list[tuple[str, str, str]] = []
        self._depth_in_sub = 0
        self._buf: list[str] = []
        self._raw_buf: list[str] = []
        self._in_title = False
        self._title = ""
        self._in_desc = False
        self._desc = ""
        self._in_code_details = 0  # nested depth inside sg-example-code
        self._in_show_code_summary = 0

    def handle_starttag(self, tag, attrs):
        attrs_d = dict(attrs)
        cls = attrs_d.get("class", "")
        cls_set = set(cls.split())

        if tag == "div" and "sg-subsection" in cls_set and self._depth_in_sub == 0:
            self._depth_in_sub = 1
            self._buf = []
            self._title = ""
            self._desc = ""
            return
        if self._depth_in_sub == 0:
            return
        if tag == "div":
            self._depth_in_sub += 1

        if (
            tag == "h3"
            and "sg-subsection-title" in cls_set
            and not self._title
            and not self._in_code_details
        ):
            self._in_title = True
            return
        if (
            tag == "p"
            and "sg-subsection-desc" in cls_set
            and not self._desc
            and not self._in_code_details
        ):
            self._in_desc = True
            return
        if tag == "details" and "sg-example-code" in cls_set:
            self._in_code_details += 1
            return
        if self._in_code_details:
            return
        if self._in_title or self._in_desc:
            return

        self._buf.append(self._serialize_tag(tag, attrs))

    def handle_endtag(self, tag):
        if self._depth_in_sub == 0:
            return
        if tag == "div":
            self._depth_in_sub -= 1
            if self._depth_in_sub == 0:
                body = "".join(self._buf).strip()
                self.subsections.append(
                    (self._title.strip(), self._desc.strip(), body)
                )
                return

        if self._in_code_details:
            if tag == "details":
                self._in_code_details -= 1
            return
        if self._in_title and tag == "h3":
            self._in_title = False
            return
        if self._in_desc and tag == "p":
            self._in_desc = False
            return
        if self._in_title or self._in_desc:
            return

        self._buf.append(f"</{tag}>")

    def handle_startendtag(self, tag, attrs):
        if self._depth_in_sub == 0 or self._in_code_details or self._in_title or self._in_desc:
            return
        self._buf.append(self._serialize_tag(tag, attrs, self_closing=True))

    def handle_data(self, data):
        if self._depth_in_sub == 0:
            return
        if self._in_code_details:
            return
        if self._in_title:
            self._title += data
            return
        if self._in_desc:
            self._desc += data
            return
        self._buf.append(data)

    def handle_entityref(self, name):
        if self._depth_in_sub == 0:
            return
        if self._in_code_details:
            return
        if self._in_title:
            self._title += f"&{name};"
            return
        if self._in_desc:
            self._desc += f"&{name};"
            return
        self._buf.append(f"&{name};")

    def handle_charref(self, name):
        if self._depth_in_sub == 0:
            return
        if self._in_code_details:
            return
        if self._in_title:
            self._title += f"&#{name};"
            return
        if self._in_desc:
            self._desc += f"&#{name};"
            return
        self._buf.append(f"&#{name};")

    def handle_comment(self, data):
        if self._depth_in_sub == 0 or self._in_code_details:
            return
        if self._in_title or self._in_desc:
            return
        self._buf.append(f"<!--{data}-->")

    @staticmethod
    def _serialize_tag(tag: str, attrs: list[tuple[str, str]], self_closing: bool = False) -> str:
        parts = [f"<{tag}"]
        for name, val in attrs:
            if val is None:
                parts.append(f" {name}")
            else:
                escaped = val.replace('"', "&quot;")
                parts.append(f' {name}="{escaped}"')
        parts.append(" />" if self_closing else ">")
        return "".join(parts)


def extract(comp_id: str, dry_run: bool = False) -> dict:
    html = rl.read_index_html()
    page_block = rl.get_data_page_block(html, comp_id)
    if page_block is None:
        rl.die(f"No <div data-page=\"{comp_id}\"> block found in index.html")
    examples_inner = rl.get_examples_panel(page_block)
    if examples_inner is None:
        rl.die(f"No examples panel found inside data-page=\"{comp_id}\"")

    parser = _SubsectionExtractor()
    parser.feed(examples_inner)
    parser.close()

    subs = parser.subsections
    if not subs:
        # Component without subsections — wrap the entire panel as a single 'default' example,
        # stripping any code-details blocks first.
        body = re.sub(
            r"<details[^>]*class=\"[^\"]*sg-example-code[^\"]*\"[^>]*>.*?</details>",
            "",
            examples_inner,
            flags=re.S,
        ).strip()
        subs = [("Default", "", body)]

    out_dir = rl.NEW_COMPONENTS_DIR / comp_id / "examples"

    examples_meta: list[dict] = []
    used_ids: set[str] = set()
    for idx, (label, desc, body) in enumerate(subs):
        eid = _slug(label) or f"example-{idx + 1}"
        # Disambiguate if duplicate
        base = eid
        n = 2
        while eid in used_ids:
            eid = f"{base}-{n}"
            n += 1
        used_ids.add(eid)

        entry = {
            "id": eid,
            "file": f"{eid}.html",
            "label": label or rl.id_to_title(eid),
            "showInDocs": True,
            "demoWeight": 3 if idx == 0 else 1,
        }
        if desc:
            entry["description"] = desc
        examples_meta.append(entry)

        if not dry_run:
            out_dir.mkdir(parents=True, exist_ok=True)
            (out_dir / f"{eid}.html").write_text(body + ("\n" if not body.endswith("\n") else ""))

    manifest = {
        "$schema": "../../../schemas/manifest.schema.json",
        "examples": examples_meta,
    }
    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    return {"count": len(examples_meta), "examples": examples_meta, "outDir": str(out_dir)}


def main():
    if len(sys.argv) < 2:
        rl.die("Usage: extract-examples.sh <component-id> [--dry-run]")
    comp_id = sys.argv[1]
    dry_run = "--dry-run" in sys.argv[2:]

    result = extract(comp_id, dry_run=dry_run)
    print(f"{'(dry-run) ' if dry_run else ''}Extracted {result['count']} example(s) for '{comp_id}':")
    for e in result["examples"]:
        size_note = f" (showInDocs={e['showInDocs']}, demoWeight={e['demoWeight']})"
        print(f"  - {e['id']}.html  '{e['label']}'{size_note}")
    if not dry_run:
        print(f"  -> {result['outDir']}")


if __name__ == "__main__":
    main()
