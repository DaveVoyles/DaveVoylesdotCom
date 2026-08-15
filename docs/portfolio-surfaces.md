# Portfolio surfaces — home, About, WebGL

Agent-oriented map of the interactive portfolio layer on davevoyles.com.
For writing posts, see [`authoring-guide.md`](authoring-guide.md). For
platform basics (static hosting, images), see [`platform-guide.md`](platform-guide.md).

**Read this before changing** `/`, `/about/`, constellation topology,
homepage projects, or anything under `assets/js/*webgl*` / `about-constellation*`.

---

## Mental model

The site is still **Hugo + PaperMod + GitHub Pages**. On top of that, three
**first-party surfaces** diverge from stock PaperMod:

| Surface | URL | Role |
|---------|-----|------|
| **Home dashboard** | `/` | Ops + magazine front door — *not* a dump of all posts |
| **About portfolio** | `/about/` | Builder/TPM identity, skills, impact, agent system map |
| **Graph** | `/graph/` | Post connection explorer (older; force-graph) |

Everything else (posts, tags, archives, vault) stays mostly theme/list
behavior plus site CSS.

**Design rule:** home = command center; About = deep identity + system map;
posts = calm reading. Don’t put About-level WebGL noise on every post page.

---

## File map (what to touch)

| Path | Owns |
|------|------|
| [`hugo.toml`](../hugo.toml) → `[params.home]` / `[[params.home.projects]]` | Home counts, toggles, status line, **projects cards** |
| [`hugo.toml`](../hugo.toml) → `[params.homeInfoParams]` | Sidebar bio (every page), avatar |
| [`content/about.md`](../content/about.md) | About copy + structured data under `[about]` front matter |
| [`layouts/index.html`](../layouts/index.html) | Home shell (hero, featured, projects, panels, recent, archives) |
| [`layouts/about.html`](../layouts/about.html) | About portfolio layout |
| [`layouts/partials/about-constellation.html`](../layouts/partials/about-constellation.html) | SVG constellation + JSON blob for WebGL |
| [`layouts/partials/sidebar.html`](../layouts/partials/sidebar.html) | Persistent bio rail |
| [`assets/css/extended/00-tokens.css`](../assets/css/extended/00-tokens.css) | Shared `--ds-*` color/type/space/motion tokens |
| [`assets/css/extended/custom.css`](../assets/css/extended/custom.css) | Console theme + home + About styles (PaperMod aliases) |
| [`assets/js/home-hero-webgl.js`](../assets/js/home-hero-webgl.js) | Home hero particle field |
| [`assets/js/about-constellation.js`](../assets/js/about-constellation.js) | About cluster highlight + Three.js constellation |
| [`layouts/graph.html`](../layouts/graph.html) | Post graph page (separate stack: force-graph CDN) |

Theme files live in `themes/PaperMod` (**git submodule**). Prefer site-level
overrides under `layouts/` and `assets/` — don’t edit the submodule for
features.

### Fresh checkout (required)

```bash
git submodule update --init --recursive
hugo server -D
```

Without the submodule, builds fail looking for PaperMod partials (upstream
layout dir is `_partials/` on current PaperMod).

---

## Home (`/`)

### Behavior

Home **does not paginate the full post archive**. It shows:

1. **Hero** — status line, CTAs (About / Archives / Graph), optional WebGL field  
2. **Featured** — newest `featured_count` posts (magazine card)  
3. **Projects** — cards from `[[params.home.projects]]`  
4. **Panels** — topics chips + graph teaser  
5. **Recent** — next `recent_count` posts (short desk)  
6. **From the archives** — up to `archive_picks` posts with `Date.Year < archive_before_year`  
7. **CTA** → `/archives/` for the full library  

Config: `[params.home]` in `hugo.toml`.

### Common edits

| Task | Where |
|------|--------|
| Change hero status text | `params.home.status` |
| Currently building strip | `[[params.home.building]]` — `label`, `note`, optional `url`; toggle `show_building` |
| Add/edit a project card | `[[params.home.projects]]` — `title`, `badge`, `blurb`, `url`, `url_label`, optional `secondary_url` / `secondary_label` |
| Show more/fewer recent posts | `params.home.recent_count` |
| Turn off WebGL hero | `params.home.show_webgl_hero = false` |
| Turn off projects section | `params.home.show_projects = false` |
| Case study post | `content/posts/agent-production-system.md` (feeds Featured/Recent as newest) |
| Agent production **series** | `docs/series/agent-production-system.md` + 6 draft posts; release with `./scripts/release-series-post.sh <slug>` |

### Projects (current intent)

Featured external work, not blog posts. As of 2026-07:

- Resume Builder (GitHub)
- Philly Lax Viz (GitHub + live)
- CFB 26 Playbooks (GitHub + live site / WebGL)
- Harriton Lacrosse (team site; Dave is **head coach**, Lower Merion, PA)

Keep blurbs accurate; don’t invent metrics.

---

## About (`/about/`)

### Behavior

Custom layout (`layout = "about"`). Body markdown is intentionally empty —
**all structure comes from front matter** under `[about]` in
`content/about.md`.

Sections (in order): hero (photo + looking-for / building) → stats →
constellation (map + **node detail panel**) → skills → impact → approach →
footer CTAs.

### Hero identity fields

| Field | Purpose |
|-------|---------|
| `photo` / `photo_alt` | Headshot (reuses sidebar avatar path unless overridden) |
| `focus` | “Looking for” target line |
| `building` | “Currently building” one-liner |

### Constellation interaction

- **Click a node** → detail panel (`detail` text on each node in front matter)
- **Hover pills** → cluster highlight (unchanged)
- **Deep links:** `/about/?cluster=agents`, `/about/?node=eval`
- **Keyboard:** `1` agents · `2` web · `3` program · `4` production · `Esc` clears
- URL updates via `history.replaceState` when selection changes

### Identity framing (important)

Dave is a **former** Senior Technical Program Manager at Xbox/Microsoft.
Hero lede and `description` must stay past-tense on that role. Prefer
verified impact from Xbox + personal agent/homelab work.

### Skills hierarchy (deliberate)

1. **Primary:** AI Agents & Orchestration (full block)  
2. **Supporting strip:** Web (not a peer column)  
3. **Secondary cards:** Program & Platform · Production Systems  

**In:** Azure, Docker, agent-driven container ops, WebGL/data viz as Web pills.  
**Out:** Terraform, Kubernetes as confidence claims / logo soup.

### Constellation = agent production system

The graph is a **map of how Dave’s personal agent/container stack is wired**
(orchestrator, agents, eval gates, Docker, Azure, dashboards, human approval).

It is **not** a career timeline, org chart, or generic skills mind-map.
Copy/title/caption must keep that clear.

### Data contract (SVG + WebGL)

- Nodes: `id`, `label`, `cluster` (`agents` \| `web` \| `program` \| `production`), `x`, `y` (0–100 layout space)  
- Edges: `from`, `to` (node ids)  
- DOM: `data-node-id`, `data-cluster` on SVG nodes; pills and impact cards use `data-cluster`  
- JSON: partial embeds graph via `data-constellation-data` for WebGL boot  
- JS: `assets/js/about-constellation.js` — cluster highlight shared; Three.js scene when WebGL + motion allowed  

**Progressive enhancement:** interactive SVG always present; WebGL upgrades
when available; `prefers-reduced-motion: reduce` keeps SVG only; context
loss falls back to SVG.

### Claim safety

**In-repo source of truth:** [`claim-safe-facts.md`](claim-safe-facts.md)
(allowed metrics, banned claims, constellation node ids).

Also align with (when available on disk):

- `~/REPOS/resume-builder-Dave/docs/candidate-profile.md`
- `docs/accuracy-and-claims.md` in that repo when present  

Hard rules that have already bitten agents:

- Do **not** claim original authorship of OpenClaw / Hermes / firstmate  
- Do **not** invent metrics (use verified figures only)  
- Prefer “extended and operates” / “integrated and operates” language  

---

## WebGL architecture

| Page | Script | Library | Purpose |
|------|--------|---------|---------|
| Home | `home-hero-webgl.js` | Three.js r170 CDN (UMD) | Soft particle / signal field behind hero |
| About | `about-constellation.js` | Three.js r170 CDN (UMD) | 3D system map + orbit drag |
| Graph | inline in `graph.html` | force-graph CDN | 2D force layout of posts |

**Patterns we use:**

- Load Three via dynamic `<script>` only when the host element exists and
  WebGL is available  
- Fingerprint + minify site JS through Hugo `resources.Get`  
- Read `--accent` from CSS for palette alignment  
- No React/bundler — keep the static Hugo pipeline  

**Do not** add a webpack/Vite app for these surfaces unless Dave
explicitly wants a stack change (would be an ADR).

---

## Console theme / CSS

Site styling is **not** stock PaperMod defaults anymore.

- File: `assets/css/extended/custom.css` (exists; loads after theme CSS)  
- Light + dark CSS variables, green accent (`--accent`), monospace chrome  
- Home classes: `.home-*`  
- About classes: `.about-*`  
- Sidebar/shell: plan 0004 (`.page-shell`, `.sidebar-bio`, TOC rail)  

Prefer theme tokens (`var(--accent)`, `var(--entry)`, …) over hard-coded
colors so light/dark stay coherent.

---

## How to extend (recipes)

### Add a homepage project

1. Append a `[[params.home.projects]]` block in `hugo.toml`  
2. Fields: `title`, `badge`, `blurb`, `url`, `url_label`  
3. Optional: `secondary_url`, `secondary_label`  
4. `hugo server` → check `/`  

No layout change required unless you need a new field rendered — then
edit the projects loop in `layouts/index.html`.

### Change About skills or stats

1. Edit arrays under `[about]` in `content/about.md`  
2. Keep cluster names consistent with constellation nodes if you want
   pill↔graph highlighting to work  
3. Re-verify claim safety for any number/title  

### Add a constellation node

1. Add `[[about.constellation.nodes]]` with unique `id`, `label`, `cluster`, `x`, `y`, and **`detail`** (plain-English panel copy)  
2. Add edges with `[[about.constellation.edges]]`  
3. Preview About — SVG updates at build; WebGL + detail panel read the same JSON  

### Deep-link a cluster or node

- `/about/?cluster=agents` (or `web` / `program` / `production`)  
- `/about/?node=eval` (any node `id`)  
- Prefer linking these from posts or LinkedIn instead of screenshots alone.

### New custom page with interaction

1. Prefer a dedicated `layout = "..."` + `layouts/<name>.html` (see About)  
2. Put page-only JS in `assets/js/` and load it only from that layout  
3. Document progressive enhancement + reduced-motion  
4. Don’t load Three site-wide from `baseof`  

---

## What I wish earlier agents had documented

These slowed the 2026-07 portfolio work; keep them in mind:

1. **Home was still a full paginated archive** until the dashboard rewrite —
   don’t reintroduce “list all 76 posts on `/`”. Full history is `/archives/`.  
2. **`custom.css` already exists** and owns the console theme — platform-guide
   used to say it didn’t.  
3. **About is data-driven front matter**, not long markdown — editing body
   prose alone does nothing useful.  
4. **Constellation meaning** must stay “agent production system,” not résumé
   graph — visitors misread vague titles.  
5. **Skills positioning ≠ full tech inventory** — omit soft claims
   (Terraform/K8s) even if they appear on a mock resume.  
6. **Claim source of truth is the resume-builder profile**, not inventing
   from LinkedIn memory.  
7. **PaperMod submodule + `_partials`** — empty `themes/PaperMod` = broken
   builds; init submodule first.  
8. **CDN Three is intentional** — same spirit as force-graph on `/graph/`;
   don’t assume npm install is required for a small canvas.  

---

## Related decisions & plans

| Doc | Relevance |
|-----|-----------|
| [ADR 0005](decisions/0005-graph-view-introduces-first-client-side-js.md) | First interactive JS (graph) — sets progressive-enhancement tone |
| [ADR 0006](decisions/0006-sidebar-based-page-shell.md) | Persistent sidebar shell |
| [plan 0004](design/0004-ssp-inspired-sidebar-toc-vault.md) | Sidebar, TOC, vault |
| [ADR 0010](decisions/0010-home-dashboard-not-full-archive.md) | Home is dashboard, not full archive |

---

## Quick verification checklist

```bash
git submodule update --init --recursive
hugo --gc
hugo server -D
```

- [ ] `/` — Featured + Projects + short Recent; no multi-page archive dump  
- [ ] `/about/` — former TPM framing; constellation labels make sense  
- [ ] Pills/nodes highlight clusters; reduced-motion still usable  
- [ ] Project links open correctly  
- [ ] Light + dark still readable with console accent  

Ship via branch + PR (or repo’s usual land path); never force-push `main`.
