# 0005 — Post-to-Video Prototype (throwaway spike)

- Status: Approved 2026-07-27 (in-chat approval; Lavish waiver — all deliverables XS/S, no open architectural questions)
- Date: 2026-07-27
- Repo: DaveVoyles/DaveVoylesdotCom
- Branch: `prototype/post-video-pipeline` (throwaway prototype branch per AGENTS.md §Engineering Principles — answers its questions, then lives on as a linkable primary source; never merged to main)
- Planner: Claude (Fable 5) session on MacBook Pro 2; implementation handed off per ADR 0003 (planner/orchestrator split)

## Problem Statement

Dave wants short (~1 minute) explainer videos generated from his blog posts and embedded in the posts themselves — the effect VidFactory produced from his LinkedIn post, but at $0 marginal cost using local/open-source tooling. Before investing in a polished pipeline (Remotion template, voice cloning, a `make-video` command), a throwaway prototype must validate the seams end-to-end against one real post: [How I run an agent production system](https://davevoyles.com/posts/agent-production-system/).

The prototype pipeline: Claude writes a scene script from the post markdown → Kokoro TTS (Apache-2.0, local) voices it → Pillow renders text-card slides in the site's dark aesthetic → ffmpeg applies Ken Burns motion over the post's two existing illustrations plus the generated cards, assembles, and muxes audio → a final ~60s MP4 previewed in a local Hugo build. Nothing publishes to the live site.

### Questions this spike must answer (the deliverable is these answers, not the video)

1. **Voice:** is Kokoro's output quality acceptable for a public-facing embed?
2. **Visuals:** do Ken Burns stills + text cards look good enough, or is Remotion needed before anything ships?
3. **Effort:** is per-video marginal effort actually minutes once scaffolding exists?
4. **Compression:** does a 60-second cut of a long technical post stay claim-safe and worth watching?

## Constraints & grounding facts (verified 2026-07-27)

- Target post: `content/posts/agent-production-system.md` (Hugo + PaperMod; flat post file, images under `static/images/posts/`).
- Exactly two post illustrations exist: `agent-system-ops-floor.jpg` (cover) and `agent-eval-gates.jpg`. A 6–8 scene video therefore needs generated text-card slides for the remaining scenes.
- The repo has a claim-safety gate (`docs/claim-safe-facts.md` + `scripts/check-content.sh`) — narration is externally-facing content and must only assert what the post itself asserts.
- No local checkout of the blog repo exists on MacBook Pro 2; the implementing agent clones (or uses an existing checkout on the machine it runs on) and works on the prototype branch.
- Format: 1920×1080 30fps H.264, 55–75s total, target ≤ 25 MB. Narration ≈ 140–160 words (~150 wpm).
- Voice: Kokoro American male voice (default `am_michael`; a one-string swap — final pick is a spike output, not a plan decision).

## Deliverables

All work lands on `prototype/post-video-pipeline` under a `video-prototype/` directory in the blog repo. Sizes are all XS/S — build-ready as-is; sequential execution (tightly coupled, one agent).

| # | Deliverable | Size | Acceptance Criteria | Dependencies | Status |
|---|-------------|------|---------------------|--------------|--------|
| D1 | **Environment preflight + branch scaffold.** Prototype branch created; ffmpeg, Python 3.10+ with Pillow, Kokoro TTS (`kokoro` pip package, pinned) + `espeak-ng` (brew) verified/installed on the executing machine. | S | `video-prototype/` scaffold committed on the branch. Kokoro smoke test: a one-line WAV rendered locally and playable; `ffmpeg -version` + pinned package versions recorded in `video-prototype/PROTOTYPE.md` (created here, findings appended by D5). | — | Done |
| D2 | **Scene script from the post (claim-safe).** The implementing session itself (no API spend) reads the post markdown and writes `video-prototype/scenes.json`: 6–8 scenes, each `{id, narration, headline, visual: {type: image\|card, src\|text}, target_seconds}`. | S | JSON validates against the schema documented in `video-prototype/PROTOTYPE.md`; total narration 140–160 words; every factual claim in narration is traceable to the post body (spot-check against `docs/claim-safe-facts.md`; no numbers or authorship claims the post doesn't make); the two real illustrations are each used by ≥1 scene. | D1 | Done |
| D3 | **Visuals: card renderer + per-scene clips.** `video-prototype/render_cards.py` (Pillow) renders 1920×1080 text cards in the site's dark aesthetic for card-type scenes; `video-prototype/build_video.sh` (ffmpeg zoompan) produces one Ken Burns clip per scene from cards + post illustrations. | S | One MP4 clip per scene at 1920×1080/30fps; each clip's ffprobe duration within ±0.5s of its scene's `target_seconds`; script is re-runnable (idempotent — regenerates from `scenes.json` alone). | D2 | Done |
| D4 | **Voiceover + assembly + local embed preview.** Kokoro renders per-scene narration audio; `build_video.sh` concatenates clips, muxes audio, outputs `video-prototype/out/agent-production-system-60s.mp4` + a poster frame. Local-only Hugo preview: video element added to a **draft copy** of the post (or a draft shortcode), viewed via `hugo server`. | S | Final MP4: 55–75s (ffprobe), ≤ 25 MB, audio/video ends within 1s of each other; plays in the local Hugo preview. Nothing pushed to the live site — the preview change stays on the prototype branch. | D3 | Done |
| D5 | **Findings write-up + verdict packet.** Append answers to the four spike questions to `video-prototype/PROTOTYPE.md` (with actual per-step timings), and deliver the MP4 + findings to Dave for his verdict on investing in the real pipeline. | XS | `PROTOTYPE.md` answers all four spike questions with evidence (timings, file sizes, subjective quality notes clearly labeled as such); MP4 + doc delivered to Dave in-chat; branch pushed. | D4 | Done |

## Testing Decisions

This is a throwaway spike: the TDD loop is deliberately waived (no test files, no `tdd` skill) — the prototype's whole purpose is answering questions, and its code is disposable by design. In its place, every deliverable carries a **mechanical acceptance probe** named in its criteria: ffprobe duration/size assertions, JSON schema validation, and re-runnability checks, executed inline by the implementing agent with verbatim output in the completion report. The claim-safety spot-check in D2 is the one gate that is *not* waived — narration is externally-facing prose and follows the repo's existing claim-safe rules. Human review of the final video (D5) is the ultimate acceptance test and stays with Dave per AGENTS.md's externally-facing-content exception.

## ⚠️ Irreversible Steps

None. All installs are pinned and reversible (brew/pip); all output lands on a throwaway branch; nothing publishes to the live site; no external sends. (Kokoro model weights ~330 MB download — disk only, deletable.)

## Out of Scope

- Publishing the video to the live site (the follow-up decision D5 informs — requires Dave's explicit call).
- The production pipeline: Remotion template, `make-video` command, Hugo shortcode landed on main.
- Voice cloning (Chatterbox), music/sound design, burned-in word-level captions.
- LinkedIn/social formats (9:16), batch generation across the series, any scheduling/automation.
- LinkedIn post ingestion — this spike is blog-post-input only.

## Open Questions (non-blocking, resolved by the spike itself)

- Which Kokoro voice reads best (default `am_michael`, alternates one string away).
- Whether text cards need the site's actual fonts or system fonts suffice for judging quality.

## Execution Tracking

- Issues (D1–D5 → #92–#96, sequential chain via native `blocked_by`): https://github.com/DaveVoyles/DaveVoylesdotCom/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0005
- Board: [Agent Work (Projects v2 #2)](https://github.com/users/DaveVoyles/projects/2) — all five cards seeded to Todo, 2026-07-27.
- **Executed and closed 2026-07-27.** All five deliverables landed on `prototype/post-video-pipeline` (never merged to `main`, per the throwaway-branch convention above). Each issue was closed with verbatim acceptance-probe output in place of a PR, since a PR to `main` would be meaningless for a branch that is deliberately never merged.
- Findings and the verdict packet: [`video-prototype/PROTOTYPE.md`](https://github.com/DaveVoyles/DaveVoylesdotCom/blob/prototype/post-video-pipeline/video-prototype/PROTOTYPE.md) on the prototype branch. Final artifact: 72.47s, 9.56 MB, 1920x1080/30fps, -17.0 LUFS; full cold rebuild 24.4s.
- Awaiting Dave's verdict on whether to invest in the production pipeline (Remotion template, `make-video`, a Hugo shortcode on `main`).
