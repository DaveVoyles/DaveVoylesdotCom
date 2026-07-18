---
title: "Graph view introduces the site's first client-side JS dependency"
status: accepted
date: 2026-07-18
---

# 0005 — Graph view introduces the site's first client-side JS dependency

## Status

Accepted

## Context and Problem Statement

Issue #24 asks for an Obsidian-style graph visualization of posts, connected
by shared tags/categories, with pan/zoom/click-to-navigate interactivity.
davevoyles.com is currently a fully static Hugo build: the only JS on the
site today is PaperMod's bundled `fastsearch.js`, and every other feature
built so far (related posts, topic archives, tag/category archives) is
zero-JS server-rendered HTML.

An interactive, force-directed graph — with real-time layout physics,
pan/zoom, and hover/click interaction — is not achievable as static HTML.
The question: does this feature justify introducing a client-side JS
dependency, and if so, what kind?

## Decision Drivers

- The site has been deliberately kept "bare-bones" (Dave's own framing) —
  every prior feature avoided adding a JS toolchain or framework.
- The graph's core value (explore connections, click through to a post) is
  fundamentally an interactive, client-side behavior — no static rendering
  can substitute for it without losing the point of the feature.
- Avoiding a heavy build-tooling addition (a full frontend framework, a
  bundler-driven build pipeline) that would ripple into every other part of
  the site's build process.

## Considered Options

1. **Static pre-rendered image** — compute the force layout at Hugo build
   time, output a plain SVG/PNG. Zero JS, but no pan/zoom/click/hover —
   loses the actual point of an Obsidian-style graph.
2. **Full JS framework** (React/Vue + a graph component) — most capable and
   extensible, but a heavy new dependency and build-tooling addition for a
   single page on a site that's intentionally kept static-and-simple.
3. **A lightweight, dependency-free force-graph library** loaded only on the
   `/graph/` page (e.g. a small canvas/SVG force-directed graph renderer) —
   real interactivity, but scoped to one route; every other page stays at
   zero JS.

## Decision Outcome

Chosen option: **a lightweight force-graph library, scoped to the `/graph/`
page only (option 3)**. The specific package is an implementation-time
choice (criteria: small footprint, actively maintained, permissive license,
good performance at ~100-200 nodes) — left to the deliverable that
implements the graph page, not fixed here.

### Consequences

- Good: every other page on the site remains zero-JS — this dependency is
  scoped to exactly one route and doesn't touch the site's overall build
  simplicity.
- Good: real interactivity (pan/zoom/click/hover) — the feature actually
  delivers what an "Obsidian-style graph" implies, rather than a static
  picture of one.
- Good: no bundler/framework build step introduced — a small library can be
  loaded and used directly, consistent with how `fastsearch.js` already
  works today.
- Bad: this is the first client-side JS dependency the site has ever taken
  on beyond the theme's own bundled search script — a precedent that makes
  a *second* future JS dependency an easier sell than it would have been
  before this one landed.
- Neutral: the node/edge data itself is still generated entirely at Hugo
  build time (a JSON output format, mirroring the existing search-index
  pattern) — the JS library only renders and handles interaction; it does
  no data computation of its own.
