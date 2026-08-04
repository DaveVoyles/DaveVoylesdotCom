#!/usr/bin/env bash
# Test inline body image reference resolution and the image size regression
# gate in check-content.sh (review-lenses testing-lens findings on PR #133).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

test_count=0
pass_count=0
fail_count=0

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

# Temp fixture directory. Fixtures are pointed at via POSTS_DIR and
# IMAGES_POSTS_DIR (check-content.sh's overridable scan paths) rather than
# swapped into tracked content/posts or static/images/posts — no mutation
# of tracked content, so no backup/restore is needed.
FIXTURE_DIR="/tmp/check-content-images-test-$$"
mkdir -p "$FIXTURE_DIR"

cleanup() {
  rm -rf "$FIXTURE_DIR" 2>/dev/null || true
}

trap cleanup EXIT

echo "=== Test 1: inline image reference resolves to an existing file ==="
mkdir -p "$FIXTURE_DIR/t1-posts" "$FIXTURE_DIR/t1-images"
cat > "$FIXTURE_DIR/t1-posts/test.md" <<'EOF'
+++
title = "Test"
+++

![alt text](/images/posts/present.jpg)
EOF
: > "$FIXTURE_DIR/t1-images/present.jpg"

if POSTS_DIR="$FIXTURE_DIR/t1-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t1-images" \
  ./scripts/check-content.sh > "$FIXTURE_DIR/output1.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Valid inline image reference → exit 0" $exit_code 0
[[ $exit_code -ne 0 ]] && sed 's/^/    /' "$FIXTURE_DIR/output1.txt" || true

echo ""
echo "=== Test 2: inline image reference points at a missing file ==="
mkdir -p "$FIXTURE_DIR/t2-posts" "$FIXTURE_DIR/t2-images"
cat > "$FIXTURE_DIR/t2-posts/test.md" <<'EOF'
+++
title = "Test"
+++

![alt text](/images/posts/does-not-exist.jpg)
EOF

if POSTS_DIR="$FIXTURE_DIR/t2-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t2-images" \
  ./scripts/check-content.sh > "$FIXTURE_DIR/output2.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Broken inline image reference → exit 1" $exit_code 1
if [[ $exit_code -ne 0 ]]; then
  if rg -q 'inline image reference missing.*t2-posts/test\.md' "$FIXTURE_DIR/output2.txt"; then
    echo "  ✓ error names the offending source file"
  else
    echo "  ✗ error does not name the offending source file"
    fail_count=$((fail_count + 1))
    test_count=$((test_count + 1))
  fi
fi

echo ""
echo "=== Test 3: oversized image under IMAGES_POSTS_DIR fails the gate ==="
mkdir -p "$FIXTURE_DIR/t3-posts" "$FIXTURE_DIR/t3-images"
head -c 2097152 /dev/urandom > "$FIXTURE_DIR/t3-images/big.jpg"

if POSTS_DIR="$FIXTURE_DIR/t3-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t3-images" \
  ./scripts/check-content.sh > "$FIXTURE_DIR/output3.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Oversized image (2MB) → exit 1" $exit_code 1
[[ $exit_code -ne 0 ]] && sed 's/^/    /' "$FIXTURE_DIR/output3.txt" || true

echo ""
echo "=== Test 4: normal-size image passes the gate ==="
mkdir -p "$FIXTURE_DIR/t4-posts" "$FIXTURE_DIR/t4-images"
head -c 102400 /dev/urandom > "$FIXTURE_DIR/t4-images/normal.jpg"

if POSTS_DIR="$FIXTURE_DIR/t4-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t4-images" \
  ./scripts/check-content.sh > "$FIXTURE_DIR/output4.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Normal-size image (100KB) → exit 0" $exit_code 0
[[ $exit_code -ne 0 ]] && sed 's/^/    /' "$FIXTURE_DIR/output4.txt" || true

echo ""
echo "=== Test 5: oversized non-image file is ignored by the size gate ==="
mkdir -p "$FIXTURE_DIR/t5-posts" "$FIXTURE_DIR/t5-images"
head -c 2097152 /dev/urandom > "$FIXTURE_DIR/t5-images/big-notes.txt"

if POSTS_DIR="$FIXTURE_DIR/t5-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t5-images" \
  ./scripts/check-content.sh > "$FIXTURE_DIR/output5.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Oversized non-image file ignored → exit 0" $exit_code 0
[[ $exit_code -ne 0 ]] && sed 's/^/    /' "$FIXTURE_DIR/output5.txt" || true

echo ""
echo "=== Test Summary ==="
echo "Total: $test_count | Pass: $pass_count | Fail: $fail_count"

if [[ $fail_count -gt 0 ]]; then
  exit 1
fi
exit 0
