#!/usr/bin/env bash
# Print unique tag values from content/posts (for reusing vocabulary).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

rg -N --no-filename '^tags\s*=' content/posts --glob '*.md' \
  | rg -o '"[^"]+"' \
  | tr -d '"' \
  | sort -u
