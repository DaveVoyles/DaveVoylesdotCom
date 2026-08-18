# Handoff

**2026-08-18 — docs-only voice guidance + idea playbook (#143).**

## What shipped this session

| Work | Notes |
|------|--------|
| Voice report + do/don't | Extended `docs/authoring-guide.md` writing standard (2026-07-28). Reviewed series posts 2026-07-28 → 2026-08-18. No parallel voice file. |
| Idea-generating playbook | New short numbered workflow: `docs/idea-playbook.md`. Chat-Agents mission dashboard → `docs/` → existing series slugs. Output is title + one-line angle; do not draft posts. No second tracker. |
| Router links | `AGENTS.md` task table, authoring-guide, series operator card, README repo map, platform-guide “ask the agent” row. |
| #143 wording nits | Authorship verb is now “extended and operates.” Landing-floor: already scheduled / do not re-pitch (ideas); do not mine as published voice (authoring). |

## Local-only (not committed)

- `.gitignore` still has extra landing-floor ignore lines vs origin. Leave them; not part of #143.

## Where to start next session

1. If Dave wants a draft, use `docs/authoring-guide.md` (voice + claim-safe). If he wants a pick-list, use `docs/idea-playbook.md` and stop.
2. Do not flip series dates/drafts unless he asks. `landing-floor-without-a-github-app` stays 2026-08-21.
3. Remaining #141-adjacent CSS debt from the prior handoff still stands if someone is on design tokens.

## Do not

- Do not write new blog posts from the idea playbook.
- Do not invent claim-unsafe metrics — see `docs/claim-safe-facts.md`.
- Do not create a second ideas board / backlog file; the series table in `docs/series/agent-production-system.md` is the series tracker.
- Do not edit `themes/PaperMod/` for site features — overrides live in `layouts/` and `assets/`.
