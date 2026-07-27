#!/usr/bin/env bash
# Publish an already-rendered, already-reviewed video: upload -> embed.
#
# Deliberately separate from run_pipeline.sh's draft+render preview stage —
# this is the half that has a real side effect (a live private YouTube
# upload spending API quota) and should only run after a human has actually
# watched the rendered MP4. Never flips the upload to public — that stays a
# manual step in YouTube Studio (ADR 0011).
#
# Usage:
#   tools/video/publish_video.sh <post-slug> <mp4-path>
set -euo pipefail

POST="${1:?post slug required (e.g. agent-production-system)}"
MP4="${2:?rendered mp4 path required (e.g. tools/video/out/foo-60s.mp4)}"
cd "$(dirname "$0")/../.."

echo "== 1/2 upload =="
UPLOAD_LOG="$(mktemp)"
trap 'rm -f "$UPLOAD_LOG"' EXIT
make video-upload MP4="$MP4" | tee "$UPLOAD_LOG"
VIDEO_ID="$(grep -o 'Video ID: .*' "$UPLOAD_LOG" | tail -1 | sed 's/Video ID: //')"

if [[ -z "$VIDEO_ID" ]]; then
  echo "error: could not parse video ID from upload output" >&2
  exit 1
fi

echo
echo "== 2/2 embed =="
python3 tools/video/embed_video.py --post "$POST" --video-id "$VIDEO_ID"

echo
echo "Done. Video $VIDEO_ID is live as PRIVATE — remaining manual steps:"
echo "  1. Watch it again on YouTube, then flip Private -> Public/Unlisted in YouTube Studio."
echo "  2. Review the diff: git diff content/posts/$POST.md"
echo "  3. Commit and push when ready."
