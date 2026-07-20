---
title: "Sidebar-based page shell replaces PaperMod's single-column layout"
status: accepted
date: 2026-07-19
---

# 0006 — Sidebar-based page shell replaces PaperMod's single-column layout

## Status

Accepted

## Context and Problem Statement

Plan 0004 moves the author bio out of PaperMod's homepage-only `home_info.html`
hero block into a persistent rail that appears across the site, and adds a
sticky table-of-contents rail on post pages. PaperMod has no built-in
persistent-sidebar concept — every page today is a single centered column.
Making the bio and TOC rails persistent means the site's shared page wrapper
(`baseof.html` and its per-template overrides) has to become sidebar-aware
everywhere, not just on the one or two templates that currently have full
overrides (`index.html`, `single.html`).

The question: is this worth doing as a foundational, site-wide layout change,
given every future template addition now has to account for the grid?

## Decision Drivers

- Dave explicitly wants the bio to persist across pages (homepage, post list,
  post, vault, graph), not just reappear as a per-page hack.
- A three-column layout is needed specifically on post pages (bio left,
  article center, TOC right) — this can't be solved by a single reusable
  two-column partial alone.
- The site is intentionally kept simple (see ADR 0005's framing) — a layout
  change this foundational is harder to revisit later than most feature
  additions, once content and CSS depend on the grid.

## Considered Options

1. **Per-page bio widget** — keep bio rendering as a one-off block wherever
   it's wanted (homepage hero, a copy-pasted block on post pages), no shared
   grid. Simplest, but produces duplicated markup and doesn't give a true
   persistent-identity feel.
2. **Site-wide sidebar shell (chosen)** — restructure the shared base
   template so every page renders inside a sidebar-aware grid: two columns
   (bio + content) everywhere, three columns (bio + article + TOC) on posts.
3. **Sidebar only on post pages** — skip the homepage/list-page rail
   entirely, add it only where the TOC also lives. Narrower change, but
   contradicts Dave's stated preference for a persistent, site-wide bio.

## Decision Outcome

Chosen option: **site-wide sidebar shell (option 2)**. `baseof.html` (or
equivalent shared wrapper) becomes sidebar-aware for every page type; a new
`layouts/partials/sidebar.html` renders the bio; post pages layer a second,
TOC-only right rail on top of the same shell.

### Consequences

- Good: the bio reads as a persistent author identity across the whole site,
  matching what Dave asked for and what prompted this plan.
- Good: one shared grid mechanism serves both the two-column (bio-only) and
  three-column (bio + TOC) cases, rather than two unrelated layout systems.
- Bad: this is a foundational layout shift — every future template addition
  (new content sections, new page types) now has to render correctly inside
  the sidebar-aware grid, and unwinding it later means touching every
  template again, not just one.
- Neutral: below ~1024px both rails collapse via CSS reflow only (no
  separate mobile markup), keeping the responsive story to one set of
  partials at every viewport width.
