---
title: "Backlinks and graph edges share one build-time reverse-link index"
status: accepted
date: 2026-07-19
---

# 0009 — Backlinks and graph edges share one build-time reverse-link index

## Status

Accepted

## Context and Problem Statement

Plan 0004 needs two related-but-distinct features once wikilinks exist (ADR
0008): a "Backlinks" section on each vault note showing what links to it
(the core "second brain" discovery pattern ssp.sh and Obsidian both use),
and new edges in the existing graph view (plan 0003, `/graph/`) connecting
vault notes to each other and to posts. Hugo has no native "what links
here" index — computing it requires a build-time pass that scans all
content for wikilink references and inverts them into a reverse index.

The question: build this once and share it, or build two separate,
purpose-specific scans?

## Decision Drivers

- Both features need exactly the same underlying fact: "which pages link to
  page X." A backlink list is that fact rendered as prose; a graph edge is
  that same fact rendered as a line between two nodes.
- Plan 0003 already established the pattern of computing derived data (the
  graph's node/edge JSON) at Hugo build time via a custom output format,
  rather than client-side — this plan's reverse-link index follows the same
  shape.
- Building two independent scans over the same content would mean two
  places that could drift out of sync (e.g. a backlink shown in the UI that
  doesn't appear as a graph edge, or vice versa).

## Considered Options

1. **One shared wikilink-scan index (chosen)** — a single build-time Hugo
   template pass produces the reverse-link index; both the Backlinks UI
   (D6) and the graph's new edges (D7) read from it.
2. **Two separate scans** — a purpose-built pass for backlinks, a separate
   purpose-built pass for graph edges, each computing its own view of the
   same underlying link data.

## Decision Outcome

Chosen option: **one shared index (option 1)**. The reverse-link scan is
computed once; the Backlinks partial and the graph-data JSON generator
(extending plan 0003's `layouts/index.graphdata.json`) both consume it.

### Consequences

- Good: backlinks shown on a vault note page and edges shown in `/graph/`
  can never drift out of sync — they're two views of the same computed
  fact, not two independently maintained ones.
- Good: extends plan 0003's precedent of computing relational data at Hugo
  build time (mirroring the existing tag/topic-based edge computation)
  rather than introducing a second, differently-shaped computation pattern.
- Bad: this is a new build-time computation pattern beyond what plan 0003
  established (a full-content wikilink scan, not just a frontmatter
  tag/category comparison) — a precedent for how future "what links here"
  or similar derived-data features get built in this codebase.
- Neutral: the graph's existing shared-tag/topic edges (plan 0003) are
  untouched by this index — wikilink-derived edges are additive, computed
  and rendered separately, not merged into the same edge-weighting logic.
