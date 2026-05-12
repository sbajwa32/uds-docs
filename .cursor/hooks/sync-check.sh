#!/bin/bash
# .cursor/hooks/sync-check.sh
#
# sessionStart hook for the UDS docs repo. Detects whether the local
# repo is behind origin/main (the typical cloud↔local drift case) and
# surfaces it to the agent through TWO paths:
#
# 1. Writes .cursor/state/sync-status.json — the CANONICAL source of
#    truth that the Phase 1 preflight rule reads explicitly. Always
#    overwritten on each session, even when in sync, so agents and
#    rules can detect a stale file by its mtime if needed.
#
# 2. Emits a JSON response with `additional_context` per Cursor's
#    documented sessionStart hook output schema. This is best-effort
#    only — Cursor forum threads have reported that additional_context
#    isn't always injected into the agent's initial context window
#    for sessionStart, so we never rely on it alone.
#
# The state file is the safety net. Even if Cursor's context injection
# silently no-ops, the state file is on disk and the rule mandates
# reading it before any other work.
#
# Reads JSON from stdin per Cursor's hook contract (session_id,
# is_background_agent, composer_mode). Always emits valid JSON on
# stdout so the hook runtime doesn't crash with a parse error.
#
# Fail-open: if git or the network is unreachable, this hook exits
# successfully with a state file marked status="unknown" and no
# additional_context, rather than blocking session start.

set -u

# Drain stdin (don't actually need the input — sessionStart sends
# session_id, is_background_agent, composer_mode — but reading + discarding
# avoids SIGPIPE complaints from the runtime).
HOOK_STDIN="$(cat 2>/dev/null || true)"

# ----- helpers -----

# Emit a JSON response on stdout per Cursor's sessionStart output schema.
# $1 = additional_context string (may be empty for "no warning").
emit_response() {
  python3 -c '
import json, sys
ctx = sys.argv[1] if len(sys.argv) > 1 else ""
out = {}
if ctx:
    out["additional_context"] = ctx
print(json.dumps(out))
' "$1"
  exit 0
}

# Write the canonical state file. Arguments are JSON-safe via python3.
# $1=status (in_sync|behind|ahead|diverged|unknown|no_upstream|not_a_repo)
# $2=behind count (int as string)
# $3=ahead count (int as string)
# $4=upstream ref (e.g. origin/main)
# $5=missing commit subjects (newline-separated string; may be empty)
# $6=touched_toolchain count (int as string)
# $7=human-readable summary
# $8=recommended pull command (string, may be empty)
write_state() {
  python3 -c '
import json, os, sys, datetime
status, behind, ahead, upstream, subjects, touched, summary, pull_cmd = sys.argv[1:9]
state_dir = ".cursor/state"
os.makedirs(state_dir, exist_ok=True)
payload = {
    "schemaVersion": 1,
    "writtenAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "status": status,
    "behind": int(behind) if behind.isdigit() else 0,
    "ahead": int(ahead) if ahead.isdigit() else 0,
    "upstream": upstream,
    "missingCommits": [s for s in subjects.split("\n") if s.strip()],
    "toolchainFilesTouched": int(touched) if touched.isdigit() else 0,
    "summary": summary,
    "recommendedPull": pull_cmd,
}
with open(os.path.join(state_dir, "sync-status.json"), "w") as f:
    json.dump(payload, f, indent=2, sort_keys=True)
    f.write("\n")
' "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8"
}

# ----- main -----

# Resolve repo root robustly. Cursor runs project hooks from the
# project root, but be defensive.
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  emit_response ""
fi
cd "$REPO_ROOT" || emit_response ""

# Skip on background-agent sessions: those run on fresh clones from a
# specific commit and aren't meaningfully "behind."
if printf '%s' "$HOOK_STDIN" | grep -q '"is_background_agent": *true'; then
  write_state "background_agent" "0" "0" "" "" "0" "Background agent session — sync check skipped." ""
  emit_response ""
fi

# Best-effort fetch. Capped by the hook's `timeout` in hooks.json.
# Failure (offline, auth) → state=unknown, fail-open.
# UDS_HOOK_SKIP_FETCH=1 skips the fetch — useful for offline testing
# and for verifying the behind-detection path against a fabricated
# upstream without the network round-trip undoing the fixture.
if [ "${UDS_HOOK_SKIP_FETCH:-0}" != "1" ]; then
  if ! git fetch --quiet origin main 2>/dev/null; then
    write_state "unknown" "0" "0" "origin/main" "" "0" "git fetch failed (offline or auth issue) — sync state unknown. Run 'git fetch && git status -sb' manually." ""
    emit_response ""
  fi
fi

# Determine the upstream we're comparing against. Prefer the configured
# upstream of the current branch; fall back to origin/main.
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"
if [ -z "$UPSTREAM" ]; then
  UPSTREAM="origin/main"
fi

# Verify the upstream actually exists.
if ! git rev-parse --verify --quiet "$UPSTREAM" >/dev/null; then
  write_state "no_upstream" "0" "0" "$UPSTREAM" "" "0" "Upstream $UPSTREAM not found. No sync comparison possible." ""
  emit_response ""
fi

BEHIND="$(git rev-list --count HEAD.."$UPSTREAM" 2>/dev/null || echo 0)"
AHEAD="$(git rev-list --count "$UPSTREAM"..HEAD 2>/dev/null || echo 0)"

# Determine status.
if [ "$BEHIND" = "0" ] && [ "$AHEAD" = "0" ]; then
  STATUS="in_sync"
elif [ "$BEHIND" = "0" ]; then
  STATUS="ahead"
elif [ "$AHEAD" = "0" ]; then
  STATUS="behind"
else
  STATUS="diverged"
fi

# In-sync and pure-ahead cases: write a clean state file and emit
# nothing. (No warning needed — the agent has nothing to act on.)
if [ "$STATUS" = "in_sync" ] || [ "$STATUS" = "ahead" ]; then
  SUMMARY="Local is current with $UPSTREAM (ahead: $AHEAD, behind: 0)."
  write_state "$STATUS" "$BEHIND" "$AHEAD" "$UPSTREAM" "" "0" "$SUMMARY" ""
  emit_response ""
fi

# Behind / diverged: gather details for the warning.
SUBJECTS="$(git log --oneline --reverse HEAD.."$UPSTREAM" 2>/dev/null || echo "")"
TOOLCHAIN_TOUCHED="$(git log --name-only --pretty=format: HEAD.."$UPSTREAM" -- '.cursor/rules' '.cursor/skills' '.cursor/agents' 2>/dev/null | grep -c '^\.cursor/' || true)"

# Recommended pull command depends on whether we have local commits.
if [ "${AHEAD:-0}" = "0" ]; then
  PULL_CMD="git pull --ff-only origin main"
else
  PULL_CMD="git pull --rebase origin main"
fi

SUMMARY="Local is BEHIND $UPSTREAM by $BEHIND commit(s). Local has $AHEAD commit(s) ahead. Touches under .cursor/{rules,skills,agents}: $TOOLCHAIN_TOUCHED file change(s)."

write_state "$STATUS" "$BEHIND" "$AHEAD" "$UPSTREAM" "$SUBJECTS" "$TOOLCHAIN_TOUCHED" "$SUMMARY" "$PULL_CMD"

# Build the additional_context block. Even if Cursor's injection silently
# no-ops, the state file above is the canonical source of truth.
CTX=$(cat <<EOF
[sync-check] $SUMMARY

Missing commits (oldest first):
$SUBJECTS

ACTION REQUIRED before relying on any rule/skill/subagent in this session:
1. Pull: $PULL_CMD
2. Re-read any rule/skill/subagent file you have already loaded — your prior read may be stale.
3. Inspect .cursor/TOOLCHAIN.md for the inventory and lastUpdated timestamps.

This is the Phase 1 sync check from .cursor/rules/uds-master-preflight.mdc.
The canonical state file is .cursor/state/sync-status.json (always written, even when in sync).
EOF
)

emit_response "$CTX"
