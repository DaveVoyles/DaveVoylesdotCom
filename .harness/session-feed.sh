#!/usr/bin/env bash
# Harness adapter: emit a feed event for a local session (0107 D11).
# Any harness can implement the same contract — see fleet docs/feed-schema.md.
# Non-Claude local sessions stay off the feed until *their* adapter exists.
# Dispatched sessions always appear (the dispatch CLI emits, not this hook).
#
# Usage:
#   session-feed.sh start|stop [--repo SLUG] [--session ID] [--machine KEY]
set -euo pipefail
HARNESS_ROOT="${HARNESS_ROOT:-$HOME/REPOS/harness}"
FLEET_ROOT="${FLEET_ROOT:-$HOME/REPOS/fleet}"
ACTION="${1:-}"
shift || true
REPO=""
SESSION=""
MACHINE=""
ISSUE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --repo) REPO="${2:-}"; shift ;;
    --session) SESSION="${2:-}"; shift ;;
    --machine) MACHINE="${2:-}"; shift ;;
    --issue) ISSUE="${2:-}"; shift ;;
    *) echo "session-feed: unknown arg $1" >&2; exit 2 ;;
  esac
  shift
done
[ -n "$ACTION" ] || { echo "usage: session-feed.sh start|stop" >&2; exit 2; }
SESSION="${SESSION:-local-$(hostname -s)-$$}"
REPO="${REPO:-unknown}"
MACHINE="${MACHINE:-${FLEET_MACHINE:-mac-mini}}"
case "$MACHINE" in
  mac-mini|m1-mbp) ;;
  mini) MACHINE=mac-mini ;;
  m1) MACHINE=m1-mbp ;;
  *) MACHINE=mac-mini ;;
esac
STAGE=running
HB=--heartbeat
[ "$ACTION" = stop ] && { STAGE=done; HB=; }
VER="unknown"
[ -f "$HARNESS_ROOT/VERSION" ] && VER=$(tr -d '[:space:]' < "$HARNESS_ROOT/VERSION")
exec python3 "$FLEET_ROOT/bin/feed-emit" \
  --session "$SESSION" \
  --machine "$MACHINE" \
  --harness "$VER" \
  --repo "$REPO" \
  --issue "${ISSUE:-}" \
  --stage "$STAGE" \
  --source session-hook \
  $HB
