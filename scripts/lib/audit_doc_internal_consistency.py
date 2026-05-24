"""Audit: per-component doc-side internal coherence.

The figma-component-inspector's `Doc-site surplus` pass is the PRIMARY
deletion detector (reads from Figma). This script is the doc-side
SAFETY NET: it walks each per-component folder + the orchestrator and
flags partial-cleanup drift that ships without an inspector pass.

Five checks (all enforceable from structured data):

  1. Every `.udc-<id>*` CSS selector defined in `<id>.css` must appear
     in at least one of: any `examples/*.html` (the rendered class
     attribute), `impl.json` `html`, `playground.js` `render`, or the
     Code-tab `<table class="sg-api-table">` inside
     `<div data-page="<id>">` in `uds-docs/index.html`. Catches CSS
     orphaned by example/impl/playground cleanup.

  2. Every event name in `spec.json` `events[]` must be dispatched
     somewhere in `<id>.js` (literal substring match against the event
     name string), OR explicitly excused in a `spec.json` `knownIssues`
     entry containing the literal phrase `spec-only`. Catches spec
     events left behind after the JS handler was removed.

  3. Every `--uds-*` token enumerated in `impl.json` `tokens` must exist
     as a defined custom property under `uds-docs/uds/tokens/*.css`.
     Catches stale token refs after a token rename or removal.

  4. Every component id in `spec.json` `commonlyPairedWith[]` must
     exist in `uds-docs/uds/components.json` `components[]`. Catches
     references to deleted components.

  5. Every entry in `uds-docs/uds/uds.js` `COMPONENT_SCRIPTS` array
     must point at a real per-component JS file. Catches "removed the
     file but left the loader entry."

Per-component allow-list tolerance via
`scripts/audit-baseline.json` `audit-doc-internal-consistency`:

  - `toleratedComponents` — entire component skipped. Use only when the
    pre-existing drift cannot be addressed in the current sweep.
  - `toleratedFindings` — list of literal "comp/check/finding" strings
    for fine-grained allow-listing.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parents[2]
UDS_DOCS = REPO_ROOT / "uds-docs"
COMPONENTS_DIR = UDS_DOCS / "uds" / "components"
TOKENS_DIR = UDS_DOCS / "uds" / "tokens"
API_DATA_DIR = UDS_DOCS / "data" / "component-api"
ORCHESTRATOR_JS = UDS_DOCS / "uds" / "uds.js"
COMPONENTS_JSON = UDS_DOCS / "uds" / "components.json"
BASELINE_CONFIG = REPO_ROOT / "scripts" / "audit-baseline.json"

AUDIT_KEY = "audit-doc-internal-consistency"

# DOM-native event names that don't require a CustomEvent dispatch from
# the component's JS. The spec exposes them as the contract surface, but
# the actual dispatch is the browser's job — the component just listens
# (or doesn't even need to). Treating these as missing was a false-
# positive class on platforms like Button, Text Input, Text Area, Toggle.
DOM_NATIVE_EVENTS = {
    "blur",
    "change",
    "click",
    "dblclick",
    "focus",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keypress",
    "keyup",
    "load",
    "mousedown",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerup",
    "select",
    "submit",
    "toggle",
}


# ---------------------------------------------------------------------------
# Baseline tolerance
# ---------------------------------------------------------------------------


def load_baseline() -> tuple[set[str], set[str]]:
    """Return (toleratedComponents, toleratedFindings)."""
    if not BASELINE_CONFIG.exists():
        return set(), set()
    try:
        cfg = json.loads(BASELINE_CONFIG.read_text())
    except Exception:
        return set(), set()
    block = cfg.get(AUDIT_KEY, {}) or {}
    return (
        set(block.get("toleratedComponents", []) or []),
        set(block.get("toleratedFindings", []) or []),
    )


# ---------------------------------------------------------------------------
# CSS / HTML parsing helpers
# ---------------------------------------------------------------------------

_COMMENT_RE = re.compile(r"/\*[\s\S]*?\*/")
_UDC_SELECTOR_RE = re.compile(r"\.udc-[a-zA-Z0-9_-]+")


def strip_css_comments(text: str) -> str:
    return _COMMENT_RE.sub("", text)


def extract_component_css_selectors(css_path: Path, comp_id: str) -> set[str]:
    """Return the set of bare `.udc-<comp_id>*` CSS classes defined in the
    component's CSS file. Attribute selectors and pseudo-classes are
    stripped so the result is the bare class form (e.g. `.udc-nav-bento`,
    not `.udc-nav-bento[data-open="true"]`).

    Component-internal "tail" subclasses are included: for `nav-header`,
    that means `.udc-nav-bento`, `.udc-nav-logo`, `.udc-nav-title-area`,
    etc. — i.e. anything in the file's own CSS namespace family.
    """
    text = strip_css_comments(css_path.read_text())
    found: set[str] = set()
    for m in _UDC_SELECTOR_RE.finditer(text):
        sel = m.group(0)
        if _belongs_to_component(sel, comp_id):
            found.add(sel)
    return found


def _belongs_to_component(selector: str, comp_id: str) -> bool:
    """Mirror of audit-css-api-table.sh `belongs_to`. Decide whether
    `.udc-<rest>` is owned by `comp_id`'s CSS file.

    A selector belongs if its `.udc-<rest>` rest starts with the
    component id (exact, or followed by `__`, `--`, or `-`). Family
    fallback: nav-header owns `.udc-nav-*` (logo, bento, search, mywork,
    account, tile, title-area, button).
    """
    s = selector.lstrip(".")
    if not s.startswith("udc-"):
        return False
    name = s[4:]
    prefixes = {comp_id}
    if comp_id.startswith("nav-"):
        prefixes.add("nav-")
    for p in prefixes:
        if name == p:
            return True
        if name.startswith(p + "__") or name.startswith(p + "--") or name.startswith(p + "-"):
            return True
    return False


def selector_appears_in(haystacks: Iterable[str], selector: str) -> bool:
    """Match `selector` (bare class like `.udc-nav-bento` or
    `udc-nav-bento`) inside any of the haystacks.

    Examples have `class="udc-foo"`; impl.json/playground.js have
    `'udc-foo'` or `"udc-foo"` or `\\.udc-foo`; index.html API tables
    have `<code>.udc-foo</code>`.
    """
    bare = selector.lstrip(".")
    bare_dot = "." + bare
    for h in haystacks:
        if not h:
            continue
        # Quick wins
        if bare_dot in h or bare in h:
            return True
    return False


# ---------------------------------------------------------------------------
# Code-tab API data extraction
#
# Pre-migration the API table content lived inline in `index.html` as
# <table class="sg-api-table"> blocks. Chunk 07 of the Next.js
# migration extracted that into typed TS data files; Chunk 15 (this
# file's update) repointed both audits at the new files so the
# `index.html` deletion in Chunk 17 doesn't break the audit.
# ---------------------------------------------------------------------------


def extract_api_data_text_for(comp_id: str) -> str:
    """Return the text of the `cssClasses` array in
    uds-docs/data/component-api/<id>.ts. Empty string if no file or no
    cssClasses array (e.g. raw-HTML fallback components).

    The audit uses `selector_appears_in` on this text to detect whether
    a given CSS selector is referenced in the API data, so returning
    the raw TS array text is sufficient — no need to parse out
    individual entries.
    """
    api_path = API_DATA_DIR / f"{comp_id}.ts"
    if not api_path.exists():
        return ""
    text = api_path.read_text()
    m = re.search(r"cssClasses\s*:\s*\[(.*?)\]", text, re.DOTALL)
    return m.group(1) if m else ""


# ---------------------------------------------------------------------------
# Token CSS index
# ---------------------------------------------------------------------------


_TOKEN_DEF_RE = re.compile(r"(--uds-[a-zA-Z0-9_-]+)\s*:")


def build_defined_token_set() -> set[str]:
    """Return the set of every `--uds-*` custom property declared
    anywhere in `uds-docs/uds/tokens/*.css`.
    """
    out: set[str] = set()
    if not TOKENS_DIR.exists():
        return out
    for css in TOKENS_DIR.rglob("*.css"):
        text = strip_css_comments(css.read_text())
        for m in _TOKEN_DEF_RE.finditer(text):
            out.add(m.group(1))
    return out


# ---------------------------------------------------------------------------
# Orchestrator parsing
# ---------------------------------------------------------------------------


_COMP_SCRIPT_ENTRY_RE = re.compile(
    r"['\"](components/[^'\"]+\.js)['\"]"
)


def extract_component_scripts(orch_text: str) -> list[str]:
    """Return the ordered list of paths inside `var COMPONENT_SCRIPTS = [...]`.

    Falls back to a broad regex match across the file if the variable
    block can't be isolated.
    """
    m = re.search(r"COMPONENT_SCRIPTS\s*=\s*\[(.*?)\]\s*;", orch_text, re.S)
    block = m.group(1) if m else orch_text
    return [m.group(1) for m in _COMP_SCRIPT_ENTRY_RE.finditer(block)]


# ---------------------------------------------------------------------------
# Per-component checks
# ---------------------------------------------------------------------------


def audit_component(
    comp_id: str,
    *,
    api_table_text: str,
    defined_tokens: set[str],
    known_components: set[str],
) -> list[str]:
    cdir = COMPONENTS_DIR / comp_id
    findings: list[str] = []

    css_path = cdir / f"{comp_id}.css"
    js_path = cdir / f"{comp_id}.js"
    spec_path = cdir / "spec.json"
    impl_path = cdir / "impl.json"
    playground_path = cdir / "playground.js"
    examples_dir = cdir / "examples"

    spec: dict = {}
    if spec_path.exists():
        try:
            spec = json.loads(spec_path.read_text())
        except Exception as exc:
            findings.append(f"{comp_id}/spec/invalid-json: {exc}")
            spec = {}

    impl: dict = {}
    if impl_path.exists():
        try:
            impl = json.loads(impl_path.read_text())
        except Exception as exc:
            findings.append(f"{comp_id}/impl/invalid-json: {exc}")
            impl = {}

    examples_text_blobs: list[str] = []
    if examples_dir.exists():
        for f in sorted(examples_dir.glob("*.html")):
            examples_text_blobs.append(f.read_text())

    impl_html = impl.get("html", "") if isinstance(impl, dict) else ""
    playground_text = playground_path.read_text() if playground_path.exists() else ""

    # ---------- Check 1: orphan CSS selectors ----------
    if css_path.exists():
        css_selectors = extract_component_css_selectors(css_path, comp_id)
        haystacks = [*examples_text_blobs, impl_html, playground_text, api_table_text]
        for sel in sorted(css_selectors):
            if not selector_appears_in(haystacks, sel):
                findings.append(
                    f"{comp_id}/css-orphan/{sel}: defined in {comp_id}.css but "
                    "absent from examples, impl.json html, playground.js render, "
                    "and the Code-tab API table"
                )

    # ---------- Check 2: spec events must be dispatched or excused ----------
    events = (spec.get("events") or []) if isinstance(spec, dict) else []
    js_text = js_path.read_text() if js_path.exists() else ""
    known_issues = (spec.get("knownIssues") or []) if isinstance(spec, dict) else []
    spec_only_excused = " ".join(known_issues).lower()
    for ev in events:
        name = ev.get("name") if isinstance(ev, dict) else None
        if not name:
            continue
        # DOM-native events (click, change, blur, etc.) don't need a
        # CustomEvent dispatch from <id>.js — the browser dispatches
        # them. Auto-excuse.
        if name.lower() in DOM_NATIVE_EVENTS:
            continue
        excused = (
            "spec-only" in spec_only_excused
            and name.lower() in spec_only_excused
        ) or any(
            isinstance(i, str) and "spec-only" in i.lower() and name.lower() in i.lower()
            for i in known_issues
        )
        # Dispatched if the event name appears in <id>.js. We accept any
        # occurrence (it could be in a CustomEvent('name'), an emit
        # helper, a comment, etc.) — the audit is a presence check, not
        # a static analysis.
        dispatched = bool(name) and name in js_text
        if not dispatched and not excused:
            findings.append(
                f"{comp_id}/event-undispatched/{name}: spec.json declares "
                f"event '{name}' but it does not appear in {comp_id}.js and "
                "is not excused in spec.json knownIssues (containing 'spec-only')"
            )

    # ---------- Check 3: impl.json tokens must be defined ----------
    impl_tokens = impl.get("tokens") if isinstance(impl, dict) else None
    if isinstance(impl_tokens, dict):
        for group_name, group in impl_tokens.items():
            if not isinstance(group, list):
                continue
            for token in group:
                if not isinstance(token, str):
                    continue
                if not token.startswith("--uds-"):
                    # Tokens like radius/spacing groups may also list raw
                    # css var families; skip non-token strings.
                    continue
                if token not in defined_tokens:
                    findings.append(
                        f"{comp_id}/token-missing/{token}: impl.json tokens "
                        f"group '{group_name}' references '{token}' which is "
                        f"not defined in uds-docs/uds/tokens/*.css"
                    )

    # ---------- Check 4: commonlyPairedWith must exist ----------
    paired = (spec.get("commonlyPairedWith") or []) if isinstance(spec, dict) else []
    for ref in paired:
        if not isinstance(ref, str):
            continue
        if ref not in known_components:
            findings.append(
                f"{comp_id}/paired-missing/{ref}: spec.json commonlyPairedWith "
                f"references component '{ref}' which is not in components.json"
            )

    return findings


# ---------------------------------------------------------------------------
# Orchestrator check (run once, not per component)
# ---------------------------------------------------------------------------


def audit_orchestrator() -> list[str]:
    findings: list[str] = []
    if not ORCHESTRATOR_JS.exists():
        return [
            "uds.js/missing: uds-docs/uds/uds.js does not exist; cannot verify "
            "COMPONENT_SCRIPTS loader integrity"
        ]
    orch_text = ORCHESTRATOR_JS.read_text()
    entries = extract_component_scripts(orch_text)
    if not entries:
        findings.append(
            "uds.js/no-loader-entries: could not parse COMPONENT_SCRIPTS array — "
            "regex match failed"
        )
        return findings
    for rel in entries:
        target = UDS_DOCS / "uds" / rel
        if not target.exists():
            findings.append(
                f"uds.js/loader-orphan/{rel}: COMPONENT_SCRIPTS lists "
                f"'{rel}' but {target} does not exist"
            )
    return findings


# ---------------------------------------------------------------------------
# Components manifest
# ---------------------------------------------------------------------------


def load_known_components() -> set[str]:
    if not COMPONENTS_JSON.exists():
        return set()
    try:
        data = json.loads(COMPONENTS_JSON.read_text())
    except Exception:
        return set()
    out: set[str] = set()
    for c in data.get("components", []) or []:
        if isinstance(c, dict) and isinstance(c.get("id"), str):
            out.add(c["id"])
    return out


# ---------------------------------------------------------------------------
# Tolerance matcher
# ---------------------------------------------------------------------------


def _is_tolerated(finding: str, tolerated: set[str]) -> bool:
    """Return True if `finding` is allowed by the baseline tolerated set.

    Findings have the shape `comp/check/identifier: explanation`. The
    tolerated set holds the `comp/check/identifier` prefix (without
    the explanation). Two match modes:

    1. Exact:  the full `comp/check/identifier` string is tolerated.
    2. Prefix: an entry like `comp/check/` (trailing slash) tolerates
       every finding for that check on that component.
    """
    if not tolerated:
        return False
    key = finding.split(":", 1)[0]
    if key in tolerated:
        return True
    parts = key.split("/")
    if len(parts) >= 2:
        prefix = "/".join(parts[:2]) + "/"
        if prefix in tolerated:
            return True
    return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    args = sys.argv[1:]
    tolerated_components, tolerated_findings = load_baseline()

    if not COMPONENTS_DIR.exists():
        print("OK — no per-component folders yet (audit is a no-op pre-migration)")
        return

    if args:
        target_ids = [a for a in args if (COMPONENTS_DIR / a).is_dir()]
        missing = [a for a in args if a not in target_ids]
        if missing:
            print(
                f"WARN — requested components not present: {', '.join(missing)}",
                file=sys.stderr,
            )
    else:
        target_ids = sorted(p.name for p in COMPONENTS_DIR.iterdir() if p.is_dir())

    defined_tokens = build_defined_token_set()
    known_components = load_known_components()

    all_findings: list[str] = []
    skipped_components: list[str] = []

    for cid in target_ids:
        if cid in tolerated_components:
            skipped_components.append(cid)
            continue
        api_table_text = extract_api_data_text_for(cid)
        comp_findings = audit_component(
            cid,
            api_table_text=api_table_text,
            defined_tokens=defined_tokens,
            known_components=known_components,
        )
        for f in comp_findings:
            if _is_tolerated(f, tolerated_findings):
                continue
            all_findings.append(f)

    orch_findings = audit_orchestrator()
    for f in orch_findings:
        if _is_tolerated(f, tolerated_findings):
            continue
        all_findings.append(f)

    if all_findings:
        print("FAIL — doc-internal-consistency violations:")
        for f in sorted(all_findings):
            print(f"  - {f}")
        print("")
        print("Fix paths:")
        print("  - css-orphan/<sel>: remove the rule from <id>.css OR add it to")
        print("    an example/impl/playground/API table.")
        print("  - event-undispatched/<name>: add the dispatch to <id>.js OR add")
        print("    a knownIssues entry containing 'spec-only' AND the event name.")
        print("  - token-missing/<token>: rename the token in impl.json to a real")
        print("    one OR delete the stale token reference.")
        print("  - paired-missing/<id>: remove or correct the entry in")
        print("    spec.json commonlyPairedWith.")
        print("  - uds.js/loader-orphan/<path>: remove the entry from")
        print("    COMPONENT_SCRIPTS (and the matching UDS._initX in UDS.init).")
        print("")
        print("If a finding is intentional or pre-baseline, add it (literal")
        print("string, or `comp/check/` prefix) to scripts/audit-baseline.json")
        print(f"{AUDIT_KEY}.toleratedFindings — but only with explicit user direction.")
        sys.exit(1)

    inspected = len(target_ids) - len(skipped_components)
    print(f"OK — {inspected} component(s) internally consistent")
    if skipped_components:
        print(
            f"(Skipped {len(skipped_components)} component(s) per baseline: "
            f"{', '.join(skipped_components)})"
        )


if __name__ == "__main__":
    main()
