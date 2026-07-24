# Project Glossary

Domain terms, models, and vocabulary this project uses consistently — in
code, comments, commit messages, and conversation. See AGENTS.md
§Engineering Principles ("Ubiquitous language").

| Term | Definition | Notes |
|---|---|---|
| `categories` | Legacy WordPress-era front-matter field on posts; broad, applied liberally (up to 11 per post). | Untouched by plan 0002 — read-only signal for plan 0001's stale-content triage. See `tags`, `topics`. |
| `tags` | Legacy WordPress-era front-matter field on posts; fine-grained (specific engines/platforms, e.g. "UDK", "XBLIG"). Backfilled and cleaned to atomic values in #23. | Powers the site's `/tags/` nav archive. Distinct from the curated `topics` field — see `topics`. |
| `topics` | New, curated, multi-value front-matter taxonomy field on posts, additive alongside `tags`/`categories` (never replacing them). Drives the related-posts widget and a `/topics/<bucket>/` archive. | See [ADR 0004](docs/decisions/0004-topics-field-additive-not-replacement.md), [plan 0002](docs/design/0002-related-posts-topics-taxonomy.md). Controlled vocabulary — see "topic buckets" below. |
| Topic buckets | The 6 controlled-vocabulary values currently valid for `topics`: Gaming, Tech, AI and Agents, Public Speaking and Presentations, Career and Students, Journalism and Marketing and PR. Two slots (7/8) reserved for future buckets, not populated yet. | A post may carry multiple buckets. Assigned via plan 0002's deterministic tags/categories → topics mapping script. |
| Vault | A section of short, atomic notes (`content/vault/*.md`, flat, `/vault/<slug>/`), distinct from `Posts` (blog content). Linked via `[[wikilink]]` syntax rather than standard markdown links, and classified with their own dedicated taxonomy — never `tags`/`categories`/`topics`. | See [ADR 0007](docs/decisions/0007-vault-taxonomy-separate-from-topics.md) (taxonomy), [ADR 0008](docs/decisions/0008-first-custom-markdown-render-hook.md) (wikilink resolution), [ADR 0009](docs/decisions/0009-build-time-reverse-link-index.md) (backlinks/graph edges), [plan 0004](docs/design/0004-ssp-inspired-sidebar-toc-vault.md). Note-writing is future/ongoing work — plan 0004 only scaffolds the section. |
| Home dashboard | The `/` front door: hero + featured post + projects grid + short recent desk + archive picks — **not** a full paginated archive of all posts. Config under `[params.home]` in `hugo.toml`. | See [ADR 0010](docs/decisions/0010-home-dashboard-not-full-archive.md), [portfolio-surfaces.md](docs/portfolio-surfaces.md). Full history lives at `/archives/`. |
| Projects grid | Homepage cards for highlighted external work (repos, live sites, coaching). Driven by `[[params.home.projects]]`. | Edit `hugo.toml` only for content changes; layout loop is in `layouts/index.html`. |
| About portfolio | `/about/` — data-driven page (`content/about.md` `[about]` front matter + `layouts/about.html`). Skills, stats, impact, agent constellation. | Dave is framed as a **former** Xbox/Microsoft TPM. Claim safety: resume-builder candidate profile. |
| Constellation | Interactive map of Dave's **agent production system** (orchestrator, agents, Docker, gates) on About — not a career graph. SVG fallback + WebGL upgrade. | Topology in `content/about.md`; render in `about-constellation` partial + `assets/js/about-constellation.js`. |
| Console theme | Site visual system: green accent, monospace chrome, light/dark tokens in `assets/css/extended/custom.css`. | Prefer CSS variables (`--accent`, etc.) over hard-coded colors. |
