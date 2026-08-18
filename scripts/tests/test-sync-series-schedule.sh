#!/usr/bin/env bash
# Check-mode of sync-series-schedule.py: stale yaml must fail, matching yaml must pass.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

fail=0
pass() { echo "✓ PASS: $1"; }
failt() { echo "✗ FAIL: $1"; fail=1; }

if python3 scripts/sync-series-schedule.py --check >/dev/null; then
  pass "check clean against committed yaml"
else
  failt "check should pass when yaml matches posts"
fi

bak="$(mktemp)"
cp data/series/agent-production-system.yaml "$bak"
printf '\n# stale\n' >> data/series/agent-production-system.yaml
if python3 scripts/sync-series-schedule.py --check >/dev/null 2>&1; then
  failt "check should fail when yaml is stale"
else
  pass "check fails on stale yaml"
fi
mv "$bak" data/series/agent-production-system.yaml

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "test-sync-series-schedule: all passed"
