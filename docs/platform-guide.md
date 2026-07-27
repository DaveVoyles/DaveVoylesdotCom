# 🧭 Platform Guide — How davevoyles.com Actually Works

A plain-English explainer for the person who owns this site (Dave), not
another agent picking up a ticket. If you've ever wondered "can I just
change the color myself?" or "will my YouTube link show up as a video?" —
this is the doc.

Writing an actual post? See [`authoring-guide.md`](authoring-guide.md)
instead — this doc is about the platform underneath it.

## 🏗️ What this actually is

There's no server, no database, and no admin dashboard. The whole site is:

- **Content** — plain Markdown files in `content/posts/`, one file per post.
- **A theme** — [Hugo PaperMod](https://github.com/adityatelange/hugo-PaperMod),
  which turns those Markdown files into HTML + CSS.
- **A build step** — every time something is pushed to `main`, GitHub Actions
  runs Hugo, which generates the finished site as plain HTML/CSS files.
- **Hosting** — GitHub Pages serves those finished files at
  `https://davevoyles.com`.

That's it. No CMS login, no "publish" button in a browser — publishing a
post means committing a file and pushing it. The [`authoring-guide.md`](authoring-guide.md)
walks through that step by step.

## 🚧 Limitations — what this platform genuinely can't do

Worth knowing up front, since some of these surprise people coming from
WordPress/Squarespace/Wix:

- **🚫 No comments.** PaperMod has a hook for a comments widget, but nothing
  is plugged into it. Adding one (e.g. [Giscus](https://giscus.app/), which
  uses GitHub Discussions and is free) is a real but small task.
- **🚫 No contact forms.** A static site can't run form-submission logic
  itself — you'd need a third-party form handler (like
  [Formspree](https://formspree.io/)) that the form just POSTs to.
- **🚫 No built-in analytics.** Nothing tracks visitors unless you add a
  snippet (Google Analytics, Plausible, etc.) yourself.
- **🚫 No live preview / WYSIWYG editor.** Every edit is a Markdown file. You
  (or an agent) edit the file, then `hugo server` locally shows you what it
  looks like before it goes live.
- **⏱️ Every change needs a build.** Nothing updates instantly — pushing to
  `main` kicks off a ~1 minute GitHub Actions build + deploy. A **daily**
  cron rebuild also runs so future-dated posts can go live without a
  push. There's no way to "just tweak something in the browser" and have
  it stick; the repo is always the source of truth.
- **📝 Drafts never go live.** Any post with `draft = true` in its front
  matter is completely excluded from what gets deployed — not password
  protected, not hidden-but-reachable, just absent.
- **📅 Future dates stay hidden until their day.** With `draft = false`
  and a `date` still in the future, Hugo omits the post from the build.
  The daily rebuild publishes it after that timestamp.
- **📦 Images live in the repo itself**, not a separate media library — more
  on that below, including why that's actually deliberate.

None of these are bugs — they're the tradeoff for a site with no ongoing
hosting bill, no plugin security patching, and a full backup that's just
`git clone`.

## 🎨 Changing colors and styling

The site uses a **console theme** (green accent, monospace chrome) defined
in `assets/css/extended/custom.css`. That file already exists and loads
*after* PaperMod's CSS — edit it rather than the theme submodule.

### Do you need to ask an agent?

| Change | Who can do it | Why |
|---|---|---|
| Swap accent / background / text via CSS variables | 🙋 You or an agent | One file, fully reversible |
| Homepage projects, status line, recent counts | 🙋 You or an agent | `hugo.toml` → `[params.home]` / `[[params.home.projects]]` |
| About skills, stats, constellation nodes | 🙋 You or an agent | `content/about.md` front matter — see [`portfolio-surfaces.md`](portfolio-surfaces.md) |
| New homepage sections or WebGL behavior | 🤖 Agent (discuss first) | Custom layouts + JS |

### How the color system actually works

PaperMod exposes named CSS variables for light and dark mode. The console
theme redefines them (and adds `--accent`) in `custom.css`:

| Name | What it controls |
|---|---|
| `--theme` | Page background |
| `--entry` | Card / panel background |
| `--primary` | Main headings / strong text |
| `--secondary` | Muted meta text |
| `--content` | Body copy |
| `--border` | Dividers |
| `--accent` | Console green — links, chips, CTAs |
| `--tertiary` | Soft fill behind badges |

Prefer `var(--accent)` (etc.) in new CSS so light/dark stay consistent.

### Portfolio pages (home + About)

These are **not** stock PaperMod list pages:

- **Home** — dashboard + magazine desk; does *not* list all posts ([ADR 0010](decisions/0010-home-dashboard-not-full-archive.md))
- **About** — portfolio layout + optional WebGL agent system map

Full agent map: [`portfolio-surfaces.md`](portfolio-surfaces.md).

## 🖼️ Images — where they live and how to add one

**Yes, stored locally — directly inside the git repo**, not an external
image host or CDN. That was a deliberate call
([ADR 0002](decisions/0002-images-committed-to-repo.md)): the whole site —
posts *and* images — backs up as a single unit via one `git clone`. The
tradeoff is the repo is bigger than a text-only repo (currently a modest
~150MB total, images included) — not a concern at this scale, but worth
knowing if the site becomes much more image-heavy someday.

**For historical posts recovered from the old WordPress blog**, a one-time
migration script resized and compressed everything into `static/images/`
automatically — that already happened and doesn't need repeating.

**For a brand-new post going forward**, there's no special tool required:

1. Drop the image file into `static/images/` (a subfolder is fine, e.g.
   `static/images/2026/my-photo.jpg`).
2. Reference it in the post's Markdown like any other image:
   `![description of the photo](/images/2026/my-photo.jpg)`.
3. That's it — Hugo serves whatever's in `static/` as-is.

One thing worth doing yourself (or asking an agent to do) before adding a
large photo: resize/compress it first. Nothing automatically shrinks images
for new posts the way the migration script did for old ones — an
un-optimized multi-megabyte photo will just sit there at full size and slow
the page down.

## 🎥 Video — YouTube links do *not* auto-embed

This one's worth being precise about, because it's easy to assume otherwise:

- **Pasting a bare YouTube URL** (e.g. `https://www.youtube.com/watch?v=...`)
  renders as a **plain clickable text link** — nothing more. Confirmed by
  testing it directly: it comes out as `<a href="...">` in the built page,
  same as any other link.
- **To get an actual inline video player**, use Hugo's built-in shortcode
  instead:

  ```
  {{< youtube VIDEO_ID >}}
  ```

  where `VIDEO_ID` is the part after `v=` in the YouTube URL. This is a
  feature Hugo ships with directly (not something custom-built for this
  site), and it renders a real responsive embedded player — also confirmed
  by testing it. No extra configuration needed; it works out of the box.

So: if you want a video visible on the page, use the shortcode. If a plain
link is fine (visitor clicks through to YouTube), either works.

**Generating a video from a post** (not just embedding an existing one) —
see [`video-guide.md`](video-guide.md) for the `make video-draft` /
`video-render` / `video-upload` pipeline.
