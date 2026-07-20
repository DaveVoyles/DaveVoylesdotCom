# Plan 0004: Persistent Sidebar, Sticky TOC & a New "Vault" Section

## Problem Statement

Dave admired [ssp.sh](https://www.ssp.sh/), a fellow Hugo site pairing a blog with a "Second Brain" of interlinked notes, and asked for three things this site doesn't have today: a persistent author sidebar (currently the bio only renders in a one-off hero block at the top of the homepage, via PaperMod's built-in `home_info.html` partial), a sticky/scroll-aware table of contents on posts (PaperMod ships a `toc.html` partial and `single.html` already calls it conditionally on a `ShowToc` param, but no post enables it and it isn't sticky today), and a "second brain"-style vault of short interlinked notes.

The graph view itself — issue #24, connecting posts by shared `tags`/`categories` — already shipped in plan 0003 (PR #56), so this plan doesn't rebuild that mechanism. What's missing is the atomic "note" content type that ssp.sh's DE Vault feeds into its graph, and this site has nothing equivalent. Plan 0003's Out of Scope section flagged this exact sidebar/layout request as "a distinct, unrelated request Dave raised in the same conversation... tracked as its own follow-on grilling session, not part of this plan" — this plan is that follow-on.

Preceded by a 7-round grilling session with Dave (2026-07-19); all decisions below were confirmed there, and the design review carried zero open architectural questions into Lavish.

## Deliverables

| Deliverable | Size | Acceptance Criteria | Dependencies | Status |
|---|---|---|---|---|
| D1: Site-wide two-column shell | M | New `layouts/partials/sidebar.html` renders the bio (photo, name/title, bio text, social icons — sourced from existing `[params.homeInfoParams]`/`[[params.socialIcons]]` in `hugo.toml`) in a left rail. Restructures `layouts/_default/baseof.html` (or equivalent shared wrapper) so the rail appears on homepage, post-list, tag, vault, and graph pages. Top nav bar is unchanged — no navigation moves into the sidebar. Below ~1024px the rail collapses to a stacked card via CSS reflow only (no separate mobile markup/partial). A real `hugo` build confirms the shell renders on every page type without breaking existing pages. | None | Todo |
| D2: Post-page three-column variant | S | Extends D1's shell specifically for `layouts/single.html`: bio (left) \| article (center) \| a reserved TOC rail (right) on desktop widths. Below ~1024px the TOC rail collapses to an inline collapsible "Contents" block above the article body, reusing the same markup at every width (CSS-only reflow, matching D1's pattern). | D1 | Todo |
| D3: Sticky, scroll-spy TOC | S | Reuses PaperMod's existing `toc.html` partial's heading-extraction/anchor-slugging logic — no reimplementation of heading parsing. Adds sticky CSS positioning for the TOC container in D2's right rail, plus one new vanilla-JS file using `IntersectionObserver` to toggle an "active" class on the link for the section currently in view. `ShowToc` flips to default `true` site-wide via `hugo.toml` params (not per-post frontmatter) — activates on all 76 existing posts without editing them; any post can still opt out individually. No new client-side dependency beyond this one small file (site's only other JS dependency is the graph view's `force-graph`, per ADR 0005). | D2 | Todo |
| D4: Vault content section scaffolding | M | New Hugo content section `content/vault/*.md`, flat namespace (no subfolders), URL `/vault/<slug>/`. New archetype for vault notes. A dedicated vault taxonomy is declared in `hugo.toml` (see ADR 0007) — separate from `tags`/`categories`/`topics`. List/single templates render vault notes inside D1's two-column shell; a `/vault/` index lists all notes. A real `hugo` build confirms a seed note renders correctly at its URL. | D1 | Todo |
| D5: Wikilink render hook | S | New `layouts/_default/_markup/render-link.html`, a Hugo markdown render hook. `[[Note Title]]` syntax in any post or vault note's markdown resolves to the correct `/vault/<slug>/` URL (or `/posts/<slug>/` if a post title matches) in the built HTML. An unresolvable target (no matching title) renders as plain text rather than a broken link, and logs a Hugo build warning so a typo'd wikilink is visible, not silent. | D4 | Todo |
| D6: Backlink index + UI | M | A build-time Hugo template pass scans all content (posts + vault) for `[[wikilink]]` references and produces a reverse "linked from" index. Every vault note page renders a "Backlinks" section listing every other post/note that links to it, tagged Post or Vault. A note with no incoming links renders a clean empty state, not a blank/broken section. | D5 | Todo |
| D7: Graph integration | M | Extends the existing `layouts/index.graphdata.json` (from plan 0003) to include vault notes as a visually distinct node type (different color/shape from post nodes), with new edges sourced from D6's wikilink index. Existing shared-tag/topic edges between posts are untouched — this is additive only, verified by confirming the pre-existing post-to-post edge count is unchanged after the change. | D5, D6 | Todo |
| D8: Seed vault notes | XS | 3-5 real vault notes exist, proving D4-D7 end to end: at least one `[[wikilink]]` cross-link between two vault notes, and at least one `[[wikilink]]` from an existing blog post into the vault. Both connections are visibly present in `/graph/` and in the linked notes' Backlinks sections after a real build. | D7 | Todo |

All deliverables are XS/S/M — build-ready gate satisfied, no decomposition required.

## Testing Decisions

No JS test framework or npm exists in this repo (pure Hugo build, one CDN JS dependency introduced so far — the graph view's `force-graph`, per ADR 0005). The seam for every deliverable is a real `hugo build` exiting clean, followed by an assertion against the generated `public/` output — matching the verification pattern plan 0003 already used for its graph-data JSON and rendered pages.

- **D1/D2**: `hugo build` succeeds across every page type; manual browser check (via the `run` skill) at desktop and sub-1024px widths confirms both the two- and three-column shells render and collapse correctly.
- **D3**: manual scroll-through in browser confirming sticky positioning and active-link highlighting; no automated JS test exists for this repo's one hand-rolled script file, consistent with how D2/D3 of plan 0003 verified the graph page's interaction logic.
- **D4**: `hugo build` succeeds with the new content section; inspect `public/vault/<slug>/index.html` for the expected rendered output.
- **D5**: two seed notes cross-linking via `[[wikilink]]`; build, then inspect the rendered HTML for the resolved `href`, plus a deliberately unresolvable `[[wikilink]]` to confirm the plain-text fallback and build warning.
- **D6**: same technique — build, then inspect the target note's rendered Backlinks section for the expected reverse link, and confirm the empty-state renders cleanly for a note with no incoming links.
- **D7**: build, then inspect the generated `graph-data.json` for the new vault nodes and wikilink edges, confirming the pre-existing post-to-post edge count is unchanged.
- **D8**: full site build clean; manual review of the seed notes' rendered pages and their appearance in `/graph/`.

## ⚠️ Irreversible Steps

None. Every change is a template or content addition — a new partial, a new content section, a new render hook, a new build-time index, new seed content — fully reversible via `git revert`. No deletions, data-destructive migrations, secret rotation, or external sends are involved.

## Out of Scope

- **Writing the full vault note library.** This plan scaffolds the section and proves it with a handful of seed notes (D8); ongoing content population is future work, not part of this build.
- **Moving site navigation into the sidebar.** The sidebar (D1) carries the bio only; top nav stays exactly where PaperMod renders it today — considered and rejected during grilling.
- **Any change to the existing tag/topic-based graph edges.** D7's wikilink edges are additive alongside plan 0003's shared-tag/topic edges, not a replacement.
- **Graph follow-ups R3-R5** (ego/local graph per post, click-to-recenter/search, degree-based node sizing) — tracked separately in `HANDOFF.md` as plan 0003 follow-ups, not required here.
- **An off-canvas drawer pattern for the sidebars on mobile.** Considered during grilling; CSS-only stacked/inline collapse was chosen instead to avoid introducing new interaction/JS for a responsive concern.
- **Reusing the `topics` taxonomy for vault notes.** Considered during grilling; a dedicated vault taxonomy was chosen instead — see ADR 0007.

## Related ADRs

- [ADR 0006: Sidebar-based page shell](../decisions/0006-sidebar-based-page-shell.md)
- [ADR 0007: Vault taxonomy is separate from `topics`](../decisions/0007-vault-taxonomy-separate-from-topics.md)
- [ADR 0008: First custom markdown render hook](../decisions/0008-first-custom-markdown-render-hook.md)
- [ADR 0009: Build-time reverse-link index](../decisions/0009-build-time-reverse-link-index.md)

## Execution Tracking

- Issues: https://github.com/DaveVoyles/DaveVoylesdotCom/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0004
- Board: https://github.com/users/DaveVoyles/projects/2 (Agent Work — all 8 issues seeded to Todo)
