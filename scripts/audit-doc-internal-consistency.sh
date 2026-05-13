#!/usr/bin/env bash
# audit-doc-internal-consistency.sh [<component-id>]
#
# Per-component internal-coherence audit. Designed as the SAFETY NET for
# partial cleanups after a Figma deletion: catches the case where some
# doc-side artifacts get removed (e.g. examples and CSS) but other
# artifacts that reference them are left dangling (e.g. spec events
# without a JS dispatcher, impl.json tokens that no longer exist, CSS
# classes nothing references).
#
# The PRIMARY deletion detector is the figma-component-inspector's
# "Doc-site surplus" pass (read against Figma). This audit is the
# read-against-the-repo backstop that catches what partial cleanups
# leave behind.
#
# Five checks, all enforceable against structured data:
#   1. Every .udc-<id>* selector in <id>.css must appear in at least one of:
#        examples/*.html, impl.json html, playground.js render, the
#        Code-tab API table in index.html.
#   2. Every event in spec.json events[] must be dispatched somewhere in
#        <id>.js OR flagged in spec.json knownIssues containing "spec-only".
#   3. Every --uds-* token in impl.json tokens must exist as a defined
#        custom property under uds-docs/uds/tokens/*.css.
#   4. Every component id in spec.json commonlyPairedWith[] must exist
#        in uds-docs/uds/components.json (as a real component).
#   5. Every entry in uds-docs/uds/uds.js COMPONENT_SCRIPTS must point at
#        a real per-component JS file.
#
# Baseline tolerance per scripts/audit-baseline.json
# audit-doc-internal-consistency.toleratedComponents (per-component) and
# .toleratedFindings (per-finding string for fine-grained allow-listing).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/lib/audit_doc_internal_consistency.py" "$@"
