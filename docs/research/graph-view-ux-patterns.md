# Research: Graph/Network Visualization UX Patterns — Applied to davevoyles.com's `/graph/`

**Date:** 2026-07-19
**Trigger:** Plan 0003 (`docs/design/0003-post-connections-graph-view.md`) shipped a global force-directed graph at `/graph/` (all 4 deliverables merged: `layouts/graph.html`, `layouts/index.graphdata.json`). Site owner's reaction: *"It isn't very usable or practical. It just looks like a whole web of things."* This matches the concern GitHub issue #24 raised up front about high-degree tags ("Game Dev", "Programming") clumping into a hairball.
**Scope:** Research only — no code changes. Diagnoses why the current design produces a hairball and recommends fixes, grounded in how established tools (Obsidian, Roam, Logseq) and well-known digital gardens handle the same problem.

---

## 1. Quantifying the actual problem on this site

Before citing outside sources, it's worth establishing that this isn't a vague aesthetic complaint — it's measurable, and the numbers explain exactly why the graph reads as a hairball even at only 76 posts.

Computed directly from `content/posts/*.md` frontmatter (`tags` + `categories` union, matching `layouts/index.graphdata.json`'s edge logic exactly):

- **76 posts, 101 unique tag/category terms.**
- **Top terms by post coverage:** "Game Dev" appears on 35/76 posts (46%), "Programming" on 29/76 (38%), "Windows 8" on 19/76 (25%), **"Uncategorized" on 16/76 (21%)** — a literal placeholder with zero topical signal — "Javascript / HTML5" on 16/76 (21%).
- **Edge density:** of the 2,850 possible post-pairs (76 choose 2), **1,212 pairs (42.5%) share at least one tag/category** and therefore draw an edge under the current "any shared tag draws an edge" rule (plan 0003 explicitly deferred a minimum-shared-tag threshold as "not architecturally significant").
- **Degree distribution:** average node degree is ~32 (a post connects, on average, to 32 of the other 75 posts). The top hub posts — e.g. `professional-game-development-tools.md` (57), `programming-pickups-for-vehicles-in-udk-tutorial-is-up.md` (55), `death-sentence-website-is-live.md` (55) — connect to **62–76% of every other post in the graph**, purely because they carry one or two high-frequency legacy tags.
- **Taxonomy fragmentation compounds it:** "XBLIG", "XNA", and "XNA / XBLIG" are three separate terms for what is conceptually one topic; same for "Javascript / HTML5" vs "JavaScript" vs "HTML5". Splitting one topic into near-duplicate tags actually *understates* true relatedness while the generic tags above *overstate* it.

This is the textbook profile of what the graph-visualization literature calls a **hairball**: a small-to-medium node count with a scale-free, power-law degree distribution driven by a handful of hub terms, not a raw "too many nodes" scaling problem (Edge et al., cited below, characterize hairballs by exactly this signature — high edge:node ratio, power-law degree distribution, low modularity — independent of absolute graph size).

## 2. What makes graph views work well elsewhere

### Obsidian: local graph as the default-useful mode, global graph as a toy

Obsidian ships two distinct modes, not one graph with a toggle:

- **Global graph** — all notes and links, vault-wide.
- **Local graph** — only the notes connected to the *currently open* note, with a **depth slider** (1–4+ hops) controlling how far out from that note to expand. "Each level of depth will show notes connected to the notes revealed at the previous depth." ([Obsidian Help — Graph view](https://obsidian.md/help/plugins/graph))

Node size scales with connectivity ("the more nodes that reference a given node, the bigger it gets"), and the **Filters** panel lets a user search by term, toggle tags/attachments, hide orphan nodes, and restrict to existing files only. **Groups** let a user define color-coded subsets by saved search (e.g. "all notes tagged #project"), which is closer to *curated* clustering than automatic community detection. Notably, Obsidian's own documentation gives **no guidance at all on taming hub-node clutter** in the global graph — in practice, most Obsidian power users report the global graph is a pretty screensaver they check once, while the **local graph is the one they actually navigate with day to day** (community consensus reflected across forum threads on depth-slider and filtering requests — [Improved Filtering of Local Graph](https://forum.obsidian.md/t/improved-filtering-of-local-graph/35937), [Add a Depth Slider to Filtered Graph View](https://forum.obsidian.md/t/add-a-depth-slider-to-filtered-graph-view/11571)).

The load-bearing design decision here isn't "better force layout" — it's **defaulting to an ego-centered view scoped to what the user is currently reading**, with the unscoped global view as an optional, secondary artifact.

### Roam Research: the cautionary tale

Roam's global graph view is widely reported to become **useless past a few hundred pages** — not from bad taste, but because the force-layout algorithm itself degrades: "Beyond a certain page count, Graph View no longer generates a layout and becomes useless," falling back to an unstructured grid ([Roam-Research/issues#10](https://github.com/Roam-Research/issues/issues/10)). One user's comment captures the emotional cost precisely: *"it made me quite sad to see the feature disabled as a result of my enthusiastic note-taking."* A comparative write-up ranks Obsidian's graph experience above Roam's and Logseq's specifically because Roam's lacks the local/contextual scoping ([Comparing RoamResearch graph-view with Logseq and Obsidian](https://medium.com/alvistor/comparing-roamresearch-graph-view-with-logseq-and-obsidian-b0c1fd51c2ee)). Roam is the strongest available evidence that **shipping only a global graph, with no local/ego mode, is the actual failure mode** — not an edge case to design around later.

### Logseq: users explicitly ask for what Obsidian already has

Logseq's own community forum has open threads asking for the ability to "focus on a certain node in Graph view and see other nodes linked to it" ([Logseq Discourse — graph view confusion thread](https://discuss.logseq.com/t/confusion-about-the-graph-view-whats-the-point-of-it-if-you-rely-on-blocks-and-journals/28136)) — i.e., users hitting the same wall and asking for Obsidian's local-graph pattern by name. This is corroborating evidence, not a new pattern.

### Digital gardens that are actually navigated by real people skip the global graph entirely

This was the most useful (and initially counter-intuitive) finding. The two most-cited exemplar "digital gardens" in this space do **not** ship a global force-directed graph as their primary navigation:

- **Andy Matuschak's notes** (the original inspiration for most "networked notes" sites) have **no graph view and no index at all** — the site states outright: *"For now, there's no index or navigational aids: you'll need to follow a link to some starting point."* ([notes.andymatuschak.org — About these notes](https://notes.andymatuschak.org/About_these_notes)). Discovery is 100% link-following from a hand-picked entry point, plus in-page backlink panels.
- **Maggie Appleton's garden** — arguably the most well-known public digital garden — has **no graph visualization either**. Its navigation is topic filters, a growth-stage taxonomy (Seedling / Budding / Evergreen), content-type filters (Essays / Notes / Patterns / Talks), and reverse-chronological listing ([maggieappleton.com/garden](https://maggieappleton.com/garden)).

Both sites are held up constantly as the reference implementations of "networked thought published on the web," and neither uses a global graph as its actual UI. Their designers converged on **curated, low-cardinality categorical navigation** (topic, stage, type) over automatic network layout. This directly supports treating the coarse 6-bucket `topics` field — which this site already has and which plan 0002's related-posts widget and `/topics/` archives already use — as the primary discovery surface, with the graph as a secondary, opt-in exploration toy rather than the thing carrying navigation weight.

### The general graph-UX literature: name the failure modes, then design against them

Cambridge Intelligence's graph visualization UX guide names three failure patterns directly relevant here ([Graph visualization UX: Designing intuitive data experiences](https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/)):

- **Hairballs** — excessive connections; fix with filtering and "surfacing important entities" via social-network-analysis-style metrics (degree, centrality) rather than showing every edge.
- **Starbursts** — a hub node so much more connected than everything else that it dominates the visual; the guide's recommended fixes are blunt: "redesigning data models, limiting expansion, grouping less critical nodes, or removing central nodes entirely." "Game Dev" and "Programming" on this site, at 46% and 38% post-coverage respectively, are starburst hubs by this definition.
- **Snowstorms** — the opposite failure, too sparse to show real structure; not this site's problem today, but worth knowing so a future edge-weight threshold isn't tuned so aggressively it produces one.

The guide's overarching principle: **progressive disclosure** — "detail on demand" via interactive filtering/zooming/clustering — rather than rendering the complete dataset at once. This is architecturally the same conclusion Obsidian's local-graph-by-default reaches from the tool side.

The academic literature on dense-graph "hairball" cleanup (network science, not personal-notes tooling) converges on the same diagnosis from a different angle. Edge et al., *"Trimming the Hairball: Edge Cutting Strategies for Making Dense Graphs Usable"* (Microsoft Research / IEEE BigData 2018), formally characterize hairball graphs by **high edge-to-node ratio, a scale-free power-law degree distribution, and low modularity** — precisely this site's profile (42.5% edge density, degree range 8–57, generic tags acting as universal connectors). Their edge-cutting approach — pruning low-mutual-information edges down to a target density (e.g. 5 edges/node) before re-adding within-community edges — improved graph modularity from 0.26 to 0.77 in their test case, i.e. **removing low-signal edges is what let real community structure become visible at all** ([paper landing page](https://www.markusmobius.org/publications/trimming-hairball-edge-cutting-strategies-making-dense-graphs-usable); [IEEE Xplore record](https://ieeexplore.ieee.org/document/8622521/)). The tag-cloud literature reaches an analogous conclusion from the tagging side: raw frequency-based prominence "overlooks semantic context... amplifying noise from overly common but uninformative terms," and filtering facilities (frequency thresholds, short-tag filters) are described as *essential*, not optional, once a tag vocabulary grows past a trivial size (general tag-cloud/tagging-network UX literature, e.g. discussion synthesized in searches of ACM/arXiv tagging-network papers on collaborative tagging dynamics).

Finally, the ego-network visualization literature (used in social-network analysis, not note-taking tools, but directly transferable) confirms the mechanism behind why scoping to one node helps: egocentric views "considerably improve visual search efficiency and navigation performance" precisely by excluding everything not connected to the node of interest, which is what removes the clutter that causes hairballs in the first place ([Egocentric Network Exploration for Immersive Analytics, arXiv:2109.09547](https://arxiv.org/pdf/2109.09547); [Egocentric Network overview, ScienceDirect](https://www.sciencedirect.com/topics/computer-science/egocentric-network)).

## 3. Diagnosis: why "one global force graph of everything" fails here specifically

Putting the numbers (§1) and the literature (§2) together, the failure has three independent, compounding causes — worth naming separately because they call for different fixes:

1. **No edge-weight floor.** Plan 0003 deliberately drew an edge for *any* single shared tag/category, deferring a minimum-threshold as "not architecturally significant." At this site's actual tag distribution, that decision alone produces 1,212 edges across 76 nodes (42.5% of all possible pairs) — a density any force-directed layout will render as an undifferentiated mass, independent of layout algorithm quality. This is the single largest lever, and the research above (Edge et al.'s modularity jump from 0.26→0.77 purely from edge-cutting) suggests it was undersized as "just a tunable."
2. **Generic/legacy tags act as universal connectors, not topical signal.** "Game Dev" (46% of posts), "Programming" (38%), and literally "Uncategorized" (21%, a placeholder with no meaning at all) mean two posts about unrelated subjects both showing "Game Dev" get an edge exactly as strong as two posts that are genuinely about the same narrow thing. This is the "starburst hub" failure pattern named directly in the Cambridge Intelligence source above.
3. **No local/ego scoping — the graph only offers the global, all-at-once view.** Every tool and site surveyed above that people actually navigate day-to-day (Obsidian's local graph, and — more strikingly — both Andy Matuschak's and Maggie Appleton's gardens, which skip the graph pattern entirely) defaults to either a node-scoped view or a curated low-cardinality taxonomy, never an unfiltered global network as the primary navigation surface. davevoyles.com's `/graph/` currently only offers the latter.

None of these three is really about "76 posts is too many for a force graph" (Roam users hit real algorithmic failure past ~600 pages; this site is nowhere near that). The failure is structural/data-driven, not a raw scale problem — which is good news, because it means the fix is in the edge-construction rules and the interaction model, not a rewrite of the rendering layer.

## 4. Recommendations for davevoyles.com, prioritized

### R1 (highest priority, cheapest to ship): add a minimum shared-tag threshold before drawing an edge

Plan 0003 explicitly deferred this ("a tunable, not an architectural decision... can be adjusted post-launch by looking at the real rendered graph") — this research is exactly the "looking at the real rendered graph" data point that was deferred pending. Given the measured 42.5% edge density and hub degrees of 47-57, a `weight >= 2` threshold (i.e., posts must share **two or more** tags/categories, not one) is a reasonable first cut — it directly targets the "one generic tag in common" false-edge problem while preserving edges built on genuine multi-tag overlap. This only requires changing one comparison (`gt $sharedCount 0` → `gt $sharedCount 1`) in `layouts/index.graphdata.json`.
**Tradeoff:** will likely produce isolated (zero-edge) nodes for posts that only ever shared one tag with anything else — D2's acceptance criteria already require the isolated-node case to render without crashing, so this is a known-handled edge case, not a new risk. Recommend re-running the same degree/edge-density analysis done in §1 after raising the threshold, to confirm it actually broke up the hub structure rather than just thinning it uniformly.

### R2: exclude or down-weight the highest-frequency/placeholder tags from edge computation

"Uncategorized" (16 posts, no topical meaning) should be excluded from edge computation outright — it is definitionally noise, not signal. "Game Dev" and "Programming" (46% and 38% of all posts respectively) are candidates for down-weighting (e.g., a shared occurrence of these two terms counts as 0.5 toward the edge weight rather than 1) rather than outright exclusion, since they're not meaningless — they're just too broad to be discriminating at this site's scale. This mirrors the "starburst" fix from Cambridge Intelligence (grouping/limiting dominant hubs) and the tag-cloud literature's point that raw frequency amplifies noise.
**Tradeoff:** an excluded/down-weighted-tags list is a hand-maintained heuristic, not a computed one — it will need occasional revisiting as new posts are tagged (a `tech-debt`-style quarterly check would catch drift). It also means the site owner is making an editorial call about which tags "count," which is a small but real departure from the current fully-mechanical edge rule.

### R3: ship a local/ego graph centered on the current post, not just the global view

This is the single most consistent pattern across every tool surveyed that people actually use for navigation (Obsidian's local-graph-by-default; the absence of any global graph at all on Matuschak's and Appleton's sites, replaced by link-following/topic-filtering). Concretely: on each post page (or as a `/graph/?post=<slug>` entry point), render only the current post plus its directly-connected neighbors (depth 1, optionally a depth-2 toggle mirroring Obsidian's slider), rather than opening straight into the full 76-node graph. The existing `/graph/` global view can stay as a secondary "explore everything" mode reachable via a link, but shouldn't be the default or only entry point.
**Tradeoff:** this is the most implementation work of the five recommendations — it needs either a per-post subgraph computed at build time (extending D1's JSON, keyed by post) or a client-side filter-to-neighbors-of-clicked-node interaction added to the existing force-graph.js render. Given plan 0003's precedent of keeping scope tight (XS/S/M sizing, no framework), the client-side filter approach (reuse the D3-style click-to-recenter pattern already partly present in D3's topic-toggle logic in `layouts/graph.html`) is likely cheaper than a new build-time output format.

### R4: click-to-recenter and search-to-highlight as interaction affordances on the existing global view

Independent of whether R3 ships, two specific interaction patterns are worth adding to the current global graph regardless: (a) clicking a node re-centers/zooms the view on that node and dims everything outside depth-1/2 of it (this is effectively R3's local-graph behavior, implemented as an interaction mode on the same view rather than a separate page — the cheaper of the two ways to get the same benefit); (b) a text search box that highlights matching nodes and dims non-matches, the same "search to focus" pattern Obsidian's Filters panel and the Cambridge Intelligence guide both call out. Both are pure client-side JS additions to `layouts/graph.html`'s existing `force-graph` instance — no new build-time data needed.
**Tradeoff:** low risk, but note this doesn't fix the underlying density problem by itself (R1/R2 still needed) — it's a navigation aid layered on top of whatever the edge set ends up being.

### R5 (lower priority / optional): degree-based node sizing

Obsidian scales node size by connectivity ("the more nodes that reference a given node, the bigger it gets") — this gives an immediate visual cue for which posts are hubs without needing to hover each one. Cheap to add (`force-graph`'s `nodeVal` accessor already supports sizing by an arbitrary field; D1's JSON would need a precomputed degree count per node, or it can be derived client-side from the edges array already being fetched).
**Tradeoff:** if R1/R2 aren't also done, degree-based sizing on the current unpruned graph will just visually confirm "Game Dev" and "Programming"-tagged posts are enormous blobs — it's a clarity aid on top of a sane edge set, not a substitute for fixing the edge set. Sequence this after R1/R2, not before.

## 5. Suggested sequencing

R1 and R2 are the load-bearing fixes — they attack the actual data-density cause identified in §3 and are the cheapest to implement (small template edits, no new JS). Ship those first and re-look at the rendered graph (per plan 0003's own stated post-launch tuning approach) before deciding whether R3's local-graph view is still needed or whether pruning alone made the global view usable. R4's interaction affordances are additive and can land independently at any point. R5 is cosmetic polish, sequenced last.

## Sources

- [Obsidian Help — Graph view](https://obsidian.md/help/plugins/graph)
- [Obsidian Forum — Improved Filtering of Local Graph](https://forum.obsidian.md/t/improved-filtering-of-local-graph/35937)
- [Obsidian Forum — Add a Depth Slider to Filtered Graph View](https://forum.obsidian.md/t/add-a-depth-slider-to-filtered-graph-view/11571)
- [Roam-Research/issues#10 — Graph View becomes useless past a certain page count](https://github.com/Roam-Research/issues/issues/10)
- [Comparing RoamResearch graph-view with Logseq and Obsidian (Medium)](https://medium.com/alvistor/comparing-roamresearch-graph-view-with-logseq-and-obsidian-b0c1fd51c2ee)
- [Logseq Discourse — "Confusion about the graph view"](https://discuss.logseq.com/t/confusion-about-the-graph-view-whats-the-point-of-it-if-you-rely-on-blocks-and-journals/28136)
- [Andy Matuschak — About these notes](https://notes.andymatuschak.org/About_these_notes)
- [Maggie Appleton — The Garden](https://maggieappleton.com/garden)
- [Cambridge Intelligence — Graph visualization UX: Designing intuitive data experiences](https://cambridge-intelligence.com/graph-visualization-ux-how-to-avoid-wrecking-your-graph-visualization/)
- Edge, Larson, Mobius, White — [Trimming the Hairball: Edge Cutting Strategies for Making Dense Graphs Usable](https://www.markusmobius.org/publications/trimming-hairball-edge-cutting-strategies-making-dense-graphs-usable) (IEEE BigData 2018; [IEEE Xplore record](https://ieeexplore.ieee.org/document/8622521/))
- [Egocentric Network Exploration for Immersive Analytics, arXiv:2109.09547](https://arxiv.org/pdf/2109.09547)
- [Egocentric Network — overview, ScienceDirect Topics](https://www.sciencedirect.com/topics/computer-science/egocentric-network)
- Site data: `content/posts/*.md` frontmatter (76 posts) and `layouts/index.graphdata.json` edge logic, analyzed directly in this repo for §1's numbers.

## Related repo context

- `docs/design/0003-post-connections-graph-view.md` — the plan that shipped the current graph, including the explicit deferral of a minimum shared-tag threshold (§ "Out of Scope") that R1 above revisits with data.
- `layouts/index.graphdata.json` — build-time edge generation (D1); the `gt $sharedCount 0` comparison R1 would change.
- `layouts/graph.html` — the interactive `/graph/` page (D2/D3); the topic-toggle filter logic here is the natural place to add R4's click-to-recenter/search-to-highlight affordances.
