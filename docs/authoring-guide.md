# Writing a new post

## Series: Agent production system

**Operator card (preview / draft / release / images):**  
[`docs/series/README.md`](series/README.md)

Schedule + claim rules:  
[`docs/series/agent-production-system.md`](series/agent-production-system.md)

**Scheduled series posts** use `draft = false` + a future `date`; a daily
GitHub Actions rebuild ships them automatically (see
[`docs/series/README.md`](series/README.md)). Hold unfinished work with
`draft = true`. Ship early by setting `date` to now and pushing `main`.

**Claim-safe facts** (metrics, bans, node ids): [`claim-safe-facts.md`](claim-safe-facts.md).  
**Agent router:** [`../AGENTS.md`](../AGENTS.md).  
**Turning a post into a video:** [`video-guide.md`](video-guide.md).

Preview scheduled/future posts locally:

```bash
make preview          # preferred
# or: hugo server -D -F
```

Before push:

```bash
make check            # topics, covers, claims, internal links
```

Series scaffold:

```bash
./scripts/new-series-post.sh <slug> <weight> <ISO-date>
```

Series prev/next is **automatic** from `series` + `series_weight` — do not
hand-maintain “Next → (scheduled)” tables at the bottom of posts.

**Covers:** series posts should set `[cover]` with an image under
`static/images/posts/`; `make check` fails if the path is missing.

## Option A: have an agent draft it (fastest)

You don't need to touch `hugo new content` or write TOML by hand. In a
Claude Code (or equivalent) session opened on this repo, just describe
the post:

> Draft a post about [topic]. Angle: [what makes it worth writing].
> Rough tags: [a few words]. Keep it in my usual voice — [short/long,
> casual/technical, whatever fits].

The agent should:

1. Pick a URL-safe slug and create `content/posts/<slug>.md`. Use
   `draft = true` while writing; for a scheduled auto-publish set
   `draft = false` and a future `date` only when the post is ready.
2. Check the *existing* tag vocabulary first —
   `git grep -h '^tags' content/posts/*.md` — and reuse those exact
   terms instead of inventing new compound ones (e.g. use `"JavaScript"`
   and `"HTML5"` separately, not `"Javascript / HTML5"` as one string —
   a compound tag silently fragments the `/tags/` pages instead of
   merging into them; this bit us once already, see `history.md`).
3. Write the body as Markdown below the front matter.
4. Commit to a **new branch**, not `main` directly — so you review the
   diff before anything goes live.

Then you review (`git diff`, or `hugo server -D -F` to preview drafts
and future-dated posts), ask for edits in plain language if anything's
off, and once you're happy merge to `main` with either `draft = false`
(live immediately if `date` is now/past) or a future `date` (auto-ships
on the next daily rebuild after that time).

**Want a video too?** It's opt-in per post, not automatic — ask for it in
the same request, e.g. "draft a post about X, with a video." The agent then
runs `make video POST=<slug>` against the finished post: drafts narration and
renders the MP4, then **stops** — no upload yet. Watch the rendered video (or
have the agent describe it) before it goes any further; if it's rough, edit
`tools/video/scenes.json` and re-render, no quota spent. Once it's good, the
agent runs `make video-publish POST=<slug> MP4=<path>` to upload as private
and insert the `{{< youtube VIDEO_ID >}}` embed. You still flip the video to
Public in YouTube Studio and review the post diff before committing, same as
any other post edit. Full detail, including the ~6-uploads/day quota ceiling
and what happens on a claim-safety or probe failure:
[`video-guide.md`](video-guide.md).

## Option B: write it yourself

## One-time setup (fresh clone only)

The site theme (PaperMod) is a git submodule and isn't checked out by a
plain `git clone` or `git worktree add` — pull it in once per checkout:

```bash
git submodule update --init --recursive
```

Skip this if you're already working in a checkout where `themes/PaperMod/`
has files in it.

## Write the post

```bash
hugo new content posts/my-post-slug.md
```

This creates `content/posts/my-post-slug.md` with front matter filled in
from `archetypes/default.md`:

```toml
+++
date = '2026-07-18T11:20:30-04:00'
draft = true
title = 'My Post Slug'
+++
```

Edit the front matter as needed:

- `title` — defaults to a title-cased version of the filename; override it
  directly.
- `date` — auto-filled to now; change it if backdating.
- `draft` — `true` holds the post forever (never deploys). `false` is
  required for publish; combined with a future `date`, Hugo still
  withholds it until that time (see auto-publish below).
- `tags` — optional, add as a TOML array, e.g. `tags = ['hugo', 'meta']`.

Write the post body as Markdown below the closing `+++`.

## Preview locally

```bash
hugo server -D -F
```

- `-D` includes `draft = true` posts  
- `-F` includes **future-dated** posts  

Neither flag is used in production builds. Open http://localhost:1313
to check formatting, then stop the server (Ctrl-C) when done.

## Publish

### Immediate

Set `draft = false` and `date` to now (or leave a past date), commit and
push to `main`:

```bash
git add content/posts/my-post-slug.md
git commit -m "docs: add my-post-slug post"
git push
```

### Scheduled (auto-publish)

Set `draft = false` and a **future** `date` (ISO with timezone, e.g.
`2026-07-31T09:00:00-04:00`). Push to `main` whenever the content is
ready. Hugo excludes future content on build; the deploy workflow also
runs **daily** (`cron: 0 14 * * *` ≈ 10:00 ET) so the post goes live on
the first rebuild after its `date` without another push.

Every push to `main` (and the daily cron) triggers
`.github/workflows/hugo.yml`: `hugo --minify`, GitHub Pages deploy, and
smoke tests. Watch it with:

```bash
gh run watch
```

The post is live once that run finishes — no separate deploy step.

## Verified

This guide was verified by actually running through it end-to-end: created
a real post with `hugo new content`, set `draft = false`, ran `hugo build`,
and confirmed the rendered page's `<title>` was correct — then deleted the
test post before committing anything (issue #9 acceptance criteria).
