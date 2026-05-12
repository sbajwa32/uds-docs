#!/bin/bash
# .cursor/hooks/sync-check.sh
#
# sessionStart hook for the UDS docs repo. Checks whether the local
# repo is current with origin/main and, if not, injects a warning into
# the agent's initial system context so the agent surfaces it
# immediately instead of acting on stale rules/skills/subagents.
#
# Reads JSON from stdin per Cursor's hook contract. Always emits valid
# JSON on stdout (even on failure) so the hook runtime doesn't crash
# with a parse error.
#
# Fail open: if git or the network is unreachable, this hook exits
# successfully with no warning rather than blocking session start.

set -u
# Drain stdin (we don't actually need the input — sessionStart sends
# session_id, is_background_agent, composer_mode — but reading and
# discarding it avoids SIGPIPE complaints from the runtime).
cat >/dev/null 2>&1 || true

emit_empty() {
  printf '{}\n'
  exit 0
}

emit_context() {
  # $1 = the additional_context string to inject. We use python3 here
  # solely to JSON-escape the string safely (newlines, quotes, etc.).
  python3 -c '
import json, sys
ctx = sys.argv[1]
print(json.dumps({"additional_context": ctx}))
' "$1"
  exit 0
}

# Resolve repo root robustly. Cursor runs project hooks from the
# project root, so `pwd` is normally correct, but be defensive.
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  emit_empty
fi
cd "$REPO_ROOT" || emit_empty

# Skip the check entirely on background-agent sessions: those run on
# fresh clones from a specific commit and will never be "behind" in a
# meaningful way.
if grep -q '"is_background_agent": *true' /dev/null 2>/dev/null; then
  emit_empty
fi

# Best-effort fetch. Capped by the hook's `timeout` in hooks.json.
# Failure (offline, auth) is silently ignored — fail open.
git fetch --quiet origin main 2>/dev/null || emit_empty

# Determine the upstream we're comparing against. Prefer the configured
# upstream of the current branch; fall back to origin/main.
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"
if [ -z "$UPSTREAM" ]; then
  UPSTREAM="origin/main"
fi

# Behind count: number of upstream commits not in HEAD.
BEHIND="$(git rev-list --count HEAD.."$UPSTREAM" 2>/dev/null)"
AHEAD="$(git rev-list --count "$UPSTREAM"..HEAD 2>/dev/null)"

if [ -z "$BEHIND" ] || [ "$BEHIND" = "0" ]; then
  emit_empty
fi

# Pull a compact list of the commits we're missing (oldest first, so
# the message reads "since you last pulled").
SUBJECTS="$(git log --oneline --reverse HEAD.."$UPSTREAM" 2>/dev/null)"

# Detect whether any of the missing commits touched the agent toolchain.
TOOLCHAIN_TOUCHED="$(git log --name-only --pretty=format: HEAD.."$UPSTREAM" -- '.cursor/rules' '.cursor/skills' '.cursor/agents' 2>/dev/null | grep -c '^\.cursor/' || true)"

# Build the recommended pull command based on local divergence.
if [ "${AHEAD:-0}" = "0" ]; then
  PULL_CMD="git pull --ff-only origin main"
else
  PULL_CMD="git pull --rebase origin main"
fi

CTX=$(cat <<EOF
[sync-check] Local is BEHIND $UPSTREAM by $BEHIND commit(s). You have $AHEAD local commit(s) ahead.

Missing commits (oldest first):
$SUBJECTS

Touches under .cursor/rules|skills|agents: $TOOLCHAIN_TOUCHED file change(s).

ACTION REQUIRED before relying on any rule/skill/subagent in this session:
1. Pull: $PULL_CMD
2. Re-read any rule/skill/subagent file you've already loaded — your prior read may be stale.
3. Check .cursor/TOOLCHAIN.md for the inventory and lastUpdated dates.

This is the Phase -1 check from .cursor/rules/uds-master-preflight.mdc.
EOF
)

emit_context "$CTX"
