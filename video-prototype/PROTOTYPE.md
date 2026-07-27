# Post-to-video prototype (plan 0005, throwaway spike)

Generates a ~60s explainer video from [`content/posts/agent-production-system.md`](../content/posts/agent-production-system.md)
using entirely local, free tooling. **Throwaway by design** — this branch is never merged to `main`.

Design plan: [`docs/design/0005-post-video-prototype.md`](../docs/design/0005-post-video-prototype.md).

## Environment (recorded D1, 2026-07-27, Dave's MacBook Pro (2))

| Component | Version | Source |
|---|---|---|
| ffmpeg / ffprobe | 8.0.1 | Homebrew (pre-existing) |
| espeak-ng | 1.52.0 | `brew install espeak-ng` (installed by D1) |
| Python | 3.13.14 | Homebrew `python@3.13` |
| Pillow | 12.3.0 | venv |
| torch | 2.13.0 | venv (Kokoro dependency) |
| kokoro | 0.9.4 | venv |
| soundfile | 0.14.0 | venv |

**Why a venv on 3.13, not system Python:** the machine's default `python3` is 3.14.3, ahead of
reliable PyTorch wheel coverage. The prototype pins itself to Homebrew's 3.13 in a local
`.venv/`, which also keeps the whole install reversible (`rm -rf video-prototype/.venv`) as the
plan's ⚠️ section assumes. Exact pins: [`requirements.txt`](requirements.txt).

### Setup from scratch

```bash
cd video-prototype
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python -r requirements.txt
brew install espeak-ng
```

### Known gotcha: espeak-ng data path

The `espeakng-loader` wheel Kokoro depends on bundles a dylib whose default data path is
baked to the *CI builder's* filesystem, so a stock install fails with:

```
Error processing file '/Users/runner/work/espeakng-loader/.../espeak-ng-data/phontab': No such file or directory.
```

Setting `EspeakWrapper.set_data_path()` alone does **not** fix it — Kokoro re-applies the
loader's own paths at import time. `tts.py` patches `espeakng_loader.get_data_path` /
`get_library_path` to the Homebrew install before importing Kokoro. That is why
`brew install espeak-ng` is a hard requirement rather than a convenience.

## Pipeline

```
scenes.json ──┬─> render_cards.py ─> work/cards/*.png ──┐
              │                                         ├─> build_video.sh ─> out/*.mp4
              └─> tts.py ──────────> work/audio/*.wav ──┘
```

| File | Role |
|---|---|
| `scenes.json` | The scene script — narration + visual per scene (D2) |
| `render_cards.py` | Pillow text-card renderer, site dark aesthetic (D3) |
| `tts.py` | Kokoro TTS wrapper — smoke test and per-scene narration (D1/D4) |
| `build_video.sh` | ffmpeg Ken Burns clips, concat, audio mux (D3/D4) |

`work/` and `out/` are gitignored — everything regenerates from `scenes.json` alone.

## `scenes.json` schema

```jsonc
{
  "post": "content/posts/agent-production-system.md",  // source post (provenance)
  "voice": "am_michael",                               // Kokoro voice id
  "scenes": [
    {
      "id": "s1-hook",                 // unique, filename-safe; also the clip/audio basename
      "narration": "...",              // spoken text; claim-safe against the post body
      "headline": "...",               // on-screen text for card scenes; caption otherwise
      "visual": {
        "type": "card",                // "card" (generated) | "image" (real post illustration)
        "text": "...",                 // card only: sub-line under the headline
        "src": "static/images/..."     // image only: repo-relative path
      },
      "target_seconds": 9.0            // intended clip duration
    }
  ]
}
```

Constraints the acceptance probes check: total narration 140–160 words; every factual claim
traceable to the post body per [`docs/claim-safe-facts.md`](../docs/claim-safe-facts.md); both
real post illustrations used by at least one scene each.

## Findings

_Appended by D5 — see [Spike questions](#spike-questions) below._

## Spike questions

1. **Voice** — is Kokoro's output quality acceptable for a public-facing embed?
2. **Visuals** — do Ken Burns stills + text cards look good enough, or is Remotion needed?
3. **Effort** — is per-video marginal effort actually minutes once scaffolding exists?
4. **Compression** — does a 60-second cut of a long technical post stay claim-safe and worth watching?

_Answers pending D5._
