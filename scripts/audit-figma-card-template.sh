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
BUILDER_INVENTORY=".cursor/skills/figma-component-card/references/build-card-inventory.js"
BUILDER_A=".cursor/skills/figma-component-card/references/build-card-sections-A.js"
BUILDER_B=".cursor/skills/figma-component-card/references/build-card-sections-B.js"
BUILDER_WORKSPACE=".cursor/skills/figma-component-card/references/build-workspace-card.js"

for f in "$SNAPSHOT" "$BUILDER_INVENTORY" "$BUILDER_A" "$BUILDER_B" "$BUILDER_WORKSPACE"; do
  if [ ! -f "$f" ]; then
    echo "FAIL — missing $f" >&2
    exit 1
  fi
done

# Each builder script must fit under the use_figma `code` parameter limit
# (50,000 chars per the JSON schema returned by GetMcpTools). With BATCH
# config injected at the top, the practical ceiling is closer to 48k per
# script. Fail the audit if any phase has crept above that — that's what
# triggered the original four-phase split.
SIZE_LIMIT=48000
for f in "$BUILDER_INVENTORY" "$BUILDER_A" "$BUILDER_B" "$BUILDER_WORKSPACE"; do
  size=$(wc -c < "$f")
  if [ "$size" -gt "$SIZE_LIMIT" ]; then
    echo "FAIL — $f is $size chars (over the $SIZE_LIMIT-char per-script ceiling)." >&2
    echo "       The use_figma 'code' parameter caps at 50,000 chars; split" >&2
    echo "       further or extract more shared helpers if you need to add" >&2
    echo "       more logic. See SKILL.md \"The build recipe\" section for" >&2
    echo "       the four-phase architecture rationale." >&2
    exit 1
  fi
done

errors=0
checks=0

# check_substring "human description" "literal substring (not regex)" "FILE"
check_substring() {
  local description="$1"
  local needle="$2"
  local file="$3"
  checks=$((checks + 1))
  if ! grep -F -- "$needle" "$file" >/dev/null 2>&1; then
    echo "FAIL: $description" >&2
    echo "  Expected to find this literal in $file:" >&2
    echo "    $needle" >&2
    errors=$((errors + 1))
  fi
}

# Outer wrapper rounded — drift #3 from the card rollout report.
# (Outer wrapper is created in phase 1b-A; helpers extracted to setRadii.)
check_substring \
  "Outer udc-<id>-page wrapper binds cornerRadius to V.radius.xl (phase 1b-A)" \
  "setRadii(outer, V.radius.xl)" \
  "$BUILDER_A"

# VARIANTS row HORIZONTAL — drift #1. Lives in phase 1b-A.
check_substring \
  "VARIANTS row created HORIZONTAL (not VERTICAL) (phase 1b-A)" \
  "createAutoLayout('HORIZONTAL', { name: 'variants-row'" \
  "$BUILDER_A"

# SUB-COMPONENTS row HORIZONTAL — drift #2. Lives in phase 1b-B.
check_substring \
  "SUB-COMPONENTS row created HORIZONTAL with name subs-row (phase 1b-B)" \
  "createAutoLayout('HORIZONTAL', { name: 'subs-row'" \
  "$BUILDER_B"

# Stage corner radii bind to V.radius.md — drift #4. The setRadii helper is
# defined in BOTH 1b-A and 1b-B; the stages are created in both files.
check_substring \
  "VARIANTS stages bind cornerRadius to V.radius.md (12) (phase 1b-A)" \
  "setRadii(stage, V.radius.md)" \
  "$BUILDER_A"
check_substring \
  "SUB-COMPONENTS stages bind cornerRadius to V.radius.md (12) (phase 1b-B)" \
  "setRadii(stage, V.radius.md)" \
  "$BUILDER_B"

# ANATOMY state cells bind to V.radius.md — drift #4 (continued). Lives in 1b-A.
check_substring \
  "ANATOMY state cells bind cornerRadius to V.radius.md (12) (phase 1b-A)" \
  "setRadii(cell, V.radius.md)" \
  "$BUILDER_A"

# keyboard-table bound to V.radius.lg — drift #6 from the report. Lives in 1b-B.
check_substring \
  "keyboard-table binds cornerRadius to V.radius.lg (16) (phase 1b-B)" \
  "setRadii(table, V.radius.lg)" \
  "$BUILDER_B"

# Section text — drift #5. VARIANTS in 1b-A, SUB-COMPONENTS + ANATOMY in 1b-A and 1b-B respectively.
check_substring \
  "VARIANTS section title is 'Variant matrix' (phase 1b-A)" \
  "'Variant matrix'" \
  "$BUILDER_A"
check_substring \
  "VARIANTS section description matches _TEMPLATE (phase 1b-A)" \
  "Each variant shows the full state matrix" \
  "$BUILDER_A"
check_substring \
  "SUB-COMPONENTS section title is 'Component groups' (phase 1b-B)" \
  "'Component groups'" \
  "$BUILDER_B"
check_substring \
  "SUB-COMPONENTS section description matches _TEMPLATE (phase 1b-B)" \
  "Sub-component sets that compose with the primary set" \
  "$BUILDER_B"
check_substring \
  "ANATOMY section description matches _TEMPLATE (phase 1b-A)" \
  "Interaction states for the primary medium variant" \
  "$BUILDER_A"

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
  echo "  One of the four phase scripts no longer emits a value that the" >&2
  echo "  canonical _TEMPLATE page expects (per" >&2
  echo "  .cursor/figma/state/card-template.snapshot.json). The phase that" >&2
  echo "  owns each section is named in the failure messages above." >&2
  echo "" >&2
  echo "How to fix:" >&2
  echo "  - If the BUILDER is wrong: update the named phase script in" >&2
  echo "    .cursor/skills/figma-component-card/references/ so the failing" >&2
  echo "    substring(s) are present, then re-run this audit." >&2
  echo "  - If the TEMPLATE actually changed: re-read the _TEMPLATE page" >&2
  echo "    (node 7481:14) via use_figma, update card-template.snapshot.json," >&2
  echo "    update this audit script's check_substring lines, AND update the" >&2
  echo "    relevant phase scripts to emit the new values." >&2
  echo "" >&2
  echo "Background: .cursor/skills/figma-component-card/references/card-rollout-drift-report.md" >&2
  exit 1
fi

echo "OK — $checks check(s) passed across the four phase scripts; recipe matches card-template.snapshot.json (_TEMPLATE page 7481:14)."
