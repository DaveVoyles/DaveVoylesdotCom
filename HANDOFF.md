# Handoff

**2026-08-07 — session closed: series post expansion + images.**

## What shipped this session

| Work | Notes |
|------|--------|
| Writing standard | Expanded 3 thin series posts to ~800–1300w conversational prose (authoring-guide 2026-07-28). |
| xbox-slas-to-agent-fleets | Live on davevoyles.com — expanded + 4 body/cover images (governance, Partner Center, monolithic→fleets, lifecycle). |
| claim-safety-evidence-before-metrics | Expanded; images for no-evidence, validation workflow (cover), theater-vs-real. **Source-of-truth body image #2 removed** (file deleted). Scheduled **2026-08-11**. |
| what-i-will-not-automate | Expanded; 3 images (irreversible gate cover, human judgment, claim-invention). Scheduled **2026-08-14**. |
| Image hygiene | URL-safe slugs under `static/images/posts/`, &lt;1MB gate, spacey/root uploads cleaned; Partner Center/gamesetup exact-duplicate dropped. |

## Local-only (not committed)

- `.gitignore` may still have extra landing-floor ignore lines vs origin.

## Where to start next session

1. Optional: hard-refresh live Xbox post if CDN still sticky: https://davevoyles.com/posts/xbox-slas-to-agent-fleets/
2. Preview scheduled posts: `make preview` → claim-safety / what-i-will-not-automate.
3. Later series (tokens, landing floor) already drafted; no image pass requested this session.

## Do not

- Edit `themes/PaperMod/` for features — overrides live in `layouts/` / `assets/`.
- Invent compound tags; reuse vocabulary via `make list-tags`.
- Claim metrics outside `docs/claim-safe-facts.md`.
