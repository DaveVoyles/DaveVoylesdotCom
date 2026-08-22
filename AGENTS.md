# Agent instructions — davevoyles.com

Thin router for any coding agent. Read the linked doc for the task; do not reinvent conventions.

## First run (every fresh checkout)

```bash
git submodule update --init --recursive   # PaperMod — empty without this
make preview                              # or: hugo server -D -F
```

Without the submodule, Hugo fails looking for theme partials.

## Which doc for which task

| Task | Read first |
|------|------------|
| **How we make a post** (Dave vs agent vs site) | [`docs/post-pipeline.md`](docs/post-pipeline.md) |
| New / edit **blog post** | [`docs/authoring-guide.md`](docs/authoring-guide.md) (voice do/don't is in the writing standard) |
| **Propose blog ideas** (list only — do not draft) | [`docs/idea-playbook.md`](docs/idea-playbook.md) |
| **Propose post images** (4–5 options, then stop) | [`docs/image-playbook.md`](docs/image-playbook.md) |
| **Series** post (Agent production system) | [`docs/series/README.md`](docs/series/README.md) |
| Home, About, projects, WebGL | [`docs/portfolio-surfaces.md`](docs/portfolio-surfaces.md) |
| Numbers, titles, banned claims | [`docs/claim-safe-facts.md`](docs/claim-safe-facts.md) |
| Platform limits (static, images, deploy) | [`docs/platform-guide.md`](docs/platform-guide.md) |
| Domain vocabulary (`topics` vs `tags` vs vault) | [`CONTEXT.md`](CONTEXT.md) |
| Past session gotchas | [`docs/learnings.md`](docs/learnings.md) |
| Last session snapshot | [`HANDOFF.md`](HANDOFF.md) |

## Hard rules

1. **Claim safety** — only metrics and authorship language in [`docs/claim-safe-facts.md`](docs/claim-safe-facts.md). Prefer “extended and operates” for OpenClaw/Hermes/firstmate. **Former** Xbox TPM (past tense). No Terraform/K8s as skill claims.
2. **About is front-matter-driven** — edit `[about]` in `content/about.md`, not the markdown body under `+++`.
3. **Do not edit** `themes/PaperMod/` for features — site overrides live in `layouts/` and `assets/`.
4. **Home is not a full archive** — caps under `[params.home]` in `hugo.toml` ([ADR 0010](docs/decisions/0010-home-dashboard-not-full-archive.md)).
5. **Topics** are a controlled vocabulary (6 buckets). Reuse existing **tags**; never invent compound tags like `"Javascript / HTML5"`.
6. **Auto-publish** — scheduled posts use `draft = false` + future `date`. Daily CI rebuild ships them. Hold unfinished work with `draft = true`. Preview with `hugo server -D -F` or `make preview`.
7. **Post images** — follow [`docs/image-playbook.md`](docs/image-playbook.md). Generate a 4–5 pick-list from the post, then **stop**. After Dave picks: thesis image → `[cover]`; each other pick sits under the **H2 it illustrates**. One idea per 16:9 frame, night-console (`#0d0f0d` / `#5fb87a`), almost no readable type, no fake Dave face, no invented metrics. Labeled architecture is an export, not image-gen. In a TUI, copy candidates to `~/Desktop/<slug>-image-picks/` and `open` the folder — session `images/N.jpg` links do not render in the terminal. Do not commit rejects. Do not change `date` / `draft` when wiring art.

## Common commands

```bash
make submodules   # init PaperMod
make preview      # hugo server -D -F
make build        # production build
make check        # content gates (run before push)
make list-future  # posts waiting on date
make list-tags    # existing tag vocabulary
./scripts/new-series-post.sh <slug> <weight> <ISO-date>
```

## Cursor Cloud

See [`docs/cursor-cloud.md`](docs/cursor-cloud.md). Cloud setup runs `make test` only — no Pages deploy, no required MainVault.

## Close-out

- Append one line to `history.md`.
- Overwrite `HANDOFF.md` (do not append) with current state for the next session.
