---
title: "Static site (Hugo) + GitHub Pages over self-hosted WordPress"
status: accepted
date: 2026-07-18
---

# 0001 — Static site (Hugo) + GitHub Pages over self-hosted WordPress

## Status

Accepted

## Context and Problem Statement

The original davevoyles.com ran WordPress on an Azure App Service. When the App
Service was torn down, no separate content export (database dump, WXR export,
media library) had ever been taken — the only artifact that survived locally
was Azure deployment plumbing (a `.PublishSettings` file and an ARM template),
not the blog's actual content. The blog's own content was recoverable only
because the Wayback Machine happened to have crawled it independently.

Rebuilding this blog needs a hosting/architecture model that doesn't repeat
that failure mode: a paid, actively-maintained server where "backup" was
never actually verified as complete until it was too late.

## Decision Drivers

- Must be free or very cheap
- Must be very easy to back up — verifiably, not just in theory
- Must be very easy to use for a technical blogger who already works in git daily
- Should not reintroduce a maintained server/database as a single point of failure

## Considered Options

1. Re-host WordPress (self-managed, on the Synology NAS or a cloud VM)
2. Static site generator, deployed to GitHub Pages
3. Managed blogging platform (e.g. Ghost(Pro), Substack)

## Decision Outcome

Chosen option: **Static site generator (Hugo) deployed to GitHub Pages**
(see [0002](0002-images-committed-to-repo.md) for the images decision, and the
companion plan doc [docs/design/0001](../design/0001-rebuild-davevoylescom-blog.md)
for the generator choice specifics).

Content lives as Markdown files in a git repository. The repository *is* the
backup — `git clone` reproduces the entire site, with full history, without a
separate database export step that can be silently skipped. GitHub Pages
hosting is free and requires no server maintenance, patching, or renewal
beyond the domain itself.

### Consequences

- Good: backup completeness is structurally guaranteed, not procedural — there
  is no separate "did we actually export the DB" step to forget.
- Good: zero hosting cost, zero server maintenance surface.
- Good: authoring fits the blogger's existing git-based workflow.
- Bad: no WYSIWYG editor, no server-side dynamic features (search, comments,
  contact forms) without bolting on a third-party static-friendly service.
- Bad: a wholesale content model change from the original WordPress site —
  this is a rebuild, not a restore-in-place.

## Considered Options — detail

**Re-host WordPress:** rejected. Directly reintroduces the same failure mode
this rebuild exists to avoid — a database-backed server whose backup
completeness depends on remembering a separate export step, plus ongoing
patching/maintenance cost, self-hosted on the NAS or a paid VM either way.

**Managed blogging platform (Ghost(Pro)/Substack):** rejected. Doesn't meet
the "free or very cheap" requirement at any meaningful scale, and re-adds a
third-party platform dependency for content the user explicitly wants to own
and back up himself.
