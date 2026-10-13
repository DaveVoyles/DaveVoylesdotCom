# Repo map

A quick orientation for anyone (human or agent) new to this checkout: what each top-level folder is for and when you would touch it. Moved from the README.

## Where to read next

- Design plan and ADRs: [`design/`](design/), [`decisions/`](decisions/) (full plan: [`design/0001-rebuild-davevoylescom-blog.md`](design/0001-rebuild-davevoylescom-blog.md))
- Writing a post: [`authoring-guide.md`](authoring-guide.md)
- How the platform works (styling, images, video, limits): [`platform-guide.md`](platform-guide.md)
- Changing the homepage, About page, projects grid or WebGL surfaces: [`portfolio-surfaces.md`](portfolio-surfaces.md)
- Current design system (colors, type, layout, components): [`DESIGN.md`](DESIGN.md)
- Task log: [`../history.md`](../history.md)
- Home is a **dashboard + magazine desk** (not a full archive dump); `/about/` is a portfolio page with an interactive agent constellation.

## Paths

| Path | What's in it | When you'd touch it |
|---|---|---|
| [`content/posts/`](../content/posts/) | Blog posts as Hugo Markdown (front matter: `title`, `date`, `draft`, `tags`, optional `topics`, covers). | Writing, editing, or triaging a post. See [`docs/authoring-guide.md`](authoring-guide.md). |
| [`content/about.md`](../content/about.md) | About portfolio — **data-driven** `[about]` front matter (skills, stats, constellation). Body is unused by the layout. | Editing About identity, skills, impact, or the agent system map. See [`docs/portfolio-surfaces.md`](portfolio-surfaces.md). |
| [`layouts/`](../layouts/) | Site overrides of PaperMod: `index.html` (home dashboard), `about.html`, `graph.html`, `single.html`, sidebar/TOC/vault partials. | Changing home/About/graph shell or post chrome — prefer this over editing the theme submodule. |
| [`assets/css/extended/custom.css`](../assets/css/extended/custom.css) | Console theme (green accent, light/dark tokens) + home/About component styles. | Colors, spacing, portfolio UI polish. |
| [`assets/js/`](../assets/js/) | Site JS: `home.js` (mounts the shader-loop look), `about-constellation.js`, search/TOC overrides. Loaded only from the pages that need them. | Interactive surfaces; keep progressive enhancement + reduced-motion. |
| [`static/images/`](../static/images/) | Images committed to the repo (no LFS — see [ADR 0002](decisions/0002-images-committed-to-repo.md)). Referenced as `/images/<file>`. | Adding an image to a post or page. |
| [`static/CNAME`](../static/CNAME) | Custom domain for GitHub Pages (`davevoyles.com`). | Almost never — only if the domain changes. |
| [`static/sections/`](../static/sections/) | Vendored studio `data-fx` loader plus five effects (`glass-panels`, `film-grade`, `chrome-type`, `hover-distort`, `pointer-fx`), refreshed by `scripts/sync-fx.sh`. A page opts in with the shortcode `{{< fx name="chrome-type" tag="h2" >}}Title{{< /fx >}}` or `fx = true` front matter plus `data-fx="film-grade:warm"` on a layout element (About's photo does this). The loader is added once per page and each effect loads on first view, honoring reduced motion. | Giving a page a cinematic effect by name. Syntax: studio `skills/sections/fx/README.md`. |
| [`archetypes/default.md`](../archetypes/default.md) | Template for `hugo new content posts/<slug>.md`. | Changing default new-post front matter. |
| [`themes/PaperMod/`](../themes/PaperMod/) | Git submodule. **Empty on fresh clone** until `git submodule update --init --recursive`. | Prefer site-level `layouts/` + `assets/` overrides; don't edit the submodule for features. |
| [`scripts/`](../scripts/) | Migration/triage utilities. See [`scripts/README.md`](../scripts/README.md). | Recovering old content or re-running mapping/triage. |
| [`docs/portfolio-surfaces.md`](portfolio-surfaces.md) | **Agent map** for home, About, projects, constellation, WebGL. | Any portfolio UI change. |
| [`docs/design/`](design/) | Design plans for major initiatives. | Understanding scope of large work. |
| [`docs/decisions/`](decisions/) | ADRs (including [0010](decisions/0010-home-dashboard-not-full-archive.md) home dashboard). | Before reversing a deliberate choice. |
| [`AGENTS.md`](../AGENTS.md) | Thin router for coding agents. | First file to open in a new session. |
| [`docs/post-pipeline.md`](post-pipeline.md) | Who does what: Dave, agent, site. Diagram: [`docs/diagrams/post-pipeline.html`](diagrams/post-pipeline.html). | "How do we make a post?" |
| [`docs/claim-safe-facts.md`](claim-safe-facts.md) | Allowed metrics, banned claims, constellation node ids. | Any post/About copy with numbers or product claims. |
| [`docs/authoring-guide.md`](authoring-guide.md) | Write → preview → publish a post (includes voice do/don't). | Every new post. |
| [`docs/idea-playbook.md`](idea-playbook.md) | Propose titles + one-line angles from Chat-Agents, then stop. | Idea-generating agent — not a drafting session. |
| [`docs/image-playbook.md`](image-playbook.md) | Propose 4–5 covers/body images from the post text, then stop. | Image pick-list — do not wire `[cover]` until Dave picks. |
| [`docs/series/README.md`](series/README.md) | Series operator card (auto-publish, scaffold). | Agent production series. |
| [`docs/platform-guide.md`](platform-guide.md) | Human-facing platform explainer. | "Can I do X on this site?" |
| [`docs/learnings.md`](learnings.md) | Session gotchas. | Before non-trivial work. |
| `HANDOFF.md` | Last session snapshot (overwrite, don't append). | Start of a new session. |
| `history.md` | One-line task log (append). | Close-out. |
| [`Makefile`](../Makefile) | `preview`, `build`, `check`, `list-future`, `list-tags`. | Day-to-day agent/human commands. |
| `hugo.toml` | Site config: theme, menus, `[params.home]` (dashboard + **projects**), sidebar bio. | Home projects/status, site-wide settings. |

Everything under `content/`, `static/`, `archetypes/`, `layouts/`, `assets/`,
and `hugo.toml` is what Hugo builds into the deployed site. Everything under
`docs/` and `scripts/` is process/tooling — none of it ships.
