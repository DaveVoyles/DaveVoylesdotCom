# Writing a new post

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
- `draft` — **must be set to `false`** before the post will actually
  publish. Leave it `true` while still writing; a `draft: true` post builds
  locally but is excluded from the deployed site.
- `tags` — optional, add as a TOML array, e.g. `tags = ['hugo', 'meta']`.

Write the post body as Markdown below the closing `+++`.

## Preview locally

```bash
hugo server -D
```

`-D` includes drafts in the local preview (they're still excluded from
`hugo build`'s output, which is what actually deploys). Open
http://localhost:1313 to check formatting, then stop the server
(Ctrl-C) when done.

## Publish

Once `draft = false`, commit and push to `main`:

```bash
git add content/posts/my-post-slug.md
git commit -m "docs: add my-post-slug post"
git push
```

Every push to `main` triggers the GitHub Actions workflow
(`.github/workflows/hugo.yml`) set up in D1: it runs `hugo --minify`,
deploys to GitHub Pages, and smoke-tests the deployed URL. Watch it with:

```bash
gh run watch
```

The post is live once that run finishes — no separate deploy step.

## Verified

This guide was verified by actually running through it end-to-end: created
a real post with `hugo new content`, set `draft = false`, ran `hugo build`,
and confirmed the rendered page's `<title>` was correct — then deleted the
test post before committing anything (issue #9 acceptance criteria).
