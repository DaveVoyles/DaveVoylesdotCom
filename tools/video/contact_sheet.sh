#!/usr/bin/env bash
# Generate a contact sheet from a rendered video for visual inspection.
#
# Usage:
#   ./contact_sheet.sh <input-video> [frame-interval] [grid-layout]
#
# Examples:
#   ./contact_sheet.sh out/agent-production-system-60s.mp4
#   ./contact_sheet.sh out/agent-production-system-60s.mp4 130 4x4
#
# Parameters:
#   input-video      Path to the video file
#   frame-interval   Frame sampling interval (default: 130; ~16 frames for 71.6s @ 30fps)
#   grid-layout      Tile grid (default: 4x4; format NxM where N=cols, M=rows)
#
# Output:
#   Saves contact sheet PNG at: <input-video-without-ext>-contact-sheet.png
#
set -euo pipefail

INPUT="${1:?input-video required}"
INTERVAL="${2:-130}"
LAYOUT="${3:-4x4}"

if [[ ! -f "$INPUT" ]]; then
  echo "error: input video not found: $INPUT" >&2
  exit 1
fi

# Extract directory and base name
DIR=$(dirname "$INPUT")
BASE=$(basename "$INPUT" | sed 's/\.[^.]*$//')
OUTPUT="$DIR/$BASE-contact-sheet.png"

echo "Generating contact sheet from: $INPUT"
echo "  Interval: every $INTERVAL frames"
echo "  Layout: $LAYOUT"
echo "  Output: $OUTPUT"

ffmpeg -nostdin -y -i "$INPUT" \
  -vf "select='not(mod(n\,$INTERVAL))',scale=320:-1,tile=$LAYOUT" \
  -frames:v 1 "$OUTPUT" 2>&1 | grep -viE 'deprecated|warning|overhead' || true
ffmpeg_status="${PIPESTATUS[0]}"

if [[ "$ffmpeg_status" -eq 0 && -f "$OUTPUT" ]]; then
  size=$(ls -lh "$OUTPUT" | awk '{print $5}')
  echo "✓ Contact sheet saved ($size)"
else
  echo "error: contact sheet generation failed (ffmpeg exit $ffmpeg_status)" >&2
  exit 1
fi
