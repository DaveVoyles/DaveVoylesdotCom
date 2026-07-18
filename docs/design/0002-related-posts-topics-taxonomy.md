# Plan 0002: Related Posts & Topics Taxonomy

## Problem Statement

davevoyles.com's 76 recovered posts have no way for a reader to discover related content beyond the site-wide `/tags/` archive (shipped same-day via #23, alongside a Console visual theme and a full close-out of plan 0001 — D1-D9 all done, all 76 posts currently `draft = false`). Existing `tags` were recently backfilled and cleaned to atomic values, but they're still fine-grained (per-post specifics like "UDK" or "Windows Phone 8") rather than the kind of high-level grouping that makes a good relatedness signal across a blog spanning game dev, general tech, AI/agents, speaking, career advice, and games journalism.

This plan adds a lightweight, build-time "related posts" recommendation, driven by a new curated `topics` taxonomy layered on top of (not replacing) the existing `tags`/`categories` fields — giving readers a "you might also like" surface with no client-side JS or new infrastructure, using Hugo's built-in Related Content feature.

Issue #24 (an Obsidian-style graph visualization of posts linked by shared tags) is the separate, already-deferred, more ambitious version of "connecting posts" — out of scope here, to be grilled as its own follow-on design session.

## User Stories

1. As a reader finishing a post, I want to see related posts so I can keep reading relevant content instead of leaving the site.
2. As a reader interested in a topic (e.g. Gaming), I want to browse all posts under that topic from a single archive page.

## Deliverables

| Deliverable | Size | Acceptance Criteria | Dependencies | Status |
|---|---|---|---|---|
| D1: Deterministic topics-mapping script | S | Maps each post's existing `tags`/`categories` values to the curated topic bucket list (Gaming, Tech, AI / Agents, Public Speaking / Presentations, Career / Students, Journalism / Marketing / PR) via a reviewable lookup table. Posts with no confident mapping are written to a separate report for manual spot-check, never silently guessed. Idempotent (safe to re-run). Does not modify existing `tags`/`categories` fields. | None | Not started |
| D2: Apply topics to all posts | XS | Running D1's script against all 76 posts adds a `topics = [...]` array to each post's front matter. A diff confirms only the `topics` field changed — no `tags`/`categories`/other fields touched. Posts flagged in D1's report are reviewed and assigned by hand. | D1 | Not started |
| D3: Hugo related-content config | XS | `hugo.toml`'s `[related]` block computes relatedness from the `topics` index. A real `hugo --gc --minify` build confirms `.Site.RegularPages.Related` returns sensible results for a sample post with populated topics. | D2 | Not started |
| D4: Related-posts widget template | S | A template partial renders a "Related Posts" section at the bottom of each post, styled to match the current Console theme (both light/dark, contrast-checked). Renders nothing (no empty section) for a post with no related matches. | D3 | Not started |
| D5: Topic archive pages | S | Hugo's auto-generated `/topics/<bucket>/` taxonomy list pages are lightly templated to match the Console theme. Each post's footer links to its topic(s), pointing at these archive pages. Not added to the main nav menu. | D2 | Not started |
| D6: Smoke-test coverage for /topics/ routes | XS | The existing post-deploy smoke test (`.github/workflows/hugo.yml`) is extended to also check a sample `/topics/<bucket>/` route, following the same concurrent-retry pattern already used for `/tags/`, `/archives/`, `/search/` (from #23). | D5 | Not started |

All deliverables are XS/S — build-ready gate satisfied, no decomposition required. (Waiver applied for review: all-XS/S table, plan traces directly to same-conversation grilling with no open architectural questions — chat-based approval substitutes for a Lavish render/poll loop.)

## Testing Decisions

- **D1**: unit-tested against a small fixture set of sample front-matter blocks with known old tags/categories values, verifying correct topic-bucket output and correct flagging of unmappable one-offs.
- **D2**: verified by running the script for real against all 76 posts and inspecting `git diff --stat` (only `topics` lines added) plus hand-checking ~5 posts against expected bucket assignment.
- **D3/D4**: verified via a real `hugo --gc --minify` build — render a post with strong topic overlap (related posts appear and are plausible) and a post with a thin/no-overlap topic set (graceful empty state, no broken markup).
- **D5**: real build, visit a sample `/topics/gaming/` output, confirm correct post listing and Console theme styling.
- **D6**: mirror #23's existing smoke-test script pattern (backgrounded per-path retry, quoted array, `[path]`-tagged log lines) — extend rather than duplicate.

## ⚠️ Irreversible Steps

None. All changes are additive (`topics` field addition, new templates/config, extended smoke test) and fully reversible via `git revert`. No deletions, data-destructive migrations, secret rotation, or external sends are involved.

## Out of Scope

- **Issue #24** (Obsidian-style graph visualization of posts linked by shared tags) — deliberately separate; to be grilled as its own design session immediately following this plan's hand-off.
- Retiring, removing, or rewriting the existing legacy `tags`/`categories` fields.
- Adding `topics` to the main site nav (stays footer-linked only).
- Populating topic buckets 7/8 — reserved for future use, not built now.
- Any change to plan 0001's stale-content triage script or logic — this plan reads legacy tags/categories only for the topics-mapping lookup table, never writes to them.

## Related ADR

- [ADR 0004: topics field is additive, not a replacement](../decisions/0004-topics-field-additive-not-replacement.md)

## Execution Tracking

- Issues: https://github.com/DaveVoyles/DaveVoylesdotCom/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0002
- Board: https://github.com/users/DaveVoyles/projects/2 (Agent Work — all 6 issues seeded to Todo)
