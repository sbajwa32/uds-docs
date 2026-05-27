"""Shared paths and helpers for current UDS audits and aggregation scripts."""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
UDS_DOCS = REPO_ROOT / "uds-docs"
NEW_COMPONENTS_DIR = UDS_DOCS / "uds" / "components"
SCHEMAS_DIR = UDS_DOCS / "uds" / "schemas"


def id_to_title(comp_id: str) -> str:
    return " ".join(p.capitalize() for p in comp_id.split("-"))


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)
