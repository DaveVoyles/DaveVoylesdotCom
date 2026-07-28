#!/usr/bin/env python3
"""Mechanical acceptance probes for the built video (plan 0005 D3/D4).

    ./.venv/bin/python probe.py clips   # D3: per-scene clip specs vs target_seconds
    ./.venv/bin/python probe.py final   # D4: final MP4 duration, size, A/V alignment

Exits non-zero on any failure.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def _slug():
    """Mirrors build_video.sh's own NAME derivation: the post slug from
    scenes.json's "post" field, so the probe checks whichever file that
    scenes.json actually built rather than a fixed name."""
    try:
        post = json.loads((ROOT / "scenes.json").read_text()).get("post", "")
        return Path(post).stem or "video"
    except Exception:
        return "video"


NAME = f"{_slug()}-60s"

W, H, FPS = 1920, 1080, "30/1"
CLIP_TOLERANCE = 0.5          # D3: +/- of target_seconds
FINAL_MIN, FINAL_MAX = 55.0, 75.0
MAX_BYTES = 25 * 1024 * 1024
AV_TOLERANCE = 1.0            # D4: audio/video must end within 1s of each other


def ffprobe(path, args):
    out = subprocess.run(
        ["ffprobe", "-v", "error", *args, "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return json.loads(out)


def scenes():
    return json.loads((ROOT / "scenes.json").read_text())["scenes"]


def probe_clips():
    fails = []
    print(f"{'scene':<18}{'target':>8}{'actual':>9}{'delta':>8}  {'resolution':<12}fps")
    for s in scenes():
        clip = ROOT / "work" / "clips" / f"{s['id']}.mp4"
        if not clip.is_file():
            fails.append(f"{s['id']}: clip missing")
            continue
        d = ffprobe(clip, ["-select_streams", "v:0", "-show_entries",
                           "stream=width,height,r_frame_rate", "-show_entries", "format=duration"])
        st = d["streams"][0]
        dur, tgt = float(d["format"]["duration"]), float(s["target_seconds"])
        res, fps = f"{st['width']}x{st['height']}", st["r_frame_rate"]
        print(f"{s['id']:<18}{tgt:>7.2f}s{dur:>8.2f}s{dur - tgt:>+7.2f}s  {res:<12}{fps}")
        if abs(dur - tgt) > CLIP_TOLERANCE:
            fails.append(f"{s['id']}: duration off by {dur - tgt:+.2f}s (> {CLIP_TOLERANCE}s)")
        if res != f"{W}x{H}":
            fails.append(f"{s['id']}: resolution {res}")
        if fps != FPS:
            fails.append(f"{s['id']}: fps {fps}")
    return fails


def probe_final():
    fails = []
    mp4 = ROOT / "out" / f"{NAME}.mp4"
    poster = ROOT / "out" / f"{NAME}-poster.jpg"
    if not mp4.is_file():
        return [f"final MP4 missing: {mp4}"]

    d = ffprobe(mp4, ["-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,duration",
                      "-show_entries", "format=duration,size"])
    dur = float(d["format"]["duration"])
    size = int(d["format"]["size"])
    streams = {s["codec_type"]: s for s in d["streams"]}

    print(f"duration    {dur:.2f}s   (window {FINAL_MIN}-{FINAL_MAX}s)")
    print(f"size        {size / 1024 / 1024:.2f} MB  (max {MAX_BYTES / 1024 / 1024:.0f} MB)")
    for kind, st in streams.items():
        extra = f"{st.get('width')}x{st.get('height')} @ {st.get('r_frame_rate')}" if kind == "video" else ""
        print(f"{kind:<11} {st['codec_name']:<8} {st.get('duration', '?')}s {extra}")

    if not FINAL_MIN <= dur <= FINAL_MAX:
        fails.append(f"duration {dur:.2f}s outside {FINAL_MIN}-{FINAL_MAX}s")
    if size > MAX_BYTES:
        fails.append(f"size {size / 1024 / 1024:.2f} MB exceeds {MAX_BYTES / 1024 / 1024:.0f} MB")
    if "video" not in streams:
        fails.append("no video stream")
    if "audio" not in streams:
        fails.append("no audio stream")

    if "video" in streams and "audio" in streams:
        vd = float(streams["video"].get("duration") or dur)
        ad = float(streams["audio"].get("duration") or dur)
        drift = abs(vd - ad)
        print(f"a/v drift   {drift:.3f}s  (max {AV_TOLERANCE}s)")
        if drift > AV_TOLERANCE:
            fails.append(f"audio/video end {drift:.2f}s apart (> {AV_TOLERANCE}s)")
        v = streams["video"]
        if (v["width"], v["height"]) != (W, H):
            fails.append(f"final resolution {v['width']}x{v['height']}")

    if not poster.is_file():
        fails.append(f"poster frame missing: {poster}")
    else:
        print(f"poster      {poster.stat().st_size / 1024:.0f} KB")
    return fails


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "clips"
    fails = {"clips": probe_clips, "final": probe_final}[mode]()
    print()
    if fails:
        print("FAIL:")
        for f in fails:
            print(f"  - {f}")
        sys.exit(1)
    print(f"PASS: {mode} probe")


if __name__ == "__main__":
    main()
