#!/usr/bin/env bash
# One-shot post-to-video pipeline: draft -> render -> upload -> embed.
#
# Fully automatic, no prompts — each stage's own validation is the safety
# net (schema + claim-safety gate on draft, mechanical acceptance probe on
# render, explicit API error surfacing on upload). Aborts on the first
# failing stage. Never flips the upload to public — that stays a manual
# step in YouTube Studio (ADR 0011).
#
# Usage:
#   tools/video/run_pipeline.sh <post-slug>
set -euo pipefail

POST="${1:?post slug required (e.g. agent-production-system)}"
cd "$(dirname "$0")/../.."

echo "== 1/4 draft =="
make video-draft POST="$POST"

echo
echo "== 2/4 render =="
make video-render SCENES=tools/video/scenes.json

MP4="$(ls -t "$PWD/tools/video/out"/*.mp4 | head -1)"
echo "Rendered: $MP4"

echo
echo "== 3/4 upload =="
UPLOAD_LOG="$(mktemp)"
trap 'rm -f "$UPLOAD_LOG"' EXIT
make video-upload MP4="$MP4" | tee "$UPLOAD_LOG"
VIDEO_ID="$(grep -o 'Video ID: .*' "$UPLOAD_LOG" | sed 's/Video ID: //')"

if [[ -z "$VIDEO_ID" ]]; then
  echo "error: could not parse video ID from upload output" >&2
  exit 1
fi

echo
echo "== 4/4 embed =="
python3 tools/video/embed_video.py --post "$POST" --video-id "$VIDEO_ID"

echo
echo "Done. Video $VIDEO_ID is live as PRIVATE — remaining manual steps:"
echo "  1. Watch it, then flip Private -> Public/Unlisted in YouTube Studio."
echo "  2. Review the diff: git diff content/posts/$POST.md"
echo "  3. Commit and push when ready."
