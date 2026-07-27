#!/usr/bin/env bash
# Post-to-video prototype build (plan 0005 D3/D4).
#
#   ./build_video.sh clips      # one Ken Burns clip per scene, sized from target_seconds (D3)
#   ./build_video.sh audio      # Kokoro narration per scene (D4)
#   ./build_video.sh assemble   # re-cut clips to measured audio, concat, mux, poster (D4)
#   ./build_video.sh all        # audio -> assemble
#
# Idempotent: everything regenerates from scenes.json alone. work/ and out/ are gitignored.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$ROOT/.." && pwd)"
cd "$ROOT"

PY="$ROOT/.venv/bin/python"
WORK="$ROOT/work"
OUT="$ROOT/out"
CARDS="$WORK/cards"
AUDIO="$WORK/audio"
CLIPS="$WORK/clips"
SRC="$WORK/src"
NAME="agent-production-system-60s"

FPS=30
W=1920
H=1080
ZOOM_MAX=1.12          # gentle; more than this reads as a zoom effect rather than motion
PAD_SECONDS=0.35       # breathing room after each scene's narration

mkdir -p "$WORK" "$OUT" "$CARDS" "$AUDIO" "$CLIPS" "$SRC"

# Emit "id<TAB>visual_type<TAB>source_path<TAB>target_seconds" per scene.
manifest() {
  "$PY" - "$REPO" <<'PY'
import json, pathlib, sys
repo = pathlib.Path(sys.argv[1])
root = pathlib.Path(__file__).resolve().parent if False else pathlib.Path.cwd()
scenes = json.loads((root / "scenes.json").read_text())["scenes"]
for s in scenes:
    v = s["visual"]
    src = str(repo / v["src"]) if v["type"] == "image" else str(root / "work" / "cards" / f"{s['id']}.png")
    print(f"{s['id']}\t{v['type']}\t{src}\t{s['target_seconds']}")
PY
}

# Normalise any source image to an exactly WxH frame, upscaled for smooth zoompan sampling.
# Photos are cover-cropped; cards are already WxH.
prepare_source() {
  local id="$1" src="$2" dest="$SRC/$id.png"
  ffmpeg -nostdin -y -v error -i "$src" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},scale=$((W*2)):$((H*2)):flags=lanczos" \
    -frames:v 1 "$dest"
  echo "$dest"
}

# Ken Burns clip of an exact frame count. Alternating zoom direction keeps
# consecutive scenes from feeling like one continuous push.
kenburns() {
  local src="$1" out="$2" frames="$3" direction="$4"
  local zexpr
  if [[ "$direction" == "in" ]]; then
    zexpr="min(zoom+$(awk -v z="$ZOOM_MAX" -v f="$frames" 'BEGIN{printf "%.6f",(z-1)/f}'),${ZOOM_MAX})"
  else
    zexpr="if(lte(on,1),${ZOOM_MAX},max(zoom-$(awk -v z="$ZOOM_MAX" -v f="$frames" 'BEGIN{printf "%.6f",(z-1)/f}'),1.0))"
  fi
  ffmpeg -nostdin -y -v error -loop 1 -i "$src" \
    -vf "zoompan=z='${zexpr}':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},format=yuv420p" \
    -frames:v "$frames" -c:v libx264 -preset medium -crf 20 -r "$FPS" "$out"
}

build_clips() {
  local duration_source="${1:-target}"
  "$PY" render_cards.py >/dev/null
  local i=0
  while IFS=$'\t' read -r id type src target; do
    local prepared seconds frames direction
    prepared="$(prepare_source "$id" "$src")"

    if [[ "$duration_source" == "audio" ]]; then
      local wav="$AUDIO/$id.wav"
      [[ -f "$wav" ]] || { echo "missing narration: $wav (run './build_video.sh audio' first)" >&2; exit 1; }
      seconds="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$wav")"
      seconds="$(awk -v s="$seconds" -v p="$PAD_SECONDS" 'BEGIN{printf "%.4f", s+p}')"
    else
      seconds="$target"
    fi

    frames="$(awk -v s="$seconds" -v f="$FPS" 'BEGIN{printf "%d", int(s*f+0.5)}')"
    if (( i % 2 == 0 )); then direction=in; else direction=out; fi
    kenburns "$prepared" "$CLIPS/$id.mp4" "$frames" "$direction"

    printf '%-18s %-5s %6.2fs -> %s\n' "$id" "$direction" "$seconds" "$CLIPS/$id.mp4"
    i=$((i + 1))
  done < <(manifest)
}

build_audio() {
  "$PY" tts.py --scenes scenes.json --outdir "$AUDIO" 2>&1 \
    | grep -viE 'warning|weightnorm|super\(\)|hf hub|dropout option'
}

assemble() {
  build_clips audio

  : > "$WORK/clips.txt"
  : > "$WORK/audio.txt"
  while IFS=$'\t' read -r id _ _ _; do
    echo "file '$CLIPS/$id.mp4'" >> "$WORK/clips.txt"
    echo "file '$AUDIO/$id.wav'" >> "$WORK/audio.txt"
  done < <(manifest)

  ffmpeg -nostdin -y -v error -f concat -safe 0 -i "$WORK/clips.txt" -c copy "$WORK/video.mp4"
  # Re-encode the audio concat: per-scene WAVs are padded to their clip length so the
  # two tracks stay aligned scene by scene rather than only at the end.
  "$PY" - <<PY
import json, pathlib, subprocess, wave, contextlib
root = pathlib.Path.cwd()
scenes = json.loads((root/"scenes.json").read_text())["scenes"]
pad = $PAD_SECONDS
parts = []
for s in scenes:
    wav = root/"work"/"audio"/f"{s['id']}.wav"
    with contextlib.closing(wave.open(str(wav))) as w:
        dur = w.getnframes()/w.getframerate()
    out = root/"work"/"audio"/f"{s['id']}-padded.wav"
    subprocess.run(["ffmpeg","-nostdin","-y","-v","error","-i",str(wav),
                    "-af",f"apad=pad_dur={pad}","-t",f"{dur+pad:.4f}",str(out)],check=True)
    parts.append(f"file '{out}'")
(root/"work"/"audio-padded.txt").write_text("\n".join(parts)+"\n")
PY
  ffmpeg -nostdin -y -v error -f concat -safe 0 -i "$WORK/audio-padded.txt" -c:a pcm_s16le "$WORK/narration.wav"

  ffmpeg -nostdin -y -v error -i "$WORK/video.mp4" -i "$WORK/narration.wav" \
    -c:v copy -c:a aac -b:a 128k -movflags +faststart -shortest "$OUT/$NAME.mp4"

  ffmpeg -nostdin -y -v error -i "$OUT/$NAME.mp4" -ss 1.5 -frames:v 1 "$OUT/$NAME-poster.jpg"

  echo "built $OUT/$NAME.mp4"
}

case "${1:-all}" in
  clips)    build_clips "${2:-target}" ;;
  audio)    build_audio ;;
  assemble) assemble ;;
  all)      build_audio; assemble ;;
  *)        echo "usage: $0 {clips|audio|assemble|all}" >&2; exit 2 ;;
esac
