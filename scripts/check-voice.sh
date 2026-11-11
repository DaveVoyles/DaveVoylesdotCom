#!/usr/bin/env bash
# Voice check for posts dated 2026-11-01 or later. Run by `make check-voice` and
# by the pull-request-only workflow job. NOT called by `make check` (the deploy
# workflow runs that before the daily publish). Blocking: exits 1 on a finding
# unless VOICE_WARN_ONLY=1. Extra args pass through (--dir, --since, --phrases).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! command -v node >/dev/null 2>&1; then
  echo "check-voice: node is required" >&2
  exit 2
fi
exec node tools/voice/check-voice.mjs "$@"
