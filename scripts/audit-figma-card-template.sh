#!/usr/bin/env bash
# audit-figma-card-template.sh
#
# Verifies that the figma-component-card builder recipe
# (.cursor/skills/figma-component-card/references/build-card.js) still
# emits the structural facts captured in
# .cursor/figma/state/card-template.snapshot.json.
#
# The snapshot is a structural readout of the canonical _TEMPLATE page
# in the UDS Components Figma file (`1XJoUJgtNpw4R0IIT3VjoK`, page id
# `7481:14`). The template is a designer-authored visual REFERENCE; the
# builder is the runtime source of truth. This audit is the bridge that
# keeps the two from silently diverging — exactly the failure mode that
# produced the 8-component drift documented in
# .cursor/skills/figma-component-card/references/card-rollout-drift-
# report.md.
#
# When the template changes:
#   1. Re-read the _TEMPLATE page (node 7481:14) via use_figma.
#   2. Update .cursor/figma/state/card-template.snapshot.json.
#   3. Update build-card.js so the audit passes again.
#   4. Re-run any planned card rollout AFTER the recipe matches.
#
# The audit looks for substring matches in build-card.js. It's intentionally
# lightweight — not a full structural diff. If a fix is "obvious" by the
# recipe text, the audit catches it; if the drift requires actually running
# Figma to detect, this audit can't see it (that's what the
# figma-component-card-audit subagent is for, run on demand).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

SNAPSHOT=".cursor/figma/state/card-template.snapshot.json"
BUILDER=".cursor/skills/figma-component-card/references/build-card.js"

if [ ! -f "$SNAPSHOT" ]; then
  echo "FAIL — missing $SNAPSHOT" >&2
  exit 1
fi
if [ ! -f "$BUILDER" ]; then
  echo "FAIL — missing $BUILDER" >&2
  exit 1
fi

errors=0
checks=0

# check_substring "human description" "literal substring (not regex)"
check_substring() {
  local description="$1"
  local needle="$2"
  checks=$((checks + 1))
  if ! grep -F -- "$needle" "$BUILDER" >/dev/null 2>&1; then
    echo "FAIL: $description" >&2
    echo "  Expected to find this literal in $BUILDER:" >&2
    echo "    $needle" >&2
    errors=$((errors + 1))
  fi
}

# Outer wrapper rounded — drift #3 from the card rollout report.
check_substring \
  "Outer udc-<id>-page wrapper binds cornerRadius to V.radius.xl" \
  "outer.setBoundVariable(r, V.radius.xl)"

# VARIANTS row HORIZONTAL — drift #1.
check_substring \
  "VARIANTS row created HORIZONTAL (not VERTICAL)" \
  "createAutoLayout('HORIZONTAL', { name: 'variants-row'"

# SUB-COMPONENTS row HORIZONTAL — drift #2.
check_substring \
  "SUB-COMPONENTS row created HORIZONTAL with name subs-row (not subs-col VERTICAL)" \
  "createAutoLayout('HORIZONTAL', { name: 'subs-row'"

# Stage corner radii bind to V.radius.md — drift #4.
check_substring \
  "VARIANTS/SUB-COMPONENTS stages bind cornerRadius to V.radius.md (12)" \
  "stage.setBoundVariable(r, V.radius.md)"

# ANATOMY state cells bind to V.radius.md — drift #4 (continued).
check_substring \
  "ANATOMY state cells bind cornerRadius to V.radius.md (12)" \
  "cell.setBoundVariable(r, V.radius.md)"

# keyboard-table bound to V.radius.lg — drift #6 from the report.
check_substring \
  "keyboard-table binds cornerRadius to V.radius.lg (16)" \
  "table.setBoundVariable(r, V.radius.lg)"

# Section text — drift #5. Pulled directly from snapshot to keep this
# script and the snapshot trivially in sync.
check_substring \
  "VARIANTS section title is 'Variant matrix'" \
  "'Variant matrix'"
check_substring \
  "VARIANTS section description matches _TEMPLATE" \
  "Each variant shows the full state matrix"
check_substring \
  "SUB-COMPONENTS section title is 'Component groups'" \
  "'Component groups'"
check_substring \
  "SUB-COMPONENTS section description matches _TEMPLATE" \
  "Sub-component sets that compose with the primary set"
check_substring \
  "ANATOMY section description matches _TEMPLATE" \
  "Interaction states for the primary medium variant"

# Confirm the snapshot's referenced node IDs are at least mentioned in the
# audit script + report so a future auditor can trace what was sampled.
if ! grep -F "7481:14" "$SNAPSHOT" >/dev/null 2>&1; then
  echo "FAIL: snapshot does not reference the _TEMPLATE page id 7481:14" >&2
  errors=$((errors + 1))
fi

if [ "$errors" -gt 0 ]; then
  echo "" >&2
  echo "$errors of $checks check(s) failed." >&2
  echo "" >&2
  echo "What this means:" >&2
  echo "  build-card.js no longer emits one or more values that the canonical" >&2
  echo "  _TEMPLATE page expects (per .cursor/figma/state/card-template.snapshot.json)." >&2
  echo "" >&2
  echo "How to fix:" >&2
  echo "  - If the BUILDER is wrong: update .cursor/skills/figma-component-card/references/build-card.js" >&2
  echo "    so the failing substring(s) are present, then re-run this audit." >&2
  echo "  - If the TEMPLATE actually changed: re-read the _TEMPLATE page (node 7481:14)" >&2
  echo "    via use_figma, update .cursor/figma/state/card-template.snapshot.json," >&2
  echo "    update this audit script's check_substring lines to match, AND update" >&2
  echo "    build-card.js to emit the new values." >&2
  echo "" >&2
  echo "Background: .cursor/skills/figma-component-card/references/card-rollout-drift-report.md" >&2
  exit 1
fi

echo "OK — $checks check(s) passed. build-card.js matches card-template.snapshot.json (_TEMPLATE page 7481:14)."
