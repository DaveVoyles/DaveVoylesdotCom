---
title: "Clean new URL scheme, not preserving legacy WordPress permalinks"
status: accepted
date: 2026-07-18
---

# 0003 — Clean new URL scheme, not preserving legacy WordPress permalinks

## Status

Accepted

## Context and Problem Statement

The original WordPress site used a mix of permalink structures —
`/YYYY/MM/DD/slug/` for most dated posts, and bare `/slug/` for others
(including many that were actually image attachment pages rather than
posts). External sites (old interviews, GDC talk pages, other blogs) may
still link to specific old davevoyles.com URLs, and those URLs may still be
indexed by search engines.

The rebuilt site needs to decide whether migrated posts keep their exact old
URLs (via a per-post redirect/override) or move to Hugo's default URL
scheme.

## Decision Drivers

- Simplicity of the migration script and the resulting site structure
- Whether preserving inbound links/search ranking is worth the added
  per-post mapping complexity

## Considered Options

1. Match each recovered post's original URL exactly (front-matter URL
   override per post)
2. Use Hugo's default clean URL scheme (e.g. `/posts/slug/`) for all content,
   old and new alike

## Decision Outcome

Chosen option: **use Hugo's default clean URL scheme for all content.**

This was an explicit, informed trade-off: the user accepted the loss of any
surviving old inbound links and search-engine ranking under the old URLs, in
exchange for a simpler migration script (no per-post legacy-path mapping to
get right and maintain) and a simpler, more consistent site structure going
forward.

### Consequences

- Good: migration script and resulting content structure are meaningfully
  simpler — one clean URL scheme for both recovered and future posts.
- Good: no legacy-path edge cases (the old site's mixed dated/non-dated
  permalink structure, including attachment-page URLs that were never real
  posts) leak into the new site's routing.
- Bad: any external links or search-engine results pointing at old
  `davevoyles.com/YYYY/MM/DD/slug/` or `davevoyles.com/slug/` URLs will
  404 on the new site rather than redirecting to the migrated content.
- Bad: any accumulated search ranking for those specific URLs is lost; the
  new URLs start from zero.

This is a reversible decision in principle (a redirects map could be added
later if broken inbound links turn out to matter), but is recorded as an ADR
because it's a real, deliberate trade-off rather than an oversight.
