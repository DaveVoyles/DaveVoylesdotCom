# Handoff

**2026-07-28 — video pipeline polish + post rewrite + branch cleanup, closed out.**

## What shipped this pass

| Work | Notes |
|------|--------|
| `eval-gates-not-theater` rewrite | 613 → 1257 words per Dave's "too brief/robotic" feedback; second comparison table added. Merged to `main`, live. |
| Writing standard | `docs/authoring-guide.md` — ~800–1300 words, conversational tone, table for any real comparison, claim-safe numbers only. Applies to future "draft a post" requests automatically. |
| Video pipeline fixes | Shaky Ken Burns motion (ffmpeg `zoompan`/`-loop 1` framerate mismatch — needs matching `-framerate`), repeated slides (cards now use the scene's own narration, not the section heading twice), markdown tables now render as a real chart visual, scenes split into up to 2 visual beats each. |
| `docs/platform-guide.md` | Added a plain-language "ask the agent to..." quick reference (post / image / video); explicit that image generation isn't wired into this repo — cover images are still human-sourced. Video section rewritten to match the current preview-then-publish flow. |
| `docs/video-guide.md` | Fixed stale schema example (was missing multi-beat/table visual type); added a "Known gaps — video polish backlog" section. |
| PR #128 | Bundled the above + the video pipeline's earlier preview-gate redesign (from the prior session) + twice-weekly cadence change. Merged, CI green, deployed. |
| `scripts/git-prune-merged-branch.sh` | New — this repo was missing the verified prune wrapper `hooks/git-safety.sh` already expects. Verifies merged-ness (ancestry or a merged PR by branch name) before deleting; refuses main/current/other-worktree branches and anything unverified. PR #129, merged. |
| Branch/worktree cleanup | Deleted 72 stale branches (7 local, 65 remote) and removed 2 idle merged worktrees (`vigilant-payne-cd449c`, `plan-0005`). |

## Where to start next session

1. Read **`AGENTS.md`**, then the doc for your task.
2. `make submodules` if PaperMod is empty.
3. `make check && make preview` before content work.
4. Claim-safe facts: **`docs/claim-safe-facts.md`**.

## Live / schedule

- **Live:** `eval-gates-not-theater` (part 1, published 2026-07-28) + series overview `/posts/agent-production-system/`.
- **Cadence:** twice weekly (Tue + Fri) — full schedule in `docs/series/agent-production-system.md`.
- **Next auto-ship:** part 2 `human-approval-merge-button` on **2026-07-31**.

## Open / not blocking

- **Voice/speed pick still pending.** Four TTS samples were rendered for comparison (current `bm_lewis`@1.06x, `bm_lewis`@0.92x, `bm_daniel`@1.0x, `af_heart`@1.0x) — waiting on Dave's choice before wiring it into `scenes.json`'s `voice` key / `tts.py`'s `DEFAULT_SPEED`.
- **`eval-gates-not-theater`'s `scenes.json` draft is stale** — it was drafted against the post's old, shorter text. Needs `make video-draft POST=eval-gates-not-theater FORCE=1` + re-render before that post's video reflects the expanded content. No video has been published for this post yet.
- **Two orphaned private YouTube videos** (`uCeauS66__g`, `iygil8r50ns`) from an earlier rolled-back fully-automatic run still need manual deletion in YouTube Studio — the upload-only API scope can't delete them.
- Full video-polish punch list (music/captions, transition style, thumbnail, per-post length risk for older series posts): `docs/video-guide.md`, "Known gaps" section.
- Home "Series" strip once 2–3 parts are live.
- Optional per-post cover variety.
- Graph UX under broader #24 if still open.
- Content gap 2015–2024 (#55) if still tracked.

## Gotchas worth knowing before touching video or Hugo rendering

- `themes/PaperMod` is a submodule; a fresh worktree needs `make submodules` (or
  `git submodule update --init`) or every build fails.
- goldmark's `renderer.unsafe` is **false**, so raw HTML in markdown is silently stripped — a `<video>`
  tag just vanishes and the build stays green. Use a shortcode; do not flip the site-wide setting.
- Any `ffmpeg` call inside a `while read` loop needs `-nostdin`, or it eats the loop's input and
  produces plausible-looking but wrong output.
- `ffmpeg zoompan` with `-loop 1 -i img` defaults to 25fps input unless `-framerate` is set explicitly
  to match the filter's own `fps=` — the standard cause of "shaky" Ken Burns motion.
- This session ran on **MacBook Pro 2**, not the Mac Mini (`scutil --get ComputerName` confirms which).
  Repos sync via git, but scratch/tmp paths and local branches do not — check the actual machine before
  handing Dave a file path or a "just run this locally" branch command.
