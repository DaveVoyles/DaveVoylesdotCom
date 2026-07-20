# Handoff

**Plans 0001, 0002, and 0003 are all fully complete**, plus a follow-on session (PR #56, merged and deployed) shipped the homepage sidebar, graph hairball fixes, and homepage year grouping. No implementation currently in-flight.

## Current live state (davevoyles.com)

- 76 posts, all `draft = false`. 75 carry a curated `topics` field (6 controlled-vocabulary buckets: Gaming, Tech, AI and Agents, Public Speaking and Presentations, Career and Students, Journalism and Marketing and PR — 2 reserved buckets currently have zero posts). `hello-world.md` was hand-reviewed and deliberately left without a `topics` field.
- Nav: Home, **Tags**, **Archives**, **Search**, **Graph**. Topics stays footer-linked only, deliberately not in the main nav.
- Each post's footer links to its topic(s) → `/topics/<bucket>/` archive pages. Each post shows a **Related Posts** widget (up to 5, via Hugo's Related Content keyed on `topics`).
- **Homepage** (PR #56): a bio + LinkedIn/GitHub sidebar via PaperMod's built-in home-info block (homepage-only — PaperMod has no persistent-sidebar concept, so every-page would've been much bigger custom-layout work), plus year-header grouping on the post list (`layouts/index.html`, a full project-level override of the theme's home template — Hugo has no partial-extend mechanism, so if the PaperMod submodule is ever bumped, diff its `list.html` home branch against this file by hand).
- **`/graph/`** — an interactive, force-directed graph of all posts (plan 0003). Edges come from shared `tags`/`categories` (not the coarse `topics` field); nodes are colored by `topics` with 6 filter-toggle buttons above the graph. Pan/zoom/click/hover, touch-enabled, no separate mobile view. First client-side JS dependency ([ADR 0005](docs/decisions/0005-graph-view-introduces-first-client-side-js.md)) — `force-graph@1.51.4` (MIT, pinned CDN version), loaded only on this page. `layouts/graph.html` already translates the JSON's `edges` field into the `links` field `force-graph`'s real API expects (confirmed by grepping the pinned bundle) — this translation is the fix for a real production bug hit during plan 0003/D2, so re-verify against the actual bundle, not just JSON field names, if this wiring is ever touched again.
  - **Edge-weighting (PR #56, research-backed — `docs/research/graph-view-ux-patterns.md`):** the original "any single shared tag draws an edge" rule produced a hairball (42.5% edge density, hub posts touching 62-76% of the graph). Now: the "Uncategorized" placeholder tag is excluded outright, generic hub tags ("Game Dev"/"Game Development"/"Programming") count half-weight, and an edge requires combined weight ≥ 2. Result: 319 edges (was 1,212), max node degree 32 (was 57). Verified via real build plus hand-checked instance-level pairs.
  - **Still open / next decision point:** the research's own sequencing recommends looking at the rendered graph now that R1/R2 are live before deciding whether R3 (a local/ego graph centered on the current post — the pattern every actually-used comparable tool converged on) is still needed, plus R4 (click-to-recenter/search-to-highlight) and R5 (degree-based node sizing). No decision made yet either way.
- Visual theme: **"Console"**, via `assets/css/extended/custom.css`. WCAG-AA contrast-checked everywhere, including the graph's topic-color palette and the Related Posts/topic-archive elements.
- Deploy pipeline (`.github/workflows/hugo.yml`) smoke-tests `/`, `/tags/`, `/archives/`, `/search/`, `/topics/gaming/`, `/graph/` concurrently post-deploy. Watched green after PR #56's merge; site live-curl-verified 200 on `/` and `/graph/`.
- `tags`/`categories` are legacy WordPress-era fields, read-only for `topics` mapping and as the graph's edge source — never written to by any tooling. See `CONTEXT.md`, [ADR 0004](docs/decisions/0004-topics-field-additive-not-replacement.md).
- A taxonomy term value containing a literal `/` gets treated as a URL hierarchy separator by Hugo, not a display character (`docs/learnings.md`, 2026-07-18) — this is why the topic bucket names use "and"/comma-free joins.

## Open follow-up work (not blocking, no active session)

- **Content gap, [issue #55](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/55):** `content/posts/` has nothing between 2015 and 2024. Root cause (already documented, previously untracked): plan 0001/D5's HTML→Markdown classifier only handles the `expound` WordPress theme; posts captured under the older `enigma-premium` theme (Wayback coverage through 2021) were silently excluded from the migration entirely. Dave confirmed he has posts from ~2020 missing from the site. Issue tracks the gap only — recovery (extending/writing a new classifier for that theme, per the issue's suggested next step) is unscoped future work.
- **Graph redesign beyond R1/R2** — see "Still open / next decision point" above.
- **README/docs**: `docs/authoring-guide.md` documents both a chat-driven agent workflow and the manual `hugo new content` flow. `docs/platform-guide.md` covers limitations/styling/images/video.

## Nothing currently in-flight

No open PRs against this repo as of this handoff. All plan 0001-0003 issues and PR #56 closed/merged; this session's worktree/branch is being torn down as part of close-out.
