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
  `main` kicks off a ~1 minute GitHub Actions build + deploy. There's no way
  to "just tweak something in the browser" and have it stick; the repo is
  always the source of truth.
- **📝 Drafts never go live.** Any post with `draft = true` in its front
  matter is completely excluded from what gets deployed — not password
  protected, not hidden-but-reachable, just absent.
- **📦 Images live in the repo itself**, not a separate media library — more
  on that below, including why that's actually deliberate.

None of these are bugs — they're the tradeoff for a site with no ongoing
hosting bill, no plugin security patching, and a full backup that's just
`git clone`.

## 🎨 Changing colors and styling

**Right now the site uses PaperMod's plain defaults** — nothing has been
customized yet, so there's a genuinely blank canvas here.

### Do you need to ask an agent?

**Not necessarily — it depends on the size of the change:**

| Change | Who can do it | Why |
|---|---|---|
| Swap the accent color, background, text color | 🙋 You, if you're comfortable in a text file — or an agent, in about a minute | One small CSS file, fully reversible |
| Change fonts, spacing, add a new page section | 🤖 Better as an agent request | Touches more of the theme's structure |
| Something more ambitious (new layout, custom homepage) | 🤖 Definitely an agent, and probably worth a real discussion first | Bigger, less reversible |

### How the color system actually works

The theme defines its whole palette as a handful of named values — separate
sets for light mode and dark mode (the site auto-switches based on the
visitor's system setting, plus a manual toggle button):

| Name | What it controls | Light mode default | Dark mode default |
|---|---|---|---|
| `--theme` | Page background | white | near-black |
| `--entry` | Card/post background | white | dark gray |
| `--primary` | Main text color | near-black | light gray |
| `--secondary` | Muted text (dates, meta info) | medium gray | lighter gray |
| `--content` | Body paragraph text | near-black | light gray |
| `--border` | Dividing lines | light gray | dark gray |
| `--code-block-bg` | Code block background | dark | dark gray |

To change any of these, the whole site's styling is controlled by **one file
you'd create**: `assets/css/extended/custom.css` at the repo root (that
folder doesn't exist yet — you're creating it). Anything in there loads
*after* the theme's own styles, so it can override any of the values above
without ever touching the theme itself (the theme is a separate project
pulled in as a "submodule" — editing it directly would be like editing
someone else's code).

Example — a quick warmer, less stark palette:

```css
:root {
  --theme: rgb(250, 248, 244);
  --primary: rgb(40, 34, 28);
}

[data-theme="dark"] {
  --theme: rgb(24, 22, 20);
  --primary: rgb(230, 224, 216);
}
```

Drop that in, push it, and the whole site's palette shifts — no theme
surgery required. This is exactly the kind of change worth just asking an
agent for ("make the site's accent color a warm amber instead of the
default"), since it's small and easy to undo.

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
