---
title: "Recovered images committed directly to the git repo"
status: accepted
date: 2026-07-18
---

# 0002 — Recovered images committed directly to the git repo

## Status

Accepted

## Context and Problem Statement

Roughly 2,727 images are recoverable from the Wayback Machine archive of the
old blog (1,280 PNG, 1,232 JPEG, 207 GIF), likely several hundred MB once
downloaded. These need a permanent home that's consistent with
[0001](0001-static-site-over-self-hosted-wordpress.md)'s "the git repo is the
backup" model.

## Decision Drivers

- "Very easy to back up" must mean one `git clone`, not several
- Avoid adding tooling/service dependencies beyond plain git
- Avoid re-creating a dependency on Archive.org's long-term availability

## Considered Options

1. Download, compress/resize, and commit images directly into the repo
2. Store images via Git LFS
3. Leave images hotlinked to their `web.archive.org` URLs, don't re-host

## Decision Outcome

Chosen option: **download, compress/resize, and commit directly into the
repo** (plain git, no LFS).

This keeps the whole site — posts and images — backed up as a single unit
via a single `git clone`, matching the project's core backup requirement
exactly. Compressing/resizing during migration keeps repo size and page-load
weight reasonable, and is something the migration should do anyway for a
static site regardless of storage choice.

### Consequences

- Good: one backup mechanism for the entire site, no exceptions.
- Good: no new tooling to install/maintain (no LFS client, no bandwidth quota
  to track).
- Good: no permanent runtime dependency on Archive.org's availability.
- Bad: repo size grows meaningfully (est. low hundreds of MB after
  compression) — acceptable for a personal project repo, but notably larger
  than a typical text-only git repo.
- Bad: full-history `git clone` cost grows over time as images accumulate;
  not a concern at this scale, would need revisiting if the blog became far
  more image-heavy long-term.

## Considered Options — detail

**Git LFS:** rejected. Adds a tool to install and keep working correctly,
and GitHub's free LFS tier (1GB storage + 1GB bandwidth/month) is likely to
be exceeded by this volume of images, pushing the project into a paid tier —
directly conflicts with the "free or very cheap" requirement.

**Hotlink to `web.archive.org`:** rejected. Makes every historical post
permanently dependent on Archive.org's URL stability and uptime for images
to render — not actually "backed up" by the project's own repo, and outside
the user's control.
