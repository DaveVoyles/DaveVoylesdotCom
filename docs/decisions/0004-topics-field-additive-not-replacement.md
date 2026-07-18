---
title: "New `topics` taxonomy is additive, not a replacement for tags/categories"
status: accepted
date: 2026-07-18
---

# 0004 — New `topics` taxonomy is additive, not a replacement for tags/categories

## Status

Accepted

## Context and Problem Statement

Plan 0002 introduces a curated, high-level `topics` taxonomy (Gaming, Tech,
AI / Agents, Public Speaking / Presentations, Career / Students, Journalism /
Marketing / PR) to drive a related-posts feature. The existing `tags` and
`categories` front-matter fields are fine-grained (specific engines,
platforms, dead technologies like XBLIG or UDK) and, as of #23, already
reasonably clean/atomic — but still too granular to serve as a clean
relatedness signal across the site's full topical range.

The question: does the new `topics` field replace `tags`/`categories`
outright, or coexist alongside them?

## Decision Drivers

- Plan 0001's stale-content triage script (D6) uses the existing fine-grained
  `tags`/`categories` values (e.g. spotting `XBLIG`, `UDK`, `Windows Phone 8`)
  as a dead-tech signal. Destroying that granularity removes a signal D6 (and
  any future similar tooling) depends on.
- Avoiding a one-way destructive rewrite across all 76 posts' front matter.
- Willingness to run two parallel taxonomies (fine-grained `tags`/
  `categories`, high-level `topics`) going forward, once new posts start
  using `topics`.

## Considered Options

1. **Replace** — rewrite `tags`/`categories` in all posts to only the new
   curated `topics` values.
2. **Additive** — introduce `topics` as a new field; leave `tags`/
   `categories` untouched as legacy/historical metadata.

## Decision Outcome

Chosen option: **additive (option 2)**. `topics` is a new, separate,
multi-value front-matter field. `tags` and `categories` remain exactly as
they are — read from, but never written to, by plan 0002's tooling.

### Consequences

- Good: no destructive rewrite of existing content; fully reversible via
  `git revert` at the file level regardless.
- Good: preserves the fine-grained legacy signal for plan 0001's D6 triage
  logic and any future tooling that wants it.
- Good: the retagging script only ever adds a field, so it's trivially safe
  to re-run or partially apply.
- Bad: going forward, the site runs two parallel taxonomies — a
  fine-grained `tags`/`categories` pair and a high-level `topics` field.
  Once new posts start using `topics` as the primary reader-facing
  taxonomy, this becomes the de facto standard and is hard to walk back
  without another migration.
- Neutral: `tags` and `categories` remain visible/browsable via the
  already-shipped `/tags/` nav archive; `topics` gets its own, separate
  `/topics/` archive (footer-linked, not in nav) rather than replacing it.
