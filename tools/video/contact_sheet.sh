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

# Sanity-check the grid actually fits the input, so a short clip or an
# unusual interval/layout doesn't silently produce a mostly-blank sheet.
cols="${LAYOUT%x*}"
rows="${LAYOUT#*x}"
grid_cells=$((cols * rows))
total_frames="$(ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 "$INPUT" 2>/dev/null || echo 0)"
needed_frames=$(( (grid_cells - 1) * INTERVAL + 1 ))
if [[ "$total_frames" =~ ^[0-9]+$ ]] && (( total_frames > 0 )) && (( total_frames < needed_frames )); then
  echo "warning: $INPUT has $total_frames frames but interval=$INTERVAL x $LAYOUT grid" \
       "needs ~$needed_frames to fill every cell — sheet will have blank/duplicate tiles" >&2
fi

echo "Generating contact sheet from: $INPUT"
echo "  Interval: every $INTERVAL frames"
echo "  Layout: $LAYOUT"
echo "  Output: $OUTPUT"

# Capture the real ffmpeg exit status via PIPESTATUS. This must happen on the
# line immediately after the pipeline — set +e/-e brackets it instead of a
# trailing `|| true`, because `|| true` runs `true` as its own pipeline and
# resets PIPESTATUS to [0] before the next line can read it (verified: this
# exact pattern previously masked ffmpeg failures as false successes).
set +e
ffmpeg -nostdin -y -i "$INPUT" \
  -vf "select='not(mod(n\,$INTERVAL))',scale=320:-1,tile=$LAYOUT" \
  -frames:v 1 "$OUTPUT" 2>&1 | grep -viE 'deprecated|warning|overhead'
ffmpeg_status="${PIPESTATUS[0]}"
set -e

if [[ "$ffmpeg_status" -eq 0 && -f "$OUTPUT" ]]; then
  size=$(ls -lh "$OUTPUT" | awk '{print $5}')
  echo "✓ Contact sheet saved ($size)"
else
  echo "error: contact sheet generation failed (ffmpeg exit $ffmpeg_status)" >&2
  exit 1
fi
