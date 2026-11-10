# 0008 - Blog voice, visuals and a fun front door

Status: approved 2026-11-10 by Dave
Supersedes: none   Superseded by: none
Model roster (approved 2026-11-10): cheap=haiku, standard=sonnet, deep=sonnet at high effort; credits=ok; caps: builders<=3 concurrent, deep=orchestrator+critic only
Sources: audit of the nine newest posts on 2026-11-10 (five live, four scheduled); [`docs/authoring-guide.md`](../authoring-guide.md); [`docs/image-playbook.md`](../image-playbook.md); [`docs/post-pipeline.md`](../post-pipeline.md); [`DESIGN.md`](../../DESIGN.md); MainVault `20-Areas/Personal/blog-post-standard-v1.md` and `docs-blog-image-standard.md`; the `humanize` and `voice` skills in the Dvoyles-Skills repo; a cold read and a critic premortem of this draft on 2026-11-10.

## Executive Summary

Dave's blog has a strong subject and a well-made dark theme, yet a reader who opens two posts in a row can see the template, and the home page shows no pictures at all. The four posts scheduled for the next month already read much better than the two that went live in early November, so the work is to make that quality the rule. This plan rewrites the two weakest live posts as a worked example, replaces the fixed post outline with a story-first standard, adds an automatic check on every pull request that flags drafts which read machine-written, gives figures one dark house style that matches the site, and puts cover art and Dave's photo on the home page. The bot that drafts the posts gets one brief naming the skills to use, and because the check lives in the repository, the standard applies to any author.

## Visuals

- Plan page: the progress page with the slug `2026-11-10-blog-voice-visuals` on the fleet's private page server. Its link is given in chat and is left out here because this repository is public. The same page becomes the build tracker after approval.
- [Post pipeline diagram](../diagrams/post-pipeline.html), the current flow this plan changes.
- Audit screenshots of the live site sit in `.scratch/blog-review/` on the machine that ran the audit. They are not committed.

## Goals

- A reader who opens any two consecutive posts cannot spot a shared outline, a repeated opening line or a repeated closing line.
- New posts read as Dave telling a colleague what happened: one specific incident, real evidence, plain words, some humor.
- Every figure looks native to the dark site and is readable at phone width without tapping to enlarge.
- The home page shows pictures and a person, and tells a first-time visitor in one line what they will get.
- Grok Bot's drafts meet the standard on the first pull request, using skills Dave already owns.

## Success criteria

| Signal | How it is checked | Sample / not-yet-measurable branch |
|---|---|---|
| New posts score under 20 on the machine-tells checker (0 to 100, higher is more machine-like; the checker's own human samples score 0 to 13). | The voice check runs on every pull request that touches a post dated 2026-11-01 or later. | Wiring check, no sample needed. |
| The two pilot posts score 15 or lower. They are held to a tighter bar than the check because they become the example every later draft is compared with. | Checker output pasted in the pilot pull request. | Two posts. |
| Bold is rare: at most one bold span per 120 words of prose. | Same check. | Wiring check. |
| No shared skeleton across neighbouring posts (exact definitions under D5). | Same check, comparing each post with the three before it by date. | Wiring check. |
| The two rewritten pilot posts sound like Dave. | Dave reads old and new side by side on the local preview and says which is his voice. | One read per pilot post. If Dave prefers the old one, the pilot is redone before D4 starts. |
| Figure labels are at least 14 CSS pixels tall in the 800 pixel reading column and legible at 390 pixels wide. | Screenshot set at 390 and 1440 pixels on each figure pull request. | Wiring check. |
| The home page shows cover art and Dave's photo at both widths, with largest contentful paint at or under 2.0 seconds on a mid-range phone profile. | Screenshot set plus one performance trace on the home pull request. | Wiring check. |
| Grok Bot's first draft after the handoff passes the voice check without a human rewrite. | The first Grok Bot post pull request after D8 lands. | Sample of one post; "not yet measurable" until that pull request exists. |

## In Scope

- A rewrite of the two weakest live posts, `advisory-pr-triage` and `per-checkout-isolation`.
- A trim of the post scheduled for 2026-11-13 and a variety pass on the three scheduled after it.
- One story-first writing standard in the repo docs, with the instructions that currently disagree reconciled.
- A voice check that runs on pull requests.
- A dark figure kit and a cover rule, applied first to the two pilot posts.
- A home and post-page refresh: cover thumbnails, a rewritten hero with Dave's photo, a "Start here" row, a summary callout, inline definitions and corrected topic counts.
- One handoff brief to Grok Bot naming the skills and the new docs.

## Out of Scope

- Posts older than 2026-11-01, including the recovered 2011 to 2014 archive.
- Any change to a post's `date`, `draft` flag or URL slug.
- A light theme, or edits inside the PaperMod theme folder.
- The post-to-video pipeline.
- Who picks images and who merges posts. The three-variant pick in the Engineering chat room stays, and so do the unique-cover rule and the rule that a visual appears about every three paragraphs.
- Direct edits to the locked blog notes in MainVault. Their owner gets proposed wording through the handoff tool.

## Anti-goals

- A draft that passes the checker and still reads flat. The pilot posts are judged by Dave's read, and the score only catches the worst cases.
- A voice rewrite that changes a number, a name, a negation or a claim.
- A new fixed template replacing the old one. The standard offers shapes to rotate and moves to avoid, and prescribes no headings.
- A check that stops the daily publish. A scheduled post must go live even when the voice check would flag it.
- Decoration that slows reading: autoplay motion, heavy hero effects, or thumbnails that push the first post below the fold on a phone.
- Any claim that posts are "human-written" or "undetectable". What can be said is that the checks passed and Dave approved the voice.

## Problem Statement

### Names used in this plan

- **Grok Bot** is Dave's helper bot that drafts the posts and proposes the images. Its Blog persona writes; its Engineer persona opens the pull requests.
- **MainVault** is Dave's notes repository. Some notes there are locked, and only the Chief of Staff persona of Grok Bot may change them.
- **The handoff tool** is the fleet command other agents use to pass work to Grok Bot, wrapped by the `grok-handoff` skill.
- **Dvoyles-Skills** is the repository of reusable agent skills. `humanize`, `voice`, `archify` and the others named below live there.
- **The tells checker** is `tells.mjs` in the `humanize` skill. It reads a text and returns a 0 to 100 score from measurable habits such as em dashes, groups of three, sentence-length sameness and stock phrases.
- **The fact comparison** is `fact-diff.mjs` in the same skill. It lists every number, unit, date, name, URL, quotation, negation, heading and markup element that differs between two versions of a file.
- **The Post Standard** is the vault note that lists nine things a post should cover (In brief, Situation, Why it matters, Decision, System model, Implementation detail, Failure modes, Put it into practice, Next in the system).
- **`make check`** is the repo's content gate. The deploy workflow runs it before every build, including the daily scheduled build.

### What the audit found in the writing

The five live posts were read in full and the four scheduled ones in part, and all nine were measured.

| Post | Date | State | Tells score | Em dashes | Bold spans | Real artifact (code, log, number) |
|---|---|---|---|---|---|---|
| Tests that never ran now run | 2026-10-19 | live | 22 | 15 | 23 | numbers only |
| The match that came back as no | 2026-10-22 | live | 14 | 5 | 12 | code, a 50-run test |
| Prove the guard before it becomes the floor | 2026-10-25 | live | 17 | 12 | 15 | none |
| Per-checkout isolation | 2026-11-01 | live | 19 | 16 | 38 | none |
| Advisory PR triage | 2026-11-08 | live | 32 | 26 | 66 | none |
| The silence that never ended | 2026-11-13 | scheduled | 13 | 0 | 15 | numbers, manual quote |
| Old is not done | 2026-11-18 | scheduled | 15 | 0 | 12 | numbers |
| A private repo is not private work | 2026-11-23 | scheduled | 18 | 0 | 11 | numbers (17 rows against 12) |
| The CI that only checked what I touched | 2026-12-03 | scheduled | 15 | 0 | 6 | numbers |

Two live posts fail the checker's threshold (32 and 22). The two chosen for rewriting are the two newest, which sit at the top of the home page. `per-checkout-isolation` passes the threshold at 19 and is chosen anyway, because it has 38 bold spans and no incident, which the score does not weigh. Six habits make the weaker posts read as machine-written.

1. **The checklist became the outline.** The Post Standard says not to freeze its nine items as headings. `advisory-pr-triage` uses all nine as headings, word for word. Across the 2026 posts, "In brief" is a heading in 10, "Words I use" in 17, "Put it into practice" in 8 and "Bottom line" in 14.
2. **Signature lines repeat.** Two posts three days apart open on the same joke ("The build was green. That was the annoying part." and "The search found the line it was looking for. That was the annoying part."). "So here is the rule I took away" is in three posts. "Executives hear X. Implementers hear Y." is in four. "You do not need my setup to steal the shape" is in two.
3. **The rule is stated four or five times.** The intro states it, "In brief" restates it, the body argues it, "Put it into practice" lists it and "Bottom line" says it again. In `advisory-pr-triage` a reader passes two lists and twelve bullets before the story begins.
4. **Bold is used as a highlighter.** `advisory-pr-triage` has 66 bold spans in about 1,600 words, one every 25 words. The best post in the set has 12.
5. **The November posts have no incident.** The strong posts tell one failure with evidence: a bash snippet and a 50-run test, 17 recap rows against 12, one render in 25 hanging. The two November posts describe a category of failure in the abstract, with no code, no log line and no number, and lean on house metaphors ("theater", "folklore", "steal the shape").
6. **Insider vocabulary breaks the site's own plain-words rule.** "Typed answer", "shaped answer", "never floor-away a shape you already had" and "fail-open Phase 1 classifier" are not phrases a smart ten-year-old follows, and the glossary that defines them delays the story further.

The four scheduled posts have no em dashes, far less bold, real numbers and actual wit ("like a guest who has finished dinner and decided not to leave"). They still share one skeleton with each other.

Range is a seventh issue. Nine posts in a row tell the same story shape, a check that looked green and was not. The site promises AI, agents, cloud and games from a lacrosse coach who ran Xbox programs, and none of that personality reaches the page.

### What the audit found in the images

1. **Light figures on a dark site.** Most figures use a near-white canvas, because the image playbook and `AGENTS.md` rule 7 say to prefer lighter palettes. The site has been dark-only since the theme decision recorded in `DESIGN.md`, so each figure lands as a bright card. The dark cover on the 2026-12-03 post is the first figure that looks native.
2. **Labels too small to read.** Figures are exported about 2,200 pixels wide and shown in a column of about 800, a 2.75 times reduction. Sub-labels land near 9 pixels.
3. **Covers are diagrams with words,** so a cover and a body figure look the same, and three type styles appear across five posts. The best cover is the photoreal crumpled sticky note beside a padlock: one object, one idea, on palette.
4. **Cover shapes vary.** Nine covers come in four aspect ratios: 2200 by 1150, 1600 by 900, 900 by 900 and 2200 by 643.
5. **Some figures carry almost nothing.** The `per-checkout-isolation` cover is 2,200 pixels wide and holds twelve words in two tinted panels.
6. **No real evidence.** None of the nine posts shows a screenshot of an actual terminal, comment or dashboard.
7. **Cover art is invisible outside the post.** The home page and the archive list show titles only.

### What the audit found on the site

- The home page is all text: a name, a career paragraph and a list of titles. Dave's photo appears in the sidebar on inner pages, and the home page has no sidebar.
- The hero paragraph is a résumé. It does not say what a reader gets from the blog.
- Topic chips show Gaming 62 and Tech 61 first and "AI and Agents" last with 6, because recent agent posts are filed under Tech alone. A visitor would take this for a gaming blog.
- Titles on the two weakest posts are written for insiders ("Advisory PR triage that never owns the merge"). The titles that work are plain and curious ("The match that came back as no").
- Phone layout is unverified. The capture tool used in the audit laid the page out at 500 pixels, so its phone screenshot proves nothing, and D7 measures the real thing.

### Why the instructions produce this

Grok Bot is doing what its instructions say. Four documents describe one job and disagree. The pipeline doc asks for four or five image options in a Desktop folder, and the image playbook asks for three briefs in the Engineering room. The image playbook prefers light palettes, and the design system is dark-only. The Post Standard says not to freeze its checklist, and no check looks at whether a draft did. `make check` has no voice step at all.

## Locked Decisions

1. Voice quality is checked in the repo on every pull request, so the result does not depend on which author ran which skill. (source: audit 2026-11-10; `make check` has no voice step)
2. The voice check never runs in the build that publishes. The deploy workflow runs `make check` before the daily scheduled build, so a voice failure there would stop a scheduled post from going live. (source: critic 2026-11-10; `.github/workflows/hugo.yml` lines 11 and 55)
3. The two weakest live posts are rewritten first, and Dave approves the voice before the standard is written down. (source: audit 2026-11-10)
4. A rewrite keeps every fact. The fact comparison is run on old against new, and the author accounts for every difference it reports. (source: `humanize` skill rules)
5. Dates, draft flags and slugs do not change. Titles may change, because the URL comes from the file name. (source: `AGENTS.md` hard rules 6 and 7)
6. The home page stays a capped dashboard. (source: ADR 0010)
7. Locked vault notes are changed by their owner through the handoff tool. (source: MainVault note header `write_scope: cos`)

## Decision Trail

| Node | Question or finding | Answer | Reshaped |
|---|---|---|---|
| F1 | Do the posts measure as machine-written? | Two of five live posts fail the threshold of 20 (32 and 22). The four scheduled posts pass (13 to 18). | Q1 |
| F2 | Is the outline the cause? | All nine checklist items are verbatim headings in `content/posts/advisory-pr-triage.md`. | Q2 |
| F3 | Does the `humanize` skill fix a post alone? | No. In Markdown it rewrites only paragraphs without bold, links or inline code, about 44 percent of a blog post's words by its own measurement. | Q1, Q3 |
| F4 | Can the fact comparison "pass" on a rewrite? | No. It reports any heading, bold or title change as a difference, so a rewrite that fixes headings and bold always exits non-zero. | Q3 |
| F5 | Where would a failing check bite? | `make check` runs before the daily publish build, so a check added there can block a scheduled post. | Q1 |
| F6 | Can home thumbnails use today's covers? | Only with a crop rule. Covers come in four aspect ratios, from square to 3.4 to 1. | Q5 |
| Q1 | Where is the standard enforced? | A separate `make check-voice` target, run by a pull-request-only workflow job. | D5 |
| Q2 | What replaces the outline? | Shapes to rotate, plus a short list of retired moves and budgets a script can count. | D4 |
| Q3 | How is a rewrite shown to be safe? | The author attaches the fact comparison report and accounts for each line: intended heading, bold and title changes are listed, and nothing else may differ. | D1, D2, D3 |
| Q4 | Light or dark figures? | Dark, on the site's own tokens. Listed under Unconfirmed defaults because it reverses a lock. | D6 |
| Q5 | How do thumbnails cope with mixed cover shapes? | A 16 by 9 centre crop generated at 480 pixels wide, a per-post override image, and a plain token-coloured tile when a post has no cover. | D7 |

## Unconfirmed defaults

Each of these was my call. Dave approved the plan on 2026-11-10 without striking any, so all six stand.

1. **Dark figures replace "prefer lighter".** This reverses the lock Dave set on 2026-09-14, before the site went dark-only, and changes `AGENTS.md` rule 7 and the image playbook.
2. **"In brief" and "Words I use" stop being required sections.** The summary becomes a callout of at most three lines, and terms are defined in the sentence that first uses them. This changes the Post Standard checklist and the glossary line in the authoring guide.
3. **The two live posts are edited in place.** They are public, so this is a public-facing change. Reverting the commit restores the old text.
4. **The check covers posts dated 2026-11-01 or later.** Earlier posts are exempt, so the archive never turns a pull request red.
5. **A topic-mix rule.** No more than two posts in a row on the same theme, and at least one post in four draws on coaching, Xbox program work, games or a side project.
6. **Covers become one object with no words, at 16 by 9.** Diagrams move to the body.

## The new writing standard (what D4 writes down)

**Shapes to rotate.** A post picks one, and the same shape does not run three times in a row.

| Shape | Opens with | Good for |
|---|---|---|
| Build log | The moment something went wrong, in one scene | A single bug or outage with evidence |
| Field note | Something Dave saw or was asked, away from the terminal | Coaching, Xbox, conversations with developers |
| Opinion | The claim, stated flat, then the best argument against it | A stance on how teams adopt agents |
| How-to | What the reader will have at the end | A recipe someone can follow tonight |

**Rules a script can count.**

- One incident and one rule, stated near the top and once more at the end in different words.
- At least one real artifact: a code snippet, a log line, a redacted screenshot or a measured number.
- Bold for the post's single rule and for a term at its first definition, at most one span per 120 words.
- No em dashes in prose.
- A summary of at most three lines, as a callout, and only when the post runs over 1,200 words.
- Terms defined inside the sentence that first needs them. A teaching post with five or more new terms may keep a glossary, placed after the story has started, and declares the exemption in its front matter.
- Titles a stranger would click: plain words, some curiosity, no jargon nouns.
- Tags from the existing vocabulary, and the "AI and Agents" topic on posts about agents.

**Moves to retire.** "That was the annoying part." "So here is the rule I took away." "Executives hear X, implementers hear Y." "You do not need my setup to steal the shape." "Theater" and "folklore" more than once a post. The "X is not Y. It is Z." flip more than twice a post. Headings copied from the checklist.

**Before and after, as illustration.** These use only facts already in the posts. The real rewrite still goes through the fact comparison.

| Before | After |
|---|---|
| "Under the hood, every shaped answer the classifier had already produced — the kind with a real type, a score, a choice — had been thrown away by a **confidence floor**, so the public surface collapsed to **unknown**. The bot was busy. The triage was empty." | "The first time my triage bot ran for real, it did everything except the triage. It left its comment, added its label and reported 'unknown.' The bot had picked an answer. A confidence cutoff borrowed from a different classifier threw that answer away before anyone could see it." |
| "Steal the rule: advisory signals, typed contracts, fail-open early, never floor-away a shape you already had." | "The short version: let the bot give advice, never let that advice merge anything, and when the bot is unsure, show its guess with a low-confidence tag instead of hiding it." |
| "Executives hear 'multi-agent' and picture throughput. Implementers hear 'multi-agent' and picture two shells fighting over the same scratch file." | "On a slide, multi-agent means more work at once. On my machine it meant two agents overwriting the same temp file." |
| Title: "Advisory PR triage that never owns the merge" | Title: "My triage bot was busy and said nothing" |
| Title: "Per-checkout isolation so parallel agents stop sharing one /tmp" | Title: "Two agents, one /tmp, and a receipt that lied" |

## Skills to point Grok Bot at (what D8 delivers)

| Skill | Job in the post pipeline | When |
|---|---|---|
| `humanize` | The rewrite loop: score the draft, rewrite, compare facts, send to a blind judge from a different model, repeat up to three rounds. | Every draft, before the pull request. |
| `voice` (its reference lists) | The catalogue of machine tells and the anti-slop copy rules the rewrite follows. Its length rules are for report pages and do not apply to posts. | While drafting. |
| `critic` | A cold read of the draft: what is this post claiming, and where did you get bored? | Every draft. |
| `archify` | Static labelled diagrams, exported on the dark figure kit. | Mechanism figures. |
| `architecture-motion` | A short looping animated diagram for the one figure where the order of events matters, with a still fallback. | At most one per post. |
| `excalidraw-diagram` | A hand-drawn whiteboard sketch. The vault's voice note asks for "a smart friend at a whiteboard", and a sketch supplies warmth the vector diagrams lack. | Optional second figure. |
| `ui-proof` | Screenshots at 390 and 1440 pixels, so figure legibility is checked on the real page. | Every post pull request with new figures. |
| `impeccable` | Design critique of the home and post page. | D7 only. |
| `grok-handoff` | How this plan reaches Grok Bot. Other agents coordinate with Grok Bot through the handoff tool and never through Dave. | D4's vault wording and D8. |

`humanize` rewrites only plain paragraphs in Markdown, so paragraphs with bold, links or inline code come back marked for author review. The bold budget removes most of that at the source.

Whether Grok Bot's machine can run these skills is unconfirmed, and D8 checks it first. If it cannot, the brief tells the Blog persona to write to the standard and read the check's failure messages, and the Engineer persona, which already opens the pull requests from a Mac, runs `humanize` there.

## Web / visual brief

- Reference sites:
  - **jvns.ca (Julia Evans).** Take the hand-drawn figures and the habit of opening with the question she actually had. Debugging stories told plainly, with real output.
  - **joshwcomeau.com (Josh Comeau).** Take the sense of play: a home page with personality, small interactive touches that explain, and summary callouts that read as part of the design.
  - **maggieappleton.com (Maggie Appleton).** Take the illustrated cover on every essay and an index a visitor can browse by picture.
  - **stratechery.com.** Already the structural reference for voice: a one-line dek under the title and headings that outline the argument.
- Motion brief: cover thumbnails fade in and rise 8 pixels on first view, 200 ms on the existing ease-out token. List rows keep the current left-rule hover. Nothing new autoplays. Reduced motion shows final states with no transition.
- Shader / WebGL brief: nothing added. D7 verifies the existing hero effect still degrades to a still frame.
- Budget: 60 fps scroll on a mid-range Android phone profile; largest contentful paint at or under 2.0 s on the home page; at most 5 kB of new JavaScript; thumbnails generated as WebP at 480 by 270, at most 40 kB each, lazy-loaded below the fold; no new web font.
- Review: screenshot set at 390 and 1440 pixels plus a performance trace, read before each card closes.
- Route: `site` (build), `impeccable` (design audit), `ui-proof` (evidence). Colours come from the site's tokens only, per `DESIGN.md`.

## Deliverables

| ID | Deliverable | Size | Acceptance criteria | Dependencies | Status |
|---|---|---|---|---|---|
| D1 | Rewrite the two weakest live posts as the exemplar | M | `content/posts/advisory-pr-triage.md` and `content/posts/per-checkout-isolation.md` each: open on one specific incident; score 15 or lower on `tells.mjs`; at most one bold span per 120 words; no heading taken from the nine checklist items; no em dashes in prose; `date`, `draft` and file name unchanged. The pull request attaches the `fact-diff.mjs` report for old against new and accounts for every line: heading, bold and title differences are listed as intended, and there are zero differences in numbers, units, dates, names, URLs and quotations, with each negation or modal difference explained. Where a post has no real artifact, the pull request lists what Dave would need to supply and invents nothing. A blind judge on a different model quotes no remaining machine-sounding span. The pull request merges only after Dave's side-by-side read on the local preview. | none | not started |
| D2 | Trim the 2026-11-13 post | XS | `content/posts/the-silence-that-never-ended.md`: cuts and small rewordings only, with no new figures and no restructuring. "In brief" is cut if the intro already says the same thing, and the opening and closing lines differ from the three posts before it. Fact comparison report attached as in D1. Hard stop: if the pull request is not merged by the end of 2026-11-12, the card closes as "not done, shipped as written" and the post is left alone. | none | not started |
| D3 | Variety pass on the three later scheduled posts | S | The 2026-11-18, 11-23 and 12-03 posts each use a different opening and closing from their three predecessors and share at most three second-level headings with any of them. Fact comparison report attached as in D1. `date` and `draft` unchanged. | none | not started |
| D4 | Story-first writing standard, in one place | M | `docs/authoring-guide.md` carries the standard above and replaces its four older voice sections ("Writing standard (2026-07-28)", "What already sounds like Dave", "Where agent drafts drift", "Voice do / don't") and the glossary sentence in its visual-cadence line. `AGENTS.md` rule 7 drops "prefer lighter palettes" and keeps the cadence, unique-cover and three-variant-pick rules. `docs/post-pipeline.md` matches the image playbook on three briefs reviewed in the Engineering room. `docs/idea-playbook.md` carries the topic-mix rule. Draft pull request 153 is folded in or closed with a note. Proposed wording for the two locked vault notes (the Post Standard checklist and the image standard's palette line) is sent to the Chief of Staff persona through the handoff tool, and the receipt is linked. | D1 merged with Dave's voice approval | not started |
| D5 | Voice check on pull requests, in warning mode | M | `scripts/check-voice.sh` behind a new `make check-voice` target, and a pull-request-only job in the workflow that sets up Node and runs it. `make check` and the push and scheduled builds do not call it. `tools/voice/` holds pinned copies of `tells.mjs` and `segments.mjs`, written by `scripts/sync-voice-tools.sh`, which also reports drift from the skills repo. For posts dated 2026-11-01 or later, with fenced code, inline code and block quotes removed first, the script reports: a score of 20 or more; bold over budget; an em dash; a phrase from `tools/voice/retired-phrases.txt`; four or more second-level headings matching the nine checklist items exactly; a first sentence or a final second-level heading identical to one in the three posts before it by `date`; more than three second-level headings shared with any of those three. Only the newer post is reported. A post may list rule names under `voice_exempt` in its front matter with a reason. Tests in `scripts/tests/test-check-voice.sh` hold one planted failing fixture per rule and one passing fixture, and `make test` runs them. In this card the job reports and exits zero. | none | not started |
| D6 | Dark figure kit and cover rule | M | One HTML and SVG figure template on the site's `--ds-*` colour tokens (dark canvas, mint ink, the six role colours each with a label), one type family, designed at 800 CSS pixels and exported at twice that, smallest label 14 CSS pixels. `docs/image-playbook.md` is rewritten to it and gains the cover rule (one object, no words, 16 by 9, plus a 1200 by 630 social crop) and the rule of one real artifact per post. Figures and covers for the two D1 posts are re-made in the kit through the existing three-variant pick. `ui-proof` screenshots at 390 and 1440 pixels show every label legible, judged by the reviewer on the pull request. The existing image-size rule in `make check` still passes. | D1 (same post files) | not started |
| D7 | Home and post-page refresh | L | `layouts/index.html` shows a thumbnail on the featured post and each recent row: a 16 by 9 centre crop generated as WebP at 480 by 270, an optional per-post override image in front matter, and a token-coloured tile when a post has no cover. Override thumbnails are supplied for the home-visible posts whose covers crop badly (today the square and the 3.4 to 1 covers). The hero is rewritten to one line on what the reader gets, plus the existing avatar from `hugo.toml`, with proposed copy in the pull request for Dave to edit. A three-post "Start here" row is set in `hugo.toml`, proposed as "How I run an agent production system", "The match that came back as no" and "What I will not automate". The caps from ADR 0010 are unchanged. `layouts/shortcodes/` gains a summary callout and an inline definition, both used by the D1 posts. Agent posts from 2026-07 onward carry the "AI and Agents" topic. `scripts/check-ds-tokens.sh` passes. The pull request has a `## Proof` section with screenshots at 390 and 1440 pixels and a performance trace inside the budget, and the reduced-motion path is verified. | D6 (cover shape) | not started |
| D8 | Make the check blocking and brief Grok Bot | S | First, confirm whether Grok Bot's machine can run the Dvoyles-Skills scripts and record the answer in `history.md`. The pull-request job from D5 then exits non-zero on a finding. One brief goes through the handoff tool: the skills table above, links to the new authoring guide and image playbook, the fallback if the skills cannot run there, and a note that the check runs on pull requests. The receipt is linked in `history.md`. The card closes on those three things; the first Grok Bot pull request is tracked afterwards as the last success signal. | D3, D4, D5, D6 | not started |

## Testing Decisions

- D1 to D3: `tells.mjs <post>` and `fact-diff.mjs <old> <new>` from the `humanize` skill, with the report read line by line; `make check`; `make build`.
- D5: `scripts/check-voice.sh` with `scripts/tests/test-check-voice.sh`. Each rule gets a planted failing fixture, following this repo's own lesson that a gate needs proof it can fail. One test asserts that `make check` does not invoke the voice script.
- D6: `ui-proof` screenshot set per figure; the image-size check in `scripts/check-content.sh`.
- D7: `scripts/check-ds-tokens.sh`, `make check`, `make build`, `ui-proof` at both widths, one performance trace.
- D4 and D8: `make check` for internal links.

## Irreversible Steps

None. Every change is a commit that `git revert` undoes. Two changes are public-facing and reversible, and need Dave's yes in the plan reply: editing the two live posts (D1) and changing the home page (D7). Feed readers and search caches may hold the old text for a while after a revert.

## Parallel execution

| Lane | Cards, in order | Files owned |
|---|---|---|
| A, content | D2 first, then D1, then D3 | The six post files under `content/posts/` |
| B, check | D5 | `scripts/check-voice.sh`, `scripts/sync-voice-tools.sh`, `scripts/tests/test-check-voice.sh`, `tools/voice/`, `Makefile`, `.github/workflows/` |
| C, standard | D4 after D1 | `docs/authoring-guide.md`, `docs/post-pipeline.md`, `docs/idea-playbook.md`, `AGENTS.md` |
| D, figures | D6 after D1 | `docs/image-playbook.md`, `static/images/posts/`, image references in the two D1 posts |
| E, site | D7 after D6 | `layouts/`, `assets/css/extended/`, `hugo.toml`, topic lines in older posts' front matter |
| last | D8 | the workflow job's exit behaviour, `history.md` |

D2 starts the moment the plan is approved, because its post publishes on 2026-11-13. Lanes A and B start together. At most three builders run at once, with a critic on D1 and on D7. `Makefile` and the workflow file belong to lane B alone, and D8 touches the workflow only after D5 has merged. D4 and everything behind it waits on Dave's read of D1, so that read is the plan's one human bottleneck.

## Execution Tracking

- Cards: [open issues labelled `plan:0008`](https://github.com/DaveVoyles/DaveVoylesdotCom/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0008), issues 206 (D1) to 213 (D8), exported 2026-11-10.
- Blockers are registered natively: 209 waits on 206; 211 waits on 206; 212 waits on 211; 213 waits on 208, 209, 210 and 211.
- Board: none. This repo has no `.harness/board.json`, so the export ran without a project board and the label is the tracker.
- One orchestrator drives the plan. A second one would race it for the same cards.
