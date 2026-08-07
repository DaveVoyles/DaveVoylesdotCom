# Handoff

**2026-08-07 — expanded three series posts to writing standard; Xbox republished.**

## What shipped this pass

| Work | Notes |
|------|--------|
| xbox-slas-to-agent-fleets | Expanded ~488 → ~1418w; pushed so live `/posts/xbox-slas-to-agent-fleets/` updates for image scouting. |
| claim-safety-evidence-before-metrics | Expanded ~497 → ~1286w (scheduled 2026-08-11). |
| what-i-will-not-automate | Expanded ~461 → ~1138w (scheduled 2026-08-14). |
| make check | PASSED |

## Local-only (not committed)

- `.gitignore` may still have extra landing-floor ignore lines vs origin (left out of this commit on purpose).

## Where to start next session

1. Dave adding body images once scouting live Xbox post text — drop under `static/images/posts/`, keep &lt;1MB, wire with `![alt](/images/posts/…)`.
2. Optional same image pass for claim-safety / what-i-will-not-automate when those dates approach.
3. `make check` / `make preview` for content work.

## Do not

- Edit `themes/PaperMod/` for features — overrides live in `layouts/` / `assets/`.
- Invent compound tags; reuse vocabulary via `make list-tags`.
- Claim metrics outside `docs/claim-safe-facts.md`.
