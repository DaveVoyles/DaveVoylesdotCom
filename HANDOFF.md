# Handoff

**In-flight session on branch `claude/website-sidebar-graph-blog-9d2985`** (pushed, no PR opened yet — waiting on Dave's input below before opening one PR for all of it).
**Plans 0001, 0002, and 0003 are all fully complete** — 19 deliverables across three plans merged and closed. No implementation currently in-flight.

## Done this session (committed + pushed)

- `docs(research): capture graph-view UX research (hairball diagnosis)` — `docs/research/graph-view-ux-patterns.md`. Diagnosed why the shipped `/graph/` (plan 0003) reads as unusable: 42.5% edge density, hub posts connected to 62-76% of the graph, driven by generic legacy tags ("Game Dev" 46% of posts, "Programming" 38%). Researched Obsidian/Roam/Logseq/digital-garden precedent; 5 prioritized recommendations (R1-R5).
- `fix(graph): raise edge threshold and down-weight generic tags (R1/R2)` — `layouts/index.graphdata.json`. "Uncategorized" excluded from edges entirely, "Game Dev"/"Game Development"/"Programming" count half-weight, edge now requires combined weight ≥ 2 (was: any single shared tag). Verified via real `hugo` build (edges 1,212 → 319, max degree 57 → 32) plus two hand-checked instance-level pairs (a weight-0.5 pair correctly gets no edge; a weight-2.0 pair correctly gets one) per plan 0003 D1's spot-check convention.
- `feat(home): add year-header grouping to the homepage post list` — new `layouts/index.html`. Reuses Archives' existing `archive-year-header` CSS class, no new styling. Fixed a page-boundary duplicate-header bug (caught by the `testing` review lens) by seeding `$lastYear` from the previous page's last post instead of resetting per page — verified across all 8 paginated pages, no year repeats across a page break.
- `feat(home): add bio + LinkedIn/GitHub sidebar to the homepage` — `hugo.toml`'s `homeInfoParams`/`socialIcons`. Homepage-only (PaperMod has no persistent-sidebar concept — a real cross-page sidebar would've been much bigger custom-layout work). Bio text and social URLs confirmed by Dave in-chat. Verified via real build: bio copy and both social icons/links render correctly.
- **Filed [issue #55](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/55)**: a real content gap, not a display bug — `content/posts/` has nothing between 2015 and 2024. Root cause (already documented, never tracked): plan 0001/D5's HTML→Markdown classifier only handles the `expound` WordPress theme; posts captured under the older `enigma-premium` theme (Wayback coverage through 2021) were silently excluded. Dave confirmed he has posts from ~2020 missing from the site. Issue tracks the gap only — recovery itself is unscoped, future work.
- Ran the `review-lenses` self-review gate (soft lenses only: `code-quality`, `testing`, `code-review` — no `security`/`deployment` triggers on this diff). Fixed everything the lenses caught (see above); verdict should come back clean on re-run.
- 76 posts, all `draft = false`. 75 carry a curated `topics` field (6 controlled-vocabulary buckets: Gaming, Tech, AI and Agents, Public Speaking and Presentations, Career and Students, Journalism and Marketing and PR — 2 reserved buckets currently have zero posts). `hello-world.md` was hand-reviewed and deliberately left without a `topics` field.
- Nav: Home, **Tags**, **Archives**, **Search**, **Graph**. Topics stays footer-linked only, deliberately not in the main nav.
- Each post's footer links to its topic(s) → `/topics/<bucket>/` archive pages. Each post shows a **Related Posts** widget (up to 5, via Hugo's Related Content keyed on `topics`).
- **New: `/graph/`** — an interactive, force-directed graph of all posts (plan 0003). Edges come from shared `tags`/`categories` (not the coarse `topics` field); nodes are colored by `topics` with 6 filter-toggle buttons above the graph. Pan/zoom/click/hover, touch-enabled, no separate mobile view. This is the site's **first client-side JS dependency** ([ADR 0005](docs/decisions/0005-graph-view-introduces-first-client-side-js.md)) — `force-graph@1.51.4` (MIT, pinned CDN version), loaded only on this one page.
- **Known sharp edge (see `docs/learnings.md`'s 2026-07-18/19 entries):** `force-graph`'s real API needs `{nodes, links}`, not `{nodes, edges}` — this bit D2 in production for ~20 minutes before D3's self-review caught it via a headless jsdom+canvas reproduction. If anything ever touches `layouts/graph.html`'s data wiring again, re-verify against the actual bundle, not the JSON field names.
- Visual theme: **"Console"**, via `assets/css/extended/custom.css`. WCAG-AA contrast-checked everywhere, including the graph's topic-color palette (6 colors, light+dark hex pairs, all ≥3.6:1 against both theme backgrounds).
- Deploy pipeline (`.github/workflows/hugo.yml`) smoke-tests `/`, `/tags/`, `/archives/`, `/search/`, `/topics/gaming/`, `/graph/` concurrently post-deploy. Watched green after every plan-0003 merge.
- `tags`/`categories` are legacy WordPress-era fields, read-only for `topics` mapping and now also read-only as the graph's edge source — never written to by any tooling. See `CONTEXT.md`, [ADR 0004](docs/decisions/0004-topics-field-additive-not-replacement.md).
- A taxonomy term value containing a literal `/` gets treated as a URL hierarchy separator by Hugo, not a display character (`docs/learnings.md`, 2026-07-18) — this is why the topic bucket names use "and"/comma-free joins.

## Still open — not blocking, next decision point

- **Graph redesign beyond R1/R2**: research's own sequencing recommends looking at the rendered graph after R1/R2 (done above) before deciding whether R3 (local/ego graph centered on the current post — the pattern every actually-used tool converged on) is still needed. Worth a quick visual check post-merge, then a decision with Dave on R3/R4/R5.
- **PR not yet opened** — was holding for the sidebar; now that it's done, next step is opening the PR for this whole branch.
- **Sidebar navigation + "about me" redesign** — Dave raised this mid-conversation (right after plan 0003's grilling started): a left-hand sidebar for tag-based navigation, and a small "about me" section with 2-3 outbound links (GitHub, LinkedIn). Motivation: keep the site's bare-bones simplicity, but make it a stronger personal/recruiter-facing showcase of his engineering work — the explicit goal is professional online presence, not a redesign for its own sake. **This needs its own grilling session** — deliberately not started yet (noted as Out of Scope in plan 0003, docs/design/0003-post-connections-graph-view.md). No issue filed yet; this is purely a conversation-carried item until grilled.
- **README/docs**: `docs/authoring-guide.md` documents both a chat-driven agent workflow and the manual `hugo new content` flow. `docs/platform-guide.md` covers limitations/styling/images/video.

## Not part of this session (deliberately deferred)

- Recovering the enigma-premium-era posts themselves (#55 is tracking-only).

## Nothing else in-flight

Plans 0001/0002/0003 all previously complete and merged (see git log). This session's branch is the only open work.
No worktrees, background processes, or open PRs against this repo as of this handoff. All plan 0003 issues (#45-#48) closed; all four deliverables' worktrees torn down and branches pruned.
