#!/usr/bin/env bash
# Pins the GNU-first stat(1) flag order in check-content.sh's image-size
# regression check (scripts/check-content.sh:122). PR #135 restored CI after
# the reverse order (BSD -f tried first) silently corrupted $size on GNU/
# Linux instead of erroring cleanly, hard-crashing the check in CI — see that
# PR's commit message for the full root-cause writeup.
#
# This machine is BSD (macOS), where both flag orders happen to work — BSD's
# -c fails cleanly and BSD's -f is the correct format flag either way, so a
# regression here is invisible to plain exit-code tests run natively. To
# actually pin the GNU-first ordering, this suite shadows `stat` on PATH with
# a fake that reproduces GNU coreutils' real -c/-f semantics (correct byte
# size via -c; -f exits 0 but reports filesystem-level data unrelated to the
# file, since GNU's -f means "filesystem status", not "use this format") and
# exercises the *actual* check-content.sh byte-size-detection behavior
# against real fixture files under that simulated GNU environment — not a
# grep of the script's literal text.
#
# It also proves the suite can fail: it runs the same fixtures through a
# copy of check-content.sh with the two stat calls swapped back to the buggy
# order, and confirms that copy silently misses an oversized image under the
# simulated GNU environment. If someone reintroduces the PR #135 regression,
# this is the assertion that would go red.

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

FIXTURE_DIR="/tmp/check-content-stat-order-test-$$"
mkdir -p "$FIXTURE_DIR/fake-bin"
SWAPPED_SCRIPT="scripts/.check-content-stat-order-test-$$.sh"

cleanup() {
  rm -rf "$FIXTURE_DIR" 2>/dev/null || true
  rm -f "$SWAPPED_SCRIPT" 2>/dev/null || true
}
trap cleanup EXIT

# --- fake `stat` reproducing real GNU coreutils -c/-f semantics ---
cat > "$FIXTURE_DIR/fake-bin/stat" <<'FAKESTAT'
#!/usr/bin/env bash
# Emulates GNU coreutils stat for scripts/tests/test-check-content-stat-order.sh.
#   -c '%s' FILE  -> GNU's byte-size format: succeeds with the real size.
#   -f '%z' FILE  -> GNU's -f is "filesystem status", not a format selector
#                    (that's the BSD meaning). It does not error on '%z' —
#                    it exits 0 and reports filesystem-level data instead of
#                    the file's own size. Modeled as a fixed, obviously-wrong
#                    number so a swapped flag order is caught by a wrong
#                    detected size, not a crash.
set -euo pipefail
case "$1" in
  -c)
    [[ "$2" == "%s" ]] || exit 1
    [[ -e "$3" ]] || exit 1
    wc -c < "$3" | tr -d ' '
    ;;
  -f)
    [[ -e "$3" ]] || exit 1
    echo "424242"
    ;;
  *)
    exit 1
    ;;
esac
FAKESTAT
chmod +x "$FIXTURE_DIR/fake-bin/stat"

# --- swapped-order copy of check-content.sh (the PR #135 regression) ---
ORIG_LINE='  size="$(stat -c '"'"'%s'"'"' "$file" 2>/dev/null || stat -f '"'"'%z'"'"' "$file" 2>/dev/null)"'
SWAPPED_LINE='  size="$(stat -f '"'"'%z'"'"' "$file" 2>/dev/null || stat -c '"'"'%s'"'"' "$file" 2>/dev/null)"'

awk -v orig="$ORIG_LINE" -v swapped="$SWAPPED_LINE" '
  { if ($0 == orig) { print swapped; found=1 } else { print } }
  END { if (!found) { print "stat line not found - update this test to match check-content.sh" > "/dev/stderr"; exit 1 } }
' scripts/check-content.sh > "$SWAPPED_SCRIPT"
chmod +x "$SWAPPED_SCRIPT"

echo "=== Test 1: GNU-first order detects the real size under a simulated GNU stat ==="
mkdir -p "$FIXTURE_DIR/t1-posts" "$FIXTURE_DIR/t1-images"
head -c 2097152 /dev/urandom > "$FIXTURE_DIR/t1-images/big.jpg"

if PATH="$FIXTURE_DIR/fake-bin:$PATH" \
  POSTS_DIR="$FIXTURE_DIR/t1-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t1-images" \
  ./scripts/check-content.sh > "$FIXTURE_DIR/output1.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Oversized image under simulated GNU stat -> exit 1" $exit_code 1
if [[ $exit_code -ne 0 ]]; then
  if rg -q 'oversized image .*2097152 bytes' "$FIXTURE_DIR/output1.txt"; then
    echo "  ✓ detected the real byte count (2097152), not garbage from a misparsed -f"
  else
    echo "  ✗ did not report the real byte count — stat detection is wrong"
    fail_count=$((fail_count + 1))
    test_count=$((test_count + 1))
  fi
fi

echo ""
echo "=== Test 2: GNU-first order passes a normal-size image under simulated GNU stat ==="
mkdir -p "$FIXTURE_DIR/t2-posts" "$FIXTURE_DIR/t2-images"
head -c 102400 /dev/urandom > "$FIXTURE_DIR/t2-images/normal.jpg"

if PATH="$FIXTURE_DIR/fake-bin:$PATH" \
  POSTS_DIR="$FIXTURE_DIR/t2-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t2-images" \
  ./scripts/check-content.sh > "$FIXTURE_DIR/output2.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

test_result "Normal-size image under simulated GNU stat -> exit 0" $exit_code 0
[[ $exit_code -ne 0 ]] && sed 's/^/    /' "$FIXTURE_DIR/output2.txt" || true

echo ""
echo "=== Test 3: swapped (buggy) order silently misses the same oversized image ==="
mkdir -p "$FIXTURE_DIR/t3-posts" "$FIXTURE_DIR/t3-images"
head -c 2097152 /dev/urandom > "$FIXTURE_DIR/t3-images/big.jpg"

if PATH="$FIXTURE_DIR/fake-bin:$PATH" \
  POSTS_DIR="$FIXTURE_DIR/t3-posts" IMAGES_POSTS_DIR="$FIXTURE_DIR/t3-images" \
  "./$SWAPPED_SCRIPT" > "$FIXTURE_DIR/output3.txt" 2>&1; then
  exit_code=0
else
  exit_code=$?
fi

# This is the proof the suite can fail: under the buggy (-f first) order and
# a simulated GNU stat, the oversized image goes undetected. exit 0 here is
# the expected (bad) outcome for the swapped copy — confirming this suite
# would catch the PR #135 regression if the real script's order were ever
# reverted to match it.
test_result "Swapped order under simulated GNU stat silently misses the oversized image (proves detection)" $exit_code 0
if [[ $exit_code -eq 0 ]]; then
  if rg -q 'oversized image' "$FIXTURE_DIR/output3.txt"; then
    echo "  ✗ swapped copy unexpectedly still caught the oversized image — fixture or fake stat is wrong"
    fail_count=$((fail_count + 1))
    test_count=$((test_count + 1))
  else
    echo "  ✓ confirmed: swapped order + simulated GNU stat silently passes an oversized image"
  fi
fi

echo ""
echo "=== Test Summary ==="
echo "Total: $test_count | Pass: $pass_count | Fail: $fail_count"

if [[ $fail_count -gt 0 ]]; then
  exit 1
fi
exit 0
