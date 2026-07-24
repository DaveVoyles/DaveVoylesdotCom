#!/usr/bin/env bash
# Scaffold a series post for "Agent production system".
# Usage: ./scripts/new-series-post.sh <slug> <series_weight> <ISO-date>
# Example: ./scripts/new-series-post.sh my-topic 9 2026-09-25T09:00:00-04:00
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

slug="${1:-}"
weight="${2:-}"
date_val="${3:-}"

if [[ -z "$slug" || -z "$weight" || -z "$date_val" ]]; then
  echo "Usage: $0 <slug> <series_weight> <ISO-date>" >&2
  echo "Example: $0 my-topic 9 2026-09-25T09:00:00-04:00" >&2
  exit 1
fi

file="content/posts/${slug}.md"
if [[ -f "$file" ]]; then
  echo "Already exists: $file" >&2
  exit 1
fi

title="$(echo "$slug" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')"

cat > "$file" <<EOF
+++
title = "${title}"
date = "${date_val}"
draft = false
author = "Dave Voyles"
description = "TODO: one-line description (claim-safe)."
categories = ["Programming", "AI"]
tags = ["AI agents", "TPM"]
topics = ["Tech"]
series = ["Agent production system"]
series_weight = ${weight}
[cover]
image = "/images/posts/agent-system-ops-floor.jpg"
alt = "TODO: cover alt text"
caption = "TODO: cover caption"
+++

This is **part ${weight}** of the [Agent production system](/posts/agent-production-system/) series.

<!-- Series prev/next is injected automatically from series + series_weight. -->

## TODO

Write the body. Follow \`docs/claim-safe-facts.md\` and \`docs/series/README.md\`.

**Bottom line:** TODO.
EOF

echo "Created: $file"
echo "Next:"
echo "  1. Edit title/description/body (claim-safe)."
echo "  2. Add a row to docs/series/agent-production-system.md"
echo "  3. make check && make preview"
echo "  4. Commit when ready (auto-publishes after date via daily rebuild)."
