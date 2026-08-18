#!/usr/bin/env bash
# Content gates for davevoyles.com — run before push / in CI.
# Usage: ./scripts/check-content.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

errors=0
warns=0

err()  { echo "ERROR: $*" >&2; errors=$((errors + 1)); }
warn() { echo "WARN:  $*" >&2; warns=$((warns + 1)); }
ok()   { echo "OK:    $*"; }

# Hard precondition, not a content finding: almost every check below is
# rg-gated via `if rg ...; then err ...; fi`, which treats a missing/failing
# rg the same as "no match" — a missing rg silently voids nearly the whole
# script instead of failing loudly. That happened for real: rg was absent
# from this repo's CI runner from inception with no signal until an unrelated
# bug elsewhere finally crashed the script outright.
if ! command -v rg &> /dev/null; then
  echo "ERROR: rg (ripgrep) not found — required for every content-safety check in this script (apt-get install ripgrep / brew install ripgrep)." >&2
  exit 1
fi

ALLOWED_TOPICS=(
  "Gaming"
  "Tech"
  "AI and Agents"
  "Public Speaking and Presentations"
  "Career and Students"
  "Journalism and Marketing and PR"
)

# --- topics vocabulary ---
topic_ok() {
  local t="$1"
  local a
  for a in "${ALLOWED_TOPICS[@]}"; do
    [[ "$t" == "$a" ]] && return 0
  done
  return 1
}

while IFS= read -r -d '' file; do
  # Extract topics = ["A", "B"] lines (single-line only — corpus uses that shape)
  line="$(rg -N '^topics\s*=' "$file" || true)"
  [[ -z "$line" ]] && continue
  # Pull quoted values
  while IFS= read -r topic; do
    [[ -z "$topic" ]] && continue
    if ! topic_ok "$topic"; then
      err "invalid topic '$topic' in $file (see docs/claim-safe-facts.md)"
    fi
  done < <(echo "$line" | rg -o '"[^"]+"' | tr -d '"')
done < <(find content/posts -name '*.md' -print0)

ok "topics vocabulary"

# --- cover images exist ---
while IFS= read -r -d '' file; do
  if ! rg -q '^\[cover\]' "$file"; then
    continue
  fi
  # Portable awk (no \s — BSD awk on macOS). Extract quoted path after image =
  img="$(
    awk '
      /^\[cover\]/ { in_c=1; next }
      in_c && /^\[/ { exit }
      in_c && /^[+]/ { exit }
      in_c && $1 == "image" {
        if (match($0, /"[^"]+"/)) {
          print substr($0, RSTART+1, RLENGTH-2)
          exit
        }
      }
    ' "$file"
  )"
  if [[ -z "${img:-}" ]]; then
    warn "cover block without image in $file"
    continue
  fi
  # Site paths are /images/... → static/images/...
  rel="${img#/}"
  if [[ ! -f "static/$rel" && ! -f "$rel" ]]; then
    err "cover image missing for $file → $img (expected static/$rel)"
  fi
done < <(find content/posts -name '*.md' -print0)

ok "cover image paths"

# --- inline body image references exist ---
# Overridable so tests can point at fixtures without mutating tracked content
# (same convention as VIDEO_SCENES_FILE below).
POSTS_DIR="${POSTS_DIR:-content/posts}"
IMAGES_POSTS_DIR="${IMAGES_POSTS_DIR:-static/images/posts}"
while IFS= read -r -d '' file; do
  while IFS= read -r img; do
    [[ -z "$img" ]] && continue
    relpath="${img#/images/posts/}"
    if [[ ! -f "$IMAGES_POSTS_DIR/$relpath" ]]; then
      err "inline image reference missing in $file: $img (expected $IMAGES_POSTS_DIR/$relpath)"
    fi
  done < <(
    rg -oN --no-filename '\]\(/images/posts/[^ )]+' "$file" 2>/dev/null \
      | sed -E 's|^\]\(||' | sort -u
  )
done < <(find "$POSTS_DIR" -name '*.md' -print0)

ok "inline body image references resolve to files"

# --- image size regression (static/images/posts/) ---
# Existing cover/inline images run ~80KB-260KB; anything past this is almost
# certainly an unoptimized source dropped in directly (see process_images.py).
MAX_IMAGE_BYTES=$((1024 * 1024))
while IFS= read -r -d '' file; do
  # GNU (-c) first: GNU's -f means "filesystem status" (not a format flag) and
  # will misparse '%z' as an extra file operand instead of erroring cleanly,
  # so trying it first on Linux leaks garbage into $size. BSD/macOS -c fails
  # cleanly with no stdout, making the fallback order below safe both ways.
  size="$(stat -c '%s' "$file" 2>/dev/null || stat -f '%z' "$file" 2>/dev/null)"
  if [[ "$size" -gt "$MAX_IMAGE_BYTES" ]]; then
    err "oversized image $file (${size} bytes > ${MAX_IMAGE_BYTES} bytes) — run through process_images.py"
  fi
done < <(find "$IMAGES_POSTS_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.svg' \) -print0)

ok "image size regression check"

# --- series posts need weight ---
while IFS= read -r -d '' file; do
  if rg -q '^series\s*=' "$file"; then
    if ! rg -q '^series_weight\s*=' "$file"; then
      err "series set but series_weight missing: $file"
    fi
  fi
done < <(find content/posts -name '*.md' -print0)

ok "series_weight present when series set"

# --- series covers must be unique (do not reuse another part's hero) ---
cover_owners=""
while IFS= read -r -d '' file; do
  rg -q '^series\s*=' "$file" || continue
  cover="$(awk '
    /^\[cover\]/ { in_c=1; next }
    in_c && /^image[[:space:]]*=/ {
      gsub(/"/, "", $3); print $3; exit
    }
    in_c && /^\[/ { exit }
  ' "$file")"
  [[ -n "$cover" ]] || continue
  prev="$(printf '%s\n' "$cover_owners" | awk -F '\t' -v c="$cover" '$1==c {print $2; exit}')"
  if [[ -n "$prev" ]]; then
    err "series cover reused: $cover ($prev and $file) — each part needs its own [cover]"
  else
    cover_owners="${cover_owners}${cover}	${file}
"
  fi
done < <(find content/posts -name '*.md' -print0)
ok "series covers unique"

# --- series schedule data matches post front matter ---
python3 scripts/sync-series-schedule.py --check

# --- claim-safety: about + modern/series posts ---
scan_files=(content/about.md)
while IFS= read -r -d '' file; do
  if rg -q '^series\s*=' "$file"; then
    scan_files+=("$file")
    continue
  fi
  # date year >= 2026
  if rg -q '^date\s*=\s*".*202[6-9]' "$file"; then
    scan_files+=("$file")
  fi
done < <(find content/posts -name '*.md' -print0)

# Patterns that have already caused bad public claims
forbid_patterns=(
  'I (built|created|authored|wrote) (OpenClaw|Hermes|firstmate)'
  'my (own )?(OpenClaw|Hermes|firstmate) (framework|platform|product)'
  'original author of (OpenClaw|Hermes|firstmate)'
)

for file in "${scan_files[@]}"; do
  [[ -f "$file" ]] || continue
  for pat in "${forbid_patterns[@]}"; do
    # No --pcre2: forbid_patterns is plain alternation/grouping, which the
    # default RE2 engine handles fine, and the distro ripgrep package (as
    # installed in CI) isn't built with PCRE2 support — a --pcre2 flag there
    # errors out and silently voids this check instead of running it.
    # rg exit codes: 0=match 1=no-match 2=error (e.g. a future pattern using
    # a PCRE2-only construct). Distinguish 2 explicitly so an unsupported
    # pattern fails loudly instead of silently reading as "no match".
    rg -qi "$pat" "$file" && rc=0 || rc=$?
    if [[ "$rc" -eq 0 ]]; then
      err "forbidden authorship claim in $file matching /$pat/"
    elif [[ "$rc" -ge 2 ]]; then
      err "rg failed to evaluate pattern '$pat' against $file (exit $rc) — claim-safety check did not run for this pattern; if it uses a PCRE2-only construct (lookahead/backreference), rewrite it for RE2 or restore --pcre2 with a PCRE2-capable rg"
    fi
  done
  # Soft: Terraform/K8s as skill-ish claims in about skills blocks only
done

# About skills: ban Terraform / Kubernetes as listed skills
if rg -qi 'Terraform|Kubernetes|\bK8s\b' content/about.md; then
  # Allow mention in lede only if we ever need — for now any hit is error
  err "Terraform/Kubernetes/K8s found in content/about.md — remove as skill claims (see claim-safe-facts.md)"
fi

ok "claim-safety authorship / about bans"

# --- claim-safety: video narration and on-screen text ---
# Overridable so tests can point at a fixture without mutating the tracked file.
VIDEO_SCENES_FILE="${VIDEO_SCENES_FILE:-tools/video/scenes.json}"
if [[ -f "$VIDEO_SCENES_FILE" ]]; then
  if ! command -v jq &> /dev/null; then
    err "jq not found — required to scan video scenes.json for claim safety"
  else
    jq_status=0
    scenes_fields="$(
      jq -r '
        .scenes[]? | (
          .narration // empty,
          .headline // empty,
          ((if (.visual | type) == "array" then .visual else [.visual] end)[] |
            if .type == "card" then .text // empty
            elif .type == "table" then ((.headers // [])[], (.rows // [])[][])
            else empty end)
        )
      ' "$VIDEO_SCENES_FILE" 2>&1
    )" || jq_status=$?

    if [[ "$jq_status" -ne 0 ]]; then
      err "malformed JSON in $VIDEO_SCENES_FILE — jq: $scenes_fields"
    else
      while IFS= read -r text_field; do
        [[ -z "$text_field" ]] && continue
        for pat in "${forbid_patterns[@]}"; do
          # No --pcre2, and exit-code handling: see the matching comments on
          # the authorship-ban check above.
          rg -qi "$pat" <<< "$text_field" && rc=0 || rc=$?
          if [[ "$rc" -eq 0 ]]; then
            err "forbidden authorship claim in $VIDEO_SCENES_FILE matching /$pat/ in: $text_field"
          elif [[ "$rc" -ge 2 ]]; then
            err "rg failed to evaluate pattern '$pat' against $VIDEO_SCENES_FILE (exit $rc) — claim-safety check did not run for this pattern"
          fi
        done
      done <<< "$scenes_fields"
    fi
    ok "claim-safety video narration/headlines"
  fi
fi

# --- internal /posts/ links point at existing files ---
# Only post slugs (not /images/posts/*.jpg cover paths that share the segment)
while IFS= read -r link; do
  slug="${link#/posts/}"
  slug="${slug%/}"
  [[ -z "$slug" ]] && continue
  slug="${slug%%#*}"
  # Skip asset-looking paths under a mistaken /posts/ match
  if [[ "$slug" == *.* ]]; then
    continue
  fi
  if [[ ! -f "content/posts/${slug}.md" ]]; then
    err "internal link /posts/${slug}/ has no content/posts/${slug}.md"
  fi
done < <(
  rg -oN --no-filename '\]\(/posts/[a-zA-Z0-9_-]+/?\)' content/posts content/about.md 2>/dev/null \
    | sed -E 's|\]\(/posts/||; s|/?\)||' | sort -u
)

ok "internal /posts/ links resolve to files"

# --- compound tag smell (warn only) ---
while IFS= read -r line; do
  if echo "$line" | rg -q '"[^"]*( / | /)[^"]*"'; then
    warn "possible compound tag (prefer atomic tags): $line"
  fi
done < <(rg -N '^tags\s*=' content/posts --glob '*.md' || true)

# --- summary ---
echo ""
if [[ "$errors" -gt 0 ]]; then
  echo "check-content: FAILED ($errors error(s), $warns warning(s))" >&2
  exit 1
fi
echo "check-content: PASSED ($warns warning(s))"
exit 0
