---
title: "Rebuild davevoyles.com as a static blog"
status: approved
date: 2026-07-18
---

# 0001 — Rebuild davevoyles.com as a static blog

## Problem Statement

davevoyles.com was a WordPress blog hosted on Azure App Service. It was
taken down, and no content backup (database export, WXR export, media
library) was ever taken before that happened — the only local artifact that
survived is Azure deployment plumbing, not the blog's actual posts or
images. The domain itself (`davevoyles.com`) is still owned (active at
Namecheap, expires 2027-03-07) but currently sits unpointed on parking
nameservers.

The Wayback Machine has strong independent coverage of the old site: 19,179
total captures spanning Dec 2014–2021, roughly 260 posts at confirmed dated
permalinks (`/YYYY/MM/DD/slug/`) plus several hundred more at non-dated
permalinks. Archived category-sidebar counts (Game Dev 153, JavaScript/HTML5
94, Programming 91, Web Dev 78, Microsoft 55, Personal 46, Azure 46, C# 42,
Students 41, Uncategorized 64 — categories overlap, so the real unique-post
count is lower than the sum) suggest roughly 300–450 real unique posts are
recoverable, along with ~2,727 archived images (1,280 PNG, 1,232 JPEG, 207
GIF). A full-post spot check confirmed complete title/author/date/body/tags
recovery is possible for at least some posts.

Goal: rebuild the blog on infrastructure that can't repeat the original
failure mode (a maintained server whose backup completeness was never
verified), recover as much of the old content as is reasonably usable, and
make ongoing authoring simple enough that it actually gets used.

## Proposed Approach

A Hugo static site, built and deployed to GitHub Pages via GitHub Actions on
every push to `main`, with `davevoyles.com` pointed at it. Content recovery
runs as a one-time scripted pipeline: pull raw HTML + images from the
Wayback Machine's CDX-indexed captures, process images, convert HTML to
Hugo Markdown with front matter, then auto-flag likely-stale posts for a
manual review pass rather than blocking the whole migration on reading
300+ posts individually. See [ADR 0001](../decisions/0001-static-site-over-self-hosted-wordpress.md),
[ADR 0002](../decisions/0002-images-committed-to-repo.md), and
[ADR 0003](../decisions/0003-clean-url-scheme-not-preserving-legacy-permalinks.md)
for the reasoning behind the hosting model, image storage, and URL scheme
decisions respectively.

Everything — plan docs, ADRs, scripts, content, and GitHub issues — lives in
and is scoped to this repo (`~/REPOS/DaveVoylesdotCom`), not `Chat-Agents`.

## Deliverables

| Deliverable | Size | Acceptance Criteria | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **D1 — Hugo site bootstrap + GitHub Pages deploy pipeline** | S | `hugo new site` scaffolded with a clean, fast tech-blog theme (default: PaperMod, adjustable later). GitHub Actions workflow builds and deploys on push to `main`. A test post is visibly live at the `*.github.io` URL, confirmed via a real HTTP fetch, not just a green CI run. | None | Not started |
| **D2 — Custom domain wiring (davevoyles.com)** | XS | `CNAME` file added to the repo; GitHub Pages custom domain configured; **Namecheap DNS updated to point the apex/`www` at GitHub Pages while explicitly preserving the domain's existing MX, SPF, and Google-site-verification TXT records** (davevoyles.com currently has active Namecheap email forwarding configured — confirmed via DNS lookup this session — which must not be broken by this change). HTTPS enforced. `davevoyles.com` resolves to the new site over a real request. | D1 | Not started |
| **D3 — Wayback Machine raw content recovery script** | M | A script pulls all archived HTML pages and images for `davevoyles.com` from the Wayback Machine into a local staging directory. Recovered post-page count and image count are logged and cross-checked against this session's CDX findings (~260 dated + several hundred non-dated post-like captures, 2,727 image captures). | None | Not started |
| **D4 — Image processing pipeline** | S | Recovered images are resized/compressed and placed under the Hugo site's static assets. Before/after count and total size are logged. A sample of processed images spot-checked to confirm they're visually intact. | D3 | Not started |
| **D5 — HTML → Hugo Markdown conversion script** | M | A script converts each recovered post's HTML into a Hugo content file: title, date, author, categories/tags, and body extracted into front matter + Markdown body, with internal image references rewritten to the D4 output paths and URLs following the clean scheme from [ADR 0003](../decisions/0003-clean-url-scheme-not-preserving-legacy-permalinks.md). `hugo build` succeeds with zero errors against the full converted set. | D3, D4 | Not started |
| **D6 — Stale-content triage script** | S | A script scans converted posts for likely-stale signals (dead-tech keywords such as XBLIG/Windows Phone 8/old Azure Portal UI, broken outbound links, age heuristics) and marks flagged posts `draft: true` with a logged reason; everything unflagged is left publishable. Spot-checked against a handful of manually-identified obviously-stale posts to confirm the heuristics catch known cases. | D5 | Not started |
| **D7 — Full site integration & verification** | S | All converted, triaged content merged into the live Hugo site; `hugo build` succeeds cleanly; site deployed via the D1 pipeline; a sample of migrated post URLs spot-checked live for correct rendering (title/date/tags/body/images). | D1, D6 | Not started |
| **D8 — Triage review pass** *(Dave-performed)* | XS | Dave reviews the D6-flagged post queue and decides publish / edit / delete for each. Acceptance is his own sign-off — not agent-executable, can happen any time after D6/D7. | D6 | Not started |
| **D9 — New-post authoring guide** | XS | A short doc in the repo describing the ongoing workflow: `hugo new posts/<slug>.md`, front-matter conventions, `git push` triggers auto-deploy. Verified by actually following it to publish one real test post end-to-end. | D1 | Not started |

All deliverables are XS/S/M — build-ready, no further decomposition required.

## Testing Decisions

- **D1:** seam is `hugo build` (must exit clean) plus the GitHub Actions
  workflow run status (`gh run watch`); acceptance requires an actual HTTP
  fetch of the deployed URL, not just a green CI run.
- **D2:** seam is DNS resolution (`dig davevoyles.com`) plus a live HTTPS
  request to the domain; existing MX/TXT records re-checked post-change to
  confirm they're untouched.
- **D3:** seam is the recovery script's own output — file/image counts
  logged and diffed against this session's CDX baseline numbers; spot-check
  a couple of known posts byte-for-byte against the content already
  retrieved this session.
- **D4:** seam is before/after image count + total size logging, plus manual
  visual spot-check of a sample.
- **D5:** seam is `hugo build` against the full converted content set
  (zero errors required), plus manual spot-check of N random converted
  posts against their Wayback source for fidelity.
- **D6:** seam is the triage script's flagged-post list, manually reviewed
  against a small set of posts already known (from this session) to
  reference dead tech, to confirm the heuristics have reasonable
  precision/recall before trusting it on the full set.
- **D7:** seam is a full `hugo build` + real deploy, then live HTTP fetches
  of a sample of migrated URLs.
- **D9:** seam is literally following the doc to publish one real test post
  end-to-end, then removing that test post.

## ⚠️ Irreversible Steps

- **D2's DNS change** touches a domain that currently has **active email
  forwarding configured** (Namecheap `eforward*` MX records + matching SPF
  TXT record, confirmed via DNS lookup this session) and a Google
  site-verification TXT record. The change itself (updating A/CNAME records
  to point at GitHub Pages) is reversible — DNS can be pointed back — but a
  careless "replace all DNS records" approach could silently drop the
  existing MX/SPF/TXT records and break email forwarding on the domain.
  D2's acceptance criteria requires those records be explicitly preserved,
  not just "not on purpose deleted." **Confirm at approval: proceed with the
  DNS change under that constraint.**
- No data-destructive migrations, secret rotations, force-pushes, or
  external sends are otherwise part of this plan. Recovered content is
  additive (new files in a new repo); nothing existing is deleted or
  overwritten.

## Out of Scope

- Preserving the old site's exact URL structure (explicitly rejected — see
  [ADR 0003](../decisions/0003-clean-url-scheme-not-preserving-legacy-permalinks.md)).
- Comments, in any form.
- Any role for the Synology NAS (explicitly rejected during grilling — GitHub
  is the sole host and backup).
- Full manual editorial review of every recovered post before publish
  (explicitly rejected in favor of auto-flag triage — see D6/D8).
- Migrating or attempting to recover the old site's email configuration
  beyond leaving its existing DNS records untouched (D2).
- Custom comment/search/analytics services, unless requested later.

## Execution Tracking

- Issues: https://github.com/DaveVoyles/DaveVoylesdotCom/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0001
- Board: https://github.com/users/DaveVoyles/projects/2 (standing "Agent Work" board, filtered by `plan:0001`)

All 9 deliverables (D1-D9) exported as issues #1-#9, native GitHub blocking
relationships wired per the dependency column above, and seeded onto the
board's Todo column. D1 (#1) and D3 (#2) are the frontier — open, unblocked,
unassigned, ready to claim.

**Note:** this repo is brand new — no GitHub App auto-approval infrastructure
(the `davevoyles-mac-automation` App, branch protection, harness-lock
settings) is installed here yet. The first PR against this repo will need
that set up (or a manual review/merge) before the usual auto-approve floor
applies.
