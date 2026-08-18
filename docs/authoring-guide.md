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
**Voice (do/don't):** [Writing standard](#writing-standard-2026-07-28) below.  
**Propose ideas, don't draft:** [`idea-playbook.md`](idea-playbook.md).  
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

### Writing standard (2026-07-28)

Left to a short prompt, an agent-drafted post trends too brief and too
bullet-point-terse — thin enough that the post-to-video pipeline
([`video-guide.md`](video-guide.md)) has little narration material to draw
from. Unless the post genuinely earns a short treatment, aim for:

- **~800-1300 words**, not 400-600. Compare against the series' own posts
  (`git grep -c '' content/posts/*.md` gives a rough per-file word count via
  `wc -w`) rather than a fixed number — the goal is enough real detail to
  support a full explanation, not padding to hit a target.
- **Conversational, not deck-bullet.** Bullets are fine for scannable lists,
  but the connective prose around them should read like explaining it to a
  colleague — short anecdotes, a concrete example, a "picture this" beat —
  not a compressed slide restated in sentence case.
- **A markdown table wherever there's a real comparison** (before/after,
  theater-vs-real, states/outcomes). Beyond readability, a table is also
  what [`video-guide.md`](video-guide.md)'s pipeline renders as an actual
  chart graphic if the post gets a video — prose comparisons get discarded
  by that pipeline, tables become visuals.
- **Only claim-safe numbers** ([`claim-safe-facts.md`](claim-safe-facts.md))
  — more detail is not license to invent metrics. Ground concrete examples
  in the allowed-metrics table there (Xbox SLA, homelab container count,
  tenure, revenue) instead of a plausible-sounding made-up figure.

### What already sounds like Dave

Reviewed the 2026-07-28 → 2026-08-18 series posts
(`eval-gates-not-theater`, `human-approval-merge-button`,
`docker-homelab-agent-ops`, `xbox-slas-to-agent-fleets`,
`claim-safety-evidence-before-metrics`, `what-i-will-not-automate`,
`github-tokens-for-agent-fleets`). Read
`landing-floor-without-a-github-app` only so the series stays continuous.
It is scheduled for 2026-08-21 — do not mine it as published voice, and
do not change its date.

Do **not** copy the 2011–2014 Wayback-recovered gaming / Unity / GDC posts
as “how Dave writes now.” Those are a different era.

The posts that already sound like him:

- **Plain and short at the top.** Two sentences land the thesis
  (“Agents are fluent. Fluency is not the same as **true**.”) before any
  heading stack.
- **Contractions and first person.** “I don’t,” “it’s,” “that’s the job.”
  Colleague in the room, not a whitepaper.
- **One real beat, not a résumé dump.** A test harness that deleted local
  work; Plex as the household reason the homelab exists; a Thursday-night
  coaching conversation the model does not own.
- **Tables only when two sides actually compare** (theater vs real gate,
  Xbox TPM habit vs agent-system habit, automate vs keep-human).
- **Claim-safe and past-tense where true.** **Former** Xbox TPM; **10+**
  years / **~$50M** / **12h → 30m** / **20+** containers only from the
  allowlist; “**extended and operates**,” not “I built OpenClaw.”
- **A bottom line.** One sentence that could be the whole post.

### Where agent drafts drift

The 2026-07-28 note above still holds: left to a short prompt, drafts trend
**too brief** and **too bullet-point-terse**. That already happened on this
series — first passes sat around 400–600 words (outline with sentence-case
bullets) and had to be expanded to ~800–1300 so the video pipeline had
narration to draw from.

Typical drift, in practice:

- **Outline-as-a-post** — H2s and bullets, no connective “picture this”
  or why the rule exists.
- **Corporate filler** — “unlock value,” “best-in-class,” “leverage the
  platform,” “executives will delight.” Dave will say “busy is not the
  same as on the critical path.” He will not say “synergy.”
- **Invented precision** — fake agent counts, dollar figures, latency,
  or board column names that are not in
  [`claim-safe-facts.md`](claim-safe-facts.md) or a source you can open.
- **Authorship inflation** — “I built / created” for stacks he extends
  and operates.
- **Wrong corpus** — matching the recovered 2011–2014 newsletter / GDC
  voice instead of the 2026 factory-floor posts.

### Voice do / don't

| Do | Don't |
|----|--------|
| Contractions, short sentences, first person | Formal “one must,” brochure tone, no-I corporate we |
| Explain it like a colleague — anecdote, then the rule | Ship a bullet outline and call it a post |
| Use a markdown table for a real comparison | Turn the whole post into a slide deck in Markdown |
| Numbers and titles only from [`claim-safe-facts.md`](claim-safe-facts.md) | Invent metrics, headcount, “N agents in production,” or board columns |
| “Extended and operates” / “integrated and operates” | “I built / authored” OpenClaw, Hermes, or firstmate |
| **Former** Xbox / Microsoft TPM (past tense) | Present-tense “Senior TPM at Xbox” |
| Azure, Docker, GitHub, evals, MCP as ops familiarity | Terraform / K8s as confidence / logo-soup claims |
| ~800–1300 words unless the piece honestly earns short | 400–600 words of terse bullets |

Need a list of *topics* rather than a draft? Follow
[`idea-playbook.md`](idea-playbook.md) — title + one-line angle, then stop.

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
