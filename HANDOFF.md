# Handoff

**2026-07-24 — agent platform affordances + auto-publish.**

## What just shipped

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

## Nothing currently in-flight

Auto-publish + agent-platform pass landed on `main` (`d2c0806`, `5e0d34d`). Working tree clean; next session starts clean.
