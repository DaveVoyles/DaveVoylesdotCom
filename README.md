# davevoyles.com

Rebuild of the old davevoyles.com WordPress blog (formerly Azure-hosted,
taken down with no content backup) as a static Hugo site on GitHub Pages.
Content is being recovered from the Wayback Machine.

See [`docs/design/0001-rebuild-davevoylescom-blog.md`](docs/design/0001-rebuild-davevoylescom-blog.md)
for the full plan, and [`docs/decisions/`](docs/decisions/) for the
architectural decisions behind it.

Writing a new post? See [`docs/authoring-guide.md`](docs/authoring-guide.md).
Wondering how the platform itself works — styling, images, video, what it
can't do? See [`docs/platform-guide.md`](docs/platform-guide.md).

Status: site live at [davevoyles.com](https://davevoyles.com) — historical
content migration from the old WordPress blog is complete (76 recovered
posts, triaged for staleness per [plan 0001](docs/design/0001-rebuild-davevoylescom-blog.md)).

## Repo map

A quick orientation for anyone (human or agent) new to this checkout —
what each top-level folder is for and when you'd touch it.

| Path | What's in it | When you'd touch it |
|---|---|---|
| [`content/posts/`](content/posts/) | 76 blog posts as Hugo Markdown files (`.md` with TOML front matter: `title`, `date`, `draft`, `author`, `categories`, `tags`). This is the actual site content. | Writing, editing, or triaging a post. See [`docs/authoring-guide.md`](docs/authoring-guide.md). |
| [`static/images/`](static/images/) | 536 images, committed directly to the repo (no LFS, no hotlinking — see [ADR 0002](docs/decisions/0002-images-committed-to-repo.md)). Referenced from post bodies as `/images/<file>`. | Adding an image to a post. |
| [`static/CNAME`](static/CNAME) | The custom-domain file GitHub Pages reads to serve `davevoyles.com` instead of the default `*.github.io` URL. | Almost never — only if the domain changes. |
| [`archetypes/default.md`](archetypes/default.md) | The front-matter template `hugo new content posts/<slug>.md` fills in for a new post. | Changing what a new post's front matter looks like by default. |
| [`themes/PaperMod/`](themes/PaperMod/) | Git submodule — the actual theme (layout, CSS, JS). Not part of this repo's own history; upstream project. **Won't be checked out on a fresh clone/worktree** — run `git submodule update --init --recursive` first, or `hugo server` 404s on everything. | Changing colors, fonts, or page layout — see [`docs/platform-guide.md`](docs/platform-guide.md)'s styling section rather than editing the submodule directly. |
| [`scripts/`](scripts/) | One-off Python utilities from the WordPress→Hugo migration (Wayback recovery, image processing, HTML→Markdown conversion, stale-content triage). Each documented in [`scripts/README.md`](scripts/README.md). Mostly done their job — kept for re-running if more historical content surfaces. | Recovering more old content, or re-running the triage script after adding posts. |
| [`docs/design/`](docs/design/) | Design plans (the "why are we doing this, what's the full scope" docs) — one per major initiative. | Understanding the reasoning behind a big change, or planning the next one. |
| [`docs/decisions/`](docs/decisions/) | Architectural Decision Records (ADRs) — short, single-topic "we chose X over Y because Z" docs. | Checking whether a design choice was deliberate before changing it. |
| [`docs/authoring-guide.md`](docs/authoring-guide.md) | Step-by-step: write a post, preview locally, publish. | Every time you write a post. |
| [`docs/platform-guide.md`](docs/platform-guide.md) | Human-facing explainer: what the platform can/can't do, how to change styling, how images and video work. | Before asking "can I do X on this site?" |
| [`docs/learnings.md`](docs/learnings.md) | Accumulating log of gotchas and next-step notes from past work sessions. | Before starting non-trivial work — check if this ground's been covered already. |
| `HANDOFF.md` | Snapshot of where the last work session left off. Overwritten each time, not appended. | Start of a new session — read this first. |
| `history.md` | One-line-per-task changelog. | Reference only; append after finishing a task. |
| `hugo.toml` | Site-wide config: base URL, theme selection, title, output formats. | Site-wide settings changes (see platform guide). |

Everything under `content/`, `static/`, `archetypes/`, and `hugo.toml` is
what Hugo actually builds into the deployed site. Everything under `docs/`
and `scripts/` is process/tooling — none of it ships.
