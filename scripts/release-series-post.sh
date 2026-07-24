#!/usr/bin/env bash
# Release a drafted series post: draft=false + date=now.
# Usage: ./scripts/release-series-post.sh <slug>
# Example: ./scripts/release-series-post.sh eval-gates-not-theater
set -euo pipefail

slug="${1:-}"
if [[ -z "$slug" ]]; then
  echo "Usage: $0 <post-slug>" >&2
  echo "Drafts:" >&2
  rg -l 'draft = true' content/posts --glob '*.md' | sed 's|content/posts/||;s|\.md$||' | sed 's/^/  /' >&2
  exit 1
fi

file="content/posts/${slug}.md"
if [[ ! -f "$file" ]]; then
  echo "Not found: $file" >&2
  exit 1
fi

if ! rg -q 'draft = true' "$file"; then
  echo "Already not a draft (or missing draft field): $file" >&2
  exit 1
fi

# ISO-ish local time with offset (macOS date)
now="$(date +"%Y-%m-%dT%H:%M:%S%z" | sed -E 's/([0-9]{2})([0-9]{2})$/\1:\2/')"

# Portable in-place edit
tmp="$(mktemp)"
awk -v now="$now" '
  BEGIN { in_fm=0; done_draft=0; done_date=0 }
  NR==1 && /^+++/ { in_fm=1; print; next }
  in_fm && /^+++/ {
    in_fm=0
    print
    next
  }
  in_fm && /^draft = / {
    print "draft = false"
    done_draft=1
    next
  }
  in_fm && /^date = / {
    print "date = \"" now "\""
    done_date=1
    next
  }
  { print }
' "$file" > "$tmp"
mv "$tmp" "$file"

echo "Released: $file"
echo "  draft = false"
echo "  date  = $now"
echo "Next: git add $file && git commit && git push"
