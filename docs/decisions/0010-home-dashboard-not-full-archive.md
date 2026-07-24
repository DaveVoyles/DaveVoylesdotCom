---
title: "Home is a dashboard + magazine desk, not the full post archive"
status: accepted
date: 2026-07-24
---

# 0010 — Home is a dashboard + magazine desk, not the full post archive

## Status

Accepted

## Context and Problem Statement

The default PaperMod (and early davevoyles.com) homepage paginated **all**
posts — ~76 recovered WordPress-era entries plus a few modern ones. Most
content is from 2010–2015. That made `/` feel like an archive index, not a
front door for a builder who is active again on AI agents, games, and side
projects.

After shipping a portfolio About page, the home needed to match that
product feel without abandoning the blog.

## Decision Drivers

- Prioritize current writing and highlighted projects over historical volume  
- Keep full history available (SEO + nostalgia) without owning the fold  
- Match console / ops aesthetic already used in site CSS and About  
- Allow WebGL delight without making every page a canvas  
- Stay data-driven via `hugo.toml` so non-engineers (and agents) can edit
  projects/status without template surgery  

## Considered Options

1. **Keep full paginated home** — zero template risk; poor first impression  
2. **Featured-only home** — clean, but hides the blog nature  
3. **Dashboard + magazine hybrid** — featured, projects, short recent,
   archive picks + `/archives/` CTA  
4. **Graph-as-home** — interesting, high complexity, poor default UX for
   cold visitors  

## Decision

**Option 3.** Implement `layouts/index.html` as a hybrid **ops dashboard
(A) + magazine desk (B)**:

- Hero status + optional WebGL particle field  
- Featured post(s)  
- Projects grid (`[[params.home.projects]]`)  
- Topic rails + graph teaser panels  
- Short recent desk (`recent_count`)  
- A few pre-`archive_before_year` picks + link to `/archives/`  

Full post history remains on `/archives/` (and tags/topics).

## Consequences

### Positive

- `/` reflects current identity and work  
- Easy config surface for projects and counts  
- Aligns with About portfolio without duplicating it  

### Negative / tradeoffs

- Visitors must click Archives for deep history (intentional)  
- “Recent” may still include older posts until more modern posts exist  
  (only a few post-2020 entries today)  
- Custom `index.html` must be maintained when PaperMod list behavior
  changes upstream  

## Related

- [`docs/portfolio-surfaces.md`](../portfolio-surfaces.md)  
- About portfolio + constellation (PRs #86–#87)  
- Home dashboard + projects (PRs #88–#89)  
