# Handoff

**2026-08-10 — dropped Xbox fleet lifecycle body image.**

## What shipped this session

| Work | Notes |
|------|--------|
| xbox-slas-to-agent-fleets | Removed inline lifecycle image (`xbox-agent-fleet-lifecycle.jpg`) from markdown and deleted static file. Push to main republishes via GHA. |

## Local-only (not committed)

- `.gitignore` may still have extra landing-floor ignore lines vs origin.

## Where to start next session

1. Hard-refresh live Xbox post if CDN still sticky: https://davevoyles.com/posts/xbox-slas-to-agent-fleets/
2. Preview scheduled posts: `make preview` → claim-safety / what-i-will-not-automate.

## Do not

- Do not edit `themes/PaperMod/` for site features — overrides live in `layouts/` and `assets/`.
- Do not invent claim-unsafe metrics — see `docs/claim-safe-facts.md`.
