#!/usr/bin/env python3
"""Kokoro TTS wrapper for the post-to-video prototype.

Renders narration to WAV. Used by D1 as a smoke test and by D4 per scene.

    ./.venv/bin/python tts.py --text "hello" --out work/smoke.wav
    ./.venv/bin/python tts.py --scenes scenes.json --outdir work/audio
"""
import argparse
import json
import time
from pathlib import Path

# The espeakng-loader wheel bundles a dylib whose default data path is baked to the CI
# builder's filesystem, so Kokoro fails with "phontab: No such file or directory".
# Kokoro re-applies the loader's paths at import time, so overriding phonemizer directly
# is not enough — patch the loader itself, before kokoro imports.
import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper

BREW_LIB = "/opt/homebrew/lib/libespeak-ng.dylib"
BREW_DATA = "/opt/homebrew/share/espeak-ng-data"

espeakng_loader.get_library_path = lambda: BREW_LIB
espeakng_loader.get_data_path = lambda: BREW_DATA
EspeakWrapper.set_library(BREW_LIB)
EspeakWrapper.set_data_path(BREW_DATA)

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from kokoro import KPipeline  # noqa: E402

SAMPLE_RATE = 24000
DEFAULT_VOICE = "am_michael"
# Kokoro reads ~130 wpm at speed 1.0, slower than the plan's 150 wpm estimate, which
# pushed the assembled cut past its 75s ceiling. A light speed-up recovers the budget
# without cutting narration; above ~1.1 it starts to sound rushed.
DEFAULT_SPEED = 1.06


def render(pipeline, text, voice, out_path, speed=1.0):
    """Render one narration string to a single WAV, concatenating Kokoro's chunks."""
    chunks = [audio for _, _, audio in pipeline(text, voice=voice, speed=speed)]
    if not chunks:
        raise RuntimeError(f"Kokoro produced no audio for: {text[:60]!r}")
    audio = np.concatenate(chunks) if len(chunks) > 1 else chunks[0]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(out_path, audio, SAMPLE_RATE)
    return len(audio) / SAMPLE_RATE


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text")
    ap.add_argument("--scenes")
    ap.add_argument("--out")
    ap.add_argument("--outdir")
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--speed", type=float, default=DEFAULT_SPEED)
    args = ap.parse_args()

    t0 = time.time()
    pipeline = KPipeline(lang_code="a")
    print(f"pipeline ready in {time.time() - t0:.1f}s", flush=True)

    if args.text:
        dur = render(pipeline, args.text, args.voice, Path(args.out), args.speed)
        print(f"wrote {args.out} ({dur:.2f}s)")
        return

    scenes = json.loads(Path(args.scenes).read_text())["scenes"]
    outdir = Path(args.outdir)
    total = 0.0
    for scene in scenes:
        out = outdir / f"{scene['id']}.wav"
        dur = render(pipeline, scene["narration"], args.voice, out, args.speed)
        total += dur
        print(f"{scene['id']:<12} {dur:6.2f}s  target {scene['target_seconds']:.1f}s  {out}")
    print(f"TOTAL narration {total:.2f}s")


if __name__ == "__main__":
    main()
