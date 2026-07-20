# Plan 0003: Post Connections Graph View

## Problem Statement

Issue #24 asked for an Obsidian-style graph visualization connecting davevoyles.com's posts — the more ambitious "connect blog posts" idea plan 0002 deliberately deferred in favor of the smaller related-posts widget and curated `topics` taxonomy (both shipped). With plan 0002 closed, this plan builds the graph view itself: an interactive, force-directed visualization where posts are nodes, edges are drawn from shared `tags`/`categories` (the fine-grained legacy fields — richer and denser than the coarse 6-bucket `topics` taxonomy, which plan 0002's related-posts widget and `/topics/` archives already cover), and node color comes from `topics` purely as a visual grouping cue.

This is the first davevoyles.com feature that needs real client-side interactivity — see [ADR 0005](../decisions/0005-graph-view-introduces-first-client-side-js.md) for the decision to introduce a scoped, lightweight JS dependency rather than a static image or a full framework.

## User Stories

1. As a reader curious how a post connects to the rest of the site, I want to explore an interactive graph, hover a node to see its title, and click through to read it.
2. As a reader interested in one subject area, I want to dim/hide unrelated posts by toggling a topic filter, so the graph isn't overwhelming.

## Deliverables

| Deliverable | Size | Acceptance Criteria | Dependencies | Status |
|---|---|---|---|---|
| D1: Build-time graph data (JSON output format) | S | A Hugo custom output format (JSON) computed by a Hugo template at build time — mirroring the site's existing search-index pattern (`hugo.toml`'s `[outputs] home = ['HTML', 'RSS', 'JSON']`, already feeding `fastsearch.js`). Emits one node per published post (id, title, permalink, primary `topics` value for color) and one edge per pair of posts sharing at least one `tags`/`categories` value, weighted by the number of shared values. A real `hugo --gc --minify` build confirms the output is valid JSON with a node for every published post and at least one edge for a known-connected pair (e.g. two posts both tagged `Unity`). | None | Done (#45, PR #50) |
| D2: Interactive `/graph/` page | M | A standalone page at `/graph/`, added to `hugo.toml`'s `[[menu.main]]` alongside Tags/Archives/Search. Loads D1's JSON and renders a force-directed graph via a small, actively-maintained, permissively-licensed JS library selected at implementation time (no framework/bundler). Supports pan/zoom (mouse and touch — no separate mobile view), hovering a node shows its title as a tooltip, clicking a node navigates to that post. Styled to match the Console theme (base chrome, default node/edge colors, tooltip), contrast-checked for both light/dark. Renders correctly with zero edges for an isolated post (no crash, node just has no connecting lines). | D1 | Done (#46, PR #51) |
| D3: Topic-based node coloring + filter toggles | S | Nodes are colored by their `topics` value (reusing the 6-bucket color key). A row of toggle buttons/checkboxes, one per topic bucket, dims or hides non-matching nodes when toggled off. Toggle UI styled to match the Console theme, contrast-checked for both light/dark (new colors introduced beyond D2's base palette). A post with no `topics` value (per plan 0002, one such post exists) renders in a neutral/default color rather than being miscategorized. | D2 | Done — actual M, estimated S (#47, PR #52; a critical force-graph API mismatch found during self-review) |
| D4: Smoke-test coverage for `/graph/` | XS | The existing post-deploy smoke test (`.github/workflows/hugo.yml`) is extended to also check `/graph/`, following the same concurrent-retry pattern already used for `/tags/`, `/archives/`, `/search/`, `/topics/gaming/` (from #23, plan 0002/D6). | D2 | Done (#48, PR #53) |

All deliverables are XS/S/M — build-ready gate satisfied, no decomposition required.

## Testing Decisions

- **D1**: verified via a real `hugo --gc --minify` build — inspect the generated JSON for valid structure, a node count matching the published-post count, and at least one known-connected edge (two posts sharing a specific tag, checked by hand).
- **D2**: verified via a real build plus a rendered visual check — following the precedent set during the Console theme rollout (extracting compiled HTML/CSS/JS and publishing a real rendered snapshot as an Artifact, rather than a hand-authored mockup) — confirming pan/zoom, hover-tooltip, and click-to-navigate all work, and that an isolated (zero-edge) post renders without error. No JS unit-test framework exists in this repo yet and none is introduced for one page's interaction logic (would be scope creep for a single-page feature) — verification is real-build-plus-manual/visual, matching how D3/D4 of plan 0002 (the related-posts widget) were verified.
- **D3**: same real-build-plus-visual approach as D2, plus a WCAG contrast check (simple luminance formula, no external tool — same technique used throughout this repo) on every new topic color against both the light and dark theme backgrounds.
- **D4**: mirror plan 0002/D6's smoke-test pattern (backgrounded per-path retry, quoted array, `[path]`-tagged log lines) — extend rather than duplicate. The CI run triggered by the merge is watched to green (`gh run watch`), not just assumed.

## ⚠️ Irreversible Steps

None. All changes are additive (a new JSON output format, a new page/template, a new scoped JS asset, a new nav entry, an extended smoke test) and fully reversible via `git revert`. No deletions, data-destructive migrations, secret rotation, or external sends are involved.

## Out of Scope

- **Which specific force-graph JS library** — deferred to D2's implementation (small footprint, active maintenance, permissive license, good performance at ~100-200 nodes are the stated criteria; the choice itself isn't architecturally significant enough to block this plan).
- **A separate simplified mobile view** — explicitly rejected during grilling; the same interactive graph renders everywhere, touch-enabled.
- **Using the `topics` taxonomy as graph edges** — topics are coarse (6 buckets) and already power plan 0002's related-posts widget and `/topics/` archives; this plan's edges come from the fine-grained `tags`/`categories` fields instead, with `topics` reserved for node color only.
- **A minimum shared-tag threshold for drawing an edge** — any single shared tag/category draws an edge, with visual weight (thickness/opacity) scaling by shared-tag count; this is a tunable, not an architectural decision, and can be adjusted post-launch by looking at the real rendered graph.
- **Full-text search integration with the graph** (e.g. searching within the graph view itself) — the existing `/search/` page is unrelated and unaffected.
- **A separate sidebar-navigation / "about me" redesign of the site's overall layout** — a distinct, unrelated request Dave raised in the same conversation as this plan; tracked as its own follow-on grilling session, not part of this plan.

## Related ADR

- [ADR 0005: Graph view introduces the site's first client-side JS dependency](../decisions/0005-graph-view-introduces-first-client-side-js.md)

## Execution Tracking

- Issues: https://github.com/DaveVoyles/DaveVoylesdotCom/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0003
- Board: https://github.com/users/DaveVoyles/projects/2 (Agent Work — all 4 issues seeded to Todo)
