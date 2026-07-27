#!/usr/bin/env bash
# Post-to-video preview pipeline: draft -> render. Stops there, always.
#
# No prompts through these two stages — each stage's own validation is the
# safety net (schema + claim-safety gate on draft, mechanical acceptance
# probe on render). Aborts on the first failing stage.
#
# Deliberately does NOT continue to upload. A human (or an agent on the
# human's behalf) watches the rendered MP4 first — narration quality and
# pacing only show up once it's actually rendered, not from the printed
# narration text alone (2026-07-27: the first fully-automatic run shipped a
# rough video because nothing paused here). Once approved, run
# publish_video.sh (or `make video-publish`) to upload + embed.
#
# Always regenerates tools/video/scenes.json from scratch (FORCE=1) for the
# requested post. Prefer the four manual stages instead if you want to keep
# a hand-edited scenes.json across a re-render.
#
# Usage:
#   tools/video/run_pipeline.sh <post-slug>
set -euo pipefail

POST="${1:?post slug required (e.g. agent-production-system)}"
cd "$(dirname "$0")/../.."

echo "== 1/2 draft =="
make video-draft POST="$POST" FORCE=1

echo
echo "== 2/2 render =="
make video-render SCENES=tools/video/scenes.json

MP4="$(ls -t "$PWD/tools/video/out"/*.mp4 | head -1)"
echo
echo "Rendered: $MP4"
echo
echo "Watch it before going further. If it's good:"
echo "  tools/video/publish_video.sh $POST \"$MP4\""
echo "If it's not, edit tools/video/scenes.json and re-run:"
echo "  make video-render SCENES=tools/video/scenes.json"
