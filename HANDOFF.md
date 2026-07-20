# Handoff

**Plans 0001-0003 are fully complete and live.** Plan 0004 (ssp.sh-inspired sidebar, sticky TOC, and a new Vault section) is **planned and exported, not yet implemented** — 8 issues (#59-66) created with dependency-wired blocking relationships, all seeded to the Agent Work board's Todo column. No implementation session has claimed any of them yet.

## Plan 0004 — what's next

- Doc: `docs/design/0004-ssp-inspired-sidebar-toc-vault.md`. Companion ADRs: 0006 (sidebar-based page shell), 0007 (vault taxonomy separate from `topics`), 0008 (first custom markdown render hook), 0009 (build-time reverse-link index).
- Issues: https://github.com/DaveVoyles/DaveVoylesdotCom/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0004 — frontier starts at D1 (#59, unblocked) and D4 (#62, unblocked); D2/D3/D5/D6/D7/D8 are chain-blocked behind them.
- A fresh `orchestrate` session should claim the frontier and work it per the plan's dependency chain — one orchestrator only (two racing the same frontier lost both races in a prior pilot).
- Actual vault note-writing (content population) is explicitly out of scope for this plan — D8 only seeds 3-5 example notes to prove the mechanism end to end.

## Current live state (davevoyles.com)

- 76 posts, all `draft = false`. 75 carry a curated `topics` field (6 controlled-vocabulary buckets). `hello-world.md` deliberately left without one.
- Nav: Home, Tags, Archives, Search, Graph. Topics stays footer-linked only.
- **Homepage**: bio + social sidebar via PaperMod's built-in home-info block (homepage-only today — plan 0004/D1 replaces this with a persistent, site-wide sidebar), plus year-header grouping on the post list.
- **`/graph/`** — interactive force-directed graph (plan 0003), edges from shared `tags`/`categories`, nodes colored by `topics`. First client-side JS dependency ([ADR 0005](docs/decisions/0005-graph-view-introduces-first-client-side-js.md)). Plan 0004/D7 extends this with vault-note nodes and wikilink-derived edges, additive to the existing tag-based edges.
- Deploy pipeline (`.github/workflows/hugo.yml`) smoke-tests `/`, `/tags/`, `/archives/`, `/search/`, `/topics/gaming/`, `/graph/` post-deploy. Both plan 0004 doc-only PRs (#58, #67) watched green.

## Open follow-up work (not blocking, no active session)

- **Content gap, [issue #55](https://github.com/DaveVoyles/DaveVoylesdotCom/issues/55):** nothing in `content/posts/` between 2015-2024 — a legacy WordPress-theme migration gap, recovery unscoped.
- **Graph follow-ups R3-R5** (ego graph, click-to-recenter/search, degree-based node sizing) — noted but not required by plan 0004; still open.
- **Minor local-only cleanup:** the local branch ref `claude/blog-design-ssp-inspiration-2e26c6` in this worktree couldn't be auto-pruned (its local tip diverged from the merged PR's SHA after an in-session `git reset --hard` + recommit maneuver during this session's own branch cleanup). Both the corresponding remote branch and its sibling `docs/plan-0004-execution-tracking` (local + remote) were pruned cleanly. Harmless — no unique content, just a stale local ref; safe to `git branch -D claude/blog-design-ssp-inspiration-2e26c6` by hand next time this worktree is used.

## Nothing currently in-flight

PRs #58 and #67 (plan 0004's doc + execution-tracking) both merged and CI-green. This session's worktree is not being torn down (harness-managed; see the cleanup note above) — the next session can reuse it or start fresh via `orchestrate` to work plan 0004's frontier.
