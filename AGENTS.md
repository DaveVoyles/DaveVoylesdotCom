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
| **Propose post images** (3 variants → Engineering pick) | [`docs/image-playbook.md`](docs/image-playbook.md) |
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
7. **Post images** — follow [`docs/image-playbook.md`](docs/image-playbook.md). **Visual cadence:** ~every 3 body paragraphs needs an image/diagram/table (no walls of text). Default (2026-09-14): Blog posts **3 design variants** in **Engineering**; **Engineer + Roberto** pick; Blog lands the winner (Dave can override). Unique cover — never also a body image. Prefer lighter palettes unless ops/fail-closed. Labeled architecture is Archify/HTML/SVG, not image-gen. Desktop pick folders are optional scratch only. Do not commit rejects. Do not change `date` / `draft` when wiring art.

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

<!-- harness-adapter:start -->
# This project uses harness

Read the canonical playbook at `$HARNESS_ROOT/AGENTS.md` (cloned playbook, not a symlink).
Project overrides belong in `docs/project-conventions.md` here — never fork harness AGENTS.md.

Harness version stamped by `harness init`: `0.1.1`

Feed emitter (optional, D11): `.harness/session-feed.sh start|stop` implements fleet `docs/feed-schema.md`. Wire it from your agent's session hook. Dispatched sessions appear on the feed without this file — this adapter is for *local* sessions only.
<!-- harness-adapter:end -->
