# Handoff

**In-flight session on branch `claude/website-sidebar-graph-blog-9d2985`** (pushed, no PR opened yet — waiting on Dave's input below before opening one PR for all of it).

## Done this session (committed + pushed)

- `docs(research): capture graph-view UX research (hairball diagnosis)` — `docs/research/graph-view-ux-patterns.md`. Diagnosed why the shipped `/graph/` (plan 0003) reads as unusable: 42.5% edge density, hub posts connected to 62-76% of the graph, driven by generic legacy tags ("Game Dev" 46% of posts, "Programming" 38%). Researched Obsidian/Roam/Logseq/digital-garden precedent; 5 prioritized recommendations (R1-R5).
- `fix(graph): raise edge threshold and down-weight generic tags (R1/R2)` — `layouts/index.graphdata.json`. "Uncategorized" excluded from edges entirely, "Game Dev"/"Game Development"/"Programming" count half-weight, edge now requires combined weight ≥ 2 (was: any single shared tag). Verified via real `hugo` build (edges 1,212 → 319, max degree 57 → 32) plus two hand-checked instance-level pairs (a weight-0.5 pair correctly gets no edge; a weight-2.0 pair correctly gets one) per plan 0003 D1's spot-check convention.
- `feat(home): add year-header grouping to the homepage post list` — new `layouts/index.html`. Reuses Archives' existing `archive-year-header` CSS class, no new styling. Fixed a page-boundary duplicate-header bug (caught by the `testing` review lens) by seeding `$lastYear` from the previous page's last post instead of resetting per page — verified across all 8 paginated pages, no year repeats across a page break.
- `feat(home): add bio + LinkedIn/GitHub sidebar to the homepage` — `hugo.toml`'s `homeInfoParams`/`socialIcons`. Homepage-only (PaperMod has no persistent-sidebar concept — a real cross-page sidebar would've been much bigger custom-layout work). Bio text and social URLs confirmed by Dave in-chat. Verified via real build: bio copy and both social icons/links render correctly.
- **Filed [issue #55](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/55)**: a real content gap, not a display bug — `content/posts/` has nothing between 2015 and 2024. Root cause (already documented, never tracked): plan 0001/D5's HTML→Markdown classifier only handles the `expound` WordPress theme; posts captured under the older `enigma-premium` theme (Wayback coverage through 2021) were silently excluded. Dave confirmed he has posts from ~2020 missing from the site. Issue tracks the gap only — recovery itself is unscoped, future work.
- Ran the `review-lenses` self-review gate (soft lenses only: `code-quality`, `testing`, `code-review` — no `security`/`deployment` triggers on this diff). Fixed everything the lenses caught (see above); verdict should come back clean on re-run.

## Still open — not blocking, next decision point

- **Graph redesign beyond R1/R2**: research's own sequencing recommends looking at the rendered graph after R1/R2 (done above) before deciding whether R3 (local/ego graph centered on the current post — the pattern every actually-used tool converged on) is still needed. Worth a quick visual check post-merge, then a decision with Dave on R3/R4/R5.
- **PR not yet opened** — was holding for the sidebar; now that it's done, next step is opening the PR for this whole branch.

## Not part of this session (deliberately deferred)

- Recovering the enigma-premium-era posts themselves (#55 is tracking-only).

## Nothing else in-flight

Plans 0001/0002/0003 all previously complete and merged (see git log). This session's branch is the only open work.
