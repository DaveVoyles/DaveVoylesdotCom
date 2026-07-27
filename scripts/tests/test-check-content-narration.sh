#!/usr/bin/env bash
# Test claim-safety gate for video narration and headlines
# TDD: this test should be RED initially (check-content.sh doesn't scan scenes.json yet),
# then GREEN after the gate is extended.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

test_count=0
pass_count=0
fail_count=0

# Test helpers
test_result() {
  local name="$1"
  local exit_code="$2"
  local expected="$3"
  test_count=$((test_count + 1))

  if [[ "$exit_code" -eq "$expected" ]]; then
    echo "✓ PASS: $name"
    pass_count=$((pass_count + 1))
  else
    echo "✗ FAIL: $name (exit $exit_code, expected $expected)"
    fail_count=$((fail_count + 1))
  fi
}

# Temp fixture directory
FIXTURE_DIR="/tmp/claim-safety-test-$$"
mkdir -p "$FIXTURE_DIR"

# Cleanup function
cleanup() {
  # Restore original scenes.json
  if [[ -f "$FIXTURE_DIR/scenes-backup.json" ]]; then
    command cp -f "$FIXTURE_DIR/scenes-backup.json" tools/video/scenes.json 2>/dev/null || true
  fi
  rm -rf "$FIXTURE_DIR" 2>/dev/null || true
}

trap cleanup EXIT

# Backup the real scenes.json
command cp -f tools/video/scenes.json "$FIXTURE_DIR/scenes-backup.json"

echo "=== Test 1: Forbidden claim in narration field ==="
cat > "$FIXTURE_DIR/scenes-forbidden-narration.json" <<'EOF'
{
  "post": "content/posts/test.md",
  "voice": "am_michael",
  "scenes": [
    {
      "id": "s1",
      "narration": "I built OpenClaw as my own framework for agent orchestration.",
      "headline": "Agent systems",
      "visual": {"type": "card", "text": "Clean text here"}
    }
  ]
}
EOF

command cp -f "$FIXTURE_DIR/scenes-forbidden-narration.json" tools/video/scenes.json

if ./scripts/check-content.sh > "$FIXTURE_DIR/output1.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Forbidden claim in narration → exit 1" $exit_code 1

if [[ $exit_code -ne 0 ]]; then
  echo "  Error output:"
  sed 's/^/    /' "$FIXTURE_DIR/output1.txt" || true
fi

command cp -f "$FIXTURE_DIR/scenes-backup.json" tools/video/scenes.json

echo ""
echo "=== Test 2: Forbidden claim in headline field ==="
cat > "$FIXTURE_DIR/scenes-forbidden-headline.json" <<'EOF'
{
  "post": "content/posts/test.md",
  "voice": "am_michael",
  "scenes": [
    {
      "id": "s1",
      "narration": "Clean narration here",
      "headline": "I created Hermes",
      "visual": {"type": "card", "text": "Also clean"}
    }
  ]
}
EOF

command cp -f "$FIXTURE_DIR/scenes-forbidden-headline.json" tools/video/scenes.json

if ./scripts/check-content.sh > "$FIXTURE_DIR/output2.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Forbidden claim in headline → exit 1" $exit_code 1

if [[ $exit_code -ne 0 ]]; then
  echo "  Error output:"
  sed 's/^/    /' "$FIXTURE_DIR/output2.txt" || true
fi

command cp -f "$FIXTURE_DIR/scenes-backup.json" tools/video/scenes.json

echo ""
echo "=== Test 3: Forbidden claim in card visual text ==="
cat > "$FIXTURE_DIR/scenes-forbidden-card-text.json" <<'EOF'
{
  "post": "content/posts/test.md",
  "voice": "am_michael",
  "scenes": [
    {
      "id": "s1",
      "narration": "Clean narration",
      "headline": "Clean headline",
      "visual": {"type": "card", "text": "I authored firstmate"}
    }
  ]
}
EOF

command cp -f "$FIXTURE_DIR/scenes-forbidden-card-text.json" tools/video/scenes.json

if ./scripts/check-content.sh > "$FIXTURE_DIR/output3.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Forbidden claim in card visual text → exit 1" $exit_code 1

if [[ $exit_code -ne 0 ]]; then
  echo "  Error output:"
  sed 's/^/    /' "$FIXTURE_DIR/output3.txt" || true
fi

command cp -f "$FIXTURE_DIR/scenes-backup.json" tools/video/scenes.json

echo ""
echo "=== Test 4: Clean fixture (no forbidden claims) ==="
cat > "$FIXTURE_DIR/scenes-clean.json" <<'EOF'
{
  "post": "content/posts/test.md",
  "voice": "am_michael",
  "scenes": [
    {
      "id": "s1",
      "narration": "I operate OpenClaw and Hermes in production.",
      "headline": "Production systems",
      "visual": {"type": "card", "text": "20+ containers on a homelab I operate"}
    }
  ]
}
EOF

command cp -f "$FIXTURE_DIR/scenes-clean.json" tools/video/scenes.json

if ./scripts/check-content.sh > "$FIXTURE_DIR/output4.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Clean fixture (no forbidden claims) → exit 0" $exit_code 0

if [[ $exit_code -ne 0 ]]; then
  echo "  Error output:"
  sed 's/^/    /' "$FIXTURE_DIR/output4.txt" || true
else
  echo "  OK output:"
  sed 's/^/    /' "$FIXTURE_DIR/output4.txt" || true
fi

command cp -f "$FIXTURE_DIR/scenes-backup.json" tools/video/scenes.json

echo ""
echo "=== Test Summary ==="
echo "Total: $test_count | Pass: $pass_count | Fail: $fail_count"

if [[ $fail_count -gt 0 ]]; then
  exit 1
fi
exit 0
