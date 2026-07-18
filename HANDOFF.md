# Handoff

**Plan 0001 (rebuild davevoylescom-blog) is fully complete** — all 9 deliverables merged and closed. **Plan 0002 (related-posts widget + curated `topics` taxonomy) is grilled, approved, and exported** — docs persisted (PRs #28, #35), 6 issues created and dependency-wired, all seeded to the Agent Work board's Todo column. No implementation has started yet.

## Current live state (davevoyles.com)

- 76 posts, all `draft = false`, all content migration/triage/image-cleanup done.
- Nav: Home, **Tags**, **Archives**, **Search**.
- Visual theme: **"Console"** (near-black/phosphor-green dark, warm-paper/forest-green light), via `assets/css/extended/custom.css`. WCAG-AA contrast-checked. Verify any *new* page template added later actually inherits this (see `docs/learnings.md`'s 2026-07-18 entry).
- Deploy pipeline (`.github/workflows/hugo.yml`) smoke-tests `/`, `/tags/`, `/archives/`, `/search/` concurrently post-deploy.
- `tags`/`categories` are legacy WordPress-era fields (cleaned to atomic values in #23). A new `topics` field (plan 0002) will be added alongside them, never replacing — see `CONTEXT.md` and [ADR 0004](docs/decisions/0004-topics-field-additive-not-replacement.md).

## Plan 0002 frontier (docs/design/0002-related-posts-topics-taxonomy.md)

Open, unblocked, unassigned issue right now: **#29 (D1 — deterministic topics-mapping script)**. Everything else (#30 D2, #31 D3, #32 D5, #33 D4, #34 D6) is blocked behind it in sequence — see the plan doc's Dependencies column. Claim via the `orchestrate` skill.

## Open follow-up work (not blocking, no active session)

- **Issue #24** — Obsidian-style graph view of posts linked by shared tags. This is the original, more ambitious "connect blog posts" ask; plan 0002 deliberately built the smaller related-posts-widget version instead and left #24 untouched. **Dave asked to grill this next**, right after plan 0002's hand-off — a fresh grilling session should pick this up as the very next design conversation on this repo, now informed by plan 0002's topics taxonomy as potential graph-node data.
- **README/docs**: `docs/authoring-guide.md` documents both a chat-driven agent workflow and the manual `hugo new content` flow. `docs/platform-guide.md` covers limitations/styling/images/video.

## Nothing currently in-flight

No worktrees, background processes, or open PRs against this repo as of this handoff.
