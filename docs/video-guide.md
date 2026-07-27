# Post-to-video pipeline

Turns a blog post into a ~60–70s explainer video and (optionally) publishes it
to YouTube. Lives at [`tools/video/`](../tools/video/), promoted from the
[`prototype/post-video-pipeline`](https://github.com/DaveVoyles/DaveVoylesdotCom/tree/prototype/post-video-pipeline)
spike by [plan 0006](design/0006-post-video-pipeline.md). See
[ADR 0011](decisions/0011-video-hosting-youtube-manual-publish-gate.md) (hosting)
and [ADR 0012](decisions/0012-narration-claim-safety-gated.md) (claim safety) for
the decisions behind the design below.

## Quickstart (Dave)

**One-shot (recommended for a normal run):**

```bash
make video POST=agent-production-system
```
Chains draft → render → upload → embed with **no prompts** — draft's own
schema/claim-safety gate and render's mechanical acceptance probe are the
safety net, not a human "continue?" in the middle. Uploads as **private** and
inserts `{{< youtube VIDEO_ID >}}` into `content/posts/agent-production-system.md`
for you. Stops on the first failing stage (e.g. a claim-safety violation, a
failed probe, `quotaExceeded`) rather than pressing on with something broken.
You still watch the video, flip it to Public in YouTube Studio, and review +
commit the post diff yourself — see "Remaining manual steps" below.

Runs under 6 uploads/day (the daily quota ceiling — see Known failure modes)
per invocation, same as running the four stages by hand.

**Or run the four stages individually** — useful for re-rendering after a
narration tweak without re-uploading, or for stopping to inspect between
steps:

```bash
make video-draft POST=agent-production-system
```
Reads the post's markdown, drafts narration constrained to
[`claim-safe-facts.md`](claim-safe-facts.md), writes `tools/video/scenes.json`,
and **stops** — it prints the narration to stdout and never renders on its own.
Read it. If it looks wrong, edit `scenes.json` by hand or re-run with `--force`
(via `python3 tools/video/draft_scenes.py --post <slug> --force`) once you're
ready to overwrite an existing draft.

```bash
make video-render SCENES=tools/video/scenes.json
```
Renders the approved scenes file to `tools/video/out/<name>.mp4`, runs the
mechanical acceptance probe (`probe.py final` — duration, resolution, size,
A/V drift), and fails the build if it doesn't pass. Cold build takes ~25–100s
depending on scene count.

```bash
make video-upload MP4=tools/video/out/agent-production-system-60s.mp4
```
Uploads to YouTube as **private** and prints the video ID. That's it — the
API cannot make it public. **You** flip it to unlisted/public in
[YouTube Studio](https://studio.youtube.com/) once you've watched it. This is
deliberate, not unfinished — see ADR 0011.

```bash
make video-embed POST=agent-production-system VIDEO_ID=<id>
```
Inserts `{{< youtube VIDEO_ID >}}` into `content/posts/agent-production-system.md`,
right after the front matter. Refuses to run twice on the same post unless you
pass `--force` (via `python3 tools/video/embed_video.py --post <slug> --video-id <id> --force`)
to replace an existing embed — safe to re-run by accident.

**Worked example, start to finish** (either the one-shot above, or by hand):
```bash
make video-draft POST=agent-production-system      # review narration, edit if needed
make video-render SCENES=tools/video/scenes.json   # produces out/agent-production-system-60s.mp4
make video-upload MP4=tools/video/out/agent-production-system-60s.mp4   # → private video ID
make video-embed POST=agent-production-system VIDEO_ID=<id-from-upload>
# watch it in YouTube Studio, flip to Public when happy; then review + commit the post diff
```

**Suggested first action:** if you haven't watched the current render, run
`make video-render SCENES=tools/video/scenes.json` and open
`tools/video/out/agent-production-system-60s.mp4` locally — no YouTube account
or credentials needed for that step.

**Remaining manual steps, always** — none of the above ever does these, by
design (ADR 0011):
1. Watch the video, then flip it Private → Public/Unlisted in
   [YouTube Studio](https://studio.youtube.com/).
2. Review the post diff (`git diff content/posts/<slug>.md`) — the embed is
   just an insertion, but check placement and that nothing else in the file
   moved.
3. Commit and push the post yourself, same as any other post edit.

**Embedding** uses Hugo's built-in shortcode, already enabled with the
privacy-enhanced (no-cookie) domain (plan 0006 D8):
```
{{< youtube VIDEO_ID >}}
```
See [`platform-guide.md`](platform-guide.md), §🎥 Video, for the full
embed-vs-plain-link behavior.

## Agent-triggered (opt-in per post)

When drafting a post via the agent (see [`authoring-guide.md`](authoring-guide.md),
"Option A"), a video is **never** generated automatically — only when you ask
for one, e.g. "draft a post about X, with a video." When you do ask, the agent
runs `make video POST=<slug>` against the freshly-drafted post: draft, render,
upload, and embed all happen with no further confirmation (per your own
call — see the plan history for why this differs from D6/D7's one-time
manual gate). Same safety net as the manual one-shot above: a claim-safety
violation or a failed probe stops the chain before anything gets uploaded. A
`quotaExceeded` failure just means today's ~6-upload ceiling is used up —
the agent will say so rather than retry.

### One-time setup (already done for `agent-production-system`, needed once per machine)

`make video-upload` needs a YouTube OAuth credential that lives **outside**
this repo:

1. `python3 tools/video/check_auth.py` — the first run opens a browser for
   Google consent and caches the resulting token at
   `~/.config/davevoyles-video/token.json` (mode 0600). Subsequent runs reuse
   the cached token silently.
2. Requires the client-secret JSON already dropped at
   `~/.config/davevoyles-video/credentials.json` (mode 0600) — a Desktop-app
   OAuth client scoped to `youtube.upload` only, from a Google Cloud project
   with **YouTube Data API v3 enabled**. See D6/D7 in the
   [plan's Execution Tracking](design/0006-post-video-pipeline.md#execution-tracking)
   for how this was originally set up; setting it up on a new machine repeats
   the same Google Cloud Console steps.

## Agent contract

### Scenes file schema (`tools/video/scenes.json`)

```json
{
  "post": "content/posts/<slug>.md",
  "voice": "bm_lewis",
  "scenes": [
    {
      "id": "s1-hook",
      "narration": "Spoken text — this is what gets rendered to audio.",
      "headline": "Short on-screen text",
      "visual": {"type": "card", "text": "Card body text"},
      "target_seconds": 9.0
    },
    {
      "id": "s2-example",
      "visual": {"type": "image", "src": "static/images/posts/example.jpg"},
      "narration": "...", "headline": "...", "target_seconds": 8.0
    }
  ]
}
```

- `voice`: Kokoro voice name. The renderer derives the TTS language code from
  the **prefix** — `bm_`/`bf_` → British, `am_`/`af_` → American — so the
  voice key alone controls both. It's the only thing that needs changing to
  switch voices; nothing else in the pipeline hardcodes a language.
- `visual.type`: `"card"` (text card, needs `text`) or `"image"` (needs `src`,
  a repo-relative path that must exist on disk).
- `target_seconds`: aspirational per-scene duration; TTS output naturally
  varies ±1–2s from this and that's fine — only the **final** render's total
  duration/resolution is mechanically gated (`probe.py final`), not per-scene
  timing.
- Validated by [`tools/video/validate_scenes.py`](../tools/video/validate_scenes.py):
  6–8 scenes, 140–160 total narration words, both of the post's required
  illustrations used by at least one scene, no unattested authorship claims
  or numbers.

### Claim-safety rules

Narration and on-screen text (`narration`, `headline`, and card `visual.text`)
are scanned by the **same** `scripts/check-content.sh` gate that already
covers markdown — see ADR 0012. Rules, concretely:

- No authorship claims ("I built/created/authored/invented X") — this site's
  claim-safe-facts regime prefers "extended and operates."
- No unattested numbers — only quantities that appear in
  [`claim-safe-facts.md`](claim-safe-facts.md)'s allowed-metrics table (e.g.
  "twenty"/"20" for the homelab container count) may appear in narration.
  Anything else — a dollar figure, a duration, a headcount — gets flagged
  unless it's in that table.
- No present-tense employment claims, no banned tech-skill claims
  (Terraform/Kubernetes/K8s).

`scripts/check-content.sh` reads `tools/video/scenes.json` by default, or
`$VIDEO_SCENES_FILE` if set — the test suite
(`scripts/tests/test-check-content-narration.sh`) uses this override to check
fixtures without ever touching the real tracked scenes file. If you're
scripting against this gate, use the same override rather than swapping files
in place.

### Stage boundaries — what each Make target will and won't do

| Target | Reads | Writes | Never does |
|---|---|---|---|
| `video-draft` | post markdown, `claim-safe-facts.md` | `scenes.json` (won't overwrite without `--force`) | render, upload |
| `video-render` | `scenes.json` | `tools/video/out/*.mp4` (gitignored) | upload, touch the live site |
| `video-upload` | a local MP4 path | nothing local — creates a **private** YouTube video | ever set visibility to public/unlisted |
| `video-embed` | a post + a video ID | inserts `{{< youtube ID >}}` into `content/posts/<slug>.md` (won't overwrite without `--force`) | flip visibility, commit, push |
| `video` (one-shot) | a post slug | chains all four stages above, no prompts | flip visibility, commit, push |

Each stage validates its own inputs and stops on failure rather than
proceeding with something unverified — `video-draft` runs the schema
validator and claim-safety gate before printing narration; `video-render`
runs the mechanical acceptance probe before declaring success;
`video-upload` surfaces API errors explicitly (see below) rather than
retrying blindly or silently producing a broken video ID.

### Known failure modes

- **`403 accessNotConfigured` on first upload.** YouTube Data API v3 isn't
  enabled on the Google Cloud project — a separate step from creating the
  OAuth client. Fix: Cloud Console → APIs & Services → Library → "YouTube
  Data API v3" → Enable. (Hit live during D7's verification upload; the error
  message is accurate but doesn't spell out this specific fix, so noting it
  here.)
- **`youtube.upload` scope cannot read or delete videos.** Confirmed live
  during D7: `videos().list()` and `videos().delete()` both 403 with
  "insufficient authentication scopes," even for a video this exact
  credential just uploaded. This is the least-privilege design working as
  intended (a leaked/misused token can create private videos but can't touch
  anything else) — **not a bug to fix by broadening scope.** Practical
  consequence: there is no scripted way to verify an upload landed or to
  clean one up. Verification and any deletion happen manually in YouTube
  Studio.
- **Daily quota ceiling.** Default project quota is 10,000 units/day;
  `videos.insert` costs 1,600 units — roughly **6 uploads/day** for this
  unverified project. A batch backfill beyond that fails loudly with a
  `quotaExceeded` message (not silently partway) — see
  [`upload_video.py`](../tools/video/upload_video.py)'s error handling.
  Resets at midnight UTC; a sustained higher rate needs a Google
  quota-increase request.
- **Loudness (`TARGET_LUFS`).** [`build_video.sh`](../tools/video/build_video.sh)
  normalizes narration to `TARGET_LUFS=-16` (a knob at the top of that
  script) — raw Kokoro output renders ~11 dB quieter than that. YouTube
  itself re-normalizes playback to roughly **−14 LUFS**, so a video mixed at
  −16 will typically play a touch quieter than YouTube-native content but
  well within normal range; there's no need to chase −14 exactly.
- **Cold Kokoro renders are non-deterministic unless seeded** — `tts.py`
  seeds `torch`/`numpy` per-render specifically to make two cold builds of
  the same scenes file produce identical decoded-audio checksums (verified
  in D2/D11). If you ever see a build produce different output byte-for-byte
  on an unmodified `scenes.json`, that determinism has regressed — treat it
  as a real bug, not noise.

## Related

- [Plan 0006 — Post-to-video pipeline](design/0006-post-video-pipeline.md)
- [ADR 0011 — Video hosting is YouTube with a manual publish gate](decisions/0011-video-hosting-youtube-manual-publish-gate.md)
- [ADR 0012 — Narration is claim-safety-gated content](decisions/0012-narration-claim-safety-gated.md)
- [`platform-guide.md`](platform-guide.md), §🎥 Video — the embed-shortcode-vs-plain-link behavior on the live site
- [`authoring-guide.md`](authoring-guide.md) — general post-writing workflow this pipeline sits alongside
