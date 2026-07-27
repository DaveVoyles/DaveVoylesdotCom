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
REPO="$(cd "$ROOT/../.." && pwd)"
cd "$ROOT"

PY="$ROOT/.venv/bin/python"
WORK="$ROOT/work"
OUT="$ROOT/out"
CARDS="$WORK/cards"
AUDIO="$WORK/audio"
CLIPS="$WORK/clips"
SRC="$WORK/src"
# Derived from scenes.json's own "post" field so each post's render lands at
# its own out/<slug>-60s.mp4 instead of every post colliding on the same
# hardcoded filename (2026-07-27: a second post's render silently overwrote
# the first's local file — both had already uploaded fine, but there was no
# way to tell the two local MP4s apart before that). Falls back to a fixed
# name if scenes.json has no "post" field (e.g. a hand-authored file).
SLUG="$("$PY" -c '
import json, pathlib
try:
    post = json.loads(pathlib.Path("scenes.json").read_text()).get("post", "")
    print(pathlib.Path(post).stem or "video")
except Exception:
    print("video")
' 2>/dev/null || echo "video")"
NAME="${SLUG}-60s"

FPS=30
W=1920
H=1080
ZOOM_MAX=1.12          # gentle; more than this reads as a zoom effect rather than motion
PAD_SECONDS=0.35       # breathing room after each scene's narration
TARGET_LUFS=-16       # web-embed loudness target (YouTube -14, podcasts -16)

mkdir -p "$WORK" "$OUT" "$CARDS" "$AUDIO" "$CLIPS" "$SRC"

# Emit "id<TAB>target_seconds<TAB>n_beats" per scene. visual is a list of
# 1+ beats shown in sequence within that scene's clip — more frequent
# on-screen changes than one static visual for the whole scene.
scene_manifest() {
  "$PY" - <<'PY'
import json, pathlib
scenes = json.loads((pathlib.Path.cwd() / "scenes.json").read_text())["scenes"]
for s in scenes:
    visuals = s["visual"]
    if isinstance(visuals, dict):
        visuals = [visuals]
    print(f"{s['id']}\t{s['target_seconds']}\t{len(visuals)}")
PY
}

# Emit "beat_index<TAB>visual_type<TAB>source_path" for one scene's beats.
beat_manifest() {
  local id="$1"
  "$PY" - "$id" "$REPO" <<'PY'
import json, pathlib, sys
sid, repo = sys.argv[1], pathlib.Path(sys.argv[2])
root = pathlib.Path.cwd()
scenes = json.loads((root / "scenes.json").read_text())["scenes"]
s = next(sc for sc in scenes if sc["id"] == sid)
visuals = s["visual"]
if isinstance(visuals, dict):
    visuals = [visuals]
for bi, v in enumerate(visuals):
    src = str(repo / v["src"]) if v["type"] == "image" else str(root / "work" / "cards" / f"{sid}-{bi}.png")
    print(f"{bi}\t{v['type']}\t{src}")
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
  # -framerate must match zoompan's own fps=, or the filter advances its zoom
  # expression against a mismatched frame count (loop-1 images default to
  # 25fps input) and the motion comes out juddery — the standard cause of a
  # "shaky" ffmpeg zoompan Ken Burns effect.
  ffmpeg -nostdin -y -v error -loop 1 -framerate "$FPS" -i "$src" \
    -vf "zoompan=z='${zexpr}':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},format=yuv420p" \
    -frames:v "$frames" -c:v libx264 -preset medium -crf 20 -r "$FPS" "$out"
}

build_clips() {
  local duration_source="${1:-target}"
  "$PY" render_cards.py >/dev/null
  local i=0
  while IFS=$'\t' read -r id target n_beats; do
    local seconds
    if [[ "$duration_source" == "audio" ]]; then
      local wav="$AUDIO/$id.wav"
      [[ -f "$wav" ]] || { echo "missing narration: $wav (run './build_video.sh audio' first)" >&2; exit 1; }
      local raw
      raw="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$wav")"
      seconds="$(awk -v s="$raw" -v p="$PAD_SECONDS" 'BEGIN{printf "%.4f", s+p}')"
    else
      seconds="$target"
    fi

    # Split the scene's total duration evenly across its beats — each beat
    # gets its own short Ken Burns sub-clip, concatenated into one clip per
    # scene id (what assemble()'s per-scene clips.txt already expects).
    local per_beat frames
    per_beat="$(awk -v s="$seconds" -v n="$n_beats" 'BEGIN{printf "%.4f", s/n}')"
    frames="$(awk -v s="$per_beat" -v f="$FPS" 'BEGIN{printf "%d", int(s*f+0.5)}')"

    : > "$WORK/beats-$id.txt"
    while IFS=$'\t' read -r bi btype bsrc; do
      local prepared direction
      prepared="$(prepare_source "$id-$bi" "$bsrc")"
      if (( (i + bi) % 2 == 0 )); then direction=in; else direction=out; fi
      kenburns "$prepared" "$CLIPS/$id-$bi.mp4" "$frames" "$direction"
      echo "file '$CLIPS/$id-$bi.mp4'" >> "$WORK/beats-$id.txt"
    done < <(beat_manifest "$id")

    if (( n_beats > 1 )); then
      ffmpeg -nostdin -y -v error -f concat -safe 0 -i "$WORK/beats-$id.txt" -c copy "$CLIPS/$id.mp4"
    else
      cp -f "$CLIPS/$id-0.mp4" "$CLIPS/$id.mp4"
    fi

    printf '%-18s %d beat(s) %6.2fs -> %s\n' "$id" "$n_beats" "$seconds" "$CLIPS/$id.mp4"
    i=$((i + 1))
  done < <(scene_manifest)
}

build_audio() {
  "$PY" tts.py --scenes scenes.json --outdir "$AUDIO" 2>&1 \
    | grep -viE 'warning|weightnorm|super\(\)|hf hub|dropout option'
}

assemble() {
  build_clips audio

  : > "$WORK/clips.txt"
  : > "$WORK/audio.txt"
  while IFS=$'\t' read -r id _ _; do
    echo "file '$CLIPS/$id.mp4'" >> "$WORK/clips.txt"
    echo "file '$AUDIO/$id.wav'" >> "$WORK/audio.txt"
  done < <(scene_manifest)

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
  # Kokoro renders around -27 LUFS integrated, ~11 dB under the -16 LUFS web target —
  # quiet enough that an embedded player sounds broken next to any other page audio.
  # Normalise on the concatenated track so scene-to-scene levels stay relative.
  ffmpeg -nostdin -y -v error -f concat -safe 0 -i "$WORK/audio-padded.txt" \
    -af "loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11" -ar 24000 -c:a pcm_s16le "$WORK/narration.wav"

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
