#!/usr/bin/env bash
# Vendors the studio data-fx loader and the five effects it mounts on any element.
# Usage: scripts/sync-fx.sh [path-to-sections]   (default $SKILLS_ROOT/site/sections, i.e. ~/REPOS/Dvoyles-Skills/skills/site/sections)
# Skipped on purpose: particle-field (the home hero has its own; it needs three.js + the motion lib).
set -euo pipefail
SKILLS_ROOT="${SKILLS_ROOT:-${STUDIO_SKILLS:-$HOME/REPOS/Dvoyles-Skills/skills}}"
src="${1:-$SKILLS_ROOT/site/sections}"
root="$(dirname "$0")/.."
dst="$root/static/sections"
mkdir -p "$dst/fx"
cp "$src/fx/fx.js" "$src/fx/fx.css" "$dst/fx/"
for d in glass-panels film-grade chrome-type hover-distort pointer-fx; do
  mkdir -p "$dst/$d"
  cp "$src/$d/section.css" "$src/$d/section.js" "$dst/$d/"
done
echo "synced fx into $dst"
