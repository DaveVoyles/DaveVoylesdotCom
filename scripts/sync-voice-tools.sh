#!/usr/bin/env bash
# Copies the pinned voice-check tools out of the Dvoyles-Skills `humanize` skill
# into tools/voice/, or reports drift between the pinned copies and the skill.
#
#   scripts/sync-voice-tools.sh          copy skill files into tools/voice/
#   scripts/sync-voice-tools.sh --check  report drift, exit 1 if any (changes nothing)
#
# Skills repo location: $VOICE_SKILLS_DIR, else $HOME/REPOS/Dvoyles-Skills.
# tells.mjs and segments.mjs are the two tools the check uses. segments.mjs
# imports gate.mjs, and gate.mjs loads the vendored markdown-it (sha256-pinned
# by gate.mjs itself), so those two ride along; without them the copies cannot run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS="${VOICE_SKILLS_DIR:-$HOME/REPOS/Dvoyles-Skills}"
SRC="$SKILLS/skills/humanize"
DEST="$ROOT/tools/voice"
MODE="sync"
[ "${1:-}" = "--check" ] && MODE="check"

# source (relative to skills/humanize) -> destination (relative to tools/voice)
FILES=(
  "scripts/tells.mjs:scripts/tells.mjs"
  "scripts/segments.mjs:scripts/segments.mjs"
  "scripts/gate.mjs:scripts/gate.mjs"
  "vendor/markdown-it.min.cjs:vendor/markdown-it.min.cjs"
  "vendor/LICENSE-markdown-it:vendor/LICENSE-markdown-it"
)

if [ ! -d "$SRC" ]; then
  echo "sync-voice-tools: skills repo not found at $SRC (set VOICE_SKILLS_DIR)" >&2
  exit 2
fi

drift=0
for pair in "${FILES[@]}"; do
  from="$SRC/${pair%%:*}"
  to="$DEST/${pair##*:}"
  if [ ! -f "$from" ]; then
    echo "sync-voice-tools: missing in skills repo: ${pair%%:*}" >&2
    exit 2
  fi
  if [ "$MODE" = "sync" ]; then
    mkdir -p "$(dirname "$to")"
    cp "$from" "$to"
    echo "synced ${pair##*:}"
  elif [ ! -f "$to" ]; then
    echo "DRIFT: ${pair##*:} is not pinned yet"
    drift=1
  elif ! cmp -s "$from" "$to"; then
    echo "DRIFT: ${pair##*:} differs from the skills repo"
    drift=1
  fi
done

if [ "$MODE" = "check" ]; then
  if [ "$drift" -eq 0 ]; then echo "no drift: tools/voice matches the skills repo"; fi
  exit "$drift"
fi
