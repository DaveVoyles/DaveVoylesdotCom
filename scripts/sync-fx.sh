#!/usr/bin/env bash
# Vendors the studio data-fx loader and the five effects it mounts on any element.
# Usage: scripts/sync-fx.sh [path-to-studio-sections]   (default ~/REPOS/studio/skills/sections)
# Skipped on purpose: particle-field (the home hero has its own; it needs three.js + the motion lib).
set -euo pipefail
src="${1:-$HOME/REPOS/studio/skills/sections}"
root="$(dirname "$0")/.."
dst="$root/static/sections"
mkdir -p "$dst/fx"
cp "$src/fx/fx.js" "$src/fx/fx.css" "$dst/fx/"
for d in glass-panels film-grade chrome-type hover-distort pointer-fx; do
  mkdir -p "$dst/$d"
  cp "$src/$d/section.css" "$src/$d/section.js" "$dst/$d/"
done
echo "synced fx into $dst"
