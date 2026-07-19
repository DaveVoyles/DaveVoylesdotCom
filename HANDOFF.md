# Handoff

**Plans 0001, 0002, and 0003 are all fully complete** — 19 deliverables across three plans merged and closed. No implementation currently in-flight.

## Current live state (davevoyles.com)

- 76 posts, all `draft = false`. 75 carry a curated `topics` field (6 controlled-vocabulary buckets: Gaming, Tech, AI and Agents, Public Speaking and Presentations, Career and Students, Journalism and Marketing and PR — 2 reserved buckets currently have zero posts). `hello-world.md` was hand-reviewed and deliberately left without a `topics` field.
- Nav: Home, **Tags**, **Archives**, **Search**, **Graph**. Topics stays footer-linked only, deliberately not in the main nav.
- Each post's footer links to its topic(s) → `/topics/<bucket>/` archive pages. Each post shows a **Related Posts** widget (up to 5, via Hugo's Related Content keyed on `topics`).
- **New: `/graph/`** — an interactive, force-directed graph of all posts (plan 0003). Edges come from shared `tags`/`categories` (not the coarse `topics` field); nodes are colored by `topics` with 6 filter-toggle buttons above the graph. Pan/zoom/click/hover, touch-enabled, no separate mobile view. This is the site's **first client-side JS dependency** ([ADR 0005](docs/decisions/0005-graph-view-introduces-first-client-side-js.md)) — `force-graph@1.51.4` (MIT, pinned CDN version), loaded only on this one page.
- **Known sharp edge (see `docs/learnings.md`'s 2026-07-18/19 entries):** `force-graph`'s real API needs `{nodes, links}`, not `{nodes, edges}` — this bit D2 in production for ~20 minutes before D3's self-review caught it via a headless jsdom+canvas reproduction. If anything ever touches `layouts/graph.html`'s data wiring again, re-verify against the actual bundle, not the JSON field names.
- Visual theme: **"Console"**, via `assets/css/extended/custom.css`. WCAG-AA contrast-checked everywhere, including the graph's topic-color palette (6 colors, light+dark hex pairs, all ≥3.6:1 against both theme backgrounds).
- Deploy pipeline (`.github/workflows/hugo.yml`) smoke-tests `/`, `/tags/`, `/archives/`, `/search/`, `/topics/gaming/`, `/graph/` concurrently post-deploy. Watched green after every plan-0003 merge.
- `tags`/`categories` are legacy WordPress-era fields, read-only for `topics` mapping and now also read-only as the graph's edge source — never written to by any tooling. See `CONTEXT.md`, [ADR 0004](docs/decisions/0004-topics-field-additive-not-replacement.md).
- A taxonomy term value containing a literal `/` gets treated as a URL hierarchy separator by Hugo, not a display character (`docs/learnings.md`, 2026-07-18) — this is why the topic bucket names use "and"/comma-free joins.

## Open follow-up work (not blocking, no active session)

- **Sidebar navigation + "about me" redesign** — Dave raised this mid-conversation (right after plan 0003's grilling started): a left-hand sidebar for tag-based navigation, and a small "about me" section with 2-3 outbound links (GitHub, LinkedIn). Motivation: keep the site's bare-bones simplicity, but make it a stronger personal/recruiter-facing showcase of his engineering work — the explicit goal is professional online presence, not a redesign for its own sake. **This needs its own grilling session** — deliberately not started yet (noted as Out of Scope in plan 0003, docs/design/0003-post-connections-graph-view.md). No issue filed yet; this is purely a conversation-carried item until grilled.
- **README/docs**: `docs/authoring-guide.md` documents both a chat-driven agent workflow and the manual `hugo new content` flow. `docs/platform-guide.md` covers limitations/styling/images/video.

## Nothing currently in-flight

No worktrees, background processes, or open PRs against this repo as of this handoff. All plan 0003 issues (#45-#48) closed; all four deliverables' worktrees torn down and branches pruned.
