#!/bin/bash
# .cursor/hooks/factory-version-guard.sh
#
# beforeShellExecution hook. Blocks a `git commit` that includes changes to a
# FACTORY file (a file whose edits can change what the UDS component factory
# PRODUCES, per .cursor/rules/uds-factory-versioning.mdc) UNLESS that same
# commit also bumps .cursor/figma/state/factory-version.json OR the commit
# message carries a `[no-factory-bump: <reason>]` escape tag.
#
# This is the at-commit-time half of scripts/audit-factory-version-currency.sh.
# CI catches the same miss, but a red CI check is advisory — it surfaces AFTER
# the work is in and someone has to notice it. Five factory edits since the
# 2026.06.09.8 bump shipped that way: each touched a factory file, none bumped
# the version, none used the escape tag, and the CI audit stayed red while the
# commits merged past it. Moving the check to commit time forces the decision
# (bump, or declare the edit output-neutral) on the spot, where it can't be
# skipped.
#
# What it CANNOT do: decide whether an edit *actually* changed factory output —
# that's a semantic judgment. It only guarantees the question is answered every
# time: bump, or say in the message why no bump is needed.
#
# Fail-open by design: any internal error (no git, parse failure, etc.) ALLOWS
# the command. A bug in this guard must never block every shell command in the
# session. CI (scripts/audit-factory-version-currency.sh) remains the backstop
# for any commit path that doesn't run through Cursor's shell (e.g. a human
# committing in a raw terminal).

set -u

# Factory files — kept in lockstep with scripts/audit-factory-version-currency.sh
# FACTORY_PATHS and the "When to bump" globs in uds-factory-versioning.mdc.
FACTORY_PATHS=(
  ".cursor/skills/generate-uds-figma-component"
  ".cursor/rules/uds-figma-factory-quality.mdc"
  ".cursor/rules/uds-figma-plugin-api-gotchas.mdc"
  ".cursor/rules/uds-design-language.mdc"
  ".cursor/rules/uds-naming-conventions.mdc"
)
VERSION_FILE=".cursor/figma/state/factory-version.json"

# Emit an allow verdict and exit. Used for every non-blocking path, including
# all the fail-open escapes.
allow() { printf '{ "permission": "allow" }\n'; exit 0; }

# Read the hook payload (JSON with .command). We don't need to parse it: we only
# (a) detect a git commit and (b) scan for the [no-factory-bump:] tag, both of
# which are substring checks against the raw payload.
PAYLOAD="$(cat 2>/dev/null || true)"

# Fast pre-filter: only git commits are in scope. Everything else passes
# instantly with no git work.
printf '%s' "$PAYLOAD" | grep -q 'git commit' || allow

# A dry-run commit creates nothing — never block it.
printf '%s' "$PAYLOAD" | grep -q -- '--dry-run' && allow

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || allow
[ -n "$REPO_ROOT" ] || allow
cd "$REPO_ROOT" || allow

# Which factory files will this commit include? A cloud agent typically runs
# `git add -A && git commit ...` as ONE chained command, so at hook time (before
# the chain runs) nothing is staged yet. Inspect BOTH staged and unstaged
# changes — anything dirty gets swept into an `add -A` / `commit -a`.
#
# `-uall` lists every untracked file individually. Without it, git collapses a
# wholly-untracked directory to its top entry (`?? .cursor/`), which would hide
# a brand-new factory file from the path match below.
DIRTY="$(git status --porcelain -uall 2>/dev/null || true)"
[ -n "$DIRTY" ] || allow

changed_factory=()
for path in "${FACTORY_PATHS[@]}"; do
  if printf '%s\n' "$DIRTY" | grep -Fq "$path"; then
    changed_factory+=("$path")
  fi
done

# No factory file in the change set → nothing to enforce.
[ ${#changed_factory[@]} -gt 0 ] || allow

# Bump signal #1 — factory-version.json is also dirty (it'll be committed too).
printf '%s\n' "$DIRTY" | grep -Fq "$VERSION_FILE" && allow

# Bump signal #2 — the commit message carries the explicit output-neutral escape.
printf '%s' "$PAYLOAD" | grep -q '\[no-factory-bump:' && allow

# Neither signal present → block and explain exactly how to proceed.
changed_list=""
for f in "${changed_factory[@]}"; do
  changed_list="${changed_list}\n  - ${f}"
done

agent_msg="BLOCKED by factory-version-guard: this commit changes a UDS factory file but neither bumps the factory build version nor declares the edit output-neutral.\n\nFactory files in this change set:${changed_list}\n\nDo ONE of these, then re-commit:\n  1. Edit changes what the factory PRODUCES (new/changed Phase C gate, construction pattern, default, contract section, variant convention): bump ${VERSION_FILE} — fresh YYYY.MM.DD.N + a newest-first changelog entry per .cursor/rules/uds-factory-versioning.mdc — and stage it in THIS commit.\n  2. Edit is output-neutral (prose, typo, reorder, audit/process-only): add '[no-factory-bump: <reason>]' to the commit message.\n\nSame contract as scripts/audit-factory-version-currency.sh, enforced at commit time."

user_msg="A UDS factory rule changed without a factory build-version bump. Either bump .cursor/figma/state/factory-version.json in this commit, or add a [no-factory-bump: <reason>] tag to the commit message, then re-commit."

# Encode the (multi-line) messages safely. python3 is the repo's hook-env
# dependency (see .cursor/hooks/sync-check.sh).
python3 -c '
import json, sys
print(json.dumps({
    "permission": "deny",
    "agent_message": sys.argv[1],
    "user_message": sys.argv[2],
}))
' "$(printf '%b' "$agent_msg")" "$user_msg" 2>/dev/null || {
  # python3 unavailable for some reason — still block, with a single-line message.
  printf '{ "permission": "deny", "user_message": "%s" }\n' "$user_msg"
}
exit 0
