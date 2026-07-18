# Handoff

**Plan 0001 (rebuild davevoylescom-blog) and Plan 0002 (related-posts widget + curated `topics` taxonomy) are both fully complete** — all 15 deliverables across both plans merged and closed. No implementation currently in-flight.

## Current live state (davevoyles.com)

- 76 posts, all `draft = false`. 75 carry a curated `topics` field (6 controlled-vocabulary buckets: Gaming, Tech, AI and Agents, Public Speaking and Presentations, Career and Students, Journalism and Marketing and PR — 2 reserved buckets currently have zero posts). `hello-world.md` was hand-reviewed and deliberately left without a `topics` field (a modern placeholder post fitting no curated bucket).
- Nav: Home, **Tags**, **Archives**, **Search**. Topics stays footer-linked only, deliberately not in the main nav.
- Each post's footer links to its topic(s) → `/topics/<bucket>/` archive pages (auto-generated Hugo taxonomy, styled via the existing Console theme classes, no new CSS needed).
- Each post shows a **Related Posts** widget (up to 5, driven by Hugo's Related Content feature keyed on the `topics` field) at the bottom, before the footer — renders nothing for a post with no topic overlap.
- Visual theme: **"Console"** (near-black/phosphor-green dark, warm-paper/forest-green light), via `assets/css/extended/custom.css`. WCAG-AA contrast-checked, including the new Related Posts / topic-archive elements.
- Deploy pipeline (`.github/workflows/hugo.yml`) smoke-tests `/`, `/tags/`, `/archives/`, `/search/`, `/topics/gaming/` concurrently post-deploy. Watched green after the final plan-0002 merge.
- `tags`/`categories` are legacy WordPress-era fields (cleaned to atomic values in #23), read-only for `topics` mapping, never written to — see `CONTEXT.md` and [ADR 0004](docs/decisions/0004-topics-field-additive-not-replacement.md).
- **Known Hugo gotcha (see `docs/learnings.md`'s 2026-07-18 entry):** a taxonomy term value containing a literal `/` gets treated as a URL hierarchy separator, not a display character — this is why the topic bucket names use "and"/comma-free joins instead of "/". Keep this in mind before adding any new taxonomy or controlled-vocabulary field.

## Open follow-up work (not blocking, no active session)

- **Issue #24** — Obsidian-style graph view of posts linked by shared tags. This is the original, more ambitious "connect blog posts" ask; plan 0002 deliberately built the smaller related-posts-widget version instead and left #24 untouched. **Dave asked to grill this next** — a fresh grilling session should pick this up as the next design conversation on this repo, now informed by both plan 0002's `topics` taxonomy and its `/`-in-taxonomy-terms gotcha as potential graph-node/edge data considerations.
- **README/docs**: `docs/authoring-guide.md` documents both a chat-driven agent workflow and the manual `hugo new content` flow. `docs/platform-guide.md` covers limitations/styling/images/video.

## Nothing currently in-flight

No worktrees, background processes, or open PRs against this repo as of this handoff. All plan 0002 issues (#29-#34) closed; all six deliverables' worktrees torn down and branches pruned.
