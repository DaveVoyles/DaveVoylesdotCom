# Handoff

**2026-08-05 — docker-homelab-agent-ops screenshots, closed out.**

## What shipped this pass

| Work | Notes |
|------|--------|
| Images on post | `content/posts/docker-homelab-agent-ops.md` embeds `Plex.jpg` after the isolation/repeatability paragraph and `docker-containers.jpg` after the Watchtower bullet. |
| Plex size fix | `static/images/posts/Plex.jpg` resized/compressed (1600px long edge, ~399KB) — was 1.4MB and failing `make check`'s 1MB gate on main before this change. |
| Push | Commit `65386ad` on `main` → `origin/main`. |

## Local-only (not committed)

- `.gitignore` has a few extra landing-floor script ignore lines vs origin (empty-findings, claim-holder-state, default-branch). Untracked local scripts under `scripts/lib/` / `review-lens-empty-findings.sh` may still be present from enable-landing-floor.

## Where to start next session

1. Read **`AGENTS.md`**, then the doc for your task.
2. Remaining unused image from the Aug 5 drop: `static/images/posts/mac-runner-vis.jpg` (Mac Mini Runner Visibility dashboard) — not wired into a post yet.
3. `make check` / `make preview` for content work.

## Do not

- Edit `themes/PaperMod/` for features — overrides live in `layouts/` / `assets/`.
- Invent compound tags; reuse vocabulary via `make list-tags`.
- Claim metrics outside `docs/claim-safe-facts.md`.
