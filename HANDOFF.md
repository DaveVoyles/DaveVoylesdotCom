# Handoff

**2026-07-27 — plan 0005 post-to-video spike executed; awaiting Dave's verdict.**

## What shipped in the previous pass (2026-07-24 — agent platform affordances + auto-publish)

| Work | Notes |
|------|--------|
| Auto-publish (Approach A) | Series parts 1–8: `draft=false` + future dates; daily cron on Hugo workflow ≈10:00 ET |
| `AGENTS.md` | Thin router for agents |
| `docs/claim-safe-facts.md` | Allowed metrics, bans, constellation node ids, topics |
| `scripts/check-content.sh` | Topics, covers, series_weight, claim patterns, internal `/posts/` links — runs in CI before build |
| `scripts/new-series-post.sh` + `archetypes/series.md` | Scaffold scheduled series posts |
| `scripts/list-tags.sh` | Tag vocabulary dump |
| Series nav partial | `layouts/partials/series_nav.html` auto prev/next/index from `series` + `series_weight` |
| `Makefile` | `preview`, `build`, `check`, `list-future`, `list-tags`, `submodules` |

## Where to start next session

1. Read **`AGENTS.md`**, then the doc for your task.  
2. `make submodules` if PaperMod is empty.  
3. `make check && make preview` before content work.  
4. Claim-safe facts: **`docs/claim-safe-facts.md`**.

## Live / schedule

- **Live:** series overview `/posts/agent-production-system/`  
- **Next auto-ship:** part 1 `eval-gates-not-theater` on **2026-07-31** (after daily rebuild)  
- Full schedule: `docs/series/agent-production-system.md`

## Open / not blocking

- Home “Series” strip once 2–3 parts are live  
- Optional per-post cover variety  
- Graph UX under broader #24 if still open  
- Content gap 2015–2024 (#55) if still tracked  

## In flight — plan 0005 awaiting Dave's verdict

**Skill: none for the wait itself.** If Dave says go, that is new feature work → `grilling` → `design-plans`.

Plan 0005 (post-to-video spike) is **executed and closed** — D1–D5, issues #92–#96 all closed with
verbatim probe evidence. Everything lives on **`prototype/post-video-pipeline`**, which is deliberately
never merged to `main`; nothing from it touches the live site.

- Findings + verdict packet: `video-prototype/PROTOTYPE.md` **on that branch**, not on `main`.
- Final artifact: 72.47s, 9.56 MB, 1920×1080/30fps, −17.0 LUFS. Full cold rebuild: 24.4s.
- **Waiting on Dave:** whether Kokoro's voice is good enough to publish (subjective — no agent has judged
  it), and whether to build the production pipeline (Remotion template, `make-video`, a Hugo shortcode
  on `main`). Nothing proceeds until he calls it.

To reproduce the video: `cd video-prototype && ./build_video.sh all`, then `./preview.sh` for the local
Hugo embed. Needs `brew install espeak-ng` and a 3.13 venv — the machine's `python3` is 3.14, ahead of
PyTorch wheel coverage. `PROTOTYPE.md` has the setup block.

## Gotchas worth knowing before touching video or Hugo rendering

- `themes/PaperMod` is a submodule; a fresh worktree needs `make submodules` (or
  `git submodule update --init`) or every build fails.
- goldmark's `renderer.unsafe` is **false**, so raw HTML in markdown is silently stripped — a `<video>`
  tag just vanishes and the build stays green. Use a shortcode; do not flip the site-wide setting.
- Any `ffmpeg` call inside a `while read` loop needs `-nostdin`, or it eats the loop's input and
  produces plausible-looking but wrong output.
