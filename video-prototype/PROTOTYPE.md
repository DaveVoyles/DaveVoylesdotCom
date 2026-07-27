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

## Findings (D5, 2026-07-27)

Final artifact: `out/agent-production-system-60s.mp4` — **72.47s, 9.56 MB, 1920×1080 @ 30fps,
AAC mono 24 kHz, −17.0 LUFS, a/v drift 0.042s.** Cold full rebuild: **24.4s**.

### 1. Voice — is Kokoro acceptable for a public-facing embed?

**Verdict: Dave's call. Everything measurable is clean; the subjective judgment is not mine to make** —
I cannot listen to audio, and the plan puts human review of the final video with Dave anyway.

What was verified mechanically:

| Property | Value | Read |
|---|---|---|
| Clipping | true peak −1.39 dBTP | None. Safe headroom. |
| Loudness | −17.0 LUFS integrated | On target for web after the fix below. |
| Loudness range | 2.9 LU | Very flat — characteristic of TTS, no dynamic performance. |
| Sample rate | 24 kHz mono | **Kokoro's native ceiling**, below the 44.1/48 kHz norm for published audio. |
| Determinism | bit-identical when seeded | See finding 5. |

Two caveats to listen for specifically:

- **24 kHz mono is the hard limit.** It is fine for speech and nobody will call it broken, but it is
  audibly narrower than a real mic. If the video ever fronts the site, this is the ceiling that
  voice cloning (Chatterbox) or a paid TTS would raise — not the model's prosody.
- **Raw Kokoro is ~11 dB too quiet.** It renders at about −27 LUFS integrated. Embedded next to any
  other page audio that sounds broken. `build_video.sh` now normalises to −16 LUFS
  (`loudnorm=I=-16:TP=-1.5:LRA=11`). Worth carrying into any real pipeline verbatim — it is one filter
  and it is the difference between "sounds amateur" and "sounds fine."

Words in this script most likely to expose TTS pronunciation weakness, if Dave wants a checklist while
listening: *orchestrator*, *homelab*, *Azure*, *irreversible*.

### 2. Visuals — good enough, or is Remotion needed?

**Verdict: good enough to ship at this length. Remotion is not required to answer the question this
spike asked.**

The cards and the two real illustrations read as one piece rather than two sources — the post's
illustrations happen to use green accents that sit naturally against the site's dark palette, so
nothing looks bolted on. Type is the site's own dark-theme palette in Avenir Next, auto-shrinking to
fit, with an accent rule and footer.

What Ken Burns over stills genuinely cannot do, and what would actually justify Remotion later:

- No motion *within* a concept — nothing animates, builds, or reveals. A scene about a pipeline shows
  a static pipeline. For a series explaining a system, that ceiling shows up fast.
- No word-level captions or kinetic type, which is most of what makes short social video legible on mute.
- Transitions are hard cuts. Fine at 8 scenes; monotonous at 20.

For a ~60s companion embed under a written post, none of those are blocking. For standalone social
video, they are.

### 3. Effort — is per-video marginal effort actually minutes?

**Verdict: yes for compute, no for the script. Compute is 24 seconds; the writing is the real cost.**

| Phase | Wall clock | Notes |
|---|---|---|
| D1 environment | ~9 min | One-time. Dominated by the torch/Kokoro download. |
| D2 scene script | ~6 min | **This is the recurring per-video cost.** |
| D3 visuals | ~13 min | One-time scaffolding, including the stdin bug. |
| D4 voice + assembly | ~22 min | One-time scaffolding, including the two issues below. |
| D5 findings | ~15 min | One-time. |
| **Full rebuild** | **24.4s** | **Recurring per video, per re-render.** |

So the honest marginal cost for video #2 is **roughly 5–10 minutes of writing `scenes.json`, plus 25
seconds of compute** — and the writing is the part that carries claim-safety risk, so it is not a step
to automate away casually. "Minutes per video" is true, but they are *writing* minutes, not build minutes.

### 4. Compression — does a 60s cut stay claim-safe and worth watching?

**Verdict: claim-safe, yes — mechanically enforced. Worth watching: it is a teaser, not a substitute.**

The 970-word post compresses to 158 narration words: about **16% of the text**. That forces the cut to
be thesis-only — the mental model, the gates, the human, the hosts, the practices. Everything specific
(the constellation deep links, the artifacts table, what the system is *not*) is gone.

Claim safety survived compression, and it is enforced by `validate_scenes.py` rather than asserted:
narration quantities must be allowed metrics, and present-tense employment or upstream-authorship
phrasing is rejected. Mutation-tested — see issue #93.

The one editorial decision worth Dave's review: **the Xbox figures (~$50M, 12h→30m, 10+ years) were
deliberately dropped**, though all three are allowed metrics. They are résumé claims that add nothing
to a 60-second systems explainer, and omitting them removes the whole category of risk. If the goal
is credibility-building rather than idea-explaining, that is the call to revisit.

### 5. Bonus finding: Kokoro is non-deterministic unless seeded

Same text, same settings, two runs: identical *length* (52200 samples both times) but different
waveform — max sample delta 0.10, mean 0.0024. The built MP4 therefore differed byte-for-byte between
otherwise identical builds, while the video stream stayed bit-identical.

`tts.py` now seeds `torch` and `numpy` per render (`--seed`, default 0), which makes two full cold
rebuilds produce a byte-identical MP4 (`992fac56f5c488e03c9ce88914e8c355` twice). Anything that wants
reproducible builds, content-hash caching, or "did this actually change" diffing needs this.

### Recommendation

If the goal is **a companion embed under written posts**, this pipeline is already good enough — the
gap to production is a Hugo shortcode on `main`, a `make-video` wrapper, and the per-post `scenes.json`.
If the goal is **standalone social video**, the still-image ceiling in finding 2 will bind quickly and
Remotion is the right next investment. The voice ceiling (24 kHz) binds later than the visual one.

## Spike questions

1. **Voice** — is Kokoro's output quality acceptable for a public-facing embed?
2. **Visuals** — do Ken Burns stills + text cards look good enough, or is Remotion needed?
3. **Effort** — is per-video marginal effort actually minutes once scaffolding exists?
4. **Compression** — does a 60-second cut of a long technical post stay claim-safe and worth watching?

Answered above.
