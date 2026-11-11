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
**Writing standard:** [Writing standard](#writing-standard-2026-11-10) below.  
**Propose ideas, don't draft:** [`idea-playbook.md`](idea-playbook.md).  
**Covers / mechanism images:** 3 variants in Engineering → Engineer+Roberto pick → wire winner ([`image-playbook.md`](image-playbook.md)).  
**Visual cadence (2026-09-14):** about every **3 paragraphs** of body prose, include an image, diagram, or table that earns the scroll — no long walls of text. Cover counts for the top; body still needs beats.
**Post Standard v1.1 (2026-09-14):** vault [Blog Post Standard](https://github.com/DaveVoyles/MainVault/blob/main/20-Areas/Personal/blog-post-standard-v1.md) (`ef4d637`). Delta vs v1 (`e442376`): series-tax order (thesis → stakes → primary visual/decision → *then* Part N nav); subtitle = concrete problem → business/engineering consequence; **visual grammar** in [`image-playbook.md`](image-playbook.md); artifact menu when earned (claim ledger · action-risk worksheet · receipt schema · permission checklist · agent SLO starter); optional post-type tags (Pattern · Build-log · Template · Brief). Pipeline locks in this guide still win. Pilot = next *new* unused post / P0-3 only (not retrofits / not #165).
  
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

### Writing standard (2026-11-10)

This is the one place the voice and shape rules live. It replaces four older
sections (the 2026-07-28 standard, "What already sounds like Dave", "Where
agent drafts drift" and "Voice do / don't"). Plan:
[`design/0008-blog-voice-and-visuals.md`](design/0008-blog-voice-and-visuals.md).

**Voice exemplars.** Read both before drafting:
`content/posts/advisory-pr-triage.md` and
`content/posts/per-checkout-isolation.md`. Dave approved them as the sound
he wants. Do not copy the 2011-2014 Wayback-recovered gaming posts; they are
a different era. Do not mine posts that are scheduled but not yet live.

#### How it should sound

- A smart colleague explaining what went wrong, in first person, with
  contractions, longer sentences, commas and dry humor. Not clipped, not a
  deck, not a whitepaper.
- Write for a smart 10-year-old. Name the thing in plain words, then use
  the jargon.
- Claim-safe: numbers and titles only from
  [`claim-safe-facts.md`](claim-safe-facts.md). **Former** Xbox TPM, and
  "extended and operates" for stacks Dave did not build. No invented
  metrics, agent counts or board columns.
- Public links only: no links from a post to private GitHub, and describe
  ADRs and repo files in prose.

#### Shapes to rotate

A post picks one shape. The same shape does not run three times in a row.

| Shape | Opens with | Good for |
|---|---|---|
| Build log | The moment something went wrong, in one scene | A single bug or outage with evidence |
| Field note | Something Dave saw or was asked, away from the terminal | Coaching, Xbox, conversations with developers |
| Opinion | The claim, stated flat, then the best argument against it | A stance on how teams adopt agents |
| How-to | What the reader will have at the end | A recipe someone can follow tonight |

The Post Standard checklist in the vault lists things a post should cover.
It is not an outline. Never use its items as headings.

#### Rules a script can count

- One incident and one rule, stated near the top and once more at the end
  in different words.
- At least one real artifact: a code snippet, a log line, a redacted
  screenshot or a measured number.
- Bold for the post's single rule and for a term at its first definition,
  at most one span per 120 words.
- No em dashes in prose.
- A summary of at most three lines, as a callout, and only when the post
  runs over 1,200 words.
- Terms defined inside the sentence that first needs them. A teaching post
  with five or more new terms may keep a glossary, placed after the story
  has started, and declares the exemption in its front matter.
- Titles a stranger would click: plain words, some curiosity, no jargon
  nouns.
- Tags from the existing vocabulary (`make list-tags`), and the
  "AI and Agents" topic on posts about agents.
- About 800-1300 words; a teaching post may go to 1800. Count the body
  after the closing `+++`. Do not pad.
- A visual about every 3 paragraphs: image, diagram or a table where two
  things really compare.

#### Moves to retire

"That was the annoying part." "So here is the rule I took away."
"Executives hear X, implementers hear Y." "You do not need my setup to
steal the shape." "Theater" and "folklore" more than once a post. The
"X is not Y. It is Z." flip more than twice a post. Headings copied from
the checklist. Outline-as-a-post, corporate filler ("unlock value",
"leverage the platform") and authorship inflation ("I built" for stacks Dave
extends and operates).

#### Before and after

Both lines come from the two exemplar posts. The before text is the
version before D1 (`git show 0152bf1^:content/posts/<slug>.md`).

| Before | After |
|---|---|
| "Under the hood, every shaped answer the classifier had already produced — the kind with a real type, a score, a choice — had been thrown away by a **confidence floor**, so the public surface collapsed to **unknown**. The bot was busy. The triage was empty." | "The first time my triage bot ran for real, it did everything except the triage. It left its comment. It set its label." |
| "...because executives read “the bot reviewed it” and implementers inherit folklore." | "People read 'the bot reviewed it' and trusted it." |
| Title: "Advisory PR triage that never owns the merge" | Title: "My triage bot was busy and said nothing" |
| Title: "Per-checkout isolation so parallel agents stop sharing one /tmp" | Title: "Two agents, one /tmp, and a receipt that lied" |

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
