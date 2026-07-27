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

# --- series posts need weight ---
while IFS= read -r -d '' file; do
  if rg -q '^series\s*=' "$file"; then
    if ! rg -q '^series_weight\s*=' "$file"; then
      err "series set but series_weight missing: $file"
    fi
  fi
done < <(find content/posts -name '*.md' -print0)

ok "series_weight present when series set"

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
    if rg -qi --pcre2 "$pat" "$file"; then
      err "forbidden authorship claim in $file matching /$pat/"
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
          if .visual.type == "card" then .visual.text // empty else empty end
        )
      ' "$VIDEO_SCENES_FILE" 2>&1
    )" || jq_status=$?

    if [[ "$jq_status" -ne 0 ]]; then
      err "malformed JSON in $VIDEO_SCENES_FILE — jq: $scenes_fields"
    else
      while IFS= read -r text_field; do
        [[ -z "$text_field" ]] && continue
        for pat in "${forbid_patterns[@]}"; do
          if rg -qi --pcre2 "$pat" <<< "$text_field"; then
            err "forbidden authorship claim in $VIDEO_SCENES_FILE matching /$pat/ in: $text_field"
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
