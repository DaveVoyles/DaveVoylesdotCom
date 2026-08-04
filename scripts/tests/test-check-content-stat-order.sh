#!/usr/bin/env bash
# Pins the GNU-first stat(1) flag order in check-content.sh's image-size
# regression check (scripts/check-content.sh:122). PR #135 restored CI after
# the reverse order (BSD -f tried first) hard-crashed check-content.sh on
# GNU/Linux under `set -u`: GNU's `stat -f '%z' file` doesn't error, it exits
# 0 and prints filesystem-status text (GNU's -f means "filesystem status",
# not "use this format" — that's the BSD meaning), so $size ends up holding
# non-numeric text instead of a byte count. See that PR's commit message for
# the full root-cause writeup.
#
# This machine is BSD (macOS), where both flag orders happen to work — BSD's
# -c fails cleanly and BSD's -f is the correct format flag either way, so a
# regression here is invisible to plain exit-code tests run natively. To
# actually pin the GNU-first ordering, this suite shadows `stat` on PATH with
# a fake that reproduces GNU coreutils' real -c/-f semantics and exercises
# the *actual* check-content.sh byte-size-detection behavior against real
# fixture files under that simulated GNU environment — not a grep of the
# script's literal text.
#
# It also proves the suite can fail: it runs the same fixtures through a
# copy of check-content.sh with the two stat calls swapped back to the buggy
# order, and confirms that copy crashes with the same "unbound variable"
# failure PR #135 fixed, instead of cleanly reporting the oversized image.
# If someone reintroduces the PR #135 regression, this is the assertion that
# would go red.

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

# Sub-assertion helper: mirrors test_result's bookkeeping for the extra
# rg-based checks each test runs against captured output, so pass/fail
# counts in the final summary reflect every assertion, not just the
# top-level exit-code ones.
assert_output() {
  local name="$1"
  local pattern="$2"
  local file="$3"
  test_count=$((test_count + 1))

  if rg -q "$pattern" "$file"; then
    echo "  ✓ $name"
    pass_count=$((pass_count + 1))
  else
    echo "  ✗ $name"
    fail_count=$((fail_count + 1))
  fi
}

# Absence counterpart to assert_output(): passes when $pattern does NOT
# appear in $file.
assert_output_absent() {
  local name="$1"
  local pattern="$2"
  local file="$3"
  test_count=$((test_count + 1))

  if rg -q "$pattern" "$file"; then
    echo "  ✗ $name"
    fail_count=$((fail_count + 1))
  else
    echo "  ✓ $name"
    pass_count=$((pass_count + 1))
  fi
}

# Runs check-content.sh (or a variant of it) against a fresh POSTS_DIR/
# IMAGES_POSTS_DIR fixture pair with the fake GNU stat on PATH, given a
# fixture-file byte size. Writes captured output to $1 and returns the exit
# code via $run_check_exit — shared by all three tests below to avoid
# repeating the same mkdir/head-c/PATH-override/capture block three times.
run_check() {
  local label="$1" size_bytes="$2" script="$3" out_file="$4"
  local dir="$FIXTURE_DIR/$label"
  mkdir -p "$dir/posts" "$dir/images"
  head -c "$size_bytes" /dev/urandom > "$dir/images/fixture.jpg"

  if PATH="$FIXTURE_DIR/fake-bin:$PATH" \
    POSTS_DIR="$dir/posts" IMAGES_POSTS_DIR="$dir/images" \
    "$script" > "$out_file" 2>&1; then
    run_check_exit=0
  else
    run_check_exit=$?
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

# Defensive self-heal: remove swapped-script copies older than an hour, left
# behind by a prior run killed before its own EXIT trap could fire, so they
# don't linger indefinitely in the tracked scripts/ directory. Age-gated
# rather than a blanket glob-delete — an unconditional delete here would
# race a concurrently-running instance of this same test, which uses the
# same glob shape and differs only by PID.
find scripts -maxdepth 1 -name '.check-content-stat-order-test-*.sh' -mmin +60 -delete 2>/dev/null || true

# --- fake `stat` reproducing real GNU coreutils -c/-f semantics ---
cat > "$FIXTURE_DIR/fake-bin/stat" <<'FAKESTAT'
#!/usr/bin/env bash
# Emulates GNU coreutils stat for scripts/tests/test-check-content-stat-order.sh.
#   -c '%s' FILE  -> GNU's byte-size format: succeeds with the real size.
#   -f '%z' FILE  -> GNU's -f is "filesystem status", not a format selector
#                    (that's the BSD meaning). It does not error on '%z' —
#                    it exits 0 and prints non-numeric filesystem-status text
#                    instead of the file's own size, reproducing the real
#                    "unbound variable" crash PR #135 fixed when that text
#                    lands in check-content.sh's `[[ "$size" -gt ... ]]`
#                    under `set -u`.
set -euo pipefail
case "$1" in
  -c)
    [[ "$2" == "%s" ]] || exit 1
    [[ -e "$3" ]] || exit 1
    wc -c < "$3" | tr -d ' '
    ;;
  -f)
    [[ -e "$3" ]] || exit 1
    printf '  File: "%s"\n    ID: 0h/0d    Namelen: 255     Type: tmpfs\n' "$3"
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
run_check "t1" 2097152 "./scripts/check-content.sh" "$FIXTURE_DIR/output1.txt"

test_result "Oversized image under simulated GNU stat -> exit 1" $run_check_exit 1
if [[ $run_check_exit -ne 0 ]]; then
  assert_output "detected the real byte count (2097152), not garbage from a misparsed -f" \
    'oversized image .*2097152 bytes' "$FIXTURE_DIR/output1.txt"
fi

echo ""
echo "=== Test 2: GNU-first order passes a normal-size image under simulated GNU stat ==="
run_check "t2" 102400 "./scripts/check-content.sh" "$FIXTURE_DIR/output2.txt"

test_result "Normal-size image under simulated GNU stat -> exit 0" $run_check_exit 0
# Assert the image-size-regression check specifically reached and cleared its
# own "OK" line, not just that the whole script happened to exit 0 — the rest
# of check-content.sh also scans real tracked content/posts and content/about.md
# for unrelated checks (cover images, claim-safety, series_weight, links), so a
# bare exit-0 check would be coupled to that unrelated repo state too.
assert_output "image size regression check specifically passed" \
  '^OK:    image size regression check$' "$FIXTURE_DIR/output2.txt"
[[ $run_check_exit -ne 0 ]] && sed 's/^/    /' "$FIXTURE_DIR/output2.txt" || true

echo ""
echo "=== Test 3: swapped (buggy) order crashes on the same oversized image ==="
run_check "t3" 2097152 "./$SWAPPED_SCRIPT" "$FIXTURE_DIR/output3.txt"

# This is the proof the suite can fail: under the buggy (-f first) order and
# a simulated GNU stat, $size holds non-numeric filesystem-status text and
# the `[[ "$size" -gt ... ]]` comparison crashes with "unbound variable"
# under `set -u` — the same failure mode PR #135 fixed — instead of cleanly
# reporting the oversized image. A nonzero exit_code here that is NOT paired
# with the normal "oversized image" error message is the expected (bad)
# outcome for the swapped copy, confirming this suite would catch the PR #135
# regression if the real script's order were ever reverted to match it.
test_result "Swapped order under simulated GNU stat crashes rather than exiting cleanly" $run_check_exit 1
assert_output "crash carries the real PR #135 signature (unbound variable), not a clean report" \
  'unbound variable' "$FIXTURE_DIR/output3.txt"
assert_output_absent "swapped copy never reaches the normal 'oversized image' report" \
  'oversized image' "$FIXTURE_DIR/output3.txt"

echo ""
echo "=== Test Summary ==="
echo "Total: $test_count | Pass: $pass_count | Fail: $fail_count"

if [[ $fail_count -gt 0 ]]; then
  exit 1
fi
exit 0
